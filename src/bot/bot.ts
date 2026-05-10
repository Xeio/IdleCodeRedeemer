import { Client, Collection, Events, GatewayIntentBits, MessageFlags } from 'discord.js';
import { db } from './database/db';
import { scanMessageForCodes } from './handlers/codeScanner';
import { backfillChannelHistory } from './handlers/backfillHandler';
import { codeManager } from './database/codeManager';
import { userManager } from './database/userManager';
import { backfillManager } from './database/backfillManager';
import IdleChampionsApi from './api/idleChampionsApi';
import { initDebugLogger } from './utils/debugLogger';
import logger from './utils/logger';
import { apiRequestLogger } from './utils/apiRequestLogger';
import * as backfillCommand from './commands/backfill';
import * as blacksmithCommand from './commands/blacksmith';
import * as codesCommand from './commands/codes';
import * as helpCommand from './commands/help';
import * as inventoryCommand from './commands/inventory';
import * as makepublicCommand from './commands/makepublic';
import * as openCommand from './commands/open';
import * as redeemCommand from './commands/redeem';
import * as setupCommand from './commands/setup';

// CRITICAL: Disable certificate validation for Idle Champions API
// Their server has an expired certificate - this must be set BEFORE any HTTPS requests
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.DISCORD_GUILD_ID;
const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;

if (!TOKEN) {
  logger.error('DISCORD_TOKEN environment variable is not set');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
});

// Initialize command collection
(client as any).commands = new Collection();

// Load commands statically (required for bundled production builds)
const commands = [
  backfillCommand,
  blacksmithCommand,
  codesCommand,
  helpCommand,
  inventoryCommand,
  makepublicCommand,
  openCommand,
  redeemCommand,
  setupCommand,
];

for (const command of commands) {
  (client as any).commands.set(command.data.name, command);
  logger.debug(`Loaded command: ${command.data.name}`);
}

// Event: Ready
client.on(Events.ClientReady, async () => {
  logger.info(`Logged in as ${client.user?.tag}`);

  // Initialize debug logging
  initDebugLogger();

  // Initialize API request logging
  apiRequestLogger.initialize();

  try {
    // Initialize database
    logger.info('Initializing database...');
    await db.initialize();
    logger.info('Database initialized');

    // Check if startup backfill should run
    const shouldBackfill = await backfillManager.shouldRunStartupBackfill();
    if (shouldBackfill && CHANNEL_ID) {
      logger.info('Running startup backfill...');
      try {
        const channel = await client.channels.fetch(CHANNEL_ID);
        if (channel) {
          const operationId = await backfillManager.startBackfill(client.user?.id || 'system');

          const stats = await backfillChannelHistory(channel, (message) => {
            logger.info(`[STARTUP BACKFILL] ${message}`);
          });

          await backfillManager.updateBackfill(
            operationId,
            stats.codesFound,
            stats.codesRedeemed,
            stats.errors.length === 0 ? 'completed' : 'failed'
          );

          logger.info(
            `Startup backfill completed: found=${stats.codesFound}, redeemed=${stats.codesRedeemed}`
          );
        } else {
          logger.warn('Startup backfill: Could not fetch channel');
        }
      } catch (backfillError) {
        logger.error('Error during startup backfill:', backfillError);
      }
    } else if (!shouldBackfill) {
      const lastBackfill = await backfillManager.getLastBackfill();
      logger.info(
        `Skipping startup backfill - last run was less than 6 hours ago at ${lastBackfill?.completed_at}`
      );
    } else {
      logger.info('Skipping startup backfill - DISCORD_CHANNEL_ID not configured');
    }

    // Register slash commands
    logger.debug(`GUILD_ID from env: ${GUILD_ID}`);
    if (GUILD_ID) {
      logger.debug(`Fetching guild ${GUILD_ID}...`);
      const guild = await client.guilds.fetch(GUILD_ID);
      const commands = (client as any).commands.map((cmd: any) => cmd.data);
      logger.debug(`Setting ${commands.length} commands in guild...`);
      await guild.commands.set(commands);
      logger.info(`Registered ${commands.length} commands in guild ${GUILD_ID}`);
    } else {
      logger.debug('Setting global commands...');
      const commands = (client as any).commands.map((cmd: any) => cmd.data);
      await client.application?.commands.set(commands);
      logger.info(`Registered ${commands.length} global commands`);
    }
  } catch (error) {
    logger.error('Error on ready:', error);
  }
});

// Event: Interaction (slash commands)
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = (client as any).commands.get(interaction.commandName);
  if (!command) return;

  try {
    const options = interaction.options.data
      .map((opt: any) => `${opt.name}=${opt.value}`)
      .join(' ');
    const cmdMsg = `[COMMAND] ${interaction.commandName} ${options || '(no args)'} from ${interaction.user.tag}`;

    logger.info(cmdMsg);

    const startTime = Date.now();
    await command.execute(interaction);
    const duration = Date.now() - startTime;

    const resultMsg = `[COMMAND] ${interaction.commandName} completed successfully in ${duration}ms`;
    logger.info(resultMsg);
  } catch (error) {
    const errorMsg = `[COMMAND] Error executing command ${interaction.commandName} from ${interaction.user.tag}`;
    logger.error(errorMsg, error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: '❌ There was an error while executing this command!',
        flags: MessageFlags.Ephemeral,
      });
    } else {
      await interaction.reply({
        content: '❌ There was an error while executing this command!',
        flags: MessageFlags.Ephemeral,
      });
    }
  }
});

// Event: Message (code scanning)
client.on(Events.MessageCreate, async (message) => {
  // Only scan in the specified channel if configured
  if (CHANNEL_ID && message.channelId !== CHANNEL_ID) {
    return;
  }

  try {
    const foundCodes = await scanMessageForCodes(message);

    if (foundCodes.length > 0) {
      logger.info(`Found ${foundCodes.length} codes in message from ${message.author.tag}`);

      for (const code of foundCodes) {
        // Try to redeem automatically if user is known
        const author = message.author;
        const hasCredentials = await userManager.hasCredentials(author.id);

        if (hasCredentials) {
          try {
            const credentials = await userManager.getCredentials(author.id);
            if (credentials) {
              let server = credentials.server;
              if (!server) {
                server = await IdleChampionsApi.getServer();
                if (!server) {
                  logger.error('Could not determine game server');
                  return;
                }
                await userManager.updateServer(author.id, server);
              }

              const response = await IdleChampionsApi.submitCode({
                server,
                code,
                user_id: credentials.userId,
                hash: credentials.userHash,
                instanceId: credentials.instanceId || '',
              });

              // Type guard: check if response has codeStatus (CodeSubmitResponse)
              if (response instanceof Object && 'codeStatus' in response) {
                const codeResponse = response as any;
                await codeManager.addRedeemedCode(
                  code,
                  author.id,
                  codeResponse.codeStatus.toString(),
                  codeResponse.lootDetail
                );

                logger.info(`Auto-redeemed code ${code} for ${author.tag}`);

                // Send DM notification
                if (codeResponse.codeStatus === 0) {
                  // Success
                  await author.send(`✅ Code \`${code}\` redeemed successfully!`).catch(() => {});
                }
              }
            }
          } catch (error) {
            logger.error(`Error auto-redeeming code ${code}:`, error);
            await codeManager.addPendingCode(code);
          }
        } else {
          // Store as pending code
          await codeManager.addPendingCode(code);
          logger.debug(`Stored pending code: ${code}`);
        }
      }
    }
  } catch (error) {
    logger.error('Error processing message:', error);
  }
});

// Login
client.login(TOKEN);

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down...');
  apiRequestLogger.shutdown();
  await db.close();
  client.destroy();
  process.exit(0);
});

export default client;

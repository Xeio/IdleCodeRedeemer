# Project Structure

This Discord bot was converted from the Idle Champions Code Redeemer browser extension. All browser extension code has been removed; only the Discord bot remains.

## Repository Composition [OSPS-QA-04.01]

This project consists of a **single monolithic repository** containing all source code:

| Component   | Repository      | Status | Purpose                                                              |
| ----------- | --------------- | ------ | -------------------------------------------------------------------- |
| Discord Bot | This repository | Active | Main bot codebase - handles commands, API interactions, and database |

**No subprojects or submodules exist.** All functionality is contained within this single repository and compiled into a single Docker container image for deployment.

## Directory Layout

```
idle-code-redeemer/
├── README.md              ← Start here
├── docs/                  ← All documentation
├── BUILD.md               ← Build instructions
├── LICENSE
├── .env.example           ← Configuration template
├── .gitignore
├── drizzle.config.ts      ← Drizzle ORM / drizzle-kit configuration
│
├── src/
│   ├── bot/               ← Discord bot (ACTIVE)
│   │   ├── bot.ts         ← Main Discord client & event handlers
│   │   ├── api/           ← Game server API client
│   │   ├── commands/      ← Slash command handlers (9 commands)
│   │   ├── database/      ← Database managers & Drizzle schema
│   │   │   ├── db.ts      ← Drizzle connection & migrate()
│   │   │   ├── userManager.ts
│   │   │   ├── codeManager.ts
│   │   │   ├── auditManager.ts
│   │   │   ├── backfillManager.ts
│   │   │   ├── schema/    ← Drizzle table definitions (one file per table)
│   │   │   └── migrations/ ← Auto-generated SQL migration files
│   │   ├── handlers/      ← Message scanning for codes
│   │   └── utils/         ← Utilities (debug logging)
│   │
│   └── lib/               ← Type definitions (from game API)
│       ├── player_data.d.ts
│       ├── redeem_code_response.d.ts
│       ├── blacksmith_response.d.ts
│       ├── server_definitions.d.ts
│       └── chrome.d.ts    ← Not used (kept for reference)
│
├── data/                  ← SQLite database (git-ignored)
│   └── idle.db
│
├── debug/                 ← API response logs (auto-cleanup) (git-ignored)
│   └── *.json
│
├── scripts/               ← Utility scripts
│   └── get-credentials.js
│
├── node_modules/          ← Dependencies (git-ignored)
├── package.json           ← Bun dependencies & scripts
├── tsconfig.bot.json      ← TypeScript config (noEmit: true, type-check only)
│
├── .mise.toml             ← Mise task definitions & tool versions
├── Dockerfile             ← Multi-stage Docker build
├── docker-compose.yml     ← Multi-container orchestration
└── .dockerignore
```

## Key Files

### Core Bot

- **[src/bot/bot.ts](../src/bot/bot.ts)** - Discord client initialization, event handlers, command routing
- **[src/bot/api/idleChampionsApi.ts](../src/bot/api/idleChampionsApi.ts)** - Game server API client with query-parameter format

### Commands (10 slash commands)

- **[src/bot/commands/setup.ts](../src/bot/commands/setup.ts)** - `/setup user_id:<id> user_hash:<hash>`
- **[src/bot/commands/redeem.ts](../src/bot/commands/redeem.ts)** - `/redeem code:<code>`
- **[src/bot/commands/catchup.ts](../src/bot/commands/catchup.ts)** - `/catchup` (redeem all known codes the user hasn't claimed)
- **[src/bot/commands/inventory.ts](../src/bot/commands/inventory.ts)** - `/inventory` (gold, rubies, equipment, progress)
- **[src/bot/commands/open.ts](../src/bot/commands/open.ts)** - `/open chest_type:<type> count:<count>`
- **[src/bot/commands/blacksmith.ts](../src/bot/commands/blacksmith.ts)** - `/blacksmith contract_type:<type> hero_id:<id> count:<count>`
- **[src/bot/commands/codes.ts](../src/bot/commands/codes.ts)** - `/codes [count:<count>]` (view redeemed codes history)
- **[src/bot/commands/makepublic.ts](../src/bot/commands/makepublic.ts)** - `/makepublic code:<code>` (share codes with other users)
- **[src/bot/commands/backfill.ts](../src/bot/commands/backfill.ts)** - `/backfill [channel:<channel>]` (recover missed codes)
- **[src/bot/commands/help.ts](../src/bot/commands/help.ts)** - `/help`

### Database

- **[src/bot/database/db.ts](../src/bot/database/db.ts)** - Drizzle ORM connection, `initializeDatabase()`, and `migrate()` on startup
- **[src/bot/database/userManager.ts](../src/bot/database/userManager.ts)** - User credential storage
- **[src/bot/database/codeManager.ts](../src/bot/database/codeManager.ts)** - Code tracking & history
- **[src/bot/database/auditManager.ts](../src/bot/database/auditManager.ts)** - Audit log operations
- **[src/bot/database/backfillManager.ts](../src/bot/database/backfillManager.ts)** - Backfill operations & global lock
- **[src/bot/database/schema/](../src/bot/database/schema/)** - Drizzle table definitions (one TypeScript file per table)
- **[src/bot/database/migrations/](../src/bot/database/migrations/)** - Auto-generated SQL migrations (committed to source)

### Auto Features

- **[src/bot/handlers/codeScanner.ts](../src/bot/handlers/codeScanner.ts)** - Message scanning for codes (regex pattern)
- **[src/bot/utils/logger.ts](../src/bot/utils/logger.ts)** - Winston structured logger (file + console)
- **[src/bot/utils/apiRequestLogger.ts](../src/bot/utils/apiRequestLogger.ts)** - API response logging
- **[src/bot/utils/debugLogger.ts](../src/bot/utils/debugLogger.ts)** - Debug utilities

### Tests

- **[src/bot/handlers/codeScanner.test.ts](../src/bot/handlers/codeScanner.test.ts)** - Unit tests for code detection regex
- **[src/bot/database/codeManager.test.ts](../src/bot/database/codeManager.test.ts)** - Unit tests for all CodeManager methods
- **[src/bot/database/userManager.test.ts](../src/bot/database/userManager.test.ts)** - Unit tests for all UserManager CRUD operations
- **[src/test/setup.ts](../src/test/setup.ts)** - Bun test preload: sets `DB_PATH=:memory:` before imports

### Configuration

- **[.env.example](../.env.example)** - Template for environment variables
- **[.mise.toml](../.mise.toml)** - Task definitions and tool versions (Bun 1.3.13, Gitleaks)
- **[bunfig.toml](../bunfig.toml)** - Bun configuration (test preload, registered via `[test].preload`)
- **[package.json](../package.json)** - Bun scripts & dependencies
- **[tsconfig.bot.json](../tsconfig.bot.json)** - TypeScript compiler options (`noEmit: true` — type-check only)
- **[drizzle.config.ts](../drizzle.config.ts)** - Drizzle Kit configuration (schema path, migrations output)

## Dependencies

**Production**

- `discord.js` - Discord bot framework
- `drizzle-orm` - Type-safe ORM for SQLite
- `winston` - Logging framework

> **Note:** `dotenv`, `node-fetch`, and `sqlite3` were removed. Bun loads `.env` natively, provides a built-in Fetch API, and includes `bun:sqlite` as a first-party module.

**Development**

- `typescript` - Type checking (type-check only; `noEmit: true`)
- `@types/bun` - Bun type definitions
- `drizzle-kit` - Schema management & migration generation
- `eslint` - Code linting
- `prettier` - Code formatting
- `husky` - Git hooks
- `commitlint` - Commit message validation
- `lint-staged` - Pre-commit linting

**Runtime (managed by Mise)**

- `bun` 1.3.13 - JavaScript runtime, package manager, and bundler

## Removed (Cleanup)

The following browser extension code has been permanently removed:

- `src/chestManagement/` - Extension chest management UI
- `src/inject/` - Extension content script
- `src/options/` - Extension options page
- `src/service_worker/` - Extension background service worker
- `src/shared/` - Shared extension code
- `extension/` - Extension manifest, assets, distribution files

Reason: Converted to Discord bot; extension code no longer needed.

## Build & Deployment

**For local development:**

```bash
bun install
mise run dev
```

**For production binary:**

```bash
bun install
mise run prod:build
./dist-bundle/bot
```

**For Docker deployment:**

```bash
docker-compose up
```

**For production:**

- `mise run prod:build` compiles a self-contained binary (`dist-bundle/bot`) with Bun runtime embedded
- No Bun, Node.js, or `node_modules` required at runtime
- Docker image only needs the binary + `ca-certificates`
- Configure `DISCORD_TOKEN` from Discord Developer Portal
- Set `DISCORD_GUILD_ID` and `DISCORD_CHANNEL_ID`
- Runs 24/7 in the cloud

See [README.md](../README.md) and [docs/development.md](development.md) for details.

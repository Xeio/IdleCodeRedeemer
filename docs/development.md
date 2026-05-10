# Development Guide

## Quick Start

**⚠️ IMPORTANT: Always use Mise. Never use npm or bun run directly.**

```bash
# Install dependencies
mise run install

# Start development server with auto-rebuild
mise run dev

# View all available tasks
mise tasks
```

### If You Don't Have Mise Installed

```bash
# Install Mise (macOS/Linux)
curl https://mise.jdx.dev/install.sh | sh

# Or with Homebrew
brew install mise

# Then follow "Quick Start" above
```

## Project Structure

```
src/bot/
├── bot.ts                      # Main Discord client & events
├── api/
│   └── idleChampionsApi.ts     # Game API client (query-param based)
├── commands/
│   ├── setup.ts                # Save user credentials
│   ├── redeem.ts               # Manual code redemption
│   ├── catchup.ts              # Redeem all known codes the user hasn't claimed
│   ├── inventory.ts            # Show account info
│   ├── open.ts                 # Open chests
│   ├── blacksmith.ts           # Upgrade heroes
│   ├── codes.ts                # Show code history
│   ├── makepublic.ts           # Share codes with other users
│   ├── backfill.ts             # Recover missed codes from history
│   └── help.ts                 # Command help
├── database/
│   ├── db.ts                   # Drizzle database connection & migrate()
│   ├── userManager.ts          # User credentials storage
│   ├── codeManager.ts          # Code tracking & history
│   ├── auditManager.ts         # Audit log operations
│   ├── backfillManager.ts      # Backfill operations & locking
│   ├── schema/                 # Drizzle table definitions (one file per table)
│   │   ├── index.ts
│   │   ├── users.ts
│   │   ├── redeemed_codes.ts
│   │   ├── pending_codes.ts
│   │   ├── audit_log.ts
│   │   └── backfill_operations.ts
│   └── migrations/             # Auto-generated SQL migrations (drizzle-kit)
├── handlers/
│   ├── codeScanner.ts          # Message code detection
│   └── backfillHandler.ts      # Message history scanning & redemption
└── utils/
    ├── logger.ts               # Winston logger (file + console output)
    ├── apiRequestLogger.ts     # API response logging & cleanup
    └── debugLogger.ts          # Debug utilities

src/test/
└── setup.ts                    # Bun test preload: sets DB_PATH=:memory:
```

## Key Technologies

- **Mise** - Task runner and tool version manager (MANDATORY)
- **Bun 1.3.13** - JavaScript runtime (3-4x faster than Node.js; also used as package manager)
- **discord.js 14.26** - Discord bot framework
- **bun:sqlite** - Built-in SQLite module (replaces `sqlite3`)
- **Drizzle ORM** - Type-safe query builder and schema manager
- **Bun Fetch API** - Built-in HTTP client (replaces `node-fetch`)
- **TypeScript** - Type-safe development (`noEmit: true`; type-check only)
- **Winston** - Structured logging to file + console
- **Bun test** - Built-in test runner (no additional dependencies)

## Important Notes

### SSL Certificate Issue

The Idle Champions API server has an expired SSL certificate. Always start the bot with:

```bash
NODE_TLS_REJECT_UNAUTHORIZED=0
```

### Instance ID Problem

When calling game APIs (redeem, open chests, blacksmith), you must:

1. Fetch fresh user details via `getUserDetails()`
2. Extract `instance_id` from `details.instance_id`
3. Pass it to the API call

This prevents "Outdated instance id" errors from the server.

## Logging

The bot uses Winston for structured logging.

- **Log directory**: `logs/` (auto-created)
- **Files**: `combined.log` (all levels, 20 rotated files), `error.log` (errors only, 10 files)
- **Default level**: `info` — override with `LOG_LEVEL=debug` in `.env`
- **Levels**: `error`, `warn`, `info`, `debug`, `trace`
- **Console**: colour-coded timestamps, printed alongside file output

```bash
# Follow live logs
tail -f logs/combined.log

# Errors only
tail -f logs/error.log
```

## Testing

The project uses the built-in **Bun test runner**. Tests use an in-memory SQLite database so the real `data/idle.db` is never touched.

### Running Tests

```bash
bun test            # Run all tests once
bun test --watch    # Re-run on file changes
```

### Test Layout

| File | What it tests |
|------|---------------|
| `src/bot/handlers/codeScanner.test.ts` | `extractCodesFromText` — regex, emoji stripping, case normalisation |
| `src/bot/database/codeManager.test.ts` | All `CodeManager` methods — per-user redemption, public/private, pending codes |
| `src/bot/database/userManager.test.ts` | All `UserManager` CRUD operations |

### How It Works

`bunfig.toml` configures a preload file:

```toml
[test]
preload = ["./src/test/setup.ts"]
```

`src/test/setup.ts` sets environment variables before any module is imported:

```typescript
process.env.DB_PATH = ':memory:';
process.env.MIGRATIONS_PATH = '...';
```

This means test files can use plain static imports — `db.ts` opens an in-memory database automatically.

### Writing New Tests

- Co-locate test files: `<module>.test.ts` next to `<module>.ts`
- Import `db` from `./db` and call `initializeDatabase()` in `beforeAll`
- Clear tables in `beforeEach` in FK-safe order (children before parents)
- **Never call `closeDatabase()` in `afterAll`** — Bun reuses workers between test files; closing the connection breaks later files

### API Pattern

All game API calls use URL query parameters, not JSON body:

```
POST /~idledragons/post.php?call=redeemcoupon&user_id=X&hash=Y&instance_id=Z&code=ABC
```

## Building

The production build compiles TypeScript into a self-contained native binary:

```bash
# Build production binary (bun build --compile)
mise run prod:build

# Type-check only (no output files)
mise run build

# Run the binary
./dist-bundle/bot
```

For development, Bun runs TypeScript directly — no compile step is needed.

## Common Tasks

All tasks are run through Mise. Use `mise tasks` to see all available commands:

```bash
mise run install      # Install dependencies
mise run dev          # Start bot directly from TypeScript source
mise run build        # Type-check only (noEmit: true)
mise run prod:build   # Build self-contained production binary
mise run lint         # Check code quality
mise run lint:fix     # Auto-fix linting issues
mise run audit        # Check for vulnerabilities
mise run clean        # Clean build artifacts
```

## Database

SQLite database (`./data/idle.db`) managed with Drizzle ORM. Schema is defined in TypeScript files under `src/bot/database/schema/`. Migrations are automatically applied at startup via `migrate()`.

To regenerate migrations after schema changes:

```bash
bun run db:generate   # Regenerate SQL migrations from schema
bun run db:studio     # Open Drizzle Studio (visual DB browser)
```

```mermaid
erDiagram
    USERS ||--o{ REDEEMED_CODES : "has"
    USERS ||--o{ PENDING_CODES : "has"
    USERS ||--o{ AUDIT_LOG : "generates"

    USERS {
        string discord_id PK
        int user_id "Idle Champions user ID"
        string user_hash "Idle Champions auth token"
        string server "game server URL"
        string instance_id "deprecated"
        datetime created_at
        datetime updated_at
    }

    REDEEMED_CODES {
        int id PK
        string code
        string discord_id FK
        string status "Success or Code Expired"
        json loot
        int is_public "0 = private, 1 = public"
        datetime expires_at
        datetime timestamp
    }

    PENDING_CODES {
        int id PK
        string code
        string discord_id FK
        datetime added_at
    }

    AUDIT_LOG {
        int id PK
        string discord_id FK
        string action
        json details
        datetime timestamp
    }

    BACKFILL_OPERATIONS {
        int id PK
        string initiated_by "discord_id FK or 'system'"
        datetime started_at
        datetime completed_at
        int codes_found
        int codes_redeemed
        string status "in_progress, completed, failed"
    }
```

## Testing Commands

```
/setup user_id:123456 user_hash:abc123def456...

/redeem code:TESTCODE

/inventory

/open chest_type:Gold count:5

/blacksmith contract_type:Small hero_id:1 count:3

/help
```

## Debugging

The bot saves API responses to `debug/` folder automatically:

- Files older than 1 hour are deleted
- Useful for troubleshooting API issues
- Format: `endpoint_YYYY-MM-DDTHH-mm-ss-SSSZ.json`

## Environment Variables

```bash
DISCORD_TOKEN      # Bot token from Discord Developer Portal
DISCORD_GUILD_ID   # Server ID (for guild-specific commands)
DISCORD_CHANNEL_ID # Channel ID (for auto code scanning)
DISCORD_CODE_AUTHOR_ID # User/bot ID that posts promo codes (filters backfill to that author only)
DB_PATH            # Database file path (default: ./data/idle.db)
NODE_ENV           # development or production
```

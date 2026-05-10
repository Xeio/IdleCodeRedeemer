/**
 * Bun test preload — runs in each worker before any test file is evaluated.
 * Sets environment variables so db.ts opens an in-memory SQLite instead of
 * the real database file, and points the migrator at the correct folder.
 */
import path from 'path';

process.env.DB_PATH = ':memory:';
process.env.MIGRATIONS_PATH = path.join(process.cwd(), 'src/bot/database/migrations');

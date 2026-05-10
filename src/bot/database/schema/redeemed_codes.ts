import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { users } from './users';

export const redeemedCodes = sqliteTable(
  'redeemed_codes',
  {
    id: integer().primaryKey({ autoIncrement: true }),
    code: text().notNull(),
    discordId: text().references(() => users.discordId),
    redeemedAt: text().default(sql`CURRENT_TIMESTAMP`),
    status: text(),
    lootDetail: text(),
    isPublic: integer().default(0),
    expiresAt: text(),
  },
  (table) => [
    uniqueIndex('redeemed_codes_code_discord_id_unique').on(table.code, table.discordId),
  ]
);

export type RedeemedCode = typeof redeemedCodes.$inferSelect;
export type NewRedeemedCode = typeof redeemedCodes.$inferInsert;

import { eq, ne, and, or, isNull, gt, sql } from 'drizzle-orm';
import { db } from './db';
import { redeemedCodes, pendingCodes } from './schema/index';

interface RedeemedCode {
  code: string;
  discordId?: string;
  status?: string;
  lootDetail?: string;
  isPublic?: boolean;
  expiresAt?: string;
}

type RedeemedCodeRow = typeof redeemedCodes.$inferSelect;

class CodeManager {
  async addRedeemedCode(
    code: string,
    discordId: string,
    status: string,
    lootDetail?: string,
    isPublic: boolean = false
  ): Promise<void> {
    db.insert(redeemedCodes)
      .values({
        code,
        discordId,
        status,
        lootDetail: lootDetail ? JSON.stringify(lootDetail) : null,
        isPublic: isPublic ? 1 : 0,
      })
      .onConflictDoUpdate({
        target: [redeemedCodes.code, redeemedCodes.discordId],
        set: { status, lootDetail: lootDetail ? JSON.stringify(lootDetail) : null },
      })
      .run();
    // If this redemption makes the code public, propagate to ALL rows for this code
    if (isPublic) {
      db.update(redeemedCodes).set({ isPublic: 1 }).where(eq(redeemedCodes.code, code)).run();
    }
  }

  async isCodeRedeemed(code: string): Promise<boolean> {
    const result = db
      .select({ code: redeemedCodes.code })
      .from(redeemedCodes)
      .where(and(eq(redeemedCodes.code, code), or(eq(redeemedCodes.status, 'Success'), eq(redeemedCodes.status, 'Code Expired'))))
      .get();
    return result !== undefined;
  }

  async isCodeRedeemedByUser(code: string, discordId: string): Promise<boolean> {
    const result = db
      .select({ code: redeemedCodes.code })
      .from(redeemedCodes)
      .where(
        and(
          eq(redeemedCodes.code, code),
          eq(redeemedCodes.discordId, discordId),
          or(eq(redeemedCodes.status, 'Success'), eq(redeemedCodes.status, 'Code Expired'))
        )
      )
      .get();
    return result !== undefined;
  }

  async getRedeemedCodes(discordId: string): Promise<string[]> {
    const results = db
      .select({ code: redeemedCodes.code })
      .from(redeemedCodes)
      .where(eq(redeemedCodes.discordId, discordId))
      .orderBy(sql`${redeemedCodes.redeemedAt} DESC`)
      .limit(100)
      .all();
    return results.map((r) => r.code);
  }

  async getRedeemedCodeDetails(discordId: string, limit: number = 10): Promise<RedeemedCodeRow[]> {
    return db
      .select()
      .from(redeemedCodes)
      .where(eq(redeemedCodes.discordId, discordId))
      .orderBy(sql`${redeemedCodes.redeemedAt} DESC`)
      .limit(limit)
      .all();
  }

  async getPublicUnexpiredCodes(): Promise<RedeemedCodeRow[]> {
    // With per-user rows, group by code to avoid duplicates; return one row per public code
    return db
      .selectDistinct({ code: redeemedCodes.code, id: redeemedCodes.id, discordId: redeemedCodes.discordId, redeemedAt: redeemedCodes.redeemedAt, status: redeemedCodes.status, lootDetail: redeemedCodes.lootDetail, isPublic: redeemedCodes.isPublic, expiresAt: redeemedCodes.expiresAt })
      .from(redeemedCodes)
      .where(
        and(
          eq(redeemedCodes.isPublic, 1),
          eq(redeemedCodes.status, 'Success'),
          or(isNull(redeemedCodes.expiresAt), gt(redeemedCodes.expiresAt, sql`CURRENT_TIMESTAMP`))
        )
      )
      .orderBy(sql`${redeemedCodes.redeemedAt} DESC`)
      .all();
  }

  async getSuccessfulRedeemCount(code: string): Promise<number> {
    const result = db
      .select({ count: sql<number>`COUNT(*)` })
      .from(redeemedCodes)
      .where(and(eq(redeemedCodes.code, code), eq(redeemedCodes.status, 'Success')))
      .get();
    return result?.count ?? 0;
  }

  async isCodeSuccessfullyRedeemedByOther(code: string, discordId: string): Promise<boolean> {
    const result = db
      .select({ code: redeemedCodes.code })
      .from(redeemedCodes)
      .where(and(eq(redeemedCodes.code, code), ne(redeemedCodes.discordId, discordId), eq(redeemedCodes.status, 'Success')))
      .get();
    return result !== undefined;
  }

  async isCodePublic(code: string): Promise<boolean> {
    const result = db
      .select({ code: redeemedCodes.code })
      .from(redeemedCodes)
      .where(and(eq(redeemedCodes.code, code), eq(redeemedCodes.isPublic, 1)))
      .get();
    return result !== undefined;
  }

  async isCodeExpired(code: string): Promise<boolean> {
    const result = db
      .select({ code: redeemedCodes.code })
      .from(redeemedCodes)
      .where(and(eq(redeemedCodes.code, code), eq(redeemedCodes.status, 'Code Expired')))
      .get();
    return result !== undefined;
  }

  async getAllValidCodes(): Promise<string[]> {
    // Return distinct codes that have at least one 'Success' row and are not expired
    const results = db
      .selectDistinct({ code: redeemedCodes.code })
      .from(redeemedCodes)
      .where(
        and(
          eq(redeemedCodes.status, 'Success'),
          sql`${redeemedCodes.code} NOT IN (SELECT code FROM ${redeemedCodes} WHERE status = 'Code Expired')`
        )
      )
      .all();
    return results.map((r) => r.code);
  }

  async markCodeAsExpired(code: string): Promise<void> {
    db.update(redeemedCodes)
      .set({ status: 'Code Expired', expiresAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(redeemedCodes.code, code))
      .run();
  }

  async markCodeAsPublic(code: string): Promise<void> {
    db.update(redeemedCodes).set({ isPublic: 1 }).where(eq(redeemedCodes.code, code)).run();
  }

  async markCodeAsPrivate(code: string): Promise<void> {
    db.update(redeemedCodes).set({ isPublic: 0 }).where(eq(redeemedCodes.code, code)).run();
  }

  async addPendingCode(code: string, discordId?: string): Promise<void> {
    db.insert(pendingCodes).values({ code, discordId: discordId ?? null }).run();
  }

  async getPendingCodes(discordId?: string): Promise<string[]> {
    const results = discordId
      ? db.select({ code: pendingCodes.code }).from(pendingCodes).where(eq(pendingCodes.discordId, discordId)).orderBy(sql`${pendingCodes.foundAt} ASC`).all()
      : db.select({ code: pendingCodes.code }).from(pendingCodes).orderBy(sql`${pendingCodes.foundAt} ASC`).all();
    return results.map((r) => r.code);
  }

  async removePendingCode(code: string): Promise<void> {
    db.delete(pendingCodes).where(eq(pendingCodes.code, code)).run();
  }

  async clearPendingCodes(discordId?: string): Promise<void> {
    if (discordId) {
      db.delete(pendingCodes).where(eq(pendingCodes.discordId, discordId)).run();
    } else {
      db.delete(pendingCodes).run();
    }
  }
}

export const codeManager = new CodeManager();

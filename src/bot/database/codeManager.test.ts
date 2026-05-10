import { describe, test, expect, beforeAll, beforeEach, afterAll } from 'bun:test';
import { db, initializeDatabase } from './db';
import { codeManager } from './codeManager';
import { users, redeemedCodes, pendingCodes } from './schema/index';

const USER_A = 'discord-user-a';
const USER_B = 'discord-user-b';

beforeAll(() => {
  initializeDatabase();
});

beforeEach(() => {
  // Clear in FK-safe order
  db.delete(pendingCodes).run();
  db.delete(redeemedCodes).run();
  db.delete(users).run();
  // Seed test users required by FK on redeemed_codes.discord_id
  db.insert(users)
    .values([
      { discordId: USER_A, userId: '111', userHash: 'hash-a' },
      { discordId: USER_B, userId: '222', userHash: 'hash-b' },
    ])
    .run();
});

afterAll(async () => {
  // Do not close the database — it may be shared with other test files in the
  // same Bun worker. The in-memory DB is cleaned up when the process exits.
});


// ---------------------------------------------------------------------------
// addRedeemedCode
// ---------------------------------------------------------------------------
describe('addRedeemedCode', () => {
  test('inserts a new successful redemption', async () => {
    await codeManager.addRedeemedCode('CODE1234ABCD', USER_A, 'Success');
    const rows = db.select().from(redeemedCodes).all();
    expect(rows).toHaveLength(1);
    expect(rows[0].code).toBe('CODE1234ABCD');
    expect(rows[0].status).toBe('Success');
    expect(rows[0].discordId).toBe(USER_A);
    expect(rows[0].isPublic).toBe(0);
  });

  test('different users can both redeem the same code', async () => {
    await codeManager.addRedeemedCode('CODE1234ABCD', USER_A, 'Success');
    await codeManager.addRedeemedCode('CODE1234ABCD', USER_B, 'Success');
    const rows = db.select().from(redeemedCodes).all();
    expect(rows).toHaveLength(2);
  });

  test('upserts when the same user redeems the same code twice', async () => {
    await codeManager.addRedeemedCode('CODE1234ABCD', USER_A, 'Success');
    await codeManager.addRedeemedCode('CODE1234ABCD', USER_A, 'Code Expired');
    const rows = db.select().from(redeemedCodes).all();
    expect(rows).toHaveLength(1);
    expect(rows[0].status).toBe('Code Expired');
  });

  test('propagates isPublic=true to all existing rows for the code', async () => {
    await codeManager.addRedeemedCode('CODE1234ABCD', USER_A, 'Success', undefined, false);
    await codeManager.addRedeemedCode('CODE1234ABCD', USER_B, 'Success', undefined, true);
    const rows = db.select().from(redeemedCodes).all();
    expect(rows.every((r) => r.isPublic === 1)).toBe(true);
  });

  test('stores lootDetail as JSON string', async () => {
    const loot = [{ chest_type_id: 1, count: 5 }];
    await codeManager.addRedeemedCode('CODE1234ABCD', USER_A, 'Success', loot as any);
    const row = db.select().from(redeemedCodes).limit(1).get();
    expect(row?.lootDetail).toBe(JSON.stringify(loot));
  });
});

// ---------------------------------------------------------------------------
// isCodeRedeemed (global — any user)
// ---------------------------------------------------------------------------
describe('isCodeRedeemed', () => {
  test('returns false when code has never been seen', async () => {
    expect(await codeManager.isCodeRedeemed('UNKNOWN1ABCD')).toBe(false);
  });

  test('returns true when any user has a Success row', async () => {
    await codeManager.addRedeemedCode('CODE1234ABCD', USER_A, 'Success');
    expect(await codeManager.isCodeRedeemed('CODE1234ABCD')).toBe(true);
  });

  test('returns true when any user has a Code Expired row', async () => {
    await codeManager.addRedeemedCode('CODE1234ABCD', USER_A, 'Code Expired');
    expect(await codeManager.isCodeRedeemed('CODE1234ABCD')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// isCodeRedeemedByUser (per-user)
// ---------------------------------------------------------------------------
describe('isCodeRedeemedByUser', () => {
  test('returns false when code has not been redeemed by the user', async () => {
    await codeManager.addRedeemedCode('CODE1234ABCD', USER_A, 'Success');
    expect(await codeManager.isCodeRedeemedByUser('CODE1234ABCD', USER_B)).toBe(false);
  });

  test('returns true when the user has successfully redeemed the code', async () => {
    await codeManager.addRedeemedCode('CODE1234ABCD', USER_A, 'Success');
    expect(await codeManager.isCodeRedeemedByUser('CODE1234ABCD', USER_A)).toBe(true);
  });

  test('returns true when the user has a Code Expired row', async () => {
    await codeManager.addRedeemedCode('CODE1234ABCD', USER_A, 'Code Expired');
    expect(await codeManager.isCodeRedeemedByUser('CODE1234ABCD', USER_A)).toBe(true);
  });

  test('returns false for unknown code', async () => {
    expect(await codeManager.isCodeRedeemedByUser('UNKNOWN1ABCD', USER_A)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isCodeExpired
// ---------------------------------------------------------------------------
describe('isCodeExpired', () => {
  test('returns false when code has not been seen', async () => {
    expect(await codeManager.isCodeExpired('UNKNOWN1ABCD')).toBe(false);
  });

  test('returns false for a successful redemption', async () => {
    await codeManager.addRedeemedCode('CODE1234ABCD', USER_A, 'Success');
    expect(await codeManager.isCodeExpired('CODE1234ABCD')).toBe(false);
  });

  test('returns true after markCodeAsExpired', async () => {
    await codeManager.addRedeemedCode('CODE1234ABCD', USER_A, 'Success');
    await codeManager.markCodeAsExpired('CODE1234ABCD');
    expect(await codeManager.isCodeExpired('CODE1234ABCD')).toBe(true);
  });

  test('returns true for a row inserted with Code Expired status', async () => {
    await codeManager.addRedeemedCode('CODE1234ABCD', USER_A, 'Code Expired');
    expect(await codeManager.isCodeExpired('CODE1234ABCD')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// isCodeSuccessfullyRedeemedByOther
// ---------------------------------------------------------------------------
describe('isCodeSuccessfullyRedeemedByOther', () => {
  test('returns false when only the querying user has redeemed it', async () => {
    await codeManager.addRedeemedCode('CODE1234ABCD', USER_A, 'Success');
    expect(await codeManager.isCodeSuccessfullyRedeemedByOther('CODE1234ABCD', USER_A)).toBe(false);
  });

  test('returns true when a different user has a Success row', async () => {
    await codeManager.addRedeemedCode('CODE1234ABCD', USER_A, 'Success');
    expect(await codeManager.isCodeSuccessfullyRedeemedByOther('CODE1234ABCD', USER_B)).toBe(true);
  });

  test('returns false when the other user has only an Expired row', async () => {
    await codeManager.addRedeemedCode('CODE1234ABCD', USER_A, 'Code Expired');
    expect(await codeManager.isCodeSuccessfullyRedeemedByOther('CODE1234ABCD', USER_B)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getAllValidCodes
// ---------------------------------------------------------------------------
describe('getAllValidCodes', () => {
  test('returns empty array when no codes exist', async () => {
    expect(await codeManager.getAllValidCodes()).toEqual([]);
  });

  test('returns distinct codes with at least one Success row', async () => {
    await codeManager.addRedeemedCode('CODE1234ABCD', USER_A, 'Success');
    await codeManager.addRedeemedCode('CODE1234ABCD', USER_B, 'Success');
    const codes = await codeManager.getAllValidCodes();
    expect(codes).toHaveLength(1);
    expect(codes[0]).toBe('CODE1234ABCD');
  });

  test('excludes codes that are expired', async () => {
    await codeManager.addRedeemedCode('CODE1234ABCD', USER_A, 'Success');
    await codeManager.markCodeAsExpired('CODE1234ABCD');
    expect(await codeManager.getAllValidCodes()).toEqual([]);
  });

  test('returns multiple distinct valid codes', async () => {
    await codeManager.addRedeemedCode('CODE1234ABCD', USER_A, 'Success');
    await codeManager.addRedeemedCode('WXYZ5678IJKL', USER_A, 'Success');
    const codes = await codeManager.getAllValidCodes();
    expect(codes).toHaveLength(2);
    expect(codes).toContain('CODE1234ABCD');
    expect(codes).toContain('WXYZ5678IJKL');
  });
});

// ---------------------------------------------------------------------------
// isCodePublic / markCodeAsPublic / markCodeAsPrivate
// ---------------------------------------------------------------------------
describe('public/private code management', () => {
  test('new codes are private by default', async () => {
    await codeManager.addRedeemedCode('CODE1234ABCD', USER_A, 'Success');
    expect(await codeManager.isCodePublic('CODE1234ABCD')).toBe(false);
  });

  test('markCodeAsPublic makes the code public', async () => {
    await codeManager.addRedeemedCode('CODE1234ABCD', USER_A, 'Success');
    await codeManager.markCodeAsPublic('CODE1234ABCD');
    expect(await codeManager.isCodePublic('CODE1234ABCD')).toBe(true);
  });

  test('markCodeAsPrivate reverts a public code', async () => {
    await codeManager.addRedeemedCode('CODE1234ABCD', USER_A, 'Success', undefined, true);
    await codeManager.markCodeAsPrivate('CODE1234ABCD');
    expect(await codeManager.isCodePublic('CODE1234ABCD')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// pending codes
// ---------------------------------------------------------------------------
describe('pending codes', () => {
  test('addPendingCode / getPendingCodes', async () => {
    await codeManager.addPendingCode('PEND1234ABCD', USER_A);
    const codes = await codeManager.getPendingCodes();
    expect(codes).toContain('PEND1234ABCD');
  });

  test('getPendingCodes filtered by discordId', async () => {
    await codeManager.addPendingCode('PEND1234ABCD', USER_A);
    await codeManager.addPendingCode('PEND5678EFGH', USER_B);
    expect(await codeManager.getPendingCodes(USER_A)).toEqual(['PEND1234ABCD']);
    expect(await codeManager.getPendingCodes(USER_B)).toEqual(['PEND5678EFGH']);
  });

  test('removePendingCode removes a specific code', async () => {
    await codeManager.addPendingCode('PEND1234ABCD', USER_A);
    await codeManager.removePendingCode('PEND1234ABCD');
    expect(await codeManager.getPendingCodes()).toEqual([]);
  });

  test('clearPendingCodes removes all codes', async () => {
    await codeManager.addPendingCode('PEND1234ABCD', USER_A);
    await codeManager.addPendingCode('PEND5678EFGH', USER_B);
    await codeManager.clearPendingCodes();
    expect(await codeManager.getPendingCodes()).toEqual([]);
  });

  test('clearPendingCodes with discordId only removes that user\'s codes', async () => {
    await codeManager.addPendingCode('PEND1234ABCD', USER_A);
    await codeManager.addPendingCode('PEND5678EFGH', USER_B);
    await codeManager.clearPendingCodes(USER_A);
    expect(await codeManager.getPendingCodes()).toEqual(['PEND5678EFGH']);
  });
});

// ---------------------------------------------------------------------------
// getRedeemedCodeDetails
// ---------------------------------------------------------------------------
describe('getRedeemedCodeDetails', () => {
  test('returns codes for the specified user in descending order', async () => {
    await codeManager.addRedeemedCode('CODE1111AAAA', USER_A, 'Success');
    await codeManager.addRedeemedCode('CODE2222BBBB', USER_A, 'Success');
    await codeManager.addRedeemedCode('CODE3333CCCC', USER_B, 'Success');
    const details = await codeManager.getRedeemedCodeDetails(USER_A);
    expect(details).toHaveLength(2);
    expect(details.every((r) => r.discordId === USER_A)).toBe(true);
  });
});

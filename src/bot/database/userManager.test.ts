import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { db, initializeDatabase } from './db';
import { userManager } from './userManager';
import { users, redeemedCodes, pendingCodes } from './schema/index';

beforeAll(() => {
  initializeDatabase();
});

beforeEach(() => {
  // Clear in FK-safe order so the users delete never violates constraints
  db.delete(pendingCodes).run();
  db.delete(redeemedCodes).run();
  db.delete(users).run();
});



// ---------------------------------------------------------------------------
// saveCredentials
// ---------------------------------------------------------------------------
describe('saveCredentials', () => {
  test('inserts a new user', async () => {
    await userManager.saveCredentials({ discordId: 'user-1', userId: '111', userHash: 'hash-a' });
    const rows = db.select().from(users).all();
    expect(rows).toHaveLength(1);
    expect(rows[0].discordId).toBe('user-1');
    expect(rows[0].userId).toBe('111');
    expect(rows[0].userHash).toBe('hash-a');
  });

  test('upserts existing user credentials', async () => {
    await userManager.saveCredentials({ discordId: 'user-1', userId: '111', userHash: 'hash-a' });
    await userManager.saveCredentials({ discordId: 'user-1', userId: '222', userHash: 'hash-b' });
    const rows = db.select().from(users).all();
    expect(rows).toHaveLength(1);
    expect(rows[0].userId).toBe('222');
    expect(rows[0].userHash).toBe('hash-b');
  });

  test('stores optional server field', async () => {
    await userManager.saveCredentials({
      discordId: 'user-1',
      userId: '111',
      userHash: 'hash-a',
      server: 'server1',
    });
    const rows = db.select().from(users).all();
    expect(rows[0].server).toBe('server1');
  });
});

// ---------------------------------------------------------------------------
// getCredentials
// ---------------------------------------------------------------------------
describe('getCredentials', () => {
  test('returns null for an unknown discord ID', async () => {
    expect(await userManager.getCredentials('unknown')).toBeNull();
  });

  test('returns the correct credentials for a known user', async () => {
    await userManager.saveCredentials({
      discordId: 'user-1',
      userId: '111',
      userHash: 'hash-a',
      server: 'sv1',
    });
    const creds = await userManager.getCredentials('user-1');
    expect(creds).not.toBeNull();
    expect(creds?.discordId).toBe('user-1');
    expect(creds?.userId).toBe('111');
    expect(creds?.userHash).toBe('hash-a');
    expect(creds?.server).toBe('sv1');
  });
});

// ---------------------------------------------------------------------------
// hasCredentials
// ---------------------------------------------------------------------------
describe('hasCredentials', () => {
  test('returns false for an unknown discord ID', async () => {
    expect(await userManager.hasCredentials('unknown')).toBe(false);
  });

  test('returns true after saveCredentials', async () => {
    await userManager.saveCredentials({ discordId: 'user-1', userId: '111', userHash: 'hash-a' });
    expect(await userManager.hasCredentials('user-1')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// updateServer
// ---------------------------------------------------------------------------
describe('updateServer', () => {
  test('updates the server field for an existing user', async () => {
    await userManager.saveCredentials({ discordId: 'user-1', userId: '111', userHash: 'hash-a' });
    await userManager.updateServer('user-1', 'server-new');
    const creds = await userManager.getCredentials('user-1');
    expect(creds?.server).toBe('server-new');
  });

  test('overrides a previously stored server', async () => {
    await userManager.saveCredentials({
      discordId: 'user-1',
      userId: '111',
      userHash: 'hash-a',
      server: 'server-old',
    });
    await userManager.updateServer('user-1', 'server-new');
    const creds = await userManager.getCredentials('user-1');
    expect(creds?.server).toBe('server-new');
  });
});

// ---------------------------------------------------------------------------
// deleteCredentials
// ---------------------------------------------------------------------------
describe('deleteCredentials', () => {
  test('removes the user row', async () => {
    await userManager.saveCredentials({ discordId: 'user-1', userId: '111', userHash: 'hash-a' });
    await userManager.deleteCredentials('user-1');
    expect(await userManager.hasCredentials('user-1')).toBe(false);
  });

  test('is a no-op for an unknown user', async () => {
    await userManager.deleteCredentials('nobody');
    expect(db.select().from(users).all()).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// getAllUsers
// ---------------------------------------------------------------------------
describe('getAllUsers', () => {
  test('returns empty array when no users exist', async () => {
    expect(await userManager.getAllUsers()).toEqual([]);
  });

  test('returns all stored users', async () => {
    await userManager.saveCredentials({ discordId: 'user-1', userId: '111', userHash: 'hash-a' });
    await userManager.saveCredentials({ discordId: 'user-2', userId: '222', userHash: 'hash-b' });
    const all = await userManager.getAllUsers();
    expect(all).toHaveLength(2);
    const ids = all.map((u) => u.discordId);
    expect(ids).toContain('user-1');
    expect(ids).toContain('user-2');
  });
});

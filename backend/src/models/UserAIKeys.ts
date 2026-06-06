import Database from 'better-sqlite3';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const dbPath = path.join(__dirname, '../../data/promptcraft.db');
const db = new Database(dbPath);

export interface UserAIKey {
  id?: number;
  user_id: number;
  provider_id: string;
  api_key: string;
  config: Record<string, any>;
  is_default: boolean;
  created_at?: string;
}

export async function createAIKeysTable() {
  console.log('✅ Таблица user_ai_keys создана');
}

export async function getUserAIKeys(userId: number): Promise<UserAIKey[]> {
  const stmt = db.prepare('SELECT * FROM user_ai_keys WHERE user_id = ? ORDER BY created_at DESC');
  const rows = stmt.all(userId) as any[];
  return rows.map(row => ({
    ...row,
    config: JSON.parse(row.config),
    is_default: row.is_default === 1
  }));
}

export async function getUserAIKey(userId: number, providerId: string): Promise<UserAIKey | null> {
  const stmt = db.prepare('SELECT * FROM user_ai_keys WHERE user_id = ? AND provider_id = ?');
  const row = stmt.get(userId, providerId) as any;
  if (!row) return null;
  return {
    ...row,
    config: JSON.parse(row.config),
    is_default: row.is_default === 1
  };
}

export async function saveUserAIKey(key: UserAIKey): Promise<UserAIKey> {
  const existing = await getUserAIKey(key.user_id, key.provider_id);
  
  if (existing) {
    // Update existing
    const stmt = db.prepare(`
      UPDATE user_ai_keys 
      SET api_key = ?, config = ?, is_default = ?
      WHERE user_id = ? AND provider_id = ?
    `);
    stmt.run(
      key.api_key,
      JSON.stringify(key.config),
      key.is_default ? 1 : 0,
      key.user_id,
      key.provider_id
    );
    return { ...key, id: existing.id };
  } else {
    // Insert new
    const stmt = db.prepare(`
      INSERT INTO user_ai_keys (user_id, provider_id, api_key, config, is_default)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      key.user_id,
      key.provider_id,
      key.api_key,
      JSON.stringify(key.config),
      key.is_default ? 1 : 0
    );
    return { ...key, id: result.lastInsertRowid as number };
  }
}

export async function deleteUserAIKey(userId: number, providerId: string): Promise<boolean> {
  const stmt = db.prepare('DELETE FROM user_ai_keys WHERE user_id = ? AND provider_id = ?');
  const result = stmt.run(userId, providerId);
  return result.changes > 0;
}

export async function setDefaultAIKey(userId: number, providerId: string): Promise<void> {
  // Reset all defaults for user
  const resetStmt = db.prepare('UPDATE user_ai_keys SET is_default = 0 WHERE user_id = ?');
  resetStmt.run(userId);
  
  // Set new default
  const setStmt = db.prepare('UPDATE user_ai_keys SET is_default = 1 WHERE user_id = ? AND provider_id = ?');
  setStmt.run(userId, providerId);
}

// Close database connection when process exits
process.on('exit', () => {
  db.close();
});
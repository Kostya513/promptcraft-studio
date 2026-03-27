import { Pool, QueryResult } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL;

let pool: Pool | null = null;

if (DATABASE_URL) {
  pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
  
  pool.on('connect', () => console.log('✅ Database connected'));
  pool.on('error', (err) => console.error('❌ Database error:', err.message));
} else {
  console.warn('⚠️  DATABASE_URL not set - database features disabled');
}

export async function query(text: string, params?: any[]): Promise<QueryResult> {
  if (!pool) {
    console.warn('⚠️  Database query attempted but pool not initialized');
    return { rows: [], rowCount: 0, command: '', fields: [] } as QueryResult;
  }
  
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

export async function initDatabase(): Promise<void> {
  if (!pool) {
    console.warn('⚠️  Skipping database initialization - no connection');
    return;
  }
  
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255),
        name VARCHAR(255),
        avatar_url TEXT,
        role VARCHAR(50) DEFAULT 'user',
        vk_id VARCHAR(100),
        yandex_id VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table: users');

    await query(`
      CREATE TABLE IF NOT EXISTS prompts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        text TEXT NOT NULL,
        model VARCHAR(100),
        quality INTEGER DEFAULT 85,
        rating INTEGER,
        status VARCHAR(50) DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table: prompts');

    await query(`
      CREATE TABLE IF NOT EXISTS publications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        prompt_id INTEGER REFERENCES prompts(id) ON DELETE CASCADE,
        platform VARCHAR(50) NOT NULL,
        external_id VARCHAR(255),
        status VARCHAR(50) DEFAULT 'pending',
        published_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table: publications');

    console.log('✅ Database initialized successfully');
  } catch (error: any) {
    console.error('❌ Database initialization error:', error.message);
  }
}

export default pool;

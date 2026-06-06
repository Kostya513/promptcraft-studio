import Database from 'better-sqlite3';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

// Создаём папку для БД если её нет
const dbDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(__dirname, '../../data/promptcraft.db');
console.log(`📁 Путь к БД: ${dbPath}`);

const db = new Database(dbPath);

// Включаем WAL режим для лучшей производительности
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initDatabase() {
  console.log('🔧 Инициализация базы данных SQLite...');

  // Таблица пользователей
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      avatar_url TEXT,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ Таблица users проверена');

  // Таблица промтов
  db.exec(`
    CREATE TABLE IF NOT EXISTS prompts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT,
      content TEXT,
      category TEXT,
      tags TEXT DEFAULT '[]',
      is_public INTEGER DEFAULT 0,
      likes INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ Таблица prompts проверена');

  // Таблица агентов
  db.exec(`
    CREATE TABLE IF NOT EXISTS agents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      config TEXT NOT NULL,
      integrations TEXT DEFAULT '[]',
      status TEXT DEFAULT 'draft',
      run_count INTEGER DEFAULT 0,
      last_run DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ Таблица agents создана');

  // Таблица логов агентов
  db.exec(`
    CREATE TABLE IF NOT EXISTS agent_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      agent_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      params TEXT,
      logs TEXT DEFAULT '[]',
      output TEXT,
      success INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
    );
  `);
  console.log('✅ Таблица agent_logs создана');

  // Таблица AI ключей пользователей
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_ai_keys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      provider_id TEXT NOT NULL,
      api_key TEXT NOT NULL,
      config TEXT DEFAULT '{}',
      is_default INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, provider_id)
    );
  `);
  console.log('✅ Таблица user_ai_keys создана');

  db.close();
  console.log('✅ База данных инициализирована');
  process.exit(0);
}

try {
  initDatabase();
} catch (error) {
  console.error('❌ Ошибка инициализации БД:', error);
  process.exit(1);
}
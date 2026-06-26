// database.js - SQLite setup
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'content', 'reports.db');

const db = new Database(dbPath);

// create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    status TEXT DEFAULT 'submitted',
    priority TEXT DEFAULT 'normal',
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    photo_filename TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS report_comments (
    id TEXT PRIMARY KEY,
    report_id TEXT NOT NULL,
    content TEXT NOT NULL,
    is_internal INTEGER DEFAULT 0,
    author_type TEXT DEFAULT 'citizen',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS report_history (
    id TEXT PRIMARY KEY,
    report_id TEXT NOT NULL,
    action TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
  );
`);

export default db;

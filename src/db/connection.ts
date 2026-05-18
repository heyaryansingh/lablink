import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

export interface LabLinkDatabase {
  path: string;
  raw: Database.Database;
  orm: BetterSQLite3Database<typeof schema>;
}

export function databasePath(dataDir: string): string {
  return join(dataDir, 'lablink.db');
}

export function connectDatabase(dataDir: string): LabLinkDatabase {
  const path = databasePath(dataDir);
  mkdirSync(dirname(path), { recursive: true });
  const raw = new Database(path);
  raw.pragma('foreign_keys = ON');
  return {
    path,
    raw,
    orm: drizzle(raw, { schema }),
  };
}

export function migrateDatabase(db: LabLinkDatabase): void {
  db.raw.exec('CREATE TABLE IF NOT EXISTS _migrations (id TEXT PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT (datetime(\'now\')))');
  const migrationId = '0001_initial';
  const applied = db.raw.prepare('SELECT id FROM _migrations WHERE id = ?').get(migrationId);
  if (applied) return;
  db.raw.exec(readMigrationSql('0001_initial.sql'));
  db.raw.prepare('INSERT INTO _migrations (id) VALUES (?)').run(migrationId);
}

function readMigrationSql(filename: string): string {
  const here = dirname(fileURLToPath(import.meta.url));
  const candidates = [
    join(here, 'migrations', filename),
    resolve(process.cwd(), 'src', 'db', 'migrations', filename),
    resolve(process.cwd(), 'dist', 'db', 'migrations', filename),
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) return readFileSync(candidate, 'utf8');
  }
  throw new Error(`Migration not found: ${filename}`);
}

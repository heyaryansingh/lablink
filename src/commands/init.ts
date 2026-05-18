import { ensureConfig, loadConfig } from '../config/loader';
import { connectDatabase, migrateDatabase } from '../db/connection';
import { seedDemoData } from '../db/seed';

export interface InitOptions {
  demo?: boolean;
  dataDir?: string;
  seed?: boolean;
}

export default function init(options: InitOptions = {}): void {
  const config = loadConfig({ dataDir: options.dataDir, demo: options.demo });
  if (options.demo && !options.dataDir) config.dataDir = '.lablink-dev';
  ensureConfig(config);
  const db = connectDatabase(config.dataDir);
  migrateDatabase(db);
  if (options.seed || options.demo) seedDemoData(db);
  db.raw.close();
  process.stdout.write(`Lab Link initialized at ${config.dataDir}\n`);
}

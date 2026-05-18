import { configPath, loadConfig } from '../config/loader';

export default function showConfig(options: { dataDir?: string; demo?: boolean } = {}): void {
  const config = loadConfig(options);
  process.stdout.write(`${configPath(config.dataDir)}\n`);
}

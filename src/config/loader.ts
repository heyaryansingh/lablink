import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { parse, stringify } from 'smol-toml';
import { createDefaultConfig } from './defaults';
import type { LabLinkConfig } from './types';

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

export function configPath(dataDir: string): string {
  return join(dataDir, 'config.toml');
}

export function loadConfig(options: { dataDir?: string; demo?: boolean } = {}): LabLinkConfig {
  const base = createDefaultConfig();
  if (options.dataDir) base.dataDir = options.dataDir;
  if (options.demo) base.dataDir = options.dataDir || '.lablink-dev';

  const path = configPath(base.dataDir);
  if (!existsSync(path)) return base;

  const parsed = parse(readFileSync(path, 'utf8')) as DeepPartial<LabLinkConfig>;
  return mergeConfig(base, parsed);
}

export function ensureConfig(config: LabLinkConfig): void {
  const path = configPath(config.dataDir);
  if (existsSync(path)) return;
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, stringify(config), 'utf8');
}

export function mergeConfig<T extends Record<string, any>>(base: T, override: DeepPartial<T>): T {
  const output: Record<string, any> = { ...base };
  for (const [key, value] of Object.entries(override)) {
    if (value === undefined) continue;
    const current = output[key];
    if (isPlainObject(current) && isPlainObject(value)) {
      output[key] = mergeConfig(current, value as Record<string, any>);
    } else {
      output[key] = value;
    }
  }
  return output as T;
}

function isPlainObject(value: unknown): value is Record<string, any> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

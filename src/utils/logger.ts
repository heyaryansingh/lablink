import { appendFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { nowIso } from './dates';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export class Logger {
  constructor(private readonly logDir: string) {
    mkdirSync(logDir, { recursive: true });
  }

  write(level: LogLevel, message: string, meta?: unknown): void {
    const line = JSON.stringify({
      ts: nowIso(),
      level,
      message,
      meta,
    });
    appendFileSync(join(this.logDir, 'lablink.log'), `${line}\n`);
  }
}

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

export interface CredentialStore {
  get(service: string, account: string): Promise<string | null>;
  set(service: string, account: string, value: string): Promise<void>;
  delete(service: string, account: string): Promise<void>;
}

export class KeytarCredentialStore implements CredentialStore {
  async get(service: string, account: string): Promise<string | null> {
    const keytar = await import('keytar');
    return keytar.getPassword(service, account);
  }

  async set(service: string, account: string, value: string): Promise<void> {
    const keytar = await import('keytar');
    await keytar.setPassword(service, account, value);
  }

  async delete(service: string, account: string): Promise<void> {
    const keytar = await import('keytar');
    await keytar.deletePassword(service, account);
  }
}

export class FileCredentialStore implements CredentialStore {
  private readonly path: string;

  constructor(dataDir: string) {
    this.path = join(dataDir, 'credentials.dev.json');
  }

  async get(service: string, account: string): Promise<string | null> {
    const data = this.read();
    return data[`${service}:${account}`] ?? null;
  }

  async set(service: string, account: string, value: string): Promise<void> {
    const data = this.read();
    data[`${service}:${account}`] = value;
    this.write(data);
  }

  async delete(service: string, account: string): Promise<void> {
    const data = this.read();
    delete data[`${service}:${account}`];
    this.write(data);
  }

  private read(): Record<string, string> {
    if (!existsSync(this.path)) return {};
    return JSON.parse(readFileSync(this.path, 'utf8')) as Record<string, string>;
  }

  private write(data: Record<string, string>): void {
    mkdirSync(dirname(this.path), { recursive: true });
    writeFileSync(this.path, JSON.stringify(data, null, 2), 'utf8');
  }
}

export function createCredentialStore(dataDir: string): CredentialStore {
  if (process.env.LABLINK_FILE_CREDENTIALS === '1' || process.env.NODE_ENV === 'test') {
    return new FileCredentialStore(dataDir);
  }
  return new KeytarCredentialStore();
}

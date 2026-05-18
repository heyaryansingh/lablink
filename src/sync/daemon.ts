import type { AppServices } from '../services/appServices';
import { upsertExternalInboxItem } from '../db/queries/inbox';
import type { SyncResult } from '../integrations/types';

export async function syncOnce(services: AppServices): Promise<SyncResult[]> {
  const results: SyncResult[] = [];
  const { config, integrations, db, logger } = services;

  if (config.features.oauth && config.integrations.microsoft.enabled) {
    try {
      const items = await integrations.microsoft.fetchInbox();
      for (const item of items) upsertExternalInboxItem(db, item);
      results.push({ provider: 'microsoft', resource: 'inbox', imported: items.length, updated: 0 });
    } catch (error) {
      logger.write('warn', 'Microsoft sync skipped', { error: String(error) });
    }
  }

  if (config.features.oauth && config.integrations.google.enabled) {
    try {
      const items = await integrations.google.fetchInbox();
      for (const item of items) upsertExternalInboxItem(db, item);
      results.push({ provider: 'google', resource: 'gmail', imported: items.length, updated: 0 });
    } catch (error) {
      logger.write('warn', 'Google sync skipped', { error: String(error) });
    }
  }

  return results;
}

export async function syncLoop(services: AppServices, intervalMs = 60_000): Promise<void> {
  for (;;) {
    await syncOnce(services);
    await sleep(intervalMs);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

import { join } from 'node:path';
import { AiClient } from '../ai/client';
import type { LabLinkConfig } from '../config/types';
import { ensureConfig, loadConfig } from '../config/loader';
import type { AppSnapshot, FeatureFlag } from '../core/types';
import { connectDatabase, migrateDatabase, type LabLinkDatabase } from '../db/connection';
import { getAppSnapshot } from '../db/queries/appSnapshot';
import { searchAll, type SearchResult } from '../db/queries/search';
import { seedDemoData } from '../db/seed';
import { createBuiltInExtensions, ExtensionRegistry } from '../extensions/registry';
import { GoogleIntegration } from '../integrations/google';
import { MicrosoftGraphIntegration } from '../integrations/microsoft';
import { ZoomIntegration } from '../integrations/zoom';
import { createCredentialStore, type CredentialStore } from '../utils/credentials';
import { Logger } from '../utils/logger';

export interface AppServices {
  config: LabLinkConfig;
  db: LabLinkDatabase;
  credentials: CredentialStore;
  logger: Logger;
  extensions: ExtensionRegistry;
  ai: AiClient;
  integrations: {
    microsoft: MicrosoftGraphIntegration;
    google: GoogleIntegration;
    zoom: ZoomIntegration;
  };
  snapshot(): AppSnapshot;
  search(query: string): SearchResult[];
  close(): void;
}

export interface CreateServicesOptions {
  demo?: boolean;
  dataDir?: string;
  seed?: boolean;
}

export function createAppServices(options: CreateServicesOptions = {}): AppServices {
  const config = loadConfig({
    dataDir: options.dataDir,
    demo: options.demo,
  });

  if (options.demo && !options.dataDir) {
    config.dataDir = '.lablink-dev';
  }

  ensureConfig(config);

  const db = connectDatabase(config.dataDir);
  migrateDatabase(db);
  if (options.demo || options.seed) seedDemoData(db);

  const credentials = createCredentialStore(config.dataDir);
  const logger = new Logger(join(config.dataDir, 'logs'));

  const extensions = new ExtensionRegistry();
  for (const manifest of createBuiltInExtensions()) extensions.register(manifest);
  if (config.extensions.enabled) extensions.loadDirectories(config.extensions.directories);

  const featureFlags = {
    ...config.features,
    ...extensions.featureOverrides(),
  } as Record<FeatureFlag, boolean>;

  const ai = new AiClient({ ...config, features: featureFlags }, credentials);

  return {
    config: { ...config, features: featureFlags },
    db,
    credentials,
    logger,
    extensions,
    ai,
    integrations: {
      microsoft: new MicrosoftGraphIntegration(config, credentials),
      google: new GoogleIntegration(config, credentials),
      zoom: new ZoomIntegration(config, credentials),
    },
    snapshot: () => getAppSnapshot(db, featureFlags),
    search: (query: string) => searchAll(db, query),
    close: () => db.raw.close(),
  };
}

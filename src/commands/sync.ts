import { createAppServices } from '../services/appServices';
import { syncLoop, syncOnce } from '../sync/daemon';

export interface SyncCommandOptions {
  once?: boolean;
  demo?: boolean;
  dataDir?: string;
}

export default async function syncCommand(options: SyncCommandOptions = {}): Promise<void> {
  const services = createAppServices({ demo: options.demo, dataDir: options.dataDir });
  try {
    if (options.once) {
      const results = await syncOnce(services);
      process.stdout.write(JSON.stringify(results, null, 2));
      process.stdout.write('\n');
      return;
    }
    await syncLoop(services);
  } finally {
    services.close();
  }
}

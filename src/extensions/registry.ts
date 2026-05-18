import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { FeatureFlag } from '../core/types';

export interface ExtensionManifest {
  id: string;
  name: string;
  version: string;
  labTypes?: string[];
  featureFlags?: Partial<Record<FeatureFlag, boolean>>;
  navigation?: Array<{ id: string; label: string; view: string; featureFlag?: FeatureFlag }>;
  projectTabs?: Array<{ id: string; label: string; view: string; featureFlag?: FeatureFlag }>;
  customFields?: Array<{ entity: string; key: string; label: string; type: string; required?: boolean }>;
  statuses?: Array<{ entity: string; key: string; label: string; color?: string }>;
}

export class ExtensionRegistry {
  private readonly manifests = new Map<string, ExtensionManifest>();

  register(manifest: ExtensionManifest): void {
    if (!manifest.id || !manifest.name || !manifest.version) {
      throw new Error('Extension manifest requires id, name, and version.');
    }
    this.manifests.set(manifest.id, manifest);
  }

  loadDirectories(directories: string[]): void {
    for (const directory of directories) {
      if (!existsSync(directory)) continue;
      for (const entry of readdirSync(directory, { withFileTypes: true })) {
        const manifestPath = entry.isDirectory()
          ? join(directory, entry.name, 'lablink.extension.json')
          : join(directory, entry.name);
        if (!manifestPath.endsWith('.json') || !existsSync(manifestPath)) continue;
        const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as ExtensionManifest;
        this.register(manifest);
      }
    }
  }

  list(): ExtensionManifest[] {
    return [...this.manifests.values()];
  }

  featureOverrides(): Partial<Record<FeatureFlag, boolean>> {
    const flags: Partial<Record<FeatureFlag, boolean>> = {};
    for (const manifest of this.manifests.values()) {
      Object.assign(flags, manifest.featureFlags);
    }
    return flags;
  }
}

export function createBuiltInExtensions(): ExtensionManifest[] {
  return [
    {
      id: 'lablink.wet-lab',
      name: 'Wet Lab Core',
      version: '0.1.0',
      labTypes: ['wet_lab', 'neuroscience', 'biology'],
      featureFlags: { animals: true, reagents: true, equipment: true, safety: true },
      projectTabs: [
        { id: 'animals', label: 'Animals', view: 'animals', featureFlag: 'animals' },
        { id: 'reagents', label: 'Reagents', view: 'reagents', featureFlag: 'reagents' },
        { id: 'equipment', label: 'Equipment', view: 'equipment', featureFlag: 'equipment' },
      ],
    },
    {
      id: 'lablink.computational',
      name: 'Computational Lab',
      version: '0.1.0',
      labTypes: ['computational', 'bioinformatics', 'ml'],
      featureFlags: { computational: true },
      customFields: [
        { entity: 'project', key: 'repo_url', label: 'Repository URL', type: 'url' },
        { entity: 'task', key: 'compute_target', label: 'Compute Target', type: 'string' },
      ],
    },
    {
      id: 'lablink.clinical',
      name: 'Clinical Research',
      version: '0.1.0',
      labTypes: ['clinical'],
      featureFlags: { clinical: true, safety: true },
      customFields: [
        { entity: 'project', key: 'irb_number', label: 'IRB Number', type: 'string' },
        { entity: 'task', key: 'phi_risk', label: 'PHI Risk', type: 'boolean' },
      ],
    },
    {
      id: 'lablink.core-facility',
      name: 'Core Facility',
      version: '0.1.0',
      labTypes: ['core_facility'],
      featureFlags: { equipment: true, budget: true },
      customFields: [
        { entity: 'equipment_booking', key: 'billing_code', label: 'Billing Code', type: 'string' },
      ],
    },
  ];
}

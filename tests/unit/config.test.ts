import { describe, expect, it } from 'vitest';
import { createDefaultConfig } from '../../src/config/defaults';
import { mergeConfig } from '../../src/config/loader';

describe('config merging', () => {
  it('merges nested config overrides without dropping defaults', () => {
    const config = mergeConfig(createDefaultConfig(), {
      lab: { name: 'Park Lab' },
      ai: { defaultProvider: 'openai' },
      features: { animals: false },
    });

    expect(config.lab.name).toBe('Park Lab');
    expect(config.lab.timezone).toBeTruthy();
    expect(config.ai.defaultProvider).toBe('openai');
    expect(config.ai.providers.openai?.model).toBeTruthy();
    expect(config.features.animals).toBe(false);
    expect(config.features.equipment).toBe(true);
  });
});

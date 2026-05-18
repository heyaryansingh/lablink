import { describe, expect, it } from 'vitest';
import { createBuiltInExtensions, ExtensionRegistry } from '../../src/extensions/registry';

describe('extension registry', () => {
  it('registers built-in lab modules and feature overrides', () => {
    const registry = new ExtensionRegistry();
    for (const manifest of createBuiltInExtensions()) registry.register(manifest);

    expect(registry.list().map((extension) => extension.id)).toContain('lablink.wet-lab');
    expect(registry.featureOverrides().animals).toBe(true);
    expect(registry.featureOverrides().equipment).toBe(true);
  });
});

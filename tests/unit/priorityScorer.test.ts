import { describe, expect, it } from 'vitest';
import { tierFromScore } from '../../src/ai/priorityScorer';
import { scoreToPriority } from '../../src/db/queries/tasks';

describe('priority tier mapping', () => {
  it('maps AI scores to PRD tiers', () => {
    expect(tierFromScore(0.95)).toBe('critical');
    expect(tierFromScore(0.7)).toBe('high');
    expect(tierFromScore(0.4)).toBe('medium');
    expect(tierFromScore(0.1)).toBe('low');
  });

  it('keeps db and ai tier mapping aligned', () => {
    for (const score of [0.9, 0.66, 0.35, 0.2]) {
      expect(scoreToPriority(score)).toBe(tierFromScore(score));
    }
  });
});

import type { TaskPriority } from '../core/types';
import type { AiClient } from './client';
import { PROMPTS } from './prompts';

export interface PriorityScore {
  score: number;
  tier: TaskPriority;
  reason: string;
}

export function tierFromScore(score: number): TaskPriority {
  if (score >= 0.85) return 'critical';
  if (score >= 0.65) return 'high';
  if (score >= 0.35) return 'medium';
  return 'low';
}

export async function scoreTaskPriority(
  ai: AiClient,
  task: unknown,
  context: Record<string, unknown> = {},
): Promise<PriorityScore> {
  const prompt = PROMPTS.PRIORITY_SCORING;
  const result = await ai.generateJson<PriorityScore>(
    {
      system: prompt.system,
      prompt: prompt.buildUserMessage(task, context),
      feature: 'priority_scoring',
      maxTokens: 1024,
      temperature: 0,
    },
    { score: 0.35, tier: 'medium', reason: 'Fallback score after AI parsing failed.' },
  );

  const score = Math.max(0, Math.min(1, Number(result.json.score) || 0));
  return {
    score,
    tier: result.json.tier ?? tierFromScore(score),
    reason: result.json.reason || 'No reason returned.',
  };
}

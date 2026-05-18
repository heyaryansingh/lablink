import type { AiClient } from './client';
import { PROMPTS } from './prompts';

export interface ExtractedTask {
  title: string;
  assigned_to_name: string | null;
  due_date: string | null;
  source_quote: string;
  confidence: number;
}

export async function extractTasksFromText(
  ai: AiClient,
  content: string,
  context: Record<string, unknown> = {},
): Promise<ExtractedTask[]> {
  const prompt = PROMPTS.TASK_EXTRACTION;
  const result = await ai.generateJson<ExtractedTask[]>(
    {
      system: prompt.system,
      prompt: prompt.buildUserMessage(content, context),
      feature: 'task_extraction',
      maxTokens: 2048,
      temperature: 0,
    },
    [],
  );
  return result.json.filter((task) => task.confidence > 0.7 && task.title?.trim());
}

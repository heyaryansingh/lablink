export const PROMPTS = {
  TASK_EXTRACTION: {
    system:
      'You are a lab operations assistant. Extract only concrete actionable commitments. Return strict JSON array only.',
    buildUserMessage(content: string, context: Record<string, unknown> = {}): string {
      return [
        'Extract actionable commitments from this text.',
        'A commitment is when someone says they will do something or when something is assigned.',
        'Return JSON array: [{"title":"...","assigned_to_name":"... or null","due_date":"YYYY-MM-DD or null","source_quote":"exact words","confidence":0.0}].',
        'Only include items with confidence > 0.7. Do not include vague statements or questions.',
        `Context: ${JSON.stringify(context)}`,
        `Text:\n${content}`,
      ].join('\n\n');
    },
  },
  PRIORITY_SCORING: {
    system:
      'You score lab task priority. Return strict JSON only with score, tier, and reason.',
    buildUserMessage(task: unknown, context: Record<string, unknown> = {}): string {
      return [
        'Score this task priority from 0.0 to 1.0.',
        'Consider due date, grant/compliance urgency, experiment dependencies, supervisor mentions, project risk, and blocked people.',
        'Return JSON: {"score":0.0,"tier":"critical|high|medium|low","reason":"..."}',
        `Task: ${JSON.stringify(task)}`,
        `Context: ${JSON.stringify(context)}`,
      ].join('\n\n');
    },
  },
  EMAIL_TAGGING: {
    system:
      'You match lab communications to active projects. Return strict JSON only.',
    buildUserMessage(projects: unknown[], item: unknown): string {
      return [
        'Given active projects and a communication item, determine the most relevant project if any.',
        'Return JSON: {"project_id":"... or null","confidence":0.0,"reason":"..."}',
        `Projects: ${JSON.stringify(projects)}`,
        `Item: ${JSON.stringify(item)}`,
      ].join('\n\n');
    },
  },
  MEETING_SUMMARY: {
    system:
      'You summarize research lab meetings into decisions, action items, risks, and project updates. Return concise markdown.',
    buildUserMessage(transcript: string): string {
      return `Summarize this transcript for lab operations:\n\n${transcript}`;
    },
  },
} as const;

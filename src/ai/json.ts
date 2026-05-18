export function parseJsonObject<T>(text: string, fallback: T): T {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1]?.trim() ?? trimmed;
  try {
    return JSON.parse(candidate) as T;
  } catch {
    const firstBrace = candidate.indexOf('{');
    const firstBracket = candidate.indexOf('[');
    const start = [firstBrace, firstBracket].filter((value) => value >= 0).sort((a, b) => a - b)[0];
    if (start === undefined) return fallback;
    const end = Math.max(candidate.lastIndexOf('}'), candidate.lastIndexOf(']'));
    if (end <= start) return fallback;
    try {
      return JSON.parse(candidate.slice(start, end + 1)) as T;
    } catch {
      return fallback;
    }
  }
}

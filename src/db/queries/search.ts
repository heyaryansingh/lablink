import type { LabLinkDatabase } from '../connection';

export interface SearchResult {
  entityType: string;
  entityId: string;
  content: string;
  rank: number;
}

export function searchAll(db: LabLinkDatabase, query: string, limit = 10): SearchResult[] {
  const normalized = query.trim();
  if (!normalized) return [];
  return db.raw
    .prepare(
      `
      SELECT entity_type AS entityType, entity_id AS entityId, content, rank
      FROM search_index
      WHERE search_index MATCH ?
      ORDER BY rank
      LIMIT ?
      `,
    )
    .all(normalized, limit) as SearchResult[];
}

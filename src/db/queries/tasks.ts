import type { TaskPriority } from '../../core/types';
import type { LabLinkDatabase } from '../connection';

export function markTaskDone(db: LabLinkDatabase, taskId: string): void {
  db.raw
    .prepare("UPDATE tasks SET status = 'done', completed_at = datetime('now'), updated_at = datetime('now') WHERE id = ?")
    .run(taskId);
}

export function scoreToPriority(score: number): TaskPriority {
  if (score >= 0.85) return 'critical';
  if (score >= 0.65) return 'high';
  if (score >= 0.35) return 'medium';
  return 'low';
}

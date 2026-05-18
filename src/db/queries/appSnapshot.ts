import type { AppSnapshot, FeatureFlag, InboxItem, LabUser, MeetingSummary, ProjectSummary, TaskSummary } from '../../core/types';
import type { LabLinkDatabase } from '../connection';

export function getAppSnapshot(db: LabLinkDatabase, featureFlags: Record<FeatureFlag, boolean>): AppSnapshot {
  return {
    currentUser: getCurrentUser(db),
    projects: getProjectSummaries(db),
    todayTasks: getTodayTasks(db),
    meetings: getMeetingSummaries(db),
    inbox: getInboxItems(db),
    featureFlags,
  };
}

export function getCurrentUser(db: LabLinkDatabase): LabUser {
  const row = db.raw.prepare('SELECT id, name, email, role, status FROM users ORDER BY created_at LIMIT 1').get() as LabUser | undefined;
  if (!row) {
    return {
      id: 'local-user',
      name: 'Lab User',
      email: 'user@example.edu',
      role: 'grad_student',
      status: 'active',
    };
  }
  return row;
}

export function getProjectSummaries(db: LabLinkDatabase): ProjectSummary[] {
  return db.raw
    .prepare(
      `
      SELECT
        p.id,
        p.name,
        p.description,
        p.status,
        p.color,
        p.icon,
        COUNT(t.id) AS totalTasks,
        SUM(CASE WHEN t.status = 'done' THEN 1 ELSE 0 END) AS completedTasks,
        MIN(d.due_date) AS nextDeadline
      FROM projects p
      LEFT JOIN tasks t ON t.project_id = p.id
      LEFT JOIN deadlines d ON d.project_id = p.id AND d.status IN ('upcoming', 'in_progress')
      GROUP BY p.id
      ORDER BY p.created_at
      `,
    )
    .all() as ProjectSummary[];
}

export function getTodayTasks(db: LabLinkDatabase): TaskSummary[] {
  return db.raw
    .prepare(
      `
      SELECT
        t.id,
        t.title,
        t.description,
        t.status,
        t.priority,
        t.due_date AS dueDate,
        p.name AS projectName,
        u.name AS assigneeName,
        t.source_type AS sourceType,
        t.source_quote AS sourceQuote,
        t.ai_priority_score AS aiPriorityScore,
        t.created_at AS createdAt
      FROM tasks t
      LEFT JOIN projects p ON p.id = t.project_id
      LEFT JOIN users u ON u.id = t.assigned_to
      WHERE t.status != 'cancelled'
      ORDER BY
        CASE t.priority
          WHEN 'critical' THEN 0
          WHEN 'high' THEN 1
          WHEN 'medium' THEN 2
          ELSE 3
        END,
        t.due_date IS NULL,
        t.due_date ASC,
        t.created_at DESC
      LIMIT 20
      `,
    )
    .all() as TaskSummary[];
}

export function getMeetingSummaries(db: LabLinkDatabase): MeetingSummary[] {
  return db.raw
    .prepare(
      `
      SELECT
        id,
        title,
        date,
        meeting_type AS meetingType,
        status,
        action_items_extracted AS actionItemsExtracted,
        summary
      FROM meetings
      ORDER BY date DESC
      LIMIT 10
      `,
    )
    .all()
    .map((row: any) => ({ ...row, actionItemsExtracted: Boolean(row.actionItemsExtracted) })) as MeetingSummary[];
}

export function getInboxItems(db: LabLinkDatabase): InboxItem[] {
  return db.raw
    .prepare(
      `
      SELECT
        i.id,
        i.source,
        i.source_id AS sourceId,
        i.subject,
        i.preview,
        i.from_label AS fromLabel,
        i.received_at AS receivedAt,
        i.unread,
        p.name AS projectName,
        i.confidence
      FROM inbox_items i
      LEFT JOIN projects p ON p.id = i.project_id
      WHERE i.archived_at IS NULL
      ORDER BY i.received_at DESC
      LIMIT 20
      `,
    )
    .all()
    .map((row: any) => ({ ...row, unread: Boolean(row.unread) })) as InboxItem[];
}

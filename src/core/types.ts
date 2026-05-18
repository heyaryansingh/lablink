export type UserRole =
  | 'pi'
  | 'postdoc'
  | 'grad_student'
  | 'technician'
  | 'undergrad'
  | 'collaborator';

export type ProjectStatus = 'active' | 'paused' | 'completed' | 'archived';
export type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'done' | 'cancelled' | 'needs_confirmation';
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';

export type FeatureFlag =
  | 'animals'
  | 'reagents'
  | 'equipment'
  | 'budget'
  | 'safety'
  | 'clinical'
  | 'computational'
  | 'zoom'
  | 'oauth'
  | 'ai'
  | 'extensions';

export interface LabUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'away' | 'inactive';
}

export interface ProjectSummary {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  color: string;
  icon: string;
  totalTasks: number;
  completedTasks: number;
  nextDeadline: string | null;
}

export interface TaskSummary {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  projectName: string | null;
  assigneeName: string | null;
  sourceType: string | null;
  sourceQuote: string | null;
  aiPriorityScore: number | null;
  createdAt: string;
}

export interface MeetingSummary {
  id: string;
  title: string;
  date: string;
  meetingType: string;
  status: string;
  actionItemsExtracted: boolean;
  summary: string | null;
}

export interface InboxItem {
  id: string;
  source: string;
  sourceId: string | null;
  subject: string;
  preview: string | null;
  fromLabel: string | null;
  receivedAt: string;
  unread: boolean;
  projectName: string | null;
  confidence: number | null;
}

export interface AppSnapshot {
  currentUser: LabUser;
  projects: ProjectSummary[];
  todayTasks: TaskSummary[];
  meetings: MeetingSummary[];
  inbox: InboxItem[];
  featureFlags: Record<FeatureFlag, boolean>;
}

export interface ViewContext {
  width: number;
  height: number;
  ascii: boolean;
}

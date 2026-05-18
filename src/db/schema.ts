import { sql } from 'drizzle-orm';
import { index, integer, primaryKey, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

const timestamps = {
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
};

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  role: text('role').notNull(),
  certifications: text('certifications').notNull().default('[]'),
  equipmentTrained: text('equipment_trained').notNull().default('[]'),
  avatarUrl: text('avatar_url'),
  status: text('status').notNull().default('active'),
  ...timestamps,
});

export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  status: text('status').notNull().default('active'),
  color: text('color').notNull().default('#4ee1a0'),
  icon: text('icon').notNull().default('P'),
  aiStatusSummary: text('ai_status_summary'),
  ...timestamps,
});

export const projectMembers = sqliteTable(
  'project_members',
  {
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: text('role').notNull(),
    effortPercent: integer('effort_percent').notNull().default(100),
    fundingSource: text('funding_source'),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.projectId, table.userId] }),
  }),
);

export const tasks = sqliteTable(
  'tasks',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id').references(() => projects.id, { onDelete: 'set null' }),
    assignedTo: text('assigned_to').references(() => users.id, { onDelete: 'set null' }),
    createdBy: text('created_by').references(() => users.id),
    title: text('title').notNull(),
    description: text('description'),
    status: text('status').notNull().default('todo'),
    priority: text('priority').notNull().default('medium'),
    dueDate: text('due_date'),
    completedAt: text('completed_at'),
    sourceType: text('source_type'),
    sourceId: text('source_id'),
    sourceQuote: text('source_quote'),
    dependsOn: text('depends_on').notNull().default('[]'),
    tags: text('tags').notNull().default('[]'),
    aiPriorityScore: real('ai_priority_score'),
    confidence: real('confidence'),
    customFields: text('custom_fields').notNull().default('{}'),
    ...timestamps,
  },
  (table) => ({
    projectIdx: index('idx_tasks_project').on(table.projectId),
    assignedIdx: index('idx_tasks_assigned').on(table.assignedTo),
    statusIdx: index('idx_tasks_status').on(table.status),
    dueIdx: index('idx_tasks_due').on(table.dueDate),
  }),
);

export const deadlines = sqliteTable('deadlines', {
  id: text('id').primaryKey(),
  projectId: text('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  type: text('type').notNull(),
  dueDate: text('due_date').notNull(),
  cascadeJson: text('cascade_json'),
  status: text('status').notNull().default('upcoming'),
  notes: text('notes'),
  ...timestamps,
});

export const documents = sqliteTable('documents', {
  id: text('id').primaryKey(),
  projectId: text('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  provider: text('provider').notNull(),
  externalUrl: text('external_url').notNull(),
  externalId: text('external_id'),
  mimeType: text('mime_type'),
  lastSyncedAt: text('last_synced_at'),
  lastModifiedAt: text('last_modified_at'),
  lastModifiedBy: text('last_modified_by'),
  tags: text('tags').notNull().default('[]'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
});

export const cages = sqliteTable('cages', {
  id: text('id').primaryKey(),
  cageNumber: text('cage_number').notNull().unique(),
  room: text('room'),
  rack: text('rack'),
  maxCapacity: integer('max_capacity').notNull().default(5),
  status: text('status').notNull().default('active'),
  protocolNumber: text('protocol_number'),
  notes: text('notes'),
  ...timestamps,
});

export const animals = sqliteTable(
  'animals',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id').references(() => projects.id, { onDelete: 'set null' }),
    identifier: text('identifier').notNull(),
    species: text('species').notNull(),
    strain: text('strain'),
    genotype: text('genotype'),
    sex: text('sex'),
    dateOfBirth: text('date_of_birth'),
    cageId: text('cage_id').references(() => cages.id, { onDelete: 'set null' }),
    status: text('status').notNull().default('active'),
    parents: text('parents').notNull().default('{}'),
    notes: text('notes'),
    customFields: text('custom_fields').notNull().default('{}'),
    ...timestamps,
  },
  (table) => ({
    cageIdx: index('idx_animals_cage').on(table.cageId),
    projectIdx: index('idx_animals_project').on(table.projectId),
  }),
);

export const procedures = sqliteTable(
  'procedures',
  {
    id: text('id').primaryKey(),
    animalId: text('animal_id')
      .notNull()
      .references(() => animals.id, { onDelete: 'cascade' }),
    projectId: text('project_id').references(() => projects.id),
    assignedTo: text('assigned_to').references(() => users.id),
    backupAssignedTo: text('backup_assigned_to').references(() => users.id),
    type: text('type').notNull(),
    scheduledDate: text('scheduled_date').notNull(),
    scheduledTime: text('scheduled_time'),
    status: text('status').notNull().default('scheduled'),
    preOpChecklist: text('pre_op_checklist').notNull().default('[]'),
    postOpNotes: text('post_op_notes'),
    results: text('results'),
    ...timestamps,
  },
  (table) => ({
    dateIdx: index('idx_procedures_date').on(table.scheduledDate),
    animalIdx: index('idx_procedures_animal').on(table.animalId),
  }),
);

export const experimentSteps = sqliteTable(
  'experiment_steps',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    assignedTo: text('assigned_to').references(() => users.id),
    stepOrder: integer('step_order').notNull(),
    plannedStart: text('planned_start'),
    plannedEnd: text('planned_end'),
    actualStart: text('actual_start'),
    actualEnd: text('actual_end'),
    durationDays: integer('duration_days'),
    dependsOnStepId: text('depends_on_step_id'),
    status: text('status').notNull().default('pending'),
    ...timestamps,
  },
  (table) => ({
    projectIdx: index('idx_experiment_steps_project').on(table.projectId),
  }),
);

export const reagents = sqliteTable('reagents', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  catalogNumber: text('catalog_number'),
  vendor: text('vendor'),
  lotNumber: text('lot_number'),
  quantityRemaining: real('quantity_remaining'),
  quantityUnit: text('quantity_unit'),
  expirationDate: text('expiration_date'),
  storageLocation: text('storage_location'),
  costPerUnit: real('cost_per_unit'),
  currency: text('currency').notNull().default('USD'),
  reorderThreshold: real('reorder_threshold'),
  status: text('status').notNull().default('in_stock'),
  linkedProjectIds: text('linked_project_ids').notNull().default('[]'),
  ...timestamps,
});

export const meetings = sqliteTable('meetings', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  meetingType: text('meeting_type').notNull().default('lab_meeting'),
  date: text('date').notNull(),
  durationMinutes: integer('duration_minutes'),
  attendees: text('attendees').notNull().default('[]'),
  absentees: text('absentees').notNull().default('[]'),
  transcript: text('transcript'),
  summary: text('summary'),
  actionItemsExtracted: integer('action_items_extracted', { mode: 'boolean' }).notNull().default(false),
  recordingPath: text('recording_path'),
  status: text('status').notNull().default('scheduled'),
  ...timestamps,
});

export const meetingSegments = sqliteTable(
  'meeting_segments',
  {
    id: text('id').primaryKey(),
    meetingId: text('meeting_id')
      .notNull()
      .references(() => meetings.id, { onDelete: 'cascade' }),
    projectId: text('project_id').references(() => projects.id),
    startTimeOffset: integer('start_time_offset'),
    endTimeOffset: integer('end_time_offset'),
    speaker: text('speaker'),
    content: text('content').notNull(),
    segmentType: text('segment_type'),
    createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  },
  (table) => ({
    meetingIdx: index('idx_meeting_segments_meeting').on(table.meetingId),
    projectIdx: index('idx_meeting_segments_project').on(table.projectId),
  }),
);

export const channels = sqliteTable('channels', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  projectId: text('project_id').references(() => projects.id, { onDelete: 'set null' }),
  channelType: text('channel_type').notNull().default('project'),
  description: text('description'),
  members: text('members').notNull().default('[]'),
  isArchived: integer('is_archived', { mode: 'boolean' }).notNull().default(false),
  ...timestamps,
});

export const messages = sqliteTable(
  'messages',
  {
    id: text('id').primaryKey(),
    channelId: text('channel_id')
      .notNull()
      .references(() => channels.id, { onDelete: 'cascade' }),
    senderId: text('sender_id')
      .notNull()
      .references(() => users.id),
    content: text('content').notNull(),
    replyTo: text('reply_to'),
    messageType: text('message_type').notNull().default('text'),
    attachments: text('attachments').notNull().default('[]'),
    reactions: text('reactions').notNull().default('{}'),
    isPinned: integer('is_pinned', { mode: 'boolean' }).notNull().default(false),
    aiDetectedDecision: text('ai_detected_decision'),
    aiDetectedTask: text('ai_detected_task'),
    ...timestamps,
  },
  (table) => ({
    channelIdx: index('idx_messages_channel').on(table.channelId),
    createdIdx: index('idx_messages_created').on(table.createdAt),
  }),
);

export const decisions = sqliteTable('decisions', {
  id: text('id').primaryKey(),
  projectId: text('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  decision: text('decision').notNull(),
  rationale: text('rationale'),
  participants: text('participants').notNull().default('[]'),
  sourceType: text('source_type'),
  sourceId: text('source_id'),
  date: text('date').notNull(),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
});

export const trainingRecords = sqliteTable('training_records', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  skill: text('skill').notNull(),
  trainedBy: text('trained_by').references(() => users.id),
  dateTrained: text('date_trained'),
  proficiency: text('proficiency').notNull().default('beginner'),
  certificationExpires: text('certification_expires'),
  notes: text('notes'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
});

export const expenses = sqliteTable(
  'expenses',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id').references(() => projects.id),
    grantId: text('grant_id'),
    description: text('description').notNull(),
    amount: real('amount').notNull(),
    currency: text('currency').notNull().default('USD'),
    category: text('category'),
    date: text('date').notNull(),
    vendor: text('vendor'),
    status: text('status').notNull().default('pending'),
    createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  },
  (table) => ({
    projectIdx: index('idx_expenses_project').on(table.projectId),
    grantIdx: index('idx_expenses_grant').on(table.grantId),
  }),
);

export const grants = sqliteTable('grants', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  grantNumber: text('grant_number'),
  funder: text('funder'),
  piId: text('pi_id').references(() => users.id),
  totalAmount: real('total_amount'),
  currency: text('currency').notNull().default('USD'),
  startDate: text('start_date'),
  endDate: text('end_date'),
  status: text('status').notNull().default('active'),
  linkedProjectIds: text('linked_project_ids').notNull().default('[]'),
  notes: text('notes'),
  ...timestamps,
});

export const safetyIncidents = sqliteTable('safety_incidents', {
  id: text('id').primaryKey(),
  reportedBy: text('reported_by').references(() => users.id),
  incidentType: text('incident_type'),
  severity: text('severity'),
  description: text('description').notNull(),
  location: text('location'),
  date: text('date').notNull(),
  resolution: text('resolution'),
  followUpActions: text('follow_up_actions').notNull().default('[]'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
});

export const equipment = sqliteTable('equipment', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  location: text('location'),
  status: text('status').notNull().default('available'),
  bookingRequired: integer('booking_required', { mode: 'boolean' }).notNull().default(false),
  trainedUsers: text('trained_users').notNull().default('[]'),
  maintenanceSchedule: text('maintenance_schedule'),
  lastMaintenance: text('last_maintenance'),
  notes: text('notes'),
  ...timestamps,
});

export const equipmentBookings = sqliteTable(
  'equipment_bookings',
  {
    id: text('id').primaryKey(),
    equipmentId: text('equipment_id')
      .notNull()
      .references(() => equipment.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    projectId: text('project_id').references(() => projects.id),
    startTime: text('start_time').notNull(),
    endTime: text('end_time').notNull(),
    status: text('status').notNull().default('confirmed'),
    notes: text('notes'),
    createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  },
  (table) => ({
    equipmentIdx: index('idx_equipment_bookings_equipment').on(table.equipmentId),
    timeIdx: index('idx_equipment_bookings_time').on(table.startTime),
  }),
);

export const inboxItems = sqliteTable(
  'inbox_items',
  {
    id: text('id').primaryKey(),
    source: text('source').notNull(),
    sourceId: text('source_id'),
    subject: text('subject').notNull(),
    preview: text('preview'),
    fromLabel: text('from_label'),
    body: text('body'),
    receivedAt: text('received_at').notNull(),
    unread: integer('unread', { mode: 'boolean' }).notNull().default(true),
    projectId: text('project_id').references(() => projects.id, { onDelete: 'set null' }),
    confidence: real('confidence'),
    archivedAt: text('archived_at'),
    rawJson: text('raw_json').notNull().default('{}'),
    createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  },
  (table) => ({
    receivedIdx: index('idx_inbox_received').on(table.receivedAt),
    projectIdx: index('idx_inbox_project').on(table.projectId),
  }),
);

export const integrationAccounts = sqliteTable('integration_accounts', {
  id: text('id').primaryKey(),
  provider: text('provider').notNull(),
  accountLabel: text('account_label').notNull(),
  scopes: text('scopes').notNull().default('[]'),
  tokenRef: text('token_ref').notNull(),
  expiresAt: text('expires_at'),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
  lastSyncAt: text('last_sync_at'),
  ...timestamps,
});

export const syncCursors = sqliteTable('sync_cursors', {
  id: text('id').primaryKey(),
  provider: text('provider').notNull(),
  resource: text('resource').notNull(),
  cursor: text('cursor'),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
});

export const zoomRecordings = sqliteTable('zoom_recordings', {
  id: text('id').primaryKey(),
  meetingId: text('meeting_id').references(() => meetings.id, { onDelete: 'set null' }),
  zoomMeetingId: text('zoom_meeting_id').notNull(),
  topic: text('topic'),
  startTime: text('start_time'),
  recordingUrl: text('recording_url'),
  transcriptUrl: text('transcript_url'),
  localTranscriptPath: text('local_transcript_path'),
  rawJson: text('raw_json').notNull().default('{}'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
});

export const aiRuns = sqliteTable('ai_runs', {
  id: text('id').primaryKey(),
  provider: text('provider').notNull(),
  model: text('model').notNull(),
  feature: text('feature').notNull(),
  promptHash: text('prompt_hash'),
  inputSummary: text('input_summary'),
  outputJson: text('output_json'),
  status: text('status').notNull(),
  error: text('error'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
});

export const extensionRecords = sqliteTable('extension_records', {
  id: text('id').primaryKey(),
  extensionId: text('extension_id').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  payload: text('payload').notNull().default('{}'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
});

export const customFieldDefinitions = sqliteTable('custom_field_definitions', {
  id: text('id').primaryKey(),
  entityType: text('entity_type').notNull(),
  key: text('key').notNull(),
  label: text('label').notNull(),
  fieldType: text('field_type').notNull(),
  required: integer('required', { mode: 'boolean' }).notNull().default(false),
  optionsJson: text('options_json').notNull().default('[]'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
});

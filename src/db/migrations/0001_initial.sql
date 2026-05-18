PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL,
  certifications TEXT NOT NULL DEFAULT '[]',
  equipment_trained TEXT NOT NULL DEFAULT '[]',
  avatar_url TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  color TEXT NOT NULL DEFAULT '#4ee1a0',
  icon TEXT NOT NULL DEFAULT 'P',
  ai_status_summary TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS project_members (
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  effort_percent INTEGER NOT NULL DEFAULT 100,
  funding_source TEXT,
  PRIMARY KEY (project_id, user_id)
);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  assigned_to TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_by TEXT REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo',
  priority TEXT NOT NULL DEFAULT 'medium',
  due_date TEXT,
  completed_at TEXT,
  source_type TEXT,
  source_id TEXT,
  source_quote TEXT,
  depends_on TEXT NOT NULL DEFAULT '[]',
  tags TEXT NOT NULL DEFAULT '[]',
  ai_priority_score REAL,
  confidence REAL,
  custom_fields TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due ON tasks(due_date);

CREATE TABLE IF NOT EXISTS deadlines (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  due_date TEXT NOT NULL,
  cascade_json TEXT,
  status TEXT NOT NULL DEFAULT 'upcoming',
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  provider TEXT NOT NULL,
  external_url TEXT NOT NULL,
  external_id TEXT,
  mime_type TEXT,
  last_synced_at TEXT,
  last_modified_at TEXT,
  last_modified_by TEXT,
  tags TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS cages (
  id TEXT PRIMARY KEY,
  cage_number TEXT NOT NULL UNIQUE,
  room TEXT,
  rack TEXT,
  max_capacity INTEGER NOT NULL DEFAULT 5,
  status TEXT NOT NULL DEFAULT 'active',
  protocol_number TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS animals (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  identifier TEXT NOT NULL,
  species TEXT NOT NULL,
  strain TEXT,
  genotype TEXT,
  sex TEXT,
  date_of_birth TEXT,
  cage_id TEXT REFERENCES cages(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active',
  parents TEXT NOT NULL DEFAULT '{}',
  notes TEXT,
  custom_fields TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_animals_cage ON animals(cage_id);
CREATE INDEX IF NOT EXISTS idx_animals_project ON animals(project_id);

CREATE TABLE IF NOT EXISTS procedures (
  id TEXT PRIMARY KEY,
  animal_id TEXT NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
  project_id TEXT REFERENCES projects(id),
  assigned_to TEXT REFERENCES users(id),
  backup_assigned_to TEXT REFERENCES users(id),
  type TEXT NOT NULL,
  scheduled_date TEXT NOT NULL,
  scheduled_time TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled',
  pre_op_checklist TEXT NOT NULL DEFAULT '[]',
  post_op_notes TEXT,
  results TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_procedures_date ON procedures(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_procedures_animal ON procedures(animal_id);

CREATE TABLE IF NOT EXISTS experiment_steps (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to TEXT REFERENCES users(id),
  step_order INTEGER NOT NULL,
  planned_start TEXT,
  planned_end TEXT,
  actual_start TEXT,
  actual_end TEXT,
  duration_days INTEGER,
  depends_on_step_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_experiment_steps_project ON experiment_steps(project_id);

CREATE TABLE IF NOT EXISTS reagents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  catalog_number TEXT,
  vendor TEXT,
  lot_number TEXT,
  quantity_remaining REAL,
  quantity_unit TEXT,
  expiration_date TEXT,
  storage_location TEXT,
  cost_per_unit REAL,
  currency TEXT NOT NULL DEFAULT 'USD',
  reorder_threshold REAL,
  status TEXT NOT NULL DEFAULT 'in_stock',
  linked_project_ids TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS meetings (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  meeting_type TEXT NOT NULL DEFAULT 'lab_meeting',
  date TEXT NOT NULL,
  duration_minutes INTEGER,
  attendees TEXT NOT NULL DEFAULT '[]',
  absentees TEXT NOT NULL DEFAULT '[]',
  transcript TEXT,
  summary TEXT,
  action_items_extracted INTEGER NOT NULL DEFAULT 0,
  recording_path TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS meeting_segments (
  id TEXT PRIMARY KEY,
  meeting_id TEXT NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  project_id TEXT REFERENCES projects(id),
  start_time_offset INTEGER,
  end_time_offset INTEGER,
  speaker TEXT,
  content TEXT NOT NULL,
  segment_type TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_meeting_segments_meeting ON meeting_segments(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_segments_project ON meeting_segments(project_id);

CREATE TABLE IF NOT EXISTS channels (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  channel_type TEXT NOT NULL DEFAULT 'project',
  description TEXT,
  members TEXT NOT NULL DEFAULT '[]',
  is_archived INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  channel_id TEXT NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  reply_to TEXT,
  message_type TEXT NOT NULL DEFAULT 'text',
  attachments TEXT NOT NULL DEFAULT '[]',
  reactions TEXT NOT NULL DEFAULT '{}',
  is_pinned INTEGER NOT NULL DEFAULT 0,
  ai_detected_decision TEXT,
  ai_detected_task TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_messages_channel ON messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);

CREATE TABLE IF NOT EXISTS decisions (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  decision TEXT NOT NULL,
  rationale TEXT,
  participants TEXT NOT NULL DEFAULT '[]',
  source_type TEXT,
  source_id TEXT,
  date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS training_records (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill TEXT NOT NULL,
  trained_by TEXT REFERENCES users(id),
  date_trained TEXT,
  proficiency TEXT NOT NULL DEFAULT 'beginner',
  certification_expires TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id),
  grant_id TEXT,
  description TEXT NOT NULL,
  amount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  category TEXT,
  date TEXT NOT NULL,
  vendor TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_expenses_project ON expenses(project_id);
CREATE INDEX IF NOT EXISTS idx_expenses_grant ON expenses(grant_id);

CREATE TABLE IF NOT EXISTS grants (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  grant_number TEXT,
  funder TEXT,
  pi_id TEXT REFERENCES users(id),
  total_amount REAL,
  currency TEXT NOT NULL DEFAULT 'USD',
  start_date TEXT,
  end_date TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  linked_project_ids TEXT NOT NULL DEFAULT '[]',
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS safety_incidents (
  id TEXT PRIMARY KEY,
  reported_by TEXT REFERENCES users(id),
  incident_type TEXT,
  severity TEXT,
  description TEXT NOT NULL,
  location TEXT,
  date TEXT NOT NULL,
  resolution TEXT,
  follow_up_actions TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS equipment (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'available',
  booking_required INTEGER NOT NULL DEFAULT 0,
  trained_users TEXT NOT NULL DEFAULT '[]',
  maintenance_schedule TEXT,
  last_maintenance TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS equipment_bookings (
  id TEXT PRIMARY KEY,
  equipment_id TEXT NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id),
  project_id TEXT REFERENCES projects(id),
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed',
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_equipment_bookings_equipment ON equipment_bookings(equipment_id);
CREATE INDEX IF NOT EXISTS idx_equipment_bookings_time ON equipment_bookings(start_time);

CREATE TABLE IF NOT EXISTS inbox_items (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  source_id TEXT,
  subject TEXT NOT NULL,
  preview TEXT,
  from_label TEXT,
  body TEXT,
  received_at TEXT NOT NULL,
  unread INTEGER NOT NULL DEFAULT 1,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  confidence REAL,
  archived_at TEXT,
  raw_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_inbox_source_item ON inbox_items(source, source_id);
CREATE INDEX IF NOT EXISTS idx_inbox_received ON inbox_items(received_at);
CREATE INDEX IF NOT EXISTS idx_inbox_project ON inbox_items(project_id);

CREATE TABLE IF NOT EXISTS integration_accounts (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  account_label TEXT NOT NULL,
  scopes TEXT NOT NULL DEFAULT '[]',
  token_ref TEXT NOT NULL,
  expires_at TEXT,
  enabled INTEGER NOT NULL DEFAULT 1,
  last_sync_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sync_cursors (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  resource TEXT NOT NULL,
  cursor TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS zoom_recordings (
  id TEXT PRIMARY KEY,
  meeting_id TEXT REFERENCES meetings(id) ON DELETE SET NULL,
  zoom_meeting_id TEXT NOT NULL,
  topic TEXT,
  start_time TEXT,
  recording_url TEXT,
  transcript_url TEXT,
  local_transcript_path TEXT,
  raw_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS ai_runs (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  feature TEXT NOT NULL,
  prompt_hash TEXT,
  input_summary TEXT,
  output_json TEXT,
  status TEXT NOT NULL,
  error TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS extension_records (
  id TEXT PRIMARY KEY,
  extension_id TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  payload TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS custom_field_definitions (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  key TEXT NOT NULL,
  label TEXT NOT NULL,
  field_type TEXT NOT NULL,
  required INTEGER NOT NULL DEFAULT 0,
  options_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE VIRTUAL TABLE IF NOT EXISTS search_index USING fts5(
  entity_type,
  entity_id,
  content,
  tokenize='porter'
);

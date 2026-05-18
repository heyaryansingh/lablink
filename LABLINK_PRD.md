# Lab Link — Product Requirements Document

**Version:** 1.0
**Date:** May 17, 2026
**Target:** Autonomous coding agent — every detail needed to build without human clarification

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Architecture & Tech Stack](#2-architecture--tech-stack)
3. [Installation & CLI Entry Point](#3-installation--cli-entry-point)
4. [Data Models](#4-data-models)
5. [Feature 1: Personal Command Center](#5-feature-1-personal-command-center)
6. [Feature 2: Project Hub](#6-feature-2-project-hub)
7. [Feature 3: Meeting Intelligence](#7-feature-3-meeting-intelligence)
8. [Feature 4: Communications](#8-feature-4-communications)
9. [Feature 5: AI Layer](#9-feature-5-ai-layer)
10. [TUI Design System](#10-tui-design-system)
11. [API & Integration Layer](#11-api--integration-layer)
12. [Configuration & Customization](#12-configuration--customization)
13. [File Structure](#13-file-structure)
14. [Build & Distribution](#14-build--distribution)
15. [Testing Strategy](#15-testing-strategy)

---

## 1. Product Overview

Lab Link is a terminal-based (TUI) platform that replaces the fragmented tool stack research labs use (Outlook, Slack, Google Drive, spreadsheets, sticky notes, whiteboards). It runs as a single binary invoked by typing `lablink` in the terminal, similar to how `claude` opens Claude Code.

### Core Principle

One data layer. Every feature feeds every other feature. A message updates a tracker. A meeting generates tasks. A task completion updates a progress board that feeds a status report.

### Target User

Research lab personnel: PIs, postdocs, grad students, technicians, undergrads, external collaborators. Labs with 3–30 members running 5–15 concurrent projects involving wet lab, computational, or clinical work.

---

## 2. Architecture & Tech Stack

### Runtime

| Component | Technology | Reason |
|-----------|-----------|--------|
| Language | **TypeScript** | Type safety, async/await, large ecosystem |
| Runtime | **Node.js ≥ 20** | Native fetch, stable ESM |
| TUI Framework | **Ink 5** (React for CLI) | Component model, hooks, flexbox layout in terminal |
| TUI Components | **ink-text-input**, **ink-select-input**, **ink-spinner**, **ink-table** | Standard Ink ecosystem |
| Rich Text/Markdown | **marked** + **marked-terminal** | Render markdown in terminal |
| Terminal Styling | **chalk 5** | 256-color and truecolor support |
| Box Drawing | **boxen**, **cli-table3** | Bordered panels and tables |
| Keyboard | **ink-use-keypress** + custom handlers | Vim-style and standard navigation |
| Local Database | **SQLite via better-sqlite3** | Zero-config, single-file, fast |
| ORM | **Drizzle ORM** | Type-safe, lightweight, SQLite-first |
| AI | **Anthropic SDK** (`@anthropic-ai/sdk`) | Claude Sonnet 4 for all AI features |
| Search | **MiniSearch** | In-process full-text search over local data |
| Date/Time | **date-fns** | Lightweight, tree-shakeable |
| Config | **cosmiconfig** | Standard config file discovery |
| Keychain | **keytar** | Secure credential storage for API keys/OAuth tokens |
| HTTP Client | **Native fetch** (Node 20) | For API integrations |
| WebSocket | **ws** | Real-time messaging |
| Process Manager | **pm2** (optional) | Background sync daemon |

### Data Storage

```
~/.lablink/
├── lablink.db            # SQLite database (all structured data)
├── config.toml           # User configuration
├── credentials.enc       # Encrypted API keys (via keytar)
├── cache/
│   ├── search_index.json # MiniSearch index
│   └── avatars/          # Cached user avatars
└── logs/
    └── lablink.log       # Rotating log file
```

### Client-Server Model

For single-user / single-lab: fully local SQLite + background sync daemon.
For multi-user: Lab Link server (Node.js + PostgreSQL + WebSocket) that the TUI client connects to.

This PRD specifies the TUI client with local SQLite. The server is a future phase but the data models and API interfaces are designed for it.

---

## 3. Installation & CLI Entry Point

### Installation

```bash
npm install -g @lablink/cli
```

This installs the `lablink` binary globally.

### Binary Entry Point

**File:** `src/cli.ts`

```typescript
#!/usr/bin/env node
import { program } from 'commander';

program
  .name('lablink')
  .version('1.0.0')
  .description('Lab management platform')
  .action(() => {
    // Default: launch full TUI
    import('./app.js').then(m => m.default());
  })
  .command('init')
  .description('Initialize a new lab workspace')
  .action(() => import('./commands/init.js').then(m => m.default()));

program.command('sync').description('Run sync daemon').action(/* ... */);
program.command('config').description('Edit configuration').action(/* ... */);
program.parse();
```

### `package.json` bin Field

```json
{
  "name": "@lablink/cli",
  "bin": {
    "lablink": "./dist/cli.js"
  }
}
```

### First Run — `lablink init`

Interactive setup wizard (Ink-based):

1. **Lab name** — text input, stored in config
2. **Your name and role** — text input + select (PI / Postdoc / Grad Student / Technician / Undergrad / Collaborator)
3. **Email integrations** — multi-select: Outlook (OAuth2), Gmail (OAuth2), None
4. **Cloud storage** — multi-select: Google Drive (OAuth2), OneDrive (OAuth2), Dropbox (OAuth2), None
5. **Calendar** — multi-select: Google Calendar, Outlook Calendar, None
6. **AI features** — prompt for Anthropic API key (stored via keytar)
7. **Create database** — initialize SQLite with schema

Output: `~/.lablink/config.toml` populated, database created, OAuth flows completed.

### Main App Launch — `lablink`

Opens the full TUI application. The main view is a sidebar + content area layout.

---

## 4. Data Models

All tables use UUID primary keys (generated via `crypto.randomUUID()`). Timestamps are ISO 8601 strings stored as TEXT in SQLite.

### Core Tables

```sql
-- Users / Lab Members
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK(role IN ('pi','postdoc','grad_student','technician','undergrad','collaborator')),
  certifications TEXT DEFAULT '[]',  -- JSON array of strings
  equipment_trained TEXT DEFAULT '[]',  -- JSON array of equipment IDs
  avatar_url TEXT,
  status TEXT DEFAULT 'active' CHECK(status IN ('active','away','inactive')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Projects
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK(status IN ('active','paused','completed','archived')),
  color TEXT DEFAULT '#4ee1a0',  -- hex color for UI
  icon TEXT DEFAULT '🧪',  -- emoji identifier
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Project Members (junction)
CREATE TABLE project_members (
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,  -- project-specific role, free text
  effort_percent INTEGER DEFAULT 100,  -- 0-100
  funding_source TEXT,
  PRIMARY KEY (project_id, user_id)
);

-- Tasks
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  assigned_to TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_by TEXT REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo' CHECK(status IN ('todo','in_progress','blocked','done','cancelled')),
  priority TEXT DEFAULT 'medium' CHECK(priority IN ('critical','high','medium','low')),
  due_date TEXT,  -- ISO date
  completed_at TEXT,
  source_type TEXT CHECK(source_type IN ('manual','meeting','email','message','ai')),
  source_id TEXT,  -- ID of meeting/email/message that generated this task
  source_quote TEXT,  -- exact quote that generated the task
  depends_on TEXT DEFAULT '[]',  -- JSON array of task IDs
  tags TEXT DEFAULT '[]',  -- JSON array of strings
  ai_priority_score REAL,  -- 0.0-1.0, computed by AI
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Deadlines (grants, submissions, compliance)
CREATE TABLE deadlines (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('grant_submission','paper_submission','conference_abstract','irb_renewal','iacuc_renewal','biosafety','training_cert','progress_report','custom')),
  due_date TEXT NOT NULL,
  cascade_json TEXT,  -- JSON: array of {title, offset_days, assigned_to, status}
  status TEXT DEFAULT 'upcoming' CHECK(status IN ('upcoming','in_progress','submitted','completed','overdue')),
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Documents (linked, not stored)
CREATE TABLE documents (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  provider TEXT NOT NULL CHECK(provider IN ('google_drive','onedrive','dropbox','sharepoint','benchling','local','url')),
  external_url TEXT NOT NULL,
  external_id TEXT,  -- provider-specific ID
  mime_type TEXT,
  last_synced_at TEXT,
  last_modified_at TEXT,  -- from provider
  last_modified_by TEXT,
  tags TEXT DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Animals / Colony
CREATE TABLE animals (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  identifier TEXT NOT NULL,  -- lab-specific ID like "M-2024-0147"
  species TEXT NOT NULL CHECK(species IN ('mouse','rat','other')),
  strain TEXT,
  genotype TEXT,
  sex TEXT CHECK(sex IN ('male','female','unknown')),
  date_of_birth TEXT,
  cage_id TEXT,
  status TEXT DEFAULT 'active' CHECK(status IN ('active','breeding','procedure_scheduled','post_op','sacrificed','transferred','deceased')),
  parents TEXT DEFAULT '{}',  -- JSON: {sire_id, dam_id}
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Cages
CREATE TABLE cages (
  id TEXT PRIMARY KEY,
  cage_number TEXT NOT NULL UNIQUE,  -- e.g. "4B-207"
  room TEXT,
  rack TEXT,
  max_capacity INTEGER DEFAULT 5,
  status TEXT DEFAULT 'active' CHECK(status IN ('active','quarantine','empty','decommissioned')),
  protocol_number TEXT,  -- IACUC protocol
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Procedures (scheduled on animals)
CREATE TABLE procedures (
  id TEXT PRIMARY KEY,
  animal_id TEXT NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
  project_id TEXT REFERENCES projects(id),
  assigned_to TEXT REFERENCES users(id),
  backup_assigned_to TEXT REFERENCES users(id),
  type TEXT NOT NULL,  -- "perfusion", "injection", "behavioral_test", etc.
  scheduled_date TEXT NOT NULL,
  scheduled_time TEXT,  -- HH:MM
  status TEXT DEFAULT 'scheduled' CHECK(status IN ('scheduled','in_progress','completed','cancelled','rescheduled')),
  pre_op_checklist TEXT DEFAULT '[]',  -- JSON array of {item, checked}
  post_op_notes TEXT,
  results TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Experiment Dependency Chains
CREATE TABLE experiment_steps (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to TEXT REFERENCES users(id),
  step_order INTEGER NOT NULL,
  planned_start TEXT,  -- ISO date
  planned_end TEXT,
  actual_start TEXT,
  actual_end TEXT,
  duration_days INTEGER,  -- estimated
  depends_on_step_id TEXT REFERENCES experiment_steps(id),
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending','active','completed','blocked','skipped')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Reagents / Supplies
CREATE TABLE reagents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  catalog_number TEXT,
  vendor TEXT,
  lot_number TEXT,
  quantity_remaining REAL,
  quantity_unit TEXT,  -- "ml", "mg", "ul", "units", "each"
  expiration_date TEXT,
  storage_location TEXT,
  cost_per_unit REAL,
  currency TEXT DEFAULT 'USD',
  reorder_threshold REAL,
  status TEXT DEFAULT 'in_stock' CHECK(status IN ('in_stock','low','out_of_stock','expired','on_order','backordered')),
  linked_project_ids TEXT DEFAULT '[]',  -- JSON array
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Meetings
CREATE TABLE meetings (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  meeting_type TEXT DEFAULT 'lab_meeting' CHECK(meeting_type IN ('lab_meeting','project_sync','journal_club','committee','one_on_one','other')),
  date TEXT NOT NULL,
  duration_minutes INTEGER,
  attendees TEXT DEFAULT '[]',  -- JSON array of user IDs
  absentees TEXT DEFAULT '[]',
  transcript TEXT,  -- full transcript
  summary TEXT,  -- AI-generated structured summary
  action_items_extracted INTEGER DEFAULT 0,  -- boolean flag
  recording_path TEXT,
  status TEXT DEFAULT 'scheduled' CHECK(status IN ('scheduled','in_progress','completed','cancelled')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Meeting Segments (sections of transcript linked to projects)
CREATE TABLE meeting_segments (
  id TEXT PRIMARY KEY,
  meeting_id TEXT NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  project_id TEXT REFERENCES projects(id),
  start_time_offset INTEGER,  -- seconds from start
  end_time_offset INTEGER,
  speaker TEXT,
  content TEXT NOT NULL,
  segment_type TEXT CHECK(segment_type IN ('discussion','decision','action_item','question','data_presentation','other')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Messages (built-in comms)
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  channel_id TEXT NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  reply_to TEXT REFERENCES messages(id),  -- thread parent
  message_type TEXT DEFAULT 'text' CHECK(message_type IN ('text','decision','handoff','system','ai_suggestion')),
  attachments TEXT DEFAULT '[]',  -- JSON array of {type, url, title}
  reactions TEXT DEFAULT '{}',  -- JSON: {emoji: [user_ids]}
  is_pinned INTEGER DEFAULT 0,
  ai_detected_decision TEXT,  -- AI-extracted decision text if applicable
  ai_detected_task TEXT,  -- AI-extracted task if applicable
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Channels
CREATE TABLE channels (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,  -- NULL for non-project channels
  channel_type TEXT DEFAULT 'project' CHECK(channel_type IN ('project','equipment','orders','journal_club','social','general','dm')),
  description TEXT,
  members TEXT DEFAULT '[]',  -- JSON array of user IDs (empty = all lab members)
  is_archived INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Decisions Log
CREATE TABLE decisions (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  decision TEXT NOT NULL,
  rationale TEXT,
  participants TEXT DEFAULT '[]',  -- JSON array of user IDs
  source_type TEXT CHECK(source_type IN ('meeting','message','manual')),
  source_id TEXT,
  date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Training Records
CREATE TABLE training_records (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill TEXT NOT NULL,  -- "perfusion", "confocal_microscopy", etc.
  trained_by TEXT REFERENCES users(id),
  date_trained TEXT,
  proficiency TEXT DEFAULT 'beginner' CHECK(proficiency IN ('beginner','intermediate','advanced','expert')),
  certification_expires TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Budget / Spending
CREATE TABLE expenses (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id),
  grant_id TEXT,  -- free text grant identifier
  description TEXT NOT NULL,
  amount REAL NOT NULL,
  currency TEXT DEFAULT 'USD',
  category TEXT CHECK(category IN ('reagents','equipment','animals','personnel','travel','publication','other')),
  date TEXT NOT NULL,
  vendor TEXT,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending','approved','ordered','received','cancelled')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Grants
CREATE TABLE grants (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  grant_number TEXT,
  funder TEXT,
  pi_id TEXT REFERENCES users(id),
  total_amount REAL,
  currency TEXT DEFAULT 'USD',
  start_date TEXT,
  end_date TEXT,
  status TEXT DEFAULT 'active' CHECK(status IN ('planned','submitted','active','no_cost_extension','completed','rejected')),
  linked_project_ids TEXT DEFAULT '[]',
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Safety Incidents
CREATE TABLE safety_incidents (
  id TEXT PRIMARY KEY,
  reported_by TEXT REFERENCES users(id),
  incident_type TEXT CHECK(incident_type IN ('spill','needle_stick','equipment_failure','near_miss','exposure','other')),
  severity TEXT CHECK(severity IN ('low','medium','high','critical')),
  description TEXT NOT NULL,
  location TEXT,
  date TEXT NOT NULL,
  resolution TEXT,
  follow_up_actions TEXT DEFAULT '[]',  -- JSON array
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Equipment
CREATE TABLE equipment (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  status TEXT DEFAULT 'available' CHECK(status IN ('available','in_use','maintenance','broken','decommissioned')),
  booking_required INTEGER DEFAULT 0,
  trained_users TEXT DEFAULT '[]',  -- JSON array of user IDs
  maintenance_schedule TEXT,  -- cron-like or descriptive
  last_maintenance TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Equipment Bookings
CREATE TABLE equipment_bookings (
  id TEXT PRIMARY KEY,
  equipment_id TEXT NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id),
  project_id TEXT REFERENCES projects(id),
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  status TEXT DEFAULT 'confirmed' CHECK(status IN ('confirmed','cancelled','completed')),
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Full-text search virtual table
CREATE VIRTUAL TABLE search_index USING fts5(
  entity_type,  -- 'task', 'message', 'meeting', 'document', 'decision', etc.
  entity_id,
  content,
  tokenize='porter'
);
```

### Indexes

```sql
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due ON tasks(due_date);
CREATE INDEX idx_messages_channel ON messages(channel_id);
CREATE INDEX idx_messages_created ON messages(created_at);
CREATE INDEX idx_animals_cage ON animals(cage_id);
CREATE INDEX idx_animals_project ON animals(project_id);
CREATE INDEX idx_procedures_date ON procedures(scheduled_date);
CREATE INDEX idx_procedures_animal ON procedures(animal_id);
CREATE INDEX idx_experiment_steps_project ON experiment_steps(project_id);
CREATE INDEX idx_expenses_project ON expenses(project_id);
CREATE INDEX idx_expenses_grant ON expenses(grant_id);
CREATE INDEX idx_equipment_bookings_equipment ON equipment_bookings(equipment_id);
CREATE INDEX idx_equipment_bookings_time ON equipment_bookings(start_time);
CREATE INDEX idx_meeting_segments_meeting ON meeting_segments(meeting_id);
CREATE INDEX idx_meeting_segments_project ON meeting_segments(project_id);
```

---

## 5. Feature 1: Personal Command Center

### 5.1 Unified Inbox View

**Screen:** Main view, first tab in sidebar

**Layout:**

```
┌─ Lab Link ─────────────────────────────────────────────────────────┐
│ ▸ Inbox (12)        │  INBOX                          May 17, 2026│
│   Outbox (3)        │                                             │
│   Today (7)         │  ● 10:32a  Outlook  Re: Antibody order      │
│                     │    From: supplier@abcam.com                 │
│ PROJECTS            │    → Project: Tau Pathology Study           │
│   🧪 Tau Pathology  │                                             │
│   🧬 CRISPR Screen  │  ● 10:15a  Lab Link  @you in #tau-path     │
│   🔬 Imaging Pipeline│    Jordan: "Western results are in"        │
│   📊 Behavioral     │    → Project: Tau Pathology Study           │
│                     │                                             │
│ CHANNELS            │  ○  9:48a  Calendar  Lab Meeting Tomorrow   │
│   # general         │    Weekly lab meeting, Conf Room 3          │
│   # equipment       │                                             │
│   # orders          │  ○  9:30a  Gmail  Collaboration inquiry     │
│   # journal-club    │    From: chen@stanford.edu                  │
│                     │    No project match — Assign?               │
│ QUICK ACTIONS       │                                             │
│   [n] New task      │  ○  Yesterday  Outlook  IRB amendment       │
│   [m] New message   │    From: irb@university.edu                 │
│   [/] Search        │    → Deadline: IRB Renewal (June 3)         │
│   [?] AI assistant  │                                             │
└─────────────────────┴─────────────────────────────────────────────┘
```

**Behavior:**

- Items sorted reverse-chronologically by default
- `●` = unread, `○` = read
- Each item shows: time, source (Outlook/Gmail/Calendar/Lab Link), subject/preview
- Auto-tagged items show `→ Project: [name]` beneath
- Untagged items from external sources show `No project match — Assign?`
- Press `Enter` on an item to expand full content in a detail pane
- Press `a` to assign/tag an item to a project
- Press `d` to dismiss/archive
- Press `r` to reply (opens compose for email, opens channel for messages)
- Press `t` to create a task from this item

**Data Sources (sync):**

- **Outlook:** Microsoft Graph API. OAuth2 with `Mail.Read`, `Mail.Send`, `Calendars.Read` scopes. Poll every 5 minutes via delta sync.
- **Gmail:** Google API. OAuth2 with `gmail.readonly`, `gmail.send`, `gmail.modify` scopes. Poll every 5 minutes via history ID.
- **Google Calendar:** Google API. OAuth2 with `calendar.readonly` scope. Poll every 15 minutes.
- **Lab Link internal:** Direct SQLite reads. Real-time via event emitter (local) or WebSocket (server mode).

**AI Auto-Tagging Logic:**

When a new email/message arrives, send to Claude:

```
System: You are a lab assistant. Given the user's active projects and their descriptions, determine which project (if any) this email/message is most relevant to. Return JSON: {"project_id": "..." or null, "confidence": 0.0-1.0, "reason": "..."}

Projects:
{list of active projects with IDs, names, descriptions, recent keywords}

New item:
Subject: {subject}
From: {sender}
Body: {first 500 chars}
```

Auto-tag if confidence > 0.8. Suggest if 0.5–0.8. Skip if < 0.5.

### 5.2 Outbox

**Screen:** Second sub-tab under Command Center

Shows all sent emails and messages, grouped by response status:

- **Awaiting reply** — sent items with no response, sorted by age (oldest first)
- **Replied** — items that received a response
- **No reply needed** — items you manually marked

Each item shows days since sent. Items > 3 days with no reply are highlighted yellow. Items > 7 days highlighted red.

Press `f` on an item to draft a follow-up. AI generates a contextual nudge:

```
System: Draft a brief, polite follow-up email. The original email was about {subject} sent {days} ago. Keep it under 3 sentences. Match the tone of the original.
```

### 5.3 AI To-Do / Today View

**Screen:** Third sub-tab, also accessible via `lablink today`

**Layout:**

```
┌─ TODAY — Saturday May 17 ──────────────────────────────────────────┐
│                                                                    │
│  🔴 CRITICAL                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ □ Submit R01 specific aims to Dr. Park for review            │  │
│  │   Due: Today · Grant: NIH R01-2024 · Source: Email May 14    │  │
│  │   [Enter] details  [x] done  [→] reassign  [s] snooze       │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  🟡 HIGH                                                           │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ □ Order anti-tau antibody (AT8) — backordered, check alt      │  │
│  │   Due: Mon · Project: Tau Pathology · Source: Meeting May 13  │  │
│  │   ⚠ Reagent alert: AT8 out of stock at Thermo                │  │
│  └──────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ □ Schedule perfusion for cohort 2 mice (n=8)                  │  │
│  │   Due: Tue · Project: Tau Pathology · Auto-assigned           │  │
│  │   🐁 Animals: M-2024-0147 through M-2024-0154                │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  🔵 MEDIUM                                                         │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ □ Run behavioral analysis on open field data                  │  │
│  │   Due: Fri · Project: Behavioral · Source: Meeting May 13     │  │
│  │   "I'll have the analysis done by Friday" — you, lab meeting  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ⚪ LOW                                                             │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ □ Update lab website with new publication                     │  │
│  │   No deadline · Project: none · Source: Manual                │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ── Completed today (3) ─────────────────────────────              │
│  ✓ Genotyping results for cage 4B-207           9:15 AM            │
│  ✓ Reply to Dr. Chen re: collaboration         10:02 AM            │
│  ✓ Update CRISPR screen tracker                10:45 AM            │
└────────────────────────────────────────────────────────────────────┘
```

**AI Priority Scoring:**

Every task gets a score 0.0–1.0, recalculated daily at midnight and on task creation.

```
System: Score this task's priority from 0.0 to 1.0. Consider:
- Days until due (0 days = highest urgency)
- Type: grant/compliance deadlines > experiment procedures > analysis > admin
- Downstream dependencies: how many other tasks/people are blocked
- Recency of PI/supervisor mentions of this task in meetings or messages
- Project status: tasks on at-risk projects get boosted

Task: {task JSON}
Project context: {project status, upcoming deadlines}
Recent mentions: {count and dates of related messages/meeting references}
Dependent tasks: {list of tasks that depend on this one}

Return JSON: {"score": 0.0-1.0, "tier": "critical|high|medium|low", "reason": "..."}
```

Thresholds: critical ≥ 0.85, high ≥ 0.65, medium ≥ 0.35, low < 0.35.

**Task Auto-Generation:**

Runs on every new email, message, and meeting transcript. Prompt:

```
System: Extract actionable commitments from this text. A commitment is when someone says they will do something, or when something is assigned to someone. Return JSON array:
[{"title": "...", "assigned_to_name": "...", "due_date": "YYYY-MM-DD or null", "source_quote": "exact words", "confidence": 0.0-1.0}]

Only include items with confidence > 0.7. Do not include vague statements or questions.
```

Tasks with confidence > 0.9 are created automatically with status `todo`. Tasks 0.7–0.9 are created with a `needs_confirmation` flag and shown in the Today view with a "Confirm?" prompt.

**Delegation Suggestions:**

When a new task is created for the current user, check if it better fits someone else:

```
System: Given this task and the lab members' roles, certifications, and current workload, should this task stay with {current_user} or be reassigned? Return JSON: {"reassign": true/false, "suggested_user_id": "..." or null, "reason": "..."}

Task: {task}
Current user workload: {count of active tasks, hours booked this week}
Lab members: {name, role, certifications, active task count, availability}
```

If `reassign: true`, show suggestion inline: "💡 This might be better for {name} ({reason}). Press [→] to reassign."

### 5.4 PI Dashboard

**Screen:** Accessible via sidebar item "Dashboard" (only shown to users with role `pi`)

**Layout:**

```
┌─ LAB DASHBOARD ────────────────────────────────────────────────────┐
│                                                                    │
│  PROJECTS AT A GLANCE                                              │
│  ┌──────────────────┬───────────┬──────────┬──────────────────┐   │
│  │ Project          │ Status    │ Tasks    │ Next Deadline    │   │
│  ├──────────────────┼───────────┼──────────┼──────────────────┤   │
│  │ 🧪 Tau Pathology │ ● On Track│ 12/18    │ R01 Jun 5        │   │
│  │ 🧬 CRISPR Screen │ ⚠ At Risk │  4/11    │ Paper draft Jul 1│   │
│  │ 🔬 Imaging       │ ● On Track│  8/10    │ Core booking May │   │
│  │ 📊 Behavioral    │ ● On Track│  6/9     │ Analysis May 23  │   │
│  └──────────────────┴───────────┴──────────┴──────────────────┘   │
│                                                                    │
│  PEOPLE                                                            │
│  Jordan (Postdoc)    ████████░░ 8 tasks  · Perfusion Tue          │
│  Alex (Grad)         ██████░░░░ 6 tasks  · Analysis due Fri       │
│  Sam (Tech)          ████░░░░░░ 4 tasks  · Genotyping today       │
│  Riley (Undergrad)   ██░░░░░░░░ 2 tasks  · Training: confocal    │
│                                                                    │
│  ⚠ ALERTS                                                          │
│  • CRISPR Screen: task completion 40% below average (2 wks)        │
│  • IACUC Protocol #2024-0089 expires June 15 — renewal not started │
│  • Reagent: AT8 antibody backordered, 3 experiments affected       │
│  • Equipment: Cryostat maintenance overdue by 2 weeks              │
│                                                                    │
│  UPCOMING WEEK                                                     │
│  Mon: Cohort 2 perfusions (Jordan) · AT8 order deadline            │
│  Tue: Lab meeting 2pm · Committee meeting (Alex) 4pm               │
│  Wed: Confocal booked 9a-12p (Sam) · Journal club 3pm             │
│  Thu: Behavioral testing cohort 3 (Alex)                           │
│  Fri: Grant aims draft due to co-PI                                │
└────────────────────────────────────────────────────────────────────┘
```

**Risk Detection AI:**

Runs daily. For each active project:

```
System: Analyze this project's health. Consider task completion rate (last 2 weeks vs previous 2 weeks), approaching deadlines, communication frequency (are people discussing it less?), blocked tasks, and overdue items. Return JSON:
{"status": "on_track|at_risk|critical", "reasons": ["..."], "suggestions": ["..."]}
```

---

## 6. Feature 2: Project Hub

### 6.1 Project List View

**Screen:** Sidebar section "PROJECTS", clicking any project opens it

**Layout when project is open:**

```
┌─ 🧪 Tau Pathology Study ──────────────────────────────────────────┐
│                                                                    │
│  [Overview] [Tasks] [Timeline] [People] [Animals] [Docs] [Chat]  │
│  ─────────────────────────────────────────────────────────────     │
│                                                                    │
│  {tab content renders here}                                        │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

Navigate tabs with `Tab`/`Shift+Tab` or number keys `1`–`7`.

### 6.2 Overview Tab

Shows: project description, status, key stats (total tasks, completion %, days until next deadline), recent activity feed (last 10 events across tasks/messages/meetings), and AI-generated one-paragraph status summary refreshed daily.

### 6.3 Tasks Tab (Kanban + Table + List views)

**Toggle view with `v`:** cycles through kanban → table → list

**Kanban Layout:**

```
│ TODO (5)          │ IN PROGRESS (3)    │ BLOCKED (1)       │ DONE (12)         │
│                   │                    │                   │                   │
│ ┌───────────────┐ │ ┌────────────────┐ │ ┌───────────────┐ │ ┌───────────────┐ │
│ │Order AT8      │ │ │Western blot    │ │ │Staining       │ │ │Genotyping     │ │
│ │@Jordan · Mon  │ │ │@Alex · ongoing │ │ │@Sam           │ │ │@Sam · May 15  │ │
│ │🔴 High        │ │ │🟡 Medium       │ │ │⛔ Waiting AT8  │ │ │               │ │
│ └───────────────┘ │ └────────────────┘ │ └───────────────┘ │ └───────────────┘ │
│ ┌───────────────┐ │ ┌────────────────┐ │                   │ ┌───────────────┐ │
│ │Schedule perf  │ │ │Behavioral test │ │                   │ │Cage setup     │ │
│ │@Jordan · Tue  │ │ │@Alex · Thu     │ │                   │ │@Riley · May 12│ │
│ │🟡 Medium      │ │ │🟡 Medium       │ │                   │ │               │ │
│ └───────────────┘ │ └────────────────┘ │                   │ └───────────────┘ │
```

**Interactions:**
- Arrow keys to navigate cards
- `Enter` to open task detail
- `m` to move task to next/previous column (cycles through statuses)
- `n` to create new task in current column
- `e` to edit task
- `/` to filter by assignee, tag, priority, or due date
- `s` to sort by priority, due date, or created date

**Table Layout:**

```
│ Status      │ Task                    │ Assigned │ Due      │ Priority │ Source      │
│─────────────│─────────────────────────│──────────│──────────│──────────│─────────────│
│ ○ Todo      │ Order AT8 antibody      │ Jordan   │ Mon 5/19 │ 🔴 High  │ Meeting 5/13│
│ ◐ Progress  │ Western blot analysis   │ Alex     │ —        │ 🟡 Med   │ Manual      │
│ ⛔ Blocked   │ Immunostaining          │ Sam      │ May 23   │ 🟡 Med   │ Auto-chain  │
│ ● Done      │ Genotyping cage 4B-207  │ Sam      │ May 15   │ 🔵 Low   │ Meeting 5/13│
```

### 6.4 Timeline Tab (Gantt-style)

Renders a horizontal timeline using Unicode box-drawing characters:

```
         May 12    May 19    May 26    Jun 2     Jun 9
         │         │         │         │         │
Genotype ████████──┤
Western  │    ▓▓▓▓▓▓▓▓▓▓▓──┤
Staining │              ░░░░░░░░░░░░──┤  (blocked — waiting AT8)
Imaging  │                        ████████──┤
Analysis │                                  ████████████──┤
                                                          ↑ R01 deadline
```

`█` = completed, `▓` = in progress, `░` = blocked/pending, `─` = scheduled but not started.

Dependency arrows shown with `│` and `┤` connections.

Press `Enter` on a step to edit dates. Shifting a step auto-shifts all dependents and prompts: "Shift downstream steps? [y/n]"

### 6.5 People Tab

Table of project members with:
- Name, role, effort %, funding source
- Active tasks count, completed tasks count
- Training status relevant to project (certified ✓ / needs training ✗)
- Last activity date

Press `a` to add member, `r` to remove, `e` to edit role/effort.

### 6.6 Animals Tab

**Layout:**

```
┌─ COLONY — Tau Pathology ───────────────────────────────────────────┐
│                                                                    │
│  CAGE MAP                                                          │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                    │
│  │4B-201│ │4B-202│ │4B-203│ │4B-204│ │4B-205│                    │
│  │🟢 3/5│ │🟡 5/5│ │🟢 2/5│ │🔴 SRG│ │🟢 4/5│                    │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘                    │
│  ┌──────┐ ┌──────┐ ┌──────┐                                       │
│  │4B-206│ │4B-207│ │4B-208│  🟢 Available  🟡 Full                │
│  │🟢 3/5│ │🔵 BRD│ │⚪ EMT│  🔴 Procedure  🔵 Breeding  ⚪ Empty  │
│  └──────┘ └──────┘ └──────┘                                       │
│                                                                    │
│  UPCOMING PROCEDURES                                               │
│  Mon 5/19  Perfusion × 4    Cage 4B-201  @Jordan  ● Confirmed     │
│  Mon 5/19  Perfusion × 4    Cage 4B-203  @Jordan  ● Confirmed     │
│  Thu 5/22  Behavioral test  Cage 4B-205  @Alex    ○ Unconfirmed   │
│                                                                    │
│  ALERTS                                                            │
│  ⚠ Cage 4B-202 at capacity (5/5) — wean or separate               │
│  ⚠ M-2024-0155 reaches 10-week milestone May 20                   │
│  ⚠ Genotyping pending for 4B-207 litter (born May 10)             │
│                                                                    │
│  [Enter] cage details  [n] new animal  [p] schedule procedure      │
└────────────────────────────────────────────────────────────────────┘
```

**Cage Detail (press Enter on a cage):**

```
┌─ Cage 4B-201 ──────────────────────────────────────────────────────┐
│  Room: BSB-142  │  Rack: A3  │  Protocol: IACUC-2024-0089         │
│  Status: Active │  Occupancy: 3/5                                  │
│                                                                    │
│  ANIMALS                                                           │
│  ┌────────────────┬────────┬──────────┬──────┬──────────────────┐  │
│  │ ID             │ Sex    │ Genotype │ Age  │ Status           │  │
│  ├────────────────┼────────┼──────────┼──────┼──────────────────┤  │
│  │ M-2024-0147    │ Male   │ APP/PS1+ │ 8w2d │ Perf sched 5/19 │  │
│  │ M-2024-0148    │ Male   │ APP/PS1+ │ 8w2d │ Perf sched 5/19 │  │
│  │ M-2024-0149    │ Female │ APP/PS1- │ 8w2d │ Active (control) │  │
│  └────────────────┴────────┴──────────┴──────┴──────────────────┘  │
│                                                                    │
│  HISTORY                                                           │
│  May 10: Transferred from breeding cage 4B-207                     │
│  May 12: Genotyping completed — results entered                    │
│  May 13: Assigned to Tau Pathology cohort 2                        │
│                                                                    │
│  [e] edit cage  [a] add animal  [t] transfer animal  [Esc] back    │
└────────────────────────────────────────────────────────────────────┘
```

### 6.7 Documents Tab

Lists all linked documents, grouped by type (protocols, data, manuscripts, grants, other).

```
│ Type       │ Title                          │ Provider     │ Modified    │ By       │
│────────────│────────────────────────────────│──────────────│─────────────│──────────│
│ Protocol   │ Perfusion Protocol v3          │ Google Drive │ May 10      │ Jordan   │
│ Protocol   │ IHC Staining - Tau (AT8)       │ Google Drive │ Apr 28      │ Sam      │
│ Data       │ Cohort 1 - Behavioral Raw      │ Google Drive │ May 15      │ Alex     │
│ Manuscript │ Tau paper draft v2             │ Google Drive │ May 8       │ Dr. Park │
│ Grant      │ R01 Specific Aims              │ OneDrive     │ May 14      │ Dr. Park │
```

Press `Enter` to open link in default browser. Press `a` to add a document link (paste URL, auto-detects provider). Press `t` to tag/categorize.

### 6.8 Chat Tab

Opens the project-bound channel. See Section 8 for messaging details.

---

## 7. Feature 3: Meeting Intelligence

### 7.1 Meeting Capture

**Initiate:** From sidebar, "MEETINGS" section, press `n` for new meeting or select a scheduled meeting and press `s` to start capture.

Lab Link does not do audio recording/transcription directly in the terminal. Instead, it integrates:

**Option A — Paste transcript:** User pastes transcript from Otter.ai, Granola, Zoom transcription, or any other source. Lab Link processes it.

**Option B — API integration:** Connect to Otter.ai API, Granola API, or Zoom API to auto-pull transcripts when a meeting ends.

**Option C — Manual notes:** User types notes during the meeting in a structured editor.

For MVP, implement Option A (paste) and Option C (manual notes). Option B is future.

**Meeting Creation Screen:**

```
┌─ NEW MEETING ──────────────────────────────────────────────────────┐
│                                                                    │
│  Title: [Weekly Lab Meeting                    ]                   │
│  Type:  [Lab Meeting ▾]                                            │
│  Date:  [2026-05-17]    Duration: [90] min                         │
│                                                                    │
│  Attendees:                                                        │
│  [x] Dr. Park (PI)                                                 │
│  [x] Jordan (Postdoc)                                              │
│  [x] Alex (Grad)                                                   │
│  [x] Sam (Tech)                                                    │
│  [ ] Riley (Undergrad) — absent                                    │
│                                                                    │
│  Projects Discussed:                                               │
│  [x] 🧪 Tau Pathology                                              │
│  [x] 📊 Behavioral                                                 │
│  [ ] 🧬 CRISPR Screen                                              │
│  [ ] 🔬 Imaging Pipeline                                           │
│                                                                    │
│  [p] Paste transcript  [t] Type notes  [Enter] Start               │
└────────────────────────────────────────────────────────────────────┘
```

### 7.2 Transcript Processing

When a transcript is pasted or notes are entered, AI processes it in stages:

**Stage 1 — Segmentation:**

```
System: Segment this lab meeting transcript by project/topic discussed. For each segment identify the project it relates to (from the provided project list), the speakers, and whether it contains decisions, action items, data discussion, or general discussion. Return JSON array:
[{
  "project_name": "...",
  "project_id": "..." or null,
  "speakers": ["..."],
  "content_summary": "...",
  "segment_type": "discussion|decision|action_item|data_presentation|question",
  "key_points": ["..."],
  "raw_text": "exact transcript segment"
}]

Projects: {list with IDs}
Transcript: {full text}
```

**Stage 2 — Action Item Extraction:**

```
System: Extract every actionable commitment from these meeting segments. A commitment is when someone explicitly or implicitly agrees to do something, or when a task is assigned. For each, include the exact quote. Return JSON:
[{
  "title": "...",
  "assigned_to_name": "...",
  "due_date": "YYYY-MM-DD" or null,
  "project_id": "...",
  "source_quote": "exact words from transcript",
  "confidence": 0.0-1.0
}]
```

**Stage 3 — Decision Extraction:**

```
System: Extract all decisions made in this meeting. A decision is when the group agrees on a course of action, a parameter, a timeline, or rejects an alternative. Return JSON:
[{
  "decision": "...",
  "rationale": "...",
  "project_id": "...",
  "participants": ["names who were part of the decision"],
  "source_quote": "..."
}]
```

**Stage 4 — Project Tracker Updates:**

```
System: Given the meeting discussion and the current state of each project's task board, determine which existing tasks should be updated. Return JSON:
[{
  "task_id": "...",
  "new_status": "...",
  "notes": "...",
  "source_quote": "..."
}]

Current tasks: {list of tasks per project with IDs and statuses}
Meeting segments: {from Stage 1}
```

**Stage 5 — Summary Generation:**

```
System: Generate a structured meeting summary organized by project. For each project section include: key discussion points, decisions made, action items with owners and deadlines, open questions, and data/results mentioned. Also include a "General" section for non-project items. Format as markdown.
```

### 7.3 Post-Meeting Review

After processing, the user sees a review screen:

```
┌─ MEETING REVIEW — Lab Meeting May 17 ─────────────────────────────┐
│                                                                    │
│  TASKS DETECTED (5)                                    [a] approve │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ ✓ Order AT8 antibody → Jordan, due Mon                       │  │
│  │   "I'll get the antibody ordered by Monday" — Jordan          │  │
│  │                                                               │  │
│  │ ✓ Run open field analysis → Alex, due Fri                     │  │
│  │   "I'll have the analysis done by Friday" — Alex              │  │
│  │                                                               │  │
│  │ ? Schedule confocal time → Sam, no date                       │  │
│  │   "We need to book the confocal soon" — Dr. Park              │  │
│  │   [y] confirm  [e] edit  [x] reject                           │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  DECISIONS LOGGED (2)                                              │
│  • Use 10x concentration for staining (Tau Pathology)              │
│  • Switch to new perfusion protocol v3 (Tau Pathology)             │
│                                                                    │
│  TRACKER UPDATES (3)                                               │
│  • Western blot → Done (was: In Progress)                          │
│  • Genotyping 4B-207 → Done (was: Todo)                            │
│  • Cohort 2 setup → In Progress (was: Todo)                        │
│                                                                    │
│  [a] Approve all  [r] Review individually  [e] Edit summary        │
└────────────────────────────────────────────────────────────────────┘
```

`a` approves all detected items. `r` steps through each for individual approve/edit/reject. Creates all tasks, logs decisions, updates trackers.

### 7.4 Follow-Up Automation

**Nudge system:** Background job runs daily at 9 AM local time.

For every task created from a meeting:
- If due date has passed and status is still `todo`: send message in project channel: "Reminder: {task title} was due {date} (from {meeting title}). @{assignee} — update status?"
- If due date is tomorrow and status is `todo`: send gentle reminder: "Heads up: {task title} is due tomorrow."

**"Since Last Time" Brief:**

When a new meeting is created for the same type (e.g., next weekly lab meeting), auto-generate:

```
System: Generate a brief "since last meeting" summary. Cover: tasks that were assigned last meeting and their current status, deadlines that passed or are approaching, new developments in each project since last meeting date. Keep it concise — bullet points, no fluff.

Last meeting: {date, action items with current status}
Project activity since: {tasks completed, messages sent, documents modified}
Upcoming deadlines: {next 2 weeks}
```

Display at the top of the meeting screen when the user opens it.

---

## 8. Feature 4: Communications

### 8.1 Channel List

Shown in sidebar under "CHANNELS". Channels with unread messages show count badge.

**Auto-created channels:**
- Every new project creates `#project-{slug}` channel with all project members
- Default channels created on `lablink init`: `#general`, `#equipment`, `#orders`, `#journal-club`, `#random`

### 8.2 Message View

**Layout:**

```
┌─ #tau-pathology ──────────────────────────── 4 members ─ 2 online ─┐
│                                                                     │
│  ── May 17, 2026 ──                                                 │
│                                                                     │
│  Jordan  10:15 AM                                                   │
│  Western results are in — all bands look clean. AT8 shows strong    │
│  signal at 1:500. Ready to move to full cohort staining.            │
│  📎 western_results_052026.tif (Google Drive)                       │
│                                                                     │
│    Alex  10:18 AM                                                   │
│    Nice! What was the exposure time?                                │
│                                                                     │
│    Jordan  10:20 AM                                                 │
│    30 seconds for chemiluminescence. I'll add it to the protocol.   │
│                                                                     │
│  💡 Decision detected: "AT8 at 1:500 for full cohort staining"      │
│     [y] Log to project  [n] Dismiss                                 │
│                                                                     │
│  Dr. Park  10:32 AM                                                 │
│  Great work. @Sam can you check AT8 stock? We need enough for       │
│  80 sections.                                                       │
│                                                                     │
│  💡 Task detected: "Check AT8 stock" → @Sam                         │
│     [y] Create task  [e] Edit  [n] Dismiss                          │
│                                                                     │
│──────────────────────────────────────────────────────────────────── │
│  > [Type message... ]                              [Ctrl+Enter] Send│
└─────────────────────────────────────────────────────────────────────┘
```

**Features:**
- Messages render with sender name, timestamp, content
- Threaded replies indented with `│` prefix
- File links show inline preview line with provider icon
- AI detection prompts appear inline (decisions and tasks)
- `@mention` autocomplete triggered by typing `@`
- `#channel` links triggered by typing `#`
- Cage ID pattern (`\d+[A-Z]-\d+`) auto-links to cage record
- Press `p` to pin a message
- Press `r` to reply in thread
- Press `e` on own messages to edit

**@LabLink AI Assistant:**

Type `@lablink` followed by a question:

```
> @lablink when did we last run the open field test?
```

AI searches across: tasks, meeting transcripts, messages, project records, experiment steps, animal records. Returns answer with source citations:

```
  🤖 LabLink  10:45 AM
  The last open field test was run on May 8, 2026 for the Behavioral
  project, cohort 1 (n=12). Results were discussed in the May 13 lab
  meeting — Alex reported that the TG group showed increased thigmotaxis.
  Source: meeting transcript, task #BEH-034
```

AI query prompt:

```
System: You are a lab assistant with access to this lab's complete records. Answer the question using only the provided data. Cite specific sources (meeting dates, task IDs, message timestamps). If the answer isn't in the data, say so.

Question: {user's question}

Data (search results from SQLite FTS):
{top 10 matching records across all tables}
```

### 8.3 Structured Handoff Messages

In channels, press `h` to create a handoff:

```
┌─ HANDOFF — Animal Monitoring ──────────────────────────────────────┐
│                                                                    │
│  Shift: [Morning ▾]    Date: [2026-05-17]                          │
│                                                                    │
│  Animals Checked:                                                  │
│  [x] Cage 4B-204 (post-op day 2)                                  │
│      Vitals: [Normal ▾]  Pain Score: [1/4]                         │
│      Notes: [Eating well, incision clean, no swelling     ]        │
│                                                                    │
│  [x] Cage 4B-201 (pre-op)                                         │
│      Vitals: [Normal ▾]  Notes: [All normal               ]       │
│                                                                    │
│  Concerns: [None                                          ]        │
│  Next Steps: [Continue monitoring 4B-204, check again 6pm ]        │
│                                                                    │
│  [Enter] Post handoff to channel + update animal records           │
└────────────────────────────────────────────────────────────────────┘
```

Posts formatted handoff to channel and updates animal records automatically.

### 8.4 Smart Channel Integrations

**#equipment channel:**
- Posting "cryostat is down" triggers: status update to equipment record, notification to all users with upcoming cryostat bookings, AI suggestion to reschedule affected experiments
- Press `b` to book equipment: shows available slots, creates booking record

**#orders channel:**
- Press `o` to create structured order request:
  - Item name, catalog #, vendor, quantity, unit price, account/grant to charge
  - Auto-creates expense record
  - Links to relevant project and reagent record
- AI monitors and flags duplicate orders across projects

---

## 9. Feature 5: AI Layer

All AI features use the Anthropic SDK with Claude Sonnet 4.

### 9.1 Configuration

```toml
# ~/.lablink/config.toml
[ai]
model = "claude-sonnet-4-20250514"
max_tokens = 4096
auto_task_creation = true           # auto-create tasks from meetings/messages
auto_task_threshold = 0.9           # confidence threshold for auto (vs suggest)
auto_decision_detection = true      # detect decisions in messages
daily_priority_recalc = true        # recalculate task priorities daily
daily_risk_scan = true              # run project risk detection daily
knowledge_graph_enabled = true      # build knowledge graph over time
```

### 9.2 Knowledge Graph

**Storage:** Dedicated tables:

```sql
CREATE TABLE knowledge_entries (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL CHECK(category IN ('protocol_tip','troubleshooting','vendor_info','equipment_quirk','institutional_process','technique','reagent_note','general')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  source_type TEXT,  -- 'meeting', 'message', 'manual'
  source_id TEXT,
  confidence REAL DEFAULT 1.0,
  tags TEXT DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

**Population:** After every meeting and every N messages (configurable, default 50), run:

```
System: Extract any institutional knowledge, tips, troubleshooting insights, vendor information, or technique notes from this content. Only extract things that would be useful for a new lab member to know, or that represent learned experience. Return JSON:
[{"category": "...", "title": "...", "content": "...", "tags": ["..."]}]

Content: {meeting transcript or message batch}
Existing knowledge (to avoid duplicates): {titles of last 50 entries}
```

### 9.3 Grant Draft Accelerator

**Access:** From a project, press `g` for "Generate Grant Section"

```
┌─ GRANT DRAFT ──────────────────────────────────────────────────────┐
│                                                                    │
│  Project: Tau Pathology Study                                      │
│  Grant: NIH R01                                                    │
│                                                                    │
│  Generate section:                                                 │
│  [1] Specific Aims                                                 │
│  [2] Significance & Innovation                                     │
│  [3] Preliminary Data Summary                                      │
│  [4] Research Plan / Timeline                                      │
│  [5] Personnel Justification                                       │
│  [6] Budget Justification                                          │
│  [7] Progress Report (for renewals)                                │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

Each section pulls from project data:

- **Specific Aims:** Project description, goals, milestones, decisions
- **Preliminary Data:** Completed experiment steps, linked data documents, meeting segments tagged as `data_presentation`
- **Timeline:** Experiment steps with actual durations, projected remaining work
- **Personnel:** Project members with roles, effort, certifications
- **Budget:** Historical expenses on this project, reagent costs, equipment usage
- **Progress Report:** Completed milestones, publications, tasks marked done with dates

Output rendered as markdown in a scrollable pane. Press `c` to copy to clipboard. Press `e` to export as `.md` file.

### 9.4 Protocol Optimization

**Access:** From AI menu (`?` → `Protocol Analysis`)

```
System: Analyze all experiment records for {protocol/assay type} in this lab. Identify patterns in success/failure, optimal conditions, common issues. Use only the provided data. Return JSON:
{
  "total_runs": N,
  "success_rate": 0.0-1.0,
  "optimal_conditions": [{"parameter": "...", "optimal_value": "...", "evidence": "..."}],
  "common_failures": [{"pattern": "...", "frequency": N, "suggestion": "..."}],
  "trends": ["..."]
}

Records: {experiment steps, procedure records, meeting segments, messages mentioning this assay}
```

### 9.5 Predictive Scheduling

When creating a new experiment plan, AI estimates realistic timelines:

```
System: Based on historical task completion data in this lab, estimate realistic duration for each step. The protocol says {X days} but actual lab performance may differ. Return JSON:
[{"step": "...", "protocol_estimate_days": N, "predicted_actual_days": N, "confidence": 0.0-1.0, "reasoning": "..."}]

Historical data: {average time between task creation and completion for similar tasks, grouped by type}
New experiment plan: {list of steps with protocol-estimated durations}
```

### 9.6 Compliance Autopilot

**Background job:** Runs daily. Checks:

1. All `deadlines` with type `iacuc_renewal`, `irb_renewal`, `biosafety`, `training_cert`
2. If due date is within 60 days and status is `upcoming`: alert PI + create cascade tasks
3. If due date is within 30 days and cascade tasks are incomplete: escalate alert
4. If due date has passed: critical alert

**Auto-generated renewal draft:**

```
System: Draft an IACUC protocol renewal based on the current project data. Include: species used, animal counts (current colony size from cage/animal records), procedures performed (from procedure records), any protocol modifications needed based on actual practice vs. original protocol. Format as a structured document.

Protocol data: {original protocol info from deadlines table}
Current colony: {animal counts, cages, procedures performed in last year}
```

### 9.7 Collaboration Matching

Only relevant in multi-user server mode. Runs weekly:

```
System: Identify potential collaboration opportunities across these labs based on shared model systems, techniques, reagents, or research interests. Only suggest high-confidence matches. Return JSON:
[{"lab_a": "...", "lab_b": "...", "match_type": "...", "details": "...", "confidence": 0.0-1.0}]

Lab data: {anonymized project descriptions, techniques used, model systems, reagents ordered}
```

### 9.8 Budget Intelligence

**Access:** From sidebar "Budget" or from a grant detail view.

```
┌─ BUDGET — NIH R01-2024-1234 ──────────────────────────────────────┐
│                                                                    │
│  Total: $250,000  │  Spent: $95,000 (38%)  │  Remaining: $155,000 │
│  Period: Jul 2024 – Jun 2026  │  Elapsed: 56%                     │
│                                                                    │
│  ⚠ Spending pace: 38% spent with 56% of time elapsed.             │
│    At current rate, $62,000 will be unspent at end of period.      │
│    Consider: accelerating supply orders or adding personnel.       │
│                                                                    │
│  BY CATEGORY                                                       │
│  Reagents    ████████████░░░░░░░░  $42,000 / $80,000              │
│  Equipment   ██████░░░░░░░░░░░░░░  $18,000 / $50,000              │
│  Personnel   ████████████████░░░░  $28,000 / $35,000              │
│  Animals     ████░░░░░░░░░░░░░░░░   $5,000 / $25,000              │
│  Travel      ██░░░░░░░░░░░░░░░░░░   $2,000 / $10,000              │
│                                                                    │
│  RECENT EXPENSES                                                   │
│  May 15  Abcam — AT8 antibody (×2)          $580    Reagents       │
│  May 12  Jackson Labs — 12 APP/PS1 mice     $3,600  Animals        │
│  May 10  Thermo — secondary antibodies       $420    Reagents       │
│                                                                    │
│  [a] Add expense  [e] Export report  [Esc] Back                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## 10. TUI Design System

### 10.1 Color Palette

```typescript
const colors = {
  bg: '#0a0c10',
  surface: '#12151c',
  surface2: '#1a1e28',
  border: '#252a36',
  text: '#e2e4e9',
  textDim: '#8b90a0',
  textMuted: '#555a6e',
  accent: '#4ee1a0',       // green — primary actions, success, on-track
  accentDim: '#1a3d2e',
  accent2: '#7b93ff',      // blue — info, links, secondary
  accent3: '#ff7b93',      // red/pink — errors, critical, overdue
  accent4: '#ffd97b',      // yellow — warnings, at-risk
  white: '#ffffff',
};
```

### 10.2 Typography in Terminal

- **Headers:** `chalk.bold()` — ALL CAPS for section headers, Title Case for sub-headers
- **Labels:** `chalk.hex(colors.textDim)` — dimmed for metadata
- **Values:** `chalk.hex(colors.text)` — standard brightness for content
- **Emphasis:** `chalk.hex(colors.accent)` — green for actionable items
- **Errors/Critical:** `chalk.hex(colors.accent3)` — red for overdue/errors
- **Warnings:** `chalk.hex(colors.accent4)` — yellow for at-risk
- **Timestamps:** `chalk.hex(colors.textMuted)` — very dim

### 10.3 Box Drawing

Use `boxen` for framed panels:

```typescript
import boxen from 'boxen';

boxen(content, {
  padding: 1,
  margin: { top: 0, bottom: 1, left: 0, right: 0 },
  borderStyle: 'round',       // rounded corners
  borderColor: colors.border,
  title: 'Section Title',
  titleAlignment: 'left',
});
```

For inline borders and separators, use Unicode box-drawing:
- `─` horizontal line
- `│` vertical line / thread indicator
- `┌ ┐ └ ┘` corners
- `├ ┤ ┬ ┴ ┼` intersections
- `▸` active sidebar item
- `○ ◐ ● ⛔ ✓` status indicators

### 10.4 Layout Structure (Ink Components)

```tsx
// Main layout — sidebar + content
<Box flexDirection="row" width="100%">
  <Box width={22} borderRight borderColor={colors.border} flexDirection="column">
    <Sidebar />
  </Box>
  <Box flexGrow={1} flexDirection="column" paddingLeft={1}>
    <ContentArea />
  </Box>
</Box>
```

### 10.5 Keyboard Navigation

**Global:**
| Key | Action |
|-----|--------|
| `Ctrl+1` through `Ctrl+5` | Switch main sections (Inbox, Projects, Meetings, Channels, Budget) |
| `/` | Global search (searches everything via FTS5) |
| `?` | AI assistant modal |
| `q` or `Ctrl+C` | Quit |
| `Esc` | Back / close modal |
| `Tab` | Next focusable element |
| `Shift+Tab` | Previous focusable element |

**List Navigation:**
| Key | Action |
|-----|--------|
| `j` / `↓` | Next item |
| `k` / `↑` | Previous item |
| `Enter` | Open / select |
| `g` | Go to top |
| `G` | Go to bottom |

**Task-Specific:**
| Key | Action |
|-----|--------|
| `n` | New item |
| `e` | Edit selected |
| `d` | Delete (with confirmation) |
| `x` | Mark done |
| `m` | Move (change status/project) |
| `→` | Reassign |
| `s` | Snooze (reschedule) |

### 10.6 Modals & Prompts

All modals render centered overlays:

```tsx
<Box
  position="absolute"
  width="60%"
  alignSelf="center"
  borderStyle="round"
  borderColor={colors.accent}
  padding={1}
>
  {/* modal content */}
</Box>
```

Confirmation prompts use inline format: `Delete this task? [y/n]`

### 10.7 Loading States

Use `ink-spinner` with `dots` variant for async operations:

```tsx
import Spinner from 'ink-spinner';
<Text><Spinner type="dots" /> Processing meeting transcript...</Text>
```

### 10.8 Responsive Width

Detect terminal width via `process.stdout.columns`. Breakpoints:
- `< 80` columns: single-column layout, no sidebar (toggle with `Ctrl+B`)
- `80–120` columns: sidebar 20 chars, content fills rest
- `> 120` columns: sidebar 24 chars, content fills rest, detail panels can split

---

## 11. API & Integration Layer

### 11.1 Microsoft Graph (Outlook + OneDrive)

```typescript
// OAuth2 — device code flow for terminal
const msalConfig = {
  auth: {
    clientId: 'LABLINK_MS_CLIENT_ID',  // registered Azure AD app
    authority: 'https://login.microsoftonline.com/common',
  }
};
// Scopes: Mail.Read, Mail.Send, Calendars.Read, Files.Read, User.Read
```

**Sync strategy:** Delta queries for mail (`/me/mailFolders/Inbox/messages/delta`). Poll every 5 minutes. Store `deltaLink` in config for incremental sync.

### 11.2 Google APIs (Gmail + Drive + Calendar)

```typescript
// OAuth2 — loopback redirect for terminal
const oauth2Client = new google.auth.OAuth2(
  'LABLINK_GOOGLE_CLIENT_ID',
  'LABLINK_GOOGLE_CLIENT_SECRET',
  'http://localhost:3847/oauth2callback'  // ephemeral local server
);
// Scopes: gmail.readonly, gmail.send, drive.readonly, calendar.readonly
```

**Sync strategy:** Gmail history ID-based incremental sync. Drive changes API with `startPageToken`. Calendar events list with `syncToken`.

### 11.3 Anthropic API

```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: getApiKey(),  // from keytar
});

async function aiQuery(systemPrompt: string, userMessage: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });
  return response.content[0].type === 'text' ? response.content[0].text : '';
}
```

### 11.4 Background Sync Daemon

`lablink sync` runs as a background process (or via pm2):

```typescript
// Sync loop
async function syncLoop() {
  while (true) {
    await syncEmail();           // 5 min interval
    await syncCalendar();        // 15 min interval
    await syncDriveMetadata();   // 30 min interval
    await runDailyJobs();        // once per day: priority recalc, risk scan, compliance check, nudges
    await sleep(60_000);         // check intervals every minute
  }
}
```

---

## 12. Configuration & Customization

### 12.1 Config File: `~/.lablink/config.toml`

```toml
[lab]
name = "Park Lab"
institution = "University of Houston"
timezone = "America/Chicago"

[user]
name = "Alex Kim"
email = "alex.kim@university.edu"
role = "grad_student"

[integrations.outlook]
enabled = true
sync_interval_minutes = 5

[integrations.gmail]
enabled = false

[integrations.google_drive]
enabled = true
sync_interval_minutes = 30

[integrations.google_calendar]
enabled = true
sync_interval_minutes = 15

[ai]
enabled = true
model = "claude-sonnet-4-20250514"
auto_task_creation = true
auto_task_threshold = 0.9
auto_decision_detection = true
daily_priority_recalc = true
daily_risk_scan = true
knowledge_graph_enabled = true

[notifications]
nudge_time = "09:00"            # when to send daily task nudges
overdue_escalation_days = 2     # days past due before escalating
meeting_reminder_minutes = 15

[display]
theme = "dark"                   # only dark for now
sidebar_width = 22
date_format = "MMM d, yyyy"
time_format = "h:mm a"
first_day_of_week = "monday"

[animals]
species_default = "mouse"
cage_capacity_default = 5
age_milestones = [42, 56, 70, 84]  # days — alert when reached

[customization]
# Users can add custom task statuses
extra_task_statuses = []
# Custom channel types
extra_channel_types = []
# Custom procedure types
procedure_types = ["perfusion", "injection", "behavioral_test", "surgery", "imaging", "blood_draw", "tissue_harvest", "drug_administration"]
# Custom expense categories
extra_expense_categories = []
```

### 12.2 Customizable Views

Users can create saved filters for task views:

```toml
[[saved_filters]]
name = "My overdue tasks"
entity = "tasks"
filters = { assigned_to = "$me", status = ["todo", "in_progress"], due_date = "< today" }
sort = "due_date asc"

[[saved_filters]]
name = "Unresolved blockers"
entity = "tasks"
filters = { status = "blocked" }
sort = "priority desc"
```

Accessible via `/` search → `@filters` or sidebar quick-access.

---

## 13. File Structure

```
lablink/
├── package.json
├── tsconfig.json
├── .eslintrc.json
├── README.md
├── LICENSE
│
├── src/
│   ├── cli.ts                      # Entry point, commander setup
│   ├── app.tsx                     # Main Ink app component
│   │
│   ├── commands/
│   │   ├── init.tsx                # Setup wizard
│   │   ├── sync.ts                 # Background sync daemon
│   │   └── config.ts               # Config editor
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx         # Main sidebar navigation
│   │   │   ├── ContentArea.tsx     # Main content renderer
│   │   │   ├── Modal.tsx           # Centered overlay modal
│   │   │   ├── StatusBar.tsx       # Bottom status bar
│   │   │   └── Header.tsx          # Top header with breadcrumbs
│   │   │
│   │   ├── inbox/
│   │   │   ├── InboxView.tsx       # Unified inbox
│   │   │   ├── OutboxView.tsx      # Sent items tracker
│   │   │   ├── TodayView.tsx       # AI-ranked to-do list
│   │   │   ├── TaskCard.tsx        # Individual task display
│   │   │   └── PIDashboard.tsx     # PI overview dashboard
│   │   │
│   │   ├── projects/
│   │   │   ├── ProjectList.tsx     # Project sidebar list
│   │   │   ├── ProjectView.tsx     # Project detail with tabs
│   │   │   ├── OverviewTab.tsx     # Project overview
│   │   │   ├── TasksTab.tsx        # Kanban / table / list views
│   │   │   ├── KanbanBoard.tsx     # Kanban card layout
│   │   │   ├── TaskTable.tsx       # Table view
│   │   │   ├── TimelineTab.tsx     # Gantt-style timeline
│   │   │   ├── PeopleTab.tsx       # Project members
│   │   │   ├── AnimalsTab.tsx      # Colony management
│   │   │   ├── CageMap.tsx         # Visual cage grid
│   │   │   ├── CageDetail.tsx      # Single cage view
│   │   │   ├── AnimalRecord.tsx    # Single animal view
│   │   │   ├── DocumentsTab.tsx    # Linked documents
│   │   │   ├── ExperimentChain.tsx # Dependency chain editor
│   │   │   └── ReagentTracker.tsx  # Supply management
│   │   │
│   │   ├── meetings/
│   │   │   ├── MeetingList.tsx     # Meeting history
│   │   │   ├── MeetingCreate.tsx   # New meeting form
│   │   │   ├── TranscriptInput.tsx # Paste/type transcript
│   │   │   ├── MeetingReview.tsx   # Post-processing review
│   │   │   ├── MeetingSummary.tsx  # Formatted summary view
│   │   │   └── SinceLastTime.tsx   # Meeting-to-meeting brief
│   │   │
│   │   ├── channels/
│   │   │   ├── ChannelList.tsx     # Channel sidebar
│   │   │   ├── ChannelView.tsx     # Message thread view
│   │   │   ├── MessageCompose.tsx  # Message input
│   │   │   ├── MessageItem.tsx     # Single message display
│   │   │   ├── HandoffForm.tsx     # Structured handoff
│   │   │   ├── OrderForm.tsx       # Reagent order form
│   │   │   └── EquipmentBooking.tsx # Equipment booking
│   │   │
│   │   ├── ai/
│   │   │   ├── AIAssistant.tsx     # @lablink query modal
│   │   │   ├── GrantDrafter.tsx    # Grant section generator
│   │   │   ├── ProtocolAnalysis.tsx # Protocol optimization view
│   │   │   └── ComplianceAlerts.tsx # Compliance dashboard
│   │   │
│   │   ├── budget/
│   │   │   ├── BudgetView.tsx      # Grant budget overview
│   │   │   ├── ExpenseForm.tsx     # Add expense
│   │   │   └── BurnRateChart.tsx   # Spending visualization
│   │   │
│   │   ├── shared/
│   │   │   ├── Table.tsx           # Reusable table component
│   │   │   ├── Select.tsx          # Dropdown select
│   │   │   ├── TextInput.tsx       # Styled text input
│   │   │   ├── DatePicker.tsx      # Date selection
│   │   │   ├── Confirm.tsx         # Confirmation prompt
│   │   │   ├── Badge.tsx           # Status badges
│   │   │   ├── ProgressBar.tsx     # Horizontal bar chart
│   │   │   ├── Tabs.tsx            # Tab navigation
│   │   │   ├── SearchBar.tsx       # Global search
│   │   │   └── EmptyState.tsx      # Empty state messaging
│   │   │
│   │   └── theme.ts               # Color palette and style constants
│   │
│   ├── db/
│   │   ├── schema.ts              # Drizzle schema definitions
│   │   ├── migrations/            # SQL migration files
│   │   ├── connection.ts          # SQLite connection manager
│   │   ├── seed.ts                # Demo data for development
│   │   └── queries/
│   │       ├── tasks.ts           # Task CRUD + queries
│   │       ├── projects.ts        # Project CRUD + queries
│   │       ├── meetings.ts        # Meeting CRUD + queries
│   │       ├── messages.ts        # Message CRUD + queries
│   │       ├── animals.ts         # Animal/cage CRUD + queries
│   │       ├── search.ts          # FTS5 search queries
│   │       └── analytics.ts       # Aggregate queries for dashboard
│   │
│   ├── ai/
│   │   ├── client.ts              # Anthropic SDK wrapper
│   │   ├── prompts.ts             # All system prompts (centralized)
│   │   ├── taskExtractor.ts       # Extract tasks from text
│   │   ├── decisionDetector.ts    # Detect decisions in text
│   │   ├── priorityScorer.ts      # Score task priority
│   │   ├── meetingProcessor.ts    # Full meeting processing pipeline
│   │   ├── projectRiskScanner.ts  # Risk detection
│   │   ├── knowledgeGraph.ts      # Knowledge extraction + queries
│   │   ├── grantDrafter.ts        # Grant section generation
│   │   ├── protocolOptimizer.ts   # Protocol analysis
│   │   ├── complianceChecker.ts   # Compliance deadline management
│   │   ├── budgetAnalyzer.ts      # Budget intelligence
│   │   ├── schedulingPredictor.ts # Predictive scheduling
│   │   ├── emailTagger.ts         # Auto-tag emails to projects
│   │   └── delegationSuggester.ts # Suggest task reassignments
│   │
│   ├── integrations/
│   │   ├── outlook.ts             # Microsoft Graph API client
│   │   ├── gmail.ts               # Gmail API client
│   │   ├── googleDrive.ts         # Google Drive API client
│   │   ├── googleCalendar.ts      # Google Calendar API client
│   │   ├── onedrive.ts            # OneDrive API client
│   │   └── oauth.ts               # OAuth2 flow helpers (device code + loopback)
│   │
│   ├── sync/
│   │   ├── daemon.ts              # Background sync orchestrator
│   │   ├── emailSync.ts           # Email delta sync
│   │   ├── calendarSync.ts        # Calendar sync
│   │   ├── driveSync.ts           # Drive metadata sync
│   │   └── dailyJobs.ts           # Daily AI jobs (priority, risk, compliance, nudges)
│   │
│   └── utils/
│       ├── config.ts              # Config file reader/writer
│       ├── credentials.ts         # Keytar wrapper
│       ├── dates.ts               # Date formatting helpers
│       ├── ids.ts                 # UUID generation
│       ├── logger.ts              # File-based logging
│       └── terminal.ts            # Terminal size detection, ANSI helpers
│
├── tests/
│   ├── unit/
│   │   ├── ai/                    # AI module tests (mock API)
│   │   ├── db/                    # Database query tests
│   │   └── utils/                 # Utility tests
│   ├── integration/
│   │   ├── meeting-flow.test.ts   # Full meeting → tasks → tracker flow
│   │   ├── inbox-sync.test.ts     # Email sync and tagging
│   │   └── dependency-chain.test.ts # Experiment dependency cascading
│   └── fixtures/
│       ├── sample-transcript.txt  # Sample meeting transcript
│       ├── sample-emails.json     # Sample email data
│       └── seed-data.sql          # Test database seed
│
└── scripts/
    ├── build.sh                   # Build script
    ├── dev.sh                     # Development mode with hot reload
    └── demo.sh                    # Populate demo data and launch
```

---

## 14. Build & Distribution

### 14.1 Build

```json
// package.json
{
  "name": "@lablink/cli",
  "version": "1.0.0",
  "type": "module",
  "bin": { "lablink": "./dist/cli.js" },
  "scripts": {
    "build": "tsup src/cli.ts --format esm --target node20 --dts",
    "dev": "tsx watch src/cli.ts",
    "test": "vitest",
    "lint": "eslint src/",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.30.0",
    "better-sqlite3": "^11.0.0",
    "boxen": "^7.1.0",
    "chalk": "^5.3.0",
    "cli-table3": "^0.6.5",
    "commander": "^12.0.0",
    "cosmiconfig": "^9.0.0",
    "date-fns": "^3.6.0",
    "drizzle-orm": "^0.33.0",
    "googleapis": "^140.0.0",
    "ink": "^5.0.0",
    "ink-select-input": "^6.0.0",
    "ink-spinner": "^5.0.0",
    "ink-text-input": "^6.0.0",
    "keytar": "^7.9.0",
    "marked": "^14.0.0",
    "marked-terminal": "^7.0.0",
    "minisearch": "^7.0.0",
    "react": "^18.3.0",
    "ws": "^8.18.0"
  },
  "devDependencies": {
    "@types/better-sqlite3": "^7.6.0",
    "@types/react": "^18.3.0",
    "@types/ws": "^8.5.0",
    "drizzle-kit": "^0.24.0",
    "eslint": "^9.0.0",
    "tsup": "^8.0.0",
    "tsx": "^4.16.0",
    "typescript": "^5.5.0",
    "vitest": "^2.0.0"
  },
  "engines": { "node": ">=20.0.0" }
}
```

### 14.2 Distribution

1. **npm:** `npm publish` under `@lablink/cli` scope
2. **Homebrew:** Create a tap with formula that installs via npm
3. **Binary:** Use `pkg` or `bun build --compile` for standalone binaries (no Node required)

---

## 15. Testing Strategy

### 15.1 Unit Tests (Vitest)

- **AI modules:** Mock Anthropic SDK, test prompt construction and response parsing. Verify that malformed AI responses are handled gracefully (fallback to empty arrays, error logging).
- **Database queries:** In-memory SQLite for fast tests. Test CRUD operations, FTS5 search accuracy, cascade deletes.
- **Dependency chain logic:** Test that shifting one experiment step correctly recalculates all downstream dates and sends correct notifications.
- **Priority scoring:** Test that scoring logic produces correct tier assignments given various input combinations.
- **Config parsing:** Test cosmiconfig loading with various config file states (missing, partial, invalid).

### 15.2 Integration Tests

- **Meeting flow:** Paste transcript → AI extracts segments, tasks, decisions → review screen displays correctly → approval creates records in database → tasks appear in To-Do view.
- **Inbox sync:** Mock email API responses → emails created in database → auto-tagging runs → emails appear in inbox with project tags.
- **Experiment dependency cascade:** Create chain of 5 steps → shift step 2 by 3 days → verify steps 3-5 shift → verify assigned users get notification records → verify timeline view renders correctly.
- **Message → Task flow:** Post message in channel → AI detects task → user confirms → task appears in project board and personal To-Do.

### 15.3 Snapshot Tests

Ink component rendering snapshots for:
- Inbox view with mixed item types
- Kanban board with cards in each column
- Cage map with various statuses
- Meeting review screen
- Budget overview

Use `ink-testing-library` for component rendering in tests.

### 15.4 Manual Testing Script

`scripts/demo.sh` populates the database with realistic sample data:
- 1 lab with 5 members
- 4 active projects
- 30+ tasks across projects
- 3 past meetings with transcripts
- 20 animals across 8 cages
- 50 messages across channels
- 5 linked documents
- 2 grants with expenses
- Upcoming deadlines and procedures

Allows testing all views with real-feeling data without API connections.

---

## Appendix A: AI Prompt Library

All prompts stored in `src/ai/prompts.ts` as exported constants. This centralizes prompt engineering and makes iteration easy. Every prompt follows the structure:

```typescript
export const PROMPTS = {
  TASK_EXTRACTION: {
    system: `You are a lab assistant. Extract actionable commitments...`,
    buildUserMessage: (content: string, context: object) => `...`,
    parseResponse: (text: string) => JSON.parse(text),
    fallback: [],  // returned on parse failure
  },
  // ... all other prompts
} as const;
```

---

## Appendix B: Keybinding Reference Card

Accessible in-app via `?` → `Keyboard Shortcuts`:

```
GLOBAL                          LISTS                           TASKS
Ctrl+1-5  Switch section        j/↓  Next item                  n  New
/         Search                k/↑  Previous item              e  Edit
?         AI assistant          Enter  Open/select              x  Mark done
Esc       Back/close            g  Go to top                    d  Delete
q         Quit                  G  Go to bottom                 m  Move/change status
Ctrl+B    Toggle sidebar        /  Filter                       →  Reassign
                                s  Sort                          s  Snooze

PROJECTS                        MEETINGS                        CHANNELS
1-7       Switch tab            n  New meeting                  r  Reply in thread
v         Toggle view           p  Paste transcript             p  Pin message
                                s  Start capture                 h  Handoff form
                                a  Approve all items             o  Order form
                                r  Review individually           b  Book equipment
```

---

## Appendix C: Migration Path

### Phase 1 (MVP — this PRD)
Local SQLite, single user, paste-based meeting input, manual document linking, Outlook/Gmail/GDrive sync.

### Phase 2
Multi-user server mode (PostgreSQL + WebSocket), real-time collaborative editing, Otter.ai/Granola API integration for live meeting capture, mobile companion app (React Native).

### Phase 3
Institutional deployment, SSO, cross-lab collaboration matching, core facility booking integration, ELN (electronic lab notebook) integration (Benchling, LabArchives), Slack bridge.

---

*End of PRD. Every feature, layout, data model, AI prompt, keyboard shortcut, and configuration option needed to build Lab Link autonomously is specified above. Build it.*

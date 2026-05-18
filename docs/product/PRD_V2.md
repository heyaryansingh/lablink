# Lab Link PRD v2

**Version:** 2.0  
**Date:** May 18, 2026  
**Status:** Build-grade product specification  
**Source lineage:** Extends `LABLINK_PRD.md` v1 and user decisions captured in `.planning/PROJECT.md`.

## 1. Executive Summary

Lab Link is a local-first terminal operating system for research labs. It brings together projects, tasks, meetings, communications, protocols, documents, lab inventory, colony management, equipment, budget, compliance, and AI assistance into one fast TUI invoked with `lablink`.

The product should feel like a serious technical product from a mature company: dense, reliable, keyboard-first, explainable, configurable, and respectful of sensitive lab data. It must work offline with local SQLite, but become much more powerful when connected to AI providers, Outlook/Gmail/Drive/Calendar, Zoom, and future lab systems.

## 2. Product Promise

Lab Link turns fragmented lab work into a connected operating graph:

- A Zoom meeting becomes structured notes, decisions, tasks, risks, project updates, and follow-ups.
- An email becomes a linked inbox item, project context, task candidate, deadline, or reagent order.
- A task completion updates dashboards, project status, daily plans, and future meeting briefs.
- A project hub unifies people, timelines, dependencies, files, animals, reagents, equipment, budget, and discussion.
- AI acts like an operations analyst with memory and provenance, not a novelty chatbot.

## 3. Target Users

### Primary Personas

**Principal Investigator**
- Needs portfolio visibility across projects, people, funding, risks, grants, compliance, and lab health.
- Uses dashboards, weekly summaries, at-risk alerts, meeting briefs, and delegation suggestions.

**Postdoc / Senior Scientist**
- Needs execution control across experiments, dependencies, people, protocols, reagents, and meetings.
- Uses project hub, task board, timeline, meeting action extraction, and handoff workflows.

**Graduate Student**
- Needs daily prioritization, clear assignments, experiment planning, protocol access, and follow-up tracking.
- Uses Today, project tasks, meeting notes, search, and document links.

**Technician / Lab Manager**
- Needs inventory, colony, equipment, safety, order, training, and procedure workflows.
- Uses feature-flagged lab modules and operational dashboards.

**External Collaborator**
- Needs selective context, documents, updates, meeting notes, and task handoffs.
- Future server mode supports scoped access.

## 4. Product Principles

1. **One data layer.** Every feature writes to and reads from the same operational graph.
2. **Local first.** The user can run meaningful workflows without network or cloud credentials.
3. **Provenance first.** AI-generated tasks, decisions, summaries, and tags must show source, quote, confidence, model, and approval state.
4. **Configurable by design.** Labs differ. Modules, statuses, fields, views, providers, prompts, and policies must be configurable.
5. **Serious terminal UX.** Dense, clear, responsive, keyboard-driven, restrained, and stable across terminal sizes.
6. **Adapters over coupling.** OAuth, AI, Zoom, storage, and future ELN/LIMS systems sit behind replaceable interfaces.
7. **Human accountable.** AI can suggest or draft; sensitive actions require review thresholds and audit logs.
8. **GSD execution.** Build in layers, validate each layer, remove temporary scaffolding, update planning state, commit.

## 5. Success Criteria

### MVP Success

- `npm install && npm run demo` launches a polished seeded TUI.
- `lablink init` creates a real workspace with config, database, and optional demo data.
- Command Center, Today, Project Hub, Meetings, Search, and Settings render from SQLite data.
- Transcript ingestion creates reviewable summaries, tasks, decisions, risks, and follow-up drafts.
- AI provider can be `anthropic`, `openai`, `local`, or `custom`; offline flows use labeled rules-based automation, not fake AI.
- Microsoft, Google, and Zoom OAuth flows are implemented and testable with credentials.
- Feature flags control lab-specific modules.
- Tests cover data, config, AI parsing, meeting processing, and TUI snapshots.

### Product-Quality Success

- User can understand why any task or alert exists.
- User can undo, dismiss, snooze, approve, or reject AI-created artifacts.
- The UI never depends on live external services for core navigation.
- All integrations degrade gracefully with actionable status messages.
- The demo data feels like a realistic research lab.
- Configuration can adapt the product to wet lab, computational lab, clinical lab, and core facility workflows.

## 6. Scope

### In Scope For Local MVP

- CLI commands: `lablink`, `lablink init`, `lablink demo`, `lablink today`, `lablink sync`, `lablink config`, `lablink meeting import`.
- Local SQLite data model and migrations.
- Seeded demo workspace.
- Ink TUI shell with responsive sidebar/content layout.
- Command Center: Inbox, Today, Outbox-ready, quick actions.
- Project Hub: Overview, Tasks, Timeline, People, Animals, Documents, Chat placeholders that become real views in layers.
- Meeting Intelligence: transcript import, Zoom recording metadata import, AI processing pipeline, review queue.
- AI Layer: provider registry, prompt registry, structured outputs, fallback parsing, audit records.
- Integrations: Microsoft Graph, Google APIs, Zoom OAuth and cloud recording transcript discovery.
- Extension registry: manifests, feature flags, custom fields, statuses, module/view contributions.
- Tests, CI, demo script, and planning docs.

### In Scope After MVP

- Multi-user server mode with PostgreSQL and WebSocket.
- Real-time chat and collaborative project updates.
- ELN/LIMS integrations such as Benchling, LabArchives, Airtable, REDCap, institutional systems.
- Slack/Teams bridge.
- Mobile companion.
- Admin policy controls.

### Out Of Scope For Local MVP

- Direct audio recording inside the terminal.
- Bypassing meeting platform consent or recording policies.
- Replacing institutional compliance systems of record.
- Full multi-user permissions enforcement.
- Medical or regulatory legal advice.

## 7. Information Architecture

Main sections:

1. **Command Center**
   - Inbox
   - Outbox
   - Today
   - PI Dashboard
2. **Projects**
   - Overview
   - Tasks
   - Timeline
   - People
   - Animals
   - Reagents
   - Equipment
   - Documents
   - Chat
3. **Meetings**
   - Capture/import
   - Processing queue
   - Review
   - History
   - Since-last-time brief
4. **Channels**
   - Project channels
   - General
   - Equipment
   - Orders
   - Handoffs
5. **Lab Operations**
   - Colony
   - Inventory
   - Equipment bookings
   - Safety
   - Training
6. **Budget**
   - Grants
   - Expenses
   - Burn rate
7. **AI**
   - Assistant
   - Review queue
   - Automations
   - Prompt/policy settings
8. **Settings**
   - Config
   - Providers
   - Integrations
   - Feature flags
   - Extensions
   - Data/backup

## 8. UX Requirements

### Design Language

- Dark terminal palette from PRD v1.
- No random decorative emoji. Use text symbols and lab-configurable icons.
- ASCII fallback is mandatory.
- Dense panels, tables, and lists are preferred over marketing-style cards.
- Borders are used for primary application frame, modals, and individual task/detail panes only.
- Avoid nested cards.
- Text must fit within terminal width with truncation and detail drill-down.
- Status uses color plus text/symbol, never color alone.

### Responsive Terminal Behavior

- `<80 columns`: single-column layout, sidebar hidden, command palette navigation.
- `80-120 columns`: sidebar width 20-24, main content single pane.
- `>120 columns`: sidebar width 24, main content can split list/detail.
- Rendering must avoid hardcoded examples wider than terminal.

### Navigation

- `Ctrl+1..7`: major sections.
- `/`: global search.
- `?`: AI assistant / command palette.
- `q`: quit.
- `Esc`: back or close modal.
- `j/k` and arrows: list navigation.
- `Enter`: open item.
- `n`: new item in current context.
- `e`: edit.
- `x`: mark done.
- `a`: approve AI suggestion.
- `r`: reject/retry/refresh depending on context, shown in status bar.

### Interaction Standards

- Every destructive action has confirmation.
- Every AI action has source and confidence.
- Review queues should support approve all, review one-by-one, edit before save, reject, and defer.
- Empty states are practical, not promotional.
- Loading states identify the operation and provider.
- Integration errors are shown with next step, not stack traces.

## 9. Core Workflows

### 9.1 First Run

`lablink init` runs an Ink wizard:

1. Lab name and institution.
2. User name, email, role.
3. Lab type presets: wet lab, computational, clinical, core facility, custom.
4. Feature flags.
5. Data directory.
6. AI provider setup: Anthropic, OpenAI, local/custom.
7. OAuth setup: Microsoft, Google, Zoom.
8. Demo data optional.
9. Database creation and migration.

Acceptance:

- Config file is written.
- Database is migrated.
- Credentials are stored through keytar or explicit dev-file fallback.
- User can launch `lablink` immediately.

### 9.2 Command Center

Purpose: one place to start the day.

Must show:

- Unread inbox items.
- AI-tagged project links.
- Unmatched items needing triage.
- Today's tasks ranked by urgency and dependency impact.
- Awaiting replies.
- Meeting reminders.
- Risk alerts.

Actions:

- Open item.
- Tag to project.
- Create task from item.
- Draft reply/follow-up.
- Dismiss/archive.
- Approve AI suggestion.

### 9.3 Today

Purpose: a rigorous daily operating list.

Task ranking inputs:

- Due date and overdue status.
- Priority.
- Grant/compliance deadlines.
- Experiment dependencies.
- Blocked people/tasks.
- Recent PI/supervisor mentions.
- Meeting commitments.
- Reagent/equipment/animal constraints.

Acceptance:

- Tasks grouped by critical, high, medium, low.
- Each task shows due date, project, source, assignee, and reason.
- AI score is inspectable.
- Done/snooze/reassign workflows update SQLite.

### 9.4 Project Hub

Purpose: replace separate spreadsheet, chat, document, and whiteboard workflows.

Tabs:

- Overview: status, summary, metrics, recent activity, next deadline.
- Tasks: kanban/table/list.
- Timeline: dependency chain and Gantt-like rendering.
- People: effort, role, funding, workload, training status.
- Animals: colony/cage/procedure workflows when enabled.
- Reagents: inventory and reorder alerts when enabled.
- Equipment: booking and training workflows when enabled.
- Documents: linked files with provider metadata.
- Chat: project-bound conversation and handoffs.

Acceptance:

- Tabs are feature-flagged.
- Project health is computed from data, not static text.
- Timeline shifts can cascade downstream with confirmation.

### 9.5 Meeting Intelligence

Purpose: make every meeting operationally useful.

Inputs:

- Paste transcript.
- Import `.txt`, `.vtt`, `.srt`, `.json`.
- Import Zoom cloud recording metadata and transcript files.
- Future external notes bot providers such as Recall.ai, Granola, Fireflies, Otter, or institutional bot.

Pipeline:

1. Normalize transcript.
2. Detect speakers and timestamps.
3. Segment by topic/project.
4. Extract decisions.
5. Extract action items.
6. Extract risks/blockers.
7. Extract deadlines.
8. Link to projects, people, animals, reagents, equipment, documents.
9. Generate summary.
10. Generate follow-up drafts.
11. Present review queue.
12. Commit approved artifacts to SQLite.

Review UX:

- Summary pane.
- Suggested tasks table with assignee, due date, confidence, quote.
- Decisions table with rationale and participants.
- Risks table with severity and impacted project.
- Follow-ups list.
- Approve, edit, reject, defer.

Acceptance:

- Nothing above confidence threshold is silently saved without policy allowing it.
- Every created task/decision stores `source_type`, `source_id`, `source_quote`, `confidence`, `ai_run_id`.
- Meeting-to-project linking is editable.

### 9.6 Meeting Notes Bot Strategy

Lab Link should not pretend the terminal itself can join calls. It supports three meeting-note capture modes:

**Mode A: Zoom Cloud Recording Import**
- Use Zoom OAuth.
- List cloud recordings.
- Locate transcript files from `recording_files` where `file_type` is `TRANSCRIPT`, summaries where `file_type` is `SUMMARY`, and related recording types.
- Download transcript using OAuth bearer token when authorized.
- Process transcript through Lab Link's meeting pipeline.

**Mode B: Zoom AI Companion / Recording Controls**
- If host permissions and settings allow, surface operational controls and status.
- Do not start/stop recordings without explicit user action.
- Record policy and audit event.

**Mode C: External Bot Provider Adapter**
- Provide a `MeetingBotProvider` interface.
- Providers can create bot, join meeting, receive webhook, fetch transcript, fetch recording, and delete data.
- Built-in stubs for Recall-style provider, generic webhook provider, and local import.
- All bot joins must surface consent/config copy and store meeting platform policy.

Meeting bot interface:

```ts
interface MeetingBotProvider {
  id: string;
  capabilities: Array<'join_url' | 'recording' | 'transcript' | 'summary' | 'webhook'>;
  scheduleBot(input: ScheduleBotInput): Promise<ScheduledBot>;
  getTranscript(botId: string): Promise<TranscriptArtifact | null>;
  cancelBot(botId: string): Promise<void>;
}
```

## 10. AI Requirements

### Provider Support

Providers:

- `anthropic`: Claude models.
- `openai`: Responses API.
- `local`: OpenAI-compatible local endpoint.
- `custom`: configured HTTP endpoint.

Selection:

- `auto` chooses Anthropic if key exists, then OpenAI if key exists, then local/custom if configured; otherwise AI commands show setup instructions.
- Each automation can override provider/model.
- Settings screen exposes provider status and last error.

### AI Capabilities

1. Task extraction from messages, emails, transcripts.
2. Decision detection.
3. Priority scoring.
4. Project auto-tagging.
5. Delegation suggestions.
6. Meeting summaries.
7. Since-last-meeting briefs.
8. Grant draft acceleration.
9. Protocol optimization suggestions.
10. Compliance scans.
11. Budget variance explanations.
12. Predictive scheduling.
13. Reagent substitution suggestions.
14. Experiment dependency risk detection.
15. Query assistant over local lab graph.

### AI Architecture

- `AiClient` exposes text and JSON generation.
- `PromptRegistry` owns prompts, schema, fallback, feature key, and model policy.
- `AiRun` table stores provider, model, feature, prompt hash, input summary, output, status, error, and timestamps.
- Structured JSON uses provider-native schema where supported and parser fallback elsewhere.
- All AI outputs enter a review queue unless policy permits auto-create.
- AI never directly calls integration write APIs without explicit workflow approval.

### OpenAI Responses API Requirements

The OpenAI provider uses Responses API concepts:

- `input` for user/developer content.
- `instructions` for stable system/developer guidance.
- `max_output_tokens`.
- `reasoning.effort` where supported by the configured model.
- `output_text` convenience property from the SDK.
- Future support for tool calls and file/search tools through provider capabilities.

### AI Review Queue

Every AI suggestion has:

- Entity type: task, decision, risk, summary, tag, follow-up.
- Confidence.
- Reason.
- Source.
- Quote.
- Diff/preview.
- Suggested target entity.
- Approval status.
- Approved by.
- Approved at.

Actions:

- Approve.
- Edit and approve.
- Reject.
- Defer.
- Merge duplicate.
- Link to existing entity.

## 11. Data Model Requirements

PRD v1 tables remain core. PRD v2 adds or strengthens:

- `ai_runs`
- `ai_suggestions`
- `meeting_artifacts`
- `meeting_bots`
- `meeting_bot_events`
- `transcript_segments`
- `integration_accounts`
- `sync_cursors`
- `audit_log`
- `activity_events`
- `extension_manifests`
- `extension_records`
- `custom_field_definitions`
- `view_presets`
- `notification_rules`
- `automation_policies`

### Core Entity Standards

All records:

- UUID primary key.
- ISO timestamp strings.
- Soft delete where user-facing.
- Source/provenance for imported or AI-created records.
- Custom fields JSON for extension-managed data.

### Audit Log

Audit events:

- OAuth account added/removed.
- Recording import.
- Bot scheduled/cancelled.
- AI suggestion approved/rejected.
- Task/decision created from source.
- Integration sync failure.
- Export/backup.

## 12. Integration Requirements

### Microsoft Graph

- Device code OAuth.
- Mail inbox delta sync.
- Mail send for drafted follow-ups.
- Calendar read.
- OneDrive file metadata.
- Token refresh and sync cursors.

### Google

- Loopback OAuth.
- Gmail read/send/modify.
- Calendar read.
- Drive metadata.
- History ID / change token sync.

### Zoom

- OAuth authorization code flow.
- Cloud recording list.
- Transcript and summary file discovery.
- Recording download using bearer token where authorized.
- Webhook-ready event handling for completed recordings.
- Host-controlled recording/AI Companion controls only with explicit approval and scopes.

### External Meeting Bot Providers

- Provider interface first.
- Webhook receiver in future server mode.
- Local polling fallback.
- Consent and retention metadata required.

## 13. Security, Privacy, And Compliance

### Local Security

- Credentials use keytar by default.
- Dev-file credentials require explicit environment flag.
- Database location is configurable.
- Logs avoid full transcript/email bodies by default.
- Redaction helpers for PHI/PII-like strings.

### AI Privacy Controls

- AI can be disabled globally.
- Per-feature AI provider policy.
- Per-feature data minimization.
- Transcript/email body sending requires explicit enabled policy.
- Rules-based non-AI flows support offline operation.
- AI run records store summaries, not necessarily full raw inputs.

### Meeting Consent

- Lab Link must not hide bot/recording behavior.
- Bot provider setup includes consent text.
- Recording import records source platform and user.
- Starting recordings requires explicit action and audit event.

### Compliance Posture

Lab Link can help track IRB/IACUC/biosafety/training deadlines, but it is not the official compliance system unless configured by institution. It must make that boundary clear in settings/docs.

## 14. Extensibility Requirements

Extensions can contribute:

- Feature flags.
- Navigation sections.
- Project tabs.
- Entity fields.
- Entity statuses.
- AI prompts/policies.
- Integration adapters.
- Importers/exporters.
- View presets.

Manifest requirements:

```json
{
  "id": "lablink.example",
  "name": "Example Lab Module",
  "version": "0.1.0",
  "labTypes": ["wet_lab"],
  "featureFlags": { "animals": true },
  "projectTabs": [],
  "customFields": [],
  "statuses": []
}
```

Extensions must not run arbitrary code in MVP. MVP supports declarative manifests only. Executable extension hooks are future server/admin scope.

## 15. Configuration Requirements

Config file:

- TOML.
- Stored in data directory.
- Supports environment overrides.
- Includes lab, user, display, AI, integrations, features, extensions, policies, and modules.

Settings UI:

- Shows active data directory.
- Shows provider status.
- Shows OAuth status.
- Shows enabled modules.
- Shows extension manifests.
- Allows config path discovery.

## 16. Testing Requirements

### Unit

- Config merge and validation.
- Feature flag resolution.
- Prompt building and JSON parsing.
- Priority scoring tier mapping.
- Meeting transcript normalization.
- Zoom recording file selection.
- OAuth URL/token helpers.
- Extension manifest validation.

### Integration

- Init creates config and database.
- Migrations apply idempotently.
- Seed data creates usable demo.
- Meeting transcript import creates review suggestions.
- Approving suggestions creates tasks/decisions.
- Sync imports inbox items without duplicates.

### TUI Snapshot

- Command Center.
- Today grouped by priority.
- Project Hub tabs.
- Meeting review queue.
- Settings provider statuses.

### Manual UAT

- Fresh `lablink demo`.
- Small terminal `<80`.
- Wide terminal `>120`.
- Missing AI credentials.
- Missing OAuth credentials.
- Rules-based meeting transcript processing.
- Feature flag toggles.

## 17. Build And Distribution

Scripts:

- `npm run dev`
- `npm run demo`
- `npm run init`
- `npm run sync`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `npm run validate`

Distribution:

- npm package `@lablink/cli`.
- Homebrew tap after npm package stabilizes.
- Standalone binary later.

## 18. GSD Build Plan

Each phase has:

- Executable PLAN.md.
- Implementation.
- Verification.
- SUMMARY.md.
- State update.
- Commit.
- Ralph review: remove placeholders that should not survive, improve weakest area, rerun checks.

### Phase 0: Product Definition

- PRD v2.
- Capability gap matrix.
- GSD roadmap refresh.

### Phase 1: Validated Foundation

- Resolve npm install.
- Fix type/build/test issues.
- Polish CLI/app shell.
- Ensure demo launches.

### Phase 2: Data And Review Queue

- Add AI suggestions, meeting artifacts, audit log.
- Add idempotent migrations.
- Add query modules.

### Phase 3: Meeting Intelligence

- Transcript import.
- Meeting processing pipeline.
- Review UI.
- Approve to tasks/decisions/risks.

### Phase 4: AI Product Layer

- Prompt registry.
- Provider capability detection.
- Structured output schemas.
- AI run audit.
- Assistant over local graph.

### Phase 5: Integrations

- Microsoft/Google sync hardening.
- Zoom transcript import.
- External bot provider abstraction.

### Phase 6: Product Polish

- Responsive TUI refinements.
- Snapshot tests.
- Settings and provider status.
- Demo story quality.

### Phase 7: Extensibility

- Declarative extensions.
- Lab presets.
- Custom fields/statuses/views.

### Phase 8: Release Readiness

- CI green.
- Docs.
- Packaging.
- UAT.

## 19. Acceptance Criteria For "Impressive Final Product"

The product is not considered impressive until:

- Demo mode feels coherent and realistic within 30 seconds.
- Meeting import produces a polished review experience.
- AI output is structured, inspectable, editable, and useful.
- Project hub tells a credible project story from real data.
- Settings make providers/integrations/modules transparent.
- The app handles missing credentials gracefully.
- The app handles narrow and wide terminals gracefully.
- The implementation has tests for the high-risk logic.
- Planning docs reflect the actual state.
- There are no hidden "temporary" features pretending to be done.

## 20. References

- Original Lab Link PRD: `LABLINK_PRD.md`
- OpenAI Responses API docs: `https://platform.openai.com/docs/api-reference/responses?api-mode=responses`
- Zoom Meeting APIs docs: `https://developers.zoom.us/docs/api/meetings/`
- Zoom OAuth docs: `https://developers.zoom.us/docs/integrations/oauth/`

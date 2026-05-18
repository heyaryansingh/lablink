# Lab Link Roadmap

## Status Legend

- Pending: not started
- Active: currently being implemented
- Verify: code exists and is under validation/refinement
- Complete: implemented, verified, summarized, and committed

## Phase 0: Product Definition

**Goal:** Establish the active build-grade specification and capability gap before continuing implementation.

**Plans:**

- 00-01: PRD v2, capability gap matrix, and GSD state refresh.
- 00-02: PRD v2.2, validation matrix, and active roadmap refresh.

**Verification:** PRD v2.2 and gap matrix v2.2 exist, planning state references them, and product-definition checkpoint is committed.

**Status:** Complete.

## Phase 1: Foundation

**Goal:** Create a standalone, maintainable TypeScript CLI project that follows the PRD and GSD/Ralph workflow.

**Plans:**

- 01-01: Planning, repository setup, npm project, TypeScript tooling, CI skeleton.
- 01-02: Launchable zero-dependency bootstrap runtime and npm validation.
- 01-03: Interaction stabilization, config surface, terminal utilities, extension registry, feature flags.
- 01-04: CLI entry point, Ink app shell, navigation skeleton, demo mode.

**Verification:** `npm run smoke`, `npm run test`, `npm run build`, `npm run validate`, and full TypeScript validation where rich dependencies are available.

## Phase 2: Data Core

**Goal:** Implement the local SQLite data layer with schema, migrations, query modules, and realistic seed data.

**Plans:**

- 02-01: Drizzle schema and SQL migrations matching the PRD plus extension hooks.
- 02-02: Connection/configurable data directory and seed/demo data.
- 02-03: Query modules for users, projects, tasks, meetings, messages, animals, search, analytics.

## Phase 3: Command Center

**Goal:** Ship the core personal workflow: Inbox, Outbox, Today, and PI Dashboard backed by real local data.

**Plans:**

- 03-01: Today view with AI-priority-ready ranking, task actions, and provenance.
- 03-02: Unified inbox/outbox local model and rendering.
- 03-03: PI dashboard and analytics queries.

## Phase 4: Project Hub

**Goal:** Implement project list/detail views with Overview, Tasks, Timeline, People, Animals, Docs, and Chat tabs.

**Plans:**

- 04-01: Project shell and Overview/People/Documents tabs.
- 04-02: Task board/table/list and task editing workflows.
- 04-03: Timeline/dependency chain rendering and cascade logic.
- 04-04: Feature-flagged lab modules: animals, reagents, equipment.

## Phase 5: Meeting Intelligence

**Goal:** Convert meetings and Zoom artifacts into summaries, tasks, decisions, and follow-ups.

**Plans:**

- 05-01: Paste/file transcript ingestion and review flow.
- 05-02: Zoom OAuth and recording/transcript provider adapter.
- 05-03: Meeting processor pipeline with task/decision extraction and approval.

## Phase 6: AI Layer

**Goal:** Make AI configurable, testable, provider-neutral, and useful offline.

**Plans:**

- 06-01: Provider abstraction for Anthropic, OpenAI, local/custom endpoints.
- 06-02: Prompt registry, JSON parsing, retry/fallback behavior, provenance.
- 06-03: Task extraction, priority scoring, email tagging, delegation suggestions.

## Phase 7: Integrations And Sync

**Goal:** Implement OAuth and sync adapters without coupling them to UI views.

**Plans:**

- 07-01: OAuth framework: device code and loopback flows, token storage, refresh.
- 07-02: Microsoft Graph mail/calendar/OneDrive clients.
- 07-03: Google Gmail/Drive/Calendar clients.
- 07-04: Background sync daemon and daily jobs.

## Phase 8: Extensibility And Customization

**Goal:** Let each lab adapt modules, fields, statuses, views, and providers.

**Plans:**

- 08-01: Extension manifest loader and module registry.
- 08-02: Custom fields/statuses/view presets.
- 08-03: Extension examples for wet lab, computational lab, clinical lab, and core facility.

## Phase 9: Hardening

**Goal:** Make the tool dependable for continued development and distribution.

**Plans:**

- 09-01: Unit/integration/snapshot tests.
- 09-02: CI workflow, linting, packaging.
- 09-03: README, demo script, manual UAT checklist, release notes.

## Current Focus

Phase 1 resumes next from the v2.2 coordination and institutional-sync path after the product-definition checkpoint.

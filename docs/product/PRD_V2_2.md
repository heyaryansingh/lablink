# Lab Link PRD v2.2

**Version:** 2.2  
**Date:** May 18, 2026  
**Status:** Build-grade product specification  
**Source lineage:** Extends `docs/product/PRD_V2.md` and the launchable runtime in `docs/product/PRD_V2_1_LAUNCH_SPEC.md`.

## 1. Executive Summary

Lab Link is a terminal-first operating system for research labs and academic institutions. It unifies tasks, meetings, email, calendars, coordination, documents, AI assistance, and lab-specific tracking into one local-first product invoked with `lablink`.

Version 2.2 is not a reset. It validates the current foundation, then expands the product into a more complete operational system:

- stronger AI orchestration and review
- richer meeting summary and coordination workflows
- institutional email and calendar integration
- Slack and Notion connectivity
- multi-lab adaptation through profiles, modules, and custom schemas
- more robust tracking for deadlines, projects, follow-ups, and lab operations

The target feel remains a serious, polished terminal product: dense, keyboard-first, highly legible, and adaptable, with a quality bar closer to a mature company product than a demo.

## 2. v2.2 Goals

1. Validate the current launchable runtime and preserve it as a reliable baseline.
2. Deepen the AI layer so it is useful for real lab work, not just transcript parsing.
3. Expand coordination features so meetings drive execution across tasks, email, calendar, and chat.
4. Make the product adaptable to different labs without changing core architecture.
5. Turn Lab Link into a workflow hub for institutions, not only a local note-taking shell.

## 3. Current Validated Baseline

The v2.2 spec assumes the following baseline already exists and must not regress:

- npm launch path is working.
- Bootstrap runtime and demo mode exist.
- Command Center, Today, Projects, Meetings, AI Review, Settings, search, and command palette exist in the launch shell.
- Transcript import exists in bootstrap form.
- Deterministic local AI suggestion generation exists.
- AI suggestion approval and rejection exist in bootstrap form.
- Provider abstraction exists for Anthropic, OpenAI, local/custom, and mock modes.
- OAuth adapter scaffolding exists for Microsoft, Google, and Zoom.
- Feature flags and extension manifests exist as the product shape for future lab customization.
- Planning docs and GSD/Ralph loop tracking exist.

These capabilities are the floor, not the finish line.

## 4. Product Principles

1. **One graph.** Tasks, meetings, emails, calendar events, documents, and coordination items belong to the same operational model.
2. **Local first.** Core navigation and core workflows must work without cloud credentials.
3. **Explainable AI.** Every AI artifact needs source, confidence, model, policy, and review state.
4. **Institution ready.** Integrations must work with school and lab accounts, not only personal accounts.
5. **Lab adaptable.** A wet lab, computational lab, clinical lab, core facility, or mixed environment must be able to adopt the same core.
6. **Terminal serious.** The UI should feel like a professional operations console, not a toy.
7. **Adapters over coupling.** Integrations and AI providers stay behind stable interfaces.
8. **GSD execution.** Each layer must be shippable, validated, and then refined.

## 5. Target Users

**Principal Investigator**
- Needs lab-wide visibility, coordination, risk awareness, and accountability.

**Lab Manager**
- Needs scheduling, coordination, task routing, equipment and deadline tracking, and communication flow.

**Student or Scientist**
- Needs daily priorities, meeting follow-up, task clarity, and quick access to context.

**Technician or Operations Lead**
- Needs operational tracking, standard workflows, inventory/equipment links, and dependable handoffs.

**Institutional Collaborator**
- Needs controlled context sharing, institutional email/calendar sync, and selective task visibility.

## 6. Core Experience

### Command Center

The landing surface should show:

- inbox items and triage status
- today priorities
- meeting follow-up queue
- calendar context
- risk alerts
- provider and integration status
- coordination items that need attention

Actions:

- open item
- triage to project
- create task or follow-up
- draft reply
- approve AI suggestion
- defer or archive

### Today

Today is the execution list for the lab. It should rank work by:

- due date and overdue state
- project priority
- meeting commitments
- institution deadlines
- dependency impact
- blocked work
- risk level
- recent mention or assignment

Each item should expose:

- source
- owner
- project
- due date
- reason for ranking
- source quote when derived from AI or imported text

### Projects

Project views should feel like a real operations workspace:

- Overview
- Tasks
- Timeline
- People
- Meetings
- Documents
- Chat or coordination
- Feature-flagged lab modules

The project view must be capable of expanding into custom tabs and project-specific field layouts.

### Meetings

Meeting views should include:

- upcoming meetings
- imported transcripts
- generated summaries
- extracted decisions
- extracted tasks
- follow-up drafts
- coordination actions
- Zoom recording and transcript readiness

### AI Review

AI Review is the control room for all AI-generated artifacts.

It should show:

- entity type
- confidence
- source quote
- model or provider
- rule or prompt used
- suggested destination
- diff or preview
- approval state

### Settings

Settings should surface:

- active data directory
- runtime mode
- AI providers and routing
- OAuth status
- calendar and mail sync status
- Slack and Notion status
- enabled lab modules
- extension manifests
- retention and policy settings

## 7. AI Product Requirements

### 7.1 Provider Strategy

Support the following providers:

- mock
- Anthropic
- OpenAI
- local OpenAI-compatible endpoint
- custom HTTP provider

Provider selection must be configurable at the feature level and the lab level. The default should be auto-routing with safe fallbacks.

### 7.2 AI Capabilities

v2.2 expands AI from extraction into coordination and synthesis:

- transcript summarization
- decision extraction
- task extraction
- risk detection
- deadline detection
- action owner inference
- meeting brief generation
- since-last-time brief generation
- email triage suggestions
- calendar prep and follow-up drafts
- project status synthesis
- institution-specific terminology handling
- lab-specific note normalization
- cross-source stitching across email, calendar, meetings, and tasks

### 7.3 AI Quality Bar

AI output must be:

- structured
- editable
- traceable
- reviewable
- policy-aware
- reversible where possible

AI should not silently create sensitive records when confidence or policy does not allow it.

### 7.4 Prompt and Model Control

The product must support:

- prompt registry
- model routing by feature
- reasoning-effort or equivalent provider controls
- structured JSON output
- fallback parsing when provider schema support is limited
- prompt versioning
- AI run audit records

## 8. Meeting Summary And Coordination

Meeting intelligence in v2.2 is broader than transcript parsing.

### Required Workflows

- ingest a transcript, recording transcript, or pasted notes
- summarize the meeting
- extract decisions, tasks, risks, follow-ups, and owners
- map items to projects, people, and deadlines
- generate a pre-meeting brief from recent context
- generate a post-meeting coordination brief
- push approved follow-ups into tasks, inbox, and calendar context
- surface unresolved items in the next meeting brief

### Coordination Requirements

Lab Link should act like a coordination layer between meetings and execution:

- meeting outcomes must connect to real tasks
- action items must flow to the right owner
- calendar events should show the current state of follow-up work
- email drafts should be linked to the originating meeting
- Slack or Notion updates should be traceable back to the meeting artifact

## 9. Institutional Email And Calendar Integration

### Email

Support institutional email accounts through adapter-based integrations:

- Microsoft 365 / Exchange / Outlook
- Google Workspace / Gmail
- IMAP fallback where permitted

Capabilities:

- inbox sync
- sent mail linkage
- draft follow-up generation
- thread-to-project linking
- task creation from messages
- reminder and snooze flow

### Calendar

Support institutional calendars through adapter-based integrations:

- Microsoft Calendar
- Google Calendar
- ICS and read-only fallback where needed

Capabilities:

- event import
- meeting linkage
- prep brief generation
- follow-up tracking
- deadline surface area
- calendar-aware priority ranking

### Institutional Constraints

The product must handle school and institutional environments where:

- admin consent is required
- service accounts may be restricted
- personal and work accounts coexist
- retention policies differ
- calendar visibility may be partial

## 10. Slack And Notion Integration

### Slack

Slack integration should support:

- channel context import
- message-to-task linking
- meeting follow-up posting
- summary posting
- mention tracking
- lightweight coordination cues

### Notion

Notion integration should support:

- page linking
- project note ingestion
- meeting summary publishing
- task reference links
- knowledge base search hooks

These integrations should be adapters, not hard dependencies.

## 11. Adaptation To Different Labs

Lab Link must adapt to different operating styles without a rewrite.

### Lab Profiles

Support configurable profiles such as:

- wet lab
- computational lab
- clinical lab
- core facility
- hybrid lab
- custom institution profile

### Customization Surface

Each profile can control:

- feature flags
- statuses
- custom fields
- visible modules
- default views
- AI policies
- terminology
- tracking categories

### Examples Of Lab-Specific Adaptation

- a wet lab may emphasize reagents, equipment, and colony tracking
- a computational lab may emphasize compute, datasets, and releases
- a clinical lab may emphasize approvals, compliance, and patient-adjacent controls
- a core facility may emphasize bookings, handoffs, turnaround time, and service queues

## 12. Tracking And Operations

v2.2 broadens tracking beyond generic tasks.

It should track:

- projects
- tasks
- meeting follow-ups
- deadlines
- people and roles
- training status
- grants and institutional milestones
- equipment and booking state
- inventory and reorder triggers
- risks and blockers
- recurring commitments
- unresolved coordination items

Tracking should be visible in both dashboards and detail views, and should feed AI ranking and meeting briefs.

## 13. UX And Design Requirements

The UI must remain terminal-native and professional.

Requirements:

- no random emoji
- ASCII fallback
- stable layout behavior at narrow and wide terminal sizes
- dense but legible tables and panels
- keyboard-first navigation
- clear focus state
- no hidden actions
- no decorative noise
- action labels that make sense to real users
- truncation rules that preserve meaning

The design should feel closer to a mature operator console than to a demo app.

## 14. Data Model Requirements

v2.2 expands the core graph with entities such as:

- institution accounts
- mail threads
- calendar events
- coordination items
- meeting briefs
- meeting summaries
- meeting artifacts
- AI runs and suggestions
- lab profiles
- tracking rules
- sync cursors
- integration accounts
- activity and audit events
- custom fields and presets

Every entity that comes from AI or import needs provenance and lifecycle state.

## 15. Security, Privacy, And Compliance

Requirements:

- credential storage must be explicit and platform-appropriate
- transcript and email body handling must be policy-aware
- AI usage must be configurable per feature
- integration permissions must be visible to the user
- audit records should track sensitive operations
- retention controls should be exposed for institutional environments

The product is not the system of record for institutional compliance, but it must help users manage compliance-sensitive work responsibly.

## 16. Extensibility Requirements

Extensions should be able to contribute:

- feature flags
- navigation sections
- project tabs
- custom fields
- custom statuses
- new provider adapters
- new importers/exporters
- custom lab profiles
- view presets

The default extension format should remain declarative unless and until executable extension hooks are explicitly introduced.

## 17. Validation And Acceptance Criteria

v2.2 is successful when:

- current launchable features still work
- the product has a polished, coherent command-center experience
- meeting summaries produce useful and reviewable coordination artifacts
- institutional email and calendar integration is real and testable
- Slack and Notion adapters exist and are configurable
- lab profiles materially change defaults and visible modules
- AI outputs are structured, editable, and traceable
- the UI feels like a real product under terminal constraints
- the planning docs reflect reality
- the product can grow without a rewrite

## 18. GSD Build Plan

### Phase 0: Product Definition v2.2

- write PRD v2.2
- validate current capabilities against v2.2
- refresh planning state and roadmap

### Phase 1: Coordination Core

- deepen inbox, today, and follow-up workflows
- add coordination item tracking
- connect meeting summaries to execution

### Phase 2: Institutional Sync

- email adapters
- calendar adapters
- slack and notion adapters
- sync status and retry handling

### Phase 3: AI Orchestration

- model routing
- prompt registry
- structured outputs
- memory and synthesis
- review queue refinements

### Phase 4: Lab Adaptation

- lab profiles
- custom fields
- custom statuses
- module presets

### Phase 5: Hardening

- tests
- snapshots
- policy validation
- docs
- packaging

## 19. Non-Goals

- replacing institutional systems of record
- pretending the terminal can join meetings by itself
- enabling unsafe unattended actions
- requiring cloud connectivity for core navigation
- locking the product into a single lab type


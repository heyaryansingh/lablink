# Lab Link PRD v2.1 Launch Specification

**Date:** May 18, 2026  
**Purpose:** Convert PRD v2 into an immediately launchable product layer.

## 1. Launch Position

Lab Link must launch through npm before deeper implementation continues. The full TypeScript/Ink architecture remains the target architecture, but the product also needs a dependency-free runtime that works in constrained environments, CI smoke tests, and first-run demos.

This is not a disposable prototype. It is the bootstrap runtime:

- It proves the product shape.
- It validates the information architecture.
- It gives users a professional first impression.
- It remains a fallback if optional rich dependencies are unavailable.
- It exercises the same product workflows that the full runtime will later deepen.

## 2. Launchable Runtime Requirements

The npm package must work with no package downloads:

- `npm install` succeeds quickly and creates `package-lock.json`.
- `npm run demo` launches Lab Link with seeded data.
- `npm run smoke` renders a deterministic non-interactive dashboard snapshot.
- `npm run test` runs built-in smoke assertions.
- `npm run build` creates `dist/cli.js`.
- `npm run validate` runs smoke, tests, and build.

The bootstrap runtime must use only Node.js built-ins.

## 3. Product Feel

The launch runtime should feel closer to a serious terminal product like Claude Code than a toy:

- Full-screen terminal frame.
- Left navigation rail.
- Dense main working area.
- Command palette.
- Status bar.
- Keyboard-first navigation.
- Minimal color, high contrast, restrained visual language.
- No random emoji.
- Clear provenance for AI and meeting artifacts.

## 4. Required Launch Views

### Command Center

Shows:

- Inbox items.
- Today priorities.
- Active meeting review queue.
- Risk alerts.
- Provider/integration status.

Actions:

- Number keys switch sections.
- `/` opens search.
- `?` opens command palette.
- `q` quits.

### Today

Shows:

- Tasks grouped by priority.
- Due dates.
- Project.
- Source quote/provenance.
- AI priority explanation.

### Projects

Shows:

- Project status table.
- Completion metrics.
- Next deadline.
- Risks and recent activity.

### Meetings

Shows:

- Meeting history.
- Imported transcript artifacts.
- Suggested tasks/decisions/risks pending approval.
- Zoom recording import status.
- External bot provider readiness.

### AI Review

Shows:

- AI suggestions across tasks, decisions, risks, follow-ups, tags.
- Confidence.
- Source quote.
- Proposed destination.
- Approval state.

### Settings

Shows:

- Active data directory.
- Runtime mode.
- AI provider policy.
- OAuth provider status.
- Feature flags.
- Extension presets.

## 5. Data Requirements

The launch runtime stores demo/local data in JSON:

- `.lablink-dev/lablink.bootstrap.json` for demo mode.
- `~/.lablink/lablink.bootstrap.json` for local mode.

The data shape must mirror the core SQLite graph:

- users
- projects
- tasks
- inbox
- meetings
- meetingArtifacts
- aiSuggestions
- risks
- providers
- integrations
- auditLog
- featureFlags

The JSON runtime is a product-supported bootstrap store. SQLite remains the richer target store and should be able to import/export this shape later.

## 6. AI Launch Behavior

The launch runtime includes deterministic local AI simulation:

- Extract action items from transcript-like text.
- Detect decisions.
- Detect risks/blockers.
- Rank priorities.
- Create review suggestions with confidence, quote, reason, and target.

External provider calls remain in the TypeScript provider layer until dependencies and credentials are available. The launch runtime must expose provider status and make clear when it is using local deterministic AI.

## 7. Meeting Notes Bot Launch Behavior

The launch runtime must model the real meeting workflow:

- `lablink meeting import <file>` imports `.txt`, `.vtt`, `.srt`, or `.json`.
- Transcript text is normalized.
- The deterministic AI pass creates suggestions.
- Suggestions appear in AI Review and Meetings.
- Zoom and external bot providers show status and next setup step.

It must not pretend to join Zoom calls in bootstrap mode. It should present:

- Zoom Cloud Recording Import: configured/not configured.
- External Bot Provider: adapter-ready/not configured.
- Consent and recording policy: required before live bot use.

## 8. Acceptance Criteria For This Layer

- A user can run `npm run demo` and see a professional TUI.
- A user can run `npm run smoke` in CI/non-interactive shell and get a deterministic snapshot.
- A user can run `npm run test` and get passing built-in assertions.
- A user can run `npm run build` and get `dist/cli.js`.
- The app clearly shows Command Center, Today, Projects, Meetings, AI Review, and Settings.
- The app has a believable research lab demo story.
- The app stores state in `.lablink-dev` for demo mode.
- The app records an audit entry when meeting import creates AI suggestions.

## 9. GSD Next Phase

Phase 1.1: Launchable Bootstrap Runtime

Tasks:

1. Replace npm scripts with zero-dependency launch scripts.
2. Add `bin/lablink.mjs`.
3. Add bootstrap data store and seeded data.
4. Add professional TUI snapshot and interactive mode.
5. Add meeting import and deterministic AI suggestion generation.
6. Add smoke/test/build commands.
7. Validate with npm commands.
8. Commit.

# Lab Link Capability Gap Matrix

**Date:** May 18, 2026  
**Compared against:** `LABLINK_PRD.md` v1 and `docs/product/PRD_V2.md`  
**Current code baseline:** local commits through `e173b5e`.

## Status Key

- **Built:** implemented in code.
- **Partial:** code exists but not complete/product-grade.
- **Planned:** specified but not built.
- **Blocked:** cannot be validated due environment or credentials.

## Current Strengths

| Area | Status | Notes |
| --- | --- | --- |
| GSD planning | Built | Project memory, roadmap, state, Ralph loop ledger, phase summary exist. |
| Standalone git repo | Built | Local repo initialized with GitHub remote. Push blocked by network. |
| npm/TS/Ink scaffold | Partial | Source exists. Dependency install is blocked, so build not validated. |
| Config system | Partial | Defaults and TOML loader exist. Init wizard not built. |
| Feature flags/extensions | Partial | Registry and built-in manifests exist. Runtime UI contributions not yet active. |
| SQLite schema | Partial | Broad schema and migration exist. More v2 tables needed. |
| Seed data | Partial | Realistic first seed exists. Needs richer demo story and idempotent test coverage. |
| TUI shell | Partial | Sidebar/content/status/views exist. Needs validation, navigation depth, and polish. |
| AI provider abstraction | Partial | Anthropic/OpenAI/local/mock providers exist. Needs schemas, audit, capability detection, review queue. |
| OAuth adapters | Partial | Microsoft, Google, Zoom flows exist. Need refresh, status, tests, and credentialed validation. |
| Sync daemon | Partial | One-cycle inbox import exists. Needs cursors, retries, metrics, and provider status. |

## PRD v1 Feature Coverage

| PRD Feature | Current | Gap |
| --- | --- | --- |
| Installation and CLI | Partial | CLI commands exist; package not installed or validated. |
| First run init | Partial | Non-interactive init exists; Ink wizard missing. |
| Data models | Partial | Many tables exist; CHECK constraints omitted; v2 tables missing. |
| Unified Inbox | Partial | Local inbox table/view exists; actions missing. |
| Outbox | Planned | No sent/follow-up tracker yet. |
| Today | Partial | Rendering and seeded tasks exist; actions/scoring pipeline missing. |
| PI Dashboard | Planned | Analytics queries/view missing. |
| Project Hub | Partial | Shell/tabs exist; real tab workflows missing. |
| Tasks Kanban/Table/List | Planned | Basic list only. |
| Timeline | Planned | Placeholder only. |
| People | Planned | Placeholder only. |
| Animals | Partial | Schema/seed exists; view placeholder only. |
| Documents | Partial | Schema/seed exists; view placeholder only. |
| Chat | Partial | Schema/seed exists; view placeholder only. |
| Meeting capture | Partial | Meetings view exists; import/review missing. |
| Transcript processing | Planned | Prompts exist; processing service missing. |
| Follow-up automation | Planned | Not built. |
| Communications | Partial | Schema exists; UI/actions missing. |
| AI Layer | Partial | Provider interface exists; product workflow missing. |
| Knowledge graph | Planned | Search index only. |
| Grant/protocol/compliance/budget AI | Planned | Not built. |
| TUI design system | Partial | Colors/theme exist; robust components missing. |
| Integrations | Partial | OAuth clients exist; refresh/sync/webhooks incomplete. |
| Customization | Partial | Feature flags/manifests exist; settings editing missing. |
| Testing | Partial | Three unit tests written; not runnable until install works. |

## PRD v2 Priority Gaps

| Priority | Capability | Required Next Work |
| --- | --- | --- |
| P0 | Validated npm install/build/test | Resolve network/install, generate lockfile, fix TypeScript. |
| P0 | Demo launch | Ensure `npm run demo` opens TUI with seed data. |
| P0 | Meeting import pipeline | Add artifact tables, transcript normalizer, processor, review queue. |
| P0 | AI suggestion review | Add `ai_suggestions`, approval flows, provenance, UI. |
| P0 | Design robustness | Add reusable table/list/panel components with width-safe truncation. |
| P1 | Zoom transcript import | Select transcript/summary files, download with bearer token, store artifact. |
| P1 | Provider capability status | Settings should show configured, credentialed, usable, last error. |
| P1 | Task actions | Done/snooze/reassign/create/edit from Today and Project views. |
| P1 | Project analytics | Computed health, activity, next deadline, blocked dependencies. |
| P1 | Audit log | Store sensitive operations and AI approvals. |
| P2 | External bot provider | MeetingBotProvider interface and generic webhook adapter. |
| P2 | Extension runtime | Use manifests to add tabs/fields/statuses at runtime. |
| P2 | Snapshot tests | TUI rendering confidence. |

## Immediate GSD Recommendation

Do not build broad UI polish next. First make the product foundation executable:

1. Resolve dependency install.
2. Make demo launch.
3. Add v2 data tables for meeting artifacts, AI suggestions, and audit.
4. Build transcript import -> AI review queue -> approve tasks/decisions.
5. Then refine UI with real workflows instead of placeholders.

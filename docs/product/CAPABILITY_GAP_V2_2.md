# Lab Link Capability Gap Matrix v2.2

**Date:** May 18, 2026  
**Compared against:** `docs/product/PRD_V2_2.md`  
**Current code baseline:** launchable bootstrap runtime plus earlier foundation work.

## Status Key

- **Built:** implemented in code.
- **Partial:** code exists but is not yet product-grade.
- **Planned:** specified but not built.
- **Blocked:** needs credentials, network, or later architecture work.

## Current Strengths

| Area | Status | Notes |
| --- | --- | --- |
| npm launch path | Built | Bootstrap runtime launches with `npm run demo`, `smoke`, `test`, `build`, and `validate`. |
| GSD planning | Built | Planning state, roadmap, and phase summaries exist. |
| Command Center shell | Partial | Core sections render in the launch runtime, but coordination depth is still limited. |
| Today view | Partial | Ranked task rendering exists; richer task actions and cross-source ranking are still needed. |
| Projects view | Partial | Shell exists; project analytics and deeper tabs remain thin. |
| Meetings view | Partial | Transcript import and review exist in bootstrap form; coordination pipeline is still shallow. |
| AI Review | Partial | Suggestion approve/reject exists; editing, merging, and richer provenance need work. |
| Keyboard navigation | Partial | Number keys work, but arrow-key navigation and stable selection state need refinement. |
| AI provider layer | Partial | Anthropic/OpenAI/local/custom abstraction exists; routing and policy controls need depth. |
| OAuth adapters | Partial | Microsoft, Google, and Zoom adapters exist as scaffolding; live sync and refresh flows need hardening. |
| Feature flags and extensions | Partial | Registry exists; runtime-driven customization still needs more surface area. |
| Local bootstrap store | Built | Demo/local JSON store supports repeatable product demos. |

## v2.2 Coverage

| PRD v2.2 Area | Current | Gap |
| --- | --- | --- |
| Command Center coordination | Partial | Needs inbox, tasks, meetings, calendar, and risk views that operate as one workflow. |
| Institutional email sync | Planned | Microsoft, Google, and IMAP sync must become real and durable. |
| Calendar sync | Planned | Calendar import, brief generation, and follow-up linking still need implementation. |
| Slack integration | Planned | Message import, mention tracking, and follow-up publishing are not yet built. |
| Notion integration | Planned | Page linking and summary publishing are not yet built. |
| Meeting coordination | Partial | Transcript import exists, but the pre/post meeting coordination loop is incomplete. |
| AI synthesis | Partial | Deterministic local AI exists; richer routing, memory, and structured review are needed. |
| Lab profiles | Planned | Profiles and lab-specific defaults need product-level support. |
| Tracking layer | Partial | Core tasks exist; deadlines, training, grants, and operations tracking need expansion. |
| Audit and provenance | Partial | Bootstrap audit concepts exist; model-level audit and cross-source provenance need more depth. |
| Settings and status | Partial | Runtime status exists; provider/integration status needs more fidelity. |

## Priority Gaps

| Priority | Capability | Required Next Work |
| --- | --- | --- |
| P0 | Coordination core | Make tasks, inbox, meetings, and follow-ups behave like one workflow. |
| P0 | Stable interaction model | Remove choppy redraws and make arrow-key navigation reliable across the demo and runtime. |
| P0 | Meeting summaries | Add richer summary, decisions, owners, and execution linkage. |
| P0 | AI routing | Add policy-aware provider selection and structured output control. |
| P1 | Institutional email/calendar | Build durable adapters with sync cursors and status reporting. |
| P1 | Slack/Notion | Add configurable adapters and traceable publish/link flows. |
| P1 | Lab profiles | Add profile-driven defaults, modules, statuses, and terminology. |
| P1 | Tracking depth | Add deadlines, training, grant, and operations tracking. |
| P2 | Extensibility runtime | Move from registry-only to meaningful runtime customization. |
| P2 | Snapshot and integration tests | Expand coverage around views, sync, and AI review. |

## Immediate GSD Recommendation

1. Keep the launchable bootstrap runtime as the current safety net.
2. Build the coordination core next, not isolated features.
3. Expand meeting artifacts into real execution objects.
4. Add institutional email/calendar sync after the coordination model is stable.
5. Then add Slack, Notion, lab profiles, and broader tracking.

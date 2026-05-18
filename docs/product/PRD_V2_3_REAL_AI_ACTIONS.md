# Lab Link PRD v2.3 Real AI And Action Layer

**Version:** 2.3  
**Date:** May 18, 2026  
**Status:** Build-grade beta specification  
**Source lineage:** Extends `docs/product/PRD_V2_2.md` and the npm beta runtime.

## 1. Purpose

Lab Link must move from demo-only AI simulation to a configurable, provider-backed action layer. The beta should let outside developers test the full product loop:

- configure lab and AI behavior
- verify provider status
- call real AI APIs when credentials exist
- fail clearly with setup instructions when no real provider is configured
- generate lab insights from real product data
- produce scheduling recommendations
- propose or apply task progress updates through auditable actions

## 2. Current Truth

Before v2.3, Lab Link has a working npm beta, a zero-dependency TUI, seeded lab data, rules-based review suggestions, and provider status display. It does not yet have product-grade real API calls, configurable AI routing, AI-generated insight objects, scheduling plans, or API-style task progress automation.

## 3. Goals

1. Add provider-backed AI calls for OpenAI, Anthropic, local OpenAI-compatible endpoints, and custom endpoints.
2. Add configuration commands that are usable from the published npm package.
3. Add AI insight generation over current lab state.
4. Add scheduling recommendations from tasks, meetings, calendar-like events, and risks.
5. Add automatic task progress proposals and auditable apply behavior.
6. Make every automated action explainable and reversible enough for beta testing.

## 4. Non-Goals

- No hidden unattended writes to external systems.
- No OAuth completion without user credentials and institutional permissions.
- No claim that beta AI results are validated scientific or compliance advice.
- No fake AI responses in commands labeled as AI.

## 5. Configuration Requirements

The published CLI must support:

- `lablink config show`
- `lablink config set <path> <value>`
- `lablink config path`
- environment overrides for provider keys and models
- local JSON store updates for lab name, institution, features, AI policy, UI settings, scheduling policy, and automation policy

Important config paths:

- `ai.provider`
- `ai.openai.model`
- `ai.anthropic.model`
- `ai.local.baseUrl`
- `ai.custom.baseUrl`
- `ai.policy.autoApply`
- `automation.taskProgress`
- `schedule.workHours.start`
- `schedule.workHours.end`
- `lab.name`
- `lab.institution`

## 6. Real AI Provider Requirements

Provider selection:

- `auto` chooses OpenAI when `OPENAI_API_KEY` exists, then Anthropic when `ANTHROPIC_API_KEY` exists, then local/custom when configured.
- A specific provider can be selected by config or `--provider`.
- If no real provider is configured, AI commands must exit with a clear setup message.
- API failures must be recorded and must not be hidden behind fake success output.

Provider calls:

- OpenAI uses the Responses API.
- Anthropic uses the Messages API.
- Local and custom providers use an OpenAI-compatible JSON shape where possible.

Every AI run records:

- provider
- model
- feature
- prompt summary
- status
- latency
- error
- created artifacts

## 7. AI Actions

### `lablink ai status`

Shows resolved provider routing, configured models, key presence, provider policy, and last error.

### `lablink ai ask <prompt>`

Sends a direct prompt to the resolved provider. This is for smoke-testing provider wiring with real credentials.

### `lablink ai insights`

Builds a compact lab-state prompt and returns structured insight objects:

- priority insight
- risk insight
- scheduling insight
- coordination insight
- automation suggestion

Approved insights should be able to create AI suggestions or coordination items.

## 8. Scheduling Requirements

`lablink schedule plan` should produce a daily operating plan using:

- today tasks
- due dates
- meetings
- calendar-like events
- risks
- work hours
- priority scores

Provider-backed scheduling can use AI when configured. Deterministic non-AI scheduling must remain available and must be labeled as rules-based scheduling, not AI.

## 9. Automatic Task Progress Requirements

`lablink automation run` should inspect current lab state and create auditable progress proposals. In beta:

- high-confidence local evidence can update task progress when `automation.taskProgress` is enabled
- AI-generated progress updates must enter the review/audit flow unless `ai.policy.autoApply` allows writes
- every update records source, reason, and previous value

Supported beta progress actions:

- set `task.progress`
- update `task.status`
- add a progress event
- create a follow-up AI suggestion when confidence is not high enough

## 10. UX Requirements

Settings and CLI output must make it obvious whether Lab Link is using:

- real OpenAI
- real Anthropic
- local/custom endpoint
- no provider configured

The demo must not pretend real provider calls happened when no key is configured.

## 11. Acceptance Criteria

v2.3 is complete for beta when:

- npm package still validates and release-checks
- real provider calls are attempted when keys are configured
- no-key environments keep working for non-AI demo surfaces and show setup instructions for AI commands
- `ai status`, `ai ask`, `ai insights`, `schedule plan`, and `automation run` work from the npm package
- config show/set works from the npm package
- AI runs and automation writes are stored locally with audit/provenance
- README gives a minimal beta testing path

## 12. GSD Build Plan

1. Write this PRD.
2. Add a plan and summary for the v2.3 layer.
3. Implement config commands.
4. Implement provider-backed AI client calls with no fake AI fallback.
5. Implement insights, schedule planning, and automation run.
6. Add tests and release-check coverage.
7. Run validation.
8. Ralph loop: remove fake-complete behavior, ensure provider status is truthful, and commit.

## 13. Completion Promise

`LABLINK_REAL_AI_ACTIONS_BETA_READY`

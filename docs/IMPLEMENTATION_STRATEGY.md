# Implementation Strategy

## Build Cadence

Lab Link is built in layers. Each layer must leave the repo in a better state than it found it:

1. Implement a coherent vertical or foundational slice.
2. Run available validation.
3. Inspect for temporary scaffolding that should not survive.
4. Refine the weakest area.
5. Update `.planning/STATE.md` and phase summaries.
6. Commit.
7. Push when network/authentication allows it.

## Early Architecture Choices

- The CLI entry point only parses commands and launches app/service code.
- Views read from services and query modules, not directly from integration clients.
- AI and OAuth clients are adapters behind stable interfaces.
- Feature flags guard lab-specific modules, including colony, clinical, computational, equipment, budget, and safety workflows.
- Extension manifests can add modules, views, statuses, fields, and integrations without changing the app shell.

## OAuth Strategy

OAuth flows are real code paths:

- Microsoft: device code flow through MSAL for terminal use.
- Google: loopback redirect server for Gmail, Drive, and Calendar.
- Zoom: loopback OAuth flow for recording and transcript access.

Demo mode can run without live credentials.

## AI Strategy

The AI layer exposes one provider-neutral interface:

- `generateText` for natural language outputs.
- `generateJson` for structured automation.
- Provider config controls model, base URL, timeout, and reasoning effort.
- Anthropic, OpenAI, and real local/custom providers share the same interface; AI commands do not use fake provider responses.

The OpenAI implementation uses the Responses API shape from official OpenAI developer docs, where current models are exposed through the Responses API.

## Extension Strategy

Extensions are local manifests loaded from configured directories. They can contribute:

- Feature flags
- Navigation sections
- Project tabs
- Entity custom fields
- Status definitions
- Integration providers

The initial app ships built-in module manifests for wet lab, computational lab, clinical lab, and core facility patterns.

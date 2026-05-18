# Lab Link Project Memory

## Vision

Lab Link is a terminal-first research lab operating system. It consolidates project tracking, task management, meeting intelligence, communications, lab-specific modules, documents, budget tracking, and AI assistance into one local-first tool invoked with `lablink`.

The product must be robust, technical, flexible, and extensible enough to adapt to different lab types without rewriting the core application.

## Source Of Truth

- Primary requirements: `LABLINK_PRD.md`
- Build method: GSD-style layered execution with atomic plans, summaries, verification, and commits.
- Iteration method: Ralph-loop inspired pass after each layer: inspect output, remove temporary scaffolding that should not survive, improve the weakest parts, verify, update planning state, commit.

## User Decisions

- Package manager: npm.
- Work location: directly in this repo.
- GitHub target: `https://github.com/heyaryansingh/lablink.git`.
- Styling: follow the PRD palette and terminal design system.
- Icons: avoid random emoji; use configurable symbols with ASCII fallback.
- AI: configurable provider layer, defaulting to Anthropic or OpenAI while allowing other providers and local models.
- OAuth: implement integration flows now, not only mocks.
- Lab modules: feature flagged and extensible. Animal/colony management ships as a flag, and the framework must support other lab-specific modules.
- Meeting intelligence: support Zoom recordings/bots and external provider hooks, plus file/paste fallbacks.
- Architecture: local single-user first, with multi-user/server expansion boundaries in data and service layers.
- Testing: add useful CI and local validation.

## Product Principles

1. One data layer feeds every feature.
2. Local-first functionality must work without cloud credentials.
3. External integrations must be replaceable adapters, not UI-coupled code.
4. Every automation must expose provenance: source type, source id, quote, confidence, and user approval state.
5. Feature flags and extensions should let a wet lab, computational lab, clinical group, or core facility tailor the same tool.
6. The TUI should be dense, readable, keyboard-driven, and stable across terminal widths.

## MVP Layers

1. Foundation: npm project, TypeScript, Ink CLI, config, logging, planning docs, git hygiene.
2. Data Core: Drizzle/SQLite schema, migrations, connection, seed data, typed query modules.
3. App Shell: responsive TUI layout, sidebar, status bar, keybindings, views from real data.
4. Core Workflows: Today, projects/tasks, meetings transcript ingestion, search.
5. Intelligence Layer: provider abstraction, prompt registry, task extraction, priority scoring, offline fallback.
6. Integrations: OAuth flows for Microsoft/Google/Zoom, sync adapters, daemon skeleton.
7. Extensibility: feature flags, extension manifests, custom fields/statuses/modules.
8. Hardening: tests, snapshots, CI, demo script, build verification.

## Completion Promise

The session-level completion promise is:

`LABLINK_LAYERED_FOUNDATION_VERIFIED`

It is only true when the project has a committed, validated foundation with planning docs, npm tooling, app shell, schema/migrations, config, seed data, provider/integration interfaces, and at least one runnable demo path or a clearly documented environment blocker.

# Lab Link

Lab Link is a local-first terminal platform for research labs built as an npm-installed CLI named `lablink`.

Current release line: beta prerelease. Core workflows are usable, but the product is still incomplete.

Package name: `lablink-cli`
CLI command: `lablink`

## Current State

This repository is in Phase 1 foundation work and is being prepared for beta npm publication.

## Development

```bash
npm install
npm run pack:dry
npm run smoke
npm run validate
npm run dev
npm run demo
npm run typecheck
npm run test
npm run build
```

On Windows PowerShell systems that block `npm.ps1`, use `npm.cmd` instead.

By default, development data uses `.lablink-dev` when `LABLINK_DATA_DIR` is set. Production defaults to `~/.lablink`.

## Launch Runtime

Lab Link currently ships a zero-dependency bootstrap runtime at `bin/lablink.mjs`. This is the launchable product surface used by npm scripts while the richer TypeScript/Ink runtime matures.

```bash
npm run demo                # interactive TUI
npm run smoke               # deterministic dashboard snapshot
node bin/lablink.mjs meeting import tests/fixtures/sample-transcript.txt
node bin/lablink.mjs ai list
node bin/lablink.mjs ai approve sug-risk-at8
```

The bootstrap runtime includes Command Center, Today, Projects, Meetings, AI Review, Settings, transcript import, deterministic local AI suggestions, and AI suggestion approve/reject commands.

Beta publish command:

```bash
npm run publish:beta
```

Install from npm:

```bash
npm install -g lablink-cli@beta
lablink demo
```

Run locally:

```bash
npm run demo
```

Smoke test:

```bash
npm run smoke
```

Publish beta:

```bash
npm run publish:beta
```

## Architecture

- Node.js 20, TypeScript, ESM
- Ink 5 for the terminal UI
- SQLite with Drizzle ORM
- Provider-neutral AI layer for Anthropic, OpenAI, local, and custom endpoints
- OAuth adapters for Microsoft, Google, and Zoom
- Feature flags and extension manifests for lab-specific modules

## Planning

- `.planning/PROJECT.md`: persistent product memory
- `.planning/ROADMAP.md`: phase roadmap
- `.planning/STATE.md`: current build state
- `.planning/RALPH_LOOP.md`: iteration and completion promise ledger

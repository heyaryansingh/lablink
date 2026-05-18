# Lab Link

Lab Link is a local-first terminal platform for research labs. It is built from `LABLINK_PRD.md` as an npm-installed CLI named `lablink`.

## Current State

This repository is in Phase 1 foundation work. The app is being built in GSD layers with a Ralph-loop style verification pass after each layer.

## Development

```bash
npm install
npm run dev
npm run demo
npm run typecheck
npm run test
npm run build
```

On Windows PowerShell systems that block `npm.ps1`, use `npm.cmd` instead.

By default, development data uses `.lablink-dev` when `LABLINK_DATA_DIR` is set. Production defaults to `~/.lablink`.

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

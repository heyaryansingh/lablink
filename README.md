# Lab Link

Lab Link is a local-first terminal platform for research labs built as an npm-installed CLI named `lablink`.

Current release line: beta prerelease. Core workflows are usable, but the product is still incomplete.

Package name: `lablink-cli`
CLI command: `lablink`

## Try The Beta

Requires Node.js 20 or newer.

```bash
npx lablink-cli@beta smoke
npx lablink-cli@beta demo
```

Or install it globally:

```bash
npm install -g lablink-cli@beta
lablink --version
lablink demo
```

Real AI commands require a configured provider. Lab Link does not return fake AI responses.

```bash
$env:OPENAI_API_KEY="..."
lablink ai status
lablink ai ask "What should the lab focus on today?"
lablink ai insights
lablink schedule plan --ai
lablink automation run --ai
```

Anthropic is also supported through `ANTHROPIC_API_KEY`. Local or custom OpenAI-compatible endpoints can be configured with `lablink config set ai.local.baseUrl <url>` or `lablink config set ai.custom.baseUrl <url>`.

## Current State

This repository is in Phase 1 foundation work and is being prepared for beta npm publication.

## Development

```bash
npm install
npm run pack:dry
npm run release:check
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

The bootstrap runtime includes Command Center, Today, Projects, Meetings, AI Review, Settings, transcript import, rules-based review suggestions, and AI suggestion approve/reject commands.
Transcript import and default schedule/progress flows use labeled rules-based automation unless you run the `--ai` provider-backed commands.

Run the full package release check before publishing:

```bash
npm run release:check
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
npm login
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

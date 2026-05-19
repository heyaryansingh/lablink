# Lab Link

Lab Link is a local-first terminal platform for research labs built as an npm-installed CLI named `lablink`.
The beta now includes a lightweight browser workspace in addition to the terminal runtime.

Current release line: beta prerelease. Core workflows are usable, but the product is still incomplete.

Package name: `lablink-cli`
CLI command: `lablink`

## Try The Beta

Requires Node.js 20 or newer.

```bash
npx lablink-cli@beta smoke
npx lablink-cli@beta web --smoke
npx lablink-cli@beta demo
```

Or install it globally:

```bash
npm install -g lablink-cli@beta
lablink --version
lablink demo
lablink web
```

The website runs locally at `http://127.0.0.1:4867` by default. Use a custom port when needed:

```bash
lablink web --port 4873
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

Copy `.env.example` when setting up a local developer environment; the web runtime can also load tokens from the ignored `.lablink-dev/secrets.json` file.

Anthropic is also supported through `ANTHROPIC_API_KEY`. Local or custom OpenAI-compatible endpoints can be configured with `lablink config set ai.local.baseUrl <url>` or `lablink config set ai.custom.baseUrl <url>`.

Website meeting analysis uses the same real-provider policy. Meeting Studio can run local rules-based extraction without an AI key, but the "Analyze With Real AI" action requires a real provider and fails with setup guidance if none is configured.

Zoom meeting creation also requires real credentials. For the beta route, set `ZOOM_ACCESS_TOKEN` before using the website Start Zoom action. The website can also generate OAuth consent URLs and exchange returned authorization codes for Zoom, Google Workspace, and Microsoft Graph when the matching client credentials and redirect URI are configured. Lab Link does not fabricate meeting links when Zoom is not configured.

## Current State

This repository is in beta foundation work with terminal and browser launch surfaces. The website is incomplete but runnable for developer review.

## Development

```bash
npm install
npm run pack:dry
npm run release:check
npm run smoke
npm run web
npm run web:smoke
npm run repo:scan
npm run repo:scan:full
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
node bin/lablink.mjs web --port 4867
```

The bootstrap runtime includes Command Center, Today, Projects, Meetings, AI Review, Settings, transcript import, rules-based review suggestions, AI suggestion approve/reject commands, and a local browser workspace.
Transcript import and default schedule/progress flows use labeled rules-based automation unless you run the `--ai` provider-backed commands.

The browser workspace includes a modular Lab Blocks Runtime with workspace tabs, draggable blocks, per-block subtabs, role presets, optional inspector sheet, Meeting Studio, browser live-note capture when supported, rules-based meeting extraction, real-provider meeting analysis, Zoom creation setup, OAuth URL/code-exchange helpers, and layout preferences saved in browser storage.

The web beta also includes Lab Builder, an adaptive workspace composer. It can save local custom lab sections manually, or use a configured real AI provider to propose new section designs for things like reagent tracking, protocol readiness, equipment coordination, grants, onboarding, or lab-specific review queues. Provider-backed section generation fails with setup guidance if no real AI provider is configured.

The workspace can also be reorganized by AI from the command composer. Describe the current intent, run Organize, and Lab Link selects the workspace, block order, visible blocks, collapsed blocks, block subtabs, focus title, and suggested actions. This is provider-backed only; no local fake AI layout is returned. Motion One, Floating UI, and SortableJS load progressively in the browser when available; native fallback behavior remains.

Run the full package release check before publishing:

```bash
npm run release:check
```

When another developer or agent changes the repo, run the repo guard before continuing:

```bash
npm run repo:scan
npm run repo:scan:full
node bin/lablink.mjs repo scan --json
```

The guard reports git status, changed-file risk, launch-critical syntax checks, web smoke, and full validation in `--full` mode. It never resets, commits, or pushes changes.

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

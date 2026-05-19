# Lab Link PRD v2.8 - Collaborative Repo Guard

Date: 2026-05-19  
Status: Implementation spec  
Completion promise: `LABLINK_COLLABORATIVE_REPO_GUARD_BETA9`

## 1. Problem

Lab Link is now being edited by more than one agent or developer. The product can move quickly, but concurrent work creates predictable failure modes:

- silent uncommitted changes
- changes in high-risk files without validation
- web UI regressions after design edits
- package version and tarball drift
- real AI / OAuth policy accidentally weakened
- planning docs not updated when behavior changes

The repo needs a lightweight guard that can be run repeatedly during development without depending on a large toolchain.

## 2. Product Principle

Every outside edit should be treated as an input to review, not as something to overwrite.

The guard should answer:

- What changed?
- Which changed files are risky?
- Which validation checks should run?
- Did the current repo still pass the launchable beta checks?

## 3. Scope

Add a zero-dependency repo scanner available through both:

- `lablink repo scan`
- `npm run repo:scan`

The scanner should work on Windows PowerShell and standard shells.

## 4. Behavior

The scanner should:

- inspect `git status --short --branch`
- show the latest commit
- list changed files
- classify high-risk paths
- run syntax checks for launch-critical JS files when present
- run `npm run web:smoke`
- run `npm run validate` in full mode
- optionally emit JSON

High-risk paths:

- `bin/lablink.mjs`
- `web/server.mjs`
- `web/public/app.js`
- `web/public/styles.css`
- `package.json`
- `package-lock.json`
- `.env.example`
- `scripts/*`
- `src/db/migrations/*`

Planning-sensitive paths:

- `docs/product/*`
- `.planning/*`
- `README.md`

## 5. Commands

Required:

```bash
lablink repo scan
npm run repo:scan
```

Full:

```bash
lablink repo scan --full
npm run repo:scan:full
```

JSON:

```bash
lablink repo scan --json
```

No checks:

```bash
lablink repo scan --no-checks
```

## 6. Acceptance Criteria

- Clean repo reports clean status.
- Dirty repo reports changed paths without modifying them.
- High-risk files are flagged.
- Syntax and web smoke checks run by default.
- Full mode runs `npm run validate`.
- JSON mode returns structured data.
- The scanner does not require network.
- The scanner does not call destructive git commands.
- `npm run validate` and `npm run release:check` still pass.

## 7. Decision Review

Decision: implement the scanner inside the launch CLI, not as a dependency-heavy external tool.

Reason:

- It works from npm installs and local clones.
- It stays aligned with the zero-dependency beta runtime.
- It can be used by humans, Codex, Claude, or other agents.

Decision: do not auto-commit, auto-reset, or auto-push.

Reason:

- The guard should surface risk and run validation.
- Source-control decisions remain explicit human/agent actions.

Decision: default checks should be useful but not too slow.

Reason:

- `web:smoke` and syntax checks catch most fast web regressions.
- `--full` remains available before commits and publishing.

## 8. Ralph Loop

Loop 1 - scan:

- Add git status and changed-file classification.

Loop 2 - verify:

- Add syntax and web smoke checks.

Loop 3 - deepen:

- Add full validation mode.

Loop 4 - document:

- Add README and planning updates.

Loop 5 - validate:

- Run repo scan, web smoke, validate, and release check.

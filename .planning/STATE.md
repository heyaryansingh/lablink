# Lab Link State

## Current Position

- Date: 2026-05-18 America/Chicago
- Phase: 6 - AI Layer
- Plan: 06-01
- Status: Complete
- Repository: standalone git repo initialized in `C:\Aryan\GitHub Projects\lablink`
- Remote: `origin` configured as `https://github.com/heyaryansingh/lablink.git`

## Decisions Locked

- npm is the package manager.
- PRD design system is the default theme.
- Symbols are configurable and support ASCII fallback.
- Demo and full runtime should share a stable keyboard and selection contract.
- AI provider layer is configurable and provider-neutral.
- OAuth is implemented as real adapter code, with local/demo fallbacks.
- Lab modules are feature flagged and extension-ready.
- Local single-user is the first runtime, with server-ready boundaries.
- PRD v2.2 is the active build-grade specification: `docs/product/PRD_V2_2.md`.
- PRD v2.3 real AI/action layer is active for provider-backed beta work: `docs/product/PRD_V2_3_REAL_AI_ACTIONS.md`.
- PRD v2 remains the prior baseline specification: `docs/product/PRD_V2.md`.
- PRD v2.1 launch spec is active for the npm-launch layer: `docs/product/PRD_V2_1_LAUNCH_SPEC.md`.
- Capability gap tracking v2.2 is active: `docs/product/CAPABILITY_GAP_V2_2.md`.

## Ralph Loop Ledger

The working loop after each meaningful layer:

1. Build the smallest coherent layer.
2. Run available verification.
3. Inspect for temporary bridging code or half-features that should not survive.
4. Refine the weakest part.
5. Update `.planning/STATE.md` and a phase summary.
6. Commit locally.
7. Attempt remote sync when the environment allows it.

Completion promise:

`LABLINK_LAYERED_FOUNDATION_VERIFIED`

Current AI/action completion promise:

`LABLINK_REAL_AI_ACTIONS_BETA_READY`

## Current Risks

- Rich dependency installation was blocked earlier, so the launch path now uses a zero-dependency Node runtime.
- Full TypeScript/Ink validation remains pending until rich dependencies are intentionally installed.
- `git push -u origin main` failed because github.com:443 is unreachable from this sandbox.
- The PRD examples include mojibake-rendered Unicode from PowerShell; implementation must use clean source strings and ASCII fallbacks.
- OAuth credentials for Microsoft, Google, and Zoom are user/institution-specific; implementation can provide flows and config but cannot complete live authorization without credentials.
- AI commands now require real OpenAI, Anthropic, local, or custom provider configuration; no-provider environments intentionally fail AI commands with setup instructions.

## Next Actions

- Build richer coordination objects around tasks, meetings, inbox, and follow-ups.
- Publish beta after running `npm run release:check`.
- Test real provider calls with `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`.
- Continue institutional email/calendar, Slack, Notion, and lab-profile expansion.

# Lab Link State

## Current Position

- Date: 2026-05-18 America/Chicago
- Phase: 10 - Web Platform
- Plan: 10-01
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
- PRD v2.4 web platform is active for the browser workspace, meeting studio, and integration-readiness layer: `docs/product/PRD_V2_4_WEB_PLATFORM.md`.
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

Current web platform completion promise:

`LABLINK_WEB_PLATFORM_BETA_READY`

## Current Risks

- Rich dependency installation was blocked earlier, so the launch path now uses a zero-dependency Node runtime.
- Full TypeScript/Ink validation remains pending until rich dependencies are intentionally installed.
- `git push -u origin main` failed because github.com:443 is unreachable from this sandbox.
- The PRD examples include mojibake-rendered Unicode from PowerShell; implementation must use clean source strings and ASCII fallbacks.
- OAuth credentials for Microsoft, Google, and Zoom are user/institution-specific; implementation can provide flows and config but cannot complete live authorization without credentials.
- AI commands now require real OpenAI, Anthropic, local, or custom provider configuration; no-provider environments intentionally fail AI commands with setup instructions.
- Website meeting analysis must keep the same policy: rules-based local extraction is allowed only when labeled, and real AI routes must fail without configured providers.
- Zoom meeting creation must call a real configured Zoom token or fail with setup guidance; the web product must not invent meeting links.
- The browser default should stay calm and customizable: optional context rail, focus-first command view, and Lab Builder for lab-specific sections.
- Lab Builder may use AI to propose new sections only through a real configured provider; manual local sections remain available without AI.
- The browser should avoid permanent tab clutter: one workspace selector, a compact AI organizer, and user-controlled visible/collapsed panels are the current interaction model.

## Next Actions

- Start the local web server for browser review.
- Publish the beta after a final `npm run release:check` in the release environment.
- Continue OAuth-backed Microsoft/Google/Zoom setup flows, AI-generated section editing, saved layout presets, richer meeting-to-execution publishing, and direct manipulation of panel order.

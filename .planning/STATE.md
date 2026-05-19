# Lab Link State

## Current Position

- Date: 2026-05-19 America/Chicago
- Phase: 11 - V3 Modular Platform
- Plan: V3 Foundation
- Status: In Progress (Foundation Complete)
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
- PRD v2.7 modular block workspace is active for the tabbed Lab Blocks Runtime: `docs/product/PRD_V2_7_MODULAR_BLOCK_WORKSPACE.md`.
- PRD v2.8 collaborative repo guard is active for multi-agent scanning and validation: `docs/product/PRD_V2_8_COLLABORATIVE_REPO_GUARD.md`.
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

`LABLINK_COLLABORATIVE_REPO_GUARD_BETA9`

Current V3 foundation completion promises:

`LABLINK_V3_DESIGN_SYSTEM_COMPLETE`
`LABLINK_V3_ANIMATIONS_COMPLETE`
`LABLINK_V3_EVENT_BUS_COMPLETE`
`LABLINK_V3_WEB_COMPONENTS_BASE_COMPLETE`
`LABLINK_V3_BLOCK_REGISTRY_COMPLETE`
`LABLINK_V3_STREAMING_UI_COMPLETE`

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
- The refined v2.6 browser should avoid native-looking primary dropdowns and dashboard walls: command composer, focus canvas, adaptive sections, role presets, inspector sheet, progressive Motion/Floating UI/Sortable enhancement, guided OAuth URL/code-exchange helpers, and real-provider AI organization are the current interaction model.
- The v2.7 browser restores the modular block design: workspace tabs, draggable lab blocks, per-block subtabs, animated organize loading, AI-controlled block plans, and manual block controls.
- The v2.8 repo guard adds `lablink repo scan` and npm scripts to detect outside edits, classify risk, and run syntax/web/full validation without destructive git operations.

## V3 Implementation Progress

**Phase 1 Foundation:** ✅ COMPLETE
- Design system, animations, event bus
- LabBlock base component
- Block registry with 17 manifests
- Streaming AI (frontend + backend)

**Phase 2 Core Blocks:** ⏳ STARTED
- Priority Queue: Started
- Meeting Studio: Pending
- Experiment Readiness: Pending
- AI Review: Pending

See `docs/superpowers/V3_CONTINUATION.md` for detailed status and next steps.

## Next Actions

- Continue V3 Phase 2: Implement core blocks (Meeting Studio, Experiment Readiness, AI Review)
- Integrate V3 blocks into main app (create app-v3.js)
- Test streaming AI with real interactions
- Complete remaining phases 3-7 (lab features, coordination, integrations, polish)
- Start the local web server for browser review
- Publish V3 beta after comprehensive testing
- Run `npm run repo:scan` after any external Claude/developer change before building on top of it

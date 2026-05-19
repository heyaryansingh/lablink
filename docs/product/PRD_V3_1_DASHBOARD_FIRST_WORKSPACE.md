# Lab Link PRD v3.1 - Dashboard-First Lab Workspace Repair

Date: 2026-05-19
Status: Implementation spec
Completion promise: `LABLINK_V3_1_DASHBOARD_FIRST_WORKSPACE`

## 1. Problem

The current V3 browser surface can collapse into a single header with an "AI Organize" button. The comprehensive lab blocks exist in the repo, but the app shell depends on incomplete block registry wiring and missing persisted workspace state. When registry lookup fails, the dashboard disappears and the AI action appears to do nothing.

This is the wrong hierarchy. Lab Link must open as a useful lab operating dashboard before any AI customization is invoked. AI should be a powerful workspace studio that can reorganize, propose sections, tune subtabs, and customize the lab workspace, but it should not be the entire first screen.

## 2. Product Direction

Lab Link v3.1 becomes a dashboard-first lab workspace:

- The first screen is the lab command dashboard: priorities, risks, meetings, projects, integrations, and lab operations.
- AI organization and AI section creation move into a dedicated Workspace Studio side panel.
- Manual customization works without AI keys.
- AI actions use real configured providers only and show explicit setup guidance if no provider is configured.
- Workspace state is normalized defensively so malformed or old saved layouts never blank the dashboard.
- Blocks remain modular and subtabs remain configurable, but the default experience is not a block catalog.

## 3. User Experience Requirements

### 3.1 First Screen

The app must launch into a calm command dashboard with:

- Lab identity, user role, and provider/integration readiness.
- Workspace navigation for Command, Experiments, Meetings, Portfolio, and Integrations.
- Metric strip: open tasks, pending AI review items, risk count, projects, meetings, unread messages.
- Focus board with the top task, next meeting, highest project risk, and recent signals.
- Dashboard columns for Today, Project Health, Meeting Coordination, and Lab Systems.
- Modular blocks below the dashboard, selected by workspace.

### 3.2 AI Workspace Studio

AI customization is moved out of the main dashboard into a dedicated panel:

- Opened by "Workspace Studio", not shown as the only primary surface.
- Contains intent input, real-provider AI organize, AI section proposal, manual custom section creation, block visibility toggles, and subtab preferences.
- Shows provider readiness before actions.
- If no real AI provider is configured, AI buttons are disabled with setup text.
- Manual block/subtab changes remain available without AI.

### 3.3 Resilience

The app must never show an empty workspace because of:

- Missing `/api/state` fields.
- Old saved `visibleBlocks` as strings rather than objects.
- Unknown block ids returned by AI.
- Missing manifest registration.
- Failed AI response.

Fallback must be the Command workspace with six useful lab blocks.

### 3.4 Interaction

Required interactions:

- Switch workspace tabs without page reload.
- Open/close Workspace Studio.
- Toggle blocks on/off.
- Choose default subtab for any visible block.
- Save layout to local browser storage.
- Reset layout.
- Create a manual custom section via API.
- Run real AI organization when a provider is configured.
- Surface AI/provider/API errors visibly in the UI.

## 4. Technical Requirements

### 4.1 App Shell

Replace the thin V3 shell in `web/public/app-v3.js` with a stateful native module:

- Import `BLOCK_MANIFESTS` directly rather than relying on unregistered registry state.
- Normalize all block configs through a single function.
- Persist workspace preferences in `localStorage`.
- Render a light-DOM dashboard for top-level operational summaries.
- Render Web Component blocks for modular work surfaces.

### 4.2 Design

Add production-grade layout classes to `web/public/design-system.css`:

- Fixed left rail on desktop, top stacked nav on mobile.
- Dashboard-first main region with constrained width.
- No nested decorative cards.
- Dense, readable operational panels.
- Subtle motion, hover, and focus states.
- Responsive grid that does not collapse text into unreadable controls.

### 4.3 Block Rendering

Block rendering must:

- Use manifest component names from `BLOCK_MANIFESTS`.
- Tolerate unknown blocks.
- Respect preferred subtabs via `data-initial-subtab`.
- Keep comprehensive default blocks visible for each workspace.

### 4.4 Real AI Policy

No mock AI responses are allowed.

- AI organize calls `/api/ai/organize/stream` through `streamingAI`.
- AI section proposal calls `/api/ai/builder/propose/stream`.
- If providers are not configured, the UI displays setup requirements and keeps manual customization available.
- AI failures do not wipe current layout.

### 4.5 Base Component Polish

The block base component should make shared button, badge, input, and line-clamp styling available inside Shadow DOM so existing blocks no longer look like unstyled HTML controls.

## 5. GSD Implementation Plan

### Layer 1: Repair and normalize

- Fix manifest lookup by using `BLOCK_MANIFESTS`.
- Add normalized default workspace layouts.
- Add local storage layout persistence.
- Ensure the app always renders a non-empty Command dashboard.

Completion promise: `LABLINK_V3_1_RESILIENT_LAYOUT`

### Layer 2: Dashboard-first shell

- Implement left rail, command header, metric strip, focus board, and dashboard cards.
- Add workspace tab switching.
- Render selected modular blocks below the dashboard.

Completion promise: `LABLINK_V3_1_COMMAND_DASHBOARD`

### Layer 3: Workspace Studio

- Move AI organize into a side panel.
- Add block library toggles.
- Add subtab preference controls.
- Add manual custom section creation.
- Add real AI section proposal controls.

Completion promise: `LABLINK_V3_1_WORKSPACE_STUDIO`

### Layer 4: Polish and validation

- Add responsive CSS.
- Patch Shadow DOM shared primitive styles.
- Remove garbled/random icon text from V3 controls.
- Run web smoke, repo scan, and release check.

Completion promise: `LABLINK_V3_1_POLISHED_AND_VALIDATED`

## 6. Ralph Loop

After each layer:

1. Verify the dashboard still renders without AI credentials.
2. Verify AI controls do not claim success without a real provider.
3. Remove temporary scaffolding and debug-only UI.
4. Check keyboard and mobile basics.
5. Run the smallest relevant validation.
6. Commit only after the loop passes.

## 7. Acceptance Criteria

- Opening `npm run web` shows a comprehensive lab dashboard, not a single AI button.
- At least six relevant modules are visible by default.
- Workspace tabs switch the dashboard and block set.
- Workspace Studio contains AI organize, AI section proposal, manual section creation, block toggles, and subtab selectors.
- AI buttons are visibly unavailable without a real provider and work through real endpoints when configured.
- A bad AI response cannot blank the dashboard.
- `npm run web:smoke`, `npm run validate`, `node bin/lablink.mjs repo scan --full`, and `npm run release:check` pass.


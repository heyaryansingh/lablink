# Lab Link PRD v2.7 - Modular Block Workspace

Date: 2026-05-19  
Status: Implementation spec  
Completion promise: `LABLINK_MODULAR_BLOCK_WORKSPACE_BETA8`

## 1. Product Shift

The refined v2.6 workspace became calmer, but it moved too far away from the modular block design that makes lab work scannable. v2.7 brings back blocks and tabs, while keeping the stronger AI and integration discipline.

The goal is not a generic dashboard. The website should feel like a configurable lab operating desk made of blocks that can be rearranged, hidden, opened, and tuned to the current lab role or workflow.

## 2. Framework Direction

The npm beta must stay reliable and zero-install for reviewers. Instead of adding a large frontend stack before dependency installation is available, v2.7 introduces a purpose-built browser framework inside the web runtime:

**Lab Blocks Runtime**

- typed block registry
- workspace tab registry
- per-block subtabs
- user layout persistence
- provider-backed AI layout plans
- block skeleton/loading states
- progressive Motion One, Floating UI, SortableJS enhancement
- native fallback when external libraries are unavailable

This gives the app a technical structure like a frontend framework without making the beta fragile. It also keeps the path open to compile the block registry into Svelte, Solid, Qwik, or React later if the product needs a full app framework.

## 3. Primary Experience

The first screen should be a block workspace:

- top workspace tabs for real lab modes
- an AI layout composer that understands blocks
- a priority strip for urgent work
- a responsive block grid
- each block has its own subtabs
- blocks can be reordered, hidden, inspected, and restored
- AI can choose which blocks and subtabs matter now
- loading should show animated block thinking states, not a frozen button

## 4. Workspace Tabs

Required v2.7 tabs:

- Command
- Experiments
- Meetings
- Projects
- Integrations
- Build
- Review

Tabs should not be decorative. Each tab changes the default block set and the way information is prioritized.

## 5. Lab Blocks

Initial block registry:

- Priority Queue
- Experiment Readiness
- Meeting Studio
- Reagent Watch
- Project Health
- Calendar Pressure
- Integration Routes
- AI Review
- Inbox Signals
- Custom Sections

Each block must have:

- stable id
- lab-specific title
- domain
- size hint
- default subtabs
- renderer
- setup/provenance metadata
- block actions

## 6. Block Subtabs

Blocks should use subtabs for detail without adding page clutter.

Examples:

- Priority Queue: Today, Blocked, Waiting
- Experiment Readiness: Protocols, Samples, Approvals
- Meeting Studio: Agenda, Transcript, Actions
- Reagent Watch: Stock, Vendors, Risks
- Project Health: Active, At Risk, Deadlines
- Integrations: OAuth, Sync, Publish
- AI Review: Suggestions, Providers, Runs

Subtab selection persists per block.

## 7. AI Customization

AI should customize the block workspace, not just write text.

Provider-backed organizer output should support:

- selected workspace tab
- focus title and brief
- ordered block ids
- visible block ids
- collapsed block ids
- preferred subtab per block
- suggested actions
- rationale/provenance

No fake AI is allowed. If a real provider is unavailable, AI customization must fail with setup guidance while manual block controls still work.

## 8. Loading And Motion

When the user presses Organize:

- the composer enters a distinct working state
- blocks show staggered skeleton overlays
- block headers should pulse subtly
- the result should animate into place
- no layout should blink or hard reset

Use progressive libraries:

- Motion One for staggered block entrance and organizer transitions
- SortableJS for block drag/reorder
- Floating UI for command palette placement

Fallback behavior must remain usable with native CSS transitions and drag/drop.

## 9. Lab-Specific Content Priorities

Real labs need to see:

- urgent commitments
- blocked experiments
- reagent and vendor risk
- sample/cohort readiness
- equipment bookings
- meeting decisions and follow-up
- grant and manuscript deadlines
- unread institutional messages worth action
- integration setup status
- AI suggestions awaiting review

The first view should not treat all blocks equally. Urgent lab constraints should visually outrank lower-priority information.

## 10. Acceptance Criteria

- The default command view uses a modular block grid.
- Workspace tabs are visible and useful.
- Each major block has subtabs.
- AI organizer can return and apply `visibleBlocks`, `orderedBlocks`, and `blockSubtabs`.
- Manual controls can hide, restore, collapse, and reorder blocks.
- Organize shows animated block loading while waiting.
- External libraries remain progressive and non-breaking.
- Real AI policy remains unchanged.
- `npm run web:smoke` passes.
- `npm run validate` passes.
- `npm run release:check` passes.

## 11. Ralph Loop

Loop 1 - block model:

- Add block and workspace registries.
- Replace command home with modular block board.

Loop 2 - subtabs and customization:

- Add persistent per-block subtabs.
- Add block visibility, collapse, inspect, and reorder.

Loop 3 - AI integration:

- Extend organizer schema for blocks and subtabs.
- Apply real-provider plans to the block board.

Loop 4 - motion:

- Add staggered block entrance.
- Add animated organize loading.
- Keep native fallback.

Loop 5 - validation:

- Run smoke, validate, release check, live server boot.

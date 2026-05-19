# Lab Link PRD v2.6 - Refined Adaptive Website

Date: 2026-05-19  
Status: Implemented beta pass  
Completion promise: `LABLINK_REFINED_ADAPTIVE_WEB_BETA7`

## 1. Problem

The current Lab Link website still feels too busy. It has too many visible panels, boxed regions, controls, and prefilled demo surfaces. It communicates capability, but it does not yet feel like a premium, adaptive lab workspace. The product should feel smooth, quiet, and responsive to the user's current intent.

The next implementation pass must remove the random "new design choices" style blocks, reduce dropdown and box clutter, add real motion, and make AI feel integrated into the workspace rather than bolted on as another panel.

## 2. Product References

Do not model this after showcase websites. Lab Link is not a marketing page. It should learn from real workspaces and work-management products, then become more adaptive and lab-specific than they are.

High-level reference patterns:

- **Linear:** speed, keyboard-first operation, low-friction issue/task creation, fast command workflows.
- **Notion:** flexible pages, mixed structured/unstructured work, user-shaped workspace surfaces.
- **Airtable:** custom data models, flexible interfaces, lab-specific databases without code.
- **Asana:** task ownership, project coordination, status visibility, workflow automation.
- **Granola/Fireflies-style meeting tools:** meeting capture, summaries, action extraction, and follow-up flows.
- **Scientific lab notebooks/LIMS/ELN tools:** provenance, protocol tracking, samples, reagents, equipment, compliance, and auditability.

Lab Link should improve these patterns by making AI reshape the workspace itself, not just summarize or generate text.

The implementation must not copy Apple, Granola, Fireflies, Linear, Notion, Airtable, Asana, ELN/LIMS tools, or any other product's code, assets, protected layout, or trade dress.

## 3. Product Principle

Lab Link should not look like a dashboard or a showcase website. It should feel like an adaptive lab operating workspace.

The app should answer one question at any moment:

> What does this lab/user need to see or do right now?

Everything else should be available, but not visible by default.

## 4. Target Experience

The first screen should be a smooth focus workspace:

- no visible "design choices" block
- no full tab bar
- no dense grid of boxed modules
- no unrelated demo boxes
- no permanent settings clutter
- no fake AI output

The user sees a clean focus canvas, a single command/composer input, and a small set of contextual actions. More detail appears only through expansion, search, AI organization, or direct user customization.

## 5. Around 20 Concrete Changes

1. **Remove the design-choice explainer block.**  
   The UI should demonstrate design quality instead of explaining it in a visible panel.

2. **Replace boxed dashboard panels with fluid sections.**  
   Use divider lines, whitespace, and soft surface changes instead of cards everywhere.

3. **Create a single focus canvas.**  
   The primary view should have one main object: current lab focus, meeting, project, or AI-generated operating plan.

4. **Replace dropdown-heavy navigation with a command surface.**  
   Use one compact workspace switcher plus a command/search field. Avoid traditional dashboard tab rows and large selector walls.

5. **Add smooth workspace transitions.**  
   Changing workspace, expanding a section, or applying an AI plan should animate with position/opacity changes.

6. **Add panel morphing instead of panels appearing abruptly.**  
   Existing content should resize/reflow smoothly when AI changes visible sections.

7. **Add an AI command composer as the main interaction.**  
   "What are you trying to do?" should be the entry point for reorganizing the workspace.

8. **Make AI organize the whole page, not just output text.**  
   Provider-backed AI should decide visible sections, order, collapsed state, focus copy, relevant lab modules, and next actions.

9. **Add saved workspace modes.**  
   Include Focus, Meeting, PI Review, Grant Push, Wet Lab Ops, Computational Ops, Equipment, Reagents, Animal Work, Safety, and Integration Setup presets.

10. **Add direct manipulation for sections.**  
   Users should drag/reorder sections, collapse them, pin them, and hide them without editing config files.

11. **Add inline personalization controls.**  
   Customization should appear where the user works, not in a separate settings wall.

12. **Replace prefilled demo feeling with contextual state.**  
   Demo values can exist, but they should read as a live workspace with clear provenance, not random filler boxes.

13. **Make custom Lab Builder sections feel native.**  
   AI-created sections should join the workspace with the same visual language, transitions, and controls as built-in sections.

14. **Add an adaptive right-side inspector that appears only when needed.**  
   It should slide in for detail review, AI provenance, meeting analysis, or integration setup, then disappear.

15. **Add premium empty/loading states.**  
   Loading should use skeletons or soft shimmer, not text blocks or sudden layout jumps.

16. **Add a refined typography scale.**  
   Use fewer font sizes, stronger hierarchy, more whitespace, and calmer labels.

17. **Reduce color noise.**  
   Keep one restrained accent color, one risk color, one success color, and neutral surfaces.

18. **Add real animation and interaction libraries.**  
   Use lightweight libraries such as Motion One for transitions, Floating UI for menus/tooltips, and SortableJS for section reordering.

19. **Add AI provenance and confidence as subtle metadata.**  
   AI outputs should show provider/model/source quietly, not as large boxed status panels.

20. **Make integration setup guided, not boxy.**  
   Replace integration cards with a stepper/checklist surface that moves from credentials to consent to sync to publish.

21. **Add keyboard-first command behavior.**  
   `Cmd/Ctrl+K` opens command search; arrow keys move through results; enter applies workspace actions.

22. **Add responsive mobile behavior that is not just stacked boxes.**  
   Mobile should use a focus-first sheet model with bottom actions and slide-up detail drawers.

23. **Add preference persistence for every layout decision.**  
   Workspace mode, section order, pinned sections, collapsed sections, density, and inspector state should persist.

24. **Add a "calm mode."**  
   Calm mode hides counts, badges, low-priority items, and secondary metadata until hover or focus.

25. **Add a visual QA checklist.**  
   Before shipping, verify no overlapping text, no jumpy transitions, no box overload, usable keyboard navigation, and acceptable mobile layout.

26. **Add lab-specific section types.**  
   Built-in and AI-created sections should support protocols, samples, reagents, equipment, animal cohorts, grant deadlines, safety/compliance, microscopy bookings, compute jobs, manuscripts, onboarding, and collaboration follow-up.

27. **Add agentic workspace actions.**  
   AI should be able to propose and, after approval, create tasks, update section fields, schedule follow-ups, draft Slack/Notion updates, prepare meeting agendas, and generate lab-specific operating briefs.

28. **Add user and role adaptation.**  
   The workspace should adapt differently for PI, grad student, postdoc, technician, lab manager, research coordinator, computational scientist, and core facility user.

29. **Add provenance everywhere.**  
   Every task, risk, section field, AI action, meeting note, and integration update should show where it came from when inspected.

30. **Add a living lab ontology.**  
   Lab Link should gradually learn lab-specific objects, vocabulary, protocols, people, recurring meetings, instruments, grants, and project conventions.

## 6. External Libraries

Use external libraries only where they materially improve interaction quality:

- `@motionone/dom` or equivalent Motion One package for smooth transitions.
- `@floating-ui/dom` for polished popovers, menus, and contextual inspectors.
- `sortablejs` for direct manipulation of section order.

Do not add a large frontend framework just for motion. The current lightweight runtime can remain, with a small, intentional dependency set for the web product if package size and release checks stay clean.

Implementation rule:

- Load external interaction libraries progressively.
- The product must still run if a CDN or registry is unavailable.
- Library failure must degrade to native transitions and native drag behavior, not a broken app.
- The app must report enhanced/fallback interaction mode quietly in the inspector.

## 7. New Interaction Model

The website should have four interaction layers:

1. **Focus Canvas:** the main working surface.
2. **Command Composer:** AI and search entry point.
3. **Adaptive Sections:** reorderable, collapsible, hideable lab surfaces.
4. **Inspector Sheet:** temporary detail/provenance/setup panel.

The existing left rail should become a compact command area, not a dashboard sidebar.

Native-looking dropdowns should be removed from the primary UI. Workspaces should be selected through a command surface, pill controls, keyboard palette, or floating menu. A native select may remain only as an accessibility fallback if needed.

## 8. Lab-Specific Workspace Model

The website should be built around objects that real labs manage:

- projects
- experiments
- protocols
- samples
- reagents
- equipment
- animal cohorts
- grants
- manuscripts
- meetings
- people
- tasks
- risks
- compliance items
- external collaborators
- integrations

AI should help create and connect these objects, but humans remain accountable for applying changes.

## 9. AI Integration Requirements

AI should be able to:

- reorganize the current workspace
- suggest workspace presets
- generate new lab sections
- rename sections for clarity
- summarize why a layout changed
- hide non-relevant sections
- suggest next actions
- create meeting follow-up surfaces
- suggest integration setup steps
- infer lab-specific object types from meetings, email, calendar, and user input
- recommend which integrations matter for the current workflow
- create role-specific views
- keep provenance attached to every proposed change

AI must still use a real configured provider. No fake AI responses or local pretend "AI" plans.

AI organizer output should include:

- selected workspace
- focus title and brief
- ordered section list
- visible section list
- collapsed section list
- pinned lab section IDs
- role-specific suggestions
- integration setup suggestions
- provenance note

Manual controls must be able to override every AI layout choice.

## 10. Integration Requirements

The website should move beyond a passive integration status grid.

Required v2.6 integration surfaces:

- guided setup flow for Zoom, Google, Microsoft, Slack, Notion, and messaging
- OAuth authorization URL generation where credentials exist
- Zoom token refresh action when refresh token and app credentials exist
- Zoom meeting creation remains real-token-only
- email/calendar providers expose setup and consent steps
- integrations show what Lab Link can do now, what needs credentials, and what is blocked by policy or missing consent

No integration should claim to be active unless credentials and route capability exist.

## 11. Visual And Interaction Rules

The implementation should avoid:

- native dropdowns in primary flows
- nested cards
- grid walls
- visible implementation/design explanation copy
- text-heavy labels around every control
- abrupt layout jumps
- always-visible settings blocks
- generic empty-state filler
- marketing adjectives

The implementation should include:

- smooth entry/exit transitions
- section reordering
- inspector sheets
- command palette
- guided integration setup
- skeleton loading
- reduced default visible sections
- keyboard-first actions
- custom section surfaces that look native

## 12. Acceptance Criteria

Implementation is acceptable only if:

- the visible UI has fewer boxes than v2.6-prework
- the random visible design-choice block is removed
- native-looking dropdowns are removed from primary navigation
- workspace changes animate smoothly
- AI can reorganize the visible workspace through a real provider
- users can manually control visible sections without editing code
- users can reorder sections directly
- custom sections feel native
- loading and empty states feel deliberate
- integrations have a guided setup surface and real OAuth helper routes where possible
- mobile layout is usable and not just a stack of cards
- `npm run web:smoke` passes
- `npm run validate` passes
- `npm run release:check` passes

## 13. Implementation Sequence After Approval

1. Add Motion/Floating UI/Sortable dependency strategy.
2. Redesign the shell into focus canvas, command composer, adaptive sections, and inspector.
3. Remove visible design explainer blocks.
4. Build animated state transitions.
5. Build section reorder/collapse/pin/hide.
6. Add lab-specific section types and section schemas.
7. Upgrade AI organizer to output ordered sections, role-specific layout, lab object links, and inspector context.
8. Replace integration cards with guided setup flow.
9. Add skeleton loading and refined empty states.
10. Add provenance inspector for AI, meeting, and integration actions.
11. Run visual and package validation.
12. Commit as the next beta.

## 14. Ralph Loop Notes

Loop 1 - reduce clutter:

- Removed the visible design-explanation block.
- Moved primary navigation into a compact composer, workspace pills, and command palette.
- Kept only the focus canvas and selected adaptive sections visible by default.

Loop 2 - make customization direct:

- Added role presets for PI, lab manager, researcher, and computational workflows.
- Added direct section ordering, collapse, hide, and density controls without native select menus.
- Persisted layout decisions locally.

Loop 3 - make integrations real:

- Added guided OAuth URL generation for Zoom, Google, and Microsoft.
- Added OAuth authorization-code exchange for Zoom, Google, and Microsoft.
- Kept Zoom meeting creation and AI actions real-token-only.

Loop 4 - validate:

- Required checks: `npm run web:smoke`, `npm run validate`, and `npm run release:check`.
- No mock AI responses are allowed; missing credentials must return setup errors.

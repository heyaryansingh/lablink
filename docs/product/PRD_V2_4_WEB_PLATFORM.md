# Lab Link PRD v2.4 - Web Platform And Meeting Intelligence

Date: 2026-05-18  
Status: Active implementation PRD  
Completion promise: `LABLINK_WEB_PLATFORM_BETA_READY`

## 1. Product Intent

Lab Link must become a dual-surface product: a fast terminal runtime for developers and a refined browser workspace for lab operators, PIs, research coordinators, and technical collaborators. The website should feel like an operating console for a real research lab, not a marketing page and not a generic dashboard template.

The web app must preserve the current beta constraints:

- zero-dependency launch path where practical
- npm-installable and runnable by outside developers
- no fake AI responses
- no fake meeting joins or pretend Zoom automation
- clear setup states when real credentials are missing
- local-first data by default with server-ready boundaries

Third-party product inspiration is allowed at the pattern level only. Lab Link must not copy private or public source code from products such as Granola, Fireflies, or other meeting-note platforms unless the code is explicitly open source, licensed compatibly, reviewed, and attributed. The v2.4 implementation must be original.

## 2. User Goals

1. Open a professional web workspace with lab priorities, meetings, projects, risks, integrations, and AI review visible at once.
2. Reorder and personalize navigation and working tabs so each lab can adapt the surface to its operating style.
3. Start or prepare meetings from the app, including Zoom meeting creation when a real Zoom token is configured.
4. Capture live meeting notes from the browser when supported, with transparent local rules-based topic/task/risk extraction.
5. Run real provider-backed AI analysis only when OpenAI, Anthropic, local, or custom credentials are configured.
6. See what integrations are ready for Microsoft, Google, Slack, Notion, WhatsApp, Zoom, and AI providers.
7. Test the product from npm without cloning or installing a complex frontend toolchain.

## 3. Design Direction

The first screen is the product itself. There is no landing page.

### 3.1 Layout Model

The web app uses a three-plane operations layout:

- **Command rail:** persistent left-side navigation with lab identity, workspace modules, integration state, and density controls.
- **Workspace tabs:** reorderable top tabs for active operating modes such as Command, Projects, Meeting Studio, AI Review, Integrations, and Settings.
- **Intelligence rail:** persistent right-side context for review queue, provider status, meeting extraction, and next actions.

This keeps daily work, customization, and AI review visible without burying the user in separate pages.

### 3.2 Visual System

The visual system should be quiet, technical, and information-dense:

- off-white canvas, ink text, fine borders, and restrained accent colors
- compact controls with crisp alignment and predictable spacing
- cards only for repeated objects and framed tools, not for every page section
- no decorative blobs, generic gradients, stock imagery, or fake hero art
- stable component dimensions so tabs, buttons, counters, and panels do not jump
- text must fit inside buttons and panels on desktop and mobile

The interface should resemble an internal product built by a serious research software company: calm, legible, configurable, and audit-friendly.

### 3.3 Navigation And Customization

Navigation customization is a core product feature, not a settings afterthought.

Required v2.4 behavior:

- top workspace tabs can be reordered with drag and drop
- tab order persists in browser storage
- density can be switched between compact and comfortable
- command rail can be focused on operations, meetings, or integrations
- each lab profile can expose different modules through feature flags
- settings must surface configurable modules, providers, and integration readiness

Future behavior:

- saved layout presets per user or lab
- custom module labels and iconography
- role-based tab defaults for PI, grad student, technician, coordinator, and core facility staff
- command palette and keyboard routing parity with the terminal

## 4. Meeting Studio Requirements

Meeting Studio is the first major website-only feature. It turns agenda, transcript, and context into execution objects.

### 4.1 Meeting Preparation

The app should show:

- agenda editor
- linked project and risk context
- upcoming calendar items
- expected follow-ups
- integration readiness for Zoom, Google Calendar, Microsoft Calendar, Slack, Notion, and messaging surfaces

### 4.2 Zoom Meeting Creation

Lab Link can create a real Zoom meeting only when a real Zoom access token is configured.

Initial implementation:

- `POST /api/zoom/start` accepts meeting title and agenda.
- If `ZOOM_ACCESS_TOKEN` exists, call Zoom's user meeting creation API.
- If credentials are missing, return a setup error with required environment variables.
- Do not fabricate a meeting URL.

Future implementation:

- OAuth device or loopback flow
- token refresh and encrypted local storage
- institution-level Zoom app configuration
- meeting bot provider adapter with explicit consent text

### 4.3 Live Notes Without A Bot

Browser-based live notes are supported when the browser exposes speech recognition.

Initial implementation:

- use browser speech recognition when available
- append recognized transcript text into Meeting Studio
- run transparent local rules-based extraction for topics, tasks, decisions, and risks
- label that extraction as rules-based, not AI
- let the user run provider-backed AI analysis separately

Limitations must be visible. If the browser does not support speech recognition, the app must explain that live capture is unavailable in that browser.

### 4.4 Real AI Meeting Analysis

Provider-backed meeting analysis must:

- require a real configured provider
- fail clearly when no provider exists
- include agenda, transcript, project state, tasks, risks, and meetings as context
- produce summary, decisions, task proposals, risks, follow-ups, and coordination notes
- record provider and model metadata
- avoid claiming execution unless an action was actually applied

## 5. AI And Automation Requirements

The AI layer remains provider-neutral:

- OpenAI Responses API through `OPENAI_API_KEY`
- Anthropic Messages API through `ANTHROPIC_API_KEY`
- local OpenAI-compatible endpoint through `LABLINK_LOCAL_AI_URL`
- custom OpenAI-compatible endpoint through `LABLINK_CUSTOM_AI_URL`

No web route may return generated-looking AI text unless a real provider call succeeded. Deterministic local extraction may exist, but it must be labeled as rules-based.

AI surfaces in v2.4:

- meeting analysis
- lab operations insight generation
- schedule recommendation hook
- task progress proposal hook
- provider status and setup guidance

## 6. Integration Requirements

The website must expose integration readiness without pretending integrations are active.

Initial status surface:

- Microsoft Graph for Outlook mail, Outlook calendar, OneDrive
- Google Workspace for Gmail, Google Calendar, Drive
- Zoom for meeting creation and recordings
- Slack for channel updates and action publishing
- Notion for meeting summaries and lab wiki publishing
- WhatsApp or messaging adapter for future coordination notifications
- AI providers

Each integration state should include configured/not configured/adapter planned, the relevant environment variables, and the next setup step.

## 7. Technical Strategy

The v2.4 beta should avoid a React/Vite dependency chain. The first web surface will use:

- Node.js built-in HTTP server
- static HTML, CSS, and browser JavaScript
- no runtime npm dependencies
- same local JSON data file as the bootstrap CLI
- npm scripts for web start and web smoke validation
- CLI command `lablink web`

This keeps the npm beta easy to run while leaving room for a richer full-stack runtime later.

## 8. API Surface

Required routes:

- `GET /api/health`
- `GET /api/state`
- `GET /api/integrations`
- `POST /api/meeting/rules`
- `POST /api/meeting/analyze`
- `POST /api/zoom/start`

All API responses must be JSON. AI and Zoom setup failures should use HTTP 409 with actionable setup fields.

## 9. GSD Implementation Plan

Layer 1: PRD and planning checkpoint  
Layer 2: static web shell and original design system  
Layer 3: data API backed by current Lab Link store  
Layer 4: Meeting Studio with agenda, transcript, local rules extraction, and real AI analysis route  
Layer 5: Zoom start route with real-token-only behavior  
Layer 6: integration readiness and customization controls  
Layer 7: package scripts, release check, README, and npm beta readiness  
Layer 8: Ralph loop refinement and commit

## 10. Ralph Loop Checklist

After each meaningful layer:

1. Build the smallest coherent version.
2. Run available verification.
3. Inspect for fake-complete behavior.
4. Remove temporary or misleading intermediate features.
5. Improve the weakest visible part.
6. Update planning documents.
7. Commit locally.

The completion promise is true only when:

- `lablink web` can launch the website
- `lablink web --smoke` passes
- `npm run validate` passes
- `npm run release:check` validates the installed package web command
- missing provider credentials fail honestly
- the demo website renders a complete user experience with realistic local data

## 11. Out Of Scope For This Beta

- joining Zoom calls as a bot without a configured provider and consent flow
- shipping institution OAuth credentials
- background sync daemon
- production authentication and multi-user permissions
- copying code from unrelated meeting assistant products
- claiming real AI analysis when no provider call was made


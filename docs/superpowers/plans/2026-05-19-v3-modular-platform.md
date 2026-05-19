# LabLink V3 Modular Platform Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform LabLink into a production-grade modular lab operating system with Web Components, streaming AI, professional design, and comprehensive lab features.

**Architecture:** Web Component-based plugin system with formal block manifests, Server-Sent Events for AI streaming, CSS custom properties design system, context-aware feature discovery, and zero-dependency bootstrap runtime.

**Tech Stack:** Vanilla JS, Web Components, Server-Sent Events, CSS Custom Properties, LocalStorage/IndexedDB, Progressive Enhancement (Motion One, Floating UI, SortableJS as optional)

**PRD Reference:** `docs/product/PRD_V3_MODULAR_PLATFORM.md`

---

## File Structure Overview

### New Files to Create

**Design System:**
- `web/public/design-system.css` - Complete CSS custom properties and utility classes
- `web/public/animations.css` - Animation definitions and keyframes

**Web Components Base:**
- `web/public/components/lab-block.js` - Base class for all blocks
- `web/public/components/lab-workspace.js` - Main workspace container
- `web/public/components/lab-topbar.js` - Top navigation bar
- `web/public/components/lab-command-composer.js` - AI command interface
- `web/public/components/lab-block-grid.js` - Block layout grid
- `web/public/components/lab-inspector-panel.js` - Inspector sidebar

**Block Registry:**
- `web/public/registry/block-registry.js` - Block registration and discovery
- `web/public/registry/block-manifests.js` - All block manifest definitions
- `web/public/registry/context-evaluator.js` - Context rule evaluation engine

**Streaming AI:**
- `web/server/routes/ai-stream.js` - SSE endpoints
- `web/public/services/streaming-ai.js` - Frontend streaming service
- `web/public/services/event-bus.js` - Cross-component communication

**Core Blocks:**
- `web/public/blocks/lab-priority-queue.js`
- `web/public/blocks/lab-meeting-studio.js`
- `web/public/blocks/lab-experiment-readiness.js`
- `web/public/blocks/lab-ai-review.js`

**Lab Feature Blocks:**
- `web/public/blocks/lab-equipment-tracker.js`
- `web/public/blocks/lab-sample-pipeline.js`
- `web/public/blocks/lab-reagent-watch.js`
- `web/public/blocks/lab-safety-checklist.js`

**Coordination Blocks:**
- `web/public/blocks/lab-team-coordination.js`
- `web/public/blocks/lab-grant-milestones.js`
- `web/public/blocks/lab-risk-radar.js`
- `web/public/blocks/lab-data-pipeline.js`

**Supporting Blocks:**
- `web/public/blocks/lab-project-health.js`
- `web/public/blocks/lab-calendar-pressure.js`
- `web/public/blocks/lab-integration-routes.js`
- `web/public/blocks/lab-inbox-signals.js`
- `web/public/blocks/lab-custom-sections.js`

**Integration Layer:**
- `web/public/components/lab-oauth-wizard.js` - OAuth setup wizard
- `web/public/services/integration-manager.js` - Integration health monitoring
- `web/public/adapters/zoom-adapter.js`
- `web/public/adapters/google-adapter.js`
- `web/public/adapters/microsoft-adapter.js`
- `web/public/adapters/slack-adapter.js`

### Files to Modify

- `web/public/app.js` - Refactor to use new component system
- `web/public/index.html` - Update to load new modules
- `web/public/styles.css` - Migrate to design-system.css
- `web/server/index.js` - Add SSE endpoints
- `bin/lablink.mjs` - Add v3 build steps

---

## Chunk 1: Phase 1 - Foundation (Design System & Web Components Base)

### Task 1.1: Design System CSS

**Files:**
- Create: `web/public/design-system.css`

- [ ] **Step 1: Create design system file with CSS custom properties**

```css
/* web/public/design-system.css */

:root {
  /* Color Palette - Primary (Lab Blue) */
  --color-primary-50: hsl(210, 100%, 97%);
  --color-primary-100: hsl(210, 95%, 92%);
  --color-primary-200: hsl(210, 95%, 85%);
  --color-primary-300: hsl(210, 95%, 75%);
  --color-primary-400: hsl(210, 95%, 65%);
  --color-primary-500: hsl(210, 95%, 50%);
  --color-primary-600: hsl(210, 90%, 45%);
  --color-primary-700: hsl(210, 85%, 38%);
  --color-primary-800: hsl(210, 82%, 30%);
  --color-primary-900: hsl(210, 80%, 20%);

  /* Neutral Scale */
  --color-neutral-50: hsl(220, 20%, 98%);
  --color-neutral-100: hsl(220, 15%, 95%);
  --color-neutral-200: hsl(220, 13%, 90%);
  --color-neutral-300: hsl(220, 12%, 80%);
  --color-neutral-400: hsl(220, 10%, 65%);
  --color-neutral-500: hsl(220, 10%, 50%);
  --color-neutral-600: hsl(220, 12%, 40%);
  --color-neutral-700: hsl(220, 15%, 30%);
  --color-neutral-800: hsl(220, 18%, 20%);
  --color-neutral-900: hsl(220, 20%, 15%);

  /* Semantic Colors */
  --color-success-500: hsl(145, 60%, 45%);
  --color-success-600: hsl(145, 65%, 38%);
  --color-warning-500: hsl(35, 90%, 55%);
  --color-warning-600: hsl(35, 92%, 48%);
  --color-error-500: hsl(0, 70%, 55%);
  --color-error-600: hsl(0, 75%, 48%);
  --color-info-500: hsl(200, 90%, 50%);
  --color-info-600: hsl(200, 85%, 45%);

  /* Surface Colors */
  --surface-bg: hsl(220, 15%, 99%);
  --surface-elevated: hsl(0, 0%, 100%);
  --surface-interactive: var(--color-primary-50);
  --surface-hover: var(--color-neutral-100);
  --surface-pressed: var(--color-neutral-200);
  --surface-disabled: var(--color-neutral-100);

  /* Border Colors */
  --border-default: var(--color-neutral-200);
  --border-strong: var(--color-neutral-300);
  --border-interactive: var(--color-primary-300);
  --border-focus: var(--color-primary-500);

  /* Text Colors */
  --text-primary: var(--color-neutral-900);
  --text-secondary: var(--color-neutral-600);
  --text-tertiary: var(--color-neutral-500);
  --text-disabled: var(--color-neutral-400);
  --text-on-primary: white;
  --text-on-error: white;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.10);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);

  /* Spacing Scale (4px base) */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-24: 96px;

  /* Typography */
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", sans-serif;
  --font-mono: "SF Mono", Consolas, "Courier New", monospace;

  --text-xs: 12px;
  --text-sm: 14px;
  --text-base: 16px;
  --text-lg: 18px;
  --text-xl: 20px;
  --text-2xl: 24px;
  --text-3xl: 32px;
  --text-4xl: 48px;

  --line-height-tight: 1.25;
  --line-height-snug: 1.375;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.625;
  --line-height-loose: 2;

  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;

  /* Animation */
  --duration-fast: 150ms;
  --duration-base: 250ms;
  --duration-slow: 400ms;
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);

  /* Z-index Scale */
  --z-base: 0;
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-fixed: 300;
  --z-modal-backdrop: 400;
  --z-modal: 500;
  --z-popover: 600;
  --z-tooltip: 700;
}

/* Base Reset */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-sans);
  font-size: var(--text-base);
  line-height: var(--line-height-normal);
  color: var(--text-primary);
  background-color: var(--surface-bg);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Typography Utilities */
.text-xs { font-size: var(--text-xs); line-height: var(--line-height-normal); }
.text-sm { font-size: var(--text-sm); line-height: var(--line-height-normal); }
.text-base { font-size: var(--text-base); line-height: var(--line-height-normal); }
.text-lg { font-size: var(--text-lg); line-height: var(--line-height-relaxed); }
.text-xl { font-size: var(--text-xl); line-height: var(--line-height-relaxed); }
.text-2xl { font-size: var(--text-2xl); line-height: var(--line-height-snug); }
.text-3xl { font-size: var(--text-3xl); line-height: var(--line-height-tight); }
.text-4xl { font-size: var(--text-4xl); line-height: var(--line-height-tight); }

.font-normal { font-weight: var(--font-weight-normal); }
.font-medium { font-weight: var(--font-weight-medium); }
.font-semibold { font-weight: var(--font-weight-semibold); }
.font-bold { font-weight: var(--font-weight-bold); }

.text-primary { color: var(--text-primary); }
.text-secondary { color: var(--text-secondary); }
.text-tertiary { color: var(--text-tertiary); }

/* Spacing Utilities */
.m-1 { margin: var(--space-1); }
.m-2 { margin: var(--space-2); }
.m-3 { margin: var(--space-3); }
.m-4 { margin: var(--space-4); }
.m-6 { margin: var(--space-6); }
.m-8 { margin: var(--space-8); }

.mt-1 { margin-top: var(--space-1); }
.mt-2 { margin-top: var(--space-2); }
.mt-3 { margin-top: var(--space-3); }
.mt-4 { margin-top: var(--space-4); }
.mt-6 { margin-top: var(--space-6); }
.mt-8 { margin-top: var(--space-8); }

.mb-1 { margin-bottom: var(--space-1); }
.mb-2 { margin-bottom: var(--space-2); }
.mb-3 { margin-bottom: var(--space-3); }
.mb-4 { margin-bottom: var(--space-4); }
.mb-6 { margin-bottom: var(--space-6); }
.mb-8 { margin-bottom: var(--space-8); }

.ml-1 { margin-left: var(--space-1); }
.ml-2 { margin-left: var(--space-2); }
.ml-3 { margin-left: var(--space-3); }
.ml-4 { margin-left: var(--space-4); }

.mr-1 { margin-right: var(--space-1); }
.mr-2 { margin-right: var(--space-2); }
.mr-3 { margin-right: var(--space-3); }
.mr-4 { margin-right: var(--space-4); }

.p-1 { padding: var(--space-1); }
.p-2 { padding: var(--space-2); }
.p-3 { padding: var(--space-3); }
.p-4 { padding: var(--space-4); }
.p-6 { padding: var(--space-6); }
.p-8 { padding: var(--space-8); }

.pt-1 { padding-top: var(--space-1); }
.pt-2 { padding-top: var(--space-2); }
.pt-3 { padding-top: var(--space-3); }
.pt-4 { padding-top: var(--space-4); }

.pb-1 { padding-bottom: var(--space-1); }
.pb-2 { padding-bottom: var(--space-2); }
.pb-3 { padding-bottom: var(--space-3); }
.pb-4 { padding-bottom: var(--space-4); }

.pl-1 { padding-left: var(--space-1); }
.pl-2 { padding-left: var(--space-2); }
.pl-3 { padding-left: var(--space-3); }
.pl-4 { padding-left: var(--space-4); }

.pr-1 { padding-right: var(--space-1); }
.pr-2 { padding-right: var(--space-2); }
.pr-3 { padding-right: var(--space-3); }
.pr-4 { padding-right: var(--space-4); }

.px-2 { padding-left: var(--space-2); padding-right: var(--space-2); }
.px-3 { padding-left: var(--space-3); padding-right: var(--space-3); }
.px-4 { padding-left: var(--space-4); padding-right: var(--space-4); }
.px-6 { padding-left: var(--space-6); padding-right: var(--space-6); }

.py-2 { padding-top: var(--space-2); padding-bottom: var(--space-2); }
.py-3 { padding-top: var(--space-3); padding-bottom: var(--space-3); }
.py-4 { padding-top: var(--space-4); padding-bottom: var(--space-4); }
.py-6 { padding-top: var(--space-6); padding-bottom: var(--space-6); }

/* Layout Utilities */
.flex { display: flex; }
.inline-flex { display: inline-flex; }
.grid { display: grid; }
.block { display: block; }
.inline-block { display: inline-block; }
.hidden { display: none; }

.flex-row { flex-direction: row; }
.flex-col { flex-direction: column; }
.flex-wrap { flex-wrap: wrap; }
.items-start { align-items: flex-start; }
.items-center { align-items: center; }
.items-end { align-items: flex-end; }
.justify-start { justify-content: flex-start; }
.justify-center { justify-content: center; }
.justify-end { justify-content: flex-end; }
.justify-between { justify-content: space-between; }
.gap-2 { gap: var(--space-2); }
.gap-3 { gap: var(--space-3); }
.gap-4 { gap: var(--space-4); }
.gap-6 { gap: var(--space-6); }

/* Component Primitives */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  line-height: 1;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
  user-select: none;
}

.btn:focus {
  outline: none;
  box-shadow: 0 0 0 3px var(--color-primary-100);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background-color: var(--color-primary-500);
  color: var(--text-on-primary);
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--color-primary-600);
}

.btn-secondary {
  background-color: var(--surface-elevated);
  color: var(--text-primary);
  border-color: var(--border-default);
}

.btn-secondary:hover:not(:disabled) {
  background-color: var(--surface-hover);
}

.btn-ghost {
  background-color: transparent;
  color: var(--text-secondary);
}

.btn-ghost:hover:not(:disabled) {
  background-color: var(--surface-hover);
  color: var(--text-primary);
}

.btn-sm {
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-xs);
}

.btn-lg {
  padding: var(--space-4) var(--space-6);
  font-size: var(--text-base);
}

.input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-sm);
  line-height: 1;
  color: var(--text-primary);
  background-color: var(--surface-elevated);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--ease-out);
}

.input:focus {
  outline: none;
  border-color: var(--border-focus);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}

.input:disabled {
  background-color: var(--surface-disabled);
  color: var(--text-disabled);
  cursor: not-allowed;
}

.card {
  background-color: var(--surface-elevated);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
}

.card-header {
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--border-default);
}

.card-title {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-2);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  line-height: 1;
  border-radius: var(--radius-full);
}

.badge-primary {
  background-color: var(--color-primary-100);
  color: var(--color-primary-700);
}

.badge-success {
  background-color: hsl(145, 60%, 90%);
  color: var(--color-success-600);
}

.badge-warning {
  background-color: hsl(35, 90%, 90%);
  color: var(--color-warning-600);
}

.badge-error {
  background-color: hsl(0, 70%, 92%);
  color: var(--color-error-600);
}

/* Skeleton Loading States */
.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-neutral-200) 0%,
    var(--color-neutral-100) 50%,
    var(--color-neutral-200) 100%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
  border-radius: var(--radius-md);
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.skeleton-text {
  height: 1em;
  margin-bottom: 0.5em;
}

.skeleton-title {
  height: 1.5em;
  width: 60%;
  margin-bottom: 1em;
}

.skeleton-block {
  height: 200px;
}

/* Utility Classes */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

- [ ] **Step 2: Verify design system loads**

Test: Open `web/public/index.html` and add link tag temporarily to verify CSS is valid.
Expected: No CSS errors in browser console.

- [ ] **Step 3: Commit design system**

```bash
git add web/public/design-system.css
git commit -m "feat(v3): add design system with CSS custom properties

- Complete color palette (primary, neutral, semantic)
- Spacing scale (4px base)
- Typography system
- Component primitives (buttons, inputs, cards, badges)
- Utility classes (spacing, layout, typography)
- Skeleton loading states

Completion: LABLINK_V3_DESIGN_SYSTEM_COMPLETE"
```

---

### Task 1.2: Animation System

**Files:**
- Create: `web/public/animations.css`

- [ ] **Step 1: Create animations file**

```css
/* web/public/animations.css */

/* Fade Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

/* Slide Animations */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Scale Animations */
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes scaleOut {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.95);
  }
}

/* Pulse Animation */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Spin Animation */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Block Entrance (Staggered) */
@keyframes blockEntrance {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Typing Effect */
@keyframes typing {
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
}

/* Shimmer Effect */
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

/* Animation Utility Classes */
.animate-fadeIn {
  animation: fadeIn var(--duration-base) var(--ease-out);
}

.animate-fadeOut {
  animation: fadeOut var(--duration-fast) var(--ease-in);
}

.animate-slideInUp {
  animation: slideInUp var(--duration-base) var(--ease-out);
}

.animate-slideInDown {
  animation: slideInDown var(--duration-base) var(--ease-out);
}

.animate-slideInLeft {
  animation: slideInLeft var(--duration-base) var(--ease-out);
}

.animate-slideInRight {
  animation: slideInRight var(--duration-base) var(--ease-out);
}

.animate-scaleIn {
  animation: scaleIn var(--duration-base) var(--ease-out);
}

.animate-scaleOut {
  animation: scaleOut var(--duration-fast) var(--ease-in);
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

.animate-blockEntrance {
  animation: blockEntrance var(--duration-base) var(--ease-out);
}

/* Stagger Delays */
.delay-50 { animation-delay: 50ms; }
.delay-100 { animation-delay: 100ms; }
.delay-150 { animation-delay: 150ms; }
.delay-200 { animation-delay: 200ms; }
.delay-250 { animation-delay: 250ms; }
.delay-300 { animation-delay: 300ms; }

/* Transition Utilities */
.transition {
  transition-property: all;
  transition-timing-function: var(--ease-in-out);
  transition-duration: var(--duration-base);
}

.transition-fast {
  transition-duration: var(--duration-fast);
}

.transition-slow {
  transition-duration: var(--duration-slow);
}

.transition-colors {
  transition-property: color, background-color, border-color;
}

.transition-opacity {
  transition-property: opacity;
}

.transition-transform {
  transition-property: transform;
}

/* States */
.is-loading {
  pointer-events: none;
  opacity: 0.6;
}

.is-disabled {
  pointer-events: none;
  opacity: 0.5;
}

.is-hidden {
  display: none;
}

.is-visible {
  display: block;
}
```

- [ ] **Step 2: Commit animations**

```bash
git add web/public/animations.css
git commit -m "feat(v3): add animation system

- Fade, slide, scale, pulse animations
- Block entrance with stagger support
- Transition utilities
- State classes

Completion: LABLINK_V3_ANIMATIONS_COMPLETE"
```

---

### Task 1.3: Event Bus Service

**Files:**
- Create: `web/public/services/event-bus.js`

- [ ] **Step 1: Create event bus for cross-component communication**

```javascript
// web/public/services/event-bus.js

/**
 * Global event bus for cross-component communication
 * Allows Web Components to publish/subscribe to events without tight coupling
 */
class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  /**
   * Subscribe to an event
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);

    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  /**
   * Unsubscribe from an event
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  off(event, callback) {
    if (!this.listeners.has(event)) return;

    const callbacks = this.listeners.get(event);
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }

    if (callbacks.length === 0) {
      this.listeners.delete(event);
    }
  }

  /**
   * Emit an event
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  emit(event, data) {
    if (!this.listeners.has(event)) return;

    const callbacks = this.listeners.get(event);
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for "${event}":`, error);
      }
    });
  }

  /**
   * Subscribe to event once (automatically unsubscribes after first call)
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  once(event, callback) {
    const wrappedCallback = (data) => {
      callback(data);
      this.off(event, wrappedCallback);
    };
    return this.on(event, wrappedCallback);
  }

  /**
   * Clear all listeners for an event, or all events if no event specified
   * @param {string} [event] - Optional event name
   */
  clear(event) {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * Get count of listeners for an event
   * @param {string} event - Event name
   * @returns {number}
   */
  listenerCount(event) {
    return this.listeners.has(event) ? this.listeners.get(event).length : 0;
  }
}

// Create singleton instance
const eventBus = new EventBus();

// Export as default
export default eventBus;

// Standard event names (for documentation/autocomplete)
export const EVENTS = {
  // State events
  STATE_UPDATED: 'state:updated',
  STATE_RESET: 'state:reset',

  // Block events
  BLOCK_MOUNTED: 'block:mounted',
  BLOCK_UNMOUNTED: 'block:unmounted',
  BLOCK_UPDATED: 'block:updated',
  BLOCK_VISIBILITY_CHANGED: 'block:visibility-changed',
  BLOCK_COLLAPSED: 'block:collapsed',
  BLOCK_EXPANDED: 'block:expanded',

  // Workspace events
  WORKSPACE_CHANGED: 'workspace:changed',
  WORKSPACE_ORGANIZED: 'workspace:organized',

  // AI events
  AI_STREAM_START: 'ai:stream-start',
  AI_STREAM_TOKEN: 'ai:stream-token',
  AI_STREAM_PROGRESS: 'ai:stream-progress',
  AI_STREAM_COMPLETE: 'ai:stream-complete',
  AI_STREAM_ERROR: 'ai:stream-error',
  AI_STREAM_CANCELLED: 'ai:stream-cancelled',

  // Data events
  DATA_LOADED: 'data:loaded',
  DATA_UPDATED: 'data:updated',
  DATA_DELETED: 'data:deleted',

  // Integration events
  INTEGRATION_CONNECTED: 'integration:connected',
  INTEGRATION_DISCONNECTED: 'integration:disconnected',
  INTEGRATION_SYNC_START: 'integration:sync-start',
  INTEGRATION_SYNC_COMPLETE: 'integration:sync-complete',
  INTEGRATION_ERROR: 'integration:error',

  // Navigation events
  ROUTE_CHANGED: 'route:changed',
  TAB_CHANGED: 'tab:changed',

  // UI events
  COMMAND_PALETTE_OPEN: 'ui:command-palette-open',
  COMMAND_PALETTE_CLOSE: 'ui:command-palette-close',
  MODAL_OPEN: 'ui:modal-open',
  MODAL_CLOSE: 'ui:modal-close',
  TOAST_SHOW: 'ui:toast-show',

  // Error events
  ERROR_OCCURRED: 'error:occurred',
  ERROR_CLEARED: 'error:cleared',
};
```

- [ ] **Step 2: Commit event bus**

```bash
git add web/public/services/event-bus.js
git commit -m "feat(v3): add event bus for cross-component communication

- Pub/sub pattern for Web Components
- Standard event names documented
- Error handling in listeners
- Once and clear methods

Completion: LABLINK_V3_EVENT_BUS_COMPLETE"
```

---

This plan is extensive and will continue for many more tasks. Due to length constraints, I'll save this first chunk and continue building the remaining chunks in subsequent files.
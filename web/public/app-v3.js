// Lab Link V3.1 - Dashboard-first modular lab workspace
// Native browser app shell with real-provider AI customization isolated in Workspace Studio.

import eventBus, { EVENTS } from './services/event-bus.js';
import streamingAI from './services/streaming-ai.js';
import { BLOCK_MANIFESTS } from './registry/block-manifests.js';

import './blocks/lab-priority-queue.js';
import './blocks/lab-meeting-studio.js';
import './blocks/lab-experiment-readiness.js';
import './blocks/lab-ai-review.js';
import './blocks/lab-equipment-tracker.js';
import './blocks/lab-sample-pipeline.js';
import './blocks/lab-reagent-watch.js';
import './blocks/lab-safety-checklist.js';
import './blocks/lab-team-coordination.js';
import './blocks/lab-grant-milestones.js';
import './blocks/lab-risk-radar.js';
import './blocks/lab-data-pipeline.js';
import './blocks/lab-project-health.js';
import './blocks/lab-calendar-pressure.js';
import './blocks/lab-integration-routes.js';
import './blocks/lab-inbox-signals.js';
import './blocks/lab-custom-sections.js';

const STORAGE_KEY = 'lablink:v3.1:workspace-preferences';

const WORKSPACES = [
  {
    id: 'command',
    label: 'Command',
    eyebrow: 'Lab command',
    title: 'Today in the lab',
    brief: 'The highest-leverage tasks, risks, meetings, and project signals in one operating view.',
  },
  {
    id: 'experiments',
    label: 'Experiments',
    eyebrow: 'Wet lab',
    title: 'Experiment readiness',
    brief: 'Protocols, samples, reagents, equipment, and safety checks for the next run.',
  },
  {
    id: 'meetings',
    label: 'Meetings',
    eyebrow: 'Coordination',
    title: 'Meeting coordination',
    brief: 'Agendas, transcripts, follow-ups, and collaboration signals without burying the dashboard.',
  },
  {
    id: 'portfolio',
    label: 'Portfolio',
    eyebrow: 'Projects',
    title: 'Project and grant portfolio',
    brief: 'Milestones, risks, deadlines, and ownership across the active lab portfolio.',
  },
  {
    id: 'integrations',
    label: 'Systems',
    eyebrow: 'Integrations',
    title: 'Connected lab systems',
    brief: 'Provider readiness, OAuth setup, external tools, and sync routes for real operations.',
  },
];

const WORKSPACE_BLOCKS = {
  command: [
    { id: 'priority-queue', size: 'large' },
    { id: 'project-health', size: 'medium' },
    { id: 'calendar-pressure', size: 'medium' },
    { id: 'risk-radar', size: 'medium' },
    { id: 'meeting-studio', size: 'large' },
    { id: 'ai-review', size: 'medium' },
  ],
  experiments: [
    { id: 'experiment-readiness', size: 'large' },
    { id: 'sample-pipeline', size: 'large' },
    { id: 'reagent-watch', size: 'medium' },
    { id: 'equipment-tracker', size: 'large' },
    { id: 'safety-checklist', size: 'medium' },
    { id: 'risk-radar', size: 'medium' },
  ],
  meetings: [
    { id: 'meeting-studio', size: 'large' },
    { id: 'inbox-signals', size: 'medium' },
    { id: 'priority-queue', size: 'medium' },
    { id: 'calendar-pressure', size: 'medium' },
    { id: 'ai-review', size: 'medium' },
    { id: 'integration-routes', size: 'large' },
  ],
  portfolio: [
    { id: 'project-health', size: 'large' },
    { id: 'grant-milestones', size: 'large' },
    { id: 'risk-radar', size: 'medium' },
    { id: 'team-coordination', size: 'large' },
    { id: 'data-pipeline', size: 'medium' },
    { id: 'ai-review', size: 'medium' },
  ],
  integrations: [
    { id: 'integration-routes', size: 'large' },
    { id: 'inbox-signals', size: 'medium' },
    { id: 'meeting-studio', size: 'large' },
    { id: 'custom-sections', size: 'large' },
    { id: 'ai-review', size: 'medium' },
    { id: 'calendar-pressure', size: 'medium' },
  ],
};

const FALLBACK_STATE = {
  lab: { name: 'Lab Link', institution: 'Local workspace', timezone: 'local' },
  user: { name: 'Lab member', role: 'researcher' },
  counts: { openTasks: 0, unread: 0, pendingAi: 0, risks: 0, projects: 0, meetings: 0 },
  providers: [],
  integrations: [],
  tasks: [],
  projects: [],
  inbox: [],
  meetings: [],
  calendarEvents: [],
  aiSuggestions: [],
  risks: [],
  customSections: [],
  aiRuns: [],
  auditLog: [],
};

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function clampText(value, width = 120) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  return text.length > width ? `${text.slice(0, width - 3)}...` : text;
}

function formatDate(value) {
  if (!value) return 'Unscheduled';
  try {
    const date = new Date(value);
    return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(date);
  } catch {
    return String(value);
  }
}

function formatDateTime(value) {
  if (!value) return 'Unscheduled';
  try {
    const date = new Date(value);
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  } catch {
    return String(value);
  }
}

function priorityTone(priority) {
  if (priority === 'critical' || priority === 'high') return 'danger';
  if (priority === 'medium') return 'warning';
  return 'neutral';
}

function riskTone(value) {
  const text = String(value || '').toLowerCase();
  if (text.includes('high') || text.includes('risk') || text.includes('blocked')) return 'danger';
  if (text.includes('watch') || text.includes('medium')) return 'warning';
  return 'good';
}

function uniqueKnownBlocks(configs, fallback) {
  const source = Array.isArray(configs) && configs.length ? configs : fallback;
  const seen = new Set();
  const normalized = [];

  for (const entry of source) {
    const id = typeof entry === 'string' ? entry : entry?.id;
    if (!id || seen.has(id) || !BLOCK_MANIFESTS[id]) continue;
    seen.add(id);
    normalized.push({
      id,
      size: typeof entry === 'object' && entry?.size ? entry.size : BLOCK_MANIFESTS[id].size?.default || 'medium',
      initialSubtab: typeof entry === 'object' && entry?.initialSubtab ? entry.initialSubtab : '',
    });
  }

  if (normalized.length) return normalized;
  return fallback.filter((entry) => BLOCK_MANIFESTS[entry.id]);
}

function loadPreferences() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return {
      workspace: parsed.workspace || 'command',
      studioOpen: Boolean(parsed.studioOpen),
      density: parsed.density === 'comfortable' ? 'comfortable' : 'compact',
      blocksByWorkspace: parsed.blocksByWorkspace || {},
      blockSubtabs: parsed.blockSubtabs || {},
      lastIntent: parsed.lastIntent || 'Focus the dashboard on blocked experiments, next meetings, and project risks.',
      labProfile: parsed.labProfile || '',
    };
  } catch {
    return {
      workspace: 'command',
      studioOpen: false,
      density: 'compact',
      blocksByWorkspace: {},
      blockSubtabs: {},
      lastIntent: 'Focus the dashboard on blocked experiments, next meetings, and project risks.',
      labProfile: '',
    };
  }
}

function workspaceById(id) {
  return WORKSPACES.find((workspace) => workspace.id === id) || WORKSPACES[0];
}

class LabLinkApp {
  constructor() {
    this.serverState = FALLBACK_STATE;
    this.preferences = loadPreferences();
    this.currentWorkspace = workspaceById(this.preferences.workspace).id;
    this.studioOpen = this.preferences.studioOpen;
    this.status = { tone: 'neutral', message: 'Loading lab workspace.' };
    this.aiBusy = false;
    this.sectionBusy = false;
    this.pendingSection = null;
    this.cancelOrganize = null;
    this.cancelSection = null;

    this.init();
  }

  async init() {
    await this.loadState();
    this.setupEventListeners();
    this.render();
  }

  async loadState() {
    try {
      const response = await fetch('/api/state');
      if (!response.ok) throw new Error(`State request failed with ${response.status}`);
      const data = await response.json();
      this.serverState = { ...FALLBACK_STATE, ...data };
      this.status = { tone: 'good', message: 'Dashboard loaded from the local Lab Link runtime.' };
    } catch (error) {
      this.serverState = FALLBACK_STATE;
      this.status = { tone: 'danger', message: `Using local fallback state. ${error.message}` };
    }
  }

  setupEventListeners() {
    eventBus.on(EVENTS.AI_STREAM_ERROR, ({ error }) => {
      this.status = { tone: 'danger', message: error?.message || 'AI stream failed.' };
      this.aiBusy = false;
      this.sectionBusy = false;
      this.render();
    });

    eventBus.on('meeting:start', () => {
      this.openStudio('Meeting Studio can create Zoom meetings after Zoom credentials are configured.');
    });

    eventBus.on('task:add', () => {
      this.openStudio('Use Workspace Studio to tune the task surface or add a custom lab section.');
    });

    eventBus.on('ai:configure-provider', () => {
      this.currentWorkspace = 'integrations';
      this.openStudio('Set OPENAI_API_KEY, ANTHROPIC_API_KEY, or a compatible local endpoint, then restart the web runtime.');
    });
  }

  providerReady() {
    return (this.serverState.providers || []).some((provider) => provider.status === 'configured');
  }

  configuredProviderLabel() {
    const provider = (this.serverState.providers || []).find((item) => item.status === 'configured');
    return provider ? `${provider.label} (${provider.model || 'configured'})` : 'No real AI provider configured';
  }

  savePreferences() {
    const next = {
      ...this.preferences,
      workspace: this.currentWorkspace,
      studioOpen: this.studioOpen,
      density: this.preferences.density,
    };
    this.preferences = next;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Local storage can be unavailable in restricted browser contexts.
    }
  }

  defaultBlocks(workspaceId = this.currentWorkspace) {
    return WORKSPACE_BLOCKS[workspaceId] || WORKSPACE_BLOCKS.command;
  }

  currentBlocks() {
    const configured = this.preferences.blocksByWorkspace?.[this.currentWorkspace];
    const fallback = this.defaultBlocks(this.currentWorkspace);
    return uniqueKnownBlocks(configured, fallback).map((block) => ({
      ...block,
      initialSubtab: this.preferences.blockSubtabs?.[block.id] || block.initialSubtab || '',
    }));
  }

  setCurrentBlocks(blocks) {
    this.preferences.blocksByWorkspace = {
      ...this.preferences.blocksByWorkspace,
      [this.currentWorkspace]: uniqueKnownBlocks(blocks, this.defaultBlocks(this.currentWorkspace)),
    };
    this.savePreferences();
  }

  switchWorkspace(workspaceId) {
    this.currentWorkspace = workspaceById(workspaceId).id;
    this.status = { tone: 'neutral', message: `Showing ${workspaceById(workspaceId).label}.` };
    this.savePreferences();
    this.render();
  }

  openStudio(message = 'Workspace Studio is open. Manual customization works without AI keys.') {
    this.studioOpen = true;
    this.status = { tone: 'neutral', message };
    this.savePreferences();
    this.render();
  }

  closeStudio() {
    this.studioOpen = false;
    this.savePreferences();
    this.render();
  }

  resetLayout() {
    this.preferences.blocksByWorkspace = {
      ...this.preferences.blocksByWorkspace,
      [this.currentWorkspace]: this.defaultBlocks(this.currentWorkspace),
    };
    this.status = { tone: 'good', message: `${workspaceById(this.currentWorkspace).label} layout reset.` };
    this.savePreferences();
    this.render();
  }

  toggleBlock(blockId, visible) {
    const current = this.currentBlocks();
    if (visible) {
      if (!current.some((block) => block.id === blockId)) {
        const manifest = BLOCK_MANIFESTS[blockId];
        current.push({ id: blockId, size: manifest?.size?.default || 'medium' });
      }
    } else {
      const next = current.filter((block) => block.id !== blockId);
      this.setCurrentBlocks(next.length ? next : this.defaultBlocks(this.currentWorkspace));
      this.status = next.length
        ? { tone: 'neutral', message: `${BLOCK_MANIFESTS[blockId]?.title || blockId} hidden.` }
        : { tone: 'warning', message: 'Kept the default dashboard because every block was hidden.' };
      this.render();
      return;
    }

    this.setCurrentBlocks(current);
    this.status = { tone: 'good', message: `${BLOCK_MANIFESTS[blockId]?.title || blockId} added.` };
    this.render();
  }

  setSubtab(blockId, subtabId) {
    this.preferences.blockSubtabs = {
      ...this.preferences.blockSubtabs,
      [blockId]: subtabId,
    };
    this.savePreferences();
    this.status = { tone: 'good', message: `${BLOCK_MANIFESTS[blockId]?.title || blockId} will open to ${subtabId}.` };
    this.render();
  }

  async handleAIOrganize() {
    if (this.aiBusy) return;
    if (!this.providerReady()) {
      this.status = {
        tone: 'warning',
        message: 'AI organize requires a real provider. Set OPENAI_API_KEY, ANTHROPIC_API_KEY, LABLINK_LOCAL_AI_URL, or LABLINK_CUSTOM_AI_URL.',
      };
      this.render();
      return;
    }

    const intent = document.querySelector('[data-field="studio-intent"]')?.value?.trim() || this.preferences.lastIntent;
    this.preferences.lastIntent = intent;
    this.aiBusy = true;
    this.status = { tone: 'neutral', message: 'Calling the configured AI provider for a workspace layout.' };
    this.savePreferences();
    this.render();

    try {
      this.cancelOrganize = await streamingAI.streamOrganize(intent, {
        onProgress: (progress, message) => {
          this.status = { tone: 'neutral', message: `${message || 'Organizing'} (${Math.round((progress || 0) * 100)}%)` };
          this.render();
        },
        onComplete: (result) => {
          const workspace = workspaceById(result.workspace).id;
          const visibleBlocks = Array.isArray(result.visibleBlocks) && result.visibleBlocks.length
            ? result.visibleBlocks
            : result.orderedBlocks;
          const normalized = uniqueKnownBlocks(
            (visibleBlocks || []).map((id) => ({
              id,
              size: BLOCK_MANIFESTS[id]?.size?.default || 'medium',
              initialSubtab: result.blockSubtabs?.[id] || '',
            })),
            this.defaultBlocks(workspace),
          );

          this.currentWorkspace = workspace;
          this.preferences.blocksByWorkspace = {
            ...this.preferences.blocksByWorkspace,
            [workspace]: normalized,
          };
          this.preferences.blockSubtabs = {
            ...this.preferences.blockSubtabs,
            ...(result.blockSubtabs || {}),
          };
          this.aiBusy = false;
          this.status = {
            tone: 'good',
            message: result.reasoning || result.focusBrief || 'Workspace organized by the configured AI provider.',
          };
          this.savePreferences();
          this.render();
        },
        onError: (error) => {
          this.aiBusy = false;
          this.status = { tone: 'danger', message: error.message || 'AI organize failed.' };
          this.render();
        },
      });
    } catch (error) {
      this.aiBusy = false;
      this.status = { tone: 'danger', message: error.message || 'AI organize could not start.' };
      this.render();
    }
  }

  async handleAISection() {
    if (this.sectionBusy) return;
    if (!this.providerReady()) {
      this.status = {
        tone: 'warning',
        message: 'AI section generation requires a real provider. Manual section creation is still available.',
      };
      this.render();
      return;
    }

    const goal = document.querySelector('[data-field="section-goal"]')?.value?.trim();
    const labProfile = document.querySelector('[data-field="lab-profile"]')?.value?.trim() || this.preferences.labProfile;
    if (!goal) {
      this.status = { tone: 'warning', message: 'Describe the lab section you want to build first.' };
      this.render();
      return;
    }

    this.preferences.labProfile = labProfile;
    this.sectionBusy = true;
    this.status = { tone: 'neutral', message: 'Requesting a provider-backed lab section proposal.' };
    this.savePreferences();
    this.render();

    try {
      this.cancelSection = await streamingAI.streamSectionProposal(goal, labProfile, {
        onProgress: (progress, message) => {
          this.status = { tone: 'neutral', message: `${message || 'Designing section'} (${Math.round((progress || 0) * 100)}%)` };
          this.render();
        },
        onComplete: async (result) => {
          this.sectionBusy = false;
          this.pendingSection = result.section || null;
          if (this.pendingSection) {
            await this.saveSection(this.pendingSection, 'AI section added to Custom Sections.');
          } else {
            this.status = { tone: 'danger', message: 'AI provider returned no section object.' };
            this.render();
          }
        },
        onError: (error) => {
          this.sectionBusy = false;
          this.status = { tone: 'danger', message: error.message || 'AI section proposal failed.' };
          this.render();
        },
      });
    } catch (error) {
      this.sectionBusy = false;
      this.status = { tone: 'danger', message: error.message || 'AI section proposal could not start.' };
      this.render();
    }
  }

  async handleManualSection() {
    const title = document.querySelector('[data-field="manual-section-title"]')?.value?.trim();
    const purpose = document.querySelector('[data-field="manual-section-purpose"]')?.value?.trim();
    if (!title) {
      this.status = { tone: 'warning', message: 'Give the custom section a title first.' };
      this.render();
      return;
    }

    const section = {
      title,
      purpose: purpose || `Track ${title.toLowerCase()} for this lab.`,
      module: title.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || 'custom_lab_ops',
      layout: 'brief',
      fields: [
        { label: 'Status', type: 'status', value: 'Draft' },
        { label: 'Owner', type: 'person', value: this.serverState.user?.name || 'Unassigned' },
      ],
      actions: ['Review section design', 'Connect relevant integrations'],
      dataPolicy: 'Local-first; publish externally only after explicit review.',
    };

    await this.saveSection(section, 'Manual lab section added.');
  }

  async saveSection(section, successMessage) {
    try {
      const response = await fetch('/api/workspace/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || `Section save failed with ${response.status}`);
      }
      const payload = await response.json();
      this.serverState = { ...this.serverState, ...(payload.state || {}) };
      this.toggleBlock('custom-sections', true);
      this.status = { tone: 'good', message: successMessage };
      this.render();
    } catch (error) {
      this.status = { tone: 'danger', message: error.message || 'Could not save custom section.' };
      this.render();
    }
  }

  render() {
    const app = document.getElementById('app');
    if (!app) return;

    app.className = `app-v3 density-${this.preferences.density}`;
    app.innerHTML = `
      <div class="lab-shell ${this.studioOpen ? 'studio-open' : ''}">
        ${this.renderRail()}
        <main class="lab-main" tabindex="-1">
          ${this.renderTopbar()}
          ${this.renderMetrics()}
          ${this.renderFocusBoard()}
          ${this.renderOperationalPanels()}
          ${this.renderBlocks()}
        </main>
        ${this.renderStudio()}
      </div>
    `;

    this.bindEvents(app);
  }

  renderRail() {
    const state = this.serverState;
    const providerReady = this.providerReady();
    return `
      <aside class="lab-rail" aria-label="Workspace navigation">
        <div class="lab-brand">
          <div class="lab-brand-mark">LL</div>
          <div>
            <div class="lab-brand-name">Lab Link</div>
            <div class="lab-brand-caption">${escapeHtml(state.lab?.runtime || 'web workspace')}</div>
          </div>
        </div>

        <div class="lab-profile">
          <div class="lab-profile-name">${escapeHtml(state.lab?.name || 'Lab')}</div>
          <div class="lab-profile-meta">${escapeHtml(state.lab?.institution || 'Local')} - ${escapeHtml(state.user?.name || 'User')}</div>
        </div>

        <nav class="lab-nav">
          ${WORKSPACES.map((workspace) => `
            <button class="lab-nav-item ${this.currentWorkspace === workspace.id ? 'active' : ''}" type="button" data-workspace="${workspace.id}">
              <span>${escapeHtml(workspace.label)}</span>
              <small>${escapeHtml(workspace.eyebrow)}</small>
            </button>
          `).join('')}
        </nav>

        <div class="lab-rail-status ${providerReady ? 'ready' : 'attention'}">
          <span class="status-dot"></span>
          <div>
            <strong>${providerReady ? 'AI connected' : 'AI setup needed'}</strong>
            <span>${escapeHtml(this.configuredProviderLabel())}</span>
          </div>
        </div>

        <button class="lab-studio-button" type="button" data-action="toggle-studio">
          Workspace Studio
        </button>
      </aside>
    `;
  }

  renderTopbar() {
    const workspace = workspaceById(this.currentWorkspace);
    const counts = this.serverState.counts || FALLBACK_STATE.counts;
    const openIntegrations = (this.serverState.integrations || []).filter((item) => item.status === 'ready' || item.status === 'configured').length;
    return `
      <header class="lab-topbar">
        <div class="lab-title-group">
          <div class="lab-eyebrow">${escapeHtml(workspace.eyebrow)}</div>
          <h1>${escapeHtml(workspace.title)}</h1>
          <p>${escapeHtml(workspace.brief)}</p>
        </div>
        <div class="lab-topbar-actions">
          <button class="lab-control" type="button" data-action="toggle-density">
            ${this.preferences.density === 'compact' ? 'Comfort view' : 'Compact view'}
          </button>
          <button class="lab-control primary" type="button" data-action="toggle-studio">
            Customize workspace
          </button>
        </div>
      </header>
      <div class="lab-status-bar ${escapeHtml(this.status.tone)}" role="status">
        <span>${escapeHtml(this.status.message)}</span>
        <small>${counts.openTasks || 0} open tasks - ${openIntegrations} ready integrations - ${this.currentBlocks().length} active modules</small>
      </div>
    `;
  }

  renderMetrics() {
    const counts = this.serverState.counts || FALLBACK_STATE.counts;
    const metrics = [
      { label: 'Open tasks', value: counts.openTasks || 0, detail: 'Prioritized by lab impact', tone: 'danger' },
      { label: 'AI review', value: counts.pendingAi || 0, detail: 'Pending approvals', tone: 'warning' },
      { label: 'Risks', value: counts.risks || 0, detail: 'Across active projects', tone: 'danger' },
      { label: 'Projects', value: counts.projects || 0, detail: 'Tracked workstreams', tone: 'neutral' },
      { label: 'Meetings', value: counts.meetings || 0, detail: 'Processed or scheduled', tone: 'neutral' },
      { label: 'Unread', value: counts.unread || 0, detail: 'Actionable signals', tone: 'warning' },
    ];
    return `
      <section class="lab-metric-strip" aria-label="Lab metrics">
        ${metrics.map((metric) => `
          <div class="lab-metric ${metric.tone}">
            <span>${escapeHtml(metric.label)}</span>
            <strong>${escapeHtml(metric.value)}</strong>
            <small>${escapeHtml(metric.detail)}</small>
          </div>
        `).join('')}
      </section>
    `;
  }

  renderFocusBoard() {
    const task = (this.serverState.tasks || [])[0];
    const meeting = [...(this.serverState.calendarEvents || []), ...(this.serverState.meetings || [])]
      .sort((a, b) => String(a.at || '').localeCompare(String(b.at || '')))[0];
    const risk = (this.serverState.risks || [])[0];
    const signalItems = [
      ...(this.serverState.inbox || []).slice(0, 2).map((item) => ({ label: item.subject, detail: item.preview || item.from, source: item.source })),
      ...(this.serverState.aiSuggestions || []).slice(0, 2).map((item) => ({ label: item.title, detail: item.reason, source: item.source || item.type })),
    ].slice(0, 4);

    return `
      <section class="lab-focus-board">
        <article class="lab-focus-primary">
          <div class="section-label">Current focus</div>
          <h2>${escapeHtml(task?.title || 'No urgent task loaded')}</h2>
          <p>${escapeHtml(task?.reason || 'Connect calendars, messages, projects, and meeting notes to build a sharper operating view.')}</p>
          <div class="focus-meta">
            <span class="pill ${priorityTone(task?.priority)}">${escapeHtml(task?.priority || 'ready')}</span>
            <span>${escapeHtml(task?.project || 'Unassigned')}</span>
            <span>Due ${escapeHtml(formatDate(task?.due || task?.dueDate))}</span>
          </div>
        </article>

        <article class="lab-focus-card">
          <div class="section-label">Next coordination point</div>
          <h3>${escapeHtml(meeting?.title || 'No meeting scheduled')}</h3>
          <p>${escapeHtml(meeting?.prep || meeting?.summary || 'Meeting Studio can turn agendas and transcripts into actions when real AI is configured.')}</p>
          <small>${escapeHtml(formatDateTime(meeting?.at))}</small>
        </article>

        <article class="lab-focus-card">
          <div class="section-label">Risk to clear</div>
          <h3>${escapeHtml(risk?.title || 'No risk loaded')}</h3>
          <p>${escapeHtml(risk?.mitigation || 'Risks from meetings, projects, and inbox signals appear here.')}</p>
          <small>${escapeHtml(risk?.project || risk?.severity || 'Portfolio')}</small>
        </article>

        <article class="lab-focus-card signal-list">
          <div class="section-label">Live signals</div>
          ${signalItems.length ? signalItems.map((item) => `
            <div class="signal-row">
              <strong>${escapeHtml(clampText(item.label, 54))}</strong>
              <span>${escapeHtml(clampText(item.detail, 72))}</span>
              <small>${escapeHtml(item.source || 'Lab Link')}</small>
            </div>
          `).join('') : '<p>No signals loaded yet.</p>'}
        </article>
      </section>
    `;
  }

  renderOperationalPanels() {
    return `
      <section class="lab-dashboard-grid" aria-label="Operational dashboard">
        ${this.renderTaskPanel()}
        ${this.renderProjectPanel()}
        ${this.renderMeetingPanel()}
        ${this.renderSystemsPanel()}
      </section>
    `;
  }

  renderTaskPanel() {
    const tasks = (this.serverState.tasks || []).slice(0, 5);
    return `
      <article class="lab-panel panel-wide">
        <div class="panel-heading">
          <div>
            <span class="section-label">Execution</span>
            <h2>Priority queue</h2>
          </div>
          <button type="button" class="lab-link-button" data-action="open-studio">Tune</button>
        </div>
        <div class="task-stack">
          ${tasks.length ? tasks.map((task) => `
            <div class="task-row">
              <span class="task-priority ${priorityTone(task.priority)}">${escapeHtml(task.priority || 'task')}</span>
              <div>
                <strong>${escapeHtml(task.title)}</strong>
                <small>${escapeHtml(task.project || 'Unassigned')} - ${escapeHtml(task.assignee || 'No owner')} - due ${escapeHtml(formatDate(task.due || task.dueDate))}</small>
              </div>
            </div>
          `).join('') : '<p class="empty-copy">No open tasks loaded.</p>'}
        </div>
      </article>
    `;
  }

  renderProjectPanel() {
    const projects = (this.serverState.projects || []).slice(0, 4);
    return `
      <article class="lab-panel">
        <div class="panel-heading">
          <div>
            <span class="section-label">Portfolio</span>
            <h2>Project health</h2>
          </div>
        </div>
        <div class="project-stack">
          ${projects.length ? projects.map((project) => `
            <div class="project-row">
              <div class="project-token">${escapeHtml(project.icon || project.name?.slice(0, 1) || 'P')}</div>
              <div>
                <strong>${escapeHtml(project.name)}</strong>
                <small>${escapeHtml(project.status || 'Active')} - ${escapeHtml(project.owner || 'Unassigned')}</small>
                <div class="progress-track"><span style="width:${Math.max(0, Math.min(100, Number(project.completion || 0)))}%"></span></div>
              </div>
            </div>
          `).join('') : '<p class="empty-copy">No projects loaded.</p>'}
        </div>
      </article>
    `;
  }

  renderMeetingPanel() {
    const meetings = (this.serverState.meetings || []).slice(0, 3);
    const calendar = (this.serverState.calendarEvents || []).slice(0, 2);
    return `
      <article class="lab-panel">
        <div class="panel-heading">
          <div>
            <span class="section-label">Coordination</span>
            <h2>Meetings and agenda</h2>
          </div>
          <button type="button" class="lab-link-button" data-workspace="meetings">Open</button>
        </div>
        <div class="timeline-stack">
          ${[...calendar, ...meetings].slice(0, 5).map((item) => `
            <div class="timeline-row">
              <time>${escapeHtml(formatDateTime(item.at))}</time>
              <strong>${escapeHtml(item.title)}</strong>
              <span>${escapeHtml(clampText(item.prep || item.summary || item.status, 88))}</span>
            </div>
          `).join('') || '<p class="empty-copy">No meetings loaded.</p>'}
        </div>
      </article>
    `;
  }

  renderSystemsPanel() {
    const integrations = (this.serverState.integrations || []).slice(0, 6);
    const providers = (this.serverState.providers || []).slice(0, 4);
    return `
      <article class="lab-panel panel-systems">
        <div class="panel-heading">
          <div>
            <span class="section-label">Systems</span>
            <h2>Integrations and AI</h2>
          </div>
          <button type="button" class="lab-link-button" data-workspace="integrations">Setup</button>
        </div>
        <div class="system-list">
          ${providers.map((provider) => `
            <div class="system-row">
              <span class="status-dot ${provider.status === 'configured' ? 'ready' : ''}"></span>
              <div>
                <strong>${escapeHtml(provider.label)}</strong>
                <small>${escapeHtml(provider.status)} - ${escapeHtml(provider.model || provider.baseUrl || 'provider')}</small>
              </div>
            </div>
          `).join('')}
          ${integrations.map((integration) => `
            <div class="system-row">
              <span class="status-dot ${integration.status === 'ready' || integration.status === 'configured' ? 'ready' : ''}"></span>
              <div>
                <strong>${escapeHtml(integration.label)}</strong>
                <small>${escapeHtml(integration.status)} - ${escapeHtml(integration.surface || '')}</small>
              </div>
            </div>
          `).join('')}
        </div>
      </article>
    `;
  }

  renderBlocks() {
    const blocks = this.currentBlocks();
    return `
      <section class="lab-block-section">
        <div class="block-section-heading">
          <div>
            <span class="section-label">Modules</span>
            <h2>${escapeHtml(workspaceById(this.currentWorkspace).label)} workspace blocks</h2>
          </div>
          <div class="block-section-actions">
            <button type="button" class="lab-control" data-action="reset-layout">Reset layout</button>
            <button type="button" class="lab-control primary" data-action="toggle-studio">Edit blocks</button>
          </div>
        </div>
        <div class="blocks-grid-v31">
          ${blocks.map((block, index) => this.renderBlockSlot(block, index)).join('')}
        </div>
      </section>
    `;
  }

  renderBlockSlot(block, index) {
    const manifest = BLOCK_MANIFESTS[block.id];
    if (!manifest) return '';
    const tag = manifest.component;
    const initialSubtab = block.initialSubtab ? ` data-initial-subtab="${escapeHtml(block.initialSubtab)}"` : '';
    return `
      <div class="block-slot block-size-${escapeHtml(block.size || manifest.size?.default || 'medium')}" data-block-id="${escapeHtml(block.id)}" style="--slot-delay:${index * 45}ms">
        <${tag} data-block-id="${escapeHtml(block.id)}"${initialSubtab}></${tag}>
      </div>
    `;
  }

  renderStudio() {
    const providerReady = this.providerReady();
    const currentBlockIds = new Set(this.currentBlocks().map((block) => block.id));
    const allBlocks = Object.values(BLOCK_MANIFESTS)
      .sort((a, b) => `${a.domain}${a.title}`.localeCompare(`${b.domain}${b.title}`));
    const visibleBlocks = this.currentBlocks();
    return `
      <aside class="workspace-studio" aria-label="Workspace Studio" aria-hidden="${this.studioOpen ? 'false' : 'true'}">
        <div class="studio-header">
          <div>
            <span class="section-label">Workspace Studio</span>
            <h2>Customize this lab workspace</h2>
          </div>
          <button class="icon-button" type="button" data-action="close-studio" aria-label="Close Workspace Studio">Close</button>
        </div>

        <div class="studio-section provider-panel ${providerReady ? 'ready' : 'attention'}">
          <div class="status-dot ${providerReady ? 'ready' : ''}"></div>
          <div>
            <strong>${providerReady ? 'Real AI provider ready' : 'Real AI provider required for AI actions'}</strong>
            <p>${escapeHtml(this.configuredProviderLabel())}</p>
          </div>
        </div>

        <div class="studio-section">
          <label class="studio-label" for="studio-intent">Workspace intent</label>
          <textarea id="studio-intent" class="studio-textarea" data-field="studio-intent" rows="4">${escapeHtml(this.preferences.lastIntent)}</textarea>
          <button class="studio-primary" type="button" data-action="ai-organize" ${providerReady && !this.aiBusy ? '' : 'disabled'}>
            ${this.aiBusy ? 'Organizing with provider...' : 'Organize with real AI'}
          </button>
          <p class="studio-help">AI can choose the workspace, block order, visible modules, and preferred subtabs. Manual controls below always work.</p>
        </div>

        <div class="studio-section">
          <div class="studio-section-title">Manual custom section</div>
          <input class="studio-input" data-field="manual-section-title" placeholder="Section title, for example Mouse colony handoffs">
          <textarea class="studio-textarea" data-field="manual-section-purpose" rows="3" placeholder="What should this section help the lab manage?"></textarea>
          <button class="studio-secondary" type="button" data-action="manual-section">Add manual section</button>
        </div>

        <div class="studio-section">
          <div class="studio-section-title">AI section builder</div>
          <textarea class="studio-textarea" data-field="section-goal" rows="3" placeholder="Describe a lab-specific section to create"></textarea>
          <textarea class="studio-textarea" data-field="lab-profile" rows="3" placeholder="Optional lab profile, constraints, instruments, organisms, funding, or collaboration style">${escapeHtml(this.preferences.labProfile)}</textarea>
          <button class="studio-primary" type="button" data-action="ai-section" ${providerReady && !this.sectionBusy ? '' : 'disabled'}>
            ${this.sectionBusy ? 'Designing with provider...' : 'Generate section with real AI'}
          </button>
        </div>

        <div class="studio-section">
          <div class="studio-section-title">Active blocks</div>
          <div class="block-toggle-list">
            ${allBlocks.map((block) => `
              <label class="block-toggle">
                <input type="checkbox" data-toggle-block="${escapeHtml(block.id)}" ${currentBlockIds.has(block.id) ? 'checked' : ''}>
                <span>
                  <strong>${escapeHtml(block.title)}</strong>
                  <small>${escapeHtml(block.domain)} - ${escapeHtml(block.description)}</small>
                </span>
              </label>
            `).join('')}
          </div>
        </div>

        <div class="studio-section">
          <div class="studio-section-title">Subtab defaults</div>
          ${visibleBlocks.map((block) => this.renderSubtabControls(block)).join('')}
        </div>
      </aside>
    `;
  }

  renderSubtabControls(block) {
    const manifest = BLOCK_MANIFESTS[block.id];
    if (!manifest?.subtabs?.length) return '';
    const activeSubtab = this.preferences.blockSubtabs?.[block.id] || block.initialSubtab || manifest.subtabs[0].id;
    return `
      <div class="subtab-editor">
        <strong>${escapeHtml(manifest.title)}</strong>
        <div class="subtab-pills">
          ${manifest.subtabs.map((subtab) => `
            <button type="button" class="subtab-pill ${activeSubtab === subtab.id ? 'active' : ''}" data-subtab="${escapeHtml(subtab.id)}" data-block-id="${escapeHtml(block.id)}">
              ${escapeHtml(subtab.label)}
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }

  bindEvents(root) {
    root.querySelectorAll('[data-workspace]').forEach((button) => {
      button.addEventListener('click', () => this.switchWorkspace(button.dataset.workspace));
    });

    root.querySelectorAll('[data-action="toggle-studio"], [data-action="open-studio"]').forEach((button) => {
      button.addEventListener('click', () => this.openStudio());
    });

    root.querySelector('[data-action="close-studio"]')?.addEventListener('click', () => this.closeStudio());
    root.querySelector('[data-action="reset-layout"]')?.addEventListener('click', () => this.resetLayout());
    root.querySelector('[data-action="ai-organize"]')?.addEventListener('click', () => this.handleAIOrganize());
    root.querySelector('[data-action="ai-section"]')?.addEventListener('click', () => this.handleAISection());
    root.querySelector('[data-action="manual-section"]')?.addEventListener('click', () => this.handleManualSection());
    root.querySelector('[data-action="toggle-density"]')?.addEventListener('click', () => {
      this.preferences.density = this.preferences.density === 'compact' ? 'comfortable' : 'compact';
      this.savePreferences();
      this.render();
    });

    root.querySelectorAll('[data-toggle-block]').forEach((input) => {
      input.addEventListener('change', () => this.toggleBlock(input.dataset.toggleBlock, input.checked));
    });

    root.querySelectorAll('[data-subtab]').forEach((button) => {
      button.addEventListener('click', () => this.setSubtab(button.dataset.blockId, button.dataset.subtab));
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.labLinkApp = new LabLinkApp();
  });
} else {
  window.labLinkApp = new LabLinkApp();
}

export default LabLinkApp;

const STORAGE_KEY = 'lablink.web.v2.4';

const TABS = [
  { id: 'command', label: 'Command', key: '1' },
  { id: 'projects', label: 'Projects', key: '2' },
  { id: 'meetings', label: 'Meeting Studio', key: '3' },
  { id: 'ai', label: 'AI Review', key: '4' },
  { id: 'integrations', label: 'Integrations', key: '5' },
  { id: 'settings', label: 'Settings', key: '6' },
];

const DEFAULT_AGENDA = [
  'AT8 antibody supply and alternate vendor decision',
  'Cohort 2 perfusion timing and room availability',
  'Open field analysis due this week',
  'R01 specific aims internal review',
].join('\n');

const SAMPLE_TRANSCRIPT = [
  'Jordan will check alternate AT8 suppliers and confirm whether CST has a substitute clone.',
  'Decision: use cohort 2 for the next perfusion window if the animal room remains available Tuesday.',
  'Risk: AT8 backorder may delay staining and downstream imaging.',
  'Alex will run the open field analysis by Friday and send figures to Dr. Park.',
].join('\n');

const state = {
  data: null,
  loading: true,
  activeTab: 'command',
  tabOrder: TABS.map((tab) => tab.id),
  density: 'compact',
  railFocus: 'operations',
  visibleModules: {},
  meeting: {
    title: 'Weekly Lab Meeting',
    agenda: DEFAULT_AGENDA,
    transcript: SAMPLE_TRANSCRIPT,
    rules: null,
    analysis: '',
    zoom: null,
    live: false,
    liveSupported: false,
    busy: null,
  },
  toast: null,
};

let dragTabId = null;
let rulesTimer = null;
let recognition = null;

function loadPrefs() {
  try {
    const prefs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if (Array.isArray(prefs.tabOrder)) state.tabOrder = normalizeTabOrder(prefs.tabOrder);
    if (prefs.activeTab) state.activeTab = prefs.activeTab;
    if (prefs.density) state.density = prefs.density;
    if (prefs.railFocus) state.railFocus = prefs.railFocus;
    if (prefs.visibleModules) state.visibleModules = prefs.visibleModules;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function savePrefs() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    tabOrder: state.tabOrder,
    activeTab: state.activeTab,
    density: state.density,
    railFocus: state.railFocus,
    visibleModules: state.visibleModules,
  }));
}

function normalizeTabOrder(order) {
  const valid = new Set(TABS.map((tab) => tab.id));
  const unique = order.filter((id, index) => valid.has(id) && order.indexOf(id) === index);
  for (const tab of TABS) {
    if (!unique.includes(tab.id)) unique.push(tab.id);
  }
  return unique;
}

function tabById(id) {
  return TABS.find((tab) => tab.id === id) || TABS[0];
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function statusClass(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function formatDate(value) {
  if (!value) return 'No date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function formatTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function plural(count, label) {
  return `${count} ${label}${count === 1 ? '' : 's'}`;
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { 'content-type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.error || `Request failed: ${response.status}`);
    error.payload = payload;
    error.status = response.status;
    throw error;
  }
  return payload;
}

async function loadData() {
  loadPrefs();
  state.meeting.liveSupported = Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  try {
    state.data = await api('/api/state');
    state.loading = false;
    if (!Object.keys(state.visibleModules).length) {
      state.visibleModules = { ...(state.data.featureFlags || {}) };
    }
    render();
    runRules();
  } catch (error) {
    state.loading = false;
    state.toast = `Could not load Lab Link: ${error.message}`;
    render();
  }
}

function render() {
  const app = document.getElementById('app');
  app.className = `app-shell ${state.density === 'comfortable' ? 'comfortable' : ''}`;
  if (state.loading) return;
  if (!state.data) {
    app.innerHTML = `
      <header class="topbar">
        <div><div class="product-mark">Lab Link</div><div class="muted small">Web runtime</div></div>
      </header>
      <main class="boot-panel">
        <div class="panel">
          <div class="eyebrow">Startup error</div>
          <h1>Workspace unavailable</h1>
          <p>${escapeHtml(state.toast || 'Unknown startup error.')}</p>
        </div>
      </main>`;
    return;
  }

  app.innerHTML = `
    ${renderTopbar()}
    <div class="workspace">
      <aside class="rail"><div class="rail-scroll">${renderRail()}</div></aside>
      <main class="main"><div class="main-scroll">${renderMain()}</div></main>
      <aside class="intel-rail"><div class="intel-scroll">${renderIntelRail()}</div></aside>
    </div>
    ${state.toast ? `<div class="toast">${escapeHtml(state.toast)}</div>` : ''}`;
}

function renderTopbar() {
  const { lab, user, counts } = state.data;
  return `
    <header class="topbar">
      <div>
        <div class="product-mark">${escapeHtml(lab.name)} / Lab Link</div>
        <div class="muted small">${escapeHtml(lab.institution)} - ${escapeHtml(user.name)} (${escapeHtml(user.role)})</div>
      </div>
      <div class="topbar-actions">
        <button class="button ghost" type="button" data-action="refresh">Refresh</button>
        <button class="button secondary" type="button" data-tab="integrations">${plural(configuredIntegrations(), 'integration')} ready</button>
        <button class="button primary" type="button" data-tab="meetings">${plural(counts.meetings, 'meeting')}</button>
      </div>
    </header>`;
}

function configuredIntegrations() {
  return state.data.integrations.filter((item) => ['configured', 'ready', 'oauth credentials present'].includes(item.status)).length;
}

function renderRail() {
  return `
    <section class="lab-card">
      <div class="eyebrow">Workspace</div>
      <h2>${escapeHtml(state.data.lab.name)}</h2>
      <div class="meta">
        <span class="pill">${escapeHtml(state.density)}</span>
        <span class="pill">${escapeHtml(state.railFocus)}</span>
      </div>
    </section>
    <section class="rail-section">
      <div class="rail-section-title">Navigation</div>
      <div class="nav-list">
        ${state.tabOrder.map((id) => renderNavItem(tabById(id))).join('')}
      </div>
    </section>
    <section class="rail-section">
      <div class="rail-section-title">Focus</div>
      <div class="segmented">
        ${['operations', 'meetings', 'integrations'].map((mode) => `
          <button class="button compact ${state.railFocus === mode ? 'secondary' : 'ghost'}" type="button" data-action="rail-focus" data-mode="${mode}">${mode}</button>
        `).join('')}
      </div>
    </section>
    <section class="rail-section">
      <div class="rail-section-title">Lab Modules</div>
      <div class="switch-list">
        ${Object.entries(state.visibleModules).slice(0, 10).map(([key, enabled]) => `
          <label class="switch-item">
            <input type="checkbox" data-feature="${escapeHtml(key)}" ${enabled ? 'checked' : ''}>
            <span class="truncate">${escapeHtml(key)}</span>
          </label>
        `).join('')}
      </div>
    </section>
    <section class="rail-section">
      <div class="rail-section-title">Signals</div>
      <div class="status-list">
        <div class="status-item"><span>Open tasks</span><span class="count">${state.data.counts.openTasks}</span></div>
        <div class="status-item"><span>Unread inbox</span><span class="count">${state.data.counts.unread}</span></div>
        <div class="status-item"><span>Pending review</span><span class="count">${state.data.counts.pendingAi}</span></div>
      </div>
    </section>`;
}

function renderNavItem(tab) {
  const counts = {
    command: state.data.counts.openTasks,
    projects: state.data.counts.projects,
    meetings: state.data.counts.meetings,
    ai: state.data.counts.pendingAi,
    integrations: configuredIntegrations(),
    settings: Object.keys(state.visibleModules).length,
  };
  return `
    <button class="nav-item ${state.activeTab === tab.id ? 'active' : ''}" type="button" data-nav="${tab.id}">
      <span class="nav-key">${tab.key}</span>
      <span class="nav-label">${escapeHtml(tab.label)}</span>
      <span class="count">${counts[tab.id] ?? 0}</span>
    </button>`;
}

function renderMain() {
  return `
    <div class="workspace-tabs">
      ${state.tabOrder.map((id) => renderWorkspaceTab(tabById(id))).join('')}
    </div>
    ${renderActiveView()}`;
}

function renderWorkspaceTab(tab) {
  return `
    <button class="workspace-tab ${state.activeTab === tab.id ? 'active' : ''}" type="button" draggable="true" data-tab="${tab.id}" title="Drag to reorder">
      <span class="tab-grip">::</span>
      <span>${escapeHtml(tab.label)}</span>
    </button>`;
}

function renderActiveView() {
  if (state.activeTab === 'projects') return renderProjects();
  if (state.activeTab === 'meetings') return renderMeetingStudio();
  if (state.activeTab === 'ai') return renderAiReview();
  if (state.activeTab === 'integrations') return renderIntegrations();
  if (state.activeTab === 'settings') return renderSettings();
  return renderCommand();
}

function renderCommand() {
  return `
    <section class="view-header">
      <div>
        <div class="eyebrow">Command Center</div>
        <h1>Daily lab operating picture</h1>
        <p>Priority work, project pressure, meeting carryover, and review items from the local Lab Link graph.</p>
      </div>
      <div class="inline-actions">
        <button class="button secondary" type="button" data-tab="meetings">Open Meeting Studio</button>
        <button class="button" type="button" data-tab="ai">Review AI queue</button>
      </div>
    </section>
    <section class="stat-grid">
      <div class="stat"><div class="stat-value">${state.data.counts.openTasks}</div><div class="stat-label">Open tasks</div></div>
      <div class="stat"><div class="stat-value">${state.data.counts.risks}</div><div class="stat-label">Active risks</div></div>
      <div class="stat"><div class="stat-value">${state.data.counts.pendingAi}</div><div class="stat-label">Pending suggestions</div></div>
      <div class="stat"><div class="stat-value">${configuredIntegrations()}</div><div class="stat-label">Configured surfaces</div></div>
    </section>
    <section class="grid two" style="margin-top: 12px;">
      <div class="panel">
        <div class="panel-header"><div><div class="eyebrow">Priority Queue</div><div class="panel-title">Next execution block</div></div></div>
        <div class="item-list">${state.data.tasks.slice(0, 6).map(renderTask).join('')}</div>
      </div>
      <div class="panel">
        <div class="panel-header"><div><div class="eyebrow">Risk Radar</div><div class="panel-title">Operational blockers</div></div></div>
        <div class="item-list">${state.data.risks.map(renderRisk).join('')}</div>
      </div>
    </section>
    <section class="grid two" style="margin-top: 12px;">
      <div class="panel">
        <div class="panel-header"><div><div class="eyebrow">Meetings</div><div class="panel-title">Context feed</div></div></div>
        <div class="item-list">${state.data.meetings.map(renderMeetingRow).join('')}</div>
      </div>
      <div class="panel">
        <div class="panel-header"><div><div class="eyebrow">Inbox</div><div class="panel-title">Coordination signals</div></div></div>
        <div class="item-list">${state.data.inbox.map(renderInbox).join('')}</div>
      </div>
    </section>`;
}

function renderTask(task) {
  return `
    <article class="task-row">
      <div>
        <div class="task-title">${escapeHtml(task.title)}</div>
        <div class="meta">
          <span class="pill ${statusClass(task.priority)}">${escapeHtml(task.priority)}</span>
          <span class="pill ${statusClass(task.status)}">${escapeHtml(task.status)}</span>
          <span>${escapeHtml(task.project)}</span>
          <span>${escapeHtml(task.assignee || 'Unassigned')}</span>
        </div>
      </div>
      <div class="muted small">${escapeHtml(formatDate(task.due))}</div>
    </article>`;
}

function renderRisk(risk) {
  return `
    <article class="queue-item">
      <div class="queue-title">${escapeHtml(risk.title)}</div>
      <div class="meta">
        <span class="pill ${statusClass(risk.severity)}">${escapeHtml(risk.severity)}</span>
        <span>${escapeHtml(risk.project)}</span>
      </div>
      <p class="muted small">${escapeHtml(risk.mitigation)}</p>
    </article>`;
}

function renderMeetingRow(meeting) {
  return `
    <article class="meeting-row">
      <div class="meeting-title">${escapeHtml(meeting.title)}</div>
      <div class="meta">
        <span class="pill ${statusClass(meeting.status)}">${escapeHtml(meeting.status)}</span>
        <span>${escapeHtml(formatTime(meeting.at))}</span>
      </div>
      <p class="muted small">${escapeHtml(meeting.summary)}</p>
    </article>`;
}

function renderInbox(item) {
  return `
    <article class="queue-item">
      <div class="queue-title">${escapeHtml(item.subject)}</div>
      <div class="meta">
        <span class="pill">${escapeHtml(item.source)}</span>
        <span>${escapeHtml(item.from)}</span>
        <span>${Math.round((item.confidence || 0) * 100)}%</span>
      </div>
      <p class="muted small">${escapeHtml(item.preview)}</p>
    </article>`;
}

function renderProjects() {
  return `
    <section class="view-header">
      <div>
        <div class="eyebrow">Projects</div>
        <h1>Lab portfolio and adaptive modules</h1>
        <p>Project health, owners, deadlines, risks, and feature-flagged lab tracking modules are kept in one operating view.</p>
      </div>
    </section>
    <section class="grid two">
      ${state.data.projects.map((project) => `
        <article class="project-row">
          <div class="project-head">
            <div class="inline-actions">
              <div class="project-icon">${escapeHtml(project.icon || project.name[0])}</div>
              <div>
                <div class="project-title">${escapeHtml(project.name)}</div>
                <div class="meta">
                  <span class="pill ${statusClass(project.status)}">${escapeHtml(project.status)}</span>
                  <span>${escapeHtml(project.owner)}</span>
                  <span>${escapeHtml(formatDate(project.nextDeadline))}</span>
                </div>
              </div>
            </div>
            <strong>${Number(project.completion || 0)}%</strong>
          </div>
          <div class="progress"><span style="width: ${Math.max(0, Math.min(100, Number(project.completion || 0)))}%;"></span></div>
          <p class="muted small">${escapeHtml(project.health)}</p>
        </article>
      `).join('')}
    </section>
    <section class="panel" style="margin-top: 12px;">
      <div class="panel-header"><div><div class="eyebrow">Module Surface</div><div class="panel-title">Lab-specific tracking</div></div></div>
      <div class="grid three">
        ${Object.entries(state.visibleModules).map(([key, enabled]) => `
          <div class="architecture-row">
            <strong>${escapeHtml(key)}</strong>
            <span class="pill ${enabled ? 'ok' : ''}">${enabled ? 'visible' : 'hidden'}</span>
          </div>
        `).join('')}
      </div>
    </section>`;
}

function renderMeetingStudio() {
  const rules = state.meeting.rules;
  return `
    <section class="view-header">
      <div>
        <div class="eyebrow">Meeting Studio</div>
        <h1>Agenda, live notes, Zoom, and execution analysis</h1>
        <p>Use browser live capture when available, local rules for transparent extraction, and provider-backed AI only when real credentials are configured.</p>
      </div>
      <div class="inline-actions">
        <button class="button ${state.meeting.live ? 'danger' : 'secondary'}" type="button" data-action="${state.meeting.live ? 'stop-live' : 'start-live'}">
          ${state.meeting.live ? 'Stop Live Notes' : 'Start Live Notes'}
        </button>
        <button class="button" type="button" data-action="run-rules" ${state.meeting.busy ? 'disabled' : ''}>Run Rules Pass</button>
        <button class="button primary" type="button" data-action="run-ai" ${state.meeting.busy ? 'disabled' : ''}>Analyze With Real AI</button>
      </div>
    </section>
    <section class="meeting-studio">
      <div class="tool">
        <div class="tool-header">
          <div><div class="eyebrow">Meeting Input</div><h3>Live workspace</h3></div>
          <button class="button compact" type="button" data-action="start-zoom" ${state.meeting.busy ? 'disabled' : ''}>Start Zoom</button>
        </div>
        <div class="form-grid">
          <div class="field">
            <label for="meeting-title">Meeting title</label>
            <input id="meeting-title" value="${escapeHtml(state.meeting.title)}" autocomplete="off">
          </div>
          <div class="field">
            <label for="meeting-agenda">Agenda</label>
            <textarea id="meeting-agenda">${escapeHtml(state.meeting.agenda)}</textarea>
          </div>
          <div class="field">
            <label for="meeting-transcript">Transcript and live notes</label>
            <textarea id="meeting-transcript" class="transcript">${escapeHtml(state.meeting.transcript)}</textarea>
          </div>
          <div class="meta">
            <span class="pill ${state.meeting.liveSupported ? 'ok' : ''}">${state.meeting.liveSupported ? 'speech capture available' : 'speech capture unavailable'}</span>
            <span class="pill">${state.meeting.busy ? escapeHtml(state.meeting.busy) : 'ready'}</span>
          </div>
        </div>
      </div>
      <div class="tool">
        <div class="tool-header"><div><div class="eyebrow">Extraction</div><h3>Rules and provider output</h3></div></div>
        ${rules ? renderRules(rules) : '<div class="output muted">Rules extraction has not run yet.</div>'}
        <div style="height: 12px;"></div>
        <div class="field">
          <label>Provider-backed analysis</label>
          <div class="output">${state.meeting.analysis ? escapeHtml(state.meeting.analysis) : 'No real AI analysis has run in this browser session.'}</div>
        </div>
        ${state.meeting.zoom ? `
          <div style="height: 12px;"></div>
          <div class="rules-bucket">
            <h4>Zoom</h4>
            <a href="${escapeHtml(state.meeting.zoom.joinUrl || state.meeting.zoom.startUrl || '#')}" target="_blank" rel="noreferrer">${escapeHtml(state.meeting.zoom.topic || 'Zoom meeting')}</a>
          </div>
        ` : ''}
      </div>
    </section>`;
}

function renderRules(rules) {
  return `
    <div class="rules-grid">
      ${renderRulesBucket('Topics', rules.topics)}
      ${renderRulesBucket('Tasks', rules.tasks)}
      ${renderRulesBucket('Decisions', rules.decisions)}
      ${renderRulesBucket('Risks', rules.risks)}
    </div>`;
}

function renderRulesBucket(label, items = []) {
  return `
    <div class="rules-bucket">
      <h4>${escapeHtml(label)} / rules</h4>
      ${items.length ? `<ul>${items.map((item) => `<li>${escapeHtml(item.text)}</li>`).join('')}</ul>` : '<div class="muted small">No items detected.</div>'}
    </div>`;
}

function renderAiReview() {
  return `
    <section class="view-header">
      <div>
        <div class="eyebrow">AI Review</div>
        <h1>Provider routing and review queue</h1>
        <p>Generated work is reviewable and provider metadata stays visible. Missing credentials are setup states, not silent fallbacks.</p>
      </div>
      <div class="inline-actions"><button class="button primary" type="button" data-tab="meetings">Analyze meeting</button></div>
    </section>
    <section class="grid two">
      <div class="panel">
        <div class="panel-header"><div><div class="eyebrow">Providers</div><div class="panel-title">Real AI only</div></div></div>
        <div class="status-list">${state.data.providers.map(renderProvider).join('')}</div>
      </div>
      <div class="panel">
        <div class="panel-header"><div><div class="eyebrow">Review Queue</div><div class="panel-title">Suggested actions</div></div></div>
        <div class="item-list">${state.data.aiSuggestions.map(renderSuggestion).join('')}</div>
      </div>
    </section>`;
}

function renderProvider(provider) {
  return `
    <div class="status-item">
      <div>
        <strong>${escapeHtml(provider.label)}</strong>
        <div class="muted small">${escapeHtml(provider.model || 'model configured at runtime')}</div>
      </div>
      <span class="pill ${statusClass(provider.status)}">${escapeHtml(provider.status)}</span>
    </div>`;
}

function renderSuggestion(item) {
  return `
    <article class="queue-item">
      <div class="queue-title">${escapeHtml(item.title)}</div>
      <div class="meta">
        <span class="pill ${statusClass(item.status)}">${escapeHtml(item.status)}</span>
        <span>${escapeHtml(item.type)}</span>
        <span>${Math.round((item.confidence || 0) * 100)}%</span>
      </div>
      <p class="muted small">${escapeHtml(item.reason)}</p>
    </article>`;
}

function renderIntegrations() {
  return `
    <section class="view-header">
      <div>
        <div class="eyebrow">Integrations</div>
        <h1>Institution and lab coordination surfaces</h1>
        <p>Readiness is based on configured credentials. The beta exposes what is real today and what still needs OAuth or an adapter.</p>
      </div>
    </section>
    <section class="grid two">
      ${state.data.integrations.map((item) => `
        <article class="integration-row">
          <div>
            <div class="project-title">${escapeHtml(item.label)}</div>
            <div class="muted small">${escapeHtml(item.surface)}</div>
            <div class="meta">${(item.required || []).map((key) => `<span class="pill">${escapeHtml(key)}</span>`).join('')}</div>
            <p class="muted small">${escapeHtml(item.nextStep)}</p>
          </div>
          <span class="pill ${statusClass(item.status)}">${escapeHtml(item.status)}</span>
        </article>
      `).join('')}
    </section>`;
}

function renderSettings() {
  return `
    <section class="view-header">
      <div>
        <div class="eyebrow">Settings</div>
        <h1>Workspace architecture and lab adaptation</h1>
        <p>Navigation, density, module surface, and provider policy are exposed as first-class configuration.</p>
      </div>
    </section>
    <section class="grid two">
      <div class="panel">
        <div class="panel-header"><div><div class="eyebrow">Layout</div><div class="panel-title">Three-plane workspace</div></div></div>
        <div class="item-list">
          <div class="architecture-row"><strong>Command rail</strong><span>Lab identity, modules, focus mode, and daily signals.</span></div>
          <div class="architecture-row"><strong>Workspace tabs</strong><span>Draggable operating modes persisted in this browser.</span></div>
          <div class="architecture-row"><strong>Intelligence rail</strong><span>Provider status, review queue, and meeting extraction context.</span></div>
        </div>
      </div>
      <div class="panel">
        <div class="panel-header"><div><div class="eyebrow">Controls</div><div class="panel-title">Personal surface</div></div></div>
        <div class="form-grid">
          <div class="field">
            <label for="density">Density</label>
            <select id="density">
              <option value="compact" ${state.density === 'compact' ? 'selected' : ''}>compact</option>
              <option value="comfortable" ${state.density === 'comfortable' ? 'selected' : ''}>comfortable</option>
            </select>
          </div>
          <button class="button" type="button" data-action="reset-tabs">Reset tab order</button>
          <button class="button ghost" type="button" data-action="clear-prefs">Clear browser preferences</button>
        </div>
      </div>
    </section>
    <section class="panel" style="margin-top: 12px;">
      <div class="panel-header"><div><div class="eyebrow">Feature Flags</div><div class="panel-title">Lab module visibility</div></div></div>
      <div class="switch-list">
        ${Object.entries(state.visibleModules).map(([key, enabled]) => `
          <label class="switch-item">
            <input type="checkbox" data-feature="${escapeHtml(key)}" ${enabled ? 'checked' : ''}>
            <span>${escapeHtml(key)}</span>
          </label>
        `).join('')}
      </div>
    </section>`;
}

function renderIntelRail() {
  const pending = state.data.aiSuggestions.filter((item) => item.status === 'pending');
  const activeProvider = state.data.providers.find((item) => item.status === 'configured');
  return `
    <section class="intel-section" style="margin-top: 0;">
      <div class="intel-section-title">Real AI</div>
      <div class="status-item">
        <div>
          <strong>${escapeHtml(activeProvider?.label || 'No provider configured')}</strong>
          <div class="muted small">${escapeHtml(activeProvider?.model || 'OpenAI, Anthropic, local, or custom endpoint required')}</div>
        </div>
        <span class="pill ${activeProvider ? 'configured' : ''}">${activeProvider ? 'configured' : 'setup'}</span>
      </div>
    </section>
    <section class="intel-section">
      <div class="intel-section-title">Pending Review</div>
      <div class="item-list">
        ${pending.slice(0, 4).map(renderSuggestion).join('') || '<div class="queue-item muted">No pending suggestions.</div>'}
      </div>
    </section>
    <section class="intel-section">
      <div class="intel-section-title">Meeting Extraction</div>
      ${state.meeting.rules ? renderRulesBucket('Tasks', state.meeting.rules.tasks) : '<div class="queue-item muted">Run Meeting Studio extraction.</div>'}
    </section>
    <section class="intel-section">
      <div class="intel-section-title">Upcoming Calendar</div>
      <div class="item-list">
        ${state.data.calendarEvents.map((event) => `
          <article class="queue-item">
            <div class="queue-title">${escapeHtml(event.title)}</div>
            <div class="meta"><span>${escapeHtml(formatTime(event.at))}</span><span>${event.durationMinutes}m</span></div>
            <p class="muted small">${escapeHtml(event.prep)}</p>
          </article>
        `).join('')}
      </div>
    </section>`;
}

async function refresh() {
  state.toast = null;
  state.data = await api('/api/state');
  render();
}

async function runRules() {
  state.meeting.busy = 'rules';
  render();
  try {
    state.meeting.rules = await api('/api/meeting/rules', {
      method: 'POST',
      body: JSON.stringify({
        agenda: state.meeting.agenda,
        transcript: state.meeting.transcript,
      }),
    });
    state.toast = null;
  } catch (error) {
    state.toast = `Rules extraction failed: ${error.message}`;
  } finally {
    state.meeting.busy = null;
    render();
  }
}

function scheduleRules() {
  clearTimeout(rulesTimer);
  rulesTimer = setTimeout(() => {
    runRules();
  }, 450);
}

async function runAiAnalysis() {
  if (!state.meeting.transcript.trim()) {
    state.toast = 'Transcript is required before real AI analysis.';
    render();
    return;
  }
  state.meeting.busy = 'real ai';
  state.meeting.analysis = '';
  render();
  try {
    const result = await api('/api/meeting/analyze', {
      method: 'POST',
      body: JSON.stringify({
        title: state.meeting.title,
        agenda: state.meeting.agenda,
        transcript: state.meeting.transcript,
      }),
    });
    state.meeting.analysis = `${result.text}\n\nProvider: ${result.provider.label} / ${result.provider.model}\nLatency: ${result.latencyMs}ms`;
    state.toast = 'Real AI analysis completed.';
  } catch (error) {
    const required = error.payload?.required ? ` Required: ${error.payload.required.join(', ')}.` : '';
    state.toast = `${error.message}${required}`;
  } finally {
    state.meeting.busy = null;
    render();
  }
}

async function startZoom() {
  state.meeting.busy = 'zoom';
  render();
  try {
    state.meeting.zoom = await api('/api/zoom/start', {
      method: 'POST',
      body: JSON.stringify({
        title: state.meeting.title,
        agenda: state.meeting.agenda,
        durationMinutes: 45,
      }),
    });
    state.toast = 'Zoom meeting created with configured Zoom credentials.';
  } catch (error) {
    const required = error.payload?.required ? ` Required: ${error.payload.required.join(', ')}.` : '';
    state.toast = `${error.message}${required}`;
  } finally {
    state.meeting.busy = null;
    render();
  }
}

function startLiveNotes() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    state.toast = 'This browser does not expose speech recognition for live notes.';
    render();
    return;
  }
  if (recognition) stopLiveNotes(false);
  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = document.documentElement.lang || 'en-US';
  recognition.onresult = (event) => {
    let finalText = '';
    for (let index = event.resultIndex; index < event.results.length; index += 1) {
      const result = event.results[index];
      if (result.isFinal) finalText += `${result[0].transcript.trim()} `;
    }
    if (finalText.trim()) {
      state.meeting.transcript = `${state.meeting.transcript.trim()}\n${finalText.trim()}`.trim();
      scheduleRules();
      render();
    }
  };
  recognition.onerror = (event) => {
    state.toast = `Live notes stopped: ${event.error || 'speech recognition error'}`;
    state.meeting.live = false;
    render();
  };
  recognition.onend = () => {
    state.meeting.live = false;
    render();
  };
  recognition.start();
  state.meeting.live = true;
  state.toast = 'Live notes started in this browser.';
  render();
}

function stopLiveNotes(showToast = true) {
  if (recognition) {
    recognition.onend = null;
    recognition.stop();
    recognition = null;
  }
  state.meeting.live = false;
  if (showToast) state.toast = 'Live notes stopped.';
  render();
}

function handleClick(event) {
  const tabButton = event.target.closest('[data-tab]');
  if (tabButton) {
    state.activeTab = tabButton.dataset.tab;
    savePrefs();
    render();
    return;
  }
  const navButton = event.target.closest('[data-nav]');
  if (navButton) {
    state.activeTab = navButton.dataset.nav;
    savePrefs();
    render();
    return;
  }
  const action = event.target.closest('[data-action]')?.dataset.action;
  if (!action) return;
  if (action === 'refresh') refresh().catch((error) => {
    state.toast = error.message;
    render();
  });
  if (action === 'rail-focus') {
    state.railFocus = event.target.closest('[data-action]').dataset.mode;
    savePrefs();
    render();
  }
  if (action === 'run-rules') runRules();
  if (action === 'run-ai') runAiAnalysis();
  if (action === 'start-zoom') startZoom();
  if (action === 'start-live') startLiveNotes();
  if (action === 'stop-live') stopLiveNotes();
  if (action === 'reset-tabs') {
    state.tabOrder = TABS.map((tab) => tab.id);
    savePrefs();
    render();
  }
  if (action === 'clear-prefs') {
    localStorage.removeItem(STORAGE_KEY);
    state.tabOrder = TABS.map((tab) => tab.id);
    state.activeTab = 'command';
    state.density = 'compact';
    state.railFocus = 'operations';
    state.visibleModules = { ...(state.data.featureFlags || {}) };
    render();
  }
}

function handleInput(event) {
  if (event.target.id === 'meeting-title') {
    state.meeting.title = event.target.value;
  }
  if (event.target.id === 'meeting-agenda') {
    state.meeting.agenda = event.target.value;
    scheduleRules();
  }
  if (event.target.id === 'meeting-transcript') {
    state.meeting.transcript = event.target.value;
    scheduleRules();
  }
  if (event.target.id === 'density') {
    state.density = event.target.value;
    savePrefs();
    render();
  }
  if (event.target.matches('[data-feature]')) {
    state.visibleModules[event.target.dataset.feature] = event.target.checked;
    savePrefs();
    render();
  }
}

function handleDragStart(event) {
  const tab = event.target.closest('[data-tab]');
  if (!tab || !tab.classList.contains('workspace-tab')) return;
  dragTabId = tab.dataset.tab;
  tab.classList.add('dragging');
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/plain', dragTabId);
}

function handleDragEnd(event) {
  const tab = event.target.closest('[data-tab]');
  if (tab) tab.classList.remove('dragging');
  dragTabId = null;
}

function handleDragOver(event) {
  if (event.target.closest('.workspace-tab')) event.preventDefault();
}

function handleDrop(event) {
  const target = event.target.closest('.workspace-tab');
  if (!target || !dragTabId) return;
  event.preventDefault();
  const targetId = target.dataset.tab;
  if (targetId === dragTabId) return;
  const next = state.tabOrder.filter((id) => id !== dragTabId);
  const targetIndex = next.indexOf(targetId);
  next.splice(targetIndex, 0, dragTabId);
  state.tabOrder = normalizeTabOrder(next);
  savePrefs();
  render();
}

document.addEventListener('click', handleClick);
document.addEventListener('input', handleInput);
document.addEventListener('change', handleInput);
document.addEventListener('dragstart', handleDragStart);
document.addEventListener('dragend', handleDragEnd);
document.addEventListener('dragover', handleDragOver);
document.addEventListener('drop', handleDrop);
document.addEventListener('keydown', (event) => {
  if (event.target.matches('input, textarea, select')) return;
  const tab = TABS.find((item) => item.key === event.key);
  if (tab) {
    state.activeTab = tab.id;
    savePrefs();
    render();
  }
});

loadData();


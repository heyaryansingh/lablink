const STORAGE_KEY = 'lablink.web.v2.4';

const TABS = [
  { id: 'command', label: 'Command', key: '1' },
  { id: 'meetings', label: 'Meeting Studio', key: '2' },
  { id: 'builder', label: 'Lab Builder', key: '3' },
  { id: 'projects', label: 'Projects', key: '4' },
  { id: 'ai', label: 'AI Review', key: '5' },
  { id: 'integrations', label: 'Integrations', key: '6' },
  { id: 'settings', label: 'Settings', key: '7' },
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
  showIntel: false,
  customize: false,
  visiblePanels: {
    focus: true,
    tasks: true,
    sections: true,
    risks: false,
    meetings: false,
    inbox: false,
    projects: false,
    ai: false,
    integrations: false,
  },
  collapsedPanels: {},
  visibleModules: {},
  organizer: {
    intent: 'Help me focus on what matters for the lab today.',
    plan: null,
    busy: null,
  },
  builder: {
    goal: 'Create a section that helps our lab track experiment readiness, blockers, owners, and next actions across meetings and messages.',
    labProfile: 'Wet lab with imaging, animal work, grants, reagents, shared equipment, and weekly lab meetings.',
    proposal: null,
    busy: null,
    manualTitle: 'Protocol Readiness',
    manualPurpose: 'Track protocols, missing approvals, sample readiness, and owners before an experiment starts.',
  },
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
    if (typeof prefs.showIntel === 'boolean') state.showIntel = prefs.showIntel;
    if (typeof prefs.customize === 'boolean') state.customize = prefs.customize;
    if (prefs.visiblePanels) state.visiblePanels = { ...state.visiblePanels, ...prefs.visiblePanels };
    if (prefs.collapsedPanels) state.collapsedPanels = prefs.collapsedPanels;
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
    showIntel: state.showIntel,
    customize: state.customize,
    visiblePanels: state.visiblePanels,
    collapsedPanels: state.collapsedPanels,
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
    <div class="workspace ${state.showIntel ? '' : 'no-intel'}">
      <aside class="rail"><div class="rail-scroll">${renderRail()}</div></aside>
      <main class="main"><div class="main-scroll">${renderMain()}</div></main>
      <aside class="intel-rail"><div class="intel-scroll">${renderIntelRail()}</div></aside>
    </div>
    ${state.toast ? `<div class="toast">${escapeHtml(state.toast)}</div>` : ''}`;
}

function renderTopbar() {
  const { lab, user } = state.data;
  return `
    <header class="topbar">
      <div>
        <div class="product-mark">${escapeHtml(lab.name)} / Lab Link</div>
        <div class="muted small">${escapeHtml(lab.institution)} - ${escapeHtml(user.name)} (${escapeHtml(user.role)})</div>
      </div>
      <div class="topbar-actions">
        <select class="workspace-select" id="workspace-select" aria-label="Workspace">
          ${TABS.map((tab) => `<option value="${tab.id}" ${state.activeTab === tab.id ? 'selected' : ''}>${escapeHtml(tab.label)}</option>`).join('')}
        </select>
        <button class="button ghost" type="button" data-action="toggle-customize">${state.customize ? 'Done' : 'Customize'}</button>
        <button class="button primary" type="button" data-action="organize-workspace" ${state.organizer.busy ? 'disabled' : ''}>AI Organize</button>
      </div>
    </header>`;
}

function configuredIntegrations() {
  return state.data.integrations.filter((item) => ['configured', 'ready', 'oauth credentials present'].includes(item.status)).length;
}

function providerReady() {
  return state.data.providers.some((item) => item.status === 'configured');
}

const PANEL_LABELS = {
  focus: 'Focus',
  tasks: 'Tasks',
  sections: 'Lab sections',
  risks: 'Risks',
  meetings: 'Meetings',
  inbox: 'Inbox',
  projects: 'Projects',
  ai: 'AI review',
  integrations: 'Integrations',
};

function renderRail() {
  return `
    <section class="lab-card">
      <div class="eyebrow">Workspace</div>
      <h2>${escapeHtml(state.data.lab.name)}</h2>
      <p class="muted small">A selective lab manager shaped around the work in front of you.</p>
    </section>
    <section class="rail-section">
      <div class="rail-section-title">AI Organizer</div>
      <div class="field rail-field">
        <textarea id="organizer-intent">${escapeHtml(state.organizer.intent)}</textarea>
      </div>
      <button class="button primary full" type="button" data-action="organize-workspace" ${state.organizer.busy ? 'disabled' : ''}>Organize This View</button>
      <div class="muted small rail-note">${providerReady() ? 'Uses your configured provider.' : 'Requires a real AI provider.'}</div>
    </section>
    ${state.customize ? renderPanelChooser() : ''}
    <section class="rail-section">
      <div class="rail-section-title">Quick State</div>
      <div class="quiet-metrics">
        <span>${state.data.counts.openTasks} tasks</span>
        <span>${state.data.counts.risks} risks</span>
        <span>${configuredIntegrations()} integrations</span>
      </div>
    </section>`;
}

function renderPanelChooser() {
  return `
    <section class="rail-section">
      <div class="rail-section-title">Visible Panels</div>
      <div class="panel-chooser">
        ${Object.entries(PANEL_LABELS).map(([id, label]) => `
          <label class="toggle-line">
            <input type="checkbox" data-panel-visible="${id}" ${state.visiblePanels[id] ? 'checked' : ''}>
            <span>${escapeHtml(label)}</span>
          </label>
        `).join('')}
      </div>
    </section>`;
}

function renderMain() {
  return `
    ${renderAdaptiveBar()}
    ${state.organizer.plan ? renderOrganizerPlan() : ''}
    ${renderActiveView()}`;
}

function renderAdaptiveBar() {
  return `
    <section class="adaptive-bar">
      <div>
        <div class="eyebrow">Adaptive Workspace</div>
        <strong>${escapeHtml(tabById(state.activeTab).label)}</strong>
      </div>
      <div class="adaptive-actions">
        <button class="button compact ghost" type="button" data-action="density-toggle">${escapeHtml(state.density)}</button>
        <button class="button compact ghost" type="button" data-action="toggle-intel">${state.showIntel ? 'Hide context' : 'Context'}</button>
        <button class="button compact" type="button" data-action="focus-preset">Focus preset</button>
        <button class="button compact" type="button" data-action="everything-preset">Everything</button>
      </div>
    </section>`;
}

function renderOrganizerPlan() {
  const plan = state.organizer.plan;
  return `
    <section class="organizer-plan">
      <div>
        <div class="eyebrow">AI Organized</div>
        <h2>${escapeHtml(plan.focusTitle)}</h2>
        <p>${escapeHtml(plan.focusBrief)}</p>
      </div>
      ${(plan.suggestedActions || []).length ? `
        <div class="suggested-actions">
          ${plan.suggestedActions.slice(0, 4).map((item) => `<span>${escapeHtml(item)}</span>`).join('')}
        </div>
      ` : ''}
    </section>`;
}

function renderActiveView() {
  if (state.activeTab === 'meetings') return renderMeetingStudio();
  if (state.activeTab === 'builder') return renderLabBuilder();
  if (state.activeTab === 'projects') return renderProjects();
  if (state.activeTab === 'ai') return renderAiReview();
  if (state.activeTab === 'integrations') return renderIntegrations();
  if (state.activeTab === 'settings') return renderSettings();
  return renderCommand();
}

function panelEnabled(id) {
  return Boolean(state.visiblePanels[id]);
}

function panelCollapsed(id) {
  return Boolean(state.collapsedPanels[id]);
}

function renderPanel(id, title, subtitle, content, actions = '') {
  if (!panelEnabled(id)) return '';
  const collapsed = panelCollapsed(id);
  return `
    <section class="panel quiet-panel adaptive-panel" data-panel="${id}">
      <div class="panel-header">
        <div><div class="eyebrow">${escapeHtml(title)}</div><div class="panel-title">${escapeHtml(subtitle)}</div></div>
        <div class="inline-actions">
          ${actions}
          <button class="button compact ghost" type="button" data-action="collapse-panel" data-panel-id="${id}">${collapsed ? 'Open' : 'Close'}</button>
          ${state.customize ? `<button class="button compact ghost" type="button" data-action="hide-panel" data-panel-id="${id}">Hide</button>` : ''}
        </div>
      </div>
      ${collapsed ? '' : content}
    </section>`;
}

function renderCommand() {
  const leadTask = state.data.tasks[0];
  const nextMeeting = state.data.meetings.find((meeting) => meeting.status === 'scheduled') || state.data.meetings[0];
  const customSections = state.data.customSections || [];
  const plan = state.organizer.plan;
  return `
    <section class="view-header">
      <div>
        <div class="eyebrow">Command Center</div>
        <h1>${escapeHtml(plan?.focusTitle || 'One workspace, selectively arranged')}</h1>
        <p>${escapeHtml(plan?.focusBrief || 'Lab Link now hides the surface area you do not need and lets AI reorganize the workspace around the moment.')}</p>
      </div>
      <div class="inline-actions">
        <button class="button secondary" type="button" data-action="toggle-customize">${state.customize ? 'Done customizing' : 'Customize layout'}</button>
        <button class="button primary" type="button" data-action="organize-workspace" ${state.organizer.busy ? 'disabled' : ''}>AI Organize</button>
      </div>
    </section>
    ${panelEnabled('focus') ? `
      <section class="focus-canvas">
        <div>
          <div class="eyebrow">Primary Focus</div>
          <h2>${escapeHtml(leadTask?.title || 'No open task')}</h2>
          <p>${escapeHtml(leadTask?.reason || 'The queue is clear.')}</p>
          <div class="meta">
            <span class="pill ${statusClass(leadTask?.priority)}">${escapeHtml(leadTask?.priority || 'clear')}</span>
            <span>${escapeHtml(leadTask?.project || 'No project')}</span>
            <span>${escapeHtml(leadTask?.assignee || 'Unassigned')}</span>
          </div>
        </div>
        <div class="focus-side">
          <span>${state.data.counts.openTasks} tasks</span>
          <span>${state.data.counts.risks} risks</span>
          <span>${state.data.counts.pendingAi} reviews</span>
        </div>
      </section>` : ''}
    <div class="adaptive-stack">
      ${renderPanel('tasks', 'Priority Queue', 'Only the work that should stay visible', `<div class="item-list">${state.data.tasks.slice(0, 4).map(renderTask).join('')}</div>`)}
      ${renderPanel('sections', 'Lab Sections', 'Custom surfaces for this lab', `<div class="section-grid compact-sections">${customSections.slice(0, 3).map(renderCustomSection).join('') || '<div class="muted">No custom sections yet.</div>'}</div>`, '<button class="button compact" type="button" data-tab="builder">Build</button>')}
      ${renderPanel('risks', 'Risk Radar', 'Only blockers that change the plan', `<div class="item-list">${state.data.risks.map(renderRisk).join('')}</div>`)}
      ${renderPanel('meetings', 'Meetings', 'The current coordination thread', `<div class="item-list">${state.data.meetings.map(renderMeetingRow).join('')}</div>`, '<button class="button compact" type="button" data-tab="meetings">Studio</button>')}
      ${renderPanel('inbox', 'Inbox', 'Messages worth converting into action', `<div class="item-list">${state.data.inbox.map(renderInbox).join('')}</div>`)}
      ${renderPanel('projects', 'Projects', 'Portfolio summary', `<div class="section-grid compact-sections">${state.data.projects.slice(0, 4).map(renderProjectMini).join('')}</div>`)}
      ${renderPanel('ai', 'AI Review', 'Pending suggestions', `<div class="item-list">${state.data.aiSuggestions.slice(0, 4).map(renderSuggestion).join('')}</div>`)}
      ${renderPanel('integrations', 'Integrations', 'Configured external surfaces', `<div class="item-list">${state.data.integrations.slice(0, 6).map(renderIntegrationMini).join('')}</div>`)}
    </div>`;
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

function renderProjectMini(project) {
  return `
    <article class="section-card mini-section">
      <div class="section-card-head">
        <div><div class="eyebrow">${escapeHtml(project.owner)}</div><h3>${escapeHtml(project.name)}</h3></div>
        <span class="pill ${statusClass(project.status)}">${escapeHtml(project.status)}</span>
      </div>
      <div class="progress"><span style="width: ${Math.max(0, Math.min(100, Number(project.completion || 0)))}%;"></span></div>
      <p class="muted small">${escapeHtml(project.health)}</p>
    </article>`;
}

function renderIntegrationMini(item) {
  return `
    <article class="queue-item mini-row">
      <div>
        <div class="queue-title">${escapeHtml(item.label)}</div>
        <div class="muted small">${escapeHtml(item.nextStep)}</div>
      </div>
      <span class="pill ${statusClass(item.status)}">${escapeHtml(item.status)}</span>
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

function renderLabBuilder() {
  const provider = state.data.providers.find((item) => item.status === 'configured');
  return `
    <section class="view-header">
      <div>
        <div class="eyebrow">Lab Builder</div>
        <h1>Make Lab Link evolve around your lab</h1>
        <p>Ask a real AI provider to design new operating sections, then review and apply them into this local workspace.</p>
      </div>
      <div class="inline-actions">
        <span class="pill ${provider ? 'configured' : ''}">${provider ? `AI: ${escapeHtml(provider.label)}` : 'AI setup required'}</span>
      </div>
    </section>
    <section class="builder-layout">
      <div class="tool builder-tool">
        <div class="tool-header">
          <div><div class="eyebrow">AI Composer</div><h3>Design a section</h3></div>
          <button class="button primary" type="button" data-action="propose-section" ${state.builder.busy ? 'disabled' : ''}>Generate With Real AI</button>
        </div>
        <div class="form-grid">
          <div class="field">
            <label for="builder-goal">What should Lab Link manage?</label>
            <textarea id="builder-goal">${escapeHtml(state.builder.goal)}</textarea>
          </div>
          <div class="field">
            <label for="builder-profile">Lab profile and constraints</label>
            <textarea id="builder-profile">${escapeHtml(state.builder.labProfile)}</textarea>
          </div>
          <div class="meta">
            <span class="pill">${state.builder.busy ? escapeHtml(state.builder.busy) : 'ready'}</span>
            <span class="muted">Provider output is reviewed before it becomes part of the workspace.</span>
          </div>
        </div>
      </div>
      <div class="tool builder-tool">
        <div class="tool-header">
          <div><div class="eyebrow">Proposal</div><h3>Review before applying</h3></div>
          <button class="button secondary" type="button" data-action="apply-proposal" ${!state.builder.proposal || state.builder.busy ? 'disabled' : ''}>Apply Section</button>
        </div>
        ${state.builder.proposal ? renderCustomSection(state.builder.proposal, { preview: true }) : '<div class="output muted">No AI proposal yet. Generate a section with a configured provider.</div>'}
      </div>
    </section>
    <section class="grid two airy-grid">
      <div class="panel quiet-panel">
        <div class="panel-header"><div><div class="eyebrow">Manual Section</div><div class="panel-title">Fast local customization</div></div></div>
        <div class="form-grid">
          <div class="field">
            <label for="manual-title">Section name</label>
            <input id="manual-title" value="${escapeHtml(state.builder.manualTitle)}">
          </div>
          <div class="field">
            <label for="manual-purpose">Purpose</label>
            <textarea id="manual-purpose">${escapeHtml(state.builder.manualPurpose)}</textarea>
          </div>
          <button class="button" type="button" data-action="save-manual-section">Save Manual Section</button>
        </div>
      </div>
      <div class="panel quiet-panel">
        <div class="panel-header"><div><div class="eyebrow">Design Choices</div><div class="panel-title">Why this is calmer</div></div></div>
        <div class="item-list">
          <div class="architecture-row"><strong>Focus first</strong><span>Command view now emphasizes a primary task, next meeting, and only active blockers.</span></div>
          <div class="architecture-row"><strong>Optional context</strong><span>The intelligence rail is hidden by default and can be toggled on when needed.</span></div>
          <div class="architecture-row"><strong>Custom sections</strong><span>Each lab can add management surfaces without changing code or installing plugins.</span></div>
          <div class="architecture-row"><strong>Real AI only</strong><span>AI composition fails honestly if the provider is unavailable.</span></div>
        </div>
      </div>
    </section>
    <section class="panel quiet-panel airy-grid">
      <div class="panel-header"><div><div class="eyebrow">Installed Sections</div><div class="panel-title">Local workspace extensions</div></div></div>
      <div class="section-grid">${(state.data.customSections || []).map((section) => renderCustomSection(section, { removable: true })).join('')}</div>
    </section>`;
}

function renderCustomSection(section, options = {}) {
  return `
    <article class="section-card">
      <div class="section-card-head">
        <div>
          <div class="eyebrow">${escapeHtml(section.module || 'custom')}</div>
          <h3>${escapeHtml(section.title)}</h3>
        </div>
        <span class="pill">${escapeHtml(section.layout || 'brief')}</span>
      </div>
      <p class="muted">${escapeHtml(section.purpose)}</p>
      <div class="field-list">
        ${(section.fields || []).slice(0, 4).map((field) => `
          <div class="mini-field"><span>${escapeHtml(field.label)}</span><strong>${escapeHtml(field.value || field.type)}</strong></div>
        `).join('')}
      </div>
      ${(section.signals || []).length ? `<div class="section-subhead">Signals</div><ul>${section.signals.slice(0, 3).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : ''}
      ${(section.actions || []).length ? `<div class="section-subhead">Actions</div><ul>${section.actions.slice(0, 3).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : ''}
      <div class="meta">
        ${(section.integrations || []).slice(0, 4).map((item) => `<span class="pill">${escapeHtml(item)}</span>`).join('')}
      </div>
      ${options.removable ? `<button class="button compact ghost" type="button" data-action="delete-section" data-section-id="${escapeHtml(section.id)}">Remove</button>` : ''}
      ${options.preview ? `<div class="muted small">${escapeHtml(section.dataPolicy || '')}</div>` : ''}
    </article>`;
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
  const configured = state.data.integrations.filter((item) => ['configured', 'ready', 'oauth credentials present'].includes(item.status));
  return `
    <section class="view-header">
      <div>
        <div class="eyebrow">Integrations</div>
        <h1>Institution and lab coordination surfaces</h1>
        <p>Readiness is based on configured credentials. Setup stays visible so each lab can bring Outlook, Gmail, Slack, Notion, Zoom, and messaging online at its own pace.</p>
      </div>
      <div class="inline-actions"><span class="pill ${configured.length ? 'ok' : ''}">${configured.length} ready</span></div>
    </section>
    <section class="integration-summary">
      <div>
        <div class="eyebrow">Setup Path</div>
        <h2>Connect one surface at a time</h2>
      </div>
      <div class="setup-steps">
        <span>1. Credentials</span>
        <span>2. Consent</span>
        <span>3. Sync</span>
        <span>4. Publish</span>
      </div>
    </section>
    <section class="grid two">
      ${state.data.integrations.map((item) => `
        <article class="integration-row">
          <div>
            <div class="project-title">${escapeHtml(item.label)}</div>
            <div class="muted small">${escapeHtml(item.surface)}</div>
            <div class="meta">${(item.required || []).map((key) => `<span class="pill">${escapeHtml(key)}</span>`).join('')}</div>
            ${(item.setup || []).length ? `<div class="setup-mini">${item.setup.map((step) => `<span>${escapeHtml(step)}</span>`).join('')}</div>` : ''}
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

function applyOrganizerPlan(plan) {
  state.organizer.plan = plan;
  state.activeTab = plan.workspace || 'command';
  const nextVisible = {};
  for (const key of Object.keys(PANEL_LABELS)) nextVisible[key] = false;
  for (const key of plan.visiblePanels || ['focus', 'tasks', 'sections']) {
    if (key in nextVisible) nextVisible[key] = true;
  }
  nextVisible.focus = nextVisible.focus || state.activeTab === 'command';
  state.visiblePanels = nextVisible;
  const nextCollapsed = {};
  for (const key of plan.collapsedPanels || []) nextCollapsed[key] = true;
  state.collapsedPanels = nextCollapsed;
  savePrefs();
}

async function organizeWorkspace() {
  const intent = state.organizer.intent.trim();
  if (!intent) {
    state.toast = 'Tell Lab Link what you are trying to do first.';
    render();
    return;
  }
  state.organizer.busy = 'organizing';
  render();
  try {
    const result = await api('/api/workspace/organize', {
      method: 'POST',
      body: JSON.stringify({ intent }),
    });
    applyOrganizerPlan(result.plan);
    state.toast = `Workspace organized by ${result.provider.label}.`;
  } catch (error) {
    const required = error.payload?.required ? ` Required: ${error.payload.required.join(', ')}.` : '';
    state.toast = `${error.message}${required}`;
  } finally {
    state.organizer.busy = null;
    render();
  }
}

function applyFocusPreset() {
  applyOrganizerPlan({
    workspace: 'command',
    focusTitle: 'Execution focus',
    focusBrief: 'Showing only the primary focus, next tasks, and custom lab sections.',
    visiblePanels: ['focus', 'tasks', 'sections'],
    collapsedPanels: [],
    suggestedActions: ['Work top task', 'Review custom section', 'Open context only if needed'],
  });
  state.toast = 'Focus preset applied.';
  render();
}

function applyEverythingPreset() {
  state.activeTab = 'command';
  state.visiblePanels = Object.fromEntries(Object.keys(PANEL_LABELS).map((key) => [key, true]));
  state.collapsedPanels = { risks: true, inbox: true, projects: true, ai: true, integrations: true };
  state.organizer.plan = {
    focusTitle: 'Full workspace',
    focusBrief: 'Everything is available, with secondary panels collapsed to reduce visual load.',
    suggestedActions: ['Open only what you need'],
  };
  savePrefs();
  state.toast = 'Full workspace preset applied.';
  render();
}

async function proposeSection() {
  if (!state.builder.goal.trim()) {
    state.toast = 'Describe the lab section you want AI to design.';
    render();
    return;
  }
  state.builder.busy = 'real ai';
  state.builder.proposal = null;
  render();
  try {
    const result = await api('/api/workspace/propose', {
      method: 'POST',
      body: JSON.stringify({
        goal: state.builder.goal,
        labProfile: state.builder.labProfile,
      }),
    });
    state.builder.proposal = result.section;
    state.toast = `AI proposed ${result.section.title}. Review before applying.`;
  } catch (error) {
    const required = error.payload?.required ? ` Required: ${error.payload.required.join(', ')}.` : '';
    state.toast = `${error.message}${required}`;
  } finally {
    state.builder.busy = null;
    render();
  }
}

async function saveSection(section) {
  state.builder.busy = 'saving';
  render();
  try {
    const result = await api('/api/workspace/sections', {
      method: 'POST',
      body: JSON.stringify({ section }),
    });
    state.data = result.state;
    state.toast = `Saved ${result.section.title}.`;
  } catch (error) {
    state.toast = `Could not save section: ${error.message}`;
  } finally {
    state.builder.busy = null;
    render();
  }
}

async function saveManualSection() {
  const title = state.builder.manualTitle.trim();
  if (!title) {
    state.toast = 'Manual section name is required.';
    render();
    return;
  }
  await saveSection({
    title,
    module: 'manual_lab_ops',
    purpose: state.builder.manualPurpose,
    layout: 'checklist',
    createdBy: 'manual',
    fields: [
      { label: 'Owner', type: 'person', value: state.data.user.name },
      { label: 'Status', type: 'status', value: 'Needs setup' },
    ],
    signals: ['Manual section created locally.'],
    actions: ['Define fields.', 'Connect relevant integrations.', 'Review in next lab meeting.'],
    integrations: ['Notion', 'Slack', 'Zoom'],
  });
}

async function deleteSection(id) {
  state.builder.busy = 'removing';
  render();
  try {
    const result = await api('/api/workspace/sections/delete', {
      method: 'POST',
      body: JSON.stringify({ id }),
    });
    state.data = result.state;
    state.toast = result.deleted ? 'Section removed.' : 'Section was already removed.';
  } catch (error) {
    state.toast = `Could not remove section: ${error.message}`;
  } finally {
    state.builder.busy = null;
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
  if (action === 'organize-workspace') organizeWorkspace();
  if (action === 'focus-preset') applyFocusPreset();
  if (action === 'everything-preset') applyEverythingPreset();
  if (action === 'toggle-customize') {
    state.customize = !state.customize;
    savePrefs();
    render();
  }
  if (action === 'rail-focus') {
    state.railFocus = event.target.closest('[data-action]').dataset.mode;
    savePrefs();
    render();
  }
  if (action === 'toggle-intel') {
    state.showIntel = !state.showIntel;
    savePrefs();
    render();
  }
  if (action === 'density-toggle') {
    state.density = state.density === 'compact' ? 'comfortable' : 'compact';
    savePrefs();
    render();
  }
  if (action === 'collapse-panel') {
    const id = event.target.closest('[data-panel-id]').dataset.panelId;
    state.collapsedPanels[id] = !state.collapsedPanels[id];
    savePrefs();
    render();
  }
  if (action === 'hide-panel') {
    const id = event.target.closest('[data-panel-id]').dataset.panelId;
    state.visiblePanels[id] = false;
    savePrefs();
    render();
  }
  if (action === 'run-rules') runRules();
  if (action === 'run-ai') runAiAnalysis();
  if (action === 'start-zoom') startZoom();
  if (action === 'propose-section') proposeSection();
  if (action === 'apply-proposal' && state.builder.proposal) saveSection(state.builder.proposal);
  if (action === 'save-manual-section') saveManualSection();
  if (action === 'delete-section') deleteSection(event.target.closest('[data-action]').dataset.sectionId);
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
    state.showIntel = false;
    state.customize = false;
    state.visiblePanels = {
      focus: true,
      tasks: true,
      sections: true,
      risks: false,
      meetings: false,
      inbox: false,
      projects: false,
      ai: false,
      integrations: false,
    };
    state.collapsedPanels = {};
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
  if (event.target.id === 'workspace-select') {
    state.activeTab = event.target.value;
    savePrefs();
    render();
  }
  if (event.target.id === 'organizer-intent') {
    state.organizer.intent = event.target.value;
  }
  if (event.target.id === 'builder-goal') {
    state.builder.goal = event.target.value;
  }
  if (event.target.id === 'builder-profile') {
    state.builder.labProfile = event.target.value;
  }
  if (event.target.id === 'manual-title') {
    state.builder.manualTitle = event.target.value;
  }
  if (event.target.id === 'manual-purpose') {
    state.builder.manualPurpose = event.target.value;
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
  if (event.target.matches('[data-panel-visible]')) {
    state.visiblePanels[event.target.dataset.panelVisible] = event.target.checked;
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

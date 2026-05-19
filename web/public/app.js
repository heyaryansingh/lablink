const STORAGE_KEY = 'lablink.web.v2.7';

const TABS = [
  { id: 'command', label: 'Command', key: '1' },
  { id: 'experiments', label: 'Experiments', key: '2' },
  { id: 'meetings', label: 'Meetings', key: '3' },
  { id: 'projects', label: 'Projects', key: '4' },
  { id: 'integrations', label: 'Integrations', key: '5' },
  { id: 'builder', label: 'Build', key: '6' },
  { id: 'ai', label: 'Review', key: '7' },
];

const DEFAULT_PANEL_ORDER = ['tasks', 'sections', 'meetings', 'risks', 'projects', 'integrations', 'ai', 'inbox'];
const DEFAULT_BLOCK_ORDER = [
  'priority-queue',
  'experiment-readiness',
  'meeting-studio',
  'reagent-watch',
  'project-health',
  'risk-radar',
  'calendar-pressure',
  'integration-routes',
  'ai-review',
  'inbox-signals',
  'custom-sections',
];

const WORKSPACE_PRESETS = [
  { id: 'command', label: 'Command', intent: 'Focus on the few lab actions that matter today.' },
  { id: 'experiments', label: 'Experiments', intent: 'Organize experiment readiness, reagents, samples, approvals, and blockers.' },
  { id: 'meetings', label: 'Meeting', intent: 'Prepare or process the current meeting into tasks, risks, and follow-up.' },
  { id: 'builder', label: 'Build', intent: 'Create or adapt lab-specific sections for this workspace.' },
  { id: 'projects', label: 'Projects', intent: 'Review project status, owners, deadlines, and blockers.' },
  { id: 'integrations', label: 'Integrations', intent: 'Set up or check Zoom, email, calendar, Slack, Notion, and messaging integrations.' },
  { id: 'ai', label: 'Review', intent: 'Review provider-backed suggestions and provenance.' },
];

const ROLE_PRESETS = [
  {
    id: 'pi',
    label: 'PI Review',
    intent: 'Review project health, major risks, grant pressure, and decisions that need PI attention.',
    panels: ['focus', 'projects', 'risks', 'ai'],
    collapsed: ['ai'],
    actions: ['Review at-risk projects', 'Approve decisions', 'Open grant deadlines'],
  },
  {
    id: 'lab-manager',
    label: 'Lab Manager',
    intent: 'Track reagents, equipment, safety items, meeting follow-up, and blocked operational work.',
    panels: ['focus', 'tasks', 'sections', 'risks', 'integrations'],
    collapsed: ['integrations'],
    actions: ['Check blockers', 'Update lab sections', 'Review setup gaps'],
  },
  {
    id: 'researcher',
    label: 'Researcher',
    intent: 'Keep my experiments, analysis tasks, meetings, and immediate blockers visible.',
    panels: ['focus', 'tasks', 'meetings', 'sections'],
    collapsed: [],
    actions: ['Work top task', 'Process meeting notes', 'Update experiment section'],
  },
  {
    id: 'computational',
    label: 'Computational',
    intent: 'Emphasize analysis queues, project deadlines, collaboration follow-up, and compute-related tasks.',
    panels: ['focus', 'tasks', 'projects', 'inbox'],
    collapsed: ['inbox'],
    actions: ['Review analysis tasks', 'Check collaborator inbox', 'Prepare update'],
  },
];

const BLOCK_WORKSPACES = {
  command: ['priority-queue', 'experiment-readiness', 'meeting-studio', 'reagent-watch', 'project-health', 'calendar-pressure'],
  experiments: ['experiment-readiness', 'reagent-watch', 'risk-radar', 'priority-queue', 'calendar-pressure', 'custom-sections'],
  meetings: ['meeting-studio', 'priority-queue', 'ai-review', 'calendar-pressure', 'inbox-signals', 'integration-routes'],
  projects: ['project-health', 'priority-queue', 'risk-radar', 'calendar-pressure', 'inbox-signals', 'ai-review'],
  integrations: ['integration-routes', 'meeting-studio', 'inbox-signals', 'ai-review', 'custom-sections'],
  builder: ['custom-sections', 'experiment-readiness', 'reagent-watch', 'integration-routes'],
  ai: ['ai-review', 'priority-queue', 'meeting-studio', 'inbox-signals', 'project-health'],
};

const BLOCK_REGISTRY = {
  'priority-queue': {
    title: 'Priority Queue',
    domain: 'Execution',
    size: 'large',
    subtabs: [
      { id: 'today', label: 'Today' },
      { id: 'blocked', label: 'Blocked' },
      { id: 'waiting', label: 'Waiting' },
    ],
  },
  'experiment-readiness': {
    title: 'Experiment Readiness',
    domain: 'Wet Lab',
    size: 'large',
    subtabs: [
      { id: 'protocols', label: 'Protocols' },
      { id: 'samples', label: 'Samples' },
      { id: 'approvals', label: 'Approvals' },
    ],
  },
  'meeting-studio': {
    title: 'Meeting Studio',
    domain: 'Coordination',
    size: 'large',
    subtabs: [
      { id: 'agenda', label: 'Agenda' },
      { id: 'transcript', label: 'Transcript' },
      { id: 'actions', label: 'Actions' },
    ],
  },
  'reagent-watch': {
    title: 'Reagent Watch',
    domain: 'Supply',
    size: 'medium',
    subtabs: [
      { id: 'stock', label: 'Stock' },
      { id: 'vendors', label: 'Vendors' },
      { id: 'risks', label: 'Risks' },
    ],
  },
  'project-health': {
    title: 'Project Health',
    domain: 'Portfolio',
    size: 'large',
    subtabs: [
      { id: 'active', label: 'Active' },
      { id: 'at-risk', label: 'At Risk' },
      { id: 'deadlines', label: 'Deadlines' },
    ],
  },
  'risk-radar': {
    title: 'Risk Radar',
    domain: 'Controls',
    size: 'medium',
    subtabs: [
      { id: 'open', label: 'Open' },
      { id: 'mitigations', label: 'Mitigations' },
      { id: 'sources', label: 'Sources' },
    ],
  },
  'calendar-pressure': {
    title: 'Calendar Pressure',
    domain: 'Schedule',
    size: 'medium',
    subtabs: [
      { id: 'upcoming', label: 'Upcoming' },
      { id: 'prep', label: 'Prep' },
      { id: 'deadlines', label: 'Deadlines' },
    ],
  },
  'integration-routes': {
    title: 'Integration Routes',
    domain: 'Systems',
    size: 'large',
    subtabs: [
      { id: 'oauth', label: 'OAuth' },
      { id: 'sync', label: 'Sync' },
      { id: 'publish', label: 'Publish' },
    ],
  },
  'ai-review': {
    title: 'AI Review',
    domain: 'Review',
    size: 'medium',
    subtabs: [
      { id: 'suggestions', label: 'Suggestions' },
      { id: 'providers', label: 'Providers' },
      { id: 'runs', label: 'Runs' },
    ],
  },
  'inbox-signals': {
    title: 'Inbox Signals',
    domain: 'Messages',
    size: 'medium',
    subtabs: [
      { id: 'actionable', label: 'Actionable' },
      { id: 'collab', label: 'Collab' },
      { id: 'low-noise', label: 'Low Noise' },
    ],
  },
  'custom-sections': {
    title: 'Custom Sections',
    domain: 'Lab OS',
    size: 'large',
    subtabs: [
      { id: 'installed', label: 'Installed' },
      { id: 'templates', label: 'Templates' },
      { id: 'ai-build', label: 'AI Build' },
    ],
  },
};

const DESIGN_LIBRARY_URLS = {
  motion: 'https://cdn.jsdelivr.net/npm/@motionone/dom@10.18.0/+esm',
  floating: 'https://cdn.jsdelivr.net/npm/@floating-ui/dom@1.7.4/+esm',
  sortable: 'https://cdn.jsdelivr.net/npm/sortablejs@1.15.3/+esm',
};

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
  commandOpen: false,
  paletteIndex: 0,
  paletteFocusItems: false,
  inspector: { open: false, mode: 'context', itemId: null },
  libraries: { loaded: false, motion: null, floating: null, sortable: null, status: 'fallback' },
  sortableInstance: null,
  blockSortableInstance: null,
  panelOrder: [...DEFAULT_PANEL_ORDER],
  blockOrder: [...DEFAULT_BLOCK_ORDER],
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
  visibleBlocks: Object.fromEntries(DEFAULT_BLOCK_ORDER.map((id) => [id, true])),
  collapsedPanels: {},
  collapsedBlocks: {},
  blockSubtabs: {},
  blockLoading: false,
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
  integration: {
    oauthCode: '',
    busy: null,
    authorizationUrl: '',
    authorizationLabel: '',
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
    if (Array.isArray(prefs.panelOrder)) state.panelOrder = normalizePanelOrder(prefs.panelOrder);
    if (Array.isArray(prefs.blockOrder)) state.blockOrder = normalizeBlockOrder(prefs.blockOrder);
    if (prefs.visibleBlocks) state.visibleBlocks = { ...state.visibleBlocks, ...prefs.visibleBlocks };
    if (prefs.collapsedBlocks) state.collapsedBlocks = prefs.collapsedBlocks;
    if (prefs.blockSubtabs) state.blockSubtabs = prefs.blockSubtabs;
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
    panelOrder: state.panelOrder,
    blockOrder: state.blockOrder,
    visibleBlocks: state.visibleBlocks,
    collapsedBlocks: state.collapsedBlocks,
    blockSubtabs: state.blockSubtabs,
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

function normalizePanelOrder(order) {
  const valid = new Set(DEFAULT_PANEL_ORDER);
  const unique = order.filter((id, index) => valid.has(id) && order.indexOf(id) === index);
  for (const id of DEFAULT_PANEL_ORDER) {
    if (!unique.includes(id)) unique.push(id);
  }
  return unique;
}

function normalizeBlockOrder(order) {
  const valid = new Set(DEFAULT_BLOCK_ORDER);
  const unique = order.filter((id, index) => valid.has(id) && order.indexOf(id) === index);
  for (const id of DEFAULT_BLOCK_ORDER) {
    if (!unique.includes(id)) unique.push(id);
  }
  return unique;
}

function blockById(id) {
  return BLOCK_REGISTRY[id] || BLOCK_REGISTRY['priority-queue'];
}

function activeBlockSubtab(id) {
  const block = blockById(id);
  return block.subtabs.some((tab) => tab.id === state.blockSubtabs[id]) ? state.blockSubtabs[id] : block.subtabs[0].id;
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
  loadDesignLibraries();
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

async function loadDesignLibraries() {
  const results = await Promise.allSettled([
    import(DESIGN_LIBRARY_URLS.motion),
    import(DESIGN_LIBRARY_URLS.floating),
    import(DESIGN_LIBRARY_URLS.sortable),
  ]);
  const [motion, floating, sortable] = results;
  state.libraries.motion = motion.status === 'fulfilled' ? motion.value : null;
  state.libraries.floating = floating.status === 'fulfilled' ? floating.value : null;
  state.libraries.sortable = sortable.status === 'fulfilled' ? sortable.value.default || sortable.value : null;
  state.libraries.loaded = true;
  state.libraries.status = [state.libraries.motion, state.libraries.floating, state.libraries.sortable].filter(Boolean).length ? 'enhanced' : 'fallback';
  afterRender();
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
    <div class="studio-shell ${state.inspector.open ? 'inspector-open' : ''}">
      <main class="stage"><div class="stage-scroll">${renderMain()}</div></main>
      ${renderInspector()}
    </div>
    ${state.commandOpen ? renderCommandPalette() : ''}
    ${state.toast ? `<div class="toast" data-animate>${escapeHtml(state.toast)}</div>` : ''}`;
  afterRender();
}

function renderTopbar() {
  const { lab, user } = state.data;
  return `
    <header class="topbar">
      <button class="brand-button" type="button" data-action="open-inspector" data-inspector-mode="context">
        <div class="product-mark">${escapeHtml(lab.name)} / Lab Link</div>
        <div class="muted small">${escapeHtml(lab.institution)} - ${escapeHtml(user.name)} (${escapeHtml(user.role)})</div>
      </button>
      <div class="topbar-actions">
        <button class="mode-button" type="button" data-action="toggle-command" aria-expanded="${state.commandOpen ? 'true' : 'false'}">
          <span>${escapeHtml(tabById(state.activeTab).label)}</span>
          <span class="mode-kbd">Ctrl K</span>
        </button>
        <button class="button ghost" type="button" data-action="toggle-customize">${state.customize ? 'Done' : 'Customize'}</button>
        <button class="button primary" type="button" data-action="organize-workspace" ${state.organizer.busy ? 'disabled' : ''}>Organize</button>
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
    ${renderLabTabs()}
    ${renderCommandComposer()}
    ${state.organizer.plan ? renderOrganizerPlan() : ''}
    ${renderActiveView()}`;
}

function renderLabTabs() {
  return `
    <nav class="lab-tabs" aria-label="Lab workspace tabs" data-animate>
      ${TABS.map((tab) => `
        <button class="lab-tab ${state.activeTab === tab.id ? 'active' : ''}" type="button" data-tab="${tab.id}">
          <span>${escapeHtml(tab.label)}</span>
          <kbd>${escapeHtml(tab.key)}</kbd>
        </button>
      `).join('')}
    </nav>`;
}

function renderCommandComposer() {
  return `
    <section class="command-composer block-composer ${state.organizer.busy ? 'is-working' : ''}" data-animate>
      <div>
        <div class="eyebrow">Lab Blocks Runtime</div>
        <div class="workspace-pills">
          ${WORKSPACE_PRESETS.map((preset) => `
            <button class="workspace-pill ${state.activeTab === preset.id ? 'active' : ''}" type="button" data-tab="${preset.id}" title="${escapeHtml(preset.intent)}">${escapeHtml(preset.label)}</button>
          `).join('')}
        </div>
      </div>
      <div class="composer-input-row">
        <textarea id="organizer-intent" rows="2">${escapeHtml(state.organizer.intent)}</textarea>
        <button class="composer-submit" type="button" data-action="organize-workspace" ${state.organizer.busy ? 'disabled' : ''}>${state.organizer.busy ? 'Tuning' : 'Organize'}</button>
      </div>
      <div class="composer-meta">
        <button class="text-action" type="button" data-action="focus-preset">Focused blocks</button>
        <button class="text-action" type="button" data-action="everything-preset">Show more</button>
        <button class="text-action" type="button" data-action="restore-blocks">Restore blocks</button>
        <button class="text-action" type="button" data-action="open-inspector" data-inspector-mode="integrations">Integrations</button>
        <span>${providerReady() ? 'Real provider configured' : 'Real AI provider required'}</span>
      </div>
      ${state.organizer.busy ? `<div class="block-thinking"><span></span><span></span><span></span><strong>Rebuilding block layout</strong></div>` : ''}
    </section>`;
}

function renderOrganizerPlan() {
  const plan = state.organizer.plan;
  return `
    <section class="organizer-plan" data-animate>
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
  if (state.activeTab === 'builder') return renderLabBuilder();
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
    <section class="adaptive-panel" data-panel="${id}" data-animate draggable="true">
      <div class="panel-header">
        <div class="panel-title-wrap">
          <span class="drag-handle" title="Reorder">::</span>
          <div><div class="eyebrow">${escapeHtml(title)}</div><div class="panel-title">${escapeHtml(subtitle)}</div></div>
        </div>
        <div class="inline-actions">
          ${actions}
          <button class="button compact ghost" type="button" data-action="inspect-panel" data-panel-id="${id}">Inspect</button>
          <button class="button compact ghost" type="button" data-action="collapse-panel" data-panel-id="${id}">${collapsed ? 'Open' : 'Close'}</button>
          ${state.customize ? `<button class="button compact ghost" type="button" data-action="hide-panel" data-panel-id="${id}">Hide</button>` : ''}
        </div>
      </div>
      ${collapsed ? '' : content}
    </section>`;
}

function renderCommand() {
  const leadTask = state.data.tasks[0];
  const plan = state.organizer.plan;
  const blocks = activeWorkspaceBlocks();
  return `
    <section class="block-hero" data-animate>
      <div class="block-hero-main">
        <div class="eyebrow">${escapeHtml(tabById(state.activeTab).label)} Workspace</div>
        <h1>${escapeHtml(plan?.focusTitle || leadTask?.title || 'Lab work, organized in blocks')}</h1>
        <p>${escapeHtml(plan?.focusBrief || leadTask?.reason || 'Each lab surface can be tuned manually or reorganized by a real AI provider.')}</p>
      </div>
      <div class="block-hero-metrics">
        <span><strong>${state.data.counts.openTasks}</strong> tasks</span>
        <span><strong>${state.data.counts.risks}</strong> risks</span>
        <span><strong>${state.data.counts.pendingAi}</strong> reviews</span>
      </div>
      <div class="inline-actions">
        <button class="button secondary" type="button" data-action="toggle-customize">${state.customize ? 'Done customizing' : 'Customize blocks'}</button>
        <button class="button primary" type="button" data-action="organize-workspace" ${state.organizer.busy ? 'disabled' : ''}>Organize Blocks</button>
      </div>
    </section>
    ${state.customize ? renderBlockChooser() : ''}
    <div class="block-grid" data-sortable-blocks>
      ${blocks.map((id) => renderLabBlock(id)).join('')}
    </div>`;
}

function activeWorkspaceBlocks() {
  const workspaceBlocks = BLOCK_WORKSPACES[state.activeTab] || BLOCK_WORKSPACES.command;
  const allowed = new Set([...workspaceBlocks, ...DEFAULT_BLOCK_ORDER]);
  return state.blockOrder
    .filter((id) => allowed.has(id) && state.visibleBlocks[id] && workspaceBlocks.includes(id))
    .concat(workspaceBlocks.filter((id) => state.visibleBlocks[id] && !state.blockOrder.includes(id)));
}

function renderBlockChooser() {
  return `
    <section class="block-customizer" data-animate>
      <div>
        <div class="eyebrow">Block Controls</div>
        <h2>Choose what this lab surface shows</h2>
      </div>
      <div class="block-toggle-grid">
        ${DEFAULT_BLOCK_ORDER.map((id) => `
          <label class="block-toggle">
            <input type="checkbox" data-block-visible="${escapeHtml(id)}" ${state.visibleBlocks[id] ? 'checked' : ''}>
            <span>${escapeHtml(blockById(id).title)}</span>
          </label>
        `).join('')}
      </div>
    </section>`;
}

function renderLabBlock(id) {
  const block = blockById(id);
  const collapsed = Boolean(state.collapsedBlocks[id]);
  const activeSubtab = activeBlockSubtab(id);
  return `
    <section class="lab-block ${block.size || 'medium'} ${state.blockLoading ? 'loading' : ''}" data-block="${escapeHtml(id)}" data-animate draggable="true">
      <div class="lab-block-head">
        <div class="panel-title-wrap">
          <span class="drag-handle" title="Reorder">::</span>
          <div>
            <div class="eyebrow">${escapeHtml(block.domain)}</div>
            <h2>${escapeHtml(block.title)}</h2>
          </div>
        </div>
        <div class="inline-actions">
          <button class="button compact ghost" type="button" data-action="inspect-block" data-block-id="${escapeHtml(id)}">Inspect</button>
          <button class="button compact ghost" type="button" data-action="collapse-block" data-block-id="${escapeHtml(id)}">${collapsed ? 'Open' : 'Close'}</button>
          ${state.customize ? `<button class="button compact ghost" type="button" data-action="hide-block" data-block-id="${escapeHtml(id)}">Hide</button>` : ''}
        </div>
      </div>
      <div class="block-subtabs" role="tablist" aria-label="${escapeHtml(block.title)} subtabs">
        ${block.subtabs.map((tab) => `
          <button class="block-subtab ${activeSubtab === tab.id ? 'active' : ''}" type="button" data-action="block-subtab" data-block-id="${escapeHtml(id)}" data-subtab="${escapeHtml(tab.id)}">${escapeHtml(tab.label)}</button>
        `).join('')}
      </div>
      ${collapsed ? '' : `<div class="lab-block-body">${renderBlockContent(id, activeSubtab)}</div>`}
      ${state.blockLoading ? '<div class="block-loader"><span></span><span></span><span></span></div>' : ''}
    </section>`;
}

function renderBlockContent(id, subtab) {
  if (id === 'priority-queue') return renderPriorityBlock(subtab);
  if (id === 'experiment-readiness') return renderExperimentBlock(subtab);
  if (id === 'meeting-studio') return renderMeetingBlock(subtab);
  if (id === 'reagent-watch') return renderReagentBlock(subtab);
  if (id === 'project-health') return renderProjectBlock(subtab);
  if (id === 'risk-radar') return renderRiskBlock(subtab);
  if (id === 'calendar-pressure') return renderCalendarBlock(subtab);
  if (id === 'integration-routes') return renderIntegrationBlock(subtab);
  if (id === 'ai-review') return renderAiBlock(subtab);
  if (id === 'inbox-signals') return renderInboxBlock(subtab);
  if (id === 'custom-sections') return renderCustomSectionsBlock(subtab);
  return '<div class="muted small">Block is not configured.</div>';
}

function renderPriorityBlock(subtab) {
  const tasks = state.data.tasks.filter((task) => {
    if (subtab === 'blocked') return task.status === 'blocked' || task.priority === 'critical';
    if (subtab === 'waiting') return !task.due || task.priority === 'low';
    return task.due || ['critical', 'high'].includes(task.priority);
  });
  return `<div class="block-list">${tasks.slice(0, 5).map(renderTask).join('') || '<div class="muted small">No matching tasks.</div>'}</div>`;
}

function renderExperimentBlock(subtab) {
  const section = state.data.customSections?.find((item) => /reagent|protocol|readiness/i.test(`${item.title} ${item.module}`));
  if (subtab === 'samples') {
    return `
      <div class="lab-matrix">
        <div><span>Cohort</span><strong>Cohort 2</strong><em>Perfusion window pending</em></div>
        <div><span>Imaging</span><strong>Core booking</strong><em>${escapeHtml(state.data.calendarEvents[1]?.prep || 'Booking review needed')}</em></div>
        <div><span>Analysis</span><strong>Open field</strong><em>Due ${escapeHtml(formatDate(state.data.tasks.find((task) => /open field/i.test(task.title))?.due))}</em></div>
      </div>`;
  }
  if (subtab === 'approvals') {
    return `
      <div class="block-list">
        ${state.data.risks.slice(0, 3).map(renderRisk).join('')}
        <article class="queue-item"><div class="queue-title">Protocol readiness review</div><p class="muted small">Use Lab Builder to add approval, IACUC, IRB, training, or equipment sign-off fields for this lab.</p></article>
      </div>`;
  }
  return `
    <div class="block-list">
      ${section ? renderCustomSection(section) : '<article class="queue-item"><div class="queue-title">Protocol readiness</div><p class="muted small">No protocol section installed yet.</p></article>'}
      ${state.data.tasks.filter((task) => /schedule|confirm|run/i.test(task.title)).slice(0, 3).map(renderTask).join('')}
    </div>`;
}

function renderMeetingBlock(subtab) {
  if (subtab === 'transcript') {
    return `
      <div class="field compact-field">
        <textarea id="meeting-transcript" class="transcript">${escapeHtml(state.meeting.transcript)}</textarea>
      </div>
      <div class="inline-actions"><button class="button compact" type="button" data-action="run-rules">Run Rules</button><button class="button compact primary" type="button" data-action="run-ai">Analyze</button></div>`;
  }
  if (subtab === 'actions') {
    return state.meeting.rules ? `<div class="rules-grid">${renderRulesBucket('Tasks', state.meeting.rules.tasks)}${renderRulesBucket('Decisions', state.meeting.rules.decisions)}${renderRulesBucket('Risks', state.meeting.rules.risks)}</div>` : '<div class="muted small">Rules pass has not completed yet.</div>';
  }
  return `
    <div class="field compact-field">
      <textarea id="meeting-agenda">${escapeHtml(state.meeting.agenda)}</textarea>
    </div>
    <div class="inline-actions">
      <button class="button compact" type="button" data-action="start-zoom" ${state.meeting.busy ? 'disabled' : ''}>Start Zoom</button>
      <button class="button compact ${state.meeting.live ? 'danger' : 'secondary'}" type="button" data-action="${state.meeting.live ? 'stop-live' : 'start-live'}">${state.meeting.live ? 'Stop Live' : 'Live Notes'}</button>
    </div>`;
}

function renderReagentBlock(subtab) {
  const reagentSignals = (state.data.customSections || []).flatMap((section) => section.signals || []);
  if (subtab === 'vendors') {
    return `
      <div class="lab-matrix">
        <div><span>Primary</span><strong>Thermo</strong><em>Backorder risk</em></div>
        <div><span>Alternate</span><strong>CST</strong><em>Clone check assigned</em></div>
        <div><span>Decision</span><strong>Vendor substitute</strong><em>Owner Jordan</em></div>
      </div>`;
  }
  if (subtab === 'risks') return `<div class="block-list">${state.data.risks.filter((risk) => /AT8|reagent|antibody/i.test(risk.title)).map(renderRisk).join('') || '<div class="muted small">No reagent risks found.</div>'}</div>`;
  return `
    <div class="block-list">
      ${(reagentSignals.length ? reagentSignals : ['AT8 antibody supply needs review.']).slice(0, 4).map((item) => `<article class="queue-item"><div class="queue-title">${escapeHtml(item)}</div><p class="muted small">Source: custom lab section or meeting extraction.</p></article>`).join('')}
    </div>`;
}

function renderProjectBlock(subtab) {
  let projects = state.data.projects;
  if (subtab === 'at-risk') projects = projects.filter((project) => /risk|watch/i.test(project.status));
  if (subtab === 'deadlines') projects = [...projects].sort((a, b) => String(a.nextDeadline || '').localeCompare(String(b.nextDeadline || '')));
  return `<div class="block-list project-block-list">${projects.slice(0, 4).map(renderProjectMini).join('')}</div>`;
}

function renderRiskBlock(subtab) {
  if (subtab === 'sources') {
    return `<div class="block-list">${state.data.aiSuggestions.filter((item) => item.type === 'risk').map(renderSuggestion).join('') || '<div class="muted small">No risk suggestions pending.</div>'}</div>`;
  }
  if (subtab === 'mitigations') {
    return `<div class="lab-matrix">${state.data.risks.map((risk) => `<div><span>${escapeHtml(risk.severity)}</span><strong>${escapeHtml(risk.title)}</strong><em>${escapeHtml(risk.mitigation)}</em></div>`).join('')}</div>`;
  }
  return `<div class="block-list">${state.data.risks.map(renderRisk).join('')}</div>`;
}

function renderCalendarBlock(subtab) {
  if (subtab === 'deadlines') {
    return `<div class="block-list">${state.data.projects.slice(0, 4).map((project) => `<article class="queue-item mini-row"><div><div class="queue-title">${escapeHtml(project.name)}</div><div class="muted small">${escapeHtml(project.health)}</div></div><span class="pill">${escapeHtml(formatDate(project.nextDeadline))}</span></article>`).join('')}</div>`;
  }
  const events = state.data.calendarEvents || [];
  return `<div class="block-list">${events.map((event) => `<article class="queue-item mini-row"><div><div class="queue-title">${escapeHtml(event.title)}</div><div class="muted small">${escapeHtml(subtab === 'prep' ? event.prep : formatTime(event.at))}</div></div><span class="pill">${event.durationMinutes}m</span></article>`).join('')}</div>`;
}

function renderIntegrationBlock(subtab) {
  const items = state.data.integrations || [];
  if (subtab === 'publish') {
    return `<div class="block-list">${items.filter((item) => ['slack', 'notion', 'whatsapp'].includes(item.id)).map(renderIntegrationMini).join('')}</div>`;
  }
  if (subtab === 'sync') {
    return `<div class="block-list">${items.filter((item) => ['google', 'microsoft', 'zoom'].includes(item.id)).map(renderIntegrationMini).join('')}</div>`;
  }
  return `<div class="block-list">${items.slice(0, 6).map((item) => `<article class="queue-item mini-row"><div><div class="queue-title">${escapeHtml(item.label)}</div><div class="muted small">${escapeHtml(item.nextStep)}</div></div><button class="button compact" type="button" data-action="integration-oauth" data-provider="${escapeHtml(item.id)}">OAuth</button></article>`).join('')}</div>`;
}

function renderAiBlock(subtab) {
  if (subtab === 'providers') return `<div class="block-list">${state.data.providers.map(renderProvider).join('')}</div>`;
  if (subtab === 'runs') return `<div class="block-list">${(state.data.aiRuns || []).map((run) => `<article class="queue-item"><div class="queue-title">${escapeHtml(run.feature || run.action || 'AI run')}</div><p class="muted small">${escapeHtml(run.at || run.createdAt || 'No timestamp')}</p></article>`).join('') || '<div class="muted small">No provider runs recorded in this beta workspace.</div>'}</div>`;
  return `<div class="block-list">${state.data.aiSuggestions.slice(0, 5).map(renderSuggestion).join('')}</div>`;
}

function renderInboxBlock(subtab) {
  let items = state.data.inbox || [];
  if (subtab === 'actionable') items = items.filter((item) => item.confidence >= 0.8 || item.unread);
  if (subtab === 'collab') items = items.filter((item) => /collab|discuss|review/i.test(`${item.subject} ${item.preview}`));
  if (subtab === 'low-noise') items = items.filter((item) => item.confidence < 0.8);
  return `<div class="block-list">${items.map(renderInbox).join('') || '<div class="muted small">No matching messages.</div>'}</div>`;
}

function renderCustomSectionsBlock(subtab) {
  if (subtab === 'templates') {
    return `
      <div class="lab-matrix">
        <div><span>Wet lab</span><strong>Protocol Readiness</strong><em>Approvals, samples, owners</em></div>
        <div><span>Core facility</span><strong>Equipment Booking</strong><em>Slots, users, prep</em></div>
        <div><span>Grant</span><strong>Deadline Control</strong><em>Aims, figures, routing</em></div>
      </div>`;
  }
  if (subtab === 'ai-build') {
    return `
      <div class="field compact-field"><textarea id="builder-goal">${escapeHtml(state.builder.goal)}</textarea></div>
      <button class="button compact primary" type="button" data-action="propose-section" ${state.builder.busy ? 'disabled' : ''}>Generate Section</button>`;
  }
  return `<div class="section-flow">${(state.data.customSections || []).slice(0, 4).map(renderCustomSection).join('') || '<div class="muted small">No custom sections installed.</div>'}</div>`;
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
        <div class="panel-header"><div><div class="eyebrow">Role Presets</div><div class="panel-title">Start from the way this person works</div></div></div>
        <div class="role-grid">
          ${ROLE_PRESETS.map((preset) => `
            <button class="role-card" type="button" data-action="role-preset" data-role="${escapeHtml(preset.id)}">
              <strong>${escapeHtml(preset.label)}</strong>
              <span>${escapeHtml(preset.intent)}</span>
            </button>
          `).join('')}
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
    <section class="view-header minimal-header" data-animate>
      <div>
        <div class="eyebrow">Integrations</div>
        <h1>Connect the systems the lab already uses</h1>
        <p>Credentials, consent, sync, and publish are separate steps. Lab Link only marks a surface ready when credentials and route capability exist.</p>
      </div>
      <div class="inline-actions">
        <span class="pill ${configured.length ? 'ok' : ''}">${configured.length} ready</span>
        <button class="button secondary" type="button" data-action="open-inspector" data-inspector-mode="integrations">Setup helper</button>
      </div>
    </section>
    <section class="integration-path" data-animate>
      <div>
        <div class="eyebrow">Setup Path</div>
        <h2>Credentials -> Consent -> Sync -> Publish</h2>
      </div>
      <p>Each provider follows the same route, but the scopes and policies stay provider-specific.</p>
    </section>
    <section class="integration-lanes">
      ${state.data.integrations.map((item) => `
        <article class="integration-lane" data-animate>
          <div class="lane-head">
            <div>
              <div class="eyebrow">${escapeHtml(item.status)}</div>
              <h3>${escapeHtml(item.label)}</h3>
              <p>${escapeHtml(item.surface)}</p>
            </div>
            <button class="button compact" type="button" data-action="integration-oauth" data-provider="${escapeHtml(item.id)}">OAuth URL</button>
          </div>
          <div class="lane-steps">
            ${(item.setup || ['Add credentials', 'Authorize', 'Sync', 'Publish']).map((step, index) => `
              <span class="${index === 0 && item.status !== 'not configured' ? 'done' : ''}">${escapeHtml(step)}</span>
            `).join('')}
          </div>
          <div class="lane-foot">
            <span>${escapeHtml((item.required || []).join(' / '))}</span>
            <strong>${escapeHtml(item.nextStep)}</strong>
          </div>
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
        <p>Personal workspace choices persist locally and can be overridden by direct manipulation or provider-backed organization.</p>
      </div>
    </section>
    <section class="grid two">
      <div class="panel">
        <div class="panel-header"><div><div class="eyebrow">Layout</div><div class="panel-title">Current interaction layers</div></div></div>
        <div class="item-list">
          <div class="architecture-row"><strong>Composer</strong><span>One command surface for search, workspace shifts, and provider-backed organization.</span></div>
          <div class="architecture-row"><strong>Sections</strong><span>Reorder, collapse, hide, and restore lab surfaces without editing config.</span></div>
          <div class="architecture-row"><strong>Inspector</strong><span>Details, provenance, OAuth setup, and library status appear only when opened.</span></div>
        </div>
      </div>
      <div class="panel">
        <div class="panel-header"><div><div class="eyebrow">Controls</div><div class="panel-title">Personal surface</div></div></div>
        <div class="form-grid">
          <div class="field">
            <label>Density</label>
            <div class="segmented-control" role="group" aria-label="Density">
              <button class="segmented-button ${state.density === 'compact' ? 'active' : ''}" type="button" data-action="density-set" data-density="compact">Compact</button>
              <button class="segmented-button ${state.density === 'comfortable' ? 'active' : ''}" type="button" data-action="density-set" data-density="comfortable">Comfortable</button>
            </div>
          </div>
          <button class="button" type="button" data-action="reset-tabs">Reset workspace order</button>
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

function renderInspector() {
  if (!state.inspector.open) return '';
  const mode = state.inspector.mode;
  const title = {
    context: 'Workspace Context',
    integrations: 'Integration Setup',
    libraries: 'Interaction Libraries',
    ai: 'AI Provenance',
  }[mode] || 'Inspector';
  return `
    <aside class="inspector-sheet" data-animate>
      <div class="inspector-head">
        <div><div class="eyebrow">${escapeHtml(title)}</div><h2>${escapeHtml(tabById(state.activeTab).label)}</h2></div>
        <button class="icon-button" type="button" data-action="close-inspector" aria-label="Close inspector">x</button>
      </div>
      ${mode === 'integrations' ? renderIntegrationInspector() : ''}
      ${mode === 'libraries' ? renderLibraryInspector() : ''}
      ${mode === 'ai' ? renderAiInspector() : ''}
      ${mode === 'context' ? renderContextInspector() : ''}
    </aside>`;
}

function renderContextInspector() {
  return `
    <div class="inspector-stack">
      <div class="inspector-line"><span>Visible panels</span><strong>${Object.values(state.visiblePanels).filter(Boolean).length}</strong></div>
      <div class="inspector-line"><span>Visible blocks</span><strong>${Object.values(state.visibleBlocks).filter(Boolean).length}</strong></div>
      ${state.inspector.itemId && BLOCK_REGISTRY[state.inspector.itemId] ? `<div class="inspector-line"><span>Selected block</span><strong>${escapeHtml(BLOCK_REGISTRY[state.inspector.itemId].title)}</strong></div>` : ''}
      <div class="inspector-line"><span>Custom sections</span><strong>${state.data.customSections?.length || 0}</strong></div>
      <div class="inspector-line"><span>Interaction mode</span><strong>${escapeHtml(state.libraries.status)}</strong></div>
      <div class="inspector-copy">${escapeHtml(state.organizer.plan?.reasoning || 'No provider-backed layout plan has been applied in this session.')}</div>
      <button class="button full" type="button" data-action="open-inspector" data-inspector-mode="libraries">Library status</button>
    </div>`;
}

function renderAiInspector() {
  const provider = state.data.providers.find((item) => item.status === 'configured');
  return `
    <div class="inspector-stack">
      <div class="inspector-line"><span>Provider</span><strong>${escapeHtml(provider?.label || 'Not configured')}</strong></div>
      <div class="inspector-line"><span>Model</span><strong>${escapeHtml(provider?.model || 'Setup required')}</strong></div>
      <div class="inspector-copy">${provider ? 'Provider-backed actions are available. Review every proposed change before applying it.' : 'Set OpenAI, Anthropic, local, or custom provider credentials before running AI actions.'}</div>
      <button class="button full" type="button" data-tab="ai">Open review</button>
    </div>`;
}

function renderLibraryInspector() {
  const status = [
    ['Motion', Boolean(state.libraries.motion)],
    ['Floating UI', Boolean(state.libraries.floating)],
    ['Sortable', Boolean(state.libraries.sortable)],
  ];
  return `
    <div class="inspector-stack">
      ${status.map(([label, ready]) => `<div class="inspector-line"><span>${label}</span><strong>${ready ? 'enhanced' : 'fallback'}</strong></div>`).join('')}
      <div class="inspector-copy">External interaction libraries are progressive. Lab Link keeps native behavior available when network access is unavailable.</div>
    </div>`;
}

function renderIntegrationInspector() {
  const selectedProvider = state.inspector.itemId || 'zoom';
  return `
    <div class="inspector-stack">
      ${state.data.integrations.map((item) => `
        <button class="integration-step" type="button" data-action="integration-oauth" data-provider="${escapeHtml(item.id)}">
          <span>
            <strong>${escapeHtml(item.label)}</strong>
            <small>${escapeHtml(item.nextStep)}</small>
          </span>
          <em>${escapeHtml(item.status)}</em>
        </button>
      `).join('')}
      <div class="oauth-exchange">
        <div>
          <div class="eyebrow">OAuth Exchange</div>
          <p class="inspector-copy">Paste the returned authorization code for ${escapeHtml(selectedProvider)}. Tokens are stored only in the local ignored secrets file.</p>
        </div>
        ${state.integration.authorizationUrl ? `<a class="button full oauth-link" href="${escapeHtml(state.integration.authorizationUrl)}" target="_blank" rel="noreferrer">Open ${escapeHtml(state.integration.authorizationLabel || selectedProvider)} Consent</a>` : ''}
        <input id="oauth-code" value="${escapeHtml(state.integration.oauthCode)}" placeholder="Authorization code">
        <button class="button primary full" type="button" data-action="oauth-exchange" data-provider="${escapeHtml(selectedProvider)}" ${state.integration.busy ? 'disabled' : ''}>${state.integration.busy ? 'Exchanging' : 'Exchange Code'}</button>
      </div>
      <button class="button full" type="button" data-action="zoom-refresh">Refresh Zoom Token</button>
    </div>`;
}

function renderCommandPalette() {
  const indexedPresets = WORKSPACE_PRESETS.map((item, index) => ({ ...item, index }));
  const integrationIndex = indexedPresets.length;
  return `
    <div class="palette-backdrop" data-action="close-command">
      <section class="command-palette" data-animate role="dialog" aria-modal="true" aria-label="Command palette">
        <div class="palette-head">
          <input id="palette-input" value="${escapeHtml(state.organizer.intent)}" placeholder="Organize the lab around..." autofocus>
          <button class="button primary" type="button" data-action="organize-workspace">Run</button>
        </div>
        <div class="palette-list">
          ${indexedPresets.map((item) => `
            <button class="palette-item ${state.paletteIndex === item.index ? 'active' : ''}" type="button" data-tab="${item.id}" data-palette-index="${item.index}">
              <strong>${escapeHtml(item.label)}</strong>
              <span>${escapeHtml(item.intent)}</span>
            </button>
          `).join('')}
          <button class="palette-item ${state.paletteIndex === integrationIndex ? 'active' : ''}" type="button" data-action="open-inspector" data-inspector-mode="integrations" data-palette-index="${integrationIndex}">
            <strong>Integration setup</strong>
            <span>Open OAuth, token, email, calendar, and publishing helpers.</span>
          </button>
        </div>
      </section>
    </div>`;
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
  if (Array.isArray(plan.orderedPanels)) state.panelOrder = normalizePanelOrder(plan.orderedPanels);
  if (Array.isArray(plan.orderedBlocks)) state.blockOrder = normalizeBlockOrder(plan.orderedBlocks);
  if (Array.isArray(plan.visibleBlocks) && plan.visibleBlocks.length) {
    const nextBlocks = Object.fromEntries(DEFAULT_BLOCK_ORDER.map((id) => [id, false]));
    for (const id of plan.visibleBlocks) {
      if (id in nextBlocks) nextBlocks[id] = true;
    }
    state.visibleBlocks = nextBlocks;
  }
  if (Array.isArray(plan.collapsedBlocks)) {
    state.collapsedBlocks = {};
    for (const id of plan.collapsedBlocks) {
      if (id in BLOCK_REGISTRY) state.collapsedBlocks[id] = true;
    }
  }
  if (plan.blockSubtabs && typeof plan.blockSubtabs === 'object') {
    for (const [id, subtab] of Object.entries(plan.blockSubtabs)) {
      const block = BLOCK_REGISTRY[id];
      if (block?.subtabs.some((item) => item.id === subtab)) state.blockSubtabs[id] = subtab;
    }
  }
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

async function createIntegrationOauthUrl(provider) {
  if (!provider) return;
  state.integration.busy = provider;
  state.inspector = { open: true, mode: 'integrations', itemId: provider };
  render();
  try {
    const result = await api('/api/integrations/oauth-url', {
      method: 'POST',
      body: JSON.stringify({ provider }),
    });
    state.inspector = { open: true, mode: 'integrations', itemId: provider };
    state.integration.authorizationUrl = result.authorizationUrl;
    state.integration.authorizationLabel = result.label;
    state.toast = `${result.label} authorization URL created.`;
    window.open(result.authorizationUrl, '_blank', 'noopener,noreferrer');
    render();
  } catch (error) {
    const required = error.payload?.required ? ` Required: ${error.payload.required.join(', ')}.` : '';
    state.toast = `${error.message}${required}`;
    render();
  } finally {
    state.integration.busy = null;
    render();
  }
}

async function refreshZoomToken() {
  try {
    const result = await api('/api/integrations/zoom/refresh', { method: 'POST', body: '{}' });
    state.toast = `Zoom token refreshed. Expires in ${result.expiresIn || 3600}s.`;
    await refresh();
  } catch (error) {
    const required = error.payload?.required ? ` Required: ${error.payload.required.join(', ')}.` : '';
    state.toast = `${error.message}${required}`;
    render();
  }
}

async function exchangeOauthCode(provider) {
  const code = state.integration.oauthCode.trim();
  if (!provider || !code) {
    state.toast = 'Choose an integration and paste the returned authorization code.';
    render();
    return;
  }
  state.integration.busy = provider;
  render();
  try {
    const result = await api('/api/integrations/oauth/exchange', {
      method: 'POST',
      body: JSON.stringify({ provider, code }),
    });
    state.integration.oauthCode = '';
    state.toast = `${result.label} token exchange completed.`;
    await refresh();
  } catch (error) {
    const required = error.payload?.required ? ` Required: ${error.payload.required.join(', ')}.` : '';
    state.toast = `${error.message}${required}`;
  } finally {
    state.integration.busy = null;
    render();
  }
}

async function organizeWorkspace() {
  const intent = state.organizer.intent.trim();
  if (!intent) {
    state.toast = 'Tell Lab Link what you are trying to do first.';
    render();
    return;
  }
  state.organizer.busy = 'organizing';
  state.blockLoading = true;
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
    state.blockLoading = false;
    render();
  }
}

function applyFocusPreset() {
  applyOrganizerPlan({
    workspace: 'command',
    focusTitle: 'Execution focus',
    focusBrief: 'Showing only the primary focus, next tasks, and custom lab sections.',
    visiblePanels: ['focus', 'tasks', 'sections'],
    orderedBlocks: ['priority-queue', 'experiment-readiness', 'meeting-studio', 'reagent-watch', 'project-health', 'calendar-pressure'],
    visibleBlocks: ['priority-queue', 'experiment-readiness', 'meeting-studio', 'reagent-watch'],
    collapsedPanels: [],
    collapsedBlocks: [],
    suggestedActions: ['Work top task', 'Review custom section', 'Open context only if needed'],
  });
  state.toast = 'Focus preset applied.';
  render();
}

function applyEverythingPreset() {
  state.activeTab = 'command';
  state.visiblePanels = Object.fromEntries(Object.keys(PANEL_LABELS).map((key) => [key, true]));
  state.visibleBlocks = Object.fromEntries(DEFAULT_BLOCK_ORDER.map((key) => [key, true]));
  state.collapsedPanels = { risks: true, inbox: true, projects: true, ai: true, integrations: true };
  state.collapsedBlocks = { 'inbox-signals': true, 'ai-review': true, 'integration-routes': true };
  state.organizer.plan = {
    focusTitle: 'Full workspace',
    focusBrief: 'Everything is available, with secondary panels collapsed to reduce visual load.',
    suggestedActions: ['Open only what you need'],
  };
  savePrefs();
  state.toast = 'Full workspace preset applied.';
  render();
}

function applyRolePreset(id) {
  const preset = ROLE_PRESETS.find((item) => item.id === id);
  if (!preset) return;
  state.organizer.intent = preset.intent;
  applyOrganizerPlan({
    workspace: 'command',
    focusTitle: preset.label,
    focusBrief: preset.intent,
    orderedPanels: DEFAULT_PANEL_ORDER,
    orderedBlocks: DEFAULT_BLOCK_ORDER,
    visiblePanels: preset.panels,
    visibleBlocks: roleToBlocks(preset.id),
    collapsedPanels: preset.collapsed,
    collapsedBlocks: preset.id === 'pi' ? ['ai-review'] : preset.id === 'lab-manager' ? ['integration-routes'] : [],
    suggestedActions: preset.actions,
    reasoning: `Applied ${preset.label} local role preset.`,
  });
  state.toast = `${preset.label} layout applied.`;
  render();
}

function roleToBlocks(id) {
  if (id === 'pi') return ['priority-queue', 'project-health', 'risk-radar', 'calendar-pressure', 'ai-review'];
  if (id === 'lab-manager') return ['priority-queue', 'experiment-readiness', 'reagent-watch', 'risk-radar', 'integration-routes'];
  if (id === 'computational') return ['priority-queue', 'project-health', 'calendar-pressure', 'inbox-signals', 'ai-review'];
  return ['priority-queue', 'experiment-readiness', 'meeting-studio', 'custom-sections'];
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
  if (event.target.classList.contains('palette-backdrop')) {
    state.commandOpen = false;
    render();
    return;
  }
  const tabButton = event.target.closest('[data-tab]');
  if (tabButton) {
    state.activeTab = tabButton.dataset.tab;
    state.commandOpen = false;
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
  if (action === 'toggle-command') {
    state.commandOpen = !state.commandOpen;
    state.paletteIndex = 0;
    state.paletteFocusItems = false;
    render();
  }
  if (action === 'close-command') {
    state.commandOpen = false;
    render();
  }
  if (action === 'open-inspector') {
    const trigger = event.target.closest('[data-action]');
    state.inspector = { open: true, mode: trigger.dataset.inspectorMode || 'context', itemId: trigger.dataset.itemId || null };
    render();
  }
  if (action === 'close-inspector') {
    state.inspector.open = false;
    render();
  }
  if (action === 'inspect-panel') {
    const trigger = event.target.closest('[data-action]');
    state.inspector = { open: true, mode: trigger.dataset.panelId === 'integrations' ? 'integrations' : trigger.dataset.panelId === 'ai' ? 'ai' : 'context', itemId: trigger.dataset.panelId };
    render();
  }
  if (action === 'inspect-block') {
    const trigger = event.target.closest('[data-block-id]');
    state.inspector = { open: true, mode: trigger.dataset.blockId === 'integration-routes' ? 'integrations' : trigger.dataset.blockId === 'ai-review' ? 'ai' : 'context', itemId: trigger.dataset.blockId };
    render();
  }
  if (action === 'block-subtab') {
    const trigger = event.target.closest('[data-block-id]');
    state.blockSubtabs[trigger.dataset.blockId] = trigger.dataset.subtab;
    savePrefs();
    render();
  }
  if (action === 'integration-oauth') createIntegrationOauthUrl(event.target.closest('[data-provider]')?.dataset.provider);
  if (action === 'oauth-exchange') exchangeOauthCode(event.target.closest('[data-provider]')?.dataset.provider);
  if (action === 'zoom-refresh') refreshZoomToken();
  if (action === 'refresh') refresh().catch((error) => {
    state.toast = error.message;
    render();
  });
  if (action === 'organize-workspace') organizeWorkspace();
  if (action === 'focus-preset') applyFocusPreset();
  if (action === 'everything-preset') applyEverythingPreset();
  if (action === 'restore-blocks') {
    state.visibleBlocks = Object.fromEntries(DEFAULT_BLOCK_ORDER.map((id) => [id, true]));
    state.collapsedBlocks = {};
    state.blockOrder = [...DEFAULT_BLOCK_ORDER];
    savePrefs();
    render();
  }
  if (action === 'role-preset') applyRolePreset(event.target.closest('[data-role]')?.dataset.role);
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
  if (action === 'density-set') {
    const next = event.target.closest('[data-density]')?.dataset.density;
    if (['compact', 'comfortable'].includes(next)) {
      state.density = next;
      savePrefs();
      render();
    }
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
  if (action === 'collapse-block') {
    const id = event.target.closest('[data-block-id]').dataset.blockId;
    state.collapsedBlocks[id] = !state.collapsedBlocks[id];
    savePrefs();
    render();
  }
  if (action === 'hide-block') {
    const id = event.target.closest('[data-block-id]').dataset.blockId;
    state.visibleBlocks[id] = false;
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
    state.panelOrder = [...DEFAULT_PANEL_ORDER];
    state.blockOrder = [...DEFAULT_BLOCK_ORDER];
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
    state.visibleBlocks = Object.fromEntries(DEFAULT_BLOCK_ORDER.map((id) => [id, true]));
    state.collapsedBlocks = {};
    state.blockOrder = [...DEFAULT_BLOCK_ORDER];
    state.blockSubtabs = {};
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
  if (event.target.id === 'palette-input') {
    state.organizer.intent = event.target.value;
    state.paletteFocusItems = false;
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
  if (event.target.id === 'oauth-code') {
    state.integration.oauthCode = event.target.value;
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
  if (event.target.matches('[data-block-visible]')) {
    state.visibleBlocks[event.target.dataset.blockVisible] = event.target.checked;
    savePrefs();
    render();
  }
}

function handleDragStart(event) {
  const block = event.target.closest('[data-block]');
  if (block) {
    dragTabId = `block:${block.dataset.block}`;
    block.classList.add('dragging');
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', dragTabId);
    return;
  }
  const panel = event.target.closest('[data-panel]');
  if (panel) {
    dragTabId = `panel:${panel.dataset.panel}`;
    panel.classList.add('dragging');
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', dragTabId);
    return;
  }
  const tab = event.target.closest('[data-tab]');
  if (!tab || !tab.classList.contains('workspace-tab')) return;
  dragTabId = tab.dataset.tab;
  tab.classList.add('dragging');
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/plain', dragTabId);
}

function handleDragEnd(event) {
  const block = event.target.closest('[data-block]');
  if (block) block.classList.remove('dragging');
  const panel = event.target.closest('[data-panel]');
  if (panel) panel.classList.remove('dragging');
  const tab = event.target.closest('[data-tab]');
  if (tab) tab.classList.remove('dragging');
  dragTabId = null;
}

function handleDragOver(event) {
  if (event.target.closest('.workspace-tab') || event.target.closest('[data-panel]') || event.target.closest('[data-block]')) event.preventDefault();
}

function handleDrop(event) {
  const blockTarget = event.target.closest('[data-block]');
  if (blockTarget && dragTabId?.startsWith('block:')) {
    event.preventDefault();
    const source = dragTabId.replace('block:', '');
    const target = blockTarget.dataset.block;
    if (source !== target) {
      const next = state.blockOrder.filter((id) => id !== source);
      next.splice(next.indexOf(target), 0, source);
      state.blockOrder = normalizeBlockOrder(next);
      savePrefs();
      render();
    }
    return;
  }
  const panelTarget = event.target.closest('[data-panel]');
  if (panelTarget && dragTabId?.startsWith('panel:')) {
    event.preventDefault();
    const source = dragTabId.replace('panel:', '');
    const target = panelTarget.dataset.panel;
    if (source !== target) {
      const next = state.panelOrder.filter((id) => id !== source);
      next.splice(next.indexOf(target), 0, source);
      state.panelOrder = normalizePanelOrder(next);
      savePrefs();
      render();
    }
    return;
  }
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

function afterRender() {
  const motion = state.libraries.motion;
  if (motion?.animate) {
    document.querySelectorAll('[data-animate]').forEach((element) => {
      if (element.dataset.animated === 'true') return;
      element.dataset.animated = 'true';
      motion.animate(element, { opacity: [0, 1], transform: ['translateY(8px)', 'translateY(0)'] }, { duration: 0.32, easing: [0.22, 1, 0.36, 1] });
    });
  }
  const Sortable = state.libraries.sortable;
  const blockContainer = document.querySelector('[data-sortable-blocks]');
  if (Sortable && blockContainer && !blockContainer.dataset.sortableReady) {
    blockContainer.dataset.sortableReady = 'true';
    state.blockSortableInstance?.destroy?.();
    state.blockSortableInstance = Sortable.create(blockContainer, {
      animation: 220,
      handle: '.drag-handle',
      ghostClass: 'drag-ghost',
      onEnd: () => {
        state.blockOrder = normalizeBlockOrder([...blockContainer.querySelectorAll('[data-block]')].map((item) => item.dataset.block));
        savePrefs();
      },
    });
  }
  const container = document.querySelector('[data-sortable-panels]');
  if (Sortable && container && !container.dataset.sortableReady) {
    container.dataset.sortableReady = 'true';
    state.sortableInstance?.destroy?.();
    state.sortableInstance = Sortable.create(container, {
      animation: 180,
      handle: '.drag-handle',
      ghostClass: 'drag-ghost',
      onEnd: () => {
        state.panelOrder = normalizePanelOrder([...container.querySelectorAll('[data-panel]')].map((item) => item.dataset.panel));
        savePrefs();
      },
    });
  }
  const floating = state.libraries.floating;
  const modeButton = document.querySelector('.mode-button');
  const palette = document.querySelector('.command-palette');
  if (floating?.computePosition && modeButton && palette) {
    floating.computePosition(modeButton, palette, { placement: 'bottom-end' }).then(({ x, y }) => {
      Object.assign(palette.style, { left: `${x}px`, top: `${y}px` });
    });
  }
  if (state.commandOpen) {
    const activePaletteItem = document.querySelector(`.palette-item[data-palette-index="${state.paletteIndex}"]`);
    const paletteInput = document.querySelector('#palette-input');
    if (state.paletteFocusItems) activePaletteItem?.focus();
    else if (paletteInput && !paletteInput.dataset.focused) {
      paletteInput.dataset.focused = 'true';
      paletteInput.focus();
      paletteInput.setSelectionRange?.(paletteInput.value.length, paletteInput.value.length);
    }
  }
}

document.addEventListener('click', handleClick);
document.addEventListener('input', handleInput);
document.addEventListener('change', handleInput);
document.addEventListener('dragstart', handleDragStart);
document.addEventListener('dragend', handleDragEnd);
document.addEventListener('dragover', handleDragOver);
document.addEventListener('drop', handleDrop);
document.addEventListener('keydown', (event) => {
  const target = event.target instanceof Element ? event.target : null;
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    state.commandOpen = true;
    state.paletteIndex = 0;
    state.paletteFocusItems = false;
    render();
    return;
  }
  if (event.key === 'Escape') {
    if (state.commandOpen || state.inspector.open) {
      event.preventDefault();
      state.commandOpen = false;
      state.inspector.open = false;
      render();
    }
    return;
  }
  if (state.commandOpen) {
    const items = [...document.querySelectorAll('.palette-item')];
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (!items.length) return;
      event.preventDefault();
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      state.paletteIndex = (state.paletteIndex + direction + items.length) % items.length;
      state.paletteFocusItems = true;
      render();
      return;
    }
    if (event.key === 'Enter' && target?.id === 'palette-input') {
      event.preventDefault();
      organizeWorkspace();
      return;
    }
    if (event.key === 'Enter' && items[state.paletteIndex]) {
      event.preventDefault();
      items[state.paletteIndex].click();
      return;
    }
  }
  if (target?.matches('input, textarea, select')) return;
  const tab = TABS.find((item) => item.key === event.key);
  if (tab) {
    state.activeTab = tab.id;
    savePrefs();
    render();
  }
});

loadData();

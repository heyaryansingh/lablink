#!/usr/bin/env node
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(__dirname, 'public');
const DEFAULT_NOW = process.env.LABLINK_NOW || new Date().toISOString();
const MAX_BODY_BYTES = 2 * 1024 * 1024;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.ico': 'image/x-icon',
};

class HttpError extends Error {
  constructor(status, message, details = {}) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.details = details;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function parseFlag(args, flag, fallback = null) {
  const index = args.indexOf(flag);
  if (index < 0) return fallback;
  return args[index + 1] ?? fallback;
}

function parseBoolean(args, flag) {
  return args.includes(flag);
}

function defaultDataDir(args = []) {
  const explicit = parseFlag(args, '--data-dir', null);
  if (explicit) return path.resolve(explicit);
  if (process.env.LABLINK_DATA_DIR) return path.resolve(process.env.LABLINK_DATA_DIR);
  return path.resolve('.lablink-dev');
}

function secretsFile(dataDir, args = []) {
  const explicit = parseFlag(args, '--secrets-file', process.env.LABLINK_SECRETS_FILE || null);
  return explicit ? path.resolve(explicit) : path.join(dataDir, 'secrets.json');
}

function loadLocalSecrets(dataDir, args = []) {
  const file = secretsFile(dataDir, args);
  if (!fs.existsSync(file)) return { file, values: {} };
  const parsed = readJson(file, {});
  const source = parsed.secrets && typeof parsed.secrets === 'object' ? parsed.secrets : parsed;
  const allowedKeys = [
    'OPENAI_API_KEY',
    'OPENAI_MODEL',
    'OPENAI_BASE_URL',
    'ANTHROPIC_API_KEY',
    'ANTHROPIC_MODEL',
    'ANTHROPIC_BASE_URL',
    'LABLINK_LOCAL_AI_URL',
    'LABLINK_LOCAL_MODEL',
    'LABLINK_LOCAL_AI_KEY',
    'LABLINK_CUSTOM_AI_URL',
    'LABLINK_CUSTOM_AI_MODEL',
    'LABLINK_CUSTOM_AI_KEY',
    'LABLINK_CUSTOM_AI_KEY_ENV',
    'ZOOM_ACCESS_TOKEN',
    'ZOOM_CLIENT_ID',
    'ZOOM_CLIENT_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'MICROSOFT_CLIENT_ID',
    'MICROSOFT_CLIENT_SECRET',
    'SLACK_BOT_TOKEN',
    'NOTION_TOKEN',
    'WHATSAPP_ACCESS_TOKEN',
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
  ];
  const values = {};
  for (const key of allowedKeys) {
    if (typeof source[key] === 'string' && source[key].trim()) values[key] = source[key].trim();
  }
  return { file, values };
}

function runtimeEnv(dataDir, args = []) {
  const local = loadLocalSecrets(dataDir, args);
  return {
    env: { ...local.values, ...process.env },
    secretsFile: local.file,
    loadedSecretKeys: Object.keys(local.values),
  };
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readJson(file, fallback) {
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
}

function writeJson(file, value) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function storeFile(dataDir) {
  return path.join(dataDir, 'lablink.bootstrap.json');
}

function loadStore(dataDir) {
  const file = storeFile(dataDir);
  const existing = readJson(file, null);
  if (existing) {
    const normalized = normalizeStore(existing);
    writeJson(file, normalized);
    return normalized;
  }
  const seeded = createSeedStore(DEFAULT_NOW);
  writeJson(file, seeded);
  return seeded;
}

function normalizeStore(store) {
  const defaults = createSeedStore(DEFAULT_NOW);
  store.schemaVersion ||= defaults.schemaVersion;
  store.lab = { ...defaults.lab, ...(store.lab || {}) };
  store.user = { ...defaults.user, ...(store.user || {}) };
  store.featureFlags = { ...defaults.featureFlags, ...(store.featureFlags || {}) };
  store.ui = { ...defaults.ui, ...(store.ui || {}) };
  store.aiConfig = {
    ...defaults.aiConfig,
    ...(store.aiConfig || {}),
    openai: { ...defaults.aiConfig.openai, ...(store.aiConfig?.openai || {}) },
    anthropic: { ...defaults.aiConfig.anthropic, ...(store.aiConfig?.anthropic || {}) },
    local: { ...defaults.aiConfig.local, ...(store.aiConfig?.local || {}) },
    custom: { ...defaults.aiConfig.custom, ...(store.aiConfig?.custom || {}) },
    policy: { ...defaults.aiConfig.policy, ...(store.aiConfig?.policy || {}) },
  };
  store.automation = { ...defaults.automation, ...(store.automation || {}) };
  store.schedule = {
    ...defaults.schedule,
    ...(store.schedule || {}),
    workHours: { ...defaults.schedule.workHours, ...(store.schedule?.workHours || {}) },
  };
  for (const key of [
    'integrations',
    'projects',
    'tasks',
    'inbox',
    'meetings',
    'calendarEvents',
    'meetingArtifacts',
    'aiSuggestions',
    'decisions',
    'risks',
    'insights',
    'schedulePlans',
    'progressEvents',
    'aiRuns',
    'auditLog',
    'customSections',
  ]) {
    if (!Array.isArray(store[key])) store[key] = defaults[key] || [];
  }
  store.customSections = store.customSections.map((section) => sanitizeSection(section, section.createdBy || 'local'));
  return store;
}

function saveStore(dataDir, store) {
  writeJson(storeFile(dataDir), normalizeStore(store));
}

function createSeedStore(nowIso) {
  const now = new Date(nowIso);
  const day = (offset) => {
    const date = new Date(now);
    date.setDate(date.getDate() + offset);
    return date.toISOString().slice(0, 10);
  };
  const at = (offset, hour) => {
    const date = new Date(now);
    date.setDate(date.getDate() + offset);
    date.setHours(hour, 0, 0, 0);
    return date.toISOString();
  };
  return {
    schemaVersion: 1,
    lab: {
      name: process.env.LABLINK_LAB_NAME || 'Park Lab',
      institution: process.env.LABLINK_INSTITUTION || 'University Research Center',
      timezone: process.env.LABLINK_TIMEZONE || 'America/Chicago',
      runtime: 'web-bootstrap',
    },
    user: {
      id: 'user-alex',
      name: process.env.LABLINK_USER_NAME || 'Alex Kim',
      email: process.env.LABLINK_USER_EMAIL || 'alex.kim@example.edu',
      role: process.env.LABLINK_USER_ROLE || 'grad_student',
    },
    featureFlags: {
      animals: true,
      reagents: true,
      equipment: true,
      budget: true,
      safety: true,
      clinical: false,
      computational: true,
      zoom: true,
      ai: true,
      extensions: true,
      webMeetingStudio: true,
    },
    ui: {
      density: 'compact',
      layout: 'three-plane',
      navMode: 'workspace-tabs',
      theme: 'lab-ops',
    },
    aiConfig: {
      provider: process.env.LABLINK_AI_PROVIDER || 'auto',
      openai: {
        model: process.env.OPENAI_MODEL || 'gpt-5.5',
        baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1/responses',
      },
      anthropic: {
        model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
        baseUrl: process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com/v1/messages',
      },
      local: {
        model: process.env.LABLINK_LOCAL_MODEL || 'local-model',
        baseUrl: process.env.LABLINK_LOCAL_AI_URL || '',
      },
      custom: {
        model: process.env.LABLINK_CUSTOM_AI_MODEL || 'custom-model',
        baseUrl: process.env.LABLINK_CUSTOM_AI_URL || '',
        apiKeyEnv: process.env.LABLINK_CUSTOM_AI_KEY_ENV || 'LABLINK_CUSTOM_AI_KEY',
      },
      policy: {
        requireRealProvider: true,
        sendTranscriptBodies: false,
        sendEmailBodies: false,
      },
    },
    automation: {
      taskProgress: true,
      minConfidence: 0.82,
      fallbackToSuggestions: true,
    },
    schedule: {
      workHours: { start: '09:00', end: '17:00' },
      focusBlockMinutes: 90,
      includeMeetings: true,
    },
    integrations: [],
    users: [
      { id: 'user-park', name: 'Dr. Mina Park', role: 'PI' },
      { id: 'user-alex', name: 'Alex Kim', role: 'Graduate Student' },
      { id: 'user-jordan', name: 'Jordan Lee', role: 'Postdoc' },
      { id: 'user-sam', name: 'Sam Rivera', role: 'Technician' },
    ],
    projects: [
      { id: 'project-tau', icon: 'T', name: 'Tau Pathology Study', status: 'At risk', owner: 'Jordan', completion: 62, nextDeadline: day(18), health: 'Reagent risk: AT8 backorder may slip staining by 4 days.' },
      { id: 'project-crispr', icon: 'C', name: 'CRISPR Screen', status: 'Watch', owner: 'Alex', completion: 41, nextDeadline: day(29), health: 'Library QC delayed; analysis environment ready.' },
      { id: 'project-imaging', icon: 'I', name: 'Imaging Pipeline', status: 'On track', owner: 'Alex', completion: 78, nextDeadline: day(9), health: 'Core booking confirmed; segmentation validation pending.' },
      { id: 'project-behavior', icon: 'B', name: 'Behavioral Analysis', status: 'On track', owner: 'Sam', completion: 56, nextDeadline: day(5), health: 'Open field analysis due this week.' },
    ],
    tasks: [
      { id: 'task-r01', title: 'Submit R01 specific aims for internal review', projectId: 'project-tau', assignee: 'Dr. Park', priority: 'critical', status: 'todo', due: day(0), source: 'Email', quote: 'Can you send the specific aims by Friday?', reason: 'Grant deadline proximity and PI ownership.', score: 0.95 },
      { id: 'task-at8', title: 'Confirm AT8 antibody substitute or alternate vendor', projectId: 'project-tau', assignee: 'Jordan', priority: 'high', status: 'blocked', due: day(1), source: 'Meeting', quote: 'Jordan will check alternate AT8 suppliers.', reason: 'Blocks staining and downstream imaging.', score: 0.81 },
      { id: 'task-perfusion', title: 'Schedule perfusion for cohort 2 mice', projectId: 'project-tau', assignee: 'Jordan', priority: 'high', status: 'todo', due: day(2), source: 'Meeting', quote: 'Perfusion for cohort 2 should happen Tuesday.', reason: 'Animal age window and room availability.', score: 0.76 },
      { id: 'task-openfield', title: 'Run open field behavioral analysis', projectId: 'project-behavior', assignee: 'Alex', priority: 'medium', status: 'in_progress', due: day(5), source: 'Meeting', quote: 'Alex will have the open field analysis done by Friday.', reason: 'Feeds weekly project update.', score: 0.55 },
      { id: 'task-website', title: 'Update lab website with accepted manuscript', projectId: null, assignee: 'Riley', priority: 'low', status: 'todo', due: null, source: 'Manual', quote: null, reason: 'Administrative, no dependency.', score: 0.18 },
    ],
    inbox: [
      { id: 'inbox-1', source: 'Outlook', unread: true, at: at(-1, 10), from: 'mina.park@example.edu', subject: 'R01 specific aims review', projectId: 'project-tau', preview: 'Please send the current aims page for review.', confidence: 0.94 },
      { id: 'inbox-2', source: 'Lab Link', unread: true, at: at(0, 9), from: 'Jordan Lee', subject: 'AT8 backorder update', projectId: 'project-tau', preview: 'Thermo is still backordered; checking CST clone availability.', confidence: 0.88 },
      { id: 'inbox-3', source: 'Gmail', unread: false, at: at(0, 8), from: 'chen@example.edu', subject: 'Imaging pipeline collaboration', projectId: 'project-imaging', preview: 'Could we discuss adapting your segmentation workflow?', confidence: 0.73 },
    ],
    meetings: [
      { id: 'meeting-weekly', title: 'Weekly Lab Meeting', type: 'lab_meeting', at: at(-4, 13), status: 'processed', summary: 'Discussed AT8 supply risk, cohort 2 procedure timing, and behavioral analysis due this week.', artifacts: ['artifact-weekly'] },
      { id: 'meeting-project', title: 'Tau Project Sync', type: 'project_sync', at: at(1, 11), status: 'scheduled', summary: 'Upcoming sync for staining schedule and R01 figures.', artifacts: [] },
    ],
    calendarEvents: [
      { id: 'cal-lab-meeting', title: 'Weekly Lab Meeting', at: at(1, 13), durationMinutes: 60, source: 'demo calendar', projectId: null, prep: 'Review blocked tasks and pending AI suggestions.' },
      { id: 'cal-core-booking', title: 'Imaging core booking', at: at(2, 10), durationMinutes: 120, source: 'demo calendar', projectId: 'project-imaging', prep: 'Bring segmentation validation notes.' },
    ],
    meetingArtifacts: [
      { id: 'artifact-weekly', meetingId: 'meeting-weekly', source: 'demo transcript', kind: 'transcript', status: 'processed', importedAt: at(-4, 14), excerpt: 'Jordan will check alternate AT8 suppliers. Alex will have the open field analysis done by Friday.' },
    ],
    aiSuggestions: [
      { id: 'sug-at8', type: 'task', status: 'approved', confidence: 0.92, target: 'Tau Pathology Study', title: 'Confirm AT8 antibody substitute or alternate vendor', quote: 'Jordan will check alternate AT8 suppliers.', reason: 'Actionable owner commitment with project blocker.', source: 'Weekly Lab Meeting' },
      { id: 'sug-risk-at8', type: 'risk', status: 'pending', confidence: 0.86, target: 'Tau Pathology Study', title: 'AT8 backorder may delay staining', quote: 'AT8 is still backordered.', reason: 'Reagent shortage blocks downstream staining and imaging.', source: 'Lab Link message' },
      { id: 'sug-followup-chen', type: 'follow-up', status: 'pending', confidence: 0.71, target: 'Imaging Pipeline', title: 'Draft collaboration follow-up to Dr. Chen', quote: 'Could we discuss adapting your segmentation workflow?', reason: 'External collaboration inquiry has no reply yet.', source: 'Gmail' },
    ],
    decisions: [
      { id: 'decision-demo', projectId: 'project-tau', title: 'Use cohort 2 for next perfusion window', source: 'Weekly Lab Meeting', quote: 'Perfusion for cohort 2 should happen Tuesday.' },
    ],
    risks: [
      { id: 'risk-at8', severity: 'high', projectId: 'project-tau', title: 'AT8 antibody backorder', mitigation: 'Check alternate vendors and validate substitute clone.' },
      { id: 'risk-qc', severity: 'medium', projectId: 'project-crispr', title: 'CRISPR library QC delayed', mitigation: 'Reserve analysis time and escalate if QC misses Friday.' },
    ],
    customSections: [
      {
        id: 'section-reagent-watch',
        title: 'Reagent Watch',
        module: 'wet_lab_ops',
        purpose: 'Track supply constraints that can block experiments.',
        layout: 'table',
        createdBy: 'seed',
        createdAt: at(0, 7),
        updatedAt: at(0, 7),
        fields: [
          { label: 'Reagent', type: 'text', value: 'AT8 antibody' },
          { label: 'State', type: 'status', value: 'Backorder risk' },
          { label: 'Owner', type: 'person', value: 'Jordan' },
        ],
        signals: ['Backorder may slip staining by 4 days.', 'Alternative vendor decision needed.'],
        actions: ['Confirm substitute clone.', 'Update Tau Pathology Study timeline.'],
        integrations: ['Slack', 'Notion', 'Zoom'],
        dataPolicy: 'Local section seeded from demo workspace.',
      },
    ],
    insights: [],
    schedulePlans: [],
    progressEvents: [],
    aiRuns: [],
    auditLog: [
      { id: 'audit-seed', at: at(0, 7), actor: 'system', action: 'seed_demo', detail: 'Created web bootstrap workspace.' },
    ],
  };
}

function projectName(store, projectId) {
  return store.projects.find((project) => project.id === projectId)?.name || 'Unassigned';
}

function priorityRank(priority) {
  return { critical: 0, high: 1, medium: 2, low: 3 }[priority] ?? 4;
}

function openTasks(store) {
  return store.tasks
    .filter((task) => task.status !== 'done')
    .sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority) || String(a.due || '').localeCompare(String(b.due || '')));
}

function slug(value) {
  const text = String(value || 'section')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 42);
  return text || 'section';
}

function sanitizeString(value, fallback, max = 220) {
  const text = String(value || fallback || '').replace(/\s+/g, ' ').trim();
  return text.slice(0, max);
}

function sanitizeList(value, maxItems = 8, maxText = 180) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => sanitizeString(typeof item === 'string' ? item : item?.text || item?.label || item?.title, '', maxText))
    .filter(Boolean)
    .slice(0, maxItems);
}

function sanitizeFields(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((field) => ({
      label: sanitizeString(field?.label, 'Field', 64),
      type: sanitizeString(field?.type, 'text', 32),
      value: sanitizeString(field?.value, '', 120),
    }))
    .filter((field) => field.label)
    .slice(0, 10);
}

function sanitizeSection(input = {}, createdBy = 'manual') {
  const now = new Date().toISOString();
  const title = sanitizeString(input.title, 'Custom Lab Section', 80);
  return {
    id: sanitizeString(input.id, `section-${slug(title)}-${Date.now()}`, 80),
    title,
    module: sanitizeString(input.module, 'custom_lab_ops', 64),
    purpose: sanitizeString(input.purpose, 'Custom lab operating surface.', 240),
    layout: ['board', 'table', 'brief', 'checklist', 'timeline'].includes(input.layout) ? input.layout : 'brief',
    createdBy: sanitizeString(input.createdBy, createdBy, 32),
    createdAt: input.createdAt || now,
    updatedAt: now,
    fields: sanitizeFields(input.fields),
    signals: sanitizeList(input.signals, 8, 180),
    actions: sanitizeList(input.actions, 8, 180),
    automations: sanitizeList(input.automations, 6, 180),
    integrations: sanitizeList(input.integrations, 8, 80),
    dataPolicy: sanitizeString(input.dataPolicy, 'Local-first; no external publishing unless an integration is configured and explicitly used.', 240),
  };
}

function sanitizeOrganizerPlan(input = {}) {
  const allowedWorkspaces = new Set(['command', 'meetings', 'builder', 'projects', 'ai', 'integrations', 'settings']);
  const allowedPanels = new Set(['focus', 'tasks', 'risks', 'sections', 'meetings', 'inbox', 'projects', 'ai', 'integrations']);
  const workspace = allowedWorkspaces.has(input.workspace) ? input.workspace : 'command';
  const visiblePanels = sanitizeList(input.visiblePanels, 8, 40).filter((panel) => allowedPanels.has(panel));
  const collapsedPanels = sanitizeList(input.collapsedPanels, 8, 40).filter((panel) => allowedPanels.has(panel));
  return {
    workspace,
    focusTitle: sanitizeString(input.focusTitle, 'Lab focus', 90),
    focusBrief: sanitizeString(input.focusBrief, 'Review the highest-leverage work and hide the rest until needed.', 260),
    visiblePanels: visiblePanels.length ? visiblePanels : ['focus', 'tasks', 'sections'],
    collapsedPanels,
    pinnedSectionIds: sanitizeList(input.pinnedSectionIds, 8, 80),
    suggestedActions: sanitizeList(input.suggestedActions, 6, 160),
    reasoning: sanitizeString(input.reasoning, 'Organized from the current lab state.', 260),
  };
}

function buildState(store, env = process.env) {
  return {
    lab: store.lab,
    user: store.user,
    featureFlags: store.featureFlags,
    ui: store.ui,
    counts: {
      openTasks: openTasks(store).length,
      unread: store.inbox.filter((item) => item.unread).length,
      pendingAi: store.aiSuggestions.filter((item) => item.status === 'pending').length,
      risks: store.risks.length,
      projects: store.projects.length,
      meetings: store.meetings.length,
    },
    providers: providerStatuses(store, env),
    integrations: integrationStatuses(env),
    tasks: openTasks(store).map((task) => ({ ...task, project: projectName(store, task.projectId) })),
    projects: store.projects,
    inbox: store.inbox,
    meetings: store.meetings,
    calendarEvents: store.calendarEvents,
    aiSuggestions: store.aiSuggestions,
    risks: store.risks.map((risk) => ({ ...risk, project: projectName(store, risk.projectId) })),
    decisions: store.decisions,
    customSections: store.customSections,
    auditLog: store.auditLog.slice(-10),
    aiRuns: store.aiRuns.slice(-10),
  };
}

function envStatus(env, key) {
  return Boolean(env[key] && String(env[key]).trim());
}

function integrationStatuses(env = process.env) {
  return [
    {
      id: 'microsoft',
      label: 'Microsoft Graph',
      surface: 'Outlook mail, Outlook calendar, OneDrive',
      status: envStatus(env, 'MICROSOFT_CLIENT_ID') ? 'configured' : 'not configured',
      required: ['MICROSOFT_CLIENT_ID', 'MICROSOFT_CLIENT_SECRET'],
      setup: ['Create Microsoft Entra app', 'Add mail/calendar scopes', 'Complete OAuth consent', 'Run sync adapter'],
      nextStep: 'Configure Microsoft OAuth before syncing school mail and calendars.',
    },
    {
      id: 'google',
      label: 'Google Workspace',
      surface: 'Gmail, Google Calendar, Drive',
      status: envStatus(env, 'GOOGLE_CLIENT_ID') ? 'configured' : 'not configured',
      required: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
      setup: ['Create Google OAuth client', 'Add Gmail and Calendar scopes', 'Complete consent', 'Run sync adapter'],
      nextStep: 'Configure Google OAuth before syncing institutional Gmail and calendars.',
    },
    {
      id: 'zoom',
      label: 'Zoom',
      surface: 'Meeting creation, recording imports, transcript imports',
      status: envStatus(env, 'ZOOM_ACCESS_TOKEN') ? 'ready' : envStatus(env, 'ZOOM_CLIENT_ID') ? 'oauth credentials present' : 'not configured',
      required: ['ZOOM_ACCESS_TOKEN', 'ZOOM_CLIENT_ID', 'ZOOM_CLIENT_SECRET'],
      setup: ['Create Zoom General OAuth app', 'Request meeting:write:meeting', 'Store access token', 'Refresh hourly'],
      nextStep: 'Provide a Zoom access token for beta meeting creation or configure OAuth next.',
    },
    {
      id: 'slack',
      label: 'Slack',
      surface: 'Channel updates and meeting follow-up publishing',
      status: envStatus(env, 'SLACK_BOT_TOKEN') ? 'configured' : 'not configured',
      required: ['SLACK_BOT_TOKEN'],
      setup: ['Create Slack app', 'Install bot to workspace', 'Store bot token', 'Choose publish channels'],
      nextStep: 'Add a Slack bot token before publishing coordination updates.',
    },
    {
      id: 'notion',
      label: 'Notion',
      surface: 'Meeting summaries, lab wiki, project notes',
      status: envStatus(env, 'NOTION_TOKEN') ? 'configured' : 'not configured',
      required: ['NOTION_TOKEN'],
      setup: ['Create Notion integration', 'Share database/page with integration', 'Store token', 'Map summary destination'],
      nextStep: 'Add a Notion integration token before publishing meeting summaries.',
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      surface: 'Coordinator notifications through a messaging adapter',
      status: envStatus(env, 'WHATSAPP_ACCESS_TOKEN') || envStatus(env, 'TWILIO_AUTH_TOKEN') ? 'configured' : 'adapter planned',
      required: ['WHATSAPP_ACCESS_TOKEN', 'TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN'],
      setup: ['Choose WhatsApp or Twilio', 'Write consent policy', 'Store messaging credentials', 'Enable notification rules'],
      nextStep: 'Choose a messaging provider and consent policy before enabling notifications.',
    },
  ];
}

function providerStatuses(store, env = process.env) {
  const localBaseUrl = env.LABLINK_LOCAL_AI_URL || store.aiConfig.local.baseUrl;
  const customBaseUrl = env.LABLINK_CUSTOM_AI_URL || store.aiConfig.custom.baseUrl;
  return [
    {
      id: 'openai',
      label: 'OpenAI Responses',
      status: envStatus(env, 'OPENAI_API_KEY') ? 'configured' : 'not configured',
      model: env.OPENAI_MODEL || store.aiConfig.openai.model,
      baseUrl: env.OPENAI_BASE_URL || store.aiConfig.openai.baseUrl,
      required: ['OPENAI_API_KEY'],
    },
    {
      id: 'anthropic',
      label: 'Anthropic Messages',
      status: envStatus(env, 'ANTHROPIC_API_KEY') ? 'configured' : 'not configured',
      model: env.ANTHROPIC_MODEL || store.aiConfig.anthropic.model,
      baseUrl: env.ANTHROPIC_BASE_URL || store.aiConfig.anthropic.baseUrl,
      required: ['ANTHROPIC_API_KEY'],
    },
    {
      id: 'local',
      label: 'OpenAI-compatible Local',
      status: localBaseUrl ? 'configured' : 'not configured',
      model: env.LABLINK_LOCAL_MODEL || store.aiConfig.local.model,
      baseUrl: localBaseUrl,
      required: ['LABLINK_LOCAL_AI_URL'],
    },
    {
      id: 'custom',
      label: 'Custom AI Endpoint',
      status: customBaseUrl ? 'configured' : 'not configured',
      model: env.LABLINK_CUSTOM_AI_MODEL || store.aiConfig.custom.model,
      baseUrl: customBaseUrl,
      required: ['LABLINK_CUSTOM_AI_URL', store.aiConfig.custom.apiKeyEnv || 'LABLINK_CUSTOM_AI_KEY'],
    },
  ];
}

function resolveProvider(store, env = process.env, requested = null) {
  const statuses = providerStatuses(store, env);
  const configured = new Map(statuses.map((provider) => [provider.id, provider]));
  const preferred = requested || store.aiConfig.provider || 'auto';
  const order = preferred === 'auto' ? ['openai', 'anthropic', 'local', 'custom'] : [preferred];
  for (const id of order) {
    const provider = configured.get(id);
    if (provider?.status === 'configured') return { ...provider, available: true };
  }
  return {
    id: preferred,
    label: preferred === 'auto' ? 'Auto provider routing' : preferred,
    available: false,
    reason: 'No real AI provider configured. Set OPENAI_API_KEY, ANTHROPIC_API_KEY, LABLINK_LOCAL_AI_URL, or LABLINK_CUSTOM_AI_URL.',
    required: ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'LABLINK_LOCAL_AI_URL', 'LABLINK_CUSTOM_AI_URL'],
  };
}

function truncate(value, width) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (text.length <= width) return text;
  return `${text.slice(0, Math.max(0, width - 3))}...`;
}

function labContextSummary(store) {
  const tasks = openTasks(store)
    .slice(0, 8)
    .map((task) => `- ${task.id}: ${task.title} (${task.priority}, ${task.status}, ${projectName(store, task.projectId)})`)
    .join('\n');
  const projects = store.projects
    .map((project) => `- ${project.name}: ${project.status}, ${project.completion}% complete, ${project.health}`)
    .join('\n');
  const risks = store.risks
    .map((risk) => `- ${risk.severity}: ${risk.title}; mitigation: ${risk.mitigation}`)
    .join('\n');
  const meetings = store.meetings
    .slice(0, 6)
    .map((meeting) => `- ${meeting.title}: ${meeting.status}; ${meeting.summary}`)
    .join('\n');
  return `Lab: ${store.lab.name} (${store.lab.institution})
User: ${store.user.name}, ${store.user.role}

Projects:
${projects}

Open tasks:
${tasks}

Risks:
${risks}

Recent and upcoming meetings:
${meetings}`;
}

function extractJsonObject(text) {
  const raw = String(text || '').trim();
  try {
    return JSON.parse(raw);
  } catch {
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start >= 0 && end > start) {
      return JSON.parse(raw.slice(start, end + 1));
    }
    throw new HttpError(502, 'The AI provider did not return a usable section JSON object.', { code: 'invalid_ai_section_json' });
  }
}

async function postJson(url, headers, body) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  let payload;
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    payload = { raw: text };
  }
  if (!response.ok) {
    const detail = payload.error?.message || payload.message || text || response.statusText;
    throw new HttpError(response.status, detail, { upstream: payload });
  }
  return payload;
}

function extractOpenAiText(payload) {
  if (typeof payload.output_text === 'string') return payload.output_text;
  const output = payload.output || [];
  const parts = [];
  for (const item of output) {
    for (const content of item.content || []) {
      if (content.type === 'output_text' && content.text) parts.push(content.text);
      if (content.type === 'text' && content.text) parts.push(content.text);
    }
  }
  return parts.join('\n').trim();
}

async function callOpenAi(provider, prompt, instructions, env = process.env) {
  const payload = await postJson(
    provider.baseUrl,
    { authorization: `Bearer ${env.OPENAI_API_KEY}` },
    {
      model: provider.model,
      instructions,
      input: prompt,
      max_output_tokens: Number(env.OPENAI_MAX_OUTPUT_TOKENS || 1400),
    },
  );
  return extractOpenAiText(payload) || JSON.stringify(payload);
}

async function callAnthropic(provider, prompt, instructions, env = process.env) {
  const payload = await postJson(
    provider.baseUrl,
    {
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': env.ANTHROPIC_VERSION || '2023-06-01',
    },
    {
      model: provider.model,
      max_tokens: Number(env.ANTHROPIC_MAX_TOKENS || 1400),
      system: instructions,
      messages: [{ role: 'user', content: prompt }],
    },
  );
  return (payload.content || []).map((item) => item.text || '').join('\n').trim() || JSON.stringify(payload);
}

async function callCompatible(provider, prompt, instructions, env = process.env) {
  const keyEnv = provider.id === 'custom' ? env.LABLINK_CUSTOM_AI_KEY_ENV || 'LABLINK_CUSTOM_AI_KEY' : 'LABLINK_LOCAL_AI_KEY';
  const apiKey = env[keyEnv];
  const base = provider.baseUrl.replace(/\/$/, '');
  const url = /\/(chat\/completions|responses)$/.test(base) ? base : `${base}/chat/completions`;
  const headers = apiKey ? { authorization: `Bearer ${apiKey}` } : {};
  if (url.endsWith('/responses')) {
    const payload = await postJson(url, headers, { model: provider.model, instructions, input: prompt, max_output_tokens: 1400 });
    return extractOpenAiText(payload) || JSON.stringify(payload);
  }
  const payload = await postJson(url, headers, {
    model: provider.model,
    messages: [
      { role: 'system', content: instructions },
      { role: 'user', content: prompt },
    ],
    temperature: 0.2,
  });
  return payload.choices?.[0]?.message?.content || JSON.stringify(payload);
}

async function runAiText(store, feature, prompt, instructions, env = process.env, requestedProvider = null) {
  const provider = resolveProvider(store, env, requestedProvider);
  if (!provider.available) {
    throw new HttpError(409, provider.reason, {
      code: 'missing_real_ai_provider',
      required: provider.required,
    });
  }
  const started = Date.now();
  let text = '';
  if (provider.id === 'openai') text = await callOpenAi(provider, prompt, instructions, env);
  else if (provider.id === 'anthropic') text = await callAnthropic(provider, prompt, instructions, env);
  else text = await callCompatible(provider, prompt, instructions, env);
  return {
    text: text.trim(),
    provider: {
      id: provider.id,
      label: provider.label,
      model: provider.model,
    },
    feature,
    latencyMs: Date.now() - started,
  };
}

function splitStatements(text) {
  return String(text || '')
    .replace(/\r/g, '\n')
    .split(/\n+|(?<=[.!?])\s+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function uniqueByText(items) {
  const seen = new Set();
  const output = [];
  for (const item of items) {
    const key = item.text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(item);
  }
  return output;
}

function extractMeetingRules(input = {}) {
  const agenda = String(input.agenda || '').trim();
  const transcript = String(input.transcript || '').trim();
  const statements = splitStatements(transcript);
  const agendaItems = splitStatements(agenda.replace(/^- /gm, ''));
  const taskPattern = /\b(will|should|need to|needs to|assign|assigned|follow up|send|schedule|confirm|review|prepare|run|submit|update|check)\b/i;
  const riskPattern = /\b(risk|blocked|blocker|delay|delayed|backorder|concern|slip|miss|failed|issue|problem)\b/i;
  const decisionPattern = /\b(decision|decided|agreed|we will use|approved|selected)\b/i;
  const topicPattern = /\b(project|cohort|grant|aims|imaging|analysis|calendar|meeting|sample|reagent|equipment|budget|protocol|deadline)\b/i;

  const tasks = uniqueByText(statements.filter((line) => taskPattern.test(line)).map((text) => ({
    text,
    confidence: taskPattern.test(text) ? 0.74 : 0.55,
    source: 'rules',
  }))).slice(0, 12);
  const risks = uniqueByText(statements.filter((line) => riskPattern.test(line)).map((text) => ({
    text,
    severity: /\b(blocked|blocker|backorder|failed|miss)\b/i.test(text) ? 'high' : 'medium',
    source: 'rules',
  }))).slice(0, 8);
  const decisions = uniqueByText(statements.filter((line) => decisionPattern.test(line)).map((text) => ({
    text,
    source: 'rules',
  }))).slice(0, 8);
  const topics = uniqueByText(statements.filter((line) => topicPattern.test(line)).map((text) => ({
    text: truncate(text, 120),
    source: 'rules',
  }))).slice(0, 10);
  const agendaCoverage = agendaItems.slice(0, 10).map((item) => ({
    item,
    mentioned: transcript.toLowerCase().includes(item.toLowerCase().split(/\s+/).slice(0, 4).join(' ')),
  }));

  return {
    source: 'rules',
    generatedAt: new Date().toISOString(),
    transcriptLength: transcript.length,
    agendaItems,
    agendaCoverage,
    topics,
    tasks,
    decisions,
    risks,
    next: {
      canRunAi: true,
      note: 'Use provider-backed analysis for synthesis when a real AI provider is configured.',
    },
  };
}

async function analyzeMeeting(store, body, env = process.env) {
  const agenda = String(body.agenda || '').trim();
  const transcript = String(body.transcript || '').trim();
  if (!transcript) throw new HttpError(400, 'Transcript is required for provider-backed analysis.', { code: 'missing_transcript' });
  const prompt = `Analyze this research lab meeting. Use only the provided agenda, transcript, and lab state. Return concise Markdown with these sections: Summary, Decisions, Task proposals, Risks, Follow-ups, Calendar pressure, Coordination messages.

Agenda:
${agenda || 'No agenda provided.'}

Transcript:
${transcript}

Lab state:
${labContextSummary(store)}`;
  return runAiText(
    store,
    'web.meeting.analyze',
    prompt,
    'You are Lab Link, an exacting research lab operations analyst. Do not invent facts. Distinguish decisions from proposals. Mention uncertainty when evidence is weak.',
    env,
    body.provider || null,
  );
}

async function proposeWorkspaceSection(store, body, env = process.env) {
  const goal = sanitizeString(body.goal, '', 1200);
  const labProfile = sanitizeString(body.labProfile, '', 1000);
  if (!goal) throw new HttpError(400, 'A section goal is required.', { code: 'missing_section_goal' });
  const prompt = `Design one new Lab Link website section for a research lab. Return only one JSON object with this exact shape:
{
  "title": "short section name",
  "module": "short_snake_case_module",
  "purpose": "what this section helps the lab do",
  "layout": "brief|table|board|checklist|timeline",
  "fields": [{"label":"Field label","type":"text|status|person|date|number","value":"sample value"}],
  "signals": ["signals this section should watch"],
  "actions": ["specific actions this section should support"],
  "automations": ["safe automations or AI-assisted workflows"],
  "integrations": ["relevant integrations such as Zoom, Slack, Notion, Gmail, Outlook"],
  "dataPolicy": "privacy and review policy for this section"
}

Goal:
${goal}

Optional lab profile:
${labProfile || 'No extra profile provided.'}

Current Lab Link state:
${labContextSummary(store)}

Rules:
- Be specific to this lab.
- Do not claim an integration is active unless it is listed as configured in the state.
- Keep it useful as a real product section, not a marketing concept.
- No decorative content, no invented people, no fake data sources.`;
  const result = await runAiText(
    store,
    'web.workspace.proposeSection',
    prompt,
    'You design practical, audit-friendly research lab operations software. Return valid JSON only. Do not include Markdown fences.',
    env,
    body.provider || null,
  );
  const parsed = extractJsonObject(result.text);
  return {
    section: sanitizeSection(parsed, `ai:${result.provider.id}`),
    provider: result.provider,
    latencyMs: result.latencyMs,
  };
}

async function organizeWorkspace(store, body, env = process.env) {
  const intent = sanitizeString(body.intent, '', 1200);
  if (!intent) throw new HttpError(400, 'A workspace intent is required.', { code: 'missing_workspace_intent' });
  const prompt = `Organize the Lab Link website for the user right now. Return only one JSON object with this exact shape:
{
  "workspace": "command|meetings|builder|projects|ai|integrations|settings",
  "focusTitle": "short title for the top focus area",
  "focusBrief": "one concise sentence explaining what matters now",
  "visiblePanels": ["focus","tasks","risks","sections","meetings","inbox","projects","ai","integrations"],
  "collapsedPanels": ["panel ids that should start collapsed"],
  "pinnedSectionIds": ["custom section ids to emphasize"],
  "suggestedActions": ["short actions the user should consider"],
  "reasoning": "brief reason for the layout"
}

User intent:
${intent}

Current custom sections:
${store.customSections.map((section) => `- ${section.id}: ${section.title} (${section.purpose})`).join('\n') || 'No custom sections.'}

Current Lab Link state:
${labContextSummary(store)}

Rules:
- Keep the workspace minimal. Prefer 2 to 4 visible panels.
- Hide or collapse anything not directly relevant to the intent.
- Do not create new data or claim external sync happened.
- If the intent is about meetings, include meetings and tasks.
- If the intent is about setup, include integrations and sections.
- If the intent is about execution, include focus, tasks, and risks only when risks matter.`;
  const result = await runAiText(
    store,
    'web.workspace.organize',
    prompt,
    'You are Lab Link, a practical lab workspace organizer. Return valid JSON only. Optimize for calm, selective, high-leverage work surfaces.',
    env,
    body.provider || null,
  );
  const parsed = extractJsonObject(result.text);
  return {
    plan: sanitizeOrganizerPlan(parsed),
    provider: result.provider,
    latencyMs: result.latencyMs,
  };
}

function addWorkspaceSection(store, body) {
  const section = sanitizeSection(body.section || body, body.createdBy || 'manual');
  const existingIndex = store.customSections.findIndex((item) => item.id === section.id);
  if (existingIndex >= 0) store.customSections[existingIndex] = section;
  else store.customSections.unshift(section);
  store.auditLog.push({
    id: `audit-${Date.now()}`,
    at: new Date().toISOString(),
    actor: store.user.id,
    action: 'custom_section_saved',
    detail: `${section.title} saved to Lab Builder.`,
  });
  return section;
}

function deleteWorkspaceSection(store, body) {
  const id = sanitizeString(body.id, '', 80);
  const before = store.customSections.length;
  store.customSections = store.customSections.filter((section) => section.id !== id);
  return before !== store.customSections.length;
}

async function createZoomMeeting(body, env = process.env) {
  if (!envStatus(env, 'ZOOM_ACCESS_TOKEN')) {
    throw new HttpError(409, 'Zoom access token is not configured. Lab Link will not fabricate meeting links.', {
      code: 'missing_zoom_access_token',
      required: ['ZOOM_ACCESS_TOKEN'],
      optional: ['ZOOM_CLIENT_ID', 'ZOOM_CLIENT_SECRET'],
    });
  }
  const topic = String(body.title || 'Lab Link Meeting').trim();
  const agenda = String(body.agenda || '').trim();
  const payload = await postJson(
    'https://api.zoom.us/v2/users/me/meetings',
    { authorization: `Bearer ${env.ZOOM_ACCESS_TOKEN}` },
    {
      topic,
      type: 2,
      start_time: body.startTime || new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      duration: Number(body.durationMinutes || 45),
      agenda: agenda.slice(0, 2000),
      settings: {
        waiting_room: true,
        join_before_host: false,
      },
    },
  );
  return {
    source: 'zoom',
    meetingId: payload.id,
    joinUrl: payload.join_url,
    startUrl: payload.start_url,
    topic: payload.topic || topic,
  };
}

async function readBody(request) {
  return new Promise((resolve, reject) => {
    let total = 0;
    const chunks = [];
    request.on('data', (chunk) => {
      total += chunk.length;
      if (total > MAX_BODY_BYTES) {
        reject(new HttpError(413, 'Request body is too large.', { maxBytes: MAX_BODY_BYTES }));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new HttpError(400, 'Request body must be valid JSON.', { code: 'invalid_json' }));
      }
    });
    request.on('error', reject);
  });
}

function sendJson(response, status, payload) {
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  });
  response.end(`${JSON.stringify(payload, null, 2)}\n`);
}

function sendFile(response, file) {
  const ext = path.extname(file);
  response.writeHead(200, {
    'content-type': MIME_TYPES[ext] || 'application/octet-stream',
    'cache-control': ext === '.html' ? 'no-store' : 'public, max-age=300',
  });
  fs.createReadStream(file).pipe(response);
}

function safeStaticPath(urlPath) {
  const requested = urlPath === '/' ? '/index.html' : urlPath;
  const decoded = decodeURIComponent(requested.split('?')[0]);
  const normalized = path.normalize(decoded).replace(/^[/\\]+/, '').replace(/^(\.\.[/\\])+/, '');
  const file = path.resolve(PUBLIC_DIR, normalized);
  if (!file.startsWith(PUBLIC_DIR)) return null;
  return file;
}

async function handleApi(request, response, context, pathname) {
  const store = loadStore(context.dataDir);
  if (request.method === 'GET' && pathname === '/api/health') {
    return sendJson(response, 200, {
      ok: true,
      product: 'Lab Link Web',
      runtime: 'web-bootstrap',
      dataDir: context.dataDir,
      secretsLoaded: context.loadedSecretKeys.length,
    });
  }
  if (request.method === 'GET' && pathname === '/api/state') {
    return sendJson(response, 200, buildState(store, context.env));
  }
  if (request.method === 'GET' && pathname === '/api/integrations') {
    return sendJson(response, 200, {
      providers: providerStatuses(store, context.env),
      integrations: integrationStatuses(context.env),
      selectedProvider: resolveProvider(store, context.env),
    });
  }
  if (request.method === 'POST' && pathname === '/api/meeting/rules') {
    const body = await readBody(request);
    return sendJson(response, 200, extractMeetingRules(body));
  }
  if (request.method === 'POST' && pathname === '/api/meeting/analyze') {
    const body = await readBody(request);
    const result = await analyzeMeeting(store, body, context.env);
    return sendJson(response, 200, result);
  }
  if (request.method === 'POST' && pathname === '/api/workspace/propose') {
    const body = await readBody(request);
    const result = await proposeWorkspaceSection(store, body, context.env);
    return sendJson(response, 200, result);
  }
  if (request.method === 'POST' && pathname === '/api/workspace/organize') {
    const body = await readBody(request);
    const result = await organizeWorkspace(store, body, context.env);
    return sendJson(response, 200, result);
  }
  if (request.method === 'POST' && pathname === '/api/workspace/sections') {
    const body = await readBody(request);
    const section = addWorkspaceSection(store, body);
    saveStore(context.dataDir, store);
    return sendJson(response, 200, { section, state: buildState(store, context.env) });
  }
  if (request.method === 'POST' && pathname === '/api/workspace/sections/delete') {
    const body = await readBody(request);
    const deleted = deleteWorkspaceSection(store, body);
    saveStore(context.dataDir, store);
    return sendJson(response, 200, { deleted, state: buildState(store, context.env) });
  }
  if (request.method === 'POST' && pathname === '/api/zoom/start') {
    const body = await readBody(request);
    const result = await createZoomMeeting(body, context.env);
    return sendJson(response, 200, result);
  }
  return sendJson(response, 404, { error: 'API route not found.' });
}

async function handleRequest(request, response, context) {
  try {
    const url = new URL(request.url || '/', `http://${request.headers.host || '127.0.0.1'}`);
    if (url.pathname.startsWith('/api/')) {
      return await handleApi(request, response, context, url.pathname);
    }
    const file = safeStaticPath(url.pathname);
    if (!file || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      return sendJson(response, 404, { error: 'File not found.' });
    }
    return sendFile(response, file);
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 500;
    return sendJson(response, status, {
      error: error.message,
      ...(error.details || {}),
    });
  }
}

function runWebSmoke(args = []) {
  const dataDir = defaultDataDir(args);
  const index = fs.readFileSync(path.join(PUBLIC_DIR, 'index.html'), 'utf8');
  const css = fs.readFileSync(path.join(PUBLIC_DIR, 'styles.css'), 'utf8');
  const js = fs.readFileSync(path.join(PUBLIC_DIR, 'app.js'), 'utf8');
  assert(index.includes('Lab Link'), 'index includes product name');
  assert(css.includes('--canvas'), 'styles define design tokens');
  assert(js.includes('SpeechRecognition'), 'client includes live notes capability check');
  assert(js.includes('Lab Builder'), 'client includes adaptive Lab Builder');
  assert(js.includes('/api/workspace/propose'), 'client can request provider-backed section proposals');
  assert(js.includes('/api/workspace/organize'), 'client can request provider-backed workspace organization');
  const store = loadStore(dataDir);
  const state = buildState(store, {});
  assert(state.counts.openTasks > 0, 'state exposes open tasks');
  assert(state.customSections.length > 0, 'state exposes custom sections');
  assert(state.providers.every((provider) => ['configured', 'not configured'].includes(provider.status)), 'providers expose truthful status');
  const rules = extractMeetingRules({
    agenda: 'AT8 supply\nCohort 2 perfusion\nOpen field analysis',
    transcript: 'Jordan will check alternate AT8 suppliers. Decision: use cohort 2 for the next perfusion window. Risk: AT8 backorder may delay staining.',
  });
  assert(rules.tasks.length > 0, 'rules extraction finds tasks');
  assert(rules.decisions.length > 0, 'rules extraction finds decisions');
  assert(rules.risks.length > 0, 'rules extraction finds risks');
  const provider = resolveProvider(createSeedStore(DEFAULT_NOW), {});
  assert(!provider.available, 'empty environment does not resolve a real AI provider');
  const zoom = integrationStatuses({}).find((item) => item.id === 'zoom');
  assert(zoom.status === 'not configured', 'empty environment does not claim Zoom readiness');
  const section = sanitizeSection({ title: 'Protocol Tracker', fields: [{ label: 'Protocol', type: 'text', value: 'IHC' }] });
  assert(section.title === 'Protocol Tracker', 'custom section sanitizer keeps title');
  const plan = sanitizeOrganizerPlan({ workspace: 'meetings', visiblePanels: ['focus', 'tasks', 'unknown'], collapsedPanels: ['risks'] });
  assert(plan.workspace === 'meetings' && plan.visiblePanels.length === 2, 'workspace organizer sanitizer works');
  process.stdout.write('Web smoke passed.\n');
}

export async function startWebServer(options = {}) {
  const args = options.args || process.argv.slice(2);
  if (parseBoolean(args, '--smoke')) {
    runWebSmoke(args);
    return null;
  }
  const host = parseFlag(args, '--host', process.env.LABLINK_WEB_HOST || '127.0.0.1');
  const port = Number(parseFlag(args, '--port', process.env.LABLINK_WEB_PORT || 4867));
  const dataDir = options.dataDir ? path.resolve(options.dataDir) : defaultDataDir(args);
  ensureDir(dataDir);
  const localRuntime = runtimeEnv(dataDir, args);
  const context = { dataDir, ...localRuntime };
  const server = http.createServer((request, response) => {
    handleRequest(request, response, context);
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, resolve);
  });
  process.stdout.write(`Lab Link web running at http://${host}:${port}\n`);
  process.stdout.write(`Data directory: ${dataDir}\n`);
  if (context.loadedSecretKeys.length) process.stdout.write(`Loaded ${context.loadedSecretKeys.length} local secret(s) from ${context.secretsFile}\n`);
  return server;
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === pathToFileURL(__filename).href) {
  try {
    await startWebServer();
  } catch (error) {
    process.stderr.write(`Lab Link web error: ${error.message}\n`);
    process.exit(1);
  }
}

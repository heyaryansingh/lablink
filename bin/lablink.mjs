#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

const VERSION = '0.1.0';
const APP_NAME = 'Lab Link';
const SCHEMA_VERSION = 1;
const DEFAULT_NOW = process.env.LABLINK_NOW || new Date().toISOString();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

const views = ['command', 'today', 'projects', 'meetings', 'ai', 'settings'];
const viewLabels = {
  command: 'Command Center',
  today: 'Today',
  projects: 'Projects',
  meetings: 'Meetings',
  ai: 'AI Review',
  settings: 'Settings',
};

const ansi = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[38;5;84m',
  blue: '\x1b[38;5;111m',
  yellow: '\x1b[38;5;222m',
  red: '\x1b[38;5;204m',
  gray: '\x1b[38;5;245m',
  dark: '\x1b[38;5;240m',
  clear: '\x1b[2J\x1b[H',
  hideCursor: '\x1b[?25l',
  showCursor: '\x1b[?25h',
};

function color(value, code, enabled) {
  return enabled ? `${code}${value}${ansi.reset}` : value;
}

function bold(value, enabled) {
  return color(value, ansi.bold, enabled);
}

function dataDir({ demo = false, explicit } = {}) {
  if (explicit) return path.resolve(explicit);
  if (demo || process.env.LABLINK_DATA_DIR) return path.resolve(process.env.LABLINK_DATA_DIR || '.lablink-dev');
  return path.join(os.homedir(), '.lablink');
}

function storePath(dir) {
  return path.join(dir, 'lablink.bootstrap.json');
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readJson(file, fallback) {
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, value) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function loadStore(options = {}) {
  const dir = dataDir(options);
  const file = storePath(dir);
  const store = readJson(file, null);
  if (store) return { dir, file, store };
  const seeded = createSeedStore(DEFAULT_NOW);
  writeJson(file, seeded);
  return { dir, file, store: seeded };
}

function saveStore(context) {
  writeJson(context.file, context.store);
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

  const store = {
    schemaVersion: SCHEMA_VERSION,
    lab: {
      name: 'Park Lab',
      institution: 'University Research Center',
      timezone: 'America/Chicago',
      runtime: 'bootstrap',
    },
    user: {
      id: 'user-alex',
      name: 'Alex Kim',
      email: 'alex.kim@example.edu',
      role: 'grad_student',
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
    },
    providers: [
      { id: 'mock', label: 'Deterministic Local AI', status: 'active', model: 'lablink-local-rules', lastError: null },
      { id: 'anthropic', label: 'Anthropic', status: process.env.ANTHROPIC_API_KEY ? 'configured' : 'not configured', model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514', lastError: null },
      { id: 'openai', label: 'OpenAI Responses', status: process.env.OPENAI_API_KEY ? 'configured' : 'not configured', model: process.env.OPENAI_MODEL || 'gpt-5.5', lastError: null },
      { id: 'local', label: 'OpenAI-compatible Local', status: process.env.LABLINK_LOCAL_AI_URL ? 'configured' : 'available', model: process.env.LABLINK_LOCAL_MODEL || 'local-model', lastError: null },
    ],
    integrations: [
      { id: 'microsoft', label: 'Microsoft Graph', status: process.env.MICROSOFT_CLIENT_ID ? 'configured' : 'not configured', nextStep: 'Set MICROSOFT_CLIENT_ID and run lablink sync.' },
      { id: 'google', label: 'Google Workspace', status: process.env.GOOGLE_CLIENT_ID ? 'configured' : 'not configured', nextStep: 'Set Google OAuth credentials for Gmail, Drive, and Calendar.' },
      { id: 'zoom', label: 'Zoom Cloud Recordings', status: process.env.ZOOM_CLIENT_ID ? 'configured' : 'not configured', nextStep: 'Set Zoom OAuth credentials to import transcripts.' },
      { id: 'bot', label: 'External Meeting Bot', status: 'adapter ready', nextStep: 'Configure a bot provider and consent copy before live use.' },
    ],
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
    auditLog: [
      { id: 'audit-seed', at: at(0, 7), actor: 'system', action: 'seed_demo', detail: 'Created bootstrap demo workspace.' },
    ],
  };

  return store;
}

function projectName(store, projectId) {
  return store.projects.find((project) => project.id === projectId)?.name || 'Unassigned';
}

function formatDate(value) {
  if (!value) return 'No date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function daysUntil(value) {
  if (!value) return 'No deadline';
  const start = new Date(DEFAULT_NOW);
  const end = new Date(`${value}T12:00:00`);
  const days = Math.round((end - start) / 86400000);
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `${days}d`;
}

function truncate(value, width) {
  const input = String(value ?? '');
  if (input.length <= width) return input;
  if (width <= 3) return input.slice(0, width);
  return `${input.slice(0, width - 3)}...`;
}

function pad(value, width) {
  const input = truncate(value, width);
  return input + ' '.repeat(Math.max(0, width - input.length));
}

function repeat(char, count) {
  return char.repeat(Math.max(0, count));
}

function priorityRank(priority) {
  return { critical: 0, high: 1, medium: 2, low: 3 }[priority] ?? 4;
}

function statusColor(status) {
  const lower = String(status || '').toLowerCase();
  if (lower.includes('risk') || lower.includes('blocked') || lower.includes('critical')) return ansi.red;
  if (lower.includes('watch') || lower.includes('pending') || lower.includes('high')) return ansi.yellow;
  if (lower.includes('track') || lower.includes('approved') || lower.includes('active')) return ansi.green;
  return ansi.gray;
}

function render(store, state = {}, options = {}) {
  const width = Math.max(88, Math.min(options.width || process.stdout.columns || 118, 150));
  const height = Math.max(28, Math.min(options.height || process.stdout.rows || 36, 60));
  const useColor = Boolean(options.color);
  const active = state.view || 'command';
  const sidebarWidth = width >= 104 ? 27 : 0;
  const contentWidth = sidebarWidth ? width - sidebarWidth - 3 : width - 2;
  const lines = [];

  lines.push(topBar(store, width, useColor));
  lines.push(border(width));

  const sidebar = sidebarWidth ? renderSidebar(store, active, sidebarWidth, useColor) : [];
  const content = renderContent(store, active, contentWidth, useColor, state);
  const bodyHeight = height - 4;

  for (let index = 0; index < bodyHeight; index += 1) {
    const left = sidebarWidth ? sidebar[index] || repeat(' ', sidebarWidth) : '';
    const right = content[index] || '';
    if (sidebarWidth) {
      lines.push(`|${left}| ${pad(right, contentWidth)}|`);
    } else {
      lines.push(`| ${pad(right, width - 4)} |`);
    }
  }

  lines.push(border(width));
  lines.push(statusBar(width, active, useColor));
  return lines.join('\n');
}

function topBar(store, width, useColor) {
  const title = `${APP_NAME} ${VERSION}`;
  const subtitle = `${store.lab.name} | ${store.lab.runtime} runtime | local-first`;
  const right = `${store.user.name} (${store.user.role})`;
  const middleWidth = width - title.length - right.length - 8;
  return ` ${bold(title, useColor)}  ${color(pad(subtitle, middleWidth), ansi.gray, useColor)} ${right}`;
}

function border(width) {
  return `+${repeat('-', width - 2)}+`;
}

function renderSidebar(store, active, width, useColor) {
  const unread = store.inbox.filter((item) => item.unread).length;
  const pending = store.aiSuggestions.filter((item) => item.status === 'pending').length;
  const openTasks = store.tasks.filter((task) => task.status !== 'done').length;
  const nav = [
    ['1', 'command', `Command Center (${unread})`],
    ['2', 'today', `Today (${openTasks})`],
    ['3', 'projects', `Projects (${store.projects.length})`],
    ['4', 'meetings', `Meetings (${store.meetings.length})`],
    ['5', 'ai', `AI Review (${pending})`],
    ['6', 'settings', 'Settings'],
  ];

  const lines = [];
  lines.push(pad(`  ${bold('LAB LINK', useColor)}`, width));
  lines.push(pad('', width));
  for (const [key, id, label] of nav) {
    const selected = id === active;
    const marker = selected ? '>' : ' ';
    const text = ` ${marker} ${key} ${label}`;
    lines.push(pad(color(text, selected ? ansi.green : ansi.gray, useColor), width));
  }
  lines.push(pad('', width));
  lines.push(pad(`  ${color('PROJECTS', ansi.gray, useColor)}`, width));
  for (const project of store.projects.slice(0, 6)) {
    lines.push(pad(`  ${project.icon} ${truncate(project.name, width - 6)}`, width));
  }
  lines.push(pad('', width));
  lines.push(pad(`  ${color('SHORTCUTS', ansi.gray, useColor)}`, width));
  lines.push(pad('  / search', width));
  lines.push(pad('  ? palette', width));
  lines.push(pad('  q quit', width));
  return lines;
}

function renderContent(store, active, width, useColor, state) {
  if (active === 'today') return renderToday(store, width, useColor);
  if (active === 'projects') return renderProjects(store, width, useColor);
  if (active === 'meetings') return renderMeetings(store, width, useColor);
  if (active === 'ai') return renderAiReview(store, width, useColor);
  if (active === 'settings') return renderSettings(store, width, useColor);
  if (active === 'search') return renderSearch(store, width, useColor, state.query || '');
  if (active === 'palette') return renderPalette(width, useColor);
  return renderCommand(store, width, useColor);
}

function section(title, useColor) {
  return bold(title.toUpperCase(), useColor);
}

function renderCommand(store, width, useColor) {
  const lines = [];
  lines.push(section('Command Center', useColor));
  lines.push(color('Operational dashboard fed by inbox, tasks, meetings, AI review, and lab modules.', ansi.gray, useColor));
  lines.push(systemStatus(store, width, useColor));
  lines.push('');
  lines.push(section('Priority Queue', useColor));
  for (const task of [...store.tasks].sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority)).slice(0, 5)) {
    const marker = task.priority === 'critical' ? '!' : task.priority === 'high' ? '*' : '-';
    lines.push(`${color(marker, statusColor(task.priority), useColor)} ${pad(task.title, Math.max(36, width - 18))} ${pad(daysUntil(task.due), 11)}`);
    lines.push(color(`  ${projectName(store, task.projectId)} | ${task.assignee} | ${truncate(task.reason, width - 34)}`, ansi.gray, useColor));
  }
  lines.push('');
  lines.push(section('Inbox', useColor));
  for (const item of store.inbox.slice(0, 4)) {
    const project = projectName(store, item.projectId);
    lines.push(`${item.unread ? '*' : 'o'} ${pad(item.source, 8)} ${pad(item.subject, Math.min(42, width - 46))} -> ${project}`);
    lines.push(color(`  ${item.from} | ${truncate(item.preview, width - 10)}`, ansi.gray, useColor));
  }
  lines.push('');
  lines.push(section('Risk Radar', useColor));
  for (const risk of store.risks) {
    lines.push(`${color(risk.severity.toUpperCase().padEnd(6), statusColor(risk.severity), useColor)} ${truncate(`${risk.title} -> ${risk.mitigation}`, width - 10)}`);
  }
  return lines;
}

function systemStatus(store, width, useColor) {
  const pending = store.aiSuggestions.filter((item) => item.status === 'pending').length;
  const ai = store.providers.find((provider) => provider.id === 'mock');
  const zoom = store.integrations.find((integration) => integration.id === 'zoom');
  return color(
    truncate(`Status: ${ai.label} ${ai.status} | Zoom ${zoom.status} | ${pending} AI suggestions need review`, width - 2),
    ansi.dark,
    useColor,
  );
}

function renderToday(store, width, useColor) {
  const lines = [section('Today', useColor), color('Ranked by deadline, dependency impact, and AI priority score.', ansi.gray, useColor), ''];
  for (const priority of ['critical', 'high', 'medium', 'low']) {
    const tasks = store.tasks.filter((task) => task.priority === priority);
    if (!tasks.length) continue;
    lines.push(color(priority.toUpperCase(), statusColor(priority), useColor));
    for (const task of tasks) {
      lines.push(`  [${task.status === 'done' ? 'x' : ' '}] ${pad(task.title, Math.max(38, width - 22))} ${pad(daysUntil(task.due), 11)}`);
      lines.push(color(`      ${projectName(store, task.projectId)} | ${task.assignee} | ${task.source} | Score: ${task.score.toFixed(2)}`, ansi.gray, useColor));
      if (task.quote) lines.push(color(`      "${truncate(task.quote, width - 12)}"`, ansi.dark, useColor));
    }
    lines.push('');
  }
  return lines;
}

function renderProjects(store, width, useColor) {
  const lines = [section('Projects', useColor), color('Portfolio health, deadlines, and operational blockers.', ansi.gray, useColor), ''];
  lines.push(`${pad('Project', 26)} ${pad('Status', 10)} ${pad('Done', 6)} ${pad('Deadline', 12)} Owner`);
  lines.push(repeat('-', Math.min(width - 2, 76)));
  for (const project of store.projects) {
    lines.push(`${pad(`${project.icon} ${project.name}`, 26)} ${color(pad(project.status, 10), statusColor(project.status), useColor)} ${pad(`${project.completion}%`, 6)} ${pad(formatDate(project.nextDeadline), 12)} ${project.owner}`);
    lines.push(color(`  ${truncate(project.health, width - 6)}`, ansi.gray, useColor));
  }
  lines.push('');
  lines.push(section('Feature-Flagged Lab Modules', useColor));
  const enabled = Object.entries(store.featureFlags).filter(([, value]) => value).map(([key]) => key).join(', ');
  lines.push(color(truncate(enabled, width - 2), ansi.gray, useColor));
  return lines;
}

function renderMeetings(store, width, useColor) {
  const lines = [section('Meeting Intelligence', useColor), color('Zoom transcripts, imported notes, AI decisions, tasks, risks, and follow-ups.', ansi.gray, useColor), ''];
  for (const meeting of store.meetings) {
    lines.push(`${pad(formatDate(meeting.at), 8)} ${pad(meeting.title, Math.min(34, width - 48))} ${color(pad(meeting.status, 11), statusColor(meeting.status), useColor)} ${meeting.type}`);
    lines.push(color(`  ${truncate(meeting.summary, width - 6)}`, ansi.gray, useColor));
  }
  lines.push('');
  lines.push(section('Artifacts', useColor));
  for (const artifact of store.meetingArtifacts.slice(-5)) {
    lines.push(`${pad(artifact.kind, 12)} ${pad(artifact.source, 22)} ${pad(artifact.status, 10)} ${formatDate(artifact.importedAt)}`);
    lines.push(color(`  ${truncate(artifact.excerpt, width - 6)}`, ansi.gray, useColor));
  }
  lines.push('');
  lines.push(section('Bot / Recording Readiness', useColor));
  const zoom = store.integrations.find((item) => item.id === 'zoom');
  const bot = store.integrations.find((item) => item.id === 'bot');
  lines.push(`Zoom Cloud Recording Import: ${color(zoom.status, statusColor(zoom.status), useColor)} - ${zoom.nextStep}`);
  lines.push(`External Notes Bot: ${color(bot.status, statusColor(bot.status), useColor)} - ${bot.nextStep}`);
  return lines;
}

function renderAiReview(store, width, useColor) {
  const lines = [
    section('AI Review Queue', useColor),
    color('Every suggestion has source, confidence, quote, and approval state.', ansi.gray, useColor),
    color('CLI actions: lablink ai approve <id> | lablink ai reject <id> | lablink ai list', ansi.dark, useColor),
    '',
  ];
  lines.push(`${pad('Type', 10)} ${pad('State', 10)} ${pad('Conf', 6)} ${pad('Target', 22)} Suggestion`);
  lines.push(repeat('-', Math.min(width - 2, 90)));
  for (const suggestion of store.aiSuggestions) {
    lines.push(`${pad(suggestion.type, 10)} ${color(pad(suggestion.status, 10), statusColor(suggestion.status), useColor)} ${pad(String(Math.round(suggestion.confidence * 100)), 6)} ${pad(suggestion.target, 22)} ${truncate(suggestion.title, width - 54)}`);
    lines.push(color(`  Source: ${suggestion.source} | "${truncate(suggestion.quote, width - 22)}"`, ansi.gray, useColor));
    lines.push(color(`  Reason: ${truncate(suggestion.reason, width - 12)}`, ansi.dark, useColor));
  }
  return lines;
}

function renderSettings(store, width, useColor) {
  const lines = [section('Settings', useColor), color('Transparent runtime, provider, integration, and module status.', ansi.gray, useColor), ''];
  lines.push(`Lab: ${store.lab.name} | ${store.lab.institution}`);
  lines.push(`Runtime: ${store.lab.runtime} | Data schema: ${store.schemaVersion}`);
  lines.push('');
  lines.push(section('AI Providers', useColor));
  for (const provider of store.providers) {
    lines.push(`${pad(provider.label, 28)} ${color(pad(provider.status, 14), statusColor(provider.status), useColor)} ${provider.model}`);
  }
  lines.push('');
  lines.push(section('Integrations', useColor));
  for (const integration of store.integrations) {
    lines.push(`${pad(integration.label, 28)} ${color(pad(integration.status, 14), statusColor(integration.status), useColor)} ${truncate(integration.nextStep, width - 46)}`);
  }
  lines.push('');
  lines.push(section('Enabled Modules', useColor));
  lines.push(Object.entries(store.featureFlags).map(([key, value]) => `${value ? 'on ' : 'off'} ${key}`).join('  '));
  return lines;
}

function renderSearch(store, width, useColor, query) {
  const lines = [section('Search', useColor), color(`Query: ${query || '(type to search)'}`, ansi.gray, useColor), ''];
  if (!query) return lines.concat(['Search covers projects, tasks, inbox, meetings, artifacts, and AI suggestions.']);
  const haystack = [
    ...store.projects.map((item) => ({ type: 'project', label: item.name, text: `${item.name} ${item.health}` })),
    ...store.tasks.map((item) => ({ type: 'task', label: item.title, text: `${item.title} ${item.quote} ${item.reason}` })),
    ...store.inbox.map((item) => ({ type: 'inbox', label: item.subject, text: `${item.subject} ${item.preview} ${item.from}` })),
    ...store.meetings.map((item) => ({ type: 'meeting', label: item.title, text: `${item.title} ${item.summary}` })),
    ...store.aiSuggestions.map((item) => ({ type: 'ai', label: item.title, text: `${item.title} ${item.quote} ${item.reason}` })),
  ];
  const results = haystack.filter((item) => item.text.toLowerCase().includes(query.toLowerCase())).slice(0, 12);
  if (!results.length) return lines.concat(['No results.']);
  for (const result of results) {
    lines.push(`${pad(result.type, 10)} ${truncate(result.label, width - 14)}`);
  }
  return lines;
}

function renderPalette(width, useColor) {
  return [
    section('Command Palette', useColor),
    color('Claude-Code-style command surface. More commands become active as layers land.', ansi.gray, useColor),
    '',
    `${pad('1', 6)} Open Command Center`,
    `${pad('2', 6)} Open Today`,
    `${pad('3', 6)} Open Projects`,
    `${pad('4', 6)} Open Meetings`,
    `${pad('5', 6)} Open AI Review`,
    `${pad('/', 6)} Search local lab graph`,
    `${pad('meeting import <file>', 24)} Import transcript and create AI suggestions`,
    `${pad('sync', 24)} Check integration readiness`,
    '',
    truncate('Approval/edit/reject actions for AI suggestions land in the next workflow layer.', width - 2),
  ];
}

function statusBar(width, active, useColor) {
  const left = ` ${viewLabels[active] || active}`;
  const right = '1-6 nav  / search  ? palette  q quit ';
  return color(left, ansi.green, useColor) + color(pad('', Math.max(1, width - left.length - right.length)), ansi.gray, useColor) + color(right, ansi.gray, useColor);
}

function runInteractive(context) {
  const state = { view: 'command', query: '' };
  const useColor = true;
  const draw = () => {
    process.stdout.write(ansi.clear + ansi.hideCursor);
    process.stdout.write(render(context.store, state, { color: useColor }));
  };

  readline.emitKeypressEvents(process.stdin);
  if (process.stdin.isTTY) process.stdin.setRawMode(true);
  process.on('exit', () => process.stdout.write(ansi.showCursor));

  process.stdin.on('keypress', (str, key = {}) => {
    if ((key.ctrl && key.name === 'c') || str === 'q') {
      process.stdout.write(ansi.showCursor + '\n');
      process.exit(0);
    }
    if (views[Number(str) - 1]) {
      state.view = views[Number(str) - 1];
      state.query = '';
    } else if (str === '?') {
      state.view = 'palette';
    } else if (str === '/') {
      state.view = 'search';
      state.query = '';
    } else if (state.view === 'search') {
      if (key.name === 'backspace') state.query = state.query.slice(0, -1);
      else if (str && str >= ' ' && str <= '~') state.query += str;
    }
    draw();
  });

  draw();
}

function normalizeTranscript(text) {
  return text
    .replace(/\r/g, '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !/^WEBVTT/i.test(line) && !/^\d+$/.test(line) && !/^\d\d:\d\d/.test(line))
    .join('\n');
}

function firstSentence(value) {
  const protectedValue = value.replace(/\bDr\./g, 'Dr').replace(/\bProf\./g, 'Prof');
  const sentence = protectedValue.split(/[.!?]/)[0] || protectedValue;
  return truncate(sentence.trim(), 120);
}

function stripSpeaker(value) {
  if (/^(action|todo|decision|risk):/i.test(value)) return value.trim();
  return value.replace(/^[A-Z][A-Za-z .'-]{1,40}:\s*/, '').trim();
}

function createSuggestionsFromTranscript(text, source) {
  const normalized = normalizeTranscript(text);
  const lines = normalized.split('\n').filter(Boolean);
  const suggestions = [];

  for (const line of lines) {
    const content = stripSpeaker(line);
    const lower = content.toLowerCase();
    const isDecision = /\b(decided|decision|agreed|we will use|approved)\b/.test(lower);
    if (!isDecision && /\b(will|needs to|should|please|can you|action:|todo:)\b/.test(lower)) {
      suggestions.push({
        type: 'task',
        title: firstSentence(content.replace(/^(action:|todo:)/i, '').trim()),
        confidence: lower.includes('will') ? 0.88 : 0.76,
        quote: line,
        reason: 'Detected explicit commitment or assignment language.',
      });
    }
    if (isDecision) {
      suggestions.push({
        type: 'decision',
        title: firstSentence(content.replace(/^decision:\s*/i, '')),
        confidence: 0.83,
        quote: line,
        reason: 'Detected decision language suitable for the decision log.',
      });
    }
    if (/\b(risk|blocked|blocker|backorder|delayed|waiting|issue)\b/.test(lower)) {
      suggestions.push({
        type: 'risk',
        title: firstSentence(content),
        confidence: lower.includes('blocked') || lower.includes('risk') ? 0.86 : 0.74,
        quote: line,
        reason: 'Detected blocker or risk language requiring project attention.',
      });
    }
  }

  return suggestions.slice(0, 12).map((suggestion, index) => ({
    id: `sug-${Date.now()}-${index}`,
    status: 'pending',
    target: inferTarget(suggestion.quote),
    source,
    ...suggestion,
  }));
}

function inferTarget(text) {
  const lower = text.toLowerCase();
  if (lower.includes('tau') || lower.includes('at8') || lower.includes('perfusion')) return 'Tau Pathology Study';
  if (lower.includes('crispr') || lower.includes('library')) return 'CRISPR Screen';
  if (lower.includes('imaging') || lower.includes('segmentation')) return 'Imaging Pipeline';
  if (lower.includes('behavior') || lower.includes('open field')) return 'Behavioral Analysis';
  return 'Unassigned';
}

function importMeeting(file, options) {
  if (!file) throw new Error('Usage: lablink meeting import <file>');
  const context = loadStore(options);
  const absolute = path.resolve(file);
  const text = fs.readFileSync(absolute, 'utf8');
  const artifact = {
    id: `artifact-${Date.now()}`,
    meetingId: null,
    source: path.basename(file),
    kind: path.extname(file).replace('.', '') || 'text',
    status: 'processed',
    importedAt: new Date().toISOString(),
    excerpt: truncate(normalizeTranscript(text).replace(/\n/g, ' '), 220),
  };
  const suggestions = createSuggestionsFromTranscript(text, artifact.source);
  context.store.meetingArtifacts.push(artifact);
  context.store.aiSuggestions.push(...suggestions);
  context.store.auditLog.push({
    id: `audit-${Date.now()}`,
    at: new Date().toISOString(),
    actor: context.store.user.id,
    action: 'meeting_import',
    detail: `Imported ${artifact.source}; created ${suggestions.length} AI review suggestions.`,
  });
  saveStore(context);
  return { context, artifact, suggestions };
}

function approveSuggestion(id, options) {
  const context = loadStore(options);
  const suggestion = context.store.aiSuggestions.find((item) => item.id === id);
  if (!suggestion) throw new Error(`AI suggestion not found: ${id}`);
  if (suggestion.status === 'approved') return { context, suggestion, created: null };
  suggestion.status = 'approved';

  let created = null;
  const projectId = context.store.projects.find((project) => project.name === suggestion.target)?.id || null;
  if (suggestion.type === 'task' || suggestion.type === 'follow-up') {
    created = {
      id: `task-${Date.now()}`,
      title: suggestion.title,
      projectId,
      assignee: context.store.user.name,
      priority: suggestion.confidence >= 0.85 ? 'high' : 'medium',
      status: 'todo',
      due: null,
      source: suggestion.source,
      quote: suggestion.quote,
      reason: suggestion.reason,
      score: suggestion.confidence,
    };
    context.store.tasks.push(created);
  } else if (suggestion.type === 'risk') {
    created = {
      id: `risk-${Date.now()}`,
      severity: suggestion.confidence >= 0.85 ? 'high' : 'medium',
      projectId,
      title: suggestion.title,
      mitigation: 'Review owner, dependency, and mitigation in next project sync.',
    };
    context.store.risks.push(created);
  } else if (suggestion.type === 'decision') {
    context.store.decisions ||= [];
    created = {
      id: `decision-${Date.now()}`,
      projectId,
      title: suggestion.title,
      source: suggestion.source,
      quote: suggestion.quote,
    };
    context.store.decisions.push(created);
  }

  context.store.auditLog.push({
    id: `audit-${Date.now()}`,
    at: new Date().toISOString(),
    actor: context.store.user.id,
    action: 'ai_suggestion_approved',
    detail: `${suggestion.type}: ${suggestion.title}`,
  });
  saveStore(context);
  return { context, suggestion, created };
}

function rejectSuggestion(id, options) {
  const context = loadStore(options);
  const suggestion = context.store.aiSuggestions.find((item) => item.id === id);
  if (!suggestion) throw new Error(`AI suggestion not found: ${id}`);
  suggestion.status = 'rejected';
  context.store.auditLog.push({
    id: `audit-${Date.now()}`,
    at: new Date().toISOString(),
    actor: context.store.user.id,
    action: 'ai_suggestion_rejected',
    detail: `${suggestion.type}: ${suggestion.title}`,
  });
  saveStore(context);
  return { context, suggestion };
}

function listSuggestions(options) {
  const context = loadStore(options);
  for (const suggestion of context.store.aiSuggestions) {
    process.stdout.write(`${pad(suggestion.id, 24)} ${pad(suggestion.status, 10)} ${pad(suggestion.type, 10)} ${suggestion.title}\n`);
  }
}

function runTests() {
  const context = loadStore({ demo: true });
  const snapshot = render(context.store, { view: 'command' }, { width: 118, height: 34, color: false });
  assert(snapshot.includes('Command Center'), 'snapshot includes Command Center');
  assert(snapshot.includes('Tau Pathology Study'), 'snapshot includes demo project');
  const suggestions = createSuggestionsFromTranscript('Jordan will check AT8 suppliers.\nDecision: use cohort 2 for imaging.\nRisk: library QC is delayed.', 'test');
  assert(suggestions.length >= 3, 'transcript extraction creates suggestions');
  assert(suggestions.some((item) => item.type === 'task'), 'task suggestion exists');
  assert(suggestions.some((item) => item.type === 'decision'), 'decision suggestion exists');
  assert(suggestions.some((item) => item.type === 'risk'), 'risk suggestion exists');
  assert(!suggestions.some((item) => item.title === 'Dr'), 'honorifics do not become broken titles');
  const testStore = createSeedStore(DEFAULT_NOW);
  const pending = testStore.aiSuggestions.find((item) => item.status === 'pending');
  assert(Boolean(pending), 'pending suggestion exists in seed data');
  process.stdout.write('All bootstrap tests passed.\n');
}

function assert(condition, message) {
  if (!condition) throw new Error(`Test failed: ${message}`);
}

function build() {
  const distDir = path.join(PROJECT_ROOT, 'dist');
  ensureDir(distDir);
  const target = path.join(distDir, 'cli.js');
  fs.copyFileSync(__filename, target);
  fs.chmodSync(target, 0o755);
  process.stdout.write(`Built ${path.relative(PROJECT_ROOT, target)}\n`);
}

function check() {
  const packageJson = readJson(path.join(PROJECT_ROOT, 'package.json'), {});
  assert(packageJson.bin?.lablink, 'package bin exists');
  assert(fs.existsSync(path.join(PROJECT_ROOT, 'bin', 'lablink.mjs')), 'bootstrap runtime exists');
  assert(Number(process.versions.node.split('.')[0]) >= 20, 'Node.js >= 20');
  process.stdout.write('Static launch checks passed.\n');
}

function validate() {
  check();
  runTests();
  build();
  const context = loadStore({ demo: true });
  const snapshot = render(context.store, { view: 'command' }, { width: 118, height: 34, color: false });
  assert(snapshot.includes('AI Review'), 'validated snapshot includes AI Review navigation');
  process.stdout.write('Validation complete.\n');
}

function printHelp() {
  process.stdout.write(`${APP_NAME} ${VERSION}

Usage:
  lablink [demo] [--snapshot]
  lablink init
  lablink today [--snapshot]
  lablink meeting import <file>
  lablink ai list
  lablink ai approve <id>
  lablink ai reject <id>
  lablink sync
  lablink config
  lablink doctor

NPM:
  npm run demo
  npm run smoke
  npm run test
  npm run build
  npm run validate
`);
}

function parseOptions(args) {
  const options = { demo: args.includes('--demo'), snapshot: args.includes('--snapshot'), dataDir: null };
  const dataDirIndex = args.indexOf('--data-dir');
  if (dataDirIndex >= 0) options.dataDir = args[dataDirIndex + 1];
  return options;
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'demo';
  const options = parseOptions(args);
  if (command === '--help' || command === '-h' || command === 'help') return printHelp();
  if (command === 'build') return build();
  if (command === 'check' || command === 'doctor') return check();
  if (command === 'test') return runTests();
  if (command === 'validate') return validate();
  if (command === 'config') {
    const context = loadStore(options);
    process.stdout.write(`${context.file}\n`);
    return;
  }
  if (command === 'init' || command === 'seed') {
    const context = loadStore({ ...options, demo: options.demo || command === 'seed' });
    saveStore(context);
    process.stdout.write(`Initialized ${context.file}\n`);
    return;
  }
  if (command === 'meeting' && args[1] === 'import') {
    const result = importMeeting(args[2], { ...options, demo: true });
    process.stdout.write(`Imported ${result.artifact.source}; created ${result.suggestions.length} AI review suggestions.\n`);
    return;
  }
  if (command === 'ai' && args[1] === 'list') return listSuggestions({ ...options, demo: true });
  if (command === 'ai' && args[1] === 'approve') {
    const result = approveSuggestion(args[2], { ...options, demo: true });
    process.stdout.write(`Approved ${result.suggestion.id}; ${result.created ? `created ${result.created.id}` : 'already approved'}.\n`);
    return;
  }
  if (command === 'ai' && args[1] === 'reject') {
    const result = rejectSuggestion(args[2], { ...options, demo: true });
    process.stdout.write(`Rejected ${result.suggestion.id}.\n`);
    return;
  }
  if (command === 'sync') {
    const context = loadStore(options);
    for (const integration of context.store.integrations) {
      process.stdout.write(`${integration.label}: ${integration.status} - ${integration.nextStep}\n`);
    }
    return;
  }

  const view = command === 'today' ? 'today' : 'command';
  const context = loadStore({ ...options, demo: command === 'demo' || options.demo });
  if (options.snapshot || !process.stdin.isTTY) {
    process.stdout.write(`${render(context.store, { view }, { width: 118, height: 34, color: false })}\n`);
    return;
  }
  runInteractive(context);
}

try {
  main();
} catch (error) {
  process.stderr.write(`Lab Link error: ${error.message}\n`);
  process.exit(1);
}

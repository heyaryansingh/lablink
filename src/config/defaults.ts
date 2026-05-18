import { homedir } from 'node:os';
import { join } from 'node:path';
import { shouldUseAscii } from '../utils/terminal';
import type { LabLinkConfig } from './types';

export function defaultDataDir(): string {
  return process.env.LABLINK_DATA_DIR || join(homedir(), '.lablink');
}

export function createDefaultConfig(): LabLinkConfig {
  const dataDir = defaultDataDir();

  return {
    dataDir,
    lab: {
      name: 'Demo Lab',
      institution: 'Local Institution',
      timezone: process.env.TZ || 'America/Chicago',
    },
    user: {
      name: process.env.USER || process.env.USERNAME || 'Lab User',
      email: 'user@example.edu',
      role: 'grad_student',
    },
    display: {
      theme: 'dark',
      sidebarWidth: 24,
      ascii: shouldUseAscii(),
      dateFormat: 'MMM d, yyyy',
      timeFormat: 'h:mm a',
    },
    ai: {
      enabled: process.env.LABLINK_AI_PROVIDER !== 'off',
      defaultProvider: (process.env.LABLINK_AI_PROVIDER as LabLinkConfig['ai']['defaultProvider']) || 'auto',
      providers: {
        anthropic: {
          provider: 'anthropic',
          model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
          apiKeyEnv: 'ANTHROPIC_API_KEY',
          timeoutMs: 60_000,
        },
        openai: {
          provider: 'openai',
          model: process.env.OPENAI_MODEL || 'gpt-5.5',
          apiKeyEnv: 'OPENAI_API_KEY',
          timeoutMs: 60_000,
          reasoningEffort: 'high',
        },
        local: {
          provider: 'local',
          model: process.env.LABLINK_LOCAL_MODEL || 'local-model',
          baseUrl: process.env.LABLINK_LOCAL_AI_URL,
          timeoutMs: 60_000,
        },
      },
      autoTaskCreation: true,
      autoTaskThreshold: 0.9,
      dailyPriorityRecalc: true,
    },
    integrations: {
      microsoft: {
        enabled: Boolean(process.env.MICROSOFT_CLIENT_ID),
        clientId: process.env.MICROSOFT_CLIENT_ID,
        scopes: ['User.Read', 'Mail.Read', 'Mail.Send', 'Calendars.Read', 'Files.Read'],
        syncIntervalMinutes: 5,
      },
      google: {
        enabled: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3847/oauth2callback',
        scopes: [
          'https://www.googleapis.com/auth/gmail.readonly',
          'https://www.googleapis.com/auth/gmail.send',
          'https://www.googleapis.com/auth/gmail.modify',
          'https://www.googleapis.com/auth/drive.readonly',
          'https://www.googleapis.com/auth/calendar.readonly',
        ],
        syncIntervalMinutes: 5,
      },
      zoom: {
        enabled: Boolean(process.env.ZOOM_CLIENT_ID && process.env.ZOOM_CLIENT_SECRET),
        clientId: process.env.ZOOM_CLIENT_ID,
        clientSecret: process.env.ZOOM_CLIENT_SECRET,
        redirectUri: process.env.ZOOM_REDIRECT_URI || 'http://localhost:3848/oauth2callback',
        scopes: ['recording:read', 'meeting:read', 'user:read'],
        syncIntervalMinutes: 15,
      },
    },
    features: {
      animals: true,
      reagents: true,
      equipment: true,
      budget: true,
      safety: true,
      clinical: false,
      computational: true,
      zoom: true,
      oauth: true,
      ai: true,
      extensions: true,
    },
    extensions: {
      enabled: true,
      directories: [join(dataDir, 'extensions')],
    },
    animals: {
      speciesDefault: 'mouse',
      cageCapacityDefault: 5,
      ageMilestones: [42, 56, 70, 84],
    },
  };
}

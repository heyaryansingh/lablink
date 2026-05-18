import type { FeatureFlag, UserRole } from '../core/types';

export type AiProviderName = 'anthropic' | 'openai' | 'local' | 'custom' | 'auto';

export interface AiProviderConfig {
  provider: AiProviderName;
  model: string;
  apiKeyEnv?: string;
  baseUrl?: string;
  timeoutMs: number;
  reasoningEffort?: 'none' | 'low' | 'medium' | 'high' | 'xhigh';
}

export interface OAuthProviderConfig {
  enabled: boolean;
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
  scopes: string[];
  syncIntervalMinutes: number;
}

export interface LabLinkConfig {
  dataDir: string;
  lab: {
    name: string;
    institution: string;
    timezone: string;
  };
  user: {
    name: string;
    email: string;
    role: UserRole;
  };
  display: {
    theme: 'dark';
    sidebarWidth: number;
    ascii: boolean;
    dateFormat: string;
    timeFormat: string;
  };
  ai: {
    enabled: boolean;
    defaultProvider: AiProviderName;
    providers: Partial<Record<AiProviderName, AiProviderConfig>>;
    autoTaskCreation: boolean;
    autoTaskThreshold: number;
    dailyPriorityRecalc: boolean;
  };
  integrations: {
    microsoft: OAuthProviderConfig;
    google: OAuthProviderConfig;
    zoom: OAuthProviderConfig;
  };
  features: Record<FeatureFlag, boolean>;
  extensions: {
    enabled: boolean;
    directories: string[];
  };
  animals: {
    speciesDefault: string;
    cageCapacityDefault: number;
    ageMilestones: number[];
  };
}

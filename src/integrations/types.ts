export type IntegrationProvider = 'microsoft' | 'google' | 'zoom';

export interface OAuthTokenSet {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string;
  scope?: string;
  raw: unknown;
}

export interface SyncResult {
  provider: IntegrationProvider;
  resource: string;
  imported: number;
  updated: number;
  cursor?: string;
}

export interface ExternalInboxItem {
  source: string;
  sourceId: string;
  subject: string;
  preview?: string;
  fromLabel?: string;
  body?: string;
  receivedAt: string;
  raw: unknown;
}

import { google } from 'googleapis';
import type { LabLinkConfig } from '../config/types';
import type { CredentialStore } from '../utils/credentials';
import { openBrowser, waitForLoopbackCode } from './oauth';
import type { ExternalInboxItem, OAuthTokenSet } from './types';

export class GoogleIntegration {
  constructor(
    private readonly config: LabLinkConfig,
    private readonly credentials: CredentialStore,
  ) {}

  async authenticate(): Promise<OAuthTokenSet> {
    const googleConfig = this.config.integrations.google;
    if (!googleConfig.clientId || !googleConfig.clientSecret || !googleConfig.redirectUri) {
      throw new Error('GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and redirect URI are required.');
    }

    const client = new google.auth.OAuth2(
      googleConfig.clientId,
      googleConfig.clientSecret,
      googleConfig.redirectUri,
    );

    const url = client.generateAuthUrl({
      access_type: 'offline',
      scope: googleConfig.scopes,
      prompt: 'consent',
    });

    openBrowser(url);
    process.stderr.write(`Open this URL if your browser did not open:\n${url}\n`);
    const code = await waitForLoopbackCode({ redirectUri: googleConfig.redirectUri });
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    if (!tokens.access_token) {
      throw new Error('Google OAuth did not return an access token.');
    }

    const token: OAuthTokenSet = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token ?? undefined,
      expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : undefined,
      scope: tokens.scope,
      raw: tokens,
    };
    await this.credentials.set('lablink.oauth.google', 'default', JSON.stringify(token));
    return token;
  }

  async loadToken(): Promise<OAuthTokenSet | null> {
    const raw = await this.credentials.get('lablink.oauth.google', 'default');
    return raw ? (JSON.parse(raw) as OAuthTokenSet) : null;
  }

  async fetchInbox(limit = 25): Promise<ExternalInboxItem[]> {
    const googleConfig = this.config.integrations.google;
    const token = await this.loadToken();
    if (!token || !googleConfig.clientId || !googleConfig.clientSecret || !googleConfig.redirectUri) {
      throw new Error('Google account is not authenticated.');
    }

    const auth = new google.auth.OAuth2(googleConfig.clientId, googleConfig.clientSecret, googleConfig.redirectUri);
    auth.setCredentials({
      access_token: token.accessToken,
      refresh_token: token.refreshToken,
    });

    const gmail = google.gmail({ version: 'v1', auth });
    const list = await gmail.users.messages.list({ userId: 'me', maxResults: limit });
    const messages = list.data.messages ?? [];

    const items: ExternalInboxItem[] = [];
    for (const message of messages) {
      if (!message.id) continue;
      const detail = await gmail.users.messages.get({ userId: 'me', id: message.id, format: 'metadata' });
      const headers = detail.data.payload?.headers ?? [];
      const subject = headers.find((header) => header.name?.toLowerCase() === 'subject')?.value ?? '(no subject)';
      const from = headers.find((header) => header.name?.toLowerCase() === 'from')?.value;
      const date = headers.find((header) => header.name?.toLowerCase() === 'date')?.value;
      items.push({
        source: 'Gmail',
        sourceId: message.id,
        subject,
        preview: detail.data.snippet ?? undefined,
        fromLabel: from,
        receivedAt: date ? new Date(date).toISOString() : new Date().toISOString(),
        raw: detail.data,
      });
    }

    return items;
  }
}

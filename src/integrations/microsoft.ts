import { PublicClientApplication, type Configuration } from '@azure/msal-node';
import type { LabLinkConfig } from '../config/types';
import type { CredentialStore } from '../utils/credentials';
import type { ExternalInboxItem, OAuthTokenSet } from './types';

export class MicrosoftGraphIntegration {
  constructor(
    private readonly config: LabLinkConfig,
    private readonly credentials: CredentialStore,
  ) {}

  async authenticate(): Promise<OAuthTokenSet> {
    const msConfig = this.config.integrations.microsoft;
    if (!msConfig.clientId) {
      throw new Error('MICROSOFT_CLIENT_ID is required for Microsoft OAuth.');
    }

    const configuration: Configuration = {
      auth: {
        clientId: msConfig.clientId,
        authority: 'https://login.microsoftonline.com/common',
      },
    };

    const app = new PublicClientApplication(configuration);
    const result = await app.acquireTokenByDeviceCode({
      scopes: msConfig.scopes,
      deviceCodeCallback: (response) => {
        process.stderr.write(`${response.message}\n`);
      },
    });

    if (!result?.accessToken) {
      throw new Error('Microsoft OAuth did not return an access token.');
    }

    const token: OAuthTokenSet = {
      accessToken: result.accessToken,
      expiresAt: result.expiresOn?.toISOString(),
      scope: result.scopes.join(' '),
      raw: result,
    };

    await this.credentials.set('lablink.oauth.microsoft', 'default', JSON.stringify(token));
    return token;
  }

  async loadToken(): Promise<OAuthTokenSet | null> {
    const raw = await this.credentials.get('lablink.oauth.microsoft', 'default');
    return raw ? (JSON.parse(raw) as OAuthTokenSet) : null;
  }

  async fetchInbox(limit = 25): Promise<ExternalInboxItem[]> {
    const token = await this.loadToken();
    if (!token) throw new Error('Microsoft account is not authenticated.');

    const url = new URL('https://graph.microsoft.com/v1.0/me/mailFolders/Inbox/messages');
    url.searchParams.set('$top', String(limit));
    url.searchParams.set('$select', 'id,subject,bodyPreview,from,receivedDateTime');
    url.searchParams.set('$orderby', 'receivedDateTime desc');

    const response = await fetch(url, {
      headers: { authorization: `Bearer ${token.accessToken}` },
    });
    if (!response.ok) {
      throw new Error(`Microsoft Graph inbox sync failed: ${response.status} ${response.statusText}`);
    }

    const json = (await response.json()) as any;
    return (json.value ?? []).map((message: any) => ({
      source: 'Outlook',
      sourceId: message.id,
      subject: message.subject ?? '(no subject)',
      preview: message.bodyPreview,
      fromLabel: message.from?.emailAddress?.address,
      receivedAt: message.receivedDateTime,
      raw: message,
    }));
  }
}

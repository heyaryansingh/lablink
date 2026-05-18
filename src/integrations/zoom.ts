import type { LabLinkConfig } from '../config/types';
import type { CredentialStore } from '../utils/credentials';
import { buildQuery, openBrowser, waitForLoopbackCode } from './oauth';
import type { OAuthTokenSet } from './types';

export interface ZoomRecording {
  zoomMeetingId: string;
  topic?: string;
  startTime?: string;
  recordingUrl?: string;
  transcriptUrl?: string;
  raw: unknown;
}

export class ZoomIntegration {
  constructor(
    private readonly config: LabLinkConfig,
    private readonly credentials: CredentialStore,
  ) {}

  async authenticate(): Promise<OAuthTokenSet> {
    const zoomConfig = this.config.integrations.zoom;
    if (!zoomConfig.clientId || !zoomConfig.clientSecret || !zoomConfig.redirectUri) {
      throw new Error('ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET, and redirect URI are required.');
    }

    const url = `https://zoom.us/oauth/authorize?${buildQuery({
      response_type: 'code',
      client_id: zoomConfig.clientId,
      redirect_uri: zoomConfig.redirectUri,
    })}`;
    openBrowser(url);
    process.stderr.write(`Open this URL if your browser did not open:\n${url}\n`);
    const code = await waitForLoopbackCode({ redirectUri: zoomConfig.redirectUri });

    const response = await fetch('https://zoom.us/oauth/token', {
      method: 'POST',
      headers: {
        authorization: `Basic ${Buffer.from(`${zoomConfig.clientId}:${zoomConfig.clientSecret}`).toString('base64')}`,
        'content-type': 'application/x-www-form-urlencoded',
      },
      body: buildQuery({
        grant_type: 'authorization_code',
        code,
        redirect_uri: zoomConfig.redirectUri,
      }),
    });

    if (!response.ok) {
      throw new Error(`Zoom token exchange failed: ${response.status} ${response.statusText}`);
    }

    const json = (await response.json()) as any;
    const token: OAuthTokenSet = {
      accessToken: json.access_token,
      refreshToken: json.refresh_token,
      expiresAt: json.expires_in ? new Date(Date.now() + Number(json.expires_in) * 1000).toISOString() : undefined,
      scope: json.scope,
      raw: json,
    };
    await this.credentials.set('lablink.oauth.zoom', 'default', JSON.stringify(token));
    return token;
  }

  async loadToken(): Promise<OAuthTokenSet | null> {
    const raw = await this.credentials.get('lablink.oauth.zoom', 'default');
    return raw ? (JSON.parse(raw) as OAuthTokenSet) : null;
  }

  async listRecordings(from: string, to: string): Promise<ZoomRecording[]> {
    const token = await this.loadToken();
    if (!token) throw new Error('Zoom account is not authenticated.');

    const url = new URL('https://api.zoom.us/v2/users/me/recordings');
    url.searchParams.set('from', from);
    url.searchParams.set('to', to);
    const response = await fetch(url, {
      headers: { authorization: `Bearer ${token.accessToken}` },
    });
    if (!response.ok) {
      throw new Error(`Zoom recordings request failed: ${response.status} ${response.statusText}`);
    }

    const json = (await response.json()) as any;
    return (json.meetings ?? []).flatMap((meeting: any) => {
      const transcript = (meeting.recording_files ?? []).find((file: any) => file.file_type === 'TRANSCRIPT');
      const video = (meeting.recording_files ?? []).find((file: any) => file.file_type === 'MP4');
      return [
        {
          zoomMeetingId: String(meeting.id),
          topic: meeting.topic,
          startTime: meeting.start_time,
          recordingUrl: video?.download_url,
          transcriptUrl: transcript?.download_url,
          raw: meeting,
        },
      ];
    });
  }
}

import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { URL } from 'node:url';

export interface LoopbackCodeOptions {
  redirectUri: string;
  expectedPath?: string;
  timeoutMs?: number;
}

export async function waitForLoopbackCode(options: LoopbackCodeOptions): Promise<string> {
  const redirect = new URL(options.redirectUri);
  const expectedPath = options.expectedPath ?? redirect.pathname;
  const port = Number(redirect.port || 80);
  const timeoutMs = options.timeoutMs ?? 120_000;

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      server.close();
      reject(new Error('OAuth loopback timed out waiting for authorization code.'));
    }, timeoutMs);

    const server = createServer((request, response) => {
      if (!request.url) return;
      const requestUrl = new URL(request.url, options.redirectUri);
      if (requestUrl.pathname !== expectedPath) {
        response.writeHead(404);
        response.end('Not found');
        return;
      }
      const code = requestUrl.searchParams.get('code');
      const error = requestUrl.searchParams.get('error');
      response.writeHead(error ? 400 : 200, { 'content-type': 'text/plain' });
      response.end(error ? `Authorization failed: ${error}` : 'Authorization complete. You can return to Lab Link.');
      clearTimeout(timeout);
      server.close();
      if (error) reject(new Error(error));
      else if (!code) reject(new Error('OAuth provider did not return a code.'));
      else resolve(code);
    });

    server.listen(port, redirect.hostname);
  });
}

export function openBrowser(url: string): void {
  const platform = process.platform;
  const command =
    platform === 'darwin'
      ? 'open'
      : platform === 'win32'
        ? 'powershell'
        : 'xdg-open';
  const args =
    platform === 'win32'
      ? ['-NoProfile', '-WindowStyle', 'Hidden', '-Command', 'Start-Process', url]
      : [url];
  const child = spawn(command, args, {
    detached: true,
    stdio: 'ignore',
    windowsHide: true,
  });
  child.unref();
}

export function buildQuery(params: Record<string, string | string[] | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    search.set(key, Array.isArray(value) ? value.join(' ') : value);
  }
  return search.toString();
}

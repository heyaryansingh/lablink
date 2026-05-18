#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(__filename), '..');
const npm = 'npm';
const node = process.execPath;
const cacheDir = path.join(root, '.npm-cache');
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'lablink-release-'));
const packDir = path.join(tempRoot, 'pack');
const appDir = path.join(tempRoot, 'app');
const dataDir = path.join(tempRoot, 'data');

function childEnv() {
  return {
    ...process.env,
    NPM_CONFIG_CACHE: process.env.NPM_CONFIG_CACHE || cacheDir,
    npm_config_cache: process.env.npm_config_cache || process.env.NPM_CONFIG_CACHE || cacheDir,
  };
}

function commandFor(command, args) {
  const finalArgs = command === npm ? ['--cache', cacheDir, ...args] : args;
  if (process.platform === 'win32' && command === npm) {
    return {
      command: process.env.ComSpec || 'cmd.exe',
      args: ['/d', '/s', '/c', 'npm', ...finalArgs],
    };
  }
  return { command, args: finalArgs };
}

function run(command, args, options = {}) {
  const spec = commandFor(command, args);
  execFileSync(spec.command, spec.args, {
    cwd: options.cwd || root,
    stdio: 'inherit',
    env: childEnv(),
  });
}

function output(command, args, options = {}) {
  const spec = commandFor(command, args);
  return execFileSync(spec.command, spec.args, {
    cwd: options.cwd || root,
    encoding: 'utf8',
    env: childEnv(),
  }).trim();
}

try {
  fs.mkdirSync(cacheDir, { recursive: true });
  fs.mkdirSync(packDir, { recursive: true });
  fs.mkdirSync(appDir, { recursive: true });
  fs.mkdirSync(dataDir, { recursive: true });

  run(npm, ['run', 'validate']);
  run(npm, ['pack', '--pack-destination', packDir]);

  const tarball = fs.readdirSync(packDir).find((file) => file.endsWith('.tgz'));
  if (!tarball) throw new Error('npm pack did not create a tarball.');

  run(npm, ['init', '-y'], { cwd: appDir });
  run(npm, ['install', path.join(packDir, tarball)], { cwd: appDir });

  const cli = path.join(appDir, 'node_modules', 'lablink-cli', 'bin', 'lablink.mjs');
  const version = output(node, [cli, '--version'], { cwd: appDir });
  if (!/^0\.1\.0-beta\./.test(version)) throw new Error(`Unexpected CLI version: ${version}`);

  const smoke = output(node, [cli, 'smoke', '--data-dir', dataDir], { cwd: appDir });
  if (!smoke.includes('Command Center') || !smoke.includes('AI Review')) {
    throw new Error('Installed package smoke output did not include expected dashboard content.');
  }

  process.stdout.write(`Release check passed with ${tarball}.\n`);
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true });
}

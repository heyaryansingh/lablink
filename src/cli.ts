#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import { Command } from 'commander';
import App from './app';
import { createAppServices } from './services/appServices';

const program = new Command();

program
  .name('lablink')
  .version('0.1.0')
  .description('Terminal operating system for research labs')
  .option('--demo', 'Use repo-local demo data directory')
  .option('--data-dir <path>', 'Override Lab Link data directory')
  .action((options: { demo?: boolean; dataDir?: string }) => {
    const services = createAppServices({ demo: options.demo, dataDir: options.dataDir, seed: options.demo });
    render(React.createElement(App, { services }));
  });

program
  .command('demo')
  .description('Launch with seeded repo-local demo data')
  .option('--data-dir <path>', 'Override demo data directory')
  .action((options: { dataDir?: string }) => {
    const services = createAppServices({ demo: true, dataDir: options.dataDir, seed: true });
    render(React.createElement(App, { services }));
  });

program
  .command('today')
  .description('Launch directly into Today')
  .option('--demo', 'Use repo-local demo data directory')
  .option('--data-dir <path>', 'Override Lab Link data directory')
  .action((options: { demo?: boolean; dataDir?: string }) => {
    const services = createAppServices({ demo: options.demo, dataDir: options.dataDir, seed: options.demo });
    render(React.createElement(App, { services, initialView: 'today' }));
  });

program
  .command('init')
  .description('Initialize a lab workspace')
  .option('--demo', 'Initialize repo-local demo workspace')
  .option('--seed', 'Seed demo data after initialization')
  .option('--data-dir <path>', 'Override Lab Link data directory')
  .action((options: { demo?: boolean; seed?: boolean; dataDir?: string }) =>
    import('./commands/init').then((module) => module.default(options)),
  );

program
  .command('sync')
  .description('Run sync daemon or one sync cycle')
  .option('--once', 'Run one sync cycle and exit')
  .option('--demo', 'Use repo-local demo data directory')
  .option('--data-dir <path>', 'Override Lab Link data directory')
  .action((options: { once?: boolean; demo?: boolean; dataDir?: string }) =>
    import('./commands/sync').then((module) => module.default(options)),
  );

program
  .command('config')
  .description('Print active config path')
  .option('--demo', 'Use repo-local demo data directory')
  .option('--data-dir <path>', 'Override Lab Link data directory')
  .action((options: { demo?: boolean; dataDir?: string }) =>
    import('./commands/config').then((module) => module.default(options)),
  );

program.parse();

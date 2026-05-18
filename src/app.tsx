import React, { useMemo, useState } from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import type { AppServices } from './services/appServices';
import type { AppSnapshot } from './core/types';
import { colors } from './theme';
import { getTerminalSize } from './utils/terminal';
import { Sidebar, type MainView } from './components/layout/Sidebar';
import { StatusBar } from './components/layout/StatusBar';
import { CommandCenterView } from './components/views/CommandCenterView';
import { TodayView } from './components/views/TodayView';
import { ProjectHubView } from './components/views/ProjectHubView';
import { MeetingsView } from './components/views/MeetingsView';
import { SearchView } from './components/views/SearchView';
import { SettingsView } from './components/views/SettingsView';

export interface AppProps {
  services: AppServices;
  initialView?: MainView;
}

export function App({ services, initialView = 'command' }: AppProps): JSX.Element {
  const { exit } = useApp();
  const [view, setView] = useState<MainView>(initialView);
  const [snapshotVersion, setSnapshotVersion] = useState(0);
  const terminal = getTerminalSize();
  const snapshot = useMemo<AppSnapshot>(() => services.snapshot(), [services, snapshotVersion]);

  useInput((input, key) => {
    if (input === 'q' || key.ctrl && input === 'c') {
      services.close();
      exit();
    }
    if (key.ctrl && input === '1') setView('command');
    if (key.ctrl && input === '2') setView('today');
    if (key.ctrl && input === '3') setView('projects');
    if (key.ctrl && input === '4') setView('meetings');
    if (input === '/') setView('search');
    if (input === 'r') setSnapshotVersion((value) => value + 1);
  });

  const compact = terminal.columns < 80;
  const sidebarWidth = compact ? 0 : services.config.display.sidebarWidth;

  return (
    <Box flexDirection="column" width="100%">
      <Box borderStyle="round" borderColor={colors.border} flexDirection="row" minHeight={Math.max(terminal.rows - 2, 20)}>
        {!compact && (
          <Box width={sidebarWidth} borderStyle="single" borderTop={false} borderBottom={false} borderLeft={false} borderColor={colors.border}>
            <Sidebar activeView={view} setView={setView} snapshot={snapshot} />
          </Box>
        )}
        <Box flexGrow={1} flexDirection="column" paddingX={1}>
          <Header labName={services.config.lab.name} view={view} compact={compact} />
          {view === 'command' && <CommandCenterView snapshot={snapshot} />}
          {view === 'today' && <TodayView tasks={snapshot.todayTasks} />}
          {view === 'projects' && <ProjectHubView snapshot={snapshot} />}
          {view === 'meetings' && <MeetingsView meetings={snapshot.meetings} />}
          {view === 'search' && <SearchView search={services.search} />}
          {view === 'settings' && <SettingsView services={services} />}
        </Box>
      </Box>
      <StatusBar compact={compact} />
    </Box>
  );
}

function Header({ labName, view, compact }: { labName: string; view: MainView; compact: boolean }): JSX.Element {
  return (
    <Box justifyContent="space-between" marginBottom={1}>
      <Text bold color={colors.text}>
        Lab Link {compact ? '' : '-'} {labName}
      </Text>
      <Text color={colors.textMuted}>{viewLabel(view)}</Text>
    </Box>
  );
}

function viewLabel(view: MainView): string {
  switch (view) {
    case 'command':
      return 'Command Center';
    case 'today':
      return 'Today';
    case 'projects':
      return 'Projects';
    case 'meetings':
      return 'Meetings';
    case 'search':
      return 'Search';
    case 'settings':
      return 'Settings';
  }
}

export default App;

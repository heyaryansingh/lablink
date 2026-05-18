import React from 'react';
import { Box, Text } from 'ink';
import type { AppSnapshot } from '../../core/types';
import { colors } from '../../theme';

export type MainView = 'command' | 'today' | 'projects' | 'meetings' | 'search' | 'settings';

interface SidebarProps {
  activeView: MainView;
  setView: (view: MainView) => void;
  snapshot: AppSnapshot;
}

export function Sidebar({ activeView, snapshot }: SidebarProps): JSX.Element {
  return (
    <Box flexDirection="column" paddingX={1}>
      <Text bold color={colors.accent}>LAB LINK</Text>
      <Box marginTop={1} flexDirection="column">
        <NavItem label={`Inbox (${snapshot.inbox.filter((item) => item.unread).length})`} view="command" activeView={activeView} />
        <NavItem label={`Today (${snapshot.todayTasks.filter((task) => task.status !== 'done').length})`} view="today" activeView={activeView} />
        <NavItem label="Meetings" view="meetings" activeView={activeView} />
        <NavItem label="Search" view="search" activeView={activeView} />
        <NavItem label="Settings" view="settings" activeView={activeView} />
      </Box>
      <Box marginTop={1} flexDirection="column">
        <Text bold color={colors.textDim}>PROJECTS</Text>
        {snapshot.projects.slice(0, 8).map((project) => (
          <Text key={project.id} color={activeView === 'projects' ? colors.text : colors.textDim}>
            {'  '}{project.icon} {project.name}
          </Text>
        ))}
      </Box>
      <Box marginTop={1} flexDirection="column">
        <Text bold color={colors.textDim}>QUICK</Text>
        <Text color={colors.textDim}>n new task</Text>
        <Text color={colors.textDim}>/ search</Text>
        <Text color={colors.textDim}>r refresh</Text>
        <Text color={colors.textDim}>q quit</Text>
      </Box>
    </Box>
  );
}

function NavItem({ label, view, activeView }: { label: string; view: MainView; activeView: MainView }): JSX.Element {
  const active = view === activeView;
  return (
    <Text color={active ? colors.accent : colors.text}>
      {active ? '>' : ' '} {label}
    </Text>
  );
}

import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import type { AppSnapshot, ProjectSummary, TaskSummary } from '../../core/types';
import { colors, priorityColor } from '../../theme';
import { formatRelativeDue } from '../../utils/dates';
import { clampText } from '../../utils/terminal';

type ProjectTab = 'overview' | 'tasks' | 'timeline' | 'people' | 'animals' | 'docs' | 'chat';

const tabs: ProjectTab[] = ['overview', 'tasks', 'timeline', 'people', 'animals', 'docs', 'chat'];

export function ProjectHubView({ snapshot }: { snapshot: AppSnapshot }): JSX.Element {
  const [projectIndex, setProjectIndex] = useState(0);
  const [tab, setTab] = useState<ProjectTab>('overview');
  const project = snapshot.projects[projectIndex];

  useInput((input, key) => {
    if (key.leftArrow) setProjectIndex((value) => Math.max(0, value - 1));
    if (key.rightArrow) setProjectIndex((value) => Math.min(snapshot.projects.length - 1, value + 1));
    if (/^[1-7]$/.test(input)) setTab(tabs[Number(input) - 1] ?? 'overview');
    if (input === 'v') setTab(nextTab(tab));
  });

  if (!project) return <Text color={colors.textDim}>No projects yet.</Text>;

  const projectTasks = snapshot.todayTasks.filter((task) => task.projectName === project.name);

  return (
    <Box flexDirection="column">
      <Text bold color={colors.text}>{project.icon} {project.name}</Text>
      <Text color={colors.textDim}>{project.description}</Text>
      <Box marginY={1}>
        {tabs.map((item, index) => (
          <Text key={item} color={item === tab ? colors.accent : colors.textDim}>
            [{index + 1} {item}] 
          </Text>
        ))}
      </Box>
      {tab === 'overview' && <Overview project={project} />}
      {tab === 'tasks' && <ProjectTasks tasks={projectTasks} />}
      {tab === 'timeline' && <Placeholder title="Timeline" body="Dependency chain and Gantt rendering land in Phase 4." />}
      {tab === 'people' && <Placeholder title="People" body="Project member workload/training table lands in Phase 4." />}
      {tab === 'animals' && (
        snapshot.featureFlags.animals ? <Placeholder title="Animals" body="Colony view is feature-flagged and schema-backed." /> : <Placeholder title="Animals disabled" body="Enable the animals feature flag to show this module." />
      )}
      {tab === 'docs' && <Placeholder title="Documents" body="Linked document metadata is available in the data layer." />}
      {tab === 'chat' && <Placeholder title="Chat" body="Project-bound channels are schema-backed and land in the communications layer." />}
    </Box>
  );
}

function Overview({ project }: { project: ProjectSummary }): JSX.Element {
  const complete = project.totalTasks === 0 ? 0 : Math.round((project.completedTasks / project.totalTasks) * 100);
  return (
    <Box flexDirection="column">
      <Text color={colors.text}>Status: {project.status}</Text>
      <Text color={colors.text}>Tasks: {project.completedTasks}/{project.totalTasks} complete ({complete}%)</Text>
      <Text color={colors.text}>Next deadline: {project.nextDeadline ? formatRelativeDue(project.nextDeadline) : 'None'}</Text>
    </Box>
  );
}

function ProjectTasks({ tasks }: { tasks: TaskSummary[] }): JSX.Element {
  if (tasks.length === 0) return <Text color={colors.textDim}>No active tasks for this project in today view.</Text>;
  return (
    <Box flexDirection="column">
      {tasks.map((task) => (
        <Text key={task.id} color={colors.text}>
          {task.status.padEnd(12)} {clampText(task.title, 42).padEnd(44)} {formatRelativeDue(task.dueDate).padEnd(10)} <Text color={priorityColor(task.priority)}>{task.priority}</Text>
        </Text>
      ))}
    </Box>
  );
}

function Placeholder({ title, body }: { title: string; body: string }): JSX.Element {
  return (
    <Box flexDirection="column" borderStyle="single" borderColor={colors.border} paddingX={1}>
      <Text bold color={colors.text}>{title}</Text>
      <Text color={colors.textDim}>{body}</Text>
    </Box>
  );
}

function nextTab(tab: ProjectTab): ProjectTab {
  const index = tabs.indexOf(tab);
  return tabs[(index + 1) % tabs.length] ?? 'overview';
}

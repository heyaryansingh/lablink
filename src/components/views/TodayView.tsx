import React from 'react';
import { Box, Text } from 'ink';
import type { TaskSummary } from '../../core/types';
import { colors, priorityColor } from '../../theme';
import { formatRelativeDue } from '../../utils/dates';
import { clampText } from '../../utils/terminal';

export function TodayView({ tasks, compact = false }: { tasks: TaskSummary[]; compact?: boolean }): JSX.Element {
  const groups = groupByPriority(tasks.filter((task) => task.status !== 'cancelled'));
  return (
    <Box flexDirection="column">
      {(['critical', 'high', 'medium', 'low'] as const).map((priority) => (
        <Box key={priority} flexDirection="column" marginBottom={compact ? 0 : 1}>
          <Text bold color={priorityColor(priority)}>{priority.toUpperCase()}</Text>
          {(groups[priority] ?? []).map((task) => (
            <Box key={task.id} flexDirection="column" borderStyle={compact ? undefined : 'single'} borderColor={colors.border} paddingX={compact ? 0 : 1} marginBottom={1}>
              <Text color={task.status === 'done' ? colors.textMuted : colors.text}>
                {task.status === 'done' ? 'x' : '-'} {clampText(task.title, compact ? 76 : 90)}
              </Text>
              <Text color={colors.textDim}>
                {'  '}Due: {formatRelativeDue(task.dueDate)} | Project: {task.projectName ?? 'none'} | Source: {task.sourceType ?? 'manual'}
              </Text>
              {!compact && task.sourceQuote && (
                <Text color={colors.textMuted}>{'  '}"{clampText(task.sourceQuote, 84)}"</Text>
              )}
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  );
}

function groupByPriority(tasks: TaskSummary[]): Record<string, TaskSummary[]> {
  return tasks.reduce<Record<string, TaskSummary[]>>((acc, task) => {
    acc[task.priority] ??= [];
    acc[task.priority]!.push(task);
    return acc;
  }, {});
}

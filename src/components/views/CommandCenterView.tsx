import React from 'react';
import { Box, Text } from 'ink';
import type { AppSnapshot } from '../../core/types';
import { colors } from '../../theme';
import { formatDate } from '../../utils/dates';
import { clampText } from '../../utils/terminal';
import { TodayView } from './TodayView';

export function CommandCenterView({ snapshot }: { snapshot: AppSnapshot }): JSX.Element {
  return (
    <Box flexDirection="column">
      <Text bold color={colors.text}>INBOX</Text>
      <Box flexDirection="column" marginBottom={1}>
        {snapshot.inbox.map((item) => (
          <Box key={item.id} flexDirection="column" marginBottom={1}>
            <Text color={item.unread ? colors.accent : colors.text}>
              {item.unread ? '*' : 'o'} {formatDate(item.receivedAt, 'MMM d h:mm a')}  {item.source}  {clampText(item.subject, 56)}
            </Text>
            <Text color={colors.textDim}>
              {'  '}From: {item.fromLabel ?? 'unknown'} {item.projectName ? `-> Project: ${item.projectName}` : '-> No project match'}
            </Text>
            {item.preview && <Text color={colors.textMuted}>{'  '}{clampText(item.preview, 78)}</Text>}
          </Box>
        ))}
      </Box>
      <Text bold color={colors.text}>TODAY</Text>
      <TodayView tasks={snapshot.todayTasks.slice(0, 4)} compact />
    </Box>
  );
}

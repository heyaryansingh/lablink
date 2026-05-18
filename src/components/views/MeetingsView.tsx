import React from 'react';
import { Box, Text } from 'ink';
import type { MeetingSummary } from '../../core/types';
import { colors } from '../../theme';
import { formatDate } from '../../utils/dates';
import { clampText } from '../../utils/terminal';

export function MeetingsView({ meetings }: { meetings: MeetingSummary[] }): JSX.Element {
  return (
    <Box flexDirection="column">
      <Text bold color={colors.text}>MEETING INTELLIGENCE</Text>
      <Text color={colors.textDim}>Paste/file transcript ingestion and Zoom recording import share the same processor pipeline.</Text>
      <Box marginTop={1} flexDirection="column">
        {meetings.map((meeting) => (
          <Box key={meeting.id} flexDirection="column" marginBottom={1}>
            <Text color={colors.text}>
              {formatDate(meeting.date, 'MMM d h:mm a')}  {meeting.title}  [{meeting.status}]
            </Text>
            <Text color={colors.textDim}>
              {'  '}Type: {meeting.meetingType} | Actions extracted: {meeting.actionItemsExtracted ? 'yes' : 'no'}
            </Text>
            {meeting.summary && <Text color={colors.textMuted}>{'  '}{clampText(meeting.summary, 92)}</Text>}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

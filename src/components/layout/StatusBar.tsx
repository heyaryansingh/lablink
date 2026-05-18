import React from 'react';
import { Box, Text } from 'ink';
import { colors } from '../../theme';

export function StatusBar({ compact }: { compact: boolean }): JSX.Element {
  return (
    <Box justifyContent="space-between" paddingX={1}>
      <Text color={colors.textMuted}>
        {compact ? 'Ctrl+1..4 views' : 'Ctrl+1 Command  Ctrl+2 Today  Ctrl+3 Projects  Ctrl+4 Meetings'}
      </Text>
      <Text color={colors.textMuted}>/ search  r refresh  q quit</Text>
    </Box>
  );
}

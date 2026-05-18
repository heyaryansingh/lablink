import React from 'react';
import { Box, Text } from 'ink';
import type { AppServices } from '../../services/appServices';
import { colors } from '../../theme';

export function SettingsView({ services }: { services: AppServices }): JSX.Element {
  const { config } = services;
  return (
    <Box flexDirection="column">
      <Text bold color={colors.text}>CONFIGURATION</Text>
      <Text color={colors.text}>Data dir: {config.dataDir}</Text>
      <Text color={colors.text}>AI default: {config.ai.defaultProvider}</Text>
      <Text color={colors.text}>OpenAI model: {config.ai.providers.openai?.model ?? 'not configured'}</Text>
      <Text color={colors.text}>Anthropic model: {config.ai.providers.anthropic?.model ?? 'not configured'}</Text>
      <Box marginTop={1} flexDirection="column">
        <Text bold color={colors.textDim}>Features</Text>
        {Object.entries(config.features).map(([flag, enabled]) => (
          <Text key={flag} color={enabled ? colors.accent : colors.textMuted}>
            {enabled ? 'on ' : 'off'} {flag}
          </Text>
        ))}
      </Box>
      <Box marginTop={1} flexDirection="column">
        <Text bold color={colors.textDim}>Extensions</Text>
        {services.extensions.list().map((extension) => (
          <Text key={extension.id} color={colors.textDim}>
            {extension.id} {extension.version}
          </Text>
        ))}
      </Box>
    </Box>
  );
}

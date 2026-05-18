import React, { useState } from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import type { SearchResult } from '../../db/queries/search';
import { colors } from '../../theme';
import { clampText } from '../../utils/terminal';

export function SearchView({ search }: { search: (query: string) => SearchResult[] }): JSX.Element {
  const [query, setQuery] = useState('');
  const results = query.trim() ? search(query) : [];

  return (
    <Box flexDirection="column">
      <Box>
        <Text color={colors.text}>Search: </Text>
        <TextInput value={query} onChange={setQuery} />
      </Box>
      <Box marginTop={1} flexDirection="column">
        {results.map((result) => (
          <Text key={`${result.entityType}:${result.entityId}`} color={colors.text}>
            {result.entityType.padEnd(8)} {clampText(result.content, 88)}
          </Text>
        ))}
        {query.trim() && results.length === 0 && <Text color={colors.textDim}>No results.</Text>}
      </Box>
    </Box>
  );
}

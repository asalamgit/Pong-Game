import { JSX } from 'react';
import { Box, useMediaQuery } from '@mui/material';

import { Picture } from './components/Picture';
import { Stats } from './components/Stats';
import { Name } from './components/Name';
import { Dashboard } from './components/Dashboard';
import { useProfile } from './hooks/useProfile';

export function Profile(): JSX.Element {
  const { loading, user } = useProfile();
  const matches = useMediaQuery('(max-width: 1080px)');

  return (
    <Box sx={{ height: matches ? '' : 'var(--body-size)' }}>
      <Box
        paddingTop="1rem"
        display="flex"
        flexDirection="column"
        alignItems="center"
        gap="2rem"
        // bug when height is at 100%
        height="95%"
      >
        <Box display="flex" alignItems="center" justifyContent="center">
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap="0.5rem"
          >
            <Picture loading={loading} id={user?.id} />
            <Name loading={loading}>{user?.username}</Name>
            <Stats
              loading={loading}
              win={user?.profile?.victories}
              loses={user?.profile?.defeats}
              elo={user?.profile?.points}
            />
          </Box>
        </Box>
        <Dashboard loading={loading} id={user?.id ?? 1} />
      </Box>
    </Box>
  );
}

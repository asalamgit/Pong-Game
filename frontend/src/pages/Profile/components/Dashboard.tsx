import { Box, Skeleton, useMediaQuery } from '@mui/material';
import { DashboardItem } from './DashboardItem';
import { Friends } from './Friends';
import PeopleIcon from '@mui/icons-material/People';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import SettingsIcon from '@mui/icons-material/Settings';
import ShareIcon from '@mui/icons-material/Share';
import { Games } from './Games';
import { Settings } from './Settings';
import { useUser } from '@/core/hooks/useUser';
import { Info } from './Info';

type Props = {
  id: number;
  loading?: boolean;
};

export function Dashboard({ loading = false, id }: Props) {
  const { user } = useUser();
  const isMyProfile = user?.id === id;
  const matches = useMediaQuery('(max-width: 1080px)');

  return (
    <Box
      display="flex"
      flexDirection={matches ? 'column' : 'row'}
      alignItems="center"
      justifyContent="center"
      gap="2rem"
      height="100%"
      width="80%"
    >
      {loading ? (
        <>
          <Skeleton variant="rounded" height="100%" width="33%" />
          <Skeleton variant="rounded" height="100%" width="33%" />
          <Skeleton variant="rounded" height="100%" width="33%" />
        </>
      ) : (
        <>
          <DashboardItem
            title="Friends"
            titleIcon={<PeopleIcon color="action" fontSize="large" />}
          >
            <Friends id={id} />
          </DashboardItem>
          {isMyProfile ? (
            <DashboardItem
              title="Settings"
              titleIcon={<SettingsIcon color="action" fontSize="large" />}
            >
              <Settings />
            </DashboardItem>
          ) : (
            <DashboardItem
              title="Info"
              titleIcon={<ShareIcon color="action" fontSize="large" />}
            >
              <Info id={id} />
            </DashboardItem>
          )}
          <DashboardItem
            title="Game"
            titleIcon={<SportsEsportsIcon color="action" fontSize="large" />}
          >
            <Games id={id} />
          </DashboardItem>
        </>
      )}
    </Box>
  );
}

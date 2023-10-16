import { Box, Skeleton } from '@mui/material';
import { Stat } from './Stat';

type Props = {
  win?: number;
  loses?: number;
  elo?: number;
  loading?: boolean;
};

export function Stats({ loading = false, win = 0, loses = 0, elo = 0 }: Props) {
  return (
    <Box display="flex" alignItems="center" justifyContent="center" gap="2rem">
      {loading ? (
        <>
          <Skeleton width={120} height={80} />
          <Skeleton width={120} height={80} />
          <Skeleton width={120} height={80} />
        </>
      ) : (
        <>
          <Stat value={win} type="Won" />
          <Stat value={loses} type="Lost" />
          <Stat value={elo} type="Elo" />
        </>
      )}
    </Box>
  );
}

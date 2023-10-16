import { Box, CircularProgress, Divider, Typography } from '@mui/material';
import { useGames } from '../hooks/useGames';
import { Fragment } from 'react';
import { UserPicture } from '@/ui/UserPicture/UserPicture';

type Props = {
  id: number;
};

export function Games({ id }: Props) {
  const { games, loading } = useGames(id);

  return !loading && games.length > 0 ? (
    games.map((game, index) => (
      <Fragment key={game.id}>
        {index !== 0 && <Divider variant="middle" />}
        <Box
          display="flex"
          alignItems="center"
          gap="1rem"
          justifyContent="space-between"
          padding="1rem"
        >
          <Box display="flex" alignItems="center" gap="1rem">
            <UserPicture
              id={game.player1.user?.id ?? 0}
              alt={`${game.player1.user?.username} avatar`}
              state={game.player1.user?.state}
            />
            <Box>
              <Typography>{game.player1.user?.username}</Typography>
              <Typography>{game.playerRanking}</Typography>
            </Box>
          </Box>

          <Typography>
            {game.score[0]} - {game.score[1]}
          </Typography>
          <Box display="flex" alignItems="center" gap="1rem">
            <Box>
              <Typography>{game.player2.user?.username}</Typography>
              <Typography>{game.opponentRanking}</Typography>
            </Box>
            <UserPicture
              id={game.player2.user?.id ?? 0}
              alt={`${game.player2.user?.username} avatar`}
              state={game.player2.user?.state}
            />
          </Box>
        </Box>
      </Fragment>
    ))
  ) : (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      height="100%"
    >
      {loading ? <CircularProgress /> : <Typography>No Games</Typography>}
    </Box>
  );
}

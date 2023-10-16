import { useApi } from '@/core/hooks/useApi';
import { Game } from '@/core/types/Game';
import { useEffect, useState } from 'react';

type ProfileGame = Pick<
  Game,
  | 'id'
  | 'opponentRanking'
  | 'playerRanking'
  | 'player1'
  | 'player2'
  | 'score'
  | 'createdAt'
>;

type ApiResponse = {
  profile: {
    gamesHistoryHome: ProfileGame[];
    gamesHistoryAway: ProfileGame[];
  };
};

export function useGames(id: number) {
  const [loading, setLoading] = useState(true);
  const [games, setGames] = useState<ProfileGame[]>([]);
  const { api } = useApi();

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await api.get<ApiResponse>(`/api/users/${id}/game`);

        const newGames = [
          ...response.data.profile.gamesHistoryAway,
          ...response.data.profile.gamesHistoryHome,
        ];

        newGames.sort((a, b) => {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime();
        });

        setGames(newGames);
      } catch {
        // do nothing
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [api, id]);

  return { games, loading };
}

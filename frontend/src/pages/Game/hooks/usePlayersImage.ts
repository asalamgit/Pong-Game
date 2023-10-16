import { useFile } from '@/core/hooks/useFile';
import { User } from '@/core/types/User';

export function usePlayersImage(
  player1Profile: User | null,
  player2Profile: User | null
) {
  const { imageUrl: imageUrl1 } = useFile(
    player1Profile ? player1Profile.id : undefined
  );
  const { imageUrl: imageUrl2 } = useFile(
    player2Profile ? player2Profile.id : undefined
  );

  return { playersImages: [imageUrl1, imageUrl2] };
}

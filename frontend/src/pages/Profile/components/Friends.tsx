import { useFriends } from '@/core/hooks/useFriends';
import { Box, Divider, Typography } from '@mui/material';
import { UserPicture } from '@/ui/UserPicture/UserPicture';
import { ContextMenu } from '@/ui/ContextMenu/ContextMenu';
import { MenuOption } from '@/ui/ContextMenu/MenuOption';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '@/core/hooks/useUser';

type Props = {
  id: number;
};

export function Friends({ id }: Props) {
  const { friends } = useFriends(id);
  const { user } = useUser();
  const navigate = useNavigate();

  return friends.length > 0 ? (
    friends.map((friend, index: number) => (
      <ContextMenu
        key={friend.id}
        menu={
          <>
            <MenuOption onClick={() => navigate(`/profile/${friend.id}`)}>
              Profile
            </MenuOption>
            {user?.id !== friend.id && (
              <MenuOption>
                <Link
                  to={'/game'}
                  state={{ opponent: friend.id }}
                  style={{ color: 'white' }}
                >
                  Invite to play
                </Link>
              </MenuOption>
            )}
          </>
        }
      >
        {index !== 0 && <Divider variant="middle" />}
        <Box display="flex" alignItems="center" gap="1rem" padding="1rem">
          <UserPicture
            id={friend.id}
            alt={`${friend.username} avatar`}
            state={friend.state}
          />
          {friend.username}
        </Box>
      </ContextMenu>
    ))
  ) : (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      height="100%"
    >
      <Typography>No Friends</Typography>
    </Box>
  );
}

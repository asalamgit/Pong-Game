import { useFriends } from '@/core/hooks/useFriends';
import { useUser } from '@/core/hooks/useUser';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import GroupRemoveIcon from '@mui/icons-material/GroupRemove';
import { Box, Button } from '@mui/material';

type Props = {
  id: number;
};

export function Info({ id }: Props) {
  const { user } = useUser();
  const { addFriend, deleteFriend, friends } = useFriends(id);

  const isFriendship =
    friends.findIndex((friend) => friend.id === user?.id) !== -1;

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      gap="2rem"
      marginTop="1rem"
    >
      <Button
        variant="outlined"
        onClick={() => {
          isFriendship ? deleteFriend(id) : addFriend(id);
        }}
        startIcon={isFriendship ? <GroupRemoveIcon /> : <GroupAddIcon />}
      >
        {isFriendship ? 'Remove friend' : 'Add friend'}
      </Button>
    </Box>
  );
}

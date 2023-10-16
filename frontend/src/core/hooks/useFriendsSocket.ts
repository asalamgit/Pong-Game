import { useContext } from 'react';
import { friendsSocketContext } from '../context/friendsSocketContext';

export function useFriendsSocket() {
  const value = useContext(friendsSocketContext);
  if (!value) {
    throw new Error(
      'useFriendsSocket can only be used in children of FriendsSocketProvider'
    );
  }
  return value;
}

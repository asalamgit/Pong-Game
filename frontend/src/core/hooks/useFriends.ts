import { Notification } from '@/ui/Notifications/types/Notification';
import { User } from '../types/User';
import { useFriendsSocket } from './useFriendsSocket';
import { useState, useEffect } from 'react';

export function useFriends(id?: number) {
  const { socket } = useFriendsSocket();
  const [friends, setFriends] = useState<User[]>([]);

  const newFriend = (friend: User) => setFriends((prev) => [...prev, friend]);

  const removeFriend = (friendId: number) => {
    setFriends((prev) => {
      const index = prev.findIndex((friend) => friend.id === friendId);

      if (index !== -1) {
        const newFriends = [...prev];
        newFriends.splice(index, 1);
        return newFriends;
      }
      return prev;
    });
  };

  const getFriends = (friendsList: User[]) => setFriends(friendsList);

  useEffect(() => {
    if (!socket) return;

    socket.on('friends', getFriends);
    socket.on('newFriends', newFriend);
    socket.on('deleteFriends', removeFriend);

    if (id) socket.emit('friends', { id });

    return () => {
      socket.off('newFriends', newFriend);
      socket.off('deleteFriends', removeFriend);
      socket.off('friends', getFriends);
    };
  }, [id, socket]);

  const addFriend = (id: number) => socket?.emit('addFriend', { id });

  const deleteFriend = (id: number) => socket?.emit('deleteFriend', { id });

  const declineInvite = (notification: Notification) => {
    socket?.emit('declineInvite', {
      type: notification.type,
      userId: notification.owner.id,
      targetId: notification.target.id,
    });
  };

  return { friends, addFriend, deleteFriend, declineInvite };
}

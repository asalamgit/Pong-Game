/* eslint-disable react-hooks/exhaustive-deps */
import { useChatSocket } from '@/core/hooks/useChatSocket';
import { useEffect, useState } from 'react';
import { ChannelUser } from '../types/Chat';

export function useUsersChannel(channelId: string | undefined) {
  const [usersBanList, setUsersBanList] = useState<ChannelUser[]>([]);
  const [usersChannelList, setUsersChannelList] = useState<ChannelUser[]>([]);
  const [directMessageList, setDirectMessageList] = useState<ChannelUser[]>();
  const { socket } = useChatSocket();

  useEffect(() => {
    socket?.on('newUserInChannel', (channelId: string) => {
      if (channelId) getUsersChannelList(channelId);
    });

    socket?.on('reset', (id: string) => {
      if (id) getUsersChannelList(id);
    });

    return () => {
      socket?.off('newUserInChannel');
      socket?.off('reset');
    };
  }, [socket]);

  useEffect(() => {
    if (channelId) getUsersChannelList(channelId);
  }, [channelId, socket]);

  const getUsersChannelList = (channelId: string) => {
    socket?.emit(
      'getUsersChannel',
      { id: channelId },
      (response: ChannelUser[]) => setUsersChannelList(response)
    );
    socket?.emit(
      'getUsersBanChannel',
      { id: channelId },
      (response: ChannelUser[]) => setUsersBanList(response)
    );
  };

  const getUsersDirectMessage = () => {
    socket?.emit('getDirectMessageList', (users: ChannelUser[]) =>
      setDirectMessageList(users)
    );
  };

  return {
    usersBanList,
    usersChannelList,
    directMessageList,
    getUsersDirectMessage,
  };
}

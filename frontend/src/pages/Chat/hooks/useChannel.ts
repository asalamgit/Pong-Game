import {
  Channel,
  ChannelUser,
  CreateChannel,
  Type,
  UserActions,
} from '@/pages/Chat/types/Chat';
import { useEffect, useState } from 'react';
import { useChatSocket } from '@/core/hooks/useChatSocket';
import { useUser } from '@/core/hooks/useUser';
import { useAuth } from '@/core/hooks/useAuth';
import { useRefeshToken } from '@/core/hooks/useRefreshToken';
import { toast } from 'react-toastify';

export function useChannel() {
  const { socket } = useChatSocket();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel>();
  const [directMessages, setDirectMessages] = useState<Channel[]>([]);
  const { user } = useUser();
  const { setAuth } = useAuth();
  const { refresh } = useRefeshToken();

  useEffect(() => {
    socket?.on('exception', async (err) => {
      try {
        if (err.error === 'Token expired') {
          const { accessToken, needTwoFa } = await refresh();
          setAuth({ accessToken, needTwoFa });
        }
        toast(err.message);
      } catch {
        //
      }
    });

    socket?.on('directMessageChannel', (channel: Channel) => {
      setDirectMessages((prev) => [...prev, channel]);
    });

    socket?.on('channel', (channel: Channel) => {
      setChannels((prev) => [...prev, channel]);
    });

    socket?.on('channels', (channels: Channel[]) => {
      setChannels(channels);
    });

    socket?.on('leaveChannel', (channelId: string) => {
      leaveChannel(channelId);
    });

    socket?.on('updateChannel', (channel: Channel) => {
      setSelectedChannel(channel);
    });

    socket?.on('userHasBeenKick', () => {
      setSelectedChannel(undefined);
      socket?.emit('findAllChannel', (channels: Channel[]) => {
        setChannels(channels);
      });
    });

    socket?.emit('findAllChannel', (channels: Channel[]) => {
      if (channels) setChannels(channels);
    });

    socket?.emit('findAllDirectMessageChannel', (directMessages: Channel[]) => {
      setDirectMessages(directMessages);
    });

    return () => {
      socket?.off('exception');
      socket?.off('channels');
      socket?.off('directMessageChannel');
      socket?.off('updateChannel');
      socket?.off('channel');
      socket?.off('userHasBeenKick');
    };
  }, [socket]);

  const editChannel = (data: CreateChannel) => {
    socket?.emit('updateChannel', { ...data, id: selectedChannel?.id });
  };

  const createChannel = (data: CreateChannel) => {
    switch (data.type) {
      case Type.PROTECTED:
        socket?.emit('createProtectedChannel', data, (channel: Channel) => {
          joinChannel(channel.id, data.password);
        });
        break;
      case Type.DIRECT_MESSAGE:
        socket?.emit('createDirectMessageChannel', data, (channel: Channel) => {
          setDirectMessages((prevChannels) => [...prevChannels, channel]);
          joinChannel(channel.id);
        });
        break;
      default:
        socket?.emit('createChannel', data, (channel: Channel) => {
          joinChannel(channel.id);
        });
    }
  };

  const joinChannel = (channelId: string, password?: string) => {
    socket?.emit(
      'joinChannel',
      { id: channelId, password },
      (channel: Channel) => {
        if (!channel) return;
        setSelectedChannel(channel);
      }
    );
  };

  const leaveChannel = (channelId: string) => {
    socket?.emit('leaveChannel', { id: channelId });
    setSelectedChannel(undefined);
  };

  const directMessagesExist = (username: string) => {
    if (!user) return;
    socket?.emit('directMessagesExist', { username }, (iSexist: boolean) => {
      if (!iSexist) {
        createChannel({
          name: `${username} ${user.username}`,
          description: 'direct message',
          type: Type.DIRECT_MESSAGE,
          password: '',
        });
      }
    });
  };

  const userQuit = (userId: number | undefined) => {
    if (userId)
      socket?.emit(
        'userQuit',
        { userId, channelId: selectedChannel?.id },
        (channels: Channel[]) => {
          if (channels) setChannels(channels);
        }
      );
    setSelectedChannel(undefined);
  };

  const manageUser = (
    type: UserActions,
    user: ChannelUser,
    timeMute?: number
  ) => {
    switch (type) {
      case UserActions.Kick:
        socket?.emit('kickUser', {
          userId: user.id,
          channelId: selectedChannel?.id,
        });
        break;
      case UserActions.Ban:
        if (user.isBan)
          socket?.emit('unbanuser', {
            userId: user.id,
            channelId: selectedChannel?.id,
          });
        else
          socket?.emit('banuser', {
            userId: user.id,
            channelId: selectedChannel?.id,
          });
        break;
      case UserActions.Block:
        blockUser(user.id, user.isBlocked);
        break;
      case UserActions.Mute:
        socket?.emit('muteUser', {
          userId: user.id,
          channelId: selectedChannel?.id,
          timeMute,
        });
        break;
      case UserActions.SetAsAdmin:
        socket?.emit('setAsAdmin', {
          userId: user.id,
          channelId: selectedChannel?.id,
        });
        break;
      case UserActions.UnsetAsAdmin:
        socket?.emit('unsetAsAdmin', {
          userId: user.id,
          channelId: selectedChannel?.id,
        });
    }
  };

  const blockUser = async (userId: number, isBlocked: boolean) => {
    try {
      if (isBlocked)
        socket?.emit('unblock', { userId, channelId: selectedChannel?.id });
      else socket?.emit('block', { userId, channelId: selectedChannel?.id });
    } catch {
      // do nothing
    }
  };

  return {
    channels,
    selectedChannel,
    directMessages,
    editChannel,
    userQuit,
    manageUser,
    blockUser,
    joinChannel,
    leaveChannel,
    createChannel,
    directMessagesExist,
  };
}

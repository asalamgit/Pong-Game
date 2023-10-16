/* eslint-disable react-hooks/exhaustive-deps */
import { Channel, MessageType } from '@/pages/Chat/types/Chat';
import { useEffect, useState } from 'react';
import { useChatSocket } from '@/core/hooks/useChatSocket';

export function useMessage(channelId: string | undefined) {
  const { socket } = useChatSocket();
  const [messages, setMessages] = useState<MessageType[]>([]);

  useEffect(() => {
    if (channelId) getMessages(channelId);
  }, [channelId, socket]);

  useEffect(() => {
    socket?.on('message', (channelId: string) => {
      getMessages(channelId);
    });

    socket?.on('clearMessages', () => {
      setMessages([]);
    });

    socket?.on('reset', (id: string) => {
      if (id) getMessages(id);
    });

    return () => {
      socket?.off('message');
      socket?.off('reset');
      socket?.off('clearMessages');
    };
  }, [socket]);

  const sendMessage = (content: string, channel: Channel) => {
    if (!content) return;
    socket?.emit('createMessage', {
      content,
      channel,
      isInfo: false,
    });
  };

  const getMessages = (channelId: string) => {
    if (channelId)
      socket?.emit(
        'getMessages',
        { id: channelId },
        (response: MessageType[]) => setMessages(response)
      );
  };

  return {
    messages,
    sendMessage,
  };
}

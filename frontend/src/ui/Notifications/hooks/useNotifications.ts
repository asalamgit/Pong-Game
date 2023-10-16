import { useApi } from '@/core/hooks/useApi';
import { useFriendsSocket } from '@/core/hooks/useFriendsSocket';
import { useState, useEffect } from 'react';
import { Notification } from '../types/Notification';

export function useNotifications() {
  const { socket: friendsSocket } = useFriendsSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { api } = useApi();

  useEffect(() => {
    const getNotifications = async () => {
      try {
        const response = await api.get('/api/notifications');
        setNotifications(response.data);
      } catch {
        // do nothing
      }
    };

    getNotifications();
  }, [api]);

  useEffect(() => {
    if (!friendsSocket) return;

    const newNotification = (notification: Notification) =>
      setNotifications((prev) => [...prev, notification]);

    const removeNotification = (notification: Notification) => {
      setNotifications((prev) => {
        const index = prev.findIndex((notif) => notif.id === notification.id);

        if (index !== -1) {
          const newNotifications = [...prev];
          newNotifications.splice(index, 1);
          return newNotifications;
        }
        return prev;
      });
    };

    friendsSocket.on('newNotification', newNotification);
    friendsSocket.on('deleteNotification', removeNotification);

    return () => {
      friendsSocket.removeAllListeners('newNotification');
      friendsSocket.removeAllListeners('deleteNotification');
    };
  }, [friendsSocket]);

  return { notifications };
}

import { useGameSocket } from '@/core/hooks/useGameSocket';
import { useEffect, useState } from 'react';
import { useUser } from './useUser';
import { useNavigate } from 'react-router-dom';
import { CurrentInvitations } from '../types/Invitation';

export function useInvitation() {
  const { socket } = useGameSocket();
  const { user } = useUser();
  const navigate = useNavigate();

  const [currentInvitations, setCurrentInvitations] = useState<
    CurrentInvitations[]
  >([]);
  const [isToastVisible, setIsvisible] = useState(false);

  useEffect(() => {
    if (!socket || !user) return;

    socket.emit('joinInvitationRoom', user.id);

    socket.on('invitation', invitationListener);

    socket.on('invitationCancelled', invitationCancelledListener);

    return () => {
      socket.emit('leaveInvitationRoom', user.id);
      socket.off('invitation', invitationListener);
    };
  }, [socket, currentInvitations]);

  const invitationListener = (data: CurrentInvitations) => {
    setCurrentInvitations([...currentInvitations, data]);
    openToast();
  };

  const invitationCancelledListener = (opponentId: number) => {
    const tab = currentInvitations.filter(
      (invitation: CurrentInvitations) => invitation.opponentId !== opponentId
    );
    setCurrentInvitations(tab);
  };

  const handleAccept = (opponentId: number, mode: string) => {
    if (socket && user) {
      currentInvitations.forEach((invitation: CurrentInvitations) => {
        if (invitation.opponentId === opponentId) {
          socket.emit('acceptInvitation', {
            userId: user.id,
            opponentId: opponentId,
            mode: mode,
          });
        } else {
          socket.emit('declineInvitation', {
            username: user.username,
            opponentId: invitation.opponentId,
          });
        }
      });
    }
    navigate('/game');
  };

  const handleDecline = (opponentId: number) => {
    socket &&
      user &&
      socket.emit('declineInvitation', {
        username: user.username,
        opponentId: opponentId,
      });
  };

  const openToast = () => {
    setIsvisible(true);
  };

  const closeToast = () => {
    setIsvisible(false);
  };

  return {
    currentInvitations,
    handleAccept,
    handleDecline,
    isToastVisible,
    closeToast,
  };
}

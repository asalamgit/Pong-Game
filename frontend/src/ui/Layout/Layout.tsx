import { JSX } from 'react';
import { Header } from '..';

import { Outlet } from 'react-router-dom';
import Toast from '@/pages/Game/Components/Toast/Toast';
import { useInvitation } from '@/core/hooks/useInvitation';
import { CurrentInvitations } from '@/core/types/Invitation';

export function Layout(): JSX.Element {
  const {
    currentInvitations,
    handleAccept,
    handleDecline,
    isToastVisible,
    closeToast,
  } = useInvitation();

  const textMode = (mode: string) => {
    if (mode === 'normal') return '';
    else if (mode === 'speedBall') return 'speed ball';
    else if (mode === 'paddleReduce') return 'paddle reduce';
  };

  return (
    <div>
      {currentInvitations.map(
        (invitation: CurrentInvitations, index: number) => (
          <Toast
            key={index}
            message={
              invitation &&
              invitation.opponentName +
                ' wants to play a ' +
                textMode(invitation.mode) +
                ' game with you'
            }
            onAccept={() =>
              handleAccept(invitation.opponentId, invitation.mode)
            }
            onDecline={() => handleDecline(invitation.opponentId)}
            isToastVisible={isToastVisible}
            closeToast={closeToast}
            index={index}
          />
        )
      )}
      <Header />
      <main>
        <Outlet />
      </main>
    </div>
  );
}

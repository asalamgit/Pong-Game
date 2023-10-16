import { JSX, ReactNode, useEffect, useState } from 'react';
import { gameSocketContext } from '../context/gameSocketContext';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';

type Props = {
  children: ReactNode;
};

export function GameSocketProvider({ children }: Props): JSX.Element {
  const [socket, setSocket] = useState<Socket>();
  const { auth } = useAuth();

  useEffect(() => {
    const _socket = io(`ws://${window.location.hostname}:3000/game`, {
      query: { token: auth?.accessToken },
    });
    setSocket(_socket);

    return () => {
      _socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.accessToken]);

  return (
    <gameSocketContext.Provider value={{ socket }}>
      {children}
    </gameSocketContext.Provider>
  );
}

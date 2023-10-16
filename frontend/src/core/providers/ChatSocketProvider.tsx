import { JSX, ReactNode, useEffect, useState } from 'react';
import { chatSocketContext } from '../context/chatSocketContext';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';

type Props = {
  children: ReactNode;
};

export function ChatSocketProvider({ children }: Props): JSX.Element {
  const { auth } = useAuth();
  const [socket, setSocket] = useState<Socket>();

  useEffect(() => { 
    const _socket = io(`ws://${window.location.hostname}:3000/chat`, {
      query: { token: auth?.accessToken },
    });
    setSocket(_socket);

    return () => {
      _socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.accessToken]);

  return (
    <chatSocketContext.Provider value={{ socket }}>
      {children}
    </chatSocketContext.Provider>
  );
}

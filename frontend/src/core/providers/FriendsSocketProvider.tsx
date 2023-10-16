import { Socket, io } from 'socket.io-client';
import { friendsSocketContext } from '../context/friendsSocketContext';
import { useState, useEffect, ReactNode, JSX } from 'react';
import { useAuth } from '../hooks/useAuth';

type Props = {
  children: ReactNode;
};

export function FriendsSocketProvider({ children }: Props): JSX.Element {
  const [socket, setSocket] = useState<Socket>();
  const { auth } = useAuth();

  useEffect(() => {
    const _socket = io(`ws://${window.location.hostname}:3000/friends`, {
      query: { token: auth.accessToken },
    });
    setSocket(_socket);

    return () => {
      _socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.accessToken]);

  return (
    <friendsSocketContext.Provider value={{ socket }}>
      {children}
    </friendsSocketContext.Provider>
  );
}

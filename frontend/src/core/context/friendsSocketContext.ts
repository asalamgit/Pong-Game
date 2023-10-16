import { createContext } from 'react';
import { Socket } from 'socket.io-client';

type FriendsSocketContext = {
  socket: Socket | undefined;
};

export const friendsSocketContext = createContext<
  FriendsSocketContext | undefined
>(undefined);

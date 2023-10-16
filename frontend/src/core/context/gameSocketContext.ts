import { createContext } from 'react';
import { Socket } from 'socket.io-client';

type GameSocket = {
  socket: Socket | undefined;
};

export const gameSocketContext = createContext<GameSocket | undefined>(
  undefined
);

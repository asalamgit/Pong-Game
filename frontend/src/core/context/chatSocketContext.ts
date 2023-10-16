import { createContext } from 'react';
import { Socket } from 'socket.io-client';

type ChatSocket = {
  socket: Socket | undefined;
};

export const chatSocketContext = createContext<ChatSocket | undefined>(
  undefined
);

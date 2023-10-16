import { User } from '@/core/types/User';

export type StartGameInfo = {
  room: string;
  playerLeftId: any;
  player1Profile: User;
  player2Profile: User;
};

export type BallInfo = {
  x: number;
  y: number;
  paddle1Y: number;
  paddle2Y: number;
  paddle1Height: number;
  paddle2Height: number;
};

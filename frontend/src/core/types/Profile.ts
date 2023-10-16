import { Game } from './Game';
import { User } from './User';

export type Profile = {
  id: number;
  points: number;
  victories: number;
  defeats: number;
  user?: User;
  userId: number;
  gamesHistoryHome: Game;
  gamesHistoryAway: Game;
  createdAt: Date;
  updatedAt: Date;
};

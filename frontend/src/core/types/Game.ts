import { Profile } from './Profile';

export type Game = {
  id: number;
  player1: Profile;
  playerId: number;
  player2: Profile;
  opponentId: number;
  playerRanking: number;
  opponentRanking: number;
  score: [number, number];
  createdAt: Date;
  updatedAt: Date;
};

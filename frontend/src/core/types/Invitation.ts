export type CurrentInvitations = {
  opponentId: number;
  opponentName: string;
  mode: string;
};

export type AcceptInvitation = {
  userId: number;
  opponentId: number;
  mode: string;
};

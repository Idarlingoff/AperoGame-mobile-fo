export interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  createdAt: number;
  stats: UserStats;
}

export interface UserStats {
  gamesPlayed: number;
  gagesCompleted: number;
  gagesRefused: number;
  wins: number;
}

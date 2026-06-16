import type { GageLevel, MiniGameId } from '@/src/types';

export interface FSUser {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  createdAt: number;
  stats: FSUserStats;
}

export interface FSUserStats {
  gamesPlayed: number;
  gagesCompleted: number;
  gagesRefused: number;
  wins: number;
  totalDrinksGiven: number;
  totalDrinksReceived: number;
}

export interface FSGage {
  id: string;
  text: string;
  emoji: string;
  level: GageLevel;
  drinksIfRefused: number;
  active: boolean;
  createdAt: number;
}

export interface FSGameHistory {
  gameId: string;
  code: string;
  hostId: string;
  gageLevel: GageLevel;
  playerIds: string[];
  winnerId: string | null;
  totalTurns: number;
  miniGamesPlayed: MiniGameId[];
  startedAt: number;
  finishedAt: number;
  playerSummaries: Record<string, FSPlayerSummary>;
}

export interface FSPlayerSummary {
  uid: string;
  displayName: string;
  score: number;
  gagesCompleted: number;
  gagesRefused: number;
  drinksCount: number;
}

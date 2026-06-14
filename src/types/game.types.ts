import type { MiniGameId, MiniGameResult } from './mini-game.types';

export type GageLevel = 'soft' | 'epice' | 'chaos';
export type GameStatus = 'lobby' | 'playing' | 'gage' | 'finished';

export interface Player {
  uid: string;
  displayName: string;
  photoURL: string | null;
  score: number;
  lives: number;
  isHost: boolean;
  isReady: boolean;
  drinksCount: number;
}

export interface Gage {
  id: string;
  text: string;
  emoji: string;
  level: GageLevel;
  drinksIfRefused: number;
}

export interface Turn {
  number: number;
  miniGameId: MiniGameId;
  gage: Gage;
  loserId: string | null;
  results: Record<string, MiniGameResult>;
  gageValidations: Record<string, boolean>;
  gageRefused: boolean;
  status: 'mini-game' | 'gage-validation' | 'done';
}

export interface Game {
  id: string;
  code: string;
  hostId: string;
  status: GameStatus;
  gageLevel: GageLevel;
  maxPlayers: number;
  selectedMiniGames: MiniGameId[];
  players: Record<string, Player>;
  currentTurn: Turn | null;
  totalTurns: number;
  currentTurnNumber: number;
  createdAt: number;
}

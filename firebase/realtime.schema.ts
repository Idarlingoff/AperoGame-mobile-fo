import type { GageLevel, GameStatus, MiniGameId, MiniGameResult } from '@/src/types';

export interface RTGameMeta {
  id: string;
  code: string;
  hostId: string;
  status: GameStatus;
  gageLevel: GageLevel;
  maxPlayers: number;
  selectedMiniGames: MiniGameId[];
  totalTurns: number;
  currentTurnNumber: number;
  createdAt: number;
  startedAt: number | null;
  finishedAt: number | null;
}

export interface RTPlayer {
  uid: string;
  displayName: string;
  photoURL: string | null;
  score: number;
  lives: number;
  isHost: boolean;
  isReady: boolean;
  drinksCount: number;
  online: boolean;
  joinedAt: number;
}

export interface RTTurn {
  number: number;
  miniGameId: MiniGameId;
  gage: RTGageSnapshot;
  loserId: string | null;
  results: Record<string, MiniGameResult>;
  gageValidations: Record<string, boolean>;
  gageRefused: boolean;
  status: 'mini-game' | 'gage-validation' | 'done';
  startedAt: number;
  finishedAt: number | null;
}

export interface RTGageSnapshot {
  id: string;
  text: string;
  emoji: string;
  level: GageLevel;
  drinksIfRefused: number;
}

export type RTCurrentTurn = RTTurn;

export interface RTPresence {
  online: boolean;
  currentGameCode: string | null;
  lastSeen: number;
}


export interface RTDatabase {
  games: Record<
    string,
    {
      meta: RTGameMeta;
      players: Record<string, RTPlayer>;
      turns: Record<string, RTTurn>;
      currentTurn: RTCurrentTurn | null;
    }
  >;
  presence: Record<string, RTPresence>;
}

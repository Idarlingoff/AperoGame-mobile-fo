export type MiniGameId = string;

export interface MiniGameResult {
  playerId: string;
  score: number;
  hasWon: boolean;
  data?: unknown;
}

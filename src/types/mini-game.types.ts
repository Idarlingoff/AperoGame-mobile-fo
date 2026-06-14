export type MiniGameId =
  | 'reaction'
  | 'tap-frenzy'
  | 'shi-fu-mi'
  | 'beer-pong'
  | 'memoire';

export type MiniGameStatus = 'idle' | 'playing' | 'finished';

export interface MiniGameResult {
  playerId: string;
  score: number;
  hasWon: boolean;
  data?: Record<string, unknown>;
}

export interface MiniGameConfig {
  id: MiniGameId;
  name: string;
  description: string;
  durationSeconds: number;
}

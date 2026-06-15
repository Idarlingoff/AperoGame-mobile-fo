import type { MiniGameConfig } from '../types';

export const MINI_GAMES: Record<string, MiniGameConfig> = {
  reaction: {
    id: 'reaction',
    name: 'Réaction',
    description: 'Touche l\'écran dès qu\'il passe au vert !',
    durationSeconds: 10,
  },
  'tap-frenzy': {
    id: 'tap-frenzy',
    name: 'Tap Frenzy',
    description: 'Tape le plus vite possible !',
    durationSeconds: 10,
  },
  'shi-fu-mi': {
    id: 'shi-fu-mi',
    name: 'Shi Fu Mi',
    description: 'Choisis plus vite que les autres !',
    durationSeconds: 5,
  },
  'beer-pong': {
    id: 'beer-pong',
    name: 'Beer Pong',
    description: 'Vise et envoie !',
    durationSeconds: 30,
  },
  memoire: {
    id: 'memoire',
    name: 'Mémoire',
    description: 'Mémorise la séquence !',
    durationSeconds: 20,
  },
};

export const GAGE_DRINKS_BY_LEVEL = {
  soft: 1,
  epice: 2,
  chaos: 3,
} as const;

export const MAX_LIVES = 3;
export const TOTAL_TURNS = 50;
export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 4;
export const GAME_CODE_LENGTH = 4;

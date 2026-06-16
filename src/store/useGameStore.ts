import { create } from 'zustand';
import type { GageLevel, Game, MiniGameId } from '../types';

interface GameState {
  currentGame: Game | null;
  selectedMiniGames: MiniGameId[];
  gageLevel: GageLevel;
  maxPlayers: number;

  setCurrentGame: (game: Game | null) => void;
  setSelectedMiniGames: (games: MiniGameId[]) => void;
  setGageLevel: (level: GageLevel) => void;
  setMaxPlayers: (count: number) => void;
  resetGame: () => void;
}

const DEFAULT_MINI_GAMES: MiniGameId[] = ['reaction', 'tap-frenzy', 'shi-fu-mi'];

export const useGameStore = create<GameState>((set) => ({
  currentGame: null,
  selectedMiniGames: DEFAULT_MINI_GAMES,
  gageLevel: 'epice',
  maxPlayers: 3,

  setCurrentGame: (game) => set({ currentGame: game }),
  setSelectedMiniGames: (games) => set({ selectedMiniGames: games }),
  setGageLevel: (level) => set({ gageLevel: level }),
  setMaxPlayers: (count) => set({ maxPlayers: count }),
  resetGame: () =>
    set({
      currentGame: null,
      selectedMiniGames: DEFAULT_MINI_GAMES,
      gageLevel: 'epice',
      maxPlayers: 3,
    }),
}));
import { mockGames } from '@/src/mocks/games';
import type { Game } from '@/src/types';

const cloneGame = (game: Game): Game => ({
  ...game,
  selectedMiniGames: [...game.selectedMiniGames],
  players: Object.fromEntries(
    Object.entries(game.players).map(([playerId, player]) => [playerId, { ...player }]),
  ),
  currentTurn: game.currentTurn
    ? {
        ...game.currentTurn,
        gage: { ...game.currentTurn.gage },
        results: { ...game.currentTurn.results },
        gageValidations: { ...game.currentTurn.gageValidations },
      }
    : null,
});

export const getGameByCode = async (code: string): Promise<Game | null> => {
  const normalizedCode = code.trim().toUpperCase();
  const game = mockGames.find((item) => item.code === normalizedCode);

  return game ? cloneGame(game) : null;
};

export const getGameById = async (gameId: string): Promise<Game | null> => {
  const game = mockGames.find((item) => item.id === gameId);

  return game ? cloneGame(game) : null;
};

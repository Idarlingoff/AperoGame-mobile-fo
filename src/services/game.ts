import { mockGagesByLevel } from '@/src/mocks/gages';
import { mockGames } from '@/src/mocks/games';
import { GAME_CODE_LENGTH, MAX_LIVES, TOTAL_TURNS } from '@/src/constants';
import type { Game, GageLevel, MiniGameId, Player, Turn } from '@/src/types';

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

const gameStore: Game[] = mockGames.map(cloneGame);

const generateGameId = () => `game-${Math.random().toString(36).slice(2, 10)}`;

const generateGameCode = () => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';

  while (code.length < GAME_CODE_LENGTH) {
    const randomIndex = Math.floor(Math.random() * alphabet.length);
    code += alphabet[randomIndex];
  }

  return code;
};

const getUniqueGameCode = () => {
  let nextCode = generateGameCode();

  while (gameStore.some((game) => game.code === nextCode)) {
    nextCode = generateGameCode();
  }

  return nextCode;
};

const getOrderedPlayers = (game: Game) =>
  Object.values(game.players).sort((leftPlayer, rightPlayer) => {
    if (leftPlayer.isHost === rightPlayer.isHost) {
      return leftPlayer.displayName.localeCompare(rightPlayer.displayName);
    }

    return leftPlayer.isHost ? -1 : 1;
  });

const buildTurn = (game: Game, turnNumber: number): Turn => {
  const selectedMiniGames: MiniGameId[] =
    game.selectedMiniGames.length > 0 ? game.selectedMiniGames : ['reaction'];
  const miniGameId = selectedMiniGames[(turnNumber - 1) % selectedMiniGames.length];
  const availableGages = mockGagesByLevel[game.gageLevel];
  const gage = availableGages[(turnNumber - 1) % availableGages.length];
  const orderedPlayers = getOrderedPlayers(game);
  const loser = orderedPlayers.length > 0
    ? orderedPlayers[(turnNumber - 1) % orderedPlayers.length]
    : null;

  return {
    number: turnNumber,
    miniGameId,
    gage: { ...gage },
    loserId: loser?.uid ?? null,
    results: {},
    gageValidations: {},
    gageRefused: false,
    status: 'mini-game',
    startedAt: Date.now(),
  };
};

const ensureCurrentTurn = (game: Game) => {
  if (game.currentTurn) {
    return;
  }

  const initialTurnNumber = Math.max(1, game.currentTurnNumber || 1);
  game.currentTurnNumber = initialTurnNumber;
  game.currentTurn = buildTurn(game, initialTurnNumber);
};

type CreateGameInput = {
  gageLevel: GageLevel;
  hostDisplayName?: string;
  maxPlayers: number;
  selectedMiniGames: MiniGameId[];
};

export const createGame = async ({
  gageLevel,
  hostDisplayName = 'Hôte',
  maxPlayers,
  selectedMiniGames,
}: CreateGameInput): Promise<Game> => {
  const hostId = `host-${Math.random().toString(36).slice(2, 10)}`;
  const hostPlayer: Player = {
    uid: hostId,
    displayName: hostDisplayName,
    photoURL: null,
    score: 0,
    lives: MAX_LIVES,
    isHost: true,
    isReady: true,
    drinksCount: 0,
  };

  const newGame: Game = {
    id: generateGameId(),
    code: getUniqueGameCode(),
    hostId,
    status: 'lobby',
    gageLevel,
    maxPlayers,
    selectedMiniGames,
    players: {
      [hostId]: hostPlayer,
    },
    currentTurn: null,
    totalTurns: TOTAL_TURNS,
    currentTurnNumber: 0,
    createdAt: Date.now(),
  };

  gameStore.push(newGame);

  return cloneGame(newGame);
};

export const startGame = async (gameId: string): Promise<Game | null> => {
  const game = gameStore.find((item) => item.id === gameId);

  if (!game) {
    return null;
  }

  game.status = 'playing';
  ensureCurrentTurn(game);

  return cloneGame(game);
};

export const advanceGameTurn = async (gameId: string): Promise<Game | null> => {
  const game = gameStore.find((item) => item.id === gameId);

  if (!game) {
    return null;
  }

  ensureCurrentTurn(game);

  if (game.currentTurnNumber >= game.totalTurns) {
    game.status = 'finished';
    return cloneGame(game);
  }

  const nextTurnNumber = game.currentTurnNumber + 1;
  game.currentTurnNumber = nextTurnNumber;
  game.currentTurn = buildTurn(game, nextTurnNumber);
  game.status = nextTurnNumber >= game.totalTurns ? 'finished' : 'playing';

  return cloneGame(game);
};

export const getGameByCode = async (code: string): Promise<Game | null> => {
  const normalizedCode = code.trim().toUpperCase();
  const game = gameStore.find((item) => item.code === normalizedCode);

  return game ? cloneGame(game) : null;
};

export const getGameById = async (gameId: string): Promise<Game | null> => {
  const game = gameStore.find((item) => item.id === gameId);

  return game ? cloneGame(game) : null;
};

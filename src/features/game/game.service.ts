import { GAME_CODE_LENGTH, MAX_LIVES, TOTAL_TURNS } from '@/src/constants';
import { mockGagesByLevel } from '@/src/mocks/gages';
import {
  currentTurnPath,
  gagePoolPath,
  gameCodePath,
  metaPath,
  playerPath,
  playersPath,
  rtGet,
  rtSet,
  rtUpdate,
} from '@/src/services/firebase/realtime';
import type { GageLevel, MiniGameId } from '@/src/types';
import type {
  RTCurrentTurn,
  RTGageSnapshot,
  RTGameMeta,
  RTPlayer,
} from '@/firebase/realtime.schema';

const generateCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from(
    { length: GAME_CODE_LENGTH },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join('');
};

const generateGameId = (): string => `game-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

const buildGagePool = (gageLevel: GageLevel): RTGageSnapshot[] =>
  mockGagesByLevel[gageLevel].map((gage) => ({
    id: gage.id,
    text: gage.text,
    emoji: gage.emoji,
    level: gage.level,
    drinksIfRefused: gage.drinksIfRefused,
  }));

const buildTurn = (
  meta: RTGameMeta,
  players: RTPlayer[],
  gagePool: RTGageSnapshot[],
  turnNumber: number,
): RTCurrentTurn => {
  const miniGameIds: MiniGameId[] =
    meta.selectedMiniGames.length > 0 ? meta.selectedMiniGames : ['reaction'];
  const miniGameId = miniGameIds[(turnNumber - 1) % miniGameIds.length];
  const gage = gagePool[(turnNumber - 1) % gagePool.length];
  const sortedPlayers = [...players].sort((left, right) =>
    left.displayName.localeCompare(right.displayName),
  );
  const loser = sortedPlayers[(turnNumber - 1) % sortedPlayers.length] ?? null;

  return {
    number: turnNumber,
    miniGameId,
    gage,
    loserId: loser?.uid ?? null,
    results: {},
    gageValidations: {},
    gageRefused: false,
    status: 'mini-game',
    startedAt: Date.now(),
    finishedAt: null,
  };
};

export type CreateGameInput = {
  hostId: string;
  displayName: string;
  photoURL: string | null;
  gageLevel: GageLevel;
  maxPlayers: number;
  selectedMiniGames: MiniGameId[];
};

export const createGame = async (input: CreateGameInput): Promise<string> => {
  const gameId = generateGameId();
  const code = generateCode();

  const meta: RTGameMeta = {
    id: gameId,
    code,
    hostId: input.hostId,
    status: 'lobby',
    gageLevel: input.gageLevel,
    maxPlayers: input.maxPlayers,
    selectedMiniGames: input.selectedMiniGames,
    totalTurns: TOTAL_TURNS,
    currentTurnNumber: 0,
    createdAt: Date.now(),
    startedAt: null,
    finishedAt: null,
  };

  const hostPlayer: RTPlayer = {
    uid: input.hostId,
    displayName: input.displayName,
    photoURL: input.photoURL,
    score: 0,
    lives: MAX_LIVES,
    isHost: true,
    isReady: true,
    drinksCount: 0,
    online: true,
    joinedAt: Date.now(),
  };

  await rtSet(metaPath(gameId), meta);
  await rtSet(playerPath(gameId, input.hostId), hostPlayer);
  await rtSet(gameCodePath(code), gameId);

  return gameId;
};

export const joinGame = async (
  code: string,
  uid: string,
  displayName: string,
  photoURL: string | null,
): Promise<string> => {
  const gameId = await rtGet<string>(gameCodePath(code.trim().toUpperCase()));
  if (!gameId) throw new Error('Aucune partie ne correspond à ce code.');

  const meta = await rtGet<RTGameMeta>(metaPath(gameId));
  if (!meta) throw new Error('Cette partie est introuvable.');
  if (meta.status !== 'lobby') throw new Error("Cette partie n'est plus disponible.");

  const existingPlayers = await rtGet<Record<string, RTPlayer>>(playersPath(gameId));
  const playerCount = existingPlayers ? Object.keys(existingPlayers).length : 0;
  const alreadyJoined = Boolean(existingPlayers?.[uid]);

  if (!alreadyJoined && playerCount >= meta.maxPlayers) {
    throw new Error('Cette partie est complète.');
  }

  const player: RTPlayer = {
    uid,
    displayName,
    photoURL,
    score: 0,
    lives: MAX_LIVES,
    isHost: false,
    isReady: false,
    drinksCount: 0,
    online: true,
    joinedAt: Date.now(),
  };

  await rtSet(playerPath(gameId, uid), player);
  return gameId;
};

export const startGame = async (gameId: string): Promise<void> => {
  const meta = await rtGet<RTGameMeta>(metaPath(gameId));
  if (!meta) throw new Error('Cette partie est introuvable.');

  const playersMap = await rtGet<Record<string, RTPlayer>>(playersPath(gameId));
  const players = Object.values(playersMap ?? {});
  const gagePool = buildGagePool(meta.gageLevel);
  const firstTurn = buildTurn(meta, players, gagePool, 1);

  await rtSet(gagePoolPath(gameId), gagePool);
  await rtSet(currentTurnPath(gameId), firstTurn);
  await rtUpdate(metaPath(gameId), {
    status: 'playing',
    startedAt: Date.now(),
    currentTurnNumber: 1,
  });
};

export const advanceTurn = async (gameId: string): Promise<void> => {
  const [meta, playersMap, gagePool] = await Promise.all([
    rtGet<RTGameMeta>(metaPath(gameId)),
    rtGet<Record<string, RTPlayer>>(playersPath(gameId)),
    rtGet<RTGageSnapshot[]>(gagePoolPath(gameId)),
  ]);

  if (!meta || !gagePool) throw new Error('Données de partie introuvables.');

  const nextTurnNumber = meta.currentTurnNumber + 1;

  if (nextTurnNumber > meta.totalTurns) {
    await rtUpdate(metaPath(gameId), { status: 'finished', finishedAt: Date.now() });
    return;
  }

  const players = Object.values(playersMap ?? {});
  const nextTurn = buildTurn(meta, players, gagePool, nextTurnNumber);

  await rtSet(currentTurnPath(gameId), nextTurn);
  await rtUpdate(metaPath(gameId), { currentTurnNumber: nextTurnNumber });
};

export const leaveGame = async (gameId: string, uid: string): Promise<void> => {
  await rtUpdate(playerPath(gameId, uid), { online: false });
};

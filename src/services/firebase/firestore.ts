import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  limit,
} from 'firebase/firestore';
import { db } from './config';
import type { Game, Player, Turn } from '../../types';
import { GAME_CODE_LENGTH } from '../../constants';

const generateCode = (): string =>
  Math.random().toString(36).substring(2, 2 + GAME_CODE_LENGTH).toUpperCase();

export const createGame = async (game: Omit<Game, 'id' | 'code'>): Promise<Game> => {
  const code = generateCode();
  const ref = doc(collection(db, 'games'));
  const newGame: Game = { ...game, id: ref.id, code };
  await setDoc(ref, newGame);
  return newGame;
};

export const getGameByCode = async (code: string): Promise<Game | null> => {
  const q = query(collection(db, 'games'), where('code', '==', code.toUpperCase()), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return snapshot.docs[0].data() as Game;
};

export const joinGame = async (gameId: string, player: Player): Promise<void> => {
  await updateDoc(doc(db, 'games', gameId), {
    [`players.${player.uid}`]: player,
  });
};

export const updateGameStatus = async (gameId: string, status: Game['status']): Promise<void> => {
  await updateDoc(doc(db, 'games', gameId), { status });
};

export const updateTurn = async (gameId: string, turn: Turn): Promise<void> => {
  await updateDoc(doc(db, 'games', gameId), { currentTurn: turn });
};

export const updatePlayerScore = async (
  gameId: string,
  playerId: string,
  score: number,
): Promise<void> => {
  await updateDoc(doc(db, 'games', gameId), { [`players.${playerId}.score`]: score });
};

export const subscribeToGame = (
  gameId: string,
  onUpdate: (game: Game) => void,
): (() => void) =>
  onSnapshot(doc(db, 'games', gameId), (snap) => {
    if (snap.exists()) onUpdate(snap.data() as Game);
  });

export const getUserProfile = async (uid: string) => {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
};

export const updateUserProfile = async (uid: string, data: Partial<import('../../types').User>): Promise<void> => {
  await updateDoc(doc(db, 'users', uid), data as Record<string, unknown>);
};

import {get, onDisconnect, onValue, ref, remove, set, update,} from 'firebase/database';
import {rtdb} from './config';

export const gamePath = (gameId: string) => `games/${gameId}`;
export const metaPath = (gameId: string) => `games/${gameId}/meta`;
export const playersPath = (gameId: string) => `games/${gameId}/players`;
export const playerPath = (gameId: string, uid: string) => `games/${gameId}/players/${uid}`;
export const currentTurnPath = (gameId: string) => `games/${gameId}/currentTurn`;
export const gagePoolPath = (gameId: string) => `games/${gameId}/gagePool`;
export const gameCodePath = (code: string) => `gameCodes/${code}`;

export const rtGet = async <T>(path: string): Promise<T | null> => {
  const snap = await get(ref(rtdb, path));
  return snap.exists() ? (snap.val() as T) : null;
};

export const rtSet = (path: string, value: unknown): Promise<void> =>
  set(ref(rtdb, path), value);

export const rtUpdate = (path: string, updates: Record<string, unknown>): Promise<void> =>
  update(ref(rtdb, path), updates);

export const rtRemove = (path: string): Promise<void> =>
  remove(ref(rtdb, path));

export const rtSubscribe = <T>(
  path: string,
  callback: (value: T | null) => void,
): (() => void) => {
  return onValue(ref(rtdb, path), (snap) => {
    callback(snap.exists() ? (snap.val() as T) : null);
  });
};

export const rtSetOnDisconnect = (path: string, value: unknown): void => {
  onDisconnect(ref(rtdb, path)).set(value);
};

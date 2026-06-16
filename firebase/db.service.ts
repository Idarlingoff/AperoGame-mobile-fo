import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import {
  get,
  onDisconnect,
  onValue,
  push,
  ref,
  set,
  update,
} from 'firebase/database';

import { auth, db, rtdb } from '@/src/services/firebase/config';
import type { GageLevel, MiniGameId, MiniGameResult } from '@/src/types';
import type { FSGage, FSGameHistory, FSUser, FSUserStats } from './firestore.schema';
import type { RTCurrentTurn, RTGameMeta, RTPlayer, RTPresence } from './realtime.schema';

export function getFirebaseAuth() {
  return auth;
}

const defaultStats = (): FSUserStats => ({
  gamesPlayed: 0,
  gagesCompleted: 0,
  gagesRefused: 0,
  wins: 0,
  totalDrinksGiven: 0,
  totalDrinksReceived: 0,
});

export async function createUserProfile(
  uid: string,
  displayName: string,
  email: string,
  photoURL: string | null,
): Promise<void> {
  const user: FSUser = { uid, displayName, email, photoURL, createdAt: Date.now(), stats: defaultStats() };
  await setDoc(doc(db, 'users', uid), user);
}

export async function getUserProfile(uid: string): Promise<FSUser | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as FSUser) : null;
}

export async function incrementUserStats(
  uid: string,
  delta: Partial<Record<keyof FSUserStats, number>>,
): Promise<void> {
  const updates: Record<string, ReturnType<typeof increment>> = {};
  for (const [key, value] of Object.entries(delta)) {
    updates[`stats.${key}`] = increment(value);
  }
  await updateDoc(doc(db, 'users', uid), updates);
}

export async function getGagesByLevel(level: GageLevel): Promise<FSGage[]> {
  const q = query(collection(db, 'gages'), where('level', '==', level), where('active', '==', true));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as FSGage);
}

export async function saveGameHistory(history: FSGameHistory): Promise<void> {
  await setDoc(doc(db, 'game_history', history.gameId), history);
}

function generateCode(): string {
  return Math.random().toString(36).slice(2, 7).toUpperCase();
}

export async function createGame(
  hostId: string,
  hostDisplayName: string,
  hostPhotoURL: string | null,
  gageLevel: GageLevel,
  maxPlayers: number,
  selectedMiniGames: MiniGameId[],
  totalTurns: number,
): Promise<string> {
  const gameRef = push(ref(rtdb, 'games'));
  const gameId = gameRef.key;
  const code = generateCode();
  const now = Date.now();

  const meta: RTGameMeta = {
    id: gameId, code, hostId, status: 'lobby', gageLevel, maxPlayers,
    selectedMiniGames, totalTurns, currentTurnNumber: 0,
    createdAt: now, startedAt: null, finishedAt: null,
  };

  const hostPlayer: RTPlayer = {
    uid: hostId, displayName: hostDisplayName, photoURL: hostPhotoURL,
    score: 0, lives: 3, isHost: true, isReady: false,
    drinksCount: 0, online: true, joinedAt: now,
  };

  await set(ref(rtdb, `games/${code}`), {
    meta, players: { [hostId]: hostPlayer }, turns: {}, currentTurn: null,
  });

  return code;
}

export async function joinGame(
  code: string, uid: string, displayName: string, photoURL: string | null,
): Promise<void> {
  const player: RTPlayer = {
    uid, displayName, photoURL, score: 0, lives: 3,
    isHost: false, isReady: false, drinksCount: 0, online: true, joinedAt: Date.now(),
  };
  await set(ref(rtdb, `games/${code}/players/${uid}`), player);
}

export function setupPresence(uid: string, gameCode: string | null): () => void {
  const presenceRef = ref(rtdb, `presence/${uid}`);
  const playerRef = gameCode ? ref(rtdb, `games/${gameCode}/players/${uid}/online`) : null;

  const onlineData: RTPresence = { online: true, currentGameCode: gameCode, lastSeen: Date.now() };
  const offlineData: RTPresence = { online: false, currentGameCode: null, lastSeen: Date.now() };

  set(presenceRef, onlineData);
  onDisconnect(presenceRef).set(offlineData);
  if (playerRef) onDisconnect(playerRef).set(false);

  return () => set(presenceRef, offlineData);
}

export async function setCurrentTurn(code: string, turn: RTCurrentTurn): Promise<void> {
  await update(ref(rtdb, `games/${code}`), {
    [`turns/${turn.number}`]: turn,
    currentTurn: turn,
    'meta/currentTurnNumber': turn.number,
  });
}

export async function submitMiniGameResult(code: string, uid: string, result: MiniGameResult): Promise<void> {
  await set(ref(rtdb, `games/${code}/currentTurn/results/${uid}`), result);
}

export async function submitGageValidation(code: string, uid: string, accepted: boolean): Promise<void> {
  await set(ref(rtdb, `games/${code}/currentTurn/gageValidations/${uid}`), accepted);
}

export async function resolveGage(
  code: string, refused: boolean, loserId: string, drinksIfRefused: number,
): Promise<void> {
  const updates: Record<string, unknown> = {
    'currentTurn/gageRefused': refused,
    'currentTurn/status': 'done',
    'currentTurn/finishedAt': Date.now(),
  };

  if (refused) {
    const snap = await get(ref(rtdb, `games/${code}/players/${loserId}/drinksCount`));
    updates[`players/${loserId}/drinksCount`] = (snap.val() ?? 0) + drinksIfRefused;
  }

  await update(ref(rtdb, `games/${code}`), updates);
}

export async function updateGameStatus(code: string, status: RTGameMeta['status']): Promise<void> {
  const updates: Record<string, unknown> = { 'meta/status': status };
  if (status === 'playing') updates['meta/startedAt'] = Date.now();
  if (status === 'finished') updates['meta/finishedAt'] = Date.now();
  await update(ref(rtdb, `games/${code}`), updates);
}

export function onCurrentTurnChange(
  code: string, callback: (turn: RTCurrentTurn | null) => void,
): () => void {
  return onValue(ref(rtdb, `games/${code}/currentTurn`), snap => {
    callback(snap.val() as RTCurrentTurn | null);
  });
}

export function onPlayersChange(
  code: string, callback: (players: Record<string, RTPlayer>) => void,
): () => void {
  return onValue(ref(rtdb, `games/${code}/players`), snap => {
    callback((snap.val() ?? {}) as Record<string, RTPlayer>);
  });
}

export function onGameMetaChange(
  code: string, callback: (meta: RTGameMeta) => void,
): () => void {
  return onValue(ref(rtdb, `games/${code}/meta`), snap => {
    if (snap.exists()) callback(snap.val() as RTGameMeta);
  });
}

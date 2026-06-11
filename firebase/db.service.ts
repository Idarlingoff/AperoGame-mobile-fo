/**
 * Services d'accès aux deux bases de données Firebase.
 *
 * Firestore  → données persistantes (users, catalogue gages, historique)
 * Realtime   → état live des parties (meta, players, turns, presence)
 */

import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import firestore from '@react-native-firebase/firestore';
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

import type { GageLevel } from '../src/types/game.types';
import type { MiniGameId, MiniGameResult } from '../src/types/mini-game.types';
import type { FSGage, FSGameHistory, FSUser, FSUserStats } from './firestore.schema';
import type {
  RTCurrentTurn,
  RTGameMeta,
  RTPlayer,
  RTPresence,
} from './realtime.schema';

// ─── Auth ─────────────────────────────────────────────────────────────────────

export function getFirebaseAuth() {
  return auth();
}

// ─── Firestore — Users ────────────────────────────────────────────────────────

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
  const user: FSUser = {
    uid,
    displayName,
    email,
    photoURL,
    createdAt: Date.now(),
    stats: defaultStats(),
  };
  await firestore().collection('users').doc(uid).set(user);
}

export async function getUserProfile(uid: string): Promise<FSUser | null> {
  const snap = await firestore().collection('users').doc(uid).get();
  return snap.exists() ? (snap.data() as FSUser) : null;
}

export async function incrementUserStats(
  uid: string,
  delta: Partial<Record<keyof FSUserStats, number>>,
): Promise<void> {
  const updates: Record<string, FirebaseFirestoreTypes.FieldValue> = {};
  for (const [key, value] of Object.entries(delta)) {
    updates[`stats.${key}`] = firestore.FieldValue.increment(value as number);
  }
  await firestore().collection('users').doc(uid).update(updates);
}

// ─── Firestore — Gages ────────────────────────────────────────────────────────

export async function getGagesByLevel(level: GageLevel): Promise<FSGage[]> {
  const snap = await firestore()
    .collection('gages')
    .where('level', '==', level)
    .where('active', '==', true)
    .get();
  return snap.docs.map(d => d.data() as FSGage);
}

// ─── Firestore — Game history ─────────────────────────────────────────────────

export async function saveGameHistory(history: FSGameHistory): Promise<void> {
  await firestore().collection('game_history').doc(history.gameId).set(history);
}

// ─── Realtime DB — Génération de code de partie ───────────────────────────────

function generateCode(): string {
  return Math.random().toString(36).slice(2, 7).toUpperCase();
}

// ─── Realtime DB — Création de partie ────────────────────────────────────────

export async function createGame(
  hostId: string,
  hostDisplayName: string,
  hostPhotoURL: string | null,
  gageLevel: GageLevel,
  maxPlayers: number,
  selectedMiniGames: MiniGameId[],
  totalTurns: number,
): Promise<string> {
  const gameRef = database().ref('games').push();
  const gameId = gameRef.key!;
  const code = generateCode();
  const now = Date.now();

  const meta: RTGameMeta = {
    id: gameId,
    code,
    hostId,
    status: 'lobby',
    gageLevel,
    maxPlayers,
    selectedMiniGames,
    totalTurns,
    currentTurnNumber: 0,
    createdAt: now,
    startedAt: null,
    finishedAt: null,
  };

  const hostPlayer: RTPlayer = {
    uid: hostId,
    displayName: hostDisplayName,
    photoURL: hostPhotoURL,
    score: 0,
    lives: 3,
    isHost: true,
    isReady: false,
    drinksCount: 0,
    online: true,
    joinedAt: now,
  };

  await database().ref(`games/${code}`).set({
    meta,
    players: { [hostId]: hostPlayer },
    turns: {},
    currentTurn: null,
  });

  return code;
}

// ─── Realtime DB — Rejoindre une partie ───────────────────────────────────────

export async function joinGame(
  code: string,
  uid: string,
  displayName: string,
  photoURL: string | null,
): Promise<void> {
  const player: RTPlayer = {
    uid,
    displayName,
    photoURL,
    score: 0,
    lives: 3,
    isHost: false,
    isReady: false,
    drinksCount: 0,
    online: true,
    joinedAt: Date.now(),
  };
  await database().ref(`games/${code}/players/${uid}`).set(player);
}

// ─── Realtime DB — Présence & déconnexion ─────────────────────────────────────

export function setupPresence(uid: string, gameCode: string | null): () => void {
  const presenceRef = database().ref(`presence/${uid}`);
  const playerRef = gameCode
    ? database().ref(`games/${gameCode}/players/${uid}/online`)
    : null;

  const onlineData: RTPresence = {
    online: true,
    currentGameCode: gameCode,
    lastSeen: Date.now(),
  };

  const offlineData: RTPresence = {
    online: false,
    currentGameCode: null,
    lastSeen: Date.now(),
  };

  presenceRef.set(onlineData);
  presenceRef.onDisconnect().set(offlineData);
  if (playerRef) {
    playerRef.onDisconnect().set(false);
  }

  return () => presenceRef.set(offlineData);
}

// ─── Realtime DB — Tour courant ───────────────────────────────────────────────

export async function setCurrentTurn(
  code: string,
  turn: RTCurrentTurn,
): Promise<void> {
  await database().ref(`games/${code}`).update({
    [`turns/${turn.number}`]: turn,
    currentTurn: turn,
    'meta/currentTurnNumber': turn.number,
  });
}

export async function submitMiniGameResult(
  code: string,
  uid: string,
  result: MiniGameResult,
): Promise<void> {
  await database().ref(`games/${code}/currentTurn/results/${uid}`).set(result);
}

export async function submitGageValidation(
  code: string,
  uid: string,
  accepted: boolean,
): Promise<void> {
  await database().ref(`games/${code}/currentTurn/gageValidations/${uid}`).set(accepted);
}

export async function resolveGage(
  code: string,
  refused: boolean,
  loserId: string,
  drinksIfRefused: number,
): Promise<void> {
  const updates: Record<string, unknown> = {
    'currentTurn/gageRefused': refused,
    'currentTurn/status': 'done',
    'currentTurn/finishedAt': Date.now(),
  };

  if (refused) {
    const snap = await database()
      .ref(`games/${code}/players/${loserId}/drinksCount`)
      .once('value');
    updates[`players/${loserId}/drinksCount`] = (snap.val() ?? 0) + drinksIfRefused;
  }

  await database().ref(`games/${code}`).update(updates);
}

// ─── Realtime DB — Statut de partie ──────────────────────────────────────────

export async function updateGameStatus(
  code: string,
  status: RTGameMeta['status'],
): Promise<void> {
  const updates: Record<string, unknown> = { 'meta/status': status };
  if (status === 'playing') updates['meta/startedAt'] = Date.now();
  if (status === 'finished') updates['meta/finishedAt'] = Date.now();
  await database().ref(`games/${code}`).update(updates);
}

// ─── Realtime DB — Écoute temps réel ─────────────────────────────────────────

export function onCurrentTurnChange(
  code: string,
  callback: (turn: RTCurrentTurn | null) => void,
): () => void {
  const ref = database().ref(`games/${code}/currentTurn`);
  const handler = ref.on('value', snap => {
    callback(snap.val() as RTCurrentTurn | null);
  });
  return () => ref.off('value', handler);
}

export function onPlayersChange(
  code: string,
  callback: (players: Record<string, RTPlayer>) => void,
): () => void {
  const ref = database().ref(`games/${code}/players`);
  const handler = ref.on('value', snap => {
    callback((snap.val() ?? {}) as Record<string, RTPlayer>);
  });
  return () => ref.off('value', handler);
}

export function onGameMetaChange(
  code: string,
  callback: (meta: RTGameMeta) => void,
): () => void {
  const ref = database().ref(`games/${code}/meta`);
  const handler = ref.on('value', snap => {
    if (snap.exists()) callback(snap.val() as RTGameMeta);
  });
  return () => ref.off('value', handler);
}

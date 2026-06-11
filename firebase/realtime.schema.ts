/**
 * REALTIME DATABASE — état live des parties
 *
 * Arborescence:
 *   games/{gameCode}/meta          → config + statut de la partie
 *   games/{gameCode}/players/{uid} → état live de chaque joueur
 *   games/{gameCode}/turns/{n}     → historique des tours
 *   games/{gameCode}/currentTurn   → tour en cours (dénormalisé pour la vitesse)
 *   presence/{uid}                 → connexion temps réel (onDisconnect)
 *
 * Choix: Realtime DB pour tout ce qui est synchronisé en temps réel pendant
 * la partie (état du tour, validations, résultats mini-jeu). Firestore pour
 * les données persistantes (profils, catalogue de gages, historique).
 */

import type { GageLevel, GameStatus } from '../src/types/game.types';
import type { MiniGameId, MiniGameResult } from '../src/types/mini-game.types';

// ─── games/{gameCode}/meta ───────────────────────────────────────────────────

export interface RTGameMeta {
  id: string;
  code: string;
  hostId: string;
  status: GameStatus;
  gageLevel: GageLevel;
  maxPlayers: number;
  selectedMiniGames: MiniGameId[];
  totalTurns: number;
  currentTurnNumber: number;
  /** timestamp ms */
  createdAt: number;
  startedAt: number | null;
  finishedAt: number | null;
}

// ─── games/{gameCode}/players/{uid} ─────────────────────────────────────────

export interface RTPlayer {
  uid: string;
  displayName: string;
  photoURL: string | null;
  score: number;
  lives: number;
  isHost: boolean;
  isReady: boolean;
  drinksCount: number;
  /** true = connecté à la partie */
  online: boolean;
  joinedAt: number;
}

// ─── games/{gameCode}/turns/{turnNumber} ─────────────────────────────────────

export interface RTTurn {
  number: number;
  miniGameId: MiniGameId;
  gage: RTGageSnapshot;
  /** uid du joueur qui a perdu le mini-jeu */
  loserId: string | null;
  /** résultats du mini-jeu, indexés par uid */
  results: Record<string, MiniGameResult>;
  /**
   * Validations du gage: true = validé, false = refusé.
   * Tous les joueurs votent; majorité simple décide.
   */
  gageValidations: Record<string, boolean>;
  gageRefused: boolean;
  status: 'mini-game' | 'gage-validation' | 'done';
  startedAt: number;
  finishedAt: number | null;
}

/** Snapshot dénormalisé du gage pour éviter une lecture Firestore pendant la partie */
export interface RTGageSnapshot {
  id: string;
  text: string;
  emoji: string;
  level: GageLevel;
  drinksIfRefused: number;
}

// ─── games/{gameCode}/currentTurn ────────────────────────────────────────────
// Identique à RTTurn — répliqué ici pour que les clients n'écoutent
// qu'un seul nœud sans parcourir tout l'historique des tours.
export type RTCurrentTurn = RTTurn;

// ─── presence/{uid} ──────────────────────────────────────────────────────────

export interface RTPresence {
  online: boolean;
  /** gameCode de la partie active, null si hors partie */
  currentGameCode: string | null;
  lastSeen: number;
}

// ─── Shape complète de la Realtime DB (pour typer les refs) ──────────────────

export interface RTDatabase {
  games: Record<
    string, // gameCode
    {
      meta: RTGameMeta;
      players: Record<string, RTPlayer>;
      turns: Record<string, RTTurn>;
      currentTurn: RTCurrentTurn | null;
    }
  >;
  presence: Record<string, RTPresence>;
}

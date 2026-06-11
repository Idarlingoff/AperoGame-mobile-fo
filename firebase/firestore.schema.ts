/**
 * FIRESTORE — données persistantes et catalogue
 *
 * Collections:
 *   users/{uid}               → profil utilisateur + statistiques cumulées
 *   gages/{gageId}            → catalogue de gages (géré en admin)
 *   game_history/{gameId}     → résumé des parties terminées (pour les stats)
 */

import type { GageLevel } from '../src/types/game.types';
import type { MiniGameId } from '../src/types/mini-game.types';

// ─── users/{uid} ─────────────────────────────────────────────────────────────

export interface FSUser {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  /** timestamp ms */
  createdAt: number;
  stats: FSUserStats;
}

export interface FSUserStats {
  gamesPlayed: number;
  gagesCompleted: number;
  gagesRefused: number;
  wins: number;
  totalDrinksGiven: number;
  totalDrinksReceived: number;
}

// ─── gages/{gageId} ──────────────────────────────────────────────────────────

export interface FSGage {
  id: string;
  text: string;
  emoji: string;
  level: GageLevel;
  drinksIfRefused: number;
  /** true = visible dans le jeu */
  active: boolean;
  createdAt: number;
}

// ─── game_history/{gameId} ───────────────────────────────────────────────────

export interface FSGameHistory {
  gameId: string;
  /** code court affiché aux joueurs */
  code: string;
  hostId: string;
  gageLevel: GageLevel;
  playerIds: string[];
  winnerId: string | null;
  totalTurns: number;
  miniGamesPlayed: MiniGameId[];
  /** timestamp ms */
  startedAt: number;
  finishedAt: number;
  /** résumé par joueur */
  playerSummaries: Record<string, FSPlayerSummary>;
}

export interface FSPlayerSummary {
  uid: string;
  displayName: string;
  score: number;
  gagesCompleted: number;
  gagesRefused: number;
  drinksCount: number;
}

import { currentTurnPath, rtSet, rtUpdate } from '@/src/services/firebase/realtime';
import type { MiniGameResult } from '@/src/types';

export type TurnResolution = {
  loserId: string | null;
  scoreUpdates: Record<string, number>;
};

type ScoredPlayer = { score: number };

/**
 * Pure function: given the mini-game results and current players,
 * determines the loser (lowest score) and the score increments for winners.
 */
export const resolveTurn = (
  results: Record<string, MiniGameResult>,
  players: Record<string, ScoredPlayer>,
): TurnResolution => {
  const entries = Object.entries(results);
  if (entries.length === 0) {
    return { loserId: null, scoreUpdates: {} };
  }

  const [loserId] = entries.reduce((worst, current) =>
    current[1].score < worst[1].score ? current : worst,
  );

  const scoreUpdates: Record<string, number> = {};
  for (const [uid] of entries) {
    if (uid !== loserId) {
      scoreUpdates[uid] = (players[uid]?.score ?? 0) + 1;
    }
  }

  return { loserId, scoreUpdates };
};

export const submitMiniGameResult = async (
  gameId: string,
  uid: string,
  score: number,
): Promise<void> => {
  const result: MiniGameResult = { playerId: uid, score, hasWon: false, data: {} };
  await rtSet(`${currentTurnPath(gameId)}/results/${uid}`, result);
};

export const submitGageValidation = async (
  gameId: string,
  uid: string,
  accepted: boolean,
): Promise<void> => {
  await rtSet(`${currentTurnPath(gameId)}/gageValidations/${uid}`, accepted);
};

export type TurnOutcome = {
  scoreUpdates: Record<string, number>;
  drinkUpdates: Record<string, number>;
};

/**
 * Applies the score increments and any drink penalties for a finished turn
 * in a single atomic multi-path update.
 */
export const applyTurnOutcome = async (gameId: string, outcome: TurnOutcome): Promise<void> => {
  const updates: Record<string, unknown> = {};
  for (const [uid, score] of Object.entries(outcome.scoreUpdates)) {
    updates[`games/${gameId}/players/${uid}/score`] = score;
  }
  for (const [uid, drinks] of Object.entries(outcome.drinkUpdates)) {
    updates[`games/${gameId}/players/${uid}/drinksCount`] = drinks;
  }
  if (Object.keys(updates).length === 0) return;
  await rtUpdate('/', updates);
};

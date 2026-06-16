import { useEffect, useRef, useState } from 'react';
import { MINI_GAMES } from '../constants';
import { advanceTurn, applyTurnOutcome, resolveTurn, submitGageValidation } from '@features/game';
import { useGameStore } from '../store';

export type TurnPhase = 'idle' | 'mini-game' | 'gage';

/**
 * Drives the current turn for the play screen:
 * - runs a client-side countdown synchronised from currentTurn.startedAt
 * - flips to the gage phase when the timer expires
 * - (host only) resolves scores/drinks and advances the turn once every
 *   player has validated the gage, preventing cross-client races.
 */
export const useTurn = (gameId: string | null, isHost: boolean) => {
  const currentGame = useGameStore((state) => state.currentGame);
  const currentTurn = currentGame?.currentTurn ?? null;

  const [phase, setPhase] = useState<TurnPhase>('idle');
  const [timeLeft, setTimeLeft] = useState(0);

  const processedTurnRef = useRef<number | null>(null);
  const advancingRef = useRef(false);

  // Initialise phase + timer whenever the turn number changes.
  useEffect(() => {
    if (!currentTurn) {
      setPhase('idle');
      processedTurnRef.current = null;
      return;
    }

    if (currentTurn.number === processedTurnRef.current) return;
    processedTurnRef.current = currentTurn.number;
    advancingRef.current = false;

    const miniGame = MINI_GAMES[currentTurn.miniGameId];
    const elapsedSeconds = Math.floor((Date.now() - currentTurn.startedAt) / 1000);
    const remaining = Math.max(0, miniGame.durationSeconds - elapsedSeconds);

    setPhase(remaining > 0 ? 'mini-game' : 'gage');
    setTimeLeft(remaining);
  }, [currentTurn]);

  // Countdown tick.
  useEffect(() => {
    if (phase !== 'mini-game') return;

    if (timeLeft <= 0) {
      setPhase('gage');
      return;
    }

    const timer = setTimeout(() => setTimeLeft((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [phase, timeLeft]);

  // Host resolves and advances once every player has validated the gage.
  useEffect(() => {
    if (!isHost || !gameId || !currentGame || !currentTurn || phase !== 'gage') return;
    if (advancingRef.current) return;

    const playerIds = Object.keys(currentGame.players);
    const validations = currentTurn.gageValidations ?? {};

    if (playerIds.length === 0 || Object.keys(validations).length < playerIds.length) return;

    advancingRef.current = true;

    const { scoreUpdates } = resolveTurn(currentTurn.results ?? {}, currentGame.players);

    const drinkUpdates: Record<string, number> = {};
    const { loserId, gage } = currentTurn;
    if (loserId && !validations[loserId]) {
      const loser = currentGame.players[loserId];
      if (loser) {
        drinkUpdates[loserId] = loser.drinksCount + gage.drinksIfRefused;
      }
    }

    void applyTurnOutcome(gameId, { scoreUpdates, drinkUpdates }).then(() => advanceTurn(gameId));
  }, [isHost, gameId, currentGame, currentTurn, phase]);

  const handleGageValidation = (uid: string, accepted: boolean) => {
    if (!gameId) return;
    void submitGageValidation(gameId, uid, accepted);
  };

  return { phase, timeLeft, handleGageValidation };
};

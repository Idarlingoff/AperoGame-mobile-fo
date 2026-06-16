import { useCallback, useRef, useState } from 'react';
import { submitMiniGameResult } from '@features/game';

type MiniGameState = 'idle' | 'playing' | 'submitted';

/**
 * Local state machine for the device-side mini-game. Guards against double
 * submissions and forwards the final score to the Realtime Database.
 */
export const useMiniGame = (gameId: string | null, uid: string | null) => {
  const [state, setState] = useState<MiniGameState>('idle');
  const submittedRef = useRef(false);

  const startPlaying = useCallback(() => {
    submittedRef.current = false;
    setState('playing');
  }, []);

  const onFinish = useCallback(
    async (score: number) => {
      if (!gameId || !uid || submittedRef.current) return;
      submittedRef.current = true;
      setState('submitted');
      await submitMiniGameResult(gameId, uid, score);
    },
    [gameId, uid],
  );

  const reset = useCallback(() => {
    submittedRef.current = false;
    setState('idle');
  }, []);

  return { state, startPlaying, onFinish, reset };
};

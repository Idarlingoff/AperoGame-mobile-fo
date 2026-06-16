import { useEffect } from 'react';
import { subscribeToGame } from '../services/firebase/firestore';
import { useGameStore } from '../store';

export const useGame = (gameId: string | null) => {
  const { currentGame, setCurrentGame } = useGameStore();

  useEffect(() => {
    if (!gameId) return;

    const unsubscribe = subscribeToGame(gameId, setCurrentGame);
    return unsubscribe;
  }, [gameId, setCurrentGame]);

  return { game: currentGame };
};
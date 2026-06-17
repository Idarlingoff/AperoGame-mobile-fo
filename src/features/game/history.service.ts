import { db } from '@/src/services/firebase/config';
import type { FSGameHistory, FSPlayerSummary } from '@/firebase/firestore.schema';
import type { RTGameMeta, RTPlayer } from '@/firebase/realtime.schema';
import { doc, increment, setDoc } from 'firebase/firestore';

/**
 * Persists the finished game to Firestore and updates each player's stats.
 * Idempotent: uses setDoc with merge so multiple clients arriving on the
 * results screen don't create duplicate history documents.
 */
export const saveGameHistory = async (
  meta: RTGameMeta,
  players: Record<string, RTPlayer>,
): Promise<void> => {
  const playerList = Object.values(players);
  const ranked = [...playerList].sort((left, right) =>
    right.score !== left.score ? right.score - left.score : right.lives - left.lives,
  );
  const winnerId = ranked[0]?.uid ?? null;

  const playerSummaries: Record<string, FSPlayerSummary> = {};
  for (const player of playerList) {
    playerSummaries[player.uid] = {
      uid: player.uid,
      displayName: player.displayName,
      score: player.score,
      gagesCompleted: 0,
      gagesRefused: 0,
      drinksCount: player.drinksCount,
    };
  }

  const history: FSGameHistory = {
    gameId: meta.id,
    code: meta.code,
    hostId: meta.hostId,
    gageLevel: meta.gageLevel,
    playerIds: playerList.map((player) => player.uid),
    winnerId,
    totalTurns: meta.currentTurnNumber,
    miniGamesPlayed: meta.selectedMiniGames,
    startedAt: meta.startedAt ?? meta.createdAt,
    finishedAt: meta.finishedAt ?? Date.now(),
    playerSummaries,
  };

  await setDoc(doc(db, 'gameHistory', meta.id), history, { merge: true });

  await Promise.all(
    playerList.map((player) =>
      setDoc(
        doc(db, 'users', player.uid),
        {
          stats: {
            gamesPlayed: increment(1),
            wins: player.uid === winnerId ? increment(1) : increment(0),
            totalDrinksReceived: increment(player.drinksCount),
          },
        },
        { merge: true },
      ),
    ),
  );
};

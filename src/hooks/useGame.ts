import { useEffect, useRef } from 'react';
import { onDisconnect, ref, set } from 'firebase/database';
import {
  rtdb,
  currentTurnPath,
  metaPath,
  playerPath,
  playersPath,
  rtSubscribe,
} from '@services/firebase';
import { useGameStore } from '../store';
import type { Game, Player, Turn } from '../types';
import type { RTCurrentTurn, RTGameMeta, RTPlayer } from '@/firebase/realtime.schema';

const toPlayer = (player: RTPlayer): Player => ({
  uid: player.uid,
  displayName: player.displayName,
  photoURL: player.photoURL,
  score: player.score,
  lives: player.lives,
  isHost: player.isHost,
  isReady: player.isReady,
  drinksCount: player.drinksCount,
});

const toTurn = (turn: RTCurrentTurn): Turn => ({
  number: turn.number,
  miniGameId: turn.miniGameId,
  gage: turn.gage,
  loserId: turn.loserId,
  results: turn.results ?? {},
  gageValidations: turn.gageValidations ?? {},
  gageRefused: turn.gageRefused,
  status: turn.status,
  startedAt: turn.startedAt,
});

/**
 * Subscribes to a game's live state (meta, players, currentTurn) in the
 * Realtime Database and mirrors it into the game store. Also manages the
 * caller's presence flag via onDisconnect.
 */
export const useGame = (gameId: string | null, uid: string | null) => {
  const setCurrentGame = useGameStore((state) => state.setCurrentGame);

  const metaRef = useRef<RTGameMeta | null>(null);
  const playersRef = useRef<Record<string, RTPlayer>>({});
  const currentTurnRef = useRef<RTCurrentTurn | null>(null);

  useEffect(() => {
    if (!gameId) return;

    const syncStore = () => {
      const meta = metaRef.current;
      if (!meta) {
        setCurrentGame(null);
        return;
      }

      const game: Game = {
        id: meta.id,
        code: meta.code,
        hostId: meta.hostId,
        status: meta.status,
        gageLevel: meta.gageLevel,
        maxPlayers: meta.maxPlayers,
        selectedMiniGames: meta.selectedMiniGames,
        totalTurns: meta.totalTurns,
        currentTurnNumber: meta.currentTurnNumber,
        createdAt: meta.createdAt,
        players: Object.fromEntries(
          Object.entries(playersRef.current).map(([id, player]) => [id, toPlayer(player)]),
        ),
        currentTurn: currentTurnRef.current ? toTurn(currentTurnRef.current) : null,
      };

      setCurrentGame(game);
    };

    const unsubMeta = rtSubscribe<RTGameMeta>(metaPath(gameId), (meta) => {
      metaRef.current = meta;
      syncStore();
    });

    const unsubPlayers = rtSubscribe<Record<string, RTPlayer>>(playersPath(gameId), (players) => {
      playersRef.current = players ?? {};
      syncStore();
    });

    const unsubTurn = rtSubscribe<RTCurrentTurn>(currentTurnPath(gameId), (turn) => {
      currentTurnRef.current = turn;
      syncStore();
    });

    return () => {
      unsubMeta();
      unsubPlayers();
      unsubTurn();
    };
  }, [gameId, setCurrentGame]);

  useEffect(() => {
    if (!gameId || !uid) return;

    const onlineRef = ref(rtdb, `${playerPath(gameId, uid)}/online`);
    void set(onlineRef, true);
    void onDisconnect(onlineRef).set(false);

    return () => {
      void set(onlineRef, false);
    };
  }, [gameId, uid]);
};

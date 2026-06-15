import firestore from '@react-native-firebase/firestore';
import type { Game, Player, Turn } from '../../types';
import { GAME_CODE_LENGTH } from '../../constants';

const gamesCollection = () => firestore().collection('games');
const usersCollection = () => firestore().collection('users');

const generateCode = (): string =>
    Math.random().toString(36).substring(2, 2 + GAME_CODE_LENGTH).toUpperCase();

export const createGame = async (game: Omit<Game, 'id' | 'code'>): Promise<Game> => {
    const code = generateCode();
    const ref = gamesCollection().doc();
    const newGame: Game = { ...game, id: ref.id, code };
    await ref.set(newGame);
    return newGame;
};

export const getGameByCode = async (code: string): Promise<Game | null> => {
    const snapshot = await gamesCollection().where('code', '==', code.toUpperCase()).limit(1).get();
    if (snapshot.empty) return null;
    return snapshot.docs[0].data() as Game;
};

export const joinGame = async (gameId: string, player: Player): Promise<void> => {
    await gamesCollection().doc(gameId).update({
        [`players.${player.uid}`]: player,
    });
};

export const updateGameStatus = async (gameId: string, status: Game['status']): Promise<void> => {
    await gamesCollection().doc(gameId).update({ status });
};

export const updateTurn = async (gameId: string, turn: Turn): Promise<void> => {
    await gamesCollection().doc(gameId).update({ currentTurn: turn });
};

export const updatePlayerScore = async (
    gameId: string,
    playerId: string,
    score: number,
): Promise<void> => {
    await gamesCollection().doc(gameId).update({ [`players.${playerId}.score`]: score });
};

export const subscribeToGame = (
    gameId: string,
    onUpdate: (game: Game) => void,
): (() => void) =>
    gamesCollection()
        .doc(gameId)
        .onSnapshot((doc) => {
            if (doc.exists()) onUpdate(doc.data() as Game);
        });

export const getUserProfile = async (uid: string) => {
    const doc = await usersCollection().doc(uid).get();
    return doc.exists() ? doc.data() : null;
};

export const updateUserProfile = async (uid: string, data: Partial<import('../../types').User>): Promise<void> => {
    await usersCollection().doc(uid).update(data);
};

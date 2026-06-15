import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import type { User } from '../../types';

export const signUp = async (
    email: string,
    password: string,
    displayName: string,
): Promise<User> => {
    const { user } = await auth().createUserWithEmailAndPassword(email, password);
    await user.updateProfile({ displayName });

    const newUser: User = {
        uid: user.uid,
        displayName,
        email,
        photoURL: null,
        createdAt: Date.now(),
        stats: { gamesPlayed: 0, gagesCompleted: 0, gagesRefused: 0, wins: 0 },
    };

    await firestore().collection('users').doc(user.uid).set(newUser);
    return newUser;
};

export const signIn = (email: string, password: string) =>
    auth().signInWithEmailAndPassword(email, password);

export const signOut = () => auth().signOut();

export const onAuthStateChanged = (callback: (user: import('@react-native-firebase/auth').FirebaseAuthTypes.User | null) => void) =>
    auth().onAuthStateChanged(callback);

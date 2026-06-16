import {
  createUserWithEmailAndPassword,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth, db } from './config';
import { doc, setDoc } from 'firebase/firestore';
import type { User } from '../../types';

export const signUp = async (
  email: string,
  password: string,
  displayName: string,
): Promise<User> => {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(user, { displayName });

  const newUser: User = {
    uid: user.uid,
    displayName,
    email,
    photoURL: null,
    createdAt: Date.now(),
    stats: { gamesPlayed: 0, gagesCompleted: 0, gagesRefused: 0, wins: 0, totalDrinksGiven: 0, totalDrinksReceived: 0 },
  };

  await setDoc(doc(db, 'users', user.uid), newUser);
  return newUser;
};

export const signIn = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

export const signOut = () => firebaseSignOut(auth);

export const onAuthStateChanged = (callback: (user: FirebaseUser | null) => void) =>
  firebaseOnAuthStateChanged(auth, callback);

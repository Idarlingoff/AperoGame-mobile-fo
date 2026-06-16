import { getApp, getApps, initializeApp } from 'firebase/app';
import { type Auth, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: 'AIzaSyD_n-579uPbFKXBMGtLhB5GHVYj3BVfLxA',
  authDomain: 'native-game-aa0af.firebaseapp.com',
  databaseURL: 'https://native-game-aa0af-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'native-game-aa0af',
  storageBucket: 'native-game-aa0af.firebasestorage.app',
  messagingSenderId: '268828924364',
  appId: '1:268828924364:android:77743d9a05592f2f3f6569',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth: Auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const rtdb = getDatabase(app);

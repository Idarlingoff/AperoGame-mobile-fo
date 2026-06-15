import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './config';

export const uploadProfilePhoto = async (uid: string, localUri: string): Promise<string> => {
  const storageRef = ref(storage, `profiles/${uid}/avatar.jpg`);
  const response = await fetch(localUri);
  const blob = await response.blob();
  await uploadBytes(storageRef, blob);
  return getDownloadURL(storageRef);
};

export const uploadGageValidationPhoto = async (
  gameId: string,
  turnNumber: number,
  playerId: string,
  localUri: string,
): Promise<string> => {
  const storageRef = ref(storage, `games/${gameId}/turns/${turnNumber}/${playerId}.jpg`);
  const response = await fetch(localUri);
  const blob = await response.blob();
  await uploadBytes(storageRef, blob);
  return getDownloadURL(storageRef);
};

import storage from '@react-native-firebase/storage';

export const uploadProfilePhoto = async (uid: string, localUri: string): Promise<string> => {
    const ref = storage().ref(`profiles/${uid}/avatar.jpg`);
    await ref.putFile(localUri);
    return ref.getDownloadURL();
};

export const uploadGageValidationPhoto = async (
    gameId: string,
    turnNumber: number,
    playerId: string,
    localUri: string,
): Promise<string> => {
    const ref = storage().ref(`games/${gameId}/turns/${turnNumber}/${playerId}.jpg`);
    await ref.putFile(localUri);
    return ref.getDownloadURL();
};

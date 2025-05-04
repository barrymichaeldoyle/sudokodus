import * as Crypto from 'expo-crypto';
import { MMKV } from 'react-native-mmkv';

import { generateId } from './generateId';

const ANONYMOUS_USER_KEY = 'sudokodus_anonymous_user_id';
const STORAGE_KEY = 'anonymous-user-storage';
const storage = new MMKV({ id: STORAGE_KEY });

export function getAnonymousUserId(): string {
  try {
    const existingId = storage.getString(
      ANONYMOUS_USER_KEY
    );
    if (existingId) {
      return existingId;
    }

    // Generate a new UUID if none exists
    const newId = generateId();
    storage.set(ANONYMOUS_USER_KEY, newId);
    return newId;
  } catch (error) {
    console.error(
      'Error managing anonymous user ID:',
      error
    );
    // Fallback to a new UUID if storage fails
    return Crypto.randomUUID();
  }
}

export function clearAnonymousUserId(): void {
  try {
    storage.delete(ANONYMOUS_USER_KEY);
  } catch (error) {
    console.error(
      'Error clearing anonymous user ID:',
      error
    );
  }
}

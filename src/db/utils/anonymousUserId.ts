import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { generateId } from './generateId';

const ANONYMOUS_USER_KEY = 'sudokodus_anonymous_user_id';

export async function getAnonymousUserId(): Promise<string> {
  try {
    const existingId = await AsyncStorage.getItem(
      ANONYMOUS_USER_KEY
    );
    if (existingId) {
      return existingId;
    }

    // Generate a new UUID if none exists
    const newId = generateId();
    await AsyncStorage.setItem(ANONYMOUS_USER_KEY, newId);
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

export async function clearAnonymousUserId(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ANONYMOUS_USER_KEY);
  } catch (error) {
    console.error(
      'Error clearing anonymous user ID:',
      error
    );
  }
}

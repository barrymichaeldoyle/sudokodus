import * as Crypto from 'expo-crypto';

/**
 * Generates a random UUID
 * @returns A random UUID
 */
export function generateId() {
  return Crypto.randomUUID();
}

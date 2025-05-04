import { MMKV } from 'react-native-mmkv';
import { createJSONStorage } from 'zustand/middleware';

export function createZustandStorage(storageKey: string) {
  const storage = new MMKV({ id: storageKey });

  return createJSONStorage(() => ({
    getItem: (name: string) => {
      const value = storage.getString(name);
      return value ?? null;
    },
    setItem: (name: string, value: string) => {
      storage.set(name, value);
    },
    removeItem: (name: string) => {
      storage.delete(name);
    },
  }));
}

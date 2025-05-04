import { MMKV } from 'react-native-mmkv';

export function createMMKVStorage(storageKey: string) {
  const storage = new MMKV({ id: storageKey });

  return {
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
  };
}

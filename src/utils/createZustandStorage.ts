import { createJSONStorage } from 'zustand/middleware';
import { createMMKVStorage } from './createMMKVStorage';

export function createZustandStorage(storageKey: string) {
  const storage = createMMKVStorage(storageKey);

  return createJSONStorage(() => storage);
}

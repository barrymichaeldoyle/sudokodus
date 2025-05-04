import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createZustandStorage } from '../utils/createZustandStorage';

interface SettingsState {
  isHapticFeedbackEnabled: boolean;
  setIsHapticFeedbackEnabled: (
    isHapticFeedbackEnabled: boolean
  ) => void;
}

const STORAGE_KEY = 'sudokudos-settings';
const storage = createZustandStorage(STORAGE_KEY);

export const useSettingsStore = create<SettingsState>()(
  persist(
    set => ({
      isHapticFeedbackEnabled: true,
      setIsHapticFeedbackEnabled: (
        isHapticFeedbackEnabled: boolean
      ) => set({ isHapticFeedbackEnabled }),
    }),
    {
      name: STORAGE_KEY,
      storage,
      partialize: state => ({
        isHapticFeedbackEnabled:
          state.isHapticFeedbackEnabled,
      }),
    }
  )
);

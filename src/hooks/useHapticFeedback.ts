import {
  impactAsync,
  ImpactFeedbackStyle,
  selectionAsync,
} from 'expo-haptics';

import { useSettingsStore } from '../screens/Settings/store';

/**
 * Hook for haptic feedback (looks at settings store for isHapticFeedbackEnabled)
 */
export function useHapticFeedback() {
  const isHapticFeedbackEnabled = useSettingsStore(
    state => state.isHapticFeedbackEnabled
  );

  function handleSelectionAsync() {
    if (isHapticFeedbackEnabled) {
      selectionAsync();
    }
  }

  function handleImpactAsync(style?: ImpactFeedbackStyle) {
    if (isHapticFeedbackEnabled) {
      impactAsync(style);
    }
  }

  return {
    selectionAsync: handleSelectionAsync,
    impactAsync: handleImpactAsync,
  };
}

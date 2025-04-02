import { observable } from '@legendapp/state';
import {} from '@legendapp/state/react';

export const appState = observable({
  puzzleBank: {
    easy: [],
    medium: [],
    hard: [],
    diabolical: [],
  },
  dailyChallenge: {}, // keyed by date string
  userGames: {
    active: {},
    completed: {},
  },
  meta: {
    lastSyncTimestamp: null,
    dailyChallengesSyncedUntil: null,
  },
});

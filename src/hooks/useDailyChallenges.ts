import {
  QueryKey,
  useQuery,
  UseQueryResult,
} from '@tanstack/react-query';

import { useSQLiteContext } from 'expo-sqlite';
import { supabase } from '../db/supabase';
import {
  DailyChallenge,
  DateString,
  DifficultyLevel,
  Puzzle,
} from '../db/types';

export function getDailyChallengesQueryKey(
  date: DateString
): QueryKey {
  return ['dailyChallenges', date];
}
export function getDailyChallengeQueryKey(
  date: DateString,
  difficulty: DifficultyLevel
): QueryKey {
  return ['dailyChallenge', date, difficulty];
}

export function useDailyChallenges(
  date: Date = new Date()
): UseQueryResult<DailyChallenge[]> {
  const db = useSQLiteContext();
  const formattedDate = formatDate(date);

  return useQuery({
    queryKey: getDailyChallengesQueryKey(formattedDate),
    queryFn: async () => {
      // Check if we have local daily challenges
      const localChallenges =
        await db.getAllAsync<DailyChallenge>(
          `SELECT * FROM daily_challenges WHERE date = ?`,
          [formattedDate]
        );

      // If we don't have all difficulties locally, fetch from Supabase
      if (localChallenges.length < 4) {
        try {
          const { data, error } = await supabase
            .from('daily_challenges')
            .select('*, puzzles(*)')
            .eq('date', formattedDate);

          if (error) {
            throw error;
          }

          if (data && data.length > 0) {
            // Store puzzles first
            const puzzles = data
              .map(item => item.puzzles)
              .filter(Boolean) as Puzzle[];
            await db.withTransactionAsync(async () => {
              for (const puzzle of puzzles) {
                await db.runAsync(
                  `INSERT OR IGNORE INTO puzzles (
                    puzzle_string,
                    rating,
                    difficulty,
                    is_symmetric,
                    clue_count,
                    source,
                    created_at
                  ) VALUES (
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?
                  )`,
                  [
                    puzzle.puzzle_string,
                    puzzle.rating,
                    puzzle.difficulty,
                    puzzle.is_symmetric ? 1 : 0,
                    puzzle.clue_count,
                    puzzle.source || 'sudokudus',
                    puzzle.created_at ||
                      new Date().toISOString(),
                  ]
                );
              }
            });

            // Then store daily challenges
            const challenges = data
              .map(
                item =>
                  item.puzzles && {
                    id: item.id,
                    date: item.date,
                    difficulty: item.difficulty,
                    puzzle_string:
                      item.puzzles.puzzle_string,
                  }
              )
              .filter(Boolean) as DailyChallenge[];
            await db.withTransactionAsync(async () => {
              for (const challenge of challenges) {
                await db.runAsync(
                  `INSERT OR REPLACE INTO daily_challenges (
                    id, date, difficulty, puzzle_string
                  ) VALUES (
                    ?,
                    ?,
                    ?,
                    ?
                  )`,
                  [
                    challenge.id,
                    challenge.date,
                    challenge.difficulty,
                    challenge.puzzle_string,
                  ]
                );
              }
            });
          }
        } catch (err) {
          console.error(
            `Error fetching daily challenges from Supabase: ${err}`
          );
          // Continue with local challenges even if remote fetch fails
        }
      }

      // Return local challenges
      return db.getAllAsync<DailyChallenge>(
        `SELECT * FROM daily_challenges WHERE date = ?`,
        [formattedDate]
      );
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}

export function useDailyChallenge(
  date: Date = new Date(),
  difficulty: DifficultyLevel
): UseQueryResult<DailyChallenge> {
  const db = useSQLiteContext();
  const formattedDate = formatDate(date);

  return useQuery({
    queryKey: getDailyChallengeQueryKey(
      formattedDate,
      difficulty
    ),
    queryFn: () =>
      db.getFirstAsync<DailyChallenge>(
        `SELECT * FROM daily_challenges WHERE date = ? AND difficulty = ?`,
        [formattedDate, difficulty]
      ),
  });
}

function formatDate(date: Date): DateString {
  return date.toISOString().split('T')[0] as DateString;
}

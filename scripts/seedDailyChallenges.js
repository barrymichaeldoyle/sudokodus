const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

if (!process.env.EXPO_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  process.exit(1);
}

// Get Supabase URL and Key from line or env vars
const args = process.argv.slice(2);
const urlArg = args.find(arg => arg.startsWith('--url='));

const supabaseUrl = urlArg ? urlArg.split('=')[1] : process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = urlArg ? urlArg.split('=')[1] : process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Function to get random puzzle for a difficulty
async function getRandomPuzzle(difficulty) {
  const { data, error } = await supabase
    .from('puzzles')
    .select('puzzle_string')
    .eq('difficulty', difficulty)
    .order('puzzle_string', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error(`Error getting random puzzle for ${difficulty}:`, error);
    return null;
  }

  return data.puzzle_string;
}

// Function to generate challenges for a specific date
async function generateChallengesForDate(date) {
  const difficulties = ['easy', 'medium', 'hard', 'diabolical'];
  const challenges = [];

  for (const difficulty of difficulties) {
    const puzzleString = await getRandomPuzzle(difficulty);
    if (puzzleString) {
      challenges.push({
        date,
        difficulty,
        puzzle_string: puzzleString,
      });
    }
  }

  if (challenges.length > 0) {
    const { error } = await supabase.from('daily_challenges').upsert(challenges, {
      onConflict: 'date,difficulty',
      ignoreDuplicates: true,
    });

    if (error) {
      console.error(`Error inserting challenges for ${date}:`, error);
    } else {
      console.log(`Generated ${challenges.length} challenges for ${date}`);
    }
  }
}

// Function to generate challenges for a date range
async function generateChallengesForDateRange(startDate, endDate) {
  const currentDate = new Date(startDate);
  const end = new Date(endDate);

  while (currentDate <= end) {
    await generateChallengesForDate(currentDate.toISOString().split('T')[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }
}

// Main function
async function main() {
  const startDate = '2025-05-01';
  const endDate = '2030-12-31';

  console.log(`Generating daily challenges from ${startDate} to ${endDate}`);
  await generateChallengesForDateRange(startDate, endDate);
  console.log('Daily challenges generation complete');
}

// Run the script
main().catch(error => {
  console.error('Generation failed:', error);
  process.exit(1);
});

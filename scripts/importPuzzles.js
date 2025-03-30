// scripts/importPuzzles.js
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');
require('dotenv').config({ path: '.env.local' });

if (!process.env.EXPO_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  process.exit(1);
}

// Get Supabase URL and Key from line or env vars
const args = process.argv.slice(2);
const urlArg = args.find(arg => arg.startsWith('--url='));
const keyArg = args.find(arg => arg.startsWith('--key='));

const supabaseUrl = urlArg ? urlArg.split('=')[1] : process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = keyArg ? keyArg.split('=')[1] : process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Count clues in a puzzle string
function countClues(puzzleString) {
  return (puzzleString.match(/[1-9]/g) || []).length;
}

// Check if a puzzle is symmetric
function isSymmetric(puzzleString) {
  for (let i = 0; i < 40; i++) {
    const oppIndex = 80 - i;
    const hasClue = puzzleString[i] !== '0' && puzzleString[i] !== '.';
    const oppHasClue = puzzleString[oppIndex] !== '0' && puzzleString[oppIndex] !== '.';

    if (hasClue !== oppHasClue) {
      return false;
    }
  }

  return true;
}

// Map rating to difficulty
function ratingToDifficulty(rating) {
  if (rating < 1.5) return 'easy';
  if (rating < 2.5) return 'medium';
  if (rating < 5.0) return 'hard';
  return 'diabolical';
}

// Process file line by line
async function processFile(filePath, difficulty) {
  console.log(`Processing ${difficulty} puzzles from ${filePath}...`);

  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let batch = [];
  let processed = 0;
  let inserted = 0;

  for await (const line of rl) {
    // Skip empty lines or comments
    if (!line.trim() || line.startsWith('#')) continue;

    // Parse line - format could vary but typically: SHA puzzle_string rating
    const parts = line.trim().split(/\s+/);
    if (parts.length < 2) continue;

    // Get puzzle string (typically the second item)
    const puzzleString = parts[1].replace(/\./g, '0');

    // Get rating (always the third field)
    const rating = parseFloat(parts[2]);

    // Skip invalid puzzle strings
    if (puzzleString.length !== 81 || !/^[0-9]+$/.test(puzzleString)) continue;

    // Add to batch
    batch.push({
      puzzle_string: puzzleString,
      rating: rating,
      difficulty: ratingToDifficulty(rating),
      clue_count: countClues(puzzleString),
      is_symmetric: isSymmetric(puzzleString),
    });

    // Process in batches of 100
    if (batch.length >= 100) {
      const { error, count } = await insertBatch(batch);
      processed += batch.length;
      inserted += count;
      console.log(`Processed ${processed} puzzles, inserted ${inserted}`);
      batch = [];
    }
  }

  // Insert remaining puzzles
  if (batch.length > 0) {
    const { error, count } = await insertBatch(batch);
    processed += batch.length;
    inserted += count;
  }

  console.log(`Completed ${difficulty}: processed ${processed}, inserted ${inserted}`);
  return { processed, inserted };
}

// Insert a batch of puzzles
async function insertBatch(puzzles) {
  try {
    const { error } = await supabase
      .from('puzzles')
      .upsert(puzzles, { onConflict: 'puzzle_string' });

    if (error) {
      console.error('Error inserting batch:', error);
      return { error, count: 0 };
    }

    return { error: null, count: puzzles.length };
  } catch (err) {
    console.error('Exception inserting batch:', err);
    return { error: err, count: 0 };
  }
}

// Main function
async function main() {
  const difficulties = [
    { name: 'easy', file: './scripts/data/easy.txt' },
    { name: 'medium', file: './scripts/data/medium.txt' },
    { name: 'hard', file: './scripts/data/hard.txt' },
    { name: 'diabolical', file: './scripts/data/diabolical.txt' },
  ];

  console.log(`Importing puzzles to Supabase at ${supabaseUrl}`);

  let totalProcessed = 0;
  let totalInserted = 0;

  for (const diff of difficulties) {
    // Check if file exists
    if (!fs.existsSync(diff.file)) {
      console.log(`File not found: ${diff.file}`);
      continue;
    }

    const { processed, inserted } = await processFile(diff.file, diff.name);
    totalProcessed += processed;
    totalInserted += inserted;
  }

  console.log(`Import complete: processed ${totalProcessed}, inserted ${totalInserted}`);
}

// Run the script
main().catch(error => {
  console.error('Import failed:', error);
  process.exit(1);
});

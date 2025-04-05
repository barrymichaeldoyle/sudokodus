# Supabase Docs

This file documents the Supabase database structure, migrations, and related scripts for the Sudoku app.

## Database Schema

The database schema is organized in `supabase/schema/`:

- Individual component files are in subdirectories (tables, policies, etc.)
- `current_schema.sql` contains the complete current schema

### Making Schema Changes

1. Update the appropriate files in the schema directory
2. Run `./scripts/update_schema.sh` to update the combined schema file
3. Run `./scripts/create_migration.sh migration_name` to generate a migration
4. Apply the migration with `supabase db push`

## Scripts

- `./scripts/update_schema.sh` - Combines individual schema files into a complete schema
- `./scripts/create_migration.sh <name>` - Generates a migration file from schema changes

## Initial Setup

For a new environment, follow these steps:

1. Link to your Supabase project: `supabase link --project-ref <project-id>`
2. Run the initial migration: `supabase db push`
3. Seed the database with puzzles: `./scripts/seed_puzzles.sh` (if applicable)

## Known Issues

- The pg_cron extension must be enabled for the cleanup functions to work properly
- If you encounter extension-related errors during migration, make sure extensions are properly installed

## Puzzles Data

The puzzles in the `scripts/data` folder come from the public domain repo [sudoku-exchange-puzzle-bank](https://github.com/grantm/sudoku-exchange-puzzle-bank/blob/master/README.md).

The puzzles were generated using the
[QQWing Sudoku](https://github.com/stephenostermiller/qqwing) software, which
ensure that each puzzle has a unique solution.
The generated puzzles were then graded using
[Sukaku Explainer](https://github.com/SudokuMonster/SukakuExplainer) and
sorted into four 'buckets':

| Difficulty | Rating |
| ---------- | ------ |
| Easy       | < 1.5  |
| Medium     | < 2.5  |
| Hard       | < 5.0  |
| Diabolical | ≥ 5.0  |

### Puzzle Format

Each text file has one puzzle per line, represented as three space-separated
fields and a Unix-style line-ending, for a total of 100 bytes per record:

     12 bytes of SHA1 hash of the digits string (for randomising order)
     81 bytes of puzzle digits
      4 bytes of rating (nn.n)
      3 bytes of white-space (including the linefeed);
    100 bytes total

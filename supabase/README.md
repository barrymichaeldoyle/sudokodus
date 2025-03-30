# Supabase Docs

This file is here to document the order of `migrations` that need to occur in Supabase as well as `scripts` that are required for running those migrations from the command line and seeding the DB.

## Puzzles

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

Each text file has one puzzle per line, represented as three space-separated
fields and a Unix-style line-ending, for a total of 100 bytes per record:

     12 bytes of SHA1 hash of the digits string (for randomising order)
     81 bytes of puzzle digits
      4 bytes of rating (nn.n)
      3 bytes of white-space (including the linefeed);
    100 bytes total

## Supabase commands

Whenever making updates to the `Supabase` migrations, you need to run `supabase db push`. Make you have the `supabase` cli tool installed to do this. You will need to run `supabase login` and `supabase link` to get your environment connected to the right supabase project.

For seeding the DB, we use a node script in `scripts` called `importPuzzles.js`. This easier than trying to use SQL commands since it does involve some data processing to convert the .txt file contents to valid data for our puzzles table.

## Environments

### Local Development

For local development use `supabase start` which will set everything up for you in Docker. then run `supabase db reset` to apply migrations to your local DB

### Production

When you're ready to deploy changes, run `supabase db push --project-ref your-production-ref`

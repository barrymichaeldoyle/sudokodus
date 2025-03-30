# Supabase Docs

This file is here to document the order of `migrations` that need to occur in Supabase as well as `scripts` that are required for running those migrations from the command line and seeding the DB.

## Puzzles

The puzzles in the `puzzle` folder come from the public domain repo [sudoku-exchange-puzzle-bank](https://github.com/grantm/sudoku-exchange-puzzle-bank/blob/master/README.md).

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

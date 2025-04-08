# Local First Architecture

The following items are things we need to esnure work for our local first architecture to provide a good user experience for our Sudoku app.

## Tech Stack

### Supabase

A Postgres DB for storing our puzzle bank, daily challenges, users, user settings, and game states (completed and in progress).

Supabase also handles user authentication and allows us to let users start using the app as an anonymous user before creating an account later to save their progress.

### TanStack's React Query

A powerful library to manage our queries and mutations

### React Native with Expo

Allows us to build cross platform applications with ease. Although we plan to support Web and Android in future, our MVP will be for iOS.

### Zustand

For global app state management.

## Goal

We want to build a local first architecture because later on we want to do features like acheivements for games complete, leaderboard and stats for certain puzzles, i.e. how many people have completed specific puzzles.

## Important Considerations

The puzzle bank has almost a million puzzles in it with 4 different difficulties, namely ", "medium", "hard", "diabolical".

Upon first loading the app, we need to immediately fetch about 100 puzzles of each difficulty so that the user can play offline if needed. Everytime the user finishes at least 50 of their available puzzles, i.e. there are less than 50 left, we need to fetch more! Bare in mind that during testing we might not have 50 more puzzles to fetch, so we should stop trying to fetch if the bank is depleted.

We will have a tab for games currently active, i.e. games that have started but haven't finished yet. We should allow the user to have up to 100 active games at a time (i.e. uncompleted), beyond that we will prevent them from creating more until their either abandon an active game (i.e. delete the record) or complete the active game.

If a user returns to a game via a deeplink or something that they have already completed, we need to give them the option to replay that game (without marking their game as incomplete, since we want to maintain their stats).

The user's game state needs to be stored as part of an active game so that they can return to the game. These should sync to the remote DB everytime a user starts a new game or completes a new game. We should aslo checked for local changes in the game state every minute, if a change has occured, we should sync it to the database.

Daily challenges should work pretty much the same as active games, the only difference is those are set in stone, they're not randomly fetched like the normal way we start a new game. Each daily puzzle is predefined in the database per day (1 of each difficulty per day). This is so that users can all work on the same daily puzzle together every day.

User settings should also be synced with the remote database so that data is synced when they come back.

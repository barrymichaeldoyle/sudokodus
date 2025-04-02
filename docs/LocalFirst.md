# Local First Architecture

In order to ensure this app works well offline, we're going for a local first architecture. We're using LegendState because that syncs nicely with Supabase and Expo.

## First Load

Upon initially loading the app we need to fetch some of the puzzles from the puzzle bank for each difficulty so that the user can start playing right away without any interruptions if they lose internet connectivity.

# Companion — CBT tracker (MVP)

React + TypeScript + Vite, no backend. All data lives in `localStorage`. A
wellness/CBT companion (Behavioral Activation), not a diagnostic device.

## Stack & commands

- `npm run dev` — dev server
- `npm test` — Vitest, runs `src/domain/*.test.ts`
- `npm run typecheck` — `tsc -b --noEmit`
- `npm run build` — typecheck + production build

## Structure

- `src/domain/` — pure, unit-tested clinical/scoring logic (PHQ-9, axis
  placement, profiles, dashboard smoothing, streaks, insights, xp). Each
  module has a co-located `*.test.ts`. Business logic changes belong here.
- `src/screens/` — top-level routed screens (Onboarding, Today, Log,
  Insights, Safety) + their own `.css`.
- `src/components/` — shared presentational components (MoodGrid, Likert,
  GrowthMeter, etc.) + co-located `.css`.
- `src/store/store.tsx` — app state/context, persists to `localStorage`.
- `src/styles/tokens.css` — design tokens; `src/styles/global.css` — base
  styles.

## Docs — read only when the task needs them, not proactively

- `PRODUCT.md` / `DESIGN.md` — strategic register / visual system. Only
  relevant for UI/design work (the `impeccable` skill reads these itself).
- `PLANNING.md`, `ACTIVITY_SCORE.md`, `IDEAS.md`, `COMPETITIVE.md` —
  long-form roadmap/strategy notes (~1000 lines combined). Do not read
  these to answer routine coding questions; grep for a specific term in
  them only if the task explicitly concerns roadmap/scoring/competitive
  strategy.

## Conventions

- No backend/API calls — everything is client-side and synchronous.
- Keep clinical logic in `src/domain/` pure and tested; UI components stay
  presentational.

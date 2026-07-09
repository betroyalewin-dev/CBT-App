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
- Any new or edited user-facing copy in `src/screens/` or `src/components/`
  should go through the `humanizer` skill using `docs/VOICE.md` as the style
  reference before landing.

## PR workflow

- After opening a PR from a Claude Code session, mark it ready for review
  (undraft) and merge it into `main` once required CI checks pass (or
  immediately if the repo has no required checks configured). Don't wait
  for a human approval step.
- This auto-merge policy applies only to PRs Claude itself opens going
  forward — it does not retroactively apply to PRs already open before
  this policy existed.

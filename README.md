# Companion — a calm CBT tracker

A data-driven CBT companion for people with depression, grounded in **Behavioral
Activation (BA)**. It captures mood as a valence×arousal point plus Pleasure and
Mastery per activity, reflects it on a two-axis dashboard, and frames findings as
**experiments to test**, never verdicts. Safety routing is always on.

> A wellness/CBT companion, **not** a diagnostic medical device. No diagnostic
> claims, no treatment guarantees.

This is the **first-draft MVP** of the loop described in [`PLANNING.md`](./PLANNING.md).

## What's in this draft

- **Onboarding** — welcome/privacy framing → PHQ-9 (with an item-9 safety branch)
  → axis placement → a warm profile reveal → values → starter activities → first log.
- **Daily logging** — 2-tap fast path: the circumplex **mood grid** + Pleasure /
  Mastery sliders, optional note.
- **Today** — the **2×2 reward×stress dashboard** (3-day smoothed dot) with
  per-quadrant advice, a forgiving streak, and a trend strip.
- **Insights** — "patterns worth testing," each turnable into an experiment.
- **Support** — always-reachable 988 routing, a breathing tool, and a safety plan.

All data lives in `localStorage` on the device — nothing is uploaded.

## Stack

React + TypeScript + Vite. No backend. The clinical/scoring logic lives in
`src/domain/` as pure, unit-tested functions (PHQ-9, axis placement, profile
assignment, dashboard smoothing, forgiving streaks, insight generation).

## Run it

```bash
npm install
npm run dev        # dev server
npm test           # run the domain test suite (Vitest)
npm run build      # type-check + production build
```

## Project context (for design work)

- [`PRODUCT.md`](./PRODUCT.md) — strategic register, users, principles.
- [`DESIGN.md`](./DESIGN.md) — visual system, tokens, components.
- Built with the **superpowers** and **impeccable** agent toolkits.

## Not yet built (see `PLANNING.md` §8 roadmap)

Scheduling / graded tasks, TRAP→TRAC avoidance capture, anticipated-vs-actual
experiment tracking persistence, JITAI nudges, clinician export, and population
priors are intentionally post-MVP.

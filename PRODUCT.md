# Product

## Register

product

## Users

People living with depression (and, at the edges, anxiety) who want to understand
what actually helps *them*. Their context when they open the app is the hard part:
**low energy, low motivation, often late at night, frequently feeling that nothing
will help.** Activation energy is scarce by definition of the condition, so every
screen has to assume a tired, skeptical, possibly distressed user.

Secondary users (later): the clinician who receives a clean between-session summary.

The job to be done: *"Tell me, from my own data, what moves my mood and what
drains it — and make logging so easy I'll actually do it."*

## Product Purpose

A behavior-and-mood tracker grounded in **Behavioral Activation (BA)** — the most
evidence-based behavioral treatment for depression. It captures high-resolution
daily data (mood as a valence×arousal point, plus Pleasure and Mastery per
activity), reflects it back on a two-axis dashboard, and turns patterns into
**n-of-1 experiments** rather than verdicts. Safety (crisis detection + 988
routing + a safety plan) is always on.

Success = the user logs regularly because it's frictionless, sees an honest
insight they couldn't have gotten from a mood-only app ("your mood is okay but
mastery has been near-zero all week"), and turns it into one small scheduled
action.

Positioning guardrail: a **wellness/CBT companion, not a diagnostic medical
device.** No diagnostic claims, no treatment guarantees.

## Brand Personality

Calm · honest · on-your-side. The voice of a steady, well-trained friend — warm
and plain-spoken, never clinical-cold and never chirpy-wellness. It does not
shame, does not over-promise, and does not gamify pain. Three words:
**grounded, gentle, candid.**

Emotional goal: the user should feel *met where they are* and a little less alone
with their data — never judged, never sold to.

## Anti-references

- **Clinical/medical dashboards** (charts that look like a hospital EMR, cold blues
  on white, dense tables). This is a companion, not a chart.
- **Chirpy wellness apps** that infantilize ("You've got this! 🎉"), shame streaks
  ("You broke your 12-day streak!"), or bury crisis support behind a paywall.
- **Gamified habit apps** where points/XP are the point — anhedonia makes extrinsic
  rewards feel hollow, which is literally the symptom.
- **AI-slop SaaS**: identical card grids, gradient-text headings, tiny tracked
  uppercase eyebrows over every section, hero-metric templates.

## Design Principles

1. **Frictionless for a tired user.** The core loop (log a mood + P/M) is 2 taps.
   Depth is always optional and never blocks the fast path. If logging is a chore,
   the dataset dies.
2. **Honest before clever.** Surface "patterns worth testing," never "this works
   for you." Confounded, noisy data gets framed as a hypothesis, not a verdict.
3. **One coordinate system.** Mood capture (valence×arousal grid) and the
   dashboard (reward×stress 2×2) share axes, so the dashboard dot reads as the
   user's own taps smoothed — not a mysterious computation.
4. **Safety is ambient and unconditional.** Always reachable, never gamified, never
   gated, never adds "are you sure?" friction.
5. **Forgiving by design.** Grace days and "welcome back," never punishment.
   Reward insight ("you unlocked a pattern about your sleep"), not compliance.

## Accessibility & Inclusion

- Target **WCAG 2.2 AA**. Body text ≥4.5:1, large text ≥3:1, including the muted
  helper copy that tired eyes read most.
- The 2×2 / mood quadrants must not rely on color alone — pair color with
  position, labels, and shape so they work for color-vision deficiency.
- Full `prefers-reduced-motion` support: the dashboard dot and reveals degrade to
  instant/crossfade. Distress is not the moment for bouncy motion.
- Large tap targets (≥44px) and high-contrast focus states for low-dexterity,
  low-energy use; everything reachable by keyboard.

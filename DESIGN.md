# Design

> Visual system for the CBT companion. Source of truth for color, type, motion,
> and the components the app is built from. Tokens live in `src/styles/tokens.css`.

## Theme

**Scene:** late evening, low light, a tired person on the couch tapping to log how
they feel. The app should read as a *calm, warm friend in a dim room* — not a
clinical chart under fluorescent light.

Light theme by default with a real dark theme (`prefers-color-scheme`), because a
large share of use is at night and forcing a bright white screen on a depressed
user at 1am is its own small cruelty. Both themes keep the surface quiet and let
the **brand colors + typography** carry the warmth.

Color strategy: **restrained** — quiet surfaces, one calm teal primary, one warm
accent reserved for the human/hope moments (reward, encouragement). The four
quadrant colors are a small, deliberate data palette, not decoration.

## Color

OKLCH throughout. Primary hue anchored at 200° (calm teal/water); warm accent at
~45° (terracotta-coral) carries hope without shouting.

### Light (default)
| Role | OKLCH | Use |
|---|---|---|
| `--bg` | `oklch(0.985 0.004 220)` | App background — barely-cool off-white (evening, not clinical) |
| `--surface` | `oklch(1 0 0)` | Cards, sheets |
| `--surface-2` | `oklch(0.965 0.006 220)` | Insets, pressed states |
| `--ink` | `oklch(0.24 0.02 240)` | Primary text (≈13:1 on bg) |
| `--ink-muted` | `oklch(0.46 0.02 240)` | Helper text (≥4.5:1 — verified, not light gray) |
| `--line` | `oklch(0.90 0.006 220)` | Borders, dividers |
| `--primary` | `oklch(0.55 0.10 205)` | Primary actions, calm axis, links |
| `--primary-ink` | `oklch(0.99 0.005 205)` | Text on primary |
| `--accent` | `oklch(0.66 0.14 45)` | Warmth/hope: encouragement, reward highlights |

### Dark
| Role | OKLCH |
|---|---|
| `--bg` | `oklch(0.20 0.015 240)` |
| `--surface` | `oklch(0.245 0.018 240)` |
| `--surface-2` | `oklch(0.29 0.02 240)` |
| `--ink` | `oklch(0.95 0.01 220)` |
| `--ink-muted` | `oklch(0.74 0.015 220)` |
| `--line` | `oklch(0.36 0.02 240)` |
| `--primary` | `oklch(0.70 0.10 205)` |
| `--accent` | `oklch(0.74 0.13 50)` |

### Quadrant palette (mood grid + 2×2 dashboard — shared coordinate system)
Distinct hues that also differ in lightness, paired with position + label + icon
so they never rely on color alone.
| Quadrant | Meaning | OKLCH |
|---|---|---|
| `--q-thriving` | high reward + calm (engaged, calm) | `oklch(0.70 0.11 165)` (green) |
| `--q-stressed` | high reward + overloaded (busy, rewarding) | `oklch(0.74 0.13 70)` (amber) |
| `--q-numb` | low reward + calm ("rich-kid", nothing lands) | `oklch(0.66 0.07 255)` (slate-blue) |
| `--q-flat` | low reward + overloaded (drowning + numb) | `oklch(0.62 0.12 20)` (muted rose) |

Safety/crisis uses a deliberate, non-alarming but unmistakable `oklch(0.55 0.16 25)`
— present and calm, never a flashing red alert.

## Typography

Contrast-axis pairing, no web-font network dependency (fast, offline-friendly,
respects a flaky connection):
- **Display / headings:** `Georgia, "Iowan Old Style", "Times New Roman", serif` —
  a warm, human serif. Affect labeling and reflection deserve a literary, calm
  voice, not a UI sans.
- **Body / UI:** system humanist sans (`-apple-system, "Segoe UI", Roboto,
  "Helvetica Neue", Arial, sans-serif`).
- **Numerals/data:** `ui-monospace, "SF Mono", Menlo, monospace` for scores.

Rules: body line length 60–70ch; `text-wrap: balance` on h1–h3; display clamp max
≤ 3rem (this is an app, not a landing page — calm, not shouting); letter-spacing
floor −0.02em.

## Spacing & Layout

- Spacing scale (rem): `0.25 0.5 0.75 1 1.5 2 3 4`, varied for rhythm (not uniform).
- Radius scale: `8px` controls, `16px` cards/sheets, `999px` pills. Soft, never sharp.
- Mobile-first single column, max content width ~30rem (`480px`) centered — this is
  a phone-shaped companion even on desktop.
- Bottom tab bar (Today · Log · Insights · Safety) — thumb-reachable, always shows
  the safety route.
- No card-grid reflex; sections separated by space + a single hairline, not boxes
  in boxes. **Nested cards banned.**

## Motion

- Ease-out only (`cubic-bezier(0.22, 1, 0.36, 1)`), ~180–260ms. No bounce, no
  elastic — wrong register for this user.
- The dashboard dot animates to its smoothed position on load (a gentle settle),
  staggered trend bars. Mood-grid dot follows the finger 1:1 (no lag).
- Every animation has a `prefers-reduced-motion: reduce` path: instant placement /
  crossfade. Required, not optional.

## Components

- **MoodGrid** — square valence×arousal pad; draggable/tappable dot; quadrant
  tints + emotion-word regions; 5-second first-use coach mark.
- **PMSlider** — 0–10 Pleasure / Mastery sliders, default to last value, large thumb.
- **QuadrantPad** — the dashboard 2×2; smoothed dot, current quadrant highlighted,
  per-quadrant advice card below.
- **TrendStrip** — compact valence/P/M sparkline + "this week vs last".
- **SafetyBar / SafetySheet** — always-reachable; 988 call/text, breathing,
  safety-plan recall.
- **Stepper** — onboarding progress; calm, no countdown pressure.
- **Likert** — PHQ-9 / axis items, 0–3 large radio rows.

## Absolute bans (project)

Gradient text · side-stripe borders · glassmorphism-by-default · identical card
grids · tracked-uppercase eyebrows on every section · numbered section markers ·
streak-shaming · gating safety behind anything · color-only quadrant encoding.

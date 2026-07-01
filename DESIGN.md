---
name: Companion
description: A calm, data-driven CBT companion grounded in Behavioral Activation.
colors:
  bg-evening: "oklch(0.985 0.004 220)"
  surface: "oklch(1 0 0)"
  surface-inset: "oklch(0.965 0.006 220)"
  ink: "oklch(0.24 0.02 240)"
  ink-muted: "oklch(0.46 0.02 240)"
  line: "oklch(0.90 0.006 220)"
  tide-primary: "oklch(0.55 0.10 205)"
  tide-primary-strong: "oklch(0.48 0.11 205)"
  tide-primary-ink: "oklch(0.99 0.005 205)"
  tide-primary-wash: "oklch(0.95 0.03 205)"
  ember-accent: "oklch(0.66 0.14 45)"
  ember-accent-wash: "oklch(0.95 0.04 45)"
  quadrant-thriving: "oklch(0.70 0.11 165)"
  quadrant-thriving-wash: "oklch(0.95 0.04 165)"
  quadrant-stressed: "oklch(0.74 0.13 70)"
  quadrant-stressed-wash: "oklch(0.96 0.05 70)"
  quadrant-numb: "oklch(0.66 0.07 255)"
  quadrant-numb-wash: "oklch(0.95 0.025 255)"
  quadrant-flat: "oklch(0.62 0.12 20)"
  quadrant-flat-wash: "oklch(0.96 0.04 20)"
  safety: "oklch(0.55 0.16 25)"
  safety-wash: "oklch(0.96 0.04 25)"
typography:
  display:
    fontFamily: "Georgia, \"Iowan Old Style\", \"Times New Roman\", serif"
    fontWeight: 600
    letterSpacing: "-0.015em"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif"
    fontSize: "16px"
    lineHeight: 1.55
  mono:
    fontFamily: "ui-monospace, \"SF Mono\", Menlo, Consolas, monospace"
rounded:
  control: "10px"
  card: "16px"
  pill: "999px"
spacing:
  1: "0.25rem"
  2: "0.5rem"
  3: "0.75rem"
  4: "1rem"
  5: "1.5rem"
  6: "2rem"
  7: "3rem"
  8: "4rem"
components:
  button-primary:
    backgroundColor: "{colors.tide-primary}"
    textColor: "{colors.tide-primary-ink}"
    rounded: "{rounded.pill}"
    padding: "0 24px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.tide-primary-strong}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
  panel:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
    padding: "24px"
  pill-selected:
    backgroundColor: "{colors.tide-primary-wash}"
    textColor: "{colors.tide-primary-strong}"
    rounded: "{rounded.pill}"
---

# Design System: Companion

## Overview

**Creative North Star: "A calm friend in a dim room"**

Companion is built for one recurring scene: late evening, low light, a tired
person on the couch tapping to log how they feel. Every design decision is
tested against that scene — not "does this look good in a portfolio," but
"does this feel kind to someone with no energy to spare, possibly at 1am,
possibly in crisis." The system reads as a steady, well-trained friend: warm
and plain-spoken, never clinical-cold, never chirpy-wellness.

This is explicitly **not** a clinical/medical dashboard (no hospital-EMR
charts, no cold blues on white, no dense tables) and explicitly **not** a
chirpy wellness app or gamified habit tracker (no exclamation-mark
cheerleading, no streak-shaming, no points-are-the-point gamification —
anhedonia makes extrinsic rewards feel hollow, which is literally the
symptom this product treats). Color strategy is **restrained**: quiet
neutral surfaces, one calm teal primary, one warm accent reserved for
human/hope moments. The four mood-quadrant hues are a small, deliberate data
palette, not decoration — the only place the system spends color freely.

**Key Characteristics:**
- Restrained color, spent deliberately (one primary, one accent, four data hues)
- Literary serif for reflection, humanist sans for interface, mono for numbers
- Soft geometry throughout — no sharp corners, no side-stripe accents
- Ease-out-only motion, never bouncy, always reduced-motion-safe
- Safety is ambient furniture, never a modal, never gated

## Colors

OKLCH throughout — chosen because it keeps perceived lightness and chroma
consistent across the teal/coral/quadrant hue family, which matters when a
depressed, possibly light-sensitive user is switching between light and dark
at 1am. Primary hue anchored at 205° (calm teal/water); warm accent at 45°
(terracotta-coral) carries hope without shouting. The frontmatter above
carries the light-theme values as canonical; the table below adds the dark
counterparts (`prefers-color-scheme: dark`), since the token schema doesn't
carry theme variants natively.

### Primary
- **Tide** (`oklch(0.55 0.10 205)` / dark `oklch(0.70 0.10 205)`): the calm axis — primary buttons, active states, links, the mood-grid and dashboard dot. Used sparingly enough that its appearance always means "this is the interactive, trustworthy thing."

### Secondary
- **Ember** (`oklch(0.66 0.14 45)` / dark `oklch(0.74 0.13 50)`): warmth and hope, reserved for reward and encouragement moments — XP reward bursts, the BA-loop diagram's "reinforcement" arrow, slider thumbs on effort/mastery inputs. Never used for structural UI; if it shows up, something good just happened.

### Neutral
- **Evening Bone** (`oklch(0.985 0.004 220)`): app background, barely-cool off-white — deliberately not a bright clinical white, and not a cream/sand AI-default either (chroma stays near zero, tinted only fractionally toward the brand's own cool hue).
- **Paper** (`oklch(1 0 0)`): cards, sheets, the surfaces content sits on.
- **Inset Bone** (`oklch(0.965 0.006 220)`): pressed states, insets, the unfilled track of sliders.
- **Ink** (`oklch(0.24 0.02 240)`, ≈13:1 on background): primary text.
- **Ink Muted** (`oklch(0.46 0.02 240)`, verified ≥4.5:1 — not a decorative light gray): helper copy, timestamps, the text tired eyes read most.
- **Hairline** (`oklch(0.90 0.006 220)`): borders and dividers; the only structural line in the system.

### Data (Quadrant Palette)
Four distinct hues that also differ in lightness, always paired with position + label + icon so meaning never rides on color alone — this is the one place PRODUCT.md's accessibility line ("must not rely on color alone") is load-bearing.
- **Thriving Green** (`oklch(0.70 0.11 165)`): high reward + calm — engaged and steady.
- **Stressed Amber** (`oklch(0.74 0.13 70)`): high reward + overloaded — busy but rewarding.
- **Numb Slate** (`oklch(0.66 0.07 255)`): low reward + calm — nothing is landing.
- **Flat Rose** (`oklch(0.62 0.12 20)`): low reward + overloaded — drowning and numb at once.

Each quadrant hue ships with a paired `-wash` tint (`oklch(0.95-0.96 0.02-0.05 <hue>)`) used as the region/background fill, so the saturated hue itself stays reserved for the dot, icon, and label chip.

### Signal
- **Safety Coral** (`oklch(0.55 0.16 25)` / dark `oklch(0.68 0.16 28)`): crisis/support routing — present and unmistakable, never a flashing alert red. Its wash (`oklch(0.96 0.04 25)`) tints the always-visible support surfaces so they read as furniture, not an emergency banner.

### Named Rules
**The Rarity Rule.** Ember accent appears only at moments of genuine reward or encouragement — never as decoration, never as a structural color. If it's on screen and nothing good just happened, remove it.

**The No Color-Only Rule.** Every quadrant and safety signal pairs its color with position, a label, and an icon. A screen that only a sighted, color-typical user can read is a broken screen, not a finished one.

## Typography

**Display Font:** Georgia, "Iowan Old Style", "Times New Roman" (serif)
**Body Font:** -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial (humanist sans)
**Mono Font:** ui-monospace, "SF Mono", Menlo, Consolas (numerals and scores)

**Character:** A contrast-axis pairing chosen for register, not decoration — the warm literary serif carries affect-labeling and reflection ("how did that feel"), while the plain humanist sans carries the interface itself ("tap here"). No web-font network dependency: fast, offline-friendly, respects a flaky connection, and never makes a tired user wait on a font swap.

### Hierarchy
- **Display / H1** (serif, weight 600, `clamp(1.6rem, 1.2rem + 2vw, 2.2rem)`, line-height 1.18, letter-spacing −0.015em): screen titles and reflective prompts. Capped low relative to a landing page — this is an app, not a hero section; calm, not shouting.
- **H2** (serif, weight 600, `clamp(1.3rem, 1.05rem + 1.2vw, 1.6rem)`, line-height 1.18): section headers within a screen.
- **H3** (serif, weight 600, 1.12rem): sub-section labels, card headers.
- **Body** (sans, weight 400, 16px, line-height 1.55, max 68ch): all interface copy and prose; `text-wrap: pretty` to reduce orphans.
- **Label** (sans, weight 500-600, 0.72–0.85rem): tab labels, hints, eyebrow-style meta text — used sparingly, never as a tracked-uppercase eyebrow over every section.
- **Numeral** (mono, tabular-nums): PHQ-9 scores, P/M values, XP counters — anywhere a number needs to feel measured rather than decorative.

### Named Rules
**The Calm Ceiling Rule.** Display clamp max stays ≤ 2.2rem in-app (not the 3–6rem a landing page could use). This product never needs to shout to be heard.

## Elevation

Elevation is **flat-and-quiet by default, lifted only for floating/actionable surfaces.** Most content (panels, cards) sits on a single, very soft ambient shadow that reads as "resting on the background," not "hovering above it." Depth escalates only for the two surfaces that are genuinely floating in the viewport: the bottom tab bar (blurred glass over content) and the XP reward toast.

### Shadow Vocabulary
- **Resting** (`box-shadow: 0 1px 2px oklch(0.4 0.02 240 / 0.06), 0 1px 3px oklch(0.4 0.02 240 / 0.08)`): default elevation for panels, primary buttons, slider thumbs — barely-there, just enough to separate surface from background.
- **Lifted** (`box-shadow: 0 6px 24px oklch(0.4 0.02 240 / 0.1)`): reserved for genuinely floating elements — the XP reward toast, modal-adjacent sheets.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat or resting-shadow at rest. Nothing gets the lifted shadow just for looking important; it's earned by actually floating over content.

## Components

Buttons, panels, and pills all use full-radius geometry (pill or 16px card corners) — nothing sharp, nothing with a colored side-stripe. Interactive elements favor generous tap targets (44–54px) over dense compactness, because the target user's dexterity and patience are both variable.

### Buttons
- **Shape:** full pill (`border-radius: 999px`), min-height 48px, horizontal padding 24px (`{spacing.5}`).
- **Primary:** `{colors.tide-primary}` background, `{colors.tide-primary-ink}` text, Resting shadow; hover shifts to `{colors.tide-primary-strong}`; active scales to 0.98 for tactile press feedback.
- **Ghost:** transparent background, 1px `{colors.line}` border, `{colors.ink}` text — the secondary/tertiary action.
- **Disabled:** 45% opacity, `cursor: not-allowed`, no hover treatment.

### Pills / Chips
- **Style:** full pill radius, `{colors.surface}` background, 1px `{colors.line}` border, min-height 44px — used for selectable option sets (values, starter activities).
- **Selected state:** `{colors.tide-primary-wash}` background, `{colors.tide-primary}` border, `{colors.tide-primary-strong}` text, weight bumps to 600. No color-only affordance: selection also carries `aria-pressed`.

### Panels / Cards
- **Corner style:** 16px radius (`{rounded.card}`).
- **Background:** `{colors.surface}`, 1px `{colors.line}` border.
- **Shadow:** Resting (see Elevation).
- **Internal padding:** 24px (`{spacing.5}`).
- **The Nested-Card Ban:** panels never contain another panel. Sections separate by space + a single hairline, not boxes-in-boxes.

### Inputs (Sliders / Likert rows)
- **Slider track:** 8px tall, pill radius, `{colors.surface-inset}` background, 1px `{colors.line}` border; thumb is a 30px circle in `{colors.tide-primary}` (or `{colors.ember-accent}` for the accent variant) with a 3px `{colors.surface}` ring and Resting shadow — large enough for a low-dexterity tap-and-drag.
- **Likert row:** full-width row, 52px min-height, pill-free 10px radius, 1px `{colors.line}` border, leading 20px selection dot; selected state mirrors the Pill selected treatment (wash background, primary border/text, filled dot).

### Navigation (Bottom Tab Bar)
- Fixed, centered, capped at the 480px content width; `color-mix` translucent surface at 88% opacity with `backdrop-filter: blur(12px)` over a 1px top hairline — reads as glass-over-content only here, nowhere else in the system.
- Four thumb-reachable destinations (Today · Log · Insights · Safety); the center Log tab is visually promoted with a filled primary-color circle behind its icon.
- Active state: `{colors.tide-primary-wash}` background + `{colors.tide-primary-strong}` icon/label, except the Safety tab, which always renders in `{colors.safety}` / `{colors.safety-wash}` regardless of active state — safety is never visually "just another tab."

### Safety Surface (signature component)
The always-reachable support affordance (app-bar button + tab-bar entry + full sheet) is the one place the system explicitly breaks its own restraint rule: `{colors.safety}` may appear at rest, not just on interaction, because unmistakable trumps quiet here. It is never gated behind a click-through, never styled as an alarm (no red flashing, no siren iconography) — border + wash + a steady label.

## Do's and Don'ts

### Do:
- **Do** use OKLCH for every color token; keep the primary hue at 205° and the accent at 45° so new colors stay in-family.
- **Do** pair every quadrant/safety color with position, label, and icon — never color alone.
- **Do** cap in-app display type at `clamp(1.6rem, 1.2rem + 2vw, 2.2rem)` (≤2.2rem); this is a companion app, not a landing page.
- **Do** keep tap targets ≥44px and focus rings visible (`2.5px solid var(--primary)`, 2px offset) for low-dexterity, low-energy use.
- **Do** give every animation a `prefers-reduced-motion: reduce` fallback (instant placement or crossfade) — required, not optional.
- **Do** keep the Safety route always reachable from the app bar and the tab bar, ungated, unconditional.
- **Do** separate sections with space and a single hairline rather than nested boxes.

### Don't:
- **Don't** use gradient text, ever — this is one of PRODUCT.md's named AI-slop anti-references.
- **Don't** use a `border-left`/`border-right` stripe greater than 1px as a colored accent (no side-stripe borders).
- **Don't** use glassmorphism as a default treatment — the blurred tab bar is the one deliberate exception; it doesn't spread further.
- **Don't** build identical card grids or nest a card inside a card.
- **Don't** put a tiny tracked-uppercase eyebrow above every section, or numbered section markers (01 / 02 / 03) as default scaffolding.
- **Don't** shame streaks or punish missed days — PRODUCT.md explicitly rejects "chirpy wellness apps" that shame ("You broke your 12-day streak!"); missed days get "welcome back," not guilt.
- **Don't** make points/XP the point — gamification is decoration for a reward already earned from the data, never a manipulation layer, per PRODUCT.md's anti-reference on gamified habit apps.
- **Don't** gate or add confirmation friction to the Safety route, and don't style it as a flashing alarm.
- **Don't** rely on color alone anywhere valence/quadrant meaning is encoded.

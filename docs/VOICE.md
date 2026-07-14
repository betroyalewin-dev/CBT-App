# Voice & Copy Guide

How this app talks to users, distilled from studying tone patterns in Calm,
Sanvello, and CBT Thought Diary — three apps that write for the same tired,
skeptical, possibly distressed user we do. This is a style reference for the
`humanizer` skill and for anyone writing copy in `src/screens/` or
`src/components/`. It describes *patterns*, not verbatim text from those apps.

## What the category gets right (and how we use it)

- **Calm**: leads with the sensation, not the mechanism. "Take a deep breath,"
  not "activate your parasympathetic nervous system." Names benefits in plain
  physical terms (sleep, calm, focus) before anything clinical. We borrow this:
  say what the user will feel or notice, not what the feature technically does.
- **Sanvello**: meets the user where they are — "whether you're anxious,
  lonely, overwhelmed, or burned out" — before asking anything of them, and
  frames tracking as something that pays the user back ("as patterns are
  identified, we'll recommend..."). We borrow this: acknowledge the state
  first, ask second, and always close the loop on why we're asking.
- **CBT Thought Diary**: uses "transform" and "understand your patterns"
  instead of "fix" or "treat," and keeps clinical terms (cognitive distortion
  names, CBT model names) available but optional, not load-bearing. We borrow
  this: the app is a mirror, not a doctor — never diagnostic, never verdict-y.

## What none of them do, and neither do we

- No inflated significance ("this moment marks a turning point in your
  journey"). A logged mood is just a logged mood.
- No manufactured urgency or streak-guilt ("don't lose your progress!").
  Behavioral Activation is about lowering activation energy, not adding
  pressure.
- No therapy-pamphlet phrasing ("it's important to acknowledge your
  feelings"). Say the plain thing instead: "That sounds hard."

## Our voice

**Plain, warm, low-effort to read.** The reader may be at their lowest energy
of the day. Every sentence should cost as little attention as possible.

- **Short sentences by default.** One idea per sentence. If a sentence has a
  comma and a "which," split it.
- **Second person, present tense, active voice.** "You logged three walks
  this week" — not "Three walks were logged" or "The user's activity."
- **Concrete over abstract.** "Your mood dipped after low-sleep days" beats
  "There appears to be a correlation between sleep and affect."
- **No diagnosis, no verdicts.** Reflect data, suggest experiments, never
  declare causes. "Might be worth testing" not "This is why you feel this way."
- **Acknowledge before asking.** If the app is about to ask for input, it
  should first show it noticed something ("Rough few days" before "Want to
  log why?").
- **Humor is allowed, sparingly, never at the user's expense.** A dry aside
  is fine in an empty state; never in a crisis-adjacent screen.

## Words and patterns to avoid

Same list the `humanizer` skill checks for — call these out on sight:

- "It's important to note/remember that..."
- "-ing" tacked-on depth ("...helping you build resilience")
- "journey," "empowering," "holistic," "unlock," "elevate" as generic filler
- Rule-of-three lists used for rhythm rather than content ("track, reflect,
  and grow")
- Passive voice used to soften ("it was noticed that mood declined")
- Em dashes doing the work a period should do

## Before / after

**Before (generic AI/wellness-app filler):**
> It's important to acknowledge that tracking your mood consistently can be
> a powerful tool in understanding your emotional patterns and fostering
> lasting well-being on your journey to better mental health.

**After (this app's voice):**
> Logging most days gives us enough to work with. A missed day isn't a
> problem — just log the next one.

**Before:**
> Congratulations on completing your first week of activities! This is a
> significant milestone that demonstrates your commitment to positive change.

**After:**
> One week logged. That's enough to start seeing a pattern — check Insights.

## How to use this with the humanizer skill

When writing or revising user-facing strings, pass this file as the voice
sample:

> "Humanize this text. Use `docs/VOICE.md` as my style reference."

The skill will match sentence length, directness, and avoid the flagged
filler patterns above rather than defaulting to its own generic personality.

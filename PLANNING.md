# CBT-App — Planning Doc

> Working name: TBD. A data-driven CBT companion for people with depression.
> Status: **pre-build planning.** This doc is the source of truth for product
> direction, user flows, and the clinical model. Nothing here is final.

---

## 1. One-liner

A behavior-and-mood tracker that turns a depressed person's own daily data into
specific, testable advice about what actually helps *them* — grounded in
Behavioral Activation (BA), the most evidence-based behavioral treatment for
depression.

The wedge: **therapists and psychiatrists fly blind between sessions.** We
collect the high-resolution data that's normally missing, give the user
personalized insight, and (later) hand a clean summary to their clinician.

---

## 2. Clinical spine (why this works, not just what it does)

Everything in the app hangs off one well-supported model:

**The depression cycle (Behavioral Activation):**

```
low mood ──► withdrawal / avoidance ──► fewer rewards + less mastery ──► lower mood
   ▲                                                                        │
   └────────────────────────────────────────────────────────────────────────┘
```

BA breaks the loop by re-engaging the person with **rewarding** and
**mastery-giving** activities — *scheduled regardless of how they feel*
("act from the outside in," not "wait to feel motivated"). Our tracker is the
monitoring stage of BA; our insights/experiments/scheduling are the
intervention stages.

**The two-axis model (drives the dashboard 2×2 pad):**

The user's "too much good / too much bad sensation" intuition, reframed onto two
*separately measurable* clinical dimensions:

- **Reward axis (anhedonia):** "good things don't land anymore." Blunted reward
  sensitivity. The "rich kid" pole — needs novelty, challenge, **mastery**, meaning.
- **Stress axis (negative affect / load):** "everything is too much." Overactive
  threat system. The "drowning" pole — needs **load reduction**, soothing, support.

These are roughly independent — you can be high on one, both, or neither — so a
single left-right slider would average opposite problems into mush. We use a
**2×2 pad** instead (see §5.3).

**Non-negotiable: safety.** A depression app *will* meet suicidal users. Crisis
detection + safety plan + 988 routing are table stakes, not v2 (see §5.6).

**Positioning guardrail:** wellness/CBT companion, **not** a diagnostic medical
device. No diagnostic claims, no treatment guarantees. Keeps us out of FDA
device territory and is the honest framing.

---

## 3. Core dimensions we capture (the heart of everything)

Every activity log scores three quick things. This is the single most important
design decision in the app — it's what makes the data diagnostic instead of flat.

| Dimension | Question | Range | Feeds |
|-----------|----------|-------|-------|
| **Mood** | How do you feel right now? | 1–10 | Both axes, trend |
| **Pleasure (P)** | How enjoyable was this? | 0–10 | Reward axis (anhedonia) |
| **Mastery (M)** | Sense of accomplishment? | 0–10 | Meaning / "rich-kid" pole |

Why P and M separately (this is the BA insight): an activity can be high-pleasure
/ low-mastery (scrolling, junk food), low-pleasure / high-mastery (paying bills,
a hard workout), both, or neither. Depression starves *both*. Plain mood tracking
can't see this; "your mood is okay but mastery has been near-zero all week" is a
real, actionable finding that pure mood tracking can never surface.

**Anticipated vs. actual:** when an activity is *planned/scheduled*, the user
predicts P/M/mood beforehand, then rates actual afterward. Depression
systematically under-predicts ("this won't help"). Showing the gap ("you expected
a 3, it was a 6") is therapeutic *and* is the seed of the Experiments feature.

---

## 4. The product as a loop

```
ONBOARD ──► DAILY LOG ──► DASHBOARD (2×2 pad + trend) ──► INSIGHTS
   │            ▲                                              │
   │            │                                              ▼
   │         SCHEDULE / EXPERIMENTS ◄────────────────── "patterns worth testing"
   │            │
   └──► SAFETY NET (always-on, cross-cuts every screen)
```

The user lives in **Daily Log → Dashboard**. Insights and Experiments are the
"aha" layer that earns retention. Safety is ambient.

---

## 5. User flows

### 5.1 Onboarding flow (first run)

Goal: establish baseline severity, place the user on the two axes, and get them
to their *first log fast* (don't front-load a 40-question intake on a depressed
person).

1. **Welcome + framing.** "This is a companion, not a doctor. Here's how we'll
   use your data." Plain-language privacy promise.
2. **PHQ-9** (9 items, validated depression screen). Gives severity baseline +
   **item 9 = suicidality** → if positive, branch immediately into the Safety
   flow before continuing.
3. **Axis placement** (~6 items): a few anhedonia items (reward axis) + a few
   negative-affect/anxiety items (stress axis). Optional **anxious-distress** flag.
4. **Profile assigned.** ~4 actionable profiles from the 2×2 (Drowning /
   Numb / Both / Mild). Profile sets *default recommendations*, not a diagnosis.
   Shown to user in warm, non-clinical language.
5. **Values quick-pick** (lightweight, 60 sec): pick 2–3 things that matter
   (relationships, health, creativity, work, learning…). Seeds the activity menu
   and gives the reward axis something to point at.
6. **Pick 1–3 starter activities to track.** Pre-filled from values; fully editable.
7. **First log, immediately.** "How are you right now?" → one entry on the board.
   The user reaches value in under 5 minutes.

> Open question: PHQ-9 every 2 weeks for re-baselining — confirm cadence (§9).

### 5.2 Daily logging flow (the core loop — must be near-frictionless)

Depressed users have low activation energy *by definition*. If logging is a
chore, the dataset dies. Target: **1–2 taps for a fast log**, deeper detail optional.

**Fast path (2 taps):**
1. Tap (+) → quick-pick a recent/favorite activity (or "just a mood check").
2. Set Mood, P, M on three sliders that default to last value. Save.

**Rich path (optional expand):**
- Context (cheap, high-signal): time (auto), who with, where, energy, sleep.
- Free-text note and/or **voice note** (transcribed).
- Tag whether it was **planned** (→ pulls in the anticipated rating to compare).

**Avoidance capture (TRAP → TRAC):** if the user logs "did nothing / avoided," a
gentle micro-flow asks:
- **Trigger** → what happened
- **Response** (feeling) → what you felt
- **Avoidance Pattern** → what you did to escape it
…then later helps swap it for **Alternative Coping** (TRAC). This is how BA
addresses avoidance directly, not just pleasant-event counting.

**Reminders / JITAI:** a few gentle nudges/day, ideally *just-in-time* (when data
says risk is rising), not rigid alarms. Always skippable, never shaming.

### 5.3 Dashboard flow (2×2 pad + trend)

The home screen. Two parts:

**(a) The 2×2 "Where am I" pad**
```
            REWARD (engaged / pleasure + mastery present)
                          ▲
                          │
     FLAT / OVERWHELMED    │    THRIVING-ish
     (drowning + numb)     │    (engaged, calm)
   ◄──────────────────────┼──────────────────────►  CALM ◄─► OVERLOADED
     NUMB / "rich-kid"     │    STRESSED-BUT-ENGAGED
     (calm but no reward)  │    (busy, rewarding, watch load)
                          │
                          ▼
            LOW REWARD (anhedonia / nothing lands)
```
- A dot shows the user's current position, computed from recent P/M (reward axis)
  and mood/stress signals (stress axis).
- **Calibration:** default to a **smoothed ~3-day rolling** position so the dot
  isn't jumpy, with **hourly drill-down** on tap. (Confirm in §9.)
- Each quadrant has *different* advice. Drowning → reduce load, soothe, ask for
  support. Numb → novelty, challenge, mastery tasks, meaning. The app says "you've
  drifted toward X lately — here are 2 things that have moved *you* back before."

**(b) Trend strip:** mood/P/M over time, streak status (forgiving — see §7),
and "this week vs last."

### 5.4 Insights flow (honest, then actionable)

The hard part. After ~a week we have small, noisy, **confounded** data (people do
fun things *because* they already feel better → naive correlation "discovers" the
obvious and can shame the user). So:

1. We surface **"patterns worth testing,"** never "this works for you."
   e.g. *"On days you logged any movement, mood averaged +2. Only happened twice."*
2. Every pattern offers a **→ turn into an experiment** button (§5.5).
3. Population-level/aggregate recommendations exist but are clearly labeled as
   *priors from others*, kept separate from the user's own data, and privacy-walled.

### 5.5 Experiments flow (n-of-1 — the magic)

Turns correlation into something closer to causation, and it's intrinsically
motivating (and it's literally a CBT technique: behavioral experiments).

1. App proposes: *"Try a 10-min walk tomorrow at 3pm. Predict how it'll feel."*
2. User logs **anticipated** P/M/mood.
3. Reminder fires; user does it (or doesn't — also data).
4. User logs **actual.**
5. App shows the **prediction gap** and accumulates results across repeats:
   *"3 of 4 walks beat your prediction. Walking looks like a real lever for you."*
6. A confirmed lever can **unlock a quest / become a scheduled default** (§7, §5.7).

### 5.6 Safety flow (always-on, cross-cuts everything)

Triggers: PHQ-9 item 9 positive, mood floor, sharp negative trend, crisis keywords
in notes/voice.
- Immediate, calm interstitial → **988 / local crisis line**, one tap to call/text.
- **Safety plan** builder (warning signs, coping steps, contacts, reasons for
  living) the user creates *while well* and can pull up instantly.
- Never gamified, never blocked behind a paywall, never "are you sure?" friction.

### 5.7 Scheduling flow (BA's other half — turns tracking into change)

Tracking sees what happened; scheduling *changes* it.
- From values + confirmed levers, the user **plans** pleasure/mastery activities
  onto a calendar with reminders.
- **Graded task assignment:** big/avoided tasks break into small steps so a
  low-activation user can start ("clean kitchen" → "put 3 dishes away").
- Scheduled items flow back into the anticipated-vs-actual loop.

---

## 6. Data model (sketch, for the BA core)

```
User
  ├─ profile: {phq9_history[], axis_scores{reward, stress}, anxious_flag}
  ├─ values: [tag…]
  ├─ safety_plan
  └─ ActivityLog[]
        ├─ timestamp
        ├─ activity_id / label
        ├─ mood (1–10), pleasure (0–10), mastery (0–10)
        ├─ planned: bool
        ├─ anticipated: {mood, pleasure, mastery}   # if planned
        ├─ context: {who, where, energy, sleep}
        ├─ avoidance: {trigger, response, pattern, alt_coping}  # TRAP/TRAC
        └─ note / voice_transcript

Experiment
  ├─ hypothesis (from an Insight)
  ├─ activity_id, schedule
  ├─ trials: [{anticipated, actual, completed}]
  └─ verdict: {effect_size, confidence, is_lever}
```

---

## 7. Gamification (forgiving by design)

Cautions specific to this population: **streaks can punish** (miss a day → shame →
quit) and **anhedonia eats extrinsic rewards** (points feel hollow — that's the
symptom). So:
- **Forgiving streaks:** grace days, "welcome back," never "you broke a 12-day streak."
- **Reward insight, not just compliance:** "you unlocked a pattern about your
  sleep" beats "+50 XP."
- **Quests = personalized**, unlocked by *confirmed* levers from the user's own
  experiments. That's intrinsic and clinically legit, unlike a generic point grind.

---

## 8. Roadmap

**MVP (lean clinical loop):**
1. PHQ-9 onboarding + axis placement + **safety routing**
2. 2-tap logging: **mood + pleasure + mastery** (+ optional context/voice)
3. Dashboard: **2×2 pad** (3-day smoothed) + trend strip
4. Insights framed as **patterns → experiments**
5. Forgiving streaks + insight-based unlocks

**v2:** scheduling + graded tasks, TRAP/TRAC avoidance flow, JITAI nudges,
clinician report export, passive sensing (sleep/steps/screen-time, opt-in).

**v3:** aggregate/population recommendations (privacy-walled), personalized
quests, values/goals (ACT) layer, micro-psychoeducation.

> Gamification depth and aggregate recommendations both *follow data* — they need
> a populated dataset to be good, so they're deliberately not in MVP.

---

## 9. Open questions

1. **Dashboard calibration:** confirm 3-day smoothed default + hourly drill-down.
2. **PHQ-9 re-baseline cadence:** every 2 weeks? Monthly?
3. **Exact axis scoring:** which items map to reward vs stress, and how the dot's
   x/y is computed from P/M/mood.
4. **Platform:** native (better passive sensing + notifications) vs web first?
5. **Data/privacy posture:** where does sensitive mental-health data live; what's
   the de-identification standard before any aggregation?
6. **Tech stack** — not chosen yet.

---

## 10. Decision log

- 2026-06-26 — Dashboard will be a **2×2 reward×stress pad**, not a single slider.
- 2026-06-26 — Core captures **Mood + Pleasure + Mastery** per activity (BA).
- 2026-06-26 — Insights are framed as **experiments**, never verdicts.
- 2026-06-26 — Safety routing is **MVP**, not later.

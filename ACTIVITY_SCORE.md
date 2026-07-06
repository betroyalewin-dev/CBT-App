# Activity Score — Planning Doc

> Feature: connect the app to the user's health/movement data (phone, watch,
> wearable) and reflect it back as a **live movement module on the dashboard** —
> deliberately separate from the BA/mood model.
> Status: **planning.** Companion to `PLANNING.md` (this was already sketched
> there as "passive sensing, opt-in" in the v2 roadmap — this doc makes it real).

---

## 1. Why this exists (the check-in loop)

**The insight (from Whoop):** a metric that accumulates *passively* — while the
user isn't using the app, isn't even touching their phone — makes the app fun
to check. "What's my strain now?" is a small, reliable dopamine hit, and it
drives multiple opens per day without asking the user to do anything.

That mechanic is unusually well-suited to *our* user, for a reason Whoop never
had to think about: **passive data is the only data a zero-activation-energy
user can produce.** Every other surface in the app costs a tap. This one fills
itself. On the worst days, the app still has something new to show.

And every one of those dopamine-driven opens lands the user next to the log
button and the dashboard — so the check-in loop feeds the core BA loop without
being part of it.

**Why it must be a separate module:** the BA model (mood, P/M, reward×stress)
is clinical and carefully honest. The movement module is a *toy* in the best
sense — live, fun, checkable. Mixing them contaminates both: the BA dashboard
dot must stay "your own taps, smoothed" (Design Principle 3), and the movement
module must be allowed to be playful without clinical copy review on every
pixel. Separate module, separate visual identity, separate data path. Movement
does **not** feed the reward axis.

**Why it's still dangerous:** a score shown to someone who wakes up grading
themselves harshly can become a daily failing mark — low activity *is* the
symptom. Whoop's users are fitness-motivated; a low strain day reads as
"recovery." Our user may read a low movement day as more evidence against
themselves. The design job: keep the check-in fun **even on quiet days** —
reward the *check*, not just the movement. Almost everything below serves that.

---

## 2. The issues (think first, build second)

### 2.1 Clinical / psychological risks

1. **A low score is a shame engine.** Fitness apps assume a user who *can* move
   and needs motivating. Ours may be in a depressive episode where 900 steps was
   a genuine victory. Anything that reads as "you failed today" feeds the exact
   withdrawal spiral BA exists to break — and unlike streaks, a passive score
   updates *every day without the user doing anything*.
2. **Population norms are poison.** "10,000 steps" / activity rings / percentile
   rankings compare a depressed user to the able-bodied well. Any score must be
   relative to **the user's own recent baseline**, never to a norm.
3. **We are deliberately inviting frequent checking — so every check must be
   safe.** The old mitigation ("keep the number quiet") is off the table; the
   whole point is a module worth checking. The replacement mitigation: the
   module's freshness comes from *data accruing* (today's timeline filling in,
   a new hour ticking over), so a check on a quiet day still delivers "new
   stuff to see" rather than "same bad grade, still bad." Rumination fixates on
   judgments; a timeline is a fact, not a judgment.
4. **Anhedonia eats extrinsic numbers.** The dopamine here is *novelty*
   ("what happened since I last looked?"), which survives anhedonia better than
   achievement framing ("you scored well"), and it's why the module leads with
   fresh data rather than a grade. The deeper payoff is still insight
   ("movement looks like a lever *for you*") — that lives in Insights, not here.
5. **A sharp activity drop is a clinical signal — handle with care.** Sustained
   collapse in movement can indicate a worsening episode. That's an opportunity
   (a gentle check-in, safety-layer awareness) and a hazard (false alarms from a
   flu, a vacation, a watch left on the charger). Never auto-escalate on passive
   data alone; use it only to *soften and time* an existing gentle nudge.

### 2.2 Data-quality risks

6. **Missing ≠ zero.** Non-wear days, dead batteries, phone left at home — if a
   gap scores as 0, we shame the user for their charger. Gaps must be first-class
   "no data" and excluded from baselines and scores.
7. **Sensors disagree and miscount.** Phone-only undercounts (phone in bag),
   wrist devices overcount (typing, pushing a stroller). Cross-device users
   double-count. We need one canonical source per day and coarse presentation,
   not false precision.
8. **Confounding, again.** People move *because* they feel better, not only the
   reverse. Design Principle 2 (honest before clever) applies verbatim: activity
   correlations are **patterns worth testing → experiments**, never verdicts.
9. **Staleness kills the loop.** The check-in mechanic dies if the module shows
   yesterday's data. Whoop works because strain is *live*. Daily-summary syncs
   are not enough — the module needs **intraday** data (hourly buckets at
   minimum), which constrains which sources are worth integrating (see §2.4).

### 2.3 Privacy / regulatory risks

10. **This is the most sensitive data combination we could hold.** Movement data
    alone is health data; joined with mood, PHQ-9, and safety-plan contents it's
    a profile of someone's depression. The app is currently **local-first**
    (state lives on-device) — that posture is a feature, and this integration
    must not silently break it. No activity data leaves the device except to the
    provider we fetched it from.
11. **Regulatory surface expands.** Health-adjacent apps sharing data have been
    the fine list (FTC Health Breach Notification Rule enforcement, state laws
    like Washington's My Health My Data, GDPR special-category data). Rules of
    the road: explicit granular opt-in, purpose limitation (we use it for the
    user's own insights, nothing else), easy disconnect + delete, and **never**
    any ad/analytics SDK near it (already a hard no in IDEAS.md).
12. **Platform terms.** Apple HealthKit and Android Health Connect both
    prohibit using health data for advertising and restrict retention/sharing.
    Fine for us — but it means the integration must be built inside those
    consent frameworks, not scraped around them.
13. **Diagnosis-claim drift.** "Your movement data suggests your depression is
    worsening" is a diagnostic claim — off-limits per the positioning guardrail.
    The copy ceiling is: *"You've been moving less than usual lately. Want to
    log how you're doing?"*

### 2.4 Platform / technical constraints (the hard blocker)

14. **We are a web app; the good data lives behind native APIs.** HealthKit
    (iOS) and Health Connect (Android) are **not reachable from the browser**.
    Google Fit's REST API is deprecated/sunset in favor of Health Connect,
    which is on-device only. And because the module needs *intraday* freshness
    (§2.2.9), the honest routes rank differently than a daily-summary feature
    would:
    - **(a) Wearable cloud APIs** — Fitbit exposes intraday steps via OAuth
      (PKCE, so a **backend-less, tokens-stay-on-device** integration is
      feasible and preserves local-first). Whoop and Oura have OAuth APIs too
      (day-level granularity varies). Covers only users who own those devices,
      but delivers the live loop in a pure web app.
    - **(b) Native wrapper (Capacitor)** — the real answer: HealthKit / Health
      Connect give near-real-time phone step counts to the majority of users
      with no wearable, and resolve PLANNING.md open question §9.4 (native vs
      web) in favor of "web now, wrapped later." Biggest lift.
    - **(c) Manual entry** — worth keeping as a fallback/override, but it
      **cannot power this feature**: manually-entered data has no passive
      surprise in it, so it produces no check-in loop. It's plumbing, not
      product.

---

## 3. Design decisions (locked unless we learn otherwise)

1. **Separate dashboard module, separate model.** The movement module lives on
   the dashboard as its own card with its own visual identity. It does not feed
   the reward axis, the profile, or the BA score in any way. (This also answers
   what was open question #2 in the previous draft: movement never touches the
   dashboard dot.)
2. **The module rewards the check, not the movement.** Its hero is **today,
   accruing live**: an intraday timeline/arc that visibly fills as the day goes
   on, so every open shows something that wasn't there last time. The score is
   the secondary element, not the headline. On a quiet day the module is still
   interesting ("your morning was still, your 2pm had a burst") instead of a
   low grade.
3. **Score is personal-baseline, floor-framed.** Today relative to the user's
   own recent typical day (trimmed median of the last 28 days with data). Copy
   celebrates any movement, never scolds its absence; down-days get neutral,
   factual copy. No population targets, no rings-to-close, no red.
4. **Missing data is missing.** Non-wear/no-data days show as "no signal," are
   excluded from baselines, and never render as zero.
5. **Playful is allowed here.** Unlike the BA surfaces, this module can be a
   little delightful — live number ticks, a satisfying fill animation (with
   full `prefers-reduced-motion` degradation). The constraint it keeps from the
   brand: never shaming, never chirpy, never comparative.
6. **The clinical value flows out quietly.** Movement data feeds Insights
   ("on days you moved, mood averaged +2 — worth testing?") and auto-verifies
   movement experiments. That's the honest layer; it stays in Insights/
   Experiments, clearly separated from the toy.
7. **Opt-in, granular, reversible.** Off by default; the dashboard shows a
   small "connect a device" invitation card in its place. Connect screen says
   in plain words what we read, that it stays on the device, and that
   disconnect + delete is one tap. Read-only scopes, minimum necessary
   (steps/active minutes — not GPS, not heart rate, not workout detail, in v1).
8. **No auto-escalation on passive data.** Activity collapse may *inform the
   timing* of an existing gentle check-in; it never triggers crisis UI by
   itself and never produces diagnostic copy.

---

## 4. What the module shows (v1 sketch)

```
┌─ Movement ────────────────────────────────┐
│  today, live:   ▁▁▂▅▂▁▁▃▇▂░░░░░░░         │   ← intraday bars, fills as the
│                 "a burst around 2pm"      │     day goes on (the dopamine)
│  vs your usual: ● lively                  │   ← personal-baseline bucket
│  last 7 days:   ▃▁▄▂·▅▃                   │     (· = no data, not zero)
└───────────────────────────────────────────┘
```

Scoring internals:

```
inputs (intraday):       steps / active minutes in hourly buckets
canonicalization:        one source per day (user-ranked priority), no merging
baseline:                trimmed median + MAD over last 28 days *with data*
                         (min 7 data days before the vs-usual line appears;
                          the live intraday view appears from day one)
raw score:               today-so-far vs baseline-at-this-hour, clamped ±2 MAD
presentation buckets:    quiet · usual · lively   (three, coarse, honest)
missing day:             "no signal", excluded from baseline
```

Note "baseline-at-this-hour": comparing 11am-today to *full* typical days would
make every morning look like failure. The comparison is always against the
user's typical day *up to the same hour*.

---

## 5. Data model additions (extends `src/domain/types.ts` sketch)

```
ActivitySample                      # one hour bucket, one source
  ├─ date: YYYY-MM-DD
  ├─ hour: 0–23
  ├─ source: "fitbit" | "whoop" | "oura" | "healthkit" | "health-connect" | "manual"
  ├─ steps?: number
  ├─ activeMinutes?: number
  └─ fetchedAt: epoch ms

MovementDay (derived, not stored)
  ├─ date
  ├─ hours: (number | null)[24]      # the intraday bars
  ├─ scoreSoFar: number | null       # MAD units vs baseline-at-this-hour
  └─ bucket: "quiet" | "usual" | "lively" | "none"

AppState additions
  ├─ activitySources: [{ id, connectedAt, scopes }]   # tokens in device storage only
  └─ activitySamples: ActivitySample[]
```

New domain module `src/domain/activity.ts` (pure functions + tests, like
`streak.ts` / `xp.ts`): canonicalization, hour bucketing, time-of-day baseline,
scoring, bucketing, insight correlation feeds.

---

## 6. Phased roadmap

**Phase 0 — domain layer + module UI on synthetic/manual data:**
- Build `domain/activity.ts` (hourly buckets, time-of-day baseline, scoring)
  fully tested on synthetic data, and the dashboard module UI (live fill,
  bucket line, 7-day strip, "no signal" states, reduced-motion path).
- A manual movement slider ships as the fallback data source and lets us tune
  the *quiet/usual/lively* copy on real humans — but we're explicit that
  manual data doesn't create the check-in loop; this phase is plumbing + UI.
- Success test: does the module feel kind on a bad week, and worth glancing at
  when the data is fresh?

**Phase 1 — first passive source (Fitbit intraday via OAuth PKCE, browser-only):**
- Client-side PKCE flow; tokens in device storage; poll intraday steps on app
  open/focus (no background jobs needed — the data was accruing at Fitbit; we
  fetch at check time, which is exactly when freshness matters). No backend →
  local-first preserved.
- Connect/disconnect settings screen with the plain-language privacy promise;
  disconnect purges samples + tokens. Manual entry remains and wins conflicts.
- **This is where the feature actually starts existing** — first passive
  dopamine loop in users' hands. Evaluate: does connect-rate + open-frequency
  move?
- Whoop/Oura adapters follow the same shape if demand shows up (the user base
  designing this has a Whoop — likely we dogfood a Whoop adapter early).

**Phase 2 — native wrapper (Capacitor) → HealthKit + Health Connect:**
- The majority answer: near-live phone step counts, no wearable required.
  Resolves the platform open question; unlocks future passive signals (sleep).
- Same domain layer; only the source adapter is new. Native also enables the
  (carefully rate-limited, optional) "your afternoon had a burst" style
  notification — evaluated separately against the JITAI/nudge rules.

**Explicitly out of scope (all phases):** GPS/location, heart rate, movement
goals/targets/rings-to-close, sharing movement data anywhere, any coupling to
the BA reward axis or XP, streaks-by-another-name, comparisons to other people.

---

## 7. Open questions

1. Baseline window: 28 days assumed — long enough to be stable, short enough to
   track an episode's phase? Validate on Phase-0/1 data.
2. Fetch-on-open vs. periodic refresh while the app is foregrounded — does a
   visibly ticking number materially beat refresh-on-focus for the loop?
3. Which wearable API second — Whoop (dogfood advantage) vs Oura (clean API,
   sleep-rich)?
4. Where exactly does the "moving less than usual" gentle check-in live, and
   what's its rate limit? (At most one per N days; needs its own copy review.)
5. Token refresh UX for PKCE without a backend (Fitbit refresh tokens rotate) —
   acceptable to re-prompt login occasionally?
6. Does the module earn a place on the Today screen too (smaller), or dashboard
   only? Decide after Phase 1 usage data.

---

## 8. Decision log

- 2026-07-06 — Feature is a **personal-baseline movement signal**, not a graded
  score; three coarse buckets, floor framing, missing ≠ zero.
- 2026-07-06 — Passive data never auto-triggers crisis UI and never produces
  diagnostic copy; it may only soften/time an existing gentle check-in.
- 2026-07-06 — Local-first posture is preserved: activity data and tokens stay
  on-device; no backend, no analytics, granular opt-in with one-tap purge.
- 2026-07-06 — **Movement is a separate dashboard module, fully decoupled from
  the BA model** (no reward-axis input, no XP). Its product job is the
  passive check-in loop — data that accrued while the user did nothing makes
  the app worth opening — feeding proximity to the core loop, not the scores.
- 2026-07-06 — The module **rewards the check, not the movement**: hero is the
  live intraday timeline (novelty), score is secondary, and intraday
  comparisons are vs the user's typical-day-*up-to-this-hour* so mornings
  never read as failure. Manual entry can't power the loop; passive sources
  are the feature.

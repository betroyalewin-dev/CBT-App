# Activity Score — Planning Doc

> Feature: connect the app to the user's health/movement data (phone, watch,
> wearable) and reflect it back as an **activity signal** that feeds the BA loop.
> Status: **planning.** Companion to `PLANNING.md` (this was already sketched
> there as "passive sensing, opt-in" in the v2 roadmap — this doc makes it real).

---

## 1. Why this fits (and why it's dangerous)

**Why it fits:** movement is the single cheapest, highest-yield passive signal
for a BA app. BA's whole mechanism is *activity → reward/mastery → mood*, and
right now every data point costs the user a tap. Passive activity data is the
first signal we can get **for free from a user with zero activation energy** —
which is exactly the user we designed for. It also strengthens the two features
that already earn retention: insights ("on days you moved, mood averaged +2")
and n-of-1 experiments (a walk experiment can now verify itself).

**Why it's dangerous:** a *score* is a grade, and our user wakes up already
grading themselves harshly. Low activity is not a lifestyle choice here — **it
is the symptom.** A naive activity score scores the depression itself and hands
the user a daily failing mark. Almost every design decision below exists to
prevent that.

---

## 2. The issues (think first, build second)

### 2.1 Clinical / psychological risks

1. **A low score is a shame engine.** Fitness apps assume a user who *can* move
   and needs motivating. Ours may be in a depressive episode where 900 steps was
   a genuine victory. Anything that reads as "you failed today" feeds the exact
   withdrawal spiral BA exists to break. This is the streak problem (§7 of
   PLANNING.md, "Things to deliberately not build" in IDEAS.md) amplified,
   because a score updates *every day without the user even doing anything*.
2. **Population norms are poison.** "10,000 steps" / activity rings / percentile
   rankings compare a depressed user to the able-bodied well. Any score must be
   relative to **the user's own recent baseline**, never to a norm.
3. **Scores invite fixation and self-criticism.** Rumination is a core
   depression process; a single daily number is a perfect rumination target.
   The number should be *quiet* — a supporting signal inside insights, not a
   hero metric on the home screen. (Anti-reference in PRODUCT.md: hero-metric
   templates.)
4. **Anhedonia eats extrinsic numbers.** Same reason XP-as-the-point fails: a
   number going up feels hollow when reward sensitivity is blunted. The payoff
   we sell is **insight** ("movement seems to be a lever *for you*"), not the
   score itself.
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
   double-count. We need one canonical source per day and coarse buckets, not
   false precision.
8. **Confounding, again.** People move *because* they feel better, not only the
   reverse. Design Principle 2 (honest before clever) applies verbatim: activity
   correlations are **patterns worth testing → experiments**, never verdicts.

### 2.3 Privacy / regulatory risks

9. **This is the most sensitive data combination we could hold.** Movement data
   alone is health data; joined with mood, PHQ-9, and safety-plan contents it's
   a profile of someone's depression. The app is currently **local-first**
   (state lives on-device) — that posture is a feature, and this integration
   must not silently break it. No activity data leaves the device except to the
   provider we fetched it from.
10. **Regulatory surface expands.** Health-adjacent apps sharing data have been
    the fine list (FTC Health Breach Notification Rule enforcement, state laws
    like Washington's My Health My Data, GDPR special-category data). Rules of
    the road: explicit granular opt-in, purpose limitation (we use it for the
    user's own insights, nothing else), easy disconnect + delete, and **never**
    any ad/analytics SDK near it (already a hard no in IDEAS.md).
11. **Platform terms.** Apple HealthKit and Android Health Connect both
    prohibit using health data for advertising and restrict retention/sharing.
    Fine for us — but it means the integration must be built inside those
    consent frameworks, not scraped around them.
12. **Diagnosis-claim drift.** "Your movement data suggests your depression is
    worsening" is a diagnostic claim — off-limits per the positioning guardrail.
    The copy ceiling is: *"You've been moving less than usual lately. Want to
    log how you're doing?"*

### 2.4 Platform / technical constraints (the hard blocker)

13. **We are a web app; the good data lives behind native APIs.** HealthKit
    (iOS) and Health Connect (Android) are **not reachable from the browser**.
    Google Fit's REST API is deprecated/sunset in favor of Health Connect,
    which is on-device only. So "just connect to health data" has exactly three
    honest routes today:
    - **(a) Manual low-fi entry** — a one-tap movement rating. Works now, zero
      privacy surface, surprisingly high value (sleep slider already proved
      this pattern).
    - **(b) Wearable cloud APIs** — Fitbit, Oura, Garmin etc. expose OAuth REST
      APIs reachable from a browser. Fitbit supports PKCE, so a
      **backend-less, tokens-stay-on-device** integration is feasible and
      preserves local-first. Covers only users who own those devices.
    - **(c) Native wrapper (Capacitor)** — the real answer for HealthKit /
      Health Connect, and it resolves PLANNING.md open question §9.4 (native vs
      web) in favor of "web now, wrapped later." Biggest lift.
    The roadmap below sequences a → b → c so value ships early and the risky
    surface grows only after the safe design is proven.

---

## 3. Design decisions (locked unless we learn otherwise)

1. **It's a "movement signal," not a graded score.** Internally a number;
   presented as a gentle qualitative signal (e.g. *quiet · usual · lively* days)
   plus a small trend. No big daily number, no rings, no targets, no red.
2. **Baseline is personal and rolling.** Score = today relative to the user's
   own recent typical day (e.g. trimmed median of the last 28 days with data).
   The comparison a depressed user can win.
3. **Floor framing, always.** Copy celebrates any movement and never scolds its
   absence. "You moved a bit more than usual" exists; "you missed your goal"
   does not. Down-days get neutral, factual copy or silence.
4. **Missing data is missing.** Non-wear/no-data days show as "no signal," are
   excluded from baselines, and never render as zero.
5. **The signal serves the BA loop, not a fitness tab.** Three consumers:
   - **Insights:** movement × mood/valence/P–M patterns, framed as hypotheses.
   - **Experiments:** auto-verify movement-related n-of-1 experiments
     ("3 of 4 walk days beat your prediction — and your watch agrees").
   - **Dashboard (subtle):** movement contributes a small weight to the reward
     axis at most; the dot stays "your own taps, smoothed."
6. **Opt-in, granular, reversible.** Off by default. Connect screen says in
   plain words what we read, that it stays on the device, and that disconnect +
   delete is one tap. Read-only scopes, minimum necessary (daily steps/active
   minutes — not GPS, not heart rate, not workouts detail, in v1).
7. **No auto-escalation on passive data.** Activity collapse may *inform the
   timing* of an existing gentle check-in; it never triggers crisis UI by
   itself and never produces diagnostic copy.

---

## 4. What the score actually is (v1 math sketch)

```
inputs (per day):        steps, activeMinutes  (whichever the source provides)
canonicalization:        one source per day (user-ranked priority), no merging
baseline:                trimmed median + MAD over last 28 days *with data*
                         (min 7 data days before any signal is shown)
raw score:               today vs baseline, in MAD units, clamped to ±2
presentation buckets:    quiet (≤ −0.75) · usual (−0.75…+0.75) · lively (≥ +0.75)
missing day:             no score, excluded from baseline
```

Deliberately coarse: three buckets survive sensor noise, resist fixation, and
are honest about precision. The continuous value is kept internally for
insights/experiments correlation work only.

---

## 5. Data model additions (extends `src/domain/types.ts` sketch)

```
ActivitySample                      # one day, one source
  ├─ date: YYYY-MM-DD
  ├─ source: "manual" | "fitbit" | "oura" | "healthkit" | "health-connect"
  ├─ steps?: number
  ├─ activeMinutes?: number
  └─ fetchedAt: epoch ms

ActivitySignal (derived, not stored)
  ├─ date
  ├─ score: number | null            # MAD units, null = no data
  └─ bucket: "quiet" | "usual" | "lively" | "none"

AppState additions
  ├─ activitySources: [{ id, connectedAt, scopes }]   # tokens in device storage only
  └─ activitySamples: ActivitySample[]
```

New domain module `src/domain/activity.ts` (pure functions + tests, like
`streak.ts` / `xp.ts`): canonicalization, baseline, scoring, bucketing,
insight correlation feeds.

---

## 6. Phased roadmap

**Phase 0 — manual movement log (ship first, this is the MVP of the feature):**
- One optional slider/tap in the daily log: "How much did you move today?"
  (mirrors the existing sleep-context pattern; near-zero friction).
- Build `domain/activity.ts` scoring on manual data. All downstream surfaces
  (insight cards, experiment verification, copy system) built and validated
  here, where the data is safe and the stakes are low.
- Success test: does the *quiet/usual/lively* framing feel kind on a bad week?
  This is where we tune copy before any sensor amplifies it.

**Phase 1 — first real integration (Fitbit via OAuth PKCE, browser-only):**
- Client-side PKCE flow; tokens in device storage; fetch daily steps/active
  minutes; read-only, minimum scopes. No backend → local-first preserved.
- Connect/disconnect settings screen with the plain-language privacy promise;
  disconnect purges samples + tokens.
- Manual entry remains and wins conflicts (the user outranks the sensor).

**Phase 2 — native wrapper (Capacitor) → HealthKit + Health Connect:**
- Resolves the platform open question; unlocks the majority of users (phone
  step counts, no wearable required) and future passive signals (sleep).
- Same domain layer; only the source adapter is new.

**Explicitly out of scope (all phases):** GPS/location, heart rate, activity
goals/targets, sharing movement data anywhere, any score on the home screen
hero position, streaks-by-another-name.

---

## 7. Open questions

1. Baseline window: 28 days assumed — long enough to be stable, short enough to
   track an episode's phase? Validate on Phase-0 manual data.
2. Should movement feed the dashboard reward axis at all in v1, or stay
   insights/experiments-only until trust is earned? (Lean: insights-only first.)
3. Which wearable API second — Oura (clean API, sleep-rich) vs Garmin?
4. Where exactly does the "moving less than usual" gentle check-in live, and
   what's its rate limit? (At most one per N days; needs its own copy review.)
5. Token refresh UX for PKCE without a backend (Fitbit refresh tokens rotate) —
   acceptable to re-prompt login occasionally?

---

## 8. Decision log

- 2026-07-06 — Feature is a **personal-baseline movement signal**, not a graded
  score; three coarse buckets, floor framing, missing ≠ zero.
- 2026-07-06 — Sequencing: **manual first, wearable cloud API second, native
  health stores third.** Copy and shame-safety are validated before sensors.
- 2026-07-06 — Passive data never auto-triggers crisis UI and never produces
  diagnostic copy; it may only soften/time an existing gentle check-in.
- 2026-07-06 — Local-first posture is preserved: activity data and tokens stay
  on-device; no backend, no analytics, granular opt-in with one-tap purge.

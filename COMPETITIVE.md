# Competitive landscape & differentiation

Where the mood-tracker / CBT market sits in 2026, and how this **Behavioral
Activation (BA)** companion is positioned against it. Grounded in `PRODUCT.md`
(register, principles, anti-references) and `IDEAS.md` (feature roadmap).

Positioning guardrail carries over: a **wellness/CBT companion, not a diagnostic
medical device.** Nothing below claims to treat, cure, or diagnose.

---

## 1. The market, in four buckets

The category splits cleanly. Each bucket does one thing well and leaves a gap.

### Lightweight mood loggers — the volume leaders

- **Daylio** — 5-point mood scale + activity icons, "first value in a tap,"
  minimal writing. ~$4.99/mo or ~$36/yr. The activity→mood link is the closest
  any logger gets to our P/M idea, but it stays **descriptive, not experimental.**
- **How We Feel** — free, built with Yale's Center for Emotional Intelligence;
  emotion wheel + regulation strategies. No premium tier.
- **Finch** — gamifies self-care into raising a virtual pet.

> **Strength:** frictionless logging, delightful onboarding.
> **Gap:** they tell you *what* you felt, not *what moves* it. No causal insight.

### Detailed correlation trackers — the power users

- **Bearable** — mood (1–10) + pain, fatigue, sleep, meds, hormones, symptoms,
  with correlation charts. The serious quantified-self tool.
- **Moodgrade** — 52 emotions + sleep/meds/energy, offline-first, web+mobile,
  PHQ-9/GAD-7, thought records, AI insights.

> **Strength:** rich data, factor correlations, clinician-shareable reports.
> **Gap:** they overwhelm *our exact user* (tired, low-motivation). Logging is a
> chore, and correlations are shown as facts, not hypotheses to test.

### CBT-structured apps — our closest neighbors

- **MoodTools** — thought diaries, PHQ-9, a **behavioral-activation module**, and
  a safety plan. Closest competitor on paper, but BA is a static worksheet, not a
  living dashboard.
- **Moodnotes** — psychologist-designed thought reframing; well-liked one-time
  purchase option.
- **MindShift CBT**, **Clarity** — structured CBT exercises, SMART goals.

> **Strength:** evidence-grounded, structured.
> **Gap:** they lean on cognitive (thought-record) work — text-heavy, high-effort.
> None make **Pleasure × Mastery** the spine.

### Meditation-first with mood add-ons

- **Calm**, **Moodfit** — mood tracking is a feature, not the product
  (meditation, gratitude, breathing, lifestyle).

---

## 2. What users complain about — our opening

- **Streak guilt backfires.** "You missed your session!" raises anxiety; people
  break a streak and quit. The mechanic is wrong for this population.
- **Data loss is unforgivable**, and **privacy is the #1 engagement barrier** —
  therapy apps are repeatedly caught leaking sensitive data to ad/analytics SDKs.
- **Subscription backlash** is harsher in mental health than any other category.
- **Seeing a string of low moods** visualized can itself be demoralizing.

Each of these is a stated value of ours already (forgiving re-entry, on-device
data, no ad SDKs, honest framing) — so they read as **differentiators, not just
hygiene.**

---

## 3. How we differentiate — ranked by defensibility

1. **BA as the spine, not a worksheet.** Almost everyone tracks mood; almost no
   one operationalizes **Pleasure × Mastery** per activity on a live, smoothed
   **reward×stress dashboard.** This is the moat. The insight no competitor can
   produce: *"Your mood is okay, but mastery has been near-zero all week."*

2. **Insights as n-of-1 experiments, not verdicts.** Everyone else presents
   correlation as fact. Reframing as *"a pattern worth testing"* is more honest
   *and* more engaging, and it sidesteps the medical-claim line. The feature that
   makes the app worth opening twice. *(IDEAS.md Tier-1 #1.)*

3. **One coordinate system.** Mood pad (valence×arousal) and dashboard
   (reward×stress) share axes, so the dot reads as "your own taps, smoothed" —
   not a black-box chart. A coherence most teams never achieve.

4. **Anti-gamification, stated out loud.** The market defaults to streaks/XP — the
   exact mechanic that *harms* depressed users. "No streaks to break" is a
   marketing line, not just a design choice.

5. **Privacy as a front-page feature.** On-device, no upload, no ad/analytics SDK.
   Given privacy is the top barrier, "your data never leaves your phone" is a
   promise, not fine print.

6. **Safety always-on, never gated.** Unconditional 988 + safety plan, while
   competitors paywall crisis support. Ethically right *and* a trust signal.

### Push further (gaps even we haven't fully closed)

- **Sleep as a first-class one-slider signal** — highest-yield mood correlate,
  near-zero logging cost, supercharges the experiments. Matches Bearable's most
  valuable axis while staying frictionless. *(IDEAS.md Tier-1 #3 — promote it.)*
- **Teach BA by doing, not reading** — animated loop diagram + first-tap-as-lesson.
  No competitor teaches the *mechanism* (action precedes motivation).
- **Pricing posture** — given subscription backlash, favor a generous free core
  with a one-time unlock or low-friction tier (cf. Moodnotes).

---

## 4. Positioning one-liner

> Daylio tells you *what* you felt. Bearable tells you *what correlates.*
> **Ours tells you what to *try* next — and proves it from your own data.**

"An honest experiment, not a verdict" is the thing none of them have, and it
falls naturally out of the BA foundation already built.

---

## 5. Feature comparison at a glance

| Capability | Daylio | Bearable | MoodTools | Moodnotes | **This app** |
|---|---|---|---|---|---|
| 2-tap fast logging | ✅ | ⚠️ heavy | ⚠️ | ⚠️ | ✅ |
| Pleasure × Mastery per activity | ❌ | ❌ | ⚠️ worksheet | ❌ | ✅ spine |
| Live reward×stress dashboard | ❌ | ⚠️ charts | ❌ | ❌ | ✅ |
| Insights framed as experiments | ❌ | ❌ | ❌ | ❌ | ✅ |
| Shared mood/dashboard axes | ❌ | ❌ | ❌ | ❌ | ✅ |
| No streaks / forgiving re-entry | ❌ | ❌ | ❌ | ❌ | ✅ |
| On-device, no ad SDK | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ✅ |
| Always-on, ungated crisis support | ❌ | ❌ | ✅ | ❌ | ✅ |
| Sleep as first-class signal | ⚠️ | ✅ | ❌ | ❌ | 🔜 planned |

✅ yes · ⚠️ partial/heavy · ❌ no · 🔜 roadmap

---

## Sources

- LifeStance — [Best Mood Tracking Apps 2026](https://lifestance.com/blog/best-mood-tracking-apps-therapists-top-choices-2026/)
- Mindful Suite — [Best CBT Apps 2026](https://www.mindfulsuite.com/reviews/best-cbt-apps) · [Best Mood Tracking Apps 2026](https://www.mindfulsuite.com/reviews/best-mood-tracking-apps)
- Moodgrade — [Best mood tracking apps 2026: an honest comparison](https://moodgrade.com/en/blog/best-mood-tracking-apps-2026)
- ChoosingTherapy — [Daylio App Review](https://www.choosingtherapy.com/daylio-app-review/)
- [Bearable vs Daylio](https://bearable.app/bearable-vs-daylio-which-one-should-you-choose/)
- Psychology Tools — [Mastery & Pleasure Diary](https://www.psychologytools.com/resource/mastery-and-pleasure-activity-diary) · [Behavioral Activation self-help](https://www.psychologytools.com/self-help/behavioral-activation)
- MDPI — [RCT of a BA-based digital app](https://www.mdpi.com/2076-328X/15/11/1496)
- Unstar — [What Users Really Say About Wellbeing Apps 2026](https://unstar.app/blog/mental-health-app-reviews-what-users-say-about-wellbeing-apps-2026)
- PMC — [User Perspectives of Mood-Monitoring Apps](https://pmc.ncbi.nlm.nih.gov/articles/PMC7585773/)
- arXiv — [Privacy Analysis of Popular Therapy Apps](https://arxiv.org/html/2605.02016)

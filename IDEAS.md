# Beyond BA: feature ideas & a lighter-text onboarding

Working notes to accompany the onboarding motion pass. Grounded in the research
doc (`CBTCompanionOnboardingResearch.md`), the existing architecture (valence×arousal
mood capture, Pleasure/Mastery, the reward×stress dashboard, the always-on safety
layer), and the wellness-not-treatment positioning guardrail.

Everything here stays on the **wellness / self-management** side of the line. No
diagnostic claims, no "treats depression." Anything that smells like treatment is
flagged.

---

## Part 1 — "Too much text" + non-text mediums for teaching BA

You're right that the current onboarding leans on prose, and prose is the most
expensive medium for our exact user (tired, low-motivation, lower effective
literacy at 1am — see research §4). The fix isn't to delete the explanation; it's
to **change the medium**. BA is a *loop*, and loops are better shown than
described.

### The single highest-leverage move: teach by doing, not by reading

The mood pad is already an interactive teaching surface. Lean into it. Instead of
a paragraph explaining the valence×arousal model, let the first tap *be* the
lesson: the user places a dot, and a one-line reflection names the quadrant back.
They learn the coordinate system in one gesture. (Research §2: Daylio's whole edge
is "first value in a tap, not a read.")

### Mediums to replace or shrink the prose

1. **An animated loop diagram (the BA mechanic in ~6 seconds).** A small, calm SVG
   animation: *withdrawal → mood dips → less energy → more withdrawal* drawn as a
   tightening spiral, then a single small activity nudges the spiral open. This is
   the one concept BA rests on, and motion conveys "downward spiral" and "small
   action interrupts it" far better than two sentences. It fits the motion work
   just shipped and respects `prefers-reduced-motion` (degrade to a static
   two-frame before/after).

2. **A live, miniature dashboard preview.** Show the reward×stress 2×2 with a dot
   that drifts as a couple of example activities animate in — "this is where your
   taps end up." One coordinate system (Design Principle 3) means the teaching
   artifact *is* the real product surface, not a throwaway illustration.

3. **Iconography + 3–5 words per card.** Where a screen must stay, cap it at one
   simple glyph and a handful of words (research §4: "3 to 5 key points, 5th–6th
   grade"). Replace "built on Behavioral Activation, the most evidence-based
   behavioral approach for depression" with a glyph + "Small actions, tracked.
   That's the whole method."

4. **Optional calm voice narration.** A toggle to *hear* the orientation in a warm
   voice instead of reading it. Doubles as accessibility (low-vision, fatigue) and
   reinforces the "steady friend" persona. Off by default; never autoplay.

5. **A worked example as a 2-panel "before/after," not a description.** Instead of
   describing what an insight looks like, show one fake card: *"Mood okay, but
   mastery near-zero all week."* Seeing the payoff beats being promised it.

6. **Progressive disclosure as a medium choice.** Most of today's welcome-screen
   text is explaining things the user doesn't need yet. Move each explanation to
   the moment it's relevant (the mood-grid hint appears on first log, the privacy
   detail appears at the consent step). Less text per screen, same total meaning.

### Concrete trims I'd make to current copy (for your sign-off)

- **Welcome subhead**: drop the "most evidence-based behavioral approach for
  depression" clause — it's a treatment-adjacent claim *and* the densest sentence
  on the screen. Replace with the loop animation + a 6-word line.
- **Profile blurb + "This is a starting point…" footnote**: collapse to one line;
  the bloom reveal already does the emotional work.
- **PHQ-9 / axis subtitles**: shorten to a single clause each.

I held off applying these unilaterally because the voice is carefully tuned and
copy is yours to own — say the word and I'll cut them in the same calm register.

---

## Part 2 — Feature additions beyond BA

Ordered roughly by leverage-to-effort. Each notes the evidence hook and the
positioning risk.

### Tier 1 — natural extensions of data you already collect

1. **n-of-1 experiments ("does X move my mood?").** You already capture mood +
   P/M + activities. Let the user run a self-experiment: "For 2 weeks, I'll log
   whether a morning walk changes my afternoon mood," then show the contrast as a
   *hypothesis*, never a verdict (Design Principle 2). This is the feature that
   makes you not-a-mood-tracker. Pure wellness framing.

2. **Pattern insights / gentle nudges from the dashboard.** "Your mood tends to
   dip on low-activity days" — surfaced as something-to-test. The research (§3)
   names in-app reflection as *the* retention-positive feature. You have the data;
   this is mostly presentation.

3. **Sleep as a first-class signal.** Sleep is the highest-yield correlate of
   mood and trivially loggable (one slider). Adds a powerful axis to the
   experiments above with near-zero logging cost. Wellness-safe.

4. **Forgiving "welcome back," never a streak.** Re-entry after a gap is the
   make-or-break retention moment for depressed users (research §3: streaks
   *backfire* here). A warm "good to see you — want to log just one thing?" beats
   any consistency mechanic. Reward insight unlocked, not compliance.

### Tier 2 — new modalities, still self-management

5. **A lightweight thought record (CBT cognitive piece).** BA is the behavior leg;
   a *simple* thought-catching tool (situation → feeling → the thought → a kinder
   second look) adds the cognitive leg of CBT. Keep it optional and button-led to
   avoid the text-generation burden. **Positioning watch:** present as journaling /
   reflection, not "cognitive restructuring therapy."

6. **Values & a tiny-habit scheduler.** You already collect values and activities;
   close the loop with a Fogg-style "after I [existing routine], I'll [tiny
   action]" planner plus one gentle, user-timed reminder (research §3). This is the
   action half of BA actually getting scheduled.

7. **Guided micro-activations / a small activity library.** A short, curated list
   of 2-minute valued actions tied to the user's chosen values, for the days when
   even choosing is too much. Anhedonia-aware: the action is pre-chosen and absurdly
   small.

8. **Breathing / grounding moment.** A single calm, optional breathing animation
   for high-arousal ("anxious · agitated" quadrant) moments — surfaced contextually
   when a log lands top-left on the pad. Not a meditation library; one good 60s tool.

### Tier 3 — connection & continuity (higher effort / higher trust bar)

9. **Clinician/share summary.** A clean, exportable between-session summary (the
   secondary user named in PRODUCT.md). Export-only, user-initiated, on-device — no
   silent sharing (research §5: this is exactly where health apps get fined).

10. **Light "human-ish" presence.** Occasional warm check-in messages in the steady
    friend voice — the cheapest stand-in for the "human feedback" the evidence (§3)
    rewards, short of real peer/coach support.

11. **Peer-support signposting.** Not a social network — just well-chosen pointers
    to peer communities (one of SAMHSA's six trauma-informed principles), kept
    separate from the always-on 988 crisis layer.

### Strengthen what's already a pillar

12. **Deepen the safety layer.** The safety plan exists; make it collaboratively
    built (warning signs, coping steps, reasons-for-living, a personal contact) and
    reachable in one tap from everywhere — the research's central safety point
    (§1, §6): the bond and the boundary must scale together.

### Things to deliberately *not* build

- **Streaks / XP / points.** Evidence says they don't help here and can harm
  (research §3; anti-references). Hard no.
- **Anything claiming to treat/cure/diagnose**, a "HIPAA-compliant" badge, or any
  ad/analytics SDK touching health data (research §5 — the fine list).

---

## Suggested next steps

1. Confirm the copy trims in Part 1 and I'll apply them.
2. Pick one Part-1 medium to build first — my vote: the **animated BA loop
   diagram**, since it kills the densest paragraph and rides the motion work just
   shipped.
3. Pick the first Tier-1 feature — my vote: **n-of-1 experiments**, the thing that
   makes the app worth opening twice.

import { describe, it, expect } from "vitest";
import {
  toPercent,
  pmToPercent,
  emotionRegion,
  moodPhrase,
  quadrantFromAxis,
} from "./mood";

describe("scaling", () => {
  it("maps −5…5 to 0…100", () => {
    expect(toPercent(-5)).toBe(0);
    expect(toPercent(0)).toBe(50);
    expect(toPercent(5)).toBe(100);
    expect(toPercent(99)).toBe(100); // clamped
  });
  it("maps 0…10 to 0…100", () => {
    expect(pmToPercent(0)).toBe(0);
    expect(pmToPercent(10)).toBe(100);
    expect(pmToPercent(-3)).toBe(0); // clamped
  });
});

describe("emotionRegion (circumplex)", () => {
  it("low valence + high arousal → agitated/anxious", () => {
    expect(emotionRegion({ valence: -4, arousal: 4 }).key).toBe("agitated");
  });
  it("low valence + low arousal → flat/numb", () => {
    expect(emotionRegion({ valence: -4, arousal: -4 }).key).toBe("flat");
  });
  it("high valence + low arousal → calm/content", () => {
    expect(emotionRegion({ valence: 4, arousal: -4 }).key).toBe("calm");
  });
  it("high valence + high arousal → excited", () => {
    expect(emotionRegion({ valence: 4, arousal: 4 }).key).toBe("excited");
  });
  it("near center → neutral", () => {
    expect(emotionRegion({ valence: 0, arousal: 0 }).key).toBe("neutral");
  });
});

describe("moodPhrase (live readout)", () => {
  it("narrates each corner of the continuous space", () => {
    expect(moodPhrase({ valence: -4, arousal: -4 })).toBe("Low and heavy");
    expect(moodPhrase({ valence: -4, arousal: 4 })).toBe("Tense and on edge");
    expect(moodPhrase({ valence: 4, arousal: -4 })).toBe("Calm and content");
    expect(moodPhrase({ valence: 4, arousal: 4 })).toBe("Bright and lively");
  });
  it("names the dead center", () => {
    expect(moodPhrase({ valence: 0, arousal: 0 })).toBe("Right in the middle");
  });
  it("treats the neutral band as mid, not a corner", () => {
    expect(moodPhrase({ valence: 0.5, arousal: -4 })).toBe("Quiet, neutral");
    expect(moodPhrase({ valence: 4, arousal: 0.5 })).toBe("Good, steady");
  });
});

describe("quadrantFromAxis (dashboard 2×2)", () => {
  it("high reward + low stress → thriving", () => {
    expect(quadrantFromAxis(80, 20)).toBe("thriving");
  });
  it("high reward + high stress → stressed", () => {
    expect(quadrantFromAxis(80, 80)).toBe("stressed");
  });
  it("low reward + low stress → numb", () => {
    expect(quadrantFromAxis(20, 20)).toBe("numb");
  });
  it("low reward + high stress → flat", () => {
    expect(quadrantFromAxis(20, 80)).toBe("flat");
  });
});

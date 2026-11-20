import test from "node:test";
import assert from "node:assert/strict";
import { birdMotion, lakeRipple, lakeFishMotion } from "../src/environmentMotion.ts";

test("birds return to their perches without teleporting at any loop boundary", () => {
  for (let i = 0; i < 2; i++) {
    let previous = birdMotion(0, i);
    let resting = 0;
    for (let t = 0.02; t < 160; t += 0.02) {
      const current = birdMotion(t, i);
      assert(Math.hypot(current.x - previous.x, current.y - previous.y) < 4);
      if (!current.flight) resting++;
      previous = current;
    }
    assert(resting > 3000, "birds spend substantial time resting");
  }
});

test("lake disturbances stay inside the lake and have quiet intervals", () => {
  for (let i = 0; i < 3; i++) {
    let quiet = 0;
    for (let t = 0; t < 60; t += 0.1) {
      const r = lakeRipple(t, i);
      assert(r.opacity >= 0 && r.opacity <= 0.34);
      assert(((Math.abs(r.x - 804) + r.rx) / 106) ** 2 + ((Math.abs(r.y - 504) + r.ry) / 49) ** 2 < 1);
      if (r.opacity === 0) quiet++;
    }
    assert(quiet > 400);
  }
});

test("fish swim continuously within the water, clear of the dock and shore", () => {
  for (let i = 0; i < 3; i++) {
    let previous = lakeFishMotion(0, i);
    for (let t = 0.05; t < 240; t += 0.05) {
      const fish = lakeFishMotion(t, i);
      assert(Math.hypot(fish.x - previous.x, fish.y - previous.y) < 1);
      assert(((Math.abs(fish.x - 804) + 8) / 106) ** 2 + ((Math.abs(fish.y - 504) + 8) / 49) ** 2 < 1);
      assert(fish.x - 8 > 722);
      previous = fish;
    }
  }
});

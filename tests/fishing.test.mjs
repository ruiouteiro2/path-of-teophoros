import test from "node:test";
import assert from "node:assert/strict";
import { startReel, advanceReel } from "../src/fishing.ts";
test("fishing can be won by following the fish and cannot auto-award twice", () => {
  for (const seed of [0, 123, 98765]) {
    let s = startReel();
    for (let i = 0; i < 2400 && s.result === "playing"; i++)
      s = advanceReel(s, s.bar > s.fish, 1 / 60, seed);
    assert.equal(s.result, "caught");
    assert.strictEqual(advanceReel(s, false, 1, seed), s);
  }
});
test("missed fish escapes and frame stalls cannot jump the catch bar", () => {
  let s = startReel();
  const first = advanceReel(s, true, 100, 33);
  assert(Math.abs(first.bar - s.bar) < 0.03);
  for (let i = 0; i < 2400 && s.result === "playing"; i++)
    s = advanceReel(s, false, 1 / 60, 33);
  assert.equal(s.result, "escaped");
});

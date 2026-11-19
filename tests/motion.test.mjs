import test from "node:test";
import assert from "node:assert/strict";
import { createMotion, advance } from "../src/motion.ts";
const run = (hz, input, seconds = 1) => {
  let s = createMotion("forest", { x: 450, y: 400 });
  for (let i = 0; i < hz * seconds; i++) s = advance(s, input, 1 / hz);
  return s;
};
test("motion is independent of refresh rate", () => {
  const a = run(30, { x: 1, y: 0 }),
    b = run(60, { x: 1, y: 0 });
  assert(Math.abs(a.position.x - b.position.x) < 2);
  assert(a.position.x > 540);
});
test("diagonal input does not increase travel speed", () => {
  const a = run(60, { x: 1, y: 0 }),
    b = run(60, { x: 1, y: -1 });
  assert(
    Math.abs(
      Math.hypot(b.position.x - 450, b.position.y - 400) - (a.position.x - 450),
    ) < 1,
  );
});
test("release eases to rest without a jump", () => {
  let s = run(60, { x: 1, y: 0 });
  const start = s.position.x;
  for (let i = 0; i < 90; i++) s = advance(s, { x: 0, y: 0 }, 1 / 60);
  assert(s.position.x - start < 9);
  assert.equal(s.moving, false);
});
test("pet follows behind rather than teleporting or overlapping", () => {
  const s = run(60, { x: 1, y: 0 }, 1.5);
  assert(s.position.x - s.pet.x > 20);
  assert(s.position.x - s.pet.x < 65);
  assert(s.petDistance > 50);
});
test("idle companion keeps its own space", () => {
  let s = createMotion("forest", { x: 450, y: 400 });
  for (let i = 0; i < 180; i++) s = advance(s, { x: 0, y: 0 }, 1 / 60);
  assert(Math.hypot(s.position.x - s.pet.x, s.position.y - s.pet.y) >= 23);
});
test("frame stalls cannot teleport through terrain", () => {
  let s = createMotion("forest", { x: 700, y: 300 });
  s = advance(s, { x: 1, y: 0 }, 10);
  assert(s.position.x - 700 < 4);
});

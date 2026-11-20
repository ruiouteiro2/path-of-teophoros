import test from "node:test";
import assert from "node:assert/strict";
import { createMotion, advance } from "../src/motion.ts";
const run = (hz, input, seconds = 1) => {
  let s = createMotion("forest", { x: 900, y: 800 });
  for (let i = 0; i < hz * seconds; i++) s = advance(s, input, 1 / hz);
  return s;
};
test("motion is independent of refresh rate", () => {
  const a = run(30, { x: 1, y: 0 }),
    b = run(60, { x: 1, y: 0 });
  assert(Math.abs(a.position.x - b.position.x) < 2);
  assert(a.position.x > 990);
});
test("diagonal input does not increase travel speed", () => {
  const a = run(60, { x: 1, y: 0 }),
    b = run(60, { x: 1, y: -1 });
  assert(
    Math.abs(
      Math.hypot(b.position.x - 900, b.position.y - 800) - (a.position.x - 900),
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
  let s = createMotion("forest", { x: 900, y: 800 });
  for (let i = 0; i < 180; i++) s = advance(s, { x: 0, y: 0 }, 1 / 60);
  assert(Math.hypot(s.position.x - s.pet.x, s.position.y - s.pet.y) >= 23);
});
test("frame stalls cannot teleport through terrain", () => {
  let s = createMotion("forest", { x: 1400, y: 600 });
  s = advance(s, { x: 1, y: 0 }, 10);
  assert(s.position.x - 1400 < 4);
});

test("companions hold sniff, blink and rest poses without drifting", () => {
  let s = createMotion("forest", { x: 900, y: 800 });
  const poses = new Set();
  const initial = { ...s.pet };
  for (let i = 0; i < 18 * 60; i++) {
    s = advance(s, { x: 0, y: 0 }, 1 / 60);
    poses.add(s.petPose);
  }
  assert.deepEqual([...poses].sort(), [0, 1, 2, 3]);
  assert.deepEqual(s.pet, initial);
  s = advance(s, { x: 1, y: 0 }, 1 / 60);
  assert.equal(s.petPose, 0);
});
test("companion turns toward vertical travel", () => {
  const down = run(60, { x: 0, y: 1 }, 1),
    up = run(60, { x: 0, y: -1 }, 1);
  assert.equal(down.petFacing, "front");
  assert.equal(up.petFacing, "back");
});


test("a Familiar blocked by a boulder does not walk in place or accumulate gait distance", () => {
  const s = createMotion("forest", {x:600,y:790});
  s.pet = {x:460,y:790};
  s.petFacing = "right";
  s.trail = [{x:460,y:790},{x:540,y:790},{x:600,y:790}];
  const next = advance(s, {x:0,y:0}, 1/60);
  assert.deepEqual(next.pet, s.pet);
  assert.equal(next.petMoving, false);
  assert.equal(next.petDistance, s.petDistance);
  assert.equal(next.petFacing, "right");
  assert(next.idleTime > 0);
});


test("Familiar follows a recorded bend around a boulder without crossing it", () => {
  let s = createMotion("forest", {x:600,y:790});
  s.pet = {x:450,y:790};
  s.trail = [{x:450,y:790},{x:450,y:740},{x:550,y:740},{x:550,y:790},{x:600,y:790}];
  let minimumY = 790;
  for (let i=0;i<300;i++) {
    const previous = s.pet;
    s=advance(s,{x:0,y:0},1/60);
    minimumY=Math.min(minimumY,s.pet.y);
    assert(Math.hypot(s.pet.x-previous.x,s.pet.y-previous.y)<3);
    assert(((s.pet.x-500)/40)**2+((s.pet.y-790)/30)**2>=1);
  }
  assert(minimumY<765, "must follow the upper bend");
  assert(s.pet.x>540, "must reach the far side rather than remain stuck");
});

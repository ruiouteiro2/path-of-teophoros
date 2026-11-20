import test from "node:test";
import assert from "node:assert/strict";
import { footstepSurface, nextFootstep } from "../src/audioScene.ts";
test("footsteps identify wooden bridge, dock, cabin and marble courtyard", () => {
  assert.equal(footstepSurface("forest", { x: 1540, y: 670 }), "wood");
  assert.equal(footstepSurface("forest", { x: 1400, y: 670 }), "earth");
  assert.equal(footstepSurface("temple", { x: 1380, y: 1012 }), "wood");
  assert.equal(footstepSurface("temple", { x: 1280, y: 960 }), "earth");
  assert.equal(footstepSurface("temple", { x: 970, y: 670 }), "stone");
  assert.equal(footstepSurface("cabin", { x: 450, y: 400 }), "wood");
});
test("footstep selection varies without consecutive identical samples", () => {
  let previous = 0;
  const used = new Set(),
    sequence = [];
  for (let stride = 0; stride < 100; stride++) {
    const next = nextFootstep(previous, stride);
    assert(next >= 0 && next < 4);
    assert.notEqual(next, previous);
    used.add(next);
    sequence.push(next);
    previous = next;
  }
  assert.equal(used.size, 4);
  assert(sequence.some((v, i) => i >= 4 && v !== sequence[i - 4]));
});

import test from "node:test";
import assert from "node:assert/strict";
import { homeLocations, cabinLocations } from "../src/worldLayout.ts";
import { gardenPlots } from "../src/garden.ts";
import {
  move,
  walkable,
  regions,
  resources,
  nearest,
  atGate,
  validSave,
} from "../src/game.ts";
function fixture(region = "forest") {
  return {
    worldVersion: 2,
    name: "Tester",
    petName: "Argos",
    pet: "Dog",
    color: "#467d81",
    region,
    position: regions[region].spawn,
    gathered: [],
    inventory: 0,
    visited: [region],
  };
}
for (const region of ["forest", "temple", "cabin"]) {
  test(region + ": every collectible and exit is reachable from spawn", () => {
    const queue = [regions[region].spawn],
      seen = new Set();
    let head = 0;
    while (head < queue.length) {
      const p = queue[head++],
        key = p.x + "," + p.y;
      if (seen.has(key)) continue;
      seen.add(key);
      for (const [dx, dy] of [
        [12, 0],
        [-12, 0],
        [0, 12],
        [0, -12],
      ]) {
        const next = move(p, dx, dy, region);
        if (!seen.has(next.x + "," + next.y)) queue.push(next);
      }
    }
    const points = [...seen].map((key) => {
      const [x, y] = key.split(",").map(Number);
      return { x, y };
    });
    for (const p of resources[region])
      assert(
        points.some((q) => Math.hypot(q.x - p.x, q.y - p.y) < 48),
        "unreachable collectible",
      );
    const locations =
      region === "temple"
        ? homeLocations
        : region === "cabin"
          ? cabinLocations
          : {};
    for (const [name, p] of Object.entries(locations))
      assert(
        points.some((q) => Math.hypot(q.x - p.x, q.y - p.y) < 48),
        "unreachable home interaction: " + name,
      );
    if (region === "temple")
      for (const p of gardenPlots)
        assert(
          points.some((q) => Math.hypot(q.x - p.x, q.y - p.y) < 30),
          "unreachable garden plot: " + p.id,
        );
    if (region === "forest")
      for (const p of [
        { x: 150, y: 760 },
        { x: 410, y: 1140 },
        { x: 184, y: 392 },
      ])
        assert(
          points.some((q) => Math.hypot(q.x - p.x, q.y - p.y) < 40),
          "unreachable new woodland trail",
        );
    assert(
      points.some((position) => atGate({ ...fixture(region), position })),
      "unreachable map exit",
    );
  });
}
test("river cannot be crossed outside bridge", () => {
  assert.equal(walkable({ x: 1540, y: 460 }, "forest"), false);
  assert.equal(walkable({ x: 1540, y: 680 }, "forest"), true);
  assert.deepEqual(move({ x: 1432, y: 600 }, 24, 0, "forest"), {
    x: 1432,
    y: 600,
  });
});
test("a harvested plant cannot be harvested again", () => {
  const s = { ...fixture(), position: resources.forest[0] };
  assert.equal(nearest(s), 0);
  s.gathered = ["forest-0"];
  assert.equal(nearest(s), -1);
});
test("save validation rejects corrupt inventory and duplicate gathered entries", () => {
  assert(validSave(fixture()));
  assert(!validSave({ ...fixture(), inventory: 3 }));
  assert(
    !validSave({
      ...fixture(),
      gathered: ["forest-0", "forest-0"],
      inventory: 2,
    }),
  );
  assert(!validSave({ ...fixture(), position: { x: 99999, y: 0 } }));
});

import test from "node:test";
import assert from "node:assert/strict";
import {
  newProgression,
  tendGarden,
  rest,
  refillJug,
  validProgression,
  trade,
} from "../src/progression.ts";
import { gardenPlots, validGarden } from "../src/garden.ts";
import { walkable } from "../src/game.ts";
const id = "garden-0";
function gardener() {
  return {
    ...newProgression(),
    story: "complete",
    energy: 100,
    water: 6,
    bag: { hoe: 1, wateringJug: 1, barleySeed: 2, onionSeed: 1 },
  };
}

test("planting, watered nights and harvesting form a persistent one-time crop cycle", () => {
  let p = gardener();
  assert.strictEqual(tendGarden(p, id, "barley"), p);
  p = tendGarden(p, id, "till");
  assert.equal(p.energy, 96);
  assert.strictEqual(tendGarden(p, id, "till"), p);
  p = tendGarden(p, id, "barley");
  assert.equal(p.bag.barleySeed, 1);
  assert.strictEqual(tendGarden(p, id, "onion"), p);
  p = rest(p);
  assert.equal(p.garden[id].age, 0);
  for (let i = 0; i < 3; i++) {
    p = tendGarden(p, id, "water");
    assert.equal(p.water, 5 - i);
    assert.strictEqual(tendGarden(p, id, "water"), p);
    p = JSON.parse(JSON.stringify(p));
    assert(validProgression(p));
    p = rest(p);
    assert.equal(p.garden[id].age, i + 1);
    assert.equal(p.garden[id].watered, false);
  }
  assert.strictEqual(tendGarden(p, id, "water"), p);
  p = tendGarden(p, id, "harvest");
  assert.equal(p.bag.barley, 1);
  assert.equal(p.garden[id].crop, undefined);
  assert.strictEqual(tendGarden(p, id, "harvest"), p);
  p = trade(p, "barley", false);
  assert.equal(p.money, 16);
  assert.equal(p.bag.barley, undefined);
});
test("garden tool, water, energy and inventory limits cannot destroy crops or duplicate items", () => {
  let p = { ...gardener(), bag: { barleySeed: 1 } };
  assert.strictEqual(tendGarden(p, id, "till"), p);
  p = tendGarden(gardener(), id, "till");
  p = tendGarden(p, id, "onion");
  const dry = { ...p, water: 0 };
  assert.strictEqual(tendGarden(dry, id, "water"), dry);
  const tired = { ...p, energy: 1 };
  assert.strictEqual(tendGarden(tired, id, "water"), tired);
  p = refillJug(dry);
  assert.equal(p.water, 6);
  assert.strictEqual(refillJug(p), p);
  for (let i = 0; i < 4; i++) {
    p = tendGarden(p, id, "water");
    p = rest(p);
  }
  const full = { ...p, bag: { ...p.bag, onion: 999 } };
  assert.strictEqual(tendGarden(full, id, "harvest"), full);
  assert.strictEqual(tendGarden(p, "garden-100", "harvest"), p);
});
test("garden saves reject impossible states and all six plots are on walkable ground", () => {
  assert(validGarden({}));
  assert(
    !validGarden({
      "garden-0": { tilled: false, crop: "barley", age: 0, watered: false },
    }),
  );
  assert(
    !validGarden({
      "garden-0": { tilled: true, crop: "onion", age: 9, watered: true },
    }),
  );
  assert(
    !validGarden({
      "garden-0": { tilled: true, crop: "", age: 0, watered: false },
    }),
  );
  assert(!validProgression({ ...gardener(), water: 7 }));
  const legacy = gardener();
  delete legacy.water;
  delete legacy.garden;
  assert(validProgression(legacy));
  for (const p of gardenPlots)
    assert(walkable(p, "temple"), `unwalkable ${p.id}`);
});

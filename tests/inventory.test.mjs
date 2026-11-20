import test from "node:test";
import assert from "node:assert/strict";
import {
  dropsFor,
  collectDrop,
  materialCounts,
  exitTriggered,
} from "../src/inventory.ts";
import { validSave, walkable } from "../src/game.ts";
import { defaultAppearance } from "../src/appearance.ts";
import { newProgression } from "../src/progression.ts";
import { gardenPlots } from "../src/garden.ts";
const fixture = () => ({
  name: "Test",
  petName: "Argos",
  pet: "Boxer",
  color: "#abc",
  region: "forest",
  position: { x: 450, y: 450 },
  inventory: 0,
  gathered: [],
  visited: ["forest"],
  seed: 1234,
  pickedDrops: [],
  appearance: defaultAppearance,
});
test("full stacks leave ground drops available", () => {
  const drop = dropsFor(1234, "forest")[0];
  const save = {
    ...fixture(),
    position: drop,
    progress: { ...newProgression(), bag: { [drop.kind]: 999 } },
  };
  assert.equal(collectDrop(save, drop.id), save);
  assert.deepEqual(save.pickedDrops, []);
});
test("material layout is deterministic, varied, spaced and traversable", () => {
  for (const region of ["forest", "temple"])
    for (const seed of [0, 1234, 4294967295]) {
      const drops = dropsFor(seed, region);
      assert.equal(drops.length, 60);
      assert.deepEqual(drops, dropsFor(seed, region));
      assert.equal(new Set(drops.map((d) => d.id)).size, 60);
      for (const kind of ["wood", "stone", "fiber"])
        assert.equal(drops.filter((d) => d.kind === kind).length, 20);
      for (const d of drops) {
        assert(walkable(d, region));
        if (region === "temple")
          assert(
            gardenPlots.every((p) => Math.hypot(p.x - d.x, p.y - d.y) >= 50),
          );
      }
    }
  assert.notDeepEqual(dropsFor(1234, "forest"), dropsFor(9876, "forest"));
});
test("pickup is once only and survives serialization and map travel", () => {
  let s = fixture();
  const d = dropsFor(s.seed, s.region)[0];
  s = { ...s, position: { x: d.x, y: d.y } };
  s = collectDrop(s, d.id);
  assert.equal(materialCounts(s).wood, 1);
  assert.equal(collectDrop(s, d.id), s);
  const restored = JSON.parse(
    JSON.stringify({ ...s, region: "temple", position: { x: 200, y: 666 } }),
  );
  assert(validSave(restored));
  assert.equal(materialCounts(restored).wood, 1);
  assert(restored.pickedDrops.includes(d.id));
});
test("distant drops cannot be collected and corrupt saves are rejected", () => {
  const s = fixture();
  assert.equal(collectDrop(s, "forest-drop-0"), s);
  assert(!validSave({ ...s, pickedDrops: ["forest-drop-0", "forest-drop-0"] }));
  assert(
    !validSave({
      ...s,
      appearance: { ...defaultAppearance, hairColor: "constructor" },
    }),
  );
  assert(!validSave({ ...s, seed: NaN }));
});
test("legacy saves remain valid", () => {
  const s = fixture();
  delete s.seed;
  delete s.pickedDrops;
  delete s.appearance;
  assert(validSave(s));
  assert.equal(materialCounts(s).wood, 0);
});
test("exits trigger only on entrance strips and arrival positions do not bounce back", () => {
  assert(exitTriggered("forest", { x: 1904, y: 656 }));
  assert(exitTriggered("temple", { x: 60, y: 666 }));
  assert(!exitTriggered("forest", { x: 1740, y: 660 }));
  assert(!exitTriggered("temple", { x: 200, y: 666 }));
  assert(!exitTriggered("forest", { x: 1904, y: 800 }));
  assert(!exitTriggered("temple", { x: 60, y: 200 }));
});

import test from "node:test";
import assert from "node:assert/strict";
import {
  newProgression,
  advanceStory,
  addItem,
  landFish,
  trade,
  transfer,
  consume,
  craft,
  restoreAltar,
  rest,
  validProgression,
} from "../src/progression.ts";
import { migrateProgress, validSave, regions } from "../src/game.ts";

test("a landed fish and the catch record are awarded atomically", () => {
  const p = newProgression();
  const caught = landFish(p, "carp");
  assert.equal(caught.bag.carp, 1);
  assert.equal(caught.caught, 1);
  const full = { ...p, bag: {carp: 999} };
  assert.strictEqual(landFish(full, "carp"), full);
  assert.strictEqual(landFish(p, "wood"), p);
  const maximum = { ...p, caught: 9999999 };
  assert.strictEqual(landFish(maximum, "perch"), maximum);
});

test('terrain edits relocate a blocked saved position without discarding progression',()=>{
 const save={name:'Tester',petName:'Argos',pet:'Boxer',color:'#fff',region:'temple',worldVersion:2,position:{x:10,y:10},gathered:[],inventory:0,visited:['temple'],progress:{...newProgression(),money:55}};
 assert(validSave(save));
 const migrated=migrateProgress(save);
 assert.deepEqual(migrated.position,regions.temple.spawn);
 assert.equal(migrated.progress.money,55);
});
test("rescue grants Familiar and supplies at their story beats, exactly once", () => {
  let p = newProgression();
  for (let i = 0; i < 3; i++) p = advanceStory(p);
  assert.equal(p.story, "familiar");
  assert.equal(p.familiarGranted, false);
  assert.equal(p.money, 0);
  p = advanceStory(p);
  assert.equal(p.familiarGranted, true);
  assert.equal(p.money, 0);
  p = advanceStory(p);
  assert.equal(p.money, 100);
  assert.equal(p.bag.bread, 2);
  assert.equal(p.story, "complete");
  assert.strictEqual(advanceStory(p), p);
  assert(validProgression(p));
});
test("trading conserves items and currency; rejects overspending and invalid quantities", () => {
  const p = { ...newProgression(), money: 100 };
  const b = trade(p, "bread", true, 3);
  assert.equal(b.money, 40);
  assert.equal(b.bag.bread, 3);
  assert.strictEqual(trade(b, "rod", true), b);
  assert.strictEqual(trade(b, "bread", true, -1), b);
  assert.strictEqual(trade(b, "bread", true, 1.5), b);
  const s = trade(b, "bread", false, 2);
  assert.equal(s.money, 56);
  assert.equal(s.earned, 16);
  assert.equal(s.bag.bread, 1);
  assert.strictEqual(trade(s, "bread", false, 2), s);
  assert.strictEqual(trade(s, "rod", false), s);
});
test("chest transfer round trip neither duplicates nor destroys stacks", () => {
  const p = addItem(newProgression(), "stone", 8),
    a = transfer(p, "stone", true, 5);
  assert.equal(a.bag.stone, 3);
  assert.equal(a.chest.stone, 5);
  assert.strictEqual(transfer(a, "stone", true, 4), a);
  const b = transfer(a, "stone", false, 5);
  assert.deepEqual(b, p);
});
test("crafting is atomic and consumes ingredients once", () => {
  let p = addItem(addItem(newProgression(), "wood", 3), "fiber", 2);
  const rod = craft(p, "rod");
  assert.equal(rod.bag.rod, 1);
  assert.equal(rod.bag.wood, undefined);
  assert.equal(rod.bag.fiber, undefined);
  assert.strictEqual(craft(rod, "rod"), rod);
  assert.equal(p.bag.wood, 3);
});
test("altar hand-in rewards only once and requires the story and materials", () => {
  let p = newProgression();
  for (const [id, n] of [
    ["wood", 3],
    ["stone", 3],
    ["fiber", 2],
  ])
    p = addItem(p, id, n);
  assert.strictEqual(restoreAltar(p), p);
  p = { ...p, story: "complete", familiarGranted: true };
  const done = restoreAltar(p);
  assert.equal(done.money, 120);
  assert.equal(done.restoredAltar, true);
  assert.deepEqual(done.bag, {});
  assert.strictEqual(restoreAltar(done), done);
});
test("food and rest obey energy bounds", () => {
  const p = addItem({ ...newProgression(), energy: 90 }, "bread", 2),
    fed = consume(p, "bread");
  assert.equal(fed.energy, 100);
  assert.equal(fed.bag.bread, 1);
  assert.strictEqual(consume(fed, "bread"), fed);
  const next = rest(fed);
  assert.equal(next.day, 2);
  assert.equal(next.energy, 100);
});
test("legacy migration preserves items without replaying introduction or reminting coins", () => {
  const old = {
    region: "temple",
    position: { x: 500, y: 450 },
    pickedDrops: ["forest-drop-0", "temple-drop-2"],
    gathered: ["forest-0", "temple-1"],
  };
  const s = migrateProgress(old);
  assert.deepEqual(s.progress.bag, { wood: 1, fiber: 1, thyme: 1, olives: 1 });
  assert.equal(s.progress.story, "complete");
  assert.deepEqual(migrateProgress(s), s);
});
test("corrupt progress is rejected", () => {
  const p = newProgression();
  assert(validProgression(p));
  for (const patch of [
    { money: -1 },
    { money: Infinity },
    { bag: { wood: 1.5 } },
    { bag: { fake: 1 } },
    { chest: [] },
    { story: "hack" },
    { day: 0 },
    { energy: 101 },
  ])
    assert.equal(validProgression({ ...p, ...patch }), false);
});


test("hearth recipes consume harvests atomically and preserve ingredients at capacity", () => {
  const p = addItem(newProgression(), "barley", 2);
  const cooked = craft(p, "bread");
  assert.equal(cooked.bag.barley, 1);
  assert.equal(cooked.bag.bread, 1);
  assert.equal(p.bag.barley, 2);
  const full = { ...p, bag: { ...p.bag, bread: 999 } };
  assert.strictEqual(craft(full, "bread"), full);
  const empty = newProgression();
  assert.strictEqual(craft(empty, "bread"), empty);
});

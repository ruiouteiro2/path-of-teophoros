import test from "node:test";
import assert from "node:assert/strict";
import { walkable, regions, resources } from "../src/game.ts";
import { homeLocations, cabinLocations } from "../src/worldLayout.ts";
import { gardenPlots } from "../src/garden.ts";
import { forestTrees, templeTrees, forestImagePoint } from "../src/terrainDepth.ts";
import { exitTriggered, lakeReeds } from "../src/inventory.ts";

// Flood the actual navigation geometry, rather than only testing target points.
// A walkable interaction can still be trapped on a disconnected island.
function reachable(region) {
  const step = 8;
  const spawn = regions[region].spawn;
  const first = {
    x: Math.round(spawn.x / step) * step,
    y: Math.round(spawn.y / step) * step,
  };
  assert(walkable(first, region));
  const queue = [first],
    seen = new Set([`${first.x},${first.y}`]);
  for (let i = 0; i < queue.length; i++) {
    for (const [dx, dy] of [
      [step, 0],
      [-step, 0],
      [0, step],
      [0, -step],
    ]) {
      const p = { x: queue[i].x + dx, y: queue[i].y + dy };
      const key = `${p.x},${p.y}`;
      if (!seen.has(key) && walkable(p, region)) {
        seen.add(key);
        queue.push(p);
      }
    }
  }
  return queue;
}
for (const region of ["temple", "forest", "cabin"]) {
  test(`${region}: home activities, harvests and exit connect to spawn`, () => {
    const points = reachable(region);
    assert(
      points.some((p) => exitTriggered(region, p)),
      "exit must be reachable",
    );
    const targets =
      region === "temple"
        ? Object.entries(homeLocations)
        : region === "cabin"
          ? Object.entries(cabinLocations)
          : [];
    for (const [name, p] of targets)
      assert(
        points.some((q) => Math.hypot(q.x - p.x, q.y - p.y) < 30),
        `${name} is disconnected`,
      );
    for (const p of resources[region])
      assert(
        points.some((q) => Math.hypot(q.x - p.x, q.y - p.y) < 40),
        "harvest node disconnected",
      );
    if (region === "temple") {
      for (const reed of lakeReeds)
        assert(points.some((q) => Math.hypot(q.x - reed.x, q.y - reed.y) < 25), `${reed.id} disconnected`);
      assert(
        points.some((p) => p.x > 1545 && p.x < 1600 && p.y > 445 && p.y < 477),
        "cabin entrance disconnected",
      );
      for (const p of gardenPlots)
        assert(
          points.some((q) => Math.hypot(q.x - p.x, q.y - p.y) < 30),
          `garden ${p.id} disconnected`,
        );
    }
  });
}

test("forest boulder blocks movement while its surrounding path stays open", () => {
  assert.equal(walkable({ x: 500, y: 790 }, "forest"), false);
  for (const p of [
    { x: 450, y: 790 },
    { x: 550, y: 790 },
    { x: 500, y: 750 },
    { x: 500, y: 830 },
  ])
    assert(walkable(p, "forest"));
});

test("path-side forest trunks are solid while the nearby route stays open", () => {
  for (const tree of forestTrees)
    assert.equal(walkable(forestImagePoint(tree.footX, tree.footY), "forest"), false);
  const pine = forestImagePoint(418, 829);
  assert.equal(walkable({ x: pine.x + 24, y: pine.y }, "forest"), true);
  assert.equal(walkable({ x: pine.x - 24, y: pine.y + 24 }, "forest"), true);
});

test("sanctuary harvest trunks stay solid with room to approach and gather", () => {
  for (const tree of templeTrees)
    assert.equal(walkable(forestImagePoint(tree.footX, tree.footY), "temple"), false, tree.id);
  // The garden-side trunk formerly sat inside the traversable ground polygon.
  // Both sides and the southern approach remain usable after adding its footprint.
  for (const p of [{ x: 526, y: 866 }, { x: 558, y: 866 }, { x: 544, y: 900 }])
    assert(walkable(p, "temple"));
});

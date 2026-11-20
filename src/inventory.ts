import type { Point, Region, Save } from "./game.ts";
import { walkable, regions, resources } from "./game.ts";
import { addItem } from "./progression.ts";
import { terrainArea } from "./worldLayout.ts";
import { gardenPlots } from "./garden.ts";
export type Material = "wood" | "stone" | "fiber";
export type Drop = Point & { id: string; kind: Material };
const layoutCache = new Map<string, Drop[]>();
export function dropsFor(seed: number, region: Region): Drop[] {
  if (region === "cabin") return [];
  const key = seed + ":" + region,
    cached = layoutCache.get(key);
  if (cached) return cached;
  let state = (seed ^ (region === "forest" ? 0x9e3779b9 : 0x85ebca6b)) >>> 0;
  const random = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
  const result: Drop[] = [];
  for (let attempt = 0; attempt < 2000 && result.length < 60; attempt++) {
    const p = {
      x: Math.round(80 + random() * 1800),
      y: Math.round(380 + random() * 850),
    };
    if (
      !terrainArea(p, region) ||
      Math.hypot(p.x - regions[region].spawn.x, p.y - regions[region].spawn.y) <
        45 ||
      resources[region].some((q) => Math.hypot(q.x - p.x, q.y - p.y) < 35) ||
      result.some((q) => Math.hypot(q.x - p.x, q.y - p.y) < 28)
    )
      continue;
    result.push({
      ...p,
      id: `${region}-drop-${result.length}`,
      kind: (["wood", "stone", "fiber"] as const)[result.length % 3],
    });
  }
  // Keep the original generation and IDs stable for old saves. Only relocate
  // materials hidden beneath new garden plots or corrected solid footprints.
  for (const drop of result) {
    const overlaps = (p: Point) =>
      !walkable(p, region) ||
      (region === "temple" &&
        gardenPlots.some((g) => Math.hypot(p.x - g.x, p.y - g.y) < 50));
    if (!overlaps(drop)) continue;
    let placed = false;
    for (let radius = 60; radius <= 360 && !placed; radius += 30)
      for (let angle = 0; angle < 16; angle++) {
        const candidate = {
          x: Math.round(drop.x + Math.cos((angle * Math.PI) / 8) * radius),
          y: Math.round(drop.y + Math.sin((angle * Math.PI) / 8) * radius),
        };
        if (
          !walkable(candidate, region) ||
          overlaps(candidate) ||
          result.some(
            (d) =>
              d !== drop &&
              Math.hypot(d.x - candidate.x, d.y - candidate.y) < 28,
          ) ||
          resources[region].some(
            (r) => Math.hypot(r.x - candidate.x, r.y - candidate.y) < 35,
          )
        )
          continue;
        drop.x = candidate.x;
        drop.y = candidate.y;
        placed = true;
        break;
      }
  }
  if (layoutCache.size >= 16)
    layoutCache.delete(layoutCache.keys().next().value!);
  layoutCache.set(key, result);
  return result;
}
export function nearestDrop(save: Save, position: Point = save.position) {
  return dropsFor(save.seed ?? 12345, save.region)
    .filter(
      (d) =>
        !(save.pickedDrops ?? []).includes(d.id) &&
        Math.hypot(d.x - position.x, d.y - position.y) < 30,
    )
    .sort(
      (a, b) =>
        Math.hypot(a.x - position.x, a.y - position.y) -
        Math.hypot(b.x - position.x, b.y - position.y),
    )[0];
}
export function materialCounts(save: Save): Record<Material, number> {
  if (save.progress)
    return {
      wood: save.progress.bag.wood ?? 0,
      stone: save.progress.bag.stone ?? 0,
      fiber: save.progress.bag.fiber ?? 0,
    };
  const counts = { wood: 0, stone: 0, fiber: 0 };
  for (const region of ["forest", "temple"] as const)
    for (const d of dropsFor(save.seed ?? 12345, region))
      if (save.pickedDrops?.includes(d.id)) counts[d.kind]++;
  return counts;
}
export function collectDrop(save: Save, id: string): Save {
  const drop = nearestDrop(save);
  if (drop?.id !== id) return save;
  const progress = save.progress
    ? addItem(save.progress, drop.kind)
    : undefined;
  if (save.progress && progress === save.progress) return save;
  return {
    ...save,
    pickedDrops: [...(save.pickedDrops ?? []), id],
    ...(progress ? { progress } : {}),
  };
}
export function exitTriggered(region: Region, p: Point) {
  return region === "cabin"
    ? p.y >= 570 && p.x > 400 && p.x < 505
    : region === "forest"
      ? p.x >= 1890 && p.y >= 590 && p.y <= 700
      : p.x <= 70 && p.y >= 638 && p.y <= 694;
}

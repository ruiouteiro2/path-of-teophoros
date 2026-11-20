import { terrainWalkable, toWorld } from "./worldLayout.ts";
import { validAppearance } from "./appearance.ts";
import type { Appearance } from "./appearance.ts";
import { validProgression, newProgression, addItem } from "./progression.ts";
import type { Progression, ItemId } from "./progression.ts";
export type Region = "forest" | "temple" | "cabin";
export type PetKind = "Dog" | "Boxer" | "Small dog" | "Cat" | "Fox" | "Owl";
export type Point = { x: number; y: number };
export type Facing = "front" | "back" | "left" | "right";
export type Save = {
  name: string;
  petName: string;
  pet: PetKind;
  color: string;
  region: Region;
  position: Point;
  gathered: string[];
  inventory: number;
  visited: Region[];
  facing?: Facing;
  appearance?: Appearance;
  seed?: number;
  pickedDrops?: string[];
  progress?: Progression;
  worldVersion?: 2;
};
export const SAVE_KEY = "teophoros.save.v2";
export const WORLD = { width: 2000, height: 1334 };
export const dimensions = (region: Region) =>
  region === "cabin" ? { width: 900, height: 600 } : WORLD;
export const regions = {
  cabin: {
    name: "Your cabin",
    subtitle: "A roof beneath the Gods",
    description: "Your home at the sanctuary.",
    resource: "Supplies",
    destination: "Temple of the Dawn",
    spawn: { x: 450, y: 490 },
    gate: { x: 450, y: 575 },
  },
  forest: {
    name: "The Olivewild",
    subtitle: "A forest full of small beginnings",
    description:
      "Sunlit olive groves, wild thyme, and a quiet river. Find your footing beneath the trees.",
    resource: "Wild thyme",
    destination: "Temple of the Dawn",
    spawn: toWorld(450, 450),
    gate: toWorld(952, 328),
  },
  temple: {
    name: "Temple of the Dawn",
    subtitle: "Old stones. New stories.",
    description:
      "Marble columns stand among poppies. Follow the old paths and bring life back to the sanctuary.",
    resource: "Wild olives",
    destination: "The Olivewild",
    spawn: toWorld(475, 285),
    gate: toWorld(35, 333),
  },
};
export const resources: Record<Region, Point[]> = {
  cabin: [],
  forest: [
    toWorld(330, 300),
    toWorld(570, 255),
    toWorld(640, 395),
    toWorld(400, 510),
  ],
  temple: [
    toWorld(73, 430),
    toWorld(260, 437),
    toWorld(332, 520),
    toWorld(570, 575),
  ],
};
export function walkable(p: Point, region: Region) {
  return terrainWalkable(p, region);
}
export function move(
  p: Point,
  dx: number,
  dy: number,
  region: Region = "forest",
): Point {
  const x = { x: p.x + dx, y: p.y },
    next = { x: walkable(x, region) ? x.x : p.x, y: p.y + dy };
  return walkable(next, region) ? next : { x: next.x, y: p.y };
}
export function nearest(save: Save) {
  return resources[save.region].findIndex(
    (p, i) =>
      !save.gathered.includes(save.region + "-" + i) &&
      Math.hypot(save.position.x - p.x, save.position.y - p.y) < 48,
  );
}
export function atGate(save: Save) {
  const gate = regions[save.region].gate;
  return Math.hypot(save.position.x - gate.x, save.position.y - gate.y) < 65;
}
export function validSave(value: unknown): value is Save {
  const s = value as Save;
  return (
    !!s &&
    (s.worldVersion === undefined || s.worldVersion === 2) &&
    (s.progress === undefined || validProgression(s.progress)) &&
    (s.appearance === undefined || validAppearance(s.appearance)) &&
    (s.facing === undefined || ["front", "back", "left", "right"].includes(s.facing)) &&
    (s.seed === undefined ||
      (Number.isInteger(s.seed) && s.seed >= 0 && s.seed <= 4294967295)) &&
    (s.pickedDrops === undefined ||
      (Array.isArray(s.pickedDrops) &&
        new Set(s.pickedDrops).size === s.pickedDrops.length &&
        s.pickedDrops.every((id) =>
          /^(?:(forest|temple)-drop-([0-9]|[1-5][0-9])|temple-reed-[0-2])$/.test(id),
        ))) &&
    typeof s.name === "string" &&
    typeof s.petName === "string" &&
    ["Dog", "Boxer", "Small dog", "Cat", "Fox", "Owl"].includes(s.pet) &&
    ["forest", "temple", "cabin"].includes(s.region) &&
    typeof s.color === "string" &&
    Number.isFinite(s.position?.x) &&
    Number.isFinite(s.position?.y) &&
    (s.worldVersion === 2
      ? s.position.x >= 0 && s.position.x <= dimensions(s.region).width && s.position.y >= 0 && s.position.y <= dimensions(s.region).height
      : s.position.x >= 0 &&
        s.position.x <= 1000 &&
        s.position.y >= 0 &&
        s.position.y <= 667) &&
    Array.isArray(s.gathered) &&
    s.gathered.every((v) => /^(forest|temple)-[0-3]$/.test(v)) &&
    new Set(s.gathered).size === s.gathered.length &&
    s.inventory === s.gathered.length &&
    Array.isArray(s.visited) &&
    s.visited.every((v) => v === "forest" || v === "temple" || v === "cabin")
  );
}

/** Upgrade existing journeys without replaying the rescue or duplicating their collected items. */
export function migrateProgress(save: Save): Save {
  const position =
    save.worldVersion === 2 && walkable(save.position, save.region)
      ? save.position
      : regions[save.region].spawn;
  if (save.progress) return { ...save, position, worldVersion: 2 };
  let progress: Progression = {
    ...newProgression(),
    story: "complete",
    familiarGranted: true,
    energy: 100,
    money: 100,
  };
  for (const id of save.pickedDrops ?? []) {
    const index = Number(id.split("-").at(-1));
    progress = addItem(
      progress,
      id.startsWith("temple-reed-") ? "reed" : (["wood", "stone", "fiber"] as ItemId[])[index % 3],
    );
  }
  for (const id of save.gathered)
    progress = addItem(progress, id.startsWith("forest") ? "thyme" : "olives");
  return { ...save, progress, position, worldVersion: 2 };
}

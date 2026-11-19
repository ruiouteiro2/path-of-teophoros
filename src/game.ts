export type Region = "forest" | "temple";
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
};
export const SAVE_KEY = "teophoros.save.v2";
export const WORLD = { width: 1000, height: 667 };
export const regions = {
  forest: {
    name: "The Olivewild",
    subtitle: "A forest full of small beginnings",
    description:
      "Sunlit olive groves, wild thyme, and a quiet river. Find your footing beneath the trees.",
    resource: "Wild thyme",
    destination: "Temple of the Dawn",
    spawn: { x: 450, y: 450 },
    gate: { x: 952, y: 328 },
  },
  temple: {
    name: "Temple of the Dawn",
    subtitle: "Old stones. New stories.",
    description:
      "Marble columns stand among poppies. Follow the old paths and bring life back to the sanctuary.",
    resource: "Wild olives",
    destination: "The Olivewild",
    spawn: { x: 500, y: 450 },
    gate: { x: 60, y: 380 },
  },
};
export const resources: Record<Region, Point[]> = {
  forest: [
    { x: 330, y: 300 },
    { x: 570, y: 255 },
    { x: 640, y: 395 },
    { x: 400, y: 510 },
  ],
  temple: [
    { x: 270, y: 345 },
    { x: 735, y: 350 },
    { x: 650, y: 530 },
    { x: 350, y: 535 },
  ],
};
// Connected navigation zones follow the clearings, paths, and bridge in the artwork.
// The river can only be crossed within the bridge corridor.
const zones: Record<Region, number[][]> = {
  forest: [
    [220, 190, 660, 480],
    [330, 170, 590, 500],
    [365, 420, 500, 650],
    [480, 285, 720, 370],
    [700, 315, 840, 365],
    [830, 295, 985, 350],
    [370, 460, 460, 545],
  ],
  temple: [
    [270, 275, 740, 490],
    [400, 235, 620, 520],
    [425, 480, 555, 650],
    [25, 355, 330, 407],
    [340, 470, 635, 535],
  ],
};
export function walkable(p: Point, region: Region) {
  return zones[region].some(
    ([x1, y1, x2, y2]) => p.x >= x1 && p.x <= x2 && p.y >= y1 && p.y <= y2,
  );
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
    typeof s.name === "string" &&
    typeof s.petName === "string" &&
    ["Dog", "Boxer", "Small dog", "Cat", "Fox", "Owl"].includes(s.pet) &&
    ["forest", "temple"].includes(s.region) &&
    typeof s.color === "string" &&
    Number.isFinite(s.position?.x) &&
    Number.isFinite(s.position?.y) &&
    walkable(s.position, s.region) &&
    Array.isArray(s.gathered) &&
    s.gathered.every((v) => /^(forest|temple)-[0-3]$/.test(v)) &&
    new Set(s.gathered).size === s.gathered.length &&
    s.inventory === s.gathered.length &&
    Array.isArray(s.visited) &&
    s.visited.every((v) => v === "forest" || v === "temple")
  );
}

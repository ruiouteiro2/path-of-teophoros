/** Authored navigation in normalized 1000×667 terrain coordinates. Gameplay is twice this size. */
export type XY = { x: number; y: number };
export const WORLD_SCALE = 2;
export const toWorld = (x: number, y: number): XY => ({
  x: x * WORLD_SCALE,
  y: y * WORLD_SCALE,
});
export const homeLocations = {
  priest: toWorld(455, 272),
  cabin: toWorld(787, 237),
  chest: toWorld(728, 344),
  workbench: toWorld(676, 350),
  provisions: toWorld(278, 259),
  lake: toWorld(688, 506),
  altar: toWorld(500, 242),
  well: toWorld(815, 350),
};
export type HomePlace = keyof typeof homeLocations;
export type InteractionPlace = HomePlace | "bed" | "wardrobe";
export const cabinLocations = {
  bed: { x: 730, y: 330 },
  chest: { x: 280, y: 250 },
  wardrobe: { x: 820, y: 300 },
};
export function nearestHome(
  p: XY,
  region: string,
): InteractionPlace | undefined {
  if (region === "cabin")
    return (
      Object.keys(cabinLocations) as (keyof typeof cabinLocations)[]
    ).find(
      (id) =>
        Math.hypot(p.x - cabinLocations[id].x, p.y - cabinLocations[id].y) < 65,
    );
  if (region !== "temple") return undefined;
  return (Object.keys(homeLocations) as HomePlace[])
    .filter(
      (id) =>
        Math.hypot(p.x - homeLocations[id].x, p.y - homeLocations[id].y) < 58,
    )
    .sort(
      (a, b) =>
        Math.hypot(p.x - homeLocations[a].x, p.y - homeLocations[a].y) -
        Math.hypot(p.x - homeLocations[b].x, p.y - homeLocations[b].y),
    )[0];
}
const templePolygons: number[][][] = [
  [
    [310, 242],
    [387, 229],
    [610, 232],
    [640, 290],
    [612, 387],
    [565, 438],
    [447, 448],
    [330, 406],
    [300, 339],
  ],
  [
    [0, 319],
    [309, 319],
    [338, 349],
    [0, 347],
  ],
  [
    [234, 237],
    [268, 237],
    [288, 300],
    [302, 335],
    [263, 345],
    [245, 290],
  ],
  [
    [605, 275],
    [640, 243],
    [668, 209],
    [706, 187],
    [708, 214],
    [674, 243],
    [653, 286],
    [616, 316],
  ],
  [
    [664, 244],
    [730, 237],
    [765, 225],
    [808, 225],
    [813, 252],
    [766, 267],
    [703, 269],
    [666, 285],
  ],
  [
    [594, 344],
    [660, 344],
    [683, 335],
    [757, 337],
    [804, 329],
    [835, 340],
    [820, 364],
    [735, 372],
    [689, 389],
    [622, 384],
  ],
  [
    [610, 387],
    [672, 388],
    [704, 374],
    [770, 373],
    [814, 389],
    [804, 411],
    [730, 420],
    [674, 439],
    [642, 474],
    [680, 482],
    [716, 481],
    [717, 512],
    [666, 516],
    [622, 493],
    [591, 480],
  ],
  [
    [456, 417],
    [505, 418],
    [520, 476],
    [508, 534],
    [504, 667],
    [463, 667],
    [454, 576],
    [464, 521],
    [456, 481],
  ],
  [
    [314, 380],
    [359, 424],
    [348, 460],
    [311, 486],
    [291, 525],
    [309, 564],
    [283, 593],
    [219, 611],
    [164, 581],
    [144, 537],
    [102, 523],
    [61, 484],
    [59, 452],
    [90, 431],
    [131, 417],
    [171, 396],
    [203, 400],
    [236, 424],
    [274, 434],
    [298, 417],
  ],
  [
    [130, 440],
    [200, 430],
    [241, 449],
    [234, 475],
    [187, 496],
    [132, 481],
  ],
  [
    [180, 533],
    [231, 517],
    [288, 536],
    [300, 568],
    [249, 591],
    [197, 579],
  ],
  [
    [291, 486],
    [351, 486],
    [367, 527],
    [341, 552],
    [298, 545],
  ],
  [
    [497, 525],
    [547, 519],
    [609, 542],
    [622, 581],
    [592, 609],
    [533, 606],
    [498, 578],
  ],
];
const forestRects = [
  [220, 190, 660, 480],
  [330, 170, 590, 500],
  [365, 420, 500, 650],
  [480, 285, 720, 370],
  [700, 315, 840, 365],
  [830, 295, 985, 350],
  [370, 460, 460, 545],
];
const forestTrails: number[][][] = [
  [
    [220, 160],
    [150, 177],
    [92, 196],
    [91, 230],
    [120, 270],
    [90, 296],
    [80, 330],
    [45, 370],
    [45, 400],
    [80, 426],
    [100, 460],
    [80, 485],
    [75, 510],
    [100, 535],
    [135, 546],
    [160, 565],
    [205, 570],
    [250, 565],
    [285, 550],
    [315, 530],
    [355, 525],
    [405, 545],
  ],
  [
    [70, 407],
    [115, 416],
    [158, 398],
    [200, 380],
    [230, 354],
  ],
];
function nearTrail(p: XY, trail: number[][], radius = 16) {
  return trail.slice(1).some(([bx, by], i) => {
    const [ax, ay] = trail[i],
      dx = bx - ax,
      dy = by - ay;
    const t = Math.max(
      0,
      Math.min(1, ((p.x - ax) * dx + (p.y - ay) * dy) / (dx * dx + dy * dy)),
    );
    return Math.hypot(p.x - ax - t * dx, p.y - ay - t * dy) < radius;
  });
}
function inPolygon(p: XY, vertices: number[][]) {
  let inside = false;
  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    const [xi, yi] = vertices[i],
      [xj, yj] = vertices[j];
    if (
      yi > p.y !== yj > p.y &&
      p.x < ((xj - xi) * (p.y - yi)) / (yj - yi) + xi
    )
      inside = !inside;
  }
  return inside;
}
export function terrainArea(p: XY, region: "forest" | "temple" | "cabin") {
  if (region === "cabin") {
    const floor = p.x > 55 && p.x < 850 && p.y > 238 && p.y < 535;
    const doorway = p.x > 400 && p.x < 505 && p.y >= 520 && p.y < 590;
    const table = p.x > 92 && p.x < 280 && p.y > 297 && p.y < 440;
    const bed = p.x > 675 && p.x < 790 && p.y < 318;
    return (floor || doorway) && !table && !bed;
  }
  const q = { x: p.x / WORLD_SCALE, y: p.y / WORLD_SCALE };
  return region === "temple"
    ? templePolygons.some((poly) => inPolygon(q, poly))
    : forestRects.some(
        ([x1, y1, x2, y2]) => q.x >= x1 && q.x <= x2 && q.y >= y1 && q.y <= y2,
      ) || forestTrails.some((trail) => nearTrail(q, trail));
}

// Solid foreground footprints are separate from the original navigation area.
// Keep terrainArea stable for seeded drop generation in existing saves.
export function terrainWalkable(p: XY, region: "forest" | "temple" | "cabin") {
  if (!terrainArea(p, region)) return false;
  if (region === "forest") {
    const x = p.x / WORLD_SCALE,
      y = p.y / WORLD_SCALE;
    // Boulder beside the western bend: source image ~384,604 at 1536�1024.
    if (((x - 250) / 20) ** 2 + ((y - 395) / 15) ** 2 < 1) return false;
  }
  return true;
}

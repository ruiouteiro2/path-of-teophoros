import type { Point, Region } from "./game.ts";
export function normalizeVolume(value: number): number {
  return Number.isFinite(value) ? Math.round(Math.max(0, Math.min(1, value)) * 100) / 100 : 0;
}
export function footstepSurface(
  region: Region,
  p: Point,
): "earth" | "stone" | "wood" {
  if (region === "cabin") return "wood";
  if (
    region === "forest" &&
    p.x >= 1480 &&
    p.x <= 1600 &&
    p.y >= 606 &&
    p.y <= 724
  )
    return "wood";
  if (
    region === "temple" &&
    p.x >= 1340 &&
    p.x <= 1435 &&
    p.y >= 962 &&
    p.y <= 1040
  )
    return "wood";
  if (
    region === "temple" &&
    ((p.x - 970) / 180) ** 2 + ((p.y - 670) / 150) ** 2 < 1
  )
    return "stone";
  return "earth";
}
export function nextFootstep(previous: number, stride: number) {
  // Deterministic variety without an audible four-sample loop or adjacent repeat.
  const hash = (Math.imul(stride + 1, 0x45d9f3b) ^ (stride >>> 3)) >>> 0;
  return (previous + 1 + (hash % 3)) % 4;
}

/** Quiet positional water, measured from the water body rather than its center. */
export function waterProximity(region: Region, p: Point): number {
  if (region === "cabin") return 0;
  let distance: number;
  if (region === "forest") {
    distance = Math.max(0, Math.abs(p.x - 1548) - 45);
  } else {
    // Conservative ellipse around the authored lake, including the fishing dock.
    const dx = p.x - 1590, dy = p.y - 1015;
    const normalized = Math.hypot(dx / 320, dy / 180);
    const radial = Math.hypot(dx, dy);
    distance = normalized <= 1 ? 0 : radial * (1 - 1 / normalized);
  }
  const t = Math.max(0, 1 - distance / 260);
  return t * t * (3 - 2 * t);
}

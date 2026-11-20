import type { Point, Region } from "./game.ts";
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

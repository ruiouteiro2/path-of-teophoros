export type CropKind = "barley" | "onion";
export type Plot = {
  tilled: boolean;
  crop?: CropKind;
  age: number;
  watered: boolean;
};
export type Garden = Partial<Record<string, Plot>>;
export const cropDays: Record<CropKind, number> = { barley: 3, onion: 4 };
export const gardenPlots = Array.from({ length: 6 }, (_, i) => ({
  id: `garden-${i}`,
  x: (155 + (i % 3) * 27) * 2,
  y: (450 + Math.floor(i / 3) * 26) * 2,
}));
export const emptyPlot: Plot = { tilled: false, age: 0, watered: false };
export function nearestPlot(
  position: { x: number; y: number },
  region: string,
) {
  if (region !== "temple") return undefined;
  return gardenPlots
    .filter((p) => Math.hypot(position.x - p.x, position.y - p.y) < 35)
    .sort(
      (a, b) =>
        Math.hypot(position.x - a.x, position.y - a.y) -
        Math.hypot(position.x - b.x, position.y - b.y),
    )[0];
}
export function validGarden(value: unknown): value is Garden {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return Object.entries(value).every(([id, raw]) => {
    const p = raw as Plot;
    return (
      gardenPlots.some((plot) => plot.id === id) &&
      !!p &&
      typeof p.tilled === "boolean" &&
      typeof p.watered === "boolean" &&
      Number.isInteger(p.age) &&
      p.age >= 0 &&
      (p.crop !== undefined
        ? (p.crop === "barley" || p.crop === "onion") &&
          p.tilled &&
          p.age <= cropDays[p.crop]
        : p.age === 0) &&
      (p.tilled || !p.watered)
    );
  });
}
export function growGarden(garden: Garden = {}): Garden {
  return Object.fromEntries(
    Object.entries(garden).map(([id, p]) => [
      id,
      {
        ...p!,
        age:
          p!.crop && p!.watered
            ? Math.min(cropDays[p!.crop], p!.age + 1)
            : p!.age,
        watered: false,
      },
    ]),
  );
}

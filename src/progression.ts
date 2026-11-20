/** Persistent game progression. All transactions return a new value or the original on failure. */
import {
  cropDays,
  gardenPlots,
  emptyPlot,
  growGarden,
  validGarden,
} from "./garden.ts";
import type { Garden, CropKind } from "./garden.ts";
export const itemIds = [
  "wood",
  "stone",
  "fiber",
  "thyme",
  "olives",
  "bread",
  "tea",
  "carp",
  "perch",
  "reed",
  "torch",
  "rod",
  "barleySeed",
  "onionSeed",
  "barley",
  "onion",
  "hoe",
  "wateringJug",
] as const;
export type ItemId = (typeof itemIds)[number];
export type Bag = Partial<Record<ItemId, number>>;
export type StoryStage =
  | "awakening"
  | "world"
  | "calling"
  | "familiar"
  | "supplies"
  | "complete";
export type Progression = {
  version: 1;
  money: number;
  earned: number;
  bag: Bag;
  chest: Bag;
  story: StoryStage;
  familiarGranted: boolean;
  day: number;
  energy: number;
  restoredAltar: boolean;
  caught: number;
  garden?: Garden;
  water?: number;
};
export const items: Record<
  ItemId,
  {
    name: string;
    description: string;
    sell: number;
    buy?: number;
    energy?: number;
  }
> = {
  barleySeed: {
    name: "Barley seed",
    description: "Plant in tilled soil. Grows after 3 watered nights.",
    sell: 2,
    buy: 5,
  },
  onionSeed: {
    name: "Onion seed",
    description: "Plant in tilled soil. Grows after 4 watered nights.",
    sell: 3,
    buy: 8,
  },
  barley: {
    name: "Golden barley",
    description: "A harvest from your garden. Thaleia buys grain at the camp.",
    sell: 16,
  },
  onion: {
    name: "Red onion",
    description: "A crisp garden onion. Restores 12 energy.",
    sell: 24,
    energy: 12,
  },
  hoe: {
    name: "Bronze hoe",
    description: "Prepare the six garden plots in the western grove.",
    sell: 0,
    buy: 25,
  },
  wateringJug: {
    name: "Watering jug",
    description: "Holds water for six plots. Refill at the sanctuary well.",
    sell: 0,
    buy: 20,
  },
  wood: {
    name: "Olive wood",
    description: "A dry branch. Useful for repairs and crafting.",
    sell: 3,
  },
  stone: {
    name: "Stone",
    description: "A sound piece of local limestone.",
    sell: 2,
  },
  fiber: {
    name: "Plant fiber",
    description: "Tough strands for binding and weaving.",
    sell: 2,
  },
  thyme: {
    name: "Wild thyme",
    description: "A fragrant herb from the woodland.",
    sell: 12,
  },
  olives: {
    name: "Wild olives",
    description: "Fresh olives gathered from the sanctuary trees.",
    sell: 16,
  },
  bread: {
    name: "Barley bread",
    description: "A small loaf. Restores 25 energy.",
    sell: 8,
    buy: 20,
    energy: 25,
  },
  tea: {
    name: "Thyme infusion",
    description: "A warming drink. Restores 40 energy.",
    sell: 15,
    buy: 35,
    energy: 40,
  },
  carp: {
    name: "Lake carp",
    description: "A sturdy freshwater fish from the sanctuary lake.",
    sell: 28,
  },
  perch: {
    name: "Silver perch",
    description: "A quick little fish with bright scales.",
    sell: 36,
  },
  reed: {
    name: "Lake reed",
    description: "Flexible reed from the water’s edge.",
    sell: 4,
  },
  torch: {
    name: "Olivewood torch",
    description: "A crafted light for the paths ahead.",
    sell: 12,
  },
  rod: {
    name: "Reed fishing rod",
    description: "A simple rod. Use it at the lake to fish.",
    sell: 0,
    buy: 60,
  },
};
export const storyOrder: StoryStage[] = [
  "awakening",
  "world",
  "calling",
  "familiar",
  "supplies",
  "complete",
];
export function newProgression(): Progression {
  return {
    version: 1,
    money: 0,
    earned: 0,
    bag: {},
    chest: {},
    story: "awakening",
    familiarGranted: false,
    day: 1,
    energy: 35,
    restoredAltar: false,
    caught: 0,
    garden: {},
    water: 0,
  };
}
const whole = (n: unknown, max = 9999999): n is number =>
  Number.isSafeInteger(n) && (n as number) >= 0 && (n as number) <= max;
export function validBag(value: unknown): value is Bag {
  return (
    !!value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.entries(value).every(
      ([k, v]) => itemIds.includes(k as ItemId) && whole(v, 999),
    )
  );
}
export function validProgression(value: unknown): value is Progression {
  const p = value as Progression;
  return (
    !!p &&
    p.version === 1 &&
    whole(p.money) &&
    whole(p.earned) &&
    validBag(p.bag) &&
    validBag(p.chest) &&
    storyOrder.includes(p.story) &&
    typeof p.familiarGranted === "boolean" &&
    whole(p.day, 99999) &&
    p.day >= 1 &&
    whole(p.energy, 100) &&
    typeof p.restoredAltar === "boolean" &&
    whole(p.caught) &&
    (p.garden === undefined || validGarden(p.garden)) &&
    (p.water === undefined || whole(p.water, 6))
  );
}
export function count(bag: Bag, id: ItemId) {
  return bag[id] ?? 0;
}
export function addItem(p: Progression, id: ItemId, amount = 1): Progression {
  if (!whole(amount, 999) || amount === 0 || count(p.bag, id) + amount > 999)
    return p;
  return { ...p, bag: { ...p.bag, [id]: count(p.bag, id) + amount } };
}
export function landFish(p: Progression, id: ItemId): Progression {
  if ((id !== "carp" && id !== "perch") || p.caught >= 9999999) return p;
  const next = addItem(p, id);
  return next === p ? p : { ...next, caught: p.caught + 1 };
}
function take(bag: Bag, id: ItemId, amount: number): Bag {
  const next = { ...bag, [id]: count(bag, id) - amount };
  if (next[id] === 0) delete next[id];
  return next;
}
export function transfer(
  p: Progression,
  id: ItemId,
  toChest: boolean,
  amount = 1,
): Progression {
  if (!whole(amount, 999) || !amount) return p;
  const from = toChest ? p.bag : p.chest,
    to = toChest ? p.chest : p.bag;
  if (count(from, id) < amount || count(to, id) + amount > 999) return p;
  return {
    ...p,
    [toChest ? "bag" : "chest"]: take(from, id, amount),
    [toChest ? "chest" : "bag"]: { ...to, [id]: count(to, id) + amount },
  };
}
export function trade(
  p: Progression,
  id: ItemId,
  buy: boolean,
  amount = 1,
): Progression {
  if (!whole(amount, 999) || !amount) return p;
  const price = buy ? items[id].buy : items[id].sell;
  if (!price) return p;
  const total = price * amount;
  if (buy) {
    if (p.money < total || count(p.bag, id) + amount > 999) return p;
    return { ...addItem(p, id, amount), money: p.money - total };
  }
  if (
    count(p.bag, id) < amount ||
    p.money + total > 9999999 ||
    p.earned + total > 9999999
  )
    return p;
  return {
    ...p,
    bag: take(p.bag, id, amount),
    money: p.money + total,
    earned: p.earned + total,
  };
}
export function consume(p: Progression, id: ItemId): Progression {
  const energy = items[id].energy;
  if (!energy || count(p.bag, id) < 1 || p.energy >= 100) return p;
  return {
    ...p,
    bag: take(p.bag, id, 1),
    energy: Math.min(100, p.energy + energy),
  };
}
export const recipes = {
  torch: {
    name: "Olivewood torch",
    station: "craft",
    cost: { wood: 2, fiber: 1 },
    result: "torch",
  },
  tea: {
    name: "Thyme infusion",
    station: "cook",
    cost: { thyme: 2 },
    result: "tea",
  },
  bread: {
    name: "Barley bread",
    station: "cook",
    cost: { barley: 1 },
    result: "bread",
  },
  rod: {
    name: "Reed fishing rod",
    station: "craft",
    cost: { wood: 3, fiber: 2 },
    result: "rod",
  },
} as const;
export type RecipeId = keyof typeof recipes;
export function craft(p: Progression, recipe: RecipeId): Progression {
  const r = recipes[recipe];
  if (
    count(p.bag, r.result) >= 999 ||
    Object.entries(r.cost).some(([id, n]) => count(p.bag, id as ItemId) < n)
  )
    return p;
  let bag = p.bag;
  for (const [id, n] of Object.entries(r.cost))
    bag = take(bag, id as ItemId, n);
  return addItem({ ...p, bag }, r.result);
}
export const altarCost: Bag = { wood: 3, stone: 3, fiber: 2 };
export function restoreAltar(p: Progression): Progression {
  if (p.money > 9999879 || p.earned > 9999879) return p;
  if (
    p.restoredAltar ||
    p.story !== "complete" ||
    Object.entries(altarCost).some(([id, n]) => count(p.bag, id as ItemId) < n!)
  )
    return p;
  let bag = p.bag;
  for (const [id, n] of Object.entries(altarCost))
    bag = take(bag, id as ItemId, n!);
  return {
    ...p,
    bag,
    restoredAltar: true,
    money: p.money + 120,
    earned: p.earned + 120,
  };
}
export function advanceStory(p: Progression): Progression {
  const index = storyOrder.indexOf(p.story);
  if (index < 0 || index === storyOrder.length - 1) return p;
  const next = { ...p, story: storyOrder[index + 1] };
  if (p.story === "familiar") next.familiarGranted = true;
  if (p.story === "supplies")
    return {
      ...next,
      money: p.money + 100,
      bag: {
        ...p.bag,
        bread: Math.min(999, count(p.bag, "bread") + 2),
        hoe: Math.max(1, count(p.bag, "hoe")),
        wateringJug: Math.max(1, count(p.bag, "wateringJug")),
        barleySeed: Math.min(999, count(p.bag, "barleySeed") + 6),
      },
      water: 6,
      energy: 80,
    };
  return next;
}
export function rest(p: Progression): Progression {
  return p.day >= 99999
    ? p
    : { ...p, day: p.day + 1, energy: 100, garden: growGarden(p.garden) };
}

export type GardenAction = "till" | "water" | "harvest" | CropKind;
export function tendGarden(
  p: Progression,
  id: string,
  action: GardenAction,
): Progression {
  if (!gardenPlots.some((plot) => plot.id === id) || p.story !== "complete")
    return p;
  const plot = p.garden?.[id] ?? emptyPlot;
  let next = p,
    changed = { ...plot };
  if (action === "till") {
    if (plot.tilled || !count(p.bag, "hoe") || p.energy < 4) return p;
    next = { ...p, energy: p.energy - 4 };
    changed.tilled = true;
  } else if (action === "water") {
    if (
      !plot.tilled ||
      plot.watered ||
      !count(p.bag, "wateringJug") ||
      !(p.water ?? 0) ||
      p.energy < 2 ||
      (plot.crop && plot.age >= cropDays[plot.crop])
    )
      return p;
    next = { ...p, energy: p.energy - 2, water: (p.water ?? 0) - 1 };
    changed.watered = true;
  } else if (action === "harvest") {
    if (!plot.crop || plot.age < cropDays[plot.crop]) return p;
    next = addItem(p, plot.crop);
    if (next === p) return p;
    changed = { tilled: true, age: 0, watered: plot.watered };
  } else {
    if (action !== "barley" && action !== "onion") return p;
    const seed = action === "barley" ? "barleySeed" : "onionSeed";
    if (!plot.tilled || plot.crop || count(p.bag, seed) < 1) return p;
    next = { ...p, bag: take(p.bag, seed, 1) };
    changed = { ...plot, crop: action, age: 0 };
  }
  return { ...next, garden: { ...p.garden, [id]: changed } };
}
export function refillJug(p: Progression): Progression {
  return !count(p.bag, "wateringJug") || p.water === 6 ? p : { ...p, water: 6 };
}

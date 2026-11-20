import React from "react";
import { Image } from "react-native";
import { AtlasFrame } from "./AtlasFrame";
import { ItemId } from "../progression";
export function ItemIcon({
  id,
  size = 48,
}: {
  id: ItemId | "money" | "chest" | "axe" | "pickaxe";
  size?: number;
}) {
  const garden = {
    barleySeed: 0,
    onionSeed: 1,
    barley: 2,
    onion: 3,
    wateringJug: 5,
  } as const;
  if (id === "grilledFish")
    return <Image source={require("../../assets/world/grilled-fish.png")} style={{ width: size, height: size }} resizeMode="contain" />;
  if (id === "hoe")
    return (
      <Image
        source={require("../../assets/world/hoe.png")}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    );
  if (id in garden)
    return (
      <AtlasFrame
        source={require("../../assets/world/garden-items.png")}
        cell={garden[id as keyof typeof garden]}
        columns={4}
        rows={2}
        size={size}
      />
    );
  // Explicit atlas cells: inventory order can change without changing artwork.
  // Adding an ItemId requires an intentional art mapping at compile time.
  const cells = {
    wood: 0, stone: 1, fiber: 2, thyme: 3, olives: 4,
    bread: 5, tea: 6, carp: 7, perch: 8, reed: 9, torch: 10, rod: 11,
    money: 12, chest: 13, axe: 14, pickaxe: 15,
  } satisfies Record<Exclude<ItemId, keyof typeof garden | "hoe" | "grilledFish"> |
    "money" | "chest" | "axe" | "pickaxe", number>;
  const cell = cells[id as keyof typeof cells];
  return (
    <AtlasFrame
      source={require("../../assets/world/items.png")}
      cell={cell}
      size={size}
    />
  );
}

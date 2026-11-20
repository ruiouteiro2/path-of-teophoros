import React from "react";
import { Image } from "react-native";
import { AtlasFrame } from "./AtlasFrame";
import { ItemId } from "../progression";
import materialAnchors from "../material-anchors.json";
const materials = { wood: 0, stone: 1, fiber: 2, reed: 3 } as const;
export function materialBaseline(id: keyof typeof materials) {
  return materialAnchors[materials[id]];
}
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
  if (id in materials)
    return <AtlasFrame source={require("../../assets/world/loose-materials.png")}
      cell={materials[id as keyof typeof materials]} columns={2} rows={2} size={size} />;
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
    thyme: 3, olives: 4,
    bread: 5, tea: 6, carp: 7, perch: 8, torch: 10, rod: 11,
    money: 12, chest: 13, axe: 14, pickaxe: 15,
  } satisfies Record<Exclude<ItemId, keyof typeof garden | keyof typeof materials | "hoe" | "grilledFish"> |
    "money" | "chest" | "axe" | "pickaxe", number>;
  const cell = cells[id as keyof typeof cells];
  return (
    <AtlasFrame
      source={require("../../assets/world/items-v2.png")}
      cell={cell}
      size={size}
    />
  );
}

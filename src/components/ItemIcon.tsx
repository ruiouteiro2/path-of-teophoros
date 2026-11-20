import React from "react";
import { Image } from "react-native";
import { AtlasFrame } from "./AtlasFrame";
import { itemIds, ItemId } from "../progression";
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
  };
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
  const extra = { money: 12, chest: 13, axe: 14, pickaxe: 15 };
  const cell = itemIds.includes(id as ItemId)
    ? itemIds.indexOf(id as ItemId)
    : extra[id as keyof typeof extra];
  return (
    <AtlasFrame
      source={require("../../assets/world/items.png")}
      cell={cell}
      size={size}
    />
  );
}

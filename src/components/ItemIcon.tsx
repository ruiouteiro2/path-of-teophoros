import React from "react";
import { AtlasFrame } from "./AtlasFrame";
import { itemIds, ItemId } from "../progression";
export function ItemIcon({
  id,
  size = 48,
}: {
  id: ItemId | "money" | "chest" | "axe" | "pickaxe";
  size?: number;
}) {
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

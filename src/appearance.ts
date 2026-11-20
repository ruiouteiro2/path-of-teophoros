export type Appearance = {
  hairStyle: "short" | "tied";
  hairColor: "brown" | "black" | "gold" | "silver";
  outfit: "chiton" | "cloak";
  clothColor: "blue" | "green" | "red";
};
export const defaultAppearance: Appearance = {
  hairStyle: "short",
  hairColor: "brown",
  outfit: "chiton",
  clothColor: "blue",
};
export const hairColors = {
  brown: "#87502a",
  black: "#302a29",
  gold: "#efc668",
  silver: "#cdd4da",
};
export const clothColors = {
  blue: "#408be0",
  green: "#638d3f",
  red: "#c34d38",
};
export function validAppearance(a: unknown): a is Appearance {
  const v = a as Appearance;
  return (
    !!v &&
    ["short", "tied"].includes(v.hairStyle) &&
    Object.hasOwn(hairColors, v.hairColor) &&
    ["chiton", "cloak"].includes(v.outfit) &&
    Object.hasOwn(clothColors, v.clothColor)
  );
}

import React, { useId } from "react";
import { Platform } from "react-native";
import Svg, {
  Defs,
  Filter,
  FeColorMatrix,
  Image,
  G,
  Mask,
} from "react-native-svg";
import type { Facing } from "../game";
import {
  Appearance,
  defaultAppearance,
  hairColors,
  clothColors,
} from "../appearance";
import anchors from "../hero-anchors.json";
import recoveryAnchors from "../recovery-anchors.json";
export type RecoveryPose = "lying" | "sitting";
const recoveryKeys = ["short-chiton", "tied-chiton", "short-cloak", "tied-cloak"];
function recoveryCell(a: Appearance, pose: RecoveryPose) {
  return recoveryKeys.indexOf(`${a.hairStyle}-${a.outfit}`) + (pose === "sitting" ? 4 : 0);
}
export function recoveryBaseline(a: Appearance, pose: RecoveryPose) {
  return recoveryAnchors[recoveryCell(a, pose)];
}
const sheets = {
  "short-chiton": require("../../assets/world/hero/short-chiton.png"),
  "tied-chiton": require("../../assets/world/hero/tied-chiton.png"),
  "short-cloak": require("../../assets/world/hero/short-cloak.png"),
  "tied-cloak": require("../../assets/world/hero/tied-cloak.png"),
};
const rows = { front: 0, back: 1, left: 2, right: 3 };
// Browser SVG filters default to linearRGB, unlike the authored sRGB key colors.
// Pass the SVG presentation attribute only on web; native color matrices operate
// on the texture channels directly and do not expose this browser attribute.
const colorSpace = Platform.OS === "web" ? { colorInterpolationFilters: "sRGB" } : {};
export function heroBaseline(a: Appearance, facing: Facing, frame: number) {
  return anchors[`${a.hairStyle}-${a.outfit}`][rows[facing] * 8 + (frame % 8)];
}
function matrix(hex: string, hair: boolean) {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  return [
    ...c.flatMap((v) =>
      hair ? [v * 1.65, 0, 0, 0, 0] : [0, v * 1.5, 0, 0, 0],
    ),
    ...(hair ? [10, -20, 10, 0, -1.5] : [-20, 10, 10, 0, -1.5]),
  ].join(" ");
}
export function Hero({
  facing = "front",
  size = 80,
  frame = 0,
  appearance = defaultAppearance,
  recovery,
}: {
  facing?: Facing;
  size?: number;
  frame?: number;
  appearance?: Appearance;
  recovery?: RecoveryPose;
}) {
  const id = useId().replace(/:/g, "");
  const source = recovery ? require("../../assets/world/hero/recovery.png") : sheets[`${appearance.hairStyle}-${appearance.outfit}`];
  const cell = recovery ? recoveryCell(appearance, recovery) : rows[facing] * 8 + frame % 8;
  const columns = recovery ? 4 : 8;
  const props = {
    href: source,
    x: -(cell % columns) * 100,
    y: -Math.floor(cell / columns) * 100,
    width: columns * 100,
    height: recovery ? 200 : 400,
    preserveAspectRatio: "none" as const,
  };
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <Filter {...colorSpace} id={id + "hair"} x="0" y="0" width="100%" height="100%">
          <FeColorMatrix
            type="matrix"
            values={matrix(hairColors[appearance.hairColor], true)}
          />
        </Filter>
        <Filter {...colorSpace} id={id + "cloth"} x="0" y="0" width="100%" height="100%">
          <FeColorMatrix
            type="matrix"
            values={matrix(clothColors[appearance.clothColor], false)}
          />
        </Filter>
        <Mask id={id + "alpha"} maskType="alpha">
          <Image {...props} />
        </Mask>
      </Defs>
      <Image {...props} />
      <G mask={`url(#${id}alpha)`}>
        <Image {...props} filter={`url(#${id}hair)`} />
        <Image {...props} filter={`url(#${id}cloth)`} />
      </G>
    </Svg>
  );
}

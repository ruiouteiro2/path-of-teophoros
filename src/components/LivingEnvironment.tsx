import React, { memo, useEffect, useState } from "react";
import { AppState, StyleSheet, View } from "react-native";
import Svg, {
  Defs,
  Mask,
  Rect,
  Path,
  Ellipse,
  G,
  Image as SvgImage,
} from "react-native-svg";
import type { Region } from "../game";
import { AtlasFrame } from "./AtlasFrame";
import anchors from "../sprite-anchors.json";
const flowers = require("../../assets/world/flowers.png");
const wildlife = require("../../assets/world/wildlife.png");
const dragonflies = require("../../assets/world/dragonflies.png");
const water = require("../../assets/world/water.png");

export function Flowers({
  species,
  size,
  time,
  phase,
}: {
  species: number;
  size: number;
  time: number;
  phase: number;
}) {
  // Gusts separated by stillness; only the upper stems change in the authored frames.
  const cycle = (time + phase * 0.63) % 7;
  const frame =
    cycle < 2
      ? 0
      : [0, 1, 2, 3, 2, 1, 0][Math.min(6, Math.floor((cycle - 2) / 0.72))];
  const foot = anchors.flowers[species * 4 + frame];
  return (
    <View
      style={{
        transform: [
          { translateX: (0.5 - foot.x) * size },
          { translateY: (0.96 - foot.y) * size },
        ],
      }}
    >
      <AtlasFrame source={flowers} cell={species * 4 + frame} size={size} />
    </View>
  );
}
const river =
  "M762 0H801L802 35 809 60 796 86 790 110 799 143 795 170 783 196 790 225 804 249 794 279 795 303H747L744 280 739 259 748 233 746 207 740 183 754 160 758 139 751 110 762 81 770 59 767 32Z M747 361H795L800 391 792 416 802 454 807 477 795 505 789 530 780 556 784 578 790 610 793 643 789 667H742L735 637 737 606 732 580 739 552 744 524 744 498 737 474 739 449 740 426 747 402Z";
const rocks = [
  [790, 59, 16, 12],
  [776, 147, 15, 12],
  [771, 233, 16, 12],
  [761, 466, 17, 12],
  [756, 580, 14, 13],
];
const forestFlowers = [
  [290, 390],
  [355, 485],
  [530, 430],
  [650, 290],
  [685, 410],
  [335, 230],
  [710, 265],
  [860, 400],
  [310, 420],
  [547, 445],
  [558, 438],
  [670, 280],
  [690, 425],
  [320, 233],
  [850, 410],
  [360, 492],
  [290, 220],
  [325, 460],
  [620, 370],
  [655, 250],
  [700, 480],
  [425, 550],
  [365, 545],
  [590, 400],
];
const templeFlowers = [
  [250, 330],
  [365, 510],
  [645, 485],
  [720, 330],
  [335, 270],
  [640, 270],
  [268, 344],
  [350, 520],
  [655, 500],
  [700, 315],
  [325, 278],
  [635, 282],
  [300, 450],
  [705, 440],
  [600, 535],
  [380, 535],
];
export const LivingEnvironment = memo(function LivingEnvironment({
  region,
  scale,
  ox,
  oy,
  lively,
}: {
  region: Region;
  scale: number;
  ox: number;
  oy: number;
  lively: boolean;
}) {
  const [time, setTime] = useState(0);
  useEffect(() => {
    if (!lively) return;
    let active = true,
      last = Date.now(),
      elapsed = 0;
    const sub = AppState.addEventListener("change", (s) => {
      active = s === "active";
      last = Date.now();
    });
    const timer = setInterval(() => {
      const now = Date.now();
      if (active) {
        elapsed += Math.min(0.1, (now - last) / 1000);
        setTime(elapsed);
      }
      last = now;
    }, 50);
    return () => {
      clearInterval(timer);
      sub.remove();
    };
  }, [lively]);
  const place = (x: number, y: number, size: number) => ({
    position: "absolute" as const,
    left: ox + (x - size / 2) * scale,
    top: oy + (y - size * 0.96) * scale,
    width: size * scale,
    height: size * scale,
  });
  const patches = region === "forest" ? forestFlowers : templeFlowers;
  return (
    <>
      {lively && (
        <Svg
          pointerEvents="none"
          style={StyleSheet.absoluteFill}
          width="100%"
          height="100%"
          viewBox="0 0 1000 667"
        >
          <Defs>
            <Mask
              id={"current-" + region}
              maskUnits="userSpaceOnUse"
              x="0"
              y="0"
              width="1000"
              height="667"
            >
              <Rect width="1000" height="667" fill="black" />
              {region === "forest" ? (
                <>
                  <Path d={river} fill="white" />
                  {rocks.map(([x, y, rx, ry], i) => (
                    <Ellipse
                      key={i}
                      cx={x}
                      cy={y}
                      rx={rx}
                      ry={ry}
                      fill="black"
                    />
                  ))}
                </>
              ) : (
                <Ellipse cx={893} cy={145} rx={30} ry={8} fill="white" />
              )}
            </Mask>
          </Defs>
          <G mask={"url(#current-" + region + ")"}>
            {Array.from({ length: 9 }, (_, i) => (
              <SvgImage
                key={i}
                href={water}
                x={region === "forest" ? 728 : 855}
                y={i * 96 - 96 + ((time * 13) % 96)}
                width={96}
                height={96}
                preserveAspectRatio="none"
                opacity={0.86}
              />
            ))}
            {Array.from({ length: 9 }, (_, i) => (
              <SvgImage
                key={"b" + i}
                href={water}
                x={region === "forest" ? 735 : 862}
                y={i * 96 - 96 + ((time * 8) % 96)}
                width={96}
                height={96}
                preserveAspectRatio="none"
                opacity={0.22}
              />
            ))}
          </G>
          {region === "forest" ? (
            rocks.map(([x, y], i) => (
              <Path
                key={i}
                d={`M${x - 12} ${y + 9}q12 ${4 + Math.sin(time * 3 + i)} 24 0`}
                fill="none"
                stroke="#d9fcff"
                strokeWidth={1.2}
                opacity={0.5 + 0.2 * Math.sin(time * 4 + i)}
              />
            ))
          ) : (
            <>
              {[0, 1, 2].map((i) => {
                const p = (time * 0.7 + i / 3) % 1;
                return (
                  <Ellipse
                    key={i}
                    cx={893}
                    cy={145}
                    rx={3 + p * 25}
                    ry={1 + p * 6}
                    stroke="#d9fcff"
                    strokeWidth={1}
                    fill="none"
                    opacity={(1 - p) * 0.7}
                  />
                );
              })}
              <Path
                d="M893 105Q891 120 893 139"
                stroke="#a6e6ff"
                strokeWidth={2}
              />
              {[0, 1, 2, 3].map((i) => (
                <Ellipse
                  key={i}
                  cx={893 + Math.sin(time * 3 + i)}
                  cy={108 + ((time * 35 + i * 9) % 30)}
                  rx={1}
                  ry={2}
                  fill="#edffff"
                />
              ))}
            </>
          )}
        </Svg>
      )}
      {patches.map(([x, y], i) => (
        <View key={i} style={place(x, y, 17 + (i % 4) * 2)}>
          <Flowers
            species={i % 3}
            size={(17 + (i % 4) * 2) * scale}
            time={time}
            phase={i}
          />
        </View>
      ))}
      {lively && (
        <>
          {[0, 1, 2, 3].map((i) => {
            const p = patches[i * 4],
              t = time * 0.55 + i * 2,
              x = p[0] + Math.sin(t) * 19,
              y = p[1] - 10 + Math.sin(t * 1.7) * 8;
            return (
              <View
                key={"butterfly" + i}
                style={[place(x, y, 12), { zIndex: 900 }]}
              >
                <AtlasFrame
                  source={wildlife}
                  cell={(i % 2) * 4 + (Math.floor(time * 12 + i) % 4)}
                  size={12 * scale}
                />
              </View>
            );
          })}
          {[0, 1].map((i) => {
            const t = (time + i * 13) % 29,
              flight = t < 6,
              u = t / 6,
              reverse = i === 1;
            const x = flight
                ? reverse
                  ? 920 - u * 770
                  : 90 + u * 770
                : reverse
                  ? 150
                  : 860,
              y = flight
                ? 240 + i * 140 - Math.sin(u * Math.PI) * 90
                : 240 + i * 140;
            return (
              <View key={"bird" + i} style={[place(x, y, 23), { zIndex: 950 }]}>
                <AtlasFrame
                  source={wildlife}
                  cell={
                    flight
                      ? 8 + (Math.floor(time * 10) % 4)
                      : 12 +
                        (Math.floor(t) % 8 === 0
                          ? 1
                          : Math.floor(t) % 11 === 0
                            ? 2
                            : 0)
                  }
                  size={23 * scale}
                  flip={reverse}
                />
              </View>
            );
          })}
          {[0, 1, 2, 3].map((i) => {
            // A smooth short dart followed by a long hover, localized to water.
            const t = time + i * 2.13,
              leg = Math.floor(t / 4),
              q = t % 4,
              blend = Math.min(1, q / 0.65),
              ease = blend * blend * (3 - 2 * blend);
            const sample = (n: number) => ({
              x: Math.sin(n * 2.3 + i) * 18,
              y: Math.cos(n * 1.7 + i) * 25,
            });
            const a = sample(leg),
              b = sample(leg + 1);
            const x =
                (region === "forest" ? 774 : 893) + a.x + (b.x - a.x) * ease,
              y =
                (region === "forest" ? 180 + i * 113 : 145) +
                a.y +
                (b.y - a.y) * ease +
                Math.sin(t * 3) * 0.6;
            return (
              <View
                key={"dragonfly" + i}
                style={[
                  place(x, y, 16),
                  {
                    zIndex: 980,
                    transform: [
                      {
                        rotate: `${(Math.atan2(b.x - a.x, -(b.y - a.y)) * 180) / Math.PI}deg`,
                      },
                    ],
                  },
                ]}
              >
                <AtlasFrame
                  source={dragonflies}
                  cell={(i % 2) * 8 + (Math.floor(time * 24) % 8)}
                  size={16 * scale}
                />
              </View>
            );
          })}
        </>
      )}
    </>
  );
});

import React, { memo, useEffect, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { ClipPath, Defs, Ellipse, G, Path } from "react-native-svg";
import {
  Facing,
  PetKind,
  Point,
  Region,
  WORLD,
  regions,
  resources,
} from "../game";

export const art = {
  forest: require("../../assets/world/olivewild.png"),
  temple: require("../../assets/world/temple.png"),
  atlas: require("../../assets/world/sprites.png"),
  hero: require("../../assets/world/hero-walk.png"),
  pets: require("../../assets/world/pet-walk.png"),
};
export type SpriteName =
  | "thyme"
  | "olives"
  | "grass"
  | "poppy"
  | "oliveTree"
  | "pineTree"
  | "bush"
  | "fern"
  | "column"
  | "amphora"
  | "rock"
  | "sign"
  | "log"
  | "daisy"
  | "basket"
  | "stone";
const cells: Record<SpriteName, number> = {
  thyme: 0,
  olives: 1,
  grass: 2,
  poppy: 3,
  oliveTree: 4,
  pineTree: 5,
  bush: 6,
  fern: 7,
  column: 8,
  amphora: 9,
  rock: 10,
  sign: 11,
  log: 12,
  daisy: 13,
  basket: 14,
  stone: 15,
};
const rows: Record<Facing, number> = { front: 0, back: 1, left: 2, right: 3 };

export const AtlasFrame = memo(function AtlasFrame({
  source,
  cell,
  size,
  flip = false,
}: {
  source: ImageSourcePropType;
  cell: number;
  size: number;
  flip?: boolean;
}) {
  return (
    <View
      pointerEvents="none"
      style={{
        width: size,
        height: size,
        overflow: "hidden",
        transform: [{ scaleX: flip ? -1 : 1 }],
      }}
    >
      <Image
        source={source}
        resizeMode="stretch"
        fadeDuration={0}
        style={{
          position: "absolute",
          width: size * 4,
          height: size * 4,
          left: -(cell % 4) * size,
          top: -Math.floor(cell / 4) * size,
        }}
      />
    </View>
  );
});
export function Sprite({
  name,
  size = 60,
  flip = false,
}: {
  name: SpriteName;
  size?: number;
  flip?: boolean;
}) {
  return (
    <AtlasFrame source={art.atlas} cell={cells[name]} size={size} flip={flip} />
  );
}
export function Hero({
  facing = "front",
  size = 80,
  frame = 1,
}: {
  facing?: Facing;
  size?: number;
  frame?: number;
}) {
  return (
    <AtlasFrame
      source={art.hero}
      cell={rows[facing] * 4 + (frame % 4)}
      size={size}
    />
  );
}
export function Pet({
  kind = "Dog",
  size = 44,
  frame = 1,
  flip = false,
}: {
  kind?: PetKind;
  size?: number;
  frame?: number;
  flip?: boolean;
}) {
  const [hoverFrame, setHoverFrame] = useState(0);
  useEffect(() => {
    if (kind !== "Owl") return;
    const timer = setInterval(() => setHoverFrame((v) => (v + 1) % 4), 150);
    return () => clearInterval(timer);
  }, [kind]);
  return (
    <AtlasFrame
      source={art.pets}
      cell={
        (["Dog", "Cat", "Fox", "Owl"] as PetKind[]).indexOf(kind) * 4 +
        (kind === "Owl" ? hoverFrame : frame % 4)
      }
      size={size}
      flip={flip}
    />
  );
}
export function PetPortrait({ kind }: { kind: PetKind }) {
  return <Pet kind={kind} size={64} />;
}
export function Tree({
  variant = 0,
  size = 130,
}: {
  variant?: number;
  size?: number;
}) {
  return <Sprite name={variant ? "pineTree" : "oliveTree"} size={size} />;
}
export function Column({ size = 70 }: { size?: number }) {
  return <Sprite name="column" size={size} />;
}
export function Resource({
  region,
  size = 25,
}: {
  region: Region;
  size?: number;
}) {
  return <Sprite name={region === "forest" ? "thyme" : "olives"} size={size} />;
}

const Wind = memo(function Wind({
  children,
  strength = 2,
  phase = 0,
}: {
  children: React.ReactNode;
  strength?: number;
  phase?: number;
}) {
  const [wind] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(wind, {
          toValue: 1,
          duration: 1800 + phase * 90,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(wind, {
          toValue: -1,
          duration: 2400 + phase * 70,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [wind, phase]);
  return (
    <Animated.View
      style={{
        transformOrigin: "50% 95%",
        transform: [
          {
            rotate: wind.interpolate({
              inputRange: [-1, 1],
              outputRange: [-strength + "deg", strength + "deg"],
            }),
          },
          {
            translateX: wind.interpolate({
              inputRange: [-1, 1],
              outputRange: [-0.4, 0.4],
            }),
          },
        ],
      }}
    >
      {children}
    </Animated.View>
  );
});

const Water = memo(function Water({ region }: { region: Region }) {
  const [time, setTime] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => setTime((Date.now() - start) / 1000), 50);
    return () => clearInterval(id);
  }, []);
  return (
    <Svg
      pointerEvents="none"
      width="100%"
      height="100%"
      viewBox="0 0 1000 667"
      style={StyleSheet.absoluteFill}
    >
      <Defs>
        <ClipPath id="water-mask">
          <Path d="M768 0H801L797 80 782 125 794 175 790 215 786 289H750L752 230 761 175 750 125 758 70Z M750 367H790L793 430 782 490 788 550 790 667H746L750 590 745 520 757 440Z" />
        </ClipPath>
      </Defs>
      {region === "forest" ? (
        <G clipPath="url(#water-mask)">
          {Array.from({ length: 28 }, (_, i) => {
            const y = ((i * 29 + time * 24) % 710) - 20,
              x = 755 + ((i * 19) % 29),
              opacity = 0.16 + 0.2 * (0.5 + 0.5 * Math.sin(time * 2 + i));
            return (
              <Path
                key={i}
                d={"M" + x + " " + y + "q5 -2 10 0t10 0"}
                stroke={i % 3 ? "#c4f3ff" : "#237cbe"}
                strokeWidth={i % 3 ? 1.4 : 2.3}
                opacity={opacity}
                fill="none"
              />
            );
          })}
        </G>
      ) : (
        <G>
          {[0, 1, 2].map((i) => {
            const p = (time * 0.6 + i / 3) % 1;
            return (
              <Ellipse
                key={i}
                cx={893}
                cy={145}
                rx={8 + p * 25}
                ry={2 + p * 7}
                fill="none"
                stroke="#cbf7ff"
                strokeWidth={1.1}
                opacity={(1 - p) * 0.65}
              />
            );
          })}
          <Path
            d="M893 105Q890 120 893 139"
            stroke="#d4faff"
            strokeWidth={2}
            opacity={0.6 + 0.15 * Math.sin(time * 8)}
          />
        </G>
      )}
      {Array.from({ length: 8 }, (_, i) => {
        const x = (i * 139 + time * (5 + (i % 3))) % 1000,
          y = 160 + ((i * 67 + Math.sin(time * 0.6 + i) * 15) % 420);
        return (
          <G key={i} opacity={0.25 + 0.15 * Math.sin(time + i)}>
            <Path
              d={"M" + x + " " + y + "l3 -2 -1 4Z"}
              fill={i % 2 ? "#f2e8a5" : "#a3c35d"}
            />
          </G>
        );
      })}
    </Svg>
  );
});

type SceneProps = {
  region: Region;
  scale: number;
  ox: number;
  oy: number;
  lively: boolean;
};
const Scenery = memo(function Scenery({
  region,
  scale,
  ox,
  oy,
  lively,
}: SceneProps) {
  const patches =
    region === "forest"
      ? [
          [290, 390],
          [355, 485],
          [530, 430],
          [650, 290],
          [685, 410],
          [335, 230],
          [710, 265],
          [860, 400],
        ]
      : [
          [250, 330],
          [365, 510],
          [645, 485],
          [720, 330],
          [335, 270],
          [640, 270],
        ];
  return (
    <>
      <Image
        source={art[region]}
        style={[StyleSheet.absoluteFill, { width: "100%", height: "100%" }]}
        resizeMode="cover"
        fadeDuration={0}
      />
      {lively && <Water region={region} />}
      {patches.map(([x, y], i) => (
        <View
          key={i}
          style={{
            position: "absolute",
            left: ox + (x - 14) * scale,
            top: oy + (y - 25) * scale,
          }}
        >
          {lively ? (
            <Wind phase={i} strength={3}>
              <Sprite name={i % 3 ? "grass" : "fern"} size={28 * scale} />
            </Wind>
          ) : (
            <Sprite name="grass" size={28 * scale} />
          )}
        </View>
      ))}
      {[
        { x: 180, y: 475, name: "bush" as SpriteName, size: 52 },
        { x: 675, y: 515, name: "bush" as SpriteName, size: 48 },
      ].map((p, i) => (
        <View
          key={"b" + i}
          style={{
            position: "absolute",
            left: ox + (p.x - p.size / 2) * scale,
            top: oy + (p.y - p.size * 0.92) * scale,
          }}
        >
          {lively ? (
            <Wind phase={i + 2} strength={1.2}>
              <Sprite name={p.name} size={p.size * scale} />
            </Wind>
          ) : (
            <Sprite name={p.name} size={p.size * scale} />
          )}
        </View>
      ))}
    </>
  );
});

export type WorldProps = {
  region?: Region;
  hero?: Point;
  pet?: PetKind;
  facing?: Facing;
  gathered?: string[];
  color?: string;
  heroFrame?: number;
  petFrame?: number;
  petPosition?: Point;
  petLeft?: boolean;
  lively?: boolean;
};
export function World({
  region = "forest",
  hero,
  pet = "Dog",
  facing = "front",
  gathered = [],
  heroFrame = 1,
  petFrame = 1,
  petPosition,
  petLeft = false,
  lively = true,
}: WorldProps) {
  const [layout, setLayout] = useState({ w: 1000, h: 667 });
  const scale = Math.max(layout.w / WORLD.width, layout.h / WORLD.height),
    ox = (layout.w - WORLD.width * scale) / 2,
    oy = (layout.h - WORLD.height * scale) / 2;
  const anchor = (p: Point, size: number, baseline = 0.88) => ({
    position: "absolute" as const,
    left: ox + (p.x - size / 2) * scale,
    top: oy + (p.y - size * baseline) * scale,
    width: size * scale,
    height: size * scale,
  });
  const gate = regions[region].gate,
    companion = petPosition || {
      x: (hero?.x || 0) - 28,
      y: (hero?.y || 0) + 12,
    };
  const renderPet = () =>
    hero && (
      <View key="pet" style={anchor(companion, 42, 0.83)}>
        <View
          style={{
            position: "absolute",
            bottom: 5 * scale,
            left: 9 * scale,
            width: 25 * scale,
            height: 6 * scale,
            borderRadius: 20,
            backgroundColor: "#21312260",
          }}
        />
        <Pet kind={pet} size={42 * scale} frame={petFrame} flip={petLeft} />
      </View>
    );
  return (
    <View
      pointerEvents="none"
      style={styles.world}
      onLayout={(e) =>
        setLayout({
          w: e.nativeEvent.layout.width,
          h: e.nativeEvent.layout.height,
        })
      }
    >
      <Scenery region={region} scale={scale} ox={ox} oy={oy} lively={lively} />
      {resources[region].map(
        (p, i) =>
          !gathered.includes(region + "-" + i) && (
            <View key={i} style={anchor(p, 26, 0.79)}>
              {lively ? (
                <Wind phase={i} strength={2.6}>
                  <Resource region={region} size={26 * scale} />
                </Wind>
              ) : (
                <Resource region={region} size={26 * scale} />
              )}
              <Text
                style={[styles.spark, { fontSize: 9 * scale, top: -2 * scale }]}
              >
                ✦
              </Text>
            </View>
          ),
      )}
      <View style={anchor(gate, 43, 0.84)}>
        <Sprite name="sign" size={43 * scale} flip={region === "temple"} />
      </View>
      {hero && companion.y < hero.y && renderPet()}
      {hero && (
        <>
          <View
            style={{
              position: "absolute",
              left: ox + (hero.x - 13) * scale,
              top: oy + (hero.y - 5) * scale,
              width: 26 * scale,
              height: 9 * scale,
              borderRadius: 30,
              backgroundColor: "#24311988",
              borderWidth: 1,
              borderColor: "#ffedb46b",
            }}
          />
          <View style={anchor(hero, 76, 0.88)}>
            <Hero facing={facing} size={76 * scale} frame={heroFrame} />
          </View>
        </>
      )}
      {hero && companion.y >= hero.y && renderPet()}
    </View>
  );
}
const styles = StyleSheet.create({
  world: { flex: 1, overflow: "hidden", backgroundColor: "#56883e" },
  spark: {
    position: "absolute",
    alignSelf: "center",
    color: "#fff3b6",
    textShadowColor: "#68461c",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

import React, { memo, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { AtlasFrame } from "./AtlasFrame";
import { Npc, npcFacing, npcBaseline, NpcKind } from "./Npc";
import { Hero, heroBaseline, recoveryBaseline, RecoveryPose } from "./Hero";
import { Appearance, defaultAppearance } from "../appearance";
import { ItemIcon } from "./ItemIcon";
import { GardenPlots } from "./Garden";
import type { Garden } from "../garden";
import { homeLocations } from "../worldLayout";
import { pickupsFor } from "../inventory";
import { TerrainForeground } from "./TerrainForeground";
import anchors from "../sprite-anchors.json";
import { LivingEnvironment, Flowers } from "./LivingEnvironment";
import {
  Facing,
  PetKind,
  Point,
  Region,
  dimensions,
  regions,
  resources,
} from "../game";

export const art = {
  cabin: require("../../assets/world/cabin-interior.png"),
  forest: require("../../assets/world/olivewild-v2.png"),
  temple: require("../../assets/world/sanctuary-v5.png"),
  atlas: require("../../assets/world/sprites.png"),
  olive: require("../../assets/world/olive-tree-v2.png"),
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
const petArt = {
  Dog: require("../../assets/world/pets/small-dog.png"),
  "Small dog": require("../../assets/world/pets/small-dog.png"),
  Boxer: require("../../assets/world/pets/boxer.png"),
  Cat: require("../../assets/world/pets/cat.png"),
  Fox: require("../../assets/world/pets/fox.png"),
  Owl: require("../../assets/world/pets/owl-v2.png"),
};
const petKeys = {
  Dog: "pets/small-dog",
  "Small dog": "pets/small-dog",
  Boxer: "pets/boxer",
  Cat: "pets/cat",
  Fox: "pets/fox",
  Owl: "pets/owl",
} as const;
function petCell(facing: Facing, frame: number, moving: boolean, pose: number) {
  return moving
    ? (facing === "front" ? 0 : facing === "back" ? 4 : 8) + (frame % 4)
    : 12 + pose;
}
export function Pet({
  kind = "Dog",
  size = 44,
  frame = 0,
  flip = false,
  facing = "right",
  moving = false,
  pose = 0,
}: {
  kind?: PetKind;
  size?: number;
  frame?: number;
  flip?: boolean;
  facing?: Facing;
  moving?: boolean;
  pose?: number;
}) {
  return (
    <AtlasFrame
      source={petArt[kind]}
      cell={petCell(facing, frame, moving, pose)}
      size={size}
      flip={facing === "left" || (!moving && flip)}
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
  return region === "forest" ? (
    <Flowers species={3} size={size} time={0} phase={0} />
  ) : (
    <Image source={art.olive} style={{ width: size, height: size }} />
  );
}

// Pickups and harvest markers change on collection, not on every walking frame.
// A fragment preserves their world-level depth sorting with actors.
const emptyIds: string[] = [];
const WorldPickups = memo(function WorldPickups({
  region, seed, pickedDrops, gathered, scale, ox, oy,
}: {
  region: Region; seed: number; pickedDrops: string[]; gathered: string[];
  scale: number; ox: number; oy: number;
}) {
  const anchor = (p: Point, size: number, baseline: number) => ({
    position: 'absolute' as const,
    left: ox + (p.x - size / 2) * scale,
    top: oy + (p.y - size * baseline) * scale,
    width: size * scale, height: size * scale,
  });
  return <>
      {pickupsFor(seed, region)
        .filter((d) => !pickedDrops.includes(d.id))
        .map((d) => (
          <View
            key={d.id}
            style={[anchor(d, 26, 0.85), { zIndex: Math.round(d.y) }]}
          >
            <ItemIcon id={d.kind} size={26 * scale} />
          </View>
        ))}
      {resources[region].map((p, i) => {
        const harvested = gathered.includes(region + "-" + i);
        if (region === "forest" && harvested) return null;
        const size = region === "forest" ? 22 : 100;
        return (
          <View
            key={i}
            style={[
              anchor(p, size, region === "forest" ? 0.96 : 0.96),
              { zIndex: Math.round(p.y) },
            ]}
          >
            {region === "forest" && (
              <Resource region={region} size={size * scale} />
            )}
            {!harvested && (
              <Text
                style={[styles.spark, { fontSize: 9 * scale, top: -2 * scale }]}
              >
                ✦
              </Text>
            )}
            {harvested && (
              <View style={{ position: "absolute", bottom: 0, right: 0 }}>
                <Sprite name="basket" size={18 * scale} />
              </View>
            )}
          </View>
        );
      })}
  </>;
});

export type WorldProps = {
  garden?: Garden;
  recovery?: RecoveryPose;
  region?: Region;
  hero?: Point;
  pet?: PetKind;
  showFamiliar?: boolean;
  restoredAltar?: boolean;
  facing?: Facing;
  gathered?: string[];
  color?: string;
  heroFrame?: number;
  petFrame?: number;
  petPosition?: Point;
  petLeft?: boolean;
  petFacing?: Facing;
  petMoving?: boolean;
  petPose?: number;
  lively?: boolean;
  paused?: boolean;
  appearance?: Appearance;
  seed?: number;
  pickedDrops?: string[];
};
export function World({
  garden,
  recovery,
  region = "forest",
  hero,
  pet = "Dog",
  showFamiliar = true,
  restoredAltar = false,
  facing = "front",
  gathered = emptyIds,
  heroFrame = 0,
  petFrame = 1,
  petPosition,
  petLeft = false,
  petFacing = "right",
  petMoving = false,
  petPose = 0,
  lively = true,
  paused = false,
  appearance = defaultAppearance,
  seed = 12345,
  pickedDrops = emptyIds,
}: WorldProps) {
  const [layout, setLayout] = useState({ w: 1000, h: 667 });
  const WORLD = dimensions(region);
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
  const petSize = pet === "Boxer" ? 43 : pet === "Owl" ? 33 : 32;
  const petAnchor =
    anchors[petKeys[pet]][petCell(petFacing, petFrame, petMoving, petPose)];
  const heroAnchor = {
    y: recovery
      ? recoveryBaseline(appearance, recovery)
      : heroBaseline(appearance, facing, heroFrame),
  };
  const renderPet = () =>
    hero &&
    showFamiliar && (
      <View
        key="pet"
        style={[
          anchor(companion, petSize, petAnchor.y),
          { zIndex: Math.round(companion.y) },
        ]}
      >
        <View
          style={{
            position: "absolute",
            top: petSize * petAnchor.y * scale - 2 * scale,
            left: petSize * 0.23 * scale,
            width: petSize * 0.54 * scale,
            height: 3 * scale,
            borderRadius: 20,
            backgroundColor: "#172b2966",
          }}
        />
        <View
          style={{
            transform: [
              { translateY: pet === "Owl" && petMoving ? -6 * scale : 0 },
            ],
          }}
        >
          <Pet
            kind={pet}
            size={petSize * scale}
            frame={petFrame}
            flip={petLeft}
            facing={petFacing}
            moving={petMoving}
            pose={petPose}
          />
        </View>
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
      <Image
        source={art[region]}
        style={[StyleSheet.absoluteFill, { width: "100%", height: "100%" }]}
        resizeMode="cover"
        fadeDuration={0}
      />
        <LivingEnvironment
          region={region}
          scale={scale}
          ox={ox}
          oy={oy}
          lively={lively}
          paused={paused}
        />
      {region === "temple" && (
        <GardenPlots garden={garden} scale={scale} ox={ox} oy={oy} />
      )}
      <WorldPickups region={region} seed={seed} pickedDrops={pickedDrops}
        gathered={gathered} scale={scale} ox={ox} oy={oy} />
      {region !== "cabin" && <TerrainForeground region={region} scale={scale} ox={ox} oy={oy} />}
      {region !== "cabin" && (
        <View style={anchor(gate, 43, 0.84)}>
          <Sprite name="sign" size={43 * scale} flip={region === "temple"} />
        </View>
      )}
      {region === "temple" &&
        (["priest", "keeper"] as NpcKind[]).map((kind) => {
          const position =
            kind === "priest" ? homeLocations.priest : homeLocations.provisions;
          const direction = npcFacing(position, hero);
          return (
            <View
              key={kind}
              style={[
                anchor(position, 76, npcBaseline(kind, direction)),
                { zIndex: Math.round(position.y) },
              ]}
            >
              <Npc kind={kind} facing={direction} size={76 * scale} />
            </View>
          );
        })}
      {region === "temple" && (
        <View
          style={[
            anchor(homeLocations.altar, 100, 0.81),
            { zIndex: Math.round(homeLocations.altar.y) },
          ]}
        >
          <AtlasFrame
            source={require("../../assets/world/altar-states.png")}
            cell={restoredAltar ? 1 : 0}
            columns={2}
            rows={1}
            size={100 * scale}
          />
        </View>
      )}
      {hero && companion.y < hero.y && renderPet()}
      {hero && (
        <>
          <View
            style={{
              position: "absolute",
              left: ox + (hero.x - 8) * scale,
              top: oy + (hero.y - 2) * scale,
              width: 16 * scale,
              height: 3 * scale,
              borderRadius: 30,
              backgroundColor: "#172b2980",
              zIndex: Math.round(hero.y),
            }}
          />
          <View
            style={[
              anchor(hero, 76, heroAnchor.y),
              { zIndex: Math.round(hero.y) },
            ]}
          >
            <Hero
              recovery={recovery}
              facing={facing}
              size={76 * scale}
              frame={heroFrame}
              appearance={appearance}
            />
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

export { Hero } from "./Hero";

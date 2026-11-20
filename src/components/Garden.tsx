import React, { useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from "react-native";
import { gardenPlots, emptyPlot, cropDays } from "../garden";
import type { Garden as GardenState } from "../garden";
import { tendGarden, items, count } from "../progression";
import type { Progression, GardenAction } from "../progression";
import { AtlasFrame } from "./AtlasFrame";
import { ItemIcon } from "./ItemIcon";
import { GamePanel, GameText as Text, GameButton, ui } from "./GameUI";
import anchors from "../crop-anchors.json";

export function GardenPlots({
  garden = {},
  scale,
  ox,
  oy,
}: {
  garden?: GardenState;
  scale: number;
  ox: number;
  oy: number;
}) {
  return (
    <>
      {gardenPlots.map((p) => {
        const plot = garden[p.id] ?? emptyPlot;
        const stage = plot.crop
          ? plot.age >= cropDays[plot.crop]
            ? 3
            : Math.min(2, plot.age)
          : 0;
        const cell = (plot.crop === "onion" ? 4 : 0) + stage;
        return (
          <React.Fragment key={p.id}>
            <View
              style={{
                position: "absolute",
                left: ox + (p.x - 24) * scale,
                top: oy + (p.y - 24) * scale,
                width: 48 * scale,
                height: 48 * scale,
              }}
            >
              {plot.tilled ? (
                <AtlasFrame
                  source={require("../../assets/world/garden-soil.png")}
                  columns={2}
                  rows={1}
                  cell={plot.watered ? 1 : 0}
                  size={48 * scale}
                />
              ) : (
                [
                  [3, 3],
                  [41, 3],
                  [3, 39],
                  [41, 39],
                ].map(([x, y], i) => (
                  <View
                    key={i}
                    style={{
                      position: "absolute",
                      left: x * scale,
                      top: y * scale,
                      width: 3 * scale,
                      height: 7 * scale,
                      backgroundColor: "#aa743c",
                      borderColor: "#614522",
                      borderWidth: scale,
                    }}
                  />
                ))
              )}
            </View>
            {plot.crop && (
              <View
                style={{
                  position: "absolute",
                  left: ox + (p.x - 22) * scale,
                  top: oy + (p.y - 44 * anchors[cell]) * scale,
                  zIndex: Math.round(p.y),
                }}
              >
                <AtlasFrame
                  source={require("../../assets/world/crops.png")}
                  columns={4}
                  rows={2}
                  cell={cell}
                  size={44 * scale}
                />
              </View>
            )}
          </React.Fragment>
        );
      })}
    </>
  );
}

export function GardenPanel({
  id,
  progress,
  onAction,
  onClose,
}: {
  id: string;
  progress: Progression;
  onAction: (action: GardenAction) => void;
  onClose: () => void;
}) {
  const { height } = useWindowDimensions();
  const plot = progress.garden?.[id] ?? emptyPlot;
  const mature = !!plot.crop && plot.age >= cropDays[plot.crop];
  useEffect(() => {
    if (Platform.OS !== "web") return;
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [onClose]);
  const action = (kind: GardenAction, label: string) => (
    <GameButton
      key={kind}
      disabled={tendGarden(progress, id, kind) === progress}
      onPress={() => onAction(kind)}
    >
      {label}
    </GameButton>
  );
  return (
    <View style={s.overlay}>
      <GamePanel style={{ width: "96%", maxWidth: 650 }}>
        <ScrollView
          style={{ maxHeight: height * 0.65 }}
          contentContainerStyle={{ gap: 12 }}
        >
          <Text style={ui.title}>
            {plot.crop ? items[plot.crop].name : "Garden plot"} ·{" "}
            {Number(id.split("-")[1]) + 1}
          </Text>
          <Text>
            Energy {progress.energy}/100 · Jug {progress.water ?? 0}/6
          </Text>
          {!plot.tilled ? (
            <>
              <Text>
                Prepare this soil with a hoe. Tools and seeds are also sold at
                Thaleia’s camp.
              </Text>
              {action("till", "Till soil · 4 energy")}
            </>
          ) : !plot.crop ? (
            <>
              <Text>
                {plot.watered
                  ? "The soil is watered and ready for seed."
                  : "Choose a seed, then water the soil before sleeping."}
              </Text>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <ItemIcon id="barleySeed" />
                <Text style={{flex:1}}>
                  Barley · 3 watered nights ·{" "}
                  {count(progress.bag, "barleySeed")} seeds
                </Text>
              </View>
              {action("barley", "Plant barley")}
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <ItemIcon id="onionSeed" />
                <Text style={{flex:1}}>
                  Onion · 4 watered nights · {count(progress.bag, "onionSeed")}{" "}
                  seeds
                </Text>
              </View>
              {action("onion", "Plant onion")}
            </>
          ) : (
            <>
              <ItemIcon id={plot.crop} size={60} />
              <Text>
                {mature
                  ? "Ready to harvest. Make room in your satchel first."
                  : `${plot.age}/${cropDays[plot.crop]} watered nights. ${plot.watered ? "Watered today; it will grow when you sleep." : "Needs water before the next night."}`}
              </Text>
              {mature && action("harvest", "Harvest crop")}
            </>
          )}
          {plot.tilled &&
            !mature &&
            action(
              "water",
              plot.watered ? "Watered today" : "Water soil · 2 energy",
            )}
          {(progress.water ?? 0) === 0 && (
            <Text>Refill your watering jug at the well east of the altar.</Text>
          )}
          <GameButton onPress={onClose}>Back to the garden</GameButton>
        </ScrollView>
      </GamePanel>
    </View>
  );
}
const s = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 75,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 18,
    backgroundColor: "#15231a33",
  },
});

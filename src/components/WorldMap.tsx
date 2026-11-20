import React, { useState } from "react";
import { View, Image } from "react-native";
import { GameButton, GameText as Text, ui } from "./GameUI";
import type { Save, Region } from "../game";
import { dimensions, regions } from "../game";
import { homeLocations, cabinLocations } from "../worldLayout";
import { gardenPlots } from "../garden";

const maps = {
  temple: require("../../assets/world/sanctuary-v4.png"),
  forest: require("../../assets/world/olivewild-v2.png"),
  cabin: require("../../assets/world/cabin-interior.png"),
};
const destinations = {
  temple: [
    ["1", "High Priest", homeLocations.priest],
    ["2", "Your cabin", homeLocations.cabin],
    ["3", "Storage", homeLocations.chest],
    ["4", "Workbench", homeLocations.workbench],
    ["5", "Provisions", homeLocations.provisions],
    ["6", "Fishing dock", homeLocations.lake],
    ["7", "Garden", gardenPlots[1]],
    ["8", "Well", homeLocations.well],
  ],
  cabin: [
    ["1", "Bed", cabinLocations.bed],
    ["2", "Storage", cabinLocations.chest],
    ["3", "Wardrobe", cabinLocations.wardrobe],
  ],
  forest: [["1", "Sanctuary path", regions.forest.gate]],
} satisfies Record<Region, [string, string, { x: number; y: number }][]>;

/** Read-only illustrated navigation. Traveling still requires walking to an exit. */
export function WorldMap({ save }: { save: Save }) {
  const [region, setRegion] = useState<Region>(save.region);
  const size = dimensions(region);
  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
        {(["temple", "forest", "cabin"] as Region[]).map((r) => (
          <GameButton
            key={r}
            selected={r === region}
            onPress={() => setRegion(r)}
          >
            {r === "temple"
              ? "Sanctuary"
              : r === "forest"
                ? "Olivewild"
                : "Cabin"}
          </GameButton>
        ))}
      </View>
      <Text style={ui.title}>{regions[region].name}</Text>
      <View
        style={{
          width: "100%",
          aspectRatio: size.width / size.height,
          borderWidth: 3,
          borderColor: "#694529",
          overflow: "hidden",
        }}
      >
        <Image
          source={maps[region]}
          style={{ width: "100%", height: "100%" }}
          resizeMode="stretch"
        />
        {destinations[region].map(([number, label, p]) => (
          <View
            key={number}
            accessibilityLabel={label}
            style={{
              position: "absolute",
              left: `${(p.x / size.width) * 100}%`,
              top: `${(p.y / size.height) * 100}%`,
              transform: [{ translateX: -11 }, { translateY: -11 }],
              width: 23,
              height: 23,
              backgroundColor: "#ffe1a0",
              borderWidth: 2,
              borderColor: "#663923",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 17, lineHeight: 18 }}>{number}</Text>
          </View>
        ))}
        {region === save.region && (
          <View
            accessibilityLabel="Your location"
            style={{
              position: "absolute",
              left: `${(save.position.x / size.width) * 100}%`,
              top: `${(save.position.y / size.height) * 100}%`,
              width: 12,
              height: 12,
              transform: [{ translateX: -6 }, { translateY: -6 }],
              borderRadius: 6,
              borderWidth: 2,
              borderColor: "#fff3b9",
              backgroundColor: "#b53933",
            }}
          />
        )}
      </View>
      <Text>● Red marker: you are here</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        {destinations[region].map(([n, label]) => (
          <Text key={n}>
            {n} · {label}
          </Text>
        ))}
      </View>
      <Text>
        {region === "cabin"
          ? "The south doorway leads back to the sanctuary."
          : region === "temple"
            ? "The west path leads to the Olivewild. Walk into the cabin doorway to enter your home."
            : "Cross the eastern bridge and follow the path to the sanctuary. The western loop winds past an old stone shrine."}
      </Text>
    </View>
  );
}

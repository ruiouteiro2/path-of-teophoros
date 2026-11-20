import React from "react";
import { GameText as Text } from "./GameUI";
import { View, Pressable, StyleSheet } from "react-native";
import { Appearance, hairColors, clothColors } from "../appearance";
export function AppearancePicker({
  value,
  onChange,
}: {
  value: Appearance;
  onChange: (a: Appearance) => void;
}) {
  return (
    <View style={{ gap: 10, marginVertical: 14 }}>
      <Text style={s.label}>HAIR STYLE</Text>
      <View style={s.row}>
        {(["short", "tied"] as const).map((v) => (
          <Pressable
            key={v}
            accessibilityRole="button"
            accessibilityLabel={"Hair style " + v}
            accessibilityState={{ selected: value.hairStyle === v }}
            onPress={() => onChange({ ...value, hairStyle: v })}
            style={[s.choice, value.hairStyle === v && s.selected]}
          >
            <Text style={s.text}>
              {v === "short" ? "Wavy crop" : "Tied back"}
            </Text>
          </Pressable>
        ))}
      </View>
      <Text style={s.label}>HAIR COLOR</Text>
      <View style={s.row}>
        {(Object.keys(hairColors) as Appearance["hairColor"][]).map((v) => (
          <Pressable
            key={v}
            accessibilityRole="button"
            accessibilityLabel={"Hair color " + v}
            accessibilityState={{ selected: value.hairColor === v }}
            onPress={() => onChange({ ...value, hairColor: v })}
            style={[
              s.swatch,
              { backgroundColor: hairColors[v] },
              value.hairColor === v && s.selected,
            ]}
          >
            <Text style={{ color: v === "black" ? "white" : "#382716" }}>
              {value.hairColor === v ? "✓" : ""}
            </Text>
          </Pressable>
        ))}
      </View>
      <Text style={s.label}>CLOTHES</Text>
      <View style={s.row}>
        {(["chiton", "cloak"] as const).map((v) => (
          <Pressable
            key={v}
            accessibilityRole="button"
            accessibilityLabel={"Clothes " + v}
            accessibilityState={{ selected: value.outfit === v }}
            onPress={() => onChange({ ...value, outfit: v })}
            style={[s.choice, value.outfit === v && s.selected]}
          >
            <Text style={s.text}>
              {v === "chiton" ? "Linen chiton" : "Traveler’s cloak"}
            </Text>
          </Pressable>
        ))}
      </View>
      <View style={s.row}>
        {(Object.keys(clothColors) as Appearance["clothColor"][]).map((v) => (
          <Pressable
            key={v}
            accessibilityRole="button"
            accessibilityLabel={"Clothing color " + v}
            accessibilityState={{ selected: value.clothColor === v }}
            onPress={() => onChange({ ...value, clothColor: v })}
            style={[
              s.swatch,
              { backgroundColor: clothColors[v] },
              value.clothColor === v && s.selected,
            ]}
          >
            <Text style={{ color: "white" }}>
              {value.clothColor === v ? "✓" : ""}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  label: { fontSize: 11, fontWeight: "700", color: "#633e21" },
  choice: {
    padding: 10,
    backgroundColor: "#e9bd72",
    borderWidth: 2,
    borderColor: "#b37539",
  },
  selected: { borderColor: "#4d2b13", borderWidth: 3 },
  swatch: {
    width: 40,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#b37539",
  },
  text: { fontSize: 12, color: "#4d2b13", fontWeight: "600" },
});

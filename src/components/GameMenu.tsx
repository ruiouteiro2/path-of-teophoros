import React, { useState } from "react";
import {
  View,
  ScrollView,
  Pressable,
  TextInput,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { GamePanel, GameText as Text, GameButton, ui, palette } from "./GameUI";
import { ItemIcon } from "./ItemIcon";
import { Hero, PetPortrait } from "./WorldAssets";
import { AppearancePicker } from "./AppearancePicker";
import { WorldMap } from "./WorldMap";
import { Npc } from "./Npc";
import { defaultAppearance } from "../appearance";
import { cropDays } from "../garden";
import type { Save } from "../game";
import type { useGameAudio } from "../hooks/useGameAudio";
import {
  items,
  itemIds,
  ItemId,
  Progression,
  count,
  consume,
  transfer,
  trade,
  craft,
  recipes,
  RecipeId,
  altarCost,
} from "../progression";
export type MenuTab =
  | "satchel"
  | "journal"
  | "map"
  | "familiar"
  | "appearance"
  | "settings"
  | "chest"
  | "trade"
  | "craft"
  | "cook";
type Props = {
  save: Save;
  initialTab?: MenuTab;
  onSave: (fn: (s: Save) => Save) => void;
  onClose: () => void;
  onTitle: () => void;
  audio: ReturnType<typeof useGameAudio>;
  onMessage: (text: string) => void;
};
export function GameMenu({
  save,
  initialTab = "satchel",
  onSave,
  onClose,
  onTitle,
  audio,
  onMessage,
}: Props) {
  const [tab, setTab] = useState<MenuTab>(initialTab),
    [selected, setSelected] = useState<ItemId>("wood"),
    [name, setName] = useState(save.petName);
  const { width, height } = useWindowDimensions();
  const narrow = width < 650;
  const p = save.progress!;
  function transaction(fn: (p: Progression) => Progression, success: string) {
    if (fn(p) === p) {
      onMessage(
        "Unable to complete that exchange. Check your supplies and stack space.",
      );
      return;
    }
    onSave((s) => {
      if (!s.progress) return s;
      const next = fn(s.progress);
      return next === s.progress ? s : { ...s, progress: next };
    });
    audio.effect(
      tab === "trade" ? "coins" : tab === "cook" ? "pickup" : "wood",
    );
    onMessage(success);
  }
  const tabs: MenuTab[] = [
    "satchel",
    "journal",
    "map",
    "familiar",
    "appearance",
    "settings",
  ];
  if (["chest", "trade", "craft", "cook"].includes(initialTab))
    tabs.unshift(initialTab);
  const stackGrid = (bag: Progression["bag"], storage = false) => (
    <View style={m.grid}>
      {itemIds.map((id) => (
        <Pressable
          key={id}
          accessibilityRole="button"
          accessibilityLabel={`${storage ? "Stored " : ""}${items[id].name}: ${count(bag, id)}`}
          accessibilityState={{ selected: selected === id }}
          onPress={() => setSelected(id)}
          style={[m.slot, selected === id && m.selected]}
        >
          <ItemIcon id={id} size={narrow ? 42 : 52} />
          <Text style={m.quantity}>{count(bag, id) || ""}</Text>
        </Pressable>
      ))}
    </View>
  );
  return (
    <View style={m.scrim}>
      <GamePanel
        style={{ width: "100%", maxWidth: 960, maxHeight: height - 24 }}
      >
        <View style={m.header}>
          <Text style={ui.title}>
            {tab === "chest"
              ? "Cabin storage"
              : tab === "trade"
                ? "Sanctuary provisions"
                : tab === "craft"
                  ? "Workbench"
                  : tab === "cook"
                    ? "Cabin hearth"
                    : save.name + "’s journey"}
          </Text>
          <GameButton onPress={onClose}>×</GameButton>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={m.tabs}>
            {tabs.map((t) => (
              <GameButton
                key={t}
                selected={t === tab}
                onPress={() => setTab(t)}
              >
                {t[0].toUpperCase() + t.slice(1)}
              </GameButton>
            ))}
          </View>
        </ScrollView>
        <ScrollView
          style={{ maxHeight: height - 210 }}
          contentContainerStyle={{ paddingBottom: 16, gap: 14 }}
        >
          <View style={m.money}>
            <ItemIcon id="money" size={34} />
            <Text style={{ flexShrink: 1 }}>{p.money} drachmae</Text>
            <Text
              style={
                narrow
                  ? { width: "100%", flexShrink: 1 }
                  : { marginLeft: "auto", flexShrink: 1 }
              }
            >
              Day {p.day} · Energy {p.energy}/100
            </Text>
          </View>
          {tab === "map" && <WorldMap save={save} />}
          {tab === "satchel" && (
            <>
              {stackGrid(p.bag)}
              <Text style={ui.title}>{items[selected].name}</Text>
              <Text>{items[selected].description}</Text>
              <Text>
                Carrying {count(p.bag, selected)} · Value {items[selected].sell}{" "}
                drachmae each
              </Text>
              {items[selected].energy && (
                <GameButton
                  disabled={!count(p.bag, selected) || p.energy === 100}
                  onPress={() =>
                    transaction(
                      (q) => consume(q, selected),
                      "You feel your strength returning.",
                    )
                  }
                >
                  Eat / drink · +{items[selected].energy} energy
                </GameButton>
              )}
              <Text>
                Materials stay collected when you leave a map. Store supplies at
                home or trade them at the sanctuary.
              </Text>
            </>
          )}
          {tab === "journal" && (
            <>
              <Text style={ui.title}>A sanctuary worth saving</Text>
              <Text>
                {p.restoredAltar
                  ? "The old altar has been secured. The High Priest has rewarded your first work."
                  : "Bring supplies to the High Priest of Zeus beside the ruined temple. Help him secure the old altar."}
              </Text>
              {!p.restoredAltar && Object.entries(altarCost).map(([id, n]) => (
                <Text key={id}>
                  {count(p.bag, id as ItemId) >= n! ? "✓" : "○"}{" "}
                  {items[id as ItemId].name}: {count(p.bag, id as ItemId)} / {n}
                </Text>
              ))}
              <Text>{p.restoredAltar ? "✓ Reward received: 120 drachmae" : "Reward: 120 drachmae"}</Text>
              <Text style={ui.title}>Beyond the sanctuary</Text>
              <Text>
                Explore the Olivewild. Gather herbs, craft a fishing rod at the
                workbench, and fish at the home lake. The sanctuary is your
                place to recover.
              </Text>
              <Text>
                Lands explored:{" "}
                {save.visited.filter((r) => r !== "cabin").length} / 2 · Fish
                caught: {p.caught}
              </Text>
              <Text style={ui.title}>Your hearth</Text>
              <Text>
                Cook at the fireplace inside your cabin. One harvested barley
                makes bread; two wild thyme make an infusion. Carry ingredients
                in your satchel, then eat or drink there to recover energy.
              </Text>
              <Text style={ui.title}>The western garden</Text>
              <Text>
                Till the six marked plots in the western grove, plant barley or
                onion seed, and water before sleeping. Refill your jug at the
                well. Dry crops wait for water; they do not grow that night.
              </Text>
              <Text>
                Growing:{" "}
                {
                  Object.values(p.garden ?? {}).filter(
                    (plot) => plot?.crop && plot.age < cropDays[plot.crop],
                  ).length
                }{" "}
                · Ready:{" "}
                {
                  Object.values(p.garden ?? {}).filter(
                    (plot) => plot?.crop && plot.age >= cropDays[plot.crop],
                  ).length
                }{" "}
                · Jug {p.water ?? 0}/6
              </Text>
            </>
          )}
          {tab === "familiar" && (
            <>
              <View style={{ alignItems: "center" }}>
                <PetPortrait kind={save.pet} />
              </View>
              <Text style={ui.title}>{save.petName}</Text>
              <Text>
                Your {save.pet.toLowerCase()} Familiar, entrusted to you by the
                High Priest of Zeus.
              </Text>
              <TextInput
                accessibilityLabel="Familiar name"
                value={name}
                onChangeText={setName}
                maxLength={24}
                style={ui.input}
              />
              <GameButton
                disabled={!name.trim() || name.trim() === save.petName}
                onPress={() => onSave((s) => ({ ...s, petName: name.trim() }))}
              >
                Name your Familiar
              </GameButton>
            </>
          )}
          {tab === "appearance" && (
            <>
              <View style={{ alignItems: "center" }}>
                <Hero
                  size={140}
                  appearance={save.appearance ?? defaultAppearance}
                />
              </View>
              <AppearancePicker
                value={save.appearance ?? defaultAppearance}
                onChange={(a) => onSave((s) => ({ ...s, appearance: a }))}
              />
            </>
          )}
          {tab === "settings" && (
            <>
              <Text style={ui.title}>Sound & music</Text>
              {(["music", "ambience", "effects", "steps"] as const).map(
                (channel) => (
                  <View
                    key={channel}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                      flexWrap: "wrap",
                    }}
                  >
                    <Text style={{ minWidth: 160 }}>
                      {channel === "steps"
                        ? "Footsteps"
                        : channel[0].toUpperCase() + channel.slice(1)}{" "}
                      · {Math.round(audio.mix[channel] * 100)}%
                    </Text>
                    <GameButton
                      accessibilityLabel={`Decrease ${channel === "steps" ? "footsteps" : channel} volume`}
                      disabled={audio.mix[channel] <= 0}
                      onPress={() =>
                        audio.setVolume(channel, audio.mix[channel] - 0.1)
                      }
                    >
                      −
                    </GameButton>
                    <GameButton
                      accessibilityLabel={`Increase ${channel === "steps" ? "footsteps" : channel} volume`}
                      disabled={audio.mix[channel] >= 1}
                      onPress={() =>
                        audio.setVolume(channel, audio.mix[channel] + 0.1)
                      }
                    >
                      +
                    </GameButton>
                  </View>
                ),
              )}
              <GameButton onPress={audio.toggleMute}>
                {audio.muted ? "Sound off · Enable sound" : "Sound on · Mute"}
              </GameButton>
              <GameButton onPress={audio.toggleMusic}>
                {audio.musicOn ? "Music on · Turn off" : "Music off · Turn on"}
              </GameButton>
              <Text style={ui.title}>Controls</Text>
              <Text>
                WASD / arrows: move. E: interact. I / Escape: open or close this
                menu. Enter / Space: continue dialogue. Touch controls are
                available on screen.
              </Text>
              <Text>Your journey saves automatically on this device.</Text>
              <GameButton onPress={onTitle}>Save & return to title</GameButton>
            </>
          )}
          {tab === "chest" && (
            <>
              <Text style={ui.title}>Your satchel</Text>
              {stackGrid(p.bag)}
              <Text style={ui.title}>Cabin chest</Text>
              {stackGrid(p.chest, true)}
              <Text>
                {items[selected].name} · Carrying {count(p.bag, selected)} ·
                Stored {count(p.chest, selected)}
              </Text>
              <GameButton
                disabled={!count(p.bag, selected)}
                onPress={() =>
                  transaction(
                    (q) => transfer(q, selected, true),
                    "Stored safely in your cabin.",
                  )
                }
              >
                Store one
              </GameButton>
              <GameButton
                disabled={!count(p.chest, selected)}
                onPress={() =>
                  transaction(
                    (q) => transfer(q, selected, false),
                    "Taken from storage.",
                  )
                }
              >
                Take one
              </GameButton>
            </>
          )}
          {tab === "trade" && (
            <>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
              >
                <Npc kind="keeper" size={90} />
                <View style={{ flex: 1 }}>
                  <Text style={ui.title}>Thaleia</Text>
                  <Text>Sanctuary provision keeper</Text>
                </View>
              </View>
              <Text>
                “A little bread for the road? I also buy what you gather.
                Nothing useful should go to waste.”
              </Text>
              {stackGrid(p.bag)}
              <Text style={ui.title}>{items[selected].name}</Text>
              <Text>{items[selected].description}</Text>
              <GameButton
                disabled={!count(p.bag, selected) || !items[selected].sell}
                onPress={() =>
                  transaction(
                    (q) => trade(q, selected, false),
                    "Sold one " + items[selected].name + ".",
                  )
                }
              >
                Sell one · {items[selected].sell} drachmae
              </GameButton>
              {items[selected].buy && (
                <GameButton
                  disabled={p.money < items[selected].buy!}
                  onPress={() =>
                    transaction(
                      (q) => trade(q, selected, true),
                      "Bought " + items[selected].name + ".",
                    )
                  }
                >
                  Buy one · {items[selected].buy} drachmae
                </GameButton>
              )}
              <Text>
                Select food, a fishing rod, garden tools or seeds to buy
                supplies.
              </Text>
            </>
          )}
          {(tab === "craft" || tab === "cook") && (
            <>
              {(Object.keys(recipes) as RecipeId[])
                .filter((id) => recipes[id].station === tab)
                .map((id) => {
                  const r = recipes[id];
                  const enough = Object.entries(r.cost).every(
                    ([key, n]) => count(p.bag, key as ItemId) >= n,
                  );
                  return (
                    <View key={id} style={m.recipe}>
                      <ItemIcon id={r.result} />
                      <Text style={ui.title}>{r.name}</Text>
                      <Text>
                        {Object.entries(r.cost)
                          .map(
                            ([key, n]) =>
                              `${items[key as ItemId].name} ${count(p.bag, key as ItemId)}/${n}`,
                          )
                          .join(" · ")}
                      </Text>
                      {tab === "cook" && <Text>{items[r.result].description}</Text>}
                      <GameButton
                        disabled={!enough || count(p.bag, r.result) >= 999}
                        onPress={() =>
                          transaction(
                            (q) => craft(q, id),
                            (tab === "cook" ? "Cooked " : "Crafted ") +
                              r.name +
                              ".",
                          )
                        }
                      >
                        {tab === "cook" ? "Cook" : "Craft"}
                      </GameButton>
                    </View>
                  );
                })}
            </>
          )}
        </ScrollView>
      </GamePanel>
    </View>
  );
}
const m = StyleSheet.create({
  scrim: {
    ...StyleSheet.absoluteFill,
    zIndex: 60,
    backgroundColor: "rgba(22,25,24,.7)",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  tabs: { flexDirection: "row", gap: 5, paddingBottom: 5 },
  money: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    paddingVertical: 5,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  slot: {
    width: 64,
    height: 66,
    borderWidth: 3,
    borderColor: "#9a632f",
    backgroundColor: "#d9a156",
    alignItems: "center",
    justifyContent: "center",
  },
  selected: { borderColor: palette.blue, backgroundColor: "#ffe6a0" },
  quantity: {
    position: "absolute",
    bottom: 0,
    right: 3,
    fontSize: 18,
    color: "#382619",
  },
  recipe: {
    backgroundColor: "#f2cd89",
    borderWidth: 2,
    borderColor: "#a47135",
    padding: 12,
    gap: 8,
  },
});

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  View,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { World, Hero, PetPortrait } from "./WorldAssets";
import {
  Facing,
  Point,
  Save,
  Region,
  PetKind,
  SAVE_KEY,
  regions,
  nearest,
  validSave,
  migrateProgress,
  dimensions,
} from "../game";
import { Appearance, defaultAppearance } from "../appearance";
import { AppearancePicker } from "./AppearancePicker";
import { nearestDrop, collectDrop, exitTriggered } from "../inventory";
import { useGameAudio } from "../hooks/useGameAudio";
import { Direction, useGameMotion } from "../hooks/useGameMotion";
import { GameText as Text, gameFont, GamePanel, GameButton } from "./GameUI";
import { Dialogue } from "./Dialogue";
import { GameMenu, MenuTab } from "./GameMenu";
import {
  newProgression,
  advanceStory,
  addItem,
  landFish,
  restoreAltar,
  altarCost,
  count,
  ItemId,
  rest,
  tendGarden,
  refillJug,
} from "../progression";
import { nearestHome } from "../worldLayout";
import { Conversation } from "./Conversation";
import { Fishing } from "./Fishing";
import { GardenPanel } from "./Garden";
import { nearestPlot } from "../garden";

const serif = gameFont;
function Button({
  children,
  onPress,
  secondary = false,
  disabled = false,
}: {
  children: React.ReactNode;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.button,
        secondary && s.secondary,
        { opacity: disabled ? 0.45 : pressed ? 0.75 : 1 },
      ]}
    >
      <Text style={[s.buttonText, secondary && { color: "#405b48" }]}>
        {children}
      </Text>
    </Pressable>
  );
}
function Label({ children }: { children: React.ReactNode }) {
  return <Text style={s.label}>{children}</Text>;
}
export default function Game() {
  const { width, height } = useWindowDimensions(),
    compact = width < 850;
  const [name, setName] = useState(""),
    [petName, setPetName] = useState(""),
    [pet, setPet] = useState<PetKind>("Boxer"),
    [region] = useState<Region>("temple");
  const [appearance, setAppearance] = useState<Appearance>(defaultAppearance);
  const [menuTab, setMenuTab] = useState<MenuTab>("satchel");
  const [conversation, setConversation] = useState(false);
  const [sleepPrompt, setSleepPrompt] = useState(false);
  const [fishingSeed, setFishingSeed] = useState<number | null>(null);
  const [gardenPlot, setGardenPlot] = useState<string | null>(null);
  const travelLock = useRef(false);
  const color = "#467d81";
  const [save, setSave] = useState<Save | null>(null),
    [playing, setPlaying] = useState(false),
    [loaded, setLoaded] = useState(false),
    [journal, setJournal] = useState(false),
    [message, setMessage] = useState(""),
    [storageError, setStorageError] = useState(false),
    [replacing, setReplacing] = useState(false);
  const queue = useRef(Promise.resolve());
  const inStory = !!save?.progress && save.progress.story !== "complete";
  const [session, setSession] = useState(0),
    [traveling, setTraveling] = useState(false),
    [transition] = useState(() => new Animated.Value(0));
  const caughtFish = useCallback(
    (fish: ItemId) =>
      setSave((v) =>
        v?.progress
          ? {
              ...v,
              progress: landFish(v.progress, fish),
            }
          : v,
      ),
    [],
  );
  const checkpoint = useCallback(
    (position: Point, facing: Facing, region: Region) =>
      setSave((v) =>
        v && v.region === region ? { ...v, position, facing } : v,
      ),
    [],
  );
  const exploring =
    playing &&
    !journal &&
    !traveling &&
    !inStory &&
    !conversation &&
    !sleepPrompt &&
    fishingSeed === null &&
    gardenPlot === null;
  const motion = useGameMotion(save, exploring, session, checkpoint);
  const stop = motion.stop;
  const audio = useGameAudio(
    playing,
    save?.region ?? region,
    motion.state?.position ?? save?.position ?? regions[region].spawn,
    motion.state?.distance ?? 0,
    !!motion.state?.moving && !journal && !traveling,
  );
  const playEffect = audio.effect;
  useEffect(() => {
    AsyncStorage.getItem(SAVE_KEY)
      .then((raw) => {
        if (raw) {
          const data = JSON.parse(raw);
          if (validSave(data)) setSave(migrateProgress(data));
          else
            setMessage(
              "The old save could not be read. You can begin a new journey.",
            );
        }
      })
      .catch(() => setStorageError(true))
      .finally(() => setLoaded(true));
  }, []);
  useEffect(() => {
    if (!save || !loaded) return;
    queue.current = queue.current
      .then(() => AsyncStorage.setItem(SAVE_KEY, JSON.stringify(save)))
      .then(() => setStorageError(false))
      .catch(() => setStorageError(true));
  }, [save, loaded]);
  useEffect(() => {
    if (!message) return;
    const id = setTimeout(() => setMessage(""), 5000);
    return () => clearTimeout(id);
  }, [message]);
  const getMotion = motion.getState;
  const gather = useCallback(() => {
    if (
      !save ||
      traveling ||
      journal ||
      inStory ||
      conversation ||
      sleepPrompt ||
      fishingSeed !== null ||
      gardenPlot !== null
    )
      return;
    const m = getMotion();
    const live =
      m?.region === save.region ? { ...save, position: m.position } : save;
    const home = nearestHome(live.position, live.region);
    const plot = nearestPlot(live.position, live.region);
    if (plot) {
      stop();
      setGardenPlot(plot.id);
      return;
    }
    if (home) {
      stop();
      if (home === "well") {
        if (!save.progress || !count(save.progress.bag, "wateringJug")) {
          setMessage("Bring a watering jug. Thaleia sells one at the camp.");
          return;
        }
        setSave((v) =>
          v?.progress ? { ...v, progress: refillJug(v.progress) } : v,
        );
        setMessage("Watering jug refilled · 6/6");
        playEffect("water");
        return;
      }
      if (home === "priest" || home === "altar") {
        setConversation(true);
        return;
      }
      if (home === "bed") {
        setSleepPrompt(true);
        return;
      }
      if (home === "wardrobe") {
        setMenuTab("appearance");
        setJournal(true);
        return;
      }
      if (home === "lake") {
        if (!save.progress || !count(save.progress.bag, "rod")) {
          setMessage(
            "Craft a reed fishing rod at the workbench, or buy one at the camp.",
          );
          return;
        }
        if (save.progress.energy < 5) {
          setMessage(
            "You need 5 energy to fish. Eat some bread or rest in your cabin.",
          );
          return;
        }
        if (
          count(save.progress.bag, "carp") >= 999 ||
          count(save.progress.bag, "perch") >= 999 ||
          save.progress.caught >= 9999999
        ) {
          setMessage("Store or sell your fish before casting again.");
          return;
        }
        setSave((v) =>
          v?.progress
            ? {
                ...v,
                progress: { ...v.progress, energy: v.progress.energy - 5 },
              }
            : v,
        );
        setFishingSeed((save.seed ?? 12345) + (save.progress.caught + 1) * 17);
        return;
      }
      if (home === "chest" || home === "workbench" || home === "provisions") {
        setMenuTab(
          home === "workbench"
            ? "craft"
            : home === "provisions"
              ? "trade"
              : "chest",
        );
        setJournal(true);
        return;
      }
    }
    const drop = nearestDrop(live);
    if (drop) {
      if (live.progress && count(live.progress.bag, drop.kind) >= 999) {
        setMessage("That stack is full. Store or sell some supplies first.");
        return;
      }
      setSave((v) =>
        v && v.region === live.region
          ? collectDrop({ ...v, position: live.position }, drop.id)
          : v,
      );
      playEffect(drop.kind);
      setMessage(`+1 ${drop.kind} · added to inventory`);
      return;
    }
    const i = nearest(live);
    if (i < 0) {
      setMessage(
        "Approach wood, stone, fiber, thyme or an olive tree, then press E or Gather.",
      );
      return;
    }
    if (
      live.progress &&
      count(live.progress.bag, live.region === "forest" ? "thyme" : "olives") >=
        999
    ) {
      setMessage("That stack is full. Store or sell some supplies first.");
      return;
    }
    setSave((v) =>
      v && v.region === live.region && !v.gathered.includes(v.region + "-" + i)
        ? {
            ...v,
            position: live.position,
            gathered: [...v.gathered, v.region + "-" + i],
            inventory: v.inventory + 1,
            ...(v.progress
              ? {
                  progress: addItem(
                    v.progress,
                    v.region === "forest" ? "thyme" : "olives",
                  ),
                }
              : {}),
          }
        : v,
    );
    playEffect("pickup");
    setMessage("+1 " + regions[live.region].resource);
  }, [
    save,
    traveling,
    journal,
    inStory,
    conversation,
    sleepPrompt,
    fishingSeed,
    gardenPlot,
    getMotion,
    playEffect,
    stop,
  ]);
  useEffect(() => {
    if (Platform.OS !== "web" || !playing || journal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "e" && !e.repeat) {
        e.preventDefault();
        gather();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [playing, journal, gather]);
  useEffect(() => {
    if (
      Platform.OS !== "web" ||
      !playing ||
      inStory ||
      conversation ||
      sleepPrompt ||
      fishingSeed !== null ||
      gardenPlot !== null
    )
      return;
    const key = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (!e.repeat && (e.key === "Escape" || e.key.toLowerCase() === "i")) {
        e.preventDefault();
        stop();
        setMenuTab("satchel");
        setJournal((v) => !v);
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [
    playing,
    inStory,
    conversation,
    sleepPrompt,
    fishingSeed,
    gardenPlot,
    stop,
  ]);
  function start() {
    if (!name.trim() || !petName.trim()) return;
    setSession((v) => v + 1);
    setSave({
      name: name.trim(),
      petName: petName.trim(),
      pet,
      color,
      region: "temple",
      position: regions.temple.spawn,
      gathered: [],
      inventory: 0,
      visited: ["temple"],
      appearance,
      seed: Math.floor(Math.random() * 4294967296),
      pickedDrops: [],
      progress: newProgression(),
      worldVersion: 2,
    });
    audio.unlock();
    setPlaying(true);
    setReplacing(false);
    setMessage("");
  }
  const travel = useCallback(
    (destination?: Region) => {
      if (!save || traveling || travelLock.current) return;
      travelLock.current = true;
      if (save.region === "cabin" || destination === "cabin")
        playEffect("travel");
      stop();
      setTraveling(true);
      const next: Region =
        destination ??
        (save.region === "forest" || save.region === "cabin"
          ? "temple"
          : "forest");
      Animated.timing(transition, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }).start(() => {
        setSave((v) =>
          v
            ? {
                ...v,
                region: next,
                position:
                  next === "cabin"
                    ? regions.cabin.spawn
                    : next === "forest"
                      ? { x: 1740, y: 660 }
                      : save.region === "cabin"
                        ? { x: 1574, y: 500 }
                        : { x: 200, y: 666 },
                visited: Array.from(new Set([...v.visited, next])),
              }
            : v,
        );
        setMessage(
          "You and " + save.petName + " arrived at " + regions[next].name + ".",
        );
        Animated.timing(transition, {
          toValue: 0,
          duration: 450,
          useNativeDriver: true,
        }).start(() => {
          travelLock.current = false;
          setTraveling(false);
        });
      });
    },
    [save, traveling, stop, transition, playEffect],
  );
  useEffect(() => {
    const m = motion.state;
    if (
      exploring &&
      save &&
      m?.region === save.region &&
      exitTriggered(save.region, m.position)
    )
      travel();
  }, [exploring, save, motion.state, travel]);
  useEffect(() => {
    const p = motion.state?.position;
    if (
      exploring &&
      save?.region === "temple" &&
      p &&
      p.x > 1545 &&
      p.x < 1600 &&
      p.y < 477 &&
      p.y > 445
    )
      travel("cabin");
  }, [exploring, save?.region, motion.state, travel]);
  if (playing && save) {
    const liveMotion =
      motion.state?.region === save.region ? motion.state : null;
    const liveSave = {
      ...save,
      position: liveMotion?.position || save.position,
    };
    const camera = liveMotion?.camera || save.position;

    const drop = nearestDrop(liveSave);
    const home = nearestHome(liveSave.position, liveSave.region);
    const plot = nearestPlot(liveSave.position, liveSave.region);
    // Follow the player on narrow displays; keep the complete world on landscape screens.
    const WORLD = dimensions(save.region);
    const viewScale =
      save.region === "cabin"
        ? Math.max(width / WORLD.width, height / WORLD.height)
        : Math.max(0.85, width / 1150, height / 760);
    const worldW = WORLD.width * viewScale,
      worldH = WORLD.height * viewScale;
    const left = Math.min(
      0,
      Math.max(width - worldW, width / 2 - (camera.x * worldW) / WORLD.width),
    );
    return (
      <SafeAreaView style={s.root}>
        <StatusBar style="light" />
        <View style={s.game}>
          <View
            style={{
              position: "absolute",
              width: worldW,
              height: worldH,
              left,
              top: Math.min(
                0,
                Math.max(
                  height - worldH,
                  height * (inStory && compact ? 0.29 : 0.5) -
                    (camera.y * worldH) / WORLD.height,
                ),
              ),
            }}
          >
            <World
              garden={save.progress?.garden}
              recovery={
                save.progress?.story === "awakening"
                  ? "lying"
                  : save.progress?.story === "world" ||
                      save.progress?.story === "calling"
                    ? "sitting"
                    : undefined
              }
              region={save.region}
              hero={liveSave.position}
              pet={save.pet}
              showFamiliar={save.progress?.familiarGranted ?? true}
              restoredAltar={save.progress?.restoredAltar ?? false}
              paused={
                journal ||
                inStory ||
                conversation ||
                sleepPrompt ||
                fishingSeed !== null ||
                gardenPlot !== null ||
                traveling
              }
              facing={liveMotion?.facing || save.facing}
              heroFrame={
                liveMotion?.moving ? Math.floor(liveMotion.distance / 8) % 8 : 0
              }
              petFrame={
                liveMotion?.petMoving
                  ? Math.floor(liveMotion.petDistance / 8) % 4
                  : 1
              }
              petPosition={liveMotion?.pet}
              petLeft={liveMotion?.petLeft}
              petFacing={liveMotion?.petFacing}
              petMoving={liveMotion?.petMoving}
              petPose={liveMotion?.petPose}
              gathered={save.gathered}
              appearance={save.appearance ?? defaultAppearance}
              seed={save.seed ?? 12345}
              pickedDrops={save.pickedDrops ?? []}
            />
          </View>
          <View
            style={[
              s.hud,
              inStory && { display: "none" },
              { left: compact ? 12 : 32, right: compact ? 12 : 32 },
            ]}
          >
            <View style={s.location}>
              <Text style={s.eyebrow}>PATH OF TEOPHOROS</Text>
              <Text style={[s.locationTitle, compact && { fontSize: 19 }]}>
                {regions[save.region].name}
              </Text>
              <Text style={s.small}>
                Spring · Day {save.progress?.day ?? 1} ☀
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                stop();
                setMenuTab("satchel");
                setJournal(true);
              }}
              style={s.journalButton}
            >
              <Text style={s.buttonText}>Inventory ☷</Text>
              <Text style={{ color: "#d3ddc8", fontSize: 11, marginTop: 5 }}>
                {save.progress?.money ?? 0} drachmae
              </Text>
            </Pressable>
          </View>
          {!inStory && (
            <View style={[s.quest, { left: compact ? 12 : 32 }]}>
              <Text style={s.eyebrow}>
                {save.region === "cabin"
                  ? "HEARTH & HOME"
                  : save.progress?.restoredAltar
                    ? "A SANCTUARY REBORN"
                    : "RESTORE THE OLD ALTAR"}
              </Text>
              <Text style={s.questText}>
                {save.region === "cabin"
                  ? "Rest · Store supplies · Change clothes"
                  : save.progress?.restoredAltar
                    ? "✓ The old altar is restored"
                    : "Wood 3 · Stone 3 · Fiber 2"}
              </Text>
              <Text style={s.questText}>
                Energy {save.progress?.energy ?? 100}/100
              </Text>
            </View>
          )}
          <View
            style={[
              s.bottomHud,
              inStory && { display: "none" },
              { left: compact ? 12 : 32, right: compact ? 12 : 32 },
            ]}
          >
            <View style={s.dpad}>
              {[
                [0, -12, "↑"],
                [-12, 0, "←"],
                [0, 12, "↓"],
                [12, 0, "→"],
              ].map(([, , label], i) => (
                <Pressable
                  key={i}
                  accessibilityRole="button"
                  accessibilityLabel={
                    "Move " + ["up", "left", "down", "right"][i]
                  }
                  onPressIn={() =>
                    motion.press(
                      ["up", "left", "down", "right"][i] as Direction,
                    )
                  }
                  onPressOut={() =>
                    motion.release(
                      ["up", "left", "down", "right"][i] as Direction,
                    )
                  }
                  style={[
                    s.direction,
                    i === 0
                      ? { position: "absolute", top: 0, left: 48 }
                      : { marginTop: 48 },
                  ]}
                >
                  <Text style={s.arrow}>{label}</Text>
                </Pressable>
              ))}
            </View>
            <View
              style={{
                alignItems: "flex-end",
                gap: 8,
                maxWidth: compact ? Math.min(200, width - 180) : 340,
              }}
            >
              <Text style={s.gameHint}>
                {save.name} & {save.petName}
              </Text>
              <Button onPress={gather}>
                {plot
                  ? "Tend garden"
                  : home === "well"
                    ? "Refill watering jug"
                    : home === "lake"
                      ? "Cast a fishing line"
                      : home === "bed"
                        ? "Rest for the night"
                        : home === "wardrobe"
                          ? "Change clothes"
                          : home === "priest" || home === "altar"
                            ? "Speak to the High Priest"
                            : home === "chest"
                              ? "Open storage"
                              : home === "workbench"
                                ? "Use workbench"
                                : home === "provisions"
                                  ? "Trade provisions"
                                  : drop
                                    ? "Pick up " + drop.kind
                                    : nearest(liveSave) >= 0
                                      ? "Gather " +
                                        regions[save.region].resource
                                      : "Gather / pick up"}{" "}
                · E
              </Button>
              <Text style={s.gameHint}>
                {compact
                  ? "Use the arrows to explore"
                  : "WASD / arrows to walk · E to interact"}
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  setMessage(
                    save.region === "cabin"
                      ? "Walk through the doorway at the bottom of the room to return to the sanctuary."
                      : save.region === "forest"
                        ? "Cross the wooden bridge, then follow the path to the right edge."
                        : "Follow the golden path to the left edge of the courtyard.",
                  )
                }
              >
                <Text style={s.hintLink}>
                  {save.region === "cabin" ? "Way to the sanctuary" : "Path to " + regions[save.region].destination}
                </Text>
              </Pressable>
            </View>
          </View>
          {!!message && (
            <View style={s.toast}>
              <Text style={s.toastText}>{message}</Text>
            </View>
          )}
          {storageError && (
            <View style={[s.toast, { top: 210, bottom: undefined }]}>
              <Text style={s.toastText}>
                Saving is unavailable. Keep this session open to retain
                progress.
              </Text>
            </View>
          )}
          {journal && save.progress && (
            <GameMenu
              save={save}
              initialTab={menuTab}
              onSave={(fn) => setSave((v) => (v ? fn(v) : v))}
              onClose={() => setJournal(false)}
              onTitle={() => {
                stop();
                setJournal(false);
                setPlaying(false);
              }}
              audio={audio}
              onMessage={setMessage}
            />
          )}
          {fishingSeed !== null && (
            <Fishing
              seed={fishingSeed}
              onCatch={caughtFish}
              onClose={() => setFishingSeed(null)}
            />
          )}
          {gardenPlot && save.progress && (
            <GardenPanel
              id={gardenPlot}
              progress={save.progress}
              onClose={() => setGardenPlot(null)}
              onAction={(action) => {
                setSave((v) =>
                  v?.progress
                    ? {
                        ...v,
                        progress: tendGarden(v.progress, gardenPlot, action),
                      }
                    : v,
                );
                if (action === "harvest") playEffect("pickup");
                else if (action === "till") playEffect("soil");
                else if (action === "water") playEffect("water");
                else playEffect("fiber");
              }}
            />
          )}
          {sleepPrompt && (
            <View style={[s.scrim, { zIndex: 70 }]}>
              <GamePanel style={{ maxWidth: 500, width: "100%" }}>
                <Text style={{ fontSize: 28 }}>Rest until morning?</Text>
                <Text>
                  Wake with full energy. Watered crops will grow overnight.
                  Stored supplies and gathered materials stay saved.
                </Text>
                <GameButton
                  onPress={() => {
                    if (travelLock.current) return;
                    travelLock.current = true;
                    setSleepPrompt(false);
                    setTraveling(true);
                    Animated.timing(transition, {
                      toValue: 1,
                      duration: 450,
                      useNativeDriver: true,
                    }).start(() => {
                      setSave((v) =>
                        v?.progress ? { ...v, progress: rest(v.progress) } : v,
                      );
                      Animated.timing(transition, {
                        toValue: 0,
                        duration: 650,
                        useNativeDriver: true,
                      }).start(() => {
                        travelLock.current = false;
                        setTraveling(false);
                      });
                    });
                  }}
                >
                  Sleep · begin a new day
                </GameButton>
                <GameButton onPress={() => setSleepPrompt(false)}>
                  Not yet
                </GameButton>
              </GamePanel>
            </View>
          )}
          {conversation && save.progress && (
            <Conversation
              text={
                save.progress.restoredAltar
                  ? "The altar is secure again. A small beginning, but one that matters. Keep the sanctuary supplied, and let your Familiar guide you along the old paths."
                  : "Bring me three pieces of wood, three stones and two bundles of fiber. Together we can secure the old altar. You may use the workbench, store supplies in the chest, or trade at the camp."
              }
              onClose={() => setConversation(false)}
              action={
                !save.progress.restoredAltar &&
                Object.entries(altarCost).every(
                  ([id, n]) => count(save.progress!.bag, id as ItemId) >= n!,
                )
                  ? {
                      label: "Give supplies · restore the altar",
                      onPress: () => {
                        setSave((v) =>
                          v?.progress
                            ? { ...v, progress: restoreAltar(v.progress) }
                            : v,
                        );
                        playEffect("pickup");
                        setMessage("Altar restored · +120 drachmae");
                      },
                    }
                  : undefined
              }
            />
          )}
          {save.progress && save.progress.story !== "complete" && (
            <Dialogue
              key={save.progress.story}
              stage={save.progress.story}
              familiar={save.petName}
              onNext={() =>
                setSave((v) =>
                  v?.progress
                    ? { ...v, progress: advanceStory(v.progress) }
                    : v,
                )
              }
            />
          )}
          <Animated.View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: "#000000", opacity: transition, zIndex: 100 },
            ]}
          />
        </View>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={s.root}>
      <StatusBar style="dark" />
      <Image
        source={require("../../assets/world/olympus-title.png")}
        style={[StyleSheet.absoluteFill, { width: "100%", height: "100%" }]}
        resizeMode="cover"
      />
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: "center",
          padding: compact ? 12 : 26,
        }}
      >
        <View style={s.titlePlaque}>
          <Text style={s.titleSmall}>✦ OLYMPUS AWAITS ✦</Text>
          <Text
            style={[s.gameTitle, compact && { fontSize: 27, lineHeight: 33 }]}
          >
            PATH OF TEOPHOROS
          </Text>
          <Text style={s.titleSmall}>A new life beneath the Gods</Text>
        </View>
        <View
          style={[
            s.setup,
            { width: compact ? "100%" : 640, padding: compact ? 18 : 26 },
          ]}
        >
          <View style={s.setupTop}>
            <Text style={s.eyebrow}>❖ CREATE YOUR WANDERER</Text>
            <Text style={s.version}>H E L L A S</Text>
          </View>
          {save && (
            <View style={s.continue}>
              <Text style={s.small}>Welcome back, {save.name}.</Text>
              <Button
                secondary
                onPress={() => {
                  audio.unlock();
                  setPlaying(true);
                }}
              >
                CONTINUE ADVENTURE ▶
              </Button>
            </View>
          )}
          <View style={s.identityRow}>
            <View style={{ flex: 1 }}>
              <Label>YOUR NAME</Label>
              <TextInput
                accessibilityLabel="Your name"
                value={name}
                onChangeText={setName}
                placeholder="What should we call you?"
                placeholderTextColor="#91958b"
                maxLength={24}
                style={s.input}
              />
              <Text style={[s.small, { marginTop: 12 }]}>
                Your name in the tales of Hellas.
              </Text>
            </View>
            <View style={s.portrait}>
              <Hero size={130} appearance={appearance} />
              <Text style={s.portraitLabel}>THE WANDERER</Text>
            </View>
          </View>
          <AppearancePicker value={appearance} onChange={setAppearance} />
          <Label>CHOOSE YOUR FAMILIAR</Label>
          <View style={s.petRow}>
            {(["Boxer", "Small dog", "Cat", "Fox", "Owl"] as PetKind[]).map(
              (p) => (
                <Pressable
                  key={p}
                  accessibilityRole="button"
                  accessibilityLabel={"Choose " + p}
                  accessibilityState={{ selected: pet === p }}
                  onPress={() => setPet(p)}
                  style={[s.petCard, pet === p && s.selected]}
                >
                  <PetPortrait kind={p} />
                  <Text style={s.petLabel}>{p}</Text>
                </Pressable>
              ),
            )}
          </View>
          <Label>YOUR FAMILIAR’S NAME</Label>
          <TextInput
            accessibilityLabel="Familiar name"
            value={petName}
            onChangeText={setPetName}
            placeholder="Your Familiar’s name"
            placeholderTextColor="#91958b"
            maxLength={24}
            style={[s.input, { marginTop: 12 }]}
          />
          <Label>YOUR HOME · THE RUINED SANCTUARY</Label>
          <View style={[s.regionArt, { height: 160, marginTop: 12 }]}>
            <Image
              source={require("../../assets/world/sanctuary-v4.png")}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          </View>
          <Text style={s.regionDescription}>
            A High Priest of Zeus finds you at the edge of death. Your journey
            begins among the ruins, with a home to rebuild and a Familiar to
            share the road.
          </Text>
          <Button
            disabled={!name.trim() || !petName.trim() || !loaded}
            onPress={() => (save ? setReplacing(true) : start())}
          >
            BEGIN ADVENTURE ▶
          </Button>
          <Text style={s.footnote}>Explore both lands with your Familiar.</Text>
          {!!message && <Text style={s.small}>{message}</Text>}
          {storageError && (
            <Text style={s.small}>
              Device storage is unavailable; progress may not be saved.
            </Text>
          )}
        </View>
      </ScrollView>
      {replacing && (
        <View style={s.scrim}>
          <View style={s.modal}>
            <Text style={s.heading}>A fresh beginning?</Text>
            <Text style={s.body}>
              Starting this journey will replace {save?.name}’s local save.
            </Text>
            <Button onPress={start}>Start new journey</Button>
            <Button secondary onPress={() => setReplacing(false)}>
              Keep my journey
            </Button>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#1169a9" },
  titlePlaque: {
    backgroundColor: "#e8b765",
    borderWidth: 5,
    borderColor: "#76421f",
    borderTopColor: "#ffe2a0",
    borderLeftColor: "#ffe2a0",
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 20,
    boxShadow: "0px 5px 0px #422d26",
  },
  gameTitle: {
    fontFamily: serif,
    fontWeight: "900",
    fontSize: 39,
    lineHeight: 47,
    color: "#633716",
    textShadowColor: "#ffedb4",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  titleSmall: {
    fontFamily: serif,
    fontWeight: "700",
    fontSize: 11,
    color: "#704623",
    letterSpacing: 1,
    marginVertical: 3,
  },
  shell: { flex: 1, flexDirection: "row", minHeight: 810 },
  artPanel: {
    flex: 1,
    minHeight: 810,
    overflow: "hidden",
    backgroundColor: "#719c73",
  },
  artShade: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#143b2c",
    opacity: 0.13,
  },
  brand: { padding: 52, paddingTop: 55 },
  brandKicker: {
    color: "#f5f2d3",
    fontSize: 10,
    letterSpacing: 3,
    fontWeight: "700",
  },
  brandTitle: {
    fontFamily: serif,
    fontSize: 76,
    lineHeight: 80,
    color: "#fff6d7",
    marginTop: 25,
    letterSpacing: -2,
    textShadowColor: "#2b513f55",
    textShadowRadius: 10,
    textShadowOffset: { width: 0, height: 3 },
  },
  brandLine: {
    width: 50,
    height: 2,
    backgroundColor: "#e7d29c",
    marginVertical: 22,
  },
  brandSubtitle: { fontSize: 16, color: "#f7f1d4" },
  artBottom: { position: "absolute", bottom: 36, left: 48, right: 30 },
  chapter: {
    fontSize: 10,
    letterSpacing: 3,
    color: "#f4e6b9",
    fontWeight: "700",
  },
  artCaption: {
    fontFamily: serif,
    fontSize: 21,
    lineHeight: 29,
    color: "#fff5d7",
    marginTop: 12,
    textShadowColor: "#193f32",
    textShadowRadius: 5,
    textShadowOffset: { width: 0, height: 1 },
  },
  setup: {
    backgroundColor: "#f4d695",
    borderWidth: 5,
    borderColor: "#855025",
    borderTopColor: "#fff0bf",
    borderLeftColor: "#fff0bf",
    boxShadow: "0px 5px 0px #463029",
    maxWidth: 640,
  },
  setupTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  eyebrow: {
    fontFamily: serif,
    fontSize: 13,
    letterSpacing: 0.4,
    fontWeight: "700",
    color: "#633e21",
  },
  version: { fontSize: 8, letterSpacing: 1.3, color: "#959787" },
  heading: {
    fontFamily: serif,
    fontSize: 37,
    lineHeight: 42,
    color: "#2e493d",
    marginTop: 15,
    marginBottom: 10,
    letterSpacing: -0.8,
  },
  body: { fontSize: 13, lineHeight: 21, color: "#7c8173" },
  label: {
    fontFamily: serif,
    fontSize: 12,
    letterSpacing: 0.4,
    fontWeight: "700",
    color: "#633e21",
    marginTop: 22,
    marginBottom: 10,
  },
  input: {
    height: 52,
    fontFamily: gameFont,
    borderWidth: 1,
    borderColor: "#9c602e",
    borderRadius: 0,
    paddingHorizontal: 14,
    fontSize: 21,
    color: "#314d3e",
    backgroundColor: "#fff0bf",
  },
  identityRow: { flexDirection: "row", gap: 25, alignItems: "center" },
  portrait: {
    width: 112,
    height: 144,
    backgroundColor: "#6da848",
    borderRadius: 0,
    borderWidth: 3,
    borderColor: "#9c602e",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 17,
  },
  portraitLabel: {
    fontSize: 7,
    letterSpacing: 1.3,
    color: "#7c896d",
    marginTop: -9,
  },
  swatches: { flexDirection: "row", gap: 12 },
  swatch: {
    width: 27,
    height: 27,
    borderRadius: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  activeSwatch: { borderWidth: 2, borderColor: "#f5f3e9" },
  petRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  petCard: {
    flexGrow: 1,
    flexBasis: 85,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#b37539",
    borderRadius: 0,
    paddingTop: 7,
    paddingBottom: 10,
    backgroundColor: "#e9bd72",
  },
  selected: {
    borderColor: "#72431c",
    backgroundColor: "#ffe8a0",
    borderWidth: 3,
  },
  petLabel: {
    fontFamily: serif,
    fontWeight: "700",
    fontSize: 12,
    color: "#5c381d",
  },
  regionRow: { flexDirection: "row", gap: 12 },
  regionCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#9c602e",
    borderRadius: 0,
    overflow: "hidden",
  },
  regionArt: { height: 88 },
  regionText: { padding: 11 },
  regionName: {
    fontFamily: serif,
    fontSize: 17,
    color: "#36513f",
    marginBottom: 4,
  },
  small: { fontSize: 10, color: "#71502e", lineHeight: 17 },
  radio: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 18,
    height: 18,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: "#faf8df",
    backgroundColor: "#ffffff99",
    alignItems: "center",
    justifyContent: "center",
  },
  regionDescription: {
    fontSize: 11,
    lineHeight: 17,
    color: "#71502e",
    marginTop: 11,
    marginBottom: 19,
    minHeight: 34,
  },
  button: {
    backgroundColor: "#99602e",
    borderWidth: 3,
    borderColor: "#623d21",
    borderTopColor: "#eabd70",
    minHeight: 48,
    borderRadius: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: "700",
    fontFamily: serif,
    letterSpacing: 0.4,
    color: "#f6f3df",
  },
  secondary: { backgroundColor: "#e9bd72", marginTop: 8 },
  footnote: {
    fontSize: 10,
    color: "#71502e",
    textAlign: "center",
    marginTop: 13,
  },
  continue: {
    marginTop: 14,
    padding: 10,
    backgroundColor: "#e9bd72",
    borderRadius: 0,
  },
  game: { flex: 1, overflow: "hidden", backgroundColor: "#7caa77" },
  hud: {
    position: "absolute",
    top: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  location: {
    backgroundColor: "#f5d898f5",
    borderWidth: 3,
    borderColor: "#9b6631",
    padding: 16,
    borderRadius: 0,
    flexShrink: 1,
  },
  locationTitle: {
    fontFamily: serif,
    fontSize: 26,
    color: "#304c3a",
    marginTop: 6,
    marginBottom: 5,
  },
  journalButton: { backgroundColor: "#315c46", padding: 15, borderRadius: 0 },
  quest: {
    position: "absolute",
    top: 120,
    backgroundColor: "#f5d898f5",
    borderWidth: 3,
    borderColor: "#9b6631",
    padding: 15,
    borderRadius: 0,
  },
  questText: { fontSize: 11, color: "#57704f", marginTop: 9 },
  bottomHud: {
    position: "absolute",
    bottom: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  dpad: { width: 144, height: 96, flexDirection: "row" },
  direction: {
    height: 44,
    width: 44,
    margin: 2,
    backgroundColor: "#f6efdce8",
    borderRadius: 0,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#c9d2b0",
  },
  arrow: { fontSize: 24, color: "#355c46" },
  gameHint: {
    fontSize: 11,
    color: "#fff5d7",
    textShadowColor: "#234f3c",
    textShadowRadius: 4,
    textShadowOffset: { width: 0, height: 1 },
  },
  hintLink: { fontSize: 10, color: "#fff5d7", textDecorationLine: "underline" },
  toast: {
    position: "absolute",
    bottom: 170,
    alignSelf: "center",
    maxWidth: "88%",
    backgroundColor: "#ffe3a3",
    borderWidth: 3,
    borderColor: "#754727",
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 0,
  },
  toastText: { fontSize: 12, color: "#36523d", textAlign: "center" },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#183b31bb",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modal: {
    backgroundColor: "#f4d695",
    borderRadius: 0,
    padding: 28,
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    gap: 8,
  },
  divider: { height: 1, backgroundColor: "#dedfcd", marginVertical: 10 },
  sectionTitle: {
    fontFamily: serif,
    fontSize: 20,
    color: "#3d5e48",
    marginTop: 8,
  },
});

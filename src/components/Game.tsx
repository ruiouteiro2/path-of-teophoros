import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  View,
  Text,
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
  atGate,
} from "../game";
import { Direction, useGameMotion } from "../hooks/useGameMotion";
const serif = Platform.OS === "ios" ? "Courier" : "monospace";
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
    [region, setRegion] = useState<Region>("forest");
  const color = "#467d81";
  const [save, setSave] = useState<Save | null>(null),
    [playing, setPlaying] = useState(false),
    [loaded, setLoaded] = useState(false),
    [journal, setJournal] = useState(false),
    [message, setMessage] = useState(""),
    [storageError, setStorageError] = useState(false),
    [replacing, setReplacing] = useState(false);
  const queue = useRef(Promise.resolve());
  const [session, setSession] = useState(0),
    [traveling, setTraveling] = useState(false),
    [transition] = useState(() => new Animated.Value(0));
  const checkpoint = useCallback(
    (position: Point, facing: Facing, region: Region) =>
      setSave((v) =>
        v && v.region === region ? { ...v, position, facing } : v,
      ),
    [],
  );
  const motion = useGameMotion(
    save,
    playing && !journal && !traveling,
    session,
    checkpoint,
  );
  const stop = motion.stop;
  useEffect(() => {
    AsyncStorage.getItem(SAVE_KEY)
      .then((raw) => {
        if (raw) {
          const data = JSON.parse(raw);
          if (validSave(data)) setSave(data);
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
    setSave((v) => {
      if (!v) return v;
      const m = getMotion();
      const live = m?.region === v.region ? { ...v, position: m.position } : v;
      const i = nearest(live);
      return i < 0
        ? v
        : {
            ...live,
            gathered: [...v.gathered, v.region + "-" + i],
            inventory: v.inventory + 1,
          };
    });
  }, [getMotion]);
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
  function start() {
    if (!name.trim() || !petName.trim()) return;
    setSession((v) => v + 1);
    setSave({
      name: name.trim(),
      petName: petName.trim(),
      pet,
      color,
      region,
      position: regions[region].spawn,
      gathered: [],
      inventory: 0,
      visited: [region],
    });
    setPlaying(true);
    setReplacing(false);
    setMessage("Welcome. Follow the path, and see what grows along the way.");
  }
  function travel() {
    if (!save || traveling) return;
    stop();
    setTraveling(true);
    const next: Region = save.region === "forest" ? "temple" : "forest";
    Animated.timing(transition, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setSave((v) =>
        v
          ? {
              ...v,
              region: next,
              position:
                next === "forest" ? { x: 870, y: 330 } : { x: 140, y: 380 },
              visited: Array.from(new Set([...v.visited, next])),
            }
          : v,
      );
      setMessage(
        "You and " + save.petName + " arrived at " + regions[next].name + ".",
      );
      Animated.timing(transition, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setTraveling(false));
    });
  }
  if (playing && save) {
    const liveMotion =
      motion.state?.region === save.region ? motion.state : null;
    const liveSave = {
      ...save,
      position: liveMotion?.position || save.position,
    };
    const canTravel = atGate(liveSave),
      camera = liveMotion?.camera || save.position;
    // Follow the player on narrow displays; keep the complete world on landscape screens.
    const worldW = Math.max(width, (height * 1000) / 667),
      worldH = Math.max(height, (width * 667) / 1000);
    const left = Math.min(
      0,
      Math.max(width - worldW, width / 2 - (camera.x * worldW) / 1000),
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
                  height / 2 - (camera.y * worldH) / 667,
                ),
              ),
            }}
          >
            <World
              region={save.region}
              hero={liveSave.position}
              pet={save.pet}
              facing={liveMotion?.facing || save.facing}
              heroFrame={
                liveMotion?.moving
                  ? Math.floor(liveMotion.distance / 11) % 4
                  : 1
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
            />
          </View>
          <View
            style={[
              s.hud,
              { left: compact ? 12 : 32, right: compact ? 12 : 32 },
            ]}
          >
            <View style={s.location}>
              <Text style={s.eyebrow}>PATH OF TEOPHOROS</Text>
              <Text style={[s.locationTitle, compact && { fontSize: 19 }]}>
                {regions[save.region].name}
              </Text>
              <Text style={s.small}>Spring · Day 1 ☀ A quiet morning</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                stop();
                setJournal(true);
              }}
              style={s.journalButton}
            >
              <Text style={s.buttonText}>Journal ☷</Text>
              <Text style={{ color: "#d3ddc8", fontSize: 11, marginTop: 5 }}>
                {save.inventory} / 8 gathered
              </Text>
            </Pressable>
          </View>
          <View style={[s.quest, { left: compact ? 12 : 32 }]}>
            <Text style={s.eyebrow}>A PLACE TO BEGIN</Text>
            <Text style={s.questText}>
              {save.inventory >= 3 ? "✓" : "○"} Gather 3 wild plants ·{" "}
              {Math.min(save.inventory, 3)}/3
            </Text>
            <Text style={s.questText}>
              {save.visited.length === 2 ? "✓" : "○"} Walk both ancient paths ·{" "}
              {save.visited.length}/2
            </Text>
          </View>
          <View
            style={[
              s.bottomHud,
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
              {canTravel ? (
                <Button onPress={travel}>
                  Travel to {regions[save.region].destination} →
                </Button>
              ) : (
                <Button
                  onPress={() =>
                    nearest(liveSave) < 0
                      ? setMessage(
                          "Move close to a sparkling plant to gather it.",
                        )
                      : gather()
                  }
                >
                  {nearest(liveSave) >= 0
                    ? "Gather " + regions[save.region].resource
                    : "Gather"}{" "}
                  · E
                </Button>
              )}
              <Text style={s.gameHint}>
                {compact
                  ? "Use the arrows to explore"
                  : "WASD / arrow keys to walk · E to gather"}
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  setMessage(
                    save.region === "forest"
                      ? "Cross the wooden bridge, then follow the path to the right edge."
                      : "Follow the golden path to the left edge of the courtyard.",
                  )
                }
              >
                <Text style={s.hintLink}>Where is the other map?</Text>
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
          {journal && (
            <View style={s.scrim}>
              <ScrollView
                style={{ width: "100%" }}
                contentContainerStyle={{
                  flexGrow: 1,
                  justifyContent: "center",
                }}
              >
                <View style={s.modal}>
                  <Text style={s.eyebrow}>YOUR STORY SO FAR</Text>
                  <Text style={s.heading}>{save.name}’s journal</Text>
                  <Text style={s.body}>
                    Traveling with {save.petName}, your {save.pet.toLowerCase()}{" "}
                    companion.
                  </Text>
                  <View style={s.divider} />
                  <Text style={s.sectionTitle}>Gathering pouch</Text>
                  <Text style={s.body}>
                    Wild thyme:{" "}
                    {save.gathered.filter((v) => v.startsWith("forest")).length}{" "}
                    / 4
                  </Text>
                  <Text style={s.body}>
                    Wild olives:{" "}
                    {save.gathered.filter((v) => v.startsWith("temple")).length}{" "}
                    / 4
                  </Text>
                  <Text style={s.sectionTitle}>Places discovered</Text>
                  {save.visited.map((r) => (
                    <Text key={r} style={s.body}>
                      ✓ {regions[r].name}
                    </Text>
                  ))}
                  {save.inventory >= 3 && save.visited.length === 2 && (
                    <Text style={[s.body, { color: "#528064" }]}>
                      A place to begin — complete. There is more to gather, or
                      simply wander awhile.
                    </Text>
                  )}
                  <View style={s.divider} />
                  <Button onPress={() => setJournal(false)}>
                    Return to the path
                  </Button>
                  <Button
                    secondary
                    onPress={() => {
                      stop();
                      setJournal(false);
                      setPlaying(false);
                    }}
                  >
                    Save & return to title
                  </Button>
                  <Text style={s.small}>
                    {storageError
                      ? "Local save unavailable"
                      : "Your journey is saved automatically on this device."}
                  </Text>
                </View>
              </ScrollView>
            </View>
          )}
          <Animated.View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: "#182d27", opacity: transition },
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
          <Text style={s.titleSmall}>A new life beneath the gods</Text>
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
              <Button secondary onPress={() => setPlaying(true)}>
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
              <Hero size={130} />
              <Text style={s.portraitLabel}>THE WANDERER</Text>
            </View>
          </View>
          <Label>CHOOSE YOUR COMPANION</Label>
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
          <TextInput
            accessibilityLabel="Pet name"
            value={petName}
            onChangeText={setPetName}
            placeholder="Your companion’s name"
            placeholderTextColor="#91958b"
            maxLength={24}
            style={[s.input, { marginTop: 12 }]}
          />
          <Label>CHOOSE YOUR FIRST PATH</Label>
          <View style={s.regionRow}>
            {(["forest", "temple"] as Region[]).map((r) => (
              <Pressable
                key={r}
                accessibilityRole="button"
                accessibilityLabel={
                  "Start in " + (r === "forest" ? "forest" : "temple ruins")
                }
                accessibilityState={{ selected: region === r }}
                onPress={() => setRegion(r)}
                style={[s.regionCard, region === r && s.selected]}
              >
                <View style={s.regionArt}>
                  <World region={r} lively={false} />
                </View>
                <View style={s.regionText}>
                  <Text style={s.regionName}>
                    {r === "forest" ? "Forest" : "Temple ruins"}
                  </Text>
                  <Text style={s.small}>
                    {r === "forest" ? "Rooted in nature" : "Touched by history"}
                  </Text>
                </View>
                <View
                  style={[
                    s.radio,
                    region === r && {
                      backgroundColor: "#4a7557",
                      borderColor: "#4a7557",
                    },
                  ]}
                >
                  {region === r && (
                    <Text style={{ color: "#fff", fontSize: 10 }}>✓</Text>
                  )}
                </View>
              </Pressable>
            ))}
          </View>
          <Text style={s.regionDescription}>{regions[region].description}</Text>
          <Button
            disabled={!name.trim() || !petName.trim() || !loaded}
            onPress={() => (save ? setReplacing(true) : start())}
          >
            BEGIN ADVENTURE ▶
          </Button>
          <Text style={s.footnote}>
            Explore both lands with your companion.
          </Text>
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
    height: 47,
    borderWidth: 1,
    borderColor: "#9c602e",
    borderRadius: 0,
    paddingHorizontal: 14,
    fontSize: 14,
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
    backgroundColor: "#f8f2dd",
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
    backgroundColor: "#f6f2e5",
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

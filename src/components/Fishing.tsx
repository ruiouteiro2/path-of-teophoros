import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Pressable,
  Platform,
  StyleSheet,
  AppState,
  ScrollView,
} from "react-native";
import { GamePanel, GameText as Text, GameButton, ui } from "./GameUI";
import { ItemIcon } from "./ItemIcon";
import { startReel, advanceReel, ReelState } from "../fishing";
import type { ItemId } from "../progression";
export function Fishing({
  seed,
  onCatch,
  onClose,
}: {
  seed: number;
  onCatch: (fish: ItemId) => void;
  onClose: () => void;
}) {
  const [stage, setStage] = useState<
    "waiting" | "bite" | "reeling" | "caught" | "escaped"
  >("waiting");
  const [reel, setReel] = useState<ReelState>(startReel);
  const [foreground, setForeground] = useState(true);
  const reelState = useRef<ReelState>(startReel());
  const timer = useRef({ stage: "", remaining: 0 });
  const holding = useRef(false),
    awarded = useRef(false);
  const species: ItemId = seed % 3 === 0 ? "perch" : "carp";
  useEffect(() => {
    const sub = AppState.addEventListener("change", (s) => {
      setForeground(s === "active");
      holding.current = false;
    });
    return () => sub.remove();
  }, []);
  useEffect(() => {
    if (stage !== "waiting" && stage !== "bite") return;
    if (timer.current.stage !== stage)
      timer.current = {
        stage,
        remaining: stage === "waiting" ? 2200 + (seed % 1700) : 2300,
      };
    if (!foreground) return;
    const start = Date.now();
    const t = setTimeout(
      () => setStage(stage === "waiting" ? "bite" : "escaped"),
      timer.current.remaining,
    );
    return () => {
      clearTimeout(t);
      timer.current.remaining = Math.max(
        0,
        timer.current.remaining - (Date.now() - start),
      );
    };
  }, [stage, seed, foreground]);
  useEffect(() => {
    if (stage !== "reeling" || !foreground) return;
    let frame = 0,
      last = 0,
      state = reelState.current;
    const tick = (t: number) => {
      state = advanceReel(
        state,
        holding.current,
        last ? (t - last) / 1000 : 0,
        seed,
      );
      reelState.current = state;
      last = t;
      setReel(state);
      if (state.result === "caught") {
        setStage("caught");
        if (!awarded.current) {
          awarded.current = true;
          onCatch(species);
        }
        return;
      }
      if (state.result === "escaped") {
        setStage("escaped");
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [stage, seed, onCatch, species, foreground]);
  useEffect(() => {
    if (Platform.OS !== "web") return;
    const down = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.code === "Space") {
        e.preventDefault();
        if (stage === "bite") setStage("reeling");
        holding.current = true;
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === "Space") holding.current = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [stage, onClose]);
  return (
    <View style={f.overlay}>
      <ScrollView
        style={{ width: "100%" }}
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 12,
        }}
      >
        <GamePanel style={{ width: "94%", maxWidth: 460 }}>
          <Text style={ui.title}>The sanctuary lake</Text>
          {stage === "waiting" && (
            <>
              <ItemIcon id="rod" size={80} />
              <Text>Your line rests on the water…</Text>
              <Text>Watch for a bite.</Text>
            </>
          )}
          {stage === "bite" && (
            <>
              <Text style={{ fontSize: 34, color: "#a74525" }}>A bite!</Text>
              <GameButton onPress={() => setStage("reeling")}>
                Hook the fish · Space
              </GameButton>
            </>
          )}
          {stage === "reeling" && (
            <>
              <Text>
                Keep the fish inside the green bar. Hold to rise; release to
                sink.
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  gap: 14,
                  justifyContent: "center",
                }}
              >
                <View style={f.track}>
                  <View
                    testID="fishing-catch-bar"
                    style={[
                      f.catchBar,
                      { top: (reel.bar - 0.145) * 260, height: 0.29 * 260 },
                    ]}
                  />
                  <View
                    testID="fishing-fish"
                    style={{
                      position: "absolute",
                      top: reel.fish * 260 - 18,
                      left: 5,
                    }}
                  >
                    <ItemIcon id={species} size={40} />
                  </View>
                </View>
                <View style={f.progressTrack}>
                  <View
                    style={{
                      position: "absolute",
                      bottom: 0,
                      width: "100%",
                      height: `${reel.progress * 100}%`,
                      backgroundColor: "#7daf3a",
                    }}
                  />
                </View>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Hold to reel"
                onPressIn={() => {
                  holding.current = true;
                }}
                onPressOut={() => {
                  holding.current = false;
                }}
                style={ui.button}
              >
                <Text style={ui.buttonText}>Hold to reel · Space</Text>
              </Pressable>
            </>
          )}
          {stage === "caught" && (
            <>
              <ItemIcon id={species} size={90} />
              <Text style={ui.title}>
                Caught a {species === "carp" ? "lake carp" : "silver perch"}!
              </Text>
              <Text>Added to your satchel.</Text>
            </>
          )}
          {stage === "escaped" && (
            <>
              <Text>The fish slipped away.</Text>
              <Text>
                Try keeping the green bar a little ahead of its movement.
              </Text>
            </>
          )}
          <GameButton onPress={onClose}>
            {stage === "caught" || stage === "escaped"
              ? "Back to the shore"
              : "Put the rod away"}
          </GameButton>
        </GamePanel>
      </ScrollView>
    </View>
  );
}
const f = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 72,
    backgroundColor: "rgba(18,36,43,.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  track: {
    width: 58,
    height: 266,
    borderWidth: 3,
    borderColor: "#624024",
    backgroundColor: "#397696",
    overflow: "hidden",
  },
  catchBar: {
    position: "absolute",
    left: 0,
    width: "100%",
    backgroundColor: "#79b842",
    borderWidth: 2,
    borderColor: "#d9f290",
  },
  progressTrack: {
    height: 266,
    width: 22,
    borderWidth: 3,
    borderColor: "#624024",
    backgroundColor: "#40362c",
  },
});

import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Image,
  View,
  StyleSheet,
  Platform,
  useWindowDimensions,
  ScrollView,
} from "react-native";
import { GameText, GamePanel, GameButton, ui } from "./GameUI";
import { opening, priestName } from "../story";
import type { StoryStage } from "../progression";
export function Dialogue({
  stage,
  familiar,
  onNext,
}: {
  stage: Exclude<StoryStage, "complete">;
  familiar: string;
  onNext: () => void;
}) {
  const { width, height } = useWindowDimensions();
  const small = width < 650;
  const short = height < 500;
  const line = opening[stage];
  // Each page is deliberately readable immediately. No forced typing wait or repetitive chirping.
  const [ready, setReady] = useState(false);
  const advanced = useRef(false);
  const advance = useCallback(() => {
    if (!ready || advanced.current) return;
    advanced.current = true;
    onNext();
  }, [ready, onNext]);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 180);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    if (Platform.OS !== "web") return;
    const key = (e: KeyboardEvent) => {
      if (ready && !e.repeat && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        advance();
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [ready, advance]);
  return (
    <View style={d.overlay}>
      <View style={[d.chapter, short && { top: 12 }]}>
        <GameText
          style={{
            color: "#fff0c4",
            fontSize: small ? 24 : 32,
            textAlign: "center",
          }}
        >
          {line.title}
        </GameText>
      </View>
      <GamePanel style={[d.box, { width: small ? "96%" : "88%" }]}>
        <View style={{ flexDirection: small ? "column" : "row", gap: 20 }}>
          <View
            style={[
              d.portrait,
              { width: short ? 80 : small ? 110 : 180, height: short ? 90 : small ? 110 : 180 },
            ]}
          >
            <Image
              source={require("../../assets/world/npcs/priest-portrait.png")}
              style={{ width: "100%", height: "100%" }}
              resizeMode="contain"
            />
          </View>
          <View style={{ flex: 1, gap: 12 }}>
            <GameText style={ui.title}>{priestName}</GameText>
            <ScrollView style={{ maxHeight: short ? Math.max(70, height * 0.24) : small ? 200 : 220 }}>
              <GameText
                style={{
                  fontSize: small ? 21 : 25,
                  lineHeight: small ? 29 : 34,
                }}
              >
                {line.text}
              </GameText>
            </ScrollView>
            <GameButton disabled={!ready} onPress={advance}>
              {line.answer.replace("{familiar}", familiar)} ▸
            </GameButton>
          </View>
        </View>
      </GamePanel>
    </View>
  );
}
const d = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 80,
    backgroundColor: "rgba(13,20,24,.3)",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 24,
  },
  box: { maxWidth: 1000 },
  portrait: {
    backgroundColor: "#b88449",
    borderWidth: 3,
    borderColor: "#82502c",
    alignSelf: "center",
    overflow: "hidden",
  },
  chapter: { position: "absolute", top: 45, left: 20, right: 20 },
});

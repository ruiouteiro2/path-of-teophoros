import React, { useEffect } from "react";
import {
  View,
  Image,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from "react-native";
import { GamePanel, GameText as Text, GameButton, ui } from "./GameUI";
export function Conversation({
  text,
  onClose,
  action,
}: {
  text: string;
  onClose: () => void;
  action?: { label: string; onPress: () => void };
}) {
  const { width } = useWindowDimensions();
  const narrow = width < 650;
  useEffect(() => {
    if (Platform.OS !== "web") return;
    const key = (e: KeyboardEvent) => {
      if (!e.repeat && e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [onClose]);
  return (
    <View style={s.overlay}>
      <GamePanel style={{ width: "96%", maxWidth: 1000 }}>
        <View style={{ flexDirection: "row", gap: 16 }}>
          <Image
            source={require("../../assets/world/npcs/priest-portrait.png")}
            resizeMode="contain"
            style={{
              width: narrow ? 80 : 150,
              height: narrow ? 110 : 170,
              alignSelf: "flex-end",
            }}
          />
          <View style={{ flex: 1, gap: 12 }}>
            <Text style={ui.title}>High Priest of Zeus</Text>
            <Text style={{ fontSize: narrow ? 20 : 24 }}>{text}</Text>
            {action && (
              <GameButton onPress={action.onPress}>{action.label}</GameButton>
            )}
            <GameButton onPress={onClose}>Until we speak again</GameButton>
          </View>
        </View>
      </GamePanel>
    </View>
  );
}
const s = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 75,
    backgroundColor: "rgba(20,24,23,.22)",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 24,
  },
});

import React from "react";
import {
  Text,
  View,
  Pressable,
  StyleSheet,
  TextProps,
  ViewProps,
} from "react-native";
export const gameFont = "PixelifySans_400Regular";
export const gameBold = "PixelifySans_600SemiBold";
export const palette = {
  ink: "#472b20",
  edge: "#633b25",
  shadow: "#37251e",
  gold: "#eeb85c",
  paper: "#ffe3a3",
  inset: "#dca35b",
  blue: "#365b86",
};
export function GameText({ style, ...props }: TextProps) {
  const flat = StyleSheet.flatten(style) || {};
  const size = Math.max(17, flat.fontSize ?? 20);
  return (
    <Text
      {...props}
      style={[
        { color: palette.ink, fontFamily: gameFont, fontSize: 20 },
        style,
        {
          fontFamily:
            flat.fontFamily === gameBold ||
            flat.fontWeight === "bold" ||
            flat.fontWeight === "700"
              ? gameBold
              : gameFont,
          fontSize: size,
          lineHeight: Math.max(flat.lineHeight ?? 0, Math.ceil(size * 1.25)),
        },
      ]}
    />
  );
}
export function GamePanel({ style, children, ...props }: ViewProps) {
  return (
    <View {...props} style={[ui.panel, style]}>
      <View style={ui.inner}>{children}</View>
    </View>
  );
}
export function GameButton({
  children,
  onPress,
  disabled = false,
  selected = false,
  accessibilityLabel,
}: {
  children: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
  selected?: boolean;
  accessibilityLabel?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled, selected }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        ui.button,
        selected && { backgroundColor: "#f8d78a" },
        {
          opacity: disabled ? 0.45 : pressed ? 0.75 : 1,
          transform: [{ translateY: pressed ? 2 : 0 }],
        },
      ]}
    >
      <GameText style={ui.buttonText}>{children}</GameText>
    </Pressable>
  );
}
export const ui = StyleSheet.create({
  panel: {
    backgroundColor: palette.gold,
    borderWidth: 4,
    borderColor: palette.edge,
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 0,
    elevation: 5,
    padding: 3,
  },
  inner: {
    backgroundColor: palette.paper,
    borderWidth: 2,
    borderColor: "#fff0bd",
    padding: 16,
    gap: 12,
  },
  button: {
    backgroundColor: "#e6b05f",
    borderColor: palette.edge,
    borderWidth: 3,
    minHeight: 46,
    paddingHorizontal: 14,
    paddingVertical: 8,
    justifyContent: "center",
  },
  buttonText: { textAlign: "center", fontFamily: gameBold, fontSize: 20 },
  title: { fontFamily: gameBold, fontSize: 28, color: palette.ink },
  input: {
    fontFamily: gameFont,
    fontSize: 22,
    minHeight: 48,
    padding: 10,
    borderWidth: 3,
    borderColor: "#926036",
    backgroundColor: "#fff0c8",
    color: palette.ink,
  },
});

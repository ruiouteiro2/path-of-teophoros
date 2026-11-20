import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { Asset } from "expo-asset";
import { startupAssets } from "../startupAssets";
import { GameButton } from "../components/GameUI";
import {
  useFonts,
  PixelifySans_400Regular,
  PixelifySans_600SemiBold,
} from "@expo-google-fonts/pixelify-sans";
import { View, Text } from "react-native";
export default function Layout() {
  const [attempt, setAttempt] = useState(0);
  const [artState, setArtState] = useState<'loading' | 'ready' | 'error'>('loading');
  useEffect(() => {
    let active = true;
    Asset.loadAsync(startupAssets).then(
      () => { if (active) setArtState('ready'); },
      () => { if (active) setArtState('error'); },
    );
    return () => { active = false; };
  }, [attempt]);
  const [loaded, error] = useFonts({
    PixelifySans_400Regular,
    PixelifySans_600SemiBold,
  });
  if ((!loaded && !error) || artState !== 'ready')
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#332d29",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          gap: 20,
        }}
      >
        <Text style={{ fontSize: 28, color: "#ffe3a3", textAlign: 'center', ...(loaded ? { fontFamily: 'PixelifySans_400Regular' } : {}) }}>
          {artState === 'error' ? 'The sanctuary could not be loaded.' : 'Opening the sanctuary…'}
        </Text>
        {artState === 'error' && <GameButton onPress={() => { setArtState('loading'); setAttempt(value => value + 1); }}>Try again</GameButton>}
      </View>
    );
  return <Stack screenOptions={{ headerShown: false }} />;
}

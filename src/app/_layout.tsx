import { Stack } from "expo-router";
import {
  useFonts,
  PixelifySans_400Regular,
  PixelifySans_600SemiBold,
} from "@expo-google-fonts/pixelify-sans";
import { View, Text } from "react-native";
export default function Layout() {
  const [loaded, error] = useFonts({
    PixelifySans_400Regular,
    PixelifySans_600SemiBold,
  });
  if (!loaded && !error)
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#332d29",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: 24, color: "#ffe3a3" }}>
          Opening the sanctuary…
        </Text>
      </View>
    );
  return <Stack screenOptions={{ headerShown: false }} />;
}

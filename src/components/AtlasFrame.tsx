import React, { memo } from "react";
import { View, Image, ImageSourcePropType } from "react-native";
export const AtlasFrame = memo(function AtlasFrame({
  source,
  cell,
  size,
  flip = false,
}: {
  source: ImageSourcePropType;
  cell: number;
  size: number;
  flip?: boolean;
}) {
  return (
    <View
      pointerEvents="none"
      style={{
        width: size,
        height: size,
        overflow: "hidden",
        transform: [{ scaleX: flip ? -1 : 1 }],
      }}
    >
      <Image
        source={source}
        resizeMode="stretch"
        fadeDuration={0}
        style={{
          position: "absolute",
          width: size * 4,
          height: size * 4,
          left: -(cell % 4) * size,
          top: -Math.floor(cell / 4) * size,
        }}
      />
    </View>
  );
});

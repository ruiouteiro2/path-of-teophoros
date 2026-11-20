import React, { memo } from "react";
import { View, Image, ImageSourcePropType } from "react-native";
export const AtlasFrame = memo(function AtlasFrame({
  source,
  cell,
  size,
  flip = false,
  columns = 4,
  rows = 4,
}: {
  source: ImageSourcePropType;
  cell: number;
  size: number;
  flip?: boolean;
  columns?: number;
  rows?: number;
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
          width: size * columns,
          height: size * rows,
          left: -(cell % columns) * size,
          top: -Math.floor(cell / columns) * size,
        }}
      />
    </View>
  );
});

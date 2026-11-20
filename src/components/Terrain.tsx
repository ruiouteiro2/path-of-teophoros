import React, { memo } from 'react';
import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Defs, ClipPath, Path, Image as SvgImage } from 'react-native-svg';
import { terrainAssets, sanctuaryFloorSource } from '../terrainAssets';
import type { Region } from '../game';

/** The earlier floor is reused at its exact source scale; no terrain is regenerated. */
export const Terrain = memo(function Terrain({ region, style, resizeMode = 'cover' }: {
  region: Region; style?: StyleProp<ViewStyle>; resizeMode?: 'cover' | 'stretch';
}) {
  return <View pointerEvents="none" testID="terrain-image" style={[{ overflow: 'hidden' }, style]}>
    <Image source={terrainAssets[region]} resizeMode={resizeMode} fadeDuration={0}
      style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]} />
    {region === 'temple' && <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}
      viewBox="0 0 1536 1024" preserveAspectRatio={resizeMode === 'stretch' ? 'none' : 'xMidYMid slice'}>
      <Defs><ClipPath id="sanctuary-floor-repair"><Path
        d="M744 387 C821 387 884 443 884 512 C884 581 821 637 744 637 C667 637 604 581 604 512 C604 443 667 387 744 387 Z" />
      </ClipPath></Defs>
      <SvgImage href={sanctuaryFloorSource} x={0} y={0} width={1536} height={1024}
        clipPath="url(#sanctuary-floor-repair)" />
    </Svg>}
  </View>;
});

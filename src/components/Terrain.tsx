import React, { memo } from 'react';
import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Defs, ClipPath, Path, Mask, Rect, LinearGradient, Stop, Image as SvgImage } from 'react-native-svg';
import { terrainAssets, sanctuaryFloorSource, sanctuaryArchitectureSource } from '../terrainAssets';
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
      <Defs>
        <LinearGradient id="sanctuary-ground-join" x1={0} y1={477} x2={0} y2={507} gradientUnits="userSpaceOnUse">
          <Stop offset={0} stopColor="white" /><Stop offset={1} stopColor="black" />
        </LinearGradient>
        <Mask id="sanctuary-architecture-mask" x={0} y={0} width={1536} height={1024} maskUnits="userSpaceOnUse">
          <Rect x={0} y={0} width={1536} height={1024} fill="url(#sanctuary-ground-join)" />
        </Mask>
        <ClipPath id="sanctuary-architecture-repair"><Path
        d="M0 0 H1536 V374 H1360 V160 H1090 V385 L990 414 L948 477 L913 507 H0 Z" />
      </ClipPath><ClipPath id="sanctuary-floor-repair"><Path
        d="M744 387 C821 387 884 443 884 512 C884 581 821 637 744 637 C667 637 604 581 604 512 C604 443 667 387 744 387 Z" />
      </ClipPath></Defs>
      <SvgImage href={sanctuaryArchitectureSource} x={0} y={0} width={1536} height={1024}
        clipPath="url(#sanctuary-architecture-repair)" mask="url(#sanctuary-architecture-mask)" />
      <SvgImage href={sanctuaryFloorSource} x={0} y={0} width={1536} height={1024}
        clipPath="url(#sanctuary-floor-repair)" />
    </Svg>}
  </View>;
});

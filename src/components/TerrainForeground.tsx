import React, { memo } from 'react';
import { View } from 'react-native';
import Svg, { Defs, ClipPath, Path, Image as SvgImage } from 'react-native-svg';
import { forestTrees, forestImagePoint, forestImageScale } from '../terrainDepth';

export const TerrainForeground = memo(function TerrainForeground({ scale, ox, oy }: {
  scale: number; ox: number; oy: number;
}) {
  return <>{forestTrees.map(tree => {
    const point = forestImagePoint(tree.x, tree.y);
    const foot = forestImagePoint(tree.footX, tree.footY);
    return <View key={tree.id} pointerEvents="none" style={{ position: 'absolute',
      left: ox + point.x * scale, top: oy + point.y * scale,
      width: tree.width * forestImageScale * scale, height: tree.height * forestImageScale * scale,
      zIndex: Math.round(foot.y),
    }}>
      <Svg width="100%" height="100%" viewBox={`${tree.x} ${tree.y} ${tree.width} ${tree.height}`}>
        <Defs><ClipPath id={`terrain-${tree.id}`}><Path d={tree.path} /></ClipPath></Defs>
        <SvgImage href={require('../../assets/world/olivewild-v2.png')} x={0} y={0} width={1536} height={1024} clipPath={`url(#terrain-${tree.id})`} />
      </Svg>
    </View>;
  })}</>;
});

// Keep the world, foreground masks, map menu, creation preview and preload on
// the same terrain revision. A replacement also requires reviewing worldLayout
// and terrainDepth: changing an image must not silently change walkable space.
export const terrainAssets = {
  temple: require('../assets/world/sanctuary-v5.png'),
  forest: require('../assets/world/olivewild-v2.png'),
  cabin: require('../assets/world/cabin-interior.png'),
} as const;

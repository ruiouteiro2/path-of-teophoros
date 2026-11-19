# Path of Teophoros

A small Greek-themed life/exploration game in React Native, Expo SDK 58, and TypeScript. The forest and temple maps use original, reference-guided pixel art; characters, pets, plants, and props are reusable sprite components.

## Run

```sh
npm install
npm run web
# Android / iOS development server:
npm start
```

Node 24 is recommended for the built-in TypeScript test runner. Mobile development requires an SDK 58-compatible Expo client or a development build. Native JavaScript bundles are checked, but signed Android/iOS binaries and physical-device QA are not included.

## Play

- Enter a character name and pet name; choose a dog, cat, fox, or owl and your starting map.
- Hold WASD / arrow keys or the on-screen directional controls to walk. Diagonal keyboard movement is supported.
- Approach a small sparkling plant and press **E** or **Gather**.
- In the forest, cross the bridge and follow the path to the right edge. In the temple, follow the path to the left edge. Use **Travel** at the sign.
- Open the journal to see your inventory and starter objective.
- Progress saves on this device. A new journey asks before replacing the local save.

## Implemented

Two connected maps, four pets, eight harvestable plants, character creation, a starter objective, journal, local saving, continuous accelerated movement, directional four-frame player walks, pet gait animation and breadcrumb following, camera easing, animated water/fountain ripples, wind-driven plants, drifting leaves, and faded map transitions with corresponding entry paths.

The art direction follows the user's Stardew Valley reference: compact outlined sprites, bright terrain, small plants, readable color ramps, and a top-down game perspective. It does not reuse extracted game assets.

## Reusable code and assets

- `src/components/WorldAssets.tsx`: AtlasFrame, Sprite, Hero, Pet, Tree, Column, Resource, World.
- `src/motion.ts`: frame-rate-independent movement, acceleration, collision-aware player motion, pet trail, camera easing.
- `src/hooks/useGameMotion.ts`: keyboard/touch input and animation loop; saves checkpoints separately from visual frames.
- `src/game.ts`: map geometry, resources, gates, save validation.
- `src/components/Game.tsx`: creation, gameplay HUD, journal, transitions.
- `assets/world/`: two map textures and three transparent sprite atlases.
- `docs/ART_DIRECTION.md`: final art specifications and atlas layout.

World coordinates are 1000 × 667. Maps are composited terrain images with explicit navigation zones and live sprite/animation layers, not an editable tile-map engine. Navigation boundaries are approximate. Walk cycles have four frames per direction; pets face left/right. Farming, NPCs, combat, audio, and an economy remain future work.

## Verify

```sh
npm test
npm run typecheck
npm run lint
npm run build:web
npx expo export --platform android --platform ios
npx expo-doctor
```

# Path of Teophoros

A Greek-themed life/exploration game in React Native, Expo SDK 58, and TypeScript. Original pixel art depicts a ruined sanctuary, woodland, a fishing lake, and the protagonist’s cabin. Characters, Familiars, plants, and items use reusable sprite components.

## Run

```sh
npm install
npm run web
# Android / iOS development server:
npm start
```

Node 24 is recommended for the built-in TypeScript test runner. Mobile development requires an SDK 58-compatible Expo client or a development build. Native JavaScript bundles are checked, but signed Android/iOS binaries and physical-device QA are not included.

## Play

- Enter your name and Familiar’s name; choose a Boxer, small dog, cat, fox, or owl. Choose hairstyle, hair color, garment and clothing color.
- Begin at the ruined sanctuary, where the High Priest of Zeus rescues you and grants your Familiar. Enter / Space continues dialogue.
- Hold WASD / arrow keys or the on-screen directional controls to walk. Diagonal keyboard movement is supported.
- Approach sparkling thyme or an olive tree and press **E** or **Gather**.
- Gather loose wood, stone and fiber with **E** or **Gather**. Each drop can be collected once, including after reloads.
- In the forest, cross the bridge and follow the path to the right edge. In the temple, follow the path to the left edge. Walking into an exit automatically travels through a black fade.
- Walk into the cabin doorway to enter. Use its chest for storage, wardrobe for appearance, and bed to advance the day and restore energy.
- Gather fallen reed bundles along the lake's north bank. Craft a rod at the outdoor workbench with two reeds, one wood and two fiber, or buy one at the camp. At the lake dock, cast, hook a bite, then hold/release to keep the fish inside the green catch bar.
- Tend the six garden plots in the western grove: till, plant barley or onions, water, then sleep. Refill the six-use jug at the well. Harvest and sell crops at the camp.
- Cook harvested barley into bread or two thyme into infusion at the cabin hearth. Ingredients must be in your satchel.
- Trade gathered supplies for drachmae at the camp. Bring three wood, three stone and two fiber to the High Priest to secure the altar and earn 120 drachmae.
- Open **Inventory** (**I** / **Escape**) for the satchel, quest journal, Familiar naming, appearance and separate music/ambience/effect/footstep controls.
- Progress saves on this device. A new journey asks before replacing the local save.

## Implemented

Two connected outdoor maps plus a cabin interior, five Familiars, portrait dialogue, eight harvest nodes, 60 seeded material drops per outdoor map, customization, altar restoration quest, currency, stack inventory, storage, trading, crafting, food/energy, sleep, fishing, six-plot gardening, and local saving. Movement uses acceleration, eight-phase directional human walks with measured foot anchors, directional Familiar gait, held idle poses and breadcrumb following. Environmental layers include flowing river water, gentle lake shimmer, independently swimming carp and perch, fixed-root flowers, butterflies, perching birds and blue/red dragonflies. Travel uses automatic black fades.

Two original regional music arrangements run approximately 4:46 (sanctuary/cabin) and 4:42 (forest), with short crossfades and preserved playback positions. Recorded water ambience and CC0 foley replace the first synthetic sound pass; no repeating bird-call audio is active. Sound levels persist and playback pauses in the background. Source credits are in `assets/audio/foley/README.md`.

The art direction follows the user's Stardew Valley reference: compact outlined sprites, bright terrain, small plants, readable color ramps, and a top-down game perspective. It does not reuse extracted game assets.

## Reusable code and assets

- `src/components/WorldAssets.tsx`: Sprite, Hero, Pet, Tree, Column, Resource, World.
- `src/components/AtlasFrame.tsx`: reusable non-destructive atlas renderer.
- `src/components/LivingEnvironment.tsx`: water, flowers, wildlife and a paused-in-background environmental clock.
- `src/motion.ts`: frame-rate-independent movement, acceleration, collision-aware player motion, pet trail, camera easing.
- `src/hooks/useGameMotion.ts`: keyboard/touch input and animation loop; saves checkpoints separately from visual frames.
- `src/game.ts`: map geometry, resources, gates, save validation.
- `src/components/Game.tsx`: creation, gameplay HUD, journal, transitions.
- `assets/world/`: terrain, title backdrop, separate directional pet atlases, flowers, water and wildlife.
- `src/components/Hero.tsx` and `AppearancePicker.tsx`: shared character renderer and customization controls.
- `src/inventory.ts`: seeded drops, one-time collection and map exit triggers.
- `src/hooks/useGameAudio.ts`: music, ambience, effects and saved sound settings.
- `docs/ASSET_GUIDE.md`: mandatory current art, animation, UI and sound standard.
- `docs/ART_DIRECTION.md`: historical production specifications.

Outdoor coordinates are 2000 × 1334; the cabin is 900 × 600. Maps are composited terrain images with explicit navigation zones and live sprite/animation layers, not an editable tile-map engine. Navigation boundaries are approximate. Human sheets use eight frames per direction; Familiars have directional cycles and alert, sniff, blink and resting poses. Seasons, fertilizer, combat, construction placement and a full NPC schedule remain future work. Current music is authored in `scripts/compose_sanctuary.py` and `scripts/compose_olivewild.py`; licensed foley preparation is in `scripts/prepare_foley.py`. The old `generate_audio.py` is historical. Native bundles compile, but device audio and SVG recoloring still need physical-device testing.

## Verify

```sh
npm test
npm run typecheck
npm run lint
npm run build:web
npx expo export --platform android --platform ios --output-dir .expo/native-export
npx expo-doctor
```

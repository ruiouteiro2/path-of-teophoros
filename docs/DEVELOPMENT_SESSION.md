# Sanctuary expansion — working session

User requested at least five hours of active development on 20 November 2026. Goal timer starts at Unix 1795134283. Do not mark this session complete before five hours of useful work and validation. Usage resets cannot be activated by the agent.

## Required outcome

- Ruined temple is the home map. Its floor emblem must be visibly broken and weathered too.
- Opening: the near-dead protagonist is found and awakened by a High Priest of Zeus. Through portrait dialogue he describes a monster-filled world where false Gods have displaced the Gods. He grants the chosen Familiar.
- Use Familiar everywhere in visible copy; preserve existing save keys for compatibility.
- Larger explorable maps with distinct places, not merely stretched sprites.
- Additional user steering: home map includes a cabin, woodland and a small lake with fish. Build usable cabin bed/storage and fishing, guided by farmhouse/fishing wiki references.
- Currency, stack inventory, storage/trading, meaningful early quests and settings.
- Readable game typography, framed messages, matching pixel art across all assets.
- Replace objectionable footsteps, water and wood audio; remove repeated bird loop. Longer music with varied sections and breathing space.
- Verify new and existing saves, interaction boundaries, transitions, mobile layout and art consistency.

## Reference research

Inspected Stardew Valley Wiki on 20 November 2026:

- https://stardewvalleywiki.com/Controls — movement/action/menu are distinct controls; item hotkeys and journal access.
- https://stardewvalleywiki.com/Inventory — framed slots, hotbar, item stacks, character preview, current funds; backpack expansion.
- https://stardewvalleywiki.com/Player_Menu — tabbed menu pauses single-player gameplay; inventory, map, crafting, options and exit functions have distinct tabs.
- https://stardewvalleywiki.com/Options — portrait dialogue; separate music/effects/ambience/footstep volume; UI scale and zoom.
- https://stardewvalleywiki.com/Farmhouse — permanent residence, small initial room, bed and storage/furnishing progression.
- https://stardewvalleywiki.com/Fishing — cast, bite cue, hook, controlled catch minigame and fish rewards.
- https://stardewvalleywiki.com/Quests — journal objectives, tracked progress and explicit reward completion.

These are mechanical and visual references. All dialogue, character identities, map art, music and item artwork remain original to Path of Teophoros. Do not copy wiki prose into the game.

## Work sequence

1. Preserve current working improvements and finish dependency checks.
2. Story/save/economy foundations with meaningful transaction and migration tests.
3. Priest portrait and world sprite, ruined sanctuary expansion, forest expansion, new reusable item/prop art.
4. Portrait dialogue and Familiar grant; home interactions and early restoration quest.
5. Tabbed inventory, storage, merchant, crafting, settings and readable typography.
6. Varied music and restrained effects; independent volume controls.
7. In-scene visual and behavior QA, save reloads, phone layout, exports and fixes.

## Baseline already verified

- Both map exits trigger by walking, reach black opacity 1, and arrive outside return triggers.
- Wood/fiber pickup increments once and persists through reload/map travel.
- Familiar naming and appearance persist. Four 8×4 character atlases and measured anchors integrated.
- New chunky olive tree inspected in the temple beside terrain trees.
- 18 tests passed; typecheck/lint passed. Native exports produced. Doctor identified missing direct expo-asset peer; installed with Expo resolver, recheck pending.

## Limitations to track honestly

Native export is not physical-device testing. Existing maps are flattened terrain composites with navigation zones. Background browser tabs throttle animation and must not be used to claim foreground frame rate. The user rejected the first synthesized sound pass; do not describe it as finished audio.

## First expansion checkpoint — 20 November

- Sanctuary v3 adds a cabin, camp, workbench/chest, grove and fishing lake; ruined floor mosaic remains visibly cracked. Outdoor coordinates doubled to 2000 × 1334 with follow camera. Cabin has its own 900 × 600 interior.
- Olivewild v2 adds a connected western trail loop and small shrine clearing. Authored navigation follows the new paths.
- Rescue dialogue, High Priest portrait/world sprite, story-stage persistence and one-time Familiar/supply grant implemented.
- Progression: currency, item stacks, chest transfers, buying/selling, three recipes, food, energy, sleep/day, altar hand-in, fishing. New matching item atlas and two-state altar prop.
- Pixelify Sans game typography throughout; framed dialogue, menus, inventory, settings and map overview. Familiar replaces pet in visible copy.
- Original 285.9-second music arrangement; Kenney CC0 foley; recorded stream and five-minute shore ambience. Repeating bird audio removed. Separate volume channels, cabin-floor footsteps, trade coins and cabin-only door sound.
- Fixed full-stack pickup consumption, unknown world-version validation, cabin camera coverage, browser SVG color-space bug (brown hair looked lavender), and paused scenery during menus/dialogue/fishing.
- Browser verified cabin automatic entry/exit, sleeping to Day 2/100 energy, phone inventory/settings layout, brown/black hair and red cloak, fishing cast/missed-bite energy behavior. Fishing win and storage/trade end-to-end QA continue.
- 30 behavior tests pass. Typecheck/lint pass. Web/Android/iOS export passed before final map/altar/color-space refinements; rerun final native exports later. Expo Doctor: 20/20.
- Browser animation measurement: static blank page ~120 Hz, a blank page with one animated DOM element ~10 Hz, game ~2 Hz while actively mutating. This session's browser instrumentation materially affects animation measurements; no claim of device frame rate. Production web build also checked. Continue functional tests and distinguish instrumentation from actual device performance.
- Full downloaded Kenney authoring packs remain locally available but are ignored by Git; selected WAVs and license notices are tracked.

Session remains active; the user's five-hour development period has not yet elapsed.

### Additional verified results

- Production fishing completed by a test controller reading the visible fish/bar positions and issuing the same Space key events as a player. Exactly one silver perch and one catch were recorded.
- The caught perch survived reload, was stored in the cabin chest, retrieved, then sold at the camp. Final balance 136 drachmae, earned 36, no perch left in either container, caught count still 1.
- Save validation now accepts in-bounds positions made non-walkable by later terrain edits; migration relocates to spawn while preserving progression. New regression test added; 31 tests pass.
- QA uses isolated origins `127.0.0.1:8081` (dev) and `127.0.0.1:8082` (production). User's localhost save remains untouched. Production server is a Python HTTP server serving `dist`.
- Latest checkpoint: all 31 tests, lint, typecheck and web/Android/iOS exports pass. Doctor remains 20/20. Native exports should use `.expo/native-export` so they do not replace the web preview in `dist`.

### Next polish work

- Align High Priest world-sprite body proportions with the new human family; current portrait is approved direction but the small 4×4 world sheet has an oversized head relative to the hero.
- Improve opening staging so the awakening does not visually begin with a fully standing protagonist.
- Add merchant presence and more purposeful environmental detail, then test quest hand-in/repaired altar in scene.
- Assess foreground animation on a non-instrumented actual device/browser before promising a frame-rate target. BrowserOS recording is not a valid performance benchmark.
- Finish audio listening review, final native exports, documentation and commit/push checkpoints; continue useful development until the requested five-hour period is satisfied.

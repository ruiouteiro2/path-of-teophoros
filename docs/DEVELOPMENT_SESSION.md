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

### Recovery staging and camp inhabitants

- Replaced the old oversized-head priest world sheet with `priest-walk-v2.png` (8 × 4), matching the hero's four-head proportions. Added Thaleia's `keeper-walk.png` (8 × 4) at the provision camp and in the trade panel. NPCs face the nearby protagonist.
- Added `hero/recovery.png` (4 × 2): columns short chiton, tied chiton, short cloak, tied cloak; rows lying and sitting. It uses the same magenta hair/cyan cloth runtime palette as walking. Awakening uses lying, the next two story beats sitting, then standing.
- Alpha contact measurements are reproducible with `scripts/measure_sprite_anchors.py`; source images remain intact. Recovery poses use bedroll contact, not a detached standing shadow.
- Checked recovery/NPCs in the live map, desktop and 390 × 844 portrait / 844 × 390 landscape. Story camera shifts upward on phones to keep actors above dialogue. Short screens scroll dialogue text; action stays visible. Story HUD is hidden. Dialogue guards duplicate activation.
- Added an atomic fish-award transaction and full-stack preflight so a catch record cannot advance without adding the fish.
- Remaining: quest restoration in-scene, merchant interaction inspection, further visual/audio polish and native verification. Five-hour goal remains active.
- Altar quest verified in browser: 3 wood / 3 stone / 2 fiber consumed, balance 100 → 220, repaired altar art visible, hand-in button removed. Saved data confirms empty bag and restored flag; reopening after reload retains the result.
- Recovery/NPC checkpoint: 32 tests, lint and typecheck pass; web, Android and iOS bundles exported successfully. Native device rendering/audio remains untested.

### Living lake and continuous wildlife

- `sanctuary-v4.png` removes the four static fish silhouettes from the lake while retaining the existing architecture, paths and shoreline layout. It supersedes v3 for gameplay, creation preview and map overview.
- Added `lake-fish.png`, a transparent 4 × 2 sheet: four tail phases of overhead carp / perch. They render beneath the water layer at 32 world units, with subdued underwater opacity and independent continuous routes. Clip paths isolate each atlas cell.
- Replaced the constant central lake rings with small occasional ripples at separate positions. The dock and banks remain outside water animation.
- Fixed scenery clock reset on menu close. Browser diagnostic: all three fish coordinates remained identical while the inventory was open; closing moved them only 0.23 / 0.28 / 0.67 normalized units on the next sample, not back to their starting positions.
- Birds now fly between two perches and return continuously; the old 29-second route teleported them back to the start. Added route continuity, lake containment, quiet-ripple and fish-route checks. All 35 tests, typecheck and lint pass.
- Visual lake check confirms no frozen fish silhouettes remain. Actual non-instrumented device frame-rate and listening checks remain outstanding.

### Garden mechanics and assets (in progress)

- Research: https://stardewvalleywiki.com/Crops#Basics and #Grow_Times. Adapted tilled soil, seed placement, watering before sleep, and growth measured in watered nights. Unwatered crops wait rather than die. Seasonal withering and fertilizer are not implemented.
- Added six garden plots in the western grove, barley (3 watered nights), onions (4), hoe, seed pouches, harvested crop icons and watering jug. The first generated hoe looked like an axe and was rejected; `hoe.png` replaces the unused tool cell in `garden-items.png`.
- Crop sheet `crops.png`: 4 × 2, barley/onion rows, seed/shoot/young/ripe stages, measured root baselines. Garden items: 4 × 2; barley seed, onion seed, barley, onion / rejected tool, watering jug, dry soil, wet soil.
- Pure transactions preserve mature crops if the bag is full; repeated till/water/harvest cannot duplicate costs or rewards. Sleep grows only watered crops and resets soil moisture. A jug holds six uses and refills at the well. New stories grant starter tools and six barley seeds; existing saves can buy them from Thaleia without replaying the story.
- Material generation IDs remain unchanged. Only drops overlapping the new garden are relocated after generation, preserving old collected IDs.
- Browser completed barley cycle: plant consumed one seed, till/water used correct energy, three actual sleeps with watering grew age 0 → 1 → 2 → 3, harvest added one barley and cleared the crop, camp sale changed balance 220 → 236 and removed barley. Each stage survived reload. Phone garden panel inspected at 390 × 844.
- 38 behavior tests pass, including garden reachability, water/energy/tool guards, save validation, crop growth, harvest capacity and trade. More scene inspection and final exports remain before checkpoint.
- Soil review rejected the initial thick-furrow tiles: at gameplay scale they read as stacked boards. `garden-soil.png` (2 × 1, dry/wet) replaces cells 6–7 with flatter irregular earth. Crop stages inspected together beside the hero and Familiar. Well interaction confirmed jug 3 → 6.
- Garden checkpoint: 38 tests, lint, typecheck, final web export and final Android/iOS exports passed. Five-hour goal remains active; next pass is sound overlap/foley and remaining presentation checks.

### Footstep and interaction sound cleanup

- Measured original grass/floor/stone clips: long quiet tails and small DC offsets. Updated reproducible preparation to remove tail offset, trim inaudible decay, add short onset/release ramps and constrain peaks. Steps now last 0.085–0.175 seconds with zero-valued endpoints. This is a signal/boundary check, not a claim of listening on a physical device.
- Corrected ground classification: wooden bridge, lake dock and cabin use wood footsteps; marble courtyard uses stone, other outdoor ground uses earth/grass. Variation no longer cycles the same four samples in a fixed order, and consecutive samples cannot repeat.
- Added soil scuff and water-action cues for tilling, watering and well refills; removed the incorrect mining-impact sound for tilling.
- Pending seek/play callbacks are cancelled after movement stops or audio state changes, preventing a delayed footstep/effect from starting after mute/backgrounding.
- Browser verified successful playback promises for music, stream, lakeshore and water-action files at the intended channel volumes. 40 behavior tests pass, including surface classification and sample variation; typecheck/lint pass.
- Mute QA: well interaction while muted left playback count unchanged (8 to 8), with all probed media paused. Restored sound afterward. Web and Android/iOS bundle exports passed for this checkpoint.

### Home interaction follow-up
- Sleep confirmation now takes the immediate shared transition lock, preventing rapid duplicate confirmations from advancing multiple days. The prompt explains watered crop growth and retained storage. Code-path review, 40 behavior tests, typecheck and lint passed; rapid-tap runtime verification remains in the next home QA pass.

### Cabin runtime checks
- On isolated QA origin, repeated Enter inputs on sleep confirmation advanced day 5 to 6 exactly once. Energy became 100, money stayed 236, watered fixture crops advanced one stage and dry crops did not grow. Cabin rendered after waking with hero and Familiar grounded beside bed.
- Storage fixture: seeded 3 wood solely for this check. Stored twice through UI (bag 1/chest 2), reloaded, observed the same quantities in both grids, then withdrew twice (bag 3/chest 0). No duplication or loss. User's separate localhost save was untouched.

### Contextual home presentation
- Cabin HUD now shows Hearth & Home and its available activities rather than the outdoor altar objective. Completed altar text reports the actual completed repair, not a checked but outstanding instruction to talk. Keyboard guidance says interact; navigation help names the destination instead of calling it another map. Typecheck and lint passed.

### Exploration and travel guard
- Movement, outdoor exits and cabin entrance now share the same exploration gate. All are suspended during dialogue, sleep confirmation, fishing, gardening, menus and an existing fade. Previously exit effects omitted several activity guards. Typecheck, lint and all 40 behavior tests passed; this is code-path verification rather than a claim of a forced overlap runtime test.

### Navigation connectivity regression
- Flood-filled actual walkable geometry from each map spawn on an 8-world-unit grid. All sanctuary home interactions, all harvest nodes, six garden plots, cabin entrance, cabin activities and each map exit are reachable. Added three connectivity regression tests (43 total passing). This proves navigation connectivity, not visual agreement between every polygon edge and the artwork; that inspection remains separate.

### Forest collision correction
- Inspected original forest/sanctuary terrain. Forest boulder near normalized (250,395) was inside a broad walkable rectangle. Added a ground footprint while keeping the surrounding path connected.
- Separated original terrain area from solid-footprint corrections so seeded material generation retains its old sequence and IDs. Only drops obstructed by corrected solids are relocated using the existing deterministic relocation pass. Existing tests pass; added a boulder/path regression (44 total tests). Typecheck/lint passed before formatting; targeted navigation suite passed afterward.

### Phone storage layout
- At 390x844 emulation, found day/energy text clipping and repeated Stored labels crowding chest slots. Narrow stats now use a full-width wrapping row; currency can shrink/wrap. Removed redundant per-slot Stored text while preserving it in accessibility labels and the chest heading. Re-inspected screenshot: full day/energy line fits, icons remain clear. Typecheck/lint pass.

### Short landscape HUD
- Checked storage at 844x390: scrolling reaches both transfer actions. Gameplay inspection found the quest panel obscuring the hero beside the cabin chest. On screens shorter than 500 logical pixels, hide the large quest panel and redundant bottom hints, and show energy beside day in the compact location panel. Re-inspected: hero/Familiar visible, movement, inventory, interaction and destination help remain available. Typecheck/lint pass.

### Opening responsive verification
- Replayed opening using a backed-up isolated QA save at 844x390 and 390x844. Portrait shows recovering hero/priest above the readable full dialogue; landscape retains the portrait, scrollable text and reachable continue button. Familiar flag remained false through the grant page, then became true at supplies after acceptance. Restored the prior QA save afterward, without awarding duplicate supplies to it.

### Living cabin hearth
- Generated one isolated flame family with the built-in image tool and copied the original alpha atlas to assets/world/hearth-flame.png. Integrated eight phases using the existing environment clock, without animating static architecture. Scene inspection at 844x390 places the small flame on the logs under the pot, clear of the floor. Typecheck/lint passed. Full exports follow in the next build checkpoint.
- Post-hearth checkpoint: all 44 tests pass; web and Android/iOS exports pass and contain hearth-flame.png. Browser inspected the atlas frame while inventory remained open: left/top stayed unchanged across observations, confirming paused playback. These are bundle/browser checks, not physical-device QA.

### Input isolation and sound control labels
- Typed WASD E I into Familiar naming and saved it on the isolated QA origin. Menu remained open and position stayed (280,250) in cabin; restored Argos afterward. Sound +/- controls now expose channel-specific accessibility names and disable at their bounds. Browser accessibility snapshot confirms all eight names. Typecheck/lint pass.

### Hearth cooking
- Consulted https://stardewvalleywiki.com/Cooking for station-based recipe menus and missing-ingredient behavior. Added original barley-bread recipe at the cabin hearth and moved thyme infusion there from the outdoor workbench. Uses bag ingredients, not automatic chest access. Existing atomic crafting transaction checks output capacity before costs.
- Added cooking transaction regression; 45 tests pass, including new hearth reachability through the navigation suite. Typecheck/lint passed before final formatting/title edit. Browser cooking interaction and full exports remain to verify next.
- Cooking runtime QA at 390x844: both recipes fit the panel; fixture thyme 2 became tea 1 and barley 2 became barley 1/bread 1 through actual Cook buttons. Restored prior QA save. Recipe cards now show food descriptions/energy benefits and disable at output capacity. Typecheck/lint pass after this adjustment; README documents the hearth.

### Cooking guidance and completed quest state
- Added hearth marker to cabin map, cooking instructions to journal and cooking to home HUD. Completed altar journal now reports reward received and hides already-consumed ingredient requirements. Browser readback verifies completed state and cooking guidance. Typecheck/lint and web/Android/iOS exports pass for the cooking checkpoint.

### River loop continuity
- Measured the previous 5.67-second stream: final 100 ms RMS 0.00464 versus middle 0.02408, producing a recurring level dip. Replaced endpoint fades with a 600 ms equal-power wrap crossfade in the reproducible preparation script.
- New 5.07-second loop: start/end 100 ms RMS 0.02368/0.02720, middle 0.02423; peak 0.22168. Seam sample jump 0.00748 is below the 99th percentile ordinary adjacent jump 0.05695. This is measured signal continuity, not a claim of physical-device listening.

### Shore-based audio falloff
- Replaced lake-center distance with distance to an authored lake ellipse, so the fishing dock gets near-water ambience. River distance includes its width. A smooth cubic falloff reaches silence 260 world units from the water; cabin always returns zero. Existing channel gain remains unchanged.
- Added tests for dock/bridge, distant sanctuary/forest, cabin silence and monotonic approach. This is an approximate acoustic region, not a replacement for collision shoreline geometry. Typecheck/lint and audio tests pass.

### Familiar collision animation
- Found that Familiar gait distance, walking flag and facing used attempted petStep even when collision rejected movement. Switched these to measured displacement. A blocked Familiar now stops its gait and retains facing instead of walking in place. Added a boulder-blocked regression; all nine motion tests pass, plus typecheck/lint. Route-following around tight corners remains a separate inspection.

### Familiar corner following
- Added line-of-travel collision sampling before skipping ahead on the breadcrumb trail. Earlier breadcrumbs remain until the Familiar has a clear route around the corner; normal following distance/gait are unchanged.
- Simulated a recorded bend around the forest boulder for 300 frames: Familiar took the upper bend, stayed outside the footprint, advanced to the far side and never moved 3 world units in a frame. All ten motion tests, typecheck and lint pass.

### Stable inventory artwork mapping
- Reviewed materials atlas and 26-unit world pickup renderer: both use the same art as inventory. Replaced index-based icon lookup with an explicit typed ID-to-cell mapping. Reordering inventory or adding an item now cannot silently shift existing artwork; missing mappings fail typecheck. Typecheck/lint pass; no artwork or gameplay counts changed.

### Previous-save recovery
- Added serialized previous-valid-save rotation using the existing storage adapter. Loading prefers valid primary data, then recovers the backup if primary is absent/corrupt. Corrupt primary data never replaces a valid backup; invalid new state is rejected. Existing outer write queue still serializes writes.
- Three storage tests cover rotation/recovery, failed primary writes, invalid new state and empty versus corrupt storage. Typecheck/lint pass. Device-local backup only; runtime corruption/recovery UI check remains next.

### Recovery runtime verification
- Corrupted only the isolated QA primary save with a valid backup retained. Reload recovered Alexios, day 6, 236 drachmae and cabin location; repaired primary data exactly matched the pre-test save. Found transient recovery toast expired on title; replaced it with a persistent load notice beside Continue, cleared when starting/continuing. Second corruption test confirmed the notice is present after loading. Typecheck/lint pass.

### Startup graphics and regression checkpoint
- Cache the title, three terrain scenes, human variants/recovery, priest portrait/NPCs and Familiar atlases before opening the title. Expo 58 Asset.loadAsync; failed requests show a retry button. Audio stays lazy-loaded.
- Browser reload reached Continue through the loading gate. This verifies startup completion, not physical-device image decoding or a simulated network-failure retry.
- All 51 behavior tests pass; TypeScript and Expo lint pass. Fresh web, Android and iOS exports succeed after the save-recovery, shoreline audio and Familiar corner-following changes. Native exports are not signed builds or physical-device tests.

### Visible menu feedback and bulk storage
- Transaction confirmations were below the menu scrim. Menu-local persistent status now keeps storage, trade, cooking and crafting results readable; changing tabs clears the status.
- Chest offers Store stack / Take stack, capped to available destination space. Single transfers and purchases disable at full stacks.
- Verified 3 wood stored and withdrawn through the actual browser controls, preserving the total. Screenshots inspected at 390x844 and 844x390: status remains visible while item/actions scroll independently.
- Added capacity/remaining-stack regression coverage; 12 progression tests pass. TypeScript and lint pass.

### Automatic cabin transition runtime check
- Used a declared save fixture immediately outside the cabin at (1574,495), then delivered directional keydown/keyup input through the browser. Walking upward entered the cabin at (450,490), with no interaction-button activation.
- Walking downward through the interior doorway returned to Temple of the Dawn. Arrival did not immediately retrigger the cabin entrance.
- Browser instrumentation makes timed movement much slower than nominal simulation speed; checked actual saved position/region rather than assuming key-hold duration implied distance. No device FPS conclusion.
- Restored original QA save and backup after verification.

### Separate static pickups from walking renders
- Moved material drops and harvest markers into a memoized fragment. They retain world-level depth sorting and update when collected IDs, region, seed or layout changes, rather than rebuilding for every hero/Familiar movement frame. Stable empty defaults preserve the cache for older saves.
- Inspected the outdoor scene, then used a declared fixture at temple-drop-0. Actual pickup reduced rendered item-atlas images from 60 to 59, saved that exact collected ID, and increased wood from 3 to 4. Original QA save/backup restored.
- TypeScript and lint pass. This is reduced React work by construction, not a measured physical-device FPS improvement.

### Quest guidance feedback
- Outdoor altar tracker shows current carried wood/stone/fiber against the required amounts. The tracker opens the journal directly, including the cabin's home panel.
- Priest's completed-altar conversation explicitly acknowledges the 120-drachma reward inside the dialogue, with garden/hearth/lake follow-up guidance. It does not grant another reward.
- Verified the quest-panel button opens the journal at phone size with the completed quest and home instructions. TypeScript and lint pass.

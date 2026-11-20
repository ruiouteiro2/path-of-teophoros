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

### Fishing control and landscape pass
- Fishing meter scales down with viewport height so the fish, reel control and cancel button fit together at 844x390. Inspected active reeling screenshot after resizing; portrait retains the larger meter.
- Keyboard repeat cannot hook a bite automatically from a Space key held while waiting. Window blur releases the hold state.
- Verified missed-bite return state and active reeling layout. A temporary DOM observer activated the displayed Hook button for the layout check because browser inspection overhead exceeds the bite window; it was disconnected and deleted. QA save and backup restored.
- Two fishing behavior tests, TypeScript and lint pass. This check does not claim a manual full catch through the UI.

### Garden action guidance
- Disabled till/water actions now explain missing tools or insufficient energy. Empty-jug guidance appears only for dry, non-mature soil when a jug is carried.
- Mature crops show a harvest instruction when space exists, and a specific storage/selling explanation only at the 999-item limit; no misleading blanket full-satchel warning.
- Inspected a mature barley panel at 844x390 with actual saved growth-stage fixture; scrollable controls remain available. Restored QA save/backup. TypeScript and lint pass; progression rules unchanged.

### Distinct regional music
- Added original Olivewild Paths score (282.3 seconds), with G Mixolydian harmony, eight chord voicings, new answering themes and a longer sparse bridge. Existing Sanctuary Dawn remains the temple/cabin cue. Authoring source: compose_olivewild.py; no sampled or copied music.
- Region changes crossfade across 800 ms. Inactive cue pauses at its current position; mute/background/title pause both tracks. Documented against Expo SDK 58 AudioPlayer play/pause/volume APIs.
- Render signal: peak 0.214, RMS 0.0368, AAC 128k file 4,456,941 bytes. No clipping; this is a signal check, not a subjective listening claim.
- Browser walking transition temple→forest verified sanctuary paused at 4.168s/volume0 and forest playing at volume0.3. Mute paused both; unmute resumed forest from 39.087s rather than restarting. Temporary playback probe removed and QA save/backup restored; original sound-on preference restored.
- TypeScript and lint pass. Physical-device playback/mix listening remains outstanding.

### Integrated checkpoint and ruined floor correction
- At 892a8a8: all 52 tests and fresh web/Android/iOS exports passed, including the regional score. Exports are not physical-device QA.
- Rechecked rescue page in phone portrait. Priest portrait, full paragraph and answer fit; lying hero and hidden Familiar visible as intended. This exposed a scope mismatch: the large floor emblem remained too intact despite the separate damaged altar.
- Built-in image generation edited sanctuary-v4 into sanctuary-v5, preserving 1536x1024 dimensions and landmark placement. Large mosaic now has missing earth-exposing sections, interrupted borders and cracks. Original v4 retained. Gameplay, preview, map and startup manifest all use v5.
- Inspected v5 in live scene at 1100x760 beside hero/Priest; floor remains damaged even with completed altar quest. Navigation geometry unchanged. QA save/backup restored. TypeScript and lint pass.
- Image generation edit prompt: Edit target: the supplied original top-down Greek pixel-art game terrain. Make ONE localized change ONLY inside the central circular teal/gold floor mosaic (roughly x620–875 y400–620 in the 1536x1024 source): this ancient emblem must look substantially ruined, not a pristine logo. Break the central little temple motif across two irregular missing sections with exposed ochre earth; add several broad jagged cracks across the mosaic; remove about one quarter of the teal/gold tesserae in irregular patches, interrupt parts of the laurel and Greek-key border, add a handful of small loose flat mosaic stones and sparse weeds rooted in cracks. Keep the emblem recognizable and still flat walkable ground, no deep pits or tall rubble. Preserve exact circle placement/scale, perspective and the existing chunky vibrant pixel-art texture. STRICT INVARIANTS: everything outside that circular mosaic stays visually identical; preserve image dimensions/framing, all paths, terrain, cabin, temple architecture, trees, water shoreline, dock, well, chest, flowers and colors. No new fish, characters, buildings, UI or text. This is a terrain repair for an existing game, not a redesign.
- Output review: generated edit preserves landmark geometry but is not pixel-identical outside the target (mean RGB absolute difference ~8.98/255 outside a surrounding rectangle). Accepted based on in-scene appearance/placement, not a claim of exact masked editing.

### Familiar stop and pause pose correction
- Movement view now publishes the transition from petMoving=true to false even when the hero already stopped. Previously the final gait frame could linger until a later idle-pose change.
- Pausing settles both movement flags and player velocity while retaining actor positions, gait distances and the Familiar breadcrumb route. The Familiar-only movement case now enters the pause branch.
- Added regression coverage for preservation of positions/route and bounded resumed movement. All 11 motion tests, TypeScript and lint pass. Hook transition reviewed in source; no new native-device animation claim.

### Saved orientation validation
- Save validation now rejects unknown facing directions before they can index sprite rows/anchors. Backup recovery handles such malformed primary saves.
- Motion initialization respects a valid saved facing instead of always starting front-facing; legacy saves without direction retain the default.
- Added loading/idle orientation and corrupt-facing backup tests. All 16 targeted motion/storage tests, TypeScript and lint pass.

### Readable map landmarks on phones
- Replaced overlapping numbered pins with one selected numbered landmark plus small dots for the others. A horizontal landmark strip above the map keeps selection close to the terrain preview.
- Added explicit Olivewild exit and cabin south-doorway markers. Viewing another region now reports the player's actual region instead of claiming a missing red marker is present.
- Verified selecting Workbench at 390x844 moves the numbered marker and preserves map visibility. No fast travel added. TypeScript and lint pass.

### Exact sound-setting endpoints
- Normalize changed and loaded volume levels to whole percentages. Repeated 10-point adjustments now reach exact zero/one instead of leaving floating-point residue and an incorrectly enabled endpoint button. Existing 16% footstep preference is preserved.
- Added endpoint, clamping and malformed-value tests. All four audio tests, TypeScript and lint pass.

### Long-name menu layout
- Menu heading now yields horizontal space to the close button and truncates after two lines. The saved name remains unchanged.
- Verified a 24-character unbroken name at 390x844: heading remains within panel, close button stays visible and works. Original QA name/save/backup restored. TypeScript and lint pass.

### Material pickup interaction clearance
- Found four drops in the active QA seed overlapping home interaction radii, including wood just 12 units from the cabin entrance. Building/door actions could intercept gathering.
- Existing post-generation relocation now also clears a 70-unit radius around home interaction points. Original random generation and collected IDs stay unchanged, so collected materials remain collected.
- Added home-interaction clearance assertions including the problematic seed. Ten inventory/navigation tests pass; separately checked 60,000 temple drops across 1,000 deterministic seeds for walkability and interaction clearance. TypeScript and lint pass.

### Complete rescue-to-exploration runtime walkthrough
- Replayed all five opening pages through real displayed buttons at 844x390 on v5 terrain. Portrait/text scroll area and answer buttons remained usable; lying-to-standing recovery displayed in scene.
- At Familiar page: familiarGranted=false and money=0. Advancing to supplies: familiarGranted=true, money still0. Completing supplies: story=complete, money100, energy80, bread2, barleySeed6, hoe1, wateringJug1, water6; normal movement/inventory controls returned.
- Reloaded and continued: no opening replay, money100/bread2/seeds6 unchanged. Original QA save/backup restored after verification.

### Confirmation keyboard cancellation
- Escape now cancels the sleep and new-journey confirmations, ignoring held-key repeats. Existing conversation/garden/fishing handlers remain separate.
- Opened replacement confirmation with a draft name, pressed Escape, and verified the confirmation closed while saved Alexios/day6/236 drachmae remained unchanged. Cleared draft fields afterwards. Sleep uses the same cancel handler; not separately runtime-tested in this pass.
- TypeScript and lint pass.

### Thaleia provision portrait
- Added `assets/world/npcs/keeper-portrait.png` using the built-in image generation tool. References: Priest portrait for pixel/shading treatment, keeper walking atlas for character identity. Original generated file retained at `C:\Users\Rui\.codex\generated_images\01a1f5f4-26a2-7a00-ae45-8dbb5e9f3179\exec-f04a301c-035d-4d44-9c90-8b1ec2bdbe6f.png`.
- Prompt: one original transparent square RPG bust of Thaleia, adult Greek provision keeper; brown hair swept into low bun, warm tan skin, brown eyes, olive shawl, cream chiton, terracotta apron and leather strap; warm confident small smile, slight three-quarter left view; visible pixel clusters, stepped dark outlines, warm upper-left lighting, broad limited shading; no crown, text, scenery, modern objects or multiple frames.
- Shop uses the portrait in a 90-unit framed inset; core startup cache includes it. Inspected at 844x390 and 390x844, with readable name/role and scrollable inventory. Original QA save/backup restored afterwards.
- Consulted Expo 58 Image documentation redirect to React Native 0.88 Image before integration. TypeScript, lint and all 56 behavioral tests pass. Web production export passes with current v5 terrain and portrait.

### Current platform export verification
- After the v5 terrain, motion/save/UI fixes and Thaleia portrait: all 56 tests, TypeScript and lint pass. Web export and Android/iOS Hermes bundle exports pass (92 native assets). These are packaging checks, not signed binaries or physical-device QA.


### Lake reed gathering and recipe consistency
- Found an unused lake-reed inventory item and a reed fishing rod recipe containing no reeds. Added three once-only fallen reed bundles on the accessible north-bank path, using the existing item atlas at material pickup scale. They use separate stable IDs; the original 60 seeded material IDs remain unchanged. Material relocation clears reed locations.
- Rod recipe now consumes two reeds, one wood and two fiber. Existing rods remain valid, and the shop still offers a rod. Pickup text uses the actual inventory display name.
- Tests cover collection once, serialization, invalid reed IDs, correct material counts, missing-reed crafting rejection, atomic recipe consumption and flood-fill reachability from the sanctuary spawn. All 57 tests, TypeScript and lint pass.
- Inspected in the live desktop map. Picking up temple-reed-0 added exactly one reed and persisted across reload; original QA save/backup restored. No new raster art or native API introduced.

### Lake-to-hearth meal
- Added grilled lake fish, restoring 55 energy, with carp/onion and perch/onion recipe variants. This connects fishing and garden harvests to recovery at home. Existing inventory saves remain valid; the new item is optional until crafted.
- Added original `assets/world/grilled-fish.png` via built-in image generation, referenced against `items.png`. Source retained at `C:\Users\Rui\.codex\generated_images\01a1f5f4-26a2-7a00-ae45-8dbb5e9f3179\exec-9a720587-d210-4dc6-92b6-365a9744f689.png`.
- Prompt: one transparent original ancient Greek pixel-art inventory icon, golden grilled whole freshwater fish on shallow terracotta plate with two grilled red-onion wedges; three-quarter overhead view matching bread/tea icons, upper-left light, dark stepped outline, broad pixel clusters and limited ramps, roughly 48x48 effective detail, no text/grid/utensils, readable at 42 logical pixels.
- Live hearth test consumed one carp and one onion into one meal; eating through Satchel removed it and increased energy20 to75. Inspected 1100x760 and390x844 cooking panels. Original QA save/backup restored.
- Added tests for both fish variants, missing onion, full result stack, save serialization, ingredient preservation and energy cap. All58 tests, TypeScript and lint pass.

### Save queue reliability and manual retry
- Moved the existing serialized-write behavior into createJourneyWriter, keeping one writer per running game. Failed writes reject to the UI without poisoning the internal queue for subsequent saves.
- Added controlled delayed-write and failure-then-success tests. They verify latest primary state, previous valid backup and recovery of the queue. Six persistence tests pass; TypeScript and lint pass.
- Added Retry saving to the existing game/title storage warning when a journey is available.
- Runtime fault injection: temporarily rejected primary localStorage writes, renamed Familiar to Argos QA, observed the game-styled warning on a390x844 viewport. Restored storage setter, pressed Retry saving, verified saved name and warning disappearance. Removed injection and restored original QA save/backup with the simulation paused in its menu.

### Compact exploration HUD
- Narrow screens now show a framed Find exit button with a44-unit minimum touch target. The exit destination remains in its accessibility label and the existing directional message is unchanged.
- Removed desktop E-key suffix and redundant movement instructions from compact controls; retained keyboard behavior. Long player/Familiar labels fit one line instead of expanding the action column.
- Inspected390x844,320x568 and844x390. Interaction and exit controls remain separate from the direction pad; Find exit displayed the correct left-edge courtyard guidance. TypeScript and lint pass.

### Full runtime fishing catch
- Completed cast, bite, hook, reel, catch result, shore return and reload at844x390. A temporary developer test controller followed rendered catch-bar/fish positions and sent normal keyboard input events; it did not change minigame state or grant inventory directly.
- Result: one silver perch, caught count1, energy100 to95. Result panel fitted short landscape. After returning and reloading, perch1/caught1/energy95 persisted without another award.
- Removed controller/keyup state, then restored original QA save/backup while on title. This verifies UI-to-save integration, not manual play feel or physical-device performance. Browser instrumentation significantly slows simulation.

### Forest foreground depth, first three path-side trees
- Added original-pixel foreground masks for west olive, southwest olive and trail pine. Masks are depth-sorted by trunk foot, with source coordinates transformed to match the terrain cover image. Small trunk footprints are solid; the pine previously lay inside the navigable trail.
- Browser inspection proved opaque foliage occludes actors behind the southwest olive, while the character/Familiar draw in front of the pine when south of its trunk. Original art remains unchanged, with no new tree style.
- Tested a transparent-canopy approach with a generated clean-ground plate, but rejected it because fixed silhouette edges remained visible. The unused workspace plate was removed; its original generated source remains `C:\Users\Rui\.codex\generated_images\01a1f5f4-26a2-7a00-ae45-8dbb5e9f3179\exec-de601781-0921-47d9-b0ee-f9dc9820d09a.png`. Final runtime uses opaque masks only. Most other trees are still baked terrain, so this is not universal occlusion.
- Added trunk/nearby-route assertions; all five navigation tests pass, including flood-fill connectivity. TypeScript, lint and web export pass. Original QA save/backup restored with simulation paused.
- Consulted Expo58 react-native-svg documentation before using the existing installed15.16.0 primitives. No new package added.
- Final checks for this depth pass: all61 tests pass; Android/iOS bundle exports pass with93 assets. Physical-device validation remains outstanding.

### Shop trade quantities
- Added1/5/10 quantity controls and total buy/sell prices. Selecting another item resets quantity to1. Buttons use the same pure transaction validation as the exchange, including funds, carried count,999-stack limit and currency cap.
- Runtime390x844: bought5 barley seeds for25 drachmae, money236→211 and seeds5→10. Switching to rod reset quantity1; selecting10 displayed600 drachmae and disabled purchase. Original QA save/backup restored while menu-paused.
- Existing transaction quantity tests cover conservation/overspending; no duplicated UI-mirroring test added. TypeScript and lint pass.

### Transition input isolation
- Found that the black fade used pointerEvents=none and inventory keyboard handling omitted traveling. Touch/key input could open a menu during a map switch.
- Fade now intercepts pointers only during travel/rest transitions. Inventory and quest buttons disable outside exploration, with synchronous travel-lock guards; inventory keyboard shortcut also checks travel state/lock.
- Runtime exit from cabin: repeated I events during the fade did not open the menu; arrived temple1574,500,day6,energy100. Reverse automatic entry: all98 sampled elementFromPoint checks over Inventory hit the black fade, and Inventory was aria-disabled in every sample. Arrived cabin450,490 with day/energy unchanged.
- Removed probes and restored original QA save/backup while menu-paused. TypeScript and lint pass.

### Region-scoped water playback
- Previously both ambient water players ran silently in every region. Now forest runs only stream ambience, sanctuary runs only lake ambience, and cabin pauses both. Existing proximity volume and music selection remain unchanged.
- Live player probe: sanctuary music playing0.3, lake playing, forest stream paused. Walking through cabin door paused lake and stream while music continued. Walking out resumed lake from13.057s to15.071s, without restarting; arrival temple1574,500.
- Removed media prototype probes and restored QA save/backup while menu-paused. TypeScript and lint pass. This confirms playback state, not a new subjective listening assessment.

### Complete garden runtime cycle
- Exercised till, plant barley, water, sleep and harvest through the displayed controls. Test-only saved-position changes skipped already-tested walking routes between garden and bed; this was not a continuous walking playthrough.
- Day6: till/plant/water consumed one barley seed,6 energy and1 jug charge. First sleep produced age1 on day7 and restored100 energy. A dry sleep produced day8 with age still1. Two subsequent watered sleeps produced age2 on day9 and mature age3 on day10; jug charges fell6 to3 in total.
- Harvest added exactly one barley, reset the plot to tilled/empty/age0 and removed the harvest action. Reload preserved barley1 and the empty plot, preventing another harvest award from the same crop.
- Restored the original QA primary and backup while on title and removed the garden fixture backup key. No production state or garden logic was changed by this verification pass.

### Narrow-screen HUD overlap and input guard
- Live390x844 inspection exposed the fixed-top quest panel overlapping the region/day panel when its title wrapped. Replaced the fixed quest offset with a flowing top HUD stack and8-unit spacing.
- At320x568, the full stack obscured the centered actor. The smallest layout now omits the repeated game brand and detailed quest progress, while retaining region, day, quest title and energy. Detailed progress remains in the journal. Screenshots confirm a visible character and separate controls at320x568,390x844 and844x390.
- Movement now rejects presses while inactive and ignores Ctrl/Meta/Alt keyboard chords. Runtime cancelable-event checks confirmed modified W was not prevented, while ordinary W remained handled. Keyup still releases held movement.
- Consulted Expo58 View documentation redirect to React Native0.88 View. TypeScript and lint pass. No saved-data changes.

### Sanctuary harvest-tree depth
- Inspected v5 terrain and found three of the four harvest-tree trunks inside traversable ground. Added four original-pixel foreground masks with solid trunk footprints; the fourth trunk was already outside the navigation area. Harvest IDs and node positions remain unchanged, preserving seeded material placement and collected resources.
- Live garden-olive checks: at558,866 the canopy occludes the character; at544,900 the character and Familiar draw in front of the trunk. Initial behind-tree test point544,854 was outside the navigation polygon and correctly migrated to spawn; the corrected test used a verified walkable point.
- Added sanctuary trunk/approach assertions. All62 tests pass, including flood-fill reachability for every home activity, harvest and exit; TypeScript and lint pass. QA save/backup restored while paused and fixture key removed.
- Before this tree pass, current web and Android/iOS exports passed for27c16eb with93 native assets. Tree changes require the next export verification; exports are not physical-device QA.

### Sprite integrity audit and clipping repairs
- Added a read-only Pillow audit and production atlas manifest. Initial run detected six owl flight cells touching boundaries and carp bleed in the inventory atlas. Corrected an audit-manifest mistake for dragonflies (runtime already uses4x4 correctly).
- Used the built-in image-generation tool to edit the existing sheets, preserving old files. Owl prompt: retain brown/cream identity, gold eyes, all16 poses and4x4 order; front/rear/profile flight rows and four idle poses; fit complete wings inside equal square cells with generous transparent margins, consistent body scale and no scenery/text/shadows. Final `assets/world/pets/owl-v2.png`; generated original `C:\Users\Rui\.codex\generated_images\01a1f5f4-26a2-7a00-ae45-8dbb5e9f3179\exec-1dd6546e-e599-4cef-af40-a055604a7565.png`.
- Item prompt: preserve the original16 identities, positions, palette and pixel treatment; center complete golden carp within row2/column4 at no more than78% cell width; keep every object inside its own cell with transparent margins, no new objects or text. Final `assets/world/items-v2.png`; generated original `C:\Users\Rui\.codex\generated_images\01a1f5f4-26a2-7a00-ae45-8dbb5e9f3179\exec-09bfec94-8a3d-47a0-a0b1-742421db8faa.png`.
- Re-measured all16 owl foot baselines from alpha silhouettes without altering the raster. Updated production renderer/cache references. Audit passes20 atlases /376 frames: nonempty silhouettes, solid-pixel cell margins and contact drift within0.015 normalized cell height. Very low-alpha generator edge noise is excluded; no palette or artistic-quality claim is made by the script.
- Inspected owl in Familiar panel and live world, and carp/tea/other icons together in the1100x760 satchel. Original QA save and backup restored while menu-paused; fixture key removed. TypeScript and lint pass.

### Optional ambient-animation setting
- Added a journey-persisted ambientMotion preference, defaulting to enabled for existing and new journeys. The Settings toggle stops decorative wind/water/wildlife updates through the existing world layer, while character and Familiar animation remain active. No new storage subsystem or sound preference changes.
- Runtime: switching off savedfalse and removed the animated water mask; reload retained the off label. Switching on savedtrue and restored the water mask. Inspected Settings at390x844. Restored original QA save/backup while menu-paused and removed fixture key.
- Added strict optional-boolean save validation and serialization coverage; all7 game tests pass. TypeScript and lint pass. Extended the existing Ctrl/Meta/Alt shortcut guard to E interaction and I inventory handlers.

### Shared scenery atlas and current map feedback
- Extended the audit to shared scenery sprites, altar states and standalone hoe/meal icons. Detected the pine tip crossing into the sapling cell above it. Built-in image edit preserved the16-object4x4 arrangement and pixel palette, reduced/recentered only the pine with8% requested top/bottom margins, and removed its stray pixels from the cell above. Final `assets/world/sprites-v2.png`; original generated file `C:\Users\Rui\.codex\generated_images\01a1f5f4-26a2-7a00-ae45-8dbb5e9f3179\exec-3f87290e-7680-47f5-80d0-6cf5c621882d.png`.
- Expanded audit passes24 sheets /396 frames. Web export passes. The proposed fresh-production opening test reached replacement confirmation but was cancelled when the user questioned the current map; original production QA save/backup restored without starting a new journey.
- User screenshot prompted comparison of sanctuary v2/v3/v4/v5. Successive map edits softened detail; v5 also enlarged the central temple motif. This is unresolved visual feedback, not a completed polish result. Asked whether the concern is artwork/object scale, cropped view, or both. No further whole-map replacement while clarification is pending.

### Fresh production opening verification
- Served the latest web export on the existing127.0.0.1:8082 server and backed up that origin's QA primary/backup. Through normal creation controls selected Theron/Aster, Boxer, tied silver hair and green cloak; confirmed replacement of the isolated QA journey.
- Inspected390x844 awakening, world, Familiar and supplies scenes. Lying/sitting/standing poses and portrait text fit; longer supplies copy scrolls. Familiar remained hidden through the grant page, then appeared after Welcome. Starting scene preserved the selected appearance and names.
- Completion gave exactly100 drachmae, bread2,hoe1,wateringJug1,barleySeed6,water6,energy80,day1,storycomplete. Reload retained identical progression without repeating rewards. Restored original QA primary/backup on title and removed fixture key.
- This verifies the production story/creation flow. It does not resolve the separate map-art regression raised by the user.

### Map-version review artifact
- Added `scripts/create_map_review.py`, which copies preserved PNGs unchanged into the ignored web-export folder and writes a standalone comparison page. It does not edit raster pixels, game code or saves.
- Opened `http://127.0.0.1:8082/map-review.html` in the agent browser. Verified whole-map and synchronized courtyard-detail views, equal image sizes and aligned comparison frames. Earlier versions2/3/4 can be selected against current5. This is review evidence, not a map repair or approval.

### Natural loose-material sprites
- Addressed the visibly packaged ground drops independently of the pending terrain review. Added original `assets/world/loose-materials.png`, shared by world pickups and inventory: snapped olive branches, pale limestone, loose green/dry fibers and fallen hollow reeds. Stable IDs, positions, quantities and transaction code remain unchanged.
- Built-in image-generation prompt referenced items-v2:2x2 equal square cells, transparent12% margins, three-quarter overhead natural loose materials without rope packaging, about32x32 effective pixel detail,4–6 material tones, warm upper-left highlights, no scenery/text or cast shadows. Generated original retained at `C:\Users\Rui\.codex\generated_images\01a1f5f4-26a2-7a00-ae45-8dbb5e9f3179\exec-36cde9f3-6396-47d0-8728-864b582f3f40.png`.
- Measured four alpha contact baselines into material-anchors.json; ground drops use these baselines and a small2-unit contact shadow. The same ItemIcon mapping serves satchel and world, avoiding another asset-family mismatch.
- Inspected shoreline drops at390x844 and all four icons in the1100x760 satchel.25-sheet/400-frame audit, TypeScript and lint pass. No QA fixture mutation was needed for this visual check. Terrain remainsv5 pending user clarification.
# Map-regression follow-up and verification

- Re-inspected preserved sanctuary v2 and v4. v2 has sharper grain but different lower-grove walls, trees and a small pond; it cannot replace v5 without revising navigation, lake animation and foreground masks. Current v5 remains unchanged while the art repair is unresolved.
- Centralized terrain revisions in `src/terrainAssets.ts`. World, foreground masks, navigation map, creation preview and startup cache now consume the same sources. This prevents mixed revisions; it does not itself fix the visual regression.
- Re-ran the full suite: 63 tests passed; Expo Doctor 20/20; TypeScript and ESLint passed. Asset audit passed 25 sheets / 400 frames. Native export before the source-centralization change completed with exit0, 94 assets, two 2.9MB Hermes bundles. Web export after it completed with exit0 and 80 assets; production title loaded with the saved Continue action and all creation controls.
- Regenerated the read-only map comparison after the web export. Updated CURRENT_AUDIT to distinguish completed checks from the unresolved map artwork and physical-device limitations.

## Terrain sampling correction

- Production browser diagnostics found a 1536×1024 sanctuary source enlarged to approximately2221×1481 with `image-rendering: auto`. Compared temporary nearest-neighbor sampling in-scene before implementing it. This removes an additional interpolation blur but cannot repair source artwork or the oversized floor motif.
- Added scoped `terrain.css` for the terrain Image and its matching foreground masks. Runtime computed styles show `pixelated` on the ground and all four sanctuary SVG masks, while other image sprites remain `auto`. Inspected the exported production scene at390×844 and1100×760. No terrain PNG, collision, saved position or landmark changed.
- Read Expo58 Metro CSS documentation: https://docs.expo.dev/versions/v58.0.0/config/metro/#css . Root-layout import follows its Router guidance; native global stylesheets are ignored. Added the CSS module declaration for TypeScript6.
- A concurrent export revealed that TypeScript was scanning generated dist JavaScript through its inherited allowJs/default include. Excluded dist, dist-native and native-export while retaining Expo's original exclusions. Typecheck and lint then passed. Web export succeeded (80 assets plus terrain CSS); Android and iOS export completed with exit0 (94 assets,2.9MB Hermes bundle each). Native filtering and device rendering remain unverified.

## Rejected isolated mosaic experiment

- Built-in image generation produced `C:/Users/Rui/.codex/generated_images/01a1f5f4-26a2-7a00-ae45-8dbb5e9f3179/exec-ff4d256e-948e-4c42-b703-cfd56fe4ff5e.png` using sanctuary-v2 as texture reference and v5 as ruined-state reference. Prompt: one transparent circular ruined floor decal; flat cream temple pictogram25% of disc width, teal tesserae, ochre laurel, broken Greek-key border, golden-earth-filled gaps, narrow dirt rim, chunky128×112 effective detail, no scenery or raised building. Full generated source remains outside the production repository.
- Trial overlay at source bounds589,384,310×272 left the terrain PNG unchanged. Checked the actual1100×760 scene with a temporary saved position south of the disc. The tile detail and thin outlines were much denser than the map, creating a pasted-on appearance. **Rejected** under the asset guide; removed the temporary renderer and asset reference rather than shipping the mismatch. Production remains commit8456d99 art/rendering.
- Restored the QA primary and backup save while paused and removed the `teophoros.qa.mosaic` fixture. No gameplay changes from this experiment remain. The test establishes that isolated generation alone is insufficient: the replacement must match the surrounding effective pixel clusters at game scale.

## Bounded reuse of the earlier floor

- Reused the existing sanctuary-v4 image through an SVG ground clip within604..884,387..637 source coordinates, over the unchanged v5 base. No raster was edited or regenerated. The smaller earlier motif and broken floor are restored, while cabin, lake, trees, routes and collision footprints keep their current positions.
- Added shared Terrain renderer for world, creation preview and navigation map so the bounded patch cannot drift between them. Source v4 is cached with the base map. The outer ground sampling remains pixelated on web.
- Inspected the scene at1100×760 and390×844 beside the hero and Familiar. No hard edge was visible around the clipped area; smaller motif and broken borders remain readable. The broader v5 source softness remains unresolved. The generated decal from the previous experiment is not used.
- Typecheck and lint passed. Web export completed (81 assets); native exports completed with exit0 (95 assets,2.9MB bundles). Restored the original dev QA primary/backup and removed `teophoros.qa.floorReuse`. Updated comparison page to explicitly identify its images as unmodified historical sources rather than the new layered live terrain.

## Short-landscape dialogue correction

- Inspected production dialogue at844×390 and568×320. At568×320 the narrow-screen column layout put the portrait and panel top above the viewport. Short screens now keep portrait and text side by side with a12px gap; portrait phone layouts retain the stacked arrangement.
- Verified the calling, Familiar and long supplies pages in the corrected exported build at568×320; portrait, title, scrollable text and action remain inside the viewport. The test resumed story stages in a saved fixture, so it verifies dialogue layout and advancement rather than normal opening actor placement or initial reward amounts (separately tested earlier).
- Restored primary and backup from paused dialogue and removed `teophoros.qa.landscapeStory`. Typecheck, lint and web export passed. The active work timer has reached five hours; outstanding artwork feedback still prevents declaring the overall goal complete.
- Final Android/iOS export after the dialogue correction completed with exit0, 95 assets and two2.9MB Hermes bundles.

## Original architecture texture recovery

- Compared the original temple image and sanctuary revisions. The old full temple map has incompatible layout, while sanctuary-v2 retains the current façade/steps at the same source coordinates. Added a bounded v2 façade silhouette over the v5 base through the shared Terrain renderer, alongside the earlier floor repair. No raster files or navigation coordinates changed.
- Inspected at1100×760 with a temporary courtyard position: the restored stone texture is sharper; entrance, steps, priest and altar remain aligned. The patch excludes the changed cabin and lower grove/lake. Wider terrain texture remains subject to review; this is not a declaration that the entire map matches the target style.
- Typecheck, lint and web export passed (82 assets). Restored both original QA save slots and removed `teophoros.qa.architecture` while menu-paused. Additional original-image decoding is a cost of these layers; native performance still needs device measurement.
- Android/iOS export after architecture recovery completed with exit0: 96 assets, two2.9MB Hermes bundles.

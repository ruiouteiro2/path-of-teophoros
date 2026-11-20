# Path of Teophoros — asset and presentation standard

Status: working production standard. Read this before creating or changing any visual, animation, UI, or sound asset. The user's corrections take precedence. Update this document when a correction changes the standard; do not silently invent a new style for the next asset.

## 1. The visual contract

An Olympus-themed, top-down life game with the readability and color separation of Stardew Valley, using original artwork. Slightly finer sprites are welcome; photorealistic painting, smooth vector cartoons, and intricate illustrated cutouts are not.

Judge assets at their actual in-game size, beside existing assets. A beautiful isolated PNG is not an acceptance test. Source resolution does not establish consistency. The rejected olive tree was technically pixel art but had tiny outlined individual leaves, thin branches, and far more detail than the map trees.

Whole-map regeneration has now caused an observed regression: successive sanctuary edits softened the terrain and enlarged the floor motif. Do not regenerate the complete map to fix one landmark. Preserve the approved terrain as a stable source, author bounded replacement layers, and compare the affected scene at the actual camera scale. The latest map appearance is under user review; passing code or atlas checks does not resolve that art feedback.

`src/terrainAssets.ts` owns the current terrain revisions for gameplay, foreground masks, world-map menu, creation preview and startup caching. Do not add independent terrain file references to those consumers. Any art replacement must review the corresponding `worldLayout.ts`, `terrainDepth.ts`, water masks and fish routes together; matching image dimensions alone does not preserve landmarks.

### Reference hierarchy

1. Terrain and trees: `assets/world/olivewild-v2.png` and `sanctuary-v5.png`. Match their chunky leaf groups, stepped silhouettes, warm earth, and broad shadow masses. The old `olivewild.png`, `temple.png`, and `sanctuary-v2.png` are superseded terrain drafts.
2. Animals: `assets/world/pets/boxer.png` and `small-dog.png`. Their anatomy, outlined shading, and gait are the approved animal direction. Preserve the actual reference dogs in `assets/references/`.
3. Humans: `assets/world/hero/` is the current character family. Less oversized heads than the obsolete `hero-walk.png`, natural limb proportions, and shading density compatible with the pets at world scale.
4. UI: the current Olympus sky, ochre panels, dark brown borders, pale inset fields, compact bold labels, and illustrated choices.

Dialogue portraits use `npcs/priest-portrait.png` and `npcs/keeper-portrait.png`: broad stepped shading, warm upper-left light, transparent bust silhouettes, and the same clothing/hair identity as each walking atlas. Portrait detail is separate from world-sprite density; never place portrait cutouts into the map.

Do not use the old flat SVG scenery, the rejected fine-leaf `olive-tree.png`, or the old large-headed `hero-walk.png` as a new asset reference. `olive-tree-v2.png` supersedes the fine-leaf tree. Old files retained in history are not automatically approved references.

## 2. Camera, scale, and silhouettes

- Outdoor world coordinates: 2000 × 1334. Terrain authoring/navigation uses normalized 1000 × 667 coordinates at scale 2. Cabin coordinates: 900 × 600. Ground is viewed from above at a consistent three-quarter RPG angle. The title backdrop may show a horizon; gameplay may not.
- Human render cell: 76 world units; visible human roughly 65–73 units high. Aim at approximately four heads tall. Do not make the pet realistic and the human a two-head chibi.
- Boxer cell: 43. Small dog/cat/fox: 32. Owl: 33. Keep species differences, not one arbitrary size for everything.
- Flowers: 17–23; thyme resource: 22. Flowers stay well below the character's waist, usually below the knee.
- Loose materials: 26-unit cell with clear recognizable silhouette, using `loose-materials.png` in both world and inventory. Branches, fibers and reeds lie loose rather than appearing as tied shop bundles. Ground placement uses `material-anchors.json` and a small contact shadow. A stick is not a whole tree trunk; a stone pickup is not a boulder.
- Harvest olive tree: 100-unit cell. Larger background trees may be larger, but the underlying pixel clusters and shading language must agree.
- Butterflies: 12; dragonflies: 16; birds: 23. Wildlife should read as wildlife rather than floating UI markers.
- Provide transparent margins and complete silhouettes. Never repair clipped heads/feet by hiding them behind UI.

## 3. Pixel density and drawing

- Use visible, deliberate pixel clusters and stepped edges. Avoid mixing single-pixel engraving with large terrain pixels.
- Trees: target the appearance of about 64 × 80 source pixels before enlargement. Draw foliage as grouped masses with a few leaf accents, not hundreds of individually outlined leaves.
- Characters and animals: short clean dark outlines, coherent simple shapes, roughly 4–6 useful tones per material. Preserve detail needed for species, face, clothing, and gait; remove microtexture that becomes noise at gameplay size.
- Avoid smooth gradients, airbrushed lighting, bloom, photographic fur, and thin ink illustration.
- Raster atlas originals are kept intact. Runtime cropping and measured anchors are preferred to destructive image processing. Use the image-generation workflow for raster edits unless the user requests another method.
- Web terrain uses scoped `image-rendering: pixelated` in `src/terrain.css`, including the matching SVG foreground masks. React Native Web paints Image through a nested background element, so styling only its hidden img is insufficient. Do not apply this rule globally to downscaled sprite atlases or portraits. Native filtering remains unchanged; browser sampling cannot recover source detail lost through image regeneration.
- Before accepting an atlas change, run `python scripts/audit_assets.py --report .expo/asset-audit.json` (Python/Pillow). `docs/asset-manifest.json` records current frame layouts and contact-anchor owners. The read-only check rejects empty cells, solid silhouettes at cell edges and stale contact baselines. Alpha below129 is ignored as edge noise; this is a technical check, not proof of artistic consistency, frame timing or physical-device rendering.
- `pets/owl-v2.png` and `items-v2.png` repair flight-wing and carp cell bleed. Use these in production; the older sheets remain reference history. Update the manifest and measured anchors whenever replacing a sheet.
- `sprites-v2.png` repairs the shared pine's bleed into the sapling cell above it. The manifest also checks altar states, the hoe and grilled-fish icon. Intentionally edge-to-edge terrain and soil tiles are not silhouette-margin assets.

## 4. Palette and light

- Light comes from upper left. Lit edges are warm; shadows are darker and slightly cooler.
- Terrain: vivid grassy greens, golden paths, cyan/sapphire water, warm brown trunks, cream marble.
- Keep a dark outline between a character and similarly colored terrain. Do not solve contrast with a glowing ring or a huge detached shadow.
- Flowers add controlled red, blue, white/yellow, and purple accents. Do not scatter every hue uniformly across the map.
- Olive leaves read silver/olive green, with sparse green and purple-black fruits. No generic herb labeled as olives.
- Boxer: dark chestnut/brindle brown, black stripes/ears/muzzle, white blaze/chest/paws. Small dog: tan, dark floppy ears, pale muzzle, white chest. Preserve these identity cues.
- Human hair colors: brown, black, gold, silver. Clothing accents: blue, green, terracotta red. White linen, leather and skin retain their colors.

## 5. Character customization pipeline

- `Appearance` is saved data: hairstyle, hair color, garment, garment color. Do not couple one hairstyle permanently to one outfit.
- Current styles: wavy crop / tied back; linen chiton / travel cloak. New options must work in every direction and every frame before entering the selector.
- Human source atlases are 8 columns × 4 rows: front, back, left, right; eight gait phases per row.
- Source magenta marks hair and source cyan marks colored fabric. These are technical keys, never intended in-game colors. Preserve natural skin, white linen, leather, and outlines outside those keys.
- `Hero.tsx` applies runtime color matrices with the original alpha mask. Inspect every offered palette in the live browser and check native output. If a new material color collides with a key, change the authoring scheme rather than silently recoloring skin.
- `hero-anchors.json` holds measured contact baselines per frame and variant. Regenerate measurements when a sheet changes; do not keep anchors from a visually similar old sheet.
- The creation preview and gameplay must use the same renderer and appearance data.

## 6. Animation and physical contact

- Movement is continuous and time-based. Keyboard repeats must never determine distance.
- Gait phase follows distance traveled. Current human cycle: one frame per 8 world units, eight phases; footstep sounds at 32-unit intervals.
- Alternate the planted foot and opposing arm. Feet pass beneath the body; knees bend without large body jumps. Stop on a neutral pose.
- Measure foot contact, rather than assuming every atlas has an 88% baseline. Grounded humans and pets use small contact shadows under their feet. Only flying animals intentionally separate from their ground plane.
- Pets keep their breadcrumb following and front/back/profile movement. Idle sniff, blink, alert and sit/preen are held behaviors, not an idle slideshow cycling every frame.
- The root of a plant stays fixed. Animate upper stems/heads and occasional gusts with still intervals. Never rotate a whole tree, bush, or map to imply wind.
- Rocks, bridges, trunks, ground and architecture stay static unless the gameplay actually moves them.
- Water has coherent downstream motion, separately masked banks and rock islands, and local wakes. Fountain droplets and ripples are separate. Do not slide the entire terrain image.
- Butterflies stay near flowers; birds alternate flight/rest. Blue/red dragonflies hover and dart near water. Avoid uniform speed and synchronized trajectories.
- Backgrounding the app pauses simulation/audio. Long frame stalls must not teleport actors.

## 7. Map composition, resources, and inventory

- Clear paths and entrances must remain readable. Avoid planting a harvest tree through intact paving or in the middle of the main route.
- Depth-sort dynamic objects by their ground contact; characters can pass behind canopies without drawing over them.
- `terrainDepth.ts` and `TerrainForeground.tsx` restore opaque depth for three path-side forest trees and four sanctuary harvest trees using masks of the original terrain pixels. Source-to-world conversion matches the terrain cover transform. Small trunk footprints remain solid after gathering. Other terrain remains painted into the base map. Do not claim universal tree occlusion or add transparent duplicate canopies over an unchanged painted tree; transparency needs separated ground and sprite layers.
- Materials are generated from the saved seed, not rerolled on render, map entry, or reload. IDs are stable and consumed once. Keep pickups separated, reachable, away from spawn and large resources.
- Inventory uses the same sprite artwork as ground pickups, with readable names and quantities in framed slots. Never introduce a modern dashboard card style.
- Entering an exit strip triggers travel automatically. Fade fully to black, change map while covered, then fade from black. Arrival positions must lie outside the return trigger so travel cannot bounce in a loop.
- Keep old saves readable when adding appearance, items, or sound preferences. Validate unfamiliar/corrupt values rather than trusting persisted data.

## 8. UI and wording

- Use game panels and inset controls with ochre, cream and brown framing. No split marketing landing page, elegant editorial serif treatment, large empty sales copy, or unrelated rounded dashboard cards.
- Exact title: Path of Teophoros. Subtitle: A new life beneath the Gods.
- Name fields must be labeled. Always say **Familiar** in visible game copy. Naming exists at creation and can be changed in the Familiar menu without replacing the save. Legacy `pet`/`petName` identifiers remain internal for save compatibility.
- Font: bundled Pixelify Sans regular and semibold, with a minimum 17 logical pixels for game text. Dialogue is 21–25 pixels. Use `GameText`, `GamePanel`, and `GameButton`; do not introduce a separate typography/panel system for new features.
- Every new journey starts at the ruined sanctuary. The High Priest grants the Familiar during the opening, so do not display it walking beside the protagonist before that story beat.
- Show selected appearance/pet choices clearly. Preview actual game sprites.
- Support narrow screens: wrap choice rows, allow panel scrolling, keep inputs/actions reachable, and keep HUD controls clear of the player as far as practical.

## 9. Sound

- Original quiet lyre/plucked-string character, not copied music from another game. Current music is `sanctuary-dawn.m4a` (4:46, `scripts/compose_sanctuary.py`) and `olivewild-paths.m4a` (4:42, `scripts/compose_olivewild.py`). Both have distinct themes and quiet sections; the forest cue uses a separate brighter harmonic progression. Regional changes crossfade for 800 ms and pause the inactive cue at its current position. `generate_audio.py` is the superseded first synthesized pass and must not overwrite current audio.
- Music must leave room for ambience and interaction sounds. Water volume increases with proximity; distant water and cabin water are silent. No bird audio loop is active. Do not reintroduce the rejected repeating whistle.
- Field recordings and Kenney CC0 foley are documented in `assets/audio/foley/README.md`; retain source/license notices. `scripts/prepare_foley.py` prepares the selected files. Grass, stone and cabin-floor footsteps are different sample sets, cycled without consecutive repeats.
- Lake water should shimmer gently, not flow downstream like the river. Masks must exclude the dock and banks. Door creaks are only for cabin travel, never outdoor map boundaries.
- Distinct short wood, stone, fiber, harvest and travel cues. Footsteps follow actual movement, never held keys against a wall.
- Start playback after a user gesture on web. Provide mute and music controls; preserve preferences. Pause audio in the background and when leaving gameplay.
- No recording permission is needed. Keep microphone/background playback permissions disabled.
- Test audio files for nonzero signal, peaks, duration and loop boundaries; verify actual playback in the running app. Physical-device listening remains a separate QA step.

## 10. Required acceptance checklist

1. Read this guide and select the correct reference category before generating.
2. Produce one asset family or controlled variant at a time. Keep identity, camera, scale, palette and contact points invariant across variants.
3. Inspect the raw sheet: rows, columns, alpha, margins, complete silhouettes, consistent directions and gait order.
4. Integrate it into the actual map beside the player, a pet, a terrain tree and a flower. Inspect at desktop and phone gameplay scale. Do not approve only from the large source image.
5. Inspect a still frame and motion. Check foot/root contact, shadows, palette spill, atlas seams, clipping and sprite jitter. Compare changed palettes and garments.
6. Verify interaction and persistence: pickup once, inventory count, reload, map change, appearance and pet-name save.
7. Run typecheck, lint and relevant behavior tests; export web and native bundles after dependency/render changes. Do not describe native export success as physical-device testing.
8. Record the asset purpose, reference, grid, anchors, animation states and limitations in project documentation. Mark superseded assets explicitly.
9. If it differs in style when placed in-scene, revise it before shipping. Do not excuse the mismatch as “higher quality.”

## 11. Sanctuary inhabitants and recovery poses

- Priest world art: `npcs/priest-walk-v2.png`, 8 × 4, supersedes `priest-walk.png`. Provision keeper Thaleia: `npcs/keeper-walk.png`, 8 × 4. Both use the human family's proportions and direction order. Their contact baselines are in `priest-anchors.json` and `keeper-anchors.json`; regenerate with `scripts/measure_sprite_anchors.py` after art changes.
- Recovery sheet: `hero/recovery.png`, 4 × 2. Columns: short chiton, tied chiton, short cloak, tied cloak. Rows: lying exhausted / sitting recovering. Preserve the same hair and cloth keys and appearance data as walking. `recovery-anchors.json` measures bedroll contact. Never fake recovery by rotating a standing sprite.
- During opening dialogue, hide movement/inventory HUD and frame both participants above the panel on narrow displays. Short landscape screens must retain the action button and allow text scrolling.

## 12. Lake wildlife layers

- `sanctuary-v4.png` supersedes v3 by removing baked fish; living animals must not be painted permanently into terrain. It retains the collision-mapped shoreline, dock and building positions.
- `lake-fish.png`: 4 columns × 2 rows, overhead right-facing carp then perch, four tail phases. Render at 32 world units beneath the water shimmer, with reduced opacity. Keep routes and the entire sprite footprint inside the lake and away from the dock. Match the inventory species, without using side-view inventory icons as swimming sprites.
- Ambient animation time survives menu pauses. Birds must return to their perches continuously, never disappear and restart across the map. Lake surface rings are occasional local disturbances with still intervals, not a perpetual fountain.

## 13. Garden art and persistent growth

- Six marked plots in the western grove. Each soil tile renders at 48 world units; crop cells at 44, with root contact from `crop-anchors.json`. Barley remains below human shoulder height and onion foliage stays smaller. Keep crop roots anchored across growth stages.
- `crops.png`: 4 × 2; barley then onion, seed / shoot / young / ripe. `garden-items.png`: 4 × 2; barley seed, onion seed, harvested barley, harvested onion / unused rejected axe-like tool, watering jug, dry soil, wet soil. Never use cell 4 as a hoe; the separate `hoe.png` is the corrected tool.
- Garden menus use the same game panels and inventory icons. Tools, seeds and crops share inventory/storage/trade. Garden save fields are optional for older saves; never replay the introduction or overwrite existing progress to add gardening.
- Growth happens on sleep only when watered, once per night. Water uses a six-charge jug refilled at the well. Missing a watering delays growth. Harvesting a full stack must leave the mature plant intact.
- Soil correction: render `garden-soil.png` (2 × 1 dry/wet), not cells 6–7 of `garden-items.png`. The older tiles looked like boards at gameplay scale. Soil is a flat ground layer with shallow furrows and irregular edges, never a raised wooden block.

- Foley finish: remove measured DC offsets and inaudible tails, taper both ends to zero, and preserve the useful transient. Bridge, dock and cabin use wood; courtyard uses stone. Choose non-repeating variants without a fixed four-step loop. Cancel pending seek/play callbacks after mute, backgrounding or stopped movement. Gardening uses soil and water cues rather than mining impacts.

## 14. Cabin hearth
- hearth-flame.png is a transparent 4x2 atlas with eight flame phases, rendered at 50 world units and 7 frames/second. Fixed base at cabin (135,202), 89% cell height. It overlays logs beneath the copper pot; do not move the fireplace, logs or furniture to fake fire. Uses the existing paused/background-aware environment clock.
- Built-in image generation prompt: eight equal cells, flame only, warm orange/gold/cream, chunky pixel clusters, fixed center/base, subtle curling tips, transparent margins, no smoke, logs, text or glow halo. Reviewed in the cabin at phone landscape scale.

- Hearth interaction at cabin (135,265) opens cooking. Barley bread uses one harvested barley; thyme infusion uses two thyme. Cooking uses existing item art and panels, consumes bag ingredients only, and preserves ingredients if output is full. Workbench lists torches/rods; food recipes belong at the hearth.

- ItemIcon must map stable item IDs to explicit atlas cells. Never derive sprite cells from inventory display order. The TypeScript mapping must cover every item ID so a new item cannot silently reuse another item's graphic.

- `sanctuary-v5.png` supersedes v4: the central floor mosaic has substantial missing tesserae, broken borders and broad cracks. The floor stays damaged even after the small altar is secured; altar restoration is not a whole-temple rebuild. Preserve the damaged emblem in future terrain edits.

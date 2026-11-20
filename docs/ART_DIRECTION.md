# Historical art production notes

The current mandatory standard is [ASSET_GUIDE.md](ASSET_GUIDE.md). The four-frame human and fine-leaf olive tree described below are superseded by `assets/world/hero/` (8 × 4 sheets with runtime hair/clothing colors and measured foot anchors) and `olive-tree-v2.png`. Retain these notes as production history, not as instructions to restore obsolete assets.

The user's final direction is essentially Stardew Valley's sprite-based style, with slightly finer pixels and richer shading. The initial flat vector graphics and subsequent naturalistic painted graphics were rejected and replaced. Do not return to either of those directions.

## Visual rules

- Orthographic top-down gameplay, no horizon or cinematic perspective.
- Compact human proportions, dark outlines, clearly separated pixel clusters.
- Bright green grass, warm golden paths, blue water, simple readable shading.
- White chiton and blue sash distinguish the player from the map.
- Harvestable plants below knee height; no large shrub used as a tiny flower.
- Original Greek content: olive/pine woodland, marble ruins, amphorae, chiton.
- Preserve open playable space and consistent ground/object scale.

## Asset production

The final PNGs were generated with the built-in imagegen tool, using the user's supplied Stardew Valley gameplay screenshot as a direct style reference. No CLI/API fallback or extracted Stardew Valley sprites were used. All consumed files are stored in this repository.

Final prompt briefs:

1. **olivewild.png:** Replace the reference farm with an original Greek forest in the same pixel-art style: chunky compact shaded sprites, dark outlines, bright grass and golden dirt, no sky or UI. 1536 × 1024. Broad central clearing, narrow blue stream at 78% width, wooden bridge at 51% height, right-edge exit, bottom path, perimeter olive/pine trees, low ruined wall and marble stumps. Finer pixels, not painterly realism.
2. **temple.png:** Replace the reference farm with Greek temple ruins in the same style. Four columns, broken pediment, central small teal/gold mosaic, open golden courtyard, left and bottom paths, tiny plants, perimeter trees/props, upper-right fountain. Same overhead camera, color ramps, sprite scale, and clear negative space.
3. **hero-walk.png:** Transparent 4 × 4 atlas; original compact Greek young man with white chiton, blue sash, belt, sandals, brown hair. Head about one third of height. Front, back, left, right rows; four alternating-foot walk frames in each. Dark outline, simple pixel shading, consistent scale and foot baseline.
4. **pet-walk.png:** Transparent 4 × 4 atlas; dog, cat, fox, owl rows. Four right-facing gait/flap frames per row. Compact pixel sprites, dark outlines, simple shaded colors; mirror for left-facing movement.
5. **sprites.png:** Transparent 4 × 4 scenery atlas matching the same reference. Small thyme/olive/grass/poppy sprites; olive tree/pine/bush/fern; broken column/amphora/rocks/sign; log/daisies/basket/stone. Isolated cells, no text, no ground or grid.

## Atlas coordinates

All sheets are divided into four equal rows and columns at runtime. Sprite components clip the original atlas without destructively editing it.

Hero rows: front, back, left, right. Columns: four walk phases.

Pet rows: dog, cat, fox, owl. Columns: four gait/flap phases.

Scenery cells, left to right:

| Row | 1 | 2 | 3 | 4 |
| --- | --- | --- | --- | --- |
| 1 | Thyme | Olive sapling | Grass | Poppies |
| 2 | Olive tree | Pine tree | Bush | Fern |
| 3 | Column | Amphora | Rocks | Sign |
| 4 | Log | Daisies | Basket | Stone |

Frame phase is tied to distance traveled, not key repeat. Pet following uses stored route samples; environmental effects are separate from the terrain PNGs. Baselines and sizes are calibrated in WorldAssets.tsx.

## Living-world revision

- `pets/boxer.png`: reference-based brindle Boxer, revised to darker chestnut brown; preserve white blaze/chest/paws and black ears/muzzle. Source photo retained in `assets/references/boxer.png`.
- `pets/small-dog.png`: reference-based small tan dog, charcoal floppy ears, pale muzzle and white chest. Photo retained in `assets/references/small-dog.png`. Do not substitute a generic retriever.
- Separate cat, fox and owl atlases. Each pet sheet: front walk, back walk, right walk, then alert/sniff-or-preen/blink/sit idle poses. Left mirrors right. Boxer is larger than the small dog. Legacy saved `Dog` selects the small dog.
- `flowers.png`: poppy, cornflower, daisy, thyme rows, four fixed-root wind poses each. Only stems and flowers bend. Still intervals separate gusts. Decorative flowers are 17–23 world units versus the 76-unit hero cell.
- `olive-tree.png`: recognizable lanceolate silver-green foliage with green and purple-black olives. Temple harvest nodes are persistent trees; harvested nodes receive a basket marker. The generic herb no longer represents olives.
- `water.png`: seamless turquoise pixel texture. Two downstream layers move at different speeds, masked to river/fountain interiors. Bridge, banks and rock islands remain static. Rock wakes and fountain droplets are separate effects.
- `wildlife.png`: orange/blue butterfly wing phases, songbird flight and perched poses. Butterflies remain near flowers; sparse birds alternate crossing and resting.
- `dragonflies.png`: blue and red dragonfly wing phases, eight per color. Corrected transparent background. Short eased darts alternate with hovering near water.
- `olympus-title.png`: original pixel-art Olympus sky, clouds, mountains and marble temples. Creation uses a centered ochre framed game panel, not a split website landing page.

All new raster assets used built-in imagegen. The Boxer correction changed the brown palette only. Runtime animation crops original sheets without raster modification. `src/sprite-anchors.json` records alpha-bound contact baselines measured with Pillow (analysis only) so the player and grounded companions meet their small contact shadows. Owl flight alone has intentional elevation. Large baked terrain trees remain static; do not rotate an entire tree or terrain image to imply wind.

The native exports are build checks, not physical Android/iOS performance certification. Four-frame directional cycles and four held idle poses are an extensible prototype, not a complete skeletal animation system.

# Final art direction

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

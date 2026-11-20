# Foley sources

Selected sounds by Kenney, released under Creative Commons Zero (CC0).

- https://kenney.nl/assets/impact-sounds — four grass, concrete and wood-floor footsteps, light wood impact and mining impact.
- https://kenney.nl/assets/rpg-audio — cloth handling, coins and door opening.

Downloaded from the publisher on 20 November 2026. Selected Ogg files were decoded to PCM 16-bit WAV for consistent browser/iOS/Android playback. Transient cleanup is described below. Runtime volume controls set the mix.

Original license notices are included alongside these files. Attribution is not required by CC0, but the game credits Kenney.

## Field recordings

- `stream-field.wav`: “Waterflow Sound” by TyberiusGames, CC0, https://opengameart.org/content/waterflow-sound . Self-sampled water flow; filtered and reduced in level for near-river playback.
- `../lakeshore.m4a`: “Sea and river wave sounds” by RandomMind, CC0, https://opengameart.org/content/sea-and-river-wave-sounds . Five-minute recording of waves on the Vistula river, used quietly beside the sanctuary lake. Filtered, reduced in level, and encoded to AAC. Source `VistulaShort.mp3`.
- CC0 dedication: https://creativecommons.org/publicdomain/zero/1.0/

Prepared with `scripts/prepare_foley.py`. These replace the initial synthesized bird/water/footstep pass; no repeating bird-call track is active.

## Transient cleanup and garden cues

`prepare_foley.py` removes the measured DC tail offset from impact/step recordings, trims inaudible tails, applies 2 ms onset and 18 ms release ramps, and limits peaks to 0.88. It retains the recorded impact/decay and does not change pitch. Footsteps now last approximately 0.085–0.175 seconds, with zero-valued endpoints.

`soil-work.wav` adapts Kenney's grass scuff for working soil. `water-action.wav` is a short, filtered, faded excerpt of TyberiusGames' CC0 water recording for watering/refilling; it is not a synthetic noise burst. These cues share the effects volume control.

The river loop uses a 600 ms equal-power tail/head crossfade instead of separate fade-out/fade-in ramps. The resulting loop is approximately 5.07 seconds. This removes the repeated near-silent tail while retaining the recorded water texture; no synthetic noise is added.

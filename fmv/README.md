# Cutscene footage

Anything you put in this folder replaces the game's own artwork in the campaign films.
The ten character portraits (`*.webp`) are bundled already. Add more files to replace any shot, or
replace a portrait with a video clip of the same name. A missing file falls back to the drawn version.

## How it works

- **Characters:** `fmv/<character>.<ext>` is used for every close-up of that character,
  e.g. `fmv/reyes.jpg` or `fmv/draganov.mp4`.
- **Whole shots:** `fmv/<film>_<shot>.<ext>` replaces one complete shot,
  e.g. `fmv/prologue_06.mp4` for the meteor strike. The full list is in `PROMPTS.md`.
- **Formats:** `.mp4`, `.webm`, `.webp`, `.jpg` or `.png`. The game checks in that order.
- **Cut-outs:** images with a transparent background stand in the war room with a faction rim light.
- **Stills:** photos get a slow push-in so they don't sit frozen.
- **Clips:** videos loop, muted, while the game's voice reads the line.
- **Shape:** landscape 16:9 works best (1280×720 is plenty). The frame is cropped to fill.

Character ids: `reyes`, `hale`, `ghost`, `marsh`, `draganov`, `volkova`, `bogdan`,
`reaper`, `voice`, `senna`, `phantom`.

See `PROMPTS.md` for ready-made prompts that produce a consistent, late-1990s live-action FMV cast
with an AI image or video generator.

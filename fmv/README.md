# Cutscene footage

Anything you put in this folder replaces the game's own artwork in the campaign films.
Nothing here is required: a missing file just falls back to the drawn version.

## How it works

- **Characters:** `fmv/<character>.<ext>` is used for every close-up of that character,
  e.g. `fmv/reyes.jpg` or `fmv/draganov.mp4`.
- **Whole shots:** `fmv/<film>_<shot>.<ext>` replaces one complete shot,
  e.g. `fmv/prologue_06.mp4` for the meteor strike. The full list is in `PROMPTS.md`.
- **Formats:** `.mp4`, `.webm`, `.jpg`, `.png` or `.webp`. The game checks in that order.
- **Stills:** photos get a slow push-in so they don't sit frozen.
- **Clips:** videos loop, muted, while the game's voice reads the line.
- **Shape:** landscape 16:9 works best (1280×720 is plenty). The frame is cropped to fill.

Character ids: `reyes`, `hale`, `ghost`, `marsh`, `draganov`, `volkova`, `bogdan`,
`reaper`, `voice`, `senna`, `phantom`.

See `PROMPTS.md` for ready-made prompts that produce a consistent, Red Alert 2–style cast
with an AI image or video generator.

# Frontier Command

A real-time strategy game that runs entirely in the browser — no build step, no server, no dependencies to *play* it. The whole game (rendering, AI, audio, multiplayer-style skirmish setup, a first-person mode, and more) lives in a single `index.html` file, which stays a committed, directly-playable artifact regardless of how the source is organized.

Three factions, a dozen maps, a full tech tree of infantry/vehicles/aircraft/naval units, and a faction-specific campaign.

## Play it

Open **[index.html](index.html)** directly in a browser, or serve the folder with any static file server, e.g.:

```
python3 -m http.server 8000
```

then visit `http://localhost:8000/`.

## Install it as an app

This is a [Progressive Web App](https://web.dev/progressive-web-apps/) — once it's hosted somewhere over HTTPS (for example via GitHub Pages), your browser will offer to install it like a native app:

- **Desktop (Chrome/Edge):** click the install icon in the address bar, or the menu → *Install Frontier Command*.
- **Android (Chrome):** menu → *Add to Home screen* / *Install app*.
- **iOS (Safari):** Share → *Add to Home Screen*.

Once installed it opens in its own window, gets its own icon, and keeps working offline (it caches itself via a service worker on first load).

### Hosting it via GitHub Pages

1. Repo **Settings → Pages**.
2. Under **Source**, choose *Deploy from a branch*.
3. Pick the branch this file lives on, folder `/ (root)`.
4. Save — GitHub will publish it at `https://<owner>.github.io/<repo>/`.

## Project layout

- `index.html` — the entire game, ready to open. This file is a **build
  output**: most of it is still one big inline `<script>`, but pieces are
  being incrementally moved into `src/` and get bundled back in here. It's
  committed to the repo so cloning and opening it (or hosting it as-is via
  GitHub Pages) always works, with nothing to install.
- `src/` — the source of truth for any part of the game that's been
  modularized so far: `src/gamedata.js` (buildings/units/factions/difficulty
  data tables and their lookup helpers), `src/audio.js` (the audio
  engine — sfx, music, rain ambience, thunder), `src/cards.js` (the build
  menu — rendering, tab switching, clicking to queue/place, unit
  deploy), `src/saveload.js` (serializing/restoring game state, the
  localStorage save-slot helpers), `src/campaigns.js` (the
  mission-briefing tree and the launch/outcome/unlock flow that drives a
  campaign match), `src/abilities.js` (the superweapon/spy
  plane/paradrop/EMP system), `src/ai.js` (the skirmish AI's base
  expansion, army composition, and micro decisions), `src/render.js`
  (the Three.js engine bootstrap, terrain/sky/weather builders, and the
  main render loop), `src/models.js` (every unit/building/prop model
  builder, the shared camera/canvas/projection state they run on, and
  optional external GLTF/GLB asset loading via `registerModelAsset()` as
  a drop-in alternative to a procedural model, with graceful fallback),
  `src/fps.js` (first-person mode: entering/exiting, movement and
  aiming, the procedural weapon viewmodels, building interiors for
  garrisoned infantry, and the `fpsRender()` draw loop), and
  `src/render2d.js` (the isometric terrain/tile baking, per-entity 2D
  drawing for units/buildings/props/projectiles/effects, the minimap,
  the screen-space HUD overlay, and the main render loop, alongside the
  garrison/deploy/air-cargo/capture/Tiberium-growth logic that lived in
  the same span of the original file). `src/index.template.html` is the
  same document with
  each of those replaced by a marker (`<script>/* BUNDLE:<name> */</script>`) that the
  build step fills in.
- `package.json`, `scripts/build.mjs` — a small [esbuild](https://esbuild.github.io/)-based
  build script. It auto-discovers every `BUNDLE:<name>` marker in the
  template and bundles the matching `src/<name>.js` into it, so extracting
  a new subsystem is just adding a `src/<name>.js` + a matching marker — no
  build-script changes needed. It's a dev-time convenience only — the
  exported game has zero runtime dependencies either way.
- `manifest.webmanifest` — PWA metadata (name, icons, colors, display mode).
- `sw.js` — the service worker that caches the app for offline play.
- `icons/` — app icons used by the manifest.

## Developing

If you're only playing, ignore this section — `index.html` always works
standalone. If you're editing a part of the game that's been moved into
`src/` (game data, audio, the build-card UI, save/load, campaigns, abilities, the AI, the core renderer, the 3D model library, FPS mode, and the 2D top-down renderer, for now; more subsystems will move over time), edit the file
under `src/` and rebuild:

```
npm install
npm run build   # regenerates index.html once
npm run watch   # regenerates index.html on every src/ change
```

Anything not yet under `src/` still lives directly in `index.html`'s
remaining inline `<script>` blocks — edit those in place as before, no
build step needed for that part.

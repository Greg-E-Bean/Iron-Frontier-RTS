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
  output**, regenerated from `src/` (see below). It's committed to the repo
  so cloning and opening it (or hosting it as-is via GitHub Pages) always
  works, with nothing to install.
- `src/` — the source of truth for the game logic, split into one file per
  subsystem:
  - `src/gamedata.ts` — buildings/units/factions/difficulty data tables and
    their lookup helpers.
  - `src/sim.ts` — the core simulation: the map/game-state data, procedural
    map generation, A* pathfinding, building/unit lifecycle, production,
    orders, combat, unit-role ticks, and fog of war.
  - `src/ai.ts` — the skirmish AI's base expansion, army composition, and
    micro decisions.
  - `src/models.ts` — every unit/building/prop model builder, the shared
    camera/canvas/projection state they run on, and optional external
    GLTF/GLB asset loading via `registerModelAsset()` as a drop-in
    alternative to a procedural model, with graceful fallback.
  - `src/render2d.ts` — the isometric terrain/tile baking, per-entity 2D
    drawing for units/buildings/props/projectiles/effects, the minimap, and
    the screen-space HUD overlay.
  - `src/render.ts` — the Three.js engine bootstrap and the
    terrain/sky/weather builders.
  - `src/fps.ts` — first-person mode: entering/exiting, movement and
    aiming, the procedural weapon viewmodels, building interiors for
    garrisoned infantry, and the `fpsRender()` draw loop.
  - `src/audio.ts` — the audio engine: sfx, music, rain ambience, thunder.
  - `src/cards.ts` — the build menu: rendering, tab switching, clicking to
    queue/place, unit deploy.
  - `src/ui.ts` — canvas pointer/keyboard input (pan/zoom/box-select/
    tap-to-command), the game-setup menu, the pause/settings/game-over
    screens, and `startGame()`.
  - `src/saveload.ts` — serializing/restoring game state, the localStorage
    save-slot helpers.
  - `src/campaigns.ts` — the mission-briefing tree and the
    launch/outcome/unlock flow that drives a campaign match.
  - `src/loop.ts` — `frame()`/`step()`, the requestAnimationFrame loop and
    per-tick simulation driver everything else runs through, plus wall/gate
    mechanics, the campaign/save-game menu screens, and FPS-mode touch
    controls.
  - `src/abilities.ts` — the superweapon/spy plane/paradrop/EMP system.

  Each module is TypeScript, type-checked against `src/types.ts` (the core
  data model — `Unit`, `Building`, `Player`, `GameState`, `MapData`,
  `EntityDef`, `GameConfig`) and `src/globals.d.ts` (ambient declarations
  for the cross-module symbol table every module shares at runtime — see
  "Developing" below for why that split exists). `src/index.template.html`
  is the same document with each module replaced by a marker
  (`<script>/* BUNDLE:<name> */</script>`) that the build step fills in. A
  small prelude of shared constants (map/world dimensions, `clamp`/`dist`)
  stays inline ahead of the first marker, along with the bundled Three.js
  library itself.
- `package.json`, `scripts/build.mjs` — a small [esbuild](https://esbuild.github.io/)-based
  build script. It auto-discovers every `BUNDLE:<name>` marker in the
  template and bundles the matching `src/<name>.ts` into it (esbuild
  strips the TypeScript types as part of bundling — it doesn't type-check),
  so extracting a new subsystem is just adding a `src/<name>.ts` + a
  matching marker — no build-script changes needed. It's a dev-time
  convenience only — the exported game has zero runtime dependencies
  either way.
- `tsconfig.json` — `strict: false` / `noImplicitAny: false`. This
  codebase was written across many sessions as dense, single-letter-
  variable JS with no type discipline; the type layer targets the core
  data model specifically (see `src/types.ts` above), not every function
  signature in the file.
- `manifest.webmanifest` — PWA metadata (name, icons, colors, display mode).
- `sw.js` — the service worker that caches the app for offline play.
- `icons/` — app icons used by the manifest.

## Developing

If you're only playing, ignore this section — `index.html` always works
standalone. To change any game logic, edit the relevant file under `src/`
(see the list above) and rebuild:

```
npm install
npm run build       # regenerates index.html once
npm run watch       # regenerates index.html on every src/ change
npm run typecheck   # tsc --noEmit - the actual type check (build doesn't check types)
npm test            # runs the regression suite against a fresh build (see below)
```

### Testing

`tests/*.spec.ts` is a [Playwright](https://playwright.dev/) regression suite
that drives the actual built `index.html` through its own runtime API — map
generation, the skirmish AI, FPS mode, save/load, campaigns, the build-menu
cards, superweapon abilities, audio, the PWA service worker, and the optional
GLTF/GLB asset loader — via `page.evaluate()` calls into `window.startGame()`,
`step()`, `S`, `cfg`, and friends, rather than by clicking through the DOM.
`npm test` starts a static server over the repo root (`scripts/serve.mjs`) and
runs the suite against it; run `npm run build` first if you've changed
anything under `src/`. Tests run serially (`workers: 1` in
`playwright.config.ts`) — several of them drive hundreds of real sim ticks or
full WebGL/WebAudio frames through a software renderer, and running them
concurrently starves each other on a constrained CPU rather than actually
finishing faster.

Pushes and pull requests run this suite in GitHub Actions
(`.github/workflows/ci.yml`), along with `npm run build` (checking the
regenerated `index.html` is committed and up to date with `src/`) and
`npm run typecheck`.

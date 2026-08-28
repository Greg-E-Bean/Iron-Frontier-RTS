# Frontier Command

A real-time strategy game that runs entirely in the browser — no build step, no server, no dependencies. The whole game (rendering, AI, audio, multiplayer-style skirmish setup, a first-person mode, and more) lives in a single `index.html` file.

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

- `index.html` — the entire game.
- `manifest.webmanifest` — PWA metadata (name, icons, colors, display mode).
- `sw.js` — the service worker that caches the app for offline play.
- `icons/` — app icons used by the manifest.

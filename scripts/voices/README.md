# Voice bank

All scripted speech (campaign radio, briefings, debriefs, loading-screen objective read-outs,
cutscene narration and dialogue, unit acknowledgements and faction announcers) is pre-recorded
with the **Kokoro-82M** neural voice model (Apache-2.0) and shipped in `voice/`.
`voice/manifest.json` maps `"<voice>|<line text>"` to `[file, seconds]`.
At runtime `speakLine` plays the recording (through a radio filter for comms, clean in films).
Any line without a recording falls back to the browser's speech engine.

## Re-recording after changing dialogue

1. Dump the current line list. Open the game in a browser and run this in the console:
   `copy(JSON.stringify({units: voiceBankList(), cast: castLineList()}))`
   Paste the result into `voice-lines.json`.
2. Install the tools once:
   `npm i sherpa-onnx-node n8n-nodes-ttsbro` (the latter bundles `kokoro-int8-en-v0_19`)
   and `pip install imageio-ffmpeg`.
3. Record:
   `KOKORO_DIR=node_modules/n8n-nodes-ttsbro/kokoro-int8-en-v0_19 node scripts/voices/record.cjs voice-lines.json`

Only new or changed lines are recorded. Stale entries can be removed by deleting `voice/` and
recording everything again.

## Casting

The table in `record.cjs` sets each voice's Kokoro speaker, pitch and pace.
- Syndicate voices get a chorus effect, and the Voice also gets an echo.
- Unit voices are grouped by accent and gender (`us_m`, `gb_f`, `ru_m`, `hive_m`, …) to match
  the personas in `src/audio.ts`.

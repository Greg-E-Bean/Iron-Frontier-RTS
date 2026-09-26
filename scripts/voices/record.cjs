#!/usr/bin/env node
// Records the voice bank: every line in voice-lines.json is synthesised with
// the Kokoro-82M neural voice model (via sherpa-onnx), pitched/paced per
// character, cleaned up (trim, compress, loudness-normalise, hive effects for
// the Syndicate) and encoded to voice/<hash>.mp3, with voice/manifest.json
// mapping "vox|text" -> [file, seconds].
//
// Setup (once):
//   npm i sherpa-onnx-node n8n-nodes-ttsbro   # the latter ships kokoro-int8-en-v0_19
//   pip install imageio-ffmpeg
// Run:  KOKORO_DIR=<path to kokoro-int8-en-v0_19> node scripts/voices/record.cjs voice-lines.json
// Lines already in the manifest are skipped, so reruns only record what changed.
const fs = require("fs"), path = require("path"), cp = require("child_process");
const sherpa = require("sherpa-onnx-node");
const ROOT = path.join(__dirname, "..", ".."), OUT = path.join(ROOT, "voice");
const M = process.env.KOKORO_DIR.replace(/\/?$/, "/");
const FFMPEG = process.env.FFMPEG || cp.execSync(`python3 -c "import imageio_ffmpeg as f;print(f.get_ffmpeg_exe())"`).toString().trim();
// Kokoro v0.19 speakers: 0 af, 1 af_bella, 2 af_nicole, 3 af_sarah, 4 af_sky,
// 5 am_adam, 6 am_michael, 7 bf_emma, 8 bf_isabella, 9 bm_george, 10 bm_lewis
// [speaker, pitch in semitones, pace, effect]
const VOX = {
  c_narr: [9, -1.5, .92], c_reyes: [7, 0, .97], c_hale: [6, 0, 1.02], c_ghost: [2, 0, 1], c_marsh: [10, .5, 1.02],
  c_draganov: [5, -3, .9], c_volkova: [8, -1, .95], c_bogdan: [10, -2.5, 1], c_reaper: [5, -5, .88],
  c_voice: [9, -4.5, .86, "hive"], c_senna: [4, .5, .95, "hivelight"], c_phantom: [1, -1.5, .95, "hivelight"],
  us_m: [6, -.5, 1.05], us_f: [3, 0, 1.05], gb_m: [9, 0, 1.03], gb_f: [7, .5, 1.02], gb2_m: [10, 0, 1.05], gb2_f: [8, .5, 1.03],
  ru_m: [5, -1.5, .95], ru_f: [8, -1.5, .98], hive_m: [9, -3.5, .9, "hivelight"], hive_f: [1, -1, .95, "hivelight"],
};
const FX = {
  hive: "chorus=0.6:0.9:50|60:0.4|0.32:0.25|0.4:2|2.3,aecho=0.8:0.6:45:0.22,",
  hivelight: "chorus=0.7:0.9:40:0.3:0.3:2,",
};
const fnv = s => { let h = 2166136261; for (const c of Buffer.from(s)) h = Math.imul(h ^ c, 16777619) >>> 0; return h.toString(36); };
const src = JSON.parse(fs.readFileSync(process.argv[2]));
const items = src.cast.map(x => ({ vox: "c_" + x.who, text: x.text })).concat(src.units);
fs.mkdirSync(OUT, { recursive: true });
const manPath = path.join(OUT, "manifest.json"), man = fs.existsSync(manPath) ? JSON.parse(fs.readFileSync(manPath)) : {};
const tts = new sherpa.OfflineTts({ model: { kokoro: { model: M + "model.int8.onnx", voices: M + "voices.bin", tokens: M + "tokens.txt", dataDir: M + "espeak-ng-data" }, numThreads: 4, debug: false }, maxNumSentences: 1 });
const tmp = path.join(require("os").tmpdir(), "vox_raw.wav"), tmp2 = path.join(require("os").tmpdir(), "vox_fx.wav");
let done = 0, t0 = Date.now();
for (const it of items) {
  const key = it.vox + "|" + it.text, cfg = VOX[it.vox];
  if (!cfg) { console.warn("no voice for", it.vox); continue; }
  if (man[key] && fs.existsSync(path.join(OUT, man[key][0]))) { done++; continue; }
  const [sid, semis, pace, fx] = cfg, f = Math.pow(2, semis / 12);
  // speak a little faster by f, then resample down by f: lower pitch, same pace
  const a = tts.generate({ text: it.text, sid, speed: pace / f });
  sherpa.writeWave(tmp, { samples: a.samples, sampleRate: a.sampleRate });
  const chain = `asetrate=${Math.round(a.sampleRate * f)},aresample=24000,highpass=f=70,${FX[fx] || ""}` +
    "silenceremove=start_periods=1:start_threshold=-48dB,areverse,silenceremove=start_periods=1:start_threshold=-48dB,areverse," +
    "acompressor=threshold=-20dB:ratio=3:attack=5:release=90,loudnorm=I=-16:TP=-1.5:LRA=7,apad=pad_dur=0.08";
  cp.execFileSync(FFMPEG, ["-y", "-loglevel", "error", "-i", tmp, "-af", chain, "-ac", "1", "-ar", "24000", tmp2]);
  const secs = (fs.statSync(tmp2).size - 44) / 2 / 24000;
  const file = fnv(key) + ".mp3";
  cp.execFileSync(FFMPEG, ["-y", "-loglevel", "error", "-i", tmp2, "-ac", "1", "-ar", "24000", "-c:a", "libmp3lame", "-b:a", "40k", path.join(OUT, file)]);
  man[key] = [file, Math.round(secs * 100) / 100];
  if (++done % 10 === 0) { fs.writeFileSync(manPath, JSON.stringify(man)); console.log(done + "/" + items.length, ((Date.now() - t0) / 1000 | 0) + "s"); }
}
fs.writeFileSync(manPath, JSON.stringify(man));
console.log("done", done, "lines in", ((Date.now() - t0) / 1000 | 0) + "s");

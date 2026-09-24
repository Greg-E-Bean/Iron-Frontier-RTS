export {};
let AC=null,masterGain=null,sfxBus=null,muted=(()=>{try{return"1"===localStorage.getItem("ifr_muted")}catch(e){return!1}})(),masterVol=(()=>{try{const e=localStorage.getItem("ifr_masterVol");return null===e?1:+e}catch(e){return 1}})(),sfxVol=(()=>{try{const e=localStorage.getItem("ifr_sfxVol");return null===e?1:+e}catch(e){return 1}})(),musicVol=(()=>{try{const e=localStorage.getItem("ifr_musicVol");return null===e?1:+e}catch(e){return 1}})(),trackSel=(()=>{try{const e=localStorage.getItem("ifr_track");return null===e?-1:+e}catch(e){return-1}})(),musicBus=null,playTrackRef=null;function setMasterVol(e){masterVol=e,masterGain&&!muted&&(masterGain.gain.value=e),customTrackEl&&(customTrackEl.volume=muted?0:e*musicVol);try{localStorage.setItem("ifr_masterVol",""+e)}catch(t){}}function setSfxVol(e){sfxVol=e,sfxBus&&(sfxBus.gain.value=e);try{localStorage.setItem("ifr_sfxVol",""+e)}catch(t){}}function setMusicVol(e){musicVol=e,musicBus&&(musicBus.gain.value=MUSIC_BASE*e),customTrackEl&&(customTrackEl.volume=muted?0:masterVol*e);try{localStorage.setItem("ifr_musicVol",""+e)}catch(t){}}function setTrackSel(e){trackSel=e;try{localStorage.setItem("ifr_track",""+e)}catch(t){}musicOn&&e>=0&&playAnyTrack(e)}

// ------------------------------------------------------------------ engine
// Everything plays through: sources -> sfxBus/musicBus -> master -> limiter.
// Sounds are synthesised from shared noise buffers and oscillators with
// short linear attacks and exponential tails, so nothing clicks or chirps.
const MUSIC_BASE = .7;
let limiter: any = null, verbIn: any = null, NOISE: any = null, BROWN: any = null;
function makeImpulse(ac: any, dur: number, decay: number, pre?: number) {
  const len = Math.floor(ac.sampleRate * dur), pd = Math.floor(ac.sampleRate * (pre || 0)), b = ac.createBuffer(2, len, ac.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = b.getChannelData(ch); let lp = 0;
    for (let i = pd; i < len; i++) { const x = (2 * Math.random() - 1) * Math.pow(1 - (i - pd) / (len - pd), decay); lp += (x - lp) * (.35 + .5 * (1 - i / len)); d[i] = lp; }
  }
  return b;
}
function audio() {
  if (!AC) try {
    AC = new ((window as any).AudioContext || (window as any).webkitAudioContext);
    masterGain = AC.createGain(), masterGain.gain.value = muted ? 0 : masterVol;
    limiter = AC.createDynamicsCompressor(), limiter.threshold.value = -9, limiter.knee.value = 8, limiter.ratio.value = 10, limiter.attack.value = .003, limiter.release.value = .22;
    masterGain.connect(limiter), limiter.connect(AC.destination);
    sfxBus = AC.createGain(), sfxBus.gain.value = sfxVol, sfxBus.connect(masterGain);
    verbIn = AC.createConvolver(), verbIn.buffer = makeImpulse(AC, 1.6, 3, .01);
    const vg = AC.createGain(); vg.gain.value = .8, verbIn.connect(vg), vg.connect(sfxBus);
    const sr = AC.sampleRate;
    NOISE = AC.createBuffer(1, 2 * sr, sr); { const d = NOISE.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = 2 * Math.random() - 1; }
    BROWN = AC.createBuffer(1, 2 * sr, sr); { const d = BROWN.getChannelData(0); let l = 0; for (let i = 0; i < d.length; i++) l = (l + .02 * (2 * Math.random() - 1)) / 1.02, d[i] = 3.5 * l; }
  } catch (e) { }
  return AC;
}
const sOK = () => !!audio() && !muted && sfxVol > 0;
const vr = (x: number, a: number) => x * (1 + a * (2 * Math.random() - 1));
function sEnv(g: any, t: number, a: number, d: number, peak: number) {
  g.gain.setValueAtTime(0, t), g.gain.linearRampToValueAtTime(peak, t + a), g.gain.exponentialRampToValueAtTime(1e-4, t + a + d);
}
let _dist: any = null;
function sOut(node: any, o: any) {
  let n = node;
  if (o.dist) { const w = AC.createWaveShaper(); if (!_dist) { _dist = new Float32Array(1024); for (let i = 0; i < 1024; i++) { const x = i / 512 - 1; _dist[i] = Math.tanh(2.6 * x); } } w.curve = _dist, n.connect(w), n = w; }
  let p = n;
  if (o.pan && AC.createStereoPanner) { p = AC.createStereoPanner(), p.pan.value = o.pan, n.connect(p); }
  p.connect(o.dest || sfxBus);
  if (o.verb) { const s = AC.createGain(); s.gain.value = o.verb, p.connect(s), s.connect(verbIn); }
}
// Filtered noise burst. o: {type,f,f2,q,g,a,d,pan,verb,dist,rate,brown}
function sNoise(t: number, o: any) {
  const src = AC.createBufferSource(); src.buffer = o.brown ? BROWN : NOISE, src.playbackRate.value = o.rate || 1;
  const f = AC.createBiquadFilter(); f.type = o.type || "lowpass", f.Q.value = o.q || .8, f.frequency.setValueAtTime(o.f || 1000, t);
  o.f2 && f.frequency.exponentialRampToValueAtTime(o.f2, t + (o.a || .003) + (o.d || .1));
  // filtered noise loses energy with bandwidth; normalise so gains mean loudness
  const ty = o.type || "lowpass", bw = "lowpass" === ty ? o.f || 1000 : "highpass" === ty ? 22050 - (o.f || 1000) : (o.f || 1000) / (o.q || .8), nrm = o.brown ? 1.6 : Math.max(1, Math.min(7, Math.sqrt(11025 / Math.max(50, bw))));
  const g = AC.createGain(); sEnv(g, t, o.a || .003, o.d || .1, (o.g || .1) * nrm);
  src.connect(f), f.connect(g), sOut(g, o);
  src.start(t, Math.random() * 1.5), src.stop(t + (o.a || .003) + (o.d || .1) + .05);
}
// Oscillator with pitch sweep. o: {w,f,f2,g,a,d,pan,verb,dist,lp,det}
function sOsc(t: number, o: any) {
  const s = AC.createOscillator(); s.type = o.w || "sine", s.frequency.setValueAtTime(o.f, t), o.det && (s.detune.value = o.det);
  o.f2 && s.frequency.exponentialRampToValueAtTime(Math.max(20, o.f2), t + (o.a || .003) + (o.sw || o.d || .1));
  const g = AC.createGain(); sEnv(g, t, o.a || .003, o.d || .1, o.g || .1);
  let n: any = s;
  if (o.lp) { const f = AC.createBiquadFilter(); f.type = "lowpass", f.frequency.value = o.lp, s.connect(f), n = f; }
  n.connect(g), sOut(g, o);
  s.start(t), s.stop(t + (o.a || .003) + (o.d || .1) + .05);
}
// Legacy helpers kept for callers elsewhere; now enveloped and click-free.
function tone(e: number, t: number, r?: any, n?: number, a?: number) { if (!sOK()) return; sOsc(AC.currentTime + .002, { w: "square" === r ? "triangle" : r || "sine", f: e, f2: a, g: .8 * (n || .06), d: t, lp: 3000 }); }
function noise(e: number, t?: number, r?: number) { if (!sOK()) return; sNoise(AC.currentTime + .002, { f: r || 900, g: t || .08, d: e }); }

let rainSrc=null,rainGain=null,windSrc=null,windGain=null;function startFpsAmbience(){const ac=audio();if(!ac||windSrc)return;const len=2*ac.sampleRate,buf=ac.createBuffer(1,len,ac.sampleRate),d=buf.getChannelData(0);for(let i=0;i<len;i++)d[i]=2*Math.random()-1;const src=ac.createBufferSource();src.buffer=buf,src.loop=!0;const lp=ac.createBiquadFilter();lp.type="lowpass",lp.frequency.value=340;const g=ac.createGain();g.gain.value=0,src.connect(lp),lp.connect(g),g.connect(sfxBus),src.start(),g.gain.setTargetAtTime(.1,ac.currentTime,2),windSrc=src,windGain=g}function stopFpsAmbience(){if(!windSrc)return;const ac=audio();if(ac){const t0=ac.currentTime;windGain.gain.cancelScheduledValues(t0),windGain.gain.setTargetAtTime(0,t0,.8)}const s=windSrc;setTimeout(()=>{try{s.stop()}catch(e){}},1500),windSrc=null,windGain=null}
function setRainAmbience(on){const ac=audio();if(!ac)return;if(on&&!rainSrc){const len=2*ac.sampleRate,buf=ac.createBuffer(1,len,ac.sampleRate),d=buf.getChannelData(0);for(let i=0;i<len;i++)d[i]=2*Math.random()-1;const src=ac.createBufferSource();src.buffer=buf,src.loop=!0;const hp=ac.createBiquadFilter();hp.type="highpass",hp.frequency.value=650;const lp=ac.createBiquadFilter();lp.type="lowpass",lp.frequency.value=3800;const g=ac.createGain();g.gain.value=0,src.connect(hp),hp.connect(lp),lp.connect(g),g.connect(sfxBus),src.start(),g.gain.setTargetAtTime(.28,ac.currentTime,1.4),rainSrc=src,rainGain=g}else if(!on&&rainSrc){const t0=ac.currentTime;rainGain.gain.cancelScheduledValues(t0),rainGain.gain.setTargetAtTime(0,t0,.6);const s=rainSrc;setTimeout(()=>{try{s.stop()}catch(e){}},1200),rainSrc=null,rainGain=null}}


// ------------------------------------------------------------------ voices
// Vanguard: crisp feminine English. Legion: Russian / Eastern-European — a
// Russian system voice reads phonetic Cyrillic spellings, giving accented
// English with a few real Russian phrases. Syndicate: a deep, slow, gravelly
// male delivery. Lines are split by unit class so tanks don't answer like
// riflemen.
let sfxBudget = 0;
type Line = string | [string, string];
const VOICE_LINES: any = {
  allied: {
    inf: { sel: ["Squad ready.", "Go ahead, Commander.", "Vanguard infantry, standing by.", "What's the plan?", "Ready when you are.", "Eyes open, Commander."], go: ["Moving.", "Copy that, moving out.", "On my way.", "Heading there now.", "Understood.", "Relocating."] },
    veh: { sel: ["Armour online.", "Crew ready, Commander.", "Systems green.", "Engines warm.", "Vanguard armour, standing by."], go: ["Rolling out.", "Advancing.", "Moving to position.", "Copy, on the move.", "Tracks turning."] },
    air: { sel: ["Flight ready.", "Wings up, awaiting vector.", "Pilot here.", "Airspace looks clear."], go: ["Vector received.", "Inbound.", "On approach.", "Banking now."] },
    sea: { sel: ["Helm ready.", "Bridge here.", "Vessel standing by."], go: ["Setting course.", "Full ahead.", "Underway."] },
    sup: { sel: ["Construction crew standing by.", "Ready to deploy.", "Logistics, go ahead."], go: ["Relocating.", "Moving the convoy.", "En route."] },
    hero: { sel: ["You called?", "Let's make this quick.", "Ready for anything."], go: ["I'm on it.", "Leave it to me.", "Watch this."] },
    unit: ["Unit ready.", "Reinforcements have arrived.", "New unit reporting in."],
    ready: ["Construction complete.", "Structure ready.", "Building ready for placement."],
    ann: { underAttack: "Warning. Our base is under attack.", unitLost: "Unit lost.", funds: "Insufficient funds.", radarOn: "Radar online.", radarOff: "Radar offline.", strike: "Strike inbound.", deployed: "Construction yard deployed.", captured: "Building captured." },
  },
  soviet: {
    inf: { sel: [["Da, komandir?", "Да, командир?"], ["Ready for orders.", "Рэди фор ордерс."], ["Comrade, I listen.", "Камрад, ай лисэн."], ["Legion stands ready.", "Лиджэн стэндс рэди."], ["Speak, commander.", "Спик, коммандэр."]], go: [["Moving out.", "Мувинг аут."], ["For the Motherland!", "Фор зэ мазэрлэнд!"], ["As ordered.", "Эз ордэрд."], ["Davai, davai!", "Давай, давай!"], ["We march.", "Ви марч."]] },
    veh: { sel: [["Tank is ready, comrade.", "Тэнк из рэди, камрад."], ["Engine is warm.", "Энджин из ворм."], ["Armour of the Legion.", "Армор оф зэ лиджэн."], ["Da, komandir.", "Да, командир."]], go: [["Rolling forward.", "Роллинг форвэрд."], ["Crushing through.", "Крашинг сру."], ["Vperyod!", "Вперёд!"], ["Advancing, comrade.", "Эдвансинг, камрад."]] },
    air: { sel: [["Pilot ready.", "Пайлот рэди."], ["Wings of the Legion.", "Вингз оф зэ лиджэн."]], go: [["Flying now.", "Флайинг нау."], ["On course.", "Он корс."]] },
    sea: { sel: [["Ship is ready.", "Шип из рэди."], ["Captain here.", "Кэптэн хиа."]], go: [["Full speed.", "Фул спид."], ["Sailing.", "Сэйлинг."]] },
    sup: { sel: [["Engine idling, comrade.", "Энджин айдлинг, камрад."], ["Ready to build.", "Рэди ту билд."]], go: [["Moving slowly.", "Мувинг слоули."], ["Convoy moving.", "Конвой мувинг."]] },
    hero: { sel: [["You need me, comrade?", "Ю нид ми, камрад?"], ["I am here.", "Ай эм хиа."]], go: [["They will not stop me.", "Зэй вил нот стоп ми."], ["Leave it to me.", "Лив ит ту ми."]] },
    unit: [["Unit ready, comrade.", "Юнит рэди, камрад."], ["New recruit reporting.", "Нью рэкрут рипортинг."]],
    ready: [["Construction complete, comrade.", "Констракшн комплит, камрад."], ["Structure is ready.", "Стракчер из рэди."]],
    ann: { underAttack: ["Our base is under attack!", "Ауэр бэйс из андэр эттак!"], unitLost: ["Unit lost.", "Юнит лост."], funds: ["Not enough funds, comrade.", "Нот инаф фандз, камрад."], radarOn: ["Radar online.", "Рэйдар онлайн."], radarOff: ["Radar offline.", "Рэйдар офлайн."], strike: ["Strike incoming.", "Страйк инкаминг."], deployed: ["Construction yard deployed.", "Констракшн ярд диплойд."], captured: ["Building captured.", "Билдинг кэпчерд."] },
  },
  yuri: {
    inf: { sel: ["We are listening.", "Speak, and we obey.", "Our minds are yours.", "The Syndicate hears you."], go: ["It will be done.", "Moving, unseen.", "As the Syndicate wills.", "Silently."] },
    veh: { sel: ["The beast stirs.", "It hungers for orders.", "Flesh and steel, awaiting."], go: ["It crawls forward.", "The swarm moves.", "Hunting."] },
    air: { sel: ["We watch from above.", "The sky is ours."], go: ["Descending.", "Gliding into place."] },
    sea: { sel: ["From the depths.", "The deep one waits."], go: ["Sinking into position.", "Beneath the surface."] },
    sup: { sel: ["The vessel waits.", "Ready to take root."], go: ["Relocating the nest.", "Moving the brood."] },
    hero: { sel: ["You summoned me.", "Minds bend before me."], go: ["They will not see me coming.", "Their thoughts are mine."] },
    unit: ["A new servant awakens.", "Another mind joins us."],
    ready: ["The structure has grown.", "It is complete."],
    ann: { underAttack: "Our domain is under attack.", unitLost: "A servant has fallen.", funds: "We lack resources.", radarOn: "The eye opens.", radarOff: "The eye is blind.", strike: "Strike inbound.", deployed: "The nest takes root.", captured: "A structure bends to our will." },
  },
};
function voiceRoleFor(u: any) {
  if (!u || !u.d) return "inf";
  const d = u.d, role = d.role;
  if ("mcv" === u.key || "hivetrans" === u.key || "mcv" === role || "hivetrans" === role || "miner" === role || "engineer" === u.key) return "sup";
  if (d.hero || /tanya|reaper|phantom|titan/.test(u.key)) return "hero";
  return d.fly ? "air" : d.naval ? "sea" : "inf" === d.kind ? "inf" : "veh";
}
let VOICE_LIST: any[] = [];
function refreshVoiceList() { try { VOICE_LIST = speechSynthesis.getVoices() || []; } catch (e) { } }
try { "undefined" != typeof speechSynthesis && (refreshVoiceList(), speechSynthesis.onvoiceschanged = refreshVoiceList); } catch (e) { }
const FEM = /female|woman|samantha|victoria|karen|moira|tessa|fiona|zira|aria|jenny|libby|sonia|serena|kate|susan|hazel|emma|natasha|clara|google uk english female|google us english/i;
const MALE = /\bmale|daniel|david|george|fred|alex|guy|ryan|james|thomas|mark|arthur|oliver|google uk english male/i;
function pickVoice(fac: string) {
  const vs = VOICE_LIST, en = (v: any) => /^en/i.test(v.lang);
  if (!vs.length) return { v: null, ru: !1 };
  if ("soviet" === fac) {
    const ru = vs.find(v => /^ru/i.test(v.lang)) || vs.find(v => /^(uk|be|pl|cs|sk|bg|sr|hr|sl)/i.test(v.lang));
    if (ru) return { v: ru, ru: /^(ru|uk|be|bg|sr)/i.test(ru.lang) };
    return { v: vs.find(v => en(v) && MALE.test(v.name) && !/female/i.test(v.name)) || vs.find(en), ru: !1 };
  }
  if ("yuri" === fac) return { v: vs.find(v => en(v) && MALE.test(v.name) && !/female/i.test(v.name)) || vs.find(en), ru: !1 };
  return { v: vs.find(v => en(v) && FEM.test(v.name)) || vs.find(en), ru: !1 };
}
const VOICE_STYLE: any = { allied: { pitch: 1.12, rate: 1.03 }, soviet: { pitch: .82, rate: .93, pitchEn: .72 }, yuri: { pitch: .1, rate: .8 } };
let lastVoiceT = 0, lastAnnT: any = {}, voicesEnabled = (() => { try { return "0" !== localStorage.getItem("ifr_voices"); } catch (e) { return !0; } })();
function setVoicesEnabled(v: boolean) { voicesEnabled = v; try { localStorage.setItem("ifr_voices", v ? "1" : "0"); } catch (e) { } }
// Short radio squelch so voices sound like they come over comms.
function radioClick(fac: string) {
  if (!sOK()) return;
  const t = AC.currentTime + .005;
  sNoise(t, { type: "bandpass", f: "yuri" === fac ? 900 : 2400, q: 2.5, g: .05, a: .002, d: .07 }), sOsc(t, { w: "sine", f: "yuri" === fac ? 420 : 1350, g: .025, d: .045 });
}
function speakLine(fac: string, line: Line, urgent?: boolean) {
  if (!voicesEnabled || muted || sfxVol <= 0 || "undefined" == typeof speechSynthesis || !line) return;
  try {
    const pv = pickVoice(fac), st = VOICE_STYLE[fac] || VOICE_STYLE.allied, text = Array.isArray(line) ? (pv.ru ? line[1] : line[0]) : line;
    urgent ? speechSynthesis.cancel() : speechSynthesis.speaking && speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.pitch = "soviet" === fac && !pv.ru ? st.pitchEn : st.pitch, u.rate = st.rate, u.volume = Math.min(1, sfxVol * masterVol), pv.v && (u.voice = pv.v, u.lang = pv.v.lang);
    radioClick(fac), setTimeout(() => { try { speechSynthesis.speak(u); } catch (e) { } }, 70);
  } catch (e) { }
}
function playVoiceLine(fac: string, category: string, role?: string | null) {
  const now = performance.now();
  if (now - lastVoiceT < 900) return;
  const F = VOICE_LINES[fac] || VOICE_LINES.allied, set = "sel" === category || "go" === category ? (F[role || "inf"] || F.inf)[category] : F[category];
  if (!set || !set.length) return;
  lastVoiceT = now, speakLine(fac, set[Math.floor(Math.random() * set.length)]);
}
// Faction announcer for important events.
function announce(ev: string) {
  const fac = S.players && S.players[0] && S.players[0].fac || "allied", F = VOICE_LINES[fac] || VOICE_LINES.allied, line = F.ann && F.ann[ev];
  if (!line) return;
  const now = performance.now(), gap = "underAttack" === ev ? 12e3 : "funds" === ev ? 6e3 : 3e3;
  if (now - (lastAnnT[ev] || 0) < gap) return;
  lastAnnT[ev] = now, lastVoiceT = now, speakLine(fac, line, !0);
}
function announceHint(msg: string) {
  if (!msg || "string" != typeof msg) return;
  const m = msg.toLowerCase();
  m.includes("under attack") ? announce("underAttack") : "unit lost" === m ? announce("unitLost") : m.startsWith("need $") ? announce("funds") : "radar online" === m ? announce("radarOn") : m.startsWith("radar offline") ? announce("radarOff") : m.includes("inbound") ? announce("strike") : m.startsWith("construction yard deployed") || "hive deployed" === m ? announce("deployed") : "captured" === m && announce("captured");
}

// ------------------------------------------------------------------ effects
function sfx(e: string, u?: any) {
  ("sel" === e || "go" === e || "unit" === e || "ready" === e) && playVoiceLine(P().fac, e, voiceRoleFor(u));
  if (sfxBudget > 7 || !sOK()) return;
  sfxBudget++;
  const t = AC.currentTime + .004, pn = (Math.random() - .5) * .5;
  switch (e) {
    case "gun": // crack + body + thump
      sNoise(t, { type: "bandpass", f: vr(2600, .15), q: .9, g: .09, d: .045, pan: pn }), sNoise(t, { f: 900, f2: 300, g: .08, d: .09, pan: pn, verb: .08 }), sOsc(t, { f: vr(140, .1), f2: 55, g: .07, d: .06 });
      break;
    case "cannon":
      sOsc(t, { f: 85, f2: 36, g: .22, d: .42, dist: 1 }), sNoise(t, { f: 1400, f2: 180, g: .16, d: .5, verb: .25, pan: pn }), sNoise(t, { type: "highpass", f: 2200, g: .06, d: .05 });
      break;
    case "rocket":
      sNoise(t, { type: "bandpass", f: 500, f2: 1900, q: 1.4, g: .1, a: .02, d: .42, pan: pn, verb: .12 }), sOsc(t, { f: 90, f2: 45, g: .08, d: .2 });
      break;
    case "flame":
      sNoise(t, { f: 700, f2: 1100, g: .09, a: .04, d: .32, brown: 1, verb: .08 }), sNoise(t + .03, { type: "highpass", f: 3000, g: .025, d: .12 });
      break;
    case "tesla":
      sOsc(t, { w: "sawtooth", f: 58, f2: 90, g: .07, d: .22, dist: 1, lp: 2400 }), sNoise(t, { type: "highpass", f: 3500, g: .07, d: .18, pan: pn }), sNoise(t + .06, { type: "bandpass", f: 5000, q: 3, g: .05, d: .06 });
      break;
    case "beam":
      sOsc(t, { w: "triangle", f: 620, f2: 1300, g: .05, a: .01, d: .2, verb: .15 }), sOsc(t, { f: 1240, f2: 2500, g: .025, a: .01, d: .16 });
      break;
    case "psi":
      sOsc(t, { f: 360, f2: 170, g: .06, a: .03, d: .5, verb: .35 }), sOsc(t, { f: 540, f2: 250, g: .03, a: .03, d: .45, verb: .35, det: 12 });
      break;
    case "boom":
      sOsc(t, { f: 62, f2: 28, g: .26, d: .75, dist: 1 }), sNoise(t, { f: 1600, f2: 140, g: .2, d: .85, verb: .3, pan: pn }), sNoise(t, { type: "highpass", f: 1800, g: .07, d: .07 }), sNoise(t + .12, { f: 500, f2: 120, g: .07, d: .6, brown: 1, verb: .2 });
      break;
    case "rumble":
      sOsc(t, { f: 50, f2: 24, g: .28, d: 1, dist: 1 }), sNoise(t, { f: 900, f2: 90, g: .22, d: 1.1, brown: 1, verb: .35 });
      break;
    case "launch":
      sNoise(t, { type: "bandpass", f: 200, f2: 900, q: .8, g: .14, a: .25, d: .8, verb: .3 }), sOsc(t + .65, { f: 55, f2: 30, g: .25, d: .6, dist: 1 }), sNoise(t + .65, { f: 800, f2: 120, g: .16, d: .7, verb: .3 });
      break;
    case "nuke":
      sOsc(t, { f: 40, f2: 18, g: .34, a: .02, d: 2.2, dist: 1 }), sNoise(t, { f: 2000, f2: 60, g: .3, a: .02, d: 2.4, brown: 1, verb: .5 }), sNoise(t + .2, { type: "highpass", f: 1200, f2: 300, g: .06, d: 1.4, verb: .4 });
      break;
    case "psiwave":
      sOsc(t, { f: 180, f2: 70, g: .08, a: .1, d: 1.5, verb: .5 }), sOsc(t, { f: 270, f2: 105, g: .05, a: .1, d: 1.3, verb: .5, det: 15 }), sNoise(t, { type: "bandpass", f: 1800, q: 4, g: .03, a: .2, d: 1.2, verb: .4 });
      break;
    case "alert": // two-tone warning chime
      sOsc(t, { w: "triangle", f: 880, g: .06, a: .005, d: .22, verb: .25 }), sOsc(t + .16, { w: "triangle", f: 659, g: .06, a: .005, d: .3, verb: .25 });
      break;
    case "place": // heavy clunk + ring
      sNoise(t, { f: 500, f2: 150, g: .16, d: .18, brown: 1 }), sOsc(t, { f: 120, f2: 70, g: .12, d: .2 }), sOsc(t + .03, { w: "triangle", f: 880, g: .025, d: .35, verb: .3 });
      break;
    case "reload":
      sNoise(t, { type: "bandpass", f: 2600, q: 3, g: .07, d: .04 }), sNoise(t + .14, { type: "bandpass", f: 3400, q: 4, g: .09, d: .035 }), sOsc(t + .14, { f: 260, f2: 160, g: .03, d: .04 });
      break;
    case "step":
      sNoise(t, { f: vr(420, .3), g: .035, d: .05, brown: 1 });
      break;
    case "hitmark":
      sOsc(t, { w: "triangle", f: 1850, g: .035, d: .03 });
      break;
    case "killmark":
      sOsc(t, { w: "triangle", f: 1600, g: .04, d: .04 }), sOsc(t + .05, { w: "triangle", f: 2150, g: .04, d: .07, verb: .1 });
      break;
    case "hurt":
      sNoise(t, { f: 600, f2: 200, g: .09, d: .14, brown: 1 }), sOsc(t, { f: 180, f2: 110, g: .05, d: .12 });
      break;
    case "death":
      sNoise(t, { f: 500, f2: 120, g: .12, d: .4, brown: 1, verb: .2 }), sOsc(t, { f: 150, f2: 60, g: .07, a: .01, d: .5 });
      break;
    case "splash":
      sNoise(t, { type: "bandpass", f: 1400, f2: 500, q: .8, g: .08, a: .01, d: .3, verb: .15 });
      break;
    case "jump":
      sNoise(t, { type: "bandpass", f: 800, f2: 1600, q: 1, g: .025, a: .02, d: .1 });
      break;
    case "land":
      sNoise(t, { f: 350, g: .06, d: .08, brown: 1 });
      break;
    case "melee":
      sNoise(t, { type: "bandpass", f: 1500, f2: 3500, q: 1.2, g: .05, a: .02, d: .09 }), sNoise(t + .06, { f: 400, g: .09, d: .07, brown: 1 });
      break;
    case "distant_gun":
      sNoise(t, { type: "bandpass", f: 1200, q: 1, g: .018, d: .06, pan: pn * 2, verb: .5 });
      break;
    case "distant_boom":
      sNoise(t, { f: 300, f2: 80, g: .06, a: .02, d: .9, brown: 1, pan: pn * 2, verb: .6 });
      break;
    case "engine_gnd":
      sOsc(t, { w: "sawtooth", f: vr(52, .05), g: .025, a: .04, d: .22, lp: 260 }), sNoise(t, { f: 180, g: .02, a: .04, d: .2, brown: 1 });
      break;
    case "engine_air":
      sNoise(t, { type: "bandpass", f: 1400, q: .7, g: .025, a: .05, d: .2 }), sOsc(t, { w: "sawtooth", f: 160, g: .01, a: .05, d: .2, lp: 900 });
      break;
    case "engine_sea":
      sNoise(t, { f: 380, g: .03, a: .05, d: .25, brown: 1 }), sOsc(t, { w: "sawtooth", f: 70, g: .012, a: .05, d: .22, lp: 300 });
      break;
    case "ready": // pleasant rising chime
      sOsc(t, { w: "triangle", f: 659, g: .04, a: .008, d: .3, verb: .3 }), sOsc(t + .09, { w: "triangle", f: 988, g: .04, a: .008, d: .45, verb: .3 });
      break;
    case "unit":
      sOsc(t, { w: "triangle", f: 523, g: .035, a: .006, d: .22, verb: .2 }), sOsc(t + .07, { w: "triangle", f: 784, g: .03, a: .006, d: .3, verb: .2 });
      break;
    case "sel":
      sOsc(t, { w: "sine", f: 1320, g: .025, a: .002, d: .05 }), sNoise(t, { type: "bandpass", f: 3000, q: 3, g: .015, d: .02 });
      break;
    case "go":
      sOsc(t, { w: "sine", f: 880, g: .025, a: .002, d: .06 }), sOsc(t + .04, { w: "sine", f: 1175, g: .02, a: .002, d: .07 });
      break;
    case "lose":
      for (const [i, f] of [220, 207.65, 174.61, 146.83].entries()) sOsc(t + .35 * i, { w: "triangle", f, g: .06, a: .02, d: .9, verb: .4, lp: 1800 });
      break;
    case "win":
      for (const [i, f] of [392, 523.25, 659.25, 783.99].entries()) sOsc(t + .14 * i, { w: "triangle", f, g: .05, a: .01, d: .8, verb: .4 });
      sOsc(t + .56, { w: "triangle", f: 1046.5, g: .05, a: .02, d: 1.4, verb: .5 });
      break;
    case "thunder":
      sNoise(t, { f: 900, f2: 70, g: .3, a: .02, d: 2.2, brown: 1, verb: .5 }), sOsc(t, { f: 44, f2: 22, g: .2, a: .05, d: 1.8, dist: 1 }), sNoise(t + .25, { f: 400, f2: 90, g: .14, a: .1, d: 1.2, brown: 1, verb: .5 });
      break;
  }
}
// Test/recording hook: a MediaStream carrying the final mixed output.
function audioTap() { const ac = audio(); if (!ac) return null; const d = ac.createMediaStreamDestination(); limiter.connect(d); return d; }
function sfxHit(e: string) {
  if (sfxBudget > 9 || !sOK()) return;
  sfxBudget++;
  const t = AC.currentTime + .004;
  "shell" === e || "rocket" === e || "grenade" === e ? (sNoise(t, { f: 1200, f2: 160, g: .1, d: .35, verb: .2 }), sOsc(t, { f: 70, f2: 35, g: .1, d: .3 })) : "missile" === e && sNoise(t, { f: 1600, f2: 200, g: .08, d: .3, verb: .2 });
}

function setMuted(e){muted=e,masterGain&&(masterGain.gain.value=e?0:masterVol),customTrackEl&&(customTrackEl.volume=e?0:masterVol*musicVol);try{localStorage.setItem("ifr_muted",e?"1":"0")}catch(t){}const t=document.getElementById("btnMute");if(t){const u=t.querySelector("use");u&&u.setAttribute("href",e?"#i-mute":"#i-speaker")}}

// ------------------------------------------------------------------- music
// A small arranger: every track is a key, scale, tempo and a form of
// sections (intro / verse / chorus / bridge / outro), each with a chord
// progression and a set of instrument layers. Notes are scheduled ahead on
// the audio clock (no timer jitter), instruments have proper envelopes, and
// melodies are generated from a per-track seed as repeating motifs so the
// music develops like a composed piece instead of looping blips.
let musicOn = false, musicGen = 0;
const SCALES: Record<string, number[]> = { aeolian: [0, 2, 3, 5, 7, 8, 10], dorian: [0, 2, 3, 5, 7, 9, 10], harmonic: [0, 2, 3, 5, 7, 8, 11], phrygian: [0, 1, 3, 5, 7, 8, 10] };
type Sec = { bars: number; prog: number[]; pad?: number; choir?: number; bass?: number; ost?: number; arp?: number; lead?: number; brass?: number; drums?: string; swell?: number };
const MUSIC_TRACKS: any[] = [
  { name: "Iron Frontier", bpm: 96, root: 57, scale: "aeolian", seed: 11, form: [
    { bars: 4, prog: [0, 5], pad: .8, drums: "none", swell: 1 },
    { bars: 8, prog: [0, 5, 3, 4], pad: .7, bass: 1, ost: .8, drums: "light", lead: .6 },
    { bars: 8, prog: [5, 3, 0, 4], pad: .8, bass: 1, ost: 1, brass: .8, drums: "full", lead: .9, swell: 1 },
    { bars: 4, prog: [3, 4], pad: .9, arp: .7, drums: "taiko" },
    { bars: 8, prog: [5, 3, 0, 4], pad: .8, bass: 1, ost: 1, brass: 1, choir: .5, drums: "full", lead: 1, swell: 1 },
    { bars: 4, prog: [0, 5, 0, 0], pad: .7, drums: "none" }] },
  { name: "Vanguard Rising", bpm: 110, root: 62, scale: "dorian", seed: 23, form: [
    { bars: 4, prog: [0, 3], pad: .7, arp: .6, drums: "none" },
    { bars: 8, prog: [0, 3, 6, 4], pad: .6, bass: 1, arp: .7, drums: "pulse", lead: .7 },
    { bars: 8, prog: [3, 4, 0, 6], pad: .7, bass: 1, ost: .9, brass: 1, drums: "full", lead: 1, swell: 1 },
    { bars: 8, prog: [5, 6, 0, 0], pad: .8, arp: .8, bass: .8, drums: "light" },
    { bars: 8, prog: [3, 4, 0, 6], pad: .7, bass: 1, ost: 1, brass: 1, drums: "full", lead: 1, swell: 1 },
    { bars: 4, prog: [0, 3, 0, 0], pad: .7, arp: .5, drums: "none" }] },
  { name: "Red Legion", bpm: 92, root: 52, scale: "harmonic", seed: 37, form: [
    { bars: 4, prog: [0, 0, 5, 4], choir: .9, pad: .5, drums: "march" },
    { bars: 8, prog: [0, 3, 4, 0], choir: .8, bass: 1, brass: .7, drums: "march", lead: .7 },
    { bars: 8, prog: [5, 3, 4, 0], choir: 1, pad: .6, bass: 1, brass: 1, ost: .8, drums: "full", lead: .9, swell: 1 },
    { bars: 4, prog: [3, 4], choir: .9, drums: "taiko" },
    { bars: 8, prog: [5, 3, 4, 0], choir: 1, pad: .6, bass: 1, brass: 1, ost: 1, drums: "full", lead: 1, swell: 1 },
    { bars: 4, prog: [0, 4, 0, 0], choir: .8, drums: "march" }] },
  { name: "Syndicate Veil", bpm: 86, root: 49, scale: "phrygian", seed: 53, form: [
    { bars: 4, prog: [0, 1], pad: .8, drums: "none", swell: 1 },
    { bars: 8, prog: [0, 1, 0, 6], pad: .7, bass: 1, arp: .8, drums: "pulse" },
    { bars: 8, prog: [0, 5, 1, 0], pad: .8, bass: 1, arp: 1, choir: .4, drums: "full", lead: .8, swell: 1 },
    { bars: 4, prog: [1, 0], pad: 1, arp: .6, drums: "none" },
    { bars: 8, prog: [0, 5, 1, 0], pad: .8, bass: 1, arp: 1, choir: .5, drums: "full", lead: .9 },
    { bars: 4, prog: [0, 1, 0, 0], pad: .8, drums: "none" }] },
  { name: "Scorched Earth", bpm: 124, root: 55, scale: "aeolian", seed: 71, form: [
    { bars: 4, prog: [0, 6], ost: .9, drums: "light" },
    { bars: 8, prog: [0, 6, 5, 6], pad: .5, bass: 1, ost: 1, drums: "full", lead: .7 },
    { bars: 8, prog: [5, 6, 0, 4], pad: .6, bass: 1, ost: 1, brass: 1, drums: "full", lead: 1, swell: 1 },
    { bars: 4, prog: [5, 4], ost: 1, drums: "taiko" },
    { bars: 8, prog: [5, 6, 0, 4], pad: .6, bass: 1, ost: 1, brass: 1, drums: "full", lead: 1, swell: 1 },
    { bars: 2, prog: [0, 0], pad: .6, drums: "none" }] },
  { name: "Quiet Before the Storm", bpm: 76, root: 53, scale: "dorian", seed: 97, form: [
    { bars: 4, prog: [0, 3], pad: .8, drums: "none" },
    { bars: 8, prog: [0, 3, 5, 4], pad: .7, arp: .6, bass: .6, drums: "none", lead: .6 },
    { bars: 8, prog: [5, 4, 0, 3], pad: .8, arp: .7, bass: .8, choir: .4, drums: "light", lead: .8 },
    { bars: 4, prog: [0, 0], pad: .8, drums: "none" }] },
];
const mtof = (m: number) => 440 * Math.pow(2, (m - 69) / 12);
function rng(seed: number) { let s = seed >>> 0 || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0, s / 4294967296); }

function startMusic() {
  const ac = audio();
  if (!ac || musicOn) return;
  musicOn = true;
  // bus: instruments -> mg (volume) -> glue compressor -> master
  const mg = ac.createGain(); mg.gain.value = MUSIC_BASE * musicVol;
  const comp = ac.createDynamicsCompressor(); comp.threshold.value = -18, comp.knee.value = 10, comp.ratio.value = 3, comp.attack.value = .01, comp.release.value = .3;
  const mix = ac.createGain(); mix.gain.value = 1, mix.connect(comp), comp.connect(mg), mg.connect(masterGain), musicBus = mg;
  const verb = ac.createConvolver(); verb.buffer = makeImpulse(ac, 3.2, 2.4, .025);
  const vg = ac.createGain(); vg.gain.value = .55, verb.connect(vg), vg.connect(mix);
  const dly = ac.createDelay(1.5), fb = ac.createGain(), dlp = ac.createBiquadFilter(), dout = ac.createGain();
  fb.gain.value = .3, dlp.type = "lowpass", dlp.frequency.value = 2400, dout.gain.value = .35;
  dly.connect(dlp), dlp.connect(fb), fb.connect(dly), dlp.connect(dout), dout.connect(mix), dout.connect(verb);
  const bus = (g: number, rv: number, pan?: number, dl?: number) => { const n = ac.createGain(); n.gain.value = g; let o: any = n; if (pan && ac.createStereoPanner) { o = ac.createStereoPanner(), o.pan.value = pan, n.connect(o); } o.connect(mix); if (rv) { const s = ac.createGain(); s.gain.value = rv, o.connect(s), s.connect(verb); } if (dl) { const s = ac.createGain(); s.gain.value = dl, o.connect(s), s.connect(dly); } return n; };
  const B = { pad: bus(.5, .6), padL: bus(.35, .6, -.6), padR: bus(.35, .6, .6), choir: bus(.45, .8), bass: bus(.8, .05), ost: bus(.32, .3, .25), arp: bus(.24, .35, -.3, .5), lead: bus(.36, .45, .1, .45), brass: bus(.42, .45, -.15), drums: bus(.85, .12), perc: bus(.5, .35) };
  const env = (g: any, t: number, a: number, h: number, r: number, peak: number) => { g.gain.setValueAtTime(0, t), g.gain.linearRampToValueAtTime(peak, t + a), g.gain.setValueAtTime(peak, t + a + h), g.gain.exponentialRampToValueAtTime(1e-4, t + a + h + r); };
  const osc = (t: number, type: string, f: number, dur: number, det?: number) => { const o = ac.createOscillator(); o.type = type, o.frequency.setValueAtTime(f, t), det && (o.detune.value = det), o.start(t), o.stop(t + dur + .05); return o; };
  const lp = (f: number, q?: number) => { const b = ac.createBiquadFilter(); b.type = "lowpass", b.frequency.value = f, b.Q.value = q || .7; return b; };
  // ---- instruments
  function pad(t: number, notes: number[], dur: number, g: number) {
    const f = lp(1100, .5), e = ac.createGain(); f.frequency.setValueAtTime(700, t), f.frequency.linearRampToValueAtTime(1300, t + dur * .5), f.frequency.linearRampToValueAtTime(800, t + dur);
    env(e, t, .6, Math.max(.1, dur - .6), 1.4, .11 * g), f.connect(e), e.connect(B.pad);
    for (const [i, n] of notes.entries()) for (const d of [-7, 7]) { const o = osc(t, "sawtooth", mtof(n), dur + 1.5, d); o.connect(f); }
    const e2 = ac.createGain(); env(e2, t, .8, Math.max(.1, dur - .8), 1.4, .05 * g), e2.connect(B.padL), e2.connect(B.padR);
    for (const n of notes) { const o = osc(t, "triangle", mtof(n + 12), dur + 1.5, 4); o.connect(e2); }
  }
  function choir(t: number, notes: number[], dur: number, g: number) {
    const e = ac.createGain(); env(e, t, .5, Math.max(.1, dur - .5), 1.2, .09 * g), e.connect(B.choir);
    const f1 = ac.createBiquadFilter(), f2 = ac.createBiquadFilter(), f3 = ac.createBiquadFilter();
    f1.type = f2.type = f3.type = "bandpass", f1.frequency.value = 650, f1.Q.value = 5, f2.frequency.value = 1080, f2.Q.value = 7, f3.frequency.value = 2650, f3.Q.value = 9;
    const pre = ac.createGain(); pre.gain.value = 1, pre.connect(f1), pre.connect(f2), pre.connect(f3), f1.connect(e), f2.connect(e);
    const f3g = ac.createGain(); f3g.gain.value = .4, f3.connect(f3g), f3g.connect(e);
    for (const n of notes) for (const d of [-9, 0, 9]) { const o = osc(t, "sawtooth", mtof(n), dur + 1.3, d); const v = ac.createOscillator(), vg2 = ac.createGain(); v.frequency.value = 5 + Math.random(), vg2.gain.value = 3, v.connect(vg2), vg2.connect(o.detune), v.start(t), v.stop(t + dur + 1.3); o.connect(pre); }
  }
  function bass(t: number, n: number, dur: number, g: number) {
    const f = lp(900, 2), e = ac.createGain(); f.frequency.setValueAtTime(900, t), f.frequency.exponentialRampToValueAtTime(220, t + Math.min(.3, dur));
    env(e, t, .008, dur * .7, .12, .22 * g), f.connect(e), e.connect(B.bass);
    osc(t, "sawtooth", mtof(n), dur + .2).connect(f);
    const s = ac.createGain(); env(s, t, .008, dur * .7, .12, .2 * g), s.connect(B.bass), osc(t, "sine", mtof(n - 12), dur + .2).connect(s);
  }
  function ost(t: number, n: number, dur: number, g: number) {
    const f = lp(2200, 1.2), e = ac.createGain(); f.frequency.setValueAtTime(2600, t), f.frequency.exponentialRampToValueAtTime(700, t + dur);
    env(e, t, .006, dur * .3, dur * .8, .07 * g), f.connect(e), e.connect(B.ost);
    osc(t, "sawtooth", mtof(n), dur + .3, -5).connect(f), osc(t, "sawtooth", mtof(n), dur + .3, 5).connect(f);
  }
  function arp(t: number, n: number, dur: number, g: number) {
    const f = lp(3200, 3), e = ac.createGain(); f.frequency.setValueAtTime(3400, t), f.frequency.exponentialRampToValueAtTime(500, t + .25);
    env(e, t, .004, .02, .3, .06 * g), f.connect(e), e.connect(B.arp), osc(t, "square", mtof(n), .4).connect(f);
  }
  function lead(t: number, n: number, dur: number, g: number) {
    const e = ac.createGain(), f = lp(2600, .8); env(e, t, .03, dur * .8, .35, .08 * g), f.connect(e), e.connect(B.lead);
    const o1 = osc(t, "triangle", mtof(n), dur + .45), o2 = osc(t, "sawtooth", mtof(n), dur + .45, 6), o2g = ac.createGain(); o2g.gain.value = .25;
    const v = ac.createOscillator(), vg2 = ac.createGain(); v.frequency.value = 5.2, vg2.gain.setValueAtTime(0, t), vg2.gain.linearRampToValueAtTime(14, t + Math.min(.4, dur)), v.connect(vg2), vg2.connect(o1.detune), vg2.connect(o2.detune), v.start(t), v.stop(t + dur + .45);
    o1.connect(f), o2.connect(o2g), o2g.connect(f);
  }
  function brass(t: number, notes: number[], dur: number, g: number) {
    const f = lp(400, 1.5), e = ac.createGain(); f.frequency.setValueAtTime(350, t), f.frequency.linearRampToValueAtTime(2400, t + .09), f.frequency.exponentialRampToValueAtTime(1000, t + .09 + dur * .6);
    env(e, t, .05, dur * .7, .3, .09 * g), f.connect(e), e.connect(B.brass);
    for (const n of notes) for (const d of [-6, 6]) osc(t, "sawtooth", mtof(n), dur + .4, d).connect(f);
  }
  const nz = (t: number, dur: number, type: string, fq: number, q: number, g: number, dest: any, a?: number, f2?: number) => {
    const s = ac.createBufferSource(); s.buffer = NOISE; const b = ac.createBiquadFilter(); b.type = type, b.frequency.setValueAtTime(fq, t), b.Q.value = q, f2 && b.frequency.exponentialRampToValueAtTime(f2, t + dur);
    const e = ac.createGain(); env(e, t, a || .002, 0, dur, g), s.connect(b), b.connect(e), e.connect(dest), s.start(t, Math.random()), s.stop(t + (a || 0) + dur + .05);
  };
  function kick(t: number, g: number) { const o = osc(t, "sine", 150, .45), e = ac.createGain(); o.frequency.setValueAtTime(150, t), o.frequency.exponentialRampToValueAtTime(42, t + .12), env(e, t, .002, .02, .38, .7 * g), o.connect(e), e.connect(B.drums), nz(t, .02, "highpass", 3000, .7, .12 * g, B.drums); }
  function snare(t: number, g: number) { nz(t, .18, "bandpass", 1900, .8, .34 * g, B.drums), nz(t, .08, "highpass", 5000, .7, .12 * g, B.drums); const o = osc(t, "triangle", 190, .15), e = ac.createGain(); o.frequency.exponentialRampToValueAtTime(140, t + .1), env(e, t, .002, 0, .1, .22 * g), o.connect(e), e.connect(B.drums); }
  function hat(t: number, g: number, open?: boolean) { nz(t, open ? .22 : .045, "highpass", 8000, .7, .09 * g, B.drums); }
  function tom(t: number, f: number, g: number) { const o = osc(t, "sine", f, .5), e = ac.createGain(); o.frequency.exponentialRampToValueAtTime(f * .6, t + .3), env(e, t, .003, 0, .4, .4 * g), o.connect(e), e.connect(B.perc); }
  function taiko(t: number, g: number) { const o = osc(t, "sine", 80, .9), e = ac.createGain(); o.frequency.exponentialRampToValueAtTime(45, t + .25), env(e, t, .004, .02, .75, .8 * g), o.connect(e), e.connect(B.perc), nz(t, .25, "lowpass", 600, .7, .25 * g, B.perc); }
  function crash(t: number, g: number) { nz(t, 1.8, "highpass", 5500, .5, .12 * g, B.perc); }
  function swell(t: number, dur: number) { nz(t, .05, "highpass", 4000, .5, .001, B.perc); const s = ac.createBufferSource(); s.buffer = NOISE; const b = lp(900, .5), e = ac.createGain(); b.frequency.setValueAtTime(600, t), b.frequency.exponentialRampToValueAtTime(7000, t + dur); e.gain.setValueAtTime(1e-4, t), e.gain.exponentialRampToValueAtTime(.09, t + dur), e.gain.linearRampToValueAtTime(0, t + dur + .05); s.connect(b), b.connect(e), e.connect(B.perc), s.start(t, Math.random()), s.stop(t + dur + .1); }
  // ---- arranger
  const DRUMS: any = {
    light: { k: [0, 8], s: [], h: [4, 12] },
    full: { k: [0, 6, 8], s: [4, 12], h: [0, 2, 4, 6, 8, 10, 12, 14], gs: [14] },
    pulse: { k: [0, 4, 8, 12], s: [], h: [2, 6, 10, 14], oh: [14] },
    march: { k: [0, 8], s: [0, 3, 4, 6, 8, 11, 12, 14], acc: [4, 12] },
    taiko: { tk: [0, 3, 6, 8, 11, 14] },
    none: {},
  };
  function chordNotes(tr: any, deg: number, oct: number) { const sc = SCALES[tr.scale]; const n = (d: number) => tr.root + oct * 12 + sc[((d % 7) + 7) % 7] + 12 * Math.floor(d / 7); return [n(deg), n(deg + 2), n(deg + 4)]; }
  function melodyFor(tr: any, si: number) {
    const r = rng(tr.seed * 31 + si * 7), sc = SCALES[tr.scale], rhythms = [[0, 4, 6, 8, 12], [0, 3, 6, 8, 10, 12], [0, 2, 4, 8, 11, 12, 14], [0, 6, 8, 12, 14]];
    const motif: any[] = []; let deg = 4 + Math.floor(r() * 3);
    for (let b = 0; b < 2; b++) { const rh = rhythms[Math.floor(r() * rhythms.length)]; for (let i = 0; i < rh.length; i++) { const nx = i + 1 < rh.length ? rh[i + 1] : 16; deg += [-2, -1, -1, 1, 1, 2, 0][Math.floor(r() * 7)], deg = Math.max(0, Math.min(9, deg)); motif.push({ st: b * 16 + rh[i], len: nx - rh[i], deg }); } }
    return { motif, sc };
  }
  let playTrack = (idx: number) => {
    const myGen = ++musicGen, tr = MUSIC_TRACKS[idx], spb = 60 / tr.bpm / 4;
    const ft = ac.currentTime; mg.gain.cancelScheduledValues(ft), mg.gain.setValueAtTime(mg.gain.value, ft), mg.gain.linearRampToValueAtTime(.001, ft + .5), mg.gain.linearRampToValueAtTime(MUSIC_BASE * musicVol, ft + 1.4);
    let si = 0, bar = 0, step = 0, t = ft + .55, mel = melodyFor(tr, 0);
    const tick = () => {
      if (!musicOn || myGen !== musicGen) return;
      while (t < ac.currentTime + .3) {
        const sec: Sec = tr.form[si], deg = sec.prog[bar % sec.prog.length], barDur = 16 * spb;
        if (0 === step) {
          const ch = chordNotes(tr, deg, 0);
          sec.pad && pad(t, ch, barDur, sec.pad), sec.choir && choir(t, chordNotes(tr, deg, 0), barDur, sec.choir);
          sec.brass && brass(t, chordNotes(tr, deg, -1), 4 * spb, sec.brass);
          0 === bar && sec.drums && "none" !== sec.drums && crash(t, .8);
          sec.swell && bar === sec.bars - 1 && swell(t, barDur);
        }
        sec.brass && 10 === step && bar % 2 === 1 && brass(t, chordNotes(tr, deg, -1), 2 * spb, .8 * sec.brass);
        if (sec.bass) { const pat = "march" === sec.drums ? [0, 4, 8, 12] : "pulse" === sec.drums ? [0, 2, 4, 6, 8, 10, 12, 14] : [0, 6, 8, 11, 14]; pat.includes(step) && bass(t, chordNotes(tr, deg, -2)[0] + (11 === step ? 7 : 0), ("pulse" === sec.drums ? 1.6 : 2.4) * spb, sec.bass); }
        if (sec.ost && step % 2 === 0) { const c = chordNotes(tr, deg, -1), seq = [c[0], c[1], c[2], c[1]]; ost(t, seq[(step / 2) % 4] + 12, 1.6 * spb, sec.ost); }
        if (sec.arp) { const c = chordNotes(tr, deg, 1), seq = [c[0], c[1], c[2], c[0] + 12, c[2], c[1]]; arp(t, seq[step % 6], spb, sec.arp * (step % 4 ? .7 : 1)); }
        if (sec.lead) { const ms = (bar % 2) * 16 + step, var2 = bar % 4 >= 2 ? 1 : 0; for (const m of mel.motif) if (m.st === ms) { const dg = m.deg + (var2 && m.st >= 16 ? -1 : 0) + (deg % 7 === 0 ? 0 : 0); lead(t, tr.root + 12 + mel.sc[((dg % 7) + 7) % 7] + 12 * Math.floor(dg / 7), m.len * spb * .95, sec.lead); } }
        const D = DRUMS[sec.drums || "none"], lastBar = bar === sec.bars - 1;
        if (D) {
          D.k && D.k.includes(step) && kick(t, 1), D.s && D.s.includes(step) && snare(t, D.acc ? D.acc.includes(step) ? .9 : .45 : .8), D.gs && D.gs.includes(step) && snare(t, .25);
          D.h && D.h.includes(step) && hat(t, step % 4 ? .6 : 1), D.oh && D.oh.includes(step) && hat(t, .8, !0), D.tk && D.tk.includes(step) && taiko(t, step % 8 ? .7 : 1);
          lastBar && "none" !== sec.drums && step >= 12 && step % 1 === 0 && tom(t, [200, 170, 140, 110][step - 12], .8);
        }
        t += spb, step++;
        if (16 === step) { step = 0, bar++; if (bar >= sec.bars) { bar = 0, si++, mel = melodyFor(tr, si); if (si >= tr.form.length) { const total = totalTrackCount(), nxt = trackSel >= 0 ? trackSel : (idx + 1 + Math.floor(Math.random() * Math.max(1, total - 1))) % total; setTimeout(() => myGen === musicGen && playAnyTrack(nxt), Math.max(0, (t - ac.currentTime) * 1e3)); return; } } }
      }
      setTimeout(tick, 40);
    };
    tick();
  };
  playTrackRef = playTrack;
  const _tot = totalTrackCount();
  playAnyTrack(trackSel >= 0 ? trackSel : Math.floor(Math.random() * _tot));
}

const ADMIN_MUSIC_KEY="ifr_admin_music";function loadAdminMusic(){try{return JSON.parse(localStorage.getItem(ADMIN_MUSIC_KEY)||"[]")}catch(e){return[]}}function saveAdminMusic(list){try{localStorage.setItem(ADMIN_MUSIC_KEY,JSON.stringify(list));return!0}catch(e){return!1}}let CUSTOM_MUSIC=loadAdminMusic();function refreshCustomMusic(){CUSTOM_MUSIC=loadAdminMusic()}function totalTrackCount(){return MUSIC_TRACKS.length+CUSTOM_MUSIC.length}function trackName(i){return i<MUSIC_TRACKS.length?MUSIC_TRACKS[i].name:(CUSTOM_MUSIC[i-MUSIC_TRACKS.length]?CUSTOM_MUSIC[i-MUSIC_TRACKS.length].name:"?")}let customTrackEl=null,customTrackIdx=-1;function stopCustomTrack(){if(customTrackEl){try{customTrackEl.pause()}catch(e){}customTrackEl=null,customTrackIdx=-1}}function playCustomTrack(i){const t=CUSTOM_MUSIC[i];if(!t){trackSel=-1;try{localStorage.setItem("ifr_track","-1")}catch(e){}const total=totalTrackCount();return void(total>0&&playAnyTrack(Math.floor(Math.random()*total)))}stopCustomTrack(),musicOn=!0;const el=new Audio(t.dataUrl);el.volume=muted?0:masterVol*musicVol,customTrackEl=el,customTrackIdx=i,el.onended=()=>{if(customTrackIdx!==i)return;if(trackSel>=0)el.currentTime=0,el.play().catch(()=>{});else{const total=totalTrackCount();total>0&&playAnyTrack(Math.floor(Math.random()*total))}},el.play().catch(()=>{})}function playAnyTrack(idx){idx<MUSIC_TRACKS.length?(stopCustomTrack(),playTrackRef&&playTrackRef(idx)):(musicGen++,playCustomTrack(idx-MUSIC_TRACKS.length))}
let lightningT = 0;

Object.assign(window, {
  audio, sfx, sfxHit, setMuted, setMasterVol, setSfxVol, setMusicVol,
  setTrackSel, setRainAmbience, startFpsAmbience, stopFpsAmbience, startMusic, MUSIC_TRACKS,
  loadAdminMusic, saveAdminMusic, refreshCustomMusic, totalTrackCount, trackName,
  playVoiceLine, setVoicesEnabled, announce, announceHint, audioTap
});

Object.defineProperties(window, {
  lightningT: { get: () => lightningT, set: v => { lightningT = v; }, configurable: true },
  sfxBudget: { get: () => sfxBudget, set: v => { sfxBudget = v; }, configurable: true },
  muted: { get: () => muted, configurable: true },
  masterVol: { get: () => masterVol, configurable: true },
  sfxVol: { get: () => sfxVol, configurable: true },
  musicVol: { get: () => musicVol, configurable: true },
  trackSel: { get: () => trackSel, configurable: true },
  CUSTOM_MUSIC: { get: () => CUSTOM_MUSIC, configurable: true },
  voicesEnabled: { get: () => voicesEnabled, configurable: true },
});

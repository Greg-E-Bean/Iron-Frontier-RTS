export {};
let AC=null,masterGain=null,sfxBus=null,muted=(()=>{try{return"1"===localStorage.getItem("ifr_muted")}catch(e){return!1}})(),masterVol=(()=>{try{const e=localStorage.getItem("ifr_masterVol");return null===e?1:+e}catch(e){return 1}})(),sfxVol=(()=>{try{const e=localStorage.getItem("ifr_sfxVol");return null===e?1:+e}catch(e){return 1}})(),musicVol=(()=>{try{const e=localStorage.getItem("ifr_musicVol");return null===e?1:+e}catch(e){return 1}})(),trackSel=(()=>{try{const e=localStorage.getItem("ifr_track");return null===e?-1:+e}catch(e){return-1}})(),musicBus=null,playTrackRef=null;function setMasterVol(e){masterVol=e,masterGain&&!muted&&(masterGain.gain.value=e),customTrackEl&&(customTrackEl.volume=muted?0:e*musicVol);try{localStorage.setItem("ifr_masterVol",""+e)}catch(t){}}function setSfxVol(e){sfxVol=e,sfxBus&&(sfxBus.gain.value=e);try{localStorage.setItem("ifr_sfxVol",""+e)}catch(t){}}function setMusicVol(e){musicVol=e,musicBus&&(musicBus.gain.value=MUSIC_BASE*e),customTrackEl&&(customTrackEl.volume=muted?0:masterVol*e);try{localStorage.setItem("ifr_musicVol",""+e)}catch(t){}}function setTrackSel(e){trackSel=e;try{localStorage.setItem("ifr_track",""+e)}catch(t){}musicOn&&(e>=0?playAnyTrack(e):e<=-3&&musicStyleSwitch())}

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
// Announcer: Vanguard crisp English, Legion Russian (a Russian system voice
// reads phonetic Cyrillic spellings, giving accented English with a few real
// Russian phrases), Syndicate deep and gravelly. Units speak with their own
// personas (see personaFor below).
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
// ---- unit personas: every unit type has its own voice — accent, gender and
// a natural pitch/rate. Vanguard crews come from all over the English-
// speaking world (dialect written into their lines, since speech engines
// only know national accents); Legion speaks through Russian / Eastern-
// European voices; the Syndicate stays low and gravelly.
type Persona = { acc: string; g: "f" | "m"; p: number; r: number };
const P_ = (acc: string, g: "f" | "m", p = 1, r = 1): Persona => ({ acc, g, p, r });
const PERSONA_ALLIED: Record<string, Persona> = {
  gi: P_("us", "m"), engineer: P_("ie", "m", 1.02), guardian: P_("za", "m", .97), marksman: P_("us", "f"), vindicator: P_("rp", "m"),
  tanya: P_("rp", "f", 1.04, 1.02), chrono: P_("rp", "f", .98), grizzly: P_("us", "m", .95), ifv: P_("au", "m"), hover: P_("us", "f", 1.02, 1.04),
  prism: P_("rp", "m", .96), bulwark: P_("north", "m", .93, .97), titan_allied: P_("scot", "m", .9, .95), longbow: P_("rp", "m", .94),
  rocketeer: P_("us", "f", 1.03, 1.05), harrier: P_("us", "m", .97, 1.05), kestrel: P_("us", "f", 1.02, 1.05), chinook: P_("au", "m"),
  interceptor: P_("us", "m", 1, 1.06), frigate: P_("rp", "m", .95, .97), barracuda: P_("au", "m", .97), lst: P_("au", "f"),
  mcv: P_("north", "m", .92, .97), bastion: P_("scot", "m", .93, .96), restorer: P_("ie", "f"), miner_allied: P_("north", "m", .96),
};
const ACCENT_LANG: Record<string, RegExp> = { us: /^en[-_]US/i, rp: /^en[-_]GB/i, north: /^en[-_]GB/i, scot: /^en[-_]GB/i, au: /^en[-_](AU|NZ)/i, ie: /^en[-_]IE/i, za: /^en[-_]ZA/i, ru: /^ru/i, slav: /^(uk|be|bg|sr|pl|cs|sk)/i };
// Dialect lines per accent (sel = selected, go = ordered). Roles fall back to
// the accent's generic lines.
const ACCENT_LINES: any = {
  us: { inf: { sel: ["Squad's ready, Commander.", "Go ahead, we're listening.", "Standing by for orders.", "What do you need?", "Locked and loaded."], go: ["Roger that, moving.", "On it.", "Copy, heading out.", "You got it.", "Moving, moving!"] },
    veh: { sel: ["Tank crew ready.", "Armor's warmed up, Commander.", "Crew standing by.", "Talk to me."], go: ["Rolling.", "Copy, advancing.", "We're Oscar Mike.", "Moving to the grid."] },
    air: { sel: ["Hornet on station.", "Pilot here, go ahead.", "Wings level, awaiting tasking.", "Eyes in the sky, Commander."], go: ["Roger, inbound.", "Vector copied.", "On my way, hold tight.", "Commencing attack run."] },
    sea: { sel: ["Bridge here.", "Helm's ready."], go: ["Aye aye, Commander.", "Setting course."] } },
  rp: { inf: { sel: ["Ready when you are, sir.", "At your service.", "Awaiting instructions.", "Standing by, Commander."], go: ["Right away.", "Understood, moving now.", "Consider it done.", "On our way."] },
    veh: { sel: ["Crew ready, Commander.", "Engines running, sir.", "Quite ready, thank you."], go: ["Advancing.", "Proceeding now.", "Moving up, sir."] },
    air: { sel: ["Flight ready, sir.", "Airborne and awaiting orders."], go: ["Heading in.", "Understood, inbound."] },
    sea: { sel: ["Bridge standing by.", "Ship's company ready, sir."], go: ["Making way.", "Steady as she goes."] } },
  north: { inf: { sel: ["Ey up, Commander.", "Right then, what're we doin'?", "Aye, we're ready.", "Go on then, what's the job?"], go: ["Right, we're off.", "Aye, on me way.", "Champion, movin' now.", "Righto."] },
    veh: { sel: ["She's warmed up, boss.", "Engine's grand, ready when you are.", "Aye, what d'you need?"], go: ["Right, off we go.", "Shiftin' her now.", "On us way.", "Steady does it."] },
    sup: { sel: ["Ey up. Where d'you want us?", "Right then, where are we settin' up?", "Big lass is ready, boss.", "Aye, point us at some flat ground."], go: ["Right, shiftin' the lot.", "Takin' her steady.", "On us way, mind yer backs.", "No bother, off we go."] } },
  scot: { inf: { sel: ["Aye, Commander?", "Och, what is it now?", "Ready, so we are."], go: ["Aye, on ma way.", "Nae bother.", "Right ye are."] },
    hero: { sel: ["Aye, Commander? Walker's ready.", "Point me at 'em.", "Och, finally, some proper work.", "Big lad's awake."], go: ["Aye, on ma way.", "Nae bother at all.", "Stompin' over now.", "Right ye are, here we go."] } },
  au: { inf: { sel: ["G'day, Commander.", "Ready to go, mate.", "What's the plan, boss?"], go: ["No worries.", "On it, mate.", "Righto, movin'."] },
    sea: { sel: ["G'day, Commander. Boat's ready.", "Periscope up, what's the go?", "Sub's ready, mate."], go: ["No worries, divin' now.", "Too easy, on our way.", "She'll be right, headin' there."] },
    air: { sel: ["Chopper's hot, mate.", "Ready for a lift?"], go: ["Too easy.", "No worries, liftin' off."] } },
  ie: { inf: { sel: ["Grand, what're we at?", "Ready so, Commander.", "Go on, I'm listenin'."], go: ["Grand, on me way.", "Sure look, we're off.", "No bother at all."] } },
  za: { inf: { sel: ["Ja, Commander?", "Ready, boss.", "Shot, what's the plan?"], go: ["Ja, moving now.", "Lekker, on our way.", "Sharp sharp."] } },
};
const HERO_LINES: any = {
  tanya: { sel: ["Ghost here. Do try to keep up.", "You rang?", "Let's make this quick, shall we?", "Right, who needs sorting out?"], go: ["Leave it with me.", "On my way, darling.", "Quietly does it.", "Consider it handled."] },
};
function hashKey(k: string) { let h = 7; for (let i = 0; i < k.length; i++) h = (h * 31 + k.charCodeAt(i)) >>> 0; return h; }
function personaFor(fac: string, key?: string | null, role?: string | null): Persona {
  const h = hashKey(key || role || "x"), j = (a: number, b: number) => a + (h % 97) / 96 * (b - a);
  if ("soviet" === fac) return P_("ru", /reaper|desolator|flak|jackal/.test(key || "") ? "f" : "m", j(.92, 1.04), j(.95, 1.03));
  if ("yuri" === fac) return "phantom" === key ? P_("en", "f", .98, .86) : P_(["rp", "us", "ie", "au"][h % 4], "m", j(.8, .9), j(.86, .93));
  return (key && PERSONA_ALLIED[key]) || P_("rp", "f", 1.03, 1.02);
}
let VOICE_LIST: any[] = [];
function refreshVoiceList() { try { VOICE_LIST = speechSynthesis.getVoices() || []; VOICE_CACHE = {}; } catch (e) { } }
let VOICE_CACHE: Record<string, any> = {};
try { "undefined" != typeof speechSynthesis && (refreshVoiceList(), speechSynthesis.onvoiceschanged = refreshVoiceList); } catch (e) { }
const FEM = /female|woman|samantha|victoria|karen|moira|tessa|fiona|zira|aria|jenny|libby|sonia|maisie|serena|kate|susan|hazel|emma|natasha|clara|emily|leah|neerja|michelle|ava|allison|nicole|catherine|svetlana|dariya|milena|katya|polina|zosia|google uk english female|google us english/i;
const MALE = /\bmale|daniel|david|george|fred|alex|guy|ryan|james|thomas|mark|arthur|oliver|william|connor|luke|davis|tony|jason|christopher|eric|brian|andrew|lee|dmitry|dmitri|yuri|pavel|ostap|google uk english male/i;
// Natural / neural / premium voices sound human; eSpeak-style ones don't.
function voiceQuality(v: any) { const n = v.name || ""; return (/natural|neural/i.test(n) ? 60 : 0) + (/online/i.test(n) ? 25 : 0) + (/premium|enhanced|siri/i.test(n) ? 40 : 0) + (/google/i.test(n) ? 20 : 0) - (/espeak|robot|compact/i.test(n) ? 80 : 0); }
function pickVoiceFor(per: Persona, seed: number) {
  const ck = per.acc + per.g + (seed % 3);
  if (ck in VOICE_CACHE) return VOICE_CACHE[ck];
  const vs = VOICE_LIST, lang = ACCENT_LANG[per.acc], en = (v: any) => /^en/i.test(v.lang), gOk = (v: any) => "f" === per.g ? FEM.test(v.name) && !/\bmale/i.test(v.name.replace(/female/i, "")) : MALE.test(v.name) && !/female/i.test(v.name);
  const rank = (list: any[]) => list.sort((a, b) => voiceQuality(b) - voiceQuality(a));
  let pool: any[] = [];
  if ("scot" === per.acc) pool = vs.filter(v => /scot|fiona/i.test(v.name + v.lang));
  if (!pool.length && lang) pool = vs.filter(v => lang.test(v.lang));
  if ("ru" === per.acc && !pool.length) pool = vs.filter(v => ACCENT_LANG.slav.test(v.lang));
  if (!pool.length) pool = vs.filter(v => /^en[-_]GB/i.test(v.lang));
  if (!pool.length) pool = vs.filter(en);
  const gp = pool.filter(gOk), cand = rank(gp.length ? gp : pool), top = cand.filter(v => voiceQuality(v) >= voiceQuality(cand[0]) - 5);
  const v = top.length ? top[(seed + ("scot" === per.acc ? 1 : 0)) % top.length] : null;
  return VOICE_CACHE[ck] = v;
}
const ANNOUNCER: Record<string, Persona> = { allied: P_("rp", "f", 1.02, 1.02), soviet: P_("ru", "f", .98, .98), yuri: P_("rp", "m", .84, .9) };
let lastVoiceT = 0, lastAnnT: any = {}, voicesEnabled = (() => { try { return "0" !== localStorage.getItem("ifr_voices"); } catch (e) { return !0; } })();
function setVoicesEnabled(v: boolean) { voicesEnabled = v; try { localStorage.setItem("ifr_voices", v ? "1" : "0"); } catch (e) { } }
// Short radio squelch so voices sound like they come over comms.
function radioClick(fac: string) {
  if (!sOK()) return;
  const t = AC.currentTime + .005;
  sNoise(t, { type: "bandpass", f: "yuri" === fac ? 900 : 2400, q: 2.5, g: .05, a: .002, d: .07 }), sOsc(t, { w: "sine", f: "yuri" === fac ? 420 : 1350, g: .025, d: .045 });
}
// ---- recorded voice bank -------------------------------------------------------
// Every scripted line is pre-rendered with a neural voice (see scripts/voices)
// into voice/*.mp3 plus voice/manifest.json ("vox|text" -> [file, seconds]).
// A line with a recording plays that clip; anything else falls back to the
// browser's speech engine.
let VOX: any = null;
try { fetch("voice/manifest.json").then(r => r.ok ? r.json() : null).then(m => { VOX = m; }).catch(() => { }); } catch (e) { }
const voxBufs: any = {};
let voxSrc: any = null, voxEnd = 0, _radioCurve: any = null;
function voxFor(fac: string, per?: Persona) {
  if (!per) return "soviet" === fac ? "ru_f" : "yuri" === fac ? "hive_m" : "gb_f";
  if ("soviet" === fac) return "f" === per.g ? "ru_f" : "ru_m";
  if ("yuri" === fac) return "f" === per.g ? "hive_f" : "hive_m";
  return ("us" === per.acc ? "us_" : "rp" === per.acc || "en" === per.acc ? "gb_" : "gb2_") + per.g;
}
function voxEntry(vx: string, t: string) { return VOX && VOX[vx + "|" + t]; }
function voxDur(vx: string, t: string) { const e = voxEntry(vx, t); return e ? e[1] : 0; }
function voxBusy() { return !!AC && AC.currentTime < voxEnd; }
function stopVox() { try { voxSrc && voxSrc.stop && voxSrc.stop(); } catch (e) { } voxSrc = null, voxEnd = 0; }
function playVox(vx: string, t: string, radio: boolean) {
  const e = voxEntry(vx, t);
  if (!e || !sOK()) return !1;
  stopVox();
  const tok: any = {}; voxSrc = tok;
  const go = (buf: any) => {
    if (voxSrc !== tok || !buf) return;
    const s = AC.createBufferSource(); s.buffer = buf;
    let n: any = s;
    if (radio) {
      // comms: band-limited with a touch of saturation, like a field radio
      const hp = AC.createBiquadFilter(); hp.type = "highpass", hp.frequency.value = 300;
      const pk = AC.createBiquadFilter(); pk.type = "peaking", pk.frequency.value = 1800, pk.Q.value = .9, pk.gain.value = 5;
      const lp = AC.createBiquadFilter(); lp.type = "lowpass", lp.frequency.value = 3600;
      const ws = AC.createWaveShaper(); if (!_radioCurve) { _radioCurve = new Float32Array(1024); for (let i = 0; i < 1024; i++) { const x = i / 512 - 1; _radioCurve[i] = Math.tanh(1.8 * x) / Math.tanh(1.8); } } ws.curve = _radioCurve;
      n.connect(hp), hp.connect(pk), pk.connect(ws), ws.connect(lp), n = lp, radioClick("allied");
    }
    const g = AC.createGain(); g.gain.value = radio ? 1.15 : 1; n.connect(g), g.connect(sfxBus);
    s.start(AC.currentTime + (radio ? .06 : 0)), voxSrc = s, voxEnd = AC.currentTime + buf.duration + .1;
  };
  const c = voxBufs[e[0]];
  if (c && c.then) c.then(go); else if (c) go(c);
  else voxBufs[e[0]] = fetch("voice/" + e[0]).then(r => r.arrayBuffer()).then(a => AC.decodeAudioData(a)).then((b: any) => (voxBufs[e[0]] = b, go(b), b)).catch(() => { delete voxBufs[e[0]]; });
  return !0;
}
function speakLine(fac: string, line: Line, urgent?: boolean, per?: Persona, seed?: number, noClick?: boolean, vox?: string | null) {
  if (!voicesEnabled || muted || sfxVol <= 0 || !line) return;
  if (!urgent && voxBusy()) return;
  if (playVox(vox || voxFor(fac, per), Array.isArray(line) ? line[0] : line, !noClick)) return;
  if ("undefined" == typeof speechSynthesis) return;
  try {
    per = per || ANNOUNCER[fac] || ANNOUNCER.allied;
    const v = pickVoiceFor(per, seed || 0), ru = !!v && /^(ru|uk|be|bg|sr)/i.test(v.lang), text = Array.isArray(line) ? (ru ? line[1] : line[0]) : line;
    urgent ? speechSynthesis.cancel() : speechSynthesis.speaking && speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text), gMiss = v && ("f" === per.g ? !FEM.test(v.name) : FEM.test(v.name));
    // natural range only, with a touch of per-line variation
    u.pitch = Math.max(.75, Math.min(1.2, per.p * (gMiss ? ("f" === per.g ? 1.12 : .88) : 1) * (.98 + .04 * Math.random()))), u.rate = per.r * (.97 + .06 * Math.random()), u.volume = Math.min(1, sfxVol * masterVol);
    v && (u.voice = v, u.lang = v.lang);
    noClick || radioClick(fac), setTimeout(() => { try { speechSynthesis.speak(u); } catch (e) { } }, 70);
  } catch (e) { }
}
function unitLines(fac: string, category: string, role: string, key?: string | null, per?: Persona) {
  if (key && HERO_LINES[key]) return HERO_LINES[key][category];
  if ("allied" === fac && per) { const A = ACCENT_LINES[per.acc] || ACCENT_LINES.rp, b = A[role] || ("sup" === role || "hero" === role ? A.veh || A.inf : A.inf) || A.inf; if (b && b[category]) return b[category]; }
  const F = VOICE_LINES[fac] || VOICE_LINES.allied;
  return (F[role || "inf"] || F.inf)[category];
}
function playVoiceLine(fac: string, category: string, role?: string | null, key?: string | null) {
  const now = performance.now();
  if (now - lastVoiceT < 900) return;
  const unitCat = "sel" === category || "go" === category;
  const per = unitCat || ("unit" === category && key) ? personaFor(fac, key, role) : undefined;
  const set = unitCat ? unitLines(fac, category, role || "inf", key, per) : "unit" === category && key && per ? unitLines(fac, "sel", role || "inf", key, per) : (VOICE_LINES[fac] || VOICE_LINES.allied)[category];
  if (!set || !set.length) return;
  lastVoiceT = now, speakLine(fac, set[Math.floor(Math.random() * set.length)], !1, per, hashKey(key || role || ""));
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
  ("sel" === e || "go" === e || "unit" === e || "ready" === e) && playVoiceLine(P().fac, e, voiceRoleFor(u), u && u.key);
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
// Rock soundtrack engine. Songs (src/songs.ts) are written in ABC notation:
// guitar riffs as root notes (the engine voices distorted power chords, "."
// = palm-muted chug), bass following the riff, lead guitar / synth melodies,
// stabs and drum grids, arranged into sections. Each section is rendered
// ahead of time with an OfflineAudioContext and played back as one buffer,
// so gameplay frame hitches can never make the music stutter.
let musicOn = false, musicGen = 0;
// Arranger: songs are written with short sections; a song that would run
// under ~105s gets a reprise of its closing sections, a whole tone up with
// the drums pushed harder, instead of looping the same bars for longer.
const DRUM_LIFT: Record<string, string> = { light: "ride", ride: "rock", half: "rock", rock: "drive", pulse: "rock", groove: "drive", pop: "popdrive", house: "edm", breaks: "edm" };
function musicArrange(song: any) {
  const f = song.form, len = (x: any[]) => x.reduce((a, s) => a + s.bars * 240 / song.bpm, 0);
  if (f.length < 4 || len(f) >= 105) return song;
  const body = f.slice(1, -1); let k = 1;
  while (k < body.length && len(f) + len(body.slice(-k)) < 105) k++;
  const rep = body.slice(-k).map((s: any) => ({ ...s, tr: (s.tr || 0) + 2, d: DRUM_LIFT[s.d] || s.d }));
  return { ...song, form: [...f.slice(0, -1), ...rep, { ...f[f.length - 1], tr: 2 }] };
}
const MUSIC_TRACKS: any[] = ((window as any).MUSIC_SONGS || []).map(musicArrange);

// ---- music DSP: everything in here is self-contained so it can run in a Web
// Worker (built from this function's source) and keep the game thread free.
function musicDSP() {
  // ---- ABC subset: notes A-G/a-g with ^ _ = accidentals, ' , octaves,
  // durations (2, /, /2, 3/2), rests z, chords [..], "." staccato (palm mute),
  // "-" ties, "(3" triplets. Bar lines / spaces are ignored. Unit length is
  // given per part (in beats).
  function abcParse(src: string, unitBeats: number) {
    const out: any[] = []; let t = 0, i = 0, trip = 0, stac = !1, tie = !1;
    const BASE: Record<string, number> = { C: 60, D: 62, E: 64, F: 65, G: 67, A: 69, B: 71 };
    const readDur = () => {
      let num = "", den = "";
      while (/[0-9]/.test(src[i] || "")) num += src[i++];
      let d = num ? +num : 1;
      if ("/" === src[i]) { i++; while (/[0-9]/.test(src[i] || "")) den += src[i++]; d /= den ? +den : 2; }
      return d;
    };
    const readNote = () => {
      let acc = 0;
      while (src[i] && "^_=".includes(src[i])) acc += "^" === src[i] ? 1 : "_" === src[i] ? -1 : 0, i++;
      const c = src[i++]; let m = BASE[c.toUpperCase()] + (c === c.toLowerCase() ? 12 : 0) + acc;
      while (src[i] && "',".includes(src[i])) m += "'" === src[i++] ? 12 : -12;
      return m;
    };
    const push = (notes: number[], d: number) => {
      const dd = d * unitBeats * (trip > 0 ? 2 / 3 : 1); trip > 0 && trip--;
      const prev = out[out.length - 1];
      if (tie && prev && prev.n[0] === notes[0]) prev.d += dd; else out.push({ t, d: dd, n: notes, m: stac });
      t += dd, stac = !1, tie = !1;
    };
    while (i < src.length) {
      const c = src[i];
      if ("." === c) { stac = !0, i++; continue; }
      if ("-" === c) { tie = !0, i++; continue; }
      if ("(" === c && "3" === src[i + 1]) { trip = 3, i += 2; continue; }
      if ("z" === c || "x" === c) { i++; const d = readDur() * unitBeats * (trip > 0 ? 2 / 3 : 1); trip > 0 && trip--; t += d, stac = !1; continue; }
      if ("[" === c) { i++; const ns: number[] = []; let d = 0; while (i < src.length && "]" !== src[i]) { /[A-Ga-g^_=]/.test(src[i]) ? (ns.push(readNote()), d = d || readDur()) : i++; } i++; const d2 = /[0-9/]/.test(src[i] || "") ? readDur() : d || 1; push(ns, d2); continue; }
      if (/[A-Ga-g^_=]/.test(c)) { const n = readNote(); push([n], readDur()); continue; }
      i++;
    }
    return { ev: out, len: t };
  }
  const _abcCache = new Map<string, any>();
  const abc = (s: string, u: number) => { const k = u + "|" + s; let v = _abcCache.get(k); return v || (v = abcParse(s, u), _abcCache.set(k, v)), v; };
  const mtof = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

  // ---- drum grids: one char per 16th; x = hit, X = accent, o = open hat, f = flam/ghost
  const DRUM_KITS: Record<string, any> = {
    rock: { k: "x.......x.x.....", s: "....X.......X...", h: "x.x.x.x.x.x.x.x." },
    drive: { k: "x...x...x...x...", s: "....X.......X...", h: "xxxxxxxxxxxxxxxx" },
    half: { k: "x.........x.....", s: "........X.......", h: "x.x.x.x.x.x.x.x." },
    march: { k: "x...x...x...x...", s: "..x...x.X.x.x.xx", c: "........x......." },
    thrash: { k: "xxxxxxxxxxxxxxxx", s: "....X.......X...", h: "x...x...x...x..." },
    gallop: { k: "x.xxx.xxx.xxx.xx", s: "....X.......X...", h: "x.x.x.x.x.x.x.x." },
    punk: { k: "x.x.x.x.x.x.x.x.", s: "..X...X...X...X.", h: "x.x.x.x.x.x.x.x." },
    groove: { k: "x..x..x...x..x..", s: "....X.......X..f", h: "x.x.x.xox.x.x.xo" },
    light: { k: "x.......x.......", s: "....x.......x...", h: "..x...x...x...x." },
    ride: { k: "x.......x.x.....", s: "....x.......x...", r: "x.x.x.x.x.x.x.x." },
    pulse: { k: "x...x...x...x...", h: "..x...x...x...x.", c: "....x.......x..." },
    build: { s: "x.x.x.x.xxxxxxxx", k: "x...x...x...x..." },
    // electronic kits: K = electronic kick, p = clap, S = gated 80s snare
    edm: { K: "x...x...x...x...", p: "....X.......X...", o: "..x...x...x...x.", h: "x.x.x.x.x.x.x.x." },
    house: { K: "x...x...x...x...", p: "....x.......x...", o: "..x...x...x...x." },
    hats: { h: "x...x...x...x...", o: "..x...x...x...x." },
    breaks: { K: "x.....x...x.....", S: "....X.......X..f", h: "xxxxxxxxxxxxxxxx" },
    roll: { K: "x...x...x...x...", p: "x.x.x.x.xxxxxxxx" },
    pop: { K: "x.......x.x.....", S: "....X.......X...", h: "x.x.x.x.x.x.x.x." },
    popdrive: { K: "x...x...x...x...", S: "....X.......X...", h: "xxxxxxxxxxxxxxxx" },
    // march / anthem kits (H = gang "HEY!" shout)
    stomp: { k: "x.x.....x.x.....", p: "....X.......X..." },
    onedrop: { k: "........x.......", s: "........X.......", h: "..x...x...x...x.", c: "....x.......x..." },
    disco: { k: "x...x...x...x...", s: "....X.......X...", o: "..x...x...x...x.", h: "x...x...x...x..." },
    blast: { k: "x.x.x.x.x.x.x.x.", s: ".x.x.x.x.x.x.x.x", r: "x...x...x...x..." },
    tribal: { t: "X..x..x.X..x.xx.", k: "x.......x.......", s: "....x.......x..." },
    funk: { k: "x..x..x...x.x...", s: "....X..f.f..X..f", h: "xxxxxxxxxxxxxxxx" },
    shuffle: { k: "x.......x.x.....", s: "....X.......X...", h: "x.x.x.x.x.x.x.x." },
    doom: { k: "x.......x..x....", s: "........X.......", r: "x...x...x...x..." },
    marchrock: { k: "x...x...x...x...", s: "..x...x.X.x.x.xx", h: "x.x.x.x.x.x.x.x." },
    shout: { k: "x...x...x...x...", s: "....X.......X...", h: "x.x.x.x.x.x.x.x.", H: "....x.......x..." },
    anthem: { k: "x.......x.......", s: "........X.......", H: "............x...", h: "x...x...x...x..." },
    none: {},
  };
  const NOFILL = new Set(["edm", "house", "hats", "roll", "pop", "popdrive", "breaks", "stomp"]);

  // ---- DSP: notes are synthesised in plain JS into sample buffers (polyBLEP
  // oscillators, RBJ biquads, per-note envelopes). A section then needs only a
  // few dozen audio nodes (amps, reverb, mix) instead of thousands of short-lived
  // oscillators, so it renders many times faster than real time.
  let _nz: Float32Array | null = null;
  const NZ = () => { if (!_nz) { _nz = new Float32Array(1 << 16); for (let i = 0; i < _nz.length; i++) _nz[i] = 2 * Math.random() - 1; } return _nz; };
  function BQ() {
    let b0 = 1, b1 = 0, b2 = 0, a1 = 0, a2 = 0, x1 = 0, x2 = 0, y1 = 0, y2 = 0;
    return {
      set(type: string, f: number, q: number, sr: number) {
        const w = 2 * Math.PI * Math.min(Math.max(f, 10), sr * .45) / sr, cs = Math.cos(w), al = Math.sin(w) / (2 * q), a0 = 1 + al;
        "lowpass" === type ? (b0 = (1 - cs) / 2, b1 = 1 - cs, b2 = b0) : "highpass" === type ? (b0 = (1 + cs) / 2, b1 = -(1 + cs), b2 = b0) : (b0 = al, b1 = 0, b2 = -al);
        b0 /= a0, b1 /= a0, b2 /= a0, a1 = -2 * cs / a0, a2 = (1 - al) / a0;
      },
      run(x: number) { const y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2; x2 = x1, x1 = x, y2 = y1, y1 = y; return y; },
    };
  }
  const blep = (p: number, dt: number) => p < dt ? (p /= dt, p + p - p * p - 1) : p > 1 - dt ? (p = (p - 1) / dt, p * p + p + p + 1) : 0;
  // One enveloped voice. osc: [wave, hz, gain] with wave 0 saw, 1 square, 2 sine,
  // 3 noise, 4 triangle. lp: [type, q, f(t)] time-varying filter; fr(t): pitch ratio.
  type Voice = { osc: number[][]; a: number; hold: number; rel: number; peak: number; lp?: [string, number, (t: number) => number]; fr?: (t: number) => number };
  function voice(out: Float32Array, sr: number, t: number, o: Voice) {
    const i0 = Math.max(0, Math.round(t * sr)), n = Math.min(out.length - i0, Math.ceil((o.a + o.hold + o.rel) * sr));
    if (n <= 0) return;
    const nO = o.osc.length, W = new Int8Array(nO), F = new Float64Array(nO), G = new Float64Array(nO), P = new Float64Array(nO);
    for (let k = 0; k < nO; k++) W[k] = o.osc[k][0], F[k] = o.osc[k][1] / sr, G[k] = o.osc[k][2], P[k] = 3 === W[k] ? Math.floor(Math.random() * 65536) : Math.random();
    const nz = NZ(), f = o.lp ? BQ() : null, A = o.a, H = o.a + o.hold, kr = Math.log(1e-4) / o.rel;
    let ratio = 1;
    for (let i = 0; i < n; i++) {
      const tt = i / sr;
      if (0 === (i & 15)) { o.fr && (ratio = o.fr(tt)); f && f.set(o.lp![0], o.lp![2](tt), o.lp![1], sr); }
      let s = 0;
      for (let k = 0; k < nO; k++) {
        const w = W[k];
        if (3 === w) { s += G[k] * nz[(P[k] + i) & 65535]; continue; }
        const dt = F[k] * ratio; let p = P[k] + dt; p >= 1 && (p -= 1), P[k] = p;
        s += G[k] * (0 === w ? 2 * p - 1 - blep(p, dt) : 1 === w ? (p < .5 ? 1 : -1) + blep(p, dt) - blep(p < .5 ? p + .5 : p - .5, dt) : 2 === w ? Math.sin(6.283185307 * p) : 4 * Math.abs(p - .5) - 1);
      }
      f && (s = f.run(s));
      out[i0 + i] += s * o.peak * (tt < A ? tt / A : tt < H ? 1 : Math.exp(kr * (tt - H)));
    }
  }
  const cents = (c: number) => Math.pow(2, c / 1200);
  const sweep = (a: number, b: number, T: number) => (t: number) => a * Math.pow(b / a, Math.min(1, t / T));

  // ---- instruments
  function gtrNote(out: Float32Array, sr: number, t: number, midis: number[], dur: number, mute: boolean, vel: number, clean: boolean, det: number) {
    const nrm = 1 / Math.sqrt(midis.length), osc: number[][] = [];
    for (const m of midis) osc.push([0, mtof(m) * cents(det), nrm], [1, mtof(m) * cents(-det), .5 * nrm]);
    const v: Voice = clean ? { osc, a: .004, hold: 0, rel: Math.min(2.5, dur * 1.8 + .2), peak: .22 * vel, lp: ["lowpass", .8, sweep(3200, 900, dur)] }
      : mute ? { osc, a: .003, hold: Math.min(.05, dur * .4), rel: .09, peak: .5 * vel, lp: ["lowpass", .8, sweep(1500, 500, .1)] }
        : { osc, a: .004, hold: Math.max(.01, dur - .06), rel: .12, peak: .42 * vel };
    voice(out, sr, t, v);
  }
  function bassNote(out: Float32Array, sr: number, t: number, m: number, dur: number, vel: number) {
    voice(out, sr, t, { osc: [[0, mtof(m), 1], [2, mtof(m), .6]], a: .004, hold: Math.max(.01, dur - .04), rel: .08, peak: .5 * vel, lp: ["lowpass", 1.2, sweep(1100, 380, Math.min(.25, dur))] });
  }
  // Lead: guitar (drive applied per section) or synth, with glide + delayed vibrato.
  function leadNote(out: Float32Array, sr: number, t: number, m: number, dur: number, prev: number | null, vel: number, kind: string) {
    const synth = "gtr" !== kind, g0 = prev ? mtof(prev) / mtof(m) : 1, depth = dur > .3 ? synth ? 10 : 14 : 0, vr = Math.min(dur, .45), f = mtof(m);
    voice(out, sr, t, {
      osc: "saw" === kind ? [[0, f * cents(-9), .6], [0, f * cents(9), .6], [0, f * 2, .18]] : [[synth ? 1 : 0, f, 1]], a: .012, hold: Math.max(.02, dur - .05), rel: synth ? .14 : .25, peak: ("saw" === kind ? .3 : synth ? .2 : .3) * vel,
      fr: tt => (tt < .045 ? Math.pow(g0, 1 - tt / .045) : 1) * (depth ? cents(depth * Math.min(1, tt / vr) * Math.sin(35.19 * tt)) : 1),
    });
  }
  function stabHit(out: Float32Array, sr: number, t: number, midis: number[], dur: number, kind: string, vel: number) {
    const osc: number[][] = [], choir = "choir" === kind;
    for (const m of midis) for (const d of choir ? [-10, 0, 10] : [-8, 8]) osc.push([0, mtof(m) * cents(d), choir ? .7 : 1]);
    voice(out, sr, t, { osc, a: .006, hold: Math.max(.02, dur * .6), rel: .35, peak: .2 * vel, lp: choir ? undefined : ["lowpass", .8, tt => tt < .05 ? 400 + 56000 * tt : 3200 * Math.pow(900 / 3200, Math.min(1, (tt - .05) / (dur + .15)))] });
    "hit" === kind && voice(out, sr, t, { osc: [[2, mtof(midis[0] - 12), 1]], a: .003, hold: .05, rel: .5, peak: .1 });
  }
  function padChord(out: Float32Array, sr: number, t: number, midis: number[], dur: number, vel: number) {
    const osc: number[][] = []; for (const m of midis) for (const d of [-7, 7]) osc.push([0, mtof(m) * cents(d), 1]);
    voice(out, sr, t, { osc, a: .5, hold: Math.max(.05, dur - .5), rel: .9, peak: .09 * vel });
  }
  // synth bass: "saw" = squelchy resonant pluck, "reese" = two detuned saws
  function synthBass(out: Float32Array, sr: number, t: number, m: number, dur: number, vel: number, kind: string) {
    const f = mtof(m);
    if ("reese" === kind) voice(out, sr, t, { osc: [[0, f * cents(-14), .7], [0, f * cents(14), .7], [2, f / 2, .5]], a: .006, hold: Math.max(.01, dur - .05), rel: .1, peak: .42 * vel, lp: ["lowpass", 1.4, tt => 700 + 300 * Math.sin(tt * 3)] });
    else voice(out, sr, t, { osc: [[0, f, 1], [1, f / 2, .5]], a: .003, hold: Math.max(.01, dur - .04), rel: .07, peak: .42 * vel, lp: ["lowpass", 2.4, sweep(2200, 260, Math.min(.2, dur + .05))] });
  }
  // arpeggiator pluck
  function arpNote(out: Float32Array, sr: number, t: number, m: number, dur: number, vel: number) {
    voice(out, sr, t, { osc: [[0, mtof(m) * cents(-6), .7], [1, mtof(m) * cents(6), .45]], a: .002, hold: Math.min(.03, dur * .3), rel: .2, peak: .26 * vel, lp: ["lowpass", 2, sweep(5200, 650, .14)] });
  }
  // supersaw chord, spread across two channels
  function supersaw(L: Float32Array, R: Float32Array, sr: number, t: number, midis: number[], dur: number, vel: number) {
    const k = 1 / Math.sqrt(midis.length), env = { a: .008, hold: Math.max(.02, dur - .03), rel: .28, peak: .17 * vel * k };
    for (const [out, dets] of [[L, [-19, -7, 3, 13]], [R, [-13, -3, 7, 19]]] as any[]) {
      const osc: number[][] = []; for (const m of midis) for (const d of dets) osc.push([0, mtof(m) * cents(d), 1]);
      voice(out, sr, t, { osc, ...env });
    }
  }
  // ---- gang chant: formant-synthesised male voices (some an octave down),
  // each with its own pitch/timing jitter and vibrato, through vowel formants.
  // Syllables like "ha", "hey", "ra", "gi", "on": the vowel picks the
  // formants, the first letter adds a consonant (h breath, plosive burst,
  // rolled r, s/f hiss, soft onset for voiced letters).
  const VOW: Record<string, number[][]> = { a: [[730, 1, 6], [1090, .5, 8], [2440, .22, 9]], o: [[570, 1, 6], [840, .6, 7], [2410, .18, 9]], u: [[330, 1, 5], [870, .4, 7], [2240, .12, 9]], e: [[530, 1, 6], [1840, .42, 9], [2480, .25, 9]], i: [[300, 1, 5], [2290, .32, 10], [3010, .2, 10]] };
  function chantNote(L: Float32Array, R: Float32Array, sr: number, t: number, m: number, dur: number, vel: number, syl: string, fall?: number) {
    const w = syl.toLowerCase(), vi = w.search(/[aeiou]/), v = vi < 0 ? "a" : w[vi], c = vi > 0 ? w[0] : "", F = VOW[v];
    const plos = "bdgkpt".includes(c) && !!c, soft = "lmnwyv".includes(c) && !!c, len = Math.ceil((dur + .3) * sr), i0 = Math.round(t * sr);
    const src = new Float32Array(len), nz = NZ(), off = Math.floor(Math.random() * 65536);
    const on = plos ? .018 : "h" === c ? .05 : 0, a = soft ? .08 : plos ? .015 : .045, hold = Math.max(.02, dur - on - a - .04), rel = .16;
    for (let k = 0; k < 6; k++) {
      const f0 = mtof(m) * (2 === k % 3 ? .5 : 1) * cents((Math.random() * 2 - 1) * 16), j = on + Math.random() * .028, vp = Math.random() * 6, vr = 4.6 + Math.random();
      let p = Math.random();
      for (let i = Math.floor(j * sr); i < len; i++) {
        const tt = i / sr - j, fr = cents(9 * Math.sin(vr * 6.283 * tt + vp) - (fall ? fall * 100 * Math.min(1, tt / dur) : 0)), dt = f0 * fr / sr;
        p += dt, p >= 1 && (p -= 1);
        const e = tt < a ? tt / a : tt < a + hold ? 1 : Math.exp(-9.2 * (tt - a - hold) / rel);
        if (e < 1e-4 && tt > a) break;
        src[i] += (2 * p - 1 - blep(p, dt)) * e;
      }
    }
    // breath / consonant noise into the same formants
    for (let i = 0; i < len; i++) {
      const tt = i / sr; let n = .05;
      "h" === c && tt < .07 && (n += 1.2 * (1 - tt / .07));
      plos && tt < .016 && (n += 3 * (1 - tt / .016));
      src[i] += n * nz[(off + i) & 65535] * (tt < dur + .1 ? 1 : 0);
      "r" === c && tt < .09 && (src[i] *= .55 + .45 * Math.cos(6.283 * 27 * tt));
    }
    const bq = F.map(([f, , q]) => { const b = BQ(); b.set("bandpass", f, q, sr); return b; }), lp = BQ(); lp.set("lowpass", 1400, .7, sr);
    const hs = "sf".includes(c) && !!c ? BQ() : null; hs && hs.set("highpass", 3500, .7, sr);
    const g = .3 * vel, dly = Math.round(.009 * sr);
    for (let i = 0; i < len; i++) {
      const x = src[i]; let y = .12 * lp.run(x);
      for (let k = 0; k < 3; k++) y += F[k][1] * bq[k].run(x);
      hs && i < .1 * sr && (y += .5 * hs.run(nz[(off + 7 * i) & 65535]) * (1 - i / (.1 * sr)));
      const o = i0 + i; o < L.length && (L[o] += y * g); o + dly < R.length && (R[o + dly] += y * g * .92);
    }
  }
  const nzHit = (out: Float32Array, sr: number, t: number, type: string, f: number, q: number, d: number, g: number) => voice(out, sr, t, { osc: [[3, 0, 1]], a: .001, hold: 0, rel: d, peak: g, lp: [type, q, () => f] });
  const tnHit = (out: Float32Array, sr: number, t: number, w: number, f0: number, f1: number, sw: number, hold: number, rel: number, g: number) => voice(out, sr, t, { osc: [[w, 1, 1]], a: .001, hold, rel, peak: g, fr: sweep(f0, f1, sw) });
  function drumHit(out: Float32Array, sr: number, lane: string, t: number, acc: boolean) {
    const v = acc ? 1 : .75;
    if ("k" === lane) tnHit(out, sr, t, 2, 170, 48, .07, .02, .32, 1.1 * v), nzHit(out, sr, t, "highpass", 2500, .7, .012, .35 * v), nzHit(out, sr, t, "lowpass", 300, .7, .05, .5 * v);
    else if ("s" === lane || "f" === lane) { const gv = "f" === lane ? .35 : v; nzHit(out, sr, t, "bandpass", 1900, .7, .2, 1.2 * gv), nzHit(out, sr, t, "highpass", 5500, .7, .09, .45 * gv), tnHit(out, sr, t, 4, 200, 150, .08, 0, .12, .6 * gv); }
    else if ("h" === lane) nzHit(out, sr, t, "highpass", 8000, .7, .04, .32 * v);
    else if ("o" === lane) nzHit(out, sr, t, "highpass", 7000, .7, .28, .3 * v);
    else if ("r" === lane) nzHit(out, sr, t, "bandpass", 6500, 1.5, .35, .22 * v), tnHit(out, sr, t, 4, 3150, 3150, 1, 0, .4, .05);
    else if ("C" === lane) nzHit(out, sr, t, "highpass", 4500, .5, 1.9, .5);
    else if ("c" === lane) { for (const f of [850, 1330, 2150, 3400]) tnHit(out, sr, t, 2, f, f, 1, 0, .35, .09); nzHit(out, sr, t, "bandpass", 3000, 2, .08, .4); }
    else if ("t" === lane) tnHit(out, sr, t, 2, acc ? 140 : 190, acc ? 90 : 120, .2, 0, .35, .8);
    else if ("H" === lane) chantNote(out, out, sr, t, acc ? 57 : 55, .12, .8, "hey", 3);
    else if ("K" === lane) tnHit(out, sr, t, 2, 150, 44, .11, .05, .38, .8), nzHit(out, sr, t, "highpass", 3500, .7, .008, .22);
    else if ("p" === lane) { const gv = acc ? .9 : .7; for (const dt of [0, .011, .022]) nzHit(out, sr, t + dt, "bandpass", 1250, 1.3, dt < .02 ? .012 : .16, .75 * gv); }
    else if ("S" === lane) { voice(out, sr, t, { osc: [[3, 0, 1]], a: .001, hold: .16, rel: .05, peak: .35 * v, lp: ["bandpass", .6, () => 2200] }), nzHit(out, sr, t, "bandpass", 1900, .7, .12, .65 * v), tnHit(out, sr, t, 4, 210, 160, .08, 0, .12, .4 * v); }
  }

  // Synthesise every stem of one section into sample arrays.
  function synthSection(song: any, si: number, sr: number) {
    const sec = song.form[si], spb = 60 / song.bpm, barB = 4, bars = sec.bars, N = Math.ceil((bars * barB * spb + 2.4) * sr);
    // swing: pushes off-beat 8ths/16ths late for shuffle / triplet feels
    const sw = sec.swing ?? song.swing ?? 0, SW = (b: number) => { if (!sw) return b; const bi = Math.floor(b + 1e-9), f = b - bi; return bi + (f < .5 ? f * (1 + sw / 3) : .5 + sw / 6 + (f - .5) * (1 - sw / 3)); };
    const T = (beat: number) => SW(beat) * spb + .02, tr = sec.tr || 0, gv = sec.gv || song.gv || "power";
    // key lift for reprises: transpose every pitched part
    const A = (src: string, u: number) => { const r = abc(src, u); return tr ? { len: r.len, ev: r.ev.map((e: any) => ({ t: e.t, d: e.d, m: e.m, n: e.n.map((x: number) => x + tr) })) } : r; };
    const loopEach = (P: any, cb: (e: any, t: number) => void) => { if (!P.len) return; for (let off = 0; off < bars * barB - 1e-6; off += P.len) for (const e of P.ev) { const b = off + e.t; b < bars * barB - 1e-6 && cb(e, b); } };
    const bufs: Record<string, Float32Array> = {}, B = (k: string) => bufs[k] || (bufs[k] = new Float32Array(N));
    const gm = sec.g || null, clean = "clean" === gm, parts = song.parts || {};
    // rhythm guitars: two takes, hard left / right, bass following the riff
    if (sec.r && parts.riffs && parts.riffs[sec.r]) {
      const P = A(parts.riffs[sec.r], .25), oct = 12 * (song.riffOct ?? -2), L = B("gL"), R = B("gR");
      loopEach(P, (e, b) => {
        const root = e.n[0] + oct, voic = clean ? e.n.map((n: number) => n + oct + 12) : e.n.length > 1 ? e.n.map((n: number) => n + oct) : "single" === gv ? [root, root + 12] : [root, root + 7, root + 12];
        const d = e.d * spb, mute = !!e.m || "mute" === gm;
        gtrNote(L, sr, T(b), voic, d, mute, 1, clean, 5), gtrNote(R, sr, T(b) + .006, voic, d, mute, .95, clean, -6);
        !1 !== sec.bass && !clean && bassNote(B("bass"), sr, T(b), root - 12, Math.min(d, e.m ? .18 : d), e.m ? .8 : 1);
      });
      if (clean && !1 !== sec.bass) loopEach(P, (e, b) => { b % 2 < 1e-6 && bassNote(B("bass"), sr, T(b), e.n[0] + oct - 12, 2 * spb * .9, .7); });
    }
    if (sec.bl && parts.bass && parts.bass[sec.bl]) { const bk = sec.bk || song.bassKind; loopEach(A(parts.bass[sec.bl], .25), (e, b) => { const m = e.n[0] + 12 * (song.bassOct ?? -3), d = e.d * spb * .95; bk ? synthBass(B("bass"), sr, T(b), m, d, e.m ? .75 : 1, bk) : bassNote(B("bass"), sr, T(b), m, d, 1); }); }
    if (sec.l && parts.leads && parts.leads[sec.l]) {
      let prev: number | null = null;
      loopEach(A(parts.leads[sec.l], .5), (e, b) => { const m = e.n[0] + 12 * (song.leadOct ?? 0); leadNote(B("lead"), sr, T(b), m, e.d * spb, e.d * spb < .5 ? prev : null, e.m ? .7 : 1, leadKind(song, sec)); prev = m; });
    }
    if (sec.ar && parts.arps && parts.arps[sec.ar]) loopEach(A(parts.arps[sec.ar], .25), (e, b) => arpNote(B("arp"), sr, T(b), e.n[0] + 12 * (song.arpOct ?? 0), e.d * spb, e.m ? .6 : 1));
    if (sec.ss && parts.chords && parts.chords[sec.ss]) loopEach(A(parts.chords[sec.ss], .25), (e, b) => supersaw(B("ssL"), B("ssR"), sr, T(b), e.n.map((n: number) => n + 12 * (song.chordOct ?? 0)), e.d * spb * .95, 1));
    const secLen = bars * barB * spb;
    sec.riser && voice(B("fx"), sr, T(0), { osc: [[3, 0, 1]], a: secLen, hold: 0, rel: .25, peak: .22, lp: ["bandpass", 1.6, sweep(350, 7500, secLen)] });
    sec.impact && (tnHit(B("fx"), sr, T(0), 2, 110, 28, 1.1, .1, 1.3, .9), nzHit(B("fx"), sr, T(0), "lowpass", 900, .7, 1.4, .5));
    if (sec.ch && parts.chants && parts.chants[sec.ch]) {
      const C = parts.chants[sec.ch], syl = String(C.v).split(/[\s|]+/).filter(Boolean), P = A(C.n, .5);
      loopEach(P, (e, b) => chantNote(B("chL"), B("chR"), sr, T(b), e.n[0] + 12 * (song.chantOct ?? 0), e.d * spb, e.m ? .7 : 1, syl[P.ev.indexOf(e) % syl.length] || "a"));
    }
    const stk = sec.stk || song.stabKind || "brass";
    if (sec.st && parts.stabs && parts.stabs[sec.st]) loopEach(A(parts.stabs[sec.st], .25), (e, b) => stabHit(B("stab"), sr, T(b), e.n.map((n: number) => n + 12 * (song.stabOct ?? -1)), e.d * spb, stk, 1));
    if (sec.pd && parts.pads && parts.pads[sec.pd]) loopEach(A(parts.pads[sec.pd], 1), (e, b) => padChord(B("pad"), sr, T(b), e.n.map((n: number) => n + 12 * (song.padOct ?? -1)), e.d * spb, 1));
    // drums
    const kit = DRUM_KITS[sec.d || "none"] || {}, fill = sec.fill !== !1 && "none" !== sec.d && !NOFILL.has(sec.d);
    for (let bar = 0; bar < bars; bar++) {
      const lastBar = bar === bars - 1;
      for (const lane in kit) for (let st = 0; st < 16; st++) {
        const c = kit[lane][st]; if (!c || "." === c) continue;
        if (lastBar && fill && st >= 8 && ("k" === lane || "s" === lane)) continue;
        drumHit(B("drums"), sr, "o" === c ? "o" : "f" === c ? "f" : lane, T(bar * 4 + st / 4), "X" === c);
      }
      if (lastBar && fill) for (let st = 8; st < 16; st++) drumHit(B("drums"), sr, st < 12 ? "s" : "t", T(bar * 4 + st / 4), st >= 14);
      // turnarounds so long sections keep moving: a short snare pickup every
      // 4 bars on rock kits, a clap roll every 8 bars on electronic ones
      if (!lastBar && "none" !== sec.d && sec.d) {
        if (!NOFILL.has(sec.d) && 3 === bar % 4) for (const st of [13, 14, 15]) drumHit(B("drums"), sr, "s", T(bar * 4 + st / 4), 15 === st);
        else if (NOFILL.has(sec.d) && 7 === bar % 8 && "hats" !== sec.d) for (const st of [12, 13, 14, 15]) drumHit(B("drums"), sr, "p", T(bar * 4 + st / 4), 15 === st);
      }
      0 === bar && "none" !== sec.d && !sec.noCrash && drumHit(B("drums"), sr, "C", T(0), !0);
    }
    // sidechain pump: synths duck on every beat under the kick
    if (sec.pump) for (const k of ["ssL", "ssR", "pad", "arp", "bass"]) {
      const b = bufs[k]; if (!b || ("bass" === k && 2 !== sec.pump)) continue;
      const beat = spb * sr, off = .02 * sr, depth = .72, rel = .42 * beat;
      for (let i = 0; i < b.length; i++) { const ph = (i - off) % beat; if (ph >= 0 && ph < rel) { const x = 1 - ph / rel; b[i] *= 1 - depth * x * x; } }
    }
    return { N, bufs };
  }
  const leadKind = (song: any, sec: any) => sec.lk || (sec.synth ? "square" : song.lk || "gtr");
  return { synthSection, abcParse, leadKind };
}

// ---- instruments (all built on an OfflineAudioContext for one section)
function mkMix(ctx: any, spb: number) {
  const out = ctx.createGain(); out.gain.value = .85;
  const glue = ctx.createDynamicsCompressor(); glue.threshold.value = -16, glue.knee.value = 8, glue.ratio.value = 3.5, glue.attack.value = .008, glue.release.value = .2;
  const lim = ctx.createDynamicsCompressor(); lim.threshold.value = -4, lim.knee.value = 0, lim.ratio.value = 20, lim.attack.value = .001, lim.release.value = .08;
  // output is 3 channels: dry stereo mix + a mono reverb send, which the
  // player feeds into one long-lived convolver (building a convolver per
  // section would cost a synchronous FFT setup on the main thread each time)
  const verb = ctx.createGain(); verb.gain.value = .5, verb.channelCount = 1, verb.channelCountMode = "explicit";
  const mrg = ctx.createChannelMerger(3), sd = ctx.createChannelSplitter(2);
  ctx.destination.channelCount = 3, ctx.destination.channelInterpretation = "discrete";
  glue.connect(out), out.connect(lim), lim.connect(sd);
  sd.connect(mrg, 0, 0), sd.connect(mrg, 1, 1), verb.connect(mrg, 0, 2), mrg.connect(ctx.destination);
  const dly = ctx.createDelay(2), fb = ctx.createGain(), dlp = ctx.createBiquadFilter(), dout = ctx.createGain();
  dly.delayTime.value = Math.min(1.9, .75 * spb), fb.gain.value = .2, dlp.type = "lowpass", dlp.frequency.value = 2200, dout.gain.value = .22;
  dly.connect(dlp), dlp.connect(fb), fb.connect(dly), dlp.connect(dout), dout.connect(glue);
  return { glue, verb, dly };
}
function drive(amount: number) { const n = 2048, c = new Float32Array(n); for (let i = 0; i < n; i++) { const x = i / (n / 2) - 1; c[i] = Math.tanh(amount * x + .15 * amount * x * x * .2) / Math.tanh(amount); } return c; }
function chan(ctx: any, M: any, g: number, pan: number, verb: number, delay?: number) {
  const n = ctx.createGain(); n.gain.value = g;
  const p = ctx.createStereoPanner ? ctx.createStereoPanner() : null; let o: any = n;
  p && (p.pan.value = pan, n.connect(p), o = p);
  o.connect(M.glue);
  if (verb) { const s = ctx.createGain(); s.gain.value = verb, o.connect(s), s.connect(M.verb); }
  if (delay) { const s = ctx.createGain(); s.gain.value = delay, o.connect(s), s.connect(M.dly); }
  return n;
}
// Distorted rhythm guitar bus: notes -> drive -> cabinet voicing.
function guitarAmp(ctx: any, dest: any, gain: number, clean?: boolean, tone?: string) {
  const cr = "crunch" === tone, fz = "fuzz" === tone;
  const pre = ctx.createGain(); pre.gain.value = clean ? .6 : cr ? .8 : fz ? 1.5 : 1.25;
  let n: any = pre;
  if (!clean) { const sh = ctx.createWaveShaper(); sh.curve = drive(cr ? 3.5 : fz ? 8 : 6.5), sh.oversample = "2x", pre.connect(sh), n = sh; }
  const hp = ctx.createBiquadFilter(); hp.type = "highpass", hp.frequency.value = clean ? 120 : 85, hp.Q.value = .7;
  const scoop = ctx.createBiquadFilter(); scoop.type = "peaking", scoop.frequency.value = 700, scoop.Q.value = .9, scoop.gain.value = clean ? 0 : -5;
  const pres = ctx.createBiquadFilter(); pres.type = "peaking", pres.frequency.value = 2600, pres.Q.value = 1, pres.gain.value = clean ? 1.5 : 2.5;
  const lp1 = ctx.createBiquadFilter(); lp1.type = "lowpass", lp1.frequency.value = clean ? 5200 : fz ? 3400 : cr ? 4800 : 4300, lp1.Q.value = .6;
  const lp2 = ctx.createBiquadFilter(); lp2.type = "lowpass", lp2.frequency.value = 7800, lp2.Q.value = .5;
  const og = ctx.createGain(); og.gain.value = gain * (cr ? 1.35 : 1);
  n.connect(hp), hp.connect(scoop), scoop.connect(pres), pres.connect(lp1), lp1.connect(lp2), lp2.connect(og), og.connect(dest);
  return pre;
}
// ---- section renderer: stems come from the worker, then an offline graph
// (amps, cabinet EQ, delay, glue compression) mixes them
let musicWorker: any = null, musicWorkerOk = !0, musicDSPInline: any = null, musicJobId = 0;
const musicJobs = new Map<number, (r: any) => void>();
function musicSynth(song: any, si: number, sr: number): Promise<any> {
  if (musicWorkerOk && !musicWorker) try {
    const code = "const D=(" + musicDSP.toString() + ")();onmessage=e=>{const d=e.data,r=D.synthSection(d.song,d.si,d.sr);postMessage({id:d.id,r},Object.values(r.bufs).map(b=>b.buffer))}";
    const url = URL.createObjectURL(new Blob([code], { type: "text/javascript" }));
    musicWorker = new Worker(url), URL.revokeObjectURL(url);
    musicWorker.onmessage = (e: any) => { const f = musicJobs.get(e.data.id); f && (musicJobs.delete(e.data.id), f(e.data.r)); };
    musicWorker.onerror = () => { musicWorkerOk = !1, musicWorker = null; for (const [, f] of musicJobs) f(null); musicJobs.clear(); };
  } catch (e) { musicWorkerOk = !1, musicWorker = null; }
  const inline = () => new Promise(r => setTimeout(r, 0)).then(() => (musicDSPInline || (musicDSPInline = musicDSP())).synthSection(song, si, sr));
  if (!musicWorker) return inline();
  const id = ++musicJobId, w = musicWorker, { name, mood, ...data } = song;
  return new Promise<any>(res => { musicJobs.set(id, res), w.postMessage({ id, song: data, si, sr }); }).then(r => r || inline());
}
const musicLeadKind = (song: any, sec: any) => sec.lk || (sec.synth ? "square" : song.lk || "gtr");
async function renderSection(song: any, si: number, sr: number) {
  const { N, bufs } = await musicSynth(song, si, sr);
  const sec = song.form[si], clean = "clean" === (sec.g || null), stk = sec.stk || song.stabKind || "brass";
  const ctx: any = new (window as any).OfflineAudioContext(3, N, sr);
  const M = mkMix(ctx, 60 / song.bpm);
  const ch = { gtr: chan(ctx, M, .5, 0, .06), bass: chan(ctx, M, .55, 0, 0), drums: chan(ctx, M, .85, 0, .12), lead: chan(ctx, M, .42, .08, .28, .32), stab: chan(ctx, M, .4, -.1, .35), pad: chan(ctx, M, .45, 0, .55) };
  const drumBus = ctx.createDynamicsCompressor(); drumBus.threshold.value = -12, drumBus.ratio.value = 4, drumBus.attack.value = .004, drumBus.release.value = .12, drumBus.connect(ch.drums);
  const pend: [Float32Array[], any][] = [], src = (chans: Float32Array[], dest: any) => pend.push([chans, dest]);
  bufs.gL && src([bufs.gL, bufs.gR], guitarAmp(ctx, ch.gtr, clean ? .9 : .55, clean, song.gtone));
  bufs.bass && src([bufs.bass], ch.bass);
  bufs.drums && src([bufs.drums], drumBus);

  if (bufs.stab) {
    if ("choir" === stk) { const pre = ctx.createGain(); for (const [f, q, l] of [[700, 3.5, 1], [1150, 4.5, .8], [2700, 5, .3]]) { const b = ctx.createBiquadFilter(); b.type = "bandpass", b.frequency.value = f, b.Q.value = q; const bg = ctx.createGain(); bg.gain.value = 1.6 * l, pre.connect(b), b.connect(bg), bg.connect(ch.stab); } src([bufs.stab], pre); }
    else src([bufs.stab], ch.stab);
  }
  // optional filter sweep across the section (intros, builds, outros)
  const secLen = sec.bars * 4 * 60 / song.bpm, swp = (dest: any, def?: number) => {
    const sw = sec.sweep || (def ? [def, def] : null); if (!sw) return dest;
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass", lp.Q.value = 1.2, lp.frequency.setValueAtTime(sw[0], 0), lp.frequency.exponentialRampToValueAtTime(sw[1], secLen), lp.connect(dest); return lp;
  };
  bufs.arp && src([bufs.arp], swp(chan(ctx, M, .5, .12, .3, .38)));
  bufs.fx && src([bufs.fx], chan(ctx, M, .5, 0, .5));
  bufs.chL && src([bufs.chL, bufs.chR], chan(ctx, M, .6, 0, .45));
  bufs.pad && (() => { const lp = ctx.createBiquadFilter(); lp.type = "lowpass", lp.frequency.value = 1400, lp.connect(swp(ch.pad)), src([bufs.pad], lp); })();
  bufs.ssL && src([bufs.ssL, bufs.ssR], swp(chan(ctx, M, .42, 0, .3, .12), 7000));
  if (bufs.lead) {
    const lk = musicLeadKind(song, sec), synth = "gtr" !== lk;
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass", lp.frequency.value = "saw" === lk ? 4600 : synth ? 2600 : 3400, lp.Q.value = .7, lp.connect(ch.lead);
    if (synth) src([bufs.lead], lp);
    else { const pg = ctx.createGain(), sh = ctx.createWaveShaper(); pg.gain.value = 1.1, sh.curve = drive(4), sh.oversample = "2x", pg.connect(sh), sh.connect(lp), src([bufs.lead], pg); }
  }
  for (const [chans, dest] of pend) {
    const b = ctx.createBuffer(chans.length, N, sr); chans.forEach((c, i) => b.copyToChannel(c, i));
    const s = ctx.createBufferSource(); s.buffer = b, s.connect(dest), s.start(0);
  }
  return await ctx.startRendering();
}

// ---- player: sections are rendered one ahead and queued back to back
const musicState: any = { cur: -1, lastMood: "calm" };
function musicMood() {
  try { const recent = S.fx.filter((f: any) => "boom" === f.kind).length + S.projs.length; return recent > 8 ? "battle" : "calm"; } catch (e) { return "calm"; }
}
// Styles and faction flavour: Auto weights each style by the player's faction
// (Vanguard: synth rock + EDM, Legion: rock, Syndicate: synthpop + EDM) and by
// the battle / calm mood; the player can also pick "shuffle all", one style,
// or one track in Settings.
const MUSIC_STYLE_NAMES: Record<string, string> = { rock: "Rock", synthrock: "Synth Rock", edm: "EDM", synthpop: "Synthpop" };
const MUSIC_STYLE_KEYS = Object.keys(MUSIC_STYLE_NAMES);
const FACTION_STYLE_W: Record<string, Record<string, number>> = {
  allied: { synthrock: 3, edm: 2.2, rock: 1, synthpop: .5 },
  soviet: { rock: 4, synthrock: .8, edm: .3, synthpop: .2 },
  yuri: { synthpop: 3, edm: 3, synthrock: .6, rock: .4 },
};
const musicStyleOf = (i: number) => (MUSIC_TRACKS[i] && MUSIC_TRACKS[i].style) || "rock";
function musicPlayerFac() { try { return S.players[0].fac; } catch (e) { return null; } }
const musicRecent: number[] = [];
function pickNextTrack(prev: number) {
  if (trackSel >= 0) return trackSel;
  const total = totalTrackCount(), style = trackSel <= -3 ? MUSIC_STYLE_KEYS[-3 - trackSel] : null;
  if (!style && CUSTOM_MUSIC.length && Math.random() < CUSTOM_MUSIC.length / total) return MUSIC_TRACKS.length + Math.floor(Math.random() * CUSTOM_MUSIC.length);
  const mood = musicMood(), fac = musicPlayerFac(), W = -1 === trackSel && fac ? FACTION_STYLE_W[fac] : null;
  const w = MUSIC_TRACKS.map((t: any, i: number) => {
    const st = musicStyleOf(i);
    if (style && st !== style) return 0;
    let x = W ? (W[st] ?? .5) * (t.fac === fac ? 2 : 1) : 1;
    x *= t.mood === mood ? 3 : 1;
    i === prev && (x *= .02), musicRecent.includes(i) && (x *= .2);
    return x;
  });
  let sum = w.reduce((a: number, b: number) => a + b, 0), r = Math.random() * sum;
  if (sum <= 0) return Math.floor(Math.random() * MUSIC_TRACKS.length);
  for (let i = 0; i < w.length; i++) if ((r -= w[i]) <= 0) return musicRecent.unshift(i), musicRecent.length = Math.min(musicRecent.length, 4), i;
  return w.length - 1;
}
// switching to a style in Settings changes track straight away if needed
function musicStyleSwitch() {
  const style = MUSIC_STYLE_KEYS[-3 - trackSel], cur = musicNowIdx();
  (cur < 0 || musicStyleOf(cur) !== style) && playAnyTrack(pickNextTrack(cur));
}
function musicNowIdx() {
  if (customTrackEl) return MUSIC_TRACKS.length + customTrackIdx;
  const t = AC ? AC.currentTime : 0, s = (musicState.srcs || []).find((x: any) => x.start <= t && x.end - 2.4 > t);
  return s ? s.idx : musicState.cur;
}
function musicNowPlaying() { const i = musicNowIdx(); return i >= 0 && musicOn ? trackName(i) : ""; }
function musicModeOptions() {
  return ['<option value="-1">Auto (faction mix)</option>', '<option value="-2">Shuffle all</option>'].concat(MUSIC_STYLE_KEYS.map((k, i) => '<option value="' + (-3 - i) + '">Style: ' + MUSIC_STYLE_NAMES[k] + "</option>"));
}
function musicTrackLabel(i: number) { return MUSIC_TRACKS[i].name + " · " + MUSIC_STYLE_NAMES[musicStyleOf(i)]; }
function startMusic(first?: number) {
  const ac = audio();
  if (!ac || musicOn || !MUSIC_TRACKS.length) return;
  musicOn = true;
  const mg = ac.createGain(); mg.gain.value = MUSIC_BASE * musicVol, mg.connect(masterGain), musicBus = mg;
  const verb = ac.createConvolver(); verb.buffer = makeImpulse(ac, 2.2, 2.6, .02), verb.connect(mg);
  const sr = Math.min(44100, ac.sampleRate), lowMem = (navigator as any).deviceMemory && (navigator as any).deviceMemory <= 2;
  const rate = lowMem ? 32000 : sr;
  // Producer: renders sections in order and schedules each one back to back,
  // staying MUSIC_AHEAD seconds in front of playback. At the end of a song it
  // flows straight on into the next, so there is never a render gap.
  const MUSIC_AHEAD = 22, sleep = (ms: number) => new Promise(r => setTimeout(r, Math.max(0, ms)));
  const run = async (idx: number, myGen: number, when: number, fadeIn: boolean): Promise<void> => {
    const song = MUSIC_TRACKS[idx], lvl = "calm" === song.mood ? .78 : 1;
    musicState.cur = idx;
    // on a fresh start, buffer ~20s before playing so a short intro is never
    // followed by a long section that hasn't finished rendering yet
    const pend: any[] = []; let buffered = 0;
    for (let si = 0; si < song.form.length; si++) {
      let rb: any; try { rb = await renderSection(song, si, rate); } catch (e) { return; }
      if (!musicOn || myGen !== musicGen) return;
      const len = song.form[si].bars * 4 * 60 / song.bpm;
      if (pend.push([rb, len]), buffered += len, fadeIn && buffered < 20 && si + 1 < song.form.length) continue;
      when = Math.max(when, ac.currentTime + .05);
      for (const [buf, l] of pend.splice(0)) {
        const src = ac.createBufferSource(), g = ac.createGain(); src.buffer = buf, g.gain.value = lvl;
        fadeIn && (g.gain.setValueAtTime(0, when), g.gain.linearRampToValueAtTime(lvl, when + .4), fadeIn = !1);
        const sp = ac.createChannelSplitter(3), dry = ac.createChannelMerger(2);
        src.connect(g), g.connect(sp), sp.connect(dry, 0, 0), sp.connect(dry, 1, 1), sp.connect(verb, 2), dry.connect(mg), src.start(when);
        src.onended = () => { try { g.disconnect(), sp.disconnect(), dry.disconnect(); } catch (e) { } };
        musicState.srcs = (musicState.srcs || []).filter((s: any) => s.end > ac.currentTime), musicState.srcs.push({ src, g, idx, start: when, end: when + buf.duration });
        when += l;
      }
      await sleep((when - ac.currentTime - MUSIC_AHEAD) * 1e3);
      if (!musicOn || myGen !== musicGen) return;
    }
    const nx = pickNextTrack(idx);
    if (nx < MUSIC_TRACKS.length) return run(nx, myGen, when, !1);
    await sleep((when - ac.currentTime - .2) * 1e3);
    myGen === musicGen && playAnyTrack(nx);
  };
  playTrackRef = (i: number) => {
    // fade out whatever is playing, then start the new track
    const now = ac.currentTime;
    for (const s of musicState.srcs || []) { try { s.g.gain.cancelScheduledValues(now), s.g.gain.setValueAtTime(s.g.gain.value, now), s.g.gain.linearRampToValueAtTime(0, now + .6), s.src.stop(now + .7); } catch (e) { } }
    musicState.srcs = [], run(i, ++musicGen, ac.currentTime + .15, !0);
  };
  // pick on the next tick: startGame calls this before the players exist
  setTimeout(() => playAnyTrack(first != null ? first : trackSel >= 0 ? trackSel : pickNextTrack(-1)), 0);
}
// Jukebox controls (launch menu): play a chosen track now, or stop the music.
function musicPlay(i: number) { if (!audio()) return; musicOn ? playAnyTrack(i) : startMusic(i); }
function musicStop() {
  if (!musicOn) return;
  musicGen++, stopCustomTrack();
  const now = AC ? AC.currentTime : 0;
  for (const s of musicState.srcs || []) { try { s.g.gain.cancelScheduledValues(now), s.g.gain.setValueAtTime(s.g.gain.value, now), s.g.gain.linearRampToValueAtTime(0, now + .5), s.src.stop(now + .6); } catch (e) { } }
  musicState.srcs = [], musicState.cur = -1, musicOn = !1;
  const mg = musicBus; musicBus = null, playTrackRef = null;
  setTimeout(() => { try { mg && mg.disconnect(); } catch (e) { } }, 900);
}
const musicIsOn = () => musicOn;
function musicTrackInfo(i: number) { const s = MUSIC_TRACKS[i]; return s ? { name: s.name, style: MUSIC_STYLE_NAMES[musicStyleOf(i)], mood: s.mood, fac: s.fac || "", secs: Math.round(s.form.reduce((a: number, f: any) => a + f.bars * 240 / s.bpm, 0)) } : null; }
function musicSongABC(idx: number) { const s = MUSIC_TRACKS[idx]; return s ? s.parts : null; }

const ADMIN_MUSIC_KEY="ifr_admin_music";function loadAdminMusic(){try{return JSON.parse(localStorage.getItem(ADMIN_MUSIC_KEY)||"[]")}catch(e){return[]}}function saveAdminMusic(list){try{localStorage.setItem(ADMIN_MUSIC_KEY,JSON.stringify(list));return!0}catch(e){return!1}}let CUSTOM_MUSIC=loadAdminMusic();function refreshCustomMusic(){CUSTOM_MUSIC=loadAdminMusic()}function totalTrackCount(){return MUSIC_TRACKS.length+CUSTOM_MUSIC.length}function trackName(i){return i<MUSIC_TRACKS.length?MUSIC_TRACKS[i].name:(CUSTOM_MUSIC[i-MUSIC_TRACKS.length]?CUSTOM_MUSIC[i-MUSIC_TRACKS.length].name:"?")}let customTrackEl=null,customTrackIdx=-1;function stopCustomTrack(){if(customTrackEl){try{customTrackEl.pause()}catch(e){}customTrackEl=null,customTrackIdx=-1}}function playCustomTrack(i){const t=CUSTOM_MUSIC[i];if(!t){trackSel=-1;try{localStorage.setItem("ifr_track","-1")}catch(e){}const total=totalTrackCount();return void(total>0&&playAnyTrack(Math.floor(Math.random()*total)))}stopCustomTrack(),musicOn=!0;const el=new Audio(t.dataUrl);el.volume=muted?0:masterVol*musicVol,customTrackEl=el,customTrackIdx=i,el.onended=()=>{if(customTrackIdx!==i)return;if(trackSel>=0)el.currentTime=0,el.play().catch(()=>{});else{const total=totalTrackCount();total>0&&playAnyTrack(Math.floor(Math.random()*total))}},el.play().catch(()=>{})}function playAnyTrack(idx){idx<MUSIC_TRACKS.length?(stopCustomTrack(),playTrackRef&&playTrackRef(idx)):(musicGen++,playCustomTrack(idx-MUSIC_TRACKS.length))}
let lightningT = 0;

// Campaign characters speak over the radio in their own voice persona.
function speakAs(fac: string, text: string, acc: string, g: "f" | "m", p?: number, r?: number, noClick?: boolean, who?: string) { speakLine(fac, text, !0, P_(acc, g, p || 1, r || 1), 0, noClick, who ? "c_" + who : null); }
function speakStop() { stopVox(); try { "undefined" != typeof speechSynthesis && speechSynthesis.cancel(); } catch (e) { } }
// Recorded length of a cast line in seconds (0 if not recorded).
function castDur(who: string, text: string) { return voxDur("c_" + who, text); }
// Every (voice, line) pair units and announcers can say, for the recording script.
function voiceBankList() {
  const out: any[] = [], seen: any = {}, add = (vx: string, t: any) => { const s = Array.isArray(t) ? t[0] : t; if (!s) return; const k = vx + "|" + s; seen[k] || (seen[k] = 1, out.push({ vox: vx, text: s })); };
  for (const fac of ["allied", "soviet", "yuri"]) {
    const F = VOICE_LINES[fac], units = (FACTIONS[fac] && FACTIONS[fac].units) || [];
    for (const key of units) { const u: any = { key, d: UNITS[key] }; if (!u.d) continue; const role = voiceRoleFor(u), per = personaFor(fac, key, role), vx = voxFor(fac, per); for (const cat of ["sel", "go"]) (unitLines(fac, cat, role, key, per) || []).forEach((t: any) => add(vx, t)); }
    const vxA = voxFor(fac, ANNOUNCER[fac]);
    (F.unit || []).forEach((t: any) => add(vxA, t)), (F.ready || []).forEach((t: any) => add(vxA, t));
    for (const k in F.ann || {}) add(vxA, F.ann[k]);
  }
  return out;
}
// ---- cutscene score: a sustained pad per mood, plus hits on cuts ----------
let cine: any = null;
function cineStop() {
  if (!cine) return;
  const c = cine; cine = null; clearInterval(c.iv);
  try { const t = AC.currentTime; c.out.gain.cancelScheduledValues(t), c.out.gain.setValueAtTime(c.out.gain.value, t), c.out.gain.linearRampToValueAtTime(0, t + 1.2); setTimeout(() => { c.nodes.forEach((n: any) => { try { n.stop(); } catch (e) { } }); try { c.out.disconnect(), c.verb && c.verb.disconnect(); } catch (e) { } }, 1400); } catch (e) { }
  if (musicBus) { const t = AC.currentTime; musicBus.gain.cancelScheduledValues(t), musicBus.gain.setValueAtTime(musicBus.gain.value, t), musicBus.gain.linearRampToValueAtTime(MUSIC_BASE * musicVol, t + 2); }
  customTrackEl && (customTrackEl.volume = muted ? 0 : masterVol * musicVol);
}
// Each mood is a slow chord progression played by a string pad, a sub bass,
// a soft arpeggio and (for some moods) drums or a wordless choir. The whole
// score dips while a character is speaking so it never masks dialogue.
const CINE_MOODS: Record<string, any> = {
  tense: { bpm: 66, prog: [[45, 48, 52], [41, 45, 48], [48, 52, 55], [43, 47, 50]], arp: 1, lp: 1500, g: .1 },
  dread: { bpm: 56, prog: [[38, 41, 45], [39, 43, 46], [38, 41, 45], [45, 48, 52]], arp: .5, lp: 900, g: .11, low: 1 },
  war: { bpm: 84, prog: [[40, 43, 47], [36, 40, 43], [38, 42, 45], [40, 43, 47]], arp: 1, lp: 1800, g: .1, drums: 1 },
  hive: { bpm: 58, prog: [[45, 47, 52], [44, 47, 51], [42, 45, 50], [44, 47, 52]], arp: .6, lp: 2200, g: .09, choir: 1 },
  hope: { bpm: 70, prog: [[48, 52, 55], [43, 47, 50], [45, 48, 52], [41, 45, 48]], arp: 1, lp: 2600, g: .09, bright: 1 },
};
const mtof = (n: number) => 440 * Math.pow(2, (n - 69) / 12);
function cineNote(c: any, t: number, f: number, d: number, o: any) {
  const os = AC.createOscillator(), g = AC.createGain(); os.type = o.w || "sawtooth", os.frequency.value = f, o.det && (os.detune.value = o.det);
  let n: any = os; if (o.lp) { const fl = AC.createBiquadFilter(); fl.type = o.bp ? "bandpass" : "lowpass", fl.frequency.value = o.lp, fl.Q.value = o.q || .7, os.connect(fl), n = fl; }
  const a = o.a || .01, r = o.r || .3; g.gain.setValueAtTime(0, t), g.gain.linearRampToValueAtTime(o.g, t + a), g.gain.setValueAtTime(o.g, t + Math.max(a, d - r)), g.gain.linearRampToValueAtTime(0, t + d);
  n.connect(g), g.connect(c.bus), o.verb && c.verb && g.connect(c.verb), os.start(t), os.stop(t + d + .05);
}
function cineSchedule(c: any) {
  const M = c.M, beat = 60 / M.bpm, bar = 4 * beat, chordLen = 2 * bar;
  while (c.next < AC.currentTime + .6) {
    const t = c.next, ci = c.step >> 4 & 3, ch = M.prog[(c.step >> 4) % M.prog.length], sub = c.step & 15, o = M.low ? -12 : 0;
    if (0 === sub) {
      // pad: detuned saws, slow swell
      for (const n of ch) for (const det of [-9, 8]) cineNote(c, t, mtof(n + 12 + o), chordLen + .8, { w: "sawtooth", det, lp: M.lp, g: .028, a: 1.4, r: 1.4, verb: 1 });
      cineNote(c, t, mtof(ch[0] - 12 + o), chordLen, { w: "sine", g: .12, a: .3, r: 1 });
      if (M.choir) for (const n of [ch[1] + 12, ch[2] + 12]) for (const fm of [700, 1150]) cineNote(c, t, mtof(n), chordLen + .5, { w: "sawtooth", lp: fm, bp: 1, q: 6, g: .05, a: 2, r: 1.8, verb: 1 });
      if (M.bright) cineNote(c, t, mtof(ch[2] + 24), bar, { w: "triangle", g: .025, a: .02, r: bar - .1, verb: 1 });
    }
    // arpeggio on eighth notes
    if (Math.random() < M.arp) { const pat = [0, 1, 2, 1, 0, 2, 1, 2], n = ch[pat[sub & 7]] + 24 + (sub > 7 && M.bright ? 12 : 0) + o; cineNote(c, t, mtof(n), beat * .9, { w: "triangle", g: .022, a: .005, r: beat * .8, lp: 3000, verb: 1 }); }
    if (M.drums) { const onBeat = sub % 2 == 0, bi = sub >> 1;
      if (onBeat && (0 === bi || 3 === bi || 5 === bi)) sNoise(t, { brown: 1, f: 220, g: .32 * c.vol, d: .5, verb: .25, dest: c.bus }), sOsc(t, { f: 90, f2: 38, g: .3 * c.vol, d: .4, dest: c.bus });
      if (onBeat && (2 === bi || 6 === bi)) sNoise(t, { type: "bandpass", f: 1400, q: .9, g: .1 * c.vol, d: .18, verb: .3, dest: c.bus });
      sub % 2 == 1 && sNoise(t, { type: "highpass", f: 7000, g: .02 * c.vol, d: .04, dest: c.bus }); }
    void ci; c.step++, c.next += beat / 2;
  }
}
function cineMood(mood: string) {
  if (!sOK()) return;
  if (cine && cine.mood === mood) return;
  cineStop();
  const M = CINE_MOODS[mood] || CINE_MOODS.tense, t = AC.currentTime, out = AC.createGain(), bus = AC.createGain();
  const vol = Math.max(.05, musicVol), base = M.g * vol * 3.2;
  out.gain.setValueAtTime(0, t), out.gain.linearRampToValueAtTime(base, t + 2), bus.connect(out), out.connect(masterGain);
  let verb: any = null; try { verb = AC.createGain(), verb.gain.value = .5, verb.connect(verbIn); } catch (e) { verb = null; }
  const c: any = { out, bus, verb, M, mood, next: t + .05, step: 0, nodes: [], vol, base };
  // keep the score under the dialogue
  c.iv = setInterval(() => { if (cine !== c || !sOK()) return; cineSchedule(c); const talking = voxBusy() || "undefined" != typeof speechSynthesis && speechSynthesis.speaking; c.out.gain.setTargetAtTime(talking ? c.base * .42 : c.base, AC.currentTime, .35); }, 120);
  cineSchedule(c);
  if (musicBus) { const tt = AC.currentTime; musicBus.gain.cancelScheduledValues(tt), musicBus.gain.setValueAtTime(musicBus.gain.value, tt), musicBus.gain.linearRampToValueAtTime(0, tt + 1.2); }
  customTrackEl && (customTrackEl.volume = 0);
  cine = c;
}
function cineHit(kind: string) {
  if (!sOK()) return;
  const t = AC.currentTime + .01;
  switch (kind) {
    case "boom": sNoise(t, { brown: 1, f: 380, f2: 60, g: .7, d: 3, verb: .5 }), sOsc(t, { f: 70, f2: 24, g: .55, d: 2.2 }), sNoise(t, { f: 3000, f2: 200, g: .25, d: .6 }); break;
    case "whoosh": sNoise(t, { type: "bandpass", f: 250, f2: 3200, q: 1.2, g: .25, a: .5, d: .6, verb: .3 }); break;
    case "riser": sOsc(t, { w: "sawtooth", f: 110, f2: 880, sw: 2.4, g: .06, a: 1.8, d: .7, lp: 2200, verb: .4 }), sNoise(t, { type: "highpass", f: 800, f2: 6000, g: .08, a: 2, d: .5 }); break;
    case "alarm": for (let i = 0; i < 6; i++) sOsc(t + .32 * i, { w: "square", f: i % 2 ? 660 : 880, g: .05, d: .28, lp: 2500, verb: .2 }); break;
    case "glitch": for (let i = 0; i < 7; i++) sNoise(t + .05 * i + .03 * Math.random(), { type: "bandpass", f: 800 + 5e3 * Math.random(), q: 3, g: .12, d: .04 }); break;
    case "sting": for (const f of [55, 82.4, 110, 130.8]) sOsc(t, { w: "sawtooth", f, g: .07, d: 2.4, lp: 900, verb: .5 }); sNoise(t, { brown: 1, f: 200, g: .4, d: 1.5 }); break;
    case "pulse": sOsc(t, { f: 180, f2: 90, g: .12, d: .5, verb: .4 }); break;
    case "static": sNoise(t, { type: "highpass", f: 2000, g: .18, d: .6 }); break;
  }
}
Object.assign(window, {
  speakAs, speakStop, castDur, voxBusy, voiceBankList, cineMood, cineStop, cineHit, audio, sfx, sfxHit, setMuted, setMasterVol, setSfxVol, setMusicVol,
  setTrackSel, setRainAmbience, startFpsAmbience, stopFpsAmbience, startMusic, MUSIC_TRACKS,
  loadAdminMusic, saveAdminMusic, refreshCustomMusic, totalTrackCount, trackName,
  playVoiceLine, setVoicesEnabled, announce, announceHint, audioTap, musicRenderSection: renderSection, musicStems: musicSynth, musicSongABC,
  musicModeOptions, musicTrackLabel, musicNowPlaying, pickNextTrack, musicPlay, musicStop, musicIsOn, musicNowIdx, musicTrackInfo,
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
  musicBus: { get: () => musicBus, configurable: true },
});

// ===== Admin panel =====
// Two independent tools, both reachable from a new "ADMIN" button on the
// skirmish setup screen and both persisted to localStorage (this browser
// only, no server):
//  - Asset manager: upload a .glb/.gltf to replace a unit or building's
//    model, optionally scoped to one faction (registerModelAsset already
//    supports a "key:faction" composite key - see src/models.ts).
//  - Map editor: paint terrain (including water), raise/lower land, seed
//    ore deposits, place neutral/capturable buildings and spawn points,
//    then save the result as a custom map that shows up in the normal
//    skirmish map dropdown (see CUSTOM_MAPS/loadStaticMap in src/sim.ts).

const ADMIN_ASSETS_KEY = "ifr_admin_assets";
const ADMIN_STATS_KEY = "ifr_admin_stats";
const ADMIN_MAPS_KEY = "ifr_admin_maps";
const CATEGORY_OPTIONS = [
  { k: "", n: "(default)" },
  { k: "inf", n: "Infantry" },
  { k: "veh", n: "Vehicles" },
  { k: "air", n: "Air" },
  { k: "sea", n: "Navy" },
  { k: "bld", n: "Structures" },
  { k: "def", n: "Defense" },
  { k: "none", n: "Hidden" },
];
const MINIBTN = 'style="padding:6px 10px;border-radius:6px;border:1px solid #5b74a0;background:#22334a;color:#cfe0f5;font-size:11px;margin:2px 4px 2px 0"';
const MINIBTN_DANGER = 'style="padding:6px 10px;border-radius:6px;border:1px solid #a04040;background:#2a1c1c;color:#f0a0a0;font-size:11px;margin:2px 4px 2px 0"';
const FACTION_LIST = [
  { k: "", n: "All factions" },
  { k: "allied", n: "Vanguard" },
  { k: "soviet", n: "Legion" },
  { k: "yuri", n: "Syndicate" },
];

function loadAdminAssets() {
  try { return JSON.parse(localStorage.getItem(ADMIN_ASSETS_KEY) || "[]"); }
  catch (e) { return []; }
}
function saveAdminAssets(list) {
  try { localStorage.setItem(ADMIN_ASSETS_KEY, JSON.stringify(list)); }
  catch (e) { hint("Could not save — browser storage full?"); }
}
function loadAdminStats() {
  try { return JSON.parse(localStorage.getItem(ADMIN_STATS_KEY) || "{}"); }
  catch (e) { return {}; }
}
function saveAdminStats(map) {
  try { localStorage.setItem(ADMIN_STATS_KEY, JSON.stringify(map)); }
  catch (e) { hint("Could not save — browser storage full?"); }
}
function loadAdminMapStore() {
  try { return JSON.parse(localStorage.getItem(ADMIN_MAPS_KEY) || "{}"); }
  catch (e) { return {}; }
}
function saveAdminMapStore(store) {
  try { localStorage.setItem(ADMIN_MAPS_KEY, JSON.stringify(store)); return true; }
  catch (e) { hint("Could not save map — browser storage full?"); return false; }
}
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function applyAdminAssets() {
  for (const a of loadAdminAssets()) registerModelAsset(a.key, a.dataUrl, a.scale, a.faction || undefined);
}
function finiteNum(v) {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}
function applyAdminStat(key, ov) {
  const d = ov.kind === "unit" ? UNITS[key] : BLD[key];
  if (!d) return;
  const cost = finiteNum(ov.cost);
  if (cost != null && cost >= 0) d.cost = cost;
  const hp = finiteNum(ov.hp);
  if (hp != null && hp > 0) d.hp = hp;
  if (ov.tab !== undefined) d.tab = ov.tab || null;
  const target = ov.kind === "unit" ? d : d.weapon;
  if (target) {
    const vsInf = finiteNum(ov.vsInf);
    if (vsInf != null) target.vsInf = vsInf;
    const vsVeh = finiteNum(ov.vsVeh);
    if (vsVeh != null) target.vsVeh = vsVeh;
    const vsBldg = finiteNum(ov.vsBldg);
    if (vsBldg != null) target.vsBldg = vsBldg;
    if (ov.aa !== undefined) target.aa = !!ov.aa;
    const dps = finiteNum(ov.dps);
    if (dps != null && dps >= 0 && target.rof) target.dmg = dps * target.rof;
  }
}
function applyAdminStats() {
  const stats = loadAdminStats();
  for (const key of Object.keys(stats)) applyAdminStat(key, stats[key]);
}
function syncCustomMaps() {
  for (let i = MAPS.length - 1; i >= 0; i--) if (MAPS[i].custom) MAPS.splice(i, 1);
  for (const k of Object.keys(CUSTOM_MAPS)) delete CUSTOM_MAPS[k];
  const store = loadAdminMapStore();
  for (const key of Object.keys(store)) {
    const entry = store[key];
    CUSTOM_MAPS[key] = entry.data;
    MAPS.push({ k: key, n: entry.name, s: "Custom map", mp: Math.max(2, (entry.data.spots || []).length), custom: true });
  }
}
applyAdminAssets();
applyAdminStats();
syncCustomMaps();

function blankMapData() {
  const n = 6624;
  return {
    terr: packArr(new Uint8Array(n)),
    ore: packArr(new Float32Array(n)),
    tib: packArr(new Uint8Array(n)),
    blk: packArr(new Uint8Array(n)),
    pave: packArr(new Uint8Array(n)),
    elevOverride: packArr(new Float32Array(n)),
    spots: [[13, 13], [76, 56]],
    civ: [], special: [], props: [], oreSpots: [],
  };
}

// ---------- Menu shell ----------

let adminTab = "assets";
function showAdmin() {
  adminTab = "assets";
  $("#menu").classList.remove("hidden");
  $("#panelMain").classList.add("wide");
  renderAdminPanel();
}
function closeAdmin() {
  $("#panelMain").classList.remove("wide");
  showSetup();
}
function renderAdminPanel() {
  $("#panelMain").innerHTML =
    '<h1>ADMIN</h1><div class="sub">Custom assets &amp; maps — saved in this browser only</div>' +
    '<div style="display:flex;gap:6px;margin:10px 0;position:sticky;top:0;z-index:5;background:#101a1e;padding:4px 0">' +
      '<button id="tabAssets" class="tabBtn' + (adminTab === "assets" ? " on" : "") + '">ASSETS</button>' +
      '<button id="tabMaps" class="tabBtn' + (adminTab === "maps" ? " on" : "") + '">MAPS</button>' +
      '<button id="tabMusic" class="tabBtn' + (adminTab === "music" ? " on" : "") + '">MUSIC</button>' +
      '<button id="backAdminTop" ' + MINIBTN + '>BACK</button>' +
    '</div>' +
    '<div id="adminBody"></div>' +
    '<button id="backAdmin" ' + SECBTN + '>BACK</button>';
  $("#tabAssets").onclick = () => { adminTab = "assets"; renderAdminPanel(); };
  $("#tabMaps").onclick = () => { adminTab = "maps"; renderAdminPanel(); };
  $("#tabMusic").onclick = () => { adminTab = "music"; renderAdminPanel(); };
  $("#backAdmin").onclick = closeAdmin;
  $("#backAdminTop").onclick = closeAdmin;
  if (adminTab === "assets") renderAssetsTab(); else if (adminTab === "maps") renderMapsTab(); else renderMusicTab();
}

// ---------- Assets tab ----------

const ASSET_CATEGORIES = [
  { k: "", n: "All" },
  { k: "inf", n: "Infantry" },
  { k: "veh", n: "Vehicles" },
  { k: "air", n: "Air" },
  { k: "sea", n: "Navy" },
  { k: "bld", n: "Structures" },
  { k: "def", n: "Defense" },
  { k: "other", n: "Other" },
];
let assetCategoryFilter = "";
let assetSearchFilter = "";

function assetDisplayName(key, kind) {
  if (kind === "unit") return (UNITS[key] && UNITS[key].name) || key;
  return (BLD[key] && BLD[key].names && (BLD[key].names.neutral || BLD[key].names.allied)) || key;
}
function assetCategory(key, kind) {
  const d = kind === "unit" ? UNITS[key] : BLD[key];
  const t = d && d.tab;
  return ASSET_CATEGORIES.some(c => c.k === t) ? t : "other";
}
function assetFactionMembership(key, kind) {
  if (kind === "unit") {
    const facs = ["allied", "soviet", "yuri"].filter(f => FACTIONS[f] && FACTIONS[f].units && FACTIONS[f].units.includes(key));
    if (!facs.length) return "None";
    return facs.map(f => FACTIONS[f].name).join(", ");
  }
  return (BLD[key] && BLD[key].civ) ? "Neutral" : "All factions";
}
function assetPrimaryFaction(key, kind) {
  if (kind === "unit") {
    const f = ["allied", "soviet", "yuri"].find(f => FACTIONS[f] && FACTIONS[f].units && FACTIONS[f].units.includes(key));
    return f || "allied";
  }
  return (BLD[key] && BLD[key].civ) ? "neutral" : "allied";
}
function assetStatTarget(key, kind) {
  const d = kind === "unit" ? UNITS[key] : BLD[key];
  if (!d) return null;
  return kind === "unit" ? d : (d.weapon || null);
}
function assetRow(key, kind) {
  const entries = loadAdminAssets().filter(a => a.key === key);
  const tags = entries.map(a =>
    '<span class="adminTag">' + (a.faction || "all") +
    '<button data-key="' + key + '" data-fac="' + (a.faction || "") + '">✕</button></span>'
  ).join("");
  const d = kind === "unit" ? UNITS[key] : BLD[key];
  const stat = loadAdminStats()[key] || {};
  const target = assetStatTarget(key, kind);
  const curDps = target && target.rof ? +(target.dmg / target.rof).toFixed(2) : 0;
  const combatInputs = target ? (
    '<input type="number" step="0.05" class="vsInfOv" value="' + (stat.vsInf ?? "") + '" placeholder="vsInf ' + (target.vsInf ?? 0) + '" style="width:56px" title="Anti-Infantry multiplier">' +
    '<input type="number" step="0.05" class="vsVehOv" value="' + (stat.vsVeh ?? "") + '" placeholder="vsVeh ' + (target.vsVeh ?? 0) + '" style="width:56px" title="Anti-Vehicle multiplier">' +
    '<input type="number" step="0.05" class="vsBldgOv" value="' + (stat.vsBldg ?? "") + '" placeholder="vsBldg ' + (target.vsBldg ?? 0) + '" style="width:56px" title="Anti-Structure multiplier">' +
    '<input type="number" step="1" class="dpsOv" value="' + (stat.dps ?? "") + '" placeholder="DPS ' + curDps + '" style="width:64px"' + (target.rof ? "" : " disabled") + ' title="' + (target.rof ? "Damage per second — recalculates the underlying damage from the current rate of fire" : "This unit has no rate of fire (unarmed/support) — DPS does not apply") + '">' +
    '<label class="small" style="white-space:nowrap"><input type="checkbox" class="aaOv"' + (stat.aa != null ? stat.aa ? " checked" : "" : target.aa ? " checked" : "") + '> Anti-Air</label>'
  ) : "";
  return (
    '<div class="adminRow" data-key="' + key + '" data-kind="' + kind + '">' +
      '<img class="assetThumb" data-thumb-key="' + key + '" data-thumb-kind="' + kind + '" width="40" height="40">' +
      '<div class="rowName">' + assetDisplayName(key, kind) +
        '<div class="small" style="opacity:.75">' + assetFactionMembership(key, kind) + '</div>' +
      '</div>' +
      '<select class="facSel">' + FACTION_LIST.map(f => '<option value="' + f.k + '">' + f.n + '</option>').join("") + '</select>' +
      '<input type="file" class="fileSel" accept=".glb,.gltf">' +
      '<input type="number" class="scaleSel" value="1" min="0.05" step="0.05" style="width:52px">' +
      tags +
      '<div class="statRow" data-key="' + key + '" data-kind="' + kind + '" style="flex-basis:100%;display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:4px">' +
        '<input type="number" class="costOv" value="' + (stat.cost ?? "") + '" placeholder="Cost ' + (d.cost || 0) + '" style="width:80px" title="Cost override">' +
        '<input type="number" class="hpOv" value="' + (stat.hp ?? "") + '" placeholder="HP ' + (d.hp || 0) + '" style="width:70px" title="Hit points override">' +
        '<select class="tabOv" title="Category override">' + CATEGORY_OPTIONS.map(c => '<option value="' + c.k + '"' + (stat.tab === c.k ? " selected" : "") + '>' + c.n + '</option>').join("") + '</select>' +
        combatInputs +
      '</div>' +
    '</div>'
  );
}
function renderAssetsTab() {
  const unitKeys = Object.keys(UNITS).filter(k =>
    (!assetCategoryFilter || assetCategory(k, "unit") === assetCategoryFilter) &&
    (!assetSearchFilter || assetDisplayName(k, "unit").toLowerCase().includes(assetSearchFilter))
  );
  const bldKeys = Object.keys(BLD).filter(k =>
    (!assetCategoryFilter || assetCategory(k, "building") === assetCategoryFilter) &&
    (!assetSearchFilter || assetDisplayName(k, "building").toLowerCase().includes(assetSearchFilter))
  );
  const unitRows = unitKeys.map(k => assetRow(k, "unit")).join("") || '<div class="small">No units match.</div>';
  const bldRows = bldKeys.map(k => assetRow(k, "building")).join("") || '<div class="small">No buildings match.</div>';
  $("#adminBody").innerHTML =
    '<div class="small" style="margin-bottom:8px">Upload a .glb/.gltf to replace a unit or building\'s model, and optionally override its cost, category, and combat role. ' +
    'Pick a faction to scope a model to just that faction\'s look, or leave "All factions" to replace it everywhere it appears.</div>' +
    '<div style="display:flex;gap:8px;margin-bottom:10px">' +
      '<button id="exportAssetsBtn" ' + MINIBTN + '>EXPORT ASSETS (.json)</button>' +
      '<button id="importAssetsBtn" ' + MINIBTN + '>IMPORT ASSETS (.json)</button>' +
      '<input type="file" id="importAssetsFile" accept=".json" style="display:none">' +
    '</div>' +
    '<div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-bottom:10px">' +
      ASSET_CATEGORIES.map(c => '<button data-cat="' + c.k + '" class="catBtn' + (assetCategoryFilter === c.k ? " on" : "") + '">' + c.n + '</button>').join("") +
      '<input type="text" id="assetSearch" placeholder="Search by name…" value="' + assetSearchFilter.replace(/"/g, "&quot;") + '" style="margin-left:8px;flex:1;min-width:140px">' +
    '</div>' +
    '<div class="lbl">UNITS</div><div id="unitAssetRows">' + unitRows + '</div>' +
    '<div class="lbl">BUILDINGS</div><div id="bldAssetRows">' + bldRows + '</div>';
  $("#exportAssetsBtn").onclick = () => {
    const blob = new Blob([JSON.stringify({ assets: loadAdminAssets(), stats: loadAdminStats() }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "ifr_assets.json"; a.click();
  };
  $("#importAssetsBtn").onclick = () => $("#importAssetsFile").click();
  ($("#importAssetsFile") as HTMLInputElement).onchange = (e: Event) => {
    const file = (e.target as HTMLInputElement).files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const assets = Array.isArray(parsed.assets) ? parsed.assets : (Array.isArray(parsed) ? parsed : []);
        const stats = parsed.stats && "object" == typeof parsed.stats ? parsed.stats : {};
        saveAdminAssets(assets);
        saveAdminStats(stats);
        applyAdminAssets();
        applyAdminStats();
        renderAssetsTab();
        hint("Assets imported");
      } catch (err) { hint("That file couldn't be read as an asset export"); }
    };
    reader.readAsText(file);
  };
  $("#adminBody").querySelectorAll("[data-cat]").forEach(btn => {
    btn.onclick = () => { assetCategoryFilter = btn.dataset.cat; renderAssetsTab(); };
  });
  const searchEl = $("#assetSearch") as HTMLInputElement;
  if (searchEl) {
    searchEl.oninput = () => { assetSearchFilter = searchEl.value.trim().toLowerCase(); };
    searchEl.onchange = () => renderAssetsTab();
    searchEl.addEventListener("keydown", (e: KeyboardEvent) => { if (e.key === "Enter") renderAssetsTab(); });
  }
  $("#adminBody").querySelectorAll(".assetThumb").forEach((img: HTMLImageElement) => {
    const key = img.dataset.thumbKey, kind = img.dataset.thumbKind === "unit" ? "u" : "b";
    renderThumbInto(img, key, kind, assetPrimaryFaction(key, img.dataset.thumbKind), 40);
  });
  $("#adminBody").querySelectorAll(".adminRow").forEach(row => {
    const key = row.dataset.key, kind = row.dataset.kind;
    row.querySelector(".fileSel").addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const faction = row.querySelector(".facSel").value || null;
      const scale = parseFloat(row.querySelector(".scaleSel").value) || 1;
      const dataUrl = await fileToDataUrl(file) as string;
      const list = loadAdminAssets().filter(a => !(a.key === key && (a.faction || "") === (faction || "")));
      list.push({ key, faction, dataUrl, scale, kind });
      saveAdminAssets(list);
      registerModelAsset(key, dataUrl, scale, faction || undefined);
      hint("Custom model applied to " + assetDisplayName(key, kind) + (faction ? " (" + faction + ")" : ""));
      renderAssetsTab();
    });
  });
  $("#adminBody").querySelectorAll(".adminTag button").forEach(btn => {
    btn.onclick = () => {
      const key = btn.dataset.key, faction = btn.dataset.fac || null;
      const list = loadAdminAssets().filter(a => !(a.key === key && (a.faction || "") === (faction || "")));
      saveAdminAssets(list);
      unregisterModelAsset(key, faction || undefined);
      renderAssetsTab();
    };
  });
  $("#adminBody").querySelectorAll(".statRow").forEach((row: HTMLElement) => {
    const key = row.dataset.key, kind = row.dataset.kind;
    const readStat = () => {
      const stats = loadAdminStats();
      const ov: any = { kind };
      const cost = (row.querySelector(".costOv") as HTMLInputElement).value;
      if (cost !== "") ov.cost = parseFloat(cost);
      const hp = (row.querySelector(".hpOv") as HTMLInputElement).value;
      if (hp !== "") ov.hp = parseFloat(hp);
      const tab = (row.querySelector(".tabOv") as HTMLSelectElement).value;
      if (tab) ov.tab = tab;
      const vsInfEl = row.querySelector(".vsInfOv") as HTMLInputElement;
      if (vsInfEl && vsInfEl.value !== "") ov.vsInf = parseFloat(vsInfEl.value);
      const vsVehEl = row.querySelector(".vsVehOv") as HTMLInputElement;
      if (vsVehEl && vsVehEl.value !== "") ov.vsVeh = parseFloat(vsVehEl.value);
      const vsBldgEl = row.querySelector(".vsBldgOv") as HTMLInputElement;
      if (vsBldgEl && vsBldgEl.value !== "") ov.vsBldg = parseFloat(vsBldgEl.value);
      const dpsEl = row.querySelector(".dpsOv") as HTMLInputElement;
      if (dpsEl && dpsEl.value !== "") ov.dps = parseFloat(dpsEl.value);
      const aaEl = row.querySelector(".aaOv") as HTMLInputElement;
      if (aaEl) ov.aa = aaEl.checked;
      if (Object.keys(ov).length <= 1) delete stats[key]; else stats[key] = ov;
      saveAdminStats(stats);
      if (stats[key]) applyAdminStat(key, stats[key]);
    };
    row.querySelectorAll("input,select").forEach(el => el.addEventListener("change", readStat));
  });
}

// ---------- Maps tab ----------

function renderMapsTab() {
  const store = loadAdminMapStore();
  const keys = Object.keys(store);
  const rows = keys.map(key => {
    const entry = store[key], spawnCount = (entry.data.spots || []).length;
    return (
      '<div class="adminRow" data-key="' + key + '">' +
        '<div class="rowName">' + entry.name + ' <span class="small">(' + spawnCount + ' spawns)</span></div>' +
        '<button data-act="edit" data-key="' + key + '" ' + MINIBTN + '>EDIT</button>' +
        '<button data-act="dup" data-key="' + key + '" ' + MINIBTN + '>DUPLICATE</button>' +
        '<button data-act="export" data-key="' + key + '" ' + MINIBTN + '>EXPORT</button>' +
        '<button data-act="del" data-key="' + key + '" ' + MINIBTN_DANGER + '>DELETE</button>' +
      '</div>'
    );
  }).join("") || '<div class="small" style="margin-bottom:8px">No custom maps yet — make one below.</div>';
  $("#adminBody").innerHTML =
    '<div class="small" style="margin-bottom:8px">Build a fully custom map with the editor, or import one someone shared with you. Custom maps show up in the skirmish Map dropdown.</div>' +
    '<div id="mapRows">' + rows + '</div>' +
    '<button id="newMapBtn" ' + SECBTN + '>+ NEW MAP</button>' +
    '<button id="importMapBtn" ' + SECBTN + '>IMPORT MAP (.json)</button>' +
    '<input type="file" id="importMapFile" accept=".json" style="display:none">';
  $("#newMapBtn").onclick = () => {
    const name = prompt("Name this map:", "My Map");
    if (!name) return;
    const key = "custom_" + Date.now();
    const store2 = loadAdminMapStore();
    store2[key] = { name, data: blankMapData() };
    saveAdminMapStore(store2);
    syncCustomMaps();
    openMapEditor(key);
  };
  $("#importMapBtn").onclick = () => $("#importMapFile").click();
  $("#importMapFile").onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const key = "custom_" + Date.now();
        const store2 = loadAdminMapStore();
        store2[key] = { name: parsed.name || "Imported map", data: parsed.data || parsed };
        saveAdminMapStore(store2);
        syncCustomMaps();
        renderMapsTab();
        hint("Map imported");
      } catch (err) { hint("That file couldn't be read as a map"); }
    };
    reader.readAsText(file);
  };
  $("#adminBody").querySelectorAll("[data-act]").forEach(btn => {
    btn.onclick = () => {
      const key = btn.dataset.key, act = btn.dataset.act, store2 = loadAdminMapStore();
      if (!store2[key]) return;
      if (act === "edit") openMapEditor(key);
      else if (act === "dup") {
        const nk = "custom_" + Date.now();
        store2[nk] = { name: store2[key].name + " (copy)", data: JSON.parse(JSON.stringify(store2[key].data)) };
        saveAdminMapStore(store2); syncCustomMaps(); renderMapsTab();
      } else if (act === "export") {
        const blob = new Blob([JSON.stringify({ name: store2[key].name, data: store2[key].data })], { type: "application/json" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob); a.download = store2[key].name.replace(/\s+/g, "_") + ".json"; a.click();
      } else if (act === "del") {
        if (!confirm('Delete "' + store2[key].name + '"? This cannot be undone.')) return;
        delete store2[key]; saveAdminMapStore(store2); syncCustomMaps(); renderMapsTab();
      }
    };
  });
}

// ---------- Music tab ----------

function musicFileExt(mime, name) {
  const m = name && /\.[a-z0-9]+$/i.exec(name);
  if (m) return m[0];
  if (mime === "audio/aac") return ".aac";
  if (mime === "audio/mp4" || mime === "audio/x-m4a") return ".m4a";
  return ".mp3";
}
function renderMusicTab() {
  const tracks = loadAdminMusic();
  const rows = tracks.map((t, i) =>
    '<div class="adminRow" data-idx="' + i + '">' +
      '<div class="rowName">' + t.name + '<div class="small" style="opacity:.75">' + (t.mime || "audio") + '</div></div>' +
      '<audio controls preload="none" src="' + t.dataUrl + '" style="height:32px;max-width:220px"></audio>' +
      '<button data-act="export" data-idx="' + i + '" ' + MINIBTN + '>EXPORT</button>' +
      '<button data-act="del" data-idx="' + i + '" ' + MINIBTN_DANGER + '>DELETE</button>' +
    '</div>'
  ).join("") || '<div class="small">No custom tracks uploaded yet — the game ships with its own procedurally-generated soundtrack.</div>';
  $("#adminBody").innerHTML =
    '<div class="small" style="margin-bottom:8px">Upload your own music (.mp3/.aac/.m4a) — saved in this browser only. ' +
    'Pick it from Settings → Music Track once uploaded, or leave "Auto (Shuffle)" to mix it into the built-in soundtrack\'s rotation.</div>' +
    '<div style="display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap">' +
      '<button id="importTrackBtn" ' + MINIBTN + '>IMPORT TRACK (.mp3/.aac)</button>' +
      '<input type="file" id="importTrackFile" accept=".mp3,.aac,.m4a,audio/mpeg,audio/aac,audio/mp4,audio/x-m4a" style="display:none">' +
      '<button id="exportTracksBtn" ' + MINIBTN + '>EXPORT ALL TRACKS (.json)</button>' +
      '<button id="importTracksBtn" ' + MINIBTN + '>IMPORT TRACKS (.json)</button>' +
      '<input type="file" id="importTracksFile" accept=".json" style="display:none">' +
    '</div>' +
    '<div class="lbl">CUSTOM TRACKS</div><div id="musicRows">' + rows + '</div>';
  $("#importTrackBtn").onclick = () => $("#importTrackFile").click();
  ($("#importTrackFile") as HTMLInputElement).onchange = async (e: Event) => {
    const file = (e.target as HTMLInputElement).files[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file) as string;
    const list = loadAdminMusic();
    list.push({ id: "trk_" + Date.now(), name: file.name.replace(/\.[a-z0-9]+$/i, ""), dataUrl, mime: file.type || "audio/mpeg" });
    if (saveAdminMusic(list)) { refreshCustomMusic(); hint("Track added: " + file.name); renderMusicTab(); }
    else hint("Could not save track — browser storage full?");
  };
  $("#exportTracksBtn").onclick = () => {
    const blob = new Blob([JSON.stringify({ tracks: loadAdminMusic() }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "ifr_music.json"; a.click();
  };
  $("#importTracksBtn").onclick = () => $("#importTracksFile").click();
  ($("#importTracksFile") as HTMLInputElement).onchange = (e: Event) => {
    const file = (e.target as HTMLInputElement).files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const list = Array.isArray(parsed.tracks) ? parsed.tracks : (Array.isArray(parsed) ? parsed : []);
        if (saveAdminMusic(list)) { refreshCustomMusic(); renderMusicTab(); hint("Tracks imported"); }
        else hint("Could not save — browser storage full?");
      } catch (err) { hint("That file couldn't be read as a track export"); }
    };
    reader.readAsText(file);
  };
  $("#adminBody").querySelectorAll("[data-act]").forEach((btn: HTMLElement) => {
    btn.onclick = () => {
      const idx = +btn.dataset.idx, act = btn.dataset.act, list = loadAdminMusic(), t = list[idx];
      if (!t) return;
      if (act === "export") {
        const a = document.createElement("a");
        a.href = t.dataUrl; a.download = t.name + musicFileExt(t.mime, t.name); a.click();
      } else if (act === "del") {
        if (!confirm('Remove "' + t.name + '"?')) return;
        list.splice(idx, 1);
        saveAdminMusic(list); refreshCustomMusic();
        if (trackSel >= MUSIC_TRACKS.length) setTrackSel(-1);
        renderMusicTab();
      }
    };
  });
}

// ---------- Map editor ----------
//
// Renders the actual in-game isometric view: the shared #game canvas's 2D
// fallback pipeline (drawTerrain/drawBld, see src/render2d.ts) works fine
// stand-alone before any match starts, since it only reads G (terrain) and
// takes plain {owner:-1,...} fake entities for buildings - no dependency on
// a live S.players. A transparent full-screen input layer sits above the
// canvas (inside #mapEditorUI, itself above #game but below nothing else)
// so our pan/paint pointer handling never fights the game's own permanent
// listeners on the #game canvas.

const EDITOR_TOOLS = [
  { k: "pan", n: "✥ Pan" },
  { k: "terrain", n: "Terrain" },
  { k: "elev", n: "Elevation" },
  { k: "ore", n: "Ore" },
  { k: "bld", n: "Building" },
  { k: "spawn", n: "Spawn" },
  { k: "erase", n: "Erase" },
];
const BUILDING_CATEGORIES = [
  { k: "", n: "All" },
  { k: "bld", n: "Structures" },
  { k: "def", n: "Defense" },
  { k: "other", n: "Decor / Neutral" },
];

let editorMapKey = null;
let editorTool = "terrain";
let editorTerrainType = 0;
let editorElevSign = 1;
let editorOreType = 1;
let editorOreAmount = 1200;
let editorBuildingKey = "civ1";
let editorBuildingCategory = "";
let editorBuildingSearch = "";
let editorBrush = 1;
let editorDrag = null;
let editorHover = null;
let editorRAF = null;

function openMapEditor(key) {
  const store = loadAdminMapStore();
  const entry = store[key];
  if (!entry) return;
  loadStaticMap(entry.data, key);
  editorMapKey = key;
  editorTool = "terrain";
  editorDrag = null;
  editorHover = null;
  adminTab = "maps";
  cam.x = 1472; cam.y = 1152; cam.z = camZTarget = 0.62;
  clampCam();
  $("#menu").classList.add("hidden");
  const ui = $("#mapEditorUI");
  ui.classList.remove("hidden");
  ui.innerHTML =
    '<div class="editorInputLayer" id="editorInputLayer"></div>' +
    '<div class="editorTopBar" id="editorTopBar"></div>' +
    '<div class="editorPalette hidden" id="editorPalette"></div>';
  renderEditorToolbar();
  renderEditorPalette();
  wireEditorCanvas();
  startEditorRender();
}

function closeMapEditor() {
  stopEditorRender();
  editorMapKey = null;
  editorDrag = null;
  const ui = $("#mapEditorUI");
  ui.classList.add("hidden");
  ui.innerHTML = "";
  $("#menu").classList.remove("hidden");
}

function startEditorRender() {
  const step = () => {
    if (editorMapKey === null) return;
    drawEditorFrame();
    editorRAF = requestAnimationFrame(step);
  };
  editorRAF = requestAnimationFrame(step);
}
function stopEditorRender() {
  if (editorRAF) cancelAnimationFrame(editorRAF);
  editorRAF = null;
}

function renderEditorToolbar() {
  const store = loadAdminMapStore();
  const name = (store[editorMapKey] && store[editorMapKey].name) || "";
  let extra = "";
  if (editorTool === "terrain") {
    extra = '<select id="terrainType"><option value="0">Grass</option><option value="1">Dirt</option><option value="2">Water</option><option value="3">Rock</option></select>';
  } else if (editorTool === "elev") {
    extra =
      '<button id="elevUp" class="catBtn' + (editorElevSign > 0 ? " on" : "") + '">▲ Raise</button>' +
      '<button id="elevDown" class="catBtn' + (editorElevSign < 0 ? " on" : "") + '">▼ Lower</button>';
  } else if (editorTool === "ore") {
    extra =
      '<select id="oreType"><option value="1">Ore (amber)</option><option value="2">Gems (pale)</option></select>' +
      '<select id="oreAmount"><option value="600">Light</option><option value="1200" selected>Medium</option><option value="2000">Rich</option></select>';
  }
  const brushExtra = (editorTool === "terrain" || editorTool === "elev" || editorTool === "ore" || editorTool === "erase")
    ? '<span class="small">Brush <input type="number" id="brushSize" min="1" max="6" value="' + editorBrush + '" style="width:40px"></span>'
    : "";
  const toolbar = $("#editorTopBar");
  toolbar.innerHTML =
    '<div class="editorTitle">' + name + '</div>' +
    EDITOR_TOOLS.map(t => '<button data-tool="' + t.k + '" class="catBtn' + (editorTool === t.k ? " on" : "") + '">' + t.n + '</button>').join("") +
    brushExtra + extra +
    '<span style="flex:1"></span>' +
    '<button id="editorSave" ' + MINIBTN + '>SAVE</button>' +
    '<button id="editorTestPlay" ' + MINIBTN + '>SAVE &amp; TEST PLAY</button>' +
    '<button id="editorBack" ' + MINIBTN_DANGER + '>BACK</button>';
  toolbar.querySelectorAll("[data-tool]").forEach(b => b.onclick = () => {
    editorTool = b.dataset.tool;
    editorDrag = null;
    renderEditorToolbar();
    renderEditorPalette();
  });
  const bs = $("#brushSize") as HTMLInputElement; if (bs) bs.onchange = () => { editorBrush = Math.max(1, Math.min(6, parseInt(bs.value) || 1)); };
  const tt = $("#terrainType") as HTMLSelectElement; if (tt) { tt.value = String(editorTerrainType); tt.onchange = () => editorTerrainType = parseInt(tt.value); }
  const eu = $("#elevUp"); if (eu) eu.onclick = () => { editorElevSign = 1; renderEditorToolbar(); };
  const ed = $("#elevDown"); if (ed) ed.onclick = () => { editorElevSign = -1; renderEditorToolbar(); };
  const ot = $("#oreType") as HTMLSelectElement; if (ot) { ot.value = String(editorOreType); ot.onchange = () => editorOreType = parseInt(ot.value); }
  const oa = $("#oreAmount") as HTMLSelectElement; if (oa) oa.onchange = () => editorOreAmount = parseInt(oa.value);
  $("#editorSave").onclick = () => { saveEditorMap(); hint("Map saved"); };
  $("#editorTestPlay").onclick = () => {
    saveEditorMap();
    cfg.map = editorMapKey;
    closeMapEditor();
    startGame();
  };
  $("#editorBack").onclick = () => { closeMapEditor(); renderAdminPanel(); };
}

function renderEditorPalette() {
  const panel = $("#editorPalette");
  if (editorTool !== "bld") { panel.classList.add("hidden"); panel.innerHTML = ""; return; }
  panel.classList.remove("hidden");
  panel.innerHTML =
    '<div class="editorPaletteRow">' +
      '<input type="text" id="editorBldSearch" placeholder="Search buildings…">' +
      BUILDING_CATEGORIES.map(c => '<button data-bcat="' + c.k + '" class="catBtn' + (editorBuildingCategory === c.k ? " on" : "") + '">' + c.n + '</button>').join("") +
    '</div>' +
    '<div class="editorPaletteGrid" id="editorPaletteGrid"></div>';
  const search = $("#editorBldSearch") as HTMLInputElement;
  search.value = editorBuildingSearch;
  search.oninput = () => { editorBuildingSearch = search.value.trim().toLowerCase(); renderEditorPaletteGrid(); };
  panel.querySelectorAll("[data-bcat]").forEach(b => b.onclick = () => { editorBuildingCategory = b.dataset.bcat; renderEditorPalette(); });
  renderEditorPaletteGrid();
}
function renderEditorPaletteGrid() {
  const grid = $("#editorPaletteGrid");
  if (!grid) return;
  const keys = Object.keys(BLD).filter(k =>
    (!editorBuildingCategory || assetCategory(k, "building") === editorBuildingCategory) &&
    (!editorBuildingSearch || assetDisplayName(k, "building").toLowerCase().includes(editorBuildingSearch))
  );
  grid.innerHTML = keys.map(k =>
    '<div class="editorPaletteCard' + (k === editorBuildingKey ? " sel" : "") + '" data-bkey="' + k + '">' +
      '<img class="assetThumb" data-thumb-key="' + k + '" width="36" height="36">' +
      '<div>' + assetDisplayName(k, "building") + '</div>' +
    '</div>'
  ).join("") || '<div class="small">No buildings match.</div>';
  grid.querySelectorAll(".assetThumb").forEach((img: HTMLImageElement) => {
    const key = img.dataset.thumbKey;
    renderThumbInto(img, key, "b", (BLD[key] && BLD[key].civ) ? "neutral" : "allied", 36);
  });
  grid.querySelectorAll("[data-bkey]").forEach(card => card.addEventListener("click", () => {
    editorBuildingKey = (card as HTMLElement).dataset.bkey;
    grid.querySelectorAll(".editorPaletteCard").forEach(c => c.classList.toggle("sel", c === card));
  }));
}

// ---------- Editor rendering (reuses the real game's isometric renderer) ----------

function fakeCivBuilding(c): any {
  const key = c[2], sz = (BLD[key] && BLD[key].size) || 1;
  return {
    e: "b", key, owner: -1, tx: c[0], ty: c[1], size: sz,
    x: 32 * (c[0] + sz / 2), y: 32 * (c[1] + sz / 2),
    hp: 1, maxhp: 1, tang: 0, target: null, garrison: null, repair: false, rot: 0, name: "",
  };
}
function drawEditorFrame() {
  ctx.fillStyle = "#0b141f";
  ctx.fillRect(0, 0, CW, CH);
  drawTerrain();
  for (const c of (G.civ || [])) { try { drawBld(fakeCivBuilding(c)); } catch (e) {} }
  for (const c of (G.special || [])) { try { drawBld(fakeCivBuilding(c)); } catch (e) {} }
  (G.spots || []).forEach((s, i) => {
    const sx = w2sx(32 * s[0] + 16, 32 * s[1] + 16), sy = w2sy(32 * s[0] + 16, 32 * s[1] + 16);
    ctx.fillStyle = "#f0a72c";
    ctx.beginPath(); ctx.ellipse(sx, sy, 9 * cam.z, 5 * cam.z, 0, 0, 6.284); ctx.fill();
    ctx.strokeStyle = "#1a1206"; ctx.lineWidth = 1.4; ctx.stroke();
    ctx.fillStyle = "#1a1206"; ctx.font = "bold " + Math.max(9, Math.round(11 * cam.z)) + "px sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(String.fromCharCode(65 + i), sx, sy);
  });
  drawEditorHoverHighlight();
}
function drawTileOutline(tx, ty, w, h, color) {
  ctx.beginPath();
  [[tx, ty], [tx + w, ty], [tx + w, ty + h], [tx, ty + h]].forEach((p, i) => {
    const sx = w2sx(32 * p[0], 32 * p[1]), sy = w2sy(32 * p[0], 32 * p[1]);
    i ? ctx.lineTo(sx, sy) : ctx.moveTo(sx, sy);
  });
  ctx.closePath();
  ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
}
function drawEditorHoverHighlight() {
  if (!editorHover || editorTool === "pan") return;
  const { tx, ty } = editorHover;
  if (editorTool === "bld") {
    const sz = (BLD[editorBuildingKey] && BLD[editorBuildingKey].size) || 1;
    drawTileOutline(tx, ty, sz, sz, "#7dff8a");
  } else if (editorTool === "spawn") {
    drawTileOutline(tx, ty, 1, 1, "#f0a72c");
  } else {
    const r = editorBrush - 1;
    drawTileOutline(tx - r, ty - r, editorBrush, editorBrush, "#8fd8ff");
  }
}

function applyEditorTool(x, y) {
  const i = idx(x, y);
  if (editorTool === "terrain") G.terr[i] = editorTerrainType;
  else if (editorTool === "elev") G.elevOverride[i] = clamp((G.elevOverride[i] || 0) + editorElevSign, -8, 8);
  else if (editorTool === "ore") { G.ore[i] = editorOreAmount; G.tib[i] = editorOreType; }
  else if (editorTool === "erase") {
    G.ore[i] = 0; G.tib[i] = 0;
    G.civ = (G.civ || []).filter(c => {
      const sz = (BLD[c[2]] && BLD[c[2]].size) || 1;
      return !(x >= c[0] && x < c[0] + sz && y >= c[1] && y < c[1] + sz);
    });
  }
}
function toggleSpawn(tx, ty) {
  G.spots = G.spots || [];
  const existing = G.spots.findIndex(s => Math.abs(s[0] - tx) <= 1 && Math.abs(s[1] - ty) <= 1);
  if (existing >= 0) G.spots.splice(existing, 1);
  else if (G.spots.length < 8) G.spots.push([tx, ty]);
  else hint("Maximum 8 spawn points");
}
function placeBuilding(tx, ty) {
  G.civ = (G.civ || []).filter(c => c[0] !== tx || c[1] !== ty);
  G.civ.push([tx, ty, editorBuildingKey]);
}

function editorTileAt(e) {
  const w = s2w(e.clientX, e.clientY);
  return { tx: Math.floor(w.x / 32), ty: Math.floor(w.y / 32) };
}
function editorPaintBrush(tx, ty) {
  const r = editorBrush - 1;
  for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
    const x = tx + dx, y = ty + dy;
    if (inMap(x, y)) applyEditorTool(x, y);
  }
}
function wireEditorCanvas() {
  const layer = $("#editorInputLayer") as HTMLElement;
  if (!layer) return;
  layer.onpointerdown = (e) => {
    layer.setPointerCapture(e.pointerId);
    const { tx, ty } = editorTileAt(e);
    if (editorTool === "pan") {
      editorDrag = { mode: "pan", x: e.clientX, y: e.clientY, camX: cam.x, camY: cam.y };
      return;
    }
    if (!inMap(tx, ty)) return;
    if (editorTool === "spawn") { toggleSpawn(tx, ty); return; }
    if (editorTool === "bld") { placeBuilding(tx, ty); return; }
    editorDrag = { mode: "paint" };
    editorPaintBrush(tx, ty);
  };
  layer.onpointermove = (e) => {
    const { tx, ty } = editorTileAt(e);
    editorHover = inMap(tx, ty) ? { tx, ty } : null;
    if (!editorDrag) return;
    if (editorDrag.mode === "pan") {
      const t = -(e.clientX - editorDrag.x) / cam.z, r = -(e.clientY - editorDrag.y) / cam.z;
      cam.x = editorDrag.camX + (r / .5 / 2 + t / 2);
      cam.y = editorDrag.camY + (r / .5 / 2 - t / 2);
      clampCam();
    } else if (editorDrag.mode === "paint" && inMap(tx, ty)) {
      editorPaintBrush(tx, ty);
    }
  };
  const endDrag = () => { editorDrag = null; };
  layer.onpointerup = endDrag;
  layer.onpointercancel = endDrag;
  layer.onpointerleave = () => { editorHover = null; };
  layer.onwheel = (e) => {
    e.preventDefault();
    camZTarget = clamp(camZTarget * (e.deltaY > 0 ? .9 : 1.1), .3, 2.3);
    zoomPivot = { sx: e.clientX, sy: e.clientY };
  };
}

function saveEditorMap() {
  const store = loadAdminMapStore();
  if (!store[editorMapKey]) return;
  store[editorMapKey].data = {
    terr: packArr(G.terr),
    ore: packArr(G.ore),
    tib: packArr(G.tib),
    blk: packArr(G.blk),
    pave: packArr(G.pave),
    elevOverride: packArr(G.elevOverride),
    spots: (G.spots || []).map(s => s.slice()),
    civ: (G.civ || []).map(c => c.slice()),
    special: (G.special || []).map(c => c.slice()),
    props: (G.props || []).map(p => Object.assign({}, p)),
    oreSpots: (G.oreSpots || []).map(o => Object.assign({}, o)),
  };
  saveAdminMapStore(store);
  syncCustomMaps();
}

Object.assign(window, {
  showAdmin,
});

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
const ADMIN_MAPS_KEY = "ifr_admin_maps";
const MINIBTN = 'style="padding:6px 10px;border-radius:6px;border:1px solid #5b74a0;background:#22334a;color:#cfe0f5;font-size:11px;margin:2px 4px 2px 0"';
const MINIBTN_DANGER = 'style="padding:6px 10px;border-radius:6px;border:1px solid #a04040;background:#2a1c1c;color:#f0a0a0;font-size:11px;margin:2px 4px 2px 0"';
const FACTION_LIST = [
  { k: "", n: "All factions" },
  { k: "allied", n: "Vanguard" },
  { k: "soviet", n: "Legion" },
  { k: "yuri", n: "Syndicate" },
];
const EDITOR_TILE = 8;

function loadAdminAssets() {
  try { return JSON.parse(localStorage.getItem(ADMIN_ASSETS_KEY) || "[]"); }
  catch (e) { return []; }
}
function saveAdminAssets(list) {
  try { localStorage.setItem(ADMIN_ASSETS_KEY, JSON.stringify(list)); }
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
      '<button id="backAdminTop" ' + MINIBTN + '>BACK</button>' +
    '</div>' +
    '<div id="adminBody"></div>' +
    '<button id="backAdmin" ' + SECBTN + '>BACK</button>';
  $("#tabAssets").onclick = () => { adminTab = "assets"; renderAdminPanel(); };
  $("#tabMaps").onclick = () => { adminTab = "maps"; renderAdminPanel(); };
  $("#backAdmin").onclick = closeAdmin;
  $("#backAdminTop").onclick = closeAdmin;
  if (adminTab === "assets") renderAssetsTab(); else renderMapsTab();
}

// ---------- Assets tab ----------

function assetDisplayName(key, kind) {
  if (kind === "unit") return (UNITS[key] && UNITS[key].name) || key;
  return (BLD[key] && BLD[key].names && (BLD[key].names.neutral || BLD[key].names.allied)) || key;
}
function assetRow(key, kind) {
  const entries = loadAdminAssets().filter(a => a.key === key);
  const tags = entries.map(a =>
    '<span class="adminTag">' + (a.faction || "all") +
    '<button data-key="' + key + '" data-fac="' + (a.faction || "") + '">✕</button></span>'
  ).join("");
  return (
    '<div class="adminRow" data-key="' + key + '" data-kind="' + kind + '">' +
      '<div class="rowName">' + assetDisplayName(key, kind) + '</div>' +
      '<select class="facSel">' + FACTION_LIST.map(f => '<option value="' + f.k + '">' + f.n + '</option>').join("") + '</select>' +
      '<input type="file" class="fileSel" accept=".glb,.gltf">' +
      '<input type="number" class="scaleSel" value="1" min="0.05" step="0.05" style="width:52px">' +
      tags +
    '</div>'
  );
}
function renderAssetsTab() {
  const unitRows = Object.keys(UNITS).map(k => assetRow(k, "unit")).join("");
  const bldRows = Object.keys(BLD).map(k => assetRow(k, "building")).join("");
  $("#adminBody").innerHTML =
    '<div class="small" style="margin-bottom:8px">Upload a .glb/.gltf to replace a unit or building\'s model. ' +
    'Pick a faction to override just that faction\'s look, or leave "All factions" to replace it everywhere it appears.</div>' +
    '<div class="lbl">UNITS</div><div id="unitAssetRows">' + unitRows + '</div>' +
    '<div class="lbl">BUILDINGS</div><div id="bldAssetRows">' + bldRows + '</div>';
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

// ---------- Map editor ----------

let editorMapKey = null;
let editorTool = "terrain";
let editorTerrainType = 0;
let editorElevSign = 1;
let editorOreType = 1;
let editorOreAmount = 1200;
let editorBuildingKey = "civ1";
let editorBrush = 1;
let editorPainting = false;

function openMapEditor(key) {
  const store = loadAdminMapStore();
  const entry = store[key];
  if (!entry) return;
  loadStaticMap(entry.data, key);
  editorMapKey = key;
  editorTool = "terrain";
  adminTab = "maps";
  $("#panelMain").innerHTML =
    '<div class="sub" style="text-align:left;margin-bottom:6px">Editing: ' + entry.name + '</div>' +
    '<div class="editorToolbar" id="editorToolbar"></div>' +
    '<div style="overflow:auto;max-width:100%"><canvas id="editorCanvas" width="' + (92 * EDITOR_TILE) + '" height="' + (72 * EDITOR_TILE) + '"></canvas></div>' +
    '<div style="display:flex;gap:8px;margin-top:10px">' +
      '<button id="editorSave" ' + SECBTN + '>SAVE</button>' +
      '<button id="editorTestPlay" ' + SECBTN + '>SAVE &amp; TEST PLAY</button>' +
    '</div>' +
    '<button id="editorBack" ' + SECBTN + '>BACK TO MAP LIST</button>';
  renderEditorToolbar();
  wireEditorCanvas();
  drawEditorCanvas();
  $("#editorSave").onclick = () => { saveEditorMap(); hint("Map saved"); };
  $("#editorTestPlay").onclick = () => {
    saveEditorMap();
    cfg.map = editorMapKey;
    $("#panelMain").classList.remove("wide");
    startGame();
  };
  $("#editorBack").onclick = () => { renderAdminPanel(); };
}

function renderEditorToolbar() {
  const tools = [
    { k: "terrain", n: "Terrain" },
    { k: "elev", n: "Elevation" },
    { k: "ore", n: "Ore" },
    { k: "bld", n: "Building" },
    { k: "spawn", n: "Spawn" },
    { k: "erase", n: "Erase" },
  ];
  let extra = "";
  if (editorTool === "terrain") {
    extra = '<select id="terrainType"><option value="0">Grass</option><option value="1">Dirt</option><option value="2">Water</option><option value="3">Rock</option></select>';
  } else if (editorTool === "elev") {
    extra =
      '<button id="elevUp" class="' + (editorElevSign > 0 ? "on" : "") + '">▲ Raise</button>' +
      '<button id="elevDown" class="' + (editorElevSign < 0 ? "on" : "") + '">▼ Lower</button>';
  } else if (editorTool === "ore") {
    extra =
      '<select id="oreType"><option value="1">Ore (amber)</option><option value="2">Gems (pale)</option></select>' +
      '<select id="oreAmount"><option value="600">Light</option><option value="1200" selected>Medium</option><option value="2000">Rich</option></select>';
  } else if (editorTool === "bld") {
    extra = '<select id="bldKey">' + Object.keys(BLD).map(k => '<option value="' + k + '">' + assetDisplayName(k, "building") + '</option>').join("") + '</select>';
  }
  const toolbar = $("#editorToolbar");
  toolbar.innerHTML =
    tools.map(t => '<button data-tool="' + t.k + '" class="' + (editorTool === t.k ? "on" : "") + '">' + t.n + '</button>').join("") +
    '<span>Brush <input type="number" id="brushSize" min="1" max="6" value="' + editorBrush + '" style="width:42px"></span>' +
    extra;
  toolbar.querySelectorAll("[data-tool]").forEach(b => b.onclick = () => { editorTool = b.dataset.tool; renderEditorToolbar(); });
  const bs = $("#brushSize"); if (bs) bs.onchange = () => { editorBrush = Math.max(1, Math.min(6, parseInt(bs.value) || 1)); };
  const tt = $("#terrainType"); if (tt) { tt.value = String(editorTerrainType); tt.onchange = () => editorTerrainType = parseInt(tt.value); }
  const eu = $("#elevUp"); if (eu) eu.onclick = () => { editorElevSign = 1; renderEditorToolbar(); };
  const ed = $("#elevDown"); if (ed) ed.onclick = () => { editorElevSign = -1; renderEditorToolbar(); };
  const ot = $("#oreType"); if (ot) { ot.value = String(editorOreType); ot.onchange = () => editorOreType = parseInt(ot.value); }
  const oa = $("#oreAmount"); if (oa) oa.onchange = () => editorOreAmount = parseInt(oa.value);
  const bk = $("#bldKey"); if (bk) { bk.value = editorBuildingKey; bk.onchange = () => editorBuildingKey = bk.value; }
}

function drawEditorCanvas() {
  const cv = document.getElementById("editorCanvas") as HTMLCanvasElement;
  if (!cv) return;
  const ctx = cv.getContext("2d");
  const TERR_COLORS = ["#3c6b35", "#7a5f3a", "#2f6fa8", "#5a5650"];
  for (let y = 0; y < 72; y++) for (let x = 0; x < 92; x++) {
    const i = idx(x, y);
    ctx.fillStyle = TERR_COLORS[G.terr[i]] || "#888";
    ctx.fillRect(x * EDITOR_TILE, y * EDITOR_TILE, EDITOR_TILE, EDITOR_TILE);
    const ev = G.elevOverride[i];
    if (ev) {
      ctx.fillStyle = ev > 0 ? "rgba(255,255,255," + Math.min(0.6, 0.12 * Math.abs(ev)) + ")" : "rgba(0,0,0," + Math.min(0.6, 0.12 * Math.abs(ev)) + ")";
      ctx.fillRect(x * EDITOR_TILE, y * EDITOR_TILE, EDITOR_TILE, EDITOR_TILE);
    }
    if (G.ore[i] > 0) {
      ctx.fillStyle = 2 === G.tib[i] ? "#8ee8ff" : "#f0c93a";
      const r = Math.max(1, EDITOR_TILE * 0.18 * Math.min(1, G.ore[i] / 1600));
      ctx.beginPath(); ctx.arc(x * EDITOR_TILE + EDITOR_TILE / 2, y * EDITOR_TILE + EDITOR_TILE / 2, r, 0, 6.284); ctx.fill();
    }
  }
  for (const c of (G.civ || [])) {
    const sz = (BLD[c[2]] && BLD[c[2]].size) || 1;
    ctx.fillStyle = "#e0473a";
    ctx.fillRect(c[0] * EDITOR_TILE, c[1] * EDITOR_TILE, EDITOR_TILE * sz, EDITOR_TILE * sz);
    ctx.strokeStyle = "#1a1206"; ctx.strokeRect(c[0] * EDITOR_TILE + 0.5, c[1] * EDITOR_TILE + 0.5, EDITOR_TILE * sz - 1, EDITOR_TILE * sz - 1);
  }
  (G.spots || []).forEach((s, i) => {
    ctx.fillStyle = "#f0a72c";
    ctx.beginPath(); ctx.arc(s[0] * EDITOR_TILE, s[1] * EDITOR_TILE, EDITOR_TILE * 0.9, 0, 6.284); ctx.fill();
    ctx.fillStyle = "#1a1206"; ctx.font = EDITOR_TILE + "px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(String.fromCharCode(65 + i), s[0] * EDITOR_TILE, s[1] * EDITOR_TILE);
  });
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

function wireEditorCanvas() {
  const cv = document.getElementById("editorCanvas") as HTMLCanvasElement;
  if (!cv) return;
  const tileAt = (e) => {
    const rect = cv.getBoundingClientRect();
    const sx = cv.width / rect.width, sy = cv.height / rect.height;
    return [Math.floor((e.clientX - rect.left) * sx / EDITOR_TILE), Math.floor((e.clientY - rect.top) * sy / EDITOR_TILE)];
  };
  const paintAt = (tx, ty) => {
    const r = editorBrush - 1;
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      const x = tx + dx, y = ty + dy;
      if (inMap(x, y)) applyEditorTool(x, y);
    }
    drawEditorCanvas();
  };
  cv.onpointerdown = (e) => {
    e.preventDefault();
    const [tx, ty] = tileAt(e);
    if (!inMap(tx, ty)) return;
    if (editorTool === "spawn") { toggleSpawn(tx, ty); drawEditorCanvas(); return; }
    if (editorTool === "bld") { placeBuilding(tx, ty); drawEditorCanvas(); return; }
    editorPainting = true;
    paintAt(tx, ty);
  };
  cv.onpointermove = (e) => {
    if (!editorPainting) return;
    const [tx, ty] = tileAt(e);
    if (inMap(tx, ty)) paintAt(tx, ty);
  };
  window.addEventListener("pointerup", () => editorPainting = false);
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

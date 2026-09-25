// @ts-nocheck
// Hand-authored skirmish maps. Every ridge, plateau, river crossing, road,
// town and resource is placed on purpose (and mirrored for fairness) instead
// of being grown from noise. Coordinates are tiles on the 92x72 grid; a base
// spot is the top-left tile of its 6x6 footprint.
//
// Plateaus are flat, buildable high ground with sheer one-tile cliffs and
// ramps where roads climb them. An overpass is a two-lane deck between two
// plateau tops: units up on it cross over while ground traffic (and boats)
// pass underneath.

const MW = 91, MH = 71, TOP_Z = 22;
const MD: any = { plats: [], overs: [], ramps: [], spots: [], ore: [], forests: [], towns: [], specials: [], cannons: [], snow: 0 };

// ---- symmetry: run a feature list once per mirrored copy ------------------
// "m4": mirror left/right and top/bottom (four corners). "mx": left/right
// only. "r2": 180-degree rotation. "none": as written.
function symRun(kind: string, fn: (T: any) => void) {
  const V = kind === "m4" ? [[0, 0], [1, 0], [0, 1], [1, 1]] : kind === "mx" ? [[0, 0], [1, 0]] : kind === "my" ? [[0, 0], [0, 1]] : kind === "r2" ? [[0, 0], [1, 1]] : [[0, 0]];
  for (const [fx, fy] of V) {
    const X = (x: number) => fx ? MW - x : x, Y = (y: number) => fy ? MH - y : y;
    const D = (d: string) => fx && (d === "e" || d === "w") ? (d === "e" ? "w" : "e") : fy && (d === "n" || d === "s") ? (d === "n" ? "s" : "n") : d;
    fn({ X, Y, D, P: (p: number[]) => [X(p[0]), Y(p[1])], PL: (ps: number[][]) => ps.map(p => [X(p[0]), Y(p[1])]), fx, fy });
  }
}

// ---- terrain features --------------------------------------------------------
function mdBegin(seed: number, key: string, snow?: number) {
  baseTerrain(seed, .5);
  G.map = key, G.snow = snow ? 1 : 0, G.calm = 1, G.hasOver = !1;
  G.over.fill(0), G.overZ.fill(0);
  G.props = [], G.trees = [], G.civ = [], G.oreSpots = [], G.special = [], G.pendingBridges = [], G.roadLines = [], G.townHints = [], G.towns = [], G.expansions = [], G.plateaus = [], G.strategic = [], G.stratSpecial = [], G.fall = [];
  S.traffic = [];
  MD.plats = [], MD.overs = [], MD.ramps = [], MD.spots = [], MD.ore = [], MD.forests = [], MD.towns = [], MD.specials = [], MD.cannons = [], MD.roads = [];
}
const T_ = (x: number, y: number) => inMap(x, y) ? idx(x, y) : -1;
function setLand(i: number) { G.terr[i] === 2 && (G.terr[i] = 1); G.terr[i] === 3 && (G.terr[i] = 1); G.blk[i] = 0, G.ore[i] = 0, G.tib[i] = 0; }
// open water along a polyline (rivers) and ellipses (lakes)
function mdRiver(pts: number[][], w: number) { for (let k = 0; k < pts.length - 1; k++) ridge(pts[k][0], pts[k][1], pts[k + 1][0], pts[k + 1][1], w / 2, 2, 1.2, 7 + k); }
function mdLake(cx: number, cy: number, rx: number, ry: number) {
  for (let y = Math.floor(cy - ry - 2); y <= cy + ry + 2; y++) for (let x = Math.floor(cx - rx - 2); x <= cx + rx + 2; x++) {
    const i = T_(x, y); if (i < 0) continue;
    const d = Math.hypot((x - cx) / rx, (y - cy) / ry) + .18 * (noise2(3 * x, 3 * y, 11) - .5);
    d < 1 && (G.terr[i] = 2);
  }
}
// impassable mountain ridge (deliberate walls and chokepoints)
function mdRidge(pts: number[][], w: number) { for (let k = 0; k < pts.length - 1; k++) ridge(pts[k][0], pts[k][1], pts[k + 1][0], pts[k + 1][1], w / 2, 3, 2, 21 + k); }
// flat high ground: rectangular top, one-tile cliff rim around it
function mdPlateau(x0: number, y0: number, x1: number, y1: number, h?: number) {
  h = h || 2.6;
  const ax = Math.min(x0, x1), bx = Math.max(x0, x1), ay = Math.min(y0, y1), by = Math.max(y0, y1);
  const corner = (x: number, y: number) => !1;
  for (let y = ay - 1; y <= by + 1; y++) for (let x = ax - 1; x <= bx + 1; x++) {
    const i = T_(x, y); if (i < 0) continue;
    const inside = x >= ax && x <= bx && y >= ay && y <= by && !corner(x, y);
    if (inside) setLand(i), G.elevOverride[i] = h;
    else if (!(G.elevOverride[i] >= h)) G.terr[i] = 3, G.elevOverride[i] = h, G.blk[i] = 0, G.ore[i] = 0;
  }
  MD.plats.push({ ax, ay, bx, by, h });
  G.plateaus.push([(ax + bx) / 2, (ay + by) / 2]);
}
// ramp: starts on the rim tile (x,y) and runs len tiles downhill in dir
function mdRamp(x: number, y: number, dir: string, len?: number, w?: number) {
  len = len || 5, w = w || 3;
  const dx = dir === "e" ? 1 : dir === "w" ? -1 : 0, dy = dir === "s" ? 1 : dir === "n" ? -1 : 0, px = dy ? 1 : 0, py = dx ? 1 : 0;
  const top = T_(x - dx, y - dy), h = top >= 0 ? G.elevOverride[top] || 2.6 : 2.6;
  const half = w >> 1, SH = 3;
  for (let k = 0; k < len; k++) for (let o = -half - SH; o <= half + SH; o++) {
    const i = T_(x + dx * k + px * o, y + dy * k + py * o); if (i < 0) continue;
    const e = h * (1 - (k + .5) / len), side = Math.abs(o) - half;
    if (side <= 0) { setLand(i), G.elevOverride[i] = Math.max(0, e); continue; }
    // graded shoulders so the ramp reads as an embankment, not a spike
    const se = e * (1 - side / (SH + 1));
    if (G.terr[i] === 3 && G.elevOverride[i] > 0 && k === 0) continue;
    se > (G.elevOverride[i] || 0) && G.terr[i] !== 2 && (G.terr[i] === 3 && (G.terr[i] = 1), G.elevOverride[i] = se, G.blk[i] = 0);
  }
  MD.ramps.push({ x, y, dir, len, w });
}
// overpass: two-lane deck between two plateau tops. (x0,y0)-(x1,y1) is the
// run of rim-to-rim tiles; the second lane sits on the +x / +y side.
function mdOverpass(x0: number, y0: number, x1: number, y1: number) {
  const vert = x0 === x1, ax = Math.min(x0, x1), bx = Math.max(x0, x1), ay = Math.min(y0, y1), by = Math.max(y0, y1);
  MD.overs.push({ vert, ax, ay, bx: vert ? ax + 1 : bx, by: vert ? by : ay + 1 });
}
function mdRoad(pts: number[][]) { MD.roads.push(pts.map(p => [Math.round(p[0]), Math.round(p[1])])); }
function mdSpot(x: number, y: number) { MD.spots.push([x, y]); }
function mdOre(x: number, y: number, r: number, type?: number, exp?: boolean) { MD.ore.push([x, y, r, type || 1, !!exp]); }
function mdForest(x: number, y: number, rx: number, ry: number, d?: number) { MD.forests.push([x, y, rx, ry, d || .72]); }
function mdTown(x: number, y: number) { MD.towns.push([x, y]); }
function mdSpecial(x: number, y: number, key: string) { MD.specials.push([x, y, key]); }
function mdCannon(x: number, y: number) { MD.cannons.push([x, y]); }

// ---- finishing: roads, bridges, decks, cliffs, scenery -------------------
function lineTiles(a: number[], b: number[]) {
  const out: number[] = []; let x0 = a[0], y0 = a[1]; const x1 = b[0], y1 = b[1], dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let err = dx + dy;
  for (;;) { out.push(idx(clamp(x0, 0, 91), clamp(y0, 0, 71))); if (x0 === x1 && y0 === y1) break; const e2 = 2 * err; e2 >= dy && (err += dy, x0 += sx), e2 <= dx && (err += dx, y0 += sy); }
  return out;
}
function mdLayRoads() {
  for (const pts of MD.roads) {
    const path: number[] = [];
    for (let k = 0; k < pts.length - 1; k++) { const seg = lineTiles(pts[k], pts[k + 1]); path.length && seg.shift(); path.push(...seg); }
    // never pave or carve under a deck or through a plateau rim
    const keep = path.filter(i => !G.over[i]);
    dressRoad(keep.length === path.length ? path : keep);
    G.roadLines.push(pts.map(p => [p[0], p[1]]));
  }
}
function mdSharpenCliffs() {
  // Cliff rims drop sheer: corners on the outer side of a rim sit at the
  // ground below; corners touching a plateau top keep the top height; ramps
  // are left to slope naturally.
  const rim = (i: number) => G.terr[i] === 3 && G.elevOverride[i] > 0;
  const onTop = (x: number, y: number) => MD.plats.some((p: any) => x >= p.ax && x <= p.bx && y >= p.ay && y <= p.by);
  const ramp = new Uint8Array(6624);
  for (const r of MD.ramps) { const dx = r.dir === "e" ? 1 : r.dir === "w" ? -1 : 0, dy = r.dir === "s" ? 1 : r.dir === "n" ? -1 : 0, px = dy ? 1 : 0, py = dx ? 1 : 0; for (let k = -1; k <= r.len; k++) for (let o = -(r.w >> 1) - 1; o <= (r.w >> 1) + 1; o++) { const i = T_(r.x + dx * k + px * o, r.y + dy * k + py * o); i >= 0 && (ramp[i] = 1); } }
  for (let cy = 0; cy <= 72; cy++) for (let cx = 0; cx <= 92; cx++) {
    let hasRim = 0, top = 0, nearRamp = 0, outN = 0, outS = 0;
    for (let dy = -1; dy <= 0; dy++) for (let dx = -1; dx <= 0; dx++) {
      const x = cx + dx, y = cy + dy, i = T_(x, y); if (i < 0) continue;
      ramp[i] && (nearRamp = 1);
      if (rim(i)) { hasRim = 1; continue; }
      if (onTop(x, y)) { top = 1; continue; }
      outN++, outS += G.elevOverride[i] || 0;
    }
    if (!hasRim || top || nearRamp) continue;
    const ci = 93 * cy + cx; G.flatCorner[ci] = cornerBumpBase(cx, cy) + TOP_Z * (outN ? outS / outN : 0), G.flatCornerSet[ci] = 1;
  }
}
function mdDecks() {
  for (const o of MD.overs) {
    // deck height: the plateau tops at either end
    const endA = o.vert ? T_(o.ax, o.ay - 1) : T_(o.ax - 1, o.ay), endB = o.vert ? T_(o.ax, o.by + 1) : T_(o.bx + 1, o.ay);
    const hA = endA >= 0 ? heightAt(32 * (endA % 92) + 16, 32 * (endA / 92 | 0) + 16) : 60, hB = endB >= 0 ? heightAt(32 * (endB % 92) + 16, 32 * (endB / 92 | 0) + 16) : hA;
    const n = o.vert ? o.by - o.ay : o.bx - o.ax;
    for (let y = o.ay; y <= o.by; y++) for (let x = o.ax; x <= o.bx; x++) {
      const i = T_(x, y); if (i < 0) continue;
      const k = o.vert ? y - o.ay : x - o.ax, z = hA + (hB - hA) * (n ? k / n : 0);
      G.over[i] = o.vert ? 2 : 1, G.overZ[i] = z, G.blk[i] = 0;
    }
  }
  G.hasOver = MD.overs.length > 0;
  for (const o of MD.overs) for (let y = o.ay; y <= o.by; y++) for (let x = o.ax; x <= o.bx; x++) {
    const i = T_(x, y); if (i < 0) continue;
    const side = o.vert ? (x === o.ax ? 1 : 2) : (y === o.ay ? 1 : 2), k = o.vert ? y - o.ay : x - o.ax;
    const ground = heightAt(32 * x + 16, 32 * y + 16), clear = G.overZ[i] - ground, pier = k % 4 === 2 && clear > 12 && G.terr[i] !== 2 ? Math.round(clear - 2) : 0;
    G.props.push({ tx: x, ty: y, kind: "overpass", x: 32 * x + 16, y: 32 * y + 16, z: G.overZ[i], r: o.vert ? -Math.PI / 2 : 0, v: side + 10 * pier, s: 1 });
  }
}
function mdScenery() {
  for (const [cx, cy, rx, ry, d] of MD.forests) for (let y = Math.floor(cy - ry); y <= cy + ry; y++) for (let x = Math.floor(cx - rx); x <= cx + rx; x++) {
    if (!freeTile(x, y) || G.elevOverride[idx(x, y)] > 0 && G.terr[idx(x, y)] === 3) continue;
    const q = Math.hypot((x - cx) / rx, (y - cy) / ry); if (q > 1) continue;
    Math.random() < d * (1.15 - q) && addProp("tree", x, y, !0);
  }
  // roadside trees in open country, a few rocks at cliff feet, meadow grass
  for (let i = 0; i < 2600; i++) {
    const x = irnd(2, 89), y = irnd(2, 69), t = idx(x, y);
    if (!freeTile(x, y) || MD.spots.some((s: number[]) => Math.abs(x - s[0] - 3) < 7 && Math.abs(y - s[1] - 3) < 7)) continue;
    const road = paveNear(x, y, 2) && !paveNear(x, y, 1), cliff = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => { const j = T_(x + dx, y + dy); return j >= 0 && G.terr[j] === 3; });
    if (road && Math.random() < .05) addProp("tree", x, y, !0);
    else if (cliff && Math.random() < .12) addProp("rock", x, y, !0);
    else if (!G.snow && G.terr[t] === 0 && Math.random() < .09) G.props.push({ tx: x, ty: y, kind: Math.random() < .2 ? "flower" : "grass", x: 32 * x + 4 + 24 * Math.random(), y: 32 * y + 4 + 24 * Math.random(), r: 6.283 * Math.random(), s: 1, v: irnd(0, 3) });
  }
}
function siteNear(x: number, y: number, spots: number[][], r?: number) {
  for (let d = 0; d <= (r || 5); d++) for (let dy = -d; dy <= d; dy++) for (let dx = -d; dx <= d; dx++) {
    if (Math.max(Math.abs(dx), Math.abs(dy)) !== d) continue;
    const X = Math.round(x) + dx, Y = Math.round(y) + dy;
    if (civSiteOk(X, Y, spots) && !G.over[idx(X, Y)]) return [X, Y];
  }
  return null;
}
function mdFinish() {
  const spots = MD.spots;
  G.spots = spots.map((s: number[]) => s.slice());
  // bases sit on clean, flat ground
  for (const [sx, sy] of spots) for (let y = sy - 1; y <= sy + 6; y++) for (let x = sx - 1; x <= sx + 6; x++) { const i = T_(x, y); i >= 0 && G.terr[i] !== 3 && setLand(i); }
  mdLayRoads();
  buildPendingBridges();
  computeMtnShore();
  mdSharpenCliffs();
  mdDecks();
  for (const [x, y, r, type, exp] of MD.ore) { oreField(x, y, r, type === 2 ? 1600 : 2200, type); exp && G.expansions.push([x, y]); }
  mdScenery();
  G.townHints = MD.towns.slice(), buildTowns(MD.towns.length > 3 ? "grand" : "basin", spots);
  for (const [x, y, key] of MD.specials) { const p = siteNear(x, y, spots); p && (clearTileProps(p[0], p[1]), G.special.push([p[0], p[1], key])); }
  for (const [x, y] of MD.cannons) { const p = siteNear(x, y, spots, 3); p && G.civ.push([p[0], p[1], "cannon"]); }
  computeMtnShore();
  for (let y = 0; y < 72; y++) for (let x = 0; x < 92; x++) G.elev[idx(x, y)] = heightAt(32 * x + 16, 32 * y + 16);
}

// ---- the maps ------------------------------------------------------------
const MAPDEFS: Record<string, (seed: number) => void> = {
  // HIGHLANDS: two mesas north and south of a valley highway, joined by an
  // overpass the valley traffic drives under. Mesa tops hold rich ground.
  high(seed) {
    mdBegin(seed, "high");
    mdPlateau(30, 7, 61, 25); mdPlateau(30, 46, 61, 64);
    mdOverpass(45, 26, 45, 45);
    symRun("m4", T => {
      mdSpot(T.X(5) - (T.fx ? 5 : 0), T.Y(5) - (T.fy ? 5 : 0));
      mdRamp(T.X(29), T.Y(16), T.D("w"), 5);
      mdOre(T.X(12), T.Y(20), 3.8); mdOre(T.X(38), T.Y(12), 3.2, 1, !0);
      mdForest(T.X(3), T.Y(28), 2.5, 4); mdForest(T.X(22), T.Y(3), 5, 2);
      mdCannon(T.X(41), T.Y(22));
    });
    mdRoad([[4, 35], [87, 35]]);
    symRun("m4", T => { mdRoad(T.PL([[8, 12], [8, 35]])); mdRoad(T.PL([[11, 16], [24, 16]])); });
    mdRoad([[24, 16], [67, 16]]); mdRoad([[24, 55], [67, 55]]);
    mdRoad([[45, 16], [45, 25]]); mdRoad([[45, 46], [45, 55]]);
    mdOre(38, 38, 2.6, 2); mdOre(53, 33, 2.6, 2);
    mdTown(18, 35); mdTown(73, 35);
    mdSpecial(52, 11, "empTower"); mdSpecial(38, 60, "oilDerek"); mdSpecial(18, 30, "paradropHangar"); mdSpecial(84, 45, "rogueDen");
    mdForest(86, 45, 3, 5);
    mdFinish();
  },
  // IRON BASIN: each base holds a corner plateau looking down into a lake
  // basin; a ring road circles the lake and links the east and west towns.
  basin(seed) {
    mdBegin(seed, "basin");
    mdLake(45.5, 35.5, 8, 2.8);
    mdPlateau(40, 28, 51, 31, 2.2); mdPlateau(40, 40, 51, 43, 2.2);
    symRun("m4", T => mdRamp(T.X(39), T.Y(30), T.D("w"), 4));
    mdOverpass(45, 32, 45, 39);
    symRun("m4", T => {
      mdPlateau(T.X(3), T.Y(3), T.X(20), T.Y(17));
      mdSpot(T.X(6) - (T.fx ? 5 : 0), T.Y(6) - (T.fy ? 5 : 0));
      mdRamp(T.X(21), T.Y(11), T.D("e"), 5); mdRamp(T.X(11), T.Y(18), T.D("s"), 5);
      mdOre(T.X(16), T.Y(7), 3.2);
      mdRoad(T.PL([[12, 11], [26, 11], [31, 25]])); mdRoad(T.PL([[11, 12], [11, 35]]));
      mdOre(T.X(36), T.Y(20), 3.4, 1, !0);
      mdForest(T.X(33), T.Y(4), 5, 2.5); mdForest(T.X(3), T.Y(27), 2.5, 4);
      mdCannon(T.X(34), T.Y(28));
    });
    mdRoad([[31, 25], [60, 25], [60, 46], [31, 46], [31, 25]]);
    mdRoad([[11, 35], [31, 35]]); mdRoad([[60, 35], [80, 35]]);
    mdOre(42.5, 29.5, 1.6, 2); mdOre(48.5, 41.5, 1.6, 2);
    mdTown(15, 35); mdTown(76, 35);
    mdSpecial(46, 14, "empTower"); mdSpecial(20, 31, "paradropHangar"); mdSpecial(40, 20, "oilDerek"); mdSpecial(46, 58, "rogueDen");
    mdForest(46, 60, 4, 3);
    mdFinish();
  },
  // THE DIVIDE: a river splits east from west; two road bridges, each
  // watched by a bluff you can build on.
  divide(seed) {
    mdBegin(seed, "divide");
    mdRiver([[46, -2], [44, 12], [47, 26], [45, 36], [44, 45], [47, 59], [45, 73]], 5);
    symRun("r2", T => {
      mdSpot(T.X(5) - (T.fx ? 5 : 0), T.Y(6) - (T.fy ? 5 : 0)); mdSpot(T.X(5) - (T.fx ? 5 : 0), T.Y(60) - (T.fy ? 5 : 0));
      mdPlateau(T.X(31), T.Y(24), T.X(39), T.Y(31)); mdRamp(T.X(30), T.Y(28), T.D("w"), 5);
      mdRoad(T.PL([[11, 9], [30, 9], [30, 18], [60, 18]])); mdRoad(T.PL([[11, 63], [24, 63], [24, 28], [30, 28]]));
      mdRoad(T.PL([[30, 18], [24, 28]]));
      mdOre(T.X(14), T.Y(18), 3.6); mdOre(T.X(14), T.Y(52), 3.6); mdOre(T.X(35), T.Y(27), 2.8, 1, !0);
      mdOre(T.X(20), T.Y(36), 2.6, 2);
      mdTown(T.X(36), T.Y(15));
      mdForest(T.X(3), T.Y(36), 3, 6); mdForest(T.X(30), T.Y(3), 6, 2);
      mdPlateau(T.X(33), T.Y(34), T.X(41), T.Y(38), 2.4); mdRamp(T.X(32), T.Y(36), T.D("w"), 4); mdRoad(T.PL([[24, 36], [29, 36]]));
      mdCannon(T.X(37), T.Y(22));
    });
    mdOverpass(42, 35, 49, 35);
    mdSpecial(35, 26, "empTower"); mdSpecial(60, 50, "paradropHangar"); mdSpecial(20, 40, "oilDerek"); mdSpecial(70, 34, "rogueDen");
    mdFinish();
  },
  // DUSTBOWL: open desert, a rich centre ringed by four low mesas that
  // overlook it; two oases.
  dust(seed) {
    mdBegin(seed, "dust");
    for (let i = 0; i < G.terr.length; i++) G.terr[i] = fbm(i % 92 * .05 + seed, (i / 92 | 0) * .05, seed + 3) > .62 ? 0 : 1;
    mdLake(20, 35.5, 3.5, 3); mdLake(71, 35.5, 3.5, 3);
    mdOre(45.5, 35.5, 5, 1); mdOre(45.5, 35.5, 2, 2);
    mdOverpass(41, 22, 50, 22); mdOverpass(41, 48, 50, 48);
    symRun("m4", T => {
      mdSpot(T.X(6) - (T.fx ? 5 : 0), T.Y(6) - (T.fy ? 5 : 0));
      mdPlateau(T.X(33), T.Y(20), T.X(40), T.Y(26), 2.2); mdRamp(T.X(36), T.Y(27), T.D("s"), 4);
      mdRoad(T.PL([[11, 11], [30, 30]]));
      mdOre(T.X(16), T.Y(15), 3.6); mdOre(T.X(27), T.Y(8), 3, 1, !0);
      mdCannon(T.X(37), T.Y(23));
    });
    mdRoad([[30, 30], [61, 30], [61, 41], [30, 41], [30, 30]]);
    mdTown(45, 12); mdTown(45, 59); mdRoad([[30, 30], [30, 16], [45, 12], [61, 16], [61, 30]]); mdRoad([[30, 41], [30, 55], [45, 59], [61, 55], [61, 41]]);
    mdSpecial(52, 22, "empTower"); mdSpecial(56, 12, "paradropHangar"); mdSpecial(24, 31, "oilDerek"); mdSpecial(66, 40, "oilDerek");
    mdForest(20, 35.5, 5, 4.5, .35); mdForest(71, 35.5, 5, 4.5, .35);
    mdFinish();
  },
  // BROKEN LAKES: four lakes linked by channels frame a central lake; the
  // highway crosses both channels on bridges and splits around the middle.
  lakes(seed) {
    mdBegin(seed, "lakes");
    mdLake(45.5, 35.5, 6, 4.5);
    symRun("m4", T => {
      mdLake(T.X(24), T.Y(20), 7, 5);
      mdSpot(T.X(5) - (T.fx ? 5 : 0), T.Y(5) - (T.fy ? 5 : 0));
      mdOre(T.X(13), T.Y(16), 3.6); mdOre(T.X(38), T.Y(8), 3, 1, !0);
      mdForest(T.X(3), T.Y(30), 2.5, 4); mdForest(T.X(22), T.Y(5), 4, 2);
      mdRoad(T.PL([[10, 11], [10, 30], [14, 35]]));
    });
    mdRiver([[24, 24], [24, 47]], 3); mdRiver([[67, 24], [67, 47]], 3);
    mdRoad([[4, 35], [30, 35], [36, 28], [55, 28], [61, 35], [87, 35]]); mdRoad([[30, 35], [36, 43], [55, 43], [61, 35]]);
    mdRoad([[45, 28], [45, 10]]); mdRoad([[45, 43], [45, 61]]);
    mdPlateau(40, 5, 51, 11, 2.2); mdRamp(45, 12, "s", 4); mdPlateau(40, 60, 51, 66, 2.2); mdRamp(45, 59, "n", 4);
    mdOre(45, 7.5, 2.6, 2); mdOre(45, 63.5, 2.6, 2);
    mdTown(14, 35); mdTown(77, 35);
    mdSpecial(49, 8, "empTower"); mdSpecial(18, 40, "paradropHangar"); mdSpecial(35, 50, "oilDerek"); mdSpecial(56, 22, "oilDerek");
    mdFinish();
  },
  // FIRING LINE: a mountain wall splits north from south with three passes;
  // the centre pass is overlooked by bluffs on both sides.
  line(seed) {
    mdBegin(seed, "line");
    mdRidge([[-2, 35.5], [11, 35.5]], 5); mdRidge([[21, 35.5], [41, 35.5]], 5); mdRidge([[50, 35.5], [70, 35.5]], 5); mdRidge([[80, 35.5], [93, 35.5]], 5);
    symRun("m4", T => {
      mdSpot(T.X(6) - (T.fx ? 5 : 0), T.Y(6) - (T.fy ? 5 : 0));
      mdPlateau(T.X(35), T.Y(24), T.X(41), T.Y(29), 2.2); mdRamp(T.X(34), T.Y(26), T.D("w"), 4);
      mdRoad(T.PL([[11, 11], [16, 20], [16, 35]])); mdRoad(T.PL([[11, 9], [30, 9], [45, 20], [45, 35]]));
      mdOre(T.X(16), T.Y(6), 3.6); mdOre(T.X(28), T.Y(20), 3, 1, !0); mdOre(T.X(38), T.Y(26.5), 2, 2);
      mdForest(T.X(3), T.Y(24), 2.5, 5); mdForest(T.X(60), T.Y(4), 6, 2);
      mdTown(T.X(22), T.Y(28));
      mdCannon(T.X(40), T.Y(28));
    });
    mdOverpass(38, 30, 38, 41); mdOverpass(52, 30, 52, 41);
    mdRoad([[16, 35], [75, 35]]);
    mdSpecial(54, 22, "empTower"); mdSpecial(36, 50, "paradropHangar"); mdSpecial(70, 22, "oilDerek"); mdSpecial(20, 50, "rogueDen");
    mdFinish();
  },
  // IRON RING: a square crater rim of high ground surrounds a rich crater
  // floor; ramps climb the rim from outside and drop into the crater.
  ring(seed) {
    mdBegin(seed, "ring");
    mdPlateau(26, 14, 65, 19); mdPlateau(26, 52, 65, 57); mdPlateau(20, 20, 25, 51); mdPlateau(66, 20, 71, 51);
    mdRamp(45, 13, "n", 5); mdRamp(45, 20, "s", 5); mdRamp(45, 58, "s", 5); mdRamp(45, 51, "n", 5);
    mdRamp(19, 35, "w", 5); mdRamp(26, 35, "e", 5); mdRamp(72, 35, "e", 5); mdRamp(65, 35, "w", 5);
    mdOverpass(33, 20, 33, 51); mdOverpass(57, 20, 57, 51);
    mdOre(45.5, 35.5, 4.5); mdOre(45.5, 35.5, 1.8, 2);
    symRun("m4", T => {
      mdSpot(T.X(4) - (T.fx ? 5 : 0), T.Y(4) - (T.fy ? 5 : 0));
      mdOre(T.X(14), T.Y(14), 3.4);
      mdRoad(T.PL([[9, 10], [9, 35], [14, 35]])); mdRoad(T.PL([[10, 9], [45, 9]]));
      mdForest(T.X(22), T.Y(4), 3, 2); mdForest(T.X(4), T.Y(24), 2, 3);
      mdCannon(T.X(30), T.Y(16));
    });
    mdRoad([[14, 35], [77, 35]]); mdRoad([[45, 9], [45, 62]]);
    mdTown(10, 50); mdTown(81, 21);
    mdSpecial(30, 16, "empTower"); mdSpecial(60, 55, "paradropHangar"); mdSpecial(22, 45, "oilDerek"); mdSpecial(69, 26, "oilDerek");
    mdFinish();
  },
  // HARBOR SPRAWL: a broad river through a port city; two long bridges and
  // bluffs on each bank overlooking the water.
  harbor(seed) {
    mdBegin(seed, "harbor");
    mdRiver([[45.5, -2], [45.5, 73]], 7);
    symRun("r2", T => {
      mdSpot(T.X(5) - (T.fx ? 5 : 0), T.Y(6) - (T.fy ? 5 : 0)); mdSpot(T.X(5) - (T.fx ? 5 : 0), T.Y(60) - (T.fy ? 5 : 0));
      mdPlateau(T.X(28), T.Y(29), T.X(35), T.Y(42)); mdRamp(T.X(27), T.Y(35), T.D("w"), 5);
      mdRoad(T.PL([[11, 9], [22, 9], [22, 16], [60, 16]])); mdRoad(T.PL([[11, 63], [22, 63], [22, 16]])); mdRoad(T.PL([[22, 35], [27, 35]]));
      mdOre(T.X(14), T.Y(18), 3.6); mdOre(T.X(14), T.Y(52), 3.6); mdOre(T.X(31), T.Y(35), 2.8, 1, !0); mdOre(T.X(35), T.Y(58), 2.6, 2);
      mdTown(T.X(35), T.Y(13)); mdTown(T.X(33), T.Y(22));
      mdForest(T.X(3), T.Y(36), 2.5, 7);
    });
    mdOverpass(36, 35, 55, 35);
    mdSpecial(33, 40, "empTower"); mdSpecial(58, 26, "paradropHangar"); mdSpecial(26, 50, "oilDerek"); mdSpecial(65, 20, "oilDerek");
    mdFinish();
  },
  // GRAND CROSSING: two rivers cross at a central lake, with a ground
  // bridge on each arm. Hill forts guard the centre, and the northern pair
  // is joined by an overpass high above the river.
  grand(seed) {
    mdBegin(seed, "grand");
    mdLake(45.5, 35.5, 5, 4);
    mdRiver([[45.5, -2], [45.5, 32]], 5); mdRiver([[45.5, 39], [45.5, 73]], 5); mdRiver([[-2, 35.5], [41, 35.5]], 5); mdRiver([[50, 35.5], [93, 35.5]], 5);
    symRun("m4", T => {
      mdSpot(T.X(5) - (T.fx ? 5 : 0), T.Y(5) - (T.fy ? 5 : 0));
      mdPlateau(T.X(30), T.Y(20), T.X(38), T.Y(27)); mdRamp(T.X(29), T.Y(24), T.D("w"), 5);
      mdRoad(T.PL([[11, 9], [22, 9], [22, 24], [29, 24]])); mdRoad(T.PL([[9, 11], [9, 30]]));
      mdOre(T.X(15), T.Y(17), 3.6); mdOre(T.X(33), T.Y(10), 3, 1, !0); mdOre(T.X(34), T.Y(24), 2, 2);
      mdTown(T.X(16), T.Y(28)); mdForest(T.X(40), T.Y(4), 3, 2);
      mdCannon(T.X(36), T.Y(25));
    });
    mdOverpass(39, 23, 52, 23); mdOverpass(39, 47, 52, 47);
    mdRoad([[9, 30], [9, 41]]); mdRoad([[82, 30], [82, 41]]); mdRoad([[22, 9], [69, 9]]); mdRoad([[22, 62], [69, 62]]);
    mdRoad([[30, 24], [38, 24]]); mdRoad([[53, 24], [61, 24]]); mdRoad([[30, 48], [38, 48]]); mdRoad([[53, 48], [61, 48]]);
    mdSpecial(34, 22, "empTower"); mdSpecial(58, 56, "paradropHangar"); mdSpecial(20, 44, "rogueDen");
    mdForest(20, 46, 3, 3);
    mdFinish();
  },
  // OCTAGON FRONT: eight bases around a central mesa; spokes run to a
  // ring road around its foot, ramps climb it from all four sides.
  octagon(seed) {
    mdBegin(seed, "octagon");
    mdPlateau(38, 29, 53, 42, 2.4);
    mdRamp(45, 28, "n", 4); mdRamp(45, 43, "s", 4); mdRamp(37, 35, "w", 4); mdRamp(54, 35, "e", 4);
    const S8 = [[76, 33], [67, 51], [43, 60], [19, 51], [10, 33], [19, 15], [43, 6], [67, 15]];
    for (const s of S8) mdSpot(s[0], s[1]);
    mdRoad([[30, 22], [61, 22], [67, 35], [61, 49], [30, 49], [24, 35], [30, 22]]);
    for (const s of S8) { const cx = s[0] + 3, cy = s[1] + 3, a = Math.atan2(35.5 - cy, 45.5 - cx); const L = Math.hypot(45.5 - cx, 35.5 - cy); mdRoad([[cx + Math.cos(a) * 4, cy + Math.sin(a) * 4], [cx + Math.cos(a) * Math.max(11, L - 15), cy + Math.sin(a) * Math.max(11, L - 15)]]); mdOre(cx - Math.cos(a) * -2 + Math.sin(a) * 7, cy + Math.sin(a) * 2 - Math.cos(a) * 7, 2.8); }
    mdOre(45.5, 35.5, 3.2); mdOre(45.5, 35.5, 1.4, 2);
    mdForest(4, 4, 4, 3); mdForest(87, 4, 4, 3); mdForest(4, 67, 4, 3); mdForest(87, 67, 4, 3);
    mdTown(45.5, 22);
    mdSpecial(41, 32, "empTower"); mdSpecial(30, 58, "paradropHangar"); mdSpecial(60, 12, "oilDerek"); mdSpecial(84, 60, "rogueDen");
    mdFinish();
  },
  // THE BASTION: six hill forts, each with a single gate ramp facing the
  // open ore plain between them.
  bastion(seed) {
    mdBegin(seed, "bastion");
    const S6 = [[43, 6], [70, 18], [70, 47], [43, 59], [16, 47], [16, 18]];
    for (const s of S6) {
      mdSpot(s[0], s[1]);
      const x0 = s[0] - 3, y0 = s[1] - 3, x1 = s[0] + 8, y1 = s[1] + 8; mdPlateau(x0, y0, x1, y1, 2.4);
      const cx = s[0] + 3, cy = s[1] + 3, dx = 45.5 - cx, dy = 35.5 - cy;
      if (Math.abs(dx) > Math.abs(dy)) mdRamp(dx > 0 ? x1 + 1 : x0 - 1, cy, dx > 0 ? "e" : "w", 5); else mdRamp(cx, dy > 0 ? y1 + 1 : y0 - 1, dy > 0 ? "s" : "n", 5);
      const gx = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? x1 + 6 : x0 - 6) : cx, gy = Math.abs(dx) > Math.abs(dy) ? cy : (dy > 0 ? y1 + 6 : y0 - 6);
      mdRoad([[cx, cy], [gx, gy], [45.5 + (gx - 45.5) * .35, 35.5 + (gy - 35.5) * .35]]);
      mdOre(cx + (cx < 45 ? 5 : -5) * (Math.abs(dy) > Math.abs(dx) ? 1 : 0), cy + (Math.abs(dy) > Math.abs(dx) ? 0 : 5), 2.4);
      mdOre(45.5 + (gx - 45.5) * .55, 35.5 + (gy - 35.5) * .55, 2.6, 1, !0);
    }
    mdOre(45.5, 35.5, 3.4); mdOre(45.5, 35.5, 1.4, 2); mdTown(45.5, 35.5);
    mdOverpass(25, 20, 66, 20); mdOverpass(25, 50, 66, 50);
    mdForest(4, 4, 4, 3); mdForest(87, 4, 4, 3); mdForest(4, 67, 4, 3); mdForest(87, 67, 4, 3); mdForest(45.5, 25, 3, 2, .5);
    mdSpecial(56, 30, "empTower"); mdSpecial(33, 42, "paradropHangar"); mdSpecial(56, 42, "oilDerek"); mdSpecial(5, 35, "rogueDen");
    mdFinish();
  },
  // BOOMTOWN: a mining town at the crossroads of a rich plain; six bases on
  // the rim, lots of ore, low bluffs for spotting.
  boomtown(seed) {
    mdBegin(seed, "boomtown");
    const S6 = [[43, 6], [72, 20], [72, 47], [43, 60], [14, 47], [14, 20]];
    for (const s of S6) {
      mdSpot(s[0], s[1]);
      const cx = s[0] + 3, cy = s[1] + 3, a = Math.atan2(35.5 - cy, 45.5 - cx);
      mdRoad([[cx + Math.cos(a) * 4, cy + Math.sin(a) * 4], [45.5 - Math.cos(a) * 6, 35.5 - Math.sin(a) * 6]]);
      mdOre(cx + Math.cos(a) * 9 + Math.sin(a) * 5, cy + Math.sin(a) * 9 - Math.cos(a) * 5, 3.2);
      mdOre(cx + Math.cos(a) * 16 - Math.sin(a) * 6, cy + Math.sin(a) * 16 + Math.cos(a) * 6, 3, 1, !0);
    }
    mdRoad([[30, 35.5], [61, 35.5]]); mdRoad([[45.5, 22], [45.5, 49]]);
    mdOre(38, 28, 2.4, 2); mdOre(53, 43, 2.4, 2);
    mdPlateau(27, 5, 34, 11, 2); mdRamp(30, 12, "s", 4); mdPlateau(57, 60, 64, 66, 2); mdRamp(60, 59, "n", 4);
    mdTown(45.5, 35.5); mdTown(45.5, 26);
    mdSpecial(30, 7, "empTower"); mdSpecial(60, 30, "paradropHangar"); mdSpecial(34, 44, "oilDerek"); mdSpecial(84, 34, "rogueDen");
    mdForest(86, 34, 3, 6); mdForest(5, 34, 3, 6);
    mdFinish();
  },
  // FROZEN PASS: an iced river divides the valley; two ground bridges on the
  // flanks and a high overpass between the central bluffs, over the river and
  // the bank roads that run beneath it.
  frost(seed) {
    mdBegin(seed, "frost", 1);
    mdRiver([[-2, 35.5], [93, 35.5]], 4);
    mdPlateau(38, 19, 53, 29); mdPlateau(38, 42, 53, 52);
    mdOverpass(45, 30, 45, 41);
    symRun("m4", T => {
      mdSpot(T.X(6) - (T.fx ? 5 : 0), T.Y(6) - (T.fy ? 5 : 0));
      mdRamp(T.X(37), T.Y(24), T.D("w"), 5);
      mdRoad(T.PL([[11, 11], [26, 11], [26, 31]])); mdRoad(T.PL([[26, 24], [33, 24]])); mdRoad(T.PL([[33, 24], [45, 24], [45, 29]]));
      mdOre(T.X(16), T.Y(17), 3.6); mdOre(T.X(46), T.Y(21.5), 2.4, 2); mdOre(T.X(14), T.Y(28), 2.8, 1, !0);
      mdForest(T.X(4), T.Y(24), 3, 6); mdForest(T.X(26), T.Y(3), 6, 2); mdForest(T.X(62), T.Y(12), 4, 3);
      mdCannon(T.X(40), T.Y(27));
    });
    mdRoad([[26, 31], [26, 40]]); mdRoad([[65, 31], [65, 40]]); mdRoad([[26, 32], [65, 32]]); mdRoad([[26, 39], [65, 39]]);
    mdTown(16, 33); mdTown(75, 38);
    mdSpecial(50, 21, "empTower"); mdSpecial(20, 44, "paradropHangar"); mdSpecial(70, 26, "oilDerek"); mdSpecial(84, 50, "rogueDen");
    mdFinish();
  },
};
function buildAuthoredMap(key: string, seed: number) { MAPDEFS[key](seed); }

Object.assign(window, { MAPDEFS, buildAuthoredMap, mdSharpenCliffs });

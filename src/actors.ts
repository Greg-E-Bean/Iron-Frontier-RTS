// @ts-nocheck
export {};
// ---- Cutscene actors ---------------------------------------------------------------
// Each film character is a sculpted 3D bust rendered with its own small
// WebGL renderer: a head mesh shaped from a sphere (eye sockets, brow, nose,
// cheekbones, lips, jaw and chin), eyeballs with irises that track, eyelids
// that blink, a jaw that opens while the line is spoken, ears, hair, headwear
// and a faction uniform. Lighting follows a film set: warm key, cool fill and a
// strong faction-coloured rim.

const ACT = { r: null, scene: null, cam: null, lights: null, cache: {}, cv: null, W: 640, H: 480 };
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t) };
const G = (dx, dy, sx, sy) => Math.exp(-(dx * dx) / (sx * sx) - (dy * dy) / (sy * sy));
function hn(x, y, z) { const s = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453; return s - Math.floor(s) }
function vn3(x, y, z) { const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z), fx = x - xi, fy = y - yi, fz = z - zi, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy), w = fz * fz * (3 - 2 * fz), L = (a, b, t) => a + (b - a) * t;
  return L(L(L(hn(xi, yi, zi), hn(xi + 1, yi, zi), u), L(hn(xi, yi + 1, zi), hn(xi + 1, yi + 1, zi), u), v), L(L(hn(xi, yi, zi + 1), hn(xi + 1, yi, zi + 1), u), L(hn(xi, yi + 1, zi + 1), hn(xi + 1, yi + 1, zi + 1), u), v), w) }

// Character looks: skin/hair/eye colours, sculpt parameters and costume.
const ACTORS = {
  reyes: { skin: 0xd9a27e, hair: 0x2a1c16, eye: 0x4f7a44, fem: 1, age: .45, jaw: .92, nose: .9, hairStyle: "bun", hat: "beret", hatC: 0x223f60, uni: "van", brow: .8 },
  hale: { skin: 0xb07a55, hair: 0x17110d, eye: 0x3a2a1c, age: .3, jaw: 1.1, nose: 1.05, hairStyle: "crop", hat: "helmet", hatC: 0x4a5238, uni: "van", stubble: .5 },
  ghost: { skin: 0xe8b898, hair: 0x7a2a16, eye: 0x3f7a6a, fem: 1, age: .2, jaw: .88, nose: .85, hairStyle: "long", uni: "ops" },
  marsh: { skin: 0xe0b090, hair: 0x8f877e, eye: 0x5a6a7a, age: .75, jaw: .96, nose: 1.1, hairStyle: "side", glasses: 1, uni: "lab", stubble: .15 },
  draganov: { skin: 0xd8a282, hair: 0xb8b4ae, eye: 0x5a6a6a, age: .9, jaw: 1.15, nose: 1.15, hairStyle: "crop", hat: "cap", hatC: 0x3c3c30, uni: "leg", mous: 0xc0b8ae, brow: 1.3 },
  volkova: { skin: 0xecc4a8, hair: 0xe0cc98, eye: 0x5a7a9a, fem: 1, age: .35, jaw: .9, nose: .9, hairStyle: "bun", hat: "cap", hatC: 0x3c3c30, uni: "leg" },
  bogdan: { skin: 0xcf9878, hair: 0x4a3020, eye: 0x4a3a2a, age: .6, jaw: 1.18, nose: 1.2, hairStyle: "crop", hat: "helmet", hatC: 0x5a4a2a, uni: "eng", beard: 0x4a3020 },
  reaper: { skin: 0xb89880, hair: 0x141414, eye: 0x9a2a1a, age: .4, jaw: 1.12, nose: 1, hairStyle: "crop", hat: "helmet", hatC: 0x1c1c1c, uni: "ops", mask: 1, glowEye: 0xff3a20 },
  voice: { skin: 0xc8b4c8, hair: 0x8f877e, eye: 0xd59cff, age: .75, jaw: .96, nose: 1.1, hairStyle: "side", uni: "hive", hive: 1, glowEye: 0xc070ff, hat: "hood" },
  senna: { skin: 0xdcc0cc, hair: 0x1a1420, eye: 0xe6c2ff, fem: 1, age: .25, jaw: .88, nose: .85, hairStyle: "long", uni: "hive", hive: .6, glowEye: 0xd08cff, hat: "hood" },
  phantom: { skin: 0xe6c0b8, hair: 0x5a1a28, eye: 0xc79bff, fem: 1, age: .2, jaw: .88, nose: .85, hairStyle: "long", uni: "ops", hive: .5, glowEye: 0xb070ff },
};
const UNI = { van: [0x4d563a, 0x6fb8e0], ops: [0x25292c, 0x8fd0ff], lab: [0xe6e8ea, 0x9fe8d0], leg: [0x4e4a40, 0xc0392b], eng: [0x5c4c32, 0xe0a040], hive: [0x2a1a36, 0xb27ae0] };

function actorsInit() {
  if (ACT.r) return !0;
  if (typeof THREE === "undefined") return !1;
  try {
    const cv = document.createElement("canvas"); cv.width = ACT.W, cv.height = ACT.H;
    const r = new THREE.WebGLRenderer({ canvas: cv, alpha: !0, antialias: !0, preserveDrawingBuffer: !0 });
    r.setPixelRatio(1), r.setSize(ACT.W, ACT.H, !1), r.setClearColor(0, 0);
    r.toneMapping = THREE.NoToneMapping;
    const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(31, ACT.W / ACT.H, .1, 60);
    cam.position.set(0, -.3, 9.4), cam.lookAt(0, -.85, 0);
    const key = new THREE.DirectionalLight(0xffe2c4, 1.05); key.position.set(-3.5, 2.5, 5);
    const fill = new THREE.DirectionalLight(0x8aa8c8, .28); fill.position.set(4, 0, 4);
    const rim = new THREE.DirectionalLight(0x6fb8e0, 1.3); rim.position.set(4, 3, -4);
    const rim2 = new THREE.DirectionalLight(0x6fb8e0, .5); rim2.position.set(-4, 1, -3);
    const under = new THREE.PointLight(0x6fb8e0, .35, 12); under.position.set(0, -3.5, 3);
    const amb = new THREE.HemisphereLight(0x5a6a7a, 0x1a1410, .32);
    scene.add(key, fill, rim, rim2, under, amb);
    Object.assign(ACT, { r, scene, cam, cv, lights: { key, fill, rim, rim2, under } });
    return !0;
  } catch (e) { return !1 }
}

// ---- head sculpt ----
function sculpt(px, py, pz, L) {
  let x = .8 * px, y = py, z = .88 * pz;
  const jw = L.jaw || 1, fem = L.fem ? 1 : 0;
  // skull and jaw
  x *= 1 + .05 * G(0, y + .38, 1, .25);
  if (y < -.1) { const t = sm(-.1, -1, y); x *= 1 - .3 * t / jw; z *= 1 - (pz < 0 ? .35 : .06) * t; }
  y > .5 && (x *= 1 - .1 * (y - .5));
  const front = sm(.15, .75, pz);
  // forehead slightly flatter, brow ridge, eye sockets
  z += front * (.05 * (1 - fem * .6) * (L.brow || 1) * G(x, y - .27, .42, .06));
  for (const k of [-1, 1]) z -= front * .12 * G(x - k * .29, y - .12, .14, .1);
  // nose
  const s = sm(.12, -.3, y), nw = .08 + .075 * s, nose = (L.nose || 1) * (.035 + .15 * s) * sm(-.44, -.3, y) * (y < .14 ? 1 : 0);
  z += front * nose * Math.exp(-(x * x) / (nw * nw));
  for (const k of [-1, 1]) z += front * .045 * G(x - k * .1, y + .31, .055, .05);
  // cheekbones
  for (const k of [-1, 1]) z += front * .045 * G(x - k * .4, y + .02, .13, .12);
  // mouth: upper lip, lower lip, the line between and the corners
  z += front * (.07 + .015 * fem) * G(x, y + .47, .16, .045);
  z += front * (.06 + .02 * fem) * G(x, y + .58, .14, .045);
  z -= front * .035 * G(x, y + .525, .17, .014);
  for (const k of [-1, 1]) z -= front * .025 * G(x - k * .19, y + .53, .03, .03);
  // philtrum, chin, under-lip crease, nasolabial folds for age
  z -= front * .015 * G(x, y + .39, .03, .05);
  z += front * .08 * G(x, y + .83, .16, .1);
  z -= front * .03 * G(x, y + .69, .16, .03);
  for (const k of [-1, 1]) z -= front * .02 * (L.age || 0) * G(x - k * .2, y + .33, .03, .12);
  // tiny surface noise so light breaks up like skin
  const n = (vn3(px * 18, py * 18, pz * 18) - .5) * .004;
  return [x * (1 + n), y, z * (1 + n)];
}
function surfZ(x, y, L) { let lo = 0, hi = 1; for (let i = 0; i < 18; i++) { const pz = (lo + hi) / 2, px = x / .8, py = y, q = 1 - px * px - py * py; if (q <= 0) return 0; const [sx] = sculpt(px * Math.sqrt(1 - pz * pz) / Math.sqrt(Math.max(1e-6, px * px + py * py)) || 0, py, pz, L); void sx; hi = pz; } const px = x / .8, q = Math.max(0, 1 - px * px - y * y); return sculpt(px, y, Math.sqrt(q), L)[2] }
function buildHead(L) {
  const geo = new THREE.SphereGeometry(1, 160, 128), pos = geo.attributes.position, N = pos.count;
  const open = new Float32Array(N * 3), col = new Float32Array(N * 3), skin = new THREE.Color(L.skin), lip = new THREE.Color(L.fem ? 0xb65a55 : 0xa2645a), dark = skin.clone().multiplyScalar(.62);
  const stub = new THREE.Color(0x3a3230), vein = new THREE.Color(0x9a4ad0), blush = new THREE.Color(0xd06a60);
  for (let i = 0; i < N; i++) {
    const px = pos.getX(i), py = pos.getY(i), pz = pos.getZ(i), [x, y, z] = sculpt(px, py, pz, L);
    pos.setXYZ(i, x, y, z);
    // jaw-open morph: everything below the lip line swings down about the jaw hinge
    const w = sm(-.5, -.62, y) * sm(-.2, .3, pz), a = .28 * w, hy = -.1, hz = -.25, dy = y - hy, dz = z - hz;
    open[3 * i] = x * (1 - .04 * w), open[3 * i + 1] = hy + dy * Math.cos(a) - dz * Math.sin(a) - .02 * w, open[3 * i + 2] = hz + dy * Math.sin(a) + dz * Math.cos(a);
    // skin colouring
    const front = sm(.15, .75, pz), c = skin.clone();
    const lipW = front * Math.max(G(x, y + .47, .15, .04), G(x, y + .58, .13, .045));
    c.lerp(lip, Math.min(1, lipW * 1.4));
    for (const k of [-1, 1]) c.lerp(dark, front * .45 * G(x - k * .29, y - .1, .14, .09)), L.fem && c.lerp(blush, front * .18 * G(x - k * .33, y + .2, .12, .1));
    L.stubble && c.lerp(stub, L.stubble * .5 * sm(-.25, -.45, y) * (1 - lipW) * sm(-.2, .4, pz));
    if (L.hive) { const v = vn3(px * 6, py * 6, pz * 6), r = Math.abs(v - .5); r < .018 && c.lerp(vein, L.hive * (1 - r / .018)); }
    c.lerp(dark, .18 * sm(.2, -.7, pz));
    col[3 * i] = c.r, col[3 * i + 1] = c.g, col[3 * i + 2] = c.b;
  }
  geo.morphAttributes.position = [new THREE.Float32BufferAttribute(open, 3)];
  geo.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  geo.computeVertexNormals();
  const mat = new THREE.MeshPhysicalMaterial({ vertexColors: !0, roughness: .52, metalness: 0, clearcoat: .12, clearcoatRoughness: .55, morphTargets: !0 });
  return new THREE.Mesh(geo, mat);
}
function hairMat(c, rough) { return new THREE.MeshStandardMaterial({ color: c, roughness: rough || .78, metalness: 0 }) }
function shellGeo(r, sx, sy, sz, t0, t1, f) {
  const geo = new THREE.SphereGeometry(r, 96, 64, 0, Math.PI * 2, t0, t1 - t0), p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { let x = p.getX(i) * sx, y = p.getY(i) * sy, z = p.getZ(i) * sz; if (f) [x, y, z] = f(x, y, z); p.setXYZ(i, x, y, z) }
  geo.computeVertexNormals(); return geo;
}
function buildActor(who) {
  const L = ACTORS[who] || ACTORS.hale, root = new THREE.Group(), headG = new THREE.Group(), body = new THREE.Group();
  root.add(body), root.add(headG), headG.position.set(0, 0, 0);
  const skinMat = new THREE.MeshPhysicalMaterial({ color: L.skin, roughness: .55, clearcoat: .08 });
  const head = buildHead(L); headG.add(head);
  // mouth cavity so an open jaw shows darkness, not the back of the head
  const cav = new THREE.Mesh(new THREE.SphereGeometry(.16, 24, 16), new THREE.MeshBasicMaterial({ color: 0x2a0c0a })); cav.scale.set(1.2, .6, .6), cav.position.set(0, -.53, .52), headG.add(cav);
  const teeth = new THREE.Mesh(new THREE.BoxGeometry(.2, .035, .05), new THREE.MeshStandardMaterial({ color: 0xe8e2d6, roughness: .4 })); teeth.position.set(0, -.505, .66), headG.add(teeth);
  // eyes
  const eyes = [], lids = [];
  for (const k of [-1, 1]) {
    const eg = new THREE.Group(); eg.position.set(k * .3, .12, .62);
    const ball = new THREE.Mesh(new THREE.SphereGeometry(.12, 32, 24), new THREE.MeshPhysicalMaterial({ color: 0xeee8e2, roughness: .2, clearcoat: 1, clearcoatRoughness: .05 }));
    const iris = new THREE.Mesh(new THREE.CircleGeometry(.056, 32), new THREE.MeshStandardMaterial({ color: L.eye, roughness: .3, emissive: L.glowEye || 0, emissiveIntensity: L.glowEye ? .9 : 0 })); iris.position.z = .119;
    const pupil = new THREE.Mesh(new THREE.CircleGeometry(.024, 24), new THREE.MeshBasicMaterial({ color: 0x050303 })); pupil.position.z = .1205;
    const spec = new THREE.Mesh(new THREE.CircleGeometry(.009, 12), new THREE.MeshBasicMaterial({ color: 0xffffff })); spec.position.set(-.018, .02, .1215);
    eg.add(ball, iris, pupil, spec), headG.add(eg), eyes.push(eg);
    // upper lid: a skin cap that rotates down over the eye to blink
    const lid = new THREE.Mesh(new THREE.SphereGeometry(.128, 32, 16, 0, Math.PI * 2, 0, Math.PI * .5), skinMat); lid.position.copy(eg.position), headG.add(lid), lids.push(lid);
    const low = new THREE.Mesh(new THREE.SphereGeometry(.126, 32, 12, 0, Math.PI * 2, Math.PI * .72, Math.PI * .28), skinMat); low.position.copy(eg.position), headG.add(low);
    // brow
    const bw = new THREE.Mesh(new THREE.SphereGeometry(.1, 16, 8), hairMat(L.hair)); bw.scale.set(1.35 * (L.brow || 1) * (L.fem ? .8 : 1), (L.fem ? .18 : .26) * (L.brow || 1), .3), bw.rotation.z = -k * .12, bw.position.set(k * .3, .29, surfZ(k * .3, .29, L) + .005), bw.rotation.y = k * .35, headG.add(bw);
  }
  // ears
  for (const k of [-1, 1]) { const ear = new THREE.Mesh(new THREE.SphereGeometry(.15, 20, 16), skinMat); ear.scale.set(.35, 1, .7), ear.position.set(k * .72, .05, -.05), ear.rotation.y = k * .3, headG.add(ear); }
  // neck and torso: a domed bust gives the trapezius slope into the shoulders
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(.5, .64, .8, 32), skinMat); neck.position.set(0, -1.05, -.12), body.add(neck);
  const [uc, ac] = UNI[L.uni] || UNI.van, uMat = new THREE.MeshStandardMaterial({ color: uc, roughness: .85 }), aMat = new THREE.MeshStandardMaterial({ color: ac, roughness: .5, emissive: ac, emissiveIntensity: "hive" === L.uni ? .8 : .1 });
  const TX = 1.95, TY = 1.15, TZ = .85, TYC = -2.35, tz = (x, y) => { const q = 1 - (x / TX) ** 2 - ((y - TYC) / TY) ** 2; return q > 0 ? TZ * Math.sqrt(q) - .1 : 0 };
  const torsoGeo = new THREE.SphereGeometry(1, 72, 48); { const p = torsoGeo.attributes.position; for (let i = 0; i < p.count; i++) { const n = (vn3(p.getX(i) * 5, p.getY(i) * 5, p.getZ(i) * 5) - .5) * .015; p.setXYZ(i, p.getX(i) * TX * (1 + n), p.getY(i) * TY, p.getZ(i) * TZ * (1 + n)) } torsoGeo.computeVertexNormals() }
  const torso = new THREE.Mesh(torsoGeo, uMat); torso.position.set(0, TYC, -.1), body.add(torso);
  const at = (m, x, y, rx) => (m.position.set(x, y, tz(x, y) + .02), m.rotation.x = rx || -.3, body.add(m), m);
  const collar = new THREE.Mesh(new THREE.TorusGeometry(.5, .1, 12, 40, Math.PI * 1.3), "lab" === L.uni ? new THREE.MeshStandardMaterial({ color: 0xf2f4f6, roughness: .7 }) : uMat); collar.rotation.x = Math.PI / 2 + .25, collar.rotation.z = Math.PI * .5 + Math.PI * .35, collar.position.set(0, -1.32, -.1), body.add(collar);
  if ("lab" === L.uni) { at(new THREE.Mesh(new THREE.BoxGeometry(.5, .9, .04), new THREE.MeshStandardMaterial({ color: 0xd8e0e8 })), 0, -2.05); at(new THREE.Mesh(new THREE.BoxGeometry(.13, .85, .05), new THREE.MeshStandardMaterial({ color: 0x34485c })), 0, -2.05).position.z += .03; for (const k of [-1, 1]) { const lap = at(new THREE.Mesh(new THREE.BoxGeometry(.3, 1.1, .04), new THREE.MeshStandardMaterial({ color: 0xf0f2f4, roughness: .8 })), k * .38, -2.1); lap.rotation.z = k * .3 } }
  if ("leg" === L.uni) { for (const k of [-1, 1]) at(new THREE.Mesh(new THREE.BoxGeometry(.24, .12, .04), aMat), k * .45, -1.55); for (let i = 0; i < 3; i++) at(new THREE.Mesh(new THREE.CylinderGeometry(.055, .055, .02, 16), new THREE.MeshStandardMaterial({ color: 0xd8b04a, metalness: .8, roughness: .3 })), -.75 + .15 * i, -2.25, Math.PI / 2 - .3); for (let i = 0; i < 4; i++) at(new THREE.Mesh(new THREE.SphereGeometry(.04, 12, 8), new THREE.MeshStandardMaterial({ color: 0xc8a040, metalness: .8, roughness: .3 })), 0, -1.9 - .3 * i) }
  if ("van" === L.uni) { at(new THREE.Mesh(new THREE.BoxGeometry(.3, .2, .04), aMat), .8, -2.2); at(new THREE.Mesh(new THREE.BoxGeometry(.08, .12, .02), new THREE.MeshStandardMaterial({ color: 0xc8ccd0, metalness: .9, roughness: .3 })), 0, -1.95); for (const k of [-1, 1]) at(new THREE.Mesh(new THREE.BoxGeometry(.34, .26, .05), uMat), k * .6, -2.35) }
  if ("ops" === L.uni) { const st = at(new THREE.Mesh(new THREE.BoxGeometry(.16, 1.8, .06), new THREE.MeshStandardMaterial({ color: 0x15171a, roughness: .7 })), .2, -2.3); st.rotation.z = -.55; for (const k of [-1, 1]) at(new THREE.Mesh(new THREE.BoxGeometry(.4, .3, .08), new THREE.MeshStandardMaterial({ color: 0x1c1f22, roughness: .8 })), k * .75, -2.4) }
  if ("hive" === L.uni) { for (const k of [-1, 1]) { const seam = at(new THREE.Mesh(new THREE.BoxGeometry(.03, 1.3, .03), aMat), k * .35, -2.2); seam.rotation.z = k * -.25 } }
  if ("eng" === L.uni) { at(new THREE.Mesh(new THREE.BoxGeometry(2.4, .08, .05), aMat), 0, -2.45); for (const k of [-1, 1]) at(new THREE.Mesh(new THREE.BoxGeometry(.12, 1, .05), new THREE.MeshStandardMaterial({ color: 0x3a2c1a })), k * .5, -2.1) }
  // hair
  const hm = hairMat(L.hair), hairFn = (x, y, z) => { const n = vn3(x * 3, y * 14, z * 3) * .04; return [x * (1 + n), y, z * (1 + n)] };
  const hl = L.fem ? .48 : "side" === L.hairStyle ? .5 : .56, capBack = (x, y, z) => { // tuck the shell inside the skull below the hairline so the face stays clear
    const r = Math.hypot(x, y, z) || 1, fz = z / r; if (fz > .25 && y < hl) { const t = sm(.25, .45, fz) * sm(hl, hl - .08, y); x *= 1 - .35 * t, y *= 1 - .35 * t, z *= 1 - .35 * t } return hairFn(x, y, z) };
  const cap = new THREE.Mesh(shellGeo(1.04, .77, 1.02, .9, 0, Math.PI * ("long" === L.hairStyle ? .62 : .5), capBack), hm); cap.position.y = .02, headG.add(cap);
  if ("side" === L.hairStyle) { const part = new THREE.Mesh(shellGeo(1.06, .76, .5, .6, 0, Math.PI * .3), hm); part.position.set(-.08, .56, .18), part.rotation.z = .25, headG.add(part) }
  if ("bun" === L.hairStyle) { const bun = new THREE.Mesh(new THREE.SphereGeometry(.28, 24, 16), hm); bun.position.set(0, .35, -.9), headG.add(bun) }
  if ("long" === L.hairStyle) { const drape = new THREE.Mesh(new THREE.CylinderGeometry(.82, 1.1, 2.1, 48, 12, !0, Math.PI * .3, Math.PI * 1.4), hm); { const p = drape.geometry.attributes.position; for (let i = 0; i < p.count; i++) { const n = vn3(p.getX(i) * 4, p.getY(i) * 1.5, p.getZ(i) * 4) * .08; p.setX(i, p.getX(i) * (1 + n)), p.setZ(i, p.getZ(i) * .85 * (1 + n)) } drape.geometry.computeVertexNormals() } drape.material.side = THREE.DoubleSide, drape.position.set(0, -.8, -.18), headG.add(drape);
    for (const k of [-1, 1]) { const lock = new THREE.Mesh(new THREE.SphereGeometry(.3, 20, 16), hm); lock.scale.set(.5, 1.6, .7), lock.position.set(k * .68, -.3, .15), headG.add(lock) } }
  if (L.mous) { const mo = new THREE.Mesh(new THREE.SphereGeometry(.2, 24, 12), hairMat(L.mous, .9)); mo.scale.set(1.25, .28, .45), mo.position.set(0, -.41, .76), headG.add(mo) }
  if (L.beard) { const bd = new THREE.Mesh(shellGeo(1.03, .7, 1, .86, Math.PI * .62, Math.PI, hairFn), hairMat(L.beard, .95)); bd.geometry.computeVertexNormals(), headG.add(bd); const mo = new THREE.Mesh(new THREE.SphereGeometry(.2, 24, 12), hairMat(L.beard, .95)); mo.scale.set(1.3, .3, .45), mo.position.set(0, -.41, .76), headG.add(mo) }
  // headwear
  if ("beret" === L.hat) { const b = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24), new THREE.MeshStandardMaterial({ color: L.hatC, roughness: .95 })); b.scale.set(.95, .3, .95), b.position.set(-.12, .82, -.05), b.rotation.z = .22, headG.add(b); const band = new THREE.Mesh(new THREE.TorusGeometry(.78, .05, 8, 48), new THREE.MeshStandardMaterial({ color: 0x0e1824, roughness: .6 })); band.rotation.x = Math.PI / 2, band.scale.y = .92, band.position.set(0, .66, 0), headG.add(band); const badge = new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, .03, 20), new THREE.MeshStandardMaterial({ color: 0xd8c27a, metalness: .9, roughness: .25 })); badge.rotation.x = Math.PI / 2 - .3, badge.position.set(-.38, .78, .62), headG.add(badge) }
  if ("cap" === L.hat) { const cm = new THREE.MeshStandardMaterial({ color: L.hatC, roughness: .8 }); const crown = new THREE.Mesh(new THREE.CylinderGeometry(1.08, .8, .42, 48), cm); crown.scale.z = .95, crown.position.set(0, .98, -.02), headG.add(crown); const band = new THREE.Mesh(new THREE.CylinderGeometry(.81, .79, .16, 48), new THREE.MeshStandardMaterial({ color: 0x9a1c1c, roughness: .7 })); band.position.set(0, .76, -.02), headG.add(band); const visor = new THREE.Mesh(new THREE.CylinderGeometry(.82, .82, .04, 48, 1, !1, -Math.PI * .5, Math.PI), new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: .3, metalness: .2 })); visor.scale.z = .75, visor.position.set(0, .68, .2), visor.rotation.x = .25, headG.add(visor); const star = new THREE.Mesh(new THREE.CircleGeometry(.1, 5), new THREE.MeshStandardMaterial({ color: 0xd8342a, emissive: 0x801010, emissiveIntensity: .4 })); star.position.set(0, .83, .8), headG.add(star) }
  if ("helmet" === L.hat) { const hmM = new THREE.MeshStandardMaterial({ color: L.hatC, roughness: .6, metalness: .2 }); const h = new THREE.Mesh(new THREE.SphereGeometry(1.1, 48, 24, 0, Math.PI * 2, 0, Math.PI * .5), hmM); h.scale.set(.86, .82, .98), h.position.y = .25, headG.add(h); const rim = new THREE.Mesh(new THREE.TorusGeometry(.95, .05, 8, 48), hmM); rim.rotation.x = Math.PI / 2, rim.scale.y = 1.12, rim.position.y = .26, headG.add(rim); const gog = new THREE.Mesh(new THREE.BoxGeometry(.9, .2, .12), new THREE.MeshStandardMaterial({ color: 0x15181a, roughness: .5 })); gog.position.set(0, .62, .78), headG.add(gog); for (const k of [-1, 1]) { const lens = new THREE.Mesh(new THREE.CircleGeometry(.09, 20), new THREE.MeshPhysicalMaterial({ color: 0x6aa0c0, roughness: .05, clearcoat: 1, emissive: 0x10283a })); lens.position.set(k * .22, .62, .845), headG.add(lens) } }
  if ("hood" === L.hat) { const hmM = new THREE.MeshStandardMaterial({ color: 0x241632, roughness: .9, side: THREE.DoubleSide }); const hood = new THREE.Mesh(new THREE.SphereGeometry(1.3, 64, 32, Math.PI * .5 + .95, Math.PI * 2 - 1.9, 0, Math.PI * .78), hmM); hood.scale.set(.95, 1.12, 1.02), hood.position.set(0, .05, -.05), headG.add(hood); const drape = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.9, 1.6, 48, 1, !0, .95, Math.PI * 2 - 1.9), hmM); drape.scale.z = .75, drape.position.set(0, -1.75, -.15), body.add(drape); const glowE = new THREE.Mesh(new THREE.TorusGeometry(1.24, .02, 6, 64, Math.PI * .8), new THREE.MeshBasicMaterial({ color: L.glowEye || 0xb27ae0 })); glowE.rotation.z = Math.PI * .1, glowE.position.set(0, .05, .38), glowE.scale.set(.72, 1.05, 1), headG.add(glowE) }
  if (L.glasses) { const fm = new THREE.MeshStandardMaterial({ color: 0x1a1d22, roughness: .4, metalness: .6 }); for (const k of [-1, 1]) { const ring = new THREE.Mesh(new THREE.TorusGeometry(.14, .012, 8, 32), fm); ring.scale.set(1.2, .8, 1), ring.position.set(k * .29, .12, .83), headG.add(ring); const arm = new THREE.Mesh(new THREE.BoxGeometry(.015, .015, .8), fm); arm.position.set(k * .46, .14, .45), headG.add(arm) } const br = new THREE.Mesh(new THREE.BoxGeometry(.14, .015, .015), fm); br.position.set(0, .14, .84), headG.add(br) }
  if (L.mask) { const mk = new THREE.Mesh(shellGeo(1.05, .76, 1, .9, Math.PI * .56, Math.PI * .88), new THREE.MeshStandardMaterial({ color: 0x141618, roughness: .6, side: THREE.DoubleSide })); mk.geometry.computeVertexNormals(), headG.add(mk) }
  root.userData = { L, head, headG, body, eyes, lids };
  return root;
}
// Renders one actor pose and returns the canvas. talk 0..1 opens the jaw.
function renderActor(who, T, talk, turn, rimHex) {
  if (!actorsInit()) return null;
  let a = ACT.cache[who];
  if (!a) { try { a = ACT.cache[who] = buildActor(who) } catch (e) { console.error(e); return null } }
  const s = ACT.scene;
  for (const k in ACT.cache) ACT.cache[k].visible = ACT.cache[k] === a;
  a.parent || s.add(a);
  const u = a.userData, blinkP = (T + who.length * .7) % 4.1, blink = blinkP < .16 ? Math.sin(blinkP / .16 * Math.PI) : 0;
  u.headG.rotation.y = (turn || 0) * .32 + Math.sin(T * .31) * .06, u.headG.rotation.x = Math.sin(T * .23) * .035 - .02 + (talk ? .02 * Math.sin(T * 5) : 0), u.headG.rotation.z = Math.sin(T * .19) * .025;
  u.body.position.y = Math.sin(T * 1.1) * .012, u.body.rotation.y = (turn || 0) * .12;
  u.head.morphTargetInfluences[0] = talk;
  for (const e of u.eyes) e.rotation.y = -(turn || 0) * .25 + Math.sin(T * .7) * .08, e.rotation.x = Math.sin(T * .43) * .05;
  for (const l of u.lids) l.rotation.x = -1.28 + blink * 1.35;
  const rc = new THREE.Color(rimHex || 0x6fb8e0);
  ACT.lights.rim.color.copy(rc), ACT.lights.rim2.color.copy(rc), ACT.lights.under.color.copy(rc);
  ACT.lights.rim.position.x = turn > 0 ? -4 : 4;
  ACT.r.render(s, ACT.cam);
  return ACT.cv;
}
Object.assign(window, { renderActor, ACTORS });

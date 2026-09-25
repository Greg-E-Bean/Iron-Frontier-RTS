export {};
// First-person presentation layer. Everything here only changes how the
// shared world looks when FPS.on (plus the always-on foliage wind): render
// resolution, a player-centred shadow frustum, close-up terrain detail, a
// grass field, 3D effects, high-detail animated infantry, weapon viewmodels
// with arms, and vehicle cockpits. The simulation is untouched, so the RTS
// and first-person views stay two cameras on the same battle.

const FG: any = { t: { value: 0 }, tex: null, grass: null, fx: null, lights: null, figs: new Map(), figGeo: new Map(), prOn: 0 };

// ---------------------------------------------------------------- textures
function fgHash(x: number, y: number, s: number) { const h = Math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453; return h - Math.floor(h); }
// Tileable value noise with integer period p.
function fgNoise(x: number, y: number, p: number, s: number) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const w = (a: number) => ((a % p) + p) % p;
  const a = fgHash(w(xi), w(yi), s), b = fgHash(w(xi + 1), w(yi), s), c = fgHash(w(xi), w(yi + 1), s), d = fgHash(w(xi + 1), w(yi + 1), s);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fgFbm(x: number, y: number, p: number, s: number) { let a = 0, m = .5, f = 1; for (let i = 0; i < 4; i++) a += m * fgNoise(x * f, y * f, p * f, s + i * 13), m *= .5, f *= 2; return a / .9375; }
function fgCanvas(n: number) { const c = document.createElement("canvas"); c.width = c.height = n; return c; }
function fgTexOf(c: HTMLCanvasElement, rep?: boolean) { const t = new THREE.CanvasTexture(c); rep && (t.wrapS = t.wrapT = THREE.RepeatWrapping), t.anisotropy = 8; return t; }

function fgTextures() {
  if (FG.tex) return FG.tex;
  const T: any = {};
  // Terrain detail: r = fine grass/grit, g = broad mottling, b = rock strata.
  { const N = 256, c = fgCanvas(N), x = c.getContext("2d")!, im = x.createImageData(N, N), d = im.data;
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const u = i / N, v = j / N, k = 4 * (j * N + i);
      d[k] = 255 * Math.min(1, Math.max(0, .5 + .9 * (fgFbm(u * 32, v * 32, 32, 3) - .5) + .35 * (fgHash(i, j, 9) - .5)));
      d[k + 1] = 255 * fgFbm(u * 4, v * 4, 4, 17);
      d[k + 2] = 255 * Math.min(1, Math.max(0, .5 + .5 * Math.sin(v * 6.283 * 9 + 5 * fgFbm(u * 6, v * 6, 6, 29)) * (.4 + .6 * fgFbm(u * 16, v * 16, 16, 41))));
      d[k + 3] = 255;
    }
    x.putImageData(im, 0, 0);
    // grass blades and pebbles over the fine channel
    x.globalCompositeOperation = "source-over";
    for (let n = 0; n < 2600; n++) {
      const px = fgHash(n, 1, 5) * N, py = fgHash(n, 2, 5) * N, a = fgHash(n, 3, 5) * 6.283, l = 2 + 5 * fgHash(n, 4, 5), lt = fgHash(n, 5, 5) > .5;
      x.strokeStyle = lt ? "rgba(255,90,90,.35)" : "rgba(0,60,60,.35)", x.lineWidth = .8;
      for (const ox of [0, -N, N]) for (const oy of [0, -N, N]) x.beginPath(), x.moveTo(px + ox, py + oy), x.lineTo(px + ox + Math.cos(a) * l, py + oy + Math.sin(a) * l), x.stroke();
    }
    for (let n = 0; n < 260; n++) {
      const px = fgHash(n, 7, 8) * N, py = fgHash(n, 8, 8) * N, r = .8 + 1.8 * fgHash(n, 9, 8);
      x.fillStyle = "rgba(20,120,120,.55)", x.beginPath(), x.arc(px, py, r, 0, 6.283), x.fill();
      x.fillStyle = "rgba(255,140,140,.4)", x.beginPath(), x.arc(px - .4 * r, py - .4 * r, .45 * r, 0, 6.283), x.fill();
    }
    T.detail = fgTexOf(c, !0);
  }
  { const c = fgCanvas(64), x = c.getContext("2d")!, g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,255,255,1)"), g.addColorStop(.25, "rgba(255,255,255,.75)"), g.addColorStop(.6, "rgba(255,255,255,.18)"), g.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = g, x.fillRect(0, 0, 64, 64), T.glow = fgTexOf(c); }
  { const N = 128, c = fgCanvas(N), x = c.getContext("2d")!, im = x.createImageData(N, N), d = im.data;
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const dx = (i - N / 2) / (N / 2), dy = (j - N / 2) / (N / 2), r = Math.hypot(dx, dy), n = fgFbm(i / N * 4, j / N * 4, 4, 7), k = 4 * (j * N + i);
      const a = Math.max(0, 1 - r * (1.05 + .5 * (n - .5))) ** 1.6;
      d[k] = d[k + 1] = d[k + 2] = 200 + 55 * n, d[k + 3] = 255 * Math.min(1, a * (.55 + .7 * n));
    }
    x.putImageData(im, 0, 0), T.smoke = fgTexOf(c); }
  { const c = fgCanvas(128), x = c.getContext("2d")!; x.translate(64, 64);
    const g = x.createRadialGradient(0, 0, 0, 0, 0, 40); g.addColorStop(0, "rgba(255,255,240,1)"), g.addColorStop(.4, "rgba(255,220,140,.7)"), g.addColorStop(1, "rgba(255,160,60,0)");
    x.fillStyle = g, x.beginPath(), x.arc(0, 0, 40, 0, 6.283), x.fill();
    for (let i = 0; i < 6; i++) { x.rotate(6.283 / 6 + .2 * (i % 2)); const L = i % 2 ? 44 : 62, s = x.createLinearGradient(0, 0, L, 0); s.addColorStop(0, "rgba(255,245,210,.95)"), s.addColorStop(1, "rgba(255,170,60,0)"); x.fillStyle = s, x.beginPath(), x.moveTo(0, -7), x.lineTo(L, 0), x.lineTo(0, 7), x.fill(); }
    T.flash = fgTexOf(c); }
  { const c = fgCanvas(128), x = c.getContext("2d")!, g = x.createRadialGradient(64, 64, 40, 64, 64, 62);
    g.addColorStop(0, "rgba(255,255,255,0)"), g.addColorStop(.55, "rgba(255,255,255,.9)"), g.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = g, x.fillRect(0, 0, 128, 128), T.ring = fgTexOf(c); }
  { const c = fgCanvas(8), x = c.getContext("2d")!, g = x.createLinearGradient(0, 0, 0, 8);
    g.addColorStop(0, "rgba(255,255,255,0)"), g.addColorStop(.5, "rgba(255,255,255,1)"), g.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = g, x.fillRect(0, 0, 8, 8), T.beam = fgTexOf(c); }
  { const c = fgCanvas(64), x = c.getContext("2d")!, g = x.createRadialGradient(32, 32, 4, 32, 32, 32);
    g.addColorStop(0, "rgba(255,255,255,.9)"), g.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = g, x.fillRect(0, 0, 64, 64), T.blob = fgTexOf(c); }
  return FG.tex = T;
}

// ------------------------------------------------------------ resolution
function fpsPixelRatio() {
  const d = window.devicePixelRatio || 1;
  return QUALITY >= 2 ? Math.min(2.5, Math.max(d, 1.5)) : QUALITY >= 1 ? Math.min(2, Math.max(d, 1.2)) : Math.min(1.25, d);
}

// Called at the top of renderGL every frame, RTS or FPS.
function fpsGfxPre() {
  if (!GL) return;
  FG.t.value = S.time || 0;
  const want = FPS.on ? fpsPixelRatio() : glPixelRatioCap();
  GL.renderer.getPixelRatio() !== want && GL.renderer.setPixelRatio(want);
  fgTerrainDetail();
  fgPruneInteriors(), fgPruneGroups(), fgPatchWorldMats(), FG.sdOn.value = FPS.on && FPS.u && QUALITY >= 1 ? 1 : 0;
  const on = !!(FPS.on && FPS.u);
  GL.sun.shadow.normalBias = on ? .5 : 1.2;
  fgGrass(on), fgFx(on);
}

// Recentre the sun's shadow frustum tightly around what the player sees.
function fpsGfxShadow() {
  if (!FPS.on || !FPS.u || !GL) return;
  const o = GL.sun, s = QUALITY >= 2 ? 330 : 280, cy = Math.cos(FPS.yaw), sy = Math.sin(FPS.yaw);
  const cx = FPS.u.x + cy * s * .5, cz = FPS.u.y + sy * s * .5, dx = cx - o.target.position.x, dz = cz - o.target.position.z, gy = heightAt(cx, cz);
  o.target.position.set(cx, gy, cz), o.position.x += dx, o.position.z += dz, o.position.y += gy;
  const i = o.shadow.camera; i.left = -s, i.right = s, i.top = s, i.bottom = -s, i.updateProjectionMatrix();
}

// ---------------------------------------------------------- terrain detail
function fgTerrainDetail() {
  const m = GL.terrain && GL.terrain.material;
  if (!m || m.userData.fgDetail) return;
  m.userData.fgDetail = 1;
  const T = fgTextures(), prev = m.onBeforeCompile;
  m.onBeforeCompile = (sh: any, r: any) => {
    prev && prev(sh, r);
    sh.uniforms.detailMap = { value: T.detail };
    sh.vertexShader = "varying vec3 vFgN;\n" + sh.vertexShader.replace("#include <beginnormal_vertex>", "#include <beginnormal_vertex>\nvFgN = objectNormal;");
    sh.fragmentShader = "uniform sampler2D detailMap;\nvarying vec3 vFgN;\n" + sh.fragmentShader.replace("#include <color_fragment>", `#include <color_fragment>
      {
        float fgD = distance(cameraPosition, vWorldFog);
        float fgF = 1.0 - smoothstep(150.0, 1100.0, fgD);
        if (fgF > 0.001) {
          vec2 wp = vWorldFog.xz;
          float d1 = texture2D(detailMap, wp / 21.0).r;
          float d2 = texture2D(detailMap, mat2(0.8, -0.6, 0.6, 0.8) * wp / 6.7).r;
          float d3 = texture2D(detailMap, wp / 173.0).g;
          float slope = 1.0 - clamp(normalize(vFgN).y, 0.0, 1.0);
          vec3 c = diffuseColor.rgb * (0.62 + 0.76 * mix(d1, d2, 0.45 + 0.3 * fgF)) * (0.82 + 0.36 * d3);
          float strata = texture2D(detailMap, vec2(wp.x * 0.7 + wp.y * 0.7, vWorldFog.y * 1.6) / 37.0).b;
          vec3 rockC = vec3(0.30, 0.27, 0.235) * (0.7 + 0.6 * strata) * (0.75 + 0.5 * d2);
          c = mix(c, rockC, smoothstep(0.34, 0.62, slope) * 0.75);
          diffuseColor.rgb = mix(diffuseColor.rgb, c, fgF);
        }
      }`);
  };
  m.needsUpdate = !0;
}

// ------------------------------------------------ close-up surface detail
// Panel seams, rivets, scratches, grit and grime, triplanar-projected from
// world position and bump-lit, fading in only near the first-person camera.
function fgSurfDetailTex() {
  if (FG.sdTex) return FG.sdTex;
  const N = 512, c = fgCanvas(N), x = c.getContext("2d")!, im = x.createImageData(N, N), d = im.data;
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const u = i / N, v = j / N, k = 4 * (j * N + i);
    d[k] = 255 * Math.min(1, Math.max(0, .5 + .8 * (fgFbm(u * 64, v * 64, 64, 5) - .5) + .3 * (fgHash(i, j, 3) - .5)));
    d[k + 1] = 190, d[k + 2] = 128;
    d[k + 3] = 255 * Math.min(1, Math.max(0, .5 + 1.2 * (fgFbm(u * 6, v * 6, 6, 21) - .5)));
  }
  x.putImageData(im, 0, 0);
  // panel seams (G) — lines on a staggered grid, rivet dots along them
  const P = 128;
  const px = (fx: number, fy: number, w: number, h: number, g: number) => { const img = x.getImageData(fx, fy, w, h); for (let q = 0; q < img.data.length; q += 4) img.data[q + 1] = g; x.putImageData(img, fx, fy); };
  for (let r = 0; r < N / P; r++) {
    px(0, r * P, N, 3, 25), px(0, r * P + 3, N, 1, 235);
    const off = r % 2 ? P / 2 : 0;
    for (let q = 0; q < N / P; q++) { const cx = (q * P + off) % N; px(cx, r * P, 3, P, 25), px(cx + 3, r * P, 1, P, 235); }
    for (let q = 6; q < N; q += 16) px(q, r * P + 7, 3, 3, 255), px(q + 1, r * P + 10, 2, 1, 60);
  }
  // scratches / streaks (B)
  { const img = x.getImageData(0, 0, N, N), dd = img.data;
    for (let n = 0; n < 900; n++) { let sx = fgHash(n, 1, 9) * N, sy = fgHash(n, 2, 9) * N; const a = fgHash(n, 3, 9) * 6.283, l = 6 + 40 * fgHash(n, 4, 9), val = fgHash(n, 5, 9) > .3 ? 215 : 60;
      for (let t = 0; t < l; t++) { const qx = ((sx + Math.cos(a) * t) % N + N) % N | 0, qy = ((sy + Math.sin(a) * t) % N + N) % N | 0; dd[4 * (qy * N + qx) + 2] = val; } }
    // organic veins also live in B: branching dark curves
    for (let n = 0; n < 40; n++) { let vx = fgHash(n, 7, 2) * N, vy = fgHash(n, 8, 2) * N, a = fgHash(n, 9, 2) * 6.283;
      for (let t = 0; t < 140; t++) { a += (fgHash(n, t, 4) - .5) * .5, vx += Math.cos(a), vy += Math.sin(a); const qx = ((vx % N) + N) % N | 0, qy = ((vy % N) + N) % N | 0; dd[4 * (qy * N + qx) + 2] = 20; } }
    x.putImageData(img, 0, 0); }
  const t = fgTexOf(c, !0);
  t.anisotropy = GL && GL.renderer.capabilities.getMaxAnisotropy ? GL.renderer.capabilities.getMaxAnisotropy() : 8;
  return FG.sdTex = t;
}
const FG_KIND: Record<string, number> = { metal: 0, concrete: 1, matte: 2, organic: 3, rubber: 4, foliage: 5 };
FG.sdOn = { value: 0 };
function fgSurfDetail(m: any, bucket: string, scale?: number) {
  const kind = FG_KIND[bucket];
  if (!m || null == kind || m.userData.fgSD) return m;
  m.userData.fgSD = 1, m.extensions = Object.assign({}, m.extensions || {}, { derivatives: !0 });
  const tex = fgSurfDetailTex(), prev = m.onBeforeCompile, sc = scale || 1;
  m.onBeforeCompile = (sh: any, r: any) => {
    prev && prev(sh, r);
    sh.uniforms.fgSD = { value: tex }, sh.uniforms.fgOn = FG.sdOn;
    sh.vertexShader = "varying vec3 vFgP;\nvarying vec3 vFgWN;\n" + sh.vertexShader.replace("#include <project_vertex>", `#include <project_vertex>
      #ifdef USE_INSTANCING
        vFgP = (modelMatrix * instanceMatrix * vec4(transformed, 1.0)).xyz;
        vFgWN = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * objectNormal);
      #else
        vFgP = (modelMatrix * vec4(transformed, 1.0)).xyz;
        vFgWN = normalize(mat3(modelMatrix) * objectNormal);
      #endif`);
    sh.fragmentShader = `uniform sampler2D fgSD;\nuniform float fgOn;\nvarying vec3 vFgP;\nvarying vec3 vFgWN;
      vec4 fgTri(vec3 p, vec3 w, float s) { return texture2D(fgSD, p.zy * s) * w.x + texture2D(fgSD, p.xz * s) * w.y + texture2D(fgSD, p.xy * s) * w.z; }
      vec3 fgBump(vec3 sp, vec3 sn, float h) {
        vec3 dx = dFdx(sp), dy = dFdy(sp), r1 = cross(dy, sn), r2 = cross(sn, dx); float det = dot(dx, r1);
        vec3 g = sign(det) * (dFdx(h) * r1 + dFdy(h) * r2); return normalize(abs(det) * sn - g);
      }
      float fgH = 0.0; float fgF = 0.0;
      ` + sh.fragmentShader.replace("#include <color_fragment>", `#include <color_fragment>
      if (fgOn > 0.5) {
        vec3 P = vFgP * ${sc.toFixed(3)};
        fgF = 1.0 - smoothstep(${(120 / sc).toFixed(1)}, ${(700 / sc).toFixed(1)}, distance(cameraPosition, vFgP));
        vec3 w = pow(abs(normalize(vFgWN)), vec3(4.0)); w /= (w.x + w.y + w.z);
        vec4 A = fgTri(P, w, 1.0 / 44.0), B = fgTri(P, w, 1.0 / 15.0);
        float grit = B.r, seam = A.g, scr = A.b, grime = A.a, f = 1.0;
        #if ${kind} == 0
          f = (0.55 + 0.55 * seam) * (0.94 + 0.12 * grit) * (1.0 + 0.14 * (scr - 0.5)) * (0.86 + 0.24 * grime); fgH = seam * 0.9 + grit * 0.06;
        #elif ${kind} == 1
          f = (0.84 + 0.3 * grit) * (0.84 + 0.3 * grime) * (1.0 + 0.08 * (scr - 0.5)); fgH = grit * 0.45;
        #elif ${kind} == 2
          f = (0.92 + 0.16 * grit) * (0.9 + 0.2 * grime); fgH = grit * 0.2;
        #elif ${kind} == 3
          f = (0.78 + 0.4 * scr) * (0.88 + 0.24 * grime) * (0.95 + 0.1 * grit); fgH = scr * 0.6 + grit * 0.08;
        #elif ${kind} == 4
          f = (0.9 + 0.2 * grit); fgH = grit * 0.3;
        #else
          f = (0.84 + 0.26 * grime) * (0.93 + 0.14 * grit); fgH = grit * 0.2;
        #endif
        diffuseColor.rgb *= mix(1.0, f, fgF);
      }`).replace("#include <normal_fragment_maps>", `#include <normal_fragment_maps>
      if (fgOn > 0.5 && fgF > 0.001) normal = fgBump(-vViewPosition, normal, fgH * fgF * ${(0.9 / sc).toFixed(3)});`);
  };
  m.needsUpdate = !0;
  return m;
}
function fgPatchWorldMats() {
  if (!GL || GL.mats._fgSD) return;
  GL.mats._fgSD = 1;
  for (const k in FG_KIND) GL.mats[k] && fgSurfDetail(GL.mats[k], k);
  const an = GL.renderer.capabilities.getMaxAnisotropy ? GL.renderer.capabilities.getMaxAnisotropy() : 8;
  for (const k in GL.surfaces || {}) { const sf = GL.surfaces[k]; sf.map && (sf.map.anisotropy = an, sf.map.needsUpdate = !0); sf.normal && (sf.normal.anisotropy = an); }
}

// ------------------------------------------------------------ foliage wind
function fgWindPatch(m: any, grass?: boolean) {
  const prev = m.onBeforeCompile;
  m.onBeforeCompile = (sh: any, r: any) => {
    prev && prev(sh, r);
    sh.uniforms.uWindT = FG.t;
    sh.vertexShader = "uniform float uWindT;\n" + sh.vertexShader.replace("#include <begin_vertex>", `#include <begin_vertex>
      #ifdef USE_INSTANCING
      {
        vec4 ip = instanceMatrix[3];
        float h = max(transformed.y, 0.0);
        float amp = ${grass ? "0.11 * h * h / 6.0" : "clamp(h * 0.07, 0.0, 1.1) * (h / (h + 2.0))"};
        float ph = uWindT * ${grass ? "2.3" : "1.25"} + ip.x * 0.021 + ip.z * 0.017;
        float gust = 0.6 + 0.4 * sin(uWindT * 0.37 + ip.x * 0.004);
        transformed.x += (sin(ph) + 0.35 * sin(ph * 2.7 + h * 0.3)) * amp * gust;
        transformed.z += cos(ph * 0.8 + 1.3) * amp * 0.45 * gust;
      }
      #endif`);
  };
  m.needsUpdate = !0;
  return m;
}
// Wind-swayed copies of the bucket materials that props use.
function fgWindMat(bucket: string) {
  if (!GL) return null;
  const k = "wind_" + bucket;
  if (GL.mats[k]) return GL.mats[k];
  const b = GL.mats[bucket];
  if (!b || "emis" === bucket) return b;
  const m = new THREE.MeshStandardMaterial({ vertexColors: !0, roughness: b.roughness, metalness: b.metalness, envMapIntensity: b.envMapIntensity, map: b.map, normalMap: b.normalMap, normalScale: b.normalScale });
  m.color = b.color.clone();
  fogPatch(m), fgWindPatch(m), fgSurfDetail(m, bucket);
  return GL.mats[k] = m;
}
const WIND_KEYS = /^X(tree|scrub|grass|flower)/;

// ------------------------------------------------------------- grass field
function fgGrassGeo() {
  const P: number[] = [], C: number[] = [], Nn: number[] = [];
  for (let b = 0; b < 7; b++) {
    const a = b * 2.399 + .3, r = b ? .35 + .5 * fgHash(b, 1, 3) : 0, bx = Math.cos(a) * r * 1.4, bz = Math.sin(a) * r * 1.4;
    const h = 2.6 + 2.8 * fgHash(b, 2, 3), w = .28 + .12 * fgHash(b, 3, 3), fa = fgHash(b, 4, 3) * 6.283, lean = .35 + .5 * fgHash(b, 5, 3);
    const fx = Math.cos(fa), fz = Math.sin(fa), px = -fz, pz = fx;
    const pt = (t: number, s: number) => { const off = lean * t * t * h * .45; return [bx + fx * off + px * s * w * (1 - t), h * t, bz + fz * off + pz * s * w * (1 - t)]; };
    const rows = [0, .45, .8], v: number[][] = [];
    for (const t of rows) v.push(pt(t, -1), pt(t, 1));
    v.push(pt(1, 0));
    const col = (t: number) => [.05 + .22 * t, .11 + .3 * t, .03 + .07 * t];
    const tri = (i: number, j: number, k: number, ti: number[]) => { for (const [q, t] of [[i, ti[0]], [j, ti[1]], [k, ti[2]]]) P.push(...v[q]), C.push(...col(t)), Nn.push(0, 1, 0); };
    tri(0, 1, 3, [0, 0, .45]), tri(0, 3, 2, [0, .45, .45]), tri(2, 3, 5, [.45, .45, .8]), tri(2, 5, 4, [.45, .8, .8]), tri(4, 5, 6, [.8, .8, 1]);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(P, 3)), g.setAttribute("color", new THREE.Float32BufferAttribute(C, 3)), g.setAttribute("normal", new THREE.Float32BufferAttribute(Nn, 3));
  return g;
}
function fgGrass(on: boolean) {
  const q = FG.grass;
  if (!on || QUALITY < 1) { q && (q.mesh.visible = !1); return; }
  if (!q || q.scene !== GL.scene) {
    const m = new THREE.MeshStandardMaterial({ vertexColors: !0, roughness: .95, metalness: 0, side: THREE.DoubleSide });
    fogPatch(m), fgWindPatch(m, !0);
    const mesh = new THREE.InstancedMesh(fgGrassGeo(), m, 6000);
    mesh.receiveShadow = !0, mesh.castShadow = !1, mesh.frustumCulled = !1, mesh.count = 0;
    mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(3 * 6000), 3);
    GL.scene.add(mesh), FG.grass = { mesh, scene: GL.scene, cx: -99, cy: -99, seed: null };
  }
  const g = FG.grass, tx = Math.floor(FPS.u.x / 32), ty = Math.floor(FPS.u.y / 32);
  g.mesh.visible = !FPS.u.inside;
  if (Math.abs(tx - g.cx) < 2 && Math.abs(ty - g.cy) < 2 && g.seed === G.seed && g.occN === S.blds.length) return;
  g.cx = tx, g.cy = ty, g.seed = G.seed, g.occN = S.blds.length;
  const R = 11, M = new THREE.Matrix4(), Q = new THREE.Quaternion(), Y = new THREE.Vector3(0, 1, 0), V = new THREE.Vector3(), Sc = new THREE.Vector3(), col = new THREE.Color();
  let n = 0;
  for (let y = ty - R; y <= ty + R; y++) for (let x = tx - R; x <= tx + R; x++) {
    if (!inMap(x, y)) continue;
    const i = idx(x, y), tr = G.terr[i];
    if (tr >= 2 || G.occ[i] || (G.pave && G.pave[i]) || G.ore[i] > 0) continue;
    const dd = Math.hypot(x - tx, y - ty);
    if (dd > R) continue;
    const cnt = 0 === tr ? 10 : 3, edge = Math.min(1, (R - dd) / 2.5);
    for (let k = 0; k < cnt && n < 6000; k++) {
      const wx = 32 * x + 32 * fgHash(x, y, k), wy = 32 * y + 32 * fgHash(y, x, k + 50), s = (.75 + .7 * fgHash(x + k, y, 7)) * (.3 + .7 * edge) * (0 === tr ? 1 : .7);
      Q.setFromAxisAngle(Y, 6.283 * fgHash(x, y + k, 11)), V.set(wx, heightAt(wx, wy) - .2, wy), Sc.set(s, s * (0 === tr ? 1 : .8), s);
      M.compose(V, Q, Sc), g.mesh.setMatrixAt(n, M);
      const hv = fgHash(x * 3 + k, y, 13);
      0 === tr ? col.setRGB(.85 + .35 * hv, .9 + .25 * hv, .7 + .2 * hv) : col.setRGB(1.5 + .3 * hv, 1.2 + .2 * hv, .7);
      g.mesh.setColorAt(n, col), n++;
    }
  }
  g.mesh.count = n, g.mesh.instanceMatrix.needsUpdate = !0, g.mesh.instanceColor.needsUpdate = !0;
}

// ------------------------------------------------------------ 3D effects
function fgFx(on: boolean) {
  let F = FG.fx;
  if (!on) { if (F) { for (const k of ["spr", "beam", "dec", "deb"]) for (const o of F[k]) o.visible = !1; for (const l of F.lights) l.visible = !1; } return; }
  if (!F || F.scene !== GL.scene) F = fgFxInit();
  for (const l of F.lights) l.visible = !0;
  let si = 0, bi = 0, di = 0, ei = 0, li = 0;
  const T = F.T, camP = FPS.cam.position;
  const spr = (x: number, y: number, z: number, size: number, tex: any, col: any, op: number, add: boolean, rot?: number) => {
    if (si >= F.spr.length) return;
    const s = F.spr[si++], m = s.material;
    s.visible = !0, s.position.set(x, z, y), s.scale.set(size, size, 1);
    m.map !== tex && (m.map = tex), m.color.set(col), m.opacity = op, m.rotation = rot || 0;
    const bl = add ? THREE.AdditiveBlending : THREE.NormalBlending; m.blending !== bl && (m.blending = bl, m.needsUpdate = !0);
  };
  const A = new THREE.Vector3(), B = new THREE.Vector3(), D = new THREE.Vector3(), Sd = new THREE.Vector3(), Nw = new THREE.Vector3(), Mx = new THREE.Matrix4();
  const beam = (x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, w: number, col: any, op: number) => {
    if (bi >= F.beam.length) return;
    A.set(x1, z1, y1), B.set(x2, z2, y2), D.subVectors(B, A);
    const L = D.length(); if (L < .01) return;
    const b = F.beam[bi++]; D.divideScalar(L);
    Sd.subVectors(camP, A.clone().add(B).multiplyScalar(.5)).cross(D).normalize(), Nw.crossVectors(D, Sd);
    Mx.makeBasis(D.clone().multiplyScalar(L), Sd.clone().multiplyScalar(w), Nw).setPosition(A.clone().add(B).multiplyScalar(.5));
    b.matrix.copy(Mx), b.matrixWorldNeedsUpdate = !0, b.visible = !0, b.material.color.set(col), b.material.opacity = op;
  };
  const decal = (x: number, y: number, z: number, sx: number, sy: number, ang: number, tex: any, col: any, op: number, add: boolean) => {
    if (di >= F.dec.length) return;
    const d = F.dec[di++], m = d.material;
    d.visible = !0, d.position.set(x, z, y), d.rotation.set(-Math.PI / 2, 0, -ang), d.scale.set(sx, sy, 1);
    m.map !== tex && (m.map = tex, m.needsUpdate = !0), m.color.set(col), m.opacity = op;
    const bl = add ? THREE.AdditiveBlending : THREE.NormalBlending; m.blending !== bl && (m.blending = bl, m.needsUpdate = !0);
  };
  const light = (x: number, y: number, z: number, col: any, I: number, dist: number) => {
    if (li >= F.lights.length || I < .05) return;
    const l = F.lights[li++]; l.visible = !0, l.position.set(x, z, y), l.color.set(col), l.intensity = I, l.distance = dist;
  };
  const gz = (x: number, y: number) => heightAt(x, y);
  const near = (x: number, y: number) => Math.abs(x - FPS.u.x) + Math.abs(y - FPS.u.y) < 1500;
  for (const e of S.fx) {
    if (e.t < 0 || !near(e.x, e.y)) continue;
    const r = Math.min(1, e.t / e.life), g = gz(e.x, e.y) + (e.z || 0) * (FPS_INF_SC + .1);
    switch (e.kind) {
      case "boom": {
        const R = (7 + 24 * e.s) * (.35 + r) * 1.25;
        spr(e.x, e.y, g + 4 + 6 * e.s, R * 2, T.glow, e.c || "#ff9a3c", Math.max(0, 1 - 1.3 * r), !0);
        spr(e.x, e.y, g + 3 + 4 * e.s, R * 1.1, T.glow, "#fff3cf", Math.max(0, 1 - 2.2 * r), !0);
        r > .15 && spr(e.x, e.y, g + 6 + 14 * r * (1 + e.s), R * 1.8, T.smoke, "#4a443c", .6 * (1 - r), !1, e.x * .1);
        r < .5 && light(e.x, e.y, g + 10, e.c || "#ffa040", 6 * Math.min(2, e.s + .3) * (1 - 2 * r), 60 + 60 * e.s);
        break;
      }
      case "spark": spr(e.x + 2 * Math.sin(e.t * 40 + e.x), e.y, g + 8 + 6 * r, 3.2 * (1 - .5 * r), T.glow, e.c || "#ffd", 1 - r, !0); break;
      case "smoke": { const sz = (3 + 8 * r) * (e.s || 1) * 2.2; spr(e.x, e.y, g + 4 + 20 * r, sz, T.smoke, e.c || "#888", .5 * (1 - r), !1, e.x * .07 + r); break; }
      case "ring": decal(e.x, e.y, gz(e.x, e.y) + .6, 2 * (10 + r * (e.s || 1) * 60), 2 * (10 + r * (e.s || 1) * 60), 0, T.ring, e.c || "#fff", 1 - r, !0); break;
      case "wake": { const k = 2 * (3 + (e.s || 1) * 1.3 * r); decal(e.x, e.y, 1.2, k * 2, k * 2, 0, T.ring, "#e8f6fa", .45 * (1 - r), !1); break; }
      case "track": decal(e.x, e.y, gz(e.x, e.y) + .35, 2 * e.l, 2 * e.w, e.ang, T.blob, "#1c1812", .35 * (1 - r), !1); break;
      case "debris": {
        if (ei >= F.deb.length) break;
        const gr = 2 * e.vz / e.life, z = Math.max(0, e.vz * e.t - .5 * gr * e.t * e.t), wx = e.x + e.vx * e.t, wy = e.y + e.vy * e.t, o = F.deb[ei++];
        o.visible = !0, o.position.set(wx, gz(wx, wy) + z + 1, wy), o.rotation.set(e.rot + e.rotSpd * e.t, e.rot * 2, e.rotSpd * e.t * .7), o.material.color.set(e.c || "#555");
        break;
      }
      case "text": case "strike": break;
      default:
        if (void 0 !== e.x2) {
          const z1 = g, x2 = e.x2, y2 = e.y2, z2 = gz(x2, y2) + (e.z2 || 6) * (FPS_INF_SC + .1), op = 1 - .8 * r, col = e.c || "#fff";
          const w = "prism" === e.kind ? 2.2 : "tesla" === e.kind ? 1.3 : "psi" === e.kind ? 1.6 : 1.1;
          if ("tesla" === e.kind) {
            let px = e.x, py = e.y, pz = z1;
            for (let k = 1; k <= 5; k++) { const t = k / 5, j = k < 5 ? 6 : 0, nx = e.x + (x2 - e.x) * t + rnd(-j, j), ny = e.y + (y2 - e.y) * t + rnd(-j, j), nz = z1 + (z2 - z1) * t + rnd(-j, j) * .6; beam(px, py, pz, nx, ny, nz, w, col, op), beam(px, py, pz, nx, ny, nz, w * 3, col, .3 * op), px = nx, py = ny, pz = nz; }
          } else if ("psi" === e.kind) {
            const mx = (e.x + x2) / 2 + 18 * Math.sin(20 * e.t), my = (e.y + y2) / 2 + 14 * Math.cos(17 * e.t), mz = (z1 + z2) / 2 + 10;
            let px = e.x, py = e.y, pz = z1;
            for (let k = 1; k <= 6; k++) { const t = k / 6, a = (1 - t) * (1 - t), b2 = 2 * (1 - t) * t, c2 = t * t, nx = a * e.x + b2 * mx + c2 * x2, ny = a * e.y + b2 * my + c2 * y2, nz = a * z1 + b2 * mz + c2 * z2; beam(px, py, pz, nx, ny, nz, w, col, op), px = nx, py = ny, pz = nz; }
          } else beam(e.x, e.y, z1, x2, y2, z2, w, col, op), beam(e.x, e.y, z1, x2, y2, z2, w * 3.2, col, .35 * op);
          spr(x2, y2, z2, 9 * (1 - .5 * r), T.glow, col, op, !0);
          light(x2, y2, z2 + 4, col, 2.2 * op, 45);
        }
    }
  }
  // Projectiles: tracers, exhaust and fire, over the 3D projectile models.
  for (const p of S.projs) {
    if (p.dead || 2 !== visAt(p.x, p.y) || !near(p.x, p.y)) continue;
    const z = gz(p.x, p.y) + (p.z || 0) * (FPS.on ? FPS_INF_SC + .1 : 1), c = Math.cos(p.ang), s = Math.sin(p.ang);
    if ("bullet" === p.kind) beam(p.x - 11 * c, p.y - 11 * s, z, p.x, p.y, z, .3, "#ffd27a", .95), beam(p.x - 5 * c, p.y - 5 * s, z, p.x, p.y, z, .9, "#ff9a40", .35);
    else if ("shell" === p.kind && p.fire) beam(p.x - 26 * c, p.y - 26 * s, z, p.x, p.y, z, 3, "#ff7a20", .8), spr(p.x, p.y, z, 7 + Math.sin(60 * S.time) * 1.5, T.glow, "#ffb040", 1, !0), spr(p.x, p.y, z, 3.5, T.glow, "#fff6d0", 1, !0);
    else if ("shell" === p.kind) beam(p.x - 22 * c, p.y - 22 * s, z, p.x, p.y, z, 1, "#ffd890", .85), spr(p.x, p.y, z, 3.4, T.glow, "#fff0c0", .9, !0);
    else if ("flak" === p.kind) spr(p.x, p.y, z, 3, T.glow, "#ffcf6a", .95, !0);
    else if ("flame" === p.kind) spr(p.x, p.y, z, 7 + 3 * Math.sin(p.x), T.smoke, "#ff9a3c", .85, !0, p.x), spr(p.x, p.y, z, 4, T.glow, "#fff0a0", .8, !0);
    else if ("missile" === p.kind || "rocket" === p.kind || "aamissile" === p.kind) spr(p.x - 5 * c, p.y - 5 * s, z, 5.5 + Math.random(), T.glow, "#ffb050", 1, !0), light(p.x, p.y, z, "#ff9040", 1.4, 40);
  }
  // Muzzle flashes for everything else firing (the player's own gun has its viewmodel flash).
  for (const u of S.units) {
    if (u.dead || !(u.muzzle > 0) || u.inside || (u === FPS.u && !FPS.thirdPerson) || !near(u.x, u.y) || 2 !== visAt(u.x, u.y)) continue;
    const md = muzzleDist(u), ang = hasTurret(u.key) ? u.tang : u.ang, inf = "inf" === u.d.kind, mx = u.x + Math.cos(ang) * md, my = u.y + Math.sin(ang) * md, mz = gz(u.x, u.y) + (u.alt || 0) + (inf ? 12 : 15), k = u.muzzle / .09;
    spr(mx, my, mz, (inf ? 5 : 11) * (.6 + .6 * k), T.flash, "#fff0c0", Math.min(1, k * 1.3), !0, u.id * 1.7 + S.time * 30);
    light(mx, my, mz, "#ffc070", (inf ? 1.2 : 2.6) * k, inf ? 30 : 60);
  }
  for (const b of S.blds) {
    if (b.dead || !((b as any).muzzle > 0) || !near(b.x, b.y) || 2 !== visAt(b.x, b.y)) continue;
    const a = b.tang || 0, md = 12 * b.size + 10, mx = b.x + Math.cos(a) * md, my = b.y + Math.sin(a) * md, mz = gz(b.x, b.y) + 12 + 8 * b.size;
    spr(mx, my, mz, 12, T.flash, "#fff0c0", 1, !0, (b.id as any) + S.time * 30);
  }
  for (let k = si; k < F.spr.length; k++) F.spr[k].visible = !1;
  for (let k = bi; k < F.beam.length; k++) F.beam[k].visible = !1;
  for (let k = di; k < F.dec.length; k++) F.dec[k].visible = !1;
  for (let k = ei; k < F.deb.length; k++) F.deb[k].visible = !1;
  for (let k = li; k < F.lights.length; k++) F.lights[k].intensity = 0;
}
function fgFxInit() {
  const T = fgTextures(), F: any = { scene: GL.scene, T, spr: [], beam: [], dec: [], deb: [], lights: [] };
  for (let i = 0; i < 220; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: T.glow, transparent: !0, depthWrite: !1, fog: !0 }));
    s.visible = !1, s.frustumCulled = !1, s.renderOrder = 5, GL.scene.add(s), F.spr.push(s);
  }
  const bg = new THREE.PlaneGeometry(1, 1);
  for (let i = 0; i < 90; i++) {
    const b = new THREE.Mesh(bg, new THREE.MeshBasicMaterial({ map: T.beam, transparent: !0, depthWrite: !1, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: !0 }));
    b.matrixAutoUpdate = !1, b.visible = !1, b.frustumCulled = !1, b.renderOrder = 6, GL.scene.add(b), F.beam.push(b);
  }
  for (let i = 0; i < 120; i++) {
    const d = new THREE.Mesh(bg, new THREE.MeshBasicMaterial({ map: T.ring, transparent: !0, depthWrite: !1, fog: !0, polygonOffset: !0, polygonOffsetFactor: -2 }));
    d.visible = !1, d.frustumCulled = !1, d.renderOrder = 4, GL.scene.add(d), F.dec.push(d);
  }
  const dg = new THREE.BoxGeometry(2.4, 1.6, 2);
  for (let i = 0; i < 48; i++) {
    const o = new THREE.Mesh(dg, new THREE.MeshStandardMaterial({ color: "#555", roughness: .9 }));
    o.visible = !1, o.castShadow = !0, GL.scene.add(o), F.deb.push(o);
  }
  for (let i = 0; i < 3; i++) { const l = new THREE.PointLight(16753728, 0, 80, 2); GL.scene.add(l), F.lights.push(l); }
  return FG.fx = F;
}
function fx3dActive() { return !!(FPS.on && FPS.u && FG.fx); }


// ============================================================ HD PEOPLE
// Model coords for the part builders: x forward, y = right, z up (glMerge
// maps them to three's X, Z, Y). Every limb part is built along +z from its
// joint so it can be aimed bone-to-bone by the IK below.
const BK = ["metal", "matte", "glass", "emis", "concrete", "organic", "rubber", "foliage"];
const HD_LOOK: Record<string, any> = {
  gi: { helmet: "body", pack: "armor3", visor: "glass" }, guardian: { helmet: "body", pack: "armor3" },
  conscript: { hat: "bark", beret: "bark2", pack: "dark", visor: "glow" }, flak: { helmet: "armor3", pack: "steel", visor: "glow" },
  initiate: { hood: "carapace2", tank: "psi", visor: "psi" }, virus: { cloth: "carapace2", hood: "body", pack: "carapace", visor: "psi" },
  engineer: { cloth: "gold", helmet: "white", pack: "steel", visor: "glass" }, rogue: { cloth: "olive", beret: "olive" },
  desolator: { cloth: "green", helmet: "green", tank: "green", visor: "glow", mask: 1 }, chrono: { cloth: "armor", helmet: "steel", pack: "crystal", visor: "crystal" },
  tanya: { cloth: "armor2", beret: "red", visor: "red", hair: 1 }, reaper: { cloth: "rust", beret: "dark2", visor: "red" },
  phantom: { cloth: "carapace2", hood: "carapace", visor: "crystal" }, marksman: { cloth: "armor3", helmet: "olive", pack: "olive", visor: "glass" },
  vindicator: { cloth: "tesla", helmet: "steel", pack: "crystal", visor: "tesla" }, bombard: { cloth: "armor3", helmet: "armor3", pack: "red", visor: "glow" },
  leech: { cloth: "carapace2", hood: "carapace", tank: "crystal", visor: "crystal" }, brute: { cloth: "carapace", hood: "body", visor: "psi", scale: 1.3 },
  piercer: { cloth: "carapace2", hood: "carapace", visor: "psi" },
};
const GLOWS: Record<string, 1> = { glow: 1, psi: 1, crystal: 1, tesla: 1, red: 1, lightY: 1 };
function hdFac(u: any) { return (S.players[u.owner] && S.players[u.owner].fac) || INF_FAC[u.key] || "allied"; }
function hdLook(u: any) {
  const fac = hdFac(u), L = Object.assign({ cloth: "body", gear: "dark" }, HD_LOOK[u.key] || { helmet: "armor3", pack: "dark" });
  L.fac = "neutral" === fac ? "allied" : fac, L.vest = L.vest || ("soviet" === L.fac ? "olive" : "yuri" === L.fac ? "carapace2" : "armor3");
  L.pants = L.pants || L.gear;
  return L;
}
// Weapon type a unit carries, derived from its first-person weapon kind.
function hdWeaponType(kind: string) {
  return "sniper" === kind ? "long" : "flak" === kind ? "flak" : "flame" === kind ? "flamer" : "rocket" === kind ? "rocket" : "missile" === kind ? "launcher"
    : "tool" === kind ? "tool" : "melee" === kind ? "none" : "pistol" === kind ? "pistol"
    : /^beam|prism|tesla|psi/.test(kind) ? "beam" : "rifle";
}
function hdBeamCol(kind: string) { return "beam_temporal" === kind || "tesla" === kind ? "tesla" : "beam_drain" === kind || "psi" === kind ? "psi" : "crystal"; }

// Plain 12-triangle box (base-anchored like BOXM) for the low-detail figures.
function fgPlainBox(w: number, d: number, h: number) {
  return meshOf("PB" + w.toFixed(2) + "_" + d.toFixed(2) + "_" + h.toFixed(2), () => {
    const x = w / 2, y = d / 2, T: any[] = [], q = (a: number[], b: number[], c: number[], e: number[], n: number[]) => { T.push({ p: [a, b, c], n: [n, n, n] }, { p: [a, c, e], n: [n, n, n] }); };
    q([x, -y, 0], [x, y, 0], [x, y, h], [x, -y, h], [1, 0, 0]), q([-x, y, 0], [-x, -y, 0], [-x, -y, h], [-x, y, h], [-1, 0, 0]);
    q([x, y, 0], [-x, y, 0], [-x, y, h], [x, y, h], [0, 1, 0]), q([-x, -y, 0], [x, -y, 0], [x, -y, h], [-x, -y, h], [0, -1, 0]);
    q([x, -y, h], [x, y, h], [-x, y, h], [-x, -y, h], [0, 0, 1]), q([x, y, 0], [x, -y, 0], [-x, -y, 0], [-x, y, 0], [0, 0, -1]);
    return T;
  });
}
const B_ = (a: any[], x: number, y: number, z: number, w: number, d: number, h: number, c: string, o?: any) => {
  if (!FG.lod) return a.push(P_(BOXM(w, d, h, Math.min(w, d, h) * .22), x, y, z, c, o));
  Math.max(w, d, h) >= .5 && a.push(P_(fgPlainBox(w, d, h), x, y, z, c, o));
};
const XC = (a: any[], x: number, y: number, z: number, r: number, l: number, c: string, n?: number, o?: any) => a.push(P_(CYL(r, l, n || 16), x, y, z, c, Object.assign({ ty: PI2 }, o || {})));

// Full ellipsoid (ell() alone is the upper half-dome).
function ellF(a: any[], x: number, y: number, z: number, rx: number, ry: number, rz: number, c: string, o?: any) { ell(a, x, y, z, rx, ry, rz, c, o), ell(a, x, y, z, rx, ry, rz, c, Object.assign({ tx: Math.PI }, o || {})); }
function hdPelvis(a: any[], L: any) {
  ell(a, 0, 0, -.25, 1.22, 1.72, 1.3, L.pants);
  a.push(P_(CYL(1.7, .5, 22), 0, 0, .45, "dark2")), B_(a, 1.62, 0, .47, .22, .62, .46, "steel");
  for (const y of [-1.15, 1.15]) B_(a, 1.28, y, -.35, .62, .72, .85, L.gear);
  for (const y of [-1.72, 1.72]) B_(a, .1, y, -.6, .9, .34, 1.1, L.gear);
  B_(a, -1.45, 0, -.35, .7, 1.7, .95, L.gear);
  "soviet" === L.fac && a.push(P_(CONE(1.95, 1.62, 2.4, 20), 0, 0, -2.3, L.cloth));
}
function hdTorso(a: any[], L: any) {
  ell(a, 0, 0, 1.7, 1.22, 1.58, 1.9, L.cloth), ell(a, 0, 0, 4.1, 1.5, 2.15, 2.35, L.cloth), ell(a, -.1, 0, 5.6, 1.12, 2.42, 1.0, L.cloth);
  if ("yuri" === L.fac) {
    for (let k = 0; k < 4; k++) ell(a, .75, 0, 2.1 + k * .95, .6, 1.5 - .12 * Math.abs(k - 1.5), .42, "carapace2");
    for (const y of [-.7, .7]) B_(a, 1.28, y, 1.8, .12, .12, 3.6, "psi", { e: 1 });
    for (let k = 0; k < 5; k++) a.push(P_(CONE(.28, .05, .9, 8), -1.3, 0, 2 + k * .85, "bone", { ty: -1.2 }));
    ell(a, -1.1, 0, 3.6, .55, 1.3, 2.4, "carapace");
  } else {
    B_(a, 1.02, 0, 2.2, .72, 3.2, 3.55, L.vest), B_(a, -1.18, 0, 2.1, .72, 3.2, 3.75, L.vest);
    a.push(P_(CYL(1.6, 1.25, 22), 0, 0, 1.75, L.vest, { sx: .98 }));
    for (const y of [-1.2, 1.2]) B_(a, -.05, y, 5.75, 2.55, .52, .34, L.vest);
    for (let k = -1; k <= 1; k++) B_(a, 1.5, .78 * k, 2.35, .52, .72, 1.2, L.gear), B_(a, 1.52, .78 * k, 3.5, .56, .76, .18, L.gear);
    B_(a, 1.48, -1.3, 4.1, .38, .55, 1.0, "dark2"), a.push(P_(CYL(.05, 2.6, 6), -1.6, -1.1, 5.4, "dark2"));
    "soviet" === L.fac ? (() => { for (let k = -3; k <= 3; k++) B_(a, 1.6, .5 * k, 3.4 - .38 * k, .3, .28, .5, "gold", { r: .6 }); })()
      : (B_(a, 1.4, .95, 4.35, .08, .7, .45, "trim", { e: 1 }), B_(a, 1.4, -.35, 4.5, .08, .5, .3, "tesla", { e: 1 }));
  }
  a.push(P_(CYL(.92, .7, 18), 0, 0, 6.0, L.cloth));
  if (L.pack) {
    B_(a, -2.05, 0, 2.0, 1.45, 2.85, 3.3, L.pack), B_(a, -2.85, 0, 2.3, .3, 2.2, 2.4, L.gear);
    a.push(P_(CYL(.55, 2.8, 14), -2.1, -1.4, 5.55, "yuri" === L.fac ? "carapace" : "olive", { tx: PI2 }));
    for (const y of [-1.6, 1.6]) B_(a, -1.9, y, 2.2, 1.0, .5, 1.8, L.gear);
  }
  if (L.tank) for (const y of [-.95, .95]) a.push(P_(CYL(.82, 4.1, 18), -2.25, y, 1.2, L.tank)), a.push(P_(DOME(.82, .6, 18), -2.25, y, 5.3, "steel")), a.push(P_(CYL(.3, .35, 10), -2.25, y, 5.85, "darkmetal"));
}
function hdHead(a: any[], L: any) {
  a.push(P_(CYL(.55, 1.5, 16), 0, 0, 0, "skin"));
  ellF(a, .1, 0, 1.95, 1.02, .9, 1.12, "skin"), ellF(a, .42, 0, 1.45, .74, .76, .5, "skin"), ellF(a, 1.02, 0, 1.78, .2, .15, .28, "skin");
  for (const y of [-.36, .36]) ell(a, .96, y, 2.02, .1, .13, .09, "black"), B_(a, .98, y, 2.15, .18, .36, .1, "dark2");
  for (const y of [-.9, .9]) ellF(a, .05, y, 1.85, .18, .14, .3, "skin");
  const vg = GLOWS[L.visor] ? { e: 1 } : {};
  if (L.hood) {
    a.push(P_(CONE(1.5, .3, 2.9, 20), -.15, 0, 1.25, L.hood)), ell(a, -.35, 0, 2.2, 1.25, 1.3, 1.4, L.hood);
    ell(a, .72, 0, 1.45, .45, .8, .75, "dark2");
    for (const y of [-.34, .34]) B_(a, 1.02, y, 1.9, .12, .3, .1, L.visor || "psi", { e: 1 });
  } else if (L.hat) {
    ell(a, 0, 0, 2.55, 1.35, 1.28, .95, L.hat);
    for (const y of [-1.18, 1.18]) B_(a, -.1, y, 1.2, .9, .22, 1.3, L.hat);
    B_(a, 1.24, 0, 2.5, .12, .5, .5, "red", { e: 1 });
  } else if (L.helmet) {
    a.push(P_(DOME(1.33, 1.2, 22), -.05, 0, 2.05, L.helmet));
    if ("soviet" === L.fac) a.push(P_(CONE(1.55, 1.33, .28, 22), -.05, 0, 1.85, L.helmet)), B_(a, 1.25, 0, 2.6, .1, .45, .45, "red", { e: 1 });
    else {
      for (const y of [-1.27, 1.27]) B_(a, -.1, y, 2.15, 1.3, .12, .32, "dark2");
      B_(a, 1.15, 0, 2.85, .4, .55, .45, "dark2");
      if (L.visor) { B_(a, .2, 0, 2.7, 2.3, 2.7, .2, "dark2"); for (const y of [-.4, .4]) a.push(P_(CYL(.27, .22, 14), 1.02, y, 2.75, L.visor, Object.assign({ ty: PI2 }, vg))); }
    }
  }
  if (L.beret && !L.hat) { ell(a, .05, .25, 2.75, 1.12, 1.08, .4, L.beret, { tx: .25 }), B_(a, 1.0, -.45, 2.8, .1, .28, .28, "gold"); }
  L.hair && ell(a, -.8, 0, 1.6, .6, .5, 1.2, "bark");
  L.mask && (ell(a, .9, 0, 1.45, .35, .6, .45, "dark2"), a.push(P_(CYL(.3, .5, 12), 1.2, -.4, 1.2, "steel", { ty: PI2 })));
}
function hdUpperArm(a: any[], L: any) {
  ellF(a, 0, 0, .25, .95, .95, .95, L.cloth), a.push(P_(CONE(.8, .64, 3.0, 16), 0, 0, .25, L.cloth));
  "yuri" !== L.fac && ell(a, 0, 0, .3, 1.02, 1.05, .8, L.vest);
  ellF(a, 0, 0, 3.2, .62, .62, .55, L.cloth);
}
function hdForeArm(a: any[], L: any) {
  a.push(P_(CONE(.64, .5, 2.45, 16), 0, 0, 0, "soviet" === L.fac ? L.cloth : L.cloth)), a.push(P_(CYL(.56, .5, 14), 0, 0, 2.3, L.gear));
  ellF(a, .02, 0, 3.1, .44, .52, .5, "dark2"), ellF(a, .3, 0, 3.45, .36, .46, .38, "dark2"), ellF(a, -.15, .34, 3.0, .17, .17, .36, "dark2");
  B_(a, .38, 0, 3.12, .14, .62, .3, "rubber");
}
function hdThigh(a: any[], L: any) {
  ellF(a, 0, 0, .4, 1.0, 1.0, 1.0, L.pants), a.push(P_(CONE(1.02, .76, 4.3, 16), 0, 0, .3, L.pants));
  for (const y of [-.92, .92]) B_(a, 0, y, 1.6, .85, .3, 1.2, L.pants);
  ellF(a, .6, 0, 4.4, .36, .62, .55, "dark2");
}
function hdShin(a: any[], L: any) {
  ellF(a, 0, 0, .1, .78, .78, .6, L.pants), a.push(P_(CONE(.78, .6, 3.5, 16), 0, 0, 0, L.pants));
  a.push(P_(CONE(.66, .62, 1.55, 16), 0, 0, 3.0, "dark2")), B_(a, .6, 0, 3.2, .1, .3, 1.1, "black");
}
function hdFoot(a: any[]) {
  ell(a, .5, 0, -.35, 1.15, .6, .5, "dark2"), ell(a, 1.3, 0, -.55, .5, .56, .36, "dark2"), B_(a, .45, 0, -.95, 2.3, 1.15, .32, "rubber");
}
function hdFist(a: any[]) { ell(a, 0, 0, 0, .55, .55, .6, "dark2"), ell(a, .3, 0, .2, .4, .5, .45, "dark2"); }

// Weapons, x forward from the pistol grip. rg/lg are the hand points.
function hdWeapon(type: string, fac: string, beamCol?: string) {
  const W: any = { body: [], mag: [], bolt: [], muzzle: [6.5, 0, .25], eject: [.9, .35, .45], rg: [-.25, 0, -.55], lg: [3.6, 0, -.15], sight: 1.05, butt: [-3.6, 0, .1] };
  const a = W.body, m = W.mag, bo = W.bolt, F = "soviet" === fac ? "wood" : "yuri" === fac ? "carapace2" : "armor3", M = "gunmetal", D = "darkmetal", G = "yuri" === fac ? "psi" : "soviet" === fac ? "red" : "tesla";
  const grip = (x: number) => B_(a, x, 0, -1.45, .52, .5, 1.25, F, { ty: .28 });
  const stock = () => {
    if ("soviet" === fac) B_(a, -2.3, 0, -.75, 2.5, .5, 1.1, "wood", { ty: -.14 }), B_(a, -3.55, 0, -1.0, .15, .55, 1.35, "rubber", { ty: -.14 });
    else if ("yuri" === fac) ellF(a, -1.9, 0, .05, 1.45, .34, .5, "bone"), ell(a, -1.8, 0, .3, .9, .2, .3, "carapace");
    else XC(a, -.4, 0, .25, .22, 2.9, M, 10, { ty: -PI2 }), B_(a, -3.0, 0, -.5, 1.2, .52, 1.3, F), B_(a, -3.65, 0, -.55, .15, .56, 1.42, "rubber"), B_(a, -2.6, 0, .55, 1.1, .4, .28, F);
  };
  const trig = () => { B_(a, .25, 0, -.66, .9, .12, .1, M), B_(a, .3, 0, -.58, .08, .08, .3, M); };
  if ("rifle" === type || "long" === type) {
    const lg = "long" === type, bl = lg ? 3.4 : 1.5;
    B_(a, .6, 0, -.35, 3.4, .6, .7, M), B_(a, .9, 0, .35, 3.9, .56, .42, D), B_(a, 1.0, 0, .77, 3.6, .36, .14, M);
    for (let k = 0; k < 11; k++) B_(a, -.6 + .33 * k, 0, .9, .12, .38, .08, M);
    XC(a, 2.6, 0, .25, .4, lg ? 3.4 : 2.9, F, 8);
    for (let k = 0; k < 5; k++) for (const y of [-.37, .37]) B_(a, 3.0 + .5 * k, y, .2, .22, .06, .3, D);
    const bx = lg ? 6.0 : 5.5;
    XC(a, bx, 0, .25, .13, bl, M, 12), B_(a, 4.9, 0, .52, .35, .3, .28, M);
    XC(a, bx + bl, 0, .25, .21, .75, D, 12), B_(a, bx + bl + .3, 0, .38, .1, .44, .08, "black");
    W.muzzle = [bx + bl + .8, 0, .25], W.lg = [lg ? 4.0 : 3.6, 0, -.15];
    B_(a, 1.25, 0, -.55, .85, .66, .3, M), grip(-.35), trig(), stock();
    if ("soviet" === fac && !lg) B_(m, 1.25, 0, -1.3, .72, .5, 1.0, D, { ty: .1 }), B_(m, 1.5, 0, -2.2, .72, .5, 1.0, D, { ty: .38 });
    else if ("yuri" === fac) ell(m, 1.2, 0, -1.3, .5, .4, .95, "carapace"), B_(m, 1.2, 0, -2.0, .1, .42, 1.2, "psi", { e: 1 });
    else B_(m, 1.25, 0, lg ? -1.4 : -1.9, .72, .5, lg ? 1.1 : 1.6, D, { ty: -.12 });
    if (lg) {
      XC(a, -.9, 0, 1.35, .36, 3.2, D, 16), XC(a, 2.1, 0, 1.35, .48, .7, D, 16), XC(a, -1.5, 0, 1.35, .42, .6, D, 16);
      a.push(P_(CYL(.4, .06, 16), 2.8, 0, 1.35, "glassdark", { ty: PI2, e: 1 })), a.push(P_(CYL(.3, .25, 10), .4, 0, 1.7, D)), a.push(P_(CYL(.3, .25, 10), .4, .38, 1.35, D, { tx: PI2 }));
      B_(a, .4, 0, .9, .9, .4, .3, M);
      for (const y of [-.2, .2]) XC(a, 4.0, y, -.15, .07, 2.2, D, 6);
      XC(bo, .15, .2, .45, .09, .7, M, 8, { ty: 0, tx: -PI2 }), bo.push(P_(DOME(.22, .22, 10), .15, .95, .35, M));
      W.sight = 1.35;
    } else if ("allied" === fac) {
      B_(a, .6, 0, .91, .9, .5, .2, D), XC(a, .2, 0, 1.3, .34, .9, D, 16), a.push(P_(CYL(.28, .05, 14), 1.12, 0, 1.3, "tesla", { ty: PI2, e: 1 }));
      W.sight = 1.3;
    } else if ("yuri" === fac) { ell(a, .5, 0, .95, .55, .18, .3, "psi", { e: 1 }), W.sight = 1.15; }
    else { B_(a, -.6, 0, .91, .3, .34, .32, M), W.sight = 1.1; }
    lg || B_(bo, .7, .36, .45, .55, .2, .2, M);
    "yuri" === fac && (B_(a, 2.0, .41, .3, 2.2, .04, .1, "psi", { e: 1 }), B_(a, 2.0, -.41, .3, 2.2, .04, .1, "psi", { e: 1 }));
  } else if ("flak" === type) {
    B_(a, .9, 0, -.45, 4.6, 1.25, 1.25, D), B_(a, .9, 0, .8, 3.8, .9, .2, M);
    for (const y of [-.33, .33]) XC(a, 3.2, y, .35, .28, 4.6, M, 12), XC(a, 7.6, y, .35, .36, .6, D, 12);
    B_(a, 3.4, 0, -1.5, .45, .45, 1.2, F), grip(-.3), trig(), stock();
    m.push(P_(CYL(1.0, .95, 20), 1.4, .48, -1.35, D, { tx: PI2 })), m.push(P_(CYL(.35, 1.0, 10), 1.4, .5, -1.35, M, { tx: PI2 }));
    B_(a, .2, 0, 1.0, .12, .7, .7, M), B_(a, 2.4, 0, 1.0, .12, .12, .5, M);
    W.muzzle = [8.3, 0, .35], W.lg = [3.4, 0, -1.0], W.sight = 1.5, W.eject = [1.2, .6, .2];
  } else if ("rocket" === type || "launcher" === type) {
    const big = "rocket" === type, R = big ? .62 : .5, Lt = big ? 7.4 : 6.0;
    XC(a, -2.4, 0, 0, R, Lt, "yuri" === fac ? "carapace2" : "soviet" === fac ? "olive" : "armor3", 18);
    a.push(P_(CONE(R, R * 1.3, .7, 18), Lt - 2.4, 0, 0, D, { ty: PI2 })), a.push(P_(CONE(R * 1.35, R, .9, 18), -3.3, 0, 0, D, { ty: PI2 }));
    for (const x of [-1.2, 1.4, 3.6]) XC(a, x, 0, 0, R + .06, .22, D, 18);
    B_(a, .9, -R - .35, -.1, 1.0, .35, .9, D), a.push(P_(CYL(.2, .12, 10), 1.45, -R - .35, .35, G, { ty: PI2, e: 1 }));
    B_(a, -.2, 0, -1.95, .5, .5, 1.35, F, { ty: .2 }), B_(a, 2.0, 0, -1.7, .45, .45, 1.1, F), trig();
    a.push(P_(CONE(R * .88, .14, 1.5, 16), Lt - 2.2, 0, 0, "yuri" === fac ? "psi" : "olive", { ty: PI2 })), m.push(P_(CYL(R * .85, .6, 16), Lt - 2.8, 0, 0, "armor", { ty: PI2 }));
    W.muzzle = [Lt - .6, 0, 0], W.rg = [-.1, 0, -1.2], W.lg = [2.0, 0, -1.0], W.sight = .45, W.sightY = -R - .35, W.butt = [-.8, 0, 0];
  } else if ("flamer" === type) {
    XC(a, -.6, 0, .2, .45, 3.8, M, 16), a.push(P_(CONE(.42, .22, 1.4, 16), 3.2, 0, .2, D, { ty: PI2 })), XC(a, 4.6, 0, .2, .2, .3, "black", 12);
    for (let k = 0; k < 4; k++) XC(a, .2 + .7 * k, 0, .2, .5, .12, D, 16);
    a.push(P_(DOME(.14, .14, 10), 4.6, 0, -.15, "tesla", { e: 1 })), B_(a, 4.4, 0, -.25, .3, .2, .2, M);
    m.push(P_(CYL(.55, 1.9, 16), -.1, 0, -1.25, "yuri" === fac ? "psi" : "soviet" === fac ? "green" : "rust", { ty: PI2 }));
    XC(a, -1.2, 0, -.6, .18, 2.6, "rubber", 10, { ty: PI2 + .9 });
    grip(-.3), trig(), B_(a, 2.4, 0, -1.2, .42, .42, 1.1, F), stock();
    W.muzzle = [4.9, 0, .2], W.lg = [2.4, 0, -.9], W.sight = .95;
  } else if ("beam" === type) {
    const C = beamCol || "tesla";
    B_(a, .9, 0, -.35, 3.6, .8, .95, D), B_(a, .9, 0, .6, 3.2, .5, .25, M);
    XC(a, 2.4, 0, .15, .2, 2.8, M, 12);
    for (let k = 0; k < 4; k++) XC(a, 2.6 + .55 * k, 0, .15, .55 - .06 * k, .22, k % 2 ? D : C, 18, k % 2 ? {} : { e: 1 });
    ell(a, 5.15, 0, .15, .5, .32, .32, C, { e: 1 }), B_(a, 1.0, .42, .1, 2.6, .05, .12, C, { e: 1 }), B_(a, 1.0, -.42, .1, 2.6, .05, .12, C, { e: 1 });
    grip(-.35), trig(), stock(), B_(m, -.9, 0, -1.4, .8, .5, 1.0, C, { e: 1 });
    W.muzzle = [5.6, 0, .15], W.lg = [2.8, 0, -.3], W.sight = 1.0;
  } else if ("tool" === type) {
    B_(a, -.1, 0, -1.3, .5, .5, 1.4, "wood"), XC(a, -.3, 0, .1, .38, 2.6, "gold", 14), a.push(P_(CONE(.38, .12, .9, 14), 2.3, 0, .1, D, { ty: PI2 }));
    a.push(P_(DOME(.18, .18, 12), 3.2, 0, .02, "tesla", { e: 1 })), B_(a, .6, 0, .5, 1.2, .3, .3, "darkmetal");
    W.muzzle = [3.4, 0, .1], W.lg = null, W.sight = .9;
  } else if ("pistol" === type) {
    B_(a, .9, 0, -.1, 2.4, .42, .5, M), B_(bo, .9, 0, .35, 2.5, .44, .35, D), grip(-.1), trig(), B_(m, -.1, 0, -1.9, .4, .38, .4, D);
    W.muzzle = [2.3, 0, .15], W.lg = null, W.sight = .8;
  } else W.none = 1, W.lg = null;
  return W;
}

function hdGeo(key: string, pal: any, build: (a: any[]) => void) {
  let g = FG.figGeo.get(key);
  if (g) return g;
  const a: any[] = [];
  build(a);
  for (const p of a) p && (p.z = (p.z || 0) + 16);
  g = glMerge(a, pal);
  for (const k of BK) g[k] && g[k].translate(0, -16, 0);
  FG.figGeo.set(key, g);
  return g;
}
// World figures collapse the material buckets into metal / matte / emissive
// meshes (one draw call each) — a squad of them stays cheap.
const HD_GROUP: Record<string, string> = { metal: "metal", glass: "metal", emis: "emis", matte: "matte", concrete: "matte", organic: "matte", rubber: "matte", foliage: "matte" };
function fgMergeGeos(list: any[]) {
  if (1 === list.length) return list[0];
  const out = new THREE.BufferGeometry();
  for (const name of ["position", "normal", "color", "uv"]) {
    let n = 0; for (const g of list) n += g.attributes[name].array.length;
    const arr = new Float32Array(n), sz = list[0].attributes[name].itemSize; let o = 0;
    for (const g of list) arr.set(g.attributes[name].array, o), o += g.attributes[name].array.length;
    out.setAttribute(name, new THREE.BufferAttribute(arr, sz));
  }
  return out.computeBoundingSphere(), out;
}
function hdObj(g: any, mats: any, shadow: boolean) {
  const o = new THREE.Group();
  if (!g._grp) { const by: any = {}; for (const k of BK) g[k] && (by[HD_GROUP[k]] = by[HD_GROUP[k]] || []).push(g[k]); g._grp = {}; for (const k in by) g._grp[k] = fgMergeGeos(by[k]); }
  for (const k in g._grp) { const m = new THREE.Mesh(g._grp[k], mats[k] || mats.metal); m.userData.shared = 1, m.castShadow = shadow && "emis" !== k, m.receiveShadow = shadow && "emis" !== k, o.add(m); }
  return o;
}

// Aim a limb part (built along +Y) from joint p to joint q, with its local +X
// turned toward `hint`.
const _v1 = new THREE.Vector3(), _v2 = new THREE.Vector3(), _v3 = new THREE.Vector3(), _m4 = new THREE.Matrix4();
function hdOrient(o: any, p: any, q: any, hint: any) {
  _v2.subVectors(q, p).normalize();
  _v1.copy(hint).addScaledVector(_v2, -hint.dot(_v2));
  _v1.lengthSq() < 1e-6 && _v1.set(0, 0, 1).addScaledVector(_v2, -_v2.z);
  _v1.normalize(), _v3.crossVectors(_v1, _v2);
  _m4.makeBasis(_v1, _v2, _v3), o.quaternion.setFromRotationMatrix(_m4), o.position.copy(p);
}
// Two-bone IK: joint position for bones a, b from root s to target t, bending toward pole.
function hdIK(s: any, t: any, a: number, b: number, pole: any, out: any) {
  const d = _v1.subVectors(t, s), L = Math.min(a + b - .001, Math.max(.01, d.length()));
  d.normalize();
  const ca = Math.max(-1, Math.min(1, (a * a + L * L - b * b) / (2 * a * L))), sa = Math.sqrt(1 - ca * ca);
  _v2.copy(pole).addScaledVector(d, -pole.dot(d)).normalize();
  return out.copy(s).addScaledVector(d, a * ca).addScaledVector(_v2, a * sa);
}

const HD = { hip: 9.85, hipW: 1.3, th: 4.6, sh: 4.5, ank: .95, ua: 3.2, fa: 3.05, shY: 5.35, shW: 2.45, neck: 6.45 };
function hdBuildFigure(u: any, parent?: any, lod?: boolean) {
  const L = hdLook(u), pal = palette(u.owner), kind = unitViewmodelKind(u), wt = hdWeaponType(kind), look = (lod ? "LOD|" : "") + u.key + "|" + u.owner + "|";
  const cloth = Object.assign({}, GL.mats, { metal: GL.mats.matte });
  const LG = (key: string, f: (a: any[]) => void) => hdGeo(key, pal, lod ? (a: any[]) => { FG.lod = 1; try { lowPoly(f)(a); } finally { FG.lod = 0; } } : f);
  const G = (n: string, f: (a: any[]) => void) => hdObj(LG(look + n, f), cloth, !0);
  const root = new THREE.Group(), F: any = { root, u, wt, kind, parts: {} };
  const add = (n: string, o: any) => (root.add(o), F.parts[n] = o, o);
  add("pelvis", G("pelvis", a => hdPelvis(a, L))), add("torso", G("torso", a => hdTorso(a, L))), add("head", G("head", a => hdHead(a, L)));
  for (const s of ["L", "R"]) add("ua" + s, G("ua", a => hdUpperArm(a, L))), add("fa" + s, G("fa", a => hdForeArm(a, L))), add("th" + s, G("th", a => hdThigh(a, L))), add("sh" + s, G("sh", a => hdShin(a, L))), add("ft" + s, G("ft", hdFoot));
  const W = lod ? (() => { FG.lod = 1; try { return lowPoly(hdWeapon)(wt, L.fac, hdBeamCol(kind)); } finally { FG.lod = 0; } })() : hdWeapon(wt, L.fac, hdBeamCol(kind));
  F.W = W;
  if (!W.none) add("gun", hdObj(LG(look + "gun" + wt + kind, a => { for (const q of W.body.concat(W.mag, W.bolt)) a.push(q); }), GL.mats, !0));
  L.scale && root.scale.setScalar(L.scale);
  root.traverse((o: any) => { o.frustumCulled = !1; });
  if (lod) return F;
  (parent || GL.scene).add(root);
  F.st = { mv: 0, aim: 0, ph: 0, lx: u.x, ly: u.y, spd: 0, dead: 0, crouch: 0 };
  return F;
}

const _S = new THREE.Vector3(), _T = new THREE.Vector3(), _J = new THREE.Vector3(), _P = new THREE.Vector3(), _H = new THREE.Vector3(), _Q = new THREE.Quaternion(), _E = new THREE.Euler(), _M2 = new THREE.Matrix4(), _FWD = new THREE.Vector3(1, 0, 0);
function hdPose(F: any, dt: number) {
  const u = F.u, st = F.st, P = F.parts, W = F.W, own = u === FPS.u;
  const moved = Math.hypot(u.x - st.lx, u.y - st.ly);
  st.lx = u.x, st.ly = u.y, st.spd += ((dt > 0 ? moved / dt : 0) - st.spd) * Math.min(1, 6 * dt);
  const moving = !u.dead && (u.moving || st.spd > 4), tgt = u.target && !u.target.dead ? u.target : null;
  const aiming = !u.dead && (own ? !!(FPS.aiming || FPS.firing) : !!tgt && !moving || u.muzzle > 0);
  st.mv += ((moving ? 1 : 0) - st.mv) * Math.min(1, 7 * dt), st.aim += ((aiming ? 1 : 0) - st.aim) * Math.min(1, 9 * dt);
  const crouchT = own && FPS.crouching || u.deployed ? 1 : 0;
  st.crouch += (crouchT - st.crouch) * Math.min(1, 8 * dt);
  const run = Math.min(1, st.spd / 70), ph = st.ph = (u.animT || 0) * 6.283 / (30 + 10 * run), A = (2.6 + 1.6 * run) * st.mv, lift = (1.3 + .8 * run) * st.mv;
  const t = S.time + .37 * (u.id || 0), breath = Math.sin(t * 1.7) * .06;
  const hipY = HD.hip - .28 * st.mv * (1 - Math.cos(2 * ph)) / 2 - 2.8 * st.crouch + (u.hitT > 0 ? -.3 : 0);
  // death: topple back about the feet, then sink
  if (u.dead) {
    st.dead += dt;
    const k = Math.min(1, st.dead / .75), e = k * k * (3 - 2 * k);
    F.root.rotation.z = 1.45 * e;
    F.deathSink = st.dead > 2.6 ? (st.dead - 2.6) * 2.5 : 0;
  }
  const lean = .05 + .16 * run * st.mv - .03 * st.aim + .18 * st.crouch;
  // pitch toward target / look pitch
  let aimP = 0, aimY = 0;
  if (own) aimP = FPS.pitch; else if (tgt) { const d = Math.hypot(tgt.x - u.x, tgt.y - u.y) || 1; aimP = Math.atan2(heightAt(tgt.x, tgt.y) + (tgt.alt || 0) - heightAt(u.x, u.y) - (u.alt || 0), d) * .8; aimY = Math.max(-.6, Math.min(.6, angDiff(u.ang, Math.atan2(tgt.y - u.y, tgt.x - u.x)))); }
  const pel = P.pelvis;
  pel.position.set(0, hipY, 0), pel.rotation.set(0, -aimY * .3 + .12 * Math.sin(ph) * st.mv, 0);
  const tor = P.torso;
  tor.position.set(0, hipY, 0), _E.set(0, -aimY * .6 - .25 * st.aim * 0 - .1 * Math.sin(ph) * st.mv, -lean + breath * .1, "YXZ"), tor.quaternion.setFromEuler(_E);
  const kick = u.muzzle > 0 ? u.muzzle / .09 : 0;
  // torso-space helper
  const TP = (x: number, y: number, z: number, out: any) => out.set(x, y, z).applyQuaternion(tor.quaternion).add(tor.position);
  TP(0, HD.neck, 0, P.head.position), _E.set(0, -aimY * .4, Math.max(-.5, Math.min(.5, aimP * .8)) + lean * .6, "YXZ"), P.head.quaternion.setFromEuler(_E);
  // legs
  for (const side of [-1, 1]) {
    const sp = side > 0 ? ph : ph + Math.PI, hip = TP(0, 0, 0, _S);
    hip.set(0, hipY - .6, side * HD.hipW);
    const fx = A * Math.sin(sp) + 1.2 * st.crouch * (side > 0 ? 1 : -.4), fl = lift * Math.max(0, Math.cos(sp));
    const foot = _T.set(fx + .3, HD.ank + fl, side * (HD.hipW + .15));
    const knee = hdIK(hip, foot, HD.th, HD.sh, _P.set(1, 0, side * .12), _J);
    hdOrient(P["th" + (side > 0 ? "R" : "L")], hip, knee, _FWD), hdOrient(P["sh" + (side > 0 ? "R" : "L")], knee, foot, _FWD);
    const ft = P["ft" + (side > 0 ? "R" : "L")];
    ft.position.copy(foot), ft.rotation.set(0, 0, fl > .1 ? -.35 * Math.max(0, Math.sin(sp)) + .25 * Math.max(0, -Math.sin(sp)) : 0);
  }
  // weapon pose in figure space: blend low-ready → shouldered aim
  const gun = P.gun, a = st.aim;
  const shR = TP(0, HD.shY, HD.shW, new THREE.Vector3()), shL = TP(0, HD.shY, -HD.shW, new THREE.Vector3());
  if (gun) {
    const heavy = "rocket" === F.wt || "launcher" === F.wt;
    const gx = (heavy ? .9 : 2.1) - .35 * kick * a, gy = heavy ? hipY + HD.shY + .9 : hipY + HD.shY - .6 + .2 * a, gz = heavy ? HD.shW - .2 : 1.05;
    const lx = 2.0, ly = hipY + 2.9, lz = .9;
    const bob = .18 * Math.sin(2 * ph) * st.mv;
    gun.position.set(lx + (gx - lx) * a, ly + (gy - ly) * a + bob, lz + (gz - lz) * a);
    const yawLow = -.55, pitchLow = -.5 + .15 * st.mv;
    _E.set(0, (-aimY) * a + yawLow * (1 - a), (aimP + .06 * kick) * a + pitchLow * (1 - a), "YXZ"), gun.quaternion.setFromEuler(_E);
    heavy && a < .5 && (gun.position.y = hipY + HD.shY + .9 - .4 * (1 - a), _E.set(0, -aimY * .5, -.15 * (1 - a) + aimP * a, "YXZ"), gun.quaternion.setFromEuler(_E));
  }
  // arms: IK hands onto the weapon grips (or swing when unarmed)
  const hand = (side: number, target: any) => {
    const sh = side > 0 ? shR : shL, n = side > 0 ? "R" : "L";
    const el = hdIK(sh, target, HD.ua, HD.fa + .35, _P.set(-.4, -1, side * .8), new THREE.Vector3());
    hdOrient(P["ua" + n], sh, el, _H.set(0, 0, side)), hdOrient(P["fa" + n], el, target, _H.set(0, 0, side));
  };
  const gp = (v: number[]) => new THREE.Vector3(v[0], v[2], v[1]).applyQuaternion(gun.quaternion).add(gun.position);
  if (gun) hand(1, gp(W.rg)); else { const sw = .9 * Math.sin(ph) * st.mv; hand(1, TP(1.4 + sw * 2, HD.shY - 5.4, HD.shW + .5, new THREE.Vector3())); }
  if (gun && W.lg) hand(-1, gp(W.lg));
  else { const sw = -.9 * Math.sin(ph) * st.mv; hand(-1, TP(.9 + sw * 2 + (u.dead ? 3 : 0), HD.shY - 5.4 + (u.dead ? 6 : 0), -HD.shW - .5, new THREE.Vector3())); }
}

// Chooses the nearby infantry drawn as HD figures this frame and poses them.
function fpsHDSet() {
  const figs: Map<number, any> = FG.figs, now = performance.now() / 1000, dt = Math.min(.1, Math.max(0, now - (FG.hdT || now)));
  FG.hdT = now;
  if (!FPS.on || !FPS.u || !GL || QUALITY < 1) { for (const F of figs.values()) GL && GL.scene.remove(F.root); figs.clear(); return null; }
  const me = FPS.u, cand: any[] = [];
  for (const u of S.units) {
    if ("inf" !== u.d.kind || u.inside || u.d.fly || u.dead || u.attached) continue;
    if (u === me && !FPS.thirdPerson) continue;
    const d = Math.abs(u.x - me.x) + Math.abs(u.y - me.y);
    if (d > 900 || !seen(u)) continue;
    cand.push([d, u]);
  }
  cand.sort((a, b) => a[0] - b[0]);
  const want = new Set<any>(cand.slice(0, QUALITY >= 2 ? 16 : 8).map(c => c[1])), set = new Set<any>();
  for (const [id, F] of figs) {
    const keep = want.has(F.u) && F.kind === unitViewmodelKind(F.u);
    const dying = F.u.dead && F.st.dead < 3.6 && !F.u.inside;
    if (!keep && !dying) { GL.scene.remove(F.root), figs.delete(id); continue; }
  }
  for (const u of want) if (!figs.has(u.id)) figs.set(u.id, hdBuildFigure(u));
  for (const F of figs.values()) {
    const u = F.u;
    F.bs == null && (F.bs = F.root.scale.x);
    const k = fpsUnitScale(u); F.root.scale.setScalar(F.bs * k);
    F.root.position.set(u.x, unitGroundH(u) + (u.alt || 0) - (F.deathSink || 0) * k, u.y);
    F.root.rotation.y = -(u === me ? FPS.yaw : u.ang);
    try { hdPose(F, dt); } catch (e) { }
    u.dead || set.add(u);
  }
  return set;
}

// Strategy view: the same figures, posed into the RTS animation frames
// (walk cycle, aim, firing) at a lighter level of detail and baked into one
// geometry per unit type / owner / frame for the instanced renderer.
const _bakeM = new THREE.Matrix4();
function hdBakeGeo(u: any, frame: number) {
  const kind = unitViewmodelKind(u), key = "HB|" + u.key + "|" + u.owner + "|" + frame + "|" + kind;
  let g = GLGEO.get(key);
  if (g) return g;
  const fake: any = { key: u.key, owner: u.owner, id: 0, d: u.d, x: 0, y: 0, ang: 0, heroMode: u.heroMode, deployed: u.deployed, animT: 7.5 * (frame & 3), moving: !!(frame & 3) || 0 === (frame & 4) && 1 === (frame & 1), muzzle: frame & 8 ? .09 : 0, target: frame & 4 ? { dead: !1, x: 100, y: 0 } : null, hitT: 0 };
  fake.moving = !(frame & 4) && (frame & 3) > 0;
  const F = hdBuildFigure(fake, null, !0);
  F.st = { mv: fake.moving ? 1 : 0, aim: frame & 4 ? 1 : 0, ph: 0, lx: 0, ly: 0, spd: 0, dead: 0, crouch: u.deployed ? 1 : 0 };
  fake.target && (fake.target.alt = heightAt(0, 0) - heightAt(100, 0));
  const t0 = S.time; S.time = 0; try { hdPose(F, 10); } catch (e) { } S.time = t0;
  F.root.updateMatrixWorld(!0);
  const by: any = { metal: [], matte: [], emis: [] };
  for (const n in F.parts) F.parts[n].traverse((o: any) => {
    if (!o.isMesh) return;
    const bucket = o.material === GL.mats.emis ? "emis" : o.material === GL.mats.metal && "gun" === n ? "metal" : "matte";
    const cg = o.geometry.clone(); cg.applyMatrix4(_bakeM.copy(o.matrixWorld)), by[bucket].push(cg);
  });
  if (frame & 8 && F.parts.gun) {
    const fl = glMerge([P_(CONE(.9, .1, 3.4, 8), 0, 0, 0, "lightY", { e: 1, ty: PI2 })], {}).emis, W = F.W;
    fl && (fl.applyMatrix4(new THREE.Matrix4().makeTranslation(W.muzzle[0], W.muzzle[2], W.muzzle[1]).premultiply(F.parts.gun.matrixWorld)), by.emis.push(fl));
  }
  g = { anims: [] };
  for (const k in by) g[k] = by[k].length ? fgMergeGeos(by[k]) : null;
  for (const k in by) for (const x of by[k]) g[k] !== x && x.dispose();
  GLGEO.set(key, g);
  return g;
}
// Dev check: pose a figure and list parts not connected (via touching
// bounding boxes) back to the feet.
function hdFloatCheck(key: string, frame: number) {
  const d = UNITS[key], fake: any = { key, owner: 0, id: 0, d, x: 0, y: 0, ang: 0, animT: 7.5 * (frame & 3), moving: !(frame & 4) && (frame & 3) > 0, muzzle: frame & 8 ? .09 : 0, target: frame & 4 ? { dead: !1, x: 100, y: 0, alt: heightAt(0, 0) - heightAt(100, 0) } : null, hitT: 0 };
  const F = hdBuildFigure(fake, null, !0);
  F.st = { mv: fake.moving ? 1 : 0, aim: frame & 4 ? 1 : 0, ph: 0, lx: 0, ly: 0, spd: 0, dead: 0, crouch: 0 };
  hdPose(F, 10), F.root.updateMatrixWorld(!0);
  const names = Object.keys(F.parts), box: any = {}, tol = .35;
  for (const n of names) box[n] = new THREE.Box3().setFromObject(F.parts[n]).expandByScalar(tol);
  const ok = new Set(["ftL", "ftR"]), st = ["ftL", "ftR"];
  while (st.length) { const a = st.pop()!; for (const b of names) !ok.has(b) && box[a].intersectsBox(box[b]) && (ok.add(b), st.push(b)); }
  return names.filter(n => !ok.has(n));
}
function hdPartLists(key: string, fac: string) {
  const L = hdLook({ key, owner: 0, d: UNITS[key] }), out: any = {}; L.fac = fac;
  const mk = (f: (a: any[]) => void) => { const a: any[] = []; f(a); return a; };
  out.pelvis = mk(a => hdPelvis(a, L)), out.torso = mk(a => hdTorso(a, L)), out.head = mk(a => hdHead(a, L)), out.ua = mk(a => hdUpperArm(a, L)), out.fa = mk(a => hdForeArm(a, L)), out.th = mk(a => hdThigh(a, L)), out.sh = mk(a => hdShin(a, L)), out.ft = mk(hdFoot);
  for (const wt of ["rifle", "long", "flak", "rocket", "launcher", "flamer", "beam", "tool", "pistol"]) { const W = hdWeapon(wt, fac, "tesla"); out["gun_" + wt] = W.body.concat(W.mag, W.bolt); }
  return out;
}
function hdBakeOk(u: any) { return !!GL && QUALITY >= 1 && "inf" === u.d.kind && !u.d.fly && "rocketeer" !== u.key; }

// Garrison interiors reuse the same figures, parented to the room.
function fpsInteriorFig(u: any, parent: any) { const F = hdBuildFigure(u, parent); F.root.userData.F = F; return F.root; }
function fpsPoseFig(F: any) { const now = performance.now() / 1000, dt = Math.min(.1, Math.max(0, now - (F.lastT || now))); F.lastT = now; try { hdPose(F, dt); } catch (e) { } }

// ============================================================ VIEWMODEL
function fgVM() {
  if (FG.vm && FG.vm.renderer === GL.renderer) return FG.vm;
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(58, CW / CH, .01, 30);
  scene.add(cam);
  const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, .5), sun = new THREE.DirectionalLight(0xffffff, 1.5), ml = new THREE.PointLight(0xffc070, 0, 3, 2), fill = new THREE.DirectionalLight(0x8899aa, .35);
  scene.add(hemi, sun, fill), cam.add(ml), ml.position.set(.1, -.05, -.9), fill.position.set(-1, .3, .6);
  const T = fgTextures(), mk = (b: any) => { const m = new THREE.MeshStandardMaterial({ vertexColors: !0, roughness: b.roughness, metalness: b.metalness, map: b.map, normalMap: b.normalMap, normalScale: b.normalScale }); m.color = b.color.clone(); return m; };
  const mats: any = {};
  for (const k of BK) mats[k] = "emis" === k ? new THREE.MeshBasicMaterial({ vertexColors: !0 }) : mk(GL.mats[k]);
  mats.metal.metalness = .75, mats.metal.roughness = .38, mats.metal.envMapIntensity = 1;
  return FG.vm = { renderer: GL.renderer, scene, cam, hemi, sun, fill, ml, mats, T, st: { aim: 0, sprint: 0, rp: 0, rv: 0, rx: 0, rvx: 0, swX: 0, swY: 0, ly: null, lp: null, lastM: 0, draw: 0, boltT: 9, throwT: 0, lastT: 0, land: 0, lastJ: 0 } };
}
// Builds the first-person rig: weapon (+mag/bolt pieces) and both arms.
function fpsBuildViewmodel(kind: string, u: any) {
  const V = fgVM(), L = hdLook(u), pal = palette(u.owner), wt = hdWeaponType(kind), W = hdWeapon(wt, L.fac, hdBeamCol(kind)), s = .056;
  const key = "vm|" + u.key + "|" + u.owner + "|" + kind;
  const G = (n: string, f: (a: any[]) => void) => hdObj(hdGeo(key + n, pal, f), V.mats, !1);
  const root = new THREE.Group(), gun = new THREE.Group();
  gun.rotation.y = PI2, gun.scale.setScalar(s), root.add(gun);
  if (!W.none) gun.add(G("body", a => W.body.forEach((q: any) => a.push(q))));
  const mag = W.mag.length ? G("mag", a => W.mag.forEach((q: any) => a.push(q))) : null, bolt = W.bolt.length ? G("bolt", a => W.bolt.forEach((q: any) => a.push(q))) : null;
  mag && gun.add(mag), bolt && gun.add(bolt);
  const at = (v: number[]) => { const o = new THREE.Object3D(); o.position.set(v[0], v[2], v[1]); gun.add(o); return o; };
  const muzzle = at(W.muzzle), eject = at(W.eject), rg = at(W.rg), lg = W.lg ? at(W.lg) : null;
  // muzzle flash: two crossed additive cards + a core
  const flash = new THREE.Group(), fm = new THREE.MeshBasicMaterial({ map: V.T.flash, transparent: !0, depthWrite: !1, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  for (const r of [0, PI2]) { const q = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 3.6), fm); q.rotation.x = r, q.rotation.y = PI2 * 0, flash.add(q); }
  const front = new THREE.Mesh(new THREE.PlaneGeometry(3, 3), fm); front.rotation.y = PI2, flash.add(front);
  flash.position.copy(muzzle.position).add(new THREE.Vector3(1.2, 0, 0)), flash.visible = !1, gun.add(flash);
  const arms: any = {};
  const armMk = (n: string) => { const ua = G("ua", a => hdUpperArm(a, L)), fa = G("fa", a => hdForeArm(a, L)); ua.scale.setScalar(.088), fa.scale.setScalar(.09); root.add(ua, fa); arms[n] = { ua, fa }; };
  armMk("R"), armMk("L");
  // grenade for the off hand
  const gren = new THREE.Group(), gm = new THREE.MeshStandardMaterial({ color: 0x4d5a36, roughness: .7, metalness: .1 });
  gren.add(new THREE.Mesh(new THREE.SphereGeometry(.026, 18, 14), gm)); { const cap = new THREE.Mesh(new THREE.CylinderGeometry(.009, .009, .016, 12), new THREE.MeshStandardMaterial({ color: 0x777d84, metalness: .8, roughness: .35 })); cap.position.y = .028, gren.add(cap); }
  gren.visible = !1, root.add(gren);
  root.userData = { kind, magFamily: MAG_SIZE[{ rifle: "rifle", long: "sniper", flak: "flak", pistol: "pistol" }[wt] || ""] ? ({ rifle: "rifle", long: "sniper", flak: "flak", pistol: "pistol" } as any)[wt] : void 0,
    flash, gun, magObj: mag, bolt, muzzle, eject, rg, lg, arms, W, wt, s, gren, magHome: mag ? mag.position.clone() : null, boltHome: bolt ? bolt.position.clone() : null, shells: [], mag0: null };
  root.userData.mag = null, root.userData.reloadT = 0;
  root.visible = !1, V.cam.add(root);
  V.st.draw = 0;
  return root;
}
const sm = (a: number, b: number, x: number) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const _A = new THREE.Vector3(), _B = new THREE.Vector3(), _C = new THREE.Vector3(), _D = new THREE.Vector3();
function fpsViewmodelAnimate(vm: any, e: any) {
  const V = fgVM(), st = V.st, ud = vm.userData, now = performance.now() / 1000, dt = Math.min(.05, Math.max(0, now - (st.lastT || now)));
  st.lastT = now;
  const reloadT = ud.reloadT || 0, reloading = reloadT > 0, rt = reloading ? 1 - reloadT / RELOAD_DUR : 0;
  const sprint = FPS.sprinting && e.moving && !FPS.aiming && !reloading ? 1 : 0, aim = FPS.aiming && !reloading && !sprint ? 1 : 0;
  st.aim += (aim - st.aim) * Math.min(1, 14 * dt), st.sprint += (sprint - st.sprint) * Math.min(1, 8 * dt), st.draw = Math.min(1, st.draw + dt / .45);
  // recoil spring, kicked on each new shot
  const shot = e.muzzle > st.lastM + .02;
  st.lastM = e.muzzle;
  if (shot) {
    const heavy = "rocket" === ud.wt || "launcher" === ud.wt || "long" === ud.wt || "flak" === ud.wt ? 2.2 : 1;
    st.rv += (1.8 + .6 * Math.random()) * heavy * (1 - .45 * st.aim), st.rvx += (Math.random() - .5) * 1.6 * heavy;
    "long" === ud.wt && (st.boltT = 0);
  }
  st.rv += (-220 * st.rp - 24 * st.rv) * dt, st.rp += st.rv * dt, st.rvx += (-160 * st.rx - 20 * st.rvx) * dt, st.rx += st.rvx * dt;
  st.boltT += dt;
  // look sway (weapon lags the view)
  const dy = null == st.ly ? 0 : angDiff(st.ly, FPS.yaw), dp = null == st.lp ? 0 : FPS.pitch - st.lp;
  st.ly = FPS.yaw, st.lp = FPS.pitch;
  st.swX += (Math.max(-.08, Math.min(.08, dy)) * 1.4 - st.swX) * Math.min(1, 10 * dt), st.swY += (Math.max(-.08, Math.min(.08, dp)) * 1.4 - st.swY) * Math.min(1, 10 * dt);
  // jump / land
  const air = FPS.jumpZ > .5 ? 1 : 0;
  st.lastJ && !air && (st.land = 1), st.lastJ = air, st.land = Math.max(0, st.land - dt * 3);
  // pose
  const s = ud.s, sightY = (ud.W.sight || 1) * s, sightX = (ud.W.sightY || 0) * s;
  const hip = [.17, -.18, -.34], ads = [-sightX, -sightY, -.3], am = st.aim * (({ flamer: .5, tool: .35, none: 0, rocket: .9, launcher: .9 } as any)[ud.wt] ?? 1);
  let px = hip[0] + (ads[0] - hip[0]) * am, py = hip[1] + (ads[1] - hip[1]) * am, pz = hip[2] + (ads[2] - hip[2]) * am, rx = 0, ry = 0, rz = 0;
  const idle = S.time, ph = (e.animT || 0) * 6.283 / 34, mvk = e.moving ? 1 : 0, bobA = (1 - .85 * st.aim) * (1 + .8 * st.sprint) * mvk;
  px += .011 * Math.sin(ph) * bobA, py += -.009 * Math.abs(Math.cos(ph)) * bobA, rz += .02 * Math.sin(ph) * bobA;
  px += .003 * Math.sin(idle * .9) * (1 - .7 * st.aim), py += .002 * Math.sin(idle * 1.4 + 1.1) * (1 - .6 * st.aim);
  px -= st.swX * .09 * (1 - .6 * st.aim), py += st.swY * .06 * (1 - .6 * st.aim), ry += st.swX * .5, rx += st.swY * .4;
  // sprint: weapon canted down and across
  px += -.03 * st.sprint, py += -.035 * st.sprint, pz += .02 * st.sprint, rx += -.22 * st.sprint, ry += .42 * st.sprint, rz += .22 * st.sprint;
  FPS.crouching && (rz += .05);
  py -= .03 * st.land + .015 * air;
  // recoil
  pz += .045 * st.rp, rx += .085 * st.rp, py += .006 * st.rp, ry += .03 * st.rx, px += .004 * st.rx;
  // draw/raise
  const dr = 1 - st.draw * st.draw * (3 - 2 * st.draw);
  py -= .22 * dr, rx -= .9 * dr;
  // reload: tilt, mag out, new mag in, charge
  const tilt = reloading ? sm(0, .14, rt) * (1 - sm(.84, 1, rt)) : 0;
  rz += .38 * tilt, rx += .16 * tilt, py -= .02 * tilt, px -= .07 * tilt;
  // grenade throw / cook
  const cook = FPS.chargingGrenade ? 1 : 0;
  st.throwT = Math.max(0, st.throwT - dt);
  py -= .03 * cook, rz -= .12 * cook;
  vm.position.set(px, py, pz), vm.rotation.set(rx, ry, rz, "YXZ");
  // magazine & bolt pieces
  if (ud.magObj && ud.magHome) {
    const out = sm(.14, .3, rt), inn = sm(.36, .62, rt), gone = reloading && rt > .3 && rt < .36;
    ud.magObj.visible = !gone;
    const off = reloading ? (rt < .33 ? out * 4.5 : (1 - inn) * 5) : 0;
    ud.magObj.position.copy(ud.magHome), ud.magObj.position.y -= off, ud.magObj.position.x -= reloading && rt < .33 ? out * .8 : 0;
  }
  if (ud.bolt && ud.boltHome) {
    const ch = reloading ? sm(.68, .76, rt) * (1 - sm(.8, .86, rt)) : 0, bc = "long" === ud.wt && st.boltT < .7 ? Math.sin(Math.PI * Math.min(1, st.boltT / .7)) : 0;
    ud.bolt.position.copy(ud.boltHome), ud.bolt.position.x -= 1.1 * ch + 1.2 * bc, ud.bolt.position.z += .4 * bc;
  }
  // flash
  const firing = e.muzzle > 0 && !reloading, fk = Math.max(0, e.muzzle / .09);
  ud.flash.visible = firing && "tool" !== ud.wt;
  firing && (ud.flash.rotation.x = Math.random() * 6.28, ud.flash.scale.setScalar(.6 + .9 * fk * (.7 + .5 * Math.random())));
  V.ml.intensity = firing ? 1.6 * fk : 0;
  // arms
  vm.updateMatrixWorld(!0);
  const toRoot = (o: any, out: any) => { o.getWorldPosition(out); return vm.worldToLocal(out); };
  const shR = _A.set(.22, -.42, .08), shL = _B.set(-.08, -.44, -.16);
  const ua = .28, fa = .3;
  const arm = (n: string, sh: any, tgt: any, pole: any) => {
    const A = ud.arms[n], el = hdIK(sh, tgt, ua, fa, pole, new THREE.Vector3());
    hdOrient(A.ua, sh, el, new THREE.Vector3(0, -1, 0)), hdOrient(A.fa, el, tgt, new THREE.Vector3(0, -1, 0));
  };
  const rgp = toRoot(ud.rg, _C);
  if (ud.W.none) { const pk = e.muzzle > 0 ? Math.sin(Math.PI * Math.min(1, 1 - e.muzzle / .1)) : 0; rgp.set(.13 - .1 * pk, -.2 + .05 * pk, -.3 - .22 * pk); }
  arm("R", shR, rgp, new THREE.Vector3(.7, -1, .4));
  let lt: any;
  if (FPS.chargingGrenade || st.throwT > 0) {
    const th = st.throwT > 0 ? 1 - st.throwT / .45 : 0;
    lt = new THREE.Vector3(-.13 + .1 * th, -.12 + .08 * Math.sin(th * 3), -.34 - .25 * th);
    ud.gren.visible = th < .35, ud.gren.position.copy(lt).add(new THREE.Vector3(0, .02, -.03));
  } else if (reloading && ud.magObj && rt > .1 && rt < .7) {
    ud.gren.visible = !1;
    const m = toRoot(ud.magObj, _D).add(new THREE.Vector3(0, -.025, .01)), idle2 = new THREE.Vector3(-.2, -.36, -.18), k = sm(.3, .4, rt) * (1 - sm(.4, .46, rt));
    lt = m.lerp(idle2, k);
  } else if (ud.lg) { ud.gren.visible = !1, lt = toRoot(ud.lg, _D); }
  else { ud.gren.visible = !1, lt = new THREE.Vector3(-.2, -.3, -.2 + .02 * Math.sin(ph) * mvk); }
  arm("L", shL, lt, new THREE.Vector3(-.7, -1, .4));
  tickShells(vm);
}
function fpsViewmodelThrow() { const V = fgVM(); V.st.throwT = .45; }

// Frees a replaced viewmodel/cockpit rig: its one-off geometries and
// materials, never the cached part geometry or the shared material set.
function fgDisposeRig(root: any) {
  if (!root) return;
  root.parent && root.parent.remove(root);
  const keep = new Set<any>(FG.vm ? Object.values(FG.vm.mats) : []);
  root.traverse((o: any) => {
    if (!o.isMesh || o.userData.shared) return;
    o.geometry && o.geometry.dispose();
    for (const m of Array.isArray(o.material) ? o.material : [o.material]) m && !keep.has(m) && m.dispose();
  });
}
// Drops interiors of buildings that no longer exist.
function fgPruneInteriors() {
  if (!GL.interiorScene || (FG.intT = (FG.intT || 0) + 1) % 120) return;
  const live = new Set<any>();
  for (const b of S.blds) !b.dead && (b as any).interior && live.add((b as any).interior);
  for (const g of GL.interiorScene.children.slice()) if (!live.has(g)) {
    GL.interiorScene.remove(g);
    g.traverse((o: any) => { o.isMesh && !o.userData.shared && o.geometry && o.geometry.dispose(); });
  }
}
// Instanced render groups for model variants nobody has drawn for a while
// (finished production frames, dead owners' colours, old damage states)
// release their GPU buffers; they rebuild on demand if seen again.
function fgPruneGroups() {
  FG.frame = (FG.frame || 0) + 1;
  if (FG.frame % 300) return;
  for (const [k, d] of GL.groups) {
    if (d.touched) { d.seen = FG.frame; continue; }
    if (FG.frame - (d.seen || FG.frame) < 1800) { d.seen = d.seen || FG.frame; continue; }
    for (const b of BK) if (d[b]) GL.scene.remove(d[b]), d[b].dispose(), d[b] = null;
    GL.groups.delete(k);
    const g = GLGEO.get(k);
    if (g && !g.shared) { for (const b of BK) g[b] && g[b].dispose(); for (const an of g.anims || []) for (const b of BK) an.geo && an.geo[b] && an.geo[b].dispose(); GLGEO.delete(k); }
  }
}

// ============================================================ COCKPITS
function fpsBuildCockpit(e: any) {
  const V = fgVM(), root = new THREE.Group(), fac = hdFac(e), pal = palette(e.owner), fly = !!e.d.fly, naval = !!e.d.naval, walker = /titan_allied|titan_yuri|bastion/.test(e.key);
  const key = "ck|" + e.key + "|" + e.owner;
  const G = (n: string, f: (a: any[]) => void) => hdObj(hdGeo(key + n, pal, f), V.mats, !1);
  const s = .05, frame = new THREE.Group();
  frame.rotation.y = PI2, frame.scale.setScalar(s), root.add(frame);
  const body = "yuri" === fac ? "carapace2" : "armor3", trim = "yuri" === fac ? "psi" : "soviet" === fac ? "glow" : "tesla";
  const screens: any[] = [], needles: any[] = [];
  if (fly || walker) {
    // canopy frame and instrument panel
    frame.add(G("pit", a => {
      B_(a, 3.2, 0, -5.4, 2.4, 9, 1.6, body), B_(a, 3.9, 0, -3.8, 1.2, 8, .6, "dark2");
      for (const y of [-4.2, 4.2]) a.push(P_(CYL(.28, 7.5, 10), 4.4, y, -3.8, body, { ty: -.55, r: 0 }));
      a.push(P_(CYL(.3, 9.6, 10), 7.6, -4.8, 2.3, body, { tx: -PI2 }));
      for (const y of [-2.6, 0, 2.6]) B_(a, 3.9, y, -3.25, .2, 1.6, 1.1, "black");
      B_(a, 3.2, -4.4, -6, 2, 1.5, 3, "dark2"), B_(a, 3.2, 4.4, -6, 2, 1.5, 3, "dark2");
    }));
    for (const y of [-2.6, 0, 2.6]) { const sc = new THREE.Mesh(new THREE.PlaneGeometry(1.4, .95), new THREE.MeshBasicMaterial({ color: trim === "glow" ? 0xffa040 : trim === "psi" ? 0xc98cff : 0x7fd8ff, transparent: !0, opacity: .85 })); sc.position.set(3.78, -3.1, y), sc.rotation.y = -PI2, frame.add(sc), screens.push(sc); }
  } else {
    // tank / vehicle hatch: hatch ring, open lid and periscopes framing the view
    frame.add(G("hatch", a => {
      for (let k = 0; k < 20; k++) { const an = k / 20 * 6.283; B_(a, 5.2 + Math.cos(an) * 3.4, Math.sin(an) * 5.4, -5.0, 1.1, 1.7, .9, body, { r: an }); }
      for (let k = 0; k < 8; k++) { const an = k / 8 * 6.283 + .2; B_(a, 5.2 + Math.cos(an) * 3.4, Math.sin(an) * 5.4, -4.1, .35, .35, .25, "steel"); }
      B_(a, 3.2, -5.9, -5.4, 5, 1.2, 2.6, body), B_(a, 3.2, 5.9, -5.4, 5, 1.2, 2.6, body);
      for (const y of [-4.2, 4.2]) B_(a, 7.9, y, -4.9, 1.1, 1.5, 1.3, "dark2"), B_(a, 8.46, y, -4.6, .1, 1.1, .55, "glassdark", { e: 1 });
      B_(a, 3, 0, -6.4, 7, 12, 1.2, "dark2");
      if (!naval) { B_(a, -1.8, 0, -4.9, 2.4, 9, 7.5, body, { ty: .35 }); for (const y of [-5.2, 5.2]) a.push(P_(CYL(.3, 2.2, 10), 6.2, y, -4.2, "gunmetal")); }
    }));
    naval && frame.add(G("bridge", a => { B_(a, 5, 0, -7, 1.2, 16, 2.6, body); for (const y of [-6, -2, 2, 6]) B_(a, 5.6, y, -4.6, .5, .5, 6, body); B_(a, 5.6, 0, 1.4, .5, 16, .5, body); }));
  }
  root.userData = { kind: e.key, screens, needles, fly, walker, naval, frame };
  root.visible = !1, V.cam.add(root);
  return root;
}
function fpsCockpitAnimate(ck: any, e: any) {
  const ud = ck.userData, t = S.time, kick = e.muzzle > 0 ? e.muzzle / .09 : 0;
  ck.position.set(0, -.02 * kick + (e.moving ? .003 * Math.sin((e.animT || 0) * .5) : 0), .03 * kick);
  ud.frame.visible = !FPS.aiming;
  for (let i = 0; i < ud.screens.length; i++) ud.screens[i].material.opacity = .55 + .3 * Math.sin(t * (2 + i) + i) + .15 * kick;
  const V = fgVM(); V.ml.intensity = kick * 1.2;
}
// Gunner's sight overlay drawn on the 2D canvas while aiming in a vehicle.
function fpsSightOverlay(c: CanvasRenderingContext2D, e: any) {
  const w = CW, h = CH, r = Math.min(w, h) * .42, cx = w / 2, cy = h / 2, fac = hdFac(e), col = "yuri" === fac ? "#d9a8ff" : "soviet" === fac ? "#ffb35a" : "#9fe8ff";
  c.save();
  c.fillStyle = "rgba(4,8,10,.94)", c.beginPath(), c.moveTo(0, 0), c.lineTo(w, 0), c.lineTo(w, h), c.lineTo(0, h), c.closePath(), c.moveTo(cx + r, cy), c.arc(cx, cy, r, 0, 2 * Math.PI, !0), c.closePath(), c.fill();
  const g = c.createRadialGradient(cx, cy, r * .82, cx, cy, r); g.addColorStop(0, "rgba(0,0,0,0)"), g.addColorStop(1, "rgba(0,0,0,.45)");
  c.fillStyle = g, c.beginPath(), c.arc(cx, cy, r, 0, 6.283), c.fill();
  c.strokeStyle = col, c.fillStyle = col, c.lineWidth = 1.6, c.globalAlpha = .9;
  c.beginPath(), c.moveTo(cx - r, cy), c.lineTo(cx - 18, cy), c.moveTo(cx + 18, cy), c.lineTo(cx + r, cy), c.moveTo(cx, cy + 18), c.lineTo(cx, cy + r * .7), c.stroke();
  c.beginPath(), c.moveTo(cx - 12, cy + 10), c.lineTo(cx, cy), c.lineTo(cx + 12, cy + 10), c.stroke();
  for (let k = 1; k <= 5; k++) { const y = cy + k * r * .12; c.beginPath(), c.moveTo(cx - 6 - 2 * k, y), c.lineTo(cx + 6 + 2 * k, y), c.stroke(); c.font = "10px monospace", c.fillText(String(k * 200), cx + 12 + 2 * k, y + 3); }
  for (let k = -4; k <= 4; k++) if (k) { const x = cx + k * r * .2; c.beginPath(), c.moveTo(x, cy - 5), c.lineTo(x, cy + 5), c.stroke(); }
  c.globalAlpha = .6, c.beginPath(), c.arc(cx, cy, r - 2, 0, 6.283), c.stroke();
  const rl = e.cool > 0 ? Math.min(1, e.cool / Math.max(.01, e.d.rof)) : 0;
  c.globalAlpha = .9, c.font = "bold 12px monospace", c.fillText(rl > 0 ? "LOADING" : "READY", cx + r * .55, cy + r * .75);
  rl > 0 && (c.fillRect(cx + r * .55, cy + r * .78, 70 * (1 - rl), 3));
  c.restore();
}

// Render the viewmodel/cockpit pass after the world, with its own camera so
// it never clips into walls and keeps a steady field of view.
function fpsGfxPost() {
  if (!FPS.on || !FPS.u || FPS.thirdPerson || !FG.vm || FPS.u.dead) return;
  const V = FG.vm, any = V.cam.children.some((o: any) => o.visible && o !== V.ml);
  if (!any) return;
  V.cam.aspect = CW / CH, V.cam.fov = FPS.aiming ? 50 : 58, V.cam.updateProjectionMatrix();
  const q = FPS.cam.quaternion.clone().invert();
  V.sun.position.copy(GL.sun.position).sub(GL.sun.target.position).normalize().applyQuaternion(q).multiplyScalar(10);
  V.sun.color.copy(GL.sun.color), V.sun.intensity = GL.sun.intensity * .9;
  V.hemi.color.copy(GL.hemi.color), V.hemi.groundColor.copy(GL.hemi.groundColor), V.hemi.intensity = GL.hemi.intensity * 1.3 + .1;
  V.hemi.position.set(0, 1, 0).applyQuaternion(q);
  V.scene.environment = GL.scene.environment;
  const r = GL.renderer;
  r.autoClear = !1, r.clearDepth(), r.render(V.scene, V.cam), r.autoClear = !0;
}

Object.assign(window, { fpsGfxPre, fpsGfxShadow, fpsGfxPost, fgWindMat, WIND_KEYS, fx3dActive, fpsPixelRatio, FG, fpsHDSet, fpsBuildViewmodel, fpsViewmodelAnimate, fpsViewmodelThrow, fgDisposeRig, hdBakeGeo, hdBakeOk, hdFloatCheck, hdPartLists, fpsInteriorFig, fpsPoseFig, fpsBuildCockpit, fpsCockpitAnimate, fpsSightOverlay, hdWeapon, hdBuildFigure });

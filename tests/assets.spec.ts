import { test, expect } from "@playwright/test";
import { collectPageErrors } from "./helpers";
import { TRIANGLE_GLB_B64 } from "./fixtures/triangle-glb";

// Models in this engine are baked part-arrays (see P_/buildTris), not live
// THREE.Object3D graphs, so "valid model" here means a non-empty array of
// {m,x,y,z,c}-shaped parts, which is what UMODEL/BMODEL/PROPMODEL produce.

test("external GLTF/GLB asset loading falls back gracefully and converts correctly", async ({ page }) => {
  const errs = collectPageErrors(page);
  await page.goto("/index.html");
  await page.waitForTimeout(300);

  // 1. Fallback path: register a bad/unreachable URL, confirm UMODEL/BMODEL/
  //    PROPMODEL still return a valid, non-empty procedural parts array.
  const r1 = await page.evaluate(() => {
    const w = window as any;
    w.registerModelAsset("gi", "https://example.invalid/does-not-exist.glb");
    const before = typeof w.MODEL_ASSETS.gi;
    const u = w.UMODEL("gi", 0);
    const b = w.BMODEL("conyard", 0, 0, "def");
    const p = w.PROPMODEL("tree");
    const isParts = (x: any) => Array.isArray(x) && x.length > 0 && x[0] && Array.isArray(x[0].m);
    return { registered: before, uOk: isParts(u), bOk: isParts(b), pOk: isParts(p) };
  });
  expect(r1.registered).toBe("string");
  expect(r1.uOk).toBe(true);
  expect(r1.bOk).toBe(true);
  expect(r1.pOk).toBe(true);

  await page.waitForTimeout(500);
  const r1b = await page.evaluate(() => {
    const w = window as any;
    const isParts = (x: any) => Array.isArray(x) && x.length > 0 && x[0] && Array.isArray(x[0].m);
    const u2 = w.UMODEL("gi", 0); // should still fall back to procedural
    w.unregisterModelAsset("gi");
    return { stillFallsBack: isParts(u2), unregistered: !w.MODEL_ASSETS.gi };
  });
  expect(r1b.stillFallsBack).toBe(true);
  expect(r1b.unregistered).toBe(true);

  // 2. A data: URI that resolves but isn't a valid glb -> GLTFLoader parse
  //    error -> graceful fallback handling end-to-end.
  const r2 = await page.evaluate(() => {
    const w = window as any;
    const isParts = (x: any) => Array.isArray(x) && x.length > 0 && x[0] && Array.isArray(x[0].m);
    const dataUri = "data:application/octet-stream;base64,AAAA";
    w.registerModelAsset("badglb", dataUri);
    const first = w.UMODEL("badglb", 0); // triggers load, returns null->procedural fallback
    return { firstOk: isParts(first) };
  });
  expect(r2.firstOk).toBe(true);

  await page.waitForTimeout(500);
  const r2b = await page.evaluate(() => {
    const w = window as any;
    const isParts = (x: any) => Array.isArray(x) && x.length > 0 && x[0] && Array.isArray(x[0].m);
    const second = w.UMODEL("badglb", 0); // should still gracefully fall back after failed parse
    w.unregisterModelAsset("badglb");
    return { stillOk: isParts(second) };
  });
  expect(r2b.stillOk).toBe(true);

  // 3. Unregistered key: getAssetModel returns null, no crash.
  const r3 = await page.evaluate(() => (window as any).getAssetModel("totally-unregistered-key"));
  expect(r3).toBeNull();

  // 4. Real successful load: a hand-built minimal valid GLB (one red
  //    triangle, Y-up per glTF convention) via data: URI, so it loads with
  //    no network access. Confirms the GLTF->parts converter (partsFromGLTF)
  //    produces a usable, correctly-colored, correctly-scaled part, and that
  //    it wins over the procedural fallback once loaded.
  const r4 = await page.evaluate((b64) => {
    const w = window as any;
    const dataUri = "data:model/gltf-binary;base64," + b64;
    w.registerModelAsset("testtri", dataUri, 5);
    const before = w.UMODEL("testtri", 0); // still loading -> procedural fallback
    return { beforeIsProcedural: before !== null };
  }, TRIANGLE_GLB_B64);
  expect(r4.beforeIsProcedural).toBe(true);

  // Poll until the async load resolves (or timeout).
  let loaded: any = null;
  for (let i = 0; i < 20; i++) {
    await page.waitForTimeout(150);
    loaded = await page.evaluate(() => (window as any).UMODEL("testtri", 0));
    if (loaded && loaded.length === 1 && loaded[0]?.c === "#ff0000") break;
  }

  expect(loaded).not.toBeNull();
  expect(loaded.length).toBe(1);
  const part = loaded[0];
  expect(part.c).toBe("#ff0000");
  const tris = part.m;
  expect(tris.length).toBe(1);
  const tri = tris[0];
  // GLTF Y-up (0,0,0),(1,0,0),(0,1,0) -> after -90deg X rotation + scale 5
  // -> Z-up (0,0,0),(5,0,0),(0,0,5)
  const pts: number[][] = tri.p;
  const expected = [
    [0, 0, 0],
    [5, 0, 0],
    [0, 0, 5],
  ];
  const close = (a: number[], b: number[], eps = 1e-3) => a.every((v, i) => Math.abs(v - b[i]) < eps);
  const matched = pts.every((p) => expected.some((e) => close(p, e)));
  expect(matched, `triangle points don't match expected Y-up->Z-up conversion: ${JSON.stringify(pts)}`).toBe(true);

  await page.evaluate(() => (window as any).unregisterModelAsset("testtri"));

  expect(errs).toEqual([]);
});

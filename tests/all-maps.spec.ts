import { test, expect } from "@playwright/test";
import { collectPageErrors } from "./helpers";

test("every non-random map generates a valid, playable start state", async ({ page }) => {
  const errs = collectPageErrors(page);
  await page.goto("/index.html");
  await page.waitForTimeout(300);

  const results = await page.evaluate(() => {
    const w = window as any;
    const out: Record<string, { ok: boolean; error?: string; spawnCount?: number; civCount?: number }> = {};
    for (const m of w.MAPS) {
      if (m.k === "random") continue;
      try {
        w.cfg.fac = "allied";
        w.cfg.map = m.k;
        w.cfg.fog = "off";
        w.cfg.slots = [{ fac: "soviet", team: 2, color: "def", spawn: 1, diff: "normal" }];
        w.startGame();
        w.S.running = false;
        out[m.k] = {
          ok: true,
          spawnCount: w.G.spots.length,
          civCount: w.S.blds.filter((b: any) => b.d.civ || b.key === "cannon").length,
        };
      } catch (e: any) {
        out[m.k] = { ok: false, error: e.message };
      }
    }
    return out;
  });

  const mapKeys = Object.keys(results);
  expect(mapKeys.length).toBeGreaterThan(0);
  for (const [k, v] of Object.entries(results)) {
    expect(v.ok, `map "${k}" failed to start: ${v.error}`).toBe(true);
    expect(v.spawnCount, `map "${k}" has no spawn points`).toBeGreaterThan(0);
  }
  expect(errs).toEqual([]);
});

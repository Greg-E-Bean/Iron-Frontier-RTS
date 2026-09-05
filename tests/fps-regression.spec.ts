import { test, expect } from "@playwright/test";
import { collectPageErrors, startSkirmish } from "./helpers";

const FPS_UNIT_KEYS = [
  "gi", "guardian", "conscript", "flak", "initiate", "virus", "engineer", "tanya",
  "reaper", "phantom", "chrono", "desolator", "brute", "marksman", "bombard",
  "leech", "grizzly", "ifv", "chinook", "riverine",
];

test("every FPS-capable unit can enter/tick/render/exit FPS mode without throwing", async ({ page }) => {
  const errs = collectPageErrors(page);
  await page.goto("/index.html");
  await page.waitForTimeout(300);

  await startSkirmish(page);
  const results = await page.evaluate((keys) => {
    const w = window as any;
    for (let y = 0; y < 72; y++) for (let x = 0; x < 92; x++) {
      w.G.terr[w.idx(x, y)] = 0;
      w.G.ore[w.idx(x, y)] = 0;
    }
    w.S.units.forEach((u: any) => (u.dead = true));

    const out: { k: string; ok?: boolean; error?: string }[] = [];
    let x = 300;
    for (const k of keys) {
      try {
        const u = w.addUnit(0, k, x, 500);
        x += 60;
        if (!u) {
          out.push({ k, error: "addUnit returned null" });
          continue;
        }
        w.enterFPS(u);
        for (let i = 0; i < 10; i++) {
          w.FPS.mv.f = 1;
          w.fpsTick(0.1);
          w.fpsRender();
        }
        w.fpsHUD();
        w.fpsAbility();
        for (let i = 0; i < 10; i++) w.fpsTick(0.1);
        w.exitFPS();
        out.push({ k, ok: true });
      } catch (e: any) {
        out.push({ k, error: e.message });
      }
    }
    return out;
  }, FPS_UNIT_KEYS);

  expect(results.length).toBe(FPS_UNIT_KEYS.length);
  for (const row of results) {
    expect(row.ok, `unit "${row.k}" failed in FPS mode: ${row.error}`).toBe(true);
  }
  expect(errs).toEqual([]);
});

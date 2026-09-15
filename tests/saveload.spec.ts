import { test, expect } from "@playwright/test";
import { collectPageErrors, startSkirmish } from "./helpers";

test("serializeGame -> localStorage -> loadSlot round-trips real game state", async ({ page }) => {
  const errs = collectPageErrors(page);
  await page.goto("/index.html");
  await page.waitForTimeout(300);

  await startSkirmish(page);
  const before = await page.evaluate(() => {
    const w = window as any;
    w.addUnit(0, "grizzly", 500, 500);
    for (let i = 0; i < 40; i++) w.step(0.5);
    return {
      time: w.S.time,
      unitCount: w.S.units.filter((u: any) => !u.dead).length,
      bldCount: w.S.blds.filter((b: any) => !b.dead).length,
      credits: w.S.players[0].credits,
    };
  });

  expect(before.unitCount).toBeGreaterThan(0);
  expect(before.bldCount).toBeGreaterThan(0);

  const after = await page.evaluate(() => {
    const w = window as any;
    try {
      localStorage.setItem("ifr_save0", JSON.stringify(w.serializeGame()));
      const meta = w.saveMeta(0);
      w.S.units = [];
      w.S.blds = []; // scramble state to prove load actually repopulates it
      w.loadSlot(0);
      return {
        ok: true,
        meta,
        time: w.S.time,
        unitCount: w.S.units.filter((u: any) => !u.dead).length,
        bldCount: w.S.blds.filter((b: any) => !b.dead).length,
        credits: w.S.players[0].credits,
      };
    } catch (e: any) {
      return { ok: false, error: e.message };
    }
  });

  expect(after.ok, `saveload round-trip threw: ${(after as any).error}`).toBe(true);
  expect(after.time).toBeCloseTo(before.time, 0);
  expect(after.unitCount).toBe(before.unitCount);
  expect(after.bldCount).toBe(before.bldCount);
  expect(errs).toEqual([]);
});

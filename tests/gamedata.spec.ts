import { test, expect } from "@playwright/test";
import { collectPageErrors, startSkirmish } from "./helpers";

test("unit/building data tables are internally consistent and drive real spawns", async ({ page }) => {
  const errs = collectPageErrors(page);
  await page.goto("/index.html");
  await page.waitForTimeout(300);

  const r = await page.evaluate(() => {
    const w = window as any;
    return {
      unitsCount: Object.keys(w.UNITS).length,
      bldCount: Object.keys(w.BLD).length,
      factionsCount: Object.keys(w.FACTIONS).length,
      diffsCount: Object.keys(w.DIFFS).length,
      uname_gi: w.uname("gi", "allied"),
      bname_conyard: w.bname("conyard", "allied"),
      roleTag_gi: w.unitRoleTag("gi"),
      bweapon_aa: w.bweapon("aa", "allied"),
      grizzlyCost: w.UNITS.grizzly.cost,
      conyardHp: w.BLD.conyard.hp,
    };
  });

  expect(r.unitsCount).toBeGreaterThan(0);
  expect(r.bldCount).toBeGreaterThan(0);
  expect(r.factionsCount).toBeGreaterThan(0);
  expect(r.diffsCount).toBeGreaterThan(0);
  expect(r.uname_gi).toBeTruthy();
  expect(r.bname_conyard).toBeTruthy();
  expect(r.roleTag_gi).toBeTruthy();
  expect(r.grizzlyCost).toBeGreaterThan(0);
  expect(r.conyardHp).toBeGreaterThan(0);

  await startSkirmish(page);
  const r2 = await page.evaluate(() => {
    const w = window as any;
    const u = w.addUnit(0, "grizzly", 500, 500);
    return { unitOk: !!u, unitName: u && u.d.name, unitHp: u && u.hp, playerCredits: w.S.players[0].credits };
  });

  expect(r2.unitOk).toBe(true);
  expect(r2.unitName).toBeTruthy();
  expect(r2.unitHp).toBeGreaterThan(0);
  expect(r2.playerCredits).toBeGreaterThanOrEqual(0);
  expect(errs).toEqual([]);
});

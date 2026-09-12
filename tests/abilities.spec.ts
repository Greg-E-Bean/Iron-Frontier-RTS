import { test, expect } from "@playwright/test";
import { collectPageErrors, startSkirmish } from "./helpers";

test("superweapon abilities (spy plane, paradrop, EMP) fire correctly", async ({ page }) => {
  const errs = collectPageErrors(page);
  await page.goto("/index.html");
  await page.waitForTimeout(300);

  await startSkirmish(page);
  const data = await page.evaluate(() => {
    const w = window as any;
    w.S.players[0].credits = 50000;
    return { abilitiesData: Object.keys(w.ABILITIES), spyCost: w.ABILITIES.spy.cost };
  });
  expect(data.abilitiesData.length).toBeGreaterThan(0);
  expect(data.spyCost).toBeGreaterThan(0);

  // abilityClick('spy') requires an airfield + cooldown clear + credits, per
  // its own guard clauses - build one first so the real gate passes.
  const toggle = await page.evaluate(() => {
    const w = window as any;
    w.addBuilding(0, "airfield", 20, 20, true);
    const before = { superAim: w.superAim, spyAim: w.spyAim, paradropAim: w.paradropAim, empAim: w.empAim };
    w.abilityClick("spy");
    const afterClick = { superAim: w.superAim, spyAim: w.spyAim, paradropAim: w.paradropAim, empAim: w.empAim };
    // confirm the getter/setter round-trips correctly from outside (cards.ts
    // reads these same globals in updateCards() to toggle the .head class)
    w.spyAim = false;
    const afterExternalWrite = { spyAim: w.spyAim };
    return { before, afterClick, afterExternalWrite };
  });
  expect(toggle.afterClick.spyAim).toBe(true);
  expect(toggle.afterExternalWrite.spyAim).toBe(false);

  const spyStrike = await page.evaluate(() => {
    const w = window as any;
    try {
      const creditsBefore = w.S.players[0].credits;
      w.spyStrike(0, 800, 800);
      return {
        ok: true,
        creditsSpent: creditsBefore - w.S.players[0].credits,
        spyCD: w.S.players[0].spyCD,
        revealCount: (w.S.spyReveals || []).length,
      };
    } catch (e: any) {
      return { ok: false, error: e.message };
    }
  });
  expect(spyStrike.ok, `spyStrike() threw: ${(spyStrike as any).error}`).toBe(true);
  expect(spyStrike.creditsSpent).toBeGreaterThan(0);
  expect(spyStrike.spyCD).toBeGreaterThan(0);

  const paradrop = await page.evaluate(() => {
    const w = window as any;
    try {
      const unitsBefore = w.S.units.filter((u: any) => !u.dead).length;
      w.paradropStrike(0, 900, 900);
      const unitsAfter = w.S.units.filter((u: any) => !u.dead).length;
      return { ok: true, unitsBefore, unitsAfter, paradropCD: w.S.players[0].paradropCD };
    } catch (e: any) {
      return { ok: false, error: e.message };
    }
  });
  expect(paradrop.ok, `paradropStrike() threw: ${(paradrop as any).error}`).toBe(true);
  expect(paradrop.unitsAfter).toBeGreaterThan(paradrop.unitsBefore);
  expect(paradrop.paradropCD).toBeGreaterThan(0);

  const emp = await page.evaluate(() => {
    const w = window as any;
    try {
      w.fireEmp(0, 700, 700);
      return { ok: true, empCD: w.S.players[0].empCD };
    } catch (e: any) {
      return { ok: false, error: e.message };
    }
  });
  expect(emp.ok, `fireEmp() threw: ${(emp as any).error}`).toBe(true);
  expect(emp.empCD).toBeGreaterThan(0);

  const panelTick = await page.evaluate(() => {
    const w = window as any;
    try {
      for (let i = 0; i < 10; i++) {
        w.step(0.2);
        w.updateSuperPanel();
      }
      return "ok";
    } catch (e: any) {
      return "ERR:" + e.message;
    }
  });
  expect(panelTick).toBe("ok");

  expect(errs).toEqual([]);
});

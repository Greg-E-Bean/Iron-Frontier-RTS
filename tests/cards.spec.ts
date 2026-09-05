import { test, expect } from "@playwright/test";
import { collectPageErrors } from "./helpers";

test("build-menu cards render, switch tabs, tick, and deploy the MCV", async ({ page }) => {
  const errs = collectPageErrors(page);
  await page.goto("/index.html");
  await page.waitForTimeout(300);

  const initial = await page.evaluate(() => {
    const w = window as any;
    w.cfg.fac = "soviet";
    w.cfg.map = "basin";
    w.cfg.fog = "off";
    w.cfg.slots = [{ fac: "allied", team: 2, color: "def", spawn: 1, diff: "normal" }];
    w.S.running = false;
    w.startGame();
    return {
      cardCount: document.querySelectorAll("#cards .card").length,
      firstCardName: document.querySelector("#cards .card .nm")
        ? document.querySelector("#cards .card .nm")!.textContent
        : null,
      roleTagPresent: !!document.querySelector("#cards .card .role"),
    };
  });
  expect(initial.cardCount).toBeGreaterThan(0);
  expect(initial.firstCardName).toBeTruthy();

  const infTab = await page.evaluate(() => {
    const w = window as any;
    w.S.tab = "inf";
    w.buildCards();
    const cards = [...document.querySelectorAll("#cards .card .nm")].map((e) => e.textContent);
    return { tab: w.S.tab, cardNames: cards };
  });
  expect(infTab.tab).toBe("inf");
  expect(infTab.cardNames.length).toBeGreaterThan(0);

  const tickResult = await page.evaluate(() => {
    const w = window as any;
    try {
      for (let i = 0; i < 5; i++) {
        w.step(0.2);
        w.updateCards();
      }
      return "ok";
    } catch (e: any) {
      return "ERR:" + e.message;
    }
  });
  expect(tickResult).toBe("ok");

  const deploy = await page.evaluate(() => {
    const w = window as any;
    const mcv = w.S.units.find((u: any) => u.d.role === "mcv" && u.owner === 0);
    if (!mcv) return { found: false };
    w.S.sel = [mcv];
    try {
      w.doDeploy();
      return { found: true, ok: true, bldCount: w.S.blds.filter((b: any) => !b.dead).length };
    } catch (e: any) {
      return { found: true, ok: false, error: e.message };
    }
  });
  expect(deploy.found).toBe(true);
  expect(deploy.ok, `doDeploy() threw: ${(deploy as any).error}`).toBe(true);
  expect(deploy.bldCount).toBeGreaterThan(0);

  expect(errs).toEqual([]);
});

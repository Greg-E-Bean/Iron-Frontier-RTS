import { test, expect } from "@playwright/test";
import { collectPageErrors } from "./helpers";

test("campaign mission launch, tick, and unlock flow works end-to-end", async ({ page }) => {
  const errs = collectPageErrors(page);
  await page.goto("/index.html");
  await page.waitForTimeout(300);

  const sanity = await page.evaluate(() => {
    const w = window as any;
    return {
      facNameAllied: w.FAC_NAME.allied,
      campaignFacs: Object.keys(w.CAMPAIGNS),
      alliedMissionCount: w.CAMPAIGNS.allied.missions.length,
      campaignUnlockedAllied: w.campaignUnlocked("allied"),
    };
  });
  expect(sanity.facNameAllied).toBeTruthy();
  expect(sanity.campaignFacs.length).toBeGreaterThan(0);
  expect(sanity.alliedMissionCount).toBeGreaterThan(0);
  expect(sanity.campaignUnlockedAllied).toBeGreaterThanOrEqual(0);

  // launchMission() calls startGame() internally (sets pendingMission then
  // starts the match, consumed via applyPendingMission()) - don't call
  // startGame() again here.
  const launch = await page.evaluate(() => {
    const w = window as any;
    w.launchMission("allied", 0);
    const mission = w.CAMPAIGNS.allied.missions[0];
    const cfgSnapshot = { fac: w.cfg.fac, map: w.cfg.map, fog: w.cfg.fog, slotCount: w.cfg.slots.length };
    w.S.running = false;
    return {
      cfgSnapshot,
      missionName: mission.name,
      sMissionSet: !!w.S.mission,
      sMissionFac: w.S.mission && w.S.mission.fac,
      unitCount: w.S.units.filter((u: any) => !u.dead).length,
    };
  });
  expect(launch.missionName).toBeTruthy();
  expect(launch.sMissionSet).toBe(true);
  expect(launch.unitCount).toBeGreaterThan(0);

  const tick = await page.evaluate(() => {
    const w = window as any;
    try {
      for (let i = 0; i < 20; i++) w.step(0.5);
      const outcome = w.checkMissionOutcome();
      w.unlockNext("allied", 0);
      const newUnlock = w.campaignUnlocked("allied");
      return { ok: true, outcome, newUnlock };
    } catch (e: any) {
      return { ok: false, error: e.message };
    }
  });
  expect(tick.ok, `mission tick threw: ${(tick as any).error}`).toBe(true);
  expect(tick.newUnlock).toBeGreaterThanOrEqual(sanity.campaignUnlockedAllied);

  const data = await page.evaluate(() => {
    const w = window as any, bad: string[] = [];
    for (const fac of Object.keys(w.CAMPAIGNS)) w.CAMPAIGNS[fac].missions.forEach((m: any, i: number) => {
      const id = fac + i;
      if (!w.MAPDEFS[m.map]) bad.push(id + " map");
      if (!m.obj.some((o: any) => !o.sec)) bad.push(id + " no primary");
      const ids = new Set(m.obj.map((o: any) => o.id));
      for (const e of m.ev) { if (e.done && !ids.has(e.done)) bad.push(id + " ev done " + e.done); for (const a of e.do) { if (a[0] === "show" && !ids.has(a[1])) bad.push(id + " show " + a[1]); if (a[0] === "wave" && !m.foes[a[1]]) bad.push(id + " wave slot"); } }
    });
    return { bad, count: Object.values(w.CAMPAIGNS).reduce((n: number, c: any) => n + c.missions.length, 0) };
  });
  expect(data.bad).toEqual([]);
  expect(data.count).toBe(24);

  expect(errs).toEqual([]);
});

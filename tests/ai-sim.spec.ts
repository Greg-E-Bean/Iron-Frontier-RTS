import { test, expect } from "@playwright/test";
import { collectPageErrors } from "./helpers";

test("a 4-player fogged skirmish survives 15 sim-minutes without crashing", async ({ page }) => {
  const errs = collectPageErrors(page);
  await page.goto("/index.html");
  await page.waitForTimeout(300);

  await page.evaluate(() => {
    const w = window as any;
    w.cfg.fac = "allied";
    w.cfg.map = "grand";
    w.cfg.fog = "on";
    w.cfg.slots = [
      { fac: "soviet", team: 2, color: "def", spawn: 1, diff: "normal" },
      { fac: "yuri", team: 3, color: "def", spawn: 2, diff: "normal" },
      { fac: "allied", team: 4, color: "def", spawn: 3, diff: "normal" },
    ];
    w.startGame();
  });

  const r = await page.evaluate(() => {
    const w = window as any;
    for (let i = 0; i < 900; i++) w.step(1); // 900 sim-seconds, 15 min
    const alive = w.S.players.filter((p: any) => !p.defeated && !p.neutral).length;
    const bldCount = w.S.blds.filter((b: any) => !b.dead).length;
    const unitCount = w.S.units.filter((u: any) => !u.dead).length;
    const cannonsCaptured = w.S.blds.filter(
      (b: any) => !b.dead && b.key === "cannon" && b.owner !== w.NEUTRAL
    ).length;
    return { alive, bldCount, unitCount, cannonsCaptured, time: w.S.time };
  });

  expect(r.alive).toBeGreaterThan(0);
  expect(r.bldCount).toBeGreaterThan(0);
  expect(r.time).toBeCloseTo(900, 0);
  expect(r.cannonsCaptured).toBeGreaterThanOrEqual(0);
  expect(errs).toEqual([]);
});

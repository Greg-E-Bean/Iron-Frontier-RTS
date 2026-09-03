import { test, expect } from "@playwright/test";
import { collectPageErrors } from "./helpers";

test("skirmish AI expands, builds an army, and its exposed functions run cleanly", async ({ page }) => {
  const errs = collectPageErrors(page);
  await page.goto("/index.html");
  await page.waitForTimeout(300);

  const start = await page.evaluate(() => {
    const w = window as any;
    w.cfg.fac = "allied";
    w.cfg.map = "grand";
    w.cfg.fog = "on";
    w.cfg.slots = [
      { fac: "soviet", team: 2, color: "def", spawn: 1, diff: "hard" },
      { fac: "yuri", team: 3, color: "def", spawn: 2, diff: "normal" },
    ];
    w.S.running = false;
    w.startGame();
    return {
      playerCount: w.S.players.filter((p: any) => !p.neutral).length,
      aiCount: w.S.players.filter((p: any) => p.isAI).length,
    };
  });
  expect(start.playerCount).toBe(3);
  expect(start.aiCount).toBe(2);

  const afterSim = await page.evaluate(() => {
    const w = window as any;
    for (let i = 0; i < 600; i++) w.step(1); // 600 sim-seconds of real AI decision-making
    return {
      bldCount: w.S.blds.filter((b: any) => !b.dead).length,
      unitCount: w.S.units.filter((u: any) => !u.dead).length,
      aiCredits: w.S.players.filter((p: any) => p.isAI).map((p: any) => Math.round(p.credits)),
      defeated: w.S.players.map((p: any) => !!p.defeated),
    };
  });
  expect(afterSim.bldCount).toBeGreaterThan(0);
  expect(afterSim.unitCount).toBeGreaterThan(0);
  expect(afterSim.aiCredits.length).toBe(2);

  const direct = await page.evaluate(() => {
    const w = window as any;
    try {
      const aiPlayer = w.S.players.find((p: any) => p.isAI);
      const center = w.aiBaseCenter(aiPlayer);
      w.tickAI(aiPlayer, 0.5);
      w.aiMicro(aiPlayer, 0.5);
      return { ok: true, center };
    } catch (e: any) {
      return { ok: false, error: e.message };
    }
  });
  expect(direct.ok, `direct AI function calls threw: ${(direct as any).error}`).toBe(true);
  expect(direct.center).toBeTruthy();

  expect(errs).toEqual([]);
});

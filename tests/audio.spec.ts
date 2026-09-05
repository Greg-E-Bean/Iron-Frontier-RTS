import { test, expect } from "@playwright/test";
import { collectPageErrors, startSkirmish } from "./helpers";

// The project's launchOptions (playwright.config.ts) already carries
// --autoplay-policy=no-user-gesture-required, needed here for audio - not
// overridden via test.use() since that replaces launchOptions wholesale
// rather than merging it, which would silently drop the config's
// executablePath escape hatch.

test("rain ambience, thunder/lightning, and volume controls work end-to-end", async ({ page }) => {
  const errs = collectPageErrors(page);
  await page.goto("/index.html");
  await page.waitForTimeout(300);

  // user gesture to satisfy audio autoplay policies
  await page.mouse.click(450, 350);
  await page.waitForTimeout(100);

  await startSkirmish(page);
  await page.evaluate(() => {
    const w = window as any;
    w.S.weather = "rain";
    w.setRainAmbience(true);
  });

  const sfxResult = await page.evaluate(() => {
    const w = window as any;
    try {
      w.sfx("thunder");
      return "ok";
    } catch (e: any) {
      return "ERR:" + e.message;
    }
  });
  expect(sfxResult).toBe("ok");

  const thunderResult = await page.evaluate(() => {
    const w = window as any;
    w.S.running = true;
    w.S.thunderT = 0.01;
    let sawFlash = false;
    for (let i = 0; i < 20; i++) {
      w.step(0.1);
      if (w.lightningT > 0) sawFlash = true;
    }
    return { sawFlash, lightningT: w.lightningT, thunderT: w.S.thunderT };
  });
  expect(thunderResult.sawFlash).toBe(true);

  const renderResult = await page.evaluate(() => {
    const w = window as any;
    try {
      w.lightningT = 0.15;
      w.render();
      return "ok";
    } catch (e: any) {
      return "ERR:" + e.message;
    }
  });
  expect(renderResult).toBe("ok");

  const stopResult = await page.evaluate(() => {
    const w = window as any;
    try {
      w.setRainAmbience(false);
      return "ok";
    } catch (e: any) {
      return "ERR:" + e.message;
    }
  });
  expect(stopResult).toBe("ok");

  const gameOverResult = await page.evaluate(() => {
    const w = window as any;
    w.S.weather = "rain";
    w.setRainAmbience(true);
    try {
      w.gameOver(true);
      return "ok";
    } catch (e: any) {
      return "ERR:" + e.message;
    }
  });
  expect(gameOverResult).toBe("ok");

  const volResult = await page.evaluate(() => {
    const w = window as any;
    try {
      w.setMasterVol(0.5);
      w.setSfxVol(0.5);
      w.setMusicVol(0.5);
      w.setTrackSel(2);
      w.setMuted(false);
      return { masterVol: w.masterVol, sfxVol: w.sfxVol, musicVol: w.musicVol, trackSel: w.trackSel, muted: w.muted };
    } catch (e: any) {
      return "ERR:" + e.message;
    }
  });
  expect(volResult).toEqual({ masterVol: 0.5, sfxVol: 0.5, musicVol: 0.5, trackSel: 2, muted: false });

  expect(errs).toEqual([]);
});

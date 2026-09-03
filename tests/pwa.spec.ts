import { test, expect } from "@playwright/test";
import { collectPageErrors } from "./helpers";

test("service worker registers, caches the app shell, and serves it offline", async ({ page, context }) => {
  const errs = collectPageErrors(page);
  await page.goto("/index.html");
  await page.waitForTimeout(500);

  const regState = await page.evaluate(async () => {
    const reg = await navigator.serviceWorker.ready;
    return { active: !!reg.active, scope: reg.scope, state: reg.active ? reg.active.state : null };
  });
  expect(regState.active).toBe(true);
  expect(regState.state).toBe("activated");

  const cacheContents = await page.evaluate(async () => {
    const names = await caches.keys();
    const out: Record<string, string[]> = {};
    for (const n of names) {
      const c = await caches.open(n);
      const keys = await c.keys();
      out[n] = keys.map((k) => new URL(k.url).pathname);
    }
    return out;
  });
  const cacheNames = Object.keys(cacheContents);
  expect(cacheNames.length).toBeGreaterThan(0);
  const allCachedPaths = cacheNames.flatMap((n) => cacheContents[n]);
  expect(allCachedPaths.some((p) => p.endsWith("index.html") || p === "/")).toBe(true);

  const manifestLink = await page.evaluate(() => {
    const l = document.querySelector("link[rel=manifest]");
    return l ? l.getAttribute("href") : null;
  });
  expect(manifestLink).toBeTruthy();

  await context.setOffline(true);
  await page.reload();
  await page.waitForTimeout(800);
  const bodyLen = await page.evaluate(() => document.body.innerHTML.length);
  const title = await page.title();
  await context.setOffline(false);

  expect(bodyLen).toBeGreaterThan(1000);
  expect(title.length).toBeGreaterThan(0);
  expect(errs).toEqual([]);
});

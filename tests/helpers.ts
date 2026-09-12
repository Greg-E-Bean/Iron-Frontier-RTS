import type { Page } from "@playwright/test";

export interface SkirmishSlot {
  fac: string;
  team: number;
  color: string;
  spawn: number;
  diff: string;
}

export interface SkirmishOptions {
  fac?: string;
  map?: string;
  fog?: "on" | "off";
  slots?: SkirmishSlot[];
}

/**
 * Configures cfg and calls the real startGame() - the same path a player's
 * skirmish setup screen drives - rather than poking at S directly, so
 * these tests exercise genuine game-start behavior (map gen, spawn
 * placement, AI player setup, ...).
 */
export async function startSkirmish(page: Page, opts: SkirmishOptions = {}) {
  const {
    fac = "allied",
    map = "basin",
    fog = "off",
    slots = [{ fac: "soviet", team: 2, color: "def", spawn: 1, diff: "normal" }],
  } = opts;
  await page.evaluate(
    ({ fac, map, fog, slots }) => {
      const w = window as any;
      w.cfg.fac = fac;
      w.cfg.map = map;
      w.cfg.fog = fog;
      w.cfg.slots = slots;
      w.S.running = false;
      w.startGame();
    },
    { fac, map, fog, slots }
  );
}

/** Collects window.onerror-level page errors for the duration of a test. */
export function collectPageErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  return errors;
}

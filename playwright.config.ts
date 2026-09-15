import { defineConfig, devices } from "@playwright/test";

// The regression suite talks to the game entirely through its own public
// API (S, cfg, startGame(), step(), addUnit(), ...) via page.evaluate() -
// it drives real game logic, not DOM clicks - so a single project with a
// real (software-rendered) WebGL context is enough; no need for a matrix
// of browsers/devices here.
export default defineConfig({
  testDir: "./tests",
  // Several tests drive hundreds of real sim ticks and/or full WebGL/WebAudio
  // work through a software (swiftshader) renderer - under constrained CPU
  // (shared CI runners, sandboxes), running them concurrently starves each
  // other rather than actually going faster. Running serially trades a
  // couple of minutes of wall-clock time for reliability, which matters more
  // for a CI gate than raw speed on a 12-test suite.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  timeout: 120_000,
  use: {
    baseURL: "http://localhost:8970",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: {
          // Software WebGL + no-gesture audio autoplay, needed for the 3D
          // renderer and the audio tests to run headless.
          args: [
            "--use-gl=swiftshader",
            "--enable-webgl",
            "--ignore-gpu-blacklist",
            "--autoplay-policy=no-user-gesture-required",
          ],
          // Optional escape hatch for sandboxes/dev machines with a
          // pre-installed Chromium at a fixed path instead of Playwright's
          // own managed browser download (unset in normal use/CI).
          executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined,
        },
      },
    },
  ],
  webServer: {
    command: "node scripts/serve.mjs",
    url: "http://localhost:8970/index.html",
    reuseExistingServer: !process.env.CI,
    env: { PORT: "8970" },
  },
});

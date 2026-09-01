// Bundles src/main.js (an ES module) into a single IIFE and splices it into
// src/index.template.html in place of the "<script>/* BUNDLE:main */</script>"
// marker, writing the result to index.html at the repo root.
//
// index.html stays a directly-playable, zero-build artifact for players —
// this script is a dev-time convenience for editing src/*.js instead of the
// single giant inline <script> block. See README.md's "Developing" section.

import * as esbuild from "esbuild";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const entry = path.join(root, "src/main.js");
const templatePath = path.join(root, "src/index.template.html");
const outPath = path.join(root, "index.html");
const MARKER = "<script>/* BUNDLE:main */</script>";

async function writeOutput(bundledJs) {
  const template = await readFile(templatePath, "utf8");
  if (!template.includes(MARKER)) {
    throw new Error(`Marker not found in ${templatePath}: ${MARKER}`);
  }
  const html = template.replace(MARKER, `<script>\n${bundledJs}\n</script>`);
  await writeFile(outPath, html);
  console.log(`Built ${path.relative(root, outPath)} (${html.length} bytes)`);
}

const buildOptions = {
  entryPoints: [entry],
  bundle: true,
  format: "iife",
  target: "es2020",
  write: false,
};

const watch = process.argv.includes("--watch");

if (watch) {
  const ctx = await esbuild.context({
    ...buildOptions,
    plugins: [
      {
        name: "write-index-html",
        setup(build) {
          build.onEnd(async (result) => {
            if (result.errors.length) return;
            const js = result.outputFiles[0].text;
            await writeOutput(js);
            console.log("Rebuilt on change.");
          });
        },
      },
    ],
  });
  await ctx.watch();
  console.log("Watching src/ for changes (Ctrl+C to stop)...");
} else {
  const result = await esbuild.build(buildOptions);
  await writeOutput(result.outputFiles[0].text);
  await esbuild.stop?.();
}

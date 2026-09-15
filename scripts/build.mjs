// Bundles each src/<name>.ts module (an independent TypeScript source, one
// per extracted subsystem) into its own IIFE, and splices each into
// src/index.template.html in place of its "<script>/* BUNDLE:<name> */</script>"
// marker, writing the result to index.html at the repo root. esbuild strips
// the TypeScript types as part of bundling; run `npm run typecheck` (tsc
// --noEmit) separately to actually check them.
//
// index.html stays a directly-playable, zero-build artifact for players —
// this script is a dev-time convenience for editing src/*.ts instead of the
// single giant inline <script> block. See README.md's "Developing" section.
//
// Modules are auto-discovered from the markers present in the template, so
// adding a new src/<name>.ts + a matching marker is all a future
// extraction needs — no list to maintain here.

import * as esbuild from "esbuild";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const templatePath = path.join(root, "src/index.template.html");
const outPath = path.join(root, "index.html");
const MARKER_RE = /<script>\/\* BUNDLE:(\w+) \*\/<\/script>/g;

async function findModules() {
  const template = await readFile(templatePath, "utf8");
  const modules = [...template.matchAll(MARKER_RE)].map((m) => ({
    name: m[1],
    marker: m[0],
    entry: path.join(root, `src/${m[1]}.ts`),
  }));
  if (!modules.length) {
    throw new Error(`No BUNDLE markers found in ${templatePath}`);
  }
  return { template, modules };
}

async function buildOnce() {
  const { template, modules } = await findModules();
  let html = template;
  for (const mod of modules) {
    const result = await esbuild.build({
      entryPoints: [mod.entry],
      bundle: true,
      format: "iife",
      target: "es2020",
      write: false,
    });
    const js = result.outputFiles[0].text;
    if (!html.includes(mod.marker)) {
      throw new Error(`Marker for "${mod.name}" not found after previous replacements`);
    }
    // Use a function replacer, not a string one: a plain string argument to
    // replace() treats "$&", "$'", "$`", "$$", "$1" etc. as special patterns,
    // and bundled game code can easily contain "$'" (e.g. `>$'+someValue`)
    // by coincidence, silently truncating/corrupting the splice.
    html = html.replace(mod.marker, () => `<script>\n${js}\n</script>`);
  }
  await writeFile(outPath, html);
  console.log(`Built ${path.relative(root, outPath)} (${html.length} bytes, ${modules.length} module(s): ${modules.map((m) => m.name).join(", ")})`);
}

const watch = process.argv.includes("--watch");

if (!watch) {
  await buildOnce();
} else {
  const { modules } = await findModules();
  const ctxs = await Promise.all(
    modules.map((mod) =>
      esbuild.context({
        entryPoints: [mod.entry],
        bundle: true,
        format: "iife",
        target: "es2020",
        write: false,
        plugins: [
          {
            name: "rebuild-index-html",
            setup(build) {
              build.onEnd(async (result) => {
                if (result.errors.length) return;
                await buildOnce();
                console.log(`Rebuilt (${mod.name} changed).`);
              });
            },
          },
        ],
      })
    )
  );
  await buildOnce();
  await Promise.all(ctxs.map((ctx) => ctx.watch()));
  console.log(`Watching src/ for changes (${modules.map((m) => m.name).join(", ")}) — Ctrl+C to stop...`);
}

// GTA VI trophy guide & tracker — entry point (Node 22, standard library only).
//
// What this file does, in one breath: it takes the static site in app/ and the
// screenshots in screenshots/, copies both into the output directory the grader
// reads (/output, or MAKEFUN_OUTPUT_DIR when set), and writes dossier.json there
// with the vendored make.fun helper. The site itself is plain static files —
// index.html + app.js + style.css + data/trophies.json — no build step, no
// network at runtime. The dossier is the summary the judge reads: which files
// the first load touches, how big they are, and the screenshots.
//
// vendor/makefun-frontend.ts stays exactly as vendored: the scorer requires
// dossier.json to be byte for byte what its own copy of the helper writes, so
// nothing in this file second-guesses the helper's output — it only hands the
// helper the right directory and the scorer's caps.
//
// Run it locally with:  mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Serve the result with: node serve.ts   (then open http://localhost:8080)

import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// The directory this file lives in, and where the grader wants the entry.
const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The scorer's caps, from the kit's gate: only text_max_bytes shapes the byte
// budget; the rest refuse an entry the scorer would refuse anyway (more than 4
// screenshots or one over 256 KiB; more than 993 entries in app/ or 48 MiB of
// app files, counted beside /output's own 1000-entry cap).
const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
};

function copyTree(source, target) {
  if (!existsSync(source)) return 0;
  cpSync(source, target, { recursive: true });
  return readdirSync(source).length;
}

// Fail loudly before copying anything if the site is incomplete: a missing
// index, script, stylesheet or trophy list would ship a broken entry, and
// the grader would rather see a failed build than a half-copied one.
const REQUIRED_APP_FILES = ['index.html', 'app.js', 'style.css', join('data', 'trophies.json')];
for (const rel of REQUIRED_APP_FILES) {
  if (!existsSync(join(repoRoot, 'app', rel))) {
    throw new Error(`gta6-trophy-guide: missing required file app/${rel}`);
  }
}

mkdirSync(outputDir, { recursive: true });

const appEntries = copyTree(join(repoRoot, 'app'), join(outputDir, 'app'));
const shotEntries = copyTree(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'));

writeFileSync(join(outputDir, 'dossier.json'), buildDossier(outputDir, DOSSIER_CAPS));

console.log(`gta6-trophy-guide: copied ${appEntries} app entries and ${shotEntries} screenshots to ${outputDir}`);

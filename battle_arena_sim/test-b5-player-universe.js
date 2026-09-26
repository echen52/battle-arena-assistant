// ── test-b5-player-universe.js ────────────────────────────────────────────
// B5: the gate on the player-side open universe. Runs
// arena-solver/tools/player-universe.mjs and asserts:
//
//   1. ZERO silent asymmetries -- every dex move gives the same answer with the
//      sides swapped, across the tool's four positions. (The detector itself was
//      checked by injecting three one-sided bugs; each was flagged.)
//   2. The census throws EXACTLY the recorded moves, each with its named cause.
//      A new throw is a regression; a move leaving the list is progress, and
//      this list is updated in the same commit.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } };

// Every one of these is named and ledgered: Assist and Beat Up by amendment
// 12; Metronome through its draw pool (it throws on Conversion); the nine
// Metronome-only effects amendment 12 left unported (Hidden Power has since
// left the list: amendment 16); Sketch and Snatch, which
// no opponent set carries and which B5 records rather than ports.
const EXPECTED_THROWS = {
  "Assist": "effect:EFFECT_ASSIST",
  "Beat Up": "effect:EFFECT_BEAT_UP",
  "Camouflage": "effect:EFFECT_CAMOUFLAGE",
  "Charge": "effect:EFFECT_CHARGE",
  "Conversion": "effect:EFFECT_CONVERSION",
  "Conversion 2": "effect:EFFECT_CONVERSION_2",
  "False Swipe": "effect:EFFECT_FALSE_SWIPE",
  "Metronome": "effect:EFFECT_CONVERSION",
  "Nature Power": "effect:EFFECT_NATURE_POWER",
  "Sketch": "effect:EFFECT_SKETCH",
  "Snatch": "effect:EFFECT_SNATCH",
  "Vital Throw": "effect:EFFECT_VITAL_THROW",
  "Weather Ball": "effect:EFFECT_WEATHER_BALL",
};

const tool = path.resolve("../../arena-solver/tools/player-universe.mjs");
const tsv = path.join(os.tmpdir(), `player-universe-${process.pid}.tsv`);
let out = "", code = 0;
try { out = execFileSync("node", ["--max-old-space-size=8192", tool, "--tsv", tsv], { encoding: "utf8" }); }
catch (e) { out = e.stdout ?? ""; code = e.status; }
console.log(out.split("\n").slice(0, 6).join("\n"));

ok(code === 0 && /SILENT ASYMMETRY\s+:\s+0\b/.test(out), "zero silent asymmetries (tool exit 0)");
const rows = fs.readFileSync(tsv, "utf8").trim().split(/\r?\n/).map((l) => l.split("\t"));
fs.unlinkSync(tsv);
const threw = Object.fromEntries(rows.filter((r) => r[2] === "throws").map((r) => [r[0], r[4]]));
for (const [m, c] of Object.entries(EXPECTED_THROWS)) ok(threw[m] === c, `${m} throws loudly with ${c} (got ${threw[m] ?? "no throw"})`);
for (const m of Object.keys(threw)) ok(m in EXPECTED_THROWS, `${m} throws (${threw[m]}) and is not on the recorded list -- a regression, or record it`);
ok(rows.length === 353, `the probe covers all 353 selectable dex moves (got ${rows.length})`);

console.log();
console.log(failures === 0 ? "ALL PASS -- B5 player universe gate green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

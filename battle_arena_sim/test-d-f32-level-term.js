// ── test-d-f32-level-term.js ──────────────────────────────────────────────────
// Phase D finding F32.
//
// F32  CalculateBaseDamage's `2 * attacker->level / 5` is integer division
//      (src/pokemon.c:3246); a float made any level that is not a multiple of
//      5 hit harder (Lv27 Tropius, emulator traces/00258 and neighbours).
import { execFileSync } from "node:child_process";
import { buildMon, buildStartState, resolveTurn, calcDamage } from "./logic.js";

const TOOLS = "C:/Users/azncu/Desktop/pokemon_code/arena-solver/tools/";
const EMU = "C:/Users/azncu/Desktop/pokemon_code/arena-solver/emu/";
let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } else console.log("  ok   " + m); };
const mk = (species, moves, over = {}) => buildMon({
  species, level: 50, nature: "Hardy", evs: {}, ability: "Pressure", item: null, moves, friendship: 255, ...over,
});
const psum = (bs) => bs.reduce((a, b) => a + b.p, 0);
const hpOf = (b, mon, key) => Math.round((b.state[key] / 100) * mon.stats.hp);


console.log("-- F32: the level term is integer --");
{
  const lo = buildMon({ species: "Tropius", level: 27, nature: "Hardy", evs: {}, ability: "Chlorophyll", item: null, moves: ["Stomp"], friendship: 255 });
  // Blissey (neutral, no STAB for Stomp): big enough numbers that the float
  // term (12.8) and the integer one (12) land on different damage -- into
  // Donphan both give 7, which is why the first version of this probe passed
  // on the float engine too.
  const d = mk("Blissey", ["Harden"], { ability: "Natural Cure" });
  const got = calcDamage(lo, d, "Stomp", { rollFrac: 1 });
  const base = Math.floor(Math.floor((Math.floor((2 * 27) / 5) + 2) * 65 * lo.stats.atk / d.stats.def) / 50) + 2;
  const floatTerm = Math.floor(Math.floor(((2 * 27) / 5 + 2) * 65 * lo.stats.atk / d.stats.def) / 50) + 2;
  ok(floatTerm !== base, `the probe discriminates: the float term would give ${floatTerm}`);
  ok(got === base, `Lv27 Stomp = floor(12 * ...) + 2 = ${base} (got ${got})`);
}

console.log("-- the emulator's traces --");
{
  const traces = ["traces/battle-00258.json", "traces/battle-00322.json", "traces/battle-00119.json"];
  let out = "", code = 0;
  try { out = execFileSync("node", [TOOLS + "diff-emu.mjs", ...traces.map((t) => EMU + t)], { cwd: TOOLS, encoding: "utf8" }); }
  catch (e) { out = String(e.stdout); code = e.status; }
  ok(code === 0, `exact replay: ${(out.match(/divergences \d+/g) || []).join(", ")}`);
}

console.log();
console.log(failures === 0 ? "ALL PASS -- F32 level term green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

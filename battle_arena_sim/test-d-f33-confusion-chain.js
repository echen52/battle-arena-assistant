// ── test-d-f33-confusion-chain.js ─────────────────────────────────────────────
// Phase D finding F33.
//
// F33  confusion's two non-self-hit outcomes push the cursor back into the
//      attackcanceler, whose tracker is already past CANCELER_CONFUSED
//      (src/battle_util.c:2166-2186; the tracker is reset only per action, :92): paralysis and love ARE rolled next
//      (emulator: traces/00395, traces-given/01104).
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


console.log("-- F33: a confused, paralysed mon can be fully paralysed --");
{
  const a = mk("Suicune", ["Surf"], { ability: "Pressure" });
  const d = mk("Snorlax", ["Harden"], { ability: "Thick Fat" });
  const st = buildStartState({ you: a, opp: d, overrides: { youStatus: "paralysis", youConfused: true, youConfusionTurns: 3 } });
  const br = resolveTurn({ you: a, opp: d }, st, "Surf", "Harden");
  const para = psum(br.filter((b) => /You is fully paralyzed/.test(b.label)));
  const self = psum(br.filter((b) => /You hits itself/.test(b.label)));
  ok(para > 0 && Math.abs(para - (1 - self) * 0.25) < 1e-9, `P(full para) = P(no self-hit) x 1/4 (${para.toFixed(4)} = ${((1 - self) * 0.25).toFixed(4)})`);
}

console.log("-- the emulator's traces --");
{
  const traces = ["traces/battle-00395.json", "traces-given/battle-01104.json"];
  let out = "", code = 0;
  try { out = execFileSync("node", [TOOLS + "diff-emu.mjs", ...traces.map((t) => EMU + t)], { cwd: TOOLS, encoding: "utf8" }); }
  catch (e) { out = String(e.stdout); code = e.status; }
  ok(code === 0, `exact replay: ${(out.match(/divergences \d+/g) || []).join(", ")}`);
}

console.log();
console.log(failures === 0 ? "ALL PASS -- F33 canceler chain green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

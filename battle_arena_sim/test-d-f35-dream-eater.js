// ── test-d-f35-dream-eater.js ─────────────────────────────────────────────────
// Phase D finding F35.
//
// F35  Dream Eater into an awake or substituted target goes to
//      BattleScript_WasntAffected, which sets no result flag: Skill +1
//      (emulator: traces-given/00510).
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


console.log("-- F35: Dream Eater into an awake target scores +1 --");
{
  const g = mk("Gardevoir", ["Dream Eater"], { ability: "Trace" });
  const a = mk("Arcanine", ["Harden"], { ability: "Flash Fire" });
  const br = resolveTurn({ you: a, opp: g }, buildStartState({ you: a, opp: g }), "Harden", "Dream Eater");
  ok(br.every((b) => b.state.skillOpp === 1 && b.state.yourHpPct === 100), `no damage, +1 (${[...new Set(br.map((b) => b.state.skillOpp))]})`);
}

console.log("-- the emulator's traces --");
{
  const traces = ["traces-given/battle-00510.json"];
  let out = "", code = 0;
  try { out = execFileSync("node", [TOOLS + "diff-emu.mjs", ...traces.map((t) => EMU + t)], { cwd: TOOLS, encoding: "utf8" }); }
  catch (e) { out = String(e.stdout); code = e.status; }
  ok(code === 0, `exact replay: ${(out.match(/divergences \d+/g) || []).join(", ")}`);
}

console.log();
console.log(failures === 0 ? "ALL PASS -- F35 Dream Eater green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

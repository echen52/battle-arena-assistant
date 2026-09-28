// ── test-d-f34-wish-order.js ──────────────────────────────────────────────────
// Phase D finding F34.
//
// F34  Wish is a FIELD end-turn step (src/battle_util.c:1168-1178), before
//      every battler residual (src/battle_main.c:3963-3966); the engine healed
//      after the poison tick (emulator: traces/00182).
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


console.log("-- F34: Wish before the residuals --");
{
  const e = mk("Espeon", ["Wish"], { ability: "Synchronize" });
  const d = mk("Snorlax", ["Harden"], { ability: "Thick Fat" });
  // full HP, badly poisoned, Wish landing this turn end: the heal does nothing, the tick does
  const st = buildStartState({ you: e, opp: d, overrides: { youStatus: "poison", youToxicCounter: 0, youWishTurns: 1 } });
  const br = resolveTurn({ you: e, opp: d }, st, "Wish", "Harden").filter((b) => b.state.youWishTurns != null || true);
  const tick = Math.max(1, Math.floor(e.stats.hp / 16));
  ok(br.every((b) => hpOf(b, e, "yourHpPct") === e.stats.hp - tick), `full HP: the Wish heals nothing, the Toxic tick takes ${tick} (${[...new Set(br.map((b) => hpOf(b, e, "yourHpPct")))]})`);
}

console.log("-- the emulator's traces --");
{
  const traces = ["traces/battle-00182.json"];
  let out = "", code = 0;
  try { out = execFileSync("node", [TOOLS + "diff-emu.mjs", ...traces.map((t) => EMU + t)], { cwd: TOOLS, encoding: "utf8" }); }
  catch (e) { out = String(e.stdout); code = e.status; }
  ok(code === 0, `exact replay: ${(out.match(/divergences \d+/g) || []).join(", ")}`);
}

console.log();
console.log(failures === 0 ? "ALL PASS -- F34 Wish order green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

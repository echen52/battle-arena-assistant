// ── test-d-f42-struggle-typeless.js ───────────────────────────────────────
// Phase D finding F42: Struggle skips the type step.
//
// Cmd_typecalc returns at once for MOVE_STRUGGLE (src/battle_script_commands.c:
// 1360-1364): no STAB, no type chart -- it hits a Ghost -- and no flags;
// CheckWonderGuardAndLevitate returns at once too (:1432), so Wonder Guard does
// not stop it. MOVEEND_CHOICE_MOVE never locks it (:4299). The engine ran it as
// a plain 50-power Normal move (typed, STAB, Ghost-immune, Wonder Guard-
// blocked). Reachable: Trick hands the player a Choice Band and the locked
// move is then Disabled (B2b batch 11's fallback, 23 cells).
// Found by the emulator once the harness recorded Struggle at all (harness
// fault, fixed with this class): traces-given/00117 (Snorlax's Struggle, no
// STAB), traces/00389 (Metagross's Struggle into Duskull).
import { execFileSync } from "node:child_process";
import { buildMon, buildStartState, applyMove, calcDamage, skillDelta } from "./logic.js";

const TOOLS = "C:/Users/azncu/Desktop/pokemon_code/arena-solver/tools/";
const EMU = "C:/Users/azncu/Desktop/pokemon_code/arena-solver/emu/";
let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } else console.log("  ok   " + m); };
const mk = (species, moves, over = {}) => buildMon({
  species, level: 50, nature: "Hardy", evs: {}, ability: "Pressure", item: null, moves, friendship: 255, ...over,
});
const struggle = (you, opp, overrides = {}) => {
  const s = buildStartState({ you, opp, overrides });
  const b4 = { hp: s.oppHpPct, skill: s.skillYou };
  applyMove({ you, opp }, s, "you", "Struggle", true, false);
  return { s, dealt: Math.round(((b4.hp - s.oppHpPct) / 100) * opp.stats.hp), d: s.skillYou - b4.skill };
};

console.log("-- F42: no type chart --");
{
  const r = struggle(mk("Metagross", ["Struggle"], { ability: "Clear Body" }), mk("Duskull", ["Night Shade"], { ability: "Levitate" }));
  ok(r.dealt > 0 && r.d === skillDelta("landed"), `into a Ghost it hits (${r.dealt} damage), +1 (${r.d})`);
}
{
  const r = struggle(mk("Snorlax", ["Struggle"], { ability: "Thick Fat" }), mk("Golem", ["Rest"], { ability: "Sturdy" }));
  ok(r.d === skillDelta("landed"), `into a Rock it takes no not-very-effective flag: +1 (${r.d})`);
}
console.log("-- F42: no STAB --");
{
  const sn = mk("Snorlax", ["Struggle"], { ability: "Thick Fat" }), tgt = mk("Snorlax", ["Rest"], { ability: "Thick Fat" });
  const r = struggle(sn, tgt);
  const want = calcDamage(sn, tgt, "Struggle", { untyped: true });
  ok(r.dealt === want, `a Normal user's Struggle is CalculateBaseDamage alone: ${r.dealt} (want ${want})`);
}
console.log("-- F42: Wonder Guard does not stop it --");
{
  const r = struggle(mk("Metagross", ["Struggle"], { ability: "Clear Body" }), mk("Shedinja", ["Rest"], { ability: "Wonder Guard" }));
  ok(r.s.oppHpPct === 0, `Shedinja faints (${r.s.oppHpPct})`);
}
console.log("-- F42: Struggle sets no Choice lock --");
{
  const cb = mk("Snorlax", ["Struggle"], { ability: "Thick Fat", item: "Choice Band" });
  const r = struggle(cb, mk("Snorlax", ["Rest"], { ability: "Thick Fat" }));
  ok(r.s.youChoiceLock == null, `no lock after Struggle (${r.s.youChoiceLock})`);
}

console.log("-- the emulator's traces --");
{
  const traces = ["traces-given/battle-00117.json", "traces/battle-00389.json"];
  let out = "", code = 0;
  try { out = execFileSync("node", [TOOLS + "diff-emu.mjs", ...traces.map((t) => EMU + t)], { cwd: TOOLS, encoding: "utf8" }); }
  catch (e) { out = String(e.stdout); code = e.status; }
  ok(code === 0, `exact replay: ${(out.match(/divergences \d+/g) || []).join(", ")}`);
}

console.log();
console.log(failures === 0 ? "ALL PASS -- F42 Struggle typeless green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

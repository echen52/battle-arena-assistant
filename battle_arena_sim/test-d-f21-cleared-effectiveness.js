// ── test-d-f21-cleared-effectiveness.js ───────────────────────────────────
// Phase D finding F21: fixed-damage scripts clear the effectiveness flags.
//
// Seven battle scripts run `bicbyte gMoveResultFlags, MOVE_RESULT_SUPER_
// EFFECTIVE | MOVE_RESULT_NOT_VERY_EFFECTIVE` after typecalc, so
// BattleArena_AddSkillPoints (src/battle_arena.c:588-621) never sees SE / NVE
// for them: a landed hit is +1. The engine applied that to Bide's unleash only;
// Seismic Toss into a Normal type scored +2 (emulator: traces-given/01044).
// The set is DERIVED here from data/battle_scripts_1.s (amendment 10): each
// script label holding the bicbyte, mapped to its effect through
// gBattleScriptsForMoveEffects; BattleScript_BideAttack is reached from
// BattleScript_EffectBide, not the table.
import fs from "node:fs";
import { buildMon, buildStartState, resolveTurn, EFFECTIVENESS_CLEARED_EFFECTS } from "./logic.js";

const SRC = "C:/Users/azncu/Desktop/pokemon_code/pokeemerald/data/battle_scripts_1.s";
let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } else console.log("  ok   " + m); };

const lines = fs.readFileSync(SRC, "utf8").split(/\r?\n/);
const labelsWithClear = new Set();
let label = null;
for (const l of lines) {
  const m = l.match(/^(BattleScript_\w+)::/);
  if (m) label = m[1];
  if (/bicbyte gMoveResultFlags, MOVE_RESULT_SUPER_EFFECTIVE \| MOVE_RESULT_NOT_VERY_EFFECTIVE/.test(l)) labelsWithClear.add(label);
}
const effectOf = new Map();
for (const l of lines) {
  const m = l.match(/^\s*\.4byte (BattleScript_\w+)\s*@ (EFFECT_\w+)/);
  if (m) effectOf.set(m[1], m[2]);
}
const derived = new Set();
for (const lab of labelsWithClear) {
  if (effectOf.has(lab)) derived.add(effectOf.get(lab));
  else if (lab === "BattleScript_BideAttack") derived.add("EFFECT_BIDE");
  else derived.add(`UNMAPPED ${lab}`);
}
const a = [...derived].sort(), b = [...EFFECTIVENESS_CLEARED_EFFECTS].sort();
ok(JSON.stringify(a) === JSON.stringify(b), `the engine's set equals the scripts' (${a.join(", ")})`);

const mk = (species, moves, over = {}) => buildMon({
  species, level: 50, nature: "Hardy", evs: {}, ability: "Thick Fat", item: null, moves, friendship: 255, ...over,
});
const sn = mk("Snorlax", ["Curse"]);
const ab = mk("Machamp", ["Seismic Toss"], { ability: "Guts" });
const br = resolveTurn({ you: sn, opp: ab }, buildStartState({ you: sn, opp: ab }), "Curse", "Seismic Toss").filter((x) => x.state.yourHpPct < 100);
ok(br.length > 0 && br.every((x) => x.state.skillOpp === 1), `Seismic Toss into Snorlax (Fighting x2): +1, not +2 (${[...new Set(br.map((x) => x.state.skillOpp))]})`);
const ge = mk("Gengar", ["Curse"], { ability: "Levitate" });
const g = resolveTurn({ you: ge, opp: ab }, buildStartState({ you: ge, opp: ab }), "Curse", "Seismic Toss");
ok(g.every((x) => x.state.skillOpp === -2), `into a Ghost it is still no effect, -2 (${[...new Set(g.map((x) => x.state.skillOpp))]})`);

console.log();
console.log(failures === 0 ? "ALL PASS -- F21 cleared effectiveness green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

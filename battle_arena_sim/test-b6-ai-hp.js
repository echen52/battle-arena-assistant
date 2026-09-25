// ── test-b6-ai-hp.js ──────────────────────────────────────────────────────
// B6-1b: the AI reads HP as source's `(u32)(100 * hp / maxHP)` -- a truncated
// INTEGER percentage (Cmd_if_hp_less_than and siblings,
// src/battle_ai_script_commands.c:713-780), not the engine's float.
//
// Probe: Leer's viability (AI_CV_DefenseDown) takes -2 when the TARGET is at
// `<= 70`%. A player on a whole HP that reads 70.x% is 70 to the ROM, so the
// AI must score Leer exactly as it does at 69.x% (also <= 70) and differently
// from 71.x% (> 70).
import { buildMon, buildStartState, chooseOpponentMoves } from "./logic.js";

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } };

const you = buildMon({ species: "Snorlax", level: 50, nature: "Hardy", evs: { hp: 252 }, ability: "Thick Fat", item: null, moves: ["Splash"], friendship: 255 });
const opp = buildMon({ species: "Gyarados", level: 50, nature: "Hardy", evs: {}, ability: "Intimidate", item: null, moves: ["Leer", "Tackle"], friendship: 255 });
const M = you.stats.hp;
// the whole HPs whose percentage falls in (69,70), (70,71) and (71,72)
const hpIn = (lo) => { for (let h = 1; h <= M; h++) { const p = (100 * h) / M; if (p > lo && p < lo + 1) return h; } return null; };
// The 70 probe sits in (70.5, 71): truncation reads 70, ROUNDING would read 71
// -- so the probe tells the two apart as well as float from integer.
const hpInBand = (lo, hi) => { for (let h = 1; h <= M; h++) { const p = (100 * h) / M; if (p > lo && p < hi) return h; } return null; };
const h69 = hpIn(69), h70 = hpInBand(70.5, 71), h71 = hpIn(71);
ok(h69 && h70 && h71, `(probe check) whole HPs in each band exist for max HP ${M}: ${h69}, ${h70}, ${h71}`);
const dist = (h) => {
  const st = buildStartState({ you, opp, overrides: { yourHpPct: (h * 100) / M } });
  return JSON.stringify(chooseOpponentMoves(opp, you, st).map((c) => [c.move, +c.prob.toFixed(12)]));
};
const d69 = dist(h69), d70 = dist(h70), d71 = dist(h71);
console.log(`   ${h69}/${M} -> ${d69}\n   ${h70}/${M} -> ${d70}\n   ${h71}/${M} -> ${d71}`);
ok(d69 !== d71, "(probe check) the <= 70 threshold changes the AI's choice");
ok(d70 === d69, `at ${((100 * h70) / M).toFixed(3)}% the AI sees 70 -- scored as <= 70, like 69.x`);
ok(d70 !== d71, "...and not like 71.x");

console.log();
console.log(failures === 0 ? "ALL PASS -- B6-1b AI HP truncation characterization green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

// ── test-d-f5-shedinja-hp.js ──────────────────────────────────────────────
// Phase D finding F5: Shedinja's max HP is 1, whatever its base stat, IVs, EVs
// or level -- CalculateMonStats special-cases the species
// (src/pokemon.c:2845-2852: `if (species == SPECIES_SHEDINJA) newMaxHP = 1`).
// The engine used the ordinary formula (94 at Lv50 for the Frontier set).
//
// Found by the emulator differential once the harness could create leads:
// "enemy Shedinja: hp 94 vs 1" (traces-given/battle-00001).
import { buildMon, buildStartState, resolveTurn } from "./logic.js";

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } else console.log("  ok   " + m); };

for (const [level, evs] of [[50, {}], [50, { hp: 252 }], [100, { hp: 252 }], [5, {}]]) {
  const m = buildMon({ species: "Shedinja", level, nature: "Adamant", evs, ability: "Wonder Guard", item: null, moves: ["Shadow Ball"], friendship: 255 });
  ok(m.stats.hp === 1, `Shedinja Lv${level} ${JSON.stringify(evs)}: max HP 1 (got ${m.stats.hp})`);
}
// Its other stats are the ordinary formula (unchanged): Lv50 Adamant 0 EVs Atk.
const s = buildMon({ species: "Shedinja", level: 50, nature: "Adamant", evs: {}, ability: "Wonder Guard", item: null, moves: ["Shadow Ball"], friendship: 255 });
ok(s.stats.atk === Math.floor((Math.floor((2 * 90 + 31) * 50 / 100) + 5) * 1.1), `Atk is the ordinary formula (got ${s.stats.atk})`);
// Nincada (its pre-evolution) is NOT special-cased.
const n = buildMon({ species: "Nincada", level: 50, nature: "Hardy", evs: {}, ability: "Compound Eyes", item: null, moves: ["Scratch"], friendship: 255 });
ok(n.stats.hp > 1, `Nincada keeps the formula (got ${n.stats.hp})`);
// One super-effective hit of any size faints it.
const you = buildMon({ species: "Houndoom", level: 50, nature: "Hardy", evs: {}, ability: "Flash Fire", item: null, moves: ["Ember"], friendship: 255 });
const br = resolveTurn({ you, opp: s }, buildStartState({ you, opp: s }), "Ember", "Shadow Ball");
const hitBranches = br.filter((b) => b.state.oppHpPct < 100);
ok(hitBranches.length > 0 && hitBranches.every((b) => b.state.oppHpPct === 0), `an Ember that lands faints it (${hitBranches.length} hit branches)`);

console.log();
console.log(failures === 0 ? "ALL PASS -- F5 Shedinja HP green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

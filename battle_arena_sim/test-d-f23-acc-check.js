// ── test-d-f23-acc-check.js ───────────────────────────────────────────────
// Phase D finding F23: a move into a semi-invulnerable target misses at
// accuracycheck -- AccuracyCalcHelper for ACC_CURR_MOVE and the NO_ACC_CALC
// branch alike (src/battle_script_commands.c:1054-1111). The engine gated that
// on the move having power, so Sweet Scent / Confuse Ray / Thunder Wave landed
// on a flying or digging target (emulator: traces/00118, 00376,
// traces-given/00642). The gate reads acc-check.js, generated from the scripts
// (arena-solver/tools/gen-acc-check.mjs).
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { buildMon, buildStartState, resolveTurn } from "./logic.js";

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } else console.log("  ok   " + m); };
const mk = (species, moves, over = {}) => buildMon({
  species, level: 50, nature: "Hardy", evs: {}, ability: "Keen Eye", item: null, moves, friendship: 255, ...over,
});
const J = JSON.stringify;


console.log("-- F23: the table is the generator's --");
{
  const before = fs.readFileSync("./acc-check.js", "utf8");
  execFileSync("node", ["C:/Users/azncu/Desktop/pokemon_code/arena-solver/tools/gen-acc-check.mjs"], { encoding: "utf8" });
  ok(fs.readFileSync("./acc-check.js", "utf8") === before, "acc-check.js regenerates byte for byte");
}

console.log("-- F23: status moves into Fly --");
{
  // the status user is FASTER (so it acts before the strike) and has no
  // contact-punishing ability, so any change on the flyer can only be its move
  for (const [atk, move, ab] of [["Crobat", "Sweet Scent", "Inner Focus"], ["Crobat", "Confuse Ray", "Inner Focus"], ["Electrode", "Thunder Wave", "Soundproof"]]) {
    const pid = mk("Pidgeot", ["Fly"]);
    const foe = mk(atk, [move], { ability: ab });
    const st = buildStartState({ you: foe, opp: pid, overrides: { oppCharging: { move: "Fly", invulnBit: "onair" } } });
    const br = resolveTurn({ you: foe, opp: pid }, st, move, "Fly");
    const youFirst = br.filter((b) => b.label.startsWith("You"));
    const landed = br.filter((b) => b.state.oppConfused || b.state.oppStatus === "paralysis" || b.state.oppStages.evasion < 0);
    ok(youFirst.length > 0 && landed.length === 0, `${move} into a flying target misses (${youFirst.length} branches with the status move first, ${landed.length} landed)`);
    ok(br.every((b) => b.state.skillYou === -2), `and scores the miss, -2 (${[...new Set(br.map((b) => b.state.skillYou))]})`);
  }
  // the control: Thunder hits a flying target (INVULN_BYPASS), a self-boost is untouched
  const pid2 = mk("Pidgeot", ["Fly"]);
  const zap = mk("Zapdos", ["Thunder", "Agility"], { ability: "Pressure" });
  const st2 = buildStartState({ you: pid2, opp: zap, overrides: { youCharging: { move: "Fly", invulnBit: "onair" } } });
  ok(resolveTurn({ you: pid2, opp: zap }, st2, "Fly", "Agility").every((b) => b.state.oppStages.spe === 2), "Agility (no accuracycheck) still works");
}

console.log();
console.log(failures === 0 ? "ALL PASS -- F23 accuracycheck gate green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

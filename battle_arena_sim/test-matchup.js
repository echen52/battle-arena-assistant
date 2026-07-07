import { analyzeMatchup, printTree } from "./logic.js";

const metagrossConfig = {
  species: "Metagross",
  level: 50,
  nature: "Adamant",
  evs: { atk: 252, spd: 4, spe: 252 },
  ability: "Clear Body",
  item: "Cheri Berry",
  moves: ["Meteor Mash", "Earthquake", "Shadow Ball", "Explosion"],
};

const umbreon4Config = {
  species: "Umbreon",
  level: 50,
  nature: "Bold",
  evs: { hp: 170, def: 170, spd: 170 },
  ability: "Synchronize",
  item: "Leftovers",
  moves: ["Confuse Ray", "Toxic", "Faint Attack", "Double Team"],
};

console.log("── Regression test: fresh 100%/100% (should match prior validated run) ──");
const fresh = analyzeMatchup(metagrossConfig, umbreon4Config);
console.log("Metagross stats:", fresh.you.stats);
console.log("Umbreon stats:  ", fresh.opp.stats);
console.log();
for (const opt of fresh.result.allOptions) {
  console.log(`  ${opt.move.padEnd(14)} P(win) = ${opt.winProb.toFixed(3)}`);
}
console.log(`Recommended: ${fresh.result.move} (P(win)=${fresh.result.winProb.toFixed(3)})`);

// Baseline as of the latest engine state. This number has legitimately moved
// several times as real gaps got fixed — most recently, target evasion was
// never factored into incoming accuracy at all: 100%-base-accuracy moves
// were treated as literally unmissable regardless of how much evasion the
// target had stacked via Double Team. Now that a raised evasion stage
// genuinely reduces effective accuracy (real Gen III mechanic, separate
// stage table from the main stat stages), reliable-but-unspectacular moves
// lose some of their edge over higher-damage options. Not the original
// early-session value, which predates many rounds of real bug fixes.
const EXPECTED_MOVE = "Meteor Mash";
const EXPECTED_WINPROB = 0.919;
const pass = fresh.result.move === EXPECTED_MOVE &&
  Math.abs(fresh.result.winProb - EXPECTED_WINPROB) < 0.001;
console.log();
console.log(pass ? "✅ PASS — matches prior validated result" : "❌ FAIL — refactor changed the answer, investigate");

console.log();
console.log("── New capability: same matchup, but Metagross already at 60% HP ──");
console.log("   (simulating: Metagross won its first 1v1 and carries damage forward,");
console.log("    while this Umbreon is the opponent's fresh next mon)");
const carried = analyzeMatchup(metagrossConfig, umbreon4Config, { yourHpPct: 60, oppHpPct: 100 });
for (const opt of carried.result.allOptions) {
  console.log(`  ${opt.move.padEnd(14)} P(win) = ${opt.winProb.toFixed(3)}`);
}
console.log(`Recommended: ${carried.result.move} (P(win)=${carried.result.winProb.toFixed(3)})`);

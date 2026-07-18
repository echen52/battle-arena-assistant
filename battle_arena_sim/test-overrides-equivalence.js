// Equivalence test for buildStartState's new `overrides` path.
//
// This is the load-bearing check: walks a real matchup's pre-computed tree
// one turn deep to a genuine branch, captures that branch's ACTUAL .state,
// then constructs an INDEPENDENT state via the new overrides path using the
// same observable values, and asserts search() produces IDENTICAL results
// from both. If they diverge, the overrides path is missing or misreading a
// field somewhere — this test exists to catch exactly that, not to be
// rationalized away.

import { analyzeMatchup, buildStartState, search } from "./logic.js";

const metagross = { species: "Metagross", level: 50, nature: "Adamant", evs: { atk: 252, spd: 4, spe: 252 }, ability: "Clear Body", item: "Cheri Berry", moves: ["Meteor Mash", "Earthquake", "Shadow Ball", "Explosion"] };
const umbreon = { species: "Umbreon", level: 50, nature: "Bold", evs: { hp: 170, def: 170, spd: 170 }, ability: "Synchronize", item: "Leftovers", moves: ["Confuse Ray", "Toxic", "Faint Attack", "Double Team"] };

console.log("── Overrides equivalence test: Metagross vs Umbreon 4, turn-1 branch -> turn-2 solve ──\n");

const r = analyzeMatchup(metagross, umbreon);
const you = r.you, opp = r.opp;
const ctx = { you, opp };

// Find a REAL, non-trivial branch (something actually happened this turn —
// not the "nothing changed" trivial case, so the test is actually exercising
// stages/status/HP, not just defaults matching defaults).
const recommended = r.result.allOptions.find((o) => o.move === r.result.move);
const realBranch = recommended.branches.find((b) => b.state.yourHpPct < 100 || b.state.oppHpPct < 100 || b.state.oppStatus != null || b.state.youStages.atk !== 0);

if (!realBranch) throw new Error("Test setup failure: no non-trivial branch found in turn 1.");

const branchState = realBranch.state;
console.log("Real branch captured, p=" + realBranch.prob.toFixed(6));
console.log("  yourHpPct=" + branchState.yourHpPct + " oppHpPct=" + branchState.oppHpPct);
console.log("  oppStatus=" + branchState.oppStatus + " youStages=" + JSON.stringify(branchState.youStages));
console.log("  mindYou=" + branchState.mindYou + " mindOpp=" + branchState.mindOpp + " skillYou=" + branchState.skillYou + " skillOpp=" + branchState.skillOpp);
console.log("  turn=" + branchState.turn + " weatherType=" + branchState.weatherType + " weatherTurns=" + branchState.weatherTurns);

// Construct an INDEPENDENT state via the new overrides path, using only the
// OBSERVABLE values from the real branch (not copying the object itself —
// that would trivially "pass" without exercising the overrides mechanism).
const overrideState = buildStartState({
  yourHpPct: branchState.yourHpPct,
  oppHpPct: branchState.oppHpPct,
  // Engine change #4: yourHpPctAtStart/oppHpPctAtStart default SILENTLY to
  // yourHpPct/oppHpPct when omitted (logic.js's buildStartState doc comment)
  // — correct for a fresh round, WRONG here, where branchState.yourHpPct/
  // oppHpPct are already a turn-1-damaged OBSERVATION, not the match's true
  // start. Without these two lines this test fails not because the engine
  // is wrong, but because THIS reconstruction silently invents a false
  // round-start baseline from the damaged snapshot — exactly the caller
  // responsibility the fix's contract documents. Must be threaded through
  // like every other field below, not left to the default.
  yourHpPctAtStart: branchState.yourHpPctAtStart,
  oppHpPctAtStart: branchState.oppHpPctAtStart,
  yourUsablePartyMons: branchState.yourUsablePartyMons,
  oppUsablePartyMons: branchState.oppUsablePartyMons,
  you, opp,
  overrides: {
    turn: branchState.turn,
    youStages: { ...branchState.youStages },
    oppStages: { ...branchState.oppStages },
    youStatus: branchState.youStatus,
    oppStatus: branchState.oppStatus,
    mindYou: branchState.mindYou, mindOpp: branchState.mindOpp,
    skillYou: branchState.skillYou, skillOpp: branchState.skillOpp,
    weatherType: branchState.weatherType,
    weatherTurns: branchState.weatherTurns,
    youReflectTurns: branchState.youReflectTurns, oppReflectTurns: branchState.oppReflectTurns,
    youLightScreenTurns: branchState.youLightScreenTurns, oppLightScreenTurns: branchState.oppLightScreenTurns,
    youSleepTurns: branchState.youSleepTurns, oppSleepTurns: branchState.oppSleepTurns,
    youSubstituteHP: branchState.youSubstituteHP, oppSubstituteHP: branchState.oppSubstituteHP,
    youLastMove: branchState.youLastMove, oppLastMove: branchState.oppLastMove,
  },
});

const solveFromBranch = search(ctx, branchState, 2);
const solveFromOverride = search(ctx, overrideState, 2);

console.log("\nsearch(ctx, branch.state, 2):    move=" + solveFromBranch.move + "  winProb=" + solveFromBranch.winProb);
console.log("search(ctx, override_state, 2):  move=" + solveFromOverride.move + "  winProb=" + solveFromOverride.winProb);

const identicalMove = solveFromBranch.move === solveFromOverride.move;
const identicalWinProb = solveFromBranch.winProb === solveFromOverride.winProb;
// Deep-equality check on the full result tree (both should be IDENTICAL
// objects, not just equal at the top): stringify since these are plain
// nested objects with no functions/cycles.
const identicalTree = JSON.stringify(solveFromBranch) === JSON.stringify(solveFromOverride);

console.log("\nMove identical:     " + identicalMove);
console.log("winProb identical:  " + identicalWinProb + " (" + solveFromBranch.winProb + " === " + solveFromOverride.winProb + ")");
console.log("Full tree identical (JSON deep-equal): " + identicalTree);

const pass = identicalMove && identicalWinProb && identicalTree;
console.log("\n" + (pass ? "✅ PASS — overrides path produces byte-identical results to the real branch state" : "❌ FAIL — overrides path diverges from real engine state"));
if (!pass) process.exit(1);

// ── test-scorekeeper-equivalence.js ─────────────────────────────────────────
// MAPPING GUARD for the DRIVE-model scorekeeper (scorekeeper.js).
//
// The widget now IS the engine's scoring — it drives the real `resolveTurn` and
// reads the banked score. So "widget arithmetic == engine arithmetic" is true by
// construction and no longer worth asserting. What remains verifiable — and is
// the only widget-side logic left — is the report -> (state + branch-fragment)
// MAPPING: does each reported outcome reach a branch whose banked score is
// UNAMBIGUOUS?
//
// CORE ASSERTION — value-agreement (the exact guard scoreSide uses at runtime):
// for each §1 outcome type, filtering on the reported-outcome fragment yields a
// distinct scored-side value set of size 1. `scoreReportedTurn` throws if not,
// so a case that returns at all has already proven agreement; we additionally
// print matched.length per side (diagnostic — NOT required to be 1). One case
// (Shadow Ball) deliberately drives a secondary-effect move to exercise
// matched.length > 1 with agreement — the production path a strict count could
// not express.

import { buildMon } from "./logic.js";
import { scoreReportedTurn, OUTCOME, PHASE } from "./scorekeeper.js";

const you = (moves, evs = { atk: 252, spe: 252 }) =>
  buildMon({ species: "Metagross", level: 50, nature: "Adamant", evs, ability: "Clear Body", item: "None", moves });
const opp = (species, ability) =>
  buildMon({ species, level: 50, nature: "Hardy", ability, item: "None", moves: ["Tackle"] });

// Each case names one §1 outcome and the observable report that drives it. The
// benign opponent side (Tackle, HIT) is fixed so we isolate the You-side mapping;
// the reciprocal opp-side mapping is symmetric (same scoreSide code path).
const benignOpp = { move: "Tackle", outcome: OUTCOME.HIT };

function makeCases() {
  const cs = [];
  const add = (label, youMon, oppMon, youReport) => cs.push({ label, youMon, oppMon, youReport });

  add("neutral hit  (EQ vs Umbreon/Dark 1x)", you(["Earthquake"]), opp("Umbreon", "Synchronize"),
      { move: "Earthquake", outcome: OUTCOME.HIT });
  add("resisted hit (Shadow Ball vs Umbreon/Dark 0.5x)  [SECONDARY move: matched>1 expected]",
      you(["Shadow Ball"], { spa: 252, spe: 252 }), opp("Umbreon", "Synchronize"),
      { move: "Shadow Ball", outcome: OUTCOME.HIT });
  add("super hit    (EQ vs Raikou/Electric 2x)", you(["Earthquake"]), opp("Raikou", "Pressure"),
      { move: "Earthquake", outcome: OUTCOME.HIT });
  add("miss         (Meteor Mash misses)", you(["Meteor Mash"]), opp("Umbreon", "Synchronize"),
      { move: "Meteor Mash", outcome: OUTCOME.MISSED });
  add("Protect-block (foe Protected)", you(["Meteor Mash"]), opp("Umbreon", "Synchronize"),
      { move: "Meteor Mash", outcome: OUTCOME.PROTECT });
  add("ability-block -2 (Levitate vs Ground)", you(["Earthquake"]), opp("Latios", "Levitate"),
      { move: "Earthquake", outcome: OUTCOME.HIT });
  add("ability-block -5 (Volt Absorb vs Electric)", you(["Thunderbolt"], { spa: 252, spe: 252 }),
      opp("Umbreon", "Volt Absorb"), { move: "Thunderbolt", outcome: OUTCOME.HIT });
  add("two-turn CHARGE (Dive submerged)", you(["Dive"]), opp("Umbreon", "Synchronize"),
      { move: "Dive", outcome: OUTCOME.HIT, phase: PHASE.CHARGE });
  add("two-turn ATTACK (Dive surfaced)", you(["Dive"]), opp("Umbreon", "Synchronize"),
      { move: "Dive", outcome: OUTCOME.HIT, phase: PHASE.ATTACK });
  add("prevented turn (full-para)", you(["Meteor Mash"]), opp("Umbreon", "Synchronize"),
      { move: "Meteor Mash", outcome: OUTCOME.IMMOBILIZED });
  add("Fake Out     (hit)", you(["Fake Out"]), opp("Umbreon", "Synchronize"),
      { move: "Fake Out", outcome: OUTCOME.HIT });

  return cs;
}

let pass = 0, fail = 0;
console.log("── Scorekeeper mapping guard: value-agreement per reported outcome ──\n");
for (const c of makeCases()) {
  try {
    const r = scoreReportedTurn(c.youMon, c.oppMon, { you: c.youReport, opp: benignOpp });
    // Reaching here means scoreSide's value-agreement guard passed (distinct
    // scored-side value set size 1) for the You side; else it would have thrown.
    pass++;
    console.log(`✅ ${c.label}`);
    console.log(`     You {mind:${r.dMindYou}, skill:${r.dSkillYou}}   matched.length: You=${r.matchedYou}, Opp=${r.matchedOpp}`);
  } catch (e) {
    fail++;
    console.log(`❌ ${c.label}`);
    console.log(`     ${e.message.split("\n")[0]}`);
  }
}

console.log(`\n${fail === 0 ? "✅ ALL AGREE" : "❌ " + fail + " AMBIGUOUS/ERROR"} — ${pass}/${pass + fail} cases.`);
console.log("(matched.length is diagnostic; value-agreement — not a count of 1 — is the asserted invariant.)");
process.exit(fail === 0 ? 0 : 1);

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

import { buildMon, skillDelta } from "./logic.js";
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
  // `extra` carries optional assertions beyond the default "value-agreement holds
  // (scoreReportedTurn did not throw)": `expect` pins the banked You Skill (Mind
  // asserted 0), `expectThrow` requires a throw whose message matches, and
  // `requireFoeFaster` enforces the heal filler-guard precondition (see below).
  const add = (label, youMon, oppMon, youReport, extra = {}) => cs.push({ label, youMon, oppMon, youReport, ...extra });

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

  // ── HP-dependent heal: the "Did it heal?" report bit (drive-and-read). The
  // banked Skill is READ off the branch — healed == skillDelta("landed"),
  // failed == skillDelta("noEffect") — NOT hardcoded, so these expectations are
  // computed from the engine's own scoring, not literal numbers.
  //
  // FILLER GUARD (the load-bearing reason these cases exist): the heal path must
  // drive with the NON-damaging Harden filler. A damaging filler drops the
  // actor below full before the heal resolves at HP 100, so the heal SUCCEEDS on
  // the foe's hit branch (+1) and FAILS on its miss branch (-2) — a [+1,-2]
  // disagreement that makes scoreReportedTurn throw. That only happens when the
  // foe moves FIRST, so the healer is built deliberately SLOWER than the foe
  // (Metagross with no Spe EV, Spe 90, vs Jolteon). Result: the FAILED case
  // below throws — and this test fails — the instant HEAL_FILLER_MOVE is swapped
  // back to a damaging move. `requireFoeFaster` pins that speed precondition so
  // the guard can never silently rot (e.g. if someone re-EVs the mons).
  const slowHealer = () => you(["Recover"], { atk: 252, spd: 4 }); // no Spe EV -> Spe 90
  const fastFoe = () => opp("Jolteon", "Volt Absorb");            // Spe outruns the healer
  add("heal HEALED  (Recover sub-full -> +1 == skillDelta 'landed')", slowHealer(), fastFoe(),
      { move: "Recover", outcome: OUTCOME.HIT, healed: true },
      { expect: skillDelta("landed"), requireFoeFaster: true });
  add("heal FAILED  (Recover full HP -> -2 == skillDelta 'noEffect')  [FILLER GUARD]", slowHealer(), fastFoe(),
      { move: "Recover", outcome: OUTCOME.HIT, healed: false },
      { expect: skillDelta("noEffect"), requireFoeFaster: true });
  add("heal UNMODELED (Wish still fails loud, distinguishing message)", you(["Wish"]), opp("Umbreon", "Synchronize"),
      { move: "Wish", outcome: OUTCOME.HIT, healed: true },
      { expectThrow: /no engine executor|stockpile-gated|NOT the HP-dependent-heal/ });

  return cs;
}

let pass = 0, fail = 0;
console.log("── Scorekeeper mapping guard: value-agreement per reported outcome ──\n");
for (const c of makeCases()) {
  // Cases that MUST throw (unmodeled Swallow/Wish): a clean run is the failure.
  if (c.expectThrow) {
    try {
      scoreReportedTurn(c.youMon, c.oppMon, { you: c.youReport, opp: benignOpp });
      fail++;
      console.log(`❌ ${c.label}`);
      console.log(`     expected a throw (unmodeled heal), but it scored cleanly`);
    } catch (e) {
      if (c.expectThrow.test(e.message)) {
        pass++;
        console.log(`✅ ${c.label}`);
        console.log(`     throws as required: ${e.message.split(" — ")[0].slice(0, 78)}…`);
      } else {
        fail++;
        console.log(`❌ ${c.label}`);
        console.log(`     threw, but message did not match the distinguishing text: ${e.message.split("\n")[0]}`);
      }
    }
    continue;
  }
  // Filler-guard precondition: a heal case can only catch a damaging-filler
  // regression if the foe outspeeds the healer (see makeCases). Enforce it so
  // the guard cannot be quietly defanged by re-EVing the mons.
  if (c.requireFoeFaster && !(c.oppMon.stats.spe > c.youMon.stats.spe)) {
    fail++;
    console.log(`❌ ${c.label}`);
    console.log(`     PRECONDITION broken: foe Spe ${c.oppMon.stats.spe} !> healer Spe ${c.youMon.stats.spe} — filler guard would be toothless`);
    continue;
  }
  try {
    const r = scoreReportedTurn(c.youMon, c.oppMon, { you: c.youReport, opp: benignOpp });
    // Reaching here means scoreSide's value-agreement guard passed (distinct
    // scored-side value set size 1) for the You side; else it would have thrown.
    if (c.expect !== undefined && (r.dSkillYou !== c.expect || r.dMindYou !== 0)) {
      fail++;
      console.log(`❌ ${c.label}`);
      console.log(`     expected {mind:0, skill:${c.expect}} (read off the branch), got {mind:${r.dMindYou}, skill:${r.dSkillYou}}`);
      continue;
    }
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

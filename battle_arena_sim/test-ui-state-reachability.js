// Reachability test for the UI -> engine observation boundary (buildOverrides).
//
// The bug this exists to catch: buildOverrides (site/ui-logic.js) is a
// hand-maintained ALLOWLIST standing in front of buildStartState's GENERIC
// merge (logic.js:2131-2137), which was explicitly designed to need no
// allowlist (HANDOFF.md:1190-1193 — "every existing field, and any future one,
// is override-able for free"). Any observed field the UI collects but forgets
// to re-list in buildOverrides is silently dropped at this boundary and
// no-ops. Today that is mindYou/mindOpp/skillYou/skillOpp — set on matchState
// by recalculate() (app.js) but absent from buildOverrides' allowlist.
//
// TWO parts, both expected to FAIL against current code, both to PASS once the
// allowlist becomes a denylist:
//   PART 1 (structural): every key the UI can set on matchState, minus the
//     explicitly-excluded UI/transient keys, must survive buildOverrides ->
//     buildStartState onto the resulting engine state.
//   PART 2 (production path): a real solve() with banked Mind/Skill entered via
//     matchState must honor that lead. Metagross vs Snorlax 2 at turn 3 with a
//     banked Mind/Skill lead should recommend Meteor Mash @ 1.000; against
//     current code the lead is dropped and it returns Earthquake instead.

import { freshMatchState, buildOverrides, solve, resolveOpponentBySetName } from "../site/ui-logic.js";
import { buildMon, buildStartState } from "./logic.js";

const metagross = { species: "Metagross", level: 50, nature: "Adamant", evs: { atk: 252, spd: 4, spe: 252 }, ability: "Clear Body", item: "Cheri Berry", moves: ["Meteor Mash", "Earthquake", "Shadow Ball", "Explosion"] };
const umbreon4 = { species: "Umbreon", level: 50, nature: "Bold", evs: { hp: 170, def: 170, spd: 170 }, ability: "Synchronize", item: "Leftovers", moves: ["Confuse Ray", "Toxic", "Faint Attack", "Double Team"] };

// The four keys recalculate() bolts onto matchState AFTER buildMatchState() but
// which freshMatchState() does not yet declare. Listed here explicitly so this
// test sees them as part of the real observation set even before the fix folds
// them into freshMatchState. This is exactly the set the boundary drops today.
const BOLTED_ON_KEYS = ["mindYou", "mindOpp", "skillYou", "skillOpp"];

// Keys that are deliberately NOT part of the observation contract and must NOT
// be asserted reachable:
//   - Group B transient scratch keys (youDamageTaken/youEndureActive/
//     youProtected/youDestinyBondActive/youCharging + opp mirrors): reset
//     per-turn inside resolveTurn, meaningless as observations. They are absent
//     from matchState entirely, so they never appear in the loop below — listed
//     here only as documentation of intent.
//   - yourHpPctAtStart/oppHpPctAtStart: real engine inputs, but the UI has no
//     field to source a round-start HP distinct from current HP (KNOWN GAP,
//     logic.js:2055-2061). Out of scope here — the scorekeeper's job.
const UI_ONLY_KEYS = new Set([
  "youDamageTaken", "oppDamageTaken",
  "youEndureActive", "oppEndureActive",
  "youProtected", "oppProtected",
  "youDestinyBondActive", "oppDestinyBondActive",
  "youCharging", "oppCharging",
  "yourHpPctAtStart", "oppHpPctAtStart",
]);

const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
let allPass = true;

// ── PART 1: structural reachability ──────────────────────────────────────
console.log("── PART 1: every observed matchState key survives buildOverrides -> buildStartState ──\n");
{
  const you = buildMon(metagross);
  const opp = buildMon({ ...umbreon4, friendship: 255 });

  // A matchState with a distinctive, non-default sentinel on EVERY observed
  // field, so a dropped key is caught as a value mismatch (not two defaults
  // coincidentally agreeing).
  const ms = freshMatchState();
  ms.turn = 3;
  ms.yourHpPct = 61; ms.oppHpPct = 47;
  ms.yourUsablePartyMons = 1; ms.oppUsablePartyMons = 1;
  ms.youStages = { atk: 2, def: -1, spa: 0, spd: 0, spe: 3, evasion: 0, accuracy: 0 };
  ms.oppStages = { atk: 0, def: 0, spa: 1, spd: -2, spe: 0, evasion: 0, accuracy: -1 };
  ms.youStatus = "burn"; ms.oppStatus = "poison";
  ms.metagrossConfused = true; ms.youAttracted = true;
  ms.weatherType = "rain"; ms.weatherTurns = 4;
  ms.youReflectTurns = 5; ms.oppReflectTurns = 3;
  ms.youLightScreenTurns = 5; ms.oppLightScreenTurns = 3;
  ms.mindYou = 4; ms.mindOpp = 2; ms.skillYou = 3; ms.skillOpp = 1;

  // Reproduce solve()'s exact boundary construction (ui-logic.js:74-81):
  // HP/party go as top-level params, everything else via buildOverrides.
  const overrides = buildOverrides(ms);
  const state = buildStartState({
    yourHpPct: ms.yourHpPct, oppHpPct: ms.oppHpPct,
    yourUsablePartyMons: ms.yourUsablePartyMons, oppUsablePartyMons: ms.oppUsablePartyMons,
    you, opp, overrides,
  });

  const observedKeys = [...new Set([...Object.keys(ms), ...BOLTED_ON_KEYS])].filter((k) => !UI_ONLY_KEYS.has(k));
  const dropped = [];
  for (const key of observedKeys) {
    if (!eq(state[key], ms[key])) dropped.push({ key, expected: ms[key], got: state[key] });
  }

  if (dropped.length === 0) {
    console.log("✅ PART 1 PASS — every observed key reached the engine state.");
  } else {
    console.log(`❌ PART 1 FAIL — ${dropped.length} observed key(s) dropped at the boundary:`);
    for (const d of dropped) {
      console.log(`   ${d.key.padEnd(12)} expected ${JSON.stringify(d.expected)}  got ${JSON.stringify(d.got)}`);
    }
    allPass = false;
  }
}

// ── PART 2: production path (real solve) ─────────────────────────────────
console.log("\n── PART 2: banked Mind/Skill entered via matchState reaches solve() ──\n");
{
  const opp = resolveOpponentBySetName("Snorlax 2", "Immunity");
  const ms = freshMatchState();
  ms.turn = 3;
  ms.mindYou = 5; ms.skillYou = 5; ms.mindOpp = 0; ms.skillOpp = 0;

  const { result } = solve(metagross, opp, ms);
  console.log("Metagross vs Snorlax 2, turn 3, HP 100/100, banked Mind 5 / Skill 5 (You):");
  for (const o of result.allOptions) console.log(`   ${o.move.padEnd(12)} P(win) = ${o.winProb.toFixed(4)}`);
  console.log(`Recommended: ${result.move} @ ${result.winProb.toFixed(4)}`);

  const pass2 = result.move === "Meteor Mash" && Math.abs(result.winProb - 1.0) < 1e-9;
  if (pass2) {
    console.log("✅ PART 2 PASS — banked lead honored, Meteor Mash @ 1.000.");
  } else {
    console.log(`❌ PART 2 FAIL — expected Meteor Mash @ 1.0000, got ${result.move} @ ${result.winProb.toFixed(4)} (banked lead dropped at the boundary).`);
    allPass = false;
  }
}

console.log("\n" + (allPass ? "✅ ALL PASS" : "❌ FAILURES PRESENT — expected before the boundary fix lands."));
if (!allPass) process.exit(1);

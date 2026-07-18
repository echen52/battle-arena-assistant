// Reachability + contract test for the UI -> engine state boundary.
//
// SCOPE LESSON (why this file was re-scoped): "in buildStartState's base" is NOT
// the same predicate as "user-observable input." An earlier version of PART 1
// asserted all 30 non-transient base keys were UI-reachable — wrong scope.
// Being non-transient does NOT make a key a user input. The right axis is
// whether the engine READS the key's construction-time value:
//   - 6 keys are genuine v1 user inputs the UI must reach (USER_INPUT_KEYS_V1).
//   - 24 keys are ALSO inputs (the engine reads each at construction — cited
//     read sites below), but UI v1 does not yet express them (DEFERRED_INPUT_KEYS).
//     They are a KNOWN GAP, not "derived" and not "correctly excluded":
//     defaulting one produces a wrong solve for any matchup where it is non-default.
//   - 0 keys are engine-derived (write-only during resolveTurn). None.
//
// PART 1  — the 6 v1 inputs must be UI-reachable (fails until #12/#13 land).
// PART 1b — the 24 deferred inputs must be seeded to their documented defaults by
//           buildStartState (a true mechanical check regardless of the UI gap; a
//           mismatch is a real engine-default bug, not a UI question).
// PART 2  — production-path proof for one v1 input (round-start HP): the Body
//           baseline collapses today because AtStart is unreachable.

import { freshMatchState, buildOverrides, solve, resolveOpponentBySetName } from "../site/ui-logic.js";
import { buildMon, buildStartState, search } from "./logic.js";

const metagross = { species: "Metagross", level: 50, nature: "Adamant", evs: { atk: 252, spd: 4, spe: 252 }, ability: "Clear Body", item: "Cheri Berry", moves: ["Meteor Mash", "Earthquake", "Shadow Ball", "Explosion"] };
const umbreon4 = { species: "Umbreon", level: 50, nature: "Bold", evs: { hp: 170, def: 170, spd: 170 }, ability: "Synchronize", item: "Leftovers", moves: ["Confuse Ray", "Toxic", "Faint Attack", "Double Team"] };

// The 6 genuine v1 user inputs, each with a distinctive non-default sentinel.
// yourHpPct/oppHpPct are set below to 60/55 so the AtStart sentinels (80/75)
// differ from current HP — otherwise the round-start collapse (AtStart defaults
// to current HP) would hide behind two equal values.
const USER_INPUT_KEYS_V1 = {
  mindYou: 4, mindOpp: 2, skillYou: 3, skillOpp: 1,
  yourHpPctAtStart: 80, oppHpPctAtStart: 75,
};

// The 24 deferred inputs. Each carries the engine READ site that proves it is an
// input (not derived), its documented construction default, and a severity tier.
// Label for every one: "input the engine reads at construction; UI v1 does not
// yet express it; defaulting it produces a wrong solve for any matchup where it
// is non-default." Ordered highest-value-follow-up first.
const DEFERRED_INPUT_KEYS = [
  // ── Tier 1: directly observable on-screen — defaulting gives visibly wrong advice ──
  { key: "youSeeded",         default: false, read: "applyEndOfTurnEffects:3666, chooseOpponentMoves:1819" }, // Leech Seed drain each end-of-turn
  { key: "oppSeeded",         default: false, read: "applyEndOfTurnEffects:3675, chooseOpponentMoves:1911" },
  { key: "youSubstituteHP",   default: null,  read: "applyMove:3378/3399, chooseOpponentMoves:1883" },        // damage redirects to the sub, not the mon
  { key: "oppSubstituteHP",   default: null,  read: "applyMove:3378/3399" },
  { key: "youCharging",       default: null,  read: "resolveTurn:4173, applyMove:3361, applyEndOfTurnEffects:3603" }, // mid-Fly/Dig FORCES the move choice
  { key: "oppCharging",       default: null,  read: "resolveTurn:4170, applyEndOfTurnEffects:3607" },
  { key: "youIngrained",      default: false, read: "applyEndOfTurnEffects:3616, chooseOpponentMoves:1818" },  // 1/16 heal each end-of-turn
  { key: "oppIngrained",      default: false, read: "applyEndOfTurnEffects:3620" },
  { key: "youSafeguardTurns", default: null,  read: "applyEndOfTurnEffects:3709, chooseOpponentMoves:1900, executor:2719" }, // blocks status infliction
  { key: "oppSafeguardTurns", default: null,  read: "applyEndOfTurnEffects:3710, chooseOpponentMoves:1900" },
  { key: "youSleepTurns",     default: null,  read: "enumerateActionOutcomes:3786, applyMove:3106" },          // how many turns still asleep
  { key: "oppSleepTurns",     default: null,  read: "enumerateActionOutcomes:3786" },
  // ── Tier 2: report-derived — a transition/report flow would set these from the cause-move ──
  { key: "youLastMove",       default: null,  read: "chooseOpponentMoves:1855-1861" },  // AI reads "was I last hit physical/special"
  { key: "oppLastMove",       default: null,  read: "chooseOpponentMoves:1855-1861 (mirror)" },
  { key: "youFlashFireActive",default: false, read: "calcDamage via applyMove:3353" },  // 1.5x own Fire damage
  { key: "oppFlashFireActive",default: false, read: "applyMove:3353" },
  { key: "youProtectUses",    default: 0,     read: "enumerateActionOutcomes:3873, chooseOpponentMoves:1909" },// Protect/Endure success decay
  { key: "oppProtectUses",    default: 0,     read: "enumerateActionOutcomes:3873, chooseOpponentMoves:1909" },
  { key: "youBerryConsumed",  default: false, read: "tryCureWithBerry:2299" },          // one-time cure berry already used
  { key: "oppBerryConsumed",  default: false, read: "tryCureWithBerry:2299" },
  { key: "youYawnTurns",      default: null,  read: "applyEndOfTurnEffects:3732" },      // drowsy countdown -> sleep
  { key: "oppYawnTurns",      default: null,  read: "applyEndOfTurnEffects:3742" },
  { key: "youPerishSonged",   default: false, read: "chooseOpponentMoves:1904, executor:2913" },
  { key: "oppPerishSonged",   default: false, read: "chooseOpponentMoves:1904, executor:2914" },
];

let allPass = true;

// ── PART 1: the 6 v1 user inputs must be UI-reachable ────────────────────
console.log("── PART 1: the 6 v1 user inputs reach the engine through buildOverrides ──\n");
{
  const you = buildMon(metagross);
  const opp = buildMon({ ...umbreon4, friendship: 255 });

  // matchState carrying the 6 sentinels, built and threaded EXACTLY as solve()
  // does (ui-logic.js:74-81): HP/party top-level, everything else via buildOverrides.
  const ms = { ...freshMatchState(), yourHpPct: 60, oppHpPct: 55, ...USER_INPUT_KEYS_V1 };
  const overrides = buildOverrides(ms);
  const state = buildStartState({
    yourHpPct: ms.yourHpPct, oppHpPct: ms.oppHpPct,
    yourUsablePartyMons: ms.yourUsablePartyMons, oppUsablePartyMons: ms.oppUsablePartyMons,
    you, opp, overrides,
  });

  const unreachable = [];
  for (const [k, want] of Object.entries(USER_INPUT_KEYS_V1)) {
    if (state[k] !== want) unreachable.push({ k, want, got: state[k] });
  }

  if (unreachable.length === 0) {
    console.log("✅ PART 1 PASS — all 6 v1 user inputs reach the engine.");
  } else {
    console.log(`❌ PART 1 FAIL — ${unreachable.length}/6 v1 user input(s) unreachable (expected until #12/#13 land):`);
    for (const u of unreachable) console.log(`   ${u.k.padEnd(18)} want ${JSON.stringify(u.want).padEnd(6)} got ${JSON.stringify(u.got)}`);
    allPass = false;
  }
}

// ── PART 1b: the 24 deferred inputs are seeded to documented defaults ─────
console.log("\n── PART 1b: engine seeds the 24 deferred inputs to their documented defaults ──\n");
{
  const you = buildMon(metagross);
  const opp = buildMon({ ...umbreon4, friendship: 255 });
  const base = buildStartState({ you, opp });

  const badDefaults = [];
  for (const d of DEFERRED_INPUT_KEYS) {
    if (base[d.key] !== d.default) badDefaults.push({ ...d, got: base[d.key] });
  }

  if (badDefaults.length === 0) {
    console.log(`✅ PART 1b PASS — all ${DEFERRED_INPUT_KEYS.length} deferred inputs seeded to documented defaults.`);
    console.log(`   (These are inputs, not derived state — each has a construction read site above. Known UI gap.)`);
  } else {
    console.log(`❌ PART 1b FAIL — ${badDefaults.length} deferred input(s) NOT at documented default — REAL ENGINE-DEFAULT BUG:`);
    for (const b of badDefaults) console.log(`   ${b.key.padEnd(18)} expected default ${JSON.stringify(b.default)} got ${JSON.stringify(b.got)}  [read: ${b.read}]`);
    allPass = false;
  }
}

// ── PART 2: production-path proof for round-start HP (one v1 input) ───────
console.log("\n── PART 2: round-start HP unreachable -> Body baseline collapses on the real solve() path ──\n");
{
  const opp = resolveOpponentBySetName("Umbreon 4", "Synchronize");
  const ms = freshMatchState();
  ms.turn = 3; ms.yourHpPct = 60; ms.oppHpPct = 100;
  ms.yourHpPctAtStart = 80; // the round-start field the coach now fills in (#13), carried by the denylist

  const uiResult = solve(metagross, opp, ms).result; // UI path: now honors start = 80

  const you = buildMon(metagross);
  const oppMon = buildMon({ ...opp, friendship: 255 });
  const trueState = buildStartState({
    yourHpPct: 60, yourHpPctAtStart: 80, oppHpPct: 100, oppHpPctAtStart: 100,
    you, opp: oppMon, overrides: { turn: 3 },
  });
  const trueResult = search({ you, opp: oppMon }, trueState, 1); // engine truth: start = 80

  console.log(`Metagross entered @80%, now @60%, vs fresh Umbreon 4, turn 3:`);
  console.log(`  UI path   (round-start 80 honored): your Body = ${Math.floor((60 / 80) * 100)}   -> ${uiResult.move} @ ${uiResult.winProb.toFixed(4)}`);
  console.log(`  Engine truth (start = 80):          your Body = ${Math.floor((60 / 80) * 100)}   -> ${trueResult.move} @ ${trueResult.winProb.toFixed(4)}`);

  if (uiResult.move === trueResult.move && Math.abs(uiResult.winProb - trueResult.winProb) < 1e-9) {
    console.log("✅ PART 2 PASS — UI path matches engine truth (round-start baseline honored).");
  } else {
    console.log(`❌ PART 2 FAIL — round-start baseline unreachable, Body mis-scored (expected until #13 lands).`);
    allPass = false;
  }
}

console.log("\n" + (allPass ? "✅ ALL PASS" : "❌ FAILURES PRESENT — expected pre-rebuild (PART 1 + PART 2); PART 1b must be green."));
if (!allPass) process.exit(1);

// Reachability test for the UI -> engine observation boundary (buildOverrides).
//
// UPGRADED (this pass): PART 1 now enumerates against buildStartState's BASE
// SHAPE — the keys the ENGINE accepts — not freshMatchState's declared keys.
// The #12-era test only checked keys the UI already declared, so it could never
// see a base key the UI cannot express at all. This one can: it asserts every
// non-transient, non-derived engine base key is reachable from the UI through
// the real buildOverrides boundary. A dropped/unreachable key is a severed
// engine input — a hole in the state contract.
//
// PART 2: production-path proof that the Body baseline is currently collapsed —
// a mon entering a round below full has no way to tell the engine its true
// round-start HP, so the Body ratio degrades to current/current = 100.

import { freshMatchState, buildOverrides, solve, resolveOpponentBySetName } from "../site/ui-logic.js";
import { buildMon, buildStartState, search, evaluateTerminal } from "./logic.js";

const metagross = { species: "Metagross", level: 50, nature: "Adamant", evs: { atk: 252, spd: 4, spe: 252 }, ability: "Clear Body", item: "Cheri Berry", moves: ["Meteor Mash", "Earthquake", "Shadow Ball", "Explosion"] };
const umbreon4 = { species: "Umbreon", level: 50, nature: "Bold", evs: { hp: 170, def: 170, spd: 170 }, ability: "Synchronize", item: "Leftovers", moves: ["Confuse Ray", "Toxic", "Faint Attack", "Double Team"] };

// Keys reset EVERY turn by freshTurnDamageTracking (logic.js:2145-2150) — scratch
// state, meaningless as a starting observation. The ONLY legitimately-unreachable
// base keys. Everything else in the base is a real starting observation.
const TRANSIENT = new Set([
  "youDamageTaken", "oppDamageTaken",
  "youEndureActive", "oppEndureActive",
  "youProtected", "oppProtected",
  "youDestinyBondActive", "oppDestinyBondActive",
]);

// A sentinel (distinct from the base default) for every non-transient base key,
// so a dropped key shows as a value mismatch rather than two defaults agreeing.
// If the base shape grows a key with no sentinel here, PART 1 flags it loudly
// rather than silently skipping it.
const SENTINELS = {
  turn: 3,
  yourHpPct: 60, oppHpPct: 55,
  yourHpPctAtStart: 80, oppHpPctAtStart: 75,
  weatherType: "rain", weatherTurns: 4,
  yourUsablePartyMons: 1, oppUsablePartyMons: 1,
  metagrossConfused: true, youAttracted: true,
  youStages: { atk: 2, def: -1, spa: 0, spd: 0, spe: 3, evasion: 0, accuracy: 0 },
  oppStages: { atk: 0, def: 0, spa: 1, spd: -2, spe: 0, evasion: 0, accuracy: -1 },
  youStatus: "burn", oppStatus: "poison",
  youSleepTurns: 2, oppSleepTurns: 3,
  youSeeded: true, oppSeeded: true,
  youLastMove: "Tackle", oppLastMove: "Growl",
  youSubstituteHP: 30, oppSubstituteHP: 25,
  youReflectTurns: 5, oppReflectTurns: 3,
  youLightScreenTurns: 5, oppLightScreenTurns: 3,
  youSafeguardTurns: 5, oppSafeguardTurns: 4,
  youIngrained: true, oppIngrained: true,
  youFlashFireActive: true, oppFlashFireActive: true,
  youCharging: { move: "Fly", invulnBit: 1 }, oppCharging: { move: "Dig", invulnBit: 2 },
  youProtectUses: 2, oppProtectUses: 2,
  youBerryConsumed: true, oppBerryConsumed: true,
  youYawnTurns: 3, oppYawnTurns: 2,
  youPerishSonged: true, oppPerishSonged: true,
  mindYou: 4, mindOpp: 2, skillYou: 3, skillOpp: 1,
};

const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
let allPass = true;

// ── PART 1: full base-shape reachability ────────────────────────────────
console.log("── PART 1: every non-transient engine base key reachable from the UI ──\n");
{
  const you = buildMon(metagross);
  const opp = buildMon({ ...umbreon4, friendship: 255 });

  const baseKeys = Object.keys(buildStartState({ you, opp }));
  const testable = baseKeys.filter((k) => !TRANSIENT.has(k));

  // Guard: every non-transient base key must have a sentinel, else the test is
  // silently blind to it.
  const noSentinel = testable.filter((k) => !(k in SENTINELS));
  if (noSentinel.length) {
    console.log(`⚠️  base shape has ${noSentinel.length} non-transient key(s) with no sentinel — test is blind to: ${noSentinel.join(", ")}`);
    allPass = false;
  }

  // A matchState carrying a sentinel for EVERY non-transient base key — i.e. the
  // UI has observed all of them. Reproduce solve()'s exact boundary (ui-logic.js:
  // 74-81): HP/party as top-level params, everything else via buildOverrides.
  const ms = { ...freshMatchState() };
  for (const k of testable) if (k in SENTINELS) ms[k] = SENTINELS[k];

  const overrides = buildOverrides(ms);
  const state = buildStartState({
    yourHpPct: ms.yourHpPct, oppHpPct: ms.oppHpPct,
    yourUsablePartyMons: ms.yourUsablePartyMons, oppUsablePartyMons: ms.oppUsablePartyMons,
    you, opp, overrides,
  });

  const severed = [];
  for (const k of testable) {
    if (!(k in SENTINELS)) continue;
    if (!eq(state[k], SENTINELS[k])) severed.push({ k, want: SENTINELS[k], got: state[k] });
  }

  if (severed.length === 0) {
    console.log(`✅ PART 1 PASS — all ${testable.length} non-transient base keys reachable. Contract closed.`);
  } else {
    console.log(`❌ PART 1 FAIL — ${severed.length} non-transient base key(s) UNREACHABLE from the UI:\n`);
    for (const s of severed) {
      console.log(`   ${s.k.padEnd(20)} want ${JSON.stringify(s.want).padEnd(28)} got ${JSON.stringify(s.got)}`);
    }
    allPass = false;
  }
}

// ── PART 2: Body baseline collapse on the real solve() path ─────────────
console.log("\n── PART 2: round-start HP unreachable -> Body baseline collapses ──\n");
{
  // You enter this round at 80% (won the prior matchup, carried damage), now at
  // 60% after this round's chip. Opponent fresh at 100/100. At turn 3 the next
  // resolve leads to judgment; Body compares floor(current/start*100).
  const opp = resolveOpponentBySetName("Umbreon 4", "Synchronize");
  const ms = freshMatchState();
  ms.turn = 3; ms.yourHpPct = 60; ms.oppHpPct = 100;

  // What the UI can express today: no round-start field, so solve() cannot pass
  // yourHpPctAtStart — it defaults to current (60), Body baseline collapses.
  const uiResult = solve(metagross, opp, ms).result;

  // Engine truth: the SAME observation with the real 80% baseline threaded in.
  const you = buildMon(metagross);
  const oppMon = buildMon({ ...opp, friendship: 255 });
  const trueState = buildStartState({
    yourHpPct: 60, yourHpPctAtStart: 80, oppHpPct: 100, oppHpPctAtStart: 100,
    you, opp: oppMon, overrides: { turn: 3 },
  });
  const trueResult = search({ you, opp: oppMon }, trueState, 1);

  const yourBodyCollapsed = Math.floor((60 / 60) * 100); // = 100
  const yourBodyTrue = Math.floor((60 / 80) * 100);       // = 75
  console.log(`Metagross entered @80%, now @60%, vs fresh Umbreon 4, turn 3:`);
  console.log(`  UI path (start collapses to current 60): your Body = ${yourBodyCollapsed}  -> ${uiResult.move} @ ${uiResult.winProb.toFixed(4)}`);
  console.log(`  Engine truth (start = 80):               your Body = ${yourBodyTrue}   -> ${trueResult.move} @ ${trueResult.winProb.toFixed(4)}`);

  const collapsed = Math.abs(uiResult.winProb - trueResult.winProb) > 1e-9 || uiResult.move !== trueResult.move;
  if (collapsed) {
    console.log(`❌ PART 2 FAIL — UI path diverges from engine truth: the round-start baseline cannot be expressed, so the Body category is mis-scored.`);
    allPass = false;
  } else {
    console.log(`✅ PART 2 PASS — UI path matches engine truth (round-start baseline honored).`);
  }
}

console.log("\n" + (allPass ? "✅ ALL PASS — state contract closed." : "❌ FAILURES PRESENT — severed engine inputs remain."));
if (!allPass) process.exit(1);

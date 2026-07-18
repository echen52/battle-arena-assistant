// Standing test for the Body-category healing-cap baseline (engine change #4).
//
// CLAIM: pokeemerald's Body ratio is (currentHP * 100) / hpAtStart, where
// hpAtStart is the mon's HP at SWITCH-IN for this specific 1v1, not max HP
// (src/battle_arena.c:530-533, baseline set at 569-581). logic.js tracks
// yourHpPct/oppHpPct as % of MAX HP and caps every heal at Math.min(100, ...),
// so it can never represent a round-start deficit being recovered past 100%
// relative to where the round actually began.
//
// This file is the ONLY standing check that reaches this code path — the
// canonical regression anchor, the 552-set sweep, and the existing carry-
// forward tests all start every round at a fixed HP with no heal source on
// the sub-100% side, so none of them can ever exercise this divergence (see
// HANDOFF.md's change-#4 blast-radius analysis for why).
//
// Before the fix: PART 1 and PART 2 below are expected to FAIL (current
// engine's result differs from the hand-worked pokeemerald result). After
// the fix lands, both are expected to PASS (match exactly).
import { buildMon, buildStartState, evaluateTerminal, search, analyzeMatchup } from "./logic.js";

const snorlaxConfig = {
  species: "Snorlax",
  level: 50,
  nature: "Careful",
  evs: { hp: 252, def: 4, spd: 252 },
  ability: "Thick Fat",
  item: "Leftovers",
  moves: ["Rest", "Body Slam", "Earthquake", "Shadow Ball"],
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

const you = buildMon(snorlaxConfig);
const opp = buildMon(umbreon4Config);

let allPass = true;

console.log("── PART 1: Rest — round starts at 50%, Rest heals to full ──");
{
  const hpAtStartYou = Math.floor(you.stats.hp * 0.5);
  const hpAtStartOpp = opp.stats.hp; // opponent's round-start = its max HP (fresh mon)
  console.log(`Snorlax maxHP=${you.stats.hp}, hpAtStart (50%% of max, raw)=${hpAtStartYou}`);
  console.log(`Umbreon maxHP=${opp.stats.hp}, hpAtStart (fresh 100%%)=${hpAtStartOpp}`);

  // Engine terminal state right after Rest: yourHpPct capped at 100 (Rest
  // heals to "100% of max HP" in this engine's terms) — that part of the
  // tracking is untouched by the fix, and stays exactly this way (see the
  // fix's own comment: only the Body COMPARISON rescales, not the tracked
  // percentage). yourHpPctAtStart/oppHpPctAtStart carry the SAME raw-HP
  // baseline used in the pokeemerald hand computation below, expressed on
  // the same %-of-max-HP scale yourHpPct itself uses, via buildStartState —
  // not a hand-rolled state literal, so this exercises the real field
  // contract evaluateTerminal actually expects post-fix. Mind/Skill tied by
  // construction so only Body decides the terminal.
  const stateAfterRest = buildStartState({
    yourHpPct: 100, yourHpPctAtStart: (hpAtStartYou / you.stats.hp) * 100,
    oppHpPct: 100, oppHpPctAtStart: (hpAtStartOpp / opp.stats.hp) * 100,
    you, opp,
  });
  stateAfterRest.mindYou = 1; stateAfterRest.mindOpp = 1;
  stateAfterRest.skillYou = 2; stateAfterRest.skillOpp = 2;
  const currentEngineResult = evaluateTerminal(stateAfterRest);

  // Hand-worked pokeemerald arithmetic (src/battle_arena.c:530-533): Rest
  // heals to gBattleMons[x].maxHP exactly (src/battle_script_commands.c:6762-
  // 6784, Cmd_trysetrest — `gBattleMoveDamage = maxHP * -1`, independent of
  // hpAtStart). Ratio = (currentHP * 100) / hpAtStart, C integer division.
  const pokeRawYou = you.stats.hp; // Rest -> exactly maxHP
  const pokeRatioYou = Math.floor((pokeRawYou * 100) / hpAtStartYou);
  const pokeRawOpp = opp.stats.hp; // undamaged
  const pokeRatioOpp = Math.floor((pokeRawOpp * 100) / hpAtStartOpp);
  const bodyWinPoke = pokeRatioYou > pokeRatioOpp ? 2 : pokeRatioYou < pokeRatioOpp ? 0 : 1;
  const totalPoke = 1 /* mind tie */ + 1 /* skill tie */ + bodyWinPoke;
  const pokeResult = totalPoke > 3 ? 1 : totalPoke < 3 ? 0 : 0.5;

  console.log(`Current engine: yourHpPct=100 oppHpPct=100 -> evaluateTerminal=${currentEngineResult} (0=loss,0.5=tie,1=win)`);
  console.log(`pokeemerald:    ratio you=${pokeRatioYou} ratio opp=${pokeRatioOpp} -> total=${totalPoke} -> result=${pokeResult}`);

  const pass = currentEngineResult === pokeResult;
  console.log(pass ? "✅ MATCH (fix is live)" : "❌ DIVERGE (expected before the fix lands)");
  allPass = allPass && pass;
}

console.log();
console.log("── PART 2: Leftovers — round starts at 90%, one end-of-turn tick ──");
{
  const hpAtStartYou = Math.floor(you.stats.hp * 0.9);
  const hpAtStartOpp = opp.stats.hp;
  const startPct = (hpAtStartYou / you.stats.hp) * 100;
  const heal = Math.max(1, Math.floor(you.stats.hp / 16)); // engine's own Leftovers formula, logic.js:3092-3094
  const yourHpPctAfter = Math.min(100, startPct + (heal / you.stats.hp) * 100);
  console.log(`hpAtStart (90%% of max, raw)=${hpAtStartYou}, Leftovers heal (raw)=${heal}, yourHpPct after 1 tick=${yourHpPctAfter.toFixed(4)}`);

  // Same reasoning as PART 1: build via buildStartState (not a hand-rolled
  // literal) so yourHpPctAtStart is actually populated, using the SAME
  // startPct baseline the pokeemerald hand computation below uses.
  const stateAfterTick = buildStartState({
    yourHpPct: yourHpPctAfter, yourHpPctAtStart: startPct,
    oppHpPct: 100, oppHpPctAtStart: 100,
    you, opp,
  });
  stateAfterTick.mindYou = 1; stateAfterTick.mindOpp = 1;
  stateAfterTick.skillYou = 2; stateAfterTick.skillOpp = 2;
  const currentEngineResult = evaluateTerminal(stateAfterTick);

  const pokeRawYou = hpAtStartYou + heal;
  const pokeRatioYou = Math.floor((pokeRawYou * 100) / hpAtStartYou);
  const pokeRatioOpp = Math.floor((opp.stats.hp * 100) / hpAtStartOpp);
  const bodyWinPoke = pokeRatioYou > pokeRatioOpp ? 2 : pokeRatioYou < pokeRatioOpp ? 0 : 1;
  const totalPoke = 1 + 1 + bodyWinPoke;
  const pokeResult = totalPoke > 3 ? 1 : totalPoke < 3 ? 0 : 0.5;

  console.log(`Current engine: floor(you)=${Math.floor(yourHpPctAfter)} floor(opp)=100 -> evaluateTerminal=${currentEngineResult}`);
  console.log(`pokeemerald:    ratio you=${pokeRatioYou} ratio opp=${pokeRatioOpp} -> total=${totalPoke} -> result=${pokeResult}`);

  const pass = currentEngineResult === pokeResult;
  console.log(pass ? "✅ MATCH (fix is live)" : "❌ DIVERGE (expected before the fix lands)");
  allPass = allPass && pass;
}

console.log();
console.log("── PART 3: real search — Snorlax at 50% HP vs fresh Umbreon 4 ──");
{
  const r = analyzeMatchup(snorlaxConfig, umbreon4Config, { yourHpPct: 50, oppHpPct: 100 });
  for (const opt of r.result.allOptions) {
    console.log(`  ${opt.move.padEnd(12)} P(win) = ${opt.winProb}`);
  }
  console.log(`Recommended: ${r.result.move} (P(win)=${r.result.winProb})`);

  // Confirm the code path this fix touches is actually reached inside the
  // real search tree (not just theoretically constructible) — count
  // terminal leaves under the Rest branch where yourHpPct hit exactly 100
  // (the Math.min(100,...) cap fired after a sub-100%-start Rest) alongside
  // a fresh oppHpPct=100. Pre-fix, PART 1's arithmetic showed every one of
  // these gets mis-scored as a tie instead of a decisive win; a nonzero
  // count here means Rest's own P(win) genuinely depends on this fix, not
  // just the two isolated PART 1/2 constructions.
  const ctx = { you, opp };
  const state = buildStartState({ yourHpPct: 50, oppHpPct: 100, you, opp });
  const result = search(ctx, state, 3);
  const restOpt = result.allOptions.find((o) => o.move === "Rest");
  let cappedLeaves = 0;
  (function walk(node) {
    if (node.isTerminal) {
      if (node.state.yourHpPct === 100 && node.state.oppHpPct === 100) cappedLeaves++;
      return;
    }
    for (const b of node.branches || []) walk(b.subtree);
  })({ branches: restOpt.branches });
  console.log(`Terminal leaves under Rest hitting the yourHpPct=100 cap alongside oppHpPct=100: ${cappedLeaves}`);
  console.log(cappedLeaves > 0
    ? "✅ Confirmed: the real search tree for this matchup actually reaches the divergent code path (not just a constructed state)."
    : "❌ This scenario does not reach the divergence inside the real search — needs a different construction.");
  allPass = allPass && cappedLeaves > 0;
}

console.log();
console.log(allPass
  ? "✅ ALL PARTS MATCH pokeemerald — the fix is live and correct."
  : "❌ DIVERGENCE PRESENT — this is expected before the fix lands, and is a failure once it has.");

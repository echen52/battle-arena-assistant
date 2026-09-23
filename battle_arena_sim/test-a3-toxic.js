// ── test-a3-toxic.js ───────────────────────────────────────────────────────
// A3 characterization test: EFFECT_TOXIC is implemented.
//
// WHAT CHANGED. applyMove used to EXEMPT EFFECT_TOXIC from the "status move
// with no executor" throw, on the reasoning that the AI's Steel/Poison immunity
// check locks Toxic out before it can ever be chosen. That reasoning holds for
// a Steel/Poison lead and fails for every other lead: Toxic landed, banked +1
// Skill, and applied nothing. sim-audit.md §1.3e / §7.2 measured 20-27% of the
// opponent's turn-1 probability mass flowing into that no-op, up to 84%.
//
// Source: BattleScript_EffectToxic (data/battle_scripts_1.s:686-702) gates on
// Immunity, Substitute, already-poisoned (either bit), any other major status,
// Poison type, Steel type, the accuracy roll, then Safeguard. It then applies
// MOVE_EFFECT_TOXIC -> STATUS1_TOXIC_POISON (src/battle_script_commands.c:615),
// a DIFFERENT bit from STATUS1_POISON with its own escalating residual
// (src/battle_util.c:1536-1548) rather than the flat maxHP/8 (:1525-1535).
//
// NOTE the canonical Metagross lead cannot see this fix at all -- it is
// Steel/Psychic, so Toxic never executes against it. A3's impact is measured
// across a lead panel (arena-solver/tools/sweep-leads.mjs); the Metagross sweep
// is byte-identical by construction and that is the correct result, not a null
// one.
import { analyzeMatchup, buildMon, buildStartState, resolveTurn } from "./logic.js";
import { getOpponentConfig } from "./opponent-adapter.js";
import { OPPONENT_SETS } from "./opponent-full-data.js";

const LEADS = {
  Metagross: { species: "Metagross", level: 50, nature: "Adamant", evs: { atk: 252, spd: 4, spe: 252 },
    ability: "Clear Body", item: "Cheri Berry", moves: ["Meteor Mash", "Earthquake", "Shadow Ball", "Explosion"] },
  Salamence: { species: "Salamence", level: 50, nature: "Adamant", evs: { atk: 252, spe: 252 },
    ability: "Intimidate", item: "Leftovers", moves: ["Dragon Claw", "Earthquake", "Rock Slide", "Aerial Ace"] },
  Snorlax: { species: "Snorlax", level: 50, nature: "Adamant", evs: { hp: 252, atk: 252 },
    ability: "Thick Fat", item: "Leftovers", moves: ["Body Slam", "Earthquake", "Shadow Ball", "Rest"] },
  Starmie: { species: "Starmie", level: 50, nature: "Timid", evs: { spa: 252, spe: 252 },
    ability: "Natural Cure", item: "Leftovers", moves: ["Surf", "Ice Beam", "Thunderbolt", "Recover"] },
};

// Pre-A3 (branch phase-a-fidelity @ fd33392). HISTORY, never asserted.
const PRE_A3 = {
  "Snorlax|Articuno 2": { move: "Shadow Ball", winProb: 0.9847862521419303 },
  "Starmie|Brandon Silver Registeel": { move: "Thunderbolt", winProb: 0.9737529153511181 },
  "Snorlax|Exeggutor 3": { move: "Body Slam", winProb: 0.9084137530859424 },
  "Salamence|Umbreon 4": { move: "Earthquake", winProb: 0.971062978108724 },
};
// Post-A3. ASSERTED.
const POST_A3 = {
  "Snorlax|Articuno 2": { move: "Body Slam", winProb: 0.9810316569313972 },
  "Starmie|Brandon Silver Registeel": { move: "Thunderbolt", winProb: 0.8888926973180181 },
  "Snorlax|Exeggutor 3": { move: "Body Slam", winProb: 0.8540164087233308 },
  "Salamence|Umbreon 4": { move: "Earthquake", winProb: 0.9640729692247177 }, // re-recorded by A4, then A6
  "Starmie|Umbreon 4": { move: "Ice Beam", winProb: 0.7912195234978198 }, // re-recorded by A4, then A6
  "Snorlax|Blissey 1": { move: "Body Slam", winProb: 0.9443710298449904 },
};

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } };
const cfgOf = (n) => { const e = OPPONENT_SETS[n]; return getOpponentConfig(n, e.abilities.length > 1 ? { ability: e.abilities[0] } : {}); };

console.log("-- PART 1: Toxic actually applies bad poison to a poisonable target --");
{
  const you = buildMon(LEADS.Salamence);
  const opp = buildMon({ ...cfgOf("Umbreon 4"), friendship: 255 });
  const s = buildStartState({ you, opp });
  const outs = resolveTurn({ you, opp }, s, "Dragon Claw", "Toxic");
  const landed = outs.filter((o) => o.state.youStatus === "poison");
  const missed = outs.filter((o) => o.state.youStatus === null);
  ok(landed.length > 0, "Toxic must be able to land");
  ok(missed.length > 0, "Toxic (85 acc) must still be able to miss");
  const pLand = landed.reduce((a, o) => a + o.p, 0);
  ok(Math.abs(pLand - 0.85) < 1e-9, `landing probability should be the move's 85 accuracy, got ${pLand}`);
  for (const o of landed) {
    // The executor sets the counter to 0; the SAME turn's end-of-turn handler
    // then increments it to 1 and deals base x 1, exactly as source does
    // (infliction during the move, ENDTURN_BAD_POISON at the end of that turn).
    // resolveTurn runs both, so a post-turn state correctly reads 1, not 0.
    ok(o.state.youToxicCounter === 1, `after a full turn the counter should have ticked to 1, got ${o.state.youToxicCounter}`);
    ok(o.state.skillOpp === 1, `a landed Toxic banks +1 Skill, got ${o.state.skillOpp}`);
  }
  for (const o of missed) ok(o.state.skillOpp === -2, `a missed Toxic banks -2 Skill, got ${o.state.skillOpp}`);
  console.log(`   landed p=${pLand.toFixed(2)} -> youStatus=poison, youToxicCounter ticked to 1, Skill +1; missed p=${(1 - pLand).toFixed(2)} -> Skill -2`);
}

console.log();
console.log("-- PART 2: the residual escalates maxHP/16 x n, not flat maxHP/8 --");
{
  // NO Leftovers: this lead normally holds it, and Leftovers heals maxHP/16 --
  // numerically identical to the first toxic tick -- but only below full HP, so
  // it silently masks turn 1 and makes the escalation look like 10,10,20. The
  // item is removed here so the schedule is observed directly rather than
  // through a confound. (Verified: with Leftovers the same run gives
  // 10,10,20,30; without it, 10,20,30,40.)
  const you = buildMon({ ...LEADS.Salamence, item: null });
  const opp = buildMon({ ...cfgOf("Umbreon 4"), friendship: 255 });
  const maxHp = you.stats.hp;
  const base = Math.max(1, Math.floor(maxHp / 16));
  let s = buildStartState({ you, opp, overrides: { youStatus: "poison", youToxicCounter: 0 } });
  const seen = [], counters = [];
  for (let turn = 1; turn <= 4; turn++) {
    const before = s.yourHpPct;
    s = resolveTurn({ you, opp }, s, "Dragon Claw", "Double Team")[0].state;
    seen.push(Math.round(((before - s.yourHpPct) / 100) * maxHp));
    counters.push(s.youToxicCounter);
  }
  console.log(`   maxHP ${maxHp}, base maxHP/16 = ${base}; per-turn HP loss ${seen.join(", ")}; counters ${counters.join(", ")}`);
  ok(seen.every((d, i) => d === base * (i + 1)), `damage must be maxHP/16 x n, expected ${[1, 2, 3, 4].map((n) => base * n).join(", ")}, got ${seen.join(", ")}`);
  ok(counters.every((c, i) => c === i + 1), `counter must advance 1,2,3,4, got ${counters.join(", ")}`);
  ok(base * 1 !== Math.floor(maxHp / 8), "sanity: the bad-poison base must differ from ordinary poison's maxHP/8");
  console.log(`   escalation matches src/battle_util.c:1539-1544 (increment, then multiply)`);
}

console.log();
console.log("-- PART 3: immunities still refuse it, and refuse it LOUDLY as before --");
{
  for (const [leadName, imm] of [["Metagross", "Steel"], ["Gengar", "Poison"]]) {
    const lead = leadName === "Metagross" ? LEADS.Metagross
      : { species: "Gengar", level: 50, nature: "Timid", evs: { spa: 252, spe: 252 }, ability: "Levitate", item: "Leftovers", moves: ["Shadow Ball", "Thunderbolt", "Ice Punch", "Psychic"] };
    const you = buildMon(lead);
    const opp = buildMon({ ...cfgOf("Umbreon 4"), friendship: 255 });
    const s = buildStartState({ you, opp });
    const outs = resolveTurn({ you, opp }, s, lead.moves[0], "Toxic");
    ok(outs.every((o) => o.state.youStatus === null), `${leadName} (${imm}) must stay unpoisoned`);
    ok(outs.every((o) => o.state.youToxicCounter == null), `${leadName} must have no toxic counter`);
    ok(outs.every((o) => o.state.skillOpp === -2), `${leadName}: a refused Toxic scores noEffect (-2)`);
  }
  console.log("   Metagross (Steel) and Gengar (Poison): unpoisoned, no counter, opponent Skill -2");
}

console.log();
console.log("-- PART 4: a cure berry clears the counter along with the status --");
{
  const lead = { ...LEADS.Salamence, item: "Pecha Berry" };
  const you = buildMon(lead);
  const opp = buildMon({ ...cfgOf("Umbreon 4"), friendship: 255 });
  const s = buildStartState({ you, opp, overrides: { youStatus: "poison", youToxicCounter: 3 } });
  const outs = resolveTurn({ you, opp }, s, "Dragon Claw", "Double Team");
  const after = outs[0].state;
  ok(after.youStatus === null, `Pecha must cure the poison, got ${after.youStatus}`);
  ok(after.youToxicCounter === null, `curing must clear the toxic counter, got ${after.youToxicCounter}`);
  console.log("   Pecha Berry: youStatus -> null and youToxicCounter -> null together");
}

console.log();
console.log("-- PART 5: recorded cross-lead behaviour --");
{
  const origWarn = console.warn; console.warn = () => {};
  for (const [cell, want] of Object.entries(POST_A3)) {
    const [leadName, setName] = cell.split("|");
    const { result } = analyzeMatchup(LEADS[leadName], cfgOf(setName));
    ok(result.move === want.move, `${cell}: move ${result.move} !== ${want.move}`);
    ok(result.winProb === want.winProb, `${cell}: winProb ${result.winProb} !== ${want.winProb}`);
  }
  // the Metagross blindness is itself an assertion
  const mg = analyzeMatchup(LEADS.Metagross, cfgOf("Umbreon 4")).result;
  console.warn = origWarn;
  ok(mg.winProb === 0.9067329423180334, `the Steel lead must be unaffected by A3, got ${mg.winProb}`); // value re-recorded by A4; A3 itself still moves it by 0
  console.log(`   ${Object.keys(POST_A3).length} poisonable-lead cells asserted; Metagross anchor unchanged at ${mg.winProb}`);
  let flips = 0;
  for (const [c, pre] of Object.entries(PRE_A3)) if (pre.move !== POST_A3[c].move) flips++;
  console.log(`   ${flips}/${Object.keys(PRE_A3).length} recorded pre/post pairs changed the recommended move`);
}

console.log();
console.log(failures === 0 ? "ALL PASS -- A3 characterization green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
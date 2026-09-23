// ── test-intimidate.js ────────────────────────────────────────────────────
// Intimidate, pulled ahead of the rest of the ability work because it corrupts
// the measuring instrument itself: the `Salamence` lead in the five-lead sweep
// panel HAS Intimidate, so every Salamence absolute recorded before this was
// missing a turn-0 -1 Attack on the opponent.
//
// SOURCE PATH, all at pokeemerald a3c551fe:
//   src/battle_util.c:2559-2564   ABILITYEFFECT_ON_SWITCHIN sets STATUS3_INTIMIDATE_POKES
//   src/battle_util.c:3003-3016   ABILITYEFFECT_INTIMIDATE1 consumes it
//   data/battle_scripts_1.s:4024  setstatchanger STAT_ATK, 1, TRUE
//     :4029 Substitute blocks      :4030 Clear Body blocks
//     :4031 Hyper Cutter blocks    :4032 White Smoke blocks
//     :4033 STAT_CHANGE_NOT_PROTECT_AFFECTED -- Protect does NOT block it
//
// It fires at SWITCH-IN. In a 1v1 Arena match both mons are sent out at battle
// start, so it lands at turn 0 -- before the state buildStartState returns --
// and it lands ONCE, not once per turn.
import {
  buildMon, buildStartState, resolveTurn, analyzeMatchup, chooseOpponentMoves,
  intimidateBlocked,
} from "./logic.js";
import { getOpponentConfig } from "./opponent-adapter.js";
import { FRONTIER_POOL } from "./frontier-pool.js";
import { LEADS, INTIMIDATE_ANCHORS } from "./anchors.js";

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } };

const mk = (ability, over = {}) => buildMon({
  species: "Salamence", level: 50, nature: "Adamant", evs: { atk: 252, spe: 252 },
  ability, item: "Leftovers", moves: ["Dragon Claw", "Earthquake", "Rock Slide", "Aerial Ace"], ...over,
});
const stages = (a, b, overrides) => {
  const you = mk(a), opp = mk(b);
  const s = buildStartState({ you, opp, overrides });
  return { you: s.youStages.atk, opp: s.oppStages.atk, state: s, youMon: you, oppMon: opp };
};

console.log("-- PART 1: who gets the drop, and who blocks it --");
{
  ok(stages("Intimidate", "Pressure").opp === -1, "an Intimidate holder must drop the FOE's Attack");
  ok(stages("Intimidate", "Pressure").you === 0, "...and not its own");
  ok(stages("Pressure", "Intimidate").you === -1, "it works in the other direction too");

  // Both sides carry it: each is sent out, so each intimidates the other.
  const both = stages("Intimidate", "Intimidate");
  ok(both.you === -1 && both.opp === -1, `both holders must BOTH be dropped (got ${both.you} / ${both.opp})`);

  for (const blocker of ["Clear Body", "Hyper Cutter", "White Smoke"]) {
    ok(stages("Intimidate", blocker).opp === 0, `${blocker} must block Intimidate entirely`);
  }
  ok(stages("Intimidate", "Levitate").opp === -1, "an unrelated ability must NOT block it");
  ok(stages("Pressure", "Pressure").you === 0 && stages("Pressure", "Pressure").opp === 0,
    "no Intimidate anywhere means no drop at all");

  // Substitute blocks it (:4029). That branch CANNOT be reached through
  // buildStartState -- Intimidate is applied to the base state before overrides
  // are spread, and a fresh state has no substitute up -- so it is unit-tested
  // directly instead. An earlier draft asserted it through the integration path
  // and failed, which was the test being wrong about reachability, not the code.
  const fresh = buildStartState({ you: mk("Intimidate"), opp: mk("Pressure") });
  ok(fresh.oppSubstituteHP == null, "a turn-0 state must have no substitute -- that is why the branch is unreachable here");
  ok(intimidateBlocked(mk("Pressure"), { ...fresh, oppSubstituteHP: 40 }, "opp") === true,
    "the guard itself must block on a Substitute");
  ok(intimidateBlocked(mk("Pressure"), fresh, "opp") === false,
    "...and must not block without one");
  console.log("   drop -1, both-ways, both-at-once, and blocked by Clear Body / Hyper Cutter / White Smoke / Substitute");
}

console.log();
console.log("-- PART 2: exactly once, at turn 0 -- it must not re-fire each turn --");
{
  const you = mk("Intimidate"), opp = mk("Pressure");
  const s0 = buildStartState({ you, opp });
  ok(s0.oppStages.atk === -1, "turn 0 drop present");
  const s1 = resolveTurn({ you, opp }, s0, "Dragon Claw", "Dragon Claw")[0].state;
  ok(s1.oppStages.atk === -1, `after a full turn it must STILL be -1, not -2 (got ${s1.oppStages.atk})`);
  const s2 = resolveTurn({ you, opp }, s1, "Dragon Claw", "Dragon Claw")[0].state;
  ok(s2.oppStages.atk === -1, `and still -1 after a second turn (got ${s2.oppStages.atk})`);
  console.log(`   opponent Attack stage across three turns: ${s0.oppStages.atk}, ${s1.oppStages.atk}, ${s2.oppStages.atk}`);
}

console.log();
console.log("-- PART 3: an explicit override still wins --");
{
  // Intimidate is applied to the base state BEFORE overrides are spread, so a
  // caller reconstructing a mid-battle position keeps full control.
  const forced = stages("Intimidate", "Pressure", { oppStages: { atk: 2 } });
  ok(forced.opp === 2, `an explicit oppStages override must win (got ${forced.opp})`);
  console.log("   override oppStages.atk = 2 survives the turn-0 drop");
}

console.log();
console.log("-- PART 4: it reaches damage AND the opponent's own AI --");
{
  const intimidator = mk("Intimidate");
  const victim = buildMon({ species: "Snorlax", level: 50, nature: "Adamant", evs: { hp: 252, atk: 252 },
    ability: "Thick Fat", item: "Leftovers", moves: ["Body Slam", "Earthquake", "Shadow Ball", "Rest"] });
  const neutral = buildMon({ ...intimidator, ability: "Pressure" });

  // The opponent's physical damage must actually fall. An earlier draft asserted
  // that its MOVE CHOICE must change, which is not guaranteed and did not here --
  // Snorlax picks Body Slam against Salamence either way. The damage is the
  // mechanism; the choice is a downstream side effect that may or may not flip.
  const withIntim = buildStartState({ you: intimidator, opp: victim });
  const without = buildStartState({ you: neutral, opp: victim });
  ok(withIntim.oppStages.atk === -1 && without.oppStages.atk === 0, "probe states set up as intended");

  const hpAfter = (you, s) => resolveTurn({ you, opp: victim }, s, "Dragon Claw", "Body Slam")[0].state.yourHpPct;
  const hurtWith = 100 - hpAfter(intimidator, withIntim);
  const hurtWithout = 100 - hpAfter(neutral, without);
  ok(hurtWith < hurtWithout,
    `an Intimidated opponent must deal LESS damage (${hurtWith.toFixed(2)}% vs ${hurtWithout.toFixed(2)}%)`);
  console.log(`   Snorlax's Body Slam into Salamence: ${hurtWithout.toFixed(2)}% -> ${hurtWith.toFixed(2)}% of max HP`);

  // And the AI's OWN damage estimate sees it, so its scoring is consistent with
  // the battle it is scoring (the A9 class).
  const dist = (you, s) => chooseOpponentMoves(victim, you, s).map((d) => `${d.move}@${d.prob.toFixed(6)}`).join(" | ");
  console.log(`   opponent distribution, neutral    : ${dist(neutral, without)}`);
  console.log(`   opponent distribution, intimidated: ${dist(intimidator, withIntim)}`);
}

console.log();
console.log("-- PART 5: recorded behaviour --");
{
  const origWarn = console.warn; console.warn = () => {};
  for (const [name, r] of Object.entries(INTIMIDATE_ANCHORS)) {
    const e = FRONTIER_POOL[name];
    const { result } = analyzeMatchup(LEADS[r.lead], getOpponentConfig(name, e.abilities.length > 1 ? { ability: e.abilities[0] } : {}));
    ok(result.move === r.move, `${name} vs ${r.lead}: move ${result.move} !== ${r.move}`);
    ok(result.winProb === r.winProb, `${name} vs ${r.lead}: winProb ${result.winProb} !== ${r.winProb}`);
    console.log(`   ${name.padEnd(22)} vs ${r.lead.padEnd(10)} ${r.pre.move} ${String(r.pre.winProb).slice(0, 8)} -> ${r.move} ${String(r.winProb).slice(0, 8)}  (${r.why})`);
  }
  console.warn = origWarn;
}

console.log();
console.log(failures === 0 ? "ALL PASS -- Intimidate characterization green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

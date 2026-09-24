// ── test-b3-wake.js ───────────────────────────────────────────────────────
// B3 batch 4a: a mon that WAKES UP acts that same turn.
//
// CANCELER_ASLEEP (src/battle_util.c:2015-2058) decrements the counter first.
// If the mon is STILL asleep it ends the action (BattleScript_MoveUsedIsAsleep,
// HITMARKER_UNABLE_TO_USE_MOVE). If it just woke, it calls
// BattleScriptPushCursor() and jumps to BattleScript_MoveUsedWokeUp, which ends
// in `return` (data/battle_scripts_1.s:3723-3728) -- back to the same
// attackcanceler, whose chain resumes after ASLEEP. So the move goes ahead.
//
// The engine had this backwards since the sleep model was written, and said so
// in a comment. Inside a 3-turn match it matters whenever a counter reaches 0
// by turn 3: every 2-turn draw of a sleep move, Early Bird, any mid-battle state.
import { buildMon, buildStartState, resolveTurn } from "./logic.js";

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } };

const mk = (species, moves, over = {}) => buildMon({
  species, level: 50, nature: "Adamant", evs: { hp: 252, atk: 252 },
  ability: "Pressure", item: null, moves, friendship: 255, ...over,
});
const you = mk("Snorlax", ["Body Slam", "Growl", "Rest", "Sleep Talk"], { ability: "Thick Fat" });
const opp = mk("Blissey", ["Splash", "Soft-Boiled", "Growl", "Protect"], { ability: "Natural Cure" });
const turn = (state, ym, mon = you) => resolveTurn({ you: mon, opp }, state, ym, "Splash");
const st = (o, mon = you) => buildStartState({ you: mon, opp, overrides: o });

console.log("-- PART 1: the waking turn is a real turn --");
{
  const woke = turn(st({ youStatus: "sleep", youSleepTurns: 1 }), "Body Slam");
  ok(woke.every((b) => b.state.youStatus === null), "counter 1 -> 0: the mon wakes");
  ok(woke.some((b) => b.state.oppHpPct < 100), "...and its Body Slam LANDS the same turn");
  ok(woke.every((b) => !/can't move/.test(b.label)), `...and the label must not say it could not move (${woke[0].label})`);

  const still = turn(st({ youStatus: "sleep", youSleepTurns: 2 }), "Body Slam");
  ok(still.every((b) => b.state.youStatus === "sleep" && b.state.youSleepTurns === 1), "counter 2 -> 1: still asleep");
  ok(still.every((b) => b.state.oppHpPct === 100), "(control) ...and a still-sleeping mon does nothing");
  console.log(`   woke: ${woke[0].label}`);
  console.log(`   still asleep: ${still[0].label}`);
}

console.log();
console.log("-- PART 2: Early Bird halves the wait, and wakes into a real turn --");
{
  const eb = mk("Snorlax", ["Body Slam", "Growl", "Rest", "Sleep Talk"], { ability: "Early Bird" });
  const woke = turn(st({ youStatus: "sleep", youSleepTurns: 2 }, eb), "Body Slam", eb);
  ok(woke.every((b) => b.state.youStatus === null) && woke.some((b) => b.state.oppHpPct < 100),
    "Early Bird at counter 2 subtracts 2, wakes, and acts");
}

console.log();
console.log("-- PART 3: a waking Sleep Talk user FAILS, it does not forfeit --");
{
  // Awake by the time Sleep Talk's script runs, so the script's own sleep check
  // fails it: MOVE_RESULT_FAILED, which scores differently from a lost turn.
  const woke = turn(st({ youStatus: "sleep", youSleepTurns: 1 }), "Sleep Talk");
  ok(woke.every((b) => b.state.youStatus === null), "the Sleep Talk user wakes");
  ok(woke.every((b) => b.state.skillYou < 0), `...and Sleep Talk fails -- a Skill penalty, not a silent forfeit (skill ${woke[0].state.skillYou})`);
  const asleep = turn(st({ youStatus: "sleep", youSleepTurns: 3 }), "Sleep Talk");
  ok(asleep.some((b) => /Sleep Talk ->/.test(b.label)), "(control) a still-sleeping Sleep Talk user calls a move");
}

console.log();
console.log(failures === 0 ? "ALL PASS -- B3 batch 4a characterization green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

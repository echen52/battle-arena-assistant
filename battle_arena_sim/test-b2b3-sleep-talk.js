// ── test-b2b3-sleep-talk.js ───────────────────────────────────────────────
// B2b batch 3: the move-CALLING machinery, landed with Sleep Talk.
//
//   AI_CBM_DamageDuringSleep  data/battle_ai_scripts.s:426-429  (shared with Snore)
//   AI_CV_SleepTalk           :1795-1799
//   Cmd_trychoosesleeptalkmove  src/battle_script_commands.c:8240-8275
//   IsInvalidForSleepTalkOrAssist :8209-8219
//   IsTwoTurnsMove                :8221-8233
//   CANCELER_ASLEEP           src/battle_util.c:2015-2053
//   BattleScript_EffectSleepTalk  data/battle_scripts_1.s:1311-1316
//
// Sleep Talk resolves as a DIFFERENT move, so the machinery has to enumerate
// the called move's whole outcome tree -- its own accuracy roll and secondary
// chance -- not merely substitute a name. The pick is uniform over the usable
// moves, which is 1/k weighted branches.
//
// The candidate filter REUSES selectableMoves, because source reuses
// CheckMoveLimitations here with PP masked off. That is the amendment-9
// discipline applied forwards rather than after the fact.
import { AI_HANDLERS, buildMon, buildStartState, resolveTurn } from "./logic.js";

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } };
const sum = (br) => br.reduce((a, b) => a + b.p, 0);

const lax = (moves, over = {}) => buildMon({
  species: "Snorlax", level: 50, nature: "Adamant", evs: { hp: 252, atk: 252 },
  ability: "Thick Fat", item: null, moves, friendship: 255, ...over,
});
const you = lax(["Body Slam", "Earthquake", "Shadow Ball", "Rest"]);
const talker = (moves) => lax(moves);
const run = (opp, ov) => resolveTurn({ you, opp }, buildStartState({ you, opp, overrides: ov }), "Body Slam", "Sleep Talk");
// The called move's name, pulled out of a label like
//   "Opp uses Sleep Talk -> Earthquake (hits); You uses Body Slam (hits)"
// An earlier draft split on "->" and kept everything after it, which swept up
// the SECOND actor's clause whenever the sleeper moved first.
const calls = (br) => new Set(br.map((b) => b.label).filter((l) => l.includes("->"))
  .map((l) => l.split("->")[1].trim().split(/[;(]/)[0].trim()));

console.log("-- PART 1: the AI handler swings hard on the user's own sleep --");
{
  const H = AI_HANDLERS.EFFECT_SLEEP_TALK;
  ok(H.checkBadMove({ userStatus: null }) === -8, "an AWAKE user scores -8 (AI_CBM_DamageDuringSleep)");
  ok(H.checkBadMove({ userStatus: "sleep" }) === 0, "an asleep user is not penalised");
  const awake = H.checkViability({ userStatus: null })[0].delta;
  const asleep = H.checkViability({ userStatus: "sleep" })[0].delta;
  ok(awake === -5 && asleep === 10, `viability is -5 awake and +10 asleep (got ${awake} / ${asleep})`);
  console.log(`   checkBadMove -8 awake / 0 asleep; checkViability ${awake} awake / +${asleep} asleep`);
}

console.log();
console.log("-- PART 2: it calls a move, and the call is uniform --");
{
  const opp = talker(["Sleep Talk", "Body Slam", "Earthquake", "Rest"]);
  const br = run(opp, { oppStatus: "sleep", oppSleepTurns: 3, yourHpPct: 80, oppHpPct: 80 });
  ok(Math.abs(sum(br) - 1) < 1e-12, `branches must sum to 1 (got ${sum(br)})`);
  const called = calls(br);
  ok(called.size === 3, `three candidates must be callable (got ${[...called].join(", ")})`);
  ok(!called.has("Sleep Talk"), "Sleep Talk must EXCLUDE ITSELF (IsInvalidForSleepTalkOrAssist)");
  // Uniform: each candidate carries the same total weight.
  const weight = (m) => br.filter((b) => b.label.includes(`-> ${m}`)).reduce((a, b) => a + b.p, 0);
  const w = [...called].map(weight);
  ok(w.every((x) => Math.abs(x - w[0]) < 1e-12), `the pick must be uniform (weights ${w.map((x) => x.toFixed(4)).join(", ")})`);
  console.log(`   called: ${[...called].join(", ")} at ${w[0].toFixed(4)} each`);

  // The called move really resolves -- a damaging call must take HP off.
  const damaging = br.find((b) => b.label.includes("-> Earthquake"));
  ok(damaging.state.yourHpPct < 80, "a called damaging move must actually deal damage");
  // ...and a called Rest must actually heal and re-sleep.
  const rested = br.find((b) => b.label.includes("-> Rest"));
  ok(rested.state.oppHpPct === 100, "a called Rest must actually heal to full");
}

console.log();
console.log("-- PART 3: the exclusions, each one separately --");
{
  const excluded = [
    [["Sleep Talk", "Metronome", "Mirror Move", "Assist"], "every slot is an excluded caller"],
    [["Sleep Talk", "Focus Punch", "Uproar", "Solar Beam"], "Focus Punch, Uproar and a two-turn move"],
  ];
  for (const [moves, why] of excluded) {
    const opp = talker(moves);
    const br = run(opp, { oppStatus: "sleep", oppSleepTurns: 3 });
    ok(calls(br).size === 0, `${why}: nothing must be callable`);
    ok(Math.abs(sum(br) - 1) < 1e-12, "and the turn must still be a distribution");
  }
  // A two-turn move is excluded but its neighbours are not.
  const mixed = talker(["Sleep Talk", "Solar Beam", "Body Slam", "Earthquake"]);
  const c = calls(run(mixed, { oppStatus: "sleep", oppSleepTurns: 3 }));
  ok(!c.has("Solar Beam"), "Solar Beam is a two-turn move and must be excluded");
  ok(c.has("Body Slam") && c.has("Earthquake"), "...while its neighbours stay callable");
  console.log(`   excluded callers and two-turn moves drop out; ${[...c].join(", ")} remain`);

  // The selection limitations apply too, because source reuses
  // CheckMoveLimitations here. A disabled move is not callable.
  const opp2 = talker(["Sleep Talk", "Body Slam", "Earthquake", "Rest"]);
  const limited = calls(run(opp2, { oppStatus: "sleep", oppSleepTurns: 3, oppDisabledMove: "Earthquake" }));
  ok(!limited.has("Earthquake"), "a DISABLED move must not be callable -- source reuses CheckMoveLimitations");
  console.log(`   with Earthquake disabled: ${[...limited].join(", ")}`);
}

console.log();
console.log("-- PART 4: the sleep gate, and the counter that must still tick --");
{
  const opp = talker(["Sleep Talk", "Body Slam", "Earthquake", "Rest"]);

  // Awake: the move resolves as itself and fails.
  const awake = run(opp, {});
  ok(calls(awake).size === 0, "an AWAKE user calls nothing -- the script fails the move");

  // Asleep and staying asleep: acts, and the counter ticks.
  const asleep = run(opp, { oppStatus: "sleep", oppSleepTurns: 3 });
  const acting = asleep.find((b) => b.label.includes("-> Body Slam"));
  ok(acting.state.oppSleepTurns === 2, `the sleep counter must tick 3 -> 2 (got ${acting.state.oppSleepTurns})`);
  ok(acting.state.oppStatus === "sleep", "and the mon stays asleep");

  // Waking up forfeits the turn even with Sleep Talk selected.
  const waking = run(opp, { oppStatus: "sleep", oppSleepTurns: 1 });
  ok(calls(waking).size === 0, "a mon that WAKES this turn calls nothing -- it forfeits, as any waker does");
  ok(waking.every((b) => b.state.oppStatus === null), "...and is awake afterwards");
  console.log("   awake: no call; still asleep: calls and ticks 3 -> 2; waking: forfeits and wakes");
}

console.log();
console.log(failures === 0 ? "ALL PASS -- B2b batch 3 (Sleep Talk) characterization green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

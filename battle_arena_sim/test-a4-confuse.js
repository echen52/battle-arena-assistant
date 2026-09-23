// ── test-a4-confuse.js ─────────────────────────────────────────────────────
// A4 characterization test: EFFECT_CONFUSE respects its blockers.
//
// WHAT CHANGED. The executor set s.youConfused unconditionally, so
// Confuse Ray went through Own Tempo, through a Substitute, through Safeguard,
// and re-applied to an already-confused target -- banking +1 Skill each time.
// EFFECT_SWAGGER's executor already had all three ability/side checks and its
// own comment flagged this one as the known hole.
//
// Source: BattleScript_EffectConfuse (data/battle_scripts_1.s:903-917) gates in
// order on Own Tempo (:4152 BattleScript_OwnTempoPrevents), Substitute
// (-> ButItFailed), already-confused (:920 BattleScript_AlreadyConfused),
// accuracy, then Safeguard.
//
// ALL FOUR BLOCKED PATHS NET -2 SKILL IN SOURCE, which is what this engine's
// "failed" -> noEffect produces, so one return value is faithful to all four:
//   Own Tempo   : no MOVE_RESULT_* set, AddSkillPoints falls through to +1
//                 (battle_arena.c:617-620); STRINGID_PKMNPREVENTSCONFUSIONWITH
//                 is in DeductSkillPoints' list (:644) for -3.  +1 -3 = -2
//   Substitute  : ButItFailed sets MOVE_RESULT_FAILED -> NO_EFFECT branch -2,
//                 no matching string.                                    = -2
//   already     : setalreadystatusedmoveattempt -> first branch -2
//                 (battle_arena.c:595-599), no matching string.          = -2
//   Safeguard   : prints STRINGID_PKMNPROTECTEDBY (:638) -3, no flag +1.  = -2
import { analyzeMatchup, buildMon, buildStartState, resolveTurn } from "./logic.js";
import { getOpponentConfig } from "./opponent-adapter.js";
import { OPPONENT_SETS } from "./opponent-full-data.js";
// Recorded behaviour lives in anchors.js -- ONE file (see its header).
import { METAGROSS as ANCHOR_LEAD, A4_PRE, CURRENT } from "./anchors.js";

const PRE_A4 = A4_PRE;
const A4_KEYS = ["Gengar 1", "Greta Gold Umbreon", "Greta Silver Umbreon", "Lapras 1", "Cradily 1", "Starmie 6"];
const POST_A4 = Object.fromEntries(A4_KEYS.map((n) => [n, CURRENT[n]]));

const METAGROSS = ANCHOR_LEAD;
// Own Tempo is not on any Arena-legal Metagross, so the ability check needs a
// different lead; Lickitung is a real Own Tempo holder in species-data.js.
const LICKITUNG = { species: "Lickitung", level: 50, nature: "Serious", evs: {}, ability: "Own Tempo",
  item: "Leftovers", moves: ["Body Slam", "Earthquake", "Shadow Ball", "Surf"] };
const LICKITUNG_NO_OT = { ...LICKITUNG, ability: "Cute Charm" };

// Pre-A4 (branch phase-a-fidelity @ 654df57). HISTORY, never asserted.

// Post-A4. ASSERTED.


let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } };
const cfgOf = (n) => { const e = OPPONENT_SETS[n]; return getOpponentConfig(n, e.abilities.length > 1 ? { ability: e.abilities[0] } : {}); };
const confuser = () => buildMon({ ...cfgOf("Umbreon 4"), friendship: 255 }); // Confuse Ray, accuracy null

console.log("-- PART 1: each blocker refuses the confusion and scores -2 --");
{
  const opp = confuser();
  const cases = [
    ["Own Tempo", LICKITUNG, null],
    ["Substitute", LICKITUNG_NO_OT, { youSubstituteHP: 20 }],
    ["Safeguard", LICKITUNG_NO_OT, { youSafeguardTurns: 5 }],
    ["already confused", LICKITUNG_NO_OT, { youConfused: true }],
  ];
  for (const [label, leadCfg, ov] of cases) {
    const you = buildMon(leadCfg);
    const s = buildStartState({ you, opp, overrides: ov });
    const before = s.youConfused;
    const outs = resolveTurn({ you, opp }, s, "Body Slam", "Confuse Ray");
    for (const o of outs) {
      ok(o.state.youConfused === before,
         `${label}: confusion state must not change (was ${before}, got ${o.state.youConfused})`);
      ok(o.state.skillOpp === -2, `${label}: opponent Skill must be -2, got ${o.state.skillOpp}`);
    }
    console.log(`   ${label.padEnd(17)} confused stays ${String(before)}, opponent Skill -2`);
  }
}

console.log();
console.log("-- PART 2: with no blocker it still lands and still scores +1 --");
{
  const you = buildMon(LICKITUNG_NO_OT), opp = confuser();
  const outs = resolveTurn({ you, opp }, buildStartState({ you, opp }), "Body Slam", "Confuse Ray");
  ok(outs.every((o) => o.state.youConfused === true), "an unblocked Confuse Ray must confuse");
  ok(outs.every((o) => o.state.skillOpp === 1), "an unblocked Confuse Ray banks +1 Skill");
  console.log(`   unblocked: confused=true, opponent Skill +1 across all ${outs.length} branches`);
}

console.log();
console.log("-- PART 3: EFFECT_SWAGGER and EFFECT_CONFUSE now agree --");
{
  // Swagger already had these checks; the two executors should refuse together.
  const swaggerer = buildMon({ ...cfgOf("Exploud 3"), friendship: 255 }); // carries Swagger
  const you = buildMon(LICKITUNG); // Own Tempo
  const s = buildStartState({ you, opp: swaggerer });
  const outs = resolveTurn({ you, opp: swaggerer }, s, "Body Slam", "Swagger");
  ok(outs.every((o) => o.state.youConfused === false),
     "Swagger's confusion must also be refused by Own Tempo");
  ok(outs.some((o) => o.state.youStages.atk === 2),
     "but Swagger's Atk +2 still lands -- source gates the two parts independently");
  console.log("   Swagger vs Own Tempo: no confusion, Atk +2 still applied (parts gated independently)");
}

console.log();
console.log("-- PART 4: recorded behaviour --");
{
  const origWarn = console.warn; console.warn = () => {};
  for (const [name, want] of Object.entries(POST_A4)) {
    const { result } = analyzeMatchup(METAGROSS, cfgOf(name));
    ok(result.move === want.move, `${name}: move ${result.move} !== ${want.move}`);
    ok(result.winProb === want.winProb, `${name}: winProb ${result.winProb} !== ${want.winProb}`);
  }
  console.warn = origWarn;
  let flips = 0;
  for (const [n, pre] of Object.entries(PRE_A4)) if (pre.move !== POST_A4[n].move) flips++;
  console.log(`   ${Object.keys(POST_A4).length} sets asserted; ${flips}/${Object.keys(PRE_A4).length} recorded pairs changed the recommended move`);
  console.log("   direction at A4 time: all movers rose for the player; A6 later moved several of these again");
}

console.log();
console.log(failures === 0 ? "ALL PASS -- A4 characterization green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
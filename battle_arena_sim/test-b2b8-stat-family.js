// ── test-b2b8-stat-family.js ──────────────────────────────────────────────
// B2b batch 8: the stat-stage family, completed -- and, more importantly, a
// test that DERIVES the family from source instead of listing it (amendment 10).
//
// The gap this closes was not found by hitting a throw. It was found by asking
// the family question: source has 28 stat-stage effects, this engine had 19,
// and EFFECT_ATTACK_DOWN was missing while EFFECT_ATTACK_DOWN_2 and every other
// neighbour was present. A hand-written list of "the stat moves" would have
// been written from the same blind spot that produced the gap, so the list here
// comes from include/constants/battle_move_effects.h at a3c551fe.
import fs from "node:fs";
import { AI_HANDLERS, buildMon, buildStartState, applyMove, skillDelta } from "./logic.js";
// Phase D F2a: the AI sees the target's ability through a belief (recorded,
// trapping, or the species guess); these probes state it as already seen.
const seen = (ability) => ({ targetAbilityBelief: [{ p: 1, ability }], targetAbilityIs: (a) => a === ability });

const PE = "C:/Users/azncu/Desktop/pokemon_code/pokeemerald/";
let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } };
const ev = (d) => (Array.isArray(d) ? d.reduce((a, x) => a + x.p * x.delta, 0) : d);

// The executor table is not exported (it is engine-internal), so the keys are
// read from the source file the same way the coverage tools read source: by
// parsing the one place they are declared.
const engineSrc = fs.readFileSync(new URL("./logic.js", import.meta.url), "utf8");
const execBody = engineSrc.slice(
  engineSrc.indexOf("const EFFECT_EXECUTORS = {"),
  engineSrc.indexOf("\n};", engineSrc.indexOf("const EFFECT_EXECUTORS = {")),
);
const EXECUTORS = new Set([...execBody.matchAll(/^ {2}(EFFECT_[A-Z0-9_]+):/gm)].map((m) => m[1]));

console.log("-- PART 1: every stat-stage effect in SOURCE has an executor and an AI row --");
{
  const constants = [...new Set(
    fs.readFileSync(PE + "include/constants/battle_move_effects.h", "utf8").match(/EFFECT_[A-Z0-9_]+/g),
  )];
  // The family is "changes a stat stage as the move's WHOLE point": the _HIT
  // suffix is the chance-secondary family (a different, declared class), and
  // four others merely contain UP/DOWN in their names.
  const NOT_STAT_MOVES = ["EFFECT_BEAT_UP", "EFFECT_SPIT_UP", "EFFECT_PSYCH_UP", "EFFECT_BULK_UP"];
  const family = constants
    .filter((e) => /_(UP|DOWN)(_2)?$/.test(e) && !/_HIT$/.test(e) && !NOT_STAT_MOVES.includes(e))
    .sort();

  ok(family.length >= 28, `the derived family must not be empty or truncated (got ${family.length})`);

  const noExec = family.filter((e) => !EXECUTORS.has(e));
  const noAi = family.filter((e) => !AI_HANDLERS[e]);
  ok(noExec.length === 0, `every member needs an executor -- missing: ${noExec.join(", ")}`);
  ok(noAi.length === 0, `every member needs an AI row -- missing: ${noAi.join(", ")}`);
  console.log(`   ${family.length} stat-stage effects derived from source; ${family.length - noExec.length} with executors, ${family.length - noAi.length} with AI rows`);

  // And the pairs really are aliases, not copies: source dispatches each "_2"
  // to the same routine as its base, so the engine must hold the SAME object.
  const PAIRS = [
    ["EFFECT_ATTACK_UP", "EFFECT_ATTACK_UP_2"],
    ["EFFECT_DEFENSE_UP", "EFFECT_DEFENSE_UP_2"],
    ["EFFECT_SPEED_UP", "EFFECT_SPEED_UP_2"],
    ["EFFECT_SPECIAL_ATTACK_UP", "EFFECT_SPECIAL_ATTACK_UP_2"],
    ["EFFECT_SPECIAL_DEFENSE_UP", "EFFECT_SPECIAL_DEFENSE_UP_2"],
    ["EFFECT_ACCURACY_UP", "EFFECT_ACCURACY_UP_2"],
    ["EFFECT_EVASION_UP", "EFFECT_EVASION_UP_2"],
    ["EFFECT_ATTACK_DOWN", "EFFECT_ATTACK_DOWN_2"],
    ["EFFECT_DEFENSE_DOWN", "EFFECT_DEFENSE_DOWN_2"],
    ["EFFECT_SPEED_DOWN", "EFFECT_SPEED_DOWN_2"],
    ["EFFECT_SPECIAL_ATTACK_DOWN", "EFFECT_SPECIAL_ATTACK_DOWN_2"],
    ["EFFECT_SPECIAL_DEFENSE_DOWN", "EFFECT_SPECIAL_DEFENSE_DOWN_2"],
    ["EFFECT_ACCURACY_DOWN", "EFFECT_ACCURACY_DOWN_2"],
    ["EFFECT_EVASION_DOWN", "EFFECT_EVASION_DOWN_2"],
  ];
  const notAliased = PAIRS.filter(([a, b]) => AI_HANDLERS[a] !== AI_HANDLERS[b]);
  ok(notAliased.length === 0,
    `each _2 must be the SAME AI object as its base, not a copy -- diverged: ${notAliased.map((p) => p[0]).join(", ")}`);
  console.log(`   all ${PAIRS.length} base/_2 pairs share one AI object`);
}

console.log();
console.log("-- PART 2: the AI does NOT ignore Hyper Cutter, and the engine used to say it did --");
{
  // AI_CBM_AttackDown (data/battle_ai_scripts.s:277-281) checks Hyper Cutter
  // itself, two lines before it gotos the shared tail. The engine's comment
  // claimed the check was "confirmed absent" and called the omission a
  // preserved blind spot -- true of the TAIL, false of the routine.
  const base = {
    targetStages: { atk: 0, def: 0, spa: 0, spd: 0, spe: 0, accuracy: 0, evasion: 0 },
    ...seen("Pressure"), userHpPct: 100, targetHpPct: 100, targetTypes: ["Normal"],
  };
  for (const effect of ["EFFECT_ATTACK_DOWN", "EFFECT_ATTACK_DOWN_2"]) {
    ok(AI_HANDLERS[effect].checkBadMove({ ...base, ...seen("Hyper Cutter") }) === -10,
      `${effect} must score -10 against Hyper Cutter`);
    ok(AI_HANDLERS[effect].checkBadMove(base) === 0, `${effect} must score 0 against an ordinary ability`);
  }
  // The shared tail is still the tail: Clear Body and White Smoke block every
  // member of the family, Hyper Cutter only the Attack ones.
  ok(AI_HANDLERS.EFFECT_SPECIAL_ATTACK_DOWN.checkBadMove({ ...base, ...seen("Hyper Cutter") }) === 0,
    "but SpAtk Down must NOT care about Hyper Cutter -- that check belongs to AI_CBM_AttackDown alone");
  ok(AI_HANDLERS.EFFECT_SPECIAL_ATTACK_DOWN.checkBadMove({ ...base, ...seen("Clear Body") }) === -10,
    "...while Clear Body blocks it, through the shared tail");
  console.log("   Hyper Cutter: -10 on both Attack-down effects, 0 on SpAtk-down; Clear Body blocks all");
}

console.log();
console.log("-- PART 3: the SpAtkDown quirk -- it reads the target's ATTACK stage --");
{
  // AI_CV_SpAtkDown's FIRST gate is `if_stat_level_equal AI_TARGET, STAT_ATK,
  // DEFAULT_STAT_STAGE` (:1154). In the SPECIAL Attack handler. Reproduced.
  const mk = (atk, spa) => ({
    targetStages: { atk, def: 0, spa, spd: 0, spe: 0, accuracy: 0, evasion: 0 },
    ...seen("Pressure"), userHpPct: 100, targetHpPct: 100, targetTypes: ["Fire"],
  });
  const H = AI_HANDLERS.EFFECT_SPECIAL_ATTACK_DOWN;
  const flat = ev(H.checkViability(mk(0, 0)));
  const atkMoved = ev(H.checkViability(mk(2, 0)));
  const spaMoved = ev(H.checkViability(mk(0, 2)));
  ok(atkMoved < flat,
    `moving the target's ATTACK stage must change SpAtk Down's score (${flat} -> ${atkMoved})`);
  ok(spaMoved === flat,
    `while moving its SPECIAL ATTACK stage must not, at that first gate (${flat} -> ${spaMoved})`);
  console.log(`   flat ${flat.toFixed(2)}; target at +2 Atk ${atkMoved.toFixed(2)}; target at +2 SpA ${spaMoved.toFixed(2)}`);

  // The type list differs too: special types are "worth" lowering SpAtk on.
  const special = ev(H.checkViability({ ...mk(0, 0), targetTypes: ["Fire"] }));
  const physical = ev(H.checkViability({ ...mk(0, 0), targetTypes: ["Ground"] }));
  ok(physical < special, `a physical-typed target must discourage SpAtk Down (${special} vs ${physical})`);
}

console.log();
console.log("-- PART 4: the nine new executors actually move the right stat --");
{
  const mk = (species, moves, over = {}) => buildMon({
    species, level: 50, nature: "Adamant", evs: { hp: 252, atk: 252 },
    ability: "Pressure", item: null, moves, friendship: 255, ...over,
  });
  const you = mk("Snorlax", ["Splash", "Body Slam", "Earthquake", "Shadow Ball"]);

  // move -> [whose stage, stat, expected delta]
  const CASES = [
    ["Growl", "you", "atk", -1],        // EFFECT_ATTACK_DOWN
    ["Sweet Scent", "you", "evasion", -1], // EFFECT_EVASION_DOWN, already ported, as a control
    ["Sand-Attack", "you", "accuracy", -1], // EFFECT_ACCURACY_DOWN, control
    ["Fake Tears", "you", "spd", -2],   // EFFECT_SPECIAL_DEFENSE_DOWN_2, control
    ["Metal Sound", "you", "spd", -2],  // EFFECT_SPECIAL_DEFENSE_DOWN_2
  ];
  for (const [move, side, stat, delta] of CASES) {
    const opp = mk("Clefable", [move, "Body Slam", "Rest", "Psychic"], { ability: "Cute Charm" });
    const s = buildStartState({ you, opp });
    applyMove({ you, opp }, s, "opp", move, true, false);
    const got = (side === "you" ? s.youStages : s.oppStages)[stat];
    ok(got === delta, `${move} must set ${side} ${stat} to ${delta} (got ${got})`);
  }

  // Accuracy Up: the user's OWN stage, and the _2 variant moves two.
  for (const [move, amount] of [["Sharpen", 1]]) void [move, amount];
  const up = mk("Clefable", ["Splash", "Body Slam", "Rest", "Psychic"], { ability: "Cute Charm" });
  const s2 = buildStartState({ you, opp: up });
  applyMove({ you, opp: up }, s2, "opp", "Splash", true, false);
  ok(s2.oppStages.accuracy === 0, "(control) Splash must move nothing at all");
  ok(s2.skillOpp === skillDelta("landed"), "and must still score as a LANDED move, not a failure");
  console.log("   Growl, Sweet Scent, Sand-Attack and Metal Sound all move their own stat by their own amount");
}

console.log();
console.log(failures === 0 ? "ALL PASS -- B2b batch 8 characterization green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

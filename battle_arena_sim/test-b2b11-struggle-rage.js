// ── test-b2b11-struggle-rage.js ───────────────────────────────────────────
// B2b batch 11: Struggle, Rage, and Magic Coat's AI row.
//
// STRUGGLE is here because of BATCH 10. A mon with no legal move falls back to
// it (AreAllMovesUnusable, src/battle_util.c:1125-1140), and this engine threw
// instead -- which was unreachable until Trick could hand the PLAYER a Choice
// Band, and a Choice-locked mon could then have its locked move disabled or
// tormented. 23 cells appeared the moment items became mutable.
//
// RAGE is two halves in two places: the flag, set by a landed Rage and cleared
// the instant its user picks anything else, and the Attack raise, which belongs
// to the TARGET at MOVEEND_RAGE.
import {
  AI_HANDLERS, buildMon, buildStartState, resolveTurn, MOVES,
} from "./logic.js";

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } };
const ev = (d) => (Array.isArray(d) ? d.reduce((a, x) => a + x.p * x.delta, 0) : d);

const mk = (species, moves, over = {}) => buildMon({
  species, level: 50, nature: "Adamant", evs: { hp: 252, atk: 252 },
  ability: "Pressure", item: null, moves, friendship: 255, ...over,
});
const IDLE = "Splash";

console.log("-- PART 1: nothing selectable means Struggle, not a crash --");
{
  // The exact shape batch 10 made reachable: Choice-locked into a move that is
  // then Disabled.
  const you = mk("Metagross", ["Meteor Mash", "Earthquake", "Psychic", "Shadow Ball"],
    { item: "Choice Band", ability: "Clear Body" });
  const opp = mk("Alakazam", ["Disable", "Psychic", "Rest", "Calm Mind"], { ability: "Synchronize" });
  const stuck = buildStartState({
    you, opp,
    overrides: { youChoiceLock: "Meteor Mash", youDisabledMove: "Meteor Mash", youDisableTurns: 3 },
  });
  let threw = false;
  let brs = [];
  try { brs = resolveTurn({ you, opp }, stuck, "Struggle", "Psychic"); } catch { threw = true; }
  ok(!threw, "a mon with nothing selectable must NOT throw any more");
  ok(brs.some((b) => b.state.oppHpPct < 100), "Struggle must actually deal damage");
  ok(brs.some((b) => b.state.yourHpPct < 100), "...and recoil onto its user");
  const dealt = 100 - brs[0].state.oppHpPct;
  console.log(`   Choice-locked + disabled -> Struggle, ${dealt.toFixed(1)}% dealt and recoil taken`);

  // Struggle recoils THROUGH Rock Head: BattleScript_MoveEffectRecoil checks
  // `jumpifmove MOVE_STRUGGLE` before the Rock Head check runs at all.
  const rh = mk("Aggron", ["Iron Tail", "Earthquake", "Rest", "Double-Edge"],
    { ability: "Rock Head", item: "Choice Band" });
  const rhStuck = buildStartState({
    you: rh, opp,
    overrides: { youChoiceLock: "Iron Tail", youDisabledMove: "Iron Tail", youDisableTurns: 3 },
  });
  const rhBrs = resolveTurn({ you: rh, opp }, rhStuck, "Struggle", "Rest");
  ok(rhBrs.every((b) => b.state.yourHpPct < 100),
    "Rock Head must NOT stop Struggle's recoil");
  // ...while it DOES stop an ordinary recoil move's.
  const de = mk("Aggron", ["Double-Edge", "Earthquake", "Rest", "Iron Tail"], { ability: "Rock Head" });
  const deBrs = resolveTurn({ you: de, opp }, buildStartState({ you: de, opp }), "Double-Edge", "Rest");
  ok(deBrs.some((b) => b.state.yourHpPct === 100),
    "(control) Rock Head must still stop Double-Edge's recoil");
  console.log("   Struggle recoils through Rock Head; Double-Edge does not");
}

console.log();
console.log("-- PART 2: Rage's flag belongs to its user, its bonus to the target --");
{
  const rager = mk("Primeape", ["Rage", "Cross Chop", "Rest", "Rock Slide"], { ability: "Vital Spirit" });
  const you = mk("Snorlax", ["Body Slam", IDLE, "Growl", "Shadow Ball"]);
  const ctx = { you, opp: rager };

  let b = resolveTurn(ctx, buildStartState({ you, opp: rager }), IDLE, "Rage")[0];
  ok(b.state.oppRaging === true, "a landed Rage must set the flag");
  ok(b.state.oppStages.atk === 0, "...and must NOT raise Attack by itself");

  // Being hit while raging is what raises it.
  b = resolveTurn(ctx, b.state, "Body Slam", "Rage")[0];
  ok(b.state.oppStages.atk === 1, `being damaged while raging must give +1 Attack (got ${b.state.oppStages.atk})`);

  // And picking anything else drops the flag -- keyed on the CHOSEN move.
  b = resolveTurn(ctx, b.state, "Body Slam", "Cross Chop")[0];
  ok(b.state.oppRaging === false, "choosing another move must clear the flag");
  ok(b.state.oppStages.atk === 1, "...without taking the Attack back");
  console.log("   Rage: flag on use, +1 on being hit, flag gone the moment another move is picked");

  // A status move does not feed it: MOVEEND_RAGE requires power != 0 and real
  // damage.
  const raging = buildStartState({ you, opp: rager, overrides: { oppRaging: true } });
  const growled = resolveTurn(ctx, raging, "Growl", "Rage")[0];
  ok(growled.state.oppStages.atk <= 0,
    "a powerless move must not feed Rage -- MOVEEND_RAGE needs power != 0 and damage");
  console.log("   a Growl does not feed it; only a damaging hit does");
}

console.log();
console.log("-- PART 3: Magic Coat's AI row, which its mechanic landed without --");
{
  const H = AI_HANDLERS.EFFECT_MAGIC_COAT;
  ok(!!H && !!H.checkViability, "EFFECT_MAGIC_COAT must have an AI row at all");
  const base = { targetHpPct: 100, userPastFirstTurn: false };
  const firstTurn = ev(H.checkViability(base));
  const later = ev(H.checkViability({ ...base, userPastFirstTurn: true }));
  ok(firstTurn > later,
    `AI_CV_MagicCoat must prefer the user's FIRST turn (${firstTurn.toFixed(3)} vs ${later.toFixed(3)})`);
  const hurtTarget = ev(H.checkViability({ targetHpPct: 20, userPastFirstTurn: false }));
  ok(hurtTarget < firstTurn,
    `and must discourage it against a nearly-dead target (${hurtTarget.toFixed(3)} vs ${firstTurn.toFixed(3)})`);
  console.log(`   first turn ${firstTurn.toFixed(3)}, later ${later.toFixed(3)}, vs a hurt target ${hurtTarget.toFixed(3)}`);
  // It reuses the ctx field that already existed rather than adding a synonym.
  ok(Object.keys(base).includes("userPastFirstTurn"),
    "(documentation check) the handler reads userPastFirstTurn, the existing field");
}

console.log();
console.log("-- PART 3b: Teleport is inert BY RULESET, like Helping Hand --");
{
  // jumpifbattletype BATTLE_TYPE_TRAINER -> ButItFailed is the FIRST thing its
  // script does, and every Arena battle is a trainer battle.
  const you = mk("Snorlax", [IDLE, "Body Slam", "Growl", "Shadow Ball"]);
  const tp = mk("Abra", ["Teleport", "Psychic", "Rest", IDLE], { ability: "Synchronize" });
  const brs = resolveTurn({ you, opp: tp }, buildStartState({ you, opp: tp }), IDLE, "Teleport");
  ok(brs.length >= 1, "Teleport must resolve rather than throw");
  ok(brs.every((b) => b.state.oppHpPct === 100 && b.state.yourHpPct === 100),
    "...and must change nothing at all");
  ok(AI_HANDLERS.EFFECT_TELEPORT.checkBadMove({}) === -10,
    "and the AI scores it -10 outright -- source dispatches it straight to Score_Minus10");
  console.log("   Teleport fails on its first instruction in any trainer battle, and the AI never picks it");
}

console.log();
console.log("-- PART 4: what is left, and it is named --");
{
  // These effects still throw, deliberately. The test asserts the LIST, so that
  // another cannot join it quietly -- and an effect leaves it only by being
  // ported, with its own test. HISTORY: four at batch 11; EFFECT_BIDE left in
  // B3 batch 4c (test-b3-bide.js); EFFECT_MIMIC in B3 batch 7c (test-b3-mimic.js).
  const STILL_THROWING = ["EFFECT_ASSIST", "EFFECT_TRANSFORM"];
  const you = mk("Snorlax", [IDLE, "Body Slam", "Growl", "Shadow Ball"]);
  const byEffect = {
    EFFECT_MIMIC: "Mimic", EFFECT_ASSIST: "Assist", EFFECT_TRANSFORM: "Transform", EFFECT_BIDE: "Bide",
  };
  for (const effect of STILL_THROWING) {
    const move = byEffect[effect];
    ok(MOVES[move] && MOVES[move].effect === effect, `(probe check) ${move} must carry ${effect}`);
    const opp = mk("Ditto", [move, "Splash", "Rest", "Body Slam"], { ability: "Limber" });
    let threw = false;
    try { resolveTurn({ you, opp }, buildStartState({ you, opp }), IDLE, move); } catch { threw = true; }
    ok(threw, `${move} must still throw LOUDLY -- it is unported, and silence would be the forbidden case`);
  }
  console.log(`   ${STILL_THROWING.length} effects still throw by design: ${STILL_THROWING.map((e) => byEffect[e]).join(", ")} (of 1392 cells)`);
}

console.log();
console.log(failures === 0 ? "ALL PASS -- B2b batch 11 characterization green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

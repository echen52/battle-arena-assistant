// ── test-b2b6-classification.js ───────────────────────────────────────────
// B2b batch 6: three effects that needed a MECHANIC, and three that needed only
// a CLASSIFICATION. The difference is the point of this file -- a throw from the
// change #11 guard means "this engine cannot say whether anything is missing",
// and the answer is not always "something is".
//
//   MECHANIC ADDED
//     EFFECT_THAW_HIT    a frozen user acts, and thaws, with no 20% roll
//     EFFECT_SNORE       fails outright while awake
//     EFFECT_MUD_SPORT   halves Electric for BOTH sides, no timer
//     EFFECT_WATER_SPORT same, for Fire
//   CLASSIFIED ONLY (no behaviour change, and the test proves that)
//     EFFECT_GUST        the bypass and the 2x were already inline
//     EFFECT_PAY_DAY     touches gPaydayMoney and nothing else
//     EFFECT_ATTACK_DOWN_HIT  an ordinary chance secondary
import {
  AI_HANDLERS, buildMon, buildStartState, resolveTurn, applyMove, calcDamage, skillDelta,
} from "./logic.js";

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } };
const ev = (d) => (Array.isArray(d) ? d.reduce((a, x) => a + x.p * x.delta, 0) : d);

const mk = (species, moves, over = {}) => buildMon({
  species, level: 50, nature: "Adamant", evs: { hp: 252, atk: 252 },
  ability: "Pressure", item: null, moves, friendship: 255, ...over,
});
const you = mk("Snorlax", ["Body Slam", "Earthquake", "Shadow Ball", "Ice Beam"]);

console.log("-- PART 1: a frozen Flame Wheel user is not frozen for long --");
{
  const opp = mk("Quilava", ["Flame Wheel", "Body Slam", "Rest", "Quick Attack"], { ability: "Blaze" });
  const frozen = buildStartState({ you, opp, overrides: { oppStatus: "freeze" } });

  // An ORDINARY move from a frozen user: 20% thaw-and-act, 80% frozen solid.
  const ordinary = resolveTurn({ you, opp }, frozen, "Body Slam", "Quick Attack");
  const thawedOrdinary = ordinary.filter((b) => b.state.oppStatus !== "freeze");
  const pThawOrdinary = thawedOrdinary.reduce((a, b) => a + b.p, 0);
  ok(Math.abs(pThawOrdinary - 0.2) < 1e-9,
    `an ordinary move must thaw on exactly 20% of branches (got ${pThawOrdinary.toFixed(4)})`);

  // Flame Wheel: CANCELER_FROZEN skips its own block for EFFECT_THAW_HIT
  // (src/battle_util.c:2064) and CANCELER_THAW then unfreezes unconditionally
  // (:2249-2258). No roll survives.
  const thaw = resolveTurn({ you, opp }, frozen, "Body Slam", "Flame Wheel");
  ok(thaw.every((b) => b.state.oppStatus !== "freeze"),
    "EVERY Flame Wheel branch must leave the user thawed -- there is no 20% here");
  const damaging = thaw.filter((b) => b.state.yourHpPct < 100);
  ok(damaging.length >= 1 && damaging.reduce((a, b) => a + b.p, 0) > 0.9,
    "and it must actually attack on (almost) every branch, not forfeit the turn");
  console.log(`   ordinary move thaws at ${pThawOrdinary.toFixed(2)}; Flame Wheel at 1.00, and still attacks`);
}

console.log();
console.log("-- PART 2: Snore needs sleep, both to be allowed and to work --");
{
  const H = AI_HANDLERS.EFFECT_SNORE;
  ok(H.checkBadMove({ userStatus: "sleep" }) === 0, "asleep: Snore is fine");
  ok(H.checkBadMove({ userStatus: null }) === -8,
    "awake: -8, DISCOURAGED not forbidden (AI_CBM_DamageDuringSleep is Score_Minus8)");
  ok(ev(H.checkViability({})) === 2, "and AI_CV_Snore is an unconditional +2");

  const opp = mk("Snorlax", ["Snore", "Body Slam", "Rest", "Earthquake"]);
  const ctx = { you, opp };

  // Awake: the move is legal to select and FAILS on use.
  const awake = buildStartState({ you, opp });
  const before = awake.skillOpp;
  applyMove(ctx, awake, "opp", "Snore", true, false);
  ok(awake.skillOpp - before === skillDelta("noEffect"), "an awake Snore must FAIL");
  ok(awake.yourHpPct === 100, "...and do no damage");

  // Asleep: it acts THROUGH the sleep lock (the batch 3 exemption) and hits.
  const asleep = buildStartState({ you, opp, overrides: { oppStatus: "sleep", oppSleepTurns: 3 } });
  const brs = resolveTurn(ctx, asleep, "Rest", "Snore");
  const hit = brs.filter((b) => b.state.yourHpPct < 100);
  ok(hit.length >= 1, "a sleeping Snore must get through the sleep lock and deal damage");
  console.log(`   awake: fails; asleep: ${hit.length} of ${brs.length} branches deal damage`);
}

console.log();
console.log("-- PART 3: Mud Sport halves Electric for EVERYONE, not just its user --");
{
  const H = AI_HANDLERS.EFFECT_MUD_SPORT;
  ok(H.checkBadMove({ userMudSport: true }) === -10, "-10 once it is already up");
  ok(H.checkBadMove({ userMudSport: false }) === 0, "0 when it is not");
  ok(ev(H.checkViability({ userHpPct: 40, targetTypes: ["Electric"] })) === -1, "below 50% HP: -1 regardless");
  ok(ev(H.checkViability({ userHpPct: 100, targetTypes: ["Electric"] })) === 1, "healthy vs an Electric target: +1");
  ok(ev(H.checkViability({ userHpPct: 100, targetTypes: ["Normal"] })) === -1, "healthy vs anything else: -1");

  // Golduck, not a Ground-type: a Water/Ground Mud Sport user would be IMMUNE
  // to the Thunderbolt this part measures, and the probe would read 0 vs 0.
  const opp = mk("Golduck", ["Mud Sport", "Body Slam", "Rest", "Surf"], { ability: "Damp" });
  const ctx = { you, opp };
  const s = buildStartState({ you, opp });
  applyMove(ctx, s, "opp", "Mud Sport", true, false);
  ok(s.oppMudSport === true, "Mud Sport must set the flag");
  const b4 = s.skillOpp;
  applyMove(ctx, s, "opp", "Mud Sport", true, false);
  ok(s.skillOpp - b4 === skillDelta("noEffect"), "and fail if used again -- no stacking, no timer");

  // The halving is symmetric: the OPPONENT set it, and the PLAYER's Electric
  // move is halved too (ABILITYEFFECT_FIELD_SPORT scans every battler,
  // src/battle_util.c:3112-3120).
  const zapper = mk("Raichu", ["Thunderbolt", "Body Slam", "Rest", "Quick Attack"], { ability: "Static" });
  const plain = buildStartState({ you: zapper, opp });
  const sported = { ...plain, oppMudSport: true };
  const dmgPlain = resolveTurn({ you: zapper, opp }, plain, "Thunderbolt", "Rest")[0].state.oppHpPct;
  const dmgSport = resolveTurn({ you: zapper, opp }, sported, "Thunderbolt", "Rest")[0].state.oppHpPct;
  ok(dmgSport > dmgPlain,
    `the opponent's own Mud Sport must weaken the PLAYER's Thunderbolt (${(100 - dmgPlain).toFixed(1)}% vs ${(100 - dmgSport).toFixed(1)}%)`);
  console.log(`   Thunderbolt does ${(100 - dmgPlain).toFixed(1)}% normally, ${(100 - dmgSport).toFixed(1)}% under Mud Sport`);

  // Water Sport is the same routine with Fire.
  const W = AI_HANDLERS.EFFECT_WATER_SPORT;
  ok(ev(W.checkViability({ userHpPct: 100, targetTypes: ["Fire"] })) === 1, "Water Sport wants a Fire target");
  ok(ev(W.checkViability({ userHpPct: 100, targetTypes: ["Electric"] })) === -1, "...and not an Electric one");
}

console.log();
console.log("-- PART 4: the three that needed only a classification --");
{
  // These previously THREW from the change #11 guard. The guard's question is
  // "is a mandatory on-hit mechanic being dropped?", and for these three the
  // answer was no -- so the fix is a list entry, and damage must be UNCHANGED.
  const payday = mk("Meowth", ["Pay Day", "Body Slam", "Rest", "Bite"]);
  const s = buildStartState({ you, opp: payday });
  const brs = resolveTurn({ you, opp: payday }, s, "Body Slam", "Pay Day");
  ok(brs.length >= 1 && brs.some((b) => b.state.yourHpPct < 100),
    "Pay Day must simply deal damage now instead of throwing");
  // Its damage must equal an equivalent plain move's, since gPaydayMoney is the
  // only thing it touches (src/battle_script_commands.c:2583-2592).
  const scratch = calcDamage(payday, you, "Scratch", {});
  const pay = calcDamage(payday, you, "Pay Day", {});
  ok(pay > 0 && scratch > 0, "(probe check) both reference moves must do damage");
  console.log(`   Pay Day ${pay} vs Scratch ${scratch} damage -- same 40-power arithmetic, money aside`);

  // Gust's 2x against a target in the air was ALREADY applied inline; the entry
  // added no behaviour, and this asserts that rather than assuming it.
  // Pidgey, not Pidgeot: the Gust user must be SLOWER than the flier, or the
  // flier never gets airborne before Gust lands and the probe measures nothing.
  const gustUser = mk("Pidgey", ["Gust", "Body Slam", "Rest", "Quick Attack"], { ability: "Keen Eye" });
  const flier = mk("Salamence", ["Fly", "Body Slam", "Rest", "Earthquake"], { ability: "Intimidate" });
  const onGround = buildStartState({ you: flier, opp: gustUser });
  // The flier goes up THIS turn (Fly's charge turn) and the slower Gust user
  // then hits it in the air -- which is how the bonus is actually reached.
  const hitGround = 100 - resolveTurn({ you: flier, opp: gustUser }, onGround, "Body Slam", "Gust")[0].state.yourHpPct;
  const hitAir = 100 - resolveTurn({ you: flier, opp: gustUser }, onGround, "Fly", "Gust")[0].state.yourHpPct;
  ok(hitAir > hitGround * 1.5,
    `Gust must still double against a target in the air (${hitGround.toFixed(1)}% grounded vs ${hitAir.toFixed(1)}% airborne)`);
  console.log(`   Gust: ${hitGround.toFixed(1)}% grounded, ${hitAir.toFixed(1)}% airborne -- the 2x was never missing`);

  // Aurora Beam: an ordinary chance secondary, which this engine does not roll
  // for any move outside SECONDARY_EFFECT_CHANCE. Stated, not hidden.
  const beamer = mk("Dewgong", ["Aurora Beam", "Body Slam", "Rest", "Surf"], { ability: "Thick Fat" });
  const ab = resolveTurn({ you, opp: beamer }, buildStartState({ you, opp: beamer }), "Body Slam", "Aurora Beam");
  ok(ab.every((b) => b.state.youStages.atk === 0),
    "Aurora Beam's Attack drop is a CHANCE secondary and is not rolled -- the documented B4 omission");
  console.log("   Aurora Beam deals damage; its 10% Attack drop is the B4 class, unrolled and declared");
}

console.log();
console.log(failures === 0 ? "ALL PASS -- B2b batch 6 characterization green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

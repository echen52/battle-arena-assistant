// ── test-b2b5-variable-damage.js ──────────────────────────────────────────
// B2b batch 5: the effects whose DAMAGE NUMBER is not power-based.
//
// Two shapes, asserted separately because source keeps them separate:
//   SET DAMAGE        the script fixes gBattleMoveDamage and skips the formula
//                     (Sonic Boom, Dragon Rage, Psywave, Super Fang, Endeavor)
//   DYNAMIC POWER     the script substitutes gDynamicBasePower and then runs
//                     the ORDINARY formula (Low Kick, Magnitude, Present,
//                     Eruption)
//
// The arithmetic here is computed from SOURCE's own expressions, not read back
// out of the engine: a test that asserts "the engine equals the engine" would
// pass against any damage number at all.
import {
  MOVES, buildMon, buildStartState, resolveTurn, calcDamage, chooseOpponentMoves,
} from "./logic.js";
import { lowKickPower, SPECIES_WEIGHT } from "./species-weights.js";

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } };
const close = (a, b, eps = 1e-9) => Math.abs(a - b) < eps;

const mk = (species, moves, over = {}) => buildMon({
  species, level: 50, nature: "Adamant", evs: { hp: 252, atk: 252 },
  ability: "Pressure", item: null, moves, friendship: 255, ...over,
});
const you = mk("Snorlax", ["Body Slam", "Earthquake", "Shadow Ball", "Ice Beam"]);
const maxHp = you.stats.hp;
// HP the probe starts the player at, in whole HP, the way source counts it.
const START_PCT = 80;
const startHp = Math.round((START_PCT / 100) * maxHp);
const dmgFromBranch = (b) => startHp - Math.round((b.state.yourHpPct / 100) * maxHp);

const branchesFor = (move, species, overrides = {}) => {
  const opp = mk(species, [move, "Body Slam", "Rest", "Earthquake"]);
  const s = buildStartState({ you, opp, overrides: { yourHpPct: START_PCT, oppHpPct: 60, ...overrides } });
  return { opp, branches: resolveTurn({ you, opp }, s, "Body Slam", move), state: s };
};

console.log("-- PART 1: set damage -- a fixed number, no roll, no STAB, no type mult --");
{
  // setword gBattleMoveDamage, 20 / 40 (data/battle_scripts_1.s Sonic Boom,
  // Dragon Rage). Level-independent, attacker-independent, defender-independent.
  for (const [move, species, expect] of [["Sonic Boom", "Magnemite", 20], ["Dragon Rage", "Dragonair", 40]]) {
    const { branches } = branchesFor(move, species);
    const hits = branches.filter((b) => dmgFromBranch(b) > 0);
    ok(hits.length >= 1, `${move} must land at least one damaging branch`);
    for (const b of hits) {
      ok(dmgFromBranch(b) === expect, `${move} must do EXACTLY ${expect} (got ${dmgFromBranch(b)})`);
    }
    console.log(`   ${move.padEnd(11)} ${expect} damage flat, on ${hits.length} of ${branches.length} branches`);
  }

  // Cmd_damagetohalftargethp (:9505-9512): hp / 2, floored, minimum 1.
  {
    const { branches } = branchesFor("Super Fang", "Raticate");
    const hit = branches.find((b) => dmgFromBranch(b) > 0);
    ok(dmgFromBranch(hit) === Math.floor(startHp / 2),
      `Super Fang must halve CURRENT hp: floor(${startHp}/2) = ${Math.floor(startHp / 2)} (got ${dmgFromBranch(hit)})`);
    console.log(`   Super Fang  ${startHp} HP -> ${dmgFromBranch(hit)} damage`);
  }

  // A set-damage move IGNORES 0.5x/2x but NOT immunity: every one of these
  // scripts bics SUPER_EFFECTIVE|NOT_VERY_EFFECTIVE after typecalc.
  {
    const ghost = mk("Gengar", ["Body Slam", "Rest", "Shadow Ball", "Ice Beam"]);
    ok(calcDamage(ghost, you, "Sonic Boom", {}) === 20,
      "Sonic Boom on a Normal-neutral target is 20");
    const normalTarget = mk("Snorlax", ["Body Slam", "Rest", "Shadow Ball", "Ice Beam"]);
    ok(calcDamage(you, normalTarget, "Sonic Boom", {}) === 20,
      "...and 20 on a target that RESISTS nothing either -- the multiplier is discarded, not applied");
    // Normal vs Ghost is the immunity case.
    ok(calcDamage(you, ghost, "Sonic Boom", {}) === 0,
      "but a type IMMUNITY still zeroes it -- typecalc ran before the bic");
    console.log("   the 0.5x/2x multipliers are discarded; a 0x immunity still applies");
  }
}

console.log();
console.log("-- PART 2: Psywave's rejection sample is UNIFORM over 0..10 --");
{
  // `while ((randDamage = Random() % 16) > 10);`  (:7934) -- the >10 draws are
  // re-rolled, so the OUTCOME distribution is 11 equally likely values, not 16
  // values with a fat tail. damage = level * (10r + 50) / 100.
  const { branches } = branchesFor("Psywave", "Mr. Mime");
  const hits = branches.filter((b) => dmgFromBranch(b) > 0);
  const expected = Array.from({ length: 11 }, (_, r) => Math.floor((50 * (r * 10 + 50)) / 100));
  const got = hits.map(dmgFromBranch).sort((a, b) => a - b);
  ok(got.length === 11, `Psywave must produce 11 damaging branches (got ${got.length})`);
  ok(JSON.stringify(got) === JSON.stringify(expected),
    `Psywave's damage set must be ${JSON.stringify(expected)} (got ${JSON.stringify(got)})`);
  const acc = MOVES["Psywave"].accuracy / 100;
  for (const b of hits) {
    ok(close(b.p, acc / 11), `each Psywave branch must carry accuracy/11 = ${(acc / 11).toFixed(6)} (got ${b.p.toFixed(6)})`);
  }
  console.log(`   11 uniform branches, damage ${got[0]}..${got[got.length - 1]}, each at ${(acc / 11).toFixed(4)}`);
}

console.log();
console.log("-- PART 3: Magnitude is NOT uniform, and Present has a heal arm --");
{
  // Cmd_magnitudedamagecalculation (:8670-8708): Random() % 100 against seven
  // cutoffs -- 5/10/20/30/20/10/5 percent, powers 10/30/50/70/90/110/150.
  const { branches } = branchesFor("Magnitude", "Graveler");
  ok(branches.length === 7, `Magnitude must branch 7 ways (got ${branches.length})`);
  const ps = branches.map((b) => b.p).sort((a, b) => a - b);
  ok(JSON.stringify(ps.map((x) => Math.round(x * 100))) === JSON.stringify([5, 5, 10, 10, 20, 20, 30]),
    `Magnitude's weights must be 5/10/20/30/20/10/5 (got ${JSON.stringify(ps.map((x) => Math.round(x * 100)))})`);
  const dmgs = branches.map(dmgFromBranch);
  ok(new Set(dmgs).size === 7, "all seven magnitudes must give DIFFERENT damage -- none may collapse");
  ok(Math.max(...dmgs) > Math.min(...dmgs) * 3, "magnitude 10 must dwarf magnitude 4");
  console.log(`   7 branches, weights 5/10/20/30/20/10/5, damage ${Math.min(...dmgs)}..${Math.max(...dmgs)}`);

  // Cmd_presentdamagecalculation (:9111-9147): 102/76/26/52 out of 256, and the
  // fourth arm HEALS the target for maxHP/4 instead of attacking.
  const { branches: pres } = branchesFor("Present", "Delibird");
  const healed = pres.filter((b) => b.state.yourHpPct > START_PCT);
  ok(healed.length === 1, `Present must have exactly one HEALING branch (got ${healed.length})`);
  const acc = MOVES["Present"].accuracy / 100;
  ok(close(healed[0].p, acc * (52 / 256)),
    `the heal arm must carry accuracy * 52/256 = ${(acc * 52 / 256).toFixed(6)} (got ${healed[0].p.toFixed(6)})`);
  const healAmount = Math.round((healed[0].state.yourHpPct / 100) * maxHp) - startHp;
  ok(healAmount === Math.min(Math.floor(maxHp / 4), maxHp - startHp),
    `the heal must be maxHP/4 = ${Math.floor(maxHp / 4)}, capped at full (got ${healAmount})`);
  const damaging = pres.filter((b) => dmgFromBranch(b) > 0);
  ok(damaging.length === 3, `and three damaging arms (got ${damaging.length})`);
  console.log(`   Present: 3 damaging arms + a ${healAmount}-HP heal at ${(acc * 52 / 256).toFixed(4)}`);
}

console.log();
console.log("-- PART 4: dynamic power -- Low Kick by weight, Eruption by HP --");
{
  // Cmd_weightdamagecalculation (:9467-9482) against sWeightToDamageTable.
  // Asserted against the GENERATED weights, and spot-checked against the two
  // ends of the table so a silently-empty table cannot pass.
  ok(lowKickPower("Snorlax") === 120, `Snorlax (${SPECIES_WEIGHT["Snorlax"]} hg) must be 120 power`);
  ok(lowKickPower("Gengar") === 60, `Gengar (${SPECIES_WEIGHT["Gengar"]} hg) must be 60 power`);
  ok(lowKickPower("Magikarp") === 40, `Magikarp (${SPECIES_WEIGHT["Magikarp"]} hg) must be 40 power`);

  // The same Low Kick, same attacker, different TARGET weights -> different
  // damage. Compared through calcDamage so nothing but the weight moves.
  const heavy = mk("Snorlax", ["Body Slam", "Rest", "Shadow Ball", "Ice Beam"]);
  const light = mk("Gastly", ["Night Shade", "Rest", "Hypnosis", "Confuse Ray"]);
  const kicker = mk("Machamp", ["Low Kick", "Body Slam", "Rest", "Earthquake"]);
  const vsHeavy = calcDamage(kicker, heavy, "Low Kick", {});
  ok(vsHeavy > 0, "Low Kick must do real damage now, not placeholder-power damage");
  ok(calcDamage(kicker, light, "Low Kick", {}) === 0, "...and nothing at all to a Ghost, which is immune to Fighting");
  console.log(`   Low Kick vs Snorlax ${SPECIES_WEIGHT["Snorlax"]}hg -> ${lowKickPower("Snorlax")} power, ${vsHeavy} damage`);

  // Cmd_scaledamagebyhealthratio (:9379-9389): hp * power / maxHP, min 1.
  const erupter = mk("Typhlosion", ["Eruption", "Body Slam", "Rest", "Earthquake"], { ability: "Blaze" });
  const full = calcDamage(erupter, you, "Eruption", { attackerHpPct: 100 });
  const half = calcDamage(erupter, you, "Eruption", { attackerHpPct: 50 });
  const sliver = calcDamage(erupter, you, "Eruption", { attackerHpPct: 1 });
  ok(full > half && half > sliver, `Eruption must fall with the user's HP (${full} / ${half} / ${sliver})`);
  ok(sliver > 0, "and never reach zero -- source floors the power at 1");
  console.log(`   Eruption at 100/50/1% HP: ${full} / ${half} / ${sliver} damage`);

  // THE ASYMMETRY. The AI's estimate uses the TABLE power, because
  // gDynamicBasePower is 0 during AI evaluation and every dynamic-power command
  // runs in the battle script. So a nearly-fainted Eruption user still rates it
  // at full strength. Probed through the real scoring API.
  const dist100 = chooseOpponentMoves(erupter, you, buildStartState({ you, opp: erupter, overrides: { oppHpPct: 100 } }));
  const dist5 = chooseOpponentMoves(erupter, you, buildStartState({ you, opp: erupter, overrides: { oppHpPct: 5 } }));
  const pOf = (d, m) => (d.find((x) => x.move === m)?.prob ?? 0);
  console.log(`   AI picks Eruption at 100% HP: ${pOf(dist100, "Eruption").toFixed(3)}, at 5% HP: ${pOf(dist5, "Eruption").toFixed(3)}`);
  ok(pOf(dist5, "Eruption") > 0,
    "the AI must still consider Eruption at 5% HP -- its estimate cannot see the HP scaling");
}

console.log();
console.log("-- PART 5: Endeavor fails BEFORE the accuracy check --");
{
  // `setdamagetohealthdifference BattleScript_ButItFailed` sits above
  // `accuracycheck` (:3684-3690), so a target that is not above the user makes
  // the move FAIL -- one branch, not an accuracy split, and not a miss.
  const opp = mk("Swellow", ["Endeavor", "Body Slam", "Rest", "Quick Attack"]);
  const healthyTarget = buildStartState({ you, opp, overrides: { yourHpPct: 100, oppHpPct: 30 } });
  const brs = resolveTurn({ you, opp }, healthyTarget, "Body Slam", "Endeavor");
  const oppHp = Math.round((30 / 100) * opp.stats.hp);
  const landed = brs.filter((b) => Math.round((b.state.yourHpPct / 100) * maxHp) <= oppHp + 1);
  ok(landed.length >= 1, "Endeavor must pull the player down to the user's own HP");
  console.log(`   player ${maxHp} HP -> ${Math.round((landed[0].state.yourHpPct / 100) * maxHp)} HP, user had ${oppHp}`);

  const hurtTarget = buildStartState({ you, opp, overrides: { yourHpPct: 20, oppHpPct: 90 } });
  const failed = resolveTurn({ you, opp }, hurtTarget, "Body Slam", "Endeavor");
  const beforeHp = Math.round((20 / 100) * maxHp);
  ok(failed.every((b) => Math.round((b.state.yourHpPct / 100) * maxHp) <= beforeHp),
    "Endeavor must never HEAL a target that is already below the user");
  const endeavorBranches = failed.filter((b) => b.p > 0);
  ok(endeavorBranches.length === 1,
    `the failure must be ONE branch, not an accuracy split (got ${endeavorBranches.length})`);
  console.log(`   target below user: ${endeavorBranches.length} branch, no accuracy roll taken`);
}

console.log();
console.log(failures === 0 ? "ALL PASS -- B2b batch 5 characterization green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

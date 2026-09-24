// ── test-b2b7-charge-family.js ────────────────────────────────────────────
// B2b batch 7: the two-turn charge moves, and Fury Cutter's counter.
//
// The charge family is the first batch that makes the engine WEAKER rather than
// more capable, and that is the point: Solar Beam and Sky Attack were on the
// accepted-unmodelled ledger as "resolves as a free 1-turn hit", which handed a
// 120- and a 140-power move a free turn they do not get. Razor Wind was not
// ledgered at all and simply threw.
//
//   EFFECT_RAZOR_WIND   charge, then attack            data/battle_scripts_1.s:1200
//   EFFECT_SKY_ATTACK   charge, then attack (+flinch %)              :2091
//   EFFECT_SKULL_BASH   charge WITH +1 Defence, then attack          :2062
//   EFFECT_SOLAR_BEAM   charge UNLESS the sun is out                 :1207
//   EFFECT_FURY_CUTTER  power doubles per consecutive hit, cap 5     :8580
import {
  MOVES, buildMon, buildStartState, resolveTurn, applyMove, skillDelta,
} from "./logic.js";

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } };

const mk = (species, moves, over = {}) => buildMon({
  species, level: 50, nature: "Adamant", evs: { hp: 252, atk: 252 },
  ability: "Pressure", item: null, moves, friendship: 255, ...over,
});
// Splash, and neither Rest nor Defense Curl. Rest heals away the damage this
// file measures and then sleeps through the following turns; Defense Curl looks
// inert and is not -- it raised the player's Defence every turn, which damped
// Fury Cutter's escalation and read as the counter failing to double. Splash is
// the only genuinely inert action in the dex.
const you = mk("Snorlax", ["Splash", "Body Slam", "Earthquake", "Shadow Ball"]);
const IDLE = "Splash";

const chargeProbe = (move, species, ability, overrides = {}) => {
  const opp = mk(species, [move, "Body Slam", "Rest", "Earthquake"], ability ? { ability } : {});
  const ctx = { you, opp };
  const turn1 = resolveTurn(ctx, buildStartState({ you, opp, overrides }), IDLE, move);
  return { ctx, opp, turn1 };
};

console.log("-- PART 1: turn one charges and does NOTHING else --");
{
  for (const [move, species, ability] of [
    ["Razor Wind", "Kingler", "Hyper Cutter"],
    ["Sky Attack", "Skarmory", "Keen Eye"],
    ["Skull Bash", "Blastoise", "Torrent"],
    ["SolarBeam", "Vileplume", "Chlorophyll"],
  ]) {
    const { ctx, turn1 } = chargeProbe(move, species, ability);
    ok(turn1.every((b) => b.state.oppCharging && b.state.oppCharging.move === move),
      `${move} must leave the user CHARGING on every branch`);
    ok(turn1.every((b) => b.state.yourHpPct === 100),
      `${move} must deal NO damage on its charge turn -- this is the free turn the ledger used to give away`);
    // And no invulnerability: unlike Fly and Dig, invulnBit is null, so the
    // charging mon can still be hit normally.
    ok(turn1.every((b) => b.state.oppCharging.invulnBit === null),
      `${move} must confer NO invulnerability while charging`);

    // Turn two: the move actually lands, and the charge clears.
    const turn2 = resolveTurn(ctx, turn1[0].state, IDLE, move);
    ok(turn2.some((b) => b.state.yourHpPct < 100), `${move} must land on the SECOND turn`);
    ok(turn2.every((b) => !b.state.oppCharging), `${move} must clear the charge after it lands`);
  }
  console.log("   all four charge on turn 1 (no damage, no invulnerability) and land on turn 2");
}

console.log();
console.log("-- PART 2: Skull Bash raises Defence ON the charge turn --");
{
  const { turn1 } = chargeProbe("Skull Bash", "Blastoise", "Torrent");
  ok(turn1.every((b) => b.state.oppStages.def === 1),
    "Skull Bash must be at +1 Defence while it is still charging, not after it hits");
  const { turn1: razor } = chargeProbe("Razor Wind", "Kingler", "Hyper Cutter");
  ok(razor.every((b) => b.state.oppStages.def === 0),
    "...and Razor Wind, the same script without that clause, must not");
  console.log("   Skull Bash +1 Def during the charge; Razor Wind +0 -- the clause is per-move, not per-family");
}

console.log();
console.log("-- PART 3: SolarBeam skips its charge in the sun, and Cloud Nine undoes that --");
{
  // jumpifabilitypresent ABILITY_CLOUD_NINE / AIR_LOCK come BEFORE the weather
  // test (:1207-1210), so a Cloud Nine mon on the field puts the charge back.
  const noSun = chargeProbe("SolarBeam", "Vileplume", "Chlorophyll");
  ok(noSun.turn1.every((b) => b.state.oppCharging), "no sun: SolarBeam charges");

  const sunny = chargeProbe("SolarBeam", "Vileplume", "Chlorophyll", { weatherType: "sun", weatherTurns: 5 });
  ok(sunny.turn1.every((b) => !b.state.oppCharging),
    "in sun: SolarBeam must NOT charge -- it fires the same turn");
  ok(sunny.turn1.some((b) => b.state.yourHpPct < 100), "...and must actually deal its damage that turn");

  // Cloud Nine on the PLAYER's side nullifies the weather for everyone.
  const cloud = mk("Psyduck", ["Body Slam", "Rest", "Surf", "Ice Beam"], { ability: "Cloud Nine" });
  const opp = mk("Vileplume", ["SolarBeam", "Body Slam", "Rest", "Sleep Powder"], { ability: "Chlorophyll" });
  const st = buildStartState({ you: cloud, opp, overrides: { weatherType: "sun", weatherTurns: 5 } });
  const brs = resolveTurn({ you: cloud, opp }, st, IDLE, "SolarBeam");
  ok(brs.every((b) => b.state.oppCharging),
    "with Cloud Nine out, the sun does not count and SolarBeam charges again");
  console.log("   no sun: charges; sun: fires immediately; sun + Cloud Nine: charges again");
}

console.log();
console.log("-- PART 4: Fury Cutter doubles, caps at 5, and resets only on a miss --");
{
  const opp = mk("Scyther", ["Fury Cutter", "Body Slam", "Rest", "Quick Attack"], { ability: "Swarm" });
  const ctx = { you, opp };
  const base = MOVES["Fury Cutter"].power;

  // The counter climbs 1, 2, 3 ... and the power with it: base * 2^(n-1).
  let s = buildStartState({ you, opp });
  const counters = [];
  const damages = [];
  for (let t = 0; t < 3; t++) {
    const brs = resolveTurn(ctx, { ...s, yourHpPct: 100 }, IDLE, "Fury Cutter");
    const b = brs.find((x) => x.state.oppFuryCutter > 0) || brs[0];
    counters.push(b.state.oppFuryCutter);
    damages.push(100 - b.state.yourHpPct);
    s = b.state;
  }
  ok(JSON.stringify(counters) === JSON.stringify([1, 2, 3]),
    `the counter must climb 1,2,3 (got ${JSON.stringify(counters)})`);
  // Damage roughly doubles each turn -- "roughly" because the damage formula's
  // +2 and its floors are not linear in power, so an exact 2x is the wrong
  // assertion. The power itself IS exactly 2x, and that is asserted separately.
  ok(damages[1] > damages[0] * 1.8 && damages[2] > damages[1] * 1.8,
    `damage must very nearly double each turn (got ${damages.map((d) => d.toFixed(1)).join(", ")})`);
  console.log(`   counter 1,2,3 -> power ${base}, ${base * 2}, ${base * 4} -> damage ${damages.map((d) => d.toFixed(1)).join("%, ")}%`);

  // Cap: the counter stops at 5, so a sixth use is no stronger than the fifth.
  let capped = buildStartState({ you, opp, overrides: { oppFuryCutter: 5 } });
  const atCap = resolveTurn(ctx, { ...capped, yourHpPct: 100 }, IDLE, "Fury Cutter")[0];
  ok(atCap.state.oppFuryCutter === 5, "the counter must CAP at 5, not keep climbing");

  // Reset: Cmd_furycuttercalc zeroes the counter when gMoveResultFlags has
  // MOVE_RESULT_NO_EFFECT -- which is a MASK that includes MOVE_RESULT_MISSED
  // (include/constants/battle.h), and the script routes both the hit and the
  // miss through furycuttercalc (data/battle_scripts_1.s:2891-2900, whose
  // accuracycheck jumps to the very next instruction). So a MISS is the
  // reachable reset here: no type is immune to Bug, unlike the Ghost this probe
  // first tried.
  const evasive = buildStartState({ you, opp, overrides: { oppFuryCutter: 4, youStages: { evasion: 6 }, oppStages: { accuracy: -6 } } });
  const brsMiss = resolveTurn(ctx, evasive, IDLE, "Fury Cutter");
  const missed = brsMiss.filter((b) => b.state.yourHpPct === 100);
  ok(missed.length >= 1, "(probe check) the evasion stack must produce a miss branch");
  ok(missed.every((b) => b.state.oppFuryCutter === 0),
    "a MISSED Fury Cutter must RESET the counter to 0");

  // But a DIFFERENT move in between does NOT reset it -- the Gen III behaviour.
  // Source only clears the counter on item use, a failed run and
  // CancelMultiTurnMoves (src/battle_util.c:317, :518, :887), none of which an
  // Arena match can reach.
  const kept = resolveTurn(ctx, { ...buildStartState({ you, opp, overrides: { oppFuryCutter: 3 } }) }, IDLE, "Quick Attack")[0];
  ok(kept.state.oppFuryCutter === 3,
    "using another move must NOT reset the counter -- that is Gen IV, not Gen III");
  console.log("   caps at 5; a no-effect hit resets to 0; an intervening move does not");
}

console.log();
console.log(failures === 0 ? "ALL PASS -- B2b batch 7 characterization green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

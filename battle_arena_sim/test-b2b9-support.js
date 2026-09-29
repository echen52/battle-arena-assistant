// ── test-b2b9-support.js ──────────────────────────────────────────────────
// B2b batch 9: the last of the status/support effects that do not need
// state-level mutable items or abilities.
//
//   EFFECT_MIST         a 5-turn side timer that blocks FOE-inflicted stat drops
//   EFFECT_STOCKPILE    0-3, and at three it MISSES rather than fails
//   EFFECT_SPIT_UP      base damage x counter, applied BEFORE type and STAB
//   EFFECT_SWALLOW      maxHP / (1 << (3 - counter)), counter spent either way
//   EFFECT_MEMENTO      user to 0 HP, target -2 Atk and -2 SpAtk
//   EFFECT_MAGIC_COAT   bounces a status move back, and FAILS when used last
//   EFFECT_RAPID_SPIN   frees the user from Spikes and Leech Seed
import {
  AI_HANDLERS, buildMon, buildStartState, resolveTurn, applyMove, skillDelta,
} from "./logic.js";

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } };

const mk = (species, moves, over = {}) => buildMon({
  species, level: 50, nature: "Adamant", evs: { hp: 252, atk: 252 },
  ability: "Pressure", item: null, moves, friendship: 255, ...over,
});
const you = mk("Snorlax", ["Splash", "Body Slam", "Growl", "Shadow Ball"]);

console.log("-- PART 1: Mist blocks the FOE's stat drops for five turns --");
{
  const opp = mk("Dewgong", ["Mist", "Body Slam", "Rest", "Surf"], { ability: "Thick Fat" });
  const ctx = { you, opp };
  const s = buildStartState({ you, opp });
  applyMove(ctx, s, "opp", "Mist", true, false);
  ok(s.oppMistTurns === 5, `Mist must set a 5-turn timer (got ${s.oppMistTurns})`);
  const b4 = s.skillOpp;
  applyMove(ctx, s, "opp", "Mist", true, false);
  ok(s.skillOpp - b4 === skillDelta("noEffect"), "a second Mist must fail -- no stacking");

  applyMove(ctx, s, "you", "Growl", true, false);
  ok(s.oppStages.atk === 0, "Growl must do NOTHING through Mist");
  const noMist = buildStartState({ you, opp });
  applyMove(ctx, noMist, "you", "Growl", true, false);
  ok(noMist.oppStages.atk === -1, "(control) the same Growl must land without Mist");

  // The timer really expires: five end-of-turns and it is gone.
  let t = { ...s, youMistTurns: null };
  for (let i = 0; i < 5; i++) t = resolveTurn(ctx, t, "Splash", "Rest")[0].state;
  ok(t.oppMistTurns === null, `Mist must expire after 5 turns (got ${t.oppMistTurns})`);

  ok(AI_HANDLERS.EFFECT_MIST.checkBadMove({ userSideMisted: true }) === -8,
    "AI_CBM_Mist is -8 with it already up -- discouraged, not forbidden");
  console.log("   5-turn timer, blocks Growl entirely, expires on schedule, AI scores -8 to restack");
}

console.log();
console.log("-- PART 2: Stockpile MISSES at three, and Spit Up spends the counter --");
{
  const opp = mk("Swalot", ["Stockpile", "Spit Up", "Swallow", "Body Slam"], { ability: "Liquid Ooze" });
  const ctx = { you, opp };
  const s = buildStartState({ you, opp });
  const deltas = [];
  for (let i = 0; i < 4; i++) {
    const b4 = s.skillOpp;
    applyMove(ctx, s, "opp", "Stockpile", true, false);
    deltas.push(s.skillOpp - b4);
  }
  ok(s.oppStockpile === 3, `the counter must cap at 3 (got ${s.oppStockpile})`);
  // Cmd_stockpile sets MOVE_RESULT_MISSED at the cap, NOT MOVE_RESULT_FAILED --
  // a different Skill outcome, and the reason "missed" exists as an executor
  // return value at all.
  ok(deltas[3] === skillDelta("miss"),
    `the fourth Stockpile must score as a MISS (${skillDelta("miss")}), not a failure (${skillDelta("noEffect")}) -- got ${deltas[3]}`);
  console.log(`   three Stockpiles at ${deltas[0]} Skill each, the fourth at ${deltas[3]} -- a miss, not a failure`);

  // Spit Up scales with the counter and always spends it.
  const dmg = [];
  for (const n of [1, 2, 3]) {
    const st = buildStartState({ you, opp, overrides: { oppStockpile: n } });
    const b = resolveTurn(ctx, st, "Splash", "Spit Up")[0];
    dmg.push(100 - b.state.yourHpPct);
    ok(b.state.oppStockpile === 0, `Spit Up must spend the counter (n=${n})`);
  }
  ok(dmg[0] > 0 && dmg[1] > dmg[0] * 1.9 && dmg[2] > dmg[1] * 1.4,
    `Spit Up must scale with the counter (got ${dmg.map((d) => d.toFixed(1)).join(", ")})`);
  const empty = resolveTurn(ctx, buildStartState({ you, opp }), "Splash", "Spit Up")[0];
  ok(empty.state.yourHpPct === 100, "Spit Up with nothing stored must do nothing at all");
  console.log(`   Spit Up at 1/2/3 stockpiles: ${dmg.map((d) => d.toFixed(1)).join("%, ")}%; empty does nothing`);

  // Swallow: a quarter, a half, everything -- and the counter is spent even
  // when the heal cannot happen.
  for (const [n, want] of [[1, 1 / 4], [2, 1 / 2], [3, 1]]) {
    const st = buildStartState({ you, opp, overrides: { oppStockpile: n, oppHpPct: 1 } });
    applyMove(ctx, st, "opp", "Swallow", true, false);
    const healed = (st.oppHpPct - 1) / 100 * opp.stats.hp;
    const expected = Math.floor(opp.stats.hp / (1 << (3 - n)));
    // Capped at full, which matters at n=3: a quarter-alive mon cannot receive
    // its whole max HP.
    const room = opp.stats.hp - Math.round(0.01 * opp.stats.hp);
    ok(Math.abs(healed - Math.min(expected, room)) <= 1.5,
      `Swallow at ${n} must heal ~${Math.min(expected, room)} HP (got ${healed.toFixed(0)})`);
    ok(st.oppStockpile === 0, "and spend the counter");
  }
  const full = buildStartState({ you, opp, overrides: { oppStockpile: 2, oppHpPct: 100 } });
  const b4full = full.skillOpp;
  applyMove(ctx, full, "opp", "Swallow", true, false);
  ok(full.oppStockpile === 0, "Swallow at full HP must STILL spend the counter");
  // Phase D F37: the failure is BattleScript_SwallowFail, which sets no result
  // flag -- +1, not the -2 this asserted before.
  ok(full.skillOpp - b4full === skillDelta("landed"), "...while failing, +1");
  console.log("   Swallow heals 1/4, 1/2, all -- and spends the counter even at full HP");
}

console.log();
console.log("-- PART 3: Memento trades the user's life for two stat drops --");
{
  // Pressure, not Intimidate: an Intimidate user would already have dropped the
  // player's Attack on the way in, and the probe would read -3 instead of -2.
  const opp = mk("Mightyena", ["Memento", "Body Slam", "Rest", "Crunch"], { ability: "Pressure" });
  const ctx = { you, opp };
  const s = buildStartState({ you, opp });
  applyMove(ctx, s, "opp", "Memento", true, false);
  ok(s.oppHpPct === 0, "the user must be at 0 HP");
  ok(s.youStages.atk === -2 && s.youStages.spa === -2, `the target must be at -2/-2 (got ${s.youStages.atk}/${s.youStages.spa})`);

  // Fails only when the target is ALREADY at minimum in BOTH.
  const maxed = buildStartState({ you, opp, overrides: { youStages: { atk: -6, spa: -6 } } });
  const b4 = maxed.skillOpp;
  applyMove(ctx, maxed, "opp", "Memento", true, false);
  ok(maxed.oppHpPct === 100, "Memento must NOT spend the user when it fails");
  ok(maxed.skillOpp - b4 === skillDelta("noEffect"), "...and must score as a failure");
  const onlyAtk = buildStartState({ you, opp, overrides: { youStages: { atk: -6 } } });
  applyMove(ctx, onlyAtk, "opp", "Memento", true, false);
  ok(onlyAtk.oppHpPct === 0, "one stat at minimum is NOT enough to fail it");

  // Mist blocks the drops -- but the user still pays.
  const misted = buildStartState({ you, opp, overrides: { youMistTurns: 5 } });
  applyMove(ctx, misted, "opp", "Memento", true, false);
  ok(misted.oppHpPct === 0, "through Mist, the user still faints");
  ok(misted.youStages.atk === 0, "...and the drops do not land");
  console.log("   -2/-2 and a self-KO; fails only at double minimum; Mist stops the drops but not the cost");
}

console.log();
console.log("-- PART 4: Magic Coat bounces, and fails when it moves last --");
{
  // A fast bouncer, so the bounce is reachable at all.
  const coat = mk("Espeon", ["Magic Coat", "Psychic", "Rest", "Bite"],
    { ability: "Synchronize", nature: "Timid", evs: { hp: 100, spa: 200, spe: 200 } });
  const ctx = { you, opp: coat };
  const brs = resolveTurn(ctx, buildStartState({ you, opp: coat }), "Toxic", "Magic Coat");
  const landed = brs.filter((b) => b.state.youStatus !== null);
  ok(landed.length >= 1, "the player's Toxic must come back onto the PLAYER");
  ok(brs.every((b) => b.state.oppStatus === null), "and must never land on the bouncer");
  ok(landed.every((b) => b.label.includes("bounced")), "the branch label must say so");
  console.log(`   Toxic bounced: player poisoned on ${(landed.reduce((a, b) => a + b.p, 0) * 100).toFixed(0)}% of branches (its accuracy), bouncer clean`);

  // MAGIC COAT IS PRIORITY +4 (src/data/battle_moves.h:3604-3613), so in
  // singles it moves first against almost anything and its "moves last" failure
  // is nearly unreachable. Nearly: Helping Hand is priority +5. A first draft of
  // this probe used a Shuckle, assumed slow meant last, and watched it move
  // first anyway.
  const hh = mk("Snorlax", ["Helping Hand", "Body Slam", "Toxic", "Splash"]);
  const coat2 = mk("Espeon", ["Magic Coat", "Psychic", "Rest", "Bite"], { ability: "Synchronize" });
  const last = resolveTurn({ you: hh, opp: coat2 }, buildStartState({ you: hh, opp: coat2 }), "Helping Hand", "Magic Coat");
  ok(last.every((b) => b.state.oppBouncing !== true),
    "a Magic Coat used LAST must not set the bounce flag -- it failed");
  console.log("   Magic Coat is priority +4, so it fails only behind a +5 move (Helping Hand), and then it does");

  // The flag does not survive the turn: gProtectStructs is cleared every turn,
  // so a stored state must never carry a stale bounce into the next one.
  ok(brs.every((b) => b.state.oppBouncing === false),
    "bounceMove is a per-turn flag and must not persist into the next turn");
}

console.log();
console.log("-- PART 5: Rapid Spin frees the user --");
{
  const opp = mk("Starmie", ["Rapid Spin", "Surf", "Recover", "Psychic"], { ability: "Natural Cure" });
  const st = buildStartState({ you, opp, overrides: { oppSpikesLayers: 3, oppSeeded: true } });
  const b = resolveTurn({ you, opp }, st, "Splash", "Rapid Spin")[0];
  ok(b.state.oppSpikesLayers === 0, "Rapid Spin must clear the user's Spikes");
  ok(b.state.oppSeeded === false, "...and its Leech Seed");
  ok(b.state.yourHpPct < 100, "...while still being an attack");
  console.log("   spikes cleared, seed cleared, damage still dealt");
}

console.log();
console.log(failures === 0 ? "ALL PASS -- B2b batch 9 characterization green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

// ── test-b7b-item-effects.js ──────────────────────────────────────────────
// B7b characterization: the ItemBattleEffects group.
//
// WHAT CHANGED. Five hold effects that fire outside the damage formula were
// absent — silently, like the rest of the 23 (see B7a's header):
//
//   Shell Bell    src/battle_util.c:3787-3806   heal floor(dmg / 8), min 1
//   Sitrus Berry  :3336-3345                    at hp <= maxHP/2, flat +30 HP
//   White Herb    :3383-3397                    every stage below default -> default
//   Liechi/Salac/Petaya  :3429-3455             at hp <= maxHP/4, +1 to their stat
//
// ALL FIVE ARE PROBED DIRECTLY HERE, both the firing and the not-firing side,
// because only THREE of them move anything in the 5-lead sweep: Petaya, Liechi
// and White Herb have zero real movers. If the only evidence were the sweep,
// two working effects and one broken one would look identical.
import {
  buildMon, buildStartState, resolveTurn, applyMove, analyzeMatchup,
  HOLD_EFFECT_DISPOSITION,
} from "./logic.js";
import { itemData, ITEM_DATA as ITEM_DATA_ALL } from "./item-data.js";
import { getOpponentConfig } from "./opponent-adapter.js";
import { FRONTIER_POOL } from "./frontier-pool.js";
import { LEADS, B7B_ANCHORS } from "./anchors.js";

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } };
const f = Math.floor;

// Snorlax attacking a Ghost: Body Slam does 0, so the opponent's HP only moves
// for reasons this test is actually about.
const you = buildMon({ species: "Snorlax", level: 50, nature: "Adamant", evs: { hp: 252, atk: 252 },
  ability: "Thick Fat", item: null, moves: ["Body Slam", "Earthquake", "Shadow Ball", "Rest"] });
const ghost = (item) => buildMon({ species: "Gengar", level: 50, nature: "Timid", evs: { spa: 252, spe: 252 },
  ability: "Levitate", item, moves: ["Confuse Ray", "Thunderbolt", "Ice Punch", "Psychic"], friendship: 255 });

// One quiet turn: the player's Normal attack does nothing to a Ghost and the
// opponent uses a status move, so only end-of-turn effects change state.
const quietTurn = (opp, overrides) => {
  const s = buildStartState({ you, opp, overrides });
  return { before: s, after: resolveTurn({ you, opp }, s, "Body Slam", "Confuse Ray")[0].state };
};

console.log("-- PART 1: the end-of-turn items, firing and NOT firing --");
{
  // Sitrus: a FLAT param (30) HP, not a fraction, at hp <= floor(maxHP/2).
  {
    const opp = ghost("Sitrus Berry");
    const maxHp = opp.stats.hp;
    const { after } = quietTurn(opp, { oppHpPct: 40 });
    const gained = ((after.oppHpPct - 40) / 100) * maxHp;
    ok(Math.abs(gained - itemData("Sitrus Berry").param) < 1e-6,
      `Sitrus must restore a flat ${itemData("Sitrus Berry").param} HP (restored ${gained.toFixed(3)})`);
    ok(after.oppBerryConsumed === true, "Sitrus must be consumed when it fires");
    const high = quietTurn(ghost("Sitrus Berry"), { oppHpPct: 60 }).after;
    ok(high.oppHpPct === 60 && high.oppBerryConsumed === false,
      `Sitrus must NOT fire above half HP (ended at ${high.oppHpPct})`);
    console.log(`   Sitrus (maxHP ${maxHp}): 40% -> ${after.oppHpPct.toFixed(2)}%, and no-op at 60%`);
  }

  // The three pinch berries: threshold is maxHP / param, and param is 4.
  for (const [item, stat] of [["Liechi Berry", "atk"], ["Salac Berry", "spe"], ["Petaya Berry", "spa"]]) {
    ok(itemData(item).param === 4, `${item} must carry param 4 (the threshold DIVISOR, not a constant)`);
    const lo = quietTurn(ghost(item), { oppHpPct: 20 }).after;
    const hi = quietTurn(ghost(item), { oppHpPct: 60 }).after;
    ok(lo.oppStages[stat] === 1, `${item} must raise ${stat} by 1 at a quarter HP (got ${lo.oppStages[stat]})`);
    ok(lo.oppBerryConsumed === true, `${item} must be consumed when it fires`);
    ok(hi.oppStages[stat] === 0 && hi.oppBerryConsumed === false, `${item} must NOT fire above a quarter HP`);
    // Already maxed -> does not fire, and is not wasted.
    const maxed = quietTurn(ghost(item), { oppHpPct: 20, oppStages: { [stat]: 6 } }).after;
    ok(maxed.oppBerryConsumed === false, `${item} must not be consumed when its stat is already at +6`);
    console.log(`   ${item.padEnd(13)} ${stat} 0 -> ${lo.oppStages[stat]} at 20% HP; no-op at 60%; no-op at +6`);
  }

  // White Herb: raises every LOWERED stage back to default and leaves raised
  // ones alone -- a mon at -2/+2 keeps the +2.
  {
    const { after } = quietTurn(ghost("White Herb"), { oppStages: { atk: -2, spe: -1, def: 2 } });
    ok(after.oppStages.atk === 0 && after.oppStages.spe === 0, "White Herb must restore every lowered stage");
    ok(after.oppStages.def === 2, "White Herb must LEAVE a raised stage alone");
    ok(after.oppBerryConsumed === true, "White Herb must be consumed when it restores something");
    const nothing = quietTurn(ghost("White Herb"), { oppStages: { def: 2 } }).after;
    ok(nothing.oppBerryConsumed === false, "White Herb must NOT be consumed when there is nothing to restore");
    console.log(`   White Herb: -2/-1/+2 -> ${JSON.stringify([after.oppStages.atk, after.oppStages.spe, after.oppStages.def])}, consumed only when it acts`);
  }

  // Single use: one item per mon, so one flag. A consumed berry cannot fire again.
  {
    const opp = ghost("Salac Berry");
    const first = quietTurn(opp, { oppHpPct: 20 }).after;
    const second = resolveTurn({ you, opp }, first, "Body Slam", "Confuse Ray")[0].state;
    ok(second.oppStages.spe === 1, `a consumed Salac must not fire a second time (spe went to ${second.oppStages.spe})`);
  }
}

console.log();
console.log("-- PART 2: Shell Bell heals off the FIRST damaging hit, not the total --");
{
  const beller = buildMon({ species: "Metagross", level: 50, nature: "Adamant", evs: { atk: 252, spe: 252 },
    ability: "Clear Body", item: "Shell Bell", moves: ["Meteor Mash", "Earthquake", "Shadow Ball", "Explosion"] });
  const victim = buildMon({ species: "Blissey", level: 50, nature: "Bold", evs: { hp: 252, def: 252 },
    ability: "Natural Cure", item: null, moves: ["Body Slam", "Ice Beam", "Thunderbolt", "Rest"] });
  const ctx = { you: beller, opp: victim };
  ok(itemData("Shell Bell").param === 8, "Shell Bell's divisor must be 8");

  const s = buildStartState({ you: beller, opp: victim, overrides: { yourHpPct: 50 } });
  const hpBefore = s.yourHpPct, foeBefore = s.oppHpPct;
  applyMove(ctx, s, "you", "Meteor Mash", true, false);
  const dealt = ((foeBefore - s.oppHpPct) / 100) * victim.stats.hp;
  const healed = ((s.yourHpPct - hpBefore) / 100) * beller.stats.hp;
  ok(healed > 0, "Shell Bell must heal its holder after a damaging hit");
  ok(Math.abs(healed - Math.max(1, f(Math.round(dealt) / 8))) < 1.01,
    `Shell Bell must heal about floor(damage / 8) (dealt ${dealt.toFixed(1)}, healed ${healed.toFixed(1)})`);
  console.log(`   Meteor Mash dealt ${dealt.toFixed(0)}, Shell Bell healed ${healed.toFixed(0)} (divisor 8)`);

  // At FULL HP it must not fire at all (source gates on hp != maxHP).
  const full = buildStartState({ you: beller, opp: victim });
  applyMove(ctx, full, "you", "Meteor Mash", true, false);
  ok(full.yourHpPct === 100, "Shell Bell must not fire at full HP");

  // The FIRST-HIT-ONLY quirk, actually exercised rather than just asserted in
  // the heading: source sets shellBellDmg only while it is still zero, so a
  // multi-hit move heals off hit one. Double Kick is EFFECT_DOUBLE_HIT, a fixed
  // 2 hits, so the two hits are equal and the heal must be about HALF of
  // floor(total / 8) -- i.e. floor(oneHit / 8), not floor(total / 8).
  {
    const kicker = buildMon({ species: "Hitmonlee", level: 50, nature: "Adamant", evs: { atk: 252, spe: 252 },
      ability: "Limber", item: "Shell Bell", moves: ["Double Kick", "Rock Slide", "Earthquake", "Body Slam"] });
    const kctx = { you: kicker, opp: victim };
    const ks = buildStartState({ you: kicker, opp: victim, overrides: { yourHpPct: 50 } });
    const foeStart = ks.oppHpPct;
    // NB the argument positions: applyMove takes 17 parameters and hitCount is
    // the LAST one. An earlier draft of this probe passed one extra argument
    // ahead of it, so hitCount arrived as null, the move resolved as a SINGLE
    // hit, and the assertion "failed" for a reason that had nothing to do with
    // Shell Bell.
    applyMove(kctx, ks, "you", "Double Kick", true, false, false, false, false, false, null, null, false, false, false, null, 2);
    const total = Math.round(((foeStart - ks.oppHpPct) / 100) * victim.stats.hp);
    const healedK = Math.round(((ks.yourHpPct - 50) / 100) * kicker.stats.hp);
    const perHit = Math.round(total / 2);
    ok(healedK <= f(total / 8) , `a 2-hit move must NOT heal off the total (total ${total}, healed ${healedK}, total/8 = ${f(total / 8)})`);
    ok(Math.abs(healedK - Math.max(1, f(perHit / 8))) <= 1,
      `it must heal off ONE hit (per-hit ${perHit}, expected about ${Math.max(1, f(perHit / 8))}, healed ${healedK})`);
    console.log(`   Double Kick dealt ${total} over 2 hits; Shell Bell healed ${healedK}, i.e. off one hit (${perHit}), not the total`);
  }

  // A move that does nothing must not heal either.
  const immune = buildMon({ species: "Gengar", level: 50, nature: "Timid", evs: { spa: 252, spe: 252 },
    ability: "Levitate", item: null, moves: ["Shadow Ball", "Thunderbolt", "Ice Punch", "Psychic"] });
  const noEff = buildStartState({ you: beller, opp: immune, overrides: { yourHpPct: 50 } });
  applyMove({ you: beller, opp: immune }, noEff, "you", "Earthquake", true, false);
  ok(noEff.yourHpPct === 50, "Shell Bell must not heal off a move the target is immune to");
  console.log("   no heal at full HP, and none off a zero-effect hit");
}

console.log();
console.log("-- PART 3: every battle hold effect in the ROM is in exactly one bucket --");
{
  // The pool's 29 items are not the universe -- the PLAYER can hold anything,
  // which is how a player-held Pecha Berry tripped the exhaustiveness throw
  // while this test was being written. So the check runs over every hold effect
  // in src/data/items.h, not just the ones an opponent carries.
  const all = new Map();
  for (const r of Object.values(ITEM_DATA_ALL)) {
    if (r.holdEffect === "HOLD_EFFECT_NONE") continue;
    all.set(r.holdEffect, (all.get(r.holdEffect) || 0) + 1);
  }
  const buckets = new Map();
  const missing = [];
  for (const eff of all.keys()) {
    const d = HOLD_EFFECT_DISPOSITION.get(eff);
    if (!d) { missing.push(eff); continue; }
    buckets.set(d[0], (buckets.get(d[0]) || 0) + 1);
  }
  ok(missing.length === 0, `every battle hold effect must be classified (unclassified: ${missing.join(", ")})`);
  const extra = [...HOLD_EFFECT_DISPOSITION.keys()].filter((e) => !all.has(e));
  ok(extra.length === 0, `the table must not classify effects that do not exist (${extra.join(", ")})`);
  console.log(`   ${all.size} battle hold effects, all classified:`);
  for (const [b, n] of [...buckets.entries()].sort((x, y) => y[1] - x[1])) console.log(`     ${String(n).padStart(3)}  ${b}`);
  // The unmodelled bucket must THROW, not quietly pass -- that is the whole point.
  const unmodelled = [...HOLD_EFFECT_DISPOSITION.entries()].filter(([, d]) => d[0] === "unmodelled").map(([e]) => e);
  for (const eff of unmodelled) {
    const item = Object.values(ITEM_DATA_ALL).find((r) => r.holdEffect === eff);
    let threw = false;
    try { quietTurn(ghost(item.name), { oppHpPct: 20 }); } catch { threw = true; }
    ok(threw, `${eff} is on the unmodelled list, so holding ${item.name} MUST throw rather than do nothing`);
  }
  console.log(`   the ${unmodelled.length} unmodelled effects all throw when actually held`);
}

console.log();
console.log("-- PART 3b: every POOL item resolves without throwing --");
{
  // The end-of-turn handler THROWS on any hold effect it does not recognise, so
  // solving one quiet turn with every item in the pool is an exhaustiveness
  // proof: a future item that does nothing silently cannot get through.
  const items = [...new Set(Object.values(FRONTIER_POOL).filter((e) => e.lv50Legal && e.item).map((e) => e.item))];
  let threw = 0;
  for (const item of items) {
    try { quietTurn(ghost(item), { oppHpPct: 20, oppStages: { atk: -1 } }); }
    catch (err) { threw++; console.log(`  FAIL ${item}: ${err.message.split("\n")[0].slice(0, 110)}`); failures++; }
  }
  ok(threw === 0, `${threw} of ${items.length} pool items have no handling and no inert-list entry`);
  console.log(`   ${items.length} distinct pool items all pass the end-of-turn exhaustiveness check`);
}

console.log();
console.log("-- PART 4: recorded movers, and the three effects that move NOTHING --");
{
  const origWarn = console.warn; console.warn = () => {};
  for (const [name, a] of Object.entries(B7B_ANCHORS)) {
    const e = FRONTIER_POOL[name];
    ok(e.item === a.item, `${name} must still hold ${a.item} (holds ${e.item})`);
    const { result } = analyzeMatchup(LEADS[a.lead], getOpponentConfig(name, e.abilities.length > 1 ? { ability: e.abilities[0] } : {}));
    ok(result.move === a.move, `${name} vs ${a.lead}: move ${result.move} !== ${a.move}`);
    ok(result.winProb === a.winProb, `${name} vs ${a.lead}: winProb ${result.winProb} !== ${a.winProb}`);
    console.log(`   ${name.padEnd(22)} ${a.item.padEnd(13)} ${a.pre.move} ${String(a.pre.winProb).slice(0, 8)} -> ${a.move} ${String(a.winProb).slice(0, 8)}`);
  }
  console.warn = origWarn;
  const anchored = new Set(Object.values(B7B_ANCHORS).map((a) => a.item));
  for (const blind of ["Petaya Berry", "Liechi Berry", "White Herb"]) {
    ok(!anchored.has(blind),
      `${blind} is recorded as having no sweep mover, but an anchor now claims one -- update the blind-spot note`);
  }
  console.log("   blind spot held: Petaya, Liechi and White Herb have no anchor; PART 1's probes are their only guard");
}

console.log();
console.log(failures === 0 ? "ALL PASS -- B7b characterization green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

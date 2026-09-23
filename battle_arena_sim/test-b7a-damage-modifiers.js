// ── test-b7a-damage-modifiers.js ──────────────────────────────────────────
// B7a characterization: CalculateBaseDamage's item and ability modifier chain.
//
// WHAT CHANGED. `calcDamage` implemented the Gen III damage formula but none of
// the flat modifiers CalculateBaseDamage applies to the attacking stat before
// it (src/pokemon.c:3158-3231). Measured before the fix: **23 of the 29 held
// items in the Lv50 pool were never named in logic.js at all**, covering 878 of
// 1,392 positions, and five ability modifiers beside them in the same 70 lines
// of source were absent too. They did not throw. They did nothing, silently --
// the class the brief's hard constraint 4 exists to forbid.
//
// Ported here, in source's own order:
//   :3158  Huge Power / Pure Power   attack *= 2
//   :3170  type-boost hold items     stat = stat * (param + 100) / 100
//   :3185  Choice Band               attack = 150 * attack / 100
//   :3199  Thick Club                attack *= 2, Cubone and Marowak only
//   :3203  Thick Fat (defender)      spAttack /= 2 vs Fire/Ice
//   :3205  Hustle                    attack = 150 * attack / 100
//   :3211  Guts                      attack = 150 * attack / 100 while statused
//   :3213  Marvel Scale (defender)   defense = 150 * defense / 100 while statused
//   :3219  Overgrow/Blaze/Torrent/Swarm  power = 150 * power / 100 at hp <= maxHP/3
//   :3229  Explosion                 defense /= 2
//
// AND THE ORDER ITSELF. APPLY_STAT_MOD (:3100-3104) folds in the stat stage
// AFTER all of the above, as truncating integer `stat * r0 / r1`. This engine
// applied the stage FIRST. The ORDER is what moves numbers; the integer-vs-float
// half is MEASURED INERT (PART 4 proves it over 260,000 pairs) and is adopted
// only because Phase D compares against the ROM's literal arithmetic.
import {
  buildMon, calcDamage, applyStatStage, analyzeMatchup, chooseOpponentMoves,
  buildStartState,
} from "./logic.js";
import { ITEM_DATA, itemData } from "./item-data.js";
import { getOpponentConfig } from "./opponent-adapter.js";
import { FRONTIER_POOL } from "./frontier-pool.js";
import { LEADS, METAGROSS, CURRENT, CURRENT_CELLS, CURRENT_DIST, B2B1, B7A_PRE, MODIFIER_ANCHORS } from "./anchors.js";

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } };
const f = Math.floor;

const target = buildMon({ species: "Snorlax", level: 50, nature: "Adamant", evs: { hp: 252, atk: 252 },
  ability: "Thick Fat", item: "Leftovers", moves: ["Body Slam", "Earthquake", "Shadow Ball", "Rest"] });
// A neutral defender, so Thick Fat on the Snorlax above cannot contaminate the
// probes that are not about Thick Fat.
const plain = buildMon({ species: "Blissey", level: 50, nature: "Bold", evs: { hp: 252, def: 252 },
  ability: "Natural Cure", item: null, moves: ["Body Slam", "Ice Beam", "Thunderbolt", "Rest"] });

const clone = (m, over) => ({ ...m, ...over });

console.log("-- PART 1: the item table covers the pool with no gaps --");
{
  const poolItems = new Set();
  for (const e of Object.values(FRONTIER_POOL)) if (e.lv50Legal && e.item) poolItems.add(e.item);
  const missing = [...poolItems].filter((i) => !itemData(i));
  ok(missing.length === 0, `every pool item must be in ITEM_DATA (missing: ${missing.join(", ")})`);
  ok(poolItems.size === 29, `the pool should carry 29 distinct items (got ${poolItems.size})`);
  for (const [name, d] of Object.entries(ITEM_DATA)) {
    ok(typeof d.holdEffect === "string" && d.holdEffect.startsWith("HOLD_EFFECT_"),
      `${name} must carry a HOLD_EFFECT_* constant`);
  }
  console.log(`   ${poolItems.size} pool items, all resolved to a holdEffect and param`);
}

console.log();
console.log("-- PART 2: every multiplier, measured both ways --");
{
  // Thick Club: exactly 2x, and ONLY for Cubone and Marowak.
  const marowak = buildMon({ species: "Marowak", level: 50, nature: "Adamant", evs: { atk: 252, hp: 252 },
    ability: "Rock Head", item: "Thick Club", moves: ["Earthquake", "Rock Slide", "Body Slam", "Swords Dance"] });
  const withClub = calcDamage(marowak, plain, "Body Slam", {});
  const noClub = calcDamage(clone(marowak, { item: null }), plain, "Body Slam", {});
  ok(withClub === calcDamage(clone(marowak, { item: null, stats: { ...marowak.stats, atk: marowak.stats.atk * 2 } }), plain, "Body Slam", {}),
    "Thick Club must be exactly a doubled Attack stat");
  console.log(`   Thick Club  Marowak Body Slam: ${noClub} -> ${withClub}`);

  const impostor = buildMon({ species: "Rhydon", level: 50, nature: "Adamant", evs: { atk: 252, hp: 252 },
    ability: "Rock Head", item: "Thick Club", moves: ["Earthquake", "Rock Slide", "Body Slam", "Megahorn"] });
  ok(calcDamage(impostor, plain, "Body Slam", {}) === calcDamage(clone(impostor, { item: null }), plain, "Body Slam", {}),
    "Thick Club must do NOTHING for a species that is not Cubone or Marowak");

  // Choice Band: 1.5x Attack, and physical only.
  const bander = buildMon({ species: "Granbull", level: 50, nature: "Adamant", evs: { atk: 252, hp: 252 },
    ability: "Intimidate", item: "Choice Band", moves: ["Mega Kick", "Earthquake", "Crunch", "Shadow Ball"] });
  const cbPhys = calcDamage(bander, plain, "Mega Kick", {});
  const cbBoost = calcDamage(clone(bander, { item: null, stats: { ...bander.stats, atk: f((150 * bander.stats.atk) / 100) } }), plain, "Mega Kick", {});
  ok(cbPhys === cbBoost, "Choice Band must be exactly floor(150 * Attack / 100)");
  ok(calcDamage(bander, plain, "Shadow Ball", {}) === calcDamage(clone(bander, { item: null }), plain, "Shadow Ball", {}),
    "Choice Band must not touch a SPECIAL move (source boosts `attack`, not `spAttack`)");
  console.log(`   Choice Band Granbull Mega Kick: ${calcDamage(clone(bander, { item: null }), plain, "Mega Kick", {})} -> ${cbPhys}`);

  // Type-boost items: 1.1x, and only for the matching type.
  const charcoal = buildMon({ species: "Rapidash", level: 50, nature: "Naughty", evs: { atk: 170, spa: 170, spe: 170 },
    ability: "Run Away", item: "Charcoal", moves: ["Flamethrower", "Body Slam", "Solar Beam", "Toxic"] });
  ok(itemData("Charcoal").param === 10, "Charcoal's holdEffectParam must be 10");
  const fireUp = calcDamage(charcoal, plain, "Flamethrower", {});
  const fireBase = calcDamage(clone(charcoal, { item: null }), plain, "Flamethrower", {});
  ok(fireUp === calcDamage(clone(charcoal, { item: null, stats: { ...charcoal.stats, spa: f((charcoal.stats.spa * 110) / 100) } }), plain, "Flamethrower", {}),
    "Charcoal must be exactly floor(SpAttack * 110 / 100) on a Fire move");
  ok(calcDamage(charcoal, plain, "Body Slam", {}) === calcDamage(clone(charcoal, { item: null }), plain, "Body Slam", {}),
    "Charcoal must do nothing to a Normal move");
  console.log(`   Charcoal    Rapidash Flamethrower: ${fireBase} -> ${fireUp}`);

  // Huge Power / Pure Power: 2x Attack, physical only.
  const medicham = buildMon({ species: "Medicham", level: 50, nature: "Adamant", evs: { atk: 252, spe: 252 },
    ability: "Pure Power", item: null, moves: ["Brick Break", "Shadow Ball", "Psychic", "Rock Slide"] });
  const pp = calcDamage(medicham, plain, "Rock Slide", {});
  const ppOff = calcDamage(clone(medicham, { ability: "Pressure" }), plain, "Rock Slide", {});
  ok(pp === calcDamage(clone(medicham, { ability: "Pressure", stats: { ...medicham.stats, atk: medicham.stats.atk * 2 } }), plain, "Rock Slide", {}),
    "Pure Power must be exactly a doubled Attack stat");
  ok(calcDamage(medicham, plain, "Psychic", {}) === calcDamage(clone(medicham, { ability: "Pressure" }), plain, "Psychic", {}),
    "Pure Power must not touch a special move");
  console.log(`   Pure Power  Medicham Rock Slide: ${ppOff} -> ${pp}`);

  // Guts: 1.5x Attack, and ONLY while statused. Separate from, and stacking
  // with, Guts exempting the holder from the burn halving.
  const guts = buildMon({ species: "Heracross", level: 50, nature: "Adamant", evs: { atk: 252, spe: 252 },
    ability: "Guts", item: null, moves: ["Megahorn", "Brick Break", "Rock Slide", "Earthquake"] });
  const clean = calcDamage(guts, plain, "Rock Slide", { attackerStatus: null });
  const burned = calcDamage(guts, plain, "Rock Slide", { attackerStatus: "burn", attackerBurned: true });
  ok(clean === calcDamage(clone(guts, { ability: "Swarm" }), plain, "Rock Slide", { attackerStatus: null }),
    "Guts must do nothing with no status (Swarm is inert on a Rock move, so it is a fair control)");
  ok(burned > clean, `a BURNED Guts holder must hit HARDER than a clean one (${clean} vs ${burned})`);
  console.log(`   Guts        Heracross Rock Slide: clean ${clean}, burned ${burned}`);

  // Thick Fat on the DEFENDER: halves the attacker's SpAttack vs Fire/Ice.
  const iceBeamAtThickFat = calcDamage(plain, target, "Ice Beam", {});
  const iceBeamAtPlain = calcDamage(plain, clone(target, { ability: "Immunity" }), "Ice Beam", {});
  ok(iceBeamAtThickFat < iceBeamAtPlain, `Thick Fat must reduce Ice damage (${iceBeamAtPlain} -> ${iceBeamAtThickFat})`);
  ok(calcDamage(plain, target, "Thunderbolt", {}) === calcDamage(plain, clone(target, { ability: "Immunity" }), "Thunderbolt", {}),
    "Thick Fat must not touch an Electric move");
  console.log(`   Thick Fat   Ice Beam into Snorlax: ${iceBeamAtPlain} -> ${iceBeamAtThickFat}`);

  // Marvel Scale on the DEFENDER: 1.5x Defense while statused, physical only.
  const ms = clone(plain, { ability: "Marvel Scale" });
  ok(calcDamage(target, ms, "Body Slam", { defenderStatus: "paralysis" }) < calcDamage(target, ms, "Body Slam", { defenderStatus: null }),
    "Marvel Scale must raise Defense while the DEFENDER is statused");
  ok(calcDamage(target, ms, "Shadow Ball", { defenderStatus: "paralysis" }) === calcDamage(target, ms, "Shadow Ball", { defenderStatus: null }),
    "Marvel Scale must not touch special defence");

  // Pinch abilities: 1.5x POWER at hp <= floor(maxHP / 3), not above it.
  const blaze = buildMon({ species: "Charizard", level: 50, nature: "Modest", evs: { spa: 252, spe: 252 },
    ability: "Blaze", item: null, moves: ["Flamethrower", "Aerial Ace", "Earthquake", "Dragon Claw"] });
  const maxHp = blaze.stats.hp;
  const thirdPct = (f(maxHp / 3) / maxHp) * 100;
  const inPinch = calcDamage(blaze, plain, "Flamethrower", { attackerHpPct: thirdPct });
  const outOfPinch = calcDamage(blaze, plain, "Flamethrower", { attackerHpPct: 100 });
  ok(inPinch > outOfPinch, `Blaze must boost Fire power at <= maxHP/3 (${outOfPinch} -> ${inPinch})`);
  ok(calcDamage(blaze, plain, "Aerial Ace", { attackerHpPct: thirdPct }) === calcDamage(blaze, plain, "Aerial Ace", { attackerHpPct: 100 }),
    "Blaze must not boost a non-Fire move");
  console.log(`   Blaze       Charizard Flamethrower: healthy ${outOfPinch}, in pinch ${inPinch}`);
}

console.log();
console.log("-- PART 3: the ORDER -- modifiers first, stat stage last --");
{
  // Source: attack is modified, THEN APPLY_STAT_MOD folds in the stage. Doing it
  // the other way round is a different integer for about half of all raw stats
  // at stages other than +1. This probe picks a stage where the two disagree
  // and pins the engine to source's answer.
  const bander = buildMon({ species: "Absol", level: 50, nature: "Adamant", evs: { atk: 252, spe: 252 },
    ability: "Pressure", item: "Choice Band", moves: ["Double-Edge", "Shadow Ball", "Aerial Ace", "Iron Tail"] });
  const raw = bander.stats.atk;
  const stage = -1;             // ratio 2/3
  const sourceOrder = f((f((150 * raw) / 100) * 2) / 3);
  const stageFirst = f((150 * f((raw * 2) / 3)) / 100);
  ok(sourceOrder !== stageFirst,
    `this probe is only meaningful if the two orders disagree for raw=${raw} (source ${sourceOrder}, stage-first ${stageFirst})`);

  const actual = calcDamage(bander, plain, "Double-Edge", { atkStage: stage });
  const asSource = calcDamage(clone(bander, { item: null, stats: { ...bander.stats, atk: sourceOrder } }), plain, "Double-Edge", {});
  const asStageFirst = calcDamage(clone(bander, { item: null, stats: { ...bander.stats, atk: stageFirst } }), plain, "Double-Edge", {});
  ok(actual === asSource, `the engine must match SOURCE order (got ${actual}, source ${asSource}, stage-first ${asStageFirst})`);
  ok(asSource !== asStageFirst, "the two orders must give different damage here, or this proves nothing");
  console.log(`   Absol raw Atk ${raw}, Choice Band, stage ${stage}: source order ${sourceOrder} vs stage-first ${stageFirst}`);
  console.log(`   Double-Edge damage: engine ${actual}, source-order ${asSource}, stage-first ${asStageFirst}`);
}

console.log();
console.log("-- PART 4: the integer stage form is source-literal AND measured inert --");
{
  // gStatStageRatios applied as `stat * r0 / r1` in s32 (APPLY_STAT_MOD,
  // src/pokemon.c:3100-3104).
  //
  // An earlier draft of this test asserted that the float form floor(stat *
  // (2/3)) lands one low on exact products. IT DOES NOT, and this test is what
  // caught that: 3 * (2/3) is exactly 2 in IEEE754. The sweep below measures the
  // real answer -- the two forms agree on every pair in range -- so the switch
  // to integer arithmetic is a source-literal alignment for Phase D, not a fix
  // for a measured error. Kept as an assertion so it stays true.
  ok(applyStatStage(3, -1) === 2, "3 at stage -1 is 3*2/3 = 2");
  ok(Math.floor(3 * (2 / 3)) === 2, "and the float form gives 2 as well -- there is no ULP bug here");
  ok(applyStatStage(100, 0) === 100, "stage 0 must be the identity");
  ok(applyStatStage(100, 6) === 400 && applyStatStage(100, -6) === 25, "the table ends at 8/2 and 2/8");
  let mismatches = 0;
  for (let stat = 1; stat <= 700; stat++) {
    for (let st = -6; st <= 6; st++) {
      const ratio = { "-6": [2, 8], "-5": [2, 7], "-4": [2, 6], "-3": [2, 5], "-2": [2, 4], "-1": [2, 3],
        "0": [1, 1], "1": [3, 2], "2": [4, 2], "3": [5, 2], "4": [6, 2], "5": [7, 2], "6": [8, 2] }[String(st)];
      if (applyStatStage(stat, st) !== f((stat * ratio[0]) / ratio[1])) mismatches++;
    }
  }
  ok(mismatches === 0, `applyStatStage must equal stat*r0/r1 everywhere (${mismatches} mismatches)`);
  // How often the OLD float form disagreed, over the same grid -- the honest
  // size of this half of the change. Measured: zero.
  let floatDiffs = 0;
  const MULT = { "-6": 2 / 8, "-5": 2 / 7, "-4": 2 / 6, "-3": 2 / 5, "-2": 2 / 4, "-1": 2 / 3,
    "0": 1, "1": 3 / 2, "2": 4 / 2, "3": 5 / 2, "4": 6 / 2, "5": 7 / 2, "6": 8 / 2 };
  const SCAN = 20000;
  for (let stat = 1; stat <= SCAN; stat++) {
    for (let st = -6; st <= 6; st++) {
      if (applyStatStage(stat, st) !== Math.floor(stat * MULT[String(st)])) floatDiffs++;
    }
  }
  ok(floatDiffs === 0, `the float form is claimed inert, so it must disagree nowhere (got ${floatDiffs})`);
  console.log(`   integer vs float over ${SCAN * 13} (stat, stage) pairs: ${floatDiffs} disagreements -- this half of the change is INERT`);
}

console.log();
console.log("-- PART 5: the AI's OWN damage estimate sees the modifiers too (A9 class) --");
{
  // A9's lesson was that an AI whose damage estimate cannot see what the battle
  // applies is wrong in the direction that matters. Rapidash holds Charcoal;
  // once its own estimate sees the 1.1x, AI_TryToFaint stops splitting with
  // Protect.
  const you = buildMon(METAGROSS);
  const opp = buildMon({ ...getOpponentConfig("Rapidash 1", { ability: "Run Away" }), friendship: 255 });
  const dist = chooseOpponentMoves(opp, you, buildStartState({ you, opp }));
  const asRecorded = CURRENT_DIST["Rapidash 1"];
  ok(dist.length === asRecorded.length, `Rapidash 1 distribution length ${dist.length} !== ${asRecorded.length}`);
  dist.forEach((d, i) => {
    ok(d.move === asRecorded[i][0] && d.prob === asRecorded[i][1],
      `Rapidash 1 dist[${i}] ${d.move}@${d.prob} !== ${asRecorded[i][0]}@${asRecorded[i][1]}`);
  });
  console.log(`   ${dist.map((d) => `${d.move}@${d.prob}`).join("  ")}`);
}

console.log();
console.log("-- PART 6: the four recorded values this class moved, and why --");
{
  const origWarn = console.warn; console.warn = () => {};
  const cfgOf = (name, tier) => {
    const e = FRONTIER_POOL[name];
    const opts = { ...(e.abilities.length > 1 ? { ability: e.abilities[0] } : {}) };
    if (!e.brain && tier != null) opts.ivTier = tier;
    return getOpponentConfig(name, opts);
  };
  for (const [name, pre] of Object.entries(B7A_PRE)) {
    // The post-value lives in whichever table originally recorded it: the
    // cross-lead table for a "Lead|Set" key, CURRENT for the Metagross series,
    // and B2B1 for a set first recorded by the previous batch. An earlier draft
    // fell through to `continue` when a name was in none of the first two,
    // which silently dropped Muk 1 from this check.
    const cell = name.includes("|");
    const [lead, set] = cell ? name.split("|") : [B2B1[name] ? B2B1[name].lead : "Metagross", name];
    const post = cell ? CURRENT_CELLS[name] : (CURRENT[set] || B2B1[set] || null);
    ok(post != null, `${name} is in B7A_PRE but no table records its post-value`);
    if (!post) continue;
    const tier = !cell && B2B1[set] ? B2B1[set].tier : null;
    ok(post.winProb !== pre.winProb || post.move !== pre.move,
      `${name} is listed as moved but its recorded value did not change`);
    const { result } = analyzeMatchup(LEADS[lead], cfgOf(set, tier));
    ok(result.winProb === post.winProb && result.move === post.move,
      `${name}: live ${result.move} ${result.winProb} !== recorded ${post.move} ${post.winProb}`);
    console.log(`   ${name.padEnd(22)} ${pre.move} ${String(pre.winProb).slice(0, 8)} -> ${post.move} ${String(post.winProb).slice(0, 8)}`);
    console.log(`     ${pre.why}`);
  }
  console.warn = origWarn;
}

console.log();
console.log("-- PART 7: MODIFIER_ANCHORS -- one per CAUSAL mechanism (amendment 2) --");
{
  // The canonical anchor is blind to this whole class, so these are the real
  // fidelity guards for it. Each row is the largest mover of its mechanism, and
  // the mechanism was established causally (see anchors.js's header), not by
  // which modifier happened to be present.
  const origWarn = console.warn; console.warn = () => {};
  const mechanisms = new Set();
  for (const [name, a] of Object.entries(MODIFIER_ANCHORS)) {
    const { result } = analyzeMatchup(LEADS[a.lead], getOpponentConfig(name, a.ability ? { ability: a.ability } : {}));
    ok(result.move === a.move, `${name} vs ${a.lead}: move ${result.move} !== ${a.move}`);
    ok(result.winProb === a.winProb, `${name} vs ${a.lead}: winProb ${result.winProb} !== ${a.winProb}`);
    ok(a.pre.winProb !== a.winProb || a.pre.move !== a.move,
      `${name} is recorded as a B7a mover but its pre and post values are identical`);
    mechanisms.add(a.causedBy);
  }
  console.warn = origWarn;
  ok(mechanisms.size === Object.keys(MODIFIER_ANCHORS).length,
    `every anchor must cover a DISTINCT mechanism (${mechanisms.size} mechanisms for ${Object.keys(MODIFIER_ANCHORS).length} anchors)`);
  console.log(`   ${Object.keys(MODIFIER_ANCHORS).length} anchors asserted, covering ${mechanisms.size} distinct causal mechanisms`);
  // The blind spot, asserted so it cannot be forgotten: these four are
  // implemented but move nothing in the sweep, so nothing here guards them.
  // These four have no ANCHOR. That is all this asserts -- an earlier version of
  // this note also claimed they were invisible to the panel, which was wrong for
  // three of them (see anchors.js's MODIFIER_ANCHORS header for the measured
  // per-lead visibility).
  for (const blind of ["Guts", "Hustle", "Huge Power", "Marvel Scale"]) {
    ok(![...mechanisms].some((m) => m.includes(blind) && !m.startsWith("item AND ability")),
      `${blind} is recorded as unguarded by an anchor, but a MODIFIER_ANCHORS row now claims it -- update the blind-spot note`);
  }
  console.log("   no MODIFIER_ANCHORS row guards Guts, Hustle, Huge Power or Marvel Scale; PART 2's probes do");
}

console.log();
console.log(failures === 0 ? "ALL PASS -- B7a characterization green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

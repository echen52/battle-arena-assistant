// ── test-b7c-accuracy-chain.js ────────────────────────────────────────────
// B7c part 1: the accuracy chain (src/battle_script_commands.c:1128-1174).
//
// WHAT CHANGED. Three things, only one of which was a missing item:
//
//  1. BrightPowder (HOLD_EFFECT_EVASION_UP, param 10) was absent -- 82 sets,
//     130 positions, doing nothing silently like the rest of the 23.
//  2. Compound Eyes (1.3x) and HUSTLE'S ACCURACY PENALTY (0.8x on physical
//     moves) were absent too. The Hustle half matters more than its size
//     suggests: B7a ported Hustle's 1.5x Attack and NOT the accuracy it pays,
//     which made Hustle a pure buff. Half a port is worse than none.
//  3. THE CAP WAS IN THE WRONG PLACE. `effectiveAccuracy` capped at 100 and the
//     caller then multiplied Sand Veil's 0.8 onto the CAPPED value. Source
//     never caps -- it multiplies onto the running `calc` and only compares
//     `Random() % 100 + 1 > calc` at the very end. A calc of 130 against a Sand
//     Veil holder is 104 in source, a guaranteed hit; it was 80 here.
//
// Source order, now reproduced exactly:
//   calc = floor(stageRatio.dividend * moveAcc / divisor)
//   Compound Eyes  :1152   calc = calc * 130 / 100
//   Sand Veil      :1154   calc = calc *  80 / 100   (sandstorm only)
//   Hustle         :1156   calc = calc *  80 / 100   (physical only)
//   BrightPowder   :1172   calc = calc * (100 - param) / 100
import { accuracyCalc, buildMon, analyzeMatchup } from "./logic.js";
import { itemData } from "./item-data.js";
import { getOpponentConfig } from "./opponent-adapter.js";
import { FRONTIER_POOL } from "./frontier-pool.js";
import { LEADS, B7C_ANCHORS } from "./anchors.js";

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } };
const f = Math.floor;
// accuracyCalc is POSITIONAL (it is on the hot path; the options-object form
// cost throughput). This wrapper keeps the probes readable.
const calc = (o = {}) => accuracyCalc(
  o.baseAccuracy ?? 100, o.attackerAccStage ?? 0, o.targetEvasionStage ?? 0,
  o.attackerAbility ?? null, o.defenderAbility ?? null, o.defenderItem ?? null,
  o.weather ?? null, o.physical ?? false);
const base = (over) => calc(over);

console.log("-- PART 1: each multiplier, on and off --");
{
  ok(base({}) === 100, `a clean 100-accuracy move must be calc 100 (got ${base({})})`);

  ok(base({ attackerAbility: "Compound Eyes" }) === f((100 * 130) / 100),
    "Compound Eyes must be exactly calc * 130 / 100");
  ok(base({ attackerAbility: "Compound Eyes" }) === 130, "...which is 130 on a 100-accuracy move");

  ok(base({ defenderAbility: "Sand Veil", weather: "sandstorm" }) === 80,
    "Sand Veil in sandstorm must be calc * 80 / 100");
  ok(base({ defenderAbility: "Sand Veil", weather: null }) === 100,
    "Sand Veil OUTSIDE sandstorm must do nothing");
  ok(base({ defenderAbility: "Sand Veil", weather: "rain" }) === 100,
    "Sand Veil in the wrong weather must do nothing");

  ok(base({ attackerAbility: "Hustle", physical: true }) === 80,
    "Hustle must cost 20% accuracy on a PHYSICAL move");
  ok(base({ attackerAbility: "Hustle", physical: false }) === 100,
    "Hustle must not touch a special move's accuracy");

  ok(itemData("BrightPowder").param === 10, "BrightPowder's param must be 10");
  ok(base({ defenderItem: "BrightPowder" }) === 90, "BrightPowder must be calc * 90 / 100");
  ok(base({ defenderItem: "Leftovers" }) === 100, "an unrelated item must not touch accuracy");
  ok(base({ defenderItem: null }) === 100 && base({ defenderItem: "None" }) === 100,
    "both no-item spellings must be neutral");
  console.log("   Compound Eyes 130, Sand Veil 80 (sandstorm only), Hustle 80 (physical only), BrightPowder 90");
}

console.log();
console.log("-- PART 2: UNCAPPED, and the cap-ordering bug this replaces --");
{
  // +6 accuracy stage is ratio 3/1, so a 100-accuracy move reaches calc 300.
  const boosted = calc({ attackerAccStage: 6 });
  ok(boosted === 300, `the chain must NOT cap: +6 accuracy on a 100 move is calc 300 (got ${boosted})`);

  // The exact case the old code got wrong. calc 130 (a 100-acc move at +1
  // accuracy is 133; use Compound Eyes for a clean 130), then BrightPowder.
  const chained = calc({ attackerAbility: "Compound Eyes", defenderItem: "BrightPowder" });
  const sourceAnswer = f((f((100 * 130) / 100) * 90) / 100);
  const oldCappedAnswer = f((Math.min(100, 100) * 90) / 100);
  ok(chained === sourceAnswer, `must match source order (got ${chained}, source ${sourceAnswer})`);
  ok(chained === 117 && oldCappedAnswer === 90,
    `the two orders must differ here or this proves nothing (${chained} vs ${oldCappedAnswer})`);
  ok(chained >= 100, "and source's answer is still a GUARANTEED hit, where the old one was 90%");
  console.log(`   Compound Eyes + BrightPowder: source ${chained} (guaranteed hit), cap-first ${oldCappedAnswer} (90%)`);

  // Same shape with the Sand Veil case the old comment called "a minor
  // ordering simplification".
  const sv = calc({ attackerAbility: "Compound Eyes", defenderAbility: "Sand Veil", weather: "sandstorm" });
  ok(sv === 104, `Compound Eyes then Sand Veil is 104, not 80 (got ${sv})`);
  ok(sv >= 100, "104 is still a guaranteed hit; the old path turned it into 80%");
  console.log(`   Compound Eyes + Sand Veil: ${sv} (guaranteed hit), cap-first would give 80`);
}

console.log();
console.log("-- PART 3: Hustle is now a whole port, not half of one --");
{
  // The accuracy penalty exists AND the Attack boost from B7a still does.
  const hustler = buildMon({ species: "Togepi", level: 50, nature: "Adamant", evs: { atk: 252, spe: 252 },
    ability: "Hustle", item: null, moves: ["Body Slam", "Shadow Ball", "Rest", "Metronome"] });
  const plain = buildMon({ species: "Blissey", level: 50, nature: "Bold", evs: { hp: 252, def: 252 },
    ability: "Natural Cure", item: null, moves: ["Body Slam", "Ice Beam", "Thunderbolt", "Rest"] });
  ok(base({ attackerAbility: "Hustle", physical: true }) < base({ physical: true }),
    "Hustle must COST accuracy on physical moves");
  // (its Attack half is asserted in test-b7a-damage-modifiers.js PART 2)
  ok(hustler.ability === "Hustle" && plain.ability === "Natural Cure", "probe mons built as intended");
  console.log("   accuracy penalty present here; the 1.5x Attack is asserted in the B7a test");
}

console.log();
console.log("-- PART 4: recorded movers --");
{
  const origWarn = console.warn; console.warn = () => {};
  for (const [name, a] of Object.entries(B7C_ANCHORS)) {
    const e = FRONTIER_POOL[name];
    ok(e.item === a.item, `${name} must still hold ${a.item} (holds ${e.item})`);
    const { result } = analyzeMatchup(LEADS[a.lead], getOpponentConfig(name, e.abilities.length > 1 ? { ability: e.abilities[0] } : {}));
    ok(result.move === a.move, `${name} vs ${a.lead}: move ${result.move} !== ${a.move}`);
    ok(result.winProb === a.winProb, `${name} vs ${a.lead}: winProb ${result.winProb} !== ${a.winProb}`);
    console.log(`   ${name.padEnd(16)} vs ${a.lead.padEnd(10)} ${a.pre.move} ${String(a.pre.winProb).slice(0, 8)} -> ${a.move} ${String(a.winProb).slice(0, 8)}`);
  }
  console.warn = origWarn;
  console.log("   blind spot: Compound Eyes and Hustle's accuracy penalty produce NO sweep movers");
  console.log("   (all 319 attribute causally to BrightPowder); PART 1 is their only guard");
}

console.log();
console.log(failures === 0 ? "ALL PASS -- B7c accuracy-chain characterization green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

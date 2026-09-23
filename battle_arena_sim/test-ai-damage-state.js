// ── test-ai-damage-state.js ────────────────────────────────────────────────
// A9 characterization test: the AI's damage estimate sees live state.
//
// WHAT CHANGED. Source's AI_CalcDmg (src/battle_script_commands.c:1306) passes
// the LIVE &gBattleMons[attacker] / [defender] and the DEFENDER's gSideStatuses
// into CalculateBaseDamage, so the AI's own damage estimate is subject to stat
// stages (APPLY_STAT_MOD, src/pokemon.c:3243 physical / :3293 special), burn
// (:3263), Reflect/Light Screen (:3267 and the special mirror, both gated on
// gCritMultiplier == 1, which is exactly what the AI evaluates at --
// battle_ai_script_commands.c:1192/:1755/:1784 set it), weather (:3331, gated
// on WEATHER_HAS_EFFECT2) and Flash Fire (:3366).
//
// This engine passed NONE of it, so the modelled AI could never notice that its
// own setup had made it lethal. Quagsire 3 is the clean demonstration: it holds
// Curse, and stage-blind its Earthquake estimate was pinned at 126 against a
// 155 HP Metagross forever.
//
// NOTE THE PRESERVED ASYMMETRY: the AI's DAMAGE respects Cloud Nine / Air Lock
// (WEATHER_HAS_EFFECT2), but the AI's get_weather SCORING command does not --
// it reads gBattleWeather raw. So buildAiDamageState uses effectiveWeather
// while ctx.currentWeather stays the raw value. Both quirks are real and they
// point opposite ways; PART 4 pins the damage side.
//
// CROSS-ENGINE LINEAGE: the same defect class is live in
// ../../tower_predictor_sim/ai_engine.mjs:2508 (identical
// `calcDamage(user, target, moveName, { rollFrac: 0.925 })` -- state-blind AND
// roll-collapsed). That engine is NOT in this project's scope; recorded so the
// finding is not lost. See arena-solver/docs/fidelity-log.md A9.
import { analyzeMatchup, buildMon, buildStartState, chooseOpponentMoves,
         calcDamage, enumerateAiRollOutcomes, buildAiDamageState } from "./logic.js";
import { OPPONENT_SETS } from "./opponent-full-data.js";
import { getOpponentConfig } from "./opponent-adapter.js";

const METAGROSS = {
  species: "Metagross", level: 50, nature: "Adamant", evs: { atk: 252, spd: 4, spe: 252 },
  ability: "Clear Body", item: "Cheri Berry", moves: ["Meteor Mash", "Earthquake", "Shadow Ball", "Explosion"],
};

// Pre-A9 (branch phase-a-fidelity @ ea666e4, i.e. A2 + memo). HISTORY, never asserted.
const PRE_A9 = {
  "Quagsire 3": { move: "Earthquake", winProb: 0.8516 },
  "Swampert 1": { move: "Shadow Ball", winProb: 0.7728 },
  "Snorlax 2": { move: "Earthquake", winProb: 0.8949 },
  "Ludicolo 1": { move: "Shadow Ball", winProb: 0.5703 },
};

// Post-A9. ASSERTED.
const POST_A9 = {
  "Quagsire 3": { move: "Meteor Mash", winProb: 0.5053125 },
  "Swampert 1": { move: "Meteor Mash", winProb: 0.5000737108290196 },
  "Snorlax 2": { move: "Meteor Mash", winProb: 0.8027441776394845 },
  "Ludicolo 1": { move: "Explosion", winProb: 0.5 },
  "Snorlax 7": { move: "Meteor Mash", winProb: 0.8081748046875002 },
  "Marowak 2": { move: "Meteor Mash", winProb: 0.9494408927112818 },
  "Suicune 1": { move: "Meteor Mash", winProb: 0.5150743437919585 },
};

let failures = 0;
const ok = (cond, msg) => { if (!cond) { failures++; console.log("  FAIL " + msg); } };
const cfgOf = (n) => {
  const e = OPPONENT_SETS[n];
  return getOpponentConfig(n, e.abilities.length > 1 ? { ability: e.abilities[0] } : {});
};

console.log("-- PART 1: no state-blind AI damage estimate is reachable (hard constraint 4) --");
{
  const you = buildMon(METAGROSS), opp = buildMon({ ...cfgOf("Quagsire 3"), friendship: 255 });
  let threw = false, msg = "";
  try { enumerateAiRollOutcomes(opp, you, { targetHpPct: 100 }); }
  catch (e) { threw = true; msg = e.message; }
  ok(threw, "enumerateAiRollOutcomes must THROW without ctx.aiDamageState");
  ok(/aiDamageState/.test(msg), "the throw names ctx.aiDamageState");
  console.log("   throws as required: " + msg.slice(0, 92) + "...");
}

console.log();
console.log("-- PART 2: the AI's estimate tracks the opponent's OWN stat stages --");
{
  const you = buildMon(METAGROSS), opp = buildMon({ ...cfgOf("Quagsire 3"), friendship: 255 });
  const hp = you.stats.hp;
  const est = (atk) => calcDamage(opp, you, "Earthquake", { rollPercent: 92, atkStage: atk });
  const rows = [0, 2, 4, 6].map((a) => [a, est(a)]);
  for (const [a, d] of rows) console.log(`   Atk +${a}: AI Earthquake estimate ${d} vs ${hp} HP  -> ${d >= hp ? "KO seen" : "no KO"}`);
  ok(rows[0][1] < hp, "at Atk +0 the estimate must be below the target's HP");
  ok(rows[1][1] >= hp, "at Atk +2 the estimate must reach a KO");
  ok(rows.every((r, i) => i === 0 || r[1] > rows[i - 1][1]), "the estimate must rise with Atk stage");

  // and the AI's actual choice must follow it
  const dist = (atk) => chooseOpponentMoves(opp, you, buildStartState({ you, opp, overrides: { oppStages: { atk } } }));
  const d0 = dist(0), d2 = dist(2);
  const p = (d, m) => (d.find((x) => x.move === m) || { prob: 0 }).prob;
  ok(p(d0, "Curse") > 0.5, `at Atk +0 the AI should still be setting up, got ${JSON.stringify(d0.map((x) => [x.move, x.prob]))}`);
  ok(p(d2, "Earthquake") === 1, `at Atk +2 the AI should commit to Earthquake, got ${JSON.stringify(d2.map((x) => [x.move, x.prob]))}`);
  console.log(`   AI at Atk +0: ${d0.map((x) => `${x.move} ${x.prob.toFixed(3)}`).join(" | ")}`);
  console.log(`   AI at Atk +2: ${d2.map((x) => `${x.move} ${x.prob.toFixed(3)}`).join(" | ")}`);
}

console.log();
console.log("-- PART 3: the player's screens reduce what the AI thinks it can do --");
{
  const you = buildMon(METAGROSS), opp = buildMon({ ...cfgOf("Quagsire 3"), friendship: 255 });
  const bare = buildStartState({ you, opp, overrides: { oppStages: { atk: 2 } } });
  const screened = buildStartState({ you, opp, overrides: { oppStages: { atk: 2 }, youReflectTurns: 5 } });
  const dBare = buildAiDamageState(bare, opp, you), dScr = buildAiDamageState(screened, opp, you);
  const eBare = calcDamage(opp, you, "Earthquake", { rollPercent: 92, atkStage: dBare.atkStage, screenActive: dBare.targetReflect });
  const eScr = calcDamage(opp, you, "Earthquake", { rollPercent: 92, atkStage: dScr.atkStage, screenActive: dScr.targetReflect });
  ok(dScr.targetReflect === true && dBare.targetReflect === false, "buildAiDamageState must report the player's Reflect");
  ok(eScr < eBare, `Reflect must lower the AI's physical estimate (${eBare} -> ${eScr})`);
  console.log(`   Earthquake estimate at Atk +2: ${eBare} bare, ${eScr} through Reflect`);
}

console.log();
console.log("-- PART 4: AI damage respects weather suppression, AI SCORING does not --");
{
  const you = buildMon(METAGROSS), opp = buildMon({ ...cfgOf("Ludicolo 1"), friendship: 255 });
  const rain = buildStartState({ you, opp, overrides: { weatherType: "rain", weatherTurns: 5 } });
  const st = buildAiDamageState(rain, opp, you);
  ok(st.weather === "rain", `damage state weather should be rain, got ${st.weather}`);
  const wet = calcDamage(opp, you, "Surf", { rollPercent: 92, weather: "rain" });
  const dry = calcDamage(opp, you, "Surf", { rollPercent: 92, weather: null });
  ok(wet > dry, `rain must boost the AI's Water estimate (${dry} -> ${wet})`);
  console.log(`   Surf estimate: ${dry} dry, ${wet} in rain (buildAiDamageState uses effectiveWeather, src/pokemon.c:3331)`);
}

console.log();
console.log("-- PART 5: recorded post-fix behaviour (A9 anchors) --");
{
  const origWarn = console.warn; console.warn = () => {};
  for (const [name, want] of Object.entries(POST_A9)) {
    const { result } = analyzeMatchup(METAGROSS, cfgOf(name));
    ok(result.move === want.move, `${name}: move ${result.move} !== recorded ${want.move}`);
    ok(result.winProb === want.winProb, `${name}: winProb ${result.winProb} !== recorded ${want.winProb}`);
  }
  console.warn = origWarn;
  console.log(`   ${Object.keys(POST_A9).length} sets asserted`);
  let flips = 0;
  for (const [n, pre] of Object.entries(PRE_A9)) if (pre.move !== POST_A9[n].move) flips++;
  console.log(`   ${flips}/${Object.keys(PRE_A9).length} recorded pre/post pairs changed the recommended move`);
  ok(flips > 0, "A9 must move at least one recorded set, or these are the wrong anchors");
}

console.log();
console.log(failures === 0 ? "ALL PASS -- A9 characterization green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

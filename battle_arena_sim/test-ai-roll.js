// ── test-ai-roll.js ─────────────────────────────────────────────────────────
// A2 characterization test: the AI's simulated-damage roll.
//
// WHAT CHANGED. BattleAI_SetupAIData draws simulatedRNG[i] = 100 - (Random()%16)
// ONCE PER AI DECISION and independently PER MOVE SLOT
// (src/battle_ai_script_commands.c:312, :341), and every consumer in that
// decision reads the same array (:1211 get_how_powerful_move_is, :1760
// if_can_faint, :1789 if_cant_faint). The engine collapsed all of that to a
// fixed 0.925 midpoint, which turned the AI's KO verdict -- worth +4, the single
// largest score delta in the whole AI -- from a roll-dependent coin flip into a
// certainty. A2 enumerates the rolls instead (logic.js: AI_SIM_ROLLS,
// enumerateAiRollOutcomes).
//
// This file is BOTH halves of the characterization contract (CLAUDE.md hard
// constraint 2): PRE_A2 is the recorded pre-fix behaviour and is kept forever as
// history; POST_A2 is asserted. Neither is a fidelity proof -- they are recorded
// behaviour. Fidelity graduates in Phase D.
//
// ANCHOR POLICY (standing amendment 2). The 0.9186288305167801 anchor is
// IDENTICAL across all 16 rolls, so it could not and did not catch this class.
// It stays as a STABILITY anchor; these sets are the roll-treatment fidelity
// anchors, chosen precisely because they move.
import { analyzeMatchup, buildMon, buildStartState, chooseOpponentMoves,
         scoreOpponentMoveDist, enumerateAiRollOutcomes, AI_SIM_ROLLS,
         buildAiDamageState } from "./logic.js";
import { OPPONENT_SETS } from "./opponent-full-data.js";
import { getOpponentConfig } from "./opponent-adapter.js";

const METAGROSS = {
  species: "Metagross", level: 50, nature: "Adamant", evs: { atk: 252, spd: 4, spe: 252 },
  ability: "Clear Body", item: "Cheri Berry", moves: ["Meteor Mash", "Earthquake", "Shadow Ball", "Explosion"],
};

// Pre-fix behaviour, recorded 2026-09-22 on main @ 8591b80. HISTORY -- never
// deleted, never asserted. Note how many distributions are degenerate ([x, 1]):
// that is the collapse, visible. The AI was certain because it always saw the KO.
const PRE_A2 = {
  "Entei 1": {
    move: "Explosion", winProb: 0,
    dist: [["Flamethrower", 1]],
  },
  "Rhydon 1": {
    move: "Meteor Mash", winProb: 0,
    dist: [["Earthquake", 1]],
  },
  "Rhydon 3": {
    move: "Meteor Mash", winProb: 0,
    dist: [["Earthquake", 1]],
  },
  "Rhydon 4": {
    move: "Meteor Mash", winProb: 0,
    dist: [["Earthquake", 1]],
  },
  "Houndoom 1": {
    move: "Explosion", winProb: 0,
    dist: [["Flamethrower", 1]],
  },
  "Rapidash 1": {
    move: "Explosion", winProb: 0,
    dist: [["Flamethrower", 1]],
  },
  "Anabel Silver Entei": {
    move: "Explosion", winProb: 0.5,
    dist: [["Fire Blast", 1]],
  },
  "Exploud 3": {
    move: "Explosion", winProb: 0.5,
    dist: [["Overheat", 1]],
  },
  "Donphan 1": {
    move: "Explosion", winProb: 0.5,
    dist: [["Earthquake", 1]],
  },
  "Heracross 2": {
    move: "Explosion", winProb: 0.5,
    dist: [["Bulk Up", 0.666259765625], ["Earthquake", 0.333740234375]],
  },
  "Venusaur 3": {
    move: "Meteor Mash", winProb: 0.5915653076171875,
    dist: [["Earthquake", 0.5], ["Sleep Powder", 0.5]],
  },
  "Lucy Silver Milotic": {
    move: "Shadow Ball", winProb: 0.9718475341796875,
    dist: [["Mirror Coat", 0.5], ["Surf", 0.5]],
  },
  "Tucker Gold Swampert": {
    move: "Earthquake", winProb: 0.5425,
    dist: [["Earthquake", 0.5], ["Mirror Coat", 0.5]],
  },
  "Regirock 2": {
    move: "Meteor Mash", winProb: 0.48691360935437045,
    dist: [["Earthquake", 0.4674479166666667], ["Counter", 0.4674479166666667], ["Explosion", 0.06510416666666667]],
  },
  "Golem 1": {
    move: "Shadow Ball", winProb: 1,
    dist: [["Rock Tomb", 0.7265625], ["Earthquake", 0.13671875], ["Counter", 0.13671875]],
  },
};

// Post-fix behaviour, recorded on branch phase-a-fidelity. ASSERTED.
const POST_A2 = {
  "Entei 1": {
    move: "Explosion", winProb: 0.046614478031794235,
    dist: [["Flamethrower", 0.8851824601491293], ["Double Team", 0.08635433514912924], ["Calm Mind", 0.02846320470174154]],
  },
  "Rhydon 1": {
    move: "Earthquake", winProb: 0.31787109375,
    dist: [["Earthquake", 0.68212890625], ["Rock Tomb", 0.31787109375]],
  },
  "Rhydon 3": {
    move: "Earthquake", winProb: 0.044375,
    dist: [["Earthquake", 0.9375], ["Horn Drill", 0.0625]],
  },
  "Rhydon 4": {
    move: "Earthquake", winProb: 0.044375,
    dist: [["Earthquake", 0.9375], ["Horn Drill", 0.0625]],
  },
  "Houndoom 1": {
    move: "Earthquake", winProb: 0.13020833333333334,
    dist: [["Flamethrower", 0.7916666666666666], ["Counter", 0.10416666666666667], ["Will-O-Wisp", 0.10416666666666667]],
  },
  "Rapidash 1": {
    move: "Earthquake", winProb: 0.0625,
    dist: [["Protect", 0.5], ["Flamethrower", 0.5]],
  },
  "Anabel Silver Entei": {
    move: "Explosion", winProb: 0.5,
    dist: [["Fire Blast", 0.7917938232421875], ["Calm Mind", 0.2082061767578125]],
  },
  "Exploud 3": {
    move: "Explosion", winProb: 0.5,
    dist: [["Overheat", 0.90625], ["ThunderPunch", 0.09375]],
  },
  "Donphan 1": {
    move: "Explosion", winProb: 0.5,
    dist: [["Earthquake", 0.671875], ["Swagger", 0.328125]],
  },
  "Heracross 2": {
    move: "Explosion", winProb: 0.5,
    dist: [["Bulk Up", 0.6639811197916666], ["Earthquake", 0.3094579378763835], ["Megahorn", 0.02656094233194987]],
  },
  "Venusaur 3": {
    move: "Meteor Mash", winProb: 0.5964432373046875,
    dist: [["Earthquake", 0.5], ["Sleep Powder", 0.5]],
  },
  "Lucy Silver Milotic": {
    move: "Shadow Ball", winProb: 0.9859237670898438,
    dist: [["Mirror Coat", 0.5], ["Surf", 0.5]],
  },
  "Tucker Gold Swampert": {
    move: "Earthquake", winProb: 0.52921875,
    dist: [["Earthquake", 0.65625], ["Mirror Coat", 0.34375]],
  },
  "Regirock 2": {
    move: "Meteor Mash", winProb: 0.4809887721538164,
    dist: [["Earthquake", 0.4674479166666667], ["Counter", 0.4674479166666667], ["Explosion", 0.06510416666666667]],
  },
  "Golem 1": {
    move: "Shadow Ball", winProb: 1,
    dist: [["Rock Tomb", 0.49951171875], ["Earthquake", 0.406494140625], ["Counter", 0.093994140625]],
  },
};

let failures = 0;
const ok = (cond, msg) => { if (!cond) { failures++; console.log("  FAIL " + msg); } };
const near = (a, b) => Math.abs(a - b) < 1e-12;

console.log("-- PART 1: the roll set is source-exact --");
ok(AI_SIM_ROLLS.length === 16, `AI_SIM_ROLLS has 16 values, got ${AI_SIM_ROLLS.length}`);
ok(AI_SIM_ROLLS[0] === 85 && AI_SIM_ROLLS[15] === 100,
   `AI_SIM_ROLLS spans 85..100, got ${AI_SIM_ROLLS[0]}..${AI_SIM_ROLLS[15]}`);
ok(AI_SIM_ROLLS.every((r, i) => i === 0 || r === AI_SIM_ROLLS[i - 1] + 1), "AI_SIM_ROLLS is contiguous");
console.log(`   100 - (Random() % 16) -> {${AI_SIM_ROLLS[0]}..${AI_SIM_ROLLS[15]}}, ${AI_SIM_ROLLS.length} values (battle_ai_script_commands.c:341)`);

console.log();
console.log("-- PART 2: no silent fallback to the collapsed roll (hard constraint 4) --");
{
  const cfg = getOpponentConfig("Entei 1");
  const you = buildMon(METAGROSS), opp = buildMon({ ...cfg, friendship: 255 });
  let threw = false, msg = "";
  try {
    scoreOpponentMoveDist(opp, you, "Flamethrower", { targetHpPct: 100, targetTypes: you.types });
  } catch (e) { threw = true; msg = e.message; }
  ok(threw, "scoreOpponentMoveDist must THROW for a damaging move with no ctx.aiRolls");
  ok(/aiRolls/.test(msg), "the throw names ctx.aiRolls");
  console.log("   throws as required: " + msg.slice(0, 96) + "...");
}

console.log();
console.log("-- PART 3: roll classes are a proper distribution --");
{
  let checked = 0, degenerate = 0;
  for (const name of Object.keys(POST_A2)) {
    const e = OPPONENT_SETS[name];
    const cfg = getOpponentConfig(name, e.abilities.length > 1 ? { ability: e.abilities[0] } : {});
    const you = buildMon(METAGROSS), opp = buildMon({ ...cfg, friendship: 255 });
    const state = buildStartState({ you, opp });
    const classes = enumerateAiRollOutcomes(opp, you,
      { targetHpPct: 100, aiDamageState: buildAiDamageState(state, opp, you) });
    const total = classes.reduce((s, c) => s + c.p, 0);
    ok(near(total, 1), `${name}: roll-class probabilities sum to 1, got ${total}`);
    ok(classes.every((c) => c.p > 0), `${name}: no zero-weight roll class`);
    if (classes.length === 1) degenerate++;
    checked++;
  }
  console.log(`   ${checked} sets checked; ${checked - degenerate} took the enumerated slow path, ${degenerate} the invariant fast path`);
}

console.log();
console.log("-- PART 4: recorded post-fix behaviour (the roll-treatment anchors) --");
{
  const origWarn = console.warn; console.warn = () => {};
  for (const [name, want] of Object.entries(POST_A2)) {
    const e = OPPONENT_SETS[name];
    const cfg = getOpponentConfig(name, e.abilities.length > 1 ? { ability: e.abilities[0] } : {});
    const { result } = analyzeMatchup(METAGROSS, cfg);
    ok(result.move === want.move, `${name}: move ${result.move} !== recorded ${want.move}`);
    ok(result.winProb === want.winProb, `${name}: winProb ${result.winProb} !== recorded ${want.winProb}`);
    const you = buildMon(METAGROSS), opp = buildMon({ ...cfg, friendship: 255 });
    const dist = chooseOpponentMoves(opp, you, buildStartState({ you, opp }));
    ok(dist.length === want.dist.length, `${name}: AI dist has ${dist.length} entries, recorded ${want.dist.length}`);
    for (let i = 0; i < Math.min(dist.length, want.dist.length); i++) {
      ok(dist[i].move === want.dist[i][0] && near(dist[i].prob, want.dist[i][1]),
         `${name}: AI dist[${i}] ${dist[i].move}@${dist[i].prob} !== recorded ${want.dist[i][0]}@${want.dist[i][1]}`);
    }
  }
  console.warn = origWarn;
  console.log(`   ${Object.keys(POST_A2).length} roll-sensitive sets asserted (move, winProb, full AI distribution)`);
}

console.log();
console.log("-- PART 5: the fix actually moved these sets (PRE != POST) --");
{
  let moved = 0, flips = 0, zeroToPositive = 0;
  for (const name of Object.keys(POST_A2)) {
    const a = PRE_A2[name], b = POST_A2[name];
    if (!a) continue;
    if (a.winProb !== b.winProb || a.move !== b.move) moved++;
    if (a.move !== b.move) flips++;
    if (a.winProb === 0 && b.winProb > 0) zeroToPositive++;
  }
  ok(moved > 0, "at least one recorded set must differ pre/post, or these are the wrong anchors");
  console.log(`   ${moved}/${Object.keys(POST_A2).length} recorded sets moved; ${flips} changed the recommended move; ${zeroToPositive} went from a reported certain loss to winnable`);
}

console.log();
console.log(failures === 0 ? "ALL PASS -- A2 characterization green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

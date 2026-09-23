// ── test-b2b1-stat-stages.js ──────────────────────────────────────────────
// B2b batch 1 characterization: the stat-stage family.
//
// WHAT CHANGED. Nine effects had an `if_effect` row in AI_CheckBadMove and/or
// AI_CheckViability (data/battle_ai_scripts.s:51-214 / :652-776) but no port
// here, so every set carrying one threw at the ai-scoring guard and no Arena
// position containing it could be solved at all:
//
//   EFFECT_DEFENSE_CURL  AI_CBM_DefenseUp        :253-256
//   EFFECT_DEFENSE_DOWN  AI_CBM_DefenseDown      :283-286 / AI_CV_DefenseDown :1124-1135
//   EFFECT_SPEED_DOWN    AI_CBM_SpeedDown        :287-291 / AI_CV_SpeedDown   :1142-1152
//   EFFECT_TICKLE        AI_CBM_Tickle           :571-575 / AI_CV_DefenseDown (shared)
//   EFFECT_MINIMIZE      AI_CBM_EvasionUp        :273-276 / AI_CV_EvasionUp   :1037-1073 (both shared with EFFECT_EVASION_UP)
//   EFFECT_FOCUS_ENERGY  AI_CBM_FocusEnergy      :382-385
//   EFFECT_BELLY_DRUM    AI_CBM_BellyDrum        :247-248 / AI_CV_BellyDrum   :2077-2085
//   EFFECT_HAZE          AI_CBM_Haze             :314-330 / AI_CV_Haze        :1247-1283
//   EFFECT_FORESIGHT     AI_CBM_Foresight        :443-446 / AI_CV_Foresight   :1940-1964
//
// WHY THE ASSERTIONS LOOK LIKE THIS. "The set now solves" proves only that the
// throw is gone -- a handler returning a constant would pass that. So each
// handler is probed with the state it reads, both ways, and the two answers
// must differ in the direction source says. The executors are exercised through
// the exported applyMove so their real state writes are observed, not assumed.
import {
  AI_HANDLERS, applyMove, buildMon, buildStartState, typeEffectiveness,
  calcDamage, analyzeMatchup, search,
} from "./logic.js";
import { getOpponentConfig } from "./opponent-adapter.js";
import { FRONTIER_POOL } from "./frontier-pool.js";
import { LEADS, B2B1 } from "./anchors.js";

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } };
// Collapse a delta distribution to its expected value -- enough to compare two
// probes, and it does not hide a change the way a single branch would.
const ev = (d) => (Array.isArray(d) ? d.reduce((s, x) => s + x.p * x.delta, 0) : d);

// A ctx carrying every field these nine handlers read, at neutral defaults.
const neutralCtx = () => ({
  userHpPct: 100, targetHpPct: 100,
  userAtkStage: 0, userDefStage: 0, userSpeStage: 0, userSpAtkStage: 0,
  userSpDefStage: 0, userAccStage: 0, userEvasionStage: 0,
  targetStages: { atk: 0, def: 0, spa: 0, spd: 0, spe: 0, accuracy: 0, evasion: 0 },
  targetAbility: "Overgrow", targetFaster: false,
  targetForesighted: false, userFocusEnergy: false,
  userTypes: ["Normal"], targetTypes: ["Normal"],
  targetToxicPoisoned: false, targetLeechSeeded: false, userIngrained: false, targetCursed: false,
});

console.log("-- PART 1: every handler RESPONDS to the state its source reads --");
{
  const H = AI_HANDLERS;

  // AI_CBM_DefenseUp: -10 only at MAX_STAT_STAGE.
  ok(H.EFFECT_DEFENSE_CURL.checkBadMove(neutralCtx()) === 0, "Defense Curl at +0 must not be penalised");
  ok(H.EFFECT_DEFENSE_CURL.checkBadMove({ ...neutralCtx(), userDefStage: 6 }) === -10,
    "Defense Curl at +6 Def must score -10");
  ok(H.EFFECT_DEFENSE_CURL.checkViability === undefined,
    "EFFECT_DEFENSE_CURL has NO row in the viability chain -- it must not have a checkViability");

  // AI_CBM_DefenseDown -> CheckIfAbilityBlocksStatChange.
  const minDef = { ...neutralCtx(), targetStages: { ...neutralCtx().targetStages, def: -6 } };
  ok(H.EFFECT_DEFENSE_DOWN.checkBadMove(minDef) === -10, "Defense-down into a -6 Def target must score -10");
  ok(H.EFFECT_DEFENSE_DOWN.checkBadMove({ ...neutralCtx(), targetAbility: "Clear Body" }) === -10,
    "Clear Body must reach Score_Minus10 through CheckIfAbilityBlocksStatChange");
  ok(H.EFFECT_DEFENSE_DOWN.checkBadMove({ ...neutralCtx(), targetAbility: "White Smoke" }) === -10,
    "White Smoke must reach Score_Minus10 too");
  ok(H.EFFECT_DEFENSE_DOWN.checkBadMove(neutralCtx()) === 0, "an ordinary ability must not be penalised");

  // AI_CV_DefenseDown's two HP gates must both move the score.
  const cvHealthy = ev(H.EFFECT_DEFENSE_DOWN.checkViability(neutralCtx()));
  const cvHurtTarget = ev(H.EFFECT_DEFENSE_DOWN.checkViability({ ...neutralCtx(), targetHpPct: 50 }));
  const cvHurtUser = ev(H.EFFECT_DEFENSE_DOWN.checkViability({ ...neutralCtx(), userHpPct: 50 }));
  ok(cvHealthy !== cvHurtTarget, "AI_CV_DefenseDown's target-HP gate must change the score");
  ok(cvHealthy !== cvHurtUser, "AI_CV_DefenseDown's user-HP gate must change the score");
  ok(cvHurtTarget < cvHealthy, "a target below 70% HP takes the extra -2, so the score must FALL");
  console.log(`   AI_CV_DefenseDown E[delta]: healthy ${cvHealthy.toFixed(4)}  target@50% ${cvHurtTarget.toFixed(4)}  user@50% ${cvHurtUser.toFixed(4)}`);
  ok(H.EFFECT_TICKLE.checkViability === H.EFFECT_DEFENSE_DOWN.checkViability,
    "Tickle's viability row names AI_CV_DefenseDown -- it must be the SAME function object, not a copy");

  // AI_CBM_SpeedDown's own two extra gates.
  ok(H.EFFECT_SPEED_DOWN.checkBadMove({ ...neutralCtx(), targetAbility: "Speed Boost" }) === -10,
    "Speed Boost must score -10 for a speed-down move");
  ok(H.EFFECT_SPEED_DOWN.checkBadMove({ ...neutralCtx(), targetStages: { ...neutralCtx().targetStages, spe: -6 } }) === -10,
    "a -6 Speed target must score -10");
  const sdSlow = ev(H.EFFECT_SPEED_DOWN.checkViability(neutralCtx()));
  const sdFast = ev(H.EFFECT_SPEED_DOWN.checkViability({ ...neutralCtx(), targetFaster: true }));
  ok(sdSlow === -3, `a target the user already outspeeds is a flat -3 (got ${sdSlow})`);
  ok(sdFast > 0, `a FASTER target makes the speed drop worth having (got ${sdFast})`);

  // AI_CBM_Tickle: two different penalties, and -8 is NOT -10.
  ok(H.EFFECT_TICKLE.checkBadMove({ ...neutralCtx(), targetStages: { ...neutralCtx().targetStages, atk: -6 } }) === -10,
    "Tickle into a -6 Atk target must score -10");
  ok(H.EFFECT_TICKLE.checkBadMove({ ...neutralCtx(), targetStages: { ...neutralCtx().targetStages, def: -6 } }) === -8,
    "Tickle into a -6 Def target must score -8 (Score_Minus8, not Score_Minus10)");
  ok(H.EFFECT_TICKLE.checkBadMove({ ...neutralCtx(), targetAbility: "Clear Body" }) === 0,
    "AI_CBM_Tickle ends on its own `end` -- it must NOT fall through to the Clear Body tail");

  // EFFECT_MINIMIZE shares both labels with EFFECT_EVASION_UP.
  for (const probe of [neutralCtx(), { ...neutralCtx(), userHpPct: 45, userEvasionStage: 3 }]) {
    ok(H.EFFECT_MINIMIZE.checkBadMove(probe) === H.EFFECT_EVASION_UP.checkBadMove(probe),
      "Minimize's checkBadMove must equal EFFECT_EVASION_UP's -- same AI_CBM_EvasionUp label");
    ok(ev(H.EFFECT_MINIMIZE.checkViability(probe)) === ev(H.EFFECT_EVASION_UP.checkViability(probe)),
      "Minimize's checkViability must equal EFFECT_EVASION_UP's -- same AI_CV_EvasionUp label");
  }

  // AI_CBM_FocusEnergy.
  ok(H.EFFECT_FOCUS_ENERGY.checkBadMove(neutralCtx()) === 0, "Focus Energy unset must not be penalised");
  ok(H.EFFECT_FOCUS_ENERGY.checkBadMove({ ...neutralCtx(), userFocusEnergy: true }) === -10,
    "Focus Energy already set must score -10");

  // AI_CBM_BellyDrum / AI_CV_BellyDrum -- two DIFFERENT thresholds.
  ok(H.EFFECT_BELLY_DRUM.checkBadMove({ ...neutralCtx(), userHpPct: 50 }) === -10, "Belly Drum below 51% HP is -10");
  ok(H.EFFECT_BELLY_DRUM.checkBadMove({ ...neutralCtx(), userHpPct: 51 }) === 0, "Belly Drum at exactly 51% HP is not bad");
  ok(ev(H.EFFECT_BELLY_DRUM.checkViability({ ...neutralCtx(), userHpPct: 89 })) === -2, "Belly Drum below 90% HP scores -2");
  ok(ev(H.EFFECT_BELLY_DRUM.checkViability({ ...neutralCtx(), userHpPct: 90 })) === 0, "Belly Drum at 90% HP scores 0");

  // AI_CBM_Haze: -10 EXACTLY when it would undo nothing.
  ok(H.EFFECT_HAZE.checkBadMove(neutralCtx()) === -10, "Haze on a completely neutral board must score -10");
  ok(H.EFFECT_HAZE.checkBadMove({ ...neutralCtx(), userSpDefStage: -1 }) === 0,
    "one lowered stat of the user's own is enough to stop the -10");
  ok(H.EFFECT_HAZE.checkBadMove({ ...neutralCtx(), targetStages: { ...neutralCtx().targetStages, evasion: 1 } }) === 0,
    "one raised stat on the target is enough to stop the -10");
  const hazeNeutral = ev(H.EFFECT_HAZE.checkViability(neutralCtx()));
  const hazeTargetBoosted = ev(H.EFFECT_HAZE.checkViability({ ...neutralCtx(), targetStages: { ...neutralCtx().targetStages, atk: 3 } }));
  const hazeUserBoosted = ev(H.EFFECT_HAZE.checkViability({ ...neutralCtx(), userAtkStage: 3 }));
  ok(hazeTargetBoosted > hazeNeutral, "a +3 target Attack must make Haze MORE attractive");
  ok(hazeUserBoosted < hazeNeutral, "a +3 Attack of the user's OWN must make Haze LESS attractive");
  console.log(`   AI_CV_Haze E[delta]: neutral ${hazeNeutral.toFixed(4)}  target+3 ${hazeTargetBoosted.toFixed(4)}  user+3 ${hazeUserBoosted.toFixed(4)}`);

  // AI_CBM_Foresight, and the vanilla bug in AI_CV_Foresight.
  ok(H.EFFECT_FORESIGHT.checkBadMove(neutralCtx()) === 0, "Foresight on an unidentified target is not bad");
  ok(H.EFFECT_FORESIGHT.checkBadMove({ ...neutralCtx(), targetForesighted: true }) === -10,
    "Foresight on an ALREADY identified target must score -10");
  const fsGhostUser = ev(H.EFFECT_FORESIGHT.checkViability({ ...neutralCtx(), userTypes: ["Ghost"] }));
  const fsGhostTarget = ev(H.EFFECT_FORESIGHT.checkViability({ ...neutralCtx(), targetTypes: ["Ghost"] }));
  const fsNeither = ev(H.EFFECT_FORESIGHT.checkViability(neutralCtx()));
  ok(fsGhostUser !== fsNeither, "AI_CV_Foresight must react to the USER being Ghost");
  ok(fsGhostTarget === fsNeither,
    "VANILLA BUG: the shipped (non-BUGFIX) script reads the USER's types, so a GHOST TARGET must change nothing");
  ok(ev(H.EFFECT_FORESIGHT.checkViability({ ...neutralCtx(), userEvasionStage: 3 })) > fsNeither,
    "the user's OWN evasion above +2 is the other arm of the same bug and must raise the score");
  console.log(`   AI_CV_Foresight E[delta]: neither ${fsNeither.toFixed(4)}  USER Ghost ${fsGhostUser.toFixed(4)}  TARGET Ghost ${fsGhostTarget.toFixed(4)} (bug preserved)`);
}

console.log();
console.log("-- PART 2: the executors write the state source says they write --");
{
  const you = buildMon({ species: "Snorlax", level: 50, nature: "Adamant", evs: { hp: 252, atk: 252 },
    ability: "Thick Fat", item: "Leftovers", moves: ["Body Slam", "Earthquake", "Shadow Ball", "Rest"] });
  const opp = buildMon({ species: "Poliwrath", level: 50, nature: "Adamant", evs: { hp: 170, atk: 170, def: 170 },
    ability: "Water Absorb", item: "Leftovers", moves: ["Belly Drum", "Body Slam", "Surf", "Hypnosis"] });
  const ctx = { you, opp };
  const fresh = (ov) => buildStartState({ you, opp, overrides: ov });

  // Belly Drum: Cmd_maxattackhalvehp needs hp STRICTLY above floor(maxHP/2).
  {
    const s = fresh();
    applyMove(ctx, s, "opp", "Belly Drum", true, false);
    const halfPct = (Math.max(1, Math.floor(opp.stats.hp / 2)) / opp.stats.hp) * 100;
    ok(s.oppStages.atk === 6, `Belly Drum must ASSIGN +6 Atk (got ${s.oppStages.atk})`);
    ok(Math.abs(s.oppHpPct - (100 - halfPct)) < 1e-9,
      `Belly Drum must cost floor(maxHP/2) (got ${s.oppHpPct.toFixed(4)}%, expected ${(100 - halfPct).toFixed(4)}%)`);
    console.log(`   Belly Drum: Atk +0 -> +${s.oppStages.atk}, HP 100% -> ${s.oppHpPct.toFixed(4)}% (maxHP ${opp.stats.hp})`);

    const atHalf = fresh({ oppHpPct: 50 });
    applyMove(ctx, atHalf, "opp", "Belly Drum", true, false);
    ok(atHalf.oppStages.atk === 0 && atHalf.oppHpPct === 50,
      "Belly Drum at exactly half HP must FAIL -- source requires hp > halfHp, not >=");

    const maxed = fresh({ oppStages: { atk: 6 } });
    applyMove(ctx, maxed, "opp", "Belly Drum", true, false);
    ok(maxed.oppHpPct === 100, "Belly Drum at +6 Atk must fail and cost no HP");
  }

  // Haze: normalisebuffs loops over EVERY battler.
  {
    const s = fresh({ youStages: { atk: 4, evasion: -2 }, oppStages: { spe: -3, spd: 5 } });
    applyMove(ctx, s, "opp", "Haze", true, false);
    const allZero = (st) => Object.values(st).every((v) => v === 0);
    ok(allZero(s.youStages), "Haze must reset the PLAYER's stages too, not just the user's foe");
    ok(allZero(s.oppStages), "Haze must reset the USER's OWN stages -- it is side-agnostic");
  }

  // Focus Energy: second use fails (jumpifstatus2 -> ButItFailed).
  {
    const s = fresh();
    applyMove(ctx, s, "opp", "Focus Energy", true, false);
    ok(s.oppFocusEnergy === true, "Focus Energy must set STATUS2_FOCUS_ENERGY");
    const skillAfterFirst = s.skillOpp;
    applyMove(ctx, s, "opp", "Focus Energy", true, false);
    ok(s.skillOpp < skillAfterFirst,
      "a SECOND Focus Energy must fail, which scores Arena Skill as noEffect rather than landed");
  }

  // Tickle: two independent statbuffchanges, so Hyper Cutter blocks only Atk.
  {
    const hyper = buildMon({ species: "Pinsir", level: 50, nature: "Adamant", evs: { atk: 252, spe: 252 },
      ability: "Hyper Cutter", item: "Leftovers", moves: ["Body Slam", "Earthquake", "Rock Slide", "Swords Dance"] });
    const tickler = buildMon({ species: "Linoone", level: 50, nature: "Adamant", evs: { atk: 252, spe: 252 },
      ability: "Pickup", item: "Leftovers", moves: ["Tickle", "Body Slam", "Surf", "Shadow Ball"] });
    const c2 = { you: hyper, opp: tickler };
    const s = buildStartState({ you: hyper, opp: tickler });
    applyMove(c2, s, "opp", "Tickle", true, false);
    ok(s.youStages.atk === 0, "Hyper Cutter must block Tickle's Attack drop");
    ok(s.youStages.def === -1, "...but the Defense drop must still land -- they are separate statbuffchanges");

    const both = buildStartState({ you: hyper, opp: tickler, overrides: { youStages: { atk: -6, def: -6 } } });
    const before = both.skillOpp;
    applyMove(c2, both, "opp", "Tickle", true, false);
    ok(both.skillOpp < before, "Tickle with BOTH stats already at -6 must fail (CantLowerMultipleStats)");
  }
}

console.log();
console.log("-- PART 3: Foresight's two real consequences are live --");
{
  // (a) the type chart: exactly the two rows after the TYPE_FORESIGHT separator.
  ok(typeEffectiveness("Normal", ["Ghost"]) === 0, "Normal vs Ghost is 0 without Foresight");
  ok(typeEffectiveness("Normal", ["Ghost"], true) === 1, "Normal vs Ghost is 1 WITH Foresight");
  ok(typeEffectiveness("Fighting", ["Ghost"], true) === 1, "Fighting vs Ghost is 1 WITH Foresight");
  ok(typeEffectiveness("Fighting", ["Bug", "Ghost"], true) === 0.5,
    "Foresight removes only the no-effect row -- Fighting is still resisted by the Bug half");
  ok(typeEffectiveness("Psychic", ["Ghost"], true) === typeEffectiveness("Psychic", ["Ghost"]),
    "Foresight must not touch any type other than Normal and Fighting");
  ok(typeEffectiveness("Normal", ["Normal"], true) === typeEffectiveness("Normal", ["Normal"]),
    "Foresight must not touch a non-Ghost defender");

  // (b) it reaches real damage, not just the helper.
  const hitter = buildMon({ species: "Snorlax", level: 50, nature: "Adamant", evs: { hp: 252, atk: 252 },
    ability: "Thick Fat", item: "Leftovers", moves: ["Body Slam", "Earthquake", "Shadow Ball", "Rest"] });
  const ghost = buildMon({ species: "Gengar", level: 50, nature: "Timid", evs: { spa: 252, spe: 252 },
    ability: "Levitate", item: "Leftovers", moves: ["Shadow Ball", "Thunderbolt", "Ice Punch", "Psychic"] });
  const plain = calcDamage(hitter, ghost, "Body Slam", {});
  const seen = calcDamage(hitter, ghost, "Body Slam", { defenderForesighted: true });
  ok(plain === 0, `Body Slam into a Ghost must do 0 normally (got ${plain})`);
  ok(seen > 0, `Body Slam into a FORESIGHTED Ghost must do real damage (got ${seen})`);
  console.log(`   Body Slam vs Gengar: ${plain} damage -> ${seen} damage once identified`);

  // (c) the accuracy path: a foresighted target's evasion stage drops out.
  const evasive = buildMon({ species: "Umbreon", level: 50, nature: "Bold", evs: { hp: 170, def: 170, spd: 170 },
    ability: "Synchronize", item: "Leftovers", moves: ["Attract", "Confuse Ray", "Faint Attack", "Swagger"], friendship: 255 });
  // NOTE: analyzeMatchup takes no `overrides`, so the probe drives search()
  // directly -- an earlier draft passed overrides to analyzeMatchup, which
  // silently ignored them and compared a position against itself.
  const lead = buildMon(LEADS.Metagross);
  const evasiveCtx = { you: lead, opp: evasive };
  const p = (ov) => search(evasiveCtx, buildStartState({ you: lead, opp: evasive, overrides: ov }), 3).winProb;
  const base = p({ oppStages: { evasion: 6 } });
  const identified = p({ oppStages: { evasion: 6 }, oppForesighted: true });
  ok(identified > base,
    `identifying a +6-evasion target must raise the player's P(win) (${base} vs ${identified})`);
  ok(p({ oppStages: { evasion: 0 } }) === p({ oppStages: { evasion: 0 }, oppForesighted: true }),
    "with no evasion boost to ignore, Foresight must change the accuracy path by nothing");
  console.log(`   +6 evasion Umbreon: P(win) ${base.toFixed(6)} -> ${identified.toFixed(6)} once identified`);
}

console.log();
console.log("-- PART 4: recorded behaviour (every row was a THROW before this batch) --");
{
  const origWarn = console.warn; console.warn = () => {};
  for (const [name, a] of Object.entries(B2B1)) {
    const e = FRONTIER_POOL[name];
    const opts = { ...(e.abilities.length > 1 ? { ability: e.abilities[0] } : {}) };
    if (!e.brain) opts.ivTier = a.tier;
    const { result } = analyzeMatchup(LEADS[a.lead], getOpponentConfig(name, opts));
    ok(result.move === a.move, `${name} IV${a.tier} vs ${a.lead}: move ${result.move} !== ${a.move}`);
    ok(result.winProb === a.winProb, `${name} IV${a.tier} vs ${a.lead}: winProb ${result.winProb} !== ${a.winProb}`);
  }
  console.warn = origWarn;
  const effects = new Set(Object.values(B2B1).map((a) => a.effect));
  console.log(`   ${Object.keys(B2B1).length} cells asserted, covering ${effects.size} of the 9 ported effects`);
  console.log("   direction: all nine were UNSOLVABLE before -- these are first recordings, not re-recordings");
}

console.log();
console.log(failures === 0 ? "ALL PASS -- B2b batch 1 characterization green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

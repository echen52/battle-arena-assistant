// ── logic.js (v2) ──────────────────────────────────────────────────────────
// Battle Arena optimizer — generalized engine.
//
// Design: two mons are described by plain config objects (species looked up
// from species-data.js, everything else — level/nature/EVs/ability/item/
// moves — supplied by the caller, e.g. from a form or from opponent-sets.js).
// Starting HP% for both sides is also a parameter, not a constant, since a
// Pokémon carries damage forward into its next 1v1 as the team's next mon
// comes in fresh (Body scoring cares about current HP vs current max, not
// "this match's start" in isolation).
//
// Ported from pokeemerald source (src/battle_arena.c, data/battle_ai_scripts.s,
// src/battle_ai_script_commands.c).

import { SPECIES } from "./species-data.js";
import { MOVES } from "./move-data.js";
import { TYPE_CHART, PHYSICAL_TYPES, SPECIAL_TYPES } from "./type-data.js";
import { GENDER_RATIO } from "./gender-data.js";

// ─────────────────────────────────────────────────────────────────────────
// 1. STAT CALCULATION
// ─────────────────────────────────────────────────────────────────────────

// Complete Gen III nature table — finite and fully known, no reason to leave
// this incremental like species/moves/EVs (which genuinely require lookup
// work). A partial table here is a silent-wrong-answer risk: an unlisted
// nature previously fell through to "neutral" instead of erroring.
const NATURES = {
  Hardy: {}, Lonely: { boost: "atk", drop: "def" }, Brave: { boost: "atk", drop: "spe" },
  Adamant: { boost: "atk", drop: "spa" }, Naughty: { boost: "atk", drop: "spd" },
  Bold: { boost: "def", drop: "atk" }, Docile: {}, Relaxed: { boost: "def", drop: "spe" },
  Impish: { boost: "def", drop: "spa" }, Lax: { boost: "def", drop: "spd" },
  Timid: { boost: "spe", drop: "atk" }, Hasty: { boost: "spe", drop: "def" }, Serious: {},
  Jolly: { boost: "spe", drop: "spa" }, Naive: { boost: "spe", drop: "spd" },
  Modest: { boost: "spa", drop: "atk" }, Mild: { boost: "spa", drop: "def" },
  Quiet: { boost: "spa", drop: "spe" }, Bashful: {}, Rash: { boost: "spa", drop: "spd" },
  Calm: { boost: "spd", drop: "atk" }, Gentle: { boost: "spd", drop: "def" },
  Sassy: { boost: "spd", drop: "spe" }, Careful: { boost: "spd", drop: "spa" }, Quirky: {},
};

function natureMult(nature, stat) {
  if (!(nature in NATURES)) {
    throw new Error(`Unknown nature "${nature}" — not one of the 25 real Gen III natures. Check spelling.`);
  }
  const n = NATURES[nature];
  if (n.boost === stat) return 1.1;
  if (n.drop === stat) return 0.9;
  return 1.0;
}

function calcStat(base, iv, ev, level, statKey, nature, isHP) {
  const core = Math.floor((2 * base + iv + Math.floor(ev / 4)) * level / 100);
  if (isHP) return core + level + 10;
  return Math.floor((core + 5) * natureMult(nature, statKey));
}

// config: { species, level, nature, ivs?, evs, ability, item, moves }
// ivs defaults to 31 for every stat (Battle Frontier trainers are always
// flawless IVs — confirmed by reverse-engineering Umbreon 4's speed values).
// For your OWN Pokémon, pass real IVs if they're not perfect.
// Resolves a mon's gender into a probability distribution: [{ p, gender }],
// summing to 1, gender in {"male","female","genderless"}. Fixed-ratio species
// (genderRatio === "male"/"female"/"genderless") are always a single-point
// distribution, regardless of any config override — it isn't a real choice
// for those species. Variable-ratio species (a percent-female number, from
// gender-data.js's PERCENT_FEMALE extraction) use configGender as a concrete
// override when supplied (this is a REAL, already-existing mon with one
// actual gender — e.g. your own Swampert); left unspecified, it's modeled as
// a genuine probability split, matching how a Frontier opponent's gender is
// really undetermined until a personality value is rolled fresh each
// encounter (CreateMonWithEVSpreadNatureOTID only constrains nature, not
// gender bits — confirmed from source). If your own variable-ratio mon needs
// an exact (non-probabilistic) Attract analysis, pass config.gender.
function resolveGenderDist(genderRatio, configGender) {
  if (genderRatio === "male" || genderRatio === "female" || genderRatio === "genderless") {
    return [{ p: 1, gender: genderRatio }];
  }
  if (configGender === "male" || configGender === "female") {
    return [{ p: 1, gender: configGender }];
  }
  const pFemale = genderRatio / 100;
  return [{ p: pFemale, gender: "female" }, { p: 1 - pFemale, gender: "male" }];
}

function buildMon(config) {
  const dex = SPECIES[config.species];
  if (!dex) throw new Error(`Unknown species "${config.species}" — add it to species-data.js first.`);

  const iv = { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31, ...(config.ivs || {}) };
  const evs = config.evs || {};
  const { base } = dex;

  const stats = {
    hp:  calcStat(base.hp,  iv.hp,  evs.hp  || 0, config.level, "hp",  config.nature, true),
    atk: calcStat(base.atk, iv.atk, evs.atk || 0, config.level, "atk", config.nature, false),
    def: calcStat(base.def, iv.def, evs.def || 0, config.level, "def", config.nature, false),
    spa: calcStat(base.spa, iv.spa, evs.spa || 0, config.level, "spa", config.nature, false),
    spd: calcStat(base.spd, iv.spd, evs.spd || 0, config.level, "spd", config.nature, false),
    spe: calcStat(base.spe, iv.spe, evs.spe || 0, config.level, "spe", config.nature, false),
  };

  return {
    species: config.species,
    types: dex.types,
    level: config.level,
    nature: config.nature,
    ability: config.ability,
    item: config.item,
    moves: config.moves,
    stats,
    genderDist: resolveGenderDist(GENDER_RATIO[config.species], config.gender),
    // EFFECT_RETURN/EFFECT_FRUSTRATION power (Cmd_friendshiptodamagecalculation,
    // src/battle_script_commands.c:8603-8611) is friendship-dependent, and this
    // dataset tracks no friendship field anywhere — so it's assumed rather than
    // read: a mon built to carry Frustration is assumed built at MIN friendship
    // (0) specifically so Frustration is worth using; anything else (including a
    // Return carrier) defaults to MAX (255), since a player who bothers building
    // around Return keeps happiness maxed by design. `analyzeMatchup` OVERRIDES
    // this to always-255 for the opponent side specifically (Frontier trainer
    // mons are generated at max friendship — real, verified fact, not a
    // convenience default) — which is why an opponent's own Frustration, if it
    // ever carries one, computes to 0 power (see calcDamage), not 102.
    friendship: config.friendship ?? (config.moves.includes("Frustration") ? 0 : 255),
  };
}

// ─────────────────────────────────────────────────────────────────────────
// 2. TYPE CHART (imported from type-data.js — see that file for provenance)
// ─────────────────────────────────────────────────────────────────────────

function typeEffectiveness(moveType, defTypes) {
  const chart = TYPE_CHART[moveType] || {};
  let mult = 1;
  for (const t of defTypes) mult *= (chart[t] !== undefined ? chart[t] : 1);
  return mult;
}

// ─────────────────────────────────────────────────────────────────────────
// 3. MOVE DATA + AI HANDLER REGISTRY
//    MOVES now comes from the full 354-move dex (move-data.js, converted
//    from battle_moves.json). category is DERIVED from type per Gen I-III
//    rules (see move-data.js header) — NOT a per-move field, since that
//    split doesn't exist until Gen IV. accuracy: null means always-hit.
//
//    AI_HANDLERS is keyed by `effect` (e.g. "EFFECT_CONFUSE"), matching how
//    the game's own AI script actually dispatches ("if_effect EFFECT_X,
//    handler") — so a handler ported once automatically covers every move
//    that shares that effect, not just the one move we happened to need it
//    for. Grows one effect at a time, same incremental pattern as before.
// ─────────────────────────────────────────────────────────────────────────

// Each handler receives ctx = { user, target, userHpPct, targetHpPct,
// targetConfused, userEvasionStage, targetTypes } and returns a score delta.
// checkBadMove runs first (AI_CheckBadMove); checkViability runs after
// AI_TryToFaint (which is generic and applied automatically for any
// damaging move — see scoreOpponentMove below).
// Semi-invulnerable moves (Dive/Fly/Dig/Bounce — all share EFFECT_SEMI_INVULNERABLE)
// map to a specific gStatuses3 invulnerability bit. Bounce additionally
// tries to paralyze on its attack turn (not modeled — none of our current
// movesets include Bounce; flag if it comes up).
const SEMI_INVULN_BIT = { Dive: "underwater", Dig: "underground", Fly: "onair", Bounce: "onair" };

// Moves that bypass a given invulnerability bit, and whether they get the
// accompanying damage-doubling bonus (Thunder/Sky Uppercut bypass Fly/Bounce
// but do NOT get the 2x bonus that Twister/Gust/Surf/Whirlpool/Earthquake do
// — source-confirmed asymmetry).
const INVULN_BYPASS = {
  underwater: { "Surf": 2, "Whirlpool": 2 },
  underground: { "Earthquake": 2 },
  onair: { "Twister": 2, "Gust": 2, "Thunder": 1, "Sky Uppercut": 1 },
};

// Shared shape for AI_CV_AttackUp/AI_CV_SpAtkUp (data/battle_ai_scripts.s:896-984)
// — identical structure, differing only in the mid-HP-band tail roll
// (AttackUp: 40/256, SpAtkUp: 70/256 — verified separately, NOT assumed
// symmetric). stageKey is the ctx field for the user's OWN stage in that stat.
function attackFamilyViability(ctx, stageKey, midBandRollNumerator) {
  let dist = [{ p: 1, delta: 0 }];
  if (ctx[stageKey] >= 3) {
    dist = combineDist(dist, [{ p: 100 / 256, delta: 0 }, { p: 156 / 256, delta: -1 }]);
  } else if (ctx.userHpPct === 100) {
    dist = combineDist(dist, [{ p: 128 / 256, delta: 0 }, { p: 128 / 256, delta: 2 }]);
  }
  if (ctx.userHpPct > 70) {
    // done, no further scoring
  } else if (ctx.userHpPct < 40) {
    dist = combineDist(dist, [{ p: 1, delta: -2 }]);
  } else {
    dist = combineDist(dist, [{ p: midBandRollNumerator / 256, delta: 0 }, { p: (256 - midBandRollNumerator) / 256, delta: -2 }]);
  }
  return dist;
}

// Shared shape for AI_CV_DefenseUp/AI_CV_SpDefUp (data/battle_ai_scripts.s:915-1025)
// — identical thresholds (100/128/200/60/60), differing only in whether a
// physical or non-physical last hit is the "wasted boost" case.
function defenseFamilyTail(ctx, wastedIfPhysical) {
  if (ctx.userHpPct < 40) return [{ p: 1, delta: -2 }];
  if (!ctx.targetLastMoveHadPower) {
    return [{ p: 60 / 256, delta: 0 }, { p: 196 / 256, delta: -2 }]; // Up5: no/status last move
  }
  const wasted = wastedIfPhysical ? ctx.targetLastMoveWasPhysical : !ctx.targetLastMoveWasPhysical;
  if (wasted) return [{ p: 1, delta: -2 }]; // guaranteed, no roll
  return [{ p: 60 / 256, delta: 0 }, { p: 196 / 256, delta: -2 }];
}
function defenseFamilyViability(ctx, stageKey, wastedIfPhysical) {
  let dist = [{ p: 1, delta: 0 }];
  if (ctx[stageKey] >= 3) {
    dist = combineDist(dist, [{ p: 100 / 256, delta: 0 }, { p: 156 / 256, delta: -1 }]);
  } else if (ctx.userHpPct === 100) {
    dist = combineDist(dist, [{ p: 128 / 256, delta: 0 }, { p: 128 / 256, delta: 2 }]);
  }
  if (ctx.userHpPct >= 70) {
    // 200/256: fully done. 56/256: still falls into the tail below (source
    // asymmetry vs the attack family — the HP>=70 exemption here is only
    // probabilistic, not guaranteed).
    const tail = defenseFamilyTail(ctx, wastedIfPhysical);
    dist = combineDist(dist, [
      { p: 200 / 256, delta: 0 },
      ...tail.map((d) => ({ p: (56 / 256) * d.p, delta: d.delta })),
    ]);
  } else {
    dist = combineDist(dist, defenseFamilyTail(ctx, wastedIfPhysical));
  }
  return dist;
}

// AI_CV_Toxic (data/battle_ai_scripts.s:1353-1371) — shared verbatim by
// EFFECT_TOXIC and EFFECT_LEECH_SEED per source (:711 routes Leech Seed's
// viability through this same handler). Two independent HP-gated 50/256
// (NOT 50%!) penalties (own HP, then target HP), skipped entirely if the
// opponent has no attacking moves at all; then a bonus roll gated on the
// opponent's OWN moveset containing EFFECT_SPECIAL_DEFENSE_UP or
// EFFECT_PROTECT (literally just those two — NOT the _2 variant, preserved
// as written).
function toxicFamilyViability(ctx) {
  let dist = [{ p: 1, delta: 0 }];
  if (!ctx.userHasNoAttackingMoves) {
    if (ctx.userHpPct > 50) {
      // nothing
    } else {
      dist = combineDist(dist, [{ p: 50 / 256, delta: 0 }, { p: 206 / 256, delta: -3 }]);
    }
    if (ctx.targetHpPct > 50) {
      // nothing
    } else {
      dist = combineDist(dist, [{ p: 50 / 256, delta: 0 }, { p: 206 / 256, delta: -3 }]);
    }
  }
  if (ctx.userHasSpDefUpOrProtectMove) {
    dist = combineDist(dist, [{ p: 60 / 256, delta: 0 }, { p: 196 / 256, delta: 2 }]);
  }
  return dist;
}

// AI_CV_Heal (data/battle_ai_scripts.s:1324-1351) — shared by EFFECT_RESTORE_HP
// and EFFECT_SOFTBOILED verbatim, AND by EFFECT_SYNTHESIS via AI_CV_HealWeather
// (:1315-1320), which in THIS engine reduces to plain AI_CV_Heal since weather
// is never modeled/never active (Sunny/Rain/Sandstorm/Hail are all deferred
// hard effects) — the -2 weather penalty prefix can never fire.
// NOTE: source has an "AI_CV_Heal2" label that is NEVER jumped to from
// anywhere in the file — genuinely unreachable dead code in the decompiled
// ROM. Not ported (only reachable paths are), flagged as a curiosity.
function healFamilyViability(ctx) {
  if (ctx.userHpPct === 100) return [{ p: 1, delta: -3 }]; // Heal3
  if (!ctx.targetFaster) return [{ p: 1, delta: -8 }]; // user faster/tied, not full HP
  // Heal5/Heal6 tail — Snatch not modeled (always "doesn't have"), so always
  // lands on Heal6's roll: 20/256 chance nothing, else 236/256 chance +2.
  const tail = [{ p: 20 / 256, delta: 0 }, { p: 236 / 256, delta: 2 }];
  if (ctx.userHpPct < 70) return tail; // Heal4 -> straight to tail
  return [
    ...tail.map((d) => ({ p: (30 / 256) * d.p, delta: d.delta })),
    { p: 226 / 256, delta: -3 },
  ];
}

// Shared shape for AI_CV_DefenseDown/AI_CV_SpDefDown/AI_CV_EvasionDown
// (data/battle_ai_scripts.s:1124-1134/1186-1196/1235-1245 — identical
// thresholds and rolls, differing only in which of the TARGET's stat stages
// is checked). Raw stat stages are 0-12 (6=neutral) in source; this engine's
// ctx.targetStages use DISPLAY values (-6..+6, 0=neutral) — "raw > 3"
// becomes "display > -3" throughout.
function statDownDefenseFamilyViability(ctx, stageKey) {
  let dist = [{ p: 1, delta: 0 }];
  const skipRoll = ctx.userHpPct >= 70 && ctx.targetStages[stageKey] > -3;
  if (!skipRoll) dist = combineDist(dist, [{ p: 50 / 256, delta: 0 }, { p: 206 / 256, delta: -2 }]);
  if (ctx.targetHpPct <= 70) dist = combineDist(dist, [{ p: 1, delta: -2 }]);
  return dist;
}

// AI_CV_SpeedDown (data/battle_ai_scripts.s:1142-1151) — NOT the same shape
// as the Defense/SpDef/Evasion family above; keyed on relative speed, not HP.
function speedDownFamilyViability(ctx) {
  if (!ctx.targetFaster) return [{ p: 1, delta: -3 }]; // already faster than target — wasted
  return [{ p: 70 / 256, delta: 0 }, { p: 186 / 256, delta: 2 }];
}

// AI_CV_AttackDown (data/battle_ai_scripts.s:1090-1122) — shares the same
// tail shape as the Defense family (skip-roll + flat-if-target-healthy) but
// prefixes it with an "is the target's Attack already neutral" check, and
// appends a further roll gated on whether the target is even a "typically
// physical" type (source comment flags this type list as an apparent bug —
// Flying/Poison/Ghost are left out — preserved as-is, not "corrected", since
// this is real AI behavior, not our own approximation).
const ATTACK_DOWN_PHYSICAL_TYPICAL_TYPES = ["Normal", "Fighting", "Ground", "Rock", "Bug", "Steel"];
function attackDownFamilyViability(ctx) {
  let dist = [{ p: 1, delta: 0 }];
  if (ctx.targetStages.atk !== 0) {
    dist = combineDist(dist, [{ p: 1, delta: -1 }]);
    if (ctx.userHpPct <= 90) dist = combineDist(dist, [{ p: 1, delta: -1 }]);
  }
  const skipRoll = ctx.targetStages.atk > -3;
  if (!skipRoll) dist = combineDist(dist, [{ p: 50 / 256, delta: 0 }, { p: 206 / 256, delta: -2 }]);
  if (ctx.targetHpPct <= 70) dist = combineDist(dist, [{ p: 1, delta: -2 }]);
  const isPhysicalTypical = ctx.targetTypes.some((t) => ATTACK_DOWN_PHYSICAL_TYPICAL_TYPES.includes(t));
  if (!isPhysicalTypical) dist = combineDist(dist, [{ p: 50 / 256, delta: 0 }, { p: 206 / 256, delta: -2 }]);
  return dist;
}

// AI_CV_AccuracyDown (data/battle_ai_scripts.s:1198-1233) — the longest chain
// in this family: an HP-gated -1, an own-accuracy-stage-gated -2, THREE
// independent target-condition +2 bonuses (toxic/leech-seeded/cursed — all
// "the target's already in trouble, lowering accuracy is extra insurance"),
// a user-Ingrain-gated +1, and a final HP/stage-gated -2 tail.
function accuracyDownFamilyViability(ctx) {
  let dist = [{ p: 1, delta: 0 }];
  if (!(ctx.userHpPct >= 70 && ctx.targetHpPct > 70)) {
    dist = combineDist(dist, [{ p: 100 / 256, delta: 0 }, { p: 156 / 256, delta: -1 }]);
  }
  if (!(ctx.userAccStage > -2)) {
    dist = combineDist(dist, [{ p: 80 / 256, delta: 0 }, { p: 176 / 256, delta: -2 }]);
  }
  if (ctx.targetToxicPoisoned) dist = combineDist(dist, [{ p: 70 / 256, delta: 0 }, { p: 186 / 256, delta: 2 }]);
  if (ctx.targetLeechSeeded) dist = combineDist(dist, [{ p: 70 / 256, delta: 0 }, { p: 186 / 256, delta: 2 }]);
  if (ctx.userIngrained) dist = combineDist(dist, [{ p: 128 / 256, delta: 0 }, { p: 128 / 256, delta: 1 }]);
  if (ctx.targetCursed) dist = combineDist(dist, [{ p: 70 / 256, delta: 0 }, { p: 186 / 256, delta: 2 }]);
  const skipFinal = ctx.userHpPct > 70 || ctx.targetStages.accuracy === 0;
  if (!skipFinal) {
    if (ctx.userHpPct < 40 || ctx.targetHpPct < 40) {
      dist = combineDist(dist, [{ p: 1, delta: -2 }]);
    } else {
      dist = combineDist(dist, [{ p: 70 / 256, delta: 0 }, { p: 186 / 256, delta: -2 }]);
    }
  }
  return dist;
}

const AI_HANDLERS = {
  EFFECT_TOXIC: {
    // AI_CBM_Toxic (data/battle_ai_scripts.s:341-352) — completing this now
    // (batch 4) since the Immunity-ability/already-statused/Safeguard ctx
    // fields already exist from earlier batches; previously only had the
    // Steel/Poison type-immunity check.
    checkBadMove: (ctx) => {
      if (ctx.targetTypes.includes("Steel") || ctx.targetTypes.includes("Poison")) return -10;
      if (ctx.targetAbility === "Immunity") return -10;
      if (ctx.targetStatus !== null) return -10;
      if (ctx.targetSafeguarded) return -10;
      return 0;
    },
    // AI_CV_Toxic — see toxicFamilyViability above (shared with EFFECT_LEECH_SEED).
    checkViability: toxicFamilyViability,
  },
  EFFECT_ATTRACT: {
    // AI_CBM_Attract (data/battle_ai_scripts.s) — no AI_CV_Attract exists at
    // all (checkViability intentionally omitted). Full source logic:
    //   -10 if target already infatuated (STATUS2_INFATUATION)
    //   -10 if target has Oblivious
    //   else: get_gender(AI_USER) — if male, -10 unless target is female;
    //         if female, -10 unless target is male; if neither (genderless
    //         user), unconditionally -10 (a genderless user can never
    //         land Attract, so the AI always scores it as bad).
    // AI_USER here is the OPPONENT (the one considering the move) and
    // AI_TARGET is the player — so this handler is gated on the OPPONENT'S
    // OWN gender matching up against the player's, not just the player's.
    // Either side's gender may be genuinely uncertain (a variable-ratio
    // species with no fixed personality/config override), so this returns a
    // full distribution over the -10/0 delta rather than a scalar —
    // scoreOpponentMoveDist's checkBadMove consumer was extended (this
    // batch) to accept that, exactly like checkViability already does.
    checkBadMove: (ctx) => {
      if (ctx.targetInfatuated) return [{ p: 1, delta: -10 }];
      if (ctx.targetAbility === "Oblivious") return [{ p: 1, delta: -10 }];
      const bucket = new Map();
      for (const u of ctx.userGenderDist) {
        for (const t of ctx.targetGenderDist) {
          const p = u.p * t.p;
          if (p === 0) continue;
          const compatible = u.gender !== "genderless" && t.gender !== "genderless" && u.gender !== t.gender;
          const delta = compatible ? 0 : -10;
          bucket.set(delta, (bucket.get(delta) || 0) + p);
        }
      }
      return [...bucket.entries()].map(([delta, p]) => ({ p, delta }));
    },
  },
  EFFECT_CONFUSE: {
    // AI_CBM_Confuse: only penalized if target already confused / Own Tempo / Safeguard.
    checkBadMove: (ctx) => (ctx.targetConfused ? -5 : 0),
    // AI_CV_Confuse — COMPLETE handler, source-verified (data/battle_ai_scripts.s:1467-1477).
    // Real structure: target HP>70% -> no penalty at all. Else a 50%-chance
    // -1 (the ONLY random roll in this handler), then UNCONDITIONAL further
    // -1 penalties layered on for HP<=50% and again for HP<=30% (not random
    // — my earlier "coin-flip" framing for the (50,70] band was right about
    // that band specifically, but wrong to imply the lower bands were also
    // probabilistic; they're guaranteed once you're in them).
    checkViability: (ctx) => {
      if (ctx.targetHpPct > 70) return [{ p: 1, delta: 0 }];
      const firstRoll = [{ p: 128 / 256, delta: 0 }, { p: 128 / 256, delta: -1 }]; // 50% chance -1
      if (ctx.targetHpPct > 50) return firstRoll;
      const afterSecond = combineDist(firstRoll, [{ p: 1, delta: -1 }]); // unconditional -1
      if (ctx.targetHpPct > 30) return afterSecond;
      return combineDist(afterSecond, [{ p: 1, delta: -1 }]); // another unconditional -1
    },
  },
  EFFECT_EVASION_UP: {
    // AI_CBM_EvasionUp: only penalized if evasion already maxed.
    checkBadMove: (ctx) => (ctx.userEvasionStage >= 6 ? -10 : 0),
    // AI_CV_EvasionUp — COMPLETE handler, source-verified (data/battle_ai_scripts.s:1037-1073).
    // 6 independent scoring blocks, most gated on statuses this engine
    // doesn't model yet (Toxic-poison, Leech Seed, Ingrain, Curse — all
    // default false below; wire in real values once those statuses exist).
    // My earlier approximation (userHpPct < 90 ? +3 : 0) had the HP
    // condition BACKWARDS (real bonus needs HP >= 90%) and only captured
    // 1 of these 6 blocks.
    checkViability: (ctx) => {
      let dist = [{ p: 1, delta: 0 }];

      // Block 1: user HP >= 90% -> 156/256 chance of +3.
      if (ctx.userHpPct >= 90) {
        dist = combineDist(dist, [{ p: 100 / 256, delta: 0 }, { p: 156 / 256, delta: 3 }]);
      }
      // Block 2: user's own evasion already >= +3 stages -> 50% chance of -1.
      if (ctx.userEvasionStage >= 3) {
        dist = combineDist(dist, [{ p: 128 / 256, delta: 0 }, { p: 128 / 256, delta: -1 }]);
      }
      // Block 3: target badly poisoned (not modeled — always false for now).
      if (ctx.targetToxicPoisoned) {
        if (ctx.userHpPct > 50) {
          dist = combineDist(dist, [{ p: 50 / 256, delta: 0 }, { p: 206 / 256, delta: 3 }]);
        } else {
          const pPlus3 = (176 / 256) * (206 / 256); // must pass both gates
          dist = combineDist(dist, [{ p: 1 - pPlus3, delta: 0 }, { p: pPlus3, delta: 3 }]);
        }
      }
      // Block 4: target Leech Seeded (not modeled — always false for now).
      if (ctx.targetLeechSeeded) {
        dist = combineDist(dist, [{ p: 70 / 256, delta: 0 }, { p: 186 / 256, delta: 3 }]);
      }
      // Block 5: user Ingrained (not modeled — always false for now).
      if (ctx.userIngrained) {
        dist = combineDist(dist, [{ p: 128 / 256, delta: 0 }, { p: 128 / 256, delta: 2 }]);
      }
      // Block 6: target Cursed (not modeled — always false for now).
      if (ctx.targetCursed) {
        dist = combineDist(dist, [{ p: 70 / 256, delta: 0 }, { p: 186 / 256, delta: 3 }]);
      }
      // Block 7: mutual-low-HP anti-stall check (only relevant once evasion
      // has actually been raised, i.e. after Double Team already landed once).
      if (ctx.userHpPct <= 70 && ctx.userEvasionStage !== 0) {
        if (ctx.userHpPct < 40 || ctx.targetHpPct < 40) {
          dist = combineDist(dist, [{ p: 1, delta: -2 }]); // guaranteed
        } else {
          dist = combineDist(dist, [{ p: 70 / 256, delta: 0 }, { p: 186 / 256, delta: -2 }]);
        }
      }
      return dist;
    },
  },
  EFFECT_ALWAYS_HIT: {
    // AI_CV_AlwaysHit: only scores if target evasion raised or user acc lowered.
    checkViability: () => 0, // neither condition modeled yet — extend if a matchup needs it
  },
  // EFFECT_OHKO (Horn Drill/Fissure/Guillotine/Sheer Cold) — the first power>0
  // effect ever added to AI_HANDLERS (every other entry here is a power=0
  // status move); see HANDOFF.md §10 for the full bug history. AI_CBM_OneHitKO
  // (data/battle_ai_scripts.s:358-363): type-immune target, target Sturdy, or
  // the AI's own level being LOWER than the target's (an OHKO can never land
  // in that case, see Cmd_tryKO) are each an outright -10. AI_CV_OneHitKO
  // (:1427-1428) is a bare `end` — genuinely contributes nothing, matching
  // this engine's "AI is blind to Arena scoring" model, not an omission.
  EFFECT_OHKO: {
    checkBadMove: (ctx) => {
      if (typeEffectiveness(ctx.moveType, ctx.targetTypes) === 0) return -10;
      if (ctx.targetAbility === "Sturdy") return -10;
      if (ctx.userLevel < ctx.targetLevel) return -10;
      return 0;
    },
    checkViability: () => 0,
  },
  // ── Systematic AI-handler port, batch 1 (see HANDOFF.md §7 step 1) ────────
  EFFECT_PARALYZE: {
    // AI_CBM_Paralyze (data/battle_ai_scripts.s:397-403) — fully deterministic,
    // no live randomness anywhere in this handler (true of every AI_CBM_*
    // handler sampled across the whole file; only AI_CV_* ever rolls dice).
    checkBadMove: (ctx) => {
      if (typeEffectiveness(ctx.moveType, ctx.targetTypes) === 0) return -10; // e.g. Electric vs Ground
      if (ctx.targetAbility === "Limber") return -10;
      if (ctx.targetStatus !== null) return -10; // STATUS1_ANY — already has a major status
      if (ctx.targetSafeguarded) return -10;
      return 0;
    },
    // AI_CV_Paralyze (data/battle_ai_scripts.s:1524-1534) — the "if_random_less_than
    // roll" shape: a single clean 20/256 dice roll gates the bonus, nested
    // under one deterministic branch (target's speed relative to the user).
    //   if_target_faster -> Paralyze2; else: userHP>70 ? nothing : -1
    //   Paralyze2: 20/256 chance of nothing, else +3
    checkViability: (ctx) => {
      if (ctx.targetFaster) {
        return [{ p: 20 / 256, delta: 0 }, { p: 236 / 256, delta: 3 }];
      }
      return ctx.userHpPct > 70 ? [{ p: 1, delta: 0 }] : [{ p: 1, delta: -1 }];
    },
  },
  EFFECT_ROAR: {
    // AI_CBM_Roar (data/battle_ai_scripts.s:334-339). count_usable_party_mons
    // (src/battle_ai_script_commands.c:1292-1331) reads gPlayerParty/gEnemyParty
    // directly and has NO battle-type awareness at all — it just counts alive,
    // valid-species party slots other than the two currently on-field indices.
    // Frontier trainer parties are always built at FRONTIER_PARTY_SIZE = 3
    // (include/constants/global.h:35) regardless of facility — Arena is no
    // exception (src/battle_tower.c:3350-3352 loads gBattleFrontierMons/
    // gBattleFrontierTrainers for it same as Tower/Dome/Factory). So the
    // player's ACTUAL Emerald party during an Arena round also has 3 slots,
    // 2 of them "benched" reserves that are alive/valid-species but can never
    // be switched to (Arena disables switching elsewhere, NOT here) — the AI
    // is blind to that lock and sees a normal nonzero reserve count, exactly
    // per the user's real-gameplay observation that Roar isn't deprioritized.
    // ctx.targetUsablePartyMons therefore models "how many of the player's
    // OTHER team members are still alive," defaulting to 2 (full team intact)
    // until the team-run workflow can track actual fainted reserves — see
    // ctx wiring in chooseOpponentMoves and the analyzeMatchup option below.
    checkBadMove: (ctx) => {
      if (ctx.targetUsablePartyMons === 0) return -10;
      if (ctx.targetAbility === "Suction Cups") return -10;
      return 0;
    },
    // AI_CV_Roar (data/battle_ai_scripts.s:1290-1303). Control-flow note: the
    // 5 "if_stat_level_more_than ... AI_CV_Roar2" checks JUMP AWAY from the
    // "score -3" fallthrough when true — i.e. a boosted target stat SKIPS the
    // penalty and goes to the 50/50 roll instead. Reading this backwards
    // (penalizing Roar against a boosted target) would repeat the exact class
    // of bug flagged in HANDOFF.md Lesson re: EvasionUp's backwards HP check.
    checkViability: (ctx) => {
      const s = ctx.targetStages;
      const targetHasBoostedStat = s.atk > 2 || s.def > 2 || s.spa > 2 || s.spd > 2 || s.evasion > 2;
      if (!targetHasBoostedStat) return [{ p: 1, delta: -3 }];
      return [{ p: 128 / 256, delta: 0 }, { p: 128 / 256, delta: 2 }];
    },
  },
  EFFECT_REST: {
    // No AI_CBM_Rest exists in source — Rest has no checkBadMove at all.
    // AI_CV_Rest (data/battle_ai_scripts.s:1396-1425) — the canonical
    // "HP-conditional branch" shape: a speed check picks one of two HP-tier
    // ladders (40/50 vs 60/70), each tier either a flat penalty or a further
    // random-gated fallthrough into a shared low-HP tail (Rest6/Rest7) that
    // itself has one more (unmodeled-Snatch-gated, so always-taken) roll.
    checkViability: (ctx) => {
      // Rest6/Rest7 tail — reached whenever HP is low enough to actually
      // consider Resting. ctx.targetHasSnatch is always false (not modeled),
      // so the "doesn't have Snatch" branch is always taken, landing
      // straight on the 10/256-vs-246/256 roll.
      const restTail = () => [{ p: 10 / 256, delta: 0 }, { p: 246 / 256, delta: 3 }];

      if (!ctx.targetFaster) {
        if (ctx.userHpPct === 100) return [{ p: 1, delta: -8 }];
        if (ctx.userHpPct < 40) return restTail();
        if (ctx.userHpPct > 50) return [{ p: 1, delta: -3 }];
        // HP in [40, 50]: 70/256 chance of still trying (restTail), else -3.
        return [
          ...restTail().map((d) => ({ p: (70 / 256) * d.p, delta: d.delta })),
          { p: 186 / 256, delta: -3 },
        ];
      }
      // Target faster — note this skips the "user at 100% HP -> -8" check
      // entirely (source asymmetry, not a translation bug: AI_CV_Rest4 is
      // jumped to directly, bypassing the HP-equal-100 test upstream of it).
      if (ctx.userHpPct < 60) return restTail();
      if (ctx.userHpPct > 70) return [{ p: 1, delta: -3 }];
      // HP in [60, 70]: 50/256 chance of still trying (restTail), else -3.
      return [
        ...restTail().map((d) => ({ p: (50 / 256) * d.p, delta: d.delta })),
        { p: 206 / 256, delta: -3 },
      ];
    },
  },
  // ── Batch 2: the stat-boost family (data/battle_ai_scripts.s:249-1025) ───
  // EFFECT_X_UP and EFFECT_X_UP_2 route to the SAME source handler for each
  // stat (e.g. Swords Dance/EFFECT_ATTACK_UP_2 and the hypothetical +1
  // version share AI_CBM_AttackUp/AI_CV_AttackUp) — registered twice here
  // since our dispatch is keyed per JS effect string, not per source label.
  EFFECT_ATTACK_UP: {
    // AI_CBM_AttackUp (:249-251): own stat already at +6 -> -10.
    checkBadMove: (ctx) => (ctx.userAtkStage >= 6 ? -10 : 0),
    checkViability: (ctx) => attackFamilyViability(ctx, "userAtkStage", 40),
  },
  EFFECT_SPECIAL_ATTACK_UP: {
    // AI_CBM_SpAtkUp (:261-263).
    checkBadMove: (ctx) => (ctx.userSpAtkStage >= 6 ? -10 : 0),
    checkViability: (ctx) => attackFamilyViability(ctx, "userSpAtkStage", 70),
  },
  EFFECT_DEFENSE_UP: {
    // AI_CBM_DefenseUp (:253-255).
    checkBadMove: (ctx) => (ctx.userDefStage >= 6 ? -10 : 0),
    // AI_CV_DefenseUp (:915-954): Defense boost wasted if last hit was special.
    checkViability: (ctx) => defenseFamilyViability(ctx, "userDefStage", false),
  },
  EFFECT_SPECIAL_DEFENSE_UP: {
    // AI_CBM_SpDefUp (:265-267).
    checkBadMove: (ctx) => (ctx.userSpDefStage >= 6 ? -10 : 0),
    // AI_CV_SpDefUp (:986-1025): SpDef boost wasted if last hit was physical.
    checkViability: (ctx) => defenseFamilyViability(ctx, "userSpDefStage", true),
  },
  EFFECT_SPEED_UP: {
    // AI_CBM_SpeedUp (:257-259).
    checkBadMove: (ctx) => (ctx.userSpeStage >= 6 ? -10 : 0),
    // AI_CV_SpeedUp (:956-965) — much simpler than the other 4: target
    // already slower -> flat -3 (Agility redundant); target faster -> 70/256
    // chance of nothing, else +3.
    checkViability: (ctx) => {
      if (!ctx.targetFaster) return [{ p: 1, delta: -3 }];
      return [{ p: 70 / 256, delta: 0 }, { p: 186 / 256, delta: 3 }];
    },
  },
  // ── Batch 3: EFFECT_SLEEP (Hypnosis/Spore/Lovely Kiss/Sing/Sleep Powder) ─
  EFFECT_SLEEP: {
    // AI_CBM_Sleep (:216-222) — fully deterministic, mirrors AI_CBM_Paralyze's
    // shape (ability immunity + already-statused + Safeguard), no type check
    // here since sleep-inducing moves aren't type-gated the way Thunder
    // Wave/Stun Spore are (NOTE: does not model the separate "powder moves
    // fail vs Grass-types" exemption relevant to Spore/Sleep Powder — same
    // known gap as flagged on EFFECT_PARALYZE's Stun Spore).
    checkBadMove: (ctx) => {
      if (ctx.targetAbility === "Insomnia") return -10;
      if (ctx.targetAbility === "Vital Spirit") return -10;
      if (ctx.targetStatus !== null) return -10;
      if (ctx.targetSafeguarded) return -10;
      return 0;
    },
    // AI_CV_Sleep (:778-787) — ported LITERALLY as written even though it
    // reads unintuitively: it checks whether AI_TARGET (the PLAYER, per
    // every other AI_TARGET-using command verified so far — if_hp_more_than,
    // if_target_faster, count_usable_party_mons) has Dream Eater/Nightmare,
    // not the opponent using Sleep. Preserved as-is rather than "corrected"
    // to check the opponent's own moveset — real AI quirks get kept (see
    // the Foresight AI_CV_Foresight BUG comment in the same source file for
    // another example of this codebase preserving an odd-but-real check).
    checkViability: (ctx) => {
      if (!ctx.targetHasDreamEaterOrNightmare) return [{ p: 1, delta: 0 }];
      return [{ p: 128 / 256, delta: 0 }, { p: 128 / 256, delta: 1 }];
    },
  },
  // ── Batch 4: Dragon Dance, Curse, Leech Seed, Baton Pass ─────────────────
  EFFECT_DRAGON_DANCE: {
    // AI_CBM_DragonDance (:595-598): own Atk maxed -> -10; else own Speed
    // maxed -> -8 (sequential terminal checks — only the first true one fires).
    checkBadMove: (ctx) => {
      if (ctx.userAtkStage >= 6) return -10;
      if (ctx.userSpeStage >= 6) return -8;
      return 0;
    },
    // AI_CV_DragonDance (:2603-2614): target faster -> 128/256 chance of
    // nothing else +1; else (user faster/tied) -> own HP>50 nothing, else
    // 70/256 chance nothing else -1.
    checkViability: (ctx) => {
      if (ctx.targetFaster) {
        return [{ p: 128 / 256, delta: 0 }, { p: 128 / 256, delta: 1 }];
      }
      if (ctx.userHpPct > 50) return [{ p: 1, delta: 0 }];
      return [{ p: 70 / 256, delta: 0 }, { p: 186 / 256, delta: -1 }];
    },
  },
  EFFECT_CURSE: {
    // AI_CBM_Curse (:434-437) — generic regardless of the user's own type
    // (even though the Atk/Def check below is only relevant to the non-Ghost
    // branch; that's how the real script is written, not something to "fix").
    checkBadMove: (ctx) => {
      if (ctx.userAtkStage >= 6) return -10;
      if (ctx.userDefStage >= 6) return -8;
      return 0;
    },
    // AI_CV_Curse (:1870-1892) — genuinely branches on the USER's own type.
    // Ghost: HP>80 -> nothing, else -1 (the HP-sacrifice version is riskier
    // when already hurt). Non-Ghost: 3 independent 50/50 rolls, each +1,
    // gated on successively lower Def-stage thresholds (+3/+1/neutral) — the
    // lower the current Def stage, the more of these stack.
    checkViability: (ctx) => {
      if (ctx.userTypes.includes("Ghost")) {
        return ctx.userHpPct > 80 ? [{ p: 1, delta: 0 }] : [{ p: 1, delta: -1 }];
      }
      let dist = [{ p: 1, delta: 0 }];
      if (ctx.userDefStage <= 3) dist = combineDist(dist, [{ p: 128 / 256, delta: 0 }, { p: 128 / 256, delta: 1 }]);
      if (ctx.userDefStage <= 1) dist = combineDist(dist, [{ p: 128 / 256, delta: 0 }, { p: 128 / 256, delta: 1 }]);
      if (ctx.userDefStage <= 0) dist = combineDist(dist, [{ p: 128 / 256, delta: 0 }, { p: 128 / 256, delta: 1 }]);
      return dist;
    },
  },
  EFFECT_LEECH_SEED: {
    // AI_CBM_LeechSeed (:410-416): already-seeded (not modeled — see
    // targetLeechSeeded, still hardcoded false) + Grass-type immunity.
    checkBadMove: (ctx) => {
      if (ctx.targetLeechSeeded) return -10;
      if (ctx.targetTypes.includes("Grass")) return -10;
      return 0;
    },
    // AI_CV_Toxic — shared with EFFECT_TOXIC, see toxicFamilyViability above.
    checkViability: toxicFamilyViability,
  },
  EFFECT_BATON_PASS: {
    // AI_CBM_BatonPass (:485-488): count_usable_party_mons(AI_USER) — the
    // OPPONENT'S OWN reserves (contrast EFFECT_ROAR, which checks the
    // TARGET's). Same FRONTIER_PARTY_SIZE=3 fact applies from the AI's own
    // side too — see ctx.userUsablePartyMons / analyzeMatchup's oppUsablePartyMons.
    checkBadMove: (ctx) => (ctx.userUsablePartyMons === 0 ? -10 : 0),
    // AI_CV_BatonPass (:1978-2016) — two tiers gated on whether any of the
    // user's 5 raisable stats is significantly boosted (>+2 vs >+1):
    //  - Any stat >+2: HP/speed-gated exemption, else 80/256 chance of
    //    nothing, else +2 (there's real value worth passing on).
    //  - Any stat >+1 (but none >+2): HP/speed-gated -2 penalty, else nothing.
    //  - Nothing boosted at all: flat -2 (nothing worth passing).
    checkViability: (ctx) => {
      const s2 = 2, s1 = 1; // real-stage thresholds (source uses raw 8 and 7 = real +2 and +1)
      const anyAbove2 = ctx.userAtkStage > s2 || ctx.userDefStage > s2 || ctx.userSpAtkStage > s2 || ctx.userSpDefStage > s2 || ctx.userEvasionStage > s2;
      if (anyAbove2) {
        if (ctx.targetFaster) {
          if (ctx.userHpPct > 70) return [{ p: 1, delta: 0 }];
        } else if (ctx.userHpPct > 60) {
          return [{ p: 1, delta: 0 }];
        }
        return [{ p: 80 / 256, delta: 0 }, { p: 176 / 256, delta: 2 }];
      }
      const anyAbove1 = ctx.userAtkStage > s1 || ctx.userDefStage > s1 || ctx.userSpAtkStage > s1 || ctx.userSpDefStage > s1 || ctx.userEvasionStage > s1;
      if (!anyAbove1) return [{ p: 1, delta: -2 }];
      if (ctx.targetFaster) {
        return ctx.userHpPct < 70 ? [{ p: 1, delta: 0 }] : [{ p: 1, delta: -2 }];
      }
      return ctx.userHpPct > 60 ? [{ p: 1, delta: -2 }] : [{ p: 1, delta: 0 }];
    },
  },
  // ── Batch 5: Substitute, Reflect, Light Screen (persistent-state effects) ─
  EFFECT_SUBSTITUTE: {
    // AI_CBM_Substitute: already up -> -8; own HP<26% (can't safely afford
    // the 1/4-max-HP cost) -> -10.
    checkBadMove: (ctx) => {
      if (ctx.userHasSubstitute) return -8;
      if (ctx.userHpPct < 26) return -10;
      return 0;
    },
    // AI_CV_Substitute — cascading independent 100/256-vs-156/256 rolls (each
    // an independent -1 chance), the NUMBER of which depends on the user's HP
    // tier: >90% HP -> 0 rolls; (70,90]% -> 1; (50,70]% -> 2; <=50% -> 3. The
    // lower the HP, the more chances to be penalized — Substitute is riskier
    // when already hurt (higher chance the sub itself gets one-shot for a
    // wasted 1/4-HP cost).
    checkViability: (ctx) => {
      let numRolls;
      if (ctx.userHpPct > 90) numRolls = 0;
      else if (ctx.userHpPct > 70) numRolls = 1;
      else if (ctx.userHpPct > 50) numRolls = 2;
      else numRolls = 3;
      let dist = [{ p: 1, delta: 0 }];
      const roll = [{ p: 100 / 256, delta: 0 }, { p: 156 / 256, delta: -1 }];
      for (let i = 0; i < numRolls; i++) dist = combineDist(dist, roll);
      return dist;
    },
  },
  EFFECT_REFLECT: {
    checkBadMove: (ctx) => (ctx.userHasReflect ? -8 : 0),
    // AI_CV_Reflect: own HP<50 -> flat -2 (don't bother screening while
    // already hurt). Else: if the TARGET's own type suggests it hits
    // physically (PHYSICAL_TYPES — same list as type-data.js, cross-verified
    // against source), Reflect is clearly worth it -> no penalty. Otherwise
    // (target isn't a physical-associated type) 50/256 chance of no penalty,
    // else -2.
    checkViability: (ctx) => {
      if (ctx.userHpPct < 50) return [{ p: 1, delta: -2 }];
      if (ctx.targetTypes.some((t) => PHYSICAL_TYPES.includes(t))) return [{ p: 1, delta: 0 }];
      return [{ p: 50 / 256, delta: 0 }, { p: 206 / 256, delta: -2 }];
    },
  },
  EFFECT_LIGHT_SCREEN: {
    checkBadMove: (ctx) => (ctx.userHasLightScreen ? -8 : 0),
    // AI_CV_LightScreen — mirrors AI_CV_Reflect exactly, gated on
    // SPECIAL_TYPES instead of PHYSICAL_TYPES.
    checkViability: (ctx) => {
      if (ctx.userHpPct < 50) return [{ p: 1, delta: -2 }];
      if (ctx.targetTypes.some((t) => SPECIAL_TYPES.includes(t))) return [{ p: 1, delta: 0 }];
      return [{ p: 50 / 256, delta: 0 }, { p: 206 / 256, delta: -2 }];
    },
  },
  // ── Batch 6: Calm Mind, Cosmic Power, Bulk Up, Swagger, Destiny Bond ─────
  EFFECT_CALM_MIND: {
    // AI_CBM_CalmMind (:590-593): own SpAtk maxed -10, else own SpDef maxed -8.
    checkBadMove: (ctx) => {
      if (ctx.userSpAtkStage >= 6) return -10;
      if (ctx.userSpDefStage >= 6) return -8;
      return 0;
    },
    // AI_CV_SpDefUp — Calm Mind and Cosmic Power BOTH route to this exact
    // same viability handler per source (data/battle_ai_scripts.s:770/774),
    // already built for EFFECT_SPECIAL_DEFENSE_UP in batch 2.
    checkViability: (ctx) => defenseFamilyViability(ctx, "userSpDefStage", true),
  },
  EFFECT_COSMIC_POWER: {
    // AI_CBM_CosmicPower (:576-579): own Def maxed -10, else own SpDef maxed -8.
    checkBadMove: (ctx) => {
      if (ctx.userDefStage >= 6) return -10;
      if (ctx.userSpDefStage >= 6) return -8;
      return 0;
    },
    checkViability: (ctx) => defenseFamilyViability(ctx, "userSpDefStage", true),
  },
  EFFECT_BULK_UP: {
    // AI_CBM_BulkUp (:581-584): own Atk maxed -10, else own Def maxed -8.
    checkBadMove: (ctx) => {
      if (ctx.userAtkStage >= 6) return -10;
      if (ctx.userDefStage >= 6) return -8;
      return 0;
    },
    // AI_CV_DefenseUp — Bulk Up routes to the exact same handler as plain
    // Defense Up (data/battle_ai_scripts.s:771), already built in batch 2.
    checkViability: (ctx) => defenseFamilyViability(ctx, "userDefStage", false),
  },
  EFFECT_SWAGGER: {
    // AI_CBM_Confuse (:386-391) — Swagger shares this exact CBM per source
    // (:169). Duplicated here (not referencing AI_HANDLERS.EFFECT_CONFUSE
    // directly) since that handler is explicitly off-limits to touch.
    checkBadMove: (ctx) => {
      if (ctx.targetConfused) return -5;
      if (ctx.targetAbility === "Own Tempo") return -10;
      if (ctx.targetSafeguarded) return -10;
      return 0;
    },
    // AI_CV_Swagger (:1462-1490). If the opponent's OWN moveset has Psych
    // Up, it takes a COMPLETELY different branch gated on the TARGET's OWN
    // Atk stage (real > -3, i.e. NOT heavily lowered, is the COMMON case)
    // -> -5; only when the target's Atk is already crashed (<=-3, rare) does
    // it favor Swagger (+3, or +5 on turn 1 specifically) — this only makes
    // sense once you notice Psych Up lets the AI later COPY that improved
    // stat for itself while the target sits confused. Traced this fully
    // before trusting it; the naive reading (checking direction backwards)
    // would have this exactly inverted. Otherwise (no Psych Up): 50/256
    // chance of +1, THEN falls into the identical HP-tiered logic as
    // AI_CV_Confuse (duplicated below, not referencing the protected
    // EFFECT_CONFUSE handler).
    checkViability: (ctx) => {
      if (ctx.userHasPsychUp) {
        if (ctx.targetStages.atk > -3) return [{ p: 1, delta: -5 }];
        const turnBonus = ctx.isFirstTurn ? 2 : 0;
        return [{ p: 1, delta: 3 + turnBonus }];
      }
      const confuseTail = (() => {
        if (ctx.targetHpPct > 70) return [{ p: 1, delta: 0 }];
        const firstRoll = [{ p: 128 / 256, delta: 0 }, { p: 128 / 256, delta: -1 }];
        if (ctx.targetHpPct > 50) return firstRoll;
        const afterSecond = combineDist(firstRoll, [{ p: 1, delta: -1 }]);
        if (ctx.targetHpPct > 30) return afterSecond;
        return combineDist(afterSecond, [{ p: 1, delta: -1 }]);
      })();
      return combineDist([{ p: 128 / 256, delta: 0 }, { p: 128 / 256, delta: 1 }], confuseTail);
    },
  },
  EFFECT_DESTINY_BOND: {
    // No AI_CBM_DestinyBond exists — CV only.
    // AI_CV_DestinyBond (:1800-1814): unconditional -1 baseline. Target
    // faster -> done. Else own HP>70 -> done. Else a cascade of up to 3
    // independent rolls (each either skipped or adding +1/+2), the number
    // triggered depending on how low the user's own HP is — the lower, the
    // more chances at a bonus (Destiny Bond is a last-resort move).
    checkViability: (ctx) => {
      let dist = [{ p: 1, delta: -1 }];
      if (ctx.targetFaster) return dist;
      if (ctx.userHpPct > 70) return dist;
      dist = combineDist(dist, [{ p: 128 / 256, delta: 0 }, { p: 128 / 256, delta: 1 }]);
      if (ctx.userHpPct > 50) return dist;
      dist = combineDist(dist, [{ p: 128 / 256, delta: 0 }, { p: 128 / 256, delta: 1 }]);
      if (ctx.userHpPct > 30) return dist;
      dist = combineDist(dist, [{ p: 100 / 256, delta: 0 }, { p: 156 / 256, delta: 2 }]);
      return dist;
    },
  },
  // ── Batch 7: Recover/Milk Drink/Synthesis, Endure, Ingrain ───────────────
  EFFECT_RESTORE_HP: { checkViability: healFamilyViability }, // no CBM in source
  EFFECT_SOFTBOILED: { checkViability: healFamilyViability }, // no CBM in source
  EFFECT_SYNTHESIS: { checkViability: healFamilyViability }, // no CBM in source; AI_CV_HealWeather's weather prefix never fires here (see healFamilyViability's comment)
  EFFECT_MOONLIGHT: { checkViability: healFamilyViability }, // same AI_CV_HealWeather routing as Synthesis (data/battle_ai_scripts.s:731-733)
  EFFECT_MORNING_SUN: { checkViability: healFamilyViability }, // ditto
  EFFECT_ENDURE: {
    // No AI_CBM_Endure exists — CV only. The move's actual EXECUTION
    // mechanic (decay counter, 1-HP clamp) was already implemented in an
    // earlier session (see enumerateActionOutcomes/applyMove's dedicated
    // EFFECT_ENDURE branch) — only the AI's own SCORING was missing.
    // AI_CV_Endure (:1965-1976): own HP<4% -> flat -1 (too risky/pointless
    // even at near-death). HP in [4,35) -> the one HP band where it's
    // actually favored: 70/256 chance nothing, else 186/256 chance +1.
    // HP>=35 -> flat -1 (same as the near-death case — Endure isn't worth it
    // unless you're in that narrow "about to die but not yet" window).
    checkViability: (ctx) => {
      if (ctx.userHpPct < 4) return [{ p: 1, delta: -1 }];
      if (ctx.userHpPct < 35) return [{ p: 70 / 256, delta: 0 }, { p: 186 / 256, delta: 1 }];
      return [{ p: 1, delta: -1 }];
    },
  },
  EFFECT_INGRAIN: {
    // AI_CBM_Ingrain (:550-552): already rooted -> -10. No CV in source.
    checkBadMove: (ctx) => (ctx.userIngrained ? -10 : 0),
  },
  // ── Batch 8: Safeguard, Mean Look ────────────────────────────────────────
  EFFECT_SAFEGUARD: {
    // AI_CBM_Safeguard (:478-480): already up -> -8. No CV in source.
    checkBadMove: (ctx) => (ctx.userHasSafeguard ? -8 : 0),
  },
  EFFECT_MEAN_LOOK: {
    // AI_CBM_CantEscape (:430-432): target already escape-prevented -> -10.
    // Not modeled (no switching mechanic to prevent in Arena anyway) —
    // always false, matches convention for other not-yet-modeled ctx flags.
    checkBadMove: (ctx) => (ctx.targetCantEscape ? -10 : 0),
    // AI_CV_Trap (:1436-1447) — gated on target already being badly poisoned/
    // cursed/perish-songed/infatuated (none modeled yet, all default false),
    // so this currently always resolves to the "goto End" no-score branch.
    // Kept structurally complete (not just hardcoded to 0) so it activates
    // correctly the moment any of those statuses gets built.
    checkViability: (ctx) => {
      if (ctx.targetToxicPoisoned || ctx.targetCursed || ctx.targetPerishSonged || ctx.targetInfatuated) {
        return [{ p: 128 / 256, delta: 0 }, { p: 128 / 256, delta: 1 }];
      }
      return [{ p: 1, delta: 0 }];
    },
  },
  // ── Protect/Detect ────────────────────────────────────────────────────────
  EFFECT_PROTECT: {
    // No AI_CBM_Protect exists — CV only.
    // AI_CV_Protect (data/battle_ai_scripts.s:1894-1936) — the most elaborate
    // handler ported so far. get_protect_count reads the SAME shared decay
    // counter Endure uses (verified, not assumed — see the executor).
    checkViability: (ctx) => {
      // Used successfully 2+ times already this streak -> flat -2, overuse.
      if (ctx.userProtectCount > 1) return [{ p: 1, delta: -2 }];

      const userBadlyOff = ctx.userToxicPoisoned || ctx.userCursed || ctx.userPerishSonged
        || ctx.userInfatuated || ctx.userSeeded || ctx.userYawnPending;
      if (userBadlyOff || ctx.targetHasRestoreHpOrDefenseCurlMove) {
        // Protect3: scores -2 ONLY if the target's last move was Lock-On;
        // otherwise this path contributes nothing at all (0, not even
        // reaching the shared tail below — a real early "end", not a
        // no-score-then-continue).
        return ctx.targetLastMoveWasLockOn ? [{ p: 1, delta: -2 }] : [{ p: 1, delta: 0 }];
      }

      // +2 fires whenever the target is stuck in some stalling-friendly
      // status (poison/curse/perish song/infatuation/leech seed/yawn), OR
      // — this is the part easy to misread — whenever the target's LAST
      // move WASN'T Lock-On (i.e. +2 is the default; only a target that
      // just used exactly Lock-On skips it and goes straight to the tail
      // with nothing banked yet).
      const targetStalling = ctx.targetToxicPoisoned || ctx.targetCursed || ctx.targetPerishSonged
        || ctx.targetInfatuated || ctx.targetLeechSeeded || ctx.targetYawnPending;
      let dist = (targetStalling || !ctx.targetLastMoveWasLockOn)
        ? [{ p: 1, delta: 2 }]
        : [{ p: 1, delta: 0 }];

      // Protect2/Protect4 shared tail: one 50/50 -1, then (only if this is
      // the user's first Protect-family use this streak, count===0) done;
      // otherwise (count===1, since >1 already excluded above) a GUARANTEED
      // further -1, then one more 50/50 -1.
      dist = combineDist(dist, [{ p: 128 / 256, delta: 0 }, { p: 128 / 256, delta: -1 }]);
      if (ctx.userProtectCount === 0) return dist;
      dist = combineDist(dist, [{ p: 1, delta: -1 }]);
      dist = combineDist(dist, [{ p: 128 / 256, delta: 0 }, { p: 128 / 256, delta: -1 }]);
      return dist;
    },
  },
  // ── Weather (Sunny Day / Rain Dance / Sandstorm / Hail) ──────────────────
  EFFECT_SANDSTORM: {
    // AI_CBM_Sandstorm (:451-453): weather already sandstorm -> -8. NO CV in
    // source at all — Sandstorm is the only one of the 4 with no viability
    // handler (real asymmetry, not an omission on my part).
    checkBadMove: (ctx) => (ctx.currentWeather === "sandstorm" ? -8 : 0),
  },
  EFFECT_RAIN_DANCE: {
    checkBadMove: (ctx) => (ctx.currentWeather === "rain" ? -8 : 0),
    // AI_CV_RainDance (:2037-2058) — the one weather move with an ability
    // synergy check (Swift Swim/Rain Dish); Sunny Day/Hail don't get this,
    // a real asymmetry preserved as found. If the user is SLOWER than the
    // target AND has Swift Swim, it skips the HP check entirely (jumps
    // straight to +1) — Rain would let it outspeed despite being naturally
    // slower, so it's unconditionally good regardless of current HP.
    checkViability: (ctx) => {
      const userFaster = !ctx.targetFaster;
      if (!userFaster && ctx.userAbility === "Swift Swim") return [{ p: 1, delta: 1 }];
      if (ctx.userHpPct < 40) return [{ p: 1, delta: -1 }];
      if (["hail", "sun", "sandstorm"].includes(ctx.currentWeather) || ctx.userAbility === "Rain Dish") {
        return [{ p: 1, delta: 1 }];
      }
      return [{ p: 1, delta: 0 }];
    },
  },
  EFFECT_SUNNY_DAY: {
    checkBadMove: (ctx) => (ctx.currentWeather === "sun" ? -8 : 0),
    // AI_CV_SunnyDay (:2060-2075) — no ability check at all (unlike Rain
    // Dance's Swift Swim/Rain Dish synergy — Chlorophyll doesn't get the
    // same treatment here, a real asymmetry, not "fixed" to match).
    checkViability: (ctx) => {
      if (ctx.userHpPct < 40) return [{ p: 1, delta: -1 }];
      if (["hail", "rain", "sandstorm"].includes(ctx.currentWeather)) return [{ p: 1, delta: 1 }];
      return [{ p: 1, delta: 0 }];
    },
  },
  EFFECT_HAIL: {
    checkBadMove: (ctx) => (ctx.currentWeather === "hail" ? -8 : 0),
    // AI_CV_Hail (:2261-2274) — mirrors Sunny Day's shape exactly, no
    // ability check (no Ice Body in Gen III to check anyway).
    checkViability: (ctx) => {
      if (ctx.userHpPct < 40) return [{ p: 1, delta: -1 }];
      if (["sun", "rain", "sandstorm"].includes(ctx.currentWeather)) return [{ p: 1, delta: 1 }];
      return [{ p: 1, delta: 0 }];
    },
  },
  // ── Phase 2 leverage batch (coverage-audit-driven, see HANDOFF.md) ───────
  EFFECT_PSYCH_UP: {
    // AI_CBM_Haze (data/battle_ai_scripts.s:314-329) — shared verbatim with
    // Haze (not modeled — no set carries it). -10 only when BOTH "the user
    // has nothing of its own worth restoring" AND "the target has nothing
    // worth copying" are simultaneously true.
    checkBadMove: (ctx) => {
      const userStages = [ctx.userAtkStage, ctx.userDefStage, ctx.userSpeStage, ctx.userSpAtkStage, ctx.userSpDefStage, ctx.userAccStage, ctx.userEvasionStage];
      if (userStages.some((v) => v < 0)) return 0;
      if (Object.values(ctx.targetStages).some((v) => v > 0)) return 0;
      return -10;
    },
    // AI_CV_PsychUp (:2086-2112).
    checkViability: (ctx) => {
      const targetHighStats = [ctx.targetStages.atk, ctx.targetStages.def, ctx.targetStages.spa, ctx.targetStages.spd, ctx.targetStages.evasion];
      if (!targetHighStats.some((v) => v > 2)) return [{ p: 1, delta: -2 }];
      const userLowStats = [ctx.userAtkStage, ctx.userDefStage, ctx.userSpAtkStage, ctx.userSpDefStage];
      if (userLowStats.some((v) => v <= 0) || ctx.userEvasionStage <= 0) return [{ p: 1, delta: 1 }];
      return [{ p: 50 / 256, delta: 0 }, { p: 206 / 256, delta: -2 }];
    },
  },
  // EFFECT_YAWN: no AI_CBM_Yawn/AI_CV_Yawn exists in source at all (confirmed
  // by grep — Yawn gets zero dedicated AI scoring, an empty handler is
  // correct here, not a gap) — registered only so the "status move needs a
  // handler" guard doesn't fire.
  EFFECT_YAWN: {},
  EFFECT_WILL_O_WISP: {
    // AI_CBM_WillOWisp (:531-539). The x0/x0.5/x0.25 check is the AI's OWN
    // heuristic (treating Will-O-Wisp's Fire typing as if it were an attack)
    // — NOT the same code path as the real Fire-type-can't-be-burned
    // execution rule (that's inflictStatus's STATUS_IMMUNITY_TYPES, checked
    // separately in the executor below), just a correlated proxy the AI uses
    // for its own scoring.
    checkBadMove: (ctx) => {
      if (ctx.targetAbility === "Water Veil") return -10;
      if (ctx.targetStatus !== null) return -10;
      if (typeEffectiveness("Fire", ctx.targetTypes) <= 0.5) return -10;
      if (ctx.targetSafeguarded) return -10;
      return 0;
    },
  },
  EFFECT_ACCURACY_DOWN: {
    // AI_CBM_AccDown (:300-312): own-stage-at-minimum, Keen Eye, then the
    // shared CheckIfAbilityBlocksStatChange tail (Clear Body/White Smoke).
    checkBadMove: (ctx) => {
      if (ctx.targetStages.accuracy <= -6) return -10;
      if (ctx.targetAbility === "Keen Eye") return -10;
      if (ctx.targetAbility === "Clear Body" || ctx.targetAbility === "White Smoke") return -10;
      return 0;
    },
    checkViability: accuracyDownFamilyViability,
  },
  EFFECT_DEFENSE_DOWN_2: {
    checkBadMove: (ctx) => {
      if (ctx.targetStages.def <= -6) return -10;
      if (ctx.targetAbility === "Clear Body" || ctx.targetAbility === "White Smoke") return -10;
      return 0;
    },
    checkViability: (ctx) => statDownDefenseFamilyViability(ctx, "def"),
  },
  EFFECT_SPEED_DOWN_2: {
    // AI_CBM_SpeedDown (:287-290) — same shared tail, plus a Speed Boost check
    // not present on the other stat-down handlers.
    checkBadMove: (ctx) => {
      if (ctx.targetStages.spe <= -6) return -10;
      if (ctx.targetAbility === "Speed Boost") return -10;
      if (ctx.targetAbility === "Clear Body" || ctx.targetAbility === "White Smoke") return -10;
      return 0;
    },
    checkViability: speedDownFamilyViability,
  },
  EFFECT_ATTACK_DOWN_2: {
    // AI_CBM_AttackDown's shared tail does NOT check Hyper Cutter at all
    // (confirmed absent from data/battle_ai_scripts.s's CheckIfAbilityBlocksStatChange)
    // even though Hyper Cutter DOES block the actual stat change in execution
    // (src/battle_script_commands.c:4145) — a real, source-confirmed AI blind
    // spot, preserved here rather than "fixed" (matches this engine's existing
    // convention of preserving other AI blind spots, e.g. weather scoring).
    checkBadMove: (ctx) => {
      if (ctx.targetStages.atk <= -6) return -10;
      if (ctx.targetAbility === "Clear Body" || ctx.targetAbility === "White Smoke") return -10;
      return 0;
    },
    checkViability: attackDownFamilyViability,
  },
  EFFECT_SPECIAL_DEFENSE_DOWN_2: {
    checkBadMove: (ctx) => {
      if (ctx.targetStages.spd <= -6) return -10;
      if (ctx.targetAbility === "Clear Body" || ctx.targetAbility === "White Smoke") return -10;
      return 0;
    },
    checkViability: (ctx) => statDownDefenseFamilyViability(ctx, "spd"),
  },
  EFFECT_EVASION_DOWN: {
    checkBadMove: (ctx) => {
      if (ctx.targetStages.evasion <= -6) return -10;
      if (ctx.targetAbility === "Clear Body" || ctx.targetAbility === "White Smoke") return -10;
      return 0;
    },
    checkViability: (ctx) => statDownDefenseFamilyViability(ctx, "evasion"),
  },
  EFFECT_PERISH_SONG: {
    // AI_CBM_PerishSong (:447-449) — no AI_CV_PerishSong exists in source.
    checkBadMove: (ctx) => (ctx.targetPerishSonged ? -10 : 0),
  },
  // AI_CBM_HighRiskForDamage (:368-376) — shared by several generic damaging
  // effects, ported here for Return/Frustration specifically (this session's
  // scope). -10 if immune outright, or if the target has Wonder Guard and
  // this hit ISN'T a clean single-type "x2" (AI_EFFECTIVENESS_x2 is an exact
  // category match in source, not "at least 2x" — a real, preserved quirk:
  // Normal-type moves are NEVER super-effective against anything in Gen III,
  // so this always evaluates to -10 against a hypothetical Wonder Guard
  // target, matching Wonder Guard's real block-everything-but-clean-SE rule).
  EFFECT_RETURN: {
    checkBadMove: (ctx) => {
      if (typeEffectiveness(ctx.moveType, ctx.targetTypes) === 0) return -10;
      if (ctx.targetAbility === "Wonder Guard" && typeEffectiveness(ctx.moveType, ctx.targetTypes) !== 2) return -10;
      return 0;
    },
  },
  EFFECT_FRUSTRATION: {
    checkBadMove: (ctx) => {
      if (typeEffectiveness(ctx.moveType, ctx.targetTypes) === 0) return -10;
      if (ctx.targetAbility === "Wonder Guard" && typeEffectiveness(ctx.moveType, ctx.targetTypes) !== 2) return -10;
      return 0;
    },
  },
  // Every other effect: no handler yet. Fine for YOUR moves (no AI scoring
  // needed). If an OPPONENT ever carries one, chooseOpponentMoves will throw
  // naming the exact effect — port its AI_CV_*/AI_CBM_* handler from
  // data/battle_ai_scripts.s before using it as an opponent move.
};

// The "_2" (raises 2 stages) moves share the exact same AI handler as their
// "_1" counterpart per source (if_effect EFFECT_ATTACK_UP_2, AI_CBM_AttackUp,
// data/battle_ai_scripts.s:133-146) — same object, second key.
AI_HANDLERS.EFFECT_ATTACK_UP_2 = AI_HANDLERS.EFFECT_ATTACK_UP;
AI_HANDLERS.EFFECT_SPECIAL_ATTACK_UP_2 = AI_HANDLERS.EFFECT_SPECIAL_ATTACK_UP;
AI_HANDLERS.EFFECT_DEFENSE_UP_2 = AI_HANDLERS.EFFECT_DEFENSE_UP;
AI_HANDLERS.EFFECT_SPECIAL_DEFENSE_UP_2 = AI_HANDLERS.EFFECT_SPECIAL_DEFENSE_UP;
AI_HANDLERS.EFFECT_SPEED_UP_2 = AI_HANDLERS.EFFECT_SPEED_UP;

// ─────────────────────────────────────────────────────────────────────────
// 4. DAMAGE CALCULATION (Gen III formula)
// ─────────────────────────────────────────────────────────────────────────

// Standard stat-stage multiplier table (identical across all generations for
// non-accuracy/evasion stats). Accuracy/evasion use a different table
// (3/3 at 0 up to 9/3 and 3/9) — not implemented yet since nothing in any
// matchup so far has needed evasion to actually affect hit chance (Double
// Team's stage is tracked for AI-scoring purposes but not yet wired into
// resolveTurn's accuracy math — known gap, flagged rather than silent).
const STAT_STAGE_MULT = {
  "-6": 2/8, "-5": 2/7, "-4": 2/6, "-3": 2/5, "-2": 2/4, "-1": 2/3,
  "0": 1, "1": 3/2, "2": 4/2, "3": 5/2, "4": 6/2, "5": 7/2, "6": 8/2,
};
function stageMult(stage) { return STAT_STAGE_MULT[String(stage)] ?? 1; }

// Cloud Nine / Air Lock suppress EVERY weather effect (damage multiplier,
// chip damage, speed doubling, accuracy changes) while on the field, WITHOUT
// touching the underlying weatherType/weatherTurns state — the counter keeps
// ticking in the background (include/battle_util.h:47-48, WEATHER_HAS_EFFECT).
// One shared helper so every consumption site (damage, speed, accuracy,
// end-of-turn chip) agrees on whether weather actually does anything.
function effectiveWeather(state, you, opp) {
  if (you.ability === "Cloud Nine" || you.ability === "Air Lock") return null;
  if (opp.ability === "Cloud Nine" || opp.ability === "Air Lock") return null;
  return state.weatherType;
}

// Turn-order speed check, shared by resolveTurn (actual resolution) and
// chooseOpponentMoves (the AI's own "will I go first" belief when scoring
// if_target_faster/if_user_faster checks) — kept as ONE function so the two
// can never silently diverge. Applies the Speed stat-stage multiplier THEN
// quarters for paralysis, matching GetWhoStrikesFirst's real order of
// operations (src/battle_main.c:4624-4626 applies gStatStageRatios; :4650-4651
// divides by 4 for STATUS1_PARALYSIS, strictly after the stage ratio).
// weather: the EFFECTIVE weather (already Cloud-Nine/Air-Lock-checked by the
// caller) — Swift Swim doubles Speed in rain, Chlorophyll doubles it in sun
// (src/battle_main.c:4606-4616), applied at the SAME stage as the stat-stage
// ratio (both multiply the raw base Speed, computed together before any
// floor). Does NOT model badge speed boost, Macho Brace, or Quick Claw (none
// modeled elsewhere in this engine either — out of scope here).
function effSpeed(mon, status, speedStage = 0, weather = null) {
  const weatherMult = (mon.ability === "Swift Swim" && weather === "rain") || (mon.ability === "Chlorophyll" && weather === "sun") ? 2 : 1;
  const raw = Math.floor(mon.stats.spe * weatherMult * stageMult(speedStage));
  return status === "paralysis" ? Math.floor(raw / 4) : raw;
}

// Accuracy/evasion stage multiplier table — DIFFERENT from the main stat
// stage table above. Well-established, stable across generations, same
// confidence tier as the main stage table and type chart (no source
// research needed). The two stages combine into a SINGLE effective stage
// (attacker's accuracy stage minus target's evasion stage, clamped to
// -6..+6) before one lookup — not two separate multiplications.
const ACC_EVASION_STAGE_MULT = {
  "-6": 3/9, "-5": 3/8, "-4": 3/7, "-3": 3/6, "-2": 3/5, "-1": 3/4,
  "0": 1, "1": 4/3, "2": 5/3, "3": 6/3, "4": 7/3, "5": 8/3, "6": 9/3,
};
function effectiveAccuracy(baseAccuracy, attackerAccStage, targetEvasionStage) {
  const combined = Math.max(-6, Math.min(6, attackerAccStage - targetEvasionStage));
  return Math.min(100, baseAccuracy * ACC_EVASION_STAGE_MULT[String(combined)]);
}

// Flail/Reversal (EFFECT_FLAIL) exact power table, source-confirmed.
// hpFraction = floor(hp * 48 / maxHP), floored to 1 minimum whenever hp > 0.
// Table breaks at the FIRST threshold >= hpFraction (so exactly 4/48 gets 150,
// not 100). Uses CURRENT hp at the moment the move executes, not turn-start.
const FLAIL_POWER_TABLE = [[1, 200], [4, 150], [9, 100], [16, 80], [32, 40], [48, 20]];
function getFlailPower(hpPct) {
  const hpFraction = Math.max(1, Math.floor((hpPct / 100) * 48));
  for (const [threshold, power] of FLAIL_POWER_TABLE) {
    if (hpFraction <= threshold) return power;
  }
  return 20;
}

// EFFECT_RETURN/EFFECT_FRUSTRATION (Cmd_friendshiptodamagecalculation,
// src/battle_script_commands.c:8603-8611): power = trunc(10 * friendship / 25)
// for Return, trunc(10 * (255 - friendship) / 25) for Frustration — integer
// truncation, matching Math.floor since friendship is always non-negative.
// At max friendship (255): Return = 102 (confirmed against source, NOT 104).
function getFriendshipPower(effect, friendship) {
  return effect === "EFFECT_RETURN"
    ? Math.floor((10 * friendship) / 25)
    : Math.floor((10 * (255 - friendship)) / 25);
}

function calcDamage(attacker, defender, moveName, {
  rollFrac = 0.925, crit = false, atkStage = 0, defStage = 0,
  attackerBurned = false, attackerFlashFireActive = false, attackerHpPct = 100,
  screenActive = false, weather = null,
} = {}) {
  const move = MOVES[moveName];
  if (move.power === 0) return 0;
  const effectivePower = moveName === "Flail" || moveName === "Reversal" ? getFlailPower(attackerHpPct)
    : (move.effect === "EFFECT_RETURN" || move.effect === "EFFECT_FRUSTRATION") ? getFriendshipPower(move.effect, attacker.friendship)
    : move.power;

  const atkStatKey = move.category === "physical" ? "atk" : "spa";
  const defStatKey = move.category === "physical" ? "def" : "spd";
  // Crits ignore negative attack stages and positive defense stages (Gen III rule).
  const effAtkStage = crit ? Math.max(0, atkStage) : atkStage;
  const effDefStage = crit ? Math.min(0, defStage) : defStage;
  const atkStat = Math.floor(attacker.stats[atkStatKey] * stageMult(effAtkStage));
  const defStatRaw = Math.floor(defender.stats[defStatKey] * stageMult(effDefStage));
  // Explosion and Self Destruct both carry effect: "EFFECT_EXPLOSION" in
  // move-data.js — keying off that (like everywhere else in this file)
  // instead of the move NAME. The previous version checked the move name
  // and had "Self-Destruct" (hyphenated) instead of the real key ("Self
  // Destruct", space) — never matched anything, a real bug caught while
  // pre-flighting Snorlax (this defense-halving bonus silently never applied).
  const effDef = move.effect === "EFFECT_EXPLOSION" ? Math.floor(defStatRaw / 2) : defStatRaw;

  let preFinal = Math.floor(
    Math.floor((2 * attacker.level / 5 + 2) * effectivePower * atkStat / effDef) / 50
  );

  // Burn: physical damage halved, UNLESS attacker has Guts (source-confirmed
  // ordering: this happens here, before the +2 and before STAB/type-calc,
  // and DOES apply to crits — nothing exempts crits from it).
  if (attackerBurned && move.category === "physical" && attacker.ability !== "Guts") {
    preFinal = Math.floor(preFinal / 2);
  }
  // Reflect/Light Screen: halves damage at this same pre-+2 stage (src/pokemon.c:3267-3273
  // physical, :3318-3324 special — same position in the formula for both,
  // right after burn/before the defending side's other computations). Crits
  // BYPASS this entirely (gCritMultiplier == 1 gate in source) — the caller
  // is responsible for only passing screenActive=true when !crit.
  if (screenActive) {
    preFinal = Math.floor(preFinal / 2);
  }
  // Rain/Sun: applies at this SAME pre-+2 stage, immediately after screen
  // halving (src/pokemon.c:3330-3362 — confirmed the weather block sits
  // right after the Light Screen/double-battle halving, before anything
  // else). Rain weakens Fire (/2) and boosts Water (x1.5); Sun boosts Fire
  // (x1.5) and weakens Water (/2). Only ever matters for Fire/Water moves,
  // which are always special-category in Gen III, so no separate category
  // gate is needed. `weather` here is the EFFECTIVE weather (already
  // Cloud-Nine/Air-Lock-checked by the caller via effectiveWeather()).
  if (weather === "rain") {
    if (move.type === "Fire") preFinal = Math.floor(preFinal / 2);
    else if (move.type === "Water") preFinal = Math.floor((15 * preFinal) / 10);
  } else if (weather === "sun") {
    if (move.type === "Fire") preFinal = Math.floor((15 * preFinal) / 10);
    else if (move.type === "Water") preFinal = Math.floor(preFinal / 2);
  }
  // Flash Fire: 1.5x the holder's own Fire-type damage, applied at this same
  // pre-STAB stage per source (inside CalculateBaseDamage, before the +2).
  if (attackerFlashFireActive && move.type === "Fire") {
    preFinal = Math.floor((15 * preFinal) / 10);
  }

  let base = preFinal + 2;

  const stab = attacker.types.includes(move.type) ? 1.5 : 1;
  const eff = typeEffectiveness(move.type, defender.types);
  const critMult = crit ? 2 : 1;

  let dmg = Math.floor(base * stab);
  dmg = Math.floor(dmg * eff);
  dmg = Math.floor(dmg * critMult);
  dmg = Math.floor(dmg * rollFrac);
  if (eff === 0) return 0; // complete type immunity — the min-1 floor below is for weak-but-effective hits only
  return Math.max(1, dmg);
}

function calcConfusionDamage(mon, rollFrac = 0.925) {
  const base = Math.floor(
    Math.floor(Math.floor((2 * mon.level / 5 + 2) * 40 * mon.stats.atk / mon.stats.def) / 50) + 2
  );
  return Math.max(1, Math.floor(base * rollFrac));
}

// ─────────────────────────────────────────────────────────────────────────
// 5. OPPONENT AI MOVE SELECTION (generic — works for any opponent mon as
//    long as every move in its set has an AI_HANDLERS entry, or is a plain
//    damaging move with no special effect)
//
//    IMPORTANT: several real AI_CV_* handlers (confirmed via source) contain
//    genuine internal randomness (if_random_less_than rolls) that affects
//    the SCORE ITSELF, not just whether the move gets picked afterward. The
//    real game rolls these dice once, computes concrete scores for all
//    candidate moves, THEN takes the argmax — so "which move wins" is a
//    random variable over the JOINT outcome of every candidate's internal
//    rolls, not just a tie-break over deterministic scores. checkViability
//    handlers therefore return a DISTRIBUTION — an array of
//    { p, delta } summing to 1 — instead of a single number. Handlers with
//    no live randomness just return a single-point distribution.
// ─────────────────────────────────────────────────────────────────────────

// Convolves two independent score-delta distributions into one (cross
// product of outcomes, probabilities multiplied, deltas summed).
function combineDist(a, b) {
  const out = [];
  for (const x of a) for (const y of b) out.push({ p: x.p * y.p, delta: x.delta + y.delta });
  return out;
}

// sIgnoredPowerfulMoveEffects (src/battle_ai_script_commands.c:266-281) — moves
// whose real table-stored power is a fixed placeholder (charge/recharge/self-
// KO/HP-cost moves with dynamically-computed real power). get_how_powerful_
// move_is exempts these on BOTH sides of its comparison: such a move is never
// penalized for "not being the strongest" itself, and never counts when
// checking whether some OTHER move in the set outguns the one being scored.
const IGNORED_POWERFUL_MOVE_EFFECTS = new Set([
  "EFFECT_EXPLOSION", "EFFECT_DREAM_EATER", "EFFECT_RAZOR_WIND", "EFFECT_SKY_ATTACK",
  "EFFECT_RECHARGE", "EFFECT_SKULL_BASH", "EFFECT_SOLAR_BEAM", "EFFECT_SPIT_UP",
  "EFFECT_FOCUS_PUNCH", "EFFECT_SUPERPOWER", "EFFECT_ERUPTION", "EFFECT_OVERHEAT",
]);

// Cmd_get_how_powerful_move_is's own eligibility gate: power > 1 (excludes
// status moves and the whole "power stored as 1, real power computed
// dynamically" family — Flail/Reversal/Counter/Mirror Coat/etc, matching
// real source's static table value) AND not on the ignored-effects list above.
function isPowerfulMoveEligible(moveName) {
  const m = MOVES[moveName];
  return !!m && m.power > 1 && !IGNORED_POWERFUL_MOVE_EFFECTS.has(m.effect);
}

// Returns the move's full score distribution: [{ p, score }], summing to 1.
function scoreOpponentMoveDist(user, target, moveName, ctx) {
  const move = MOVES[moveName];
  if (!move) throw new Error(`Move "${moveName}" not in MOVES — add its data before using it.`);
  const handler = AI_HANDLERS[move.effect];

  if (move.power === 0 && !handler) {
    throw new Error(`"${moveName}" (effect: ${move.effect}) is a status move with no AI handler — port its ` +
      `AI_CBM_*/AI_CV_* logic from battle_ai_scripts.s before an opponent can use it.`);
  }
  if (SILENT_FALLTHROUGH_EFFECTS.has(move.effect) && !handler) {
    throw new Error(`"${moveName}" (effect: ${move.effect}) has a non-generic damage mechanic with no ` +
      `dedicated AI handler yet — scoring it via the generic power-based path (AI_TryToFaint's simDmg check ` +
      `included) would silently use a near-meaningless damage estimate off its move-data.js placeholder power ` +
      `(same bug class as the historical EFFECT_OHKO bug, see HANDOFF.md §10). Port it before an opponent can use it.`);
  }

  let dist = [{ p: 1, delta: 100 }]; // baseline

  // Per-move ctx: same shared ctx object, plus the current move's type (needed
  // by handlers like EFFECT_PARALYZE that run a real type-chart check against
  // the move actually being scored — ctx itself is built once per opponent
  // moveset in chooseOpponentMoves, so it can't carry a single move's type).
  const moveCtx = { ...ctx, moveType: move.type };

  if (handler?.checkBadMove) {
    // Almost every checkBadMove is a plain scalar (AI_CheckBadMove has no
    // live randomness in most branches ported so far). EFFECT_ATTRACT is the
    // first exception — its badness genuinely depends on an uncertain
    // gender (either side's, for a variable-ratio species) — so this mirrors
    // checkViability's existing array-distribution convention just below,
    // rather than adding a second, parallel mechanism.
    const result = handler.checkBadMove(moveCtx);
    const badMoveDist = Array.isArray(result) ? result : [{ p: 1, delta: result }];
    dist = combineDist(dist, badMoveDist);
  }

  // AI_TryToFaint — generic, applies to any damaging move (data/battle_ai_scripts.s:2616-2622).
  if (move.power > 0) {
    const simDmg = calcDamage(user, target, moveName, { rollFrac: 0.925 });
    const targetHp = Math.round((ctx.targetHpPct / 100) * target.stats.hp);
    if (simDmg >= targetHp) {
      // if_can_faint branch (AI_TryToFaint_TryToEncourageQuickAttack) — already ported.
      dist = combineDist(dist, [{ p: 1, delta: 4 }]);
    } else {
      // Move can't already secure the KO — get_how_powerful_move_is, THEN
      // (mutually exclusive with the penalty below) the x4-effectiveness
      // bonus. Real source reaches the x4 check whenever the considered move
      // is NOT flagged MOVE_NOT_MOST_POWERFUL — which includes both "is
      // eligible and truly the strongest (or tied)" AND "was never eligible
      // to begin with" (power<=1 or an ignored effect) — so the penalty is
      // gated on eligibility but the bonus check never is.
      let notMostPowerful = false;
      if (isPowerfulMoveEligible(moveName)) {
        // Cmd_get_how_powerful_move_is floors a 0 (type-immune) simulated
        // damage up to 1 for THIS comparison specifically — a distinct
        // quirk from the real battle-damage 0-floor bug already fixed
        // elsewhere in this file (see calcDamage's own eff===0 early
        // return, which must NOT be touched) — replicated here on top of
        // calcDamage's real number, not as a separate proxy calculation.
        const myDmg = Math.max(1, simDmg);
        notMostPowerful = user.moves.some((rivalMove) => {
          if (rivalMove === moveName || !isPowerfulMoveEligible(rivalMove)) return false;
          const rivalDmg = Math.max(1, calcDamage(user, target, rivalMove, { rollFrac: 0.925 }));
          return rivalDmg > myDmg;
        });
      }
      if (notMostPowerful) {
        dist = combineDist(dist, [{ p: 1, delta: -1 }]);
      } else {
        // AI_TryToFaint_DoubleSuperEffective: if_random_less_than 80 jumps
        // AWAY (no bonus) when the roll is < 80/256 — so the +2 actually
        // fires on the complementary (256-80)/256 ≈ 68.75% of rolls, not
        // 80/256 (confirmed against Cmd_if_random_less_than's real
        // semantics: jumps on TRUE, `if_random_less_than 80` fires <80/256
        // of the time, so scoring code that falls through without jumping
        // runs the other ~176/256) — corrects §4's stale "80/256" note.
        const eff = typeEffectiveness(move.type, target.types);
        if (eff === 4) {
          dist = combineDist(dist, [{ p: 80 / 256, delta: 0 }, { p: 176 / 256, delta: 2 }]);
        }
      }
    }
  }

  if (handler?.checkViability) {
    const result = handler.checkViability(moveCtx);
    const viabilityDist = Array.isArray(result) ? result : [{ p: 1, delta: result }];
    dist = combineDist(dist, viabilityDist);
  }

  // Merge identical scores (keeps the distribution small after convolution).
  const bucketed = new Map();
  for (const { p, delta } of dist) {
    bucketed.set(delta, (bucketed.get(delta) || 0) + p);
  }
  return [...bucketed.entries()].map(([score, p]) => ({ p, score }));
}

// Backward-compatible scalar version (expected value) — used only where a
// single representative number is genuinely fine (e.g. debug printouts),
// NEVER for move selection (see chooseOpponentMoves).
function scoreOpponentMove(user, target, moveName, ctx) {
  const dist = scoreOpponentMoveDist(user, target, moveName, ctx);
  return dist.reduce((sum, { p, score }) => sum + p * score, 0);
}


// Returns [{ move, prob }] — the real probability distribution over which
// move the AI ends up picking, accounting for each candidate's own internal
// scoring randomness (see scoreOpponentMoveDist). Replaces the old
// "just take the deterministic argmax" approach, which silently assumed
// away real randomness that's actually part of several handlers.
function chooseOpponentMoves(opp, you, state) {
  const ctx = {
    userHpPct: state.oppHpPct,
    targetHpPct: state.yourHpPct,
    targetConfused: false, // extend if "you" can be confused by something other than Confuse Ray
    targetTypes: you.types,
    userEvasionStage: state.oppStages.evasion,
    // targetToxicPoisoned/targetCursed still not modeled (regular-vs-badly-
    // poisoned isn't distinguished; non-Ghost Curse doesn't set any "cursed"
    // status, and Ghost-Curse throws) — left false. Ingrain and Leech Seed
    // ARE now real (this batch/batch 4) — wired to actual state below.
    targetToxicPoisoned: false, targetCursed: false,
    userIngrained: state.oppIngrained,
    targetLeechSeeded: state.youSeeded,
    // Added for EFFECT_PARALYZE/EFFECT_ROAR/EFFECT_REST (this batch):
    targetAbility: you.ability,
    targetStatus: state.youStatus, // null | "paralysis" | "freeze" | "burn" | "poison" — real STATUS1_ANY gate
    targetSafeguarded: false, // Safeguard not modeled yet — default false, same convention as above
    // EFFECT_ATTRACT (this batch): AI_USER is the opponent itself, AI_TARGET
    // is the player — each mon's genderDist was computed once in buildMon.
    // targetInfatuated mirrors STATUS2_INFATUATION — doesn't matter WHO the
    // player is infatuated with, only whether Attract would be a no-op.
    userGenderDist: opp.genderDist,
    targetGenderDist: you.genderDist,
    targetInfatuated: state.youAttracted,
    targetStages: state.youStages, // needed by EFFECT_ROAR's "is any of the target's stats boosted" check
    // "will the opponent (user) act before the player (target) if it picks
    // this move" — same formula resolveTurn will actually use (see effSpeed).
    targetFaster: effSpeed(you, state.youStatus, state.youStages.spe, effectiveWeather(state, you, opp)) > effSpeed(opp, state.oppStatus, state.oppStages.spe, effectiveWeather(state, you, opp)),
    // EFFECT_ROAR's count_usable_party_mons(AI_TARGET) check — source-confirmed
    // NONZERO in real Arena play (see the long comment on EFFECT_ROAR above):
    // the AI sees the player's other FRONTIER_PARTY_SIZE=3 team slots same as
    // in Battle Tower, oblivious to Arena's switch-lock. Defaults to 2 (full
    // reserve team alive); threaded from analyzeMatchup's yourUsablePartyMons
    // option once the team-run workflow needs to reflect earlier-round faints.
    targetUsablePartyMons: state.yourUsablePartyMons,
    targetHasSnatch: false, // Snatch not modeled yet — used by EFFECT_REST's shared tail
    // Added for the stat-boost family (EFFECT_ATTACK_UP/_2, DEFENSE_UP/_2,
    // SPEED_UP/_2, SPECIAL_ATTACK_UP/_2, SPECIAL_DEFENSE_UP/_2) — this batch:
    userAtkStage: state.oppStages.atk, userDefStage: state.oppStages.def,
    userSpeStage: state.oppStages.spe, userSpAtkStage: state.oppStages.spa,
    userSpDefStage: state.oppStages.spd,
    // AI_CV_AccuracyDown's own-accuracy-stage check, AI_CBM_Haze/AI_CV_PsychUp's
    // 7-stat "is anything of mine already lowered" scan.
    userAccStage: state.oppStages.accuracy,
    // gLastMoves[gBattlerTarget] equivalent (state.youLastMove) — used by
    // AI_CV_DefenseUp/AI_CV_SpDefUp's "was the last hit physical or special"
    // check. null on turn 1 (no prior move) reads the same as a status move
    // (power 0), matching get_move_power_from_result on an empty history.
    targetLastMoveHadPower: state.youLastMove != null && MOVES[state.youLastMove].power > 0,
    targetLastMoveWasPhysical: state.youLastMove != null && MOVES[state.youLastMove].category === "physical",
    // AI_CV_Sleep's has_move_with_effect(AI_TARGET, ...) check — the player's
    // ("you") KNOWN moveset, not the current turn's chosen move.
    targetHasDreamEaterOrNightmare: you.moves.some((m) => ["EFFECT_DREAM_EATER", "EFFECT_NIGHTMARE"].includes(MOVES[m]?.effect)),
    // Added for batch 4 (Dragon Dance/Curse/Leech Seed/Baton Pass):
    userTypes: opp.types, // EFFECT_CURSE's Ghost-type branch check
    // AI_CBM_BatonPass's count_usable_party_mons(AI_USER) — the OPPONENT'S
    // OWN reserves, mirrored from ctx.targetUsablePartyMons's reasoning (same
    // FRONTIER_PARTY_SIZE=3 fact) but for the AI's own side this time.
    userUsablePartyMons: state.oppUsablePartyMons,
    // AI_CV_Toxic (shared by EFFECT_TOXIC and EFFECT_LEECH_SEED)'s two
    // has-move checks — both examine the OPPONENT's ("user"'s) OWN known
    // moveset, not the target's. NOTE: literally EFFECT_SPECIAL_DEFENSE_UP
    // only (data/battle_ai_scripts.s:1363) — NOT the _2 variant (Amnesia) —
    // preserved as written, not "fixed" to include it.
    // Guarded (matches the sibling check just below) — a moveset entry
    // missing from move-data.js must not crash this; treated conservatively
    // as "might have power" rather than assumed status-only.
    userHasNoAttackingMoves: opp.moves.every((m) => MOVES[m]?.power === 0),
    userHasSpDefUpOrProtectMove: opp.moves.some((m) => ["EFFECT_SPECIAL_DEFENSE_UP", "EFFECT_PROTECT"].includes(MOVES[m]?.effect)),
    // Batch 5 (Substitute/Reflect/Light Screen) — all about the OPPONENT'S
    // ("user"'s) own persistent state, not the target's.
    userHasSubstitute: state.oppSubstituteHP != null,
    userHasReflect: state.oppReflectTurns != null,
    userHasLightScreen: state.oppLightScreenTurns != null,
    // Batch 6 (Swagger): AI_CV_Swagger's if_has_move(AI_USER, MOVE_PSYCH_UP)
    // and get_turn_count checks — both about the OPPONENT's own moveset/the
    // battle's turn counter, not the target.
    userHasPsychUp: opp.moves.includes("Psych Up"),
    isFirstTurn: state.turn === 1,
    // Batch 8 (Safeguard/Mean Look):
    userHasSafeguard: state.oppSafeguardTurns != null,
    // Not modeled yet — no switching mechanic in Arena to prevent, and none
    // of Toxic-poison/Curse-status/Perish Song/Infatuation are tracked as
    // their own flags. Defaults false, same convention as other gaps.
    targetCantEscape: false, targetPerishSonged: state.youPerishSonged, targetInfatuated: false,
    // Protect/Detect (AI_CV_Protect) — reuses the shared decay counter and
    // the real (now-wired) targetLeechSeeded flag; everything else it needs
    // that isn't modeled yet (badly-poisoned/cursed/perish-song/infatuation/
    // yawn, on either side) defaults false, same convention as above.
    userProtectCount: state.oppProtectUses,
    userToxicPoisoned: false, userCursed: false, userPerishSonged: false, userInfatuated: false,
    userSeeded: state.oppSeeded, // real — the opponent itself currently seeded by Leech Seed
    userYawnPending: false, targetYawnPending: false,
    targetHasRestoreHpOrDefenseCurlMove: you.moves.some((m) => ["EFFECT_RESTORE_HP", "EFFECT_DEFENSE_CURL"].includes(MOVES[m]?.effect)),
    targetLastMoveWasLockOn: state.youLastMove != null && MOVES[state.youLastMove].effect === "EFFECT_LOCK_ON",
    // Weather (Sunny Day/Rain Dance/Sandstorm/Hail). get_weather
    // (src/battle_ai_script_commands.c:1644-1665) reads gBattleWeather
    // DIRECTLY with no WEATHER_HAS_EFFECT check at all — a real, confirmed
    // vanilla quirk: the AI's own scoring is blind to Cloud Nine/Air Lock
    // suppression (it "sees" weather that isn't actually doing anything).
    // So this is deliberately the RAW weatherType, NOT effectiveWeather() —
    // preserving that quirk, not correcting it.
    currentWeather: state.weatherType,
    userAbility: opp.ability,
    // AI_CBM_OneHitKO's if_level_cond check (EFFECT_OHKO) — the only handler
    // that needs either mon's raw level.
    userLevel: opp.level, targetLevel: you.level,
  };

  const perMoveDist = opp.moves.map((m) => ({ move: m, dist: scoreOpponentMoveDist(opp, you, m, ctx) }));

  // Cartesian product across all moves' distributions — each combination is
  // one "what if these specific dice all landed this way" world.
  let combos = [{ p: 1, scores: {} }];
  for (const { move, dist } of perMoveDist) {
    const next = [];
    for (const c of combos) {
      for (const d of dist) {
        next.push({ p: c.p * d.p, scores: { ...c.scores, [move]: d.score } });
      }
    }
    combos = next;
  }

  const outcomeProb = new Map();
  for (const combo of combos) {
    const maxScore = Math.max(...Object.values(combo.scores));
    const winners = Object.entries(combo.scores).filter(([, s]) => s === maxScore).map(([m]) => m);
    for (const w of winners) {
      outcomeProb.set(w, (outcomeProb.get(w) || 0) + combo.p / winners.length);
    }
  }

  return [...outcomeProb.entries()].map(([move, prob]) => ({ move, prob })).sort((a, b) => b.prob - a.prob);
}

// ─────────────────────────────────────────────────────────────────────────
// 6. ARENA JUDGE SCORING
// ─────────────────────────────────────────────────────────────────────────

function mindDelta(moveName) {
  return MOVES[moveName]?.mindRating ?? 0;
}

function skillDelta(outcome) {
  switch (outcome) {
    case "landedSuperEffective": return 2;
    case "landedMixed": return 1;
    case "landed": return 1;
    case "landedNVE": return -1;
    case "miss": return -2;
    case "noEffect": return -2;
    case "blocked": return -3; // ability/item block (Wonder Guard, Levitate, Volt/Water Absorb, Soundproof) — confirmed via BattleArena_DeductSkillPoints
    default: return 0;
  }
}

function classifyOutcome(hit, eff) {
  if (!hit) return "miss";
  if (eff === 0) return "noEffect";
  if (eff > 1) return "landedSuperEffective";
  if (eff < 1) return "landedNVE";
  return "landed";
}

// ─────────────────────────────────────────────────────────────────────────
// 7. TURN RESOLUTION + BACKTRACKING SEARCH
//    `you` and `opp` are now parameters threaded through every function
//    instead of hardcoded globals.
// ─────────────────────────────────────────────────────────────────────────

// Starting HP is a parameter — carries forward from a prior 1v1 in the same
// team run (a mon that already won a judged round keeps its damage; the
// opponent's next mon coming in fresh defaults to 100).
// Permanent-weather abilities (Sand Stream/Drought/Drizzle) activate on
// switch-in — src/battle_util.c:2532-2558 (ABILITYEFFECT_ON_SWITCHIN). Since
// Arena is a fresh 1v1 with no reserves, this only ever matters at the very
// start of the match (both mons "switch in" simultaneously; no later
// switch-in can ever happen). If BOTH sides somehow had one (not possible in
// this dataset — only Sand Stream appears, on Tyranitar), real activation
// order would follow speed; not modeled since it never actually arises here.
function permanentWeatherFromAbility(mon) {
  if (mon.ability === "Sand Stream") return "sandstorm";
  if (mon.ability === "Drought") return "sun";
  if (mon.ability === "Drizzle") return "rain";
  return null;
}

// `overrides`: an optional flat object applied ON TOP OF the fresh-match
// defaults below — for starting a solve from an arbitrary OBSERVED mid-match
// state (the live coaching UI's use case), not just a fresh 100/100 match
// start. Deliberately a GENERIC shallow merge (not a hand-maintained
// allowlist of "supported" override fields) so every field already in this
// state object — including ones added by future mechanics — is override-able
// for free, matching Lesson 7's "finite known things get filled completely"
// spirit applied to the state shape itself. The ONE exception is `youStages`/
// `oppStages`: those are nested 7-key objects (atk/def/spa/spd/spe/evasion/
// accuracy), so a naive shallow merge on TOP of the outer object would let a
// PARTIAL override (e.g. just `{ atk: 2 }`) silently wipe the other 6 keys to
// `undefined` instead of leaving them at their fresh default of 0 — merged
// one level deeper specifically for those two fields. `turn` is deliberately
// override-able too (not just HP/stages/status) since it feeds real logic
// (`isFirstTurn` in chooseOpponentMoves's ctx, used by AI_CV_Swagger) — a
// mid-match override that forgets to set `turn` would silently make the AI
// think it's still turn 1.
//
// The no-overrides call path is UNCHANGED byte-for-byte from before this was
// added (see the early return below) — this is a strict additive capability,
// not a replacement of the default path.
function buildStartState({ yourHpPct = 100, oppHpPct = 100, yourUsablePartyMons = 2, oppUsablePartyMons = 2, you = null, opp = null, overrides = null } = {}) {
  const freshStages = () => ({ atk: 0, def: 0, spa: 0, spd: 0, spe: 0, evasion: 0, accuracy: 0 });
  // weatherType: null | "rain" | "sun" | "sandstorm" | "hail" — a single
  // GLOBAL condition, not per-side (src/battle_main.c:695, one gBattleWeather
  // variable). weatherTurns: null means either "no weather" (weatherType
  // also null) OR "permanent" (weatherType set, never decrements/expires —
  // Sand Stream etc.); a number means turns remaining (starts at 5 for any
  // of the 4 weather-setting MOVES, src/battle_script_commands.c:6681-6694
  // and siblings — confirmed identical for all 4).
  const initialWeather = you && opp ? (permanentWeatherFromAbility(you) || permanentWeatherFromAbility(opp)) : null;
  const base = {
    turn: 1,
    yourHpPct, oppHpPct,
    weatherType: initialWeather, weatherTurns: null, // null turns = permanent when weatherType is set from an ability

    yourUsablePartyMons, oppUsablePartyMons, // PER-MATCHUP inputs like yourHpPct/oppHpPct, not constants — see analyzeMatchup's comment
    metagrossConfused: false, // NOTE: only "you can be confused" is modeled — see known limitations
    youAttracted: false, // Attract — same one-directional limitation as confusion (opponent->you only; none of your 3 team mons carry Attract)
    youStages: freshStages(), oppStages: freshStages(),
    youStatus: null, oppStatus: null, // null | "paralysis" | "freeze" | "burn" | "poison" | "sleep"
    youSleepTurns: null, oppSleepTurns: null, // turns-remaining counter, rolled ONCE at infliction (see enumerateActionOutcomes)
    youSeeded: false, oppSeeded: false, // Leech Seed — true means THIS side is seeded and drains into the other every end-of-turn
    youLastMove: null, oppLastMove: null, // gLastMoves[battler] equivalent — set unconditionally whenever that actor acts (src/battle_script_commands.c:4407, gLastMoves[gBattlerAttacker] = gChosenMove), regardless of hit/prevented. Needed by e.g. AI_CV_DefenseUp/AI_CV_SpDefUp's "was I just hit by a physical/special move" check.
    // Substitute: null = no sub. A number = the sub's REMAINING HP pool
    // (starts at floor(maxHP/4), min 1 — src/battle_script_commands.c:7808-7833).
    // Damage redirects here instead of the real mon's HP until it hits 0
    // (Cmd_datahpupdate, :1865-1892) — see the redirect logic in applyMove.
    youSubstituteHP: null, oppSubstituteHP: null,
    // Reflect/Light Screen: null = inactive, else turns REMAINING (starts at
    // 5, src/battle_script_commands.c:6707/7478). Decremented once per FULL
    // turn (not per-battler — a separate end-of-turn tracker from Leech
    // Seed/poison/burn, src/battle_util.c:1221-1245/1246-1264).
    youReflectTurns: null, oppReflectTurns: null,
    youLightScreenTurns: null, oppLightScreenTurns: null,
    // Safeguard: null = inactive, else turns remaining (starts at 5 — same
    // shape as Reflect/Light Screen). Blocks major-status infliction AND
    // confusion for the protected side. Added ahead of EFFECT_SAFEGUARD's
    // own port so EFFECT_SWAGGER's executor (this batch) can check it
    // correctly now rather than defaulting to a stale always-false value.
    youSafeguardTurns: null, oppSafeguardTurns: null,
    youDestinyBondActive: false, oppDestinyBondActive: false, // single-turn — cleared at the start of that mon's own next turn
    youIngrained: false, oppIngrained: false, // STATUS3_ROOTED — 1/16 max HP heal each end-of-turn, BEFORE Leftovers
    youFlashFireActive: false, oppFlashFireActive: false,
    youCharging: null, oppCharging: null, // null | { move, invulnBit } — semi-invulnerable moves (Dive/Fly/Dig/Bounce)
    youEndureActive: false, oppEndureActive: false, // only true for the turn Endure was used
    youProtected: false, oppProtected: false, // only true for the turn Protect/Detect was used (mirrors youEndureActive — a SEPARATE flag from it, per source: :6521-6524 sets .endured vs .protected distinctly)
    youProtectUses: 0, oppProtectUses: 0, // shared Protect/Endure/Detect consecutive-use decay counter
    youBerryConsumed: false, oppBerryConsumed: false, // status-curing berry (Lum/Cheri/Chesto/etc.) — one-time use, match-long (NOT reset per-turn, see tryCureWithBerry)
    // Yawn: null = not drowsy, else turns until real sleep infliction is
    // attempted (starts at 2 — src/battle_util.c ENDTURN_YAWN, :1753-1771).
    youYawnTurns: null, oppYawnTurns: null,
    // Perish Song: whether this side has ever been perish-songed this match
    // (Soundproof/already-set exempts a side at cast time — see
    // EFFECT_EXECUTORS.EFFECT_PERISH_SONG for why no countdown/faint field
    // is needed here at all).
    youPerishSonged: false, oppPerishSonged: false,
    mindYou: 0, mindOpp: 0,
    skillYou: 0, skillOpp: 0,
    // Per-turn damage received, for Counter/Mirror Coat. Reset at the start
    // of each turn (see resolveTurn) — only reflects damage taken THIS turn,
    // matching real mechanics (Counter/Mirror Coat fail if the user acted
    // first, since there's nothing to reflect yet).
    youDamageTaken: null, oppDamageTaken: null, // { amount, category } | null
  };
  if (!overrides) return base; // unchanged path — byte-identical to before overrides existed
  return {
    ...base,
    ...overrides,
    youStages: { ...base.youStages, ...(overrides.youStages || {}) },
    oppStages: { ...base.oppStages, ...(overrides.oppStages || {}) },
  };
}

function freshTurnDamageTracking(s) {
  // Destiny Bond cleared here too — same "reset at the top of the turn,
  // re-armed within the turn if used again" shape as Endure (CANCELER_FLAGS,
  // src/battle_util.c:2010-2011, clears STATUS2_DESTINY_BOND at the start of
  // the mon's own next action attempt).
  return {
    ...s,
    youDamageTaken: null, oppDamageTaken: null, youEndureActive: false, oppEndureActive: false,
    youProtected: false, oppProtected: false,
    youDestinyBondActive: false, oppDestinyBondActive: false,
  };
}

function cloneState(s) {
  return { ...s, youStages: { ...s.youStages }, oppStages: { ...s.oppStages } };
}

function describeAction(actor, moveName, hit, selfHit, statusPrevented, attractPrevented = false, hitCount = null) {
  const who = actor === "you" ? "You" : "Opp";
  if (statusPrevented) return `${who} is fully paralyzed/frozen and can't move`;
  if (attractPrevented) return `${who} is immobilized by love and can't move`;
  if (selfHit) return `${who} hits itself in confusion`;
  const moveData = MOVES[moveName];
  if (moveData.power === 0) return `${who} uses ${moveName}`;
  if (hit && hitCount != null) return `${who} uses ${moveName} (hits ${hitCount}x)`;
  return `${who} uses ${moveName} (${hit ? "hits" : "MISSES"})`;
}

// Secondary-effect trigger chances not present in the bulk move-data.js
// conversion (battle_moves.json didn't include secondaryEffectChance).
// Incremental, same pattern as everything else — add a move's real chance
// here the first time its secondary effect actually needs to fire.
// Source: src/data/battle_moves.h via the pokeemerald CLI research.
const SECONDARY_EFFECT_CHANCE = {
  "Meteor Mash": 20, // src/data/battle_moves.h:4020-4031
  "Ice Beam": 10,    // well-established, stable since Gen I
  "Thunderbolt": 10, // well-established, stable since Gen I
};

// Cmd_setmultihitcounter (src/battle_script_commands.c:7139-7155) — a real
// TWO-ROLL mechanism, not a flat lookup: r = Random()&3; r<=1 -> hits=r+2
// (2 or 3 hits, 25% each); r>1 -> a SECOND independent Random()&3+2 roll,
// uniform over {2,3,4,5} (so 12.5% each, gated behind the 50% chance of
// reaching this branch at all). Collapses to the well-known 3/8, 3/8, 1/8,
// 1/8 distribution for 2/3/4/5 hits — verified via the arithmetic, not
// assumed. EFFECT_DOUBLE_HIT/EFFECT_TWINEEDLE pass a literal instruction
// operand (2) instead of rolling, so they're always exactly 2 hits.
// EFFECT_TWINEEDLE's poison secondary (independent per hit, per source) is
// deliberately NOT modeled — it would need up to 2^hitCount branching, and
// zero of the 552 real opponent sets carry Twineedle. Treated as a plain
// damage-only 2-hit move (identical to Double Hit) until that changes.
const MULTI_HIT_DISTRIBUTION = {
  EFFECT_MULTI_HIT: [{ hits: 2, p: 3 / 8 }, { hits: 3, p: 3 / 8 }, { hits: 4, p: 1 / 8 }, { hits: 5, p: 1 / 8 }],
  EFFECT_DOUBLE_HIT: [{ hits: 2, p: 1 }],
  EFFECT_TWINEEDLE: [{ hits: 2, p: 1 }],
};

// Executors ACTUALLY APPLY a move's effect to the state, as opposed to
// AI_HANDLERS which only score the opponent's move *choice*. Two calling
// conventions, matching real game structure:
//  - power === 0 (status moves): called unconditionally on a successful,
//    non-blocked use — the effect IS the move, no separate chance roll.
//  - power > 0 (damaging moves' secondary effects, e.g. Meteor Mash's own
//    Atk+1): gated by SECONDARY_EFFECT_CHANCE, only rolled after a
//    confirmed hit, matching Cmd_seteffectwithchance's real behavior
//    (rolled post-accuracy-check, post-damage; a miss or NO_EFFECT target
//    never triggers it).
// Each executor: (state, actor) => mutates state's stat stages/status directly.
function bumpStage(stages, key, delta) {
  stages[key] = Math.max(-6, Math.min(6, stages[key] + delta));
}

// Cmd_tryhealhalfhealth (src/battle_script_commands.c:6615-6631) — shared by
// EFFECT_RESTORE_HP and EFFECT_SOFTBOILED, always exactly 1/2 max HP,
// regardless of weather. EFFECT_SYNTHESIS/MOONLIGHT/MORNING_SUN instead use
// recoverbasedonsunlight (src/battle_script_commands.c:8867-8875), which
// reads the fraction from weather: no weather (or Cloud-Nine/Air-Lock
// suppressed) -> 1/2 (same as Recover); sun -> 2/3; anything else (rain/
// sandstorm/hail) -> 1/4. Fails ONLY if current HP is EXACTLY at max.
function healHalfMaxHp(s, actor, ctx, moveData) {
  const isYou = actor === "you";
  const selfMon = isYou ? ctx.you : ctx.opp;
  const selfHpKey = isYou ? "yourHpPct" : "oppHpPct";
  if (s[selfHpKey] >= 100) return "failed";
  const isWeatherVariant = ["EFFECT_SYNTHESIS", "EFFECT_MOONLIGHT", "EFFECT_MORNING_SUN"].includes(moveData?.effect);
  let heal;
  if (isWeatherVariant) {
    const weather = effectiveWeather(s, ctx.you, ctx.opp);
    if (weather === "sun") heal = Math.floor((20 * selfMon.stats.hp) / 30);
    else if (weather === "rain" || weather === "sandstorm" || weather === "hail") heal = Math.floor(selfMon.stats.hp / 4);
    else heal = Math.floor(selfMon.stats.hp / 2);
  } else {
    heal = Math.floor(selfMon.stats.hp / 2);
  }
  heal = Math.max(1, heal);
  s[selfHpKey] = Math.min(100, s[selfHpKey] + (heal / selfMon.stats.hp) * 100);
}

// Type-based status immunities. Confirmed stable Gen I+ mechanics — NOT
// including Electric-immune-to-paralysis, which is a Gen VI+ change and does
// not apply here (source-confirmed: no such check exists in this codebase).
const STATUS_IMMUNITY_TYPES = {
  poison: ["Poison", "Steel"],
  burn: ["Fire"],
  freeze: ["Ice"],
  paralysis: [],
  sleep: [], // no type has innate sleep immunity in Gen III
};

// Ability-based status immunities — distinct from the type-based table
// above (a mon can be immune via EITHER route independently). Confirmed gap
// caught while pre-flighting Snorlax's Immunity ability: EFFECT_PARALYZE
// (Thunder Wave) already had its OWN inline Limber check, but every OTHER
// status-inflicting path (the secondary-effect _HIT executors, Sleep) had
// no ability check at all — meaning e.g. a poison-secondary move (Sludge
// Bomb, Twineedle) could still poison an Immunity-ability holder. Centralized
// here (same "fix it once, every caller benefits" pattern as the existing
// Substitute/Safeguard checks) rather than duplicated per-executor.
const STATUS_IMMUNITY_ABILITIES = {
  poison: "Immunity",
  paralysis: "Limber",
  burn: "Water Veil",
  freeze: "Magma Armor",
  sleep: null, // Insomnia/Vital Spirit block SLEEP specifically but not via this path (Rest doesn't route through inflictStatus at all, and no opponent secondary-sleep move is modeled yet) — left unmapped rather than guessed
};

// Status-curing berries — HOLD_EFFECT_CURE_PAR/PSN/BRN/FRZ/SLP (single-status
// berries) and HOLD_EFFECT_CURE_STATUS (Lum Berry: all five major statuses
// PLUS confusion). Source-confirmed (src/battle_util.c:3499-3591): Lum Berry
// does NOT cure infatuation/Attract — that's a SEPARATE hold effect
// (HOLD_EFFECT_CURE_ATTRACT, Mental Herb), not modeled since nothing in the
// current roster holds it. Persim Berry (confusion-only) included for
// completeness even though nothing currently holds it either.
const BERRY_CURE = {
  "Cheri Berry": ["paralysis"],
  "Chesto Berry": ["sleep"],
  "Pecha Berry": ["poison"],
  "Rawst Berry": ["burn"],
  "Aspear Berry": ["freeze"],
  "Persim Berry": ["confusion"],
  "Lum Berry": ["paralysis", "sleep", "poison", "burn", "freeze", "confusion"],
};

// Timing (confirmed from source, both ENDTURN_ITEMS1 and ENDTURN_ITEMS2 call
// the SAME ItemBattleEffects(ITEMEFFECT_NORMAL, ...) switch, gated on nothing
// but "does this status exist right now" — no moveTurn check on any cure
// case): this is an END-OF-TURN check, NOT immediate-on-infliction. ITEMS1
// sits BEFORE LEECH_SEED/POISON/BAD_POISON/BURN in the per-battler ENDTURN_*
// sequence (src/battle_util.c:1442-1460), so a berry cure fires before that
// same turn's poison/burn residual tick — a Cheri/Lum holder poisoned THIS
// turn does NOT take that turn's poison damage. But since curing only
// happens at THIS point (after both sides have already acted this turn), a
// status inflicted early in a turn still fully applies to that turn's OWN
// action (e.g. the 25% full-paralysis roll) if the afflicted mon hasn't
// acted yet — only guaranteed gone starting the FOLLOWING turn. One-time
// consumption tracked via youBerryConsumed/oppBerryConsumed (buildStartState) —
// NOT reset per-turn (unlike youEndureActive etc.), since it's a match-long,
// single-use flag.
function tryCureWithBerry(s, side, mon) {
  const consumedKey = side === "you" ? "youBerryConsumed" : "oppBerryConsumed";
  const statusKey = side === "you" ? "youStatus" : "oppStatus";
  const sleepTurnsKey = side === "you" ? "youSleepTurns" : "oppSleepTurns";
  if (s[consumedKey]) return;
  const cures = BERRY_CURE[mon.item];
  if (!cures) return;
  let used = false;
  if (s[statusKey] && cures.includes(s[statusKey])) {
    s[statusKey] = null;
    s[sleepTurnsKey] = null;
    used = true;
  }
  // Confusion is STATUS2 (volatile), tracked separately from the major-status
  // field above — only "you" can currently be confused (see metagrossConfused's
  // existing one-directional limitation), so this only ever matters for the
  // player's own side.
  if (side === "you" && s.metagrossConfused && cures.includes("confusion")) {
    s.metagrossConfused = false;
    used = true;
  }
  if (used) s[consumedKey] = true;
}

function inflictStatus(s, targetSide, statusType, targetTypes, targetAbility = null) {
  const statusKey = targetSide === "you" ? "youStatus" : "oppStatus";
  const subKey = targetSide === "you" ? "youSubstituteHP" : "oppSubstituteHP";
  const safeguardKey = targetSide === "you" ? "youSafeguardTurns" : "oppSafeguardTurns";
  // Substitute blocks major-status infliction entirely (well-established
  // Gen I-III rule — the sub "takes the hit" instead of the real mon).
  // Centralized here so every status-inflicting executor gets this for
  // free, including the pre-existing EFFECT_PARALYZE_HIT/FREEZE_HIT/
  // BURN_HIT/POISON_HIT secondary effects that funnel through this same
  // function — this was a real gap before Substitute existed at all.
  if (s[subKey]) return false;
  // Safeguard blocks status inflicted BY THE OPPONENT (self-inflicted status
  // like Rest's sleep still works — Rest doesn't route through this
  // function at all, so that distinction falls out for free).
  if (s[safeguardKey] != null) return false;
  if (s[statusKey]) return false; // major statuses don't stack
  if (STATUS_IMMUNITY_TYPES[statusType].some((t) => targetTypes.includes(t))) return false;
  if (targetAbility != null && targetAbility === STATUS_IMMUNITY_ABILITIES[statusType]) return false;
  s[statusKey] = statusType;
  return true;
}

// Shared executor shape for the whole stat-DECREASE family (Sand-Attack/
// Flash/SmokeScreen/Screech/Scary Face/Charm/Fake Tears/Sweet Scent) —
// BattleScript_EffectStatDown (data/battle_scripts_1.s:534-554): Substitute
// blocks entirely; Clear Body/White Smoke block EVERY stat decrease; Keen
// Eye blocks accuracy-decreases specifically and Hyper Cutter blocks
// Attack-decreases specifically (src/battle_script_commands.c:4142-4145) —
// note EXECUTION checks Hyper Cutter but the AI's own SCORING (AI_CBM_AttackDown)
// does not, a real asymmetry preserved in AI_HANDLERS above, not "fixed" here.
function statDownExecutor(stageKey, amount, blockingAbility) {
  return (s, actor, ctx) => {
    const foeMon = actor === "you" ? ctx.opp : ctx.you;
    const foeSubKey = actor === "you" ? "oppSubstituteHP" : "youSubstituteHP";
    if (s[foeSubKey]) return "failed";
    if (foeMon.ability === "Clear Body" || foeMon.ability === "White Smoke") return "failed";
    if (blockingAbility && foeMon.ability === blockingAbility) return "failed";
    const foeStages = actor === "you" ? s.oppStages : s.youStages;
    bumpStage(foeStages, stageKey, -amount);
  };
}

// Exact 10-move Soundproof block list (src/battle_util.c sSoundMovesTable) —
// this is Gen III's move pool specifically; later games add more sound moves.
const SOUND_MOVES = new Set([
  "Growl", "Roar", "Sing", "Supersonic", "Screech", "Snore",
  "Uproar", "Metal Sound", "GrassWhistle", "Hyper Voice",
]);

// Like typeEffectiveness, but also reports whether any individual defending
// type contributed a super-effective or not-very-effective component —
// needed for Wonder Guard's "both SE and NVE simultaneously still blocks"
// rule on dual-typed defenders, which the single combined multiplier loses.
function typeEffectivenessBreakdown(moveType, defTypes) {
  const chart = TYPE_CHART[moveType] || {};
  let hadSuper = false, hadNVE = false;
  for (const t of defTypes) {
    const m = chart[t] !== undefined ? chart[t] : 1;
    if (m > 1) hadSuper = true;
    if (m < 1 && m > 0) hadNVE = true;
  }
  return { hadSuper, hadNVE };
}

// Resolves ability-based interactions that override normal damage/type
// resolution. Called before normal damage calc for any power>0 move, and
// before status-effect application for power===0 moves (Soundproof blocks
// both). Returns one of:
//   { type: "normal" }                      — proceed as usual
//   { type: "blocked" }                      — treated as ability/item block (Skill -3)
//   { type: "absorb", healFraction: 0.25 }   — Volt/Water Absorb: heal defender instead
//   { type: "flashFireTrigger" }             — Flash Fire: no damage, sets standing boost flag
function resolveAbilityInteraction(moveName, moveData, attacker, defender) {
  if (defender.ability === "Soundproof" && SOUND_MOVES.has(moveName)) {
    return { type: "blocked" };
  }
  if (moveData.power === 0) return { type: "normal" };

  if (defender.ability === "Levitate" && moveData.type === "Ground") {
    return { type: "blocked" };
  }
  if (defender.ability === "Volt Absorb" && moveData.type === "Electric") {
    return { type: "absorb", healFraction: 0.25 };
  }
  if (defender.ability === "Water Absorb" && moveData.type === "Water") {
    return { type: "absorb", healFraction: 0.25 };
  }
  if (defender.ability === "Flash Fire" && moveData.type === "Fire") {
    return { type: "flashFireTrigger" };
  }
  if (defender.ability === "Wonder Guard") {
    const { hadSuper, hadNVE } = typeEffectivenessBreakdown(moveData.type, defender.types);
    if (!(hadSuper && !hadNVE)) return { type: "blocked" }; // only a CLEAN super-effective hit gets through
  }
  return { type: "normal" };
}

// The OHKO bug's exact shape, generalized (HANDOFF.md §5 item 4 / §10 task 2):
// these effects all carry move-data.js's placeholder "power": 1 (real power
// is fixed/level/HP-based, computed dynamically, never a flat base — same as
// OHKO's now-fixed Horn Drill/Fissure/Guillotine/Sheer Cold) and, unlike
// EFFECT_FLAIL/EFFECT_COUNTER/EFFECT_MIRROR_COAT/EFFECT_OHKO, have NO special-
// case damage logic anywhere yet. Left un-special-cased, `power === 1` slips
// past the "status move needs a handler" guard exactly like EFFECT_OHKO did,
// and generic calcDamage silently produces a near-1-damage hit instead of the
// real mechanic (flat/level/HP-based damage, occasionally much larger). This
// set converts that from a silent wrong number into a loud, explicit throw —
// coverage audit findings, not yet ported (deliberately NOT fixed here, see
// HANDOFF.md §10 task 2).
const SILENT_FALLTHROUGH_EFFECTS = new Set([
  "EFFECT_SONICBOOM", "EFFECT_DRAGON_RAGE", "EFFECT_LEVEL_DAMAGE", "EFFECT_PSYWAVE",
  "EFFECT_SUPER_FANG", "EFFECT_ENDEAVOR", "EFFECT_LOW_KICK", "EFFECT_MAGNITUDE",
  "EFFECT_PRESENT", "EFFECT_HIDDEN_POWER", "EFFECT_BIDE",
  // EFFECT_RETURN/EFFECT_FRUSTRATION REMOVED from this set — now correctly
  // handled via calcDamage's friendship-based effectivePower (see
  // getFriendshipPower/buildMon's `friendship` field).
]);

// Recoil (src/battle_script_commands.c:2636-2643/2843-2850, dispatched via
// MOVE_EFFECT_RECOIL_25/MOVE_EFFECT_RECOIL_33 — a DIFFERENT, finer-grained
// constant than the move's own .effect field, but the two recoil-tagged
// effects in this engine's move-data.js map 1:1 onto them): recoil damage =
// floor(damage actually dealt this hit / divisor), FLOORED TO 1 EVEN WHEN
// THE DEALT DAMAGE WAS 0 (source's `if (gBattleMoveDamage == 0)
// gBattleMoveDamage = 1` doesn't check WHY it was zero) — confirmed this
// means a recoil move used against a type-immune target still costs the
// user 1 HP-equivalent of recoil, a real, surprising-but-correct mechanic
// (Lesson 5's pattern), not a bug to "fix" toward 0. Based on "damage
// actually dealt" (gHpDealt), which is the Substitute-absorbed amount when a
// sub is up, not the theoretical raw number — matches this engine's existing
// `absorbed`/`hitDmg` distinction in the per-hit loop below. Rock Head negates
// ALL of it (BattleScript_MoveEffectRecoil's own ability check) EXCEPT
// Struggle, which always recoils even through Rock Head (source-confirmed,
// checked first via an unconditional `jumpifmove MOVE_STRUGGLE` before the
// Rock Head check even runs) — moot here since no set in this pool carries
// Struggle, but preserved as a comment in case that ever changes.
const RECOIL_FRACTION = { EFFECT_RECOIL: 4, EFFECT_DOUBLE_EDGE: 3 };

const EFFECT_EXECUTORS = {
  EFFECT_ATTACK_UP_HIT: (s, actor) => {
    // Confirmed via source: increase-path ChangeStatBuffs has NO ability
    // checks at all (Clear Body etc. only guard the decrease path) — always
    // applies (capped at +6, silently no-ops there, matching source).
    bumpStage(actor === "you" ? s.youStages : s.oppStages, "atk", 1);
  },
  EFFECT_CONFUSE: (s, actor) => {
    if (actor === "you") throw new Error("Confuse Ray from your side not modeled — only opponent->you confusion is wired up.");
    if (!s.metagrossConfused) s.metagrossConfused = true;
  },
  // Cmd_tryinfatuating (src/battle_script_commands.c:7654+) — fails (routes
  // to BattleScript_ButItFailed, MOVE_RESULT_FAILED — scored as a real "no
  // effect" via applyMove's power===0 "failed" convention, NOT a silent
  // no-op) if the target has Oblivious, is already infatuated (no stack),
  // or the two genders are incompatible (same gender, or either genderless).
  // NOTABLY: no Safeguard check anywhere in source — Attract genuinely
  // bypasses Safeguard (unlike major status/confusion), and also has no
  // Substitute check in its script or command — bypasses Substitute too.
  // Gender compatibility, when either side is genuinely uncertain (a
  // variable-ratio species with no fixed personality/config override), was
  // already resolved into a concrete branch upstream in
  // enumerateActionOutcomes (Lesson 1 — never re-roll here).
  EFFECT_ATTRACT: (s, actor, ctx, moveData, sleepDuration, attractGenderCompatible) => {
    if (actor === "you") throw new Error("Attract from your side not modeled — only opponent->you infatuation is wired up (none of your 3 team mons carry Attract).");
    if (s.youAttracted) return "failed";
    if (ctx.you.ability === "Oblivious") return "failed";
    if (!attractGenderCompatible) return "failed";
    s.youAttracted = true;
  },
  EFFECT_EVASION_UP: (s, actor) => {
    if (actor === "you") throw new Error("Evasion tracking only implemented for the opponent side — extend if needed.");
    bumpStage(s.oppStages, "evasion", 1);
  },
  EFFECT_CALM_MIND: (s, actor) => {
    // Well-documented, generation-stable: +1 SpA and +1 SpD simultaneously.
    // No ability/immunity interactions to worry about (self-targeted boost,
    // same "increase path has no ability checks" logic confirmed for
    // EFFECT_ATTACK_UP_HIT applies here too).
    const stages = actor === "you" ? s.youStages : s.oppStages;
    bumpStage(stages, "spa", 1);
    bumpStage(stages, "spd", 1);
  },
  EFFECT_COSMIC_POWER: (s, actor) => {
    // Well-documented, generation-stable: +1 Def and +1 SpDef simultaneously.
    const stages = actor === "you" ? s.youStages : s.oppStages;
    bumpStage(stages, "def", 1);
    bumpStage(stages, "spd", 1);
  },
  EFFECT_BULK_UP: (s, actor) => {
    // Well-documented, generation-stable: +1 Atk and +1 Def simultaneously.
    const stages = actor === "you" ? s.youStages : s.oppStages;
    bumpStage(stages, "atk", 1);
    bumpStage(stages, "def", 1);
  },
  // Stat-boost family (batch 2) — same "increase path has no ability checks,
  // silently caps at +6" convention as EFFECT_ATTACK_UP_HIT/EFFECT_CALM_MIND
  // above. "_2" variants raise 2 stages (well-established Gen III move
  // mechanics — Swords Dance/Amnesia/Agility/Barrier-Acid Armor-Iron Defense
  // all raise 2 stages; same confidence tier as the type chart/nature table,
  // no additional source dive needed).
  EFFECT_ATTACK_UP: (s, actor) => bumpStage(actor === "you" ? s.youStages : s.oppStages, "atk", 1),
  EFFECT_ATTACK_UP_2: (s, actor) => bumpStage(actor === "you" ? s.youStages : s.oppStages, "atk", 2),
  EFFECT_DEFENSE_UP: (s, actor) => bumpStage(actor === "you" ? s.youStages : s.oppStages, "def", 1),
  EFFECT_DEFENSE_UP_2: (s, actor) => bumpStage(actor === "you" ? s.youStages : s.oppStages, "def", 2),
  EFFECT_SPEED_UP: (s, actor) => bumpStage(actor === "you" ? s.youStages : s.oppStages, "spe", 1),
  EFFECT_SPEED_UP_2: (s, actor) => bumpStage(actor === "you" ? s.youStages : s.oppStages, "spe", 2),
  EFFECT_SPECIAL_ATTACK_UP: (s, actor) => bumpStage(actor === "you" ? s.youStages : s.oppStages, "spa", 1),
  EFFECT_SPECIAL_ATTACK_UP_2: (s, actor) => bumpStage(actor === "you" ? s.youStages : s.oppStages, "spa", 2),
  EFFECT_SPECIAL_DEFENSE_UP: (s, actor) => bumpStage(actor === "you" ? s.youStages : s.oppStages, "spd", 1),
  EFFECT_SPECIAL_DEFENSE_UP_2: (s, actor) => bumpStage(actor === "you" ? s.youStages : s.oppStages, "spd", 2),
  // Batch 4:
  EFFECT_DRAGON_DANCE: (s, actor) => {
    // Well-established, generation-stable: +1 Atk and +1 Speed simultaneously.
    const stages = actor === "you" ? s.youStages : s.oppStages;
    bumpStage(stages, "atk", 1);
    bumpStage(stages, "spe", 1);
  },
  EFFECT_CURSE: (s, actor, ctx) => {
    // Non-Ghost branch only (data/battle_scripts_1.s:1482-1510): -1 Speed,
    // +1 Atk, +1 Def to self, each independently silently capped (matches
    // the same "increase/decrease path has no extra checks" convention as
    // every other stat-boost executor — real "But it failed" only triggers
    // if Speed is at -6 AND Atk at +6 AND Def at +6 simultaneously, which
    // bumpStage's clamping already reproduces for free).
    // Ghost branch (HP-sacrifice self-damage + persistent per-turn curse
    // status on the target, :1511-1530) is NOT modeled — throws clearly
    // rather than silently running the non-Ghost mechanic on a Ghost user.
    const isYou = actor === "you";
    const selfMon = isYou ? ctx.you : ctx.opp;
    if (selfMon.types.includes("Ghost")) {
      throw new Error("Ghost-type Curse (HP-sacrifice + persistent curse status) not yet modeled — only the non-Ghost Atk/Def/Speed version is implemented. Port data/battle_scripts_1.s:1511-1530 before using Curse on a Ghost-type opponent.");
    }
    const stages = isYou ? s.youStages : s.oppStages;
    bumpStage(stages, "spe", -1);
    bumpStage(stages, "atk", 1);
    bumpStage(stages, "def", 1);
  },
  EFFECT_LEECH_SEED: (s, actor, ctx) => {
    // BattleScript_EffectLeechSeed explicitly checks substitute BEFORE even
    // the accuracy roll (data/battle_scripts_1.s:1157-1163 — jumpifstatus2
    // BS_TARGET, STATUS2_SUBSTITUTE, ButItFailed). Cmd_setseeded itself
    // (src/battle_script_commands.c:6718-6738) then fails (no-stack) if
    // already seeded, or if the target is Grass-type — otherwise sets the
    // seeded flag. Actual per-turn drain happens in applyEndOfTurnEffects
    // (maxHP/8 of the SEEDED mon, capped at its current HP, transferred as
    // healing to whoever planted it — capped at their max HP, skipped if
    // they have Liquid Ooze — src/battle_scripts_1.s:3265-3280).
    const isYou = actor === "you";
    const foeMon = isYou ? ctx.opp : ctx.you;
    const foeSeededKey = isYou ? "oppSeeded" : "youSeeded";
    const foeSubKey = isYou ? "oppSubstituteHP" : "youSubstituteHP";
    if (s[foeSubKey]) return "failed";
    if (s[foeSeededKey]) return "failed";
    if (foeMon.types.includes("Grass")) return "failed";
    s[foeSeededKey] = true;
  },
  EFFECT_BATON_PASS: () => "failed", // Arena has no reserve party to switch into (see AI_HANDLERS.EFFECT_BATON_PASS comment) — always a no-op, Skill scores noEffect, regardless of the AI's Tower-blind scoring.
  // Batch 5 — persistent-state effects (Substitute/Reflect/Light Screen).
  EFFECT_SUBSTITUTE: (s, actor, ctx) => {
    // data/battle_scripts_1.s:1090 jumpifstatus2 ... AlreadyHasSubstitute —
    // fails outright (no-stack) if one's already up. Otherwise
    // Cmd_setsubstitute (src/battle_script_commands.c:7808-7833): cost =
    // floor(maxHP/4), min 1. Fails (no HP paid, no sub created) if current
    // HP <= cost — note the <=, not <, so being exactly at the threshold
    // still fails (you'd be left at exactly 0 after paying, which isn't
    // allowed — matches the real check literally).
    const isYou = actor === "you";
    const selfMon = isYou ? ctx.you : ctx.opp;
    const selfHpKey = isYou ? "yourHpPct" : "oppHpPct";
    const selfSubKey = isYou ? "youSubstituteHP" : "oppSubstituteHP";
    if (s[selfSubKey] != null) return "failed";
    const cost = Math.max(1, Math.floor(selfMon.stats.hp / 4));
    const currentHp = Math.round((s[selfHpKey] / 100) * selfMon.stats.hp);
    if (currentHp <= cost) return "failed";
    s[selfHpKey] = Math.max(0, s[selfHpKey] - (cost / selfMon.stats.hp) * 100);
    s[selfSubKey] = cost;
  },
  EFFECT_REFLECT: (s, actor) => {
    // Cmd_setreflect (src/battle_script_commands.c:6697-6714): fails
    // (no-stack) if already up; otherwise sets a 5-turn counter.
    const key = actor === "you" ? "youReflectTurns" : "oppReflectTurns";
    if (s[key] != null) return "failed";
    s[key] = 5;
  },
  EFFECT_LIGHT_SCREEN: (s, actor) => {
    // Cmd_setlightscreen (src/battle_script_commands.c:7478 region) — same
    // shape as Reflect: fails if already up, else 5-turn counter.
    const key = actor === "you" ? "youLightScreenTurns" : "oppLightScreenTurns";
    if (s[key] != null) return "failed";
    s[key] = 5;
  },
  // Batch 6:
  EFFECT_SWAGGER: (s, actor, ctx) => {
    if (actor === "you") throw new Error("Swagger from your side not modeled — only opponent->you confusion is wired up (same limitation as EFFECT_CONFUSE's executor).");
    // BattleScript_EffectSwagger (data/battle_scripts_1.s:1608-1628): ONE
    // substitute check gates the ENTIRE move (both the Atk raise AND the
    // confusion) — fails/misses outright if the target has an active sub.
    if (s.youSubstituteHP != null) return "failed";
    // Also fails outright (jumpifconfusedandstatmaxed) if the target is
    // ALREADY confused AND its Atk is already maxed — a narrower, separate
    // fail condition from the substitute one.
    if (s.metagrossConfused && s.youStages.atk >= 6) return "failed";
    // The Atk+2 raise ALWAYS lands (silently capped) regardless of what
    // happens to the confusion attempt below — source gates these two
    // parts INDEPENDENTLY, not as a single all-or-nothing effect.
    bumpStage(s.youStages, "atk", 2);
    // Confusion itself is separately blocked by Own Tempo/Safeguard (but
    // does NOT fail the move as a whole — the Atk raise above still landed
    // either way). Uses the same s.metagrossConfused mechanism as
    // EFFECT_CONFUSE's own executor, which has the identical "your side not
    // modeled" limitation and does NOT itself check substitute (a
    // pre-existing gap, left as-is per instruction to leave EFFECT_CONFUSE
    // alone — flagged here rather than silently fixed or silently ignored).
    if (ctx.you.ability !== "Own Tempo" && s.youSafeguardTurns == null) {
      if (!s.metagrossConfused) s.metagrossConfused = true;
    }
  },
  EFFECT_DESTINY_BOND: (s, actor) => {
    // setdestinybond: always succeeds unconditionally, no fail condition in
    // source. Cleared at the start of the user's OWN next turn (see
    // resolveTurn) — protects only through the rest of THIS turn.
    const key = actor === "you" ? "youDestinyBondActive" : "oppDestinyBondActive";
    s[key] = true;
  },
  // Batch 7:
  EFFECT_RESTORE_HP: healHalfMaxHp,
  EFFECT_SOFTBOILED: healHalfMaxHp,
  EFFECT_SYNTHESIS: healHalfMaxHp, // see healHalfMaxHp's comment re: weather never being active here
  EFFECT_MOONLIGHT: healHalfMaxHp,
  EFFECT_MORNING_SUN: healHalfMaxHp,
  EFFECT_INGRAIN: (s, actor) => {
    // Cmd_trysetroots (src/battle_script_commands.c:9326-9337): fails
    // (no-stack) if already rooted, else sets the flag. Real per-turn heal
    // (1/16 max HP, skipped at full/0 HP) happens in applyEndOfTurnEffects,
    // BEFORE Leftovers (ENDTURN_INGRAIN is index 0 of the per-battler
    // end-of-turn tracker, src/battle_util.c:1440-1462).
    const key = actor === "you" ? "youIngrained" : "oppIngrained";
    if (s[key]) return "failed";
    s[key] = true;
  },
  // Batch 8:
  EFFECT_SAFEGUARD: (s, actor) => {
    // Cmd_setsafeguard (src/battle_script_commands.c:8650-8668): fails
    // (no-stack) if already up, else 5-turn counter — same shape as
    // Reflect/Light Screen, decremented in the same end-of-turn block.
    const key = actor === "you" ? "youSafeguardTurns" : "oppSafeguardTurns";
    if (s[key] != null) return "failed";
    s[key] = 5;
  },
  EFFECT_MEAN_LOOK: () => {
    // Real effect (prevents switching) has ZERO functional consequence in
    // Arena — there's no switching to prevent in the first place. Always
    // succeeds; no state change needed since nothing currently reads a
    // "trapped" flag (would only matter for a future team-workflow context
    // where it might matter between matchups, which it still wouldn't,
    // since Arena rounds are independent battles).
  },
  // Weather — all 4 share the identical fail condition (same type already
  // active, temp OR permanent — checked via a bitmask in source, but a
  // straight equality check here since we only ever track one type at a
  // time) and, on success, UNCONDITIONALLY OVERWRITE whatever was active
  // before (including a permanent ability-set weather of a DIFFERENT type —
  // Cmd_set{rain,sunny,sandstorm,hail} all do a straight assignment, not an
  // OR, src/battle_script_commands.c:6681-6694 and siblings). Always 5 turns
  // — a move can never SET permanent weather, only an ability can.
  EFFECT_SANDSTORM: (s) => {
    if (s.weatherType === "sandstorm") return "failed";
    s.weatherType = "sandstorm";
    s.weatherTurns = 5;
  },
  EFFECT_RAIN_DANCE: (s) => {
    if (s.weatherType === "rain") return "failed";
    s.weatherType = "rain";
    s.weatherTurns = 5;
  },
  EFFECT_SUNNY_DAY: (s) => {
    if (s.weatherType === "sun") return "failed";
    s.weatherType = "sun";
    s.weatherTurns = 5;
  },
  EFFECT_HAIL: (s) => {
    if (s.weatherType === "hail") return "failed";
    s.weatherType = "hail";
    s.weatherTurns = 5;
  },
  EFFECT_PARALYZE_HIT: (s, actor, ctx) => {
    const targetSide = actor === "you" ? "opp" : "you";
    const targetMon = actor === "you" ? ctx.opp : ctx.you;
    inflictStatus(s, targetSide, "paralysis", targetMon.types, targetMon.ability);
  },
  EFFECT_FREEZE_HIT: (s, actor, ctx) => {
    const targetSide = actor === "you" ? "opp" : "you";
    const targetMon = actor === "you" ? ctx.opp : ctx.you;
    inflictStatus(s, targetSide, "freeze", targetMon.types, targetMon.ability);
  },
  EFFECT_BURN_HIT: (s, actor, ctx) => {
    const targetSide = actor === "you" ? "opp" : "you";
    const targetMon = actor === "you" ? ctx.opp : ctx.you;
    inflictStatus(s, targetSide, "burn", targetMon.types, targetMon.ability);
  },
  EFFECT_POISON_HIT: (s, actor, ctx) => {
    const targetSide = actor === "you" ? "opp" : "you";
    const targetMon = actor === "you" ? ctx.opp : ctx.you;
    inflictStatus(s, targetSide, "poison", targetMon.types, targetMon.ability);
  },
  // ── Executor backfill for the batch-1 AI_HANDLERS (Paralyze/Roar/Rest) ───
  EFFECT_PARALYZE: (s, actor, ctx, moveData) => {
    // Direct status-only paralysis (Thunder Wave/Stun Spore) — distinct from
    // EFFECT_PARALYZE_HIT above (secondary-effect paralysis on a damaging
    // move, e.g. Body Slam), which always executes via inflictStatus with no
    // type check since Normal-type carriers have no relevant immunity.
    // Thunder Wave/Stun Spore DO carry a real type (Electric/Grass) that
    // gates the effect through the general type chart — e.g. Ground blocks
    // Thunder Wave — checked independently of the accuracy roll, matching
    // AI_CBM_Paralyze's own AI_EFFECTIVENESS_x0 check. NOTE: does not model
    // Stun Spore's real "powder moves fail vs Grass-types" exemption — that's
    // a hardcoded category immunity outside the general type chart, separate
    // from this check and not yet modeled anywhere in this engine.
    const isYou = actor === "you";
    const foeMon = isYou ? ctx.opp : ctx.you;
    const foeSide = isYou ? "opp" : "you";
    if (typeEffectiveness(moveData.type, foeMon.types) === 0) return "failed";
    // Limber check now lives centrally in inflictStatus (STATUS_IMMUNITY_ABILITIES)
    // — this used to be a standalone inline check here, now redundant with
    // that centralized version; removed to avoid the two silently drifting.
    if (!inflictStatus(s, foeSide, "paralysis", foeMon.types, foeMon.ability)) return "failed"; // already-statused/Limber no-stack gate
  },
  EFFECT_ROAR: () => "failed", // Arena has no reserve party to switch into (see AI_HANDLERS.EFFECT_ROAR comment for why the AI's SCORING doesn't know this) — always a no-op, Skill scores noEffect.
  EFFECT_REST: (s, actor) => {
    // Cmd_trysetrest (src/battle_script_commands.c:6762-6784): fails outright
    // (failJump, no heal/sleep/Skill-landed) if already at full HP — the
    // ONLY precondition checked; current status is irrelevant (Rest clears
    // and overwrites unconditionally otherwise). Duration is a FIXED 3
    // (STATUS1_SLEEP_TURN(3), :6779) — NOT the random 2-5 rolled by direct
    // sleep-inducing moves (EFFECT_SLEEP, src/battle_util.c:1762) — that
    // random roll is irrelevant for Rest and is built separately whenever
    // EFFECT_SLEEP itself gets ported.
    const selfHpKey = actor === "you" ? "yourHpPct" : "oppHpPct";
    const selfStatusKey = actor === "you" ? "youStatus" : "oppStatus";
    const selfSleepTurnsKey = actor === "you" ? "youSleepTurns" : "oppSleepTurns";
    if (s[selfHpKey] >= 100) return "failed";
    s[selfHpKey] = 100;
    s[selfStatusKey] = "sleep";
    s[selfSleepTurnsKey] = 3;
  },
  // Batch 3: direct sleep-inducing status moves (Hypnosis/Spore/Lovely Kiss/
  // Sing/Sleep Powder) — targets the FOE, unlike Rest which targets self.
  // Duration comes from the enumerated 2-5 roll in enumerateActionOutcomes
  // (sleepDuration param), NOT a fixed value like Rest's.
  EFFECT_SLEEP: (s, actor, ctx, moveData, sleepDuration) => {
    const isYou = actor === "you";
    const foeMon = isYou ? ctx.opp : ctx.you;
    const foeSide = isYou ? "opp" : "you";
    const foeSleepTurnsKey = isYou ? "oppSleepTurns" : "youSleepTurns";
    if (foeMon.ability === "Insomnia" || foeMon.ability === "Vital Spirit") return "failed";
    if (!inflictStatus(s, foeSide, "sleep", foeMon.types, foeMon.ability)) return "failed"; // already-statused no-stack gate (Insomnia/Vital Spirit handled above; STATUS_IMMUNITY_ABILITIES.sleep is null since no other sleep-inflicting path exists yet)
    s[foeSleepTurnsKey] = sleepDuration;
  },
  // ── Phase 2 leverage batch ────────────────────────────────────────────
  EFFECT_PSYCH_UP: (s, actor) => {
    // Cmd_copyfoestats (src/battle_script_commands.c:8809-8819) — literally
    // unconditional, no fail branch is ever actually reachable (the "failed"
    // jump target in BattleScript_EffectPsychUp is dead code per the
    // source's own comment). Copies all 7 stat stages FROM the target TO
    // the user, overwriting whatever the user had.
    const userStages = actor === "you" ? s.youStages : s.oppStages;
    const targetStages = actor === "you" ? s.oppStages : s.youStages;
    Object.assign(userStages, targetStages);
  },
  EFFECT_WILL_O_WISP: (s, actor, ctx) => {
    const foeSide = actor === "you" ? "opp" : "you";
    const foeMon = actor === "you" ? ctx.opp : ctx.you;
    if (!inflictStatus(s, foeSide, "burn", foeMon.types, foeMon.ability)) return "failed"; // Fire-type/Water Veil/already-statused/sub/safeguard all funnel through inflictStatus already
  },
  EFFECT_YAWN: (s, actor, ctx) => {
    // Cmd_setyawn (src/battle_script_commands.c:9352-9364) — fails if
    // already drowsy OR already has ANY major status; Insomnia/Vital Spirit
    // and Substitute/Safeguard are checked earlier in the real script
    // (BattleScript_EffectYawn) before setyawn is even reached. The actual
    // sleep infliction (2-turn delay) happens in applyEndOfTurnEffects.
    const foeSide = actor === "you" ? "opp" : "you";
    const foeMon = actor === "you" ? ctx.opp : ctx.you;
    const foeSubKey = foeSide === "you" ? "youSubstituteHP" : "oppSubstituteHP";
    const foeSafeguardKey = foeSide === "you" ? "youSafeguardTurns" : "oppSafeguardTurns";
    const foeYawnKey = foeSide === "you" ? "youYawnTurns" : "oppYawnTurns";
    const foeStatusKey = foeSide === "you" ? "youStatus" : "oppStatus";
    if (foeMon.ability === "Insomnia" || foeMon.ability === "Vital Spirit") return "failed";
    if (s[foeSubKey]) return "failed";
    if (s[foeSafeguardKey] != null) return "failed";
    if (s[foeYawnKey] != null || s[foeStatusKey] != null) return "failed";
    s[foeYawnKey] = 2;
  },
  EFFECT_PERISH_SONG: (s, actor, ctx) => {
    // Cmd_trysetperishsong (src/battle_script_commands.c:8508-8534): affects
    // BOTH battlers simultaneously (not just the target) — Soundproof or
    // already-perish-songed exempts that one side; the move only fails
    // outright if BOTH sides are exempt. Real mechanic also has a 3-turn
    // countdown ending in an HP-independent faint (HandleWishPerishSongOnTurnEnd,
    // src/battle_util.c:1834-1861) — traced through the actual turn-processing
    // order and confirmed this NEVER completes within Arena's fixed 3-turn
    // window: the "timer reached 0" check only fires at the START of a LATER
    // end-of-turn pass than the one that ticks it to 0, and turn 3's
    // end-of-turn pass is immediately followed by Arena judgment in the SAME
    // pass, with no 4th pass ever occurring. So the faint is mechanically
    // inert here regardless of which turn it's used on — verified, not a
    // shortcut — and only the "already perish-songed" flag needs tracking.
    const { you, opp } = ctx;
    const youEligible = !s.youPerishSonged && you.ability !== "Soundproof";
    const oppEligible = !s.oppPerishSonged && opp.ability !== "Soundproof";
    if (!youEligible && !oppEligible) return "failed";
    if (youEligible) s.youPerishSonged = true;
    if (oppEligible) s.oppPerishSonged = true;
  },
  EFFECT_ACCURACY_DOWN: statDownExecutor("accuracy", 1, "Keen Eye"),
  EFFECT_DEFENSE_DOWN_2: statDownExecutor("def", 2, null),
  EFFECT_SPEED_DOWN_2: statDownExecutor("spe", 2, null),
  EFFECT_ATTACK_DOWN_2: statDownExecutor("atk", 2, "Hyper Cutter"),
  EFFECT_SPECIAL_DEFENSE_DOWN_2: statDownExecutor("spd", 2, null),
  EFFECT_EVASION_DOWN: statDownExecutor("evasion", 1, null),
  // Other effects (e.g. EFFECT_SPECIAL_DEFENSE_DOWN_HIT on Shadow Ball):
  // no executor yet. For power>0 moves this just means the secondary effect
  // is silently skipped (damage still applies normally) until ported — an
  // intentional simplification, not a silent correctness bug, since it only
  // affects the rare chance-triggered bonus, not the move's main function.
};

function applyMove(ctx, s, actor, moveName, hit, selfHit, secondaryTriggered = false, statusPrevented = false, thawed = false, endureTriggered = false, sleepRemaining = null, sleepDuration = null, protectTriggered = false, blockedByProtect = false, attractPrevented = false, attractGenderCompatible = null, hitCount = null) {
  const { you, opp } = ctx;
  const isYou = actor === "you";
  const selfMon = isYou ? you : opp;
  const foeMon = isYou ? opp : you;
  const moveData = MOVES[moveName];
  const mindKey = isYou ? "mindYou" : "mindOpp";
  const skillKey = isYou ? "skillYou" : "skillOpp";
  const selfHpKey = isYou ? "yourHpPct" : "oppHpPct";
  const foeHpKey = isYou ? "oppHpPct" : "yourHpPct";
  const selfStages = isYou ? s.youStages : s.oppStages;
  const foeStages = isYou ? s.oppStages : s.youStages;
  const selfStatusKey = isYou ? "youStatus" : "oppStatus";
  const foeStatusKey = isYou ? "oppStatus" : "youStatus";
  const selfSleepTurnsKey = isYou ? "youSleepTurns" : "oppSleepTurns";
  const selfLastMoveKey = isYou ? "youLastMove" : "oppLastMove";
  const selfFlashFireKey = isYou ? "youFlashFireActive" : "oppFlashFireActive";

  // gLastMoves[gBattlerAttacker] = gChosenMove — set for every action attempt,
  // regardless of what happens next (hit/miss/prevented/self-hit).
  s[selfLastMoveKey] = moveName;

  if (thawed && s[selfStatusKey] === "freeze") s[selfStatusKey] = null;

  if (statusPrevented) {
    // Paralysis full-para / still-frozen: Mind scores off selection
    // regardless (unconditional), no Skill (HITMARKER_OBEYS unset), no
    // damage or effect happens at all.
    if (sleepRemaining !== null) {
      // Counter reached 0 this turn — mon wakes up (still forfeits THIS
      // turn's move, per enumerateActionOutcomes) but is available from the
      // NEXT turn onward. Otherwise just bank the decremented counter.
      if (sleepRemaining <= 0) {
        s[selfStatusKey] = null;
        s[selfSleepTurnsKey] = null;
      } else {
        s[selfSleepTurnsKey] = sleepRemaining;
      }
    }
    s[mindKey] += mindDelta(moveName);
    return;
  }

  if (attractPrevented) {
    // CANCELER_IN_LOVE (src/battle_util.c:2200-2218): immobilized by love —
    // Mind scores off selection same as any other prevented turn; no self-
    // damage (unlike confusion's self-hit branch) and no Skill change.
    s[mindKey] += mindDelta(moveName);
    return;
  }

  if (selfHit) {
    const dmg = calcConfusionDamage(selfMon);
    s[selfHpKey] = Math.max(0, s[selfHpKey] - (dmg / selfMon.stats.hp) * 100);
    s[mindKey] += mindDelta(moveName);
    return;
  }

  s[mindKey] += mindDelta(moveName);

  // Explosion/Self Destruct (effect: "EFFECT_EXPLOSION"): the user's HP is
  // set to 0 UNCONDITIONALLY, confirmed from the real move script
  // (BattleScript_EffectExplosion, data/battle_scripts_1.s:374-381) —
  // `setatkhptozero` runs right after the Damp-ability check (not modeled;
  // no opponent in scope carries Damp) and BEFORE the accuracy check, BEFORE
  // Protect even enters the picture. This must happen here — before the
  // blockedByProtect early-return below — not gated behind hit/miss/protect
  // at all. A PREVIOUS fix (this session) added the self-faint only inside
  // the power>0 hit-resolution block further down, which is unreachable
  // whenever blockedByProtect returns early — meaning a Protect-blocked
  // Self Destruct silently never fainted its user. Caught while auditing an
  // anomalous grid result (Snorlax scored identically across ALL 4 moves,
  // including Self Destruct, against a Protect-heavy opponent — a real tell
  // that Self Destruct was being treated as a "safe, no-cost" move whenever
  // protected against).
  if (moveData.effect === "EFFECT_EXPLOSION") s[selfHpKey] = 0;

  if (blockedByProtect) {
    // Attacker's move blocked by opponent's active Protect/Detect. Verified
    // from BattleArena_AddSkillPoints (src/battle_arena.c:588-621): a
    // Protect-block sets MOVE_RESULT_MISSED (which composites into the
    // NO_EFFECT check, include/constants/battle.h:227) with
    // MISS_TYPE=B_MSG_PROTECTED specifically — and the -2 penalty's own
    // condition explicitly EXCLUDES that exact case
    // (!(MISSED) || MISS_TYPE != B_MSG_PROTECTED both false, so the -2
    // never fires). Skill is genuinely UNCHANGED here — NOT -2 like a
    // normal miss, and NOT +1 like a normal hit. Mind already applied above
    // (unconditional, as always — HITMARKER_OBEYS doesn't gate Mind).
    return;
  }

  const selfDamageTakenKey = isYou ? "youDamageTaken" : "oppDamageTaken";
  const foeDamageTakenKey = isYou ? "oppDamageTaken" : "youDamageTaken";

  if (moveData.effect === "EFFECT_OHKO") {
    // Sturdy and the level-gated accuracy roll are both already resolved
    // upstream into `hit` (enumerateActionOutcomes' OHKO-specific accBranches
    // — see the long comment there) — neither needs its own Math.random()
    // call here (Lesson 1). Type immunity still applies normally: typecalc
    // runs BEFORE Cmd_tryKO in real BattleScript_EffectOHKO, so an immune
    // target never even reaches the roll.
    const eff = typeEffectiveness(moveData.type, foeMon.types);
    if (eff === 0) {
      s[skillKey] += skillDelta("noEffect");
      return;
    }
    if (!hit) {
      s[skillKey] += skillDelta("miss");
      return;
    }
    const foeEndureKey = isYou ? "oppEndureActive" : "youEndureActive";
    const foeDestinyBondKey = isYou ? "oppDestinyBondActive" : "youDestinyBondActive";
    if (s[foeEndureKey]) {
      // Cmd_tryKO's own explicit gProtectStructs[target].endured check
      // (src/battle_script_commands.c:7546-7550) clamps to 1 HP instead of a
      // real KO — sets MOVE_RESULT_FOE_ENDURED, not MOVE_RESULT_ONE_HIT_KO,
      // so this does NOT count as a KO for Destiny Bond purposes below.
      const foeRawHp = Math.round((s[foeHpKey] / 100) * foeMon.stats.hp);
      s[foeHpKey] = (Math.max(0, foeRawHp - 1) / foeMon.stats.hp) * 100;
    } else {
      s[foeHpKey] = 0;
      if (s[foeDestinyBondKey] && s[selfHpKey] > 0) s[selfHpKey] = 0;
    }
    // A successful OHKO's own message handling (Cmd_resultmessage,
    // src/battle_script_commands.c:2095-2099) explicitly STRIPS
    // MOVE_RESULT_SUPER_EFFECTIVE/NOT_VERY_EFFECTIVE before Skill scoring
    // ever runs (BattleArena_AddSkillPoints fires at Cmd_end, strictly
    // after) — so a landed OHKO always scores a flat "landed" (+1),
    // regardless of the move's real type matchup, NEVER the super/not-very-
    // effective ±2/-1 bonus a normal attack of the same type would get.
    // Deliberately NOT classifyOutcome(hit, eff).
    s[skillKey] += skillDelta("landed");
    return;
  }

  if (moveData.effect === "EFFECT_COUNTER" || moveData.effect === "EFFECT_MIRROR_COAT") {
    // Reflects 2x whatever damage the user received THIS TURN from a
    // qualifying move (physical for Counter, special for Mirror Coat).
    // Fails entirely (no damage) if the user acted first this turn (nothing
    // recorded yet) or the received damage was the wrong category.
    const neededCategory = moveData.effect === "EFFECT_COUNTER" ? "physical" : "special";
    const received = s[selfDamageTakenKey];
    if (hit && received && received.category === neededCategory) {
      const reflected = received.amount * 2;
      s[foeHpKey] = Math.max(0, s[foeHpKey] - (reflected / foeMon.stats.hp) * 100);
      s[skillKey] += skillDelta("landed");
      s[foeDamageTakenKey] = { amount: reflected, category: neededCategory };
    } else {
      // Nothing to reflect — move fails outright, same bucket as "no effect".
      s[skillKey] += skillDelta("noEffect");
    }
    return;
  }

  if (moveData.effect === "EFFECT_ENDURE") {
    const usesKey = isYou ? "youProtectUses" : "oppProtectUses";
    if (endureTriggered) {
      s[isYou ? "youEndureActive" : "oppEndureActive"] = true;
      s[usesKey] += 1;
      // +1 on success — verified this is genuinely asymmetric with Protect's
      // OWN-use scoring (see below), NOT the same "precedent" as previously
      // assumed. Cmd_setprotectlike sets gProtectStructs[attacker].ENDURED
      // = 1 on a successful Endure (src/battle_script_commands.c:6521-6524),
      // a DIFFERENT field from .protected — so the final fallback branch in
      // BattleArena_AddSkillPoints (!gProtectStructs[battler].protected)
      // still evaluates true for Endure, landing on the default +1.
      s[skillKey] += skillDelta("landed");
    } else {
      s[usesKey] = 0;
      s[skillKey] += skillDelta("noEffect"); // failure sets MOVE_RESULT_MISSED, MISS_TYPE=B_MSG_PROTECT_FAILED (not B_MSG_PROTECTED) — scored as a real miss (-2)
    }
    return;
  }
  if (moveData.effect === "EFFECT_PROTECT") {
    // Shares the SAME decay counter as Endure (verified above), but its OWN
    // Skill scoring is NOT symmetric with Endure's: Cmd_setprotectlike sets
    // gProtectStructs[attacker].PROTECTED = 1 on success (a field the final
    // BattleArena_AddSkillPoints fallback branch explicitly EXCLUDES via
    // !gProtectStructs[battler].protected) — so a successful Protect scores
    // Skill 0 (genuinely unchanged), not +1. Failure still scores -2, same
    // as Endure (MISS_TYPE=B_MSG_PROTECT_FAILED either way).
    const usesKey = isYou ? "youProtectUses" : "oppProtectUses";
    const selfProtectedKey = isYou ? "youProtected" : "oppProtected";
    if (protectTriggered) {
      s[selfProtectedKey] = true;
      s[usesKey] += 1;
      // No skillKey change — success is genuinely neutral, see above.
    } else {
      s[usesKey] = 0;
      s[skillKey] += skillDelta("noEffect");
    }
    return;
  }

  const selfChargingKey = isYou ? "youCharging" : "oppCharging";

  if (moveData.effect === "EFFECT_SEMI_INVULNERABLE" && !s[selfChargingKey]) {
    // Charge-initiation turn: no accuracy check, no damage. Mind scores
    // automatically (mindDelta above already ran); Skill falls through to
    // +1, same as a normal successful hit (source-confirmed — the charge
    // turn's gMoveResultFlags stay all-clear, hitting the final +1 branch).
    s[selfChargingKey] = { move: moveName, invulnBit: SEMI_INVULN_BIT[moveName] };
    s[skillKey] += skillDelta("landed");
    return;
  }
  if (moveData.effect === "EFFECT_SEMI_INVULNERABLE" && s[selfChargingKey]) {
    // Attack-completion turn: clear the charge, then resolve as a REAL
    // attack — normal accuracy check (already branched by the caller using
    // this move's real accuracy), normal damage/Skill scoring.
    s[selfChargingKey] = null;
    // falls through to the normal power>0 damage-dealing branch below
  }

  // Ability interactions (Soundproof/Levitate/Wonder Guard/Absorb/Flash
  // Fire) checked before normal resolution — Soundproof applies to status
  // moves too, so this check runs regardless of moveData.power.
  if (hit || moveData.power === 0) {
    const interaction = resolveAbilityInteraction(moveName, moveData, selfMon, foeMon);
    if (interaction.type === "blocked") {
      s[skillKey] += skillDelta("blocked");
      return;
    }
    if (interaction.type === "absorb") {
      const healAmount = Math.max(1, Math.floor(foeMon.stats.hp * interaction.healFraction));
      // No-op (not healing over cap) if already at full HP, per source.
      if (s[foeHpKey] < 100) {
        s[foeHpKey] = Math.min(100, s[foeHpKey] + (healAmount / foeMon.stats.hp) * 100);
      }
      s[skillKey] += skillDelta("blocked"); // still an ability-block for Skill purposes
      return;
    }
    if (interaction.type === "flashFireTrigger") {
      s[isYou ? "oppFlashFireActive" : "youFlashFireActive"] = true;
      s[skillKey] += skillDelta("blocked");
      return;
    }
  }

  if (moveData.power > 0) {
    if (SILENT_FALLTHROUGH_EFFECTS.has(moveData.effect)) {
      throw new Error(`"${moveName}" (effect: ${moveData.effect}) has a non-generic damage mechanic ` +
        `(fixed/level/HP-based, not power-based) with no dedicated implementation yet — the generic ` +
        `power-based path would silently compute a near-meaningless number off its move-data.js ` +
        `placeholder power (same bug class as the historical EFFECT_OHKO bug, see HANDOFF.md §10). ` +
        `Port its real mechanic before using it.`);
    }
    const atkStatKey = moveData.category === "physical" ? "atk" : "spa";
    const defStatKey = moveData.category === "physical" ? "def" : "spd";
    const eff = typeEffectiveness(moveData.type, foeMon.types);
    const foeEndureKey = isYou ? "oppEndureActive" : "youEndureActive";
    if (hit) {
      // Reflect/Light Screen: halves damage of the matching category, gated
      // on the DEFENDER'S side having it up (src/pokemon.c:3267-3273/3318-3324).
      // Crits bypass this (gCritMultiplier==1 gate) — moot here since this
      // engine never branches crits (expected-value damage only, HANDOFF §4
      // known gap), so screenActive is always safe to apply when present.
      const foeReflectKey = isYou ? "oppReflectTurns" : "youReflectTurns";
      const foeLightScreenKey = isYou ? "oppLightScreenTurns" : "youLightScreenTurns";
      const screenActive = moveData.category === "physical" ? s[foeReflectKey] != null : s[foeLightScreenKey] != null;
      let dmg = calcDamage(selfMon, foeMon, moveName, {
        atkStage: selfStages[atkStatKey], defStage: foeStages[defStatKey],
        attackerBurned: s[selfStatusKey] === "burn",
        attackerFlashFireActive: s[selfFlashFireKey],
        attackerHpPct: s[selfHpKey],
        screenActive,
        weather: effectiveWeather(s, you, opp),
      });
      // Bypass bonus: moves that ignore semi-invulnerability (Surf/Whirlpool
      // vs Dive, Earthquake vs Dig, Twister/Gust vs Fly) double damage;
      // Thunder/Sky Uppercut bypass without the bonus (source-confirmed).
      const foeChargingKey = isYou ? "oppCharging" : "youCharging";
      if (s[foeChargingKey]) {
        const bypassMult = INVULN_BYPASS[s[foeChargingKey].invulnBit]?.[moveName];
        if (bypassMult) dmg = Math.floor(dmg * bypassMult);
      }

      // Substitute: redirect damage to the sub's HP pool instead of the real
      // mon, capped at the sub's remaining HP (no overflow — Cmd_datahpupdate,
      // src/battle_script_commands.c:1865-1892). Skill scoring is UNAFFECTED
      // (classifyOutcome below still runs off the real type-effectiveness
      // eff, matching source: hitting a sub sets no special MOVE_RESULT flag,
      // it scores exactly like a normal hit on the real mon — confirmed by
      // checking BattleArena_AddSkillPoints, which only branches on
      // NO_EFFECT/SUPER_EFFECTIVE/NOT_VERY_EFFECTIVE, none of which
      // Cmd_datahpupdate's substitute branch ever sets). The real mon's HP
      // is never touched while a sub is up, regardless of how much damage
      // would have been dealt — even a would-be OHKO only breaks the sub.
      const foeSubKey = isYou ? "oppSubstituteHP" : "youSubstituteHP";
      const foeDestinyBondKey = isYou ? "oppDestinyBondActive" : "youDestinyBondActive";

      // Multi-hit (EFFECT_MULTI_HIT/DOUBLE_HIT/TWINEEDLE): `dmg` is computed
      // ONCE above (Reflect/weather/Flash Fire/bypass all already baked in)
      // and re-applied per hit — this engine already treats a single hit's
      // damage as one fixed expected-value number rather than an 85-100%
      // roll, so reusing that same number per hit is the direct extension
      // of the existing model, not a new approximation. `hits` defaults to
      // 1 for every ordinary damaging move, so this loop subsumes the old
      // single-hit code path unchanged (runs its body exactly once).
      const hits = hitCount ?? 1;
      let recoilBasis = 0; // last hit's actual HP removed (sub-absorbed amount, or real damage) — recoil's gHpDealt
      for (let i = 0; i < hits; i++) {
        if (s[foeHpKey] <= 0) break; // already fainted from an earlier hit this sequence (src: jumpifhasnohp BS_TARGET)

        if (s[foeSubKey] != null) {
          // Substitute: redirect damage to the sub's HP pool instead of the
          // real mon, capped at the sub's remaining HP (no overflow —
          // Cmd_datahpupdate, src/battle_script_commands.c:1865-1892). Skill
          // scoring is UNAFFECTED (classifyOutcome below still runs off the
          // real type-effectiveness eff — hitting a sub sets no special
          // MOVE_RESULT flag, confirmed via BattleArena_AddSkillPoints).
          // Re-checked EVERY iteration (not cached) — confirmed from source
          // that once a multi-hit sequence breaks the sub partway through,
          // the REMAINING hits in the SAME move fall through to real HP
          // (Cmd_datahpupdate's substitute branch requires substituteHP > 0,
          // which is false the instant it's been zeroed).
          const absorbed = Math.min(s[foeSubKey], dmg);
          s[foeSubKey] -= absorbed;
          if (s[foeSubKey] <= 0) s[foeSubKey] = null; // sub breaks, fully absorbed regardless of excess
          recoilBasis = absorbed;
          // NOTE: foeDamageTakenKey deliberately NOT set — the real mon took no
          // direct damage, so Counter/Mirror Coat have nothing to reflect (this
          // specific interaction wasn't chased further in source, but matches
          // the general "the sub takes the hit for you" semantics).
        } else {
          // Endure: clamp to leave exactly 1 HP if this hit would otherwise KO —
          // only intercepts direct move damage, never residual (burn/poison)
          // ticks (those don't flow through this code path at all). Only
          // relevant here since a substitute already fully absorbs otherwise.
          let hitDmg = dmg;
          let endureTriggeredThisHit = false;
          if (s[foeEndureKey]) {
            const foeRawHp = Math.round((s[foeHpKey] / 100) * foeMon.stats.hp);
            if (hitDmg >= foeRawHp) { hitDmg = Math.max(0, foeRawHp - 1); endureTriggeredThisHit = true; }
          }
          s[foeHpKey] = Math.max(0, s[foeHpKey] - (hitDmg / foeMon.stats.hp) * 100);
          recoilBasis = hitDmg;
          // Overwritten each hit, not accumulated — matches source, where
          // gProtectStructs[target].physicalDmg/specialDmg is a plain
          // assignment per hit (Cmd_datahpupdate), so Counter/Mirror Coat
          // can only ever reflect double the FINAL hit of a multi-hit move,
          // never the total.
          if (eff !== 0) s[foeDamageTakenKey] = { amount: hitDmg, category: moveData.category };
          // Destiny Bond: if this hit just KO'd a foe with it armed, the
          // attacker instantly faints too (TrySetDestinyBondToHappen + the
          // faint-check at src/battle_script_commands.c:3020-3026) — only if
          // the attacker is still alive (can't "double-kill" one already at 0).
          // Only reachable here (real HP, not substitute) — a broken sub isn't
          // a faint, so Destiny Bond can't trigger off a hit that only broke it.
          if (s[foeHpKey] <= 0 && s[foeDestinyBondKey] && s[selfHpKey] > 0) {
            s[selfHpKey] = 0;
          }
          // src: the multi-hit loop explicitly halts the instant a hit sets
          // MOVE_RESULT_FOE_ENDURED (jumpifbyte ... BattleScript_MultiHitPrintStrings)
          // — no further hits after the one that gets clamped to 1 HP, unlike
          // a broken substitute (which lets the sequence continue).
          if (endureTriggeredThisHit) break;
        }
      }
      // Any damaging Fire-type move thaws a frozen target, regardless of user
      // (and regardless of substitute — thaw wasn't confirmed to be blocked
      // by a sub, kept as a passive reaction to being hit either way).
      if (moveData.type === "Fire" && s[foeStatusKey] === "freeze") s[foeStatusKey] = null;

      // Recoil (see RECOIL_FRACTION above): unconditional on any hit (not
      // gated behind secondaryTriggered — MOVE_EFFECT_CERTAIN, no roll at
      // all), floored to 1 even off a 0-damage immune hit, applied AFTER the
      // target-side resolution above (so a Destiny-Bond self-faint from
      // THIS hit already zeroed the user's HP first, matching source's
      // script order — the max(0, ...) clamp below makes stacking a no-op).
      const recoilDivisor = RECOIL_FRACTION[moveData.effect];
      if (recoilDivisor && selfMon.ability !== "Rock Head") {
        const recoilDmg = Math.max(1, Math.floor(recoilBasis / recoilDivisor));
        s[selfHpKey] = Math.max(0, s[selfHpKey] - (recoilDmg / selfMon.stats.hp) * 100);
      }
    }
    s[skillKey] += skillDelta(classifyOutcome(hit, eff));
    // (EFFECT_EXPLOSION's self-faint is applied unconditionally much earlier
    // now — see the comment above the blockedByProtect check — since it must
    // fire even when Protect blocks the move entirely, which returns before
    // ever reaching this point.)

    if (secondaryTriggered) {
      const executor = EFFECT_EXECUTORS[moveData.effect];
      if (executor) executor(s, actor, ctx, moveData);
    }
  } else if (!hit) {
    // A genuine accuracy miss on a power=0 status move (e.g. Attract, whose
    // 100 base accuracy CAN miss once evasion/accuracy stages are involved
    // — most already-ported status moves use accuracy:null so this path was
    // previously unreachable for them). Pre-existing gap, caught while
    // wiring Attract: this branch used to fall into the executor dispatch
    // below UNCONDITIONALLY, regardless of hit, which would have run e.g.
    // Attract's infatuation-infliction logic even on a miss. Scored as a
    // real miss, no executor call, no state changes.
    s[skillKey] += skillDelta("miss");
  } else {
    const executor = EFFECT_EXECUTORS[moveData.effect];
    let outcome = "landed";
    if (executor) {
      // Status-move executors can report "failed" (e.g. Rest at full HP,
      // Roar with nothing to switch into, paralysis blocked by type/ability)
      // — those score Skill as noEffect instead of the default landed/+1.
      const result = executor(s, actor, ctx, moveData, sleepDuration, attractGenderCompatible);
      if (result === "failed") outcome = "noEffect";
    } else if (moveData.effect !== "EFFECT_TOXIC") {
      // Toxic is intentionally exempt: it's locked out of the AI's move pool
      // by the Steel/Poison immunity check before it would ever be chosen,
      // so it never reaches execution in any matchup so far.
      throw new Error(`"${moveName}" (effect: ${moveData.effect}) has no execution logic yet — port it into EFFECT_EXECUTORS.`);
    }
    s[skillKey] += skillDelta(outcome);
  }
}

// End-of-turn effects: Leftovers healing runs FIRST (ENDTURN_ITEMS1), THEN
// burn/poison residual damage (ENDTURN_POISON/ENDTURN_BURN) — source-confirmed
// ordering. A burned/poisoned Leftovers-holder still nets damage overall
// (1/16 heal vs 1/8 damage) but the heal genuinely banks first.
// Sandstorm/Hail chip damage immunity checks (src/battle_script_commands.c:7602-7646).
function isWeatherChipImmune(weatherType, mon, charging) {
  const underground = charging?.invulnBit === "underground";
  const underwater = charging?.invulnBit === "underwater";
  if (weatherType === "sandstorm") {
    return mon.types.some((t) => ["Rock", "Steel", "Ground"].includes(t))
      || mon.ability === "Sand Veil" || underground || underwater;
  }
  if (weatherType === "hail") {
    return mon.types.includes("Ice") || underground || underwater;
  }
  return true; // rain/sun/no-weather never chip
}

function applyEndOfTurnEffects(ctx, s) {
  const { you, opp } = ctx;

  // Weather chip damage + duration housekeeping runs FIRST, before EVERYTHING
  // else in this function — DoFieldEndTurnEffects() runs to completion
  // entirely before DoBattlerEndTurnEffects() even starts (src/battle_main.c:3963-3966),
  // and Ingrain/Leftovers/Leech Seed/poison/burn all live in the latter. This
  // matters for real edge cases: a mon that would've survived via Leftovers/
  // Ingrain healing first could otherwise be wrongly fainted by weather chip
  // if the order were reversed. 1/16 max HP (floor, min 1), non-immune types
  // only; skipped entirely if Cloud Nine/Air Lock suppresses weather.
  const weather = effectiveWeather(s, you, opp);
  if ((weather === "sandstorm" || weather === "hail")) {
    if (s.yourHpPct > 0 && !isWeatherChipImmune(weather, you, s.youCharging)) {
      const chip = Math.max(1, Math.floor(you.stats.hp / 16));
      s.yourHpPct = Math.max(0, s.yourHpPct - (chip / you.stats.hp) * 100);
    }
    if (s.oppHpPct > 0 && !isWeatherChipImmune(weather, opp, s.oppCharging)) {
      const chip = Math.max(1, Math.floor(opp.stats.hp / 16));
      s.oppHpPct = Math.max(0, s.oppHpPct - (chip / opp.stats.hp) * 100);
    }
  }

  // Ingrain: 1/16 max HP, comes BEFORE Leftovers in the real per-battler
  // order (ENDTURN_INGRAIN is index 0, ENDTURN_ITEMS1 is index 2 —
  // src/battle_util.c:1440-1462). No-op at full HP or 0 HP.
  if (s.youIngrained && s.yourHpPct > 0 && s.yourHpPct < 100) {
    const heal = Math.max(1, Math.floor(you.stats.hp / 16));
    s.yourHpPct = Math.min(100, s.yourHpPct + (heal / you.stats.hp) * 100);
  }
  if (s.oppIngrained && s.oppHpPct > 0 && s.oppHpPct < 100) {
    const heal = Math.max(1, Math.floor(opp.stats.hp / 16));
    s.oppHpPct = Math.min(100, s.oppHpPct + (heal / opp.stats.hp) * 100);
  }

  // Rain Dish: 1/16 max HP in rain, comes right after Ingrain and before
  // Leftovers (ENDTURN_ABILITIES is index 1, right between ENDTURN_INGRAIN=0
  // and ENDTURN_ITEMS1=2 — src/battle_util.c:2601-2619).
  if (weather === "rain") {
    if (you.ability === "Rain Dish" && s.yourHpPct > 0 && s.yourHpPct < 100) {
      const heal = Math.max(1, Math.floor(you.stats.hp / 16));
      s.yourHpPct = Math.min(100, s.yourHpPct + (heal / you.stats.hp) * 100);
    }
    if (opp.ability === "Rain Dish" && s.oppHpPct > 0 && s.oppHpPct < 100) {
      const heal = Math.max(1, Math.floor(opp.stats.hp / 16));
      s.oppHpPct = Math.min(100, s.oppHpPct + (heal / opp.stats.hp) * 100);
    }
  }

  // Leftovers: 1/16 max HP, no-op at full HP, never overheals past max.
  if (s.yourHpPct > 0 && s.yourHpPct < 100 && you.item === "Leftovers") {
    const heal = Math.max(1, Math.floor(you.stats.hp / 16));
    s.yourHpPct = Math.min(100, s.yourHpPct + (heal / you.stats.hp) * 100);
  }
  if (s.oppHpPct > 0 && s.oppHpPct < 100 && opp.item === "Leftovers") {
    const heal = Math.max(1, Math.floor(opp.stats.hp / 16));
    s.oppHpPct = Math.min(100, s.oppHpPct + (heal / opp.stats.hp) * 100);
  }

  // Status-curing berries (Lum/Cheri/Chesto/etc.) — same ITEMS1/ITEMS2
  // checkpoint as Leftovers above, so it belongs at this same relative
  // position: BEFORE Leech Seed/poison/burn residual (see tryCureWithBerry's
  // comment for why that ordering specifically matters).
  if (s.yourHpPct > 0) tryCureWithBerry(s, "you", you);
  if (s.oppHpPct > 0) tryCureWithBerry(s, "opp", opp);

  // Leech Seed: comes right after Leftovers (ITEMS1) and before poison/burn
  // in the real ENDTURN_* order (src/battle_util.c:1440-1462 — INGRAIN,
  // ABILITIES, ITEMS1, LEECH_SEED, POISON, BAD_POISON, BURN, ...). Drains
  // maxHP/8 of the seeded mon (floored, min 1, capped at its CURRENT hp — you
  // can't drain more than you have), transfers that SAME raw amount as
  // healing to whoever planted it (capped at their max HP), skipped entirely
  // if either side has already fainted, and skipped for the receiver only if
  // they hold Liquid Ooze (:1509-1523, data/battle_scripts_1.s:3265-3280 —
  // exact "no heal happens" behavior confirmed; whether Liquid Ooze ALSO
  // deals damage back was not chased further, flagged as unconfirmed).
  if (s.youSeeded && s.yourHpPct > 0 && s.oppHpPct > 0) {
    const maxDrain = Math.max(1, Math.floor(you.stats.hp / 8));
    const currentHp = Math.round((s.yourHpPct / 100) * you.stats.hp);
    const drain = Math.min(maxDrain, currentHp);
    s.yourHpPct = Math.max(0, s.yourHpPct - (drain / you.stats.hp) * 100);
    if (opp.ability !== "Liquid Ooze") {
      s.oppHpPct = Math.min(100, s.oppHpPct + (drain / opp.stats.hp) * 100);
    }
  }
  if (s.oppSeeded && s.oppHpPct > 0 && s.yourHpPct > 0) {
    const maxDrain = Math.max(1, Math.floor(opp.stats.hp / 8));
    const currentHp = Math.round((s.oppHpPct / 100) * opp.stats.hp);
    const drain = Math.min(maxDrain, currentHp);
    s.oppHpPct = Math.max(0, s.oppHpPct - (drain / opp.stats.hp) * 100);
    if (you.ability !== "Liquid Ooze") {
      s.yourHpPct = Math.min(100, s.yourHpPct + (drain / you.stats.hp) * 100);
    }
  }

  // Burn/poison residual: maxHP/8 (Gen III — NOT 1/16 as in later generations).
  if (s.yourHpPct > 0 && (s.youStatus === "burn" || s.youStatus === "poison")) {
    const dmg = Math.max(1, Math.floor(you.stats.hp / 8));
    s.yourHpPct = Math.max(0, s.yourHpPct - (dmg / you.stats.hp) * 100);
  }
  if (s.oppHpPct > 0 && (s.oppStatus === "burn" || s.oppStatus === "poison")) {
    const dmg = Math.max(1, Math.floor(opp.stats.hp / 8));
    s.oppHpPct = Math.max(0, s.oppHpPct - (dmg / opp.stats.hp) * 100);
  }

  // Reflect/Light Screen duration: a SEPARATE end-of-turn tracker from the
  // per-battler ENDTURN_* one above (src/battle_util.c:1221-1264 —
  // ENDTURN_REFLECT/ENDTURN_LIGHT_SCREEN, ticks once per FULL turn, not per
  // battler). Decrements unconditionally whenever active, clearing at 0 —
  // no special-casing for "just set this turn" (matches the same literal
  // reading applied to Leech Seed's same-turn drain). Within this engine's
  // 3-turn match cap, a screen set on turn 1 (starting at 5) can never
  // reach 0 by turn 3 — natural expiry is untestable end-to-end here, only
  // via a direct low-level test that ticks the counter down manually.
  if (s.youReflectTurns != null && --s.youReflectTurns <= 0) s.youReflectTurns = null;
  if (s.oppReflectTurns != null && --s.oppReflectTurns <= 0) s.oppReflectTurns = null;
  if (s.youLightScreenTurns != null && --s.youLightScreenTurns <= 0) s.youLightScreenTurns = null;
  if (s.oppLightScreenTurns != null && --s.oppLightScreenTurns <= 0) s.oppLightScreenTurns = null;
  // Safeguard — same 5-turn side-status shape (src/battle_script_commands.c:8650-8668).
  if (s.youSafeguardTurns != null && --s.youSafeguardTurns <= 0) s.youSafeguardTurns = null;
  if (s.oppSafeguardTurns != null && --s.oppSafeguardTurns <= 0) s.oppSafeguardTurns = null;
  // Weather: decrements once per FULL turn (not per-side — it's a single
  // global condition), UNLESS permanent (weatherTurns stays null forever in
  // that case — src/battle_util.c:1340-1424, the `!(PERMANENT) && --counter`
  // short-circuit). Reaching 0 clears BOTH weatherType and weatherTurns.
  if (s.weatherType != null && s.weatherTurns != null && --s.weatherTurns <= 0) {
    s.weatherType = null;
    s.weatherTurns = null;
  }
  // Yawn: 2-turn drowsy counter (src/battle_util.c ENDTURN_YAWN, :1753-1771)
  // ticks down regardless of what else happens; when it reaches 0, the
  // target falls asleep for real IF it's still status-free and doesn't have
  // Insomnia/Vital Spirit at THAT moment (re-checked, not just at initial
  // use — a different status landing in between silently cancels the yawn).
  // The real duration re-roll ({2,3,4,5}) is genuinely inconsequential in
  // THIS engine's fixed 3-turn match — Yawn only ever completes at the end
  // of turn 2 (used turn 1), which uses up the match's very last turn
  // regardless of which value would've been rolled, and used on turn 2+ it
  // can never complete before the match ends at all — so a fixed
  // placeholder duration is used rather than fanning out a pointless branch
  // (same reasoning already applied to the direct sleep-duration enumeration
  // in enumerateActionOutcomes).
  if (s.youYawnTurns != null) {
    s.youYawnTurns--;
    if (s.youYawnTurns <= 0) {
      s.youYawnTurns = null;
      if (s.youStatus == null && you.ability !== "Insomnia" && you.ability !== "Vital Spirit") {
        s.youStatus = "sleep";
        s.youSleepTurns = 2;
      }
    }
  }
  if (s.oppYawnTurns != null) {
    s.oppYawnTurns--;
    if (s.oppYawnTurns <= 0) {
      s.oppYawnTurns = null;
      if (s.oppStatus == null && opp.ability !== "Insomnia" && opp.ability !== "Vital Spirit") {
        s.oppStatus = "sleep";
        s.oppSleepTurns = 2;
      }
    }
  }
}

// Enumerates every possible outcome of ONE actor using ONE move, as a list
// of { p, hit, selfHit, secondaryTriggered, statusPrevented, thawed }
// branches with probabilities summing to 1. This is the single place new
// branching sources get composed, instead of hand-nesting more for-loops in
// resolveTurn every time. Layering order matches real mechanics: major
// status (paralysis/freeze) prevention is checked first — if prevented,
// nothing else (confusion, accuracy) matters this turn; only if the mon
// gets to act at all do confusion/accuracy/secondary-effect branches apply.
function enumerateActionOutcomes(ctx, state, actor, moveName, moveData, targetCharging, isLastToAct = false) {
  const statusKey = actor === "you" ? "youStatus" : "oppStatus";
  const status = state[statusKey];

  // Paralysis is NOT handled in this outer switch (see below) — it moved
  // into the unified confusion/paralysis/love priority chain to match its
  // real position in the CANCELER_* sequence (a pre-existing ordering bug,
  // fixed alongside Attract — see the long comment further down).
  let statusBranches;
  if (status === "freeze") {
    // Random() % 5 == 0 → 20% thaw (then acts normally), else stays frozen
    // and fully prevented. Re-rolled every turn (no duration counter).
    statusBranches = [{ p: 0.2, prevented: false, thawed: true }, { p: 0.8, prevented: true, thawed: false }];
  } else if (status === "sleep") {
    // Duration was rolled ONCE at infliction (state.<x>SleepTurns) — NOT
    // re-rolled every turn like paralysis/freeze above. Decrement happens
    // here, at the start of the sleeping mon's own action attempt
    // (src/battle_util.c CANCELER_ASLEEP, :2029-2038). Early Bird doubles
    // the decrement (2/turn instead of 1, :2030-2033). Reaching 0 ("waking
    // up") STILL forfeits this turn's move exactly like staying asleep does
    // — the game routes to BattleScript_MoveUsedWokeUp, a separate
    // "the mon wakes up" message, not a fallthrough into the chosen move
    // (:2047-2053) — the mon only becomes available starting NEXT turn.
    const mon = actor === "you" ? ctx.you : ctx.opp;
    const turnsKey = actor === "you" ? "youSleepTurns" : "oppSleepTurns";
    const toSub = mon.ability === "Early Bird" ? 2 : 1;
    const sleepRemaining = Math.max(0, state[turnsKey] - toSub);
    statusBranches = [{ p: 1, prevented: true, thawed: false, sleepRemaining }];
  } else {
    statusBranches = [{ p: 1, prevented: false, thawed: false }];
  }

  const results = [];
  for (const stb of statusBranches) {
    if (stb.prevented) {
      results.push({ p: stb.p, hit: null, selfHit: false, secondaryTriggered: false, statusPrevented: true, thawed: false, sleepRemaining: stb.sleepRemaining ?? null });
      continue;
    }

    // Real priority chain (src/battle_util.c AtkCanceler_UnableToUseMove:
    // CANCELER_CONFUSED -> CANCELER_PARALYZED -> CANCELER_IN_LOVE). The
    // do-while loop there stops at the FIRST canceler that reports
    // effect=1, so at most ONE of these three ever fires per turn — they
    // are NOT independent rolls. Confusion is special: BOTH of its own
    // outcomes (self-hit AND "acts normally this turn") set effect=1, so
    // being confused means paralysis/love are never even ROLLED that turn,
    // regardless of which way the confusion coin flip goes. Paralysis and
    // love, by contrast, only short-circuit on their OWN "prevented"
    // outcome — their "you're fine, go ahead" outcome falls through to the
    // next check in line (confirmed: CANCELER_PARALYZED only sets effect=1
    // inside the branch that includes its own 25% roll succeeding).
    // Previously this engine modeled paralysis as the OUTER gate ahead of
    // confusion (backwards from source) — a pre-existing bug caught while
    // wiring Attract in, since Attract's own prevention has to slot into
    // this exact same chain as the third/last check.
    const confusable = actor === "you" ? state.metagrossConfused : false; // only "you" can be confused so far
    const paralyzed = status === "paralysis";
    const attracted = actor === "you" ? state.youAttracted : false; // only "you" can be attracted so far — opponent->you only

    let actionBranches;
    if (confusable) {
      actionBranches = [{ p: 0.5, kind: "confuseSelfHit" }, { p: 0.5, kind: "normal" }];
    } else {
      actionBranches = [{ p: 1, kind: "normal" }];
      if (paralyzed) {
        actionBranches = [{ p: 0.25, kind: "paraBlocked" }, { p: 0.75, kind: "normal" }];
      }
      if (attracted) {
        const next = [];
        for (const b of actionBranches) {
          if (b.kind !== "normal") { next.push(b); continue; }
          next.push({ p: b.p * 0.5, kind: "loveBlocked" });
          next.push({ p: b.p * 0.5, kind: "normal" });
        }
        actionBranches = next;
      }
    }

    for (const acb of actionBranches) {
      const p = stb.p * acb.p;
      if (acb.kind === "confuseSelfHit") {
        results.push({ p, hit: null, selfHit: true, secondaryTriggered: false, statusPrevented: false, thawed: stb.thawed });
        continue;
      }
      if (acb.kind === "paraBlocked") {
        results.push({ p, hit: null, selfHit: false, secondaryTriggered: false, statusPrevented: true, thawed: stb.thawed, sleepRemaining: null });
        continue;
      }
      if (acb.kind === "loveBlocked") {
        results.push({ p, hit: null, selfHit: false, secondaryTriggered: false, statusPrevented: false, attractPrevented: true, thawed: stb.thawed });
        continue;
      }
      if (moveData.effect === "EFFECT_ENDURE" || moveData.effect === "EFFECT_PROTECT") {
        // Endure AND Protect/Detect share the EXACT SAME success-rate roll —
        // both funnel through Cmd_setprotectlike (src/battle_script_commands.c:6503-6536),
        // never a normal accuracy check. Two things verified from source,
        // not assumed: (1) it's genuinely the same shared decay counter
        // (protectUses resets to 0 if the LAST move wasn't Protect/Detect/
        // Endure); (2) an UNCONDITIONAL extra fail condition — the move
        // ALWAYS fails, regardless of the decay roll, if the user is the
        // LAST to act this turn (gCurrentTurnActionNumber == gBattlersCount-1,
        // "notLastTurn" gate, :6511-6514). This barely ever matters in
        // practice since Protect/Detect/Endure all carry priority 3 in this
        // engine's move data — whoever uses one almost always acts FIRST —
        // but it's a real, correct constraint for the rare case where BOTH
        // sides use a priority-3+ move in the same turn and this one loses
        // the speed tiebreak. NOT previously implemented for Endure either
        // (a real pre-existing gap, caught while verifying Protect shares
        // the mechanic).
        const usesKey = actor === "you" ? "youProtectUses" : "oppProtectUses";
        const successRates = [1, 0.5, 0.25, 0.125];
        const rate = isLastToAct ? 0 : successRates[Math.min(state[usesKey], successRates.length - 1)];
        const triggerFlag = moveData.effect === "EFFECT_ENDURE" ? "endureTriggered" : "protectTriggered";
        if (rate > 0) {
          results.push({ p: p * rate, hit: true, selfHit: false, secondaryTriggered: false, statusPrevented: false, thawed: stb.thawed, [triggerFlag]: true });
        }
        if (rate < 1) {
          results.push({ p: p * (1 - rate), hit: false, selfHit: false, secondaryTriggered: false, statusPrevented: false, thawed: stb.thawed, [triggerFlag]: false });
        }
        continue;
      }

      // Protect/Detect blocking: checked BEFORE any accuracy roll (source
      // gates this in Cmd_attackcanceler, which runs before Cmd_accuracycheck
      // entirely — a protect-blocked move never rolls for accuracy at all).
      // Gated on the move actually carrying FLAG_PROTECT_AFFECTED (most do;
      // notable exceptions confirmed in this engine's own move data — e.g.
      // Perish Song does NOT carry it, matching real mechanics). Does not
      // special-case the Ghost-Curse-bypasses-protect exception (Curse's
      // Ghost branch already throws as unmodeled) or the semi-invulnerable
      // charge-turn exception (moot — that branch below already exits before
      // reaching this check, so this only ever runs on a real attack attempt).
      const foeProtectedKey = actor === "you" ? "oppProtected" : "youProtected";
      if (state[foeProtectedKey] && moveData.flags.includes("FLAG_PROTECT_AFFECTED")) {
        results.push({ p: p, hit: false, selfHit: false, secondaryTriggered: false, statusPrevented: false, thawed: stb.thawed, blockedByProtect: true });
        continue;
      }

      const alreadyCharging = state[actor === "you" ? "youCharging" : "oppCharging"];
      if (moveData.effect === "EFFECT_SEMI_INVULNERABLE" && !alreadyCharging) {
        // Charge-initiation turn: no accuracy check at all in source — always
        // "succeeds" in starting the charge (barring the status-prevention
        // already handled above).
        results.push({ p: p, hit: true, selfHit: false, secondaryTriggered: false, statusPrevented: false, thawed: stb.thawed, endureTriggered: false });
        continue;
      }

      const attackerAccStage = (actor === "you" ? state.youStages : state.oppStages).accuracy;
      const targetEvasionStage = (actor === "you" ? state.oppStages : state.youStages).evasion;
      const foeMonForAcc = actor === "you" ? ctx.opp : ctx.you;
      const selfMonForAcc = actor === "you" ? ctx.you : ctx.opp;
      const weatherForAcc = effectiveWeather(state, ctx.you, ctx.opp);

      const accBranches = (() => {
        // Target invulnerable (mid-charge on Dive/Fly/Dig/Bounce) and this
        // move doesn't bypass it: forced miss, no accuracy roll at all
        // (source-confirmed — MOVE_RESULT_MISSED set unconditionally,
        // scored as a normal -2 miss, NOT the Protect exemption).
        if (moveData.power > 0 && targetCharging && !INVULN_BYPASS[targetCharging.invulnBit]?.[moveName]) {
          return [{ p: 1, hit: false }];
        }
        // EFFECT_OHKO (Horn Drill/Fissure/Guillotine/Sheer Cold): Cmd_tryKO
        // (src/battle_script_commands.c:7490-7574) completely bypasses the
        // normal accuracy/evasion-stage system below — AccuracyCalcHelper is
        // never called for this effect (confirmed via the move's own
        // BattleScript_EffectOHKO, which routes through accuracycheck's
        // NO_ACC_CALC_CHECK_LOCK_ON branch: only a Protect/semi-invulnerable
        // gate, no real roll there). Sturdy blocks the move OUTRIGHT in Gen
        // III (unconditional, not the modern "only at full HP" version) —
        // checked first in source, before the roll is even computed. The
        // real roll: chance% = move's own accuracy (30 for all 4 moves) +
        // (attacker level - target level), hit if Random()%100+1 < chance —
        // i.e. P(hit) = clamp((chance-1)/100, 0, 1) — AND an explicit extra
        // AND-condition that makes the move fail OUTRIGHT whenever the
        // attacker's level is LOWER than the target's, regardless of the
        // roll (both branches of the source if/else repeat this same check).
        if (moveData.effect === "EFFECT_OHKO") {
          if (foeMonForAcc.ability === "Sturdy") return [{ p: 1, hit: false }];
          if (selfMonForAcc.level < foeMonForAcc.level) return [{ p: 1, hit: false }];
          const chance = moveData.accuracy + (selfMonForAcc.level - foeMonForAcc.level);
          const pHit = Math.max(0, Math.min(1, (chance - 1) / 100));
          return pHit > 0 ? [{ p: pHit, hit: true }, { p: 1 - pHit, hit: false }] : [{ p: 1, hit: false }];
        }
        // Thunder's weather interaction (src/battle_script_commands.c:1089-1094,
        // :1146-1147): Rain makes it bypass the accuracy check entirely (same
        // treatment as EFFECT_ALWAYS_HIT); Sun forces its BASE accuracy to
        // exactly 50 (overriding the move's own 70) — stage modifiers still
        // apply normally on top of that, it's not a hard 50% floor.
        let baseAccuracy = moveData.accuracy;
        if (moveData.effect === "EFFECT_THUNDER") {
          if (weatherForAcc === "rain") baseAccuracy = null;
          else if (weatherForAcc === "sun") baseAccuracy = 50;
        }
        // accuracy === null means "always hits" (e.g. Faint Attack, Swift) —
        // these bypass the accuracy check ENTIRELY, including evasion.
        if (baseAccuracy === null) return [{ p: 1, hit: true }];
        let effAcc = effectiveAccuracy(baseAccuracy, attackerAccStage, targetEvasionStage);
        // Sand Veil: 0.8x the ATTACKER's accuracy when attacking a Sand-Veil
        // holder during sandstorm (src/battle_script_commands.c:1154-1155) —
        // applied after the stage-ratio clamp already in effectiveAccuracy,
        // a minor ordering simplification (only matters combined with
        // nonzero accuracy/evasion stages, an edge case for the 4 Dugtrio
        // sets that carry this ability).
        if (weatherForAcc === "sandstorm" && foeMonForAcc.ability === "Sand Veil") {
          effAcc *= 0.8;
        }
        return effAcc < 100
          ? [{ p: effAcc / 100, hit: true }, { p: 1 - effAcc / 100, hit: false }]
          : [{ p: 1, hit: true }];
      })();

      for (const ab of accBranches) {
        if (!ab.hit) {
          results.push({ p: p * ab.p, hit: false, selfHit: false, secondaryTriggered: false, statusPrevented: false, thawed: stb.thawed });
          continue;
        }
        if (moveData.effect === "EFFECT_SLEEP") {
          // Duration rolled ONCE at infliction: (Random() & 3) + 2 -> uniform
          // over {2,3,4,5}, 25% each (src/battle_script_commands.c:2481,
          // src/battle_util.c:1762 — same roll, two different infliction
          // sites). Enumerated fully per Lesson 1 even though, within this
          // engine's fixed 3-turn match, every value in {2,3,4,5} produces an
          // identical outcome (the minimum, 2, already exceeds the most
          // turns a victim could ever need to act again post-infliction) —
          // not collapsed as a shortcut, kept complete and source-faithful.
          for (const duration of [2, 3, 4, 5]) {
            results.push({ p: p * ab.p * 0.25, hit: true, selfHit: false, secondaryTriggered: false, statusPrevented: false, thawed: stb.thawed, sleepDuration: duration });
          }
          continue;
        }
        if (moveData.effect === "EFFECT_ATTRACT") {
          // Cmd_tryinfatuating's gender-compatibility check (see
          // EFFECT_EXECUTORS.EFFECT_ATTRACT) depends on each side's gender,
          // which for a variable-ratio mon with no fixed/config gender is
          // genuinely uncertain — enumerated here as its own branch (Lesson
          // 1: never re-roll it live in the executor) rather than resolved
          // as a single probability the way SECONDARY_EFFECT_CHANCE's fixed
          // percentages are below.
          const targetMon = actor === "you" ? ctx.opp : ctx.you;
          const userMon = actor === "you" ? ctx.you : ctx.opp;
          let pCompatible = 0;
          for (const u of userMon.genderDist) {
            for (const t of targetMon.genderDist) {
              if (u.gender !== "genderless" && t.gender !== "genderless" && u.gender !== t.gender) pCompatible += u.p * t.p;
            }
          }
          if (pCompatible > 0) {
            results.push({ p: p * ab.p * pCompatible, hit: true, selfHit: false, secondaryTriggered: false, statusPrevented: false, thawed: stb.thawed, attractGenderCompatible: true });
          }
          if (pCompatible < 1) {
            results.push({ p: p * ab.p * (1 - pCompatible), hit: true, selfHit: false, secondaryTriggered: false, statusPrevented: false, thawed: stb.thawed, attractGenderCompatible: false });
          }
          continue;
        }
        const hitDist = MULTI_HIT_DISTRIBUTION[moveData.effect];
        if (hitDist) {
          // Hit-count resolved ONCE per move use (never re-rolled per hit —
          // Cmd_setmultihitcounter runs a single time, before the loop even
          // starts). The per-hit damage/substitute/Endure mechanics live in
          // applyMove's loop; this branch only fixes how many iterations it runs.
          for (const { hits, p: hp } of hitDist) {
            if (hp > 0) results.push({ p: p * ab.p * hp, hit: true, selfHit: false, secondaryTriggered: false, statusPrevented: false, thawed: stb.thawed, hitCount: hits });
          }
          continue;
        }
        const chance = SECONDARY_EFFECT_CHANCE[moveName];
        const hasExecutor = !!EFFECT_EXECUTORS[moveData.effect];
        if (moveData.power > 0 && chance && hasExecutor) {
          results.push({ p: p * ab.p * (chance / 100), hit: true, selfHit: false, secondaryTriggered: true, statusPrevented: false, thawed: stb.thawed });
          results.push({ p: p * ab.p * (1 - chance / 100), hit: true, selfHit: false, secondaryTriggered: false, statusPrevented: false, thawed: stb.thawed });
        } else {
          results.push({ p: p * ab.p, hit: true, selfHit: false, secondaryTriggered: false, statusPrevented: false, thawed: stb.thawed });
        }
      }
    }
  }
  return results;
}

function resolveTurn(ctx, state, yourMove, oppMove) {
  const { you, opp } = ctx;
  const yourMoveData = MOVES[yourMove];
  const oppMoveData = MOVES[oppMove];
  // Priority beats Speed outright; only tie on priority falls back to Speed.
  // Paralysis quarters EFFECTIVE speed for this comparison only (source-
  // confirmed: applied at the turn-order comparison site, never permanently
  // altering the stored Speed stat) — status here is BEFORE either mon acts
  // this turn, which is the correct timing (order is locked in first).
  const weatherForSpeed = effectiveWeather(state, you, opp);
  const yourEffSpeed = effSpeed(you, state.youStatus, state.youStages.spe, weatherForSpeed);
  const oppEffSpeed = effSpeed(opp, state.oppStatus, state.oppStages.spe, weatherForSpeed);
  const yourPriority = yourMoveData.priority;
  const oppPriority = oppMoveData.priority;
  const order = yourPriority !== oppPriority
    ? (yourPriority > oppPriority ? ["you", "opp"] : ["opp", "you"])
    : (yourEffSpeed >= oppEffSpeed ? ["you", "opp"] : ["opp", "you"]);
  const results = [];
  state = freshTurnDamageTracking(state);

  const firstMove = order[0] === "you" ? yourMove : oppMove;
  const firstMoveData = order[0] === "you" ? yourMoveData : oppMoveData;
  const firstTargetCharging = order[0] === "you" ? state.oppCharging : state.youCharging;
  const firstOutcomes = enumerateActionOutcomes(ctx, state, order[0], firstMove, firstMoveData, firstTargetCharging, false);

  for (const fo of firstOutcomes) {
    let s = cloneState(state);
    applyMove(ctx, s, order[0], firstMove, fo.hit, fo.selfHit, fo.secondaryTriggered, fo.statusPrevented, fo.thawed, fo.endureTriggered, fo.sleepRemaining ?? null, fo.sleepDuration ?? null, fo.protectTriggered ?? false, fo.blockedByProtect ?? false, fo.attractPrevented ?? false, fo.attractGenderCompatible ?? null, fo.hitCount ?? null);
    const firstLabel = describeAction(order[0], firstMove, fo.hit, fo.selfHit, fo.statusPrevented, fo.attractPrevented, fo.hitCount ?? null);

    const firstActorHp = order[0] === "you" ? s.yourHpPct : s.oppHpPct;
    const secondActorHp = order[0] === "you" ? s.oppHpPct : s.yourHpPct;
    if (firstActorHp <= 0 || secondActorHp <= 0) {
      s.turn += 1;
      results.push({ p: fo.p, state: s, label: `${firstLabel} (opp never acts — KO)` });
      continue;
    }

    const secondMove = order[1] === "you" ? yourMove : oppMove;
    const secondMoveData = order[1] === "you" ? yourMoveData : oppMoveData;
    const secondTargetCharging = order[1] === "you" ? s.oppCharging : s.youCharging;
    const secondOutcomes = enumerateActionOutcomes(ctx, s, order[1], secondMove, secondMoveData, secondTargetCharging, true);

    for (const so of secondOutcomes) {
      let s2 = cloneState(s);
      applyMove(ctx, s2, order[1], secondMove, so.hit, so.selfHit, so.secondaryTriggered, so.statusPrevented, so.thawed, so.endureTriggered, so.sleepRemaining ?? null, so.sleepDuration ?? null, so.protectTriggered ?? false, so.blockedByProtect ?? false, so.attractPrevented ?? false, so.attractGenderCompatible ?? null, so.hitCount ?? null);
      const secondLabel = describeAction(order[1], secondMove, so.hit, so.selfHit, so.statusPrevented, so.attractPrevented, so.hitCount ?? null);
      if (s2.yourHpPct > 0 && s2.oppHpPct > 0) applyEndOfTurnEffects(ctx, s2);
      s2.turn += 1;
      results.push({ p: fo.p * so.p, state: s2, label: `${firstLabel}; ${secondLabel}` });
    }
  }

  return results;
}

function evaluateTerminal(state) {
  if (state.yourHpPct <= 0 && state.oppHpPct <= 0) return 0.5;
  if (state.yourHpPct <= 0) return 0;
  if (state.oppHpPct <= 0) return 1;

  const mindWin = state.mindYou > state.mindOpp ? 2 : state.mindYou < state.mindOpp ? 0 : 1;
  const skillWin = state.skillYou > state.skillOpp ? 2 : state.skillYou < state.skillOpp ? 0 : 1;
  const bodyWin = state.yourHpPct > state.oppHpPct ? 2 : state.yourHpPct < state.oppHpPct ? 0 : 1;
  const total = mindWin + skillWin + bodyWin;
  if (total > 3) return 1;
  if (total < 3) return 0;
  return 0.5;
}

// Secondary sort key for search()'s move ranking, used ONLY to break ties
// (see below) — never to override a genuine winProb difference. Estimates
// how much raw damage "you" would deal RIGHT NOW with this move, using the
// actual current stages/weather/status, the same calcDamage function used
// everywhere else. Status moves (power=0, e.g. Destiny Bond/Calm Mind) score
// 0 here — correct for tie-breaking purposes, since among moves that are
// ALL win-guaranteed (or all loss-guaranteed), an attacking move is always
// at least as informative a recommendation as a non-damaging one.
function moveTiebreakScore(ctx, state, moveName) {
  const moveData = MOVES[moveName];
  if (moveData.power === 0) return 0;
  const atkStatKey = moveData.category === "physical" ? "atk" : "spa";
  const defStatKey = moveData.category === "physical" ? "def" : "spd";
  const screenActive = moveData.category === "physical" ? state.oppReflectTurns != null : state.oppLightScreenTurns != null;
  return calcDamage(ctx.you, ctx.opp, moveName, {
    atkStage: state.youStages[atkStatKey], defStage: state.oppStages[defStatKey],
    attackerBurned: state.youStatus === "burn",
    attackerFlashFireActive: state.youFlashFireActive,
    attackerHpPct: state.yourHpPct,
    screenActive,
    weather: effectiveWeather(state, ctx.you, ctx.opp),
  });
}

function search(ctx, state, turnsRemaining) {
  if (turnsRemaining === 0 || state.yourHpPct <= 0 || state.oppHpPct <= 0) {
    return { winProb: evaluateTerminal(state), move: null, isTerminal: true, state };
  }

  // A charging mon (mid-Dive/Fly/Dig) has no real choice — the game forces
  // the same move again automatically (source-confirmed, no action menu).
  const oppCandidates = state.oppCharging
    ? [{ move: state.oppCharging.move, prob: 1 }]
    : chooseOpponentMoves(ctx.opp, ctx.you, state);
  const yourMoveChoices = state.youCharging ? [state.youCharging.move] : ctx.you.moves;

  const options = [];
  for (const yourMove of yourMoveChoices) {
    let expected = 0;
    const branches = [];
    for (const { move: oppMove, prob: oppProb } of oppCandidates) {
      const raw = resolveTurn(ctx, state, yourMove, oppMove);
      for (const b of raw) {
        const weight = b.p * oppProb;
        const sub = search(ctx, b.state, turnsRemaining - 1);
        expected += weight * sub.winProb;
        branches.push({ prob: weight, label: b.label, state: b.state, subtree: sub });
      }
    }
    branches.sort((a, b) => b.prob - a.prob);
    options.push({ move: yourMove, winProb: expected, branches });
  }
  // Primary key: winProb (descending) — the real decision criterion, never
  // overridden. Secondary key (ONLY within floating-point-noise distance,
  // e.g. two branches of a guaranteed win/loss that differ by ~1e-16 from
  // summation order): raw current damage, descending. Without this, a
  // stable sort on exactly-tied winProbs falls back to whatever order the
  // mon's moves happen to be listed in, which can surface a 0-damage
  // immune-type move as "the" recommendation purely by coincidence — a real
  // coaching-quality bug, not a scoring bug (the winProb itself was correct;
  // it's genuinely a guaranteed win/loss regardless of move, but the tool
  // must still recommend something sensible rather than something arbitrary).
  const WINPROB_TIE_EPSILON = 1e-6;
  options.sort((a, b) => {
    if (Math.abs(a.winProb - b.winProb) > WINPROB_TIE_EPSILON) return b.winProb - a.winProb;
    return moveTiebreakScore(ctx, state, b.move) - moveTiebreakScore(ctx, state, a.move);
  });

  return {
    move: options[0].move,
    winProb: options[0].winProb,
    isTerminal: false,
    allOptions: options,
    branches: options[0].branches,
  };
}

function printTree(node, indent = "", turnLabel = "Turn", minProb = 0.02) {
  if (node.isTerminal) {
    const s = node.state;
    console.log(`${indent}[end] you ${s.yourHpPct.toFixed(1)}% / opp ${s.oppHpPct.toFixed(1)}% ` +
      `| Mind ${s.mindYou}-${s.mindOpp} | Skill ${s.skillYou}-${s.skillOpp} ` +
      `| P(win)=${node.winProb.toFixed(2)}`);
    return;
  }
  console.log(`${indent}${turnLabel}: play ${node.move}  [P(win)=${node.winProb.toFixed(3)}]`);
  for (const branch of node.branches) {
    if (branch.prob < minProb) continue;
    console.log(`${indent}  ├─ (${(branch.prob * 100).toFixed(0)}%) ${branch.label}`);
    printTree(branch.subtree, indent + "  │    ", "then", minProb);
  }
}

// Public entry point: run a full 1v1 analysis given two mon configs and
// starting HP percentages. This is what a UI / another module would call.
// yourUsablePartyMons: a PER-MATCHUP INPUT, not a fixed constant — exactly
// like yourHpPct/oppHpPct above. It's how many of the player's OTHER 2 team
// slots are still alive going into THIS SPECIFIC matchup. Defaults to 2
// because a standalone analyzeMatchup() call has no run context and "fresh
// team, nothing fainted yet" is the only sane default — but a real 3-matchup
// Arena run must pass 2 for the first matchup, then 1 or 0 for later ones as
// earlier reserves faint (mirroring how yourHpPct carries a mon's damage
// forward). The team-workflow builder (HANDOFF §7 step 5) MUST decrement
// this across chained matchups, or every matchup after the first will silently
// score Roar/phazing moves as if the team were still fully healthy. Feeds
// EFFECT_ROAR's scoring (see chooseOpponentMoves) — the AI sees this real
// count, Arena-blind (see the source citation on AI_HANDLERS.EFFECT_ROAR).
// oppUsablePartyMons: the SAME per-matchup concept, mirrored for the
// opponent's own reserves — feeds AI_CBM_BatonPass's count_usable_party_mons
// (AI_USER) check. Defaults to 2 for the same reason; we don't currently
// model the opponent's full 3-mon Frontier roster (only the one named set
// being analyzed), so this is a simplifying assumption until that's tracked.
function analyzeMatchup(youConfig, oppConfig, { yourHpPct = 100, oppHpPct = 100, yourUsablePartyMons = 2, oppUsablePartyMons = 2 } = {}) {
  const you = buildMon(youConfig);
  // Frontier trainer mons are generated at max friendship (255) — a real,
  // verified fact about this dataset's source, not a convenience default —
  // so EFFECT_RETURN/EFFECT_FRUSTRATION resolve correctly for the opponent
  // side regardless of buildMon's own moveset-based guess (see buildMon).
  const opp = buildMon({ ...oppConfig, friendship: 255 });
  const ctx = { you, opp };
  const state = buildStartState({ yourHpPct, oppHpPct, yourUsablePartyMons, oppUsablePartyMons, you, opp });
  const result = search(ctx, state, 3);
  return { you, opp, result };
}

export {
  buildMon, calcDamage, calcConfusionDamage, typeEffectiveness,
  scoreOpponentMove, chooseOpponentMoves,
  buildStartState, resolveTurn, search, printTree,
  analyzeMatchup, MOVES, AI_HANDLERS, evaluateTerminal,
};

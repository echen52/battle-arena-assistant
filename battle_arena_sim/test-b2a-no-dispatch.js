// ── test-b2a-no-dispatch.js ───────────────────────────────────────────────
// B2a characterization, written LATE and labelled as such.
//
// PROCESS DEFECT THIS CLOSES. B2a (commit 5e13e2b) landed with no
// characterization test of its own: the suite stayed at 18 files and not one of
// them exercised Taunt, Wish, Teeter Dance, Ghost-Curse or the no-dispatch
// class. The brief's characterization-first rule says the behaviour of a
// changed surface is recorded as a test in the commit that changes it. It
// wasn't. This file records the behaviour as it stands rather than pretending
// it was recorded at the time; the values below are therefore first recordings
// taken after the fact, not the pre-change baseline the rule asks for.
//
// WHAT B2a DID.
// 1. The NO-DISPATCH class. Both AI chains (AI_CheckBadMove,
//    data/battle_ai_scripts.s:51-214; AI_CheckViability, :652-776) are linear
//    if_effect lists that end in a BARE `end`. Ten effects appear in NEITHER,
//    so they fall off the end with their 100 baseline untouched. Scoring them
//    at baseline IS the faithful port, not a fallback: Assist, Follow Me,
//    Grudge, Metronome, Mimic, Spite, Taunt, Teeter Dance, Transform, Wish.
// 2. Executors for Taunt, Teeter Dance, Wish, and the three
//    mechanically-inert-in-Arena no-ops (Grudge, Follow Me, Spite).
// 3. Ghost-Curse (data/battle_scripts_1.s:1511-1530), which made
//    ctx.targetCursed/userCursed reachable state for the first time.
import {
  applyMove, buildMon, buildStartState, chooseOpponentMoves, resolveTurn,
  skillDelta, analyzeMatchup, MOVES,
} from "./logic.js";
import { getOpponentConfig } from "./opponent-adapter.js";
import { FRONTIER_POOL } from "./frontier-pool.js";
import { LEADS, B2A } from "./anchors.js";

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } };

// The ten effects with no row in either chain, by a move that carries each.
const NO_DISPATCH_MOVES = {
  EFFECT_ASSIST: "Assist", EFFECT_FOLLOW_ME: "Follow Me", EFFECT_GRUDGE: "Grudge",
  EFFECT_METRONOME: "Metronome", EFFECT_MIMIC: "Mimic", EFFECT_SPITE: "Spite",
  EFFECT_TAUNT: "Taunt", EFFECT_TEETER_DANCE: "Teeter Dance",
  EFFECT_TRANSFORM: "Transform", EFFECT_WISH: "Wish",
};

const player = buildMon({ species: "Snorlax", level: 50, nature: "Adamant", evs: { hp: 252, atk: 252 },
  ability: "Thick Fat", item: "Leftovers", moves: ["Body Slam", "Earthquake", "Shadow Ball", "Rest"] });

console.log("-- PART 1: the no-dispatch ten score at the untouched 100 baseline --");
{
  // Every one of these is a status move (power 0), so AI_TryToFaint's simDmg
  // branch (gated on power > 1) cannot touch them either. A mon whose whole
  // moveset is no-dispatch effects must therefore come out EXACTLY uniform --
  // any handler firing on any of them would break the tie.
  for (const [effect, move] of Object.entries(NO_DISPATCH_MOVES)) {
    ok(MOVES[move] !== undefined, `${move} must exist in move-data.js`);
    ok(MOVES[move].effect === effect, `${move} must carry ${effect} (got ${MOVES[move]?.effect})`);
    ok(MOVES[move].power === 0, `${move} must be a status move -- the baseline argument depends on power === 0`);
  }

  const quad = ["Metronome", "Mimic", "Transform", "Assist"];
  const opp = buildMon({ species: "Clefable", level: 50, nature: "Bold", evs: { hp: 170, def: 170, spd: 170 },
    ability: "Cute Charm", item: "Leftovers", moves: quad, friendship: 255 });
  const dist = chooseOpponentMoves(opp, player, buildStartState({ you: player, opp }));
  ok(dist.length === quad.length, `all four no-dispatch moves must stay in play (got ${dist.length})`);
  const uniform = dist.every((d) => Math.abs(d.prob - 1 / quad.length) < 1e-12);
  ok(uniform, `a moveset of four no-dispatch effects must score EXACTLY uniform: ${dist.map((d) => `${d.move}@${d.prob.toFixed(6)}`).join(" ")}`);
  console.log(`   ${dist.map((d) => `${d.move}@${d.prob.toFixed(4)}`).join("  ")}`);

  // Control: swap one for a DISPATCHED status move and the tie must break.
  // Belly Drum is scored -2 by AI_CV_BellyDrum below 90% HP, so at 80% it
  // cannot still be uniform. If this control ever passes, PART 1's uniformity
  // is proving nothing.
  const mixed = buildMon({ ...opp, moves: ["Metronome", "Mimic", "Transform", "Belly Drum"] });
  const mixedDist = chooseOpponentMoves(mixed, player, buildStartState({ you: player, opp: mixed, overrides: { oppHpPct: 80 } }));
  ok(!mixedDist.every((d) => Math.abs(d.prob - 1 / 4) < 1e-12),
    "CONTROL: adding a dispatched effect must break the uniform tie");
}

console.log();
console.log("-- PART 2: Taunt removes status moves from SELECTION, both sides --");
{
  const taunter = buildMon({ species: "Murkrow", level: 50, nature: "Jolly", evs: { atk: 252, spe: 252 },
    ability: "Insomnia", item: "Leftovers", moves: ["Taunt", "Drill Peck", "Faint Attack", "Confuse Ray"], friendship: 255 });
  const ctx = { you: player, opp: taunter };

  const free = chooseOpponentMoves(taunter, player, buildStartState({ you: player, opp: taunter }));
  const tauntedState = buildStartState({ you: player, opp: taunter, overrides: { oppTauntTurns: 2 } });
  const taunted = chooseOpponentMoves(taunter, player, tauntedState);
  ok(free.some((d) => MOVES[d.move].power === 0), "the untaunted moveset must still contain status moves");
  ok(taunted.every((d) => MOVES[d.move].power > 0),
    `a taunted mon must not select ANY status move (got ${taunted.map((d) => d.move).join(", ")})`);
  console.log(`   free: ${free.map((d) => d.move).join(", ")}`);
  console.log(`   taunted: ${taunted.map((d) => d.move).join(", ")}`);

  // Cmd_settaunt sets tauntTimer = 2; a second Taunt while one runs fails.
  const s = buildStartState({ you: player, opp: taunter });
  applyMove(ctx, s, "opp", "Taunt", true, false);
  ok(s.youTauntTurns === 2, `Taunt must set the TARGET's timer to 2 (got ${s.youTauntTurns})`);
  ok(s.oppTauntTurns === null, "Taunt must not taunt its own user");
  const before = s.skillOpp;
  applyMove(ctx, s, "opp", "Taunt", true, false);
  ok(s.skillOpp - before === skillDelta("noEffect"),
    "a second Taunt while one is already running must FAIL, scoring Skill as noEffect");
}

console.log();
console.log("-- PART 3: Wish resolves one full turn later, so a turn-3 Wish never lands --");
{
  // A Ghost opponent so the player's Normal attack does 0 and HP movement is
  // attributable to Wish alone.
  const wisher = buildMon({ species: "Misdreavus", level: 50, nature: "Timid", evs: { hp: 170, spa: 170, spe: 170 },
    ability: "Levitate", item: "Leftovers", moves: ["Wish", "Shadow Ball", "Thunderbolt", "Psychic"], friendship: 255 });
  const ctx = { you: player, opp: wisher };
  const start = buildStartState({ you: player, opp: wisher, overrides: { oppHpPct: 40 } });
  ok(MOVES["Body Slam"].type === "Normal", "the zero-damage premise needs a Normal attack");

  const t1 = resolveTurn(ctx, start, "Body Slam", "Wish");
  ok(t1.length > 0, "turn 1 must produce at least one branch");
  const afterT1 = t1[0].state;
  ok(afterT1.oppWishTurns === 1,
    `Wish sets the counter to 2 and ENDTURN_WISH decrements it the same turn, so it must read 1 (got ${afterT1.oppWishTurns})`);
  const hpAfterT1 = afterT1.oppHpPct;

  const t2 = resolveTurn(ctx, afterT1, "Body Slam", "Shadow Ball");
  const afterT2 = t2[0].state;
  ok(afterT2.oppWishTurns === null, "the counter must be cleared once the wish resolves");
  const healed = afterT2.oppHpPct - hpAfterT1;
  ok(healed > 40, `the wish must heal about maxHP/2 on the FOLLOWING turn end (got ${healed.toFixed(3)} percentage points)`);
  console.log(`   opp HP: 40% -> ${hpAfterT1.toFixed(2)}% (turn 1, counter ${afterT1.oppWishTurns}) -> ${afterT2.oppHpPct.toFixed(2)}% (turn 2, wish resolves)`);

  // The Arena consequence: used on turn 3 there is no turn 4 to resolve it in.
  const t3start = buildStartState({ you: player, opp: wisher, overrides: { oppHpPct: 40, turn: 3 } });
  const t3 = resolveTurn(ctx, t3start, "Body Slam", "Wish");
  ok(t3[0].state.oppWishTurns === 1,
    "a turn-3 Wish still only decrements to 1 -- Arena judgment follows that same end-of-turn pass, so it never heals");
}

console.log();
console.log("-- PART 4: Ghost-Curse costs the user half and bleeds the target a quarter --");
{
  const dusclops = buildMon({ species: "Dusclops", level: 50, nature: "Careful", evs: { hp: 170, def: 170, spd: 170 },
    ability: "Pressure", item: "Leftovers", moves: ["Curse", "Shadow Ball", "Will-O-Wisp", "Rest"], friendship: 255 });
  const ctx = { you: player, opp: dusclops };
  const s = buildStartState({ you: player, opp: dusclops });
  applyMove(ctx, s, "opp", "Curse", true, false);
  ok(s.youCursed === true, "Ghost-Curse must set the TARGET's cursed flag");
  const cost = 100 - s.oppHpPct;
  const expected = (Math.max(1, Math.floor(dusclops.stats.hp / 2)) / dusclops.stats.hp) * 100;
  ok(Math.abs(cost - expected) < 1e-9,
    `the USER must pay floor(maxHP/2) (paid ${cost.toFixed(4)}%, expected ${expected.toFixed(4)}%)`);
  console.log(`   Dusclops maxHP ${dusclops.stats.hp}: pays ${cost.toFixed(2)}% to curse`);

  // A second Curse into an already-cursed target fails.
  const before = s.skillOpp;
  applyMove(ctx, s, "opp", "Curse", true, false);
  ok(s.skillOpp - before === skillDelta("noEffect"), "Curse into an already-cursed target must fail");

  // Substitute blocks it outright.
  const subbed = buildStartState({ you: player, opp: dusclops, overrides: { youSubstituteHP: 40 } });
  const subBefore = subbed.skillOpp;
  applyMove(ctx, subbed, "opp", "Curse", true, false);
  ok(subbed.youCursed === false, "Ghost-Curse must not get through a Substitute");
  ok(subbed.skillOpp - subBefore === skillDelta("noEffect"), "...and must score as a failure when it does not");

  // The residual: maxHP/4 per end-of-turn on the cursed side.
  const cursedStart = buildStartState({ you: player, opp: dusclops, overrides: { youCursed: true } });
  const after = resolveTurn(ctx, cursedStart, "Rest", "Shadow Ball")[0].state;
  ok(after.yourHpPct < 100 - 20, `a cursed mon must bleed about maxHP/4 each turn (ended at ${after.yourHpPct.toFixed(2)}%)`);

  // The flag is not just tracked -- it is READ by the AI. EFFECT_EVASION_UP's
  // AI_CV_EvasionUp block 6 keys off targetCursed, so the same mon's move
  // distribution must differ once the player is cursed.
  const evasive = buildMon({ species: "Umbreon", level: 50, nature: "Bold", evs: { hp: 170, def: 170, spd: 170 },
    ability: "Synchronize", item: "Leftovers", moves: ["Double Team", "Confuse Ray", "Faint Attack", "Toxic"], friendship: 255 });
  const d = (ov) => chooseOpponentMoves(evasive, player, buildStartState({ you: player, opp: evasive, overrides: ov }))
    .map((x) => `${x.move}@${x.prob.toFixed(6)}`).join(" | ");
  ok(d(null) !== d({ youCursed: true }), "ctx.targetCursed must be LIVE -- the AI distribution must move when the player is cursed");
  console.log(`   uncursed: ${d(null)}`);
  console.log(`   cursed  : ${d({ youCursed: true })}`);
}

console.log();
console.log("-- PART 5: the three Arena-inert no-ops report LANDED, not FAILED --");
{
  // Grudge, Follow Me and Spite change nothing here for reasons that are about
  // the RULESET, not about being unimplemented: PP is not modelled and three
  // turns cannot exhaust it (Spite/Grudge), and Follow Me is a doubles-only
  // redirect. They still LAND, so Arena Skill must score them landed -- calling
  // them "failed" would be a scoring error, not a conservative default.
  const ghost = buildMon({ species: "Banette", level: 50, nature: "Adamant", evs: { hp: 170, atk: 170, spe: 170 },
    ability: "Insomnia", item: "Leftovers", moves: ["Spite", "Grudge", "Shadow Ball", "Faint Attack"], friendship: 255 });
  const ctx = { you: player, opp: ghost };
  for (const move of ["Spite", "Grudge"]) {
    const s = buildStartState({ you: player, opp: ghost });
    const before = s.skillOpp;
    applyMove(ctx, s, "opp", move, true, false);
    ok(s.skillOpp - before === skillDelta("landed"), `${move} must score Arena Skill as LANDED, not noEffect`);
  }
  console.log(`   skillDelta(landed) = ${skillDelta("landed")}, skillDelta(noEffect) = ${skillDelta("noEffect")}`);
}

console.log();
console.log("-- PART 6: recorded behaviour of the sets B2a made solvable --");
{
  const origWarn = console.warn; console.warn = () => {};
  for (const [name, a] of Object.entries(B2A)) {
    const e = FRONTIER_POOL[name];
    const opts = { ...(e.abilities.length > 1 ? { ability: e.abilities[0] } : {}) };
    if (!e.brain) opts.ivTier = a.tier;
    const { result } = analyzeMatchup(LEADS[a.lead], getOpponentConfig(name, opts));
    ok(result.move === a.move, `${name} IV${a.tier} vs ${a.lead}: move ${result.move} !== ${a.move}`);
    ok(result.winProb === a.winProb, `${name} IV${a.tier} vs ${a.lead}: winProb ${result.winProb} !== ${a.winProb}`);
  }
  console.warn = origWarn;
  console.log(`   ${Object.keys(B2A).length} cells asserted (recorded after the fact -- see this file's header)`);
}

console.log();
console.log(failures === 0 ? "ALL PASS -- B2a characterization green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

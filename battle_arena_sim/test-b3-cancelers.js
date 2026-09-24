// ── test-b3-cancelers.js ──────────────────────────────────────────────────
// B3 batch 2: the canceler chain, resolved once, on the selected move.
//
// AtkCanceler_UnableToUseMove (src/battle_util.c:2003-2270) runs in a fixed
// order and stops at the first check that fires:
//   ASLEEP -> FROZEN -> TRUANT -> RECHARGE -> FLINCH -> DISABLED -> TAUNTED ->
//   IMPRISONED -> CONFUSED -> PARALYZED -> IN_LOVE
// This file pins the parts this batch added or moved:
//   PART 1  Fake Out: a certain flinch, and only on the user's first turn
//   PART 2  the flinch's blockers: Inner Focus, Shield Dust, a Substitute
//   PART 3  Disable, Taunt and Imprison at CANCEL time, not only selection
//   PART 4  sleep and freeze stop a Mirror Move user (they used to be skipped)
//   PART 5  Mind is scored on the SELECTED move, not the called one
//   PART 6  CancelMultiTurnMoves: which cancels end a Fury Cutter chain or a
//           charge, and which (full paralysis) do not
//   PART 7  a recharge pre-empted by sleep expires with its timer
import { buildMon, buildStartState, resolveTurn, mindDelta, skillDelta } from "./logic.js";

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } };

const mk = (species, moves, over = {}) => buildMon({
  species, level: 50, nature: "Adamant", evs: { hp: 252, atk: 252 },
  ability: "Pressure", item: null, moves, friendship: 255, ...over,
});
const start = (you, opp, overrides = {}) => buildStartState({ you, opp, overrides });
const turn = (you, opp, state, yourMove, oppMove) => resolveTurn({ you, opp }, state, yourMove, oppMove);

// A slow, bulky target with a damaging move, so "it did nothing" is visible
// as the Fake Out user's HP staying at 100.
const slow = mk("Snorlax", ["Body Slam", "Growl", "Rest", "Splash"], { ability: "Thick Fat" });

console.log("-- PART 1: Fake Out flinches, on the first turn only --");
{
  const fo = mk("Hitmonchan", ["Fake Out", "Mach Punch", "Protect", "Splash"], { ability: "Keen Eye" });
  const brs = turn(slow, fo, start(slow, fo), "Body Slam", "Fake Out");
  ok(brs.length === 1, `a 100%-accurate Fake Out against a slower foe is one branch (got ${brs.length})`);
  const b = brs[0];
  ok(/You flinches/.test(b.label), `the slower mon must flinch (label: ${b.label})`);
  ok(b.state.oppHpPct === 100, "the flinched Body Slam must do nothing");
  ok(b.state.youFlinched === false, "the flag must not survive the turn (src/battle_main.c:3943)");
  // Mind is still scored for the move it SELECTED (HandleAction_UseMove, before
  // the canceler); Skill is not (HITMARKER_OBEYS is never set).
  ok(b.state.mindYou === mindDelta("Body Slam"), "the flinched mon still scores Mind for Body Slam");
  ok(b.state.skillYou === 0, "...and nothing for Skill");

  // Turn 2: the same Fake Out FAILS.
  const t2 = turn(slow, fo, b.state, "Body Slam", "Fake Out");
  ok(t2.every((x) => !/flinches/.test(x.label)), "a second-turn Fake Out must not flinch");
  ok(t2.every((x) => x.state.yourHpPct === b.state.yourHpPct), "...and must do no damage");
  ok(t2.every((x) => x.state.skillOpp - b.state.skillOpp === skillDelta("noEffect")),
    "...and must score as a FAILED move");

  // Turn 2 into Protect: attackcanceler's Protect check runs BEFORE
  // jumpifnotfirstturn, so it is PROTECTED, not failed -- Skill unchanged.
  const protector = mk("Snorlax", ["Protect", "Body Slam", "Rest", "Splash"], { ability: "Thick Fat" });
  const pt = turn(protector, fo, { ...b.state }, "Protect", "Fake Out");
  const blocked = pt.filter((x) => /Protect/.test(x.label) && x.state.skillOpp === b.state.skillOpp);
  ok(blocked.length >= 1, "a late Fake Out into a working Protect is PROTECTED (Skill unchanged), not failed");
  console.log(`   turn 1: ${b.label}`);
  console.log(`   turn 2: ${t2[0].label}`);
}

console.log();
console.log("-- PART 2: what stops the flinch --");
{
  const fo = mk("Hitmonchan", ["Fake Out", "Mach Punch", "Protect", "Splash"], { ability: "Keen Eye" });
  for (const ability of ["Inner Focus", "Shield Dust"]) {
    const t = mk("Snorlax", ["Body Slam", "Growl", "Rest", "Splash"], { ability });
    const b = turn(t, fo, start(t, fo), "Body Slam", "Fake Out")[0];
    ok(!/flinches/.test(b.label) && b.state.oppHpPct < 100, `${ability} must block the flinch (label: ${b.label})`);
  }
  // A Substitute blocks it -- including one the Fake Out itself breaks, because
  // STATUS2_SUBSTITUTE stays set until the end of the turn.
  const intact = turn(slow, fo, start(slow, fo, { youSubstituteHP: 200 }), "Body Slam", "Fake Out")[0];
  ok(!/flinches/.test(intact.label), "an intact Substitute must block the flinch");
  const fragile = turn(slow, fo, start(slow, fo, { youSubstituteHP: 1 }), "Body Slam", "Fake Out")[0];
  ok(fragile.state.youSubstituteHP == null, "(probe check) the 1-HP sub must break");
  ok(!/flinches/.test(fragile.label), "a Substitute broken by the Fake Out itself must STILL block the flinch");
  console.log("   Inner Focus, Shield Dust, an intact sub and a just-broken sub all block it");
}

console.log();
console.log("-- PART 3: Disable, Taunt and Imprison at the moment of use --");
{
  const jolt = mk("Jolteon", ["Disable", "Taunt", "Imprison", "Splash"], { ability: "Volt Absorb" });
  // Disable is 55% accurate in Gen III, so only the branches where it LANDED
  // disable anything; the rest are the control.
  const disAll = turn(slow, jolt, start(slow, jolt, { youLastMove: "Body Slam" }), "Body Slam", "Disable");
  const dis = disAll.filter((b) => b.state.youDisabledMove === "Body Slam");
  ok(dis.length >= 1 && disAll.length > dis.length, "(probe check) Disable must both land and miss");
  ok(dis.every((b) => b.state.oppHpPct === 100), "a Body Slam disabled by a FASTER foe this turn must do nothing");
  ok(dis.every((b) => /disabled Body Slam/.test(b.label)), `...and say why (${dis[0].label})`);
  ok(disAll.filter((b) => !dis.includes(b)).every((b) => b.state.oppHpPct < 100),
    "(control) where Disable missed, the Body Slam lands");

  const tau = turn(slow, jolt, start(slow, jolt), "Growl", "Taunt");
  ok(tau.every((b) => b.state.oppStages.atk === 0), "a Growl taunted by a FASTER foe this turn must do nothing");
  ok(tau.every((b) => /after the taunt/.test(b.label)), `...and say why (${tau[0].label})`);
  // Taunt tests power == 0, so a damaging move goes through.
  const tauHit = turn(slow, jolt, start(slow, jolt), "Body Slam", "Taunt");
  ok(tauHit.some((b) => b.state.oppHpPct < 100), "(control) a taunted Body Slam still lands");

  // Imprison: the imprisoner must KNOW the move. Give it Splash and have the
  // slower mon pick Splash.
  const imp = turn(slow, jolt, start(slow, jolt), "Splash", "Imprison");
  ok(imp.every((b) => /sealed Splash/.test(b.label)), `a shared move must be sealed at use (${imp[0].label})`);
  console.log(`   ${dis[0].label}`);
  console.log(`   ${tau[0].label}`);
  console.log(`   ${imp[0].label}`);
}

console.log();
console.log("-- PART 4: sleep and freeze stop a Mirror Move user --");
{
  const pid = mk("Pidgeot", ["Mirror Move", "Splash", "Rest", "Wing Attack"], { ability: "Keen Eye" });
  const asleep = turn(slow, pid, start(slow, pid, { oppStatus: "sleep", oppSleepTurns: 3, oppLastTakenMove: "Body Slam" }), "Splash", "Mirror Move");
  ok(asleep.every((b) => b.state.yourHpPct === 100), "a SLEEPING Mirror Move user must not act");
  ok(asleep.every((b) => b.state.oppSleepTurns === 2), "...and its sleep counter must tick");
  const frozen = turn(slow, pid, start(slow, pid, { oppStatus: "freeze", oppLastTakenMove: "Body Slam" }), "Splash", "Mirror Move");
  const stuck = frozen.filter((b) => b.state.oppStatus === "freeze").reduce((a, b) => a + b.p, 0);
  ok(Math.abs(stuck - 0.8) < 1e-9, `a FROZEN Mirror Move user must stay frozen 80% of the time (got ${stuck})`);
  console.log(`   asleep: counter 3 -> 2, no action; frozen: stays frozen with p=${stuck.toFixed(2)}`);
}

console.log();
console.log("-- PART 5: Mind is scored on the move SELECTED --");
{
  const pid = mk("Pidgeot", ["Mirror Move", "Splash", "Rest", "Wing Attack"], { ability: "Keen Eye" });
  ok(mindDelta("Mirror Move") !== mindDelta("Body Slam"), "(probe check) the two must rate differently");
  const brs = turn(slow, pid, start(slow, pid, { oppLastTakenMove: "Body Slam" }), "Splash", "Mirror Move");
  const called = brs.filter((b) => /Mirror Move -> Body Slam/.test(b.label));
  ok(called.length >= 1, "(probe check) Mirror Move must call Body Slam");
  ok(called.every((b) => b.state.mindOpp === mindDelta("Mirror Move")),
    `Mind must follow Mirror Move (${mindDelta("Mirror Move")}), not the called Body Slam (${mindDelta("Body Slam")})`);
  console.log(`   Mirror Move -> Body Slam scores Mind ${called[0].state.mindOpp}`);
}

console.log();
console.log("-- PART 6: CancelMultiTurnMoves -- who ends a Fury Cutter chain --");
{
  const sci = mk("Scizor", ["Fury Cutter", "Splash", "Rest", "Agility"], { ability: "Swarm" });
  const fo = mk("Hitmonchan", ["Fake Out", "Mach Punch", "Protect", "Splash"], { ability: "Keen Eye" });
  // Scizor is the PLAYER here so the Fake Out user (the opponent) is faster.
  const flinched = turn(sci, fo, start(sci, fo, { youFuryCutter: 3 }), "Fury Cutter", "Fake Out")[0];
  ok(/You flinches/.test(flinched.label), "(probe check) the Fury Cutter user must flinch");
  ok(flinched.state.youFuryCutter === 0, "a FLINCH must end the Fury Cutter chain (src/battle_util.c:2115)");

  // Full paralysis must NOT: its CancelMultiTurnMoves is commented out in
  // Emerald (:2192-2193).
  const para = turn(sci, slow, start(sci, slow, { youFuryCutter: 3, youStatus: "paralysis" }), "Fury Cutter", "Splash");
  const paraBlocked = para.filter((b) => /You is fully paralyzed/.test(b.label));
  ok(paraBlocked.length >= 1, "(probe check) a full-paralysis branch must exist");
  ok(paraBlocked.every((b) => b.state.youFuryCutter === 3), "full paralysis must NOT end the chain");

  // Protect ends it (Cmd_attackcanceler, src/battle_script_commands.c:996).
  const prot = mk("Snorlax", ["Protect", "Body Slam", "Rest", "Splash"], { ability: "Thick Fat" });
  const pr = turn(sci, prot, start(sci, prot, { youFuryCutter: 3 }), "Fury Cutter", "Protect");
  const intoProtect = pr.filter((b) => b.state.oppHpPct === 100 && b.state.youFuryCutter !== 4);
  ok(intoProtect.length >= 1 && intoProtect.every((b) => b.state.youFuryCutter === 0),
    "a Fury Cutter into a working Protect must end the chain");

  // And a flinch cancels a pending two-turn release: the charge is lost. Not
  // Fly -- a mon mid-Fly is airborne and the Fake Out simply misses it. A
  // charging SolarBeam user stays on the ground.
  const sb = mk("Venusaur", ["SolarBeam", "Splash", "Rest", "Razor Leaf"], { ability: "Overgrow" });
  const charged = start(sb, fo, { youCharging: { move: "SolarBeam", invulnBit: null } });
  const lost = turn(sb, fo, charged, "SolarBeam", "Fake Out")[0];
  ok(/You flinches/.test(lost.label), `(probe check) the SolarBeam user must flinch (${lost.label})`);
  ok(lost.state.youCharging === null && lost.state.oppHpPct === 100,
    "a flinch must cancel the pending SolarBeam, and it must not fire");
  // (control) unflinched, the same release fires.
  const fired = turn(sb, slow, charged, "SolarBeam", "Splash");
  ok(fired.some((b) => b.state.oppHpPct < 100), "(control) an unflinched SolarBeam release lands");
  console.log("   flinch: chain 3 -> 0; full para: stays 3; Protect: -> 0; flinched SolarBeam: charge lost");
}

console.log();
console.log("-- PART 7: a recharge that sleep pre-empts expires with its timer --");
{
  // Sleep sits ABOVE recharge in the chain, so a recharging mon that is asleep
  // is stopped by SLEEP, its counter ticks, and the recharge is not spent --
  // but rechargeTimer runs out at the end of that turn, so it is gone after.
  const hb = mk("Snorlax", ["Hyper Beam", "Body Slam", "Rest", "Splash"], { ability: "Thick Fat" });
  const st = start(slow, hb, { oppMustRecharge: "Hyper Beam", oppRechargeTimer: 1, oppStatus: "sleep", oppSleepTurns: 3 });
  const brs = turn(slow, hb, st, "Splash", "Hyper Beam");
  ok(brs.every((b) => !/must recharge/.test(b.label)), "sleep, not the recharge, must be what stops it");
  ok(brs.every((b) => b.state.oppSleepTurns === 2), "the sleep counter must tick");
  ok(brs.every((b) => b.state.oppMustRecharge === null), "the recharge must expire with its timer at turn end");
  console.log(`   ${brs[0].label}; recharge afterwards: ${brs[0].state.oppMustRecharge}`);
}

console.log();
console.log(failures === 0 ? "ALL PASS -- B3 batch 2 characterization green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

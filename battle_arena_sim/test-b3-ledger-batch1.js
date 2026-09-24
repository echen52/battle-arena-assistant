// ── test-b3-ledger-batch1.js ──────────────────────────────────────────────
// B3 batch 1: six effects LEAVE the accepted-unmodelled ledger.
//
// Each had been ledgered for a reason, and in two cases the reason had expired
// without anyone noticing -- which is the argument for re-reading a ledger
// rather than trusting it:
//   EFFECT_KNOCK_OFF     needed mutable items, which batch 10 built
//   EFFECT_SMELLINGSALT  needed a damage multiplier, which batch 9 built
//   the other four needed nothing but the work.
//
//   EFFECT_BRICK_BREAK     clears BOTH screens, before its OWN damage
//   EFFECT_OVERHEAT        user SpAtk -2, CERTAIN
//   EFFECT_SUPERPOWER      user Atk -1 and Def -1, CERTAIN
//   EFFECT_KNOCK_OFF       removes the target's item, Sticky Hold blocks
//   EFFECT_SMELLINGSALT    2x into paralysis, and cures it
//   EFFECT_RECOIL_IF_MISS  crash damage on a MISS, capped at target maxHP/2
//   EFFECT_FOCUS_PUNCH     priority -3, and loses focus if damaged first
//   EFFECT_RECHARGE        the user forfeits its NEXT action entirely
import { buildMon, buildStartState, resolveTurn, calcDamage, search, mindDelta } from "./logic.js";

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } };

const mk = (species, moves, over = {}) => buildMon({
  species, level: 50, nature: "Adamant", evs: { hp: 252, atk: 252 },
  ability: "Pressure", item: null, moves, friendship: 255, ...over,
});
const IDLE = "Splash";
const you = mk("Snorlax", [IDLE, "Body Slam", "Growl", "Shadow Ball"]);

console.log("-- PART 1: Brick Break breaks the screen it is hitting through --");
{
  const bb = mk("Machamp", ["Brick Break", "Cross Chop", "Rest", "Rock Slide"], { ability: "Guts" });
  const ctx = { you, opp: bb };
  const screened = buildStartState({ you, opp: bb, overrides: { youReflectTurns: 5, youLightScreenTurns: 5 } });
  const after = resolveTurn(ctx, screened, IDLE, "Brick Break")[0].state;
  ok(after.youReflectTurns === null && after.youLightScreenTurns === null,
    "Brick Break must clear BOTH screens");

  // And the damage it deals is computed with them ALREADY GONE: source runs
  // removelightscreenreflect BEFORE damagecalc. So the same Brick Break does
  // the same damage whether or not a Reflect was up.
  const dmgThroughScreen = 100 - resolveTurn(ctx, screened, IDLE, "Brick Break")[0].state.yourHpPct;
  const bare = buildStartState({ you, opp: bb });
  const dmgBare = 100 - resolveTurn(ctx, bare, IDLE, "Brick Break")[0].state.yourHpPct;
  ok(Math.abs(dmgThroughScreen - dmgBare) < 1e-9,
    `Brick Break must ignore the Reflect it just broke (${dmgThroughScreen.toFixed(1)}% vs ${dmgBare.toFixed(1)}%)`);

  // A control: an ordinary Fighting move IS halved by the same Reflect.
  const cc = 100 - resolveTurn(ctx, screened, IDLE, "Cross Chop")[0].state.yourHpPct;
  const ccBare = 100 - resolveTurn(ctx, bare, IDLE, "Cross Chop")[0].state.yourHpPct;
  ok(cc < ccBare, `(control) Cross Chop must be halved by Reflect (${cc.toFixed(1)}% vs ${ccBare.toFixed(1)}%)`);
  console.log(`   Brick Break ${dmgBare.toFixed(1)}% either way; Cross Chop ${ccBare.toFixed(1)}% -> ${cc.toFixed(1)}% under Reflect`);
}

console.log();
console.log("-- PART 2: the CERTAIN self-drops, which are not chance secondaries --");
{
  const oh = mk("Camerupt", ["Overheat", "Earthquake", "Rest", "Rock Slide"], { ability: "Magma Armor" });
  const brs = resolveTurn({ you, opp: oh }, buildStartState({ you, opp: oh }), IDLE, "Overheat");
  const landed = brs.filter((b) => b.state.yourHpPct < 100);
  ok(landed.length >= 1, "(probe check) Overheat must land somewhere");
  ok(landed.every((b) => b.state.oppStages.spa === -2),
    "EVERY landing branch must leave the user at -2 SpAtk -- it is CERTAIN, not a chance");

  const sp = mk("Machamp", ["Superpower", "Cross Chop", "Rest", "Rock Slide"], { ability: "Guts" });
  const sbrs = resolveTurn({ you, opp: sp }, buildStartState({ you, opp: sp }), IDLE, "Superpower");
  const slanded = sbrs.filter((b) => b.state.yourHpPct < 100);
  ok(slanded.every((b) => b.state.oppStages.atk === -1 && b.state.oppStages.def === -1),
    "Superpower must leave its user at -1 Atk AND -1 Def");
  console.log("   Overheat -2 SpAtk and Superpower -1/-1 on every landing branch");
}

console.log();
console.log("-- PART 3: Knock Off, now that items can move --");
{
  const holder = mk("Snorlax", [IDLE, "Body Slam", "Growl", "Shadow Ball"], { item: "Leftovers" });
  const ko = mk("Sneasel", ["Knock Off", "Quick Attack", "Rest", "Bite"], { ability: "Keen Eye" });
  const b = resolveTurn({ you: holder, opp: ko }, buildStartState({ you: holder, opp: ko }), IDLE, "Knock Off")[0];
  ok(b.state.youItemOverride === null, "Knock Off must remove the target's item");
  ok(b.state.oppItemOverride === undefined, "...without giving it to the attacker, unlike Thief");
  ok(b.state.youUsedItem === null,
    "...and it must NOT go into the used-item slot -- knocked off is not consumed, so Recycle cannot get it back");

  const sticky = mk("Swalot", [IDLE, "Body Slam", "Rest", "Toxic"], { ability: "Sticky Hold", item: "Leftovers" });
  const b2 = resolveTurn({ you: sticky, opp: ko }, buildStartState({ you: sticky, opp: ko }), IDLE, "Knock Off")[0];
  ok(b2.state.youItemOverride === undefined, "Sticky Hold must block it");
  console.log("   item removed, not stolen, not recyclable; Sticky Hold blocks");
}

console.log();
console.log("-- PART 4: Smelling Salt doubles into paralysis and then cures it --");
{
  const ss = mk("Hariyama", ["SmellingSalt", "Cross Chop", "Rest", "Rock Slide"], { ability: "Thick Fat" });
  const ctx = { you, opp: ss };
  const healthy = buildStartState({ you, opp: ss });
  const paralysed = buildStartState({ you, opp: ss, overrides: { youStatus: "paralysis" } });

  const dHealthy = 100 - resolveTurn(ctx, healthy, IDLE, "SmellingSalt")[0].state.yourHpPct;
  const parBranches = resolveTurn(ctx, paralysed, IDLE, "SmellingSalt");
  const hit = parBranches.find((b) => b.state.yourHpPct < 100);
  const dPar = 100 - hit.state.yourHpPct;
  ok(dPar > dHealthy * 1.8, `it must roughly double into paralysis (${dHealthy.toFixed(1)}% -> ${dPar.toFixed(1)}%)`);
  ok(hit.state.youStatus === null, "...and cure the paralysis it just exploited");
  console.log(`   ${dHealthy.toFixed(1)}% vs a healthy target, ${dPar.toFixed(1)}% vs a paralysed one -- then the paralysis is gone`);
}

console.log();
console.log("-- PART 5: Hi Jump Kick crashes on a miss --");
{
  // Its own accuracy is 90, so a miss branch exists without any evasion games.
  const hjk = mk("Hitmonlee", ["Hi Jump Kick", "Mega Kick", "Rest", "Rock Slide"], { ability: "Limber" });
  const ctx = { you, opp: hjk };
  const brs = resolveTurn(ctx, buildStartState({ you, opp: hjk }), IDLE, "Hi Jump Kick");
  const missed = brs.filter((b) => b.state.yourHpPct === 100);
  ok(missed.length >= 1, "(probe check) a miss branch must exist");
  ok(missed.every((b) => b.state.oppHpPct < 100), "a missed Hi Jump Kick must CRASH its user");

  // Capped at the TARGET's maxHP/2, and skipped entirely against an immune
  // target -- Fighting does nothing to a Ghost, and source jumps past the crash.
  const ghost = mk("Gengar", [IDLE, "Shadow Ball", "Rest", "Confuse Ray"], { ability: "Levitate" });
  const gbrs = resolveTurn({ you: ghost, opp: hjk }, buildStartState({ you: ghost, opp: hjk }), IDLE, "Hi Jump Kick");
  ok(gbrs.every((b) => b.state.oppHpPct === 100),
    "but it must NOT crash against a target it cannot affect at all");
  const crash = 100 - missed[0].state.oppHpPct;
  console.log(`   crash costs ${crash.toFixed(1)}% on a miss; no crash at all into a Ghost`);
}

console.log();
console.log("-- PART 6: the two that cost a TURN rather than HP --");
{
  // FOCUS PUNCH. `jumpifnodamage` is the first instruction after attackcanceler
  // (data/battle_scripts_1.s:2258-2265), and its priority -3 is already in the
  // move table -- so it naturally moves last and the check is reachable.
  const fp = mk("Breloom", ["Focus Punch", "Spore", "Rest", "Giga Drain"], { ability: "Effect Spore" });
  const ctx = { you, opp: fp };
  const hitFirst = resolveTurn(ctx, buildStartState({ you, opp: fp }), "Body Slam", "Focus Punch");
  ok(hitFirst.every((b) => b.state.yourHpPct === 100),
    "a Focus Punch user that was damaged first must lose focus and do NOTHING");
  const unharassed = resolveTurn(ctx, buildStartState({ you, opp: fp }), IDLE, "Focus Punch");
  ok(unharassed.some((b) => b.state.yourHpPct < 100),
    "...while an unharassed one must land its 150 power");
  console.log("   damaged first: nothing at all; left alone: the full 150 power lands");

  // RECHARGE. CANCELER_RECHARGE (src/battle_util.c:2098-2108) sits near the TOP
  // of the cancel chain -- above flinch, disable, confusion and paralysis -- so
  // the forfeited turn is ONE branch with no rolls of any kind underneath it.
  const hb = mk("Snorlax", ["Hyper Beam", "Body Slam", "Rest", "Earthquake"], { ability: "Thick Fat" });
  const hctx = { you, opp: hb };
  const fired = resolveTurn(hctx, buildStartState({ you, opp: hb }), IDLE, "Hyper Beam")[0];
  ok(fired.state.oppRecharge?.move === "Hyper Beam",
    "a landed Hyper Beam must leave its user needing to recharge, LOCKED to that move (gLockedMoves)");
  const hpAfterBeam = fired.state.yourHpPct;
  const next = resolveTurn(hctx, fired.state, IDLE, "Body Slam");
  // NOT a branch-count assertion: both mons here are Snorlax, so the turn ORDER
  // is an exact speed tie and B7c-3 splits it 0.5/0.5. The recharge itself adds
  // no branch, which is the actual claim -- every branch must show the
  // recharging mon doing nothing.
  ok(next.every((b) => b.state.yourHpPct === hpAfterBeam),
    "the recharging mon must do nothing at all, on every branch");
  ok(next.every((b) => b.state.oppRecharge === null),
    "...and the recharge must be spent on that one turn");
  // Mind is scored on the LOCKED move, again: HandleAction_UseMove sets
  // gCurrentMove = gLockedMoves (src/battle_util.c:107-110) and then banks
  // sMindRatings[gCurrentMove] (:289) before the canceler ever runs.
  // Asked to "use" Rest, which rates differently -- so this cannot pass by
  // coincidence of equal ratings, as a Body Slam probe would (both rate 1).
  ok(mindDelta("Rest") !== mindDelta("Hyper Beam"), "(probe check) Rest and Hyper Beam must rate differently");
  const asRest = resolveTurn(hctx, fired.state, IDLE, "Rest");
  ok(asRest.every((b) => b.state.mindOpp - fired.state.mindOpp === mindDelta("Hyper Beam")),
    "the recharge turn must score Mind for the LOCKED Hyper Beam, not the move passed in");
  ok(asRest.every((b) => b.state.skillOpp === fired.state.skillOpp),
    "...no Skill: HITMARKER_OBEYS is never set on a cancelled attempt");

  // NO CHOICE, on either side (src/battle_main.c:4160-4165: no action menu).
  // The AI is not consulted, so every branch of every option is Hyper Beam's
  // recharge; the player's search offers exactly ONE option.
  const oppTree = search(hctx, fired.state, 1);
  ok(oppTree.allOptions.every((o) => o.branches.every((b) => /Opp must recharge/.test(b.label))),
    "a recharging OPPONENT must be forced, not re-chosen by the AI");
  const beamer = mk("Snorlax", ["Hyper Beam", "Body Slam", "Growl", "Shadow Ball"], { ability: "Thick Fat" });
  const foe = mk("Machamp", ["Cross Chop", "Rest", "Rock Slide", "Bulk Up"], { ability: "Guts" });
  const youFired = resolveTurn({ you: beamer, opp: foe }, buildStartState({ you: beamer, opp: foe }), "Hyper Beam", "Rest")
    .find((b) => b.state.youRecharge?.move === "Hyper Beam");
  ok(youFired, "(probe check) the PLAYER's Hyper Beam must set the lock too");
  const youTree = search({ you: beamer, opp: foe }, youFired.state, 1);
  ok(youTree.allOptions.length === 1 && youTree.allOptions[0].move === "Hyper Beam",
    `a recharging PLAYER must have exactly one option (got ${youTree.allOptions.map((o) => o.move).join(", ")})`);
  const tieSplit = next.length;
  console.log(`   Hyper Beam lands, then its user forfeits on all ${tieSplit} branches (the ${tieSplit} is the speed tie, not the recharge)`);
}

console.log();
console.log(failures === 0 ? "ALL PASS -- B3 batch 1 characterization green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

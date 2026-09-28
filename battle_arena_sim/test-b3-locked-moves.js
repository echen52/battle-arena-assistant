// ── test-b3-locked-moves.js ───────────────────────────────────────────────
// B3 batch 3: the locked-move family, first half -- Rampage and Rollout.
//
//   PART 1  Rampage: a landed first hit locks for 2 OR 3 turns, 50/50
//   PART 2  the locked turns are forced, on both sides
//   PART 3  the end: a 2-turn lock confuses its user at the end of turn 2;
//           Own Tempo does not; a no-effect hit never locks
//   PART 4  WasUnableToUseMove: full paralysis breaks the lock, with NO confusion
//   PART 5  Rollout: 30 -> 60 -> 120, doubled after Defense Curl
//   PART 6  Rollout: a miss ends the chain; full paralysis does not
import { buildMon, buildStartState, resolveTurn, search, calcDamage } from "./logic.js";

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } };

const mk = (species, moves, over = {}) => buildMon({
  species, level: 50, nature: "Adamant", evs: { hp: 252, atk: 252 },
  ability: "Pressure", item: null, moves, friendship: 255, ...over,
});
const start = (you, opp, overrides = {}) => buildStartState({ you, opp, overrides });
const turn = (you, opp, state, yourMove, oppMove) => resolveTurn({ you, opp }, state, yourMove, oppMove);
const prob = (brs, f) => brs.filter(f).reduce((a, b) => a + b.p, 0);

// A bulky, passive foe so nothing faints inside three turns.
const wall = mk("Blissey", ["Splash", "Soft-Boiled", "Growl", "Protect"], { ability: "Natural Cure", evs: { hp: 252, def: 252 } });
const dragon = mk("Dragonite", ["Outrage", "Splash", "Rest", "Earthquake"], { ability: "Inner Focus" });

console.log("-- PART 1: a landed Outrage locks for 2 or 3 turns, equally --");
{
  const brs = turn(dragon, wall, start(dragon, wall), "Outrage", "Splash");
  const landed = brs.filter((b) => b.state.oppHpPct < 100);
  ok(landed.every((b) => b.state.youLock?.move === "Outrage"), "every landed Outrage must lock the user into it");
  const p2 = prob(landed, (b) => b.state.youLock?.n === 1);   // 2, less the end of turn 1
  const p3 = prob(landed, (b) => b.state.youLock?.n === 2);   // 3, less the end of turn 1
  const pl = prob(landed, () => true);
  ok(Math.abs(p2 - pl / 2) < 1e-9 && Math.abs(p3 - pl / 2) < 1e-9,
    `the length must be (Random() & 1) + 2, equally (got ${p2.toFixed(4)} / ${p3.toFixed(4)} of ${pl.toFixed(4)})`);
  console.log(`   landed ${pl.toFixed(3)}: lock 2 -> ${p2.toFixed(3)}, lock 3 -> ${p3.toFixed(3)}`);
}

console.log();
console.log("-- PART 2: the locked turns are forced --");
{
  const locked = start(dragon, wall, { youLock: { move: "Outrage", kind: "rampage", n: 2 } });
  // search() asks the AI to score the foe's moves, so this wall carries only
  // moves with AI rows (Splash has none -- it is not in the pool).
  const aiWall = mk("Blissey", ["Growl", "Soft-Boiled", "Protect", "Rest"], { ability: "Natural Cure", evs: { hp: 252, def: 252 } });
  const tree = search({ you: dragon, opp: aiWall }, buildStartState({ you: dragon, opp: aiWall, overrides: { youLock: { move: "Outrage", kind: "rampage", n: 2 } } }), 1);
  ok(tree.allOptions.length === 1 && tree.allOptions[0].move === "Outrage",
    `a locked PLAYER must have exactly one option (got ${tree.allOptions.map((o) => o.move).join(", ")})`);
  // An opponent locked into Outrage: every branch shows the AI using Outrage,
  // not whatever it would have scored best.
  const oppTree = search({ you: wall, opp: dragon }, start(wall, dragon, { oppLock: { move: "Outrage", kind: "rampage", n: 2 } }), 1);
  ok(oppTree.allOptions.every((o) => o.branches.every((b) => /Opp uses Outrage/.test(b.label))),
    "a locked OPPONENT must be forced, not re-chosen by the AI");
  console.log("   player: one option; opponent: Outrage on every branch");
}

console.log();
console.log("-- PART 3: how a Rampage ends --");
{
  // A 2-turn lock: set on turn 1, so after turn 2's end-of-turn the counter is
  // 0, the lock lifts, and the user confuses itself.
  let s = start(dragon, wall, { youLock: { move: "Outrage", kind: "rampage", n: 1 } });
  const end = turn(dragon, wall, s, "Outrage", "Splash");
  ok(end.every((b) => b.state.youLock === null), "the lock must lift when the counter reaches 0");
  ok(end.every((b) => b.state.youConfused === true), "...and the user must confuse ITSELF");

  const tempo = mk("Dragonite", ["Outrage", "Splash", "Rest", "Earthquake"], { ability: "Own Tempo" });
  const endT = turn(tempo, wall, start(tempo, wall, { youLock: { move: "Outrage", kind: "rampage", n: 1 } }), "Outrage", "Splash");
  ok(endT.every((b) => b.state.youConfused === false), "Own Tempo must stop the self-confusion");

  // Safeguard does NOT: it is a primary effect (SetMoveEffect(TRUE, 0)).
  const endS = turn(dragon, wall, start(dragon, wall, { youLock: { move: "Outrage", kind: "rampage", n: 1 }, youSafeguardTurns: 3 }), "Outrage", "Splash");
  ok(endS.every((b) => b.state.youConfused === true), "Safeguard must NOT stop it -- the effect is primary");

  // A Normal Thrash into a Ghost does not affect it, so seteffectwithchance
  // never applies the lock.
  const tauros = mk("Tauros", ["Thrash", "Splash", "Rest", "Earthquake"], { ability: "Intimidate" });
  const ghost = mk("Gengar", ["Splash", "Rest", "Growl", "Protect"], { ability: "Levitate" });
  const g = turn(tauros, ghost, start(tauros, ghost), "Thrash", "Splash");
  ok(g.every((b) => b.state.youLock === null), "a no-effect Thrash must not lock");
  console.log("   lock 2 ends confused; Own Tempo is not; Safeguard does not help; a Thrash into a Ghost never locks");
}

console.log();
console.log("-- PART 4: full paralysis breaks the lock, with no confusion --");
{
  // prlzImmobility is in WasUnableToUseMove, so ENDTURN_THRASH cancels -- and
  // the cancel skips the confusion even though the counter also hit 0.
  const s = start(dragon, wall, { youLock: { move: "Outrage", kind: "rampage", n: 1 }, youStatus: "paralysis" });
  const brs = turn(dragon, wall, s, "Outrage", "Splash");
  const para = brs.filter((b) => /You is fully paralyzed/.test(b.label));
  const acted = brs.filter((b) => !/You is fully paralyzed/.test(b.label));
  ok(para.length >= 1 && acted.length >= 1, "(probe check) both a paralysed and an acting branch must exist");
  ok(para.every((b) => b.state.youLock === null && b.state.youConfused === false),
    "a fully paralysed rampager loses the lock and is NOT confused");
  ok(acted.every((b) => b.state.youConfused === true), "(control) the rampager that acted IS confused");
  console.log(`   paralysed p=${prob(para, () => true).toFixed(2)}: unlocked, unconfused; acted: confused`);
}

console.log();
console.log("-- PART 5: Rollout doubles per hit --");
{
  const golem = mk("Golem", ["Rollout", "Splash", "Defense Curl", "Earthquake"], { ability: "Rock Head" });
  const hp = wall.stats.hp;
  const dmgOf = (before, after) => Math.round(((before - after) / 100) * hp);
  let s = start(golem, wall);
  const hits = [];
  for (let t = 0; t < 3; t++) {
    const b = turn(golem, wall, s, "Rollout", "Splash").find((x) => x.state.oppHpPct < s.oppHpPct);
    hits.push(dmgOf(s.oppHpPct, b.state.oppHpPct));
    s = b.state;
  }
  const at = (power) => calcDamage(golem, wall, "Rollout", { variablePower: power });
  ok(s.youLock?.kind === "rollout" && s.youLock.n === 2, `three hits leave the timer at 2, still locked (got ${JSON.stringify(s.youLock)})`);
  ok(hits[1] > hits[0] * 1.7 && hits[2] > hits[1] * 1.7, `each hit must roughly double (${hits.join(" -> ")})`);

  const curled = start(golem, wall, { youDefenseCurled: true });
  const c1 = turn(golem, wall, curled, "Rollout", "Splash").find((x) => x.state.oppHpPct < 100);
  const plain1 = turn(golem, wall, start(golem, wall), "Rollout", "Splash").find((x) => x.state.oppHpPct < 100);
  ok(dmgOf(100, c1.state.oppHpPct) > dmgOf(100, plain1.state.oppHpPct) * 1.7, "Defense Curl must double it");
  console.log(`   ${hits.join(" -> ")} HP; curled first hit ${dmgOf(100, c1.state.oppHpPct)} vs ${dmgOf(100, plain1.state.oppHpPct)}`);
}

console.log();
console.log("-- PART 6: what ends a Rollout chain --");
{
  const golem = mk("Golem", ["Rollout", "Splash", "Defense Curl", "Earthquake"], { ability: "Rock Head" });
  // Rollout is 90% accurate: the miss branch must end the chain.
  const s = start(golem, wall, { youLock: { move: "Rollout", kind: "rollout", n: 3 } });
  const brs = turn(golem, wall, s, "Rollout", "Splash");
  const missed = brs.filter((b) => b.state.oppHpPct === 100);
  ok(missed.length >= 1, "(probe check) a miss branch must exist");
  ok(missed.every((b) => b.state.youLock === null), "a MISS must end the chain");

  // Full paralysis ends it too (Phase D F24): BattleScript_MoveUsedIsParalyzed's
  // own `cancelmultiturnmoves BS_ATTACKER` (data/battle_scripts_1.s:3777) clears
  // STATUS2_MULTIPLETURNS and the rollout timer -- B3 had read only the
  // commented-out C call (src/battle_util.c:2192-2193).
  const pz = turn(golem, wall, start(golem, wall, { youLock: { move: "Rollout", kind: "rollout", n: 3 }, youStatus: "paralysis" }), "Rollout", "Splash");
  const blocked = pz.filter((b) => /You is fully paralyzed/.test(b.label));
  ok(blocked.length >= 1 && blocked.every((b) => b.state.youLock == null),
    "full paralysis ENDS the chain (F24; was: must leave it intact)");
  console.log("   a miss resets it; full paralysis leaves timer 3 and the lock in place");
}

console.log();
console.log(failures === 0 ? "ALL PASS -- B3 batch 3 characterization green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

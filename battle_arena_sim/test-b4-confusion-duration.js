// ── test-b4-confusion-duration.js ─────────────────────────────────────────
// B4d-pre: confusion LASTS 2-5 turns. Every source sets
// STATUS2_CONFUSION_TURN((Random() % 4) + 2) -- uniform over {2,3,4,5} -- and
// CANCELER_CONFUSED (src/battle_util.c:2156-2187) decrements it BEFORE testing
// it: a mon still confused after the decrement rolls its 50% self-hit, one
// whose counter reached 0 SNAPS OUT and acts. Both paths set effect = 1, so
// paralysis and love are not rolled that turn either way.
//
// The engine draws the duration lazily, at the check, which is exact because
// the counter is observed nowhere else: at check j (1-based) the chance of
// snapping out, given the mon is still confused, is P(N = j) / P(N >= j) --
// 0, 1/4, 1/3, 1/2, 1 for j = 1..5. The state carries "the next check's j":
// true (freshly confused, j = 1), then 2, 3, 4, 5.
//
//   PART 1  the per-check split at each j
//   PART 2  chained from a fresh confusion, the snap-out turn is uniform over
//           checks 2..5 -- i.e. the duration is uniform over {2,3,4,5}
//   PART 3  a snapping-out mon still skips the paralysis roll
import { buildMon, buildStartState, resolveTurn } from "./logic.js";

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } };
const near = (a, b) => Math.abs(a - b) < 1e-9;

const mk = (species, moves, over = {}) => buildMon({
  species, level: 50, nature: "Hardy", evs: { hp: 252 },
  ability: "Pressure", item: null, moves, friendship: 255, ...over,
});
const start = (you, opp, o = {}) => buildStartState({ you, opp, overrides: o });
const turn = (you, opp, st, ym, om) => resolveTurn({ you, opp }, st, ym, om);
const prob = (brs, f) => brs.filter(f).reduce((a, b) => a + b.p, 0);

// The player is confused and uses Swords Dance; the foe only Splashes. Acting
// shows as +2 Attack, a self-hit as the label, a snap-out as youConfused false.
const me = mk("Scizor", ["Swords Dance", "Splash", "Rest", "Protect"], { ability: "Swarm" });
const foe = mk("Blissey", ["Splash", "Soft-Boiled", "Growl", "Protect"], { ability: "Natural Cure" });
const run = (conf, o = {}) => turn(me, foe, start(me, foe, { youConfused: conf, ...o }), "Swords Dance", "Splash");
const snapped = (b) => b.state.youConfused === false;
const selfHit = (b) => /hits itself/.test(b.label);

console.log("-- PART 1: the split at each check --");
{
  const want = { 1: 0, 2: 1 / 4, 3: 1 / 3, 4: 1 / 2, 5: 1 };
  for (const j of [1, 2, 3, 4, 5]) {
    const brs = run(j === 1 ? true : j);
    const pSnap = prob(brs, snapped);
    ok(near(pSnap, want[j]), `check ${j}: P(snap out) = ${want[j].toFixed(4)} (got ${pSnap.toFixed(4)})`);
    ok(near(prob(brs, selfHit), (1 - want[j]) / 2), `check ${j}: P(self-hit) = ${((1 - want[j]) / 2).toFixed(4)}`);
    ok(brs.filter((b) => !snapped(b)).every((b) => b.state.youConfused === j + 1), `check ${j}: still confused -> next check is ${j + 1}`);
    ok(brs.filter(snapped).every((b) => b.state.youStages.atk === 2), `check ${j}: a snapping-out mon ACTS`);
  }
}

console.log();
console.log("-- PART 2: the duration is uniform over {2,3,4,5} --");
{
  // Walk the chain: at each check, the surviving mass times its conditional.
  let alive = 1;
  const snapAt = {};
  for (const j of [1, 2, 3, 4, 5]) {
    const brs = run(j === 1 ? true : j);
    const pSnap = prob(brs, snapped);
    snapAt[j] = alive * pSnap;
    alive *= 1 - pSnap;
  }
  ok(near(snapAt[1], 0) && [2, 3, 4, 5].every((j) => near(snapAt[j], 1 / 4)), `snap-out check is uniform over 2..5: ${JSON.stringify(snapAt)}`);
  ok(near(alive, 0), "and nobody is confused past check 5");
}

console.log();
console.log("-- PART 3: paralysis is not rolled on a confused turn --");
{
  // Check 5 always snaps out; a paralysed mon doing so still acts -- the 25%
  // full-paralysis roll is skipped because CANCELER_CONFUSED set effect = 1.
  const brs = run(5, { youStatus: "paralysis" });
  ok(near(prob(brs, (b) => b.state.youStages.atk === 2), 1), "snap out while paralysed: acts with certainty");
  const fresh = run(true, { youStatus: "paralysis" });
  ok(near(prob(fresh, (b) => /fully paralyzed/.test(b.label)), 0), "(and no paralysis roll on any confused turn)");
}

console.log();
console.log("-- PART 4: the SECOND mover's check ticks too --");
{
  // The slower Blissey is the confused one here: its check runs as the second
  // action of the turn.
  const brs = turn(me, foe, start(me, foe, { oppConfused: 2 }), "Swords Dance", "Splash");
  ok(near(prob(brs, (b) => b.state.oppConfused === false), 1 / 4), "second mover, check 2: P(snap out) = 1/4");
  ok(brs.filter((b) => b.state.oppConfused !== false).every((b) => b.state.oppConfused === 3), "...and otherwise its counter moves to 3");
}

console.log();
console.log(failures === 0 ? "ALL PASS -- B4d-pre confusion duration characterization green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

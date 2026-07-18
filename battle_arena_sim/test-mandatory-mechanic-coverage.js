// Coverage test for the change #11 mandatory-mechanic guard.
//
// Asserts that EVERY effect appearing on a power>1 move anywhere in the live
// 552-set pool is classified — either HANDLED (execution complete) or
// ACCEPTED_UNMODELED (a tracked, deliberately-unported mandatory mechanic).
// This pins both allowlists to the actual data: if a future data update
// introduces an unclassified power>1 effect, THIS fails at build time rather
// than a sweep set throwing at analysis time.
//
// Note the scope is power>1, matching the guard: power<=1 damaging moves
// (Counter/Mirror Coat/Flail/Reversal/OHKO/Seismic Toss/Night Shade) carry
// placeholder power and are handled on their own paths, and power=0 status
// moves are guarded separately by scoreOpponentMoveDist's no-handler throw.
import { OPPONENT_SETS } from "./opponent-full-data.js";
import { MOVES, HANDLED_EFFECTS, ACCEPTED_UNMODELED_EFFECTS } from "./logic.js";

const classified = new Set([...HANDLED_EFFECTS, ...Object.keys(ACCEPTED_UNMODELED_EFFECTS)]);

// Every distinct effect on a power>1 move present in the pool, with an example.
const poolEffects = new Map(); // effect -> { moveName, sets:Set }
for (const [setName, set] of Object.entries(OPPONENT_SETS)) {
  for (const mv of set.moves) {
    const m = MOVES[mv];
    if (!m || m.power <= 1) continue;
    if (!poolEffects.has(m.effect)) poolEffects.set(m.effect, { moveName: mv, sets: new Set() });
    poolEffects.get(m.effect).sets.add(setName);
  }
}

const unclassified = [];
for (const [effect, info] of poolEffects) {
  if (!classified.has(effect)) unclassified.push({ effect, moveName: info.moveName, count: info.sets.size });
}

console.log(`Coverage: ${poolEffects.size} distinct power>1 effects in pool; ` +
  `${poolEffects.size - unclassified.length} classified, ${unclassified.length} unclassified.`);

if (unclassified.length) {
  console.error(`\nFAIL: ${unclassified.length} power>1 effect(s) in the pool are neither HANDLED nor ACCEPTED_UNMODELED:`);
  for (const u of unclassified.sort((a, b) => b.count - a.count)) {
    console.error(`  ${u.effect} (e.g. "${u.moveName}", ${u.count} sets)`);
  }
  console.error(`\nClassify each: add to PURE_DAMAGE_EFFECTS, wire into HANDLED, or register in ACCEPTED_UNMODELED_EFFECTS.`);
  process.exit(1);
}

console.log("PASS: every power>1 effect in the pool is classified.");

// ── test-d-f8-ai-rolls.js ─────────────────────────────────────────────────
// Phase D F8: two AI roll structures ported wrongly, found by
// arena-solver/tools/random-constant-audit.mjs and reading the flagged routines.
//
//   AI_CV_ChangeSelfAbility3 (data/battle_ai_scripts.s:2367-2369):
//     `if_random_less_than 50, End` jumps PAST the +2 -> +2 on 206/256.
//     The engine had 128/256 (the Trick4 error again).
//   AI_CV_DefenseUp4 / AI_CV_SpDefUp4 (:934-940 / :1005-1011): when the
//     target's last move had power and was NOT "wasted", the script rolls
//     `if_random_less_than 60, End` and then FALLS THROUGH into
//     AI_CV_DefenseUp5's own `if_random_less_than 60, End` -- two independent
//     rolls, so the -2 lands on (196/256)^2. The engine rolled once.
//
// Probes pair the move with Spite (no AI dispatch, a flat 100): the move's
// choice probability is P(score > 100) + P(score == 100) / 2.
import { buildMon, buildStartState, chooseOpponentMoves } from "./logic.js";

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } else console.log("  ok   " + m); };
const mk = (species, moves, over = {}) => buildMon({
  species, level: 50, nature: "Hardy", evs: {}, ability: "Pressure", item: null, moves, friendship: 255, ...over,
});
const P = (opp, you, over = {}) =>
  Object.fromEntries(chooseOpponentMoves(opp, you, buildStartState({ you, opp, overrides: over })).map((c) => [c.move, c.prob]));
const near = (a, b) => Math.abs((a ?? 0) - b) < 1e-12;

console.log("-- AI_CV_ChangeSelfAbility3: +2 on 206/256 --");
{
  // Mr. Mime (Soundproof, not on the list) Role Plays a Ninjask (Speed Boost, on it).
  const p = P(mk("Mr. Mime", ["Role Play", "Spite"], { ability: "Soundproof" }), mk("Ninjask", ["Spite"], { ability: "Speed Boost" }));
  const want = 206 / 256 + (50 / 256) / 2;
  ok(near(p["Role Play"], want), `Role Play: P ${want} (got ${p["Role Play"]})`);
}

console.log("-- AI_CV_DefenseUp4 -> DefenseUp5: two rolls --");
{
  // User below 70% HP skips the 200 roll straight into DefenseUp4; the target's
  // last move was Tackle (power, physical -> not wasted for a DEFENSE boost).
  const opp = () => mk("Cloyster", ["Harden", "Spite"], { ability: "Shell Armor" });
  const you = () => mk("Snorlax", ["Tackle"], { ability: "Thick Fat" });
  const p = P(opp(), you(), { oppHpPct: 60, youLastMove: "Tackle" });
  const pPenalty = (196 / 256) ** 2;
  ok(near(p.Harden, (1 - pPenalty) / 2), `Harden after a physical hit: -2 on (196/256)^2, P ${(1 - pPenalty) / 2} (got ${p.Harden})`);
  // The wasted case stays a guaranteed -2: the last move was special (Ember).
  const q = P(opp(), mk("Snorlax", ["Ember"], { ability: "Thick Fat" }), { oppHpPct: 60, youLastMove: "Ember" });
  ok(near(q.Harden, 0), `Harden after a special hit: a guaranteed -2 (got ${q.Harden})`);
  // No last move with power: DefenseUp5's single roll.
  const r = P(opp(), you(), { oppHpPct: 60, youLastMove: null });
  ok(near(r.Harden, (60 / 256) / 2), `Harden with no damaging last move: one roll, P ${(60 / 256) / 2} (got ${r.Harden})`);
}
{
  // SpDefUp mirrors it: Amnesia after a SPECIAL hit is the not-wasted case.
  const opp = () => mk("Slowbro", ["Amnesia", "Spite"], { ability: "Oblivious" });
  const p = P(opp(), mk("Snorlax", ["Ember"], { ability: "Thick Fat" }), { oppHpPct: 60, youLastMove: "Ember" });
  ok(near(p.Amnesia, (1 - (196 / 256) ** 2) / 2), `Amnesia after a special hit: two rolls (got ${p.Amnesia})`);
}

console.log();
console.log(failures === 0 ? "ALL PASS -- F8 AI rolls green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

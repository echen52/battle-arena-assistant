// ── test-d-f9-always-hit.js ───────────────────────────────────────────────
// Phase D F9: AI_CV_AlwaysHit (data/battle_ai_scripts.s:1075-1089), dispatched
// for EFFECT_ALWAYS_HIT (:666 -- Swift, Faint Attack, Shadow Punch, Aerial Ace,
// Magical Leaf, Shock Wave). The engine returned 0 ("neither condition modeled
// yet") although both stat stages it reads are modelled -- the dead-context
// class again (A6, F3). Raw stages 0-12 (6 neutral) in display terms:
//   target evasion > +4 or the user's accuracy < -4 -> +1, then AlwaysHit2
//   target evasion > +2 or the user's accuracy < -2 -> AlwaysHit2
//   AlwaysHit2: if_random_less_than 100 -> end, else +1 (156/256)
// Found by random-constant-audit.mjs (its one flag after F8).
import { buildMon, buildStartState, chooseOpponentMoves } from "./logic.js";

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } else console.log("  ok   " + m); };
const mk = (species, moves, over = {}) => buildMon({
  species, level: 50, nature: "Hardy", evs: {}, ability: "Pressure", item: null, moves, friendship: 255, ...over,
});
const near = (a, b) => Math.abs((a ?? 0) - b) < 1e-12;
// Aerial Ace is the opponent's only damaging move (most powerful, no KO into a
// full-HP Snorlax): 100 + the CV, against Spite's flat 100.
const P = (over) => {
  const opp = mk("Pidgeot", ["Aerial Ace", "Spite"], { ability: "Keen Eye" });
  const you = mk("Snorlax", ["Spite"], { ability: "Thick Fat" });
  return chooseOpponentMoves(opp, you, buildStartState({ you, opp, overrides: over })).find((c) => c.move === "Aerial Ace")?.prob ?? 0;
};
const roll = 156 / 256 + (100 / 256) / 2;

ok(near(P({}), 0.5), `neutral stages: no score, ties Spite (got ${P({})})`);
ok(near(P({ youStages: { evasion: 2 } }), 0.5), `target evasion +2: still nothing (got ${P({ youStages: { evasion: 2 } })})`);
ok(near(P({ youStages: { evasion: 3 } }), roll), `target evasion +3: AlwaysHit2's roll, P ${roll} (got ${P({ youStages: { evasion: 3 } })})`);
ok(near(P({ oppStages: { accuracy: -3 } }), roll), `the user's accuracy -3: the same (got ${P({ oppStages: { accuracy: -3 } })})`);
ok(near(P({ youStages: { evasion: 4 } }), roll), `target evasion +4: still only the roll (raw 10 is not > 10) (got ${P({ youStages: { evasion: 4 } })})`);
ok(near(P({ youStages: { evasion: 5 } }), 1), `target evasion +5: +1 and the roll, always above Spite (got ${P({ youStages: { evasion: 5 } })})`);
ok(near(P({ oppStages: { accuracy: -5 } }), 1), `the user's accuracy -5: the same (got ${P({ oppStages: { accuracy: -5 } })})`);

console.log();
console.log(failures === 0 ? "ALL PASS -- F9 AlwaysHit green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

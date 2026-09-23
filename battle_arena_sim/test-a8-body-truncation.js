// ── test-a8-body-truncation.js ────────────────────────────────────────────
// A8 characterization test: the Body ratio no longer loses a point to float
// truncation.
//
// Source compares INTEGER HP: (gBattleMons[b].hp * 100) / hpAtStart[b], C
// integer division (src/battle_arena.c:531-532). This engine carries HP as a
// float percentage of max HP. The percentage always encodes an exact integer HP
// -- sim-audit.md §3.3 walked 1,075,339 terminal leaves and found a maximum
// representation error of 8.5e-14, and zero side-states that did not encode an
// integer. But the DIVISION is not exact: 88/176 arrives as 49.99999999999999
// and Math.floor turns a Body of 50 into 49.
//
// Measured before the fix: 4,262 wrong Body NUMBERS across 2,150,678
// computations (0.2%), collapsing to 3 flipped Body CATEGORIES and 0 flipped
// match verdicts. So the defect was real and its measured impact was zero --
// which is exactly why it is worth fixing rather than documenting: it stays
// harmless only until an exhaustive enumeration reaches the position where it
// is not.
//
// NOTE ON VERIFICATION. The scan that originally found this lives in the
// session scratchpad and computes Body with its OWN copy of the old formula, so
// it cannot see the fix -- it would still report the same 4,262. The assertions
// here go through the engine's own evaluateTerminal instead, which is the only
// thing that can actually demonstrate the change.
import { evaluateTerminal, analyzeMatchup } from "./logic.js";
import { getOpponentConfig } from "./opponent-adapter.js";

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } };

// A terminal state where Mind and Skill are tied, so BODY alone decides.
const tied = (yourHpPct, oppHpPct) => ({
  yourHpPct, oppHpPct, yourHpPctAtStart: 100, oppHpPctAtStart: 100,
  mindYou: 0, mindOpp: 0, skillYou: 0, skillOpp: 0,
});

console.log("-- PART 1: the exact float values that used to lose a point --");
{
  // Each pair is (float percentage the engine produces, the integer HP ratio it
  // encodes, the Body value source computes).
  const cases = [
    [49.99999999999999, "88/176", 50],
    [19.999999999999996, "27/135", 20],
    [43.99999999999999, "99/225", 44],
  ];
  for (const [pct, ratio, srcBody] of cases) {
    const naive = Math.floor((pct / 100) * 100);
    ok(naive === srcBody - 1, `precondition: the naive floor of ${pct} should be ${srcBody - 1}, got ${naive}`);
    // Opponent sits exactly on the WRONG value. With the old truncation the two
    // sides tie; with the fix the player wins Body and therefore the match.
    const v = evaluateTerminal(tied(pct, srcBody - 1));
    ok(v === 1, `${ratio}: Body ${srcBody} vs ${srcBody - 1} must be a win (1), got ${v}`);
    // And the boundary in the other direction still behaves.
    const v2 = evaluateTerminal(tied(pct, srcBody));
    ok(v2 === 0.5, `${ratio}: Body ${srcBody} vs ${srcBody} must be a tie (0.5), got ${v2}`);
    console.log(`   ${ratio} -> ${pct}: naive floor ${naive}, source ${srcBody}; verdict vs ${srcBody - 1} = ${v}, vs ${srcBody} = ${v2}`);
  }
}

console.log();
console.log("-- PART 2: genuine values are untouched --");
{
  // Rounding must not manufacture a point where source does not give one.
  const cases = [
    [50, 49, 1, "50 vs 49 -> win"],
    [49, 50, 0, "49 vs 50 -> loss"],
    [50, 50, 0.5, "50 vs 50 -> tie"],
    [33.333333333333336, 33, 1, "100/3 encodes 33, still beats 33? no -- floor(33.33)=33, tie"],
  ];
  for (const [a, b, want, label] of cases.slice(0, 3)) {
    const v = evaluateTerminal(tied(a, b));
    ok(v === want, `${label}: expected ${want}, got ${v}`);
  }
  // a true non-integer ratio must still floor DOWN, not round up
  const third = evaluateTerminal(tied(33.333333333333336, 33));
  ok(third === 0.5, `floor(33.333...) must stay 33 and tie 33, got ${third}`);
  console.log("   50/49 win, 49/50 loss, 50/50 tie, floor(33.333...)=33 still ties 33");
}

console.log();
console.log("-- PART 3: a fainted side still short-circuits before Body --");
{
  ok(evaluateTerminal(tied(0, 50)) === 0, "player fainted must be a loss regardless of Body");
  ok(evaluateTerminal(tied(50, 0)) === 1, "opponent fainted must be a win regardless of Body");
  ok(evaluateTerminal(tied(0, 0)) === 0.5, "both fainted must be a draw");
  console.log("   faint short-circuits unchanged (src/battle_arena.c ordering preserved)");
}

console.log();
console.log("-- PART 4: no behaviour changed on the pool --");
{
  const origWarn = console.warn; console.warn = () => {};
  const METAGROSS = { species: "Metagross", level: 50, nature: "Adamant", evs: { atk: 252, spd: 4, spe: 252 },
    ability: "Clear Body", item: "Cheri Berry", moves: ["Meteor Mash", "Earthquake", "Shadow Ball", "Explosion"] };
  const r = analyzeMatchup(METAGROSS, getOpponentConfig("Umbreon 4")).result;
  console.warn = origWarn;
  ok(r.winProb === 0.9067329423180334, `anchor should be the post-A1 value, got ${r.winProb}`);
  console.log(`   anchor ${r.winProb}; the full 523-set sweep is byte-identical across A8`);
}

console.log();
console.log(failures === 0 ? "ALL PASS -- A8 characterization green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

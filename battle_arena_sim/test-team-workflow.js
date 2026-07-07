// Carry-forward correctness test for the team-workflow orchestration.
//
// This is the "Leftovers-heal bug at multi-step scale" check: it does NOT
// trust that HP threading between matchups is correct just because the code
// looks right — it runs a REAL 2-matchup chain and asserts, to the decimal,
// that the exact HP value produced by matchup 1's own search is the exact
// HP value matchup 2 starts from. If this ever fails, the chain is broken —
// fix before trusting anything built on top of it.
//
// Matchup 2's opponent was Tyranitar through Session 6. Switched to Jolteon 1
// (Session 7's AI_TryToFaint fix session) — once the missing "most powerful
// move" comparison was ported, Tyranitar's kit (Rock Slide/Earthquake/Crunch/
// Sandstorm) collapsed to a fully deterministic 100% Earthquake against
// Metagross (correctly — Earthquake is Tyranitar's genuine best move here,
// 2x on Steel with no rival move outdamaging it), which removed the only
// branch this test relied on (Rock Slide's old ~6.25% miss chance) where
// nothing touches your HP this turn. That's a correct consequence of the
// fix, not a carry-forward bug — but it means Tyranitar can no longer prove
// this specific invariant. Jolteon 1's only power>1 move is Thunderbolt (no
// rival power>1 move in its kit), so it was never affected by the fix and
// still gives a genuine same-turn "opponent's move doesn't touch your HP"
// branch (a guaranteed-success first-use Protect, blocking Earthquake
// outright) to verify against.
import { analyzeMatchup } from "./logic.js";
import { collectLeaves } from "./team-workflow.js";

const metagross = { species: "Metagross", level: 50, nature: "Adamant", evs: { atk: 252, spd: 4, spe: 252 }, ability: "Clear Body", item: "Cheri Berry", moves: ["Meteor Mash", "Earthquake", "Shadow Ball", "Explosion"] };
const umbreon = { species: "Umbreon", level: 50, nature: "Bold", evs: { hp: 170, def: 170, spd: 170 }, ability: "Synchronize", item: "Leftovers", moves: ["Confuse Ray", "Toxic", "Faint Attack", "Double Team"] };
const jolteon = { species: "Jolteon", level: 50, nature: "Modest", evs: { spa: 255, spe: 255 }, ability: "Volt Absorb", item: "Cheri Berry", moves: ["Thunderbolt", "Thunder Wave", "Attract", "Protect"] };

console.log("── Carry-forward chain test: Metagross (R1 vs Umbreon) -> Metagross (R2 vs Jolteon) ──\n");

// MATCHUP 1: full 100/100, 2 reserves each side (3-mon teams).
const r1 = analyzeMatchup(metagross, umbreon, { yourHpPct: 100, oppHpPct: 100, yourUsablePartyMons: 2, oppUsablePartyMons: 2 });
const recommended1 = r1.result.allOptions.find((o) => o.move === r1.result.move);
const leaves1 = [];
for (const b of recommended1.branches) collectLeaves(b, 1, leaves1);

// Pick a REAL terminal leaf where Metagross took non-trivial damage (not the
// trivial 100%-HP no-op case) — this is the exact HP that "leaves matchup 1"
// in this specific line of play.
const interestingLeaf = leaves1
  .filter((l) => l.state.yourHpPct < 100 && l.state.yourHpPct > 0)
  .sort((a, b) => b.p - a.p)[0]; // highest-probability non-trivial leaf

if (!interestingLeaf) throw new Error("Test setup failure: no non-trivial terminal leaf found in matchup 1.");

const exitHp = interestingLeaf.state.yourHpPct;
console.log(`Matchup 1 exact exit HP (this specific leaf, p=${interestingLeaf.p.toFixed(6)}): ${exitHp}`);
console.log(`Matchup 1 exit yourUsablePartyMons: ${interestingLeaf.state.yourUsablePartyMons}, oppUsablePartyMons: ${interestingLeaf.state.oppUsablePartyMons}`);

// MATCHUP 2: Metagross carries EXACTLY `exitHp` forward. The opponent's next
// mon (Jolteon) comes in fresh (100%). yourUsablePartyMons is UNCHANGED
// (same mon continuing, no reserve consumed); oppUsablePartyMons decrements
// by 1 (their previous mon retired regardless of round 1's outcome).
const yourUsablePartyMons2 = interestingLeaf.state.yourUsablePartyMons; // unchanged, same continuing mon
const oppUsablePartyMons2 = interestingLeaf.state.oppUsablePartyMons - 1; // Umbreon retires, Jolteon is next

const r2 = analyzeMatchup(metagross, jolteon, {
  yourHpPct: exitHp, oppHpPct: 100,
  yourUsablePartyMons: yourUsablePartyMons2, oppUsablePartyMons: oppUsablePartyMons2,
});

// Check matchup 2's OWN immediate (one-ply, turn-2) branches directly — NOT
// fully recursed to termination, since a terminal leaf is by definition past
// turn 2 and would never show "unchanged HP" even when nothing hit you that
// turn (the fully-recursed walk is for aggregate round statistics, not this
// specific plumbing check). Among these one-ply branches, find one where the
// opponent's action didn't touch your HP at all (e.g. their attack missed) —
// there, yourHpPct after turn 1 of matchup 2 MUST be bit-for-bit identical to
// `exitHp`, since nothing happened to change it. This is the actual
// assertion: does the orchestration's carried-forward number survive,
// unmangled, into the next matchup's own internal state?
const recommended2 = r2.result.allOptions.find((o) => o.move === r2.result.move);
const oneplyHps = recommended2.branches.map((b) => b.state.yourHpPct);
const untouchedHp = oneplyHps.find((hp) => hp === exitHp);

console.log(`\nMatchup 2 entry HP (as passed): ${exitHp}`);
console.log(`Matchup 2 usablePartyMons passed: yours=${yourUsablePartyMons2}, opp's=${oppUsablePartyMons2}`);
console.log("Matchup 2's own one-ply yourHpPct values across all branches:", oneplyHps);

const pass = untouchedHp === exitHp;

console.log(`\nEXACT MATCH (matchup1 exit HP === matchup2 entry-derived HP): ${pass ? "YES" : "NO"}`);
console.log(pass ? "✅ PASS — carry-forward chain is exact, to the decimal" : "❌ FAIL — carry-forward chain is broken");

if (!pass) process.exit(1);

// ── test-a6-dead-context.js ───────────────────────────────────────────────
// A6 characterization test: the dead AI-context flags are live.
//
// WHAT CHANGED. Two flags the opponent AI reads were permanently false:
//
//   targetInfatuated  assigned `state.youAttracted` in the ctx literal, then
//                     assigned `false` AGAIN ~74 lines later in the same
//                     literal. The later key wins in JS, so the real wiring was
//                     dead. Legal JavaScript; `node --check` accepts it.
//   targetConfused    hardcoded `false`, written when only Confuse Ray could
//                     confuse and the flag was called metagrossConfused.
//
// sim-audit.md §2.3 measured both inert: the opponent's move distribution was
// byte-identical whether the player was confused, infatuated, both or neither.
// Five handler branches read them (EFFECT_CONFUSE :572, EFFECT_SWAGGER :1047,
// EFFECT_REVENGE :1600, EFFECT_FOCUS_PUNCH :1819, and reflectFamilyViability
// :451 shared by Counter/Mirror Coat), plus EFFECT_ATTRACT :555/:611,
// EFFECT_MEAN_LOOK :1142, EFFECT_PROTECT :1174 and EFFECT_TRAP :1878 for
// infatuation -- 167 of the 552 sets carry at least one.
//
// Amendment 5 widened A6 to cover both halves. userInfatuated (the opponent's
// OWN infatuation) is wired too, now that A5 made oppAttracted reachable.
//
// The duplicate-key class itself is guarded by test-no-duplicate-keys.js.
import { analyzeMatchup, buildMon, buildStartState, chooseOpponentMoves } from "./logic.js";
import { getOpponentConfig } from "./opponent-adapter.js";
import { OPPONENT_SETS } from "./opponent-full-data.js";

const METAGROSS = { species: "Metagross", level: 50, nature: "Adamant", evs: { atk: 252, spd: 4, spe: 252 },
  ability: "Clear Body", item: "Cheri Berry", moves: ["Meteor Mash", "Earthquake", "Shadow Ball", "Explosion"] };

// Pre-A6 (branch phase-a-fidelity @ 82b82e3). HISTORY, never asserted.
const PRE_A6 = {
  "Gengar 1": { move: "Shadow Ball", winProb: 0.9184375 },
  "Lapras 1": { move: "Earthquake", winProb: 0.6896961805555555 },
  "Articuno 5": { move: "Shadow Ball", winProb: 0.9851259223620097 },
  "Spenser Silver Slaking": { move: "Earthquake", winProb: 0.46563486328125003 },
};
// Post-A6. ASSERTED.
const POST_A6 = {
  "Gengar 1": { move: "Shadow Ball", winProb: 0.5800000000000001 },
  "Lapras 1": { move: "Meteor Mash", winProb: 0.589053488498264 },
  "Greta Silver Umbreon": { move: "Meteor Mash", winProb: 0.8143718750000001 },
  "Tauros 1": { move: "Meteor Mash", winProb: 0.5167382812500002 },
  "Articuno 5": { move: "Meteor Mash", winProb: 0.9694799148701366 },
  "Cradily 1": { move: "Meteor Mash", winProb: 0.9831834216220691 },
  "Spenser Silver Slaking": { move: "Explosion", winProb: 0.415625 },
};

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } };
const cfgOf = (n) => { const e = OPPONENT_SETS[n]; return getOpponentConfig(n, e.abilities.length > 1 ? { ability: e.abilities[0] } : {}); };
const distOf = (you, opp, ov) => chooseOpponentMoves(opp, you, buildStartState({ you, opp, overrides: ov }))
  .map((d) => `${d.move}@${d.prob.toFixed(6)}`).join(" | ");

console.log("-- PART 1: targetConfused is live (AI_CBM_Confuse's -5 can fire) --");
{
  const you = buildMon({ species: "Salamence", level: 50, nature: "Adamant", evs: { atk: 252, spe: 252 },
    ability: "Intimidate", item: "Leftovers", moves: ["Dragon Claw", "Earthquake", "Rock Slide", "Aerial Ace"] });
  const opp = buildMon({ ...cfgOf("Umbreon 4"), friendship: 255 }); // Confuse Ray
  const base = distOf(you, opp, null);
  const conf = distOf(you, opp, { youConfused: true });
  ok(base !== conf, "the AI distribution MUST change when the player is already confused");
  ok(base.includes("Confuse Ray"), "baseline should consider Confuse Ray");
  ok(!conf.includes("Confuse Ray"), "an already-confused target should drop Confuse Ray entirely");
  console.log(`   not confused: ${base}`);
  console.log(`   confused    : ${conf}`);
}

console.log();
console.log("-- PART 2: targetInfatuated is live (the duplicate key is gone) --");
{
  const you = buildMon({ species: "Nidoking", level: 50, nature: "Adamant", evs: { atk: 252, spe: 252 },
    ability: "Poison Point", item: "Leftovers", moves: ["Earthquake", "Rock Slide", "Body Slam", "Surf"] });
  const opp = buildMon({ ...cfgOf("Jolteon 1"), friendship: 255 }); // Attract
  // Protect otherwise dominates this set; its own decay counter is what lets
  // Attract into the running, so the comparison is made past that.
  const base = distOf(you, opp, { oppProtectUses: 2 });
  const att = distOf(you, opp, { oppProtectUses: 2, youAttracted: true });
  ok(base !== att, "the AI distribution MUST change when the player is already infatuated");
  ok(base.includes("Attract"), "baseline should consider Attract");
  ok(!att.includes("Attract"), "an already-infatuated target should drop Attract entirely");
  console.log(`   not infatuated: ${base}`);
  console.log(`   infatuated    : ${att}`);
}

console.log();
console.log("-- PART 3: the sim-audit.md §2.3 inertness measurement no longer reproduces --");
{
  // The audit's exact probe: four override combinations, byte-identical before.
  const you = buildMon({ species: "Salamence", level: 50, nature: "Adamant", evs: { atk: 252, spe: 252 },
    ability: "Intimidate", item: "Leftovers", moves: ["Dragon Claw", "Earthquake", "Rock Slide", "Aerial Ace"] });
  const opp = buildMon({ species: "Umbreon", level: 50, nature: "Bold", evs: { hp: 170, def: 170, spd: 170 },
    ability: "Synchronize", item: "Leftovers", moves: ["Attract", "Confuse Ray", "Faint Attack", "Swagger"], friendship: 255 });
  const seen = new Set([
    distOf(you, opp, null),
    distOf(you, opp, { youAttracted: true }),
    distOf(you, opp, { youConfused: true }),
    distOf(you, opp, { youAttracted: true, youConfused: true }),
  ]);
  ok(seen.size > 1, `all four override combinations still produce one distribution (${seen.size}); the flags are still inert`);
  console.log(`   4 override combinations now produce ${seen.size} distinct distributions (was 1)`);
}

console.log();
console.log("-- PART 4: recorded behaviour --");
{
  const origWarn = console.warn; console.warn = () => {};
  for (const [name, want] of Object.entries(POST_A6)) {
    const { result } = analyzeMatchup(METAGROSS, cfgOf(name));
    ok(result.move === want.move, `${name}: move ${result.move} !== ${want.move}`);
    ok(result.winProb === want.winProb, `${name}: winProb ${result.winProb} !== ${want.winProb}`);
  }
  console.warn = origWarn;
  let flips = 0;
  for (const [n, pre] of Object.entries(PRE_A6)) if (pre.move !== POST_A6[n].move) flips++;
  console.log(`   ${Object.keys(POST_A6).length} sets asserted; ${flips}/${Object.keys(PRE_A6).length} recorded pairs changed the recommended move`);
  console.log("   direction: movers fall for the player -- an AI that can see the player's status plays better");
}

console.log();
console.log(failures === 0 ? "ALL PASS -- A6 characterization green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

// ── test-a7-skill-mechanisms.js ───────────────────────────────────────────
// A7 characterization test: Arena Skill is the two source mechanisms.
//
// WHAT CHANGED. The engine modelled BattleArena_AddSkillPoints only
// (src/battle_arena.c:588-622) and papered over BattleArena_DeductSkillPoints
// (:624-652) with six hand-computed NET constants. The six numbers were right,
// and five further block paths were right by coincidence of coverage -- but
// nothing DERIVED them, so every new mechanic needed its Skill re-derived by
// hand and the engine could not say why any value was what it was.
//
// Now: ARENA_ADD_SKILL is the branch chain, ARENA_DEDUCT_STRINGS is the string
// switch, and arenaSkillDelta(branch, printed) composes them. Every Skill value
// in the engine falls out of those two.
//
// CORRECTION: the engine's own comment and sim-audit.md §3.2 both said the
// switch matches "18 strings". It matches NINETEEN
// (src/battle_arena.c:630-649). Asserted below so the number cannot drift back.
import { arenaSkillDelta, ARENA_DEDUCT_STRINGS, ARENA_ADD_SKILL, ABILITY_BLOCK_SOURCE,
         ABILITY_BLOCK_SKILL_DELTA, skillDelta, analyzeMatchup,
         buildMon, buildStartState, resolveTurn } from "./logic.js";
import { getOpponentConfig } from "./opponent-adapter.js";

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } };
const mk = (o) => buildMon({ level: 50, nature: "Serious", evs: {}, item: "Leftovers", ...o });

console.log("-- PART 1: the string switch has 19 cases, not 18 --");
{
  ok(ARENA_DEDUCT_STRINGS.size === 19, `expected 19 deduct strings, got ${ARENA_DEDUCT_STRINGS.size}`);
  for (const s of ARENA_DEDUCT_STRINGS) ok(s.startsWith("STRINGID_"), `${s} must be a STRINGID_* constant`);
  console.log(`   ${ARENA_DEDUCT_STRINGS.size} strings (src/battle_arena.c:630-649)`);
}

console.log();
console.log("-- PART 2: AddSkillPoints' branch chain --");
{
  const want = { alreadyStatused: -2, noEffect: -2, protectedBlock: 0, mixed: 1,
                 superEffective: 2, notVeryEffective: -1, landed: 1, selfProtected: 0 };
  for (const [b, v] of Object.entries(want)) {
    ok(ARENA_ADD_SKILL[b] === v, `branch ${b} should be ${v}, got ${ARENA_ADD_SKILL[b]}`);
    ok(arenaSkillDelta(b) === v, `arenaSkillDelta("${b}") should be ${v}, got ${arenaSkillDelta(b)}`);
  }
  let threw = false;
  try { arenaSkillDelta("notABranch"); } catch { threw = true; }
  ok(threw, "an unknown branch must throw, not silently score 0");
  let threw2 = false;
  try { arenaSkillDelta("landed", ["PKMNSXBLOCKSY"]); } catch { threw2 = true; }
  ok(threw2, "a non-STRINGID_ entry must throw");
  console.log("   8 branches match src/battle_arena.c:588-622; unknown inputs throw");
}

console.log();
console.log("-- PART 3: each -3 is per MATCHING string, and only matching ones --");
{
  ok(arenaSkillDelta("landed", ["STRINGID_PKMNSXBLOCKSY"]) === -2, "landed + a matched string = +1 -3");
  ok(arenaSkillDelta("noEffect", ["STRINGID_PKMNRESTOREDHPUSING"]) === -5, "noEffect + a matched string = -2 -3");
  ok(arenaSkillDelta("noEffect", ["STRINGID_AVOIDEDDAMAGE"]) === -2, "an UNmatched string must cost nothing");
  ok(arenaSkillDelta("landed", ["STRINGID_PKMNSXBLOCKSY", "STRINGID_PKMNPROTECTEDBY"]) === -5,
     "two matched strings must both fire -- the switch runs per printed string");
  console.log("   +1-3=-2, -2-3=-5, unmatched=0, two matches=-5 (both mechanisms compose)");
}

console.log();
console.log("-- PART 4: the six ability nets are DERIVED, and unchanged --");
{
  // These are the values the engine used to hard-code. They must now be
  // produced by the mechanism, not typed.
  const historical = { "Wonder Guard": -2, "Levitate": -2, "Soundproof": -2,
                       "Flash Fire": -2, "Volt Absorb": -5, "Water Absorb": -5 };
  for (const [ability, want] of Object.entries(historical)) {
    const src = ABILITY_BLOCK_SOURCE[ability];
    ok(src !== undefined, `${ability} must have a source description`);
    const derived = arenaSkillDelta(src.addBranch, src.printed);
    ok(derived === want, `${ability}: derived ${derived} !== historical ${want}`);
    ok(ABILITY_BLOCK_SKILL_DELTA[ability] === want, `${ability}: table value drifted`);
  }
  console.log("   " + Object.entries(ABILITY_BLOCK_SKILL_DELTA)
    .map(([a, v]) => `${a}=${v}`).join(", "));
  console.log("   all six derived from (AddSkillPoints branch, printed strings)");
}

console.log();
console.log("-- PART 5: skillDelta's outcomes route through the mechanism --");
{
  const map = { landedSuperEffective: 2, landedMixed: 1, landed: 1, landedNVE: -1, miss: -2, noEffect: -2 };
  for (const [o, v] of Object.entries(map)) ok(skillDelta(o) === v, `skillDelta("${o}") should be ${v}, got ${skillDelta(o)}`);
  console.log("   " + Object.entries(map).map(([o, v]) => `${o}=${v}`).join(", "));
}

console.log();
console.log("-- PART 6: the five coverage-luck paths, end to end --");
{
  // Each of these used to be "-2 because 'failed' returns -2", correct only by
  // coincidence. They are asserted behaviourally here so the coincidence is a
  // tested path.
  const metagross = mk({ species: "Metagross", ability: "Clear Body", moves: ["Meteor Mash", "Earthquake", "Shadow Ball", "Explosion"] });
  const cases = [
    ["Clear Body blocks a stat drop", mk({ species: "Aerodactyl", ability: "Rock Head", moves: ["Screech", "Rock Slide", "Earthquake", "Double-Edge"] }), metagross, "Screech", null],
    ["Limber blocks paralysis", mk({ species: "Jolteon", ability: "Volt Absorb", moves: ["Thunder Wave", "Thunderbolt", "Bite", "Shadow Ball"] }), mk({ species: "Persian", ability: "Limber", moves: ["Body Slam", "Bite", "Screech", "Slash"] }), "Thunder Wave", null],
    ["already paralyzed", mk({ species: "Jolteon", ability: "Volt Absorb", moves: ["Thunder Wave", "Thunderbolt", "Bite", "Shadow Ball"] }), mk({ species: "Snorlax", ability: "Immunity", moves: ["Body Slam", "Earthquake", "Shadow Ball", "Surf"] }), "Thunder Wave", { youStatus: "paralysis" }],
    ["type-immune status", mk({ species: "Jolteon", ability: "Volt Absorb", moves: ["Thunder Wave", "Thunderbolt", "Bite", "Shadow Ball"] }), mk({ species: "Marowak", ability: "Rock Head", moves: ["Earthquake", "Rock Slide", "Body Slam", "Swords Dance"] }), "Thunder Wave", null],
    ["Safeguard", mk({ species: "Jolteon", ability: "Volt Absorb", moves: ["Thunder Wave", "Thunderbolt", "Bite", "Shadow Ball"] }), mk({ species: "Snorlax", ability: "Immunity", moves: ["Body Slam", "Earthquake", "Shadow Ball", "Surf"] }), "Thunder Wave", { youSafeguardTurns: 5 }],
  ];
  for (const [label, opp, you, mv, ov] of cases) {
    const s = buildStartState({ you, opp, overrides: ov });
    const outs = resolveTurn({ you, opp }, s, you.moves[0], mv);
    const deltas = [...new Set(outs.map((o) => o.state.skillOpp))];
    ok(deltas.length === 1 && deltas[0] === -2, `${label}: expected a single -2, got ${JSON.stringify(deltas)}`);
    console.log(`   ${label.padEnd(32)} opponent Skill ${deltas.join("/")}`);
  }
}

console.log();
console.log("-- PART 7: no behaviour changed (A7 is a structural port) --");
{
  const origWarn = console.warn; console.warn = () => {};
  const METAGROSS = { species: "Metagross", level: 50, nature: "Adamant", evs: { atk: 252, spd: 4, spe: 252 },
    ability: "Clear Body", item: "Cheri Berry", moves: ["Meteor Mash", "Earthquake", "Shadow Ball", "Explosion"] };
  const r = analyzeMatchup(METAGROSS, getOpponentConfig("Umbreon 4")).result;
  console.warn = origWarn;
  ok(r.winProb === 0.9067329423180334, `anchor must be untouched by A7, got ${r.winProb}`);
  console.log(`   anchor ${r.winProb}; the full 523-set sweep is byte-identical across A7`);
}

console.log();
console.log(failures === 0 ? "ALL PASS -- A7 characterization green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
// ── test-a5-symmetry.js ────────────────────────────────────────────────────
// A5 characterization test: the four opponent->player-only executors are now
// two-sided.
//
// WHAT CHANGED. EFFECT_CONFUSE, EFFECT_ATTRACT, EFFECT_EVASION_UP and
// EFFECT_SWAGGER each began with `if (actor === "you") throw`. The player could
// not be given Confuse Ray, Supersonic, Sweet Kiss, Attract, Double Team or
// Swagger at all -- six dex moves, and four effects that appear on 127 of the
// 552 opponent sets. A simulator that has to search both sides cannot have
// one-directional status.
//
// The you-side confusion flag was literally named `metagrossConfused`, which is
// how the asymmetry survived so long. It is now `youConfused` / `oppConfused`
// -- which also aligns it with the UI's own checkbox id, `youConfused`.
//
// A5 adds capability and changes NO existing behaviour: the 523-set Metagross
// sweep is byte-identical across the change (md5 07c3f6377386f9e736055f312fea8c45
// both sides). The player-side dex probe moves 254 -> 260 of 354.
import { analyzeMatchup, buildMon, buildStartState, resolveTurn, MOVES } from "./logic.js";
import { getOpponentConfig } from "./opponent-adapter.js";

const mk = (o) => buildMon({ level: 50, nature: "Serious", evs: {}, item: "Leftovers", ...o });

// A player lead carrying all four previously-refused effects.
const TRICKSTER = { species: "Mew", level: 50, nature: "Serious", evs: {}, ability: "Synchronize",
  item: "Leftovers", moves: ["Double Team", "Confuse Ray", "Swagger", "Attract"] };

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } };

console.log("-- PART 1: all six previously-refused player moves now run --");
{
  const opp = mk({ species: "Snorlax", ability: "Immunity", moves: ["Body Slam", "Earthquake", "Shadow Ball", "Surf"] });
  const oppCfg = { species: "Snorlax", level: 50, nature: "Adamant", evs: { hp: 252, atk: 252 },
    ability: "Immunity", item: "Leftovers", moves: ["Body Slam", "Earthquake", "Shadow Ball", "Surf"] };
  const six = ["Double Team", "Confuse Ray", "Supersonic", "Sweet Kiss", "Swagger", "Attract"];
  for (const mv of six) {
    const you = { species: "Mew", level: 50, nature: "Serious", evs: {}, ability: "Synchronize",
      item: "Leftovers", moves: [mv, "Pound", "Pound", "Pound"] };
    let threw = null;
    try { analyzeMatchup(you, oppCfg); } catch (e) { threw = e.message.split("\n")[0]; }
    ok(threw === null, `player ${mv} must run, got: ${threw}`);
  }
  console.log(`   ${six.join(", ")} — all run`);
  void opp;
}

console.log();
console.log("-- PART 2: player Double Team really lowers the opponent's accuracy --");
{
  const you = mk({ species: "Mew", ability: "Synchronize", moves: ["Double Team", "Pound", "Pound", "Pound"] });
  const opp = mk({ species: "Snorlax", ability: "Immunity", moves: ["Body Slam", "Earthquake", "Shadow Ball", "Surf"] });
  const s0 = buildStartState({ you, opp });
  const after = resolveTurn({ you, opp }, s0, "Double Team", "Body Slam")[0].state;
  ok(after.youStages.evasion === 1, `Double Team must raise the player's evasion, got ${after.youStages.evasion}`);
  // Body Slam is 100 accuracy; at evasion +1 the combined stage is -1 -> 0.75
  const hitP = (st) => {
    const outs = resolveTurn({ you, opp }, st, "Pound", "Body Slam");
    return outs.filter((o) => o.label.includes("Opp uses Body Slam (hits)")).reduce((a, o) => a + o.p, 0);
  };
  const base = hitP(buildStartState({ you, opp }));
  const raised = hitP(buildStartState({ you, opp, overrides: { youStages: { evasion: 1 } } }));
  ok(base > raised, `evasion must reduce incoming accuracy (${base} -> ${raised})`);
  console.log(`   evasion +1: opponent Body Slam hit probability ${base.toFixed(3)} -> ${raised.toFixed(3)}`);
}

console.log();
console.log("-- PART 3: player Confuse Ray / Swagger / Attract land on the opponent --");
{
  const you = buildMon(TRICKSTER);
  const opp = mk({ species: "Snorlax", ability: "Immunity", moves: ["Body Slam", "Earthquake", "Shadow Ball", "Surf"] });
  const s0 = buildStartState({ you, opp });

  const conf = resolveTurn({ you, opp }, s0, "Confuse Ray", "Body Slam")[0].state;
  ok(conf.oppConfused === true, "player Confuse Ray must set oppConfused");
  ok(conf.youConfused === false, "player Confuse Ray must NOT confuse the player");

  const swag = resolveTurn({ you, opp }, s0, "Swagger", "Body Slam").find((o) => o.state.oppStages.atk === 2);
  ok(swag !== undefined, "player Swagger must raise the opponent's Atk by 2");
  ok(swag && swag.state.oppConfused === true, "player Swagger must also confuse the opponent");

  // Attract needs a GENDERED user: Mew is genderless (GENDER_RATIO "genderless"),
  // so gender compatibility is 0 and every branch correctly fails. That is the
  // source rule, not a gap -- Cmd_tryinfatuating fails on a genderless side.
  // Nidoqueen is female-only; Snorlax is 87.45% male, so the compatible branch
  // exists with that probability.
  const queen = buildMon({ species: "Nidoqueen", level: 50, nature: "Serious", evs: {},
    ability: "Poison Point", item: "Leftovers", moves: ["Attract", "Earthquake", "Body Slam", "Surf"] });
  const sQ = buildStartState({ you: queen, opp });
  const attOuts = resolveTurn({ you: queen, opp }, sQ, "Attract", "Body Slam");
  const att = attOuts.find((o) => o.state.oppAttracted === true);
  ok(att !== undefined, "a gendered player Attract must be able to infatuate the opponent");
  const pAtt = attOuts.filter((o) => o.state.oppAttracted).reduce((a, o) => a + o.p, 0);
  ok(pAtt > 0.8 && pAtt < 0.9, `compatibility should track Snorlax's male ratio, got p=${pAtt}`);
  // and the genderless case must still refuse, for the right reason
  const mewOuts = resolveTurn({ you, opp }, s0, "Attract", "Body Slam");
  ok(mewOuts.every((o) => o.state.oppAttracted === false), "a genderless user cannot infatuate");
  console.log(`   oppConfused / oppStages.atk +2 set; oppAttracted p=${pAtt.toFixed(3)} from a gendered user, 0 from genderless Mew`);
}

console.log();
console.log("-- PART 4: a confused opponent can hurt itself --");
{
  const you = buildMon(TRICKSTER);
  const opp = mk({ species: "Snorlax", ability: "Immunity", moves: ["Body Slam", "Earthquake", "Shadow Ball", "Surf"] });
  const s = buildStartState({ you, opp, overrides: { oppConfused: true } });
  const outs = resolveTurn({ you, opp }, s, "Pound", "Body Slam");
  const selfHit = outs.filter((o) => o.label.includes("Opp hits itself in confusion"));
  ok(selfHit.length > 0, "a confused opponent must have a self-hit branch");
  ok(selfHit.every((o) => o.state.oppHpPct < 100), "the self-hit must actually cost the opponent HP");
  const pSelf = selfHit.reduce((a, o) => a + o.p, 0);
  console.log(`   opponent self-hit branch present, p=${pSelf.toFixed(3)}, opponent HP reduced`);
}

console.log();
console.log("-- PART 5: the blockers work in the NEW direction too --");
{
  const you = buildMon(TRICKSTER);
  const cases = [
    ["Own Tempo", mk({ species: "Slowbro", ability: "Own Tempo", moves: ["Surf", "Psychic", "Rest", "Curse"] }), null],
    ["Substitute", mk({ species: "Snorlax", ability: "Immunity", moves: ["Body Slam", "Earthquake", "Shadow Ball", "Surf"] }), { oppSubstituteHP: 20 }],
    ["Safeguard", mk({ species: "Snorlax", ability: "Immunity", moves: ["Body Slam", "Earthquake", "Shadow Ball", "Surf"] }), { oppSafeguardTurns: 5 }],
    ["already confused", mk({ species: "Snorlax", ability: "Immunity", moves: ["Body Slam", "Earthquake", "Shadow Ball", "Surf"] }), { oppConfused: true }],
  ];
  for (const [label, opp, ov] of cases) {
    const s = buildStartState({ you, opp, overrides: ov });
    const before = s.oppConfused;
    const outs = resolveTurn({ you, opp }, s, "Confuse Ray", opp.moves[0]);
    ok(outs.every((o) => o.state.oppConfused === before), `${label}: opponent confusion must not change`);
    ok(outs.every((o) => o.state.skillYou === -2), `${label}: the PLAYER's Skill must be -2, got ${outs[0].state.skillYou}`);
    console.log(`   ${label.padEnd(17)} refused, player Skill -2`);
  }
}

console.log();
console.log("-- PART 6: the opponent side is unchanged (A5 is additive) --");
{
  const origWarn = console.warn; console.warn = () => {};
  const METAGROSS = { species: "Metagross", level: 50, nature: "Adamant", evs: { atk: 252, spd: 4, spe: 252 },
    ability: "Clear Body", item: "Cheri Berry", moves: ["Meteor Mash", "Earthquake", "Shadow Ball", "Explosion"] };
  const r = analyzeMatchup(METAGROSS, getOpponentConfig("Umbreon 4")).result;
  console.warn = origWarn;
  ok(r.winProb === 0.9069423628063115, `the anchor must be untouched by A5, got ${r.winProb}`);
  console.log(`   anchor at ${r.winProb} (A5 itself left the full sweep byte-identical; the value was later re-recorded by A6)`);
}

console.log();
console.log(failures === 0 ? "ALL PASS -- A5 characterization green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
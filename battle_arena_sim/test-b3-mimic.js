// ── test-b3-mimic.js ──────────────────────────────────────────────────────
// B3 batch 7c: Mimic (data/battle_scripts_1.s:1134-1145,
// Cmd_mimicattackcopy src/battle_script_commands.c:7844-7883).
//
//   PART 1  it copies the target's LAST move into MIMIC'S OWN slot, for good,
//           and the copied move is then usable -- by the player's search and by
//           the AI
//   PART 2  every failure (-2): a Substitute, no last move, one of the four
//           forbidden moves, a move it already knows, a semi-invulnerable target
//   PART 3  Protect does NOT stop it (JumpIfMoveAffectedByProtect(0))
import { buildMon, buildStartState, resolveTurn, search, skillDelta } from "./logic.js";

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } };

const mk = (species, moves, over = {}) => buildMon({
  species, level: 50, nature: "Adamant", evs: { hp: 252, atk: 252 },
  ability: "Pressure", item: null, moves, friendship: 255, ...over,
});
const start = (you, opp, o = {}) => buildStartState({ you, opp, overrides: o });
const turn = (you, opp, st, ym, om) => resolveTurn({ you, opp }, st, ym, om);

const snor = mk("Snorlax", ["Body Slam", "Growl", "Rest", "Protect"], { ability: "Thick Fat" });
const mimic = mk("Jigglypuff", ["Mimic", "Sing", "Rest", "Pound"], { ability: "Cute Charm" });

console.log("-- PART 1: the copy --");
{
  // The faster Snorlax uses Growl this turn, so Growl is its last move when
  // Mimic resolves -- not the stale Body Slam from the override.
  const b = turn(snor, mimic, start(snor, mimic, { youLastMove: "Body Slam" }), "Growl", "Mimic")[0];
  ok(JSON.stringify(b.state.oppMoves) === JSON.stringify(["Growl", "Sing", "Rest", "Pound"]),
    `Growl replaces MIMIC's slot (got ${JSON.stringify(b.state.oppMoves)})`);
  ok(b.state.skillOpp === skillDelta("landed"), "a successful Mimic scores +1");

  // The player's copy is a real option next turn.
  const pl = mk("Jigglypuff", ["Mimic", "Sing", "Rest", "Pound"], { ability: "Cute Charm" });
  const wall = mk("Blissey", ["Growl", "Soft-Boiled", "Protect", "Rest"], { ability: "Natural Cure" });
  const t1 = turn(pl, wall, start(pl, wall, { oppLastMove: "Soft-Boiled" }), "Mimic", "Growl")[0].state;
  ok(t1.youMoves?.includes("Soft-Boiled") || t1.youMoves?.includes("Growl"), "(probe check) the player copied a move");
  const opts = search({ you: pl, opp: wall }, t1, 1).allOptions.map((o) => o.move);
  ok(!opts.includes("Mimic") && opts.some((m) => t1.youMoves.includes(m) && !pl.moves.includes(m)),
    `the player's search offers the COPIED move, not Mimic (options ${opts.join(", ")})`);
}

console.log();
console.log("-- PART 2: the failures --");
{
  // A SLOWER target (Shuckle), so Mimic resolves first and copies exactly the
  // last move set up in the state.
  const shuckle = mk("Shuckle", ["Growl", "Rest", "Protect", "Splash"], { ability: "Sturdy" });
  const fail = (o, why) => {
    const brs = turn(shuckle, mimic, start(shuckle, mimic, o), "Splash", "Mimic");
    ok(brs.every((b) => b.state.oppMoves == null && b.state.skillOpp === skillDelta("noEffect")), why);
  };
  // (control) the same setup with a copyable last move succeeds.
  const good = turn(shuckle, mimic, start(shuckle, mimic, { youLastMove: "Growl" }), "Splash", "Mimic");
  ok(good.every((b) => b.state.oppMoves?.[0] === "Growl"), "(control) a copyable last move is copied");
  fail({ youLastMove: "Growl", youSubstituteHP: 50 }, "into a Substitute: fails");
  fail({ youLastMove: null }, "no last move (none yet, or the last attempt was prevented): fails");
  for (const f of ["Metronome", "Struggle", "Sketch", "Mimic"]) fail({ youLastMove: f }, `${f} is forbidden to Mimic: fails`);
  fail({ youLastMove: "Rest" }, "a move the user already knows: fails");
  fail({ youLastMove: "Growl", youCharging: { move: "Fly", invulnBit: "onair" } }, "a target in the air: fails");
  // (control) Protect is AFTER Mimic's forbidden list ends, so it IS copyable.
  const prot = turn(shuckle, mimic, start(shuckle, mimic, { youLastMove: "Protect" }), "Splash", "Mimic");
  ok(prot.every((b) => b.state.oppMoves?.[0] === "Protect"), "Protect sits past MIMIC_FORBIDDEN_END, so it can be copied");
}

console.log();
console.log("-- PART 3: Protect does not stop Mimic --");
{
  const b = turn(snor, mimic, start(snor, mimic, { youLastMove: "Body Slam" }), "Protect", "Mimic")[0];
  ok(b.state.oppMoves?.includes("Protect"), `Mimic through a Protect still copies (got ${JSON.stringify(b.state.oppMoves)})`);
}

console.log();
console.log(failures === 0 ? "ALL PASS -- B3 batch 7c characterization green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

// ── test-d-f1-negates-type.js ─────────────────────────────────────────────
// Phase D finding F1: the generic head of AI_CheckBadMove
// (data/battle_ai_scripts.s:51-100) was not ported.
//
//   if_move MOVE_FISSURE / MOVE_HORN_DRILL -> AI_CBM_CheckIfNegatesType
//   get_how_powerful_move_is == MOVE_POWER_OTHER -> skip to the Soundproof check
//   AI_CBM_CheckIfNegatesType (:57-88):
//     if_type_effectiveness x0      -10   (TypeCalc on DAMAGE, so Levitate is
//                                          not x0 here -- it has its own line;
//                                          Foresight lifts the Ghost row)
//     target Volt Absorb  & Electric -12
//     target Water Absorb & Water    -12
//     target Flash Fire   & Fire     -12
//     target Wonder Guard unless x2  -10   (EXACT x2 category: STAB SE counts,
//                                          x4 does not)
//     target Levitate     & Ground   -10
//   AI_CheckBadMove_CheckSoundproof (:89-100), EVERY move: target Soundproof
//     and one of nine sound moves -10
//
// Score_Minus10 / Score_Minus12 end with `end` (:620-626), which ends
// AI_CheckBadMove for this move (Cmd_end, src/battle_ai_script_commands.c:
// 2209-2213) -- the effect's own AI_CBM_* is then NOT reached -- while the
// other scripts (TryToFaint, CheckViability) still run.
//
// Probes pair the move with a rival whose score is known, and assert the AI's
// choice. Each probe's expected value was derived from source, not read off
// the engine.
import { buildMon, buildStartState, chooseOpponentMoves } from "./logic.js";

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } else console.log("  ok   " + m); };
const mk = (species, moves, over = {}) => buildMon({
  species, level: 50, nature: "Hardy", evs: {}, ability: "Pressure", item: null, moves, friendship: 255, ...over,
});
const P = (opp, you, over = {}) => {
  const d = chooseOpponentMoves(opp, you, buildStartState({ you, opp, overrides: over }));
  return Object.fromEntries(d.map((c) => [c.move, c.prob]));
};
const near = (a, b) => Math.abs((a ?? 0) - b) < 1e-9;

console.log("-- the x0 line (type immunity, on damage) --");
{
  // Body Slam into a Ghost: -10, and TryToFaint still runs. Spite (no AI dispatch) scores 100.
  const p = P(mk("Snorlax", ["Body Slam", "Spite"]), mk("Dusclops", ["Spite"]));
  ok(near(p["Body Slam"], 0), `Body Slam into Dusclops: P 0 (got ${p["Body Slam"]})`);
  // Foresight skips the Ghost row (TypeCalc's TYPE_FORESIGHT break): no penalty.
  const f = P(mk("Snorlax", ["Body Slam", "Spite"]), mk("Dusclops", ["Spite"]), { youForesighted: true });
  ok(near(f["Body Slam"], f["Spite"]) && f["Body Slam"] > 0, `...into a FORESIGHTED Dusclops: not penalised (got ${JSON.stringify(f)})`);
}

console.log("-- the absorbing abilities: -12, which is below the x0 line's -10 --");
{
  // Target a Ghost holding the ability, so the rival Body Slam sits at exactly
  // 100 - 10 (x0) - 1 (not most powerful: its estimate floors to 1) = 89, and
  // the absorbed move at 100 - 12 = 88. A -10 port would put it at 90 and win.
  for (const [ability, move] of [["Volt Absorb", "Thunderbolt"], ["Water Absorb", "Surf"], ["Flash Fire", "Flamethrower"]]) {
    const p = P(mk("Snorlax", [move, "Body Slam"]), mk("Dusclops", ["Spite"], { ability }));
    ok(near(p["Body Slam"], 1), `${move} into ${ability}: -12 loses to Body Slam's 89 (got ${JSON.stringify(p)})`);
  }
  // The x0 line comes FIRST: Thunderbolt into a Ground-type Volt Absorb ends at
  // -10, so the choice is identical to the same Quagsire with Damp.
  const show = (d) => JSON.stringify(d);
  const tb = (ability) => show(P(mk("Snorlax", ["Thunderbolt", "Thunder Wave"]), mk("Quagsire", ["Spite"], { ability })));
  ok(tb("Volt Absorb") === tb("Damp"), `Thunderbolt into Volt Absorb Quagsire: x0's -10, same as Damp (${tb("Volt Absorb")} vs ${tb("Damp")})`);
  // Only the matching type: Thunderbolt into Water Absorb is untouched.
  const q = P(mk("Snorlax", ["Thunderbolt", "Spite"]), mk("Snorlax", ["Spite"], { ability: "Water Absorb" }));
  ok(q["Thunderbolt"] > 0, `Thunderbolt into Water Absorb: not penalised (got ${JSON.stringify(q)})`);
}

console.log("-- Wonder Guard: everything but an exact x2 --");
{
  const shed = () => mk("Shedinja", ["Spite"], { ability: "Wonder Guard" });
  const p1 = P(mk("Snorlax", ["Surf", "Spite"]), shed());
  ok(near(p1["Surf"], 0), `Surf (x1) into Wonder Guard: P 0 (got ${JSON.stringify(p1)})`);
  const p2 = P(mk("Snorlax", ["Flamethrower", "Spite"]), shed());
  ok(p2["Flamethrower"] > 0, `Flamethrower (x2) into Wonder Guard: not penalised (got ${JSON.stringify(p2)})`);
  // STAB x2 is 120 -> requantised to x2 (Cmd_if_type_effectiveness): passes.
  const p3 = P(mk("Houndoom", ["Crunch", "Spite"]), shed());
  ok(p3["Crunch"] > 0, `STAB Crunch (x2) into Wonder Guard: not penalised (got ${JSON.stringify(p3)})`);
  // x4 is its own category, so it does NOT pass. Snorlax given Wonder Guard and
  // a Grass/Bug-typed target via Parasect: Flamethrower x4.
  const p4 = P(mk("Snorlax", ["Flamethrower", "Spite"]), mk("Parasect", ["Spite"], { ability: "Wonder Guard" }));
  ok(near(p4["Flamethrower"], 0), `Flamethrower (x4) into Wonder Guard: P 0 (got ${JSON.stringify(p4)})`);
}

console.log("-- Levitate --");
{
  const p = P(mk("Snorlax", ["Earthquake", "Spite"]), mk("Latios", ["Spite"], { ability: "Levitate" }));
  ok(near(p["Earthquake"], 0), `Earthquake into Levitate: P 0 (got ${JSON.stringify(p)})`);
}

console.log("-- the gate: powerless moves skip it, except Fissure / Horn Drill --");
{
  // Sheer Cold is power 1 and not in the if_move list: no Wonder Guard line.
  // AI_CBM_OneHitKO scores 0 here (equal levels, no Sturdy, Ice not x0), so it
  // ties Spite.
  const p = P(mk("Snorlax", ["Sheer Cold", "Spite"]), mk("Snorlax", ["Spite"], { ability: "Wonder Guard" }));
  ok(near(p["Sheer Cold"], 0.5), `Sheer Cold into Wonder Guard: no head, ties Spite (got ${JSON.stringify(p)})`);
  // Horn Drill IS in the list: x1 into Wonder Guard -> -10.
  const q = P(mk("Snorlax", ["Horn Drill", "Spite"]), mk("Snorlax", ["Spite"], { ability: "Wonder Guard" }));
  ok(near(q["Horn Drill"], 0), `Horn Drill into Wonder Guard: -10 (got ${JSON.stringify(q)})`);
}

console.log("-- `end`: a head hit skips the effect's own AI_CBM_* --");
{
  // Fissure into a higher-level Levitate: the head's -10 ENDS the script, so
  // AI_CBM_OneHitKO's level -10 is never reached: Fissure 90. Body Slam into
  // the same Ghost: 100 - 10 = 90 (it is the only eligible move, so most
  // powerful). A tie. Without the `end`, Fissure would be 80 and lose.
  const p = P(mk("Snorlax", ["Fissure", "Body Slam"]), mk("Gengar", ["Spite"], { ability: "Levitate", level: 60 }));
  ok(near(p["Fissure"], 0.5) && near(p["Body Slam"], 0.5), `Fissure vs Body Slam into Lv60 Levitate Gengar: 0.5 / 0.5 (got ${JSON.stringify(p)})`);
}

console.log("-- Soundproof, on every move --");
{
  const ex = () => mk("Exploud", ["Spite"], { ability: "Soundproof" });
  // Uproar: powerful path (power 50). Without the line it out-damages Tackle.
  const p = P(mk("Snorlax", ["Uproar", "Tackle"]), ex());
  ok(near(p["Uproar"], 0), `Uproar into Soundproof: P 0 (got ${JSON.stringify(p)})`);
  // Metal Sound: the MOVE_POWER_OTHER path still reaches the Soundproof line.
  const q = P(mk("Snorlax", ["Metal Sound", "Spite"]), ex());
  ok(near(q["Metal Sound"], 0), `Metal Sound into Soundproof: P 0 (got ${JSON.stringify(q)})`);
  // Not a sound move: untouched.
  const r = P(mk("Snorlax", ["Tackle", "Spite"]), ex());
  ok(r["Tackle"] > 0, `Tackle into Soundproof: not penalised (got ${JSON.stringify(r)})`);
}

console.log();
console.log(failures === 0 ? "ALL PASS -- F1 AI_CheckBadMove head green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

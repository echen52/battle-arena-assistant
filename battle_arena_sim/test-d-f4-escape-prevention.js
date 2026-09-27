// ── test-d-f4-escape-prevention.js ────────────────────────────────────────
// Phase D finding F4: Mean Look / Block / Spider Web (EFFECT_MEAN_LOOK) were a
// no-op executor ("no switching in Arena, so nothing to model"). But the
// escape-prevention flag has consequences inside one Arena battle:
//
//   BattleScript_EffectMeanLook (data/battle_scripts_1.s:1444-1457):
//     jumpifstatus2 BS_TARGET, STATUS2_ESCAPE_PREVENTION, BattleScript_ButItFailed
//     jumpifstatus2 BS_TARGET, STATUS2_SUBSTITUTE,         BattleScript_ButItFailed
//     setmoveeffect MOVE_EFFECT_PREVENT_ESCAPE -> STATUS2_ESCAPE_PREVENTION
//       (src/battle_script_commands.c:622, :2806)
//   So a REPEAT fails, and so does one into a Substitute: Skill -2 (noEffect),
//   where the sim scored +1.
//   AI_CBM_CantEscape (data/battle_ai_scripts.s:430-432):
//     if_status2 AI_TARGET, STATUS2_ESCAPE_PREVENTION -> -10
//   The flag is cleared only when the trapper leaves the field
//   (src/battle_main.c:3164-3165, :3277-3278) -- never inside an Arena battle.
//
// Found by the emulator differential: Steelix's Block on turn 0 and the sim's
// AI choosing Block again with P 1 on turn 2 (battle-00368); Ariados's Spider
// Web into a Substitute scored +1 in the sim, -2 in the ROM (battle-00235).
import { buildMon, buildStartState, resolveTurn, chooseOpponentMoves, vf } from "./logic.js";

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } else console.log("  ok   " + m); };
const mk = (species, moves, over = {}) => buildMon({
  species, level: 50, nature: "Hardy", evs: {}, ability: "Pressure", item: null, moves, friendship: 255, ...over,
});
const J = JSON.stringify;
const dist = (opp, you, st) => Object.fromEntries(chooseOpponentMoves(opp, you, st).map((c) => [c.move, c.prob]));
const near = (a, b) => Math.abs((a ?? 0) - b) < 1e-9;
const same = (xs) => xs.length > 0 && xs.every((x) => x === xs[0]);

const opp = () => mk("Steelix", ["Block", "Spite"], { ability: "Sturdy" });
const you = () => mk("Snorlax", ["Spite", "Substitute"], { ability: "Thick Fat" });

console.log("-- the battle: first use lands, a repeat fails --");
{
  const o = opp(), y = you();
  const t1 = resolveTurn({ you: y, opp: o }, buildStartState({ you: y, opp: o }), "Spite", "Block");
  ok(t1.every((b) => vf(b.state, "youCantEscape")), `after Block: the player is escape-prevented in all ${t1.length} branches`);
  ok(t1.every((b) => !vf(b.state, "oppCantEscape")), `...and the user is not`);
  const d1 = t1.map((b) => b.state.skillOpp);
  ok(same(d1) && d1[0] === 1, `first Block scores +1 Skill (got ${J(d1)})`);
  const t2 = t1.flatMap((b) => resolveTurn({ you: y, opp: o }, b.state, "Spite", "Block"));
  const d2 = t2.map((b) => b.state.skillOpp);
  ok(same(d2) && d2[0] === 1 - 2, `the repeat fails: Skill -2, total -1 (got ${J(d2)})`);
  ok(t2.every((b) => vf(b.state, "youCantEscape")), `...and the flag stays set (cleared only when the trapper leaves)`);
}

console.log("-- into a Substitute: fails --");
{
  const o = opp(), y = you();
  const t = resolveTurn({ you: y, opp: o }, buildStartState({ you: y, opp: o, overrides: { youSubstituteHP: 40 } }), "Spite", "Block");
  const d = t.map((b) => b.state.skillOpp);
  ok(same(d) && d[0] === -2, `Block into a Substitute: Skill -2 (got ${J(d)})`);
  ok(t.every((b) => !vf(b.state, "youCantEscape")), `...and sets nothing`);
}

console.log("-- the player's Block, the other way round --");
{
  const o = mk("Snorlax", ["Spite"], { ability: "Thick Fat" }), y = mk("Snorlax", ["Block"], { ability: "Thick Fat" });
  const t1 = resolveTurn({ you: y, opp: o }, buildStartState({ you: y, opp: o }), "Block", "Spite");
  ok(t1.every((b) => vf(b.state, "oppCantEscape") && !vf(b.state, "youCantEscape")), `player's Block prevents the OPPONENT's escape`);
  const t2 = t1.flatMap((b) => resolveTurn({ you: y, opp: o }, b.state, "Block", "Spite"));
  const d2 = t2.map((b) => b.state.skillYou);
  ok(same(d2) && d2[0] === -1, `the player's repeat fails too: +1 then -2 (got ${J(d2)})`);
}

console.log("-- the AI: AI_CBM_CantEscape --");
{
  // Fresh: Block's CBM 0, AI_CV_Trap scores nothing (no stalling status):
  // 100, a tie with Spite's flat 100.
  const a = dist(opp(), you(), buildStartState({ you: you(), opp: opp() }));
  ok(near(a["Block"], 0.5), `fresh: Block ties Spite, 0.5 (got ${J(a)})`);
  const b = dist(opp(), you(), buildStartState({ you: you(), opp: opp(), overrides: { youCantEscape: true } }));
  ok(near(b["Block"], 0), `target already escape-prevented: Block -10, P 0 (got ${J(b)})`);
  // The AI's OWN flag is AI_USER's, not AI_TARGET's.
  const c = dist(opp(), you(), buildStartState({ you: you(), opp: opp(), overrides: { oppCantEscape: true } }));
  ok(near(c["Block"], 0.5), `the AI itself escape-prevented: unchanged (got ${J(c)})`);
  // Integration, the shape of battle-00368: the turn after Block.
  const o = opp(), y = you();
  const t1 = resolveTurn({ you: y, opp: o }, buildStartState({ you: y, opp: o }), "Spite", "Block");
  const ps = t1.map((br) => dist(o, y, br.state)["Block"] ?? 0);
  ok(ps.every((p) => p === 0), `the turn after Block: P(Block) 0 in all ${t1.length} branches (got ${J(ps)})`);
}

console.log();
console.log(failures === 0 ? "ALL PASS -- F4 escape prevention green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

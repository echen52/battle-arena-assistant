// ── test-d-f2c-move-history.js ────────────────────────────────────────────
// Phase D finding F2c: the AI knows only the player's moves it has recorded.
//
// BATTLE_HISTORY->usedMoves[target] is fed only by RecordLastUsedMoveByTarget
// (src/battle_ai_script_commands.c:618-633) at the top of each AI decision
// (:403): the target's gLastMoves, into the first free slot, unless already
// there; MOVE_NONE records nothing. Cleared at switch-in (src/battle_main.c:3260,
// :3353). The if_has_move* AI_TARGET commands read it (:1840-1954) -- ten lines
// of data/battle_ai_scripts.s (Dream Eater / Nightmare, Snatch, RESTORE_HP,
// DEFENSE_CURL, PROTECT). The engine handed the AI all four player moves.
// An Encored or forced turn never calls the AI (src/battle_main.c:4192-4198),
// so it records nothing. gBattleMoves[0xFFFF] (MOVE_UNAVAILABLE) reads effect 0,
// power 0, type 0 in the ROM (0x083DC88C) -- row 0's -- so null is exact.
import { buildMon, buildStartState, buildAiView, chooseOpponentMoves, aiDecisionState, recordTargetMoveHistory, analyzeMatchup } from "./logic.js";
import { AI_CONST } from "./ai-program.js";

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } else console.log("  ok   " + m); };
const mk = (species, moves, over = {}) => buildMon({
  species, level: 50, nature: "Hardy", evs: {}, ability: "Pressure", item: null, moves, friendship: 255, ...over,
});
const star = mk("Starmie", ["Surf", "Ice Beam", "Thunderbolt", "Recover"], { ability: "Natural Cure" });
const spear = mk("Spearow", ["Pursuit", "Protect", "Mirror Move", "Growl"], { ability: "Keen Eye" });
const fresh = buildStartState({ you: star, opp: spear });
const used = (st) => buildAiView(spear, star, st, { qc: false }).history.usedMoves;

console.log("-- F2c: turn 1, the AI knows none of the player's moves --");
ok(JSON.stringify(used(fresh)) === "[0,0,0,0]", `usedMoves ${JSON.stringify(used(fresh))}`);
ok(JSON.stringify(buildAiView(spear, star, fresh, { qc: false, history: "moveset" }).history.usedMoves)
  === JSON.stringify(["SURF", "ICE_BEAM", "THUNDERBOLT", "RECOVER"].map((m) => AI_CONST["MOVE_" + m])), `"moveset" keeps the old all-four view (the parity tool's)`);

console.log("-- F2c: the record --");
{
  const s1 = { ...fresh, youLastMove: "Recover" };
  ok(JSON.stringify(recordTargetMoveHistory(s1)) === '["Recover"]', "the last move is recorded");
  const s2 = aiDecisionState(s1);
  ok(JSON.stringify(recordTargetMoveHistory(s2)) === '["Recover"]' && aiDecisionState(s2) === s2, "idempotent: recording again changes nothing");
  ok(JSON.stringify(recordTargetMoveHistory({ ...s2, youLastMove: null })) === '["Recover"]', "MOVE_NONE / UNAVAILABLE (null) records nothing");
  ok(JSON.stringify(recordTargetMoveHistory({ ...s2, youLastMove: "Surf" })) === '["Recover","Surf"]', "a second move takes the next slot");
  ok(aiDecisionState({ ...s1, oppEncoredMove: "Pursuit" }).youMoveHistory.length === 0, "an Encored turn runs no AI: nothing recorded");
  ok(aiDecisionState({ ...s1, oppCharging: { move: "Fly" } }).youMoveHistory.length === 0, "a forced turn runs no AI: nothing recorded");
  let threw = false;
  try { recordTargetMoveHistory({ ...fresh, youMoveHistory: ["Recover", "Surf"], youLastMove: "Ice Beam" }); } catch (e) { threw = /F2c/.test(e.message); }
  ok(threw, "a third entry throws by name (UNAVAILABLE's slot occupancy is not modelled)");
}

console.log("-- F2c: the decision (AI_CV_Protect reads the target's RESTORE_HP, data/battle_ai_scripts.s:1903) --");
{
  const dist = (st) => chooseOpponentMoves(spear, star, st, { qc: false }).map((x) => `${x.move} ${x.prob.toFixed(3)}`).join(", ");
  const a = dist(fresh), b = dist({ ...fresh, youMoveHistory: ["Recover"] });
  ok(a !== b, `history changes the choice: fresh [${a}] vs knows Recover [${b}]`);
}

console.log("-- F2c: the search records at each AI decision --");
{
  // Turn 1's decision records nothing (gLastMoves is MOVE_NONE); turn 2's
  // records the player's turn-1 move, so every turn-2 result carries it.
  const cfg = (species, moves, ability) => ({ species, level: 50, nature: "Hardy", evs: {}, ability, item: null, moves, friendship: 255 });
  const r = analyzeMatchup(cfg("Starmie", ["Surf", "Recover"], "Natural Cure"), cfg("Spearow", ["Pursuit", "Protect", "Mirror Move", "Growl"], "Keen Eye"));
  let turn1 = 0, turn2 = 0, bad = [];
  for (const o of r.result.allOptions) for (const b of o.branches) {
    turn1++;
    if (b.state.youMoveHistory.length !== 0) bad.push(`turn 1 ${o.move}: ${b.state.youMoveHistory}`);
    for (const o2 of b.subtree.allOptions ?? []) for (const b2 of o2.branches) {
      turn2++;
      const want = b.state.youLastMove ? [b.state.youLastMove] : [];
      if (JSON.stringify(b2.state.youMoveHistory) !== JSON.stringify(want)) bad.push(`turn 2 after ${o.move}: ${b2.state.youMoveHistory} (want ${want})`);
    }
  }
  ok(turn2 > 0 && bad.length === 0, `${turn1} turn-1 and ${turn2} turn-2 results, history as recorded${bad.length ? ": " + bad.slice(0, 3).join("; ") : ""}`);
}

console.log();
console.log(failures === 0 ? "ALL PASS -- F2c move history green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

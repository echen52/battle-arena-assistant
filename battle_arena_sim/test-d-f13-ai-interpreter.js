// ── test-d-f13-ai-interpreter.js ──────────────────────────────────────────
// Phase D finding F13: the opponent AI is an interpreter of the ROM's own
// scripts, not a hand port of them.
//
// ai-program.js is generated from data/battle_ai_scripts.s (gen-ai-program.mjs)
// and every command, table and root is checked byte for byte against the retail
// ROM (verify-ai-program.mjs). ai-interpreter.js runs it over the engine state;
// chooseOpponentMoves is that. Gates:
//   * the program equals the ROM (1,749 commands, 25 tables, 32 roots);
//   * the ROM's own AI_THINKING_STRUCT scores, read from the emulator at each
//     trace's first decision (emu/ai_scores.py), are among the interpreter's
//     branches at the ROM's simulatedRNG and Quick Claw draw: 1,698 of 1,698.
//     (Every later turn is checked by diff-emu's ai-score row: 3,872 of 3,873,
//     the miss a harness anomaly.)
// Probes, one per class where the hand-ported handlers were wrong (found by
// arena-solver/tools/ai-parity.mjs over 298,061 panel positions):
//   1. get_weather leaves funcResult stale when no weather is set
//      (src/battle_ai_script_commands.c:1644-1662; AI_WEATHER_SUN is 0), so
//      AI_CV_Hail reads "sun" after a command that left 0.
//   2. AI_CV_Counter's `if_has_move AI_USER, MOVE_MIRROR_COAT` sits at an odd
//      address (0x82DD46D); Cmd_if_has_move reads its operand through a u16
//      pointer (:1806) and the ARM7TDMI's misaligned LDRH rotates it, so a
//      Mirror Coat holder's Counter never takes the Mirror Coat branch. Six
//      emulator decisions show it.
//   3. AI_TryToFaint's x4 bonus (data/battle_ai_scripts.s:2616-2627) reaches
//      status moves: get_how_powerful_move_is gives MOVE_POWER_OTHER, not
//      NOT_MOST_POWERFUL, and if_type_effectiveness reads the move's type.
//   4. AI_CV_MirrorMove reads get_last_used_bank_move (gLastMoves, :840), not
//      the move Mirror Move would copy.
import { execFileSync } from "node:child_process";
import { buildMon, buildStartState, buildAiView, chooseOpponentMoves } from "./logic.js";
import { runAi } from "./ai-interpreter.js";

const TOOLS = "C:/Users/azncu/Desktop/pokemon_code/arena-solver/tools/";
const EMU = "C:/Users/azncu/Desktop/pokemon_code/arena-solver/emu/";
let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } else console.log("  ok   " + m); };
const mk = (species, moves, over = {}) => buildMon({
  species, level: 50, nature: "Hardy", evs: {}, ability: "Pressure", item: null, moves, friendship: 255, ...over,
});
const tool = (args) => {
  try { return { code: 0, out: execFileSync("node", args, { cwd: TOOLS, encoding: "utf8" }) }; }
  catch (e) { return { code: e.status, out: String(e.stdout) }; }
};
const slotScores = (runs, slot) => [...new Set(runs.map((r) => r.scores[slot]))].sort((a, b) => a - b);

console.log("-- gates --");
{
  const v = tool([TOOLS + "verify-ai-program.mjs"]);
  ok(v.code === 0 && /all equal to the ROM/.test(v.out), `the program equals the ROM: ${v.out.trim().split("\n")[0]}`);
  for (const [f, d] of [["rom-ai-turn0-traces.jsonl", "traces"], ["rom-ai-turn0-given.jsonl", "traces-given"]]) {
    const r = tool([TOOLS + "ai-scores-diff.mjs", EMU + "results/" + f, EMU + d]);
    ok(r.code === 0, `${d}: ${r.out.trim().split("\n").pop()}`);
  }
}

console.log("-- 1. get_weather's stale funcResult --");
{
  // Walrein vs Arcanine, the emulator's own case: ROM Hail 101 (AI_CV_Hail2's +1
  // for "sun"), handlers 100.
  const wal = mk("Walrein", ["Blizzard", "Hail", "Yawn", "Protect"], { ability: "Thick Fat" });
  const arc = mk("Arcanine", ["Flamethrower"], { ability: "Intimidate" });
  const st = buildStartState({ you: arc, opp: wal });
  const runs = runAi(buildAiView(wal, arc, st, { qc: false }), [100, 100, 100, 100]);
  const fixed = runAi(buildAiView(wal, arc, st, { qc: false, debug: { weatherBugfix: true } }), [100, 100, 100, 100]);
  ok(slotScores(runs, 1).every((x) => x >= 101), `Hail reads the stale 0 as sun: ${slotScores(runs, 1)} (with a real "no weather": ${slotScores(fixed, 1)})`);
}

console.log("-- 2. Counter's misaligned if_has_move --");
{
  // Wobbuffet's Counter after the player's Flamethrower (emulator battle
  // traces-given/00040, turn 2: ROM Counter 99).
  const wob = mk("Wobbuffet", ["Counter", "Mirror Coat", "Encore", "Destiny Bond"], { ability: "Shadow Tag" });
  const arc = mk("Arcanine", ["Flamethrower", "ExtremeSpeed", "Will-O-Wisp", "Aerial Ace"], { ability: "Intimidate" });
  const st = buildStartState({ you: arc, opp: wob, overrides: { youLastMove: "Flamethrower" } });
  const rom = slotScores(runAi(buildAiView(wob, arc, st, { qc: false }), [100, 100, 100, 100]), 0);
  const aligned = slotScores(runAi(buildAiView(wob, arc, st, { qc: false, debug: { alignedHasMove: true } }), [100, 100, 100, 100]), 0);
  ok(rom.length === 1 && rom[0] === 99, `Counter takes the last-move path: special Flamethrower -> -1 (${rom})`);
  ok(aligned.includes(104), `the aligned read would find Mirror Coat and roll +4 (${aligned})`);
}

console.log("-- 3. TryToFaint's x4 bonus on a status move --");
{
  const sph = mk("Spheal", ["Ice Ball", "Water Pulse", "Hail", "Mud-Slap"], { ability: "Thick Fat" });
  const sal = mk("Salamence", ["Dragon Claw"], { ability: "Intimidate" });
  const st = buildStartState({ you: sal, opp: sph });
  const runs = runAi(buildAiView(sph, sal, st, { qc: false, debug: { weatherBugfix: true } }), [100, 100, 100, 100]);
  const p2 = runs.filter((r) => r.scores[2] === 102).reduce((a, r) => a + r.p, 0);
  ok(Math.abs(p2 - 176 / 256) < 1e-12, `Hail (Ice, x4 into Dragon/Flying) gets +2 with p 176/256 (${p2})`);
}

console.log("-- 4. Mirror Move reads gLastMoves --");
{
  const spe = mk("Spearow", ["Mirror Move", "Peck"], { ability: "Keen Eye", evs: { spe: 252 } });
  const tgt = mk("Snorlax", ["Shadow Ball"], { ability: "Thick Fat" });
  const view = (ov) => buildAiView(spe, tgt, buildStartState({ you: tgt, opp: spe, overrides: ov }), { qc: false });
  // Shadow Ball is on AI_CV_MirrorMove_EncouragedMovesToMirror; the user is faster
  const seen = slotScores(runAi(view({ youLastMove: "Shadow Ball", youLastTakenMove: null }), [100, 100, 100, 100]), 0);
  const notSeen = slotScores(runAi(view({ youLastMove: null, youLastTakenMove: "Shadow Ball" }), [100, 100, 100, 100]), 0);
  ok(seen.includes(102), `gLastMoves = Shadow Ball: the +2 branch exists (${seen})`);
  ok(!notSeen.includes(102), `lastTakenMove alone does not reach the AI (${notSeen})`);
}

console.log("-- the engine asks the interpreter --");
{
  const wal = mk("Walrein", ["Blizzard", "Hail", "Yawn", "Protect"], { ability: "Thick Fat" });
  const arc = mk("Arcanine", ["Flamethrower"], { ability: "Intimidate" });
  const d = chooseOpponentMoves(wal, arc, buildStartState({ you: arc, opp: wal }));
  ok(d.some((x) => x.move === "Hail" && x.prob > 0), `Walrein vs Arcanine: Hail has weight (${d.map((x) => `${x.move} ${x.prob.toFixed(4)}`).join(", ")})`);
}

console.log();
console.log(failures === 0 ? "ALL PASS -- F13 AI interpreter green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

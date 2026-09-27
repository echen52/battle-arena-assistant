// ── test-d-f3-ai-live-context.js ──────────────────────────────────────────
// Phase D finding F3: the AI's context hardcoded four flags to false although
// the engine tracks the state behind them (B3 built Future Sight, Safeguard,
// Perish Song and Yawn; chooseOpponentMoves was never rewired). The A3 / A6 /
// A9 class again: a modelled effect its own AI cannot see.
//
//   Future Sight  AI_CBM_FutureSight (data/battle_ai_scripts.s:500-504):
//                 if_side_affecting AI_TARGET / AI_USER SIDE_STATUS_FUTUREATTACK
//                 -> -12, else +5. The flag is set by Cmd_trysetfutureattack
//                 on the target's side (src/battle_script_commands.c:8937) and
//                 cleared when the attack lands (src/battle_util.c:1818-1823)
//                 -- the lifetime of youFutureSight / oppFutureSight.
//   Safeguard     if_side_affecting AI_TARGET, SIDE_STATUS_SAFEGUARD, in the
//                 status CBMs (Sleep, Paralyze, Toxic/Poison, Will-O-Wisp,
//                 Confuse): -10. youSafeguardTurns.
//   Perish Song   AI_CV_Protect :1899 if_status3 AI_USER, STATUS3_PERISH_SONG.
//   Yawn          AI_CV_Protect :1902 (AI_USER) and :1910 (AI_TARGET)
//                 if_status3 STATUS3_YAWN. you/oppYawnTurns.
//
// Found by the emulator differential: after Kirlia's / Xatu's / Barboach's
// Future Sight the sim's AI chose Future Sight again with P 1; the ROM never did.
import { buildMon, buildStartState, resolveTurn, chooseOpponentMoves } from "./logic.js";

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } else console.log("  ok   " + m); };
const mk = (species, moves, over = {}) => buildMon({
  species, level: 50, nature: "Hardy", evs: {}, ability: "Pressure", item: null, moves, friendship: 255, ...over,
});
const dist = (opp, you, st) => Object.fromEntries(chooseOpponentMoves(opp, you, st).map((c) => [c.move, c.prob]));
const P = (opp, you, over = {}) => dist(opp, you, buildStartState({ you, opp, overrides: over }));
const near = (a, b) => Math.abs((a ?? 0) - b) < 1e-9;
const J = JSON.stringify;

console.log("-- Future Sight --");
{
  const opp = () => mk("Xatu", ["Future Sight", "Spite"], { ability: "Synchronize" });
  const you = () => mk("Snorlax", ["Spite"], { ability: "Thick Fat" });
  // Fresh: +5 over Spite's flat 100.
  ok(near(P(opp(), you())["Future Sight"], 1), `fresh: Future Sight P 1 (+5)`);
  // Pending on the PLAYER's side (the AI's own Future Sight): -12.
  const t = P(opp(), you(), { youFutureSight: { move: "Future Sight", n: 2, dmg: 40 } });
  ok(near(t["Future Sight"], 0), `pending on the target's side: P 0 (got ${J(t)})`);
  // Pending on the AI's OWN side (the player's Future Sight): also -12.
  const u = P(opp(), you(), { oppFutureSight: { move: "Future Sight", n: 2, dmg: 40 } });
  ok(near(u["Future Sight"], 0), `pending on the user's side: P 0 (got ${J(u)})`);
  // Integration, the shape of the ROM traces: after a turn in which the AI
  // used Future Sight, every surviving branch has it pending and the AI's
  // next choice gives it P 0.
  const o = opp(), y = you();
  const branches = resolveTurn({ you: y, opp: o }, buildStartState({ you: y, opp: o }), "Spite", "Future Sight");
  const live = branches.filter((b) => b.state.yourHpPct > 0 && b.state.oppHpPct > 0);
  const ps = live.map((b) => dist(o, y, b.state)["Future Sight"] ?? 0);
  ok(live.length > 0 && ps.every((p) => p === 0), `the turn after using it: P 0 in all ${live.length} branches (got ${J(ps)})`);
}

console.log("-- Safeguard on the target's side --");
{
  const opp = () => mk("Jolteon", ["Thunder Wave", "Spite"], { ability: "Volt Absorb" });
  const you = () => mk("Snorlax", ["Spite"], { ability: "Thick Fat" });
  const a = P(opp(), you());
  ok(a["Thunder Wave"] > 0, `no Safeguard: Thunder Wave chosen sometimes (got ${J(a)})`);
  const b = P(opp(), you(), { youSafeguardTurns: 3 });
  ok(near(b["Thunder Wave"], 0), `Safeguard up: Thunder Wave -10, P 0 (got ${J(b)})`);
  // The AI's OWN Safeguard is a different flag and must not trigger it.
  const c = P(opp(), you(), { oppSafeguardTurns: 3 });
  ok(J(c) === J(a), `the AI's own Safeguard: unchanged (got ${J(c)})`);
}

console.log("-- AI_CV_Protect: Perish Song and Yawn on the USER --");
{
  // Protect normally: +2, then a 50/50 -1 -> {102, 101} beats Spite's 100.
  // A user under Perish Song or Yawn goes to AI_CV_Protect3: no score unless
  // the target's last move was Lock-On -> 100, a tie with Spite.
  const opp = () => mk("Snorlax", ["Protect", "Spite"], { ability: "Thick Fat" });
  const you = () => mk("Snorlax", ["Spite"], { ability: "Thick Fat" });
  ok(near(P(opp(), you())["Protect"], 1), `fresh: Protect P 1`);
  const p = P(opp(), you(), { oppPerishSonged: true });
  ok(near(p["Protect"], 0.5), `user Perish Songed: Protect ties Spite, 0.5 (got ${J(p)})`);
  const y = P(opp(), you(), { oppYawnTurns: 1 });
  ok(near(y["Protect"], 0.5), `user drowsy (Yawn): Protect ties Spite, 0.5 (got ${J(y)})`);
}

console.log("-- AI_CV_Protect: Yawn on the TARGET, behind a Lock-On --");
{
  // With the target's last move Lock-On, the +2 needs a stalling status on the
  // target (:1905-1910); Yawn is one. Without it: {100, 99} at 50/50, and the
  // 100 half ties Spite: P 0.5 x 0.5 = 0.25.
  const opp = () => mk("Snorlax", ["Protect", "Spite"], { ability: "Thick Fat" });
  const you = () => mk("Snorlax", ["Spite", "Lock On"], { ability: "Thick Fat" });
  const a = P(opp(), you(), { youLastMove: "Lock On" });
  ok(near(a["Protect"], 0.25), `target last used Lock-On: Protect P 0.25 (got ${J(a)})`);
  const b = P(opp(), you(), { youLastMove: "Lock On", youYawnTurns: 1 });
  ok(near(b["Protect"], 1), `...and is drowsy: the +2 returns, Protect P 1 (got ${J(b)})`);
}

console.log();
console.log(failures === 0 ? "ALL PASS -- F3 AI live context green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

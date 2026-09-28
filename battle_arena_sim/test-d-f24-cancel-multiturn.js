// ── test-d-f24-cancel-multiturn.js ────────────────────────────────────────
// Phase D finding F24: BattleScript_MoveUsedIsParalyzed runs
// `cancelmultiturnmoves BS_ATTACKER` (data/battle_scripts_1.s:3777) although
// Emerald comments out the C call (src/battle_util.c:2192-2193), and
// BattleScript_DoSelfConfusionDmg opens with it (:3802). A Fly fully paralysed
// on its strike turn lands; the engine kept it airborne (emulator: traces/00376).
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { buildMon, buildStartState, resolveTurn } from "./logic.js";

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } else console.log("  ok   " + m); };
const mk = (species, moves, over = {}) => buildMon({
  species, level: 50, nature: "Hardy", evs: {}, ability: "Keen Eye", item: null, moves, friendship: 255, ...over,
});
const J = JSON.stringify;


console.log("-- F24: paralysis on the strike turn lands the flyer --");
{
  const pid = mk("Pidgeot", ["Fly", "Quick Attack"]);
  const foe = mk("Snorlax", ["Harden"], { ability: "Thick Fat" });
  const st = buildStartState({ you: pid, opp: foe, overrides: { youStatus: "paralysis", youCharging: { move: "Fly", invulnBit: "onair" } } });
  const br = resolveTurn({ you: pid, opp: foe }, st, "Fly", "Harden");
  const para = br.filter((b) => /fully paralyzed/.test(b.label));
  ok(para.length > 0 && para.every((b) => b.state.youCharging == null), `fully paralysed: no longer charging (${J([...new Set(para.map((b) => b.state.youCharging))])})`);
}

console.log("-- F24: a confusion self-hit ends a rampage --");
{
  const tau = mk("Tauros", ["Thrash"], { ability: "Intimidate" });
  const foe = mk("Snorlax", ["Harden"], { ability: "Thick Fat" });
  const st = buildStartState({ you: tau, opp: foe, overrides: { youConfused: true, youConfusionTurns: 3, youLock: { kind: "rampage", move: "Thrash", n: 2 } } });
  const hits = resolveTurn({ you: tau, opp: foe }, st, "Thrash", "Harden").filter((b) => /itself/.test(b.label));
  ok(hits.length > 0 && hits.every((b) => b.state.youLock == null), `self-hit: the lock is gone (${J([...new Set(hits.map((b) => b.state.youLock?.kind ?? null))])})`);
}

console.log("-- F24: a confusion self-hit on the strike turn lands the flyer --");
{
  // (for a rampage, ENDTURN_THRASH's WasUnableToUseMove would cancel it anyway;
  // a two-turn charge has only the script's own cancelmultiturnmoves)
  const pid = mk("Pidgeot", ["Fly"]);
  const foe = mk("Snorlax", ["Harden"], { ability: "Thick Fat" });
  const st = buildStartState({ you: pid, opp: foe, overrides: { youConfused: true, youConfusionTurns: 3, youCharging: { move: "Fly", invulnBit: "onair" } } });
  const hits = resolveTurn({ you: pid, opp: foe }, st, "Fly", "Harden").filter((b) => /itself/.test(b.label));
  ok(hits.length > 0 && hits.every((b) => b.state.youCharging == null), `self-hit: no longer charging (${J([...new Set(hits.map((b) => b.state.youCharging))])})`);
}

console.log();
console.log(failures === 0 ? "ALL PASS -- F24 multi-turn cancel green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

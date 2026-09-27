// ── test-d-f2b-target-hold-effect.js ──────────────────────────────────────
// Phase D finding F2b: what `get_hold_effect AI_TARGET` returns.
//
// Cmd_get_hold_effect (src/battle_ai_script_commands.c:2032-2047) answers for
// the target with GetItemHoldEffect(BATTLE_HISTORY->itemEffects[target]) -- but
// itemEffects holds a HOLD EFFECT (include/battle.h:200, written by
// RecordItemEffectBattle), which GetItemHoldEffect (src/item.c:890-893) reads
// as an ITEM ID. The only effects ever recorded are Focus Band (39, bsc.c:1679
// / 1722 / 5880 / 7509) and Leftovers (43, src/battle_util.c:3411); items 39
// and 43 are the Blue and White Flutes, which have no hold effect. So in every
// reachable singles state the AI sees the target's hold effect as NONE -- it
// never learns the player's item, even a Choice Band.
//
// Three script sites read it: AI_CV_Trick3 / Trick4 (data/battle_ai_scripts.s:
// 2331, 2337) and AI_CV_Thief (:1849). AI_CV_Thief had no engine handler at
// all (ai-dispatch-audit's one reachable gap): with NONE never in its
// encourage list (:1860-1867) it is a flat -2.
//
// Found by the emulator differential: Linoone's Trick x3 into a Choice Band
// Metagross (battle-00035) -- the ROM's AI saw no Band (+5), the sim's did (-3).
import fs from "node:fs";
import { buildMon, buildStartState, chooseOpponentMoves, AI_HANDLERS } from "./logic.js";

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } else console.log("  ok   " + m); };
const mk = (species, moves, over = {}) => buildMon({
  species, level: 50, nature: "Hardy", evs: {}, ability: "Pressure", item: null, moves, friendship: 255, ...over,
});
const J = JSON.stringify;
const P = (opp, you) => Object.fromEntries(chooseOpponentMoves(opp, you, buildStartState({ you, opp })).map((c) => [c.move, c.prob]));
const near = (a, b) => Math.abs((a ?? 0) - b) < 1e-9;

console.log("-- Trick: the AI never sees the target's item --");
{
  // AI_CV_Trick3: the user's Choice Band -> +5 unless the TARGET's (believed)
  // hold effect is Choice Band too. The AI believes NONE: +5 against a Band.
  const opp = () => mk("Linoone", ["Trick", "Spite"], { ability: "Pickup", item: "Choice Band" });
  for (const item of [null, "Choice Band", "Leftovers"]) {
    const p = P(opp(), mk("Metagross", ["Spite"], { ability: "Clear Body", item }));
    ok(near(p["Trick"], 1), `Choice Band Linoone vs Metagross holding ${item}: Trick +5, P 1 (got ${J(p)})`);
  }
  // AI_CV_Trick4 (a confusing berry): the -3 for a target holding one too never
  // fires, so the result is the same whatever the target holds.
  const opp4 = () => mk("Linoone", ["Trick", "Spite"], { ability: "Pickup", item: "Figy Berry" });
  const a = J(P(opp4(), mk("Metagross", ["Spite"], { ability: "Clear Body", item: "Figy Berry" })));
  const b = J(P(opp4(), mk("Metagross", ["Spite"], { ability: "Clear Body", item: null })));
  ok(a === b, `Figy Berry Linoone: same choice whether the target holds a Figy Berry or nothing (${a} vs ${b})`);
}

console.log("-- Thief: AI_CV_Thief is a flat -2 --");
{
  // Thief is the only damaging move, so TryToFaint scores it nothing; Thief
  // 100 - 2 = 98 loses to Spite's flat 100, whatever the target holds
  // (Leftovers IS on the encourage list, but the AI cannot see it).
  for (const item of [null, "Leftovers"]) {
    const p = P(mk("Snorlax", ["Thief", "Spite"], { ability: "Thick Fat" }), mk("Snorlax", ["Spite"], { ability: "Thick Fat", item }));
    ok(near(p["Spite"], 1), `Thief vs Spite, target holding ${item}: Thief 98 < Spite 100 (got ${J(p)})`);
  }
  ok(!!AI_HANDLERS.EFFECT_THIEF?.checkViability && !AI_HANDLERS.EFFECT_THIEF.checkBadMove,
    "EFFECT_THIEF has a CV handler and no CBM (source dispatches only AI_CV_Thief, :722)");
}

console.log("-- the encourage list, derived from source --");
{
  // Amendment 10: the handler's literal list is cross-checked against the script.
  const s = fs.readFileSync("../../pokeemerald/data/battle_ai_scripts.s", "utf8");
  const block = s.split("AI_CV_Thief_EncourageItemsToSteal:")[1].split(".byte -1")[0];
  const fromSource = [...block.matchAll(/HOLD_EFFECT_[A-Z_]+/g)].map((m) => m[0]).sort();
  const { THIEF_ENCOURAGED_HOLD_EFFECTS } = await import("./logic.js");
  ok(J([...THIEF_ENCOURAGED_HOLD_EFFECTS].sort()) === J(fromSource), `Thief list equals the script's ${fromSource.length} entries`);
}

console.log();
console.log(failures === 0 ? "ALL PASS -- F2b target hold effect green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

// ── test-d-f40-teeter-dance.js ────────────────────────────────────────────
// Phase D finding F40: Teeter Dance's loop decides its own Skill.
//
// BattleScript_EffectTeeterDance (data/battle_scripts_1.s:2571-2596) loops
// gBattlerTarget over every battler, opening each pass with
// movevaluescleanup (MoveValuesCleanUp, src/battle_script_commands.c:
// 3621-3630: gMoveResultFlags = 0, MISS_TYPE = 0), and skips the user after
// that cleanup. AddSkillPoints runs at `end` (Cmd_end, :3950-3953) on
// whatever the LAST pass left. In singles the player is battler 0 and the
// opponent battler 1, so:
//   - the player's Teeter Dance ends on the foe's pass: its flags stand;
//   - the opponent's ends on its OWN pass, which wiped them: a miss, or a
//     Protect-block, scores +1.
// Per pass, before accuracycheck: Own Tempo prints
// STRINGID_PKMNPREVENTSCONFUSIONWITH (-3, :2598-2602), a Substitute prints
// BUTITFAILED and sets no flag (+1, :2610-2614), already confused sets the
// alreadyStatused bit (-2, :2616-2621; the cleanup does not clear it); after
// it, Safeguard prints USEDSAFEGUARD and sets no flag (+1, :2604-2608). The
// attackcanceler's own Protect flag (:992-1001) is wiped by the first pass's
// cleanup, so a protected foe matters only at the pass's accuracycheck.
// The engine confused through Safeguard, scored a Substitute -2, and scored
// the opponent's miss -2 and its Protect-block 0.
// Found by the emulator: traces-history/00136.
import { execFileSync } from "node:child_process";
import { buildMon, buildStartState, applyMove, skillDelta } from "./logic.js";

const TOOLS = "C:/Users/azncu/Desktop/pokemon_code/arena-solver/tools/";
const EMU = "C:/Users/azncu/Desktop/pokemon_code/arena-solver/emu/";
let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } else console.log("  ok   " + m); };
const mk = (species, moves, over = {}) => buildMon({
  species, level: 50, nature: "Hardy", evs: {}, ability: "Pressure", item: null, moves, friendship: 255, ...over,
});
const dancer = mk("Spinda", ["Teeter Dance"], { ability: "Own Tempo" }); // the dancer's own ability plays no part
const plain = mk("Snorlax", ["Rest"], { ability: "Thick Fat" });
const tempo = mk("Slowbro", ["Rest"], { ability: "Own Tempo" });
// actor: "you" = battler 0, "opp" = battler 1. hit / blocked are the enumerator's outcome.
const dance = (actor, target, { hit = true, blocked = false, overrides = {} } = {}) => {
  const ctx = actor === "you" ? { you: dancer, opp: target } : { you: target, opp: dancer };
  const s = buildStartState({ ...ctx, overrides });
  const key = actor === "you" ? "skillYou" : "skillOpp";
  const b4 = s[key];
  applyMove(ctx, s, actor, "Teeter Dance", hit, false, false, false, false, false, null, null, false, blocked);
  return { d: s[key] - b4, confused: actor === "you" ? s.oppConfused : s.youConfused };
};
const foeKey = (actor, k) => (actor === "you" ? "opp" : "you") + k;

for (const actor of ["you", "opp"]) {
  const who = actor === "you" ? "player (battler 0)" : "opponent (battler 1)";
  console.log(`-- F40: the ${who}'s Teeter Dance --`);
  let r = dance(actor, plain);
  ok(r.confused && r.d === skillDelta("landed"), `confuses, +1 (${r.d})`);
  r = dance(actor, plain, { hit: false });
  ok(!r.confused && r.d === (actor === "you" ? skillDelta("miss") : skillDelta("landed")), `a miss: ${actor === "you" ? "-2, its flag stands" : "+1, its own pass wiped the flag"} (${r.d})`);
  r = dance(actor, plain, { hit: false, blocked: true });
  ok(!r.confused && r.d === (actor === "you" ? 0 : skillDelta("landed")), `into Protect: ${actor === "you" ? "0" : "+1"} (${r.d})`);
  r = dance(actor, plain, { overrides: { [foeKey(actor, "SubstituteHP")]: 30 } });
  ok(!r.confused && r.d === skillDelta("landed"), `a Substitute: BUTITFAILED, no flag, +1 (${r.d})`);
  r = dance(actor, plain, { overrides: { [foeKey(actor, "SafeguardTurns")]: 5 } });
  ok(!r.confused && r.d === skillDelta("landed"), `Safeguard: no confusion, +1 (${r.d})`);
  r = dance(actor, tempo);
  ok(!r.confused && r.d === skillDelta("landed") - 3, `Own Tempo: +1 and the -3 string (${r.d})`);
  r = dance(actor, tempo, { hit: false, blocked: true });
  ok(!r.confused && r.d === skillDelta("landed") - 3, `Own Tempo into Protect: decided before the accuracycheck, -2 (${r.d})`);
  r = dance(actor, plain, { overrides: { [foeKey(actor, "Confused")]: true } });
  ok(r.d === skillDelta("noEffect"), `already confused: the alreadyStatused bit, -2 (${r.d})`);
}

console.log("-- the emulator's traces --");
{
  const traces = ["traces-history/battle-00136.json"];
  let out = "", code = 0;
  try { out = execFileSync("node", [TOOLS + "diff-emu.mjs", ...traces.map((t) => EMU + t)], { cwd: TOOLS, encoding: "utf8" }); }
  catch (e) { out = String(e.stdout); code = e.status; }
  ok(code === 0, `exact replay: ${(out.match(/divergences \d+/g) || []).join(", ")}`);
}

console.log();
console.log(failures === 0 ? "ALL PASS -- F40 Teeter Dance green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

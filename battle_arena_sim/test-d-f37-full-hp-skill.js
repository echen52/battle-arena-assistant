// ── test-d-f37-full-hp-skill.js ───────────────────────────────────────────
// Phase D finding F37: a heal that finds nothing to heal scores +1.
//
// BattleScript_AlreadyAtFullHp (data/battle_scripts_1.s:2042-2046) and
// BattleScript_SwallowFail (:2126-2130) set no MOVE_RESULT flag, and neither
// STRINGID_PKMNHPFULL nor STRINGID_FAILEDTOSWALLOW is a DeductSkillPoints
// string (src/battle_arena.c:628-651): AddSkillPoints' final else, +1
// (:617-620). Rest has scored this way since B3 batch 4d; the others did not:
//   Recover / Softboiled / Milk Drink  tryhealhalfhealth (:676, :2031;
//                                      src/battle_script_commands.c:6615-6631)
//   Synthesis / Moonlight / Morning Sun recoverbasedonsunlight (:1737)
//   Swallow, nothing stored or full HP  stockpiletohpheal (:6894-6923)
//   Present's heal arm into a full target (:8641-8644)
// Found by the emulator: traces-history/00003 (Starmie's Recover at full HP,
// ROM Skill +1, the engine -2).
import { execFileSync } from "node:child_process";
import { buildMon, buildStartState, applyMove, skillDelta } from "./logic.js";

const TOOLS = "C:/Users/azncu/Desktop/pokemon_code/arena-solver/tools/";
const EMU = "C:/Users/azncu/Desktop/pokemon_code/arena-solver/emu/";
let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } else console.log("  ok   " + m); };
const mk = (species, moves, over = {}) => buildMon({
  species, level: 50, nature: "Hardy", evs: {}, ability: "Pressure", item: null, moves, friendship: 255, ...over,
});
const foe = mk("Snorlax", ["Rest"], { ability: "Thick Fat" });
const run = (you, move, overrides = {}) => {
  const s = buildStartState({ you, opp: foe, overrides });
  const b4 = s.skillYou;
  applyMove({ you, opp: foe }, s, "you", move, true, false);
  return { s, d: s.skillYou - b4 };
};

console.log("-- F37: at full HP, +1 and nothing healed --");
for (const [species, move] of [["Starmie", "Recover"], ["Chansey", "Softboiled"], ["Miltank", "Milk Drink"], ["Bellossom", "Synthesis"], ["Umbreon", "Moonlight"]]) {
  const { s, d } = run(mk(species, [move]), move);
  ok(s.yourHpPct === 100 && d === skillDelta("landed"), `${move} at full HP: +1 (${d})`);
}
{
  const swal = mk("Swalot", ["Swallow", "Stockpile"], { ability: "Liquid Ooze" });
  const none = run(swal, "Swallow");
  ok(none.d === skillDelta("landed"), `Swallow with nothing stored: +1 (${none.d})`);
  const full = run(swal, "Swallow", { youStockpile: 2 });
  ok(full.d === skillDelta("landed") && full.s.youStockpile === 0, `Swallow at full HP: +1, the counter still spent (${full.d}, ${full.s.youStockpile})`);
}
{
  // Present's heal arm (Cmd_presentdamagecalculation's rand >= 204), passed in
  // as applyMove's variablePower "heal": into a full-HP target, AlreadyAtFullHp.
  const del = mk("Delibird", ["Present"], { ability: "Vital Spirit" });
  const heal = (oppHpPct) => {
    const s = buildStartState({ you: del, opp: foe, overrides: { oppHpPct } });
    const b4 = s.skillYou;
    applyMove({ you: del, opp: foe }, s, "you", "Present", true, false, false, false, false, false,
      null, null, false, false, false, null, null, false, null, null, "heal");
    return { s, d: s.skillYou - b4 };
  };
  const full = heal(100);
  ok(full.s.oppHpPct === 100 && full.d === skillDelta("landed"), `Present's heal arm into a full target: +1 (${full.d})`);
  const half = heal(50);
  ok(half.s.oppHpPct > 50 && half.d === skillDelta("landed"), `(control) ...into a hurt target heals it, +1 (${half.d})`);
}
{
  const { s, d } = run(mk("Starmie", ["Recover"]), "Recover", { yourHpPct: 50 });
  ok(s.yourHpPct > 50 && d === skillDelta("landed"), `(control) Recover below full heals, +1 (${d})`);
}

console.log("-- the emulator's traces --");
{
  const traces = ["traces-history/battle-00003.json"];
  let out = "", code = 0;
  try { out = execFileSync("node", [TOOLS + "diff-emu.mjs", ...traces.map((t) => EMU + t)], { cwd: TOOLS, encoding: "utf8" }); }
  catch (e) { out = String(e.stdout); code = e.status; }
  ok(code === 0, `exact replay: ${(out.match(/divergences \d+/g) || []).join(", ")}`);
}

console.log();
console.log(failures === 0 ? "ALL PASS -- F37 full-HP Skill green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

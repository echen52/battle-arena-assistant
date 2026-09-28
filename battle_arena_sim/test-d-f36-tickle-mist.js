// ── test-d-f36-tickle-mist.js ─────────────────────────────────────────────
// Phase D finding F36: Mist's Skill, and Tickle's three clauses.
//
// ChangeStatBuffs (src/battle_script_commands.c:6960-6980) stops a stat
// DECREASE on a misted side before anything else, pushes
// BattleScript_MistProtected (data/battle_scripts_1.s:3343-3347) and sets no
// MOVE_RESULT flag. STRINGID_PKMNPROTECTEDBYMIST is not one of
// BattleArena_DeductSkillPoints' strings (src/battle_arena.c:628-651), so
// AddSkillPoints falls through to +1 (:617-620). The engine scored -2.
//
// BattleScript_EffectTickle (data/battle_scripts_1.s:2652-2678) is two
// statbuffchange calls and, unlike BattleScript_EffectStatDown (:536), no
// Substitute check -- ChangeStatBuffs has none either. So in the ROM:
//   - Mist blocks BOTH halves (+1);
//   - a Substitute does not stop it (the engine failed it);
//   - Hyper Cutter stops the Attack half with STRINGID_PKMNSXPREVENTSYLOSS
//     (:7022-7034, BattleScript_AbilityNoSpecificStatLoss), -3, and the
//     Defense half lands: +1 -3 = -2 (the engine scored +1).
// Clear Body / White Smoke stay -2 (+1 and STRINGID_PKMNPREVENTSSTATLOSSWITH).
import { buildMon, buildStartState, applyMove, skillDelta } from "./logic.js";

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } else console.log("  ok   " + m); };
const mk = (species, moves, over = {}) => buildMon({
  species, level: 50, nature: "Hardy", evs: {}, ability: "Pressure", item: null, moves, friendship: 255, ...over,
});
const you = mk("Snorlax", ["Growl", "Tickle", "Screech"], { ability: "Thick Fat" });
const run = (opp, move, overrides = {}) => {
  const s = buildStartState({ you, opp, overrides });
  const b4 = s.skillYou;
  applyMove({ you, opp }, s, "you", move, true, false);
  return { s, d: s.skillYou - b4 };
};
const dew = mk("Dewgong", ["Rest"], { ability: "Thick Fat" });

console.log("-- F36: a Mist-blocked stat drop scores +1 --");
for (const move of ["Growl", "Screech"]) {
  const { s, d } = run(dew, move, { oppMistTurns: 5 });
  ok(s.oppStages.atk === 0 && s.oppStages.def === 0, `${move}: no drop through Mist`);
  ok(d === skillDelta("landed"), `${move}: Skill +1, no flag and no deducting string (${d})`);
}

console.log("-- F36: Tickle --");
{
  const { s, d } = run(dew, "Tickle", { oppMistTurns: 5 });
  ok(s.oppStages.atk === 0 && s.oppStages.def === 0, `Mist blocks both halves (atk ${s.oppStages.atk}, def ${s.oppStages.def})`);
  ok(d === skillDelta("landed"), `...and scores +1 (${d})`);
}
{
  const { s, d } = run(dew, "Tickle", { oppSubstituteHP: 40 });
  ok(s.oppStages.atk === -1 && s.oppStages.def === -1, `through a Substitute: both drop (atk ${s.oppStages.atk}, def ${s.oppStages.def})`);
  ok(s.oppSubstituteHP === 40 && d === skillDelta("landed"), `the Substitute is untouched, +1 (${d})`);
}
{
  const { s, d } = run(mk("Kingler", ["Rest"], { ability: "Hyper Cutter" }), "Tickle");
  ok(s.oppStages.atk === 0 && s.oppStages.def === -1, `Hyper Cutter: the Attack half stops, Defense falls (atk ${s.oppStages.atk}, def ${s.oppStages.def})`);
  ok(d === skillDelta("landed") - 3, `...+1 and the -3 string: -2 (${d})`);
}
{
  const { s, d } = run(mk("Tentacruel", ["Rest"], { ability: "Clear Body" }), "Tickle");
  ok(s.oppStages.atk === 0 && s.oppStages.def === 0 && d === -2, `Clear Body: nothing, -2 (unchanged; ${d})`);
}
{
  const { s, d } = run(dew, "Tickle");
  ok(s.oppStages.atk === -1 && s.oppStages.def === -1 && d === skillDelta("landed"), `(control) plain Tickle: -1/-1, +1 (${d})`);
}

console.log();
console.log(failures === 0 ? "ALL PASS -- F36 Tickle and Mist green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

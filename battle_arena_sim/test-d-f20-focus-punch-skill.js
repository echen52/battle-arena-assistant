// ── test-d-f20-focus-punch-skill.js ───────────────────────────────────────
// Phase D finding F20: a Focus Punch that loses its focus scores Skill +1.
//
// BattleScript_EffectFocusPunch (data/battle_scripts_1.s:2260-2266): after
// attackcanceler, `jumpifnodamage` -- a user hit this turn takes ppreduce,
// "lost its focus", goto BattleScript_MoveEnd. No result flag is set, so the
// script's `end` (Cmd_end, src/battle_script_commands.c:3950-3953) calls
// BattleArena_AddSkillPoints (src/battle_arena.c:588-621) and falls to the last
// arm: not protected, +1. The engine scored it as no effect, -2.
// Found by the emulator: 14 created-lead traces (Electrode / Snorlax /
// Arcanine hitting a Focus Punch user first), ROM +1 every time.
import { execFileSync } from "node:child_process";
import { buildMon, buildStartState, resolveTurn } from "./logic.js";

const TOOLS = "C:/Users/azncu/Desktop/pokemon_code/arena-solver/tools/";
const EMU = "C:/Users/azncu/Desktop/pokemon_code/arena-solver/emu/";
let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } else console.log("  ok   " + m); };
const mk = (species, moves, over = {}) => buildMon({
  species, level: 50, nature: "Hardy", evs: {}, ability: "Static", item: null, moves, friendship: 255, ...over,
});

const ele = mk("Electrode", ["Swift", "Harden"], { ability: "Soundproof" });
const bre = mk("Breloom", ["Focus Punch"], { ability: "Effect Spore" });
const st = buildStartState({ you: ele, opp: bre });
const hit = resolveTurn({ you: ele, opp: bre }, st, "Swift", "Focus Punch");
ok(hit.length > 0 && hit.every((b) => b.state.skillOpp === 1), `hit first: the lost focus scores +1 (${[...new Set(hit.map((b) => b.state.skillOpp))]})`);
ok(hit.every((b) => b.state.yourHpPct === 100), "and does nothing");
const notHit = resolveTurn({ you: ele, opp: bre }, st, "Harden", "Focus Punch").filter((b) => b.state.yourHpPct < 100);
ok(notHit.length > 0 && notHit.every((b) => b.state.skillOpp === 1), "not hit: it lands, +1 (Fighting into Electric, neutral)");

let out = "", code = 0;
const traces = ["00160", "00646", "00910", "01072"].map((n) => `${EMU}traces-given/battle-${n}.json`);
try { out = execFileSync("node", [TOOLS + "diff-emu.mjs", ...traces], { cwd: TOOLS, encoding: "utf8", env: { ...process.env, DIFF_EXACT: "0" } } /* validated in the point-estimate mode, before F31 */); }
catch (e) { out = String(e.stdout); code = e.status; }
ok(code === 0, `emulator traces 00160 / 00646 / 00910 / 01072: ${(out.match(/divergences \d+/g) || []).join(", ")}`);

console.log();
console.log(failures === 0 ? "ALL PASS -- F20 Focus Punch Skill green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

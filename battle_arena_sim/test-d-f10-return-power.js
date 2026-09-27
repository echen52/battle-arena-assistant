// ── test-d-f10-return-power.js ────────────────────────────────────────────
// Phase D F10: Return and Frustration are power 1 in the ROM's move table
// (src/data/battle_moves.h, MOVE_RETURN / MOVE_FRUSTRATION); the engine's
// converted table said 102. The battle computes the real power from
// friendship (Cmd_friendshiptodamagecalculation -> gDynamicBasePower), but the
// AI reads the TABLE: to it Return is a power-1 move -- excluded from
// get_how_powerful_move_is on both sides and never an if_can_faint KO -- and
// every AI damage estimate clears gDynamicBasePower
// (src/battle_ai_script_commands.c:1188-1189, 1471-1474).
//
// Found by the emulator differential: Pidgeot's Aerial Ace x3 into Suicune
// (battle-00359), where the sim gave Return P 1 -- it thought Return out-damaged
// Aerial Ace, which then took "not the most powerful" -1.
import { execFileSync } from "node:child_process";
import { buildMon, buildStartState, chooseOpponentMoves, calcDamage, MOVES } from "./logic.js";

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } else console.log("  ok   " + m); };
const mk = (species, moves, over = {}) => buildMon({
  species, level: 50, nature: "Hardy", evs: {}, ability: "Pressure", item: null, moves, friendship: 255, ...over,
});
const near = (a, b) => Math.abs((a ?? 0) - b) < 1e-12;
const J = JSON.stringify;

ok(MOVES.Return.power === 1 && MOVES.Frustration.power === 1, `the table: Return and Frustration power 1 (got ${MOVES.Return.power} / ${MOVES.Frustration.power})`);

// The battle still hits at the friendship power (values recorded before the change).
const su = mk("Suicune", ["Spite"]);
const cases = [["Return", 255, 48], ["Return", 128, 24], ["Frustration", 0, 48], ["Frustration", 100, 30]];
for (const [m, f, want] of cases) {
  const got = calcDamage(mk("Pidgeot", [m], { friendship: f }), su, m);
  ok(got === want, `battle: ${m} at friendship ${f} deals ${want} (got ${got})`);
}
// The AI's estimate is power 1.
const est = calcDamage(mk("Pidgeot", ["Return"]), su, "Return", { aiEstimate: true });
ok(est <= 3, `the AI estimates Return at power 1 (got ${est})`);

// The ROM case: Pidgeot's Return / Aerial Ace / Steel Wing / Mud-Slap into
// Suicune. Aerial Ace is now the most powerful ELIGIBLE move (Return is not
// eligible), so both score 100 and tie -- P 0.5 each, where the sim had Return 1.
const d = Object.fromEntries(chooseOpponentMoves(
  mk("Pidgeot", ["Return", "Aerial Ace", "Steel Wing", "Mud-Slap"], { ability: "Keen Eye" }), su,
  buildStartState({ you: su, opp: mk("Pidgeot", ["Return", "Aerial Ace", "Steel Wing", "Mud-Slap"], { ability: "Keen Eye" }) }),
).map((c) => [c.move, c.prob]));
ok(near(d.Return, 0.5) && near(d["Aerial Ace"], 0.5), `Pidgeot: Return and Aerial Ace tie, 0.5 each (got ${J(d)})`);

// The table audit that found it.
let code = 0;
try { execFileSync("node", ["C:/Users/azncu/Desktop/pokemon_code/arena-solver/tools/move-data-audit.mjs"], { encoding: "utf8" }); }
catch (e) { code = e.status; }
ok(code === 0, `move-data-audit: the engine's move table equals the ROM's (exit ${code})`);

console.log();
console.log(failures === 0 ? "ALL PASS -- F10 Return power green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

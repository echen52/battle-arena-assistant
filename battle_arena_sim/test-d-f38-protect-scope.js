// ── test-d-f38-protect-scope.js ───────────────────────────────────────────
// Phase D finding F38: what Protect blocks.
//
// Cmd_attackcanceler blocks when DEFENDER_IS_PROTECTED
// (src/battle_script_commands.c:57: the TARGET's Protect and the move's
// FLAG_PROTECT_AFFECTED) AND the move is not a two-turn move on its charging
// turn (:992-994, IsTwoTurnsMove :8196-8207 -- Skull Bash, Razor Wind, Sky
// Attack, SolarBeam, the semi-invulnerable moves, Bide -- unless
// STATUS2_MULTIPLETURNS, i.e. already charging). And the target of a
// MOVE_TARGET_USER move is its own user (GetMoveTarget, src/battle_util.c:
// 3902-3905; HandleAction_UseMove, :245-247), who cannot be protected on its
// own action. The engine blocked every FLAG_PROTECT_AFFECTED move, so Haze,
// Milk Drink, Hail, Wish, Imprison, Grudge (and Bide) failed into the foe's
// Protect, and a charging turn was stopped before it began.
// Emulator: traces-history/00074, 00263 (Grudge), 00094, 00359 (SolarBeam).
import { execFileSync } from "node:child_process";
import { buildMon, buildStartState, resolveTurn, skillDelta } from "./logic.js";
import { moveTarget } from "./move-flags.js";

const TOOLS = "C:/Users/azncu/Desktop/pokemon_code/arena-solver/tools/";
const EMU = "C:/Users/azncu/Desktop/pokemon_code/arena-solver/emu/";
let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } else console.log("  ok   " + m); };
const mk = (species, moves, over = {}) => buildMon({
  species, level: 50, nature: "Hardy", evs: {}, ability: "Pressure", item: null, moves, friendship: 255, ...over,
});
const star = mk("Starmie", ["Protect", "Surf"], { ability: "Natural Cure" });
// the player's Protect succeeds on the first use (rate 1), so every branch has it up
const turn = (opp, oppMove, overrides = {}) => {
  const st = buildStartState({ you: star, opp, overrides });
  return resolveTurn({ you: star, opp }, st, "Protect", oppMove).map((b) => ({ ...b, d: b.state.skillOpp - st.skillOpp }));
};
const uniq = (xs) => [...new Set(xs)].join(",");

console.log("-- F38: the generated target table --");
ok(moveTarget("Haze") === "MOVE_TARGET_USER" && moveTarget("Grudge") === "MOVE_TARGET_USER" && moveTarget("Surf") === "MOVE_TARGET_BOTH", "Haze, Grudge USER; Surf BOTH");

console.log("-- F38: a self-targeting move is not blocked by the foe's Protect --");
{
  const br = turn(mk("Weezing", ["Haze"], { ability: "Levitate" }), "Haze", { youStages: { atk: 2 } });
  ok(br.every((b) => b.state.youStages.atk === 0), `Haze resets the protected player's stages (${uniq(br.map((b) => b.state.youStages.atk))})`);
  ok(br.every((b) => b.d === skillDelta("landed")), `...and scores +1 (${uniq(br.map((b) => b.d))})`);
}
{
  const milk = mk("Miltank", ["Milk Drink"], { ability: "Thick Fat" });
  const br = turn(milk, "Milk Drink", { oppHpPct: 40 });
  ok(br.every((b) => b.state.oppHpPct > 40 && b.d === skillDelta("landed")), `Milk Drink heals through the foe's Protect, +1 (${uniq(br.map((b) => b.d))})`);
}
{
  // Bide's SET turn targets its user and goes through; its unleash retargets
  // the foe and is blocked (test-b3-bide PART 5).
  const br = turn(mk("Snorlax", ["Bide"], { ability: "Thick Fat" }), "Bide");
  ok(br.every((b) => b.state.oppLock?.kind === "bide" && b.d === skillDelta("landed")), `Bide's set turn locks through the foe's Protect, +1 (${uniq(br.map((b) => b.d))})`);
}
{
  const br = turn(mk("Walrein", ["Hail"], { ability: "Thick Fat" }), "Hail");
  ok(br.every((b) => b.state.weatherType === "hail"), `Hail is set (${uniq(br.map((b) => b.state.weatherType))})`);
}

console.log("-- F38: a charging turn is not blocked; the strike is --");
{
  const sb = mk("Tropius", ["SolarBeam"], { ability: "Chlorophyll" });
  const br = turn(sb, "SolarBeam");
  ok(br.every((b) => b.state.oppCharging?.move === "SolarBeam"), `SolarBeam starts charging (${uniq(br.map((b) => b.state.oppCharging?.move ?? "none"))})`);
  ok(br.every((b) => b.d === skillDelta("landed")), `...and the charge turn scores +1 (${uniq(br.map((b) => b.d))})`);
  const strike = turn(sb, "SolarBeam", { oppCharging: { move: "SolarBeam" } });
  ok(strike.every((b) => b.state.yourHpPct === 100 && b.d === 0), `(control) the strike turn IS blocked: no damage, 0 (${uniq(strike.map((b) => b.d))})`);
}
{
  const fly = mk("Pidgeot", ["Fly"], { ability: "Keen Eye" });
  const br = turn(fly, "Fly");
  ok(br.every((b) => b.state.oppCharging?.move === "Fly"), `Fly takes off (${uniq(br.map((b) => b.state.oppCharging?.move ?? "none"))})`);
}
{
  const br = turn(mk("Snorlax", ["Body Slam"], { ability: "Thick Fat" }), "Body Slam");
  ok(br.every((b) => b.state.yourHpPct === 100 && b.d === 0), `(control) Body Slam is blocked, 0 (${uniq(br.map((b) => b.d))})`);
}

console.log("-- the emulator's traces --");
{
  const traces = ["traces-history/battle-00074.json", "traces-history/battle-00263.json", "traces-history/battle-00094.json", "traces-history/battle-00359.json"];
  let out = "", code = 0;
  try { out = execFileSync("node", [TOOLS + "diff-emu.mjs", ...traces.map((t) => EMU + t)], { cwd: TOOLS, encoding: "utf8" }); }
  catch (e) { out = String(e.stdout); code = e.status; }
  ok(code === 0, `exact replay: ${(out.match(/divergences \d+/g) || []).join(", ")}`);
}

console.log();
console.log(failures === 0 ? "ALL PASS -- F38 Protect scope green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

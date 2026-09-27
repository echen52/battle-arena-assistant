// ── test-d-f12-ai-tables.js ───────────────────────────────────────────────
// Phase D F12: two AI lookup tables were hand-transcribed wrong.
//   AI_CV_ChangeSelfAbility_AbilitiesToEncourage (data/battle_ai_scripts.s:
//     2373-2390) has 16 abilities; the engine had the first 12 -- no Marvel
//     Scale, Pure Power, CHLOROPHYLL or Shield Dust.
//   AI_CV_Recycle_ItemsToEncourage (:2438-2442) lists three ITEMS (Chesto,
//     Lum, Starf Berry), compared with the used item (Cmd_get_used_held_item);
//     the engine had nine hold effects that appear in no script table.
// Both are now generated into ai-tables.js (gen-ai-tables.mjs) and imported,
// as are the Trick, Thief and AttackDown / SpAtkDown type lists; the type
// lists the engine derives from PHYSICAL_TYPES / SPECIAL_TYPES are
// cross-checked here (amendment 10).
//
// Found by the emulator differential: Venonat's Skill Swap into the Tropius
// lead (Chlorophyll) -- chosen by the ROM, P 0 in the sim.
import { buildMon, buildStartState, chooseOpponentMoves } from "./logic.js";
import * as T from "./ai-tables.js";
import { PHYSICAL_TYPES, SPECIAL_TYPES } from "./type-data.js";

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } else console.log("  ok   " + m); };
const mk = (species, moves, over = {}) => buildMon({
  species, level: 50, nature: "Hardy", evs: {}, ability: "Pressure", item: null, moves, friendship: 255, ...over,
});
const near = (a, b) => Math.abs((a ?? 0) - b) < 1e-12;
const J = JSON.stringify;

console.log("-- Skill Swap into Chlorophyll --");
{
  // AI_CV_ChangeSelfAbility: the user's Compound Eyes is not listed, the
  // target's Chlorophyll IS -> +2 on 206/256 (F8), against Spite's flat 100.
  const opp = mk("Venonat", ["Skill Swap", "Spite"], { ability: "Compound Eyes" });
  const you = mk("Tropius", ["Spite"], { ability: "Chlorophyll" });
  const p = chooseOpponentMoves(opp, you, buildStartState({ you, opp })).find((c) => c.move === "Skill Swap")?.prob ?? 0;
  ok(near(p, 206 / 256 + 25 / 256), `Skill Swap into Chlorophyll: P ${206 / 256 + 25 / 256} (got ${p})`);
}

console.log("-- Recycle: three items --");
{
  const P = (used) => {
    const opp = mk("Snorlax", ["Recycle", "Spite"], { ability: "Thick Fat" });
    const you = mk("Snorlax", ["Spite"], { ability: "Thick Fat" });
    return chooseOpponentMoves(opp, you, buildStartState({ you, opp, overrides: { oppUsedItem: used } })).find((c) => c.move === "Recycle")?.prob ?? 0;
  };
  // encouraged: +1 on 206/256 (if_random_less_than 50 -> end)
  ok(near(P("Lum Berry"), 206 / 256 + 25 / 256), `a used Lum Berry: encouraged (got ${P("Lum Berry")})`);
  ok(near(P("Chesto Berry"), 206 / 256 + 25 / 256), `a used Chesto Berry: encouraged (got ${P("Chesto Berry")})`);
  // not on the list: -2 -- Sitrus is a RESTORE_HP berry, which the old engine list encouraged
  ok(near(P("Sitrus Berry"), 0), `a used Sitrus Berry: -2 (got ${P("Sitrus Berry")})`);
  ok(near(P("Cheri Berry"), 0), `a used Cheri Berry (CURE_PAR): -2 (got ${P("Cheri Berry")})`);
}

console.log("-- the tables, as the script lists them --");
{
  ok(T.CHANGE_SELF_ABILITY_ENCOURAGED.size === 16 && T.CHANGE_SELF_ABILITY_ENCOURAGED.has("Chlorophyll"), `ChangeSelfAbility: 16, Chlorophyll among them`);
  ok(J([...T.RECYCLE_ENCOURAGED_ITEMS].sort()) === J(["ITEM_CHESTO_BERRY", "ITEM_LUM_BERRY", "ITEM_STARF_BERRY"]), `Recycle: the three berries`);
  const same = (a, b) => J([...a].sort()) === J([...b].sort());
  const phys = new Set(PHYSICAL_TYPES), spec = new Set(SPECIAL_TYPES);
  for (const name of ["DEFENSE_UP_PHYSICAL_TYPES", "SP_DEF_UP_PHYSICAL_TYPES", "REFLECT_PHYSICAL_TYPES", "COUNTER_PHYSICAL_TYPES"]) {
    ok(same(T[name], phys), `${name} equals the engine's PHYSICAL_TYPES (${[...T[name]].length})`);
  }
  for (const name of ["LIGHT_SCREEN_SPECIAL_TYPES", "MIRROR_COAT_SPECIAL_TYPES", "SP_ATK_DOWN_SPECIAL_TYPES"]) {
    ok(same(T[name], spec), `${name} equals the engine's SPECIAL_TYPES (${[...T[name]].length})`);
  }
}

console.log();
console.log(failures === 0 ? "ALL PASS -- F12 AI tables green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

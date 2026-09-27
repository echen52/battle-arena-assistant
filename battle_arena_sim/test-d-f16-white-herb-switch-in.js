// ── test-d-f16-white-herb-switch-in.js ────────────────────────────────────
// Phase D finding F16: White Herb at battle start.
//
// TryDoEventsBeforeFirstTurn (src/battle_main.c:3862-3894) runs the switch-in
// abilities, then ABILITYEFFECT_INTIMIDATE1, then ABILITYEFFECT_TRACE, then
// ITEMEFFECT_ON_SWITCH_IN for each battler, fastest first. Its White Herb case
// (src/battle_util.c:3312-3327) sets every stage below default back to default
// and runs BattleScript_WhiteHerbEnd2, which removes the item
// (data/battle_scripts_1.s:4345-4354). So a White Herb holder facing
// Intimidate starts turn 1 at +0 with the herb gone.
//
// Before: the engine left the -1 in place until the end of turn 1 (recorded:
// oppStages.atk -1, oppBerryConsumed false). Found by the emulator: 7 created-
// lead traces (Intimidate Arcanine vs a White Herb holder) had the ROM at +0.
import { buildMon, buildStartState } from "./logic.js";

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } else console.log("  ok   " + m); };
const mk = (species, over = {}) => buildMon({
  species, level: 50, nature: "Hardy", evs: {}, ability: "Pressure", item: null, moves: ["Tackle"], friendship: 255, ...over,
});

console.log("-- White Herb holder vs Intimidate --");
{
  const arc = mk("Arcanine", { ability: "Intimidate" });
  const bla = mk("Blaziken", { ability: "Blaze", item: "White Herb" });
  const st = buildStartState({ you: arc, opp: bla });
  ok(st.oppStages.atk === 0, `the drop is restored before turn 1 (atk ${st.oppStages.atk}, was -1)`);
  ok(st.oppBerryConsumed === true && st.oppUsedItem === "White Herb" && st.oppItemOverride === null,
    `and the herb is consumed (consumed ${st.oppBerryConsumed}, used ${st.oppUsedItem}, override ${st.oppItemOverride})`);
  // the player's side, mirrored
  const st2 = buildStartState({ you: bla, opp: arc });
  ok(st2.youStages.atk === 0 && st2.youBerryConsumed === true, `the player's White Herb too (atk ${st2.youStages.atk})`);
}

console.log("-- nothing to restore: the herb is kept --");
{
  const bla = mk("Blaziken", { ability: "Blaze", item: "White Herb" });
  const sno = mk("Snorlax", { ability: "Thick Fat" });
  const st = buildStartState({ you: sno, opp: bla });
  ok(st.oppStages.atk === 0 && st.oppBerryConsumed === false && st.oppItemOverride === undefined,
    `no drop, no consumption (consumed ${st.oppBerryConsumed})`);
  // Intimidate blocked by Clear Body: nothing lowered, herb kept
  const met = mk("Metagross", { ability: "Clear Body", item: "White Herb" });
  const arc = mk("Arcanine", { ability: "Intimidate" });
  const st2 = buildStartState({ you: arc, opp: met });
  ok(st2.oppStages.atk === 0 && st2.oppBerryConsumed === false, `Clear Body blocks the drop; the herb stays`);
}

console.log("-- a traced Intimidate does not fire, so a tracer's herb stays --");
{
  const arc = mk("Arcanine", { ability: "Intimidate" });
  const gar = mk("Gardevoir", { ability: "Trace", item: "White Herb" });
  const st = buildStartState({ you: arc, opp: gar });
  // the player's own Intimidate hits the tracer (restored by the herb);
  // the tracer's copied Intimidate never gets STATUS3_INTIMIDATE_POKES
  ok(st.youStages.atk === 0, `the player is not intimidated by the tracer (atk ${st.youStages.atk})`);
  ok(st.oppStages.atk === 0 && st.oppBerryConsumed === true, `the tracer's own drop is restored and the herb used`);
}

console.log();
console.log(failures === 0 ? "ALL PASS -- F16 White Herb at switch-in green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

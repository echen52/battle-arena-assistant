// ── test-b3-last-move.js ──────────────────────────────────────────────────
// B3 batch 7b: gLastMoves, per MOVEEND_UPDATE_LAST_MOVES
// (src/battle_script_commands.c:4389-4414):
//   HITMARKER_OBEYS ? gChosenMove : MOVE_UNAVAILABLE
//
//   PART 1  a prevented attempt records nothing (asleep, paralysed, flinched)
//   PART 2  a move-calling move records ITSELF, not what it called
//   PART 3  the consequence: Disable fails against a mon whose last attempt
//           was prevented, and disables Mirror Move itself after a call
import { buildMon, buildStartState, resolveTurn } from "./logic.js";

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } };

const mk = (species, moves, over = {}) => buildMon({
  species, level: 50, nature: "Adamant", evs: { hp: 252, atk: 252 },
  ability: "Pressure", item: null, moves, friendship: 255, ...over,
});
const start = (you, opp, o = {}) => buildStartState({ you, opp, overrides: o });
const turn = (you, opp, st, ym, om) => resolveTurn({ you, opp }, st, ym, om);

const snor = mk("Snorlax", ["Body Slam", "Growl", "Rest", "Splash"], { ability: "Thick Fat" });
const foe = mk("Blissey", ["Splash", "Soft-Boiled", "Growl", "Protect"], { ability: "Natural Cure" });

console.log("-- PART 1: a prevented attempt records nothing --");
{
  const asleep = turn(snor, foe, start(snor, foe, { youStatus: "sleep", youSleepTurns: 3 }), "Body Slam", "Splash");
  ok(asleep.every((b) => b.state.youLastMove === null), "a still-asleep mon's last move is UNAVAILABLE (null), not Body Slam");
  const para = turn(snor, foe, start(snor, foe, { youStatus: "paralysis" }), "Body Slam", "Splash");
  const blocked = para.filter((b) => /fully paralyzed/.test(b.label));
  const acted = para.filter((b) => !/fully paralyzed/.test(b.label));
  ok(blocked.length > 0 && blocked.every((b) => b.state.youLastMove === null), "a fully paralysed attempt records nothing");
  ok(acted.every((b) => b.state.youLastMove === "Body Slam"), "(control) the attempt that went through records Body Slam");
}

console.log();
console.log("-- PART 2: a move-calling move records itself --");
{
  const mm = mk("Pidgeot", ["Mirror Move", "Splash", "Rest", "Growl"], { ability: "Keen Eye" });
  const r = turn(snor, mm, start(snor, mm, { oppLastTakenMove: "Growl" }), "Splash", "Mirror Move");
  ok(r.some((b) => /Mirror Move -> Growl/.test(b.label)), "(probe check) Mirror Move called Growl");
  ok(r.every((b) => b.state.oppLastMove === "Mirror Move"), `its last move is Mirror Move (gChosenMove), not Growl (got ${r[0].state.oppLastMove})`);
}

console.log();
console.log("-- PART 3: what Disable sees --");
{
  const jolt = mk("Jolteon", ["Disable", "Splash", "Rest", "Thunderbolt"], { ability: "Volt Absorb" });
  // The slower Snorlax was asleep last turn: nothing to disable.
  const afterSleep = start(snor, jolt, { youLastMove: null });
  const d1 = turn(snor, jolt, afterSleep, "Body Slam", "Disable");
  ok(d1.every((b) => b.state.youDisabledMove == null), "Disable fails against a mon whose last attempt was prevented");
  // A Mirror Move user that called Growl can have MIRROR MOVE disabled.
  const mm = mk("Pidgeot", ["Mirror Move", "Splash", "Rest", "Growl"], { ability: "Keen Eye" });
  const t1 = turn(mm, jolt, start(mm, jolt, { youLastTakenMove: "Growl" }), "Mirror Move", "Splash")[0].state;
  const d2 = turn(mm, jolt, t1, "Splash", "Disable");
  ok(d2.some((b) => b.state.youDisabledMove === "Mirror Move"), "Disable after a Mirror Move call disables Mirror Move");
}

console.log();
console.log(failures === 0 ? "ALL PASS -- B3 batch 7b characterization green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

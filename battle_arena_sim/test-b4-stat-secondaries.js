// ── test-b4-stat-secondaries.js ───────────────────────────────────────────
// B4b: the STAT-CHANGE chance secondaries -- SetMoveEffect's stat cases
// (src/battle_script_commands.c:2646-2725) into ChangeStatBuffs (:6937-7075),
// called with flags = affectsUser alone: never MOVE_EFFECT_CERTAIN (so Mist and
// Clear Body block even a 100% drop) and never STAT_CHANGE_ALLOW_PTR (so no
// block ever prints, and no block ever costs Skill).
//
//   PART 1  each family rolls at its battle_moves.h chance, on the right stat
//           and the right side
//   PART 2  the target-side gates: Substitute, Shield Dust (ChangeStatBuffs
//           :7033, flags == 0), Mist, Clear Body / White Smoke, Hyper Cutter
//           (Attack), Keen Eye (accuracy), a fainted target, -6
//   PART 3  the user-side raises: AncientPower's all-five (BattleScript_
//           AllStatsUp), +6 caps; Serene Grace; no Skill on any block
import { buildMon, buildStartState, resolveTurn } from "./logic.js";

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } };
const near = (a, b) => Math.abs(a - b) < 1e-9;

const mk = (species, moves, over = {}) => buildMon({
  species, level: 50, nature: "Hardy", evs: { hp: 252 },
  ability: "Pressure", item: null, moves, friendship: 255, ...over,
});
const start = (you, opp, o = {}) => buildStartState({ you, opp, overrides: o });
const turn = (you, opp, st, ym, om) => resolveTurn({ you, opp }, st, ym, om);
const prob = (brs, f) => brs.filter(f).reduce((a, b) => a + b.p, 0);

// B6-2: Shell Armor, so a crit does not split the branch counts asserted here.
const wall = mk("Blissey", ["Splash", "Soft-Boiled", "Growl", "Protect"], { ability: "Shell Armor", evs: { hp: 252, def: 252, spd: 252 } });
const run = (atk, move, tgt = wall, o = {}) => turn(atk, tgt, start(atk, tgt, o), move, "Splash");
const pStage = (brs, side, k, v) => prob(brs, (b) => b.state[side + "Stages"][k] === v);

console.log("-- PART 1: each family rolls --");
{
  // [attacker, move, side, stat, stage, P = chance x accuracy]
  const cases = [
    ["Tyranitar", "Crunch", "opp", "spd", -1, 0.2], // (Shadow Ball cannot touch the Normal-type wall)
    ["Alakazam", "Psychic", "opp", "spd", -1, 0.1],
    ["Latios", "Luster Purge", "opp", "spd", -1, 0.5],
    ["Lapras", "Icy Wind", "opp", "spe", -1, 1 * 0.95],
    ["Golem", "Rock Tomb", "opp", "spe", -1, 1 * 0.8],
    ["Kingler", "Crush Claw", "opp", "def", -1, 0.5 * 0.95],
    ["Steelix", "Iron Tail", "opp", "def", -1, 0.3 * 0.75],
    ["Dewgong", "Aurora Beam", "opp", "atk", -1, 0.1],
    ["Whiscash", "Mud-Slap", "opp", "accuracy", -1, 1],
    ["Latias", "Mist Ball", "opp", "spa", -1, 0.5],
    ["Skarmory", "Steel Wing", "you", "def", 1, 0.1 * 0.9],
  ];
  for (const [sp, mv, side, k, v, want] of cases) {
    const atk = mk(sp, [mv, "Splash", "Rest", "Protect"]);
    const got = pStage(run(atk, mv), side, k, v);
    ok(near(got, want), `${mv}: P(${side} ${k} ${v > 0 ? "+" : ""}${v}) = ${want.toFixed(4)} (got ${got.toFixed(4)})`);
  }
  const ap = mk("Aerodactyl", ["AncientPower", "Splash", "Rest", "Protect"]);
  const apb = run(ap, "AncientPower");
  const allUp = (b) => ["atk", "def", "spe", "spa", "spd"].every((k) => b.state.youStages[k] === 1);
  ok(near(prob(apb, allUp), 0.1), "AncientPower raises all five stats together, 10%");
  ok(apb.every((b) => b.state.youStages.accuracy === 0 && b.state.youStages.evasion === 0), "...and not accuracy or evasion");
}

console.log();
console.log("-- PART 2: the target-side gates --");
{
  const wind = mk("Lapras", ["Icy Wind", "Splash", "Rest", "Protect"]);
  const noDrop = (brs) => brs.every((b) => b.state.oppStages.spe === 0);
  ok(noDrop(run(wind, "Icy Wind", wall, { oppSubstituteHP: 300 })), "a Substitute blocks it");
  ok(noDrop(run(wind, "Icy Wind", wall, { oppSubstituteHP: 1 })), "...even one this hit breaks");
  ok(noDrop(run(wind, "Icy Wind", wall, { oppMistTurns: 3 })), "Mist blocks even a 100% drop (never MOVE_EFFECT_CERTAIN)");
  const tgt = (sp, ab) => mk(sp, ["Splash", "Protect", "Rest", "Growl"], { ability: ab, evs: { hp: 252, def: 252, spd: 252 } });
  ok(noDrop(run(wind, "Icy Wind", tgt("Dustox", "Shield Dust"))), "Shield Dust blocks it (ChangeStatBuffs, flags == 0)");
  ok(noDrop(run(wind, "Icy Wind", tgt("Metagross", "Clear Body"))), "Clear Body blocks it");
  ok(noDrop(run(wind, "Icy Wind", tgt("Torkoal", "White Smoke"))), "White Smoke blocks it");
  const aurora = mk("Dewgong", ["Aurora Beam", "Splash", "Rest", "Protect"]);
  ok(run(aurora, "Aurora Beam", tgt("Kingler", "Hyper Cutter")).every((b) => b.state.oppStages.atk === 0), "Hyper Cutter blocks an Attack drop");
  ok(pStage(run(wind, "Icy Wind", tgt("Kingler", "Hyper Cutter")), "opp", "spe", -1) > 0, "(control) ...and nothing else");
  const slap = mk("Whiscash", ["Mud-Slap", "Splash", "Rest", "Protect"]);
  ok(run(slap, "Mud-Slap", tgt("Pidgeot", "Keen Eye")).every((b) => b.state.oppStages.accuracy === 0), "Keen Eye blocks an accuracy drop");
  ok(pStage(run(wind, "Icy Wind", tgt("Pidgeot", "Keen Eye")), "opp", "spe", -1) > 0, "(control) ...and nothing else");
  const ko = run(wind, "Icy Wind", wall, { oppHpPct: 1 });
  ok(ko.every((b) => b.state.oppHpPct > 0 || b.state.oppStages.spe === 0), "a fainted target takes no drop");
  const floor = { atk: 0, def: 0, spa: 0, spd: -6, spe: 0, evasion: 0, accuracy: 0 };
  const ttar = mk("Tyranitar", ["Crunch", "Splash", "Rest", "Protect"]);
  const fl = run(ttar, "Crunch", wall, { oppStages: floor });
  ok(fl.length === 1 && fl[0].state.oppStages.spd === -6, "at -6 there is nothing to branch");
}

console.log();
console.log("-- PART 3: the user side, Serene Grace, and Skill --");
{
  const ap = mk("Aerodactyl", ["AncientPower", "Splash", "Rest", "Protect"]);
  const capped = { atk: 6, def: 0, spa: 0, spd: 0, spe: 0, evasion: 0, accuracy: 0 };
  const part = run(ap, "AncientPower", wall, { youStages: capped });
  ok(near(prob(part, (b) => b.state.youStages.def === 1 && b.state.youStages.atk === 6), 0.1), "one stat at +6: the other four still rise");
  const all6 = { atk: 6, def: 6, spa: 6, spd: 6, spe: 6, evasion: 0, accuracy: 0 };
  ok(run(ap, "AncientPower", wall, { youStages: all6 }).length === 1, "all five at +6: nothing to branch");
  const sg = mk("Tyranitar", ["Crunch", "Splash", "Rest", "Protect"], { ability: "Serene Grace" });
  ok(near(pStage(run(sg, "Crunch"), "opp", "spd", -1), 0.4), "Serene Grace doubles 20% to 40%");
  const wind = mk("Lapras", ["Icy Wind", "Splash", "Rest", "Protect"]);
  const cb = mk("Metagross", ["Splash", "Protect", "Rest", "Growl"], { ability: "Clear Body" });
  const pr = mk("Metagross", ["Splash", "Protect", "Rest", "Growl"], { ability: "Pressure" });
  const sk = (t) => run(wind, "Icy Wind", t).find((b) => /Icy Wind \(hits\)/.test(b.label)).state.skillYou;
  ok(sk(cb) === sk(pr), `a blocked secondary drop prints nothing: no Skill cost (${sk(cb)} vs ${sk(pr)})`);
}

console.log();
console.log(failures === 0 ? "ALL PASS -- B4b stat secondaries characterization green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

// ── test-d-f14-quick-claw-joint.js ────────────────────────────────────────
// Phase D finding F14: Quick Claw's draw is ONE value for the AI and the turn.
//
// gRandomTurnNumber is drawn once per turn before action selection
// (src/battle_main.c:3923; :3140 for the first) and GetWhoStrikesFirst
// compares a Quick Claw holder against it (:4653, :4687). Cmd_if_user_goes
// (the AI's if_target_faster) and the turn order both call that function, so
// when the AI "sees" the claw fire, the claw HAS fired for the turn. The search
// takes, per outcome, P(outcome) x the AI given it x resolveTurn given it
// (aiTurnPlans; resolveTurn's `qc` option), where F13 ran the AI as if the
// claw never fired and resolveTurn drew it on its own.
// Found by the emulator: Luvdisc (Quick Claw) vs Latios, traces/battle-00400
// turn 0 -- the ROM's draw fired, its AI picked Dive, which the sim gave 0.
import { buildMon, buildStartState, resolveTurn, chooseOpponentMoves, aiTurnPlans, analyzeMatchup } from "./logic.js";
import { getOpponentConfig } from "./opponent-adapter.js";
import { LEADS } from "./anchors.js";

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } else console.log("  ok   " + m); };
const J = JSON.stringify;
const mk = (species, moves, over = {}) => buildMon({
  species, level: 50, nature: "Hardy", evs: {}, ability: "Pressure", item: null, moves, friendship: 255, ...over,
});
const P_FIRE = 13107 / 65536; // floor(0xFFFF * 20 / 100) / 65536

console.log("-- the emulator's case: Luvdisc vs Latios --");
{
  const luv = mk("Luvdisc", ["Sweet Kiss", "Attract", "Dive", "Rain Dance"], { ability: "Swift Swim", item: "Quick Claw" });
  const lat = mk("Latios", ["Psychic"], { ability: "Levitate" });
  const st = buildStartState({ you: lat, opp: luv });
  const fired = chooseOpponentMoves(luv, lat, st, { qc: true }), not = chooseOpponentMoves(luv, lat, st, { qc: false });
  ok(fired.some((x) => x.move === "Dive" && x.prob > 0), `claw fired: Dive has weight (${J(fired)})`);
  ok(!not.some((x) => x.move === "Dive"), `claw not fired: no Dive (${J(not)})`);
  const plans = aiTurnPlans({ you: lat, opp: luv }, st);
  ok(plans.length === 2 && plans[0].qc === true && plans[0].p === P_FIRE && plans[1].p === 1 - P_FIRE,
    `the search splits on the draw: ${J(plans.map((p) => [p.qc, p.p]))}`);
}

console.log("-- resolveTurn given the draw --");
{
  // Luvdisc (81 base Speed) is slower than Latios; fired, it moves first
  const luv = mk("Luvdisc", ["Tackle"], { ability: "Swift Swim", item: "Quick Claw" });
  const lat = mk("Latios", ["Psychic"], { ability: "Levitate" });
  const st = buildStartState({ you: lat, opp: luv });
  const first = (br) => [...new Set(br.map((b) => (b.label.startsWith("Opp") ? "opp" : "you")))];
  ok(J(first(resolveTurn({ you: lat, opp: luv }, st, "Psychic", "Tackle", { qc: true }))) === J(["opp"]), "qc true: the holder moves first in every branch");
  ok(J(first(resolveTurn({ you: lat, opp: luv }, st, "Psychic", "Tackle", { qc: false }))) === J(["you"]), "qc false: speed decides");
  const marg = resolveTurn({ you: lat, opp: luv }, st, "Psychic", "Tackle");
  const pOpp = marg.filter((b) => b.label.startsWith("Opp")).reduce((a, b) => a + b.p, 0);
  ok(Math.abs(pOpp - P_FIRE) < 1e-12, `no qc: resolveTurn still marginalises the draw itself (${pOpp})`);
}

console.log("-- no holder, or a draw that cannot change the AI: one plan --");
{
  const a = mk("Snorlax", ["Body Slam"], { ability: "Thick Fat" }), b = mk("Blissey", ["Soft-Boiled", "Seismic Toss"], { ability: "Natural Cure" });
  const plans = aiTurnPlans({ you: a, opp: b }, buildStartState({ you: a, opp: b }));
  ok(plans.length === 1 && plans[0].qc === undefined, `no Quick Claw: ${J(plans.map((p) => [p.qc, p.p]))}`);
}

console.log("-- the search value is the JOINT one --");
{
  // Rhydon 1 (Quick Claw) vs Metagross: joint 0.24072430208602924; the AI
  // ignoring the claw (F13) 0.29616676691898647; the AI's mixture with an
  // independent order draw 0.24632796691809244.
  const r = analyzeMatchup(LEADS.Metagross, getOpponentConfig("Rhydon 1", { ability: "Lightning Rod" }), { tree: false }).result;
  ok(r.winProb === 0.24072430208602924, `Rhydon 1: ${r.winProb}`);
}

console.log();
console.log(failures === 0 ? "ALL PASS -- F14 Quick Claw joint draw green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

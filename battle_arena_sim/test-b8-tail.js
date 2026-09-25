// ── test-b8-tail.js ───────────────────────────────────────────────────────
// B8c: Truant, Shed Skin, Trace.
//
//   PART 1  Truant: acts, loafs, acts; a loafing turn scores no Skill; the
//           starting state is an input (a KO replacement loafs first)
//   PART 2  Shed Skin: 1/3 to cure any major status each end of turn, BEFORE
//           that turn's poison tick
//   PART 3  Trace: takes the foe's ability at the start; a traced Intimidate
//           does not fire
import { buildMon, buildStartState, resolveTurn, vf } from "./logic.js";

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } };

const mk = (species, moves, over = {}) => buildMon({
  species, level: 50, nature: "Adamant", evs: { hp: 252, atk: 252 },
  ability: "Pressure", item: null, moves, friendship: 255, ...over,
});
const start = (you, opp, o = {}) => buildStartState({ you, opp, overrides: o });
const turn = (you, opp, st, ym, om) => resolveTurn({ you, opp }, st, ym, om);
const prob = (brs, f) => brs.filter(f).reduce((a, b) => a + b.p, 0);

console.log("-- PART 1: Truant --");
{
  const slaking = mk("Slaking", ["Body Slam", "Splash", "Rest", "Earthquake"], { ability: "Truant" });
  const wall = mk("Blissey", ["Splash", "Soft-Boiled", "Growl", "Protect"], { ability: "Natural Cure", evs: { hp: 252, def: 252 } });
  const t1 = turn(slaking, wall, start(slaking, wall), "Body Slam", "Splash")[0];
  ok(t1.state.oppHpPct < 100, "turn 1: Slaking acts");
  ok(vf(t1.state, "youTruantLoaf"), "...and its counter flips at the end of the turn");
  const t2 = turn(slaking, wall, t1.state, "Body Slam", "Splash")[0];
  ok(t2.state.oppHpPct === t1.state.oppHpPct && /loafing/.test(t2.label), `turn 2: it loafs (${t2.label})`);
  ok(t2.state.skillYou === t1.state.skillYou, "a loafing turn scores no Skill (attackcanceler returned before HITMARKER_OBEYS)");
  const t3 = turn(slaking, wall, t2.state, "Body Slam", "Splash")[0];
  ok(t3.state.oppHpPct < t2.state.oppHpPct, "turn 3: it acts again");
  // A KO replacement comes in with the counter set (Cmd_switchineffects) and
  // loafs first -- the starting state is an input.
  const ko = turn(slaking, wall, start(slaking, wall, { youTruantLoaf: true }), "Body Slam", "Splash")[0];
  ok(ko.state.oppHpPct === 100, "with the counter set at the start, it loafs on turn 1");
}

console.log();
console.log("-- PART 2: Shed Skin --");
{
  const shed = mk("Dragonair", ["Splash", "Rest", "Growl", "Protect"], { ability: "Shed Skin" });
  const foe = mk("Blissey", ["Splash", "Soft-Boiled", "Growl", "Protect"], { ability: "Natural Cure" });
  const brs = turn(foe, shed, start(foe, shed, { oppStatus: "poison" }), "Splash", "Splash");
  const cured = brs.filter((b) => b.state.oppStatus === null);
  ok(Math.abs(prob(cured, () => true) - 1 / 3) < 1e-9, `cures with probability 1/3 (got ${prob(cured, () => true).toFixed(4)})`);
  ok(cured.every((b) => b.state.oppHpPct === 100), "a cured mon takes NO poison tick that turn -- the cure comes first");
  ok(brs.filter((b) => b.state.oppStatus === "poison").every((b) => b.state.oppHpPct < 100), "(control) the uncured branch is ticked");
  const healthy = turn(foe, shed, start(foe, shed), "Splash", "Splash");
  ok(healthy.length === 1, "no status, no branch");
}

console.log();
console.log("-- PART 3: Trace --");
{
  const tracer = mk("Gardevoir", ["Psychic", "Splash", "Rest", "Protect"], { ability: "Trace" });
  const tank = mk("Snorlax", ["Body Slam", "Splash", "Rest", "Protect"], { ability: "Thick Fat" });
  const s0 = start(tracer, tank);
  ok(s0.youAbilityOverride === "Thick Fat", "Gardevoir takes Snorlax's Thick Fat at the start");
  const intim = mk("Gyarados", ["Waterfall", "Splash", "Rest", "Protect"], { ability: "Intimidate" });
  const s1 = start(tracer, intim);
  ok(s1.youAbilityOverride === "Intimidate", "it traces Intimidate...");
  ok(s1.oppStages.atk === 0, "...but the traced Intimidate does not fire on Gyarados");
  ok(s1.youStages.atk === -1, "(control) Gyarados's own Intimidate still hits the tracer");
  const t2 = mk("Porygon2", ["Tri Attack", "Splash", "Rest", "Protect"], { ability: "Trace" });
  const s2 = start(tracer, t2);
  ok(s2.youAbilityOverride === "Trace" && s2.oppAbilityOverride === "Trace", "two Trace holders both stay Trace");
}

console.log();
console.log(failures === 0 ? "ALL PASS -- B8c tail characterization green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

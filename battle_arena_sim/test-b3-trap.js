// ── test-b3-trap.js ───────────────────────────────────────────────────────
// B3 batch 5: the trapping moves (Wrap, Bind, Fire Spin, Clamp, Whirlpool,
// Sand Tomb) -- EFFECT_TRAP.
//
//   PART 1  a landed hit wraps for (Random() & 3) + 3 turns, equally
//   PART 2  ENDTURN_WRAP: the counter drops first; n deals n-1 ticks of
//           maxHP/16, and the turn it reaches 0 it breaks free, undamaged
//   PART 3  what stops the wrap: a Substitute (even one this hit breaks), an
//           existing wrap (the counter is kept), a no-effect hit. NOT Shield
//           Dust -- MOVE_EFFECT_WRAP is 13, outside its <= 9 test
//   PART 4  what frees it: Rapid Spin (not into a Ghost), setting a Substitute
import { buildMon, buildStartState, resolveTurn } from "./logic.js";

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } };

const mk = (species, moves, over = {}) => buildMon({
  species, level: 50, nature: "Adamant", evs: { hp: 252, atk: 252 },
  ability: "Pressure", item: null, moves, friendship: 255, ...over,
});
const start = (you, opp, o = {}) => buildStartState({ you, opp, overrides: o });
const turn = (you, opp, st, ym, om) => resolveTurn({ you, opp }, st, ym, om);
const prob = (brs, f) => brs.filter(f).reduce((a, b) => a + b.p, 0);

const wrapper = mk("Arbok", ["Wrap", "Splash", "Rest", "Sludge Bomb"], { ability: "Intimidate" });
const target = mk("Snorlax", ["Splash", "Rest", "Growl", "Body Slam"], { ability: "Thick Fat" });
const tick = Math.max(1, Math.floor(target.stats.hp / 16));
const hpOf = (pct) => Math.round((pct / 100) * target.stats.hp);

console.log("-- PART 1: the wrap and its length --");
{
  const brs = turn(wrapper, target, start(wrapper, target), "Wrap", "Splash");
  const landed = brs.filter((b) => b.state.oppWrapped);
  const pl = prob(landed, () => true);
  ok(pl > 0.8, `(probe check) Wrap (85% accurate) lands most of the time (${pl.toFixed(3)})`);
  // After turn 1's end the counter has already dropped once: 3..6 -> 2..5.
  const byN = [2, 3, 4, 5].map((n) => prob(landed, (b) => b.state.oppWrapped.n === n));
  ok(byN.every((x) => Math.abs(x - pl / 4) < 1e-9), `the length must be (Random() & 3) + 3, equally (got ${byN.map((x) => x.toFixed(4)).join("/")})`);
  ok(prob(brs, (b) => !b.state.oppWrapped) === prob(brs, (b) => b.state.oppHpPct === 100), "a missed Wrap does not wrap");
  console.log(`   landed ${pl.toFixed(3)}, split ${byN.map((x) => x.toFixed(4)).join(" / ")}`);
}

console.log();
console.log("-- PART 2: the ticks --");
{
  // Counter 2 at the start of a turn: drops to 1, still wrapped -> one tick.
  const t1 = turn(wrapper, target, start(wrapper, target, { oppWrapped: { move: "Wrap", n: 2 } }), "Splash", "Splash")[0];
  ok(hpOf(100) - hpOf(t1.state.oppHpPct) === tick && t1.state.oppWrapped.n === 1, `counter 2 -> 1: one tick of ${tick} HP`);
  // Counter 1: drops to 0 -> breaks free, NO damage.
  const t2 = turn(wrapper, target, t1.state, "Splash", "Splash")[0];
  ok(t2.state.oppWrapped === null && t2.state.oppHpPct === t1.state.oppHpPct, "counter 1 -> 0: breaks free, undamaged");
}

console.log();
console.log("-- PART 3: what stops the wrap --");
{
  const subbed = turn(wrapper, target, start(wrapper, target, { oppSubstituteHP: 200 }), "Wrap", "Splash");
  ok(subbed.every((b) => !b.state.oppWrapped), "a Substitute blocks it");
  const fragile = turn(wrapper, target, start(wrapper, target, { oppSubstituteHP: 1 }), "Wrap", "Splash");
  ok(fragile.some((b) => b.state.oppSubstituteHP == null) && fragile.every((b) => !b.state.oppWrapped),
    "...including a Substitute this very hit breaks (the flag holds to turn end)");
  const already = turn(wrapper, target, start(wrapper, target, { oppWrapped: { move: "Bind", n: 5 } }), "Wrap", "Splash");
  ok(already.every((b) => b.state.oppWrapped.move === "Bind" && b.state.oppWrapped.n === 4),
    "an existing wrap keeps its own move and counter (5 -> 4), not a fresh one");
  const ghost = mk("Gengar", ["Splash", "Rest", "Growl", "Protect"], { ability: "Levitate" });
  const g = turn(wrapper, ghost, start(wrapper, ghost), "Wrap", "Splash");
  ok(g.every((b) => !b.state.oppWrapped), "a Normal Wrap into a Ghost does not affect it, so it does not wrap");
  const dust = mk("Dustox", ["Splash", "Rest", "Growl", "Protect"], { ability: "Shield Dust" });
  const d = turn(wrapper, dust, start(wrapper, dust), "Wrap", "Splash");
  ok(d.some((b) => b.state.oppWrapped), "Shield Dust does NOT block it -- MOVE_EFFECT_WRAP is 13");
}

console.log();
console.log("-- PART 4: what frees it --");
{
  const spinner = mk("Forretress", ["Rapid Spin", "Substitute", "Rest", "Splash"], { ability: "Sturdy" });
  const foe = mk("Snorlax", ["Splash", "Rest", "Growl", "Body Slam"], { ability: "Thick Fat" });
  const spun = turn(spinner, foe, start(spinner, foe, { youWrapped: { move: "Wrap", n: 5 } }), "Rapid Spin", "Splash");
  ok(spun.filter((b) => b.state.oppHpPct < 100).every((b) => b.state.youWrapped === null), "a landed Rapid Spin frees its user");
  const gFoe = mk("Gengar", ["Splash", "Rest", "Growl", "Protect"], { ability: "Levitate" });
  const intoGhost = turn(spinner, gFoe, start(spinner, gFoe, { youWrapped: { move: "Wrap", n: 5 }, youSpikesLayers: 2 }), "Rapid Spin", "Splash");
  ok(intoGhost.every((b) => b.state.youWrapped !== null && b.state.youSpikesLayers === 2),
    "a Rapid Spin into a Ghost frees NOTHING -- not the wrap, not the Spikes");
  const sub = turn(spinner, foe, start(spinner, foe, { youWrapped: { move: "Wrap", n: 5 } }), "Substitute", "Splash");
  ok(sub.every((b) => b.state.youSubstituteHP != null && b.state.youWrapped === null), "setting a Substitute frees its user");
}

console.log();
console.log(failures === 0 ? "ALL PASS -- B3 batch 5 characterization green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

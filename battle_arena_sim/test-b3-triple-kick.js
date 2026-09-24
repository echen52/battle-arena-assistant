// ── test-b3-triple-kick.js ────────────────────────────────────────────────
// B3 batch 6: Triple Kick -- the last entry of ACCEPTED_UNMODELED_EFFECTS.
//
//   PART 1  per-hit accuracy: counts 0/1/2/3 at (1-q), q(1-q), q^2(1-q), q^3
//   PART 2  the power VECTOR: hits deal 10, 20 and 30 power, not one number x3
//   PART 3  Skill: any landed hit scores as a hit (the trailing miss's MISSED
//           flag is cleared); a first-hit miss is -2
//   PART 4  the ledger is empty, and the Focus Band case throws by name
import { buildMon, buildStartState, resolveTurn, calcDamage, skillDelta, ACCEPTED_UNMODELED_EFFECTS } from "./logic.js";

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } };

const mk = (species, moves, over = {}) => buildMon({
  species, level: 50, nature: "Adamant", evs: { hp: 252, atk: 252 },
  ability: "Pressure", item: null, moves, friendship: 255, ...over,
});
const start = (you, opp, o = {}) => buildStartState({ you, opp, overrides: o });
const turn = (you, opp, st, ym, om) => resolveTurn({ you, opp }, st, ym, om);
const prob = (brs, f) => brs.filter(f).reduce((a, b) => a + b.p, 0);

const kicker = mk("Hitmontop", ["Triple Kick", "Splash", "Rest", "Protect"], { ability: "Intimidate" });
const wall = mk("Snorlax", ["Splash", "Rest", "Growl", "Protect"], { ability: "Thick Fat", evs: { hp: 252, def: 252 } });
const hpLost = (b) => Math.round(((100 - b.state.oppHpPct) / 100) * wall.stats.hp);

console.log("-- PART 1: per-hit accuracy --");
{
  const brs = turn(kicker, wall, start(kicker, wall), "Triple Kick", "Splash");
  const q = 0.9; // Triple Kick's own accuracy, no stages
  const byHits = (n) => prob(brs, (b) => (b.label.match(/hits (\d)x/)?.[1] ?? (/MISSES/.test(b.label) ? "0" : "1")) === String(n));
  const want = [1 - q, q * (1 - q), q * q * (1 - q), q * q * q];
  const got = [0, 1, 2, 3].map(byHits);
  ok(got.every((g, i) => Math.abs(g - want[i]) < 1e-9), `hit counts must be (1-q), q(1-q), q^2(1-q), q^3 (got ${got.map((x) => x.toFixed(4)).join(", ")})`);
  console.log(`   0/1/2/3 hits: ${got.map((x) => x.toFixed(4)).join(" / ")}`);
}

console.log();
console.log("-- PART 2: 10, 20, 30 --");
{
  const brs = turn(kicker, wall, start(kicker, wall), "Triple Kick", "Splash");
  const one = brs.find((b) => /Triple Kick \(hits\)|hits 1x/.test(b.label) && !/MISSES/.test(b.label));
  const three = brs.find((b) => /hits 3x/.test(b.label));
  ok(one && three, "(probe check) a 1-hit and a 3-hit branch exist");
  // The wall has no Intimidate, so the kicker's Attack is unstaged.
  const d0 = (pw) => calcDamage(kicker, wall, "Triple Kick", { variablePower: pw });
  const want3 = d0(10) + d0(20) + d0(30);
  ok(hpLost(one) === d0(10), `one hit deals the power-10 damage (${hpLost(one)} vs ${d0(10)})`);
  ok(hpLost(three) === want3, `three hits deal 10 + 20 + 30 power (${hpLost(three)} vs ${want3}), not 3 x ${d0(10)}`);
  console.log(`   one hit ${hpLost(one)}, three hits ${hpLost(three)} = ${d0(10)} + ${d0(20)} + ${d0(30)}`);
}

console.log();
console.log("-- PART 3: Skill --");
{
  const brs = turn(kicker, wall, start(kicker, wall), "Triple Kick", "Splash");
  const landed = brs.filter((b) => !/MISSES/.test(b.label));
  const missed = brs.filter((b) => /MISSES/.test(b.label));
  // Fighting into Normal is super-effective, and only MISSED is cleared -- the
  // SE flag from typecalc stays, so a landed Triple Kick scores the SE +2.
  ok(landed.every((b) => b.state.skillYou === skillDelta("landedSuperEffective")),
    "any landed hit scores as a (super-effective) hit, even when a later hit missed -- only MISSED is cleared");
  ok(missed.length > 0 && missed.every((b) => b.state.skillYou === skillDelta("miss")), "a first-hit miss is -2");
}

console.log();
console.log("-- PART 4: the ledger, and Focus Band --");
{
  ok(Object.keys(ACCEPTED_UNMODELED_EFFECTS).length === 0,
    `ACCEPTED_UNMODELED_EFFECTS is empty -- every effect is modelled or throws by name (left: ${Object.keys(ACCEPTED_UNMODELED_EFFECTS).join(", ")})`);
  const banded = mk("Snorlax", ["Splash", "Rest", "Growl", "Protect"], { ability: "Thick Fat", item: "Focus Band" });
  let msg = "";
  try { turn(kicker, banded, start(kicker, banded, { oppHpPct: 3 }), "Triple Kick", "Splash"); } catch (e) { msg = e.message; }
  ok(/multi-hit move used against a Focus Band holder/.test(msg), `a lethal Triple Kick into Focus Band throws BY NAME (${msg.slice(0, 60)})`);
}

console.log();
console.log(failures === 0 ? "ALL PASS -- B3 batch 6 characterization green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

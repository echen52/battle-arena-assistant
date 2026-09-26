// ── test-c2-focus-band-counter.js ─────────────────────────────────────────
// C2 (found by the full grid): Focus Band's lethality probe must price a
// counter-driven hit at the power the hit will actually have.
//
// Fury Cutter, Rollout / Ice Ball and Bide take their power from state, not a
// draw, so the probe (focusBandBranches) asked calcDamage for a power it did not
// carry and THREW -- 2,719 + 52 full-grid cells, every one a Focus Band lead
// (none of the six panel leads holds one). The fix derives the power the same
// way applyMoveCore does (counterHitPower), from the state before the action.
//
// The probes give the Focus Band holder EXACTLY the HP the counter-boosted hit
// takes, which the un-incremented power would NOT take: the band must be
// rolled (P(survive) = P(landed) x 10/100, holdEffectParam at
// src/data/items.h via item-data.js), and a probe one counter step behind
// would see no KO and skip it.
import { buildMon, buildStartState, resolveTurn, calcDamage } from "./logic.js";
import { itemData } from "./item-data.js";

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } };
const near = (a, b) => Math.abs(a - b) < 1e-9;
const FB = itemData("Focus Band").param / 100;

const mk = (species, moves, over = {}) => buildMon({
  species, level: 50, nature: "Hardy", evs: { hp: 252 }, ability: "Pressure", item: null, moves, friendship: 255, ...over,
});
// Shell Armor: no crit branches, so every landed hit deals the one number
const band = mk("Omastar", ["Splash", "Protect", "Rest", "Growl"], { ability: "Shell Armor", item: "Focus Band", evs: { hp: 252 } });

// P(the band holder is left alive), and P(the move landed at all)
function probe(atk, move, power, overrides) {
  const dmg = calcDamage(atk, band, move, { variablePower: power });
  const hp = dmg; // exactly lethal at this power
  const st = buildStartState({ you: atk, opp: band, overrides: { oppHpPct: (100 * hp) / band.stats.hp, ...overrides } });
  let brs;
  try { brs = resolveTurn({ you: atk, opp: band }, st, move, "Splash"); }
  catch (e) { return { threw: e.message.split("\n")[0] }; }
  const start = (100 * hp) / band.stats.hp;
  // banded: hit AND left alive (a miss leaves the HP untouched)
  const alive = brs.filter((b) => b.state.oppHpPct > 0 && b.state.oppHpPct < start).reduce((a, b) => a + b.p, 0);
  const landed = brs.filter((b) => b.state.oppHpPct < start).reduce((a, b) => a + b.p, 0);
  return { dmg, alive, landed };
}
const check = (label, r, weakerDmg) => {
  if (r.threw) { ok(false, `${label}: threw -- ${r.threw}`); return; }
  console.log(`   ${label}: hit ${r.dmg} (one step behind: ${weakerDmg}), P(landed) ${r.landed.toFixed(4)}, P(banded) ${r.alive.toFixed(4)}`);
  ok(weakerDmg < r.dmg, `${label}: (probe check) the un-incremented power would not KO`);
  ok(r.landed > 0 && near(r.alive, r.landed * FB), `${label}: the band is rolled on the lethal hit (${r.alive} vs ${r.landed * FB})`);
};

console.log("-- Fury Cutter: counter 2 -> 3, power 40 (not 20) --");
{
  const scyther = mk("Scyther", ["Fury Cutter", "Splash", "Rest", "Protect"]);
  const r = probe(scyther, "Fury Cutter", 40, { youFuryCutter: 2 });
  check("Fury Cutter", r, calcDamage(scyther, band, "Fury Cutter", { variablePower: 20 }));
}

console.log("-- Rollout: third hit of the lock (n 3 -> 2), power 120 --");
{
  const golem = mk("Golem", ["Rollout", "Splash", "Rest", "Protect"]);
  const r = probe(golem, "Rollout", 120, { youLock: { move: "Rollout", kind: "rollout", n: 3 } });
  check("Rollout", r, calcDamage(golem, band, "Rollout", { variablePower: 60 }));
}

console.log("-- Ice Ball after Defense Curl: first hit, power 60 --");
{
  const spheal = mk("Spheal", ["Ice Ball", "Defense Curl", "Rest", "Protect"]);
  const r = probe(spheal, "Ice Ball", 60, { volFlags: undefined, youDefenseCurled: true });
  check("Ice Ball (curled)", r, calcDamage(spheal, band, "Ice Ball", { variablePower: 30 }));
}

console.log("-- Bide: the unleash deals twice the stored damage --");
{
  const bider = mk("Snorlax", ["Bide", "Splash", "Rest", "Protect"]);
  const stored = 40;
  const hp = 2 * stored;
  const st = buildStartState({ you: bider, opp: band, overrides: { oppHpPct: (100 * hp) / band.stats.hp, youLock: { move: "Bide", kind: "bide", n: 1, dmg: stored } } });
  let brs = null;
  try { brs = resolveTurn({ you: bider, opp: band }, st, "Bide", "Splash"); }
  catch (e) { ok(false, `Bide unleash: threw -- ${e.message.split("\n")[0]}`); }
  if (brs) {
    const alive = brs.filter((b) => b.state.oppHpPct > 0).reduce((a, b) => a + b.p, 0);
    console.log(`   Bide: unleash ${hp} into ${hp} HP, P(banded) ${alive.toFixed(4)}`);
    ok(near(alive, FB), `Bide unleash: the band is rolled (${alive} vs ${FB})`);
  }
  // the SET turn deals nothing: no band roll, no throw
  const st0 = buildStartState({ you: bider, opp: band, overrides: { oppHpPct: 1 } });
  let brs0 = null;
  try { brs0 = resolveTurn({ you: bider, opp: band }, st0, "Bide", "Splash"); }
  catch (e) { ok(false, `Bide set turn: threw -- ${e.message.split("\n")[0]}`); }
  if (brs0) ok(brs0.every((b) => b.state.oppHpPct > 0) && brs0.length === 1, `Bide set turn into 1% HP: one branch, nothing dealt (${brs0.length} branches)`);
}

console.log();
console.log(failures === 0 ? "ALL PASS -- C2 Focus Band counter-power characterization green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

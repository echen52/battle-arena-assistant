// ── test-b6-crits.js ──────────────────────────────────────────────────────
// B6-2 (amendment 14): critical hits, exact, universe-wide.
//
//   PART 1  the rates: 1/16, and Cmd_critcalc's stage terms -- high-crit
//           effect +1, Focus Energy +2, Scope Lens +1 -- capped at 1/2; Battle
//           Armor and Shell Armor block it
//   PART 2  only effects whose script reaches `critcalc` can crit: Seismic
//           Toss never does, Present (via its C-level jump) does
//   PART 3  the damage: x2 applied BEFORE typecalc's STAB floor (Cmd_damagecalc
//           :1296), attacker's drops and defender's boosts ignored, Reflect
//           ignored
//   PART 4  a multi-hit move rolls a crit on EVERY hit
import { buildMon, buildStartState, resolveTurn, calcDamage } from "./logic.js";

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } };
const near = (a, b) => Math.abs(a - b) < 1e-9;

const mk = (species, moves, over = {}) => buildMon({
  species, level: 50, nature: "Hardy", evs: { hp: 252 }, ability: "Pressure", item: null, moves, friendship: 255, ...over,
});
const start = (you, opp, o = {}) => buildStartState({ you, opp, overrides: o });
const turn = (you, opp, st, ym, om) => resolveTurn({ you, opp }, st, ym, om);
const wall = mk("Blissey", ["Splash", "Protect", "Rest", "Growl"], { ability: "Natural Cure", evs: { hp: 252, def: 252, spd: 252 } });
// P(the hit dealt MORE than a non-crit could): the crit branches.
const pCrit = (atk, move, tgt = wall, o = {}) => {
  const brs = turn(atk, tgt, start(atk, tgt, o), move, "Splash").filter((b) => /\(hits\)/.test(b.label));
  const lost = (b) => 100 - b.state.oppHpPct;
  const min = Math.min(...brs.map(lost));
  return brs.filter((b) => lost(b) > min + 1e-9).reduce((a, b) => a + b.p, 0);
};

console.log("-- PART 1: the rates --");
{
  const slam = mk("Snorlax", ["Body Slam", "Splash", "Rest", "Protect"]);
  const slash = mk("Kingler", ["Crabhammer", "Slash", "Rest", "Protect"]);
  ok(near(pCrit(slam, "Body Slam") / 1, 1 / 16 * 1), `Body Slam: 1/16 (got ${pCrit(slam, "Body Slam").toFixed(5)})`);
  ok(near(pCrit(slash, "Slash"), 1 / 8), `Slash (high crit): 1/8 (got ${pCrit(slash, "Slash").toFixed(5)})`);
  ok(near(pCrit(slam, "Body Slam", wall, { youFocusEnergy: true }), 1 / 4), "Focus Energy: +2 -> 1/4");
  ok(near(pCrit(slash, "Slash", wall, { youFocusEnergy: true }), 1 / 3), "Slash + Focus Energy: 1/3");
  const lens = mk("Kingler", ["Crabhammer", "Slash", "Rest", "Protect"], { item: "Scope Lens" });
  ok(near(pCrit(lens, "Slash", wall, { youFocusEnergy: true }), 1 / 2), "Slash + Focus Energy + Scope Lens: stage 4 -> 1/2");
  const armor = mk("Omastar", ["Splash", "Protect", "Rest", "Growl"], { ability: "Shell Armor", evs: { hp: 252, def: 252 } });
  const battle = mk("Kabutops", ["Splash", "Protect", "Rest", "Growl"], { ability: "Battle Armor", evs: { hp: 252, def: 252 } });
  ok(pCrit(slam, "Body Slam", armor) === 0 && pCrit(slam, "Body Slam", battle) === 0, "Shell Armor and Battle Armor: no crit, and not branched");
}

console.log();
console.log("-- PART 2: which effects can crit --");
{
  const toss = mk("Hariyama", ["Seismic Toss", "Splash", "Rest", "Protect"]);
  const brs = turn(toss, wall, start(toss, wall), "Seismic Toss", "Splash").filter((b) => /\(hits\)/.test(b.label));
  ok(brs.length === 1, `Seismic Toss (set damage, enters after critcalc): one branch (got ${brs.length})`);
  const bird = mk("Delibird", ["Present", "Splash", "Rest", "Protect"]);
  const pres = turn(bird, wall, start(bird, wall), "Present", "Splash").filter((b) => b.state.oppHpPct < 100);
  const dmgs = new Set(pres.map((b) => (100 - b.state.oppHpPct).toFixed(6)));
  ok(dmgs.size === 6, `Present crits: 3 power arms x (crit, no crit) = 6 damages (got ${dmgs.size})`);
}

console.log();
console.log("-- PART 3: the damage arithmetic --");
{
  // x2 before the STAB floor: find an attacker whose untyped base is odd, so
  // floor(1.5 * b) * 2 != floor(1.5 * 2b).
  const target = mk("Blissey", ["Splash"], { evs: {} });
  let checked = 0, differs = 0;
  for (const lv of [30, 35, 40, 45, 50, 55]) {
    const a = buildMon({ species: "Snorlax", level: lv, nature: "Hardy", evs: {}, ability: "Pressure", item: null, moves: ["Body Slam"], friendship: 255 });
    const b = calcDamage(a, target, "Body Slam", { untyped: true, rollFrac: 1 });
    const want = Math.floor(2 * b * 1.5); // Normal STAB, neutral target
    const got = calcDamage(a, target, "Body Slam", { crit: true, rollFrac: 1 });
    ok(got === want, `Lv${lv}: crit = floor(1.5 x 2b) = ${want} (got ${got})`);
    checked++; if (want !== Math.floor(b * 1.5) * 2) differs++;
  }
  ok(differs > 0, `(probe check) the order matters for ${differs} of ${checked} bases`);
  const slam = mk("Snorlax", ["Body Slam", "Splash", "Rest", "Protect"]);
  const plain = calcDamage(slam, wall, "Body Slam", { crit: true });
  ok(calcDamage(slam, wall, "Body Slam", { crit: true, atkStage: -2, defStage: 2 }) === plain, "a crit ignores the attacker's drop and the defender's boost");
  ok(calcDamage(slam, wall, "Body Slam", { crit: true, atkStage: 2 }) > plain, "(control) ...but keeps the attacker's boost");
  const brs = turn(slam, wall, start(slam, wall, { oppReflectTurns: 3 }), "Body Slam", "Splash").filter((b) => /\(hits\)/.test(b.label));
  const lost = brs.map((b) => Math.round(((100 - b.state.oppHpPct) / 100) * wall.stats.hp));
  const critHit = calcDamage(slam, wall, "Body Slam", { crit: true });
  ok(lost.includes(critHit), `a crit through Reflect deals the unhalved ${critHit} (branches: ${[...new Set(lost)].join(", ")})`);
}

console.log();
console.log("-- PART 4: every hit of a multi-hit move rolls --");
{
  const dk = mk("Hitmonlee", ["Double Kick", "Splash", "Rest", "Protect"]);
  const brs = turn(dk, wall, start(dk, wall), "Double Kick", "Splash").filter((b) => /hits 2x/.test(b.label));
  const byLoss = new Map();
  for (const b of brs) { const k = (100 - b.state.oppHpPct).toFixed(6); byLoss.set(k, (byLoss.get(k) ?? 0) + b.p); }
  const ps = [...byLoss.entries()].sort((a, b) => +a[0] - +b[0]).map(([, p]) => p);
  ok(ps.length === 3 && near(ps[0], (15 / 16) ** 2) && near(ps[1], 2 * (1 / 16) * (15 / 16)) && near(ps[2], (1 / 16) ** 2),
    `Double Kick: 0 / 1 / 2 crits at 225/256, 30/256, 1/256 (got ${ps.map((p) => (p * 256).toFixed(2)).join(", ")} /256)`);
  // Into a Substitute the ORDER is observable (it could break mid-sequence), so
  // the full per-hit masks are enumerated rather than the (count, last) classes:
  // the sub's remaining HP must still split 225 / 30 / 1 over 256.
  const sb = turn(dk, wall, start(dk, wall, { oppSubstituteHP: 300 }), "Double Kick", "Splash").filter((b) => /hits 2x/.test(b.label));
  const bySub = new Map();
  for (const b of sb) bySub.set(b.state.oppSubstituteHP, (bySub.get(b.state.oppSubstituteHP) ?? 0) + b.p);
  const qs = [...bySub.entries()].sort((a, b) => b[0] - a[0]).map(([, p]) => p);
  ok(qs.length === 3 && near(qs[1], 2 * (1 / 16) * (15 / 16)),
    `...and into a Substitute (full per-hit masks): exactly one crit at 30/256 (got ${qs.map((p) => (p * 256).toFixed(2)).join(", ")} /256)`);
}

console.log();
console.log(failures === 0 ? "ALL PASS -- B6-2 crits characterization green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

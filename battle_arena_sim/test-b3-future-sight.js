// ── test-b3-future-sight.js ───────────────────────────────────────────────
// B3 batch 5b: Future Sight (and Doom Desire).
//
//   PART 1  the set: no accuracy check, not stopped by Protect, +1 Skill; a
//           second one onto a pending target FAILS (-2)
//   PART 2  the damage is fixed AT USE by CalculateBaseDamage: no STAB, no
//           type chart -- so it hits a Dark type, and a later stage change
//           does not alter it
//   PART 3  timing: a turn-1 Future Sight lands at the end of turn 3 --
//           before the Arena judges -- and not a turn earlier
//   PART 4  the release rolls accuracy with TODAY's stages, misses a
//           semi-invulnerable target, and scores no Skill for anyone
//   PART 5  a Substitute takes it; Focus Band can hang on
import { buildMon, buildStartState, resolveTurn, calcDamage, skillDelta } from "./logic.js";

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } };

const mk = (species, moves, over = {}) => buildMon({
  species, level: 50, nature: "Modest", evs: { hp: 252, spa: 252 },
  ability: "Pressure", item: null, moves, friendship: 255, ...over,
});
const start = (you, opp, o = {}) => buildStartState({ you, opp, overrides: o });
const turn = (you, opp, st, ym, om) => resolveTurn({ you, opp }, st, ym, om);
const prob = (brs, f) => brs.filter(f).reduce((a, b) => a + b.p, 0);

const seer = mk("Xatu", ["Future Sight", "Splash", "Rest", "Psychic"], { ability: "Synchronize" });
const dark = mk("Umbreon", ["Splash", "Protect", "Rest", "Growl"], { ability: "Synchronize", evs: { hp: 252, spd: 252 } });
const hpOf = (pct, mon) => Math.round((pct / 100) * mon.stats.hp);

console.log("-- PART 1: the set --");
{
  const brs = turn(seer, dark, start(seer, dark), "Future Sight", "Protect");
  ok(brs.every((b) => b.state.oppFutureSight?.move === "Future Sight"), "set on every branch -- no accuracy check, and Protect does not stop it");
  ok(brs.every((b) => b.state.skillYou === skillDelta("landed")), "the set scores +1");
  ok(brs.every((b) => b.state.oppHpPct === 100), "and it does no damage now");
  const again = turn(seer, dark, brs[0].state, "Future Sight", "Splash");
  ok(again.every((b) => b.state.skillYou - brs[0].state.skillYou === skillDelta("noEffect")),
    "a second Future Sight onto a pending target FAILS (-2)");
}

console.log();
console.log("-- PART 2: the damage is fixed at use, untyped --");
{
  const st = turn(seer, dark, start(seer, dark), "Future Sight", "Splash")[0].state;
  const base = calcDamage(seer, dark, "Future Sight", { untyped: true, rollFrac: 1 });
  ok(st.oppFutureSight.dmg === base, `stored damage is CalculateBaseDamage's (${st.oppFutureSight.dmg} vs ${base})`);
  ok(calcDamage(seer, dark, "Psychic") === 0, "(control) Psychic does nothing to a Dark type");
  ok(base > 0, "...but Future Sight's fixed damage does: no typecalc, ever");
  // No STAB either: Xatu is Psychic, so against a NEUTRAL target the typed
  // formula is 1.5x the untyped one (floored), and the stored number is the
  // untyped one.
  const neutral = mk("Snorlax", ["Splash", "Rest", "Growl", "Protect"], { ability: "Thick Fat" });
  const typedN = calcDamage(seer, neutral, "Future Sight", { rollFrac: 1 });
  const untypedN = calcDamage(seer, neutral, "Future Sight", { untyped: true, rollFrac: 1 });
  ok(typedN === Math.floor(untypedN * 1.5), `untyped drops STAB: typed ${typedN} = floor(1.5 x ${untypedN})`);
  const withStab = calcDamage(seer, dark, "Future Sight", { rollFrac: 1 });
  ok(withStab === 0, "(control) the TYPED formula would have given 0 -- the untyped path is what makes it land");
  // A +2 SpAtk after the set changes nothing: the number was fixed at use.
  const boosted = { ...st, youStages: { ...st.youStages, spa: 2 } };
  const later = turn(seer, dark, boosted, "Splash", "Splash")[0].state;
  ok(later.oppFutureSight.dmg === st.oppFutureSight.dmg, "a later SpAtk boost does not change the stored damage");
}

console.log();
console.log("-- PART 3: it lands at the end of turn 3 --");
{
  let s = turn(seer, dark, start(seer, dark), "Future Sight", "Splash")[0].state;
  ok(s.oppFutureSight.n === 2, "end of turn 1: counter 3 -> 2");
  s = turn(seer, dark, s, "Splash", "Splash")[0].state;
  ok(s.oppFutureSight.n === 1 && s.oppHpPct === 100, "end of turn 2: counter 2 -> 1, nothing yet");
  const t3 = turn(seer, dark, s, "Splash", "Splash");
  const hit = t3.filter((b) => b.state.oppHpPct < 100);
  ok(t3.every((b) => b.state.oppFutureSight === null), "end of turn 3: released, and cleared");
  ok(Math.abs(prob(hit, () => true) - 0.9) < 1e-9, `it lands 90% of the time (got ${prob(hit, () => true).toFixed(4)})`);
  const dealt = hpOf(100, dark) - hpOf(hit[0].state.oppHpPct, dark);
  ok(dealt === Math.max(1, Math.floor(s.oppFutureSight.dmg * 0.925)), `it deals the stored damage x the battle roll (${dealt})`);
  // Compare against the SAME turn with nothing pending: Splash scores its own
  // Skill, so only the difference can show the release adding any.
  const control = turn(seer, dark, { ...s, oppFutureSight: null }, "Splash", "Splash")[0].state;
  ok(t3.every((b) => b.state.skillYou === control.skillYou && b.state.skillOpp === control.skillOpp),
    "the release scores NO Skill for either side (it ends in end2, not Cmd_end)");
  console.log(`   ${hit[0].label}`);
}

console.log();
console.log("-- PART 4: the release uses today's accuracy --");
{
  let s = turn(seer, dark, start(seer, dark), "Future Sight", "Splash")[0].state;
  s = { ...s, oppFutureSight: { ...s.oppFutureSight, n: 1 } };
  const evasive = { ...s, oppStages: { ...s.oppStages, evasion: 6 } };
  const e = turn(seer, dark, evasive, "Splash", "Splash");
  const pe = prob(e, (b) => b.state.oppHpPct < 100);
  ok(pe < 0.5, `+6 evasion AT RELEASE cuts the hit rate (${pe.toFixed(4)})`);
  const flyer = mk("Pidgeot", ["Fly", "Splash", "Rest", "Growl"], { ability: "Keen Eye" });
  // It must START Fly this turn to be airborne at turn end (a mon RELEASING
  // Fly has already come down by then).
  const pending = start(seer, flyer, { oppFutureSight: { move: "Future Sight", n: 1, dmg: 80 } });
  const f = turn(seer, flyer, pending, "Splash", "Fly");
  ok(f.every((b) => b.state.oppCharging?.invulnBit === "onair"), "(probe check) the flyer is airborne at turn end");
  ok(f.every((b) => b.state.oppHpPct === 100 && /Future Sight misses/.test(b.label) && b.state.oppFutureSight === null),
    "a target in the air when it releases is not hit -- and the Future Sight is spent");
}

console.log();
console.log("-- PART 5: Substitute and Focus Band --");
{
  const s = start(seer, dark, { oppFutureSight: { move: "Future Sight", n: 1, dmg: 60 }, oppSubstituteHP: 200 });
  const sub = turn(seer, dark, s, "Splash", "Splash").filter((b) => !/misses/.test(b.label));
  ok(sub.every((b) => b.state.oppHpPct === 100 && b.state.oppSubstituteHP < 200), "a Substitute takes the hit");

  const banded = mk("Umbreon", ["Splash", "Protect", "Rest", "Growl"], { ability: "Synchronize", item: "Focus Band" });
  const lethal = start(seer, banded, { oppFutureSight: { move: "Future Sight", n: 1, dmg: 9999 } });
  const fb = turn(seer, banded, lethal, "Splash", "Splash");
  const hung = prob(fb, (b) => b.state.oppHpPct > 0 && /Focus Band/.test(b.label));
  ok(Math.abs(hung - 0.9 * 0.1) < 1e-9, `Focus Band hangs on at 10% of the landed hits (${hung.toFixed(4)})`);
}

console.log();
console.log(failures === 0 ? "ALL PASS -- B3 batch 5b characterization green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

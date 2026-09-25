// ── test-b8-types.js ──────────────────────────────────────────────────────
// B8d: Color Change, Forecast -- and the re-resolution between actions that
// both of them (and Transform, Trick, Skill Swap, Knock Off...) depend on.
//
//   PART 1  Color Change: the holder becomes the type of the move that hit it
//   PART 2  Forecast: Castform's type follows the effective weather
//   PART 3  what the FIRST action changes, the SECOND action sees: a faster
//           Ditto's Transform, a faster Kecleon... and the end of turn too
import { buildMon, buildStartState, resolveTurn, calcDamage } from "./logic.js";

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } };

const mk = (species, moves, over = {}) => buildMon({
  species, level: 50, nature: "Modest", evs: { hp: 252, spa: 252 },
  ability: "Pressure", item: null, moves, friendship: 255, ...over,
});
const start = (you, opp, o = {}) => buildStartState({ you, opp, overrides: o });
const turn = (you, opp, st, ym, om) => resolveTurn({ you, opp }, st, ym, om);

console.log("-- PART 1: Color Change --");
{
  const kec = mk("Kecleon", ["Splash", "Rest", "Growl", "Protect"], { ability: "Color Change" });
  const star = mk("Starmie", ["Surf", "Thunderbolt", "Splash", "Recover"], { ability: "Natural Cure" });
  const t1 = turn(star, kec, start(star, kec), "Surf", "Splash")[0];
  ok(JSON.stringify(t1.state.oppTypes) === '["Water"]', `Surf turns Kecleon Water (${JSON.stringify(t1.state.oppTypes)})`);
  const t2 = turn(star, kec, t1.state, "Thunderbolt", "Splash")[0];
  const lost = t1.state.oppHpPct - t2.state.oppHpPct;
  const asWater = calcDamage(star, { ...kec, types: ["Water"] }, "Thunderbolt");
  ok(Math.abs(lost - (asWater / kec.stats.hp) * 100) < 1e-6, "the next Thunderbolt hits it AS a Water type (super-effective)");
  const sub = turn(star, kec, start(star, kec, { oppSubstituteHP: 300 }), "Surf", "Splash")[0];
  ok(sub.state.oppTypes == null, "a hit absorbed by a Substitute changes nothing");
  const status = turn(star, kec, start(star, kec), "Splash", "Splash")[0];
  ok(status.state.oppTypes == null, "(control) no damaging hit, no change");
}

console.log();
console.log("-- PART 2: Forecast --");
{
  const cf = mk("Castform", ["Splash", "Rest", "Growl", "Protect"], { ability: "Forecast" });
  // A deliberately weak hit (no SpAtk investment, Thunder Shock), so a doubling
  // stays under the 100% KO cap and can actually be seen.
  const zap = mk("Jolteon", ["Thunder Shock", "Splash", "Rest", "Protect"], { ability: "Volt Absorb", nature: "Hardy", evs: { hp: 252 } });
  const dmgIn = (weather) => {
    const st = weather ? start(zap, cf, { weatherType: weather, weatherTurns: 4 }) : start(zap, cf);
    return 100 - turn(zap, cf, st, "Thunder Shock", "Splash")[0].state.oppHpPct;
  };
  const none = dmgIn(null), rain = dmgIn("rain");
  ok(rain > none * 1.7 && rain < 100, `in rain Castform is WATER and Thunder Shock doubles (${none.toFixed(1)}% -> ${rain.toFixed(1)}%)`);
  const cloud = mk("Golduck", ["Thunderbolt", "Splash", "Rest", "Protect"], { ability: "Cloud Nine" });
  const cn = 100 - turn(cloud, cf, start(cloud, cf, { weatherType: "rain", weatherTurns: 4 }), "Thunderbolt", "Splash")[0].state.oppHpPct;
  const cn0 = 100 - turn(cloud, cf, start(cloud, cf), "Thunderbolt", "Splash")[0].state.oppHpPct;
  ok(Math.abs(cn - cn0) < 1e-9, "under Cloud Nine the rain has no effect, so Castform stays Normal");
}

console.log();
console.log("-- PART 3: the second action sees the first --");
{
  const ditto = mk("Ditto", ["Transform"], { ability: "Limber", nature: "Timid", evs: { hp: 252, spe: 252 } });
  const golem = mk("Golem", ["Earthquake", "Rock Slide", "Rest", "Explosion"], { ability: "Rock Head", nature: "Adamant", evs: { hp: 252, atk: 252 } });
  const b = turn(golem, ditto, start(golem, ditto), "Earthquake", "Transform")[0];
  ok(/Opp uses Transform; You uses Earthquake/.test(b.label), "(probe check) Ditto moves first");
  const lost = 100 - b.state.oppHpPct;
  const plain = 100 - turn(golem, ditto, start(golem, ditto), "Earthquake", "Splash")[0].state.oppHpPct;
  ok(lost < plain, `the slower Earthquake hits the TRANSFORMED Ditto (Golem's bulk): ${lost.toFixed(1)}% vs ${plain.toFixed(1)}% untransformed`);
  // And the end of turn: a Knock Off'd Leftovers does not heal that same turn.
  const lefty = mk("Snorlax", ["Splash", "Rest", "Growl", "Protect"], { ability: "Thick Fat", item: "Leftovers", nature: "Adamant", evs: { hp: 252 } });
  const ko = mk("Sneasel", ["Knock Off", "Splash", "Rest", "Protect"], { ability: "Inner Focus", nature: "Jolly", evs: { atk: 252, spe: 252 } });
  const k = turn(ko, lefty, start(ko, lefty, { oppHpPct: 50 }), "Knock Off", "Splash").find((x) => x.state.oppItemOverride === null);
  ok(k, "(probe check) Knock Off removed the Leftovers");
  ok(k.state.oppHpPct < 50, "and the knocked-off Leftovers does NOT heal at that turn's end");
}

console.log();
console.log(failures === 0 ? "ALL PASS -- B8d types characterization green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

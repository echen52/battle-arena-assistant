// ── test-b8-contact.js ────────────────────────────────────────────────────
// B8: the contact abilities (ABILITYEFFECT_ON_DAMAGE, src/battle_util.c:
// 2749-2872). The chances are source's, not the "30%" in ability-enumeration.md.
//
//   PART 1  Static / Poison Point / Flame Body: 1/3, onto the ATTACKER
//   PART 2  Effect Spore: 1/10, split three ways -- 1/30 each of sleep, poison,
//           paralysis (burn remapped); sleep carries its 2-5 duration
//   PART 3  Rough Skin: no roll, 1/16 of the attacker's max HP
//   PART 4  Cute Charm: 1/3 x gender compatibility; Oblivious is immune
//   PART 5  what does NOT trigger: a non-contact move, a Substitute taking the
//           hit, a type-immune hit, an attacker that cannot take the status --
//           and Safeguard does NOT stop it (HITMARKER_STATUS_ABILITY_EFFECT)
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

// The attacker: a Snorlax whose Body Slam (contact, 100% accurate) always lands.
const hitter = mk("Snorlax", ["Body Slam", "Shadow Ball", "Rest", "Splash"], { ability: "Thick Fat" });
const holder = (ability, species = "Blissey") => mk(species, ["Splash", "Soft-Boiled", "Growl", "Protect"], { ability, evs: { hp: 252, def: 252 } });

console.log("-- PART 1: Static, Poison Point, Flame Body --");
for (const [ab, st] of [["Static", "paralysis"], ["Poison Point", "poison"], ["Flame Body", "burn"]]) {
  const h = holder(ab);
  const brs = turn(hitter, h, start(hitter, h), "Body Slam", "Splash");
  const pr = prob(brs, (b) => b.state.youStatus === st);
  ok(Math.abs(pr - 1 / 3) < 1e-9, `${ab}: the attacker takes ${st} with probability 1/3 (got ${pr.toFixed(4)})`);
}

console.log();
console.log("-- PART 2: Effect Spore --");
{
  const h = holder("Effect Spore");
  const brs = turn(hitter, h, start(hitter, h), "Body Slam", "Splash");
  const got = ["sleep", "poison", "paralysis", "burn"].map((st) => prob(brs, (b) => b.state.youStatus === st));
  ok(got.slice(0, 3).every((x) => Math.abs(x - 1 / 30) < 1e-9) && got[3] === 0,
    `sleep / poison / paralysis at 1/30 each, burn never (got ${got.map((x) => x.toFixed(4)).join(" / ")})`);
  const durs = [2, 3, 4, 5].map((d) => prob(brs, (b) => b.state.youStatus === "sleep" && b.state.youSleepTurns === d));
  ok(durs.every((x) => Math.abs(x - 1 / 120) < 1e-9), `sleep carries its 2-5 duration, 1/120 each (${durs.map((x) => x.toFixed(5)).join(" / ")})`);
}

console.log();
console.log("-- PART 3: Rough Skin --");
{
  const h = holder("Rough Skin", "Sharpedo");
  const brs = turn(hitter, h, start(hitter, h), "Body Slam", "Splash");
  const want = Math.max(1, Math.floor(hitter.stats.hp / 16));
  const lost = brs.map((b) => Math.round(((100 - b.state.yourHpPct) / 100) * hitter.stats.hp));
  ok(brs.every((b, i) => b.state.oppHpPct === 100 || lost[i] === want), `every landing hit costs the attacker ${want} HP (got ${[...new Set(lost)].join(",")})`);
  const ns = turn(hitter, h, start(hitter, h), "Shadow Ball", "Splash");
  ok(ns.every((b) => b.state.yourHpPct === 100), "(control) a non-contact Shadow Ball costs nothing");
}

console.log();
console.log("-- PART 4: Cute Charm --");
{
  const h = holder("Cute Charm", "Clefable");
  const brs = turn(hitter, h, start(hitter, h), "Body Slam", "Splash");
  // Compatibility from the mons' own gender distributions (source's personality
  // thresholds, e.g. 31/256 -- not the rounded textbook 87.5% / 75%).
  let pc = 0;
  for (const u of hitter.genderDist) for (const t of h.genderDist) {
    if (u.gender !== "genderless" && t.gender !== "genderless" && u.gender !== t.gender) pc += u.p * t.p;
  }
  const pr = prob(brs, (b) => b.state.youAttracted);
  ok(Math.abs(pr - pc / 3) < 1e-9, `infatuation with probability compat/3 = ${(pc / 3).toFixed(4)} (got ${pr.toFixed(4)})`);
  const obl = mk("Snorlax", ["Body Slam", "Shadow Ball", "Rest", "Splash"], { ability: "Oblivious" });
  const o = turn(obl, h, start(obl, h), "Body Slam", "Splash");
  ok(o.every((b) => !b.state.youAttracted), "an Oblivious attacker is immune");
}

console.log();
console.log("-- PART 5: what does not trigger --");
{
  const st = holder("Static");
  ok(turn(hitter, st, start(hitter, st), "Shadow Ball", "Splash").every((b) => b.state.youStatus == null), "a non-contact move: no Static");
  ok(turn(hitter, st, start(hitter, st, { oppSubstituteHP: 300 }), "Body Slam", "Splash").every((b) => b.state.youStatus == null),
    "a Substitute takes the hit (no TARGET_TURN_DAMAGED): no Static");
  const ghostStatic = mk("Gengar", ["Splash", "Rest", "Growl", "Protect"], { ability: "Static" });
  ok(turn(hitter, ghostStatic, start(hitter, ghostStatic), "Body Slam", "Splash").every((b) => b.state.youStatus == null),
    "a Normal Body Slam into a Ghost does not affect it: no Static");
  const limber = mk("Snorlax", ["Body Slam", "Shadow Ball", "Rest", "Splash"], { ability: "Limber" });
  ok(turn(limber, st, start(limber, st), "Body Slam", "Splash").every((b) => b.state.youStatus == null),
    "a Limber attacker cannot be paralysed by Static");
  const safe = turn(hitter, st, start(hitter, st, { youSafeguardTurns: 3 }), "Body Slam", "Splash");
  ok(Math.abs(prob(safe, (b) => b.state.youStatus === "paralysis") - 1 / 3) < 1e-9,
    "Safeguard does NOT stop it -- HITMARKER_STATUS_ABILITY_EFFECT skips that check");
}

console.log();
console.log(failures === 0 ? "ALL PASS -- B8 contact characterization green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

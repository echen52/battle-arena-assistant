// ── test-c2-hidden-power.js ───────────────────────────────────────────────
// C2 / amendment 16: Hidden Power.
//
//   PART 1  the IV formula (Cmd_hiddenpowercalc, src/battle_script_commands.c:
//           8889-8915), on spreads with well-known answers
//   PART 2  the player ENTERS type and power (power defaults to 70); a bad
//           entry, or Hidden Power with neither entry nor IVs, is refused
//   PART 3  the battle sees the DYNAMIC type: type chart, physical/special by
//           type (src/pokemon.c:3124-3127, 3232, 3287), STAB, Levitate, Volt
//           Absorb (GET_MOVE_TYPE, include/battle.h:458-464)
//   PART 4  ...but the Counter / Mirror Coat record and the fire defrost read
//           the BASE Normal type (F_DYNAMIC_TYPE_IGNORE_PHYSICALITY,
//           src/battle_script_commands.c:1851-1860)
//   PART 5  Transform copies the IVs, so the transformed mon's Hidden Power is
//           the target's (include/pokemon.h:260-283; :7790)
//   PART 6  the AI rates Hidden Power at its BASE data: every AI damage
//           estimate clears the dynamic type and power
//           (src/battle_ai_script_commands.c:1188-1189, 1471-1474)
import { buildMon, buildStartState, resolveTurn, calcDamage, chooseOpponentMoves } from "./logic.js";

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } };
const iv = (hp, atk, def, spa, spd, spe) => ({ hp, atk, def, spa, spd, spe });
const mk = (species, moves, over = {}) => buildMon({
  species, level: 50, nature: "Hardy", evs: { hp: 252 }, ability: "Pressure", item: null, moves, friendship: 255, ...over,
});
const hp = (cfgOver) => mk("Snorlax", ["Hidden Power", "Splash"], { ability: "Thick Fat", ...cfgOver }).hiddenPower;
const same = (a, b) => a && b && a.type === b.type && a.power === b.power;

console.log("-- PART 1: the IV formula --");
{
  const cases = [
    [iv(31, 31, 31, 31, 31, 31), { type: "Dark", power: 70 }],
    [iv(30, 30, 30, 30, 30, 30), { type: "Fighting", power: 70 }],
    [iv(0, 0, 0, 0, 0, 0), { type: "Fighting", power: 30 }],
    [iv(1, 1, 1, 1, 1, 1), { type: "Dark", power: 30 }],
    [iv(31, 30, 31, 30, 31, 30), { type: "Fire", power: 70 }],   // the usual HP Fire spread
    [iv(31, 30, 30, 31, 31, 31), { type: "Ice", power: 70 }],    // the usual HP Ice spread
    [iv(31, 30, 31, 30, 31, 31), { type: "Grass", power: 70 }],  // the usual HP Grass spread
  ];
  for (const [ivs, want] of cases) {
    const got = hp({ ivs });
    ok(same(got, want), `IVs ${Object.values(ivs).join("/")}: ${want.type} ${want.power} (got ${got?.type} ${got?.power})`);
  }
  // every type Hidden Power can have is reachable, and Normal never is
  const seen = new Set();
  for (let b = 0; b < 64; b++) {
    const bit = (i) => ((b >> i) & 1) + 30; // 30/31: power bits all set
    seen.add(hp({ ivs: { hp: bit(0), atk: bit(1), def: bit(2), spe: bit(3), spa: bit(4), spd: bit(5) } }).type);
  }
  ok(seen.size === 16 && !seen.has("Normal"), `64 type-bit patterns reach 16 types, never Normal (got ${seen.size}: ${[...seen].join(", ")})`);
}

console.log();
console.log("-- PART 2: the player enters it --");
{
  ok(same(hp({ hiddenPower: { type: "Fire" } }), { type: "Fire", power: 70 }), "{ type: Fire } -> Fire 70 (power defaults to the maximum)");
  ok(same(hp({ hiddenPower: { type: "Ice", power: 48 } }), { type: "Ice", power: 48 }), "{ type: Ice, power: 48 } -> Ice 48");
  ok(same(hp({ hiddenPower: { type: "Grass" }, ivs: iv(31, 31, 31, 31, 31, 31) }), { type: "Grass", power: 70 }), "an entry wins over the IVs");
  const refuses = (over, re, label) => {
    let msg = null;
    try { hp(over); } catch (e) { msg = e.message; }
    ok(msg && re.test(msg), `${label} is refused (got ${msg ?? "no throw"})`);
  };
  refuses({ hiddenPower: { type: "Normal" } }, /not one Hidden Power can have/, "type Normal");
  refuses({ hiddenPower: { type: "Fire", power: 71 } }, /outside 30\.\.70/, "power 71");
  refuses({}, /EFFECT_HIDDEN_POWER.*no type/, "Hidden Power with neither an entry nor IVs");
  ok(mk("Snorlax", ["Body Slam"]).hiddenPower === null, "a mon without Hidden Power and without IVs needs neither");
}

console.log();
console.log("-- PART 3: the battle sees the dynamic type --");
{
  const wall = mk("Snorlax", ["Splash"], { ability: "Thick Fat", evs: { hp: 252, def: 252, spd: 252 } });
  const grass = mk("Tropius", ["Splash"], { ability: "Chlorophyll" });
  const water = mk("Milotic", ["Splash"], { ability: "Marvel Scale" });
  const fire = (over = {}) => mk("Snorlax", ["Hidden Power"], { ability: "Thick Fat", hiddenPower: { type: "Fire" }, ...over });
  const fight = (over = {}) => mk("Snorlax", ["Hidden Power"], { ability: "Thick Fat", hiddenPower: { type: "Fighting" }, ...over });
  // physical/special by type: Fire follows Sp. Atk, Fighting follows Attack
  const spaUp = { evs: { hp: 252, spa: 252 } }, atkUp = { evs: { hp: 252, atk: 252 } };
  ok(calcDamage(fire(spaUp), grass, "Hidden Power") > calcDamage(fire(atkUp), grass, "Hidden Power"), "HP Fire is SPECIAL: Sp. Atk raises it");
  ok(calcDamage(fight(atkUp), wall, "Hidden Power") > calcDamage(fight(spaUp), wall, "Hidden Power"), "HP Fighting is PHYSICAL: Attack raises it");
  // the type chart
  const dG = calcDamage(fire(), grass, "Hidden Power"), dW = calcDamage(fire(), water, "Hidden Power");
  ok(dG > 2 * dW, `HP Fire: super effective on Grass, resisted by Water (${dG} vs ${dW})`);
  ok(calcDamage(fight(), wall, "Hidden Power") > calcDamage(mk("Snorlax", ["Hidden Power"], { ability: "Thick Fat", hiddenPower: { type: "Fighting", power: 30 } }), wall, "Hidden Power"),
    "the entered power is the base power (70 > 30)");
  const ghost = mk("Dusclops", ["Splash"]);
  ok(calcDamage(fight(), ghost, "Hidden Power") === 0, "HP Fighting cannot touch a Ghost");
  // STAB: a Fire-type user
  const flareon = (t) => mk("Flareon", ["Hidden Power"], { ability: "Flash Fire", hiddenPower: { type: t } });
  const blissey = mk("Blissey", ["Splash"], { ability: "Natural Cure", evs: { hp: 252, spd: 252 } }); // neutral to both, no Thick Fat
  const stab = calcDamage(flareon("Fire"), blissey, "Hidden Power"), noStab = calcDamage(flareon("Water"), blissey, "Hidden Power");
  ok(stab > noStab * 1.4, `STAB follows the dynamic type (${stab} vs ${noStab})`);
  // abilities that read the move's type
  const levi = mk("Flygon", ["Splash"], { ability: "Levitate" });
  const ground = mk("Snorlax", ["Hidden Power"], { ability: "Thick Fat", hiddenPower: { type: "Ground" } });
  const lost = (atk, tgt) => { const brs = resolveTurn({ you: atk, opp: tgt }, buildStartState({ you: atk, opp: tgt }), "Hidden Power", "Splash");
    return brs.reduce((a, b) => a + b.p * (100 - b.state.oppHpPct), 0); };
  ok(lost(ground, levi) === 0, "HP Ground into Levitate: no damage");
  const lanturn = mk("Lanturn", ["Splash"], { ability: "Volt Absorb" });
  const elec = mk("Snorlax", ["Hidden Power"], { ability: "Thick Fat", hiddenPower: { type: "Electric" } });
  ok(lost(elec, lanturn) <= 0, "HP Electric into Volt Absorb: absorbed");
  ok(lost(fire(), lanturn) > 0, "(control) HP Fire into the same Lanturn hurts");
}

console.log();
console.log("-- PART 4: the base type for Counter / Mirror Coat and the defrost --");
{
  const fire = mk("Snorlax", ["Hidden Power", "Flamethrower"], { ability: "Thick Fat", hiddenPower: { type: "Fire" } });
  const wobb = mk("Wobbuffet", ["Counter", "Mirror Coat", "Splash", "Safeguard"], { ability: "Shadow Tag" });
  const back = (move) => { const brs = resolveTurn({ you: fire, opp: wobb }, buildStartState({ you: fire, opp: wobb }), "Hidden Power", move);
    return brs.reduce((a, b) => a + b.p * (100 - b.state.yourHpPct), 0); };
  ok(back("Counter") > 0, `Counter answers a (special-typed) HP Fire: it records as Normal, physical (${back("Counter").toFixed(3)}% back)`);
  ok(back("Mirror Coat") === 0, "Mirror Coat does not");
  const frozen = mk("Walrein", ["Splash"], { ability: "Thick Fat", evs: { hp: 252, def: 252, spd: 252 } });
  const stillFrozen = (move) => resolveTurn({ you: fire, opp: frozen }, buildStartState({ you: fire, opp: frozen, overrides: { oppStatus: "freeze" } }), move, "Splash")
    .filter((b) => b.state.oppHpPct < 100 && b.state.oppStatus === "freeze").reduce((a, b) => a + b.p, 0);
  ok(stillFrozen("Hidden Power") > 0, `HP Fire does NOT defrost the target it hits (P(hit and still frozen) ${stillFrozen("Hidden Power").toFixed(3)})`);
  ok(stillFrozen("Flamethrower") === 0, "(control) Flamethrower does");
}

console.log();
console.log("-- PART 5: Transform copies the IVs --");
{
  const you = mk("Snorlax", ["Hidden Power", "Splash"], { ability: "Thick Fat", hiddenPower: { type: "Ice" } });
  const ditto = mk("Ditto", ["Transform"], { ability: "Limber", ivs: iv(31, 31, 31, 31, 31, 31) });
  ok(ditto.hiddenPower.type === "Dark", "(probe check) the Ditto's own Hidden Power is Dark");
  const after = resolveTurn({ you, opp: ditto }, buildStartState({ you, opp: ditto }), "Splash", "Transform")[0].state;
  ok(after.oppTransform?.hiddenPower?.type === "Ice", `the transformed Ditto's Hidden Power is the target's Ice (got ${after.oppTransform?.hiddenPower?.type})`);
  // ...and it is the one the transformed Ditto USES: into a Grass/Flying
  // target, Ice (x4) against the Ditto's own Dark (x1)
  const dealt = (t) => {
    const trop = mk("Tropius", ["Hidden Power", "Splash"], { ability: "Chlorophyll", hiddenPower: { type: t } });
    const st = resolveTurn({ you: trop, opp: ditto }, buildStartState({ you: trop, opp: ditto }), "Splash", "Transform")[0].state;
    return resolveTurn({ you: trop, opp: ditto }, st, "Splash", "Hidden Power").reduce((a, b) => a + b.p * (st.yourHpPct - b.state.yourHpPct), 0);
  };
  ok(dealt("Ice") > 3 * dealt("Dark"), `the transformed Ditto hits with the copied Ice (${dealt("Ice").toFixed(2)}% vs ${dealt("Dark").toFixed(2)}% as Dark)`);
}

console.log();
console.log("-- PART 6: the AI rates Hidden Power at its base data --");
{
  // An opponent carrying Hidden Power beside Tackle, against a Grass/Flying
  // player at every HP: its choice must not depend on the Hidden Power's type
  // (Fire x2 here, Dark x1), because the AI never sees that type.
  const trop = mk("Tropius", ["Splash"], { ability: "Chlorophyll" });
  const aiOpp = (t) => mk("Snorlax", ["Hidden Power", "Tackle"], { ability: "Thick Fat", hiddenPower: { type: t } });
  const show = (d) => JSON.stringify(d.map((c) => [c.move, +c.prob.toFixed(12)]));
  let diffs = 0, checked = 0;
  for (let h = 2; h <= 100; h += 2) {
    const o1 = aiOpp("Fire"), o2 = aiOpp("Dark");
    const d1 = show(chooseOpponentMoves(o1, trop, buildStartState({ you: trop, opp: o1, overrides: { yourHpPct: h } })));
    const d2 = show(chooseOpponentMoves(o2, trop, buildStartState({ you: trop, opp: o2, overrides: { yourHpPct: h } })));
    checked++; if (d1 !== d2) diffs++;
  }
  ok(diffs === 0, `the AI's choice is the same for HP Fire and HP Dark at all ${checked} HP levels (differs at ${diffs})`);
  const o = aiOpp("Fire");
  ok(calcDamage(o, trop, "Hidden Power") > 20 * Math.max(1, calcDamage(o, trop, "Hidden Power", { aiEstimate: true })),
    "(probe check) the battle's HP Fire is far stronger than the AI's estimate of it");
}

console.log();
console.log(failures === 0 ? "ALL PASS -- C2 Hidden Power characterization green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

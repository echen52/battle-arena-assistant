// ── test-d-f7-liquid-ooze.js ──────────────────────────────────────────────
// Phase D finding F7: Liquid Ooze.
//
//   Leech Seed  BattleScript_LeechSeedTurnDrain (data/battle_scripts_1.s:
//               3265-3285): the SEEDED mon (BS_ATTACKER, the end-turn battler)
//               loses maxHP/8; `jumpifability BS_ATTACKER, LIQUID_OOZE` skips
//               the sign flip, so the SEEDER takes that same amount as DAMAGE.
//               The engine checked the seeder's ability and only withheld the heal.
//   Absorb      BattleScript_EffectAbsorb (:343-352): negativedamage heals
//               max(1, dealt / 2) (Cmd_negativedamage :6925-6931); a Liquid Ooze
//               TARGET flips it into damage to the attacker. The engine ignored it.
//   Dream Eater BattleScript_DreamEaterWorked (:453-461) has NO Liquid Ooze
//               check: it always heals -- and records nothing (F2a's drain
//               record is corrected to EFFECT_ABSORB only).
import { buildMon, buildStartState, resolveTurn } from "./logic.js";

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } else console.log("  ok   " + m); };
const mk = (species, moves, over = {}) => buildMon({
  species, level: 50, nature: "Hardy", evs: {}, ability: "Pressure", item: null, moves, friendship: 255, ...over,
});
const J = JSON.stringify;
const hpOf = (pct, mon) => Math.round((pct / 100) * mon.stats.hp);
const uniq = (xs) => [...new Set(xs)];

console.log("-- Leech Seed --");
{
  // The player's Tentacruel (Liquid Ooze) is seeded; the opponent's Exeggutor seeded it.
  const tent = mk("Tentacruel", ["Harden"], { ability: "Liquid Ooze" });
  const egg = mk("Exeggutor", ["Harden"], { ability: "Chlorophyll" });
  const st = buildStartState({ you: tent, opp: egg, overrides: { youSeeded: true, oppHpPct: 50 } });
  const b = resolveTurn({ you: tent, opp: egg }, st, "Harden", "Harden");
  const drained = Math.floor(tent.stats.hp / 8);
  const eggBefore = hpOf(50, egg);
  ok(uniq(b.map((x) => hpOf(x.state.oppHpPct, egg))).every((h) => h === eggBefore - drained),
    `the seeder LOSES maxHP/8 of the Ooze holder (${eggBefore} -> ${eggBefore - drained}; got ${J(uniq(b.map((x) => hpOf(x.state.oppHpPct, egg))))})`);
  ok(b.every((x) => x.state.youAbilityRecord === "Liquid Ooze"), `and the ability is recorded`);
  // The SEEDER's Liquid Ooze does nothing: the seeded mon's drain heals it.
  const tentSeeder = mk("Tentacruel", ["Harden"], { ability: "Liquid Ooze" });
  const egg2 = mk("Exeggutor", ["Harden"], { ability: "Chlorophyll" });
  const st2 = buildStartState({ you: tentSeeder, opp: egg2, overrides: { oppSeeded: true, yourHpPct: 50 } });
  const c = resolveTurn({ you: tentSeeder, opp: egg2 }, st2, "Harden", "Harden");
  const heal = Math.floor(egg2.stats.hp / 8);
  ok(uniq(c.map((x) => hpOf(x.state.yourHpPct, tentSeeder))).every((h) => h === hpOf(50, tentSeeder) + heal),
    `the SEEDER's own Liquid Ooze does not stop its heal (got ${J(uniq(c.map((x) => hpOf(x.state.yourHpPct, tentSeeder))))}, want ${hpOf(50, tentSeeder) + heal})`);
}

console.log("-- Absorb family --");
{
  const tent = mk("Tentacruel", ["Harden"], { ability: "Liquid Ooze" });
  const lud = mk("Ludicolo", ["Giga Drain"], { ability: "Swift Swim" });
  const b = resolveTurn({ you: tent, opp: lud }, buildStartState({ you: tent, opp: lud }), "Harden", "Giga Drain")
    .filter((x) => x.state.yourHpPct < 100);
  ok(b.length > 0 && b.every((x) => {
    const dealt = tent.stats.hp - hpOf(x.state.yourHpPct, tent);
    return lud.stats.hp - hpOf(x.state.oppHpPct, lud) === Math.max(1, Math.floor(dealt / 2));
  }), `Giga Drain into Liquid Ooze: the attacker LOSES max(1, dealt/2) (${b.length} hit branches)`);
  // Control: no Ooze, the attacker at half HP heals.
  const nor = mk("Snorlax", ["Harden"], { ability: "Thick Fat" });
  const c = resolveTurn({ you: nor, opp: lud }, buildStartState({ you: nor, opp: lud, overrides: { oppHpPct: 50 } }), "Harden", "Giga Drain")
    .filter((x) => x.state.yourHpPct < 100);
  ok(c.length > 0 && c.every((x) => x.state.oppHpPct > 50), `control: Giga Drain into Thick Fat heals the attacker`);
}

console.log("-- Dream Eater has no Liquid Ooze check --");
{
  const tent = mk("Tentacruel", ["Harden"], { ability: "Liquid Ooze" });
  const hyp = mk("Hypno", ["Dream Eater"], { ability: "Insomnia" });
  const b = resolveTurn({ you: tent, opp: hyp }, buildStartState({ you: tent, opp: hyp, overrides: { youStatus: "sleep", youSleepTurns: 3, oppHpPct: 50 } }), "Harden", "Dream Eater")
    .filter((x) => x.state.yourHpPct < 100);
  ok(b.length > 0 && b.every((x) => x.state.oppHpPct > 50), `Dream Eater into Liquid Ooze still heals`);
  ok(b.every((x) => x.state.youAbilityRecord == null), `...and records nothing (got ${J(uniq(b.map((x) => x.state.youAbilityRecord)))})`);
}

console.log();
console.log(failures === 0 ? "ALL PASS -- F7 Liquid Ooze green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

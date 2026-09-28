// ── test-d-f27-counter-hit.js ─────────────────────────────────────────────
// Phase D finding F27: Counter and Mirror Coat are ordinary set-damage hits.
//
// counterdamagecalculator / mirrorcoatdamagecalculator (src/battle_script_
// commands.c:7943-7990) fix the damage at twice what the user took of that
// category this turn, or fail the move. The rest of BattleScript_EffectCounter
// (data/battle_scripts_1.s:1217-1225) is a normal hit: accuracycheck,
// typecalc2 (immunity / Wonder Guard only -- it never writes SE or NVE,
// :4500-4591), adjustsetdamage (Endure, Focus Band), the Substitute, and the
// move end (contact abilities, Rage, Color Change, Shell Bell, Destiny Bond).
// The engine subtracted the number and returned, skipping all of it.
// Found by the emulator: traces-given/00649 (Wynaut's Counter into a Static
// Electrode -- paralysed in the ROM, never in the sim).
import { buildMon, buildStartState, resolveTurn } from "./logic.js";

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } else console.log("  ok   " + m); };
const mk = (species, moves, over = {}) => buildMon({
  species, level: 50, nature: "Hardy", evs: {}, ability: "Pressure", item: null, moves, friendship: 255, ...over,
});
const uniq = (xs) => [...new Set(xs)];
const psum = (bs) => bs.reduce((a, b) => a + b.p, 0);
// the player (faster) hits physically first; the opponent then Counters
const counterTurn = (you, opp, ov = {}, youMove = "Tackle", oppMove = "Counter") => {
  const br = resolveTurn({ you, opp }, buildStartState({ you, opp, overrides: ov }), youMove, oppMove);
  return br.filter((b) => b.label.startsWith("You"));
};

console.log("-- the move end runs: a contact ability --");
{
  const ele = mk("Electrode", ["Tackle"], { ability: "Static" });
  const wyn = mk("Wynaut", ["Counter"], { ability: "Shadow Tag" });
  const br = counterTurn(ele, wyn);
  const landed = br.filter((b) => b.state.yourHpPct < 100 && /Counter/.test(b.label));
  const para = landed.filter((b) => b.state.oppStatus === "paralysis");
  ok(landed.length > 0 && Math.abs(psum(para) / psum(landed) - 1 / 3) < 1e-9, `Counter into Static paralyses its user 1/3 of the time (${(psum(para) / psum(landed)).toFixed(4)})`);
  ok(landed.every((b) => b.state.skillOpp === 1), `and scores +1 (no effectiveness flag from typecalc2) (${uniq(landed.map((b) => b.state.skillOpp))})`);
}

console.log("-- typecalc2: a Ghost is immune --");
{
  const gen = mk("Gengar", ["Tackle", "Shadow Punch"], { ability: "Levitate" });
  const wyn = mk("Wynaut", ["Counter"], { ability: "Shadow Tag" });
  // Gengar cannot be hit by Tackle, so it takes nothing physical: give it a
  // physical hit that lands -- Shadow Punch is physical (Ghost) in Gen III
  const br = counterTurn(gen, wyn, {}, "Shadow Punch").filter((b) => /Counter/.test(b.label)); // Wynaut acted
  ok(br.length > 0 && br.every((b) => b.state.yourHpPct === 100), "Counter into a Ghost does nothing");
  ok(br.every((b) => b.state.skillOpp === -2), `and scores -2 (${uniq(br.map((b) => b.state.skillOpp))})`);
}

console.log("-- the Substitute takes it --");
{
  const snor = mk("Snorlax", ["Body Slam"], { ability: "Thick Fat" });
  const wob = mk("Wobbuffet", ["Counter"], { ability: "Shadow Tag" });
  // Snorlax is slower than Wobbuffet, so make the player faster by a Speed EV spread
  const fast = mk("Snorlax", ["Body Slam"], { ability: "Thick Fat", evs: { spe: 252 }, nature: "Jolly" });
  const br = counterTurn(fast, wob, { youSubstituteHP: 40 }, "Body Slam");
  const hit = br.filter((b) => /Counter/.test(b.label) && b.state.youSubstituteHP !== 40);
  ok(hit.length > 0 && hit.every((b) => b.state.yourHpPct === 100), "behind a Substitute the player's HP is untouched");
  void snor;
}

console.log("-- adjustsetdamage: the target's Focus Band --");
{
  const ele = mk("Electrode", ["Tackle"], { ability: "Soundproof", item: "Focus Band" });
  const wyn = mk("Wynaut", ["Counter"], { ability: "Shadow Tag" });
  const br = counterTurn(ele, wyn, { yourHpPct: 10 });
  const countered = br.filter((b) => /Counter/.test(b.label) && !/fails|MISSES/.test(b.label));
  const alive = countered.filter((b) => b.state.yourHpPct > 0);
  ok(countered.length > 0 && Math.abs(psum(alive) / psum(countered) - 0.1) < 1e-9, `a lethal Counter leaves the band holder at 1 with p 0.1 (${(psum(alive) / psum(countered)).toFixed(4)})`);
}

console.log("-- the move end runs: Color Change --");
{
  const kec = mk("Kecleon", ["Tackle"], { ability: "Color Change" });
  const wyn = mk("Wynaut", ["Counter"], { ability: "Shadow Tag" });
  const br = counterTurn(kec, wyn).filter((b) => /Counter/.test(b.label) && b.state.yourHpPct > 0 && b.state.yourHpPct < 100);
  ok(br.length > 0 && br.every((b) => JSON.stringify(b.state.youTypes) === JSON.stringify(["Fighting"])), `Kecleon turns Fighting (${uniq(br.map((b) => JSON.stringify(b.state.youTypes)))})`);
  ok(br.every((b) => b.state.skillOpp === 1), `Counter into a Normal type (Fighting x2) still scores +1, not +2 (${uniq(br.map((b) => b.state.skillOpp))})`);
}

console.log("-- nothing received: the move fails --");
{
  const snor = mk("Snorlax", ["Harden"], { ability: "Thick Fat" });
  const wyn = mk("Wynaut", ["Counter"], { ability: "Shadow Tag" });
  const br = resolveTurn({ you: snor, opp: wyn }, buildStartState({ you: snor, opp: wyn }), "Harden", "Counter");
  ok(br.every((b) => b.state.yourHpPct === 100 && b.state.skillOpp === -2), "no damage, -2");
}

console.log();
console.log(failures === 0 ? "ALL PASS -- F27 Counter as a hit green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

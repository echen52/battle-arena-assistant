// ── test-b4-flinch.js ─────────────────────────────────────────────────────
// B4c: the flinch chance secondaries, King's Rock, and the Minimize doubling.
//
//   PART 1  each flinch move rolls at its chance -- and only a FASTER attacker
//           can flinch anything (SetMoveEffect sets STATUS2_FLINCHED only when
//           the target's turn is still to come, :2561)
//   PART 2  the gates: Inner Focus (silent on a chance), Shield Dust, a
//           Substitute, a fainted target
//   PART 3  Stomp / Astonish / Extrasensory / Needle Arm deal 2x into a
//           Minimized target (BattleScript_EffectStomp, sDMG_MULTIPLIER)
//   PART 4  King's Rock: 10% on a FLAG_KINGS_ROCK_AFFECTED move that damaged
//           the target itself (ItemBattleEffects ITEMEFFECT_KINGSROCK_SHELLBELL)
//   PART 5  a CERTAIN flinch into Inner Focus prints PREVENTSFLINCHING: -3
//           Skill for the attacker -- Fake Out, which B3 batch 2 left uncharged
import { buildMon, buildStartState, resolveTurn } from "./logic.js";

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } };
const near = (a, b) => Math.abs(a - b) < 1e-9;

const mk = (species, moves, over = {}) => buildMon({
  species, level: 50, nature: "Jolly", evs: { hp: 252, atk: 252, spe: 252 },
  ability: "Pressure", item: null, moves, friendship: 255, ...over,
});
const start = (you, opp, o = {}) => buildStartState({ you, opp, overrides: o });
const turn = (you, opp, st, ym, om) => resolveTurn({ you, opp }, st, ym, om);
const prob = (brs, f) => brs.filter(f).reduce((a, b) => a + b.p, 0);
const flinched = (b) => /Opp flinches/.test(b.label);

// A slow, bulky, ability-inert Normal target. Its Splash is what gets lost.
const wall = mk("Blissey", ["Splash", "Soft-Boiled", "Growl", "Protect"], { ability: "Natural Cure", nature: "Bold", evs: { hp: 252, def: 252, spd: 4 } });
const pFl = (atk, move, tgt = wall, o = {}) => prob(turn(atk, tgt, start(atk, tgt, o), move, "Splash"), flinched);

console.log("-- PART 1: each flinch move rolls, first mover only --");
{
  const cases = [
    ["Golem", "Rock Slide", 0.3 * 0.9],
    ["Mightyena", "Bite", 0.3],
    ["Tauros", "Headbutt", 0.3],
    ["Miltank", "Stomp", 0.3],
    ["Dragonite", "Twister", 0.2],
    ["Girafarig", "Extrasensory", 0.1],
    ["Cacturne", "Needle Arm", 0.3],
    ["Hitmonlee", "Rolling Kick", 0.3 * 0.85],
  ];
  for (const [sp, mv, want] of cases) {
    const atk = mk(sp, [mv, "Splash", "Rest", "Protect"]);
    ok(near(pFl(atk, mv), want), `${mv}: P(flinch) = ${want.toFixed(4)} (got ${pFl(atk, mv).toFixed(4)})`);
  }
  // Snore, while asleep (its sleep-lock exemption is B2b's).
  const snorer = mk("Snorlax", ["Snore", "Splash", "Rest", "Protect"], { nature: "Jolly" });
  const fast = mk("Snorlax", ["Snore", "Splash", "Rest", "Protect"], { evs: { spe: 252 } });
  ok(near(pFl(fast, "Snore", wall, { youStatus: "sleep", youSleepTurns: 4 }), 0.3), "Snore, asleep: P(flinch) = 0.3");
  // Sky Attack flinches on its RELEASE turn.
  const sky = mk("Aerodactyl", ["Sky Attack", "Splash", "Rest", "Protect"]);
  const t1 = turn(sky, wall, start(sky, wall), "Sky Attack", "Splash");
  ok(prob(t1, flinched) === 0, "Sky Attack's charge turn flinches nothing");
  ok(near(prob(turn(sky, wall, t1[0].state, "Sky Attack", "Splash"), flinched), 0.3 * 0.9), "...its release flinches 30% x 90% accuracy");
  // A SLOWER attacker cannot flinch: the target already acted. Not even branched.
  const slow = mk("Golem", ["Rock Slide", "Splash", "Rest", "Protect"], { nature: "Brave", evs: { hp: 252, atk: 252 } });
  const zippy = mk("Jolteon", ["Splash", "Protect", "Rest", "Growl"], { ability: "Volt Absorb" });
  const sb = turn(slow, zippy, start(slow, zippy), "Rock Slide", "Splash");
  ok(prob(sb, (b) => /flinch/.test(b.label)) === 0, "a slower Rock Slide flinches nothing");
  const plain = turn(slow, zippy, start(slow, zippy), "Rock Slide", "Splash").length;
  ok(plain === 2, `...and adds no branches: hit / miss only (got ${plain})`);
  void snorer;
}

console.log();
console.log("-- PART 2: the gates --");
{
  const slide = mk("Golem", ["Rock Slide", "Splash", "Rest", "Protect"]);
  const tgt = (sp, ab) => mk(sp, ["Splash", "Protect", "Rest", "Growl"], { ability: ab, nature: "Bold", evs: { hp: 252, def: 252, spd: 4 } });
  ok(pFl(slide, "Rock Slide", tgt("Dragonite", "Inner Focus")) === 0, "Inner Focus blocks it");
  ok(pFl(slide, "Rock Slide", tgt("Dustox", "Shield Dust")) === 0, "Shield Dust blocks it");
  ok(pFl(slide, "Rock Slide", wall, { oppSubstituteHP: 300 }) === 0, "a Substitute blocks it");
  ok(pFl(slide, "Rock Slide", wall, { oppSubstituteHP: 1 }) === 0, "...even one this hit breaks");
  // A chance flinch into Inner Focus is silent: no Skill cost.
  const ifSkill = turn(slide, tgt("Dragonite", "Inner Focus"), start(slide, tgt("Dragonite", "Inner Focus")), "Rock Slide", "Splash").find((b) => /\(hits\)/.test(b.label)).state.skillYou;
  const ctlSkill = turn(slide, tgt("Dragonite", "Pressure"), start(slide, tgt("Dragonite", "Pressure")), "Rock Slide", "Splash").find((b) => /\(hits\)/.test(b.label)).state.skillYou;
  ok(ifSkill === ctlSkill, `a CHANCE flinch into Inner Focus costs no Skill (${ifSkill} vs ${ctlSkill})`);
}

console.log();
console.log("-- PART 3: Stomp into a Minimized target --");
{
  const stomp = mk("Miltank", ["Stomp", "Splash", "Rest", "Protect"]);
  const dmg = (o) => 100 - turn(stomp, wall, start(stomp, wall, o), "Stomp", "Splash").find((b) => /\(hits\)/.test(b.label)).state.oppHpPct;
  const plain = dmg({}), mini = dmg({ oppMinimized: true });
  ok(mini > plain * 1.9 && mini < plain * 2.1, `Stomp doubles into a Minimized target (${plain.toFixed(2)}% -> ${mini.toFixed(2)}%)`);
  const slam = mk("Miltank", ["Body Slam", "Splash", "Rest", "Protect"]);
  const bs = (o) => 100 - turn(slam, wall, start(slam, wall, o), "Body Slam", "Splash").find((b) => /\(hits\)/.test(b.label)).state.oppHpPct;
  ok(near(bs({}), bs({ oppMinimized: true })), "(control) Body Slam does not");
}

console.log();
console.log("-- PART 4: King's Rock --");
{
  const qa = mk("Raticate", ["Quick Attack", "Crunch", "Rest", "Protect"], { item: "King's Rock", ability: "Guts" });
  ok(near(pFl(qa, "Quick Attack"), 0.1), `a King's Rock Quick Attack flinches 10% (got ${pFl(qa, "Quick Attack").toFixed(4)})`);
  ok(pFl(qa, "Crunch") === 0, "Crunch is not FLAG_KINGS_ROCK_AFFECTED: no flinch");
  ok(pFl(qa, "Quick Attack", wall, { oppSubstituteHP: 300 }) === 0, "into a Substitute: no TARGET_TURN_DAMAGED, no flinch");
  const noItem = mk("Raticate", ["Quick Attack", "Crunch", "Rest", "Protect"], { ability: "Guts" });
  ok(pFl(noItem, "Quick Attack") === 0, "(control) no King's Rock, no flinch");
  // A move with its OWN flinch and the flag: two independent rolls, one flinch.
  const rk = mk("Hitmonlee", ["Rolling Kick", "Splash", "Rest", "Protect"], { item: "King's Rock" });
  const want = (1 - 0.7 * 0.9) * 0.85;
  ok(near(pFl(rk, "Rolling Kick"), want), `Rolling Kick + King's Rock: 1 - 0.7 x 0.9, x 85% accuracy = ${want.toFixed(4)} (got ${pFl(rk, "Rolling Kick").toFixed(4)})`);
}

console.log();
console.log("-- PART 5: a CERTAIN flinch into Inner Focus costs Skill --");
{
  const fo = mk("Hitmontop", ["Fake Out", "Splash", "Rest", "Protect"], { ability: "Intimidate" });
  const t = (ab) => mk("Dragonite", ["Splash", "Protect", "Rest", "Growl"], { ability: ab, nature: "Bold", evs: { hp: 252, def: 252 } });
  const sk = (ab) => turn(fo, t(ab), start(fo, t(ab)), "Fake Out", "Splash")[0].state.skillYou;
  ok(sk("Inner Focus") === sk("Pressure") - 3, `Fake Out into Inner Focus prints PREVENTSFLINCHING: -3 (${sk("Inner Focus")} vs ${sk("Pressure")})`);
  const dusty = mk("Dustox", ["Splash", "Protect", "Rest", "Growl"], { ability: "Shield Dust" });
  const dustyPlain = mk("Dustox", ["Splash", "Protect", "Rest", "Growl"], { ability: "Pressure" });
  const skD = (m) => turn(fo, m, start(fo, m), "Fake Out", "Splash")[0].state.skillYou;
  ok(skD(dusty) === skD(dustyPlain), "(control) Shield Dust stops it FIRST, silently -- no deduction");
  ok(turn(fo, dusty, start(fo, dusty), "Fake Out", "Splash").every((b) => !/Opp flinches/.test(b.label)), "...and Fake Out does not flinch a Shield Dust holder");
  ok(turn(fo, dustyPlain, start(fo, dustyPlain), "Fake Out", "Splash").every((b) => /Opp flinches/.test(b.label)), "(control) ...which it does without it");
}

console.log();
console.log(failures === 0 ? "ALL PASS -- B4c flinch characterization green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

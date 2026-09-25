// ── test-b4-confuse-hit.js ────────────────────────────────────────────────
// B4d: EFFECT_CONFUSE_HIT -- MOVE_EFFECT_CONFUSION (byte 7) as a chance
// secondary (Confusion, Psybeam, Signal Beam 10%; Dizzy Punch, Water Pulse
// 20%; DynamicPunch 100%). SetMoveEffect (:2253-2267) stops it at Shield Dust
// (<= 9), Safeguard (<= 7), a fainted target and a Substitute; then its own
// case (:2533-2545) skips it SILENTLY on Own Tempo or an existing confusion --
// no string even for DynamicPunch's certain one, so no Skill anywhere.
import { buildMon, buildStartState, resolveTurn } from "./logic.js";

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } };
const near = (a, b) => Math.abs(a - b) < 1e-9;

const mk = (species, moves, over = {}) => buildMon({
  species, level: 50, nature: "Hardy", evs: { hp: 252 },
  ability: "Pressure", item: null, moves, friendship: 255, ...over,
});
const start = (you, opp, o = {}) => buildStartState({ you, opp, overrides: o });
const turn = (you, opp, st, ym, om) => resolveTurn({ you, opp }, st, ym, om);
const prob = (brs, f) => brs.filter(f).reduce((a, b) => a + b.p, 0);

// The target is FASTER, so it acts before the hit and takes no confusion check
// this turn: a fresh confusion is still `true` at turn end.
const tgt = (ab = "Pressure", o = {}) => mk("Jolteon", ["Splash", "Protect", "Rest", "Growl"], { ability: ab, evs: { hp: 252, def: 252, spd: 252 }, ...o });
const conf = (b) => !!b.state.oppConfused;
const pConf = (atk, mv, t = tgt(), o = {}) => prob(turn(atk, t, start(atk, t, o), mv, "Splash"), conf);

console.log("-- PART 1: each move rolls --");
{
  for (const [sp, mv, want] of [
    ["Alakazam", "Confusion", 0.1], ["Starmie", "Psybeam", 0.1], ["Ninjask", "Signal Beam", 0.1],
    ["Tauros", "Dizzy Punch", 0.2], ["Lanturn", "Water Pulse", 0.2], ["Machamp", "DynamicPunch", 0.5],
  ]) {
    const atk = mk(sp, [mv, "Splash", "Rest", "Protect"]);
    ok(near(pConf(atk, mv), want), `${mv}: P(confused) = ${want} (got ${pConf(atk, mv).toFixed(4)})`);
  }
  const alak = mk("Alakazam", ["Confusion", "Splash", "Rest", "Protect"]);
  const fresh = turn(alak, tgt(), start(alak, tgt()), "Confusion", "Splash").filter(conf);
  ok(fresh.length > 0 && fresh.every((b) => b.state.oppConfused === true), "a fresh confusion: the next check is its first");
}

console.log();
console.log("-- PART 2: the gates, all silent --");
{
  const alak = mk("Alakazam", ["Psybeam", "Splash", "Rest", "Protect"]);
  ok(pConf(alak, "Psybeam", tgt("Own Tempo")) === 0, "Own Tempo");
  ok(pConf(alak, "Psybeam", tgt(), { oppSafeguardTurns: 3 }) === 0, "Safeguard (byte 7 <= 7)");
  ok(pConf(alak, "Psybeam", tgt("Shield Dust")) === 0, "Shield Dust");
  ok(pConf(alak, "Psybeam", tgt(), { oppSubstituteHP: 300 }) === 0, "a Substitute");
  const again = turn(alak, tgt(), start(alak, tgt(), { oppConfused: 3 }), "Psybeam", "Splash");
  // The faster target takes check 3 first: 1/3 it snaps out -- and THEN
  // Psybeam may confuse it afresh (10%). A still-confused target is never
  // refreshed: its counter only ticks, 3 -> 4.
  ok(again.every((b) => [false, true, 4].includes(b.state.oppConfused)), "an existing confusion is ticked, never refreshed");
  ok(near(prob(again, (b) => b.state.oppConfused === true), (1 / 3) * 0.1), "a fresh confusion only after snapping out: 1/3 x 10%");
  const dp = mk("Machamp", ["DynamicPunch", "Splash", "Rest", "Protect"]);
  const sk = (t) => turn(dp, t, start(dp, t), "DynamicPunch", "Splash").find((b) => /\(hits\)/.test(b.label)).state.skillYou;
  ok(sk(tgt("Own Tempo")) === sk(tgt()), "DynamicPunch's CERTAIN confusion into Own Tempo prints nothing: no Skill cost");
}

console.log();
console.log(failures === 0 ? "ALL PASS -- B4d confuse-hit characterization green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

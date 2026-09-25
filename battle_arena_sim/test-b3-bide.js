// ── test-b3-bide.js ───────────────────────────────────────────────────────
// B3 batch 4c: Bide.
//
//   PART 1  the set turn: no accuracy check, +1 Skill, damage taken BEFORE
//           setbide does not count (setbide zeroes gBideDmg)
//   PART 2  the storing turn: forced, no Skill, counter 2 -> 1, damage stored
//   PART 3  the unleash: exactly twice the stored damage, a plain +1 Skill even
//           into a resist (the SE/NVE flags are cleared); Ghost is immune; with
//           nothing stored it FAILS
//   PART 4  end-of-turn residuals are NOT stored (HITMARKER_IGNORE_BIDE)
//   PART 5  Protect blocks the unleash and cancels the lock
//   PART 6  the AI row: AI_CV_Bide is -2 unless the user is above 90%
import { buildMon, buildStartState, resolveTurn, search, skillDelta, scoreOpponentMoveDist, AI_HANDLERS } from "./logic.js";

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } };

const mk = (species, moves, over = {}) => buildMon({
  species, level: 50, nature: "Adamant", evs: { hp: 252, atk: 252 },
  ability: "Pressure", item: null, moves, friendship: 255, ...over,
});
const bider = mk("Snorlax", ["Bide", "Body Slam", "Rest", "Splash"], { ability: "Thick Fat" });
// Slower than Snorlax is hard; use a slow hitter and lower its speed instead.
const slowHitter = mk("Slowbro", ["Body Slam", "Splash", "Rest", "Protect"], { ability: "Oblivious", nature: "Brave" });
const hpOf = (pct, mon) => Math.round((pct / 100) * mon.stats.hp);
const start = (you, opp, o = {}) => buildStartState({ you, opp, overrides: o });
const turn = (you, opp, st, ym, om) => resolveTurn({ you, opp }, st, ym, om);

console.log("-- PART 1: the set turn --");
{
  // Against +6 evasion an accuracy-checked move would have miss branches;
  // setbide has no accuracycheck, so every branch must lock.
  const evasive = turn(bider, slowHitter, start(bider, slowHitter, { oppStages: { atk: 0, def: 0, spa: 0, spd: 0, spe: 0, evasion: 6, accuracy: 0 } }), "Bide", "Splash");
  ok(evasive.every((b) => b.state.youLock?.kind === "bide"), "Bide's set turn has no accuracy check, even into +6 evasion");
  // Nor does a Protect stop it: Cmd_attackcanceler's Protect branch requires
  // `!IsTwoTurnsMove(move) || STATUS2_MULTIPLETURNS` (src/battle_script_
  // commands.c:992-996), and Bide IS a two-turn move with no lock yet.
  const intoProtect = turn(bider, slowHitter, start(bider, slowHitter), "Bide", "Protect");
  ok(intoProtect.every((b) => b.state.youLock?.kind === "bide"), "a foe's Protect does not stop Bide's set turn");
  const brs = turn(bider, slowHitter, start(bider, slowHitter), "Bide", "Splash");
  ok(brs.every((b) => b.state.youLock?.kind === "bide" && b.state.youLock.n === 2 && b.state.youLock.dmg === 0),
    "setbide: counter 2, nothing stored");
  ok(brs.every((b) => b.state.skillYou === skillDelta("landed")), "the set turn scores a plain +1");

  // A faster hitter lands BEFORE setbide: that damage must not count.
  const fast = mk("Hitmonchan", ["Mach Punch", "Splash", "Rest", "Protect"], { ability: "Keen Eye" });
  const pre = turn(bider, fast, start(bider, fast), "Bide", "Mach Punch").find((b) => b.state.yourHpPct < 100);
  ok(pre && pre.state.youLock.dmg === 0, `damage taken before setbide is not stored (stored ${pre?.state.youLock.dmg})`);
}

console.log();
console.log("-- PART 2: storing --");
let stored;
{
  let s = turn(bider, slowHitter, start(bider, slowHitter), "Bide", "Splash")[0].state;
  const tree = search({ you: bider, opp: mk("Slowbro", ["Body Slam", "Rest", "Protect", "Amnesia"], { ability: "Oblivious" }) }, s, 1);
  ok(tree.allOptions.length === 1 && tree.allOptions[0].move === "Bide", "a biding player has exactly one option: Bide");

  const brs = turn(bider, slowHitter, s, "Bide", "Body Slam");
  // B4: the branch where Body Slam did NOT also paralyse the bider -- its 30%
  // would otherwise leak a full-paralysis split into every later part.
  const b = brs.find((x) => x.state.yourHpPct < 100 && x.state.youStatus == null);
  ok(b, "(probe check) the foe's Body Slam lands on the storing turn");
  const lost = hpOf(s.yourHpPct, bider) - hpOf(b.state.yourHpPct, bider);
  ok(/storing energy/.test(b.label), `the storing turn says so (${b.label})`);
  ok(b.state.youLock.n === 1 && b.state.youLock.dmg === lost, `counter 2 -> 1 and exactly the ${lost} HP lost is stored (got ${b.state.youLock.dmg})`);
  ok(b.state.skillYou === s.skillYou, "a storing turn scores NO Skill (attackcanceler returned before HITMARKER_OBEYS)");
  stored = b.state;
  console.log(`   stored ${b.state.youLock.dmg} HP`);
}

console.log();
console.log("-- PART 3: the unleash --");
{
  const brs = turn(bider, slowHitter, stored, "Bide", "Splash");
  const hit = brs.find((b) => b.state.oppHpPct < 100);
  ok(hit, "(probe check) the unleash lands");
  const dealt = hpOf(100, slowHitter) - hpOf(hit.state.oppHpPct, slowHitter);
  ok(dealt === stored.youLock.dmg * 2, `the unleash deals exactly twice the stored damage (${dealt} vs 2 x ${stored.youLock.dmg})`);
  ok(hit.state.youLock === null, "and the lock is gone");
  ok(hit.state.skillYou - stored.skillYou === skillDelta("landed"), "a landed unleash is a plain +1");

  // Into a Rock type (Normal is resisted): still +1, because the flags are cleared.
  const rock = mk("Golem", ["Splash", "Rest", "Protect", "Earthquake"], { ability: "Rock Head" });
  const intoRock = turn(bider, rock, { ...stored }, "Bide", "Splash").find((b) => b.state.oppHpPct < 100);
  ok(intoRock && intoRock.state.skillYou - stored.skillYou === skillDelta("landed"),
    "into a resist it still scores +1, not the -1 of a not-very-effective hit");
  const dealtRock = hpOf(100, rock) - hpOf(intoRock.state.oppHpPct, rock);
  ok(dealtRock === Math.min(stored.youLock.dmg * 2, rock.stats.hp), "and still deals the full fixed amount");

  const ghost = mk("Gengar", ["Splash", "Rest", "Protect", "Shadow Ball"], { ability: "Levitate" });
  const intoGhost = turn(bider, ghost, { ...stored }, "Bide", "Splash");
  ok(intoGhost.every((b) => b.state.oppHpPct === 100 && b.state.skillYou - stored.skillYou === skillDelta("noEffect")),
    "a Ghost is immune, and that scores as no effect");

  const empty = { ...stored, youLock: { ...stored.youLock, dmg: 0 } };
  const failed = turn(bider, slowHitter, empty, "Bide", "Splash");
  ok(failed.every((b) => b.state.oppHpPct === 100 && b.state.skillYou - stored.skillYou === skillDelta("noEffect") && b.state.youLock === null),
    "with nothing stored the unleash FAILS, and the lock still clears");
  console.log(`   dealt ${dealt} (2 x ${stored.youLock.dmg}); into Golem ${dealtRock}; Ghost immune; empty fails`);
}

console.log();
console.log("-- PART 4: end-of-turn residuals are not stored --");
{
  // Poisoned bider: the maxHP/8 poison tick at end of turn must not count.
  let s = turn(bider, slowHitter, start(bider, slowHitter, { youStatus: "poison" }), "Bide", "Splash")[0].state;
  ok(s.youLock.dmg === 0 && s.yourHpPct < 100, `the poison tick lowered HP but stored nothing (stored ${s.youLock.dmg})`);
}

console.log();
console.log("-- PART 5: Protect blocks the unleash and cancels the lock --");
{
  const brs = turn(bider, slowHitter, stored, "Bide", "Protect");
  const blocked = brs.filter((b) => b.state.oppHpPct === 100);
  ok(blocked.length >= 1 && blocked.every((b) => b.state.youLock === null), "a Protect-blocked unleash deals nothing and the lock is gone");
}

console.log();
console.log("-- PART 6: the AI row --");
{
  ok(AI_HANDLERS.EFFECT_BIDE, "Bide has an AI row");
  const cv = AI_HANDLERS.EFFECT_BIDE.checkViability;
  ok(cv({ userHpPct: 100 })[0].delta === 0 && cv({ userHpPct: 91 })[0].delta === 0, "above 90%: no penalty");
  ok(cv({ userHpPct: 90 })[0].delta === -2 && cv({ userHpPct: 50 })[0].delta === -2, "at or below 90%: -2 (`if_hp_more_than 90` is strict)");
}

console.log();
console.log(failures === 0 ? "ALL PASS -- B3 batch 4c characterization green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

// ── test-b3-uproar.js ─────────────────────────────────────────────────────
// B3 batch 4d: Uproar, and the Rest clauses it exposed.
//
//   PART 1  the lock: a landed Uproar locks for 2..5 turns, equally; forced
//   PART 2  ENDTURN_UPROAR wakes EVERY sleeper that is not Soundproof
//   PART 3  CANCELER_ASLEEP: a sleeper whose turn comes during an uproar wakes
//           and ACTS (UproarWakeUpCheck, with the same cursor push as 4a)
//   PART 4  the sleep block: a sleep move scores +1 and does nothing -- on the
//           branches that would have missed too; Soundproof is exempt;
//           Yawn fails; a pending Yawn does not land
//   PART 5  Rest, per its script: already asleep -2, uproar +1, Insomnia -2,
//           full HP +1 -- each with no effect
//   PART 6  the counter runs out: a 2-turn uproar ends after its second turn
import { buildMon, buildStartState, resolveTurn, search, skillDelta } from "./logic.js";

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } };

const mk = (species, moves, over = {}) => buildMon({
  species, level: 50, nature: "Adamant", evs: { hp: 252, atk: 252 },
  ability: "Pressure", item: null, moves, friendship: 255, ...over,
});
const start = (you, opp, o = {}) => buildStartState({ you, opp, overrides: o });
const turn = (you, opp, st, ym, om) => resolveTurn({ you, opp }, st, ym, om);
const prob = (brs, f) => brs.filter(f).reduce((a, b) => a + b.p, 0);

const loud = mk("Exploud", ["Uproar", "Splash", "Rest", "Hyper Voice"], { ability: "Soundproof" });
const wall = mk("Blissey", ["Splash", "Soft-Boiled", "Hypnosis", "Yawn"], { ability: "Natural Cure", evs: { hp: 252, def: 252 } });
const U = (n = 3) => ({ move: "Uproar", kind: "uproar", n });

console.log("-- PART 1: the lock --");
{
  const brs = turn(loud, wall, start(loud, wall), "Uproar", "Splash");
  const landed = brs.filter((b) => b.state.oppHpPct < 100);
  const pl = prob(landed, () => true);
  // After the end of turn 1 the counter has already dropped once: 2..5 -> 1..4.
  const byN = [1, 2, 3, 4].map((n) => prob(landed, (b) => b.state.youLock?.kind === "uproar" && b.state.youLock.n === n));
  ok(byN.every((x) => Math.abs(x - pl / 4) < 1e-9), `the length must be (Random() & 3) + 2, equally (got ${byN.map((x) => x.toFixed(3)).join("/")})`);
  const tree = search({ you: loud, opp: mk("Blissey", ["Growl", "Soft-Boiled", "Protect", "Rest"], { ability: "Natural Cure" }) }, start(loud, wall, { youLock: U() }), 1);
  ok(tree.allOptions.length === 1 && tree.allOptions[0].move === "Uproar", "an uproaring player has exactly one option");
  console.log(`   split ${byN.map((x) => x.toFixed(3)).join(" / ")}`);
}

console.log();
console.log("-- PART 2: the end-of-turn wake-up --");
{
  const sleeper = mk("Snorlax", ["Body Slam", "Growl", "Rest", "Splash"], { ability: "Thick Fat" });
  // The opponent Snorlax is asleep for a while; the player uproars.
  const brs = turn(loud, sleeper, start(loud, sleeper, { youLock: U(), oppStatus: "sleep", oppSleepTurns: 3 }), "Uproar", "Body Slam");
  ok(brs.every((b) => b.state.oppStatus === null), "a sleeping foe must be awake at the end of an uproar turn");
  const sp = mk("Snorlax", ["Body Slam", "Growl", "Rest", "Splash"], { ability: "Soundproof" });
  const brs2 = turn(loud, sp, start(loud, sp, { youLock: U(), oppStatus: "sleep", oppSleepTurns: 3 }), "Uproar", "Body Slam");
  ok(brs2.every((b) => b.state.oppStatus === "sleep"), "a Soundproof sleeper must stay asleep");

  // The END-OF-TURN wake on its own: a FASTER sleeper tries to move before the
  // uproar has started (so the canceler does not wake it -- it just sleeps on),
  // then the uproar begins and ENDTURN_UPROAR wakes it.
  const fastSleeper = mk("Jolteon", ["Thunderbolt", "Growl", "Rest", "Splash"], { ability: "Volt Absorb" });
  const brs3 = turn(loud, fastSleeper, start(loud, fastSleeper, { oppStatus: "sleep", oppSleepTurns: 3 }), "Uproar", "Thunderbolt");
  const started = brs3.filter((b) => b.state.youLock?.kind === "uproar");
  ok(started.length >= 1, "(probe check) the uproar must start this turn");
  ok(started.every((b) => b.state.yourHpPct === 100), "(probe check) the faster sleeper did NOT act -- it was still asleep");
  ok(started.every((b) => b.state.oppStatus === null), "...and the end-of-turn uproar must wake it");
}

console.log();
console.log("-- PART 3: a sleeper whose turn comes during the uproar wakes and acts --");
{
  const sleeper = mk("Snorlax", ["Body Slam", "Growl", "Rest", "Splash"], { ability: "Thick Fat" });
  // Snorlax is slower, so the uproar is already running when its turn comes.
  const brs = turn(loud, sleeper, start(loud, sleeper, { youLock: U(), oppStatus: "sleep", oppSleepTurns: 3 }), "Uproar", "Body Slam");
  ok(brs.some((b) => b.state.yourHpPct < 100), "the woken Snorlax's Body Slam must land THIS turn");
}

console.log();
console.log("-- PART 4: nothing falls asleep during an uproar --");
{
  // The foe uproars; the player tries Hypnosis. Put evasion on the target so
  // the accuracy check WOULD produce misses -- the uproar check comes first.
  const hyp = mk("Hypno", ["Hypnosis", "Splash", "Rest", "Psychic"], { ability: "Insomnia" });
  const target = mk("Exploud", ["Uproar", "Splash", "Rest", "Hyper Voice"], { ability: "Pressure" });
  const evasive = { atk: 0, def: 0, spa: 0, spd: 0, spe: 0, evasion: 6, accuracy: 0 };
  const brs = turn(hyp, target, start(hyp, target, { oppLock: U(), oppStages: evasive }), "Hypnosis", "Uproar");
  ok(brs.every((b) => b.state.oppStatus !== "sleep"), "Hypnosis must not put anything to sleep during an uproar");
  ok(brs.every((b) => b.state.skillYou === skillDelta("landed")),
    `...and must score +1 on EVERY branch, including those that would have missed (skills ${[...new Set(brs.map((b) => b.state.skillYou))].join(",")})`);

  // Soundproof is exempt: a Soundproof target can still be put to sleep.
  const spTarget = mk("Exploud", ["Uproar", "Splash", "Rest", "Hyper Voice"], { ability: "Soundproof" });
  const brs2 = turn(hyp, spTarget, start(hyp, spTarget, { oppLock: U() }), "Hypnosis", "Uproar");
  ok(brs2.some((b) => b.state.oppStatus === "sleep"), "a Soundproof target CAN be put to sleep during an uproar");

  // Yawn fails, and a pending Yawn does not land.
  const yawner = mk("Slaking", ["Yawn", "Splash", "Rest", "Body Slam"], { ability: "Truant" });
  const y = turn(yawner, target, start(yawner, target, { oppLock: U() }), "Yawn", "Uproar");
  ok(y.every((b) => b.state.oppYawnTurns == null), "Yawn must fail during an uproar");
  const pending = turn(yawner, target, start(yawner, target, { oppLock: U(), oppYawnTurns: 1 }), "Splash", "Uproar");
  ok(pending.every((b) => b.state.oppStatus !== "sleep"), "a pending Yawn must not land during an uproar");
}

console.log();
console.log("-- PART 5: Rest, per its script --");
{
  const rester = mk("Snorlax", ["Rest", "Body Slam", "Growl", "Splash"], { ability: "Thick Fat" });
  const foe = mk("Blissey", ["Splash", "Soft-Boiled", "Growl", "Protect"], { ability: "Natural Cure" });
  const full = turn(rester, foe, start(rester, foe), "Rest", "Splash");
  ok(full.every((b) => b.state.youStatus === null && b.state.skillYou === skillDelta("landed")),
    "Rest at FULL HP: no sleep, and +1 -- BattleScript_AlreadyAtFullHp sets no result flag");
  const hurt = { yourHpPct: 50 };
  const loudFoe = mk("Exploud", ["Uproar", "Splash", "Rest", "Hyper Voice"], { ability: "Pressure" });
  const up = turn(rester, loudFoe, start(rester, loudFoe, { ...hurt, oppLock: U() }), "Rest", "Uproar");
  ok(up.every((b) => b.state.yourHpPct < 100), "Rest during an uproar must NOT heal (the end-of-turn wake would hide a sleep)");
  ok(up.every((b) => b.state.youStatus !== "sleep" && b.state.skillYou === skillDelta("landed")),
    "Rest during an uproar: no sleep, no heal, and +1 (RestCantSleep sets no flag)");
  const ins = mk("Snorlax", ["Rest", "Body Slam", "Growl", "Splash"], { ability: "Insomnia" });
  const i = turn(ins, foe, start(ins, foe, hurt), "Rest", "Splash");
  const i0 = start(ins, foe, hurt).yourHpPct; // B6 step 1: 50% snapped to a whole HP
  ok(i.every((b) => b.state.youStatus === null && b.state.yourHpPct === i0 && b.state.skillYou === skillDelta("noEffect")),
    "Rest with Insomnia: no heal, and -2 net (+1, then the STAYEDAWAKEUSING deduction of -3)");
  const healed = turn(rester, foe, start(rester, foe, hurt), "Rest", "Splash");
  ok(healed.every((b) => b.state.yourHpPct === 100 && b.state.youStatus === "sleep"), "(control) an ordinary Rest heals and sleeps");
}

console.log();
console.log("-- PART 6: a 2-turn uproar ends --");
{
  const brs = turn(loud, wall, start(loud, wall, { youLock: U(1) }), "Uproar", "Splash");
  ok(brs.every((b) => b.state.youLock === null), "counter 1 -> 0 at the end of the turn: the uproar ends");
}

console.log();
console.log(failures === 0 ? "ALL PASS -- B3 batch 4d characterization green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

// ── test-d-f2a-ability-belief.js ──────────────────────────────────────────
// Phase D finding F2a: what the AI knows of the PLAYER's ability.
//
//   PART 1  the belief. get_ability AI_TARGET (src/battle_ai_script_commands.c:
//           1350-1404): the recorded ability; else a trapping ability; else the
//           species' -- a fresh 50/50 between two at every read. check_ability
//           (`if_ability`, :1407-1455) is deterministic: "unable to answer" for
//           an unrecorded two-ability species.
//   PART 2  the records (RecordAbilityBattle call sites, surveyed in
//           arena-solver/docs/phase-d-log.md F2): battle start, the move
//           scripts' own checks (before accuracy, so into a miss too), typecalc,
//           the contact triggers (landed or not).
//
// The AI's choice probability is LINEAR in one move's score distribution with
// the others fixed, so an unrecorded two-ability lead must give EXACTLY the
// 50/50 mixture of the two recorded cases -- the assertion used throughout.
//
// Not probed, and why: whether two get_ability reads on ONE path draw
// independently (they do in source, and taRead nests them) cannot be observed in
// Gen III singles -- no species' two abilities are both tested on one path
// (Magnitude's Levitate + HighRisk's Wonder Guard, the head's absorbers +
// Soundproof, AccDown's Keen Eye + Clear Body: no species has both of a pair).
//
// Found by the emulator differential once the harness could create two-ability
// leads: Sing / Supersonic / Uproar into a Soundproof Electrode, fire moves into
// a Flash Fire Arcanine, Toxic into an Immunity Snorlax -- chosen by the ROM,
// P 0 in the sim, which gave the AI the true ability.
import { buildMon, buildStartState, resolveTurn, chooseOpponentMoves } from "./logic.js";
import { SPECIES } from "./species-data.js";

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } else console.log("  ok   " + m); };
const mk = (species, moves, over = {}) => buildMon({
  species, level: 50, nature: "Hardy", evs: {}, ability: "Pressure", item: null, moves, friendship: 255, ...over,
});
const J = JSON.stringify;
const dist = (opp, you, over = {}) =>
  Object.fromEntries(chooseOpponentMoves(opp, you, buildStartState({ you, opp, overrides: over })).map((c) => [c.move, c.prob]));
const near = (a, b) => Math.abs((a ?? 0) - (b ?? 0)) < 1e-12;
const mixOk = (m, a, b, move) => near(m[move], 0.5 * (a[move] ?? 0) + 0.5 * (b[move] ?? 0));

console.log("-- PART 1: the belief --");
{
  // Snorlax {Immunity, Thick Fat}: AI_CBM_Toxic's read.
  const opp = () => mk("Gengar", ["Toxic", "Spite"], { ability: "Levitate" });
  const sn = (ability) => mk("Snorlax", ["Spite"], { ability });
  const unTF = dist(opp(), sn("Thick Fat")), unIm = dist(opp(), sn("Immunity"));
  const recIm = dist(opp(), sn("Thick Fat"), { youAbilityRecord: "Immunity" });
  const recTF = dist(opp(), sn("Thick Fat"), { youAbilityRecord: "Thick Fat" });
  ok(J(unTF) === J(unIm), `unrecorded: the AI cannot tell Thick Fat from Immunity (${J(unTF)} vs ${J(unIm)})`);
  ok(mixOk(unTF, recIm, recTF, "Toxic") && unTF.Toxic > 0 && unTF.Toxic < 1,
    `unrecorded = the 50/50 mixture of the two records (Toxic ${unTF.Toxic} vs ${recIm.Toxic ?? 0} / ${recTF.Toxic})`);
  ok(near(recIm.Toxic, 0), `recorded Immunity: Toxic -10, P 0 (got ${J(recIm)})`);

  // A single-ability species is known outright: Latios {Levitate}.
  const eq = dist(mk("Snorlax", ["Earthquake", "Spite"], { ability: "Thick Fat" }), mk("Latios", ["Spite"], { ability: "Levitate" }));
  ok(near(eq.Earthquake, 0), `single-ability Latios: Levitate known without a record (got ${J(eq)})`);

  // Trapping abilities are seen through: Dugtrio {Sand Veil, Arena Trap}, read by
  // AI_CV_ChangeSelfAbility (Role Play), whose list has Sand Veil but not Arena Trap.
  const rp = () => mk("Mr. Mime", ["Role Play", "Spite"], { ability: "Soundproof" });
  const dug = (ability) => mk("Dugtrio", ["Spite"], { ability });
  const trapTrue = dist(rp(), dug("Arena Trap")), trapRec = dist(rp(), dug("Arena Trap"), { youAbilityRecord: "Arena Trap" });
  ok(J(trapTrue) === J(trapRec), `true Arena Trap is seen outright (${J(trapTrue)} vs ${J(trapRec)})`);
  const svTrue = dist(rp(), dug("Sand Veil"));
  const svRec = dist(rp(), dug("Sand Veil"), { youAbilityRecord: "Sand Veil" });
  ok(mixOk(svTrue, svRec, trapRec, "Role Play") && J(svTrue) !== J(trapTrue),
    `true Sand Veil is a 50/50 guess over Sand Veil / Arena Trap (${J(svTrue)})`);

  // check_ability: AI_CBM_SpeedDown's Speed Boost. Yanma {Speed Boost, Compound
  // Eyes} unrecorded: "unable to answer" -- never -10. Ninjask {Speed Boost}: -10.
  const sd = () => mk("Snorlax", ["Scary Face", "Spite"], { ability: "Thick Fat" });
  const yan = dist(sd(), mk("Yanma", ["Spite"], { ability: "Speed Boost" }));
  const yanRec = dist(sd(), mk("Yanma", ["Spite"], { ability: "Speed Boost" }), { youAbilityRecord: "Speed Boost" });
  const nin = dist(sd(), mk("Ninjask", ["Spite"], { ability: "Speed Boost" }));
  ok(yan["Scary Face"] > 0, `unrecorded Yanma: if_ability cannot answer, no -10 (got ${J(yan)})`);
  ok(near(yanRec["Scary Face"], 0) && near(nin["Scary Face"], 0), `recorded Yanma / single-ability Ninjask: -10 (got ${J(yanRec)} / ${J(nin)})`);
}

console.log("-- PART 2: the records --");
const rec = (branches) => [...new Set(branches.map((b) => b.state.youAbilityRecord ?? null))];
const turn = (you, opp, ym, om, over) => resolveTurn({ you, opp }, buildStartState({ you, opp, overrides: over }), ym, om);
{
  // Battle start. The AI's Intimidate records INTIMIDATE as the PLAYER's ability
  // (INTIMIDATE1 called with battler 0) -- a Thick Fat Snorlax reads as Intimidate.
  const st = buildStartState({ you: mk("Snorlax", ["Spite"], { ability: "Thick Fat" }), opp: mk("Arcanine", ["Spite"], { ability: "Intimidate" }) });
  ok(st.youAbilityRecord === "Intimidate", `the AI's Intimidate records INTIMIDATE on the player (got ${st.youAbilityRecord})`);
  // ...and its script then records the player's Clear Body.
  const cb = buildStartState({ you: mk("Metagross", ["Spite"], { ability: "Clear Body" }), opp: mk("Arcanine", ["Spite"], { ability: "Intimidate" }) });
  ok(cb.youAbilityRecord === "Clear Body", `...overwritten by the player's Clear Body (got ${cb.youAbilityRecord})`);
  const none = buildStartState({ you: mk("Snorlax", ["Spite"], { ability: "Thick Fat" }), opp: mk("Snorlax", ["Spite"], { ability: "Thick Fat" }) });
  ok(none.youAbilityRecord === null, `no start-of-battle ability: nothing recorded (got ${none.youAbilityRecord})`);
  // The weather argument the start record rests on: every weather-ability
  // species has that one ability only, so a tie cannot change the AI's belief.
  const weatherSp = Object.entries(SPECIES).filter(([, e]) => (e.abilities ?? []).some((a) => ["Drizzle", "Drought", "Sand Stream"].includes(a)));
  ok(weatherSp.length > 0 && weatherSp.every(([, e]) => e.abilities.length === 1), `weather-ability species are single-ability (${weatherSp.map(([k]) => k).join(", ")})`);
}
{
  // A script's pre-accuracy check records into a MISS too: Toxic (85%) into an
  // Immunity Snorlax, every branch -- and there is no hit/miss split at all.
  const b = turn(mk("Snorlax", ["Spite"], { ability: "Immunity" }), mk("Gengar", ["Toxic"], { ability: "Levitate" }), "Spite", "Toxic");
  ok(J(rec(b)) === J(["Immunity"]), `Toxic into Immunity records it in every branch (got ${J(rec(b))})`);
  // Into a Protect as well (attackcanceler only sets MISSED and continues).
  const p = turn(mk("Snorlax", ["Protect"], { ability: "Immunity" }), mk("Gengar", ["Toxic"], { ability: "Levitate" }), "Protect", "Toxic");
  ok(J(rec(p)) === J(["Immunity"]), `...even into a Protect (got ${J(rec(p))})`);
  // Soundproof at the canceler: Sing into a Soundproof Electrode.
  const sp = turn(mk("Electrode", ["Spite"], { ability: "Soundproof" }), mk("Jigglypuff", ["Sing"], { ability: "Cute Charm" }), "Spite", "Sing");
  ok(J(rec(sp)) === J(["Soundproof"]), `Sing into Soundproof records it (got ${J(rec(sp))})`);
  // A DAMAGING sound move records at the canceler too, so on a miss branch as
  // well: Hyper Voice into a Soundproof Electrode at +1 evasion.
  const hv = turn(mk("Electrode", ["Spite"], { ability: "Soundproof" }), mk("Exploud", ["Hyper Voice"], { ability: "Soundproof" }), "Spite", "Hyper Voice", { youStages: { evasion: 1 } });
  ok(hv.length >= 1 && J(rec(hv)) === J(["Soundproof"]), `Hyper Voice into Soundproof at +1 evasion: every branch (got ${J(rec(hv))}, ${hv.length} branches)`);
  // Only the PLAYER's history exists: the player's Toxic into an Immunity
  // opponent records nothing.
  const mine = turn(mk("Gengar", ["Toxic"], { ability: "Levitate" }), mk("Snorlax", ["Spite"], { ability: "Immunity" }), "Toxic", "Spite");
  ok(J(rec(mine)) === J([null]), `the player's Toxic into an Immunity opponent records nothing (got ${J(rec(mine))})`);
}
{
  // typecalc: a Ground move into a Levitate Latios records Levitate on a hit AND
  // on a missed roll (CheckWonderGuardAndLevitate); a Protect records nothing.
  const lat = () => mk("Latios", ["Spite", "Protect"], { ability: "Levitate" });
  const mud = () => mk("Marowak", ["Bone Club", "Earthquake"], { ability: "Rock Head" });
  const h = turn(lat(), mud(), "Spite", "Bone Club");
  ok(J(rec(h)) === J(["Levitate"]) && h.length >= 2, `Bone Club (85%) into Levitate: recorded on hit and missed roll (got ${J(rec(h))}, ${h.length} branches)`);
  const pr = turn(lat(), mud(), "Protect", "Earthquake");
  ok(J(rec(pr)) === J([null]), `...into a Protect: nothing (got ${J(rec(pr))})`);
  // The absorbers record on a landed move: Flamethrower into a Flash Fire Arcanine.
  const ff = turn(mk("Arcanine", ["Spite"], { ability: "Flash Fire" }), mk("Charizard", ["Flamethrower"], { ability: "Blaze" }), "Spite", "Flamethrower");
  ok(J(rec(ff)) === J(["Flash Fire"]), `Flamethrower into Flash Fire records it (got ${J(rec(ff))})`);
  // Sturdy through tryKO (Fissure into a Sturdy Magnemite... typecalc first).
  const st = turn(mk("Sudowoodo", ["Spite"], { ability: "Sturdy" }), mk("Dugtrio", ["Fissure"], { ability: "Sand Veil" }), "Spite", "Fissure");
  ok(J(rec(st)) === J(["Sturdy"]), `Fissure into Sturdy records it (got ${J(rec(st))})`);
}
{
  // Contact: Static records on its 1/3 trigger even when the attacker cannot be
  // paralysed (already statused) -- a record-only branch.
  const e = mk("Electrode", ["Spite"], { ability: "Static" });
  const a = mk("Snorlax", ["Tackle"], { ability: "Thick Fat" });
  const b = turn(e, a, "Spite", "Tackle", { oppStatus: "burn" });
  const hitP = b.filter((x) => x.state.yourHpPct < 100).reduce((t, x) => t + x.p, 0);
  const recP = b.filter((x) => x.state.youAbilityRecord === "Static").reduce((t, x) => t + x.p, 0);
  ok(hitP > 0 && near(recP / hitP, 1 / 3), `Static records on 1/3 of the landed hits into a burned attacker (${(recP / hitP).toFixed(6)})`);
  // Multi-hit, record-only: 1 - (2/3)^hits over the hit-count branches.
  const d = turn(e, mk("Nidoking", ["Double Kick"], { ability: "Poison Point" }), "Spite", "Double Kick", { oppStatus: "burn" });
  const dHit = d.filter((x) => x.state.yourHpPct < 100).reduce((t, x) => t + x.p, 0);
  const dRec = d.filter((x) => x.state.youAbilityRecord === "Static").reduce((t, x) => t + x.p, 0);
  ok(dHit > 0 && near(dRec / dHit, 1 - (2 / 3) ** 2), `Double Kick: 1 - (2/3)^2 of its landed uses (${(dRec / dHit).toFixed(6)})`);
}
{
  // The AI then acts on the record: after Sing into Soundproof, P(Sing) 0.
  const e = mk("Electrode", ["Spite"], { ability: "Soundproof" });
  const j = mk("Jigglypuff", ["Sing", "Spite"], { ability: "Cute Charm" });
  const before = dist(j, e);
  const after = turn(e, j, "Spite", "Sing").map((b) => chooseOpponentMoves(j, e, b.state).find((c) => c.move === "Sing")?.prob ?? 0);
  ok(before.Sing > 0 && after.every((x) => x === 0), `Sing: guessed before (${before.Sing}), P 0 once Soundproof is recorded (${J(after)})`);
}

console.log();
console.log(failures === 0 ? "ALL PASS -- F2a ability belief green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

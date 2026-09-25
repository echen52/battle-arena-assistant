// ── test-b4-status-secondaries.js ─────────────────────────────────────────
// B4a: the STATUS chance secondaries, through Cmd_seteffectwithchance
// (src/battle_script_commands.c:2908-2939) and SetMoveEffect (:2234-2520).
//
//   PART 1  every status secondary rolls at its battle_moves.h chance -- not
//           just the three moves the old SECONDARY_EFFECT_CHANCE table knew
//   PART 2  the gates: Substitute (even one the hit breaks), Shield Dust, a
//           fainted target, an existing status, type and ability immunities,
//           Safeguard, freeze-in-sun, and a frozen target hit by fire
//   PART 3  Serene Grace doubles; a CERTAIN secondary into its blocking ability
//           prints the prevention string and costs the attacker Skill
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

// A bulky, slow, ability-inert Normal target that cannot be KO'd in one hit.
const wall = mk("Blissey", ["Splash", "Soft-Boiled", "Growl", "Protect"], { ability: "Natural Cure", evs: { hp: 252, def: 252, spd: 252 } });
const pOpp = (atk, move, tgt = wall, o = {}, f = (b) => b.state.oppStatus != null) =>
  prob(turn(atk, tgt, start(atk, tgt, o), move, "Splash"), f);

console.log("-- PART 1: every status secondary rolls --");
{
  const cases = [
    ["Snorlax", "Body Slam", "paralysis", 0.3],
    ["Houndoom", "Flamethrower", "burn", 0.1],
    ["Muk", "Sludge Bomb", "poison", 0.3],
    ["Arbok", "Poison Fang", "poison", 0.3],
    ["Electabuzz", "ThunderPunch", "paralysis", 0.1],
    // Lapras outspeeds Blissey, and a frozen Blissey then rolls its own 20%
    // thaw at CANCELER_FROZEN on its turn -- so 10% x 80% is still frozen.
    ["Lapras", "Ice Beam", "freeze", 0.1 * 0.8],
    ["Linoone", "Secret Power", "paralysis", 0.3], // the Arena is BUILDING -> paralysis
    ["Magneton", "Zap Cannon", "paralysis", 0.5],  // 100% chance x 50% accuracy
    ["Raikou", "Thunder", "paralysis", 0.7 * 0.3],
  ];
  for (const [sp, mv, st, want] of cases) {
    const atk = mk(sp, [mv, "Splash", "Rest", "Protect"]);
    const got = pOpp(atk, mv, wall, {}, (b) => b.state.oppStatus === st);
    ok(near(got, want), `${mv}: P(${st}) = ${want} (got ${got.toFixed(4)})`);
  }
  const arbok = mk("Arbok", ["Poison Fang", "Splash", "Rest", "Protect"]);
  const pf = turn(arbok, wall, start(arbok, wall), "Poison Fang", "Splash").filter((b) => b.state.oppStatus === "poison");
  // The counter is set to 0 on infliction and has ticked once by turn end.
  ok(pf.length > 0 && pf.every((b) => b.state.oppToxicCounter === 1), "Poison Fang's poison is BAD poison (MOVE_EFFECT_TOXIC)");
  const por = mk("Porygon2", ["Tri Attack", "Splash", "Rest", "Protect"]);
  for (const st of ["burn", "freeze", "paralysis"]) {
    const got = pOpp(por, "Tri Attack", wall, {}, (b) => b.state.oppStatus === st);
    const want = (0.2 / 3) * (st === "freeze" ? 0.8 : 1); // Porygon2 is faster: the same 20% thaw
    ok(near(got, want), `Tri Attack: P(${st}) = 20%/3 (got ${got.toFixed(4)})`);
  }
  const claw = mk("Skarmory", ["Metal Claw", "Splash", "Rest", "Protect"]);
  const mc = turn(claw, wall, start(claw, wall), "Metal Claw", "Splash");
  ok(near(prob(mc, (b) => b.state.youStages.atk === 1), 0.1 * 0.95), "Metal Claw (95% accurate) raises the USER's Attack 10% of the time");
  const plain = mk("Snorlax", ["Double-Edge", "Splash", "Rest", "Protect"]);
  ok(pOpp(plain, "Double-Edge") === 0, "(control) a move with no secondary never statuses");
}

console.log();
console.log("-- PART 2: the gates --");
{
  const slam = mk("Snorlax", ["Body Slam", "Splash", "Rest", "Protect"]);
  ok(pOpp(slam, "Body Slam", wall, { oppSubstituteHP: 300 }) === 0, "a Substitute blocks it");
  ok(pOpp(slam, "Body Slam", wall, { oppSubstituteHP: 1 }) === 0,
    "...even one this very hit breaks (STATUS2_SUBSTITUTE clears only at MOVEEND_SUBSTITUTE)");
  const dusty = mk("Dustox", ["Splash", "Protect", "Rest", "Growl"], { ability: "Shield Dust" });
  ok(pOpp(slam, "Body Slam", dusty) === 0, "Shield Dust blocks it");
  const brs = turn(slam, wall, start(slam, wall, { oppStatus: "burn" }), "Body Slam", "Splash");
  ok(brs.length === 1 && brs[0].state.oppStatus === "burn", "an existing status: blocked AND not branched");
  ok(pOpp(slam, "Body Slam", wall, { oppSafeguardTurns: 3 }) === 0, "Safeguard blocks it");
  const ko = turn(slam, wall, start(slam, wall, { oppHpPct: 1 }), "Body Slam", "Splash");
  ok(ko.every((b) => b.state.oppHpPct > 0 || b.state.oppStatus == null), "a fainted target takes no status");
  // Immunities: [attacker, move, target species, target ability]
  const imm = [
    ["Houndoom", "Flamethrower", "Arcanine", "Intimidate", "Fire type"],
    ["Houndoom", "Flamethrower", "Vaporeon", "Water Veil", "Water Veil"],
    ["Muk", "Sludge Bomb", "Weezing", "Levitate", "Poison type"],
    ["Muk", "Sludge Bomb", "Snorlax", "Immunity", "Immunity"],
    ["Arbok", "Poison Fang", "Skarmory", "Keen Eye", "Steel type"],
    ["Lapras", "Ice Beam", "Dewgong", "Thick Fat", "Ice type"],
    ["Lapras", "Ice Beam", "Magcargo", "Magma Armor", "Magma Armor"],
    ["Snorlax", "Body Slam", "Persian", "Limber", "Limber"],
  ];
  for (const [a, mv, t, ab, why] of imm) {
    const atk = mk(a, [mv, "Splash", "Rest", "Protect"]);
    const tgt = mk(t, ["Splash", "Protect", "Rest", "Growl"], { ability: ab, evs: { hp: 252, def: 252, spd: 252 } });
    ok(pOpp(atk, mv, tgt) === 0, `${mv} into ${t}: blocked by ${why}`);
  }
  const lap = mk("Lapras", ["Ice Beam", "Splash", "Rest", "Protect"]);
  ok(pOpp(lap, "Ice Beam", wall, { weatherType: "sun", weatherTurns: 4 }) === 0, "no freeze in sunshine");
  // A frozen target hit by a FIRE move: the burn roll sees it still frozen (the
  // defrost is MOVEEND_DEFROST, after seteffectwithchance), so it thaws unburned.
  const buzz = mk("Electabuzz", ["Fire Punch", "Splash", "Rest", "Protect"], { evs: { spe: 252 } });
  const fp = turn(buzz, wall, start(buzz, wall, { oppStatus: "freeze" }), "Fire Punch", "Splash");
  ok(fp.every((b) => b.state.oppStatus == null), "Fire Punch into a frozen target: thawed, never burned");
  const gengar = mk("Gengar", ["Splash", "Protect", "Rest", "Growl"], { ability: "Levitate" });
  ok(pOpp(slam, "Body Slam", gengar) === 0, "a Ghost takes no effect from Body Slam, so no roll");
}

console.log();
console.log("-- PART 3: Serene Grace, certainty and Skill --");
{
  const sg = mk("Snorlax", ["Body Slam", "Splash", "Rest", "Protect"], { ability: "Serene Grace" });
  ok(near(pOpp(sg, "Body Slam"), 0.6), `Serene Grace doubles 30% to 60% (got ${pOpp(sg, "Body Slam").toFixed(4)})`);
  const mag = mk("Magneton", ["Zap Cannon", "Splash", "Rest", "Protect"]);
  const limber = mk("Persian", ["Splash", "Protect", "Rest", "Growl"], { ability: "Limber" });
  const plainP = mk("Persian", ["Splash", "Protect", "Rest", "Growl"], { ability: "Pickup" });
  const hitSkill = (tgt) => turn(mag, tgt, start(mag, tgt), "Zap Cannon", "Splash").find((b) => /Zap Cannon \(hits\)/.test(b.label)).state.skillYou;
  ok(hitSkill(limber) === hitSkill(plainP) - 3,
    `a CERTAIN paralysis into Limber prints PREVENTSPARALYSISWITH: -3 Skill (${hitSkill(limber)} vs ${hitSkill(plainP)})`);
  const slam = mk("Snorlax", ["Body Slam", "Splash", "Rest", "Protect"]);
  const slamSkill = (tgt) => turn(slam, tgt, start(slam, tgt), "Body Slam", "Splash")[0].state.skillYou;
  ok(slamSkill(limber) === slamSkill(plainP), "a CHANCE paralysis into Limber is silent: no deduction");
  const sync = mk("Alakazam", ["Splash", "Protect", "Rest", "Growl"], { ability: "Synchronize" });
  const sy = turn(slam, sync, start(slam, sync), "Body Slam", "Splash").filter((b) => b.state.oppStatus === "paralysis");
  ok(sy.length > 0 && sy.every((b) => b.state.youStatus === "paralysis"), "a secondary paralysis into Synchronize comes back");
}

console.log();
console.log(failures === 0 ? "ALL PASS -- B4a status secondaries characterization green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

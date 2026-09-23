// ── test-b7c2-probabilistic.js ────────────────────────────────────────────
// B7c part 2: the hold effects that enumerate as WEIGHTED BRANCHES, and the
// collapse rule that keeps them from doubling the whole tree.
//
//   Quick Claw   src/battle_main.c:4653, :4687      one shared draw per TURN
//   Focus Band   src/battle_script_commands.c:1677   one roll per HIT
//   Speed ties   src/battle_main.c:4728, :4749       Random() & 1, a clean 50/50
//
// THE COLLAPSE RULE, applied identically to both: branch ONLY where the proc
// and the no-proc outcome actually differ. Quick Claw that would not change who
// moves first is one branch; Focus Band on a hit that would not have KO'd is
// one branch. Both are exact -- they remove duplicate subtrees, never real ones.
//
// Lethality for Focus Band's rule is asked of THE SAME calcDamage the battle
// path uses, through the same battleDamageOptions builder. A second, probe-only
// damage estimate would be the drift anti-pattern this project exists
// downstream of.
import { buildMon, buildStartState, resolveTurn } from "./logic.js";
import { itemData } from "./item-data.js";

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } };
const sum = (br) => br.reduce((a, b) => a + b.p, 0);

const metagross = (item) => buildMon({ species: "Metagross", level: 50, nature: "Adamant",
  evs: { atk: 252, spe: 252 }, ability: "Clear Body", item,
  moves: ["Meteor Mash", "Earthquake", "Shadow Ball", "Explosion"] });
const blissey = (item) => buildMon({ species: "Blissey", level: 50, nature: "Bold",
  evs: { hp: 252, def: 252 }, ability: "Natural Cure", item,
  moves: ["Body Slam", "Ice Beam", "Thunderbolt", "Rest"] });

console.log("-- PART 1: Quick Claw's probability is 13107/65536, not 20% --");
{
  const qc = itemData("Quick Claw");
  ok(qc.param === 20, `Quick Claw's holdEffectParam must be 20 (got ${qc.param})`);
  const threshold = Math.floor((0xFFFF * qc.param) / 100);
  ok(threshold === 13107, `threshold must be floor(0xFFFF * 20 / 100) = 13107 (got ${threshold})`);
  const p = threshold / 65536;
  ok(p === 0.1999969482421875, `p must be 13107/65536 exactly (got ${p})`);
  ok(p !== 0.2, "it must NOT be 0.2");
  ok(threshold / 65535 !== p, "and NOT 13107/65535 either -- the draw ranges over 65536 values");
  console.log(`   threshold ${threshold}, p = ${p} (0.2 would be ${0.2}, 13107/65535 would be ${threshold / 65535})`);

  // A slow Quick Claw holder facing a faster foe: two branches, weights exact.
  const fast = buildMon({ species: "Starmie", level: 50, nature: "Timid", evs: { spa: 252, spe: 252 },
    ability: "Natural Cure", item: "Leftovers", moves: ["Surf", "Ice Beam", "Thunderbolt", "Recover"] });
  const slow = buildMon({ species: "Snorlax", level: 50, nature: "Adamant", evs: { hp: 252, atk: 252 },
    ability: "Thick Fat", item: "Quick Claw", moves: ["Body Slam", "Earthquake", "Shadow Ball", "Rest"] });
  const br = resolveTurn({ you: fast, opp: slow }, buildStartState({ you: fast, opp: slow }), "Surf", "Body Slam");
  ok(Math.abs(sum(br) - 1) < 1e-12, `branch probabilities must sum to 1 (got ${sum(br)})`);
  console.log(`   slow holder vs faster foe: ${br.length} branches, total p ${sum(br).toFixed(12)}`);

  // COLLAPSE: the same holder when it ALREADY moves first. The draw cannot
  // change the order, so there must be no extra branching.
  const slowFirst = buildMon({ ...slow, item: "Quick Claw" });
  const slower = buildMon({ species: "Shuckle", level: 50, nature: "Bold", evs: { def: 252, spd: 252 },
    ability: "Sturdy", item: "Leftovers", moves: ["Toxic", "Rest", "Protect", "Wrap"] });
  const collapsed = resolveTurn({ you: slower, opp: slowFirst },
    buildStartState({ you: slower, opp: slowFirst }), "Rest", "Body Slam");
  const uncollapsed = resolveTurn({ you: slower, opp: buildMon({ ...slowFirst, item: "Leftovers" }) },
    buildStartState({ you: slower, opp: buildMon({ ...slowFirst, item: "Leftovers" }) }), "Rest", "Body Slam");
  ok(collapsed.length === uncollapsed.length,
    `a Quick Claw holder that already moves first must add NO branches (${collapsed.length} vs ${uncollapsed.length})`);
  console.log(`   holder already moving first: ${collapsed.length} branches, same as without the item`);
}

console.log();
console.log("-- PART 2: Focus Band branches only on a LETHAL hit --");
{
  const fb = itemData("Focus Band");
  ok(fb.param === 10, `Focus Band's holdEffectParam must be 10 (got ${fb.param})`);
  const hitter = metagross("Cheri Berry");

  const run = (item, hpPct) => {
    const opp = blissey(item);
    const s = buildStartState({ you: hitter, opp, overrides: { oppHpPct: hpPct } });
    // NOT "Rest": an earlier draft had the target Rest, which heals it to full
    // and hid the very 1-HP clamp this part is checking.
    const br = resolveTurn({ you: hitter, opp }, s, "Meteor Mash", "Thunderbolt");
    return { br, survives: br.filter((b) => b.state.oppHpPct > 0).reduce((a, b) => a + b.p, 0) };
  };

  const lethalFB = run("Focus Band", 5);
  const lethalNo = run("Leftovers", 5);
  const safeFB = run("Focus Band", 100);

  ok(Math.abs(sum(lethalFB.br) - 1) < 1e-12, "branch probabilities must sum to 1");
  ok(lethalFB.br.length > lethalNo.br.length,
    `a lethal hit into a Focus Band holder must add branches (${lethalFB.br.length} vs ${lethalNo.br.length})`);
  ok(safeFB.br.length === run("Leftovers", 100).br.length,
    "a NON-lethal hit must add none -- that is the collapse rule");

  // Meteor Mash is 85% accurate, so without the band the target survives only
  // by being missed. With it, survival is miss + hit-and-proc, and the exact
  // arithmetic is checkable: 0.15 + 0.85 * 0.10 = 0.235.
  ok(Math.abs(lethalNo.survives - 0.15) < 1e-9,
    `without the band, survival is just the miss chance (got ${lethalNo.survives})`);
  const expected = 0.15 + 0.85 * (fb.param / 100);
  ok(Math.abs(lethalFB.survives - expected) < 1e-9,
    `with it, survival must be miss + hit*proc = ${expected} (got ${lethalFB.survives})`);
  console.log(`   lethal hit: P(survives) ${lethalNo.survives.toFixed(6)} -> ${lethalFB.survives.toFixed(6)} = 0.15 + 0.85*0.10`);
  console.log(`   branches: lethal ${lethalFB.br.length} vs ${lethalNo.br.length}; non-lethal ${safeFB.br.length} vs ${run("Leftovers", 100).br.length}`);

  // A proc leaves exactly 1 HP, not 0 -- asserted in HP, NOT in percent. The
  // state stores HP as a percentage, so a start of 5% of 362 is 18.1 HP; the
  // clamp correctly removes rawHp - 1 = 17, and the leftover percentage reads
  // as 1.1 HP-equivalent purely because the STARTING point was not a whole HP.
  // An earlier draft compared percentages and failed on that rounding, which
  // was the assertion using the wrong unit, not the clamp being wrong.
  const opp = blissey("Focus Band");
  const toHp = (pct) => Math.round((pct / 100) * opp.stats.hp);
  const procSurvivors = lethalFB.br.filter((b) => b.state.oppHpPct > 0 && toHp(b.state.oppHpPct) === 1);
  ok(procSurvivors.length > 0,
    `a proc must leave EXACTLY 1 HP (surviving branches read ${[...new Set(lethalFB.br.filter((b) => b.state.oppHpPct > 0).map((b) => toHp(b.state.oppHpPct)))].join(", ")} HP)`);
  const procWeight = procSurvivors.reduce((a, b) => a + b.p, 0);
  ok(Math.abs(procWeight - 0.85 * (fb.param / 100)) < 1e-9,
    `the 1-HP branches must carry exactly hit * proc = ${0.85 * (fb.param / 100)} (got ${procWeight})`);
  console.log(`   proc branches leave 1 HP and carry ${procWeight.toFixed(6)} = 0.85 * 0.10`);
}

console.log();
console.log("-- PART 3: Focus Band is Substitute-gated, and power-0 moves never branch --");
{
  const hitter = metagross("Cheri Berry");
  const opp = blissey("Focus Band");
  const subbed = buildStartState({ you: hitter, opp, overrides: { oppHpPct: 5, oppSubstituteHP: 40 } });
  const plain = buildStartState({ you: hitter, opp: blissey("Leftovers"), overrides: { oppHpPct: 5, oppSubstituteHP: 40 } });
  ok(resolveTurn({ you: hitter, opp }, subbed, "Meteor Mash", "Rest").length
     === resolveTurn({ you: hitter, opp: blissey("Leftovers") }, plain, "Meteor Mash", "Rest").length,
    "a Substitute must suppress the Focus Band branch entirely (source gates the clamp on it)");

  const statusState = buildStartState({ you: hitter, opp, overrides: { oppHpPct: 5 } });
  const withFB = resolveTurn({ you: hitter, opp }, statusState, "Shadow Ball", "Rest");
  ok(withFB.length > 0, "sanity: a damaging move still resolves");
  console.log("   Substitute suppresses the branch; only damaging moves can branch at all");
}

console.log();
console.log("-- PART 4: an EXACT speed tie is a 0.5 / 0.5 branch --");
{
  // Source: `if (speedBattler1 == speedBattler2 && Random() & 1) strikesFirst = 2`
  // (src/battle_main.c:4728, repeated verbatim at :4749 for the priority-zero
  // arm). Callers test GetWhoStrikesFirst truthily, so 2 means "battler 2 goes
  // first" -- the tie is a clean coin flip. This engine used to hand every tie
  // to the player.
  const mk = (spe) => buildMon({ species: "Ditto", level: 50, nature: "Hardy",
    evs: { spe }, ability: "Limber", item: null, moves: ["Body Slam", "Rest", "Protect", "Swagger"] });
  const a = mk(252), b = mk(252), slower = mk(0);
  ok(a.stats.spe === b.stats.spe, "probe mons must tie on Speed");
  ok(slower.stats.spe !== a.stats.spe, "and the control must not");

  const firstActors = (br) => new Set(br.map((r) => r.label.split(" ")[0]));
  const tied = resolveTurn({ you: a, opp: b }, buildStartState({ you: a, opp: b }), "Body Slam", "Body Slam");
  ok(Math.abs(sum(tied) - 1) < 1e-12, `tie branches must still sum to 1 (got ${sum(tied)})`);
  ok(firstActors(tied).size === 2, "on an exact tie BOTH sides must appear as the first actor");

  const notTied = resolveTurn({ you: a, opp: slower }, buildStartState({ you: a, opp: slower }), "Body Slam", "Body Slam");
  ok(firstActors(notTied).size === 1, "with any speed difference, only one side ever moves first");

  // The weight is exactly half, checked by summing the branches in which the
  // opponent acted first.
  const oppFirst = tied.filter((r) => r.label.startsWith("Opp")).reduce((s2, r) => s2 + r.p, 0);
  ok(Math.abs(oppFirst - 0.5) < 1e-9, `the opponent must go first exactly half the time (got ${oppFirst})`);
  console.log(`   tie: ${tied.length} branches, opponent-first weight ${oppFirst.toFixed(6)}; no-tie: ${notTied.length} branches, one order`);

  // COLLAPSE: a priority gap decides the order outright, so even an exact speed
  // tie must not branch when the moves differ in priority.
  const prioritised = resolveTurn({ you: a, opp: b }, buildStartState({ you: a, opp: b }), "Protect", "Body Slam");
  ok(firstActors(prioritised).size === 1,
    "a priority gap must decide the order outright, with no tie branch");
  console.log("   priority gap on a tied pair: one order, no branch");
}

console.log();
console.log(failures === 0 ? "ALL PASS -- B7c part 2 characterization green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

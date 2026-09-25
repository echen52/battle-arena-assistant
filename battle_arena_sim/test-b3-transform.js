// ── test-b3-transform.js ──────────────────────────────────────────────────
// B3 batch 7d: Transform (Cmd_transformdataexecution, src/battle_script_
// commands.c:7764-7806) -- every BattlePokemon byte before `pp` is copied
// (include/pokemon.h:260-281).
//
//   PART 1  copied: species, types, ability, the five non-HP stats, moves and
//           the CURRENT stat stages. NOT copied: HP, level, item
//   PART 2  the transformed mon fights with the copy: its moves, its damage
//   PART 3  it fails (-2) into a transformed or semi-invulnerable target
//   PART 4  gChosenMove = MOVE_UNAVAILABLE: the user's last move is nothing,
//           its Disable is cleared, and a transformed mon cannot Mimic
import { buildMon, buildStartState, resolveTurn, calcDamage, skillDelta, search } from "./logic.js";

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } };

const mk = (species, moves, over = {}) => buildMon({
  species, level: 50, nature: "Adamant", evs: { hp: 252, atk: 252 },
  ability: "Pressure", item: null, moves, friendship: 255, ...over,
});
const start = (you, opp, o = {}) => buildStartState({ you, opp, overrides: o });
const turn = (you, opp, st, ym, om) => resolveTurn({ you, opp }, st, ym, om);

const ditto = mk("Ditto", ["Transform"], { ability: "Limber", nature: "Hardy", evs: { hp: 252 }, item: "Leftovers" });
const meta = mk("Metagross", ["Meteor Mash", "Earthquake", "Shadow Ball", "Agility"], { ability: "Clear Body", item: "Choice Band" });
const stages = (o) => ({ atk: 0, def: 0, spa: 0, spd: 0, spe: 0, evasion: 0, accuracy: 0, ...o });

console.log("-- PART 1: what is copied --");
let tf;
{
  const b = turn(meta, ditto, start(meta, ditto, { youStages: stages({ atk: 2, def: -1 }) }), "Agility", "Transform")[0];
  tf = b.state;
  const t = tf.oppTransform;
  ok(t && t.species === "Metagross" && t.ability === "Clear Body", "species and ability are Metagross's");
  ok(JSON.stringify(t.types) === JSON.stringify(meta.types), "types are Metagross's");
  ok(JSON.stringify(t.moves) === JSON.stringify(meta.moves), "moves are Metagross's");
  ok(t.stats.atk === meta.stats.atk && t.stats.spe === meta.stats.spe && t.stats.hp === undefined, "the five non-HP stats are Metagross's; HP is not");
  ok(tf.oppStages.atk === 2 && tf.oppStages.def === -1 && tf.oppStages.spe === 2,
    `the CURRENT stages are copied -- including Agility's +2 from earlier this turn (${JSON.stringify(tf.oppStages)})`);
  ok(b.state.skillOpp === skillDelta("landed"), "a successful Transform scores +1");
}

console.log();
console.log("-- PART 2: it fights as the copy --");
{
  // Its Meteor Mash does what Metagross's would -- with Ditto's own level and
  // NO Choice Band (the item is not copied), from its copied +2 Attack.
  const brs = turn(meta, ditto, tf, "Agility", "Meteor Mash");
  const hit = brs.find((b) => /Opp uses Meteor Mash \(hits\)/.test(b.label));
  ok(hit, "(probe check) the transformed Ditto can use Meteor Mash");
  const asMeta = { ...meta, item: "Leftovers" };
  // The TARGET Metagross is still at -1 Def from PART 1's setup.
  const want = calcDamage(asMeta, meta, "Meteor Mash", { atkStage: 2, defStage: -1 });
  const got = Math.round(((100 - hit.state.yourHpPct) / 100) * meta.stats.hp);
  ok(Math.abs(got - want) <= 1, `its Meteor Mash deals a Metagross's damage at +2 without Choice Band (${got} vs ${want})`);
  // The moves it CHOOSES from are the copy's: the AI (Ditto is the opponent)
  // picks among Metagross's moves, never Transform.
  const tree = search({ you: meta, opp: ditto }, tf, 1);
  const used = new Set(tree.allOptions.flatMap((o) => o.branches.map((x) => (x.label.match(/Opp uses ([A-Za-z -]+?)(?: \(|;|$)/) || [])[1]).filter(Boolean)));
  ok(used.size > 0 && [...used].every((m) => meta.moves.includes(m)), `the AI chooses among the COPIED moves (${[...used].join(", ")})`);
  // HP is NOT copied: its Leftovers heal 1/16 of DITTO's max HP.
  // B6 step 1: start at a WHOLE HP (half, rounded) -- the game never holds a half HP.
  const halfHp = Math.round(ditto.stats.hp / 2);
  const half = { ...tf, oppHpPct: (halfHp * 100) / ditto.stats.hp };
  const lf = turn(meta, ditto, half, "Agility", "Agility")[0];
  const healed = Math.round((lf.state.oppHpPct / 100) * ditto.stats.hp) - halfHp;
  ok(healed === Math.floor(ditto.stats.hp / 16), `Leftovers heals 1/16 of Ditto's OWN max HP (${healed} vs ${Math.floor(ditto.stats.hp / 16)})`);
  // Unambiguous: Seismic Toss deals exactly the level (50), which must come off
  // DITTO's max HP, not a copied one.
  const st = turn(meta, ditto, tf, "Seismic Toss", "Agility").find((x) => x.state.oppHpPct < 100);
  const lostPct = 100 - st.state.oppHpPct;
  // (net of Ditto's own Leftovers at turn end -- also sized off ITS max HP)
  const net = 50 - Math.floor(ditto.stats.hp / 16);
  ok(Math.abs(lostPct - (net / ditto.stats.hp) * 100) < 1e-9, `a 50-damage hit, less Leftovers, takes ${net}/${ditto.stats.hp} of Ditto (got ${lostPct.toFixed(3)}%)`);
}

console.log();
console.log("-- PART 3: when it fails --");
{
  const other = start(meta, ditto, { youTransform: { species: "Snorlax", types: ["Normal"], ability: "Thick Fat", stats: meta.stats, moves: ["Body Slam"], genderDist: meta.genderDist } });
  const a = turn(meta, ditto, other, "Agility", "Transform");
  ok(a.every((b) => b.state.oppTransform === null && b.state.skillOpp === skillDelta("noEffect")), "into a transformed target: fails, -2");
  const flyer = mk("Pidgeot", ["Fly", "Growl", "Rest", "Agility"], { ability: "Keen Eye" });
  // The faster Pidgeot STARTS Fly this turn, so it is in the air when the
  // slower Ditto's Transform resolves.
  const f = turn(flyer, ditto, start(flyer, ditto), "Fly", "Transform");
  ok(f.every((b) => b.state.oppTransform === null && b.state.skillOpp === skillDelta("noEffect")), "into a target that is in the air: fails, -2");
}

console.log();
console.log("-- PART 4: what it clears and what it blocks --");
{
  ok(tf.oppLastMove === null, "the Transform user's last move is UNAVAILABLE (gChosenMove), so nothing can Disable/Encore/Mimic it");
  // Disable a move OTHER than Transform (a disabled Transform could not be
  // used at all), then transform: the Disable must be gone.
  const b = turn(meta, ditto, start(meta, ditto, { oppDisabledMove: "Splash", oppDisableTurns: 3 }), "Agility", "Transform")[0];
  ok(b.state.oppDisabledMove === null, "the user's own Disable is cleared");
  const jig = mk("Jigglypuff", ["Mimic", "Sing", "Rest", "Pound"], { ability: "Cute Charm" });
  const shuckle = mk("Shuckle", ["Growl", "Rest", "Protect", "Splash"], { ability: "Sturdy" });
  const pre = start(shuckle, jig, { youLastMove: "Growl", oppTransform: { species: "Jigglypuff", types: jig.types, ability: "Cute Charm", stats: jig.stats, moves: jig.moves, genderDist: jig.genderDist } });
  const m = turn(shuckle, jig, pre, "Splash", "Mimic");
  ok(m.every((x) => x.state.oppMoves == null && x.state.skillOpp === skillDelta("noEffect")), "a transformed mon cannot Mimic");
}

console.log();
console.log(failures === 0 ? "ALL PASS -- B3 batch 7d characterization green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

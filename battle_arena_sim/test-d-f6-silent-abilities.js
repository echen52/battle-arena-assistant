// ── test-d-f6-silent-abilities.js ─────────────────────────────────────────
// Phase D finding F6: three abilities the ability audit called "implemented"
// because the AI's handlers mention their names -- with no battle effect at all.
//
//   Speed Boost  ENDTURN_ABILITIES (src/battle_util.c:2642-2652): +1 Speed at
//                end of turn below +6 unless isFirstTurn == 2. A lead's
//                isFirstTurn is set to 2 at the start and decremented by
//                TryDoEventsBeforeFirstTurn's TurnValuesCleanUp(FALSE)
//                (src/battle_main.c:3051, :3901, :4875-4876) BEFORE turn 1, so
//                in the Arena it fires at the end of EVERY turn, turn 1 too.
//   Damp         Cmd_tryexplosion (src/battle_script_commands.c:6556-): ANY
//                battler with Damp -- the user included -- stops Explosion /
//                Self-Destruct before setatkhptozero: the user does NOT faint,
//                nothing is hit, BattleScript_DampStopsExplosion prints
//                STRINGID_PKMNPREVENTSUSAGE (a DeductSkillPoints string) and
//                sets no result flag: +1 - 3 = -2. It runs after attackcanceler,
//                whose Protect branch continues the script -- so into a Protect too.
//   Suction Cups INERT in battle, stated rather than modelled: Roar always fails
//                in the Arena (jumpifbattletype BATTLE_TYPE_ARENA -> ButItFailed,
//                data/battle_scripts_1.s:602), -2; Suction Cups' own block prints
//                STRINGID_PKMNANCHORSITSELFWITH with no flag, +1 - 3 = -2. Its
//                one observable, the AI's record, is F2a's.
//
// Found by the emulator differential ("Speed Boost activates at the end of the
// first turn in the ROM, not the sim") and the audit of name-only references.
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { buildMon, buildStartState, resolveTurn, arenaSkillDelta, skillDelta } from "./logic.js";

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } else console.log("  ok   " + m); };
const mk = (species, moves, over = {}) => buildMon({
  species, level: 50, nature: "Hardy", evs: {}, ability: "Pressure", item: null, moves, friendship: 255, ...over,
});
const J = JSON.stringify;
const turn = (you, opp, st, ym, om) => resolveTurn({ you, opp }, st, ym, om);

console.log("-- Speed Boost --");
{
  const nin = mk("Ninjask", ["Harden"], { ability: "Speed Boost" });
  const sn = mk("Snorlax", ["Harden"], { ability: "Thick Fat" });
  let st = buildStartState({ you: sn, opp: nin });
  const seen = [];
  for (let t = 1; t <= 3; t++) { st = turn(sn, nin, st, "Harden", "Harden")[0].state; seen.push(st.oppStages.spe); }
  ok(J(seen) === J([1, 2, 3]), `the opponent's Ninjask: +1 at the end of turns 1, 2, 3 (got ${J(seen)})`);
  // The player's too.
  const t1 = turn(nin, sn, buildStartState({ you: nin, opp: sn }), "Harden", "Harden");
  ok(t1.every((b) => b.state.youStages.spe === 1), `the player's Ninjask: +1 after turn 1`);
  // Capped at +6; no boost for a fainted holder.
  const capped = turn(sn, nin, buildStartState({ you: sn, opp: nin, overrides: { oppStages: { spe: 6 } } }), "Harden", "Harden");
  ok(capped.every((b) => b.state.oppStages.spe === 6), `at +6 it stays +6`);
  const s1 = mk("Snorlax", ["Explosion"], { ability: "Thick Fat" });
  const dead = turn(s1, nin, buildStartState({ you: s1, opp: nin }), "Explosion", "Harden").filter((b) => b.state.oppHpPct <= 0);
  ok(dead.length > 0 && dead.every((b) => b.state.oppStages.spe === 0), `a fainted Ninjask does not boost (${dead.length} KO branches)`);
}

console.log("-- Damp --");
{
  const noFaint = arenaSkillDelta("landed", ["STRINGID_PKMNPREVENTSUSAGE"]);
  ok(noFaint === -2, `Damp's block scores +1 - 3 = -2 (got ${noFaint})`);
  // The target's Damp: the user survives, nothing is hit.
  const quag = mk("Quagsire", ["Harden"], { ability: "Damp" });
  const gol = mk("Golem", ["Explosion"], { ability: "Sturdy" });
  const b = turn(quag, gol, buildStartState({ you: quag, opp: gol }), "Harden", "Explosion");
  ok(b.every((x) => x.state.oppHpPct === 100 && x.state.yourHpPct === 100), `Explosion into Damp: the user survives, the target is untouched`);
  ok(b.every((x) => x.state.skillOpp === -2), `...and scores -2 (got ${J([...new Set(b.map((x) => x.state.skillOpp))])})`);
  // The USER's own Damp stops it too (tryexplosion scans every battler).
  const selfDamp = mk("Golduck", ["Explosion"], { ability: "Damp" });
  const sn = mk("Snorlax", ["Harden"], { ability: "Thick Fat" });
  const c = turn(sn, selfDamp, buildStartState({ you: sn, opp: selfDamp }), "Harden", "Explosion");
  ok(c.every((x) => x.state.oppHpPct === 100 && x.state.yourHpPct === 100), `the user's own Damp stops its Explosion`);
  // Into a Protect: tryexplosion still runs (attackcanceler's Protect branch continues).
  const p = turn(mk("Quagsire", ["Protect"], { ability: "Damp" }), gol, buildStartState({ you: mk("Quagsire", ["Protect"], { ability: "Damp" }), opp: gol }), "Protect", "Explosion");
  ok(p.every((x) => x.state.oppHpPct === 100), `into a Protect as well: the user survives`);
  // Without Damp it still faints (control).
  const d = turn(sn, gol, buildStartState({ you: sn, opp: gol }), "Harden", "Explosion");
  ok(d.every((x) => x.state.oppHpPct === 0), `control: no Damp, Explosion faints its user`);
}

console.log("-- Suction Cups: inert, and why --");
{
  ok(arenaSkillDelta("landed", ["STRINGID_PKMNANCHORSITSELFWITH"]) === skillDelta("noEffect"),
    `Suction Cups' block (+1 - 3) scores what Roar's Arena failure does (${skillDelta("noEffect")})`);
  const oct = mk("Octillery", ["Harden"], { ability: "Suction Cups" });
  const ar = mk("Arcanine", ["Roar"], { ability: "Intimidate" });
  const a = turn(oct, ar, buildStartState({ you: oct, opp: ar }), "Harden", "Roar");
  const oct2 = mk("Octillery", ["Harden"], { ability: "Pressure" });
  const b = turn(oct2, ar, buildStartState({ you: oct2, opp: ar }), "Harden", "Roar");
  ok(J(a.map((x) => x.state.skillOpp)) === J(b.map((x) => x.state.skillOpp)), `Roar into Suction Cups or not: the same Skill`);
}

console.log("-- the audit that let them through --");
{
  // ability-audit.mjs now scans battle code only and exits 1 on any MISSING
  // ability; run against the pre-F6 engine it reports Damp and Speed Boost.
  let code = 0, out = "";
  try { out = execFileSync("node", [fileURLToPath(new URL("../../arena-solver/tools/ability-audit.mjs", import.meta.url))], { encoding: "utf8" }); }
  catch (e) { code = e.status; out = e.stdout ?? ""; }
  ok(code === 0 && !/MISSING/.test(out), `ability-audit: no MISSING ability, exit 0 (exit ${code})`);
}

console.log();
console.log(failures === 0 ? "ALL PASS -- F6 silent abilities green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

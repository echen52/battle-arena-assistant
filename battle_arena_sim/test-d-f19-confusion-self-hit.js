// ── test-d-f19-confusion-self-hit.js ──────────────────────────────────────
// Phase D finding F19: the confusion self-hit is the whole base-damage chain.
//
// CANCELER_CONFUSED (src/battle_util.c:2156-2187) computes
// CalculateBaseDamage(attacker, attacker, MOVE_POUND, 0, 40, 0, ...) (:2173):
// the mon's own Attack stage against its own Defense stage, burn, Choice Band,
// its abilities, Pound's Normal-type item boost; sideStatus 0 (no Reflect); no
// typecalc (no STAB, no type chart) and no critcalc. BattleScript_DoSelfConfusionDmg
// then runs adjustnormaldamage2 (src/battle_script_commands.c:1701-1741): the
// damage roll and the mon's OWN Focus Band, unless it is behind a Substitute.
// The engine used bare stats x the roll (calcConfusionDamage, kept as the
// record) and no Focus Band.
// Found by the emulator: 9 traces where a confused mon hit itself for more
// (Swagger's +2, Choice Band) or less than the sim allowed.
import { execFileSync } from "node:child_process";
import { buildMon, buildStartState, resolveTurn, calcConfusionDamage } from "./logic.js";

const TOOLS = "C:/Users/azncu/Desktop/pokemon_code/arena-solver/tools/";
const EMU = "C:/Users/azncu/Desktop/pokemon_code/arena-solver/emu/";
let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } else console.log("  ok   " + m); };
const mk = (species, over = {}) => buildMon({
  species, level: 50, nature: "Hardy", evs: {}, ability: "Thick Fat", item: null, moves: ["Harden"], friendship: 255, ...over,
});
// the confused player's self-hit loss, over the branches where it hit itself
const selfHitLosses = (you, ov = {}) => {
  const opp = mk("Chansey", { ability: "Natural Cure", moves: ["Harden"] });
  const st = buildStartState({ you, opp, overrides: { youConfused: true, youConfusionTurns: 3, ...ov } });
  const hp0 = Math.round((st.yourHpPct / 100) * you.stats.hp);
  return [...new Set(resolveTurn({ you, opp }, st, "Harden", "Harden")
    .filter((b) => /itself/.test(b.label)).map((b) => hp0 - Math.round((b.state.yourHpPct / 100) * you.stats.hp)))];
};

console.log("-- the emulator's traces --");
{
  const traces = ["traces/battle-00285.json", "traces/battle-00435.json", "traces-given/battle-00570.json", "traces-given/battle-00629.json"];
  let out = "", code = 0;
  try { out = execFileSync("node", [TOOLS + "diff-emu.mjs", ...traces.map((t) => EMU + t)], { cwd: TOOLS, encoding: "utf8", env: { ...process.env, DIFF_EXACT: "0" } } /* validated in the point-estimate mode, before F31 */); }
  catch (e) { out = String(e.stdout); code = e.status; }
  ok(code === 0, `Choice Band Metagross x2, Swagger'd Arcanine x2: no divergence (${(out.match(/divergences \d+/g) || []).join(", ")})`);
}

console.log("-- the chain --");
{
  const sn = mk("Snorlax");
  const [base] = selfHitLosses(sn);
  console.log(`   Snorlax self-hit ${base} (the old bare-stats formula: ${calcConfusionDamage(sn)} -- equal with no modifier)`);
  const [up2] = selfHitLosses(sn, { youStages: { atk: 2 } });
  ok(up2 > 1.9 * base && up2 < 2.1 * base, `+2 Attack doubles it: ${base} -> ${up2}`);
  const [def2] = selfHitLosses(sn, { youStages: { def: 2 } });
  ok(def2 < 0.6 * base, `+2 Defense halves it (the defender is itself): ${def2}`);
  const [band] = selfHitLosses(mk("Snorlax", { item: "Choice Band" }));
  ok(band > 1.4 * base && band < 1.6 * base, `Choice Band x1.5: ${band}`);
  // the measured loss includes the end-of-turn burn residual, maxHP/8
  const burnt = selfHitLosses(sn, { youStatus: "burn" })[0] - Math.floor(sn.stats.hp / 8);
  ok(burnt < 0.6 * base, `burn halves it: ${burnt}`);
  const [refl] = selfHitLosses(sn, { youReflectTurns: 5 });
  ok(refl === base, `its own Reflect does not apply (sideStatus 0): ${refl}`);
  // no STAB: a Normal-type mon's self-hit equals a non-Normal twin's with equal stats
  const twin = { ...sn, types: ["Fighting"] };
  ok(selfHitLosses(twin)[0] === base, "no STAB and no type chart");
}

console.log("-- the mon's own Focus Band --");
{
  const sn = mk("Snorlax", { item: "Focus Band" });
  const opp = mk("Chansey", { ability: "Natural Cure", moves: ["Harden"] });
  const st = buildStartState({ you: sn, opp, overrides: { youConfused: true, youConfusionTurns: 3, yourHpPct: 5 } });
  const br = resolveTurn({ you: sn, opp }, st, "Harden", "Harden").filter((b) => /itself/.test(b.label));
  const pAlive = br.filter((b) => b.state.yourHpPct > 0).reduce((a, b) => a + b.p, 0);
  const pAll = br.reduce((a, b) => a + b.p, 0);
  ok(Math.abs(pAlive / pAll - 0.1) < 1e-12, `a lethal self-hit leaves 1 HP with p 10/100 (${pAlive / pAll})`);
  ok(br.filter((b) => b.state.yourHpPct > 0).every((b) => Math.round((b.state.yourHpPct / 100) * sn.stats.hp) === 1), "at exactly 1 HP");
  const subbed = buildStartState({ you: sn, opp, overrides: { youConfused: true, youConfusionTurns: 3, yourHpPct: 5, youSubstituteHP: 20 } });
  const br2 = resolveTurn({ you: sn, opp }, subbed, "Harden", "Harden").filter((b) => /itself/.test(b.label));
  ok(br2.every((b) => b.state.yourHpPct <= 0), "behind its own Substitute, no hang-on");
}

console.log();
console.log(failures === 0 ? "ALL PASS -- F19 confusion self-hit green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

// ── test-d-f39-focus-band-probe.js ────────────────────────────────────────
// Phase D finding F39: Focus Band's lethality probe asks about the hit that
// actually lands.
//
// focusBandBranches splits a hit into proc / no-proc only when the hit can KO
// (the proc is unobservable otherwise). Its probe built the damage without the
// branch's crit (B6-2 added crits after B7b's Focus Band) and without the
// script's dmgMultiplier (Smelling Salt into paralysis, Stomp into Minimize,
// Spit Up's stockpile), so a hit lethal only BECAUSE of those never got its
// 10% save (Cmd_adjustnormaldamage, src/battle_script_commands.c:1658-1690).
// Found by the emulator: traces-history/00406 (Starmie's critical Surf into a
// Focus Band Metang, left at 1 HP in the ROM; the engine only had it fainting).
import { execFileSync } from "node:child_process";
import { buildMon, buildStartState, resolveTurn } from "./logic.js";

const TOOLS = "C:/Users/azncu/Desktop/pokemon_code/arena-solver/tools/";
const EMU = "C:/Users/azncu/Desktop/pokemon_code/arena-solver/emu/";
let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } else console.log("  ok   " + m); };
const mk = (species, moves, over = {}) => buildMon({
  species, level: 50, nature: "Hardy", evs: {}, ability: "Pressure", item: null, moves, friendship: 255, ...over,
});
const psum = (bs) => bs.reduce((a, b) => a + b.p, 0);
const hpOf = (b, mon) => Math.round((b.state.oppHpPct / 100) * mon.stats.hp);

console.log("-- F39: a crit that alone is lethal gets its Focus Band save --");
{
  const star = mk("Starmie", ["Surf"], { ability: "Natural Cure", nature: "Modest", evs: { spa: 252 } });
  const met = mk("Metang", ["Harden"], { ability: "Clear Body", item: "Focus Band", evs: { hp: 252 } });
  // HP chosen so every non-crit Surf survives and every crit is lethal
  const pct = 60;
  const st = buildStartState({ you: star, opp: met, overrides: { oppHpPct: pct } });
  const br = resolveTurn({ you: star, opp: met }, st, "Surf", "Harden");
  const hp0 = Math.round((pct / 100) * met.stats.hp);
  const ko = br.filter((b) => hpOf(b, met) === 0), saved = br.filter((b) => hpOf(b, met) === 1);
  const pKO = psum(ko), pSaved = psum(saved);
  ok(pKO > 0, `a crit KOs (${hp0} HP, P ${pKO.toFixed(5)})`);
  ok(pSaved > 0 && Math.abs(pSaved / (pKO + pSaved) - 0.1) < 1e-9, `...and 10% of those hang on at 1 HP (P ${pSaved.toFixed(5)} of ${(pKO + pSaved).toFixed(5)})`);
}

console.log("-- F39: Smelling Salt's x2 into paralysis, too --");
{
  const hit = mk("Hariyama", ["SmellingSalt"], { ability: "Thick Fat", nature: "Adamant", evs: { atk: 252 } });
  const tgt = mk("Metang", ["Harden"], { ability: "Clear Body", item: "Focus Band", evs: { hp: 252 } });
  // lethal only doubled: find an HP between the single and the doubled damage
  const st0 = buildStartState({ you: hit, opp: tgt, overrides: { oppStatus: "paralysis" } });
  const one = resolveTurn({ you: hit, opp: tgt }, st0, "SmellingSalt", "Harden").filter((b) => !/crit/i.test(b.label));
  const dmg = tgt.stats.hp - Math.max(...one.map((b) => hpOf(b, tgt)));
  const pct = Math.floor(((dmg - 2) / tgt.stats.hp) * 100);
  const st = buildStartState({ you: hit, opp: tgt, overrides: { oppStatus: "paralysis", oppHpPct: pct } });
  const br = resolveTurn({ you: hit, opp: tgt }, st, "SmellingSalt", "Harden");
  const pKO = psum(br.filter((b) => hpOf(b, tgt) === 0)), pSaved = psum(br.filter((b) => hpOf(b, tgt) === 1));
  ok(pSaved > 0 && Math.abs(pSaved / (pKO + pSaved) - 0.1) < 1e-9, `the doubled hit is lethal and 10% hang on (P ${pSaved.toFixed(5)} of ${(pKO + pSaved).toFixed(5)}; min doubled dmg ${dmg}, HP ${Math.round(pct / 100 * tgt.stats.hp)})`);
}

console.log("-- the emulator's traces --");
{
  const traces = ["traces-history/battle-00406.json"];
  let out = "", code = 0;
  try { out = execFileSync("node", [TOOLS + "diff-emu.mjs", ...traces.map((t) => EMU + t)], { cwd: TOOLS, encoding: "utf8" }); }
  catch (e) { out = String(e.stdout); code = e.status; }
  ok(code === 0, `exact replay: ${(out.match(/divergences \d+/g) || []).join(", ")}`);
}

console.log();
console.log(failures === 0 ? "ALL PASS -- F39 Focus Band probe green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

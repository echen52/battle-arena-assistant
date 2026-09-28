// ── test-d-f31-exact-roll.js ──────────────────────────────────────────────────
// Phase D finding F31.
//
// F31  the damage roll, EXACT and OPT-IN (ctx.exactRoll). adjustnormaldamage(2)
//      multiply by 100 - Random() % 16 (src/battle_script_commands.c:1639-1741):
//      each landed hit branches over 85..100, 1/16 each; multi-hit moves draw per
//      hit (3-5 hits grouped exactly by first / total / last damage); Future
//      Sight's release and the confusion self-hit too. Off by default: the
//      search keeps its labelled 92.5% point estimate (amendment 15). The
//      emulator's diff-emu turns it on and checks HP exactly.
import { execFileSync } from "node:child_process";
import { buildMon, buildStartState, resolveTurn, calcDamage } from "./logic.js";

const TOOLS = "C:/Users/azncu/Desktop/pokemon_code/arena-solver/tools/";
const EMU = "C:/Users/azncu/Desktop/pokemon_code/arena-solver/emu/";
let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } else console.log("  ok   " + m); };
const mk = (species, moves, over = {}) => buildMon({
  species, level: 50, nature: "Hardy", evs: {}, ability: "Pressure", item: null, moves, friendship: 255, ...over,
});
const psum = (bs) => bs.reduce((a, b) => a + b.p, 0);
const hpOf = (b, mon, key) => Math.round((b.state[key] / 100) * mon.stats.hp);


console.log("-- F31: one hit, 16 rolls --");
{
  // the target Splashes (no stat change) and has Shell Armor (no crit branches)
  const a = mk("Snorlax", ["Body Slam"], { ability: "Thick Fat" });
  const d = mk("Cloyster", ["Splash"], { ability: "Shell Armor" });
  const st = buildStartState({ you: a, opp: d });
  const def = resolveTurn({ you: a, opp: d }, st, "Body Slam", "Splash");
  const ex = resolveTurn({ you: a, opp: d, exactRoll: true }, st, "Body Slam", "Splash");
  ok(def.every((b) => b.roll === undefined), "off by default");
  ok(Math.abs(psum(ex) - 1) < 1e-12, `exact: probabilities sum to 1 (${psum(ex)})`);
  const want = new Set([...Array(16)].map((_, k) => calcDamage(a, d, "Body Slam", { rollPercent: 85 + k })));
  const got = new Set(ex.filter((b) => /Body Slam \(hits\)/.test(b.label)).map((b) => d.stats.hp - hpOf(b, d, "oppHpPct")));
  ok([...want].every((v) => got.has(v)), `every roll's damage appears (${[...want].sort((x, y) => x - y).join(",")})`);
}

console.log("-- F31: a 2-5 hit move, grouped exactly --");
{
  const a = mk("Primeape", ["Fury Swipes"], { ability: "Vital Spirit" });
  const d = mk("Omastar", ["Splash"], { ability: "Shell Armor" });
  const st = buildStartState({ you: a, opp: d });
  const ex = resolveTurn({ you: a, opp: d, exactRoll: true }, st, "Fury Swipes", "Splash");
  ok(Math.abs(psum(ex) - 1) < 1e-12, `probabilities sum to 1 (${psum(ex)})`);
  // brute force the 3-hit, no-crit distribution of totals and compare
  const per = [...Array(16)].map((_, k) => calcDamage(a, d, "Fury Swipes", { rollPercent: 85 + k }));
  const brute = new Map();
  for (const x of per) for (const y of per) for (const z of per) brute.set(x + y + z, (brute.get(x + y + z) ?? 0) + 1 / 4096);
  const sim = new Map();
  const three = ex.filter((b) => b.label.includes("3x"));
  const p3 = psum(three);
  for (const b of three) { const t = d.stats.hp - hpOf(b, d, "oppHpPct"); sim.set(t, (sim.get(t) ?? 0) + b.p / p3); }
  const dev = Math.max(...[...new Set([...brute.keys(), ...sim.keys()])].map((k) => Math.abs((brute.get(k) ?? 0) - (sim.get(k) ?? 0))));
  ok(three.length > 0 && dev < 1e-9, `3 hits: the grouped totals equal the 4096-vector brute force (max dev ${dev})`);
}

console.log("-- the emulator's traces --");
{
  const traces = ["traces-given/battle-00448.json", "traces-given/battle-00687.json", "traces-given/battle-01119.json"];
  let out = "", code = 0;
  try { out = execFileSync("node", [TOOLS + "diff-emu.mjs", ...traces.map((t) => EMU + t)], { cwd: TOOLS, encoding: "utf8" }); }
  catch (e) { out = String(e.stdout); code = e.status; }
  ok(code === 0, `exact replay: ${(out.match(/divergences \d+/g) || []).join(", ")}`);
}

console.log();
console.log(failures === 0 ? "ALL PASS -- F31 exact roll green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

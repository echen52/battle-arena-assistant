// ── test-c1-headless.js ───────────────────────────────────────────────────
// C1 (amendment 13): the headless search.
//
//   PART 1  headless and retained agree EXACTLY -- move, winProb and every
//           option's winProb, bit for bit -- across the lead panel against a
//           spread of sets, including the heavy cells that crossed the heap
//   PART 2  a headless result retains nothing: no branches, no states, no
//           subtrees, at any option
//   PART 3  the default is still the retained tree (the site and team-workflow
//           read it)
import { analyzeMatchup, search, buildMon, buildStartState } from "./logic.js";
import { LEADS } from "./anchors.js";
import { getOpponentConfig } from "./opponent-adapter.js";
import { FRONTIER_POOL } from "./frontier-pool.js";
import { execFileSync } from "node:child_process";

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } };
console.warn = () => {};
const cfg = (n, tier) => {
  const e = FRONTIER_POOL[n];
  const o = e.abilities.length > 1 ? { ability: e.abilities[0] } : {};
  if (!e.brain && tier != null) o.ivTier = tier;
  return getOpponentConfig(n, o);
};

console.log("-- PART 1: headless == retained, bit for bit --");
{
  const cells = [
    // B6-2: the two heaviest cells (Skitty 1, Aggron 3) left this list -- their
    // RETAINED tree no longer fits the default heap with crits (phase-b-log).
    ["Metagross", "Umbreon 4", null], ["Snorlax", "Aerodactyl 2", 31], ["Salamence", "Kingdra 1", 31],
    ["Starmie", "Alakazam 4", 31], ["Gengar", "Delcatty 2", 21],
    ["Snorlax", "Medicham 3", 31], ["Salamence", "Snorlax 4", 31], ["Metagross", "Spenser Silver Slaking", null],
  ];
  for (const [lead, set, tier] of cells) {
    const c = cfg(set, tier);
    const r = analyzeMatchup(LEADS[lead], c).result;
    const h = analyzeMatchup(LEADS[lead], c, { tree: false }).result;
    ok(h.move === r.move && h.winProb === r.winProb, `${lead} | ${set}: ${h.move} ${h.winProb} vs retained ${r.move} ${r.winProb}`);
    ok(h.allOptions.length === r.allOptions.length
       && h.allOptions.every((o, i) => o.move === r.allOptions[i].move && o.winProb === r.allOptions[i].winProb),
       `${lead} | ${set}: every option identical, in the same order`);
  }
}

console.log();
console.log("-- PART 2: a headless result retains nothing --");
{
  const h = analyzeMatchup(LEADS.Gengar, cfg("Hariyama 2", 31), { tree: false }).result;
  ok(!("branches" in h), "no branches at the root");
  ok(h.allOptions.every((o) => Object.keys(o).sort().join() === "move,winProb"), "each option is {move, winProb} only");
  const m = buildMon({ species: "Snorlax", level: 50, nature: "Hardy", evs: {}, ability: "Thick Fat", item: null, moves: ["Splash"], friendship: 255 });
  const t = search({ you: m, opp: m }, buildStartState({ you: m, opp: m, overrides: { oppHpPct: 0 } }), 3, false);
  ok(t.isTerminal && !("state" in t), "a headless terminal carries no state");
}

console.log();
console.log("-- PART 3: the default still retains the tree --");
{
  const r = analyzeMatchup(LEADS.Metagross, cfg("Umbreon 4", null)).result;
  ok(Array.isArray(r.branches) && r.branches.length > 0 && r.branches[0].subtree && r.branches[0].state, "branches, subtrees and states by default");
}

console.log();
console.log("-- PART 4: the memory is actually not retained, all the way down --");
{
  // PART 2 only sees the root. If `retain` stopped propagating down the
  // recursion, the root would still look headless while every subtree was
  // kept. So measure it: a fresh process per mode, peak RSS, on a cell whose
  // retained tree is over a gigabyte (Gengar vs Delcatty 2, IV21).
  const probe = (tree) => {
    const src = `import { analyzeMatchup } from "./logic.js"; import { LEADS } from "./anchors.js";
      import { getOpponentConfig } from "./opponent-adapter.js"; console.warn = () => {};
      const r = analyzeMatchup(LEADS.Gengar, getOpponentConfig("Delcatty 2", { ivTier: 21 }), { tree: ${tree}, transposition: ${!tree} });
      process.stdout.write(String(Math.round(process.resourceUsage().maxRSS / 1024)));`;
    return Number(execFileSync("node", ["--max-old-space-size=8192", "--input-type=module", "-e", src], { encoding: "utf8" }).trim());
  };
  const headless = probe(false), retained = probe(true);
  ok(headless < 300, `headless peak RSS ${headless} MB (< 300)`);
  // The control is the retained tree WITHOUT the transposition table (B6-2
  // shares retained subtrees), i.e. the per-path tree C1 removed.
  ok(retained > 1000, `(control) retained per-path tree peak RSS ${retained} MB (> 1000)`);
}

console.log();
console.log(failures === 0 ? "ALL PASS -- C1 headless characterization green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

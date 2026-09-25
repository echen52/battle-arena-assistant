// ── test-c2-prune.js ──────────────────────────────────────────────────────
// C2: expectimax pruning in the headless search (analyzeMatchup's `prune`).
//
//   PART 1  pruned and unpruned agree EXACTLY -- move and winProb, bit for bit
//           -- across the lead panel against a spread of the universe
//   PART 2  pruning actually prunes (probe check), and every pruned option's
//           reported value is an UPPER BOUND on its true value, below the pick
//   PART 3  `prune` is ignored when the tree is retained: the site's tree is
//           complete
import { analyzeMatchup } from "./logic.js";
import { LEADS } from "./anchors.js";
import { getOpponentConfig } from "./opponent-adapter.js";
import { FRONTIER_POOL } from "./frontier-pool.js";

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } };
console.warn = () => {};
const cfg = (n, tier) => {
  const e = FRONTIER_POOL[n];
  const o = e.abilities.length > 1 ? { ability: e.abilities[0] } : {};
  if (!e.brain && tier != null) o.ivTier = tier;
  return getOpponentConfig(n, o);
};

// every 150th (set, tier) position of the universe, the same derivation as the
// sweeps (amendment 10)
const positions = [];
for (const [name, e] of Object.entries(FRONTIER_POOL)) if (e.lv50Legal) for (const t of e.ivTiers) positions.push([name, t]);
const spread = positions.filter((_, i) => i % 150 === 0);

console.log("-- PART 1: pruned == unpruned, bit for bit --");
let cells = 0, prunedOptions = 0, rootOptions = 0, boundsChecked = 0;
for (const lead of Object.keys(LEADS)) {
  for (const [set, tier] of spread) {
    let c;
    try { c = cfg(set, tier); } catch { continue; }
    let full, cut;
    try {
      full = analyzeMatchup(LEADS[lead], c, { tree: false }).result;
      cut = analyzeMatchup(LEADS[lead], c, { tree: false, prune: true }).result;
    } catch { continue; } // a named throw (amendment 12) is not this test's concern
    cells++;
    ok(cut.move === full.move && cut.winProb === full.winProb, `${lead} | ${set} IV${tier}: pruned ${cut.move} ${cut.winProb} vs ${full.move} ${full.winProb}`);
    rootOptions += cut.allOptions.length;
    for (const o of cut.allOptions) {
      if (!o.pruned) continue;
      prunedOptions++;
      const truth = full.allOptions.find((f) => f.move === o.move).winProb;
      boundsChecked++;
      ok(o.winProb >= truth - 1e-12, `${lead} | ${set}: pruned ${o.move}'s bound ${o.winProb} is below its true ${truth}`);
      ok(o.winProb < cut.winProb - 1e-6, `${lead} | ${set}: pruned ${o.move}'s bound ${o.winProb} is not below the pick's ${cut.winProb}`);
    }
  }
}
console.log(`   ${cells} cells solved both ways; ${prunedOptions} of ${rootOptions} root options pruned`);

console.log();
console.log("-- PART 2: pruning prunes --");
ok(cells >= 40, `(probe check) enough cells compared (${cells})`);
ok(prunedOptions > 0 && boundsChecked === prunedOptions, `(probe check) some root options were pruned (${prunedOptions}), each bound checked`);

console.log();
console.log("-- PART 3: ignored for the retained tree --");
{
  const r = analyzeMatchup(LEADS.Metagross, cfg("Umbreon 4"), { prune: true }).result;
  ok(r.allOptions.every((o) => !o.pruned && Array.isArray(o.branches)), "every retained option is complete, with its branches");
}

console.log();
console.log(failures === 0 ? "ALL PASS -- C2 pruning characterization green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

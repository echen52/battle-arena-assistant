// ── test-state-shape.js ───────────────────────────────────────────────────
// The branch state is shallow-copied on EVERY branch of the search
// (cloneState, `{ ...s }`), and V8's object-spread fast path ends at 128
// properties. This is not a style rule; it was measured in B3 batch 3:
//
//   123 keys (HEAD)        Metagross column 17.8 s
//   131 keys (3 new pairs) Metagross column 52.3 s   -- 2.9x, cloneState 0.6 s -> 19 s
//   127 keys (compacted)   Metagross column 16.9 s
//
// Nothing threw and no result moved; the only symptom was the clock. So the
// limit is asserted here, where a new field fails LOUDLY instead.
//
// Also asserted: a successor state has exactly the keys of the start state. A
// property written later that was never declared in buildStartState changes
// the object's hidden class on every branch that writes it, which defeats the
// same fast path by a different route.
import { buildMon, buildStartState, resolveTurn } from "./logic.js";

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } };

const LIMIT = 128;
const mk = (species, moves, over = {}) => buildMon({
  species, level: 50, nature: "Adamant", evs: { hp: 252, atk: 252 },
  ability: "Pressure", item: null, moves, friendship: 255, ...over,
});
const you = mk("Snorlax", ["Body Slam", "Growl", "Rest", "Splash"], { ability: "Thick Fat" });
const opp = mk("Dragonite", ["Outrage", "Thunder Wave", "Rest", "Earthquake"], { ability: "Inner Focus" });

const start = buildStartState({ you, opp });
const keys = Object.keys(start);
ok(keys.length <= LIMIT,
  `buildStartState has ${keys.length} keys; the spread fast path ends at ${LIMIT}. ` +
  `Fold the new fields into an existing object field (see youLock) instead of adding scalars.`);
console.log(`start state: ${keys.length} keys (limit ${LIMIT}, headroom ${LIMIT - keys.length})`);

// Walk a few turns of varied moves and check no branch grew a key.
let frontier = [start];
const seen = new Set(keys);
let grown = [];
for (let t = 0; t < 3; t++) {
  const next = [];
  for (const s of frontier) {
    for (const [ym, om] of [["Body Slam", "Outrage"], ["Growl", "Thunder Wave"], ["Rest", "Earthquake"]]) {
      for (const b of resolveTurn({ you, opp }, s, ym, om)) {
        for (const k of Object.keys(b.state)) if (!seen.has(k)) grown.push(k);
        next.push(b.state);
      }
    }
  }
  frontier = next.slice(0, 60);
}
grown = [...new Set(grown)];
ok(grown.length === 0, `successor states grew keys buildStartState never declared: ${grown.join(", ")}`);
console.log(`successor states checked across 3 turns: ${grown.length} undeclared keys`);

console.log();
console.log(failures === 0 ? "ALL PASS -- state shape within the spread fast path" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

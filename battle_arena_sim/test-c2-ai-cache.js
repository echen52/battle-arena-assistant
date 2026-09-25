// ── test-c2-ai-cache.js ───────────────────────────────────────────────────
// C2 (found by the full grid): the AI's roll-class cache must key on EVERY
// field its damage table reads. B2b (Foresight) and B7 (Guts / Marvel Scale's
// statuses) added fields to buildAiDamageState but not to aiRollCacheKey, so a
// position differing only in those reused the first position's table -- the
// AI's choice then depended on which position the search reached FIRST.
//
// Probe: a Guts Ursaring deciding against Shuckle, unstatused then poisoned.
// The poisoned decision, made after the unstatused one with the SAME mon
// objects (a cache hit, if the key is short), must equal the poisoned decision
// made with FRESH mon objects (a guaranteed miss).
import { buildMon, buildStartState, chooseOpponentMoves } from "./logic.js";
import { getOpponentConfig } from "./opponent-adapter.js";

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } };
console.warn = () => {};

const shuckleCfg = { ...getOpponentConfig("Shuckle 4", { ivTier: 31, allowUnreachableTier: true }) };
const ursaCfg = { ...getOpponentConfig("Ursaring 2", { ivTier: 15 }), friendship: 255 };
const pair = () => ({ you: buildMon(shuckleCfg), opp: buildMon(ursaCfg) });
const show = (d) => JSON.stringify(d.map((c) => [c.move, +c.prob.toFixed(12)]));

const P = pair();
ok(P.opp.ability === "Guts", `(probe check) Ursaring 2 has Guts (${P.opp.ability})`);
const clean = buildStartState({ you: P.you, opp: P.opp });
const poisoned = buildStartState({ you: P.you, opp: P.opp, overrides: { oppStatus: "poison" } });
const first = chooseOpponentMoves(P.opp, P.you, clean);                 // fills the cache
const afterward = show(chooseOpponentMoves(P.opp, P.you, poisoned));    // same objects
const F = pair();
const fresh = show(chooseOpponentMoves(F.opp, F.you, buildStartState({ you: F.you, opp: F.opp, overrides: { oppStatus: "poison" } })));
console.log(`   unstatused: ${show(first)}\n   poisoned (after): ${afterward}\n   poisoned (fresh): ${fresh}`);
ok(afterward === fresh, "the poisoned Guts decision does not depend on what was computed before it");

// Foresight, the other missing field: it only matters when Normal / Fighting
// moves meet a GHOST, so the target here is a Gengar.
const gengarCfg = { species: "Gengar", level: 50, nature: "Timid", evs: { hp: 252 }, ability: "Levitate", item: null, moves: ["Shadow Ball", "Thunderbolt", "Ice Punch", "Psychic"], friendship: 255 };
const gpair = () => ({ you: buildMon(gengarCfg), opp: buildMon(ursaCfg) });
const G = gpair();
const gClean = show(chooseOpponentMoves(G.opp, G.you, buildStartState({ you: G.you, opp: G.opp })));
const seen = show(chooseOpponentMoves(G.opp, G.you, buildStartState({ you: G.you, opp: G.opp, overrides: { youForesighted: true } })));
const H = gpair();
const seenFresh = show(chooseOpponentMoves(H.opp, H.you, buildStartState({ you: H.you, opp: H.opp, overrides: { youForesighted: true } })));
console.log(`   vs Gengar: ${gClean}
   foresighted (after): ${seen}
   foresighted (fresh): ${seenFresh}`);
ok(gClean !== seenFresh, "(probe check) Foresight changes the AI's choice against the Ghost");
ok(seen === seenFresh, "and a Foresight-dependent decision does not depend on what came before it");

// The defender's status, the third missing field: Marvel Scale raises Defense
// while statused, so the target is a paralysed Marvel Scale Milotic.
const milCfg = { species: "Milotic", level: 50, nature: "Bold", evs: { hp: 252, def: 252 }, ability: "Marvel Scale", item: null, moves: ["Surf", "Recover", "Toxic", "Ice Beam"], friendship: 255 };
const mpair = () => ({ you: buildMon(milCfg), opp: buildMon(ursaCfg) });
// Marvel Scale only matters near a KO threshold: scan the Milotic's HP for one.
let found = null;
for (let hp = 5; hp <= 100 && !found; hp += 5) {
  const M = mpair();
  const mClean = show(chooseOpponentMoves(M.opp, M.you, buildStartState({ you: M.you, opp: M.opp, overrides: { yourHpPct: hp } })));
  const mAfter = show(chooseOpponentMoves(M.opp, M.you, buildStartState({ you: M.you, opp: M.opp, overrides: { yourHpPct: hp, youStatus: "paralysis" } })));
  const N = mpair();
  const mFresh = show(chooseOpponentMoves(N.opp, N.you, buildStartState({ you: N.you, opp: N.opp, overrides: { yourHpPct: hp, youStatus: "paralysis" } })));
  if (mClean !== mFresh) found = { hp, mAfter, mFresh };
}
ok(found, "(probe check) some HP where Marvel Scale's status changes the AI's choice");
if (found) {
  console.log(`   Milotic at ${found.hp}%: paralysed (after) ${found.mAfter} / (fresh) ${found.mFresh}`);
  ok(found.mAfter === found.mFresh, "and a Marvel-Scale-dependent decision does not depend on what came before it");
}

// The pinch abilities (Blaze/Torrent/Overgrow/Swarm) read the attacker's HP,
// also missing from the key. No position-level probe here isolates it (the
// AI's uncached HP thresholds move the same decisions); the proof is at the
// universe: with the cache DISABLED the panel universe is byte-identical to the
// cached engine (phase-b-log, C2).

console.log();
console.log(failures === 0 ? "ALL PASS -- C2 AI cache key characterization green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

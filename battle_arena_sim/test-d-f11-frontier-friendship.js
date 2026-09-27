// ── test-d-f11-frontier-friendship.js ─────────────────────────────────────
// Phase D F11: a Frontier trainer's mon gets friendship MAX_FRIENDSHIP (255),
// but 0 if its set carries Frustration -- FillTrainerParty,
// src/battle_tower.c:1739-1748 ("Frustration is more powerful the lower the
// pokemon's friendship is"). analyzeMatchup forced 255 on every opponent, so an
// opponent's Frustration had power floor(10 * (255 - 255) / 25) = 0 in every
// solved cell. Found while attributing F10's Frustration movers.
import { analyzeMatchup, buildFrontierOpponent, calcDamage, buildMon } from "./logic.js";
import { getOpponentConfig } from "./opponent-adapter.js";
import { FRONTIER_POOL } from "./frontier-pool.js";
import { LEADS } from "./anchors.js";

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } else console.log("  ok   " + m); };
const cfgOf = (n) => { const e = FRONTIER_POOL[n]; return getOpponentConfig(n, e.abilities.length > 1 ? { ability: e.abilities[0] } : {}); };
console.warn = () => {};

// Every Lv50 set, derived from the pool (amendment 10): 0 with Frustration, else 255.
const sets = Object.entries(FRONTIER_POOL).filter(([, e]) => e.lv50Legal);
let bad = 0, frus = 0;
for (const [name, e] of sets) {
  const want = e.moves.includes("Frustration") ? 0 : 255;
  if (want === 0) frus++;
  if (buildFrontierOpponent(cfgOf(name)).friendship !== want) bad++;
}
ok(frus > 0 && bad === 0, `every Lv50 set built with the ROM's friendship (${frus} Frustration sets at 0; ${bad} wrong)`);

// analyzeMatchup uses it.
const { opp } = analyzeMatchup(LEADS.Metagross, cfgOf("Crawdaunt 2"), { tree: false });
ok(opp.friendship === 0, `analyzeMatchup's Crawdaunt 2 (Frustration) has friendship 0 (got ${opp.friendship})`);
const { opp: opp2 } = analyzeMatchup(LEADS.Metagross, cfgOf("Snorlax 7"), { tree: false });
ok(opp2.friendship === 255, `a set without Frustration: 255 (got ${opp2.friendship})`);

// So the opponent's Frustration now hits at full power.
const lead = buildMon(LEADS.Snorlax);
const craw = buildFrontierOpponent(cfgOf("Crawdaunt 2"));
const dmg = calcDamage(craw, lead, "Frustration");
ok(dmg > 20, `Crawdaunt 2's Frustration into the Snorlax lead deals real damage (${dmg})`);

console.log();
console.log(failures === 0 ? "ALL PASS -- F11 Frontier friendship green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

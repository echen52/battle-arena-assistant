// ── test-d-f30-roll-exempt.js ─────────────────────────────────────────────
// Phase D finding F30: the damage roll belongs to the SCRIPT.
//
// Cmd_adjustnormaldamage(2) roll 85-100 (src/battle_script_commands.c:
// 1639-1741); Cmd_adjustsetdamage does not (:5861-5899). damage-adjust.js is
// generated from the scripts (gen-damage-adjust.mjs); an effect reaching only
// adjustsetdamage takes no roll. Spit Up (data/battle_scripts_1.s:2094-2103)
// was rolled -- its comment cited a "SET_DAMAGE_ROLL_EXEMPT" that did not exist.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { buildMon, calcDamage } from "./logic.js";

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } else console.log("  ok   " + m); };
const mk = (species, moves) => buildMon({ species, level: 50, nature: "Hardy", evs: {}, ability: "Thick Fat", item: null, moves, friendship: 255 });

const before = fs.readFileSync("./damage-adjust.js", "utf8");
execFileSync("node", ["C:/Users/azncu/Desktop/pokemon_code/arena-solver/tools/gen-damage-adjust.mjs"], { encoding: "utf8" });
ok(fs.readFileSync("./damage-adjust.js", "utf8") === before, "damage-adjust.js regenerates byte for byte");

const a = mk("Snorlax", ["Spit Up", "Body Slam"]), d = mk("Snorlax", ["Harden"]);
const spit = calcDamage(a, d, "Spit Up", { baseMultiplier: 2 });
const spitRaw = calcDamage(a, d, "Spit Up", { baseMultiplier: 2, rollFrac: 1 });
ok(spit === spitRaw, `Spit Up is not rolled (${spit} = unrolled ${spitRaw})`);
const bs = calcDamage(a, d, "Body Slam", {}), bsRaw = calcDamage(a, d, "Body Slam", { rollFrac: 1 });
ok(bs < bsRaw, `a normal hit still is (${bs} < ${bsRaw})`);
const aiSpit = calcDamage(a, d, "Spit Up", { baseMultiplier: 2, rollPercent: 85, aiEstimate: true });
ok(aiSpit === Math.floor((spitRaw * 85) / 100), `the AI's estimate still multiplies simulatedRNG (${aiSpit})`);

console.log();
console.log(failures === 0 ? "ALL PASS -- F30 roll exemption green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

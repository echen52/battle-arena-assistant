// ── test-d-f41-weather-abilities.js ───────────────────────────────────────
// Phase D finding F41: two DIFFERENT permanent-weather abilities fail loud.
//
// TryDoEventsBeforeFirstTurn (src/battle_main.c:3850-3879) runs the
// switch-in abilities fastest first (GetWhoStrikesFirst, which also reads the
// Quick Claw draw and breaks a tie at random), and each weather ability
// overwrites the weather -- so the SLOWER setter's weather is the one that
// stays. The engine took the player's whenever both had one, silently. It is
// unreachable in the Frontier (Drizzle and Drought are Kyogre's and Groudon's,
// both banned; the pool's one weather ability is Tyranitar's Sand Stream, and
// two Sand Streams agree), so it becomes a named throw rather than a model.
import { buildMon, buildStartState } from "./logic.js";

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } else console.log("  ok   " + m); };
const mk = (species, ability) => buildMon({
  species, level: 50, nature: "Hardy", evs: {}, ability, item: null, moves: ["Tackle"], friendship: 255,
});
const ttar = mk("Tyranitar", "Sand Stream"), kyogre = mk("Kyogre", "Drizzle"), snorlax = mk("Snorlax", "Thick Fat");

console.log("-- F41: one setter, or two that agree --");
ok(buildStartState({ you: ttar, opp: snorlax }).weatherType === "sandstorm", "the player's Sand Stream sets sandstorm");
ok(buildStartState({ you: snorlax, opp: ttar }).weatherType === "sandstorm", "the opponent's does too");
ok(buildStartState({ you: ttar, opp: ttar }).weatherType === "sandstorm", "two Sand Streams agree");

console.log("-- F41: two that disagree throw by name --");
for (const [you, opp] of [[kyogre, ttar], [ttar, kyogre]]) {
  let msg = "";
  try { buildStartState({ you, opp }); } catch (e) { msg = e.message; }
  ok(/Drizzle/.test(msg) && /Sand Stream/.test(msg) && /F41/.test(msg), `${you.species} vs ${opp.species}: ${msg ? msg.slice(0, 90) + "..." : "no throw"}`);
}

console.log();
console.log(failures === 0 ? "ALL PASS -- F41 weather abilities green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

// ── test-d-f18-rest-clears-toxic.js ───────────────────────────────────────
// Phase D finding F18: Rest overwrites status1.
//
// Cmd_trysetrest sets gBattleMons[target].status1 = STATUS1_SLEEP_TURN(3)
// (src/battle_script_commands.c:6779): an assignment, so a badly poisoned
// rester's toxic bit and counter are gone. The engine set the status to sleep
// and left youToxicCounter, which the retired handler AI read as bad poison
// (found by F13's attribution: 9 panel cells, Toxic users vs a resting
// Snorlax). With the interpreter as the AI (status1 derived from the status
// itself) and a fixed 3-turn sleep inside a 3-turn match, no value moves; the
// stale counter survives only in the state key, and would have made a later
// plain poison tick as Toxic.
import { buildMon, buildStartState, resolveTurn } from "./logic.js";

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } else console.log("  ok   " + m); };
const mk = (species, moves, over = {}) => buildMon({
  species, level: 50, nature: "Hardy", evs: {}, ability: "Thick Fat", item: null, moves, friendship: 255, ...over,
});

const sn = mk("Snorlax", ["Rest"]), um = mk("Umbreon", ["Toxic"], { ability: "Synchronize" });
const st = buildStartState({ you: sn, opp: um, overrides: { yourHpPct: 60, youStatus: "poison", youToxicCounter: 2 } });
const br = resolveTurn({ you: sn, opp: um }, st, "Rest", "Toxic");
ok(br.length > 0 && br.every((b) => b.state.youStatus === "sleep" && b.state.youSleepTurns === 3),
  "Rest: asleep for 3");
ok(br.every((b) => b.state.youToxicCounter === null), `and the Toxic counter is gone (was 2; got ${[...new Set(br.map((b) => b.state.youToxicCounter))]})`);

// the latent consequence: from a post-Rest state woken and plainly poisoned,
// the end-of-turn tick is maxHP/8 -- with the stale counter it was Toxic's
const woke = { ...br[0].state, youStatus: "poison", youSleepTurns: null, yourHpPct: 100 };
const t = resolveTurn({ you: sn, opp: mk("Umbreon", ["Harden"], { ability: "Synchronize" }) }, woke, "Rest", "Harden");
const lost = Math.round(sn.stats.hp - (t[0].state.yourHpPct / 100) * sn.stats.hp);
ok(lost === Math.floor(sn.stats.hp / 8), `a later plain poison ticks maxHP/8 (${lost} of ${sn.stats.hp})`);

console.log();
console.log(failures === 0 ? "ALL PASS -- F18 Rest clears Toxic green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

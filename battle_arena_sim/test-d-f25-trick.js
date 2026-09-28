// ── test-d-f25-trick.js ───────────────────────────────────────────────────
// Phase D finding F25: BattleScript_EffectTrick fails on the target's
// Substitute before anything else (data/battle_scripts_1.s:2335);
// Cmd_tryswapitems also fails on an Enigma Berry or mail on either side, and a
// swap clears BOTH battlers' choicedMove (src/battle_script_commands.c:
// 9219-9259). Emulator: traces/00306 (Trick into Latios's Substitute).
import fs from "node:fs";
import { buildMon, buildStartState, resolveTurn, selectableMoves, TRICK_UNSWAPPABLE } from "./logic.js";

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } else console.log("  ok   " + m); };
const mk = (species, moves, over = {}) => buildMon({
  species, level: 50, nature: "Hardy", evs: {}, ability: "Levitate", item: null, moves, friendship: 255, ...over,
});
const uniq = (xs) => [...new Set(xs)];


console.log("-- F25: the unswappable set is IS_ITEM_MAIL + Enigma Berry --");
{
  const mail = fs.readFileSync("C:/Users/azncu/Desktop/pokemon_code/pokeemerald/include/mail.h", "utf8")
    .match(/#define IS_ITEM_MAIL\(itemId\)([\s\S]*?)\)\)\s*\n/)[1].match(/ITEM_\w+/g);
  const want = ["ITEM_ENIGMA_BERRY", ...mail].sort();
  ok(JSON.stringify([...TRICK_UNSWAPPABLE].sort()) === JSON.stringify(want), `${want.length} items, from the macro`);
}

console.log("-- F25: Trick into a Substitute --");
{
  const lat = mk("Latios", ["Substitute", "Psychic"], { item: "Leftovers" });
  const kec = mk("Kecleon", ["Trick", "Shadow Ball", "Brick Break", "Thunder Wave"], { ability: "Color Change", item: "Leftovers" });
  const st = buildStartState({ you: lat, opp: kec, overrides: { youSubstituteHP: 20 } });
  const br = resolveTurn({ you: lat, opp: kec }, st, "Psychic", "Trick");
  ok(br.every((b) => b.state.youItemOverride === undefined && b.state.oppItemOverride === undefined), "no swap through the Substitute");
  ok(br.every((b) => b.state.skillOpp === -2), `the failure scores -2 (${uniq(br.map((b) => b.state.skillOpp))})`);
}
console.log("-- F25: a successful Trick swaps --");
{
  const snor = mk("Snorlax", ["Body Slam"], { ability: "Thick Fat", item: "Leftovers" });
  const kec = mk("Kecleon", ["Trick", "Shadow Ball"], { ability: "Color Change", item: "Choice Band" });
  const br = resolveTurn({ you: snor, opp: kec }, buildStartState({ you: snor, opp: kec }), "Body Slam", "Trick");
  const swapped = br.filter((b) => b.state.oppItemOverride === "Leftovers");
  ok(swapped.length > 0 && swapped.every((b) => b.state.youItemOverride === "Choice Band"), "the items swap");
}

console.log("-- F25: a successful Trick clears an EXISTING lock --");
{
  const snor = mk("Snorlax", ["Body Slam", "Shadow Ball"], { ability: "Thick Fat", item: "Choice Band" });
  const kec = mk("Kecleon", ["Trick"], { ability: "Color Change", item: "Leftovers" });
  const st = buildStartState({ you: snor, opp: kec, overrides: { youChoiceLock: "Body Slam" } });
  const br = resolveTurn({ you: snor, opp: kec }, st, "Body Slam", "Trick").filter((b) => b.state.youItemOverride === "Leftovers");
  ok(br.length > 0 && br.every((b) => b.state.youChoiceLock == null), `Snorlax loses the band and its lock (${uniq(br.map((b) => b.state.youChoiceLock))})`);
}

console.log();
console.log(failures === 0 ? "ALL PASS -- F25 Trick green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

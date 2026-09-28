// ── test-d-f26-choice-lock.js ─────────────────────────────────────────────
// Phase D finding F26: MOVEEND_CHOICE_MOVE (src/battle_script_commands.c:
// 4296-4308) locks a Choice Band holder at the end of every move that OBEYED
// -- status moves and failures included -- using the hold effect as it
// stands then; an item the attacker gains from Trick or Thief waits in
// changedItems until MOVEEND_CHANGED_ITEMS (:4318), after this step. The
// engine locked only on the damaging path. Emulator: traces/00306 (the ROM's
// Kecleon locked into its failed Trick), traces/00035 (not locked after a
// band-for-band Trick).
import fs from "node:fs";
import { buildMon, buildStartState, resolveTurn, selectableMoves, TRICK_UNSWAPPABLE } from "./logic.js";

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } else console.log("  ok   " + m); };
const mk = (species, moves, over = {}) => buildMon({
  species, level: 50, nature: "Hardy", evs: {}, ability: "Levitate", item: null, moves, friendship: 255, ...over,
});
const uniq = (xs) => [...new Set(xs)];


console.log("-- F25/F26: Trick into a Substitute --");
{
  const lat = mk("Latios", ["Substitute", "Psychic"], { item: "Leftovers" });
  const kec = mk("Kecleon", ["Trick", "Shadow Ball", "Brick Break", "Thunder Wave"], { ability: "Color Change", item: "Choice Band" });
  const st = buildStartState({ you: lat, opp: kec, overrides: { youSubstituteHP: 20 } });
  const br = resolveTurn({ you: lat, opp: kec }, st, "Psychic", "Trick");
  ok(br.every((b) => b.state.youItemOverride === undefined && b.state.oppItemOverride === undefined), "no swap through the Substitute");
  ok(br.every((b) => b.state.skillOpp === -2), `the failure scores -2 (${uniq(br.map((b) => b.state.skillOpp))})`);
  ok(br.every((b) => b.state.oppChoiceLock === "Trick"), `and Kecleon is locked into Trick (${uniq(br.map((b) => b.state.oppChoiceLock))})`);
  const sel = selectableMoves(kec.moves, br[0].state, "opp", lat, "opp");
  ok(JSON.stringify(sel) === JSON.stringify(["Trick"]), `next turn it may only Trick (${sel})`);
}

console.log("-- F25/F26: a successful Trick --");
{
  const snor = mk("Snorlax", ["Body Slam"], { ability: "Thick Fat", item: "Leftovers" });
  const kec = mk("Kecleon", ["Trick", "Shadow Ball"], { ability: "Color Change", item: "Choice Band" });
  const br = resolveTurn({ you: snor, opp: kec }, buildStartState({ you: snor, opp: kec }), "Body Slam", "Trick");
  const swapped = br.filter((b) => b.state.oppItemOverride === "Leftovers");
  ok(swapped.length > 0 && swapped.every((b) => b.state.youItemOverride === "Choice Band"), "the items swap");
  ok(swapped.every((b) => b.state.oppChoiceLock == null), "Kecleon no longer holds the band: no lock (the hold effect AFTER the move)");
  // Snorlax first (holding Leftovers): not locked, and the Trick clears
  // choicedMove anyway. Kecleon first: Snorlax then Body Slams HOLDING the
  // band, so its own move end locks it.
  const snFirst = swapped.filter((b) => b.label.startsWith("You")), kFirst = swapped.filter((b) => b.label.startsWith("Opp"));
  ok(snFirst.every((b) => b.state.youChoiceLock == null), `Snorlax moved first: not locked (${snFirst.length} branches)`);
  ok(kFirst.length > 0 && kFirst.every((b) => b.state.youChoiceLock === "Body Slam"), `Kecleon (faster) moved first: Snorlax locked into Body Slam (${kFirst.length} branches)`);
  // (an Enigma Berry or mail holder cannot reach this code in a solvable
  // position -- the engine throws by name on their HOLD_EFFECT_NONE
  // disposition -- so the set above is their check)
}

console.log("-- F26: a Trick user holds nothing at the lock (changedItems) --");
{
  // band for band (emulator traces/00035): the swap changes nothing visible,
  // but the attacker's new item waits in changedItems until
  // MOVEEND_CHANGED_ITEMS, after MOVEEND_CHOICE_MOVE -- so no lock
  const lat = mk("Latios", ["Shadow Ball"], { item: "Choice Band" });
  const kec = mk("Kecleon", ["Trick", "Shadow Ball"], { ability: "Color Change", item: "Choice Band" });
  const br = resolveTurn({ you: lat, opp: kec }, buildStartState({ you: lat, opp: kec }), "Shadow Ball", "Trick")
    .filter((b) => /Opp uses Trick/.test(b.label));
  ok(br.length > 0 && br.every((b) => b.state.oppChoiceLock == null), `Kecleon is not locked into Trick (${uniq(br.map((b) => b.state.oppChoiceLock))})`);
}

console.log("-- F26: a status move locks; a cancelled one does not --");
{
  const hyp = mk("Hypno", ["Hypnosis", "Psychic"], { ability: "Insomnia", item: "Choice Band" });
  const snor = mk("Snorlax", ["Body Slam"], { ability: "Thick Fat" });
  const br = resolveTurn({ you: snor, opp: hyp }, buildStartState({ you: snor, opp: hyp }), "Body Slam", "Hypnosis");
  ok(br.every((b) => b.state.oppChoiceLock === "Hypnosis"), `Hypnosis, hit or miss, locks (${uniq(br.map((b) => b.state.oppChoiceLock))})`);
  const para = resolveTurn({ you: snor, opp: hyp }, buildStartState({ you: snor, opp: hyp, overrides: { oppStatus: "paralysis" } }), "Body Slam", "Psychic")
    .filter((b) => /Opp is fully paralyzed/.test(b.label));
  ok(para.length > 0 && para.every((b) => b.state.oppChoiceLock == null), "fully paralysed: never obeyed, no lock");
}

console.log();
console.log(failures === 0 ? "ALL PASS -- F26 Choice lock green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

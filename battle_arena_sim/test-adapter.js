import { getOpponentConfig } from "./opponent-adapter.js";
import { analyzeMatchup } from "./logic.js";

const metagrossConfig = {
  species: "Metagross",
  level: 50,
  nature: "Adamant",
  evs: { atk: 252, spd: 4, spe: 252 },
  ability: "Clear Body",
  item: "Cheri Berry",
  moves: ["Meteor Mash", "Earthquake", "Shadow Ball", "Explosion"],
};

console.log("── Happy path: adapter-built Umbreon 4 vs hand-typed config ──");
const umbreon4ViaAdapter = getOpponentConfig("Umbreon 4");
console.log("Adapter-produced config:", umbreon4ViaAdapter);

const result = analyzeMatchup(metagrossConfig, umbreon4ViaAdapter);
console.log(`Recommended: ${result.result.move} (P(win)=${result.result.winProb.toFixed(3)})`);
// 0.919 is NOT a copy of test-matchup.js's own hardcoded regression anchor —
// it's independently justified here: getOpponentConfig("Umbreon 4")'s output
// (verified above to be species/level/nature/evs/ivs(31 default)/ability/
// item/moves-identical to test-matchup.js's hand-typed umbreon4Config) feeds
// the SAME analyzeMatchup call, so it MUST land on the same value the
// canonical anchor does. This checks the ADAPTER's fidelity to the real
// spreadsheet data (a bug in opponent-adapter.js or in the "Umbreon 4" entry
// in opponent-full-data.js would very likely move this number even though
// test-matchup.js's hand-typed config would be untouched) — a different
// failure mode than what the anchor alone covers, not a redundant copy of it.
// Previously hardcoded 0.981 here, a stale pre-Session-8 value (see
// HANDOFF.md's Session-9-era note) that predates all of this repo's
// checkpointed engine changes; corrected to match the current, repeatedly-
// reverified 0.919 anchor.
const pass = result.result.move === "Meteor Mash" && Math.abs(result.result.winProb - 0.919) < 0.001;
console.log(pass ? "✅ PASS — adapter output matches the hand-typed-config result exactly" : "❌ FAIL");

console.log();
console.log("── Error handling checks ──");

function expectError(label, fn) {
  try {
    fn();
    console.log(`❌ ${label}: expected an error, got none`);
  } catch (e) {
    console.log(`✅ ${label}:`);
    console.log(`   "${e.message}"`);
  }
}

expectError("Unknown set name", () => getOpponentConfig("Umbreon 99"));
// "Species not yet in species-data.js" (formerly pointed at "Blastoise 4")
// REMOVED, not re-pointed: confirmed zero of the 112 distinct species
// referenced by opponent-full-data.js's 552 sets are missing from
// species-data.js's 386-species dex (checked programmatically, not
// assumed). There is currently no real negative case in this codebase's own
// data to exercise opponent-adapter.js's `if (!dex) throw` branch
// (getOpponentConfig, the species-lookup guard) — pointing this at some
// OTHER currently-unported species would just defer the identical rot to
// whenever that species gets added, and fabricating one would mean either
// modifying opponent-adapter.js to accept an injectable species map (an
// engine-adjacent change, not a test fix) or asserting against data this
// test doesn't actually exercise through the real adapter path. If
// species-data.js's coverage ever regresses (a species removed, or a new
// opponent-full-data.js entry lands with an unported species), THAT is the
// natural moment to add a real negative case back — not before.
expectError("Dual-ability species with no ability specified", () => getOpponentConfig("Dugtrio 1"));

console.log();
console.log("── Dual-ability species with explicit ability specified ──");
const dugtrio1 = getOpponentConfig("Dugtrio 1", { ability: "Sand Veil" });
console.log("✅ Dugtrio 1 (Sand Veil) config built:", dugtrio1);

console.log();
console.log("── Second cross-checked entry (Umbreon 1, different EV spread) ──");
const umbreon1 = getOpponentConfig("Umbreon 1");
console.log("✅ Umbreon 1 config built and passed stat cross-check:", umbreon1);

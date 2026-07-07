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
const pass = result.result.move === "Meteor Mash" && Math.abs(result.result.winProb - 0.981) < 0.001;
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
expectError("Species not yet in species-data.js", () => getOpponentConfig("Blastoise 4"));
expectError("Dual-ability species with no ability specified", () => getOpponentConfig("Dugtrio 1"));

console.log();
console.log("── Dual-ability species with explicit ability specified ──");
const dugtrio1 = getOpponentConfig("Dugtrio 1", { ability: "Sand Veil" });
console.log("✅ Dugtrio 1 (Sand Veil) config built:", dugtrio1);

console.log();
console.log("── Second cross-checked entry (Umbreon 1, different EV spread) ──");
const umbreon1 = getOpponentConfig("Umbreon 1");
console.log("✅ Umbreon 1 config built and passed stat cross-check:", umbreon1);

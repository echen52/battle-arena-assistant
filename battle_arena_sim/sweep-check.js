// Full 552-set sweep: Metagross vs every opponent set in opponent-full-data.js.
// Counts how many analyze end-to-end without throwing ("usable"). Multi-
// ability sets are resolved deterministically to their first listed ability
// (Frontier randomizes at runtime; a fixed choice keeps the sweep repeatable).
import { OPPONENT_SETS } from "./opponent-full-data.js";
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

const listFailures = process.argv.includes("--list-failures");

const names = Object.keys(OPPONENT_SETS);
let usable = 0;
const failures = [];

for (const name of names) {
  try {
    const entry = OPPONENT_SETS[name];
    const opts = entry.abilities.length > 1 ? { ability: entry.abilities[0] } : {};
    const oppConfig = getOpponentConfig(name, opts);
    analyzeMatchup(metagrossConfig, oppConfig);
    usable++;
  } catch (e) {
    failures.push({ name, message: e.message });
  }
}

console.log(`Sweep: ${usable}/${names.length} usable`);
if (listFailures) {
  console.log(`\n${failures.length} failures:`);
  for (const f of failures) console.log(`  ${f.name}: ${f.message}`);
}

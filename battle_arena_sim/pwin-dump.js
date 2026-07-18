// Dumps P(win) + chosen move for every set that analyzes without throwing.
// Used as the byte-identical before/after proof for engine change #11.
// Deterministic order (Object.keys) so two dumps diff cleanly.
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

const lines = [];
let usable = 0;
for (const name of Object.keys(OPPONENT_SETS)) {
  try {
    const entry = OPPONENT_SETS[name];
    const opts = entry.abilities.length > 1 ? { ability: entry.abilities[0] } : {};
    const oppConfig = getOpponentConfig(name, opts);
    const { result } = analyzeMatchup(metagrossConfig, oppConfig);
    // Full precision — do NOT round; the whole point is byte-identical P(win).
    lines.push(`${name}\t${result.winProb}\t${result.move}`);
    usable++;
  } catch (e) {
    // Silently skip throwers — the guard may add new ones; the diff is over
    // sets that produce output on BOTH sides, and a count change is reported
    // separately by sweep-check.js.
  }
}
console.error(`pwin-dump: ${usable} usable sets dumped`);
process.stdout.write(lines.join("\n") + "\n");

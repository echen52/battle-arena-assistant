// ── opponent-adapter.js (v2) ───────────────────────────────────────────────
// Converts a named entry from opponent-full-data.js into a config object
// ready for buildMon()/analyzeMatchup(). This version uses the complete
// dataset (converted from EmeraldBattleFrontierComplete.xlsx), which has
// every set's real EVs and precomputed stats built in — no more "EVs not
// known yet" errors for anything already in the spreadsheet.

import { SPECIES } from "./species-data.js";
import { OPPONENT_SETS } from "./opponent-full-data.js";
import { buildMon } from "./logic.js";

// setName: exact key from opponent-full-data.js, e.g. "Umbreon 4" or
// "Greta Gold Umbreon"
// opts.level: defaults to 50 (Frontier standard mode)
// opts.ability: required only if the set has more than one possible ability
function getOpponentConfig(setName, opts = {}) {
  const level = opts.level ?? 50;

  const entry = OPPONENT_SETS[setName];
  if (!entry) {
    throw new Error(`No entry named "${setName}" found in opponent-full-data.js — check spelling/exact name.`);
  }

  const dex = SPECIES[entry.species];
  if (!dex) {
    throw new Error(
      `"${setName}" is species "${entry.species}", which isn't in species-data.js yet. ` +
      `Add its base stats/types/abilities there first.`
    );
  }

  let ability = opts.ability;
  if (!ability) {
    if (entry.abilities.length === 1) {
      ability = entry.abilities[0];
    } else {
      throw new Error(
        `"${setName}" has ${entry.abilities.length} possible abilities ` +
        `(${entry.abilities.join(" / ")}), and Frontier trainers get one at random. ` +
        `Pass { ability: "..." } explicitly to pick which one to analyze.`
      );
    }
  }

  const ivValue = entry.fixedIV ?? 31;
  const ivs = { hp: ivValue, atk: ivValue, def: ivValue, spa: ivValue, spd: ivValue, spe: ivValue };

  const config = {
    species: entry.species,
    level,
    nature: entry.nature,
    evs: entry.evs,
    ivs,
    ability,
    item: entry.item,
    moves: entry.moves,
  };

  // Sanity check against the spreadsheet's own precomputed stats. Empirically
  // validated (full-dataset sweep across all 552 entries, all 386 species):
  // ~13% of entries have a small, single-stat, off-by-one discrepancy at
  // nature-multiplier rounding boundaries — confirmed to be minor spreadsheet
  // error, not an engine bug (tried alternate rounding formulas against the
  // full dataset; plain floor/truncate, as used here, has by far the fewest
  // mismatches — 73 vs 272+ for the next-best alternative). So: small
  // discrepancies (total abs diff <= 2 across all 6 stats) are logged as a
  // warning and the computed (trusted) value is used; anything larger throws,
  // since that's more likely a real problem (wrong EV/IV/nature data).
  if (level === 50 && entry.lvl50Stats) {
    const built = buildMon(config);
    let totalAbsDiff = 0;
    const diffs = [];
    for (const stat of ["hp", "atk", "def", "spa", "spd", "spe"]) {
      const d = built.stats[stat] - entry.lvl50Stats[stat];
      if (d !== 0) { totalAbsDiff += Math.abs(d); diffs.push(`${stat}: computed ${built.stats[stat]} vs sheet ${entry.lvl50Stats[stat]}`); }
    }
    if (totalAbsDiff > 2) {
      throw new Error(
        `Large stat mismatch for "${setName}" at level 50 (${diffs.join(", ")}) — ` +
        `likely a real data problem, not the known minor rounding quirk. Check EV/IV/nature.`
      );
    } else if (totalAbsDiff > 0) {
      console.warn(`[opponent-adapter] "${setName}": minor stat discrepancy vs spreadsheet ` +
        `(${diffs.join(", ")}) — using computed value (trusted; see known-limitations notes).`);
    }
  }

  return config;
}

export { getOpponentConfig };

// UI-side derived/lookup data ONLY — no computation lives here. Everything
// that touches damage/stats/type math comes from ../battle_arena_sim/logic.js;
// this file just reshapes engine data into dropdown-friendly lists, plus the
// one genuinely static, unchanging Gen III table (nature names) that the
// engine keeps module-private and isn't worth adding an export for.

import { SPECIES } from "../battle_arena_sim/species-data.js";
import { MOVES } from "../battle_arena_sim/move-data.js";
import { OPPONENT_SETS } from "../battle_arena_sim/opponent-full-data.js";

// The 25 real Gen III natures — a finite, fully-known table (same names the
// engine's own module-private NATURES object uses; not re-deriving the
// boost/drop mechanics here, just the name list for a <select>).
export const NATURE_NAMES = [
  "Hardy", "Lonely", "Brave", "Adamant", "Naughty",
  "Bold", "Docile", "Relaxed", "Impish", "Lax",
  "Timid", "Hasty", "Serious", "Jolly", "Naive",
  "Modest", "Mild", "Quiet", "Bashful", "Rash",
  "Calm", "Gentle", "Sassy", "Careful", "Quirky",
];

export const SPECIES_LIST = Object.keys(SPECIES).sort();
export const MOVE_LIST = Object.keys(MOVES).sort();
export const OPPONENT_SET_NAMES = Object.keys(OPPONENT_SETS).sort();

export function getSpeciesAbilities(species) {
  return SPECIES[species] ? SPECIES[species].abilities : [];
}

export function getSpeciesTypes(species) {
  return SPECIES[species] ? SPECIES[species].types : [];
}

// Opponent sets grouped by species, for a two-step "species -> which set"
// picker (552 sets is too many to scan as one flat list).
export function groupOpponentSetsBySpecies() {
  const groups = {};
  for (const name of OPPONENT_SET_NAMES) {
    const species = OPPONENT_SETS[name].species;
    if (!groups[species]) groups[species] = [];
    groups[species].push(name);
  }
  return groups;
}

export { SPECIES, MOVES, OPPONENT_SETS };

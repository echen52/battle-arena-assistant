// UI-side derived/lookup data ONLY — no computation lives here. Everything
// that touches damage/stats/type math comes from ../battle_arena_sim/logic.js;
// this file just reshapes engine data into dropdown-friendly lists, plus the
// one genuinely static, unchanging Gen III table (nature names) that the
// engine keeps module-private and isn't worth adding an export for.

import { SPECIES } from "../battle_arena_sim/species-data.js";
import { MOVES } from "../battle_arena_sim/move-data.js";
import { FRONTIER_POOL } from "../battle_arena_sim/frontier-pool.js";
import { GENDER_RATIO } from "../battle_arena_sim/gender-data.js";
import { resolveGenderDist } from "../battle_arena_sim/logic.js";

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

// The opponent sets a Lv50 Arena challenge can meet: the engine's own pool
// (frontier-pool.js -- 882 gBattleFrontierMons entries + 46 Frontier Brain
// sets, B1), filtered to the Lv50-legal ones: 896 sets, 46 of them Brain sets,
// 1,392 reachable (set, IV tier) positions -- the population the full grid
// solves. Each entry carries `ivTiers`, the trainer IV bands it can appear in
// (amendment 7); a Brain set has one fixed tier. This replaced the retired
// opponent-full-data.js (552 sets, no low/mid range, no Brains, no tiers).
export const OPPONENT_SETS = Object.fromEntries(Object.entries(FRONTIER_POOL).filter(([, e]) => e.lv50Legal));
export const OPPONENT_SET_NAMES = Object.keys(OPPONENT_SETS).sort();

export function getSpeciesAbilities(species) {
  return SPECIES[species] ? SPECIES[species].abilities : [];
}

export function getSpeciesTypes(species) {
  return SPECIES[species] ? SPECIES[species].types : [];
}

// Opponent sets grouped by species, for a two-step "species -> which set"
// picker (896 sets is too many to scan as one flat list).
export function groupOpponentSetsBySpecies() {
  const groups = {};
  for (const name of OPPONENT_SET_NAMES) {
    const species = OPPONENT_SETS[name].species;
    if (!groups[species]) groups[species] = [];
    groups[species].push(name);
  }
  return groups;
}

// Whether Attract could EVER land between these two species, for the UI's
// Attracted-toggle gate. The gender distribution is the engine's own
// (logic.js resolveGenderDist over the same GENDER_RATIO table); the pairing
// rule mirrors EFFECT_ATTRACT's enumeration: both genders resolved, neither
// genderless, and different. The engine's direct-override path
// (buildStartState's overrides) does NOT itself validate gender for a pre-set
// "youAttracted: true" -- so the UI must block an impossible pairing itself,
// rather than letting the toggle assert a state the game could never produce.
export function canAttractPair(speciesA, speciesB) {
  const distA = resolveGenderDist(GENDER_RATIO[speciesA]), distB = resolveGenderDist(GENDER_RATIO[speciesB]);
  for (const a of distA) {
    for (const b of distB) {
      if (a.gender !== "genderless" && b.gender !== "genderless" && a.gender !== b.gender) return true;
    }
  }
  return false;
}

export { SPECIES, MOVES };

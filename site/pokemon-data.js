// UI-side derived/lookup data ONLY — no computation lives here. Everything
// that touches damage/stats/type math comes from ../battle_arena_sim/logic.js;
// this file just reshapes engine data into dropdown-friendly lists, plus the
// one genuinely static, unchanging Gen III table (nature names) that the
// engine keeps module-private and isn't worth adding an export for.

import { SPECIES } from "../battle_arena_sim/species-data.js";
import { MOVES } from "../battle_arena_sim/move-data.js";
import { OPPONENT_SETS } from "../battle_arena_sim/opponent-full-data.js";
import { GENDER_RATIO } from "../battle_arena_sim/gender-data.js";

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

// Per-individual gender distribution for a species — restates logic.js's own
// (module-private) resolveGenderDist over the same GENDER_RATIO table, for
// the UI's Attracted-toggle gender-compatibility gate only. Not a
// computation path the engine runs — see canAttractPair below.
function genderDistFor(species) {
  const ratio = GENDER_RATIO[species];
  if (ratio === "male" || ratio === "female" || ratio === "genderless") return [{ p: 1, gender: ratio }];
  const pFemale = ratio / 100;
  return [{ p: pFemale, gender: "female" }, { p: 1 - pFemale, gender: "male" }];
}

// Whether Attract could EVER land between these two species — mirrors the
// engine's own compatibility formula (logic.js's EFFECT_ATTRACT enumeration:
// both genders resolved, neither genderless, and different). The engine's
// direct-override path (buildStartState's overrides, see HANDOFF.md) does
// NOT itself validate gender for a pre-set "youAttracted: true" — so the UI
// must block an impossible pairing (either side genderless, or both fixed to
// the same single gender) itself, rather than letting the toggle assert a
// state the game could never produce.
export function canAttractPair(speciesA, speciesB) {
  const distA = genderDistFor(speciesA), distB = genderDistFor(speciesB);
  for (const a of distA) {
    for (const b of distB) {
      if (a.gender !== "genderless" && b.gender !== "genderless" && a.gender !== b.gender) return true;
    }
  }
  return false;
}

export { SPECIES, MOVES, OPPONENT_SETS };

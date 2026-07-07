// ── opponent-full-data.js ───────────────────────────────────────────────────
// Full opponent set database, converted from EmeraldBattleFrontierComplete.xlsx
// ("Pokémon" sheet). Supersedes the old data.js + opponent-ev-data.js pairing —
// this file has everything: species, nature, item, moves, possible abilities,
// EVs, and precomputed Level 50/100 stats (used as a built-in cross-check by
// opponent-adapter.js). fixedIV is set for Frontier Brain sets (Greta, Tucker,
// etc.), which use non-31 IVs; regular trainer-pool sets have fixedIV: null and
// fall back to the standard 31.
//
// 552 entries. Regular trainer-pool sets are keyed "{Species} {Instance}"
// (e.g. "Umbreon 4") to match the old data.js naming. Frontier Brain sets are
// keyed "{Trainer} {Medal} {Species}" (e.g. "Greta Gold Umbreon").

export const OPPONENT_SETS = {
  "Jolteon 4": {
    "species": "Jolteon",
    "nature": "Timid",
    "item": "King's Rock",
    "moves": [
      "Thunderbolt",
      "Thunder Wave",
      "Bite",
      "Shadow Ball"
    ],
    "abilities": [
      "Volt Absorb"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 140,
      "atk": 76,
      "def": 80,
      "spa": 162,
      "spd": 115,
      "spe": 200
    },
    "lvl100Stats": {
      "hp": 271,
      "atk": 149,
      "def": 156,
      "spa": 319,
      "spd": 226,
      "spe": 394
    },
    "fixedIV": null
  },
  "Jolteon 1": {
    "species": "Jolteon",
    "nature": "Modest",
    "item": "Cheri Berry",
    "moves": [
      "Thunderbolt",
      "Thunder Wave",
      "Attract",
      "Protect"
    ],
    "abilities": [
      "Volt Absorb"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 140,
      "atk": 76,
      "def": 80,
      "spa": 178,
      "spd": 115,
      "spe": 182
    },
    "lvl100Stats": {
      "hp": 271,
      "atk": 149,
      "def": 156,
      "spa": 350,
      "spd": 226,
      "spe": 359
    },
    "fixedIV": null
  },
  "Crobat 3": {
    "species": "Crobat",
    "nature": "Adamant",
    "item": "Scope Lens",
    "moves": [
      "Air Cutter",
      "Double-Edge",
      "Shadow Ball",
      "Screech"
    ],
    "abilities": [
      "Inner Focus"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 160,
      "atk": 156,
      "def": 100,
      "spa": 81,
      "spd": 100,
      "spe": 182
    },
    "lvl100Stats": {
      "hp": 311,
      "atk": 306,
      "def": 196,
      "spa": 158,
      "spd": 196,
      "spe": 359
    },
    "fixedIV": null
  },
  "Crobat 4": {
    "species": "Crobat",
    "nature": "Adamant",
    "item": "BrightPowder",
    "moves": [
      "Sludge Bomb",
      "Aerial Ace",
      "Shadow Ball",
      "Confuse Ray"
    ],
    "abilities": [
      "Inner Focus"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 160,
      "atk": 156,
      "def": 100,
      "spa": 81,
      "spd": 100,
      "spe": 182
    },
    "lvl100Stats": {
      "hp": 311,
      "atk": 306,
      "def": 196,
      "spa": 158,
      "spd": 196,
      "spe": 359
    },
    "fixedIV": null
  },
  "Dugtrio 1": {
    "species": "Dugtrio",
    "nature": "Adamant",
    "item": "Soft Sand",
    "moves": [
      "Earthquake",
      "Tri Attack",
      "Slash",
      "Sand Tomb"
    ],
    "abilities": [
      "Sand Veil",
      "Arena Trap"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 110,
      "atk": 145,
      "def": 70,
      "spa": 63,
      "spd": 90,
      "spe": 172
    },
    "lvl100Stats": {
      "hp": 211,
      "atk": 284,
      "def": 136,
      "spa": 122,
      "spd": 176,
      "spe": 339
    },
    "fixedIV": null
  },
  "Sceptile 1": {
    "species": "Sceptile",
    "nature": "Modest",
    "item": "Leftovers",
    "moves": [
      "Leaf Blade",
      "Leech Seed",
      "Aerial Ace",
      "Detect"
    ],
    "abilities": [
      "Overgrow"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 145,
      "atk": 94,
      "def": 85,
      "spa": 172,
      "spd": 105,
      "spe": 172
    },
    "lvl100Stats": {
      "hp": 281,
      "atk": 185,
      "def": 166,
      "spa": 339,
      "spd": 206,
      "spe": 339
    },
    "fixedIV": null
  },
  "Dugtrio 2": {
    "species": "Dugtrio",
    "nature": "Adamant",
    "item": "King's Rock",
    "moves": [
      "Earthquake",
      "AncientPower",
      "Aerial Ace",
      "Tri Attack"
    ],
    "abilities": [
      "Sand Veil",
      "Arena Trap"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 110,
      "atk": 145,
      "def": 70,
      "spa": 63,
      "spd": 90,
      "spe": 172
    },
    "lvl100Stats": {
      "hp": 211,
      "atk": 284,
      "def": 136,
      "spa": 122,
      "spd": 176,
      "spe": 339
    },
    "fixedIV": null
  },
  "Sceptile 2": {
    "species": "Sceptile",
    "nature": "Modest",
    "item": "Lum Berry",
    "moves": [
      "Leaf Blade",
      "ThunderPunch",
      "Attract",
      "Double Team"
    ],
    "abilities": [
      "Overgrow"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 145,
      "atk": 94,
      "def": 85,
      "spa": 172,
      "spd": 105,
      "spe": 172
    },
    "lvl100Stats": {
      "hp": 281,
      "atk": 185,
      "def": 166,
      "spa": 339,
      "spd": 206,
      "spe": 339
    },
    "fixedIV": null
  },
  "Dugtrio 3": {
    "species": "Dugtrio",
    "nature": "Adamant",
    "item": "King's Rock",
    "moves": [
      "Earthquake",
      "Double-Edge",
      "Sludge Bomb",
      "Fissure"
    ],
    "abilities": [
      "Sand Veil",
      "Arena Trap"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 110,
      "atk": 145,
      "def": 70,
      "spa": 63,
      "spd": 90,
      "spe": 172
    },
    "lvl100Stats": {
      "hp": 211,
      "atk": 284,
      "def": 136,
      "spa": 122,
      "spd": 176,
      "spe": 339
    },
    "fixedIV": null
  },
  "Dugtrio 4": {
    "species": "Dugtrio",
    "nature": "Adamant",
    "item": "King's Rock",
    "moves": [
      "Earthquake",
      "Double-Edge",
      "Rock Slide",
      "Fissure"
    ],
    "abilities": [
      "Sand Veil",
      "Arena Trap"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 110,
      "atk": 145,
      "def": 70,
      "spa": 63,
      "spd": 90,
      "spe": 172
    },
    "lvl100Stats": {
      "hp": 211,
      "atk": 284,
      "def": 136,
      "spa": 122,
      "spd": 176,
      "spe": 339
    },
    "fixedIV": null
  },
  "Sceptile 4": {
    "species": "Sceptile",
    "nature": "Modest",
    "item": "BrightPowder",
    "moves": [
      "Leaf Blade",
      "Dragon Claw",
      "Crunch",
      "ThunderPunch"
    ],
    "abilities": [
      "Overgrow"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 145,
      "atk": 94,
      "def": 85,
      "spa": 172,
      "spd": 105,
      "spe": 172
    },
    "lvl100Stats": {
      "hp": 281,
      "atk": 185,
      "def": 166,
      "spa": 339,
      "spd": 206,
      "spe": 339
    },
    "fixedIV": null
  },
  "Aerodactyl 1": {
    "species": "Aerodactyl",
    "nature": "Adamant",
    "item": "King's Rock",
    "moves": [
      "AncientPower",
      "DragonBreath",
      "Aerial Ace",
      "Roar"
    ],
    "abilities": [
      "Rock Head",
      "Pressure"
    ],
    "evs": {
      "hp": 170,
      "atk": 170,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 170
    },
    "lvl50Stats": {
      "hp": 176,
      "atk": 161,
      "def": 85,
      "spa": 72,
      "spd": 95,
      "spe": 171
    },
    "lvl100Stats": {
      "hp": 343,
      "atk": 316,
      "def": 166,
      "spa": 140,
      "spd": 186,
      "spe": 338
    },
    "fixedIV": null
  },
  "Aerodactyl 2": {
    "species": "Aerodactyl",
    "nature": "Adamant",
    "item": "Choice Band",
    "moves": [
      "Hyper Beam",
      "Earthquake",
      "Aerial Ace",
      "AncientPower"
    ],
    "abilities": [
      "Rock Head",
      "Pressure"
    ],
    "evs": {
      "hp": 170,
      "atk": 170,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 170
    },
    "lvl50Stats": {
      "hp": 176,
      "atk": 161,
      "def": 85,
      "spa": 72,
      "spd": 95,
      "spe": 171
    },
    "lvl100Stats": {
      "hp": 343,
      "atk": 316,
      "def": 166,
      "spa": 140,
      "spd": 186,
      "spe": 338
    },
    "fixedIV": null
  },
  "Starmie 3": {
    "species": "Starmie",
    "nature": "Modest",
    "item": "Lum Berry",
    "moves": [
      "Surf",
      "Psychic",
      "Thunderbolt",
      "Ice Beam"
    ],
    "abilities": [
      "Illuminate",
      "Natural Cure"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 135,
      "atk": 85,
      "def": 105,
      "spa": 167,
      "spd": 105,
      "spe": 167
    },
    "lvl100Stats": {
      "hp": 261,
      "atk": 167,
      "def": 206,
      "spa": 328,
      "spd": 206,
      "spe": 329
    },
    "fixedIV": null
  },
  "Starmie 4": {
    "species": "Starmie",
    "nature": "Modest",
    "item": "Lum Berry",
    "moves": [
      "Psychic",
      "Thunderbolt",
      "Ice Beam",
      "Recover"
    ],
    "abilities": [
      "Illuminate",
      "Natural Cure"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 135,
      "atk": 85,
      "def": 105,
      "spa": 167,
      "spd": 105,
      "spe": 167
    },
    "lvl100Stats": {
      "hp": 261,
      "atk": 167,
      "def": 206,
      "spa": 328,
      "spd": 206,
      "spe": 329
    },
    "fixedIV": null
  },
  "Raikou 1": {
    "species": "Raikou",
    "nature": "Modest",
    "item": "Chesto Berry",
    "moves": [
      "Thunderbolt",
      "Thunder Wave",
      "Calm Mind",
      "Rest"
    ],
    "abilities": [
      "Pressure"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 165,
      "atk": 94,
      "def": 95,
      "spa": 183,
      "spd": 120,
      "spe": 167
    },
    "lvl100Stats": {
      "hp": 321,
      "atk": 185,
      "def": 186,
      "spa": 361,
      "spd": 236,
      "spe": 329
    },
    "fixedIV": null
  },
  "Raikou 2": {
    "species": "Raikou",
    "nature": "Modest",
    "item": "BrightPowder",
    "moves": [
      "Thunder",
      "Rain Dance",
      "Double Team",
      "Reflect"
    ],
    "abilities": [
      "Pressure"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 165,
      "atk": 94,
      "def": 95,
      "spa": 183,
      "spd": 120,
      "spe": 167
    },
    "lvl100Stats": {
      "hp": 321,
      "atk": 185,
      "def": 186,
      "spa": 361,
      "spd": 236,
      "spe": 329
    },
    "fixedIV": null
  },
  "Raikou 3": {
    "species": "Raikou",
    "nature": "Modest",
    "item": "King's Rock",
    "moves": [
      "Thunderbolt",
      "Thunder Wave",
      "Quick Attack",
      "Roar"
    ],
    "abilities": [
      "Pressure"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 165,
      "atk": 94,
      "def": 95,
      "spa": 183,
      "spd": 120,
      "spe": 167
    },
    "lvl100Stats": {
      "hp": 321,
      "atk": 185,
      "def": 186,
      "spa": 361,
      "spd": 236,
      "spe": 329
    },
    "fixedIV": null
  },
  "Raikou 4": {
    "species": "Raikou",
    "nature": "Modest",
    "item": "Lum Berry",
    "moves": [
      "Thunderbolt",
      "Bite",
      "Thunder Wave",
      "Reflect"
    ],
    "abilities": [
      "Pressure"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 165,
      "atk": 94,
      "def": 95,
      "spa": 183,
      "spd": 120,
      "spe": 167
    },
    "lvl100Stats": {
      "hp": 321,
      "atk": 185,
      "def": 186,
      "spa": 361,
      "spd": 236,
      "spe": 329
    },
    "fixedIV": null
  },
  "Starmie 5": {
    "species": "Starmie",
    "nature": "Modest",
    "item": "Lum Berry",
    "moves": [
      "Surf",
      "Psychic",
      "Recover",
      "Light Screen"
    ],
    "abilities": [
      "Illuminate",
      "Natural Cure"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 135,
      "atk": 85,
      "def": 105,
      "spa": 167,
      "spd": 105,
      "spe": 167
    },
    "lvl100Stats": {
      "hp": 261,
      "atk": 167,
      "def": 206,
      "spa": 328,
      "spd": 206,
      "spe": 329
    },
    "fixedIV": null
  },
  "Starmie 7": {
    "species": "Starmie",
    "nature": "Modest",
    "item": "BrightPowder",
    "moves": [
      "Psychic",
      "Ice Beam",
      "Cosmic Power",
      "Recover"
    ],
    "abilities": [
      "Illuminate",
      "Natural Cure"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 135,
      "atk": 85,
      "def": 105,
      "spa": 167,
      "spd": 105,
      "spe": 167
    },
    "lvl100Stats": {
      "hp": 261,
      "atk": 167,
      "def": 206,
      "spa": 328,
      "spd": 206,
      "spe": 329
    },
    "fixedIV": null
  },
  "Starmie 8": {
    "species": "Starmie",
    "nature": "Modest",
    "item": "BrightPowder",
    "moves": [
      "Surf",
      "Thunderbolt",
      "Cosmic Power",
      "Recover"
    ],
    "abilities": [
      "Illuminate",
      "Natural Cure"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 135,
      "atk": 85,
      "def": 105,
      "spa": 167,
      "spd": 105,
      "spe": 167
    },
    "lvl100Stats": {
      "hp": 261,
      "atk": 167,
      "def": 206,
      "spa": 328,
      "spd": 206,
      "spe": 329
    },
    "fixedIV": null
  },
  "Raikou 5": {
    "species": "Raikou",
    "nature": "Modest",
    "item": "BrightPowder",
    "moves": [
      "Thunderbolt",
      "Double-Edge",
      "Roar",
      "Reflect"
    ],
    "abilities": [
      "Pressure"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 165,
      "atk": 94,
      "def": 95,
      "spa": 183,
      "spd": 120,
      "spe": 167
    },
    "lvl100Stats": {
      "hp": 321,
      "atk": 185,
      "def": 186,
      "spa": 361,
      "spd": 236,
      "spe": 329
    },
    "fixedIV": null
  },
  "Gengar 1": {
    "species": "Gengar",
    "nature": "Timid",
    "item": "Leftovers",
    "moves": [
      "Dream Eater",
      "Hypnosis",
      "Confuse Ray",
      "Attract"
    ],
    "abilities": [
      "Levitate"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 0,
      "spa": 170,
      "spd": 0,
      "spe": 170
    },
    "lvl50Stats": {
      "hp": 156,
      "atk": 76,
      "def": 80,
      "spa": 171,
      "spd": 95,
      "spe": 166
    },
    "lvl100Stats": {
      "hp": 303,
      "atk": 149,
      "def": 156,
      "spa": 338,
      "spd": 186,
      "spe": 327
    },
    "fixedIV": null
  },
  "Tauros 1": {
    "species": "Tauros",
    "nature": "Adamant",
    "item": "Persim Berry",
    "moves": [
      "Earthquake",
      "Thrash",
      "Swagger",
      "Facade"
    ],
    "abilities": [
      "Intimidate"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 150,
      "atk": 167,
      "def": 115,
      "spa": 54,
      "spd": 90,
      "spe": 162
    },
    "lvl100Stats": {
      "hp": 291,
      "atk": 328,
      "def": 226,
      "spa": 104,
      "spd": 176,
      "spe": 319
    },
    "fixedIV": null
  },
  "Gengar 2": {
    "species": "Gengar",
    "nature": "Adamant",
    "item": "Leftovers",
    "moves": [
      "Sludge Bomb",
      "Shadow Ball",
      "Confuse Ray",
      "Will-O-Wisp"
    ],
    "abilities": [
      "Levitate"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 135,
      "atk": 128,
      "def": 80,
      "spa": 135,
      "spd": 95,
      "spe": 162
    },
    "lvl100Stats": {
      "hp": 261,
      "atk": 251,
      "def": 156,
      "spa": 266,
      "spd": 186,
      "spe": 319
    },
    "fixedIV": null
  },
  "Espeon 2": {
    "species": "Espeon",
    "nature": "Docile",
    "item": "Chesto Berry",
    "moves": [
      "Psychic",
      "Shadow Ball",
      "Calm Mind",
      "Rest"
    ],
    "abilities": [
      "Synchronize"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 140,
      "atk": 117,
      "def": 80,
      "spa": 150,
      "spd": 115,
      "spe": 162
    },
    "lvl100Stats": {
      "hp": 271,
      "atk": 229,
      "def": 156,
      "spa": 296,
      "spd": 226,
      "spe": 319
    },
    "fixedIV": null
  },
  "Gengar 3": {
    "species": "Gengar",
    "nature": "Modest",
    "item": "Quick Claw",
    "moves": [
      "Psychic",
      "Thunderbolt",
      "Giga Drain",
      "Skill Swap"
    ],
    "abilities": [
      "Levitate"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 135,
      "atk": 76,
      "def": 80,
      "spa": 200,
      "spd": 95,
      "spe": 162
    },
    "lvl100Stats": {
      "hp": 261,
      "atk": 149,
      "def": 156,
      "spa": 394,
      "spd": 186,
      "spe": 319
    },
    "fixedIV": null
  },
  "Espeon 3": {
    "species": "Espeon",
    "nature": "Modest",
    "item": "Lum Berry",
    "moves": [
      "Psychic",
      "Bite",
      "Wish",
      "Reflect"
    ],
    "abilities": [
      "Synchronize"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 140,
      "atk": 76,
      "def": 80,
      "spa": 200,
      "spd": 115,
      "spe": 162
    },
    "lvl100Stats": {
      "hp": 271,
      "atk": 149,
      "def": 156,
      "spa": 394,
      "spd": 226,
      "spe": 319
    },
    "fixedIV": null
  },
  "Gengar 4": {
    "species": "Gengar",
    "nature": "Modest",
    "item": "Lum Berry",
    "moves": [
      "Psychic",
      "Fire Punch",
      "Ice Punch",
      "Destiny Bond"
    ],
    "abilities": [
      "Levitate"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 135,
      "atk": 76,
      "def": 80,
      "spa": 200,
      "spd": 95,
      "spe": 162
    },
    "lvl100Stats": {
      "hp": 261,
      "atk": 149,
      "def": 156,
      "spa": 394,
      "spd": 186,
      "spe": 319
    },
    "fixedIV": null
  },
  "Espeon 4": {
    "species": "Espeon",
    "nature": "Modest",
    "item": "BrightPowder",
    "moves": [
      "Psychic",
      "Bite",
      "Attract",
      "Calm Mind"
    ],
    "abilities": [
      "Synchronize"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 140,
      "atk": 76,
      "def": 80,
      "spa": 200,
      "spd": 115,
      "spe": 162
    },
    "lvl100Stats": {
      "hp": 271,
      "atk": 149,
      "def": 156,
      "spa": 394,
      "spd": 226,
      "spe": 319
    },
    "fixedIV": null
  },
  "Gengar 5": {
    "species": "Gengar",
    "nature": "Modest",
    "item": "BrightPowder",
    "moves": [
      "Psychic",
      "Shadow Ball",
      "Thunderbolt",
      "Fire Punch"
    ],
    "abilities": [
      "Levitate"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 135,
      "atk": 76,
      "def": 80,
      "spa": 200,
      "spd": 95,
      "spe": 162
    },
    "lvl100Stats": {
      "hp": 261,
      "atk": 149,
      "def": 156,
      "spa": 394,
      "spd": 186,
      "spe": 319
    },
    "fixedIV": null
  },
  "Gengar 6": {
    "species": "Gengar",
    "nature": "Modest",
    "item": "BrightPowder",
    "moves": [
      "Psychic",
      "Shadow Ball",
      "Thunderbolt",
      "Ice Punch"
    ],
    "abilities": [
      "Levitate"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 135,
      "atk": 76,
      "def": 80,
      "spa": 200,
      "spd": 95,
      "spe": 162
    },
    "lvl100Stats": {
      "hp": 261,
      "atk": 149,
      "def": 156,
      "spa": 394,
      "spd": 186,
      "spe": 319
    },
    "fixedIV": null
  },
  "Gengar 7": {
    "species": "Gengar",
    "nature": "Modest",
    "item": "Lum Berry",
    "moves": [
      "Psychic",
      "Thunderbolt",
      "Fire Punch",
      "Destiny Bond"
    ],
    "abilities": [
      "Levitate"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 135,
      "atk": 76,
      "def": 80,
      "spa": 200,
      "spd": 95,
      "spe": 162
    },
    "lvl100Stats": {
      "hp": 261,
      "atk": 149,
      "def": 156,
      "spa": 394,
      "spd": 186,
      "spe": 319
    },
    "fixedIV": null
  },
  "Gengar 8": {
    "species": "Gengar",
    "nature": "Modest",
    "item": "Lum Berry",
    "moves": [
      "Psychic",
      "Thunderbolt",
      "Ice Punch",
      "Destiny Bond"
    ],
    "abilities": [
      "Levitate"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 135,
      "atk": 76,
      "def": 80,
      "spa": 200,
      "spd": 95,
      "spe": 162
    },
    "lvl100Stats": {
      "hp": 261,
      "atk": 149,
      "def": 156,
      "spa": 394,
      "spd": 186,
      "spe": 319
    },
    "fixedIV": null
  },
  "Spenser Silver Crobat": {
    "species": "Crobat",
    "nature": "Adamant",
    "item": "BrightPowder",
    "moves": [
      "Confuse Ray",
      "Double Team",
      "Toxic",
      "Fly"
    ],
    "abilities": [
      "Inner Focus"
    ],
    "evs": {
      "hp": 152,
      "atk": 0,
      "def": 0,
      "spa": 100,
      "spd": 106,
      "spe": 152
    },
    "lvl50Stats": {
      "hp": 172,
      "atk": 113,
      "def": 93,
      "spa": 85,
      "spd": 106,
      "spe": 162
    },
    "lvl100Stats": {
      "hp": 334,
      "atk": 221,
      "def": 181,
      "spa": 167,
      "spd": 207,
      "spe": 319
    },
    "fixedIV": 16
  },
  "Sceptile 3": {
    "species": "Sceptile",
    "nature": "Docile",
    "item": "Scope Lens",
    "moves": [
      "Leaf Blade",
      "Earthquake",
      "Crush Claw",
      "Aerial Ace"
    ],
    "abilities": [
      "Overgrow"
    ],
    "evs": {
      "hp": 0,
      "atk": 170,
      "def": 0,
      "spa": 170,
      "spd": 0,
      "spe": 170
    },
    "lvl50Stats": {
      "hp": 145,
      "atk": 126,
      "def": 85,
      "spa": 146,
      "spd": 105,
      "spe": 161
    },
    "lvl100Stats": {
      "hp": 281,
      "atk": 248,
      "def": 166,
      "spa": 288,
      "spd": 206,
      "spe": 318
    },
    "fixedIV": null
  },
  "Electrode 2": {
    "species": "Electrode",
    "nature": "Modest",
    "item": "BrightPowder",
    "moves": [
      "Thunder",
      "Rain Dance",
      "Double Team",
      "Swagger"
    ],
    "abilities": [
      "Soundproof",
      "Static"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 156,
      "atk": 63,
      "def": 111,
      "spa": 110,
      "spd": 121,
      "spe": 160
    },
    "lvl100Stats": {
      "hp": 303,
      "atk": 122,
      "def": 218,
      "spa": 215,
      "spd": 238,
      "spe": 316
    },
    "fixedIV": null
  },
  "Electrode 3": {
    "species": "Electrode",
    "nature": "Naughty",
    "item": "Liechi Berry",
    "moves": [
      "Explosion",
      "Thunderbolt",
      "Thunder Wave",
      "Endure"
    ],
    "abilities": [
      "Soundproof",
      "Static"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 135,
      "atk": 112,
      "def": 90,
      "spa": 132,
      "spd": 90,
      "spe": 160
    },
    "lvl100Stats": {
      "hp": 261,
      "atk": 218,
      "def": 176,
      "spa": 259,
      "spd": 176,
      "spe": 316
    },
    "fixedIV": null
  },
  "Electrode 4": {
    "species": "Electrode",
    "nature": "Naughty",
    "item": "Lum Berry",
    "moves": [
      "Explosion",
      "Thunderbolt",
      "Thunder Wave",
      "Mirror Coat"
    ],
    "abilities": [
      "Soundproof",
      "Static"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 135,
      "atk": 112,
      "def": 90,
      "spa": 132,
      "spd": 90,
      "spe": 160
    },
    "lvl100Stats": {
      "hp": 261,
      "atk": 218,
      "def": 176,
      "spa": 259,
      "spd": 176,
      "spe": 316
    },
    "fixedIV": null
  },
  "Manectric 1": {
    "species": "Manectric",
    "nature": "Modest",
    "item": "Magnet",
    "moves": [
      "Thunderbolt",
      "Flash",
      "Quick Attack",
      "Roar"
    ],
    "abilities": [
      "Static",
      "Lightningrod"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 145,
      "atk": 85,
      "def": 80,
      "spa": 172,
      "spd": 80,
      "spe": 157
    },
    "lvl100Stats": {
      "hp": 281,
      "atk": 167,
      "def": 156,
      "spa": 339,
      "spd": 156,
      "spe": 309
    },
    "fixedIV": null
  },
  "Manectric 2": {
    "species": "Manectric",
    "nature": "Modest",
    "item": "Petaya Berry",
    "moves": [
      "Thunder",
      "Rain Dance",
      "Crunch",
      "Roar"
    ],
    "abilities": [
      "Static",
      "Lightningrod"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 145,
      "atk": 85,
      "def": 80,
      "spa": 172,
      "spd": 80,
      "spe": 157
    },
    "lvl100Stats": {
      "hp": 281,
      "atk": 167,
      "def": 156,
      "spa": 339,
      "spd": 156,
      "spe": 309
    },
    "fixedIV": null
  },
  "Manectric 3": {
    "species": "Manectric",
    "nature": "Quirky",
    "item": "Lum Berry",
    "moves": [
      "Thunderbolt",
      "Iron Tail",
      "Thunder Wave",
      "Roar"
    ],
    "abilities": [
      "Static",
      "Lightningrod"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 145,
      "atk": 95,
      "def": 80,
      "spa": 157,
      "spd": 80,
      "spe": 157
    },
    "lvl100Stats": {
      "hp": 281,
      "atk": 186,
      "def": 156,
      "spa": 309,
      "spd": 156,
      "spe": 309
    },
    "fixedIV": null
  },
  "Electabuzz 3": {
    "species": "Electabuzz",
    "nature": "Quirky",
    "item": "Lum Berry",
    "moves": [
      "Fire Punch",
      "Ice Punch",
      "Thunderbolt",
      "Cross Chop"
    ],
    "abilities": [
      "Static"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 140,
      "atk": 103,
      "def": 77,
      "spa": 147,
      "spd": 105,
      "spe": 157
    },
    "lvl100Stats": {
      "hp": 271,
      "atk": 202,
      "def": 150,
      "spa": 289,
      "spd": 206,
      "spe": 309
    },
    "fixedIV": null
  },
  "Manectric 4": {
    "species": "Manectric",
    "nature": "Modest",
    "item": "Lum Berry",
    "moves": [
      "Thunderbolt",
      "Crunch",
      "Thunder Wave",
      "Roar"
    ],
    "abilities": [
      "Static",
      "Lightningrod"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 145,
      "atk": 85,
      "def": 80,
      "spa": 172,
      "spd": 80,
      "spe": 157
    },
    "lvl100Stats": {
      "hp": 281,
      "atk": 167,
      "def": 156,
      "spa": 339,
      "spd": 156,
      "spe": 309
    },
    "fixedIV": null
  },
  "Kangaskhan 3": {
    "species": "Kangaskhan",
    "nature": "Jolly",
    "item": "Salac Berry",
    "moves": [
      "Reversal",
      "Endure",
      "Thunderbolt",
      "Earthquake"
    ],
    "abilities": [
      "Early Bird"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 180,
      "atk": 147,
      "def": 100,
      "spa": 54,
      "spd": 100,
      "spe": 156
    },
    "lvl100Stats": {
      "hp": 351,
      "atk": 289,
      "def": 196,
      "spa": 104,
      "spd": 196,
      "spe": 306
    },
    "fixedIV": null
  },
  "Anabel Silver Alakazam": {
    "species": "Alakazam",
    "nature": "Modest",
    "item": "BrightPowder",
    "moves": [
      "ThunderPunch",
      "Fire Punch",
      "Ice Punch",
      "Disable"
    ],
    "abilities": [
      "Synchronize",
      "Inner Focus"
    ],
    "evs": {
      "hp": 106,
      "atk": 0,
      "def": 152,
      "spa": 100,
      "spd": 0,
      "spe": 152
    },
    "lvl50Stats": {
      "hp": 140,
      "atk": 60,
      "def": 81,
      "spa": 180,
      "spd": 102,
      "spe": 156
    },
    "lvl100Stats": {
      "hp": 270,
      "atk": 116,
      "def": 157,
      "spa": 356,
      "spd": 199,
      "spe": 307
    },
    "fixedIV": 24
  },
  "Fearow 1": {
    "species": "Fearow",
    "nature": "Adamant",
    "item": "Sharp Beak",
    "moves": [
      "Drill Peck",
      "Tri Attack",
      "Facade",
      "Mud-Slap"
    ],
    "abilities": [
      "Keen Eye"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 140,
      "atk": 156,
      "def": 85,
      "spa": 73,
      "spd": 81,
      "spe": 152
    },
    "lvl100Stats": {
      "hp": 271,
      "atk": 306,
      "def": 166,
      "spa": 142,
      "spd": 158,
      "spe": 299
    },
    "fixedIV": null
  },
  "Dodrio 1": {
    "species": "Dodrio",
    "nature": "Adamant",
    "item": "Chesto Berry",
    "moves": [
      "Drill Peck",
      "Tri Attack",
      "Sleep Talk",
      "Rest"
    ],
    "abilities": [
      "Run Away",
      "Early Bird"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 135,
      "atk": 178,
      "def": 90,
      "spa": 72,
      "spd": 80,
      "spe": 152
    },
    "lvl100Stats": {
      "hp": 261,
      "atk": 350,
      "def": 176,
      "spa": 140,
      "spd": 156,
      "spe": 299
    },
    "fixedIV": null
  },
  "Ninetales 1": {
    "species": "Ninetales",
    "nature": "Modest",
    "item": "Rawst Berry",
    "moves": [
      "Flamethrower",
      "Roar",
      "Confuse Ray",
      "Will-O-Wisp"
    ],
    "abilities": [
      "Flash Fire"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 148,
      "atk": 86,
      "def": 95,
      "spa": 146,
      "spd": 120,
      "spe": 152
    },
    "lvl100Stats": {
      "hp": 287,
      "atk": 169,
      "def": 186,
      "spa": 287,
      "spd": 236,
      "spe": 299
    },
    "fixedIV": null
  },
  "Flygon 1": {
    "species": "Flygon",
    "nature": "Adamant",
    "item": "BrightPowder",
    "moves": [
      "Earthquake",
      "Steel Wing",
      "Faint Attack",
      "Facade"
    ],
    "abilities": [
      "Levitate"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 155,
      "atk": 167,
      "def": 100,
      "spa": 90,
      "spd": 100,
      "spe": 152
    },
    "lvl100Stats": {
      "hp": 301,
      "atk": 328,
      "def": 196,
      "spa": 176,
      "spd": 196,
      "spe": 299
    },
    "fixedIV": null
  },
  "Charizard 1": {
    "species": "Charizard",
    "nature": "Modest",
    "item": "Focus Band",
    "moves": [
      "Fire Blast",
      "Sunny Day",
      "Roar",
      "Scary Face"
    ],
    "abilities": [
      "Blaze"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 153,
      "atk": 94,
      "def": 98,
      "spa": 177,
      "spd": 105,
      "spe": 152
    },
    "lvl100Stats": {
      "hp": 297,
      "atk": 183,
      "def": 192,
      "spa": 348,
      "spd": 206,
      "spe": 299
    },
    "fixedIV": null
  },
  "Typhlosion 1": {
    "species": "Typhlosion",
    "nature": "Modest",
    "item": "Focus Band",
    "moves": [
      "Fire Blast",
      "Sunny Day",
      "SmokeScreen",
      "Roar"
    ],
    "abilities": [
      "Blaze"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 153,
      "atk": 94,
      "def": 98,
      "spa": 177,
      "spd": 105,
      "spe": 152
    },
    "lvl100Stats": {
      "hp": 297,
      "atk": 183,
      "def": 192,
      "spa": 348,
      "spd": 206,
      "spe": 299
    },
    "fixedIV": null
  },
  "Salamence 1": {
    "species": "Salamence",
    "nature": "Hardy",
    "item": "King's Rock",
    "moves": [
      "Dragon Claw",
      "Aerial Ace",
      "Headbutt",
      "Rock Slide"
    ],
    "abilities": [
      "Intimidate"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 170,
      "atk": 187,
      "def": 100,
      "spa": 130,
      "spd": 100,
      "spe": 152
    },
    "lvl100Stats": {
      "hp": 331,
      "atk": 369,
      "def": 196,
      "spa": 256,
      "spd": 196,
      "spe": 299
    },
    "fixedIV": null
  },
  "Fearow 2": {
    "species": "Fearow",
    "nature": "Adamant",
    "item": "Focus Band",
    "moves": [
      "Drill Peck",
      "Tri Attack",
      "Attract",
      "Pursuit"
    ],
    "abilities": [
      "Keen Eye"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 140,
      "atk": 156,
      "def": 85,
      "spa": 73,
      "spd": 81,
      "spe": 152
    },
    "lvl100Stats": {
      "hp": 271,
      "atk": 306,
      "def": 166,
      "spa": 142,
      "spd": 158,
      "spe": 299
    },
    "fixedIV": null
  },
  "Dodrio 2": {
    "species": "Dodrio",
    "nature": "Adamant",
    "item": "King's Rock",
    "moves": [
      "Drill Peck",
      "Double-Edge",
      "Faint Attack",
      "Protect"
    ],
    "abilities": [
      "Run Away",
      "Early Bird"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 135,
      "atk": 178,
      "def": 90,
      "spa": 72,
      "spd": 80,
      "spe": 152
    },
    "lvl100Stats": {
      "hp": 261,
      "atk": 350,
      "def": 176,
      "spa": 140,
      "spd": 156,
      "spe": 299
    },
    "fixedIV": null
  },
  "Raichu 2": {
    "species": "Raichu",
    "nature": "Adamant",
    "item": "Lum Berry",
    "moves": [
      "Thunderbolt",
      "Reversal",
      "Endure",
      "Agility"
    ],
    "abilities": [
      "Static"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 135,
      "atk": 156,
      "def": 75,
      "spa": 99,
      "spd": 100,
      "spe": 152
    },
    "lvl100Stats": {
      "hp": 261,
      "atk": 306,
      "def": 146,
      "spa": 194,
      "spd": 196,
      "spe": 299
    },
    "fixedIV": null
  },
  "Ninetales 2": {
    "species": "Ninetales",
    "nature": "Quirky",
    "item": "Lum Berry",
    "moves": [
      "Heat Wave",
      "Body Slam",
      "Grudge",
      "Sunny Day"
    ],
    "abilities": [
      "Flash Fire"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 148,
      "atk": 96,
      "def": 95,
      "spa": 133,
      "spd": 120,
      "spe": 152
    },
    "lvl100Stats": {
      "hp": 287,
      "atk": 188,
      "def": 186,
      "spa": 261,
      "spd": 236,
      "spe": 299
    },
    "fixedIV": null
  },
  "Flygon 2": {
    "species": "Flygon",
    "nature": "Modest",
    "item": "BrightPowder",
    "moves": [
      "SolarBeam",
      "Fire Blast",
      "Crunch",
      "Sunny Day"
    ],
    "abilities": [
      "Levitate"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 155,
      "atk": 108,
      "def": 100,
      "spa": 145,
      "spd": 100,
      "spe": 152
    },
    "lvl100Stats": {
      "hp": 301,
      "atk": 212,
      "def": 196,
      "spa": 284,
      "spd": 196,
      "spe": 299
    },
    "fixedIV": null
  },
  "Charizard 2": {
    "species": "Charizard",
    "nature": "Adamant",
    "item": "BrightPowder",
    "moves": [
      "Earthquake",
      "Aerial Ace",
      "Dragon Dance",
      "SmokeScreen"
    ],
    "abilities": [
      "Blaze"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 153,
      "atk": 149,
      "def": 98,
      "spa": 116,
      "spd": 105,
      "spe": 152
    },
    "lvl100Stats": {
      "hp": 297,
      "atk": 293,
      "def": 192,
      "spa": 228,
      "spd": 206,
      "spe": 299
    },
    "fixedIV": null
  },
  "Fearow 3": {
    "species": "Fearow",
    "nature": "Hardy",
    "item": "Scope Lens",
    "moves": [
      "Drill Peck",
      "Return",
      "Steel Wing",
      "Faint Attack"
    ],
    "abilities": [
      "Keen Eye"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 140,
      "atk": 142,
      "def": 85,
      "spa": 81,
      "spd": 81,
      "spe": 152
    },
    "lvl100Stats": {
      "hp": 271,
      "atk": 279,
      "def": 166,
      "spa": 158,
      "spd": 158,
      "spe": 299
    },
    "fixedIV": null
  },
  "Dodrio 3": {
    "species": "Dodrio",
    "nature": "Adamant",
    "item": "Lum Berry",
    "moves": [
      "Double-Edge",
      "Drill Peck",
      "Steel Wing",
      "Faint Attack"
    ],
    "abilities": [
      "Run Away",
      "Early Bird"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 135,
      "atk": 178,
      "def": 90,
      "spa": 72,
      "spd": 80,
      "spe": 152
    },
    "lvl100Stats": {
      "hp": 261,
      "atk": 350,
      "def": 176,
      "spa": 140,
      "spd": 156,
      "spe": 299
    },
    "fixedIV": null
  },
  "Raichu 3": {
    "species": "Raichu",
    "nature": "Docile",
    "item": "Cheri Berry",
    "moves": [
      "Thunder",
      "Rain Dance",
      "Iron Tail",
      "Attract"
    ],
    "abilities": [
      "Static"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 135,
      "atk": 110,
      "def": 75,
      "spa": 142,
      "spd": 100,
      "spe": 152
    },
    "lvl100Stats": {
      "hp": 261,
      "atk": 216,
      "def": 146,
      "spa": 279,
      "spd": 196,
      "spe": 299
    },
    "fixedIV": null
  },
  "Ninetales 3": {
    "species": "Ninetales",
    "nature": "Quirky",
    "item": "BrightPowder",
    "moves": [
      "Fire Blast",
      "Iron Tail",
      "Confuse Ray",
      "Attract"
    ],
    "abilities": [
      "Flash Fire"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 148,
      "atk": 96,
      "def": 95,
      "spa": 133,
      "spd": 120,
      "spe": 152
    },
    "lvl100Stats": {
      "hp": 287,
      "atk": 188,
      "def": 186,
      "spa": 261,
      "spd": 236,
      "spe": 299
    },
    "fixedIV": null
  },
  "Charizard 3": {
    "species": "Charizard",
    "nature": "Modest",
    "item": "Lum Berry",
    "moves": [
      "Flamethrower",
      "Dragon Claw",
      "Bite",
      "Brick Break"
    ],
    "abilities": [
      "Blaze"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 153,
      "atk": 94,
      "def": 98,
      "spa": 177,
      "spd": 105,
      "spe": 152
    },
    "lvl100Stats": {
      "hp": 297,
      "atk": 183,
      "def": 192,
      "spa": 348,
      "spd": 206,
      "spe": 299
    },
    "fixedIV": null
  },
  "Typhlosion 3": {
    "species": "Typhlosion",
    "nature": "Adamant",
    "item": "Salac Berry",
    "moves": [
      "Earthquake",
      "Overheat",
      "Endure",
      "Reversal"
    ],
    "abilities": [
      "Blaze"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 153,
      "atk": 149,
      "def": 98,
      "spa": 116,
      "spd": 105,
      "spe": 152
    },
    "lvl100Stats": {
      "hp": 297,
      "atk": 293,
      "def": 192,
      "spa": 228,
      "spd": 206,
      "spe": 299
    },
    "fixedIV": null
  },
  "Dodrio 4": {
    "species": "Dodrio",
    "nature": "Adamant",
    "item": "Salac Berry",
    "moves": [
      "Flail",
      "Endure",
      "Drill Peck",
      "Facade"
    ],
    "abilities": [
      "Run Away",
      "Early Bird"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 135,
      "atk": 178,
      "def": 90,
      "spa": 72,
      "spd": 80,
      "spe": 152
    },
    "lvl100Stats": {
      "hp": 261,
      "atk": 350,
      "def": 176,
      "spa": 140,
      "spd": 156,
      "spe": 299
    },
    "fixedIV": null
  },
  "Ninetales 4": {
    "species": "Ninetales",
    "nature": "Quirky",
    "item": "White Herb",
    "moves": [
      "Overheat",
      "Double-Edge",
      "Confuse Ray",
      "Will-O-Wisp"
    ],
    "abilities": [
      "Flash Fire"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 148,
      "atk": 96,
      "def": 95,
      "spa": 133,
      "spd": 120,
      "spe": 152
    },
    "lvl100Stats": {
      "hp": 287,
      "atk": 188,
      "def": 186,
      "spa": 261,
      "spd": 236,
      "spe": 299
    },
    "fixedIV": null
  },
  "Zapdos 1": {
    "species": "Zapdos",
    "nature": "Docile",
    "item": "Lum Berry",
    "moves": [
      "Thunderbolt",
      "Drill Peck",
      "Thunder Wave",
      "Roar"
    ],
    "abilities": [
      "Pressure"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 165,
      "atk": 110,
      "def": 105,
      "spa": 177,
      "spd": 110,
      "spe": 152
    },
    "lvl100Stats": {
      "hp": 321,
      "atk": 216,
      "def": 206,
      "spa": 349,
      "spd": 216,
      "spe": 299
    },
    "fixedIV": null
  },
  "Entei 1": {
    "species": "Entei",
    "nature": "Modest",
    "item": "Chesto Berry",
    "moves": [
      "Flamethrower",
      "Double Team",
      "Calm Mind",
      "Rest"
    ],
    "abilities": [
      "Pressure"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 190,
      "atk": 121,
      "def": 105,
      "spa": 156,
      "spd": 95,
      "spe": 152
    },
    "lvl100Stats": {
      "hp": 371,
      "atk": 239,
      "def": 206,
      "spa": 306,
      "spd": 186,
      "spe": 299
    },
    "fixedIV": null
  },
  "Zapdos 2": {
    "species": "Zapdos",
    "nature": "Docile",
    "item": "BrightPowder",
    "moves": [
      "Thunder",
      "Rain Dance",
      "Drill Peck",
      "Double Team"
    ],
    "abilities": [
      "Pressure"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 165,
      "atk": 142,
      "def": 105,
      "spa": 145,
      "spd": 110,
      "spe": 152
    },
    "lvl100Stats": {
      "hp": 321,
      "atk": 279,
      "def": 206,
      "spa": 286,
      "spd": 216,
      "spe": 299
    },
    "fixedIV": null
  },
  "Entei 2": {
    "species": "Entei",
    "nature": "Modest",
    "item": "BrightPowder",
    "moves": [
      "Fire Blast",
      "Sunny Day",
      "SolarBeam",
      "Reflect"
    ],
    "abilities": [
      "Pressure"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 190,
      "atk": 121,
      "def": 105,
      "spa": 156,
      "spd": 95,
      "spe": 152
    },
    "lvl100Stats": {
      "hp": 371,
      "atk": 239,
      "def": 206,
      "spa": 306,
      "spd": 186,
      "spe": 299
    },
    "fixedIV": null
  },
  "Entei 3": {
    "species": "Entei",
    "nature": "Docile",
    "item": "Lum Berry",
    "moves": [
      "Flamethrower",
      "Double-Edge",
      "Swagger",
      "Psych Up"
    ],
    "abilities": [
      "Pressure"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 190,
      "atk": 167,
      "def": 105,
      "spa": 110,
      "spd": 95,
      "spe": 152
    },
    "lvl100Stats": {
      "hp": 371,
      "atk": 329,
      "def": 206,
      "spa": 216,
      "spd": 186,
      "spe": 299
    },
    "fixedIV": null
  },
  "Entei 4": {
    "species": "Entei",
    "nature": "Modest",
    "item": "King's Rock",
    "moves": [
      "Flamethrower",
      "Bite",
      "Double Team",
      "Reflect"
    ],
    "abilities": [
      "Pressure"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 190,
      "atk": 121,
      "def": 105,
      "spa": 156,
      "spd": 95,
      "spe": 152
    },
    "lvl100Stats": {
      "hp": 371,
      "atk": 239,
      "def": 206,
      "spa": 306,
      "spd": 186,
      "spe": 299
    },
    "fixedIV": null
  },
  "Salamence 7": {
    "species": "Salamence",
    "nature": "Modest",
    "item": "Lum Berry",
    "moves": [
      "Flamethrower",
      "Dragon Claw",
      "Crunch",
      "Brick Break"
    ],
    "abilities": [
      "Intimidate"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 170,
      "atk": 139,
      "def": 100,
      "spa": 178,
      "spd": 100,
      "spe": 152
    },
    "lvl100Stats": {
      "hp": 331,
      "atk": 275,
      "def": 196,
      "spa": 350,
      "spd": 196,
      "spe": 299
    },
    "fixedIV": null
  },
  "Salamence 8": {
    "species": "Salamence",
    "nature": "Modest",
    "item": "Leftovers",
    "moves": [
      "Flamethrower",
      "Dragon Claw",
      "Crunch",
      "Attract"
    ],
    "abilities": [
      "Intimidate"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 170,
      "atk": 139,
      "def": 100,
      "spa": 178,
      "spd": 100,
      "spe": 152
    },
    "lvl100Stats": {
      "hp": 331,
      "atk": 275,
      "def": 196,
      "spa": 350,
      "spd": 196,
      "spe": 299
    },
    "fixedIV": null
  },
  "Brandon Gold Zapdos": {
    "species": "Zapdos",
    "nature": "Mild",
    "item": "Lum Berry",
    "moves": [
      "Thunder",
      "Detect",
      "Drill Peck",
      "Light Screen"
    ],
    "abilities": [
      "Pressure"
    ],
    "evs": {
      "hp": 6,
      "atk": 0,
      "def": 252,
      "spa": 0,
      "spd": 0,
      "spe": 252
    },
    "lvl50Stats": {
      "hp": 166,
      "atk": 110,
      "def": 123,
      "spa": 160,
      "spd": 110,
      "spe": 152
    },
    "lvl100Stats": {
      "hp": 322,
      "atk": 216,
      "def": 242,
      "spa": 314,
      "spd": 216,
      "spe": 299
    },
    "fixedIV": 31
  },
  "Spenser Gold Slaking": {
    "species": "Slaking",
    "nature": "Hardy",
    "item": "Scope Lens",
    "moves": [
      "Hyper Beam",
      "Earthquake",
      "Shadow Ball",
      "Yawn"
    ],
    "abilities": [
      "Truant"
    ],
    "evs": {
      "hp": 6,
      "atk": 252,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 252
    },
    "lvl50Stats": {
      "hp": 226,
      "atk": 212,
      "def": 120,
      "spa": 115,
      "spd": 85,
      "spe": 152
    },
    "lvl100Stats": {
      "hp": 442,
      "atk": 419,
      "def": 236,
      "spa": 226,
      "spd": 166,
      "spe": 299
    },
    "fixedIV": 31
  },
  "Espeon 1": {
    "species": "Espeon",
    "nature": "Modest",
    "item": "Lum Berry",
    "moves": [
      "Psychic",
      "Charm",
      "Calm Mind",
      "Baton Pass"
    ],
    "abilities": [
      "Synchronize"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 170
    },
    "lvl50Stats": {
      "hp": 140,
      "atk": 76,
      "def": 101,
      "spa": 165,
      "spd": 136,
      "spe": 151
    },
    "lvl100Stats": {
      "hp": 271,
      "atk": 149,
      "def": 198,
      "spa": 325,
      "spd": 268,
      "spe": 298
    },
    "fixedIV": null
  },
  "Latias 8": {
    "species": "Latias",
    "nature": "Docile",
    "item": "King's Rock",
    "moves": [
      "Psychic",
      "Shadow Ball",
      "Earthquake",
      "Aerial Ace"
    ],
    "abilities": [
      "Levitate"
    ],
    "evs": {
      "hp": 0,
      "atk": 170,
      "def": 0,
      "spa": 170,
      "spd": 0,
      "spe": 170
    },
    "lvl50Stats": {
      "hp": 155,
      "atk": 121,
      "def": 110,
      "spa": 151,
      "spd": 150,
      "spe": 151
    },
    "lvl100Stats": {
      "hp": 301,
      "atk": 238,
      "def": 216,
      "spa": 298,
      "spd": 296,
      "spe": 298
    },
    "fixedIV": null
  },
  "Latios 8": {
    "species": "Latios",
    "nature": "Docile",
    "item": "King's Rock",
    "moves": [
      "Psychic",
      "Shadow Ball",
      "Earthquake",
      "Aerial Ace"
    ],
    "abilities": [
      "Levitate"
    ],
    "evs": {
      "hp": 0,
      "atk": 170,
      "def": 0,
      "spa": 170,
      "spd": 0,
      "spe": 170
    },
    "lvl50Stats": {
      "hp": 155,
      "atk": 131,
      "def": 100,
      "spa": 171,
      "spd": 130,
      "spe": 151
    },
    "lvl100Stats": {
      "hp": 301,
      "atk": 258,
      "def": 196,
      "spa": 338,
      "spd": 256,
      "spe": 298
    },
    "fixedIV": null
  },
  "Crobat 1": {
    "species": "Crobat",
    "nature": "Quirky",
    "item": "King's Rock",
    "moves": [
      "Sludge Bomb",
      "Bite",
      "Astonish",
      "Screech"
    ],
    "abilities": [
      "Inner Focus"
    ],
    "evs": {
      "hp": 170,
      "atk": 170,
      "def": 0,
      "spa": 170,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 181,
      "atk": 131,
      "def": 100,
      "spa": 111,
      "spd": 100,
      "spe": 150
    },
    "lvl100Stats": {
      "hp": 353,
      "atk": 258,
      "def": 196,
      "spa": 218,
      "spd": 196,
      "spe": 296
    },
    "fixedIV": null
  },
  "Heracross 2": {
    "species": "Heracross",
    "nature": "Jolly",
    "item": "Lum Berry",
    "moves": [
      "Megahorn",
      "Earthquake",
      "Attract",
      "Bulk Up"
    ],
    "abilities": [
      "Swarm",
      "Guts"
    ],
    "evs": {
      "hp": 255,
      "atk": 0,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 187,
      "atk": 145,
      "def": 95,
      "spa": 54,
      "spd": 115,
      "spe": 150
    },
    "lvl100Stats": {
      "hp": 364,
      "atk": 286,
      "def": 186,
      "spa": 104,
      "spd": 226,
      "spe": 295
    },
    "fixedIV": null
  },
  "Jolteon 2": {
    "species": "Jolteon",
    "nature": "Hardy",
    "item": "Scope Lens",
    "moves": [
      "Thunderbolt",
      "Dig",
      "Double Kick",
      "Roar"
    ],
    "abilities": [
      "Volt Absorb"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 140,
      "atk": 117,
      "def": 80,
      "spa": 162,
      "spd": 115,
      "spe": 150
    },
    "lvl100Stats": {
      "hp": 271,
      "atk": 229,
      "def": 156,
      "spa": 319,
      "spd": 226,
      "spe": 296
    },
    "fixedIV": null
  },
  "Crobat 2": {
    "species": "Crobat",
    "nature": "Calm",
    "item": "Leftovers",
    "moves": [
      "Toxic",
      "Giga Drain",
      "Confuse Ray",
      "Double Team"
    ],
    "abilities": [
      "Inner Focus"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 181,
      "atk": 99,
      "def": 121,
      "spa": 90,
      "spd": 133,
      "spe": 150
    },
    "lvl100Stats": {
      "hp": 353,
      "atk": 194,
      "def": 238,
      "spa": 176,
      "spd": 261,
      "spe": 296
    },
    "fixedIV": null
  },
  "Xatu 3": {
    "species": "Xatu",
    "nature": "Jolly",
    "item": "King's Rock",
    "moves": [
      "Drill Peck",
      "Psychic",
      "Giga Drain",
      "Steel Wing"
    ],
    "abilities": [
      "Synchronize",
      "Early Bird"
    ],
    "evs": {
      "hp": 0,
      "atk": 170,
      "def": 0,
      "spa": 170,
      "spd": 0,
      "spe": 170
    },
    "lvl50Stats": {
      "hp": 140,
      "atk": 116,
      "def": 90,
      "spa": 122,
      "spd": 90,
      "spe": 150
    },
    "lvl100Stats": {
      "hp": 271,
      "atk": 228,
      "def": 176,
      "spa": 241,
      "spd": 176,
      "spe": 294
    },
    "fixedIV": null
  },
  "Aerodactyl 3": {
    "species": "Aerodactyl",
    "nature": "Hardy",
    "item": "King's Rock",
    "moves": [
      "Double-Edge",
      "Rock Slide",
      "Fire Blast",
      "Dragon Claw"
    ],
    "abilities": [
      "Rock Head",
      "Pressure"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 155,
      "atk": 157,
      "def": 85,
      "spa": 112,
      "spd": 95,
      "spe": 150
    },
    "lvl100Stats": {
      "hp": 301,
      "atk": 309,
      "def": 166,
      "spa": 219,
      "spd": 186,
      "spe": 296
    },
    "fixedIV": null
  },
  "Jolteon 3": {
    "species": "Jolteon",
    "nature": "Bold",
    "item": "BrightPowder",
    "moves": [
      "Thunderbolt",
      "Thunder Wave",
      "Agility",
      "Baton Pass"
    ],
    "abilities": [
      "Volt Absorb"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 161,
      "atk": 76,
      "def": 111,
      "spa": 130,
      "spd": 136,
      "spe": 150
    },
    "lvl100Stats": {
      "hp": 313,
      "atk": 149,
      "def": 217,
      "spa": 256,
      "spd": 268,
      "spe": 296
    },
    "fixedIV": null
  },
  "Misdreavus 4": {
    "species": "Misdreavus",
    "nature": "Timid",
    "item": "Lum Berry",
    "moves": [
      "Destiny Bond",
      "Psychic",
      "Shadow Ball",
      "Thunderbolt"
    ],
    "abilities": [
      "Levitate"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 135,
      "atk": 72,
      "def": 80,
      "spa": 137,
      "spd": 105,
      "spe": 150
    },
    "lvl100Stats": {
      "hp": 261,
      "atk": 140,
      "def": 156,
      "spa": 269,
      "spd": 206,
      "spe": 295
    },
    "fixedIV": null
  },
  "Aerodactyl 4": {
    "species": "Aerodactyl",
    "nature": "Hardy",
    "item": "King's Rock",
    "moves": [
      "Double-Edge",
      "Earthquake",
      "Fire Blast",
      "Bite"
    ],
    "abilities": [
      "Rock Head",
      "Pressure"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 155,
      "atk": 157,
      "def": 85,
      "spa": 112,
      "spd": 95,
      "spe": 150
    },
    "lvl100Stats": {
      "hp": 301,
      "atk": 309,
      "def": 166,
      "spa": 219,
      "spd": 186,
      "spe": 296
    },
    "fixedIV": null
  },
  "Anabel Gold Raikou": {
    "species": "Raikou",
    "nature": "Modest",
    "item": "Lum Berry",
    "moves": [
      "Thunderbolt",
      "Calm Mind",
      "Reflect",
      "Rest"
    ],
    "abilities": [
      "Pressure"
    ],
    "evs": {
      "hp": 158,
      "atk": 0,
      "def": 252,
      "spa": 0,
      "spd": 0,
      "spe": 100
    },
    "lvl50Stats": {
      "hp": 185,
      "atk": 94,
      "def": 127,
      "spa": 149,
      "spd": 120,
      "spe": 148
    },
    "lvl100Stats": {
      "hp": 360,
      "atk": 185,
      "def": 249,
      "spa": 292,
      "spd": 236,
      "spe": 291
    },
    "fixedIV": 31
  },
  "Arcanine 1": {
    "species": "Arcanine",
    "nature": "Adamant",
    "item": "King's Rock",
    "moves": [
      "Flamethrower",
      "ExtremeSpeed",
      "Crunch",
      "Body Slam"
    ],
    "abilities": [
      "Intimidate",
      "Flash Fire"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 165,
      "atk": 178,
      "def": 100,
      "spa": 108,
      "spd": 100,
      "spe": 147
    },
    "lvl100Stats": {
      "hp": 321,
      "atk": 350,
      "def": 196,
      "spa": 212,
      "spd": 196,
      "spe": 289
    },
    "fixedIV": null
  },
  "Houndoom 2": {
    "species": "Houndoom",
    "nature": "Modest",
    "item": "Lum Berry",
    "moves": [
      "Fire Blast",
      "Crunch",
      "Roar",
      "Rest"
    ],
    "abilities": [
      "Early Bird",
      "Flash Fire"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 150,
      "atk": 99,
      "def": 70,
      "spa": 178,
      "spd": 100,
      "spe": 147
    },
    "lvl100Stats": {
      "hp": 291,
      "atk": 194,
      "def": 136,
      "spa": 350,
      "spd": 196,
      "spe": 289
    },
    "fixedIV": null
  },
  "Arcanine 2": {
    "species": "Arcanine",
    "nature": "Docile",
    "item": "Lum Berry",
    "moves": [
      "Fire Blast",
      "Sunny Day",
      "Crunch",
      "Roar"
    ],
    "abilities": [
      "Intimidate",
      "Flash Fire"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 165,
      "atk": 130,
      "def": 100,
      "spa": 152,
      "spd": 100,
      "spe": 147
    },
    "lvl100Stats": {
      "hp": 321,
      "atk": 256,
      "def": 196,
      "spa": 299,
      "spd": 196,
      "spe": 289
    },
    "fixedIV": null
  },
  "Houndoom 3": {
    "species": "Houndoom",
    "nature": "Quirky",
    "item": "White Herb",
    "moves": [
      "Overheat",
      "Shadow Ball",
      "Sludge Bomb",
      "Double-Edge"
    ],
    "abilities": [
      "Early Bird",
      "Flash Fire"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 150,
      "atk": 142,
      "def": 70,
      "spa": 130,
      "spd": 100,
      "spe": 147
    },
    "lvl100Stats": {
      "hp": 291,
      "atk": 279,
      "def": 136,
      "spa": 256,
      "spd": 196,
      "spe": 289
    },
    "fixedIV": null
  },
  "Arcanine 3": {
    "species": "Arcanine",
    "nature": "Modest",
    "item": "White Herb",
    "moves": [
      "Overheat",
      "ExtremeSpeed",
      "Crunch",
      "Aerial Ace"
    ],
    "abilities": [
      "Intimidate",
      "Flash Fire"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 165,
      "atk": 117,
      "def": 100,
      "spa": 167,
      "spd": 100,
      "spe": 147
    },
    "lvl100Stats": {
      "hp": 321,
      "atk": 230,
      "def": 196,
      "spa": 328,
      "spd": 196,
      "spe": 289
    },
    "fixedIV": null
  },
  "Houndoom 4": {
    "species": "Houndoom",
    "nature": "Modest",
    "item": "White Herb",
    "moves": [
      "Overheat",
      "SolarBeam",
      "Crunch",
      "Sunny Day"
    ],
    "abilities": [
      "Early Bird",
      "Flash Fire"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 150,
      "atk": 99,
      "def": 70,
      "spa": 178,
      "spd": 100,
      "spe": 147
    },
    "lvl100Stats": {
      "hp": 291,
      "atk": 194,
      "def": 136,
      "spa": 350,
      "spd": 196,
      "spe": 289
    },
    "fixedIV": null
  },
  "Arcanine 4": {
    "species": "Arcanine",
    "nature": "Docile",
    "item": "White Herb",
    "moves": [
      "Overheat",
      "ExtremeSpeed",
      "Crunch",
      "Double-Edge"
    ],
    "abilities": [
      "Intimidate",
      "Flash Fire"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 165,
      "atk": 130,
      "def": 100,
      "spa": 152,
      "spd": 100,
      "spe": 147
    },
    "lvl100Stats": {
      "hp": 321,
      "atk": 256,
      "def": 196,
      "spa": 299,
      "spd": 196,
      "spe": 289
    },
    "fixedIV": null
  },
  "Electabuzz 2": {
    "species": "Electabuzz",
    "nature": "Quirky",
    "item": "Leftovers",
    "moves": [
      "Thunder",
      "Rain Dance",
      "Attract",
      "Focus Punch"
    ],
    "abilities": [
      "Static"
    ],
    "evs": {
      "hp": 0,
      "atk": 170,
      "def": 0,
      "spa": 170,
      "spd": 0,
      "spe": 170
    },
    "lvl50Stats": {
      "hp": 140,
      "atk": 124,
      "def": 77,
      "spa": 136,
      "spd": 105,
      "spe": 146
    },
    "lvl100Stats": {
      "hp": 271,
      "atk": 244,
      "def": 150,
      "spa": 268,
      "spd": 206,
      "spe": 288
    },
    "fixedIV": null
  },
  "Rapidash 2": {
    "species": "Rapidash",
    "nature": "Docile",
    "item": "Leftovers",
    "moves": [
      "Fire Blast",
      "Bounce",
      "Double Team",
      "Attract"
    ],
    "abilities": [
      "Run Away",
      "Flash Fire"
    ],
    "evs": {
      "hp": 0,
      "atk": 170,
      "def": 0,
      "spa": 170,
      "spd": 0,
      "spe": 170
    },
    "lvl50Stats": {
      "hp": 140,
      "atk": 141,
      "def": 90,
      "spa": 121,
      "spd": 100,
      "spe": 146
    },
    "lvl100Stats": {
      "hp": 271,
      "atk": 278,
      "def": 176,
      "spa": 238,
      "spd": 196,
      "spe": 288
    },
    "fixedIV": null
  },
  "Rapidash 3": {
    "species": "Rapidash",
    "nature": "Modest",
    "item": "White Herb",
    "moves": [
      "Overheat",
      "SolarBeam",
      "Sunny Day",
      "Hypnosis"
    ],
    "abilities": [
      "Run Away",
      "Flash Fire"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 0,
      "spa": 170,
      "spd": 0,
      "spe": 170
    },
    "lvl50Stats": {
      "hp": 161,
      "atk": 108,
      "def": 90,
      "spa": 133,
      "spd": 100,
      "spe": 146
    },
    "lvl100Stats": {
      "hp": 313,
      "atk": 212,
      "def": 176,
      "spa": 261,
      "spd": 196,
      "spe": 288
    },
    "fixedIV": null
  },
  "Rapidash 4": {
    "species": "Rapidash",
    "nature": "Docile",
    "item": "White Herb",
    "moves": [
      "Overheat",
      "Double-Edge",
      "Iron Tail",
      "Double Kick"
    ],
    "abilities": [
      "Run Away",
      "Flash Fire"
    ],
    "evs": {
      "hp": 0,
      "atk": 170,
      "def": 0,
      "spa": 170,
      "spd": 0,
      "spe": 170
    },
    "lvl50Stats": {
      "hp": 140,
      "atk": 141,
      "def": 90,
      "spa": 121,
      "spd": 100,
      "spe": 146
    },
    "lvl100Stats": {
      "hp": 271,
      "atk": 278,
      "def": 176,
      "spa": 238,
      "spd": 196,
      "spe": 288
    },
    "fixedIV": null
  },
  "Magmar 2": {
    "species": "Magmar",
    "nature": "Modest",
    "item": "Quick Claw",
    "moves": [
      "Fire Blast",
      "SmokeScreen",
      "ThunderPunch",
      "Confuse Ray"
    ],
    "abilities": [
      "Flame Body"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 140,
      "atk": 103,
      "def": 77,
      "spa": 167,
      "spd": 105,
      "spe": 145
    },
    "lvl100Stats": {
      "hp": 271,
      "atk": 203,
      "def": 150,
      "spa": 328,
      "spd": 206,
      "spe": 285
    },
    "fixedIV": null
  },
  "Meganium 3": {
    "species": "Meganium",
    "nature": "Jolly",
    "item": "Salac Berry",
    "moves": [
      "Earthquake",
      "Flail",
      "Endure",
      "Giga Drain"
    ],
    "abilities": [
      "Overgrow"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 155,
      "atk": 134,
      "def": 120,
      "spa": 93,
      "spd": 120,
      "spe": 145
    },
    "lvl100Stats": {
      "hp": 301,
      "atk": 263,
      "def": 236,
      "spa": 181,
      "spd": 236,
      "spe": 284
    },
    "fixedIV": null
  },
  "Gardevoir 6": {
    "species": "Gardevoir",
    "nature": "Timid",
    "item": "Lum Berry",
    "moves": [
      "Psychic",
      "Thunderbolt",
      "Will-O-Wisp",
      "Destiny Bond"
    ],
    "abilities": [
      "Synchronize",
      "Trace"
    ],
    "evs": {
      "hp": 255,
      "atk": 0,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 175,
      "atk": 76,
      "def": 85,
      "spa": 145,
      "spd": 135,
      "spe": 145
    },
    "lvl100Stats": {
      "hp": 340,
      "atk": 149,
      "def": 166,
      "spa": 286,
      "spd": 266,
      "spe": 284
    },
    "fixedIV": null
  },
  "Electrode 1": {
    "species": "Electrode",
    "nature": "Quiet",
    "item": "Focus Band",
    "moves": [
      "Thunderbolt",
      "Swift",
      "Light Screen",
      "Protect"
    ],
    "abilities": [
      "Soundproof",
      "Static"
    ],
    "evs": {
      "hp": 255,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 167,
      "atk": 70,
      "def": 90,
      "spa": 145,
      "spd": 100,
      "spe": 144
    },
    "lvl100Stats": {
      "hp": 324,
      "atk": 136,
      "def": 176,
      "spa": 284,
      "spd": 196,
      "spe": 284
    },
    "fixedIV": null
  },
  "Kangaskhan 4": {
    "species": "Kangaskhan",
    "nature": "Adamant",
    "item": "BrightPowder",
    "moves": [
      "Mega Kick",
      "Earthquake",
      "Aerial Ace",
      "Shadow Ball"
    ],
    "abilities": [
      "Early Bird"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 180,
      "atk": 161,
      "def": 100,
      "spa": 54,
      "spd": 100,
      "spe": 142
    },
    "lvl100Stats": {
      "hp": 351,
      "atk": 317,
      "def": 196,
      "spa": 104,
      "spd": 196,
      "spe": 279
    },
    "fixedIV": null
  },
  "Moltres 3": {
    "species": "Moltres",
    "nature": "Modest",
    "item": "Chesto Berry",
    "moves": [
      "Fire Blast",
      "Sunny Day",
      "Double Team",
      "Rest"
    ],
    "abilities": [
      "Pressure"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 165,
      "atk": 108,
      "def": 110,
      "spa": 194,
      "spd": 105,
      "spe": 142
    },
    "lvl100Stats": {
      "hp": 321,
      "atk": 212,
      "def": 216,
      "spa": 383,
      "spd": 206,
      "spe": 279
    },
    "fixedIV": null
  },
  "Moltres 5": {
    "species": "Moltres",
    "nature": "Docile",
    "item": "White Herb",
    "moves": [
      "Overheat",
      "Sunny Day",
      "Swagger",
      "Facade"
    ],
    "abilities": [
      "Pressure"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 165,
      "atk": 120,
      "def": 110,
      "spa": 177,
      "spd": 105,
      "spe": 142
    },
    "lvl100Stats": {
      "hp": 321,
      "atk": 236,
      "def": 216,
      "spa": 349,
      "spd": 206,
      "spe": 279
    },
    "fixedIV": null
  },
  "Brandon Gold Moltres": {
    "species": "Moltres",
    "nature": "Mild",
    "item": "BrightPowder",
    "moves": [
      "Fire Blast",
      "Hyper Beam",
      "Aerial Ace",
      "Safeguard"
    ],
    "abilities": [
      "Pressure"
    ],
    "evs": {
      "hp": 6,
      "atk": 0,
      "def": 252,
      "spa": 0,
      "spd": 0,
      "spe": 252
    },
    "lvl50Stats": {
      "hp": 166,
      "atk": 120,
      "def": 127,
      "spa": 160,
      "spd": 105,
      "spe": 142
    },
    "lvl100Stats": {
      "hp": 322,
      "atk": 236,
      "def": 251,
      "spa": 314,
      "spd": 206,
      "spe": 279
    },
    "fixedIV": 31
  },
  "Raichu 1": {
    "species": "Raichu",
    "nature": "Modest",
    "item": "BrightPowder",
    "moves": [
      "Thunderbolt",
      "Quick Attack",
      "Light Screen",
      "Double Team"
    ],
    "abilities": [
      "Static"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 170,
      "spa": 170,
      "spd": 0,
      "spe": 170
    },
    "lvl50Stats": {
      "hp": 135,
      "atk": 99,
      "def": 96,
      "spa": 144,
      "spd": 100,
      "spe": 141
    },
    "lvl100Stats": {
      "hp": 261,
      "atk": 194,
      "def": 188,
      "spa": 283,
      "spd": 196,
      "spe": 278
    },
    "fixedIV": null
  },
  "Rapidash 1": {
    "species": "Rapidash",
    "nature": "Quiet",
    "item": "Charcoal",
    "moves": [
      "Flamethrower",
      "Double Kick",
      "Quick Attack",
      "Protect"
    ],
    "abilities": [
      "Run Away",
      "Flash Fire"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 140,
      "atk": 120,
      "def": 90,
      "spa": 145,
      "spd": 100,
      "spe": 141
    },
    "lvl100Stats": {
      "hp": 271,
      "atk": 236,
      "def": 176,
      "spa": 284,
      "spd": 196,
      "spe": 278
    },
    "fixedIV": null
  },
  "Typhlosion 2": {
    "species": "Typhlosion",
    "nature": "Hardy",
    "item": "Scope Lens",
    "moves": [
      "Flamethrower",
      "ThunderPunch",
      "Aerial Ace",
      "Rock Slide"
    ],
    "abilities": [
      "Blaze"
    ],
    "evs": {
      "hp": 0,
      "atk": 170,
      "def": 0,
      "spa": 170,
      "spd": 0,
      "spe": 170
    },
    "lvl50Stats": {
      "hp": 153,
      "atk": 125,
      "def": 98,
      "spa": 150,
      "spd": 105,
      "spe": 141
    },
    "lvl100Stats": {
      "hp": 297,
      "atk": 246,
      "def": 192,
      "spa": 296,
      "spd": 206,
      "spe": 278
    },
    "fixedIV": null
  },
  "Salamence 2": {
    "species": "Salamence",
    "nature": "Hardy",
    "item": "Leftovers",
    "moves": [
      "Double-Edge",
      "Crunch",
      "Swagger",
      "Protect"
    ],
    "abilities": [
      "Intimidate"
    ],
    "evs": {
      "hp": 0,
      "atk": 170,
      "def": 0,
      "spa": 170,
      "spd": 0,
      "spe": 170
    },
    "lvl50Stats": {
      "hp": 170,
      "atk": 176,
      "def": 100,
      "spa": 151,
      "spd": 100,
      "spe": 141
    },
    "lvl100Stats": {
      "hp": 331,
      "atk": 348,
      "def": 196,
      "spa": 298,
      "spd": 196,
      "spe": 278
    },
    "fixedIV": null
  },
  "Tentacruel 3": {
    "species": "Tentacruel",
    "nature": "Modest",
    "item": "Shell Bell",
    "moves": [
      "Surf",
      "Giga Drain",
      "Ice Beam",
      "Mirror Coat"
    ],
    "abilities": [
      "Clear Body",
      "Liquid Ooze"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 170,
      "spa": 170,
      "spd": 0,
      "spe": 170
    },
    "lvl50Stats": {
      "hp": 155,
      "atk": 81,
      "def": 106,
      "spa": 133,
      "spd": 140,
      "spe": 141
    },
    "lvl100Stats": {
      "hp": 301,
      "atk": 158,
      "def": 208,
      "spa": 261,
      "spd": 276,
      "spe": 278
    },
    "fixedIV": null
  },
  "Flygon 3": {
    "species": "Flygon",
    "nature": "Hardy",
    "item": "Scope Lens",
    "moves": [
      "Earthquake",
      "Dragon Claw",
      "Flamethrower",
      "Giga Drain"
    ],
    "abilities": [
      "Levitate"
    ],
    "evs": {
      "hp": 0,
      "atk": 170,
      "def": 0,
      "spa": 170,
      "spd": 0,
      "spe": 170
    },
    "lvl50Stats": {
      "hp": 155,
      "atk": 141,
      "def": 100,
      "spa": 121,
      "spd": 100,
      "spe": 141
    },
    "lvl100Stats": {
      "hp": 301,
      "atk": 278,
      "def": 196,
      "spa": 238,
      "spd": 196,
      "spe": 278
    },
    "fixedIV": null
  },
  "Flygon 4": {
    "species": "Flygon",
    "nature": "Hardy",
    "item": "Scope Lens",
    "moves": [
      "Earthquake",
      "Dragon Claw",
      "Double-Edge",
      "Crunch"
    ],
    "abilities": [
      "Levitate"
    ],
    "evs": {
      "hp": 0,
      "atk": 170,
      "def": 0,
      "spa": 170,
      "spd": 0,
      "spe": 170
    },
    "lvl50Stats": {
      "hp": 155,
      "atk": 141,
      "def": 100,
      "spa": 121,
      "spd": 100,
      "spe": 141
    },
    "lvl100Stats": {
      "hp": 301,
      "atk": 278,
      "def": 196,
      "spa": 238,
      "spd": 196,
      "spe": 278
    },
    "fixedIV": null
  },
  "Charizard 4": {
    "species": "Charizard",
    "nature": "Hardy",
    "item": "White Herb",
    "moves": [
      "Overheat",
      "Earthquake",
      "Aerial Ace",
      "Rock Slide"
    ],
    "abilities": [
      "Blaze"
    ],
    "evs": {
      "hp": 0,
      "atk": 170,
      "def": 0,
      "spa": 170,
      "spd": 0,
      "spe": 170
    },
    "lvl50Stats": {
      "hp": 153,
      "atk": 125,
      "def": 98,
      "spa": 150,
      "spd": 105,
      "spe": 141
    },
    "lvl100Stats": {
      "hp": 297,
      "atk": 246,
      "def": 192,
      "spa": 296,
      "spd": 206,
      "spe": 278
    },
    "fixedIV": null
  },
  "Typhlosion 4": {
    "species": "Typhlosion",
    "nature": "Hardy",
    "item": "White Herb",
    "moves": [
      "Overheat",
      "ThunderPunch",
      "Earthquake",
      "Crush Claw"
    ],
    "abilities": [
      "Blaze"
    ],
    "evs": {
      "hp": 0,
      "atk": 170,
      "def": 0,
      "spa": 170,
      "spd": 0,
      "spe": 170
    },
    "lvl50Stats": {
      "hp": 153,
      "atk": 125,
      "def": 98,
      "spa": 150,
      "spd": 105,
      "spe": 141
    },
    "lvl100Stats": {
      "hp": 297,
      "atk": 246,
      "def": 192,
      "spa": 296,
      "spd": 206,
      "spe": 278
    },
    "fixedIV": null
  },
  "Zapdos 3": {
    "species": "Zapdos",
    "nature": "Docile",
    "item": "Leftovers",
    "moves": [
      "Thunderbolt",
      "Drill Peck",
      "Thunder Wave",
      "Substitute"
    ],
    "abilities": [
      "Pressure"
    ],
    "evs": {
      "hp": 0,
      "atk": 170,
      "def": 0,
      "spa": 170,
      "spd": 0,
      "spe": 170
    },
    "lvl50Stats": {
      "hp": 165,
      "atk": 131,
      "def": 105,
      "spa": 166,
      "spd": 110,
      "spe": 141
    },
    "lvl100Stats": {
      "hp": 321,
      "atk": 258,
      "def": 206,
      "spa": 328,
      "spd": 216,
      "spe": 278
    },
    "fixedIV": null
  },
  "Zapdos 6": {
    "species": "Zapdos",
    "nature": "Docile",
    "item": "Lum Berry",
    "moves": [
      "Thunder",
      "Drill Peck",
      "Rain Dance",
      "Double-Edge"
    ],
    "abilities": [
      "Pressure"
    ],
    "evs": {
      "hp": 0,
      "atk": 170,
      "def": 0,
      "spa": 170,
      "spd": 0,
      "spe": 170
    },
    "lvl50Stats": {
      "hp": 165,
      "atk": 131,
      "def": 105,
      "spa": 166,
      "spd": 110,
      "spe": 141
    },
    "lvl100Stats": {
      "hp": 321,
      "atk": 258,
      "def": 206,
      "spa": 328,
      "spd": 216,
      "spe": 278
    },
    "fixedIV": null
  },
  "Alakazam 1": {
    "species": "Alakazam",
    "nature": "Modest",
    "item": "Focus Band",
    "moves": [
      "ThunderPunch",
      "Fire Punch",
      "Ice Punch",
      "Thunder Wave"
    ],
    "abilities": [
      "Synchronize",
      "Inner Focus"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 255,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 130,
      "atk": 63,
      "def": 97,
      "spa": 205,
      "spd": 105,
      "spe": 140
    },
    "lvl100Stats": {
      "hp": 251,
      "atk": 122,
      "def": 189,
      "spa": 405,
      "spd": 206,
      "spe": 276
    },
    "fixedIV": null
  },
  "Alakazam 2": {
    "species": "Alakazam",
    "nature": "Modest",
    "item": "Lum Berry",
    "moves": [
      "Psychic",
      "Calm Mind",
      "Thunder Wave",
      "Recover"
    ],
    "abilities": [
      "Synchronize",
      "Inner Focus"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 255,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 130,
      "atk": 63,
      "def": 97,
      "spa": 205,
      "spd": 105,
      "spe": 140
    },
    "lvl100Stats": {
      "hp": 251,
      "atk": 122,
      "def": 189,
      "spa": 405,
      "spd": 206,
      "spe": 276
    },
    "fixedIV": null
  },
  "Alakazam 3": {
    "species": "Alakazam",
    "nature": "Modest",
    "item": "Choice Band",
    "moves": [
      "Trick",
      "Disable",
      "Psychic",
      "Skill Swap"
    ],
    "abilities": [
      "Synchronize",
      "Inner Focus"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 255,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 130,
      "atk": 63,
      "def": 97,
      "spa": 205,
      "spd": 105,
      "spe": 140
    },
    "lvl100Stats": {
      "hp": 251,
      "atk": 122,
      "def": 189,
      "spa": 405,
      "spd": 206,
      "spe": 276
    },
    "fixedIV": null
  },
  "Alakazam 4": {
    "species": "Alakazam",
    "nature": "Modest",
    "item": "BrightPowder",
    "moves": [
      "Psychic",
      "ThunderPunch",
      "Fire Punch",
      "Ice Punch"
    ],
    "abilities": [
      "Synchronize",
      "Inner Focus"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 255,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 130,
      "atk": 63,
      "def": 97,
      "spa": 205,
      "spd": 105,
      "spe": 140
    },
    "lvl100Stats": {
      "hp": 251,
      "atk": 122,
      "def": 189,
      "spa": 405,
      "spd": 206,
      "spe": 276
    },
    "fixedIV": null
  },
  "Heracross 3": {
    "species": "Heracross",
    "nature": "Adamant",
    "item": "BrightPowder",
    "moves": [
      "Megahorn",
      "Earthquake",
      "Rock Slide",
      "Brick Break"
    ],
    "abilities": [
      "Swarm",
      "Guts"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 155,
      "atk": 194,
      "def": 95,
      "spa": 54,
      "spd": 115,
      "spe": 137
    },
    "lvl100Stats": {
      "hp": 301,
      "atk": 383,
      "def": 186,
      "spa": 104,
      "spd": 226,
      "spe": 269
    },
    "fixedIV": null
  },
  "Golduck 4": {
    "species": "Golduck",
    "nature": "Docile",
    "item": "Scope Lens",
    "moves": [
      "Surf",
      "Cross Chop",
      "Ice Beam",
      "Aerial Ace"
    ],
    "abilities": [
      "Damp",
      "Cloud Nine"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 155,
      "atk": 134,
      "def": 98,
      "spa": 115,
      "spd": 100,
      "spe": 137
    },
    "lvl100Stats": {
      "hp": 301,
      "atk": 263,
      "def": 192,
      "spa": 226,
      "spd": 196,
      "spe": 269
    },
    "fixedIV": null
  },
  "Heracross 4": {
    "species": "Heracross",
    "nature": "Adamant",
    "item": "Salac Berry",
    "moves": [
      "Megahorn",
      "Earthquake",
      "Reversal",
      "Endure"
    ],
    "abilities": [
      "Swarm",
      "Guts"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 155,
      "atk": 194,
      "def": 95,
      "spa": 54,
      "spd": 115,
      "spe": 137
    },
    "lvl100Stats": {
      "hp": 301,
      "atk": 383,
      "def": 186,
      "spa": 104,
      "spd": 226,
      "spe": 269
    },
    "fixedIV": null
  },
  "Articuno 1": {
    "species": "Articuno",
    "nature": "Modest",
    "item": "Lum Berry",
    "moves": [
      "Ice Beam",
      "Water Pulse",
      "Icy Wind",
      "Roar"
    ],
    "abilities": [
      "Pressure"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 165,
      "atk": 94,
      "def": 120,
      "spa": 161,
      "spd": 145,
      "spe": 137
    },
    "lvl100Stats": {
      "hp": 321,
      "atk": 185,
      "def": 236,
      "spa": 317,
      "spd": 286,
      "spe": 269
    },
    "fixedIV": null
  },
  "Suicune 1": {
    "species": "Suicune",
    "nature": "Modest",
    "item": "Chesto Berry",
    "moves": [
      "Surf",
      "Double Team",
      "Calm Mind",
      "Rest"
    ],
    "abilities": [
      "Pressure"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 175,
      "atk": 85,
      "def": 135,
      "spa": 156,
      "spd": 135,
      "spe": 137
    },
    "lvl100Stats": {
      "hp": 341,
      "atk": 167,
      "def": 266,
      "spa": 306,
      "spd": 266,
      "spe": 269
    },
    "fixedIV": null
  },
  "Suicune 3": {
    "species": "Suicune",
    "nature": "Modest",
    "item": "Lum Berry",
    "moves": [
      "Surf",
      "Ice Beam",
      "Rain Dance",
      "Roar"
    ],
    "abilities": [
      "Pressure"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 175,
      "atk": 85,
      "def": 135,
      "spa": 156,
      "spd": 135,
      "spe": 137
    },
    "lvl100Stats": {
      "hp": 341,
      "atk": 167,
      "def": 266,
      "spa": 306,
      "spd": 266,
      "spe": 269
    },
    "fixedIV": null
  },
  "Suicune 4": {
    "species": "Suicune",
    "nature": "Modest",
    "item": "BrightPowder",
    "moves": [
      "Surf",
      "Ice Beam",
      "Bite",
      "Reflect"
    ],
    "abilities": [
      "Pressure"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 175,
      "atk": 85,
      "def": 135,
      "spa": 156,
      "spd": 135,
      "spe": 137
    },
    "lvl100Stats": {
      "hp": 341,
      "atk": 167,
      "def": 266,
      "spa": 306,
      "spd": 266,
      "spe": 269
    },
    "fixedIV": null
  },
  "Brandon Gold Articuno": {
    "species": "Articuno",
    "nature": "Mild",
    "item": "Scope Lens",
    "moves": [
      "Blizzard",
      "Water Pulse",
      "Aerial Ace",
      "Reflect"
    ],
    "abilities": [
      "Pressure"
    ],
    "evs": {
      "hp": 6,
      "atk": 0,
      "def": 252,
      "spa": 0,
      "spd": 0,
      "spe": 252
    },
    "lvl50Stats": {
      "hp": 166,
      "atk": 105,
      "def": 136,
      "spa": 127,
      "spd": 145,
      "spe": 137
    },
    "lvl100Stats": {
      "hp": 322,
      "atk": 206,
      "def": 269,
      "spa": 248,
      "spd": 286,
      "spe": 269
    },
    "fixedIV": 31
  },
  "Houndoom 1": {
    "species": "Houndoom",
    "nature": "Quirky",
    "item": "Focus Band",
    "moves": [
      "Flamethrower",
      "Shadow Ball",
      "Counter",
      "Will-O-Wisp"
    ],
    "abilities": [
      "Early Bird",
      "Flash Fire"
    ],
    "evs": {
      "hp": 0,
      "atk": 170,
      "def": 0,
      "spa": 170,
      "spd": 0,
      "spe": 170
    },
    "lvl50Stats": {
      "hp": 150,
      "atk": 131,
      "def": 70,
      "spa": 151,
      "spd": 100,
      "spe": 136
    },
    "lvl100Stats": {
      "hp": 291,
      "atk": 258,
      "def": 136,
      "spa": 298,
      "spd": 196,
      "spe": 268
    },
    "fixedIV": null
  },
  "Starmie 1": {
    "species": "Starmie",
    "nature": "Modest",
    "item": "Shell Bell",
    "moves": [
      "Psychic",
      "Confuse Ray",
      "Thunder Wave",
      "Recover"
    ],
    "abilities": [
      "Illuminate",
      "Natural Cure"
    ],
    "evs": {
      "hp": 255,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 167,
      "atk": 85,
      "def": 105,
      "spa": 167,
      "spd": 105,
      "spe": 135
    },
    "lvl100Stats": {
      "hp": 324,
      "atk": 167,
      "def": 206,
      "spa": 328,
      "spd": 206,
      "spe": 266
    },
    "fixedIV": null
  },
  "Starmie 2": {
    "species": "Starmie",
    "nature": "Modest",
    "item": "Shell Bell",
    "moves": [
      "Hydro Pump",
      "Thunder",
      "Rain Dance",
      "Recover"
    ],
    "abilities": [
      "Illuminate",
      "Natural Cure"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 156,
      "atk": 85,
      "def": 126,
      "spa": 132,
      "spd": 126,
      "spe": 135
    },
    "lvl100Stats": {
      "hp": 303,
      "atk": 167,
      "def": 248,
      "spa": 259,
      "spd": 248,
      "spe": 266
    },
    "fixedIV": null
  },
  "Starmie 6": {
    "species": "Starmie",
    "nature": "Calm",
    "item": "Leftovers",
    "moves": [
      "Surf",
      "Confuse Ray",
      "Thunder Wave",
      "Recover"
    ],
    "abilities": [
      "Illuminate",
      "Natural Cure"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 156,
      "atk": 85,
      "def": 126,
      "spa": 120,
      "spd": 139,
      "spe": 135
    },
    "lvl100Stats": {
      "hp": 303,
      "atk": 167,
      "def": 248,
      "spa": 236,
      "spd": 272,
      "spe": 266
    },
    "fixedIV": null
  },
  "Raikou 6": {
    "species": "Raikou",
    "nature": "Modest",
    "item": "Chesto Berry",
    "moves": [
      "Thunderbolt",
      "Calm Mind",
      "Substitute",
      "Rest"
    ],
    "abilities": [
      "Pressure"
    ],
    "evs": {
      "hp": 255,
      "atk": 0,
      "def": 255,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 197,
      "atk": 94,
      "def": 127,
      "spa": 149,
      "spd": 120,
      "spe": 135
    },
    "lvl100Stats": {
      "hp": 384,
      "atk": 185,
      "def": 249,
      "spa": 292,
      "spd": 236,
      "spe": 266
    },
    "fixedIV": null
  },
  "Breloom 1": {
    "species": "Breloom",
    "nature": "Jolly",
    "item": "King's Rock",
    "moves": [
      "Sky Uppercut",
      "Mach Punch",
      "Headbutt",
      "Counter"
    ],
    "abilities": [
      "Effect Spore"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 135,
      "atk": 182,
      "def": 100,
      "spa": 72,
      "spd": 80,
      "spe": 134
    },
    "lvl100Stats": {
      "hp": 261,
      "atk": 359,
      "def": 196,
      "spa": 140,
      "spd": 156,
      "spe": 262
    },
    "fixedIV": null
  },
  "Greta Gold Breloom": {
    "species": "Breloom",
    "nature": "Jolly",
    "item": "Lum Berry",
    "moves": [
      "Spore",
      "Focus Punch",
      "Giga Drain",
      "Headbutt"
    ],
    "abilities": [
      "Effect Spore"
    ],
    "evs": {
      "hp": 6,
      "atk": 252,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 252
    },
    "lvl50Stats": {
      "hp": 136,
      "atk": 182,
      "def": 100,
      "spa": 72,
      "spd": 80,
      "spe": 134
    },
    "lvl100Stats": {
      "hp": 262,
      "atk": 359,
      "def": 196,
      "spa": 140,
      "spd": 156,
      "spe": 262
    },
    "fixedIV": 31
  },
  "Gardevoir 1": {
    "species": "Gardevoir",
    "nature": "Timid",
    "item": "Leftovers",
    "moves": [
      "Dream Eater",
      "Hypnosis",
      "Magical Leaf",
      "Reflect"
    ],
    "abilities": [
      "Synchronize",
      "Trace"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 0,
      "spe": 170
    },
    "lvl50Stats": {
      "hp": 164,
      "atk": 76,
      "def": 106,
      "spa": 145,
      "spd": 135,
      "spe": 133
    },
    "lvl100Stats": {
      "hp": 319,
      "atk": 149,
      "def": 208,
      "spa": 286,
      "spd": 266,
      "spe": 261
    },
    "fixedIV": null
  },
  "Gyarados 2": {
    "species": "Gyarados",
    "nature": "Modest",
    "item": "Shell Bell",
    "moves": [
      "Hydro Pump",
      "Thunderbolt",
      "Fire Blast",
      "Blizzard"
    ],
    "abilities": [
      "Intimidate"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 170,
      "atk": 130,
      "def": 99,
      "spa": 123,
      "spd": 120,
      "spe": 133
    },
    "lvl100Stats": {
      "hp": 331,
      "atk": 257,
      "def": 194,
      "spa": 240,
      "spd": 236,
      "spe": 261
    },
    "fixedIV": null
  },
  "Medicham 1": {
    "species": "Medicham",
    "nature": "Docile",
    "item": "Focus Band",
    "moves": [
      "Psychic",
      "Hi Jump Kick",
      "Calm Mind",
      "Baton Pass"
    ],
    "abilities": [
      "Pure Power"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 135,
      "atk": 112,
      "def": 95,
      "spa": 80,
      "spd": 95,
      "spe": 132
    },
    "lvl100Stats": {
      "hp": 261,
      "atk": 219,
      "def": 186,
      "spa": 156,
      "spd": 186,
      "spe": 259
    },
    "fixedIV": null
  },
  "Medicham 2": {
    "species": "Medicham",
    "nature": "Hardy",
    "item": "Salac Berry",
    "moves": [
      "Reversal",
      "Endure",
      "Psychic",
      "Fake Out"
    ],
    "abilities": [
      "Pure Power"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 135,
      "atk": 112,
      "def": 95,
      "spa": 80,
      "spd": 95,
      "spe": 132
    },
    "lvl100Stats": {
      "hp": 261,
      "atk": 219,
      "def": 186,
      "spa": 156,
      "spd": 186,
      "spe": 259
    },
    "fixedIV": null
  },
  "Glalie 2": {
    "species": "Glalie",
    "nature": "Quirky",
    "item": "Salac Berry",
    "moves": [
      "Explosion",
      "Endure",
      "Body Slam",
      "Icy Wind"
    ],
    "abilities": [
      "Inner Focus"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 155,
      "atk": 132,
      "def": 100,
      "spa": 100,
      "spd": 100,
      "spe": 132
    },
    "lvl100Stats": {
      "hp": 301,
      "atk": 259,
      "def": 196,
      "spa": 196,
      "spd": 196,
      "spe": 259
    },
    "fixedIV": null
  },
  "Medicham 3": {
    "species": "Medicham",
    "nature": "Hardy",
    "item": "Scope Lens",
    "moves": [
      "DynamicPunch",
      "ThunderPunch",
      "Ice Punch",
      "Fire Punch"
    ],
    "abilities": [
      "Pure Power"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 135,
      "atk": 80,
      "def": 95,
      "spa": 112,
      "spd": 95,
      "spe": 132
    },
    "lvl100Stats": {
      "hp": 261,
      "atk": 156,
      "def": 186,
      "spa": 219,
      "spd": 186,
      "spe": 259
    },
    "fixedIV": null
  },
  "Gardevoir 3": {
    "species": "Gardevoir",
    "nature": "Modest",
    "item": "Lum Berry",
    "moves": [
      "Psychic",
      "Ice Punch",
      "Fire Punch",
      "Magical Leaf"
    ],
    "abilities": [
      "Synchronize",
      "Trace"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 143,
      "atk": 76,
      "def": 85,
      "spa": 194,
      "spd": 135,
      "spe": 132
    },
    "lvl100Stats": {
      "hp": 277,
      "atk": 149,
      "def": 166,
      "spa": 383,
      "spd": 266,
      "spe": 259
    },
    "fixedIV": null
  },
  "Blaziken 3": {
    "species": "Blaziken",
    "nature": "Hardy",
    "item": "Salac Berry",
    "moves": [
      "Overheat",
      "Earthquake",
      "Endure",
      "Reversal"
    ],
    "abilities": [
      "Blaze"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 155,
      "atk": 172,
      "def": 90,
      "spa": 130,
      "spd": 90,
      "spe": 132
    },
    "lvl100Stats": {
      "hp": 301,
      "atk": 339,
      "def": 176,
      "spa": 256,
      "spd": 176,
      "spe": 259
    },
    "fixedIV": null
  },
  "Gardevoir 4": {
    "species": "Gardevoir",
    "nature": "Modest",
    "item": "BrightPowder",
    "moves": [
      "Psychic",
      "Thunderbolt",
      "Ice Punch",
      "Fire Punch"
    ],
    "abilities": [
      "Synchronize",
      "Trace"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 143,
      "atk": 76,
      "def": 85,
      "spa": 194,
      "spd": 135,
      "spe": 132
    },
    "lvl100Stats": {
      "hp": 277,
      "atk": 149,
      "def": 166,
      "spa": 383,
      "spd": 266,
      "spe": 259
    },
    "fixedIV": null
  },
  "Gardevoir 8": {
    "species": "Gardevoir",
    "nature": "Modest",
    "item": "BrightPowder",
    "moves": [
      "Psychic",
      "Magical Leaf",
      "Attract",
      "Double Team"
    ],
    "abilities": [
      "Synchronize",
      "Trace"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 143,
      "atk": 76,
      "def": 85,
      "spa": 194,
      "spd": 135,
      "spe": 132
    },
    "lvl100Stats": {
      "hp": 277,
      "atk": 149,
      "def": 166,
      "spa": 383,
      "spd": 266,
      "spe": 259
    },
    "fixedIV": null
  },
  "Dragonite 6": {
    "species": "Dragonite",
    "nature": "Modest",
    "item": "Shell Bell",
    "moves": [
      "Dragon Claw",
      "Thunderbolt",
      "Surf",
      "Flamethrower"
    ],
    "abilities": [
      "Inner Focus"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 166,
      "atk": 139,
      "def": 115,
      "spa": 167,
      "spd": 120,
      "spe": 132
    },
    "lvl100Stats": {
      "hp": 323,
      "atk": 273,
      "def": 226,
      "spa": 328,
      "spd": 236,
      "spe": 259
    },
    "fixedIV": null
  },
  "Dragonite 7": {
    "species": "Dragonite",
    "nature": "Modest",
    "item": "Shell Bell",
    "moves": [
      "Dragon Claw",
      "Thunderbolt",
      "Surf",
      "Ice Beam"
    ],
    "abilities": [
      "Inner Focus"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 166,
      "atk": 139,
      "def": 115,
      "spa": 167,
      "spd": 120,
      "spe": 132
    },
    "lvl100Stats": {
      "hp": 323,
      "atk": 273,
      "def": 226,
      "spa": 328,
      "spd": 236,
      "spe": 259
    },
    "fixedIV": null
  },
  "Dragonite 8": {
    "species": "Dragonite",
    "nature": "Modest",
    "item": "Shell Bell",
    "moves": [
      "Dragon Claw",
      "Flamethrower",
      "Ice Beam",
      "Brick Break"
    ],
    "abilities": [
      "Inner Focus"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 166,
      "atk": 139,
      "def": 115,
      "spa": 167,
      "spd": 120,
      "spe": 132
    },
    "lvl100Stats": {
      "hp": 323,
      "atk": 273,
      "def": 226,
      "spa": 328,
      "spd": 236,
      "spe": 259
    },
    "fixedIV": null
  },
  "Anabel Gold Latios": {
    "species": "Latios",
    "nature": "Modest",
    "item": "BrightPowder",
    "moves": [
      "Psychic",
      "Calm Mind",
      "Recover",
      "Dragon Claw"
    ],
    "abilities": [
      "Levitate"
    ],
    "evs": {
      "hp": 252,
      "atk": 0,
      "def": 252,
      "spa": 0,
      "spd": 0,
      "spe": 6
    },
    "lvl50Stats": {
      "hp": 187,
      "atk": 99,
      "def": 132,
      "spa": 165,
      "spd": 130,
      "spe": 131
    },
    "lvl100Stats": {
      "hp": 364,
      "atk": 194,
      "def": 259,
      "spa": 325,
      "spd": 256,
      "spe": 257
    },
    "fixedIV": 31
  },
  "Tucker Gold Latias": {
    "species": "Latias",
    "nature": "Modest",
    "item": "Chesto Berry",
    "moves": [
      "Thunderbolt",
      "Psychic",
      "Calm Mind",
      "Rest"
    ],
    "abilities": [
      "Levitate"
    ],
    "evs": {
      "hp": 252,
      "atk": 0,
      "def": 252,
      "spa": 0,
      "spd": 0,
      "spe": 6
    },
    "lvl50Stats": {
      "hp": 187,
      "atk": 90,
      "def": 142,
      "spa": 143,
      "spd": 150,
      "spe": 131
    },
    "lvl100Stats": {
      "hp": 364,
      "atk": 176,
      "def": 279,
      "spa": 281,
      "spd": 296,
      "spe": 257
    },
    "fixedIV": 31
  },
  "Tauros 2": {
    "species": "Tauros",
    "nature": "Adamant",
    "item": "Chesto Berry",
    "moves": [
      "Double-Edge",
      "Earthquake",
      "Double Team",
      "Rest"
    ],
    "abilities": [
      "Intimidate"
    ],
    "evs": {
      "hp": 255,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 182,
      "atk": 167,
      "def": 115,
      "spa": 54,
      "spd": 90,
      "spe": 130
    },
    "lvl100Stats": {
      "hp": 354,
      "atk": 328,
      "def": 226,
      "spa": 104,
      "spd": 176,
      "spe": 256
    },
    "fixedIV": null
  },
  "Tauros 3": {
    "species": "Tauros",
    "nature": "Docile",
    "item": "Leftovers",
    "moves": [
      "Double-Edge",
      "Earthquake",
      "Flamethrower",
      "Ice Beam"
    ],
    "abilities": [
      "Intimidate"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 150,
      "atk": 152,
      "def": 115,
      "spa": 92,
      "spd": 90,
      "spe": 130
    },
    "lvl100Stats": {
      "hp": 291,
      "atk": 299,
      "def": 226,
      "spa": 179,
      "spd": 176,
      "spe": 256
    },
    "fixedIV": null
  },
  "Tauros 4": {
    "species": "Tauros",
    "nature": "Docile",
    "item": "BrightPowder",
    "moves": [
      "Double-Edge",
      "Rock Tomb",
      "Thunderbolt",
      "Surf"
    ],
    "abilities": [
      "Intimidate"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 150,
      "atk": 152,
      "def": 115,
      "spa": 92,
      "spd": 90,
      "spe": 130
    },
    "lvl100Stats": {
      "hp": 291,
      "atk": 299,
      "def": 226,
      "spa": 179,
      "spd": 176,
      "spe": 256
    },
    "fixedIV": null
  },
  "Latias 1": {
    "species": "Latias",
    "nature": "Modest",
    "item": "Lum Berry",
    "moves": [
      "Psychic",
      "Thunderbolt",
      "Ice Beam",
      "Dragon Claw"
    ],
    "abilities": [
      "Levitate"
    ],
    "evs": {
      "hp": 255,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 187,
      "atk": 90,
      "def": 110,
      "spa": 178,
      "spd": 150,
      "spe": 130
    },
    "lvl100Stats": {
      "hp": 364,
      "atk": 176,
      "def": 216,
      "spa": 350,
      "spd": 296,
      "spe": 256
    },
    "fixedIV": null
  },
  "Latios 1": {
    "species": "Latios",
    "nature": "Modest",
    "item": "Lum Berry",
    "moves": [
      "Psychic",
      "Thunderbolt",
      "Ice Beam",
      "Dragon Claw"
    ],
    "abilities": [
      "Levitate"
    ],
    "evs": {
      "hp": 255,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 187,
      "atk": 99,
      "def": 100,
      "spa": 200,
      "spd": 130,
      "spe": 130
    },
    "lvl100Stats": {
      "hp": 364,
      "atk": 194,
      "def": 196,
      "spa": 394,
      "spd": 256,
      "spe": 256
    },
    "fixedIV": null
  },
  "Latias 2": {
    "species": "Latias",
    "nature": "Docile",
    "item": "Quick Claw",
    "moves": [
      "Psychic",
      "Thunderbolt",
      "Ice Beam",
      "Earthquake"
    ],
    "abilities": [
      "Levitate"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 155,
      "atk": 132,
      "def": 110,
      "spa": 162,
      "spd": 150,
      "spe": 130
    },
    "lvl100Stats": {
      "hp": 301,
      "atk": 259,
      "def": 216,
      "spa": 319,
      "spd": 296,
      "spe": 256
    },
    "fixedIV": null
  },
  "Latios 2": {
    "species": "Latios",
    "nature": "Docile",
    "item": "Quick Claw",
    "moves": [
      "Psychic",
      "Thunderbolt",
      "Ice Beam",
      "Earthquake"
    ],
    "abilities": [
      "Levitate"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 155,
      "atk": 142,
      "def": 100,
      "spa": 182,
      "spd": 130,
      "spe": 130
    },
    "lvl100Stats": {
      "hp": 301,
      "atk": 279,
      "def": 196,
      "spa": 359,
      "spd": 256,
      "spe": 256
    },
    "fixedIV": null
  },
  "Latias 3": {
    "species": "Latias",
    "nature": "Docile",
    "item": "Focus Band",
    "moves": [
      "Dragon Claw",
      "Thunderbolt",
      "Ice Beam",
      "Earthquake"
    ],
    "abilities": [
      "Levitate"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 155,
      "atk": 132,
      "def": 110,
      "spa": 162,
      "spd": 150,
      "spe": 130
    },
    "lvl100Stats": {
      "hp": 301,
      "atk": 259,
      "def": 216,
      "spa": 319,
      "spd": 296,
      "spe": 256
    },
    "fixedIV": null
  },
  "Latios 3": {
    "species": "Latios",
    "nature": "Docile",
    "item": "Focus Band",
    "moves": [
      "Dragon Claw",
      "Thunderbolt",
      "Ice Beam",
      "Earthquake"
    ],
    "abilities": [
      "Levitate"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 155,
      "atk": 142,
      "def": 100,
      "spa": 182,
      "spd": 130,
      "spe": 130
    },
    "lvl100Stats": {
      "hp": 301,
      "atk": 279,
      "def": 196,
      "spa": 359,
      "spd": 256,
      "spe": 256
    },
    "fixedIV": null
  },
  "Latias 4": {
    "species": "Latias",
    "nature": "Docile",
    "item": "Leftovers",
    "moves": [
      "Mist Ball",
      "Shadow Ball",
      "Charm",
      "Reflect"
    ],
    "abilities": [
      "Levitate"
    ],
    "evs": {
      "hp": 170,
      "atk": 170,
      "def": 0,
      "spa": 170,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 176,
      "atk": 121,
      "def": 110,
      "spa": 151,
      "spd": 150,
      "spe": 130
    },
    "lvl100Stats": {
      "hp": 343,
      "atk": 238,
      "def": 216,
      "spa": 298,
      "spd": 296,
      "spe": 256
    },
    "fixedIV": null
  },
  "Latios 4": {
    "species": "Latios",
    "nature": "Modest",
    "item": "Lum Berry",
    "moves": [
      "Luster Purge",
      "Thunderbolt",
      "Ice Beam",
      "Dragon Claw"
    ],
    "abilities": [
      "Levitate"
    ],
    "evs": {
      "hp": 255,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 187,
      "atk": 99,
      "def": 100,
      "spa": 200,
      "spd": 130,
      "spe": 130
    },
    "lvl100Stats": {
      "hp": 364,
      "atk": 194,
      "def": 196,
      "spa": 394,
      "spd": 256,
      "spe": 256
    },
    "fixedIV": null
  },
  "Latias 5": {
    "species": "Latias",
    "nature": "Modest",
    "item": "BrightPowder",
    "moves": [
      "Dragon Claw",
      "Thunder Wave",
      "Calm Mind",
      "Recover"
    ],
    "abilities": [
      "Levitate"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 176,
      "atk": 90,
      "def": 131,
      "spa": 143,
      "spd": 171,
      "spe": 130
    },
    "lvl100Stats": {
      "hp": 343,
      "atk": 176,
      "def": 258,
      "spa": 281,
      "spd": 338,
      "spe": 256
    },
    "fixedIV": null
  },
  "Latias 6": {
    "species": "Latias",
    "nature": "Modest",
    "item": "Shell Bell",
    "moves": [
      "Mist Ball",
      "Dragon Claw",
      "Attract",
      "Thunder Wave"
    ],
    "abilities": [
      "Levitate"
    ],
    "evs": {
      "hp": 255,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 187,
      "atk": 90,
      "def": 110,
      "spa": 178,
      "spd": 150,
      "spe": 130
    },
    "lvl100Stats": {
      "hp": 364,
      "atk": 176,
      "def": 216,
      "spa": 350,
      "spd": 296,
      "spe": 256
    },
    "fixedIV": null
  },
  "Latias 7": {
    "species": "Latias",
    "nature": "Adamant",
    "item": "Leftovers",
    "moves": [
      "Earthquake",
      "Shadow Ball",
      "Swagger",
      "Psych Up"
    ],
    "abilities": [
      "Levitate"
    ],
    "evs": {
      "hp": 255,
      "atk": 0,
      "def": 255,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 187,
      "atk": 110,
      "def": 142,
      "spa": 117,
      "spd": 150,
      "spe": 130
    },
    "lvl100Stats": {
      "hp": 364,
      "atk": 215,
      "def": 279,
      "spa": 230,
      "spd": 296,
      "spe": 256
    },
    "fixedIV": null
  },
  "Latios 5": {
    "species": "Latios",
    "nature": "Modest",
    "item": "BrightPowder",
    "moves": [
      "Dragon Claw",
      "Thunder Wave",
      "Calm Mind",
      "Recover"
    ],
    "abilities": [
      "Levitate"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 176,
      "atk": 99,
      "def": 121,
      "spa": 165,
      "spd": 151,
      "spe": 130
    },
    "lvl100Stats": {
      "hp": 343,
      "atk": 194,
      "def": 238,
      "spa": 325,
      "spd": 298,
      "spe": 256
    },
    "fixedIV": null
  },
  "Latios 6": {
    "species": "Latios",
    "nature": "Docile",
    "item": "Shell Bell",
    "moves": [
      "Luster Purge",
      "Shadow Ball",
      "Dragon Claw",
      "Thunder Wave"
    ],
    "abilities": [
      "Levitate"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 155,
      "atk": 142,
      "def": 100,
      "spa": 182,
      "spd": 130,
      "spe": 130
    },
    "lvl100Stats": {
      "hp": 301,
      "atk": 279,
      "def": 196,
      "spa": 359,
      "spd": 256,
      "spe": 256
    },
    "fixedIV": null
  },
  "Latios 7": {
    "species": "Latios",
    "nature": "Adamant",
    "item": "BrightPowder",
    "moves": [
      "Earthquake",
      "Shadow Ball",
      "Dragon Dance",
      "Recover"
    ],
    "abilities": [
      "Levitate"
    ],
    "evs": {
      "hp": 255,
      "atk": 0,
      "def": 255,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 187,
      "atk": 121,
      "def": 132,
      "spa": 135,
      "spd": 130,
      "spe": 130
    },
    "lvl100Stats": {
      "hp": 364,
      "atk": 237,
      "def": 259,
      "spa": 266,
      "spd": 256,
      "spe": 256
    },
    "fixedIV": null
  },
  "Greta Gold Gengar": {
    "species": "Gengar",
    "nature": "Modest",
    "item": "Leftovers",
    "moves": [
      "Psychic",
      "Hypnosis",
      "Dream Eater",
      "Destiny Bond"
    ],
    "abilities": [
      "Levitate"
    ],
    "evs": {
      "hp": 252,
      "atk": 0,
      "def": 252,
      "spa": 6,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 167,
      "atk": 76,
      "def": 112,
      "spa": 166,
      "spd": 95,
      "spe": 130
    },
    "lvl100Stats": {
      "hp": 324,
      "atk": 149,
      "def": 219,
      "spa": 326,
      "spd": 186,
      "spe": 256
    },
    "fixedIV": 31
  },
  "Greta Silver Heracross": {
    "species": "Heracross",
    "nature": "Jolly",
    "item": "Salac Berry",
    "moves": [
      "Megahorn",
      "Rock Tomb",
      "Endure",
      "Reversal"
    ],
    "abilities": [
      "Guts",
      "Swarm"
    ],
    "evs": {
      "hp": 106,
      "atk": 152,
      "def": 0,
      "spa": 0,
      "spd": 100,
      "spe": 152
    },
    "lvl50Stats": {
      "hp": 163,
      "atk": 159,
      "def": 90,
      "spa": 49,
      "spd": 122,
      "spe": 130
    },
    "lvl100Stats": {
      "hp": 316,
      "atk": 313,
      "def": 175,
      "spa": 94,
      "spd": 240,
      "spe": 256
    },
    "fixedIV": 20
  },
  "Flareon 3": {
    "species": "Flareon",
    "nature": "Jolly",
    "item": "Quick Claw",
    "moves": [
      "Shadow Ball",
      "Flail",
      "Endure",
      "Overheat"
    ],
    "abilities": [
      "Flash Fire"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 140,
      "atk": 182,
      "def": 80,
      "spa": 103,
      "spd": 130,
      "spe": 128
    },
    "lvl100Stats": {
      "hp": 271,
      "atk": 359,
      "def": 156,
      "spa": 203,
      "spd": 256,
      "spe": 251
    },
    "fixedIV": null
  },
  "Spenser Gold Arcanine": {
    "species": "Arcanine",
    "nature": "Hasty",
    "item": "White Herb",
    "moves": [
      "Overheat",
      "ExtremeSpeed",
      "Roar",
      "Protect"
    ],
    "abilities": [
      "Flash Fire",
      "Intimidate"
    ],
    "evs": {
      "hp": 6,
      "atk": 252,
      "def": 252,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 166,
      "atk": 162,
      "def": 118,
      "spa": 120,
      "spd": 100,
      "spe": 127
    },
    "lvl100Stats": {
      "hp": 322,
      "atk": 319,
      "def": 233,
      "spa": 236,
      "spd": 196,
      "spe": 248
    },
    "fixedIV": 31
  },
  "Tucker Silver Salamence": {
    "species": "Salamence",
    "nature": "Adamant",
    "item": "Lum Berry",
    "moves": [
      "Earthquake",
      "Brick Break",
      "Dragon Claw",
      "Aerial Ace"
    ],
    "abilities": [
      "Blaze"
    ],
    "evs": {
      "hp": 152,
      "atk": 152,
      "def": 106,
      "spa": 0,
      "spd": 0,
      "spe": 100
    },
    "lvl50Stats": {
      "hp": 184,
      "atk": 185,
      "def": 108,
      "spa": 112,
      "spd": 95,
      "spe": 127
    },
    "lvl100Stats": {
      "hp": 358,
      "atk": 366,
      "def": 211,
      "spa": 220,
      "spd": 185,
      "spe": 250
    },
    "fixedIV": 20
  },
  "Golduck 2": {
    "species": "Golduck",
    "nature": "Quirky",
    "item": "Lum Berry",
    "moves": [
      "Cross Chop",
      "Surf",
      "Swagger",
      "Psych Up"
    ],
    "abilities": [
      "Damp",
      "Cloud Nine"
    ],
    "evs": {
      "hp": 0,
      "atk": 170,
      "def": 0,
      "spa": 170,
      "spd": 0,
      "spe": 170
    },
    "lvl50Stats": {
      "hp": 155,
      "atk": 123,
      "def": 98,
      "spa": 136,
      "spd": 100,
      "spe": 126
    },
    "lvl100Stats": {
      "hp": 301,
      "atk": 242,
      "def": 192,
      "spa": 268,
      "spd": 196,
      "spe": 248
    },
    "fixedIV": null
  },
  "Spenser Silver Slaking": {
    "species": "Slaking",
    "nature": "Hardy",
    "item": "Scope Lens",
    "moves": [
      "Earthquake",
      "Swagger",
      "Shadow Ball",
      "Brick Break"
    ],
    "abilities": [
      "Truant"
    ],
    "evs": {
      "hp": 152,
      "atk": 152,
      "def": 0,
      "spa": 100,
      "spd": 0,
      "spe": 106
    },
    "lvl50Stats": {
      "hp": 237,
      "atk": 192,
      "def": 113,
      "spa": 120,
      "spd": 78,
      "spe": 126
    },
    "lvl100Stats": {
      "hp": 464,
      "atk": 379,
      "def": 221,
      "spa": 236,
      "spd": 151,
      "spe": 247
    },
    "fixedIV": 16
  },
  "Electabuzz 4": {
    "species": "Electabuzz",
    "nature": "Docile",
    "item": "Scope Lens",
    "moves": [
      "Thunderbolt",
      "Psychic",
      "Mega Kick",
      "Cross Chop"
    ],
    "abilities": [
      "Static"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 140,
      "atk": 135,
      "def": 77,
      "spa": 147,
      "spd": 105,
      "spe": 125
    },
    "lvl100Stats": {
      "hp": 271,
      "atk": 265,
      "def": 150,
      "spa": 289,
      "spd": 206,
      "spe": 246
    },
    "fixedIV": null
  },
  "Lapras 2": {
    "species": "Lapras",
    "nature": "Timid",
    "item": "Quick Claw",
    "moves": [
      "Surf",
      "Ice Beam",
      "Body Slam",
      "Roar"
    ],
    "abilities": [
      "Water Absorb",
      "Shell Armor"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 205,
      "atk": 94,
      "def": 100,
      "spa": 137,
      "spd": 115,
      "spe": 123
    },
    "lvl100Stats": {
      "hp": 401,
      "atk": 185,
      "def": 196,
      "spa": 269,
      "spd": 226,
      "spe": 240
    },
    "fixedIV": null
  },
  "Breloom 2": {
    "species": "Breloom",
    "nature": "Docile",
    "item": "BrightPowder",
    "moves": [
      "Giga Drain",
      "Leech Seed",
      "Focus Punch",
      "Spore"
    ],
    "abilities": [
      "Effect Spore"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 135,
      "atk": 150,
      "def": 100,
      "spa": 112,
      "spd": 80,
      "spe": 122
    },
    "lvl100Stats": {
      "hp": 261,
      "atk": 296,
      "def": 196,
      "spa": 219,
      "spd": 156,
      "spe": 239
    },
    "fixedIV": null
  },
  "Breloom 3": {
    "species": "Breloom",
    "nature": "Adamant",
    "item": "Leftovers",
    "moves": [
      "Iron Tail",
      "Focus Punch",
      "Attract",
      "Spore"
    ],
    "abilities": [
      "Effect Spore"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 135,
      "atk": 200,
      "def": 100,
      "spa": 72,
      "spd": 80,
      "spe": 122
    },
    "lvl100Stats": {
      "hp": 261,
      "atk": 394,
      "def": 196,
      "spa": 140,
      "spd": 156,
      "spe": 239
    },
    "fixedIV": null
  },
  "Breloom 4": {
    "species": "Breloom",
    "nature": "Adamant",
    "item": "Quick Claw",
    "moves": [
      "Focus Punch",
      "Sludge Bomb",
      "Spore",
      "Double Team"
    ],
    "abilities": [
      "Effect Spore"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 135,
      "atk": 200,
      "def": 100,
      "spa": 72,
      "spd": 80,
      "spe": 122
    },
    "lvl100Stats": {
      "hp": 261,
      "atk": 394,
      "def": 196,
      "spa": 140,
      "spd": 156,
      "spe": 239
    },
    "fixedIV": null
  },
  "Metagross 5": {
    "species": "Metagross",
    "nature": "Jolly",
    "item": "Quick Claw",
    "moves": [
      "Explosion",
      "Earthquake",
      "Rock Slide",
      "Brick Break"
    ],
    "abilities": [
      "Clear Body"
    ],
    "evs": {
      "hp": 170,
      "atk": 170,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 170
    },
    "lvl50Stats": {
      "hp": 176,
      "atk": 176,
      "def": 150,
      "spa": 103,
      "spd": 110,
      "spe": 122
    },
    "lvl100Stats": {
      "hp": 343,
      "atk": 348,
      "def": 296,
      "spa": 203,
      "spd": 216,
      "spe": 239
    },
    "fixedIV": null
  },
  "Glalie 3": {
    "species": "Glalie",
    "nature": "Hardy",
    "item": "Shell Bell",
    "moves": [
      "Blizzard",
      "Earthquake",
      "Double-Edge",
      "Shadow Ball"
    ],
    "abilities": [
      "Inner Focus"
    ],
    "evs": {
      "hp": 0,
      "atk": 170,
      "def": 0,
      "spa": 170,
      "spd": 0,
      "spe": 170
    },
    "lvl50Stats": {
      "hp": 155,
      "atk": 121,
      "def": 100,
      "spa": 121,
      "spd": 100,
      "spe": 121
    },
    "lvl100Stats": {
      "hp": 301,
      "atk": 238,
      "def": 196,
      "spa": 238,
      "spd": 196,
      "spe": 238
    },
    "fixedIV": null
  },
  "Gardevoir 5": {
    "species": "Gardevoir",
    "nature": "Docile",
    "item": "Salac Berry",
    "moves": [
      "Psychic",
      "Shadow Ball",
      "Endure",
      "Destiny Bond"
    ],
    "abilities": [
      "Synchronize",
      "Trace"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 0,
      "spe": 170
    },
    "lvl50Stats": {
      "hp": 164,
      "atk": 85,
      "def": 106,
      "spa": 145,
      "spd": 135,
      "spe": 121
    },
    "lvl100Stats": {
      "hp": 319,
      "atk": 166,
      "def": 208,
      "spa": 286,
      "spd": 266,
      "spe": 238
    },
    "fixedIV": null
  },
  "Miltank 1": {
    "species": "Miltank",
    "nature": "Careful",
    "item": "Focus Band",
    "moves": [
      "Facade",
      "Shadow Ball",
      "Counter",
      "Milk Drink"
    ],
    "abilities": [
      "Thick Fat"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 191,
      "atk": 100,
      "def": 146,
      "spa": 54,
      "spd": 122,
      "spe": 120
    },
    "lvl100Stats": {
      "hp": 373,
      "atk": 196,
      "def": 288,
      "spa": 104,
      "spd": 239,
      "spe": 236
    },
    "fixedIV": null
  },
  "Tentacruel 1": {
    "species": "Tentacruel",
    "nature": "Impish",
    "item": "Persim Berry",
    "moves": [
      "Sludge Bomb",
      "Icy Wind",
      "Barrier",
      "Confuse Ray"
    ],
    "abilities": [
      "Clear Body",
      "Liquid Ooze"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 255,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 155,
      "atk": 122,
      "def": 128,
      "spa": 90,
      "spd": 140,
      "spe": 120
    },
    "lvl100Stats": {
      "hp": 301,
      "atk": 239,
      "def": 251,
      "spa": 176,
      "spd": 276,
      "spe": 236
    },
    "fixedIV": null
  },
  "Slaking 1": {
    "species": "Slaking",
    "nature": "Adamant",
    "item": "Scope Lens",
    "moves": [
      "Yawn",
      "Bulk Up",
      "Swagger",
      "Aerial Ace"
    ],
    "abilities": [
      "Truant"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 246,
      "atk": 198,
      "def": 141,
      "spa": 103,
      "spd": 106,
      "spe": 120
    },
    "lvl100Stats": {
      "hp": 483,
      "atk": 391,
      "def": 278,
      "spa": 203,
      "spd": 208,
      "spe": 236
    },
    "fixedIV": null
  },
  "Miltank 2": {
    "species": "Miltank",
    "nature": "Careful",
    "item": "Leftovers",
    "moves": [
      "Focus Punch",
      "Shadow Ball",
      "Attract",
      "Thunder Wave"
    ],
    "abilities": [
      "Thick Fat"
    ],
    "evs": {
      "hp": 170,
      "atk": 170,
      "def": 0,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 191,
      "atk": 121,
      "def": 125,
      "spa": 54,
      "spd": 122,
      "spe": 120
    },
    "lvl100Stats": {
      "hp": 373,
      "atk": 238,
      "def": 246,
      "spa": 104,
      "spd": 239,
      "spe": 236
    },
    "fixedIV": null
  },
  "Tentacruel 2": {
    "species": "Tentacruel",
    "nature": "Hardy",
    "item": "Leftovers",
    "moves": [
      "Toxic",
      "Giga Drain",
      "Confuse Ray",
      "Surf"
    ],
    "abilities": [
      "Clear Body",
      "Liquid Ooze"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 170,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 176,
      "atk": 90,
      "def": 106,
      "spa": 121,
      "spd": 140,
      "spe": 120
    },
    "lvl100Stats": {
      "hp": 343,
      "atk": 176,
      "def": 208,
      "spa": 238,
      "spd": 276,
      "spe": 236
    },
    "fixedIV": null
  },
  "Slaking 2": {
    "species": "Slaking",
    "nature": "Adamant",
    "item": "Leftovers",
    "moves": [
      "Mega Kick",
      "Shadow Ball",
      "Yawn",
      "Amnesia"
    ],
    "abilities": [
      "Truant"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 255,
      "spa": 0,
      "spd": 255,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 225,
      "atk": 198,
      "def": 152,
      "spa": 103,
      "spd": 117,
      "spe": 120
    },
    "lvl100Stats": {
      "hp": 441,
      "atk": 391,
      "def": 299,
      "spa": 203,
      "spd": 229,
      "spe": 236
    },
    "fixedIV": null
  },
  "Exploud 3": {
    "species": "Exploud",
    "nature": "Modest",
    "item": "White Herb",
    "moves": [
      "Overheat",
      "Ice Beam",
      "ThunderPunch",
      "Extrasensory"
    ],
    "abilities": [
      "Soundproof"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 179,
      "atk": 100,
      "def": 83,
      "spa": 157,
      "spd": 83,
      "spe": 120
    },
    "lvl100Stats": {
      "hp": 349,
      "atk": 196,
      "def": 162,
      "spa": 309,
      "spd": 162,
      "spe": 235
    },
    "fixedIV": null
  },
  "Miltank 3": {
    "species": "Miltank",
    "nature": "Adamant",
    "item": "Salac Berry",
    "moves": [
      "Reversal",
      "Endure",
      "Earthquake",
      "Shadow Ball"
    ],
    "abilities": [
      "Thick Fat"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 255,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 170,
      "atk": 145,
      "def": 125,
      "spa": 54,
      "spd": 122,
      "spe": 120
    },
    "lvl100Stats": {
      "hp": 331,
      "atk": 284,
      "def": 246,
      "spa": 104,
      "spd": 239,
      "spe": 236
    },
    "fixedIV": null
  },
  "Salamence 3": {
    "species": "Salamence",
    "nature": "Hardy",
    "item": "Salac Berry",
    "moves": [
      "Double-Edge",
      "Earthquake",
      "Crunch",
      "Endure"
    ],
    "abilities": [
      "Intimidate"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 170,
      "atk": 187,
      "def": 100,
      "spa": 162,
      "spd": 100,
      "spe": 120
    },
    "lvl100Stats": {
      "hp": 331,
      "atk": 369,
      "def": 196,
      "spa": 319,
      "spd": 196,
      "spe": 236
    },
    "fixedIV": null
  },
  "Slaking 3": {
    "species": "Slaking",
    "nature": "Adamant",
    "item": "Choice Band",
    "moves": [
      "Earthquake",
      "Shadow Ball",
      "Aerial Ace",
      "Brick Break"
    ],
    "abilities": [
      "Truant"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 255,
      "spa": 0,
      "spd": 255,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 225,
      "atk": 198,
      "def": 152,
      "spa": 103,
      "spd": 117,
      "spe": 120
    },
    "lvl100Stats": {
      "hp": 441,
      "atk": 391,
      "def": 299,
      "spa": 203,
      "spd": 229,
      "spe": 236
    },
    "fixedIV": null
  },
  "Fearow 4": {
    "species": "Fearow",
    "nature": "Hardy",
    "item": "Lum Berry",
    "moves": [
      "Drill Peck",
      "Double-Edge",
      "Steel Wing",
      "Sky Attack"
    ],
    "abilities": [
      "Keen Eye"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 140,
      "atk": 142,
      "def": 85,
      "spa": 113,
      "spd": 81,
      "spe": 120
    },
    "lvl100Stats": {
      "hp": 271,
      "atk": 279,
      "def": 166,
      "spa": 221,
      "spd": 158,
      "spe": 236
    },
    "fixedIV": null
  },
  "Raichu 4": {
    "species": "Raichu",
    "nature": "Docile",
    "item": "BrightPowder",
    "moves": [
      "Thunderbolt",
      "Thunder Wave",
      "Protect",
      "Mega Kick"
    ],
    "abilities": [
      "Static"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 135,
      "atk": 142,
      "def": 75,
      "spa": 142,
      "spd": 100,
      "spe": 120
    },
    "lvl100Stats": {
      "hp": 261,
      "atk": 279,
      "def": 146,
      "spa": 279,
      "spd": 196,
      "spe": 236
    },
    "fixedIV": null
  },
  "Miltank 4": {
    "species": "Miltank",
    "nature": "Adamant",
    "item": "Lum Berry",
    "moves": [
      "Double-Edge",
      "Curse",
      "Double Team",
      "Milk Drink"
    ],
    "abilities": [
      "Thick Fat"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 255,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 170,
      "atk": 145,
      "def": 125,
      "spa": 54,
      "spd": 122,
      "spe": 120
    },
    "lvl100Stats": {
      "hp": 331,
      "atk": 284,
      "def": 246,
      "spa": 104,
      "spd": 239,
      "spe": 236
    },
    "fixedIV": null
  },
  "Tentacruel 4": {
    "species": "Tentacruel",
    "nature": "Quirky",
    "item": "Shell Bell",
    "moves": [
      "Hydro Pump",
      "Sludge Bomb",
      "Ice Beam",
      "Mirror Coat"
    ],
    "abilities": [
      "Clear Body",
      "Liquid Ooze"
    ],
    "evs": {
      "hp": 0,
      "atk": 170,
      "def": 170,
      "spa": 170,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 155,
      "atk": 111,
      "def": 106,
      "spa": 121,
      "spd": 140,
      "spe": 120
    },
    "lvl100Stats": {
      "hp": 301,
      "atk": 218,
      "def": 208,
      "spa": 238,
      "spd": 276,
      "spe": 236
    },
    "fixedIV": null
  },
  "Salamence 4": {
    "species": "Salamence",
    "nature": "Adamant",
    "item": "BrightPowder",
    "moves": [
      "Double-Edge",
      "Earthquake",
      "Aerial Ace",
      "Dragon Dance"
    ],
    "abilities": [
      "Intimidate"
    ],
    "evs": {
      "hp": 255,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 202,
      "atk": 205,
      "def": 100,
      "spa": 117,
      "spd": 100,
      "spe": 120
    },
    "lvl100Stats": {
      "hp": 394,
      "atk": 405,
      "def": 196,
      "spa": 230,
      "spd": 196,
      "spe": 236
    },
    "fixedIV": null
  },
  "Slaking 4": {
    "species": "Slaking",
    "nature": "Modest",
    "item": "Lum Berry",
    "moves": [
      "Thunderbolt",
      "Flamethrower",
      "Ice Beam",
      "Yawn"
    ],
    "abilities": [
      "Truant"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 255,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 225,
      "atk": 162,
      "def": 120,
      "spa": 161,
      "spd": 117,
      "spe": 120
    },
    "lvl100Stats": {
      "hp": 441,
      "atk": 320,
      "def": 236,
      "spa": 317,
      "spd": 229,
      "spe": 236
    },
    "fixedIV": null
  },
  "Zapdos 4": {
    "species": "Zapdos",
    "nature": "Docile",
    "item": "Shell Bell",
    "moves": [
      "Thunderbolt",
      "Drill Peck",
      "Thunder Wave",
      "Light Screen"
    ],
    "abilities": [
      "Pressure"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 165,
      "atk": 142,
      "def": 105,
      "spa": 177,
      "spd": 110,
      "spe": 120
    },
    "lvl100Stats": {
      "hp": 321,
      "atk": 279,
      "def": 206,
      "spa": 349,
      "spd": 216,
      "spe": 236
    },
    "fixedIV": null
  },
  "Salamence 5": {
    "species": "Salamence",
    "nature": "Adamant",
    "item": "BrightPowder",
    "moves": [
      "Facade",
      "Earthquake",
      "Rock Slide",
      "Dragon Dance"
    ],
    "abilities": [
      "Intimidate"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 191,
      "atk": 171,
      "def": 121,
      "spa": 117,
      "spd": 121,
      "spe": 120
    },
    "lvl100Stats": {
      "hp": 373,
      "atk": 336,
      "def": 238,
      "spa": 230,
      "spd": 238,
      "spe": 236
    },
    "fixedIV": null
  },
  "Salamence 6": {
    "species": "Salamence",
    "nature": "Hardy",
    "item": "Lum Berry",
    "moves": [
      "Headbutt",
      "Aerial Ace",
      "Crunch",
      "Dragon Dance"
    ],
    "abilities": [
      "Intimidate"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 191,
      "atk": 155,
      "def": 121,
      "spa": 130,
      "spd": 121,
      "spe": 120
    },
    "lvl100Stats": {
      "hp": 373,
      "atk": 306,
      "def": 238,
      "spa": 256,
      "spd": 238,
      "spe": 236
    },
    "fixedIV": null
  },
  "Zapdos 5": {
    "species": "Zapdos",
    "nature": "Docile",
    "item": "Scope Lens",
    "moves": [
      "Thunderbolt",
      "Drill Peck",
      "Double-Edge",
      "Thunder Wave"
    ],
    "abilities": [
      "Pressure"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 165,
      "atk": 142,
      "def": 105,
      "spa": 177,
      "spd": 110,
      "spe": 120
    },
    "lvl100Stats": {
      "hp": 321,
      "atk": 279,
      "def": 206,
      "spa": 349,
      "spd": 216,
      "spe": 236
    },
    "fixedIV": null
  },
  "Entei 5": {
    "species": "Entei",
    "nature": "Docile",
    "item": "Salac Berry",
    "moves": [
      "Fire Blast",
      "Double-Edge",
      "Endure",
      "Reflect"
    ],
    "abilities": [
      "Pressure"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 255,
      "spa": 0,
      "spd": 255,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 190,
      "atk": 135,
      "def": 137,
      "spa": 110,
      "spd": 127,
      "spe": 120
    },
    "lvl100Stats": {
      "hp": 371,
      "atk": 266,
      "def": 269,
      "spa": 216,
      "spd": 249,
      "spe": 236
    },
    "fixedIV": null
  },
  "Entei 6": {
    "species": "Entei",
    "nature": "Modest",
    "item": "Chesto Berry",
    "moves": [
      "Flamethrower",
      "Calm Mind",
      "Roar",
      "Rest"
    ],
    "abilities": [
      "Pressure"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 255,
      "spa": 0,
      "spd": 255,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 190,
      "atk": 121,
      "def": 137,
      "spa": 121,
      "spd": 127,
      "spe": 120
    },
    "lvl100Stats": {
      "hp": 371,
      "atk": 239,
      "def": 269,
      "spa": 237,
      "spd": 249,
      "spe": 236
    },
    "fixedIV": null
  },
  "Tucker Silver Charizard": {
    "species": "Charizard",
    "nature": "Quiet",
    "item": "White Herb",
    "moves": [
      "Overheat",
      "Rock Slide",
      "Aerial Ace",
      "Earthquake"
    ],
    "abilities": [
      "Torrent"
    ],
    "evs": {
      "hp": 100,
      "atk": 152,
      "def": 106,
      "spa": 0,
      "spd": 0,
      "spe": 152
    },
    "lvl50Stats": {
      "hp": 160,
      "atk": 118,
      "def": 106,
      "spa": 136,
      "spd": 100,
      "spe": 120
    },
    "lvl100Stats": {
      "hp": 311,
      "atk": 231,
      "def": 207,
      "spa": 267,
      "spd": 195,
      "spe": 236
    },
    "fixedIV": 20
  },
  "Lanturn 3": {
    "species": "Lanturn",
    "nature": "Modest",
    "item": "BrightPowder",
    "moves": [
      "Hydro Pump",
      "Thunder",
      "Confuse Ray",
      "Rain Dance"
    ],
    "abilities": [
      "Volt Absorb",
      "Illuminate"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 200,
      "atk": 70,
      "def": 78,
      "spa": 140,
      "spd": 96,
      "spe": 119
    },
    "lvl100Stats": {
      "hp": 391,
      "atk": 136,
      "def": 152,
      "spa": 276,
      "spd": 188,
      "spe": 233
    },
    "fixedIV": null
  },
  "Lanturn 4": {
    "species": "Lanturn",
    "nature": "Modest",
    "item": "Lum Berry",
    "moves": [
      "Surf",
      "Thunderbolt",
      "Ice Beam",
      "Confuse Ray"
    ],
    "abilities": [
      "Volt Absorb",
      "Illuminate"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 200,
      "atk": 70,
      "def": 78,
      "spa": 140,
      "spd": 96,
      "spe": 119
    },
    "lvl100Stats": {
      "hp": 391,
      "atk": 136,
      "def": 152,
      "spa": 276,
      "spd": 188,
      "spe": 233
    },
    "fixedIV": null
  },
  "Anabel Silver Entei": {
    "species": "Entei",
    "nature": "Lonely",
    "item": "Lum Berry",
    "moves": [
      "Fire Blast",
      "Calm Mind",
      "Return",
      "Roar"
    ],
    "abilities": [
      "Pressure"
    ],
    "evs": {
      "hp": 100,
      "atk": 152,
      "def": 152,
      "spa": 100,
      "spd": 6,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 199,
      "atk": 166,
      "def": 108,
      "spa": 119,
      "spd": 92,
      "spe": 117
    },
    "lvl100Stats": {
      "hp": 389,
      "atk": 326,
      "def": 213,
      "spa": 234,
      "spd": 180,
      "spe": 229
    },
    "fixedIV": 24
  },
  "Spenser Gold Suicune": {
    "species": "Suicune",
    "nature": "Hasty",
    "item": "King's Rock",
    "moves": [
      "Blizzard",
      "Surf",
      "Bite",
      "Calm Mind"
    ],
    "abilities": [
      "Pressure"
    ],
    "evs": {
      "hp": 252,
      "atk": 0,
      "def": 252,
      "spa": 0,
      "spd": 0,
      "spe": 6
    },
    "lvl50Stats": {
      "hp": 207,
      "atk": 95,
      "def": 150,
      "spa": 110,
      "spd": 135,
      "spe": 116
    },
    "lvl100Stats": {
      "hp": 404,
      "atk": 186,
      "def": 296,
      "spa": 216,
      "spd": 266,
      "spe": 227
    },
    "fixedIV": 31
  },
  "Jynx 1": {
    "species": "Jynx",
    "nature": "Modest",
    "item": "Shell Bell",
    "moves": [
      "Ice Beam",
      "Fake Out",
      "Lovely Kiss",
      "Attract"
    ],
    "abilities": [
      "Oblivious"
    ],
    "evs": {
      "hp": 255,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 172,
      "atk": 63,
      "def": 55,
      "spa": 183,
      "spd": 115,
      "spe": 115
    },
    "lvl100Stats": {
      "hp": 334,
      "atk": 122,
      "def": 106,
      "spa": 361,
      "spd": 226,
      "spe": 226
    },
    "fixedIV": null
  },
  "Xatu 1": {
    "species": "Xatu",
    "nature": "Hardy",
    "item": "Sharp Beak",
    "moves": [
      "Drill Peck",
      "Night Shade",
      "Wish",
      "Future Sight"
    ],
    "abilities": [
      "Synchronize",
      "Early Bird"
    ],
    "evs": {
      "hp": 170,
      "atk": 170,
      "def": 0,
      "spa": 170,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 161,
      "atk": 116,
      "def": 90,
      "spa": 136,
      "spd": 90,
      "spe": 115
    },
    "lvl100Stats": {
      "hp": 313,
      "atk": 228,
      "def": 176,
      "spa": 268,
      "spd": 176,
      "spe": 226
    },
    "fixedIV": null
  },
  "Jynx 2": {
    "species": "Jynx",
    "nature": "Impish",
    "item": "BrightPowder",
    "moves": [
      "Perish Song",
      "Mean Look",
      "Lovely Kiss",
      "Protect"
    ],
    "abilities": [
      "Oblivious"
    ],
    "evs": {
      "hp": 255,
      "atk": 0,
      "def": 255,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 172,
      "atk": 70,
      "def": 95,
      "spa": 121,
      "spd": 115,
      "spe": 115
    },
    "lvl100Stats": {
      "hp": 334,
      "atk": 136,
      "def": 185,
      "spa": 239,
      "spd": 226,
      "spe": 226
    },
    "fixedIV": null
  },
  "Xatu 2": {
    "species": "Xatu",
    "nature": "Impish",
    "item": "Leftovers",
    "moves": [
      "Fly",
      "Toxic",
      "Confuse Ray",
      "Attract"
    ],
    "abilities": [
      "Synchronize",
      "Early Bird"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 161,
      "atk": 95,
      "def": 122,
      "spa": 103,
      "spd": 111,
      "spe": 115
    },
    "lvl100Stats": {
      "hp": 313,
      "atk": 186,
      "def": 239,
      "spa": 203,
      "spd": 218,
      "spe": 226
    },
    "fixedIV": null
  },
  "Jynx 3": {
    "species": "Jynx",
    "nature": "Hardy",
    "item": "Quick Claw",
    "moves": [
      "Dream Eater",
      "Lovely Kiss",
      "Attract",
      "Substitute"
    ],
    "abilities": [
      "Oblivious"
    ],
    "evs": {
      "hp": 255,
      "atk": 0,
      "def": 255,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 172,
      "atk": 70,
      "def": 87,
      "spa": 135,
      "spd": 115,
      "spe": 115
    },
    "lvl100Stats": {
      "hp": 334,
      "atk": 136,
      "def": 169,
      "spa": 266,
      "spd": 226,
      "spe": 226
    },
    "fixedIV": null
  },
  "Jynx 4": {
    "species": "Jynx",
    "nature": "Modest",
    "item": "Lum Berry",
    "moves": [
      "Psychic",
      "Ice Beam",
      "Lovely Kiss",
      "Fake Tears"
    ],
    "abilities": [
      "Oblivious"
    ],
    "evs": {
      "hp": 255,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 172,
      "atk": 63,
      "def": 55,
      "spa": 183,
      "spd": 115,
      "spe": 115
    },
    "lvl100Stats": {
      "hp": 334,
      "atk": 122,
      "def": 106,
      "spa": 361,
      "spd": 226,
      "spe": 226
    },
    "fixedIV": null
  },
  "Xatu 4": {
    "species": "Xatu",
    "nature": "Docile",
    "item": "Petaya Berry",
    "moves": [
      "Psychic",
      "Drill Peck",
      "Shadow Ball",
      "Confuse Ray"
    ],
    "abilities": [
      "Synchronize",
      "Early Bird"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 140,
      "atk": 127,
      "def": 90,
      "spa": 147,
      "spd": 90,
      "spe": 115
    },
    "lvl100Stats": {
      "hp": 271,
      "atk": 249,
      "def": 176,
      "spa": 289,
      "spd": 176,
      "spe": 226
    },
    "fixedIV": null
  },
  "Magmar 3": {
    "species": "Magmar",
    "nature": "Impish",
    "item": "Scope Lens",
    "moves": [
      "Mega Kick",
      "Cross Chop",
      "Iron Tail",
      "Counter"
    ],
    "abilities": [
      "Flame Body"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 255,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 140,
      "atk": 147,
      "def": 119,
      "spa": 108,
      "spd": 105,
      "spe": 113
    },
    "lvl100Stats": {
      "hp": 271,
      "atk": 289,
      "def": 234,
      "spa": 212,
      "spd": 206,
      "spe": 222
    },
    "fixedIV": null
  },
  "Magmar 4": {
    "species": "Magmar",
    "nature": "Docile",
    "item": "Scope Lens",
    "moves": [
      "Flamethrower",
      "Psychic",
      "Cross Chop",
      "Confuse Ray"
    ],
    "abilities": [
      "Flame Body"
    ],
    "evs": {
      "hp": 255,
      "atk": 0,
      "def": 255,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 172,
      "atk": 115,
      "def": 109,
      "spa": 120,
      "spd": 105,
      "spe": 113
    },
    "lvl100Stats": {
      "hp": 334,
      "atk": 226,
      "def": 213,
      "spa": 236,
      "spd": 206,
      "spe": 222
    },
    "fixedIV": null
  },
  "Electabuzz 1": {
    "species": "Electabuzz",
    "nature": "Relaxed",
    "item": "Cheri Berry",
    "moves": [
      "Thunderbolt",
      "Thunder Wave",
      "Brick Break",
      "Light Screen"
    ],
    "abilities": [
      "Static"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 170,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 161,
      "atk": 103,
      "def": 108,
      "spa": 136,
      "spd": 105,
      "spe": 112
    },
    "lvl100Stats": {
      "hp": 313,
      "atk": 202,
      "def": 211,
      "spa": 268,
      "spd": 206,
      "spe": 221
    },
    "fixedIV": null
  },
  "Donphan 2": {
    "species": "Donphan",
    "nature": "Jolly",
    "item": "Quick Claw",
    "moves": [
      "Flail",
      "Endure",
      "Earthquake",
      "Rock Tomb"
    ],
    "abilities": [
      "Sturdy"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 165,
      "atk": 172,
      "def": 140,
      "spa": 72,
      "spd": 80,
      "spe": 112
    },
    "lvl100Stats": {
      "hp": 321,
      "atk": 339,
      "def": 276,
      "spa": 140,
      "spd": 156,
      "spe": 218
    },
    "fixedIV": null
  },
  "Metagross 1": {
    "species": "Metagross",
    "nature": "Adamant",
    "item": "Leftovers",
    "moves": [
      "Meteor Mash",
      "Aerial Ace",
      "Facade",
      "Light Screen"
    ],
    "abilities": [
      "Clear Body"
    ],
    "evs": {
      "hp": 0,
      "atk": 170,
      "def": 0,
      "spa": 0,
      "spd": 170,
      "spe": 170
    },
    "lvl50Stats": {
      "hp": 155,
      "atk": 194,
      "def": 150,
      "spa": 103,
      "spd": 131,
      "spe": 111
    },
    "lvl100Stats": {
      "hp": 301,
      "atk": 382,
      "def": 296,
      "spa": 203,
      "spd": 258,
      "spe": 218
    },
    "fixedIV": null
  },
  "Metagross 2": {
    "species": "Metagross",
    "nature": "Adamant",
    "item": "Lum Berry",
    "moves": [
      "Earthquake",
      "Meteor Mash",
      "Psych Up",
      "Swagger"
    ],
    "abilities": [
      "Clear Body"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 0,
      "spa": 0,
      "spd": 170,
      "spe": 170
    },
    "lvl50Stats": {
      "hp": 176,
      "atk": 171,
      "def": 150,
      "spa": 103,
      "spd": 131,
      "spe": 111
    },
    "lvl100Stats": {
      "hp": 343,
      "atk": 336,
      "def": 296,
      "spa": 203,
      "spd": 258,
      "spe": 218
    },
    "fixedIV": null
  },
  "Metagross 3": {
    "species": "Metagross",
    "nature": "Adamant",
    "item": "Chesto Berry",
    "moves": [
      "Earthquake",
      "Meteor Mash",
      "Double Team",
      "Rest"
    ],
    "abilities": [
      "Clear Body"
    ],
    "evs": {
      "hp": 170,
      "atk": 170,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 170
    },
    "lvl50Stats": {
      "hp": 176,
      "atk": 194,
      "def": 150,
      "spa": 103,
      "spd": 110,
      "spe": 111
    },
    "lvl100Stats": {
      "hp": 343,
      "atk": 382,
      "def": 296,
      "spa": 203,
      "spd": 216,
      "spe": 218
    },
    "fixedIV": null
  },
  "Metagross 8": {
    "species": "Metagross",
    "nature": "Adamant",
    "item": "Quick Claw",
    "moves": [
      "Meteor Mash",
      "Earthquake",
      "Brick Break",
      "Explosion"
    ],
    "abilities": [
      "Clear Body"
    ],
    "evs": {
      "hp": 170,
      "atk": 170,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 170
    },
    "lvl50Stats": {
      "hp": 176,
      "atk": 194,
      "def": 150,
      "spa": 103,
      "spd": 110,
      "spe": 111
    },
    "lvl100Stats": {
      "hp": 343,
      "atk": 382,
      "def": 296,
      "spa": 203,
      "spd": 216,
      "spe": 218
    },
    "fixedIV": null
  },
  "Kangaskhan 1": {
    "species": "Kangaskhan",
    "nature": "Adamant",
    "item": "Focus Band",
    "moves": [
      "Dizzy Punch",
      "Brick Break",
      "Counter",
      "Fake Out"
    ],
    "abilities": [
      "Early Bird"
    ],
    "evs": {
      "hp": 255,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 212,
      "atk": 161,
      "def": 100,
      "spa": 54,
      "spd": 100,
      "spe": 110
    },
    "lvl100Stats": {
      "hp": 414,
      "atk": 317,
      "def": 196,
      "spa": 104,
      "spd": 196,
      "spe": 216
    },
    "fixedIV": null
  },
  "Mr. Mime 2": {
    "species": "Mr. Mime",
    "nature": "Adamant",
    "item": "Liechi Berry",
    "moves": [
      "Baton Pass",
      "Swagger",
      "Psych Up",
      "Psychic"
    ],
    "abilities": [
      "Soundproof"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 136,
      "atk": 72,
      "def": 106,
      "spa": 108,
      "spd": 161,
      "spe": 110
    },
    "lvl100Stats": {
      "hp": 263,
      "atk": 138,
      "def": 208,
      "spa": 212,
      "spd": 318,
      "spe": 216
    },
    "fixedIV": null
  },
  "Kangaskhan 2": {
    "species": "Kangaskhan",
    "nature": "Adamant",
    "item": "Lum Berry",
    "moves": [
      "Crush Claw",
      "Shadow Ball",
      "Attract",
      "Rest"
    ],
    "abilities": [
      "Early Bird"
    ],
    "evs": {
      "hp": 255,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 212,
      "atk": 161,
      "def": 100,
      "spa": 54,
      "spd": 100,
      "spe": 110
    },
    "lvl100Stats": {
      "hp": 414,
      "atk": 317,
      "def": 196,
      "spa": 104,
      "spd": 196,
      "spe": 216
    },
    "fixedIV": null
  },
  "Mr. Mime 3": {
    "species": "Mr. Mime",
    "nature": "Modest",
    "item": "Choice Band",
    "moves": [
      "Trick",
      "Torment",
      "Psychic",
      "Thunderbolt"
    ],
    "abilities": [
      "Soundproof"
    ],
    "evs": {
      "hp": 255,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 147,
      "atk": 58,
      "def": 85,
      "spa": 167,
      "spd": 140,
      "spe": 110
    },
    "lvl100Stats": {
      "hp": 284,
      "atk": 113,
      "def": 166,
      "spa": 328,
      "spd": 276,
      "spe": 216
    },
    "fixedIV": null
  },
  "Mr. Mime 4": {
    "species": "Mr. Mime",
    "nature": "Modest",
    "item": "BrightPowder",
    "moves": [
      "Psychic",
      "Thunderbolt",
      "Ice Punch",
      "Fire Punch"
    ],
    "abilities": [
      "Soundproof"
    ],
    "evs": {
      "hp": 255,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 147,
      "atk": 58,
      "def": 85,
      "spa": 167,
      "spd": 140,
      "spe": 110
    },
    "lvl100Stats": {
      "hp": 284,
      "atk": 113,
      "def": 166,
      "spa": 328,
      "spd": 276,
      "spe": 216
    },
    "fixedIV": null
  },
  "Moltres 1": {
    "species": "Moltres",
    "nature": "Docile",
    "item": "Lum Berry",
    "moves": [
      "Flamethrower",
      "Aerial Ace",
      "Mud-Slap",
      "Roar"
    ],
    "abilities": [
      "Pressure"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 165,
      "atk": 152,
      "def": 110,
      "spa": 177,
      "spd": 105,
      "spe": 110
    },
    "lvl100Stats": {
      "hp": 321,
      "atk": 299,
      "def": 216,
      "spa": 349,
      "spd": 206,
      "spe": 216
    },
    "fixedIV": null
  },
  "Moltres 2": {
    "species": "Moltres",
    "nature": "Hardy",
    "item": "White Herb",
    "moves": [
      "Overheat",
      "Aerial Ace",
      "Double Team",
      "Protect"
    ],
    "abilities": [
      "Pressure"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 165,
      "atk": 152,
      "def": 110,
      "spa": 177,
      "spd": 105,
      "spe": 110
    },
    "lvl100Stats": {
      "hp": 321,
      "atk": 299,
      "def": 216,
      "spa": 349,
      "spd": 206,
      "spe": 216
    },
    "fixedIV": null
  },
  "Moltres 6": {
    "species": "Moltres",
    "nature": "Docile",
    "item": "White Herb",
    "moves": [
      "Overheat",
      "Double-Edge",
      "Aerial Ace",
      "Steel Wing"
    ],
    "abilities": [
      "Pressure"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 165,
      "atk": 152,
      "def": 110,
      "spa": 177,
      "spd": 105,
      "spe": 110
    },
    "lvl100Stats": {
      "hp": 321,
      "atk": 299,
      "def": 216,
      "spa": 349,
      "spd": 206,
      "spe": 216
    },
    "fixedIV": null
  },
  "Misdreavus 1": {
    "species": "Misdreavus",
    "nature": "Impish",
    "item": "Focus Band",
    "moves": [
      "Pain Split",
      "Shadow Ball",
      "Confuse Ray",
      "Thunder Wave"
    ],
    "abilities": [
      "Levitate"
    ],
    "evs": {
      "hp": 255,
      "atk": 0,
      "def": 255,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 167,
      "atk": 80,
      "def": 123,
      "spa": 94,
      "spd": 105,
      "spe": 105
    },
    "lvl100Stats": {
      "hp": 324,
      "atk": 156,
      "def": 240,
      "spa": 185,
      "spd": 206,
      "spe": 206
    },
    "fixedIV": null
  },
  "Nidoking 1": {
    "species": "Nidoking",
    "nature": "Adamant",
    "item": "Quick Claw",
    "moves": [
      "Horn Drill",
      "Double Kick",
      "Body Slam",
      "Counter"
    ],
    "abilities": [
      "Poison Point"
    ],
    "evs": {
      "hp": 255,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 188,
      "atk": 158,
      "def": 97,
      "spa": 94,
      "spd": 95,
      "spe": 105
    },
    "lvl100Stats": {
      "hp": 366,
      "atk": 311,
      "def": 190,
      "spa": 185,
      "spd": 186,
      "spe": 206
    },
    "fixedIV": null
  },
  "Heracross 1": {
    "species": "Heracross",
    "nature": "Adamant",
    "item": "Focus Band",
    "moves": [
      "Megahorn",
      "Brick Break",
      "Rock Tomb",
      "Counter"
    ],
    "abilities": [
      "Swarm",
      "Guts"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 255,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 155,
      "atk": 194,
      "def": 127,
      "spa": 54,
      "spd": 115,
      "spe": 105
    },
    "lvl100Stats": {
      "hp": 301,
      "atk": 383,
      "def": 249,
      "spa": 104,
      "spd": 226,
      "spe": 206
    },
    "fixedIV": null
  },
  "Kingdra 1": {
    "species": "Kingdra",
    "nature": "Modest",
    "item": "Lum Berry",
    "moves": [
      "Hydro Pump",
      "DragonBreath",
      "Icy Wind",
      "Attract"
    ],
    "abilities": [
      "Swift Swim"
    ],
    "evs": {
      "hp": 255,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 182,
      "atk": 103,
      "def": 115,
      "spa": 161,
      "spd": 115,
      "spe": 105
    },
    "lvl100Stats": {
      "hp": 354,
      "atk": 203,
      "def": 226,
      "spa": 317,
      "spd": 226,
      "spe": 206
    },
    "fixedIV": null
  },
  "Misdreavus 2": {
    "species": "Misdreavus",
    "nature": "Bold",
    "item": "Leftovers",
    "moves": [
      "Psychic",
      "Attract",
      "Thunder Wave",
      "Confuse Ray"
    ],
    "abilities": [
      "Levitate"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 255,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 135,
      "atk": 72,
      "def": 123,
      "spa": 137,
      "spd": 105,
      "spe": 105
    },
    "lvl100Stats": {
      "hp": 261,
      "atk": 140,
      "def": 240,
      "spa": 269,
      "spd": 206,
      "spe": 206
    },
    "fixedIV": null
  },
  "Nidoking 2": {
    "species": "Nidoking",
    "nature": "Adamant",
    "item": "Shell Bell",
    "moves": [
      "Mega Kick",
      "Earthquake",
      "Shadow Ball",
      "Brick Break"
    ],
    "abilities": [
      "Poison Point"
    ],
    "evs": {
      "hp": 255,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 188,
      "atk": 158,
      "def": 97,
      "spa": 94,
      "spd": 95,
      "spe": 105
    },
    "lvl100Stats": {
      "hp": 366,
      "atk": 311,
      "def": 190,
      "spa": 185,
      "spd": 186,
      "spe": 206
    },
    "fixedIV": null
  },
  "Kingdra 2": {
    "species": "Kingdra",
    "nature": "Modest",
    "item": "Chesto Berry",
    "moves": [
      "Surf",
      "Ice Beam",
      "DragonBreath",
      "Rest"
    ],
    "abilities": [
      "Swift Swim"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 171,
      "atk": 103,
      "def": 136,
      "spa": 127,
      "spd": 136,
      "spe": 105
    },
    "lvl100Stats": {
      "hp": 333,
      "atk": 203,
      "def": 268,
      "spa": 248,
      "spd": 268,
      "spe": 206
    },
    "fixedIV": null
  },
  "Misdreavus 3": {
    "species": "Misdreavus",
    "nature": "Bold",
    "item": "BrightPowder",
    "moves": [
      "Perish Song",
      "Mean Look",
      "Thunder Wave",
      "Confuse Ray"
    ],
    "abilities": [
      "Levitate"
    ],
    "evs": {
      "hp": 255,
      "atk": 0,
      "def": 255,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 167,
      "atk": 72,
      "def": 123,
      "spa": 105,
      "spd": 105,
      "spe": 105
    },
    "lvl100Stats": {
      "hp": 324,
      "atk": 140,
      "def": 240,
      "spa": 206,
      "spd": 206,
      "spe": 206
    },
    "fixedIV": null
  },
  "Nidoking 3": {
    "species": "Nidoking",
    "nature": "Modest",
    "item": "Leppa Berry",
    "moves": [
      "Horn Drill",
      "Fire Blast",
      "Blizzard",
      "Surf"
    ],
    "abilities": [
      "Poison Point"
    ],
    "evs": {
      "hp": 255,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 188,
      "atk": 101,
      "def": 97,
      "spa": 150,
      "spd": 95,
      "spe": 105
    },
    "lvl100Stats": {
      "hp": 366,
      "atk": 198,
      "def": 190,
      "spa": 295,
      "spd": 186,
      "spe": 206
    },
    "fixedIV": null
  },
  "Golduck 3": {
    "species": "Golduck",
    "nature": "Docile",
    "item": "Shell Bell",
    "moves": [
      "Hydro Pump",
      "Cross Chop",
      "Blizzard",
      "Protect"
    ],
    "abilities": [
      "Damp",
      "Cloud Nine"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 155,
      "atk": 134,
      "def": 98,
      "spa": 147,
      "spd": 100,
      "spe": 105
    },
    "lvl100Stats": {
      "hp": 301,
      "atk": 263,
      "def": 192,
      "spa": 289,
      "spd": 196,
      "spe": 206
    },
    "fixedIV": null
  },
  "Kingdra 3": {
    "species": "Kingdra",
    "nature": "Adamant",
    "item": "Salac Berry",
    "moves": [
      "Flail",
      "Hydro Pump",
      "Dragon Dance",
      "Endure"
    ],
    "abilities": [
      "Swift Swim"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 171,
      "atk": 127,
      "def": 136,
      "spa": 103,
      "spd": 136,
      "spe": 105
    },
    "lvl100Stats": {
      "hp": 333,
      "atk": 248,
      "def": 268,
      "spa": 203,
      "spd": 268,
      "spe": 206
    },
    "fixedIV": null
  },
  "Nidoking 4": {
    "species": "Nidoking",
    "nature": "Docile",
    "item": "Lum Berry",
    "moves": [
      "Megahorn",
      "Sludge Bomb",
      "Earthquake",
      "Thunder"
    ],
    "abilities": [
      "Poison Point"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 156,
      "atk": 144,
      "def": 97,
      "spa": 137,
      "spd": 95,
      "spe": 105
    },
    "lvl100Stats": {
      "hp": 303,
      "atk": 283,
      "def": 190,
      "spa": 269,
      "spd": 186,
      "spe": 206
    },
    "fixedIV": null
  },
  "Kingdra 4": {
    "species": "Kingdra",
    "nature": "Hardy",
    "item": "Chesto Berry",
    "moves": [
      "Double-Edge",
      "Ice Beam",
      "Dragon Dance",
      "Rest"
    ],
    "abilities": [
      "Swift Swim"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 171,
      "atk": 115,
      "def": 136,
      "spa": 115,
      "spd": 136,
      "spe": 105
    },
    "lvl100Stats": {
      "hp": 333,
      "atk": 226,
      "def": 268,
      "spa": 226,
      "spd": 268,
      "spe": 206
    },
    "fixedIV": null
  },
  "Articuno 2": {
    "species": "Articuno",
    "nature": "Impish",
    "item": "Leftovers",
    "moves": [
      "Substitute",
      "Toxic",
      "Blizzard",
      "Double Team"
    ],
    "abilities": [
      "Pressure"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 186,
      "atk": 105,
      "def": 155,
      "spa": 103,
      "spd": 166,
      "spe": 105
    },
    "lvl100Stats": {
      "hp": 363,
      "atk": 206,
      "def": 305,
      "spa": 203,
      "spd": 328,
      "spe": 206
    },
    "fixedIV": null
  },
  "Suicune 2": {
    "species": "Suicune",
    "nature": "Calm",
    "item": "Leftovers",
    "moves": [
      "Toxic",
      "Dive",
      "Double Team",
      "Protect"
    ],
    "abilities": [
      "Pressure"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 196,
      "atk": 85,
      "def": 156,
      "spa": 110,
      "spd": 172,
      "spe": 105
    },
    "lvl100Stats": {
      "hp": 383,
      "atk": 167,
      "def": 308,
      "spa": 216,
      "spd": 338,
      "spe": 206
    },
    "fixedIV": null
  },
  "Articuno 3": {
    "species": "Articuno",
    "nature": "Docile",
    "item": "BrightPowder",
    "moves": [
      "Ice Beam",
      "Facade",
      "Aerial Ace",
      "Protect"
    ],
    "abilities": [
      "Pressure"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 165,
      "atk": 137,
      "def": 120,
      "spa": 147,
      "spd": 145,
      "spe": 105
    },
    "lvl100Stats": {
      "hp": 321,
      "atk": 269,
      "def": 236,
      "spa": 289,
      "spd": 286,
      "spe": 206
    },
    "fixedIV": null
  },
  "Articuno 4": {
    "species": "Articuno",
    "nature": "Docile",
    "item": "Chesto Berry",
    "moves": [
      "Blizzard",
      "Double-Edge",
      "Rest",
      "Reflect"
    ],
    "abilities": [
      "Pressure"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 165,
      "atk": 137,
      "def": 120,
      "spa": 147,
      "spd": 145,
      "spe": 105
    },
    "lvl100Stats": {
      "hp": 321,
      "atk": 269,
      "def": 236,
      "spa": 289,
      "spd": 286,
      "spe": 206
    },
    "fixedIV": null
  },
  "Articuno 5": {
    "species": "Articuno",
    "nature": "Docile",
    "item": "Focus Band",
    "moves": [
      "Blizzard",
      "Double-Edge",
      "Agility",
      "Swagger"
    ],
    "abilities": [
      "Pressure"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 165,
      "atk": 137,
      "def": 120,
      "spa": 147,
      "spd": 145,
      "spe": 105
    },
    "lvl100Stats": {
      "hp": 321,
      "atk": 269,
      "def": 236,
      "spa": 289,
      "spd": 286,
      "spe": 206
    },
    "fixedIV": null
  },
  "Articuno 6": {
    "species": "Articuno",
    "nature": "Docile",
    "item": "Chesto Berry",
    "moves": [
      "Ice Beam",
      "Aerial Ace",
      "Reflect",
      "Rest"
    ],
    "abilities": [
      "Pressure"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 165,
      "atk": 137,
      "def": 120,
      "spa": 147,
      "spd": 145,
      "spe": 105
    },
    "lvl100Stats": {
      "hp": 321,
      "atk": 269,
      "def": 236,
      "spa": 289,
      "spd": 286,
      "spe": 206
    },
    "fixedIV": null
  },
  "Suicune 5": {
    "species": "Suicune",
    "nature": "Modest",
    "item": "Lum Berry",
    "moves": [
      "Surf",
      "Ice Beam",
      "Calm Mind",
      "Icy Wind"
    ],
    "abilities": [
      "Pressure"
    ],
    "evs": {
      "hp": 255,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 207,
      "atk": 85,
      "def": 135,
      "spa": 156,
      "spd": 135,
      "spe": 105
    },
    "lvl100Stats": {
      "hp": 404,
      "atk": 167,
      "def": 266,
      "spa": 306,
      "spd": 266,
      "spe": 206
    },
    "fixedIV": null
  },
  "Suicune 6": {
    "species": "Suicune",
    "nature": "Modest",
    "item": "Chesto Berry",
    "moves": [
      "Surf",
      "Ice Beam",
      "Calm Mind",
      "Rest"
    ],
    "abilities": [
      "Pressure"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 196,
      "atk": 85,
      "def": 156,
      "spa": 121,
      "spd": 156,
      "spe": 105
    },
    "lvl100Stats": {
      "hp": 383,
      "atk": 167,
      "def": 308,
      "spa": 237,
      "spd": 308,
      "spe": 206
    },
    "fixedIV": null
  },
  "Magmar 1": {
    "species": "Magmar",
    "nature": "Relaxed",
    "item": "Rawst Berry",
    "moves": [
      "Flamethrower",
      "SmokeScreen",
      "Brick Break",
      "Barrier"
    ],
    "abilities": [
      "Flame Body"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 170,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 161,
      "atk": 115,
      "def": 108,
      "spa": 141,
      "spd": 105,
      "spe": 102
    },
    "lvl100Stats": {
      "hp": 313,
      "atk": 226,
      "def": 211,
      "spa": 278,
      "spd": 206,
      "spe": 199
    },
    "fixedIV": null
  },
  "Gyarados 1": {
    "species": "Gyarados",
    "nature": "Careful",
    "item": "Lum Berry",
    "moves": [
      "Return",
      "Bite",
      "Thunder Wave",
      "Dragon Dance"
    ],
    "abilities": [
      "Intimidate"
    ],
    "evs": {
      "hp": 255,
      "atk": 0,
      "def": 0,
      "spa": 0,
      "spd": 255,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 202,
      "atk": 145,
      "def": 99,
      "spa": 72,
      "spd": 167,
      "spe": 101
    },
    "lvl100Stats": {
      "hp": 394,
      "atk": 286,
      "def": 194,
      "spa": 140,
      "spd": 328,
      "spe": 198
    },
    "fixedIV": null
  },
  "Milotic 1": {
    "species": "Milotic",
    "nature": "Modest",
    "item": "Lum Berry",
    "moves": [
      "Hydro Pump",
      "Icy Wind",
      "Recover",
      "Mirror Coat"
    ],
    "abilities": [
      "Marvel Scale"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 170,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 191,
      "atk": 72,
      "def": 120,
      "spa": 155,
      "spd": 145,
      "spe": 101
    },
    "lvl100Stats": {
      "hp": 373,
      "atk": 140,
      "def": 236,
      "spa": 305,
      "spd": 286,
      "spe": 198
    },
    "fixedIV": null
  },
  "Milotic 2": {
    "species": "Milotic",
    "nature": "Modest",
    "item": "Focus Band",
    "moves": [
      "Surf",
      "Ice Beam",
      "Safeguard",
      "Mirror Coat"
    ],
    "abilities": [
      "Marvel Scale"
    ],
    "evs": {
      "hp": 255,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 202,
      "atk": 72,
      "def": 99,
      "spa": 167,
      "spd": 145,
      "spe": 101
    },
    "lvl100Stats": {
      "hp": 394,
      "atk": 140,
      "def": 194,
      "spa": 328,
      "spd": 286,
      "spe": 198
    },
    "fixedIV": null
  },
  "Gyarados 3": {
    "species": "Gyarados",
    "nature": "Quirky",
    "item": "Quick Claw",
    "moves": [
      "Surf",
      "Thunder",
      "Rain Dance",
      "Earthquake"
    ],
    "abilities": [
      "Intimidate"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 170,
      "atk": 177,
      "def": 99,
      "spa": 112,
      "spd": 120,
      "spe": 101
    },
    "lvl100Stats": {
      "hp": 331,
      "atk": 349,
      "def": 194,
      "spa": 219,
      "spd": 236,
      "spe": 198
    },
    "fixedIV": null
  },
  "Milotic 3": {
    "species": "Milotic",
    "nature": "Bold",
    "item": "Leftovers",
    "moves": [
      "Surf",
      "Blizzard",
      "Attract",
      "Recover"
    ],
    "abilities": [
      "Marvel Scale"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 191,
      "atk": 72,
      "def": 132,
      "spa": 120,
      "spd": 166,
      "spe": 101
    },
    "lvl100Stats": {
      "hp": 373,
      "atk": 140,
      "def": 259,
      "spa": 236,
      "spd": 328,
      "spe": 198
    },
    "fixedIV": null
  },
  "Gyarados 4": {
    "species": "Gyarados",
    "nature": "Adamant",
    "item": "Chesto Berry",
    "moves": [
      "Return",
      "Earthquake",
      "Dragon Dance",
      "Rest"
    ],
    "abilities": [
      "Intimidate"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 191,
      "atk": 160,
      "def": 120,
      "spa": 72,
      "spd": 141,
      "spe": 101
    },
    "lvl100Stats": {
      "hp": 373,
      "atk": 314,
      "def": 236,
      "spa": 140,
      "spd": 278,
      "spe": 198
    },
    "fixedIV": null
  },
  "Milotic 4": {
    "species": "Milotic",
    "nature": "Modest",
    "item": "Leftovers",
    "moves": [
      "Surf",
      "Ice Beam",
      "Recover",
      "Mirror Coat"
    ],
    "abilities": [
      "Marvel Scale"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 170,
      "spa": 170,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 170,
      "atk": 72,
      "def": 120,
      "spa": 155,
      "spd": 166,
      "spe": 101
    },
    "lvl100Stats": {
      "hp": 331,
      "atk": 140,
      "def": 236,
      "spa": 305,
      "spd": 328,
      "spe": 198
    },
    "fixedIV": null
  },
  "Lucy Gold Gyarados": {
    "species": "Gyarados",
    "nature": "Adamant",
    "item": "Chesto Berry",
    "moves": [
      "Dragon Dance",
      "Return",
      "Roar",
      "Rest"
    ],
    "abilities": [
      "Intimidate"
    ],
    "evs": {
      "hp": 252,
      "atk": 6,
      "def": 0,
      "spa": 0,
      "spd": 252,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 202,
      "atk": 160,
      "def": 99,
      "spa": 72,
      "spd": 152,
      "spe": 101
    },
    "lvl100Stats": {
      "hp": 394,
      "atk": 315,
      "def": 194,
      "spa": 140,
      "spd": 299,
      "spe": 198
    },
    "fixedIV": 31
  },
  "Glalie 1": {
    "species": "Glalie",
    "nature": "Modest",
    "item": "Petaya Berry",
    "moves": [
      "Ice Beam",
      "Crunch",
      "Hail",
      "Protect"
    ],
    "abilities": [
      "Inner Focus"
    ],
    "evs": {
      "hp": 255,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 187,
      "atk": 90,
      "def": 100,
      "spa": 145,
      "spd": 100,
      "spe": 100
    },
    "lvl100Stats": {
      "hp": 364,
      "atk": 176,
      "def": 196,
      "spa": 284,
      "spd": 196,
      "spe": 196
    },
    "fixedIV": null
  },
  "Altaria 1": {
    "species": "Altaria",
    "nature": "Docile",
    "item": "Cheri Berry",
    "moves": [
      "Dragon Claw",
      "Aerial Ace",
      "Refresh",
      "Body Slam"
    ],
    "abilities": [
      "Natural Cure"
    ],
    "evs": {
      "hp": 255,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 182,
      "atk": 122,
      "def": 110,
      "spa": 90,
      "spd": 125,
      "spe": 100
    },
    "lvl100Stats": {
      "hp": 354,
      "atk": 239,
      "def": 216,
      "spa": 176,
      "spd": 246,
      "spe": 196
    },
    "fixedIV": null
  },
  "Meganium 1": {
    "species": "Meganium",
    "nature": "Modest",
    "item": "BrightPowder",
    "moves": [
      "SolarBeam",
      "Sunny Day",
      "Light Screen",
      "Synthesis"
    ],
    "abilities": [
      "Overgrow"
    ],
    "evs": {
      "hp": 255,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 187,
      "atk": 92,
      "def": 120,
      "spa": 148,
      "spd": 120,
      "spe": 100
    },
    "lvl100Stats": {
      "hp": 364,
      "atk": 180,
      "def": 236,
      "spa": 291,
      "spd": 236,
      "spe": 196
    },
    "fixedIV": null
  },
  "Blaziken 1": {
    "species": "Blaziken",
    "nature": "Docile",
    "item": "Quick Claw",
    "moves": [
      "Flamethrower",
      "Sunny Day",
      "Double Kick",
      "Roar"
    ],
    "abilities": [
      "Blaze"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 155,
      "atk": 172,
      "def": 90,
      "spa": 162,
      "spd": 90,
      "spe": 100
    },
    "lvl100Stats": {
      "hp": 301,
      "atk": 339,
      "def": 176,
      "spa": 319,
      "spd": 176,
      "spe": 196
    },
    "fixedIV": null
  },
  "Shiftry 2": {
    "species": "Shiftry",
    "nature": "Impish",
    "item": "Chesto Berry",
    "moves": [
      "Leech Seed",
      "Dig",
      "Double Team",
      "Rest"
    ],
    "abilities": [
      "Chlorophyll",
      "Early Bird"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 255,
      "spa": 0,
      "spd": 255,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 165,
      "atk": 120,
      "def": 123,
      "spa": 99,
      "spd": 112,
      "spe": 100
    },
    "lvl100Stats": {
      "hp": 321,
      "atk": 236,
      "def": 240,
      "spa": 194,
      "spd": 219,
      "spe": 196
    },
    "fixedIV": null
  },
  "Altaria 2": {
    "species": "Altaria",
    "nature": "Bold",
    "item": "Leftovers",
    "moves": [
      "Perish Song",
      "DragonBreath",
      "Pursuit",
      "Attract"
    ],
    "abilities": [
      "Natural Cure"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 171,
      "atk": 81,
      "def": 144,
      "spa": 90,
      "spd": 146,
      "spe": 100
    },
    "lvl100Stats": {
      "hp": 333,
      "atk": 158,
      "def": 283,
      "spa": 176,
      "spd": 288,
      "spe": 196
    },
    "fixedIV": null
  },
  "Gardevoir 2": {
    "species": "Gardevoir",
    "nature": "Modest",
    "item": "Chesto Berry",
    "moves": [
      "Psychic",
      "Calm Mind",
      "Double Team",
      "Rest"
    ],
    "abilities": [
      "Synchronize",
      "Trace"
    ],
    "evs": {
      "hp": 255,
      "atk": 0,
      "def": 255,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 175,
      "atk": 76,
      "def": 117,
      "spa": 160,
      "spd": 135,
      "spe": 100
    },
    "lvl100Stats": {
      "hp": 340,
      "atk": 149,
      "def": 229,
      "spa": 314,
      "spd": 266,
      "spe": 196
    },
    "fixedIV": null
  },
  "Venusaur 2": {
    "species": "Venusaur",
    "nature": "Bold",
    "item": "BrightPowder",
    "moves": [
      "Leech Seed",
      "Giga Drain",
      "Double Team",
      "Light Screen"
    ],
    "abilities": [
      "Overgrow"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 176,
      "atk": 92,
      "def": 136,
      "spa": 120,
      "spd": 141,
      "spe": 100
    },
    "lvl100Stats": {
      "hp": 343,
      "atk": 180,
      "def": 268,
      "spa": 236,
      "spd": 278,
      "spe": 196
    },
    "fixedIV": null
  },
  "Meganium 2": {
    "species": "Meganium",
    "nature": "Calm",
    "item": "Leftovers",
    "moves": [
      "Leech Seed",
      "Substitute",
      "Double Team",
      "GrassWhistle"
    ],
    "abilities": [
      "Overgrow"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 176,
      "atk": 92,
      "def": 141,
      "spa": 103,
      "spd": 155,
      "spe": 100
    },
    "lvl100Stats": {
      "hp": 343,
      "atk": 180,
      "def": 278,
      "spa": 202,
      "spd": 305,
      "spe": 196
    },
    "fixedIV": null
  },
  "Blaziken 2": {
    "species": "Blaziken",
    "nature": "Docile",
    "item": "Scope Lens",
    "moves": [
      "Blaze Kick",
      "Mega Kick",
      "ThunderPunch",
      "Brick Break"
    ],
    "abilities": [
      "Blaze"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 155,
      "atk": 172,
      "def": 90,
      "spa": 162,
      "spd": 90,
      "spe": 100
    },
    "lvl100Stats": {
      "hp": 301,
      "atk": 339,
      "def": 176,
      "spa": 319,
      "spd": 176,
      "spe": 196
    },
    "fixedIV": null
  },
  "Shiftry 3": {
    "species": "Shiftry",
    "nature": "Quirky",
    "item": "Focus Band",
    "moves": [
      "SolarBeam",
      "Sunny Day",
      "Explosion",
      "Synthesis"
    ],
    "abilities": [
      "Chlorophyll",
      "Early Bird"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 165,
      "atk": 152,
      "def": 80,
      "spa": 142,
      "spd": 80,
      "spe": 100
    },
    "lvl100Stats": {
      "hp": 321,
      "atk": 299,
      "def": 156,
      "spa": 279,
      "spd": 156,
      "spe": 196
    },
    "fixedIV": null
  },
  "Altaria 3": {
    "species": "Altaria",
    "nature": "Adamant",
    "item": "Lum Berry",
    "moves": [
      "Sing",
      "Dragon Dance",
      "Earthquake",
      "Aerial Ace"
    ],
    "abilities": [
      "Natural Cure"
    ],
    "evs": {
      "hp": 255,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 182,
      "atk": 134,
      "def": 110,
      "spa": 81,
      "spd": 125,
      "spe": 100
    },
    "lvl100Stats": {
      "hp": 354,
      "atk": 262,
      "def": 216,
      "spa": 158,
      "spd": 246,
      "spe": 196
    },
    "fixedIV": null
  },
  "Venusaur 3": {
    "species": "Venusaur",
    "nature": "Adamant",
    "item": "Scope Lens",
    "moves": [
      "Double-Edge",
      "Sludge Bomb",
      "Earthquake",
      "Sleep Powder"
    ],
    "abilities": [
      "Overgrow"
    ],
    "evs": {
      "hp": 0,
      "atk": 170,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 155,
      "atk": 135,
      "def": 124,
      "spa": 108,
      "spd": 141,
      "spe": 100
    },
    "lvl100Stats": {
      "hp": 301,
      "atk": 266,
      "def": 244,
      "spa": 212,
      "spd": 278,
      "spe": 196
    },
    "fixedIV": null
  },
  "Medicham 4": {
    "species": "Medicham",
    "nature": "Hardy",
    "item": "Lum Berry",
    "moves": [
      "Mega Kick",
      "Psychic",
      "Shadow Ball",
      "Rock Slide"
    ],
    "abilities": [
      "Pure Power"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 135,
      "atk": 112,
      "def": 95,
      "spa": 112,
      "spd": 95,
      "spe": 100
    },
    "lvl100Stats": {
      "hp": 261,
      "atk": 219,
      "def": 186,
      "spa": 219,
      "spd": 186,
      "spe": 196
    },
    "fixedIV": null
  },
  "Shiftry 4": {
    "species": "Shiftry",
    "nature": "Hardy",
    "item": "Focus Band",
    "moves": [
      "Explosion",
      "Giga Drain",
      "Mega Kick",
      "Fake Out"
    ],
    "abilities": [
      "Chlorophyll",
      "Early Bird"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 165,
      "atk": 152,
      "def": 80,
      "spa": 142,
      "spd": 80,
      "spe": 100
    },
    "lvl100Stats": {
      "hp": 321,
      "atk": 299,
      "def": 156,
      "spa": 279,
      "spd": 156,
      "spe": 196
    },
    "fixedIV": null
  },
  "Glalie 4": {
    "species": "Glalie",
    "nature": "Hardy",
    "item": "Leftovers",
    "moves": [
      "Ice Beam",
      "Earthquake",
      "Crunch",
      "Shadow Ball"
    ],
    "abilities": [
      "Inner Focus"
    ],
    "evs": {
      "hp": 170,
      "atk": 170,
      "def": 0,
      "spa": 170,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 176,
      "atk": 121,
      "def": 100,
      "spa": 121,
      "spd": 100,
      "spe": 100
    },
    "lvl100Stats": {
      "hp": 343,
      "atk": 238,
      "def": 196,
      "spa": 238,
      "spd": 196,
      "spe": 196
    },
    "fixedIV": null
  },
  "Altaria 4": {
    "species": "Altaria",
    "nature": "Docile",
    "item": "Shell Bell",
    "moves": [
      "Dragon Claw",
      "Earthquake",
      "Flamethrower",
      "Ice Beam"
    ],
    "abilities": [
      "Natural Cure"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 150,
      "atk": 122,
      "def": 110,
      "spa": 122,
      "spd": 125,
      "spe": 100
    },
    "lvl100Stats": {
      "hp": 291,
      "atk": 239,
      "def": 216,
      "spa": 239,
      "spd": 246,
      "spe": 196
    },
    "fixedIV": null
  },
  "Venusaur 4": {
    "species": "Venusaur",
    "nature": "Docile",
    "item": "Lum Berry",
    "moves": [
      "SolarBeam",
      "Sludge Bomb",
      "Sunny Day",
      "Earthquake"
    ],
    "abilities": [
      "Overgrow"
    ],
    "evs": {
      "hp": 0,
      "atk": 170,
      "def": 0,
      "spa": 170,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 155,
      "atk": 123,
      "def": 103,
      "spa": 141,
      "spd": 141,
      "spe": 100
    },
    "lvl100Stats": {
      "hp": 301,
      "atk": 242,
      "def": 202,
      "spa": 278,
      "spd": 278,
      "spe": 196
    },
    "fixedIV": null
  },
  "Meganium 4": {
    "species": "Meganium",
    "nature": "Hardy",
    "item": "BrightPowder",
    "moves": [
      "Giga Drain",
      "Earthquake",
      "AncientPower",
      "Body Slam"
    ],
    "abilities": [
      "Overgrow"
    ],
    "evs": {
      "hp": 170,
      "atk": 170,
      "def": 0,
      "spa": 170,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 176,
      "atk": 123,
      "def": 120,
      "spa": 124,
      "spd": 120,
      "spe": 100
    },
    "lvl100Stats": {
      "hp": 343,
      "atk": 242,
      "def": 236,
      "spa": 244,
      "spd": 236,
      "spe": 196
    },
    "fixedIV": null
  },
  "Blaziken 4": {
    "species": "Blaziken",
    "nature": "Hardy",
    "item": "White Herb",
    "moves": [
      "Overheat",
      "Earthquake",
      "ThunderPunch",
      "Rock Slide"
    ],
    "abilities": [
      "Blaze"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 155,
      "atk": 172,
      "def": 90,
      "spa": 162,
      "spd": 90,
      "spe": 100
    },
    "lvl100Stats": {
      "hp": 301,
      "atk": 339,
      "def": 176,
      "spa": 319,
      "spd": 176,
      "spe": 196
    },
    "fixedIV": null
  },
  "Gardevoir 7": {
    "species": "Gardevoir",
    "nature": "Bold",
    "item": "Quick Claw",
    "moves": [
      "Psychic",
      "Calm Mind",
      "Will-O-Wisp",
      "Destiny Bond"
    ],
    "abilities": [
      "Synchronize",
      "Trace"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 164,
      "atk": 76,
      "def": 117,
      "spa": 145,
      "spd": 156,
      "spe": 100
    },
    "lvl100Stats": {
      "hp": 319,
      "atk": 149,
      "def": 228,
      "spa": 286,
      "spd": 308,
      "spe": 196
    },
    "fixedIV": null
  },
  "Dragonite 1": {
    "species": "Dragonite",
    "nature": "Adamant",
    "item": "BrightPowder",
    "moves": [
      "Earthquake",
      "Aerial Ace",
      "Brick Break",
      "Dragon Dance"
    ],
    "abilities": [
      "Inner Focus"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 187,
      "atk": 169,
      "def": 136,
      "spa": 108,
      "spd": 141,
      "spe": 100
    },
    "lvl100Stats": {
      "hp": 365,
      "atk": 334,
      "def": 268,
      "spa": 212,
      "spd": 278,
      "spe": 196
    },
    "fixedIV": null
  },
  "Dragonite 2": {
    "species": "Dragonite",
    "nature": "Adamant",
    "item": "BrightPowder",
    "moves": [
      "Earthquake",
      "Double-Edge",
      "Aerial Ace",
      "Dragon Dance"
    ],
    "abilities": [
      "Inner Focus"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 187,
      "atk": 169,
      "def": 136,
      "spa": 108,
      "spd": 141,
      "spe": 100
    },
    "lvl100Stats": {
      "hp": 365,
      "atk": 334,
      "def": 268,
      "spa": 212,
      "spd": 278,
      "spe": 196
    },
    "fixedIV": null
  },
  "Dragonite 3": {
    "species": "Dragonite",
    "nature": "Adamant",
    "item": "Leftovers",
    "moves": [
      "Hyper Beam",
      "Attract",
      "Double Team",
      "Thunder Wave"
    ],
    "abilities": [
      "Inner Focus"
    ],
    "evs": {
      "hp": 0,
      "atk": 170,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 166,
      "atk": 193,
      "def": 136,
      "spa": 108,
      "spd": 141,
      "spe": 100
    },
    "lvl100Stats": {
      "hp": 323,
      "atk": 380,
      "def": 268,
      "spa": 212,
      "spd": 278,
      "spe": 196
    },
    "fixedIV": null
  },
  "Dragonite 4": {
    "species": "Dragonite",
    "nature": "Adamant",
    "item": "Chesto Berry",
    "moves": [
      "Hyper Beam",
      "Thunder Wave",
      "Dragon Dance",
      "Rest"
    ],
    "abilities": [
      "Inner Focus"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 187,
      "atk": 169,
      "def": 136,
      "spa": 108,
      "spd": 141,
      "spe": 100
    },
    "lvl100Stats": {
      "hp": 365,
      "atk": 334,
      "def": 268,
      "spa": 212,
      "spd": 278,
      "spe": 196
    },
    "fixedIV": null
  },
  "Dragonite 5": {
    "species": "Dragonite",
    "nature": "Docile",
    "item": "Lum Berry",
    "moves": [
      "Outrage",
      "Double-Edge",
      "Thunder Wave",
      "Roar"
    ],
    "abilities": [
      "Inner Focus"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 166,
      "atk": 186,
      "def": 115,
      "spa": 152,
      "spd": 120,
      "spe": 100
    },
    "lvl100Stats": {
      "hp": 323,
      "atk": 367,
      "def": 226,
      "spa": 299,
      "spd": 236,
      "spe": 196
    },
    "fixedIV": null
  },
  "Dragonite 9": {
    "species": "Dragonite",
    "nature": "Docile",
    "item": "Quick Claw",
    "moves": [
      "Thunder",
      "Surf",
      "Rain Dance",
      "Earthquake"
    ],
    "abilities": [
      "Inner Focus"
    ],
    "evs": {
      "hp": 255,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 198,
      "atk": 154,
      "def": 115,
      "spa": 152,
      "spd": 120,
      "spe": 100
    },
    "lvl100Stats": {
      "hp": 386,
      "atk": 304,
      "def": 226,
      "spa": 299,
      "spd": 236,
      "spe": 196
    },
    "fixedIV": null
  },
  "Dragonite 10": {
    "species": "Dragonite",
    "nature": "Docile",
    "item": "Quick Claw",
    "moves": [
      "Fire Blast",
      "Blizzard",
      "Sunny Day",
      "Earthquake"
    ],
    "abilities": [
      "Inner Focus"
    ],
    "evs": {
      "hp": 255,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 198,
      "atk": 154,
      "def": 115,
      "spa": 152,
      "spd": 120,
      "spe": 100
    },
    "lvl100Stats": {
      "hp": 386,
      "atk": 304,
      "def": 226,
      "spa": 299,
      "spd": 236,
      "spe": 196
    },
    "fixedIV": null
  },
  "Mr. Mime 1": {
    "species": "Mr. Mime",
    "nature": "Relaxed",
    "item": "Leftovers",
    "moves": [
      "Psychic",
      "Magical Leaf",
      "Fake Out",
      "Reflect"
    ],
    "abilities": [
      "Soundproof"
    ],
    "evs": {
      "hp": 255,
      "atk": 0,
      "def": 255,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 147,
      "atk": 65,
      "def": 128,
      "spa": 120,
      "spd": 140,
      "spe": 99
    },
    "lvl100Stats": {
      "hp": 284,
      "atk": 126,
      "def": 251,
      "spa": 236,
      "spd": 276,
      "spe": 194
    },
    "fixedIV": null
  },
  "Moltres 4": {
    "species": "Moltres",
    "nature": "Quiet",
    "item": "White Herb",
    "moves": [
      "Overheat",
      "Double-Edge",
      "Steel Wing",
      "Safeguard"
    ],
    "abilities": [
      "Pressure"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 165,
      "atk": 152,
      "def": 110,
      "spa": 194,
      "spd": 105,
      "spe": 99
    },
    "lvl100Stats": {
      "hp": 321,
      "atk": 299,
      "def": 216,
      "spa": 383,
      "spd": 206,
      "spe": 194
    },
    "fixedIV": null
  },
  "Blastoise 1": {
    "species": "Blastoise",
    "nature": "Modest",
    "item": "Shell Bell",
    "moves": [
      "Hydro Pump",
      "Rain Dance",
      "Bite",
      "Seismic Toss"
    ],
    "abilities": [
      "Torrent"
    ],
    "evs": {
      "hp": 255,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 186,
      "atk": 93,
      "def": 120,
      "spa": 150,
      "spd": 125,
      "spe": 98
    },
    "lvl100Stats": {
      "hp": 362,
      "atk": 181,
      "def": 236,
      "spa": 295,
      "spd": 246,
      "spe": 192
    },
    "fixedIV": null
  },
  "Blastoise 3": {
    "species": "Blastoise",
    "nature": "Docile",
    "item": "Focus Band",
    "moves": [
      "Surf",
      "Earthquake",
      "Ice Beam",
      "Counter"
    ],
    "abilities": [
      "Torrent"
    ],
    "evs": {
      "hp": 170,
      "atk": 170,
      "def": 0,
      "spa": 170,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 175,
      "atk": 124,
      "def": 120,
      "spa": 126,
      "spd": 125,
      "spe": 98
    },
    "lvl100Stats": {
      "hp": 341,
      "atk": 244,
      "def": 236,
      "spa": 248,
      "spd": 246,
      "spe": 192
    },
    "fixedIV": null
  },
  "Feraligatr 3": {
    "species": "Feraligatr",
    "nature": "Hardy",
    "item": "Scope Lens",
    "moves": [
      "Hydro Pump",
      "Crunch",
      "Earthquake",
      "Rock Slide"
    ],
    "abilities": [
      "Torrent"
    ],
    "evs": {
      "hp": 170,
      "atk": 170,
      "def": 0,
      "spa": 170,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 181,
      "atk": 146,
      "def": 120,
      "spa": 120,
      "spd": 103,
      "spe": 98
    },
    "lvl100Stats": {
      "hp": 353,
      "atk": 288,
      "def": 236,
      "spa": 236,
      "spd": 202,
      "spe": 192
    },
    "fixedIV": null
  },
  "Blastoise 4": {
    "species": "Blastoise",
    "nature": "Docile",
    "item": "Focus Band",
    "moves": [
      "Surf",
      "Earthquake",
      "Ice Beam",
      "Mirror Coat"
    ],
    "abilities": [
      "Torrent"
    ],
    "evs": {
      "hp": 170,
      "atk": 170,
      "def": 0,
      "spa": 170,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 175,
      "atk": 124,
      "def": 120,
      "spa": 126,
      "spd": 125,
      "spe": 98
    },
    "lvl100Stats": {
      "hp": 341,
      "atk": 244,
      "def": 236,
      "spa": 248,
      "spd": 246,
      "spe": 192
    },
    "fixedIV": null
  },
  "Feraligatr 4": {
    "species": "Feraligatr",
    "nature": "Hardy",
    "item": "Scope Lens",
    "moves": [
      "Hydro Pump",
      "Ice Beam",
      "Earthquake",
      "Aerial Ace"
    ],
    "abilities": [
      "Torrent"
    ],
    "evs": {
      "hp": 170,
      "atk": 170,
      "def": 0,
      "spa": 170,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 181,
      "atk": 146,
      "def": 120,
      "spa": 120,
      "spd": 103,
      "spe": 98
    },
    "lvl100Stats": {
      "hp": 353,
      "atk": 288,
      "def": 236,
      "spa": 236,
      "spd": 202,
      "spe": 192
    },
    "fixedIV": null
  },
  "Marowak 2": {
    "species": "Marowak",
    "nature": "Adamant",
    "item": "Thick Club",
    "moves": [
      "Earthquake",
      "Rock Slide",
      "Swords Dance",
      "Icy Wind"
    ],
    "abilities": [
      "Rock Head",
      "Lightningrod"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 135,
      "atk": 145,
      "def": 130,
      "spa": 63,
      "spd": 100,
      "spe": 97
    },
    "lvl100Stats": {
      "hp": 261,
      "atk": 284,
      "def": 256,
      "spa": 122,
      "spd": 196,
      "spe": 189
    },
    "fixedIV": null
  },
  "Marowak 3": {
    "species": "Marowak",
    "nature": "Adamant",
    "item": "Thick Club",
    "moves": [
      "Earthquake",
      "Rock Slide",
      "Swords Dance",
      "Brick Break"
    ],
    "abilities": [
      "Rock Head",
      "Lightningrod"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 135,
      "atk": 145,
      "def": 130,
      "spa": 63,
      "spd": 100,
      "spe": 97
    },
    "lvl100Stats": {
      "hp": 261,
      "atk": 284,
      "def": 256,
      "spa": 122,
      "spd": 196,
      "spe": 189
    },
    "fixedIV": null
  },
  "Marowak 4": {
    "species": "Marowak",
    "nature": "Adamant",
    "item": "Thick Club",
    "moves": [
      "Earthquake",
      "Rock Slide",
      "Swords Dance",
      "Mega Kick"
    ],
    "abilities": [
      "Rock Head",
      "Lightningrod"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 255
    },
    "lvl50Stats": {
      "hp": 135,
      "atk": 145,
      "def": 130,
      "spa": 63,
      "spd": 100,
      "spe": 97
    },
    "lvl100Stats": {
      "hp": 261,
      "atk": 284,
      "def": 256,
      "spa": 122,
      "spd": 196,
      "spe": 189
    },
    "fixedIV": null
  },
  "Nidoqueen 1": {
    "species": "Nidoqueen",
    "nature": "Adamant",
    "item": "Focus Band",
    "moves": [
      "Sludge Bomb",
      "Double Kick",
      "Body Slam",
      "Counter"
    ],
    "abilities": [
      "Poison Point"
    ],
    "evs": {
      "hp": 255,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 197,
      "atk": 147,
      "def": 107,
      "spa": 85,
      "spd": 105,
      "spe": 96
    },
    "lvl100Stats": {
      "hp": 384,
      "atk": 289,
      "def": 210,
      "spa": 167,
      "spd": 206,
      "spe": 188
    },
    "fixedIV": null
  },
  "Nidoqueen 2": {
    "species": "Nidoqueen",
    "nature": "Adamant",
    "item": "Shell Bell",
    "moves": [
      "Double-Edge",
      "Earthquake",
      "Aerial Ace",
      "Rock Slide"
    ],
    "abilities": [
      "Poison Point"
    ],
    "evs": {
      "hp": 255,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 197,
      "atk": 147,
      "def": 107,
      "spa": 85,
      "spd": 105,
      "spe": 96
    },
    "lvl100Stats": {
      "hp": 384,
      "atk": 289,
      "def": 210,
      "spa": 167,
      "spd": 206,
      "spe": 188
    },
    "fixedIV": null
  },
  "Nidoqueen 3": {
    "species": "Nidoqueen",
    "nature": "Modest",
    "item": "Lum Berry",
    "moves": [
      "Thunderbolt",
      "Flamethrower",
      "Ice Beam",
      "Crunch"
    ],
    "abilities": [
      "Poison Point"
    ],
    "evs": {
      "hp": 255,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 197,
      "atk": 92,
      "def": 107,
      "spa": 139,
      "spd": 105,
      "spe": 96
    },
    "lvl100Stats": {
      "hp": 384,
      "atk": 180,
      "def": 210,
      "spa": 273,
      "spd": 206,
      "spe": 188
    },
    "fixedIV": null
  },
  "Ursaring 3": {
    "species": "Ursaring",
    "nature": "Modest",
    "item": "Lum Berry",
    "moves": [
      "Fire Punch",
      "ThunderPunch",
      "Ice Punch",
      "Crunch"
    ],
    "abilities": [
      "Guts"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 0,
      "spa": 170,
      "spd": 0,
      "spe": 170
    },
    "lvl50Stats": {
      "hp": 186,
      "atk": 135,
      "def": 95,
      "spa": 128,
      "spd": 95,
      "spe": 96
    },
    "lvl100Stats": {
      "hp": 363,
      "atk": 266,
      "def": 186,
      "spa": 250,
      "spd": 186,
      "spe": 188
    },
    "fixedIV": null
  },
  "Nidoqueen 4": {
    "species": "Nidoqueen",
    "nature": "Adamant",
    "item": "White Herb",
    "moves": [
      "Superpower",
      "Sludge Bomb",
      "Earthquake",
      "Shadow Ball"
    ],
    "abilities": [
      "Poison Point"
    ],
    "evs": {
      "hp": 255,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 197,
      "atk": 147,
      "def": 107,
      "spa": 85,
      "spd": 105,
      "spe": 96
    },
    "lvl100Stats": {
      "hp": 384,
      "atk": 289,
      "def": 210,
      "spa": 167,
      "spd": 206,
      "spe": 188
    },
    "fixedIV": null
  },
  "Claydol 1": {
    "species": "Claydol",
    "nature": "Adamant",
    "item": "Lum Berry",
    "moves": [
      "Earthquake",
      "Rock Slide",
      "Swagger",
      "Psych Up"
    ],
    "abilities": [
      "Levitate"
    ],
    "evs": {
      "hp": 255,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 167,
      "atk": 134,
      "def": 125,
      "spa": 81,
      "spd": 140,
      "spe": 95
    },
    "lvl100Stats": {
      "hp": 324,
      "atk": 262,
      "def": 246,
      "spa": 158,
      "spd": 276,
      "spe": 186
    },
    "fixedIV": null
  },
  "Claydol 2": {
    "species": "Claydol",
    "nature": "Calm",
    "item": "Leftovers",
    "moves": [
      "Psychic",
      "Earthquake",
      "Double Team",
      "Cosmic Power"
    ],
    "abilities": [
      "Levitate"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 156,
      "atk": 81,
      "def": 146,
      "spa": 90,
      "spd": 177,
      "spe": 95
    },
    "lvl100Stats": {
      "hp": 303,
      "atk": 158,
      "def": 288,
      "spa": 176,
      "spd": 349,
      "spe": 186
    },
    "fixedIV": null
  },
  "Claydol 3": {
    "species": "Claydol",
    "nature": "Modest",
    "item": "Shell Bell",
    "moves": [
      "Psychic",
      "Ice Beam",
      "SolarBeam",
      "Sunny Day"
    ],
    "abilities": [
      "Levitate"
    ],
    "evs": {
      "hp": 255,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 167,
      "atk": 81,
      "def": 125,
      "spa": 134,
      "spd": 140,
      "spe": 95
    },
    "lvl100Stats": {
      "hp": 324,
      "atk": 158,
      "def": 246,
      "spa": 262,
      "spd": 276,
      "spe": 186
    },
    "fixedIV": null
  },
  "Claydol 4": {
    "species": "Claydol",
    "nature": "Adamant",
    "item": "Focus Band",
    "moves": [
      "Psychic",
      "Earthquake",
      "Shadow Ball",
      "Explosion"
    ],
    "abilities": [
      "Levitate"
    ],
    "evs": {
      "hp": 255,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 167,
      "atk": 134,
      "def": 125,
      "spa": 81,
      "spd": 140,
      "spe": 95
    },
    "lvl100Stats": {
      "hp": 324,
      "atk": 262,
      "def": 246,
      "spa": 158,
      "spd": 276,
      "spe": 186
    },
    "fixedIV": null
  },
  "Golduck 1": {
    "species": "Golduck",
    "nature": "Quiet",
    "item": "Shell Bell",
    "moves": [
      "Hydro Pump",
      "Dig",
      "Brick Break",
      "Light Screen"
    ],
    "abilities": [
      "Damp",
      "Cloud Nine"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 155,
      "atk": 134,
      "def": 98,
      "spa": 161,
      "spd": 100,
      "spe": 94
    },
    "lvl100Stats": {
      "hp": 301,
      "atk": 263,
      "def": 192,
      "spa": 317,
      "spd": 196,
      "spe": 185
    },
    "fixedIV": null
  },
  "Lucy Silver Milotic": {
    "species": "Milotic",
    "nature": "Modest",
    "item": "Leftovers",
    "moves": [
      "Ice Beam",
      "Mirror Coat",
      "Surf",
      "Recover"
    ],
    "abilities": [
      "Marvel Scale"
    ],
    "evs": {
      "hp": 152,
      "atk": 0,
      "def": 100,
      "spa": 152,
      "spd": 106,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 182,
      "atk": 65,
      "def": 104,
      "spa": 145,
      "spd": 151,
      "spe": 94
    },
    "lvl100Stats": {
      "hp": 354,
      "atk": 126,
      "def": 204,
      "spa": 284,
      "spd": 297,
      "spe": 183
    },
    "fixedIV": 16
  },
  "Skarmory 1": {
    "species": "Skarmory",
    "nature": "Adamant",
    "item": "Scope Lens",
    "moves": [
      "Steel Wing",
      "Air Cutter",
      "Counter",
      "Agility"
    ],
    "abilities": [
      "Keen Eye",
      "Sturdy"
    ],
    "evs": {
      "hp": 170,
      "atk": 170,
      "def": 0,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 161,
      "atk": 133,
      "def": 160,
      "spa": 54,
      "spd": 111,
      "spe": 90
    },
    "lvl100Stats": {
      "hp": 313,
      "atk": 261,
      "def": 316,
      "spa": 104,
      "spd": 218,
      "spe": 176
    },
    "fixedIV": null
  },
  "Shiftry 1": {
    "species": "Shiftry",
    "nature": "Quiet",
    "item": "Miracle Seed",
    "moves": [
      "Giga Drain",
      "Faint Attack",
      "Quick Attack",
      "Fake Out"
    ],
    "abilities": [
      "Chlorophyll",
      "Early Bird"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 170,
      "spa": 170,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 165,
      "atk": 120,
      "def": 101,
      "spa": 144,
      "spd": 101,
      "spe": 90
    },
    "lvl100Stats": {
      "hp": 321,
      "atk": 236,
      "def": 198,
      "spa": 283,
      "spd": 198,
      "spe": 176
    },
    "fixedIV": null
  },
  "Venusaur 1": {
    "species": "Venusaur",
    "nature": "Quiet",
    "item": "Chesto Berry",
    "moves": [
      "Giga Drain",
      "Sunny Day",
      "Synthesis",
      "Sleep Powder"
    ],
    "abilities": [
      "Overgrow"
    ],
    "evs": {
      "hp": 255,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 187,
      "atk": 102,
      "def": 103,
      "spa": 167,
      "spd": 120,
      "spe": 90
    },
    "lvl100Stats": {
      "hp": 364,
      "atk": 200,
      "def": 202,
      "spa": 328,
      "spd": 236,
      "spe": 176
    },
    "fixedIV": null
  },
  "Skarmory 2": {
    "species": "Skarmory",
    "nature": "Careful",
    "item": "BrightPowder",
    "moves": [
      "Spikes",
      "Roar",
      "Drill Peck",
      "Toxic"
    ],
    "abilities": [
      "Keen Eye",
      "Sturdy"
    ],
    "evs": {
      "hp": 170,
      "atk": 170,
      "def": 0,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 161,
      "atk": 121,
      "def": 160,
      "spa": 54,
      "spd": 122,
      "spe": 90
    },
    "lvl100Stats": {
      "hp": 313,
      "atk": 238,
      "def": 316,
      "spa": 104,
      "spd": 239,
      "spe": 176
    },
    "fixedIV": null
  },
  "Dewgong 2": {
    "species": "Dewgong",
    "nature": "Docile",
    "item": "Shell Bell",
    "moves": [
      "Blizzard",
      "Double-Edge",
      "Encore",
      "Disable"
    ],
    "abilities": [
      "Thick Fat"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 165,
      "atk": 122,
      "def": 100,
      "spa": 122,
      "spd": 115,
      "spe": 90
    },
    "lvl100Stats": {
      "hp": 321,
      "atk": 239,
      "def": 196,
      "spa": 239,
      "spd": 226,
      "spe": 176
    },
    "fixedIV": null
  },
  "Victreebel 2": {
    "species": "Victreebel",
    "nature": "Serious",
    "item": "Leftovers",
    "moves": [
      "Giga Drain",
      "Sludge Bomb",
      "Sleep Powder",
      "Attract"
    ],
    "abilities": [
      "Chlorophyll"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 155,
      "atk": 157,
      "def": 85,
      "spa": 152,
      "spd": 80,
      "spe": 90
    },
    "lvl100Stats": {
      "hp": 301,
      "atk": 309,
      "def": 166,
      "spa": 299,
      "spd": 156,
      "spe": 176
    },
    "fixedIV": null
  },
  "Ludicolo 2": {
    "species": "Ludicolo",
    "nature": "Modest",
    "item": "Shell Bell",
    "moves": [
      "Surf",
      "Ice Beam",
      "ThunderPunch",
      "Fire Punch"
    ],
    "abilities": [
      "Swift Swim",
      "Rain Dish"
    ],
    "evs": {
      "hp": 255,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 187,
      "atk": 81,
      "def": 90,
      "spa": 156,
      "spd": 120,
      "spe": 90
    },
    "lvl100Stats": {
      "hp": 364,
      "atk": 158,
      "def": 176,
      "spa": 306,
      "spd": 236,
      "spe": 176
    },
    "fixedIV": null
  },
  "Skarmory 3": {
    "species": "Skarmory",
    "nature": "Careful",
    "item": "Chesto Berry",
    "moves": [
      "Toxic",
      "Curse",
      "Rest",
      "Fly"
    ],
    "abilities": [
      "Keen Eye",
      "Sturdy"
    ],
    "evs": {
      "hp": 255,
      "atk": 0,
      "def": 0,
      "spa": 0,
      "spd": 255,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 172,
      "atk": 100,
      "def": 160,
      "spa": 54,
      "spd": 134,
      "spe": 90
    },
    "lvl100Stats": {
      "hp": 334,
      "atk": 196,
      "def": 316,
      "spa": 104,
      "spd": 262,
      "spe": 176
    },
    "fixedIV": null
  },
  "Dewgong 3": {
    "species": "Dewgong",
    "nature": "Bold",
    "item": "Chesto Berry",
    "moves": [
      "Horn Drill",
      "Sheer Cold",
      "Sleep Talk",
      "Rest"
    ],
    "abilities": [
      "Thick Fat"
    ],
    "evs": {
      "hp": 255,
      "atk": 0,
      "def": 255,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 197,
      "atk": 81,
      "def": 145,
      "spa": 90,
      "spd": 115,
      "spe": 90
    },
    "lvl100Stats": {
      "hp": 384,
      "atk": 158,
      "def": 284,
      "spa": 176,
      "spd": 226,
      "spe": 176
    },
    "fixedIV": null
  },
  "Victreebel 3": {
    "species": "Victreebel",
    "nature": "Quirky",
    "item": "BrightPowder",
    "moves": [
      "Stun Spore",
      "Ingrain",
      "Giga Drain",
      "Sludge Bomb"
    ],
    "abilities": [
      "Chlorophyll"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 155,
      "atk": 157,
      "def": 85,
      "spa": 152,
      "spd": 80,
      "spe": 90
    },
    "lvl100Stats": {
      "hp": 301,
      "atk": 309,
      "def": 166,
      "spa": 299,
      "spd": 156,
      "spe": 176
    },
    "fixedIV": null
  },
  "Ludicolo 3": {
    "species": "Ludicolo",
    "nature": "Bold",
    "item": "Leftovers",
    "moves": [
      "Leech Seed",
      "Rain Dance",
      "Double Team",
      "Giga Drain"
    ],
    "abilities": [
      "Swift Swim",
      "Rain Dish"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 176,
      "atk": 81,
      "def": 122,
      "spa": 110,
      "spd": 141,
      "spe": 90
    },
    "lvl100Stats": {
      "hp": 343,
      "atk": 158,
      "def": 239,
      "spa": 216,
      "spd": 278,
      "spe": 176
    },
    "fixedIV": null
  },
  "Skarmory 4": {
    "species": "Skarmory",
    "nature": "Adamant",
    "item": "Quick Claw",
    "moves": [
      "Drill Peck",
      "Steel Wing",
      "Counter",
      "Rock Slide"
    ],
    "abilities": [
      "Keen Eye",
      "Sturdy"
    ],
    "evs": {
      "hp": 255,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 172,
      "atk": 145,
      "def": 160,
      "spa": 54,
      "spd": 90,
      "spe": 90
    },
    "lvl100Stats": {
      "hp": 334,
      "atk": 284,
      "def": 316,
      "spa": 104,
      "spd": 176,
      "spe": 176
    },
    "fixedIV": null
  },
  "Dewgong 4": {
    "species": "Dewgong",
    "nature": "Docile",
    "item": "Lum Berry",
    "moves": [
      "Sheer Cold",
      "Ice Beam",
      "Surf",
      "Signal Beam"
    ],
    "abilities": [
      "Thick Fat"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 165,
      "atk": 122,
      "def": 100,
      "spa": 122,
      "spd": 115,
      "spe": 90
    },
    "lvl100Stats": {
      "hp": 321,
      "atk": 239,
      "def": 196,
      "spa": 239,
      "spd": 226,
      "spe": 176
    },
    "fixedIV": null
  },
  "Victreebel 4": {
    "species": "Victreebel",
    "nature": "Quirky",
    "item": "BrightPowder",
    "moves": [
      "Giga Drain",
      "Double-Edge",
      "Sludge Bomb",
      "Synthesis"
    ],
    "abilities": [
      "Chlorophyll"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 155,
      "atk": 157,
      "def": 85,
      "spa": 152,
      "spd": 80,
      "spe": 90
    },
    "lvl100Stats": {
      "hp": 301,
      "atk": 309,
      "def": 166,
      "spa": 299,
      "spd": 156,
      "spe": 176
    },
    "fixedIV": null
  },
  "Ludicolo 4": {
    "species": "Ludicolo",
    "nature": "Bold",
    "item": "Leftovers",
    "moves": [
      "Leech Seed",
      "Rain Dance",
      "Double Team",
      "Toxic"
    ],
    "abilities": [
      "Swift Swim",
      "Rain Dish"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 176,
      "atk": 81,
      "def": 122,
      "spa": 110,
      "spd": 141,
      "spe": 90
    },
    "lvl100Stats": {
      "hp": 343,
      "atk": 158,
      "def": 239,
      "spa": 216,
      "spd": 278,
      "spe": 176
    },
    "fixedIV": null
  },
  "Metagross 4": {
    "species": "Metagross",
    "nature": "Hardy",
    "item": "Quick Claw",
    "moves": [
      "Meteor Mash",
      "Psychic",
      "Earthquake",
      "Shadow Ball"
    ],
    "abilities": [
      "Clear Body"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 155,
      "atk": 187,
      "def": 150,
      "spa": 147,
      "spd": 110,
      "spe": 90
    },
    "lvl100Stats": {
      "hp": 301,
      "atk": 369,
      "def": 296,
      "spa": 289,
      "spd": 216,
      "spe": 176
    },
    "fixedIV": null
  },
  "Metagross 6": {
    "species": "Metagross",
    "nature": "Hardy",
    "item": "BrightPowder",
    "moves": [
      "Meteor Mash",
      "Psychic",
      "Ice Punch",
      "ThunderPunch"
    ],
    "abilities": [
      "Clear Body"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 155,
      "atk": 187,
      "def": 150,
      "spa": 147,
      "spd": 110,
      "spe": 90
    },
    "lvl100Stats": {
      "hp": 301,
      "atk": 369,
      "def": 296,
      "spa": 289,
      "spd": 216,
      "spe": 176
    },
    "fixedIV": null
  },
  "Metagross 7": {
    "species": "Metagross",
    "nature": "Hardy",
    "item": "Shell Bell",
    "moves": [
      "Earthquake",
      "Shadow Ball",
      "Ice Punch",
      "ThunderPunch"
    ],
    "abilities": [
      "Clear Body"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 155,
      "atk": 187,
      "def": 150,
      "spa": 147,
      "spd": 110,
      "spe": 90
    },
    "lvl100Stats": {
      "hp": 301,
      "atk": 369,
      "def": 296,
      "spa": 289,
      "spd": 216,
      "spe": 176
    },
    "fixedIV": null
  },
  "Noland Gold\u2020 Skarmory": {
    "species": "Skarmory",
    "nature": "Impish",
    "item": "Sitrus Berry",
    "moves": [
      "Toxic",
      "Aerial Ace",
      "Protect",
      "Steel Wing"
    ],
    "abilities": [
      "Keen Eye",
      "Sturdy"
    ],
    "evs": {
      "hp": 252,
      "atk": 0,
      "def": 0,
      "spa": 6,
      "spd": 252,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 172,
      "atk": 100,
      "def": 176,
      "spa": 54,
      "spd": 122,
      "spe": 90
    },
    "lvl100Stats": {
      "hp": 334,
      "atk": 196,
      "def": 347,
      "spa": 105,
      "spd": 239,
      "spe": 176
    },
    "fixedIV": 31
  },
  "Noland Silver\u2020 Skarmory": {
    "species": "Skarmory",
    "nature": "Impish",
    "item": "Sitrus Berry",
    "moves": [
      "Toxic",
      "Aerial Ace",
      "Protect",
      "Steel Wing"
    ],
    "abilities": [
      "Keen Eye",
      "Sturdy"
    ],
    "evs": {
      "hp": 252,
      "atk": 0,
      "def": 0,
      "spa": 6,
      "spd": 252,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 172,
      "atk": 100,
      "def": 176,
      "spa": 54,
      "spd": 122,
      "spe": 90
    },
    "lvl100Stats": {
      "hp": 334,
      "atk": 196,
      "def": 347,
      "spa": 105,
      "spd": 239,
      "spe": 176
    },
    "fixedIV": 31
  },
  "Exploud 1": {
    "species": "Exploud",
    "nature": "Impish",
    "item": "Chesto Berry",
    "moves": [
      "Hyper Voice",
      "Shadow Ball",
      "Sleep Talk",
      "Rest"
    ],
    "abilities": [
      "Soundproof"
    ],
    "evs": {
      "hp": 255,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 211,
      "atk": 143,
      "def": 91,
      "spa": 100,
      "spd": 83,
      "spe": 88
    },
    "lvl100Stats": {
      "hp": 412,
      "atk": 281,
      "def": 178,
      "spa": 196,
      "spd": 162,
      "spe": 172
    },
    "fixedIV": null
  },
  "Feraligatr 1": {
    "species": "Feraligatr",
    "nature": "Quiet",
    "item": "Lum Berry",
    "moves": [
      "Surf",
      "Rain Dance",
      "Aerial Ace",
      "Roar"
    ],
    "abilities": [
      "Torrent"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 0,
      "spa": 170,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 181,
      "atk": 125,
      "def": 120,
      "spa": 132,
      "spd": 124,
      "spe": 88
    },
    "lvl100Stats": {
      "hp": 353,
      "atk": 246,
      "def": 236,
      "spa": 259,
      "spd": 244,
      "spe": 172
    },
    "fixedIV": null
  },
  "Exploud 2": {
    "species": "Exploud",
    "nature": "Quirky",
    "item": "Focus Band",
    "moves": [
      "SolarBeam",
      "Sunny Day",
      "Earthquake",
      "Counter"
    ],
    "abilities": [
      "Soundproof"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 179,
      "atk": 143,
      "def": 83,
      "spa": 143,
      "spd": 83,
      "spe": 88
    },
    "lvl100Stats": {
      "hp": 349,
      "atk": 281,
      "def": 162,
      "spa": 281,
      "spd": 162,
      "spe": 172
    },
    "fixedIV": null
  },
  "Blastoise 2": {
    "species": "Blastoise",
    "nature": "Brave",
    "item": "Shell Bell",
    "moves": [
      "Hydro Pump",
      "Mega Kick",
      "Brick Break",
      "Mirror Coat"
    ],
    "abilities": [
      "Torrent"
    ],
    "evs": {
      "hp": 170,
      "atk": 170,
      "def": 0,
      "spa": 170,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 175,
      "atk": 136,
      "def": 120,
      "spa": 126,
      "spd": 125,
      "spe": 88
    },
    "lvl100Stats": {
      "hp": 341,
      "atk": 268,
      "def": 236,
      "spa": 248,
      "spd": 246,
      "spe": 172
    },
    "fixedIV": null
  },
  "Feraligatr 2": {
    "species": "Feraligatr",
    "nature": "Sassy",
    "item": "Quick Claw",
    "moves": [
      "Surf",
      "Dragon Claw",
      "Brick Break",
      "Scary Face"
    ],
    "abilities": [
      "Torrent"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 0,
      "spa": 170,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 181,
      "atk": 125,
      "def": 120,
      "spa": 120,
      "spd": 136,
      "spe": 88
    },
    "lvl100Stats": {
      "hp": 353,
      "atk": 246,
      "def": 236,
      "spa": 236,
      "spd": 268,
      "spe": 172
    },
    "fixedIV": null
  },
  "Exploud 4": {
    "species": "Exploud",
    "nature": "Hardy",
    "item": "White Herb",
    "moves": [
      "Mega Kick",
      "Earthquake",
      "Shadow Ball",
      "Overheat"
    ],
    "abilities": [
      "Soundproof"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 179,
      "atk": 143,
      "def": 83,
      "spa": 143,
      "spd": 83,
      "spe": 88
    },
    "lvl100Stats": {
      "hp": 349,
      "atk": 281,
      "def": 162,
      "spa": 281,
      "spd": 162,
      "spe": 172
    },
    "fixedIV": null
  },
  "Lanturn 2": {
    "species": "Lanturn",
    "nature": "Docile",
    "item": "Salac Berry",
    "moves": [
      "Flail",
      "Endure",
      "Thunderbolt",
      "Surf"
    ],
    "abilities": [
      "Volt Absorb",
      "Illuminate"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 200,
      "atk": 110,
      "def": 78,
      "spa": 128,
      "spd": 96,
      "spe": 87
    },
    "lvl100Stats": {
      "hp": 391,
      "atk": 215,
      "def": 152,
      "spa": 251,
      "spd": 188,
      "spe": 170
    },
    "fixedIV": null
  },
  "Hypno 2": {
    "species": "Hypno",
    "nature": "Modest",
    "item": "TwistedSpoon",
    "moves": [
      "Hypnosis",
      "Nightmare",
      "Dream Eater",
      "Psychic"
    ],
    "abilities": [
      "Insomnia"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 255,
      "spa": 0,
      "spd": 255,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 160,
      "atk": 84,
      "def": 122,
      "spa": 102,
      "spd": 167,
      "spe": 87
    },
    "lvl100Stats": {
      "hp": 311,
      "atk": 163,
      "def": 239,
      "spa": 200,
      "spd": 329,
      "spe": 170
    },
    "fixedIV": null
  },
  "Hypno 3": {
    "species": "Hypno",
    "nature": "Adamant",
    "item": "Lum Berry",
    "moves": [
      "Psych Up",
      "Swagger",
      "Mega Kick",
      "Shadow Ball"
    ],
    "abilities": [
      "Insomnia"
    ],
    "evs": {
      "hp": 255,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 192,
      "atk": 137,
      "def": 90,
      "spa": 84,
      "spd": 135,
      "spe": 87
    },
    "lvl100Stats": {
      "hp": 374,
      "atk": 269,
      "def": 176,
      "spa": 163,
      "spd": 266,
      "spe": 170
    },
    "fixedIV": null
  },
  "Hypno 4": {
    "species": "Hypno",
    "nature": "Modest",
    "item": "Lum Berry",
    "moves": [
      "Psychic",
      "ThunderPunch",
      "Fire Punch",
      "Ice Punch"
    ],
    "abilities": [
      "Insomnia"
    ],
    "evs": {
      "hp": 255,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 192,
      "atk": 84,
      "def": 90,
      "spa": 137,
      "spd": 135,
      "spe": 87
    },
    "lvl100Stats": {
      "hp": 374,
      "atk": 163,
      "def": 176,
      "spa": 269,
      "spd": 266,
      "spe": 170
    },
    "fixedIV": null
  },
  "Greta Silver Shedinja": {
    "species": "Shedinja",
    "nature": "Adamant",
    "item": "BrightPowder",
    "moves": [
      "Shadow Ball",
      "Return",
      "Confuse Ray",
      "Aerial Ace"
    ],
    "abilities": [
      "Wonder Guard"
    ],
    "evs": {
      "hp": 0,
      "atk": 252,
      "def": 6,
      "spa": 0,
      "spd": 0,
      "spe": 252
    },
    "lvl50Stats": {
      "hp": 71,
      "atk": 150,
      "def": 60,
      "spa": 40,
      "spd": 45,
      "spe": 86
    },
    "lvl100Stats": {
      "hp": 132,
      "atk": 294,
      "def": 116,
      "spa": 76,
      "spd": 85,
      "spe": 168
    },
    "fixedIV": 20
  },
  "Scizor 1": {
    "species": "Scizor",
    "nature": "Adamant",
    "item": "Focus Band",
    "moves": [
      "Metal Claw",
      "Aerial Ace",
      "Counter",
      "Quick Attack"
    ],
    "abilities": [
      "Swarm"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 255,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 145,
      "atk": 200,
      "def": 120,
      "spa": 67,
      "spd": 132,
      "spe": 85
    },
    "lvl100Stats": {
      "hp": 281,
      "atk": 394,
      "def": 236,
      "spa": 131,
      "spd": 259,
      "spe": 166
    },
    "fixedIV": null
  },
  "Vaporeon 1": {
    "species": "Vaporeon",
    "nature": "Modest",
    "item": "Mystic Water",
    "moves": [
      "Surf",
      "Roar",
      "Bite",
      "Quick Attack"
    ],
    "abilities": [
      "Water Absorb"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 170,
      "spa": 170,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 205,
      "atk": 76,
      "def": 101,
      "spa": 166,
      "spd": 136,
      "spe": 85
    },
    "lvl100Stats": {
      "hp": 401,
      "atk": 149,
      "def": 198,
      "spa": 327,
      "spd": 268,
      "spe": 166
    },
    "fixedIV": null
  },
  "Flareon 1": {
    "species": "Flareon",
    "nature": "Modest",
    "item": "Sitrus Berry",
    "moves": [
      "Flamethrower",
      "Roar",
      "Bite",
      "Sand-Attack"
    ],
    "abilities": [
      "Flash Fire"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 255,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 140,
      "atk": 135,
      "def": 112,
      "spa": 161,
      "spd": 130,
      "spe": 85
    },
    "lvl100Stats": {
      "hp": 271,
      "atk": 266,
      "def": 219,
      "spa": 317,
      "spd": 256,
      "spe": 166
    },
    "fixedIV": null
  },
  "Umbreon 1": {
    "species": "Umbreon",
    "nature": "Bold",
    "item": "BrightPowder",
    "moves": [
      "Confuse Ray",
      "Faint Attack",
      "Double Team",
      "Baton Pass"
    ],
    "abilities": [
      "Synchronize"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 191,
      "atk": 76,
      "def": 166,
      "spa": 80,
      "spd": 171,
      "spe": 85
    },
    "lvl100Stats": {
      "hp": 373,
      "atk": 149,
      "def": 327,
      "spa": 156,
      "spd": 338,
      "spe": 166
    },
    "fixedIV": null
  },
  "Scizor 2": {
    "species": "Scizor",
    "nature": "Adamant",
    "item": "Quick Claw",
    "moves": [
      "Silver Wind",
      "Steel Wing",
      "Swords Dance",
      "Light Screen"
    ],
    "abilities": [
      "Swarm"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 255,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 145,
      "atk": 200,
      "def": 120,
      "spa": 67,
      "spd": 132,
      "spe": 85
    },
    "lvl100Stats": {
      "hp": 281,
      "atk": 394,
      "def": 236,
      "spa": 131,
      "spd": 259,
      "spe": 166
    },
    "fixedIV": null
  },
  "Vaporeon 2": {
    "species": "Vaporeon",
    "nature": "Docile",
    "item": "Shell Bell",
    "moves": [
      "Surf",
      "Ice Beam",
      "Body Slam",
      "Shadow Ball"
    ],
    "abilities": [
      "Water Absorb"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 226,
      "atk": 85,
      "def": 101,
      "spa": 130,
      "spd": 136,
      "spe": 85
    },
    "lvl100Stats": {
      "hp": 443,
      "atk": 166,
      "def": 198,
      "spa": 256,
      "spd": 268,
      "spe": 166
    },
    "fixedIV": null
  },
  "Umbreon 2": {
    "species": "Umbreon",
    "nature": "Adamant",
    "item": "Leftovers",
    "moves": [
      "Curse",
      "Screech",
      "Double Team",
      "Double-Edge"
    ],
    "abilities": [
      "Synchronize"
    ],
    "evs": {
      "hp": 170,
      "atk": 170,
      "def": 0,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 191,
      "atk": 117,
      "def": 130,
      "spa": 72,
      "spd": 171,
      "spe": 85
    },
    "lvl100Stats": {
      "hp": 373,
      "atk": 228,
      "def": 256,
      "spa": 140,
      "spd": 338,
      "spe": 166
    },
    "fixedIV": null
  },
  "Walrein 2": {
    "species": "Walrein",
    "nature": "Quirky",
    "item": "Focus Band",
    "moves": [
      "Earthquake",
      "Ice Beam",
      "Curse",
      "Double Team"
    ],
    "abilities": [
      "Thick Fat"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 206,
      "atk": 100,
      "def": 131,
      "spa": 115,
      "spd": 131,
      "spe": 85
    },
    "lvl100Stats": {
      "hp": 403,
      "atk": 196,
      "def": 258,
      "spa": 226,
      "spd": 258,
      "spe": 166
    },
    "fixedIV": null
  },
  "Scizor 3": {
    "species": "Scizor",
    "nature": "Careful",
    "item": "Focus Band",
    "moves": [
      "Reversal",
      "Endure",
      "Agility",
      "Slash"
    ],
    "abilities": [
      "Swarm"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 255,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 145,
      "atk": 182,
      "def": 120,
      "spa": 67,
      "spd": 145,
      "spe": 85
    },
    "lvl100Stats": {
      "hp": 281,
      "atk": 359,
      "def": 236,
      "spa": 131,
      "spd": 284,
      "spe": 166
    },
    "fixedIV": null
  },
  "Vaporeon 3": {
    "species": "Vaporeon",
    "nature": "Calm",
    "item": "Quick Claw",
    "moves": [
      "Surf",
      "Ice Beam",
      "Acid Armor",
      "Baton Pass"
    ],
    "abilities": [
      "Water Absorb"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 226,
      "atk": 76,
      "def": 101,
      "spa": 130,
      "spd": 150,
      "spe": 85
    },
    "lvl100Stats": {
      "hp": 443,
      "atk": 149,
      "def": 198,
      "spa": 256,
      "spd": 294,
      "spe": 166
    },
    "fixedIV": null
  },
  "Umbreon 3": {
    "species": "Umbreon",
    "nature": "Bold",
    "item": "BrightPowder",
    "moves": [
      "Swagger",
      "Psych Up",
      "Attract",
      "Shadow Ball"
    ],
    "abilities": [
      "Synchronize"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 191,
      "atk": 76,
      "def": 166,
      "spa": 80,
      "spd": 171,
      "spe": 85
    },
    "lvl100Stats": {
      "hp": 373,
      "atk": 149,
      "def": 327,
      "spa": 156,
      "spd": 338,
      "spe": 166
    },
    "fixedIV": null
  },
  "Walrein 3": {
    "species": "Walrein",
    "nature": "Hardy",
    "item": "Quick Claw",
    "moves": [
      "Sheer Cold",
      "Fissure",
      "Surf",
      "Attract"
    ],
    "abilities": [
      "Thick Fat"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 206,
      "atk": 100,
      "def": 131,
      "spa": 115,
      "spd": 131,
      "spe": 85
    },
    "lvl100Stats": {
      "hp": 403,
      "atk": 196,
      "def": 258,
      "spa": 226,
      "spd": 258,
      "spe": 166
    },
    "fixedIV": null
  },
  "Scizor 4": {
    "species": "Scizor",
    "nature": "Careful",
    "item": "BrightPowder",
    "moves": [
      "Silver Wind",
      "Swords Dance",
      "Agility",
      "Baton Pass"
    ],
    "abilities": [
      "Swarm"
    ],
    "evs": {
      "hp": 255,
      "atk": 0,
      "def": 0,
      "spa": 0,
      "spd": 255,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 177,
      "atk": 150,
      "def": 120,
      "spa": 67,
      "spd": 145,
      "spe": 85
    },
    "lvl100Stats": {
      "hp": 344,
      "atk": 296,
      "def": 236,
      "spa": 131,
      "spd": 284,
      "spe": 166
    },
    "fixedIV": null
  },
  "Vaporeon 4": {
    "species": "Vaporeon",
    "nature": "Calm",
    "item": "Lum Berry",
    "moves": [
      "Surf",
      "Ice Beam",
      "Acid Armor",
      "Rest"
    ],
    "abilities": [
      "Water Absorb"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 0,
      "spa": 170,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 226,
      "atk": 76,
      "def": 80,
      "spa": 151,
      "spd": 150,
      "spe": 85
    },
    "lvl100Stats": {
      "hp": 443,
      "atk": 149,
      "def": 156,
      "spa": 298,
      "spd": 294,
      "spe": 166
    },
    "fixedIV": null
  },
  "Umbreon 4": {
    "species": "Umbreon",
    "nature": "Bold",
    "item": "Leftovers",
    "moves": [
      "Confuse Ray",
      "Toxic",
      "Faint Attack",
      "Double Team"
    ],
    "abilities": [
      "Synchronize"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 191,
      "atk": 76,
      "def": 166,
      "spa": 80,
      "spd": 171,
      "spe": 85
    },
    "lvl100Stats": {
      "hp": 373,
      "atk": 149,
      "def": 327,
      "spa": 156,
      "spd": 338,
      "spe": 166
    },
    "fixedIV": null
  },
  "Greta Gold Umbreon": {
    "species": "Umbreon",
    "nature": "Calm",
    "item": "Chesto Berry",
    "moves": [
      "Double-Edge",
      "Confuse Ray",
      "Rest",
      "Psychic"
    ],
    "abilities": [
      "Synchronize"
    ],
    "evs": {
      "hp": 252,
      "atk": 0,
      "def": 0,
      "spa": 252,
      "spd": 6,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 202,
      "atk": 76,
      "def": 130,
      "spa": 112,
      "spd": 166,
      "spe": 85
    },
    "lvl100Stats": {
      "hp": 394,
      "atk": 149,
      "def": 256,
      "spa": 219,
      "spd": 326,
      "spe": 166
    },
    "fixedIV": 31
  },
  "Lucy Gold Seviper": {
    "species": "Seviper",
    "nature": "Bold",
    "item": "Focus Band",
    "moves": [
      "Swagger",
      "Crunch",
      "Sludge Bomb",
      "Giga Drain"
    ],
    "abilities": [
      "Shed Skin"
    ],
    "evs": {
      "hp": 252,
      "atk": 0,
      "def": 0,
      "spa": 252,
      "spd": 6,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 180,
      "atk": 108,
      "def": 88,
      "spa": 152,
      "spd": 81,
      "spe": 85
    },
    "lvl100Stats": {
      "hp": 350,
      "atk": 212,
      "def": 171,
      "spa": 299,
      "spd": 157,
      "spe": 166
    },
    "fixedIV": 31
  },
  "Dewgong 1": {
    "species": "Dewgong",
    "nature": "Quiet",
    "item": "NeverMeltIce",
    "moves": [
      "Ice Beam",
      "Icy Wind",
      "Headbutt",
      "Fake Out"
    ],
    "abilities": [
      "Thick Fat"
    ],
    "evs": {
      "hp": 255,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 197,
      "atk": 90,
      "def": 100,
      "spa": 134,
      "spd": 115,
      "spe": 81
    },
    "lvl100Stats": {
      "hp": 384,
      "atk": 176,
      "def": 196,
      "spa": 262,
      "spd": 226,
      "spe": 158
    },
    "fixedIV": null
  },
  "Victreebel 1": {
    "species": "Victreebel",
    "nature": "Quiet",
    "item": "Sitrus Berry",
    "moves": [
      "Giga Drain",
      "Sleep Powder",
      "Sweet Scent",
      "Synthesis"
    ],
    "abilities": [
      "Chlorophyll"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 255,
      "spa": 0,
      "spd": 255,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 155,
      "atk": 125,
      "def": 117,
      "spa": 132,
      "spd": 112,
      "spe": 81
    },
    "lvl100Stats": {
      "hp": 301,
      "atk": 246,
      "def": 229,
      "spa": 259,
      "spd": 219,
      "spe": 158
    },
    "fixedIV": null
  },
  "Ludicolo 1": {
    "species": "Ludicolo",
    "nature": "Quiet",
    "item": "Shell Bell",
    "moves": [
      "Surf",
      "Rain Dance",
      "ThunderPunch",
      "Fire Punch"
    ],
    "abilities": [
      "Swift Swim",
      "Rain Dish"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 170,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 176,
      "atk": 90,
      "def": 111,
      "spa": 144,
      "spd": 120,
      "spe": 81
    },
    "lvl100Stats": {
      "hp": 343,
      "atk": 176,
      "def": 218,
      "spa": 283,
      "spd": 236,
      "spe": 158
    },
    "fixedIV": null
  },
  "Tyranitar 1": {
    "species": "Tyranitar",
    "nature": "Hardy",
    "item": "BrightPowder",
    "moves": [
      "Earthquake",
      "Aerial Ace",
      "Thunderbolt",
      "Surf"
    ],
    "abilities": [
      "Sand Stream"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 175,
      "atk": 186,
      "def": 130,
      "spa": 147,
      "spd": 120,
      "spe": 81
    },
    "lvl100Stats": {
      "hp": 341,
      "atk": 367,
      "def": 256,
      "spa": 289,
      "spd": 236,
      "spe": 158
    },
    "fixedIV": null
  },
  "Tyranitar 2": {
    "species": "Tyranitar",
    "nature": "Hardy",
    "item": "BrightPowder",
    "moves": [
      "Earthquake",
      "Rock Slide",
      "Crunch",
      "Thunderbolt"
    ],
    "abilities": [
      "Sand Stream"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 175,
      "atk": 186,
      "def": 130,
      "spa": 147,
      "spd": 120,
      "spe": 81
    },
    "lvl100Stats": {
      "hp": 341,
      "atk": 367,
      "def": 256,
      "spa": 289,
      "spd": 236,
      "spe": 158
    },
    "fixedIV": null
  },
  "Tyranitar 3": {
    "species": "Tyranitar",
    "nature": "Adamant",
    "item": "Focus Band",
    "moves": [
      "Earthquake",
      "Rock Slide",
      "Counter",
      "Dragon Dance"
    ],
    "abilities": [
      "Sand Stream"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 196,
      "atk": 169,
      "def": 151,
      "spa": 103,
      "spd": 141,
      "spe": 81
    },
    "lvl100Stats": {
      "hp": 383,
      "atk": 334,
      "def": 298,
      "spa": 203,
      "spd": 278,
      "spe": 158
    },
    "fixedIV": null
  },
  "Tyranitar 4": {
    "species": "Tyranitar",
    "nature": "Modest",
    "item": "Quick Claw",
    "moves": [
      "Crunch",
      "Ice Beam",
      "Thunderbolt",
      "Flamethrower"
    ],
    "abilities": [
      "Sand Stream"
    ],
    "evs": {
      "hp": 255,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 207,
      "atk": 139,
      "def": 130,
      "spa": 161,
      "spd": 120,
      "spe": 81
    },
    "lvl100Stats": {
      "hp": 404,
      "atk": 273,
      "def": 256,
      "spa": 317,
      "spd": 236,
      "spe": 158
    },
    "fixedIV": null
  },
  "Tyranitar 5": {
    "species": "Tyranitar",
    "nature": "Adamant",
    "item": "Chesto Berry",
    "moves": [
      "Earthquake",
      "Rock Slide",
      "Dragon Dance",
      "Rest"
    ],
    "abilities": [
      "Sand Stream"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 196,
      "atk": 169,
      "def": 151,
      "spa": 103,
      "spd": 141,
      "spe": 81
    },
    "lvl100Stats": {
      "hp": 383,
      "atk": 334,
      "def": 298,
      "spa": 203,
      "spd": 278,
      "spe": 158
    },
    "fixedIV": null
  },
  "Tyranitar 6": {
    "species": "Tyranitar",
    "nature": "Adamant",
    "item": "Chesto Berry",
    "moves": [
      "Earthquake",
      "Rock Slide",
      "Curse",
      "Rest"
    ],
    "abilities": [
      "Sand Stream"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 196,
      "atk": 169,
      "def": 151,
      "spa": 103,
      "spd": 141,
      "spe": 81
    },
    "lvl100Stats": {
      "hp": 383,
      "atk": 334,
      "def": 298,
      "spa": 203,
      "spd": 278,
      "spe": 158
    },
    "fixedIV": null
  },
  "Tyranitar 7": {
    "species": "Tyranitar",
    "nature": "Adamant",
    "item": "Quick Claw",
    "moves": [
      "Rock Slide",
      "Aerial Ace",
      "Brick Break",
      "Curse"
    ],
    "abilities": [
      "Sand Stream"
    ],
    "evs": {
      "hp": 255,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 207,
      "atk": 204,
      "def": 130,
      "spa": 103,
      "spd": 120,
      "spe": 81
    },
    "lvl100Stats": {
      "hp": 404,
      "atk": 403,
      "def": 256,
      "spa": 203,
      "spd": 236,
      "spe": 158
    },
    "fixedIV": null
  },
  "Tyranitar 8": {
    "species": "Tyranitar",
    "nature": "Adamant",
    "item": "Lum Berry",
    "moves": [
      "Rock Slide",
      "Thunder Wave",
      "Dragon Dance",
      "Rest"
    ],
    "abilities": [
      "Sand Stream"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 196,
      "atk": 169,
      "def": 151,
      "spa": 103,
      "spd": 141,
      "spe": 81
    },
    "lvl100Stats": {
      "hp": 383,
      "atk": 334,
      "def": 298,
      "spa": 203,
      "spd": 278,
      "spe": 158
    },
    "fixedIV": null
  },
  "Tyranitar 9": {
    "species": "Tyranitar",
    "nature": "Hardy",
    "item": "Quick Claw",
    "moves": [
      "Crunch",
      "Earthquake",
      "Aerial Ace",
      "Attract"
    ],
    "abilities": [
      "Sand Stream"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 175,
      "atk": 186,
      "def": 130,
      "spa": 147,
      "spd": 120,
      "spe": 81
    },
    "lvl100Stats": {
      "hp": 341,
      "atk": 367,
      "def": 256,
      "spa": 289,
      "spd": 236,
      "spe": 158
    },
    "fixedIV": null
  },
  "Tyranitar 10": {
    "species": "Tyranitar",
    "nature": "Adamant",
    "item": "Lum Berry",
    "moves": [
      "Double-Edge",
      "Earthquake",
      "Rock Slide",
      "Dragon Dance"
    ],
    "abilities": [
      "Sand Stream"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 196,
      "atk": 169,
      "def": 151,
      "spa": 103,
      "spd": 141,
      "spe": 81
    },
    "lvl100Stats": {
      "hp": 383,
      "atk": 334,
      "def": 298,
      "spa": 203,
      "spd": 278,
      "spe": 158
    },
    "fixedIV": null
  },
  "Tucker Gold Metagross": {
    "species": "Metagross",
    "nature": "Brave",
    "item": "Quick Claw",
    "moves": [
      "Psychic",
      "Meteor Mash",
      "Earthquake",
      "Protect"
    ],
    "abilities": [
      "Clear Body"
    ],
    "evs": {
      "hp": 252,
      "atk": 252,
      "def": 6,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 187,
      "atk": 205,
      "def": 151,
      "spa": 115,
      "spd": 110,
      "spe": 81
    },
    "lvl100Stats": {
      "hp": 364,
      "atk": 405,
      "def": 297,
      "spa": 226,
      "spd": 216,
      "spe": 158
    },
    "fixedIV": 31
  },
  "Whiscash 1": {
    "species": "Whiscash",
    "nature": "Adamant",
    "item": "Chesto Berry",
    "moves": [
      "Earthquake",
      "Rock Slide",
      "Amnesia",
      "Rest"
    ],
    "abilities": [
      "Oblivious"
    ],
    "evs": {
      "hp": 255,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 217,
      "atk": 143,
      "def": 93,
      "spa": 86,
      "spd": 91,
      "spe": 80
    },
    "lvl100Stats": {
      "hp": 424,
      "atk": 280,
      "def": 182,
      "spa": 169,
      "spd": 178,
      "spe": 156
    },
    "fixedIV": null
  },
  "Weezing 1": {
    "species": "Weezing",
    "nature": "Adamant",
    "item": "BrightPowder",
    "moves": [
      "Sludge Bomb",
      "Will-O-Wisp",
      "Shadow Ball",
      "SmokeScreen"
    ],
    "abilities": [
      "Levitate"
    ],
    "evs": {
      "hp": 255,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 172,
      "atk": 156,
      "def": 140,
      "spa": 94,
      "spd": 90,
      "spe": 80
    },
    "lvl100Stats": {
      "hp": 334,
      "atk": 306,
      "def": 276,
      "spa": 185,
      "spd": 176,
      "spe": 156
    },
    "fixedIV": null
  },
  "Porygon2 1": {
    "species": "Porygon2",
    "nature": "Adamant",
    "item": "Leftovers",
    "moves": [
      "Tri Attack",
      "Aerial Ace",
      "Shadow Ball",
      "Recover"
    ],
    "abilities": [
      "Trace"
    ],
    "evs": {
      "hp": 255,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 192,
      "atk": 145,
      "def": 110,
      "spa": 112,
      "spd": 115,
      "spe": 80
    },
    "lvl100Stats": {
      "hp": 374,
      "atk": 284,
      "def": 216,
      "spa": 221,
      "spd": 226,
      "spe": 156
    },
    "fixedIV": null
  },
  "Lapras 1": {
    "species": "Lapras",
    "nature": "Bold",
    "item": "Leftovers",
    "moves": [
      "Surf",
      "Attract",
      "Confuse Ray",
      "Sing"
    ],
    "abilities": [
      "Water Absorb",
      "Shell Armor"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 255,
      "spa": 0,
      "spd": 255,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 205,
      "atk": 94,
      "def": 145,
      "spa": 105,
      "spd": 147,
      "spe": 80
    },
    "lvl100Stats": {
      "hp": 401,
      "atk": 185,
      "def": 284,
      "spa": 206,
      "spd": 289,
      "spe": 156
    },
    "fixedIV": null
  },
  "Swampert 1": {
    "species": "Swampert",
    "nature": "Adamant",
    "item": "Lum Berry",
    "moves": [
      "Earthquake",
      "Counter",
      "Rest",
      "Curse"
    ],
    "abilities": [
      "Torrent"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 196,
      "atk": 143,
      "def": 131,
      "spa": 94,
      "spd": 131,
      "spe": 80
    },
    "lvl100Stats": {
      "hp": 383,
      "atk": 281,
      "def": 258,
      "spa": 185,
      "spd": 258,
      "spe": 156
    },
    "fixedIV": null
  },
  "Whiscash 2": {
    "species": "Whiscash",
    "nature": "Hardy",
    "item": "Shell Bell",
    "moves": [
      "Surf",
      "Earthquake",
      "Spark",
      "Future Sight"
    ],
    "abilities": [
      "Oblivious"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 185,
      "atk": 130,
      "def": 93,
      "spa": 128,
      "spd": 91,
      "spe": 80
    },
    "lvl100Stats": {
      "hp": 361,
      "atk": 255,
      "def": 182,
      "spa": 251,
      "spd": 178,
      "spe": 156
    },
    "fixedIV": null
  },
  "Clefable 2": {
    "species": "Clefable",
    "nature": "Adamant",
    "item": "Focus Band",
    "moves": [
      "Meteor Mash",
      "Cosmic Power",
      "Double Team",
      "Follow Me"
    ],
    "abilities": [
      "Cute Charm"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 255,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 170,
      "atk": 134,
      "def": 125,
      "spa": 94,
      "spd": 110,
      "spe": 80
    },
    "lvl100Stats": {
      "hp": 331,
      "atk": 262,
      "def": 245,
      "spa": 185,
      "spd": 216,
      "spe": 156
    },
    "fixedIV": null
  },
  "Weezing 2": {
    "species": "Weezing",
    "nature": "Adamant",
    "item": "Sitrus Berry",
    "moves": [
      "Memento",
      "Sludge Bomb",
      "Facade",
      "Destiny Bond"
    ],
    "abilities": [
      "Levitate"
    ],
    "evs": {
      "hp": 255,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 172,
      "atk": 156,
      "def": 140,
      "spa": 94,
      "spd": 90,
      "spe": 80
    },
    "lvl100Stats": {
      "hp": 334,
      "atk": 306,
      "def": 276,
      "spa": 185,
      "spd": 176,
      "spe": 156
    },
    "fixedIV": null
  },
  "Wailord 2": {
    "species": "Wailord",
    "nature": "Adamant",
    "item": "Chesto Berry",
    "moves": [
      "Double-Edge",
      "Rest",
      "Curse",
      "Amnesia"
    ],
    "abilities": [
      "Water Veil",
      "Oblivious"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 266,
      "atk": 121,
      "def": 86,
      "spa": 99,
      "spd": 86,
      "spe": 80
    },
    "lvl100Stats": {
      "hp": 523,
      "atk": 237,
      "def": 168,
      "spa": 194,
      "spd": 168,
      "spe": 156
    },
    "fixedIV": null
  },
  "Porygon2 2": {
    "species": "Porygon2",
    "nature": "Modest",
    "item": "Lum Berry",
    "moves": [
      "SolarBeam",
      "Sunny Day",
      "Thunder Wave",
      "Recover"
    ],
    "abilities": [
      "Trace"
    ],
    "evs": {
      "hp": 255,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 192,
      "atk": 90,
      "def": 110,
      "spa": 172,
      "spd": 115,
      "spe": 80
    },
    "lvl100Stats": {
      "hp": 374,
      "atk": 176,
      "def": 216,
      "spa": 339,
      "spd": 226,
      "spe": 156
    },
    "fixedIV": null
  },
  "Swampert 2": {
    "species": "Swampert",
    "nature": "Docile",
    "item": "Quick Claw",
    "moves": [
      "Surf",
      "Earthquake",
      "Counter",
      "Mirror Coat"
    ],
    "abilities": [
      "Torrent"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 196,
      "atk": 130,
      "def": 131,
      "spa": 105,
      "spd": 131,
      "spe": 80
    },
    "lvl100Stats": {
      "hp": 383,
      "atk": 256,
      "def": 258,
      "spa": 206,
      "spd": 258,
      "spe": 156
    },
    "fixedIV": null
  },
  "Whiscash 3": {
    "species": "Whiscash",
    "nature": "Hardy",
    "item": "Chesto Berry",
    "moves": [
      "Sleep Talk",
      "Rest",
      "Surf",
      "Fissure"
    ],
    "abilities": [
      "Oblivious"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 255,
      "spa": 0,
      "spd": 255,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 185,
      "atk": 98,
      "def": 125,
      "spa": 96,
      "spd": 123,
      "spe": 80
    },
    "lvl100Stats": {
      "hp": 361,
      "atk": 192,
      "def": 245,
      "spa": 188,
      "spd": 241,
      "spe": 156
    },
    "fixedIV": null
  },
  "Clefable 3": {
    "species": "Clefable",
    "nature": "Modest",
    "item": "Lum Berry",
    "moves": [
      "Thunderbolt",
      "Ice Beam",
      "Flamethrower",
      "Magical Leaf"
    ],
    "abilities": [
      "Cute Charm"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 255,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 170,
      "atk": 81,
      "def": 125,
      "spa": 150,
      "spd": 110,
      "spe": 80
    },
    "lvl100Stats": {
      "hp": 331,
      "atk": 158,
      "def": 245,
      "spa": 295,
      "spd": 216,
      "spe": 156
    },
    "fixedIV": null
  },
  "Weezing 3": {
    "species": "Weezing",
    "nature": "Quirky",
    "item": "Focus Band",
    "moves": [
      "Explosion",
      "Sludge Bomb",
      "Flamethrower",
      "Thunderbolt"
    ],
    "abilities": [
      "Levitate"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 140,
      "atk": 142,
      "def": 140,
      "spa": 137,
      "spd": 90,
      "spe": 80
    },
    "lvl100Stats": {
      "hp": 271,
      "atk": 279,
      "def": 276,
      "spa": 269,
      "spd": 176,
      "spe": 156
    },
    "fixedIV": null
  },
  "Wailord 3": {
    "species": "Wailord",
    "nature": "Modest",
    "item": "Chesto Berry",
    "moves": [
      "Hydro Pump",
      "Fissure",
      "Double Team",
      "Rest"
    ],
    "abilities": [
      "Water Veil",
      "Oblivious"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 266,
      "atk": 99,
      "def": 86,
      "spa": 121,
      "spd": 86,
      "spe": 80
    },
    "lvl100Stats": {
      "hp": 523,
      "atk": 194,
      "def": 168,
      "spa": 237,
      "spd": 168,
      "spe": 156
    },
    "fixedIV": null
  },
  "Porygon2 3": {
    "species": "Porygon2",
    "nature": "Modest",
    "item": "Lum Berry",
    "moves": [
      "Psychic",
      "Tri Attack",
      "Thunder Wave",
      "Recover"
    ],
    "abilities": [
      "Trace"
    ],
    "evs": {
      "hp": 255,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 192,
      "atk": 90,
      "def": 110,
      "spa": 172,
      "spd": 115,
      "spe": 80
    },
    "lvl100Stats": {
      "hp": 374,
      "atk": 176,
      "def": 216,
      "spa": 339,
      "spd": 226,
      "spe": 156
    },
    "fixedIV": null
  },
  "Lapras 3": {
    "species": "Lapras",
    "nature": "Docile",
    "item": "BrightPowder",
    "moves": [
      "Double-Edge",
      "Psychic",
      "Confuse Ray",
      "Dragon Dance"
    ],
    "abilities": [
      "Water Absorb",
      "Shell Armor"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 226,
      "atk": 105,
      "def": 121,
      "spa": 105,
      "spd": 136,
      "spe": 80
    },
    "lvl100Stats": {
      "hp": 443,
      "atk": 206,
      "def": 238,
      "spa": 206,
      "spd": 268,
      "spe": 156
    },
    "fixedIV": null
  },
  "Clefable 4": {
    "species": "Clefable",
    "nature": "Docile",
    "item": "Focus Band",
    "moves": [
      "Mega Kick",
      "Psychic",
      "Shadow Ball",
      "Softboiled"
    ],
    "abilities": [
      "Cute Charm"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 255,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 170,
      "atk": 122,
      "def": 125,
      "spa": 105,
      "spd": 110,
      "spe": 80
    },
    "lvl100Stats": {
      "hp": 331,
      "atk": 239,
      "def": 245,
      "spa": 206,
      "spd": 216,
      "spe": 156
    },
    "fixedIV": null
  },
  "Weezing 4": {
    "species": "Weezing",
    "nature": "Adamant",
    "item": "Focus Band",
    "moves": [
      "Explosion",
      "Sludge Bomb",
      "Frustration",
      "Shadow Ball"
    ],
    "abilities": [
      "Levitate"
    ],
    "evs": {
      "hp": 255,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 172,
      "atk": 156,
      "def": 140,
      "spa": 94,
      "spd": 90,
      "spe": 80
    },
    "lvl100Stats": {
      "hp": 334,
      "atk": 306,
      "def": 276,
      "spa": 185,
      "spd": 176,
      "spe": 156
    },
    "fixedIV": null
  },
  "Wailord 4": {
    "species": "Wailord",
    "nature": "Hardy",
    "item": "Quick Claw",
    "moves": [
      "Surf",
      "Ice Beam",
      "Earthquake",
      "Fissure"
    ],
    "abilities": [
      "Water Veil",
      "Oblivious"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 266,
      "atk": 110,
      "def": 86,
      "spa": 110,
      "spd": 86,
      "spe": 80
    },
    "lvl100Stats": {
      "hp": 523,
      "atk": 216,
      "def": 168,
      "spa": 216,
      "spd": 168,
      "spe": 156
    },
    "fixedIV": null
  },
  "Porygon2 4": {
    "species": "Porygon2",
    "nature": "Modest",
    "item": "BrightPowder",
    "moves": [
      "Psychic",
      "Thunderbolt",
      "Ice Beam",
      "Recover"
    ],
    "abilities": [
      "Trace"
    ],
    "evs": {
      "hp": 255,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 192,
      "atk": 90,
      "def": 110,
      "spa": 172,
      "spd": 115,
      "spe": 80
    },
    "lvl100Stats": {
      "hp": 374,
      "atk": 176,
      "def": 216,
      "spa": 339,
      "spd": 226,
      "spe": 156
    },
    "fixedIV": null
  },
  "Lapras 4": {
    "species": "Lapras",
    "nature": "Modest",
    "item": "Lum Berry",
    "moves": [
      "Surf",
      "Ice Beam",
      "Thunderbolt",
      "Psychic"
    ],
    "abilities": [
      "Water Absorb",
      "Shell Armor"
    ],
    "evs": {
      "hp": 255,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 237,
      "atk": 94,
      "def": 100,
      "spa": 150,
      "spd": 115,
      "spe": 80
    },
    "lvl100Stats": {
      "hp": 464,
      "atk": 185,
      "def": 196,
      "spa": 295,
      "spd": 226,
      "spe": 156
    },
    "fixedIV": null
  },
  "Lapras 5": {
    "species": "Lapras",
    "nature": "Docile",
    "item": "Shell Bell",
    "moves": [
      "Psychic",
      "Thunderbolt",
      "Iron Tail",
      "Double-Edge"
    ],
    "abilities": [
      "Water Absorb",
      "Shell Armor"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 205,
      "atk": 137,
      "def": 100,
      "spa": 137,
      "spd": 115,
      "spe": 80
    },
    "lvl100Stats": {
      "hp": 401,
      "atk": 269,
      "def": 196,
      "spa": 269,
      "spd": 226,
      "spe": 156
    },
    "fixedIV": null
  },
  "Lapras 6": {
    "species": "Lapras",
    "nature": "Modest",
    "item": "BrightPowder",
    "moves": [
      "Hydro Pump",
      "Thunder",
      "Rain Dance",
      "Blizzard"
    ],
    "abilities": [
      "Water Absorb",
      "Shell Armor"
    ],
    "evs": {
      "hp": 255,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 237,
      "atk": 94,
      "def": 100,
      "spa": 150,
      "spd": 115,
      "spe": 80
    },
    "lvl100Stats": {
      "hp": 464,
      "atk": 185,
      "def": 196,
      "spa": 295,
      "spd": 226,
      "spe": 156
    },
    "fixedIV": null
  },
  "Lapras 7": {
    "species": "Lapras",
    "nature": "Calm",
    "item": "Leppa Berry",
    "moves": [
      "Sheer Cold",
      "Horn Drill",
      "Rest",
      "Sleep Talk"
    ],
    "abilities": [
      "Water Absorb",
      "Shell Armor"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 226,
      "atk": 94,
      "def": 121,
      "spa": 105,
      "spd": 150,
      "spe": 80
    },
    "lvl100Stats": {
      "hp": 443,
      "atk": 185,
      "def": 238,
      "spa": 206,
      "spd": 294,
      "spe": 156
    },
    "fixedIV": null
  },
  "Lapras 8": {
    "species": "Lapras",
    "nature": "Calm",
    "item": "Quick Claw",
    "moves": [
      "Sheer Cold",
      "Horn Drill",
      "Sing",
      "Attract"
    ],
    "abilities": [
      "Water Absorb",
      "Shell Armor"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 226,
      "atk": 94,
      "def": 121,
      "spa": 105,
      "spd": 150,
      "spe": 80
    },
    "lvl100Stats": {
      "hp": 443,
      "atk": 185,
      "def": 238,
      "spa": 206,
      "spd": 294,
      "spe": 156
    },
    "fixedIV": null
  },
  "Greta Silver Umbreon": {
    "species": "Umbreon",
    "nature": "Calm",
    "item": "Leftovers",
    "moves": [
      "Body Slam",
      "Confuse Ray",
      "Psychic",
      "Faint Attack"
    ],
    "abilities": [
      "Synchronize"
    ],
    "evs": {
      "hp": 152,
      "atk": 0,
      "def": 100,
      "spa": 152,
      "spd": 106,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 184,
      "atk": 72,
      "def": 137,
      "spa": 94,
      "spd": 173,
      "spe": 80
    },
    "lvl100Stats": {
      "hp": 358,
      "atk": 139,
      "def": 270,
      "spa": 183,
      "spd": 342,
      "spe": 155
    },
    "fixedIV": 20
  },
  "Lanturn 1": {
    "species": "Lanturn",
    "nature": "Quiet",
    "item": "Cheri Berry",
    "moves": [
      "Surf",
      "Confuse Ray",
      "Attract",
      "Thunder Wave"
    ],
    "abilities": [
      "Volt Absorb",
      "Illuminate"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 255,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 200,
      "atk": 78,
      "def": 110,
      "spa": 140,
      "spd": 96,
      "spe": 78
    },
    "lvl100Stats": {
      "hp": 391,
      "atk": 152,
      "def": 215,
      "spa": 276,
      "spd": 188,
      "spe": 153
    },
    "fixedIV": null
  },
  "Hypno 1": {
    "species": "Hypno",
    "nature": "Quiet",
    "item": "TwistedSpoon",
    "moves": [
      "ThunderPunch",
      "Fire Punch",
      "Ice Punch",
      "Hypnosis"
    ],
    "abilities": [
      "Insomnia"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 255,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 160,
      "atk": 93,
      "def": 122,
      "spa": 137,
      "spd": 135,
      "spe": 78
    },
    "lvl100Stats": {
      "hp": 311,
      "atk": 182,
      "def": 239,
      "spa": 269,
      "spd": 266,
      "spe": 153
    },
    "fixedIV": null
  },
  "Walrein 1": {
    "species": "Walrein",
    "nature": "Quiet",
    "item": "Leftovers",
    "moves": [
      "Blizzard",
      "Hail",
      "Yawn",
      "Protect"
    ],
    "abilities": [
      "Thick Fat"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 206,
      "atk": 100,
      "def": 131,
      "spa": 127,
      "spd": 131,
      "spe": 76
    },
    "lvl100Stats": {
      "hp": 403,
      "atk": 196,
      "def": 258,
      "spa": 248,
      "spd": 258,
      "spe": 149
    },
    "fixedIV": null
  },
  "Flareon 2": {
    "species": "Flareon",
    "nature": "Relaxed",
    "item": "Quick Claw",
    "moves": [
      "Curse",
      "Attract",
      "Double-Edge",
      "Shadow Ball"
    ],
    "abilities": [
      "Flash Fire"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 161,
      "atk": 150,
      "def": 111,
      "spa": 115,
      "spd": 151,
      "spe": 76
    },
    "lvl100Stats": {
      "hp": 313,
      "atk": 296,
      "def": 217,
      "spa": 226,
      "spd": 298,
      "spe": 149
    },
    "fixedIV": null
  },
  "Flareon 4": {
    "species": "Flareon",
    "nature": "Quiet",
    "item": "Quick Claw",
    "moves": [
      "Overheat",
      "Sunny Day",
      "Double-Edge",
      "Shadow Ball"
    ],
    "abilities": [
      "Flash Fire"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 140,
      "atk": 182,
      "def": 80,
      "spa": 161,
      "spd": 130,
      "spe": 76
    },
    "lvl100Stats": {
      "hp": 271,
      "atk": 359,
      "def": 156,
      "spa": 317,
      "spd": 256,
      "spe": 149
    },
    "fixedIV": null
  },
  "Walrein 4": {
    "species": "Walrein",
    "nature": "Quiet",
    "item": "BrightPowder",
    "moves": [
      "Surf",
      "Ice Beam",
      "Earthquake",
      "Sheer Cold"
    ],
    "abilities": [
      "Thick Fat"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 185,
      "atk": 132,
      "def": 110,
      "spa": 161,
      "spd": 110,
      "spe": 76
    },
    "lvl100Stats": {
      "hp": 361,
      "atk": 259,
      "def": 216,
      "spa": 317,
      "spd": 216,
      "spe": 149
    },
    "fixedIV": null
  },
  "Ursaring 1": {
    "species": "Ursaring",
    "nature": "Docile",
    "item": "Quick Claw",
    "moves": [
      "Mega Kick",
      "Crunch",
      "Aerial Ace",
      "Counter"
    ],
    "abilities": [
      "Guts"
    ],
    "evs": {
      "hp": 170,
      "atk": 170,
      "def": 0,
      "spa": 170,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 186,
      "atk": 171,
      "def": 95,
      "spa": 116,
      "spd": 95,
      "spe": 75
    },
    "lvl100Stats": {
      "hp": 363,
      "atk": 338,
      "def": 186,
      "spa": 228,
      "spd": 186,
      "spe": 146
    },
    "fixedIV": null
  },
  "Machamp 1": {
    "species": "Machamp",
    "nature": "Adamant",
    "item": "Scope Lens",
    "moves": [
      "Cross Chop",
      "Rock Slide",
      "Counter",
      "Scary Face"
    ],
    "abilities": [
      "Guts"
    ],
    "evs": {
      "hp": 255,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 197,
      "atk": 200,
      "def": 100,
      "spa": 76,
      "spd": 105,
      "spe": 75
    },
    "lvl100Stats": {
      "hp": 384,
      "atk": 394,
      "def": 196,
      "spa": 149,
      "spd": 206,
      "spe": 146
    },
    "fixedIV": null
  },
  "Blissey 1": {
    "species": "Blissey",
    "nature": "Bold",
    "item": "BrightPowder",
    "moves": [
      "Toxic",
      "Double Team",
      "Sing",
      "Softboiled"
    ],
    "abilities": [
      "Natural Cure",
      "Serene Grace"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 255,
      "spa": 0,
      "spd": 255,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 330,
      "atk": 27,
      "def": 68,
      "spa": 95,
      "spd": 187,
      "spe": 75
    },
    "lvl100Stats": {
      "hp": 651,
      "atk": 50,
      "def": 130,
      "spa": 186,
      "spd": 369,
      "spe": 146
    },
    "fixedIV": null
  },
  "Ampharos 2": {
    "species": "Ampharos",
    "nature": "Hardy",
    "item": "BrightPowder",
    "moves": [
      "ThunderPunch",
      "Fire Punch",
      "Focus Punch",
      "Thunder Wave"
    ],
    "abilities": [
      "Static"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 165,
      "atk": 127,
      "def": 95,
      "spa": 167,
      "spd": 110,
      "spe": 75
    },
    "lvl100Stats": {
      "hp": 321,
      "atk": 249,
      "def": 186,
      "spa": 329,
      "spd": 216,
      "spe": 146
    },
    "fixedIV": null
  },
  "Ursaring 2": {
    "species": "Ursaring",
    "nature": "Adamant",
    "item": "Quick Claw",
    "moves": [
      "Double-Edge",
      "Earthquake",
      "Brick Break",
      "Counter"
    ],
    "abilities": [
      "Guts"
    ],
    "evs": {
      "hp": 255,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 197,
      "atk": 200,
      "def": 95,
      "spa": 85,
      "spd": 95,
      "spe": 75
    },
    "lvl100Stats": {
      "hp": 384,
      "atk": 394,
      "def": 186,
      "spa": 167,
      "spd": 186,
      "spe": 146
    },
    "fixedIV": null
  },
  "Machamp 2": {
    "species": "Machamp",
    "nature": "Adamant",
    "item": "Chesto Berry",
    "moves": [
      "Cross Chop",
      "Earthquake",
      "Bulk Up",
      "Rest"
    ],
    "abilities": [
      "Guts"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 186,
      "atk": 165,
      "def": 121,
      "spa": 76,
      "spd": 126,
      "spe": 75
    },
    "lvl100Stats": {
      "hp": 363,
      "atk": 325,
      "def": 238,
      "spa": 149,
      "spd": 248,
      "spe": 146
    },
    "fixedIV": null
  },
  "Exeggutor 2": {
    "species": "Exeggutor",
    "nature": "Hardy",
    "item": "Chesto Berry",
    "moves": [
      "Return",
      "Curse",
      "Sleep Powder",
      "Rest"
    ],
    "abilities": [
      "Chlorophyll"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 255,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 170,
      "atk": 147,
      "def": 105,
      "spa": 145,
      "spd": 117,
      "spe": 75
    },
    "lvl100Stats": {
      "hp": 331,
      "atk": 289,
      "def": 206,
      "spa": 286,
      "spd": 229,
      "spe": 146
    },
    "fixedIV": null
  },
  "Blissey 2": {
    "species": "Blissey",
    "nature": "Bold",
    "item": "Leftovers",
    "moves": [
      "Seismic Toss",
      "Sing",
      "Attract",
      "Substitute"
    ],
    "abilities": [
      "Natural Cure",
      "Serene Grace"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 255,
      "spa": 0,
      "spd": 255,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 330,
      "atk": 27,
      "def": 68,
      "spa": 95,
      "spd": 187,
      "spe": 75
    },
    "lvl100Stats": {
      "hp": 651,
      "atk": 50,
      "def": 130,
      "spa": 186,
      "spd": 369,
      "spe": 146
    },
    "fixedIV": null
  },
  "Ampharos 3": {
    "species": "Ampharos",
    "nature": "Hardy",
    "item": "Focus Band",
    "moves": [
      "Thunderbolt",
      "Mega Kick",
      "Iron Tail",
      "Brick Break"
    ],
    "abilities": [
      "Static"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 165,
      "atk": 127,
      "def": 95,
      "spa": 167,
      "spd": 110,
      "spe": 75
    },
    "lvl100Stats": {
      "hp": 321,
      "atk": 249,
      "def": 186,
      "spa": 329,
      "spd": 216,
      "spe": 146
    },
    "fixedIV": null
  },
  "Machamp 3": {
    "species": "Machamp",
    "nature": "Hardy",
    "item": "Quick Claw",
    "moves": [
      "Cross Chop",
      "Fire Blast",
      "ThunderPunch",
      "Ice Punch"
    ],
    "abilities": [
      "Guts"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 165,
      "atk": 182,
      "def": 100,
      "spa": 117,
      "spd": 105,
      "spe": 75
    },
    "lvl100Stats": {
      "hp": 321,
      "atk": 359,
      "def": 196,
      "spa": 229,
      "spd": 206,
      "spe": 146
    },
    "fixedIV": null
  },
  "Exeggutor 3": {
    "species": "Exeggutor",
    "nature": "Hardy",
    "item": "Leftovers",
    "moves": [
      "Leech Seed",
      "Giga Drain",
      "Toxic",
      "Explosion"
    ],
    "abilities": [
      "Chlorophyll"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 191,
      "atk": 115,
      "def": 126,
      "spa": 145,
      "spd": 106,
      "spe": 75
    },
    "lvl100Stats": {
      "hp": 373,
      "atk": 226,
      "def": 248,
      "spa": 286,
      "spd": 208,
      "spe": 146
    },
    "fixedIV": null
  },
  "Blissey 3": {
    "species": "Blissey",
    "nature": "Bold",
    "item": "Focus Band",
    "moves": [
      "Fire Blast",
      "Blizzard",
      "Calm Mind",
      "Softboiled"
    ],
    "abilities": [
      "Natural Cure",
      "Serene Grace"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 255,
      "spa": 0,
      "spd": 255,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 330,
      "atk": 27,
      "def": 68,
      "spa": 95,
      "spd": 187,
      "spe": 75
    },
    "lvl100Stats": {
      "hp": 651,
      "atk": 50,
      "def": 130,
      "spa": 186,
      "spd": 369,
      "spe": 146
    },
    "fixedIV": null
  },
  "Ampharos 4": {
    "species": "Ampharos",
    "nature": "Modest",
    "item": "Lum Berry",
    "moves": [
      "Thunderbolt",
      "Fire Punch",
      "Thunder Wave",
      "Reflect"
    ],
    "abilities": [
      "Static"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 255,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 165,
      "atk": 85,
      "def": 127,
      "spa": 183,
      "spd": 110,
      "spe": 75
    },
    "lvl100Stats": {
      "hp": 321,
      "atk": 167,
      "def": 249,
      "spa": 361,
      "spd": 216,
      "spe": 146
    },
    "fixedIV": null
  },
  "Ursaring 4": {
    "species": "Ursaring",
    "nature": "Adamant",
    "item": "BrightPowder",
    "moves": [
      "Double-Edge",
      "Earthquake",
      "Rock Slide",
      "Aerial Ace"
    ],
    "abilities": [
      "Guts"
    ],
    "evs": {
      "hp": 255,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 197,
      "atk": 200,
      "def": 95,
      "spa": 85,
      "spd": 95,
      "spe": 75
    },
    "lvl100Stats": {
      "hp": 384,
      "atk": 394,
      "def": 186,
      "spa": 167,
      "spd": 186,
      "spe": 146
    },
    "fixedIV": null
  },
  "Machamp 4": {
    "species": "Machamp",
    "nature": "Hardy",
    "item": "Scope Lens",
    "moves": [
      "Cross Chop",
      "Earthquake",
      "Flamethrower",
      "Rock Slide"
    ],
    "abilities": [
      "Guts"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 165,
      "atk": 182,
      "def": 100,
      "spa": 117,
      "spd": 105,
      "spe": 75
    },
    "lvl100Stats": {
      "hp": 321,
      "atk": 359,
      "def": 196,
      "spa": 229,
      "spd": 206,
      "spe": 146
    },
    "fixedIV": null
  },
  "Exeggutor 4": {
    "species": "Exeggutor",
    "nature": "Hardy",
    "item": "BrightPowder",
    "moves": [
      "Psychic",
      "Giga Drain",
      "Sludge Bomb",
      "Explosion"
    ],
    "abilities": [
      "Chlorophyll"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 170,
      "atk": 147,
      "def": 105,
      "spa": 177,
      "spd": 85,
      "spe": 75
    },
    "lvl100Stats": {
      "hp": 331,
      "atk": 289,
      "def": 206,
      "spa": 349,
      "spd": 166,
      "spe": 146
    },
    "fixedIV": null
  },
  "Blissey 4": {
    "species": "Blissey",
    "nature": "Bold",
    "item": "Focus Band",
    "moves": [
      "Ice Beam",
      "Calm Mind",
      "Counter",
      "Softboiled"
    ],
    "abilities": [
      "Natural Cure",
      "Serene Grace"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 255,
      "spa": 0,
      "spd": 255,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 330,
      "atk": 27,
      "def": 68,
      "spa": 95,
      "spd": 187,
      "spe": 75
    },
    "lvl100Stats": {
      "hp": 651,
      "atk": 50,
      "def": 130,
      "spa": 186,
      "spd": 369,
      "spe": 146
    },
    "fixedIV": null
  },
  "Ursaring 5": {
    "species": "Ursaring",
    "nature": "Adamant",
    "item": "Choice Band",
    "moves": [
      "Mega Kick",
      "Aerial Ace",
      "Rock Slide",
      "Brick Break"
    ],
    "abilities": [
      "Guts"
    ],
    "evs": {
      "hp": 255,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 197,
      "atk": 200,
      "def": 95,
      "spa": 85,
      "spd": 95,
      "spe": 75
    },
    "lvl100Stats": {
      "hp": 384,
      "atk": 394,
      "def": 186,
      "spa": 167,
      "spd": 186,
      "spe": 146
    },
    "fixedIV": null
  },
  "Ursaring 6": {
    "species": "Ursaring",
    "nature": "Adamant",
    "item": "Focus Band",
    "moves": [
      "Hyper Beam",
      "Yawn",
      "Swords Dance",
      "Double Team"
    ],
    "abilities": [
      "Guts"
    ],
    "evs": {
      "hp": 255,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 197,
      "atk": 200,
      "def": 95,
      "spa": 85,
      "spd": 95,
      "spe": 75
    },
    "lvl100Stats": {
      "hp": 384,
      "atk": 394,
      "def": 186,
      "spa": 167,
      "spd": 186,
      "spe": 146
    },
    "fixedIV": null
  },
  "Ursaring 7": {
    "species": "Ursaring",
    "nature": "Docile",
    "item": "Quick Claw",
    "moves": [
      "Facade",
      "Earthquake",
      "Crunch",
      "Bulk Up"
    ],
    "abilities": [
      "Guts"
    ],
    "evs": {
      "hp": 170,
      "atk": 170,
      "def": 0,
      "spa": 170,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 186,
      "atk": 171,
      "def": 95,
      "spa": 116,
      "spd": 95,
      "spe": 75
    },
    "lvl100Stats": {
      "hp": 363,
      "atk": 338,
      "def": 186,
      "spa": 228,
      "spd": 186,
      "spe": 146
    },
    "fixedIV": null
  },
  "Ursaring 8": {
    "species": "Ursaring",
    "nature": "Docile",
    "item": "Quick Claw",
    "moves": [
      "Facade",
      "Earthquake",
      "Crunch",
      "Brick Break"
    ],
    "abilities": [
      "Guts"
    ],
    "evs": {
      "hp": 170,
      "atk": 170,
      "def": 0,
      "spa": 170,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 186,
      "atk": 171,
      "def": 95,
      "spa": 116,
      "spd": 95,
      "spe": 75
    },
    "lvl100Stats": {
      "hp": 363,
      "atk": 338,
      "def": 186,
      "spa": 228,
      "spd": 186,
      "spe": 146
    },
    "fixedIV": null
  },
  "Machamp 5": {
    "species": "Machamp",
    "nature": "Adamant",
    "item": "Scope Lens",
    "moves": [
      "Cross Chop",
      "Double-Edge",
      "Earthquake",
      "Rock Slide"
    ],
    "abilities": [
      "Guts"
    ],
    "evs": {
      "hp": 255,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 197,
      "atk": 200,
      "def": 100,
      "spa": 76,
      "spd": 105,
      "spe": 75
    },
    "lvl100Stats": {
      "hp": 384,
      "atk": 394,
      "def": 196,
      "spa": 149,
      "spd": 206,
      "spe": 146
    },
    "fixedIV": null
  },
  "Machamp 6": {
    "species": "Machamp",
    "nature": "Adamant",
    "item": "Focus Band",
    "moves": [
      "Cross Chop",
      "Earthquake",
      "Counter",
      "Rock Tomb"
    ],
    "abilities": [
      "Guts"
    ],
    "evs": {
      "hp": 255,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 197,
      "atk": 200,
      "def": 100,
      "spa": 76,
      "spd": 105,
      "spe": 75
    },
    "lvl100Stats": {
      "hp": 384,
      "atk": 394,
      "def": 196,
      "spa": 149,
      "spd": 206,
      "spe": 146
    },
    "fixedIV": null
  },
  "Machamp 7": {
    "species": "Machamp",
    "nature": "Adamant",
    "item": "BrightPowder",
    "moves": [
      "Focus Punch",
      "Substitute",
      "Attract",
      "Double Team"
    ],
    "abilities": [
      "Guts"
    ],
    "evs": {
      "hp": 255,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 197,
      "atk": 200,
      "def": 100,
      "spa": 76,
      "spd": 105,
      "spe": 75
    },
    "lvl100Stats": {
      "hp": 384,
      "atk": 394,
      "def": 196,
      "spa": 149,
      "spd": 206,
      "spe": 146
    },
    "fixedIV": null
  },
  "Machamp 8": {
    "species": "Machamp",
    "nature": "Adamant",
    "item": "Focus Band",
    "moves": [
      "Revenge",
      "Rock Slide",
      "Facade",
      "Counter"
    ],
    "abilities": [
      "Guts"
    ],
    "evs": {
      "hp": 255,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 197,
      "atk": 200,
      "def": 100,
      "spa": 76,
      "spd": 105,
      "spe": 75
    },
    "lvl100Stats": {
      "hp": 384,
      "atk": 394,
      "def": 196,
      "spa": 149,
      "spd": 206,
      "spe": 146
    },
    "fixedIV": null
  },
  "Clefable 1": {
    "species": "Clefable",
    "nature": "Brave",
    "item": "Leftovers",
    "moves": [
      "Metronome",
      "Double Team",
      "Reflect",
      "Follow Me"
    ],
    "abilities": [
      "Cute Charm"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 255,
      "spa": 0,
      "spd": 255,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 170,
      "atk": 99,
      "def": 125,
      "spa": 105,
      "spd": 142,
      "spe": 72
    },
    "lvl100Stats": {
      "hp": 331,
      "atk": 193,
      "def": 245,
      "spa": 206,
      "spd": 279,
      "spe": 140
    },
    "fixedIV": null
  },
  "Wailord 1": {
    "species": "Wailord",
    "nature": "Sassy",
    "item": "Shell Bell",
    "moves": [
      "Surf",
      "Icy Wind",
      "Body Slam",
      "Roar"
    ],
    "abilities": [
      "Water Veil",
      "Oblivious"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 266,
      "atk": 110,
      "def": 86,
      "spa": 110,
      "spd": 95,
      "spe": 72
    },
    "lvl100Stats": {
      "hp": 523,
      "atk": 216,
      "def": 168,
      "spa": 216,
      "spd": 184,
      "spe": 140
    },
    "fixedIV": null
  },
  "Swampert 3": {
    "species": "Swampert",
    "nature": "Brave",
    "item": "Shell Bell",
    "moves": [
      "Surf",
      "Earthquake",
      "Ice Beam",
      "Counter"
    ],
    "abilities": [
      "Torrent"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 175,
      "atk": 178,
      "def": 110,
      "spa": 137,
      "spd": 110,
      "spe": 72
    },
    "lvl100Stats": {
      "hp": 341,
      "atk": 350,
      "def": 216,
      "spa": 269,
      "spd": 216,
      "spe": 140
    },
    "fixedIV": null
  },
  "Whiscash 4": {
    "species": "Whiscash",
    "nature": "Quiet",
    "item": "Quick Claw",
    "moves": [
      "Fissure",
      "Surf",
      "Earthquake",
      "Ice Beam"
    ],
    "abilities": [
      "Oblivious"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 185,
      "atk": 130,
      "def": 93,
      "spa": 140,
      "spd": 91,
      "spe": 72
    },
    "lvl100Stats": {
      "hp": 361,
      "atk": 255,
      "def": 182,
      "spa": 276,
      "spd": 178,
      "spe": 140
    },
    "fixedIV": null
  },
  "Swampert 4": {
    "species": "Swampert",
    "nature": "Quiet",
    "item": "Shell Bell",
    "moves": [
      "Surf",
      "Earthquake",
      "Ice Beam",
      "Mirror Coat"
    ],
    "abilities": [
      "Torrent"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 175,
      "atk": 162,
      "def": 110,
      "spa": 150,
      "spd": 110,
      "spe": 72
    },
    "lvl100Stats": {
      "hp": 341,
      "atk": 319,
      "def": 216,
      "spa": 295,
      "spd": 216,
      "spe": 140
    },
    "fixedIV": null
  },
  "Tucker Gold Swampert": {
    "species": "Swampert",
    "nature": "Brave",
    "item": "Leftovers",
    "moves": [
      "Surf",
      "Earthquake",
      "Ice Beam",
      "Mirror Coat"
    ],
    "abilities": [
      "Torrent"
    ],
    "evs": {
      "hp": 252,
      "atk": 252,
      "def": 6,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 207,
      "atk": 178,
      "def": 111,
      "spa": 105,
      "spd": 110,
      "spe": 72
    },
    "lvl100Stats": {
      "hp": 404,
      "atk": 350,
      "def": 217,
      "spa": 206,
      "spd": 216,
      "spe": 140
    },
    "fixedIV": 31
  },
  "Hariyama 1": {
    "species": "Hariyama",
    "nature": "Adamant",
    "item": "Focus Band",
    "moves": [
      "Cross Chop",
      "Rock Slide",
      "Counter",
      "Fake Out"
    ],
    "abilities": [
      "Thick Fat",
      "Guts"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 240,
      "atk": 154,
      "def": 101,
      "spa": 54,
      "spd": 101,
      "spe": 70
    },
    "lvl100Stats": {
      "hp": 471,
      "atk": 303,
      "def": 198,
      "spa": 104,
      "spd": 198,
      "spe": 136
    },
    "fixedIV": null
  },
  "Vileplume 1": {
    "species": "Vileplume",
    "nature": "Impish",
    "item": "Persim Berry",
    "moves": [
      "Sludge Bomb",
      "Petal Dance",
      "Moonlight",
      "Aromatherapy"
    ],
    "abilities": [
      "Chlorophyll"
    ],
    "evs": {
      "hp": 255,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 182,
      "atk": 132,
      "def": 116,
      "spa": 108,
      "spd": 110,
      "spe": 70
    },
    "lvl100Stats": {
      "hp": 354,
      "atk": 259,
      "def": 226,
      "spa": 212,
      "spd": 216,
      "spe": 136
    },
    "fixedIV": null
  },
  "Muk 1": {
    "species": "Muk",
    "nature": "Adamant",
    "item": "Poison Barb",
    "moves": [
      "Sludge Bomb",
      "Body Slam",
      "Screech",
      "Minimize"
    ],
    "abilities": [
      "Stench",
      "Sticky Hold"
    ],
    "evs": {
      "hp": 255,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 212,
      "atk": 172,
      "def": 95,
      "spa": 76,
      "spd": 120,
      "spe": 70
    },
    "lvl100Stats": {
      "hp": 414,
      "atk": 339,
      "def": 186,
      "spa": 149,
      "spd": 236,
      "spe": 136
    },
    "fixedIV": null
  },
  "Donphan 1": {
    "species": "Donphan",
    "nature": "Adamant",
    "item": "Chesto Berry",
    "moves": [
      "Earthquake",
      "AncientPower",
      "Swagger",
      "Rest"
    ],
    "abilities": [
      "Sturdy"
    ],
    "evs": {
      "hp": 255,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 197,
      "atk": 189,
      "def": 140,
      "spa": 72,
      "spd": 80,
      "spe": 70
    },
    "lvl100Stats": {
      "hp": 384,
      "atk": 372,
      "def": 276,
      "spa": 140,
      "spd": 156,
      "spe": 136
    },
    "fixedIV": null
  },
  "Aggron 1": {
    "species": "Aggron",
    "nature": "Adamant",
    "item": "Quick Claw",
    "moves": [
      "Iron Tail",
      "Earthquake",
      "Aerial Ace",
      "Roar"
    ],
    "abilities": [
      "Sturdy",
      "Rock Head"
    ],
    "evs": {
      "hp": 255,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 177,
      "atk": 178,
      "def": 200,
      "spa": 72,
      "spd": 80,
      "spe": 70
    },
    "lvl100Stats": {
      "hp": 344,
      "atk": 350,
      "def": 396,
      "spa": 140,
      "spd": 156,
      "spe": 136
    },
    "fixedIV": null
  },
  "Vileplume 2": {
    "species": "Vileplume",
    "nature": "Bold",
    "item": "BrightPowder",
    "moves": [
      "Ingrain",
      "Double Team",
      "Toxic",
      "Giga Drain"
    ],
    "abilities": [
      "Chlorophyll"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 171,
      "atk": 90,
      "def": 139,
      "spa": 120,
      "spd": 131,
      "spe": 70
    },
    "lvl100Stats": {
      "hp": 333,
      "atk": 176,
      "def": 272,
      "spa": 236,
      "spd": 258,
      "spe": 136
    },
    "fixedIV": null
  },
  "Muk 2": {
    "species": "Muk",
    "nature": "Hardy",
    "item": "Chesto Berry",
    "moves": [
      "Curse",
      "Rest",
      "Sludge Bomb",
      "DynamicPunch"
    ],
    "abilities": [
      "Stench",
      "Sticky Hold"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 255,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 180,
      "atk": 157,
      "def": 127,
      "spa": 85,
      "spd": 120,
      "spe": 70
    },
    "lvl100Stats": {
      "hp": 351,
      "atk": 309,
      "def": 249,
      "spa": 166,
      "spd": 236,
      "spe": 136
    },
    "fixedIV": null
  },
  "Aggron 2": {
    "species": "Aggron",
    "nature": "Adamant",
    "item": "Scope Lens",
    "moves": [
      "Focus Punch",
      "Earthquake",
      "Rock Slide",
      "Thunder Wave"
    ],
    "abilities": [
      "Sturdy",
      "Rock Head"
    ],
    "evs": {
      "hp": 255,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 177,
      "atk": 178,
      "def": 200,
      "spa": 72,
      "spd": 80,
      "spe": 70
    },
    "lvl100Stats": {
      "hp": 344,
      "atk": 350,
      "def": 396,
      "spa": 140,
      "spd": 156,
      "spe": 136
    },
    "fixedIV": null
  },
  "Hariyama 3": {
    "species": "Hariyama",
    "nature": "Adamant",
    "item": "Quick Claw",
    "moves": [
      "Cross Chop",
      "Earthquake",
      "Rock Slide",
      "Facade"
    ],
    "abilities": [
      "Thick Fat",
      "Guts"
    ],
    "evs": {
      "hp": 255,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 251,
      "atk": 189,
      "def": 80,
      "spa": 54,
      "spd": 80,
      "spe": 70
    },
    "lvl100Stats": {
      "hp": 492,
      "atk": 372,
      "def": 156,
      "spa": 104,
      "spd": 156,
      "spe": 136
    },
    "fixedIV": null
  },
  "Vileplume 3": {
    "species": "Vileplume",
    "nature": "Quirky",
    "item": "Leftovers",
    "moves": [
      "Attract",
      "Stun Spore",
      "Sludge Bomb",
      "Giga Drain"
    ],
    "abilities": [
      "Chlorophyll"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 150,
      "atk": 132,
      "def": 105,
      "spa": 152,
      "spd": 110,
      "spe": 70
    },
    "lvl100Stats": {
      "hp": 291,
      "atk": 259,
      "def": 206,
      "spa": 299,
      "spd": 216,
      "spe": 136
    },
    "fixedIV": null
  },
  "Donphan 3": {
    "species": "Donphan",
    "nature": "Adamant",
    "item": "Quick Claw",
    "moves": [
      "Fissure",
      "Earthquake",
      "Rock Slide",
      "Secret Power"
    ],
    "abilities": [
      "Sturdy"
    ],
    "evs": {
      "hp": 255,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 197,
      "atk": 189,
      "def": 140,
      "spa": 72,
      "spd": 80,
      "spe": 70
    },
    "lvl100Stats": {
      "hp": 384,
      "atk": 372,
      "def": 276,
      "spa": 140,
      "spd": 156,
      "spe": 136
    },
    "fixedIV": null
  },
  "Aggron 3": {
    "species": "Aggron",
    "nature": "Modest",
    "item": "BrightPowder",
    "moves": [
      "Surf",
      "Thunder",
      "Fire Blast",
      "Blizzard"
    ],
    "abilities": [
      "Sturdy",
      "Rock Head"
    ],
    "evs": {
      "hp": 255,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 177,
      "atk": 117,
      "def": 200,
      "spa": 123,
      "spd": 80,
      "spe": 70
    },
    "lvl100Stats": {
      "hp": 344,
      "atk": 230,
      "def": 396,
      "spa": 240,
      "spd": 156,
      "spe": 136
    },
    "fixedIV": null
  },
  "Hariyama 4": {
    "species": "Hariyama",
    "nature": "Adamant",
    "item": "Scope Lens",
    "moves": [
      "Cross Chop",
      "Earthquake",
      "Rock Slide",
      "Fake Out"
    ],
    "abilities": [
      "Thick Fat",
      "Guts"
    ],
    "evs": {
      "hp": 255,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 251,
      "atk": 189,
      "def": 80,
      "spa": 54,
      "spd": 80,
      "spe": 70
    },
    "lvl100Stats": {
      "hp": 492,
      "atk": 372,
      "def": 156,
      "spa": 104,
      "spd": 156,
      "spe": 136
    },
    "fixedIV": null
  },
  "Donphan 4": {
    "species": "Donphan",
    "nature": "Adamant",
    "item": "Quick Claw",
    "moves": [
      "Fissure",
      "Earthquake",
      "Rock Slide",
      "Iron Tail"
    ],
    "abilities": [
      "Sturdy"
    ],
    "evs": {
      "hp": 255,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 197,
      "atk": 189,
      "def": 140,
      "spa": 72,
      "spd": 80,
      "spe": 70
    },
    "lvl100Stats": {
      "hp": 384,
      "atk": 372,
      "def": 276,
      "spa": 140,
      "spd": 156,
      "spe": 136
    },
    "fixedIV": null
  },
  "Aggron 4": {
    "species": "Aggron",
    "nature": "Adamant",
    "item": "Quick Claw",
    "moves": [
      "Double-Edge",
      "Earthquake",
      "Rock Slide",
      "Aerial Ace"
    ],
    "abilities": [
      "Sturdy",
      "Rock Head"
    ],
    "evs": {
      "hp": 255,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 177,
      "atk": 178,
      "def": 200,
      "spa": 72,
      "spd": 80,
      "spe": 70
    },
    "lvl100Stats": {
      "hp": 344,
      "atk": 350,
      "def": 396,
      "spa": 140,
      "spd": 156,
      "spe": 136
    },
    "fixedIV": null
  },
  "Regirock 1": {
    "species": "Regirock",
    "nature": "Adamant",
    "item": "White Herb",
    "moves": [
      "Superpower",
      "Earthquake",
      "Rock Slide",
      "Explosion"
    ],
    "abilities": [
      "Clear Body"
    ],
    "evs": {
      "hp": 255,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 187,
      "atk": 167,
      "def": 220,
      "spa": 63,
      "spd": 120,
      "spe": 70
    },
    "lvl100Stats": {
      "hp": 364,
      "atk": 328,
      "def": 436,
      "spa": 122,
      "spd": 236,
      "spe": 136
    },
    "fixedIV": null
  },
  "Regice 1": {
    "species": "Regice",
    "nature": "Modest",
    "item": "Chesto Berry",
    "moves": [
      "Ice Beam",
      "Thunderbolt",
      "Amnesia",
      "Rest"
    ],
    "abilities": [
      "Clear Body"
    ],
    "evs": {
      "hp": 255,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 187,
      "atk": 63,
      "def": 120,
      "spa": 167,
      "spd": 220,
      "spe": 70
    },
    "lvl100Stats": {
      "hp": 364,
      "atk": 122,
      "def": 236,
      "spa": 328,
      "spd": 436,
      "spe": 136
    },
    "fixedIV": null
  },
  "Registeel 1": {
    "species": "Registeel",
    "nature": "Adamant",
    "item": "Chesto Berry",
    "moves": [
      "Metal Claw",
      "Curse",
      "Amnesia",
      "Rest"
    ],
    "abilities": [
      "Clear Body"
    ],
    "evs": {
      "hp": 255,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 187,
      "atk": 139,
      "def": 170,
      "spa": 85,
      "spd": 170,
      "spe": 70
    },
    "lvl100Stats": {
      "hp": 364,
      "atk": 273,
      "def": 336,
      "spa": 167,
      "spd": 336,
      "spe": 136
    },
    "fixedIV": null
  },
  "Regirock 2": {
    "species": "Regirock",
    "nature": "Adamant",
    "item": "Quick Claw",
    "moves": [
      "Earthquake",
      "Rock Slide",
      "Counter",
      "Explosion"
    ],
    "abilities": [
      "Clear Body"
    ],
    "evs": {
      "hp": 255,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 187,
      "atk": 167,
      "def": 220,
      "spa": 63,
      "spd": 120,
      "spe": 70
    },
    "lvl100Stats": {
      "hp": 364,
      "atk": 328,
      "def": 436,
      "spa": 122,
      "spd": 236,
      "spe": 136
    },
    "fixedIV": null
  },
  "Regirock 3": {
    "species": "Regirock",
    "nature": "Adamant",
    "item": "Chesto Berry",
    "moves": [
      "Rock Slide",
      "Earthquake",
      "Curse",
      "Rest"
    ],
    "abilities": [
      "Clear Body"
    ],
    "evs": {
      "hp": 255,
      "atk": 0,
      "def": 0,
      "spa": 0,
      "spd": 255,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 187,
      "atk": 132,
      "def": 220,
      "spa": 63,
      "spd": 152,
      "spe": 70
    },
    "lvl100Stats": {
      "hp": 364,
      "atk": 259,
      "def": 436,
      "spa": 122,
      "spd": 299,
      "spe": 136
    },
    "fixedIV": null
  },
  "Registeel 3": {
    "species": "Registeel",
    "nature": "Adamant",
    "item": "Quick Claw",
    "moves": [
      "AncientPower",
      "Amnesia",
      "Counter",
      "Explosion"
    ],
    "abilities": [
      "Clear Body"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 176,
      "atk": 105,
      "def": 191,
      "spa": 85,
      "spd": 191,
      "spe": 70
    },
    "lvl100Stats": {
      "hp": 343,
      "atk": 204,
      "def": 378,
      "spa": 167,
      "spd": 378,
      "spe": 136
    },
    "fixedIV": null
  },
  "Regirock 4": {
    "species": "Regirock",
    "nature": "Careful",
    "item": "Leftovers",
    "moves": [
      "Rock Slide",
      "Brick Break",
      "Double Team",
      "Thunder Wave"
    ],
    "abilities": [
      "Clear Body"
    ],
    "evs": {
      "hp": 170,
      "atk": 170,
      "def": 0,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 176,
      "atk": 141,
      "def": 220,
      "spa": 63,
      "spd": 155,
      "spe": 70
    },
    "lvl100Stats": {
      "hp": 343,
      "atk": 278,
      "def": 436,
      "spa": 122,
      "spd": 305,
      "spe": 136
    },
    "fixedIV": null
  },
  "Regice 4": {
    "species": "Regice",
    "nature": "Bold",
    "item": "Leftovers",
    "moves": [
      "Ice Beam",
      "Hail",
      "Double Team",
      "Thunder Wave"
    ],
    "abilities": [
      "Clear Body"
    ],
    "evs": {
      "hp": 255,
      "atk": 0,
      "def": 255,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 187,
      "atk": 63,
      "def": 167,
      "spa": 120,
      "spd": 220,
      "spe": 70
    },
    "lvl100Stats": {
      "hp": 364,
      "atk": 122,
      "def": 328,
      "spa": 236,
      "spd": 436,
      "spe": 136
    },
    "fixedIV": null
  },
  "Registeel 4": {
    "species": "Registeel",
    "nature": "Impish",
    "item": "Leftovers",
    "moves": [
      "AncientPower",
      "Earthquake",
      "Double Team",
      "Thunder Wave"
    ],
    "abilities": [
      "Clear Body"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 176,
      "atk": 95,
      "def": 210,
      "spa": 85,
      "spd": 191,
      "spe": 70
    },
    "lvl100Stats": {
      "hp": 343,
      "atk": 186,
      "def": 415,
      "spa": 167,
      "spd": 378,
      "spe": 136
    },
    "fixedIV": null
  },
  "Regirock 5": {
    "species": "Regirock",
    "nature": "Adamant",
    "item": "Quick Claw",
    "moves": [
      "Hyper Beam",
      "Focus Punch",
      "Rock Slide",
      "Double Team"
    ],
    "abilities": [
      "Clear Body"
    ],
    "evs": {
      "hp": 255,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 187,
      "atk": 167,
      "def": 220,
      "spa": 63,
      "spd": 120,
      "spe": 70
    },
    "lvl100Stats": {
      "hp": 364,
      "atk": 328,
      "def": 436,
      "spa": 122,
      "spd": 236,
      "spe": 136
    },
    "fixedIV": null
  },
  "Regirock 6": {
    "species": "Regirock",
    "nature": "Adamant",
    "item": "BrightPowder",
    "moves": [
      "Swagger",
      "Psych Up",
      "Rock Slide",
      "Explosion"
    ],
    "abilities": [
      "Clear Body"
    ],
    "evs": {
      "hp": 255,
      "atk": 0,
      "def": 0,
      "spa": 0,
      "spd": 255,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 187,
      "atk": 132,
      "def": 220,
      "spa": 63,
      "spd": 152,
      "spe": 70
    },
    "lvl100Stats": {
      "hp": 364,
      "atk": 259,
      "def": 436,
      "spa": 122,
      "spd": 299,
      "spe": 136
    },
    "fixedIV": null
  },
  "Regice 6": {
    "species": "Regice",
    "nature": "Modest",
    "item": "Chesto Berry",
    "moves": [
      "Ice Beam",
      "Thunderbolt",
      "Sleep Talk",
      "Rest"
    ],
    "abilities": [
      "Clear Body"
    ],
    "evs": {
      "hp": 255,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 187,
      "atk": 63,
      "def": 120,
      "spa": 167,
      "spd": 220,
      "spe": 70
    },
    "lvl100Stats": {
      "hp": 364,
      "atk": 122,
      "def": 236,
      "spa": 328,
      "spd": 436,
      "spe": 136
    },
    "fixedIV": null
  },
  "Registeel 5": {
    "species": "Registeel",
    "nature": "Adamant",
    "item": "Leftovers",
    "moves": [
      "Focus Punch",
      "Substitute",
      "Toxic",
      "Double Team"
    ],
    "abilities": [
      "Clear Body"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 176,
      "atk": 105,
      "def": 191,
      "spa": 85,
      "spd": 191,
      "spe": 70
    },
    "lvl100Stats": {
      "hp": 343,
      "atk": 204,
      "def": 378,
      "spa": 167,
      "spd": 378,
      "spe": 136
    },
    "fixedIV": null
  },
  "Registeel 6": {
    "species": "Registeel",
    "nature": "Adamant",
    "item": "White Herb",
    "moves": [
      "Superpower",
      "Aerial Ace",
      "Swagger",
      "Psych Up"
    ],
    "abilities": [
      "Clear Body"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 176,
      "atk": 105,
      "def": 191,
      "spa": 85,
      "spd": 191,
      "spe": 70
    },
    "lvl100Stats": {
      "hp": 343,
      "atk": 204,
      "def": 378,
      "spa": 167,
      "spd": 378,
      "spe": 136
    },
    "fixedIV": null
  },
  "Lucy Silver Seviper": {
    "species": "Seviper",
    "nature": "Brave",
    "item": "Quick Claw",
    "moves": [
      "Swagger",
      "Crunch",
      "Poison Fang",
      "Giga Drain"
    ],
    "abilities": [
      "Shed Skin"
    ],
    "evs": {
      "hp": 252,
      "atk": 0,
      "def": 252,
      "spa": 6,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 172,
      "atk": 124,
      "def": 104,
      "spa": 113,
      "spd": 73,
      "spe": 70
    },
    "lvl100Stats": {
      "hp": 335,
      "atk": 243,
      "def": 204,
      "spa": 222,
      "spd": 141,
      "spe": 135
    },
    "fixedIV": 16
  },
  "Noland Gold\u2020 Aggron": {
    "species": "Aggron",
    "nature": "Adamant",
    "item": "Sitrus Berry",
    "moves": [
      "Thunderbolt",
      "Protect",
      "SolarBeam",
      "Dragon Claw"
    ],
    "abilities": [
      "Sturdy",
      "Rock Head"
    ],
    "evs": {
      "hp": 0,
      "atk": 252,
      "def": 0,
      "spa": 252,
      "spd": 6,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 145,
      "atk": 178,
      "def": 200,
      "spa": 100,
      "spd": 81,
      "spe": 70
    },
    "lvl100Stats": {
      "hp": 281,
      "atk": 350,
      "def": 396,
      "spa": 197,
      "spd": 157,
      "spe": 136
    },
    "fixedIV": 31
  },
  "Noland Silver\u2020 Aggron": {
    "species": "Aggron",
    "nature": "Adamant",
    "item": "Sitrus Berry",
    "moves": [
      "Thunderbolt",
      "Protect",
      "SolarBeam",
      "Dragon Claw"
    ],
    "abilities": [
      "Sturdy",
      "Rock Head"
    ],
    "evs": {
      "hp": 0,
      "atk": 252,
      "def": 0,
      "spa": 252,
      "spd": 6,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 145,
      "atk": 178,
      "def": 200,
      "spa": 100,
      "spd": 81,
      "spe": 70
    },
    "lvl100Stats": {
      "hp": 281,
      "atk": 350,
      "def": 396,
      "spa": 197,
      "spd": 157,
      "spe": 136
    },
    "fixedIV": 31
  },
  "Ampharos 1": {
    "species": "Ampharos",
    "nature": "Relaxed",
    "item": "Magnet",
    "moves": [
      "Thunder",
      "Rain Dance",
      "Thunder Wave",
      "Attract"
    ],
    "abilities": [
      "Static"
    ],
    "evs": {
      "hp": 255,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 197,
      "atk": 95,
      "def": 105,
      "spa": 167,
      "spd": 110,
      "spe": 67
    },
    "lvl100Stats": {
      "hp": 384,
      "atk": 186,
      "def": 204,
      "spa": 329,
      "spd": 216,
      "spe": 131
    },
    "fixedIV": null
  },
  "Exeggutor 1": {
    "species": "Exeggutor",
    "nature": "Quiet",
    "item": "Quick Claw",
    "moves": [
      "SolarBeam",
      "Sunny Day",
      "Synthesis",
      "Light Screen"
    ],
    "abilities": [
      "Chlorophyll"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 255,
      "spa": 0,
      "spd": 255,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 170,
      "atk": 115,
      "def": 137,
      "spa": 160,
      "spd": 117,
      "spe": 67
    },
    "lvl100Stats": {
      "hp": 331,
      "atk": 226,
      "def": 269,
      "spa": 314,
      "spd": 229,
      "spe": 131
    },
    "fixedIV": null
  },
  "Tucker Silver Swampert": {
    "species": "Swampert",
    "nature": "Brave",
    "item": "Focus Band",
    "moves": [
      "Surf",
      "Earthquake",
      "Ice Beam",
      "Counter"
    ],
    "abilities": [
      "Intimidate"
    ],
    "evs": {
      "hp": 152,
      "atk": 152,
      "def": 106,
      "spa": 100,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 189,
      "atk": 158,
      "def": 118,
      "spa": 112,
      "spd": 105,
      "spe": 67
    },
    "lvl100Stats": {
      "hp": 368,
      "atk": 311,
      "def": 231,
      "spa": 220,
      "spd": 205,
      "spe": 130
    },
    "fixedIV": 20
  },
  "Granbull 1": {
    "species": "Granbull",
    "nature": "Adamant",
    "item": "Cheri Berry",
    "moves": [
      "Mega Kick",
      "SmellingSalt",
      "Thunder Wave",
      "Roar"
    ],
    "abilities": [
      "Intimidate"
    ],
    "evs": {
      "hp": 255,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 197,
      "atk": 189,
      "def": 95,
      "spa": 72,
      "spd": 80,
      "spe": 65
    },
    "lvl100Stats": {
      "hp": 384,
      "atk": 372,
      "def": 186,
      "spa": 140,
      "spd": 156,
      "spe": 126
    },
    "fixedIV": null
  },
  "Marowak 1": {
    "species": "Marowak",
    "nature": "Adamant",
    "item": "Thick Club",
    "moves": [
      "Bonemerang",
      "Rock Slide",
      "Icy Wind",
      "Headbutt"
    ],
    "abilities": [
      "Rock Head",
      "Lightningrod"
    ],
    "evs": {
      "hp": 255,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 167,
      "atk": 145,
      "def": 130,
      "spa": 63,
      "spd": 100,
      "spe": 65
    },
    "lvl100Stats": {
      "hp": 324,
      "atk": 284,
      "def": 256,
      "spa": 122,
      "spd": 196,
      "spe": 126
    },
    "fixedIV": null
  },
  "Golem 1": {
    "species": "Golem",
    "nature": "Adamant",
    "item": "Quick Claw",
    "moves": [
      "Earthquake",
      "Body Slam",
      "Counter",
      "Rock Tomb"
    ],
    "abilities": [
      "Rock Head",
      "Sturdy"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 255,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 155,
      "atk": 178,
      "def": 150,
      "spa": 67,
      "spd": 117,
      "spe": 65
    },
    "lvl100Stats": {
      "hp": 301,
      "atk": 350,
      "def": 296,
      "spa": 131,
      "spd": 229,
      "spe": 126
    },
    "fixedIV": null
  },
  "Armaldo 1": {
    "species": "Armaldo",
    "nature": "Adamant",
    "item": "Scope Lens",
    "moves": [
      "Slash",
      "Aerial Ace",
      "AncientPower",
      "Protect"
    ],
    "abilities": [
      "Battle Armor"
    ],
    "evs": {
      "hp": 255,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 182,
      "atk": 194,
      "def": 120,
      "spa": 81,
      "spd": 100,
      "spe": 65
    },
    "lvl100Stats": {
      "hp": 354,
      "atk": 383,
      "def": 236,
      "spa": 158,
      "spd": 196,
      "spe": 126
    },
    "fixedIV": null
  },
  "Golem 2": {
    "species": "Golem",
    "nature": "Adamant",
    "item": "Chesto Berry",
    "moves": [
      "Focus Punch",
      "Substitute",
      "Double Team",
      "Rest"
    ],
    "abilities": [
      "Rock Head",
      "Sturdy"
    ],
    "evs": {
      "hp": 255,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 187,
      "atk": 178,
      "def": 150,
      "spa": 67,
      "spd": 85,
      "spe": 65
    },
    "lvl100Stats": {
      "hp": 364,
      "atk": 350,
      "def": 296,
      "spa": 131,
      "spd": 166,
      "spe": 126
    },
    "fixedIV": null
  },
  "Armaldo 2": {
    "species": "Armaldo",
    "nature": "Adamant",
    "item": "Quick Claw",
    "moves": [
      "Iron Tail",
      "AncientPower",
      "Brick Break",
      "Knock Off"
    ],
    "abilities": [
      "Battle Armor"
    ],
    "evs": {
      "hp": 255,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 182,
      "atk": 194,
      "def": 120,
      "spa": 81,
      "spd": 100,
      "spe": 65
    },
    "lvl100Stats": {
      "hp": 354,
      "atk": 383,
      "def": 236,
      "spa": 158,
      "spd": 196,
      "spe": 126
    },
    "fixedIV": null
  },
  "Granbull 3": {
    "species": "Granbull",
    "nature": "Adamant",
    "item": "Quick Claw",
    "moves": [
      "Double-Edge",
      "Earthquake",
      "Sludge Bomb",
      "Rock Slide"
    ],
    "abilities": [
      "Intimidate"
    ],
    "evs": {
      "hp": 255,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 197,
      "atk": 189,
      "def": 95,
      "spa": 72,
      "spd": 80,
      "spe": 65
    },
    "lvl100Stats": {
      "hp": 384,
      "atk": 372,
      "def": 186,
      "spa": 140,
      "spd": 156,
      "spe": 126
    },
    "fixedIV": null
  },
  "Golem 3": {
    "species": "Golem",
    "nature": "Adamant",
    "item": "Quick Claw",
    "moves": [
      "Explosion",
      "Earthquake",
      "Flamethrower",
      "Brick Break"
    ],
    "abilities": [
      "Rock Head",
      "Sturdy"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 255,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 155,
      "atk": 178,
      "def": 150,
      "spa": 67,
      "spd": 117,
      "spe": 65
    },
    "lvl100Stats": {
      "hp": 301,
      "atk": 350,
      "def": 296,
      "spa": 131,
      "spd": 229,
      "spe": 126
    },
    "fixedIV": null
  },
  "Armaldo 3": {
    "species": "Armaldo",
    "nature": "Adamant",
    "item": "Quick Claw",
    "moves": [
      "Earthquake",
      "Rock Slide",
      "Brick Break",
      "Swords Dance"
    ],
    "abilities": [
      "Battle Armor"
    ],
    "evs": {
      "hp": 255,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 182,
      "atk": 194,
      "def": 120,
      "spa": 81,
      "spd": 100,
      "spe": 65
    },
    "lvl100Stats": {
      "hp": 354,
      "atk": 383,
      "def": 236,
      "spa": 158,
      "spd": 196,
      "spe": 126
    },
    "fixedIV": null
  },
  "Golem 4": {
    "species": "Golem",
    "nature": "Adamant",
    "item": "Quick Claw",
    "moves": [
      "Explosion",
      "Earthquake",
      "Rock Slide",
      "Double-Edge"
    ],
    "abilities": [
      "Rock Head",
      "Sturdy"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 255,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 155,
      "atk": 178,
      "def": 150,
      "spa": 67,
      "spd": 117,
      "spe": 65
    },
    "lvl100Stats": {
      "hp": 301,
      "atk": 350,
      "def": 296,
      "spa": 131,
      "spd": 229,
      "spe": 126
    },
    "fixedIV": null
  },
  "Armaldo 4": {
    "species": "Armaldo",
    "nature": "Adamant",
    "item": "Choice Band",
    "moves": [
      "Double-Edge",
      "Earthquake",
      "Aerial Ace",
      "Rock Slide"
    ],
    "abilities": [
      "Battle Armor"
    ],
    "evs": {
      "hp": 255,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 182,
      "atk": 194,
      "def": 120,
      "spa": 81,
      "spd": 100,
      "spe": 65
    },
    "lvl100Stats": {
      "hp": 354,
      "atk": 383,
      "def": 236,
      "spa": 158,
      "spd": 196,
      "spe": 126
    },
    "fixedIV": null
  },
  "Spenser Silver Lapras": {
    "species": "Lapras",
    "nature": "Quiet",
    "item": "Quick Claw",
    "moves": [
      "Ice Beam",
      "Horn Drill",
      "Confuse Ray",
      "Protect"
    ],
    "abilities": [
      "Water Absorb",
      "Shell Armor"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 252,
      "spa": 106,
      "spd": 152,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 198,
      "atk": 98,
      "def": 124,
      "spa": 122,
      "spd": 127,
      "spe": 65
    },
    "lvl100Stats": {
      "hp": 386,
      "atk": 191,
      "def": 244,
      "spa": 238,
      "spd": 249,
      "spe": 126
    },
    "fixedIV": 16
  },
  "Hariyama 2": {
    "species": "Hariyama",
    "nature": "Quiet",
    "item": "Quick Claw",
    "moves": [
      "Cross Chop",
      "Fire Punch",
      "Ice Punch",
      "ThunderPunch"
    ],
    "abilities": [
      "Thick Fat",
      "Guts"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 219,
      "atk": 172,
      "def": 80,
      "spa": 101,
      "spd": 80,
      "spe": 63
    },
    "lvl100Stats": {
      "hp": 429,
      "atk": 339,
      "def": 156,
      "spa": 196,
      "spd": 156,
      "spe": 122
    },
    "fixedIV": null
  },
  "Cradily 2": {
    "species": "Cradily",
    "nature": "Adamant",
    "item": "Sitrus Berry",
    "moves": [
      "Earthquake",
      "AncientPower",
      "Swagger",
      "Psych Up"
    ],
    "abilities": [
      "Suction Cups"
    ],
    "evs": {
      "hp": 255,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 193,
      "atk": 146,
      "def": 117,
      "spa": 91,
      "spd": 127,
      "spe": 63
    },
    "lvl100Stats": {
      "hp": 376,
      "atk": 287,
      "def": 230,
      "spa": 178,
      "spd": 250,
      "spe": 122
    },
    "fixedIV": null
  },
  "Cradily 3": {
    "species": "Cradily",
    "nature": "Modest",
    "item": "Leftovers",
    "moves": [
      "Substitute",
      "SolarBeam",
      "Sunny Day",
      "Recover"
    ],
    "abilities": [
      "Suction Cups"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 170,
      "spa": 170,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 161,
      "atk": 91,
      "def": 138,
      "spa": 134,
      "spd": 148,
      "spe": 63
    },
    "lvl100Stats": {
      "hp": 313,
      "atk": 178,
      "def": 272,
      "spa": 264,
      "spd": 292,
      "spe": 122
    },
    "fixedIV": null
  },
  "Muk 3": {
    "species": "Muk",
    "nature": "Quiet",
    "item": "Lum Berry",
    "moves": [
      "Sludge Bomb",
      "Thunderbolt",
      "Flamethrower",
      "Ice Punch"
    ],
    "abilities": [
      "Stench",
      "Sticky Hold"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 255,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 180,
      "atk": 125,
      "def": 127,
      "spa": 128,
      "spd": 120,
      "spe": 63
    },
    "lvl100Stats": {
      "hp": 351,
      "atk": 246,
      "def": 249,
      "spa": 251,
      "spd": 236,
      "spe": 122
    },
    "fixedIV": null
  },
  "Vileplume 4": {
    "species": "Vileplume",
    "nature": "Quiet",
    "item": "Quick Claw",
    "moves": [
      "SolarBeam",
      "Sludge Bomb",
      "Sunny Day",
      "Synthesis"
    ],
    "abilities": [
      "Chlorophyll"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 150,
      "atk": 132,
      "def": 105,
      "spa": 167,
      "spd": 110,
      "spe": 63
    },
    "lvl100Stats": {
      "hp": 291,
      "atk": 259,
      "def": 206,
      "spa": 328,
      "spd": 216,
      "spe": 122
    },
    "fixedIV": null
  },
  "Cradily 4": {
    "species": "Cradily",
    "nature": "Bold",
    "item": "Leftovers",
    "moves": [
      "Toxic",
      "Ingrain",
      "Mirror Coat",
      "Giga Drain"
    ],
    "abilities": [
      "Suction Cups"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 182,
      "atk": 91,
      "def": 152,
      "spa": 101,
      "spd": 148,
      "spe": 63
    },
    "lvl100Stats": {
      "hp": 355,
      "atk": 178,
      "def": 299,
      "spa": 198,
      "spd": 292,
      "spe": 122
    },
    "fixedIV": null
  },
  "Muk 4": {
    "species": "Muk",
    "nature": "Brave",
    "item": "Quick Claw",
    "moves": [
      "Sludge Bomb",
      "Brick Break",
      "Giga Drain",
      "Explosion"
    ],
    "abilities": [
      "Stench",
      "Sticky Hold"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 255,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 180,
      "atk": 172,
      "def": 127,
      "spa": 85,
      "spd": 120,
      "spe": 63
    },
    "lvl100Stats": {
      "hp": 351,
      "atk": 339,
      "def": 249,
      "spa": 166,
      "spd": 236,
      "spe": 122
    },
    "fixedIV": null
  },
  "Regice 2": {
    "species": "Regice",
    "nature": "Quiet",
    "item": "BrightPowder",
    "moves": [
      "Thunder",
      "Rain Dance",
      "Blizzard",
      "Brick Break"
    ],
    "abilities": [
      "Clear Body"
    ],
    "evs": {
      "hp": 255,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 187,
      "atk": 70,
      "def": 120,
      "spa": 167,
      "spd": 220,
      "spe": 63
    },
    "lvl100Stats": {
      "hp": 364,
      "atk": 136,
      "def": 236,
      "spa": 328,
      "spd": 436,
      "spe": 122
    },
    "fixedIV": null
  },
  "Registeel 2": {
    "species": "Registeel",
    "nature": "Quiet",
    "item": "BrightPowder",
    "moves": [
      "Thunderbolt",
      "Ice Punch",
      "Earthquake",
      "Aerial Ace"
    ],
    "abilities": [
      "Clear Body"
    ],
    "evs": {
      "hp": 170,
      "atk": 170,
      "def": 0,
      "spa": 170,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 176,
      "atk": 116,
      "def": 170,
      "spa": 128,
      "spd": 170,
      "spe": 63
    },
    "lvl100Stats": {
      "hp": 343,
      "atk": 228,
      "def": 336,
      "spa": 250,
      "spd": 336,
      "spe": 122
    },
    "fixedIV": null
  },
  "Regice 3": {
    "species": "Regice",
    "nature": "Quiet",
    "item": "Lum Berry",
    "moves": [
      "Ice Beam",
      "Thunderbolt",
      "Thunder Wave",
      "Explosion"
    ],
    "abilities": [
      "Clear Body"
    ],
    "evs": {
      "hp": 255,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 187,
      "atk": 70,
      "def": 120,
      "spa": 167,
      "spd": 220,
      "spe": 63
    },
    "lvl100Stats": {
      "hp": 364,
      "atk": 136,
      "def": 236,
      "spa": 328,
      "spd": 436,
      "spe": 122
    },
    "fixedIV": null
  },
  "Regice 5": {
    "species": "Regice",
    "nature": "Brave",
    "item": "Leftovers",
    "moves": [
      "Earthquake",
      "Ice Beam",
      "Curse",
      "Counter"
    ],
    "abilities": [
      "Clear Body"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 170,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 176,
      "atk": 77,
      "def": 141,
      "spa": 141,
      "spd": 220,
      "spe": 63
    },
    "lvl100Stats": {
      "hp": 343,
      "atk": 149,
      "def": 278,
      "spa": 278,
      "spd": 436,
      "spe": 122
    },
    "fixedIV": null
  },
  "Brandon Silver Regirock": {
    "species": "Regirock",
    "nature": "Adamant",
    "item": "Quick Claw",
    "moves": [
      "Explosion",
      "Superpower",
      "Earthquake",
      "AncientPower"
    ],
    "abilities": [
      "Clear Body"
    ],
    "evs": {
      "hp": 152,
      "atk": 152,
      "def": 0,
      "spa": 106,
      "spd": 100,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 167,
      "atk": 145,
      "def": 213,
      "spa": 68,
      "spd": 125,
      "spe": 63
    },
    "lvl100Stats": {
      "hp": 324,
      "atk": 284,
      "def": 421,
      "spa": 132,
      "spd": 246,
      "spe": 121
    },
    "fixedIV": 16
  },
  "Brandon Silver Registeel": {
    "species": "Registeel",
    "nature": "Adamant",
    "item": "Leftovers",
    "moves": [
      "Earthquake",
      "Metal Claw",
      "Toxic",
      "Iron Defense"
    ],
    "abilities": [
      "Clear Body"
    ],
    "evs": {
      "hp": 152,
      "atk": 152,
      "def": 0,
      "spa": 6,
      "spd": 200,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 167,
      "atk": 117,
      "def": 163,
      "spa": 79,
      "spd": 188,
      "spe": 63
    },
    "lvl100Stats": {
      "hp": 324,
      "atk": 229,
      "def": 321,
      "spa": 154,
      "spd": 371,
      "spe": 121
    },
    "fixedIV": 16
  },
  "Brandon Silver Regice": {
    "species": "Regice",
    "nature": "Modest",
    "item": "Chesto Berry",
    "moves": [
      "Ice Beam",
      "Amnesia",
      "Thunder",
      "Rest"
    ],
    "abilities": [
      "Clear Body"
    ],
    "evs": {
      "hp": 106,
      "atk": 0,
      "def": 152,
      "spa": 100,
      "spd": 152,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 161,
      "atk": 56,
      "def": 132,
      "spa": 138,
      "spd": 232,
      "spe": 63
    },
    "lvl100Stats": {
      "hp": 312,
      "atk": 108,
      "def": 259,
      "spa": 270,
      "spd": 459,
      "spe": 121
    },
    "fixedIV": 16
  },
  "Noland Gold\u2020 Metang": {
    "species": "Metang",
    "nature": "Brave",
    "item": "Sitrus Berry",
    "moves": [
      "Light Screen",
      "Psychic",
      "Reflect",
      "Metal Claw"
    ],
    "abilities": [
      "Clear Body"
    ],
    "evs": {
      "hp": 0,
      "atk": 252,
      "def": 252,
      "spa": 6,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 135,
      "atk": 139,
      "def": 152,
      "spa": 76,
      "spd": 100,
      "spe": 63
    },
    "lvl100Stats": {
      "hp": 261,
      "atk": 273,
      "def": 299,
      "spa": 147,
      "spd": 196,
      "spe": 122
    },
    "fixedIV": 31
  },
  "Noland Silver\u2020 Metang": {
    "species": "Metang",
    "nature": "Brave",
    "item": "Sitrus Berry",
    "moves": [
      "Light Screen",
      "Psychic",
      "Reflect",
      "Metal Claw"
    ],
    "abilities": [
      "Clear Body"
    ],
    "evs": {
      "hp": 0,
      "atk": 252,
      "def": 252,
      "spa": 6,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 135,
      "atk": 139,
      "def": 152,
      "spa": 76,
      "spd": 100,
      "spe": 63
    },
    "lvl100Stats": {
      "hp": 261,
      "atk": 273,
      "def": 299,
      "spa": 147,
      "spd": 196,
      "spe": 122
    },
    "fixedIV": 31
  },
  "Forretress 1": {
    "species": "Forretress",
    "nature": "Adamant",
    "item": "Focus Band",
    "moves": [
      "Double-Edge",
      "Rock Slide",
      "Light Screen",
      "Spikes"
    ],
    "abilities": [
      "Sturdy"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 255,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 150,
      "atk": 156,
      "def": 160,
      "spa": 72,
      "spd": 112,
      "spe": 60
    },
    "lvl100Stats": {
      "hp": 291,
      "atk": 306,
      "def": 316,
      "spa": 140,
      "spd": 219,
      "spe": 116
    },
    "fixedIV": null
  },
  "Rhydon 1": {
    "species": "Rhydon",
    "nature": "Adamant",
    "item": "Quick Claw",
    "moves": [
      "Earthquake",
      "Rock Tomb",
      "Scary Face",
      "Brick Break"
    ],
    "abilities": [
      "Lightningrod",
      "Rock Head"
    ],
    "evs": {
      "hp": 170,
      "atk": 170,
      "def": 0,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 201,
      "atk": 188,
      "def": 140,
      "spa": 58,
      "spd": 86,
      "spe": 60
    },
    "lvl100Stats": {
      "hp": 393,
      "atk": 371,
      "def": 276,
      "spa": 113,
      "spd": 168,
      "spe": 116
    },
    "fixedIV": null
  },
  "Forretress 2": {
    "species": "Forretress",
    "nature": "Adamant",
    "item": "Lum Berry",
    "moves": [
      "Earthquake",
      "Double-Edge",
      "Counter",
      "Protect"
    ],
    "abilities": [
      "Sturdy"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 255,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 150,
      "atk": 156,
      "def": 160,
      "spa": 72,
      "spd": 112,
      "spe": 60
    },
    "lvl100Stats": {
      "hp": 291,
      "atk": 306,
      "def": 316,
      "spa": 140,
      "spd": 219,
      "spe": 116
    },
    "fixedIV": null
  },
  "Rhydon 2": {
    "species": "Rhydon",
    "nature": "Adamant",
    "item": "Quick Claw",
    "moves": [
      "Earthquake",
      "Horn Drill",
      "Rock Slide",
      "Brick Break"
    ],
    "abilities": [
      "Lightningrod",
      "Rock Head"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 255,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 180,
      "atk": 200,
      "def": 140,
      "spa": 58,
      "spd": 97,
      "spe": 60
    },
    "lvl100Stats": {
      "hp": 351,
      "atk": 394,
      "def": 276,
      "spa": 113,
      "spd": 189,
      "spe": 116
    },
    "fixedIV": null
  },
  "Rhydon 3": {
    "species": "Rhydon",
    "nature": "Adamant",
    "item": "Quick Claw",
    "moves": [
      "Megahorn",
      "Crush Claw",
      "Earthquake",
      "Horn Drill"
    ],
    "abilities": [
      "Lightningrod",
      "Rock Head"
    ],
    "evs": {
      "hp": 255,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 212,
      "atk": 200,
      "def": 140,
      "spa": 58,
      "spd": 65,
      "spe": 60
    },
    "lvl100Stats": {
      "hp": 414,
      "atk": 394,
      "def": 276,
      "spa": 113,
      "spd": 126,
      "spe": 116
    },
    "fixedIV": null
  },
  "Forretress 4": {
    "species": "Forretress",
    "nature": "Adamant",
    "item": "Quick Claw",
    "moves": [
      "Explosion",
      "Earthquake",
      "Rock Slide",
      "Double-Edge"
    ],
    "abilities": [
      "Sturdy"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 255,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 150,
      "atk": 156,
      "def": 160,
      "spa": 72,
      "spd": 112,
      "spe": 60
    },
    "lvl100Stats": {
      "hp": 291,
      "atk": 306,
      "def": 316,
      "spa": 140,
      "spd": 219,
      "spe": 116
    },
    "fixedIV": null
  },
  "Rhydon 4": {
    "species": "Rhydon",
    "nature": "Adamant",
    "item": "Quick Claw",
    "moves": [
      "Megahorn",
      "Earthquake",
      "Rock Slide",
      "Horn Drill"
    ],
    "abilities": [
      "Lightningrod",
      "Rock Head"
    ],
    "evs": {
      "hp": 255,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 212,
      "atk": 200,
      "def": 140,
      "spa": 58,
      "spd": 65,
      "spe": 60
    },
    "lvl100Stats": {
      "hp": 414,
      "atk": 394,
      "def": 276,
      "spa": 113,
      "spd": 126,
      "spe": 116
    },
    "fixedIV": null
  },
  "Granbull 2": {
    "species": "Granbull",
    "nature": "Quiet",
    "item": "White Herb",
    "moves": [
      "Overheat",
      "Thunderbolt",
      "Ice Punch",
      "Facade"
    ],
    "abilities": [
      "Intimidate"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 255,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 165,
      "atk": 140,
      "def": 95,
      "spa": 123,
      "spd": 112,
      "spe": 58
    },
    "lvl100Stats": {
      "hp": 321,
      "atk": 276,
      "def": 186,
      "spa": 240,
      "spd": 219,
      "spe": 113
    },
    "fixedIV": null
  },
  "Granbull 4": {
    "species": "Granbull",
    "nature": "Brave",
    "item": "Choice Band",
    "moves": [
      "Mega Kick",
      "Earthquake",
      "Crunch",
      "Shadow Ball"
    ],
    "abilities": [
      "Intimidate"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 165,
      "atk": 189,
      "def": 95,
      "spa": 112,
      "spd": 80,
      "spe": 58
    },
    "lvl100Stats": {
      "hp": 321,
      "atk": 372,
      "def": 186,
      "spa": 219,
      "spd": 156,
      "spe": 113
    },
    "fixedIV": null
  },
  "Cradily 1": {
    "species": "Cradily",
    "nature": "Relaxed",
    "item": "Leftovers",
    "moves": [
      "Giga Drain",
      "Rock Slide",
      "Barrier",
      "Confuse Ray"
    ],
    "abilities": [
      "Suction Cups"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 182,
      "atk": 101,
      "def": 152,
      "spa": 101,
      "spd": 148,
      "spe": 57
    },
    "lvl100Stats": {
      "hp": 355,
      "atk": 198,
      "def": 299,
      "spa": 198,
      "spd": 292,
      "spe": 109
    },
    "fixedIV": null
  },
  "Quagsire 1": {
    "species": "Quagsire",
    "nature": "Adamant",
    "item": "Focus Band",
    "moves": [
      "Earthquake",
      "Brick Break",
      "Counter",
      "Mud-Slap"
    ],
    "abilities": [
      "Damp",
      "Water Absorb"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 255,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 170,
      "atk": 150,
      "def": 105,
      "spa": 76,
      "spd": 117,
      "spe": 55
    },
    "lvl100Stats": {
      "hp": 331,
      "atk": 295,
      "def": 206,
      "spa": 149,
      "spd": 229,
      "spe": 106
    },
    "fixedIV": null
  },
  "Quagsire 3": {
    "species": "Quagsire",
    "nature": "Adamant",
    "item": "Quick Claw",
    "moves": [
      "Earthquake",
      "Sludge Bomb",
      "Double-Edge",
      "Curse"
    ],
    "abilities": [
      "Damp",
      "Water Absorb"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 255,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 170,
      "atk": 150,
      "def": 105,
      "spa": 76,
      "spd": 117,
      "spe": 55
    },
    "lvl100Stats": {
      "hp": 331,
      "atk": 295,
      "def": 206,
      "spa": 149,
      "spd": 229,
      "spe": 106
    },
    "fixedIV": null
  },
  "Forretress 3": {
    "species": "Forretress",
    "nature": "Quiet",
    "item": "Focus Band",
    "moves": [
      "Explosion",
      "Earthquake",
      "Giga Drain",
      "Zap Cannon"
    ],
    "abilities": [
      "Sturdy"
    ],
    "evs": {
      "hp": 0,
      "atk": 170,
      "def": 0,
      "spa": 170,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 150,
      "atk": 131,
      "def": 160,
      "spa": 111,
      "spd": 101,
      "spe": 54
    },
    "lvl100Stats": {
      "hp": 291,
      "atk": 258,
      "def": 316,
      "spa": 217,
      "spd": 198,
      "spe": 104
    },
    "fixedIV": null
  },
  "Steelix 1": {
    "species": "Steelix",
    "nature": "Adamant",
    "item": "Sitrus Berry",
    "moves": [
      "Earthquake",
      "DragonBreath",
      "Rock Tomb",
      "Roar"
    ],
    "abilities": [
      "Rock Head",
      "Sturdy"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 255,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 150,
      "atk": 150,
      "def": 220,
      "spa": 67,
      "spd": 117,
      "spe": 50
    },
    "lvl100Stats": {
      "hp": 291,
      "atk": 295,
      "def": 436,
      "spa": 131,
      "spd": 229,
      "spe": 96
    },
    "fixedIV": null
  },
  "Snorlax 1": {
    "species": "Snorlax",
    "nature": "Adamant",
    "item": "Leftovers",
    "moves": [
      "Facade",
      "Shadow Ball",
      "Attract",
      "Double Team"
    ],
    "abilities": [
      "Immunity",
      "Thick Fat"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 255,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 235,
      "atk": 178,
      "def": 117,
      "spa": 76,
      "spd": 130,
      "spe": 50
    },
    "lvl100Stats": {
      "hp": 461,
      "atk": 350,
      "def": 229,
      "spa": 149,
      "spd": 256,
      "spe": 96
    },
    "fixedIV": null
  },
  "Slowbro 2": {
    "species": "Slowbro",
    "nature": "Modest",
    "item": "Leftovers",
    "moves": [
      "Surf",
      "Ice Beam",
      "Calm Mind",
      "Yawn"
    ],
    "abilities": [
      "Oblivious",
      "Own Tempo"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 255,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 170,
      "atk": 114,
      "def": 130,
      "spa": 132,
      "spd": 132,
      "spe": 50
    },
    "lvl100Stats": {
      "hp": 331,
      "atk": 224,
      "def": 256,
      "spa": 259,
      "spd": 259,
      "spe": 96
    },
    "fixedIV": null
  },
  "Slowking 2": {
    "species": "Slowking",
    "nature": "Modest",
    "item": "Shell Bell",
    "moves": [
      "Yawn",
      "Thunder Wave",
      "Surf",
      "Psychic"
    ],
    "abilities": [
      "Oblivious",
      "Own Tempo"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 255,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 170,
      "atk": 85,
      "def": 132,
      "spa": 167,
      "spd": 130,
      "spe": 50
    },
    "lvl100Stats": {
      "hp": 331,
      "atk": 167,
      "def": 259,
      "spa": 328,
      "spd": 256,
      "spe": 96
    },
    "fixedIV": null
  },
  "Steelix 2": {
    "species": "Steelix",
    "nature": "Hardy",
    "item": "Leftovers",
    "moves": [
      "Earthquake",
      "DragonBreath",
      "Sandstorm",
      "Block"
    ],
    "abilities": [
      "Rock Head",
      "Sturdy"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 255,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 150,
      "atk": 137,
      "def": 220,
      "spa": 75,
      "spd": 117,
      "spe": 50
    },
    "lvl100Stats": {
      "hp": 291,
      "atk": 269,
      "def": 436,
      "spa": 146,
      "spd": 229,
      "spe": 96
    },
    "fixedIV": null
  },
  "Snorlax 2": {
    "species": "Snorlax",
    "nature": "Adamant",
    "item": "Chesto Berry",
    "moves": [
      "Earthquake",
      "Rock Slide",
      "Curse",
      "Rest"
    ],
    "abilities": [
      "Immunity",
      "Thick Fat"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 256,
      "atk": 143,
      "def": 106,
      "spa": 76,
      "spd": 151,
      "spe": 50
    },
    "lvl100Stats": {
      "hp": 503,
      "atk": 281,
      "def": 208,
      "spa": 149,
      "spd": 298,
      "spe": 96
    },
    "fixedIV": null
  },
  "Steelix 3": {
    "species": "Steelix",
    "nature": "Adamant",
    "item": "Quick Claw",
    "moves": [
      "Earthquake",
      "Body Slam",
      "Rock Slide",
      "Explosion"
    ],
    "abilities": [
      "Rock Head",
      "Sturdy"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 255,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 150,
      "atk": 150,
      "def": 220,
      "spa": 67,
      "spd": 117,
      "spe": 50
    },
    "lvl100Stats": {
      "hp": 291,
      "atk": 295,
      "def": 436,
      "spa": 131,
      "spd": 229,
      "spe": 96
    },
    "fixedIV": null
  },
  "Snorlax 3": {
    "species": "Snorlax",
    "nature": "Adamant",
    "item": "Quick Claw",
    "moves": [
      "Mega Kick",
      "Shadow Ball",
      "Swagger",
      "Psych Up"
    ],
    "abilities": [
      "Immunity",
      "Thick Fat"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 255,
      "spa": 0,
      "spd": 255,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 235,
      "atk": 143,
      "def": 117,
      "spa": 76,
      "spd": 162,
      "spe": 50
    },
    "lvl100Stats": {
      "hp": 461,
      "atk": 281,
      "def": 229,
      "spa": 149,
      "spd": 319,
      "spe": 96
    },
    "fixedIV": null
  },
  "Slowking 4": {
    "species": "Slowking",
    "nature": "Modest",
    "item": "Quick Claw",
    "moves": [
      "Psychic",
      "Surf",
      "Ice Beam",
      "Flamethrower"
    ],
    "abilities": [
      "Oblivious",
      "Own Tempo"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 255,
      "spa": 255,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 170,
      "atk": 85,
      "def": 132,
      "spa": 167,
      "spd": 130,
      "spe": 50
    },
    "lvl100Stats": {
      "hp": 331,
      "atk": 167,
      "def": 259,
      "spa": 328,
      "spd": 256,
      "spe": 96
    },
    "fixedIV": null
  },
  "Steelix 4": {
    "species": "Steelix",
    "nature": "Adamant",
    "item": "Quick Claw",
    "moves": [
      "Earthquake",
      "Iron Tail",
      "Double-Edge",
      "Explosion"
    ],
    "abilities": [
      "Rock Head",
      "Sturdy"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 255,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 150,
      "atk": 150,
      "def": 220,
      "spa": 67,
      "spd": 117,
      "spe": 50
    },
    "lvl100Stats": {
      "hp": 291,
      "atk": 295,
      "def": 436,
      "spa": 131,
      "spd": 229,
      "spe": 96
    },
    "fixedIV": null
  },
  "Snorlax 4": {
    "species": "Snorlax",
    "nature": "Adamant",
    "item": "Quick Claw",
    "moves": [
      "Double-Edge",
      "Shadow Ball",
      "Brick Break",
      "Curse"
    ],
    "abilities": [
      "Immunity",
      "Thick Fat"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 255,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 235,
      "atk": 178,
      "def": 117,
      "spa": 76,
      "spd": 130,
      "spe": 50
    },
    "lvl100Stats": {
      "hp": 461,
      "atk": 350,
      "def": 229,
      "spa": 149,
      "spd": 256,
      "spe": 96
    },
    "fixedIV": null
  },
  "Snorlax 5": {
    "species": "Snorlax",
    "nature": "Adamant",
    "item": "Quick Claw",
    "moves": [
      "Mega Kick",
      "Shadow Ball",
      "Brick Break",
      "Counter"
    ],
    "abilities": [
      "Immunity",
      "Thick Fat"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 255,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 235,
      "atk": 178,
      "def": 117,
      "spa": 76,
      "spd": 130,
      "spe": 50
    },
    "lvl100Stats": {
      "hp": 461,
      "atk": 350,
      "def": 229,
      "spa": 149,
      "spd": 256,
      "spe": 96
    },
    "fixedIV": null
  },
  "Snorlax 6": {
    "species": "Snorlax",
    "nature": "Adamant",
    "item": "Leftovers",
    "moves": [
      "Earthquake",
      "Shadow Ball",
      "Brick Break",
      "Counter"
    ],
    "abilities": [
      "Immunity",
      "Thick Fat"
    ],
    "evs": {
      "hp": 0,
      "atk": 255,
      "def": 255,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 235,
      "atk": 178,
      "def": 117,
      "spa": 76,
      "spd": 130,
      "spe": 50
    },
    "lvl100Stats": {
      "hp": 461,
      "atk": 350,
      "def": 229,
      "spa": 149,
      "spd": 256,
      "spe": 96
    },
    "fixedIV": null
  },
  "Snorlax 7": {
    "species": "Snorlax",
    "nature": "Adamant",
    "item": "Quick Claw",
    "moves": [
      "Hyper Beam",
      "Shadow Ball",
      "Earthquake",
      "Curse"
    ],
    "abilities": [
      "Immunity",
      "Thick Fat"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 256,
      "atk": 143,
      "def": 106,
      "spa": 76,
      "spd": 151,
      "spe": 50
    },
    "lvl100Stats": {
      "hp": 503,
      "atk": 281,
      "def": 208,
      "spa": 149,
      "spd": 298,
      "spe": 96
    },
    "fixedIV": null
  },
  "Snorlax 8": {
    "species": "Snorlax",
    "nature": "Adamant",
    "item": "Chesto Berry",
    "moves": [
      "Return",
      "Shadow Ball",
      "Belly Drum",
      "Rest"
    ],
    "abilities": [
      "Immunity",
      "Thick Fat"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 256,
      "atk": 143,
      "def": 106,
      "spa": 76,
      "spd": 151,
      "spe": 50
    },
    "lvl100Stats": {
      "hp": 503,
      "atk": 281,
      "def": 208,
      "spa": 149,
      "spd": 298,
      "spe": 96
    },
    "fixedIV": null
  },
  "Anabel Gold Snorlax": {
    "species": "Snorlax",
    "nature": "Adamant",
    "item": "Chesto Berry",
    "moves": [
      "Curse",
      "Return",
      "Rest",
      "Shadow Ball"
    ],
    "abilities": [
      "Immunity",
      "Thick Fat"
    ],
    "evs": {
      "hp": 252,
      "atk": 252,
      "def": 0,
      "spa": 6,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 267,
      "atk": 178,
      "def": 85,
      "spa": 77,
      "spd": 130,
      "spe": 50
    },
    "lvl100Stats": {
      "hp": 524,
      "atk": 350,
      "def": 166,
      "spa": 150,
      "spd": 256,
      "spe": 96
    },
    "fixedIV": 31
  },
  "Quagsire 2": {
    "species": "Quagsire",
    "nature": "Sassy",
    "item": "Leftovers",
    "moves": [
      "Curse",
      "Attract",
      "Yawn",
      "AncientPower"
    ],
    "abilities": [
      "Damp",
      "Water Absorb"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 255,
      "spa": 0,
      "spd": 255,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 170,
      "atk": 105,
      "def": 137,
      "spa": 85,
      "spd": 128,
      "spe": 49
    },
    "lvl100Stats": {
      "hp": 331,
      "atk": 206,
      "def": 269,
      "spa": 166,
      "spd": 251,
      "spe": 95
    },
    "fixedIV": null
  },
  "Quagsire 4": {
    "species": "Quagsire",
    "nature": "Sassy",
    "item": "Leftovers",
    "moves": [
      "Surf",
      "Earthquake",
      "Ice Beam",
      "Amnesia"
    ],
    "abilities": [
      "Damp",
      "Water Absorb"
    ],
    "evs": {
      "hp": 0,
      "atk": 170,
      "def": 0,
      "spa": 170,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 170,
      "atk": 126,
      "def": 105,
      "spa": 106,
      "spd": 117,
      "spe": 49
    },
    "lvl100Stats": {
      "hp": 331,
      "atk": 248,
      "def": 206,
      "spa": 208,
      "spd": 228,
      "spe": 95
    },
    "fixedIV": null
  },
  "Anabel Silver Snorlax": {
    "species": "Snorlax",
    "nature": "Adamant",
    "item": "Quick Claw",
    "moves": [
      "Body Slam",
      "Belly Drum",
      "Yawn",
      "Shadow Ball"
    ],
    "abilities": [
      "Immunity",
      "Thick Fat"
    ],
    "evs": {
      "hp": 152,
      "atk": 152,
      "def": 0,
      "spa": 106,
      "spd": 100,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 251,
      "atk": 160,
      "def": 82,
      "spa": 85,
      "spd": 139,
      "spe": 47
    },
    "lvl100Stats": {
      "hp": 492,
      "atk": 315,
      "def": 159,
      "spa": 166,
      "spd": 274,
      "spe": 89
    },
    "fixedIV": 24
  },
  "Dusclops 1": {
    "species": "Dusclops",
    "nature": "Impish",
    "item": "Leftovers",
    "moves": [
      "Will-O-Wisp",
      "Seismic Toss",
      "Pain Split",
      "Confuse Ray"
    ],
    "abilities": [
      "Pressure"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 136,
      "atk": 90,
      "def": 188,
      "spa": 72,
      "spd": 171,
      "spe": 45
    },
    "lvl100Stats": {
      "hp": 263,
      "atk": 176,
      "def": 371,
      "spa": 140,
      "spd": 338,
      "spe": 86
    },
    "fixedIV": null
  },
  "Slowbro 1": {
    "species": "Slowbro",
    "nature": "Quiet",
    "item": "Shell Bell",
    "moves": [
      "Surf",
      "Rain Dance",
      "Headbutt",
      "Ice Punch"
    ],
    "abilities": [
      "Oblivious",
      "Own Tempo"
    ],
    "evs": {
      "hp": 255,
      "atk": 0,
      "def": 0,
      "spa": 0,
      "spd": 255,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 202,
      "atk": 95,
      "def": 130,
      "spa": 132,
      "spd": 132,
      "spe": 45
    },
    "lvl100Stats": {
      "hp": 394,
      "atk": 186,
      "def": 256,
      "spa": 259,
      "spd": 259,
      "spe": 86
    },
    "fixedIV": null
  },
  "Slowking 1": {
    "species": "Slowking",
    "nature": "Quiet",
    "item": "Leftovers",
    "moves": [
      "Psychic",
      "Brick Break",
      "Amnesia",
      "Attract"
    ],
    "abilities": [
      "Oblivious",
      "Own Tempo"
    ],
    "evs": {
      "hp": 255,
      "atk": 0,
      "def": 255,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 202,
      "atk": 95,
      "def": 132,
      "spa": 132,
      "spd": 130,
      "spe": 45
    },
    "lvl100Stats": {
      "hp": 394,
      "atk": 186,
      "def": 259,
      "spa": 259,
      "spd": 256,
      "spe": 86
    },
    "fixedIV": null
  },
  "Dusclops 2": {
    "species": "Dusclops",
    "nature": "Impish",
    "item": "Leftovers",
    "moves": [
      "Toxic",
      "Confuse Ray",
      "Double Team",
      "Protect"
    ],
    "abilities": [
      "Pressure"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 136,
      "atk": 90,
      "def": 188,
      "spa": 72,
      "spd": 171,
      "spe": 45
    },
    "lvl100Stats": {
      "hp": 263,
      "atk": 176,
      "def": 371,
      "spa": 140,
      "spd": 338,
      "spe": 86
    },
    "fixedIV": null
  },
  "Dusclops 3": {
    "species": "Dusclops",
    "nature": "Adamant",
    "item": "Leftovers",
    "moves": [
      "Psych Up",
      "Swagger",
      "Shadow Ball",
      "Earthquake"
    ],
    "abilities": [
      "Pressure"
    ],
    "evs": {
      "hp": 170,
      "atk": 0,
      "def": 170,
      "spa": 0,
      "spd": 170,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 136,
      "atk": 99,
      "def": 171,
      "spa": 72,
      "spd": 171,
      "spe": 45
    },
    "lvl100Stats": {
      "hp": 263,
      "atk": 193,
      "def": 338,
      "spa": 140,
      "spd": 338,
      "spe": 86
    },
    "fixedIV": null
  },
  "Slowbro 3": {
    "species": "Slowbro",
    "nature": "Quiet",
    "item": "Quick Claw",
    "moves": [
      "Surf",
      "Psychic",
      "Shadow Ball",
      "Attract"
    ],
    "abilities": [
      "Oblivious",
      "Own Tempo"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 255,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 170,
      "atk": 95,
      "def": 130,
      "spa": 167,
      "spd": 132,
      "spe": 45
    },
    "lvl100Stats": {
      "hp": 331,
      "atk": 186,
      "def": 256,
      "spa": 328,
      "spd": 259,
      "spe": 86
    },
    "fixedIV": null
  },
  "Slowking 3": {
    "species": "Slowking",
    "nature": "Quiet",
    "item": "Quick Claw",
    "moves": [
      "Psychic",
      "Surf",
      "Ice Beam",
      "Earthquake"
    ],
    "abilities": [
      "Oblivious",
      "Own Tempo"
    ],
    "evs": {
      "hp": 0,
      "atk": 170,
      "def": 170,
      "spa": 170,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 170,
      "atk": 116,
      "def": 121,
      "spa": 155,
      "spd": 130,
      "spe": 45
    },
    "lvl100Stats": {
      "hp": 331,
      "atk": 228,
      "def": 238,
      "spa": 305,
      "spd": 256,
      "spe": 86
    },
    "fixedIV": null
  },
  "Dusclops 4": {
    "species": "Dusclops",
    "nature": "Adamant",
    "item": "Chesto Berry",
    "moves": [
      "Double-Edge",
      "Shadow Ball",
      "Curse",
      "Rest"
    ],
    "abilities": [
      "Pressure"
    ],
    "evs": {
      "hp": 255,
      "atk": 255,
      "def": 0,
      "spa": 0,
      "spd": 0,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 147,
      "atk": 134,
      "def": 150,
      "spa": 72,
      "spd": 150,
      "spe": 45
    },
    "lvl100Stats": {
      "hp": 284,
      "atk": 262,
      "def": 296,
      "spa": 140,
      "spd": 296,
      "spe": 86
    },
    "fixedIV": null
  },
  "Slowbro 4": {
    "species": "Slowbro",
    "nature": "Sassy",
    "item": "Quick Claw",
    "moves": [
      "Psychic",
      "Surf",
      "Earthquake",
      "Ice Beam"
    ],
    "abilities": [
      "Oblivious",
      "Own Tempo"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 0,
      "spa": 255,
      "spd": 255,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 170,
      "atk": 95,
      "def": 130,
      "spa": 152,
      "spd": 145,
      "spe": 45
    },
    "lvl100Stats": {
      "hp": 331,
      "atk": 186,
      "def": 256,
      "spa": 299,
      "spd": 284,
      "spe": 86
    },
    "fixedIV": null
  },
  "Lucy Gold Steelix": {
    "species": "Steelix",
    "nature": "Brave",
    "item": "BrightPowder",
    "moves": [
      "Earthquake",
      "Rock Slide",
      "Explosion",
      "Screech"
    ],
    "abilities": [
      "Sturdy",
      "Rock Head"
    ],
    "evs": {
      "hp": 252,
      "atk": 0,
      "def": 0,
      "spa": 6,
      "spd": 252,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 182,
      "atk": 116,
      "def": 220,
      "spa": 76,
      "spd": 117,
      "spe": 45
    },
    "lvl100Stats": {
      "hp": 354,
      "atk": 226,
      "def": 436,
      "spa": 147,
      "spd": 229,
      "spe": 86
    },
    "fixedIV": 31
  },
  "Shuckle 2": {
    "species": "Shuckle",
    "nature": "Careful",
    "item": "Leftovers",
    "moves": [
      "Sandstorm",
      "Dig",
      "Flash",
      "Double Team"
    ],
    "abilities": [
      "Sturdy"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 255,
      "spa": 0,
      "spd": 255,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 95,
      "atk": 30,
      "def": 282,
      "spa": 27,
      "spd": 310,
      "spe": 25
    },
    "lvl100Stats": {
      "hp": 181,
      "atk": 56,
      "def": 559,
      "spa": 50,
      "spd": 614,
      "spe": 46
    },
    "fixedIV": null
  },
  "Shuckle 3": {
    "species": "Shuckle",
    "nature": "Careful",
    "item": "Leftovers",
    "moves": [
      "Substitute",
      "Attract",
      "Toxic",
      "Double Team"
    ],
    "abilities": [
      "Sturdy"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 255,
      "spa": 0,
      "spd": 255,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 95,
      "atk": 30,
      "def": 282,
      "spa": 27,
      "spd": 310,
      "spe": 25
    },
    "lvl100Stats": {
      "hp": 181,
      "atk": 56,
      "def": 559,
      "spa": 50,
      "spd": 614,
      "spe": 46
    },
    "fixedIV": null
  },
  "Shuckle 4": {
    "species": "Shuckle",
    "nature": "Careful",
    "item": "Chesto Berry",
    "moves": [
      "Toxic",
      "Double Team",
      "Wrap",
      "Rest"
    ],
    "abilities": [
      "Sturdy"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 255,
      "spa": 0,
      "spd": 255,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 95,
      "atk": 30,
      "def": 282,
      "spa": 27,
      "spd": 310,
      "spe": 25
    },
    "lvl100Stats": {
      "hp": 181,
      "atk": 56,
      "def": 559,
      "spa": 50,
      "spd": 614,
      "spe": 46
    },
    "fixedIV": null
  },
  "Shuckle 1": {
    "species": "Shuckle",
    "nature": "Brave",
    "item": "Chesto Berry",
    "moves": [
      "Rollout",
      "Defense Curl",
      "Sleep Talk",
      "Rest"
    ],
    "abilities": [
      "Sturdy"
    ],
    "evs": {
      "hp": 0,
      "atk": 0,
      "def": 255,
      "spa": 0,
      "spd": 255,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 95,
      "atk": 33,
      "def": 282,
      "spa": 30,
      "spd": 282,
      "spe": 22
    },
    "lvl100Stats": {
      "hp": 181,
      "atk": 61,
      "def": 559,
      "spa": 56,
      "spd": 559,
      "spe": 41
    },
    "fixedIV": null
  },
  "Lucy Silver Shuckle": {
    "species": "Shuckle",
    "nature": "Bold",
    "item": "Chesto Berry",
    "moves": [
      "Toxic",
      "Sandstorm",
      "Protect",
      "Rest"
    ],
    "abilities": [
      "Sturdy"
    ],
    "evs": {
      "hp": 252,
      "atk": 0,
      "def": 0,
      "spa": 106,
      "spd": 252,
      "spe": 0
    },
    "lvl50Stats": {
      "hp": 119,
      "atk": 20,
      "def": 267,
      "spa": 36,
      "spd": 274,
      "spe": 18
    },
    "lvl100Stats": {
      "hp": 229,
      "atk": 36,
      "def": 529,
      "spa": 67,
      "spd": 544,
      "spe": 31
    },
    "fixedIV": 16
  }
};

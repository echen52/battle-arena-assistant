// ── anchors.js ─────────────────────────────────────────────────────────────
// THE single source of recorded behaviour. Every test imports from here.
//
// WHY THIS EXISTS. Through Phase A the canonical anchor lived in six test files
// and had to be re-recorded by hand every time a fix class moved it. It moved
// three times (A4, A6, A1); the third time a commit landed with five tests
// failing because one copy was missed. Re-recording is now a one-file change.
//
// WHAT AN ANCHOR IS. Recorded behaviour, not a fidelity proof. The brief:
// "recorded-behavior anchors are stability guards, not fidelity proofs". Fidelity
// graduates in Phase D against the real ROM. Prior values are kept here forever
// with the class that moved them and WHY -- never deleted.
//
// HOW TO RE-RECORD. Run `node arena-solver/tools/rerecord-anchors.mjs`, which
// prints this file's tables from the live engine. Paste, and add a history row
// naming the fix class and the mechanism.

// ── leads ──────────────────────────────────────────────────────────────────
// The canonical lead. Steel/Psychic, which makes it structurally BLIND to
// poison-based mechanics -- see A3 in the fidelity log. Never assume a
// byte-identical Metagross sweep means a class did nothing.
export const METAGROSS = {
  species: "Metagross", level: 50, nature: "Adamant", evs: { atk: 252, spd: 4, spe: 252 },
  ability: "Clear Body", item: "Cheri Berry", moves: ["Meteor Mash", "Earthquake", "Shadow Ball", "Explosion"],
};

// The panel, for classes the canonical lead cannot see. Two poison-immune (by
// different routes) and three poisonable, deliberately.
export const LEADS = {
  Metagross: METAGROSS,
  Salamence: { species: "Salamence", level: 50, nature: "Adamant", evs: { atk: 252, spe: 252 },
    ability: "Intimidate", item: "Leftovers", moves: ["Dragon Claw", "Earthquake", "Rock Slide", "Aerial Ace"] },
  Snorlax: { species: "Snorlax", level: 50, nature: "Adamant", evs: { hp: 252, atk: 252 },
    ability: "Thick Fat", item: "Leftovers", moves: ["Body Slam", "Earthquake", "Shadow Ball", "Rest"] },
  Starmie: { species: "Starmie", level: 50, nature: "Timid", evs: { spa: 252, spe: 252 },
    ability: "Natural Cure", item: "Leftovers", moves: ["Surf", "Ice Beam", "Thunderbolt", "Recover"] },
  Gengar: { species: "Gengar", level: 50, nature: "Timid", evs: { spa: 252, spe: 252 },
    ability: "Levitate", item: "Leftovers", moves: ["Shadow Ball", "Thunderbolt", "Ice Punch", "Psychic"] },
};

// ── the canonical anchor ───────────────────────────────────────────────────
// Metagross vs Umbreon 4, fresh 100/100. A STABILITY anchor (CLAUDE.md
// amendment 2): it is identical across all 16 AI damage rolls, so it cannot and
// did not catch A2. It still catches unintended movement in everything around it.
export const ANCHOR = {
  lead: "Metagross",
  set: "Umbreon 4",
  move: "Meteor Mash",
  winProb: 0.9067329423180334,
};

// Never deleted. Each row is (value, class, why).
export const ANCHOR_HISTORY = [
  ["0.919", "—", "pre-Phase-A baseline, main @ 8591b80"],
  ["0.9186288305167801", "A2", "unchanged — identical across all 16 AI rolls; the blindness amendment 2 exists for"],
  ["0.9186288305167801", "A9", "unchanged — a fresh turn 1 has no stages/screens/weather for the AI to see"],
  ["0.9186288305167801", "A3", "unchanged — Metagross is Steel, so this opponent's Toxic never executes"],
  ["0.9325462501623014", "A4", "MOVED — Umbreon 4 carries Confuse Ray; a re-confuse now fails instead of re-landing"],
  ["0.9325462501623014", "A5", "unchanged — additive only"],
  ["0.9069423628063115", "A6", "MOVED — targetConfused went live, so that Confuse Ray is scored bad vs an already-confused target"],
  ["0.9069423628063115", "A7", "unchanged — structural port"],
  ["0.9067329423180334", "A1", "MOVED — accuracy arithmetic; Double Team is this opponent's main play"],
  ["0.9067329423180334", "A8/A10", "unchanged"],
  ["0.9067329423180334", "B1/B2a/B2b-1", "unchanged — Umbreon 4 carries no item or ability the pool changes"],
  ["0.9067329423180334", "B7a", "unchanged — Metagross holds Cheri Berry and Umbreon 4 Leftovers; neither is a damage modifier, and neither mon has a modifier ability"],
];

// B7a moved three OTHER recorded values, each with a named mechanism. Kept here
// because ANCHOR itself did not move, and a class that moves nothing at the
// canonical anchor while moving 106 sweep cells is exactly the blindness
// amendment 2 was written about.
export const B7A_PRE = {
  "Rapidash 1": { move: "Earthquake", winProb: 0.0625, why: "holds Charcoal — HOLD_EFFECT_FIRE_POWER, 1.1x its Fire moves" },
  "Marowak 2": { move: "Meteor Mash", winProb: 0.9494408927112818, why: "holds Thick Club — 2x Attack on Cubone/Marowak" },
  "Snorlax|Articuno 2": { move: "Body Slam", winProb: 0.9810316569313972, why: "the SNORLAX LEAD's own Thick Fat now halves Articuno's Ice damage — moved in the PLAYER's favour" },
  "Muk 1": { move: "Surf", winProb: 0.49859460108585935, why: "holds Poison Barb — HOLD_EFFECT_POISON_POWER, 1.1x its Poison moves" },
};

// ── per-class recorded tables ──────────────────────────────────────────────
// PRE_* are history and are never asserted. POST_* are asserted.

// A2 — the roll-treatment fidelity anchors, mined from the sets A2 flipped
// (amendment 2). Chosen for sensitivity to the roll treatment specifically.
export const A2_PRE = {
  "Entei 1": { move: "Explosion", winProb: 0, dist: [["Flamethrower", 1]] },
  "Rhydon 1": { move: "Meteor Mash", winProb: 0, dist: [["Earthquake", 1]] },
  "Rhydon 3": { move: "Meteor Mash", winProb: 0, dist: [["Earthquake", 1]] },
  "Rhydon 4": { move: "Meteor Mash", winProb: 0, dist: [["Earthquake", 1]] },
  "Houndoom 1": { move: "Explosion", winProb: 0, dist: [["Flamethrower", 1]] },
  "Rapidash 1": { move: "Explosion", winProb: 0, dist: [["Flamethrower", 1]] },
  "Anabel Silver Entei": { move: "Explosion", winProb: 0.5, dist: [["Fire Blast", 1]] },
  "Exploud 3": { move: "Explosion", winProb: 0.5, dist: [["Overheat", 1]] },
  "Donphan 1": { move: "Explosion", winProb: 0.5, dist: [["Earthquake", 1]] },
};

// A9 — pre-fix values (branch @ ea666e4).
export const A9_PRE = {
  "Quagsire 3": { move: "Earthquake", winProb: 0.8516 },
  "Swampert 1": { move: "Shadow Ball", winProb: 0.7728 },
  "Snorlax 2": { move: "Earthquake", winProb: 0.8949 },
  "Ludicolo 1": { move: "Shadow Ball", winProb: 0.5703 },
};

// A3 — pre-fix cross-lead cells (branch @ fd33392).
export const A3_PRE = {
  "Snorlax|Articuno 2": { move: "Shadow Ball", winProb: 0.9847862521419303 },
  "Starmie|Brandon Silver Registeel": { move: "Thunderbolt", winProb: 0.9737529153511181 },
  "Snorlax|Exeggutor 3": { move: "Body Slam", winProb: 0.9084137530859424 },
  "Salamence|Umbreon 4": { move: "Earthquake", winProb: 0.971062978108724 },
};

// A4 — pre-fix values (branch @ 654df57).
export const A4_PRE = {
  "Gengar 1": { move: "Shadow Ball", winProb: 0.7309375 },
  "Greta Gold Umbreon": { move: "Earthquake", winProb: 0.8769799391764942 },
  "Lapras 1": { move: "Meteor Mash", winProb: 0.6648082338686341 },
  "Cradily 1": { move: "Meteor Mash", winProb: 0.9833385824019526 },
};

// A6 — pre-fix values (branch @ 82b82e3).
export const A6_PRE = {
  "Gengar 1": { move: "Shadow Ball", winProb: 0.9184375 },
  "Lapras 1": { move: "Earthquake", winProb: 0.6896961805555555 },
  "Articuno 5": { move: "Shadow Ball", winProb: 0.9851259223620097 },
  "Spenser Silver Slaking": { move: "Earthquake", winProb: 0.46563486328125003 },
};

// ── CURRENT recorded behaviour (asserted) ──────────────────────────────────
// Single-lead cells, keyed by set name, all against METAGROSS.
export const CURRENT = {
  // A2's roll-sensitive set
  "Entei 1": { move: "Explosion", winProb: 0.046614478031794235 },
  "Rhydon 1": { move: "Earthquake", winProb: 0.31787109375 },
  "Rhydon 3": { move: "Earthquake", winProb: 0.044375 },
  "Rhydon 4": { move: "Earthquake", winProb: 0.044375 },
  "Houndoom 1": { move: "Earthquake", winProb: 0.13020833333333334 },
  "Rapidash 1": { move: "Earthquake", winProb: 0.0009765625 }, // B7a: Charcoal
  "Anabel Silver Entei": { move: "Explosion", winProb: 0.5 },
  "Exploud 3": { move: "Explosion", winProb: 0.5 },
  "Donphan 1": { move: "Explosion", winProb: 0.5 },
  // A9's state-sensitive set
  "Quagsire 3": { move: "Meteor Mash", winProb: 0.5053125 },
  "Swampert 1": { move: "Meteor Mash", winProb: 0.5000737108290196 },
  "Snorlax 2": { move: "Meteor Mash", winProb: 0.8027441776394845 },
  "Ludicolo 1": { move: "Explosion", winProb: 0.5 },
  "Snorlax 7": { move: "Meteor Mash", winProb: 0.8081748046875002 },
  "Marowak 2": { move: "Explosion", winProb: 0.5 }, // B7a: Thick Club doubles its Attack
  "Suicune 1": { move: "Meteor Mash", winProb: 0.5159383055241743 },
  // A4/A6's confusion-sensitive set
  "Gengar 1": { move: "Shadow Ball", winProb: 0.5800000000000001 },
  "Greta Gold Umbreon": { move: "Earthquake", winProb: 0.9783547376864591 },
  "Greta Silver Umbreon": { move: "Meteor Mash", winProb: 0.8143718750000001 },
  "Lapras 1": { move: "Meteor Mash", winProb: 0.589053488498264 },
  "Cradily 1": { move: "Meteor Mash", winProb: 0.9831834216220691 },
  "Starmie 6": { move: "Shadow Ball", winProb: 0.7821180555555556 },
  "Tauros 1": { move: "Meteor Mash", winProb: 0.5167382812500002 },
  "Articuno 5": { move: "Meteor Mash", winProb: 0.9694799148701366 },
  "Spenser Silver Slaking": { move: "Explosion", winProb: 0.415625 },
  // remaining roll-sensitive sets from sim-audit.md 7.1's list
  "Heracross 2": { move: "Explosion", winProb: 0.5 },
  "Venusaur 3": { move: "Meteor Mash", winProb: 0.5964432373046875 },
  "Lucy Silver Milotic": { move: "Shadow Ball", winProb: 0.9859237670898438 },
  "Tucker Gold Swampert": { move: "Earthquake", winProb: 0.52921875 },
  "Regirock 2": { move: "Meteor Mash", winProb: 0.4809887721538164 },
  "Golem 1": { move: "Shadow Ball", winProb: 1 },
};

// Cross-lead cells, keyed "Lead|Set". A3's poison-sensitive set.
export const CURRENT_CELLS = {
  "Snorlax|Articuno 2": { move: "Body Slam", winProb: 0.985365207225065 }, // B7a: the lead's own Thick Fat
  "Starmie|Brandon Silver Registeel": { move: "Thunderbolt", winProb: 0.8888926973180181 },
  "Snorlax|Exeggutor 3": { move: "Body Slam", winProb: 0.8540164087233308 },
  "Salamence|Umbreon 4": { move: "Earthquake", winProb: 0.9640729692247177 },
  "Starmie|Umbreon 4": { move: "Ice Beam", winProb: 0.7912195234978198 },
  "Snorlax|Blissey 1": { move: "Body Slam", winProb: 0.9443710298449904 },
};

// Full opponent AI distributions at fresh turn 1, for the roll-sensitive sets.
// test-ai-roll.js asserts on these as well as on move/winProb, because the
// distribution is what A2 actually changed -- a degenerate [x, 1] here is the
// collapse, visible.
export const CURRENT_DIST = {
  "Entei 1": [["Flamethrower", 0.8851824601491293], ["Double Team", 0.08635433514912924], ["Calm Mind", 0.02846320470174154]],
  "Rhydon 1": [["Earthquake", 0.68212890625], ["Rock Tomb", 0.31787109375]],
  "Rhydon 3": [["Earthquake", 0.9375], ["Horn Drill", 0.0625]],
  "Rhydon 4": [["Earthquake", 0.9375], ["Horn Drill", 0.0625]],
  "Houndoom 1": [["Flamethrower", 0.7916666666666666], ["Counter", 0.10416666666666667], ["Will-O-Wisp", 0.10416666666666667]],
  // B7a: Charcoal boosts its Flamethrower in the AI's OWN damage estimate too,
  // so AI_TryToFaint stops splitting with Protect. Was [["Protect", 0.5], ["Flamethrower", 0.5]].
  "Rapidash 1": [["Flamethrower", 0.9375], ["Protect", 0.0625]],
  "Anabel Silver Entei": [["Fire Blast", 0.7917938232421875], ["Calm Mind", 0.2082061767578125]],
  "Exploud 3": [["Overheat", 0.90625], ["ThunderPunch", 0.09375]],
  "Donphan 1": [["Earthquake", 0.671875], ["Swagger", 0.328125]],
  "Heracross 2": [["Bulk Up", 0.6639811197916666], ["Earthquake", 0.3094579378763835], ["Megahorn", 0.02656094233194987]],
  "Venusaur 3": [["Earthquake", 0.5], ["Sleep Powder", 0.5]],
  "Lucy Silver Milotic": [["Mirror Coat", 0.5], ["Surf", 0.5]],
  "Tucker Gold Swampert": [["Earthquake", 0.65625], ["Mirror Coat", 0.34375]],
  "Regirock 2": [["Earthquake", 0.4674479166666667], ["Counter", 0.4674479166666667], ["Explosion", 0.06510416666666667]],
  "Golem 1": [["Rock Tomb", 0.49951171875], ["Earthquake", 0.406494140625], ["Counter", 0.093994140625]],
};

// ── B2B1 — the sets B2b batch 1 (the stat-stage family) made solvable ──────
// Recorded 2026-09-23. Every one of these cells was a RECORDED THROW before
// the batch (cause named in `wasThrowing`), so none of them is a re-recording:
// the pre-values are "no value existed", which is why they carry no PRE table.
//
// The lead on each row is chosen so the number DISCRIMINATES. Against the
// canonical Metagross lead most of these sets evaluate to a flat 1.0, which
// locks nothing; the panel leads separate them.
export const B2B1 = {
  "Poliwrath 2":           { tier:  9, lead: "Snorlax", effect: "EFFECT_BELLY_DRUM",   wasThrowing: "ai-scoring", move: "Body Slam",   winProb: 0.04666666666666666 },
  "Snorlax 8":             { tier: 31, lead: "Gengar",  effect: "EFFECT_BELLY_DRUM",   wasThrowing: "ai-scoring", move: "Thunderbolt", winProb: 0.03202128648757935 },
  "Anabel Silver Snorlax": { tier: 24, lead: "Gengar",  effect: "EFFECT_BELLY_DRUM",   wasThrowing: "ai-scoring", move: "Thunderbolt", winProb: 0.07542444229125977 },
  "Muk 1":                 { tier: 31, lead: "Starmie", effect: "EFFECT_MINIMIZE",     wasThrowing: "ai-scoring", move: "Surf",        winProb: 0.49061960451908687 }, // B7a: Poison Barb
  "Linoone 1":             { tier:  6, lead: "Snorlax", effect: "EFFECT_TICKLE",       wasThrowing: "ai-scoring", move: "Body Slam",   winProb: 0.9934374999999999 },
  "Machoke 2":             { tier:  9, lead: "Snorlax", effect: "EFFECT_FORESIGHT",    wasThrowing: "ai-scoring", move: "Body Slam",   winProb: 0.3474999999999999 },
  "Hitmonlee 2":           { tier:  9, lead: "Snorlax", effect: "EFFECT_FORESIGHT",    wasThrowing: "ai-scoring", move: "Body Slam",   winProb: 0 },
  "Pinsir 1":              { tier:  9, lead: "Snorlax", effect: "EFFECT_FOCUS_ENERGY", wasThrowing: "ai-scoring", move: "Body Slam",   winProb: 0.5142531394958496 },
  "Dunsparce 1":           { tier:  6, lead: "Snorlax", effect: "EFFECT_DEFENSE_CURL", wasThrowing: "ai-scoring", move: "Body Slam",   winProb: 0.99658203125 },
  "Dragonair 1":           { tier:  6, lead: "Snorlax", effect: "EFFECT_DEFENSE_DOWN", wasThrowing: "ai-scoring", move: "Body Slam",   winProb: 1 },
  "Caterpie 1":            { tier:  3, lead: "Snorlax", effect: "EFFECT_SPEED_DOWN",   wasThrowing: "ai-scoring", move: "Body Slam",   winProb: 1 },
};

// ── B2A — the sets B2a made solvable ───────────────────────────────────────
// RECORDED LATE. B2a (commit 5e13e2b) landed without a characterization test,
// so these are first recordings taken afterwards, not the values as they stood
// at that commit. See test-b2a-no-dispatch.js's header for the full note.
// Every one of these five was a recorded throw before B2a.
export const B2A = {
  "Espeon 3":    { tier: 31, lead: "Gengar", effect: "EFFECT_METRONOME (no-dispatch)", move: "Thunderbolt", winProb: 0.025 },
  "Ninetales 2": { tier: 31, lead: "Gengar", effect: "EFFECT_GRUDGE (no-dispatch)",    move: "Thunderbolt", winProb: 0.74333125 },
  "Xatu 1":      { tier: 12, lead: "Gengar", effect: "EFFECT_TEETER_DANCE/WISH",       move: "Thunderbolt", winProb: 1 },
  "Clefable 2":  { tier: 31, lead: "Gengar", effect: "EFFECT_METRONOME (no-dispatch)", move: "Ice Punch",   winProb: 0.9215071402559959 },
  "Dusclops 4":  { tier: 31, lead: "Gengar", effect: "Ghost-EFFECT_CURSE",             move: "Thunderbolt", winProb: 0.00625 },
};

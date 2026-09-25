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
  // PANEL v2 addition. The first five leads cannot inflict a major status on
  // the opponent at all, which made a whole CLASS of mechanic structurally
  // unsweepable: Guts, Marvel Scale and anything else gated on `status1` could
  // never fire in any measurement, so B7a landed all three with zero movers and
  // no anchor could guard them. Arcanine carries Will-O-Wisp, so burn -- and
  // therefore that whole class -- is reachable.
  //
  // Flash Fire, NOT Intimidate, deliberately: Arcanine's other ability would
  // have put a second Intimidate in the panel and confounded every future
  // measurement with the one the panel already has on Salamence.
  // ExtremeSpeed and Crunch give it real PHYSICAL damage, which is what Marvel
  // Scale and the burn-halving path need in order to show up at all.
  Arcanine: { species: "Arcanine", level: 50, nature: "Adamant", evs: { atk: 252, spe: 252 },
    ability: "Flash Fire", item: "Leftovers", moves: ["Will-O-Wisp", "ExtremeSpeed", "Flamethrower", "Crunch"] },
};

// PANEL VERSION. Bumped whenever the lead set changes, so a sweep taken before
// and after a change is never silently compared cell-for-cell -- the cell COUNT
// changes (5 leads x 552 = 2,760 at v1, 6 x 552 = 3,312 at v2) and a diff that
// does not know that will report the whole new column as "gained".
//
// v1: Metagross, Salamence, Snorlax, Starmie, Gengar. Every per-class number in
//     phase-b-log.md up to and including Intimidate was measured on v1.
// v2: + Arcanine, for the reason on its entry above.
export const PANEL_VERSION = 2;

// ── the canonical anchor ───────────────────────────────────────────────────
// Metagross vs Umbreon 4, fresh 100/100. A STABILITY anchor (CLAUDE.md
// amendment 2): it is identical across all 16 AI damage rolls, so it cannot and
// did not catch A2. It still catches unintended movement in everything around it.
export const ANCHOR = {
  lead: "Metagross",
  set: "Umbreon 4",
  move: "Meteor Mash",
  winProb: 0.9057599196787075,
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
  ["0.9067329423180334", "B7b..B4c", "unchanged — no item effect, ability or chance secondary of either mon reaches it"],
  ["0.9151343785835914", "B4d-pre", "MOVED — Umbreon 4's Confuse Ray now WEARS OFF: confusion lasts 2-5 turns (CANCELER_CONFUSED); zeroing only the snap-out chances restores 0.9067329423180334"],
  ["0.9151343785835914", "C1, B6-1a..1d", "unchanged — headless search, integer HP, the AI's integer HP percentage and the transposition table leave it bit for bit"],
  ["0.9057599196787075", "B6-2", "MOVED — critical hits, exact (Cmd_critcalc); the crits-off engine reproduces the pre-crit universe byte for byte"],
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
  "Rhydon 1": { move: "Earthquake", winProb: 0.29616676691898647 }, // B7c: holds Quick Claw; B6-2: crits (the crits-off engine reproduces the pre-crit universe byte for byte); was 0.2583394646841043
  "Rhydon 3": { move: "Earthquake", winProb: 0.08420545496232806 }, // B7c: holds Quick Claw; B6-2: crits (the crits-off engine reproduces the pre-crit universe byte for byte); was 0.03589395753741264
  "Rhydon 4": { move: "Earthquake", winProb: 0.08420545496232806 }, // B7c: holds Quick Claw; B6-2: crits (the crits-off engine reproduces the pre-crit universe byte for byte); was 0.03589395753741264
  "Houndoom 1": { move: "Earthquake", winProb: 0.12247320795588662 }, // B7c: holds Focus Band; B6-2: crits (the crits-off engine reproduces the pre-crit universe byte for byte); was 0.11759039545588663
  "Rapidash 1": { move: "Earthquake", winProb: 0.0009765625 }, // B7a: Charcoal
  "Anabel Silver Entei": { move: "Explosion", winProb: 0.5 },
  "Exploud 3": { move: "Explosion", winProb: 0.5 },
  "Donphan 1": { move: "Explosion", winProb: 0.5 },
  // A9's state-sensitive set
  "Quagsire 3": { move: "Explosion", winProb: 0.4996093809604645 }, // B7c: holds Quick Claw -- and the advice FLIPS; B6-2: crits (the crits-off engine reproduces the pre-crit universe byte for byte); was 0.5
  "Swampert 1": { move: "Explosion", winProb: 0.5 }, // B6-2: crits (the crits-off engine reproduces the pre-crit universe byte for byte); was 0.5000737108290196 Meteor Mash, the advice FLIPS
  "Snorlax 2": { move: "Meteor Mash", winProb: 0.8146986831037795 }, // B6-2: crits (the crits-off engine reproduces the pre-crit universe byte for byte); was 0.8027441776394845
  "Ludicolo 1": { move: "Explosion", winProb: 0.5 },
  "Snorlax 7": { move: "Meteor Mash", winProb: 0.6562622044263354 }, // B7c: holds Quick Claw; B6-2: crits (the crits-off engine reproduces the pre-crit universe byte for byte); was 0.6360831557907413
  "Marowak 2": { move: "Explosion", winProb: 0.5 }, // B7a: Thick Club doubles its Attack
  "Suicune 1": { move: "Meteor Mash", winProb: 0.5092947876077426 }, // B6-2: crits (the crits-off engine reproduces the pre-crit universe byte for byte); was 0.5159383055241743
  // A4/A6's confusion-sensitive set
  "Gengar 1": { move: "Shadow Ball", winProb: 0.649375 }, // B3-4a: a mon that WAKES UP now acts that turn (CANCELER_ASLEEP pushes the cursor, src/battle_util.c:2049); was 0.5800000000000001 (Hypnosis); B4d-pre: confusion now wears off after 2-5 turns -- this set carries Confuse Ray (zeroing only the snap-out chances restores 0.64)
  "Greta Gold Umbreon": { move: "Earthquake", winProb: 0.981852105022881 }, // B4d-pre: confusion now wears off after 2-5 turns -- this set carries Confuse Ray (zeroing only the snap-out chances restores 0.9783547376864591); B6-2: crits (the crits-off engine reproduces the pre-crit universe byte for byte); was 0.9837660532648443
  "Greta Silver Umbreon": { move: "Meteor Mash", winProb: 0.8343867306113244 }, // B4d-pre: confusion now wears off after 2-5 turns -- this set carries Confuse Ray (zeroing only the snap-out chances restores 0.8143718750000001); B6-2: crits (the crits-off engine reproduces the pre-crit universe byte for byte); was 0.8479656250000001
  "Lapras 1": { move: "Meteor Mash", winProb: 0.6231751209100089 }, // B3-4a: a mon that WAKES UP now acts that turn (CANCELER_ASLEEP pushes the cursor, src/battle_util.c:2049); was 0.589053488498264 (Sing); B4d-pre: confusion now wears off after 2-5 turns -- this set carries Confuse Ray (zeroing only the snap-out chances restores 0.6130758843315973); B6-2: crits (the crits-off engine reproduces the pre-crit universe byte for byte); was 0.6209323947482639
  "Cradily 1": { move: "Meteor Mash", winProb: 0.9851338144817644 }, // B4d-pre: confusion now wears off after 2-5 turns -- this set carries Confuse Ray (zeroing only the snap-out chances restores 0.9831834216220691); B6-2: crits (the crits-off engine reproduces the pre-crit universe byte for byte); was 0.9856756127472637
  "Starmie 6": { move: "Shadow Ball", winProb: 0.8181546529134114 }, // B4d-pre: confusion now wears off after 2-5 turns -- this set carries Confuse Ray (zeroing only the snap-out chances restores 0.7821180555555556); B6-2: crits (the crits-off engine reproduces the pre-crit universe byte for byte); was 0.8593750000000001
  "Tauros 1": { move: "Meteor Mash", winProb: 0.5573471899108887 }, // B4d-pre: confusion now wears off after 2-5 turns -- this set carries Swagger (zeroing only the snap-out chances restores 0.5167382812500002); B6-2: crits (the crits-off engine reproduces the pre-crit universe byte for byte); was 0.5597958984375
  "Articuno 5": { move: "Meteor Mash", winProb: 0.9713734935012814 }, // B7c: holds Focus Band (a 1-ULP move); B4a (chance status secondaries) -- its BLIZZARD now freezes 10% (zeroing Blizzard alone restores 0.9694799148701365); B4d-pre: confusion now wears off after 2-5 turns -- this set carries Swagger (zeroing only the snap-out chances restores 0.9665761405443762); B6-2: crits (the crits-off engine reproduces the pre-crit universe byte for byte); was 0.9727478477299578
  "Spenser Silver Slaking": { move: "Meteor Mash", winProb: 0.6407034222412108 }, // B8c: TRUANT -- Slaking now loafs on turn 2; was Explosion 0.415625, and the advice FLIPS; B4d-pre: confusion now wears off after 2-5 turns -- this set carries Swagger (zeroing only the snap-out chances restores 0.5478714843750001); B6-2: crits (the crits-off engine reproduces the pre-crit universe byte for byte); was 0.6746125561523437
  // remaining roll-sensitive sets from sim-audit.md 7.1's list
  "Heracross 2": { move: "Explosion", winProb: 0.49032943944136304 }, // B6-2: crits (the crits-off engine reproduces the pre-crit universe byte for byte); was 0.5
  "Venusaur 3": { move: "Meteor Mash", winProb: 0.6928590240478518 }, // B3-4a: a mon that WAKES UP now acts that turn (CANCELER_ASLEEP pushes the cursor, src/battle_util.c:2049); was 0.5964432373046875 (Sleep Powder); B6-2: crits (the crits-off engine reproduces the pre-crit universe byte for byte); was 0.6831619873046876
  "Lucy Silver Milotic": { move: "Shadow Ball", winProb: 0.9059897259451317 }, // B6-2: crits (the crits-off engine reproduces the pre-crit universe byte for byte); was 0.9859237670898438
  "Tucker Gold Swampert": { move: "Earthquake", winProb: 0.5314903259277344 }, // B6-2: crits (the crits-off engine reproduces the pre-crit universe byte for byte); was 0.52921875
  "Regirock 2": { move: "Meteor Mash", winProb: 0.4142447724693017 }, // B7c: holds Quick Claw; B6-2: crits (the crits-off engine reproduces the pre-crit universe byte for byte); was 0.40152383887764
  "Golem 1": { move: "Meteor Mash", winProb: 0.9558105218525705 }, // B7c: holds Quick Claw -- and the advice FLIPS; B6-2: crits (the crits-off engine reproduces the pre-crit universe byte for byte); was 0.9630743324033422
};

// Cross-lead cells, keyed "Lead|Set". A3's poison-sensitive set.
export const CURRENT_CELLS = {
  "Snorlax|Articuno 2": { move: "Body Slam", winProb: 0.9815140801362997 }, // B7a: the lead's own Thick Fat; B4a (chance status secondaries) -- Articuno's BLIZZARD freezes the lead 10% (zeroing it alone restores 0.985365207225065); B6-2: crits (the crits-off engine reproduces the pre-crit universe byte for byte); was 0.9824447945293759
  "Starmie|Brandon Silver Registeel": { move: "Surf", winProb: 0.8717222521498547 }, // B6-2: crits (the crits-off engine reproduces the pre-crit universe byte for byte); was 0.8888926973180181 Thunderbolt, the advice FLIPS
  "Snorlax|Exeggutor 3": { move: "Body Slam", winProb: 0.8785664721368601 }, // B4a (chance status secondaries) -- the lead's BODY SLAM paralyses 30% (zeroing it alone restores 0.8540164087233308); B6-2: crits (the crits-off engine reproduces the pre-crit universe byte for byte); was 0.8934663712683204
  "Salamence|Umbreon 4": { move: "Earthquake", winProb: 0.9680102818301773 }, // B4d-pre: confusion now wears off after 2-5 turns -- this set carries Confuse Ray (zeroing only the snap-out chances restores 0.9640729692247177); B6-2: crits (the crits-off engine reproduces the pre-crit universe byte for byte); was 0.9696678585476344
  "Starmie|Umbreon 4": { move: "Ice Beam", winProb: 0.786438025378394 }, // B4d-pre: confusion now wears off after 2-5 turns -- this set carries Confuse Ray (zeroing only the snap-out chances restores 0.7912195234978198); B6-1b: the AI reads HP as source's TRUNCATED integer percentage (zeroing only the truncation restores 0.7976496123258271); B6-2: crits (the crits-off engine reproduces the pre-crit universe byte for byte); was 0.7979486889790162
  "Snorlax|Blissey 1": { move: "Earthquake", winProb: 0.9351897271082136 }, // B7c: Blissey 1 holds BrightPowder; B3-4a: a mon that WAKES UP now acts that turn (CANCELER_ASLEEP pushes the cursor, src/battle_util.c:2049); was 0.9260616024472976 (Sing); then B3-4d: Rest at full HP scores +1, not -2 (BattleScript_AlreadyAtFullHp sets no result flag) -- the Snorlax lead carries Rest; was 0.9351849809890322; B4a (chance status secondaries) -- Body Slam's 30% paralysis now rolls and the advice FLIPS to Earthquake by 1 ULP (zeroing Body Slam alone restores Body Slam 0.9351897271082136); B6-2: crits (the crits-off engine reproduces the pre-crit universe byte for byte); was 0.9351897271082135
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
  "Poliwrath 2":           { tier:  9, lead: "Snorlax", effect: "EFFECT_BELLY_DRUM",   wasThrowing: "ai-scoring", move: "Body Slam",   winProb: 0.2503780204174971 }, // B3-4a: a mon that WAKES UP now acts that turn (CANCELER_ASLEEP pushes the cursor, src/battle_util.c:2049); was 0.04666666666666666 (Hypnosis); B4a (chance status secondaries) -- the lead's BODY SLAM paralyses 30% (zeroing it alone restores 0.06416666666666666); B6-2: crits (the crits-off engine reproduces the pre-crit universe byte for byte); was 0.22766666666666663
  "Snorlax 8":             { tier: 31, lead: "Gengar",  effect: "EFFECT_BELLY_DRUM",   wasThrowing: "ai-scoring", move: "Ice Punch", winProb: 0.11731655160731753 }, // B4a (chance status secondaries) -- the Gengar lead's ICE PUNCH freezes 10% and the advice FLIPS from Thunderbolt (zeroing Ice Punch alone restores Thunderbolt 0.03202128648757935); B6-2: crits (the crits-off engine reproduces the pre-crit universe byte for byte); was 0.10653279296875003
  "Anabel Silver Snorlax": { tier: 24, lead: "Gengar",  effect: "EFFECT_BELLY_DRUM",   wasThrowing: "ai-scoring", move: "Ice Punch", winProb: 0.14733127058363185 }, // B7c: holds Quick Claw; B4a (chance status secondaries) -- the Gengar lead's ICE PUNCH freezes 10% and the advice FLIPS from Thunderbolt (zeroing Ice Punch alone restores Thunderbolt 0.0713143221859218); B6-2: crits (the crits-off engine reproduces the pre-crit universe byte for byte); was 0.14194615494034907
  "Muk 1":                 { tier: 31, lead: "Starmie", effect: "EFFECT_MINIMIZE",     wasThrowing: "ai-scoring", move: "Surf",        winProb: 0.5005753974758989 }, // B7a: Poison Barb; B4a (chance status secondaries) -- Muk's SLUDGE BOMB poisons the Starmie lead 30% (zeroing it alone restores 0.49061960451908687); B6-2: crits (the crits-off engine reproduces the pre-crit universe byte for byte); was 0.47852166204156843
  "Linoone 1":             { tier:  6, lead: "Snorlax", effect: "EFFECT_TICKLE",       wasThrowing: "ai-scoring", move: "Body Slam",   winProb: 0.9825835560876208 }, // B4a (chance status secondaries) -- Linoone's SECRET POWER paralyses the lead 30% -- the Arena is BUILDING (zeroing Secret Power alone restores 0.9934374999999998, 1 ULP from the recorded 0.9934374999999999); B6-2: crits (the crits-off engine reproduces the pre-crit universe byte for byte); was 0.9831071881352187
  "Machoke 2":             { tier:  9, lead: "Snorlax", effect: "EFFECT_FORESIGHT",    wasThrowing: "ai-scoring", move: "Body Slam",   winProb: 0.4525976562499999 }, // B4a (chance status secondaries) -- the lead's BODY SLAM paralyses 30% (zeroing it alone restores 0.3474999999999999); B6-2: crits (the crits-off engine reproduces the pre-crit universe byte for byte); was 0.5519999999999999; C2: the AI roll cache keyed every field (Guts/Marvel Scale status, Foresight, pinch HP) -- the cached engine now equals the uncached one byte for byte; was 0.45874999999999994
  "Hitmonlee 2":           { tier:  9, lead: "Snorlax", effect: "EFFECT_FORESIGHT",    wasThrowing: "ai-scoring", move: "Body Slam",   winProb: 0.05859375 }, // B6-2: crits (the crits-off engine reproduces the pre-crit universe byte for byte); was 0
  "Pinsir 1":              { tier:  9, lead: "Snorlax", effect: "EFFECT_FOCUS_ENERGY", wasThrowing: "ai-scoring", move: "Body Slam",   winProb: 0.6722930896095931 }, // B4a (chance status secondaries) -- the lead's BODY SLAM paralyses 30% (zeroing it alone restores 0.5142531394958496); B6-2: crits (the crits-off engine reproduces the pre-crit universe byte for byte); was 0.6599771976470946
  "Dunsparce 1":           { tier:  6, lead: "Snorlax", effect: "EFFECT_DEFENSE_CURL", wasThrowing: "ai-scoring", move: "Body Slam",   winProb: 0.9536272124449411 }, // B4a (chance status secondaries) -- the lead's BODY SLAM paralyses 30% (zeroing it alone restores 0.99658203125); B4c: Dunsparce's HEADBUTT flinches -- 30% doubled to 60% by SERENE GRACE (zeroing Headbutt alone restores 0.9965820312499999); B6-2: crits (the crits-off engine reproduces the pre-crit universe byte for byte); was 0.9602825520833332
  "Dragonair 1":           { tier:  6, lead: "Snorlax", effect: "EFFECT_DEFENSE_DOWN", wasThrowing: "ai-scoring", move: "Body Slam",   winProb: 0.9973791672951644 }, // B4a (chance status secondaries) -- Dragonair's DRAGONBREATH paralyses the lead 30% (zeroing it alone restores 0.9999999999999998, 1 ULP from the recorded 1); B6-2: crits (the crits-off engine reproduces the pre-crit universe byte for byte); was 0.9972992078463234
  "Caterpie 1":            { tier:  3, lead: "Snorlax", effect: "EFFECT_SPEED_DOWN",   wasThrowing: "ai-scoring", move: "Body Slam",   winProb: 1 },
};

// ── B2A — the sets B2a made solvable ───────────────────────────────────────
// RECORDED LATE. B2a (commit 5e13e2b) landed without a characterization test,
// so these are first recordings taken afterwards, not the values as they stood
// at that commit. See test-b2a-no-dispatch.js's header for the full note.
// Every one of these five was a recorded throw before B2a.
export const B2A = {
  "Espeon 3":    { tier: 31, lead: "Gengar", effect: "EFFECT_METRONOME (no-dispatch)", move: "Ice Punch", winProb: 0.08000000000000002 }, // B8b: Espeon 3 has SYNCHRONIZE -- a Thunderbolt paralysis (the modelled 10%) now paralyses the Gengar lead back; was Thunderbolt 0.025, and the advice FLIPS; B4a (chance status secondaries) -- the Gengar lead's ICE PUNCH freezes 10% and the advice FLIPS from Shadow Ball (zeroing Ice Punch alone restores Shadow Ball 0)
  "Ninetales 2": { tier: 31, lead: "Gengar", effect: "EFFECT_GRUDGE (no-dispatch)",    move: "Thunderbolt", winProb: 0.7408304488658906 }, // B4a (chance status secondaries) -- Ninetales' HEAT WAVE burns the lead 10% (zeroing it alone restores 0.74333125); B6-2: crits (the crits-off engine reproduces the pre-crit universe byte for byte); was 0.7263982421875
  "Xatu 1":      { tier: 12, lead: "Gengar", effect: "EFFECT_TEETER_DANCE/WISH",       move: "Thunderbolt", winProb: 1 },
  "Clefable 2":  { tier: 31, lead: "Gengar", effect: "EFFECT_METRONOME (no-dispatch)", move: "Thunderbolt", winProb: 0.8934018248982764 }, // B7c: holds Focus Band; B8: Clefable 2 has CUTE CHARM and the Gengar lead's Ice Punch makes contact -- 1/3 x gender-compat infatuation; was Ice Punch 0.918450597123913, and the advice FLIPS to the non-contact Thunderbolt; B4a (chance status secondaries) -- the lead's ICE PUNCH now freezes 10% (zeroing Ice Punch alone restores 0.9043094452878824); B4b: the Gengar lead's PSYCHIC now drops SpD 10% (zeroing Psychic alone restores 0.9069523193525368); B6-2: crits (the crits-off engine reproduces the pre-crit universe byte for byte); was 0.9076023913187656
  "Dusclops 4":  { tier: 31, lead: "Gengar", effect: "Ghost-EFFECT_CURSE",             move: "Ice Punch", winProb: 0.05562500000000003 }, // B4a (chance status secondaries) -- the Gengar lead's ICE PUNCH freezes 10% and the advice FLIPS from Thunderbolt (zeroing Ice Punch alone restores Thunderbolt 0.00625); B4b: SHADOW BALL and PSYCHIC jointly (the lead's two SpD drops, Dusclops' own Shadow Ball shares the flag) -- zeroing both restores 0.05120000000000002; Shadow Ball alone gives 0.05248; B6-2: crits (the crits-off engine reproduces the pre-crit universe byte for byte); was 0.05376000000000003
};

// -- MODIFIER_ANCHORS -- promoted from B7a's movers, per amendment 2 --------
// WHY THESE EXIST. The canonical ANCHOR was BLIND to the entire B7a class:
// Metagross holds Cheri Berry, Umbreon 4 holds Leftovers, neither mon has a
// modifier ability, and the anchor did not move by so much as a ULP while 106
// sweep cells moved and 24 changed the recommended move. Amendment 2's rule is
// that a lock which cannot move when the thing under test moves is not a
// fidelity guard for that thing.
//
// HOW THEY WERE CHOSEN. Not by eyeballing the loudest movers. Every one of the
// 106 was attributed CAUSALLY by arena-solver/tools/attribute-movers.mjs, which
// neutralises one candidate at a time and keeps the one that reproduces the pre
// value exactly. That produced 13 distinct causal mechanisms; this table is the
// largest mover from each, so the eleven quiet mechanisms are represented
// alongside Thick Club and Choice Band.
//
// An earlier draft classified movers by PRECEDENCE (first candidate present)
// and got two of these wrong -- Machamp 3 and Typhlosion 1 were filed under
// Guts and Blaze when the real cause in both is the SNORLAX LEAD'S OWN Thick
// Fat. "A modifier is present" and "that modifier moved the number" are
// different claims, and only the second one is recorded here.
//
// KNOWN BLIND SPOT -- and the first version of this note OVERSTATED IT. It said
// Guts, Hustle, Huge Power and Marvel Scale were all structurally unsweepable.
// What was actually true is narrower: none of B7a's 106 movers was ATTRIBUTED to
// those four. That is a different claim from "the panel cannot see them", and
// generalising it from a single lead was wrong.
//
// The right probe is ability-present vs ability-neutralised, per lead. Measured
// over the whole Lv50 pool:
//
//   ability        panel v1   panel v2   where
//   Guts                  2         22   Gengar 2, and Arcanine 20 once burn exists
//   Hustle               13         16   visible on EVERY lead, always was
//   Huge Power            5          7   visible on 4 of 6 leads, always was
//   Marvel Scale          0          0   GENUINELY unsweepable -- see below
//
// So the panel-v2 bump is what made GUTS properly visible (2 -> 22); Hustle and
// Huge Power were never blind. MARVEL SCALE remains at zero on every lead: all
// five carriers are Milotic, and no line the search reaches burns a Milotic and
// then hits it physically inside three turns. It is proven live at the unit
// level instead -- calcDamage gives 49 clean and 33 burned against Milotic 1 --
// and that probe is its only guard.
//
// `pre` is the pre-B7a value and is HISTORY, never asserted. `move`/`winProb`
// are current and ARE asserted. `ability` is the one the sweep resolved
// (abilities[0] where a set has two), spelled out so the row reproduces without
// knowing the adapter's tie-break. Default IV tier throughout.
export const MODIFIER_ANCHORS = {
  "Marowak 3": { lead: "Snorlax", ability: "Rock Head",
    move: "Body Slam", winProb: 0.3435007731119792, // B4a (chance status secondaries) -- the lead's BODY SLAM paralyses 30% (zeroing it alone restores 0.008506944444444442); B6-2: crits (the crits-off engine reproduces the pre-crit universe byte for byte); was 0.3059548611111111
    pre: { move: "Body Slam", winProb: 1 },
    causedBy: "item: Thick Club" },
  "Medicham 1": { lead: "Snorlax", ability: null,
    move: "Body Slam", winProb: 0.1428662134218216, // B7c: also holds Focus Band; B4a (chance status secondaries) -- the lead's BODY SLAM paralyses 30% and the advice FLIPS from Shadow Ball (zeroing Body Slam alone restores Shadow Ball 0.09249908447265623); B6-2: crits (the crits-off engine reproduces the pre-crit universe byte for byte); was 0.136091639881134
    pre: { move: "Shadow Ball", winProb: 1 },
    // HISTORY, never deleted: B7a moved this to 0.02274166870117187 via Pure
    // Power's doubled Attack. B3 batch 1 moved it again, UP, to the value above:
    // Medicham 1 carries HI JUMP KICK, and its crash damage on a miss
    // (DMG_RECOIL_FROM_MISS, capped at the target's maxHP/2) now costs the
    // opponent real HP on the 10% of turns it misses. The player's odds against
    // a set whose main attack can hurt its own user go UP -- which is the point
    // of porting a mechanic that only ever costs its user.
    causedBy: "opponent ability: Pure Power (B7a), then Hi Jump Kick's crash (B3 batch 1)" },
  "Aerodactyl 2": { lead: "Snorlax", ability: "Rock Head",
    move: "Body Slam", winProb: 0.48185661713809164, // B4a (chance status secondaries) -- the lead's BODY SLAM paralyses 30% and the advice FLIPS from Shadow Ball (zeroing Body Slam alone restores Shadow Ball 0); B4b: Aerodactyl's ANCIENTPOWER raises all five 10% (zeroing it alone restores 0.51); B6-2: crits (the crits-off engine reproduces the pre-crit universe byte for byte); was 0.5036181587219238
    pre: { move: "Shadow Ball", winProb: 1 },
    // B7a moved this via Choice Band's 1.5x Attack, to 0.07823631286621092.
    // B2b batch 2 added Choice Band's MOVE LOCK and moved it again, to 0 --
    // locking this opponent into its turn-1 pick is, here, strictly good for it.
    causedBy: "item: Choice Band -- 1.5x Attack (B7a), then its move lock (B2b batch 2)" },
  "Ampharos 1": { lead: "Gengar", ability: null,
    move: "Ice Punch", winProb: 0.12999020391651075, // B4a (chance status secondaries) -- the Gengar lead's ICE PUNCH freezes 10% and the advice FLIPS from Thunderbolt (zeroing Ice Punch alone restores Thunderbolt 0.07934632632522814); B4b: the Gengar lead's PSYCHIC drops SpD 10% (zeroing it alone restores 0.12588574655303236); B6-2: crits (the crits-off engine reproduces the pre-crit universe byte for byte); was 0.12651531436934088
    pre: { move: "Psychic", winProb: 0.49334131133415177 },
    causedBy: "item: Magnet" },
  "Regice 3": { lead: "Snorlax", ability: null,
    move: "Shadow Ball", winProb: 0.9459675342620718, // B4a (chance status secondaries) -- the lead's BODY SLAM paralyses 30% (zeroing it alone restores 0.98062091876287); B6-2: crits (the crits-off engine reproduces the pre-crit universe byte for byte); was 0.9806468547878902 Body Slam, the advice FLIPS
    pre: { move: "Shadow Ball", winProb: 0.8157545010610819 },
    causedBy: "lead ability: Thick Fat" },
  "Ursaring 5": { lead: "Gengar", ability: null,
    move: "Ice Punch", winProb: 0.30729604858398435, // B4a (chance status secondaries) -- the Gengar lead's ICE PUNCH freezes 10% and the advice FLIPS from Psychic (zeroing Ice Punch alone restores Psychic 0.21024999999999996); B6-2: crits (the crits-off engine reproduces the pre-crit universe byte for byte); was 0.27343
    pre: { move: "Thunderbolt", winProb: 0.314569140625 },
    // Choice Band's lock (B2b batch 2) moved this back UP from 0.166375 --
    // the opposite direction to Aerodactyl 2 above, because being locked into
    // its turn-1 pick costs THIS opponent its follow-up.
    causedBy: "item AND ability: Choice Band + Guts, then the Choice lock (B2b batch 2)" },
  "Scizor 4": { lead: "Starmie", ability: null,
    move: "Surf", winProb: 0.6518239395648722, // B4b: Scizor's SILVER WIND raises all five 10% (zeroing it alone restores 0.6736855928174657); B6-2: crits (the crits-off engine reproduces the pre-crit universe byte for byte); was 0.6735178101572199
    pre: { move: "Surf", winProb: 0.7852604166666668 },
    // B7a moved this via Swarm (causally verified). B7c then moved it again,
    // because Scizor 4 also holds a BrightPowder. Both movements named.
    causedBy: "opponent ability: Swarm (B7a), then its BrightPowder (B7c)" },
  "Venusaur 2": { lead: "Starmie", ability: null,
    move: "Ice Beam", winProb: 0.655046733557322, // B6-2: crits (the crits-off engine reproduces the pre-crit universe byte for byte); was 0.6306290589435553; C2: the AI roll cache keyed every field (Guts/Marvel Scale status, Foresight, pinch HP) -- the cached engine now equals the uncached one byte for byte; was 0.6565558956729439
    pre: { move: "Ice Beam", winProb: 0.7748116731927341 },
    // Same shape as Scizor 4: Overgrow in B7a, its BrightPowder in B7c.
    causedBy: "opponent ability: Overgrow (B7a), then its BrightPowder (B7c)" },
  "Rapidash 1": { lead: "Metagross", ability: "Run Away",
    move: "Earthquake", winProb: 0.0009765625,
    pre: { move: "Earthquake", winProb: 0.0625 },
    causedBy: "item: Charcoal" },
  "Blastoise 1": { lead: "Metagross", ability: null,
    move: "Earthquake", winProb: 0.705029042561849, // B6-2: crits (the crits-off engine reproduces the pre-crit universe byte for byte); was 0.7523888888888889; C2: the AI roll cache keyed every field (Guts/Marvel Scale status, Foresight, pinch HP) -- the cached engine now equals the uncached one byte for byte; was 0.7447998046875001
    pre: { move: "Earthquake", winProb: 0.8666666666666667 },
    // B7a moved this to 0.8179444444444444 via Torrent (causally verified).
    // B7b then moved it AGAIN, to the value above, because Blastoise 1 also
    // holds a Shell Bell. Kept as the Torrent anchor because Torrent is what
    // B7a's probe isolated; the second movement is named here rather than
    // hidden by swapping in a cleaner set.
    causedBy: "opponent ability: Torrent (B7a), then its Shell Bell (B7b)" },
  "Muk 1": { lead: "Snorlax", ability: "Stench",
    move: "Shadow Ball", winProb: 0.9351303771720166, // B3-4d: Rest at full HP scores +1, not -2 (BattleScript_AlreadyAtFullHp sets no result flag) -- the Snorlax lead carries Rest; was 0.9618722223090354; B4a (chance status secondaries) -- JOINTLY the lead's BODY SLAM (30% paralysis) and Muk's SLUDGE BOMB (30% poison): zeroing either alone gives 0.9702445626603784 / 0.9719920314178362, neither restores 0.972399478253943; B6-2: crits (the crits-off engine reproduces the pre-crit universe byte for byte); was 0.969875040250244 Earthquake, the advice FLIPS
    pre: { move: "Earthquake", winProb: 0.9816982673274147 },
    causedBy: "item: Poison Barb" },
  "Miltank 3": { lead: "Starmie", ability: null,
    move: "Thunderbolt", winProb: 0.1529533863067627, // B6-2: crits (the crits-off engine reproduces the pre-crit universe byte for byte); was 0.13888000000000003 Ice Beam, the advice FLIPS
    pre: { move: "Ice Beam", winProb: 0.15360000000000004 },
    causedBy: "opponent ability: Thick Fat" },
  "Charizard 4": { lead: "Gengar", ability: null,
    move: "Thunderbolt", winProb: 0.4601318359375, // B4a (chance status secondaries) -- the Gengar lead's ICE PUNCH freezes 10% and the advice FLIPS from Thunderbolt (zeroing Ice Punch alone restores Thunderbolt 0.424140625); B6-2: crits (the crits-off engine reproduces the pre-crit universe byte for byte); was 0.45662500000000006 Ice Punch, the advice FLIPS
    pre: { move: "Thunderbolt", winProb: 0.42414062500000005 },
    causedBy: "opponent ability: Blaze" },
};

// -- B7B_ANCHORS -- the ItemBattleEffects group ----------------------------
// Three anchors, one per item that produces a REAL mover in the 5-lead sweep.
// `pre` is the post-B7a / pre-B7b value and is HISTORY, never asserted.
//
// NAMED BLIND SPOT. B7b implements five effects but only three of them move
// anything here: Petaya Berry, Liechi Berry and White Herb produce ZERO real
// movers across the sweep. That is not a bug and it was checked rather than
// assumed -- test-b7b-item-effects.js probes all five directly and all five
// behave. The panel simply never reaches the states they need: no lead in it
// lowers an opponent's stats (so White Herb has nothing to restore), and no
// Petaya or Liechi carrier survives to a quarter HP against it. Their only
// guards are those unit probes.
export const B7B_ANCHORS = {
  "Metagross 7": { lead: "Starmie", item: "Shell Bell", move: "Thunderbolt", winProb: 0.1501068115234375, // B6-2: crits (the crits-off engine reproduces the pre-crit universe byte for byte); was 0.10944000000000002 Ice Beam, the advice FLIPS
    pre: { move: "Surf", winProb: 1 } },
  "Noland Gold† Metang": { lead: "Gengar", item: "Sitrus Berry", move: "Thunderbolt", winProb: 0.5744353888585464, // B4a (chance status secondaries) -- the Gengar lead's ICE PUNCH freezes 10% (zeroing it alone restores 0.5435139236450196); B6-2: crits (the crits-off engine reproduces the pre-crit universe byte for byte); was 0.5676417495727539
    pre: { move: "Thunderbolt", winProb: 0.9999999999999999 } },
  "Entei 5": { lead: "Metagross", item: "Salac Berry", move: "Earthquake", winProb: 0.7571563720703125, // B4a (chance status secondaries) -- Entei's FIRE BLAST burns the lead 10% (zeroing it alone restores 0.828125); B6-2: crits (the crits-off engine reproduces the pre-crit universe byte for byte); was 0.7723437500000001
    pre: { move: "Earthquake", winProb: 1 } },
};

// -- B7C_ANCHORS -- the accuracy chain -------------------------------------
// All 319 movers attribute causally to ONE mechanism, the opponent's
// BrightPowder, so this table is about depth rather than breadth: the largest
// mover, and a MOVE FLIP, which is the shape that actually changes advice.
//
// NAMED BLIND SPOT. B7c part 1 also ported Compound Eyes (4 sets), Hustle's
// accuracy penalty (6 sets) and fixed the cap-ordering bug, and NONE of the
// three produces a single sweep mover -- the attribution run assigns all 319 to
// BrightPowder alone. Their only guards are the direct probes in
// test-b7c-accuracy-chain.js PARTS 1-3, which pin each multiplier and the
// uncapped ordering by value rather than by hit rate.
export const B7C_ANCHORS = {
  "Registeel 2": { lead: "Salamence", item: "BrightPowder", move: "Earthquake", winProb: 0.7160624999999999, // B4a (chance status secondaries) -- Registeel's ICE PUNCH freezes the lead 10% (zeroing it alone restores 0.8099999999999999); B6-2: crits (the crits-off engine reproduces the pre-crit universe byte for byte); was 0.7452
    pre: { move: "Earthquake", winProb: 1 } },
  // B7c moved this Dragon Claw 0.9301677280002171 -> Earthquake 0.7479850977404471
  // via its BrightPowder. Intimidate then moved it AGAIN -- it is a Salamence
  // cell and the Salamence lead carries Intimidate -- and the recommended move
  // flipped BACK to Dragon Claw. Both movements named rather than one hidden.
  "Lucy Gold Steelix": { lead: "Salamence", item: "BrightPowder", move: "Dragon Claw", winProb: 0.8261465673196424, // B4c: the lead's ROCK SLIDE flinches 30% and the advice FLIPS back to Earthquake (zeroing Rock Slide alone restores Dragon Claw 0.8507291838563511); B6-2: crits (the crits-off engine reproduces the pre-crit universe byte for byte); was 0.8590899118509061 Earthquake, the advice FLIPS
    pre: { move: "Dragon Claw", winProb: 0.9301677280002171 },
    b7cWas: { move: "Earthquake", winProb: 0.7479850977404471 } },
  "Alakazam 4": { lead: "Starmie", item: "BrightPowder", move: "Ice Beam", winProb: 0.7055564625, // B4a (chance status secondaries) -- Alakazam's THUNDERPUNCH paralyses the lead 10% (zeroing it alone restores 0.8231904000000001); B6-2: crits (the crits-off engine reproduces the pre-crit universe byte for byte); was 0.7478928000000001
    pre: { move: "Surf", winProb: 1 } },
};

// -- INTIMIDATE_ANCHORS -----------------------------------------------------
// Intimidate was pulled ahead of the rest of the ability work because it
// corrupts the measuring instrument: the Salamence lead HAS Intimidate, so
// every Salamence absolute recorded before this commit was missing a turn-0
// -1 Attack on the opponent. The deltas in phase-b-log.md survive (the same
// omission sat on both sides of each before/after); the Salamence ABSOLUTES
// did not, and are re-baselined here.
//
// Per-lead movers tell the mechanic's own story: Salamence 115 (its own
// Intimidate), Snorlax 13 (Intimidate-carrying OPPONENTS dropping a physical
// lead's Attack), Metagross / Starmie / Gengar 0 -- Metagross because Clear
// Body blocks it outright, the other two because they attack specially and a
// -1 Attack changes nothing for them.
export const INTIMIDATE_ANCHORS = {
  "Granbull 2": { lead: "Salamence", move: "Rock Slide", winProb: 0.24058690567016602, // B4c: the lead's ROCK SLIDE flinches 30% -- the reversal is no longer complete, and the advice FLIPS from Earthquake (zeroing Rock Slide alone restores Earthquake 0); B6-2: crits (the crits-off engine reproduces the pre-crit universe byte for byte); was 0.15740568000000005
    pre: { move: "Earthquake", winProb: 1 },
    why: "the LEAD's own Intimidate -- a complete reversal" },
  "Salamence 7": { lead: "Snorlax", move: "Body Slam", winProb: 0.18352127075195312, // B4a (chance status secondaries) -- the lead's BODY SLAM paralyses 30% -- the first non-zero odds this cell has had since Intimidate (zeroing Body Slam alone restores 0); B6-2: crits (the crits-off engine reproduces the pre-crit universe byte for byte); was 0.09
    pre: { move: "Body Slam", winProb: 1 },
    why: "an Intimidate OPPONENT dropping a physical lead's Attack" },
  "Aerodactyl 1": { lead: "Salamence", move: "Rock Slide", winProb: 0.724603271484375, // B4b: Aerodactyl's ANCIENTPOWER raises all five 10% (zeroing it alone restores 0.9); B6-2: crits (the crits-off engine reproduces the pre-crit universe byte for byte); was 0.81
    pre: { move: "Rock Slide", winProb: 0 },
    why: "moves in the PLAYER's favour -- the drop is on the opponent" },
  "Granbull 1": { lead: "Metagross", move: "Earthquake", winProb: 0.9999980725466031, // B6-2: crits -- a crit by or on Granbull now exists; Intimidate still moves NOTHING here (Clear Body), which is what this anchor pins; was 1
    pre: { move: "Earthquake", winProb: 1 },
    why: "IMMUNITY ANCHOR: Granbull 1 has Intimidate and Metagross has Clear Body, so this cell must NOT move" },
};

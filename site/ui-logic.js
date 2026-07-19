// UI "brains" — pure functions, no DOM access here (app.js owns the DOM).
// Every number that reaches the screen comes from ../battle_arena_sim's own
// buildMon/buildStartState/search — this file only shapes form state INTO
// engine calls and engine RESULTS into render-friendly objects. No damage,
// stat, or type math is duplicated here.

import { buildMon, buildStartState, search, chooseOpponentMoves } from "../battle_arena_sim/logic.js";
import { getOpponentConfig } from "../battle_arena_sim/opponent-adapter.js";
import { MOVES } from "../battle_arena_sim/move-data.js";
import { scoreReportedTurn } from "../battle_arena_sim/scorekeeper.js";

// matchState shape (the UI's own notion of "what's observed right now" —
// distinct from youConfig/oppConfig, which describe WHO the mon is, not the
// mid-match state it's in):
//   turn, yourHpPct, oppHpPct, yourUsablePartyMons, oppUsablePartyMons,
//   youStages, oppStages (7-key each), youStatus, oppStatus,
//   metagrossConfused, youAttracted (volatile STATUS2 conditions — You side
//   only, the engine has no opponent-side branch for either, see HANDOFF.md),
//   weatherType, weatherTurns,
//   youReflectTurns, oppReflectTurns, youLightScreenTurns, oppLightScreenTurns

export function freshMatchState() {
  return {
    turn: 1,
    yourHpPct: 100, oppHpPct: 100,
    yourUsablePartyMons: 2, oppUsablePartyMons: 2,
    youStages: { atk: 0, def: 0, spa: 0, spd: 0, spe: 0, evasion: 0, accuracy: 0 },
    oppStages: { atk: 0, def: 0, spa: 0, spd: 0, spe: 0, evasion: 0, accuracy: 0 },
    youStatus: null, oppStatus: null,
    metagrossConfused: false, youAttracted: false,
    weatherType: null, weatherTurns: null,
    youReflectTurns: null, oppReflectTurns: null,
    youLightScreenTurns: null, oppLightScreenTurns: null,
  };
}

// The ONLY matchState keys that must NOT reach the engine: the per-turn transient
// scratch fields the engine itself resets every turn via freshTurnDamageTracking
// (logic.js:2145-2150). They are meaningless as a starting observation, so even
// if a future matchState carried one it must not leak into the solve.
//
// Everything else on matchState is a real engine base key and flows through
// untouched. This is a DENYLIST, deliberately NOT an allowlist: buildStartState's
// merge was designed to accept any base key with no gatekeeper
// (HANDOFF.md:1190-1193), so the UI must not re-enumerate which keys exist — a
// prior allowlist here silently dropped mindYou/skillYou (the change #12 bug).
// The denylist makes that whole bug class impossible AND lets the 24 deferred
// inputs (seeded, substituteHP, charging, sleepTurns, …) reach the engine the
// instant a future UI control sets them on matchState — deferring them was a
// UI-source decision, never a boundary block, so no change here is needed later.
const UI_ONLY_KEYS = new Set([
  "youDamageTaken", "oppDamageTaken",             // Counter/Mirror Coat scratch — reset each turn
  "youEndureActive", "oppEndureActive",           // Endure "active this turn" flag — reset each turn
  "youProtected", "oppProtected",                 // Protect "active this turn" flag — reset each turn
  "youDestinyBondActive", "oppDestinyBondActive", // Destiny Bond "armed this turn" flag — reset each turn
]);

export function buildOverrides(matchState) {
  const overrides = {};
  for (const key of Object.keys(matchState)) {
    if (UI_ONLY_KEYS.has(key)) continue;
    overrides[key] = matchState[key];
  }
  return overrides;
}

// The one function that actually calls into the engine. Used UNIFORMLY for
// both "fresh match start" (turn 1, all overrides at their defaults — this
// path is equivalent to calling analyzeMatchup directly, verified by
// Session 4's overrides-equivalence test) and any later live re-solve from an
// observed mid-match state. turnsRemaining = 4 - turn (turn 1 -> 3 remaining,
// turn 2 -> 2, turn 3 -> 1), matching the engine's fixed 3-turn match.
export function solve(youConfig, oppConfig, matchState) {
  const you = buildMon(youConfig);
  // Frontier trainer mons are always max friendship (see Session 3's
  // Return/Frustration fix) — mirrored here exactly as analyzeMatchup does it,
  // since this UI calls buildMon/buildStartState/search directly rather than
  // going through analyzeMatchup's convenience wrapper (needed for the
  // turnsRemaining flexibility analyzeMatchup doesn't expose).
  const opp = buildMon({ ...oppConfig, friendship: 255 });
  const ctx = { you, opp };
  const overrides = buildOverrides(matchState);
  const state = buildStartState({
    yourHpPct: matchState.yourHpPct,
    oppHpPct: matchState.oppHpPct,
    yourUsablePartyMons: matchState.yourUsablePartyMons,
    oppUsablePartyMons: matchState.oppUsablePartyMons,
    you, opp, overrides,
  });
  const turnsRemaining = Math.max(0, 4 - matchState.turn);
  const result = search(ctx, state, turnsRemaining);

  // Opponent's per-turn move-selection distribution — the coaching payload
  // (HANDOFF §14). This is NOT re-derived or approximated: `chooseOpponentMoves`
  // is the exact same already-exported function search() itself calls
  // internally with this exact ctx/state for the CURRENT turn (confirmed by
  // reading search()'s own source before adding this, not assumed) — so this
  // is a real, direct read of the engine's own AI model, not a new computation.
  const oppMoveDist = turnsRemaining > 0 ? chooseOpponentMoves(opp, you, state) : [];

  return { you, opp, state, result, turnsRemaining, oppMoveDist };
}

// Scorekeeper wrapper — the thin config->mon adapter over the shared drive-and-
// read scorer (scorekeeper.js). Builds the two mons EXACTLY as solve() does
// (opp at max friendship, per the Frontier convention) so the scored turn uses
// the same combatants the solver would, then delegates to the one shared
// scoring path. Returns the four signed deltas (+ diagnostic matched counts) to
// ADD to the running "so far" boxes.
export function scoreTurn(youConfig, oppConfig, report) {
  const you = buildMon(youConfig);
  const opp = buildMon({ ...oppConfig, friendship: 255 });
  return scoreReportedTurn(you, opp, report);
}

// Re-export the scorekeeper's report vocabulary so app.js (which imports only
// from this boundary module) can build reports and grey the unsupported cases.
export { OUTCOME, PHASE, UNSUPPORTED_OPP } from "../battle_arena_sim/scorekeeper.js";

// Two-turn (Dive/Fly/Dig/Bounce) detection for the report UI's phase control.
export function isTwoTurnMove(move) {
  return MOVES[move]?.effect === "EFFECT_SEMI_INVULNERABLE";
}

export function resolveOpponentBySetName(setName, abilityOverride) {
  return getOpponentConfig(setName, abilityOverride ? { ability: abilityOverride } : {});
}

// ── Showdown plain-text set format (convention adopted from turskain's
// Import/Export box — see HANDOFF.md §12 — parser/serializer written from
// scratch against THIS project's config shape, not ported). ──

export function serializeToShowdown(config) {
  const lines = [];
  lines.push(config.species + (config.item ? " @ " + config.item : ""));
  if (config.nature) lines.push(config.nature + " Nature");
  if (config.ability) lines.push("Ability: " + config.ability);
  const evParts = [];
  const evOrder = [["hp", "HP"], ["atk", "Atk"], ["def", "Def"], ["spa", "SpA"], ["spd", "SpD"], ["spe", "Spe"]];
  for (const [key, label] of evOrder) {
    if (config.evs && config.evs[key]) evParts.push(config.evs[key] + " " + label);
  }
  if (evParts.length) lines.push("EVs: " + evParts.join(" / "));
  const ivParts = [];
  for (const [key, label] of evOrder) {
    if (config.ivs && config.ivs[key] != null && config.ivs[key] !== 31) ivParts.push(config.ivs[key] + " " + label);
  }
  if (ivParts.length) lines.push("IVs: " + ivParts.join(" / "));
  for (const move of config.moves || []) {
    if (move) lines.push("- " + move);
  }
  return lines.join("\n");
}

const EV_LABEL_TO_KEY = { hp: "hp", atk: "atk", def: "def", spa: "spa", spd: "spd", spe: "spe" };

export function parseShowdownText(text) {
  const lines = text.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
  if (lines.length === 0) throw new Error("Empty set text.");

  const headerMatch = lines[0].match(/^(.+?)(?:\s+@\s+(.+))?$/);
  const species = headerMatch[1].trim();
  const item = headerMatch[2] ? headerMatch[2].trim() : null;

  const config = {
    species, item, level: 50,
    nature: "Hardy", ability: null,
    evs: {}, ivs: {}, moves: [],
  };

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    let m;
    if ((m = line.match(/^(\w+)\s+Nature$/i))) {
      config.nature = m[1];
    } else if ((m = line.match(/^Ability:\s*(.+)$/i))) {
      config.ability = m[1].trim();
    } else if ((m = line.match(/^Level:\s*(\d+)$/i))) {
      config.level = parseInt(m[1], 10);
    } else if ((m = line.match(/^EVs:\s*(.+)$/i))) {
      for (const part of m[1].split("/")) {
        const pm = part.trim().match(/^(\d+)\s+(\w+)$/);
        if (pm) {
          const key = EV_LABEL_TO_KEY[pm[2].toLowerCase()];
          if (key) config.evs[key] = parseInt(pm[1], 10);
        }
      }
    } else if ((m = line.match(/^IVs:\s*(.+)$/i))) {
      for (const part of m[1].split("/")) {
        const pm = part.trim().match(/^(\d+)\s+(\w+)$/);
        if (pm) {
          const key = EV_LABEL_TO_KEY[pm[2].toLowerCase()];
          if (key) config.ivs[key] = parseInt(pm[1], 10);
        }
      }
    } else if ((m = line.match(/^-\s*(.+)$/))) {
      config.moves.push(m[1].trim());
    }
  }

  // Validate move names against the real move dex NOW (fail loud at import
  // time, not silently later at solve time with a confusing engine error).
  for (const move of config.moves) {
    if (!MOVES[move]) throw new Error(`Unknown move "${move}" in imported set — check spelling against move-data.js.`);
  }

  return config;
}

const CUSTOM_SETS_KEY = "arenaAssistantCustomSets";

export function loadCustomSets() {
  try {
    const raw = localStorage.getItem(CUSTOM_SETS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveCustomSet(name, config) {
  const sets = loadCustomSets();
  sets[name] = config;
  localStorage.setItem(CUSTOM_SETS_KEY, JSON.stringify(sets));
}

export function deleteCustomSet(name) {
  const sets = loadCustomSets();
  delete sets[name];
  localStorage.setItem(CUSTOM_SETS_KEY, JSON.stringify(sets));
}

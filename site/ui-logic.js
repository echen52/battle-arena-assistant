// UI "brains" — pure functions, no DOM access here (app.js owns the DOM).
// Every number that reaches the screen comes from ../battle_arena_sim's own
// buildMon/buildStartState/search — this file only shapes form state INTO
// engine calls and engine RESULTS into render-friendly objects. No damage,
// stat, or type math is duplicated here.

import { buildMon, buildStartState, search, chooseOpponentMoves, buildFrontierOpponent } from "../battle_arena_sim/logic.js";
import { getOpponentConfig } from "../battle_arena_sim/opponent-adapter.js";
import { MOVES } from "../battle_arena_sim/move-data.js";
import { scoreReportedTurn } from "../battle_arena_sim/scorekeeper.js";

// matchState shape (the UI's own notion of "what's observed right now" —
// distinct from youConfig/oppConfig, which describe WHO the mon is, not the
// mid-match state it's in):
//   turn, yourHpPct, oppHpPct, yourUsablePartyMons, oppUsablePartyMons,
//   youStages, oppStages (7-key each), youStatus, oppStatus,
//   youConfused / oppConfused (false, true = confused with no checks yet, or
//   the next check 2..5), youAttracted / oppAttracted (volatile STATUS2
//   conditions, two-sided since A5),
//   weatherType, weatherTurns (only when a weather is chosen -- absent means
//     "as the leads' abilities set it at switch-in"),
//   youReflectTurns, oppReflectTurns, youLightScreenTurns, oppLightScreenTurns

export function freshMatchState() {
  return {
    turn: 1,
    yourHpPct: 100, oppHpPct: 100,
    yourUsablePartyMons: 2, oppUsablePartyMons: 2,
    // No youStages / oppStages: absent keys keep the switch-in stages
    // buildStartState derives (Intimidate, White Herb); zeros here overrode them.
    youStatus: null, oppStatus: null,
    youConfused: false, oppConfused: false, youAttracted: false, oppAttracted: false,
    // No weatherType / weatherTurns: absent keys leave the switch-in weather
    // buildStartState derives from the leads' abilities; a null here overrode it.
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
  // The opponent is built exactly as analyzeMatchup builds it, by the engine's
  // own buildFrontierOpponent: a Frontier mon carrying Frustration has
  // friendship 0, every other one 255 (Phase D F11). This UI calls
  // buildMon/buildStartState/search directly rather than analyzeMatchup for
  // the turnsRemaining flexibility analyzeMatchup doesn't expose, so the
  // builder is shared rather than restated. (It used to hardcode 255.)
  const opp = buildFrontierOpponent(oppConfig);
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

// ── The plan: the whole recommended line, from the search tree solve() returns.
// At each level: the recommended move's branches, grouped by what the game
// shows (the engine's own branch label), and in each group the best NEXT move
// -- per branch, from that branch's subtree, so when it depends on HP each
// next move is listed with the HP ranges (percent) it covers. Probabilities
// are conditional on the parent group; `winProb` is the mean P(win) from that
// point. Pure: it reads the retained tree and computes nothing new.
// `nodes` is [{ node, w }]: one node at the root, several (same move) below.
function planOf(nodes, depth) {
  const live = nodes.filter(({ node }) => node && !node.isTerminal && node.allOptions);
  if (live.length === 0) return null;
  const move = live[0].node.move;
  const wTotal = live.reduce((a, x) => a + x.w, 0);
  const groups = new Map();
  for (const { node, w } of live) {
    const opt = node.allOptions.find((o) => o.move === node.move);
    const branchTotal = opt.branches.reduce((a, b) => a + b.prob, 0);
    for (const b of opt.branches) {
      const p = (w / wTotal) * (b.prob / branchTotal);
      const g = groups.get(b.label) ?? { label: b.label, p: 0, branches: [] };
      g.p += p;
      g.branches.push({ b, p });
      groups.set(b.label, g);
    }
  }
  const outcomes = [...groups.values()].sort((x, y) => y.p - x.p).map((g) => {
    const byMove = new Map();
    for (const { b, p } of g.branches) {
      const sub = b.subtree;
      const key = !sub || sub.isTerminal ? "" : sub.move;
      const e = byMove.get(key) ?? { move: key || null, p: 0, winSum: 0, youHp: [Infinity, -Infinity], oppHp: [Infinity, -Infinity], nodes: [] };
      e.p += p;
      e.winSum += p * (sub ? sub.winProb : 0);
      e.youHp = [Math.min(e.youHp[0], b.state.yourHpPct), Math.max(e.youHp[1], b.state.yourHpPct)];
      e.oppHp = [Math.min(e.oppHp[0], b.state.oppHpPct), Math.max(e.oppHp[1], b.state.oppHpPct)];
      e.nodes.push({ node: sub, w: p });
      byMove.set(key, e);
    }
    const next = [...byMove.values()].sort((x, y) => y.p - x.p).map((e) => ({
      move: e.move, p: e.p / g.p, winProb: e.winSum / e.p, youHp: e.youHp, oppHp: e.oppHp,
      plan: depth > 1 && e.move ? planOf(e.nodes, depth - 1) : null,
    }));
    return { label: g.label, p: g.p, next };
  });
  return { move, winProb: live.reduce((a, x) => a + x.w * x.node.winProb, 0) / wTotal, outcomes };
}
// The plan from the current turn: one level per remaining turn after this one.
export function buildPlan(result, turnsRemaining) {
  return planOf([{ node: result, w: 1 }], Math.max(1, turnsRemaining - 1));
}

// Earlier-turn scorer — the thin config->mon adapter over the shared drive-and-
// read scorer (scorekeeper.js). Builds the two mons EXACTLY as solve() does
// (the opponent by buildFrontierOpponent, F11) so the scored turn uses the
// same combatants the solver would. Returns the four signed Mind/Skill deltas.
//
// Swallow and Wish landing are the two reports the drive model refuses
// (scorekeeper validateReport: success is stockpile-gated / delayed, not
// readable from the report). They are scored here by the rule that refusal
// message states, since the page no longer has hand-editable totals: Mind is
// the move's own rating (0 for both), Skill +1 for Swallow whether it heals or
// fails, and for Wish +1 if it worked, -2 if it failed (healed === false). The
// other side is still driven through the engine; the hand-scored side gets a
// Splash stand-in (each side is driven against its own filler, so the stand-in
// never touches the other side's read) and its delta is replaced.
const HAND_SCORED = { EFFECT_SWALLOW: () => 1, EFFECT_WISH: (r) => (r.healed === false ? -2 : 1) };
export function isHandScoredMove(move) {
  return MOVES[move]?.effect in HAND_SCORED;
}
export function scoreTurn(youConfig, oppConfig, report) {
  const you = buildMon(youConfig);
  const opp = buildFrontierOpponent(oppConfig);
  const hand = {}, driven = { ...report };
  for (const side of ["you", "opp"]) {
    const r = report[side], rule = HAND_SCORED[MOVES[r.move]?.effect];
    if (r.outcome !== "HIT" || !rule) continue;
    hand[side] = { mind: MOVES[r.move].mindRating ?? 0, skill: rule(r) };
    driven[side] = { move: "Splash", outcome: "HIT" };
  }
  const d = scoreReportedTurn(you, opp, driven);
  if (hand.you) { d.dMindYou = hand.you.mind; d.dSkillYou = hand.you.skill; }
  if (hand.opp) { d.dMindOpp = hand.opp.mind; d.dSkillOpp = hand.opp.skill; }
  return d;
}

// Re-export the scorekeeper's report vocabulary so app.js (which imports only
// from this boundary module) can build reports and grey the unsupported cases.
export { OUTCOME, PHASE, UNSUPPORTED_OPP, isDrivableHealMove } from "../battle_arena_sim/scorekeeper.js";

// Two-turn (Dive/Fly/Dig/Bounce) detection for the report UI's phase control.
export function isTwoTurnMove(move) {
  return MOVES[move]?.effect === "EFFECT_SEMI_INVULNERABLE";
}

// ivTier: the trainer IV band (amendment 7). A Brain set has its own fixed IVs
// and takes none; the adapter refuses a tier the set cannot appear in.
export function resolveOpponentBySetName(setName, abilityOverride, ivTier = null) {
  return getOpponentConfig(setName, {
    ...(abilityOverride ? { ability: abilityOverride } : {}),
    ...(ivTier != null ? { ivTier } : {}),
  });
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
    // Showdown writes the type in brackets; it has no field for the power
    // (70 is assumed on import, and a saved set keeps the exact value)
    if (move === "Hidden Power" && config.hiddenPower) lines.push(`- Hidden Power [${config.hiddenPower.type}]`);
    else if (move) lines.push("- " + move);
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
    } else if ((m = line.match(/^-\s*Hidden Power\s*\[?\s*([A-Za-z]+)\s*\]?$/i))) {
      // "- Hidden Power [Fire]" (Showdown) or "- Hidden Power Fire"
      const t = m[1][0].toUpperCase() + m[1].slice(1).toLowerCase();
      config.moves.push("Hidden Power");
      config.hiddenPower = { type: t, power: 70 };
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

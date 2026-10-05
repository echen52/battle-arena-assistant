// UI "brains" — pure functions, no DOM access here (app.js owns the DOM).
// Every number that reaches the screen comes from ../battle_arena_sim's own
// buildMon/buildStartState/search — this file only shapes form state INTO
// engine calls and engine RESULTS into render-friendly objects. No damage,
// stat, or type math is duplicated here.

import { buildMon, buildStartState, search, chooseOpponentMoves, buildFrontierOpponent, BERRY_CURE } from "../battle_arena_sim/logic.js";
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
  "youSleepInfo", "oppSleepInfo",                 // what the player saw of a sleep -> sleepCounters, not an engine key
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
  const turnsRemaining = Math.max(0, 4 - matchState.turn);
  const solveWith = (extra) => {
    const state = buildStartState({
      yourHpPct: matchState.yourHpPct,
      oppHpPct: matchState.oppHpPct,
      yourUsablePartyMons: matchState.yourUsablePartyMons,
      oppUsablePartyMons: matchState.oppUsablePartyMons,
      you, opp, overrides: { ...overrides, ...extra },
    });
    // Opponent's per-turn move-selection distribution — the coaching payload
    // (HANDOFF §14). This is NOT re-derived or approximated: `chooseOpponentMoves`
    // is the exact same already-exported function search() itself calls
    // internally with this exact ctx/state for the CURRENT turn — so this
    // is a real, direct read of the engine's own AI model, not a new computation.
    return {
      state, result: search(ctx, state, turnsRemaining),
      oppMoveDist: turnsRemaining > 0 ? chooseOpponentMoves(opp, you, state) : [],
    };
  };

  // A sleep set on the page has no counter (the game hides it), and the engine
  // reads a missing counter as "wakes at its next action" -- so a Sleep status
  // used to change almost nothing. Each sleeping side gets every counter still
  // possible, equally likely (sleepCounters), and the solve is the
  // probability-weighted mix of one search per combination: the same chance
  // node the engine itself puts at a sleep move's 2-5 roll, placed before
  // this turn's choice. As there, later decisions in each search know the
  // counter (the engine's existing simplification after any sleep roll).
  const variants = [{ w: 1, extra: {} }];
  for (const [side, mon] of [["you", you], ["opp", opp]]) {
    const counters = matchState[side + "Status"] === "sleep" && matchState[side + "SleepTurns"] == null
      ? sleepCounters(matchState[side + "SleepInfo"], mon) : null;
    if (!counters) continue;
    const next = [];
    for (const v of variants) for (const c of counters) next.push({ w: v.w / counters.length, extra: { ...v.extra, [side + "SleepTurns"]: c } });
    variants.splice(0, variants.length, ...next);
  }
  const runs = variants.map((v) => ({ w: v.w, ...solveWith(v.extra) }));
  const { state } = runs[0];
  return { you, opp, state, result: mixResults(runs), turnsRemaining, oppMoveDist: mixDist(runs) };
}

// The sleep counters a sleeping mon can still have, from what the player saw:
// a sleep move rolls the counter 2-5 (uniform), Rest sets it to 3; each action
// attempt takes 1 off (2 with Early Bird), and the mon stays asleep through an
// attempt only while the result is above 0 (logic.js enumerateActionOutcomes,
// src/battle_util.c CANCELER_ASLEEP). After `slept` blocked attempts the counter
// is roll - slept*step, and it is at least 1 (else it would have woken). If no
// roll fits (more turns slept than possible), it wakes at its next attempt.
export function sleepCounters(info = {}, mon) {
  const step = mon.ability === "Early Bird" ? 2 : 1;
  const rolls = info.rest ? [3] : [2, 3, 4, 5];
  const left = rolls.map((r) => r - (info.slept ?? 0) * step).filter((c) => c >= 1);
  return left.length ? left : [1];
}

// Mix weighted search results into one: each move's P(win) is the weighted
// mean, and its branches are every run's branches with probabilities scaled by
// that run's weight (so the plan groups them by label like any other branch).
function mixResults(runs) {
  if (runs.length === 1) return runs[0].result;
  const first = runs[0].result;
  if (first.isTerminal) return first;
  const allOptions = first.allOptions.map(({ move }) => {
    const parts = runs.map((r) => ({ w: r.w, o: r.result.allOptions.find((x) => x.move === move) }));
    return {
      move,
      winProb: parts.reduce((a, p) => a + p.w * p.o.winProb, 0),
      branches: parts.flatMap((p) => p.o.branches.map((b) => ({ ...b, prob: b.prob * p.w }))),
    };
  }).sort((a, b) => b.winProb - a.winProb);
  return { ...first, move: allOptions[0].move, winProb: allOptions[0].winProb, allOptions };
}
function mixDist(runs) {
  const byMove = new Map();
  for (const r of runs) for (const { move, prob } of r.oppMoveDist) byMove.set(move, (byMove.get(move) ?? 0) + r.w * prob);
  return [...byMove.entries()].map(([move, prob]) => ({ move, prob })).sort((a, b) => b.prob - a.prob);
}

// ── The plan: the whole recommended line, from the search tree solve() returns.
// At each level: the recommended move's branches, grouped by what the game
// shows (the engine's own branch label), and in each group the best NEXT move
// -- per branch, from that branch's subtree, so when it depends on HP each
// next move is listed with the HP ranges (percent) it covers. Probabilities
// are conditional on the parent group; `winProb` is the mean P(win) from that
// point. Pure: it reads the retained tree and computes nothing new.
// `nodes` is [{ node, w }]: one node at the root, several (same move) below.
function planOf(nodes, depth, end = null) {
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
      const e = byMove.get(key) ?? { move: key || null, p: 0, winSum: 0, youHp: [Infinity, -Infinity], oppHp: [Infinity, -Infinity], nodes: [], wins: { w: 0, hp: 0, tags: new Map() } };
      e.p += p;
      e.winSum += p * (sub ? sub.winProb : 0);
      e.youHp = [Math.min(e.youHp[0], b.state.yourHpPct), Math.max(e.youHp[1], b.state.yourHpPct)];
      e.oppHp = [Math.min(e.oppHp[0], b.state.oppHpPct), Math.max(e.oppHp[1], b.state.oppHpPct)];
      e.nodes.push({ node: sub, w: p });
      // matchup over: how you end if you win (endTag), for the leaf's line
      if (end && (!sub || sub.isTerminal) && sub?.winProb === 1) {
        const st = sub.state ?? b.state, tag = endTag(st, end.start, end.you);
        e.wins.w += p; e.wins.hp += p * st.yourHpPct; e.wins.tags.set(tag, (e.wins.tags.get(tag) ?? 0) + p);
      }
      byMove.set(key, e);
    }
    const next = [...byMove.values()].sort((x, y) => y.p - x.p).map((e) => ({
      move: e.move, p: e.p / g.p, winProb: e.winSum / e.p, youHp: e.youHp, oppHp: e.oppHp,
      plan: depth > 1 && e.move ? planOf(e.nodes, depth - 1, end) : null,
      // how you end if you win: the finished matchup itself, or (on the plan's
      // last level) the rest of the matchup below that move
      ifWin: !end ? null : !e.move ? endOf(e.wins) : depth > 1 ? null : endBelow(e.nodes, end),
    }));
    return { label: g.label, p: g.p, next };
  });
  return { move, winProb: live.reduce((a, x) => a + x.w * x.node.winProb, 0) / wTotal, outcomes };
}
// A branch label as the page shows it. The engine writes every actor in the
// third person ("You uses Return", "You is fast asleep") and its tests and the
// scorekeeper match that text, so the grammar is fixed here, for display only.
// The KO short-circuit label always reads "(opp never acts — KO)", even when
// the opponent moved first and it is you who never acts; it is reworded from
// the first actor.
const YOU_GRAMMAR = [[/^You uses /, "You use "], [/^You is /, "You are "], [/^You hits itself /, "You hit yourself "], [/^You flinches/, "You flinch"]];
export function displayLabel(label) {
  const firstIsYou = /^(bounced: )?You /.test(label);
  return label
    .replace(" (opp never acts — KO)", firstIsYou ? " (Opp never acts — KO)" : " (you never act — KO)")
    .split("; ")
    .map((seg) => {
      const bounced = seg.startsWith("bounced: ") ? "bounced: " : "";
      let body = seg.slice(bounced.length);
      for (const [re, to] of YOU_GRAMMAR) body = body.replace(re, to);
      return bounced + body;
    })
    .join("; ");
}

// A held berry that cures the status (or the confusion) a mon has now cannot
// still be held: it cures at once, at the end of the move that inflicted it
// (logic.js tryCureWithBerry). So a status set on the page with such a berry
// means the berry was eaten earlier.
export function itemMustBeGone(item, status, confused) {
  const cures = BERRY_CURE[item];
  return !!cures && ((status && cures.includes(status)) || (confused && cures.includes("confusion")));
}

// ── How each move leaves you if you win. In the Arena the winner stays in, so
// two moves with the same P(win) can still differ a lot: Rest on turn 3 can
// end at full HP (asleep), Return again at 40%. Read from the same retained
// tree as the plan, under the same win-maximising play -- nothing re-searched.
// A P(win) is shown as a percentage; moves within TIE_MARGIN (1 point) of the
// best count as tied, and among them the one that keeps the most HP is named.
export const TIE_MARGIN = 0.01;
export function winPct(p) {
  if (p >= 1) return "100%";
  if (p <= 0) return "0%";
  const s = (p * 100).toFixed(1);
  return s === "100.0" ? ">99.9%" : s === "0.0" ? "<0.1%" : s + "%";
}
export const bestMoveText = (move, winProb) => `${move}  —  P(win) = ${winPct(winProb)}`;

// What the player carries into the next matchup besides HP: status (a sleep
// counter c means c - 1 more turns asleep, sleepCounters above), confusion,
// and a berry eaten during this matchup.
const STATUS_WORD = { paralysis: "paralyzed", burn: "burned", freeze: "frozen" };
function endTag(st, start, you) {
  const parts = [];
  if (st.youStatus === "sleep") {
    const n = (st.youSleepTurns ?? 1) - 1;
    parts.push(n > 0 ? `asleep ${n} more turn${n > 1 ? "s" : ""}` : "asleep, wakes next turn");
  } else if (st.youStatus === "poison") parts.push(st.youToxicCounter ? "badly poisoned" : "poisoned");
  else if (st.youStatus) parts.push(STATUS_WORD[st.youStatus] ?? st.youStatus);
  if (st.youConfused) parts.push("confused");
  if (you.item && st.youBerryConsumed && !start.youBerryConsumed) parts.push(`${you.item} used`);
  return parts.join(", ");
}
// Win-weighted end states below an option: { w: P(win), hp: mean HP% if you
// win, tags: Map(tag -> P) }. A leaf counts as a win only at P(win) 1 (a judge
// tie or a double KO is a draw, and both leave).
function addWins(acc, option, w, start, you) {
  for (const b of option.branches) {
    const p = w * b.prob, sub = b.subtree;
    if (!(p > 0)) continue;
    if (!sub || sub.isTerminal) {
      if (sub?.winProb !== 1) continue;
      const st = sub.state ?? b.state, tag = endTag(st, start, you);
      acc.w += p; acc.hp += p * st.yourHpPct;
      acc.tags.set(tag, (acc.tags.get(tag) ?? 0) + p);
      continue;
    }
    addWins(acc, sub.allOptions.find((o) => o.move === sub.move), p, start, you);
  }
}
function endOf(acc) {
  if (!(acc.w > 0)) return null;
  const tags = [...acc.tags.entries()].map(([tag, p]) => ({ tag, share: p / acc.w })).sort((a, b) => b.share - a.share);
  return { winP: acc.w, hp: acc.hp / acc.w, tags };
}
// "~95% HP, asleep 2 more turns, Lum Berry used"; a minority tag (under 90% of
// the wins) carries its share. Tags under 10% are left out.
export function describeEnd(e) {
  if (!e) return "—";
  const tags = e.tags.filter((t) => t.tag && t.share >= 0.1)
    .map((t) => (t.share >= 0.9 ? t.tag : `${t.tag} (${Math.round(t.share * 100)}%)`));
  return [`~${Math.round(e.hp)}% HP`, ...tags].join(", ");
}
// Per option of the current turn: its end state if you win, whether it is tied
// with the best, and the healthiest tied move when it beats the pick by 5+ HP.
export function endStates(result, start, you) {
  if (result.isTerminal) return null;
  const best = result.allOptions[0].winProb;
  const rows = result.allOptions.map((o) => {
    const acc = { w: 0, hp: 0, tags: new Map() };
    addWins(acc, o, 1, start, you);
    return { move: o.move, winProb: o.winProb, tied: o.winProb >= best - TIE_MARGIN, end: endOf(acc) };
  });
  const tied = rows.filter((r) => r.tied && r.end);
  const pick = rows[0];
  const healthiest = tied.reduce((a, r) => (r.end.hp > a.end.hp ? r : a), tied[0] ?? pick);
  const gain = healthiest?.end && pick.end ? healthiest.end.hp - pick.end.hp : 0;
  return { rows, tiedCount: rows.filter((r) => r.tied).length, healthier: healthiest !== pick && gain >= 5 ? { move: healthiest.move, gain } : null };
}

function endBelow(nodes, end) {
  const acc = { w: 0, hp: 0, tags: new Map() };
  for (const { node, w } of nodes) if (node && !node.isTerminal) addWins(acc, node.allOptions.find((o) => o.move === node.move), w, end.start, end.you);
  return endOf(acc);
}
// The plan from the current turn: one level per remaining turn after this one.
// With `start` and `you`, a finished matchup also says how you end if you win.
export function buildPlan(result, turnsRemaining, start = null, you = null) {
  return planOf([{ node: result, w: 1 }], Math.max(1, turnsRemaining - 1), start && you ? { start, you } : null);
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
  // Showdown writes "Snorlax (F) @ ...", or "Nickname (Snorlax) (F) @ ...":
  // drop the gender marker (the page does not use it), keep the species.
  let name = headerMatch[1].trim();
  const g = name.match(/\s*\((M|F)\)$/);
  if (g) name = name.slice(0, g.index).trim();
  const nick = name.match(/^.+?\s*\(([^()]+)\)$/);
  const species = nick ? nick[1].trim() : name;
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

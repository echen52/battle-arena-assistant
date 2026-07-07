// ─────────────────────────────────────────────────────────────────────────
// TEAM WORKFLOW — chains analyzeMatchup calls across a full 3-mon Arena run.
//
// Model (confirmed against HANDOFF.md's original design intent): your active
// mon carries its HP forward as long as it keeps WINNING rounds (2-of-3 judge
// categories, exactly what analyzeMatchup's winProb already computes); the
// moment it LOSES a round (faints or loses the judge decision — no
// distinction for advancement purposes), your NEXT team member enters fresh
// against the SAME opponent-index step. The opponent's lineup advances by
// exactly one every round regardless of outcome (their retired mon never
// carries forward, win or lose — a fixed fact about this run format, not
// modeled as configurable).
//
// This file does NOT reimplement any battle mechanic — every number here
// comes from analyzeMatchup's own search. The only thing this module adds is
// orchestration: which round to run next, what state to feed it, and how to
// aggregate/rank the results.
// ─────────────────────────────────────────────────────────────────────────

import { analyzeMatchup, evaluateTerminal } from "./logic.js";

// Walks a branch's `subtree` recursively down to terminal leaves.
// (`result.branches` / `allOptions[i].branches` are themselves one-ply views
// — each branch's `.subtree` is either another non-terminal `{branches}` node
// or a terminal `{state, isTerminal: true}` node; this just flattens that
// into a flat list of {p, state} leaves, matching the shape used everywhere
// else in this project's own investigative scripts this session.)
function collectLeaves(node, cumProb, out) {
  const p = cumProb * node.prob;
  const sub = node.subtree;
  if (sub && sub.isTerminal === false && sub.branches) {
    for (const b of sub.branches) collectLeaves(b, p, out);
  } else {
    const state = sub ? (sub.state ?? node.state) : node.state;
    out.push({ p, state });
  }
}

// Evaluates ONE round: your mon (at a given, REAL HP%) vs one opponent mon.
// Returns the recommended move, the round's real win/tie/loss probabilities
// (from analyzeMatchup's own judge-rule evaluation, not re-derived), and —
// for the win case — both an expected-value and a most-likely-single-value
// summary of your mon's carried-forward HP, computed by walking the
// RECOMMENDED move's own terminal leaves and classifying each with the same
// `evaluateTerminal` the engine itself uses (not a re-implementation).
function evaluateRound({ yourConfig, yourHpPct, oppConfig, yourUsablePartyMons, oppUsablePartyMons }) {
  const r = analyzeMatchup(yourConfig, oppConfig, {
    yourHpPct, oppHpPct: 100, yourUsablePartyMons, oppUsablePartyMons,
  });
  const recommended = r.result.allOptions.find((o) => o.move === r.result.move);
  const leaves = [];
  for (const b of recommended.branches) collectLeaves(b, 1, leaves);

  let winP = 0, tieP = 0, lossP = 0, winHpWeightedSum = 0;
  const winHpBuckets = new Map();
  for (const { p, state } of leaves) {
    const outcome = evaluateTerminal(state);
    if (outcome === 1) {
      winP += p;
      winHpWeightedSum += p * state.yourHpPct;
      const bucket = Math.round(state.yourHpPct * 10) / 10;
      winHpBuckets.set(bucket, (winHpBuckets.get(bucket) || 0) + p);
    } else if (outcome === 0.5) {
      tieP += p;
    } else {
      lossP += p;
    }
  }
  const expectedWinHp = winP > 1e-9 ? winHpWeightedSum / winP : null;
  let modeWinHp = null, modeWinHpProb = 0;
  for (const [hp, p] of winHpBuckets) if (p > modeWinHpProb) { modeWinHpProb = p; modeWinHp = hp; }

  return {
    recommendedMove: r.result.move,
    winP, tieP, lossP,
    expectedWinHp, modeWinHp, modeWinHpProb,
    leaves, // exposed for the carry-forward correctness test
  };
}

// Recursively simulates a full run for ONE fixed team ordering against a
// KNOWN (possibly partial — see teamWorkflow's live-mode use) opponent
// lineup, using expected-HP forward propagation between rounds (an
// approximation — flagged in the design review — needed because a single
// round can have dozens of distinct terminal HP values; using the SAME
// approximation consistently across every candidate ordering keeps the
// RANKING between orderings meaningful even though any single path's exact
// number is illustrative, not guaranteed).
//
// Returns { overallClearProb, plan } where `plan` is a small tree (depth =
// oppLineup.length, branching factor 2 per round: win/lose) — bounded and
// presentable, never the full turn-level branch count.
// `expectedClearHp` (conditional on actually clearing the whole known
// lineup) exists because `overallClearProb` alone turned out NOT to
// discriminate between orderings for a sufficiently deep 3-mon team: if any
// ONE opponent mon can be absorbed by sacrificing a single reserve while the
// other two clear the rest, every ordering ties at the same overall clear
// probability (confirmed empirically while building this — several
// realistic lineups produced 100% for all 6 orderings). Expected final
// survivor HP is a real, meaningful tiebreaker a coach would actually care
// about: two orders that both "always clear the run" are NOT equally good if
// one leaves you at 15% HP against a mon you haven't even seen yet in a
// LONGER real gauntlet, and the other leaves you at 70%.
function simulateRun({ team, oppLineup, teamIndex = 0, teamHpPct = 100, oppIndex = 0, teamUsablePartyMons, oppUsablePartyMons }) {
  if (oppIndex >= oppLineup.length) {
    return { overallClearProb: 1, expectedClearHp: teamHpPct, plan: { outcome: "cleared-known-lineup", finalHpPct: Math.round(teamHpPct * 10) / 10 } };
  }
  if (teamIndex >= team.length) {
    return { overallClearProb: 0, expectedClearHp: null, plan: { outcome: "out-of-team" } };
  }

  const round = evaluateRound({
    yourConfig: team[teamIndex],
    yourHpPct: teamHpPct,
    oppConfig: oppLineup[oppIndex],
    yourUsablePartyMons: team.length - 1 - teamIndex,
    oppUsablePartyMons,
  });

  const nonLossP = round.winP + round.tieP; // ties treated as "you continue" for planning — see caveat in the report
  const winBranch = nonLossP > 1e-9
    ? simulateRun({
        team, oppLineup,
        teamIndex, teamHpPct: round.expectedWinHp ?? teamHpPct,
        oppIndex: oppIndex + 1,
        teamUsablePartyMons, oppUsablePartyMons: oppUsablePartyMons - 1,
      })
    : { overallClearProb: 0, expectedClearHp: null, plan: { outcome: "unreachable" } };
  const loseBranch = round.lossP > 1e-9
    ? simulateRun({
        team, oppLineup,
        teamIndex: teamIndex + 1, teamHpPct: 100,
        oppIndex: oppIndex + 1,
        teamUsablePartyMons, oppUsablePartyMons: oppUsablePartyMons - 1,
      })
    : { overallClearProb: 0, expectedClearHp: null, plan: { outcome: "unreachable" } };

  const overallClearProb = nonLossP * winBranch.overallClearProb + round.lossP * loseBranch.overallClearProb;
  const clearWeightSum = nonLossP * winBranch.overallClearProb + round.lossP * loseBranch.overallClearProb;
  const expectedClearHp = clearWeightSum > 1e-9
    ? (nonLossP * winBranch.overallClearProb * (winBranch.expectedClearHp ?? 0) +
       round.lossP * loseBranch.overallClearProb * (loseBranch.expectedClearHp ?? 0)) / clearWeightSum
    : null;

  return {
    overallClearProb,
    expectedClearHp,
    plan: {
      teamIndex, teamMon: team[teamIndex].species, teamHpPct: Math.round(teamHpPct * 10) / 10,
      oppIndex, oppMon: oppLineup[oppIndex].species,
      recommendedMove: round.recommendedMove,
      winP: round.winP, tieP: round.tieP, lossP: round.lossP,
      expectedWinHp: round.expectedWinHp, modeWinHp: round.modeWinHp, modeWinHpProb: round.modeWinHpProb,
      ifWin: nonLossP > 1e-9 ? winBranch.plan : null,
      ifLose: round.lossP > 1e-9 ? loseBranch.plan : null,
    },
  };
}

function permutations(arr) {
  if (arr.length <= 1) return [arr];
  const out = [];
  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    for (const p of permutations(rest)) out.push([arr[i], ...p]);
  }
  return out;
}

// Evaluates EVERY ordering of `team` against the known opponent lineup and
// ranks them: primarily by overall clear probability, THEN (this is the part
// that turned out to matter — see simulateRun's comment) by expected final
// survivor HP conditional on clearing, so that orderings which all "always
// clear the run" are still meaningfully distinguished by how much margin
// they leave you.
function chooseBestOrder({ team, oppLineup, teamUsablePartyMons }) {
  const orders = permutations(team.map((_, i) => i));
  const results = orders.map((order) => {
    const orderedTeam = order.map((i) => team[i]);
    const { overallClearProb, expectedClearHp, plan } = simulateRun({
      team: orderedTeam, oppLineup,
      teamUsablePartyMons, oppUsablePartyMons: oppLineup.length - 1,
    });
    return { order: order.map((i) => team[i].species), overallClearProb, expectedClearHp, plan };
  });
  results.sort((a, b) => {
    if (Math.abs(a.overallClearProb - b.overallClearProb) > 1e-9) return b.overallClearProb - a.overallClearProb;
    return (b.expectedClearHp ?? -1) - (a.expectedClearHp ?? -1);
  });
  return results;
}

export { evaluateRound, simulateRun, chooseBestOrder, collectLeaves };

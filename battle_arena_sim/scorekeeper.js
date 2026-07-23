// ── scorekeeper.js ─────────────────────────────────────────────────────────
// DRIVE-model Mind/Skill scorekeeper — DRIVE-AND-READ against the real engine.
//
// ONE scoring path, shared verbatim by the widget and the mapping test: for a
// reported turn, construct the OBSERVABLE state, drive the real `resolveTurn`
// (the function that banks Mind/Skill during search), and read the score it
// BANKS to the acting side off the matching branch. There is NO second copy of
// the scoring rules — the engine's own turn walk IS the scorer.
//
// Each side is scored INDEPENDENTLY by a single-side drive: the actor uses its
// reported move, the foe uses a benign filler, and the actor's reported outcome
// is forced by observable state (status/charging/foe-protected) + the move and
// the loaded defender (types/ability, from which the engine derives
// effectiveness and ability blocks — the player never reports those).
//
// SELECTION GUARD — value-agreement (identical at runtime and in the test):
// filter branches on the actor's reported-outcome fragment, require the distinct
// banked-score set for the scored side to have size 1, then read the delta from
// any matching branch. This is robust to the three benign forks that make a
// branch COUNT > 1 while the scored value stays constant — foe-accuracy rolls,
// secondary-effect sub-branches, and KO-before-foe-acts (whose branch simply
// doesn't match the actor's action fragment). It fails LOUD only when matched
// branches genuinely DISAGREE — the real silent-wrong-branch risk.

import { buildStartState, resolveTurn } from "./logic.js";
import { MOVES } from "./move-data.js";

// Status moves whose SUCCESS — and therefore Skill — is HP-dependent: they FAIL
// at full HP (the 100% the drive assumes by default) but a player reports them
// BECAUSE they succeeded at low HP. Split by DRIVABILITY:
//
//   DRIVABLE_HEAL_EFFECTS — the six backed by a real executor (healHalfMaxHp /
//   Rest). These CAN be driven to BOTH branches and the Skill read off them:
//   at full HP the executor returns "failed" -> Skill -2; at any sub-full HP it
//   heals -> Skill +1 (a CONSTANT — the award does not vary with heal magnitude,
//   verified stable across 1..99% HP). So instead of failing loud, a reported
//   heal drives the SELECTED branch: the "Did it heal?" answer picks the HP
//   setpoint (full -> failed, sub-full -> healed). This is branch SELECTION, not
//   HP inference — the widget never reads an HP box, and because +1 is
//   HP-independent the arbitrary sub-full value never leaks into the score.
//   Mind is always 0 (status moves), so nothing is lost. EFFECT_INGRAIN is
//   excluded: it lands regardless of current HP (a setup move), not HP-gated.
//
//   HEAL_UNMODELED_EFFECTS — Swallow and Wish have NO executor at all (driving
//   throws "no execution logic yet"), AND their success is not HP-gated-at-cast
//   anyway (Swallow is stockpile-gated, Wish heals on a LATER turn). They stay
//   hand-scored, with a message that says exactly that — so it is never mistaken
//   for the silent -2/+1 bug the drivable path fixes.
const DRIVABLE_HEAL_EFFECTS = new Set([
  "EFFECT_RESTORE_HP", "EFFECT_SOFTBOILED", "EFFECT_REST",
  "EFFECT_MORNING_SUN", "EFFECT_SYNTHESIS", "EFFECT_MOONLIGHT",
]);
const HEAL_UNMODELED_EFFECTS = new Set(["EFFECT_SWALLOW", "EFFECT_WISH"]);

// Surfaced so the UI shows its "Did it heal?" control for exactly these six
// (and, per the widget's design, only on the You side).
export function isDrivableHealMove(moveName) {
  return DRIVABLE_HEAL_EFFECTS.has(MOVES[moveName]?.effect);
}

// Benign filler for the non-scored side: occupies the foe slot so resolveTurn
// runs a real turn. Its own outcome is irrelevant (never read) and it is weak
// enough that when it KOs the actor those branches simply fail to match the
// actor's action fragment and drop out of the matched set. Must be an engine-
// handled move (Splash is NOT — EFFECT_SPLASH has no executor and throws).
const FILLER_MOVE = "Tackle";

// Non-damaging self-target filler used ONLY on the heal-drive path. A DAMAGING
// filler (Tackle) contaminates the full-HP "failed" drive: if the faster foe's
// hit lands it drops the actor below full, so the heal then SUCCEEDS (+1) —
// while a miss leaves it at full and the heal FAILS (-2), a genuine [+1,-2]
// branch DISAGREEMENT the value-agreement guard would (correctly) throw on.
// Harden (power 0, accuracy null -> no hit/miss split, targets the foe's OWN
// Defense and never the actor's HP) leaves the actor's HP set solely by the
// setpoint below, collapsing both branches to a single clean match (matched=1).
const HEAL_FILLER_MOVE = "Harden";
// HP setpoints that SELECT the reported heal branch. Full HP -> the executor
// returns "failed"; any sub-full HP -> the heal succeeds. 50 is an arbitrary
// sub-full value — safe precisely because +1 is HP-independent (see above), so
// which sub-full number we pick never affects the banked Skill.
const HEAL_HP_FAILED = 100;
const HEAL_HP_HEALED = 50;

// Foe move used to force a Protect-block of the ACTOR's move. It must be a real
// Protect/Detect the foe actually USES this turn: `oppProtected`/`youProtected`
// are per-turn scratch that freshTurnDamageTracking wipes at turn start
// (logic.js:2148), so a pre-set flag never survives — the engine has to set it
// itself from the foe's Detect action (priority, resolves before the actor's
// move, blocking it). Turn 1 has no prior Protect, so Detect always succeeds.
const FOE_PROTECT_MOVE = "Detect";

// Per-side reportable outcomes — exactly what a person observes. Effectiveness
// is NEVER among them: the engine derives it from move type + defender types.
export const OUTCOME = {
  HIT: "HIT",                       // landed (engine derives eff / ability block)
  MISSED: "MISSED",                 // accuracy miss
  PROTECT: "PROTECT",               // this side's move blocked by the FOE's Protect/Detect
  IMMOBILIZED: "IMMOBILIZED",       // couldn't act: para/freeze/sleep (Mind banks, Skill 0)
  CONFUSION_SELF: "CONFUSION_SELF", // hurt itself in confusion (You side only)
  ATTRACT: "ATTRACT",               // immobilized by love (You side only)
};

// Two-turn phases, reported in GAME TERMS by the UI ("submerged"/"surfaced").
export const PHASE = { CHARGE: "CHARGE", ATTACK: "ATTACK" };

// Reports the drive model CANNOT score for a given side (no engine branch to
// force). The UI greys these and offers "score by hand"; it must never silently
// substitute a same-shape neighbor.
//   - CONFUSION_SELF / ATTRACT on the OPPONENT: engine models these You-side only.
//   - FLINCH (either side): no flinch model in the engine at all — not an
//     OUTCOME value here; the UI offers it only as a greyed hand-score affordance.
export const UNSUPPORTED_OPP = new Set([OUTCOME.CONFUSION_SELF, OUTCOME.ATTRACT]);

const actorTag = (side) => (side === "you" ? "You" : "Opp");

// The label segment describing `who`. resolveTurn joins the two actors'
// describeAction strings with "; " (a KO short-circuit yields a single actor
// segment ending in "(opp never acts — KO)"). Returns null when this actor has
// no segment — e.g. it was KO'd before it could act.
function actorSegment(label, who) {
  for (const seg of label.split("; ")) if (seg.startsWith(who + " ")) return seg;
  return null;
}

// Does this actor's label segment represent the reported outcome? Mirrors
// describeAction (logic.js:2157-2166): a power-0 status move that lands is the
// BARE "{who} uses {move}" (no suffix), damaging moves add "(hits)"/"(hits Nx)"/
// "(MISSES)", prevented/self-hit are fixed strings. HIT = "acted and it was not
// a miss/block" — covers bare status-land, a normal hit, and a multi-hit; a
// Protect-block and an accuracy miss both read as "(MISSES)". Matching the
// ACTOR's own segment (not the whole label) avoids cross-actor contamination,
// and the "(MISSES)" exclusion avoids the bare-status-land string being a prefix
// of the miss string.
function segmentMatchesOutcome(seg, who, move, outcome) {
  if (seg == null) return false;
  switch (outcome) {
    case OUTCOME.HIT:
      return seg.startsWith(`${who} uses ${move}`) && !seg.includes("(MISSES)");
    case OUTCOME.MISSED:
    case OUTCOME.PROTECT:
      return seg.includes(`${who} uses ${move} (MISSES)`);
    case OUTCOME.IMMOBILIZED:
      return seg.startsWith(`${who} is fully paralyzed`); // para/freeze share this; sleep scores identically
    case OUTCOME.CONFUSION_SELF:
      return seg.startsWith(`${who} hits itself in confusion`);
    case OUTCOME.ATTRACT:
      return seg.startsWith(`${who} is immobilized by love`);
    default:
      throw new Error(`scorekeeper: unknown outcome "${outcome}"`);
  }
}

// Set the observable state that forces the actor's reported outcome. The engine
// derives every internal flag (hit/miss/blockedByProtect/ability block/eff) from
// this state + the move + the loaded defender — the widget never hand-picks a flag.
function applySideConditions(s, actorSide, r) {
  const isYou = actorSide === "you";
  if (r.outcome === OUTCOME.IMMOBILIZED) s[isYou ? "youStatus" : "oppStatus"] = "paralysis";
  if (r.outcome === OUTCOME.CONFUSION_SELF && isYou) s.metagrossConfused = true;
  if (r.outcome === OUTCOME.ATTRACT && isYou) s.youAttracted = true;
  // PROTECT is NOT set here — the flag would be wiped at turn start; the foe
  // drives a real Detect instead (see scoreSide's foe-move selection).
  if (r.phase === PHASE.ATTACK) s[isYou ? "youCharging" : "oppCharging"] = { move: r.move, invulnBit: "underwater" };
}

// Single-side drive-and-read. Returns { mind, skill, matchedCount } — the banked
// delta for the acting side plus how many branches matched (diagnostic only; the
// GUARD is value-agreement, not a count).
function scoreSide(actorSide, actorMon, foeMon, sideReport) {
  const isYou = actorSide === "you";
  const you = isYou ? actorMon : foeMon;
  const opp = isYou ? foeMon : actorMon;

  // HP-dependent heal reported as a HIT (with a "Did it heal?" answer): drive
  // the SELECTED branch rather than the default full-HP one. Requires the
  // non-damaging filler (so the actor's HP is set solely by the setpoint) plus
  // an actor-HP override that reaches the reported branch (full -> failed,
  // sub-full -> healed). Any other outcome/move keeps the standard drive.
  const isHealDrive = sideReport.outcome === OUTCOME.HIT && isDrivableHealMove(sideReport.move);

  // The foe uses the benign filler — the NON-DAMAGING one on a heal drive, else
  // Tackle — unless the actor reported a Protect-block, in which case the foe
  // must actually Detect to make the engine block the actor's move (the pre-set
  // flag is wiped at turn start).
  const foeMove = isHealDrive
    ? HEAL_FILLER_MOVE
    : sideReport.outcome === OUTCOME.PROTECT ? FOE_PROTECT_MOVE : FILLER_MOVE;
  const yourMove = isYou ? sideReport.move : foeMove;
  const oppMove = isYou ? foeMove : sideReport.move;

  const startOpts = { you, opp }; // scores 0; HP defaults 100/100 (Mind/Skill are HP-independent)
  if (isHealDrive) startOpts[isYou ? "yourHpPct" : "oppHpPct"] = sideReport.healed ? HEAL_HP_HEALED : HEAL_HP_FAILED;
  const s = buildStartState(startOpts);
  applySideConditions(s, actorSide, sideReport);

  const branches = resolveTurn({ you, opp }, s, yourMove, oppMove);
  const who = actorTag(actorSide);
  const matched = branches.filter((b) => segmentMatchesOutcome(actorSegment(b.label, who), who, sideReport.move, sideReport.outcome));
  const mindKey = isYou ? "mindYou" : "mindOpp";
  const skillKey = isYou ? "skillYou" : "skillOpp";

  if (matched.length === 0) {
    throw new Error(`scorekeeper: no branch matched the ${actorSide} report (${sideReport.move} / ${sideReport.outcome}).\n  labels:\n   ${branches.map((b) => b.label).join("\n   ")}`);
  }
  const distinct = [...new Set(matched.map((b) => `${b.state[mindKey]}/${b.state[skillKey]}`))];
  if (distinct.length !== 1) {
    throw new Error(`scorekeeper: matched branches DISAGREE on the ${actorSide} banked score for (${sideReport.move} / ${sideReport.outcome}): ${distinct.join(" ; ")} — refusing to guess.`);
  }
  return { mind: matched[0].state[mindKey], skill: matched[0].state[skillKey], matchedCount: matched.length };
}

// Validate a report before scoring — reject the unforceable opponent-side cases
// loudly rather than silently mis-scoring them.
function validateReport(report) {
  for (const side of ["you", "opp"]) {
    const r = report[side];
    if (!r || !r.move || !r.outcome) throw new Error(`scorekeeper: report.${side} needs { move, outcome }.`);
    if (r.outcome !== OUTCOME.HIT) continue;
    const effect = MOVES[r.move]?.effect;
    if (HEAL_UNMODELED_EFFECTS.has(effect)) {
      // Deliberately NOT the drivable-heal path: no engine executor exists, and
      // success is not HP-gated at cast (Swallow is stockpile-gated, Wish heals
      // a later turn). Kept hand-scored — message spells out WHY it differs so
      // it's not mistaken for the silent -2/+1 bug the heal control resolves.
      throw new Error(`scorekeeper: "${r.move}" (${effect}) is NOT the HP-dependent-heal case — it has no engine executor and its success is stockpile-gated (Swallow) / delayed to a later turn (Wish), not HP-gated at cast. Score this side by hand: Mind +0, Skill +1 if it worked, -2 if it failed.`);
    }
    if (DRIVABLE_HEAL_EFFECTS.has(effect) && typeof r.healed !== "boolean") {
      // A drivable heal reported as a HIT but with no "Did it heal?" answer.
      // The You-side control supplies it; an opponent's heal has no control
      // (the widget is You-side only), so it lands here and is hand-scored.
      throw new Error(`scorekeeper: "${r.move}" is an HP-dependent heal — its Skill needs the "Did it heal?" answer to pick the branch. The heal control is You-side only; score an opponent's heal by hand (Mind +0, Skill +1 if it healed, -2 if it failed).`);
    }
  }
  if (UNSUPPORTED_OPP.has(report.opp.outcome)) {
    throw new Error(`scorekeeper: "${report.opp.outcome}" is not modeled for the opponent (the engine has no opponent-side branch) — score this turn by hand.`);
  }
}

// The single shared entry point. report = { you: {move, outcome, phase?},
// opp: {move, outcome, phase?} }. Returns the four signed deltas to ADD to the
// running "so far" boxes, plus per-side matched counts (diagnostic).
export function scoreReportedTurn(youMon, oppMon, report) {
  validateReport(report);
  const y = scoreSide("you", youMon, oppMon, report.you);
  const o = scoreSide("opp", oppMon, youMon, report.opp);
  return {
    dMindYou: y.mind, dSkillYou: y.skill,
    dMindOpp: o.mind, dSkillOpp: o.skill,
    matchedYou: y.matchedCount, matchedOpp: o.matchedCount,
  };
}

// ── test-b2b2-move-restriction.js ─────────────────────────────────────────
// B2b batch 2: the move-restriction family.
//
//   EFFECT_DISABLE   AI_CBM_Disable  :418-421 / AI_CV_Disable  :1602-1617
//   EFFECT_ENCORE    AI_CBM_Encore   :422-425 / AI_CV_Encore   :1687-1702
//   EFFECT_TORMENT   AI_CBM_Torment  :527-530 / (no CV row)
//   EFFECT_IMPRISON  AI_CBM_Imprison :559-562 / AI_CV_Imprison :2506-2513
//
// Plus CHOICE BAND'S MOVE LOCK, which belongs here and not with B7a: it is the
// `choicedMove` clause of the same CheckMoveLimitations function
// (src/battle_util.c:1119) that Disable, Torment, Taunt, Imprison and Encore
// live in. B7a ported Choice Band's 1.5x Attack; this is its other half.
//
// tauntLegalMoves is gone, replaced by selectableMoves, which implements that
// whole function in source's order.
import {
  AI_HANDLERS, buildMon, buildStartState, resolveTurn, applyMove,
  chooseOpponentMoves, skillDelta,
} from "./logic.js";
import { ENCORE_ENCOURAGED_EFFECTS } from "./ai-tables.js";

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } };
const ev = (d) => (Array.isArray(d) ? d.reduce((a, x) => a + x.p * x.delta, 0) : d);

const mk = (over = {}) => buildMon({
  species: "Kadabra", level: 50, nature: "Timid", evs: { spa: 252, spe: 252 },
  ability: "Synchronize", item: null,
  moves: ["Disable", "Psychic", "Thunder Wave", "Encore"], friendship: 255, ...over,
});
const foe = (over = {}) => buildMon({
  species: "Snorlax", level: 50, nature: "Adamant", evs: { hp: 252, atk: 252 },
  ability: "Thick Fat", item: null,
  moves: ["Body Slam", "Earthquake", "Shadow Ball", "Rest"], friendship: 255, ...over,
});

const neutralCtx = () => ({
  userHpPct: 100, targetHpPct: 100, targetFaster: false,
  targetHasDisabledMove: false, targetHasEncoredMove: false,
  targetTormented: false, userImprisoning: false,
  targetLastMoveHadPower: false, targetLastMoveEffect: null,
  userPastFirstTurn: false,
});

console.log("-- PART 1: the four handlers respond to what source reads --");
{
  const H = AI_HANDLERS;
  ok(H.EFFECT_DISABLE.checkBadMove({ ...neutralCtx(), targetHasDisabledMove: true }) === -8,
    "Disable into an already-disabled target is Score_Minus8, not Minus10");
  ok(H.EFFECT_ENCORE.checkBadMove({ ...neutralCtx(), targetHasEncoredMove: true }) === -8,
    "Encore into an already-encored target is Score_Minus8");
  ok(H.EFFECT_TORMENT.checkBadMove({ ...neutralCtx(), targetTormented: true }) === -10,
    "Torment into an already-tormented target is Score_Minus10");
  ok(H.EFFECT_IMPRISON.checkBadMove({ ...neutralCtx(), userImprisoning: true }) === -10,
    "Imprison while ALREADY imprisoning is Score_Minus10 -- the flag is on the USER");
  ok(H.EFFECT_IMPRISON.checkBadMove(neutralCtx()) === 0, "...and 0 otherwise");

  // AI_CV_Disable: a status (or absent) last move scores DOWN, a damaging one +1.
  const dFast = ev(H.EFFECT_DISABLE.checkViability({ ...neutralCtx(), targetFaster: true }));
  const dPower = ev(H.EFFECT_DISABLE.checkViability({ ...neutralCtx(), targetLastMoveHadPower: true }));
  const dStatus = ev(H.EFFECT_DISABLE.checkViability(neutralCtx()));
  ok(dFast === 0, `a faster target ends the script with no change (got ${dFast})`);
  ok(dPower === 1, `a damaging last move scores +1 (got ${dPower})`);
  ok(dStatus < 0, `a status or absent last move scores down (got ${dStatus})`);
  console.log(`   AI_CV_Disable E[delta]: faster ${dFast}, last move damaging ${dPower}, last move status ${dStatus.toFixed(4)}`);

  // AI_CV_Encore reads the 62-effect table, which is GENERATED from source.
  // 62 raw entries, 61 DISTINCT: source lists EFFECT_SKILL_SWAP twice
  // (data/battle_ai_scripts.s:1704-1765). Inert -- the table is a membership
  // test -- but it is a real property of the data, so it is asserted rather
  // than quietly absorbed by the Set.
  ok(ENCORE_ENCOURAGED_EFFECTS.size === 61,
    `the encore table must carry 61 DISTINCT effects, 62 raw with EFFECT_SKILL_SWAP duplicated (got ${ENCORE_ENCOURAGED_EFFECTS.size})`);
  ok(ENCORE_ENCOURAGED_EFFECTS.has("EFFECT_SKILL_SWAP"), "the duplicated entry is still present once");
  ok(ENCORE_ENCOURAGED_EFFECTS.has("EFFECT_SPLASH"), "Splash is in the encouraged table (locking a foe into it is good)");
  ok(!ENCORE_ENCOURAGED_EFFECTS.has("EFFECT_HIT"), "a plain damaging move is NOT");
  const eGood = ev(H.EFFECT_ENCORE.checkViability({ ...neutralCtx(), targetLastMoveEffect: "EFFECT_SPLASH" }));
  const eBad = ev(H.EFFECT_ENCORE.checkViability({ ...neutralCtx(), targetLastMoveEffect: "EFFECT_HIT" }));
  const eDisabled = ev(H.EFFECT_ENCORE.checkViability({ ...neutralCtx(), targetLastMoveEffect: "EFFECT_HIT", targetHasDisabledMove: true }));
  ok(eGood > 0 && eBad === -2, `encouraged ${eGood.toFixed(4)} must be positive, unencouraged exactly -2 (got ${eBad})`);
  ok(eDisabled === eGood, "a target with a disabled move reaches the SAME +3 block regardless of its last move");
  console.log(`   AI_CV_Encore E[delta]: encouraged ${eGood.toFixed(4)}, not ${eBad}, target-already-disabled ${eDisabled.toFixed(4)}`);

  // AI_CV_Imprison withholds its bonus on the user's own first turn out.
  ok(ev(H.EFFECT_IMPRISON.checkViability(neutralCtx())) === 0, "no bonus on the user's first turn");
  ok(ev(H.EFFECT_IMPRISON.checkViability({ ...neutralCtx(), userPastFirstTurn: true })) > 0, "bonus afterwards");
}

console.log();
console.log("-- PART 2: the executors, and what each one refuses --");
{
  const you = mk(), opp = foe();
  const ctx = { you, opp };
  const fresh = (ov) => buildStartState({ you, opp, overrides: ov });

  // Disable needs the target to HAVE a last move that is still in its set.
  {
    const s = fresh();
    const before = s.skillYou;
    applyMove(ctx, s, "you", "Disable", true, false);
    ok(s.oppDisabledMove === null, "Disable on turn 1 must FAIL -- the target has not moved yet");
    ok(s.skillYou - before === skillDelta("noEffect"), "...and score as noEffect");

    const armed = fresh({ oppLastMove: "Body Slam" });
    applyMove(ctx, armed, "you", "Disable", true, false, false, false, false, false, null, null, false, false, false, null, null, false, 3);
    ok(armed.oppDisabledMove === "Body Slam", `Disable must lock the target's last move (got ${armed.oppDisabledMove})`);
    ok(armed.oppDisableTurns === 3, "and store the timer it was given");

    const again = { ...armed };
    const beforeAgain = again.skillYou;
    applyMove(ctx, again, "you", "Disable", true, false, false, false, false, false, null, null, false, false, false, null, null, false, 3);
    ok(again.skillYou - beforeAgain === skillDelta("noEffect"), "a second Disable must fail");
  }

  // Encore refuses Struggle / Encore / Mirror Move, and refuses to stack.
  {
    const s = fresh({ oppLastMove: "Body Slam" });
    applyMove(ctx, s, "you", "Encore", true, false);
    ok(s.oppEncoredMove === "Body Slam", "Encore must lock the target's last move");
    ok(s.oppEncoreTurns === 3, "the timer is stored as 3, the minimum of the inert 3..6 range");
    const mirror = fresh({ oppLastMove: "Mirror Move" });
    applyMove(ctx, mirror, "you", "Encore", true, false);
    ok(mirror.oppEncoredMove === null, "Encore must refuse Mirror Move");
  }

  // Torment does not stack.
  {
    const s = fresh();
    const tormenter = mk({ moves: ["Torment", "Psychic", "Thunder Wave", "Encore"] });
    const c2 = { you: tormenter, opp };
    const s2 = buildStartState({ you: tormenter, opp });
    applyMove(c2, s2, "you", "Torment", true, false);
    ok(s2.oppTormented === true, "Torment must set the flag");
    const before = s2.skillYou;
    applyMove(c2, s2, "you", "Torment", true, false);
    ok(s2.skillYou - before === skillDelta("noEffect"), "a second Torment must fail");
    ok(s.oppTormented === false, "and an untouched state must be unaffected");
  }

  // Imprison needs a SHARED move, which is source's own stated Gen III rule.
  {
    const sharer = mk({ moves: ["Imprison", "Body Slam", "Psychic", "Encore"] });
    const c3 = { you: sharer, opp };
    const s3 = buildStartState({ you: sharer, opp });
    applyMove(c3, s3, "you", "Imprison", true, false);
    ok(s3.youImprisoning === true, "Imprison must succeed when a move is shared (Body Slam)");

    const loner = mk({ moves: ["Imprison", "Psychic", "Thunder Wave", "Encore"] });
    const c4 = { you: loner, opp };
    const s4 = buildStartState({ you: loner, opp });
    applyMove(c4, s4, "you", "Imprison", true, false);
    ok(s4.youImprisoning === false, "and FAIL when no move is shared");
  }
}

console.log();
console.log("-- PART 3: selectableMoves removes what source removes --");
{
  const you = mk(), opp = foe();
  const sel = (ov) => chooseOpponentMoves(opp, you, buildStartState({ you, opp, overrides: ov })).map((d) => d.move);

  const all = sel(null);
  ok(all.length > 1, "baseline: the opponent has several moves");
  ok(!sel({ oppDisabledMove: "Body Slam" }).includes("Body Slam"), "a disabled move must leave selection");
  ok(!sel({ oppTormented: true, oppLastMove: "Earthquake" }).includes("Earthquake"),
    "a tormented mon cannot repeat its last move");
  ok(sel({ oppTormented: true, oppLastMove: "Earthquake" }).includes("Body Slam"),
    "...but its other moves stay");
  ok(sel({ oppEncoredMove: "Rest" }).join() === "Rest", "an encored mon can only use the encored move");
  ok(sel({ oppChoiceLock: "Body Slam" }).join() === "Body Slam", "a Choice-locked mon can only use the locked move");
  // Imprison is asymmetric: the flag sits on the PLAYER and blocks moves the
  // PLAYER knows. Kadabra and Snorlax share nothing, so give the player a match.
  const shared = mk({ moves: ["Body Slam", "Psychic", "Thunder Wave", "Encore"] });
  const blocked = chooseOpponentMoves(opp, shared,
    buildStartState({ you: shared, opp, overrides: { youImprisoning: true } })).map((d) => d.move);
  ok(!blocked.includes("Body Slam"), "Imprison must block a move the IMPRISONER knows");
  console.log(`   baseline ${all.length} moves; each limitation removes exactly its own`);
}

console.log();
console.log("-- PART 4: the timers, and the collapse that keeps them cheap --");
{
  const you = mk(), opp = foe();
  const ctx = { you, opp };
  const branchCount = (turn) => resolveTurn(ctx,
    buildStartState({ you, opp, overrides: { turn, oppLastMove: "Body Slam" } }), "Disable", "Body Slam").length;
  const plain = (turn) => resolveTurn(ctx,
    buildStartState({ you, opp, overrides: { turn, oppLastMove: "Body Slam" } }), "Thunder Wave", "Body Slam").length;

  // A turn-1 Disable has TWO observable timer classes; by turn 2 every draw
  // behaves the same, so the branch collapses.
  ok(branchCount(1) > branchCount(2) || branchCount(1) >= 2,
    `a turn-1 Disable must enumerate more than one timer class (turn1 ${branchCount(1)}, turn2 ${branchCount(2)})`);
  console.log(`   Disable branch counts: turn 1 -> ${branchCount(1)}, turn 2 -> ${branchCount(2)}, turn 3 -> ${branchCount(3)}`);
  console.log(`   (a non-Disable move on the same states: ${plain(1)}, ${plain(2)}, ${plain(3)})`);

  // Decay: the lock lifts when the timer runs out.
  //
  // NB the matchup. End-of-turn effects only run when BOTH sides survive the
  // turn (resolveTurn gates applyEndOfTurnEffects on it, as source does), and an
  // earlier draft used a frail Kadabra against Snorlax's Earthquake -- it was
  // KO'd, end-of-turn never ran, and NOTHING decayed, which looked like a decay
  // bug and was a probe bug. Two bulky mons resting is the right instrument.
  const tank = buildMon({ species: "Snorlax", level: 50, nature: "Adamant", evs: { hp: 252, atk: 252 },
    ability: "Thick Fat", item: null, moves: ["Disable", "Body Slam", "Encore", "Rest"], friendship: 255 });
  const tank2 = buildMon({ species: "Blissey", level: 50, nature: "Bold", evs: { hp: 252, def: 252 },
    ability: "Natural Cure", item: null, moves: ["Body Slam", "Ice Beam", "Thunderbolt", "Rest"], friendship: 255 });
  const c = { you: tank, opp: tank2 };
  const decayed = resolveTurn(c, buildStartState({ you: tank, opp: tank2,
    overrides: { oppDisabledMove: "Body Slam", oppDisableTurns: 1, oppEncoredMove: "Rest", oppEncoreTurns: 1, oppTauntTurns: 2 } }),
    "Rest", "Rest")[0].state;
  ok(decayed.yourHpPct > 0 && decayed.oppHpPct > 0, "both sides must survive, or end-of-turn never runs");
  ok(decayed.oppDisabledMove === null && decayed.oppDisableTurns === null,
    "a Disable timer reaching 0 must clear BOTH the timer and the locked move");
  ok(decayed.oppEncoredMove === null && decayed.oppEncoreTurns === null, "the same for Encore");
  ok(decayed.oppTauntTurns === 1, "and Taunt's own timer still ticks alongside them");
  console.log(`   decay: disable and encore cleared at 0, taunt 2 -> ${decayed.oppTauntTurns}`);
}

console.log();
console.log(failures === 0 ? "ALL PASS -- B2b batch 2 characterization green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

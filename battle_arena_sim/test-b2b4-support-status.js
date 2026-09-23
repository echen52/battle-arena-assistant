// ── test-b2b4-support-status.js ───────────────────────────────────────────
// B2b batch 4: support, status-clearing and status-inflicting effects.
//
//   EFFECT_HELPING_HAND  AI_CBM_HelpingHand :541-544   INERT BY RULESET
//   EFFECT_SPIKES        AI_CBM_Spikes      :439-442   lands, never bites
//   EFFECT_HEAL_BELL     AI_CV_HealBell     :1841-1847 (vanilla quirk)
//   EFFECT_REFRESH       AI_CBM_Refresh     :563-566 / AI_CV_Refresh :2514-2522
//   EFFECT_NIGHTMARE     AI_CBM_Nightmare   :237-241
//   EFFECT_FLATTER       AI_CBM_Confuse (shared) / AI_CV_Flatter :1464-1466
//   EFFECT_PAIN_SPLIT    AI_CV_PainSplit    :1768-1784
//
// Two of these are inert for RULESET reasons rather than being unported, and
// the distinction is asserted rather than assumed:
//   Helping Hand is gated on BATTLE_TYPE_DOUBLE and the Arena is singles.
//   Spikes lays real layers, but its damage is a SWITCH-IN effect and an Arena
//   matchup has no switching.
import {
  AI_HANDLERS, buildMon, buildStartState, resolveTurn, applyMove, skillDelta,
} from "./logic.js";

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } };
const ev = (d) => (Array.isArray(d) ? d.reduce((a, x) => a + x.p * x.delta, 0) : d);

const mk = (moves, over = {}) => buildMon({
  species: "Snorlax", level: 50, nature: "Adamant", evs: { hp: 252, atk: 252 },
  ability: "Thick Fat", item: null, moves, friendship: 255, ...over,
});
const you = mk(["Body Slam", "Earthquake", "Shadow Ball", "Rest"]);

const neutralCtx = () => ({
  userHpPct: 100, targetHpPct: 100, targetFaster: false,
  userStatus: null, targetStatus: null,
  targetSideHasSpikes: false, targetNightmared: false,
  targetPartyStatused: false, targetConfused: false,
  targetToxicPoisoned: false, targetLeechSeeded: false,
  userIngrained: false, targetCursed: false,
});

console.log("-- PART 1: two effects that are inert BY RULESET, not unported --");
{
  ok(AI_HANDLERS.EFFECT_HELPING_HAND.checkBadMove(neutralCtx()) === -10,
    "Helping Hand is ALWAYS -10 in singles -- AI_CBM_HelpingHand is a bare if_not_double_battle");

  const opp = mk(["Helping Hand", "Body Slam", "Rest", "Earthquake"]);
  const s = buildStartState({ you, opp });
  const before = s.skillOpp;
  applyMove({ you, opp }, s, "opp", "Helping Hand", true, false);
  ok(s.skillOpp - before === skillDelta("noEffect"),
    "and it FAILS when used -- Cmd_trysethelpinghand is gated on BATTLE_TYPE_DOUBLE");

  // Spikes: succeeds, stacks to three, then fails -- and never deals damage.
  const sp = mk(["Spikes", "Body Slam", "Rest", "Earthquake"]);
  const c2 = { you, opp: sp };
  const st = buildStartState({ you, opp: sp });
  for (let i = 1; i <= 3; i++) {
    const b4 = st.skillOpp;
    applyMove(c2, st, "opp", "Spikes", true, false);
    ok(st.youSpikesLayers === i, `layer ${i} must be laid (got ${st.youSpikesLayers})`);
    ok(st.skillOpp - b4 === skillDelta("landed"), `layer ${i} must score as LANDED, not failed`);
  }
  const b4 = st.skillOpp;
  applyMove(c2, st, "opp", "Spikes", true, false);
  ok(st.youSpikesLayers === 3, "a fourth Spikes must not add a layer");
  ok(st.skillOpp - b4 === skillDelta("noEffect"), "...and must fail");

  // Three layers down, a full turn takes NO spikes damage: the damage site is
  // switch-in, and there is no switching.
  const hpBefore = st.yourHpPct;
  const after = resolveTurn(c2, { ...st, yourHpPct: 80 }, "Rest", "Rest")[0].state;
  ok(after.yourHpPct >= 80, `spikes must never chip in an Arena turn (80 -> ${after.yourHpPct.toFixed(1)})`);
  ok(AI_HANDLERS.EFFECT_SPIKES.checkBadMove({ ...neutralCtx(), targetSideHasSpikes: true }) === -10,
    "the AI still discourages a SECOND layer, which is why layers are tracked at all");
  void hpBefore;
  console.log("   Helping Hand always -10 and always fails; Spikes stacks 1-2-3 then fails, and never chips");
}

console.log();
console.log("-- PART 2: the status clearers, including a vanilla quirk --");
{
  // Refresh: exactly poison / burn / paralysis, and it FAILS otherwise.
  const H = AI_HANDLERS.EFFECT_REFRESH;
  for (const st of ["poison", "burn", "paralysis"]) {
    ok(H.checkBadMove({ ...neutralCtx(), userStatus: st }) === 0, `Refresh is fine with ${st}`);
  }
  for (const st of [null, "sleep", "freeze"]) {
    ok(H.checkBadMove({ ...neutralCtx(), userStatus: st }) === -10,
      `Refresh is -10 with ${st} -- it cannot cure sleep or freeze`);
  }
  const opp = mk(["Refresh", "Body Slam", "Rest", "Earthquake"]);
  const c = { you, opp };
  const burned = buildStartState({ you, opp, overrides: { oppStatus: "burn" } });
  applyMove(c, burned, "opp", "Refresh", true, false);
  ok(burned.oppStatus === null, "Refresh must clear a burn");
  const asleep = buildStartState({ you, opp, overrides: { oppStatus: "sleep", oppSleepTurns: 2 } });
  const b4 = asleep.skillOpp;
  applyMove(c, asleep, "opp", "Refresh", true, false);
  ok(asleep.oppStatus === "sleep", "Refresh must NOT clear sleep");
  ok(asleep.skillOpp - b4 === skillDelta("noEffect"), "...and must fail when there is nothing it can cure");

  // Heal Bell: the quirk. Both of AI_CV_HealBell's checks read the TARGET.
  const HB = AI_HANDLERS.EFFECT_HEAL_BELL;
  ok(ev(HB.checkViability({ ...neutralCtx(), targetStatus: null })) === -5,
    "with the PLAYER unstatused the AI declines its own Heal Bell at -5");
  ok(ev(HB.checkViability({ ...neutralCtx(), targetStatus: "burn" })) === 0,
    "and with the PLAYER statused it does not -- backwards, and preserved as written");
  ok(ev(HB.checkViability({ ...neutralCtx(), userStatus: "burn" })) === -5,
    "the USER's own status is not read at all, which is the quirk");
  console.log("   Refresh cures only poison/burn/paralysis; Heal Bell's AI reads the PLAYER's status (vanilla quirk)");

  const hb = mk(["Heal Bell", "Body Slam", "Rest", "Earthquake"]);
  const hbs = buildStartState({ you, opp: hb, overrides: { oppStatus: "sleep", oppSleepTurns: 3 } });
  applyMove({ you, opp: hb }, hbs, "opp", "Heal Bell", true, false);
  ok(hbs.oppStatus === null && hbs.oppSleepTurns === null, "the EXECUTOR does cure sleep, unlike Refresh");
}

console.log();
console.log("-- PART 3: Nightmare needs sleep, and bleeds only while it lasts --");
{
  const H = AI_HANDLERS.EFFECT_NIGHTMARE;
  ok(H.checkBadMove({ ...neutralCtx(), targetNightmared: true }) === -10, "already nightmared is -10");
  ok(H.checkBadMove({ ...neutralCtx(), targetStatus: null }) === -8, "an awake target is -8, a DIFFERENT penalty");
  ok(H.checkBadMove({ ...neutralCtx(), targetStatus: "sleep" }) === 0, "an asleep target is fine");

  const opp = mk(["Nightmare", "Body Slam", "Rest", "Earthquake"]);
  const c = { you, opp };
  const awake = buildStartState({ you, opp });
  applyMove(c, awake, "opp", "Nightmare", true, false);
  ok(awake.youNightmared === false, "Nightmare must FAIL on an awake target");

  const s = buildStartState({ you, opp, overrides: { youStatus: "sleep", youSleepTurns: 3 } });
  applyMove(c, s, "opp", "Nightmare", true, false);
  ok(s.youNightmared === true, "and succeed on a sleeping one");

  // The residual bites while asleep. Body Slam, not Rest: Rest would put the
  // sleeper straight back to sleep at full HP and hide the residual entirely.
  const bleeding = resolveTurn(c, { ...s, yourHpPct: 90 }, "Body Slam", "Body Slam")[0].state;
  ok(bleeding.yourHpPct < 90, `a nightmared sleeper must bleed (90 -> ${bleeding.yourHpPct.toFixed(1)})`);

  // WHOLENESS (amendment 9). Waking clears the nightmare at CANCELER_ASLEEP
  // (src/battle_util.c:2049), NOT at the end-of-turn residual -- and the two
  // are distinguishable. A mon whose sleep counter runs out on its own turn
  // and then Rests is asleep again by ENDTURN_NIGHTMARES, so an engine that
  // only cleared the flag there would keep bleeding it forever. This probe
  // wakes the mon mid-turn (sleepTurns 1 -> 0) and has it Rest in the same
  // turn, which is exactly the case the two sites disagree on.
  const wakes = resolveTurn(c, { ...s, yourHpPct: 60, youSleepTurns: 1 }, "Rest", "Body Slam")[0].state;
  ok(wakes.youNightmared === false,
    "waking must clear the nightmare AT THE WAKE, even when the mon re-sleeps the same turn");

  // The other sleep-clearing sites clear it too: HOLD_EFFECT_CURE_SLP /
  // CURE_STATUS (src/battle_util.c:3546, :3570, :3692, :3725).
  const chesto = mk(["Nightmare", "Body Slam", "Rest", "Earthquake"], { item: "Chesto Berry" });
  const cs = buildStartState({ you: chesto, opp, overrides: { youStatus: "sleep", youSleepTurns: 3 } });
  applyMove({ you: chesto, opp }, cs, "opp", "Nightmare", true, false);
  ok(cs.youNightmared === true, "(probe check) the Chesto holder is nightmared first");
  const cured = resolveTurn({ you: chesto, opp }, { ...cs, yourHpPct: 70 }, "Body Slam", "Body Slam")[0].state;
  ok(cured.youStatus === null && cured.youNightmared === false,
    "a berry that cures the sleep must take the nightmare with it");
  console.log(`   asleep: bleeds to ${bleeding.yourHpPct.toFixed(1)}%; wake-then-Rest and berry-cure both clear the flag`);
}

console.log();
console.log("-- PART 4: Flatter composes, and Pain Split averages --");
{
  // AI_CV_Flatter falls THROUGH into AI_CV_Confuse, so the two compose.
  const F = AI_HANDLERS.EFFECT_FLATTER, C = AI_HANDLERS.EFFECT_CONFUSE;
  const ctx = { ...neutralCtx(), targetHpPct: 40 };
  const flatter = ev(F.checkViability(ctx));
  const confuse = ev(C.checkViability(ctx));
  ok(Math.abs(flatter - (confuse + 0.5)) < 1e-9,
    `Flatter must be Confuse plus a 128/256 chance of +1 (Flatter ${flatter.toFixed(4)}, Confuse ${confuse.toFixed(4)})`);
  console.log(`   Flatter E[delta] ${flatter.toFixed(4)} = Confuse ${confuse.toFixed(4)} + 0.5`);

  const opp = mk(["Flatter", "Body Slam", "Rest", "Earthquake"]);
  const c = { you, opp };
  const s = buildStartState({ you, opp });
  applyMove(c, s, "opp", "Flatter", true, false);
  ok(s.youStages.spa === 1, "Flatter must raise the target's SpAttack");
  ok(s.youConfused === true, "and confuse it");

  // Pain Split: both sides end on floor((a + b) / 2).
  const ps = mk(["Pain Split", "Body Slam", "Rest", "Earthquake"]);
  const c2 = { you, opp: ps };
  const s2 = buildStartState({ you, opp: ps, overrides: { yourHpPct: 100, oppHpPct: 20 } });
  const hpA = Math.round((s2.yourHpPct / 100) * you.stats.hp);
  const hpB = Math.round((s2.oppHpPct / 100) * ps.stats.hp);
  applyMove(c2, s2, "opp", "Pain Split", true, false);
  const shared = Math.floor((hpA + hpB) / 2);
  ok(Math.abs(Math.round((s2.yourHpPct / 100) * you.stats.hp) - shared) <= 1,
    `the player must end on floor((a+b)/2) = ${shared}`);
  ok(Math.abs(Math.round((s2.oppHpPct / 100) * ps.stats.hp) - shared) <= 1,
    "and so must the opponent");
  console.log(`   Pain Split: ${hpA} and ${hpB} HP both become ${shared}`);

  // Substitute blocks it.
  const subbed = buildStartState({ you, opp: ps, overrides: { yourHpPct: 100, oppHpPct: 20, youSubstituteHP: 40 } });
  const b4 = subbed.skillOpp;
  applyMove(c2, subbed, "opp", "Pain Split", true, false);
  ok(subbed.skillOpp - b4 === skillDelta("noEffect"), "a Substitute must block Pain Split");
}

console.log();
console.log(failures === 0 ? "ALL PASS -- B2b batch 4 characterization green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

// ── test-b6-integer-hp.js ─────────────────────────────────────────────────
// B6-1a: HP is an integer (gBattleMons[].hp is a u16).
//
//   PART 1  an EXACTLY lethal hit faints its target -- the float percentage
//           used to leave 5.7e-15% behind and keep it alive (Arcanine vs
//           Ampharos 4: ExtremeSpeed deals exactly the 47 HP left)
//   PART 2  every state the engine hands back holds a whole HP, and the SAME
//           whole HP is always the same percentage (bit for bit)
//   PART 3  a start percentage that is not a whole HP is the nearest whole one
import { buildMon, buildStartState, resolveTurn } from "./logic.js";
import { LEADS } from "./anchors.js";
import { getOpponentConfig } from "./opponent-adapter.js";

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } };
console.warn = () => {};
const you = buildMon(LEADS.Arcanine);
const opp = buildMon({ ...getOpponentConfig("Ampharos 4", { ivTier: 31 }), friendship: 255 });
const whole = (pct, M) => Math.abs((pct * M) / 100 - Math.round((pct * M) / 100)) < 1e-9;
const canon = (pct, M) => (Math.round((pct * M) / 100) * 100) / M;

console.log("-- PART 1: an exactly lethal hit faints --");
{
  // Walk the recorded line: Flamethrower / Thunder Wave, then Flamethrower /
  // Thunderbolt -- which leaves Ampharos on exactly 47 HP.
  let st = buildStartState({ you, opp });
  // B6-2: the NON-crit branch -- the one leaving the MOST HP on each side.
  const pick = (brs, re) => brs.filter((b) => re.test(b.label) && !/MISSES|paralyzed/.test(b.label) && b.state.youStatus !== "burn" && b.state.oppStatus !== "burn")
    .sort((a, b) => (b.state.oppHpPct + b.state.yourHpPct) - (a.state.oppHpPct + a.state.yourHpPct))[0];
  st = pick(resolveTurn({ you, opp }, st, "Flamethrower", "Thunder Wave"), /Thunder Wave/).state;
  st = pick(resolveTurn({ you, opp }, st, "Flamethrower", "Thunderbolt"), /Thunderbolt \(hits\)/).state;
  ok(Math.round((st.oppHpPct * opp.stats.hp) / 100) === 47, `(probe check) Ampharos is on 47 HP (${(st.oppHpPct * opp.stats.hp) / 100})`);
  const t3 = resolveTurn({ you, opp }, st, "ExtremeSpeed", "Thunderbolt").filter((b) => /You uses ExtremeSpeed \(hits\)/.test(b.label));
  ok(t3.length > 0 && t3.every((b) => b.state.oppHpPct === 0), "ExtremeSpeed's exact 47 faints it -- no residue left alive");
  // ...and it faints BEFORE its turn: the snap after each ACTION (not just at
  // turn end) is what stops a residue-alive target taking its move.
  ok(t3.every((b) => /opp never acts/.test(b.label) && b.state.yourHpPct === st.yourHpPct), "the fainted Ampharos never gets its Thunderbolt");
  // A case where the residue is REAL even from a whole-HP start: 13% of
  // (HP, maxHP) pairs give (h*100)/M > (h/M)*100 in floats. Seismic Toss deals
  // exactly the level (50) to a 150-HP Tauros sitting on 50 HP -- without the
  // snap after the ACTION it would still be 7.1e-15% "alive" and swing back.
  const jolt = buildMon({ species: "Jolteon", level: 50, nature: "Timid", evs: { spe: 252 }, ability: "Volt Absorb", item: null, moves: ["Seismic Toss"], friendship: 255 });
  const tau = buildMon({ species: "Tauros", level: 50, nature: "Hardy", evs: {}, ability: "Intimidate", item: null, moves: ["Tackle"], friendship: 255 });
  ok(tau.stats.hp === 150, `(probe check) Tauros max HP 150 (${tau.stats.hp})`);
  const ts = buildStartState({ you: jolt, opp: tau, overrides: { oppHpPct: (50 * 100) / 150 } });
  const tb = resolveTurn({ you: jolt, opp: tau }, ts, "Seismic Toss", "Tackle").filter((b) => /Seismic Toss \(hits\)/.test(b.label));
  ok(tb.length > 0 && tb.every((b) => b.state.oppHpPct === 0 && /opp never acts/.test(b.label) && b.state.yourHpPct === 100),
    "an exact Seismic Toss faints Tauros before its Tackle, from a whole-HP start");
}

console.log();
console.log("-- PART 2: every returned state holds a whole HP --");
{
  let frontier = [buildStartState({ you, opp })];
  let bad = 0, n = 0;
  for (let t = 0; t < 2; t++) {
    const next = [];
    for (const st of frontier) {
      if (st.yourHpPct <= 0 || st.oppHpPct <= 0) continue;
      for (const [ym, om] of [["Flamethrower", "Thunderbolt"], ["Crunch", "Fire Punch"], ["Will-O-Wisp", "Thunder Wave"]]) {
        for (const b of resolveTurn({ you, opp }, st, ym, om)) {
          n++;
          const s = b.state;
          if (!whole(s.yourHpPct, you.stats.hp) || !whole(s.oppHpPct, opp.stats.hp)
              || s.yourHpPct !== canon(s.yourHpPct, you.stats.hp) || s.oppHpPct !== canon(s.oppHpPct, opp.stats.hp)) bad++;
          next.push(s);
        }
      }
    }
    frontier = next.slice(0, 40);
  }
  ok(n > 50 && bad === 0, `${n} states, ${bad} holding a fractional or non-canonical HP`);
}

console.log();
console.log("-- PART 3: a start percentage snaps to the nearest whole HP --");
{
  const st = buildStartState({ you, opp, overrides: { yourHpPct: 50, oppHpPct: 33.3 } });
  ok(whole(st.yourHpPct, you.stats.hp) && whole(st.oppHpPct, opp.stats.hp), `start HP is whole (${(st.yourHpPct * you.stats.hp) / 100}, ${(st.oppHpPct * opp.stats.hp) / 100})`);
  ok(st.yourHpPct === canon(50, you.stats.hp), "50% becomes the nearest whole HP");
  const st2 = buildStartState({ you, opp, yourHpPct: 50 });
  ok(st2.yourHpPctAtStart === canon(50, you.stats.hp), "and so does the round-start baseline the Body judge reads");
}

console.log();
console.log("-- PART 4: an exactly lethal hit counts as a faint INSIDE the action --");
{
  // B6-1d: the subtraction itself is in whole HP. The float version left
  // 7.1e-15% inside the action, so Destiny Bond's "did the target faint?"
  // check missed, and the snap afterwards zeroed it too late. A faster Tauros
  // on 50 HP uses Destiny Bond; the Jolteon's Seismic Toss does exactly 50.
  const tau = buildMon({ species: "Tauros", level: 50, nature: "Jolly", evs: { spe: 252 }, ability: "Intimidate", item: null, moves: ["Destiny Bond"], friendship: 255 });
  const jolt = buildMon({ species: "Jolteon", level: 50, nature: "Brave", evs: {}, ability: "Volt Absorb", item: null, moves: ["Seismic Toss"], friendship: 255 });
  ok(tau.stats.hp === 150, `(probe check) Tauros max HP 150 (${tau.stats.hp})`);
  const st = buildStartState({ you: jolt, opp: tau, overrides: { oppHpPct: (50 * 100) / 150 } });
  const brs = resolveTurn({ you: jolt, opp: tau }, st, "Seismic Toss", "Destiny Bond").filter((b) => /Seismic Toss \(hits\)/.test(b.label));
  ok(brs.length > 0 && brs.every((b) => /Opp uses Destiny Bond; You uses Seismic Toss/.test(b.label)), "(probe check) Destiny Bond first, then the exact Seismic Toss");
  ok(brs.every((b) => b.state.oppHpPct === 0 && b.state.yourHpPct === 0), "the Tauros faints INSIDE the action, so Destiny Bond takes the Jolteon too");
}

console.log();
console.log(failures === 0 ? "ALL PASS -- B6-1a integer HP characterization green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

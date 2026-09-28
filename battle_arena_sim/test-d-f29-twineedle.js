// ── test-d-f29-twineedle.js ───────────────────────────────────────────────
// Phase D finding F29: Twineedle poisons, per hit.
//
// BattleScript_EffectTwineedle sets sMULTIHIT_EFFECT = MOVE_EFFECT_POISON
// (data/battle_scripts_1.s:1078); BattleScript_MultiHitLoop copies it into
// cEFFECT_CHOOSER on every hit (:619), and each hit runs the move end up to
// MOVEEND_NEXT_TARGET (:637) -- ITEM_EFFECTS_ALL included, so a berry cures
// between the hits. The engine left the poison out ("no opponent set carries
// Twineedle", true of the old 552-set pool, not of B1's 850). Emulator:
// traces-given/00800 and 01126 (Beedrill poisoning Arcanine).
import { execFileSync } from "node:child_process";
import { buildMon, buildStartState, resolveTurn } from "./logic.js";

const TOOLS = "C:/Users/azncu/Desktop/pokemon_code/arena-solver/tools/";
const EMU = "C:/Users/azncu/Desktop/pokemon_code/arena-solver/emu/";
let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } else console.log("  ok   " + m); };
const mk = (species, moves, over = {}) => buildMon({
  species, level: 50, nature: "Hardy", evs: {}, ability: "Intimidate", item: null, moves, friendship: 255, ...over,
});
const psum = (bs) => bs.reduce((a, b) => a + b.p, 0);
const near = (a, b) => Math.abs(a - b) < 1e-12;

const bee = mk("Beedrill", ["Twineedle"], { ability: "Swarm" });
{
  const arc = mk("Arcanine", ["Harden"]);
  const br = resolveTurn({ you: arc, opp: bee }, buildStartState({ you: arc, opp: bee }), "Harden", "Twineedle");
  const p = psum(br.filter((b) => b.state.youStatus === "poison"));
  ok(near(p, 1 - 0.8 * 0.8), `two 20% draws: P(poisoned) = 1 - 0.8^2 = 0.36 (${p})`);
}
{
  // a Pecha holder is cured between the hits and can be poisoned again by hit 2
  const arc = mk("Arcanine", ["Harden"], { item: "Pecha Berry" });
  const br = resolveTurn({ you: arc, opp: bee }, buildStartState({ you: arc, opp: bee }), "Harden", "Twineedle");
  const pois = psum(br.filter((b) => b.state.youStatus === "poison"));
  const curedOnly = psum(br.filter((b) => b.state.youStatus !== "poison" && b.state.youBerryConsumed));
  const none = psum(br.filter((b) => b.state.youStatus !== "poison" && !b.state.youBerryConsumed));
  ok(near(pois, 0.04) && near(curedOnly, 0.32) && near(none, 0.64),
    `Pecha: poisoned 0.2*0.2 = 0.04, cured once 0.32, untouched 0.64 (${pois.toFixed(4)} / ${curedOnly.toFixed(4)} / ${none.toFixed(4)})`);
}
{
  const cor = mk("Corsola", ["Harden"], { ability: "Hustle" });
  const ska = mk("Skarmory", ["Harden"], { ability: "Keen Eye" });
  for (const t of [ska]) {
    const br = resolveTurn({ you: t, opp: bee }, buildStartState({ you: t, opp: bee }), "Harden", "Twineedle");
    ok(br.every((b) => b.state.youStatus !== "poison"), `${t.species} (Steel) is never poisoned`);
  }
  void cor;
}
{
  let out = "", code = 0;
  try { out = execFileSync("node", [TOOLS + "diff-emu.mjs", EMU + "traces-given/battle-00800.json", EMU + "traces-given/battle-01126.json"], { cwd: TOOLS, encoding: "utf8", env: { ...process.env, DIFF_EXACT: "0" } } /* validated in the point-estimate mode, before F31 */); }
  catch (e) { out = String(e.stdout); code = e.status; }
  ok(code === 0, `emulator 00800 / 01126: ${(out.match(/divergences \d+/g) || []).join(", ")}`);
}
console.log();
console.log(failures === 0 ? "ALL PASS -- F29 Twineedle green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

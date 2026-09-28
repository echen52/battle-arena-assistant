// ── test-d-f28-berry-move-end.js ──────────────────────────────────────────
// Phase D finding F28: status berries cure at MOVE END, not only at turn end.
//
// MOVEEND_ITEM_EFFECTS_ALL (src/battle_script_commands.c:4330-4335) runs
// ItemBattleEffects(ITEMEFFECT_MOVE_END) for every battler after every action,
// cancelled ones included; its cases (src/battle_util.c:3625-3740) are the
// status berries. So a status inflicted by a move is cured before its holder
// acts. The engine cured only at ENDTURN_ITEMS, so a Thunder-Waved Cheri
// holder rolled full paralysis that turn and could not be paralysed again.
// Found by the emulator: traces-given/00832 (Zubat's Cheri Berry cured
// Electrode's Thunder Wave, then its Poison Fang took Static's paralysis).
import { execFileSync } from "node:child_process";
import { buildMon, buildStartState, resolveTurn } from "./logic.js";

const TOOLS = "C:/Users/azncu/Desktop/pokemon_code/arena-solver/tools/";
const EMU = "C:/Users/azncu/Desktop/pokemon_code/arena-solver/emu/";
let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } else console.log("  ok   " + m); };
const mk = (species, moves, over = {}) => buildMon({
  species, level: 50, nature: "Hardy", evs: {}, ability: "Pressure", item: null, moves, friendship: 255, ...over,
});
const psum = (bs) => bs.reduce((a, b) => a + b.p, 0);

console.log("-- a Cheri holder Thunder-Waved first acts unparalysed --");
{
  const ele = mk("Electrode", ["Thunder Wave"], { ability: "Soundproof" });
  const zub = mk("Zubat", ["Wing Attack"], { ability: "Inner Focus", item: "Cheri Berry" });
  const br = resolveTurn({ you: ele, opp: zub }, buildStartState({ you: ele, opp: zub }), "Thunder Wave", "Wing Attack");
  const waved = br.filter((b) => /You uses Thunder Wave/.test(b.label) && b.label.startsWith("You"));
  ok(waved.length > 0 && waved.every((b) => !/Opp is fully paralyzed/.test(b.label)), "no full-paralysis roll for the cured Zubat");
  ok(waved.every((b) => b.state.oppStatus === null && b.state.oppBerryConsumed), "cured, berry gone");
}

console.log("-- ...and can be paralysed again the same turn (Static) --");
{
  const ele = mk("Electrode", ["Thunder Wave"], { ability: "Static" });
  const zub = mk("Zubat", ["Wing Attack"], { ability: "Inner Focus", item: "Cheri Berry" });
  const br = resolveTurn({ you: ele, opp: zub }, buildStartState({ you: ele, opp: zub }), "Thunder Wave", "Wing Attack");
  const hitBack = br.filter((b) => /Opp uses Wing Attack \(hits\)/.test(b.label) && b.label.startsWith("You"));
  const repara = hitBack.filter((b) => b.state.oppStatus === "paralysis");
  ok(hitBack.length > 0 && Math.abs(psum(repara) / psum(hitBack) - 1 / 3) < 1e-9, `Static re-paralyses 1/3 of the time (${(psum(repara) / psum(hitBack)).toFixed(4)})`);
}

console.log("-- Persim: a Confuse Ray is cured before the holder acts --");
{
  const cro = mk("Crobat", ["Confuse Ray"], { ability: "Inner Focus" });
  const sno = mk("Snorlax", ["Body Slam"], { ability: "Thick Fat", item: "Persim Berry" });
  const br = resolveTurn({ you: cro, opp: sno }, buildStartState({ you: cro, opp: sno }), "Confuse Ray", "Body Slam");
  ok(br.every((b) => !/Opp hits itself/.test(b.label) && !b.state.oppConfused), "no self-hit, not confused");
}

console.log("-- the emulator's traces --");
{
  let out = "", code = 0;
  try { out = execFileSync("node", [TOOLS + "diff-emu.mjs", EMU + "traces-given/battle-00832.json", EMU + "traces-given/battle-00850.json"], { cwd: TOOLS, encoding: "utf8", env: { ...process.env, DIFF_EXACT: "0" } } /* validated in the point-estimate mode, before F31 */); }
  catch (e) { out = String(e.stdout); code = e.status; }
  ok(code === 0, `00832 / 00850: ${(out.match(/divergences \d+/g) || []).join(", ")}`);
}

console.log();
console.log(failures === 0 ? "ALL PASS -- F28 berries at move end green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

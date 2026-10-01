// ── test-site-browser.mjs ─────────────────────────────────────────────────
// The site, in a real (headless Chromium) browser, against the engine itself.
//
// Serves battle_arena_assistant/ over http (the site imports
// ../battle_arena_sim/*.js as ES modules, so file:// will not do), loads
// site/index.html, and for each case: imports YOUR set through the Showdown
// paste box, picks the opponent set (and IV tier) through the page's own
// controls, and reads the recommendation the page prints. The expected value
// is analyzeMatchup on the same configs, called here in Node -- the engine,
// not the site's own solve() -- so a site that builds either mon differently,
// or hands the engine a different start state, fails.
//
// Covers what the site used to get wrong: the retired 552-set opponent list
// (a set only in frontier-pool.js), IV tiers (amendment 7), Frontier
// friendship (F11: a Frustration user), and a player Sand Stream at the start
// of a match. Plus: no page error on load or on any case.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import { analyzeMatchup } from "./logic.js";
import { getOpponentConfig } from "./opponent-adapter.js";
import { FRONTIER_POOL } from "./frontier-pool.js";
import { parseShowdownText } from "../site/ui-logic.js";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } else console.log("  ok   " + m); };

const MIME = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".json": "application/json" };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { "content-type": MIME[path.extname(p)] ?? "application/octet-stream" });
  fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const base = `http://127.0.0.1:${server.address().port}`;

const METAGROSS = `Metagross @ Choice Band
Ability: Clear Body
EVs: 252 Atk / 4 SpD / 252 Spe
Adamant Nature
- Meteor Mash
- Earthquake
- Shadow Ball
- Aerial Ace`;
const TYRANITAR = `Tyranitar @ Leftovers
Ability: Sand Stream
EVs: 252 HP / 252 Atk / 4 SpD
Adamant Nature
- Rock Slide
- Earthquake
- Crunch
- Dragon Dance`;

// The panel's Metagross and Snorlax (anchors.js LEADS), as Showdown pastes.
const PANEL_METAGROSS = `Metagross @ Cheri Berry
Ability: Clear Body
EVs: 252 Atk / 4 SpD / 252 Spe
Adamant Nature
- Meteor Mash
- Earthquake
- Shadow Ball
- Explosion`;
const PANEL_SNORLAX = `Snorlax @ Leftovers
Ability: Thick Fat
EVs: 252 HP / 252 Atk
Adamant Nature
- Body Slam
- Earthquake
- Shadow Ball
- Rest`;

// Each case is chosen so the thing it checks CHANGES the printed result
// (measured when the cases were picked): Weezing 4 IV31 vs Metagross is
// Meteor Mash 0.966 with F11's friendship 0 and 0.974 at the old 255; Ninjask
// 1 vs Snorlax is Body Slam 0.822 at IV6 and 0.912 at IV31; Parasect 2 vs
// Snorlax is Body Slam 0.909 at its default (highest) tier and Shadow Ball 1.000
// at IV9; the Sand Stream case is Earthquake 0.961 with the sandstorm and
// Dragon Dance 0.934 without it.
const cases = [
  { why: "a set the retired list lacked (low range, IV 3 only)", you: METAGROSS, set: "Sunkern 1" },
  { why: "a Frustration user: friendship 0 (F11)", you: PANEL_METAGROSS, set: "Weezing 4" },
  { why: "a non-default IV tier", you: PANEL_SNORLAX, set: "Ninjask 1", tier: 6 },
  { why: "the default tier of a multi-tier set (highest)", you: PANEL_SNORLAX, set: "Parasect 2" },
  { why: "a Frontier Brain set", you: METAGROSS, set: "Anabel Gold Raikou" },
  { why: "a player Sand Stream at match start", you: TYRANITAR, set: "Umbreon 4" },
  // Tauros 1 has Intimidate: Body Slam 0.683 with the switch-in -1 Atk; the
  // page's turn-1 zero stages used to overwrite it and printed 0.839.
  { why: "an Intimidate opponent at match start", you: PANEL_SNORLAX, set: "Tauros 1" },
];

const browser = await chromium.launch();
const page = await browser.newPage();
const pageErrors = [];
page.on("pageerror", (e) => pageErrors.push(e.message));
page.on("console", (m) => { if (m.type() === "error") pageErrors.push(m.text()); });
await page.goto(`${base}/site/index.html`);
await page.waitForFunction(() => document.getElementById("oppSetName")?.options.length > 0);
ok(pageErrors.length === 0, `the page loads with no error (${pageErrors.join(" | ") || "none"})`);
const listed = await page.evaluate(() => document.getElementById("oppSetName").options.length);
const lv50 = Object.values(FRONTIER_POOL).filter((e) => e.lv50Legal).length;
ok(listed === lv50, `the opponent list is the engine's Lv50 pool: ${listed} sets (pool ${lv50})`);

for (const c of cases) {
  console.log(`-- ${c.set}${c.tier ? ` IV${c.tier}` : ""} vs your ${c.you.split(" ")[0]}: ${c.why} --`);
  pageErrors.length = 0;
  await page.fill("#youImportExportText", c.you);
  await page.click("#youImport");
  await page.evaluate(({ set, tier }) => {
    const sel = document.getElementById("oppSetName");
    sel.value = set;
    sel.dispatchEvent(new Event("change", { bubbles: true }));
    if (tier != null) {
      const t = document.getElementById("oppIvTier");
      t.value = String(tier);
      t.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }, { set: c.set, tier: c.tier ?? null });
  const shown = (await page.textContent("#bestMoveDisplay")).trim();
  const err = (await page.textContent("#errorDisplay")).trim();
  // the expected value: the engine on the same configs, in Node
  const youCfg = parseShowdownText(c.you);
  const e = FRONTIER_POOL[c.set];
  const tier = e.brain ? null : c.tier ?? Math.max(...e.ivTiers);
  // the page's ability picker defaults to the set's first ability
  const oppCfg = getOpponentConfig(c.set, {
    ...(e.abilities.length > 1 ? { ability: e.abilities[0] } : {}),
    ...(tier == null ? {} : { ivTier: tier }),
  });
  const { result } = analyzeMatchup(youCfg, oppCfg, { tree: false });
  const want = `${result.move}  —  P(win) = ${result.winProb.toFixed(3)}`;
  ok(!err && pageErrors.length === 0, `no error on the page (${err || pageErrors.join(" | ") || "none"})`);
  ok(shown === want, `page "${shown}" == engine "${want}"`);
}

// ── Volatile statuses: both sides, and confusion's duration ─────────────────
// Each case changes the printed result (measured when picked, Snorlax panel
// lead at the set's highest tier): vs Kangaskhan 1 the base is Body Slam 0.671,
// the opponent confused gives Earthquake 0.913; your confusion fresh gives
// Body Slam 0.268 and at "4 turns" 0.892; vs Tauros 1 the base is 0.683 and the
// opponent attracted gives 0.926. Expected values: the engine with the same
// state overrides, searched directly (not the site's solve()).
const { buildMon, buildFrontierOpponent, buildStartState, search } = await import("./logic.js");
const engineWith = (youText, set, overrides) => {
  const e = FRONTIER_POOL[set];
  const you = buildMon(parseShowdownText(youText));
  const opp = buildFrontierOpponent(getOpponentConfig(set, {
    ...(e.abilities.length > 1 ? { ability: e.abilities[0] } : {}), ivTier: Math.max(...e.ivTiers),
  }));
  const r = search({ you, opp }, buildStartState({ you, opp, overrides }), 3, false, new Map());
  return `${r.move}  —  P(win) = ${r.winProb.toFixed(3)}`;
};
const setControls = (v) => page.evaluate((v) => {
  for (const [id, val] of Object.entries(v)) {
    const el = document.getElementById(id);
    if (el.type === "checkbox" || el.type === "radio") el.checked = val; else el.value = val;
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }
}, v);
const pick = async (youText, set) => {
  await page.fill("#youImportExportText", youText);
  await page.click("#youImport");
  await setControls({ oppSetName: set });
};
const volatileCases = [
  { why: "the opponent confused (no turns yet)", set: "Kangaskhan 1", controls: { oppConfusion: "1" }, overrides: { oppConfused: true } },
  { why: "you confused, no turns yet", set: "Kangaskhan 1", controls: { youConfusion: "1" }, overrides: { youConfused: true } },
  { why: "you confused 4 turns (ends next check)", set: "Kangaskhan 1", controls: { youConfusion: "5" }, overrides: { youConfused: 5 } },
  { why: "the opponent attracted", set: "Tauros 1", controls: { oppAttracted: true }, overrides: { oppAttracted: true } },
];
const OFF = { youConfusion: "", oppConfusion: "", youAttracted: false, oppAttracted: false };
for (const c of volatileCases) {
  console.log(`-- ${c.set} vs your Snorlax: ${c.why} --`);
  pageErrors.length = 0;
  await pick(PANEL_SNORLAX, c.set);
  await setControls({ ...OFF, ...c.controls });
  const shown = (await page.textContent("#bestMoveDisplay")).trim();
  const err = (await page.textContent("#errorDisplay")).trim();
  const want = engineWith(PANEL_SNORLAX, c.set, c.overrides);
  const base = engineWith(PANEL_SNORLAX, c.set, {});
  ok(!err && pageErrors.length === 0, `no error on the page (${err || pageErrors.join(" | ") || "none"})`);
  ok(shown === want && want !== base, `page "${shown}" == engine "${want}" (without it: "${base}")`);
  await setControls(OFF);
}

console.log("-- the Attract gate covers both sides --");
{
  const STARMIE = "Starmie @ Leftovers\nAbility: Natural Cure\nEVs: 252 SpA / 252 Spe\nTimid Nature\n- Surf\n- Ice Beam\n- Thunderbolt\n- Recover";
  await pick(STARMIE, "Tauros 1");
  const gate = await page.evaluate(() => [document.getElementById("youAttracted").disabled, document.getElementById("oppAttracted").disabled]);
  ok(gate[0] && gate[1], `genderless Starmie: both Attracted toggles disabled (${gate})`);
  await pick(PANEL_SNORLAX, "Tauros 1");
  const open = await page.evaluate(() => [document.getElementById("youAttracted").disabled, document.getElementById("oppAttracted").disabled]);
  ok(!open[0] && !open[1], `Snorlax vs Tauros: both enabled (${open.map((d) => !d)})`);
}

console.log("-- Record a turn: your flinch and the opponent's confusion self-hit --");
{
  const { scoreReportedTurn, OUTCOME } = await import("./scorekeeper.js");
  await pick(PANEL_SNORLAX, "Kangaskhan 1");
  await setControls({ mindYou: "0", skillYou: "0", mindOpp: "0", skillOpp: "0" });
  const oppMove = FRONTIER_POOL["Kangaskhan 1"].moves[0];
  await setControls({ skYouMove: "Body Slam", skYouOutcome: OUTCOME.FLINCH, skOppMove: oppMove, skOppOutcome: OUTCOME.CONFUSION_SELF });
  const enabled = await page.evaluate(() => ["skYouOutcome", "skOppOutcome"].map((id) =>
    [...document.getElementById(id).options].filter((o) => !o.disabled).map((o) => o.value)));
  ok(enabled[0].includes("FLINCH") && enabled[1].includes("CONFUSION_SELF") && enabled[1].includes("ATTRACT") && enabled[1].includes("FLINCH"),
    `the outcomes are selectable (you: ${enabled[0]}; opp: ${enabled[1]})`);
  await page.click("#skRecord");
  const boxes = await page.evaluate(() => ["mindYou", "skillYou", "mindOpp", "skillOpp"].map((id) => Number(document.getElementById(id).value)));
  const skErr = (await page.textContent("#skError")).trim();
  const e = FRONTIER_POOL["Kangaskhan 1"];
  const r = scoreReportedTurn(buildMon(parseShowdownText(PANEL_SNORLAX)),
    buildFrontierOpponent(getOpponentConfig("Kangaskhan 1", { ...(e.abilities.length > 1 ? { ability: e.abilities[0] } : {}), ivTier: Math.max(...e.ivTiers) })),
    { you: { move: "Body Slam", outcome: OUTCOME.FLINCH }, opp: { move: oppMove, outcome: OUTCOME.CONFUSION_SELF } });
  const want = [r.dMindYou, r.dSkillYou, r.dMindOpp, r.dSkillOpp];
  ok(!skErr && JSON.stringify(boxes) === JSON.stringify(want), `boxes ${JSON.stringify(boxes)} == scorer ${JSON.stringify(want)} (${skErr || "no error"})`);
}

// ── Moves so far: a turn-2 / turn-3 re-solve equals the engine's own subtree ──
// The turn-1 search already holds every later situation as a subtree, with
// the AI's move history (F2c) recorded by the search itself. Entering that
// situation into the page -- HP, stages, Mind/Skill, "first turn" off, and the
// moves so far -- must give exactly the subtree. Starmie (Recover) vs Tyrogue 1
// (AI_CV_Protect reads the target's RESTORE_HP): after turn 1 "You Recover; Opp
// Double Team" the subtree is Ice Beam 0.930 (the page without the moves so far
// said Surf 0.929); after turn 2 "You Ice Beam (MISSES); Opp Double Team" it is
// Surf 0.735 (0.683 without the AI's history of the turn-1 Recover).
console.log("-- Moves so far: turn-2 and turn-3 re-solves match the engine's subtree --");
{
  const STARMIE = `Starmie @ Leftovers
Ability: Natural Cure
EVs: 252 SpA / 252 Spe
Timid Nature
- Surf
- Ice Beam
- Thunderbolt
- Recover`;
  const e = FRONTIER_POOL["Tyrogue 1"];
  const cfg = getOpponentConfig("Tyrogue 1", { ...(e.abilities.length > 1 ? { ability: e.abilities[0] } : {}), ivTier: Math.max(...e.ivTiers) });
  const { result } = analyzeMatchup(parseShowdownText(STARMIE), cfg, { tree: true });
  const b1 = result.allOptions.find((o) => o.move === "Recover").branches.find((b) => b.label === "You uses Recover; Opp uses Double Team");
  const b2 = b1.subtree.allOptions.find((o) => o.move === "Ice Beam").branches.find((b) => b.label === "You uses Ice Beam (MISSES); Opp uses Double Team");
  const fmt = (n) => `${n.move}  —  P(win) = ${n.winProb.toFixed(3)}`;
  const stageControls = (prefix, st) => page.evaluate(({ prefix, st }) => {
    document.querySelectorAll(prefix).forEach((el) => { el.value = String(st[el.dataset.stat] ?? 0); });
  }, { prefix, st });
  const enter = async (b, turn, moves) => {
    await pick(STARMIE, "Tyrogue 1");
    await stageControls(".stage-select", b.state.youStages);
    await stageControls(".opp-stage-select", b.state.oppStages);
    await setControls({
      [`turn${turn}`]: true, oppFirstTurn: false,
      youCurrentHp: String(b.state.yourHpPct), oppCurrentHp: String(b.state.oppHpPct),
      mindYou: String(b.state.mindYou), mindOpp: String(b.state.mindOpp), skillYou: String(b.state.skillYou), skillOpp: String(b.state.skillOpp),
      ...moves,
    });
    return (await page.textContent("#bestMoveDisplay")).trim();
  };
  pageErrors.length = 0;
  const shown2 = await enter(b1, 2, { youMoveT1: "Recover", oppMoveLast: "Double Team" });
  ok(shown2 === fmt(b1.subtree), `turn 2: page "${shown2}" == subtree "${fmt(b1.subtree)}"`);
  const old2 = await enter(b1, 2, { youMoveT1: "", oppMoveLast: "" });
  ok(old2 !== fmt(b1.subtree), `...and without the moves so far it would differ ("${old2}")`);
  const shown3 = await enter(b2, 3, { youMoveT1: "Recover", youMoveT2: "Ice Beam", oppMoveLast: "Double Team" });
  ok(shown3 === fmt(b2.subtree), `turn 3: page "${shown3}" == subtree "${fmt(b2.subtree)}"`);
  const vis = await page.evaluate(() => [document.getElementById("movesSoFar").hidden, document.getElementById("youMoveT2Wrap").hidden]);
  ok(!vis[0] && !vis[1], `on turn 3 both your earlier moves are asked for (hidden: ${vis})`);
  ok(pageErrors.length === 0, `no error on the page (${pageErrors.join(" | ") || "none"})`);
  // back to a fresh turn 1 for anything after this
  await setControls({ turn1: true, oppFirstTurn: true, youCurrentHp: "100", oppCurrentHp: "100", mindYou: "0", mindOpp: "0", skillYou: "0", skillOpp: "0", youMoveT1: "", youMoveT2: "", oppMoveLast: "" });
  await stageControls(".stage-select", {}); await stageControls(".opp-stage-select", {});
}

// ── The plan (ui-logic.js buildPlan) against the search tree it reads ──────
// Hoothoot 1: seven turn-1 outcomes, one splitting on HP into two next moves.
// Invariants, on the engine's own tree (analyzeMatchup, tree retained):
// probabilities sum to 1 at every level; the P(win)-weighted mean over a
// level's outcomes equals the node's P(win); every branch's own best next move
// appears in its outcome group with an HP range covering that branch. Then the
// page's rendered plan must list the same outcomes and next moves.
console.log("-- The plan: invariants on the tree, and the page renders it --");
{
  const { buildPlan } = await import("../site/ui-logic.js");
  const e = FRONTIER_POOL["Hoothoot 1"];
  const cfg = getOpponentConfig("Hoothoot 1", { ...(e.abilities.length > 1 ? { ability: e.abilities[0] } : {}), ivTier: Math.max(...e.ivTiers) });
  const { result } = analyzeMatchup(parseShowdownText(PANEL_SNORLAX), cfg, { tree: true });
  const plan = buildPlan(result, 3);
  const bad = [];
  const check = (pl, node, where) => {
    const sum = pl.outcomes.reduce((a, o) => a + o.p, 0);
    if (Math.abs(sum - 1) > 1e-9) bad.push(`${where}: outcome p sums to ${sum}`);
    const ev = pl.outcomes.reduce((a, o) => a + o.p * o.next.reduce((b, n) => b + n.p * n.winProb, 0), 0);
    if (node && Math.abs(ev - node.winProb) > 1e-9) bad.push(`${where}: E[P(win)] ${ev} != node ${node.winProb}`);
    for (const o of pl.outcomes) {
      const ns = o.next.reduce((a, n) => a + n.p, 0);
      if (Math.abs(ns - 1) > 1e-9) bad.push(`${where} / ${o.label}: next p sums to ${ns}`);
      for (const n of o.next) if (n.plan) check(n.plan, null, `${where} / ${o.label} / ${n.move}`);
    }
  };
  check(plan, result, "turn 1");
  const opt = result.allOptions.find((o) => o.move === result.move);
  for (const b of opt.branches) {
    const g = plan.outcomes.find((o) => o.label === b.label);
    const want = b.subtree.isTerminal ? null : b.subtree.move;
    const n = g?.next.find((x) => x.move === want);
    const inside = (v, [lo, hi]) => v >= lo - 1e-9 && v <= hi + 1e-9;
    if (!n || !inside(b.state.oppHpPct, n.oppHp) || !inside(b.state.yourHpPct, n.youHp)) bad.push(`branch "${b.label}" -> ${want} not covered`);
  }
  ok(bad.length === 0, `plan invariants hold on ${opt.branches.length} turn-1 branches (${bad.slice(0, 3).join("; ") || "none broken"})`);

  await pick(PANEL_SNORLAX, "Hoothoot 1");
  const rendered = await page.evaluate(() => [...document.querySelectorAll("#planDisplay > ul.plan-outcomes > li")].map((li) => ({
    label: li.querySelector(":scope > .plan-label").textContent,
    next: [...li.querySelectorAll(":scope > ul.plan-next > li > b")].map((x) => x.textContent),
  })));
  const want = plan.outcomes.map((o) => ({ label: o.label, next: o.next.filter((n) => n.move).map((n) => n.move) }));
  ok(JSON.stringify(rendered) === JSON.stringify(want), `the page renders the plan: ${rendered.length} outcomes, first "${rendered[0]?.label}" -> ${rendered[0]?.next}`);
}

console.log("-- Spikes says why it is inert --");
{
  const label = (await page.textContent('label[for="youSpikes"]')).trim();
  ok(label === "Spikes (no effect here)", `label "${label}"`);
}

await browser.close();
server.close();
console.log();
console.log(failures === 0 ? "ALL PASS -- site in the browser agrees with the engine" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

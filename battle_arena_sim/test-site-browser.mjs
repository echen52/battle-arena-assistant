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

await browser.close();
server.close();
console.log();
console.log(failures === 0 ? "ALL PASS -- site in the browser agrees with the engine" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

import {
  SPECIES_LIST, MOVE_LIST, NATURE_NAMES, OPPONENT_SET_NAMES,
  getSpeciesAbilities, OPPONENT_SETS,
} from "./pokemon-data.js";
import {
  freshMatchState, solve, resolveOpponentBySetName,
  serializeToShowdown, parseShowdownText,
  loadCustomSets, saveCustomSet, deleteCustomSet,
} from "./ui-logic.js";

const $ = (id) => document.getElementById(id);

// ── Populate static dropdowns ──────────────────────────────────────────
function fillSelect(select, options, { withBlank = false } = {}) {
  select.innerHTML = "";
  if (withBlank) select.appendChild(new Option("", ""));
  for (const opt of options) select.appendChild(new Option(opt, opt));
}

function fillStageSelect(select) {
  select.innerHTML = "";
  for (let s = -6; s <= 6; s++) {
    const opt = new Option((s > 0 ? "+" : "") + s, String(s));
    if (s === 0) opt.selected = true;
    select.appendChild(opt);
  }
}

fillSelect($("youSpecies"), SPECIES_LIST);
fillSelect($("youNature"), NATURE_NAMES);
fillSelect($("oppNature"), NATURE_NAMES);
fillSelect($("oppSpecies"), SPECIES_LIST);
fillSelect($("oppSetName"), OPPONENT_SET_NAMES);
document.querySelectorAll(".move-select, .opp-move-select").forEach((sel) => fillSelect(sel, MOVE_LIST, { withBlank: true }));
document.querySelectorAll(".stage-select, .opp-stage-select").forEach(fillStageSelect);

function refreshAbilityOptions(speciesSelectId, abilitySelectId) {
  const species = $(speciesSelectId).value;
  fillSelect($(abilitySelectId), getSpeciesAbilities(species));
}
refreshAbilityOptions("youSpecies", "youAbility");
refreshAbilityOptions("oppSpecies", "oppAbility");
$("youSpecies").addEventListener("change", () => refreshAbilityOptions("youSpecies", "youAbility"));
$("oppSpecies").addEventListener("change", () => refreshAbilityOptions("oppSpecies", "oppAbility"));

// ── Custom-set picker ───────────────────────────────────────────────────
function refreshCustomSetPicker() {
  const sets = loadCustomSets();
  fillSelect($("youLoadSet"), Object.keys(sets), { withBlank: true });
}
refreshCustomSetPicker();

// ── Build-manually collapsible panel (mirrors the Battle Palace Assistant's
// Custom Set Calculator: collapsed by default, chevron-toggle open) ────────
function openManualPanel() {
  $("youManualBody").classList.add("open");
  $("youManualChevron").classList.add("open");
}
$("youManualToggle").addEventListener("click", () => {
  $("youManualBody").classList.toggle("open");
  $("youManualChevron").classList.toggle("open");
});

// ── Field panel toggle ──────────────────────────────────────────────────
$("fieldToggle").addEventListener("click", () => {
  const panel = $("fieldPanel");
  panel.style.display = panel.style.display === "none" ? "" : "none";
});

// ── Opponent mode toggle (named set vs manual species build) ────────────
function updateOppMode() {
  const mode = document.querySelector("input[name='oppMode']:checked").value;
  $("oppSetPicker").classList.toggle("hidden", mode !== "set");
  $("oppManualBuild").classList.toggle("hidden", mode !== "species");
}
document.querySelectorAll("input[name='oppMode']").forEach((r) => r.addEventListener("change", updateOppMode));
updateOppMode();

// When a named opponent set is picked, check if it needs an explicit ability
// choice (dual-ability sets — the adapter throws rather than guessing, same
// discipline as the sweep methodology documented in HANDOFF §8).
$("oppSetName").addEventListener("change", () => {
  const name = $("oppSetName").value;
  const entry = OPPONENT_SETS[name];
  const abilitySelect = $("oppAbilityChoice");
  if (entry && entry.abilities.length > 1) {
    fillSelect(abilitySelect, entry.abilities);
    abilitySelect.style.display = "";
  } else {
    abilitySelect.style.display = "none";
  }
  renderOppSetMoves(entry);
});
$("oppSetName").dispatchEvent(new Event("change"));

// Read-only display of the selected set's real 4 moves (pure surfacing of
// opponent-full-data.js — no engine work, just showing data that already
// exists) — right under the set picker.
function renderOppSetMoves(entry) {
  const el = $("oppSetMoves");
  if (!entry) { el.innerHTML = ""; return; }
  el.innerHTML = "Moves: " + entry.moves.map((m) => `<span class="move-chip">${m}</span>`).join(" ");
}

// ── Linked current-HP / percent-HP inputs + health bar (ported PATTERN
// from turskain: two linked inputs + CSS-gradient div, re-skinned) ───────
function drawHealthBar(barEl, percent) {
  const p = Math.max(0, Math.min(100, percent));
  const color = p > 50 ? "#2ecc71" : p > 20 ? "#e6c229" : "#e74c3c";
  barEl.style.background = `linear-gradient(to right, ${color} ${p}%, #0f3460 0%)`;
}

function wireHpInputs(currentId, percentId, barId) {
  const currentInput = $(currentId), percentInput = $(percentId), bar = $(barId);
  currentInput.addEventListener("input", () => {
    const current = Math.max(0, Math.min(100, Number(currentInput.value) || 0));
    percentInput.value = current;
    drawHealthBar(bar, current);
  });
  percentInput.addEventListener("input", () => {
    const percent = Math.max(0, Math.min(100, Number(percentInput.value) || 0));
    currentInput.value = percent;
    drawHealthBar(bar, percent);
  });
  drawHealthBar(bar, Number(currentInput.value) || 100);
}
wireHpInputs("youCurrentHp", "youPercentHp", "youHpBar");
wireHpInputs("oppCurrentHp", "oppPercentHp", "oppHpBar");

// ── Reflect/Light Screen checkbox -> default turns-remaining wiring ──────
function wireScreenCheckbox(checkboxId, numId, defaultTurns = 5) {
  const checkbox = $(checkboxId), num = $(numId);
  checkbox.addEventListener("change", () => {
    if (checkbox.checked && !num.value) num.value = defaultTurns;
    if (!checkbox.checked) num.value = "";
  });
  num.addEventListener("input", () => {
    checkbox.checked = num.value !== "" && Number(num.value) > 0;
  });
}
wireScreenCheckbox("youReflect", "youReflectTurnsNum");
wireScreenCheckbox("youLightScreen", "youLightScreenTurnsNum");
wireScreenCheckbox("oppReflect", "oppReflectTurnsNum");
wireScreenCheckbox("oppLightScreen", "oppLightScreenTurnsNum");

// ── Weather turns default: when a real weather is picked with no turns
// entered yet, leave it blank (= permanent) rather than guessing 5, since
// "permanent" vs "5 turns left" is a real distinction the engine models
// (weatherTurns: null) and the user, not this tool, knows which is true.

// ── Config builders (read the DOM into engine-shaped config objects) ────
function readEvIvBlock(selector, ivSelector) {
  const evs = {};
  document.querySelectorAll(selector).forEach((el) => { evs[el.dataset.stat] = Number(el.value) || 0; });
  const ivs = {};
  if (ivSelector) {
    document.querySelectorAll(ivSelector).forEach((el) => { ivs[el.dataset.stat] = Number(el.value); });
  }
  return { evs, ivs };
}

function readMoves(selector) {
  return Array.from(document.querySelectorAll(selector)).map((s) => s.value).filter((v) => v);
}

function readStages(selector) {
  const stages = { atk: 0, def: 0, spa: 0, spd: 0, spe: 0, evasion: 0, accuracy: 0 };
  document.querySelectorAll(selector).forEach((el) => { stages[el.dataset.stat] = Number(el.value) || 0; });
  return stages;
}

function buildYouConfig() {
  const { evs, ivs } = readEvIvBlock(".ev-input", ".iv-input");
  return {
    species: $("youSpecies").value,
    level: Number($("youLevel").value) || 50,
    nature: $("youNature").value,
    ability: $("youAbility").value,
    item: $("youItem").value || null,
    evs, ivs,
    moves: readMoves(".move-select"),
  };
}

function buildOppConfig() {
  const mode = document.querySelector("input[name='oppMode']:checked").value;
  if (mode === "set") {
    const name = $("oppSetName").value;
    const abilityChoice = $("oppAbilityChoice");
    const abilityOverride = abilityChoice.style.display !== "none" ? abilityChoice.value : null;
    return resolveOpponentBySetName(name, abilityOverride);
  }
  const { evs } = readEvIvBlock(".opp-ev-input");
  return {
    species: $("oppSpecies").value,
    level: Number($("oppLevel").value) || 50,
    nature: $("oppNature").value,
    ability: $("oppAbility").value,
    item: $("oppItem").value || null,
    evs, ivs: {},
    moves: readMoves(".opp-move-select"),
  };
}

function buildMatchState() {
  // yourUsablePartyMons/oppUsablePartyMons are deliberately NOT exposed as UI
  // fields — freshMatchState() hardcodes them at 2/2, the exact value the
  // canonical regression baseline (Metagross vs Umbreon 4 = 0.919) was
  // computed with (analyzeMatchup's own defaults, confirmed unoverridden in
  // test-matchup.js). Removing the field must not let this silently drift to
  // an arbitrary default — see HANDOFF.md §14.
  const s = freshMatchState();
  s.turn = Number(document.querySelector("input[name='turn']:checked").value);
  s.yourHpPct = Number($("youCurrentHp").value) || 0;
  s.oppHpPct = Number($("oppCurrentHp").value) || 0;
  s.youStages = readStages(".stage-select");
  s.oppStages = readStages(".opp-stage-select");
  s.youStatus = $("youStatus").value || null;
  s.oppStatus = $("oppStatus").value || null;
  s.weatherType = document.querySelector("input[name='weather']:checked").value || null;
  const wt = $("weatherTurns").value;
  s.weatherTurns = wt === "" ? null : Number(wt);
  s.youReflectTurns = $("youReflect").checked ? (Number($("youReflectTurnsNum").value) || 5) : null;
  s.oppReflectTurns = $("oppReflect").checked ? (Number($("oppReflectTurnsNum").value) || 5) : null;
  s.youLightScreenTurns = $("youLightScreen").checked ? (Number($("youLightScreenTurnsNum").value) || 5) : null;
  s.oppLightScreenTurns = $("oppLightScreen").checked ? (Number($("oppLightScreenTurnsNum").value) || 5) : null;
  return s;
}

// ── The recalculation loop: any calc-trigger change re-solves from
// scratch, using the CURRENT observed state — this is the live re-solve. ──
function recalculate() {
  const errorEl = $("errorDisplay");
  errorEl.textContent = "";
  let youConfig, oppConfig, matchState;
  try {
    youConfig = buildYouConfig();
    oppConfig = buildOppConfig();
    matchState = buildMatchState();
    if (!youConfig.species || !oppConfig.species) return;
    if (youConfig.moves.length === 0) { errorEl.textContent = "Pick at least one move for your Pokemon."; return; }

    const mindYouSoFar = Number($("mindYou").value) || 0;
    const skillYouSoFar = Number($("skillYou").value) || 0;
    const mindOppSoFar = Number($("mindOpp").value) || 0;
    const skillOppSoFar = Number($("skillOpp").value) || 0;
    matchState.mindYou = mindYouSoFar;
    matchState.skillYou = skillYouSoFar;
    matchState.mindOpp = mindOppSoFar;
    matchState.skillOpp = skillOppSoFar;

    const { result, oppMoveDist, turnsRemaining } = solve(youConfig, oppConfig, matchState);
    renderResult(result, matchState);
    renderOppMoveDist(oppMoveDist, oppConfig.moves, turnsRemaining);
  } catch (err) {
    errorEl.textContent = "Error: " + err.message;
    console.error(err);
  }
}

// This turn's opponent move-selection distribution — a direct read of the
// engine's own AI model (chooseOpponentMoves), not a new computation (see
// ui-logic.js's solve() and HANDOFF §14). `chooseOpponentMoves` only returns
// moves that win at least one branch's argmax (HANDOFF §15/§17) — a move that
// never wins is simply ABSENT from its result, not present with prob 0. That's
// the right shape for the engine (only enumerate real winners), but the wrong
// shape for coaching display: a move sitting at 0% this turn is itself useful
// information (e.g. Regice 4's Ice Beam/Hail vs Latios, both ~0.76% — see
// HANDOFF). So this always renders every move in the opponent's actual
// moveset (`moveList`), filling in an explicit 0.0% for anything missing from
// the engine's returned distribution, rather than silently dropping it.
function renderOppMoveDist(oppMoveDist, moveList, turnsRemaining) {
  const rowsEl = $("oppMoveDistRows");
  if (!turnsRemaining || turnsRemaining <= 0) {
    rowsEl.innerHTML = '<span style="color:#666;">Match over — no more turns to choose a move.</span>';
    return;
  }
  const probByMove = new Map((oppMoveDist || []).map(({ move, prob }) => [move, prob]));
  const rows = (moveList || [])
    .filter((m) => m)
    .map((move) => ({ move, prob: probByMove.get(move) || 0 }))
    .sort((a, b) => b.prob - a.prob);
  rowsEl.innerHTML = rows.map(({ move, prob }) => {
    const pct = (prob * 100).toFixed(1);
    return `<div class="opp-move-dist-row">
      <span class="opp-move-dist-label">${move}</span>
      <span class="opp-move-dist-bar-wrap"><span class="opp-move-dist-bar" style="width:${pct}%"></span></span>
      <span class="opp-move-dist-pct">${pct}%</span>
    </div>`;
  }).join("");
}

function renderResult(result, matchState) {
  $("bodyYouDisplay").textContent = matchState.yourHpPct.toFixed(1) + "%";
  $("bodyOppDisplay").textContent = matchState.oppHpPct.toFixed(1) + "%";

  if (result.isTerminal) {
    $("bestMoveDisplay").textContent = "Match over — judge decides (P(win)=" + result.winProb.toFixed(3) + ")";
    document.querySelector("#optionsTable tbody").innerHTML = "";
    $("mindProjected").textContent = "—";
    $("skillProjected").textContent = "—";
    $("bodyProjected").textContent = "—";
    return;
  }

  $("bestMoveDisplay").textContent = result.move + "  —  P(win) = " + result.winProb.toFixed(3);

  const tbody = document.querySelector("#optionsTable tbody");
  tbody.innerHTML = "";
  for (const opt of result.allOptions) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${opt.move}</td><td>${opt.winProb.toFixed(3)}</td>`;
    tbody.appendChild(tr);
  }

  // Projected Mind/Skill/Body after the recommended move resolves: weighted
  // average across the recommended move's own branches (real engine
  // probabilities, not a guess) — same style of aggregation as
  // team-workflow.js's evaluateRound, just inlined here for display.
  const recommended = result.allOptions.find((o) => o.move === result.move);
  let mindYouSum = 0, skillYouSum = 0, mindOppSum = 0, skillOppSum = 0, hpYouSum = 0, hpOppSum = 0, totalP = 0;
  for (const b of recommended.branches) {
    mindYouSum += b.prob * b.state.mindYou;
    skillYouSum += b.prob * b.state.skillYou;
    mindOppSum += b.prob * b.state.mindOpp;
    skillOppSum += b.prob * b.state.skillOpp;
    hpYouSum += b.prob * b.state.yourHpPct;
    hpOppSum += b.prob * b.state.oppHpPct;
    totalP += b.prob;
  }
  if (totalP > 0) {
    $("mindProjected").textContent = (mindYouSum / totalP).toFixed(2) + " – " + (mindOppSum / totalP).toFixed(2);
    $("skillProjected").textContent = (skillYouSum / totalP).toFixed(2) + " – " + (skillOppSum / totalP).toFixed(2);
    $("bodyProjected").textContent = (hpYouSum / totalP).toFixed(1) + "% – " + (hpOppSum / totalP).toFixed(1) + "%";
  }
}

// ── Custom-set save/load/import/export ──────────────────────────────────
$("youSaveSet").addEventListener("click", () => {
  const config = buildYouConfig();
  const name = prompt("Save as (name):", config.species + " custom");
  if (!name) return;
  saveCustomSet(name, config);
  refreshCustomSetPicker();
});

$("youLoadSet").addEventListener("change", () => {
  const name = $("youLoadSet").value;
  if (!name) return;
  const sets = loadCustomSets();
  const config = sets[name];
  if (!config) return;
  applyYouConfig(config);
  recalculate();
});

$("youDeleteSet").addEventListener("click", () => {
  const name = $("youLoadSet").value;
  if (!name) return;
  if (!confirm(`Delete saved set "${name}"?`)) return;
  deleteCustomSet(name);
  refreshCustomSetPicker();
});

function applyYouConfig(config) {
  $("youSpecies").value = config.species;
  refreshAbilityOptions("youSpecies", "youAbility");
  $("youLevel").value = config.level || 50;
  $("youNature").value = config.nature || "Hardy";
  if (config.ability) $("youAbility").value = config.ability;
  $("youItem").value = config.item || "";
  document.querySelectorAll(".ev-input").forEach((el) => { el.value = (config.evs && config.evs[el.dataset.stat]) || 0; });
  document.querySelectorAll(".iv-input").forEach((el) => { el.value = (config.ivs && config.ivs[el.dataset.stat] != null) ? config.ivs[el.dataset.stat] : 31; });
  const moveSelects = document.querySelectorAll(".move-select");
  moveSelects.forEach((sel, i) => { sel.value = (config.moves && config.moves[i]) || ""; });
}

$("youExport").addEventListener("click", () => {
  const config = buildYouConfig();
  $("youImportExportText").value = serializeToShowdown(config);
});

$("youImport").addEventListener("click", () => {
  try {
    const config = parseShowdownText($("youImportExportText").value);
    // Species must exist in the dex — surfaced as a clear error, not a
    // silent no-op, if the pasted text has a typo'd or unsupported species.
    if (!SPECIES_LIST.includes(config.species)) {
      throw new Error(`"${config.species}" is not in species-data.js — check spelling.`);
    }
    applyYouConfig(config);
    openManualPanel();
    recalculate();
  } catch (err) {
    $("errorDisplay").textContent = "Import error: " + err.message;
  }
});

// ── Wire the single delegated recalculate listener (ported PATTERN from
// turskain: one listener on a shared class, not per-field handlers) ──────
document.addEventListener("change", (e) => { if (e.target.classList.contains("calc-trigger")) recalculate(); });
document.addEventListener("input", (e) => { if (e.target.classList.contains("calc-trigger")) recalculate(); });

// ── Initial state: a sensible default so the tool shows something on load
// (the canonical regression matchup — Metagross vs Umbreon 4) ───────────
function loadDefaultDemo() {
  applyYouConfig({
    species: "Metagross", level: 50, nature: "Adamant", ability: "Clear Body", item: "Cheri Berry",
    evs: { atk: 252, spd: 4, spe: 252 }, ivs: {},
    moves: ["Meteor Mash", "Earthquake", "Shadow Ball", "Explosion"],
  });
  $("oppSetName").value = "Umbreon 4";
  $("oppSetName").dispatchEvent(new Event("change"));
}
loadDefaultDemo();
recalculate();

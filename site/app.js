import {
  SPECIES_LIST, MOVE_LIST, NATURE_NAMES, OPPONENT_SET_NAMES,
  getSpeciesAbilities, OPPONENT_SETS, canAttractPair,
} from "./pokemon-data.js";
import {
  freshMatchState, solve, resolveOpponentBySetName,
  parseShowdownText,
  loadCustomSets, saveCustomSet, deleteCustomSet,
  scoreTurn, OUTCOME, PHASE, UNSUPPORTED_OPP, isTwoTurnMove,
} from "./ui-logic.js";

const $ = (id) => document.getElementById(id);

// Reflect/Light Screen ON value — see buildMatchState's comment for why this
// isn't null (weather's permanent sentinel); any value above the fixed
// 3-turn match length keeps the screen active for the whole match.
const SCREEN_ACTIVE_TURNS = 5;

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

// ── Filtering combobox for the two long lists (opponent set: ~552 entries;
// species: ~386) — a native <select> lets you type-to-jump but doesn't
// NARROW the visible options, which is the actual problem at this size.
// Pattern ported from the Battle Palace Assistant's move-autocomplete
// (.move-ac/.move-ac-item/.move-ac.open, echen52/battle-palace-assistant),
// re-skinned to the warm theme — see HANDOFF.md. The real <select> stays in
// the DOM (hidden via .hidden-select) as the actual state everything else
// reads/writes; this is a picker UI layered on top, not a new data path —
// selecting a match sets select.value and dispatches a real "change" event,
// so every existing listener (recalculate, ability-refresh, dual-ability
// disambiguation, move-chip render) fires exactly as it did with a plain
// <select>. Short lists (stat stages, saved sets, weather, status) are left
// as native selects — typeahead isn't the problem there.
function setupCombobox(selectId, inputId, listId, options) {
  const select = $(selectId), input = $(inputId), list = $(listId);
  let hi = -1;

  function setValue(value) {
    select.value = value;
    input.value = value;
  }

  function closeList() {
    list.classList.remove("open");
    list.innerHTML = "";
    hi = -1;
  }

  function choose(value) {
    setValue(value);
    closeList();
    select.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function renderList(matches) {
    hi = -1;
    if (!matches.length) {
      list.innerHTML = '<div class="combo-empty">No matches</div>';
      list.classList.add("open");
      return;
    }
    list.innerHTML = matches.map((opt) => `<div class="combo-item" data-value="${opt}">${opt}</div>`).join("");
    list.classList.add("open");
    list.querySelectorAll(".combo-item").forEach((el) => {
      // mousedown (not click) + preventDefault so the input never blurs
      // before the selection registers — same reasoning as Palace's own
      // move-ac implementation.
      el.addEventListener("mousedown", (e) => { e.preventDefault(); choose(el.dataset.value); });
    });
  }

  function filterAndRender() {
    const q = input.value.trim().toLowerCase();
    if (!q) { closeList(); return; }
    const starts = options.filter((o) => o.toLowerCase().startsWith(q));
    const rest = options.filter((o) => !o.toLowerCase().startsWith(q) && o.toLowerCase().includes(q));
    renderList(starts.concat(rest).slice(0, 50));
  }

  input.addEventListener("input", filterAndRender);
  input.addEventListener("focus", () => { input.select(); filterAndRender(); });

  input.addEventListener("keydown", (e) => {
    const items = list.querySelectorAll(".combo-item");
    if (e.key === "ArrowDown") {
      e.preventDefault();
      hi = Math.min(hi + 1, items.length - 1);
      items.forEach((el, i) => el.classList.toggle("hi", i === hi));
      if (hi >= 0) items[hi].scrollIntoView({ block: "nearest" });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      hi = Math.max(hi - 1, -1);
      items.forEach((el, i) => el.classList.toggle("hi", i === hi));
      if (hi >= 0) items[hi].scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter") {
      if (hi >= 0 && items[hi]) { e.preventDefault(); choose(items[hi].dataset.value); }
    } else if (e.key === "Escape") {
      closeList();
    }
  });

  input.addEventListener("blur", () => {
    setTimeout(() => {
      closeList();
      // The visible text must always match the real <select> value (what
      // actually feeds the engine) — revert if the user typed something and
      // clicked away without picking a real match.
      if (input.value !== select.value) input.value = select.value;
    }, 150);
  });

  input.value = select.value; // initial sync with the already-filled select
  return setValue;
}

const setYouSpecies = setupCombobox("youSpecies", "youSpeciesInput", "youSpeciesList", SPECIES_LIST);
const setOppSpecies = setupCombobox("oppSpecies", "oppSpeciesInput", "oppSpeciesList", SPECIES_LIST);
const setOppSetName = setupCombobox("oppSetName", "oppSetNameInput", "oppSetNameList", OPPONENT_SET_NAMES);

function refreshAbilityOptions(speciesSelectId, abilitySelectId) {
  const species = $(speciesSelectId).value;
  fillSelect($(abilitySelectId), getSpeciesAbilities(species));
}
refreshAbilityOptions("youSpecies", "youAbility");
refreshAbilityOptions("oppSpecies", "oppAbility");
$("youSpecies").addEventListener("change", () => refreshAbilityOptions("youSpecies", "youAbility"));
$("oppSpecies").addEventListener("change", () => refreshAbilityOptions("oppSpecies", "oppAbility"));

// ── Custom-set picker: top dropdown (load-only) + chip list (load or ✕
// delete), both reading the same localStorage-backed store — see
// HANDOFF.md for the save/delete restructure this session. ─────────────
function refreshCustomSetPicker() {
  const sets = loadCustomSets();
  fillSelect($("youLoadSet"), Object.keys(sets), { withBlank: true });
}

function refreshSavedSets() {
  refreshCustomSetPicker();
  renderSavedChips();
}
refreshSavedSets();

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
  barEl.style.background = `linear-gradient(to right, ${color} ${p}%, #33261a 0%)`;
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
  // Confusion/Attraction: independent volatile toggles, stackable with the
  // primary status above and with each other — real, You-side-only engine
  // fields (see HANDOFF.md). Opponent-side toggles are disabled in the
  // markup (the engine has no branch for them at all), so there's nothing
  // to read for the opponent here.
  s.metagrossConfused = $("youConfused").checked;
  s.youAttracted = $("youAttracted").checked;
  // Weather/Reflect/Light Screen are plain on/off toggles in this UI — no
  // turn-count input. ON passes the engine's own "active indefinitely"
  // value: weatherTurns: null (engine convention — see logic.js's ability-
  // set-weather comment, "null turns = permanent when weatherType is set").
  // Reflect/Light Screen have no null-permanent sentinel in the engine (they
  // always count down), so ON uses SCREEN_ACTIVE_TURNS, comfortably above
  // the fixed 3-turn match length so it never decrements to off mid-match.
  s.weatherType = document.querySelector("input[name='weather']:checked").value || null;
  s.weatherTurns = null;
  s.youReflectTurns = $("youReflect").checked ? SCREEN_ACTIVE_TURNS : null;
  s.oppReflectTurns = $("oppReflect").checked ? SCREEN_ACTIVE_TURNS : null;
  s.youLightScreenTurns = $("youLightScreen").checked ? SCREEN_ACTIVE_TURNS : null;
  s.oppLightScreenTurns = $("oppLightScreen").checked ? SCREEN_ACTIVE_TURNS : null;
  // Round-start HP (#13): the Body-score baseline. Read fresh each solve. Empty
  // input = untouched -> leave the key ABSENT (not null) so the denylist doesn't
  // forward it and buildStartState defaults yourHpPctAtStart to current HP —
  // byte-identical to pre-#13 behavior. A filled value (even 100) IS forwarded,
  // pinning the baseline distinct from current HP. Must stay absent-when-empty:
  // a null would flow through the denylist and overwrite the engine's default.
  const youStart = $("youStartHp").value.trim();
  if (youStart !== "") s.yourHpPctAtStart = Number(youStart);
  const oppStart = $("oppStartHp").value.trim();
  if (oppStart !== "") s.oppHpPctAtStart = Number(oppStart);
  return s;
}

// ── The recalculation loop: any calc-trigger change re-solves from
// scratch, using the CURRENT observed state — this is the live re-solve. ──
// Disables the You-side Attracted toggle (and force-unchecks it) whenever
// the current You/Opponent species pairing can NEVER be gender-compatible
// (either side genderless, or both fixed to the same single gender) — the
// engine's own override path doesn't validate this itself (see
// buildMatchState's comment), so an impossible state must never reach it.
// Runs BEFORE buildMatchState() reads the checkbox, so a forced uncheck
// takes effect in the same solve, not one interaction late.
function updateAttractedGate(youSpecies, oppSpecies) {
  const checkbox = $("youAttracted"), label = $("youAttractedLabel");
  const possible = youSpecies && oppSpecies ? canAttractPair(youSpecies, oppSpecies) : true;
  checkbox.disabled = !possible;
  label.classList.toggle("btn-disabled", !possible);
  label.title = possible ? "" : "Not possible: this species pairing can never be gender-compatible (one side is genderless, or both resolve to the same fixed gender) — Attract could never land here.";
  if (!possible && checkbox.checked) checkbox.checked = false;
}

function recalculate() {
  const errorEl = $("errorDisplay");
  errorEl.textContent = "";
  let youConfig, oppConfig, matchState;
  try {
    youConfig = buildYouConfig();
    oppConfig = buildOppConfig();
    updateAttractedGate(youConfig.species, oppConfig.species);
    updateScorekeeperMoves(youConfig, oppConfig);
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
  // Body score, not raw HP: floor(current / round-start * 100), mirroring
  // evaluateTerminal (logic.js:4130) byte-for-byte so a cell reading 75 lines
  // up exactly with what the engine scores. matchState carries yourHpPctAtStart
  // only when the round-start field was filled (freshMatchState omits it), so
  // fall back to current HP — the engine's own default (a mon that entered at
  // its current HP is at full Body), matching buildStartState's default.
  const youStart = matchState.yourHpPctAtStart ?? matchState.yourHpPct;
  const oppStart = matchState.oppHpPctAtStart ?? matchState.oppHpPct;
  $("bodyYouDisplay").textContent = Math.floor(matchState.yourHpPct / youStart * 100) + "%";
  $("bodyOppDisplay").textContent = Math.floor(matchState.oppHpPct / oppStart * 100) + "%";

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
    // Weight the Body SCORE per branch, not raw HP — same floor(current /
    // round-start * 100) as the "so far" cells and evaluateTerminal. Each
    // forward-walk state carries its own baseline (cloneState threads
    // yourHpPctAtStart forward from buildStartState), so the projection is a
    // probability-weighted average of scores, not of raw HP percentages.
    hpYouSum += b.prob * Math.floor(b.state.yourHpPct / b.state.yourHpPctAtStart * 100);
    hpOppSum += b.prob * Math.floor(b.state.oppHpPct / b.state.oppHpPctAtStart * 100);
    totalP += b.prob;
  }
  if (totalP > 0) {
    $("mindProjected").textContent = (mindYouSum / totalP).toFixed(2) + " – " + (mindOppSum / totalP).toFixed(2);
    $("skillProjected").textContent = (skillYouSum / totalP).toFixed(2) + " – " + (skillOppSum / totalP).toFixed(2);
    $("bodyProjected").textContent = (hpYouSum / totalP).toFixed(1) + "% – " + (hpOppSum / totalP).toFixed(1) + "%";
  }
}

// ── Custom-set save/load/delete + chip list ──────────────────────────────
// One consolidated "Save Set" action (renamed/repurposed from the old
// "Export current" button — see HANDOFF.md) next to Parse Set; deletion
// lives on the chips below, not as a separate top-of-panel button. The top
// "Saved Sets" dropdown stays load-only, unchanged.
$("youSaveSet").addEventListener("click", () => {
  const config = buildYouConfig();
  const name = prompt("Save as (name):", config.species + " custom");
  if (!name) return;
  saveCustomSet(name, config);
  refreshSavedSets();
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

// Palace-style chips (echen52/battle-palace-assistant's .saved-chip): click
// the chip to load that set, click its ✕ to delete — updates the chip list
// AND the top dropdown, since both read the same localStorage store.
function renderSavedChips() {
  const container = $("youSavedChips");
  const sets = loadCustomSets();
  const names = Object.keys(sets);
  if (!names.length) {
    container.innerHTML = '<span class="no-saved">No saved sets yet.</span>';
    return;
  }
  container.innerHTML = names.map((name) => `
    <div class="saved-chip" data-name="${name}">
      <span class="chip-label">${name}</span>
      <span class="del-btn" data-del="${name}" title="Delete">✕</span>
    </div>`).join("");

  container.querySelectorAll(".saved-chip").forEach((chip) => {
    chip.addEventListener("click", (e) => {
      if (e.target.dataset.del) return;
      const config = sets[chip.dataset.name];
      if (!config) return;
      applyYouConfig(config);
      openManualPanel();
      recalculate();
    });
    chip.querySelector(".del-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      deleteCustomSet(e.target.dataset.del);
      refreshSavedSets();
    });
  });
}

function applyYouConfig(config) {
  setYouSpecies(config.species);
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

// ── Scorekeeper (Record a turn) ─────────────────────────────────────────────
// Report one observed turn; drive the engine (via scoreTurn -> the shared
// scorekeeper path) and ADD the banked Mind/Skill deltas to the four editable
// "so far" boxes. The report controls are deliberately NOT calc-triggers and
// addToBox sets .value WITHOUT dispatching an event, so recording never
// re-solves and never overwrites a hand-edit — the widget's job ends at the boxes.
const SK_OUTCOMES = [
  { value: OUTCOME.HIT, label: "Hit" },
  { value: OUTCOME.MISSED, label: "Missed" },
  { value: OUTCOME.PROTECT, label: "Blocked (Protect/Detect)" },
  { value: OUTCOME.IMMOBILIZED, label: "Immobilized (para/freeze/sleep)" },
  { value: OUTCOME.CONFUSION_SELF, label: "Hurt itself (confusion)" },
  { value: OUTCOME.ATTRACT, label: "Immobilized (attract)" },
  { value: "FLINCH", label: "Flinched", unsupported: true }, // no engine flinch model — hand-score only
];
let skOutcomesInited = false;
const skUndoStack = [];

// Populate an outcome dropdown, greying the reports the drive model can't score
// for this side (never silently substituting a same-shape neighbor): FLINCH on
// either side, and confusion/attract on the opponent (engine has no branch).
function populateOutcomeSelect(sel, side) {
  sel.innerHTML = "";
  for (const o of SK_OUTCOMES) {
    const disabled = o.unsupported || (side === "opp" && UNSUPPORTED_OPP.has(o.value));
    const opt = document.createElement("option");
    opt.value = o.value;
    opt.textContent = disabled ? `${o.label} — score by hand` : o.label;
    opt.disabled = disabled;
    sel.appendChild(opt);
  }
}

function updatePhaseVisibility(prefix) {
  const phaseSel = $(prefix + "Phase");
  if (isTwoTurnMove($(prefix + "Move").value)) {
    if (!phaseSel.dataset.filled) {
      const c = document.createElement("option"); c.value = PHASE.CHARGE; c.textContent = "Charging (submerged/flew/dug)";
      const a = document.createElement("option"); a.value = PHASE.ATTACK; a.textContent = "Attack (surfaced/hit)";
      phaseSel.append(c, a);
      phaseSel.dataset.filled = "1";
    }
    phaseSel.hidden = false;
  } else {
    phaseSel.hidden = true;
  }
}

function updateScorekeeperMoves(youConfig, oppConfig) {
  fillSelect($("skYouMove"), (youConfig.moves || []).filter(Boolean));
  fillSelect($("skOppMove"), (oppConfig.moves || []).filter(Boolean));
  if (!skOutcomesInited) {
    populateOutcomeSelect($("skYouOutcome"), "you");
    populateOutcomeSelect($("skOppOutcome"), "opp");
    skOutcomesInited = true;
  }
  updatePhaseVisibility("skYou");
  updatePhaseVisibility("skOpp");
}

function readSideReport(prefix) {
  const move = $(prefix + "Move").value;
  let outcome = $(prefix + "Outcome").value;
  const phaseSel = $(prefix + "Phase");
  let phase = null;
  if (!phaseSel.hidden) {
    phase = phaseSel.value;
    if (phase === PHASE.CHARGE) outcome = OUTCOME.HIT; // a charge turn always "succeeds"
  }
  return { move, outcome, phase };
}

// Additive, non-dispatching: reads the CURRENT (possibly hand-edited) box value
// and adds the delta on top. No event fires, so no re-solve is triggered.
function skAddToBox(id, delta) {
  const box = $(id);
  box.value = (Number(box.value) || 0) + delta;
}

function skUpdateLog() {
  const n = skUndoStack.length;
  $("skLog").textContent = n ? `${n} turn${n > 1 ? "s" : ""} recorded` : "";
}

$("skYouMove").addEventListener("change", () => updatePhaseVisibility("skYou"));
$("skOppMove").addEventListener("change", () => updatePhaseVisibility("skOpp"));

$("skRecord").addEventListener("click", () => {
  const errEl = $("skError");
  errEl.textContent = "";
  try {
    const youConfig = buildYouConfig();
    const oppConfig = buildOppConfig();
    if (!youConfig.species || !oppConfig.species) { errEl.textContent = "Pick both Pokemon first."; return; }
    const report = { you: readSideReport("skYou"), opp: readSideReport("skOpp") };
    if (!report.you.move || !report.opp.move) { errEl.textContent = "Pick a move for each side."; return; }
    const d = scoreTurn(youConfig, oppConfig, report);
    skAddToBox("mindYou", d.dMindYou); skAddToBox("skillYou", d.dSkillYou);
    skAddToBox("mindOpp", d.dMindOpp); skAddToBox("skillOpp", d.dSkillOpp);
    skUndoStack.push(d);
    $("skUndo").disabled = false;
    skUpdateLog();
  } catch (e) {
    errEl.textContent = e.message.split("\n")[0];
  }
});

$("skUndo").addEventListener("click", () => {
  const d = skUndoStack.pop();
  if (!d) return;
  skAddToBox("mindYou", -d.dMindYou); skAddToBox("skillYou", -d.dSkillYou);
  skAddToBox("mindOpp", -d.dMindOpp); skAddToBox("skillOpp", -d.dSkillOpp);
  if (skUndoStack.length === 0) $("skUndo").disabled = true;
  skUpdateLog();
});

// ── Initial state: a sensible default so the tool shows something on load
// (the canonical regression matchup — Metagross vs Umbreon 4) ───────────
function loadDefaultDemo() {
  applyYouConfig({
    species: "Metagross", level: 50, nature: "Adamant", ability: "Clear Body", item: "Cheri Berry",
    evs: { atk: 252, spd: 4, spe: 252 }, ivs: {},
    moves: ["Meteor Mash", "Earthquake", "Shadow Ball", "Explosion"],
  });
  setOppSetName("Umbreon 4");
  $("oppSetName").dispatchEvent(new Event("change"));
}
loadDefaultDemo();
recalculate();

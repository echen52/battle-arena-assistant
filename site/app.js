import {
  SPECIES_LIST, MOVE_LIST, NATURE_NAMES, OPPONENT_SET_NAMES,
  getSpeciesAbilities, OPPONENT_SETS, canAttractPair,
} from "./pokemon-data.js";
import {
  freshMatchState, solve, resolveOpponentBySetName, buildPlan,
  parseShowdownText,
  loadCustomSets, saveCustomSet, deleteCustomSet,
  scoreTurn, OUTCOME, PHASE, isTwoTurnMove, isDrivableHealMove, isHandScoredMove,
} from "./ui-logic.js";
import { HIDDEN_POWER_TYPES } from "../battle_arena_sim/logic.js";

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
// Hidden Power's type is ENTERED, never guessed (amendment 16): the picker
// starts blank and a solve with Hidden Power and no type is refused.
fillSelect($("youHpType"), HIDDEN_POWER_TYPES, { withBlank: true });
function updateHiddenPowerRow() {
  $("youHiddenPowerRow").hidden = !readMoves(".move-select").includes("Hidden Power");
}
document.querySelectorAll(".move-select").forEach((sel) => sel.addEventListener("change", updateHiddenPowerRow));

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
  // The trainer IV band (amendment 7): only the bands this set can actually
  // appear in, highest first. A Brain set, or a set seen in one band only, has
  // nothing to choose.
  const tierSelect = $("oppIvTier");
  const tiers = entry && !entry.brain ? [...entry.ivTiers].sort((a, b) => b - a) : [];
  tierSelect.innerHTML = "";
  for (const t of tiers) {
    const o = document.createElement("option");
    o.value = String(t);
    o.textContent = `IVs ${t}`;
    tierSelect.appendChild(o);
  }
  tierSelect.style.display = tiers.length > 1 ? "" : "none";
  renderOppSetMoves(entry);
});
$("oppSetName").dispatchEvent(new Event("change"));

// Read-only display of the selected set's real 4 moves (pure surfacing of the
// engine's frontier-pool.js — no engine work, just showing data that already
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
  const config = {
    species: $("youSpecies").value,
    level: Number($("youLevel").value) || 50,
    nature: $("youNature").value,
    ability: $("youAbility").value,
    item: $("youItem").value || null,
    evs, ivs,
    moves: readMoves(".move-select"),
  };
  if (config.moves.includes("Hidden Power")) {
    if (!$("youHpType").value) throw new Error("Choose your Hidden Power's type.");
    config.hiddenPower = { type: $("youHpType").value, power: Number($("youHpPower").value) || 70 };
  }
  return config;
}

function buildOppConfig() {
  const mode = document.querySelector("input[name='oppMode']:checked").value;
  if (mode === "set") {
    const name = $("oppSetName").value;
    const abilityChoice = $("oppAbilityChoice");
    const abilityOverride = abilityChoice.style.display !== "none" ? abilityChoice.value : null;
    const entry = OPPONENT_SETS[name];
    // a single-band set is solved at that band; a Brain set at its own fixed IVs
    const tier = !entry || entry.brain ? null : entry.ivTiers.length > 1 ? Number($("oppIvTier").value) : entry.ivTiers[0];
    return resolveOpponentBySetName(name, abilityOverride, tier);
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
  // Earlier turns (turns 2-3). gLastMoves: each side's move on the previous
  // turn (null if it could not move). The AI's history (F2c,
  // RecordLastUsedMoveByTarget) is recorded at each of ITS decisions from the
  // player's last move: by turn 3 it holds the turn-1 move, and the search
  // records the turn-2 move itself at this decision (aiDecisionState), so it is
  // not passed twice. Assumes the opponent chose its move on turn 2; a charging
  // or Encored opponent runs no AI and records nothing. The Mind/Skill banked
  // on these turns are added in recalculate() (they need the built configs).
  if (s.turn >= 2) {
    const rows = readEarlierTurns(s.turn);
    const t1 = recordedMove(rows[0].you), last = rows[rows.length - 1];
    s.youLastMove = recordedMove(last.you);
    s.youMoveHistory = s.turn === 3 && t1 ? [t1] : [];
    s.oppLastMove = recordedMove(last.opp);
  }
  s.yourHpPct = Number($("youCurrentHp").value) || 0;
  s.oppHpPct = Number($("oppCurrentHp").value) || 0;
  s.youStages = readStages(".stage-select");
  s.oppStages = readStages(".opp-stage-select");
  // On turn 1 a side whose stages are all 0 is left ABSENT, so buildStartState
  // keeps the switch-in stages it derives itself: Intimidate's -1 Atk on the
  // foe, restored by a White Herb (F16). Forwarding the zeros used to wipe
  // them -- every Intimidate matchup was solved at full Attack. Any entered
  // stage, or any turn from 2 on, is the observed state and is forwarded.
  const allZero = (st) => Object.values(st).every((v) => v === 0);
  if (s.turn === 1) {
    if (allZero(s.youStages)) delete s.youStages;
    if (allZero(s.oppStages)) delete s.oppStages;
  }
  s.youStatus = $("youStatus").value || null;
  s.oppStatus = $("oppStatus").value || null;
  // Batch 4: the opponent's per-mon first-turn-out state — flows through the
  // denylist into buildStartState like every other base key; the engine's
  // search decays it for lookahead turns 2+ on its own (logic.js resolveTurn).
  s.oppMonFirstTurn = $("oppFirstTurn").checked;
  // Confusion/Attraction: independent volatiles, stackable with the primary
  // status above and with each other, on BOTH sides (the engine's
  // you/oppConfused and you/oppAttracted, two-sided since A5). Confusion is
  // the engine's next-check index, since it lasts 2-5 turns (B4): "" -> not
  // confused, "1" -> true (no checks yet), "2".."5" -> that check next.
  const confusion = (id) => { const v = $(id).value; return v === "" ? false : v === "1" ? true : Number(v); };
  s.youConfused = confusion("youConfusion");
  s.oppConfused = confusion("oppConfusion");
  s.youAttracted = $("youAttracted").checked;
  s.oppAttracted = $("oppAttracted").checked;
  // Weather/Reflect/Light Screen are plain on/off toggles in this UI — no
  // turn-count input. ON passes the engine's own "active indefinitely"
  // value: weatherTurns: null (engine convention — see logic.js's ability-
  // set-weather comment, "null turns = permanent when weatherType is set").
  // Reflect/Light Screen have no null-permanent sentinel in the engine (they
  // always count down), so ON uses SCREEN_ACTIVE_TURNS, comfortably above
  // the fixed 3-turn match length so it never decrements to off mid-match.
  // "None" leaves BOTH keys absent, so buildStartState keeps the weather the
  // leads' abilities set at switch-in (Sand Stream / Drought / Drizzle). A null
  // forwarded here used to override it: a pasted Sand Stream Tyranitar was
  // solved with no sandstorm. A chosen weather still overrides, as before.
  const weather = document.querySelector("input[name='weather']:checked").value;
  if (weather) {
    s.weatherType = weather;
    s.weatherTurns = null;
  } else {
    delete s.weatherType;
    delete s.weatherTurns;
  }
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
// Disables BOTH sides' Attracted toggles (and force-unchecks them) whenever
// the current You/Opponent species pairing can NEVER be gender-compatible
// (either side genderless, or both fixed to the same single gender) — the
// engine's own override path doesn't validate this itself (see
// buildMatchState's comment), so an impossible state must never reach it.
// The pairing rule is symmetric, so one answer gates both. Runs BEFORE
// buildMatchState() reads the checkboxes, so a forced uncheck takes effect in
// the same solve, not one interaction late.
function updateAttractedGate(youSpecies, oppSpecies) {
  const possible = youSpecies && oppSpecies ? canAttractPair(youSpecies, oppSpecies) : true;
  for (const side of ["you", "opp"]) {
    const checkbox = $(side + "Attracted"), label = $(side + "AttractedLabel");
    checkbox.disabled = !possible;
    label.classList.toggle("btn-disabled", !possible);
    label.title = possible ? "" : "Not possible: this species pairing can never be gender-compatible (one side is genderless, or both resolve to the same fixed gender) — Attract could never land here.";
    if (!possible && checkbox.checked) checkbox.checked = false;
  }
}

function recalculate() {
  // Instrumentation only (Palace convention, window.__recomputeCount): lets
  // the headless verification assert exactly-one-recompute per interaction.
  window.__recalcCount = (window.__recalcCount || 0) + 1;
  const errorEl = $("errorDisplay");
  errorEl.textContent = "";
  let youConfig, oppConfig, matchState;
  try {
    youConfig = buildYouConfig();
    oppConfig = buildOppConfig();
    updateAttractedGate(youConfig.species, oppConfig.species);
    const turn = Number(document.querySelector("input[name='turn']:checked").value);
    updateEarlierTurns(youConfig, oppConfig, turn);
    matchState = buildMatchState();
    if (!youConfig.species || !oppConfig.species) return;
    if (youConfig.moves.length === 0) { errorEl.textContent = "Pick at least one move for your Pokemon."; return; }

    // Mind/Skill banked so far: every earlier turn, scored by the engine. A
    // turn 2/3 solve with an earlier turn missing or unscorable would judge
    // from the wrong totals, so it is not shown at all.
    const banked = scoreEarlierTurns(youConfig, oppConfig, turn);
    if (!banked) { clearResult(); return; }
    Object.assign(matchState, banked);

    const { result, oppMoveDist, turnsRemaining } = solve(youConfig, oppConfig, matchState);
    renderResult(result);
    renderPlan(result, turnsRemaining, matchState.turn);
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

// ── The plan (ui-logic.js buildPlan), as nested lists: each outcome of a turn
// and the best next move in it. A next move that depends on HP shows the
// range it covers; a later turn's detail is collapsible.
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const pct = (p) => (p * 100 >= 99.95 ? "100" : p * 100 < 0.05 ? "<0.1" : (p * 100).toFixed(p * 100 < 1 ? 1 : 0)) + "%";
const hpRange = ([a, b]) => (Math.round(a) === Math.round(b) ? `${Math.round(a)}%` : `${Math.round(a)}–${Math.round(b)}%`);
function planHtml(plan, turn) {
  if (!plan) return "";
  let h = `<ul class="plan-outcomes">`;
  for (const o of plan.outcomes) {
    h += `<li><span class="plan-p">${pct(o.p)}</span> <span class="plan-label">${esc(o.label)}</span>`;
    const nexts = o.next.filter((n) => n.p > 0);
    h += `<ul class="plan-next">`;
    for (const n of nexts) {
      const when = nexts.length > 1 ? ` <span class="plan-when">(${pct(n.p)}: your HP ${hpRange(n.youHp)}, opp HP ${hpRange(n.oppHp)})</span>` : "";
      if (!n.move) { h += `<li>matchup over — P(win) ${n.winProb.toFixed(3)}${when}</li>`; continue; }
      h += `<li>turn ${turn + 1}: <b>${esc(n.move)}</b> — P(win) ${n.winProb.toFixed(3)}${when}`;
      if (n.plan) h += `<details><summary>after it</summary>${planHtml(n.plan, turn + 1)}</details>`;
      h += `</li>`;
    }
    h += `</ul></li>`;
  }
  return h + `</ul>`;
}
function renderPlan(result, turnsRemaining, turn) {
  const el = $("planDisplay");
  if (result.isTerminal || turnsRemaining <= 1) {
    el.innerHTML = `<p class="plan-none">${result.isTerminal ? "Matchup over." : "Last turn — nothing after it."}</p>`;
    return;
  }
  const plan = buildPlan(result, turnsRemaining);
  el.innerHTML = `<p class="plan-head">Turn ${turn}: <b>${esc(plan.move)}</b>, then:</p>` + planHtml(plan, turn);
}

// Blank the result column (best move, options, plan, opponent move odds) when
// there is no trustworthy solve to show.
function clearResult() {
  $("bestMoveDisplay").textContent = "—";
  document.querySelector("#optionsTable tbody").innerHTML = "";
  $("planDisplay").innerHTML = "";
  $("oppMoveDistRows").innerHTML = "";
}

function renderResult(result) {
  if (result.isTerminal) {
    $("bestMoveDisplay").textContent = "Match over — judge decides (P(win)=" + result.winProb.toFixed(3) + ")";
    document.querySelector("#optionsTable tbody").innerHTML = "";
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
  $("youHpType").value = config.hiddenPower?.type || "";
  $("youHpPower").value = config.hiddenPower?.power ?? 70;
  updateHiddenPowerRow();
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
// First-turn toggle: change-only, exactly one recompute per toggle (see the
// markup comment for why it isn't a calc-trigger).
$("oppFirstTurn").addEventListener("change", recalculate);

// ── Earlier turns (turns 2-3) ────────────────────────────────────────────────
// One row per earlier turn: each side's move, what happened, and -- only when
// it applies -- a two-turn move's phase and a heal's result. Every control is a
// calc-trigger, so any change re-solves. The rows drive two things:
// buildMatchState's last moves / AI history (recordedMove) and the Mind/Skill
// banked so far (scoreEarlierTurns, through the engine's own scorer).
const OUTCOMES = [
  { value: OUTCOME.HIT, label: "Hit / worked" },
  { value: OUTCOME.MISSED, label: "Missed" },
  { value: OUTCOME.PROTECT, label: "Blocked" },
  // para/freeze/sleep all collapse under IMMOBILIZED: Mind banks for the move
  // that was selected, Skill 0 (the scorer drives it through paralysis).
  { value: OUTCOME.IMMOBILIZED, label: "Immobilized" },
  { value: OUTCOME.CONFUSION_SELF, label: "Hurt itself (confused)" },
  { value: OUTCOME.ATTRACT, label: "Immobilized by love" },
  { value: OUTCOME.FLINCH, label: "Flinched" },
];
// A turn the mon was prevented from acting records no move (gLastMoves 0).
const PREVENTED = new Set([OUTCOME.IMMOBILIZED, OUTCOME.CONFUSION_SELF, OUTCOME.ATTRACT, OUTCOME.FLINCH]);
const SIDES = [["You", "You"], ["Opp", "Opponent"]];

function buildEarlierTurnRows() {
  const wrap = $("msfRows");
  for (const t of [1, 2]) {
    const row = document.createElement("div");
    row.className = "msf-row"; row.id = `msfRow${t}`;
    row.innerHTML = `<span class="msf-turn">Turn ${t}</span>` + SIDES.map(([k, name]) => `
      <span class="msf-side"><span class="msf-who">${name}</span>
        <select id="msf${t}${k}Move" class="calc-trigger"></select>
        <select id="msf${t}${k}Outcome" class="calc-trigger">${OUTCOMES.map((o) =>
          `<option value="${o.value}">${o.label}</option>`).join("")}</select>
        <select id="msf${t}${k}Phase" class="calc-trigger" hidden>
          <option value="${PHASE.CHARGE}">Charging (dug/flew/dove)</option>
          <option value="${PHASE.ATTACK}">Attack (came back and hit)</option>
        </select>
        <select id="msf${t}${k}Heal" class="calc-trigger" hidden>
          <option value="yes"></option><option value="no"></option>
        </select>
      </span>`).join("");
    wrap.appendChild(row);
  }
}
buildEarlierTurnRows();

// Refill the move lists (keeping a choice that is still one of the side's
// moves) and show only the rows and extra controls that apply. Runs at the top
// of every recalculate(), before anything reads the rows.
function updateEarlierTurns(youConfig, oppConfig, turn) {
  const moves = { You: (youConfig.moves || []).filter(Boolean), Opp: (oppConfig.moves || []).filter(Boolean) };
  for (const t of [1, 2]) {
    for (const [k] of SIDES) {
      const sel = $(`msf${t}${k}Move`), keep = sel.value;
      sel.innerHTML = "";
      sel.appendChild(new Option("— pick —", ""));
      for (const m of moves[k]) sel.appendChild(new Option(m, m));
      sel.value = moves[k].includes(keep) ? keep : "";
      const move = sel.value, outcome = $(`msf${t}${k}Outcome`);
      const phase = $(`msf${t}${k}Phase`), heal = $(`msf${t}${k}Heal`);
      phase.hidden = !isTwoTurnMove(move);
      outcome.hidden = !phase.hidden && phase.value === PHASE.CHARGE; // a charge turn always "succeeds"
      // Drivable heals: the scorer needs whether it healed. Wish: whether it
      // worked (Swallow scores the same either way, so it asks nothing).
      const kind = isDrivableHealMove(move) ? "heal" : isHandScoredMove(move) && move === "Wish" ? "wish" : null;
      heal.hidden = !kind || outcome.hidden || outcome.value !== OUTCOME.HIT;
      if (kind) {
        const [yes, no] = heal.options;
        yes.textContent = kind === "heal" ? "Healed" : "Wish worked";
        no.textContent = kind === "heal" ? "Was at full HP" : "Wish failed";
      }
    }
  }
  $("movesSoFar").hidden = turn < 2;
  $("msfRow2").hidden = turn < 3;
}

function readSideReport(t, k) {
  const move = $(`msf${t}${k}Move`).value;
  const phaseSel = $(`msf${t}${k}Phase`), healSel = $(`msf${t}${k}Heal`);
  const phase = phaseSel.hidden ? null : phaseSel.value;
  const outcome = phase === PHASE.CHARGE ? OUTCOME.HIT : $(`msf${t}${k}Outcome`).value;
  const report = { move, outcome, phase };
  if (!healSel.hidden) report.healed = healSel.value === "yes";
  return report;
}
// The earlier turns' reports, turn 1 first: [{ you, opp }, ...].
function readEarlierTurns(turn) {
  const rows = [];
  for (let t = 1; t < turn; t++) rows.push({ you: readSideReport(t, "You"), opp: readSideReport(t, "Opp") });
  return rows;
}
function recordedMove(r) {
  return r.move && !PREVENTED.has(r.outcome) ? r.move : null;
}

// Sum the Mind/Skill each earlier turn banked. Returns null (and says why in
// the bar) when a move is not picked yet or a reported result is impossible.
function scoreEarlierTurns(youConfig, oppConfig, turn) {
  const totalsEl = $("msfTotals");
  const sum = { mindYou: 0, skillYou: 0, mindOpp: 0, skillOpp: 0 };
  totalsEl.classList.remove("msf-problem");
  if (turn < 2) { totalsEl.textContent = ""; return sum; }
  const problem = (msg) => { totalsEl.textContent = msg; totalsEl.classList.add("msf-problem"); return null; };
  const rows = readEarlierTurns(turn);
  for (let i = 0; i < rows.length; i++) {
    const { you, opp } = rows[i];
    if (!you.move || !opp.move) return problem(`Pick both moves for turn ${i + 1} to get a recommendation.`);
    let d;
    try {
      d = scoreTurn(youConfig, oppConfig, { you, opp });
    } catch (e) {
      const m = e.message.match(/no branch matched the (you|opp) report \((.+) \/ (\w+)\)/);
      if (!m) return problem(`Turn ${i + 1}: ${e.message.split("\n")[0]}`);
      const who = m[1] === "you" ? "your" : "the opponent's";
      const label = OUTCOMES.find((o) => o.value === m[3])?.label ?? m[3];
      return problem(`Turn ${i + 1}: ${who} ${m[2]} can't end "${label}" in this matchup. Check that turn's result.`);
    }
    sum.mindYou += d.dMindYou; sum.skillYou += d.dSkillYou;
    sum.mindOpp += d.dMindOpp; sum.skillOpp += d.dSkillOpp;
  }
  totalsEl.textContent = `Banked so far: Mind ${sum.mindYou} – ${sum.mindOpp}, Skill ${sum.skillYou} – ${sum.skillOpp} (you – opponent)`;
  return sum;
}

// ── Reset button: clear every observed battle-state input back to a fresh slate
// (HP, stat stages, status, volatiles, field, earlier turns, turn) WITHOUT touching mon identity or persistence (species/ability/item/
// nature/EVs/IVs/moves, saved sets, chips, dropdown, paste box all stay put).
// Parity with the Facilities Assistant's reset. UI-only: this resets the inputs
// the engine reads, not how it solves. Every field is set DIRECTLY (no change/
// input event dispatched), then a single recalculate() re-solves the fresh board
// — exactly one solve at the end, not one per field. Acts immediately, no dialog.
$("resetBtn").addEventListener("click", () => {
  // HP -> full both sides: set linked current/percent directly, redraw the bars
  // (no input event fires, so the wired handlers don't redraw them for us).
  for (const [cur, pct, bar] of [["youCurrentHp", "youPercentHp", "youHpBar"], ["oppCurrentHp", "oppPercentHp", "oppHpBar"]]) {
    $(cur).value = 100; $(pct).value = 100; drawHealthBar($(bar), 100);
  }
  // Round-start HP overrides -> blank (= current; the engine's own default).
  $("youStartHp").value = ""; $("oppStartHp").value = "";
  // Stat stages -> 0, both sides, all seven.
  document.querySelectorAll(".stage-select, .opp-stage-select").forEach((s) => { s.value = "0"; });
  // Primary status -> Healthy, both sides.
  $("youStatus").value = ""; $("oppStatus").value = "";
  // First turn on field -> back to its default TRUE (a reset board is a fresh
  // 1v1: the opponent was just sent out), NOT false — Reset restores defaults.
  $("oppFirstTurn").checked = true;
  // Earlier turns -> moves unpicked, every other control back to its first option.
  document.querySelectorAll("#msfRows select").forEach((el) => { el.selectedIndex = 0; });
  // Volatiles, both sides -> off.
  $("youConfusion").value = ""; $("oppConfusion").value = "";
  $("youAttracted").checked = false; $("oppAttracted").checked = false;
  // Field: Weather None, all screens off both sides (Spikes stay inert).
  $("weatherNone").checked = true;
  $("youReflect").checked = false; $("oppReflect").checked = false;
  $("youLightScreen").checked = false; $("oppLightScreen").checked = false;
  // Turn counter -> 1 (checking one radio unchecks the rest).
  $("turn1").checked = true;
  // One re-solve from the cleared board: refills the earlier-turn move lists
  // and re-renders Recommendation + opponent move-probabilities off fresh state.
  recalculate();
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

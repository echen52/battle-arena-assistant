// ── test-b2b10-mutable-state.js ───────────────────────────────────────────
// B2b batch 10: abilities and items stop being immutable.
//
// Until this batch a mon's ability and item lived on the BUILT mon and were
// read from ~70 and ~16 places. Five effects change them mid-battle, so the
// override lives in the STATE and is resolved at two choke points -- the top of
// resolveTurn and the AI's own move choice. The test that matters is therefore
// not "does the field change" but "does the CHANGE REACH THE DAMAGE FORMULA",
// which is what PART 1 measures.
//
//   EFFECT_SKILL_SWAP  swaps both abilities      Cmd_tryswapabilities  :9392
//   EFFECT_ROLE_PLAY   copies the target's       Cmd_trycopyability    :9414
//   EFFECT_TRICK       swaps both items          Cmd_tryswapitems      :9189
//   EFFECT_THIEF       takes the target's item   MOVE_EFFECT_STEAL_ITEM:2738
//   EFFECT_RECYCLE     restores a used one       Cmd_tryrecycleitem    :9430
// plus EFFECT_POISON and EFFECT_LOCK_ON, the last two holes in the
// status-infliction family.
import {
  AI_HANDLERS, buildMon, buildStartState, resolveTurn, applyMove, skillDelta,
} from "./logic.js";

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } };

const mk = (species, moves, over = {}) => buildMon({
  species, level: 50, nature: "Adamant", evs: { hp: 252, atk: 252 },
  ability: "Pressure", item: null, moves, friendship: 255, ...over,
});
const IDLE = "Splash";

console.log("-- PART 1: a swapped ability reaches the DAMAGE FORMULA --");
{
  // Thick Fat halves Fire damage. Skill Swap takes it away, and the very next
  // Flamethrower must hurt twice as much. This is the whole point of the batch:
  // 86 read sites keep reading mon.ability and are simply handed a different
  // mon, so nothing downstream had to learn about swapping.
  const tf = mk("Snorlax", [IDLE, "Body Slam", "Growl", "Shadow Ball"], { ability: "Thick Fat" });
  const burner = mk("Typhlosion", ["Skill Swap", "Flamethrower", "Rest", "Quick Attack"], { ability: "Blaze" });
  const ctx = { you: tf, opp: burner };
  const fresh = buildStartState({ you: tf, opp: burner });
  const before = 100 - resolveTurn(ctx, fresh, IDLE, "Flamethrower")[0].state.yourHpPct;

  const swapped = buildStartState({ you: tf, opp: burner });
  applyMove(ctx, swapped, "opp", "Skill Swap", true, false);
  ok(swapped.youAbilityOverride === "Blaze" && swapped.oppAbilityOverride === "Thick Fat",
    `Skill Swap must exchange both abilities (got ${swapped.youAbilityOverride} / ${swapped.oppAbilityOverride})`);
  const after = 100 - resolveTurn(ctx, swapped, IDLE, "Flamethrower")[0].state.yourHpPct;
  ok(after > before * 1.8,
    `Flamethrower must roughly double once Thick Fat is gone (${before.toFixed(1)}% -> ${after.toFixed(1)}%)`);
  console.log(`   Flamethrower ${before.toFixed(1)}% with Thick Fat, ${after.toFixed(1)}% after Skill Swap takes it`);

  // Skill Swap's two failure cases, and the one that is NOT a failure.
  const wg = mk("Shedinja", ["Splash", "Shadow Ball", "Rest", "Confuse Ray"], { ability: "Wonder Guard" });
  const s2 = buildStartState({ you: wg, opp: burner });
  const b4 = s2.skillOpp;
  applyMove({ you: wg, opp: burner }, s2, "opp", "Skill Swap", true, false);
  ok(s2.oppAbilityOverride === null, "Skill Swap must FAIL against Wonder Guard");
  ok(s2.skillOpp - b4 === skillDelta("noEffect"), "...and score as a failure");
  const same = mk("Typhlosion", ["Skill Swap", "Flamethrower", "Rest", "Quick Attack"], { ability: "Blaze" });
  const s3 = buildStartState({ you: same, opp: burner });
  applyMove({ you: same, opp: burner }, s3, "opp", "Skill Swap", true, false);
  ok(s3.oppAbilityOverride === "Blaze",
    "but two IDENTICAL abilities must still swap -- source has no same-ability check");
}

console.log();
console.log("-- PART 2: Role Play copies one way, Trick swaps both ways --");
{
  const you = mk("Snorlax", [IDLE, "Body Slam", "Growl", "Shadow Ball"], { ability: "Thick Fat", item: "Leftovers" });
  const rp = mk("Smeargle", ["Role Play", "Spore", "Rest", IDLE], { ability: "Own Tempo" });
  const s = buildStartState({ you, opp: rp });
  applyMove({ you, opp: rp }, s, "opp", "Role Play", true, false);
  ok(s.oppAbilityOverride === "Thick Fat", "Role Play must copy the TARGET's ability onto the user");
  ok(s.youAbilityOverride === null, "...and must not touch the target's");

  // Trick, in the battle type that allows it.
  const tr = mk("Alakazam", ["Trick", "Psychic", "Rest", "Calm Mind"],
    { ability: "Synchronize", item: "Choice Band" });
  const t = buildStartState({ you, opp: tr });
  applyMove({ you, opp: tr }, t, "opp", "Trick", true, false);
  ok(t.youItemOverride === "Choice Band" && t.oppItemOverride === "Leftovers",
    `Trick must exchange the items (got ${t.youItemOverride} / ${t.oppItemOverride})`);

  // Sticky Hold blocks it, and two empty hands fail it.
  const sticky = mk("Shuckle", [IDLE, "Body Slam", "Rest", "Toxic"], { ability: "Sticky Hold", item: "Leftovers" });
  const st = buildStartState({ you: sticky, opp: tr });
  const b4 = st.skillOpp;
  applyMove({ you: sticky, opp: tr }, st, "opp", "Trick", true, false);
  ok(st.oppItemOverride === undefined, "Sticky Hold must block Trick");
  ok(st.skillOpp - b4 === skillDelta("noEffect"), "...as a failure");
  const bare = mk("Alakazam", ["Trick", "Psychic", "Rest", "Calm Mind"], { ability: "Synchronize" });
  const bareYou = mk("Snorlax", [IDLE, "Body Slam", "Growl", "Shadow Ball"]);
  const b = buildStartState({ you: bareYou, opp: bare });
  applyMove({ you: bareYou, opp: bare }, b, "opp", "Trick", true, false);
  ok(b.oppItemOverride === undefined, "two empty hands must fail -- there is nothing to trade");
  console.log("   Role Play copies one way; Trick swaps, is blocked by Sticky Hold, and fails on two empty hands");
}

console.log();
console.log("-- PART 3: Thief takes, and only with empty hands --");
{
  const you = mk("Snorlax", [IDLE, "Body Slam", "Growl", "Shadow Ball"], { item: "Leftovers" });
  const thief = mk("Sneasel", ["Thief", "Quick Attack", "Rest", "Bite"], { ability: "Keen Eye" });
  const b = resolveTurn({ you, opp: thief }, buildStartState({ you, opp: thief }), IDLE, "Thief")[0];
  ok(b.state.oppItemOverride === "Leftovers", "the thief must end up holding the item");
  ok(b.state.youItemOverride === null, "and the victim must end up holding nothing");

  const armed = mk("Sneasel", ["Thief", "Quick Attack", "Rest", "Bite"], { ability: "Keen Eye", item: "Quick Claw" });
  const b2 = resolveTurn({ you, opp: armed }, buildStartState({ you, opp: armed }), IDLE, "Thief")[0];
  ok(b2.state.youItemOverride === undefined, "a thief already holding something must steal NOTHING");

  // Swalot, not Shuckle: Shuckle's Defence is high enough that Thief rounds to
  // zero damage, and the probe would report the attack as not landing when it
  // did.
  const sticky = mk("Swalot", [IDLE, "Body Slam", "Rest", "Toxic"], { ability: "Sticky Hold", item: "Leftovers" });
  const b3 = resolveTurn({ you: sticky, opp: thief }, buildStartState({ you: sticky, opp: thief }), IDLE, "Thief")[0];
  ok(b3.state.oppItemOverride === undefined, "Sticky Hold must block the steal");
  ok(b3.state.yourHpPct < 100, "...while the attack itself still lands");
  console.log("   steals with empty hands only, blocked by Sticky Hold, and the hit lands either way");
}

console.log();
console.log("-- PART 4: a consumed berry is really gone, and Recycle brings it back --");
{
  // This is what forced consumption to clear the ITEM and not just set a flag:
  // "used up" has to mean "not held any more" once items are mutable.
  const you = mk("Snorlax", [IDLE, "Body Slam", "Growl", "Shadow Ball"]);
  const berry = mk("Ludicolo", ["Recycle", "Surf", "Rest", "Giga Drain"],
    { ability: "Rain Dish", item: "Cheri Berry" });
  const ctx = { you, opp: berry };
  const paralysed = buildStartState({ you, opp: berry, overrides: { oppStatus: "paralysis" } });
  const afterCure = resolveTurn(ctx, paralysed, IDLE, "Rest")[0].state;
  ok(afterCure.oppStatus === null, "(setup) the Cheri Berry must cure the paralysis");
  ok(afterCure.oppBerryConsumed === true, "...and mark itself consumed");
  ok(afterCure.oppItemOverride === null, "...and leave the mon holding NOTHING");

  const recycled = { ...afterCure };
  applyMove(ctx, recycled, "opp", "Recycle", true, false);
  ok(recycled.oppItemOverride === "Cheri Berry", "Recycle must put the berry back");
  ok(recycled.oppBerryConsumed === false, "...and make it usable again");
  ok(recycled.oppUsedItem === null, "...and clear the used-item slot, as Cmd_tryrecycleitem does");

  const nothingUsed = buildStartState({ you, opp: berry });
  const b4 = nothingUsed.skillOpp;
  applyMove(ctx, nothingUsed, "opp", "Recycle", true, false);
  ok(nothingUsed.skillOpp - b4 === skillDelta("noEffect"), "Recycle with nothing used must fail");
  ok(AI_HANDLERS.EFFECT_RECYCLE.checkBadMove({ userUsedItem: false }) === -10,
    "and AI_CBM_Recycle scores it -10");
  console.log("   berry consumed -> no item -> Recycle restores it; Recycle with nothing used fails");
}

console.log();
console.log("-- PART 5: the status family's last two holes --");
{
  const you = mk("Snorlax", [IDLE, "Body Slam", "Growl", "Shadow Ball"]);
  // EFFECT_POISON is EFFECT_TOXIC's script minus the counter, and it was never
  // ported while Toxic was. Found by sweeping the family, not by a throw.
  const pp = mk("Vileplume", ["Poison Powder", "Body Slam", "Rest", "Petal Dance"], { ability: "Chlorophyll" });
  const s = buildStartState({ you, opp: pp });
  applyMove({ you, opp: pp }, s, "opp", "Poison Powder", true, false);
  ok(s.youStatus === "poison", "Poison Powder must poison");
  ok(s.youToxicCounter === null, "...with NO bad-poison counter -- that is the only difference from Toxic");
  const steel = mk("Metagross", [IDLE, "Meteor Mash", "Earthquake", "Psychic"], { ability: "Clear Body" });
  const st = buildStartState({ you: steel, opp: pp });
  applyMove({ you: steel, opp: pp }, st, "opp", "Poison Powder", true, false);
  ok(st.youStatus === null, "and a Steel-type must be immune");
  ok(AI_HANDLERS.EFFECT_POISON.checkBadMove === AI_HANDLERS.EFFECT_TOXIC.checkBadMove,
    "its checkBadMove must be the SAME OBJECT as Toxic's -- source dispatches both to AI_CBM_Toxic");

  // Lock On: a guaranteed hit that skips the accuracy chain entirely.
  const lo = mk("Porygon2", ["Lock On", "Zap Cannon", "Recover", "Ice Beam"], { ability: "Trace" });
  const evasive = { you, opp: lo };
  const dodgy = buildStartState({ you, opp: lo, overrides: { youStages: { evasion: 6 } } });
  const pWithout = resolveTurn(evasive, dodgy, IDLE, "Zap Cannon")
    .filter((b) => b.state.yourHpPct < 100).reduce((a, b) => a + b.p, 0);
  const locked = buildStartState({ you, opp: lo, overrides: { youStages: { evasion: 6 } } });
  applyMove(evasive, locked, "opp", "Lock On", true, false);
  ok(locked.youAlwaysHitTurns === 2, "Lock On must set a 2-turn window");
  const pWith = resolveTurn(evasive, locked, IDLE, "Zap Cannon")
    .filter((b) => b.state.yourHpPct < 100).reduce((a, b) => a + b.p, 0);
  ok(Math.abs(pWith - 1) < 1e-9, `Zap Cannon must be guaranteed under Lock On (got ${pWith.toFixed(3)})`);
  ok(pWithout < 0.3, `(control) without it, +6 evasion must make it unlikely (got ${pWithout.toFixed(3)})`);
  console.log(`   Zap Cannon vs +6 evasion: ${pWithout.toFixed(3)} normally, ${pWith.toFixed(3)} under Lock On`);

  let expired = locked;
  for (let i = 0; i < 2; i++) expired = resolveTurn(evasive, expired, IDLE, "Recover")[0].state;
  ok(expired.youAlwaysHitTurns === null, "and the window must close after two turns");
}

console.log();
console.log(failures === 0 ? "ALL PASS -- B2b batch 10 characterization green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

// ── test-b8-synchronize.js ────────────────────────────────────────────────
// B8b: Synchronize (src/battle_util.c:2971-3002; armed at src/battle_script_
// commands.c:2501-2511).
//
//   PART 1  a Synchronize TARGET passes poison / paralysis / burn back; toxic
//           goes back as ORDINARY poison; sleep does not pass
//   PART 2  immunities stop it; Safeguard does not
//   PART 3  a Synchronize ATTACKER statused by a contact ability passes it to
//           the target. (Source's Substitute gate on this direction is
//           UNREACHABLE in 1v1: the attacker can only be statused mid-action by
//           a contact proc -- which needs damage to the target itself, so no
//           sub -- or by the target's own Synchronize, which a sub on the target
//           prevents from arming. It is ported; it cannot be exercised.)
import { buildMon, buildStartState, resolveTurn } from "./logic.js";

let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.log("  FAIL " + m); } };

const mk = (species, moves, over = {}) => buildMon({
  species, level: 50, nature: "Adamant", evs: { hp: 252, atk: 252 },
  ability: "Pressure", item: null, moves, friendship: 255, ...over,
});
const start = (you, opp, o = {}) => buildStartState({ you, opp, overrides: o });
const turn = (you, opp, st, ym, om) => resolveTurn({ you, opp }, st, ym, om);

const user = mk("Jolteon", ["Thunder Wave", "Toxic", "Will-O-Wisp", "Hypnosis"], { ability: "Volt Absorb" });
const syncer = mk("Alakazam", ["Splash", "Psychic", "Rest", "Recover"], { ability: "Synchronize" });

console.log("-- PART 1: the target passes it back --");
{
  const tw = turn(user, syncer, start(user, syncer), "Thunder Wave", "Splash");
  ok(tw.every((b) => b.state.oppStatus === "paralysis" && b.state.youStatus === "paralysis"), "Thunder Wave: both end up paralysed");
  const tx = turn(user, syncer, start(user, syncer), "Toxic", "Splash").filter((b) => b.state.oppStatus === "poison");
  ok(tx.length > 0 && tx.every((b) => b.state.oppToxicCounter != null && b.state.youStatus === "poison" && b.state.youToxicCounter == null),
    "Toxic: the target is BADLY poisoned, the user gets ORDINARY poison back");
  const hy = turn(user, syncer, start(user, syncer), "Hypnosis", "Splash").filter((b) => b.state.oppStatus === "sleep");
  ok(hy.length > 0 && hy.every((b) => b.state.youStatus == null), "sleep is not synchronized");
  const plain = mk("Alakazam", ["Splash", "Psychic", "Rest", "Recover"], { ability: "Inner Focus" });
  ok(turn(user, plain, start(user, plain), "Thunder Wave", "Splash").every((b) => b.state.youStatus == null),
    "(control) without Synchronize nothing comes back");
}

console.log();
console.log("-- PART 2: immunities, and Safeguard --");
{
  const fireUser = mk("Houndoom", ["Will-O-Wisp", "Toxic", "Thunder Wave", "Flamethrower"], { ability: "Early Bird" });
  const wo = turn(fireUser, syncer, start(fireUser, syncer), "Will-O-Wisp", "Splash").filter((b) => b.state.oppStatus === "burn");
  ok(wo.length > 0 && wo.every((b) => b.state.youStatus == null), "a Fire-type user is not burned back");
  const safe = turn(user, syncer, start(user, syncer, { youSafeguardTurns: 3 }), "Thunder Wave", "Splash");
  ok(safe.every((b) => b.state.youStatus === "paralysis"), "Safeguard does NOT stop it -- it is seteffectprimary");
}

console.log();
console.log("-- PART 3: the attacker's side --");
{
  // An Espeon with Synchronize body-slams a Static holder: if Static
  // paralyses Espeon, Espeon's Synchronize paralyses the holder.
  const esp = mk("Espeon", ["Body Slam", "Psychic", "Splash", "Rest"], { ability: "Synchronize" });
  const st = mk("Blissey", ["Splash", "Soft-Boiled", "Growl", "Protect"], { ability: "Static", evs: { hp: 252, def: 252 } });
  const brs = turn(esp, st, start(esp, st), "Body Slam", "Splash");
  const par = brs.filter((b) => b.state.youStatus === "paralysis");
  ok(par.length > 0 && par.every((b) => b.state.oppStatus === "paralysis"), "a Static-paralysed Synchronize attacker paralyses the holder back");
  const syncUser = mk("Espeon", ["Thunder Wave", "Psychic", "Splash", "Rest"], { ability: "Synchronize" });
  const both = turn(syncUser, syncer, start(syncUser, syncer), "Thunder Wave", "Splash");
  ok(both.every((b) => b.state.oppStatus === "paralysis" && b.state.youStatus === "paralysis"),
    "two Synchronize users: the target passes it back, and nothing loops");
}

console.log();
console.log(failures === 0 ? "ALL PASS -- B8b Synchronize characterization green" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

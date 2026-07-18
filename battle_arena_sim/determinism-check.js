import { getOpponentConfig } from "./opponent-adapter.js";
import { analyzeMatchup } from "./logic.js";

const metagrossConfig = {
  species: "Metagross",
  level: 50,
  nature: "Adamant",
  evs: { atk: 252, spd: 4, spe: 252 },
  ability: "Clear Body",
  item: "Cheri Berry",
  moves: ["Meteor Mash", "Earthquake", "Shadow Ball", "Explosion"],
};

function runN(label, youConfig, oppConfig, hpOverrides = {}, n = 5) {
  const results = [];
  for (let i = 0; i < n; i++) {
    const r = analyzeMatchup(youConfig, oppConfig, hpOverrides);
    results.push(`${r.result.move}|${r.result.winProb}`);
  }
  const allSame = results.every((r) => r === results[0]);
  console.log(`${label}: ${results[0]} — ${n}x ${allSame ? "byte-identical ✅" : "MISMATCH ❌"}`);
  if (!allSame) console.log("  ", results);
  return allSame;
}

const umbreon4 = {
  species: "Umbreon", level: 50, nature: "Bold",
  evs: { hp: 170, def: 170, spd: 170 }, ability: "Synchronize", item: "Leftovers",
  moves: ["Confuse Ray", "Toxic", "Faint Attack", "Double Team"],
};
const gengar = getOpponentConfig("Greta Gold Gengar", { ability: "Levitate" });
const skarmory1 = getOpponentConfig("Skarmory 1", { ability: "Keen Eye" });
const lapras3 = getOpponentConfig("Lapras 3", { ability: "Water Absorb" });

const snorlaxConfig = {
  species: "Snorlax", level: 50, nature: "Careful",
  evs: { hp: 252, def: 4, spd: 252 }, ability: "Thick Fat", item: "Leftovers",
  moves: ["Rest", "Body Slam", "Earthquake", "Shadow Ball"],
};
const jolteonConfig = {
  species: "Jolteon", level: 50, nature: "Modest",
  evs: { spa: 255, spe: 255 }, ability: "Volt Absorb", item: "Cheri Berry",
  moves: ["Thunderbolt", "Thunder Wave", "Attract", "Protect"],
};

const ok1 = runN("Canonical anchor (Metagross vs Umbreon 4)", metagrossConfig, umbreon4);
const ok2 = runN("Change #2-affected (Metagross vs Greta Gold Gengar)", metagrossConfig, gengar);
const ok3 = runN("Change #3-affected, move flipped (Metagross vs Skarmory 1)", metagrossConfig, skarmory1);
const ok4 = runN("Change #3-affected, move flipped (Metagross vs Lapras 3)", metagrossConfig, lapras3);
const ok5 = runN("Change #4-affected (Snorlax at 50%% vs fresh Umbreon 4)", snorlaxConfig, umbreon4, { yourHpPct: 50, oppHpPct: 100 });
const ok6 = runN("Change #4-affected (Metagross carried at 60%% vs fresh Umbreon 4)", metagrossConfig, umbreon4, { yourHpPct: 60, oppHpPct: 100 });
const ok7 = runN("Change #4-affected (Metagross carried at 81.94%% vs fresh Jolteon 1)", metagrossConfig, jolteonConfig, { yourHpPct: 81.93548387096774, oppHpPct: 100, yourUsablePartyMons: 2, oppUsablePartyMons: 1 });

const allOk = ok1 && ok2 && ok3 && ok4 && ok5 && ok6 && ok7;
console.log(allOk ? "\n✅ ALL DETERMINISM CHECKS PASS" : "\n❌ DETERMINISM FAILURE");

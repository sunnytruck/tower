import { test } from "node:test";
import assert from "node:assert/strict";
import {
  GACHA_POOL,
  TOTAL_WEIGHT,
  drawCharacter,
  pullGacha,
  finishGacha,
  durableChange,
  secureTicket,
  RARITIES,
} from "../src/gacha.ts";
import {
  newProgress,
  migrateProgress,
  upgradeCharacter,
  awardVictory,
  saveProgress,
  loadProgress,
  SAVE_KEY,
  type SaveStorage,
} from "../src/progressStore.ts";
import { ownedFormation, assignOwnedSlot } from "../src/formation.ts";
import { Battle } from "../src/engine.ts";
import { STAGE } from "../src/data.ts";
class MemoryStorage implements SaveStorage {
  values = new Map<string, string>();
  getItem(key: string) {
    return this.values.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}
test("crypto tickets reject the biased remainder before accepting the 1-in-10,000 ticket", (t) => {
  let calls = 0;
  t.mock.method(crypto, "getRandomValues", (array: Uint32Array) => {
    array[0] = calls++ === 0 ? 0xffffffff : 9999;
    return array;
  });
  assert.equal(secureTicket(), 9999);
  assert.equal(calls, 2);
});
test("all 10,000 tickets match exact weights: Keito 0.01%, total 100%, five rarities", () => {
  assert.equal(
    GACHA_POOL.reduce((s, e) => s + e.weight, 0),
    TOTAL_WEIGHT,
  );
  const counts = new Map<string, number>();
  for (let i = 0; i < TOTAL_WEIGHT; i++) {
    const kind = drawCharacter(i);
    counts.set(kind, (counts.get(kind) ?? 0) + 1);
  }
  for (const entry of GACHA_POOL)
    assert.equal(counts.get(entry.kind), entry.weight);
  assert.equal(counts.get("keito"), 1);
  assert.equal(
    (GACHA_POOL.find((e) => e.kind === "keito")!.weight / TOTAL_WEIGHT) * 100,
    0.01,
  );
  assert.deepEqual(
    [...new Set(GACHA_POOL.map((e) => e.rarity))].sort(),
    [0, 1, 2, 3, 4],
  );
  assert.deepEqual(
    [0, 1, 2, 3, 4].map((rarity) =>
      GACHA_POOL.filter((e) => e.rarity === rarity).reduce(
        (sum, e) => sum + e.weight,
        0,
      ),
    ),
    [6000, 3400, 500, 99, 1],
  );
  assert.equal(RARITIES[4], "伝説レア");
  for (const invalid of [-1, 10000, 1.5, NaN])
    assert.throws(() => drawCharacter(invalid));
});
test("fresh saves own only three starters; unowned cannot equip, upgrade or deploy", () => {
  const data = { ...newProgress(), xp: 10000 };
  assert.deepEqual(data.owned, ["novice", "monk", "mage"]);
  assert.equal(data.formation.includes("keito"), false);
  assert.equal(upgradeCharacter(data, "keito"), data);
  assert.equal(upgradeCharacter(data, "bellkeeper"), data);
  assert.equal(
    assignOwnedSlot(data.formation, 3, "keito", data.owned)[3],
    null,
  );
  assert.equal(ownedFormation(["keito"], data.owned)[0], null);
  const b = new Battle(["keito"], data.levels, data.owned);
  b.toggle();
  b.money = 1800;
  assert.equal(b.deploy("keito"), false);
});
test("single pull charges and grants once, saves duplicates and unlocks all systems immediately", () => {
  const data = { ...newProgress(), stones: 300, xp: 10000 };
  const won = pullGacha(data, 1, "one", () => 9999);
  assert.equal(won.stones, 150);
  assert.equal(won.origins.keito, "gacha");
  assert.ok(won.owned.includes("keito"));
  assert.equal(won.gachaHistory[0].theme, "keito");
  assert.equal(won.gachaHistory[0].results[0].isNew, true);
  assert.deepEqual(migrateProgress(won), won);
  assert.equal(
    pullGacha(won, 1, "another", () => {
      throw Error("must not draw");
    }),
    won,
  );
  const finished = finishGacha(won, "one");
  assert.equal(pullGacha(finished, 1, "one"), finished);
  const twice = pullGacha(finished, 1, "two", () => 9999);
  assert.equal(twice.duplicates.keito, 1);
  assert.equal(twice.gachaHistory[1].results[0].isNew, false);
  assert.equal(upgradeCharacter(won, "keito").levels.keito, 2);
  const formation = assignOwnedSlot(won.formation, 9, "keito", won.owned);
  const b = new Battle(formation, won.levels, won.owned);
  b.toggle();
  b.money = 1800;
  assert.equal(b.deploy("keito"), true);
});
test("ten pulls are ten independent draws; new and duplicates within the batch are correct", () => {
  let calls = 0;
  const initial = { ...newProgress(), stones: 1500 };
  const result = pullGacha(initial, 10, "ten", () => {
    calls++;
    return 9900;
  });
  assert.equal(calls, 10);
  assert.equal(result.stones, 0);
  assert.equal(result.gachaHistory[0].results.length, 10);
  assert.equal(result.duplicates.bellkeeper, 9);
  assert.equal(result.gachaHistory[0].results.filter((r) => r.isNew).length, 1);
  assert.equal(initial.stones, 1500);
  assert.equal(initial.owned.includes("bellkeeper"), false);
});
test("shortage and invalid counts never charge, draw or grant", () => {
  const initial = newProgress(),
    random = () => {
      throw Error("must not draw");
    };
  for (const count of [0, 1, 2, 10, -1])
    assert.equal(pullGacha(initial, count, "x", random), initial);
  const rich = { ...initial, stones: 1499 };
  assert.equal(pullGacha(rich, 10, "short", random), rich);
});
test("skip and reload preserve results without extra charge/grant; settled batch IDs cannot repeat", () => {
  const storage = new MemoryStorage();
  const won = durableChange(
    storage,
    SAVE_KEY,
    { ...newProgress(), stones: 1500 },
    (p) => pullGacha(p, 10, "saved", () => 9999),
  );
  const reloaded = loadProgress(storage).data;
  assert.deepEqual(reloaded, won);
  assert.equal(pullGacha(reloaded, 10, "retry"), reloaded);
  const skipped = finishGacha(reloaded, "saved");
  assert.deepEqual(skipped.owned, won.owned);
  assert.deepEqual(skipped.duplicates, won.duplicates);
  assert.equal(skipped.stones, won.stones);
  assert.deepEqual(skipped.gachaHistory, won.gachaHistory);
  saveProgress(storage, skipped);
  const after = loadProgress(storage).data;
  assert.equal(after.pendingGacha, null);
  assert.equal(after.duplicates.keito, 9);
  assert.equal(pullGacha(after, 10, "saved"), after);
});
test("failed durable writes cannot publish a charged or granted in-memory result", () => {
  const data = { ...newProgress(), stones: 150 };
  const storage: SaveStorage = {
    getItem: () => null,
    setItem: () => {
      throw Error("quota");
    },
  };
  assert.throws(() =>
    durableChange(storage, SAVE_KEY, data, (p) =>
      pullGacha(p, 1, "failed", () => 9999),
    ),
  );
  assert.equal(data.stones, 150);
  assert.equal(data.owned.includes("keito"), false);
  assert.equal(data.gachaHistory.length, 0);
});
test("v2 ownership, XP, levels and formation survive migration without giving the new character", () => {
  const migrated = migrateProgress({
    version: 2,
    xp: 777,
    levels: { keito: 17 },
    formation: ["keito", "mage"],
    claimedVictories: ["old-win"],
  });
  assert.ok(migrated.owned.includes("keito"));
  assert.equal(migrated.origins.keito, "legacy");
  assert.equal(migrated.levels.keito, 17);
  assert.equal(migrated.xp, 777);
  assert.equal(migrated.formation[0], "keito");
  assert.equal(migrated.owned.includes("bellkeeper"), false);
  assert.equal(migrateProgress(newProgress()).owned.includes("keito"), false);
});
test("first-clear and repeat stones accompany XP exactly once per win, including after reload", () => {
  const won = awardVictory(newProgress(), "first", "win", STAGE.victoryXP);
  assert.equal(won.stones, 1500);
  assert.equal(won.xp, 300);
  assert.equal(won.victoryRewards.first.firstClear, true);
  assert.equal(awardVictory(won, "first", "win", 300), won);
  const storage = new MemoryStorage();
  saveProgress(storage, won);
  const loaded = loadProgress(storage).data,
    repeat = awardVictory(loaded, "repeat", "win", 300);
  assert.equal(repeat.stones, 1650);
  assert.equal(repeat.xp, 600);
  assert.equal(repeat.victoryRewards.repeat.firstClear, false);
  assert.equal(awardVictory(repeat, "loss", "lose", 300), repeat);
});

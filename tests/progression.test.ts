import { test } from "node:test";
import assert from "node:assert/strict";
import { ALLIES, STAGE, UNITS } from "../src/data.ts";
import { Battle } from "../src/engine.ts";
import { levelOf, unitStats, MAX_LEVEL } from "../src/progression.ts";
import {
  newProgress,
  upgradeCharacter,
  awardVictory,
  loadProgress,
  saveProgress,
  SAVE_KEY,
  SAVE_VERSION,
  type SaveStorage,
} from "../src/progressStore.ts";
class MemoryStorage implements SaveStorage {
  values = new Map<string, string>();
  getItem(key: string) {
    return this.values.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}
test("initial owned roster starts at level 1 with no XP; base balance is unchanged", () => {
  const data = newProgress();
  assert.equal(data.xp, 0);
  for (const kind of ALLIES) {
    assert.equal(levelOf(data.levels, kind), 1);
    assert.deepEqual(unitStats(kind, data.levels), UNITS[kind]);
  }
});
test("upgrade deducts XP once, raises only the selected level, and blocks shortage or level cap", () => {
  const initial = newProgress();
  assert.equal(upgradeCharacter(initial, "novice"), initial);
  const data = { ...initial, xp: 300 };
  const once = upgradeCharacter(data, "novice");
  assert.equal(once.xp, 200);
  assert.equal(once.levels.novice, 2);
  assert.equal(data.levels.novice, 1);
  assert.equal(once.levels.mage, 1);
  const twice = upgradeCharacter(once, "novice");
  assert.equal(twice.xp, 50);
  assert.equal(twice.levels.novice, 3);
  assert.equal(upgradeCharacter(twice, "novice"), twice);
  const capped = { ...data, levels: { ...data.levels, novice: MAX_LEVEL } };
  assert.equal(upgradeCharacter(capped, "novice"), capped);
  assert.equal(upgradeCharacter(data, "soldier"), data);
  const nearCap = {
    ...data,
    xp: 10000,
    levels: { ...data.levels, novice: 19 },
  };
  const maxed = upgradeCharacter(nearCap, "novice");
  assert.equal(maxed.levels.novice, 20);
  assert.equal(upgradeCharacter(maxed, "novice"), maxed);
});
test("upgraded HP, max HP and attack damage match the comparison and survive retry snapshots", () => {
  const levels = { novice: 2, soldier: 20 };
  const b = new Battle(undefined, levels);
  levels.novice = 20;
  const ally = b.spawn("novice", 1),
    enemy = b.spawn("soldier", -1);
  assert.equal(ally.hp, 363);
  assert.equal(ally.maxHP, 363);
  assert.equal(enemy.hp, 170);
  assert.equal(b.stats.novice.damage, 11);
  assert.equal(b.stats.soldier.damage, 25);
  ally.x = 500;
  enemy.x = 520;
  ally.attack = 0;
  b.toggle();
  b.update(0.01);
  assert.equal(enemy.hp, 159);
  const retry = new Battle(b.lineup, b.levels);
  assert.equal(retry.spawn("novice", 1).hp, 363);
  assert.equal(unitStats("mage", { mage: 2 }).hp, 154);
  assert.equal(unitStats("mage", { mage: 2 }).damage, 143);
});
test("each victory grants XP once, including after save/reload; defeat and withdrawal grant nothing", () => {
  const initial = newProgress();
  assert.equal(awardVictory(initial, "lost", "lose", STAGE.victoryXP), initial);
  assert.equal(
    awardVictory(initial, "withdraw", "paused", STAGE.victoryXP),
    initial,
  );
  const won = awardVictory(initial, "battle-a", "win", STAGE.victoryXP);
  assert.equal(won.xp, STAGE.victoryXP);
  assert.equal(awardVictory(won, "battle-a", "win", STAGE.victoryXP), won);
  const storage = new MemoryStorage();
  saveProgress(storage, won);
  const loaded = loadProgress(storage).data;
  assert.equal(
    awardVictory(loaded, "battle-a", "win", STAGE.victoryXP),
    loaded,
  );
  assert.equal(
    awardVictory(loaded, "battle-b", "win", STAGE.victoryXP).xp,
    STAGE.victoryXP * 2,
  );
});
test("versioned save round-trips XP, all levels, formation and unknown future fields", () => {
  const storage = new MemoryStorage();
  const data = {
    ...newProgress(),
    xp: 1234,
    levels: { novice: 7, monk: 4, mage: 9, keito: 20 },
    formation: [
      null,
      "mage",
      null,
      "novice",
      null,
      null,
      null,
      null,
      null,
      null,
    ] as ReturnType<typeof newProgress>["formation"],
    futureField: { currency: 42 },
  };
  saveProgress(storage, data);
  const loaded = loadProgress(storage);
  assert.ok(loaded.canSave);
  assert.deepEqual(loaded.data, data);
});
test("legacy canonical save is backed up and migrated without losing unrelated fields", () => {
  const storage = new MemoryStorage(),
    raw = JSON.stringify({
      version: 1,
      xp: 700,
      characterLevels: { novice: 3 },
      characters: { mage: { level: 4, plus: 2 } },
      currency: 999,
      lineup: ["mage", "novice"],
    });
  storage.setItem(SAVE_KEY, raw);
  const loaded = loadProgress(storage);
  assert.equal(loaded.data.version, SAVE_VERSION);
  assert.equal(loaded.data.xp, 700);
  assert.equal(loaded.data.levels.novice, 3);
  assert.equal(loaded.data.levels.mage, 4);
  assert.equal(loaded.data.currency, 999);
  assert.deepEqual(loaded.data.characters, { mage: { level: 4, plus: 2 } });
  assert.ok(
    [...storage.values.entries()].some(
      ([key, value]) => key.startsWith(SAVE_KEY + ".backup.") && value === raw,
    ),
  );
  saveProgress(storage, loaded.data);
  assert.notEqual(storage.getItem(SAVE_KEY), raw);
});
test("legacy alternate keys, nested XP and character-array levels are imported; original key remains", () => {
  const storage = new MemoryStorage(),
    raw = JSON.stringify({
      resources: { xp: "850" },
      characters: [
        { id: "novice", level: 6 },
        { kind: "keito", level: 12 },
      ],
    });
  storage.setItem("jitto-save", raw);
  const loaded = loadProgress(storage);
  assert.equal(loaded.data.xp, 850);
  assert.equal(loaded.data.levels.novice, 6);
  assert.equal(loaded.data.levels.keito, 12);
  saveProgress(storage, loaded.data);
  assert.equal(storage.getItem("jitto-save"), raw);
});
test("damaged data is backed up before replacing; valid legacy progress is still recovered", () => {
  const storage = new MemoryStorage();
  storage.setItem(SAVE_KEY, "{broken");
  storage.setItem(
    "jitto-save",
    JSON.stringify({ xp: 400, levels: { mage: 5 } }),
  );
  const loaded = loadProgress(storage);
  assert.ok(loaded.canSave);
  assert.equal(loaded.data.xp, 400);
  assert.equal(loaded.data.levels.mage, 5);
  assert.ok([...storage.values.values()].includes("{broken"));
  assert.ok(loaded.warning);
});
test("newer save versions and failed backups are protected from overwrite", () => {
  const storage = new MemoryStorage(),
    future = JSON.stringify({
      version: SAVE_VERSION + 1,
      xp: 900,
      levels: { mage: 10 },
      newSystem: { keep: true },
    });
  storage.setItem(SAVE_KEY, future);
  const loaded = loadProgress(storage);
  assert.equal(loaded.canSave, false);
  assert.equal(loaded.data.xp, 900);
  assert.equal(storage.getItem(SAVE_KEY), future);
  const old = JSON.stringify({ version: 1, xp: 500 });
  const denied: SaveStorage = {
    getItem: (key) => (key === SAVE_KEY ? old : null),
    setItem: () => {
      throw new Error("quota");
    },
  };
  const protectedSave = loadProgress(denied);
  assert.equal(protectedSave.canSave, false);
  assert.equal(protectedSave.data.xp, 500);
});
test("invalid levels are clamped and unavailable storage does not crash the game", () => {
  const storage = new MemoryStorage();
  storage.setItem(
    SAVE_KEY,
    JSON.stringify({
      version: 2,
      xp: -100,
      levels: { novice: 1000, monk: 0, mage: "6", keito: null },
    }),
  );
  const data = loadProgress(storage).data;
  assert.equal(data.xp, 0);
  assert.deepEqual(data.levels, { novice: 20, monk: 1, mage: 6, keito: 1 });
  assert.equal(loadProgress(null).canSave, false);
});

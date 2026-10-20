import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ALLIES,
  INITIAL_ALLIES,
  LEGACY_ALLIES,
  STAGE,
  UNITS,
  type Kind,
} from "../src/data.ts";
import { ALLY_ROSTER } from "../src/allyRoster.ts";
import {
  GACHA_POOL,
  drawCharacter,
  pullGacha,
  finishGacha,
} from "../src/gacha.ts";
import { assignOwnedSlot } from "../src/formation.ts";
import { Battle } from "../src/engine.ts";
import { unitStats } from "../src/progression.ts";
import {
  newProgress,
  upgradeCharacter,
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
test("thirty unique rock allies share the catalog and pool while starters and legacy ownership stay unchanged", () => {
  assert.equal(ALLIES.length, 30);
  assert.equal(new Set(ALLIES).size, 30);
  assert.equal(ALLY_ROSTER.length, 30);
  assert.equal(new Set(ALLIES.map((kind) => UNITS[kind].name)).size, 30);
  assert.deepEqual(
    new Set(GACHA_POOL.map((entry) => entry.kind)),
    new Set(ALLIES),
  );
  assert.deepEqual(
    new Set(ALLY_ROSTER.map((entry) => entry.id)),
    new Set(ALLIES),
  );
  assert.deepEqual(INITIAL_ALLIES, ["novice", "monk", "mage"]);
  assert.deepEqual(LEGACY_ALLIES, ["novice", "monk", "mage", "keito"]);
  assert.deepEqual(newProgress().owned, INITIAL_ALLIES);
  assert.equal(newProgress().owned.includes("keito"), false);
});
test("all allies have usable combat definitions and specialized roles without becoming free upgrades", () => {
  for (const kind of ALLIES) {
    const stats = UNITS[kind];
    for (const field of [
      "hp",
      "range",
      "interval",
      "speed",
      "cost",
      "cooldown",
      "knockback",
    ] as const)
      assert.ok(
        Number.isFinite(stats[field]) && stats[field] > 0,
        `${kind}.${field}`,
      );
    assert.ok(
      Number.isFinite(stats.damage) && stats.damage >= 0,
      `${kind}.damage`,
    );
    assert.ok(
      stats.cost <= STAGE.maxMoney,
      `${kind} is affordable within the wallet cap`,
    );
    assert.equal(typeof stats.area, "boolean");
    assert.ok(stats.role && stats.name);
  }
  assert.ok(UNITS.pebble.cost < UNITS.novice.cost);
  assert.ok(
    UNITS.granite.hp > UNITS.novice.hp &&
      UNITS.granite.speed < UNITS.novice.speed,
  );
  assert.ok(
    UNITS.rockcannon.range > UNITS.mage.range &&
      UNITS.rockcannon.interval > UNITS.mage.interval,
  );
  assert.ok(
    UNITS.titan.hp > UNITS.granite.hp &&
      UNITS.titan.cooldown > UNITS.granite.cooldown,
  );
  assert.ok(
    UNITS.doomgolem.damage > UNITS.mage.damage &&
      UNITS.doomgolem.interval > UNITS.mage.interval,
  );
  assert.deepEqual(
    new Set(
      ALLIES.flatMap((kind) =>
        UNITS[kind].ability ? [UNITS[kind].ability!.type] : [],
      ),
    ),
    new Set(["heal", "slow", "stun", "push", "bossSlayer", "armor"]),
  );
});
test("every unowned ally remains unavailable for formation, upgrading and deployment", () => {
  const data = { ...newProgress(), xp: 100000 };
  for (const kind of ALLIES.filter((kind) => !INITIAL_ALLIES.includes(kind))) {
    assert.equal(upgradeCharacter(data, kind), data, kind);
    assert.equal(
      assignOwnedSlot(data.formation, 9, kind, data.owned)[9],
      null,
      kind,
    );
    const b = new Battle([kind], data.levels, data.owned);
    b.toggle();
    b.money = STAGE.maxMoney;
    assert.equal(b.deploy(kind), false, kind);
  }
});
test("each gacha-only ally can be acquired, saved, equipped, leveled and deployed with the upgraded stats", () => {
  let firstTicket = 0;
  for (const entry of GACHA_POOL) {
    const ticket = firstTicket;
    firstTicket += entry.weight;
    assert.equal(drawCharacter(ticket), entry.kind);
    if (INITIAL_ALLIES.includes(entry.kind)) continue;
    const id = `obtain-${entry.kind}`,
      starting = { ...newProgress(), stones: 150, xp: 10000 };
    const obtained = pullGacha(starting, 1, id, () => ticket);
    assert.equal(obtained.stones, 0);
    assert.ok(obtained.owned.includes(entry.kind));
    assert.equal(obtained.origins[entry.kind], "gacha");
    assert.equal(obtained.duplicates[entry.kind], 0);
    assert.equal(obtained.gachaHistory[0].results[0].isNew, true);
    const upgraded = upgradeCharacter(finishGacha(obtained, id), entry.kind);
    assert.equal(upgraded.xp, 9900);
    assert.equal(upgraded.levels[entry.kind], 2);
    const equipped = {
      ...upgraded,
      formation: assignOwnedSlot(
        upgraded.formation,
        9,
        entry.kind,
        upgraded.owned,
      ),
    };
    const storage = new MemoryStorage();
    saveProgress(storage, equipped);
    const loaded = loadProgress(storage).data;
    assert.deepEqual(loaded, equipped);
    const expected = unitStats(entry.kind, loaded.levels);
    assert.equal(expected.hp, Math.round(UNITS[entry.kind].hp * 1.1));
    assert.equal(expected.damage, Math.round(UNITS[entry.kind].damage * 1.1));
    const battle = new Battle(loaded.formation, loaded.levels, loaded.owned);
    battle.toggle();
    battle.money = STAGE.maxMoney;
    assert.equal(battle.deploy(entry.kind), true, entry.kind);
    assert.equal(battle.units[0].hp, expected.hp);
    assert.equal(battle.units[0].maxHP, expected.hp);
    assert.equal(battle.stats[entry.kind].damage, expected.damage);
  }
});
test("v4 saves retain old owned order, levels, lineup, duplicates, currencies, campaign and pending gacha without granting new units", () => {
  const storage = new MemoryStorage();
  const old = {
    version: 4,
    xp: 4321,
    stones: 7654,
    owned: ["keito", "novice", "bellkeeper", "mage", "monk"],
    origins: {
      novice: "initial",
      monk: "initial",
      mage: "initial",
      keito: "gacha",
      bellkeeper: "gacha",
    },
    duplicates: { keito: 3, bellkeeper: 7 },
    levels: { novice: 7, monk: 3, mage: 6, bellkeeper: 9, keito: 12 },
    formation: ["keito", "bellkeeper", "novice"],
    claimedVictories: ["legacy-victory"],
    stageClears: 3,
    campaign: {
      "stage-01": { unlocked: true, clears: 3, firstRewardClaimed: true },
      "stage-02": { unlocked: true, clears: 0, firstRewardClaimed: false },
    },
    highestStage: 2,
    victoryRewards: {
      "legacy-victory": {
        xp: 300,
        stones: 150,
        firstClear: false,
        stageId: "stage-01",
        bossBonus: 0,
      },
    },
    gachaHistory: [
      {
        id: "prior-pending",
        at: "2026-10-20T12:00:00Z",
        cost: 150,
        theme: "777",
        results: [{ kind: "bellkeeper", isNew: false, duplicate: 7 }],
      },
    ],
    pendingGacha: "prior-pending",
    customField: { keep: true },
  };
  const raw = JSON.stringify(old);
  storage.setItem(SAVE_KEY, raw);
  const loaded = loadProgress(storage);
  assert.equal(loaded.data.version, SAVE_VERSION);
  assert.equal(loaded.canSave, true);
  for (const key of [
    "owned",
    "origins",
    "xp",
    "stones",
    "gachaHistory",
    "pendingGacha",
    "victoryRewards",
    "customField",
  ] as const)
    assert.deepEqual(loaded.data[key], old[key], key);
  assert.equal(loaded.data.duplicates.keito, 3);
  assert.equal(loaded.data.duplicates.bellkeeper, 7);
  for (const [kind, level] of Object.entries(old.levels))
    assert.equal(loaded.data.levels[kind as Kind], level);
  assert.deepEqual(loaded.data.formation.slice(0, 3), old.formation);
  assert.deepEqual(loaded.data.campaign["stage-01"], old.campaign["stage-01"]);
  assert.equal(loaded.data.highestStage, 2);
  for (const kind of ALLIES.filter((kind) => !old.owned.includes(kind))) {
    assert.equal(loaded.data.levels[kind], 1);
    assert.equal(loaded.data.owned.includes(kind), false);
  }
  assert.ok(
    [...storage.values.values()].includes(raw),
    "the v4 JSON is backed up before migration",
  );
  saveProgress(storage, loaded.data);
  assert.deepEqual(loadProgress(storage).data, loaded.data);
});

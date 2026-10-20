import { test } from "node:test";
import assert from "node:assert/strict";
import { STAGES, AREAS, DEFAULT_STAGE } from "../src/stages.ts";
import { ALLIES, INITIAL_ALLIES, UNITS } from "../src/data.ts";
import { Battle } from "../src/engine.ts";
import {
  newProgress,
  awardStageVictory,
  loadProgress,
  saveProgress,
  SAVE_KEY,
  SAVE_VERSION,
  type SaveStorage,
} from "../src/progressStore.ts";
import { pullGacha } from "../src/gacha.ts";
class MemoryStorage implements SaveStorage {
  values = new Map<string, string>();
  getItem(key: string) {
    return this.values.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}
test("15 distinct stages form three five-stage areas with unique patterns and backgrounds", () => {
  assert.equal(STAGES.length, 15);
  assert.equal(AREAS.length, 3);
  for (let area = 0; area < 3; area++)
    assert.equal(STAGES.filter((s) => s.area === area).length, 5);
  assert.equal(new Set(STAGES.map((s) => s.id)).size, 15);
  assert.equal(new Set(STAGES.map((s) => s.background.motif)).size, 15);
  assert.equal(new Set(STAGES.map((s) => JSON.stringify(s.waves))).size, 15);
  for (const [index, stage] of STAGES.entries()) {
    assert.equal(stage.number, index + 1);
    assert.ok(stage.enemyBaseHP > 0);
    assert.equal(stage.firstClearStones, 1500);
    assert.equal(stage.repeatStones, 150);
    assert.ok(
      stage.waves.length > 0 &&
        stage.waves.every(
          (w, i) =>
            w.at >= 0 &&
            !!UNITS[w.kind] &&
            !ALLIES.includes(w.kind) &&
            (!i || w.at >= stage.waves[i - 1].at),
        ),
    );
    assert.equal(stage.bossBonus, stage.boss ? 1500 : 0);
    if (stage.boss)
      assert.equal(stage.waves.filter((w) => w.kind === stage.boss).length, 1);
  }
  assert.deepEqual(
    STAGES.filter((s) => s.boss).map((s) => [s.number, UNITS[s.boss!].name]),
    [
      [5, "異端の門番"],
      [10, "朝活皇帝"],
      [15, "永眠の守護者"],
    ],
  );
  assert.equal(DEFAULT_STAGE.name, "岩の聖地");
  assert.equal(DEFAULT_STAGE.waves.length, 28);
  assert.equal(DEFAULT_STAGE.enemyBaseHP, 3200);
});
test("fresh campaign gates locked stages and victory rewards; losses and withdrawal do nothing", () => {
  const data = newProgress();
  assert.equal(data.highestStage, 1);
  assert.equal(
    Object.values(data.campaign).filter((s) => s.unlocked).length,
    1,
  );
  for (const status of ["lose", "paused", "ready"])
    assert.equal(
      awardStageVictory(data, "not-win", status, DEFAULT_STAGE.id),
      data,
    );
  assert.equal(awardStageVictory(data, "locked", "win", STAGES[1].id), data);
  assert.equal(awardStageVictory(data, "missing", "win", "unknown"), data);
});
test("all first rewards, boss bonuses and sequential unlocks happen once, with repeat rewards on every new win", () => {
  let data = newProgress();
  for (const stage of STAGES) {
    const id = `clear-${stage.id}`,
      before = data;
    data = awardStageVictory(data, id, "win", stage.id);
    assert.equal(data.stones - before.stones, stage.boss ? 3000 : 1500);
    assert.equal(data.xp - before.xp, stage.victoryXP);
    assert.equal(data.campaign[stage.id].clears, 1);
    assert.ok(data.campaign[stage.id].firstRewardClaimed);
    assert.equal(data.highestStage, Math.min(15, stage.number + 1));
    assert.equal(awardStageVictory(data, id, "win", stage.id), data);
    if (stage.number < 14)
      assert.equal(data.campaign[STAGES[stage.number + 1].id].unlocked, false);
  }
  assert.equal(data.stones, 27000);
  assert.equal(data.stageClears, 15);
  const storage = new MemoryStorage();
  saveProgress(storage, data);
  data = loadProgress(storage).data;
  for (const stage of STAGES) {
    const before = data;
    data = awardStageVictory(data, `repeat-${stage.id}`, "win", stage.id);
    assert.equal(data.stones - before.stones, 150);
    assert.equal(data.campaign[stage.id].clears, 2);
    assert.equal(data.victoryRewards[`repeat-${stage.id}`].bossBonus, 0);
  }
  assert.equal(data.stones, 29250);
  assert.equal(data.highestStage, 15);
});
test("v3 migration preserves collection, leveling, stones, lineup and pending gacha, and unlocks stage 2 for old clears", () => {
  const storage = new MemoryStorage();
  const pulled = pullGacha(
    { ...newProgress(), stones: 1800, xp: 7654 },
    1,
    "pending",
    () => 9999,
  );
  const raw = JSON.stringify({
    ...pulled,
    version: 3,
    levels: { ...pulled.levels, keito: 12 },
    formation: ["keito", "mage"],
    stageClears: 4,
    claimedVictories: ["a", "b", "c", "d"],
    customField: { keep: true },
  });
  storage.setItem(SAVE_KEY, raw);
  const loaded = loadProgress(storage).data;
  assert.equal(loaded.version, SAVE_VERSION);
  assert.equal(loaded.xp, 7654);
  assert.equal(loaded.stones, 1650);
  assert.deepEqual(loaded.owned, pulled.owned);
  assert.deepEqual(loaded.origins, pulled.origins);
  assert.deepEqual(loaded.duplicates, pulled.duplicates);
  assert.deepEqual(loaded.gachaHistory, pulled.gachaHistory);
  assert.equal(loaded.pendingGacha, "pending");
  assert.equal(loaded.levels.keito, 12);
  assert.deepEqual(loaded.formation.slice(0, 2), ["keito", "mage"]);
  assert.deepEqual(loaded.customField, { keep: true });
  assert.equal(loaded.campaign[DEFAULT_STAGE.id].clears, 4);
  assert.equal(loaded.campaign[DEFAULT_STAGE.id].firstRewardClaimed, true);
  assert.equal(loaded.highestStage, 2);
  assert.ok([...storage.values.values()].includes(raw));
  const won = awardStageVictory(loaded, "new-repeat", "win", DEFAULT_STAGE.id);
  assert.equal(won.stones, 1800);
  saveProgress(storage, won);
  assert.deepEqual(loadProgress(storage).data, won);
});
test("a battle uses selected stage HP and waves and retries the same stage with snapshots", () => {
  const stage = { ...STAGES[6], waves: [{ at: 0, kind: "runner" as const }] };
  const b = new Battle(INITIAL_ALLIES, { novice: 4 }, INITIAL_ALLIES, stage);
  stage.waves[0].at = 100;
  assert.equal(b.rightHP, 5700);
  assert.equal(b.leftHP, 3200);
  b.toggle();
  b.update(0.01);
  assert.equal(b.units[0].kind, "runner");
  const retry = new Battle(b.lineup, b.levels, b.owned, b.stage);
  assert.equal(retry.stage.id, STAGES[6].id);
  assert.equal(retry.rightHP, 5700);
  assert.equal(retry.stats.novice.hp, 429);
  assert.equal(retry.wave, 0);
  assert.equal(retry.time, 0);
});

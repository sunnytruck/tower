import { test } from "node:test";
import assert from "node:assert/strict";
import { Battle } from "../src/engine.ts";
import { ALLIES, STAGE } from "../src/data.ts";
const advance = (b: Battle, seconds: number) => {
  for (let i = 0; i < seconds * 60; i++) b.update(1 / 60);
};
test("deployment requires active play, funds and cooldown; all four allies work", () => {
  const b = new Battle();
  assert.equal(b.deploy("novice"), false);
  b.toggle();
  for (const kind of ALLIES) {
    b.money = 1800;
    assert.equal(b.deploy(kind), true);
    assert.equal(b.deploy(kind), false);
  }
  b.money = 0;
  assert.equal(b.deploy("mage"), false);
  assert.equal(b.deploy("heavy"), false);
});
test("pause freezes time, income, cooldown and combat; fresh battle resets", () => {
  const b = new Battle();
  b.toggle();
  b.deploy("novice");
  b.toggle();
  const before = JSON.stringify(b);
  advance(b, 10);
  assert.equal(JSON.stringify(b), before);
  b.toggle();
  advance(b, 1);
  assert.ok(b.time > 0.9);
  const fresh = new Battle();
  assert.equal(fresh.time, 0);
  assert.equal(fresh.units.length, 0);
  assert.equal(fresh.leftHP, STAGE.baseHP);
});
test("all three enemies appear and an undefended base loses", () => {
  const b = new Battle();
  b.toggle();
  advance(b, 24);
  assert.deepEqual(
    new Set(b.units.map((u) => u.kind)),
    new Set(["soldier", "runner", "heavy"]),
  );
  advance(b, 300);
  assert.equal(b.status, "lose");
  assert.equal(b.leftHP, 0);
});
test("a mixed army can win the complete stage", () => {
  const b = new Battle();
  b.toggle();
  const used = new Set<string>();
  for (let i = 0; i < 60 * 300 && b.status === "playing"; i++) {
    const choices =
      b.time < 13
        ? (["novice"] as const)
        : b.time < 35
          ? (["keito"] as const)
          : (["keito", "mage", "monk", "novice"] as const);
    for (const kind of choices) if (b.deploy(kind)) used.add(kind);
    b.update(1 / 60);
  }
  assert.equal(used.size, 4);
  assert.equal(b.status, "win");
  assert.equal(b.rightHP, 0);
  assert.ok(b.leftHP > 0);
});
test("area attacks hit multiple targets while single attacks hit one", () => {
  for (const kind of ["monk", "novice"] as const) {
    const b = new Battle();
    b.toggle();
    const a = b.spawn(kind, 1);
    a.x = 500;
    a.attack = 0;
    const x = b.spawn("heavy", -1);
    x.x = 520;
    const y = b.spawn("heavy", -1);
    y.x = 530;
    b.update(0.01);
    assert.ok(x.hp < 850);
    assert.equal(y.hp < 850, kind === "monk");
  }
});

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
test("all five enemies appear and an undefended base loses", () => {
  const b = new Battle();
  b.toggle();
  advance(b, 35);
  assert.deepEqual(
    new Set(b.units.map((u) => u.kind)),
    new Set(["soldier", "runner", "heavy", "sniper", "bomber"]),
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

test("single-role spam and unsupported attackers cannot clear the stage", () => {
  for (const choices of [
    ["keito"],
    ["novice"],
    ["mage"],
    ["monk"],
    ["mage", "keito"],
  ] as const) {
    const b = new Battle();
    b.toggle();
    for (let i = 0; i < 60 * 360 && b.status === "playing"; i++) {
      for (const k of choices) b.deploy(k);
      b.update(1 / 60);
    }
    assert.equal(b.status, "lose", choices.join("+"));
  }
});
test("hits trigger bounded effects and a brief combat stop without blocking deployment", () => {
  const b = new Battle();
  b.toggle();
  const a = b.spawn("keito", 1);
  a.x = 500;
  a.attack = 0;
  const target = b.spawn("soldier", -1);
  target.x = 520;
  b.update(0.01);
  assert.ok(target.hp <= 0);
  assert.ok(target.recoil > 0);
  assert.ok(b.hitStop > 0 && b.hitStop <= 0.045);
  assert.ok(b.impacts.some((e) => e.death && e.power === 3));
  const time = b.time,
    money = b.money;
  assert.ok(b.deploy("novice"));
  const x = a.x;
  b.update(0.01);
  assert.equal(a.x, x);
  assert.ok(b.time > time);
  assert.ok(b.money < money);
  for (let i = 0; i < 100; i++) b.impact(500, 200, 3, 1);
  assert.equal(b.impacts.length, 48);
  b.toggle();
  const paused = JSON.stringify(b);
  advance(b, 1);
  assert.equal(JSON.stringify(b), paused);
});
test("ranged enemy stops behind the frontline and bomber splash is localized", () => {
  const b = new Battle();
  b.toggle();
  const sniper = b.spawn("sniper", -1);
  sniper.x = 600;
  sniper.attack = 0;
  const wall = b.spawn("novice", 1);
  wall.x = 350;
  const x = sniper.x;
  b.update(0.01);
  assert.equal(sniper.x, x);
  assert.ok(wall.hp < 330);
  const c = new Battle();
  c.toggle();
  const bomber = c.spawn("bomber", -1);
  bomber.x = 600;
  bomber.attack = 0;
  const units = [510, 480, 350].map((x) => {
    const u = c.spawn("novice", 1);
    u.x = x;
    return u;
  });
  c.update(0.01);
  assert.ok(units[0].hp < 330);
  assert.ok(units[1].hp < 330);
  assert.equal(units[2].hp, 330);
});

test("deployment timing changes the outcome for the same wall and attacker composition", () => {
  for (const delay of [0, 60]) {
    const b = new Battle();
    b.toggle();
    for (let i = 0; i < 60 * 360 && b.status === "playing"; i++) {
      if (b.time >= delay)
        for (const k of ["mage", "novice"] as const) b.deploy(k);
      b.update(1 / 60);
    }
    assert.equal(b.status, delay === 0 ? "win" : "lose");
  }
});

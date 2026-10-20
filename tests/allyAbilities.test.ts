import { test } from "node:test";
import assert from "node:assert/strict";
import { Battle } from "../src/engine.ts";
import { UNITS, type Kind } from "../src/data.ts";
import { unitStats } from "../src/progression.ts";

test("healing grows with level, chooses up to three injured allies in range and cannot overheal", () => {
  const b = new Battle([], { oremonk: 2 });
  b.toggle();
  const healer = b.spawn("oremonk", 1);
  healer.x = 500;
  healer.attack = 0;
  healer.hp -= 30;
  const allies = [450, 480, 530, 540, 700].map((x, i) => {
    const u = b.spawn("novice", 1);
    u.x = x;
    u.hp = [50, 100, 328, 329, 50][i];
    u.attack = 100;
    return u;
  });
  const enemy = b.spawn("heavy", -1);
  enemy.x = 550;
  enemy.attack = 100;
  b.update(0.01);
  assert.equal(unitStats("oremonk", { oremonk: 2 }).ability!.value, 31);
  assert.deepEqual(
    allies.map((u) => u.hp),
    [81, 131, 330, 329, 50],
  );
  assert.equal(healer.hp, 245);
  assert.equal(enemy.hp, 850);
  assert.ok(allies[0].healFlash! > 0);
  assert.equal(healer.attack, UNITS.oremonk.interval);
  assert.equal(b.effects.filter((e) => e.text.startsWith("+")).length, 3);
  const before = allies[0].hp;
  b.update(0.1);
  assert.equal(allies[0].hp, before);
});
test("slow affects movement only, has a finite duration and stronger repeated slows are retained", () => {
  const b = new Battle();
  b.toggle();
  const attacker = b.spawn("fossil", 1);
  attacker.x = 500;
  attacker.attack = 0;
  const enemy = b.spawn("heavy", -1);
  enemy.x = 540;
  enemy.attack = 100;
  b.update(0.01);
  assert.equal(enemy.slowFactor, 0.7);
  assert.ok(enemy.slow! > 1);
  attacker.hp = 0;
  const x = enemy.x,
    attack = enemy.attack;
  b.update(0.1);
  assert.ok(enemy.x < x);
  assert.ok(enemy.x > x - 1.7);
  assert.ok(enemy.attack < attack);
  for (let i = 0; i < 90; i++) b.update(1 / 60);
  assert.equal(enemy.slow, 0);
  assert.equal(enemy.slowFactor, 1);
  const c = new Battle();
  c.toggle();
  const fossil = c.spawn("fossil", 1),
    jade = c.spawn("jadedancer", 1),
    foe = c.spawn("heavy", -1);
  fossil.x = 500;
  jade.x = 500;
  foe.x = 540;
  fossil.attack = 0;
  jade.attack = 0;
  foe.attack = 100;
  c.update(0.01);
  assert.equal(foe.slowFactor, 0.65);
  fossil.attack = 0;
  jade.attack = 100;
  c.update(0.2);
  assert.equal(foe.slowFactor, 0.65);
});
test("stun and push apply to hit enemies, with reduced duration and distance against bosses", () => {
  for (const kind of ["heavy", "gatekeeper"] as const) {
    const b = new Battle();
    b.toggle();
    const attacker = b.spawn("thundermage", 1);
    attacker.x = 500;
    attacker.attack = 0;
    const target = b.spawn(kind, -1);
    target.x = 600;
    target.attack = 100;
    b.update(0.01);
    const expected = kind === "gatekeeper" ? 0.225 : 0.45;
    assert.ok(target.stun! <= expected && target.stun! > expected - 0.02);
    const x = target.x,
      attack = target.attack;
    b.update(0.1);
    assert.equal(target.x, x);
    assert.equal(target.attack, attack);
    b.toggle();
    const before = JSON.stringify(b);
    b.update(1);
    assert.equal(JSON.stringify(b), before);
    const c = new Battle();
    c.toggle();
    const guard = c.spawn("magnet", 1);
    guard.x = 500;
    guard.attack = 0;
    const foe = c.spawn(kind, -1);
    foe.x = 550;
    foe.attack = 100;
    c.update(0.01);
    assert.ok(foe.x >= 550 + (kind === "gatekeeper" ? 11 : 22) - 0.3);
  }
});
test("boss slayer only boosts bosses and armor reduces actual incoming damage", () => {
  for (const kind of ["heavy", "gatekeeper"] as const) {
    const b = new Battle();
    b.toggle();
    const attacker = b.spawn("giantbreaker", 1);
    attacker.x = 500;
    attacker.attack = 0;
    const target = b.spawn(kind, -1);
    target.x = 520;
    target.attack = 100;
    b.update(0.01);
    assert.equal(
      target.maxHP - target.hp,
      Math.round(135 * (kind === "gatekeeper" ? 1.7 : 1)),
    );
  }
  const b = new Battle();
  b.toggle();
  const wall = b.spawn("obsidianknight", 1);
  wall.x = 500;
  wall.attack = 100;
  const enemy = b.spawn("heavy", -1);
  enemy.x = 520;
  enemy.attack = 0;
  b.update(0.01);
  assert.equal(wall.maxHP - wall.hp, 52);
});
test("HP knockback segments retreat once per threshold, while the original allies retain their front line", () => {
  for (const kind of ["crystalarcher", "novice"] as Kind[]) {
    const b = new Battle();
    b.toggle();
    const ally = b.spawn(kind, 1);
    ally.x = 500;
    ally.attack = 100;
    const enemy = b.spawn("soldier", -1);
    enemy.x = 520;
    enemy.attack = 0;
    b.update(0.01);
    enemy.attack = 0;
    b.update(0.2);
    if (kind === "crystalarcher") {
      assert.equal(ally.knockbacks, 1);
      assert.ok(ally.x < 500);
    } else {
      assert.equal(ally.knockbacks, undefined);
      assert.ok(ally.x >= 500);
    }
  }
});

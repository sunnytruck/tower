import { test } from "node:test";
import assert from "node:assert/strict";
import {
  initialFormation,
  assignSlot,
  normalizeFormation,
} from "../src/formation.ts";
import { Battle } from "../src/engine.ts";
test("ten slots start with three unique allies and seven empty slots", () => {
  const f = initialFormation();
  assert.equal(f.length, 10);
  assert.equal(f.filter(Boolean).length, 3);
  assert.equal(f[9], null);
});
test("assignment moves characters, replaces a slot, removes and preserves input", () => {
  const f = initialFormation();
  const moved = assignSlot(f, 9, "novice");
  assert.equal(moved[0], null);
  assert.equal(moved[9], "novice");
  assert.equal(f[0], "novice");
  const replaced = assignSlot(moved, 1, "mage");
  assert.equal(replaced[1], "mage");
  assert.equal(replaced[2], null);
  assert.equal(assignSlot(replaced, 1, null)[1], null);
  assert.deepEqual(assignSlot(f, -1, "mage"), f);
});
test("normalization excludes enemies and duplicate entries", () => {
  const f = normalizeFormation(["heavy", "novice", "novice"]);
  assert.equal(f.length, 10);
  assert.deepEqual(f.slice(0, 3), [null, "novice", null]);
});
test("battle snapshots selection and rejects unselected characters, including on retry", () => {
  const f = assignSlot(Array(10).fill(null), 9, "mage");
  const b = new Battle(f);
  f[9] = "novice";
  b.toggle();
  b.money = 1800;
  assert.equal(b.deploy("novice"), false);
  assert.equal(b.deploy("mage"), true);
  assert.equal(b.deploy("mage"), false);
  const retry = new Battle(b.lineup);
  retry.toggle();
  assert.equal(retry.lineup[9], "mage");
  assert.equal(retry.units.length, 0);
  assert.equal(retry.deploy("mage"), true);
  const empty = new Battle([]);
  empty.toggle();
  assert.equal(empty.deploy("novice"), false);
});

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CHARACTER_ASSETS,
  containSize,
  characterAction,
  characterFrame,
} from "../src/characterAssets.ts";
test("each ally has an independent full-body PNG/WebP asset path", () => {
  const entries = Object.values(CHARACTER_ASSETS);
  assert.equal(entries.length, 4);
  assert.equal(new Set(entries.map((v) => v.image)).size, 4);
  for (const entry of entries) assert.match(entry.image, /\.(png|webp)$/);
});
test("contain sizing preserves complete tall and wide images without distortion", () => {
  for (const [width, height] of [
    [800, 1400],
    [1500, 600],
    [1000, 1000],
  ]) {
    const fit = containSize(width, height, 80, 90);
    assert.ok(fit.width <= 80 && fit.height <= 90);
    assert.ok(Math.abs(fit.width / fit.height - width / height) < 1e-10);
  }
  assert.deepEqual(containSize(0, 100, 80, 90), { width: 0, height: 0 });
});

test("all configured PNG assets are included in the checkout", async () => {
  const { readFile } = await import("node:fs/promises");
  const sources = new Set(
    Object.values(CHARACTER_ASSETS).flatMap((asset) => [
      asset.image,
      ...Object.values(asset.clips ?? {}).flatMap((clip) => clip.frames),
    ]),
  );
  for (const source of sources) {
    const bytes = await readFile(
      new URL("../public/" + source.replace(/^\.\//, ""), import.meta.url),
    );
    assert.equal(bytes.subarray(1, 4).toString(), "PNG");
    assert.ok(bytes.readUInt32BE(16) > 0 && bytes.readUInt32BE(20) > 0);
    assert.equal(bytes[25], 6, "RGBA PNG includes an alpha channel");
  }
});

test("visual state prioritizes defeat, damage, attack and then movement without mutating the unit", () => {
  const u = { hp: 10, flash: 0, pose: 0 };
  assert.equal(characterAction(u, false), "idle");
  assert.equal(characterAction(u, true), "walk");
  u.pose = 0.3;
  assert.equal(characterAction(u, true), "attack");
  u.flash = 0.18;
  assert.equal(characterAction(u, true), "hit");
  u.hp = 0;
  const before = JSON.stringify(u);
  assert.equal(characterAction(u, true), "death");
  assert.equal(JSON.stringify(u), before);
});
test("keito loops idle/walk and plays the full attack/hit sequence within existing timers", () => {
  const art = CHARACTER_ASSETS.keito;
  assert.match(characterFrame(art, "idle", 0).source, /idle_01.png$/);
  assert.match(characterFrame(art, "idle", 0.75).source, /idle_04.png$/);
  assert.match(characterFrame(art, "idle", 1).source, /idle_01.png$/);
  assert.match(characterFrame(art, "walk", 0.125).source, /walk_02.png$/);
  assert.match(characterFrame(art, "attack", 0).source, /attack_01.png$/);
  assert.match(characterFrame(art, "attack", 0.1).source, /attack_02.png$/);
  assert.match(characterFrame(art, "attack", 0.299).source, /attack_03.png$/);
  assert.match(characterFrame(art, "attack", 10).source, /attack_03.png$/);
  assert.match(characterFrame(art, "hit", 0.1).source, /hit_02.png$/);
  assert.match(characterFrame(art, "death", 0.54).source, /death.png$/);
  assert.equal(art.quality, "draft-background");
});
test("single-image characters retain their artwork for every action", () => {
  for (const action of ["idle", "walk", "attack", "hit", "death"] as const) {
    assert.deepEqual(characterFrame(CHARACTER_ASSETS.novice, action, 123), {
      source: CHARACTER_ASSETS.novice.image,
      isFrame: false,
    });
  }
});

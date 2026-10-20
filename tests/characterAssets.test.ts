import { test } from "node:test";
import assert from "node:assert/strict";
import { CHARACTER_ASSETS, containSize } from "../src/characterAssets.ts";
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
  for (const definition of Object.values(CHARACTER_ASSETS)) {
    const bytes = await readFile(
      new URL(
        "../public/" + definition.image.replace(/^\.\//, ""),
        import.meta.url,
      ),
    );
    assert.equal(bytes.subarray(1, 4).toString(), "PNG");
    assert.ok(bytes.readUInt32BE(16) > 0 && bytes.readUInt32BE(20) > 0);
    assert.equal(bytes[25], 6, "RGBA PNG includes an alpha channel");
  }
});

import { test } from "node:test";
import assert from "node:assert/strict";
import { revealSequence } from "../src/gachaPresentation.ts";
test("each presentation has a timed reveal; full rotation is exclusive to Keito", () => {
  for (const theme of [
    "normal",
    "red",
    "gold",
    "rainbow",
    "777",
    "revival",
    "keito",
  ] as const) {
    const sequence = revealSequence(theme);
    assert.ok(sequence.some((step) => step.phase === "reveal"));
    assert.ok(
      sequence.every((step) => step.duration > 0 && step.duration < 3000),
    );
    assert.equal(
      sequence.some((step) => step.phase === "fullspin"),
      theme === "keito",
    );
  }
});
test("Keito has its entire dedicated sequence; revival follows an apparent failure", () => {
  assert.deepEqual(
    revealSequence("keito").map((step) => step.phase),
    [
      "dark",
      "ukiki",
      "split",
      "fullspin",
      "jackpot",
      "rainbow",
      "reveal",
      "legend",
    ],
  );
  assert.equal(revealSequence("keito")[1].title, "うきき！");
  assert.equal(revealSequence("keito").at(-1)!.title, "伝説降臨 — 岩尊けいと");
  const revival = revealSequence("revival").map((step) => step.phase);
  assert.ok(revival.indexOf("silence") < revival.indexOf("ukiki"));
});

import type { Stage } from "./stages.ts";
/** Static decoration: unique terrain landmarks for each stage, outside simulation. */
export function drawStageScenery(c: CanvasRenderingContext2D, stage: Stage) {
  const motif = stage.background.motif;
  if (motif === "sanctuary") return;
  c.save();
  c.fillStyle = stage.background.accent;
  if (["river", "bridge", "lake"].includes(motif)) {
    c.fillStyle = motif === "lake" ? "#769da9" : "#7eaeb1";
    c.beginPath();
    c.moveTo(0, 323);
    c.bezierCurveTo(360, 290, 760, 345, 1400, 315);
    c.lineTo(1400, 355);
    c.bezierCurveTo(900, 380, 400, 330, 0, 365);
    c.fill();
    c.strokeStyle = "#d7e5cf88";
    c.lineWidth = 2;
    for (let i = 0; i < 15; i++) {
      c.beginPath();
      c.moveTo(i * 100, 335 + (i % 3) * 5);
      c.lineTo(i * 100 + 45, 337 + (i % 3) * 5);
      c.stroke();
    }
    if (motif === "bridge") {
      c.fillStyle = "#bca888";
      c.fillRect(420, 292, 560, 19);
      c.fillStyle = "#7f8170";
      for (let i = 0; i < 6; i++) c.fillRect(435 + i * 105, 310, 15, 66);
    }
    if (motif === "lake") {
      c.strokeStyle = "#4f7169";
      for (let i = 0; i < 20; i++) {
        let x = i * 79;
        c.beginPath();
        c.moveTo(x, 326);
        c.lineTo(x + 5, 304);
        c.stroke();
      }
    }
  } else if (motif === "cliffs") {
    for (let i = 0; i < 8; i++) {
      const x = i * 195;
      c.fillStyle = i % 2 ? "#7f8e7c" : "#929f89";
      c.beginPath();
      c.moveTo(x, 291);
      c.lineTo(x + 15, 140 + (i % 3) * 20);
      c.lineTo(x + 48, 120 + (i % 3) * 20);
      c.lineTo(x + 83, 290);
      c.fill();
    }
  } else if (
    [
      "village",
      "towers",
      "plaza",
      "stairs",
      "palace",
      "gate",
      "ruins",
    ].includes(motif)
  ) {
    const imperial = stage.area === 1;
    c.fillStyle = imperial ? "#9c8469" : "#788477";
    for (let i = 0; i < 7; i++) {
      const x = 180 + i * 170,
        h =
          motif === "towers"
            ? 90 + (i % 3) * 28
            : motif === "village"
              ? 28 + (i % 3) * 14
              : 55 + (i % 3) * 20;
      c.fillRect(x, 289 - h, 55, h);
      c.beginPath();
      c.moveTo(x - 9, 289 - h);
      c.lineTo(x + 27, 269 - h);
      c.lineTo(x + 64, 289 - h);
      c.fill();
      c.fillStyle = imperial ? "#d7b87c" : "#c1c9a2";
      c.fillRect(x + 20, 278 - h, 12, 18);
      c.fillStyle = imperial ? "#9c8469" : "#788477";
    }
    if (motif === "plaza") {
      c.strokeStyle = "#e9d3a3";
      c.lineWidth = 4;
      c.beginPath();
      c.ellipse(710, 324, 170, 16, 0, 0, Math.PI * 2);
      c.stroke();
    }
    if (motif === "stairs") {
      c.fillStyle = "#bba888";
      for (let i = 0; i < 9; i++)
        c.fillRect(280 + i * 90, 304 + i * 5, 110, 10);
    }
    if (motif === "palace" || motif === "gate") {
      c.fillStyle = imperial ? "#b59870" : "#778471";
      c.fillRect(940, 123, 160, 166);
      c.fillStyle = stage.background.sky[1];
      c.beginPath();
      c.arc(1020, 236, 34, Math.PI, 0);
      c.lineTo(1054, 290);
      c.lineTo(986, 290);
      c.fill();
    }
    if (motif === "ruins") {
      c.fillStyle = "#a5b4a1";
      for (let i = 0; i < 6; i++) {
        const x = 260 + i * 170;
        c.fillRect(x, 184 + (i % 2) * 27, 18, 107 - (i % 2) * 27);
        c.fillRect(x - 8, 184 + (i % 2) * 27, 34, 9);
      }
    }
  } else {
    const grove = motif === "grove",
      dream = motif === "dream";
    for (let i = 0; i < 13; i++) {
      const x = i * 120 + 25,
        h = 95 + (i % 4) * 20;
      c.fillStyle = i % 2 ? "#46675e" : "#4f7567";
      c.fillRect(x - 8, 290 - h, 16, h);
      c.beginPath();
      c.ellipse(x, 290 - h, 46, grove ? 25 : 60, 0, 0, Math.PI * 2);
      c.fill();
      if (grove) {
        c.fillStyle = "#b1b5a0";
        c.beginPath();
        c.ellipse(x, 290 - h - 8, 47, 17, 0, Math.PI, 0);
        c.fill();
      }
    }
    if (dream) {
      c.strokeStyle = "#a7c6c5";
      c.lineWidth = 3;
      c.beginPath();
      c.arc(820, 129, 60, 0, Math.PI * 2);
      c.stroke();
      c.fillStyle = "#d6e2ca";
      for (let i = 0; i < 18; i++) {
        c.beginPath();
        c.arc(90 + i * 70, 155 + (i % 4) * 22, 1.8, 0, 7);
        c.fill();
      }
    }
  }
  c.restore();
}

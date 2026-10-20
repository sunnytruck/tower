import { Battle, type Unit } from "./engine.ts";
import { UNITS, STAGE } from "./data.ts";
import { drawAlly, isAlly } from "./characterArt.ts";
const motionSamples = new WeakMap<Unit, { x: number; lastMove: number }>();
const images = new Map<string, HTMLImageElement>();
export function figure(
  c: CanvasRenderingContext2D,
  u: Unit,
  t: number,
  y = 295,
  displayScale = 1,
  showHealth = true,
  walking = false,
) {
  const d = UNITS[u.kind];
  c.save();
  c.translate(u.x + u.recoil, y);
  c.scale(d.size * displayScale, d.size * displayScale);
  if (isAlly(u.kind)) {
    drawAlly(c, u, t, walking);
    if (showHealth && u.hp > 0) {
      const top = u.kind === "mage" ? -146 : u.kind === "keito" ? -145 : -120;
      c.fillStyle = "#283b33";
      c.fillRect(-22, top, 44, 4);
      c.fillStyle = "#9ed7bc";
      c.fillRect(-22, top, (44 * Math.max(0, u.hp)) / d.hp, 4);
    }
    c.restore();
    return;
  }

  if (u.hp <= 0) {
    c.globalAlpha = Math.max(0, 1 - u.dead / 0.55);
    c.rotate(u.side * u.dead * 5);
    c.translate(
      -u.side * u.dead * 75,
      -Math.sin((u.dead / 0.55) * Math.PI) * 45,
    );
  } else c.translate(u.pose ? u.side * 7 : 0, Math.sin(t * 9 + u.id) * 2);
  c.strokeStyle = "#202b35";
  c.lineWidth = 5;
  c.lineCap = "round";
  const step = u.pose ? 0 : Math.sin(t * 9 + u.id) * 7;
  for (const s of [-1, 1]) {
    c.beginPath();
    c.moveTo(s * 5, -13);
    c.lineTo(s * 10 + step * s, 0);
    c.stroke();
  }
  c.fillStyle = u.flash ? "#fff" : d.color;
  c.beginPath();
  c.roundRect(-14, -38, 28, 27, 7);
  c.fill();
  c.stroke();
  c.lineWidth = 4;
  c.beginPath();
  c.moveTo(-12, -31);
  c.lineTo(-23, -19);
  c.moveTo(12, -31);
  c.lineTo(23 + (u.pose ? 15 : 0), u.pose ? -35 : -19);
  c.stroke();
  if (u.kind === "sniper" || u.kind === "bomber") {
    c.save();
    c.scale(u.side, 1);
    c.fillStyle = "#303c48";
    if (u.kind === "sniper") {
      c.fillRect(8, -30, 48, 6);
      c.fillRect(22, -37, 13, 6);
    } else {
      c.beginPath();
      c.arc(23, -26, 14, 0, Math.PI * 2);
      c.fill();
      c.fillRect(25, -34, 23, 12);
      c.fillStyle = "#e4a67e";
      c.beginPath();
      c.arc(48, -28, 5, 0, Math.PI * 2);
      c.fill();
    }
    c.restore();
  }
  // Fictional clay portrait; replace through the optional portrait URL in data.ts.
  const g = c.createRadialGradient(-7, -65, 1, 0, -57, 29);
  g.addColorStop(0, "#f8dcc1");
  g.addColorStop(0.7, "#c89b7d");
  g.addColorStop(1, "#795d53");
  c.fillStyle = u.flash ? "#fff" : g;
  c.beginPath();
  c.ellipse(0, -59, 25, 29, 0, 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = "#3c3432";
  c.lineWidth = 2;
  c.stroke();
  if (d.portrait) {
    let img = images.get(d.portrait);
    if (!img) {
      img = new Image();
      img.src = d.portrait;
      images.set(d.portrait, img);
    }
    if (img.complete && img.naturalWidth) {
      c.save();
      c.beginPath();
      c.ellipse(0, -59, 24, 28, 0, 0, Math.PI * 2);
      c.clip();
      c.drawImage(img, -25, -88, 50, 58);
      c.restore();
    }
  }
  c.fillStyle = "#3f3938";
  c.beginPath();
  c.ellipse(-9, -62, 3, 2, 0, 0, 7);
  c.ellipse(9, -62, 3, 2, 0, 0, 7);
  c.fill();
  c.strokeStyle = "#765546";
  c.beginPath();
  c.moveTo(1, -61);
  c.lineTo(-2, -51);
  c.lineTo(3, -50);
  c.moveTo(-8, -44);
  c.quadraticCurveTo(0, -39, 9, -45);
  c.stroke();
  c.fillStyle = d.color;
  c.fillRect(-27, -82, 54, 9);
  c.font = "bold 12px sans-serif";
  c.textAlign = "center";
  c.fillStyle = "#1e2934";
  c.fillText(d.symbol, 0, -73);

  if (u.pose) {
    c.strokeStyle = "#ffe4a3";
    c.lineWidth = 3;
    c.beginPath();
    c.arc(u.side * 29, -38, 20, -1.5, 1.6);
    c.stroke();
    c.fillStyle = "#fff2c8";
    c.font = "26px sans-serif";
    c.fillText("✦", u.side * 40, -30);
  }
  if (showHealth && u.hp > 0) {
    c.fillStyle = "#28313a";
    c.fillRect(-21, -101, 42, 4);
    c.fillStyle = u.side === 1 ? "#9ed7bc" : "#ed9a88";
    c.fillRect(-21, -101, (42 * u.hp) / d.hp, 4);
  }
  c.restore();
}
export function draw(
  c: CanvasRenderingContext2D,
  b: Battle,
  reducedMotion = false,
) {
  const w = STAGE.width;
  const height = c.canvas.height;
  c.clearRect(0, 0, w, height);
  c.save();
  if (!reducedMotion && b.status === "playing")
    c.translate(
      Math.sin(b.fxTime * 105) * b.shake,
      Math.cos(b.fxTime * 83) * b.shake * 0.5,
    );
  const sky = c.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, "#a9d8d3");
  sky.addColorStop(1, "#fff1bf");
  c.fillStyle = sky;
  c.fillRect(0, 0, w, height);
  c.fillStyle = "#f8edd1";
  c.beginPath();
  c.arc(1050, 78, 40, 0, 7);
  c.fill();
  // Extend the sky to the viewport, keeping all combat positions unchanged.
  c.translate(0, height - 380);
  for (let layer = 0; layer < 3; layer++) {
    c.fillStyle = ["#bdccbd", "#a5b9aa", "#819e8e"][layer];
    c.beginPath();
    c.moveTo(0, 280);
    for (let i = 0; i <= 14; i++)
      c.lineTo(i * 110, 160 + layer * 30 + Math.sin(i * 2.2 + layer) * 45);
    c.lineTo(w, 330);
    c.lineTo(0, 330);
    c.fill();
  }
  c.fillStyle = "#6a7b60";
  c.fillRect(0, 292, w, 9);
  c.fillStyle = "#c1b28c";
  c.fillRect(0, 301, w, 79);
  c.fillStyle = "#a39575";
  for (let i = 0; i < 60; i++) c.fillRect(i * 29, (i % 3) * 18 + 320, 9, 2);
  for (const side of [1, -1]) {
    const x = side === 1 ? 62 : 1338;
    c.save();
    c.translate(x, 295);
    c.fillStyle = side === 1 ? "#465f58" : "#665e61";
    c.beginPath();
    c.moveTo(-44, 0);
    c.lineTo(-38, -89);
    c.lineTo(-25, -89);
    c.lineTo(-25, -130);
    c.lineTo(0, -157);
    c.lineTo(25, -130);
    c.lineTo(25, -89);
    c.lineTo(38, -89);
    c.lineTo(44, 0);
    c.closePath();
    c.fill();
    c.fillStyle = "#e8d6a9";
    c.font = "bold 27px serif";
    c.textAlign = "center";
    c.fillText(side === 1 ? "岩" : "戦", 0, -96);
    c.fillStyle = "#222d32";
    c.fillRect(-13, -47, 26, 47);
    c.fillStyle = "#f2c772";
    c.fillRect(-2, -181, 3, 28);
    c.fillStyle = side === 1 ? "#eac879" : "#c78679";
    c.beginPath();
    c.moveTo(1, -181);
    c.lineTo(34, -170);
    c.lineTo(1, -160);
    c.fill();
    c.restore();
  }
  for (const u of [...b.units].sort((a, b) => a.x - b.x)) {
    let sample = motionSamples.get(u);
    if (!sample) {
      sample = { x: u.x, lastMove: -1 };
      motionSamples.set(u, sample);
    }
    if (Math.abs(u.x - sample.x) > 0.001) {
      sample.lastMove = b.time;
      sample.x = u.x;
    }
    figure(
      c,
      u,
      b.time,
      295,
      1.4,
      true,
      b.time - sample.lastMove < 0.12 && !u.pose,
    );
  }
  for (const e of b.impacts) {
    const progress = 1 - e.life / e.duration;
    const radius = (e.death ? 25 : 18) * e.power * (0.3 + progress * 2);
    c.globalAlpha = (1 - progress) * 0.8;
    c.strokeStyle = e.color;
    c.lineWidth = (1 - progress) * 3 * e.power;
    c.beginPath();
    c.ellipse(e.x, e.y, radius, radius * 0.45, 0, 0, Math.PI * 2);
    c.stroke();
    const count = e.power >= 3 ? 12 : 6;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const distance = radius * (e.death ? 1.6 : 1);
      const x = e.x + Math.cos(angle) * distance,
        y = e.y + Math.sin(angle) * distance - progress * 25;
      c.fillStyle = i % 2 ? e.color : "#fff7db";
      c.fillRect(
        x,
        y,
        Math.max(1, 5 * (1 - progress)),
        Math.max(1, 5 * (1 - progress)),
      );
    }
    if (e.power >= 3) {
      c.globalAlpha = (1 - progress) * 0.7;
      c.fillStyle = "#fff2ba";
      c.beginPath();
      c.arc(e.x, e.y, 24 * (1 - progress), 0, Math.PI * 2);
      c.fill();
    }
  }
  for (const e of b.effects) {
    c.globalAlpha = Math.min(1, e.life * 3);
    c.font = "bold 25px sans-serif";
    c.textAlign = "center";
    c.strokeStyle = "#433b32";
    c.lineWidth = 3;
    c.strokeText(e.text, e.x, e.y - (0.8 - e.life) * 65);
    c.fillStyle = e.color;
    c.fillText(e.text, e.x, e.y - (0.8 - e.life) * 65);
  }
  c.globalAlpha = 1;
  c.restore();
}

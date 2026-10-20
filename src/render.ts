import { Battle, type Unit } from "./engine.ts";
import { UNITS, STAGE } from "./data.ts";
const images = new Map<string, HTMLImageElement>();
export function figure(
  c: CanvasRenderingContext2D,
  u: Unit,
  t: number,
  y = 295,
) {
  const d = UNITS[u.kind];
  c.save();
  c.translate(u.x, y);
  c.scale(d.size, d.size);
  if (u.hp <= 0) {
    c.globalAlpha = Math.max(0, 1 - u.dead / 0.55);
    c.rotate(u.side * u.dead * 2);
    c.translate(0, u.dead * 45);
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
  if (u.hp > 0) {
    c.fillStyle = "#28313a";
    c.fillRect(-21, -101, 42, 4);
    c.fillStyle = u.side === 1 ? "#9ed7bc" : "#ed9a88";
    c.fillRect(-21, -101, (42 * u.hp) / d.hp, 4);
  }
  c.restore();
}
export function draw(c: CanvasRenderingContext2D, b: Battle) {
  const w = STAGE.width;
  c.clearRect(0, 0, w, 380);
  const sky = c.createLinearGradient(0, 0, 0, 380);
  sky.addColorStop(0, "#d9e4df");
  sky.addColorStop(1, "#f0e7cc");
  c.fillStyle = sky;
  c.fillRect(0, 0, w, 380);
  c.fillStyle = "#f8edd1";
  c.beginPath();
  c.arc(1050, 78, 40, 0, 7);
  c.fill();
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
  for (const u of [...b.units].sort((a, b) => a.x - b.x)) figure(c, u, b.time);
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
}

import { UNITS, type Kind } from "./data.ts";
import type { Unit } from "./engine.ts";

export type AllyKind = "novice" | "monk" | "mage" | "keito";
type Face = {
  cell: [number, number];
  box: [number, number, number, number];
  skin: string;
  eyes: number;
  blink: number;
};
// Visual coordinates only. This module never changes a unit or its combat stats.
export const CHARACTER_ART: Record<AllyKind, Face> = {
  novice: {
    cell: [0, 0],
    box: [-26, -108, 52, 69],
    skin: "#d29c76",
    eyes: 0.47,
    blink: 0.29,
  },
  monk: {
    cell: [1, 0],
    box: [-30, -111, 60, 73],
    skin: "#ad744e",
    eyes: 0.46,
    blink: 0.18,
  },
  mage: {
    cell: [0, 1],
    box: [-27, -111, 54, 72],
    skin: "#c4a386",
    eyes: 0.39,
    blink: 0.45,
  },
  keito: {
    cell: [1, 1],
    box: [-37, -127, 74, 92],
    skin: "#9e7443",
    eyes: 0.43,
    blink: 0.22,
  },
};
const atlasUrl = new URL("./assets/ally-faces.png", import.meta.url).href;
const textures = new Map<string, HTMLImageElement>();
const listeners = new Set<() => void>();
export function onArtLoaded(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}
function texture(source: string) {
  let image = textures.get(source);
  if (!image) {
    image = new Image();
    image.onload = () => listeners.forEach((cb) => cb());
    image.onerror = () => listeners.forEach((cb) => cb());
    image.src = source;
    textures.set(source, image);
  }
  return image;
}
export function isAlly(kind: Kind): kind is AllyKind {
  return kind in CHARACTER_ART;
}
type C = CanvasRenderingContext2D;
function path(
  c: C,
  points: number[],
  fill: string,
  stroke = "#354239",
  line = 1.4,
) {
  c.beginPath();
  for (let i = 0; i < points.length; i += 2)
    i ? c.lineTo(points[i], points[i + 1]) : c.moveTo(points[i], points[i + 1]);
  c.closePath();
  if (fill) {
    c.fillStyle = fill;
    c.fill();
  }
  if (stroke) {
    c.strokeStyle = stroke;
    c.lineWidth = line;
    c.lineJoin = "round";
    c.stroke();
  }
}
function oval(
  c: C,
  x: number,
  y: number,
  rx: number,
  ry: number,
  fill: string,
  rotation = 0,
) {
  c.fillStyle = fill;
  c.beginPath();
  c.ellipse(x, y, rx, ry, rotation, 0, Math.PI * 2);
  c.fill();
}
function line(c: C, points: number[], color: string, width = 2) {
  c.strokeStyle = color;
  c.lineWidth = width;
  c.lineCap = "round";
  c.lineJoin = "round";
  c.beginPath();
  for (let i = 0; i < points.length; i += 2)
    i ? c.lineTo(points[i], points[i + 1]) : c.moveTo(points[i], points[i + 1]);
  c.stroke();
}
function rock(
  c: C,
  x: number,
  y: number,
  r: number,
  tint = "#69746c",
  rotation = 0,
) {
  c.save();
  c.translate(x, y);
  c.rotate(rotation);
  path(
    c,
    [
      -r,
      -r * 0.25,
      -r * 0.65,
      -r * 0.82,
      r * 0.16,
      -r,
      r * 0.86,
      -r * 0.45,
      r,
      r * 0.26,
      r * 0.45,
      r * 0.89,
      -r * 0.44,
      r * 0.8,
    ],
    tint,
    "#38443e",
    1.5,
  );
  path(
    c,
    [-r * 0.65, -r * 0.82, r * 0.16, -r, r * 0.47, -r * 0.22, -r * 0.27, 0],
    "#b4b69a",
    "",
  );
  path(
    c,
    [-r * 0.27, 0, r * 0.47, -r * 0.22, r, r * 0.26, r * 0.45, r * 0.89],
    "#59685f",
    "",
  );
  line(
    c,
    [-r * 0.5, r * 0.35, -r * 0.27, 0, -r * 0.5, -r * 0.25],
    "#45554a",
    1,
  );
  c.restore();
}
function runeCircle(
  c: C,
  x: number,
  y: number,
  r: number,
  t: number,
  color: string,
  tilt = 0.35,
) {
  c.save();
  c.translate(x, y);
  c.scale(1, tilt);
  c.rotate(t);
  c.strokeStyle = color;
  c.lineWidth = 1.2;
  for (const q of [r, r * 0.78]) {
    c.beginPath();
    c.arc(0, 0, q, 0, Math.PI * 2);
    c.stroke();
  }
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    line(
      c,
      [
        Math.cos(a) * r * 0.83,
        Math.sin(a) * r * 0.83,
        Math.cos(a) * r * 0.96,
        Math.sin(a) * r * 0.96,
      ],
      color,
      1.4,
    );
  }
  path(c, [0, -r * 0.7, r * 0.61, r * 0.35, -r * 0.61, r * 0.35], "", color);
  c.restore();
}
function face(
  c: C,
  kind: AllyKind,
  u: Unit,
  t: number,
  strike: number,
  headTilt: number,
) {
  const f = CHARACTER_ART[kind];
  const [x, y, w, h] = f.box;
  c.save();
  c.translate(0, -43);
  c.rotate(headTilt + (u.flash ? Math.sin(t * 95) * 0.11 : 0));
  c.scale(u.flash ? 1.035 : 1, u.flash ? 0.95 : 1);
  c.translate(0, 43);
  const source = UNITS[kind].portrait;
  const image = texture(source || atlasUrl);
  if (image.complete && image.naturalWidth) {
    c.save();
    if (u.flash) c.filter = "brightness(1.7) saturate(.6)";
    if (source) c.drawImage(image, x, y, w, h);
    else {
      const cell = image.naturalWidth / 2;
      c.drawImage(
        image,
        f.cell[0] * cell,
        f.cell[1] * cell,
        cell,
        cell,
        x,
        y,
        w,
        h,
      );
    }
    c.restore();
  } else {
    // Distinct angular fallback while the atlas is loading or if a replacement fails.
    const cut = kind === "monk" ? 0.9 : kind === "novice" ? 0.55 : 0.75;
    path(
      c,
      [
        x + w * 0.15,
        y + h * 0.08,
        x + w * 0.8,
        y,
        x + w,
        y + h * 0.4,
        x + w * 0.9,
        y + h * 0.8,
        x + w * 0.55,
        y + h,
        x + w * (1 - cut),
        y + h * 0.9,
        x,
        y + h * 0.4,
      ],
      f.skin,
    );
    line(c, [x + w * 0.25, y + h * 0.43, x + w * 0.4, y + h * 0.4], "#493d31");
    line(c, [x + w * 0.6, y + h * 0.4, x + w * 0.75, y + h * 0.43], "#493d31");
  }
  // A brief eyelid overlay and facial squash animate the original photo-like heads.
  const blink = Math.sin(t * 1.8 + f.blink * 12) > 0.995 || u.hp <= 0;
  if (blink) {
    const eyeY = y + h * f.eyes;
    for (const eyeX of [x + w * 0.36, x + w * 0.64]) {
      oval(c, eyeX, eyeY, w * 0.085, h * 0.029, f.skin);
      line(
        c,
        [eyeX - w * 0.06, eyeY, eyeX, eyeY + 1, eyeX + w * 0.06, eyeY],
        "#4b3b2d",
        1,
      );
    }
  }
  if (kind === "novice" && (u.flash || strike > 0)) {
    c.fillStyle = "#85d2da";
    c.beginPath();
    c.moveTo(x + w * 0.9, y + h * 0.41);
    c.quadraticCurveTo(x + w * 1.09, y + h * 0.61, x + w * 0.92, y + h * 0.61);
    c.quadraticCurveTo(x + w * 0.84, y + h * 0.56, x + w * 0.9, y + h * 0.41);
    c.fill();
  }
  c.restore();
}
function beads(c: C, t: number) {
  for (let i = 0; i < 13; i++) {
    const a = (i / 12) * Math.PI;
    oval(c, Math.cos(a) * 11, -36 + Math.sin(a) * 12, 2, 2, "#68503c");
  }
  line(c, [0, -23, Math.sin(t) * 2, -15], "#9d744b", 1);
}
function feet(c: C, step: number, kind: AllyKind) {
  const width = kind === "monk" ? 9 : 6;
  for (const side of [-1, 1]) {
    c.save();
    c.translate(side * (kind === "monk" ? 12 : 8) + step * side, 0);
    c.rotate(step * side * 0.025);
    oval(c, 0, -3, width, 3, kind === "novice" ? "#8e7458" : "#3c4841");
    if (kind === "novice") line(c, [-4, -4, 1, -2, 3, -5], "#d1ba8d", 1.5);
    c.restore();
  }
}
function novice(c: C, u: Unit, t: number, walk: boolean, strike: number) {
  const step = walk ? Math.sin(t * 12 + u.id) * 4 : 0;
  feet(c, step, "novice");
  c.save();
  c.rotate(
    (walk ? Math.sin(t * 6 + u.id) * 0.045 : -0.04) + (u.flash ? -0.1 : 0),
  );
  path(c, [-10, -45, 11, -44, 17, -8, -16, -8], "#f8f3e5", "#827d68");
  path(
    c,
    [-9, -43, 2, -33, 10, -44, 3, -18, -5, -18],
    "#ded9c5",
    "#a5a18d",
    0.8,
  );
  line(c, [6, -33, 9, -12], "#c4bfa7", 1);
  path(c, [-9, -42, -21, -25, -12, -20, 1, -33], "#f5f0df", "#8c8972");
  path(
    c,
    [10, -41, 20 + strike * 10, -27, 10 + strike * 12, -19, 2, -32],
    "#faf5e6",
    "#8c8972",
  );
  beads(c, t);
  face(c, "novice", u, t, strike, -0.07 + Math.sin(t * 2) * 0.025);
  oval(c, 8 + strike * 12, -27, 5, 6, "#dbaf8b", -0.4);
  oval(c, 3 + strike * 7, -24, 4, 5, "#d5a57f", 0.5);
  if (strike) {
    line(c, [22, -32, 30 + strike * 14, -35], "#fff2b5", 2);
    c.font = "9px serif";
    c.fillStyle = "#fff6ce";
    c.fillText("祈", 26 + strike * 12, -39);
  }
  c.restore();
}
function monk(c: C, u: Unit, t: number, walk: boolean, strike: number) {
  const stomp = walk ? Math.sin(t * 8 + u.id) : 0;
  feet(c, stomp * 3, "monk");
  c.save();
  c.translate(strike * 7, -Math.abs(stomp) * 1.5);
  c.rotate(strike * 0.09);
  path(
    c,
    [-17, -43, 15, -44, 21, -18, 8, -12, -10, -13, -22, -22],
    "#bd8b62",
    "#684c3c",
  );
  oval(c, -12, -34, 8, 12, "#d8aa7a", -0.4);
  oval(c, 12, -34, 9, 12, "#d9aa77", 0.4);
  line(c, [-2, -39, -1, -25], "#8a6346", 1);
  path(
    c,
    [-20, -18, 21, -18, 16, -4, 3, -8, -2, -4, -17, -6],
    "#645d46",
    "#343f36",
  );
  line(c, [-17, -17, 18, -17], "#dfb971", 4);
  rock(c, -29, -25, 16, "#798174", stomp * 0.04);
  rock(
    c,
    30 + strike * 23,
    -29 - strike * 4,
    23,
    "#7a8070",
    -0.15 - strike * 0.25,
  );
  c.fillStyle = "#f1cf7b";
  c.font = "bold 11px serif";
  c.fillText("拳", 22 + strike * 23, -25 - strike * 4);
  face(c, "monk", u, t, strike, -strike * 0.08);
  if (strike) {
    c.strokeStyle = "#f4c674";
    c.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      c.beginPath();
      c.arc(48 + strike * 20, -28, 12 + i * 6, -1.2, 1.2);
      c.stroke();
    }
    rock(c, 60 + strike * 18, -6, 2, "#a99d72", t);
  }
  c.restore();
}
function mage(c: C, u: Unit, t: number, walk: boolean, strike: number) {
  const drift = Math.sin(t * (walk ? 5 : 2) + u.id);
  runeCircle(c, 0, -3, 27 + strike * 9, -t * 0.45, "#99d8cf");
  c.save();
  c.translate(0, -3 - drift * 1.8);
  path(
    c,
    [-13, -46, 13, -45, 23 + drift * 2, -7, 10, -10, 0, -5, -14, -9, -24, -6],
    "#544b83",
    "#32384f",
  );
  path(c, [-9, -40, 4, -35, 10, -9, -10, -10], "#8d80b2", "#c8b58c", 1);
  path(c, [-10, -42, -24, -26, -17, -18, 0, -28], "#716197", "#302f4c");
  path(
    c,
    [11, -43, 30, -34 - strike * 7, 27, -23 - strike * 7, 2, -27],
    "#706198",
    "#302f4c",
  );
  face(c, "mage", u, t, strike, strike * -0.08);
  path(
    c,
    [-28, -101, -19, -121, -3, -139, 1, -123, 15, -111, 24, -100],
    "#5a4d82",
    "#3b3953",
  );
  path(
    c,
    [-32, -100, -7, -105, 28, -99, 8, -93, -20, -94],
    "#8f7fac",
    "#3b3953",
  );
  c.fillStyle = "#dfc67c";
  c.font = "11px serif";
  c.fillText("✦", -8, -113);
  c.save();
  c.translate(35, -20);
  c.rotate(-0.07 - strike * 0.35);
  line(c, [0, 13, 0, -67], "#70563f", 4);
  line(c, [1, 12, 1, -67], "#c6a278", 1);
  path(
    c,
    [-8, -64, -11, -76, 0, -84, 10, -76, 7, -63],
    "#78c9c9",
    "#d6c17d",
    2,
  );
  runeCircle(c, 0, -74, 13, t, "#adf7e4", 1);
  c.restore();
  if (strike) {
    c.save();
    c.globalAlpha = strike;
    runeCircle(c, 53, -66, 22 + strike * 9, -t * 3, "#b2f5e9", 1);
    line(c, [42, -68, 70, -75, 92 + strike * 18, -70], "#e6fff0", 3);
    for (let i = 0; i < 4; i++)
      oval(c, 58 + i * 12, -67 + Math.sin(t * 12 + i) * 7, 2, 2, "#cfffe8");
    c.restore();
  }
  c.restore();
}
function keito(c: C, u: Unit, t: number, walk: boolean, strike: number) {
  c.save();
  const sway = walk ? Math.sin(t * 5 + u.id) : 0;
  const halo = c.createRadialGradient(0, -83, 20, 0, -83, 76);
  halo.addColorStop(0, "#fff0a338");
  halo.addColorStop(1, "#ffe79600");
  c.fillStyle = halo;
  c.fillRect(-78, -160, 156, 155);
  c.strokeStyle = "#dfbc61a0";
  c.lineWidth = 1.3;
  c.beginPath();
  c.arc(0, -83, 43, 0, Math.PI * 2);
  c.stroke();
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2 + t * 0.03;
    line(
      c,
      [
        Math.cos(a) * 47,
        -83 + Math.sin(a) * 47,
        Math.cos(a) * (54 + strike * 7),
        -83 + Math.sin(a) * (54 + strike * 7),
      ],
      "#e5c77a80",
      1.4,
    );
  }
  feet(c, sway * 2, "keito");
  c.translate(strike * 3, -Math.abs(sway));
  path(c, [-18, -37, 18, -37, 25, -7, 0, -12, -24, -7], "#986044", "#634c37");
  rock(c, 0, -27, 22, "#777966");
  rock(c, -28, -39, 20, "#7c806c", -0.2);
  rock(c, 28, -38, 21, "#7c806c", 0.2);
  rock(c, -30, -15, 17, "#777968");
  rock(c, 32 + strike * 16, -16 - strike * 9, 21, "#7a7d67", strike * 0.3);
  face(c, "keito", u, t, strike, strike * 0.04);
  c.fillStyle = "#f0cf77";
  c.textAlign = "center";
  c.font = "bold 9px serif";
  c.fillText("じっと", 0, -18);
  c.font = "11px serif";
  c.fillText("じ", -31, -12);
  c.fillText("と", 32 + strike * 16, -13 - strike * 9);
  if (strike) {
    runeCircle(c, 25, -7, 45 + strike * 20, -t, "#f7d789");
    c.strokeStyle = "#fff0aa";
    c.lineWidth = 3;
    for (let i = 0; i < 3; i++) {
      c.beginPath();
      c.ellipse(
        25,
        -6,
        30 + i * 15 + strike * 10,
        8 + i * 4,
        0,
        0,
        Math.PI * 2,
      );
      c.stroke();
    }
    for (let i = 0; i < 5; i++)
      rock(
        c,
        30 + i * 11,
        -8 - Math.sin(i * 2) * 10 - strike * 10,
        2.5,
        "#b9a772",
        t + i,
      );
  }
  c.restore();
}
export function drawAlly(c: C, u: Unit, t: number, walking = false) {
  if (!isAlly(u.kind)) return;
  const strike = u.pose > 0 ? Math.sqrt(u.pose / 0.3) : 0;
  const breath = Math.sin(t * 2.3 + u.id) * 0.65;
  c.save();
  if (u.hp <= 0) {
    const p = u.dead / 0.55;
    c.globalAlpha *= Math.max(0, 1 - p);
    c.translate(
      -u.side * (u.kind === "monk" ? 95 : 65) * p,
      -Math.sin(p * Math.PI) * 45,
    );
    c.rotate((u.kind === "mage" ? -1 : 1) * p * Math.PI * 1.5);
    for (let i = 0; i < 3; i++)
      oval(c, Math.sin(i * 2 + t) * 25, -90 - i * 8, 2, 2, "#fff0ad");
  } else {
    c.translate(0, breath);
    c.rotate(u.flash ? -0.07 : 0);
  }
  c.scale(u.side, 1);
  switch (u.kind) {
    case "novice":
      novice(c, u, t, walking, strike);
      break;
    case "monk":
      monk(c, u, t, walking, strike);
      break;
    case "mage":
      mage(c, u, t, walking, strike);
      break;
    case "keito":
      keito(c, u, t, walking, strike);
      break;
  }
  c.restore();
}

import type { Unit } from "./engine.ts";
import { UNITS } from "./data.ts";
/** Independent enemy silhouettes, with no image downloads or combat mutations. */
export function drawBoss(c: CanvasRenderingContext2D, u: Unit, time: number) {
  const d = UNITS[u.kind],
    boss = d.boss;
  c.save();
  if (u.hp <= 0) {
    c.globalAlpha = Math.max(0, 1 - u.dead / 0.55);
    c.translate(
      -u.side * u.dead * 80,
      -Math.sin((u.dead / 0.55) * Math.PI) * 25,
    );
    c.rotate(u.side * u.dead * 3);
  } else c.translate(u.pose ? -7 : 0, Math.sin(time * 2 + u.id) * 1.5);
  c.strokeStyle = "#353b39";
  c.lineWidth = 2.5;
  c.lineJoin = "round";
  const shape = (path: number[][], fill: string) => {
    c.fillStyle = u.flash ? "#fff8dc" : fill;
    c.beginPath();
    path.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
    c.closePath();
    c.fill();
    c.stroke();
  };
  const ellipse = (
    x: number,
    y: number,
    rx: number,
    ry: number,
    fill: string,
  ) => {
    c.fillStyle = u.flash ? "#fff8dc" : fill;
    c.beginPath();
    c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    c.fill();
    c.stroke();
  };
  if (boss === "gate") {
    // A broad door-shaped sentinel, one shield arm and a heavy stone ram.
    shape(
      [
        [-29, 0],
        [-27, -24],
        [-10, -24],
        [-6, 0],
      ],
      "#514b42",
    );
    shape(
      [
        [7, 0],
        [9, -24],
        [27, -24],
        [32, 0],
      ],
      "#514b42",
    );
    shape(
      [
        [-42, -25],
        [-45, -97],
        [-30, -112],
        [30, -112],
        [44, -97],
        [41, -25],
      ],
      "#8d7c65",
    );
    shape(
      [
        [-29, -38],
        [-28, -89],
        [0, -103],
        [28, -89],
        [29, -38],
      ],
      "#c1ae88",
    );
    shape(
      [
        [-22, -69],
        [-22, -85],
        [0, -98],
        [22, -85],
        [22, -69],
      ],
      "#3c423d",
    );
    c.fillStyle = "#ffc869";
    c.fillRect(-17, -81, 11, 4);
    c.fillRect(7, -81, 11, 4);
    c.strokeStyle = "#5e5143";
    c.beginPath();
    c.moveTo(-13, -58);
    c.lineTo(12, -58);
    c.moveTo(-1, -66);
    c.lineTo(-1, -41);
    c.stroke();
    shape(
      [
        [30, -83],
        [55, -82],
        [64, -34],
        [33, -27],
      ],
      "#6a7263",
    );
    c.save();
    c.translate(-34, -66);
    c.rotate(u.pose ? -0.8 : 0.15);
    shape(
      [
        [-7, 29],
        [-7, -28],
        [5, -28],
        [5, 29],
      ],
      "#765233",
    );
    shape(
      [
        [-28, -42],
        [18, -46],
        [28, -26],
        [18, -8],
        [-28, -12],
      ],
      "#9ba18b",
    );
    c.restore();
    c.fillStyle = "#e3c78c";
    c.font = "bold 17px serif";
    c.textAlign = "center";
    c.fillText("門", 0, -29);
  } else if (boss === "sun") {
    // Tall solar crown, narrow cloaked body and a long light spear.
    c.strokeStyle = "#edbe60";
    c.lineWidth = 2;
    c.beginPath();
    c.arc(0, -78, 35, 0, Math.PI * 2);
    c.stroke();
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI) / 6 + time * 0.08;
      c.beginPath();
      c.moveTo(Math.cos(a) * 38, -78 + Math.sin(a) * 38);
      c.lineTo(Math.cos(a) * 46, -78 + Math.sin(a) * 46);
      c.stroke();
    }
    c.strokeStyle = "#664934";
    shape(
      [
        [-13, -58],
        [-38, -3],
        [34, -3],
        [14, -58],
      ],
      "#c66d3c",
    );
    shape(
      [
        [-9, -58],
        [-18, -5],
        [20, -5],
        [8, -58],
      ],
      "#ffe3a0",
    );
    ellipse(0, -79, 23, 27, "#e1b478");
    shape(
      [
        [-25, -93],
        [-29, -115],
        [-13, -106],
        [0, -121],
        [13, -106],
        [29, -115],
        [24, -93],
      ],
      "#f3c65e",
    );
    c.fillStyle = "#5b3d31";
    c.fillRect(-15, -83, 10, 3);
    c.fillRect(6, -83, 10, 3);
    shape(
      [
        [-11, -69],
        [0, -61],
        [11, -69],
        [0, -45],
      ],
      "#d6d5bb",
    );
    c.save();
    c.translate(-31, -55);
    c.rotate(u.pose ? -0.3 : 0.15);
    c.strokeStyle = "#f9df91";
    c.lineWidth = 5;
    c.beginPath();
    c.moveTo(0, 45);
    c.lineTo(0, -44);
    c.stroke();
    shape(
      [
        [0, -56],
        [-8, -39],
        [0, -26],
        [8, -39],
      ],
      "#fff0bb",
    );
    c.restore();
    if (u.pose) {
      c.globalAlpha = 0.5;
      c.fillStyle = "#fff0a6";
      c.fillRect(-155, -62, 128, 9);
      c.globalAlpha = 1;
    }
  } else {
    // Wide moss-covered sleeping beast, crescent antlers, pillow and dream cloud.
    c.strokeStyle = "#3b5360";
    ellipse(0, -40, 49, 35, "#728f82");
    ellipse(-31, -9, 20, 9, "#526f66");
    ellipse(31, -9, 20, 9, "#526f66");
    shape(
      [
        [-35, -63],
        [-48, -101],
        [-32, -91],
        [-27, -112],
        [-18, -76],
      ],
      "#b0c2ab",
    );
    shape(
      [
        [35, -63],
        [48, -101],
        [32, -91],
        [27, -112],
        [18, -76],
      ],
      "#b0c2ab",
    );
    ellipse(0, -69, 33, 28, "#9bbab3");
    c.strokeStyle = "#3c5860";
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(-22, -70);
    c.quadraticCurveTo(-14, -65, -6, -70);
    c.moveTo(7, -70);
    c.quadraticCurveTo(15, -65, 23, -70);
    c.stroke();
    ellipse(0, -55, 10, 7, "#547580");
    ellipse(-2, -29, 29, 13, "#c8d1bd");
    c.fillStyle = "#ccdfa9";
    for (let i = 0; i < 5; i++) {
      c.beginPath();
      c.arc(-35 + i * 17, -42 + (i % 2) * 6, 5, Math.PI, 0);
      c.fill();
    }
    c.fillStyle = "#c7e1ec";
    c.font = "bold 12px serif";
    c.fillText("Z", 33, -95 - Math.sin(time * 2) * 3);
    c.font = "bold 8px serif";
    c.fillText("z", 45, -107 - Math.sin(time * 2) * 3);
    if (u.pose) {
      c.strokeStyle = "#c1dfee";
      c.lineWidth = 3;
      for (let i = 0; i < 3; i++) {
        c.beginPath();
        c.ellipse(-40 - i * 17, -40, 12 + i * 5, 25 + i * 6, 0, 0, Math.PI * 2);
        c.stroke();
      }
    }
  }
  if (u.hp > 0) {
    c.fillStyle = "#283b33";
    c.fillRect(-28, -134, 56, 4);
    c.fillStyle = "#eb9d71";
    c.fillRect(-28, -134, (56 * u.hp) / u.maxHP, 4);
  }
  c.restore();
}

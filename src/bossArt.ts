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
    // A human gate captain: exposed face and hands, heavy cuirass and a door shield.
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
        [-37, -22],
        [-39, -58],
        [-24, -72],
        [22, -72],
        [38, -56],
        [35, -22],
      ],
      "#8d7c65",
    );
    shape(
      [
        [-26, -27],
        [-24, -58],
        [0, -67],
        [24, -58],
        [25, -27],
      ],
      "#c1ae88",
    );
    c.strokeStyle = "#433f37";
    ellipse(0, -87, 29, 28, "#d9a781");
    shape(
      [
        [-29, -91],
        [-29, -108],
        [-16, -119],
        [13, -119],
        [30, -106],
        [30, -89],
        [20, -97],
        [-19, -97],
      ],
      "#727c72",
    );
    shape(
      [
        [-27, -92],
        [-32, -72],
        [-22, -67],
        [-18, -82],
      ],
      "#8d9889",
    );
    shape(
      [
        [27, -92],
        [31, -73],
        [21, -67],
        [18, -82],
      ],
      "#8d9889",
    );
    c.strokeStyle = "#694b37";
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(-20, -88);
    c.lineTo(-7, -91);
    c.moveTo(7, -91);
    c.lineTo(20, -88);
    c.stroke();
    c.fillStyle = "#332e27";
    c.fillRect(-17, -85, 8, 3);
    c.fillRect(9, -85, 8, 3);
    c.strokeStyle = "#9a6447";
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(1, -85);
    c.lineTo(-4, -74);
    c.lineTo(3, -73);
    c.moveTo(-11, -67);
    c.quadraticCurveTo(0, -62, 11, -67);
    c.stroke();
    shape(
      [
        [-19, -71],
        [-12, -58],
        [0, -53],
        [15, -61],
        [20, -72],
        [8, -67],
        [0, -68],
        [-8, -67],
      ],
      "#665044",
    );
    ellipse(-36, -52, 9, 11, "#d9a781");
    ellipse(37, -51, 8, 11, "#d9a781");
    shape(
      [
        [31, -79],
        [55, -77],
        [64, -30],
        [33, -24],
      ],
      "#6a7263",
    );
    c.strokeStyle = "#c6b486";
    c.beginPath();
    c.moveTo(45, -71);
    c.lineTo(49, -32);
    c.moveTo(36, -49);
    c.lineTo(57, -50);
    c.stroke();
    c.save();
    c.translate(-34, -60);
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
    c.font = "bold 15px serif";
    c.textAlign = "center";
    c.fillText("門", 0, -32);
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
    // A human sleeping commander: nightcap, huge tired face, cross-legged robe and pillow.
    c.strokeStyle = "#3b5360";
    shape(
      [
        [-38, -6],
        [-36, -39],
        [-24, -58],
        [22, -60],
        [39, -38],
        [43, -6],
      ],
      "#627f80",
    );
    shape(
      [
        [-14, -54],
        [-19, -15],
        [21, -15],
        [12, -55],
      ],
      "#c2cabb",
    );
    shape(
      [
        [-33, -15],
        [-50, -7],
        [-47, 0],
        [-10, -1],
        [3, -11],
      ],
      "#4c6870",
    );
    shape(
      [
        [31, -15],
        [48, -6],
        [43, 1],
        [7, -1],
        [-3, -10],
      ],
      "#5b737b",
    );
    ellipse(0, -81, 34, 31, "#d6b397");
    // Grey hair and cloth nightcap replace the former antlers and animal ears.
    shape(
      [
        [-32, -88],
        [-38, -100],
        [-25, -114],
        [4, -120],
        [26, -113],
        [44, -111],
        [51, -103],
        [43, -99],
        [20, -102],
        [-4, -105],
        [-23, -99],
      ],
      "#8da3b3",
    );
    ellipse(49, -101, 6, 6, "#e5e7d7");
    shape(
      [
        [-31, -94],
        [-37, -76],
        [-29, -62],
        [-24, -73],
        [-23, -89],
      ],
      "#d9d9cb",
    );
    shape(
      [
        [30, -92],
        [36, -76],
        [28, -64],
        [23, -74],
        [23, -88],
      ],
      "#d9d9cb",
    );
    c.strokeStyle = "#775d50";
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(-22, -83);
    c.quadraticCurveTo(-14, -77, -6, -82);
    c.moveTo(7, -82);
    c.quadraticCurveTo(15, -77, 23, -82);
    c.stroke();
    c.strokeStyle = "#aa7c61";
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(1, -81);
    c.lineTo(-4, -69);
    c.quadraticCurveTo(2, -64, 8, -70);
    c.stroke();
    shape(
      [
        [-21, -69],
        [-16, -55],
        [0, -44],
        [18, -55],
        [23, -69],
        [8, -64],
        [0, -66],
        [-8, -64],
      ],
      "#d8d7c7",
    );
    c.fillStyle = "#78604f";
    c.beginPath();
    c.ellipse(0, -61, 4, 5, 0, 0, Math.PI * 2);
    c.fill();
    c.save();
    c.translate(-42, -45);
    c.rotate(u.pose ? -0.2 : 0.08);
    c.strokeStyle = "#59667a";
    c.lineWidth = 5;
    c.beginPath();
    c.moveTo(0, 41);
    c.lineTo(0, -45);
    c.stroke();
    c.strokeStyle = "#d9e0c2";
    c.lineWidth = 6;
    c.beginPath();
    c.arc(0, -48, 10, 0.5, Math.PI * 1.75);
    c.stroke();
    c.restore();
    ellipse(-30, -29, 10, 7, "#d6b397");
    ellipse(28, -29, 10, 7, "#d6b397");
    ellipse(-2, -21, 30, 12, "#d9dccb");
    c.strokeStyle = "#a1b6b2";
    c.lineWidth = 1.5;
    c.beginPath();
    c.moveTo(-22, -24);
    c.quadraticCurveTo(-3, -17, 20, -24);
    c.stroke();
    c.fillStyle = "#c7e1ec";
    c.font = "bold 12px serif";
    c.fillText("Z", 35, -110 - Math.sin(time * 2) * 3);
    c.font = "bold 8px serif";
    c.fillText("z", 47, -119 - Math.sin(time * 2) * 3);
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

import type { GachaTheme } from "./gacha.ts";
export interface RevealStep {
  phase: string;
  title: string;
  caption: string;
  duration: number;
}
const step = (
  phase: string,
  title: string,
  caption: string,
  duration: number,
): RevealStep => ({ phase, title, caption, duration });
export function revealSequence(theme: GachaTheme): RevealStep[] {
  const altar = step(
    "altar",
    "石の声が、聞こえる。",
    "祈りを込めて、召喚中",
    1600,
  );
  const reveal = step(
    "reveal",
    "新たな信仰、ここに。",
    "召喚結果をまもなく表示",
    1500,
  );
  const gold = step("gold", "金の扉、開門。", "激レア以上の気配！", 1500);
  const rainbow = step("rainbow", "虹の祝福！", "超激レア以上 確定", 1700);
  const jackpot = step("jackpot", "大当たり！", "信仰、最高潮。", 1300);
  switch (theme) {
    case "normal":
      return [altar, reveal];
    case "red":
      return [
        step("red", "信仰反応、上昇！", "赤い光が祭壇を包む", 1500),
        altar,
        reveal,
      ];
    case "gold":
      return [
        gold,
        step("cutin", "岩の扉を、こじ開けろ！", "信仰解放", 1000),
        reveal,
      ];
    case "rainbow":
      return [gold, rainbow, reveal];
    case "777":
      return [
        step("spin", "運命の三つの岩。", "祈りを合わせろ！", 2200),
        jackpot,
        rainbow,
        reveal,
      ];
    case "revival":
      return [
        altar,
        step("silence", "……しーん。", "祈りは届かなかった……？", 1500),
        step("ukiki", "うきき！", "まだ、終わらない。復活！", 1100),
        gold,
        reveal,
      ];
    case "keito":
      return [
        step("dark", "", "静寂が、世界を包む。", 1000),
        step("ukiki", "うきき！", "この祈りに、岩が応える。", 1100),
        step("split", "封印、崩壊。", "岩の裂け目から、金色の光。", 1500),
        step("fullspin", "全回転", "伝説確定 / すべての祈りがひとつに", 2400),
        step("jackpot", "777", "伝説への扉、開放！", 1300),
        step("rainbow", "岩尊覚醒", "虹の光が満ちる。", 1400),
        step("reveal", "岩尊けいと", "動かざること、岩のごとく。", 1700),
        step(
          "legend",
          "伝説降臨 — 岩尊けいと",
          "じっと教に、伝説が刻まれた。",
          2200,
        ),
      ];
  }
}

import { UNITS, type Kind } from "./data.ts";
export function abilityDescription(kind: Kind): string {
  const ability = UNITS[kind].ability;
  if (!ability) return "なし：基本性能に特化";
  switch (ability.type) {
    case "heal":
      return `${UNITS[kind].interval}秒ごとに範囲${ability.range}内の傷ついた他の味方を最大3体、基礎${ability.value}HP回復（レベルで成長・攻撃と共通の間隔）`;
    case "slow":
      return `命中した敵の移動速度を${Math.round(ability.value * 100)}%にする（${ability.duration}秒・ボスは時間半減）`;
    case "stun":
      return `命中した敵の移動・攻撃を${ability.duration}秒停止（ボスは時間半減）`;
    case "push":
      return `命中した敵を${ability.value}押し戻す（ボスは距離半減）`;
    case "bossSlayer":
      return `ボスへの攻撃力${ability.value}倍`;
    case "armor":
      return `受けるダメージを${Math.round(ability.value * 100)}%に軽減`;
  }
}

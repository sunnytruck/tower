import { UNITS, type Kind, type Stats } from "./data";
import { abilityDescription } from "./allyAbilities";
import { CHARACTER_ASSETS, hasCharacterAsset } from "./characterAssets";
import "./roster.css";

export function CharacterStats({
  kind,
  stats,
  compact = false,
}: {
  kind: Kind;
  stats: Stats;
  compact?: boolean;
}) {
  const values = [
    ["HP", stats.hp.toLocaleString()],
    ["攻撃力", stats.damage.toLocaleString()],
    ["攻撃間隔", `${stats.interval}秒`],
    ["射程", String(stats.range)],
    ["移動速度", String(stats.speed)],
    ["出撃コスト", `${stats.cost.toLocaleString()}円`],
    ["再出撃", `${stats.cooldown}秒`],
    ["後退段階", String(stats.knockback)],
  ];
  return (
    <div
      className={`character-stats ${compact ? "compact-stats" : ""}`}
      aria-label={`${UNITS[kind].name}の戦闘性能`}
    >
      <dl>
        {values.map(([label, value]) => (
          <div
            key={label}
            title={
              label === "後退段階"
                ? "被弾でHPを失った際の後退段階。1は撃破時のみ、3なら残HP2/3・1/3で後退。"
                : undefined
            }
          >
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <div className="character-attack-type">
        {stats.area ? "範囲攻撃" : "単体攻撃"}
      </div>
      <p className="character-ability">
        <b>特殊能力</b>
        <span>{abilityDescription(kind)}</span>
      </p>
      {!compact && (
        <small className="knockback-note">
          後退段階1は撃破時のみ。複数段階のキャラはHPが減ると後退します。
        </small>
      )}
    </div>
  );
}
export function CharacterMaterialNote({ kind }: { kind: Kind }) {
  if (!hasCharacterAsset(kind)) return null;
  const quality = CHARACTER_ASSETS[kind].quality;
  return quality === "placeholder" ? (
    <small className="placeholder-label">岩石軍団の専用SVG仮素材</small>
  ) : quality === "draft-background" ? (
    <small className="placeholder-label">
      提供仮素材・背景などが残っています
    </small>
  ) : null;
}

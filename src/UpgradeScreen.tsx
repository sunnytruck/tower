import { useState } from "react";
import { ALLIES, UNITS, type Kind } from "./data";
import { CharacterImage } from "./CharacterImage";
import { GameIcon } from "./GameIcon";
import {
  MAX_LEVEL,
  levelOf,
  levelUpCost,
  unitStats,
  type Levels,
} from "./progression";
export function UpgradeScreen({
  xp,
  levels,
  onUpgrade,
  owned,
}: {
  xp: number;
  owned: readonly Kind[];
  levels: Levels;
  onUpgrade: (kind: Kind) => boolean;
}) {
  const [selected, setSelected] = useState<Kind>("novice");
  const [effect, setEffect] = useState<{
    serial: number;
    level: number;
    hp: number;
    damage: number;
  } | null>(null);
  const level = levelOf(levels, selected),
    cost = levelUpCost(level);
  const current = unitStats(selected, levels),
    next = unitStats(selected, {
      ...levels,
      [selected]: Math.min(MAX_LEVEL, level + 1),
    });
  const canUpgrade = owned.includes(selected) && cost !== null && xp >= cost;
  const strengthen = () => {
    if (onUpgrade(selected))
      setEffect((e) => ({
        serial: (e?.serial ?? 0) + 1,
        level: level + 1,
        hp: next.hp - current.hp,
        damage: next.damage - current.damage,
      }));
  };
  return (
    <section className="upgrade-screen" aria-label="キャラクター強化">
      <div className="upgrade-heading">
        <div>
          <span className="eyebrow">TRAINING / THE STONE DOJO</span>
          <h1>
            信者の修練<span>XPで、信仰を力に。</span>
          </h1>
        </div>
        <div className="upgrade-wallet">
          <GameIcon name="star" />
          <div>
            <small>所持XP</small>
            <strong>{xp.toLocaleString()}</strong>
          </div>
        </div>
      </div>
      <div className="upgrade-layout">
        <div className={`upgrade-art ${effect ? "has-upgrade" : ""}`}>
          <div className="upgrade-halo" />
          <CharacterImage
            key={`${selected}-${effect?.serial ?? 0}`}
            kind={selected}
            hero
          />
          {effect && (
            <div
              key={effect.serial}
              className="upgrade-gain"
              aria-hidden="true"
            >
              LEVEL UP!
              <span>
                HP +{effect.hp} / 攻撃 +{effect.damage}
              </span>
            </div>
          )}
          <span className="upgrade-art-caption">{UNITS[selected].role}</span>
        </div>
        <div className="upgrade-panel">
          <span className="ribbon">修練中の信者</span>
          <h2>{current.name}</h2>
          <div className="upgrade-level">
            Lv.<strong>{level}</strong>
            <span>/ {MAX_LEVEL}</span>
            {cost === null && <b>MAX</b>}
          </div>
          <div className="upgrade-level-track">
            <i style={{ width: `${(level / MAX_LEVEL) * 100}%` }} />
          </div>
          <div className="upgrade-compare">
            <div className="compare-header">
              <span>能力</span>
              <span>現在</span>
              <span>{cost === null ? "上限到達" : `Lv.${level + 1}`}</span>
            </div>
            {[
              { label: "HP", before: current.hp, after: next.hp },
              { label: "攻撃力", before: current.damage, after: next.damage },
            ].map((row) => (
              <div className="compare-row" key={row.label}>
                <b>{row.label}</b>
                <span>{row.before.toLocaleString()}</span>
                <strong>
                  {cost === null ? "MAX" : `→ ${row.after.toLocaleString()}`}
                </strong>
              </div>
            ))}
          </div>
          <p className="upgrade-rule">
            HP・攻撃力は1レベルごとに基礎値の10%上昇。出撃コスト・射程・攻撃間隔は変わりません。
          </p>
          <div className="upgrade-price">
            <span>必要XP</span>
            <strong>{cost === null ? "—" : cost.toLocaleString()}</strong>
          </div>
          <button
            className="primary upgrade-action"
            onClick={strengthen}
            disabled={!canUpgrade}
          >
            {cost === null ? "レベル上限" : `${cost.toLocaleString()} XPで強化`}
          </button>
          <p className="upgrade-feedback" role="status">
            {cost === null
              ? "これ以上の強化はできません。"
              : xp < cost
                ? `XP不足：あと ${(cost - xp).toLocaleString()} XP。戦闘に勝利して集めよう。`
                : "強化した能力は次の戦闘から反映されます。"}
          </p>
          {effect && (
            <p className="upgrade-success" role="status">
              Lv.{effect.level}に強化！ HP +{effect.hp}・攻撃力 +{effect.damage}
            </p>
          )}
        </div>
      </div>
      <nav className="upgrade-roster" aria-label="所持キャラクターを選択">
        {ALLIES.filter((kind) => owned.includes(kind)).map((kind) => (
          <button
            key={kind}
            className={selected === kind ? "selected" : ""}
            aria-pressed={selected === kind}
            onClick={() => {
              setSelected(kind);
              setEffect(null);
            }}
          >
            <CharacterImage kind={kind} />
            <span>
              <b>{UNITS[kind].name}</b>
              <small>
                Lv.{levelOf(levels, kind)} / {MAX_LEVEL}
              </small>
            </span>
          </button>
        ))}
      </nav>
    </section>
  );
}

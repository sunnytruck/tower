import { UNITS, type Kind } from "./data";
import type { Formation } from "./formation";
import { CharacterImage } from "./CharacterImage";
import { CharacterMaterialNote, CharacterStats } from "./CharacterStats";
import { levelOf, unitStats, type Levels } from "./progression";
import { characterEntry, RARITIES } from "./gacha";
import { RosterTools, useRosterFilter } from "./RosterTools";
export function FormationPicker({
  owned,
  formation,
  levels,
  selected,
  onChoose,
}: {
  owned: readonly Kind[];
  formation: Formation;
  levels: Levels;
  selected: number;
  onChoose: (kind: Kind | null) => void;
}) {
  const filter = useRosterFilter(owned);
  return (
    <section className="character-picker">
      <div className="deploy-title">
        <h2>枠{selected + 1}に配置する仲間</h2>
        <button className="pause" onClick={() => onChoose(null)}>
          この枠を外す
        </button>
      </div>
      <RosterTools filter={filter} context="編成" total={owned.length} />
      <div className="roster-grid expanded-roster-grid">
        {filter.visible.map((kind) => {
          const d = unitStats(kind, levels),
            pos = formation.indexOf(kind),
            rank = characterEntry(kind).rarity;
          return (
            <button
              key={kind}
              className={`formation-candidate rarity-${rank}`}
              onClick={() => onChoose(kind)}
              aria-label={`${d.name}を枠${selected + 1}に配置`}
            >
              <div className="formation-candidate-art">
                <CharacterImage kind={kind} />
                <CharacterMaterialNote kind={kind} />
              </div>
              <div className="formation-candidate-info">
                <span className="rarity-label">{RARITIES[rank]}</span>
                <h3>
                  {d.name} <small>Lv.{levelOf(levels, kind)}</small>
                </h3>
                <span>{d.role}</span>
                <CharacterStats kind={kind} stats={d} compact />
                <b>
                  {pos >= 0 ? `枠${pos + 1}に編成中 → 移動` : "この枠に配置"}
                </b>
              </div>
            </button>
          );
        })}
      </div>
      {!filter.visible.length && (
        <p className="roster-empty" role="status">
          条件に合う所持キャラはいません。絞り込みを解除して探してください。
        </p>
      )}
    </section>
  );
}

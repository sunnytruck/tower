import { useState } from "react";
import { AREAS, STAGES, stageById } from "./stages";
import { UNITS } from "./data";
import { GameIcon } from "./GameIcon";
import type { Progress } from "./progressStore";
import "./stages.css";
export function StageSelectScreen({
  progress,
  selectedId,
  canStart,
  onStart,
  onFormation,
}: {
  progress: Progress;
  selectedId: string;
  canStart: boolean;
  onStart: (id: string) => void;
  onFormation: () => void;
}) {
  const [area, setArea] = useState(stageById(selectedId)?.area ?? 0);
  const [selected, setSelected] = useState(selectedId);
  const current =
    STAGES.find((s) => s.id === selected && s.area === area) ??
    STAGES[area * 5];
  const state = progress.campaign[current.id];
  const enemyCounts = [...new Set(current.waves.map((w) => w.kind))].map(
    (kind) => ({
      kind,
      count: current.waves.filter((w) => w.kind === kind).length,
    }),
  );
  return (
    <section className="stage-select" aria-label="ステージ選択">
      <div className="campaign-heading">
        <div>
          <span className="eyebrow">JOURNEY / 信仰の旅路</span>
          <h1>祈りの先へ。</h1>
        </div>
        <span>
          最高到達 <b>{String(progress.highestStage).padStart(2, "0")}</b> / 15{" "}
          <small>
            クリア{" "}
            {STAGES.filter((s) => progress.campaign[s.id].clears > 0).length} /
            15
          </small>
        </span>
      </div>
      <nav className="area-tabs" aria-label="エリア選択">
        {AREAS.map((item, i) => (
          <button
            key={item.name}
            aria-pressed={area === i}
            onClick={() => {
              setArea(i);
              setSelected(STAGES[i * 5].id);
            }}
          >
            <small>AREA 0{i + 1}</small>
            <b>{item.name}</b>
            <span>
              {
                STAGES.filter(
                  (s) => s.area === i && progress.campaign[s.id].clears > 0,
                ).length
              }{" "}
              / 5 CLEAR
            </span>
          </button>
        ))}
      </nav>
      <div className={`campaign-map area-${area}`}>
        <div className="map-sun" />
        <div className="map-range range-back" />
        <div className="map-range range-front" />
        <div className="map-title">
          <small>AREA 0{area + 1}</small>
          <h2>{AREAS[area].name}</h2>
          <p>{AREAS[area].subtitle}</p>
        </div>
        <div className="stage-path" aria-label="エリア内の5ステージ">
          {STAGES.filter((s) => s.area === area).map((stage) => {
            const status = progress.campaign[stage.id];
            return (
              <button
                key={stage.id}
                className={`stage-node ${selected === stage.id ? "selected" : ""} ${!status.unlocked ? "locked" : status.clears ? "cleared" : "open"} ${stage.boss ? "boss-node" : ""}`}
                aria-pressed={selected === stage.id}
                aria-label={`${stage.number} ${stage.name} ${!status.unlocked ? "未解放" : status.clears ? "クリア済み" : "未クリア"}`}
                onClick={() => setSelected(stage.id)}
              >
                <span className="node-number">
                  {!status.unlocked ? (
                    <GameIcon name="lock" />
                  ) : stage.boss ? (
                    "♜"
                  ) : (
                    String(stage.number).padStart(2, "0")
                  )}
                </span>
                <span className="node-status">
                  {!status.unlocked
                    ? "未解放"
                    : status.clears
                      ? "✓ CLEAR"
                      : "挑戦可能"}
                </span>
                <b>{stage.name}</b>
                <small>
                  {stage.difficulty} · 推奨Lv.{stage.recommendedLevel}
                </small>
                <small>初回 ◆{stage.firstClearStones + stage.bossBonus}</small>
              </button>
            );
          })}
        </div>
      </div>
      <div className="stage-briefing">
        <div className="briefing-main">
          <span className="eyebrow">
            STAGE {String(current.number).padStart(2, "0")} /{" "}
            {state.clears ? `${state.clears}回クリア` : "未クリア"}
          </span>
          <h2>
            {current.name}
            {current.boss && <small>BOSS</small>}
          </h2>
          <p>{current.subtitle}</p>
          <span className="stage-level">
            {current.difficulty} · 推奨Lv.{current.recommendedLevel} / 敵拠点HP{" "}
            {current.enemyBaseHP.toLocaleString()}
          </span>
          <div className="stage-enemies" aria-label="出現する敵">
            {enemyCounts.map(({ kind, count }) => (
              <span key={kind} title={UNITS[kind].role}>
                {UNITS[kind].name} ×{count}
              </span>
            ))}
          </div>
          <details className="stage-wave-details">
            <summary>出現時刻を確認（全{current.waves.length}体）</summary>
            <ol>
              {current.waves.map((wave, i) => (
                <li key={i}>
                  {wave.at.toFixed(1)}秒 · {UNITS[wave.kind].name}
                </li>
              ))}
            </ol>
          </details>
        </div>
        <div className="briefing-rewards">
          <span>クリア報酬</span>
          <strong>
            ◆{" "}
            {state.firstRewardClaimed
              ? current.repeatStones
              : current.firstClearStones + current.bossBonus}
            <small>
              信仰石 / {state.firstRewardClaimed ? "周回報酬" : "初回報酬"}
            </small>
          </strong>
          <p>
            {current.boss ? "初回1,500＋ボス追加1,500個" : "初回1,500個"} /
            周回150個
          </p>
          <b>＋{current.victoryXP.toLocaleString()} XP</b>
          <button
            className="primary"
            disabled={!state.unlocked || !canStart}
            onClick={() => onStart(current.id)}
          >
            {!state.unlocked
              ? "前のステージをクリアで解放"
              : !canStart
                ? "1体以上編成してください"
                : "このステージへ出陣 ▶"}
          </button>
          <button className="text-button" onClick={onFormation}>
            編成・レベルを確認 →
          </button>
        </div>
      </div>
      <p className="campaign-save-note">
        クリアで次のステージを解放。初回報酬はステージごとに1度、周回報酬は毎回獲得できます。進行は自動保存。
      </p>
    </section>
  );
}

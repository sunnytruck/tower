import React, { useEffect, useRef, useState } from "react";
import type { Formation } from "./formation";
import { CharacterImage } from "./CharacterImage";
import { GameIcon } from "./GameIcon";
import { Battle } from "./engine";
import { UNITS, STAGE, type Kind } from "./data";
import { draw } from "./render";
import { levelOf, type Levels } from "./progression";
import "./style.css";
export function BattleScreen({
  lineup,
  onHome,
  levels,
  xp,
  saveWarning,
  onVictory,
  owned,
  victoryRewards,
}: {
  lineup: Formation;
  onHome: () => void;
  levels: Levels;
  owned: readonly Kind[];
  victoryRewards: Record<
    string,
    { xp: number; stones: number; firstClear: boolean }
  >;
  xp: number;
  saveWarning: string;
  onVictory: (id: string) => void;
}) {
  const battle = useRef<Battle | null>(null);
  if (!battle.current) battle.current = new Battle(lineup, levels, owned);
  const settled = useRef(new WeakSet<Battle>());
  const canvas = useRef<HTMLCanvasElement>(null);
  const [, refresh] = useState(0);
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0,
      last = 0,
      ui = 0;
    const tick = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      battle.current!.update(dt);
      if (
        battle.current!.status === "win" &&
        !settled.current.has(battle.current!)
      ) {
        settled.current.add(battle.current!);
        onVictory(battle.current!.id);
      }
      draw(canvas.current!.getContext("2d")!, battle.current!, motion.matches);
      if (now - ui > 90) {
        refresh((v) => v + 1);
        ui = now;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    const resize = new ResizeObserver(() => {
      const element = canvas.current!;
      const bounds = element.getBoundingClientRect();
      if (bounds.width && bounds.height)
        element.height = Math.max(
          300,
          Math.round((1400 * bounds.height) / bounds.width),
        );
    });
    resize.observe(canvas.current!);
    const visibility = () => {
      if (document.hidden && battle.current!.status === "playing")
        battle.current!.toggle();
    };
    document.addEventListener("visibilitychange", visibility);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [onVictory]);
  const b = battle.current!;
  const active = b.status === "playing";
  const nextWave = STAGE.waves[b.wave];
  const waveAdvice = !nextWave
    ? "敵の砦を破壊しよう"
    : nextWave.kind === "sniper"
      ? "遠距離支援：壁役で攻撃を受けよう"
      : nextWave.kind === "bomber"
        ? "範囲攻撃：遠距離から撃破しよう"
        : nextWave.kind === "heavy"
          ? "高耐久：後衛の火力で突破しよう"
          : nextWave.kind === "runner"
            ? "高速接近：壁役の出撃資金を確保"
            : "前衛：壁役と後衛を組み合わせよう";
  const retry = () => {
    battle.current = new Battle(b.lineup, b.levels, b.owned);
    battle.current!.toggle();
    refresh((v) => v + 1);
  };
  return (
    <main className="battle-screen">
      <header className="battle-hud">
        <div className="hud-stage">
          <GameIcon name="rock" />
          <div>
            <small>STAGE 01</small>
            <b>{STAGE.name}</b>
          </div>
        </div>
        <div className="hud-vitals">
          <Base label="総本山" hp={b.leftHP} />
          <div className="timer">
            <small>経過時間</small>
            <strong>
              {Math.floor(b.time / 60)
                .toString()
                .padStart(2, "0")}
              :
              {Math.floor(b.time % 60)
                .toString()
                .padStart(2, "0")}
            </strong>
          </div>
          <Base label="敵の砦" hp={b.rightHP} enemy />
        </div>
        <div className="funds">
          <GameIcon name="star" />
          <div>
            <small>
              所持金 <span>+{STAGE.income}/秒</span>
            </small>
            <strong>
              {Math.floor(b.money).toLocaleString()}
              <i>円</i>
            </strong>
            <span className="fund-limit">
              上限 {STAGE.maxMoney.toLocaleString()}
            </span>
          </div>
        </div>
        <div className="battle-actions">
          <button
            className="home-return"
            onClick={onHome}
            aria-label={
              b.status === "playing" || b.status === "paused"
                ? "撤退してホーム"
                : "ホームへ"
            }
            title="ホームへ戻ると現在の戦闘は終了します"
          >
            <GameIcon name="home" />
            <span>ホーム</span>
          </button>
          <button
            className="pause"
            onClick={() => {
              b.toggle();
              refresh((v) => v + 1);
            }}
            disabled={b.status === "win" || b.status === "lose"}
            aria-label={
              active ? "Ⅱ 一時停止" : b.status === "ready" ? "▷ 開始" : "▷ 再開"
            }
          >
            <b>{active ? "Ⅱ" : "▶"}</b>
            <span>
              {active ? "一時停止" : b.status === "ready" ? "開始" : "再開"}
            </span>
          </button>
        </div>
      </header>
      <section className="battlefield" aria-label="戦場">
        {saveWarning && (
          <p className="battle-save-warning" role="alert">
            {saveWarning}
          </p>
        )}
        <div
          className="wave-hint"
          aria-label={`次の敵出現：${waveAdvice}`}
          title={waveAdvice}
        >
          <span className="wave-pip" />
          <strong>
            {nextWave
              ? `${UNITS[nextWave.kind].name} / ${Math.max(0, Math.ceil(nextWave.at - b.time))}秒後`
              : "敵の増援なし"}
          </strong>
          <small>
            敵軍 {b.wave}/{STAGE.waves.length}
          </small>
        </div>
        <div
          className="world-viewport"
          tabIndex={0}
          aria-label="戦場。スマートフォンでは左右にスワイプできます"
        >
          <canvas
            className="world"
            ref={canvas}
            width={1400}
            height={500}
            aria-label="味方は左から、敵は右から進軍します"
          />
        </div>
        {b.status !== "playing" && (
          <div className="overlay">
            <div className="dialog">
              <span className="eyebrow">
                {b.status === "win"
                  ? "STAGE CLEAR"
                  : b.status === "lose"
                    ? "DEFEAT"
                    : "THE STONE FRONT"}
              </span>
              <h2>
                {b.status === "ready"
                  ? "その信仰で、道を拓け。"
                  : b.status === "paused"
                    ? "しばし、静寂。"
                    : b.status === "win"
                      ? "岩の聖地、奪還。"
                      : "総本山、陥落。"}
              </h2>
              <p>
                {b.status === "ready"
                  ? "壁役で後衛を守ろう。大型だけの軍勢では突破できない。"
                  : b.status === "paused"
                    ? "戦闘と資金の増加は停止しています。"
                    : b.status === "win"
                      ? "じっと教の新たな伝説が、ここに。"
                      : "壁役で守り、遠距離と範囲攻撃で押し返そう。"}
              </p>
              {b.status === "win" && (
                <div className="victory-xp" role="status">
                  <GameIcon name="star" />
                  <strong>+{STAGE.victoryXP} XP 獲得</strong>
                  <strong className="victory-stones">
                    ◆ +{victoryRewards[b.id]?.stones ?? 0} 信仰石
                    {victoryRewards[b.id]?.firstClear
                      ? "（初回クリア）"
                      : "（周回報酬）"}
                  </strong>
                  <small>
                    所持XP {xp.toLocaleString()} / ホームから強化できます
                  </small>
                </div>
              )}
              <button
                className="primary"
                onClick={() => {
                  if (b.status === "win" || b.status === "lose") retry();
                  else {
                    b.toggle();
                    refresh((v) => v + 1);
                  }
                }}
              >
                {b.status === "ready"
                  ? "出陣する →"
                  : b.status === "paused"
                    ? "戦闘に戻る →"
                    : "もう一度挑む →"}
              </button>
            </div>
          </div>
        )}
      </section>
      <section className="deployment">
        <div className="deploy-title">
          <h2>
            <GameIcon name="formation" />
            信者を召集 <small>10 SLOTS</small>
          </h2>
          <span>
            信者をタップして出撃 <i> / 戦場は左右にスワイプ</i>
          </span>
        </div>
        <div className="cards battle-deck">
          {b.lineup.map((kind, i) => {
            if (!kind)
              return (
                <div
                  key={i}
                  className="empty-deploy"
                  aria-label={`出撃枠${i + 1} 未編成`}
                >
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <small>未編成</small>
                </div>
              );
            const d = b.stats[kind],
              cd = b.cooldowns[kind] ?? 0;
            return (
              <button
                key={i}
                className={`unit-card ${!active ? "idle" : cd > 0 ? "cooling" : b.money < d.cost ? "poor" : "available"}`}
                aria-label={`${d.name}、出撃コスト${d.cost}円、${!active ? "戦闘停止中" : cd > 0 ? `再出撃まで${cd.toFixed(1)}秒` : b.money < d.cost ? `あと${Math.ceil(d.cost - b.money)}円必要` : "出撃可能"}`}
                title={`${d.name} Lv.${levelOf(b.levels, kind)} / HP ${d.hp} / 攻撃力 ${d.damage}`}
                disabled={!active || b.money < d.cost || cd > 0}
                onClick={() => {
                  b.deploy(kind);
                  refresh((v) => v + 1);
                }}
                style={{ "--accent": d.color } as React.CSSProperties}
              >
                <span className="slot-number">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3>{d.name}</h3>
                <div className="slot-face">
                  <CharacterImage kind={kind} />
                  {cd > 0 && (
                    <>
                      <div
                        className="cooldown-curtain"
                        style={{ height: `${(cd / d.cooldown) * 100}%` }}
                      />
                      <span className="cooldown-count">
                        {cd.toFixed(1)}
                        <small>秒</small>
                      </span>
                    </>
                  )}
                </div>
                <strong className="slot-cost">¥ {d.cost}</strong>
                <small className="slot-status">
                  {!active
                    ? b.status === "ready"
                      ? "開始待ち"
                      : "停止中"
                    : cd > 0
                      ? "再出撃待ち"
                      : b.money < d.cost
                        ? `あと ¥${Math.ceil(d.cost - b.money)}`
                        : "● 出撃可能"}
                </small>
                <div className="cooldown">
                  <i style={{ width: `${(1 - cd / d.cooldown) * 100}%` }} />
                </div>
              </button>
            );
          })}
        </div>
      </section>
      <footer>
        <span>壁役で守り、後衛で突破。</span>
        <button onClick={retry}>↻ リトライ</button>
        <span className="placeholder">じっと教大戦争</span>
      </footer>
    </main>
  );
}
function Base({
  label,
  hp,
  enemy = false,
}: {
  label: string;
  hp: number;
  enemy?: boolean;
}) {
  return (
    <div className={`base ${enemy ? "enemy" : ""}`}>
      <div>
        <b>{label}</b>
        <span>
          {hp.toLocaleString()} <small>/ {STAGE.baseHP}</small>
        </span>
      </div>
      <div className="meter">
        <i style={{ width: `${(hp / STAGE.baseHP) * 100}%` }} />
      </div>
    </div>
  );
}

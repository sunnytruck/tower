import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Battle } from "./engine";
import { ALLIES, UNITS, STAGE } from "./data";
import { draw, figure } from "./render";
import "./style.css";
function Portrait({ kind }: { kind: (typeof ALLIES)[number] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!.getContext("2d")!;
    c.scale(1.3, 1.3);
    figure(
      c,
      {
        id: 0,
        kind,
        side: 1,
        x: 48,
        hp: UNITS[kind].hp,
        attack: 0,
        pose: 0,
        flash: 0,
        dead: 0,
        recoil: 0,
      },
      0,
      112,
    );
  }, [kind]);
  return <canvas ref={ref} width={126} height={150} aria-hidden="true" />;
}
function App() {
  const battle = useRef(new Battle());
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
      battle.current.update(dt);
      draw(canvas.current!.getContext("2d")!, battle.current, motion.matches);
      if (now - ui > 90) {
        refresh((v) => v + 1);
        ui = now;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    const visibility = () => {
      if (document.hidden && battle.current.status === "playing")
        battle.current.toggle();
    };
    document.addEventListener("visibilitychange", visibility);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  const b = battle.current;
  const active = b.status === "playing";
  const nextWave = STAGE.waves[b.wave];
  const retry = () => {
    battle.current = new Battle();
    battle.current.toggle();
    refresh((v) => v + 1);
  };
  return (
    <main>
      <header>
        <a className="brand" href="./">
          <span className="seal">岩</span>
          <div>
            じっと教大戦争<small>JITTO : THE STONE FRONT</small>
          </div>
        </a>
        <span className="edition">TACTICAL DEFENSE / 01</span>
        <button
          className="pause"
          onClick={() => {
            b.toggle();
            refresh((v) => v + 1);
          }}
          disabled={b.status === "win" || b.status === "lose"}
        >
          {active ? "Ⅱ 一時停止" : b.status === "ready" ? "▷ 開始" : "▷ 再開"}
        </button>
      </header>
      <section className="stage-heading">
        <div>
          <span className="eyebrow">CHAPTER 01 ━ THE SACRED GROUND</span>
          <h1>
            {STAGE.name}
            <span>静寂を破る者</span>
          </h1>
        </div>
        <div className="wave-hint" aria-label="次の敵出現">
          <small>次の襲来</small>
          <strong>
            {nextWave
              ? `${UNITS[nextWave.kind].name} / ${Math.max(0, Math.ceil(nextWave.at - b.time))}秒後`
              : "敵の増援なし"}
          </strong>
          <span>
            {nextWave
              ? nextWave.kind === "sniper"
                ? "遠距離支援：壁役で攻撃を受けよう"
                : nextWave.kind === "bomber"
                  ? "範囲攻撃：遠距離から撃破しよう"
                  : nextWave.kind === "heavy"
                    ? "高耐久：後衛の火力で突破しよう"
                    : nextWave.kind === "runner"
                      ? "高速接近：壁役の出撃資金を確保"
                      : "前衛：壁役と後衛を組み合わせよう"
              : "敵の砦を破壊しよう"}
          </span>
        </div>
        <div className="funds">
          <small>
            所持金 <span>+{STAGE.income} / 秒</span>
          </small>
          <strong>
            {Math.floor(b.money).toLocaleString()}
            <i>円</i>
          </strong>
          <div className="meter">
            <i style={{ width: `${(b.money / STAGE.maxMoney) * 100}%` }} />
          </div>
        </div>
      </section>
      <section className="battlefield" aria-label="戦場">
        <div className="battle-info">
          <Base label="じっと教 総本山" hp={b.leftHP} />
          <div className="timer">
            STAGE 01
            <strong>
              {Math.floor(b.time / 60)
                .toString()
                .padStart(2, "0")}
              :
              {Math.floor(b.time % 60)
                .toString()
                .padStart(2, "0")}
            </strong>
            <small>
              敵軍 {b.wave} / {STAGE.waves.length}
            </small>
          </div>
          <Base label="敵軍の砦" hp={b.rightHP} enemy />
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
            height={380}
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
            信者を召集 <small>DEPLOY UNITS</small>
          </h2>
          <span>自動戦闘 / 戦場は左右にスワイプ</span>
        </div>
        <div className="cards">
          {ALLIES.map((kind, i) => {
            const d = UNITS[kind],
              cd = b.cooldowns[kind] ?? 0;
            return (
              <button
                key={kind}
                className={`unit-card ${active && b.money >= d.cost && cd <= 0 ? "available" : "unavailable"}`}
                aria-label={`${d.name}、出撃コスト${d.cost}円、${!active ? "戦闘停止中" : cd > 0 ? `再出撃まで${cd.toFixed(1)}秒` : b.money < d.cost ? `あと${Math.ceil(d.cost - b.money)}円必要` : "出撃可能"}`}
                disabled={!active || b.money < d.cost || cd > 0}
                onClick={() => {
                  b.deploy(kind);
                  refresh((v) => v + 1);
                }}
                style={{ "--accent": d.color } as React.CSSProperties}
              >
                <div className="card-top">
                  <span>
                    0{i + 1} / {d.role}
                  </span>
                  <b>{d.area ? "範囲" : "単体"}</b>
                </div>
                <Portrait kind={kind} />
                <div className="unit-text">
                  <h3>{d.name}</h3>
                  <strong>
                    <span className="cost-label">出撃</span> ¥ {d.cost}
                  </strong>
                  <span className="cooldown-label">
                    {cd > 0
                      ? `再出撃 ${cd.toFixed(1)} / ${d.cooldown}秒`
                      : `再出撃間隔 ${d.cooldown}秒`}
                  </span>
                  <small>
                    {!active
                      ? b.status === "ready"
                        ? "開始待ち"
                        : "戦闘停止中"
                      : b.money < d.cost
                        ? `あと ¥${Math.ceil(d.cost - b.money)}`
                        : cd > 0
                          ? "再出撃待ち"
                          : "● 出撃可能"}
                  </small>
                </div>
                <div className="cooldown">
                  <i style={{ width: `${(1 - cd / d.cooldown) * 100}%` }} />
                </div>
              </button>
            );
          })}
        </div>
      </section>
      <footer>
        <span>
          <b>遊び方</b> 壁役を前線へ。後衛を守って敵拠点HPを0にしよう。
        </span>
        <button onClick={retry}>↻ リトライ</button>
        <span className="placeholder">
          架空の仮キャラクター / 顔素材は差し替え可能
        </span>
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
createRoot(document.getElementById("root")!).render(<App />);

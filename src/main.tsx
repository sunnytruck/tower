import { useCallback, useState } from "react";
import { createRoot } from "react-dom/client";
import { BattleScreen } from "./BattleScreen";
import { CharacterImage } from "./CharacterImage";
import { GameIcon, SacredLandscape } from "./GameIcon";
import { ALLIES, UNITS, STAGE, type Kind } from "./data";
import { initialFormation, assignSlot, type Formation } from "./formation";
import "./style.css";
import { useProgress } from "./useProgress";
import { awardVictory, upgradeCharacter } from "./progressStore";
import { unitStats, levelOf, type Levels } from "./progression";
import { UpgradeScreen } from "./UpgradeScreen";

type Page = "home" | "formation" | "battle" | "upgrade";
function App() {
  const [page, setPage] = useState<Page>("home");
  const { progress, update, warning } = useProgress();
  const formation = progress.formation;
  const [battleLevels, setBattleLevels] = useState<Levels>(() => ({
    ...progress.levels,
  }));
  const onVictory = useCallback(
    (id: string) => {
      update((data) => awardVictory(data, id, "win", STAGE.victoryXP));
    },
    [update],
  );
  const [selected, setSelected] = useState(0);
  const [battleLineup, setBattleLineup] = useState<Formation>(initialFormation);
  const [notice, setNotice] = useState("");
  const count = formation.filter(Boolean).length;
  function start() {
    if (!count) return;
    setBattleLineup([...formation]);
    setBattleLevels({ ...progress.levels });
    setPage("battle");
  }
  function choose(kind: Kind | null) {
    update((data) => ({
      ...data,
      formation: assignSlot(data.formation, selected, kind),
    }));
    setNotice(
      `枠${selected + 1}を${kind ? UNITS[kind].name : "未編成"}に変更しました`,
    );
  }
  if (page === "battle")
    return (
      <BattleScreen
        lineup={battleLineup}
        levels={battleLevels}
        xp={progress.xp}
        saveWarning={warning}
        onVictory={onVictory}
        onHome={() => setPage("home")}
      />
    );
  return (
    <main
      className={`hub ${page === "home" ? "home-page" : page === "upgrade" ? "upgrade-page" : "formation-page"}`}
    >
      <header>
        <a
          className="brand"
          href="./"
          onClick={(e) => {
            e.preventDefault();
            setPage("home");
          }}
        >
          <span className="seal">岩</span>
          <div>
            じっと教大戦争<small>JITTO : THE STONE FRONT</small>
          </div>
        </a>
        <div className="player-hud" aria-label="プレイヤー情報と今後の通貨表示">
          <span className="player-badge">
            <GameIcon name="rock" />
            <span>
              旅の信者<small>GUEST</small>
            </span>
          </span>
          <span className="resource-chip xp-chip" title="勝利で獲得したXP">
            <GameIcon name="star" />
            <span>
              XP <b>{progress.xp.toLocaleString()}</b>
            </span>
          </span>
          <span className="resource-chip" title="ガチャ通貨はPhase 3で実装予定">
            <GameIcon name="gacha" />
            <span>
              信仰石 <b>—</b>
              <small>準備中</small>
            </span>
          </span>
        </div>
        {page !== "home" && (
          <button className="pause" onClick={() => setPage("home")}>
            ホームへ
          </button>
        )}
      </header>
      {warning && (
        <p className="save-notice" role="alert">
          {warning}
        </p>
      )}
      {page === "upgrade" ? (
        <UpgradeScreen
          xp={progress.xp}
          levels={progress.levels}
          onUpgrade={(kind) => update((data) => upgradeCharacter(data, kind))}
        />
      ) : page === "home" ? (
        <>
          <section className="home-hero">
            <SacredLandscape />
            <div className="home-title">
              <span className="ribbon">じっと教 総本山</span>
              <h1>
                じっと、
                <br />
                世界を動かせ。
              </h1>
              <p>小さな信仰。でっかい一撃。</p>
              <button
                className="primary embark"
                disabled={!count}
                onClick={start}
              >
                <GameIcon name="battle" />
                岩の聖地へ出陣 <span>▶</span>
              </button>
              {!count && (
                <p className="empty-warning" role="status">
                  編成で1体以上を選んでください
                </p>
              )}
            </div>
            <div className="hero-character">
              <div className="hero-aura" />
              <div className="hero-pedestal" />
              <CharacterImage kind="keito" hero />
              <div className="hero-nameplate">
                <small>じっと教の大いなる岩</small>
                <strong>岩尊けいと</strong>
                <span>「動かざること、岩のごとく。」</span>
              </div>
            </div>
            <span className="scene-stamp">
              岩の聖地
              <br />
              <b>01</b>
            </span>
          </section>
          <nav className="home-menu" aria-label="メインメニュー">
            <button className="menu-battle" onClick={start} disabled={!count}>
              <span className="menu-medallion">
                <GameIcon name="battle" />
              </span>
              <b>戦闘</b>
              <small>いざ、出陣！</small>
            </button>
            <button
              className="menu-formation"
              onClick={() => setPage("formation")}
            >
              <span className="menu-medallion">
                <GameIcon name="formation" />
              </span>
              <b>編成</b>
              <small>信者を集めよう</small>
            </button>
            <button className="menu-upgrade" onClick={() => setPage("upgrade")}>
              <span className="menu-medallion">
                <GameIcon name="upgrade" />
              </span>
              <b>強化</b>
              <small>XPでレベルアップ</small>
            </button>
            {[
              { name: "ガチャ", icon: "gacha" },
              { name: "図鑑", icon: "book" },
            ].map((item) => (
              <button key={item.name} className={`menu-${item.icon}`} disabled>
                <span className="menu-medallion">
                  <GameIcon name={item.icon} />
                </span>
                <b>{item.name}</b>
                <small>
                  <GameIcon name="lock" />
                  準備中
                </small>
              </button>
            ))}
          </nav>
          <section className="home-lineup">
            <div className="deploy-title">
              <h2>
                <GameIcon name="formation" />
                出陣の仲間 <small>{count} / 10</small>
              </h2>
              <button
                className="text-button"
                onClick={() => setPage("formation")}
              >
                編成を変更 →
              </button>
            </div>
            <div className="lineup-summary">
              {formation.map((kind, i) => (
                <div key={i} title={kind ? UNITS[kind].name : "未編成"}>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  {kind ? <CharacterImage kind={kind} /> : <i>＋</i>}
                  <b>{kind ? UNITS[kind].name : "未編成"}</b>
                </div>
              ))}
            </div>
            <p className="session-note">
              XP・キャラレベル・編成は自動保存されます。戦闘勝利で
              {STAGE.victoryXP}XP獲得。
            </p>
          </section>
        </>
      ) : (
        <>
          <section className="formation-heading">
            <span className="eyebrow">FORMATION / TEN SLOTS</span>
            <h1>
              出陣の布陣<span>{count} / 10 枠</span>
            </h1>
            <p>
              枠を選んで、下の信者を配置。同じ信者を選ぶとその枠へ移動します。
            </p>
          </section>
          <section className="formation-slots" aria-label="10枠の編成">
            {formation.map((kind, i) => (
              <button
                key={i}
                className={`formation-slot ${selected === i ? "selected" : ""}`}
                aria-pressed={selected === i}
                aria-label={`編成枠${i + 1} ${kind ? UNITS[kind].name : "未編成"}`}
                onClick={() => {
                  setSelected(i);
                  setNotice("");
                }}
              >
                <span>SLOT {String(i + 1).padStart(2, "0")}</span>
                {kind ? (
                  <>
                    <CharacterImage kind={kind} />
                    <b>{UNITS[kind].name}</b>
                    <small>
                      ¥ {UNITS[kind].cost} / {UNITS[kind].role}
                    </small>
                  </>
                ) : (
                  <>
                    <strong>＋</strong>
                    <b>未編成</b>
                    <small>信者を選んで配置</small>
                  </>
                )}
              </button>
            ))}
          </section>
          <section className="character-picker">
            <div className="deploy-title">
              <h2>枠{selected + 1}に配置する信者</h2>
              <button className="pause" onClick={() => choose(null)}>
                この枠を外す
              </button>
            </div>
            <div className="roster-grid">
              {ALLIES.map((kind) => {
                const d = unitStats(kind, progress.levels);
                const pos = formation.indexOf(kind);
                return (
                  <button
                    key={kind}
                    onClick={() => choose(kind)}
                    aria-label={`${d.name}を枠${selected + 1}に配置`}
                  >
                    <CharacterImage kind={kind} />
                    <div>
                      <h3>
                        {d.name}{" "}
                        <small>Lv.{levelOf(progress.levels, kind)}</small>
                      </h3>
                      <span>
                        {d.role} / ¥ {d.cost}
                      </span>
                      <small>
                        HP {d.hp} / 攻撃 {d.damage}
                        <br />
                        射程 {d.range} / 攻撃間隔 {d.interval}秒
                      </small>
                      <b>
                        {pos >= 0
                          ? `枠${pos + 1}に編成中 → 移動`
                          : "この枠に配置"}
                      </b>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
          <div className="formation-actions">
            <span role="status">
              {notice || "変更はすぐに現在の編成へ反映されます。"}
            </span>
            <button className="pause" onClick={() => setPage("home")}>
              ホームへ戻る
            </button>
            <button className="primary" onClick={start} disabled={!count}>
              この編成で出陣 →
            </button>
          </div>
        </>
      )}
      <footer>
        <span>じっと教大戦争 / THE STONE FRONT</span>
        <span className="placeholder">
          架空の仮キャラクター / オリジナル作品
        </span>
      </footer>
    </main>
  );
}
createRoot(document.getElementById("root")!).render(<App />);

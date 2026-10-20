import { useCallback, useState } from "react";
import { createRoot } from "react-dom/client";
import { BattleScreen } from "./BattleScreen";
import { CharacterImage } from "./CharacterImage";
import { GameIcon, SacredLandscape } from "./GameIcon";
import { ALLIES, UNITS, type Kind } from "./data";
import { initialFormation, assignOwnedSlot, type Formation } from "./formation";
import "./style.css";
import { useProgress } from "./useProgress";
import { awardStageVictory, upgradeCharacter } from "./progressStore";
import { unitStats, levelOf, type Levels } from "./progression";
import { UpgradeScreen } from "./UpgradeScreen";
import { GachaScreen } from "./GachaScreen";
import { CollectionScreen } from "./CollectionScreen";
import { StageSelectScreen } from "./StageSelectScreen";
import { STAGES, DEFAULT_STAGE, stageById } from "./stages";

type Page =
  | "home"
  | "formation"
  | "battle"
  | "upgrade"
  | "gacha"
  | "collection"
  | "stages";
function App() {
  const [page, setPage] = useState<Page>("home");
  const { progress, update, transact, warning } = useProgress();
  const formation = progress.formation;
  const [battleStage, setBattleStage] = useState(
    () => STAGES[Math.max(0, progress.highestStage - 1)] ?? DEFAULT_STAGE,
  );
  const [battleRun, setBattleRun] = useState(0);
  const [battleOwned, setBattleOwned] = useState([...progress.owned]);
  const [battleLevels, setBattleLevels] = useState<Levels>(() => ({
    ...progress.levels,
  }));
  const onVictory = useCallback(
    (id: string, stageId: string) => {
      update((data) => awardStageVictory(data, id, "win", stageId));
    },
    [update],
  );
  const [selected, setSelected] = useState(0);
  const [battleLineup, setBattleLineup] = useState<Formation>(initialFormation);
  const [notice, setNotice] = useState("");
  const count = formation.filter(Boolean).length;
  function start(stageId: string) {
    const stage = stageById(stageId);
    if (!count || !stage || !progress.campaign[stageId]?.unlocked) return;
    setBattleStage(stage);
    setBattleRun((run) => run + 1);
    setBattleLineup([...formation]);
    setBattleLevels({ ...progress.levels });
    setBattleOwned([...progress.owned]);
    setPage("battle");
  }
  function choose(kind: Kind | null) {
    update((data) => ({
      ...data,
      formation: assignOwnedSlot(data.formation, selected, kind, data.owned),
    }));
    setNotice(
      `枠${selected + 1}を${kind ? UNITS[kind].name : "未編成"}に変更しました`,
    );
  }
  if (page === "battle")
    return (
      <BattleScreen
        key={battleRun}
        stage={battleStage}
        onStages={() => setPage("stages")}
        onNext={
          STAGES[battleStage.number] &&
          progress.campaign[STAGES[battleStage.number].id].unlocked
            ? () => start(STAGES[battleStage.number].id)
            : undefined
        }
        lineup={battleLineup}
        levels={battleLevels}
        xp={progress.xp}
        owned={battleOwned}
        victoryRewards={progress.victoryRewards}
        saveWarning={warning}
        onVictory={onVictory}
        onHome={() => setPage("home")}
      />
    );
  return (
    <main className={`hub ${page}-page`}>
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
        <div className="player-hud" aria-label="プレイヤー情報と所持通貨">
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
          <span
            className="resource-chip"
            title="勝利で獲得・ガチャで使用する信仰石"
          >
            <GameIcon name="gacha" />
            <span>
              信仰石 <b>{progress.stones.toLocaleString()}</b>
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
      {page === "stages" ? (
        <StageSelectScreen
          progress={progress}
          selectedId={battleStage.id}
          canStart={count > 0}
          onStart={start}
          onFormation={() => setPage("formation")}
        />
      ) : page === "gacha" ? (
        <GachaScreen
          progress={progress}
          transact={transact}
          onNavigate={setPage}
        />
      ) : page === "collection" ? (
        <CollectionScreen progress={progress} />
      ) : page === "upgrade" ? (
        <UpgradeScreen
          xp={progress.xp}
          levels={progress.levels}
          owned={progress.owned}
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
                onClick={() => setPage("stages")}
              >
                <GameIcon name="battle" />
                冒険の旅へ <span>▶</span>
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
            <button
              className="menu-battle"
              onClick={() => setPage("stages")}
              disabled={!count}
            >
              <span className="menu-medallion">
                <GameIcon name="battle" />
              </span>
              <b>戦闘</b>
              <small>全15ステージへ</small>
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
              <button
                key={item.name}
                className={`menu-${item.icon}`}
                onClick={() =>
                  setPage(item.icon === "gacha" ? "gacha" : "collection")
                }
              >
                <span className="menu-medallion">
                  <GameIcon name={item.icon} />
                </span>
                <b>{item.name}</b>
                <small>
                  {item.icon === "gacha"
                    ? progress.pendingGacha
                      ? "未確認の結果あり"
                      : "信仰石で仲間を召喚"
                    : `${progress.owned.length} / ${ALLIES.length} 収集`}
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
              3エリア・全15ステージ。初回1,500信仰石、ボス初回3,000個、周回150個＋XP。最高到達{" "}
              {progress.highestStage} / 15。
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
              {progress.owned.map((kind) => {
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
            <button
              className="primary"
              onClick={() => setPage("stages")}
              disabled={!count}
            >
              ステージを選んで出陣 →
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

import { UNITS, ALLIES, INITIAL_ALLIES, type Kind } from "./data.ts";
import { ownedFormation } from "./formation.ts";
import { unitStats, normalizeLevels, type Levels } from "./progression.ts";
import type { Stats } from "./data.ts";
import { DEFAULT_STAGE, type Stage } from "./stages.ts";
export interface Unit {
  id: number;
  kind: Kind;
  side: 1 | -1;
  x: number;
  hp: number;
  maxHP: number;
  attack: number;
  flash: number;
  pose: number;
  dead: number;
  recoil: number;
  stun?: number;
}
export interface Effect {
  x: number;
  y: number;
  text: string;
  life: number;
  color: string;
}
export interface Impact {
  x: number;
  y: number;
  life: number;
  duration: number;
  power: number;
  side: 1 | -1;
  death: boolean;
  color: string;
}
export class Battle {
  readonly id = crypto.randomUUID();
  readonly levels: Readonly<Levels>;
  readonly stats: Readonly<Record<Kind, Stats>>;
  readonly lineup: readonly (Kind | null)[];
  readonly owned: readonly Kind[];
  readonly stage: Stage;
  constructor(
    lineup: readonly (Kind | null)[] = INITIAL_ALLIES,
    levels: Levels = {},
    owned: readonly Kind[] = INITIAL_ALLIES,
    stage: Stage = DEFAULT_STAGE,
  ) {
    this.stage = { ...stage, waves: stage.waves.map((wave) => ({ ...wave })) };
    this.money = stage.startingMoney;
    this.leftHP = stage.baseHP;
    this.rightHP = stage.enemyBaseHP;
    this.owned = Object.freeze([...owned]);
    this.lineup = Object.freeze(ownedFormation(lineup, this.owned));
    this.levels = Object.freeze(normalizeLevels(levels));
    this.stats = Object.freeze(
      Object.fromEntries(
        (Object.keys(UNITS) as Kind[]).map((kind) => [
          kind,
          Object.freeze(unitStats(kind, this.levels)),
        ]),
      ) as Record<Kind, Stats>,
    );
  }
  impacts: Impact[] = [];
  hitStop = 0;
  impactCooldown = 0;
  shake = 0;
  fxTime = 0;
  impact(x: number, y: number, power: number, side: 1 | -1, death = false) {
    this.impacts.push({
      x,
      y,
      power,
      side,
      death,
      life: death ? 0.6 : 0.4,
      duration: death ? 0.6 : 0.4,
      color: side === 1 ? "#ffe2a0" : "#ef9c99",
    });
    this.shake = Math.max(this.shake, power * 2);
    if (this.impactCooldown <= 0) {
      this.hitStop = power >= 3 ? 0.045 : 0.018;
      this.impactCooldown = 0.18;
    }
    // Bound visual work during large crowds.
    if (this.impacts.length > 48) this.impacts.shift();
  }
  time = 0;
  money: number;
  leftHP: number;
  rightHP: number;
  status: "ready" | "playing" | "paused" | "win" | "lose" = "ready";
  units: Unit[] = [];
  effects: Effect[] = [];
  cooldowns: Partial<Record<Kind, number>> = {};
  wave = 0;
  serial = 0;
  bossIntro = 0;
  bossSeen = false;
  spawn(kind: Kind, side: 1 | -1) {
    const u: Unit = {
      id: ++this.serial,
      kind,
      side,
      x: side === 1 ? 100 : 1300,
      hp: this.stats[kind].hp,
      maxHP: this.stats[kind].hp,
      attack: 0.3,
      flash: 0,
      pose: 0,
      dead: 0,
      recoil: 0,
    };
    this.units.push(u);
    if (this.stats[kind].boss && side === -1) {
      this.bossSeen = true;
      this.bossIntro = 3;
      this.shake = Math.max(this.shake, 8);
    }
    return u;
  }
  deploy(kind: Kind) {
    const d = this.stats[kind];
    if (
      this.status !== "playing" ||
      !this.lineup.includes(kind) ||
      !this.owned.includes(kind) ||
      this.money < d.cost ||
      (this.cooldowns[kind] ?? 0) > 0
    )
      return false;
    this.money -= d.cost;
    this.cooldowns[kind] = d.cooldown;
    this.spawn(kind, 1);
    return true;
  }
  toggle() {
    if (this.status === "playing") this.status = "paused";
    else if (this.status === "paused" || this.status === "ready")
      this.status = "playing";
  }
  update(dt: number) {
    if (this.status !== "playing") return;
    this.fxTime += dt;
    this.bossIntro = Math.max(0, this.bossIntro - dt);
    this.shake = Math.max(0, this.shake - dt * 35);
    this.impactCooldown = Math.max(0, this.impactCooldown - dt);
    const combatDt = Math.max(0, dt - this.hitStop);
    this.hitStop = Math.max(0, this.hitStop - dt);
    this.impacts = this.impacts.filter((e) => (e.life -= dt) > 0);
    this.time += dt;
    this.money = Math.min(
      this.stage.maxMoney,
      this.money + dt * this.stage.income,
    );
    for (const k of ALLIES)
      this.cooldowns[k] = Math.max(0, (this.cooldowns[k] ?? 0) - dt);
    while (
      this.wave < this.stage.waves.length &&
      this.stage.waves[this.wave].at <= this.time
    )
      this.spawn(this.stage.waves[this.wave++].kind, -1);
    for (const u of this.units) {
      u.recoil *= Math.exp(-dt * 14);
      u.flash = Math.max(0, u.flash - dt);
      u.pose = Math.max(0, u.pose - dt);
      if (u.hp <= 0) {
        u.dead += dt;
        continue;
      }
      if ((u.stun ?? 0) > 0) {
        u.stun = Math.max(0, (u.stun ?? 0) - combatDt);
        continue;
      }
      const d = this.stats[u.kind];
      u.attack -= combatDt;
      const targets = this.units
        .filter(
          (v) => v.hp > 0 && v.side !== u.side && (v.x - u.x) * u.side >= -15,
        )
        .sort((a, b) => Math.abs(a.x - u.x) - Math.abs(b.x - u.x));
      const target = targets[0];
      const baseX = u.side === 1 ? 1300 : 100;
      const distance = target
        ? Math.abs(target.x - u.x)
        : Math.abs(baseX - u.x);
      if (distance > d.range) {
        u.x += u.side * d.speed * combatDt;
        continue;
      }
      if (u.attack > 0 || combatDt === 0) continue;
      u.attack = d.interval;
      u.pose = 0.3;
      if (target) {
        const hits = d.pierce
          ? targets.filter((v) => Math.abs(v.x - u.x) <= d.range)
          : d.area
            ? targets.filter(
                (v) => Math.abs(v.x - target.x) <= (d.splash ?? 65),
              )
            : [target];
        for (const v of hits) {
          v.hp -= d.damage;
          v.flash = 0.18;
          v.recoil = -v.side * (u.kind === "keito" ? 22 : 8);
          if (d.push)
            v.x = Math.max(105, Math.min(1295, v.x + u.side * d.push));
          if (d.stun && v.hp > 0) v.stun = Math.max(v.stun ?? 0, d.stun);
          this.impact(
            v.x,
            260,
            u.kind === "keito" || d.boss ? 3 : d.area ? 1.5 : 1,
            u.side,
            v.hp <= 0,
          );
          this.effects.push({
            x: v.x,
            y: 240 - UNITS[v.kind].size * 35,
            text: String(d.damage),
            life: 0.8,
            color: u.side === 1 ? "#ffe2a0" : "#ffa79a",
          });
          if (v.hp <= 0 && v.side === -1)
            this.money = Math.min(this.stage.maxMoney, this.money + 25);
        }
      } else {
        this.impact(baseX, 220, u.kind === "keito" || d.boss ? 3 : 1, u.side);
        if (u.side === 1) this.rightHP = Math.max(0, this.rightHP - d.damage);
        else this.leftHP = Math.max(0, this.leftHP - d.damage);
        this.effects.push({
          x: baseX,
          y: 155,
          text: String(d.damage),
          life: 0.8,
          color: "#ffe2a0",
        });
      }
      if (this.rightHP === 0 || this.leftHP === 0) {
        this.status = this.rightHP === 0 ? "win" : "lose";
        break;
      }
    }
    this.units = this.units.filter((u) => u.dead < 0.55);
    this.effects = this.effects.filter((e) => (e.life -= dt) > 0).slice(-80);
  }
}

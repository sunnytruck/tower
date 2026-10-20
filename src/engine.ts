import { UNITS, STAGE, ALLIES, type Kind } from "./data.ts";
export interface Unit {
  id: number;
  kind: Kind;
  side: 1 | -1;
  x: number;
  hp: number;
  attack: number;
  flash: number;
  pose: number;
  dead: number;
}
export interface Effect {
  x: number;
  y: number;
  text: string;
  life: number;
  color: string;
}
export class Battle {
  time = 0;
  money = STAGE.startingMoney;
  leftHP = STAGE.baseHP;
  rightHP = STAGE.baseHP;
  status: "ready" | "playing" | "paused" | "win" | "lose" = "ready";
  units: Unit[] = [];
  effects: Effect[] = [];
  cooldowns: Partial<Record<Kind, number>> = {};
  wave = 0;
  serial = 0;
  spawn(kind: Kind, side: 1 | -1) {
    const u: Unit = {
      id: ++this.serial,
      kind,
      side,
      x: side === 1 ? 100 : 1300,
      hp: UNITS[kind].hp,
      attack: 0.3,
      flash: 0,
      pose: 0,
      dead: 0,
    };
    this.units.push(u);
    return u;
  }
  deploy(kind: Kind) {
    const d = UNITS[kind];
    if (
      this.status !== "playing" ||
      !ALLIES.includes(kind) ||
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
    this.time += dt;
    this.money = Math.min(STAGE.maxMoney, this.money + dt * STAGE.income);
    for (const k of ALLIES)
      this.cooldowns[k] = Math.max(0, (this.cooldowns[k] ?? 0) - dt);
    while (
      this.wave < STAGE.waves.length &&
      STAGE.waves[this.wave].at <= this.time
    )
      this.spawn(STAGE.waves[this.wave++].kind, -1);
    for (const u of this.units) {
      u.flash = Math.max(0, u.flash - dt);
      u.pose = Math.max(0, u.pose - dt);
      if (u.hp <= 0) {
        u.dead += dt;
        continue;
      }
      const d = UNITS[u.kind];
      u.attack -= dt;
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
        u.x += u.side * d.speed * dt;
        continue;
      }
      if (u.attack > 0) continue;
      u.attack = d.interval;
      u.pose = 0.3;
      if (target) {
        const hits = d.area
          ? targets.filter((v) => Math.abs(v.x - u.x) <= d.range + 40)
          : [target];
        for (const v of hits) {
          v.hp -= d.damage;
          v.flash = 0.18;
          this.effects.push({
            x: v.x,
            y: 240 - UNITS[v.kind].size * 35,
            text: String(d.damage),
            life: 0.8,
            color: u.side === 1 ? "#ffe2a0" : "#ffa79a",
          });
          if (v.hp <= 0 && v.side === -1)
            this.money = Math.min(STAGE.maxMoney, this.money + 25);
        }
      } else {
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
    this.effects = this.effects.filter((e) => (e.life -= dt) > 0);
  }
}

import { test } from "node:test";
import assert from "node:assert/strict";
import { Battle } from "../src/engine.ts";
import { INITIAL_ALLIES, type Kind } from "../src/data.ts";
import { STAGES, type Stage } from "../src/stages.ts";
import { newProgress, awardStageVictory, upgradeCharacter } from "../src/progressStore.ts";

function fight(stage: Stage, level: number, order: Kind[], delay = 0) {
  const b = new Battle(INITIAL_ALLIES, Object.fromEntries(INITIAL_ALLIES.map(kind => [kind,level])), INITIAL_ALLIES, stage);
  b.toggle();
  for (let i = 0; i < 360 * 60 && b.status === "playing"; i++) {
    if (b.time >= delay) for (const kind of order) b.deploy(kind);
    b.update(1/60);
  }
  return b;
}
test("the campaign is playable end-to-end with only the three starters and XP earned along the way", () => {
  let progress = newProgress();
  for (const stage of STAGES) {
    for (const kind of INITIAL_ALLIES) {
      while (progress.levels[kind]! < stage.recommendedLevel) {
        const next = upgradeCharacter(progress, kind);
        assert.notEqual(next, progress, `earned XP funds ${stage.name} Lv.${stage.recommendedLevel}`);
        progress = next;
      }
    }
    // Walls take priority; splash and ranged attackers spend the remaining funds.
    const battle = fight(stage, stage.recommendedLevel, ["novice","mage","monk"]);
    assert.equal(battle.status, "win", `${stage.number} ${stage.name}`);
    assert.equal(battle.rightHP, 0); assert.ok(battle.leftHP > 0);
    assert.equal(battle.owned.includes("keito"), false);
    if (stage.boss) {
      assert.equal(battle.bossSeen, true);
      assert.equal(battle.units.some(u => u.kind === stage.boss && u.hp > 0), false);
    }
    progress = awardStageVictory(progress, battle.id, battle.status, stage.id);
  }
  assert.equal(progress.highestStage, 15); assert.equal(progress.stones, 27000);
  assert.equal(Object.values(progress.campaign).filter(s => s.clears > 0).length, 15);
});
test("the first three stages allow level-one starters; later battles benefit from leveling", () => {
  for (const stage of STAGES.slice(0,3)) assert.equal(fight(stage,1,["mage","novice"]).status, "win", stage.name);
  for (const number of [6,8,9,11,12,13,14,15]) assert.equal(fight(STAGES[number-1],1,["novice","mage","monk"]).status,"lose",`unleveled stage ${number}`);
});
test("deployment timing and spending priorities affect outcomes with the same roster", () => {
  assert.equal(fight(STAGES[4],3,["mage","novice"],75).status,"lose");
  assert.equal(fight(STAGES[4],3,["mage","novice"]).status,"win");
  assert.equal(fight(STAGES[13],12,["mage","novice","monk"]).status,"lose");
  assert.equal(fight(STAGES[13],12,["novice","mage","monk"]).status,"win");
});
test("gatekeeper knocks front units back with localized splash; emperor pierces its full range", () => {
  for (const kind of ["gatekeeper","emperor"] as const) {
    const b = new Battle(); b.toggle(); const boss=b.spawn(kind,-1); boss.x=600;boss.attack=0;
    const targets=[550,450,300].map(x=>{const u=b.spawn("novice",1);u.x=x;u.attack=100;return u;});
    b.update(.01);
    assert.ok(targets[0].hp < targets[0].maxHP);
    assert.equal(targets[1].hp < targets[1].maxHP,kind === "emperor");
    assert.equal(targets[2].hp,targets[2].maxHP);
    if(kind === "gatekeeper") assert.ok(targets[0].x < 550);
    else assert.ok(targets[0].x >= 550);
  }
});
test("guardian's sleep freezes affected units briefly, respects pause and expires", () => {
  const b=new Battle();b.toggle();const boss=b.spawn("guardian",-1);boss.x=600;boss.attack=0;
  const wall=b.spawn("novice",1);wall.x=500;wall.attack=100;
  const rear=b.spawn("mage",1);rear.x=350;rear.attack=100;
  b.update(.01);assert.ok((wall.stun??0)>1);assert.equal(rear.stun,undefined);
  const x=wall.x, attack=wall.attack; b.update(.2);assert.equal(wall.x,x);assert.equal(wall.attack,attack);
  b.toggle();const before=JSON.stringify(b);b.update(2);assert.equal(JSON.stringify(b),before);
  b.toggle();boss.hp=0;for(let i=0;i<90;i++)b.update(1/60);
  assert.equal(wall.stun,0);assert.ok(wall.x>x);
});
test("each boss entrance starts once on spawn and remains frozen while paused", () => {
  for(const stage of STAGES.filter(s=>s.boss)) {
    const b=new Battle(INITIAL_ALLIES,{},INITIAL_ALLIES,stage);b.toggle();
    const at=stage.waves.find(w=>w.kind===stage.boss)!.at;
    for(let i=0;i<(at+.1)*60;i++)b.update(1/60);
    assert.equal(b.units.filter(u=>u.kind===stage.boss).length,1);assert.ok(b.bossIntro>2.8);assert.equal(b.bossSeen,true);
    b.toggle();const timer=b.bossIntro;b.update(4);assert.equal(b.bossIntro,timer);
    b.toggle();for(let i=0;i<181;i++)b.update(1/60);assert.equal(b.bossIntro,0);
  }
});

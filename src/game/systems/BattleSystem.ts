import { Sprite, SpriteSkill, ElementType, getEffectivenessMultiplier } from '../data/types';

export interface BattleResult {
  winner: 'player' | 'enemy' | 'draw';
  playerSprite: Sprite;
  enemySprite: Sprite;
  expGained: number;
  goldGained: number;
  captured?: boolean;
}

export class BattleSystem {
  // 计算伤害
  static calculateDamage(
    attacker: Sprite,
    defender: Sprite,
    skill: SpriteSkill
  ): number {
    // 极简伤害公式: (攻击力 * 技能威力 / 20) - 防御力
    const baseDamage = (attacker.stats.atk * skill.power / 20) - defender.stats.def;

    // 属性克制倍率
    const effectiveness = getEffectivenessMultiplier(skill.element, defender.element);

    // 随机系数 (0.9 - 1.1)
    const randomFactor = 0.9 + Math.random() * 0.2;

    // 最终伤害
    const finalDamage = Math.floor(baseDamage * effectiveness * randomFactor);

    return Math.max(1, finalDamage); // 至少造成1点伤害
  }

  // 使用技能
  static useSkill(attacker: Sprite, defender: Sprite, skill: SpriteSkill): {
    damage: number;
    effectiveness: number;
    critical: boolean;
  } {
    // 检查 PP
    if (skill.pp <= 0) {
      return { damage: 0, effectiveness: 1, critical: false };
    }

    // 消耗 PP
    skill.pp--;

    // 计算基础伤害
    const damage = this.calculateDamage(attacker, defender, skill);
    const effectiveness = getEffectivenessMultiplier(skill.element, defender.element);

    // 暴击判定 (10% 概率)
    const critical = Math.random() < 0.1;
    const finalDamage = critical ? damage * 1.5 : damage;

    // 扣除 HP
    defender.stats.hp = Math.max(0, defender.stats.hp - Math.floor(finalDamage));

    return { damage: Math.floor(finalDamage), effectiveness, critical };
  }

  // 获得经验
  static gainExp(sprite: Sprite, exp: number): boolean {
    sprite.exp += exp;

    // 检查是否升级
    let leveledUp = false;
    while (sprite.exp >= sprite.expToNext && sprite.level < 50) {
      this.levelUp(sprite);
      leveledUp = true;
    }

    return leveledUp;
  }

  // 升级 - 简化为固定加值
  static levelUp(sprite: Sprite): boolean {
    if (sprite.level >= 50) return false;

    sprite.level++;
    sprite.exp -= sprite.expToNext;

    // 经验曲线简化: 每级 100 经验
    sprite.expToNext = 100;

    // 属性增长 (HP+50, ATK+10, DEF+5, SPD+5)
    sprite.stats.maxHP += 50;
    sprite.stats.hp = sprite.stats.maxHP; // 升级回满血
    sprite.stats.atk += 10;
    sprite.stats.def += 5;
    sprite.stats.spd += 5;

    // 恢复所有技能 PP
    sprite.skills.forEach(skill => {
      skill.pp = skill.maxPP;
    });

    return true;
  }

  // 计算战斗奖励
  static calculateRewards(enemyLevel: number): { exp: number; gold: number } {
    const exp = enemyLevel * 40; // 简单线性倍率
    const gold = enemyLevel * 20;
    return { exp, gold };
  }

  // 尝试捕捉
  static attemptCapture(sprite: Sprite, ballMultiplier: number = 1.0): boolean {
    const hpRatio = sprite.stats.hp / sprite.stats.maxHP;
    const baseRate = 0.4; // 基础成功率提高到 40%
    const captureRate = (1.2 - hpRatio) * baseRate * ballMultiplier;

    return Math.random() < captureRate;
  }

  // 回合制战斗逻辑
  static determineTurnOrder(sprite1: Sprite, sprite2: Sprite): [Sprite, Sprite] {
    // 速度高的先攻
    if (sprite1.stats.spd >= sprite2.stats.spd) {
      return [sprite1, sprite2];
    }
    return [sprite2, sprite1];
  }
}

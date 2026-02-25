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
    // 基础伤害 = 技能威力 * (攻击力 / 防御力)
    const baseDamage = skill.power * (attacker.stats.atk / defender.stats.def);
    
    // 属性克制倍率
    const effectiveness = getEffectivenessMultiplier(skill.element, defender.element);
    
    // 随机系数 (0.85 - 1.0)
    const randomFactor = 0.85 + Math.random() * 0.15;
    
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

    // 计算伤害
    const damage = this.calculateDamage(attacker, defender, skill);
    const effectiveness = getEffectivenessMultiplier(skill.element, defender.element);
    
    // 暴击判定 (10% 概率)
    const critical = Math.random() < 0.1;
    const finalDamage = critical ? damage * 1.5 : damage;

    // 扣除 HP
    defender.stats.hp = Math.max(0, defender.stats.hp - finalDamage);

    return { damage: Math.floor(finalDamage), effectiveness, critical };
  }

  // 获得经验
  static gainExp(sprite: Sprite, exp: number): boolean {
    sprite.exp += exp;
    
    // 检查是否升级
    if (sprite.exp >= sprite.expToNext) {
      return this.levelUp(sprite);
    }
    
    return false;
  }

  // 升级
  static levelUp(sprite: Sprite): boolean {
    if (sprite.level >= 50) return false; // 最高等级

    sprite.level++;
    sprite.exp -= sprite.expToNext;
    
    // 计算新的升级所需经验
    sprite.expToNext = Math.floor(Math.pow(sprite.level + 1, 2.5) * 10);

    // 属性增长（基于成长值）
    const growthFactor = sprite.stats.growthValue / 100;
    sprite.stats.maxHP += Math.floor(5 * growthFactor);
    sprite.stats.hp = sprite.stats.maxHP; // 升级回满血
    sprite.stats.atk += Math.floor(2 * growthFactor);
    sprite.stats.def += Math.floor(1.5 * growthFactor);
    sprite.stats.spd += Math.floor(1.8 * growthFactor);

    // 恢复所有技能 PP
    sprite.skills.forEach(skill => {
      skill.pp = skill.maxPP;
    });

    return true;
  }

  // 计算战斗奖励
  static calculateRewards(enemyLevel: number): { exp: number; gold: number } {
    const exp = Math.floor(enemyLevel * 15 * (1 + Math.random() * 0.2));
    const gold = Math.floor(enemyLevel * 10 * (1 + Math.random() * 0.3));
    return { exp, gold };
  }

  // 尝试捕捉
  static attemptCapture(sprite: Sprite, ballMultiplier: number = 1.0): boolean {
    // 捕捉成功率 = (1 - 当前HP/最大HP) * 基础成功率 * 精灵球倍率
    const hpRatio = sprite.stats.hp / sprite.stats.maxHP;
    const baseRate = 0.3; // 基础30%成功率
    const captureRate = (1 - hpRatio) * baseRate * ballMultiplier;
    
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

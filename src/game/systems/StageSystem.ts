import { Sprite } from '../data/types';

// 关卡系统
export interface Stage {
  id: string;
  name: string;
  level: number;
  description: string;
  enemies: EnemyEncounter[];
  rewards: StageReward;
  unlocked: boolean;
}

export interface EnemyEncounter {
  spriteId: string;
  level: number;
  probability: number; // 出现概率
}

export interface StageReward {
  baseExp: number;
  baseGold: number;
  captureChance: number; // 捕捉概率
  firstClearBonus?: {
    exp: number;
    gold: number;
    items?: string[];
  };
}

// 战斗状态
export interface BattleState {
  stage: Stage;
  currentEnemy: Sprite;
  playerSprite: Sprite;
  turn: number;
  playerHP: number;
  enemyHP: number;
  battleLog: BattleLogEntry[];
  canCapture: boolean;
  rewards?: BattleRewards;
}

export interface BattleLogEntry {
  turn: number;
  actor: 'player' | 'enemy';
  action: string;
  damage?: number;
  effect?: string;
  timestamp: number;
}

export interface BattleRewards {
  exp: number;
  gold: number;
  levelUp: boolean;
  newLevel?: number;
  captured?: Sprite;
}

// 预定义关卡 - 等级与关卡序号对齐
export const STAGES: Stage[] = [
  {
    id: 'stage_1',
    name: '新手草原',
    level: 1,
    description: '适合新手训练的草原，有 Lv.1 精灵出没',
    enemies: [
      { spriteId: 'fire_fox', level: 1, probability: 0.4 },
      { spriteId: 'electric_mouse', level: 1, probability: 0.3 },
      { spriteId: 'ice_rabbit', level: 1, probability: 0.3 }
    ],
    rewards: {
      baseExp: 100,
      baseGold: 30,
      captureChance: 0.4
    },
    unlocked: true
  },
  {
    id: 'stage_2',
    name: '幽暗森林',
    level: 2,
    description: 'Lv.2 精灵的森林',
    enemies: [
      { spriteId: 'poison_snake', level: 2, probability: 0.5 },
      { spriteId: 'fire_fox', level: 2, probability: 0.3 },
      { spriteId: 'void_phantom', level: 2, probability: 0.2 }
    ],
    rewards: {
      baseExp: 200,
      baseGold: 50,
      captureChance: 0.35
    },
    unlocked: false
  },
  {
    id: 'stage_3',
    name: '冰封雪地',
    level: 3,
    description: 'Lv.3 精灵的雪域',
    enemies: [
      { spriteId: 'ice_rabbit', level: 3, probability: 0.6 },
      { spriteId: 'electric_mouse', level: 3, probability: 0.4 }
    ],
    rewards: {
      baseExp: 300,
      baseGold: 80,
      captureChance: 0.3
    },
    unlocked: false
  },
  {
    id: 'stage_4',
    name: '雷电高原',
    level: 4,
    description: 'Lv.4 精灵的领域',
    enemies: [
      { spriteId: 'electric_mouse', level: 4, probability: 0.7 },
      { spriteId: 'void_phantom', level: 4, probability: 0.3 }
    ],
    rewards: {
      baseExp: 400,
      baseGold: 100,
      captureChance: 0.25
    },
    unlocked: false
  },
  {
    id: 'stage_5',
    name: '虚空裂隙',
    level: 5,
    description: 'Lv.5 终极裂隙，隐藏着 Lv.10 强敌',
    enemies: [
      { spriteId: 'void_phantom', level: 5, probability: 0.8 },
      { spriteId: 'boss_void_lord', level: 10, probability: 0.2 }
    ],
    rewards: {
      baseExp: 800,
      baseGold: 300,
      captureChance: 0.2,
      firstClearBonus: {
        exp: 1000,
        gold: 500,
        items: ['fusion_stone']
      }
    },
    unlocked: false
  }
];

// 关卡管理器
export class StageManager {
  private stages: Stage[] = [...STAGES];
  private clearedStages: Set<string> = new Set();

  // 获取所有关卡
  getStages(): Stage[] {
    return this.stages;
  }

  // 获取已解锁的关卡
  getUnlockedStages(): Stage[] {
    return this.stages.filter(s => s.unlocked);
  }

  // 解锁关卡
  unlockStage(stageId: string): void {
    const stage = this.stages.find(s => s.id === stageId);
    if (stage) {
      stage.unlocked = true;
    }
  }

  // 标记关卡已通关
  clearStage(stageId: string): void {
    this.clearedStages.add(stageId);

    // 解锁下一关
    const currentIndex = this.stages.findIndex(s => s.id === stageId);
    if (currentIndex >= 0 && currentIndex < this.stages.length - 1) {
      this.stages[currentIndex + 1].unlocked = true;
    }
  }

  // 检查是否已通关
  isCleared(stageId: string): boolean {
    return this.clearedStages.has(stageId);
  }

  // 随机生成敌人 - 使用新的线性属性公式
  generateEnemy(stage: Stage): Sprite {
    const rand = Math.random();
    let cumulative = 0;

    for (const encounter of stage.enemies) {
      cumulative += encounter.probability;
      if (rand <= cumulative) {
        const { getBaseSprite } = require('../data/baseSprites');
        const sprite = getBaseSprite(encounter.spriteId);
        if (sprite) {
          sprite.level = encounter.level;
          // 线性公式: HP (50 + Lv*50), ATK (10 + Lv*10), DEF (5 + Lv*5)
          const baseHP = 50 + sprite.level * 50;
          const baseAtk = 10 + sprite.level * 10;
          const baseDef = 5 + sprite.level * 5;
          const baseSpd = 10 + sprite.level * 5;

          sprite.stats.maxHP = Math.floor(baseHP);
          sprite.stats.hp = sprite.stats.maxHP;
          sprite.stats.atk = Math.floor(baseAtk);
          sprite.stats.def = Math.floor(baseDef);
          sprite.stats.spd = Math.floor(baseSpd);
        }
        return sprite;
      }
    }

    const { getBaseSprite } = require('../data/baseSprites');
    return getBaseSprite(stage.enemies[0].spriteId);
  }

  // 计算战斗奖励
  calculateRewards(stage: Stage, victory: boolean, captured: boolean): BattleRewards {
    if (!victory) {
      return {
        exp: 0,
        gold: 0,
        levelUp: false
      };
    }

    const isFirstClear = !this.isCleared(stage.id);

    let exp = stage.rewards.baseExp;
    let gold = stage.rewards.baseGold;

    // 首次通关奖励
    if (isFirstClear && stage.rewards.firstClearBonus) {
      exp += stage.rewards.firstClearBonus.exp;
      gold += stage.rewards.firstClearBonus.gold;
    }

    return {
      exp,
      gold,
      levelUp: false // 这个需要在外部计算
    };
  }
}

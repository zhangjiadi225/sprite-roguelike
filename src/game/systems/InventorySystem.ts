import { Sprite } from '../data/types';

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  type: 'potion' | 'ball' | 'fusion' | 'boost';
  quantity: number;
  effect?: (sprite: Sprite) => void;
}

export class InventorySystem {
  private items: Map<string, InventoryItem> = new Map();
  private sprites: Sprite[] = [];
  private maxSprites: number = 20; // 背包最多存放20只精灵
  private gold: number = 100; // 初始金币

  // 添加物品
  addItem(item: InventoryItem): boolean {
    const existing = this.items.get(item.id);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      this.items.set(item.id, { ...item });
    }
    return true;
  }

  // 使用物品
  useItem(itemId: string, target?: Sprite): boolean {
    const item = this.items.get(itemId);
    if (!item || item.quantity <= 0) return false;

    // 执行物品效果
    if (item.effect && target) {
      item.effect(target);
    }

    // 减少数量
    item.quantity--;
    if (item.quantity <= 0) {
      this.items.delete(itemId);
    }

    return true;
  }

  // 获取所有物品
  getItems(): InventoryItem[] {
    return Array.from(this.items.values());
  }

  // 添加精灵
  addSprite(sprite: Sprite): boolean {
    if (this.sprites.length >= this.maxSprites) {
      return false; // 背包已满
    }
    this.sprites.push(sprite);
    return true;
  }

  // 移除精灵
  removeSprite(spriteId: string): Sprite | undefined {
    const index = this.sprites.findIndex(s => s.id === spriteId);
    if (index === -1) return undefined;
    
    return this.sprites.splice(index, 1)[0];
  }

  // 获取所有精灵
  getSprites(): Sprite[] {
    return [...this.sprites];
  }

  // 金币操作
  addGold(amount: number): void {
    this.gold += amount;
  }

  spendGold(amount: number): boolean {
    if (this.gold < amount) return false;
    this.gold -= amount;
    return true;
  }

  getGold(): number {
    return this.gold;
  }
}

// 预定义物品
export const ITEMS: Record<string, Omit<InventoryItem, 'quantity'>> = {
  POTION: {
    id: 'potion',
    name: '生命药水',
    description: '恢复50点HP',
    type: 'potion',
    effect: (sprite: Sprite) => {
      sprite.stats.hp = Math.min(sprite.stats.maxHP, sprite.stats.hp + 50);
    }
  },
  FULL_RESTORE: {
    id: 'full_restore',
    name: '全恢复药',
    description: '完全恢复HP和PP',
    type: 'potion',
    effect: (sprite: Sprite) => {
      sprite.stats.hp = sprite.stats.maxHP;
      sprite.skills.forEach(skill => {
        skill.pp = skill.maxPP;
      });
    }
  },
  POKE_BALL: {
    id: 'poke_ball',
    name: '精灵球',
    description: '用于捕捉野生精灵',
    type: 'ball'
  },
  GREAT_BALL: {
    id: 'great_ball',
    name: '高级球',
    description: '捕捉成功率更高的精灵球',
    type: 'ball'
  },
  FUSION_STONE: {
    id: 'fusion_stone',
    name: '融合石',
    description: '用于融合两只精灵',
    type: 'fusion'
  },
  EXP_CANDY: {
    id: 'exp_candy',
    name: '经验糖果',
    description: '获得100点经验',
    type: 'boost',
    effect: (sprite: Sprite) => {
      sprite.exp += 100;
    }
  }
};

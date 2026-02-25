// 属性类型
export enum ElementType {
  FIRE = 'fire',      // 火
  ELECTRIC = 'electric', // 电
  POISON = 'poison',  // 毒
  ICE = 'ice',        // 冰
  VOID = 'void'       // 虚空
}

// 属性相克关系
export const ELEMENT_EFFECTIVENESS: Record<ElementType, { strong: ElementType[], weak: ElementType[] }> = {
  [ElementType.FIRE]: { strong: [ElementType.ICE], weak: [ElementType.POISON] },
  [ElementType.ICE]: { strong: [ElementType.ELECTRIC], weak: [ElementType.FIRE] },
  [ElementType.ELECTRIC]: { strong: [ElementType.POISON], weak: [ElementType.ICE] },
  [ElementType.POISON]: { strong: [ElementType.FIRE], weak: [ElementType.ELECTRIC] },
  [ElementType.VOID]: { strong: [], weak: [] } // 虚空不克制也不被克制
};

// 精灵肢体部位
export interface SpriteBodyPart {
  pixels: number[][]; // 像素数据 (16x16 或其他尺寸)
  colors: string[];   // 颜色数据
  width: number;
  height: number;
}

// 精灵身体结构
export interface SpriteBody {
  head: SpriteBodyPart;
  ears: SpriteBodyPart;
  body: SpriteBodyPart;
  legs: SpriteBodyPart;
  tail?: SpriteBodyPart;
  wings?: SpriteBodyPart;
}

// 精灵技能
export interface SpriteSkill {
  id: string;
  name: string;
  power: number;
  pp: number;        // 使用次数
  maxPP: number;
  element: ElementType;
  isSignature: boolean; // 是否为保底技能
}

// 精灵属性
export interface SpriteStats {
  hp: number;
  maxHP: number;
  atk: number;
  def: number;
  spd: number;
  growthValue: number; // 成长值
}

// 精灵数据
export interface Sprite {
  id: string;
  name: string;
  element: ElementType;
  level: number;
  exp: number;
  expToNext: number;
  stats: SpriteStats;
  skills: SpriteSkill[];
  body: SpriteBody;
  fusionCount: number; // 融合次数
  size: number;        // 尺寸 (16, 24, 32)
  parents?: [string, string]; // 父代ID
}

// 计算属性克制倍率
export function getEffectivenessMultiplier(attackElement: ElementType, defenseElement: ElementType): number {
  if (attackElement === ElementType.VOID || defenseElement === ElementType.VOID) {
    return 1.0; // 虚空属性无克制关系
  }
  
  const effectiveness = ELEMENT_EFFECTIVENESS[attackElement];
  if (effectiveness.strong.includes(defenseElement)) {
    return 2.0; // 克制
  }
  if (effectiveness.weak.includes(defenseElement)) {
    return 0.5; // 被克制
  }
  return 1.0; // 普通
}

// 计算升级所需经验
export function getExpForLevel(level: number): number {
  return Math.floor(Math.pow(level, 2.5) * 10);
}

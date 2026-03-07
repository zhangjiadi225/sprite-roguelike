import { Sprite, ElementType } from './types';

// 5种基础精灵数据
export const BASE_SPRITES: Sprite[] = [
  // 火属性 - 火狐
  {
    id: 'fire_fox',
    name: '火狐',
    element: ElementType.FIRE,
    level: 1,
    exp: 0,
    expToNext: 100,
    stats: {
      hp: 100,
      maxHP: 100,
      atk: 22, // 略高攻击
      def: 10,
      spd: 18,
      growthValue: 100
    },
    skills: [
      {
        id: 'ember',
        name: '火花',
        power: 40,
        pp: 25,
        maxPP: 25,
        element: ElementType.FIRE,
        isSignature: true
      },
      {
        id: 'scratch',
        name: '抓击',
        power: 30,
        pp: 35,
        maxPP: 35,
        element: ElementType.FIRE,
        isSignature: false
      }
    ],
    body: {
      bodyKey: 'body_fire_fox',
      featureKey: 'feature_fire_fox'
    },
    fusionCount: 0,
    size: 16
  },

  // 电属性 - 雷鼠
  {
    id: 'electric_mouse',
    name: '雷鼠',
    element: ElementType.ELECTRIC,
    level: 1,
    exp: 0,
    expToNext: 100,
    stats: {
      hp: 90,
      maxHP: 90,
      atk: 18,
      def: 8,
      spd: 25, // 高速度
      growthValue: 100
    },
    skills: [
      {
        id: 'thundershock',
        name: '电击',
        power: 40,
        pp: 30,
        maxPP: 30,
        element: ElementType.ELECTRIC,
        isSignature: true
      },
      {
        id: 'quick_attack',
        name: '电光一闪',
        power: 30,
        pp: 30,
        maxPP: 30,
        element: ElementType.ELECTRIC,
        isSignature: false
      }
    ],
    body: {
      bodyKey: 'body_electric_mouse',
      featureKey: 'feature_electric_mouse'
    },
    fusionCount: 0,
    size: 16
  },

  // 毒属性 - 毒蛇
  {
    id: 'poison_snake',
    name: '毒蛇',
    element: ElementType.POISON,
    level: 1,
    exp: 0,
    expToNext: 100,
    stats: {
      hp: 110,
      maxHP: 110,
      atk: 20,
      def: 12,
      spd: 15,
      growthValue: 100
    },
    skills: [
      {
        id: 'poison_sting',
        name: '毒针',
        power: 35,
        pp: 35,
        maxPP: 35,
        element: ElementType.POISON,
        isSignature: true
      },
      {
        id: 'bite',
        name: '咬住',
        power: 35,
        pp: 25,
        maxPP: 25,
        element: ElementType.POISON,
        isSignature: false
      }
    ],
    body: {
      bodyKey: 'body_poison_snake',
      featureKey: 'feature_poison_snake'
    },
    fusionCount: 0,
    size: 16
  },

  // 冰属性 - 冰兔
  {
    id: 'ice_rabbit',
    name: '冰兔',
    element: ElementType.ICE,
    level: 1,
    exp: 0,
    expToNext: 100,
    stats: {
      hp: 105,
      maxHP: 105,
      atk: 16,
      def: 15, // 高防御
      spd: 20,
      growthValue: 100
    },
    skills: [
      {
        id: 'ice_shard',
        name: '冰锥',
        power: 40,
        pp: 25,
        maxPP: 25,
        element: ElementType.ICE,
        isSignature: true
      },
      {
        id: 'tackle',
        name: '撞击',
        power: 30,
        pp: 35,
        maxPP: 35,
        element: ElementType.ICE,
        isSignature: false
      }
    ],
    body: {
      bodyKey: 'body_ice_rabbit',
      featureKey: 'feature_ice_rabbit'
    },
    fusionCount: 0,
    size: 16
  },

  // 虚空属性 - 虚影
  {
    id: 'void_phantom',
    name: '虚影',
    element: ElementType.VOID,
    level: 1,
    exp: 0,
    expToNext: 100,
    stats: {
      hp: 100,
      maxHP: 100,
      atk: 20,
      def: 10,
      spd: 20,
      growthValue: 100
    },
    skills: [
      {
        id: 'void_pulse',
        name: '虚空脉冲',
        power: 45,
        pp: 20,
        maxPP: 20,
        element: ElementType.VOID,
        isSignature: true
      },
      {
        id: 'shadow_claw',
        name: '暗影爪',
        power: 35,
        pp: 30,
        maxPP: 30,
        element: ElementType.VOID,
        isSignature: false
      }
    ],
    body: {
      bodyKey: 'body_void_phantom',
      featureKey: 'feature_void_phantom'
    },
    fusionCount: 0,
    size: 16
  },

  // =========================================
  // Boss 精灵
  // =========================================

  // 虚空属性 Boss - 虚空领主
  {
    id: 'boss_void_lord',
    name: '虚空领主',
    element: ElementType.VOID,
    level: 10,
    exp: 0,
    expToNext: 500,
    isBoss: true,
    stats: {
      hp: 150,
      maxHP: 150,
      atk: 35,
      def: 25,
      spd: 20,
      growthValue: 180
    },
    skills: [
      {
        id: 'void_annihilation',
        name: '虚空湮灭',
        power: 80,
        pp: 10,
        maxPP: 10,
        element: ElementType.VOID,
        isSignature: true
      },
      {
        id: 'shadow_strike',
        name: '暗影连击',
        power: 50,
        pp: 20,
        maxPP: 20,
        element: ElementType.VOID,
        isSignature: false
      }
    ],
    body: {
      bodyKey: 'body_boss_void_lord',
      featureKey: 'feature_boss_void_lord'
    },
    fusionCount: 0,
    size: 24
  }
];

// 获取基础精灵的副本
export function getBaseSprite(id: string): Sprite | undefined {
  const sprite = BASE_SPRITES.find(s => s.id === id);
  if (!sprite) return undefined;

  // 深拷贝
  return JSON.parse(JSON.stringify(sprite));
}

// 获取所有基础精灵
export function getAllBaseSprites(): Sprite[] {
  return BASE_SPRITES.map(s => JSON.parse(JSON.stringify(s)));
}

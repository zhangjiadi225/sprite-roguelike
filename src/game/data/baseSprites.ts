import { Sprite, ElementType, SpriteBodyPart } from './types';

// 创建简单的像素部位（用于测试）
function createSimpleBodyPart(width: number, height: number, color: string): SpriteBodyPart {
  const pixels: number[][] = [];
  for (let y = 0; y < height; y++) {
    pixels[y] = [];
    for (let x = 0; x < width; x++) {
      // 简单的矩形填充
      pixels[y][x] = 0;
    }
  }
  return {
    pixels,
    colors: [color],
    width,
    height
  };
}

// 5种基础精灵数据
export const BASE_SPRITES: Sprite[] = [
  // 火属性 - 火狐
  {
    id: 'fire_fox',
    name: '火狐',
    element: ElementType.FIRE,
    level: 5,
    exp: 0,
    expToNext: 100,
    stats: {
      hp: 45,
      maxHP: 45,
      atk: 15,
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
      head: createSimpleBodyPart(8, 8, '#ff6600'),
      ears: createSimpleBodyPart(4, 6, '#ff8800'),
      body: createSimpleBodyPart(12, 10, '#ff4400'),
      legs: createSimpleBodyPart(6, 8, '#ff6600'),
      tail: createSimpleBodyPart(8, 10, '#ffaa00')
    },
    fusionCount: 0,
    size: 16
  },
  
  // 电属性 - 雷鼠
  {
    id: 'electric_mouse',
    name: '雷鼠',
    element: ElementType.ELECTRIC,
    level: 5,
    exp: 0,
    expToNext: 100,
    stats: {
      hp: 40,
      maxHP: 40,
      atk: 12,
      def: 8,
      spd: 22,
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
      head: createSimpleBodyPart(8, 8, '#ffff00'),
      ears: createSimpleBodyPart(3, 8, '#ffdd00'),
      body: createSimpleBodyPart(10, 8, '#ffee00'),
      legs: createSimpleBodyPart(4, 6, '#ffff00'),
      tail: createSimpleBodyPart(6, 8, '#ffaa00')
    },
    fusionCount: 0,
    size: 16
  },
  
  // 毒属性 - 毒蛇
  {
    id: 'poison_snake',
    name: '毒蛇',
    element: ElementType.POISON,
    level: 5,
    exp: 0,
    expToNext: 100,
    stats: {
      hp: 42,
      maxHP: 42,
      atk: 14,
      def: 12,
      spd: 16,
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
      head: createSimpleBodyPart(8, 6, '#9933ff'),
      ears: createSimpleBodyPart(2, 3, '#aa44ff'),
      body: createSimpleBodyPart(14, 6, '#8822ee'),
      legs: createSimpleBodyPart(3, 4, '#9933ff')
    },
    fusionCount: 0,
    size: 16
  },
  
  // 冰属性 - 冰兔
  {
    id: 'ice_rabbit',
    name: '冰兔',
    element: ElementType.ICE,
    level: 5,
    exp: 0,
    expToNext: 100,
    stats: {
      hp: 48,
      maxHP: 48,
      atk: 11,
      def: 14,
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
      head: createSimpleBodyPart(8, 8, '#aaddff'),
      ears: createSimpleBodyPart(3, 10, '#88ccff'),
      body: createSimpleBodyPart(10, 10, '#99ddff'),
      legs: createSimpleBodyPart(5, 8, '#aaddff'),
      tail: createSimpleBodyPart(4, 4, '#ccffff')
    },
    fusionCount: 0,
    size: 16
  },
  
  // 虚空属性 - 虚影
  {
    id: 'void_phantom',
    name: '虚影',
    element: ElementType.VOID,
    level: 5,
    exp: 0,
    expToNext: 100,
    stats: {
      hp: 50,
      maxHP: 50,
      atk: 13,
      def: 11,
      spd: 15,
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
      head: createSimpleBodyPart(8, 8, '#6633cc'),
      ears: createSimpleBodyPart(4, 6, '#7744dd'),
      body: createSimpleBodyPart(12, 10, '#5522bb'),
      legs: createSimpleBodyPart(6, 8, '#6633cc'),
      wings: createSimpleBodyPart(10, 8, '#8855ee')
    },
    fusionCount: 0,
    size: 16
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

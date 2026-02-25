import { Sprite, SpriteBody, SpriteBodyPart, SpriteSkill, ElementType } from './types';

// 随机选择父代之一
function randomParent<T>(a: T, b: T): T {
  return Math.random() < 0.5 ? a : b;
}

// 融合两个肢体部位
function fuseBodyPart(partA: SpriteBodyPart, partB: SpriteBodyPart): SpriteBodyPart {
  const width = Math.max(partA.width, partB.width);
  const height = Math.max(partA.height, partB.height);
  const pixels: number[][] = [];
  const colors: string[] = [];

  // 混合像素数据
  for (let y = 0; y < height; y++) {
    pixels[y] = [];
    for (let x = 0; x < width; x++) {
      // 随机选择来自哪个父代的像素
      const useA = Math.random() < 0.5;
      const sourcePixels = useA ? partA.pixels : partB.pixels;
      const sourceColors = useA ? partA.colors : partB.colors;
      
      if (y < sourcePixels.length && x < sourcePixels[y].length) {
        pixels[y][x] = sourcePixels[y][x];
        
        // 收集颜色
        const colorIndex = sourcePixels[y][x];
        if (colorIndex >= 0 && !colors.includes(sourceColors[colorIndex])) {
          colors.push(sourceColors[colorIndex]);
        }
      } else {
        pixels[y][x] = -1; // 透明
      }
    }
  }

  // 5-10% 的像素随机变异
  const mutationRate = 0.05 + Math.random() * 0.05;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (Math.random() < mutationRate && pixels[y][x] >= 0) {
        // 随机改变颜色索引
        pixels[y][x] = Math.floor(Math.random() * colors.length);
      }
    }
  }

  return { pixels, colors, width, height };
}

// 融合精灵身体
function fuseBodies(bodyA: SpriteBody, bodyB: SpriteBody): SpriteBody {
  return {
    head: randomParent(bodyA.head, bodyB.head),
    ears: randomParent(bodyA.ears, bodyB.ears),
    body: randomParent(bodyA.body, bodyB.body),
    legs: randomParent(bodyA.legs, bodyB.legs),
    tail: bodyA.tail && bodyB.tail ? randomParent(bodyA.tail, bodyB.tail) : (bodyA.tail || bodyB.tail),
    wings: bodyA.wings && bodyB.wings ? randomParent(bodyA.wings, bodyB.wings) : (bodyA.wings || bodyB.wings)
  };
}

// 融合技能
function fuseSkills(skillsA: SpriteSkill[], skillsB: SpriteSkill[]): SpriteSkill[] {
  const result: SpriteSkill[] = [];
  
  // 保留各自的保底技能
  const signatureA = skillsA.find(s => s.isSignature);
  const signatureB = skillsB.find(s => s.isSignature);
  
  if (signatureA) result.push({ ...signatureA });
  if (signatureB) result.push({ ...signatureB });
  
  // 随机继承1-2个非保底技能
  const otherSkills = [
    ...skillsA.filter(s => !s.isSignature),
    ...skillsB.filter(s => !s.isSignature)
  ];
  
  const inheritCount = Math.min(2, otherSkills.length);
  for (let i = 0; i < inheritCount; i++) {
    const randomIndex = Math.floor(Math.random() * otherSkills.length);
    const skill = otherSkills.splice(randomIndex, 1)[0];
    if (skill) result.push({ ...skill });
  }
  
  return result.slice(0, 4); // 最多4个技能
}

// 融合两只精灵
export function fuseSprites(spriteA: Sprite, spriteB: Sprite): Sprite {
  // 计算新等级
  const newLevel = Math.floor((spriteA.level + spriteB.level) / 2);
  
  // 计算新成长值（增长10%）
  const newGrowthValue = (spriteA.stats.growthValue + spriteB.stats.growthValue) * 1.1;
  
  // 随机选择属性
  const newElement = randomParent(spriteA.element, spriteB.element);
  
  // 融合身体
  const newBody = fuseBodies(spriteA.body, spriteB.body);
  
  // 融合技能
  const newSkills = fuseSkills(spriteA.skills, spriteB.skills);
  
  // 计算新尺寸（融合次数越多可能变大）
  const totalFusions = spriteA.fusionCount + spriteB.fusionCount + 1;
  let newSize = 16;
  if (totalFusions >= 5) newSize = 32;
  else if (totalFusions >= 2) newSize = 24;
  
  // 计算基础属性（基于等级和成长值）
  const baseHP = Math.floor(50 + newLevel * 5 * (newGrowthValue / 100));
  const baseAtk = Math.floor(10 + newLevel * 2 * (newGrowthValue / 100));
  const baseDef = Math.floor(8 + newLevel * 1.5 * (newGrowthValue / 100));
  const baseSpd = Math.floor(12 + newLevel * 1.8 * (newGrowthValue / 100));
  
  // 生成唯一ID（基于父代ID和时间戳）
  const newId = `sprite_${spriteA.id}_${spriteB.id}_${Date.now()}`;
  
  // 生成名字（简单组合）
  const nameA = spriteA.name.slice(0, Math.ceil(spriteA.name.length / 2));
  const nameB = spriteB.name.slice(Math.floor(spriteB.name.length / 2));
  const newName = nameA + nameB;
  
  return {
    id: newId,
    name: newName,
    element: newElement,
    level: newLevel,
    exp: 0,
    expToNext: Math.floor(Math.pow(newLevel + 1, 2.5) * 10),
    stats: {
      hp: baseHP,
      maxHP: baseHP,
      atk: baseAtk,
      def: baseDef,
      spd: baseSpd,
      growthValue: newGrowthValue
    },
    skills: newSkills,
    body: newBody,
    fusionCount: totalFusions,
    size: newSize,
    parents: [spriteA.id, spriteB.id]
  };
}

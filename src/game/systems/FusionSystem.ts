import { Sprite, SpriteBody, SpriteSkill, ElementType } from '../data/types';

// 随机选择父代之一
function randomParent<T>(a: T, b: T): T {
  return Math.random() < 0.5 ? a : b;
}

// 融合精灵身体 (单色球体力 + 独立特征)
function fuseBodies(bodyA: SpriteBody, bodyB: SpriteBody): SpriteBody {
  return {
    // 例如父A是火狐(橙身体+火尾巴)，父B是冰兔(浅蓝身+长垂耳)
    // 融合可能变成：橙身体+长垂耳，或者 浅蓝身+火尾巴
    bodyKey: randomParent(bodyA.bodyKey, bodyB.bodyKey),
    featureKey: randomParent(bodyA.featureKey, bodyB.featureKey)
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

  // 经验曲线简化: 每级 100 经验
  const expToNext = 100;

  // 计算基础属性（使用新的线性模型）
  const baseHP = 50 + newLevel * 50;
  const baseAtk = 10 + newLevel * 10;
  const baseDef = 5 + newLevel * 5;
  const baseSpd = 10 + newLevel * 5;

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
    expToNext,
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

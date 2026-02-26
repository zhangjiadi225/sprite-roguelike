import Phaser from 'phaser';
import { Sprite, SpriteSkill } from '../data/types';
import { BattleSystem } from '../systems/BattleSystem';
import { UITheme, UIHelper } from '../ui/UITheme';

export default class BattleScene extends Phaser.Scene {
  private playerSprite!: Sprite;
  private enemySprite!: Sprite;
  private playerTeam: Sprite[] = [];
  private currentPlayerIndex: number = 0;
  
  private battleLog: string[] = [];
  private onBattleEnd?: (result: any) => void;

  constructor() {
    super({ key: 'BattleScene' });
  }

  init(data: { 
    playerTeam: Sprite[], 
    enemySprite: Sprite,
    onBattleEnd?: (result: any) => void 
  }) {
    this.playerTeam = data.playerTeam;
    this.currentPlayerIndex = 0;
    this.playerSprite = this.playerTeam[0];
    this.enemySprite = data.enemySprite;
    this.onBattleEnd = data.onBattleEnd;
    this.battleLog = [];
  }

  create() {
    const { width, height } = this.cameras.main;

    // 战斗背景
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(
      Phaser.Display.Color.HexStringToColor('#2C3E50').color,
      Phaser.Display.Color.HexStringToColor('#34495E').color,
      Phaser.Display.Color.HexStringToColor('#2C3E50').color,
      Phaser.Display.Color.HexStringToColor('#34495E').color,
      1
    );
    graphics.fillRect(0, 0, width, height);

    // 添加战斗特效背景
    this.addBattleEffects();

    // 标题
    const title = this.add.text(width / 2, 30, '战斗！', {
      fontSize: '32px',
      color: UITheme.colors.primary,
      fontFamily: '"Press Start 2P", monospace',
      stroke: '#000000',
      strokeThickness: 4
    });
    title.setOrigin(0.5);

    // 显示精灵
    this.displaySprites();

    // 显示技能选择
    this.displaySkills();

    // 战斗日志
    this.displayBattleLog();
  }

  private addBattleEffects() {
    const { width, height } = this.cameras.main;
    
    // 添加闪电效果
    for (let i = 0; i < 3; i++) {
      const x = Phaser.Math.Between(0, width);
      const line = this.add.line(x, 0, 0, 0, 0, height, 0xFFFFFF, 0.1);
      
      this.tweens.add({
        targets: line,
        alpha: 0.3,
        duration: 200,
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(0, 2000)
      });
    }
  }

  private displaySprites() {
    const { width, height } = this.cameras.main;

    // 玩家精灵（左侧）
    const playerX = width * 0.25;
    const playerY = height * 0.4;

    this.createSpriteDisplay(
      playerX, 
      playerY, 
      this.playerSprite, 
      true
    );

    // 敌方精灵（右侧）
    const enemyX = width * 0.75;
    const enemyY = height * 0.4;

    this.createSpriteDisplay(
      enemyX, 
      enemyY, 
      this.enemySprite, 
      false
    );
  }

  private createSpriteDisplay(x: number, y: number, sprite: Sprite, isPlayer: boolean) {
    const container = this.add.container(x, y);

    // 精灵卡片
    const card = UIHelper.createCard(this, -70, -90, 140, 180);
    container.add(card);

    // 精灵图标
    const icon = this.add.rectangle(0, -30, 100, 100, 
      Phaser.Display.Color.HexStringToColor(UIHelper.getElementColor(sprite.element)).color, 0.3);
    icon.setStrokeStyle(3, Phaser.Display.Color.HexStringToColor(UIHelper.getElementColor(sprite.element)).color);
    container.add(icon);

    // 精灵名称
    const name = this.add.text(0, -80, sprite.name, {
      fontSize: '16px',
      color: isPlayer ? UITheme.colors.success : UITheme.colors.danger,
      fontFamily: '"Press Start 2P", monospace'
    });
    name.setOrigin(0.5);
    container.add(name);

    // 等级
    const level = this.add.text(0, 30, `Lv.${sprite.level}`, {
      fontSize: '12px',
      color: UITheme.colors.textSecondary
    });
    level.setOrigin(0.5);
    container.add(level);

    // HP 条
    const hpBar = UIHelper.createProgressBar(
      this,
      -50,
      55,
      100,
      12,
      sprite.stats.hp,
      sprite.stats.maxHP,
      isPlayer ? UITheme.colors.success : UITheme.colors.danger
    );
    container.add(hpBar);

    // HP 文字
    const hpText = this.add.text(0, 70, 
      `${sprite.stats.hp}/${sprite.stats.maxHP}`, {
      fontSize: '10px',
      color: UITheme.colors.textPrimary
    });
    hpText.setOrigin(0.5);
    container.add(hpText);

    // 入场动画
    container.setAlpha(0);
    container.setScale(0.5);
    this.tweens.add({
      targets: container,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 500,
      ease: 'Back.easeOut'
    });
  }

  private displaySkills() {
    const { width, height } = this.cameras.main;
    const startY = height * 0.75;

    const skillsLabel = this.add.text(width / 2, startY - 40, '选择技能', {
      fontSize: '16px',
      color: UITheme.colors.accent,
      fontFamily: '"Press Start 2P", monospace'
    });
    skillsLabel.setOrigin(0.5);

    this.playerSprite.skills.forEach((skill, index) => {
      const x = width / 2 - 180 + index * 120;
      const y = startY;

      const button = this.createSkillButton(x, y, skill);
    });
  }

  private createSkillButton(x: number, y: number, skill: SpriteSkill) {
    const container = this.add.container(x, y);

    const canUse = skill.pp > 0;
    const bgColor = canUse ? UITheme.colors.bgCard : '#1a1a1a';

    // 背景
    const bg = this.add.rectangle(0, 0, 100, 70, 
      Phaser.Display.Color.HexStringToColor(bgColor).color);
    bg.setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(
      UIHelper.getElementColor(skill.element)
    ).color);

    // 技能名
    const name = this.add.text(0, -15, skill.name, {
      fontSize: '12px',
      color: canUse ? UITheme.colors.textPrimary : UITheme.colors.textMuted
    });
    name.setOrigin(0.5);

    // PP
    const pp = this.add.text(0, 10, `PP: ${skill.pp}/${skill.maxPP}`, {
      fontSize: '10px',
      color: canUse ? UITheme.colors.textSecondary : UITheme.colors.textMuted
    });
    pp.setOrigin(0.5);

    // 威力
    const power = this.add.text(0, 25, `威力: ${skill.power}`, {
      fontSize: '8px',
      color: UITheme.colors.textMuted
    });
    power.setOrigin(0.5);

    container.add([bg, name, pp, power]);
    container.setSize(100, 70);

    if (canUse) {
      container.setInteractive({ useHandCursor: true });

      container.on('pointerover', () => {
        this.tweens.add({
          targets: container,
          scaleX: 1.1,
          scaleY: 1.1,
          duration: 150
        });
        bg.setStrokeStyle(3, Phaser.Display.Color.HexStringToColor(UITheme.colors.accent).color);
      });

      container.on('pointerout', () => {
        this.tweens.add({
          targets: container,
          scaleX: 1,
          scaleY: 1,
          duration: 150
        });
        bg.setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(
          UIHelper.getElementColor(skill.element)
        ).color);
      });

      container.on('pointerdown', () => {
        this.executePlayerTurn(skill);
      });
    }

    return container;
  }

  private displayBattleLog() {
    const { width, height } = this.cameras.main;
    const logY = height - 70;

    const logBg = this.add.rectangle(width / 2, logY, width - 40, 60, 0x000000, 0.7);
    logBg.setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(UITheme.colors.primary).color);
    
    const logText = this.add.text(width / 2, logY, this.battleLog.slice(-2).join('\n'), {
      fontSize: '12px',
      color: UITheme.colors.textPrimary,
      align: 'center',
      wordWrap: { width: width - 80 }
    });
    logText.setOrigin(0.5);
  }

  private executePlayerTurn(skill: SpriteSkill) {
    const result = BattleSystem.useSkill(this.playerSprite, this.enemySprite, skill);
    
    let message = `${this.playerSprite.name} 使用了 ${skill.name}！造成 ${result.damage} 点伤害`;
    if (result.critical) message += '（暴击！）';
    if (result.effectiveness > 1) message += '（效果拔群！）';
    if (result.effectiveness < 1) message += '（效果不佳...）';
    
    this.battleLog.push(message);

    if (this.enemySprite.stats.hp <= 0) {
      this.endBattle('player');
      return;
    }

    this.time.delayedCall(1000, () => {
      this.executeEnemyTurn();
    });

    this.scene.restart();
  }

  private executeEnemyTurn() {
    const availableSkills = this.enemySprite.skills.filter(s => s.pp > 0);
    if (availableSkills.length === 0) return;

    const skill = availableSkills[Math.floor(Math.random() * availableSkills.length)];
    const result = BattleSystem.useSkill(this.enemySprite, this.playerSprite, skill);

    let message = `${this.enemySprite.name} 使用了 ${skill.name}！造成 ${result.damage} 点伤害`;
    if (result.critical) message += '（暴击！）';
    
    this.battleLog.push(message);

    if (this.playerSprite.stats.hp <= 0) {
      if (this.currentPlayerIndex < this.playerTeam.length - 1) {
        this.currentPlayerIndex++;
        this.playerSprite = this.playerTeam[this.currentPlayerIndex];
        this.battleLog.push(`派出了 ${this.playerSprite.name}！`);
      } else {
        this.endBattle('enemy');
        return;
      }
    }

    this.scene.restart();
  }

  private endBattle(winner: 'player' | 'enemy') {
    const rewards = BattleSystem.calculateRewards(this.enemySprite.level);
    
    if (winner === 'player') {
      this.battleLog.push(`胜利！获得 ${rewards.exp} 经验和 ${rewards.gold} 金币`);
      BattleSystem.gainExp(this.playerSprite, rewards.exp);
    } else {
      this.battleLog.push('战斗失败...');
    }

    this.time.delayedCall(2000, () => {
      if (this.onBattleEnd) {
        this.onBattleEnd({ winner, rewards });
      }
      this.scene.start('GameScene');
    });
  }
}

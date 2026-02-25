import Phaser from 'phaser';
import { Sprite, SpriteSkill } from '../data/types';
import { BattleSystem } from '../systems/BattleSystem';

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

    // 背景
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);

    // 标题
    this.add.text(width / 2, 30, '战斗！', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 显示精灵信息
    this.displaySprites();

    // 显示技能选择
    this.displaySkills();

    // 战斗日志
    this.displayBattleLog();
  }

  private displaySprites() {
    const { width, height } = this.cameras.main;

    // 玩家精灵（左侧）
    const playerX = width * 0.25;
    const playerY = height * 0.4;

    this.add.rectangle(playerX, playerY, 120, 120, 0x333333);
    this.add.text(playerX, playerY - 80, this.playerSprite.name, {
      fontSize: '20px',
      color: '#00ff00'
    }).setOrigin(0.5);

    this.add.text(playerX, playerY + 70, 
      `Lv.${this.playerSprite.level} | HP: ${this.playerSprite.stats.hp}/${this.playerSprite.stats.maxHP}`, {
      fontSize: '14px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // HP条
    const playerHPBar = this.add.rectangle(playerX, playerY + 90, 100, 10, 0xff0000);
    const playerHPFill = this.add.rectangle(
      playerX - 50, 
      playerY + 90, 
      100 * (this.playerSprite.stats.hp / this.playerSprite.stats.maxHP), 
      10, 
      0x00ff00
    );
    playerHPFill.setOrigin(0, 0.5);

    // 敌方精灵（右侧）
    const enemyX = width * 0.75;
    const enemyY = height * 0.4;

    this.add.rectangle(enemyX, enemyY, 120, 120, 0x444444);
    this.add.text(enemyX, enemyY - 80, this.enemySprite.name, {
      fontSize: '20px',
      color: '#ff0000'
    }).setOrigin(0.5);

    this.add.text(enemyX, enemyY + 70, 
      `Lv.${this.enemySprite.level} | HP: ${this.enemySprite.stats.hp}/${this.enemySprite.stats.maxHP}`, {
      fontSize: '14px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // HP条
    const enemyHPBar = this.add.rectangle(enemyX, enemyY + 90, 100, 10, 0xff0000);
    const enemyHPFill = this.add.rectangle(
      enemyX - 50, 
      enemyY + 90, 
      100 * (this.enemySprite.stats.hp / this.enemySprite.stats.maxHP), 
      10, 
      0xff0000
    );
    enemyHPFill.setOrigin(0, 0.5);
  }

  private displaySkills() {
    const { width, height } = this.cameras.main;
    const startY = height * 0.7;

    this.add.text(width / 2, startY - 30, '选择技能：', {
      fontSize: '18px',
      color: '#ffaa00'
    }).setOrigin(0.5);

    this.playerSprite.skills.forEach((skill, index) => {
      const x = width / 2 - 150 + index * 100;
      const y = startY;

      const button = this.add.rectangle(x, y, 90, 60, 0x444444);
      button.setInteractive({ useHandCursor: true });

      const text = this.add.text(x, y - 10, skill.name, {
        fontSize: '14px',
        color: '#ffffff'
      }).setOrigin(0.5);

      const ppText = this.add.text(x, y + 15, `PP: ${skill.pp}/${skill.maxPP}`, {
        fontSize: '12px',
        color: '#aaaaaa'
      }).setOrigin(0.5);

      button.on('pointerover', () => {
        button.setFillStyle(0x666666);
      });

      button.on('pointerout', () => {
        button.setFillStyle(0x444444);
      });

      button.on('pointerdown', () => {
        if (skill.pp > 0) {
          this.executePlayerTurn(skill);
        }
      });
    });
  }

  private displayBattleLog() {
    const { width, height } = this.cameras.main;
    const logY = height - 80;

    const logBg = this.add.rectangle(width / 2, logY, width - 40, 60, 0x000000, 0.7);
    
    const logText = this.add.text(width / 2, logY, this.battleLog.slice(-2).join('\n'), {
      fontSize: '14px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);
  }

  private executePlayerTurn(skill: SpriteSkill) {
    // 玩家攻击
    const result = BattleSystem.useSkill(this.playerSprite, this.enemySprite, skill);
    
    let message = `${this.playerSprite.name} 使用了 ${skill.name}！造成 ${result.damage} 点伤害`;
    if (result.critical) message += '（暴击！）';
    if (result.effectiveness > 1) message += '（效果拔群！）';
    if (result.effectiveness < 1) message += '（效果不佳...）';
    
    this.battleLog.push(message);

    // 检查敌人是否被击败
    if (this.enemySprite.stats.hp <= 0) {
      this.endBattle('player');
      return;
    }

    // 敌人回合
    this.time.delayedCall(1000, () => {
      this.executeEnemyTurn();
    });

    this.scene.restart();
  }

  private executeEnemyTurn() {
    // 敌人随机选择技能
    const availableSkills = this.enemySprite.skills.filter(s => s.pp > 0);
    if (availableSkills.length === 0) return;

    const skill = availableSkills[Math.floor(Math.random() * availableSkills.length)];
    const result = BattleSystem.useSkill(this.enemySprite, this.playerSprite, skill);

    let message = `${this.enemySprite.name} 使用了 ${skill.name}！造成 ${result.damage} 点伤害`;
    if (result.critical) message += '（暴击！）';
    
    this.battleLog.push(message);

    // 检查玩家是否被击败
    if (this.playerSprite.stats.hp <= 0) {
      // 切换下一只精灵
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
      
      // 获得经验
      BattleSystem.gainExp(this.playerSprite, rewards.exp);
    } else {
      this.battleLog.push('战斗失败...');
    }

    // 显示结果
    this.time.delayedCall(2000, () => {
      if (this.onBattleEnd) {
        this.onBattleEnd({ winner, rewards });
      }
      this.scene.start('GameScene');
    });
  }
}

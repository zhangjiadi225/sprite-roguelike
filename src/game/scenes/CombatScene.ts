import Phaser from 'phaser';
import { Sprite, SpriteSkill } from '../data/types';
import { BattleSystem } from '../systems/BattleSystem';
import { Stage, StageManager, BattleRewards } from '../systems/StageSystem';
import { UITheme, UIHelper } from '../ui/UITheme';

export default class CombatScene extends Phaser.Scene {
  private stage!: Stage;
  private playerSprite!: Sprite;
  private enemySprite!: Sprite;
  private stageManager!: StageManager;
  
  private turn: number = 0;
  private battleLog: string[] = [];
  private isPlayerTurn: boolean = true;
  private battleEnded: boolean = false;

  constructor() {
    super({ key: 'CombatScene' });
  }

  init(data: {
    stage: Stage,
    playerSprite: Sprite,
    enemySprite: Sprite,
    stageManager: StageManager
  }) {
    this.stage = data.stage;
    this.playerSprite = data.playerSprite;
    this.enemySprite = data.enemySprite;
    this.stageManager = data.stageManager;
    this.turn = 1;
    this.battleLog = [`遭遇了 ${this.enemySprite.name}！`];
    this.isPlayerTurn = true;
    this.battleEnded = false;
  }

  create() {
    const { width, height } = this.cameras.main;

    // 战斗背景
    this.createBackground();

    // 顶部信息
    this.createTopBar();

    // 精灵展示区
    this.createSpriteDisplay();

    // 底部操作区
    this.createActionPanel();

    // 战斗日志
    this.createBattleLog();
  }

  private createBackground() {
    const { width, height } = this.cameras.main;
    
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(
      Phaser.Display.Color.HexStringToColor('#1a1a2e').color,
      Phaser.Display.Color.HexStringToColor('#16213e').color,
      Phaser.Display.Color.HexStringToColor('#0f3460').color,
      Phaser.Display.Color.HexStringToColor('#16213e').color,
      1
    );
    graphics.fillRect(0, 0, width, height);

    // 添加战斗氛围
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const particle = this.add.circle(x, y, 2, 0xFFFFFF, 0.3);
      
      this.tweens.add({
        targets: particle,
        alpha: 0.1,
        duration: Phaser.Math.Between(1000, 2000),
        yoyo: true,
        repeat: -1
      });
    }
  }

  private createTopBar() {
    const { width } = this.cameras.main;
    
    const topBar = UIHelper.createCard(this, 0, 0, width, 60);
    
    const stageText = this.add.text(20, 30, `${this.stage.name} - 回合 ${this.turn}`, {
      fontSize: '16px',
      color: UITheme.colors.textPrimary,
      fontFamily: '"Press Start 2P", monospace'
    });
    stageText.setOrigin(0, 0.5);
  }

  private createSpriteDisplay() {
    const { width, height } = this.cameras.main;

    // 玩家精灵（左侧）
    this.createSpriteCard(width * 0.25, height * 0.35, this.playerSprite, true);

    // 敌方精灵（右侧）
    this.createSpriteCard(width * 0.75, height * 0.35, this.enemySprite, false);
  }

  private createSpriteCard(x: number, y: number, sprite: Sprite, isPlayer: boolean) {
    const container = this.add.container(x, y);

    // 卡片
    const card = UIHelper.createCard(this, -80, -100, 160, 200);
    container.add(card);

    // 精灵图标
    const icon = this.add.rectangle(0, -40, 120, 120, 
      Phaser.Display.Color.HexStringToColor(UIHelper.getElementColor(sprite.element)).color, 0.3);
    icon.setStrokeStyle(3, Phaser.Display.Color.HexStringToColor(UIHelper.getElementColor(sprite.element)).color);
    container.add(icon);

    // 名称
    const name = this.add.text(0, -90, sprite.name, {
      fontSize: '14px',
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

    // HP条
    const hpBar = UIHelper.createProgressBar(
      this,
      -60,
      55,
      120,
      14,
      sprite.stats.hp,
      sprite.stats.maxHP,
      isPlayer ? UITheme.colors.success : UITheme.colors.danger
    );
    container.add(hpBar);

    // HP文字
    const hpText = this.add.text(0, 75, 
      `${sprite.stats.hp}/${sprite.stats.maxHP}`, {
      fontSize: '10px',
      color: UITheme.colors.textPrimary
    });
    hpText.setOrigin(0.5);
    container.add(hpText);

    // 入场动画
    container.setAlpha(0);
    container.setX(x + (isPlayer ? -100 : 100));
    this.tweens.add({
      targets: container,
      alpha: 1,
      x: x,
      duration: 500,
      ease: 'Back.easeOut'
    });
  }

  private createActionPanel() {
    const { width, height } = this.cameras.main;
    const panelY = height * 0.7;

    // 面板背景
    const panel = UIHelper.createCard(this, 20, panelY, width - 40, 150);

    // 标题
    const title = this.add.text(width / 2, panelY + 20, '选择技能', {
      fontSize: '14px',
      color: UITheme.colors.accent,
      fontFamily: '"Press Start 2P", monospace'
    });
    title.setOrigin(0.5);

    // 技能按钮
    this.playerSprite.skills.forEach((skill, index) => {
      const x = width / 2 - 180 + index * 120;
      const y = panelY + 70;
      this.createSkillButton(x, y, skill);
    });

    // 逃跑按钮
    const fleeButton = UIHelper.createPixelButton(
      this,
      width / 2,
      panelY + 120,
      '逃跑',
      () => this.flee(),
      UITheme.colors.textMuted
    );
    fleeButton.setScale(0.5);
  }

  private createSkillButton(x: number, y: number, skill: SpriteSkill) {
    const canUse = skill.pp > 0 && this.isPlayerTurn && !this.battleEnded;
    
    const container = this.add.container(x, y);

    // 背景
    const bg = this.add.rectangle(0, 0, 100, 60, 
      Phaser.Display.Color.HexStringToColor(canUse ? UITheme.colors.bgCard : '#1a1a1a').color);
    bg.setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(UIHelper.getElementColor(skill.element)).color, canUse ? 1 : 0.3);

    // 技能名
    const name = this.add.text(0, -12, skill.name, {
      fontSize: '11px',
      color: canUse ? UITheme.colors.textPrimary : UITheme.colors.textMuted
    });
    name.setOrigin(0.5);

    // PP
    const pp = this.add.text(0, 8, `PP:${skill.pp}/${skill.maxPP}`, {
      fontSize: '9px',
      color: canUse ? UITheme.colors.textSecondary : UITheme.colors.textMuted
    });
    pp.setOrigin(0.5);

    // 威力
    const power = this.add.text(0, 22, `威力:${skill.power}`, {
      fontSize: '8px',
      color: UITheme.colors.textMuted
    });
    power.setOrigin(0.5);

    container.add([bg, name, pp, power]);
    container.setSize(100, 60);

    if (canUse) {
      container.setInteractive({ useHandCursor: true });

      container.on('pointerover', () => {
        this.tweens.add({
          targets: container,
          scaleX: 1.1,
          scaleY: 1.1,
          duration: 100
        });
      });

      container.on('pointerout', () => {
        this.tweens.add({
          targets: container,
          scaleX: 1,
          scaleY: 1,
          duration: 100
        });
      });

      container.on('pointerdown', () => {
        this.useSkill(skill);
      });
    }
  }

  private createBattleLog() {
    const { width, height } = this.cameras.main;
    const logY = height - 50;

    const logBg = this.add.rectangle(width / 2, logY, width - 40, 40, 0x000000, 0.7);
    logBg.setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(UITheme.colors.primary).color);

    const logText = this.add.text(width / 2, logY, this.battleLog.slice(-1).join('\n'), {
      fontSize: '11px',
      color: UITheme.colors.textPrimary,
      align: 'center'
    });
    logText.setOrigin(0.5);
  }

  private useSkill(skill: SpriteSkill) {
    if (!this.isPlayerTurn || this.battleEnded) return;

    this.isPlayerTurn = false;

    // 玩家攻击
    const result = BattleSystem.useSkill(this.playerSprite, this.enemySprite, skill);
    
    let message = `${this.playerSprite.name}使用${skill.name}！造成${result.damage}伤害`;
    if (result.critical) message += '（暴击！）';
    if (result.effectiveness > 1) message += '（效果拔群！）';
    if (result.effectiveness < 1) message += '（效果不佳）';
    
    this.battleLog.push(message);

    // 检查敌人是否被击败
    if (this.enemySprite.stats.hp <= 0) {
      this.time.delayedCall(1000, () => {
        this.endBattle(true);
      });
      return;
    }

    // 敌人回合
    this.time.delayedCall(1500, () => {
      this.enemyTurn();
    });

    this.scene.restart();
  }

  private enemyTurn() {
    const availableSkills = this.enemySprite.skills.filter(s => s.pp > 0);
    if (availableSkills.length === 0) {
      this.isPlayerTurn = true;
      return;
    }

    const skill = availableSkills[Math.floor(Math.random() * availableSkills.length)];
    const result = BattleSystem.useSkill(this.enemySprite, this.playerSprite, skill);

    let message = `${this.enemySprite.name}使用${skill.name}！造成${result.damage}伤害`;
    if (result.critical) message += '（暴击！）';
    
    this.battleLog.push(message);

    // 检查玩家是否被击败
    if (this.playerSprite.stats.hp <= 0) {
      this.time.delayedCall(1000, () => {
        this.endBattle(false);
      });
      return;
    }

    this.turn++;
    this.isPlayerTurn = true;
    this.scene.restart();
  }

  private endBattle(victory: boolean) {
    this.battleEnded = true;

    const rewards = this.stageManager.calculateRewards(this.stage, victory, false);
    
    if (victory) {
      // 获得经验
      const leveledUp = BattleSystem.gainExp(this.playerSprite, rewards.exp);
      rewards.levelUp = leveledUp;
      if (leveledUp) {
        rewards.newLevel = this.playerSprite.level;
      }

      // 标记关卡通关
      this.stageManager.clearStage(this.stage.id);

      this.showVictoryScreen(rewards);
    } else {
      this.showDefeatScreen();
    }
  }

  private showVictoryScreen(rewards: BattleRewards) {
    const { width, height } = this.cameras.main;

    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.9);
    overlay.setInteractive();

    const title = this.add.text(width / 2, height / 2 - 100, '✓ 胜利！', {
      fontSize: '36px',
      color: UITheme.colors.success,
      fontFamily: '"Press Start 2P", monospace',
      stroke: '#000000',
      strokeThickness: 4
    });
    title.setOrigin(0.5);

    const rewardText = this.add.text(width / 2, height / 2, 
      `获得经验: ${rewards.exp}\n获得金币: ${rewards.gold}${rewards.levelUp ? `\n\n升级了！Lv.${rewards.newLevel}` : ''}`, {
      fontSize: '16px',
      color: UITheme.colors.textPrimary,
      align: 'center'
    });
    rewardText.setOrigin(0.5);

    UIHelper.createPixelButton(
      this,
      width / 2,
      height / 2 + 100,
      '继续',
      () => this.scene.start('StageSelectScene', { playerTeam: [this.playerSprite] }),
      UITheme.colors.success
    );
  }

  private showDefeatScreen() {
    const { width, height } = this.cameras.main;

    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.9);
    overlay.setInteractive();

    const title = this.add.text(width / 2, height / 2 - 50, '✗ 失败', {
      fontSize: '36px',
      color: UITheme.colors.danger,
      fontFamily: '"Press Start 2P", monospace',
      stroke: '#000000',
      strokeThickness: 4
    });
    title.setOrigin(0.5);

    UIHelper.createPixelButton(
      this,
      width / 2,
      height / 2 + 50,
      '返回',
      () => this.scene.start('StageSelectScene', { playerTeam: [this.playerSprite] }),
      UITheme.colors.danger
    );
  }

  private flee() {
    this.scene.start('StageSelectScene', { playerTeam: [this.playerSprite] });
  }
}

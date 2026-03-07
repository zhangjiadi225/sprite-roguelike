import Phaser from 'phaser';
import { StageManager, Stage } from '../systems/StageSystem';
import { Sprite } from '../data/types';
import { UITheme, UIHelper } from '../ui/UITheme';

export default class StageSelectScene extends Phaser.Scene {
  private stageManager!: StageManager;
  private playerTeam: Sprite[] = [];

  constructor() {
    super({ key: 'StageSelectScene' });
  }

  init(data: { playerTeam: Sprite[] }) {
    this.stageManager = new StageManager();
    this.playerTeam = data.playerTeam || [];
  }

  create() {
    const { width, height } = this.cameras.main;

    // 背景
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(
      Phaser.Display.Color.HexStringToColor('#0f0c29').color,
      Phaser.Display.Color.HexStringToColor('#302b63').color,
      Phaser.Display.Color.HexStringToColor('#24243e').color,
      Phaser.Display.Color.HexStringToColor('#302b63').color,
      1
    );
    graphics.fillRect(0, 0, width, height);

    // 标题
    const title = this.add.text(width / 2, height * 0.1, '选择关卡', {
      fontSize: '42px',
      color: UITheme.colors.primary,
      fontFamily: UITheme.fonts.title,
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);
    title.setShadow(0, 4, '#000000', 10, true, true);
    title.setOrigin(0.5);

    // 显示关卡列表
    this.displayStages();

    // 返回按钮
    UIHelper.createModernButton(
      this,
      100,
      50,
      '返回',
      () => this.scene.start('MenuScene'),
      UITheme.colors.danger,
      120,
      40
    );
  }

  private displayStages() {
    const { width, height } = this.cameras.main;
    const stages = this.stageManager.getStages();
    const startY = height * 0.25;
    const spacing = 110;

    stages.forEach((stage, index) => {
      const y = startY + index * spacing;
      this.createStageCard(width / 2, y, stage);
    });
  }

  private createStageCard(x: number, y: number, stage: Stage) {
    const container = this.add.container(x, y);
    const isLocked = !stage.unlocked;
    const isCleared = this.stageManager.isCleared(stage.id);

    // 卡片背景
    const card = UIHelper.createCard(this, -300, -45, 600, 90);
    container.add(card);

    // 关卡图标
    const iconBg = this.add.graphics();
    const primaryColorNum = Phaser.Display.Color.HexStringToColor(UITheme.colors.primary).color;
    iconBg.fillStyle(isLocked ? 0x333333 : primaryColorNum, isLocked ? 0.3 : 0.6);
    iconBg.fillRoundedRect(-275, -25, 50, 50, 12);
    iconBg.lineStyle(2, isLocked ? 0x666666 : primaryColorNum, 0.8);
    iconBg.strokeRoundedRect(-275, -25, 50, 50, 12);
    container.add(iconBg);

    const iconText = this.add.text(-250, 0, isLocked ? '🔒' : isCleared ? '✓' : stage.level.toString(), {
      fontSize: '22px',
      color: isLocked ? '#888888' : '#FFFFFF',
      fontFamily: UITheme.fonts.title,
      fontStyle: 'bold'
    });
    iconText.setOrigin(0.5);
    container.add(iconText);

    // 关卡名称
    const name = this.add.text(-200, -20, stage.name, {
      fontSize: '22px',
      color: isLocked ? UITheme.colors.textMuted : UITheme.colors.textPrimary,
      fontFamily: UITheme.fonts.title,
      fontStyle: 'bold'
    });
    container.add(name);

    // 关卡描述
    const desc = this.add.text(-200, 10, stage.description, {
      fontSize: '14px',
      color: UITheme.colors.textSecondary,
      fontFamily: UITheme.fonts.body,
      wordWrap: { width: 320 }
    });
    container.add(desc);

    // 奖励信息
    const rewards = this.add.text(140, 0,
      `经验: ${stage.rewards.baseExp}\n金币: ${stage.rewards.baseGold}`, {
      fontSize: '14px',
      color: UITheme.colors.accent,
      fontFamily: UITheme.fonts.body,
      align: 'right',
      lineSpacing: 5
    });
    rewards.setOrigin(1, 0.5);
    container.add(rewards);

    if (!isLocked) {
      // 挑战按钮
      const button = UIHelper.createModernButton(
        this,
        220,
        0,
        '挑战',
        () => this.startStage(stage),
        UITheme.colors.success,
        100,
        40
      );
      container.add(button);

      // 悬停效果
      container.setSize(560, 85);
      container.setInteractive({ useHandCursor: true });

      container.on('pointerover', () => {
        this.tweens.add({
          targets: container,
          scaleX: 1.02,
          scaleY: 1.02,
          duration: 150
        });
      });

      container.on('pointerout', () => {
        this.tweens.add({
          targets: container,
          scaleX: 1,
          scaleY: 1,
          duration: 150
        });
      });
    }
  }

  private startStage(stage: Stage) {
    // 生成敌人
    const enemy = this.stageManager.generateEnemy(stage);

    // 进入战斗
    this.scene.start('CombatScene', {
      stage,
      playerSprite: this.playerTeam[0],
      enemySprite: enemy,
      stageManager: this.stageManager
    });
  }
}

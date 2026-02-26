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
    const title = this.add.text(width / 2, 40, '关卡选择', {
      fontSize: '32px',
      color: UITheme.colors.primary,
      fontFamily: '"Press Start 2P", monospace',
      stroke: '#000000',
      strokeThickness: 4
    });
    title.setOrigin(0.5);

    // 显示关卡列表
    this.displayStages();

    // 返回按钮
    UIHelper.createPixelButton(
      this,
      70,
      30,
      '返回',
      () => this.scene.start('MenuScene'),
      UITheme.colors.danger
    ).setScale(0.6);
  }

  private displayStages() {
    const { width } = this.cameras.main;
    const stages = this.stageManager.getStages();
    const startY = 120;
    const spacing = 100;

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
    const card = UIHelper.createCard(this, -280, -40, 560, 85);
    container.add(card);

    // 关卡图标
    const iconBg = this.add.rectangle(-230, 0, 60, 60, 
      isLocked ? 0x333333 : Phaser.Display.Color.HexStringToColor(UITheme.colors.primary).color, 
      isLocked ? 0.3 : 0.5
    );
    iconBg.setStrokeStyle(2, isLocked ? 0x666666 : Phaser.Display.Color.HexStringToColor(UITheme.colors.primary).color);
    container.add(iconBg);

    const iconText = this.add.text(-230, 0, isLocked ? '🔒' : isCleared ? '✓' : stage.level.toString(), {
      fontSize: isLocked ? '24px' : '20px',
      color: isLocked ? '#666666' : '#FFFFFF',
      fontFamily: '"Press Start 2P", monospace'
    });
    iconText.setOrigin(0.5);
    container.add(iconText);

    // 关卡名称
    const name = this.add.text(-160, -15, stage.name, {
      fontSize: '18px',
      color: isLocked ? UITheme.colors.textMuted : UITheme.colors.textPrimary,
      fontFamily: '"Press Start 2P", monospace'
    });
    container.add(name);

    // 关卡描述
    const desc = this.add.text(-160, 10, stage.description, {
      fontSize: '12px',
      color: UITheme.colors.textSecondary,
      wordWrap: { width: 300 }
    });
    container.add(desc);

    // 奖励信息
    const rewards = this.add.text(180, -10, 
      `经验: ${stage.rewards.baseExp}\n金币: ${stage.rewards.baseGold}`, {
      fontSize: '10px',
      color: UITheme.colors.accent,
      align: 'right'
    });
    rewards.setOrigin(1, 0);
    container.add(rewards);

    if (!isLocked) {
      // 挑战按钮
      const button = UIHelper.createPixelButton(
        this,
        200,
        20,
        '挑战',
        () => this.startStage(stage),
        UITheme.colors.success
      );
      button.setScale(0.5);
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

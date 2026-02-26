import Phaser from 'phaser';
import { Sprite } from '../data/types';
import { BattleSystem } from '../systems/BattleSystem';
import { InventorySystem } from '../systems/InventorySystem';
import { UITheme, UIHelper } from '../ui/UITheme';

export default class CaptureScene extends Phaser.Scene {
  private targetSprite!: Sprite;
  private inventory!: InventorySystem;
  private onCaptureEnd?: (captured: boolean, sprite?: Sprite) => void;

  constructor() {
    super({ key: 'CaptureScene' });
  }

  init(data: {
    targetSprite: Sprite,
    inventory: InventorySystem,
    onCaptureEnd?: (captured: boolean, sprite?: Sprite) => void
  }) {
    this.targetSprite = data.targetSprite;
    this.inventory = data.inventory;
    this.onCaptureEnd = data.onCaptureEnd;
  }

  create() {
    const { width, height } = this.cameras.main;

    // 半透明背景
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85);

    // 标题
    const title = this.add.text(width / 2, 60, '捕捉精灵', {
      fontSize: '28px',
      color: UITheme.colors.accent,
      fontFamily: '"Press Start 2P", monospace',
      stroke: '#000000',
      strokeThickness: 4
    });
    title.setOrigin(0.5);

    // 精灵信息卡片
    this.displaySpriteInfo();

    // 精灵球选择
    this.displayPokeBalls();

    // 取消按钮
    UIHelper.createPixelButton(
      this,
      width / 2,
      height - 60,
      '取消',
      () => {
        if (this.onCaptureEnd) {
          this.onCaptureEnd(false);
        }
        this.scene.stop();
      },
      UITheme.colors.textMuted
    );
  }

  private displaySpriteInfo() {
    const { width, height } = this.cameras.main;
    const y = height * 0.3;

    // 信息卡片
    const card = UIHelper.createCard(this, width / 2 - 180, y - 100, 360, 200);

    // 精灵图标
    const icon = this.add.rectangle(width / 2, y - 30, 80, 80, 
      Phaser.Display.Color.HexStringToColor(UIHelper.getElementColor(this.targetSprite.element)).color, 0.3);
    icon.setStrokeStyle(3, Phaser.Display.Color.HexStringToColor(UIHelper.getElementColor(this.targetSprite.element)).color);

    // 精灵名称
    const name = this.add.text(width / 2, y + 60, this.targetSprite.name, {
      fontSize: '20px',
      color: UIHelper.getElementColor(this.targetSprite.element),
      fontFamily: '"Press Start 2P", monospace'
    });
    name.setOrigin(0.5);

    // 精灵属性
    const details = this.add.text(width / 2, y + 90, 
      `Lv.${this.targetSprite.level} | ${this.targetSprite.element}`, {
      fontSize: '14px',
      color: UITheme.colors.textSecondary
    });
    details.setOrigin(0.5);

    // HP 条
    const hpRatio = this.targetSprite.stats.hp / this.targetSprite.stats.maxHP;
    const hpBar = UIHelper.createProgressBar(
      this,
      width / 2 - 80,
      y + 120,
      160,
      12,
      this.targetSprite.stats.hp,
      this.targetSprite.stats.maxHP,
      hpRatio > 0.5 ? UITheme.colors.success : hpRatio > 0.2 ? UITheme.colors.warning : UITheme.colors.danger
    );

    // HP 文字
    const hpText = this.add.text(width / 2, y + 135, 
      `HP: ${this.targetSprite.stats.hp}/${this.targetSprite.stats.maxHP}`, {
      fontSize: '12px',
      color: UITheme.colors.textPrimary
    });
    hpText.setOrigin(0.5);

    // 捕捉成功率
    const captureRate = (1 - hpRatio) * 0.3;
    const rateText = this.add.text(width / 2, y + 155, 
      `捕捉成功率: ${Math.floor(captureRate * 100)}%`, {
      fontSize: '12px',
      color: UITheme.colors.accent
    });
    rateText.setOrigin(0.5);
  }

  private displayPokeBalls() {
    const { width, height } = this.cameras.main;
    const startY = height * 0.65;

    const ballsTitle = this.add.text(width / 2, startY - 30, '选择精灵球', {
      fontSize: '14px',
      color: UITheme.colors.textSecondary
    });
    ballsTitle.setOrigin(0.5);

    const balls = [
      { id: 'poke_ball', name: '精灵球', multiplier: 1.0, color: '#FF6B6B' },
      { id: 'great_ball', name: '高级球', multiplier: 1.5, color: '#4ECDC4' }
    ];

    balls.forEach((ball, index) => {
      const x = width / 2 - 120 + index * 240;
      const y = startY + 40;

      this.createBallButton(x, y, ball);
    });
  }

  private createBallButton(x: number, y: number, ball: any) {
    const item = this.inventory.getItems().find(i => i.id === ball.id);
    const quantity = item ? item.quantity : 0;
    const canUse = quantity > 0;

    const container = this.add.container(x, y);

    // 背景
    const bg = this.add.rectangle(0, 0, 180, 100, 
      Phaser.Display.Color.HexStringToColor(canUse ? ball.color : '#333333').color, canUse ? 0.3 : 0.1);
    bg.setStrokeStyle(3, Phaser.Display.Color.HexStringToColor(ball.color).color, canUse ? 1 : 0.3);

    // 球图标
    const icon = this.add.circle(0, -20, 20, 
      Phaser.Display.Color.HexStringToColor(ball.color).color, canUse ? 0.8 : 0.3);

    // 名称
    const name = this.add.text(0, 10, ball.name, {
      fontSize: '14px',
      color: canUse ? UITheme.colors.textPrimary : UITheme.colors.textMuted,
      fontFamily: '"Press Start 2P", monospace'
    });
    name.setOrigin(0.5);

    // 数量
    const qtyText = this.add.text(0, 30, `x${quantity}`, {
      fontSize: '12px',
      color: canUse ? UITheme.colors.accent : UITheme.colors.textMuted
    });
    qtyText.setOrigin(0.5);

    // 成功率
    const rateText = this.add.text(0, 45, `成功率 x${ball.multiplier}`, {
      fontSize: '10px',
      color: UITheme.colors.textSecondary
    });
    rateText.setOrigin(0.5);

    container.add([bg, icon, name, qtyText, rateText]);
    container.setSize(180, 100);

    if (canUse) {
      container.setInteractive({ useHandCursor: true });

      container.on('pointerover', () => {
        this.tweens.add({
          targets: container,
          scaleX: 1.1,
          scaleY: 1.1,
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

      container.on('pointerdown', () => {
        this.attemptCapture(ball.id, ball.multiplier);
      });
    }
  }

  private attemptCapture(ballId: string, multiplier: number) {
    this.inventory.useItem(ballId);
    const success = BattleSystem.attemptCapture(this.targetSprite, multiplier);
    this.showCaptureResult(success);
  }

  private showCaptureResult(success: boolean) {
    const { width, height } = this.cameras.main;

    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.95);
    overlay.setInteractive();

    if (success) {
      const successText = this.add.text(width / 2, height / 2 - 50, '✓ 捕捉成功！', {
        fontSize: '36px',
        color: UITheme.colors.success,
        fontFamily: '"Press Start 2P", monospace',
        stroke: '#000000',
        strokeThickness: 4
      });
      successText.setOrigin(0.5);
      successText.setAlpha(0);

      this.tweens.add({
        targets: successText,
        alpha: 1,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 500,
        ease: 'Back.easeOut'
      });

      const message = this.add.text(width / 2, height / 2 + 20, 
        `${this.targetSprite.name} 已加入队伍！`, {
        fontSize: '18px',
        color: UITheme.colors.textPrimary
      });
      message.setOrigin(0.5);

      this.inventory.addSprite(this.targetSprite);
    } else {
      const failText = this.add.text(width / 2, height / 2 - 50, '✗ 捕捉失败', {
        fontSize: '36px',
        color: UITheme.colors.danger,
        fontFamily: '"Press Start 2P", monospace',
        stroke: '#000000',
        strokeThickness: 4
      });
      failText.setOrigin(0.5);

      const message = this.add.text(width / 2, height / 2 + 20, 
        `${this.targetSprite.name} 挣脱了！`, {
        fontSize: '18px',
        color: UITheme.colors.textPrimary
      });
      message.setOrigin(0.5);
    }

    this.time.delayedCall(2000, () => {
      if (this.onCaptureEnd) {
        this.onCaptureEnd(success, success ? this.targetSprite : undefined);
      }
      this.scene.stop();
    });
  }
}

import Phaser from 'phaser';
import { Sprite } from '../data/types';
import { BattleSystem } from '../systems/BattleSystem';
import { InventorySystem, ITEMS } from '../systems/InventorySystem';

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

    // 背景
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);

    // 标题
    this.add.text(width / 2, 80, '捕捉精灵', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 精灵信息
    this.displaySpriteInfo();

    // 精灵球选择
    this.displayPokeBalls();

    // 取消按钮
    const cancelButton = this.add.text(width / 2, height - 60, '取消', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#666666',
      padding: { x: 20, y: 10 }
    });
    cancelButton.setOrigin(0.5);
    cancelButton.setInteractive({ useHandCursor: true });

    cancelButton.on('pointerdown', () => {
      if (this.onCaptureEnd) {
        this.onCaptureEnd(false);
      }
      this.scene.stop();
    });
  }

  private displaySpriteInfo() {
    const { width, height } = this.cameras.main;
    const y = height * 0.3;

    // 精灵图标
    this.add.rectangle(width / 2, y, 100, 100, 0x444444);

    // 精灵名称
    this.add.text(width / 2, y + 70, this.targetSprite.name, {
      fontSize: '24px',
      color: '#ffaa00'
    }).setOrigin(0.5);

    // 精灵属性
    this.add.text(width / 2, y + 100, 
      `Lv.${this.targetSprite.level} | ${this.targetSprite.element}`, {
      fontSize: '16px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // HP 条
    const hpRatio = this.targetSprite.stats.hp / this.targetSprite.stats.maxHP;
    this.add.text(width / 2, y + 130, 
      `HP: ${this.targetSprite.stats.hp}/${this.targetSprite.stats.maxHP}`, {
      fontSize: '14px',
      color: hpRatio > 0.5 ? '#00ff00' : hpRatio > 0.2 ? '#ffaa00' : '#ff0000'
    }).setOrigin(0.5);

    // 捕捉成功率提示
    const captureRate = (1 - hpRatio) * 0.3;
    this.add.text(width / 2, y + 160, 
      `捕捉成功率: ${Math.floor(captureRate * 100)}%`, {
      fontSize: '14px',
      color: '#aaaaaa'
    }).setOrigin(0.5);
  }

  private displayPokeBalls() {
    const { width, height } = this.cameras.main;
    const startY = height * 0.6;

    const balls = [
      { id: 'poke_ball', name: '精灵球', multiplier: 1.0, color: 0xff6666 },
      { id: 'great_ball', name: '高级球', multiplier: 1.5, color: 0x6666ff }
    ];

    balls.forEach((ball, index) => {
      const x = width / 2 - 100 + index * 200;
      const y = startY;

      // 检查是否有这个球
      const item = this.inventory.getItems().find(i => i.id === ball.id);
      const quantity = item ? item.quantity : 0;

      const button = this.add.rectangle(x, y, 150, 80, ball.color);
      button.setInteractive({ useHandCursor: quantity > 0 });

      const nameText = this.add.text(x, y - 15, ball.name, {
        fontSize: '18px',
        color: '#ffffff'
      }).setOrigin(0.5);

      const quantityText = this.add.text(x, y + 10, `x${quantity}`, {
        fontSize: '16px',
        color: quantity > 0 ? '#ffffff' : '#666666'
      }).setOrigin(0.5);

      const rateText = this.add.text(x, y + 30, `成功率 x${ball.multiplier}`, {
        fontSize: '12px',
        color: '#aaaaaa'
      }).setOrigin(0.5);

      if (quantity > 0) {
        button.on('pointerover', () => {
          button.setFillStyle(ball.color, 0.8);
        });

        button.on('pointerout', () => {
          button.setFillStyle(ball.color);
        });

        button.on('pointerdown', () => {
          this.attemptCapture(ball.id, ball.multiplier);
        });
      } else {
        button.setAlpha(0.5);
        nameText.setAlpha(0.5);
        quantityText.setAlpha(0.5);
        rateText.setAlpha(0.5);
      }
    });
  }

  private attemptCapture(ballId: string, multiplier: number) {
    // 使用精灵球
    this.inventory.useItem(ballId);

    // 尝试捕捉
    const success = BattleSystem.attemptCapture(this.targetSprite, multiplier);

    // 显示结果
    this.showCaptureResult(success);
  }

  private showCaptureResult(success: boolean) {
    const { width, height } = this.cameras.main;

    // 半透明遮罩
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.9);

    if (success) {
      // 成功
      this.add.text(width / 2, height / 2 - 50, '✓ 捕捉成功！', {
        fontSize: '36px',
        color: '#00ff00',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      this.add.text(width / 2, height / 2 + 20, `${this.targetSprite.name} 已加入队伍！`, {
        fontSize: '20px',
        color: '#ffffff'
      }).setOrigin(0.5);

      // 添加到背包
      this.inventory.addSprite(this.targetSprite);
    } else {
      // 失败
      this.add.text(width / 2, height / 2 - 50, '✗ 捕捉失败', {
        fontSize: '36px',
        color: '#ff0000',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      this.add.text(width / 2, height / 2 + 20, `${this.targetSprite.name} 挣脱了！`, {
        fontSize: '20px',
        color: '#ffffff'
      }).setOrigin(0.5);
    }

    // 2秒后关闭
    this.time.delayedCall(2000, () => {
      if (this.onCaptureEnd) {
        this.onCaptureEnd(success, success ? this.targetSprite : undefined);
      }
      this.scene.stop();
    });
  }
}

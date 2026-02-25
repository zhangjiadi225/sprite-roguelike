import Phaser from 'phaser';
import { Sprite } from '../data/types';
import { getAllBaseSprites } from '../data/baseSprites';
import { fuseSprites } from '../systems/FusionSystem';

export default class FusionDemoScene extends Phaser.Scene {
  private sprites: Sprite[] = [];
  private selectedSprites: Sprite[] = [];
  private spriteTexts: Phaser.GameObjects.Text[] = [];

  constructor() {
    super({ key: 'FusionDemoScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // 标题
    this.add.text(width / 2, 30, '精灵融合演示', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 说明
    this.add.text(width / 2, 70, '点击选择两只精灵进行融合', {
      fontSize: '16px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // 加载基础精灵
    this.sprites = getAllBaseSprites();

    // 显示精灵列表
    this.displaySprites();

    // 返回按钮
    const backButton = this.add.text(20, 20, '返回菜单', {
      fontSize: '18px',
      color: '#ff0000',
      backgroundColor: '#333333',
      padding: { x: 10, y: 5 }
    });
    backButton.setInteractive({ useHandCursor: true });
    backButton.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });
  }

  private displaySprites() {
    const { width } = this.cameras.main;
    const startY = 120;
    const spacing = 80;

    this.sprites.forEach((sprite, index) => {
      const y = startY + index * spacing;

      // 精灵信息容器
      const container = this.add.container(width / 2 - 200, y);

      // 背景
      const bg = this.add.rectangle(0, 0, 400, 70, 0x333333);
      bg.setInteractive({ useHandCursor: true });
      container.add(bg);

      // 精灵名称和属性
      const nameText = this.add.text(-180, -20, `${sprite.name} (${sprite.element})`, {
        fontSize: '20px',
        color: this.getElementColor(sprite.element)
      });
      container.add(nameText);

      // 精灵属性
      const statsText = this.add.text(-180, 5, 
        `Lv.${sprite.level} | HP:${sprite.stats.maxHP} ATK:${sprite.stats.atk} DEF:${sprite.stats.def} SPD:${sprite.stats.spd}`, {
        fontSize: '14px',
        color: '#cccccc'
      });
      container.add(statsText);

      // 点击事件
      bg.on('pointerdown', () => {
        this.selectSprite(sprite, bg);
      });

      bg.on('pointerover', () => {
        bg.setFillStyle(0x444444);
      });

      bg.on('pointerout', () => {
        const isSelected = this.selectedSprites.includes(sprite);
        bg.setFillStyle(isSelected ? 0x00ff00 : 0x333333);
      });
    });
  }

  private selectSprite(sprite: Sprite, bg: Phaser.GameObjects.Rectangle) {
    if (this.selectedSprites.includes(sprite)) {
      // 取消选择
      this.selectedSprites = this.selectedSprites.filter(s => s !== sprite);
      bg.setFillStyle(0x333333);
    } else {
      if (this.selectedSprites.length < 2) {
        // 选择
        this.selectedSprites.push(sprite);
        bg.setFillStyle(0x00ff00);

        // 如果选择了2只，显示融合按钮
        if (this.selectedSprites.length === 2) {
          this.showFuseButton();
        }
      }
    }
  }

  private showFuseButton() {
    const { width, height } = this.cameras.main;

    // 融合按钮
    const fuseButton = this.add.text(width / 2, height - 50, '🔥 融合！', {
      fontSize: '28px',
      color: '#ffff00',
      backgroundColor: '#ff6600',
      padding: { x: 30, y: 10 }
    });
    fuseButton.setOrigin(0.5);
    fuseButton.setInteractive({ useHandCursor: true });

    fuseButton.on('pointerover', () => {
      fuseButton.setScale(1.1);
    });

    fuseButton.on('pointerout', () => {
      fuseButton.setScale(1);
    });

    fuseButton.on('pointerdown', () => {
      this.performFusion();
      fuseButton.destroy();
    });
  }

  private performFusion() {
    if (this.selectedSprites.length !== 2) return;

    const [spriteA, spriteB] = this.selectedSprites;
    const fusedSprite = fuseSprites(spriteA, spriteB);

    // 显示融合结果
    this.showFusionResult(fusedSprite);
  }

  private showFusionResult(sprite: Sprite) {
    const { width, height } = this.cameras.main;

    // 半透明背景
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);
    overlay.setInteractive();

    // 结果容器
    const resultBg = this.add.rectangle(width / 2, height / 2, 500, 400, 0x222222);
    resultBg.setStrokeStyle(4, 0xffff00);

    // 标题
    this.add.text(width / 2, height / 2 - 150, '✨ 融合成功！', {
      fontSize: '32px',
      color: '#ffff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 新精灵信息
    const infoY = height / 2 - 80;
    this.add.text(width / 2, infoY, `名称: ${sprite.name}`, {
      fontSize: '24px',
      color: this.getElementColor(sprite.element)
    }).setOrigin(0.5);

    this.add.text(width / 2, infoY + 40, `属性: ${sprite.element} | 等级: ${sprite.level}`, {
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(width / 2, infoY + 70, 
      `HP: ${sprite.stats.maxHP} | ATK: ${sprite.stats.atk} | DEF: ${sprite.stats.def} | SPD: ${sprite.stats.spd}`, {
      fontSize: '16px',
      color: '#cccccc'
    }).setOrigin(0.5);

    this.add.text(width / 2, infoY + 100, 
      `成长值: ${sprite.stats.growthValue.toFixed(1)} | 融合次数: ${sprite.fusionCount}`, {
      fontSize: '16px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // 技能列表
    this.add.text(width / 2, infoY + 130, '技能:', {
      fontSize: '18px',
      color: '#ffaa00'
    }).setOrigin(0.5);

    sprite.skills.forEach((skill, index) => {
      const skillText = `${skill.name} (${skill.power}) ${skill.isSignature ? '⭐' : ''}`;
      this.add.text(width / 2, infoY + 160 + index * 25, skillText, {
        fontSize: '14px',
        color: '#ffffff'
      }).setOrigin(0.5);
    });

    // 关闭按钮
    const closeButton = this.add.text(width / 2, height / 2 + 160, '关闭', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#666666',
      padding: { x: 20, y: 8 }
    });
    closeButton.setOrigin(0.5);
    closeButton.setInteractive({ useHandCursor: true });

    closeButton.on('pointerdown', () => {
      overlay.destroy();
      resultBg.destroy();
      closeButton.destroy();
      
      // 重置选择
      this.selectedSprites = [];
      this.scene.restart();
    });
  }

  private getElementColor(element: string): string {
    const colors: Record<string, string> = {
      fire: '#ff6600',
      electric: '#ffff00',
      poison: '#9933ff',
      ice: '#00ccff',
      void: '#6633cc'
    };
    return colors[element] || '#ffffff';
  }
}

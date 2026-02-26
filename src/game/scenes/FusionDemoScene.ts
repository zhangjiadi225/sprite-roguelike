import Phaser from 'phaser';
import { Sprite } from '../data/types';
import { getAllBaseSprites } from '../data/baseSprites';
import { fuseSprites } from '../systems/FusionSystem';
import { UITheme, UIHelper } from '../ui/UITheme';

export default class FusionDemoScene extends Phaser.Scene {
  private sprites: Sprite[] = [];
  private selectedSprites: Sprite[] = [];
  private spriteCards: Phaser.GameObjects.Container[] = [];

  constructor() {
    super({ key: 'FusionDemoScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // 渐变背景
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(
      Phaser.Display.Color.HexStringToColor('#667eea').color,
      Phaser.Display.Color.HexStringToColor('#764ba2').color,
      Phaser.Display.Color.HexStringToColor('#f093fb').color,
      Phaser.Display.Color.HexStringToColor('#4facfe').color,
      1
    );
    graphics.fillRect(0, 0, width, height);

    // 标题
    const title = this.add.text(width / 2, 40, '精灵融合演示', {
      fontSize: '32px',
      color: '#FFFFFF',
      fontFamily: '"Press Start 2P", monospace',
      stroke: '#000000',
      strokeThickness: 4
    });
    title.setOrigin(0.5);

    // 说明
    const info = this.add.text(width / 2, 85, '选择两只精灵进行融合', {
      fontSize: '14px',
      color: UITheme.colors.textSecondary
    });
    info.setOrigin(0.5);

    // 加载基础精灵
    this.sprites = getAllBaseSprites();

    // 显示精灵列表
    this.displaySprites();

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

  private displaySprites() {
    const { width } = this.cameras.main;
    const startY = 130;
    const spacing = 90;

    this.sprites.forEach((sprite, index) => {
      const y = startY + index * spacing;
      const card = this.createSpriteCard(width / 2, y, sprite);
      this.spriteCards.push(card);
    });
  }

  private createSpriteCard(x: number, y: number, sprite: Sprite): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    // 卡片背景
    const bg = this.add.rectangle(0, 0, 500, 80, 
      Phaser.Display.Color.HexStringToColor(UITheme.colors.bgCard).color, 0.9);
    bg.setStrokeStyle(3, Phaser.Display.Color.HexStringToColor(UIHelper.getElementColor(sprite.element)).color);

    // 精灵图标
    const icon = this.add.rectangle(-200, 0, 60, 60, 
      Phaser.Display.Color.HexStringToColor(UIHelper.getElementColor(sprite.element)).color, 0.3);
    icon.setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(UIHelper.getElementColor(sprite.element)).color);

    // 精灵名称
    const name = this.add.text(-150, -20, sprite.name, {
      fontSize: '18px',
      color: UIHelper.getElementColor(sprite.element),
      fontFamily: '"Press Start 2P", monospace'
    });

    // 精灵属性
    const stats = this.add.text(-150, 5, 
      `Lv.${sprite.level} | ${sprite.element}`, {
      fontSize: '12px',
      color: UITheme.colors.textSecondary
    });

    // 精灵数值
    const values = this.add.text(-150, 25, 
      `HP:${sprite.stats.maxHP} ATK:${sprite.stats.atk} DEF:${sprite.stats.def} SPD:${sprite.stats.spd}`, {
      fontSize: '10px',
      color: UITheme.colors.textMuted
    });

    container.add([bg, icon, name, stats, values]);
    container.setSize(500, 80);
    container.setInteractive({ useHandCursor: true });

    // 交互效果
    container.on('pointerover', () => {
      this.tweens.add({
        targets: container,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 150
      });
      bg.setFillStyle(Phaser.Display.Color.HexStringToColor(UITheme.colors.bgCard).color, 1);
    });

    container.on('pointerout', () => {
      const isSelected = this.selectedSprites.includes(sprite);
      this.tweens.add({
        targets: container,
        scaleX: 1,
        scaleY: 1,
        duration: 150
      });
      if (!isSelected) {
        bg.setFillStyle(Phaser.Display.Color.HexStringToColor(UITheme.colors.bgCard).color, 0.9);
      }
    });

    container.on('pointerdown', () => {
      this.selectSprite(sprite, bg);
    });

    return container;
  }

  private selectSprite(sprite: Sprite, bg: Phaser.GameObjects.Rectangle) {
    if (this.selectedSprites.includes(sprite)) {
      // 取消选择
      this.selectedSprites = this.selectedSprites.filter(s => s !== sprite);
      bg.setStrokeStyle(3, Phaser.Display.Color.HexStringToColor(UIHelper.getElementColor(sprite.element)).color);
    } else {
      if (this.selectedSprites.length < 2) {
        // 选择
        this.selectedSprites.push(sprite);
        bg.setStrokeStyle(4, Phaser.Display.Color.HexStringToColor(UITheme.colors.accent).color);

        // 如果选择了2只，显示融合按钮
        if (this.selectedSprites.length === 2) {
          this.showFuseButton();
        }
      }
    }
  }

  private showFuseButton() {
    const { width, height } = this.cameras.main;

    const fuseButton = UIHelper.createPixelButton(
      this,
      width / 2,
      height - 50,
      '🔥 融合！',
      () => this.performFusion(),
      UITheme.colors.primary
    );

    // 脉冲动画
    this.tweens.add({
      targets: fuseButton,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 500,
      yoyo: true,
      repeat: -1
    });
  }

  private performFusion() {
    if (this.selectedSprites.length !== 2) return;

    const [spriteA, spriteB] = this.selectedSprites;
    const fusedSprite = fuseSprites(spriteA, spriteB);

    this.showFusionResult(fusedSprite);
  }

  private showFusionResult(sprite: Sprite) {
    const { width, height } = this.cameras.main;

    // 半透明遮罩
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.9);
    overlay.setInteractive();

    // 结果卡片
    const resultCard = UIHelper.createCard(this, width / 2 - 250, height / 2 - 200, 500, 400);

    // 成功标题
    const successTitle = this.add.text(width / 2, height / 2 - 150, '✨ 融合成功！', {
      fontSize: '36px',
      color: UITheme.colors.accent,
      fontFamily: '"Press Start 2P", monospace',
      stroke: '#000000',
      strokeThickness: 4
    });
    successTitle.setOrigin(0.5);
    successTitle.setAlpha(0);

    // 标题动画
    this.tweens.add({
      targets: successTitle,
      alpha: 1,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 500,
      ease: 'Back.easeOut'
    });

    // 精灵信息
    const infoY = height / 2 - 80;
    
    const name = this.add.text(width / 2, infoY, sprite.name, {
      fontSize: '24px',
      color: UIHelper.getElementColor(sprite.element),
      fontFamily: '"Press Start 2P", monospace'
    });
    name.setOrigin(0.5);

    const details = this.add.text(width / 2, infoY + 40, 
      `${sprite.element} | Lv.${sprite.level}`, {
      fontSize: '16px',
      color: UITheme.colors.textPrimary
    });
    details.setOrigin(0.5);

    const stats = this.add.text(width / 2, infoY + 70, 
      `HP: ${sprite.stats.maxHP} | ATK: ${sprite.stats.atk} | DEF: ${sprite.stats.def} | SPD: ${sprite.stats.spd}`, {
      fontSize: '14px',
      color: UITheme.colors.textSecondary
    });
    stats.setOrigin(0.5);

    const growth = this.add.text(width / 2, infoY + 100, 
      `成长值: ${sprite.stats.growthValue.toFixed(1)} | 融合次数: ${sprite.fusionCount}`, {
      fontSize: '12px',
      color: UITheme.colors.textMuted
    });
    growth.setOrigin(0.5);

    // 技能列表
    const skillsTitle = this.add.text(width / 2, infoY + 130, '技能:', {
      fontSize: '16px',
      color: UITheme.colors.accent
    });
    skillsTitle.setOrigin(0.5);

    sprite.skills.forEach((skill, index) => {
      const skillText = `${skill.name} (${skill.power}) ${skill.isSignature ? '⭐' : ''}`;
      const skillLabel = this.add.text(width / 2, infoY + 160 + index * 25, skillText, {
        fontSize: '12px',
        color: UITheme.colors.textPrimary
      });
      skillLabel.setOrigin(0.5);
    });

    // 关闭按钮
    const closeButton = UIHelper.createPixelButton(
      this,
      width / 2,
      height / 2 + 160,
      '关闭',
      () => {
        overlay.destroy();
        this.selectedSprites = [];
        this.scene.restart();
      },
      UITheme.colors.secondary
    );
  }
}

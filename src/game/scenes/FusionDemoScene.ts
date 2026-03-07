import Phaser from 'phaser';
import { Sprite } from '../data/types';
import { getAllBaseSprites } from '../data/baseSprites';
import { fuseSprites } from '../systems/FusionSystem';
import { UITheme, UIHelper } from '../ui/UITheme';
import { SpriteRenderer } from '../systems/SpriteRenderer';

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
    const title = this.add.text(width / 2, 60, '精灵融合', {
      fontSize: '42px',
      color: UITheme.colors.primary,
      fontFamily: UITheme.fonts.title,
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);
    title.setShadow(0, 4, '#000000', 10, true, true);

    // 说明
    const info = this.add.text(width / 2, 110, '选择两只精灵进行进化', {
      fontSize: '16px',
      color: UITheme.colors.textSecondary,
      fontFamily: UITheme.fonts.body,
      letterSpacing: 2
    });
    info.setOrigin(0.5);

    // 加载基础精灵
    this.sprites = getAllBaseSprites();

    // 显示精灵列表
    this.displaySprites();

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

  private displaySprites() {
    const { width } = this.cameras.main;
    const startY = 180;
    const spacing = 110;

    this.sprites.forEach((sprite, index) => {
      const y = startY + index * spacing;
      const card = this.createSpriteCard(width / 2, y, sprite);
      this.spriteCards.push(card);
    });
  }

  private createSpriteCard(x: number, y: number, sprite: Sprite): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    // 卡片背景
    const bg = this.add.graphics();
    bg.fillStyle(Phaser.Display.Color.HexStringToColor(UITheme.colors.bgCard).color, UITheme.alphas.cardBg);
    bg.fillRoundedRect(-250, -45, 500, 90, 16);
    bg.lineStyle(2, Phaser.Display.Color.HexStringToColor(UITheme.colors.bgLight).color, 0.5);
    bg.strokeRoundedRect(-250, -45, 500, 90, 16);

    // 精灵真实贴图
    const spriteImage = SpriteRenderer.render(this, -180, 0, sprite, 0.7);

    // 精灵名称
    const name = this.add.text(-120, -25, sprite.name, {
      fontSize: '22px',
      color: UIHelper.getElementColor(sprite.element),
      fontFamily: UITheme.fonts.title,
      fontStyle: 'bold'
    });

    // 精灵元素标签
    const stats = this.add.text(-120, 5,
      `等级 ${sprite.level} | 属性 ${sprite.element.toUpperCase()}`, {
      fontSize: '14px',
      color: UITheme.colors.textSecondary,
      fontFamily: UITheme.fonts.body
    });

    // 精灵数值
    const values = this.add.text(-120, 25,
      `HP:${sprite.stats.maxHP}  ATK:${sprite.stats.atk}  DEF:${sprite.stats.def}  SPD:${sprite.stats.spd}`, {
      fontSize: '12px',
      color: UITheme.colors.textMuted,
      fontFamily: UITheme.fonts.body
    });

    // 交互区域热区
    const hitArea = this.add.rectangle(0, 0, 500, 90, 0x000000, 0);

    container.add([bg, spriteImage, name, stats, values, hitArea]);
    container.setSize(500, 90);
    hitArea.setInteractive({ useHandCursor: true });

    // 交互效果
    hitArea.on('pointerover', () => {
      this.tweens.add({
        targets: container,
        scaleX: 1.03,
        scaleY: 1.03,
        duration: 200,
        ease: 'Sine.easeOut'
      });
      // 加亮底框与边框
      bg.clear();
      bg.fillStyle(Phaser.Display.Color.HexStringToColor(UITheme.colors.bgCard).color, 0.85);
      bg.fillRoundedRect(-250, -45, 500, 90, 16);

      const borderColor = this.selectedSprites.includes(sprite)
        ? Phaser.Display.Color.HexStringToColor(UITheme.colors.accent).color
        : Phaser.Display.Color.HexStringToColor(UIHelper.getElementColor(sprite.element)).color;

      bg.lineStyle(2, borderColor, 0.9);
      bg.strokeRoundedRect(-250, -45, 500, 90, 16);
    });

    hitArea.on('pointerout', () => {
      this.tweens.add({
        targets: container,
        scaleX: 1,
        scaleY: 1,
        duration: 200,
        ease: 'Sine.easeOut'
      });
      this.updateCardBg(sprite, bg);
    });

    hitArea.on('pointerdown', () => {
      this.selectSprite(sprite, bg);
    });

    return container;
  }

  // 辅助更新卡牌边框高亮
  private updateCardBg(sprite: Sprite, bg: Phaser.GameObjects.Graphics) {
    const isSelected = this.selectedSprites.includes(sprite);
    bg.clear();
    bg.fillStyle(Phaser.Display.Color.HexStringToColor(UITheme.colors.bgCard).color, UITheme.alphas.cardBg);
    bg.fillRoundedRect(-250, -45, 500, 90, 16);

    if (isSelected) {
      bg.lineStyle(3, Phaser.Display.Color.HexStringToColor(UITheme.colors.accent).color, 1);
    } else {
      bg.lineStyle(2, Phaser.Display.Color.HexStringToColor(UITheme.colors.bgLight).color, 0.5);
    }
    bg.strokeRoundedRect(-250, -45, 500, 90, 16);
  }

  private selectSprite(sprite: Sprite, bg: Phaser.GameObjects.Graphics) {
    if (this.selectedSprites.includes(sprite)) {
      // 取消选择
      this.selectedSprites = this.selectedSprites.filter(s => s !== sprite);
      this.updateCardBg(sprite, bg);
    } else {
      if (this.selectedSprites.length < 2) {
        // 选择
        this.selectedSprites.push(sprite);
        this.updateCardBg(sprite, bg);

        // 如果选择了2只，显示融合按钮
        if (this.selectedSprites.length === 2) {
          this.showFuseButton();
        }
      }
    }
  }

  private showFuseButton() {
    const { width, height } = this.cameras.main;

    const fuseButton = UIHelper.createModernButton(
      this,
      width / 2,
      height - 80,
      '点击融合',
      () => this.performFusion(),
      UITheme.colors.primary,
      200,
      50
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

    // 结果卡片 (更大的圆角、半透明)
    const resultCard = UIHelper.createCard(this, width / 2 - 280, height / 2 - 250, 560, 500);

    // 成功标题
    const successTitle = this.add.text(width / 2, height / 2 - 200, '✨ 融合成功', {
      fontSize: '42px',
      color: UITheme.colors.accent,
      fontFamily: UITheme.fonts.title,
      fontStyle: 'bold'
    });
    successTitle.setOrigin(0.5);
    successTitle.setAlpha(0);
    successTitle.setShadow(0, 4, '#000000', 8, true, true);

    // 标题动画
    this.tweens.add({
      targets: successTitle,
      alpha: 1,
      scaleX: 1.1,
      scaleY: 1.1,
      y: '+=10',
      duration: 600,
      ease: 'Back.easeOut'
    });

    // 融合结果真实贴图显示 (更大一点)
    const resultSprite = SpriteRenderer.render(this, width / 2, height / 2 - 40, sprite, 1.8);

    // 精灵信息
    const infoY = height / 2 + 70;

    const name = this.add.text(width / 2, infoY, sprite.name, {
      fontSize: '32px',
      color: UIHelper.getElementColor(sprite.element),
      fontFamily: UITheme.fonts.title,
      fontStyle: 'bold'
    });
    name.setOrigin(0.5);

    const details = this.add.text(width / 2, infoY + 40,
      `Lv.${sprite.level} | 属性: ${sprite.element}`, {
      fontSize: '16px',
      color: UITheme.colors.textPrimary,
      fontFamily: UITheme.fonts.body
    });
    details.setOrigin(0.5);

    const stats = this.add.text(width / 2, infoY + 70,
      `HP: ${sprite.stats.maxHP} | ATK: ${sprite.stats.atk} | DEF: ${sprite.stats.def} | SPD: ${sprite.stats.spd}`, {
      fontSize: '14px',
      color: UITheme.colors.textSecondary,
      fontFamily: UITheme.fonts.body
    });
    stats.setOrigin(0.5);

    // 技能列表
    const skillsTitle = this.add.text(width / 2, infoY + 110, '一 技能列表 一', {
      fontSize: '16px',
      color: UITheme.colors.accent,
      fontFamily: UITheme.fonts.title
    });
    skillsTitle.setOrigin(0.5);

    sprite.skills.forEach((skill, index) => {
      const skillText = `${skill.name} (${skill.power}) ${skill.isSignature ? '⭐' : ''}`;
      const skillLabel = this.add.text(width / 2, infoY + 140 + index * 25, skillText, {
        fontSize: '14px',
        color: UITheme.colors.textPrimary,
        fontFamily: UITheme.fonts.body
      });
      skillLabel.setOrigin(0.5);
    });

    // 关闭按钮
    const closeButton = UIHelper.createModernButton(
      this,
      width / 2,
      height / 2 + 300,
      '关闭',
      () => {
        overlay.destroy();
        resultCard.destroy();
        successTitle.destroy();
        resultSprite.destroy();
        name.destroy();
        details.destroy();
        stats.destroy();
        skillsTitle.destroy();
        this.selectedSprites = [];
        this.scene.restart();
      },
      UITheme.colors.secondary,
      140,
      44
    );
  }
}

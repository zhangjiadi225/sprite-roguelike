import Phaser from 'phaser';
import { UITheme, UIHelper } from '../ui/UITheme';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // 渐变背景
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(
      Phaser.Display.Color.HexStringToColor('#1a1a2e').color,
      Phaser.Display.Color.HexStringToColor('#1a1a2e').color,
      Phaser.Display.Color.HexStringToColor('#16213e').color,
      Phaser.Display.Color.HexStringToColor('#16213e').color,
      1
    );
    graphics.fillRect(0, 0, width, height);

    // 添加像素风格装饰
    this.addDecorations();

    // 标题容器
    const titleContainer = this.add.container(width / 2, height * 0.35);

    // 现代发光标题阴影
    const titleShadow = this.add.text(0, 4, '精灵肉鸽', {
      fontSize: '64px',
      color: '#000000',
      fontFamily: UITheme.fonts.title,
      fontStyle: 'bold'
    });
    titleShadow.setOrigin(0.5);
    titleShadow.setAlpha(0.5);
    titleShadow.setShadow(0, 10, '#000000', 20, true, true);

    // 现代精简标题文字
    const title = this.add.text(0, 0, '精灵肉鸽', {
      fontSize: '64px',
      color: UITheme.colors.primary,
      fontFamily: UITheme.fonts.title,
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    titleContainer.add([titleShadow, title]);

    // 标题动画
    this.tweens.add({
      targets: titleContainer,
      y: height / 3 - 10,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 按钮容器
    const buttonY = height * 0.6;
    const buttonSpacing = 65;

    // 开始游戏按钮
    const startButton = UIHelper.createModernButton(
      this,
      width / 2,
      buttonY,
      '开始游戏',
      () => {
        // 进入游戏家园
        this.scene.start('HomeScene');
      },
      UITheme.colors.success
    );

    // 融合演示按钮
    const fusionButton = UIHelper.createModernButton(
      this,
      width / 2,
      buttonY + buttonSpacing,
      '融合演示',
      () => this.scene.start('FusionDemoScene'),
      UITheme.colors.accent
    );

    // 说明文字
    const info = this.add.text(width / 2, height - 60, '点击按钮开始你的冒险', {
      fontSize: '14px',
      color: UITheme.colors.textSecondary,
      fontFamily: UITheme.fonts.body,
      letterSpacing: 2
    });
    info.setOrigin(0.5);

    // 闪烁动画
    this.tweens.add({
      targets: info,
      alpha: 0.5,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });

    // 版本号
    const version = this.add.text(width - 20, height - 20, 'v0.1.0 Alpha', {
      fontSize: '12px',
      fontFamily: UITheme.fonts.body,
      color: UITheme.colors.textMuted
    });
    version.setOrigin(1);
  }

  private addDecorations() {
    const { width, height } = this.cameras.main;

    // 添加像素风格的星星
    for (let i = 0; i < 50; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const size = Phaser.Math.Between(2, 4);

      const star = this.add.rectangle(x, y, size, size, 0xFFFFFF, 0.6);

      // 闪烁动画
      this.tweens.add({
        targets: star,
        alpha: 0.2,
        duration: Phaser.Math.Between(1000, 3000),
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(0, 2000)
      });
    }

    // 添加像素云
    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(-100, width + 100);
      const y = Phaser.Math.Between(50, height - 50);

      const cloud = this.add.rectangle(x, y, 80, 40, 0xFFFFFF, 0.1);
      cloud.setOrigin(0.5);

      // 漂浮动画
      this.tweens.add({
        targets: cloud,
        x: x + 200,
        duration: Phaser.Math.Between(10000, 20000),
        repeat: -1,
        yoyo: true
      });
    }
  }
}

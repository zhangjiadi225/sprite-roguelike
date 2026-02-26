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
    const titleContainer = this.add.container(width / 2, height / 3);
    
    // 标题阴影
    const titleShadow = this.add.text(3, 3, '精灵肉鸽', {
      fontSize: '56px',
      color: '#000000',
      fontFamily: '"Press Start 2P", monospace',
      stroke: '#000000',
      strokeThickness: 4
    });
    titleShadow.setOrigin(0.5);
    
    // 标题
    const title = this.add.text(0, 0, '精灵肉鸽', {
      fontSize: '56px',
      color: UITheme.colors.primary,
      fontFamily: '"Press Start 2P", monospace',
      stroke: '#FFFFFF',
      strokeThickness: 2
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
    const buttonY = height / 2 + 20;
    const buttonSpacing = 80;

    // 开始游戏按钮
    const startButton = UIHelper.createPixelButton(
      this,
      width / 2,
      buttonY,
      '开始游戏',
      () => this.scene.start('GameScene'),
      UITheme.colors.success
    );

    // 融合演示按钮
    const fusionButton = UIHelper.createPixelButton(
      this,
      width / 2,
      buttonY + buttonSpacing,
      '融合演示',
      () => this.scene.start('FusionDemoScene'),
      UITheme.colors.accent
    );

    // 说明文字
    const info = this.add.text(width / 2, height - 80, '点击按钮开始游戏', {
      fontSize: '14px',
      color: UITheme.colors.textSecondary,
      fontFamily: '"Noto Sans SC", sans-serif'
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
    const version = this.add.text(width - 10, height - 10, 'v0.1.0', {
      fontSize: '12px',
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

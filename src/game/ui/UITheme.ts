import Phaser from 'phaser';

// UI 主题配置 (Neo-Chinese Modern Minimalist)
export const UITheme = {
  // 颜色系统
  colors: {
    primary: '#89B4FA',      // 主色调 - 天青蓝
    secondary: '#CBA6F7',    // 次要色 - 丁香紫
    accent: '#F9E2AF',       // 强调色 - 暖茶黄
    success: '#A6E3A1',      // 成功色 - 竹叶翠
    warning: '#FAB387',      // 警告色 - 晚霞橙
    danger: '#F38BA8',       // 危险色 - 胭脂红

    // 背景
    bgDark: '#11111B',       // 深色背景 - 极星夜黑
    bgLight: '#1E1E2E',      // 浅色背景 - 砚台深灰
    bgCard: '#181825',       // 卡片背景 - 宣纸灰黑 (更深邃，衬托半透明)

    // 文字
    textPrimary: '#CDD6F4',  // 主要文字 - 珠光白
    textSecondary: '#A6ADC8',// 次要文字 - 灰月银
    textMuted: '#6C7086',    // 弱化文字 - 水墨灰

    // 属性专属颜色
    fire: '#F38BA8',         // 火
    electric: '#F9E2AF',     // 电
    poison: '#CBA6F7',       // 毒
    ice: '#89DCEB',          // 冰
    void: '#B4BEFE'          // 虚空
  },

  // 字体 (放弃像素体，改为现代圆滑无衬线字体)
  fonts: {
    // 采用原生高品质字体栈
    body: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
    title: '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif'
  },

  // 尺寸
  sizes: {
    buttonHeight: 44,
    cardPadding: 20,
    borderRadius: 12, // 现代化的 12 圆角
    iconSize: 32
  },

  // 阴影与微光效果
  alphas: {
    cardBg: 0.65,     // 卡片背景透明度 (模拟毛玻璃玻璃)
    strokeLight: 0.2, // 微光描边透明度
    hover: 0.85
  },

  // 动画
  animations: {
    fast: 150,
    normal: 300,
    slow: 500
  }
};

// UI 工具函数 (现代化重写)
export class UIHelper {

  // 1. 创建现代圆角呼吸发光按钮
  static createModernButton(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    onClick: () => void,
    colorHex: string = UITheme.colors.primary,
    width: number = 220,
    height: number = UITheme.sizes.buttonHeight
  ): Phaser.GameObjects.Container {
    const container = scene.add.container(x, y);
    const colorNum = Phaser.Display.Color.HexStringToColor(colorHex).color;

    // 光晕层 (后景泛光)
    const glow = scene.add.graphics();
    glow.fillStyle(colorNum, 0.2);
    glow.fillRoundedRect(-width / 2, -height / 2, width, height, UITheme.sizes.borderRadius + 4);
    glow.setVisible(false); // 悬停时可见

    // 按钮底边 (Graphics 版圆角)
    const bg = scene.add.graphics();
    bg.fillStyle(colorNum, 0.9);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, UITheme.sizes.borderRadius);

    // 内边缘高光描边营造立体感
    bg.lineStyle(1.5, 0xFFFFFF, 0.3);
    bg.strokeRoundedRect(-width / 2 + 1, -height / 2 + 1, width - 2, height - 2, UITheme.sizes.borderRadius - 1);

    // 文字
    const label = scene.add.text(0, 0, text, {
      fontSize: '18px',
      color: '#11111B', // 亮底深字或根据颜色对比度调整，这里用深色文字显得清爽
      fontFamily: UITheme.fonts.title,
      fontStyle: 'bold'
    });
    label.setOrigin(0.5);

    // 隐藏的交互拾取区
    const hitArea = scene.add.rectangle(0, 0, width, height, 0x000000, 0);
    hitArea.setInteractive({ useHandCursor: true });

    container.add([glow, bg, label, hitArea]);

    // 现代悬停反馈
    hitArea.on('pointerover', () => {
      scene.tweens.add({
        targets: container,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: UITheme.animations.fast,
        ease: 'Sine.easeOut'
      });
      glow.setVisible(true);
    });

    hitArea.on('pointerout', () => {
      scene.tweens.add({
        targets: container,
        scaleX: 1,
        scaleY: 1,
        duration: UITheme.animations.fast,
        ease: 'Sine.easeOut'
      });
      glow.setVisible(false);
    });

    hitArea.on('pointerdown', () => {
      scene.tweens.add({
        targets: container,
        scaleX: 0.95,
        scaleY: 0.95,
        duration: 80,
        yoyo: true,
        ease: 'Quad.easeInOut',
        onComplete: () => {
          onClick();
        }
      });
    });

    return container;
  }

  // 2. 创建现代卡片 (半透明圆角底版)
  static createCard(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    alpha: number = UITheme.alphas.cardBg
  ): Phaser.GameObjects.Container {
    const container = scene.add.container(x, y);
    const r = UITheme.sizes.borderRadius;

    // 阴影光晕 (柔和投影)
    const shadow = scene.add.graphics();
    shadow.fillStyle(0x000000, 0.4);
    shadow.fillRoundedRect(4, 4, width, height, r);

    // 主底板 (半透明)
    const bg = scene.add.graphics();
    bg.fillStyle(Phaser.Display.Color.HexStringToColor(UITheme.colors.bgCard).color, alpha);
    bg.fillRoundedRect(0, 0, width, height, r);

    // 微光内发光细边 (增加玻璃高级感)
    bg.lineStyle(1, 0xFFFFFF, UITheme.alphas.strokeLight);
    bg.strokeRoundedRect(0, 0, width, height, r);

    container.add([shadow, bg]);

    return container;
  }

  // 3. 创建现代进度条 (胶囊体)
  static createProgressBar(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    value: number,
    maxValue: number,
    colorHex: string = UITheme.colors.success
  ): Phaser.GameObjects.Container {
    const container = scene.add.container(x, y);
    const r = height / 2; // 完美胶囊半圆
    const colorNum = Phaser.Display.Color.HexStringToColor(colorHex).color;

    // 轨道槽背景 (深色凹槽)
    const track = scene.add.graphics();
    track.fillStyle(0x000000, 0.6);
    track.fillRoundedRect(0, -height / 2, width, height, r);
    track.lineStyle(1, 0xFFFFFF, 0.1);
    track.strokeRoundedRect(0, -height / 2, width, height, r);

    // 进度主条
    const fillGraphic = scene.add.graphics();
    const fillWidth = Math.max(r * 2, (value / maxValue) * width); // 保证最起码能画出两头圆角

    if (value > 0) {
      fillGraphic.fillStyle(colorNum, 0.95);
      fillGraphic.fillRoundedRect(0, -height / 2 + 1, fillWidth, height - 2, r - 1);

      // 添加进度条顶部高光
      fillGraphic.fillStyle(0xFFFFFF, 0.2);
      fillGraphic.fillRoundedRect(1, -height / 2 + 1, fillWidth - 2, (height - 2) / 2, r - 1);
    }

    container.add([track, fillGraphic]);

    return container;
  }

  // 4. 显示飘字提示 (清爽阴影文字)
  static showToast(
    scene: Phaser.Scene,
    text: string,
    duration: number = 2000
  ): void {
    const { width, height } = scene.cameras.main;

    const toastBg = scene.add.graphics();
    toastBg.fillStyle(0x000000, 0.75);
    // 先不画它，等获得了文字宽度后重绘

    const toastText = scene.add.text(width / 2, height * 0.8, text, {
      fontSize: '20px',
      color: UITheme.colors.textPrimary,
      fontFamily: UITheme.fonts.title,
      shadow: { offsetX: 0, offsetY: 2, color: '#000', blur: 4, fill: true }
    });
    toastText.setOrigin(0.5);

    const txtWidth = toastText.width + 40;
    const txtHeight = toastText.height + 20;

    toastBg.fillRoundedRect(width / 2 - txtWidth / 2, height * 0.8 - txtHeight / 2, txtWidth, txtHeight, 8);

    const container = scene.add.container(0, 0, [toastBg, toastText]);
    container.setAlpha(0);
    container.setDepth(100);

    // 顺滑弹起动效
    container.y += 20;

    scene.tweens.add({
      targets: container,
      alpha: 1,
      y: '-=20',
      duration: 300,
      ease: 'Back.easeOut',
      onComplete: () => {
        scene.time.delayedCall(duration, () => {
          scene.tweens.add({
            targets: container,
            alpha: 0,
            y: '-=15',
            duration: 300,
            onComplete: () => container.destroy()
          });
        });
      }
    });
  }

  // 5. 获取属性颜色
  static getElementColor(element: string): string {
    const colors: Record<string, string> = {
      fire: UITheme.colors.fire,
      electric: UITheme.colors.electric,
      poison: UITheme.colors.poison,
      ice: UITheme.colors.ice,
      void: UITheme.colors.void
    };
    return colors[element] || UITheme.colors.textPrimary;
  }
}

// UI 主题配置
export const UITheme = {
  // 颜色系统
  colors: {
    primary: '#FF6B6B',      // 主色调 - 珊瑚红
    secondary: '#4ECDC4',    // 次要色 - 青绿色
    accent: '#FFE66D',       // 强调色 - 明黄色
    success: '#95E1D3',      // 成功 - 薄荷绿
    warning: '#F38181',      // 警告 - 粉红
    danger: '#AA4465',       // 危险 - 深红
    
    // 背景
    bgDark: '#2C3E50',       // 深色背景
    bgLight: '#ECF0F1',      // 浅色背景
    bgCard: '#34495E',       // 卡片背景
    
    // 文字
    textPrimary: '#FFFFFF',  // 主要文字
    textSecondary: '#BDC3C7',// 次要文字
    textMuted: '#7F8C8D',    // 弱化文字
    
    // 属性颜色
    fire: '#FF6B6B',
    electric: '#FFE66D',
    poison: '#9B59B6',
    ice: '#5DADE2',
    void: '#6C5CE7'
  },
  
  // 字体
  fonts: {
    pixel: '"Press Start 2P", "Courier New", monospace',
    body: '"Noto Sans SC", sans-serif'
  },
  
  // 尺寸
  sizes: {
    buttonHeight: 48,
    cardPadding: 16,
    borderRadius: 8,
    iconSize: 32
  },
  
  // 阴影
  shadows: {
    small: '0 2px 4px rgba(0,0,0,0.2)',
    medium: '0 4px 8px rgba(0,0,0,0.3)',
    large: '0 8px 16px rgba(0,0,0,0.4)',
    glow: '0 0 20px rgba(255,107,107,0.5)'
  },
  
  // 动画
  animations: {
    fast: 150,
    normal: 300,
    slow: 500
  }
};

// UI 工具函数
export class UIHelper {
  // 创建像素风格按钮
  static createPixelButton(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    onClick: () => void,
    color: string = UITheme.colors.primary
  ): Phaser.GameObjects.Container {
    const container = scene.add.container(x, y);
    
    // 背景
    const bg = scene.add.rectangle(0, 0, 200, 48, Phaser.Display.Color.HexStringToColor(color).color);
    bg.setStrokeStyle(3, 0xFFFFFF);
    
    // 文字
    const label = scene.add.text(0, 0, text, {
      fontSize: '16px',
      color: '#FFFFFF',
      fontFamily: UITheme.fonts.pixel
    });
    label.setOrigin(0.5);
    
    container.add([bg, label]);
    container.setSize(200, 48);
    container.setInteractive({ useHandCursor: true });
    
    // 悬停效果
    container.on('pointerover', () => {
      scene.tweens.add({
        targets: container,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: UITheme.animations.fast,
        ease: 'Back.easeOut'
      });
      bg.setFillStyle(Phaser.Display.Color.HexStringToColor(color).color, 0.8);
    });
    
    container.on('pointerout', () => {
      scene.tweens.add({
        targets: container,
        scaleX: 1,
        scaleY: 1,
        duration: UITheme.animations.fast
      });
      bg.setFillStyle(Phaser.Display.Color.HexStringToColor(color).color, 1);
    });
    
    container.on('pointerdown', () => {
      scene.tweens.add({
        targets: container,
        scaleX: 0.95,
        scaleY: 0.95,
        duration: 50,
        yoyo: true,
        onComplete: onClick
      });
    });
    
    return container;
  }
  
  // 创建卡片
  static createCard(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number
  ): Phaser.GameObjects.Container {
    const container = scene.add.container(x, y);
    
    // 阴影
    const shadow = scene.add.rectangle(4, 4, width, height, 0x000000, 0.3);
    shadow.setOrigin(0);
    
    // 背景
    const bg = scene.add.rectangle(0, 0, width, height, 
      Phaser.Display.Color.HexStringToColor(UITheme.colors.bgCard).color);
    bg.setOrigin(0);
    bg.setStrokeStyle(2, 0xFFFFFF, 0.3);
    
    container.add([shadow, bg]);
    
    return container;
  }
  
  // 创建进度条
  static createProgressBar(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    value: number,
    maxValue: number,
    color: string = UITheme.colors.success
  ): Phaser.GameObjects.Container {
    const container = scene.add.container(x, y);
    
    // 背景
    const bg = scene.add.rectangle(0, 0, width, height, 0x000000, 0.5);
    bg.setOrigin(0, 0.5);
    bg.setStrokeStyle(2, 0xFFFFFF);
    
    // 填充
    const fillWidth = (value / maxValue) * width;
    const fill = scene.add.rectangle(0, 0, fillWidth, height - 4, 
      Phaser.Display.Color.HexStringToColor(color).color);
    fill.setOrigin(0, 0.5);
    
    container.add([bg, fill]);
    
    return container;
  }
  
  // 显示提示文字
  static showToast(
    scene: Phaser.Scene,
    text: string,
    duration: number = 2000
  ): void {
    const { width, height } = scene.cameras.main;
    
    const toast = scene.add.text(width / 2, height - 100, text, {
      fontSize: '18px',
      color: '#FFFFFF',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    });
    toast.setOrigin(0.5);
    toast.setAlpha(0);
    
    // 淡入
    scene.tweens.add({
      targets: toast,
      alpha: 1,
      duration: 300,
      onComplete: () => {
        // 停留
        scene.time.delayedCall(duration, () => {
          // 淡出
          scene.tweens.add({
            targets: toast,
            alpha: 0,
            duration: 300,
            onComplete: () => toast.destroy()
          });
        });
      }
    });
  }
  
  // 获取属性颜色
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

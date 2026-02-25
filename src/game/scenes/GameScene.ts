import Phaser from 'phaser';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // 临时测试文字
    const text = this.add.text(width / 2, height / 2, '游戏场景\n(开发中...)', {
      fontSize: '32px',
      color: '#ffffff',
      align: 'center'
    });
    text.setOrigin(0.5);

    // 返回菜单按钮
    const backButton = this.add.text(20, 20, '返回菜单', {
      fontSize: '20px',
      color: '#ff0000',
      backgroundColor: '#333333',
      padding: { x: 10, y: 5 }
    });
    backButton.setInteractive({ useHandCursor: true });

    backButton.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });

    console.log('GameScene: 游戏场景已创建');
  }
}

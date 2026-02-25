import Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // 标题
    const title = this.add.text(width / 2, height / 3, '精灵肉鸽', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    // 开始按钮
    const startButton = this.add.text(width / 2, height / 2, '开始游戏', {
      fontSize: '32px',
      color: '#00ff00',
      backgroundColor: '#333333',
      padding: { x: 20, y: 10 }
    });
    startButton.setOrigin(0.5);
    startButton.setInteractive({ useHandCursor: true });

    startButton.on('pointerover', () => {
      startButton.setStyle({ color: '#ffff00' });
    });

    startButton.on('pointerout', () => {
      startButton.setStyle({ color: '#00ff00' });
    });

    startButton.on('pointerdown', () => {
      this.scene.start('GameScene');
    });

    // 说明文字
    const info = this.add.text(width / 2, height * 0.7, '点击开始游戏', {
      fontSize: '16px',
      color: '#888888'
    });
    info.setOrigin(0.5);
  }
}

import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // 加载资源
    // TODO: 加载精灵图、音效等
  }

  create() {
    console.log('BootScene: 启动完成');
    this.scene.start('MenuScene');
  }
}

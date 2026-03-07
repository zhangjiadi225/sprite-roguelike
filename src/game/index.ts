export async function initGame(parent: HTMLElement) {
  // 动态导入 Phaser（只在客户端）
  const Phaser = (await import('phaser')).default;
  const { default: BootScene } = await import('./scenes/BootScene');
  const { default: MenuScene } = await import('./scenes/MenuScene');
  const { default: StageSelectScene } = await import('./scenes/StageSelectScene');
  const { default: CombatScene } = await import('./scenes/CombatScene');
  const { default: FusionDemoScene } = await import('./scenes/FusionDemoScene');
  const { default: HomeScene } = await import('./scenes/HomeScene');

  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: window.innerWidth,
      height: window.innerHeight
    },
    parent,
    backgroundColor: '#11111B', // 更新为 UITheme 中的极暗深空蓝
    pixelArt: true,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false
      }
    },
    scene: [BootScene, MenuScene, HomeScene, StageSelectScene, CombatScene, FusionDemoScene]
  };

  return new Phaser.Game(config);
}

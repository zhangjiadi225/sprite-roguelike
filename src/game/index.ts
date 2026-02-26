export async function initGame(parent: HTMLElement) {
  // 动态导入 Phaser（只在客户端）
  const Phaser = (await import('phaser')).default;
  const { default: BootScene } = await import('./scenes/BootScene');
  const { default: MenuScene } = await import('./scenes/MenuScene');
  const { default: StageSelectScene } = await import('./scenes/StageSelectScene');
  const { default: CombatScene } = await import('./scenes/CombatScene');
  const { default: FusionDemoScene } = await import('./scenes/FusionDemoScene');

  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent,
    backgroundColor: '#2d2d2d',
    pixelArt: true,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false
      }
    },
    scene: [BootScene, MenuScene, StageSelectScene, CombatScene, FusionDemoScene]
  };

  return new Phaser.Game(config);
}

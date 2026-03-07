import Phaser from 'phaser';

/**
 * 精灵资源生成器
 * 每个基础精灵拆分为：
 * 1. 纯色的圆球身体 (Body)
 * 2. 独特的单独特征 (Feature)，如尖刺、长耳、翅膀等
 */
export class AssetGenerator {

    // ==========================================
    // 基础绘制工具
    // ==========================================

    /** 画一个带高光和阴影的基础圆球身体 */
    private static drawBallBody(scene: Phaser.Scene, key: string, color: number) {
        const s = 100; const r = 35;
        const cx = s / 2; const cy = s / 2;
        const graphics = scene.add.graphics();

        // 阴影
        graphics.fillStyle(0x000000, 0.25);
        graphics.fillCircle(cx + 2, cy + 3, r);
        // 主体
        graphics.fillStyle(color, 1);
        graphics.fillCircle(cx, cy, r);
        // 高光
        graphics.fillStyle(0xffffff, 0.35);
        graphics.fillCircle(cx - r * 0.25, cy - r * 0.3, r * 0.4);
        // 眼睛
        graphics.fillStyle(0xffffff, 0.9);
        graphics.fillCircle(cx - r * 0.25, cy - r * 0.1, r * 0.18);
        graphics.fillCircle(cx + r * 0.25, cy - r * 0.1, r * 0.18);
        graphics.fillStyle(0x000000, 0.9);
        graphics.fillCircle(cx - r * 0.2, cy - r * 0.08, r * 0.09);
        graphics.fillCircle(cx + r * 0.3, cy - r * 0.08, r * 0.09);

        graphics.generateTexture(key, s, s);
        graphics.destroy();
    }

    // ==========================================
    // 专属特征生成 (对齐到 100x100 画布)
    // ==========================================

    private static genFireFoxFeature(scene: Phaser.Scene) {
        const s = 100;
        const g = scene.add.graphics();
        // 火焰尾巴在身体左下方
        g.fillStyle(0xFFD700, 0.9);
        g.fillCircle(25, 75, 12);
        g.fillStyle(0xFF8C00, 0.9);
        g.fillCircle(18, 65, 10);
        g.fillStyle(0xFF4500, 0.9);
        g.fillCircle(12, 55, 8);
        g.generateTexture('feature_fire_fox', s, s);
        g.destroy();
    }

    private static genElectricMouseFeature(scene: Phaser.Scene) {
        const s = 100;
        const g = scene.add.graphics();
        // 闪电尖耳在头顶两侧
        g.fillStyle(0xFFD700, 1);
        g.lineStyle(2, 0xDAA520, 1);
        // 左耳
        g.fillTriangle(30, 15, 45, 15, 38, 30);
        g.strokeTriangle(30, 15, 45, 15, 38, 30);
        // 右耳
        g.fillTriangle(70, 15, 55, 15, 62, 30);
        g.strokeTriangle(70, 15, 55, 15, 62, 30);
        g.generateTexture('feature_electric_mouse', s, s);
        g.destroy();
    }

    private static genPoisonSnakeFeature(scene: Phaser.Scene) {
        const s = 100;
        const g = scene.add.graphics();
        // 头顶三根毒刺
        g.fillStyle(0x9400D3, 1);
        g.fillTriangle(50, 5, 42, 20, 58, 20); // 中间大刺
        g.fillTriangle(32, 10, 26, 25, 38, 25); // 左刺
        g.fillTriangle(68, 10, 62, 25, 74, 25); // 右刺
        g.generateTexture('feature_poison_snake', s, s);
        g.destroy();
    }

    private static genIceRabbitFeature(scene: Phaser.Scene) {
        const s = 100;
        const g = scene.add.graphics();
        // 长垂耳
        g.fillStyle(0xB0E0E6, 1);
        g.fillEllipse(25, 45, 15, 40);
        g.fillEllipse(75, 45, 15, 40);
        // 耳内粉色
        g.fillStyle(0xFFB6C1, 0.6);
        g.fillEllipse(25, 45, 8, 25);
        g.fillEllipse(75, 45, 8, 25);
        g.generateTexture('feature_ice_rabbit', s, s);
        g.destroy();
    }

    private static genVoidPhantomFeature(scene: Phaser.Scene) {
        const s = 100;
        const g = scene.add.graphics();
        // 幽灵漂浮特效（身下星光/幽光）
        g.fillStyle(0x7B68EE, 0.6);
        g.fillEllipse(50, 90, 40, 15);
        g.fillCircle(30, 80, 8);
        g.fillCircle(70, 80, 8);
        g.fillCircle(15, 60, 5);
        g.fillCircle(85, 60, 5);
        g.generateTexture('feature_void_phantom', s, s);
        g.destroy();
    }

    /** Boss 特征：更大的翅膀与光环 */
    private static genBossVoidLordFeature(scene: Phaser.Scene) {
        const s = 100; // 即使是 Boss 也可以限制在 100 框内，或者稍微超出
        const g = scene.add.graphics();
        // 堕落光环
        g.lineStyle(4, 0xFF0000, 0.8);
        g.strokeEllipse(50, 15, 60, 15);
        // 巨大蝙蝠翅
        g.fillStyle(0x4B0082, 0.8);
        // 左翅
        g.fillTriangle(10, 20, 40, 50, 10, 70);
        g.fillTriangle(5, 45, 20, 50, 15, 80);
        // 右翅
        g.fillTriangle(90, 20, 60, 50, 90, 70);
        g.fillTriangle(95, 45, 80, 50, 85, 80);
        g.generateTexture('feature_boss_void_lord', s, s);
        g.destroy();
    }

    /** Boss 身体：不同的颜色和愤怒眼睛 */
    private static genBossVoidLordBody(scene: Phaser.Scene) {
        const s = 100; const r = 38;
        const cx = s / 2; const cy = s / 2;
        const graphics = scene.add.graphics();

        graphics.fillStyle(0x000000, 0.4);
        graphics.fillCircle(cx + 2, cy + 3, r);
        graphics.fillStyle(0x191970, 1);
        graphics.fillCircle(cx, cy, r);
        graphics.fillStyle(0xffffff, 0.2);
        graphics.fillCircle(cx - r * 0.25, cy - r * 0.3, r * 0.4);

        // 愤怒红眼
        graphics.fillStyle(0xFF0000, 1);
        graphics.fillTriangle(cx - 20, cy - 15, cx - 5, cy - 5, cx - 15, cy + 5);
        graphics.fillTriangle(cx + 20, cy - 15, cx + 5, cy - 5, cx + 15, cy + 5);

        graphics.generateTexture('body_boss_void_lord', s, s);
        graphics.destroy();
    }

    // ==========================================
    // 入口
    // ==========================================
    static generateBaseAssets(scene: Phaser.Scene) {
        console.log('AssetGenerator: 生成单特征圆球精灵纹理...');

        // 圆球身体 (Base Bodies)
        this.drawBallBody(scene, 'body_fire_fox', 0xFF6600);
        this.drawBallBody(scene, 'body_electric_mouse', 0xF0E68C);
        this.drawBallBody(scene, 'body_poison_snake', 0x8A2BE2);
        this.drawBallBody(scene, 'body_ice_rabbit', 0x87CEFA);
        this.drawBallBody(scene, 'body_void_phantom', 0x483D8B);
        this.genBossVoidLordBody(scene);

        // 专属特征 (Unique Features)
        this.genFireFoxFeature(scene);
        this.genElectricMouseFeature(scene);
        this.genPoisonSnakeFeature(scene);
        this.genIceRabbitFeature(scene);
        this.genVoidPhantomFeature(scene);
        this.genBossVoidLordFeature(scene);

        console.log('AssetGenerator: 完成 ✓');
    }
}

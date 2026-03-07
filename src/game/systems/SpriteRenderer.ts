import Phaser from 'phaser';
import { Sprite } from '../data/types';

export class SpriteRenderer {
    // 渲染极简版精灵（圆体 + 特征）
    static render(scene: Phaser.Scene, x: number, y: number, sprite: Sprite, scale: number = 1): Phaser.GameObjects.Container {
        const container = scene.add.container(x, y);

        // 先画身体，再画特征（如果有特殊需求可拆分前/后特征，但目前合并渲染）
        if (sprite.body.bodyKey && scene.textures.exists(sprite.body.bodyKey)) {
            const bodyImg = scene.add.image(0, 0, sprite.body.bodyKey);
            // 确保中心点对齐
            bodyImg.setOrigin(0.5);
            container.add(bodyImg);
        }

        if (sprite.body.featureKey && scene.textures.exists(sprite.body.featureKey)) {
            const featImg = scene.add.image(0, 0, sprite.body.featureKey);
            featImg.setOrigin(0.5);
            container.add(featImg);
        }

        container.setScale(scale);
        return container;
    }
}

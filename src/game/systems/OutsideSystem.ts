import { Sprite } from '../data/types';

export class OutsideSystem {
  private storage: Sprite[] = []; // 局外精灵仓库
  private maxStorage: number = 50; // 最多存储50只

  // 添加精灵到局外仓库
  addToStorage(sprite: Sprite): boolean {
    if (this.storage.length >= this.maxStorage) {
      return false;
    }
    this.storage.push(sprite);
    return true;
  }

  // 从局外仓库移除精灵
  removeFromStorage(spriteId: string): Sprite | undefined {
    const index = this.storage.findIndex(s => s.id === spriteId);
    if (index === -1) return undefined;
    
    return this.storage.splice(index, 1)[0];
  }

  // 获取所有局外精灵
  getStorageSprites(): Sprite[] {
    return [...this.storage];
  }

  // 局外融合
  fuseInStorage(spriteAId: string, spriteBId: string): Sprite | null {
    const spriteA = this.removeFromStorage(spriteAId);
    const spriteB = this.removeFromStorage(spriteBId);

    if (!spriteA || !spriteB) {
      // 恢复精灵
      if (spriteA) this.addToStorage(spriteA);
      if (spriteB) this.addToStorage(spriteB);
      return null;
    }

    // 导入融合系统
    const { fuseSprites } = require('./FusionSystem');
    const fusedSprite = fuseSprites(spriteA, spriteB);
    
    this.addToStorage(fusedSprite);
    return fusedSprite;
  }

  // 保存数据（用于持久化）
  saveData(): string {
    return JSON.stringify({
      storage: this.storage,
      maxStorage: this.maxStorage
    });
  }

  // 加载数据
  loadData(data: string): void {
    try {
      const parsed = JSON.parse(data);
      this.storage = parsed.storage || [];
      this.maxStorage = parsed.maxStorage || 50;
    } catch (e) {
      console.error('Failed to load outside system data:', e);
    }
  }
}

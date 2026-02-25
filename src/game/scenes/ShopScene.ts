import Phaser from 'phaser';
import { InventorySystem, ITEMS, InventoryItem } from '../systems/InventorySystem';

export default class ShopScene extends Phaser.Scene {
  private inventory!: InventorySystem;
  private onShopClose?: () => void;

  constructor() {
    super({ key: 'ShopScene' });
  }

  init(data: {
    inventory: InventorySystem,
    onShopClose?: () => void
  }) {
    this.inventory = data.inventory;
    this.onShopClose = data.onShopClose;
  }

  create() {
    const { width, height } = this.cameras.main;

    // 背景
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);

    // 标题
    this.add.text(width / 2, 40, '🛒 商店', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 金币显示
    this.displayGold();

    // 商品列表
    this.displayShopItems();

    // 关闭按钮
    const closeButton = this.add.text(width - 30, 30, '✕', {
      fontSize: '32px',
      color: '#ff0000'
    });
    closeButton.setOrigin(0.5);
    closeButton.setInteractive({ useHandCursor: true });

    closeButton.on('pointerdown', () => {
      if (this.onShopClose) {
        this.onShopClose();
      }
      this.scene.stop();
    });
  }

  private displayGold() {
    const { width } = this.cameras.main;
    
    this.add.text(width / 2, 80, `💰 金币: ${this.inventory.getGold()}`, {
      fontSize: '20px',
      color: '#ffaa00'
    }).setOrigin(0.5);
  }

  private displayShopItems() {
    const { width, height } = this.cameras.main;
    const startY = 130;
    const itemHeight = 80;

    const shopItems = [
      { ...ITEMS.POTION, price: 50 },
      { ...ITEMS.FULL_RESTORE, price: 200 },
      { ...ITEMS.POKE_BALL, price: 100 },
      { ...ITEMS.GREAT_BALL, price: 300 },
      { ...ITEMS.FUSION_STONE, price: 500 },
      { ...ITEMS.EXP_CANDY, price: 150 }
    ];

    shopItems.forEach((item, index) => {
      const y = startY + index * itemHeight;

      // 背景
      const bg = this.add.rectangle(width / 2, y, width - 60, 70, 0x333333);

      // 物品名称
      this.add.text(50, y - 20, item.name, {
        fontSize: '18px',
        color: '#ffffff'
      });

      // 物品描述
      this.add.text(50, y + 5, item.description, {
        fontSize: '14px',
        color: '#aaaaaa'
      });

      // 价格
      const priceText = this.add.text(width - 200, y, `💰 ${item.price}`, {
        fontSize: '16px',
        color: '#ffaa00'
      });

      // 购买按钮
      const canAfford = this.inventory.getGold() >= item.price;
      const buyButton = this.add.text(width - 80, y, '购买', {
        fontSize: '16px',
        color: canAfford ? '#00ff00' : '#666666',
        backgroundColor: canAfford ? '#333333' : '#222222',
        padding: { x: 15, y: 8 }
      });
      buyButton.setOrigin(0.5);

      if (canAfford) {
        buyButton.setInteractive({ useHandCursor: true });

        buyButton.on('pointerover', () => {
          buyButton.setStyle({ backgroundColor: '#444444' });
        });

        buyButton.on('pointerout', () => {
          buyButton.setStyle({ backgroundColor: '#333333' });
        });

        buyButton.on('pointerdown', () => {
          this.buyItem(item, item.price);
        });
      }
    });
  }

  private buyItem(item: any, price: number) {
    if (this.inventory.spendGold(price)) {
      this.inventory.addItem({
        ...item,
        quantity: 1
      });

      // 显示购买成功提示
      const { width, height } = this.cameras.main;
      const successText = this.add.text(width / 2, height / 2, `购买成功！\n${item.name} x1`, {
        fontSize: '24px',
        color: '#00ff00',
        backgroundColor: '#000000',
        padding: { x: 20, y: 10 },
        align: 'center'
      });
      successText.setOrigin(0.5);

      this.time.delayedCall(1000, () => {
        successText.destroy();
        this.scene.restart();
      });
    }
  }
}

import Phaser from 'phaser';
import { InventorySystem, ITEMS } from '../systems/InventorySystem';
import { UITheme, UIHelper } from '../ui/UITheme';

export default class ShopScene extends Phaser.Scene {
  private inventory!: InventorySystem;
  private onShopClose?: () => void;
  private goldText!: Phaser.GameObjects.Text;

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

    // 渐变背景
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(
      Phaser.Display.Color.HexStringToColor('#134E5E').color,
      Phaser.Display.Color.HexStringToColor('#71B280').color,
      Phaser.Display.Color.HexStringToColor('#134E5E').color,
      Phaser.Display.Color.HexStringToColor('#71B280').color,
      1
    );
    graphics.fillRect(0, 0, width, height);

    // 标题
    const title = this.add.text(width / 2, 40, '🛒 商店', {
      fontSize: '32px',
      color: '#FFFFFF',
      fontFamily: '"Press Start 2P", monospace',
      stroke: '#000000',
      strokeThickness: 4
    });
    title.setOrigin(0.5);

    // 金币显示
    this.displayGold();

    // 商品列表
    this.displayShopItems();

    // 关闭按钮
    UIHelper.createPixelButton(
      this,
      width - 70,
      30,
      '关闭',
      () => {
        if (this.onShopClose) {
          this.onShopClose();
        }
        this.scene.stop();
      },
      UITheme.colors.danger
    ).setScale(0.6);
  }

  private displayGold() {
    const { width } = this.cameras.main;
    
    const goldBg = this.add.rectangle(width / 2, 85, 200, 40, 
      Phaser.Display.Color.HexStringToColor(UITheme.colors.bgCard).color, 0.8);
    goldBg.setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(UITheme.colors.accent).color);

    this.goldText = this.add.text(width / 2, 85, `💰 ${this.inventory.getGold()}`, {
      fontSize: '18px',
      color: UITheme.colors.accent,
      fontFamily: '"Press Start 2P", monospace'
    });
    this.goldText.setOrigin(0.5);
  }

  private displayShopItems() {
    const { width } = this.cameras.main;
    const startY = 140;
    const itemHeight = 90;

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
      this.createShopItem(width / 2, y, item, item.price);
    });
  }

  private createShopItem(x: number, y: number, item: any, price: number) {
    const canAfford = this.inventory.getGold() >= price;

    // 商品卡片
    const card = UIHelper.createCard(this, x - 280, y - 35, 560, 80);

    // 商品图标
    const icon = this.add.text(x - 240, y, this.getItemIcon(item.type), {
      fontSize: '32px'
    });
    icon.setOrigin(0.5);

    // 商品名称
    const name = this.add.text(x - 180, y - 15, item.name, {
      fontSize: '16px',
      color: UITheme.colors.textPrimary,
      fontFamily: '"Press Start 2P", monospace'
    });

    // 商品描述
    const desc = this.add.text(x - 180, y + 10, item.description, {
      fontSize: '12px',
      color: UITheme.colors.textSecondary
    });

    // 价格
    const priceText = this.add.text(x + 120, y, `💰 ${price}`, {
      fontSize: '14px',
      color: UITheme.colors.accent,
      fontFamily: '"Press Start 2P", monospace'
    });
    priceText.setOrigin(0, 0.5);

    // 购买按钮
    const buyButton = UIHelper.createPixelButton(
      this,
      x + 220,
      y,
      '购买',
      () => this.buyItem(item, price),
      canAfford ? UITheme.colors.success : UITheme.colors.textMuted
    );
    buyButton.setScale(0.5);

    if (!canAfford) {
      buyButton.setAlpha(0.5);
      buyButton.disableInteractive();
    }
  }

  private getItemIcon(type: string): string {
    const icons: Record<string, string> = {
      potion: '🧪',
      ball: '⚾',
      fusion: '💎',
      boost: '⭐'
    };
    return icons[type] || '📦';
  }

  private buyItem(item: any, price: number) {
    if (this.inventory.spendGold(price)) {
      this.inventory.addItem({
        ...item,
        quantity: 1
      });

      // 更新金币显示
      this.goldText.setText(`💰 ${this.inventory.getGold()}`);

      // 显示购买成功
      UIHelper.showToast(this, `购买成功！${item.name} x1`);

      // 刷新商店
      this.time.delayedCall(1000, () => {
        this.scene.restart();
      });
    }
  }
}

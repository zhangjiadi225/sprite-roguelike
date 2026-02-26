import Phaser from 'phaser';
import { MapGenerator, Floor, Room, RoomType } from '../systems/MapGenerator';
import { getAllBaseSprites } from '../data/baseSprites';
import { Sprite } from '../data/types';
import { InventorySystem } from '../systems/InventorySystem';
import { UITheme, UIHelper } from '../ui/UITheme';

export default class GameScene extends Phaser.Scene {
  private floor!: Floor;
  private playerTeam: Sprite[] = [];
  private inventory!: InventorySystem;

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // 初始化
    this.initGame();

    // 渐变背景
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(
      Phaser.Display.Color.HexStringToColor('#0f0c29').color,
      Phaser.Display.Color.HexStringToColor('#302b63').color,
      Phaser.Display.Color.HexStringToColor('#24243e').color,
      Phaser.Display.Color.HexStringToColor('#302b63').color,
      1
    );
    graphics.fillRect(0, 0, width, height);

    // 顶部信息栏
    this.createTopBar();

    // 显示当前房间
    this.displayCurrentRoom();

    // 显示地图
    this.displayMap();

    // 显示队伍信息
    this.displayTeam();

    // 返回菜单按钮
    const backButton = UIHelper.createPixelButton(
      this,
      70,
      30,
      '返回',
      () => this.scene.start('MenuScene'),
      UITheme.colors.danger
    );
    backButton.setScale(0.6);
  }

  private initGame() {
    this.floor = MapGenerator.generateFloor(1);
    const baseSprites = getAllBaseSprites();
    this.playerTeam = [baseSprites[0]];
    this.inventory = new InventorySystem();
  }

  private createTopBar() {
    const { width } = this.cameras.main;
    
    // 顶部栏背景
    const topBar = UIHelper.createCard(this, 0, 0, width, 60);
    
    // 楼层信息
    const floorText = this.add.text(20, 30, `第 ${this.floor.level} 层`, {
      fontSize: '20px',
      color: UITheme.colors.textPrimary,
      fontFamily: '"Press Start 2P", monospace'
    });
    floorText.setOrigin(0, 0.5);
    
    // 金币显示
    const goldIcon = this.add.text(width - 150, 30, '💰', {
      fontSize: '24px'
    });
    goldIcon.setOrigin(0, 0.5);
    
    const goldText = this.add.text(width - 120, 30, `${this.inventory.getGold()}`, {
      fontSize: '18px',
      color: UITheme.colors.accent,
      fontFamily: '"Press Start 2P", monospace'
    });
    goldText.setOrigin(0, 0.5);
  }

  private displayCurrentRoom() {
    const { width, height } = this.cameras.main;
    const currentRoom = MapGenerator.getCurrentRoom(this.floor);
    
    if (!currentRoom) return;

    const roomY = height * 0.35;

    // 房间卡片
    const card = UIHelper.createCard(this, width / 2 - 200, roomY - 100, 400, 200);

    // 房间类型图标
    const icon = this.getRoomIcon(currentRoom.type);
    const iconText = this.add.text(width / 2, roomY - 60, icon, {
      fontSize: '48px'
    });
    iconText.setOrigin(0.5);

    // 房间名称
    const roomName = this.add.text(width / 2, roomY - 10, this.getRoomTypeName(currentRoom.type), {
      fontSize: '24px',
      color: this.getRoomTypeColor(currentRoom.type),
      fontFamily: '"Press Start 2P", monospace'
    });
    roomName.setOrigin(0.5);

    // 房间描述
    const description = this.add.text(width / 2, roomY + 30, this.getRoomDescription(currentRoom), {
      fontSize: '14px',
      color: UITheme.colors.textSecondary,
      align: 'center',
      wordWrap: { width: 350 }
    });
    description.setOrigin(0.5);

    // 房间操作按钮
    if (!currentRoom.cleared) {
      this.displayRoomActions(currentRoom, roomY + 80);
    } else {
      const clearedText = this.add.text(width / 2, roomY + 80, '✓ 已清除', {
        fontSize: '16px',
        color: UITheme.colors.success,
        fontFamily: '"Press Start 2P", monospace'
      });
      clearedText.setOrigin(0.5);
    }
  }

  private displayRoomActions(room: Room, y: number) {
    const { width } = this.cameras.main;

    if (room.type === RoomType.BATTLE) {
      UIHelper.createPixelButton(
        this,
        width / 2,
        y,
        '开始战斗',
        () => this.startBattle(),
        UITheme.colors.danger
      );
    } else if (room.type === RoomType.TREASURE) {
      UIHelper.createPixelButton(
        this,
        width / 2,
        y,
        '打开宝箱',
        () => this.openTreasure(room),
        UITheme.colors.accent
      );
    } else if (room.type === RoomType.SHOP) {
      UIHelper.createPixelButton(
        this,
        width / 2,
        y,
        '进入商店',
        () => this.scene.launch('ShopScene', { inventory: this.inventory }),
        UITheme.colors.secondary
      );
    }
  }

  private displayMap() {
    const { width, height } = this.cameras.main;
    const mapY = height * 0.7;

    const mapTitle = this.add.text(width / 2, mapY - 30, '可前往的房间', {
      fontSize: '16px',
      color: UITheme.colors.accent,
      fontFamily: '"Press Start 2P", monospace'
    });
    mapTitle.setOrigin(0.5);

    const availableRooms = MapGenerator.getAvailableRooms(this.floor);
    
    availableRooms.forEach((room, index) => {
      const x = width / 2 - 100 + index * 120;
      const y = mapY + 30;

      const button = this.add.container(x, y);
      
      // 背景
      const bg = this.add.rectangle(0, 0, 100, 70, 
        Phaser.Display.Color.HexStringToColor(UITheme.colors.bgCard).color);
      bg.setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(this.getRoomTypeColor(room.type)).color);
      
      // 图标
      const icon = this.add.text(0, -15, this.getRoomIcon(room.type), {
        fontSize: '24px'
      });
      icon.setOrigin(0.5);
      
      // 名称
      const name = this.add.text(0, 15, this.getRoomTypeName(room.type), {
        fontSize: '10px',
        color: this.getRoomTypeColor(room.type)
      });
      name.setOrigin(0.5);

      button.add([bg, icon, name]);
      button.setSize(100, 70);
      button.setInteractive({ useHandCursor: true });

      button.on('pointerover', () => {
        this.tweens.add({
          targets: button,
          scaleX: 1.1,
          scaleY: 1.1,
          duration: 150
        });
      });

      button.on('pointerout', () => {
        this.tweens.add({
          targets: button,
          scaleX: 1,
          scaleY: 1,
          duration: 150
        });
      });

      button.on('pointerdown', () => {
        MapGenerator.moveToRoom(this.floor, room.id);
        this.scene.restart();
      });
    });
  }

  private displayTeam() {
    const { width, height } = this.cameras.main;
    const teamY = height - 60;

    const teamLabel = this.add.text(20, teamY - 20, '队伍', {
      fontSize: '12px',
      color: UITheme.colors.textSecondary
    });

    this.playerTeam.forEach((sprite, index) => {
      const x = 80 + index * 160;
      
      // 精灵卡片
      const card = this.add.rectangle(x, teamY, 140, 50, 
        Phaser.Display.Color.HexStringToColor(UITheme.colors.bgCard).color, 0.8);
      card.setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(UIHelper.getElementColor(sprite.element)).color);
      
      // 精灵信息
      const info = this.add.text(x, teamY, 
        `${sprite.name}\nLv.${sprite.level} HP:${sprite.stats.hp}/${sprite.stats.maxHP}`, {
        fontSize: '10px',
        color: UITheme.colors.textPrimary,
        align: 'center'
      });
      info.setOrigin(0.5);
    });
  }

  private startBattle() {
    const baseSprites = getAllBaseSprites();
    const enemySprite = baseSprites[Math.floor(Math.random() * baseSprites.length)];
    enemySprite.level = this.floor.level + Math.floor(Math.random() * 3);

    this.scene.start('BattleScene', {
      playerTeam: this.playerTeam,
      enemySprite,
      onBattleEnd: (result: any) => {
        if (result.winner === 'player') {
          const currentRoom = MapGenerator.getCurrentRoom(this.floor);
          if (currentRoom) {
            MapGenerator.clearRoom(this.floor, currentRoom.id);
          }
          this.inventory.addGold(result.rewards.gold);
        }
      }
    });
  }

  private openTreasure(room: Room) {
    const gold = Math.floor(50 + Math.random() * 100);
    this.inventory.addGold(gold);
    MapGenerator.clearRoom(this.floor, room.id);
    
    UIHelper.showToast(this, `获得了 ${gold} 金币！`);
    
    this.time.delayedCall(1500, () => {
      this.scene.restart();
    });
  }

  private getRoomIcon(type: RoomType): string {
    const icons: Record<RoomType, string> = {
      [RoomType.START]: '🏠',
      [RoomType.BATTLE]: '⚔️',
      [RoomType.SHOP]: '🛒',
      [RoomType.TREASURE]: '💎',
      [RoomType.BOSS]: '👑',
      [RoomType.EXIT]: '🚪'
    };
    return icons[type];
  }

  private getRoomTypeName(type: RoomType): string {
    const names: Record<RoomType, string> = {
      [RoomType.START]: '起点',
      [RoomType.BATTLE]: '战斗',
      [RoomType.SHOP]: '商店',
      [RoomType.TREASURE]: '宝箱',
      [RoomType.BOSS]: 'Boss',
      [RoomType.EXIT]: '出口'
    };
    return names[type];
  }

  private getRoomTypeColor(type: RoomType): string {
    const colors: Record<RoomType, string> = {
      [RoomType.START]: UITheme.colors.success,
      [RoomType.BATTLE]: UITheme.colors.danger,
      [RoomType.SHOP]: UITheme.colors.secondary,
      [RoomType.TREASURE]: UITheme.colors.accent,
      [RoomType.BOSS]: UITheme.colors.primary,
      [RoomType.EXIT]: UITheme.colors.success
    };
    return colors[type];
  }

  private getRoomDescription(room: Room): string {
    const descriptions: Record<RoomType, string> = {
      [RoomType.START]: '你的冒险从这里开始',
      [RoomType.BATTLE]: '遇到了野生精灵！',
      [RoomType.SHOP]: '可以购买道具',
      [RoomType.TREASURE]: '发现了一个宝箱',
      [RoomType.BOSS]: '强大的Boss守护着出口',
      [RoomType.EXIT]: '通往下一层的出口'
    };
    return descriptions[room.type];
  }
}

import Phaser from 'phaser';
import { MapGenerator, Floor, Room, RoomType } from '../systems/MapGenerator';
import { getAllBaseSprites } from '../data/baseSprites';
import { Sprite } from '../data/types';
import { InventorySystem } from '../systems/InventorySystem';

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

    // 背景
    this.add.rectangle(width / 2, height / 2, width, height, 0x2d2d2d);

    // 标题
    this.add.text(width / 2, 30, `第 ${this.floor.level} 层`, {
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 显示当前房间
    this.displayCurrentRoom();

    // 显示地图
    this.displayMap();

    // 显示队伍信息
    this.displayTeam();

    // 返回菜单按钮
    const backButton = this.add.text(20, 20, '返回菜单', {
      fontSize: '18px',
      color: '#ff0000',
      backgroundColor: '#333333',
      padding: { x: 10, y: 5 }
    });
    backButton.setInteractive({ useHandCursor: true });
    backButton.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });
  }

  private initGame() {
    // 生成第1层地图
    this.floor = MapGenerator.generateFloor(1);

    // 初始化队伍（选择一只初始精灵）
    const baseSprites = getAllBaseSprites();
    this.playerTeam = [baseSprites[0]]; // 默认选择火狐

    // 初始化背包
    this.inventory = new InventorySystem();
  }

  private displayCurrentRoom() {
    const { width, height } = this.cameras.main;
    const currentRoom = MapGenerator.getCurrentRoom(this.floor);
    
    if (!currentRoom) return;

    const roomY = height * 0.3;

    // 房间信息
    this.add.text(width / 2, roomY - 50, this.getRoomTypeName(currentRoom.type), {
      fontSize: '24px',
      color: this.getRoomTypeColor(currentRoom.type)
    }).setOrigin(0.5);

    // 房间描述
    const description = this.getRoomDescription(currentRoom);
    this.add.text(width / 2, roomY, description, {
      fontSize: '16px',
      color: '#cccccc',
      align: 'center',
      wordWrap: { width: width - 100 }
    }).setOrigin(0.5);

    // 房间操作按钮
    if (!currentRoom.cleared) {
      this.displayRoomActions(currentRoom, roomY + 60);
    } else {
      this.add.text(width / 2, roomY + 60, '✓ 已清除', {
        fontSize: '18px',
        color: '#00ff00'
      }).setOrigin(0.5);
    }
  }

  private displayRoomActions(room: Room, y: number) {
    const { width } = this.cameras.main;

    if (room.type === RoomType.BATTLE) {
      const button = this.add.text(width / 2, y, '开始战斗', {
        fontSize: '20px',
        color: '#ffffff',
        backgroundColor: '#ff6600',
        padding: { x: 20, y: 10 }
      });
      button.setOrigin(0.5);
      button.setInteractive({ useHandCursor: true });

      button.on('pointerover', () => {
        button.setScale(1.1);
      });

      button.on('pointerout', () => {
        button.setScale(1);
      });

      button.on('pointerdown', () => {
        this.startBattle();
      });
    } else if (room.type === RoomType.TREASURE) {
      const button = this.add.text(width / 2, y, '打开宝箱', {
        fontSize: '20px',
        color: '#ffffff',
        backgroundColor: '#ffaa00',
        padding: { x: 20, y: 10 }
      });
      button.setOrigin(0.5);
      button.setInteractive({ useHandCursor: true });

      button.on('pointerdown', () => {
        this.openTreasure(room);
      });
    }
  }

  private displayMap() {
    const { width, height } = this.cameras.main;
    const mapY = height * 0.65;

    this.add.text(width / 2, mapY - 30, '可前往的房间：', {
      fontSize: '18px',
      color: '#ffaa00'
    }).setOrigin(0.5);

    const availableRooms = MapGenerator.getAvailableRooms(this.floor);
    
    availableRooms.forEach((room, index) => {
      const x = width / 2 - 100 + index * 120;
      const y = mapY + 20;

      const button = this.add.rectangle(x, y, 100, 60, 0x444444);
      button.setInteractive({ useHandCursor: true });

      const text = this.add.text(x, y, this.getRoomTypeName(room.type), {
        fontSize: '14px',
        color: this.getRoomTypeColor(room.type),
        align: 'center'
      }).setOrigin(0.5);

      button.on('pointerover', () => {
        button.setFillStyle(0x666666);
      });

      button.on('pointerout', () => {
        button.setFillStyle(0x444444);
      });

      button.on('pointerdown', () => {
        MapGenerator.moveToRoom(this.floor, room.id);
        this.scene.restart();
      });
    });
  }

  private displayTeam() {
    const { width, height } = this.cameras.main;
    const teamY = height - 80;

    this.add.text(20, teamY, '队伍：', {
      fontSize: '16px',
      color: '#ffffff'
    });

    this.playerTeam.forEach((sprite, index) => {
      const x = 80 + index * 150;
      this.add.text(x, teamY, 
        `${sprite.name} Lv.${sprite.level}\nHP: ${sprite.stats.hp}/${sprite.stats.maxHP}`, {
        fontSize: '12px',
        color: '#00ff00'
      });
    });
  }

  private startBattle() {
    // 生成敌人
    const baseSprites = getAllBaseSprites();
    const enemySprite = baseSprites[Math.floor(Math.random() * baseSprites.length)];
    enemySprite.level = this.floor.level + Math.floor(Math.random() * 3);

    // 进入战斗场景
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
    // 随机奖励
    const gold = Math.floor(50 + Math.random() * 100);
    this.inventory.addGold(gold);
    
    MapGenerator.clearRoom(this.floor, room.id);
    
    this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, 
      `获得了 ${gold} 金币！`, {
      fontSize: '24px',
      color: '#ffff00'
    }).setOrigin(0.5);

    this.time.delayedCall(1500, () => {
      this.scene.restart();
    });
  }

  private getRoomTypeName(type: RoomType): string {
    const names: Record<RoomType, string> = {
      [RoomType.START]: '起点',
      [RoomType.BATTLE]: '战斗房间',
      [RoomType.SHOP]: '商店',
      [RoomType.TREASURE]: '宝箱',
      [RoomType.BOSS]: 'Boss房间',
      [RoomType.EXIT]: '出口'
    };
    return names[type];
  }

  private getRoomTypeColor(type: RoomType): string {
    const colors: Record<RoomType, string> = {
      [RoomType.START]: '#00ff00',
      [RoomType.BATTLE]: '#ff6600',
      [RoomType.SHOP]: '#00ccff',
      [RoomType.TREASURE]: '#ffaa00',
      [RoomType.BOSS]: '#ff0000',
      [RoomType.EXIT]: '#00ff00'
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

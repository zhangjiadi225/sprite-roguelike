export enum RoomType {
  BATTLE = 'battle',
  SHOP = 'shop',
  TREASURE = 'treasure',
  BOSS = 'boss',
  START = 'start',
  EXIT = 'exit'
}

export interface Room {
  id: string;
  type: RoomType;
  x: number;
  y: number;
  connections: string[]; // 连接的房间ID
  visited: boolean;
  cleared: boolean;
}

export interface Floor {
  level: number;
  rooms: Room[];
  currentRoomId: string;
}

export class MapGenerator {
  // 生成楼层地图
  static generateFloor(level: number): Floor {
    const roomCount = 5 + level; // 每层房间数随楼层增加
    const rooms: Room[] = [];

    // 创建起始房间
    const startRoom: Room = {
      id: 'start',
      type: RoomType.START,
      x: 0,
      y: 0,
      connections: [],
      visited: true,
      cleared: true
    };
    rooms.push(startRoom);

    // 生成其他房间
    let currentX = 1;
    let currentY = 0;

    for (let i = 1; i < roomCount; i++) {
      const roomType = this.determineRoomType(i, roomCount, level);
      
      const room: Room = {
        id: `room_${i}`,
        type: roomType,
        x: currentX,
        y: currentY,
        connections: [],
        visited: false,
        cleared: false
      };

      // 连接到前一个房间
      const prevRoom = rooms[i - 1];
      prevRoom.connections.push(room.id);
      room.connections.push(prevRoom.id);

      rooms.push(room);

      // 随机移动方向
      if (Math.random() < 0.5) {
        currentX++;
      } else {
        currentY += Math.random() < 0.5 ? 1 : -1;
      }
    }

    // 创建出口房间（Boss房）
    const exitRoom: Room = {
      id: 'exit',
      type: RoomType.BOSS,
      x: currentX + 1,
      y: currentY,
      connections: [rooms[rooms.length - 1].id],
      visited: false,
      cleared: false
    };
    rooms[rooms.length - 1].connections.push(exitRoom.id);
    rooms.push(exitRoom);

    return {
      level,
      rooms,
      currentRoomId: 'start'
    };
  }

  // 决定房间类型
  private static determineRoomType(index: number, totalRooms: number, level: number): RoomType {
    // 最后一个房间是Boss
    if (index === totalRooms - 1) {
      return RoomType.BOSS;
    }

    const rand = Math.random();
    
    // 70% 战斗房
    if (rand < 0.7) {
      return RoomType.BATTLE;
    }
    // 15% 商店房
    else if (rand < 0.85) {
      return RoomType.SHOP;
    }
    // 15% 宝箱房
    else {
      return RoomType.TREASURE;
    }
  }

  // 获取当前房间
  static getCurrentRoom(floor: Floor): Room | undefined {
    return floor.rooms.find(r => r.id === floor.currentRoomId);
  }

  // 获取可前往的房间
  static getAvailableRooms(floor: Floor): Room[] {
    const currentRoom = this.getCurrentRoom(floor);
    if (!currentRoom) return [];

    return currentRoom.connections
      .map(id => floor.rooms.find(r => r.id === id))
      .filter(r => r !== undefined) as Room[];
  }

  // 移动到房间
  static moveToRoom(floor: Floor, roomId: string): boolean {
    const room = floor.rooms.find(r => r.id === roomId);
    if (!room) return false;

    const currentRoom = this.getCurrentRoom(floor);
    if (!currentRoom) return false;

    // 检查是否可以移动到该房间
    if (!currentRoom.connections.includes(roomId)) {
      return false;
    }

    floor.currentRoomId = roomId;
    room.visited = true;
    return true;
  }

  // 清除房间
  static clearRoom(floor: Floor, roomId: string): void {
    const room = floor.rooms.find(r => r.id === roomId);
    if (room) {
      room.cleared = true;
    }
  }
}

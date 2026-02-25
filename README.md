# 精灵肉鸽 (Sprite Roguelike)

一个像素风格的肉鸽类宝可梦游戏。

## 📖 项目介绍

这是一个结合了 Roguelike 元素和宝可梦玩法的像素风格游戏。玩家将在随机生成的地图中探险，捕捉和培养各种精灵，体验每次都不同的冒险旅程。

### 核心玩法
- 🎲 **随机生成地图** - 每次游戏都有不同的地图布局
- 🐾 **精灵捕捉与培养** - 遇到野生精灵，捕捉并组建队伍
- ⚔️ **回合制战斗** - 经典的回合制战斗系统
- 💀 **永久死亡** - Roguelike 核心机制，失败后重新开始
- 🎁 **随机道具** - 探索中获得各种增益道具

## 🛠️ 技术栈

- **游戏引擎**: Phaser 3
- **开发语言**: TypeScript
- **构建工具**: Vite
- **像素艺术**: Aseprite (推荐)

## 📁 目录结构

```
sprite-roguelike/
├── src/                    # 源代码
│   ├── scenes/            # 游戏场景
│   │   ├── Boot.ts       # 启动场景
│   │   ├── Menu.ts       # 主菜单
│   │   ├── Game.ts       # 游戏主场景
│   │   └── Battle.ts     # 战斗场景
│   ├── entities/          # 游戏实体
│   │   ├── Player.ts     # 玩家
│   │   ├── Sprite.ts     # 精灵基类
│   │   └── Enemy.ts      # 敌人
│   ├── systems/           # 游戏系统
│   │   ├── MapGenerator.ts    # 地图生成
│   │   ├── BattleSystem.ts    # 战斗系统
│   │   └── InventorySystem.ts # 背包系统
│   ├── data/              # 游戏数据
│   │   ├── sprites.json  # 精灵数据
│   │   ├── items.json    # 道具数据
│   │   └── skills.json   # 技能数据
│   ├── utils/             # 工具函数
│   └── main.ts            # 入口文件
├── assets/                 # 游戏资源
│   ├── sprites/           # 精灵图
│   ├── tiles/             # 地图瓦片
│   ├── ui/                # UI 元素
│   ├── audio/             # 音效和音乐
│   └── fonts/             # 字体
├── public/                 # 静态资源
│   └── index.html
├── docs/                   # 文档
│   ├── design.md          # 设计文档
│   └── sprites.md         # 精灵图鉴
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🎯 开发计划

### Phase 1: 基础框架 (Week 1-2)
- [x] 项目初始化
- [ ] 基础场景搭建
- [ ] 玩家移动系统
- [ ] 简单地图生成

### Phase 2: 核心玩法 (Week 3-4)
- [ ] 精灵系统
- [ ] 战斗系统
- [ ] 捕捉机制
- [ ] 背包系统

### Phase 3: 内容填充 (Week 5-6)
- [ ] 多种精灵设计
- [ ] 技能系统
- [ ] 道具系统
- [ ] 地图多样性

### Phase 4: 优化与完善 (Week 7-8)
- [ ] UI/UX 优化
- [ ] 音效和音乐
- [ ] 平衡性调整
- [ ] Bug 修复

## 🚀 如何运行

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 预览生产版本
```bash
npm run preview
```

## 🎮 游戏操作

- **WASD / 方向键**: 移动
- **空格**: 交互/确认
- **ESC**: 菜单/取消
- **I**: 打开背包
- **M**: 打开地图

## 📝 开发笔记

- 使用 16x16 像素的精灵图
- 地图采用程序化生成
- 战斗系统参考经典回合制 RPG
- 保持简洁的像素艺术风格

## 📄 License

MIT

---

**开发中...** 🚧

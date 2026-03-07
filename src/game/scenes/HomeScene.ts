import Phaser from 'phaser';
import { UITheme, UIHelper } from '../ui/UITheme';
import { OutsideSystem } from '../systems/OutsideSystem';
import { InventorySystem } from '../systems/InventorySystem';
import { Sprite } from '../data/types';
import { SpriteRenderer } from '../systems/SpriteRenderer';

export default class HomeScene extends Phaser.Scene {
    private outsideSystem!: OutsideSystem;
    private inventory!: InventorySystem;

    // UI 容器
    private currentPanel?: Phaser.GameObjects.Container;
    private panelBg!: Phaser.GameObjects.Rectangle;
    private panelTitle!: Phaser.GameObjects.Text;

    // 高级视图状态
    private selectedSpriteInfoContainer?: Phaser.GameObjects.Container;
    private selectedSpriteAvatarContainer?: Phaser.GameObjects.Container;
    constructor() {
        super({ key: 'HomeScene' });
    }

    init(data: any) {
        // 接收从其他场景传回来的系统，如果没有则新建
        this.outsideSystem = data.outsideSystem || new OutsideSystem();
        this.inventory = data.inventory || new InventorySystem();

        // 初始送几只测试精灵（如果都是空的）
        if (this.inventory.getSprites().length === 0 && this.outsideSystem.getStorageSprites().length === 0) {
            const { getAllBaseSprites } = require('../data/baseSprites');
            const baseSprites = getAllBaseSprites();
            if (baseSprites.length >= 3) {
                this.inventory.addSprite({ ...baseSprites[0], id: 'init_0', level: 1 } as Sprite);
                this.outsideSystem.addToStorage({ ...baseSprites[1], id: 'init_1', level: 1 } as Sprite);
                this.outsideSystem.addToStorage({ ...baseSprites[2], id: 'init_2', level: 1 } as Sprite);
            }
        }
    }

    preload() {
        // 加载家园背景图
        this.load.image('home_bg', 'assets/home_bg.png');
    }

    create() {
        const { width, height } = this.cameras.main;

        // 添加背景图
        const bg = this.add.image(width / 2, height / 2, 'home_bg');

        // 背景稍微暗一点，为了突显 UI
        bg.setTint(0xcceeff);

        // 适配屏幕尺寸（Cover 模式）
        const scaleX = width / bg.width;
        const scaleY = height / bg.height;
        const scale = Math.max(scaleX, scaleY);
        bg.setScale(scale);

        // 标题区域
        const titlePanel = this.add.rectangle(width / 2, 40, 300, 50, Phaser.Display.Color.HexStringToColor(UITheme.colors.bgCard).color, 0.8);
        titlePanel.setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(UITheme.colors.primary).color);

        this.add.text(width / 2, 40, '游戏家园', {
            fontSize: '28px',
            fontFamily: UITheme.fonts.title,
            color: UITheme.colors.primary,
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // 主面板区域
        this.panelBg = this.add.rectangle(width / 2, height / 2 - 20, width * 0.8, height * 0.6, 0x000000, 0.6);
        this.panelBg.setStrokeStyle(2, 0x334455);

        this.panelTitle = this.add.text(width / 2, height / 2 - 20, '欢迎回到家园\n请在下方选择你要进入的设施', {
            fontSize: '20px',
            fontFamily: UITheme.fonts.body,
            color: UITheme.colors.textSecondary,
            align: 'center',
            lineSpacing: 10
        }).setOrigin(0.5);

        // 底部导航栏区域
        this.createBottomNav(width, height);
    }

    private createBottomNav(width: number, height: number) {
        const navY = height - 80;

        // 导航按钮配置
        const buttons = [
            { text: '背包', color: UITheme.colors.secondary, action: () => this.openPanel('背包') },
            { text: '牧场', color: UITheme.colors.warning, action: () => this.openPanel('牧场') },
            { text: '融合台', color: UITheme.colors.accent, action: () => this.openPanel('融合台') },
            { text: '出发探险', color: UITheme.colors.success, action: () => this.startAdventure() },
        ];

        const startX = width * 0.15;
        const endX = width * 0.85;
        const spacing = (endX - startX) / (buttons.length - 1);

        buttons.forEach((btn, index) => {
            const x = startX + index * spacing;
            UIHelper.createModernButton(
                this,
                x,
                navY,
                btn.text,
                btn.action,
                btn.color
            ).setScale(0.85); // 按钮稍微缩放一点以适应横排
        });

        // 返回标题界面按钮 (可选，放在角落)
        const backBtn = UIHelper.createModernButton(
            this,
            60,
            40,
            '返回',
            () => this.scene.start('MenuScene'),
            UITheme.colors.danger
        ).setScale(0.6);
    }

    private openPanel(panelName: string) {
        const { width, height } = this.cameras.main;

        // 清理旧面板
        if (this.currentPanel) {
            this.currentPanel.destroy();
        }

        // 隐藏占位文字
        this.panelTitle.setVisible(false);

        this.currentPanel = this.add.container(width * 0.1, height * 0.2);

        // 内部标题
        const title = this.add.text(width * 0.4, 20, panelName, {
            fontSize: '24px',
            fontFamily: UITheme.fonts.title,
            color: UITheme.colors.textPrimary,
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.currentPanel.add(title);

        // 渲染不同内容
        if (panelName === '背包') {
            this.renderSpritesList(this.inventory.getSprites(), '背包为空');
        } else if (panelName === '牧场') {
            this.renderSpritesList(this.outsideSystem.getStorageSprites(), '牧场为空');
        } else if (panelName === '融合台') {
            this.renderFusionPanel();
        }
    }

    private renderSpritesList(sprites: Sprite[], emptyText: string) {
        if (!this.currentPanel) return;

        if (sprites.length === 0) {
            const emptyMsg = this.add.text(this.cameras.main.width * 0.4, 100, emptyText, {
                fontSize: '18px',
                color: UITheme.colors.textMuted
            }).setOrigin(0.5);
            this.currentPanel.add(emptyMsg);
            return;
        }

        // 初始化选中状态
        this.renderAdvancedSpriteView(sprites, 0);
    }

    private renderAdvancedSpriteView(sprites: Sprite[], selectedIndex: number) {
        const { width, height } = this.cameras.main;
        const panelWidth = width * 0.8;
        const panelHeight = height * 0.6;

        // 1. 清理旧信息区
        if (this.selectedSpriteInfoContainer) this.selectedSpriteInfoContainer.destroy();
        if (this.selectedSpriteAvatarContainer) this.selectedSpriteAvatarContainer.destroy();

        this.selectedSpriteInfoContainer = this.add.container(0, 50);
        this.selectedSpriteAvatarContainer = this.add.container(0, panelHeight - 100);
        this.currentPanel!.add([this.selectedSpriteInfoContainer, this.selectedSpriteAvatarContainer]);

        const selectedSprite = sprites[selectedIndex];

        // --- 整体布局调整 (JRPG 风格) ---
        // 左上角头像区
        const portraitBoxX = 120;
        const portraitBoxY = 80;

        // 头像底板 (复古暗色)
        const portraitBg = this.add.rectangle(portraitBoxX, portraitBoxY, 140, 140, 0x1A1A2E, 0.8);
        portraitBg.setStrokeStyle(3, 0x4A4A6A); // 像素风边框色

        // 放大渲染精灵实体 (头像尺度 Scale: 4)
        const portraitSprite = SpriteRenderer.render(this, portraitBoxX, portraitBoxY, selectedSprite, 4);

        // 还原火狐特有的小尾巴发光球体 (如果是火狐的话)
        if (selectedSprite.id.includes('fire') || selectedSprite.element === 'fire') {
            const orbPositions = [
                { x: -30, y: 30, size: 8, color: 0xFFA500 }, // 橙
                { x: -45, y: 15, size: 6, color: 0xFF4500 }, // 红橙
                { x: -55, y: 40, size: 5, color: 0xFFFF00 }, // 黄
                { x: -20, y: 45, size: 4, color: 0xFF8C00 }  // 深橙
            ];

            // 确保能拿到 SpriteRenderer 中的 container 以添加内容
            if (portraitSprite instanceof Phaser.GameObjects.Container) {
                orbPositions.forEach(orb => {
                    const circle = this.scene.scene.add.circle(orb.x, orb.y, orb.size, orb.color, 0.8);
                    this.tweens.add({
                        targets: circle,
                        alpha: 0.2,
                        y: '-=10',
                        duration: Phaser.Math.Between(800, 1500),
                        yoyo: true,
                        repeat: -1
                    });
                    portraitSprite.add(circle);
                });
            }
        }

        // 精灵呼吸动效 (轻微)
        this.tweens.add({
            targets: portraitSprite,
            y: portraitBoxY - 5,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.selectedSpriteInfoContainer.add([portraitBg, portraitSprite]);

        // --- 右侧信息面板 (羊皮纸/深蓝分层风格) ---
        const rightPanelX = panelWidth * 0.25;
        const rightPanelY = 20;
        const rightPanelW = panelWidth * 0.7;
        const rightPanelH = 340;

        const infoBg = this.add.rectangle(rightPanelX + rightPanelW / 2, rightPanelY + rightPanelH / 2, rightPanelW, rightPanelH, 0x16213E, 0.85);
        infoBg.setStrokeStyle(4, Phaser.Display.Color.HexStringToColor(UITheme.colors.primary).color);
        this.selectedSpriteInfoContainer.add(infoBg);

        // 标题 STATUS
        const statusTitle = this.add.text(rightPanelX + 20, rightPanelY + 15, 'STATUS', {
            fontSize: '24px', fontFamily: UITheme.fonts.title, color: UITheme.colors.textPrimary, fontStyle: 'bold'
        });

        // 分割线
        const divider = this.add.rectangle(rightPanelX + rightPanelW / 2, rightPanelY + 50, rightPanelW - 40, 2, 0x4A4A6A);

        // 精灵名称与等级
        const elementColor = UIHelper.getElementColor(selectedSprite.element);
        const nameText = this.add.text(rightPanelX + 20, rightPanelY + 65, selectedSprite.name, {
            fontSize: '28px', fontFamily: UITheme.fonts.title, color: UITheme.colors.textPrimary, fontStyle: 'bold'
        });
        const levelText = this.add.text(nameText.x + nameText.width + 15, nameText.y + 5, `LV.${selectedSprite.level} [${selectedSprite.element.toUpperCase()}]`, {
            fontSize: '20px', fontFamily: UITheme.fonts.title, color: elementColor, fontStyle: 'bold'
        });

        this.selectedSpriteInfoContainer.add([statusTitle, divider, nameText, levelText]);

        // 属性区块 (带小图标)
        const statsStartX = rightPanelX + 20;
        const statsStartY = rightPanelY + 120;
        const { hp, maxHP, atk, def, spd } = selectedSprite.stats;

        // 模拟像素小图标
        this.addStatRowWithIcon(this.selectedSpriteInfoContainer, statsStartX, statsStartY, '❤ HP', `${hp}/${maxHP}`, UITheme.colors.success);
        this.addStatRowWithIcon(this.selectedSpriteInfoContainer, statsStartX, statsStartY + 40, '⚔ ATK', `${atk}`, UITheme.colors.danger);
        this.addStatRowWithIcon(this.selectedSpriteInfoContainer, statsStartX + 180, statsStartY, '⛨ DEF', `${def}`, UITheme.colors.secondary);
        this.addStatRowWithIcon(this.selectedSpriteInfoContainer, statsStartX + 180, statsStartY + 40, '⚡ SPD', `${spd}`, UITheme.colors.warning);

        // 技能区块 (带火焰小图标)
        const skillsTitle = this.add.text(rightPanelX + 20, statsStartY + 90, 'SKILLS', {
            fontSize: '20px', fontFamily: UITheme.fonts.title, color: '#A6ADC8', fontStyle: 'bold'
        });
        this.selectedSpriteInfoContainer.add(skillsTitle);

        selectedSprite.skills.forEach((skill, idx) => {
            const skillColor = UIHelper.getElementColor(skill.element);
            const col = idx % 2;
            const row = Math.floor(idx / 2);

            const skTxt = this.add.text(rightPanelX + 20 + col * 250, statsStartY + 125 + row * 35, `🔥 ${skill.name} (PP:${skill.pp}/${skill.maxPP})`, {
                fontSize: '16px', color: skillColor, fontFamily: UITheme.fonts.body
            });
            this.selectedSpriteInfoContainer!.add(skTxt);
        });

        // --- 底部头像切换列表 ---
        const listLabel = this.add.text(0, -30, '拥有精灵列表:', { fontSize: '14px', color: UITheme.colors.textMuted });
        this.selectedSpriteAvatarContainer.add(listLabel);

        sprites.forEach((s, idx) => {
            const avatarX = idx * 90 + 40;
            // 头像底框
            const isSelected = idx === selectedIndex;
            const borderColor = isSelected ? UITheme.colors.primary : '#334455';
            const bgAlpha = isSelected ? 0.8 : 0.4;

            const avatarBox = this.add.rectangle(avatarX, 10, 70, 70, 0x11111B, bgAlpha);
            avatarBox.setStrokeStyle(isSelected ? 3 : 1, Phaser.Display.Color.HexStringToColor(borderColor).color);
            avatarBox.setInteractive({ useHandCursor: true });

            // 头像缩微图
            const miniSprite = SpriteRenderer.render(this, avatarX, 10, s, 2);

            // 点击切换逻辑
            avatarBox.on('pointerdown', () => {
                this.renderAdvancedSpriteView(sprites, idx);
            });

            // Hover动效
            avatarBox.on('pointerover', () => avatarBox.setAlpha(1));
            avatarBox.on('pointerout', () => avatarBox.setAlpha(bgAlpha));

            this.selectedSpriteAvatarContainer!.add([avatarBox, miniSprite]);
        });
    }

    private addStatRowWithIcon(container: Phaser.GameObjects.Container, x: number, y: number, iconLabel: string, value: string, colorHex: string) {
        // 图标+名称
        const labelTxt = this.scene.scene.add.text(x, y, iconLabel, {
            fontSize: '18px', color: colorHex, fontFamily: UITheme.fonts.title, fontStyle: 'bold'
        });

        // 数值
        const valTxt = this.scene.scene.add.text(x + 90, y, value, {
            fontSize: '18px', color: UITheme.colors.textPrimary, fontFamily: 'monospace'
        });

        container.add([labelTxt, valTxt]);
    }

    private renderFusionPanel() {
        if (!this.currentPanel) return;

        const msg = this.add.text(this.cameras.main.width * 0.4, 100, '请选择两只精灵进行融合\n(融合功能正在建设中...)', {
            fontSize: '18px',
            color: UITheme.colors.accent,
            align: 'center',
            lineSpacing: 8
        }).setOrigin(0.5);

        this.currentPanel.add(msg);
    }

    private startAdventure() {
        // 携带背包和局外系统进入下一个场景
        this.scene.start('StageSelectScene', {
            playerTeam: this.inventory.getSprites(),
            inventory: this.inventory,
            outsideSystem: this.outsideSystem
        });
    }
}

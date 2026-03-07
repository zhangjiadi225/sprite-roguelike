import Phaser from 'phaser';
import { Sprite, SpriteSkill } from '../data/types';
import { BattleSystem } from '../systems/BattleSystem';
import { Stage, StageManager, BattleRewards } from '../systems/StageSystem';
import { UITheme, UIHelper } from '../ui/UITheme';
import { SpriteRenderer } from '../systems/SpriteRenderer';

export default class CombatScene extends Phaser.Scene {
  private stage!: Stage;
  private playerSprite!: Sprite;
  private enemySprite!: Sprite;
  private stageManager!: StageManager;

  private turn: number = 0;
  private battleLog: string[] = [];
  private isPlayerTurn: boolean = true;
  private battleEnded: boolean = false;

  // UI 元素引用
  private playerHPFill!: Phaser.GameObjects.Graphics;
  private enemyHPFill!: Phaser.GameObjects.Graphics;
  private playerHPText!: Phaser.GameObjects.Text;
  private enemyHPText!: Phaser.GameObjects.Text;
  private battleLogText!: Phaser.GameObjects.Text;
  private turnText!: Phaser.GameObjects.Text;

  // 底部血条引用
  private playerBottomHPFill!: Phaser.GameObjects.Graphics;
  private enemyBottomHPFill!: Phaser.GameObjects.Graphics;

  // 容器引用用于动画和飘字定位
  private playerContainer!: Phaser.GameObjects.Container;
  private enemyContainer!: Phaser.GameObjects.Container;

  constructor() {
    super({ key: 'CombatScene' });
  }

  init(data: {
    stage: Stage,
    playerSprite: Sprite,
    enemySprite: Sprite,
    stageManager: StageManager
  }) {
    this.stage = data.stage;
    this.playerSprite = data.playerSprite;
    this.enemySprite = data.enemySprite;
    this.stageManager = data.stageManager;
    this.turn = 1;
    this.battleLog = [`遭遇了 ${this.enemySprite.name}！`];
    this.isPlayerTurn = true;
    this.battleEnded = false;
  }

  create() {
    this.createBackground();
    this.createTurnIndicator();
    this.createSpriteDisplay();
    this.createStatusHUDs();
    this.createActionPanel();
    this.createBattleLog();
    this.updateHP(); // 确保开战时底座极简血条被正确渲染一次
  }

  private createBackground() {
    const { width, height } = this.cameras.main;
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(
      Phaser.Display.Color.HexStringToColor('#11111B').color,
      Phaser.Display.Color.HexStringToColor('#1E1E2E').color,
      Phaser.Display.Color.HexStringToColor('#313244').color,
      Phaser.Display.Color.HexStringToColor('#11111B').color,
      1
    );
    graphics.fillRect(0, 0, width, height);

    // 添加战斗氛围
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const particle = this.add.circle(x, y, 2, 0xFFFFFF, 0.3);

      this.tweens.add({
        targets: particle,
        alpha: 0.1,
        duration: Phaser.Math.Between(1000, 2000),
        yoyo: true,
        repeat: -1
      });
    }
  }

  private createTurnIndicator() {
    const { width } = this.cameras.main;
    this.turnText = this.add.text(width / 2, 30, `${this.stage.name} - 回合 ${this.turn}`, {
      fontSize: '20px',
      color: UITheme.colors.textPrimary,
      fontFamily: UITheme.fonts.title,
      fontStyle: 'bold'
    });
    this.turnText.setOrigin(0.5, 0.5);
    this.turnText.setShadow(0, 2, '#000000', 4, true, true);
  }

  private createSpriteDisplay() {
    const { width, height } = this.cameras.main;

    // 玩家精灵（中间偏左）
    this.playerContainer = this.add.container(width / 2 - 180, height / 2 - 40);
    const pShadow = this.add.ellipse(0, 70, 100, 30, 0x000000, 0.4);
    this.playerContainer.add(pShadow);
    const playerImg = SpriteRenderer.render(this, 0, 0, this.playerSprite, 1.5);
    this.playerContainer.add(playerImg);

    // 玩家底座血条
    const pBgBar = this.add.graphics();
    pBgBar.fillStyle(0x000000, 0.6);
    pBgBar.fillRoundedRect(-50, 90, 100, 8, 4);
    this.playerContainer.add(pBgBar);
    this.playerBottomHPFill = this.add.graphics();
    this.playerContainer.add(this.playerBottomHPFill);

    // 敌方精灵（中间偏右）
    this.enemyContainer = this.add.container(width / 2 + 180, height / 2 - 40);
    const eShadow = this.add.ellipse(0, 70, 100, 30, 0x000000, 0.4);
    this.enemyContainer.add(eShadow);
    const enemyImg = SpriteRenderer.render(this, 0, 0, this.enemySprite, 1.5);
    this.enemyContainer.add(enemyImg);

    // 敌方底座血条
    const eBgBar = this.add.graphics();
    eBgBar.fillStyle(0x000000, 0.6);
    eBgBar.fillRoundedRect(-50, 90, 100, 8, 4);
    this.enemyContainer.add(eBgBar);
    this.enemyBottomHPFill = this.add.graphics();
    this.enemyContainer.add(this.enemyBottomHPFill);

    // 简单的入场动画
    this.playerContainer.setX(width / 2 - 300);
    this.playerContainer.setAlpha(0);
    this.tweens.add({ targets: this.playerContainer, x: width / 2 - 180, alpha: 1, duration: 600, ease: 'Back.easeOut' });

    this.enemyContainer.setX(width / 2 + 300);
    this.enemyContainer.setAlpha(0);
    this.tweens.add({ targets: this.enemyContainer, x: width / 2 + 180, alpha: 1, duration: 600, ease: 'Back.easeOut' });
  }

  private createStatusHUDs() {
    const { width } = this.cameras.main;
    // 玩家状态栏 (左上加点边距)
    this.createStatusCard(20, 20, this.playerSprite, true);
    // 敌方状态栏 (右上角)
    this.createStatusCard(width - 240, 20, this.enemySprite, false);
  }

  private createStatusCard(x: number, y: number, sprite: Sprite, isPlayer: boolean) {
    const container = this.add.container(x, y);

    // 半透明极简底板
    const bg = this.add.graphics();
    bg.fillStyle(0x11111B, 0.6);
    bg.fillRoundedRect(0, 0, 220, 80, 12);
    bg.lineStyle(1, 0xFFFFFF, 0.1);
    bg.strokeRoundedRect(0, 0, 220, 80, 12);
    container.add(bg);

    // 名称
    const name = this.add.text(15, 15, sprite.name, {
      fontSize: '20px',
      color: isPlayer ? UITheme.colors.success : UITheme.colors.danger,
      fontFamily: UITheme.fonts.title,
      fontStyle: 'bold'
    });
    container.add(name);

    // 等级
    const levelStr = sprite.isBoss ? `Boss Lv.${sprite.level}` : `Lv.${sprite.level}`;
    const level = this.add.text(205, 18, levelStr, {
      fontSize: '14px',
      color: sprite.isBoss ? UITheme.colors.warning : UITheme.colors.textSecondary,
      fontFamily: UITheme.fonts.body,
      fontStyle: 'bold'
    });
    level.setOrigin(1, 0); // 右对齐
    container.add(level);

    // HP条背景
    const hpBgWidth = 190;
    const hpBgHeight = 16;
    const hpBg = this.add.graphics();
    hpBg.fillStyle(0x000000, 0.8);
    hpBg.fillRoundedRect(15, 45, hpBgWidth, hpBgHeight, 8);
    container.add(hpBg);

    // HP条填充
    const hpRatio = Math.max(0, sprite.stats.hp / sprite.stats.maxHP);
    const hpFill = this.add.graphics();
    const hpColor = Phaser.Display.Color.HexStringToColor(isPlayer ? UITheme.colors.success : UITheme.colors.danger).color;
    hpFill.fillStyle(hpColor, 1);
    hpFill.fillRoundedRect(15 + 2, 47, Math.max(8, (hpBgWidth - 4) * hpRatio), hpBgHeight - 4, 6);
    container.add(hpFill);

    if (isPlayer) {
      this.playerHPFill = hpFill as any;
    } else {
      this.enemyHPFill = hpFill as any;
    }

    // HP文字
    const hpText = this.add.text(15 + hpBgWidth / 2, 45 + hpBgHeight / 2,
      `${sprite.stats.hp} / ${sprite.stats.maxHP}`, {
      fontSize: '11px',
      color: UITheme.colors.textPrimary,
      fontFamily: UITheme.fonts.body,
      fontStyle: 'bold'
    });
    hpText.setOrigin(0.5);
    container.add(hpText);

    if (isPlayer) {
      this.playerHPText = hpText;
    } else {
      this.enemyHPText = hpText;
    }
  }

  private createActionPanel() {
    const { width, height } = this.cameras.main;
    const panelHeight = 140;
    const panelY = height - panelHeight;

    // 占用底部的全宽操作条
    const bg = this.add.graphics();
    bg.fillStyle(0x11111B, 0.85);

    // 只给左上、右上绘制圆角
    const r = 20;
    bg.beginPath();
    bg.moveTo(0, panelY + r);
    bg.arc(r, panelY + r, r, Math.PI, 1.5 * Math.PI);
    bg.lineTo(width - r, panelY);
    bg.arc(width - r, panelY + r, r, 1.5 * Math.PI, 0);
    bg.lineTo(width, height);
    bg.lineTo(0, height);
    bg.closePath();
    bg.fillPath();

    bg.lineStyle(2, Phaser.Display.Color.HexStringToColor(UITheme.colors.accent).color, 0.5);
    bg.beginPath();
    bg.moveTo(0, panelY + r);
    bg.arc(r, panelY + r, r, Math.PI, 1.5 * Math.PI);
    bg.lineTo(width - r, panelY);
    bg.arc(width - r, panelY + r, r, 1.5 * Math.PI, 0);
    bg.strokePath();

    // 技能按钮区的标题
    const title = this.add.text(width / 2, panelY + 20, '— 技 能 行 动 —', {
      fontSize: '16px',
      color: UITheme.colors.accent,
      fontFamily: UITheme.fonts.title,
      letterSpacing: 4
    });
    title.setOrigin(0.5);

    // 居中排列技能
    const totalSkills = this.playerSprite.skills.length;
    const padding = 130; // 按钮间隔
    const startX = width / 2 - (totalSkills - 1) * padding / 2;

    this.playerSprite.skills.forEach((skill, index) => {
      this.createSkillButton(startX + index * padding, panelY + 75, skill);
    });

    // 逃跑按钮放右下角
    UIHelper.createModernButton(
      this,
      width - 80,
      panelY + 75,
      '逃 跑',
      () => this.flee(),
      UITheme.colors.textMuted,
      100,
      40
    );
  }

  private createSkillButton(x: number, y: number, skill: SpriteSkill) {
    const canUse = skill.pp > 0 && this.isPlayerTurn && !this.battleEnded;
    const container = this.add.container(x, y);

    // 圆角技能背景卡
    const bg = this.add.graphics();
    const isReady = canUse ? 1 : 0.4;
    bg.fillStyle(Phaser.Display.Color.HexStringToColor(UITheme.colors.bgLight).color, isReady);
    bg.fillRoundedRect(-55, -35, 110, 70, 12);

    // 属性边框
    bg.lineStyle(2, Phaser.Display.Color.HexStringToColor(UIHelper.getElementColor(skill.element)).color, isReady);
    bg.strokeRoundedRect(-55, -35, 110, 70, 12);

    // 技能名
    const name = this.add.text(0, -15, skill.name, {
      fontSize: '16px',
      color: canUse ? UITheme.colors.textPrimary : UITheme.colors.textMuted,
      fontFamily: UITheme.fonts.title,
      fontStyle: 'bold'
    });
    name.setOrigin(0.5);

    // PP
    const pp = this.add.text(0, 8, `PP: ${skill.pp}/${skill.maxPP}`, {
      fontSize: '12px',
      color: canUse ? UITheme.colors.textSecondary : UITheme.colors.textMuted,
      fontFamily: UITheme.fonts.body
    });
    pp.setOrigin(0.5);

    // 威力
    const power = this.add.text(0, 24, `威力: ${skill.power}`, {
      fontSize: '11px',
      color: UITheme.colors.textMuted,
      fontFamily: UITheme.fonts.body
    });
    power.setOrigin(0.5);

    // 热区
    const hitArea = this.add.rectangle(0, 0, 110, 70, 0x00, 0);

    container.add([bg, name, pp, power, hitArea]);
    container.setSize(110, 70);

    if (canUse) {
      hitArea.setInteractive({ useHandCursor: true });

      hitArea.on('pointerover', () => {
        this.tweens.add({ targets: container, scaleX: 1.1, scaleY: 1.1, duration: 150, ease: 'Sine.easeOut' });
      });

      hitArea.on('pointerout', () => {
        this.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 150, ease: 'Sine.easeOut' });
      });

      hitArea.on('pointerdown', () => {
        this.tweens.add({
          targets: container, scaleX: 0.9, scaleY: 0.9, duration: 80, yoyo: true,
          onComplete: () => this.useSkill(skill)
        });
      });
    }
  }

  private createBattleLog() {
    const { height } = this.cameras.main;
    // 放在底部操作面板的左上方
    const panelHeight = 140;
    const logY = height - panelHeight - 10;

    // 这个日志没有背景了，直接纯文字显示最后几条
    this.battleLogText = this.add.text(20, logY, this.battleLog.slice(-4).join('\n'), {
      fontSize: '14px',
      color: UITheme.colors.textSecondary,
      fontFamily: UITheme.fonts.body,
      lineSpacing: 8,
      align: 'left'
    });
    this.battleLogText.setOrigin(0, 1); // 左下角对齐
    this.battleLogText.setShadow(0, 2, '#000000', 4, true, true);
  }

  private animateAttack(attacker: Phaser.GameObjects.Container, target: Phaser.GameObjects.Container, onHit: () => void) {
    const originalX = attacker.x;
    const attackDistance = 60;
    const dir = target.x > attacker.x ? 1 : -1;

    this.tweens.add({
      targets: attacker,
      x: originalX - dir * 20,
      duration: 150,
      ease: 'Sine.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: attacker,
          x: originalX + dir * attackDistance,
          duration: 100,
          ease: 'Power2',
          onComplete: () => {
            onHit();
            this.tweens.add({
              targets: attacker,
              x: originalX,
              duration: 200,
              ease: 'Sine.easeInOut'
            });
            this.tweens.add({
              targets: target,
              x: target.x + dir * 15,
              duration: 50,
              yoyo: true,
              repeat: 2
            });
          }
        });
      }
    });
  }

  private showDamageText(targetContainer: Phaser.GameObjects.Container, damage: number, isCrit: boolean, effectiveness: number) {
    let color = '#FFFFFF';
    let size = '28px';
    let prefix = '-';

    if (isCrit) {
      color = UITheme.colors.accent;
      size = '36px';
      prefix = '💥 -';
    } else if (effectiveness > 1) {
      color = UITheme.colors.danger;
      size = '32px';
    } else if (effectiveness < 1) {
      color = '#AAAAAA';
      size = '24px';
    }

    const startX = targetContainer.x + Phaser.Math.Between(-20, 20);
    const startY = targetContainer.y - 40;

    const damageText = this.add.text(startX, startY, `${prefix}${damage}`, {
      fontSize: size,
      color: color,
      fontFamily: UITheme.fonts.title,
      fontStyle: 'bold'
    });
    damageText.setOrigin(0.5);
    damageText.setShadow(0, 2, '#000000', 4, true, true);
    damageText.setDepth(100);

    this.tweens.add({
      targets: damageText,
      y: startY - 80,
      alpha: 0,
      duration: 1200,
      ease: 'Cubic.easeOut',
      onComplete: () => damageText.destroy()
    });
  }

  private useSkill(skill: SpriteSkill) {
    if (!this.isPlayerTurn || this.battleEnded) return;
    this.isPlayerTurn = false;

    this.animateAttack(this.playerContainer, this.enemyContainer, () => {
      const result = BattleSystem.useSkill(this.playerSprite, this.enemySprite, skill);
      let message = `> ${this.playerSprite.name}使用了 [${skill.name}]`;

      UIHelper.showToast(this, `💥 ${skill.name}！`);
      this.showDamageText(this.enemyContainer, result.damage, result.critical, result.effectiveness);

      if (result.critical) {
        message += '，暴击！';
        this.time.delayedCall(300, () => UIHelper.showToast(this, `⚡ 暴击！`));
      }
      if (result.effectiveness > 1) {
        message += '（效果拔群）';
        this.time.delayedCall(600, () => UIHelper.showToast(this, `🔥 效果拔群！`));
      }
      if (result.effectiveness < 1) {
        message += '（效果不佳）';
        this.time.delayedCall(600, () => UIHelper.showToast(this, `❄ 效果不佳`));
      }
      message += `，造成 ${result.damage} 伤害。`;

      this.battleLog.push(message);
      this.updateBattleLog();
      this.updateHP();

      if (this.enemySprite.stats.hp <= 0) {
        this.time.delayedCall(1000, () => this.endBattle(true));
        return;
      }

      this.time.delayedCall(1500, () => this.enemyTurn());
    });
  }

  private enemyTurn() {
    const availableSkills = this.enemySprite.skills.filter(s => s.pp > 0);
    if (availableSkills.length === 0) {
      this.isPlayerTurn = true;
      return;
    }

    const skill = availableSkills[Math.floor(Math.random() * availableSkills.length)];

    this.animateAttack(this.enemyContainer, this.playerContainer, () => {
      const result = BattleSystem.useSkill(this.enemySprite, this.playerSprite, skill);

      let message = `> ${this.enemySprite.name}使用了 [${skill.name}]`;
      UIHelper.showToast(this, `💥 敌方 ${skill.name}！`);
      this.showDamageText(this.playerContainer, result.damage, result.critical, result.effectiveness);

      if (result.critical) {
        message += '，暴击！';
        this.time.delayedCall(300, () => UIHelper.showToast(this, `⚡ 遭到暴击！`));
      }
      message += `，造成 ${result.damage} 伤害。`;

      this.battleLog.push(message);
      this.updateBattleLog();
      this.updateHP();

      if (this.playerSprite.stats.hp <= 0) {
        this.time.delayedCall(1000, () => this.endBattle(false));
        return;
      }

      this.turn++;
      this.turnText.setText(`${this.stage.name} - 回合 ${this.turn}`);
      this.isPlayerTurn = true;
    });
  }

  private updateHP() {
    const hpBgWidth = 190;
    const hpBgHeight = 16;

    // 更新玩家HP圆角条
    const playerRatio = Math.max(0, this.playerSprite.stats.hp / this.playerSprite.stats.maxHP);
    const playerGph = this.playerHPFill;
    const playerColor = Phaser.Display.Color.HexStringToColor(playerRatio < 0.3 ? UITheme.colors.danger : UITheme.colors.success).color;
    playerGph.clear();
    playerGph.fillStyle(playerColor, 1);
    playerGph.fillRoundedRect(15 + 2, 47, Math.max(8, (hpBgWidth - 4) * playerRatio), hpBgHeight - 4, 6);

    this.playerHPText.setText(`${this.playerSprite.stats.hp} / ${this.playerSprite.stats.maxHP}`);
    if (playerRatio < 0.3) {
      this.playerHPText.setColor(UITheme.colors.danger);
    } else {
      this.playerHPText.setColor(UITheme.colors.textPrimary);
    }

    // 底座小血条
    if (this.playerBottomHPFill) {
      this.playerBottomHPFill.clear();
      this.playerBottomHPFill.fillStyle(playerColor, 1);
      this.playerBottomHPFill.fillRoundedRect(-50 + 1, 91, Math.max(6, 98 * playerRatio), 6, 3);
    }

    // 更新敌人HP圆角条
    const enemyRatio = Math.max(0, this.enemySprite.stats.hp / this.enemySprite.stats.maxHP);
    const enemyGph = this.enemyHPFill;
    const enemyColor = Phaser.Display.Color.HexStringToColor(enemyRatio < 0.3 ? UITheme.colors.danger : (this.enemySprite.isBoss ? UITheme.colors.warning : UITheme.colors.success)).color;
    enemyGph.clear();
    enemyGph.fillStyle(enemyColor, 1);
    enemyGph.fillRoundedRect(15 + 2, 47, Math.max(8, (hpBgWidth - 4) * enemyRatio), hpBgHeight - 4, 6);

    this.enemyHPText.setText(`${this.enemySprite.stats.hp} / ${this.enemySprite.stats.maxHP}`);

    // 底座小血条
    if (this.enemyBottomHPFill) {
      this.enemyBottomHPFill.clear();
      this.enemyBottomHPFill.fillStyle(enemyColor, 1);
      this.enemyBottomHPFill.fillRoundedRect(-50 + 1, 91, Math.max(6, 98 * enemyRatio), 6, 3);
    }
  }

  private updateBattleLog() {
    this.battleLogText.setText(this.battleLog.slice(-4).join('\n'));
  }

  private endBattle(victory: boolean) {
    this.battleEnded = true;
    const rewards = this.stageManager.calculateRewards(this.stage, victory, false);

    if (victory) {
      const leveledUp = BattleSystem.gainExp(this.playerSprite, rewards.exp);
      rewards.levelUp = leveledUp;
      if (leveledUp) {
        rewards.newLevel = this.playerSprite.level;
      }
      this.stageManager.clearStage(this.stage.id);
      this.showVictoryScreen(rewards);
    } else {
      this.showDefeatScreen();
    }
  }

  private showVictoryScreen(rewards: BattleRewards) {
    const { width, height } = this.cameras.main;
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.9);
    overlay.setInteractive();

    const title = this.add.text(width / 2, height / 2 - 100, '✨ 胜 利', {
      fontSize: '48px',
      color: UITheme.colors.success,
      fontFamily: UITheme.fonts.title,
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);
    title.setShadow(0, 4, '#000000', 8, true, true);

    const rewardText = this.add.text(width / 2, height / 2,
      `获得经验: ${rewards.exp}\n获得金币: ${rewards.gold}${rewards.levelUp ? `\n\n🎉 升级了！Lv.${rewards.newLevel}` : ''}`, {
      fontSize: '20px',
      color: UITheme.colors.textPrimary,
      fontFamily: UITheme.fonts.body,
      align: 'center',
      lineSpacing: 10
    });
    rewardText.setOrigin(0.5);

    UIHelper.createModernButton(
      this,
      width / 2,
      height / 2 + 120,
      '继续冒险',
      () => this.scene.start('StageSelectScene', { playerTeam: [this.playerSprite] }),
      UITheme.colors.success,
      200,
      50
    );
  }

  private showDefeatScreen() {
    const { width, height } = this.cameras.main;
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.9);
    overlay.setInteractive();

    const title = this.add.text(width / 2, height / 2 - 50, '☠ 碎 击', {
      fontSize: '48px',
      color: UITheme.colors.danger,
      fontFamily: UITheme.fonts.title,
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);
    title.setShadow(0, 4, '#000000', 8, true, true);

    UIHelper.createModernButton(
      this,
      width / 2,
      height / 2 + 80,
      '逃跑并重整编队',
      () => this.scene.start('StageSelectScene', { playerTeam: [this.playerSprite] }),
      UITheme.colors.danger,
      260,
      50
    );
  }

  private flee() {
    this.scene.start('StageSelectScene', { playerTeam: [this.playerSprite] });
  }
}

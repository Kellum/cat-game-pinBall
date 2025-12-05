import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig';
import { RunState } from '../systems/RunState';
import { Upgrade, getRandomUpgrades, RARITY_COLORS } from '../systems/UpgradeRegistry';

interface UpgradeSceneData {
  runState?: RunState;
}

export class UpgradeScene extends Phaser.Scene {
  private runState!: RunState;
  private upgradeCards: Phaser.GameObjects.Container[] = [];
  private availableUpgrades: Upgrade[] = [];

  // Card dimensions
  private readonly CARD_WIDTH = 180;
  private readonly CARD_HEIGHT = 240;
  private readonly CARD_SPACING = 30;

  constructor() {
    super({ key: 'UpgradeScene' });
  }

  init(data: UpgradeSceneData): void {
    this.runState = data.runState || RunState.getInstance();
  }

  create(): void {
    // Dark overlay background
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.85);

    // Title
    this.add.text(GAME_WIDTH / 2, 120, 'ROUND COMPLETE!', {
      fontSize: '48px',
      color: '#00ff00',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5);

    // Round info
    const roundData = this.runState.getData();
    this.add.text(GAME_WIDTH / 2, 180, `Round ${roundData.currentRound - 1} | Score: ${roundData.totalScore}`, {
      fontSize: '24px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(GAME_WIDTH / 2, 280, 'Choose Your Upgrade', {
      fontSize: '36px',
      color: '#ffff00',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // Get 3 random upgrades
    this.availableUpgrades = getRandomUpgrades(3, roundData.activeUpgradeIds);

    // Create upgrade cards
    this.createUpgradeCards();
  }

  private createUpgradeCards(): void {
    const totalWidth = this.CARD_WIDTH * 3 + this.CARD_SPACING * 2;
    const startX = (GAME_WIDTH - totalWidth) / 2 + this.CARD_WIDTH / 2;
    const cardY = GAME_HEIGHT / 2 + 50;

    this.availableUpgrades.forEach((upgrade, index) => {
      const x = startX + index * (this.CARD_WIDTH + this.CARD_SPACING);
      const card = this.createUpgradeCard(upgrade, x, cardY);
      this.upgradeCards.push(card);

      // Animate cards appearing
      card.setScale(0);
      card.setAlpha(0);
      this.tweens.add({
        targets: card,
        scaleX: 1,
        scaleY: 1,
        alpha: 1,
        duration: 300,
        delay: index * 100,
        ease: 'Back.easeOut',
      });
    });
  }

  private createUpgradeCard(upgrade: Upgrade, x: number, y: number): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const rarityColor = RARITY_COLORS[upgrade.rarity];

    // Card background
    const cardBg = this.add.graphics();
    cardBg.fillStyle(0x222222, 1);
    cardBg.fillRoundedRect(
      -this.CARD_WIDTH / 2,
      -this.CARD_HEIGHT / 2,
      this.CARD_WIDTH,
      this.CARD_HEIGHT,
      12
    );

    // Rarity border
    cardBg.lineStyle(4, rarityColor, 1);
    cardBg.strokeRoundedRect(
      -this.CARD_WIDTH / 2,
      -this.CARD_HEIGHT / 2,
      this.CARD_WIDTH,
      this.CARD_HEIGHT,
      12
    );

    // Icon background circle
    cardBg.fillStyle(0x333333, 1);
    cardBg.fillCircle(0, -60, 40);

    container.add(cardBg);

    // Icon (emoji text as placeholder)
    const icon = this.add.text(0, -60, upgrade.icon, {
      fontSize: '48px',
    }).setOrigin(0.5);
    container.add(icon);

    // Name
    const name = this.add.text(0, 10, upgrade.name, {
      fontSize: '22px',
      color: '#ffffff',
      fontStyle: 'bold',
      align: 'center',
    }).setOrigin(0.5);
    container.add(name);

    // Rarity label
    const rarityLabel = this.add.text(0, 40, upgrade.rarity.toUpperCase(), {
      fontSize: '14px',
      color: Phaser.Display.Color.IntegerToColor(rarityColor).rgba,
      fontStyle: 'bold',
    }).setOrigin(0.5);
    container.add(rarityLabel);

    // Description
    const description = this.add.text(0, 80, upgrade.description, {
      fontSize: '16px',
      color: '#aaaaaa',
      align: 'center',
      lineSpacing: 4,
    }).setOrigin(0.5);
    container.add(description);

    // Hit area for interaction
    const hitArea = this.add.rectangle(0, 0, this.CARD_WIDTH, this.CARD_HEIGHT, 0x000000, 0);
    hitArea.setInteractive({ useHandCursor: true });
    container.add(hitArea);

    // Hover effects
    hitArea.on('pointerover', () => {
      this.tweens.add({
        targets: container,
        scaleX: 1.08,
        scaleY: 1.08,
        duration: 100,
        ease: 'Sine.easeOut',
      });
      cardBg.clear();
      cardBg.fillStyle(0x333333, 1);
      cardBg.fillRoundedRect(
        -this.CARD_WIDTH / 2,
        -this.CARD_HEIGHT / 2,
        this.CARD_WIDTH,
        this.CARD_HEIGHT,
        12
      );
      cardBg.lineStyle(6, rarityColor, 1);
      cardBg.strokeRoundedRect(
        -this.CARD_WIDTH / 2,
        -this.CARD_HEIGHT / 2,
        this.CARD_WIDTH,
        this.CARD_HEIGHT,
        12
      );
      cardBg.fillStyle(0x444444, 1);
      cardBg.fillCircle(0, -60, 40);
    });

    hitArea.on('pointerout', () => {
      this.tweens.add({
        targets: container,
        scaleX: 1,
        scaleY: 1,
        duration: 100,
        ease: 'Sine.easeOut',
      });
      cardBg.clear();
      cardBg.fillStyle(0x222222, 1);
      cardBg.fillRoundedRect(
        -this.CARD_WIDTH / 2,
        -this.CARD_HEIGHT / 2,
        this.CARD_WIDTH,
        this.CARD_HEIGHT,
        12
      );
      cardBg.lineStyle(4, rarityColor, 1);
      cardBg.strokeRoundedRect(
        -this.CARD_WIDTH / 2,
        -this.CARD_HEIGHT / 2,
        this.CARD_WIDTH,
        this.CARD_HEIGHT,
        12
      );
      cardBg.fillStyle(0x333333, 1);
      cardBg.fillCircle(0, -60, 40);
    });

    // Click to select
    hitArea.on('pointerdown', () => {
      this.selectUpgrade(upgrade);
    });

    return container;
  }

  private selectUpgrade(upgrade: Upgrade): void {
    // Apply the upgrade
    this.runState.applyUpgrade(upgrade.id, upgrade.effects);

    // Flash effect on all cards
    this.upgradeCards.forEach(card => {
      this.tweens.add({
        targets: card,
        alpha: 0,
        scaleX: 0.8,
        scaleY: 0.8,
        duration: 200,
      });
    });

    // Show selected upgrade confirmation
    const selectedText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50, `${upgrade.name} Selected!`, {
      fontSize: '36px',
      color: '#00ff00',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: selectedText,
      alpha: 1,
      duration: 200,
      onComplete: () => {
        // Transition to next round after short delay
        this.time.delayedCall(800, () => {
          this.scene.start('PinballScene', {
            catColor: this.runState.getData().characterColor,
          });
        });
      },
    });
  }
}

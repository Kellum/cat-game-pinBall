import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig';
import { RunState } from '../systems/RunState';

interface GameOverSceneData {
  runState?: RunState;
}

export class GameOverScene extends Phaser.Scene {
  private runState!: RunState;

  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data: GameOverSceneData): void {
    this.runState = data.runState || RunState.getInstance();
  }

  create(): void {
    const runData = this.runState.getData();

    // Background
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x1a1a2e);

    // Title
    this.add.text(GAME_WIDTH / 2, 180, 'RUN COMPLETE', {
      fontSize: '56px',
      color: '#ff6600',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 8,
    }).setOrigin(0.5);

    // Stats container
    const statsY = 350;
    const statSpacing = 60;

    // Rounds completed
    this.createStatRow('Rounds', `${runData.currentRound - 1}`, statsY);

    // Total score
    this.createStatRow('Score', `${runData.totalScore}`, statsY + statSpacing);

    // Upgrades collected
    this.createStatRow('Upgrades', `${runData.activeUpgradeIds.length}`, statsY + statSpacing * 2);

    // Show upgrade icons
    if (runData.activeUpgradeIds.length > 0) {
      this.add.text(GAME_WIDTH / 2, statsY + statSpacing * 3, 'Collected:', {
        fontSize: '20px',
        color: '#888888',
      }).setOrigin(0.5);

      // Display upgrade badges
      const badgeY = statsY + statSpacing * 3.5;
      const badgeSpacing = 50;
      const startX = GAME_WIDTH / 2 - ((runData.activeUpgradeIds.length - 1) * badgeSpacing) / 2;

      runData.activeUpgradeIds.forEach((_id, index) => {
        const badge = this.add.graphics();
        badge.fillStyle(0x333333, 1);
        badge.fillCircle(startX + index * badgeSpacing, badgeY, 20);
        badge.lineStyle(2, 0x00ff00, 1);
        badge.strokeCircle(startX + index * badgeSpacing, badgeY, 20);
      });
    }

    // Buttons
    const buttonY = GAME_HEIGHT - 280;

    // New Run button
    this.createButton(GAME_WIDTH / 2, buttonY, 'NEW RUN', 0x00aa00, () => {
      this.runState.newRun();
      this.scene.start('MenuScene');
    });

    // Main Menu button
    this.createButton(GAME_WIDTH / 2, buttonY + 90, 'MAIN MENU', 0x666666, () => {
      this.scene.start('MenuScene');
    });

    // Animate elements
    this.cameras.main.fadeIn(500);
  }

  private createStatRow(label: string, value: string, y: number): void {
    // Label
    this.add.text(GAME_WIDTH / 2 - 100, y, label, {
      fontSize: '28px',
      color: '#888888',
    }).setOrigin(1, 0.5);

    // Value
    this.add.text(GAME_WIDTH / 2 + 100, y, value, {
      fontSize: '36px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5);
  }

  private createButton(
    x: number,
    y: number,
    text: string,
    color: number,
    onClick: () => void
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    // Button background
    const bg = this.add.graphics();
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(-140, -35, 280, 70, 15);
    // Lighten the border color
    const borderColor = Phaser.Display.Color.ValueToColor(color);
    borderColor.brighten(30);
    bg.lineStyle(4, borderColor.color, 1);
    bg.strokeRoundedRect(-140, -35, 280, 70, 15);
    container.add(bg);

    // Button text
    const buttonText = this.add.text(0, 0, text, {
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    container.add(buttonText);

    // Hit area
    const hitArea = this.add.rectangle(0, 0, 280, 70, 0x000000, 0);
    hitArea.setInteractive({ useHandCursor: true });
    container.add(hitArea);

    // Hover effects
    hitArea.on('pointerover', () => {
      container.setScale(1.05);
    });

    hitArea.on('pointerout', () => {
      container.setScale(1);
    });

    hitArea.on('pointerdown', onClick);

    return container;
  }
}

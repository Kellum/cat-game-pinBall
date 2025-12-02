import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig';

interface UIData {
  hearts: number;
  maxHearts: number;
  enemiesRemaining: number; // Actually enemies defeated in endless mode
  score: number;
  superMeter: number;
  maxSuperMeter: number;
  distance?: number;
}

export class UIScene extends Phaser.Scene {
  private heartImages: Phaser.GameObjects.Image[] = [];
  private enemyText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private distanceText!: Phaser.GameObjects.Text;
  private superMeterBg!: Phaser.GameObjects.Graphics;
  private superMeterFill!: Phaser.GameObjects.Graphics;

  // Pause state
  private isPaused = false;
  private pauseOverlay!: Phaser.GameObjects.Container;

  private uiData: UIData = {
    hearts: 3,
    maxHearts: 3,
    enemiesRemaining: 0,
    score: 0,
    superMeter: 0,
    maxSuperMeter: 100,
    distance: 0,
  };

  constructor() {
    super({ key: 'UIScene' });
  }

  init(data: UIData): void {
    this.uiData = { ...this.uiData, ...data };
    this.isPaused = false;
  }

  create(): void {
    // Hearts display (top left)
    this.createHearts();

    // Distance (top center)
    this.distanceText = this.add.text(GAME_WIDTH / 2, 20, '', {
      fontSize: '28px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5, 0);

    // Enemy counter (top right - moved to make room for pause)
    this.enemyText = this.add.text(GAME_WIDTH - 80, 20, '', {
      fontSize: '24px',
      color: '#ff6666',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(1, 0);

    // Score (below hearts)
    this.scoreText = this.add.text(20, 70, '', {
      fontSize: '20px',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 3,
    });

    // Pause button (top right corner)
    this.createPauseButton();

    // Pause overlay (hidden initially)
    this.createPauseOverlay();

    // Super meter (bottom of screen)
    this.createSuperMeter();

    // Update display
    this.updateDisplay();

    // Listen for updates from GameScene
    const gameScene = this.scene.get('GameScene');
    gameScene.events.on('updateUI', (data: UIData) => {
      this.uiData = data;
      this.updateDisplay();
    });
  }

  private createHearts(): void {
    for (let i = 0; i < this.uiData.maxHearts; i++) {
      const heart = this.add.image(30 + i * 45, 35, 'heart');
      heart.setScale(0.8);
      this.heartImages.push(heart);
    }
  }

  private createPauseButton(): void {
    const buttonX = GAME_WIDTH - 35;
    const buttonY = 35;

    // Pause button background
    const pauseBg = this.add.graphics();
    pauseBg.fillStyle(0x000000, 0.5);
    pauseBg.fillCircle(buttonX, buttonY, 25);
    pauseBg.lineStyle(3, 0xffffff, 0.8);
    pauseBg.strokeCircle(buttonX, buttonY, 25);

    // Pause icon (two vertical bars)
    const pauseIcon = this.add.graphics();
    pauseIcon.fillStyle(0xffffff, 1);
    pauseIcon.fillRect(buttonX - 10, buttonY - 12, 6, 24);
    pauseIcon.fillRect(buttonX + 4, buttonY - 12, 6, 24);

    // Hit area
    const hitArea = this.add.circle(buttonX, buttonY, 25, 0x000000, 0);
    hitArea.setInteractive({ useHandCursor: true });

    hitArea.on('pointerdown', () => {
      this.togglePause();
    });

    hitArea.on('pointerover', () => {
      pauseBg.clear();
      pauseBg.fillStyle(0x333333, 0.7);
      pauseBg.fillCircle(buttonX, buttonY, 25);
      pauseBg.lineStyle(3, 0xffff00, 1);
      pauseBg.strokeCircle(buttonX, buttonY, 25);
    });

    hitArea.on('pointerout', () => {
      pauseBg.clear();
      pauseBg.fillStyle(0x000000, 0.5);
      pauseBg.fillCircle(buttonX, buttonY, 25);
      pauseBg.lineStyle(3, 0xffffff, 0.8);
      pauseBg.strokeCircle(buttonX, buttonY, 25);
    });
  }

  private createPauseOverlay(): void {
    this.pauseOverlay = this.add.container(0, 0);

    // Dark overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Paused text
    const pausedText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 100, 'PAUSED', {
      fontSize: '64px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 8,
    }).setOrigin(0.5);

    // Resume button
    const resumeBg = this.add.graphics();
    resumeBg.fillStyle(0x00aa00, 1);
    resumeBg.fillRoundedRect(GAME_WIDTH / 2 - 100, GAME_HEIGHT / 2 - 10, 200, 60, 10);
    resumeBg.lineStyle(4, 0x00ff00, 1);
    resumeBg.strokeRoundedRect(GAME_WIDTH / 2 - 100, GAME_HEIGHT / 2 - 10, 200, 60, 10);

    const resumeText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20, 'RESUME', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const resumeHit = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20, 200, 60, 0x000000, 0);
    resumeHit.setInteractive({ useHandCursor: true });
    resumeHit.on('pointerdown', () => this.togglePause());

    // Menu button
    const menuBg = this.add.graphics();
    menuBg.fillStyle(0xaa6600, 1);
    menuBg.fillRoundedRect(GAME_WIDTH / 2 - 100, GAME_HEIGHT / 2 + 70, 200, 60, 10);
    menuBg.lineStyle(4, 0xffaa00, 1);
    menuBg.strokeRoundedRect(GAME_WIDTH / 2 - 100, GAME_HEIGHT / 2 + 70, 200, 60, 10);

    const menuText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 100, 'MAIN MENU', {
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const menuHit = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 100, 200, 60, 0x000000, 0);
    menuHit.setInteractive({ useHandCursor: true });
    menuHit.on('pointerdown', () => this.goToMenu());

    this.pauseOverlay.add([overlay, pausedText, resumeBg, resumeText, resumeHit, menuBg, menuText, menuHit]);
    this.pauseOverlay.setVisible(false);
  }

  private togglePause(): void {
    this.isPaused = !this.isPaused;
    this.pauseOverlay.setVisible(this.isPaused);

    const gameScene = this.scene.get('GameScene');
    if (this.isPaused) {
      gameScene.scene.pause();
    } else {
      gameScene.scene.resume();
    }
  }

  private goToMenu(): void {
    // Resume and stop game scene, go to menu
    const gameScene = this.scene.get('GameScene');
    gameScene.scene.resume();
    gameScene.scene.stop();
    this.scene.stop();
    this.scene.start('MenuScene');
  }

  private createSuperMeter(): void {
    const meterWidth = GAME_WIDTH - 40;
    const meterHeight = 20;
    const meterX = 20;
    const meterY = 1240;

    // Background
    this.superMeterBg = this.add.graphics();
    this.superMeterBg.fillStyle(0x333333, 0.8);
    this.superMeterBg.fillRoundedRect(meterX, meterY, meterWidth, meterHeight, 5);
    this.superMeterBg.lineStyle(2, 0xffffff, 0.5);
    this.superMeterBg.strokeRoundedRect(meterX, meterY, meterWidth, meterHeight, 5);

    // Fill
    this.superMeterFill = this.add.graphics();

    // Label
    this.add.text(meterX, meterY - 22, 'SUPER', {
      fontSize: '14px',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 2,
    });
  }

  private updateDisplay(): void {
    // Update hearts
    this.heartImages.forEach((heart, index) => {
      if (index < this.uiData.hearts) {
        heart.setTexture('heart');
        heart.setAlpha(1);
      } else {
        heart.setTexture('heart-empty');
        heart.setAlpha(0.5);
      }
    });

    // Update distance
    this.distanceText.setText(`${this.uiData.distance || 0}m`);

    // Update enemy counter (now shows defeated)
    this.enemyText.setText(`KO: ${this.uiData.enemiesRemaining}`);

    // Update score
    this.scoreText.setText(`Score: ${this.uiData.score}`);

    // Update super meter
    this.updateSuperMeter();
  }

  private updateSuperMeter(): void {
    this.superMeterFill.clear();

    const meterWidth = GAME_WIDTH - 40;
    const meterHeight = 20;
    const meterX = 20;
    const meterY = 1240;

    const fillPercent = this.uiData.superMeter / this.uiData.maxSuperMeter;
    const fillWidth = (meterWidth - 4) * fillPercent;

    if (fillWidth > 0) {
      // Gradient from yellow to orange based on fill
      const color = fillPercent >= 1 ? 0xff00ff : 0xffaa00;
      this.superMeterFill.fillStyle(color, 1);
      this.superMeterFill.fillRoundedRect(meterX + 2, meterY + 2, fillWidth, meterHeight - 4, 3);
    }
  }
}

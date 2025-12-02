import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig';

interface CatOption {
  name: string;
  color: number;
  x: number;
}

export class MenuScene extends Phaser.Scene {
  private selectedCat: CatOption | null = null;
  private catButtons: Phaser.GameObjects.Container[] = [];
  private startButton!: Phaser.GameObjects.Container;

  private readonly catOptions: CatOption[] = [
    { name: 'Fluffy', color: 0xffa500, x: GAME_WIDTH / 2 - 180 },   // Orange
    { name: 'Bandit', color: 0x9932cc, x: GAME_WIDTH / 2 },         // Purple
    { name: 'Midnight', color: 0x222222, x: GAME_WIDTH / 2 + 180 }, // Black
  ];

  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    // Background
    this.add.graphics()
      .fillStyle(0x87CEEB)
      .fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Title
    this.add.text(GAME_WIDTH / 2, 150, 'CAT LAUNCHER', {
      fontSize: '64px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 8,
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(GAME_WIDTH / 2, 220, 'Pinball Edition', {
      fontSize: '32px',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // Character select label
    this.add.text(GAME_WIDTH / 2, 350, 'Choose Your Cat', {
      fontSize: '36px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // Create cat selection buttons
    this.createCatButtons();

    // Create start button (initially hidden/disabled)
    this.createStartButton();

    // Instructions
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 200, 'Pull down to charge, release to launch!', {
      fontSize: '24px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 160, 'Hit enemies to stay airborne!', {
      fontSize: '24px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 120, 'Bounce off platforms to go higher!', {
      fontSize: '24px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);
  }

  private createCatButtons(): void {
    const buttonY = 500;

    this.catOptions.forEach((cat, index) => {
      const container = this.add.container(cat.x, buttonY);

      // Cat circle (preview)
      const catPreview = this.add.graphics();
      catPreview.fillStyle(cat.color);
      catPreview.fillCircle(0, -30, 50);

      // Add simple cat face
      catPreview.fillStyle(0x000000);
      catPreview.fillCircle(-15, -40, 8); // Left eye
      catPreview.fillCircle(15, -40, 8);  // Right eye
      catPreview.fillTriangle(-5, -20, 5, -20, 0, -10); // Nose

      // Ears
      catPreview.fillStyle(cat.color);
      catPreview.fillTriangle(-45, -60, -35, -80, -25, -55); // Left ear
      catPreview.fillTriangle(45, -60, 35, -80, 25, -55);    // Right ear

      // Name label
      const nameText = this.add.text(0, 40, cat.name, {
        fontSize: '24px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3,
      }).setOrigin(0.5);

      // Selection ring (hidden initially)
      const selectionRing = this.add.graphics();
      selectionRing.lineStyle(6, 0xffff00, 1);
      selectionRing.strokeCircle(0, -30, 60);
      selectionRing.setVisible(false);

      container.add([catPreview, nameText, selectionRing]);

      // Make interactive
      const hitArea = this.add.circle(0, -30, 60, 0x000000, 0);
      hitArea.setInteractive({ useHandCursor: true });
      container.add(hitArea);

      hitArea.on('pointerdown', () => {
        this.selectCat(cat, index);
      });

      hitArea.on('pointerover', () => {
        container.setScale(1.1);
      });

      hitArea.on('pointerout', () => {
        container.setScale(1);
      });

      this.catButtons.push(container);
    });
  }

  private selectCat(cat: CatOption, index: number): void {
    this.selectedCat = cat;

    // Update selection rings
    this.catButtons.forEach((container, i) => {
      const selectionRing = container.getAt(2) as Phaser.GameObjects.Graphics;
      selectionRing.setVisible(i === index);
    });

    // Enable start button
    this.enableStartButton();
  }

  private createStartButton(): void {
    const buttonX = GAME_WIDTH / 2;
    const buttonY = 720;

    this.startButton = this.add.container(buttonX, buttonY);

    // Button background
    const bg = this.add.graphics();
    bg.fillStyle(0x444444, 1);
    bg.fillRoundedRect(-120, -35, 240, 70, 15);
    bg.lineStyle(4, 0x666666, 1);
    bg.strokeRoundedRect(-120, -35, 240, 70, 15);

    // Button text
    const text = this.add.text(0, 0, 'SELECT A CAT', {
      fontSize: '28px',
      color: '#888888',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.startButton.add([bg, text]);
    this.startButton.setData('enabled', false);
  }

  private enableStartButton(): void {
    if (this.startButton.getData('enabled')) return;

    this.startButton.setData('enabled', true);

    // Clear and redraw with active colors
    const bg = this.startButton.getAt(0) as Phaser.GameObjects.Graphics;
    bg.clear();
    bg.fillStyle(0x00aa00, 1);
    bg.fillRoundedRect(-120, -35, 240, 70, 15);
    bg.lineStyle(4, 0x00ff00, 1);
    bg.strokeRoundedRect(-120, -35, 240, 70, 15);

    // Update text
    const text = this.startButton.getAt(1) as Phaser.GameObjects.Text;
    text.setText('START!');
    text.setColor('#ffffff');

    // Make interactive
    const hitArea = this.add.rectangle(0, 0, 240, 70, 0x000000, 0);
    hitArea.setInteractive({ useHandCursor: true });
    this.startButton.add(hitArea);

    hitArea.on('pointerdown', () => {
      this.startGame();
    });

    hitArea.on('pointerover', () => {
      this.startButton.setScale(1.05);
    });

    hitArea.on('pointerout', () => {
      this.startButton.setScale(1);
    });

    // Pulse animation
    this.tweens.add({
      targets: this.startButton,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private startGame(): void {
    if (!this.selectedCat) return;

    // Stop any tweens
    this.tweens.killAll();

    // Transition to game scene with selected cat data
    this.scene.start('GameScene', {
      catName: this.selectedCat.name,
      catColor: this.selectedCat.color,
    });
  }
}

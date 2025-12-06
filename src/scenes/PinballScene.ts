import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig';
import { Cat, CatState } from '../entities/Cat';
import { Bumper } from '../entities/Bumper';
import { Flipper } from '../entities/Flipper';
import { DrainZone } from '../entities/DrainZone';
import { RunState } from '../systems/RunState';

interface GameData {
  catName?: string;
  catColor?: number;
}

export class PinballScene extends Phaser.Scene {
  private cat!: Cat;
  private bumpers: Bumper[] = [];
  private leftFlipper!: Flipper;
  private rightFlipper!: Flipper;

  // Input state
  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private dragCurrentX = 0;
  private dragCurrentY = 0;
  private launchLine!: Phaser.GameObjects.Graphics;

  // Run state
  private runState!: RunState;
  private gameOver = false;
  private transitioning = false;

  // Selected cat
  private catColor = 0xffa500; // Default orange

  constructor() {
    super({ key: 'PinballScene' });
  }

  init(data: GameData): void {
    if (data.catColor) this.catColor = data.catColor;
    this.runState = RunState.getInstance();
    this.gameOver = false;
    this.transitioning = false;
  }

  create(): void {
    // Create static background
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x2d5a27);

    // Create table boundaries (walls)
    this.createTableWalls();

    // Create drain zone at bottom
    new DrainZone(this);

    // Create flippers
    const flipperY = GAME_HEIGHT - 200;
    this.leftFlipper = new Flipper(this, 180, flipperY, true);
    this.rightFlipper = new Flipper(this, GAME_WIDTH - 180, flipperY, false);

    // Create bumpers
    this.createBumpers();

    // Create the cat at launcher position (between flippers)
    this.cat = new Cat(this, GAME_WIDTH / 2, GAME_HEIGHT - 280, this.catColor);

    // Create launch line graphics
    this.launchLine = this.add.graphics();

    // Setup input
    this.setupInput();

    // Setup collision handlers
    this.setupCollisions();

    // Get state from RunState
    const stateData = this.runState.getData();

    // Start UI scene
    this.scene.launch('UIScene', {
      hearts: stateData.hearts,
      maxHearts: stateData.maxHearts,
      enemiesRemaining: 0,
      score: stateData.totalScore,
      superMeter: 0,
      maxSuperMeter: 100,
      distance: stateData.roundScore,
    });

    // Fixed camera (no scrolling for pinball table)
    this.cameras.main.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Show round start text
    const roundText = this.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 - 100,
      `ROUND ${stateData.currentRound}`,
      {
        fontSize: '56px',
        color: '#ffff00',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 8,
      }
    ).setOrigin(0.5);

    const goalText = this.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 - 40,
      `Goal: ${this.runState.getRoundScoreGoal()} pts`,
      {
        fontSize: '28px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4,
      }
    ).setOrigin(0.5);

    this.time.delayedCall(2000, () => {
      this.tweens.add({
        targets: [roundText, goalText],
        alpha: 0,
        duration: 500,
        onComplete: () => {
          roundText.destroy();
          goalText.destroy();
        }
      });
    });
  }

  update(): void {
    if (this.gameOver || this.transitioning) return;

    // Update cat
    this.cat.update();

    // Update flippers
    this.leftFlipper.update();
    this.rightFlipper.update();

    // Update launch line while dragging
    if (this.isDragging && this.cat.getState() === CatState.CHARGING) {
      this.drawLaunchLine();
    }

    // Check round completion
    this.checkRoundComplete();

    // Check if cat has landed (hit ground/drain)
    if (this.cat.getState() === CatState.LANDING) {
      this.onCatLanded();
    }
  }

  private createTableWalls(): void {
    // Top wall
    this.matter.add.rectangle(
      GAME_WIDTH / 2,
      20,
      GAME_WIDTH - 100,
      40,
      { isStatic: true, restitution: 0.8, label: 'wall' }
    );

    // Left wall (angled like pinball)
    this.matter.add.rectangle(
      30,
      GAME_HEIGHT / 2 - 100,
      60,
      GAME_HEIGHT - 400,
      { isStatic: true, restitution: 0.8, label: 'wall' }
    );

    // Right wall (angled like pinball)
    this.matter.add.rectangle(
      GAME_WIDTH - 30,
      GAME_HEIGHT / 2 - 100,
      60,
      GAME_HEIGHT - 400,
      { isStatic: true, restitution: 0.8, label: 'wall' }
    );

    // Left lower diagonal (guides to flipper)
    const leftDiagX = 80;
    const leftDiagY = GAME_HEIGHT - 350;
    this.matter.add.rectangle(
      leftDiagX,
      leftDiagY,
      150,
      20,
      {
        isStatic: true,
        restitution: 0.6,
        label: 'wall',
        angle: Math.PI / 6 // 30 degrees
      }
    );

    // Right lower diagonal (guides to flipper)
    const rightDiagX = GAME_WIDTH - 80;
    const rightDiagY = GAME_HEIGHT - 350;
    this.matter.add.rectangle(
      rightDiagX,
      rightDiagY,
      150,
      20,
      {
        isStatic: true,
        restitution: 0.6,
        label: 'wall',
        angle: -Math.PI / 6 // -30 degrees
      }
    );

    // Visual walls
    const graphics = this.add.graphics();
    graphics.fillStyle(0x4a3520, 1);
    // Left wall visual
    graphics.fillRect(0, 100, 60, GAME_HEIGHT - 500);
    // Right wall visual
    graphics.fillRect(GAME_WIDTH - 60, 100, 60, GAME_HEIGHT - 500);
    // Top wall visual
    graphics.fillRect(50, 0, GAME_WIDTH - 100, 40);
  }

  private createBumpers(): void {
    // Create 6 bumpers in a classic pinball layout
    const bumperPositions = [
      { x: GAME_WIDTH / 2, y: 200 },          // Top center
      { x: GAME_WIDTH / 3, y: 350 },          // Left upper
      { x: (GAME_WIDTH * 2) / 3, y: 350 },    // Right upper
      { x: GAME_WIDTH / 4, y: 500 },          // Left middle
      { x: (GAME_WIDTH * 3) / 4, y: 500 },    // Right middle
      { x: GAME_WIDTH / 2, y: 600 },          // Center middle
    ];

    bumperPositions.forEach(pos => {
      const bumper = new Bumper(this, pos.x, pos.y);
      this.bumpers.push(bumper);
    });
  }

  private setupInput(): void {
    // Handle pointer down
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.gameOver || this.transitioning) return;

      // Check if cat is idle and pointer is near cat (slingshot mode)
      if (this.cat.getState() === CatState.IDLE && this.isNearCat(pointer)) {
        if (this.runState.getHearts() <= 0) return;
        this.isDragging = true;
        this.dragStartX = pointer.x;
        this.dragStartY = pointer.y;
        this.dragCurrentX = this.dragStartX;
        this.dragCurrentY = this.dragStartY;
        this.cat.startCharging();
      } else {
        // Flipper activation
        this.handleFlipperInput(pointer, true);
      }
    });

    // Handle pointer move
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!this.isDragging) return;
      this.dragCurrentX = pointer.x;
      this.dragCurrentY = pointer.y;

      // Calculate charge amount
      const pullDistanceY = this.dragCurrentY - this.dragStartY;
      const maxPull = GAME_HEIGHT * 0.5;
      const chargeAmount = Math.min(Math.max(pullDistanceY / maxPull, 0), 1);
      this.cat.setChargeAmount(chargeAmount);
    });

    // Handle pointer up
    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      // Release flippers
      this.handleFlipperInput(pointer, false);

      if (!this.isDragging) return;
      this.isDragging = false;
      this.launchLine.clear();

      const pullDistanceY = this.dragCurrentY - this.dragStartY;
      if (pullDistanceY > 30) {
        const pullDistanceX = this.dragCurrentX - this.dragStartX;
        this.launchCat(pullDistanceX, pullDistanceY);
      } else {
        this.cat.cancelCharge();
      }
    });
  }

  private isNearCat(pointer: Phaser.Input.Pointer): boolean {
    const distance = Phaser.Math.Distance.Between(
      pointer.x,
      pointer.y,
      this.cat.x,
      this.cat.y
    );
    return distance < 150; // Within 150 pixels of cat
  }

  private handleFlipperInput(pointer: Phaser.Input.Pointer, isDown: boolean): void {
    // Lower 40% of screen is flipper zone
    if (pointer.y > GAME_HEIGHT * 0.6 || this.cat.getState() === CatState.FLYING) {
      if (pointer.x < GAME_WIDTH / 2) {
        if (isDown) {
          this.leftFlipper.activate();
        } else {
          this.leftFlipper.deactivate();
        }
      } else {
        if (isDown) {
          this.rightFlipper.activate();
        } else {
          this.rightFlipper.deactivate();
        }
      }
    }
  }

  private drawLaunchLine(): void {
    this.launchLine.clear();

    const pullDistanceY = this.dragCurrentY - this.dragStartY;
    if (pullDistanceY <= 0) return;

    const pullDistanceX = this.dragCurrentX - this.dragStartX;
    const maxPull = GAME_HEIGHT * 0.5;
    const normalizedPullY = Math.min(pullDistanceY / maxPull, 1);
    const normalizedPullX = pullDistanceX / maxPull;

    // Apply launch power multiplier
    const powerMultiplier = this.runState.getLaunchPowerMultiplier();
    const launchVelocityY = -normalizedPullY * 45 * powerMultiplier;
    const launchVelocityX = -normalizedPullX * 25 * powerMultiplier;

    // Draw trajectory preview
    this.launchLine.lineStyle(5, 0xffff00, 0.9);

    const startX = this.cat.x;
    const startY = this.cat.y;

    this.launchLine.beginPath();
    this.launchLine.moveTo(startX, startY);

    for (let t = 0; t < 80; t++) {
      const x = startX + launchVelocityX * t;
      const y = startY + launchVelocityY * t + 0.5 * 0.6 * t * t;
      if (y > startY + 150) break;

      if (t % 5 === 0) {
        this.launchLine.lineTo(x, y);
      } else {
        this.launchLine.moveTo(x, y);
      }
    }

    this.launchLine.strokePath();

    // Draw charge indicator at drag point
    const indicatorX = this.cat.x + pullDistanceX;
    const indicatorY = this.cat.y + pullDistanceY;
    const indicatorSize = 15 + normalizedPullY * 30;
    this.launchLine.fillStyle(0xff0000, 0.7);
    this.launchLine.fillCircle(indicatorX, indicatorY, indicatorSize);

    // Draw slingshot line
    this.launchLine.lineStyle(6, 0xff6600, 0.9);
    this.launchLine.beginPath();
    this.launchLine.moveTo(this.cat.x, this.cat.y);
    this.launchLine.lineTo(indicatorX, indicatorY);
    this.launchLine.strokePath();
  }

  private launchCat(pullDistanceX: number, pullDistanceY: number): void {
    const maxPull = GAME_HEIGHT * 0.5;
    const normalizedPullY = Math.min(pullDistanceY / maxPull, 1);
    const normalizedPullX = pullDistanceX / maxPull;

    // Apply launch power multiplier
    const powerMultiplier = this.runState.getLaunchPowerMultiplier();
    const launchVelocityY = normalizedPullY * 45 * powerMultiplier;
    const launchVelocityX = normalizedPullX * 25 * powerMultiplier;

    // Slingshot: opposite direction of pull
    this.cat.launch(-launchVelocityX, -launchVelocityY);
    this.updateUI();
  }

  private setupCollisions(): void {
    this.matter.world.on('collisionstart', (event: Phaser.Physics.Matter.Events.CollisionStartEvent) => {
      event.pairs.forEach((pair) => {
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;
        const catBody = this.cat.getBody();

        if (bodyA === catBody || bodyB === catBody) {
          const otherBody = bodyA === catBody ? bodyB : bodyA;

          // Check if hit bumper
          const bumper = this.bumpers.find(b => b.getBody() === otherBody);
          if (bumper) {
            this.onBumperHit(bumper);
          }

          // Check if hit drain
          if (otherBody.label === 'drain') {
            this.onCatDrained();
          }

          // Check if hit flipper
          if (otherBody.label === 'flipper') {
            // Flipper physics handles the bounce
          }
        }
      });
    });
  }

  private onBumperHit(bumper: Bumper): void {
    const scoreValue = bumper.onHit();
    this.runState.addScore(scoreValue);

    // Give cat upward bounce
    this.cat.addBounce(0.8);

    this.updateUI();
  }

  private onCatDrained(): void {
    if (this.transitioning) return;

    // Cat fell into drain zone
    const heartLost = this.runState.loseHeart();

    if (!heartLost) {
      // Saved by thick skin!
      this.showMessage('SAVED!', '#00ff00');
      this.cat.resetToStart(GAME_WIDTH / 2, GAME_HEIGHT - 280);
    } else if (this.runState.isGameOver()) {
      this.onGameOver();
    } else {
      // Reset cat to launcher position
      this.cat.resetToStart(GAME_WIDTH / 2, GAME_HEIGHT - 280);
    }

    this.updateUI();
  }

  private onCatLanded(): void {
    // Reset cat to launcher position
    this.cat.resetToStart(GAME_WIDTH / 2, GAME_HEIGHT - 280);

    if (this.runState.isGameOver()) {
      this.onGameOver();
    }
  }

  private checkRoundComplete(): void {
    if (this.transitioning) return;

    const goalScore = this.runState.getRoundScoreGoal();
    const roundScore = this.runState.getRoundScore();

    if (roundScore >= goalScore) {
      this.onRoundComplete();
    }
  }

  private onRoundComplete(): void {
    this.transitioning = true;

    // Advance round in state
    this.runState.advanceRound();

    // Show round complete text
    const text = this.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      'ROUND COMPLETE!',
      {
        fontSize: '48px',
        color: '#00ff00',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 6,
      }
    ).setOrigin(0.5);

    this.time.delayedCall(1500, () => {
      text.destroy();
      // Stop UI and transition to upgrade scene
      this.scene.stop('UIScene');
      this.scene.start('UpgradeScene', { runState: this.runState });
    });
  }

  private onGameOver(): void {
    this.gameOver = true;
    this.transitioning = true;

    // Darken background
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    const stateData = this.runState.getData();

    // Show game over message
    this.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 - 100,
      'GAME OVER',
      {
        fontSize: '56px',
        color: '#ff0000',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 8,
      }
    ).setOrigin(0.5);

    this.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      `Rounds: ${stateData.currentRound - 1} | Score: ${stateData.totalScore}`,
      {
        fontSize: '28px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4,
      }
    ).setOrigin(0.5);

    // Create restart button
    const buttonBg = this.add.graphics();
    buttonBg.fillStyle(0x00aa00, 1);
    buttonBg.fillRoundedRect(GAME_WIDTH / 2 - 120, GAME_HEIGHT / 2 + 80, 240, 70, 15);
    buttonBg.lineStyle(4, 0x00ff00, 1);
    buttonBg.strokeRoundedRect(GAME_WIDTH / 2 - 120, GAME_HEIGHT / 2 + 80, 240, 70, 15);

    this.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 + 115,
      'TRY AGAIN',
      {
        fontSize: '32px',
        color: '#ffffff',
        fontStyle: 'bold',
      }
    ).setOrigin(0.5);

    const hitArea = this.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 + 115,
      240,
      70,
      0x000000,
      0
    ).setInteractive();

    hitArea.on('pointerdown', () => {
      this.runState.newRun();
      this.scene.stop('UIScene');
      this.scene.start('MenuScene');
    });
  }

  private showMessage(text: string, color: string): void {
    const message = this.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 - 200,
      text,
      {
        fontSize: '36px',
        color: color,
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4,
      }
    ).setOrigin(0.5);

    this.tweens.add({
      targets: message,
      alpha: 0,
      y: GAME_HEIGHT / 2 - 250,
      duration: 1000,
      onComplete: () => message.destroy()
    });
  }

  private updateUI(): void {
    const stateData = this.runState.getData();
    this.events.emit('updateUI', {
      hearts: stateData.hearts,
      maxHearts: stateData.maxHearts,
      enemiesRemaining: 0,
      score: stateData.totalScore,
      superMeter: 0,
      maxSuperMeter: 100,
      distance: stateData.roundScore,
    });
  }
}

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig';
import { Cat, CatState } from '../entities/Cat';
import { Enemy } from '../entities/Enemy';
import { Platform } from '../entities/Platform';

interface GameData {
  catName?: string;
  catColor?: number;
}

export class GameScene extends Phaser.Scene {
  private cat!: Cat;
  private platforms: Platform[] = [];
  private enemies: Enemy[] = [];

  // Input state
  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private dragCurrentX = 0;
  private dragCurrentY = 0;
  private launchLine!: Phaser.GameObjects.Graphics;

  // Game state
  private hearts = 3;
  private maxHearts = 3;
  private enemiesDefeated = 0;
  private score = 0;
  private superMeter = 0;
  private maxSuperMeter = 100;
  private gameOver = false;

  // Endless runner state (vertical progression - lower Y = higher up)
  private highestY = 0; // Tracks highest point reached (lowest Y value)
  private lastPlatformY = 0;
  private lastEnemyY = 0;
  private backgroundGraphics: Phaser.GameObjects.Graphics | null = null;

  // Selected cat
  private catColor = 0xffa500; // Default orange

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: GameData): void {
    if (data.catColor) this.catColor = data.catColor;
  }

  create(): void {
    // Create background (will scroll vertically)
    this.createBackground();

    // Create ground
    this.createGround();

    // Generate initial platforms and enemies above starting position
    this.generateInitialContent();

    // Create the cat at bottom center with selected color
    this.cat = new Cat(this, GAME_WIDTH / 2, GAME_HEIGHT - 180, this.catColor);
    this.highestY = GAME_HEIGHT - 180;

    // Create launch line graphics
    this.launchLine = this.add.graphics();

    // Setup input
    this.setupInput();

    // Setup collision handlers
    this.setupCollisions();

    // Start UI scene
    this.scene.launch('UIScene', {
      hearts: this.hearts,
      maxHearts: this.maxHearts,
      enemiesRemaining: 0, // Endless mode - starts at 0 defeated
      score: this.score,
      superMeter: this.superMeter,
      maxSuperMeter: this.maxSuperMeter,
      distance: 0,
    });

    // Setup camera for vertical scrolling - extends upward infinitely
    this.cameras.main.setBounds(0, -100000, GAME_WIDTH, GAME_HEIGHT + 100000);
  }

  update(): void {
    if (this.gameOver) return;

    // Update cat
    this.cat.update();

    // Update launch line while dragging
    if (this.isDragging && this.cat.getState() === CatState.CHARGING) {
      this.drawLaunchLine();
    }

    // Track highest point reached (lower Y = higher up)
    if (this.cat.y < this.highestY) {
      this.highestY = this.cat.y;
    }

    // Camera follow when cat is flying - vertical tracking
    if (this.cat.getState() === CatState.FLYING) {
      const catY = this.cat.y;
      // Keep cat in bottom third of screen, camera moves up with cat
      const targetY = catY - GAME_HEIGHT * 0.66;
      const vel = this.cat.getVelocity();
      // Faster follow when going up, slower when coming down
      const followSpeed = vel.y < 0 ? 0.15 : 0.08;
      this.cameras.main.scrollY = Phaser.Math.Linear(
        this.cameras.main.scrollY,
        Math.min(targetY, 0),
        followSpeed
      );
    } else {
      // Return camera to ground level smoothly
      this.cameras.main.scrollY = Phaser.Math.Linear(
        this.cameras.main.scrollY,
        0,
        0.08
      );
    }

    // Generate new content above player
    this.generateAheadContent();

    // Clean up content below player
    this.cleanupBehindContent();

    // Check if cat has landed
    if (this.cat.getState() === CatState.LANDING) {
      this.onCatLanded();
    }
  }

  private createBackground(): void {
    // Create tall sky background with gradient effect for vertical scrolling
    this.backgroundGraphics = this.add.graphics();

    // Draw sky sections for pseudo-gradient effect (going upward)
    const sections = [
      { y: -100000, height: 50000, color: 0x1a1a2e }, // Deep space
      { y: -50000, height: 25000, color: 0x16213e },  // Upper atmosphere
      { y: -25000, height: 15000, color: 0x4a90a4 },  // High sky
      { y: -10000, height: 10000, color: 0x6eb5c9 },  // Mid sky
      { y: 0, height: GAME_HEIGHT, color: 0x87CEEB }, // Ground level sky
    ];

    sections.forEach(({ y, height, color }) => {
      this.backgroundGraphics!.fillStyle(color);
      this.backgroundGraphics!.fillRect(0, y, GAME_WIDTH, height);
    });
  }

  private createGround(): void {
    // Visual ground
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT - 50, 'ground');

    // Physics ground (static body)
    this.matter.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT - 20,
      GAME_WIDTH,
      40,
      { isStatic: true, label: 'ground' }
    );

    // Left wall (invisible, bouncy) - extends very high
    this.matter.add.rectangle(
      -20,
      -50000,
      40,
      GAME_HEIGHT + 100000,
      { isStatic: true, restitution: 0.8, label: 'wall' }
    );

    // Right wall (invisible, bouncy) - extends very high
    this.matter.add.rectangle(
      GAME_WIDTH + 20,
      -50000,
      40,
      GAME_HEIGHT + 100000,
      { isStatic: true, restitution: 0.8, label: 'wall' }
    );
  }

  private generateInitialContent(): void {
    // Generate initial platforms and enemies above starting position
    this.lastPlatformY = GAME_HEIGHT - 300; // Start generating above ground
    this.lastEnemyY = GAME_HEIGHT - 400;

    // Create initial platforms going upward
    for (let i = 0; i < 15; i++) {
      this.generatePlatform();
    }

    // Create initial enemies going upward
    for (let i = 0; i < 20; i++) {
      this.generateEnemy();
    }
  }

  private generatePlatform(): void {
    // Random vertical spacing between platforms (going up = decreasing Y)
    const spacing = 150 + Math.random() * 250;
    const y = this.lastPlatformY - spacing;
    const x = 100 + Math.random() * (GAME_WIDTH - 200); // Random X position

    const platform = new Platform(this, x, y);
    this.platforms.push(platform);
    this.lastPlatformY = y;
  }

  private generateEnemy(): void {
    // Random vertical spacing between enemies (going up = decreasing Y)
    const spacing = 100 + Math.random() * 200;
    const y = this.lastEnemyY - spacing;
    const x = 80 + Math.random() * (GAME_WIDTH - 160); // Random X position

    const enemy = new Enemy(this, x, y);
    this.enemies.push(enemy);
    this.lastEnemyY = y;
  }

  private generateAheadContent(): void {
    const generateDistance = GAME_HEIGHT * 2; // Generate 2 screens above

    // Generate platforms above (lower Y values)
    while (this.lastPlatformY > this.highestY - generateDistance) {
      this.generatePlatform();
    }

    // Generate enemies above
    while (this.lastEnemyY > this.highestY - generateDistance) {
      this.generateEnemy();
    }
  }

  private cleanupBehindContent(): void {
    const cleanupDistance = GAME_HEIGHT * 2; // Remove things 2 screens below

    // Cleanup platforms that are far below the cat
    this.platforms = this.platforms.filter(platform => {
      const pos = platform.getPosition();
      if (pos.y > this.cat.y + cleanupDistance) {
        platform.destroy();
        return false;
      }
      return true;
    });

    // Cleanup enemies that are far below the cat
    this.enemies = this.enemies.filter(enemy => {
      if (enemy.isDestroyed()) return false;
      const body = enemy.getBody();
      if (!body) return false;
      if (body.position.y > this.cat.y + cleanupDistance) {
        enemy.destroy();
        return false;
      }
      return true;
    });
  }

  private setupInput(): void {
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.gameOver) return;
      if (this.cat.getState() !== CatState.IDLE) return;
      if (this.hearts <= 0) return;

      this.isDragging = true;
      this.dragStartX = pointer.x;
      this.dragStartY = pointer.y + this.cameras.main.scrollY;
      this.dragCurrentX = this.dragStartX;
      this.dragCurrentY = this.dragStartY;
      this.cat.startCharging();
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      // If cat is flying, allow in-air steering
      if (this.cat.getState() === CatState.FLYING) {
        this.handleAirSteering(pointer);
        return;
      }

      if (!this.isDragging) return;
      this.dragCurrentX = pointer.x;
      this.dragCurrentY = pointer.y + this.cameras.main.scrollY;

      // Calculate charge amount (0 to 1) based on pull distance
      // 50% of screen height for bigger pulls
      const pullDistanceY = this.dragCurrentY - this.dragStartY;
      const maxPull = GAME_HEIGHT * 0.5; // 50% of screen - much more room
      const chargeAmount = Math.min(Math.max(pullDistanceY / maxPull, 0), 1);
      this.cat.setChargeAmount(chargeAmount);
    });

    this.input.on('pointerup', () => {
      // Reset air steering
      this.lastPointerX = 0;

      if (!this.isDragging) return;
      this.isDragging = false;
      this.launchLine.clear();

      const pullDistanceY = this.dragCurrentY - this.dragStartY;
      if (pullDistanceY > 30) {
        // Launch the cat with direction!
        const pullDistanceX = this.dragCurrentX - this.dragStartX;
        this.launchCat(pullDistanceX, pullDistanceY);
      } else {
        // Cancel - not enough pull
        this.cat.cancelCharge();
      }
    });
  }

  // Track last pointer position for air steering
  private lastPointerX = 0;

  private handleAirSteering(pointer: Phaser.Input.Pointer): void {
    if (this.lastPointerX === 0) {
      this.lastPointerX = pointer.x;
      return;
    }

    // Calculate swipe direction
    const deltaX = pointer.x - this.lastPointerX;
    this.lastPointerX = pointer.x;

    // Apply horizontal force based on swipe
    if (Math.abs(deltaX) > 2) {
      const steerForce = deltaX * 0.15; // Adjust sensitivity
      this.cat.steer(steerForce);
    }
  }

  private drawLaunchLine(): void {
    this.launchLine.clear();

    const pullDistanceY = this.dragCurrentY - this.dragStartY;
    if (pullDistanceY <= 0) return;

    const pullDistanceX = this.dragCurrentX - this.dragStartX;
    const maxPull = GAME_HEIGHT * 0.5; // 50% of screen
    const normalizedPullY = Math.min(pullDistanceY / maxPull, 1);
    const normalizedPullX = pullDistanceX / maxPull;

    // Calculate launch velocities - MUCH stronger
    const launchVelocityY = -normalizedPullY * 45; // Big increase
    const launchVelocityX = -normalizedPullX * 25;

    // Draw trajectory preview - extended much further
    this.launchLine.lineStyle(5, 0xffff00, 0.9);

    const startX = this.cat.x;
    const startY = this.cat.y;

    // Draw much longer trajectory arc
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

    // Size indicator based on charge - bigger
    const indicatorSize = 15 + normalizedPullY * 30;
    this.launchLine.fillStyle(0xff0000, 0.7);
    this.launchLine.fillCircle(indicatorX, indicatorY, indicatorSize);

    // Draw slingshot line from cat to indicator - thicker
    this.launchLine.lineStyle(6, 0xff6600, 0.9);
    this.launchLine.beginPath();
    this.launchLine.moveTo(this.cat.x, this.cat.y);
    this.launchLine.lineTo(indicatorX, indicatorY);
    this.launchLine.strokePath();

    // Draw power percentage
    const powerPercent = Math.round(normalizedPullY * 100);
    if (powerPercent > 10) {
      this.launchLine.fillStyle(0xffffff, 1);
      // Small circle showing power at top of trajectory
      const peakX = startX + launchVelocityX * 20;
      const peakY = startY + launchVelocityY * 20;
      this.launchLine.fillCircle(peakX, peakY, 8);
    }
  }

  private launchCat(pullDistanceX: number, pullDistanceY: number): void {
    // Spend a heart
    this.hearts--;
    this.updateUI();

    // Calculate launch velocity based on pull distance (slingshot - opposite direction)
    const maxPull = GAME_HEIGHT * 0.5; // 50% of screen
    const normalizedPullY = Math.min(pullDistanceY / maxPull, 1);
    const normalizedPullX = pullDistanceX / maxPull;

    // MUCH stronger launch velocities
    const launchVelocityY = normalizedPullY * 45; // Big increase
    const launchVelocityX = normalizedPullX * 25;

    // Slingshot: opposite direction of pull
    this.cat.launch(-launchVelocityX, -launchVelocityY);
  }

  private setupCollisions(): void {
    this.matter.world.on('collisionstart', (event: Phaser.Physics.Matter.Events.CollisionStartEvent) => {
      event.pairs.forEach((pair) => {
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;

        // Check for cat-enemy collision
        const catBody = this.cat.getBody();
        if ((bodyA === catBody || bodyB === catBody)) {
          const otherBody = bodyA === catBody ? bodyB : bodyA;

          // Check if hit enemy (safely check body exists)
          const enemy = this.enemies.find(e => {
            const eBody = e.getBody();
            return eBody && eBody === otherBody;
          });
          if (enemy && !enemy.isDestroyed()) {
            this.onEnemyHit(enemy);
          }

          // Check if hit ground
          if (otherBody.label === 'ground') {
            this.cat.land();
          }

          // Check if hit platform - one-way from above with forward bounce!
          const platform = this.platforms.find(p => {
            const pBody = p.getBody();
            return pBody && pBody === otherBody;
          });
          if (platform) {
            const currentVel = this.cat.getVelocity();
            const platformTop = platform.getTopY();
            const catBottom = this.cat.y + 28; // Cat radius

            // Only trigger if cat is falling (velocity.y > 0) and coming from above
            if (currentVel.y > 0 && catBottom <= platformTop + 20) {
              // Platform bounce! Give upward and FORWARD boost
              this.cat.platformBounce();
            }
            // If coming from below (velocity.y < 0), do nothing - pass through!
          }
        }
      });
    });
  }

  private onEnemyHit(enemy: Enemy): void {
    // Destroy enemy
    enemy.destroy();
    this.enemiesDefeated++;

    // Add score
    this.score += 100;

    // Add to super meter
    this.superMeter = Math.min(this.superMeter + 15, this.maxSuperMeter);

    // Give cat a STRONG upward bounce boost - keeps the motion going!
    this.cat.addBounce(1.2);

    // Update UI
    this.updateUI();
  }

  private onCatLanded(): void {
    // Reset cat to center bottom (always reset to starting position for vertical game)
    this.cat.resetToStart(GAME_WIDTH / 2, GAME_HEIGHT - 180);

    // Check lose condition - no hearts left
    if (this.hearts <= 0) {
      this.onGameOver();
    }
  }

  private onGameOver(): void {
    this.gameOver = true;

    // Darken background
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    overlay.setScrollFactor(0);

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
    ).setOrigin(0.5).setScrollFactor(0);

    // Calculate height reached (ground level is GAME_HEIGHT - 180, so subtract from that)
    const heightReached = Math.max(0, Math.floor((GAME_HEIGHT - 180 - this.highestY)));
    this.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 - 20,
      `Height: ${heightReached}m`,
      {
        fontSize: '32px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4,
      }
    ).setOrigin(0.5).setScrollFactor(0);

    this.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 + 30,
      `Score: ${this.score} | Enemies: ${this.enemiesDefeated}`,
      {
        fontSize: '28px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4,
      }
    ).setOrigin(0.5).setScrollFactor(0);

    // Create restart button
    const buttonBg = this.add.graphics();
    buttonBg.fillStyle(0x00aa00, 1);
    buttonBg.fillRoundedRect(GAME_WIDTH / 2 - 120, GAME_HEIGHT / 2 + 80, 240, 70, 15);
    buttonBg.lineStyle(4, 0x00ff00, 1);
    buttonBg.strokeRoundedRect(GAME_WIDTH / 2 - 120, GAME_HEIGHT / 2 + 80, 240, 70, 15);
    buttonBg.setScrollFactor(0);

    this.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 + 115,
      'TRY AGAIN',
      {
        fontSize: '32px',
        color: '#ffffff',
        fontStyle: 'bold',
      }
    ).setOrigin(0.5).setScrollFactor(0);

    // Make button interactive
    const hitArea = this.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 + 115,
      240,
      70,
      0x000000,
      0
    ).setScrollFactor(0).setInteractive();

    hitArea.on('pointerdown', () => {
      this.scene.restart();
    });
  }

  private updateUI(): void {
    // Calculate height reached (lower Y = higher up, ground is at GAME_HEIGHT - 180)
    const heightReached = Math.max(0, Math.floor((GAME_HEIGHT - 180 - this.highestY)));
    this.events.emit('updateUI', {
      hearts: this.hearts,
      maxHearts: this.maxHearts,
      enemiesRemaining: this.enemiesDefeated, // Shows defeated count
      score: this.score,
      superMeter: this.superMeter,
      maxSuperMeter: this.maxSuperMeter,
      distance: heightReached, // Now shows height
    });
  }
}

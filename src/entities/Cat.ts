import Phaser from 'phaser';

export enum CatState {
  IDLE = 'idle',
  CHARGING = 'charging',
  FLYING = 'flying',
  LANDING = 'landing',
}

export class Cat {
  private sprite: Phaser.Physics.Matter.Sprite;
  private state: CatState = CatState.IDLE;
  private chargeAmount = 0;

  public x: number;
  public y: number;

  constructor(scene: Phaser.Scene, x: number, y: number, color: number = 0xffa500) {
    this.x = x;
    this.y = y;

    // Create Matter.js sprite
    this.sprite = scene.matter.add.sprite(x, y, 'cat', undefined, {
      shape: { type: 'circle', radius: 28 },
      restitution: 0.6, // Bounciness
      friction: 0.1,
      frictionAir: 0.01,
      label: 'cat',
    });

    // Apply the selected color tint
    this.sprite.setTint(color);

    this.sprite.setFixedRotation();
    this.sprite.setStatic(true); // Start static until launched
  }

  update(): void {
    // Sync position
    this.x = this.sprite.x;
    this.y = this.sprite.y;

    // Visual feedback based on state
    switch (this.state) {
      case CatState.CHARGING:
        // Squash effect - cat squats down
        const squashAmount = 1 - this.chargeAmount * 0.3;
        this.sprite.setScale(1 + this.chargeAmount * 0.2, squashAmount);
        break;

      case CatState.FLYING:
        // Slight stretch in direction of movement
        const vel = this.sprite.body?.velocity as Phaser.Math.Vector2 | undefined;
        if (vel) {
          const speed = Math.sqrt(vel.x * vel.x + vel.y * vel.y);
          const stretchAmount = Math.min(speed / 20, 0.3);
          if (vel.y < 0) {
            this.sprite.setScale(1 - stretchAmount * 0.3, 1 + stretchAmount);
          } else {
            this.sprite.setScale(1, 1);
          }
        }
        break;

      default:
        this.sprite.setScale(1, 1);
    }
  }

  getState(): CatState {
    return this.state;
  }

  getBody(): MatterJS.BodyType {
    return this.sprite.body as MatterJS.BodyType;
  }

  getSprite(): Phaser.Physics.Matter.Sprite {
    return this.sprite;
  }

  getVelocity(): { x: number; y: number } {
    const body = this.sprite.body as MatterJS.BodyType;
    return body.velocity;
  }

  startCharging(): void {
    if (this.state !== CatState.IDLE) return;
    this.state = CatState.CHARGING;
    this.chargeAmount = 0;
  }

  setChargeAmount(amount: number): void {
    this.chargeAmount = Math.max(0, Math.min(amount, 1));
  }

  cancelCharge(): void {
    if (this.state !== CatState.CHARGING) return;
    this.state = CatState.IDLE;
    this.chargeAmount = 0;
    this.sprite.setScale(1, 1);
  }

  launch(velocityX: number, velocityY: number): void {
    if (this.state !== CatState.CHARGING) return;

    this.state = CatState.FLYING;
    this.sprite.setStatic(false);
    this.sprite.setVelocity(velocityX, velocityY);

    // Reset scale
    this.sprite.setScale(1, 1);
  }

  land(): void {
    if (this.state !== CatState.FLYING) return;
    this.state = CatState.LANDING;
  }

  setIdle(): void {
    this.state = CatState.IDLE;
    this.sprite.setStatic(true);
    this.sprite.setVelocity(0, 0);
    this.sprite.setScale(1, 1);
    this.chargeAmount = 0;
  }

  resetToStart(x: number, y: number): void {
    this.state = CatState.IDLE;
    this.sprite.setStatic(true);
    this.sprite.setPosition(x, y);
    this.sprite.setVelocity(0, 0);
    this.sprite.setScale(1, 1);
    this.chargeAmount = 0;
    this.x = x;
    this.y = y;
  }

  addBounce(multiplier: number): void {
    if (this.state !== CatState.FLYING) return;

    const vel = this.getVelocity();
    // Add strong upward boost - minimum of 15 units, scales with current speed
    const minBoost = 15;
    const boostY = Math.max(Math.abs(vel.y) * multiplier, minBoost);
    // Also maintain some horizontal momentum
    this.sprite.setVelocity(vel.x * 0.9, -boostY);
  }

  platformBounce(): void {
    if (this.state !== CatState.FLYING) return;

    const vel = this.getVelocity();
    // Strong UPWARD bounce (forward = up in this game!)
    const bounceY = -25; // Strong upward velocity
    // Maintain some horizontal momentum
    const newVelX = vel.x * 0.8;

    this.sprite.setVelocity(newVelX, bounceY);
  }

  steer(forceX: number): void {
    if (this.state !== CatState.FLYING) return;

    const vel = this.getVelocity();
    // Add horizontal steering force, capped to prevent crazy speeds
    const maxHorizontalSpeed = 25;
    const newVelX = Phaser.Math.Clamp(vel.x + forceX, -maxHorizontalSpeed, maxHorizontalSpeed);
    this.sprite.setVelocity(newVelX, vel.y);
  }
}

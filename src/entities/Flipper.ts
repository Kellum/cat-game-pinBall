import Phaser from 'phaser';

export class Flipper {
  private scene: Phaser.Scene;
  private sprite: Phaser.GameObjects.Rectangle;
  private body: MatterJS.BodyType;
  private isLeft: boolean;
  private isActivated: boolean = false;

  // Flipper dimensions
  private readonly WIDTH = 120;
  private readonly HEIGHT = 24;

  // Physics settings
  private readonly REST_ANGLE: number;
  private readonly ACTIVE_ANGLE: number;
  private readonly ANGULAR_VELOCITY = 0.5;
  private readonly RESTITUTION = 0.9;

  constructor(scene: Phaser.Scene, x: number, y: number, isLeft: boolean) {
    this.scene = scene;
    this.isLeft = isLeft;

    // Calculate angles (in radians)
    // Rest angle: pointing slightly down
    // Active angle: pointing slightly up
    this.REST_ANGLE = isLeft ? 0.4 : -0.4; // ~23 degrees
    this.ACTIVE_ANGLE = isLeft ? -0.4 : 0.4;

    // Create visual
    this.sprite = scene.add.rectangle(x, y, this.WIDTH, this.HEIGHT, 0x666666);
    this.sprite.setStrokeStyle(3, 0x888888);

    // Calculate pivot point (inner end of flipper)
    const pivotOffsetX = isLeft ? -this.WIDTH / 2 + 15 : this.WIDTH / 2 - 15;

    // Create physics body
    this.body = scene.matter.add.rectangle(x, y, this.WIDTH, this.HEIGHT, {
      isStatic: false,
      restitution: this.RESTITUTION,
      friction: 0.1,
      frictionAir: 0.02,
      label: 'flipper',
      angle: this.REST_ANGLE,
    });

    // Create pivot constraint (pin to world point)
    const pivotX = x + pivotOffsetX;
    const pivotY = y;

    scene.matter.add.worldConstraint(
      this.body,
      0, // Length (0 for pin joint)
      0.9, // Stiffness
      {
        pointA: { x: pivotOffsetX, y: 0 },
        pointB: { x: pivotX, y: pivotY },
      }
    );

    // Set initial angle using scene.matter.body
    (scene.matter.body as any).setAngle(this.body, this.REST_ANGLE);
  }

  activate(): void {
    this.isActivated = true;
  }

  deactivate(): void {
    this.isActivated = false;
  }

  update(): void {
    // Sync sprite position and rotation with physics body
    this.sprite.x = this.body.position.x;
    this.sprite.y = this.body.position.y;
    this.sprite.rotation = this.body.angle;

    const matterBody = this.scene.matter.body as any;

    // Apply angular velocity based on activation state
    if (this.isActivated) {
      // Swing up
      const targetAngle = this.ACTIVE_ANGLE;
      const currentAngle = this.body.angle;
      const angleDiff = targetAngle - currentAngle;

      if (Math.abs(angleDiff) > 0.05) {
        const direction = this.isLeft ? -1 : 1;
        matterBody.setAngularVelocity(this.body, direction * this.ANGULAR_VELOCITY);
      }
    } else {
      // Return to rest (gravity will help, but add slight push)
      const targetAngle = this.REST_ANGLE;
      const currentAngle = this.body.angle;
      const angleDiff = targetAngle - currentAngle;

      if (Math.abs(angleDiff) > 0.05) {
        const direction = this.isLeft ? 1 : -1;
        matterBody.setAngularVelocity(this.body, direction * this.ANGULAR_VELOCITY * 0.3);
      }
    }

    // Clamp angle to prevent over-rotation
    const minAngle = this.isLeft ? this.ACTIVE_ANGLE : this.REST_ANGLE;
    const maxAngle = this.isLeft ? this.REST_ANGLE : this.ACTIVE_ANGLE;

    if (this.body.angle < Math.min(minAngle, maxAngle) - 0.1) {
      matterBody.setAngle(this.body, Math.min(minAngle, maxAngle));
      matterBody.setAngularVelocity(this.body, 0);
    } else if (this.body.angle > Math.max(minAngle, maxAngle) + 0.1) {
      matterBody.setAngle(this.body, Math.max(minAngle, maxAngle));
      matterBody.setAngularVelocity(this.body, 0);
    }
  }

  getBody(): MatterJS.BodyType {
    return this.body;
  }

  destroy(): void {
    this.scene.matter.world.remove(this.body);
    this.sprite.destroy();
  }
}

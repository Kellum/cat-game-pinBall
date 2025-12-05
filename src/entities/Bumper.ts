import Phaser from 'phaser';

export class Bumper {
  private scene: Phaser.Scene;
  private sprite: Phaser.GameObjects.Arc;
  private body: MatterJS.BodyType;
  private isHit: boolean = false;

  // Bumper settings
  private readonly RADIUS = 32;
  private readonly SCORE_VALUE = 50;
  private readonly RESTITUTION = 1.2; // Extra bouncy
  private readonly COLOR = 0xff6600;
  private readonly HIT_COLOR = 0xffff00;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;

    // Create visual (circle)
    this.sprite = scene.add.circle(x, y, this.RADIUS, this.COLOR);
    this.sprite.setStrokeStyle(4, 0xffff00);

    // Create physics body (static circle)
    this.body = scene.matter.add.circle(x, y, this.RADIUS, {
      isStatic: true,
      restitution: this.RESTITUTION,
      friction: 0,
      label: 'bumper',
    });
  }

  onHit(): number {
    if (this.isHit) return 0;

    // Flash effect
    this.isHit = true;
    this.sprite.fillColor = this.HIT_COLOR;

    // Scale bump animation
    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 50,
      yoyo: true,
      onComplete: () => {
        this.sprite.fillColor = this.COLOR;
        this.isHit = false;
      }
    });

    return this.SCORE_VALUE;
  }

  getBody(): MatterJS.BodyType {
    return this.body;
  }

  getPosition(): { x: number; y: number } {
    return { x: this.body.position.x, y: this.body.position.y };
  }

  destroy(): void {
    this.scene.matter.world.remove(this.body);
    this.sprite.destroy();
  }
}

import Phaser from 'phaser';

export class Enemy {
  private scene: Phaser.Scene;
  private sprite: Phaser.Physics.Matter.Sprite;
  private destroyed = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;

    // Create Matter.js sprite (sensor - doesn't block movement)
    this.sprite = scene.matter.add.sprite(x, y, 'enemy', undefined, {
      shape: { type: 'circle', radius: 20 },
      isSensor: true, // Pass through, just detect collision
      isStatic: true,
      label: 'enemy',
    });

    // Add floating animation
    scene.tweens.add({
      targets: this.sprite,
      y: y - 10,
      duration: 1000 + Math.random() * 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  getBody(): MatterJS.BodyType | null {
    if (this.destroyed || !this.sprite || !this.sprite.body) return null;
    return this.sprite.body as MatterJS.BodyType;
  }

  isDestroyed(): boolean {
    return this.destroyed;
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;

    // Stop the floating tween
    this.scene.tweens.killTweensOf(this.sprite);

    // Store position before destroying physics body
    const x = this.sprite.x;
    const y = this.sprite.y;

    // Immediately remove from physics world
    this.sprite.setVisible(false);
    this.sprite.destroy();

    // Create simple burst effect with graphics
    const burst = this.scene.add.graphics();
    burst.fillStyle(0xff0000, 1);
    burst.fillCircle(x, y, 30);

    // Fade out the burst
    this.scene.tweens.add({
      targets: burst,
      alpha: 0,
      scale: 2,
      duration: 200,
      ease: 'Power2',
      onComplete: () => {
        burst.destroy();
      },
    });
  }
}

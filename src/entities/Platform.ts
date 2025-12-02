import Phaser from 'phaser';

export class Platform {
  private sprite: Phaser.Physics.Matter.Sprite;
  private destroyed = false;

  constructor(scene: Phaser.Scene, x: number, y: number, width = 120, height = 24) {

    // Create Matter.js sprite - using sensor for one-way platform behavior
    this.sprite = scene.matter.add.sprite(x, y, 'platform', undefined, {
      shape: { type: 'rectangle', width, height },
      isStatic: true,
      isSensor: true, // Sensor so we can control collision manually
      label: 'platform',
    });
  }

  getBody(): MatterJS.BodyType | null {
    if (this.destroyed || !this.sprite || !this.sprite.body) return null;
    return this.sprite.body as MatterJS.BodyType;
  }

  getPosition(): { x: number; y: number } {
    return { x: this.sprite.x, y: this.sprite.y };
  }

  getTopY(): number {
    return this.sprite.y - 12; // Half the platform height
  }

  isDestroyed(): boolean {
    return this.destroyed;
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.sprite.destroy();
  }
}

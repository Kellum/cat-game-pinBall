import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig';

export class DrainZone {
  private scene: Phaser.Scene;
  private sprite: Phaser.GameObjects.Rectangle;
  private body: MatterJS.BodyType;

  // Drain zone settings
  private readonly HEIGHT = 60;
  private readonly COLOR = 0x990000;
  private readonly ALPHA = 0.5;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    const x = GAME_WIDTH / 2;
    const y = GAME_HEIGHT - this.HEIGHT / 2;

    // Create visual (red danger stripe)
    this.sprite = scene.add.rectangle(x, y, GAME_WIDTH, this.HEIGHT, this.COLOR, this.ALPHA);

    // Add danger stripes pattern
    const graphics = scene.add.graphics();
    graphics.fillStyle(0xff0000, 0.3);
    const stripeWidth = 40;
    for (let i = 0; i < GAME_WIDTH; i += stripeWidth * 2) {
      graphics.fillRect(i, y - this.HEIGHT / 2, stripeWidth, this.HEIGHT);
    }

    // Create physics body (sensor - doesn't physically block, just detects)
    this.body = scene.matter.add.rectangle(x, y, GAME_WIDTH, this.HEIGHT, {
      isStatic: true,
      isSensor: true, // Allows cat to pass through while triggering collision
      label: 'drain',
    });
  }

  getBody(): MatterJS.BodyType {
    return this.body;
  }

  destroy(): void {
    this.scene.matter.world.remove(this.body);
    this.sprite.destroy();
  }
}

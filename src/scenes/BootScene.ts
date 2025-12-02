import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Create placeholder graphics as textures
    this.createPlaceholderTextures();
  }

  create(): void {
    // Start the menu scene
    this.scene.start('MenuScene');
  }

  private createPlaceholderTextures(): void {
    // Cat texture (WHITE base so tinting works correctly)
    const catGraphics = this.make.graphics({ x: 0, y: 0 });
    catGraphics.fillStyle(0xffffff, 1); // White base for tinting
    catGraphics.fillCircle(32, 32, 28);
    // Ears
    catGraphics.fillTriangle(8, 12, 18, 0, 22, 18);
    catGraphics.fillTriangle(56, 12, 46, 0, 42, 18);
    // Eyes (drawn on top, not tinted)
    catGraphics.fillStyle(0x000000, 1);
    catGraphics.fillCircle(22, 28, 4);
    catGraphics.fillCircle(42, 28, 4);
    catGraphics.generateTexture('cat', 64, 64);
    catGraphics.destroy();

    // Enemy texture (red ninja)
    const enemyGraphics = this.make.graphics({ x: 0, y: 0 });
    enemyGraphics.fillStyle(0xff0000, 1); // Red
    enemyGraphics.fillCircle(24, 24, 20);
    // Ninja mask
    enemyGraphics.fillStyle(0x000000, 1);
    enemyGraphics.fillRect(4, 18, 40, 8);
    // Angry eyes
    enemyGraphics.fillStyle(0xffffff, 1);
    enemyGraphics.fillCircle(16, 22, 4);
    enemyGraphics.fillCircle(32, 22, 4);
    enemyGraphics.generateTexture('enemy', 48, 48);
    enemyGraphics.destroy();

    // Platform texture (brown branch)
    const platformGraphics = this.make.graphics({ x: 0, y: 0 });
    platformGraphics.fillStyle(0x8b4513, 1); // Brown
    platformGraphics.fillRoundedRect(0, 0, 120, 24, 8);
    platformGraphics.generateTexture('platform', 120, 24);
    platformGraphics.destroy();

    // Heart texture
    const heartGraphics = this.make.graphics({ x: 0, y: 0 });
    heartGraphics.fillStyle(0xff0066, 1);
    // Simple heart shape using circles and triangle
    heartGraphics.fillCircle(12, 10, 10);
    heartGraphics.fillCircle(28, 10, 10);
    heartGraphics.fillTriangle(2, 14, 38, 14, 20, 36);
    heartGraphics.generateTexture('heart', 40, 40);
    heartGraphics.destroy();

    // Empty heart texture
    const emptyHeartGraphics = this.make.graphics({ x: 0, y: 0 });
    emptyHeartGraphics.lineStyle(2, 0x666666, 1);
    emptyHeartGraphics.strokeCircle(12, 10, 10);
    emptyHeartGraphics.strokeCircle(28, 10, 10);
    emptyHeartGraphics.strokeTriangle(2, 14, 38, 14, 20, 36);
    emptyHeartGraphics.generateTexture('heart-empty', 40, 40);
    emptyHeartGraphics.destroy();

    // Ground texture
    const groundGraphics = this.make.graphics({ x: 0, y: 0 });
    groundGraphics.fillStyle(0x228b22, 1); // Forest green
    groundGraphics.fillRect(0, 0, 720, 100);
    groundGraphics.fillStyle(0x654321, 1); // Dirt brown
    groundGraphics.fillRect(0, 20, 720, 80);
    groundGraphics.generateTexture('ground', 720, 100);
    groundGraphics.destroy();
  }
}

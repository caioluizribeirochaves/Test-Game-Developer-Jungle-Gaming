import { Container, Sprite, Graphics } from 'pixi.js';
import { AssetLoader } from './AssetLoader';

export interface ObstacleBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class MapGenerator {
  public readonly width: number = 1920;
  public readonly height: number = 1080;

  // Static island obstacle bounding boxes that block ships and cannonballs
  public readonly obstacles: ObstacleBox[] = [
    // Top-Left Fortress Island
    { x: 0, y: 0, width: 440, height: 280 },
    // Top-Right Island outpost
    { x: 1540, y: 0, width: 380, height: 200 },
    // Bottom-Right Island with palm trees and beach
    { x: 1320, y: 660, width: 600, height: 420 },
    // Bottom-Left Small Rocky Shoal
    { x: 0, y: 840, width: 260, height: 240 },
  ];

  public isPointBlocked(x: number, y: number, radius: number = 0): boolean {
    // 1. Boundary check
    if (
      x - radius < 0 ||
      x + radius > this.width ||
      y - radius < 0 ||
      y + radius > this.height
    ) {
      return true;
    }

    // 2. Obstacle box check
    for (const box of this.obstacles) {
      const closestX = Math.max(box.x, Math.min(x, box.x + box.width));
      const closestY = Math.max(box.y, Math.min(y, box.y + box.height));
      const distanceX = x - closestX;
      const distanceY = y - closestY;
      const distanceSquared = distanceX * distanceX + distanceY * distanceY;

      if (distanceSquared < radius * radius) {
        return true;
      }
    }

    return false;
  }

  public findSafeSpawnPoint(playerX: number, playerY: number, minDistance: number): { x: number; y: number } {
    let attempts = 0;
    const padding = 120;

    while (attempts < 50) {
      attempts++;
      const rx = padding + Math.random() * (this.width - padding * 2);
      const ry = padding + Math.random() * (this.height - padding * 2);

      const dx = rx - playerX;
      const dy = ry - playerY;
      const dist = Math.hypot(dx, dy);

      if (dist >= minDistance && !this.isPointBlocked(rx, ry, 50)) {
        return { x: rx, y: ry };
      }
    }

    // Safe fallback spawn coordinates in open water
    return { x: 960, y: 300 };
  }

  public renderMap(container: Container): void {
    const assets = AssetLoader.getInstance();

    // 1. Ocean Background (tiled water)
    const oceanGfx = new Graphics();
    oceanGfx.rect(0, 0, this.width, this.height);
    oceanGfx.fill(0x3897b7); // Tropical ocean turquoise
    container.addChild(oceanGfx);

    // Subtle water caustics / wave tile overlay
    const tileSize = 64;
    for (let x = 0; x < this.width; x += tileSize * 2) {
      for (let y = 0; y < this.height; y += tileSize * 2) {
        const waterSprite = new Sprite(assets.getTexture('tile_73'));
        waterSprite.x = x;
        waterSprite.y = y;
        waterSprite.width = tileSize * 2;
        waterSprite.height = tileSize * 2;
        waterSprite.alpha = 0.25;
        container.addChild(waterSprite);
      }
    }

    // 2. Render Island Visuals matching sample.png
    for (const box of this.obstacles) {
      const islandGfx = new Graphics();
      // Outer Sand coast
      islandGfx.roundRect(box.x, box.y, box.width, box.height, 40);
      islandGfx.fill(0xe8d098); // Sandy beach

      // Inner Lush Grass
      const margin = 28;
      if (box.width > margin * 2 && box.height > margin * 2) {
        islandGfx.roundRect(
          box.x + margin,
          box.y + margin,
          box.width - margin * 2,
          box.height - margin * 2,
          24
        );
        islandGfx.fill(0x6ca336); // Lush tropical green
      }
      container.addChild(islandGfx);

      // Decorative items on islands (rocks, palm trees, fort structures)
      const numTrees = Math.floor((box.width * box.height) / 45000);
      for (let i = 0; i < numTrees; i++) {
        const treeSprite = new Sprite(assets.getTexture('tile_74')); // Palm tree or rock
        treeSprite.anchor.set(0.5);
        treeSprite.x = box.x + 40 + Math.random() * (box.width - 80);
        treeSprite.y = box.y + 40 + Math.random() * (box.height - 80);
        treeSprite.scale.set(1.2);
        container.addChild(treeSprite);
      }
    }
  }
}

import { Container, Sprite, Graphics } from 'pixi.js';
import { AssetLoader } from './AssetLoader';

export interface ObstacleBox {
  x: number;
  y: number;
  width: number;
  height: number;
  isRock?: boolean;
}

export class MapGenerator {
  public readonly width: number = 1920;
  public readonly height: number = 1080;

  // 4 Main Islands + 3 Isolated Sea Rocks matching the design reference
  public readonly obstacles: ObstacleBox[] = [
    // 1. Top-Left Tropical Island
    { x: 340, y: 140, width: 360, height: 260 },
    // 2. Top-Right Sandy Island
    { x: 1220, y: 140, width: 300, height: 240 },
    // 3. Bottom-Left Round Sand Island
    { x: 400, y: 680, width: 240, height: 240 },
    // 4. Bottom-Right Island with green strip
    { x: 1100, y: 680, width: 380, height: 220 },

    // Sea Rocks in open water channels
    { x: 940, y: 210, width: 50, height: 45, isRock: true },
    { x: 880, y: 840, width: 50, height: 45, isRock: true },
    { x: 1500, y: 630, width: 45, height: 40, isRock: true },
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

    // 2. Obstacles check
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
    const padding = 140;

    while (attempts < 60) {
      attempts++;
      const rx = padding + Math.random() * (this.width - padding * 2);
      const ry = padding + Math.random() * (this.height - padding * 2);

      const dx = rx - playerX;
      const dy = ry - playerY;
      const dist = Math.hypot(dx, dy);

      // Must be safely away from player and free of island obstacles
      if (dist >= minDistance && !this.isPointBlocked(rx, ry, 60)) {
        return { x: rx, y: ry };
      }
    }

    // Safe fallback spawn point in central channel
    return { x: 960, y: 480 };
  }

  public renderMap(container: Container): void {
    const assets = AssetLoader.getInstance();

    // 1. Ocean Background (deep tropical water)
    const oceanGfx = new Graphics();
    oceanGfx.rect(0, 0, this.width, this.height);
    oceanGfx.fill(0x3598be); // Tropical turquoise ocean
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
        waterSprite.alpha = 0.22;
        container.addChild(waterSprite);
      }
    }

    // 2. Render Shallow Water Halos around each island (as seen in Image 4)
    const haloGfx = new Graphics();
    for (const box of this.obstacles) {
      if (box.isRock) continue;
      const haloMargin = 45;
      haloGfx.roundRect(
        box.x - haloMargin,
        box.y - haloMargin,
        box.width + haloMargin * 2,
        box.height + haloMargin * 2,
        48
      );
      haloGfx.fill({ color: 0x9be8f7, alpha: 0.38 }); // Translucent shallow shoal
    }
    container.addChild(haloGfx);

    // 3. Render Island Bodies (Sand + Lush Greenery + Decor)
    for (const box of this.obstacles) {
      if (box.isRock) {
        // Sea Rock
        const rockSprite = new Sprite(assets.getTexture('tile_67'));
        rockSprite.anchor.set(0.5);
        rockSprite.x = box.x + box.width / 2;
        rockSprite.y = box.y + box.height / 2;
        rockSprite.scale.set(1.1);
        container.addChild(rockSprite);
        continue;
      }

      // Sand Beach Base
      const islandGfx = new Graphics();
      islandGfx.roundRect(box.x, box.y, box.width, box.height, 42);
      islandGfx.fill(0xf4d399); // Golden beach sand
      container.addChild(islandGfx);

      // Lush Grass Interior
      if (box === this.obstacles[0]) {
        // Top-Left: Large grass meadow
        const grassGfx = new Graphics();
        grassGfx.roundRect(box.x + 40, box.y + 35, box.width - 80, box.height - 70, 24);
        grassGfx.fill(0x6ca336);
        container.addChild(grassGfx);

        // Palm tree on top-left
        const palm = new Sprite(assets.getTexture('tile_74'));
        palm.anchor.set(0.5);
        palm.x = box.x + 90;
        palm.y = box.y + 90;
        palm.scale.set(1.4);
        container.addChild(palm);

        // Small rock & bush
        const bush = new Sprite(assets.getTexture('tile_78'));
        bush.anchor.set(0.5);
        bush.x = box.x + 240;
        bush.y = box.y + 160;
        container.addChild(bush);
      } else if (box === this.obstacles[1]) {
        // Top-Right: Sand island with central rock
        const rock = new Sprite(assets.getTexture('tile_68'));
        rock.anchor.set(0.5);
        rock.x = box.x + box.width / 2;
        rock.y = box.y + box.height / 2;
        rock.scale.set(1.2);
        container.addChild(rock);
      } else if (box === this.obstacles[2]) {
        // Bottom-Left: Round sand island with small sprouts
        const sprout = new Sprite(assets.getTexture('tile_79'));
        sprout.anchor.set(0.5);
        sprout.x = box.x + box.width / 2;
        sprout.y = box.y + box.height / 2;
        container.addChild(sprout);
      } else if (box === this.obstacles[3]) {
        // Bottom-Right: Horizontal grass strip with palm tree
        const grassStrip = new Graphics();
        grassStrip.roundRect(box.x + 50, box.y + 70, box.width - 100, 70, 20);
        grassStrip.fill(0x6ca336);
        container.addChild(grassStrip);

        const palm = new Sprite(assets.getTexture('tile_74'));
        palm.anchor.set(0.5);
        palm.x = box.x + 130;
        palm.y = box.y + 100;
        palm.scale.set(1.3);
        container.addChild(palm);
      }
    }
  }
}

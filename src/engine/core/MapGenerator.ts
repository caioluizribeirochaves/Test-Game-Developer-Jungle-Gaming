import { Container, Sprite, Graphics } from 'pixi.js';
import { AssetLoader } from './AssetLoader';

export interface ObstacleBox {
  x: number;
  y: number;
  width: number;
  height: number;
  isRock?: boolean;
}

interface WaveRipple {
  baseX: number;
  baseY: number;
  length: number;
  speed: number;
  phase: number;
}

export class MapGenerator {
  public readonly width: number = 1920;
  public readonly height: number = 1080;

  // 4 Main Islands + 4 Isolated Sea Rocks in open navigation channels
  public readonly obstacles: ObstacleBox[] = [
    // 1. Top-Left Imperial Fortress Island (Complete Castle with Grassy Courtyard + Palms + Clean Beach)
    { x: 280, y: 130, width: 400, height: 300 },
    // 2. Top-Right Tropical Lagoon Haven (Palm Grove + Flower Meadow + Clean Beach)
    { x: 1220, y: 130, width: 400, height: 290 },
    // 3. Bottom-Left Natural Island (Grass Meadow + Coconut Grove + Clean Beach)
    { x: 280, y: 670, width: 380, height: 280 },
    // 4. Bottom-Right Siren's Coral Archipelago (Grass Meadow + Palm Grove + Clean Beach)
    { x: 1200, y: 670, width: 420, height: 280 },

    // Sea Rocks scattered in open navigation lanes (balanced tactical obstacles)
    { x: 920, y: 160, width: 85, height: 75, isRock: true },   // North Channel
    { x: 940, y: 840, width: 85, height: 75, isRock: true },   // South Channel
    { x: 130, y: 520, width: 75, height: 70, isRock: true },   // West Channel
    { x: 1730, y: 520, width: 75, height: 70, isRock: true },  // East Channel
  ];

  private waveGfx: Graphics | null = null;
  private waveRipples: WaveRipple[] = [];

  constructor() {
    this.initWaveRipples();
  }

  private initWaveRipples(): void {
    this.waveRipples = [];
    const count = 42;
    for (let i = 0; i < count; i++) {
      this.waveRipples.push({
        baseX: 60 + Math.random() * (this.width - 120),
        baseY: 60 + Math.random() * (this.height - 120),
        length: 28 + Math.random() * 34,
        speed: 0.8 + Math.random() * 0.7,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  public isPointBlocked(x: number, y: number, radius: number = 0): boolean {
    // 1. Arena Boundary
    if (
      x - radius < 0 ||
      x + radius > this.width ||
      y - radius < 0 ||
      y + radius > this.height
    ) {
      return true;
    }

    // 2. Island & Rock Obstacles
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
    const padding = 160;

    while (attempts < 80) {
      attempts++;
      const rx = padding + Math.random() * (this.width - padding * 2);
      const ry = padding + Math.random() * (this.height - padding * 2);

      const dx = rx - playerX;
      const dy = ry - playerY;
      const dist = Math.hypot(dx, dy);

      if (dist >= minDistance && !this.isPointBlocked(rx, ry, 110)) {
        let safeFromObstacles = true;
        for (const box of this.obstacles) {
          const closestX = Math.max(box.x, Math.min(rx, box.x + box.width));
          const closestY = Math.max(box.y, Math.min(ry, box.y + box.height));
          if (Math.hypot(rx - closestX, ry - closestY) < 120) {
            safeFromObstacles = false;
            break;
          }
        }
        if (safeFromObstacles) {
          return { x: rx, y: ry };
        }
      }
    }

    return { x: 960, y: 500 };
  }

  public renderMap(container: Container): void {
    const assets = AssetLoader.getInstance();

    // 1. Subtle Maritime Safe Navigation Boundary (Marks arena limits over ocean water)
    const boundaryGfx = new Graphics();
    boundaryGfx.rect(0, 0, this.width, this.height);
    boundaryGfx.stroke({ color: 0xffffff, alpha: 0.15, width: 2.5 });
    container.addChild(boundaryGfx);

    // 2. Caribbean Shallow Water / Coral Shoals (Multi-layered luminous cyan caustics)
    const haloGfx = new Graphics();
    for (const box of this.obstacles) {
      if (box.isRock) {
        haloGfx.circle(box.x + box.width / 2, box.y + box.height / 2, 48);
        haloGfx.fill({ color: 0x8be5f5, alpha: 0.22 });
        haloGfx.circle(box.x + box.width / 2, box.y + box.height / 2, 36);
        haloGfx.fill({ color: 0x48cae4, alpha: 0.35 });
        continue;
      }
      const outerMargin = 48;
      haloGfx.roundRect(
        box.x - outerMargin,
        box.y - outerMargin,
        box.width + outerMargin * 2,
        box.height + outerMargin * 2,
        56
      );
      haloGfx.fill({ color: 0x8be5f5, alpha: 0.24 });

      const innerMargin = 26;
      haloGfx.roundRect(
        box.x - innerMargin,
        box.y - innerMargin,
        box.width + innerMargin * 2,
        box.height + innerMargin * 2,
        42
      );
      haloGfx.fill({ color: 0x48cae4, alpha: 0.32 });
    }
    container.addChild(haloGfx);

    // 3. Gentle Ocean Water Surface Waves
    this.waveGfx = new Graphics();
    container.addChild(this.waveGfx);

    // 4. Construct Each of the 4 Clean Islands with Authentic Seamless Tiles, Greenery & Palms
    this.renderIsland1(container, assets, this.obstacles[0]!); // Top-Left Fortress with Grassy Courtyard
    this.renderIsland2(container, assets, this.obstacles[1]!); // Top-Right Tropical Lagoon Haven
    this.renderIsland3(container, assets, this.obstacles[2]!); // Bottom-Left Natural Island
    this.renderIsland4(container, assets, this.obstacles[3]!); // Bottom-Right Siren's Coral Archipelago

    // 5. Render Sea Rocks in Open Navigation Channels
    this.renderSeaRocks(container, assets);
  }

  /**
   * Updates water ripples gently creating a living ocean wave effect without seams or tone differences.
   */
  public updateWater(dt: number, totalTime: number): void {
    if (!this.waveGfx) return;
    this.waveGfx.clear();

    for (const r of this.waveRipples) {
      const waveY = r.baseY + Math.sin(totalTime * 1.5 + r.phase) * 5;
      const waveX = r.baseX + Math.cos(totalTime * 1.0 + r.phase) * 6;
      const alpha = 0.20 + Math.sin(totalTime * 2.2 + r.phase) * 0.12;

      // Primary wave crest arc
      this.waveGfx.moveTo(waveX - r.length / 2, waveY);
      this.waveGfx.quadraticCurveTo(waveX - r.length / 4, waveY - 3, waveX, waveY);
      this.waveGfx.quadraticCurveTo(waveX + r.length / 4, waveY + 3, waveX + r.length / 2, waveY);
      this.waveGfx.stroke({ width: 2.2, color: 0xffffff, alpha, cap: 'round' });

      // Subtle cyan caustics under-ripple
      this.waveGfx.moveTo(waveX - r.length * 0.3, waveY + 2.5);
      this.waveGfx.quadraticCurveTo(waveX, waveY + 5, waveX + r.length * 0.3, waveY + 2.5);
      this.waveGfx.stroke({ width: 1.6, color: 0x8be5f5, alpha: alpha * 0.65, cap: 'round' });
    }
  }

  /**
   * Builds an authentic seamless 9-slice sand coast with unified sand interior.
   */
  private buildSandCoast(
    container: Container,
    assets: AssetLoader,
    x: number,
    y: number,
    w: number,
    h: number,
    seed: number = 0
  ): void {
    const tileDisplay = 58;
    const cols = Math.round(w / tileDisplay);
    const rows = Math.round(h / tileDisplay);
    const tW = w / cols;
    const tH = h / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let tileKey = 'tile_18'; // Smooth clean sand base

        if (c === 0 && r === 0) tileKey = 'tile_1';
        else if (c === cols - 1 && r === 0) tileKey = 'tile_3';
        else if (c === 0 && r === rows - 1) tileKey = 'tile_33';
        else if (c === cols - 1 && r === rows - 1) tileKey = 'tile_35';
        else if (r === 0) tileKey = 'tile_2';
        else if (r === rows - 1) tileKey = 'tile_34';
        else if (c === 0) tileKey = 'tile_17';
        else if (c === cols - 1) tileKey = 'tile_19';
        else {
          const s = (c * 17 + r * 23 + seed * 13) % 9;
          if (s === 1) tileKey = 'tile_4';  // subtle sand dune ripple
          else if (s === 2) tileKey = 'tile_20'; // sandy texture
          else if (s === 3) tileKey = 'tile_21'; // sand ripples
          else tileKey = 'tile_18';
        }

        const sprite = new Sprite(assets.getTexture(tileKey));
        sprite.x = x + c * tW;
        sprite.y = y + r * tH;
        sprite.width = tW;
        sprite.height = tH;
        container.addChild(sprite);
      }
    }
  }

  /**
   * Builds a lush grass meadow with natural edge variations, flower daisies, and tufts.
   */
  private buildGrassMeadow(
    container: Container,
    assets: AssetLoader,
    x: number,
    y: number,
    w: number,
    h: number,
    seed: number = 0
  ): void {
    const tileDisplay = 52;
    const cols = Math.round(w / tileDisplay);
    const rows = Math.round(h / tileDisplay);
    const tW = w / cols;
    const tH = h / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let tileKey = 'tile_40'; // Center grass

        if (r === 0) {
          tileKey = ((c + seed) % 3 === 0) ? 'tile_8' : 'tile_7'; // Organic northern sand-to-grass wave
        } else if (r === rows - 1) {
          tileKey = ((c + seed) % 3 === 1) ? 'tile_56' : 'tile_55'; // Organic southern sand-to-grass wave
        } else if (c === 0) {
          tileKey = 'tile_22'; // Organic western edge
        } else if (c === cols - 1) {
          tileKey = 'tile_25'; // Organic eastern edge
        } else {
          const rand = (c * 19 + r * 31 + seed * 7) % 8;
          if (rand === 1 || rand === 5) tileKey = 'tile_24'; // White daisies flower meadow!
          else if (rand === 2 || rand === 6) tileKey = 'tile_39'; // Grass tufts!
          else tileKey = 'tile_40';
        }

        const sprite = new Sprite(assets.getTexture(tileKey));
        sprite.x = x + c * tW;
        sprite.y = y + r * tH;
        sprite.width = tW;
        sprite.height = tH;
        container.addChild(sprite);
      }
    }
  }

  /**
   * Renders a complete stone fortress / castle using Kenney pirate tileset components.
   * Features:
   * - 4 Corner stone towers (NW: tile_77, NE: tile_78, SW: tile_93, SE: tile_94)
   * - Mounted defense cannons pointing North (tile_47), South (tile_48), East (tile_31), and West (tile_32)
   * - Stone ramparts (tile_16 horizontal, tile_15 vertical)
   * - Wooden Drawbridge / Gate entrance (tile_76)
   * - Courtyard interior: Pure lush green grass lawn (tile_40), per user request!
   */
  private renderCompleteCastle(container: Container, assets: AssetLoader, castleX: number, castleY: number): void {
    const t = 52;

    const castleLayout: Array<{ c: number; r: number; key: string }> = [
      // Row 0 (North Wall with North-facing cannon)
      { c: 0, r: 0, key: 'tile_77' }, // NW Tower
      { c: 1, r: 0, key: 'tile_16' }, // Rampart
      { c: 2, r: 0, key: 'tile_47' }, // Cannon facing North!
      { c: 3, r: 0, key: 'tile_16' }, // Rampart
      { c: 4, r: 0, key: 'tile_78' }, // NE Tower

      // Row 1 (Upper Courtyard: Clean lush green grass lawn)
      { c: 0, r: 1, key: 'tile_15' }, // West Rampart
      { c: 1, r: 1, key: 'tile_40' }, // Grass lawn
      { c: 2, r: 1, key: 'tile_40' }, // Grass lawn
      { c: 3, r: 1, key: 'tile_40' }, // Grass lawn
      { c: 4, r: 1, key: 'tile_15' }, // East Rampart

      // Row 2 (Lower Courtyard with West & East cannons: Clean lush green grass lawn)
      { c: 0, r: 2, key: 'tile_32' }, // Cannon facing West!
      { c: 1, r: 2, key: 'tile_40' }, // Grass lawn
      { c: 2, r: 2, key: 'tile_40' }, // Grass lawn
      { c: 3, r: 2, key: 'tile_40' }, // Grass lawn
      { c: 4, r: 2, key: 'tile_31' }, // Cannon facing East!

      // Row 3 (South Wall with Drawbridge Gate & South cannon)
      { c: 0, r: 3, key: 'tile_93' }, // SW Tower
      { c: 1, r: 3, key: 'tile_16' }, // Rampart
      { c: 2, r: 3, key: 'tile_76' }, // Wooden Drawbridge / Gate!
      { c: 3, r: 3, key: 'tile_48' }, // Cannon facing South!
      { c: 4, r: 3, key: 'tile_94' }, // SE Tower
    ];

    for (const item of castleLayout) {
      const sprite = new Sprite(assets.getTexture(item.key));
      sprite.x = castleX + item.c * t;
      sprite.y = castleY + item.r * t;
      sprite.width = t;
      sprite.height = t;
      container.addChild(sprite);
    }
  }

  /**
   * Island 1: Imperial Fortress Island (Top-Left)
   * Hosts the complete stone castle with grassy courtyard interior, surrounded by tropical palms and clean beaches.
   */
  private renderIsland1(container: Container, assets: AssetLoader, box: ObstacleBox): void {
    // 1. Organic sand coastline
    this.buildSandCoast(container, assets, box.x, box.y, box.width, box.height, 1);

    // 2. Lush grass meadow grounds
    const grassPadX = 45;
    const grassPadY = 44;
    this.buildGrassMeadow(
      container,
      assets,
      box.x + grassPadX,
      box.y + grassPadY,
      box.width - grassPadX * 2,
      box.height - grassPadY * 2,
      1
    );

    // 3. Complete Stone Fortress / Castle with Grassy Courtyard
    this.renderCompleteCastle(container, assets, box.x + 70, box.y + 46);

    // 4. Lush Tropical Coconut Palms & Shrubbery
    const palm1 = new Sprite(assets.getTexture('tile_71'));
    palm1.anchor.set(0.5);
    palm1.x = box.x + 45;
    palm1.y = box.y + 50;
    palm1.scale.set(1.3);
    container.addChild(palm1);

    const palm2 = new Sprite(assets.getTexture('tile_72'));
    palm2.anchor.set(0.5);
    palm2.x = box.x + 355;
    palm2.y = box.y + 50;
    palm2.scale.set(1.25);
    container.addChild(palm2);

    const palm3 = new Sprite(assets.getTexture('tile_71'));
    palm3.anchor.set(0.5);
    palm3.x = box.x + 355;
    palm3.y = box.y + 240;
    palm3.scale.set(1.3);
    container.addChild(palm3);

    const palmBush = new Sprite(assets.getTexture('tile_70'));
    palmBush.anchor.set(0.5);
    palmBush.x = box.x + 45;
    palmBush.y = box.y + 240;
    palmBush.scale.set(1.2);
    container.addChild(palmBush);

    // 5. Green Foliage Sprouts
    const sprout1 = new Sprite(assets.getTexture('tile_87'));
    sprout1.anchor.set(0.5);
    sprout1.x = box.x + 50;
    sprout1.y = box.y + 130;
    container.addChild(sprout1);

    const sprout2 = new Sprite(assets.getTexture('tile_88'));
    sprout2.anchor.set(0.5);
    sprout2.x = box.x + 350;
    sprout2.y = box.y + 140;
    container.addChild(sprout2);
  }

  /**
   * Island 2: Tropical Lagoon Haven (Top-Right)
   * Dense coconut grove, flower meadow, and clean sandy beaches.
   */
  private renderIsland2(container: Container, assets: AssetLoader, box: ObstacleBox): void {
    // 1. Organic sand base
    this.buildSandCoast(container, assets, box.x, box.y, box.width, box.height, 2);

    // 2. Organic grass meadow
    const grassPadX = 48;
    const grassPadY = 44;
    this.buildGrassMeadow(
      container,
      assets,
      box.x + grassPadX,
      box.y + grassPadY,
      box.width - grassPadX * 2,
      box.height - grassPadY * 2,
      2
    );

    // 3. Coconut Palm Grove
    const palm1 = new Sprite(assets.getTexture('tile_71'));
    palm1.anchor.set(0.5);
    palm1.x = box.x + 120;
    palm1.y = box.y + 85;
    palm1.scale.set(1.4);
    container.addChild(palm1);

    const palm2 = new Sprite(assets.getTexture('tile_72'));
    palm2.anchor.set(0.5);
    palm2.x = box.x + 210;
    palm2.y = box.y + 75;
    palm2.scale.set(1.25);
    container.addChild(palm2);

    const palm3 = new Sprite(assets.getTexture('tile_71'));
    palm3.anchor.set(0.5);
    palm3.x = box.x + 305;
    palm3.y = box.y + 105;
    palm3.scale.set(1.3);
    container.addChild(palm3);

    const palm4 = new Sprite(assets.getTexture('tile_72'));
    palm4.anchor.set(0.5);
    palm4.x = box.x + 160;
    palm4.y = box.y + 165;
    palm4.scale.set(1.2);
    container.addChild(palm4);

    // 4. Palm bushes
    const bush1 = new Sprite(assets.getTexture('tile_70'));
    bush1.anchor.set(0.5);
    bush1.x = box.x + 85;
    bush1.y = box.y + 185;
    bush1.scale.set(1.25);
    container.addChild(bush1);

    const bush2 = new Sprite(assets.getTexture('tile_70'));
    bush2.anchor.set(0.5);
    bush2.x = box.x + 285;
    bush2.y = box.y + 195;
    bush2.scale.set(1.2);
    container.addChild(bush2);

    // 5. Green Foliage Sprouts
    const sprout = new Sprite(assets.getTexture('tile_88'));
    sprout.anchor.set(0.5);
    sprout.x = box.x + 240;
    sprout.y = box.y + 240;
    container.addChild(sprout);
  }

  /**
   * Island 3: Natural Tropical Island (Bottom-Left)
   * Clean natural island with coconut palm grove, lush meadow, and clean sandy beaches.
   */
  private renderIsland3(container: Container, assets: AssetLoader, box: ObstacleBox): void {
    // 1. Organic sand base
    this.buildSandCoast(container, assets, box.x, box.y, box.width, box.height, 3);

    // 2. Organic grass meadow
    const grassPadX = 45;
    const grassPadY = 44;
    this.buildGrassMeadow(
      container,
      assets,
      box.x + grassPadX,
      box.y + grassPadY,
      box.width - grassPadX * 2,
      box.height - grassPadY * 2,
      3
    );

    // 3. Coconut Palms & Foliage Grove
    const palm1 = new Sprite(assets.getTexture('tile_71'));
    palm1.anchor.set(0.5);
    palm1.x = box.x + 85;
    palm1.y = box.y + 70;
    palm1.scale.set(1.35);
    container.addChild(palm1);

    const palm2 = new Sprite(assets.getTexture('tile_72'));
    palm2.anchor.set(0.5);
    palm2.x = box.x + 220;
    palm2.y = box.y + 80;
    palm2.scale.set(1.25);
    container.addChild(palm2);

    const palm3 = new Sprite(assets.getTexture('tile_71'));
    palm3.anchor.set(0.5);
    palm3.x = box.x + 300;
    palm3.y = box.y + 150;
    palm3.scale.set(1.3);
    container.addChild(palm3);

    const palm4 = new Sprite(assets.getTexture('tile_72'));
    palm4.anchor.set(0.5);
    palm4.x = box.x + 140;
    palm4.y = box.y + 190;
    palm4.scale.set(1.2);
    container.addChild(palm4);

    const bush1 = new Sprite(assets.getTexture('tile_70'));
    bush1.anchor.set(0.5);
    bush1.x = box.x + 80;
    bush1.y = box.y + 150;
    bush1.scale.set(1.2);
    container.addChild(bush1);

    const bush2 = new Sprite(assets.getTexture('tile_70'));
    bush2.anchor.set(0.5);
    bush2.x = box.x + 230;
    bush2.y = box.y + 215;
    bush2.scale.set(1.2);
    container.addChild(bush2);

    const sprout = new Sprite(assets.getTexture('tile_88'));
    sprout.anchor.set(0.5);
    sprout.x = box.x + 205;
    sprout.y = box.y + 150;
    container.addChild(sprout);
  }

  /**
   * Island 4: Siren's Coral Archipelago (Bottom-Right)
   * Flower meadows, palm grove, and clean sandy beaches.
   */
  private renderIsland4(container: Container, assets: AssetLoader, box: ObstacleBox): void {
    // 1. Organic sand base
    this.buildSandCoast(container, assets, box.x, box.y, box.width, box.height, 4);

    // 2. Lush Grass Meadow with Daisy Flower Tufts
    const grassPadX = 45;
    const grassPadY = 44;
    this.buildGrassMeadow(
      container,
      assets,
      box.x + grassPadX,
      box.y + grassPadY,
      box.width - grassPadX * 2,
      box.height - grassPadY * 2,
      4
    );

    // 3. Coconut Palm Canopy Cluster
    const palmNW = new Sprite(assets.getTexture('tile_71'));
    palmNW.anchor.set(0.5);
    palmNW.x = box.x + 85;
    palmNW.y = box.y + 65;
    palmNW.scale.set(1.35);
    container.addChild(palmNW);

    const palmMid = new Sprite(assets.getTexture('tile_72'));
    palmMid.anchor.set(0.5);
    palmMid.x = box.x + 190;
    palmMid.y = box.y + 110;
    palmMid.scale.set(1.2);
    container.addChild(palmMid);

    const palmRight = new Sprite(assets.getTexture('tile_71'));
    palmRight.anchor.set(0.5);
    palmRight.x = box.x + 300;
    palmRight.y = box.y + 90;
    palmRight.scale.set(1.3);
    container.addChild(palmRight);

    // 4. Palm bushes
    const bush1 = new Sprite(assets.getTexture('tile_70'));
    bush1.anchor.set(0.5);
    bush1.x = box.x + 330;
    bush1.y = box.y + 160;
    bush1.scale.set(1.2);
    container.addChild(bush1);

    const bush2 = new Sprite(assets.getTexture('tile_70'));
    bush2.anchor.set(0.5);
    bush2.x = box.x + 95;
    bush2.y = box.y + 170;
    bush2.scale.set(1.15);
    container.addChild(bush2);

    // 5. Green Sprouts
    const sprout = new Sprite(assets.getTexture('tile_87'));
    sprout.anchor.set(0.5);
    sprout.x = box.x + 160;
    sprout.y = box.y + 205;
    container.addChild(sprout);
  }

  /**
   * Renders scattered sea rocks as navigation obstacles in open channels,
   * with natural companion pebbles.
   */
  private renderSeaRocks(container: Container, assets: AssetLoader): void {
    const rocks = [
      { box: this.obstacles[4]!, mainTex: 'tile_67', subTex: 'tile_49', width: 85, height: 75 }, // North Channel
      { box: this.obstacles[5]!, mainTex: 'tile_66', subTex: 'tile_50', width: 85, height: 75 }, // South Channel
      { box: this.obstacles[6]!, mainTex: 'tile_51', subTex: 'tile_49', width: 75, height: 70 }, // West Channel
      { box: this.obstacles[7]!, mainTex: 'tile_65', subTex: 'tile_50', width: 75, height: 70 }, // East Channel
    ];

    for (const r of rocks) {
      const cx = r.box.x + r.box.width / 2;
      const cy = r.box.y + r.box.height / 2;

      // 1. Primary sea rock
      const rockSprite = new Sprite(assets.getTexture(r.mainTex));
      rockSprite.anchor.set(0.5);
      rockSprite.x = cx;
      rockSprite.y = cy;
      rockSprite.width = r.width;
      rockSprite.height = r.height;
      container.addChild(rockSprite);

      // 2. Small companion pebble/rock for natural irregularity
      if (r.subTex) {
        const subSprite = new Sprite(assets.getTexture(r.subTex));
        subSprite.anchor.set(0.5);
        subSprite.x = cx + (r.width * 0.32);
        subSprite.y = cy + (r.height * 0.28);
        subSprite.scale.set(0.9);
        container.addChild(subSprite);
      }
    }
  }
}

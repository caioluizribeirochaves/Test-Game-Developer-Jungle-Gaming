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

  // 4 Main Islands + 3 Isolated Sea Rocks matching the design reference
  public readonly obstacles: ObstacleBox[] = [
    // 1. Top-Left Tropical Island (Lush greenery + Fort Tower + Palm trees)
    { x: 340, y: 140, width: 360, height: 260 },
    // 2. Top-Right Sandy Dune Island (Rock formations + Sunken Cannon + Palm bush)
    { x: 1220, y: 140, width: 300, height: 240 },
    // 3. Bottom-Left Fortified Outpost Island (Stone Fort + Battlements + Cannon)
    { x: 400, y: 680, width: 240, height: 240 },
    // 4. Bottom-Right Palm Strip Island (Green meadow + Stranded boat + Twin Palms)
    { x: 1100, y: 680, width: 380, height: 220 },

    // Sea Rocks in open navigation channels (matching visual sprite footprint)
    { x: 920, y: 195, width: 90, height: 80, isRock: true },
    { x: 865, y: 825, width: 85, height: 75, isRock: true },
    { x: 1480, y: 615, width: 80, height: 75, isRock: true },
  ];

  private waveGfx: Graphics | null = null;
  private waveRipples: WaveRipple[] = [];

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

    return { x: 960, y: 480 };
  }

  public renderMap(container: Container): void {
    const assets = AssetLoader.getInstance();

    // 1. Subtle Maritime Safe Navigation Boundary (Marks arena gameplay limits over full-screen water)
    const boundaryGfx = new Graphics();
    boundaryGfx.rect(0, 0, this.width, this.height);
    boundaryGfx.stroke({ color: 0xffffff, alpha: 0.15, width: 2.5 });
    container.addChild(boundaryGfx);

    // 3. Shallow Water Shoals around Islands (Halos)
    const haloGfx = new Graphics();
    for (const box of this.obstacles) {
      if (box.isRock) {
        // Soft round foam ring around sea rocks
        haloGfx.circle(box.x + box.width / 2, box.y + box.height / 2, 38);
        haloGfx.fill({ color: 0x8be5f5, alpha: 0.35 });
        continue;
      }
      const haloMargin = 42;
      haloGfx.roundRect(
        box.x - haloMargin,
        box.y - haloMargin,
        box.width + haloMargin * 2,
        box.height + haloMargin * 2,
        50
      );
      haloGfx.fill({ color: 0x8be5f5, alpha: 0.38 });
    }
    container.addChild(haloGfx);

    // 4. Construct Each Island Using Authentic Seamless Tiles & Transparent Props
    this.renderIsland1(container, assets, this.obstacles[0]!); // Top-Left Tropical
    this.renderIsland2(container, assets, this.obstacles[1]!); // Top-Right Sand Dunes
    this.renderIsland3(container, assets, this.obstacles[2]!); // Bottom-Left Fort Outpost
    this.renderIsland4(container, assets, this.obstacles[3]!); // Bottom-Right Palm Strip

    // 5. Render Sea Rocks in Open Water Channels
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
   * Helper to tile an area with 9-slice sand coast tiles and pure sand interior.
   */
  private buildSandCoast(
    container: Container,
    assets: AssetLoader,
    x: number,
    y: number,
    w: number,
    h: number
  ): void {
    const tileDisplay = 60;
    const cols = Math.round(w / tileDisplay);
    const rows = Math.round(h / tileDisplay);
    const tW = w / cols;
    const tH = h / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let tileKey = 'tile_18'; // Solid smooth sand interior

        if (c === 0 && r === 0) tileKey = 'tile_1'; // NW corner
        else if (c === cols - 1 && r === 0) tileKey = 'tile_3'; // NE corner
        else if (c === 0 && r === rows - 1) tileKey = 'tile_33'; // SW corner
        else if (c === cols - 1 && r === rows - 1) tileKey = 'tile_35'; // SE corner
        else if (r === 0) tileKey = 'tile_2'; // N edge
        else if (r === rows - 1) tileKey = 'tile_34'; // S edge
        else if (c === 0) tileKey = 'tile_17'; // W edge
        else if (c === cols - 1) tileKey = 'tile_19'; // E edge
        else {
          tileKey = 'tile_18'; // Clean unified sand
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
   * Helper to tile a lush grass meadow.
   */
  private buildGrassMeadow(
    container: Container,
    assets: AssetLoader,
    x: number,
    y: number,
    w: number,
    h: number
  ): void {
    const tileDisplay = 55;
    const cols = Math.round(w / tileDisplay);
    const rows = Math.round(h / tileDisplay);
    const tW = w / cols;
    const tH = h / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let tileKey = 'tile_40'; // Rich center grass

        if (c === 0 && r === 0) tileKey = 'tile_23'; // NW grass
        else if (c === cols - 1 && r === 0) tileKey = 'tile_9'; // NE grass
        else if (c === 0 && r === rows - 1) tileKey = 'tile_54'; // SW grass
        else if (c === cols - 1 && r === rows - 1) tileKey = 'tile_57'; // SE grass
        else if (r === 0) tileKey = 'tile_7'; // N grass edge
        else if (r === rows - 1) tileKey = 'tile_55'; // S grass edge
        else if (c === 0) tileKey = 'tile_22'; // W grass edge
        else if (c === cols - 1) tileKey = 'tile_25'; // E grass edge
        else {
          const rand = (c * 11 + r * 17) % 6;
          if (rand === 1) tileKey = 'tile_24'; // Grass with flowers/daisies
          else if (rand === 2) tileKey = 'tile_39'; // Grass tufts
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
   * Top-Left Tropical Island:
   * Authentic sand coast, lush green interior, coastal fort tower,
   * palm canopy, sprouts, and stranded rowing dinghy (transparent PNG).
   */
  private renderIsland1(container: Container, assets: AssetLoader, box: ObstacleBox): void {
    // 1. Sand base with real coast tiles
    this.buildSandCoast(container, assets, box.x, box.y, box.width, box.height);

    // 2. Lush grass meadow inside
    const grassPadX = 50;
    const grassPadY = 45;
    this.buildGrassMeadow(
      container,
      assets,
      box.x + grassPadX,
      box.y + grassPadY,
      box.width - grassPadX * 2,
      box.height - grassPadY * 2
    );

    // 3. Circular Stone Fort Tower (tile_13 & tile_29)
    const towerBody = new Sprite(assets.getTexture('tile_29'));
    towerBody.anchor.set(0.5);
    towerBody.x = box.x + 230;
    towerBody.y = box.y + 160;
    towerBody.scale.set(1.1);
    container.addChild(towerBody);

    const towerRoof = new Sprite(assets.getTexture('tile_13'));
    towerRoof.anchor.set(0.5);
    towerRoof.x = box.x + 230;
    towerRoof.y = box.y + 160;
    towerRoof.scale.set(1.1);
    container.addChild(towerRoof);

    // 4. Large Tropical Palm Canopy (tile_71 & tile_72)
    const palm1 = new Sprite(assets.getTexture('tile_71'));
    palm1.anchor.set(0.5);
    palm1.x = box.x + 105;
    palm1.y = box.y + 95;
    palm1.scale.set(1.35);
    container.addChild(palm1);

    const palm2 = new Sprite(assets.getTexture('tile_72'));
    palm2.anchor.set(0.5);
    palm2.x = box.x + 145;
    palm2.y = box.y + 115;
    palm2.scale.set(1.1);
    container.addChild(palm2);

    // 5. Green Foliage Sprouts (tile_87 & tile_88)
    const sprout1 = new Sprite(assets.getTexture('tile_87'));
    sprout1.anchor.set(0.5);
    sprout1.x = box.x + 185;
    sprout1.y = box.y + 100;
    container.addChild(sprout1);

    const sprout2 = new Sprite(assets.getTexture('tile_88'));
    sprout2.anchor.set(0.5);
    sprout2.x = box.x + 120;
    sprout2.y = box.y + 175;
    container.addChild(sprout2);

    // 6. Stranded wooden dinghy on southern beach (transparent sprite)
    const dinghy = new Sprite(assets.getTexture('dinghy_large_1'));
    dinghy.anchor.set(0.5);
    dinghy.x = box.x + 65;
    dinghy.y = box.y + 205;
    dinghy.scale.set(1.1);
    dinghy.rotation = -0.3;
    container.addChild(dinghy);
  }

  /**
   * Top-Right Sand Dune Island:
   * Pristine desert sands, transparent rocks, sunken cannon, and palm bush.
   */
  private renderIsland2(container: Container, assets: AssetLoader, box: ObstacleBox): void {
    // 1. Sand coast tiles
    this.buildSandCoast(container, assets, box.x, box.y, box.width, box.height);

    // 2. Central Rock Formations (tile_66, tile_50, tile_49 - all transparent)
    const mossRock = new Sprite(assets.getTexture('tile_66'));
    mossRock.anchor.set(0.5);
    mossRock.x = box.x + box.width / 2;
    mossRock.y = box.y + box.height / 2 - 15;
    mossRock.scale.set(1.25);
    container.addChild(mossRock);

    const smallRock = new Sprite(assets.getTexture('tile_50'));
    smallRock.anchor.set(0.5);
    smallRock.x = box.x + box.width / 2 + 40;
    smallRock.y = box.y + box.height / 2 + 15;
    container.addChild(smallRock);

    const tinyRock = new Sprite(assets.getTexture('tile_49'));
    tinyRock.anchor.set(0.5);
    tinyRock.x = box.x + 75;
    tinyRock.y = box.y + 90;
    tinyRock.scale.set(1.1);
    container.addChild(tinyRock);

    // 3. Desert Palm Shrub (tile_70)
    const palmBush = new Sprite(assets.getTexture('tile_70'));
    palmBush.anchor.set(0.5);
    palmBush.x = box.x + 70;
    palmBush.y = box.y + 165;
    palmBush.scale.set(1.2);
    container.addChild(palmBush);

    // 4. Sunken Cannon in Sand (transparent cannon sprite)
    const looseCannon = new Sprite(assets.getTexture('cannon_loose'));
    looseCannon.anchor.set(0.5);
    looseCannon.x = box.x + 195;
    looseCannon.y = box.y + 175;
    looseCannon.rotation = 0.5;
    looseCannon.scale.set(1.3);
    container.addChild(looseCannon);
  }

  /**
   * Bottom-Left Fortified Outpost Island:
   * Circular stone fort with battlements, coastal defense cannon, and sand perimeter.
   */
  private renderIsland3(container: Container, assets: AssetLoader, box: ObstacleBox): void {
    // 1. Sand coast
    this.buildSandCoast(container, assets, box.x, box.y, box.width, box.height);

    // 2. Stone Dock / Pier (tile_76)
    const dock = new Sprite(assets.getTexture('tile_76'));
    dock.anchor.set(0.5);
    dock.x = box.x + 55;
    dock.y = box.y + box.height / 2;
    dock.scale.set(1.1);
    container.addChild(dock);

    // 3. Fort Tower (tile_14 & tile_30)
    const fortBase = new Sprite(assets.getTexture('tile_30'));
    fortBase.anchor.set(0.5);
    fortBase.x = box.x + box.width / 2 + 10;
    fortBase.y = box.y + box.height / 2;
    fortBase.scale.set(1.25);
    container.addChild(fortBase);

    const fortRoof = new Sprite(assets.getTexture('tile_14'));
    fortRoof.anchor.set(0.5);
    fortRoof.x = box.x + box.width / 2 + 10;
    fortRoof.y = box.y + box.height / 2;
    fortRoof.scale.set(1.25);
    container.addChild(fortRoof);

    // 4. Coastal Defense Cannon (transparent cannon sprite)
    const cannon = new Sprite(assets.getTexture('cannon_mobile'));
    cannon.anchor.set(0.5);
    cannon.x = box.x + box.width / 2 + 65;
    cannon.y = box.y + box.height / 2;
    cannon.scale.set(1.2);
    container.addChild(cannon);

    // 5. Small rock next to water
    const rock = new Sprite(assets.getTexture('tile_49'));
    rock.anchor.set(0.5);
    rock.x = box.x + 80;
    rock.y = box.y + 60;
    container.addChild(rock);
  }

  /**
   * Bottom-Right Palm Strip Island:
   * Elongated island with horizontal lush green meadow, twin palm trees,
   * palm shrub, and stranded dinghy.
   */
  private renderIsland4(container: Container, assets: AssetLoader, box: ObstacleBox): void {
    // 1. Sand base
    this.buildSandCoast(container, assets, box.x, box.y, box.width, box.height);

    // 2. Horizontal Green Meadow
    const grassPadX = 45;
    const grassPadY = 45;
    this.buildGrassMeadow(
      container,
      assets,
      box.x + grassPadX,
      box.y + grassPadY,
      box.width - grassPadX * 2,
      box.height - grassPadY * 2
    );

    // 3. Palm Trees (tile_71)
    const palmLeft = new Sprite(assets.getTexture('tile_71'));
    palmLeft.anchor.set(0.5);
    palmLeft.x = box.x + 110;
    palmLeft.y = box.y + 95;
    palmLeft.scale.set(1.3);
    container.addChild(palmLeft);

    const palmRight = new Sprite(assets.getTexture('tile_71'));
    palmRight.anchor.set(0.5);
    palmRight.x = box.x + 250;
    palmRight.y = box.y + 105;
    palmRight.scale.set(1.25);
    container.addChild(palmRight);

    // 4. Palm Bush (tile_70)
    const bush = new Sprite(assets.getTexture('tile_70'));
    bush.anchor.set(0.5);
    bush.x = box.x + 180;
    bush.y = box.y + 115;
    container.addChild(bush);

    // 5. Stranded Dinghy on Eastern Beach (transparent sprite)
    const dinghy = new Sprite(assets.getTexture('dinghy_large_2'));
    dinghy.anchor.set(0.5);
    dinghy.x = box.x + box.width - 50;
    dinghy.y = box.y + 140;
    dinghy.rotation = 0.25;
    container.addChild(dinghy);
  }

  /**
   * Sea Rocks in open navigation channels.
   */
  private renderSeaRocks(container: Container, assets: AssetLoader): void {
    const rocks = [
      { box: this.obstacles[4]!, tex: 'tile_67', width: 90, height: 80 },
      { box: this.obstacles[5]!, tex: 'tile_66', width: 85, height: 75 },
      { box: this.obstacles[6]!, tex: 'tile_50', width: 80, height: 75 },
    ];

    for (const r of rocks) {
      const rockSprite = new Sprite(assets.getTexture(r.tex));
      rockSprite.anchor.set(0.5);
      rockSprite.x = r.box.x + r.box.width / 2;
      rockSprite.y = r.box.y + r.box.height / 2;
      rockSprite.width = r.width;
      rockSprite.height = r.height;
      container.addChild(rockSprite);
    }
  }
}

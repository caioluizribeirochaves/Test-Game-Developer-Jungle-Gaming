import { Container, Sprite, Graphics } from 'pixi.js';
import { AssetLoader } from '../core/AssetLoader';
import { GameplayBalanceConfig } from '../config/gameConfig';
import { ObstacleAvoidance } from '../core/ObstacleAvoidance';

export class ChaserEnemy {
  public x: number;
  public y: number;
  public angle: number = 0;
  public speed: number;
  public health: number;
  public maxHealth: number;
  public radius: number = 26;
  public isDestroyed: boolean = false;
  public readonly type = 'chaser' as const;

  private container: Container;
  private sprite: Sprite;
  private shadowSprite: Sprite;
  private config: GameplayBalanceConfig;

  private currentStage: number = 0;
  private readonly stageSprites = ['ship_3', 'ship_9', 'ship_15', 'ship_21'];

  private fireContainer: Container;
  private fireSprites: Sprite[] = [];
  private fireAnimTimer: number = 0;
  private fireFrameToggle: boolean = false;

  private healthBarContainer: Container;
  private healthFrameSprite: Sprite;
  private healthFillSprite: Sprite;
  private healthFillMask: Graphics;

  public spawnTimer: number = 0;
  public readonly spawnDuration: number = 1.2;

  constructor(x: number, y: number, config: GameplayBalanceConfig, parent: Container) {
    this.x = x;
    this.y = y;
    this.config = config;
    this.health = config.chaserMaxHealth;
    this.maxHealth = config.chaserMaxHealth;
    this.speed = config.chaserMoveSpeed;

    this.container = new Container();
    parent.addChild(this.container);

    const assets = AssetLoader.getInstance();

    // 1. Dynamic Ship Shadow cast on the water (matching media_1791068554369.png)
    this.shadowSprite = new Sprite(assets.getTexture(this.stageSprites[0]!));
    this.shadowSprite.anchor.set(0.5);
    this.shadowSprite.scale.set(0.45);
    this.shadowSprite.tint = 0x071e2c;
    this.shadowSprite.alpha = 0;
    this.container.addChild(this.shadowSprite);

    // 2. Chaser Ship Sprite (Surfacing spawn animation)
    this.sprite = new Sprite(assets.getTexture(this.stageSprites[0]!));
    this.sprite.anchor.set(0.5);
    this.sprite.scale.set(0.45);
    this.sprite.alpha = 0.15;
    this.container.addChild(this.sprite);

    // 3. Multi-flame billowing effect on sails & deck (matching media_1791068148655.png)
    this.fireContainer = new Container();
    this.sprite.addChild(this.fireContainer);

    const flameConfigs = [
      { x: -10, y: -8, baseAngle: 0.25, scale: 0.85 },
      { x: 10, y: -5, baseAngle: -0.22, scale: 0.78 },
      { x: 0, y: -16, baseAngle: 0.05, scale: 1.05 },
      { x: -4, y: 12, baseAngle: -0.1, scale: 0.8 },
    ];

    this.fireSprites = flameConfigs.map((cfg) => {
      const sp = new Sprite(assets.getTexture('fire_1'));
      sp.anchor.set(0.5, 0.9);
      sp.position.set(cfg.x, cfg.y);
      sp.rotation = Math.PI + cfg.baseAngle; // Inverted towards bow (matching request)
      sp.scale.set(cfg.scale);
      sp.visible = false;
      this.fireContainer.addChild(sp);
      return sp;
    });

    // 4. Authentic Floating Health Bar (enemy_health_frame)
    this.healthBarContainer = new Container();
    this.healthBarContainer.position.set(0, -44);
    this.container.addChild(this.healthBarContainer);

    // Frame sits underneath with wooden border and dark groove
    this.healthFrameSprite = new Sprite(assets.getTexture('enemy_health_frame'));
    this.healthFrameSprite.anchor.set(0.5);
    this.healthFrameSprite.width = 52;
    this.healthFrameSprite.height = 13;
    this.healthBarContainer.addChild(this.healthFrameSprite);

    // Fill sits on top of frame and is masked according to health percentage
    this.healthFillSprite = new Sprite(assets.getTexture('enemy_health_fill_green'));
    this.healthFillSprite.anchor.set(0.5);
    this.healthFillSprite.width = 52;
    this.healthFillSprite.height = 13;
    this.healthBarContainer.addChild(this.healthFillSprite);

    this.healthFillMask = new Graphics();
    this.healthFillSprite.mask = this.healthFillMask;
    this.healthBarContainer.addChild(this.healthFillMask);

    this.updatePosition();
    this.updateHealthBar();
  }

  public update(
    dt: number,
    targetX: number,
    targetY: number,
    mapBlockedCheck: (x: number, y: number, r: number) => boolean,
    obstacles: any[] = [],
    arenaWidth: number = 1920,
    arenaHeight: number = 1080,
    otherEnemies?: { x: number; y: number; radius: number }[]
  ): void {
    if (this.isDestroyed) return;

    // Obstacle avoidance navigation
    const steering = ObstacleAvoidance.computeSteering(
      this.x,
      this.y,
      this.angle,
      targetX,
      targetY,
      this.radius,
      obstacles,
      arenaWidth,
      arenaHeight,
      mapBlockedCheck,
      otherEnemies
    );
    const desiredAngle = steering.desiredAngle;
    const speedMult = steering.speedMultiplier;

    // Surfacing spawn animation (gradual organic emergence matching Image 4)
    if (this.spawnTimer < this.spawnDuration) {
      this.spawnTimer += dt;
      const progress = Math.min(1, this.spawnTimer / this.spawnDuration);
      const ease = 1 - Math.pow(1 - progress, 2);
      const curScale = 0.45 + 0.45 * ease;
      this.sprite.scale.set(curScale);
      this.sprite.alpha = 0.15 + 0.85 * ease;
      this.shadowSprite.scale.set(curScale);
      this.shadowSprite.alpha = 0.36 * ease;
      this.healthBarContainer.alpha = ease;
    }

    // Smooth turn towards desired angle
    let angleDiff = desiredAngle - this.angle;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

    const maxTurn = this.config.chaserTurnSpeed * dt;
    this.angle += Math.max(-maxTurn, Math.min(maxTurn, angleDiff));

    // Realistic turning deceleration
    const turnPenalty = Math.max(0.7, 1 - Math.abs(angleDiff) * 0.3);
    const surfacingSpeedMult = this.spawnTimer < this.spawnDuration ? 0.3 + 0.7 * (this.spawnTimer / this.spawnDuration) : 1.0;
    const moveSpeed = this.speed * speedMult * turnPenalty * surfacingSpeedMult;

    const nextX = this.x + Math.cos(this.angle) * moveSpeed * dt;
    const nextY = this.y + Math.sin(this.angle) * moveSpeed * dt;

    if (!mapBlockedCheck(nextX, nextY, this.radius)) {
      this.x = nextX;
      this.y = nextY;
    } else {
      let moved = false;
      if (!mapBlockedCheck(nextX, this.y, this.radius)) {
        this.x = nextX;
        moved = true;
      } else if (!mapBlockedCheck(this.x, nextY, this.radius)) {
        this.y = nextY;
        moved = true;
      }

      if (!moved) {
        for (const box of obstacles) {
          const cx = Math.max(box.x, Math.min(this.x, box.x + box.width));
          const cy = Math.max(box.y, Math.min(this.y, box.y + box.height));
          const d = Math.hypot(this.x - cx, this.y - cy);
          if (d < this.radius + 35 && d > 0.01) {
            const nx = (this.x - cx) / d;
            const ny = (this.y - cy) / d;
            let tx = -ny;
            let ty = nx;
            const toTgtX = Math.cos(desiredAngle);
            const toTgtY = Math.sin(desiredAngle);
            if (tx * toTgtX + ty * toTgtY < 0) {
              tx = -tx;
              ty = -ty;
            }
            const slideX = this.x + (tx * 0.95 + nx * 0.3) * moveSpeed * dt;
            const slideY = this.y + (ty * 0.95 + ny * 0.3) * moveSpeed * dt;
            if (!mapBlockedCheck(slideX, slideY, this.radius)) {
              this.x = slideX;
              this.y = slideY;
            } else {
              this.x += nx * 40 * dt;
              this.y += ny * 40 * dt;
            }
            break;
          }
        }
      }
    }

    // Physical separation from other enemies (prevents ships stacking or locking together)
    if (otherEnemies) {
      for (const other of otherEnemies) {
        if (other.x === this.x && other.y === this.y) continue;
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        const dist = Math.hypot(dx, dy);
        const minDist = this.radius + other.radius + 4;
        if (dist > 0.1 && dist < minDist) {
          const push = ((minDist - dist) / minDist) * 75 * dt;
          const px = this.x + (dx / dist) * push;
          const py = this.y + (dy / dist) * push;
          if (!mapBlockedCheck(px, py, this.radius)) {
            this.x = px;
            this.y = py;
          }
        }
      }
    }

    // Strict boundary enforcement (never sail into edge)
    const edgeMargin = 40;
    if (this.x < edgeMargin) this.x = edgeMargin;
    if (this.x > arenaWidth - edgeMargin) this.x = arenaWidth - edgeMargin;
    if (this.y < edgeMargin) this.y = edgeMargin;
    if (this.y > arenaHeight - edgeMargin) this.y = arenaHeight - edgeMargin;

    // Animated Fire on deck when health is low (matching media_1791068148655.png)
    const healthRatio = this.health / this.maxHealth;
    if (healthRatio <= 0.6) {
      this.fireAnimTimer += dt;
      if (this.fireAnimTimer >= 0.08) {
        this.fireAnimTimer = 0;
        this.fireFrameToggle = !this.fireFrameToggle;
        const assets = AssetLoader.getInstance();
        const tex1 = assets.getTexture(this.fireFrameToggle ? 'fire_1' : 'fire_2');
        const tex2 = assets.getTexture(this.fireFrameToggle ? 'fire_2' : 'fire_1');
        this.fireSprites[0]!.texture = tex1;
        this.fireSprites[1]!.texture = tex2;
        this.fireSprites[2]!.texture = tex1;
        this.fireSprites[3]!.texture = tex2;
      }

      const sway = Math.sin(performance.now() * 0.008);
      const flutter = Math.sin(performance.now() * 0.015);

      this.fireSprites[0]!.visible = true;
      this.fireSprites[0]!.rotation = Math.PI + 0.25 + sway * 0.12;
      this.fireSprites[0]!.scale.set(0.85 + flutter * 0.1);

      this.fireSprites[1]!.visible = true;
      this.fireSprites[1]!.rotation = Math.PI - 0.22 - sway * 0.12;
      this.fireSprites[1]!.scale.set(0.78 + flutter * 0.08);

      if (healthRatio <= 0.3) {
        this.fireSprites[2]!.visible = true;
        this.fireSprites[2]!.rotation = Math.PI + 0.05 + sway * 0.15;
        this.fireSprites[2]!.scale.set(1.05 + flutter * 0.14);

        this.fireSprites[3]!.visible = true;
        this.fireSprites[3]!.rotation = Math.PI - 0.1 + sway * 0.08;
        this.fireSprites[3]!.scale.set(0.8 + flutter * 0.1);
      } else {
        this.fireSprites[2]!.visible = false;
        this.fireSprites[3]!.visible = false;
      }
    } else {
      for (const sp of this.fireSprites) {
        sp.visible = false;
      }
    }

    this.updatePosition();
  }

  public takeDamage(amount: number): boolean {
    if (this.isDestroyed) return false;

    this.health = Math.max(0, this.health - amount);
    if (this.health <= 0) {
      this.isDestroyed = true;
    }
    this.updateHealthBar();
    this.updateVisualStage();

    if (this.isDestroyed) {
      return true; // Killed by player attack
    }
    return false;
  }

  private updateVisualStage(): void {
    let newStage = 0;
    if (this.health <= 0 || this.isDestroyed) {
      newStage = 3; // Grey destroyed shipwreck (ship_21) ONLY upon death
    } else {
      const ratio = this.health / this.maxHealth;
      if (ratio > 0.6) newStage = 0;
      else if (ratio > 0.3) newStage = 1;
      else newStage = 2; // Heavily damaged red wood hull (ship_15) - never grey while alive
    }

    if (newStage !== this.currentStage) {
      this.currentStage = newStage;
      const assets = AssetLoader.getInstance();
      const tex = assets.getTexture(this.stageSprites[this.currentStage]!);
      this.sprite.texture = tex;
      this.shadowSprite.texture = tex;
    }
  }

  private updatePosition(): void {
    this.container.x = this.x;
    this.container.y = this.y;
    const rot = this.angle + Math.PI / 2;
    this.sprite.rotation = rot;
    this.shadowSprite.rotation = rot;
    this.shadowSprite.position.set(9, 13);
  }

  private updateHealthBar(): void {
    const ratio = Math.max(0, Math.min(1, this.health / this.maxHealth));
    const assets = AssetLoader.getInstance();

    // Color logic: 100 to 50 = green, below 50 to 0 = red (matching user instruction)
    const fillName =
      ratio >= 0.5 ? 'enemy_health_fill_green' : 'enemy_health_fill_red';
    this.healthFillSprite.texture = assets.getTexture(fillName);

    const totalW = 52;
    const totalH = 13;
    // Inner groove for enemy frame runs from 21/160 to 139/160
    const grooveStartX = -totalW / 2 + totalW * (21 / 160);
    const grooveW = totalW * (118 / 160);
    const fillW = grooveW * ratio;

    this.healthFillMask.clear();
    if (fillW > 0) {
      this.healthFillMask.rect(grooveStartX, -totalH / 2, fillW, totalH);
      this.healthFillMask.fill(0xffffff);
      this.healthFillSprite.visible = true;
    } else {
      this.healthFillSprite.visible = false;
    }
  }

  public destroy(): void {
    this.isDestroyed = true;
    if (this.container.parent) {
      this.container.parent.removeChild(this.container);
    }
    this.container.destroy({ children: true });
  }
}

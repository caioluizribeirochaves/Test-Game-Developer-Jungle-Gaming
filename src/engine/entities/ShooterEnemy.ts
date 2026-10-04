import { Container, Sprite, Graphics } from 'pixi.js';
import { AssetLoader } from '../core/AssetLoader';
import { GameplayBalanceConfig } from '../config/gameConfig';
import { Projectile } from './Projectile';
import { ObstacleAvoidance } from '../core/ObstacleAvoidance';
import { NavGrid } from '../core/NavGrid';

export class ShooterEnemy {
  public x: number;
  public y: number;
  public angle: number = 0;
  public speed: number;
  public health: number;
  public maxHealth: number;
  public radius: number = 28;
  public isDestroyed: boolean = false;
  public readonly type = 'shooter' as const;

  private cooldown: number = 0;
  private container: Container;
  private sprite: Sprite;
  private shadowSprite: Sprite;
  private config: GameplayBalanceConfig;

  private currentStage: number = 0;
  private readonly stageSprites = ['ship_5', 'ship_11', 'ship_17', 'ship_23'];

  private fireContainer: Container;
  private fireSprites: Sprite[] = [];
  private fireAnimTimer: number = 0;
  private fireFrameToggle: boolean = false;

  private healthBarContainer: Container;
  private healthFrameSprite: Sprite;
  private healthFillSprite: Sprite;
  private healthFillMask: Graphics;

  private orbitDir: number = 1;

  constructor(x: number, y: number, config: GameplayBalanceConfig, parent: Container) {
    this.x = x;
    this.y = y;
    this.config = config;
    this.health = config.shooterMaxHealth;
    this.maxHealth = config.shooterMaxHealth;
    this.speed = config.shooterMoveSpeed;
    this.cooldown = 1.0 + Math.random(); // Initial firing delay

    this.container = new Container();
    parent.addChild(this.container);

    const assets = AssetLoader.getInstance();

    // 1. Dynamic Ship Shadow cast on the water (matching media_1791068554369.png)
    this.shadowSprite = new Sprite(assets.getTexture(this.stageSprites[0]!));
    this.shadowSprite.anchor.set(0.5);
    this.shadowSprite.scale.set(0.95);
    this.shadowSprite.tint = 0x071e2c;
    this.shadowSprite.alpha = 0.36;
    this.container.addChild(this.shadowSprite);

    // 2. Shooter Ship Sprite (Blue sails: Ranged Cannon Shooter)
    this.sprite = new Sprite(assets.getTexture(this.stageSprites[0]!));
    this.sprite.anchor.set(0.5);
    this.sprite.scale.set(0.95);
    this.container.addChild(this.sprite);

    // 3. Multi-flame billowing effect on sails & deck (matching media_1791068148655.png)
    this.fireContainer = new Container();
    this.sprite.addChild(this.fireContainer);

    const flameConfigs = [
      { x: -11, y: -9, baseAngle: 0.25, scale: 0.9 },
      { x: 11, y: -6, baseAngle: -0.22, scale: 0.82 },
      { x: 0, y: -17, baseAngle: 0.05, scale: 1.1 },
      { x: -5, y: 13, baseAngle: -0.1, scale: 0.85 },
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
    this.healthBarContainer.position.set(0, -46);
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
    onSpawnProjectile: (proj: Projectile) => void,
    onPlayCannonSound: () => void,
    obstacles: any[] = [],
    arenaWidth: number = 1920,
    arenaHeight: number = 1080,
    otherEnemies?: { x: number; y: number; radius: number }[]
  ): void {
    if (this.isDestroyed) return;

    if (this.cooldown > 0) {
      this.cooldown -= dt;
    }

    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const distance = Math.hypot(dx, dy);
    const targetAngle = Math.atan2(dy, dx);

    // Tactical navigation: pursue player directly if line-of-sight is blocked by islands
    const hasLOS = NavGrid.getInstance(arenaWidth, arenaHeight, obstacles).hasLineOfSight(
      this.x,
      this.y,
      targetX,
      targetY
    );
    let navTargetX = targetX;
    let navTargetY = targetY;

    if (hasLOS && distance <= this.config.shooterDesiredDistance * 1.15) {
      // Orbit around the player at combat distance only in clear open water
      const orbitAngle = targetAngle + (Math.PI / 2) * this.orbitDir;
      const desiredRange = this.config.shooterDesiredDistance;
      const candX = targetX + Math.cos(orbitAngle) * desiredRange;
      const candY = targetY + Math.sin(orbitAngle) * desiredRange;

      if (!mapBlockedCheck(candX, candY, this.radius)) {
        navTargetX = candX;
        navTargetY = candY;
      } else {
        this.orbitDir = -this.orbitDir;
      }
    }

    const steering = ObstacleAvoidance.computeSteering(
      this.x,
      this.y,
      this.angle,
      navTargetX,
      navTargetY,
      this.radius,
      obstacles,
      arenaWidth,
      arenaHeight,
      mapBlockedCheck,
      otherEnemies
    );
    const desiredAngle = steering.desiredAngle;
    const speedMult = steering.speedMultiplier;

    // Smooth turn towards desired angle
    let angleDiff = desiredAngle - this.angle;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

    const maxTurn = this.config.shooterTurnSpeed * dt;
    this.angle += Math.max(-maxTurn, Math.min(maxTurn, angleDiff));

    const moveSpeed = this.speed * speedMult;
    const nextX = this.x + Math.cos(this.angle) * moveSpeed * dt;
    const nextY = this.y + Math.sin(this.angle) * moveSpeed * dt;

    if (!mapBlockedCheck(nextX, nextY, this.radius)) {
      this.x = nextX;
      this.y = nextY;
    } else {
      // Find closest obstacle to slide along its boundary towards target
      let closestDist = Infinity;
      let closestNormX = 0;
      let closestNormY = 0;

      for (const box of obstacles) {
        const cx = Math.max(box.x, Math.min(this.x, box.x + box.width));
        const cy = Math.max(box.y, Math.min(this.y, box.y + box.height));
        const d = Math.hypot(this.x - cx, this.y - cy);
        if (d < closestDist) {
          closestDist = d;
          if (d > 0.01) {
            closestNormX = (this.x - cx) / d;
            closestNormY = (this.y - cy) / d;
          }
        }
      }

      if (closestDist < this.radius + 40 && (closestNormX !== 0 || closestNormY !== 0)) {
        let tangX = -closestNormY;
        let tangY = closestNormX;

        const toTargetX = navTargetX - this.x;
        const toTargetY = navTargetY - this.y;
        if (tangX * toTargetX + tangY * toTargetY < 0) {
          tangX = -tangX;
          tangY = -tangY;
        }

        const slideX = this.x + (tangX * 0.85 + closestNormX * 0.4) * moveSpeed * dt;
        const slideY = this.y + (tangY * 0.85 + closestNormY * 0.4) * moveSpeed * dt;

        if (!mapBlockedCheck(slideX, slideY, this.radius)) {
          this.x = slideX;
          this.y = slideY;
        } else if (!mapBlockedCheck(this.x + closestNormX * 30 * dt, this.y + closestNormY * 30 * dt, this.radius)) {
          this.x += closestNormX * 30 * dt;
          this.y += closestNormY * 30 * dt;
        }
      } else {
        if (!mapBlockedCheck(nextX, this.y, this.radius)) {
          this.x = nextX;
        } else if (!mapBlockedCheck(this.x, nextY, this.radius)) {
          this.y = nextY;
        }
      }
    }

    // Strict boundary enforcement (never sail into edge)
    const edgeMargin = 70;
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
      this.fireSprites[0]!.scale.set(0.9 + flutter * 0.1);

      this.fireSprites[1]!.visible = true;
      this.fireSprites[1]!.rotation = Math.PI - 0.22 - sway * 0.12;
      this.fireSprites[1]!.scale.set(0.82 + flutter * 0.08);

      if (healthRatio <= 0.3) {
        this.fireSprites[2]!.visible = true;
        this.fireSprites[2]!.rotation = Math.PI + 0.05 + sway * 0.15;
        this.fireSprites[2]!.scale.set(1.1 + flutter * 0.14);

        this.fireSprites[3]!.visible = true;
        this.fireSprites[3]!.rotation = Math.PI - 0.1 + sway * 0.08;
        this.fireSprites[3]!.scale.set(0.85 + flutter * 0.1);
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

    // Fire cannons when in attack range and cooldown ready
    if (distance <= this.config.shooterAttackRange && this.cooldown <= 0) {
      this.fire(targetAngle, onSpawnProjectile);
      onPlayCannonSound();
      this.cooldown = this.config.shooterCooldown;
    }
  }

  private fire(angle: number, onSpawnProjectile: (proj: Projectile) => void): void {
    const bowOffset = 34;
    const spawnX = this.x + Math.cos(this.angle) * bowOffset;
    const spawnY = this.y + Math.sin(this.angle) * bowOffset;

    const proj = new Projectile(
      {
        x: spawnX,
        y: spawnY,
        angle,
        speed: this.config.shooterProjectileSpeed,
        damage: this.config.shooterProjectileDamage,
        lifetime: this.config.shooterProjectileLifetime,
        owner: 'enemy',
      },
      this.container.parent as Container
    );
    onSpawnProjectile(proj);
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
      return true; // Destroyed
    }
    return false;
  }

  private updateVisualStage(): void {
    let newStage = 0;
    if (this.health <= 0 || this.isDestroyed) {
      newStage = 3; // Grey destroyed shipwreck (ship_23) ONLY upon death
    } else {
      const ratio = this.health / this.maxHealth;
      if (ratio > 0.6) newStage = 0;
      else if (ratio > 0.3) newStage = 1;
      else newStage = 2; // Heavily damaged blue wood hull (ship_17) - never grey while alive
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

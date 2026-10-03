import { Container, Sprite, Graphics } from 'pixi.js';
import { AssetLoader } from '../core/AssetLoader';
import { GameplayBalanceConfig } from '../config/gameConfig';
import { Projectile } from './Projectile';
import { ObstacleAvoidance } from '../core/ObstacleAvoidance';

export class ShooterEnemy {
  public x: number;
  public y: number;
  public angle: number = 0;
  public speed: number;
  public health: number;
  public maxHealth: number;
  public radius: number = 30;
  public isDestroyed: boolean = false;
  public readonly type = 'shooter' as const;

  private cooldown: number = 0;
  private container: Container;
  private sprite: Sprite;
  private healthBarGfx: Graphics;
  private config: GameplayBalanceConfig;

  private currentStage: number = 0;
  private readonly stageSprites = ['ship_3', 'ship_9', 'ship_15', 'ship_21'];

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
    this.sprite = new Sprite(assets.getTexture(this.stageSprites[0]!));
    this.sprite.anchor.set(0.5);
    this.container.addChild(this.sprite);

    this.healthBarGfx = new Graphics();
    this.container.addChild(this.healthBarGfx);

    this.updatePosition();
    this.updateHealthBar();
  }

  private stuckTimer: number = 0;
  private evadeTimer: number = 0;
  private evadeDir: number = 1;

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

    // Obstacle avoidance navigation
    let desiredAngle: number;
    let speedMult = 1.0;

    if (this.evadeTimer > 0) {
      this.evadeTimer -= dt;
      desiredAngle = this.angle + this.evadeDir * 1.5;
    } else {
      // Determine virtual target: if too close to player, back up / flank
      let navTargetX = targetX;
      let navTargetY = targetY;
      if (distance < this.config.shooterDesiredDistance * 0.8) {
        // Flank or back off
        navTargetX = this.x - Math.cos(targetAngle) * 200;
        navTargetY = this.y - Math.sin(targetAngle) * 200;
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
      desiredAngle = steering.desiredAngle;
      speedMult = steering.speedMultiplier;
    }

    // Smooth turn towards desired angle
    let angleDiff = desiredAngle - this.angle;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

    const maxTurn = this.config.shooterTurnSpeed * dt;
    this.angle += Math.max(-maxTurn, Math.min(maxTurn, angleDiff));

    // Distance management
    let moveDir = 0;
    if (distance > this.config.shooterDesiredDistance) {
      moveDir = 1;
    } else if (distance < this.config.shooterDesiredDistance * 0.7) {
      moveDir = -0.5; // Back off
    } else {
      // Gentle cruise / broadside positioning
      moveDir = 0.4;
    }

    const prevX = this.x;
    const prevY = this.y;
    const moveSpeed = this.speed * speedMult * Math.abs(moveDir);
    const sign = Math.sign(moveDir);

    const nextX = this.x + Math.cos(this.angle) * moveSpeed * sign * dt;
    const nextY = this.y + Math.sin(this.angle) * moveSpeed * sign * dt;

    if (!mapBlockedCheck(nextX, nextY, this.radius)) {
      this.x = nextX;
      this.y = nextY;
    } else {
      if (!mapBlockedCheck(nextX, this.y, this.radius)) {
        this.x = nextX;
      } else if (!mapBlockedCheck(this.x, nextY, this.radius)) {
        this.y = nextY;
      }
    }

    // Stuck detection
    const movedDist = Math.hypot(this.x - prevX, this.y - prevY);
    if (moveDir !== 0 && movedDist < moveSpeed * dt * 0.25) {
      this.stuckTimer += dt;
      if (this.stuckTimer > 0.25) {
        this.evadeTimer = 0.5;
        this.evadeDir = Math.random() < 0.5 ? -1 : 1;
        this.stuckTimer = 0;
      }
    } else {
      this.stuckTimer = Math.max(0, this.stuckTimer - dt);
    }

    this.updatePosition();

    // Fire when in attack range and cooldown elapsed
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
    this.updateHealthBar();
    this.updateVisualStage();

    if (this.health <= 0) {
      this.isDestroyed = true;
      return true; // Destroyed
    }
    return false;
  }

  private updateVisualStage(): void {
    const ratio = this.health / this.maxHealth;
    let newStage = 0;
    if (ratio > 0.75) newStage = 0;
    else if (ratio > 0.5) newStage = 1;
    else if (ratio > 0.25) newStage = 2;
    else newStage = 3;

    if (newStage !== this.currentStage) {
      this.currentStage = newStage;
      const assets = AssetLoader.getInstance();
      this.sprite.texture = assets.getTexture(this.stageSprites[this.currentStage]!);
    }
  }

  private updatePosition(): void {
    this.container.x = this.x;
    this.container.y = this.y;
    this.sprite.rotation = this.angle + Math.PI / 2;
  }

  private updateHealthBar(): void {
    this.healthBarGfx.clear();
    const w = 40;
    const h = 5;
    const yOffset = -48;

    this.healthBarGfx.roundRect(-w / 2, yOffset, w, h, 2);
    this.healthBarGfx.fill(0x1a2530);
    this.healthBarGfx.stroke({ width: 1, color: 0xdfa837, alpha: 0.8 });

    const ratio = Math.max(0, Math.min(1, this.health / this.maxHealth));
    const fillWidth = Math.max(0, (w - 2) * ratio);

    if (fillWidth > 0) {
      this.healthBarGfx.roundRect(-w / 2 + 1, yOffset + 1, fillWidth, h - 2, 1);
      this.healthBarGfx.fill(0xe74c3c);
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

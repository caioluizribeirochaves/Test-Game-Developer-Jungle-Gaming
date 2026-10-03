import { Container, Sprite, Graphics } from 'pixi.js';
import { AssetLoader } from '../core/AssetLoader';
import { GameplayBalanceConfig } from '../config/gameConfig';
import { Projectile } from './Projectile';

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

  public update(
    dt: number,
    targetX: number,
    targetY: number,
    mapBlockedCheck: (x: number, y: number, r: number) => boolean,
    onSpawnProjectile: (proj: Projectile) => void,
    onPlayCannonSound: () => void
  ): void {
    if (this.isDestroyed) return;

    if (this.cooldown > 0) {
      this.cooldown -= dt;
    }

    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const distance = Math.hypot(dx, dy);
    const targetAngle = Math.atan2(dy, dx);

    // Smooth rotation towards player
    let angleDiff = targetAngle - this.angle;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

    const maxTurn = this.config.shooterTurnSpeed * dt;
    this.angle += Math.max(-maxTurn, Math.min(maxTurn, angleDiff));

    // Distance management: approach if too far, keep distance if in range
    let moveDir = 0;
    if (distance > this.config.shooterDesiredDistance) {
      moveDir = 1;
    } else if (distance < this.config.shooterDesiredDistance * 0.7) {
      moveDir = -0.6; // Back off slightly
    }

    if (moveDir !== 0) {
      const nextX = this.x + Math.cos(this.angle) * this.speed * moveDir * dt;
      const nextY = this.y + Math.sin(this.angle) * this.speed * moveDir * dt;

      if (!mapBlockedCheck(nextX, nextY, this.radius)) {
        this.x = nextX;
        this.y = nextY;
      }
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

import { Container, Sprite, Graphics } from 'pixi.js';
import { AssetLoader } from '../core/AssetLoader';
import { GameplayBalanceConfig } from '../config/gameConfig';
import { Projectile } from './Projectile';

export interface PlayerInputState {
  forward: boolean;
  turnLeft: boolean;
  turnRight: boolean;
  fireFront: boolean;
  fireLeft: boolean;
  fireRight: boolean;
}

export class PlayerShip {
  public x: number;
  public y: number;
  public angle: number = -Math.PI / 2; // Facing Up initially
  public speed: number = 0;
  public health: number;
  public maxHealth: number;
  public radius: number = 32;
  public isDestroyed: boolean = false;

  private frontalCooldown: number = 0;
  private broadsideCooldown: number = 0;

  private container: Container;
  private shipSprite: Sprite;
  private healthBarGfx: Graphics;
  private config: GameplayBalanceConfig;

  // Stages of ship deterioration
  private currentStage: number = 0;
  private readonly stageSprites = ['ship_2', 'ship_8', 'ship_14', 'ship_20'];

  constructor(x: number, y: number, config: GameplayBalanceConfig, parent: Container) {
    this.x = x;
    this.y = y;
    this.config = config;
    this.health = config.playerMaxHealth;
    this.maxHealth = config.playerMaxHealth;

    this.container = new Container();
    parent.addChild(this.container);

    const assets = AssetLoader.getInstance();
    this.shipSprite = new Sprite(assets.getTexture(this.stageSprites[0]!));
    this.shipSprite.anchor.set(0.5);
    this.container.addChild(this.shipSprite);

    // Floating Health Bar directly above ship
    this.healthBarGfx = new Graphics();
    this.container.addChild(this.healthBarGfx);

    this.updatePosition();
    this.updateHealthBar();
  }

  public update(
    dt: number,
    input: PlayerInputState,
    mapBlockedCheck: (x: number, y: number, r: number) => boolean,
    onSpawnProjectile: (proj: Projectile) => void,
    onPlayCannonSound: (broadside: boolean) => void
  ): void {
    if (this.isDestroyed) return;

    // Cooldown timers
    if (this.frontalCooldown > 0) this.frontalCooldown -= dt;
    if (this.broadsideCooldown > 0) this.broadsideCooldown -= dt;

    // Turning
    if (input.turnLeft) {
      this.angle -= this.config.playerTurnSpeed * dt;
    }
    if (input.turnRight) {
      this.angle += this.config.playerTurnSpeed * dt;
    }

    // Forward Acceleration & Drag
    if (input.forward) {
      this.speed = Math.min(
        this.config.playerMoveSpeed,
        this.speed + this.config.playerMoveSpeed * 1.8 * dt
      );
    } else {
      this.speed *= Math.pow(this.config.playerDrag, dt * 60);
      if (this.speed < 2) this.speed = 0;
    }

    // Position integration with collision resolution against arena bounds & islands
    const nextX = this.x + Math.cos(this.angle) * this.speed * dt;
    const nextY = this.y + Math.sin(this.angle) * this.speed * dt;

    if (!mapBlockedCheck(nextX, nextY, this.radius)) {
      this.x = nextX;
      this.y = nextY;
    } else {
      // Try sliding along X or Y
      if (!mapBlockedCheck(nextX, this.y, this.radius)) {
        this.x = nextX;
      } else if (!mapBlockedCheck(this.x, nextY, this.radius)) {
        this.y = nextY;
      } else {
        // Full stop on direct collision
        this.speed = 0;
      }
    }

    this.updatePosition();

    // Weapons Firing
    if (input.fireFront && this.frontalCooldown <= 0) {
      this.fireFrontal(onSpawnProjectile);
      onPlayCannonSound(false);
      this.frontalCooldown = this.config.playerFrontalCooldown;
    }

    if (input.fireLeft && this.broadsideCooldown <= 0) {
      this.fireBroadside(-1, onSpawnProjectile);
      onPlayCannonSound(true);
      this.broadsideCooldown = this.config.playerBroadsideCooldown;
    }

    if (input.fireRight && this.broadsideCooldown <= 0) {
      this.fireBroadside(1, onSpawnProjectile);
      onPlayCannonSound(true);
      this.broadsideCooldown = this.config.playerBroadsideCooldown;
    }
  }

  private fireFrontal(onSpawnProjectile: (proj: Projectile) => void): void {
    const bowOffset = 38;
    const spawnX = this.x + Math.cos(this.angle) * bowOffset;
    const spawnY = this.y + Math.sin(this.angle) * bowOffset;

    const proj = new Projectile(
      {
        x: spawnX,
        y: spawnY,
        angle: this.angle,
        speed: this.config.playerProjectileSpeed,
        damage: this.config.playerProjectileDamage,
        lifetime: this.config.playerProjectileLifetime,
        owner: 'player',
      },
      this.container.parent as Container
    );
    onSpawnProjectile(proj);
  }

  private fireBroadside(side: -1 | 1, onSpawnProjectile: (proj: Projectile) => void): void {
    // side: -1 is Left (Port), 1 is Right (Starboard)
    const fireAngle = this.angle + side * (Math.PI / 2);
    const sideDist = 18;
    const offsets = [-20, 0, 20]; // 3 parallel cannon positions along the hull

    for (const forwardOffset of offsets) {
      const px =
        this.x +
        Math.cos(this.angle) * forwardOffset +
        Math.cos(fireAngle) * sideDist;
      const py =
        this.y +
        Math.sin(this.angle) * forwardOffset +
        Math.sin(fireAngle) * sideDist;

      const proj = new Projectile(
        {
          x: px,
          y: py,
          angle: fireAngle,
          speed: this.config.playerProjectileSpeed,
          damage: this.config.playerProjectileDamage,
          lifetime: this.config.playerProjectileLifetime,
          owner: 'player',
        },
        this.container.parent as Container
      );
      onSpawnProjectile(proj);
    }
  }

  public takeDamage(amount: number): boolean {
    if (this.isDestroyed) return false;

    this.health = Math.max(0, this.health - amount);
    this.updateHealthBar();
    this.updateVisualStage();

    if (this.health <= 0) {
      this.isDestroyed = true;
      return true; // Fatal blow
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
      const spriteName = this.stageSprites[this.currentStage]!;
      this.shipSprite.texture = assets.getTexture(spriteName);
    }
  }

  private updatePosition(): void {
    this.container.x = this.x;
    this.container.y = this.y;
    // Sprite points UP in texture, so rotate angle + PI/2
    this.shipSprite.rotation = this.angle + Math.PI / 2;
  }

  private updateHealthBar(): void {
    this.healthBarGfx.clear();
    const w = 44;
    const h = 6;
    const yOffset = -52;

    // Dark background frame
    this.healthBarGfx.roundRect(-w / 2, yOffset, w, h, 2);
    this.healthBarGfx.fill(0x1a2530);
    this.healthBarGfx.stroke({ width: 1, color: 0xdfa837, alpha: 0.8 });

    // Inner Health Fill
    const ratio = Math.max(0, Math.min(1, this.health / this.maxHealth));
    const fillWidth = Math.max(0, (w - 2) * ratio);
    const fillColor = ratio > 0.5 ? 0x2ecc71 : ratio > 0.25 ? 0xf39c12 : 0xe74c3c;

    if (fillWidth > 0) {
      this.healthBarGfx.roundRect(-w / 2 + 1, yOffset + 1, fillWidth, h - 2, 1);
      this.healthBarGfx.fill(fillColor);
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

import { Container, Sprite, Graphics } from 'pixi.js';
import { AssetLoader } from '../core/AssetLoader';
import { GameplayBalanceConfig } from '../config/gameConfig';
import { Projectile } from './Projectile';

export type PlayerActionKey =
  | 'forward'
  | 'turnLeft'
  | 'turnRight'
  | 'fireFront'
  | 'fireLeft'
  | 'fireRight';

export interface PlayerInputState {
  forward: boolean;
  turnLeft: boolean;
  turnRight: boolean;
  fireFront: boolean;
  fireLeft: boolean;
  fireRight: boolean;
  joystickActive?: boolean;
  joystickAngle?: number;
  joystickIntensity?: number;
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
  private config: GameplayBalanceConfig;

  // Stages of ship deterioration
  private currentStage: number = 0;
  private readonly stageSprites = ['ship_2', 'ship_8', 'ship_14', 'ship_20'];

  private shadowSprite: Sprite;
  private fireContainer: Container;
  private fireSprites: Sprite[] = [];
  private fireAnimTimer: number = 0;
  private fireFrameToggle: boolean = false;

  private healthBarContainer: Container;
  private healthFrameSprite: Sprite;
  private healthFillSprite: Sprite;
  private healthFillMask: Graphics;

  constructor(x: number, y: number, config: GameplayBalanceConfig, parent: Container) {
    this.x = x;
    this.y = y;
    this.config = config;
    this.health = config.playerMaxHealth;
    this.maxHealth = config.playerMaxHealth;

    this.container = new Container();
    parent.addChild(this.container);

    const assets = AssetLoader.getInstance();

    // 1. Dynamic Ship Shadow cast on the water (matching media_1791068554369.png)
    this.shadowSprite = new Sprite(assets.getTexture(this.stageSprites[0]!));
    this.shadowSprite.anchor.set(0.5);
    this.shadowSprite.tint = 0x071e2c;
    this.shadowSprite.alpha = 0.36;
    this.container.addChild(this.shadowSprite);

    // 2. Player Ship Sprite
    this.shipSprite = new Sprite(assets.getTexture(this.stageSprites[0]!));
    this.shipSprite.anchor.set(0.5);
    this.container.addChild(this.shipSprite);

    // 3. Multi-flame billowing effect on sails & deck (matching media_1791068148655.png)
    this.fireContainer = new Container();
    this.shipSprite.addChild(this.fireContainer);

    const flameConfigs = [
      { x: -12, y: -10, baseAngle: 0.25, scale: 0.95 },
      { x: 12, y: -7, baseAngle: -0.22, scale: 0.85 },
      { x: -1, y: -18, baseAngle: 0.05, scale: 1.15 },
      { x: -5, y: 14, baseAngle: -0.1, scale: 0.9 },
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

    // 4. Authentic Floating Health Bar above ship (matching Kenney assets)
    this.healthBarContainer = new Container();
    this.healthBarContainer.position.set(0, -52);
    this.container.addChild(this.healthBarContainer);

    // Frame sits underneath with wooden border and dark groove
    this.healthFrameSprite = new Sprite(assets.getTexture('health_frame'));
    this.healthFrameSprite.anchor.set(0.5);
    this.healthFrameSprite.width = 70;
    this.healthFrameSprite.height = 13.125;
    this.healthBarContainer.addChild(this.healthFrameSprite);

    // Fill sits on top of frame and is masked according to health percentage
    this.healthFillSprite = new Sprite(assets.getTexture('health_fill_green'));
    this.healthFillSprite.anchor.set(0.5);
    this.healthFillSprite.width = 70;
    this.healthFillSprite.height = 13.125;
    this.healthBarContainer.addChild(this.healthFillSprite);

    this.healthFillMask = new Graphics();
    this.healthFillSprite.mask = this.healthFillMask;
    this.healthBarContainer.addChild(this.healthFillMask);

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

    // Turning & Movement Handling
    if (input.joystickActive && input.joystickIntensity !== undefined && input.joystickIntensity > 0.12) {
      // 1. Smoothly steer towards joystick target angle
      if (input.joystickAngle !== undefined) {
        let angleDiff = input.joystickAngle - this.angle;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

        if (Math.abs(angleDiff) > 0.04) {
          const maxTurn = this.config.playerTurnSpeed * dt;
          this.angle += Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), maxTurn);
        }
      }

      // 2. Accelerate forward proportional to joystick displacement
      const targetMaxSpeed = this.config.playerMoveSpeed * Math.min(1, Math.max(0.4, input.joystickIntensity));
      this.speed = Math.min(
        targetMaxSpeed,
        this.speed + this.config.playerMoveSpeed * 1.8 * dt
      );
    } else {
      // Standard keyboard or discrete button steering
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

      // Primary flames on sails (<= 60% HP) - Inverted direction (pointing to other side / bow)
      this.fireSprites[0]!.visible = true;
      this.fireSprites[0]!.rotation = Math.PI + 0.25 + sway * 0.12;
      this.fireSprites[0]!.scale.set(0.95 + flutter * 0.1);

      this.fireSprites[1]!.visible = true;
      this.fireSprites[1]!.rotation = Math.PI - 0.22 - sway * 0.12;
      this.fireSprites[1]!.scale.set(0.88 + flutter * 0.08);

      // Critical flames on mast & stern (<= 30% HP)
      if (healthRatio <= 0.3) {
        this.fireSprites[2]!.visible = true;
        this.fireSprites[2]!.rotation = Math.PI + 0.05 + sway * 0.15;
        this.fireSprites[2]!.scale.set(1.15 + flutter * 0.14);

        this.fireSprites[3]!.visible = true;
        this.fireSprites[3]!.rotation = Math.PI - 0.1 + sway * 0.08;
        this.fireSprites[3]!.scale.set(0.92 + flutter * 0.1);
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
    if (this.health <= 0) {
      this.isDestroyed = true;
    }
    this.updateHealthBar();
    this.updateVisualStage();

    if (this.isDestroyed) {
      return true; // Fatal blow
    }
    return false;
  }

  private updateVisualStage(): void {
    let newStage = 0;
    if (this.health <= 0 || this.isDestroyed) {
      newStage = 3; // Grey destroyed shipwreck (ship_20) ONLY when defeated!
    } else {
      const ratio = this.health / this.maxHealth;
      if (ratio > 0.6) newStage = 0; // Pristine brown wood hull (ship_2)
      else if (ratio > 0.3) newStage = 1; // Damaged brown wood hull (ship_8)
      else newStage = 2; // Heavily damaged brown wood hull (ship_14) - never grey while alive!
    }

    if (newStage !== this.currentStage) {
      this.currentStage = newStage;
      const assets = AssetLoader.getInstance();
      const spriteName = this.stageSprites[this.currentStage]!;
      const tex = assets.getTexture(spriteName);
      this.shipSprite.texture = tex;
      this.shadowSprite.texture = tex;
    }
  }

  private updatePosition(): void {
    this.container.x = this.x;
    this.container.y = this.y;
    // Sprite points UP in texture, so rotate angle + PI/2
    const rot = this.angle + Math.PI / 2;
    this.shipSprite.rotation = rot;
    this.shadowSprite.rotation = rot;
    this.shadowSprite.position.set(9, 13);
  }

  private updateHealthBar(): void {
    const ratio = Math.max(0, Math.min(1, this.health / this.maxHealth));
    const assets = AssetLoader.getInstance();

    // Color logic: 100 = green, below 100 to 50 = amber/yellow, below 50 to 0 = red
    const fillName =
      this.health >= this.maxHealth
        ? 'health_fill_green'
        : this.health >= this.maxHealth * 0.5
        ? 'health_fill_amber'
        : 'health_fill_red';
    this.healthFillSprite.texture = assets.getTexture(fillName);

    const totalW = 70;
    const totalH = 13.125;
    // Inner groove for player health bar runs from 27/256 to 229/256
    const grooveStartX = -totalW / 2 + totalW * (27 / 256);
    const grooveW = totalW * (202 / 256);
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

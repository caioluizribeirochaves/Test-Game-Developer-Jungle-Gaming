import { Container, Sprite, Graphics } from 'pixi.js';
import { AssetLoader } from '../core/AssetLoader';
import { GameplayBalanceConfig } from '../config/gameConfig';

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
  private healthBarGfx: Graphics;
  private config: GameplayBalanceConfig;

  private currentStage: number = 0;
  private readonly stageSprites = ['ship_5', 'ship_11', 'ship_17', 'ship_23'];

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
    this.sprite = new Sprite(assets.getTexture(this.stageSprites[0]!));
    this.sprite.anchor.set(0.5);
    this.sprite.scale.set(0.9); // Slightly smaller and faster than player
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
    mapBlockedCheck: (x: number, y: number, r: number) => boolean
  ): void {
    if (this.isDestroyed) return;

    // Calculate angle towards target
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const targetAngle = Math.atan2(dy, dx);

    // Smooth turn towards target angle
    let angleDiff = targetAngle - this.angle;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

    const maxTurn = this.config.chaserTurnSpeed * dt;
    this.angle += Math.max(-maxTurn, Math.min(maxTurn, angleDiff));

    // Move forward
    const nextX = this.x + Math.cos(this.angle) * this.speed * dt;
    const nextY = this.y + Math.sin(this.angle) * this.speed * dt;

    if (!mapBlockedCheck(nextX, nextY, this.radius)) {
      this.x = nextX;
      this.y = nextY;
    } else {
      // Try sliding or nudge angle
      if (!mapBlockedCheck(nextX, this.y, this.radius)) {
        this.x = nextX;
      } else if (!mapBlockedCheck(this.x, nextY, this.radius)) {
        this.y = nextY;
      } else {
        this.angle += (Math.PI / 2) * dt; // turn away from wall
      }
    }

    this.updatePosition();
  }

  public takeDamage(amount: number): boolean {
    if (this.isDestroyed) return false;

    this.health = Math.max(0, this.health - amount);
    this.updateHealthBar();
    this.updateVisualStage();

    if (this.health <= 0) {
      this.isDestroyed = true;
      return true; // Killed by player attack
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
    const w = 36;
    const h = 5;
    const yOffset = -44;

    this.healthBarGfx.roundRect(-w / 2, yOffset, w, h, 2);
    this.healthBarGfx.fill(0x1a2530);
    this.healthBarGfx.stroke({ width: 1, color: 0xdfa837, alpha: 0.8 });

    const ratio = Math.max(0, Math.min(1, this.health / this.maxHealth));
    const fillWidth = Math.max(0, (w - 2) * ratio);

    if (fillWidth > 0) {
      this.healthBarGfx.roundRect(-w / 2 + 1, yOffset + 1, fillWidth, h - 2, 1);
      this.healthBarGfx.fill(0xe74c3c); // Red bar for enemies
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

import { Container, Sprite, Graphics } from 'pixi.js';
import { AssetLoader } from '../core/AssetLoader';

export type ProjectileOwner = 'player' | 'enemy';

export interface ProjectileConfig {
  x: number;
  y: number;
  angle: number; // in radians
  speed: number;
  damage: number;
  lifetime: number;
  owner: ProjectileOwner;
}

export class Projectile {
  public x: number;
  public y: number;
  public vx: number;
  public vy: number;
  public damage: number;
  public owner: ProjectileOwner;
  public radius: number = 6;
  public isDestroyed: boolean = false;

  private life: number;
  private sprite: Sprite;
  private trailGfx: Graphics;
  private container: Container;
  private trailPoints: { x: number; y: number }[] = [];
  private maxTrailPoints: number = 8;

  constructor(config: ProjectileConfig, parent: Container) {
    this.x = config.x;
    this.y = config.y;
    this.vx = Math.cos(config.angle) * config.speed;
    this.vy = Math.sin(config.angle) * config.speed;
    this.damage = config.damage;
    this.owner = config.owner;
    this.life = config.lifetime;

    this.container = new Container();
    parent.addChild(this.container);

    // Trail graphics rendered below the ball
    this.trailGfx = new Graphics();
    this.container.addChild(this.trailGfx);

    // Cannonball sprite
    const assets = AssetLoader.getInstance();
    this.sprite = new Sprite(assets.getTexture('cannon_ball'));
    this.sprite.anchor.set(0.5);
    this.sprite.scale.set(1.1);
    this.sprite.x = this.x;
    this.sprite.y = this.y;
    this.container.addChild(this.sprite);
  }

  public update(dt: number): void {
    if (this.isDestroyed) return;

    this.life -= dt;
    if (this.life <= 0) {
      this.destroy();
      return;
    }

    // Save previous point for trail
    this.trailPoints.unshift({ x: this.x, y: this.y });
    if (this.trailPoints.length > this.maxTrailPoints) {
      this.trailPoints.pop();
    }

    // Update position
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    this.sprite.x = this.x;
    this.sprite.y = this.y;

    // Draw fading white trail
    this.trailGfx.clear();
    if (this.trailPoints.length > 1) {
      for (let i = 0; i < this.trailPoints.length - 1; i++) {
        const pt1 = this.trailPoints[i]!;
        const pt2 = this.trailPoints[i + 1]!;
        const alpha = (1 - i / this.trailPoints.length) * 0.45;
        this.trailGfx.moveTo(pt1.x, pt1.y);
        this.trailGfx.lineTo(pt2.x, pt2.y);
        this.trailGfx.stroke({ width: 3 - (i / this.trailPoints.length) * 2, color: 0xffffff, alpha });
      }
    }
  }

  public destroy(): void {
    if (this.isDestroyed) return;
    this.isDestroyed = true;
    if (this.container.parent) {
      this.container.parent.removeChild(this.container);
    }
    this.container.destroy({ children: true });
  }
}

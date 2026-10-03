import { Container, Sprite, Graphics } from 'pixi.js';
import { AssetLoader } from '../core/AssetLoader';

export interface Particle {
  sprite: Sprite | Graphics;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  rotationSpeed: number;
  scaleDelta: number;
}

export class ParticleManager {
  private container: Container;
  private particles: Particle[] = [];

  constructor(parent: Container) {
    this.container = new Container();
    parent.addChild(this.container);
  }

  public update(dt: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]!;
      p.life -= dt;

      if (p.life <= 0) {
        this.container.removeChild(p.sprite);
        p.sprite.destroy();
        this.particles.splice(i, 1);
        continue;
      }

      p.sprite.x += p.vx * dt;
      p.sprite.y += p.vy * dt;
      p.sprite.rotation += p.rotationSpeed * dt;

      const progress = p.life / p.maxLife;
      p.sprite.alpha = Math.max(0, progress);

      if (p.scaleDelta !== 0) {
        const currentScale = p.sprite.scale.x + p.scaleDelta * dt;
        if (currentScale > 0) {
          p.sprite.scale.set(currentScale);
        }
      }
    }
  }

  public spawnMuzzleFlash(x: number, y: number, angle: number): void {
    const gfx = new Graphics();
    gfx.circle(0, 0, 8);
    gfx.fill({ color: 0xffe600, alpha: 0.9 });
    gfx.x = x;
    gfx.y = y;

    this.container.addChild(gfx);
    this.particles.push({
      sprite: gfx,
      vx: Math.cos(angle) * 30,
      vy: Math.sin(angle) * 30,
      life: 0.12,
      maxLife: 0.12,
      rotationSpeed: 0,
      scaleDelta: 2,
    });
  }

  public spawnWaterSplash(x: number, y: number): void {
    for (let i = 0; i < 6; i++) {
      const gfx = new Graphics();
      gfx.circle(0, 0, 3 + Math.random() * 3);
      gfx.fill({ color: 0xffffff, alpha: 0.8 });
      gfx.x = x;
      gfx.y = y;

      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 60;

      this.container.addChild(gfx);
      this.particles.push({
        sprite: gfx,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.35 + Math.random() * 0.2,
        maxLife: 0.5,
        rotationSpeed: 0,
        scaleDelta: -0.5,
      });
    }
  }

  public spawnWoodSplinters(x: number, y: number): void {
    const assets = AssetLoader.getInstance();
    for (let i = 0; i < 5; i++) {
      const woodTex = assets.getTexture('wood_1');
      const sprite = new Sprite(woodTex);
      sprite.anchor.set(0.5);
      sprite.x = x;
      sprite.y = y;
      sprite.scale.set(0.8 + Math.random() * 0.4);

      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 90;

      this.container.addChild(sprite);
      this.particles.push({
        sprite,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.6 + Math.random() * 0.3,
        maxLife: 0.8,
        rotationSpeed: (Math.random() - 0.5) * 8,
        scaleDelta: 0,
      });
    }
  }

  public spawnShipExplosion(x: number, y: number): void {
    const assets = AssetLoader.getInstance();

    // Core explosion sprite
    const expSprite = new Sprite(assets.getTexture('explosion_1'));
    expSprite.anchor.set(0.5);
    expSprite.x = x;
    expSprite.y = y;
    expSprite.scale.set(1.4);

    this.container.addChild(expSprite);
    this.particles.push({
      sprite: expSprite,
      vx: 0,
      vy: 0,
      life: 0.5,
      maxLife: 0.5,
      rotationSpeed: (Math.random() - 0.5) * 2,
      scaleDelta: 1.5,
    });

    // Fire particles and flying wood
    for (let i = 0; i < 8; i++) {
      const fireSprite = new Sprite(assets.getTexture('fire_1'));
      fireSprite.anchor.set(0.5);
      fireSprite.x = x + (Math.random() - 0.5) * 40;
      fireSprite.y = y + (Math.random() - 0.5) * 40;
      fireSprite.scale.set(0.8);

      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 100;

      this.container.addChild(fireSprite);
      this.particles.push({
        sprite: fireSprite,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.7 + Math.random() * 0.4,
        maxLife: 1.0,
        rotationSpeed: (Math.random() - 0.5) * 4,
        scaleDelta: -0.6,
      });
    }

    // Wood splinters
    this.spawnWoodSplinters(x, y);
  }

  public clear(): void {
    for (const p of this.particles) {
      this.container.removeChild(p.sprite);
      p.sprite.destroy();
    }
    this.particles = [];
  }
}

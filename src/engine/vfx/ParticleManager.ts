import { Container, Sprite, Graphics, Texture } from 'pixi.js';
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

export interface AnimatedExplosion {
  sprite: Sprite;
  textures: Texture[];
  elapsed: number;
  duration: number;
}

export interface EjectedCrew {
  sprite: Sprite;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotationSpeed: number;
  elapsed: number;
  airDuration: number;
  totalLifetime: number;
  initialScale: number;
  targetScale: number;
  baseY: number;
}

export interface WaterRippleRing {
  gfx: Graphics;
  x: number;
  y: number;
  startRadius: number;
  maxRadius: number;
  elapsed: number;
  duration: number;
}

export class ParticleManager {
  private container: Container;
  private particles: Particle[] = [];
  private explosions: AnimatedExplosion[] = [];
  private crewMembers: EjectedCrew[] = [];
  private waterRipples: WaterRippleRing[] = [];

  constructor(parent: Container) {
    this.container = new Container();
    parent.addChild(this.container);
  }

  public update(dt: number): void {
    // 1. Update standard particles
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

    // 2. Update multi-frame animated explosions (explosion_1 -> explosion_2 -> explosion_3)
    for (let i = this.explosions.length - 1; i >= 0; i--) {
      const exp = this.explosions[i]!;
      exp.elapsed += dt;

      if (exp.elapsed >= exp.duration) {
        this.container.removeChild(exp.sprite);
        exp.sprite.destroy();
        this.explosions.splice(i, 1);
        continue;
      }

      const progress = exp.elapsed / exp.duration; // 0 to 1
      if (progress < 0.33) {
        exp.sprite.texture = exp.textures[0]!;
        exp.sprite.scale.set(1.1 + progress * 0.9);
      } else if (progress < 0.66) {
        exp.sprite.texture = exp.textures[1]!;
        exp.sprite.scale.set(1.4 + (progress - 0.33) * 0.8);
      } else {
        exp.sprite.texture = exp.textures[2]!;
        exp.sprite.scale.set(1.6 + (progress - 0.66) * 0.5);
        exp.sprite.alpha = Math.max(0, (1 - progress) / 0.34);
      }
    }

    // 3. Update ejected crew members flying out into water and floating
    for (let i = this.crewMembers.length - 1; i >= 0; i--) {
      const crew = this.crewMembers[i]!;
      crew.elapsed += dt;

      if (crew.elapsed >= crew.totalLifetime) {
        this.container.removeChild(crew.sprite);
        crew.sprite.destroy();
        this.crewMembers.splice(i, 1);
        continue;
      }

      if (crew.elapsed < crew.airDuration) {
        // In the air: flying outward with arc
        crew.x += crew.vx * dt;
        crew.y += crew.vy * dt;
        crew.sprite.rotation += crew.rotationSpeed * dt;

        const airProgress = crew.elapsed / crew.airDuration;
        const arc = Math.sin(airProgress * Math.PI) * 0.35;
        const currentScale =
          crew.initialScale + (crew.targetScale - crew.initialScale) * airProgress + arc;
        crew.sprite.scale.set(currentScale);
        crew.baseY = crew.y;
      } else {
        // In the water: decelerate and bob gently
        crew.vx *= Math.pow(0.12, dt);
        crew.vy *= Math.pow(0.12, dt);
        crew.x += crew.vx * dt;
        crew.y += crew.vy * dt;

        crew.rotationSpeed *= Math.pow(0.25, dt);
        crew.sprite.rotation += crew.rotationSpeed * dt;
        crew.sprite.scale.set(crew.targetScale);

        // Water floating bob
        const bob = Math.sin((crew.elapsed - crew.airDuration) * 4.0) * 1.5;
        crew.sprite.y = crew.baseY + bob;
      }

      crew.sprite.x = crew.x;

      // Snappy and smooth fadeout during final 0.8 seconds
      const timeLeft = crew.totalLifetime - crew.elapsed;
      if (timeLeft < 0.8) {
        crew.sprite.alpha = Math.max(0, timeLeft / 0.8);
      }
    }

    // 4. Update water ripple rings (organic surfacing effect matching Image 4)
    for (let i = this.waterRipples.length - 1; i >= 0; i--) {
      const r = this.waterRipples[i]!;
      r.elapsed += dt;

      if (r.elapsed < 0) {
        r.gfx.visible = false;
        continue;
      }
      r.gfx.visible = true;

      const progress = r.elapsed / r.duration;
      if (progress >= 1) {
        this.container.removeChild(r.gfx);
        r.gfx.destroy();
        this.waterRipples.splice(i, 1);
        continue;
      }

      const curRadius = r.startRadius + (r.maxRadius - r.startRadius) * Math.sqrt(progress);
      const alpha = Math.sin((1 - progress) * Math.PI * 0.5) * 0.85;

      r.gfx.clear();
      // Outer bright white foam ring (matching media_1791079197664.png)
      r.gfx.circle(r.x, r.y, curRadius);
      r.gfx.stroke({ width: 3.5 * (1 - progress * 0.4), color: 0xffffff, alpha });
      // Inner soft turquoise glow ring
      r.gfx.circle(r.x, r.y, Math.max(1, curRadius - 3.5));
      r.gfx.stroke({ width: 2.0, color: 0xa5f3fc, alpha: alpha * 0.6 });
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

  public spawnShipWake(x: number, y: number, angle: number, speed: number): void {
    if (speed < 12) return;

    // Stern position (rear of ship)
    const sternDist = 18;
    const sternX = x - Math.cos(angle) * sternDist;
    const sternY = y - Math.sin(angle) * sternDist;

    // Soft, slender, subtle twin wake streams (matching media_1791068554369.png)
    const lateralOffsets = [-7, 7];
    const streakLength = Math.min(26, 10 + speed * 0.08);
    const wakeWidth = 2.4;

    for (const lat of lateralOffsets) {
      const perpX = -Math.sin(angle) * lat;
      const perpY = Math.cos(angle) * lat;

      const spawnX = sternX + perpX - Math.cos(angle) * (streakLength * 0.35);
      const spawnY = sternY + perpY - Math.sin(angle) * (streakLength * 0.35);

      const gfx = new Graphics();
      gfx.roundRect(-streakLength / 2, -wakeWidth / 2, streakLength, wakeWidth, wakeWidth / 2);
      gfx.fill({ color: 0xffffff, alpha: 0.20 });
      gfx.rotation = angle;
      gfx.x = spawnX;
      gfx.y = spawnY;

      this.container.addChild(gfx);

      // Gentle drift backward along reverse heading
      const driftAngle = angle + Math.PI + (lat > 0 ? 0.06 : -0.06);
      const driftSpeed = speed * 0.12;

      this.particles.push({
        sprite: gfx,
        vx: Math.cos(driftAngle) * driftSpeed,
        vy: Math.sin(driftAngle) * driftSpeed,
        life: 0.48,
        maxLife: 0.48,
        rotationSpeed: 0,
        scaleDelta: 0.15,
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

    // Multi-frame animated core explosion (explosion_1 -> explosion_2 -> explosion_3)
    const expSprite = new Sprite(assets.getTexture('explosion_1'));
    expSprite.anchor.set(0.5);
    expSprite.x = x;
    expSprite.y = y;
    expSprite.scale.set(1.2);
    this.container.addChild(expSprite);

    this.explosions.push({
      sprite: expSprite,
      textures: [
        assets.getTexture('explosion_1'),
        assets.getTexture('explosion_2'),
        assets.getTexture('explosion_3'),
      ],
      elapsed: 0,
      duration: 0.45,
    });

    // Fire particles and flying burning embers
    for (let i = 0; i < 8; i++) {
      const fireTex = assets.getTexture(i % 2 === 0 ? 'fire_1' : 'fire_2');
      const fireSprite = new Sprite(fireTex);
      fireSprite.anchor.set(0.5);
      fireSprite.x = x + (Math.random() - 0.5) * 36;
      fireSprite.y = y + (Math.random() - 0.5) * 36;
      fireSprite.scale.set(0.75 + Math.random() * 0.4);

      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 90;

      this.container.addChild(fireSprite);
      this.particles.push({
        sprite: fireSprite,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.5 + Math.random() * 0.35,
        maxLife: 0.85,
        rotationSpeed: (Math.random() - 0.5) * 4,
        scaleDelta: -0.6,
      });
    }

    // Wood splinters
    this.spawnWoodSplinters(x, y);

    // Ejected crew flying out into water (matching media_1791075097563.png)
    this.spawnCrewEjection(x, y, 2 + Math.floor(Math.random() * 2));
  }

  public spawnCrewEjection(x: number, y: number, count: number = 3): void {
    const assets = AssetLoader.getInstance();
    const crewTextures = ['crew_1', 'crew_2', 'crew_3', 'crew_4', 'crew_5', 'crew_6'];

    for (let i = 0; i < count; i++) {
      const texName = crewTextures[Math.floor(Math.random() * crewTextures.length)]!;
      let tex = assets.getTexture(texName);
      if (!tex) tex = assets.getTexture('crew_1');
      if (!tex) continue;

      const crewSprite = new Sprite(tex);
      crewSprite.anchor.set(0.5);
      crewSprite.x = x + (Math.random() - 0.5) * 20;
      crewSprite.y = y + (Math.random() - 0.5) * 20;
      crewSprite.scale.set(1.4);
      this.container.addChild(crewSprite);

      const angle = Math.random() * Math.PI * 2;
      const speed = 120 + Math.random() * 110;

      this.crewMembers.push({
        sprite: crewSprite,
        x: crewSprite.x,
        y: crewSprite.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rotationSpeed: (Math.random() - 0.5) * 9,
        elapsed: 0,
        airDuration: 0.45 + Math.random() * 0.15,
        totalLifetime: 1.8 + Math.random() * 0.3,
        initialScale: 1.4,
        targetScale: 0.95,
        baseY: crewSprite.y,
      });
    }
  }

  /**
   * Spawns concentric organic water ripples as ships surface (matching Image 4).
   */
  public spawnSurfacingRipples(x: number, y: number, count: number = 3): void {
    for (let i = 0; i < count; i++) {
      const gfx = new Graphics();
      this.container.addChild(gfx);
      this.waterRipples.push({
        gfx,
        x,
        y,
        startRadius: 16 + i * 8,
        maxRadius: 54 + i * 18,
        elapsed: -i * 0.22, // Staggered concentric ripple pulses
        duration: 1.15,
      });
    }
  }

  public clear(): void {
    for (const p of this.particles) {
      this.container.removeChild(p.sprite);
      p.sprite.destroy();
    }
    this.particles = [];

    for (const exp of this.explosions) {
      this.container.removeChild(exp.sprite);
      exp.sprite.destroy();
    }
    this.explosions = [];

    for (const crew of this.crewMembers) {
      this.container.removeChild(crew.sprite);
      crew.sprite.destroy();
    }
    this.crewMembers = [];

    for (const r of this.waterRipples) {
      this.container.removeChild(r.gfx);
      r.gfx.destroy();
    }
    this.waterRipples = [];
  }
}

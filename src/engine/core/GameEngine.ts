import { Application, Container, TilingSprite } from 'pixi.js';
import { MatchConfig, GameplayBalanceConfig, DEFAULT_BALANCE_CONFIG } from '../config/gameConfig';
import { AssetLoader } from './AssetLoader';
import { MapGenerator } from './MapGenerator';
import { ParticleManager } from '../vfx/ParticleManager';
import { DamageTextManager } from '../vfx/DamageTextManager';
import { AudioManager } from '../audio/AudioManager';
import { InputManager } from './InputManager';
import { PlayerShip, PlayerInputState, PlayerActionKey } from '../entities/PlayerShip';
import { ChaserEnemy } from '../entities/ChaserEnemy';
import { ShooterEnemy } from '../entities/ShooterEnemy';
import { Projectile } from '../entities/Projectile';
import { EndReason } from '@/api/types';

export interface GameEngineEvents {
  onHealthChange: (current: number, max: number) => void;
  onScoreChange: (score: number) => void;
  onTimeChange: (remainingSeconds: number) => void;
  onGameOver: (reason: EndReason, score: number, duration: number) => void;
  onPauseChange: (isPaused: boolean) => void;
}

export class GameEngine {
  private app: Application | null = null;
  private waterBackground: TilingSprite | null = null;
  private waterScrollX: number = 0;
  private waterScrollY: number = 0;
  private playerWakeTimer: number = 0;
  private enemyWakeTimer: number = 0;

  private rootContainer: Container | null = null;
  private gameWorld: Container | null = null;
  private terrainLayer: Container | null = null;
  private wakeLayer: Container | null = null;
  private shipsLayer: Container | null = null;
  private projectilesLayer: Container | null = null;
  private effectsLayer: Container | null = null;
  private damageTextLayer: Container | null = null;

  private map: MapGenerator;
  private wakeParticleMgr: ParticleManager | null = null;
  private particleMgr: ParticleManager | null = null;
  private damageTextMgr: DamageTextManager | null = null;
  public readonly input: InputManager;
  private audio: AudioManager;

  private player: PlayerShip | null = null;
  private enemies: (ChaserEnemy | ShooterEnemy)[] = [];
  private projectiles: Projectile[] = [];

  private config: MatchConfig;
  private balance: GameplayBalanceConfig = DEFAULT_BALANCE_CONFIG;
  private events: GameEngineEvents;

  private timeRemaining: number = 0;
  private elapsedTime: number = 0;
  private score: number = 0;
  private spawnTimer: number = 0;

  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private isEnded: boolean = false;
  private lastShipCollisionTime: number = 0;

  // Frame timing & profiling stats
  private lastTime: number = 0;
  public currentFps: number = 60;
  public frameTimes: number[] = [];

  private onVisibilityChangeBound: () => void;
  private onWindowBlurBound: () => void;
  private onResizeBound: () => void;

  constructor(config: MatchConfig, events: GameEngineEvents) {
    this.config = { ...config };
    this.events = events;
    this.map = new MapGenerator();
    this.input = new InputManager();
    this.audio = AudioManager.getInstance();

    this.onVisibilityChangeBound = this.handleVisibilityChange.bind(this);
    this.onWindowBlurBound = this.handleWindowBlur.bind(this);
    this.onResizeBound = this.handleResize.bind(this);
  }

  public async initialize(canvasContainer: HTMLElement): Promise<void> {
    // 1. Create PixiJS Application
    this.app = new Application();
    await this.app.init({
      resizeTo: canvasContainer,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      backgroundColor: 0x3897b7,
      antialias: true,
    });

    canvasContainer.appendChild(this.app.canvas);

    // 2. Setup Full-Screen Animated Water Background (tile_73)
    const assets = AssetLoader.getInstance();
    const waterTex = assets.getTexture('water_tile_73');
    this.waterBackground = new TilingSprite({
      texture: waterTex,
      width: this.app.screen.width,
      height: this.app.screen.height,
    });
    this.app.stage.addChild(this.waterBackground);

    // 3. Setup Layer Containers
    this.rootContainer = new Container();
    this.app.stage.addChild(this.rootContainer);

    this.gameWorld = new Container();
    this.gameWorld.sortableChildren = true;
    this.rootContainer.addChild(this.gameWorld);

    this.terrainLayer = new Container();
    this.terrainLayer.zIndex = 10;
    this.wakeLayer = new Container();
    this.wakeLayer.zIndex = 20;
    this.shipsLayer = new Container();
    this.shipsLayer.zIndex = 30;
    this.projectilesLayer = new Container();
    this.projectilesLayer.zIndex = 40;
    this.effectsLayer = new Container();
    this.effectsLayer.zIndex = 50;
    this.damageTextLayer = new Container();
    this.damageTextLayer.zIndex = 9999;

    this.gameWorld.addChild(this.terrainLayer);
    this.gameWorld.addChild(this.wakeLayer);
    this.gameWorld.addChild(this.shipsLayer);
    this.gameWorld.addChild(this.projectilesLayer);
    this.gameWorld.addChild(this.effectsLayer);
    this.gameWorld.addChild(this.damageTextLayer);

    // 3. Render Map
    this.map.renderMap(this.terrainLayer);

    // 4. Initialize VFX, Damage Numbers, and Input
    this.wakeParticleMgr = new ParticleManager(this.wakeLayer);
    this.particleMgr = new ParticleManager(this.effectsLayer);
    this.damageTextMgr = new DamageTextManager(this.damageTextLayer);
    this.input.attach();

    // 5. Attach browser listeners for auto-pause and resizing
    document.addEventListener('visibilitychange', this.onVisibilityChangeBound);
    window.addEventListener('blur', this.onWindowBlurBound);
    window.addEventListener('resize', this.onResizeBound);

    this.handleResize();

    // 6. Spawn initial player
    this.startMatch();

    // 7. Start Ticker loop
    this.lastTime = performance.now();
    this.app.ticker.add(this.update, this);
  }

  private startMatch(): void {
    if (!this.gameWorld || !this.particleMgr || !this.shipsLayer) return;

    this.timeRemaining = this.config.sessionDuration;
    this.elapsedTime = 0;
    this.score = 0;
    this.spawnTimer = 0;
    this.isRunning = true;
    this.isPaused = false;
    this.isEnded = false;
    this.input.isActive = true;

    this.events.onScoreChange(this.score);
    this.events.onTimeChange(this.timeRemaining);

    // Spawn player in center water in the ships layer
    this.player = new PlayerShip(960, 540, this.balance, this.shipsLayer);
    this.events.onHealthChange(this.player.health, this.player.maxHealth);

    // Initial audio cues
    this.audio.playSfx('game_start');
    this.audio.startAmbience();
  }

  private handleResize(): void {
    if (!this.app || !this.rootContainer) return;
    const screenW = this.app.screen.width;
    const screenH = this.app.screen.height;

    // Maintain 1920x1080 aspect ratio within container
    const scale = Math.min(screenW / this.map.width, screenH / this.map.height);
    this.rootContainer.scale.set(scale);

    // Center arena in viewport
    this.rootContainer.x = (screenW - this.map.width * scale) / 2;
    this.rootContainer.y = (screenH - this.map.height * scale) / 2;

    if (this.waterBackground) {
      this.waterBackground.width = screenW;
      this.waterBackground.height = screenH;
      this.waterBackground.tileScale.set(scale);
    }
  }

  private handleVisibilityChange(): void {
    if (document.hidden && this.isRunning && !this.isPaused && !this.isEnded) {
      this.pauseGame();
    }
  }

  private handleWindowBlur(): void {
    if (this.isRunning && !this.isPaused && !this.isEnded) {
      this.pauseGame();
    }
  }

  public pauseGame(): void {
    if (!this.isRunning || this.isPaused || this.isEnded) return;
    this.isPaused = true;
    this.input.isActive = false;
    this.input.reset();
    this.audio.playSfx('game_pause');
    this.events.onPauseChange(true);
  }

  public resumeGame(): void {
    if (!this.isRunning || !this.isPaused || this.isEnded) return;
    this.isPaused = false;
    this.input.isActive = true;
    this.lastTime = performance.now();
    this.audio.playSfx('game_resume');
    this.events.onPauseChange(false);
  }

  public togglePause(): void {
    if (this.isPaused) {
      this.resumeGame();
    } else {
      this.pauseGame();
    }
  }

  public setVirtualInput(action: PlayerActionKey, value: boolean): void {
    this.input.setVirtual(action, value);
  }

  public setJoystickInput(x: number, y: number, active: boolean): void {
    this.input.setJoystick(x, y, active);
  }

  private update(): void {
    const now = performance.now();
    const rawDt = (now - this.lastTime) / 1000;
    this.lastTime = now;

    // Track frame timing for profiling and 60 FPS metrics
    const frameMs = rawDt * 1000;
    this.frameTimes.push(frameMs);
    if (this.frameTimes.length > 300) this.frameTimes.shift();
    if (rawDt > 0) this.currentFps = Math.round(1 / rawDt);

    if (!this.isRunning || this.isPaused || this.isEnded || !this.player) {
      return;
    }

    // Clamp dt to prevent spiral of death on large pauses
    const dt = Math.min(rawDt, 0.1);

    // 1. Session Timer
    this.elapsedTime += dt;
    this.timeRemaining = Math.max(0, this.timeRemaining - dt);
    this.events.onTimeChange(Math.ceil(this.timeRemaining));

    if (this.timeRemaining <= 0) {
      this.endGame('TIME_UP');
      return;
    }

    // Low time warning cue at 10 seconds
    if (Math.ceil(this.timeRemaining) === 10 && Math.ceil(this.timeRemaining - dt) < 10) {
      this.audio.playSfx('time_warning');
    }

    // 2. Enemy Spawning Logic
    this.spawnTimer += dt;
    if (this.spawnTimer >= this.config.enemySpawnInterval) {
      this.spawnTimer = 0;
      if (this.enemies.length < this.balance.maxActiveEnemies) {
        this.spawnEnemy();
      }
    }

    // Update living ocean caustics & wake VFX
    this.waterScrollX += dt * 14;
    this.waterScrollY += dt * 8;
    if (this.waterBackground && this.rootContainer) {
      const scale = this.rootContainer.scale.x;
      this.waterBackground.tilePosition.x = this.rootContainer.x + this.waterScrollX * scale;
      this.waterBackground.tilePosition.y = this.rootContainer.y + this.waterScrollY * scale;
    }
    this.map.updateWater(dt, this.elapsedTime);
    this.wakeParticleMgr?.update(dt);

    // 3. Update Player with island and enemy solid collision
    const playerInputs = this.input.getInputState();
    const isPlayerBlocked = (x: number, y: number, r: number) => {
      if (this.map.isPointBlocked(x, y, r)) return true;
      for (const enemy of this.enemies) {
        if (!enemy.isDestroyed && enemy instanceof ShooterEnemy) {
          const d = Math.hypot(x - enemy.x, y - enemy.y);
          if (d < r + enemy.radius) {
            return true;
          }
        }
      }
      return false;
    };

    this.player.update(
      dt,
      playerInputs,
      isPlayerBlocked,
      (proj) => {
        if (this.projectilesLayer && proj.container.parent !== this.projectilesLayer) {
          this.projectilesLayer.addChild(proj.container);
        }
        this.projectiles.push(proj);
      },
      (broadside) => {
        if (broadside) this.audio.playSfx('cannon_broadside');
        else this.audio.playCannonFire();
      }
    );

    // Audio and gentle wake for player sailing motion
    this.audio.setSailingVolume(this.player.speed > 10 ? 0.35 : 0);
    this.playerWakeTimer += dt;
    if (this.player.speed > 12 && this.playerWakeTimer >= 0.08) {
      this.playerWakeTimer = 0;
      this.wakeParticleMgr?.spawnShipWake(
        this.player.x,
        this.player.y,
        this.player.angle,
        this.player.speed
      );
    }

    // 4. Update Enemies with Obstacle Avoidance, Player Collision & Wake
    const enemyPositions = this.enemies.map((e) => ({ x: e.x, y: e.y, radius: e.radius }));
    const shooterEntitiesWithPlayer = [
      { x: this.player.x, y: this.player.y, radius: this.player.radius },
      ...enemyPositions,
    ];

    this.enemyWakeTimer += dt;
    const shouldSpawnEnemyWake = this.enemyWakeTimer >= 0.08;
    if (shouldSpawnEnemyWake) {
      this.enemyWakeTimer = 0;
    }

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i]!;

      // Spawn soft wake behind moving enemy ships
      if (enemy.speed > 12 && shouldSpawnEnemyWake) {
        this.wakeParticleMgr?.spawnShipWake(
          enemy.x,
          enemy.y,
          enemy.angle,
          enemy.speed
        );
      }

      if (enemy instanceof ChaserEnemy) {
        enemy.update(
          dt,
          this.player.x,
          this.player.y,
          (x, y, r) => this.map.isPointBlocked(x, y, r),
          this.map.obstacles,
          this.map.width,
          this.map.height,
          enemyPositions
        );

        // Chaser vs Player Collision (Kamikaze)
        const dist = Math.hypot(enemy.x - this.player.x, enemy.y - this.player.y);
        if (dist < enemy.radius + this.player.radius) {
          // Kamikaze Impact: does damage to player, destroys chaser, ZERO points awarded
          this.particleMgr?.spawnShipExplosion(enemy.x, enemy.y);
          this.audio.playExplosion();
          this.audio.playSfx('ship_collision');

          this.damageTextMgr?.spawnDamage(this.player.x, this.player.y, this.balance.chaserCollisionDamage, true);
          const fatal = this.player.takeDamage(this.balance.chaserCollisionDamage);
          this.events.onHealthChange(this.player.health, this.player.maxHealth);

          enemy.destroy();
          this.enemies.splice(i, 1);

          if (fatal) {
            this.endGame('DEFEATED');
            return;
          }
          continue;
        }
      } else if (enemy instanceof ShooterEnemy) {
        const isShooterBlocked = (x: number, y: number, r: number) => {
          if (this.map.isPointBlocked(x, y, r)) return true;
          if (this.player && !this.player.isDestroyed) {
            const d = Math.hypot(x - this.player.x, y - this.player.y);
            if (d < r + this.player.radius) {
              return true;
            }
          }
          return false;
        };

        enemy.update(
          dt,
          this.player.x,
          this.player.y,
          isShooterBlocked,
          (proj) => {
            if (this.projectilesLayer && proj.container.parent !== this.projectilesLayer) {
              this.projectilesLayer.addChild(proj.container);
            }
            this.projectiles.push(proj);
          },
          () => this.audio.playCannonFire(),
          this.map.obstacles,
          this.map.width,
          this.map.height,
          shooterEntitiesWithPlayer
        );

        // Solid hull collision resolution between Player and Shooter (Blue Ship)
        const dx = this.player.x - enemy.x;
        const dy = this.player.y - enemy.y;
        const dist = Math.hypot(dx, dy);
        const minDist = this.player.radius + enemy.radius;

        if (dist < minDist && dist > 0.001) {
          const overlap = minDist - dist;
          const nx = dx / dist;
          const ny = dy / dist;

          const pPushX = this.player.x + nx * overlap * 0.55;
          const pPushY = this.player.y + ny * overlap * 0.55;
          const ePushX = enemy.x - nx * overlap * 0.55;
          const ePushY = enemy.y - ny * overlap * 0.55;

          const pBlocked = this.map.isPointBlocked(pPushX, pPushY, this.player.radius);
          const eBlocked = this.map.isPointBlocked(ePushX, ePushY, enemy.radius);

          if (!pBlocked && !eBlocked) {
            this.player.x = pPushX;
            this.player.y = pPushY;
            enemy.x = ePushX;
            enemy.y = ePushY;
          } else if (!pBlocked && eBlocked) {
            const fullPx = this.player.x + nx * overlap;
            const fullPy = this.player.y + ny * overlap;
            if (!this.map.isPointBlocked(fullPx, fullPy, this.player.radius)) {
              this.player.x = fullPx;
              this.player.y = fullPy;
            }
          } else if (pBlocked && !eBlocked) {
            const fullEx = enemy.x - nx * overlap;
            const fullEy = enemy.y - ny * overlap;
            if (!this.map.isPointBlocked(fullEx, fullEy, enemy.radius)) {
              enemy.x = fullEx;
              enemy.y = fullEy;
            }
          }

          // Impede forward velocities upon collision
          this.player.speed = Math.max(0, this.player.speed * 0.5);
          enemy.speed = Math.max(0, enemy.speed * 0.5);

          // Audio and wood splinter VFX on collision
          const now = performance.now();
          if (now - this.lastShipCollisionTime > 300) {
            this.lastShipCollisionTime = now;
            this.audio.playSfx('ship_collision');
            const midX = (this.player.x + enemy.x) / 2;
            const midY = (this.player.y + enemy.y) / 2;
            this.particleMgr?.spawnWoodSplinters(midX, midY);
          }
        }
      }
    }

    // 5. Update Projectiles & Collisions
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i]!;
      proj.update(dt);

      if (proj.isDestroyed) {
        this.projectiles.splice(i, 1);
        continue;
      }

      // Check collision with map boundary or islands
      if (this.map.isPointBlocked(proj.x, proj.y, proj.radius)) {
        this.particleMgr?.spawnWaterSplash(proj.x, proj.y);
        this.audio.playHitWater();
        proj.destroy();
        this.projectiles.splice(i, 1);
        continue;
      }

      // Player projectiles hitting enemies
      if (proj.owner === 'player') {
        let hit = false;
        for (let eIdx = this.enemies.length - 1; eIdx >= 0; eIdx--) {
          const enemy = this.enemies[eIdx]!;
          const dist = Math.hypot(proj.x - enemy.x, proj.y - enemy.y);

          if (dist < proj.radius + enemy.radius) {
            hit = true;
            this.particleMgr?.spawnWoodSplinters(proj.x, proj.y);
            this.audio.playHitWood();

            this.damageTextMgr?.spawnDamage(enemy.x, enemy.y, proj.damage, false);
            const killed = enemy.takeDamage(proj.damage);
            if (killed) {
              // Killed by player attacks: award 1 point
              this.score += 1;
              this.events.onScoreChange(this.score);
              this.audio.playSfx('score_point');
              this.audio.playExplosion();
              this.particleMgr?.spawnShipExplosion(enemy.x, enemy.y);

              enemy.destroy();
              this.enemies.splice(eIdx, 1);
            }
            break;
          }
        }

        if (hit) {
          proj.destroy();
          this.projectiles.splice(i, 1);
          continue;
        }
      }

      // Enemy projectiles hitting player
      if (proj.owner === 'enemy') {
        const dist = Math.hypot(proj.x - this.player.x, proj.y - this.player.y);
        if (dist < proj.radius + this.player.radius) {
          this.particleMgr?.spawnWoodSplinters(proj.x, proj.y);
          this.audio.playHitWood();

          this.damageTextMgr?.spawnDamage(this.player.x, this.player.y, proj.damage, true);
          const fatal = this.player.takeDamage(proj.damage);
          this.events.onHealthChange(this.player.health, this.player.maxHealth);

          proj.destroy();
          this.projectiles.splice(i, 1);

          if (fatal) {
            this.endGame('DEFEATED');
            return;
          }
          continue;
        }
      }
    }

    // 6. Update VFX and Damage Numbers
    this.particleMgr?.update(dt);
    this.damageTextMgr?.update(dt);
  }

  private spawnEnemy(): void {
    if (!this.gameWorld || !this.player || !this.shipsLayer) return;

    const spawnPoint = this.map.findSafeSpawnPoint(
      this.player.x,
      this.player.y,
      this.balance.spawnSafetyRadius
    );

    this.particleMgr?.spawnSurfacingRipples(spawnPoint.x, spawnPoint.y, 3);

    const isChaser = Math.random() < this.balance.chaserRatio;
    if (isChaser) {
      const chaser = new ChaserEnemy(spawnPoint.x, spawnPoint.y, this.balance, this.shipsLayer);
      this.enemies.push(chaser);
    } else {
      const shooter = new ShooterEnemy(spawnPoint.x, spawnPoint.y, this.balance, this.shipsLayer);
      this.enemies.push(shooter);
    }
  }

  private endGame(reason: EndReason): void {
    if (this.isEnded) return;
    this.isEnded = true;
    this.isRunning = false;
    this.input.isActive = false;

    if (reason === 'DEFEATED') {
      if (this.player) {
        this.particleMgr?.spawnShipExplosion(this.player.x, this.player.y);
        this.audio.playExplosion();
        this.audio.playSfx('ship_sinking');
      }
      this.audio.playSfx('game_over');
    } else {
      this.audio.playSfx('game_complete');
    }

    this.audio.setSailingVolume(0);
    const finalDuration = Math.round(this.elapsedTime);
    this.events.onGameOver(reason, this.score, finalDuration);
  }

  public getEntityCount(): number {
    return (this.player ? 1 : 0) + this.enemies.length + this.projectiles.length;
  }

  public destroy(): void {
    this.isRunning = false;
    this.isEnded = true;
    this.input.detach();
    this.audio.setSailingVolume(0);
    this.audio.stopAmbience();

    document.removeEventListener('visibilitychange', this.onVisibilityChangeBound);
    window.removeEventListener('blur', this.onWindowBlurBound);
    window.removeEventListener('resize', this.onResizeBound);

    // Clean entities
    if (this.player) {
      this.player.destroy();
      this.player = null;
    }
    for (const e of this.enemies) e.destroy();
    this.enemies = [];
    for (const p of this.projectiles) p.destroy();
    this.projectiles = [];

    this.wakeParticleMgr?.clear();
    this.wakeParticleMgr = null;
    this.particleMgr?.clear();
    this.particleMgr = null;
    this.damageTextMgr?.clear();
    this.damageTextMgr = null;

    if (this.app) {
      this.app.ticker.remove(this.update, this);
      this.app.destroy(true, { children: true, texture: false });
      this.app = null;
    }
  }
}

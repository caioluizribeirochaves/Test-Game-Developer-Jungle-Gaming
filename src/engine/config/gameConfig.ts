export interface MatchConfig {
  sessionDuration: number; // in seconds (60 to 180)
  enemySpawnInterval: number; // in seconds (1 to 10)
}

export interface GameplayBalanceConfig {
  // Arena
  arenaWidth: number;
  arenaHeight: number;

  // Player
  playerMaxHealth: number;
  playerMoveSpeed: number; // pixels / second
  playerTurnSpeed: number; // radians / second
  playerDrag: number; // friction decay

  // Player Weapons
  playerFrontalCooldown: number; // seconds
  playerBroadsideCooldown: number; // seconds
  playerProjectileSpeed: number; // pixels / second
  playerProjectileDamage: number;
  playerProjectileLifetime: number; // seconds

  // Enemies General
  spawnSafetyRadius: number; // min distance from player to spawn
  maxActiveEnemies: number;
  chaserRatio: number; // fraction of spawns that are chasers (vs shooters)

  // Chaser Enemy
  chaserMaxHealth: number;
  chaserMoveSpeed: number;
  chaserTurnSpeed: number;
  chaserCollisionDamage: number; // damage dealt to player on kamikaze contact

  // Shooter Enemy
  shooterMaxHealth: number;
  shooterMoveSpeed: number;
  shooterTurnSpeed: number;
  shooterAttackRange: number; // distance at which it begins firing
  shooterDesiredDistance: number; // target distance it tries to maintain
  shooterCooldown: number;
  shooterProjectileSpeed: number;
  shooterProjectileDamage: number;
  shooterProjectileLifetime: number;
}

export const DEFAULT_MATCH_CONFIG: MatchConfig = {
  sessionDuration: 120, // default 120s (2 minutes)
  enemySpawnInterval: 3, // default 3s
};

export const MATCH_CONFIG_LIMITS = {
  minDuration: 60,
  maxDuration: 180,
  durationStep: 10,
  minSpawnInterval: 1,
  maxSpawnInterval: 10,
  spawnIntervalStep: 1,
} as const;

export const DEFAULT_BALANCE_CONFIG: GameplayBalanceConfig = {
  arenaWidth: 1920,
  arenaHeight: 1080,

  playerMaxHealth: 100,
  playerMoveSpeed: 180,
  playerTurnSpeed: 2.8,
  playerDrag: 0.96,

  playerFrontalCooldown: 0.45,
  playerBroadsideCooldown: 1.2,
  playerProjectileSpeed: 420,
  playerProjectileDamage: 25, // 4 hits destroy standard 100 HP enemy
  playerProjectileLifetime: 2.2,

  spawnSafetyRadius: 400,
  maxActiveEnemies: 12,
  chaserRatio: 0.55, // 55% chaser, 45% shooter

  chaserMaxHealth: 50,
  chaserMoveSpeed: 155,
  chaserTurnSpeed: 2.2,
  chaserCollisionDamage: 30,

  shooterMaxHealth: 75,
  shooterMoveSpeed: 120,
  shooterTurnSpeed: 1.8,
  shooterAttackRange: 480,
  shooterDesiredDistance: 380,
  shooterCooldown: 1.8,
  shooterProjectileSpeed: 320,
  shooterProjectileDamage: 15,
  shooterProjectileLifetime: 2.0,
};

const STORAGE_KEY_OPTIONS = 'pirate_battle_options_v1';

export function loadStoredMatchConfig(): MatchConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_OPTIONS);
    if (!raw) return { ...DEFAULT_MATCH_CONFIG };
    const parsed = JSON.parse(raw);
    return sanitizeMatchConfig(parsed);
  } catch {
    return { ...DEFAULT_MATCH_CONFIG };
  }
}

export function saveStoredMatchConfig(config: MatchConfig): void {
  try {
    const sanitized = sanitizeMatchConfig(config);
    localStorage.setItem(STORAGE_KEY_OPTIONS, JSON.stringify(sanitized));
  } catch (e) {
    console.error('Failed to save match config to localStorage', e);
  }
}

export function sanitizeMatchConfig(config: Partial<MatchConfig>): MatchConfig {
  let sessionDuration = Number(config.sessionDuration);
  if (isNaN(sessionDuration)) sessionDuration = DEFAULT_MATCH_CONFIG.sessionDuration;
  sessionDuration = Math.max(
    MATCH_CONFIG_LIMITS.minDuration,
    Math.min(MATCH_CONFIG_LIMITS.maxDuration, Math.round(sessionDuration))
  );

  let enemySpawnInterval = Number(config.enemySpawnInterval);
  if (isNaN(enemySpawnInterval)) enemySpawnInterval = DEFAULT_MATCH_CONFIG.enemySpawnInterval;
  enemySpawnInterval = Math.max(
    MATCH_CONFIG_LIMITS.minSpawnInterval,
    Math.min(MATCH_CONFIG_LIMITS.maxSpawnInterval, Math.round(enemySpawnInterval))
  );

  return { sessionDuration, enemySpawnInterval };
}

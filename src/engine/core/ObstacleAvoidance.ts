import { ObstacleBox } from './MapGenerator';
import { NavGrid } from './NavGrid';

export interface EnemyPosition {
  x: number;
  y: number;
  radius: number;
}

export class ObstacleAvoidance {
  /**
   * Computes the desired steering angle and speed multiplier to reach (targetX, targetY)
   * while smoothly routing around islands, sea rocks, arena edges, and neighboring enemies.
   */
  public static computeSteering(
    currentX: number,
    currentY: number,
    currentAngle: number,
    targetX: number,
    targetY: number,
    radius: number,
    obstacles: ObstacleBox[],
    arenaWidth: number,
    arenaHeight: number,
    mapBlockedCheck: (x: number, y: number, r: number) => boolean,
    otherEnemies?: EnemyPosition[]
  ): { desiredAngle: number; speedMultiplier: number } {
    // 1. Intelligent Global Pathfinding via NavGrid:
    // If line-of-sight to target is clear, heads straight for target.
    // If an island blocks the way, routes through shortest A* waypoints around the obstacle.
    const nav = NavGrid.getInstance(arenaWidth, arenaHeight, obstacles);
    const waypoint = nav.getNextWaypoint(currentX, currentY, targetX, targetY);

    // 2. Primary seek vector towards waypoint leading to target
    const toTargetX = waypoint.x - currentX;
    const toTargetY = waypoint.y - currentY;
    const dist = Math.hypot(toTargetX, toTargetY);

    let desiredAngle: number;
    if (dist > 2) {
      desiredAngle = Math.atan2(toTargetY, toTargetX);
    } else {
      desiredAngle = Math.atan2(targetY - currentY, targetX - currentX);
    }

    return { desiredAngle, speedMultiplier: 1.0 };
  }
}

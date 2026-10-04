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
    // If line-of-sight to target is clear with ship hull clearance, heads straight for target.
    // If an island blocks the way, routes through shortest A* waypoints around the obstacle.
    const nav = NavGrid.getInstance(arenaWidth, arenaHeight, obstacles);
    const waypoint = nav.getNextWaypoint(currentX, currentY, targetX, targetY, radius);

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

    // 3. Anticipatory obstacle avoidance (whisker/probe along current heading)
    const lookahead = radius + 32;
    const probeX = currentX + Math.cos(currentAngle) * lookahead;
    const probeY = currentY + Math.sin(currentAngle) * lookahead;

    if (mapBlockedCheck(probeX, probeY, radius)) {
      // Find nearest obstacle boundary
      let nearestBox: ObstacleBox | null = null;
      let minObstacleDist = Infinity;
      let closestPt = { x: currentX, y: currentY };

      for (const box of obstacles) {
        const cx = Math.max(box.x, Math.min(currentX, box.x + box.width));
        const cy = Math.max(box.y, Math.min(currentY, box.y + box.height));
        const d = Math.hypot(currentX - cx, currentY - cy);
        if (d < minObstacleDist) {
          minObstacleDist = d;
          nearestBox = box;
          closestPt = { x: cx, y: cy };
        }
      }

      if (nearestBox && minObstacleDist < lookahead + 25 && minObstacleDist > 0.01) {
        const nx = (currentX - closestPt.x) / minObstacleDist;
        const ny = (currentY - closestPt.y) / minObstacleDist;

        // Tangent choices
        let tx = -ny;
        let ty = nx;

        const toWpX = Math.cos(desiredAngle);
        const toWpY = Math.sin(desiredAngle);
        if (tx * toWpX + ty * toWpY < 0) {
          tx = -tx;
          ty = -ty;
        }

        // Blend tangent with outward normal for anticipatory curved sailing
        const blendX = tx * 0.7 + nx * 0.45;
        const blendY = ty * 0.7 + ny * 0.45;
        desiredAngle = Math.atan2(blendY, blendX);
        return { desiredAngle, speedMultiplier: 0.92 };
      }
    }

    return { desiredAngle, speedMultiplier: 1.0 };
  }
}

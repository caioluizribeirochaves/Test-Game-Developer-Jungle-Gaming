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
    const effectiveTargetX = waypoint.x;
    const effectiveTargetY = waypoint.y;

    // 2. Primary seek vector towards effective target
    const toTargetX = effectiveTargetX - currentX;
    const toTargetY = effectiveTargetY - currentY;
    const targetDist = Math.hypot(toTargetX, toTargetY);
    let dirX = targetDist > 1 ? toTargetX / targetDist : 0;
    let dirY = targetDist > 1 ? toTargetY / targetDist : 0;

    let steerX = dirX;
    let steerY = dirY;

    // 3. Smooth Local Repulsive & Tangential Field when very close to obstacles
    const dangerMargin = radius + 20;
    for (const box of obstacles) {
      const closestX = Math.max(box.x, Math.min(currentX, box.x + box.width));
      const closestY = Math.max(box.y, Math.min(currentY, box.y + box.height));
      const dist = Math.hypot(currentX - closestX, currentY - closestY);

      if (dist < dangerMargin) {
        const repelWeight = Math.pow((dangerMargin - dist) / dangerMargin, 1.2) * 1.8;
        const normX = dist > 0.1 ? (currentX - closestX) / dist : Math.cos(currentAngle + Math.PI / 2);
        const normY = dist > 0.1 ? (currentY - closestY) / dist : Math.sin(currentAngle + Math.PI / 2);

        // Add outward repulsive normal
        steerX += normX * repelWeight;
        steerY += normY * repelWeight;

        // Add tangent glide along the obstacle boundary towards effective target
        const tang1X = -normY;
        const tang1Y = normX;
        const dot1 = tang1X * dirX + tang1Y * dirY;
        const tangSign = dot1 >= 0 ? 1 : -1;
        steerX += tang1X * tangSign * (repelWeight * 1.2);
        steerY += tang1Y * tangSign * (repelWeight * 1.2);
      }
    }

    // 4. Boundary Repulsion (keep ships inside the open arena)
    const edgeMargin = 55;
    if (currentX < edgeMargin) {
      const p = (edgeMargin - currentX) / edgeMargin;
      steerX += p * 3.0;
    }
    if (currentX > arenaWidth - edgeMargin) {
      const p = (currentX - (arenaWidth - edgeMargin)) / edgeMargin;
      steerX -= p * 3.0;
    }
    if (currentY < edgeMargin) {
      const p = (edgeMargin - currentY) / edgeMargin;
      steerY += p * 3.0;
    }
    if (currentY > arenaHeight - edgeMargin) {
      const p = (currentY - (arenaHeight - edgeMargin)) / edgeMargin;
      steerY -= p * 3.0;
    }

    // 5. Whisker feelers along current heading
    const forwardDist = 50;
    const isProbeBlocked = (px: number, py: number, pr: number): boolean => {
      if (px < 40 || px > arenaWidth - 40 || py < 40 || py > arenaHeight - 40) return true;
      return mapBlockedCheck(px, py, pr);
    };

    const centerProbeX = currentX + Math.cos(currentAngle) * forwardDist;
    const centerProbeY = currentY + Math.sin(currentAngle) * forwardDist;
    const centerBlocked = isProbeBlocked(centerProbeX, centerProbeY, radius * 0.7);

    const whiskerAngle = 0.55;
    const whiskerDist = 40;
    const leftProbeX = currentX + Math.cos(currentAngle - whiskerAngle) * whiskerDist;
    const leftProbeY = currentY + Math.sin(currentAngle - whiskerAngle) * whiskerDist;
    const leftBlocked = isProbeBlocked(leftProbeX, leftProbeY, radius * 0.6);

    const rightProbeX = currentX + Math.cos(currentAngle + whiskerAngle) * whiskerDist;
    const rightProbeY = currentY + Math.sin(currentAngle + whiskerAngle) * whiskerDist;
    const rightBlocked = isProbeBlocked(rightProbeX, rightProbeY, radius * 0.6);

    let speedMultiplier = 1.0;

    if (centerBlocked || leftBlocked || rightBlocked) {
      speedMultiplier = 0.85;

      if (centerBlocked) {
        if (!leftBlocked && rightBlocked) {
          steerX += -Math.sin(currentAngle) * 2.5;
          steerY += Math.cos(currentAngle) * 2.5;
        } else if (leftBlocked && !rightBlocked) {
          steerX += Math.sin(currentAngle) * 2.5;
          steerY += -Math.cos(currentAngle) * 2.5;
        } else {
          // Choose whichever side aligns with target
          const leftNormX = -Math.sin(currentAngle);
          const leftNormY = Math.cos(currentAngle);
          const dotLeft = leftNormX * dirX + leftNormY * dirY;
          if (dotLeft > 0) {
            steerX += leftNormX * 2.5;
            steerY += leftNormY * 2.5;
          } else {
            steerX -= leftNormX * 2.5;
            steerY -= leftNormY * 2.5;
          }
        }
      } else if (leftBlocked) {
        steerX += Math.sin(currentAngle) * 1.5;
        steerY += -Math.cos(currentAngle) * 1.5;
      } else if (rightBlocked) {
        steerX += -Math.sin(currentAngle) * 1.5;
        steerY += Math.cos(currentAngle) * 1.5;
      }
    }

    // 6. Swarm Separation (keep enemies from piling into each other)
    if (otherEnemies && otherEnemies.length > 0) {
      const sepDist = 55;
      for (const other of otherEnemies) {
        const dx = currentX - other.x;
        const dy = currentY - other.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 0.1 && dist < sepDist) {
          const sepForce = ((sepDist - dist) / sepDist) * 2.0;
          steerX += (dx / dist) * sepForce;
          steerY += (dy / dist) * sepForce;
        }
      }
    }

    const desiredAngle = Math.atan2(steerY, steerX);
    return { desiredAngle, speedMultiplier };
  }
}

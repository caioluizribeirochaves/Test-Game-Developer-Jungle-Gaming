import { ObstacleBox } from './MapGenerator';

export interface EnemyPosition {
  x: number;
  y: number;
  radius: number;
}

export class ObstacleAvoidance {
  /**
   * Computes the desired steering angle and speed multiplier to reach (targetX, targetY)
   * while smoothly avoiding islands, sea rocks, arena edges, and neighboring enemies.
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
    // 1. Primary seek vector towards target
    const toTargetX = targetX - currentX;
    const toTargetY = targetY - currentY;
    const targetDist = Math.hypot(toTargetX, toTargetY);
    let dirX = targetDist > 1 ? toTargetX / targetDist : 0;
    let dirY = targetDist > 1 ? toTargetY / targetDist : 0;

    let steerX = dirX;
    let steerY = dirY;

    // 2. Continuous Repulsive Potential Field from nearby obstacles
    const dangerMargin = radius + 85;
    for (const box of obstacles) {
      const closestX = Math.max(box.x, Math.min(currentX, box.x + box.width));
      const closestY = Math.max(box.y, Math.min(currentY, box.y + box.height));
      const dist = Math.hypot(currentX - closestX, currentY - closestY);

      if (dist < dangerMargin) {
        const repelWeight = Math.pow((dangerMargin - dist) / dangerMargin, 1.8) * 3.2;
        const normX = dist > 0.1 ? (currentX - closestX) / dist : Math.cos(currentAngle + Math.PI / 2);
        const normY = dist > 0.1 ? (currentY - closestY) / dist : Math.sin(currentAngle + Math.PI / 2);
        steerX += normX * repelWeight;
        steerY += normY * repelWeight;
      }
    }

    // 3. Boundary Repulsion (keep ships inside the arena)
    const edgeMargin = 90;
    if (currentX < edgeMargin) steerX += ((edgeMargin - currentX) / edgeMargin) * 3.0;
    if (currentX > arenaWidth - edgeMargin) steerX -= ((currentX - (arenaWidth - edgeMargin)) / edgeMargin) * 3.0;
    if (currentY < edgeMargin) steerY += ((edgeMargin - currentY) / edgeMargin) * 3.0;
    if (currentY > arenaHeight - edgeMargin) steerY -= ((currentY - (arenaHeight - edgeMargin)) / edgeMargin) * 3.0;

    // 4. Whisker / Feeler Raycasts along current heading
    // Central feeler (ahead)
    const forwardDist = 110;
    const centerProbeX = currentX + Math.cos(currentAngle) * forwardDist;
    const centerProbeY = currentY + Math.sin(currentAngle) * forwardDist;
    const centerBlocked = mapBlockedCheck(centerProbeX, centerProbeY, radius * 0.7);

    // Left and Right whiskers
    const whiskerAngle = 0.65; // ~37 degrees
    const whiskerDist = 85;
    const leftProbeX = currentX + Math.cos(currentAngle - whiskerAngle) * whiskerDist;
    const leftProbeY = currentY + Math.sin(currentAngle - whiskerAngle) * whiskerDist;
    const leftBlocked = mapBlockedCheck(leftProbeX, leftProbeY, radius * 0.6);

    const rightProbeX = currentX + Math.cos(currentAngle + whiskerAngle) * whiskerDist;
    const rightProbeY = currentY + Math.sin(currentAngle + whiskerAngle) * whiskerDist;
    const rightBlocked = mapBlockedCheck(rightProbeX, rightProbeY, radius * 0.6);

    let speedMultiplier = 1.0;

    if (centerBlocked || leftBlocked || rightBlocked) {
      speedMultiplier = 0.75; // Slow down slightly when navigating tight obstacles

      if (centerBlocked) {
        if (!leftBlocked && rightBlocked) {
          // Steer hard left
          const leftNormX = -Math.sin(currentAngle);
          const leftNormY = Math.cos(currentAngle);
          steerX += leftNormX * 3.5;
          steerY += leftNormY * 3.5;
        } else if (leftBlocked && !rightBlocked) {
          // Steer hard right
          const rightNormX = Math.sin(currentAngle);
          const rightNormY = -Math.cos(currentAngle);
          steerX += rightNormX * 3.5;
          steerY += rightNormY * 3.5;
        } else {
          // Both sides tight - steer away from the closer wall
          const leftClearance = mapBlockedCheck(
            currentX + Math.cos(currentAngle - 1.2) * 60,
            currentY + Math.sin(currentAngle - 1.2) * 60,
            radius * 0.5
          );
          if (!leftClearance) {
            steerX += -Math.sin(currentAngle) * 4.0;
            steerY += Math.cos(currentAngle) * 4.0;
          } else {
            steerX += Math.sin(currentAngle) * 4.0;
            steerY += -Math.cos(currentAngle) * 4.0;
          }
        }
      } else if (leftBlocked) {
        // Nudge away from left
        steerX += Math.sin(currentAngle) * 2.2;
        steerY += -Math.cos(currentAngle) * 2.2;
      } else if (rightBlocked) {
        // Nudge away from right
        steerX += -Math.sin(currentAngle) * 2.2;
        steerY += Math.cos(currentAngle) * 2.2;
      }
    }

    // 5. Swarm Separation (keep enemies from piling into a cluster)
    if (otherEnemies && otherEnemies.length > 0) {
      const sepDist = 55;
      for (const other of otherEnemies) {
        const dx = currentX - other.x;
        const dy = currentY - other.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 0.1 && dist < sepDist) {
          const sepForce = ((sepDist - dist) / sepDist) * 1.8;
          steerX += (dx / dist) * sepForce;
          steerY += (dy / dist) * sepForce;
        }
      }
    }

    const desiredAngle = Math.atan2(steerY, steerX);
    return { desiredAngle, speedMultiplier };
  }
}

import { ObstacleBox } from './MapGenerator';

export class NavGrid {
  private static instance: NavGrid | null = null;

  public readonly cellSize: number = 45;
  public readonly cols: number;
  public readonly rows: number;
  public readonly arenaWidth: number;
  public readonly arenaHeight: number;

  private grid: boolean[][]; // true = blocked, false = walkable
  private obstacles: ObstacleBox[] = [];

  constructor(arenaWidth: number = 1920, arenaHeight: number = 1080, obstacles: ObstacleBox[] = []) {
    this.arenaWidth = arenaWidth;
    this.arenaHeight = arenaHeight;
    this.cols = Math.ceil(arenaWidth / this.cellSize);
    this.rows = Math.ceil(arenaHeight / this.cellSize);
    this.obstacles = obstacles;

    this.grid = [];
    for (let r = 0; r < this.rows; r++) {
      this.grid[r] = [];
      for (let c = 0; c < this.cols; c++) {
        this.grid[r]![c] = this.checkCellBlocked(c, r);
      }
    }
  }

  private static cachedObstaclesRef: ObstacleBox[] | null = null;

  public static getInstance(
    arenaWidth: number = 1920,
    arenaHeight: number = 1080,
    obstacles: ObstacleBox[] = []
  ): NavGrid {
    if (!NavGrid.instance || (obstacles.length > 0 && NavGrid.cachedObstaclesRef !== obstacles)) {
      NavGrid.instance = new NavGrid(arenaWidth, arenaHeight, obstacles);
      NavGrid.cachedObstaclesRef = obstacles;
    }
    return NavGrid.instance;
  }

  private checkCellBlocked(c: number, r: number): boolean {
    const px = c * this.cellSize + this.cellSize / 2;
    const py = r * this.cellSize + this.cellSize / 2;

    // Boundary margins
    const edgeMargin = 45;
    if (
      px < edgeMargin ||
      px > this.arenaWidth - edgeMargin ||
      py < edgeMargin ||
      py > this.arenaHeight - edgeMargin
    ) {
      return true;
    }

    // Island & rock obstacle check (tuned to allow all channels/straits between islands)
    for (const box of this.obstacles) {
      const margin = box.isRock ? 16 : 28;
      if (
        px >= box.x - margin &&
        px <= box.x + box.width + margin &&
        py >= box.y - margin &&
        py <= box.y + box.height + margin
      ) {
        return true;
      }
    }

    return false;
  }

  public isBlocked(c: number, r: number): boolean {
    if (c < 0 || c >= this.cols || r < 0 || r >= this.rows) return true;
    return this.grid[r]![c] ?? true;
  }

  public isWorldPointBlocked(x: number, y: number, extraMargin: number = 0): boolean {
    if (
      x < 65 + extraMargin ||
      x > this.arenaWidth - (65 + extraMargin) ||
      y < 65 + extraMargin ||
      y > this.arenaHeight - (65 + extraMargin)
    ) {
      return true;
    }
    for (const box of this.obstacles) {
      const m = (box.isRock ? 28 : 50) + extraMargin;
      if (
        x >= box.x - m &&
        x <= box.x + box.width + m &&
        y >= box.y - m &&
        y <= box.y + box.height + m
      ) {
        return true;
      }
    }
    return false;
  }

  /**
   * Fast 2D line-of-sight check against all obstacle bounding boxes.
   */
  public hasLineOfSight(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    margin: number = 38
  ): boolean {
    const dx = x2 - x1;
    const dy = y2 - y1;

    for (const box of this.obstacles) {
      const minX = box.x - margin;
      const maxX = box.x + box.width + margin;
      const minY = box.y - margin;
      const maxY = box.y + box.height + margin;

      let tmin = 0;
      let tmax = 1;

      if (Math.abs(dx) < 1e-6) {
        if (x1 < minX || x1 > maxX) continue;
      } else {
        const ood = 1 / dx;
        let t1 = (minX - x1) * ood;
        let t2 = (maxX - x1) * ood;
        if (t1 > t2) { const tmp = t1; t1 = t2; t2 = tmp; }
        tmin = Math.max(tmin, t1);
        tmax = Math.min(tmax, t2);
        if (tmin > tmax) continue;
      }

      if (Math.abs(dy) < 1e-6) {
        if (y1 < minY || y1 > maxY) continue;
      } else {
        const ood = 1 / dy;
        let t1 = (minY - y1) * ood;
        let t2 = (maxY - y1) * ood;
        if (t1 > t2) { const tmp = t1; t1 = t2; t2 = tmp; }
        tmin = Math.max(tmin, t1);
        tmax = Math.min(tmax, t2);
        if (tmin > tmax) continue;
      }

      // Intersection found
      return false;
    }

    return true;
  }

  /**
   * Finds the next steering waypoint from (startX, startY) towards (targetX, targetY).
   * If direct line of sight exists, heads directly to target.
   * Otherwise, computes shortest path around obstacles using A* and path shortcutting.
   */
  public getNextWaypoint(
    startX: number,
    startY: number,
    targetX: number,
    targetY: number
  ): { x: number; y: number } {
    // 1. Direct line-of-sight: no obstacles between ship and target
    if (this.hasLineOfSight(startX, startY, targetX, targetY)) {
      return { x: targetX, y: targetY };
    }

    let sc = Math.floor(startX / this.cellSize);
    let sr = Math.floor(startY / this.cellSize);
    let tc = Math.floor(targetX / this.cellSize);
    let tr = Math.floor(targetY / this.cellSize);

    sc = Math.max(0, Math.min(this.cols - 1, sc));
    sr = Math.max(0, Math.min(this.rows - 1, sr));
    tc = Math.max(0, Math.min(this.cols - 1, tc));
    tr = Math.max(0, Math.min(this.rows - 1, tr));

    // If target cell is blocked (e.g. player near shore), pick nearest walkable cell
    if (this.isBlocked(tc, tr)) {
      let bestDist = Infinity;
      let bestC = tc;
      let bestR = tr;
      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          if (!this.isBlocked(c, r)) {
            const d = Math.hypot(c - tc, r - tr);
            if (d < bestDist) {
              bestDist = d;
              bestC = c;
              bestR = r;
            }
          }
        }
      }
      tc = bestC;
      tr = bestR;
    }

    // If start cell is blocked (ship bumped shore), pick nearest walkable cell
    if (this.isBlocked(sc, sr)) {
      let bestDist = Infinity;
      let bestC = sc;
      let bestR = sr;
      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          if (!this.isBlocked(c, r)) {
            const d = Math.hypot(c - sc, r - sr);
            if (d < bestDist) {
              bestDist = d;
              bestC = c;
              bestR = r;
            }
          }
        }
      }
      sc = bestC;
      sr = bestR;
    }

    // A* Search on Grid
    const openSet: { c: number; r: number; f: number; g: number }[] = [];
    const cameFrom = new Map<string, { c: number; r: number }>();
    const gScore = new Map<string, number>();

    const startKey = `${sc},${sr}`;
    gScore.set(startKey, 0);
    openSet.push({ c: sc, r: sr, g: 0, f: Math.hypot(sc - tc, sr - tr) });

    const key = (c: number, r: number) => `${c},${r}`;

    const dirs = [
      { dc: 1, dr: 0, cost: 1.0 },
      { dc: -1, dr: 0, cost: 1.0 },
      { dc: 0, dr: 1, cost: 1.0 },
      { dc: 0, dr: -1, cost: 1.0 },
      { dc: 1, dr: 1, cost: 1.414 },
      { dc: -1, dr: 1, cost: 1.414 },
      { dc: 1, dr: -1, cost: 1.414 },
      { dc: -1, dr: -1, cost: 1.414 },
    ];

    let found = false;
    let closestExplored = { c: sc, r: sr, dist: Math.hypot(sc - tc, sr - tr) };

    while (openSet.length > 0) {
      // Smallest fScore
      let bestIdx = 0;
      for (let i = 1; i < openSet.length; i++) {
        if (openSet[i]!.f < openSet[bestIdx]!.f) {
          bestIdx = i;
        }
      }

      const current = openSet.splice(bestIdx, 1)[0]!;

      const distToTarget = Math.hypot(current.c - tc, current.r - tr);
      if (distToTarget < closestExplored.dist) {
        closestExplored = { c: current.c, r: current.r, dist: distToTarget };
      }

      if (current.c === tc && current.r === tr) {
        found = true;
        break;
      }

      const currKey = key(current.c, current.r);
      const currG = gScore.get(currKey) ?? Infinity;

      for (const d of dirs) {
        const nc = current.c + d.dc;
        const nr = current.r + d.dr;

        if (this.isBlocked(nc, nr)) continue;

        // Prevent cutting across diagonal corners if adjacent orthos are blocked
        if (d.dc !== 0 && d.dr !== 0) {
          if (this.isBlocked(current.c + d.dc, current.r) || this.isBlocked(current.c, current.r + d.dr)) {
            continue;
          }
        }

        const tentativeG = currG + d.cost;
        const nKey = key(nc, nr);

        if (tentativeG < (gScore.get(nKey) ?? Infinity)) {
          cameFrom.set(nKey, { c: current.c, r: current.r });
          gScore.set(nKey, tentativeG);
          const h = Math.hypot(nc - tc, nr - tr);
          openSet.push({ c: nc, r: nr, g: tentativeG, f: tentativeG + h });
        }
      }
    }

    // Reconstruct path to target cell (or closest reachable cell towards target)
    const endCell = found ? { c: tc, r: tr } : { c: closestExplored.c, r: closestExplored.r };
    const path: { x: number; y: number }[] = [];
    let curr: { c: number; r: number } | undefined = endCell;

    while (curr) {
      path.push({
        x: curr.c * this.cellSize + this.cellSize / 2,
        y: curr.r * this.cellSize + this.cellSize / 2,
      });
      curr = cameFrom.get(key(curr.c, curr.r));
    }

    path.reverse();

    // Path shortcutting (string pulling):
    // Find the furthest waypoint in path that has clear line-of-sight from startX, startY
    for (let i = path.length - 1; i >= 0; i--) {
      const wp = path[i]!;
      if (this.hasLineOfSight(startX, startY, wp.x, wp.y, 40)) {
        return wp;
      }
    }

    return path[0] ?? { x: targetX, y: targetY };
  }
}

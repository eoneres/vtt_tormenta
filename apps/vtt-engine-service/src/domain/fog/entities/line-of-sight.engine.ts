import type { Position, Wall } from '@vtt/shared-types';

/**
 * Line of Sight engine using 2D ray-segment intersection.
 *
 * Algorithm:
 * 1. Cast rays from the observer to each wall endpoint (+ ±epsilon offsets)
 * 2. For each ray, find the nearest wall intersection
 * 3. The resulting polygon is the visible area
 *
 * Reference: https://www.redblobgames.com/articles/visibility/
 */
export class LineOfSightEngine {
  /**
   * Compute the visible polygon from `observer` given a set of walls.
   * Returns an ordered list of positions forming the visibility polygon.
   */
  computeVisibilityPolygon(
    observer: Position,
    walls: Wall[],
    radius: number,
  ): Position[] {
    const segments = this.wallsToSegments(walls, observer, radius);
    const boundarySegments = this.boundarySegments(observer, radius);
    const allSegments = [...segments, ...boundarySegments];

    const angles = this.collectAngles(observer, allSegments);
    const visiblePoints: Position[] = [];

    for (const angle of angles) {
      for (const offset of [-0.0001, 0, 0.0001]) {
        const ray = this.rayFromAngle(observer, angle + offset, radius * 2);
        const hit = this.nearestIntersection(observer, ray, allSegments);
        if (hit) visiblePoints.push(hit);
      }
    }

    // Sort by angle around observer
    visiblePoints.sort((a, b) => {
      const angleA = Math.atan2(a.y - observer.y, a.x - observer.x);
      const angleB = Math.atan2(b.y - observer.y, b.x - observer.x);
      return angleA - angleB;
    });

    return visiblePoints;
  }

  /**
   * Returns true if `target` is visible from `observer` (no blocking wall in between).
   */
  hasLineOfSight(observer: Position, target: Position, walls: Wall[]): boolean {
    for (const wall of walls) {
      if (!wall.blocksLight) continue;
      if (this.segmentsIntersect(observer, target, wall.start, wall.end)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Compute distance between two positions in grid units.
   */
  distance(a: Position, b: Position): number {
    return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private wallsToSegments(
    walls: Wall[],
    _observer: Position,
    _radius: number,
  ): Array<[Position, Position]> {
    return walls
      .filter((w) => w.blocksLight)
      .map((w) => [w.start, w.end] as [Position, Position]);
  }

  private boundarySegments(center: Position, radius: number): Array<[Position, Position]> {
    const r = radius;
    const tl: Position = { x: center.x - r, y: center.y - r };
    const tr: Position = { x: center.x + r, y: center.y - r };
    const br: Position = { x: center.x + r, y: center.y + r };
    const bl: Position = { x: center.x - r, y: center.y + r };
    return [[tl, tr], [tr, br], [br, bl], [bl, tl]];
  }

  private collectAngles(
    observer: Position,
    segments: Array<[Position, Position]>,
  ): number[] {
    const angles = new Set<number>();
    for (const [a, b] of segments) {
      angles.add(Math.atan2(a.y - observer.y, a.x - observer.x));
      angles.add(Math.atan2(b.y - observer.y, b.x - observer.x));
    }
    return Array.from(angles);
  }

  private rayFromAngle(origin: Position, angle: number, length: number): Position {
    return {
      x: origin.x + Math.cos(angle) * length,
      y: origin.y + Math.sin(angle) * length,
    };
  }

  private nearestIntersection(
    origin: Position,
    ray: Position,
    segments: Array<[Position, Position]>,
  ): Position | null {
    let nearest: Position | null = null;
    let minDist = Infinity;

    for (const [a, b] of segments) {
      const hit = this.raySegmentIntersection(origin, ray, a, b);
      if (hit) {
        const d = this.distance(origin, hit);
        if (d < minDist) {
          minDist = d;
          nearest = hit;
        }
      }
    }

    return nearest;
  }

  /**
   * Ray-segment intersection using parametric form.
   * Returns intersection point or null.
   */
  private raySegmentIntersection(
    rayOrigin: Position,
    rayEnd: Position,
    segA: Position,
    segB: Position,
  ): Position | null {
    const r = { x: rayEnd.x - rayOrigin.x, y: rayEnd.y - rayOrigin.y };
    const s = { x: segB.x - segA.x, y: segB.y - segA.y };

    const denom = r.x * s.y - r.y * s.x;
    if (Math.abs(denom) < 1e-10) return null; // parallel

    const diff = { x: segA.x - rayOrigin.x, y: segA.y - rayOrigin.y };
    const t = (diff.x * s.y - diff.y * s.x) / denom;
    const u = (diff.x * r.y - diff.y * r.x) / denom;

    if (t >= 0 && u >= 0 && u <= 1) {
      return {
        x: rayOrigin.x + t * r.x,
        y: rayOrigin.y + t * r.y,
      };
    }

    return null;
  }

  /**
   * Check if segment (p1→p2) intersects segment (p3→p4).
   */
  private segmentsIntersect(p1: Position, p2: Position, p3: Position, p4: Position): boolean {
    const d1 = this.cross(p3, p4, p1);
    const d2 = this.cross(p3, p4, p2);
    const d3 = this.cross(p1, p2, p3);
    const d4 = this.cross(p1, p2, p4);

    if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
        ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) {
      return true;
    }

    return false;
  }

  private cross(o: Position, a: Position, b: Position): number {
    return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  }
}

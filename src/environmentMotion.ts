// Normalized terrain coordinates. Each route returns to its first perch without
// a discontinuity, including the exact loop boundary.
const birdRoutes = [
  { a: { x: 150, y: 240 }, b: { x: 860, y: 380 }, duration: 43, flight: 8 },
  { a: { x: 860, y: 220 }, b: { x: 180, y: 430 }, duration: 51, flight: 9 },
];
export function birdMotion(time: number, index: number) {
  const route = birdRoutes[index % birdRoutes.length];
  const half = route.duration / 2;
  const t = ((time + index * 13) % route.duration + route.duration) % route.duration;
  const returning = t >= half;
  const local = t % half;
  const a = returning ? route.b : route.a;
  const b = returning ? route.a : route.b;
  const flight = local < route.flight;
  const u = Math.min(1, local / route.flight);
  // Ease takeoff and landing; the arc has zero displacement at both perches.
  const q = u * u * (3 - 2 * u);
  return {
    x: a.x + (b.x - a.x) * q,
    y: a.y + (b.y - a.y) * q - Math.sin(Math.PI * u) * 65,
    flight,
    reverse: b.x < a.x,
    frame: flight ? 8 + Math.floor(time * 10) % 4 : 12 + (Math.floor(local) % 11 === 0 ? 1 : 0),
  };
}

// Short, separated surface disturbances, rather than a permanent fountain ring.
export function lakeRipple(time: number, index: number) {
  const duration = 17 + index * 4.3;
  const local = (time + index * 6.2) % duration;
  const progress = Math.min(1, local / 2.8);
  const centers = [[773, 490], [842, 517], [805, 535]];
  const [x, y] = centers[index % centers.length];
  return {
    x, y,
    rx: 2 + progress * 12,
    ry: 0.8 + progress * 4,
    opacity: local >= 2.8 ? 0 : Math.sin(progress * Math.PI) * 0.34,
  };
}

export function lakeFishMotion(time: number, index: number) {
  const speed = 0.08 + index * 0.018;
  const t = time * speed + index * 2.1;
  const rx = 49 + index * 5;
  const ry = 17 + index * 3;
  const x = 804 + Math.cos(t) * rx;
  const y = 504 + Math.sin(t) * ry;
  return {
    x, y,
    heading: Math.atan2(Math.cos(t) * ry, -Math.sin(t) * rx) * 180 / Math.PI,
    frame: Math.floor(time * (4 + index) + index) % 4,
    species: index % 2,
    opacity: 0.38 + 0.1 * Math.sin(t + index),
  };
}

import { move, walkable } from "./game.ts";
import type { Facing, Point, Region } from "./game.ts";
export type MotionState = {
  region: Region;
  position: Point;
  pet: Point;
  camera: Point;
  velocity: Point;
  facing: Facing;
  petLeft: boolean;
  petFacing: Facing;
  idleTime: number;
  petPose: number;
  distance: number;
  petDistance: number;
  trail: Point[];
  moving: boolean;
  petMoving: boolean;
};
export function pauseMotion(state: MotionState): MotionState {
  if (!state.moving && !state.petMoving && !state.velocity.x && !state.velocity.y) return state;
  return { ...state, moving: false, petMoving: false, velocity: { x: 0, y: 0 } };
}
export function createMotion(region: Region, p: Point, facing: Facing = "front"): MotionState {
  const pet = [
    { x: p.x - 24, y: p.y },
    { x: p.x + 24, y: p.y },
    { x: p.x, y: p.y - 24 },
    { x: p.x, y: p.y + 24 },
  ].find((q) => walkable(q, region)) || { ...p };
  return {
    region,
    position: { ...p },
    pet,
    camera: { ...p },
    velocity: { x: 0, y: 0 },
    facing,
    petLeft: false,
    petFacing: "right",
    idleTime: 0,
    petPose: 0,
    distance: 0,
    petDistance: 0,
    trail: [{ ...pet }, { ...p }],
    moving: false,
    petMoving: false,
  };
}
function clearRoute(from: Point, to: Point, region: Region) {
  const distance = Math.hypot(to.x - from.x, to.y - from.y);
  const samples = Math.max(1, Math.ceil(distance / 3));
  for (let i = 1; i <= samples; i++) {
    const t = i / samples;
    if (!walkable({ x: from.x + (to.x - from.x) * t,
      y: from.y + (to.y - from.y) * t }, region)) return false;
  }
  return true;
}
export function advance(
  state: MotionState,
  input: Point,
  seconds: number,
): MotionState {
  const dt = Math.min(0.035, Math.max(0, seconds)),
    length = Math.hypot(input.x, input.y),
    speed = 105;
  const blend = 1 - Math.exp(-15 * dt);
  const vx =
    state.velocity.x +
    ((length ? (input.x / length) * speed : 0) - state.velocity.x) * blend;
  const vy =
    state.velocity.y +
    ((length ? (input.y / length) * speed : 0) - state.velocity.y) * blend;
  const position = move(
    state.position,
    Math.abs(vx) < 0.3 ? 0 : vx * dt,
    Math.abs(vy) < 0.3 ? 0 : vy * dt,
    state.region,
  );
  const traveled = Math.hypot(
      position.x - state.position.x,
      position.y - state.position.y,
    ),
    moving = traveled > 0.025;
  let facing = state.facing;
  if (length)
    facing =
      Math.abs(input.x) > Math.abs(input.y)
        ? input.x < 0
          ? "left"
          : "right"
        : input.y < 0
          ? "back"
          : "front";
  const trail = [...state.trail];
  if (
    Math.hypot(
      position.x - trail[trail.length - 1].x,
      position.y - trail[trail.length - 1].y,
    ) > 4
  )
    trail.push({ ...position });
  // Retain an actual breadcrumb route, not an offset that cuts through scenery.
  let routeLength = 0,
    index = trail.length - 1;
  while (index > 0 && routeLength < 30) {
    routeLength += Math.hypot(
      trail[index].x - trail[index - 1].x,
      trail[index].y - trail[index - 1].y,
    );
    index--;
  }
  // Keep earlier breadcrumbs until the Familiar can actually pass the corner.
  // A direct shortcut to the desired trailing distance may cross a solid object.
  while (index > 0 && !clearRoute(state.pet, trail[index], state.region)) index--;
  const target = trail[index],
    gap = Math.hypot(target.x - state.pet.x, target.y - state.pet.y);
  const petStep = Math.min(gap, Math.min(135, Math.max(0, gap - 1) * 7) * dt);
  const pet = move(
    state.pet,
    gap ? ((target.x - state.pet.x) / gap) * petStep : 0,
    gap ? ((target.y - state.pet.y) / gap) * petStep : 0,
    state.region,
  );
  if (index > 1) trail.splice(0, index - 1);
  const petTraveled = Math.hypot(pet.x - state.pet.x, pet.y - state.pet.y);
  const idleTime = moving || petTraveled > 0.025 ? 0 : state.idleTime + dt;
  const phase = idleTime % 17;
  // Hold meaningful poses; do not cycle sniff/blink/sit as walking frames.
  const petPose =
    phase > 12
      ? 3
      : phase > 5 && phase < 8
        ? 1
        : (phase > 3.1 && phase < 3.3) || (phase > 9.2 && phase < 9.4)
          ? 2
          : 0;
  const dx = pet.x - state.pet.x,
    dy = pet.y - state.pet.y;
  const petFacing =
    petTraveled > 0.025
      ? Math.abs(dx) > Math.abs(dy)
        ? dx < 0
          ? "left"
          : "right"
        : dy < 0
          ? "back"
          : "front"
      : state.petFacing;
  const cameraBlend = 1 - Math.exp(-9 * dt);
  return {
    region: state.region,
    idleTime,
    petPose,
    petFacing,
    position,
    pet,
    camera: {
      x: state.camera.x + (position.x - state.camera.x) * cameraBlend,
      y: state.camera.y + (position.y - state.camera.y) * cameraBlend,
    },
    velocity: { x: vx, y: vy },
    facing,
    petLeft:
      Math.abs(pet.x - state.pet.x) > 0.02
        ? pet.x < state.pet.x
        : state.petLeft,
    distance: state.distance + traveled,
    petDistance: state.petDistance + petTraveled,
    trail,
    moving,
    petMoving: petTraveled > 0.025,
  };
}

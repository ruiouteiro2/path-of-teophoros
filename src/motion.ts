import { move } from "./game.ts";
import type { Facing, Point, Region } from "./game.ts";
export type MotionState = {
  region: Region;
  position: Point;
  pet: Point;
  camera: Point;
  velocity: Point;
  facing: Facing;
  petLeft: boolean;
  distance: number;
  petDistance: number;
  trail: Point[];
  moving: boolean;
  petMoving: boolean;
};
export function createMotion(region: Region, p: Point): MotionState {
  return {
    region,
    position: { ...p },
    pet: { ...p, x: p.x - 24 },
    camera: { ...p },
    velocity: { x: 0, y: 0 },
    facing: "front",
    petLeft: false,
    distance: 0,
    petDistance: 0,
    trail: [{ x: p.x - 24, y: p.y }, { ...p }],
    moving: false,
    petMoving: false,
  };
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
  const target = trail[index],
    gap = Math.hypot(target.x - state.pet.x, target.y - state.pet.y);
  const petStep = Math.min(gap, Math.min(135, Math.max(0, gap - 1) * 7) * dt);
  const pet = {
    x: state.pet.x + (gap ? ((target.x - state.pet.x) / gap) * petStep : 0),
    y: state.pet.y + (gap ? ((target.y - state.pet.y) / gap) * petStep : 0),
  };
  if (index > 1) trail.splice(0, index - 1);
  const cameraBlend = 1 - Math.exp(-9 * dt);
  return {
    region: state.region,
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
    petDistance: state.petDistance + petStep,
    trail,
    moving,
    petMoving: petStep > 0.025,
  };
}

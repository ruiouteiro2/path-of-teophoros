type Size = { width: number; height: number };
type Position = { x: number; y: number };

/** Fit roomy screens; follow on small screens without shrinking actors away. */
export function frameWorld(viewport: Size, world: Size, focus: Position, focusY = 0.5) {
  const scale = Math.max(0.65, Math.min(1, viewport.width / world.width, viewport.height / world.height));
  const width = world.width * scale;
  const height = world.height * scale;
  const offset = (available: number, extent: number, target: number) =>
    extent <= available ? (available - extent) / 2 : Math.min(0, Math.max(available - extent, target));
  return {
    scale, width, height,
    left: offset(viewport.width, width, viewport.width / 2 - focus.x * scale),
    top: offset(viewport.height, height, viewport.height * focusY - focus.y * scale),
  };
}

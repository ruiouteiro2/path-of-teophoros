export type ReelState = {
  time: number;
  bar: number;
  velocity: number;
  fish: number;
  progress: number;
  result: "playing" | "caught" | "escaped";
};
export function startReel(): ReelState {
  return {
    time: 0,
    bar: 0.48,
    velocity: 0,
    fish: 0.5,
    progress: 0.35,
    result: "playing",
  };
}
export function advanceReel(
  s: ReelState,
  holding: boolean,
  seconds: number,
  seed: number,
): ReelState {
  if (s.result !== "playing") return s;
  const dt = Math.max(0, Math.min(0.05, seconds)),
    time = s.time + dt;
  const target = holding ? -0.52 : 0.34;
  const velocity = s.velocity + (target - s.velocity) * (1 - Math.exp(-7 * dt));
  const bar = Math.max(0.13, Math.min(0.87, s.bar + velocity * dt));
  const fish =
    0.5 +
    Math.sin(time * 0.8 + seed * 0.13) * 0.23 +
    Math.sin(time * 1.7 + seed) * 0.07;
  const progress = Math.max(
    0,
    Math.min(1, s.progress + (Math.abs(bar - fish) < 0.145 ? 0.19 : -0.1) * dt),
  );
  return {
    time,
    bar,
    velocity,
    fish,
    progress,
    result: progress >= 1 ? "caught" : progress <= 0 ? "escaped" : "playing",
  };
}

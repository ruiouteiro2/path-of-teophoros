import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, Platform } from "react-native";
import { Facing, Point, Save } from "../game";
import { advance, createMotion, MotionState } from "../motion";
export type Direction = "up" | "down" | "left" | "right";
export function useGameMotion(
  save: Save | null,
  active: boolean,
  session: number,
  onCheckpoint: (p: Point, facing: Facing, region: Save["region"]) => void,
) {
  const [view, setView] = useState<MotionState | null>(null);
  const engine = useRef<MotionState | null>(null),
    keys = useRef(new Set<Direction>()),
    config = useRef({ save, active, session, onCheckpoint }),
    epoch = useRef("");
  useEffect(() => {
    config.current = { save, active, session, onCheckpoint };
    if (!active) keys.current.clear();
  }, [save, active, session, onCheckpoint]);
  const press = useCallback((direction: Direction) => {
    keys.current.add(direction);
  }, []);
  const release = useCallback((direction: Direction) => {
    keys.current.delete(direction);
  }, []);
  const stop = useCallback(() => {
    keys.current.clear();
  }, []);
  useEffect(() => {
    let id = 0,
      last = 0,
      checkpoint = 0,
      wasMoving = false,
      background = false;
    const subscription = AppState.addEventListener("change", (state) => {
      background = state !== "active";
      if (background) stop();
    });
    const frame = (time: number) => {
      const cfg = config.current;
      if (cfg.save) {
        const key = cfg.session + ":" + cfg.save.region;
        if (epoch.current !== key || !engine.current) {
          epoch.current = key;
          engine.current = createMotion(cfg.save.region, cfg.save.position);
          setView(engine.current);
          last = time;
        }
        const previous = engine.current;
        if (cfg.active && !background) {
          const input = {
            x:
              Number(keys.current.has("right")) -
              Number(keys.current.has("left")),
            y:
              Number(keys.current.has("down")) - Number(keys.current.has("up")),
          };
          const next = advance(
            previous,
            input,
            last ? (time - last) / 1000 : 0,
          );
          engine.current = next;
          if (
            next.moving ||
            next.petMoving ||
            wasMoving ||
            Math.hypot(
              next.camera.x - previous.camera.x,
              next.camera.y - previous.camera.y,
            ) > 0.01
          )
            setView(next);
          if (
            (time - checkpoint > 700 && next.moving) ||
            (wasMoving && !next.moving)
          ) {
            cfg.onCheckpoint(next.position, next.facing, next.region);
            checkpoint = time;
          }
          wasMoving = next.moving;
        } else if (wasMoving) {
          cfg.onCheckpoint(previous.position, previous.facing, previous.region);
          engine.current = {
            ...previous,
            moving: false,
            velocity: { x: 0, y: 0 },
          };
          setView(engine.current);
          wasMoving = false;
        }
      }
      last = time;
      id = requestAnimationFrame(frame);
    };
    id = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(id);
      subscription.remove();
    };
  }, [stop]);
  useEffect(() => {
    if (Platform.OS !== "web" || !active) return;
    const map: Record<string, Direction> = {
      ArrowUp: "up",
      w: "up",
      ArrowDown: "down",
      s: "down",
      ArrowLeft: "left",
      a: "left",
      ArrowRight: "right",
      d: "right",
    };
    const down = (e: KeyboardEvent) => {
      const d = map[e.key] || map[e.key.toLowerCase()];
      if (d) {
        e.preventDefault();
        press(d);
      }
    };
    const up = (e: KeyboardEvent) => {
      const d = map[e.key] || map[e.key.toLowerCase()];
      if (d) {
        e.preventDefault();
        release(d);
      }
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", stop);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", stop);
      stop();
    };
  }, [active, press, release, stop]);
  const getState = useCallback(() => engine.current, []);
  return { state: view, press, release, stop, getState };
}

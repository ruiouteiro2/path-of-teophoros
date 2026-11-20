/* eslint-disable react-hooks/immutability -- expo-audio players are mutable native SharedObjects; loop/volume setters are the documented API, not React state. */
import { useAudioPlayer, setAudioModeAsync } from "expo-audio";
import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Point, Region } from "../game";
import { footstepSurface, nextFootstep, waterProximity, normalizeVolume } from "../audioScene";
export function useGameAudio(
  active: boolean,
  region: Region,
  position: Point,
  distance: number,
  moving: boolean,
) {
  const sanctuaryMusic = useAudioPlayer(
    require("../../assets/audio/sanctuary-dawn.m4a"),
  );
  const forestMusic = useAudioPlayer(require("../../assets/audio/olivewild-paths.m4a"));
  const music = region === "forest" ? forestMusic : sanctuaryMusic;
  const water = useAudioPlayer(
    require("../../assets/audio/foley/stream-field.wav"),
  );
  const lake = useAudioPlayer(require("../../assets/audio/lakeshore.m4a"));
  const pickup = useAudioPlayer(require("../../assets/audio/pickup.wav"));
  const wood = useAudioPlayer(
    require("../../assets/audio/foley/wood-pickup.wav"),
  );
  const stone = useAudioPlayer(
    require("../../assets/audio/foley/stone-pickup.wav"),
  );
  const fiber = useAudioPlayer(
    require("../../assets/audio/foley/fiber-pickup.wav"),
  );
  const travel = useAudioPlayer(require("../../assets/audio/foley/door.wav"));
  const coins = useAudioPlayer(require("../../assets/audio/foley/coins.wav"));
  const soil = useAudioPlayer(
    require("../../assets/audio/foley/soil-work.wav"),
  );
  const waterAction = useAudioPlayer(
    require("../../assets/audio/foley/water-action.wav"),
  );
  const grass0 = useAudioPlayer(
    require("../../assets/audio/foley/grass-0.wav"),
  );
  const grass1 = useAudioPlayer(
    require("../../assets/audio/foley/grass-1.wav"),
  );
  const grass2 = useAudioPlayer(
    require("../../assets/audio/foley/grass-2.wav"),
  );
  const grass3 = useAudioPlayer(
    require("../../assets/audio/foley/grass-3.wav"),
  );
  const stone0 = useAudioPlayer(
    require("../../assets/audio/foley/stone-0.wav"),
  );
  const stone1 = useAudioPlayer(
    require("../../assets/audio/foley/stone-1.wav"),
  );
  const stone2 = useAudioPlayer(
    require("../../assets/audio/foley/stone-2.wav"),
  );
  const stone3 = useAudioPlayer(
    require("../../assets/audio/foley/stone-3.wav"),
  );
  const floor0 = useAudioPlayer(
    require("../../assets/audio/foley/floor-0.wav"),
  );
  const floor1 = useAudioPlayer(
    require("../../assets/audio/foley/floor-1.wav"),
  );
  const floor2 = useAudioPlayer(
    require("../../assets/audio/foley/floor-2.wav"),
  );
  const floor3 = useAudioPlayer(
    require("../../assets/audio/foley/floor-3.wav"),
  );
  const steps = useMemo(
    () => [
      grass0,
      grass1,
      grass2,
      grass3,
      stone0,
      stone1,
      stone2,
      stone3,
      floor0,
      floor1,
      floor2,
      floor3,
    ],
    [
      grass0,
      grass1,
      grass2,
      grass3,
      stone0,
      stone1,
      stone2,
      stone3,
      floor0,
      floor1,
      floor2,
      floor3,
    ],
  );
  const [mix, setMix] = useState({
    music: 0.3,
    ambience: 0.2,
    effects: 0.45,
    steps: 0.16,
  });
  const [muted, setMuted] = useState(false),
    [musicOn, setMusicOn] = useState(true),
    [foreground, setForeground] = useState(true);
  const ready = useRef(false),
    unlocked = useRef(false),
    lastStep = useRef(0);
  const playbackEpoch = useRef(0),
    lastVariant = useRef(0);
  useEffect(() => {
    setAudioModeAsync({
      allowsRecording: false,
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      interruptionMode: "mixWithOthers",
    }).catch(() => {});
    AsyncStorage.getItem("teophoros.audio.v1")
      .then((raw) => {
        if (raw) {
          const a = JSON.parse(raw);
          setMuted(!!a.muted);
          setMusicOn(a.musicOn !== false);
          if (a.mix)
            setMix(
              (v) =>
                Object.fromEntries(
                  Object.entries(v).map(([k, n]) => [
                    k,
                    Number.isFinite(a.mix[k])
                      ? normalizeVolume(a.mix[k])
                      : n,
                  ]),
                ) as typeof v,
            );
        }
      })
      .catch(() => {})
      .finally(() => {
        ready.current = true;
      });
    const sub = AppState.addEventListener("change", (s) =>
      setForeground(s === "active"),
    );
    return () => sub.remove();
  }, []);
  useEffect(() => {
    if (ready.current)
      AsyncStorage.setItem(
        "teophoros.audio.v1",
        JSON.stringify({ muted, musicOn, mix }),
      ).catch(() => {});
  }, [muted, musicOn, mix]);
  useEffect(() => {
    sanctuaryMusic.loop = true;
    forestMusic.loop = true;
    water.loop = true;
    lake.loop = true;
    for (const p of steps) p.volume = mix.steps;
  }, [sanctuaryMusic, forestMusic, water, lake, steps, mix.steps]);
  const unlock = useCallback(() => {
    unlocked.current = true;
    if (!muted) {
      if (musicOn) { music.volume = mix.music; music.play(); }
      water.play();
      lake.play();
    }
  }, [muted, musicOn, music, mix.music, water, lake]);
  useEffect(() => {
    const tracks = [sanctuaryMusic, forestMusic];
    if (!active || !foreground || muted || !musicOn || !unlocked.current) {
      for (const track of tracks) { track.pause(); track.volume = 0; }
      return;
    }
    const from = tracks.map((track) => track.volume);
    music.play();
    const started = Date.now();
    const fade = setInterval(() => {
      const t = Math.min(1, (Date.now() - started) / 800);
      tracks.forEach((track, i) => {
        const target = track === music ? mix.music : 0;
        track.volume = from[i] + (target - from[i]) * t;
        if (t === 1 && track !== music) track.pause();
      });
      if (t === 1) clearInterval(fade);
    }, 40);
    return () => clearInterval(fade);
  }, [active, foreground, muted, musicOn, music, sanctuaryMusic, forestMusic, mix.music]);
  useEffect(() => {
    playbackEpoch.current++;
    const on = active && foreground && !muted && unlocked.current;
    for (const p of [water, lake]) {
      if (on) p.play();
      else p.pause();
    }
    if (!on)
      for (const p of [
        pickup,
        wood,
        stone,
        fiber,
        travel,
        coins,
        soil,
        waterAction,
        ...steps,
      ])
        p.pause();
  }, [
    active,
    foreground,
    muted,
    water,
    lake,
    coins,
    pickup,
    wood,
    stone,
    fiber,
    travel,
    steps,
    soil,
    waterAction,
  ]);
  useEffect(() => {
    const proximity = waterProximity(region, { x: position.x, y: position.y });
    water.volume = region === "forest" ? proximity * mix.ambience * 0.5 : 0;
    lake.volume = region === "temple" ? proximity * mix.ambience * 0.65 : 0;
  }, [position.x, position.y, region, water, lake, mix.ambience]);
  const effect = useCallback(
    (
      kind:
        | "pickup"
        | "wood"
        | "stone"
        | "fiber"
        | "travel"
        | "coins"
        | "soil"
        | "water",
    ) => {
      if (muted || !foreground || !active) return;
      const p = {
        pickup,
        wood,
        stone,
        fiber,
        travel,
        coins,
        soil,
        water: waterAction,
      }[kind];
      p.volume = mix.effects;
      const epoch = playbackEpoch.current;
      void p
        .seekTo(0)
        .then(() => {
          if (epoch === playbackEpoch.current) p.play();
        })
        .catch(() => {});
    },
    [
      muted,
      foreground,
      active,
      pickup,
      wood,
      stone,
      fiber,
      travel,
      coins,
      soil,
      waterAction,
      mix.effects,
    ],
  );
  const stride = Math.floor(distance / 32);
  const surface = footstepSurface(region, position);
  useEffect(() => {
    if (
      moving &&
      active &&
      !muted &&
      foreground &&
      stride !== lastStep.current
    ) {
      const variant = nextFootstep(lastVariant.current, stride);
      lastVariant.current = variant;
      const step =
        steps[(surface === "wood" ? 8 : surface === "stone" ? 4 : 0) + variant];
      const epoch = playbackEpoch.current;
      let cancelled = false;
      void step
        .seekTo(0)
        .then(() => {
          if (!cancelled && epoch === playbackEpoch.current) step.play();
        })
        .catch(() => {});
      lastStep.current = stride;
      return () => {
        cancelled = true;
      };
    }
    lastStep.current = stride;
  }, [stride, moving, active, muted, foreground, steps, region, surface]);
  return {
    mix,
    setVolume: (channel: keyof typeof mix, value: number) =>
      setMix((v) => ({ ...v, [channel]: normalizeVolume(value) })),
    unlock,
    effect,
    muted,
    musicOn,
    toggleMute: () => {
      if (muted) unlock();
      setMuted((v) => !v);
    },
    toggleMusic: () => setMusicOn((v) => !v),
  };
}

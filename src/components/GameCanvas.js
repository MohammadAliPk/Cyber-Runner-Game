"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const LANES = [0, 1, 2];
const BASE_SPEED = 6;
const SPEED_RAMP = 0.9;
const SPEED_CAP = 18;
const GRAVITY = 22;
const JUMP_FORCE = 8.5;
const SLIDE_DURATION = 0.65;

const laneToPercent = (lane) => 15 + lane * 35;

const OBSTACLE_TYPES = [
  { id: "block", label: "Barrier", requires: "dodge" },
  { id: "low", label: "Trip Mine", requires: "jump" },
  { id: "high", label: "Drone Gate", requires: "slide" },
];

const createInitialEngine = () => ({
  player: {
    lane: 1,
    targetLane: 1,
    y: 0,
    vy: 0,
    isJumping: false,
    isSliding: false,
    slideTimer: 0,
  },
  obstacles: [],
  speed: BASE_SPEED,
  spawnTimer: 0,
  nextSpawn: 0.8,
  score: 0,
  stateTimer: 0,
  alive: true,
});

let obstacleId = 0;

export function GameCanvas({
  isRunning,
  isPaused,
  sessionId,
  onScoreUpdate,
  onSpeedUpdate,
  onGameOver,
  onPauseToggle,
  selectedCharacter,
  sounds,
}) {
  const engineRef = useRef(createInitialEngine());
  const frameRef = useRef(null);
  const lastTimeRef = useRef(null);
  const [renderState, setRenderState] = useState({
    obstacles: [],
    playerLane: 1,
    playerY: 0,
    isSliding: false,
    speed: BASE_SPEED,
  });
  const lastScoreRef = useRef(0);

  const resetEngine = useCallback(() => {
    engineRef.current = createInitialEngine();
    lastScoreRef.current = 0;
    lastTimeRef.current = null;
    setRenderState({
      obstacles: [],
      playerLane: 1,
      playerY: 0,
      isSliding: false,
      speed: BASE_SPEED,
    });
    onScoreUpdate?.(0);
    onSpeedUpdate?.(BASE_SPEED);
  }, [onScoreUpdate, onSpeedUpdate]);

  useEffect(() => {
    resetEngine();
  }, [sessionId, resetEngine]);

  const moveLane = useCallback((direction) => {
    const engine = engineRef.current;
    const nextLane = Math.min(
      Math.max(engine.player.targetLane + direction, 0),
      LANES.length - 1
    );
    engine.player.targetLane = nextLane;
  }, []);

  const triggerJump = useCallback(() => {
    const engine = engineRef.current;
    if (engine.player.isSliding) return;
    if (engine.player.isJumping) return;
    engine.player.isJumping = true;
    engine.player.vy = JUMP_FORCE;
    sounds.playJump();
  }, [sounds]);

  const triggerSlide = useCallback(() => {
    const engine = engineRef.current;
    if (engine.player.isSliding || engine.player.isJumping) return;
    engine.player.isSliding = true;
    engine.player.slideTimer = SLIDE_DURATION;
    sounds.playSlide();
  }, [sounds]);

  const handleKeyDown = useCallback(
    (event) => {
      if (event.repeat) return;
      switch (event.key.toLowerCase()) {
        case "arrowleft":
        case "a":
          moveLane(-1);
          break;
        case "arrowright":
        case "d":
          moveLane(1);
          break;
        case "arrowup":
        case "w":
        case " ":
          triggerJump();
          break;
        case "arrowdown":
        case "s":
        case "control":
          triggerSlide();
          break;
        case "escape":
          onPauseToggle?.();
          break;
        default:
          break;
      }
    },
    [moveLane, triggerJump, triggerSlide, onPauseToggle]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const touchRef = useRef({ x: 0, y: 0, time: 0 });

  const onTouchStart = (event) => {
    const touch = event.touches[0];
    touchRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
  };

  const onTouchEnd = (event) => {
    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchRef.current.x;
    const dy = touch.clientY - touchRef.current.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < 24) return;

    if (absX > absY) {
      if (dx > 0) moveLane(1);
      else moveLane(-1);
    } else if (dy < 0) {
      triggerJump();
    } else {
      triggerSlide();
    }
  };

  const spawnObstacle = (engine) => {
    const type = OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];
    const lane = LANES[Math.floor(Math.random() * LANES.length)];
    engine.obstacles.push({
      id: `${type.id}-${obstacleId++}`,
      lane,
      type,
      y: -10,
    });
    engine.spawnTimer = 0;
    engine.nextSpawn = 0.6 + Math.random() * 0.9;
  };

  const handleCollision = useCallback(
    (engine) => {
      if (!engine.alive) return;
      engine.alive = false;
      sounds.playCollision();
      onGameOver?.(Math.floor(engine.score));
    },
    [onGameOver, sounds]
  );

  const step = useCallback(
    (delta) => {
      const engine = engineRef.current;
      if (!engine.alive || !isRunning || isPaused) return;

      engine.speed = Math.min(
        engine.speed + (delta * SPEED_RAMP) / 4,
        SPEED_CAP
      );

      const player = engine.player;
      player.lane += (player.targetLane - player.lane) * Math.min(1, delta * 10);

      if (player.isJumping) {
        player.y += player.vy * delta;
        player.vy -= GRAVITY * delta;

        if (player.y <= 0) {
          player.y = 0;
          player.vy = 0;
          player.isJumping = false;
        }
      }

      if (player.isSliding) {
        player.slideTimer -= delta;
        if (player.slideTimer <= 0) {
          player.isSliding = false;
        }
      }

      engine.spawnTimer += delta;
      if (engine.spawnTimer >= engine.nextSpawn) {
        spawnObstacle(engine);
      }

      engine.obstacles.forEach((obstacle) => {
        obstacle.y += engine.speed * delta * 9;
      });
      engine.obstacles = engine.obstacles.filter((obs) => obs.y < 120);

      engine.obstacles.forEach((obstacle) => {
        if (Math.abs(obstacle.lane - player.lane) > 0.35) return;
        const playerYPosition = 82 - player.y * 12;
        if (Math.abs(obstacle.y - playerYPosition) > 8) return;

        switch (obstacle.type.requires) {
          case "jump":
            if (player.y < 0.8) handleCollision(engine);
            break;
          case "slide":
            if (!player.isSliding) handleCollision(engine);
            break;
          default:
            if (player.y > 0.5) return;
            handleCollision(engine);
        }
      });

      engine.score += delta * engine.speed * 35;
      const roundedScore = Math.floor(engine.score);
      if (roundedScore !== lastScoreRef.current) {
        lastScoreRef.current = roundedScore;
        onScoreUpdate?.(roundedScore);
      }

      onSpeedUpdate?.(engine.speed);

      engine.stateTimer += delta;
      if (engine.stateTimer >= 1 / 30) {
        engine.stateTimer = 0;
        setRenderState({
          obstacles: engine.obstacles.map((obs) => ({
            id: obs.id,
            lane: obs.lane,
            y: obs.y,
            type: obs.type,
          })),
          playerLane: player.lane,
          playerY: player.y,
          isSliding: player.isSliding,
          speed: engine.speed,
        });
      }
    },
    [handleCollision, isPaused, isRunning, onScoreUpdate, onSpeedUpdate]
  );

  useEffect(() => {
    if (!isRunning) return;
    const loop = (time) => {
      if (lastTimeRef.current == null) lastTimeRef.current = time;
      const delta = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;
      step(delta);
      frameRef.current = requestAnimationFrame(loop);
    };
    frameRef.current = requestAnimationFrame(loop);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
      lastTimeRef.current = null;
    };
  }, [isRunning, step]);

  return (
    <div className="relative flex w-full justify-center">
      <div
        className="game-gradient relative aspect-[9/16] w-full max-w-[440px] overflow-hidden rounded-[2rem] border border-white/15 bg-black/40 md:max-w-[520px]"
        style={{ maxHeight: "82vh" }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(77,229,255,0.15),_transparent_55%)]" />
        {/* lane markers */}
        <div className="pointer-events-none absolute inset-0 flex justify-between px-[12%]">
          {LANES.map((lane) => (
            <div
              key={lane}
              className="h-full w-[2px] bg-gradient-to-b from-transparent via-white/25 to-transparent"
            />
          ))}
        </div>

        {/* obstacles */}
        {renderState.obstacles.map((obstacle) => (
          <div
            key={obstacle.id}
            className="absolute z-20 w-16 -translate-x-1/2 rounded-2xl border border-white/40 bg-white/25 backdrop-blur"
            style={{
              left: `${laneToPercent(obstacle.lane)}%`,
              top: `${obstacle.y}%`,
              height: obstacle.type.requires === "slide" ? "95px" : "70px",
            }}
          >
            <div className="absolute inset-0 rounded-2xl border border-white/20" />
            <p className="mt-2 text-center text-[0.55rem] uppercase tracking-[0.4em] text-white/70">
              {obstacle.type.label}
            </p>
          </div>
        ))}

        {/* player */}
        <div
          className="absolute bottom-[12%] z-30 flex h-24 w-16 -translate-x-1/2 items-center justify-center"
          style={{
            left: `${laneToPercent(renderState.playerLane)}%`,
            transform: `translate(-50%, ${renderState.playerY * -18}px)`,
          }}
        >
          <div
            className={`relative h-full w-full rounded-[1.4rem] transition-all duration-150 ${
              renderState.isSliding ? "scale-y-75" : ""
            }`}
            style={{
              background: `linear-gradient(180deg, ${selectedCharacter.accent}, #050821)`,
              boxShadow: `0 0 30px ${selectedCharacter.accent}80`,
            }}
          >
            <span className="runner-trail absolute inset-0 -z-10" />
          </div>
        </div>

        {/* horizon glow */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black via-black/60 to-transparent" />

        {/* instructions */}
        <div className="pointer-events-none absolute inset-x-0 bottom-3 flex flex-wrap justify-center gap-4 text-[0.65rem] uppercase tracking-[0.4em] text-white/60 md:text-xs">
          <p>Swipe / Arrow Keys to Move</p>
          <p>Swipe Up / Space to Jump</p>
          <p>Swipe Down / Ctrl to Slide</p>
        </div>
      </div>
    </div>
  );
}


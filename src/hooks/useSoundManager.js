"use client";

import { useCallback, useRef } from "react";

export function useSoundManager() {
  const contextRef = useRef(null);

  const ensureContext = useCallback(() => {
    if (typeof window === "undefined") return null;
    if (contextRef.current) {
      if (contextRef.current.state === "suspended") {
        contextRef.current.resume();
      }
      return contextRef.current;
    }

    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext || null;

    if (!AudioContextClass) return null;
    const ctx = new AudioContextClass();
    contextRef.current = ctx;
    return ctx;
  }, []);

  const playTone = useCallback(
    (frequency, duration = 0.18, type = "sine") => {
      const ctx = ensureContext();
      if (!ctx) return;

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

      gainNode.gain.setValueAtTime(0.18, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + duration
      );

      oscillator.connect(gainNode).connect(ctx.destination);
      oscillator.start();
      oscillator.stop(ctx.currentTime + duration);
    },
    [ensureContext]
  );

  const playJump = useCallback(() => playTone(540, 0.22, "triangle"), [
    playTone
  ]);
  const playSlide = useCallback(() => playTone(260, 0.3, "sawtooth"), [
    playTone
  ]);
  const playCollision = useCallback(
    () => {
      playTone(180, 0.32, "square");
      setTimeout(() => playTone(110, 0.28, "square"), 40);
    },
    [playTone]
  );
  const playMenuHover = useCallback(() => playTone(720, 0.08, "sine"), [
    playTone
  ]);
  const playMenuClick = useCallback(() => playTone(480, 0.12, "square"), [
    playTone
  ]);

  return {
    prime: ensureContext,
    playJump,
    playSlide,
    playCollision,
    playMenuHover,
    playMenuClick
  };
}

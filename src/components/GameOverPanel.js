"use client";

import { NeonButton } from "./NeonButton";

export function GameOverPanel({
  score,
  highScore,
  newRecord,
  onRetry,
  onMenu,
  onLeaderboard,
  sounds
}) {
  return (
    <section className="neon-panel glow-border w-full max-w-3xl p-10 text-white">
      <p className="text-xs uppercase tracking-[0.6em] text-pink-300">
        Impact Logged
      </p>
      <h2 className="mt-2 text-4xl font-semibold text-glow">Run Terminated</h2>
      <p className="mt-3 text-white/70">
        Security drones overwhelmed your runner. Sync reflexes and jump back in.
      </p>

      <div className="mt-8 grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 md:grid-cols-2">
        <div>
          <p className="text-[0.55rem] uppercase tracking-[0.5em] text-white/50">
            Final Score
          </p>
          <p className="text-4xl font-bold text-white">
            {score}
          </p>
        </div>
        <div>
          <p className="text-[0.55rem] uppercase tracking-[0.5em] text-white/50">
            High Score
          </p>
          <p className="text-3xl font-semibold text-white">
            {highScore}{" "}
            {newRecord
              ? <span className="ml-2 rounded-full bg-pink-600/40 px-2 py-1 text-xs uppercase tracking-[0.3em] text-pink-100">
                  New!
                </span>
              : null}
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-4 md:flex-row md:justify-between">
        <NeonButton
          variant="ghost"
          className="w-full md:w-auto"
          onClick={() => {
            sounds.playMenuClick();
            onMenu();
          }}
          onHoverSound={sounds.playMenuHover}
        >
          Back to Menu
        </NeonButton>
        <div className="flex flex-col gap-4 md:flex-row">
          <NeonButton
            variant="secondary"
            className="w-full md:w-auto"
            onClick={() => {
              sounds.playMenuClick();
              onLeaderboard();
            }}
            onHoverSound={sounds.playMenuHover}
          >
            Leaderboard
          </NeonButton>
          <NeonButton
            className="w-full md:w-auto"
            onClick={() => {
              sounds.playMenuClick();
              onRetry();
            }}
            onHoverSound={sounds.playMenuHover}
          >
            Retry Run
          </NeonButton>
        </div>
      </div>
    </section>
  );
}

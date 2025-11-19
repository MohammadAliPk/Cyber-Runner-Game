"use client";

import { NeonButton } from "./NeonButton";

export function PauseOverlay({ onResume, onRestart, onQuit, sounds }) {
  return (
    <div className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-black/60">
      <div className="neon-panel glow-border w-full max-w-xl p-10 text-center text-white">
        <p className="text-xs uppercase tracking-[0.5em] text-cyan-200">Hold</p>
        <h3 className="mt-2 text-3xl font-semibold text-glow">Run Paused</h3>
        <p className="mt-3 text-white/70">
          Catch your breath, recalibrate the implants, and dive back into the
          grid when ready.
        </p>
        <div className="mt-8 flex flex-col gap-4">
          <NeonButton
            onClick={() => {
              sounds.playMenuClick();
              onResume();
            }}
            onHoverSound={sounds.playMenuHover}
          >
            Resume Run
          </NeonButton>
          <NeonButton
            variant="secondary"
            onClick={() => {
              sounds.playMenuClick();
              onRestart();
            }}
            onHoverSound={sounds.playMenuHover}
          >
            Restart
          </NeonButton>
          <NeonButton
            variant="ghost"
            onClick={() => {
              sounds.playMenuClick();
              onQuit();
            }}
            onHoverSound={sounds.playMenuHover}
          >
            Quit to Menu
          </NeonButton>
        </div>
      </div>
    </div>
  );
}

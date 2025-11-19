"use client";

import { NeonButton } from "./NeonButton";

export function LeaderboardPanel({ entries, onClose, sounds }) {
  const hasScores = entries.length > 0;

  return (
    <section className="neon-panel glow-border w-full max-w-3xl p-8 text-white">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[0.55rem] uppercase tracking-[0.5em] text-cyan-200">
            Elite Grid Runners
          </p>
          <h3 className="text-3xl font-semibold text-glow">Leaderboard</h3>
        </div>
        <NeonButton
          variant="ghost"
          className="px-4 py-2 text-xs"
          onClick={() => {
            sounds.playMenuClick();
            onClose();
          }}
          onHoverSound={sounds.playMenuHover}
        >
          Close
        </NeonButton>
      </div>

      <div className="mt-6 space-y-4">
        {hasScores
          ? entries.map((entry, index) =>
              <div
                key={`${entry.name}-${index}`}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-4"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-semibold text-white/60">
                    {index + 1}.
                  </span>
                  <div>
                    <p className="text-lg font-semibold text-white">
                      {entry.name}
                    </p>
                    <p className="text-xs uppercase tracking-[0.4em] text-white/60">
                      {entry.character}
                    </p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-white">
                  {entry.score}
                </p>
              </div>
            )
          : <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-8 text-center text-white/60">
              No registered runs yet. Be the first to light up the board.
            </div>}
      </div>
    </section>
  );
}

"use client";

export function GameHud({
  score,
  highScore,
  speed,
  onPause,
  character,
  isPaused
}) {
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-6 text-white">
      <div className="flex w-full flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="hud-blur pointer-events-auto flex w-fit flex-col gap-1 rounded-2xl border border-white/10 px-5 py-3">
          <p className="text-[0.6rem] uppercase tracking-[0.6em] text-white/50">
            Score
          </p>
          <p className="text-3xl font-bold leading-none text-white">
            {score}
          </p>
          <p className="text-xs text-white/60">
            High score {highScore}
          </p>
        </div>
        <div className="pointer-events-auto flex gap-3">
          <button
            className="hud-blur rounded-full border border-white/10 px-5 py-3 text-sm uppercase tracking-[0.3em] transition hover:border-cyan-400 hover:text-cyan-200"
            onClick={onPause}
          >
            {isPaused ? "Resume" : "Pause"}
          </button>
          <div className="hud-blur hidden items-center gap-3 rounded-full border border-white/10 px-5 py-3 md:flex">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: character.accent }}
            />
            <div>
              <p className="text-[0.55rem] uppercase tracking-[0.4em] text-white/60">
                Runner
              </p>
              <p className="text-sm font-semibold">
                {character.name}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="hud-blur pointer-events-auto ml-auto rounded-full border border-white/10 px-5 py-2 text-xs uppercase tracking-[0.4em] text-white/50">
        Speed x{speed.toFixed(2)}
      </div>
    </div>
  );
}

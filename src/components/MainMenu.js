"use client";

import { NeonButton } from "./NeonButton";

export function MainMenu({
  onStart,
  onCharacterSelect,
  onLeaderboard,
  sounds,
  selectedCharacter
}) {
  return (
    <section className="neon-panel glow-border w-full max-w-4xl p-10 text-center text-white">
      <p className="text-sm uppercase tracking-[0.3em] text-cyan-200">
        Cyber Runner Initiative
      </p>
      <h1 className="mt-4 text-4xl font-semibold text-glow md:text-5xl">
        Enter the Neon Grid
      </h1>
      <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80">
        Dash through the endless skyline, dodge security drones, and bend
        gravity with surgical precision. Cyber Runner blends tight arcade
        controls with a cinematic neon presentation.
      </p>

      {selectedCharacter
        ? <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 text-left">
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">
              Loadout Ready
            </p>
            <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xl font-semibold">
                  {selectedCharacter.name}
                </p>
                <p className="text-sm text-white/70">
                  {selectedCharacter.tagline}
                </p>
              </div>
              <div className="flex gap-4 text-sm text-white/70">
                {Object.entries(selectedCharacter.stats).map(([key, value]) =>
                  <div key={key} className="text-center">
                    <p className="text-xs uppercase tracking-widest text-white/40">
                      {key}
                    </p>
                    <p className="text-2xl font-bold text-white">
                      {value}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        : null}

      <div className="mt-10 flex flex-col items-center gap-4 md:flex-row md:justify-center">
        <NeonButton
          className="w-full md:w-auto button-pulse"
          onClick={() => {
            sounds.playMenuClick();
            onStart();
          }}
          onHoverSound={sounds.playMenuHover}
        >
          Launch Run
        </NeonButton>
        <NeonButton
          variant="secondary"
          className="w-full md:w-auto"
          onClick={() => {
            sounds.playMenuClick();
            onCharacterSelect();
          }}
          onHoverSound={sounds.playMenuHover}
        >
          Character Select
        </NeonButton>
        <NeonButton
          variant="ghost"
          className="w-full md:w-auto"
          onClick={() => {
            sounds.playMenuClick();
            onLeaderboard();
          }}
          onHoverSound={sounds.playMenuHover}
        >
          Leaderboard
        </NeonButton>
      </div>
    </section>
  );
}

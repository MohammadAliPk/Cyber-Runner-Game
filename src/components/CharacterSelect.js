"use client";

import { useState } from "react";
import { NeonButton } from "./NeonButton";

export function CharacterSelect({
  characters,
  initialCharacter,
  onConfirm,
  onBack,
  sounds,
}) {
  const [focused, setFocused] = useState(initialCharacter ?? characters[0]);

  return (
    <section className="neon-panel glow-border w-full max-w-5xl p-10 text-white">
      <div className="flex flex-col gap-2 text-center">
        <p className="text-xs uppercase tracking-[0.5em] text-cyan-200">
          Choose Your Runner
        </p>
        <h2 className="text-3xl font-semibold text-glow md:text-4xl">
          Character Select
        </h2>
        <p className="text-white/70">
          Each runner brings a unique rhythm to the grid. Pick the one that
          matches your instincts.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {characters.map((character) => {
          const isActive = character.id === focused.id;
          return (
            <button
              key={character.id}
              className={`relative rounded-3xl border border-white/10 bg-gradient-to-br ${character.gradient} p-5 text-left shadow-xl transition-transform duration-300 ${
                isActive ? "scale-105 ring-2 ring-white/60" : "hover:scale-105"
              }`}
              onMouseEnter={sounds.playMenuHover}
              onFocus={sounds.playMenuHover}
              onClick={() => {
                sounds.playMenuClick();
                setFocused(character);
              }}
            >
              <p className="text-xs uppercase tracking-[0.4em] text-white/70">
                #{character.id.toUpperCase()}
              </p>
              <p className="mt-2 text-2xl font-bold">{character.name}</p>
              <p className="mt-2 text-sm text-white/80">{character.tagline}</p>
              <div className="mt-4 grid grid-cols-3 gap-3 text-center text-sm">
                {Object.entries(character.stats).map(([key, value]) => (
                  <div
                    key={key}
                    className="rounded-2xl border border-white/20 bg-white/10 py-2"
                  >
                    <p className="text-[0.65rem] uppercase tracking-[0.4em] text-white/60">
                      {key}
                    </p>
                    <p className="text-xl font-bold">{value}</p>
                  </div>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-10 flex flex-col gap-4 md:flex-row md:justify-between">
        <NeonButton
          variant="ghost"
          className="w-full md:w-auto"
          onClick={() => {
            sounds.playMenuClick();
            onBack();
          }}
          onHoverSound={sounds.playMenuHover}
        >
          Back to Menu
        </NeonButton>
        <NeonButton
          className="w-full md:w-auto"
          onClick={() => {
            sounds.playMenuClick();
            onConfirm(focused);
          }}
          onHoverSound={sounds.playMenuHover}
        >
          Lock In {focused.name.split(" ")[0]}
        </NeonButton>
      </div>
    </section>
  );
}


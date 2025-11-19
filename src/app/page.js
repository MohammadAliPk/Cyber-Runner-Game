"use client";

import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { characters } from "../lib/characters";
import { MainMenu } from "../components/MainMenu";
import { CharacterSelect } from "../components/CharacterSelect";
import { GameCanvas } from "../components/GameCanvas";
import { GameHud } from "../components/GameHud";
import { PauseOverlay } from "../components/PauseOverlay";
import { GameOverPanel } from "../components/GameOverPanel";
import { LeaderboardPanel } from "../components/LeaderboardPanel";
import { useSoundManager } from "../hooks/useSoundManager";

const STORAGE_KEYS = {
  highScore: "cyberRunnerHighScore",
  leaderboard: "cyberRunnerLeaderboard",
  alias: "cyberRunnerAlias"
};

export default function Home() {
  const sounds = useSoundManager();
  const gameSectionRef = useRef(null);
  const [screen, setScreen] = useState("menu");
  const [selectedCharacter, setSelectedCharacter] = useState(characters[0]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionId, setSessionId] = useState(0);
  const [speed, setSpeed] = useState(6);
  const [newRecord, setNewRecord] = useState(false);
  const [alias, setAlias] = useState("Runner-01");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedHigh = Number(
      localStorage.getItem(STORAGE_KEYS.highScore) || 0
    );
    const storedLeaderboard = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.leaderboard) || "[]"
    );
    const storedAlias = localStorage.getItem(STORAGE_KEYS.alias) || "Runner-01";
    startTransition(() => {
      setHighScore(storedHigh);
      setLeaderboard(storedLeaderboard);
      setAlias(storedAlias);
    });
  }, []);

  const persistLeaderboard = useCallback(entries => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.leaderboard, JSON.stringify(entries));
  }, []);

  const persistHighScore = useCallback(value => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.highScore, String(value));
  }, []);

  const persistAlias = useCallback(value => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.alias, value);
  }, []);

  const startRun = useCallback(() => {
    setScore(0);
    setSpeed(6);
    setIsPaused(false);
    setNewRecord(false);
    setScreen("game");
    setSessionId(prev => prev + 1);
  }, []);

  const handleGameOver = useCallback(
    finalScore => {
      setScore(finalScore);
      setIsPaused(false);
      setScreen("game-over");
      if (finalScore > highScore) {
        setHighScore(finalScore);
        persistHighScore(finalScore);
        setNewRecord(true);
      } else {
        setNewRecord(false);
      }

      const entry = {
        name: alias || "Runner",
        score: finalScore,
        character: selectedCharacter.name,
        timestamp: Date.now()
      };
      const nextBoard = [...leaderboard, entry]
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
      setLeaderboard(nextBoard);
      persistLeaderboard(nextBoard);
    },
    [
      alias,
      highScore,
      leaderboard,
      persistHighScore,
      persistLeaderboard,
      selectedCharacter
    ]
  );

  const togglePause = useCallback(
    () => {
      if (screen !== "game") return;
      setIsPaused(prev => !prev);
    },
    [screen]
  );

  useEffect(
    () => {
      const handleVisibility = () => {
        if (document.hidden && screen === "game") {
          setIsPaused(true);
        }
      };
      document.addEventListener("visibilitychange", handleVisibility);
      return () =>
        document.removeEventListener("visibilitychange", handleVisibility);
    },
    [screen]
  );

  useEffect(
    () => {
      const handleClickPrime = () => {
        sounds.prime();
        window.removeEventListener("pointerdown", handleClickPrime);
      };
      window.addEventListener("pointerdown", handleClickPrime, { once: true });
      return () => window.removeEventListener("pointerdown", handleClickPrime);
    },
    [sounds]
  );

  useEffect(
    () => {
      if (typeof document === "undefined") return;
      const previousBodyOverflow = document.body.style.overflow;
      const previousHtmlOverflow = document.documentElement.style.overflow;

      if (screen === "game") {
        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";
        window.scrollTo({ top: 0 });
      } else {
        document.body.style.overflow = previousBodyOverflow || "";
        document.documentElement.style.overflow = previousHtmlOverflow || "";
      }

      return () => {
        document.body.style.overflow = previousBodyOverflow || "";
        document.documentElement.style.overflow = previousHtmlOverflow || "";
      };
    },
    [screen]
  );

  useEffect(
    () => {
      if (screen !== "game") return;
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    },
    [screen]
  );

  const screenContent = useMemo(
    () => {
      switch (screen) {
        case "menu":
          return (
            <MainMenu
              onStart={startRun}
              onCharacterSelect={() => setScreen("character")}
              onLeaderboard={() => setShowLeaderboard(true)}
              sounds={sounds}
              selectedCharacter={selectedCharacter}
            />
          );
        case "character":
          return (
            <CharacterSelect
              characters={characters}
              initialCharacter={selectedCharacter}
              onConfirm={character => {
                setSelectedCharacter(character);
                setScreen("menu");
              }}
              onBack={() => setScreen("menu")}
              sounds={sounds}
            />
          );
        case "game":
          return (
            <div
              ref={gameSectionRef}
              className="relative flex w-full flex-col items-center gap-6"
            >
              <GameCanvas
                isRunning
                isPaused={isPaused}
                sessionId={sessionId}
                onScoreUpdate={setScore}
                onSpeedUpdate={setSpeed}
                onGameOver={handleGameOver}
                onPauseToggle={togglePause}
                selectedCharacter={selectedCharacter}
                sounds={sounds}
              />
              <GameHud
                score={score}
                highScore={highScore}
                speed={speed}
                onPause={togglePause}
                character={selectedCharacter}
                isPaused={isPaused}
              />
              {isPaused
                ? <PauseOverlay
                    onResume={togglePause}
                    onRestart={() => {
                      togglePause();
                      startRun();
                    }}
                    onQuit={() => {
                      togglePause();
                      setScreen("menu");
                    }}
                    sounds={sounds}
                  />
                : null}
            </div>
          );
        case "game-over":
          return (
            <GameOverPanel
              score={score}
              highScore={highScore}
              newRecord={newRecord}
              onRetry={() => {
                startRun();
              }}
              onMenu={() => setScreen("menu")}
              onLeaderboard={() => setShowLeaderboard(true)}
              sounds={sounds}
            />
          );
        default:
          return null;
      }
    },
    [
      screen,
      selectedCharacter,
      sounds,
      startRun,
      isPaused,
      sessionId,
      score,
      highScore,
      speed,
      newRecord,
      handleGameOver,
      togglePause
    ]
  );

  const isGameScreen = screen === "game";

  return (
    <main
      className={`relative min-h-screen overflow-hidden px-4 md:px-10 ${isGameScreen
        ? "py-6"
        : "py-12"}`}
    >
      <div className="pointer-events-none absolute inset-0 cyber-grid opacity-40" />
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center gap-10">
        {!isGameScreen
          ? <header className="w-full rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-2xl backdrop-blur">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.5em] text-cyan-200">
                    Cyber Runner // Endless Protocol
                  </p>
                  <h1 className="text-3xl font-semibold text-glow">
                    Neon Skyline Grid
                  </h1>
                </div>
                <div className="flex flex-col gap-2 text-sm text-white/80 md:text-right">
                  <label className="text-xs uppercase tracking-[0.4em] text-white/50">
                    Runner Alias
                  </label>
                  <input
                    className="rounded-full border border-white/20 bg-black/20 px-4 py-2 text-base text-white outline-none transition focus:border-cyan-400"
                    value={alias}
                    onChange={event => {
                      setAlias(event.target.value);
                      persistAlias(event.target.value);
                    }}
                    maxLength={16}
                  />
                  <p className="text-xs uppercase tracking-[0.4em] text-white/50">
                    Ready: {selectedCharacter.name}
                  </p>
                </div>
              </div>
            </header>
          : null}

        {screenContent}
      </div>

      {showLeaderboard
        ? <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/70 px-4 py-8">
            <LeaderboardPanel
              entries={leaderboard}
              onClose={() => setShowLeaderboard(false)}
              sounds={sounds}
            />
          </div>
        : null}
    </main>
  );
}

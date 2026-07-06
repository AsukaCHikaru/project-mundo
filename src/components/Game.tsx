import { useState } from "react";
import { Machine } from "./Machine";

type GameStage = "title" | "playing";

/**
 * The game itself, one level above the PC. Shows the title screen; Play
 * boots the machine, and dismissing the machine's final shutdown screen
 * (any click or key) returns here. Remounting `Machine` resets its phase,
 * but the zustand stores are module-level, so a replay currently keeps the
 * previous run's disk/session state.
 */
export function Game() {
  const [stage, setStage] = useState<GameStage>("title");

  if (stage === "title") {
    return <TitleScreen onPlay={() => setStage("playing")} />;
  }
  return <Machine onExit={() => setStage("title")} />;
}

function TitleScreen({ onPlay }: { onPlay: () => void }) {
  return (
    <div className="flex min-h-screen w-screen flex-col items-center justify-center gap-12 bg-black font-win text-white">
      <h1 className="text-5xl font-bold tracking-[0.3em]">PROJECT MUNDO</h1>
      <button
        type="button"
        onClick={onPlay}
        className="border-2 border-white px-10 py-2 text-xl tracking-widest hover:bg-white hover:text-black"
      >
        PLAY
      </button>
    </div>
  );
}

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Permission } from "../lib/permission";
import { useDesktop } from "../store/desktop";
import { useDialogs } from "../store/dialogs";
import { usePermissionDll } from "../store/permissionDll";
import { useSystem } from "../store/system";
import { Desktop } from "./Desktop";

/** How long the boot screen shows before the desktop appears. */
const BOOT_MS = 2000;

/** How long the desktop fades to black before the final shutdown screen. */
const SHUTDOWN_FADE_MS = 2000;

type MachinePhase = "booting" | "bsod" | "desktop" | "shutdown";

interface MachineContextValue {
  /** Crash the PC: wipe the live desktop and drop to the blue screen. */
  crash: () => void;
  /** Shut the PC down cleanly — the terminal "safe to turn off" screen. */
  shutDown: () => void;
}

const MachineContext = createContext<MachineContextValue | null>(null);

/** The machine controls (crash, shut down), available under the desktop. */
export function useMachine(): MachineContextValue {
  const ctx = useContext(MachineContext);
  if (!ctx) throw new Error("useMachine must be used inside <Machine>");
  return ctx;
}

interface MachineProps {
  /** Fired when the final shutdown screen is dismissed (any click or key). */
  onExit: () => void;
}

/**
 * The PC itself, one level above the desktop. Owns the machine phase:
 * `booting` (timed splash) → `desktop`; a crash jumps to `bsod`, and Enter
 * there powers back into `booting`; an admin Shut Down ends on the terminal
 * `shutdown` screen. Zustand stores live at module level, so
 * the "disk" (filesystem, documents, generated dll) survives a reboot — the
 * crash only clears the volatile session (open windows, dialogs, dial-up),
 * and boot re-derives the permission level from `permission.dll` on disk C
 * (USER when there is none or it's user-level).
 */
export function Machine({ onExit }: MachineProps) {
  const [phase, setPhase] = useState<MachinePhase>("desktop");

  const context = useMemo<MachineContextValue>(
    () => ({
      crash: () => {
        useDesktop.getState().closeAll();
        useDialogs.getState().closeAll();
        useSystem.getState().disconnect();
        setPhase("bsod");
      },
      shutDown: () => setPhase("shutdown"),
    }),
    [],
  );

  // Booting: after the timer, apply the dll-decided permission and land on
  // the desktop.
  useEffect(() => {
    if (phase !== "booting") return;
    const timer = setTimeout(() => {
      const dll = usePermissionDll.getState().dll;
      useSystem.getState().setPermission(dll?.level ?? Permission.USER);
      setPhase("desktop");
    }, BOOT_MS);
    return () => clearTimeout(timer);
  }, [phase]);

  // Blue screen: Enter restarts the machine.
  useEffect(() => {
    if (phase !== "bsod") return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") setPhase("booting");
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [phase]);

  switch (phase) {
    case "booting":
      return <BootScreen />;
    case "bsod":
      return <BsodScreen />;
    case "desktop":
      return (
        <MachineContext.Provider value={context}>
          <Desktop />
        </MachineContext.Provider>
      );
    case "shutdown":
      // Still under the provider: the fade stage renders the desktop, whose
      // children read the machine context.
      return (
        <MachineContext.Provider value={context}>
          <ShutdownScreen onExit={onExit} />
        </MachineContext.Provider>
      );
  }
}

/** Same fixed 800x600 frame the desktop uses, for the non-desktop phases. */
function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-screen flex-col items-center justify-center overflow-auto bg-black">
      <div className="relative h-[600px] w-[800px] overflow-hidden font-win">
        {children}
      </div>
    </div>
  );
}

function BootScreen() {
  return (
    <Screen>
      <div className="flex h-full flex-col items-center justify-center gap-4 bg-black text-white">
        {/* Placeholder boot splash — real branding/copy is authored by hand. */}
        <div className="text-3xl font-bold">Mundo 95</div>
        <div className="text-sm animate-pulse">Starting…</div>
      </div>
    </Screen>
  );
}

/**
 * The whole shutdown sequence — the game's goal, no way back from here.
 * First the desktop gradually fades to black (the overlay also swallows
 * clicks, so nothing is interactive mid-fade), then the final screen, which
 * any click or key press dismisses back to the game (`onExit`).
 */
function ShutdownScreen({ onExit }: { onExit: () => void }) {
  const [fading, setFading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setFading(false), SHUTDOWN_FADE_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (fading) return;
    window.addEventListener("pointerdown", onExit);
    window.addEventListener("keydown", onExit);
    return () => {
      window.removeEventListener("pointerdown", onExit);
      window.removeEventListener("keydown", onExit);
    };
  }, [fading, onExit]);

  if (fading) {
    return (
      <>
        <Desktop />
        <div
          className="fixed inset-0 bg-black"
          style={{
            animation: `fade-to-black ${SHUTDOWN_FADE_MS}ms ease-in forwards`,
          }}
        />
      </>
    );
  }

  return (
    <Screen>
      <div className="flex h-full items-center justify-center bg-black">
        <div className="font-serif text-2xl" style={{ color: "#FFA500" }}>
          It's now safe to turn off your computer.
        </div>
      </div>
    </Screen>
  );
}

function BsodScreen() {
  return (
    <Screen>
      <div
        className="flex h-full flex-col items-center justify-center gap-6 px-16 font-mono text-white"
        style={{ background: "#0000AA" }}
      >
        <div className="bg-white px-2 font-bold" style={{ color: "#0000AA" }}>
          MUNDO
        </div>
        {/* Placeholder crash copy — the real text is authored by hand. */}
        <div className="text-sm">A fatal exception has occurred.</div>
        <div className="text-sm">
          Press ENTER to restart your computer.
          <span className="animate-pulse"> _</span>
        </div>
      </div>
    </Screen>
  );
}

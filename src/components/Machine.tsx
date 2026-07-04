import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Permission } from "../lib/permission";
import { useDesktop } from "../store/desktop";
import { useDialogs } from "../store/dialogs";
import { usePermissionDll } from "../store/permissionDll";
import { useSystem } from "../store/system";
import { Desktop } from "./Desktop";

/** How long the boot screen shows before the desktop appears. */
const BOOT_MS = 2000;

type MachinePhase = "booting" | "bsod" | "desktop";

interface MachineContextValue {
  /** Crash the PC: wipe the live desktop and drop to the blue screen. */
  crash: () => void;
}

const MachineContext = createContext<MachineContextValue | null>(null);

/** The machine controls (crash), available anywhere under the desktop. */
export function useMachine(): MachineContextValue {
  const ctx = useContext(MachineContext);
  if (!ctx) throw new Error("useMachine must be used inside <Machine>");
  return ctx;
}

/**
 * The PC itself, one level above the desktop. Owns the machine phase:
 * `booting` (timed splash) → `desktop`; a crash jumps to `bsod`, and Enter
 * there powers back into `booting`. Zustand stores live at module level, so
 * the "disk" (filesystem, documents, generated dll) survives a reboot — the
 * crash only clears the volatile session (open windows, dialogs, dial-up),
 * and boot re-derives the permission level from `permission.dll` on disk C
 * (USER when there is none or it's user-level).
 */
export function Machine() {
  const [phase, setPhase] = useState<MachinePhase>("booting");

  const context = useMemo<MachineContextValue>(
    () => ({
      crash: () => {
        useDesktop.getState().closeAll();
        useDialogs.getState().closeAll();
        useSystem.getState().disconnect();
        setPhase("bsod");
      },
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

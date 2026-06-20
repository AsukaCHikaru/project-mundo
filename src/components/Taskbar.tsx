import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useSystem } from "../store/system";
import { useDesktop } from "../store/desktop";
import { BevelButton } from "./BevelButton";
import { Clock } from "./Clock";
import { StartMenu } from "./StartMenu";

/**
 * Bottom taskbar: Start button (not interactive yet) + one button per open
 * window. Clicking a task focuses it, or restores it if minimized.
 */
export function Taskbar() {
  const { order, windows, focusedId, open, focus, setStatus } = useDesktop(
    useShallow((s) => ({
      order: s.order,
      windows: s.windows,
      focusedId: s.focusedId,
      open: s.open,
      focus: s.focus,
      setStatus: s.setStatus,
    })),
  );

  const connected = useSystem((s) => s.network === "connected");
  const [startOpen, setStartOpen] = useState(false);

  const handleTaskClick = (id: string) => {
    const win = windows[id];
    if (!win) return;
    if (win.status === "minimized") setStatus(id, "normal");
    focus(id);
  };

  // Double-clicking the tray globe shows the Dial-Up window. `open` is a
  // singleton for "dialup", so this focuses the existing window if open.
  const handleTrayOpen = () => open({ appType: "dialup", title: "Dial-Up" });

  return (
    <div className="bevel-out relative flex h-9 items-center gap-1 bg-win-face px-1">
      {/* Click-away layer: any click on the desktop closes the Start menu. */}
      {startOpen && (
        <div className="fixed inset-0" onClick={() => setStartOpen(false)} />
      )}

      {startOpen && <StartMenu onClose={() => setStartOpen(false)} />}

      <BevelButton
        held={startOpen}
        onPress={() => setStartOpen((open) => !open)}
        className="flex h-7 items-center gap-1 px-2 text-sm font-bold text-black"
      >
        <span className="text-base">🪟</span>
        Start
      </BevelButton>

      <div className="mx-1 h-6 w-px bg-win-shadow" />

      <div className="flex flex-1 items-center gap-1 overflow-hidden">
        {order.map((id) => {
          const win = windows[id];
          if (!win) return null;
          const active = focusedId === id && win.status !== "minimized";
          return (
            <BevelButton
              key={id}
              held={active}
              onPress={() => handleTaskClick(id)}
              className={`flex h-7 w-40 items-center truncate px-2 text-left text-sm text-black ${
                active ? "font-bold" : ""
              }`}
            >
              {win.title}
            </BevelButton>
          );
        })}
      </div>

      {connected && (
        <button
          type="button"
          onDoubleClick={handleTrayOpen}
          className="px-1 text-base"
          title="Connected to the internet"
          aria-label="Connected to the internet"
        >
          🌐
        </button>
      )}

      <div className="mx-1 h-6 w-px bg-win-shadow" />

      <Clock />
    </div>
  );
}

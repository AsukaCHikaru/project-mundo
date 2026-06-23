import { useState } from "react";
import { useDesktop } from "../store/desktop";
import { useSystem } from "../store/system";

/**
 * Taskbar tray icon for the internet connection. Shown only while connected;
 * hovering reveals a win9x tooltip with the current speed, and double-clicking
 * opens the Dial-Up window (a singleton, so it focuses an existing one).
 */
export function NetworkTray() {
  const network = useSystem((s) => s.network);
  const open = useDesktop((s) => s.open);
  const [hovered, setHovered] = useState(false);

  if (network.state !== "connected") return null;

  const tooltip = `Connected — ${network.speed} KB/sec`;

  return (
    <div
      className="relative flex items-center"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        type="button"
        onDoubleClick={() => open({ appType: "dialup", title: "Dial-Up" })}
        className="px-1 text-base"
        aria-label={tooltip}
      >
        🌐
      </button>
      {hovered && (
        <div className="pointer-events-none absolute bottom-full right-0 mb-1 whitespace-nowrap border border-black bg-[#ffffe1] px-1.5 py-0.5 text-xs text-black">
          {tooltip}
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { permissionName } from "../lib/permission";
import { useDesktop } from "../store/desktop";
import { useSystem } from "../store/system";

/**
 * Taskbar tray icon for the player's permission level. Hovering reveals a win9x
 * tooltip with the current access level; double-clicking opens the Access Level
 * info window (a singleton, so it focuses an existing one).
 */
export function PermissionTray() {
  const permission = useSystem((s) => s.permission);
  const open = useDesktop((s) => s.open);
  const [hovered, setHovered] = useState(false);

  const tooltip = `Access Level: ${permissionName(permission)}`;

  return (
    <div
      className="relative flex items-center"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        type="button"
        onDoubleClick={() =>
          open({ appType: "permissions", title: "Access Level", minimizable: false })
        }
        className="px-1 text-base"
        aria-label={tooltip}
      >
        🔑
      </button>
      {hovered && (
        <div className="pointer-events-none absolute bottom-full right-0 mb-1 whitespace-nowrap border border-black bg-[#ffffe1] px-1.5 py-0.5 text-xs text-black">
          {tooltip}
        </div>
      )}
    </div>
  );
}

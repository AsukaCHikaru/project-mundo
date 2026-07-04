import { permissionName } from "../lib/permission";
import { useSystem } from "../store/system";

/**
 * `appType: "permissions"` window content — a simple info box showing the
 * player's current access level. Opened from the taskbar permission tray.
 */
export function Permissions() {
  const permission = useSystem((s) => s.permission);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
      <div className="text-4xl">🔑</div>
      <div>
        Access Level: <strong>{permissionName(permission)}</strong>
      </div>
      <div className="text-xs text-win-shadow">Property of Mundo Corporation</div>
    </div>
  );
}

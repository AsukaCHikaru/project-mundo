import { useShallow } from "zustand/react/shallow";
import { NETWORK } from "../content/network";
import { hasPermission, Permission } from "../lib/permission";
import { useSystem } from "../store/system";
import { BevelButton } from "./BevelButton";

/**
 * Dev-only controls rendered outside the desktop area. Lets us flip game state
 * by hand while building, without walking through the in-world flow. Gated by
 * `IS_DEV` at the call site, so it never ships in the built game. Add more
 * shortcuts here as the puzzle layer grows.
 */
export function DevToolbar() {
  const { network, connect, disconnect, permission, setPermission } = useSystem(
    useShallow((s) => ({
      network: s.network,
      connect: s.connect,
      disconnect: s.disconnect,
      permission: s.permission,
      setPermission: s.setPermission,
    })),
  );

  const connected = network.state === "connected";
  const admin = hasPermission(permission, Permission.ADMIN);

  /** One dial-up toggle per account, `held` when connected at its speed. */
  const dialUpButton = (label: string, speed: number) => {
    const active = connected && network.speed === speed;
    return (
      <BevelButton
        held={active}
        onPress={active ? disconnect : () => connect(speed)}
        className="px-2 py-0.5 text-black"
      >
        🌐 {label}: {active ? "on" : "off"}
      </BevelButton>
    );
  };

  return (
    <div className="flex items-center gap-2 p-2 font-win text-xs text-white">
      <span className="opacity-70">dev</span>
      {dialUpButton("Dial-Up", NETWORK.account.speed)}
      {dialUpButton("Fast Dial-Up", NETWORK.fastAccount.speed)}
      <BevelButton
        held={admin}
        onPress={() => setPermission(admin ? Permission.USER : Permission.ADMIN)}
        className="px-2 py-0.5 text-black"
      >
        🔑 Admin: {admin ? "on" : "off"}
      </BevelButton>
    </div>
  );
}

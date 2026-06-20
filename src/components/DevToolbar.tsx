import { useShallow } from "zustand/react/shallow";
import { useSystem } from "../store/system";
import { BevelButton } from "./BevelButton";

/**
 * Dev-only controls rendered outside the desktop area. Lets us flip game state
 * by hand while building, without walking through the in-world flow. Gated by
 * `IS_DEV` at the call site, so it never ships in the built game. Add more
 * shortcuts here as the puzzle layer grows.
 */
export function DevToolbar() {
  const { network, connect, disconnect } = useSystem(
    useShallow((s) => ({
      network: s.network,
      connect: s.connect,
      disconnect: s.disconnect,
    })),
  );

  const connected = network === "connected";

  return (
    <div className="flex items-center gap-2 p-2 font-win text-xs text-white">
      <span className="opacity-70">dev</span>
      <BevelButton
        held={connected}
        onPress={connected ? disconnect : connect}
        className="px-2 py-0.5 text-black"
      >
        🌐 Dial-Up: {connected ? "on" : "off"}
      </BevelButton>
    </div>
  );
}

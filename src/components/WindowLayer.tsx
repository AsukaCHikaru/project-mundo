import { type WindowState } from "../store/desktop";
import { Window } from "./Window";

interface WindowLayerProps {
  windows: Record<string, WindowState>;
  order: string[];
}

/**
 * Owns window stacking. Renders windows in `order` (back to front), so DOM
 * paint order alone determines which window sits on top — no per-window
 * z-index needed. Bringing a window forward is just moving its id later in
 * `order`, which this re-renders into a later DOM position.
 */
export function WindowLayer({ windows, order }: WindowLayerProps) {
  return (
    <>
      {order.map((id) => {
        const window = windows[id];
        if (!window) return null;
        return <Window key={id} window={window} />;
      })}
    </>
  );
}
